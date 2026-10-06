import { Router } from 'express'
import { param } from 'express-validator'
import { createOrder, listOrders, getOrder, updateOrderStatus, cancelOrder, getPickupCode, verifyPickup, pickupQueue } from '../controllers/orderController.js'
import { requireAuth, requireRole, requireApprovedFarmer } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
const router = Router()
const id = param('id').isMongoId().withMessage('invalid id')
router.use(requireAuth)
router.post('/', createOrder)
router.get('/', listOrders)
router.get('/queue', requireRole('farmer'), requireApprovedFarmer, pickupQueue)
router.get('/:id', id, validate, getOrder)
router.get('/:id/pickup-code', id, validate, getPickupCode)
router.put('/:id/cancel', id, validate, cancelOrder)
router.put('/:id/status', id, validate, requireRole('farmer', 'admin'), requireApprovedFarmer, updateOrderStatus)
router.post('/:id/verify-pickup', id, validate, requireRole('farmer', 'admin'), requireApprovedFarmer, verifyPickup)
export default router
