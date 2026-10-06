import mongoose from 'mongoose'

export const ORDER_STATUSES = ['pending', 'confirmed', 'accepted', 'preparing', 'ready', 'completed', 'cancelled']
// Allowed forward transitions. Anything else is rejected by the API.
export const STATUS_TRANSITIONS = {
  pending: ['confirmed', 'accepted', 'cancelled'],
  confirmed: ['accepted', 'preparing', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['completed', 'cancelled'],
  completed: [],
  cancelled: []
}

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer' },
  market: { type: mongoose.Schema.Types.ObjectId, ref: 'Market' },
  name: String,
  image: { type: String, default: '' },
  unit: { type: String, default: '' },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },          // unit price actually charged
  listPrice: { type: Number, min: 0 },                       // price before any promotion
  discountPercent: { type: Number, default: 0 },
  subtotal: { type: Number, required: true, min: 0 }
}, { _id: false })

const historySchema = new mongoose.Schema({
  status: String, at: { type: Date, default: Date.now }, by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, note: String
}, { _id: false })

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, index: true },
  // One checkout can produce several orders (one per farmer); they share a group id.
  checkoutGroup: { type: String, index: true },
  idempotencyKey: { type: String },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', index: true },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { type: String, enum: ORDER_STATUSES, default: 'pending', index: true },
  statusHistory: [historySchema],
  pickupLocation: { type: String, default: '' },
  pickupDate: { type: String, default: '' },   // YYYY-MM-DD
  pickupTime: { type: String, default: '' },   // e.g. "10:00-11:00"
  notes: { type: String, default: '', maxlength: 500 },
  paymentStatus: { type: String, enum: ['unpaid', 'pay_on_pickup', 'paid'], default: 'pay_on_pickup' },
  pickupToken: { type: String, select: false },     // secret behind the QR code
  pickupVerifiedAt: Date,
  pickupReminderSent: { type: Boolean, default: false },
  stockReleased: { type: Boolean, default: false }
}, { timestamps: true })

orderSchema.index({ customer: 1, idempotencyKey: 1 }, { unique: true, partialFilterExpression: { idempotencyKey: { $type: 'string' } } })
orderSchema.index({ 'items.farmer': 1, createdAt: -1 })
orderSchema.index({ pickupDate: 1, status: 1 })
// The pickup secret must never leak in API responses; it is only read explicitly via order.pickupToken.
orderSchema.set('toJSON', { transform: (doc, ret) => { delete ret.pickupToken; return ret } })
export default mongoose.model('Order', orderSchema)
