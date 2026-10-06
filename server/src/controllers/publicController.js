import ContactMessage from '../models/ContactMessage.js'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import Favorite from '../models/Favorite.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { success } from '../utils/ApiResponse.js'

export const submitContact = asyncHandler(async (req, res) => {
  const { name, email, subject = '', message } = req.body
  if (!name || String(name).trim().length < 2) throw new ApiError(422, 'name is required')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '')) throw new ApiError(422, 'A valid email is required')
  if (!message || String(message).trim().length < 10) throw new ApiError(422, 'message must be at least 10 characters')
  await ContactMessage.create({ name: String(name).trim(), email, subject: String(subject).slice(0, 160), message: String(message).slice(0, 3000) })
  success(res, null, 'Thanks — your message has been received', 201)
})

/** Personalised insights built only from the signed-in customer's own orders/favourites. */
export const customerInsights = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.user._id, status: { $ne: 'cancelled' } }).select('items total createdAt').lean()
  const spend = orders.reduce((s, o) => s + o.total, 0)
  const productIds = [...new Set(orders.flatMap((o) => o.items.map((i) => String(i.product))))]
  const bought = await Product.find({ _id: { $in: productIds } }).select('category').lean()
  const catCount = {}
  for (const p of bought) catCount[p.category] = (catCount[p.category] || 0) + 1
  const favFarmers = (await Favorite.find({ user: req.user._id, targetType: 'farmer' }).select('target').lean()).map((f) => f.target)
  const topCats = Object.entries(catCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c]) => c)
  const filter = { isActive: true, status: 'published', stock: { $gt: 0 }, _id: { $nin: productIds } }
  filter.$or = [...(topCats.length ? [{ category: { $in: topCats } }] : []), ...(favFarmers.length ? [{ farmer: { $in: favFarmers } }] : [])]
  if (!filter.$or.length) delete filter.$or
  const recs = await Product.find(filter).populate('farmer', 'businessName').populate('market', 'name').sort({ rating: -1 }).limit(8)
  success(res, {
    stats: { orders: orders.length, totalSpent: Math.round(spend * 100) / 100, averageOrder: orders.length ? Math.round((spend / orders.length) * 100) / 100 : 0 },
    topCategories: topCats,
    recommendations: recs, basis: topCats.length || favFarmers.length ? 'Based on your past orders and favourite farmers.' : 'Showing top-rated products. Place an order or save favourites for personalised picks.'
  })
})
