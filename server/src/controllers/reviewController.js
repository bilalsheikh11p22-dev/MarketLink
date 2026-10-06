import Review from '../models/Review.js'
import Product from '../models/Product.js'
import Farmer from '../models/Farmer.js'
import Order from '../models/Order.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { success } from '../utils/ApiResponse.js'
import { parsePaging, pageMeta } from '../utils/pagination.js'
import { notify } from '../services/notify.js'
import { audit } from '../services/audit.js'

/** Transparent heuristic spam checks. Flagged reviews go to "pending" for admin moderation (never silently deleted). */
export function spamCheck(text = '') {
  const reasons = []
  if (/https?:\/\/|www\./i.test(text)) reasons.push('contains a link')
  if (/(.)\1{6,}/.test(text)) reasons.push('repeated characters')
  const letters = text.replace(/[^A-Za-z]/g, '')
  if (letters.length > 15 && letters.replace(/[^A-Z]/g, '').length / letters.length > 0.7) reasons.push('mostly capital letters')
  if (/(buy now|click here|free money|whatsapp me|\bcasino\b)/i.test(text)) reasons.push('promotional wording')
  return { score: reasons.length, reasons }
}

async function recompute(productId, farmerId) {
  if (productId) {
    const rs = await Review.find({ product: productId, status: 'published' }).select('rating')
    const avg = rs.length ? rs.reduce((s, r) => s + r.rating, 0) / rs.length : 0
    await Product.findByIdAndUpdate(productId, { rating: Math.round(avg * 10) / 10, reviewCount: rs.length })
  }
  if (farmerId) {
    const rs = await Review.find({ farmer: farmerId, status: 'published' }).select('rating')
    const avg = rs.length ? rs.reduce((s, r) => s + r.rating, 0) / rs.length : 0
    await Farmer.findByIdAndUpdate(farmerId, { rating: Math.round(avg * 10) / 10 })
  }
}

export const createReview = asyncHandler(async (req, res) => {
  if (req.user.role !== 'customer') throw new ApiError(403, 'Only customers can write reviews')
  const { productId, farmerId, comment = '' } = req.body
  const title = String(req.body.title || '').slice(0, 80)
  const rating = Number(req.body.rating)
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new ApiError(422, 'Rating must be a whole number 1-5')
  if (!productId && !farmerId) throw new ApiError(422, 'productId or farmerId required')
  let fId = farmerId
  if (productId) {
    const p = await Product.findById(productId).select('farmer')
    if (!p) throw new ApiError(404, 'Product not found')
    fId = p.farmer
  }
  // Verified purchase is computed server-side from a COMPLETED order owned by this user. Clients cannot set it.
  const match = { customer: req.user._id, status: 'completed' }
  if (productId) match['items.product'] = productId; else match.farmer = farmerId
  const purchase = await Order.findOne(match).select('_id')
  if (productId && await Review.exists({ user: req.user._id, product: productId })) throw new ApiError(409, 'You have already reviewed this product')
  const spam = spamCheck(`${title} ${comment}`)
  try {
    const review = await Review.create({
      user: req.user._id, product: productId || undefined, farmer: fId || undefined, order: purchase?._id,
      rating, title, comment: String(comment).slice(0, 1500), verifiedPurchase: !!purchase,
      status: spam.score >= 1 ? 'pending' : 'published', spamScore: spam.score, spamReasons: spam.reasons
    })
    await recompute(productId, fId)
    if (fId) Farmer.findById(fId).then((f) => f && notify(f.user, { title: 'New review', message: `A customer left a ${rating}-star review.`, type: 'review', link: '/farmer/reviews' }))
    success(res, { review, flagged: spam.score >= 1 }, spam.score ? 'Review submitted and awaiting moderation' : 'Review submitted', 201)
  } catch (e) {
    if (e.code === 11000) throw new ApiError(409, 'You have already reviewed this product')
    throw e
  }
})

export const listProductReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query)
  const filter = { product: req.params.id, status: 'published' }
  const [reviews, total, dist] = await Promise.all([
    Review.find(filter).populate('user', 'name avatar').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Review.countDocuments(filter),
    Review.aggregate([{ $match: { product: new (await import('mongoose')).default.Types.ObjectId(req.params.id), status: 'published' } }, { $group: { _id: '$rating', n: { $sum: 1 } } }])
  ])
  success(res, { reviews, pagination: pageMeta(page, limit, total), breakdown: Object.fromEntries([1, 2, 3, 4, 5].map((r) => [r, dist.find((d) => d._id === r)?.n || 0])) })
})

