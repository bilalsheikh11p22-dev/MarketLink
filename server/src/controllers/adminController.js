import User from '../models/User.js'
import Farmer from '../models/Farmer.js'
import Product from '../models/Product.js'
import Market from '../models/Market.js'
import Order from '../models/Order.js'
import Review from '../models/Review.js'
import AuditLog from '../models/AuditLog.js'
import ContactMessage from '../models/ContactMessage.js'
import Notification from '../models/Notification.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { success } from '../utils/ApiResponse.js'
import { parsePaging, pageMeta } from '../utils/pagination.js'
import { escapeRegex } from '../middleware/sanitize.js'
import { audit } from '../services/audit.js'
import { notify } from '../services/notify.js'
import { wasteAlerts } from '../services/waste.js'

const round2 = (n) => Math.round(n * 100) / 100
const rangeDays = (req, def = 30) => Math.min(365, Math.max(1, Number(req.query.days) || def))

export const dashboard = asyncHandler(async (req, res) => {
  const [users, farmers, pendingFarmers, markets, products, orders, pendingReviews] = await Promise.all([
    User.countDocuments(), Farmer.countDocuments({ verificationStatus: 'approved' }), Farmer.countDocuments({ verificationStatus: 'pending' }),
    Market.countDocuments({ isActive: true }), Product.countDocuments({ isActive: true }), Order.countDocuments(), Review.countDocuments({ status: 'pending' })
  ])
  const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(8).populate('customer', 'name')
  success(res, { stats: { users, farmers, pendingFarmers, markets, products, orders, pendingReviews }, recentOrders })
})

export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query)
  const filter = {}
  if (['customer', 'farmer', 'admin'].includes(req.query.role)) filter.role = req.query.role
  if (req.query.search) { const r = { $regex: escapeRegex(String(req.query.search).slice(0, 60)), $options: 'i' }; filter.$or = [{ name: r }, { email: r }] }
  const [users, total] = await Promise.all([User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit), User.countDocuments(filter)])
  success(res, { users, pagination: pageMeta(page, limit, total) })
})
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) throw new ApiError(404, 'User not found')
  const self = String(user._id) === String(req.user._id)
  if (self && (req.body.isActive === false || (req.body.role && req.body.role !== 'admin'))) throw new ApiError(400, 'You cannot deactivate or demote your own account')
  if (req.body.isActive !== undefined) user.isActive = !!req.body.isActive
  if (req.body.role) { if (!['customer', 'farmer', 'admin'].includes(req.body.role)) throw new ApiError(422, 'Invalid role'); user.role = req.body.role }
  await user.save()
  await audit(req, 'user.update', 'User', user._id, { isActive: user.isActive, role: user.role })
  success(res, { user: user.toSafeObject() }, 'User updated')
})

export const listFarmersAdmin = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query)
  const filter = {}
  if (req.query.status) filter.verificationStatus = req.query.status
  const [farmers, total] = await Promise.all([Farmer.find(filter).populate('user', 'name email').populate('market', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit), Farmer.countDocuments(filter)])
  success(res, { farmers, pagination: pageMeta(page, limit, total) })
})
export const updateFarmerStatus = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findById(req.params.id)
  if (!farmer) throw new ApiError(404, 'Farmer not found')
  const status = req.body.verificationStatus
  if (status) {
    if (!['pending', 'approved', 'rejected', 'suspended'].includes(status)) throw new ApiError(422, 'Invalid status')
    farmer.verificationStatus = status
    // Hide a suspended/rejected farmer's listings from the marketplace.
    if (['suspended', 'rejected'].includes(status)) await Product.updateMany({ farmer: farmer._id }, { status: 'hidden' })
    if (status === 'approved') await Product.updateMany({ farmer: farmer._id, status: 'hidden' }, { status: 'published' })
  }
  await farmer.save()
  await audit(req, 'farmer.status', 'Farmer', farmer._id, { status })
  if (status) notify(farmer.user, { title: 'Farmer account update', message: `Your farmer account is now ${status}.`, type: 'system', link: '/farmer' })
  success(res, { farmer }, 'Farmer updated')
})

