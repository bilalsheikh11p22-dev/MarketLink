import mongoose from 'mongoose'
const favoriteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  targetType: { type: String, enum: ['product', 'farmer', 'market'], required: true },
  target: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { timestamps: true })
favoriteSchema.index({ user: 1, targetType: 1, target: 1 }, { unique: true })
favoriteSchema.index({ targetType: 1, target: 1 })
export default mongoose.model('Favorite', favoriteSchema)