export const listFarmerReviews = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findOne({ user: req.user._id })
  if (!farmer) throw new ApiError(404, 'Farmer profile not found')
  const reviews = await Review.find({ farmer: farmer._id, status: 'published' }).populate('user', 'name avatar').populate('product', 'name').sort({ createdAt: -1 }).limit(100)
  const avg = reviews.length ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : 0
  success(res, { reviews, summary: { count: reviews.length, average: avg, verified: reviews.filter((r) => r.verifiedPurchase).length, replied: reviews.filter((r) => r.farmerReply?.text).length } })
})

export const replyToReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
  if (!review) throw new ApiError(404, 'Review not found')
  const farmer = await Farmer.findOne({ user: req.user._id })
  if (!farmer || String(review.farmer) !== String(farmer._id)) throw new ApiError(403, 'Not a review of your farm')
  const text = String(req.body.text || '').trim()
  if (!text || text.length > 800) throw new ApiError(422, 'Reply must be 1-800 characters')
  review.farmerReply = { text, at: new Date() }
  await review.save()
  notify(review.user, { title: 'Farmer replied to your review', message: text.slice(0, 120), type: 'review', link: review.product ? `/products/${review.product}` : '/reviews' })
  success(res, { review }, 'Reply saved')
})

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
  if (!review) throw new ApiError(404, 'Review not found')
  if (req.user.role !== 'admin' && review.user.toString() !== req.user._id.toString()) throw new ApiError(403, 'Not your review')
  await review.deleteOne()
  await recompute(review.product, review.farmer)
  if (req.user.role === 'admin') await audit(req, 'review.delete', 'Review', review._id)
  success(res, null, 'Review deleted')
})

// ---- Admin moderation ----
export const adminListReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query)
  const filter = {}
  if (req.query.status) filter.status = req.query.status
  if (req.query.flagged === 'true') filter.spamScore = { $gt: 0 }
  const [reviews, total, stats] = await Promise.all([
    Review.find(filter).populate('user', 'name email').populate('product', 'name').populate('farmer', 'businessName').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Review.countDocuments(filter),
    Review.aggregate([{ $group: { _id: '$status', n: { $sum: 1 }, total: { $sum: '$rating' } } }])
  ])
  success(res, { reviews, pagination: pageMeta(page, limit, total), analytics: { byStatus: stats.map((s) => ({ status: s._id, count: s.n, averageRating: s.n ? Math.round((s.total / s.n) * 10) / 10 : 0 })) } })
})
export const adminModerateReview = asyncHandler(async (req, res) => {
  const status = req.body.status
  if (!['published', 'hidden', 'pending'].includes(status)) throw new ApiError(422, 'Invalid status')
  const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true })
  if (!review) throw new ApiError(404, 'Review not found')
  await recompute(review.product, review.farmer)
  await audit(req, 'review.moderate', 'Review', review._id, { status })
  success(res, { review }, 'Review updated')
})

// ---- Own reviews, edit, public farmer reviews, reply removal ----
export const listMyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ user: req.user._id }).populate('product', 'name images').sort({ createdAt: -1 }).limit(100)
  success(res, { reviews })
})
export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
  if (!review) throw new ApiError(404, 'Review not found')
  if (review.user.toString() !== req.user._id.toString()) throw new ApiError(403, 'Not your review')
  if (req.body.rating !== undefined) {
    const r = Number(req.body.rating)
    if (!Number.isInteger(r) || r < 1 || r > 5) throw new ApiError(422, 'Rating must be a whole number 1-5')
    review.rating = r
  }
  if (req.body.title !== undefined) review.title = String(req.body.title).slice(0, 80)
  if (req.body.comment !== undefined) review.comment = String(req.body.comment).slice(0, 1500)
  const spam = spamCheck(`${review.title} ${review.comment}`)
  review.spamScore = spam.score; review.spamReasons = spam.reasons
  if (spam.score >= 1) review.status = 'pending'
  review.edited = true
  await review.save()
  await recompute(review.product, review.farmer)
  success(res, { review, flagged: spam.score >= 1 }, 'Review updated')
})
export const listFarmerReviewsPublic = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ farmer: req.params.id, status: 'published' }).populate('user', 'name avatar').populate('product', 'name').sort({ createdAt: -1 }).limit(100)
  success(res, { reviews })
})
export const deleteReply = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
  if (!review) throw new ApiError(404, 'Review not found')
  const farmer = await Farmer.findOne({ user: req.user._id })
  if (!farmer || String(review.farmer) !== String(farmer._id)) throw new ApiError(403, 'Not a review of your farm')
  review.farmerReply = undefined
  await review.save()
  success(res, { review }, 'Reply removed')
})