export const listProductsAdmin = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query)
  const filter = {}
  if (req.query.status) filter.status = req.query.status
  if (req.query.search) filter.name = { $regex: escapeRegex(String(req.query.search).slice(0, 60)), $options: 'i' }
  const [items, total] = await Promise.all([Product.find(filter).populate('farmer', 'businessName').populate('market', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit), Product.countDocuments(filter)])
  success(res, { items, pagination: pageMeta(page, limit, total) })
})
export const listOrdersAdmin = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query)
  const filter = {}
  if (req.query.status) filter.status = req.query.status
  const [orders, total] = await Promise.all([Order.find(filter).populate('customer', 'name email').populate('farmer', 'businessName').sort({ createdAt: -1 }).skip(skip).limit(limit), Order.countDocuments(filter)])
  success(res, { orders, pagination: pageMeta(page, limit, total) })
})

export const analytics = asyncHandler(async (req, res) => {
  const days = rangeDays(req)
  const since = new Date(Date.now() - days * 86400000)
  const [orders, newUsers, topFarmersRaw, markets] = await Promise.all([
    Order.find({ createdAt: { $gte: since } }).select('items total status createdAt').lean(),
    User.find({ createdAt: { $gte: since } }).select('role createdAt').lean(),
    Order.aggregate([{ $match: { createdAt: { $gte: since }, status: { $ne: 'cancelled' } } }, { $group: { _id: '$farmer', revenue: { $sum: '$total' }, orders: { $sum: 1 } } }, { $sort: { revenue: -1 } }, { $limit: 5 }]),
    Market.find({ isActive: true }).select('name').lean()
  ])
  const valid = orders.filter((o) => o.status !== 'cancelled')
  const daily = {}, perProduct = {}, perMarket = {}
  for (const o of valid) {
    const d = new Date(o.createdAt).toISOString().slice(0, 10)
    daily[d] = daily[d] || { orders: 0, revenue: 0 }; daily[d].orders++; daily[d].revenue += o.total
    for (const it of o.items) { perProduct[it.name] = (perProduct[it.name] || 0) + it.quantity; perMarket[String(it.market)] = (perMarket[String(it.market)] || 0) + it.subtotal }
  }
  const farmerDocs = await Farmer.find({ _id: { $in: topFarmersRaw.map((f) => f._id) } }).select('businessName').lean()
  const status = orders.reduce((a, o) => { a[o.status] = (a[o.status] || 0) + 1; return a }, {})
  success(res, {
    range: { days, from: since.toISOString(), to: new Date().toISOString() },
    totals: { orders: orders.length, revenue: round2(valid.reduce((s, o) => s + o.total, 0)), newUsers: newUsers.length, newCustomers: newUsers.filter((u) => u.role === 'customer').length, newFarmers: newUsers.filter((u) => u.role === 'farmer').length, cancellationRate: orders.length ? round2((status.cancelled || 0) / orders.length * 100) : 0 },
    ordersByStatus: status,
    trend: Object.entries(daily).sort().map(([date, v]) => ({ date, orders: v.orders, revenue: round2(v.revenue) })),
    topProducts: Object.entries(perProduct).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, units]) => ({ name, units })),
    topFarmers: topFarmersRaw.map((f) => ({ farmerId: f._id, name: farmerDocs.find((d) => String(d._id) === String(f._id))?.businessName || 'Unknown', revenue: round2(f.revenue), orders: f.orders })),
    marketPerformance: markets.map((m) => ({ marketId: m._id, name: m.name, revenue: round2(perMarket[String(m._id)] || 0) })).sort((a, b) => b.revenue - a.revenue)
  })
})

/** Impact dashboard: ONLY metrics that can be computed from stored data. No environmental estimates. */
export const impact = asyncHandler(async (req, res) => {
  const days = rangeDays(req, 90)
  const since = new Date(Date.now() - days * 86400000)
  const orders = await Order.find({ createdAt: { $gte: since } }).select('items status farmer customer').lean()
  const valid = orders.filter((o) => o.status !== 'cancelled')
  let promoUnits = 0, promoRevenue = 0, units = 0
  for (const o of valid) for (const it of o.items) { units += it.quantity; if (it.discountPercent > 0) { promoUnits += it.quantity; promoRevenue += it.subtotal } }
  const alerts = await wasteAlerts()
  success(res, {
    range: { days, from: since.toISOString() },
    metrics: {
      ordersCompleted: orders.filter((o) => o.status === 'completed').length,
      ordersCancelled: orders.filter((o) => o.status === 'cancelled').length,
      unitsOrdered: units, unitsSoldOnPromotion: promoUnits, revenueFromPromotions: round2(promoRevenue),
      promotionShareOfUnits: units ? round2(promoUnits / units * 100) : 0,
      productsCurrentlyAtRisk: alerts.alerts.length,
      activeFarmersSelling: new Set(valid.map((o) => String(o.farmer))).size,
      customersServed: new Set(valid.map((o) => String(o.customer))).size
    },
    atRisk: alerts.alerts.slice(0, 10),
    definitions: {
      unitsSoldOnPromotion: 'Units sold while a farmer-set discount was active (a proxy for stock that might otherwise have gone unsold).',
      productsCurrentlyAtRisk: 'Products flagged right now by the explicit waste rules (excess, low demand, no recent sales, market closing soon).',
      note: 'MarketLink does not estimate food-waste weight or CO2 savings because it does not collect the data needed to calculate them.'
    }
  })
})

