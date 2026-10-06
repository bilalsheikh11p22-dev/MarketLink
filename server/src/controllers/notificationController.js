import jwt from 'jsonwebtoken'
import Notification from '../models/Notification.js'
import User from '../models/User.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { success } from '../utils/ApiResponse.js'
import { parsePaging, pageMeta } from '../utils/pagination.js'
import { addSseClient } from '../services/notify.js'

export const listNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query, { defaultLimit: 30 })
  const filter = { user: req.user._id }
  if (req.query.unread === 'true') filter.read = false
  const [notifications, total, unread] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: req.user._id, read: false })
  ])
  success(res, { notifications, unread, pagination: pageMeta(page, limit, total) })
})
export const markRead = asyncHandler(async (req, res) => {
  const n = await Notification.findOne({ _id: req.params.id, user: req.user._id })
  if (!n) throw new ApiError(404, 'Notification not found')
  n.read = true; await n.save()
  success(res, { notification: n })
})
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true })
  success(res, null, 'All marked read')
})
export const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.deleteOne({ _id: req.params.id, user: req.user._id })
  success(res, null, 'Deleted')
})
export const getPreferences = asyncHandler(async (req, res) => success(res, { preferences: req.user.notificationPrefs }))
export const updatePreferences = asyncHandler(async (req, res) => {
  const keys = ['order', 'pickup', 'stock', 'restock', 'system', 'email']
  for (const k of keys) if (typeof req.body[k] === 'boolean') req.user.set(`notificationPrefs.${k}`, req.body[k])
  await req.user.save()
  success(res, { preferences: req.user.notificationPrefs }, 'Preferences saved')
})
/** Server-Sent Events stream. EventSource cannot send headers, so the JWT is accepted as ?token= for this endpoint only. */
export const stream = asyncHandler(async (req, res) => {
  let payload
  try { payload = jwt.verify(String(req.query.token || ''), process.env.JWT_SECRET) } catch { throw new ApiError(401, 'Invalid or expired token') }
  const user = await User.findById(payload.id).select('isActive')
  if (!user?.isActive) throw new ApiError(401, 'User not found or inactive')
  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' })
  res.flushHeaders?.()
  res.write('event: ready\ndata: {}\n\n')
  addSseClient(user._id, res)
  const ping = setInterval(() => res.write(': ping\n\n'), 25000)
  res.on('close', () => clearInterval(ping))
})
