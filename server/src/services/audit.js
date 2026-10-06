import AuditLog from '../models/AuditLog.js'
// Never throws: audit failures must not break the business action.
export async function audit(req, action, targetType, targetId, details = {}) {
  try {
    await AuditLog.create({
      actor: req.user?._id, actorEmail: req.user?.email, action, targetType,
      targetId: targetId ? String(targetId) : undefined, details, ip: req.ip
    })
  } catch (e) { console.error('[audit] failed:', e.message) }
}
