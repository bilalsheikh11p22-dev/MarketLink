import Market from '../models/Market.js'
import Product from '../models/Product.js'
import Farmer from '../models/Farmer.js'
import Order from '../models/Order.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { success } from '../utils/ApiResponse.js'
import { parsePaging, pageMeta } from '../utils/pagination.js'
import { escapeRegex } from '../middleware/sanitize.js'
import { haversineKm, isValidCoord } from '../services/geo.js'
import { audit } from '../services/audit.js'
import { demandForecast } from '../services/forecast.js'

const FIELDS = ['name', 'description', 'location', 'address', 'image', 'gallery', 'openingTime', 'closingTime', 'operatingDays', 'contact', 'lat', 'lng', 'status', 'isActive']
const pick = (b) => Object.fromEntries(FIELDS.filter((f) => b[f] !== undefined).map((f) => [f, b[f]]))

export const listMarkets = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query, { defaultLimit: 50 })
  const filter = { isActive: true }
  if (req.query.search) filter.name = { $regex: escapeRegex(String(req.query.search).slice(0, 60)), $options: 'i' }
  const [markets, total] = await Promise.all([Market.find(filter).sort({ name: 1 }).skip(skip).limit(limit), Market.countDocuments(filter)])
  success(res, { markets, pagination: pageMeta(page, limit, total) })
})

/** Distance search using caller-supplied coordinates. Only markets that actually have coordinates are returned. */
export const nearbyMarkets = asyncHandler(async (req, res) => {
  const lat = Number(req.query.lat), lng = Number(req.query.lng)
  const radius = Math.min(100, Math.max(0.1, Number(req.query.radius) || 5))
  if (!isValidCoord(lat, lng)) throw new ApiError(422, 'lat and lng query parameters are required')
  const all = await Market.find({ isActive: true, lat: { $ne: null }, lng: { $ne: null } })
  const withDist = all.map((m) => ({ ...m.toJSON(), distanceKm: haversineKm(lat, lng, m.lat, m.lng) }))
  const markets = withDist.filter((m) => m.distanceKm <= radius).sort((a, b) => a.distanceKm - b.distanceKm)
  success(res, { markets, radiusKm: radius, searched: all.length, withoutCoordinates: await Market.countDocuments({ isActive: true, $or: [{ lat: null }, { lng: null }] }) })
})

export const getMarket = asyncHandler(async (req, res) => {
  const market = await Market.findById(req.params.id)
  if (!market) throw new ApiError(404, 'Market not found')
  success(res, { market })
})
export const marketFarmers = asyncHandler(async (req, res) => {
  const farmers = await Farmer.find({ market: req.params.id, verificationStatus: 'approved' }).populate('user', 'name avatar')
  success(res, { farmers })
})
export const marketProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query)
  const filter = { market: req.params.id, isActive: true, status: 'published' }
  const [items, total] = await Promise.all([Product.find(filter).populate('farmer', 'businessName profileImage').sort({ name: 1 }).skip(skip).limit(limit), Product.countDocuments(filter)])
  success(res, { items, pagination: pageMeta(page, limit, total) })
})
export const createMarket = asyncHandler(async (req, res) => {
  const data = pick(req.body)
  if (!data.name) throw new ApiError(422, 'name is required')
  const market = await Market.create(data)
  await audit(req, 'market.create', 'Market', market._id, { name: market.name })
  success(res, { market }, 'Market created', 201)
})
export const updateMarket = asyncHandler(async (req, res) => {
  const market = await Market.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true })
  if (!market) throw new ApiError(404, 'Market not found')
  await audit(req, 'market.update', 'Market', market._id, Object.keys(pick(req.body)))
  success(res, { market }, 'Market updated')
})
export const deleteMarket = asyncHandler(async (req, res) => {
  const market = await Market.findById(req.params.id)
  if (!market) throw new ApiError(404, 'Market not found')
  market.isActive = false; await market.save()
  await audit(req, 'market.deactivate', 'Market', market._id)
  success(res, null, 'Market deactivated')
})

/** Real aggregated numbers for one market over a date range (default last 30 days). */
export const marketAnalytics = asyncHandler(async (req, res) => {
  const market = await Market.findById(req.params.id)
  if (!market) throw new ApiError(404, 'Market not found')
  const days = Math.min(365, Math.max(1, Number(req.query.days) || 30))
  const since = new Date(Date.now() - days * 86400000)
  const [farmers, products, orders] = await Promise.all([
    Farmer.countDocuments({ market: market._id, verificationStatus: 'approved' }),
    Product.find({ market: market._id, isActive: true }).select('name stock unitsSold category').lean(),
    Order.find({ 'items.market': market._id, createdAt: { $gte: since }, status: { $ne: 'cancelled' } }).select('items createdAt').lean()
  ])
  let revenue = 0; const daily = {}; const perProduct = {}
  for (const o of orders) for (const it of o.items) {
    if (String(it.market) !== String(market._id)) continue
    revenue += it.subtotal
    const day = new Date(o.createdAt).toISOString().slice(0, 10)
    daily[day] = (daily[day] || 0) + it.subtotal
    perProduct[it.name] = (perProduct[it.name] || 0) + it.quantity
  }
  const forecast = await demandForecast({ marketId: String(market._id) })
  success(res, {
    market: { id: market._id, name: market.name },
    range: { days, from: since.toISOString(), to: new Date().toISOString() },
    stats: { activeFarmers: farmers, products: products.length, orders: orders.length, revenue: Math.round(revenue * 100) / 100, outOfStock: products.filter((p) => p.stock <= 0).length },
    salesByDay: Object.entries(daily).sort().map(([date, amount]) => ({ date, amount: Math.round(amount * 100) / 100 })),
    topProducts: Object.entries(perProduct).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, units]) => ({ name, units })),
    forecast: forecast.forecasts.slice(0, 8), forecastNote: forecast.disclaimer
  })
})
