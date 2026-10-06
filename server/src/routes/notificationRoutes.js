import { Router } from 'express'
import { listNotifications, markRead, markAllRead, deleteNotification, getPreferences, updatePreferences, stream } from '../controllers/notificationController.js'
import { requireAuth } from '../middleware/auth.js'
const router = Router()
router.get('/stream', stream)
router.use(requireAuth)
router.get('/', listNotifications)
router.get('/preferences', getPreferences)
router.put('/preferences', updatePreferences)
router.put('/read-all', markAllRead)
router.put('/:id/read', markRead)
router.delete('/:id', deleteNotification)
export default router
