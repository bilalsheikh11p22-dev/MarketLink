import mongoose from 'mongoose'
const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  // order | pickup | stock | restock | system | review | waste
  type: { type: String, default: 'system' },
  read: { type: Boolean, default: false },
  link: { type: String, default: '' }
}, { timestamps: true })
notificationSchema.index({ user: 1, read: 1, createdAt: -1 })
export default mongoose.model('Notification', notificationSchema)
