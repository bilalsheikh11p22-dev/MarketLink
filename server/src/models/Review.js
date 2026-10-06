import mongoose from 'mongoose'
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', index: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', index: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, default: '', maxlength: 80 },
  comment: { type: String, default: '', maxlength: 1500 },
  edited: { type: Boolean, default: false },
  // Set by the server only, from a completed order owned by the reviewer.
  verifiedPurchase: { type: Boolean, default: false },
  status: { type: String, enum: ['published', 'pending', 'hidden'], default: 'published', index: true },
  spamScore: { type: Number, default: 0 },
  spamReasons: [String],
  farmerReply: { text: String, at: Date }
}, { timestamps: true })
reviewSchema.index({ user: 1, product: 1 }, { unique: true, partialFilterExpression: { product: { $exists: true } } })
export default mongoose.model('Review', reviewSchema)
