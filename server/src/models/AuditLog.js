import mongoose from 'mongoose'
const auditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  actorEmail: String,
  action: { type: String, required: true, index: true },
  targetType: String,
  targetId: String,
  details: mongoose.Schema.Types.Mixed,
  ip: String
}, { timestamps: { createdAt: true, updatedAt: false } })
auditLogSchema.index({ createdAt: -1 })
export default mongoose.model('AuditLog', auditLogSchema)