export const auditLogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query, { defaultLimit: 30 })
  const filter = {}
  if (req.query.action) filter.action = { $regex: `^${escapeRegex(String(req.query.action).slice(0, 40))}` }
  const [logs, total] = await Promise.all([AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit), AuditLog.countDocuments(filter)])
  success(res, { logs, pagination: pageMeta(page, limit, total) })
})

const csvCell = (v) => { let s = v == null ? '' : String(v); if (/^[=+\-@]/.test(s)) s = `'${s}`; return `"${s.replace(/"/g, '""')}"` }
export const exportReport = asyncHandler(async (req, res) => {
  const type = req.params.type
  let header, rows
  if (type === 'orders') {
    const o = await Order.find().populate('customer', 'name').populate('farmer', 'businessName').sort({ createdAt: -1 }).limit(5000).lean()
    header = ['orderNumber', 'createdAt', 'customer', 'farmer', 'status', 'total', 'pickupDate', 'pickupTime']
    rows = o.map((x) => [x.orderNumber, x.createdAt?.toISOString(), x.customer?.name, x.farmer?.businessName, x.status, x.total, x.pickupDate, x.pickupTime])
  } else if (type === 'products') {
    const p = await Product.find({ isActive: true }).populate('farmer', 'businessName').limit(5000).lean()
    header = ['name', 'category', 'price', 'unit', 'stock', 'unitsSold', 'farmer']
    rows = p.map((x) => [x.name, x.category, x.price, x.unit, x.stock, x.unitsSold, x.farmer?.businessName])
  } else if (type === 'users') {
    const u = await User.find().select('name email role isActive createdAt').limit(5000).lean()
    header = ['name', 'email', 'role', 'active', 'createdAt']
    rows = u.map((x) => [x.name, x.email, x.role, x.isActive, x.createdAt?.toISOString()])
  } else throw new ApiError(404, 'Unknown report type (orders, products, users)')
  await audit(req, 'report.export', 'Report', type, { rows: rows.length })
  res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="marketlink-${type}.csv"` })
  res.send([header, ...rows].map((r) => r.map(csvCell).join(',')).join('\n'))
})

export const broadcast = asyncHandler(async (req, res) => {
  const { title, message = '', audience = 'all' } = req.body
  if (!title || String(title).length > 120) throw new ApiError(422, 'title is required (max 120 chars)')
  const filter = { isActive: true }
  if (['customer', 'farmer'].includes(audience)) filter.role = audience
  const users = await User.find(filter).select('_id').lean()
  await Promise.all(users.map((u) => notify(u._id, { title: String(title), message: String(message).slice(0, 500), type: 'system' })))
  await audit(req, 'notification.broadcast', 'Notification', audience, { title, recipients: users.length })
  success(res, { recipients: users.length }, 'Broadcast sent')
})
export const notificationStats = asyncHandler(async (req, res) => {
  const [total, unread, byType] = await Promise.all([Notification.countDocuments(), Notification.countDocuments({ read: false }), Notification.aggregate([{ $group: { _id: '$type', n: { $sum: 1 } } }])])
  success(res, { total, unread, byType: byType.map((b) => ({ type: b._id, count: b.n })) })
})
export const listContactMessages = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query)
  const [messages, total] = await Promise.all([ContactMessage.find().sort({ createdAt: -1 }).skip(skip).limit(limit), ContactMessage.countDocuments()])
  success(res, { messages, pagination: pageMeta(page, limit, total) })
})
