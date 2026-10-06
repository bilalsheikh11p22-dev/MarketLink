import mongoose from 'mongoose'
const chatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  scope: { type: String, enum: ['customer', 'farmer'], default: 'customer' },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  text: { type: String, required: true, maxlength: 4000 },
  meta: mongoose.Schema.Types.Mixed
}, { timestamps: { createdAt: true, updatedAt: false } })
chatSchema.index({ user: 1, scope: 1, createdAt: -1 })
export default mongoose.model('ChatMessage', chatSchema)
