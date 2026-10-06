import crypto from 'crypto'
import Order, { STATUS_TRANSITIONS, ORDER_STATUSES } from '../models/Order.js'
import Cart from '../models/Cart.js'
import Farmer from '../models/Farmer.js'
import Product, { computeAvailability } from '../models/Product.js'
import Favorite from '../models/Favorite.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { success } from '../utils/ApiResponse.js'
import { parsePaging, pageMeta } from '../utils/pagination.js'
import { notify } from '../services/notify.js'
import { audit } from '../services/audit.js'
import { withLocks } from '../utils/keyedLock.js'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const todayStr = () => new Date().toISOString().slice(0, 10)
const round2 = (n) => Math.round(n * 100) / 100

async function restoreStock(items) {
  return withLocks(items.map((i) => i.product), () => restoreStockUnlocked(items))
}
async function restoreStockUnlocked(items) {
  for (const it of items) {
    const p = await Product.findByIdAndUpdate(it.product, { $inc: { stock: it.quantity, unitsSold: -it.quantity } }, { new: true })
    if (p) {
      await Product.updateOne({ _id: p._id }, { availability: computeAvailability(p.stock, p.lowStockThreshold) })
      if (p.stock - it.quantity <= 0 && p.stock > 0) await restockAlerts(p)
    }
  }
}

/** Notifies users who favourited the farmer or product when an out-of-stock item is available again. */
async function restockAlerts(product) {
  try {
    const favs = await Favorite.find({ $or: [{ targetType: 'product', target: product._id }, { targetType: 'farmer', target: product.farmer }] }).select('user').lean()
    const seen = new Set()
    for (const f of favs) {
      if (seen.has(String(f.user))) continue
      seen.add(String(f.user))
      await notify(f.user, { title: 'Back in stock', message: `${product.name} is available again.`, type: 'restock', link: `/products/${product._id}` })
    }
  } catch (e) { console.error('[restockAlerts]', e.message) }
}
export { restockAlerts }

async function checkPickupSlot(farmer, pickupDate, pickupTime) {
  if (!farmer?.pickupSlots?.length) return // farmer has not configured slots: any time is accepted
  const day = DAYS[new Date(`${pickupDate}T00:00:00`).getDay()]
  const slot = farmer.pickupSlots.find((s) => s.active && s.day === day && `${s.start}-${s.end}` === pickupTime)
  if (!slot) throw new ApiError(422, `${farmer.businessName} has no pickup slot ${pickupTime} on ${day}`)
  const used = await Order.countDocuments({ farmer: farmer._id, pickupDate, pickupTime, status: { $ne: 'cancelled' } })
  if (used >= slot.capacity) throw new ApiError(409, `The ${pickupTime} slot at ${farmer.businessName} is full`)
}

