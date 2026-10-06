import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, default: '', maxlength: 2000 },
  category: { type: String, default: 'Other', trim: true },
  price: { type: Number, required: true, min: 0 },
  unit: { type: String, default: 'kg' },
  // Relative paths such as /uploads/images/products/x.jpg, /images/... or full https URLs.
  images: [{ type: String }],
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true, index: true },
  market: { type: mongoose.Schema.Types.ObjectId, ref: 'Market', index: true },
  // `stock` is the quantity still available to sell. It is decremented atomically
  // when an order is placed and restored when an order is cancelled.
  stock: { type: Number, default: 0, min: 0 },
  lowStockThreshold: { type: Number, default: 10, min: 0 },
  availability: { type: String, enum: ['in_stock', 'low_stock', 'out_of_stock'], default: 'in_stock' },
  // Farmer-set promotion (0-90). Used by waste-reduction suggestions; applied server-side at checkout.
  discountPercent: { type: Number, default: 0, min: 0, max: 90 },
  unitsSold: { type: Number, default: 0, min: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  status: { type: String, enum: ['published', 'pending', 'hidden', 'draft'], default: 'published' }
}, { timestamps: true })

productSchema.index({ name: 'text', description: 'text', category: 'text' })
productSchema.index({ isActive: 1, status: 1, category: 1, price: 1 })
productSchema.index({ market: 1, isActive: 1, status: 1 })

export function computeAvailability(stock, threshold = 10) {
  if (stock <= 0) return 'out_of_stock'
  if (stock <= threshold) return 'low_stock'
  return 'in_stock'
}
productSchema.pre('save', function (next) {
  if (this.isModified('stock') || this.isModified('lowStockThreshold')) {
    this.availability = computeAvailability(this.stock, this.lowStockThreshold)
  }
  next()
})
productSchema.virtual('effectivePrice').get(function () {
  return Math.round(this.price * (1 - (this.discountPercent || 0) / 100) * 100) / 100
})
productSchema.set('toJSON', { virtuals: true })
productSchema.set('toObject', { virtuals: true })
export default mongoose.model('Product', productSchema)
