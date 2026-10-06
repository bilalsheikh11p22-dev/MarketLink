import Farmer from '../models/Farmer.js'
import Product from '../models/Product.js'
import Order from '../models/Order.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { success } from '../utils/ApiResponse.js'
import { parsePaging, pageMeta } from '../utils/pagination.js'
import { demandForecast, weekdayPattern } from '../services/forecast.js'
import { wasteAlerts } from '../services/waste.js'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const listFarmers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query, { defaultLimit: 50 })
  const filter = { verificationStatus: 'approved' }
  if (req.query.market) filter.market = req.query.market
  const [farmers, total] = await Promise.all([
    Farmer.find(filter).select('-pickupSlots').populate('user', 'name avatar').populate('market', 'name location').skip(skip).limit(limit),
    Farmer.countDocuments(filter)
  ])
  success(res, { farmers, pagination: pageMeta(page, limit, total) })
})
export const getFarmer = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findById(req.params.id).select('-pickupSlots').populate('user', 'name avatar').populate('market', 'name location address lat lng')
  if (!farmer || farmer.verificationStatus !== 'approved') throw new ApiError(404, 'Farmer not found')
  success(res, { farmer })
})
export const getFarmerProducts = asyncHandler(async (req, res) => {
  success(res, { products: await Product.find({ farmer: req.params.id, isActive: true, status: 'published' }).populate('market', 'name') })
})

async function me(req) {
  const farmer = await Farmer.findOne({ user: req.user._id })
  if (!farmer) throw new ApiError(404, 'Farmer profile not found')
  return farmer
}

export const farmerDashboard = asyncHandler(async (req, res) => {
  const farmer = await me(req)
  const products = await Product.find({ farmer: farmer._id, isActive: true })
  const orders = await Order.find({ farmer: farmer._id }).sort({ createdAt: -1 }).limit(50)
  const sales = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0)
  success(res, { farmer, stats: { productCount: products.length, orderCount: orders.length, sales: Math.round(sales * 100) / 100, lowStock: products.filter((p) => p.stock <= p.lowStockThreshold).length }, recentOrders: orders.slice(0, 10), products: products.slice(0, 20) })
})

export const updateMyProfile = asyncHandler(async (req, res) => {
  const farmer = await me(req)
  for (const f of ['businessName', 'description', 'phone', 'location', 'profileImage', 'farmImage', 'categories', 'market']) if (req.body[f] !== undefined) farmer[f] = req.body[f]
  await farmer.save()
  success(res, { farmer }, 'Profile updated')
})

export const getMyProducts = asyncHandler(async (req, res) => {
  const farmer = await me(req)
  const { page, limit, skip } = parsePaging(req.query, { defaultLimit: 50 })
  const filter = { farmer: farmer._id, isActive: true }
  const [items, total] = await Promise.all([Product.find(filter).populate('market', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit), Product.countDocuments(filter)])
  success(res, { items, pagination: pageMeta(page, limit, total) })
})

// ---- Pickup slots ----
export const getMySlots = asyncHandler(async (req, res) => success(res, { slots: (await me(req)).pickupSlots }))
export const setMySlots = asyncHandler(async (req, res) => {
  const farmer = await me(req)
  const slots = req.body.slots
  if (!Array.isArray(slots) || slots.length > 50) throw new ApiError(422, 'slots must be an array (max 50)')
  for (const s of slots) {
    if (!DAYS.includes(s.day) || !/^\d{2}:\d{2}$/.test(s.start || '') || !/^\d{2}:\d{2}$/.test(s.end || '') || s.start >= s.end) throw new ApiError(422, 'Each slot needs day, start < end (HH:mm)')
  }
  farmer.pickupSlots = slots.map((s) => ({ day: s.day, start: s.start, end: s.end, capacity: Number(s.capacity) || 5, active: s.active !== false }))
  await farmer.save()
  success(res, { slots: farmer.pickupSlots }, 'Pickup slots saved')
})
/** Public: slots with remaining capacity for a date. */
export const getSlotAvailability = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findById(req.params.id).select('pickupSlots businessName')
  if (!farmer) throw new ApiError(404, 'Farmer not found')
  const date = req.query.date
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) throw new ApiError(422, 'date (YYYY-MM-DD) is required')
  const day = DAYS[new Date(`${date}T00:00:00`).getDay()]
  const slots = farmer.pickupSlots.filter((s) => s.active && s.day === day)
  const out = []
  for (const s of slots) {
    const time = `${s.start}-${s.end}`
    const used = await Order.countDocuments({ farmer: farmer._id, pickupDate: date, pickupTime: time, status: { $ne: 'cancelled' } })
    out.push({ id: s._id, time, capacity: s.capacity, remaining: Math.max(0, s.capacity - used) })
  }
  success(res, { date, day, configured: farmer.pickupSlots.length > 0, slots: out })
})

