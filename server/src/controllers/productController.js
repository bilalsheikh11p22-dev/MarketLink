import Product, { computeAvailability } from '../models/Product.js'
import Farmer from '../models/Farmer.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { success } from '../utils/ApiResponse.js'
import { parsePaging, pageMeta } from '../utils/pagination.js'
import { restockAlerts } from './orderController.js'
import { haversineKm, isValidCoord } from '../services/geo.js'
import { audit } from '../services/audit.js'
import { escapeRegex } from '../middleware/sanitize.js'

const SORTS = {
  newest: { createdAt: -1 }, price_asc: { price: 1 }, price_desc: { price: -1 },
  rating: { rating: -1 }, popular: { unitsSold: -1 }, name: { name: 1 }
}
const EDITABLE = ['name', 'description', 'category', 'price', 'unit', 'images', 'stock', 'lowStockThreshold', 'discountPercent', 'market']

export const listProducts = asyncHandler(async (req, res) => {
  const { search, category, market, farmer, availability, minPrice, maxPrice, sort = 'newest', inStock } = req.query
  const { page, limit, skip } = parsePaging(req.query)
  const filter = { isActive: true, status: 'published' }
  if (category) filter.category = category
  if (market) filter.market = market
  if (farmer) filter.farmer = farmer
  if (availability) filter.availability = availability
  if (inStock === 'true') filter.stock = { $gt: 0 }
  if (minPrice || maxPrice) {
    filter.price = {}
    if (minPrice !== undefined && minPrice !== '') filter.price.$gte = Number(minPrice)
    if (maxPrice !== undefined && maxPrice !== '') filter.price.$lte = Number(maxPrice)
  }
  if (search) {
    // Regex search over name/category/description: portable across MongoDB-compatible servers.
    const terms = String(search).slice(0, 100).split(/\s+/).filter(Boolean).slice(0, 5).map(escapeRegex)
    filter.$and = terms.map((t) => ({ $or: [{ name: { $regex: t, $options: 'i' } }, { category: { $regex: t, $options: 'i' } }, { description: { $regex: t, $options: 'i' } }] }))
  }
  const order = SORTS[sort] || SORTS.newest
  const proj = undefined
  const [items, total] = await Promise.all([
    Product.find(filter, proj).populate('farmer', 'businessName rating profileImage').populate('market', 'name location lat lng')
      .sort(order).skip(skip).limit(limit),
    Product.countDocuments(filter)
  ])
  success(res, { items, pagination: pageMeta(page, limit, total) })
})

export const listCategories = asyncHandler(async (req, res) => {
  const rows = await Product.aggregate([
    { $match: { isActive: true, status: 'published' } },
    { $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }
  ])
  success(res, { categories: rows.map((r) => ({ name: r._id, count: r.count })) })
})

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('farmer', 'businessName rating profileImage farmImage location phone').populate('market', 'name location address lat lng')
  if (!product || !product.isActive) throw new ApiError(404, 'Product not found')
  const related = await Product.find({ _id: { $ne: product._id }, category: product.category, isActive: true, status: 'published' }).limit(4).select('name price unit images rating stock')
  success(res, { product, related })
})

async function resolveOwnFarmer(req) {
  const farmer = await Farmer.findOne({ user: req.user._id })
  if (!farmer && req.user.role !== 'admin') throw new ApiError(403, 'Farmer profile required')
  return farmer
}
function pickEditable(body) {
  const out = {}
  for (const f of EDITABLE) if (body[f] !== undefined) out[f] = body[f]
  if (out.images && (!Array.isArray(out.images) || out.images.some((i) => typeof i !== 'string' || i.length > 500))) throw new ApiError(422, 'images must be an array of path strings')
  for (const n of ['price', 'stock', 'lowStockThreshold', 'discountPercent']) if (out[n] !== undefined) { out[n] = Number(out[n]); if (!Number.isFinite(out[n]) || out[n] < 0) throw new ApiError(422, `${n} must be a non-negative number`) }
  if (out.discountPercent > 90) throw new ApiError(422, 'discountPercent cannot exceed 90')
  return out
}

