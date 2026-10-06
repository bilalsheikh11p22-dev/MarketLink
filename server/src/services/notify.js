import Notification from '../models/Notification.js'
import User from '../models/User.js'
import { sendEmail } from '../utils/sendEmail.js'

// ---- Real-time delivery over Server-Sent Events (in-memory, single instance) ----
const clients = new Map() // userId -> Set(res)
export function addSseClient(userId, res) {
  const key = String(userId)
  if (!clients.has(key)) clients.set(key, new Set())
  clients.get(key).add(res)
  res.on('close', () => { clients.get(key)?.delete(res); if (!clients.get(key)?.size) clients.delete(key) })
}
function push(userId, payload) {
  for (const res of clients.get(String(userId)) || []) {
    try { res.write(`event: notification\ndata: ${JSON.stringify(payload)}\n\n`) } catch { /* client gone */ }
  }
}

/**
 * Creates an in-app notification (respecting the user's preferences), pushes it live,
 * and optionally emails it when the user opted in AND SMTP is configured.
 * Delivery failures are logged, never thrown.
 */
export async function notify(userId, { title, message = '', type = 'system', link = '' }) {
  try {
    const user = await User.findById(userId).select('email notificationPrefs isActive')
    if (!user || !user.isActive) return null
    const prefs = user.notificationPrefs || {}
    if (prefs[type] === false) return null
    const n = await Notification.create({ user: userId, title, message, type, link })
    push(userId, { id: n._id, title, message, type, link, createdAt: n.createdAt })
    if (prefs.email && process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      sendEmail({ to: user.email, subject: `MarketLink: ${title}`, text: message || title })
        .catch((e) => console.error('[notify] email failed:', e.message))
    }
    return n
  } catch (e) {
    console.error('[notify] failed:', e.message)
    return null
  }
}
