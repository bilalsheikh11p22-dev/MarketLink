import { Router } from 'express'
import { param } from 'express-validator'
import { dashboard, listUsers, updateUser, listFarmersAdmin, updateFarmerStatus, listProductsAdmin, listOrdersAdmin, analytics, impact, auditLogs, exportReport, broadcast, notificationStats, listContactMessages } from '../controllers/adminController.js'
import { adminListReviews, adminModerateReview } from '../controllers/reviewController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
const router = Router()
const id = param('id').isMongoId().withMessage('invalid id')
router.use(requireAuth, requireRole('admin'))
router.get('/dashboard', dashboard)
router.get('/users', listUsers)
router.put('/users/:id', id, validate, updateUser)
router.get('/farmers', listFarmersAdmin)
router.put('/farmers/:id', id, validate, updateFarmerStatus)
router.get('/products', listProductsAdmin)
router.get('/orders', listOrdersAdmin)
router.get('/reviews', adminListReviews)
router.put('/reviews/:id', id, validate, adminModerateReview)
router.get('/analytics', analytics)
router.get('/impact', impact)
router.get('/audit-logs', auditLogs)
router.get('/reports/:type', exportReport)
router.post('/notifications/broadcast', broadcast)
router.get('/notifications/stats', notificationStats)
router.get('/contact-messages', listContactMessages)
export default router