export const createProduct = asyncHandler(async (req, res) => {
  const farmer = await resolveOwnFarmer(req)
  const farmerId = req.user.role === 'admin' && req.body.farmer ? req.body.farmer : farmer?._id
  if (!farmerId) throw new ApiError(400, 'Farmer is required')
  const data = pickEditable(req.body)
  if (!data.name || data.price === undefined) throw new ApiError(422, 'name and price are required')
  const product = new Product({ ...data, farmer: farmerId, market: data.market || farmer?.market })
  product.availability = computeAvailability(product.stock, product.lowStockThreshold)
  await product.save()
  success(res, { product }, 'Product created', 201)
})

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) throw new ApiError(404, 'Product not found')
  if (req.user.role !== 'admin') {
    const farmer = await resolveOwnFarmer(req)
    if (product.farmer.toString() !== farmer._id.toString()) throw new ApiError(403, 'Not your product')
  }
  const wasOut = product.stock <= 0
  const data = pickEditable(req.body)
  Object.assign(product, data)
  if (req.user.role === 'admin') {
    if (req.body.status) product.status = req.body.status
    if (req.body.isActive !== undefined) product.isActive = !!req.body.isActive
  }
  await product.save()
  if (wasOut && product.stock > 0) restockAlerts(product)
  if (req.user.role === 'admin') await audit(req, 'product.update', 'Product', product._id, Object.keys(data))
  success(res, { product }, 'Product updated')
})

/** Quick inventory adjustment: set absolute stock or add a delta. */
export const adjustStock = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) throw new ApiError(404, 'Product not found')
  if (req.user.role !== 'admin') {
    const farmer = await resolveOwnFarmer(req)
    if (product.farmer.toString() !== farmer._id.toString()) throw new ApiError(403, 'Not your product')
  }
  const wasOut = product.stock <= 0
  if (req.body.stock !== undefined) product.stock = Number(req.body.stock)
  else if (req.body.delta !== undefined) product.stock = product.stock + Number(req.body.delta)
  else throw new ApiError(422, 'Provide stock or delta')
  if (!Number.isFinite(product.stock) || product.stock < 0) throw new ApiError(422, 'Resulting stock cannot be negative')
  await product.save()
  if (wasOut && product.stock > 0) restockAlerts(product)
  success(res, { product }, 'Stock updated')
})

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) throw new ApiError(404, 'Product not found')
  if (req.user.role !== 'admin') {
    const farmer = await resolveOwnFarmer(req)
    if (product.farmer.toString() !== farmer._id.toString()) throw new ApiError(403, 'Not your product')
  }
  product.isActive = false; product.status = 'hidden'; await product.save()
  if (req.user.role === 'admin') await audit(req, 'product.delete', 'Product', product._id)
  success(res, null, 'Product removed')
})

/** Nearby products: products at markets within radius of caller-supplied coordinates. */
export const nearbyProducts = asyncHandler(async (req, res) => {
  const lat = Number(req.query.lat), lng = Number(req.query.lng), radius = Number(req.query.radius) || 5
  if (!isValidCoord(lat, lng)) throw new ApiError(422, 'lat and lng are required')
  const products = await Product.find({ isActive: true, status: 'published', stock: { $gt: 0 } }).populate('market', 'name lat lng location').limit(500)
  const items = products.map((p) => ({ p, d: p.market?.lat != null ? haversineKm(lat, lng, p.market.lat, p.market.lng) : null }))
    .filter((x) => x.d !== null && x.d <= radius).sort((a, b) => a.d - b.d).slice(0, 50)
    .map((x) => ({ ...x.p.toJSON(), distanceKm: x.d }))
  success(res, { items, radiusKm: radius })
})