// ---- Analytics / forecast / waste ----
export const myAnalytics = asyncHandler(async (req, res) => {
  const farmer = await me(req)
  const days = Math.min(365, Math.max(1, Number(req.query.days) || 30))
  const since = new Date(Date.now() - days * 86400000)
  const orders = await Order.find({ farmer: farmer._id, createdAt: { $gte: since } }).select('items total status createdAt').lean()
  const valid = orders.filter((o) => o.status !== 'cancelled')
  const daily = {}; const dailyCount = {}; const perProduct = {}
  for (const o of valid) {
    const d = new Date(o.createdAt).toISOString().slice(0, 10); daily[d] = (daily[d] || 0) + o.total; dailyCount[d] = (dailyCount[d] || 0) + 1
    for (const it of o.items) { if (String(it.farmer) !== String(farmer._id)) continue; perProduct[it.name] = perProduct[it.name] || { units: 0, revenue: 0 }; perProduct[it.name].units += it.quantity; perProduct[it.name].revenue += it.subtotal }
  }
  const byStatus = orders.reduce((a, o) => { a[o.status] = (a[o.status] || 0) + 1; return a }, {})
  const products = await Product.find({ farmer: farmer._id, isActive: true }).select('name stock unit lowStockThreshold unitsSold').lean()
  success(res, {
    range: { days, from: since.toISOString() },
    totals: { orders: orders.length, completed: byStatus.completed || 0, cancelled: byStatus.cancelled || 0, revenue: Math.round(valid.reduce((s, o) => s + o.total, 0) * 100) / 100 },
    byStatus, salesByDay: Object.entries(daily).sort().map(([date, amount]) => ({ date, amount: Math.round(amount * 100) / 100, orders: dailyCount[date] })),
    topProducts: Object.entries(perProduct).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 8).map(([name, v]) => ({ name, units: v.units, revenue: Math.round(v.revenue * 100) / 100 })),
    inventory: { total: products.length, outOfStock: products.filter((p) => p.stock <= 0).length, lowStock: products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length },
    weekdayPattern: await weekdayPattern({ farmerId: farmer._id })
  })
})
export const myForecast = asyncHandler(async (req, res) => success(res, await demandForecast({ farmerId: (await me(req))._id, weeks: Math.min(26, Number(req.query.weeks) || 8) })))
export const myWaste = asyncHandler(async (req, res) => {
  const farmer = await me(req)
  const alerts = await wasteAlerts({ farmerId: farmer._id })
  const orders = await Order.find({ farmer: farmer._id, status: { $ne: 'cancelled' } }).select('items').lean()
  let discountedUnits = 0, discountedRevenue = 0
  for (const o of orders) for (const it of o.items) if (it.discountPercent > 0) { discountedUnits += it.quantity; discountedRevenue += it.subtotal }
  success(res, { ...alerts, analytics: { alertCount: alerts.alerts.length, unitsSoldOnPromotion: discountedUnits, revenueFromPromotions: Math.round(discountedRevenue * 100) / 100, definition: 'Units sold while a farmer-set discount was active on the product.' } })
})