export const createOrder = asyncHandler(async (req, res) => {
  if (req.user.role !== 'customer') throw new ApiError(403, 'Only customers can place orders')
  const { pickupLocation = '', pickupDate, pickupTime = '', notes = '', idempotencyKey } = req.body
  // Pickup can be given once for everything (pickupDate/pickupTime) or per farmer via `pickups: { [farmerId]: { date, time } }`.
  const pickups = req.body.pickups && typeof req.body.pickups === 'object' ? req.body.pickups : {}
  const validDate = (d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d))
  if (!pickupDate && !Object.keys(pickups).length) throw new ApiError(422, 'pickupDate (YYYY-MM-DD) is required')
  for (const d of [pickupDate, ...Object.values(pickups).map((p) => p?.date)].filter((x) => x !== undefined && x !== '')) {
    if (!validDate(d)) throw new ApiError(422, 'pickup dates must be YYYY-MM-DD')
    if (d < todayStr()) throw new ApiError(422, 'pickupDate cannot be in the past')
  }
  if (idempotencyKey && String(idempotencyKey).length > 80) throw new ApiError(422, 'idempotencyKey too long')

  // Idempotent retry: same key returns the original orders instead of creating duplicates.
  if (idempotencyKey) {
    const existing = await Order.find({ customer: req.user._id, idempotencyKey: new RegExp(`^${String(idempotencyKey).replace(/[^\w-]/g, '')}:`) })
    if (existing.length) return success(res, { orders: existing, order: existing[0], duplicate: true }, 'Order already created')
  }

  // Items come from the explicit request body or, by default, the server-side cart.
  let wanted = []
  let cart = null
  if (Array.isArray(req.body.items) && req.body.items.length) {
    wanted = req.body.items.map((i) => ({ productId: String(i.productId), quantity: Number(i.quantity) }))
  } else {
    cart = await Cart.findOne({ user: req.user._id })
    wanted = (cart?.items || []).map((i) => ({ productId: String(i.product), quantity: i.quantity }))
  }
  if (!wanted.length) throw new ApiError(400, 'Cart is empty')
  if (wanted.length > 50) throw new ApiError(422, 'Too many items')
  for (const w of wanted) if (!Number.isInteger(w.quantity) || w.quantity < 1 || w.quantity > 1000) throw new ApiError(422, 'Quantity must be a whole number between 1 and 1000')
  // Merge duplicate lines
  const merged = new Map()
  for (const w of wanted) merged.set(w.productId, (merged.get(w.productId) || 0) + w.quantity)

  // ---- Atomic stock reservation: a single conditional $inc per product ----
  const reserved = []
  try {
    await withLocks([...merged.keys()], async () => {
    for (const [productId, qty] of merged) {
      const before = await Product.findOneAndUpdate(
        { _id: productId, isActive: true, status: 'published', stock: { $gte: qty } },
        { $inc: { stock: -qty, unitsSold: qty } },
        { new: false }
      )
      if (!before) {
        const p = await Product.findById(productId).select('name stock isActive')
        if (!p || !p.isActive) throw new ApiError(404, 'A product in your order is no longer available')
        throw new ApiError(409, `Only ${p.stock} of "${p.name}" left in stock`)
      }
      reserved.push({ product: before, quantity: qty })
      const after = before.stock - qty
      await Product.updateOne({ _id: before._id }, { availability: computeAvailability(after, before.lowStockThreshold) })
    }
    })
  } catch (err) {
    await restoreStock(reserved.map((r) => ({ product: r.product._id, quantity: r.quantity })))
    throw err
  }

  // ---- Split by farmer, price on the server ----
  const byFarmer = new Map()
  for (const r of reserved) {
    const p = r.product
    const unit = round2(p.price * (1 - (p.discountPercent || 0) / 100))
    const line = { product: p._id, farmer: p.farmer, market: p.market, name: p.name, image: p.images?.[0] || '', unit: p.unit, quantity: r.quantity, price: unit, listPrice: p.price, discountPercent: p.discountPercent || 0, subtotal: round2(unit * r.quantity) }
    const k = String(p.farmer)
    if (!byFarmer.has(k)) byFarmer.set(k, [])
    byFarmer.get(k).push(line)
  }

  const created = []
  const group = crypto.randomBytes(6).toString('hex')
  try {
    for (const [farmerId, items] of byFarmer) {
      const farmer = await Farmer.findById(farmerId)
      if (!farmer || farmer.verificationStatus !== 'approved') throw new ApiError(409, 'A farmer in your order is not currently accepting orders')
      const pk = pickups[farmerId] || {}
      const fDate = pk.date || pickupDate
      const fTime = pk.time !== undefined ? String(pk.time) : String(pickupTime)
      if (!validDate(fDate)) throw new ApiError(422, `Choose a pickup date for ${farmer.businessName}`)
      await checkPickupSlot(farmer, fDate, fTime)
      const subtotal = round2(items.reduce((s, i) => s + i.subtotal, 0))
      const order = await Order.create({
        orderNumber: `ML-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
        checkoutGroup: group, customer: req.user._id, farmer: farmer._id,
        idempotencyKey: idempotencyKey ? `${String(idempotencyKey).replace(/[^\w-]/g, '')}:${farmerId}` : undefined,
        items, subtotal, total: subtotal, status: 'pending', statusHistory: [{ status: 'pending', by: req.user._id }],
        pickupLocation: pickupLocation || '', pickupDate: fDate, pickupTime: fTime, notes, paymentStatus: 'pay_on_pickup',
        pickupToken: crypto.randomBytes(16).toString('hex')
      })
      created.push(order)
    }
  } catch (err) {
    // Roll back everything created in this checkout
    for (const o of created) await Order.deleteOne({ _id: o._id })
    await restoreStock(reserved.map((r) => ({ product: r.product._id, quantity: r.quantity })))
    throw err
  }

  // Clear only what was ordered from the server cart
  if (!cart) cart = await Cart.findOne({ user: req.user._id })
  if (cart) { cart.items = cart.items.filter((i) => !merged.has(String(i.product))); await cart.save() }

  // Notifications (never block the response)
  for (const o of created) {
    notify(req.user._id, { title: 'Order placed', message: `Order ${o.orderNumber} was placed. Pay on pickup.`, type: 'order', link: `/orders/${o._id}` })
    Farmer.findById(o.farmer).then((f) => f && notify(f.user, { title: 'New order', message: `You have a new order ${o.orderNumber}.`, type: 'order', link: `/farmer/orders/${o._id}` }))
  }
  for (const r of reserved) {
    const after = r.product.stock - r.quantity
    if (after <= r.product.lowStockThreshold && r.product.stock > r.product.lowStockThreshold) {
      Farmer.findById(r.product.farmer).then((f) => f && notify(f.user, { title: 'Low stock', message: `${r.product.name} is down to ${after} ${r.product.unit}.`, type: 'stock', link: '/farmer/inventory' }))
    }
  }
  success(res, { orders: created, order: created[0] }, 'Order created', 201)
})

async function ownFarmer(req) { return req.user.role === 'farmer' ? Farmer.findOne({ user: req.user._id }) : null }

export const listOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query)
  const filter = {}
  if (req.query.status && ORDER_STATUSES.includes(req.query.status)) filter.status = req.query.status
  if (req.user.role === 'customer') filter.customer = req.user._id
  else if (req.user.role === 'farmer') {
    const farmer = await ownFarmer(req)
    if (!farmer) return success(res, { orders: [], pagination: pageMeta(page, limit, 0) })
    filter.$or = [{ farmer: farmer._id }, { 'items.farmer': farmer._id }]
  }
  const [orders, total] = await Promise.all([
    Order.find(filter).populate('customer', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter)
  ])
  success(res, { orders, pagination: pageMeta(page, limit, total) })
})

async function loadAuthorised(req, { withToken = false } = {}) {
  let q = Order.findById(req.params.id)
  if (withToken) q = q.select('+pickupToken')
  const order = await q.populate('customer', 'name email phone').populate('items.product', 'name images unit').populate('farmer', 'businessName phone location')
  if (!order) throw new ApiError(404, 'Order not found')
  if (req.user.role === 'customer' && order.customer._id.toString() !== req.user._id.toString()) throw new ApiError(403, 'Not your order')
  if (req.user.role === 'farmer') {
    const farmer = await ownFarmer(req)
    const mine = order.farmer ? order.farmer._id.toString() === farmer?._id.toString() : order.items.some((i) => i.farmer?.toString() === farmer?._id.toString())
    if (!mine) throw new ApiError(403, 'Not your order')
  }
  return order
}

export const getOrder = asyncHandler(async (req, res) => {
  const order = await loadAuthorised(req)
  success(res, { order })
})

/** Customer-only: the secret payload that is rendered as the pickup QR code. */
export const getPickupCode = asyncHandler(async (req, res) => {
  const order = await loadAuthorised(req, { withToken: true })
  if (req.user.role !== 'customer') throw new ApiError(403, 'Only the customer can view the pickup code')
  if (['cancelled', 'completed'].includes(order.status)) throw new ApiError(409, `Order is ${order.status}`)
  success(res, { payload: `ML|${order._id}|${order.pickupToken}`, orderNumber: order.orderNumber })
})

async function applyStatus(req, order, status, note) {
  return withLocks([`order:${order._id}`], async () => {
    const fresh = await Order.findById(order._id).select('status')
    if (fresh) order.status = fresh.status
    return applyStatusUnlocked(req, order, status, note)
  })
}
async function applyStatusUnlocked(req, order, status, note) {
  const allowed = STATUS_TRANSITIONS[order.status] || []
  if (!allowed.includes(status)) throw new ApiError(409, `Cannot change order from ${order.status} to ${status}`)
  if (status === 'cancelled') {
    // Release stock exactly once, even under concurrent cancel requests.
    const claim = await Order.updateOne({ _id: order._id, stockReleased: false }, { stockReleased: true })
    if (claim.modifiedCount === 1) await restoreStock(order.items)
  }
  order.status = status
  order.statusHistory.push({ status, by: req.user._id, note })
  await order.save()
  const labels = { confirmed: 'confirmed', accepted: 'accepted', preparing: 'being prepared', ready: 'ready for pickup', completed: 'completed', cancelled: 'cancelled' }
  notify(order.customer._id || order.customer, { title: status === 'ready' ? 'Ready for pickup' : 'Order update', message: `Order ${order.orderNumber} is ${labels[status] || status}.`, type: status === 'ready' ? 'pickup' : 'order', link: `/orders/${order._id}` })
}

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body
  if (!ORDER_STATUSES.includes(status)) throw new ApiError(422, 'Invalid status')
  const order = await loadAuthorised(req)
  if (status === 'completed' && req.user.role !== 'admin') throw new ApiError(400, 'Complete an order by verifying the pickup code')
  await applyStatus(req, order, status, note)
  if (req.user.role === 'admin') await audit(req, 'order.status', 'Order', order._id, { status })
  success(res, { order }, 'Status updated')
})

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await loadAuthorised(req)
  if (req.user.role !== 'customer') throw new ApiError(403, 'Use the status endpoint')
  if (!['pending', 'confirmed', 'accepted'].includes(order.status)) throw new ApiError(409, 'This order can no longer be cancelled')
  await applyStatus(req, order, 'cancelled', req.body.note || 'Cancelled by customer')
  success(res, { order }, 'Order cancelled')
})

export const verifyPickup = asyncHandler(async (req, res) => {
  const order = await loadAuthorised(req, { withToken: true })
  if (!['farmer', 'admin'].includes(req.user.role)) throw new ApiError(403, 'Not allowed')
  const token = String(req.body.token || '').trim().split('|').pop()
  if (!token) throw new ApiError(422, 'Pickup code is required')
  const a = Buffer.from(token), b = Buffer.from(order.pickupToken || '')
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw new ApiError(400, 'Pickup code does not match this order')
  if (order.status !== 'ready') throw new ApiError(409, `Order must be "ready" before pickup (currently ${order.status})`)
  order.pickupVerifiedAt = new Date()
  order.paymentStatus = 'paid'
  await applyStatus(req, order, 'completed', 'Pickup verified')
  success(res, { order }, 'Pickup verified')
})

/** Farmer's digital pickup queue: today's (or given date's) active orders in pickup-time order. */
export const pickupQueue = asyncHandler(async (req, res) => {
  const farmer = await ownFarmer(req)
  if (!farmer) throw new ApiError(404, 'Farmer profile not found')
  const date = /^\d{4}-\d{2}-\d{2}$/.test(req.query.date || '') ? req.query.date : todayStr()
  const orders = await Order.find({ farmer: farmer._id, pickupDate: date, status: { $in: ['pending', 'confirmed', 'accepted', 'preparing', 'ready'] } })
    .populate('customer', 'name phone').sort({ pickupTime: 1, createdAt: 1 })
  success(res, { date, queue: orders.map((o, i) => ({ position: i + 1, id: o._id, orderNumber: o.orderNumber, customer: o.customer?.name, pickupTime: o.pickupTime, status: o.status, itemCount: o.items.reduce((s, x) => s + x.quantity, 0), total: o.total })) })
})
