import { Router } from 'express'
import { param, body } from 'express-validator'
import { listMarkets, nearbyMarkets, getMarket, marketFarmers, marketProducts, createMarket, updateMarket, deleteMarket, marketAnalytics } from '../controllers/marketController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
const router = Router()
const id = param('id').isMongoId().withMessage('invalid id')
router.get('/', listMarkets)
router.get('/nearby', nearbyMarkets)
router.get('/:id', id, validate, getMarket)
router.get('/:id/farmers', id, validate, marketFarmers)
router.get('/:id/products', id, validate, marketProducts)
router.get('/:id/analytics', id, validate, marketAnalytics)
router.post('/', requireAuth, requireRole('admin'), body('name').trim().notEmpty(), validate, createMarket)
router.put('/:id', requireAuth, requireRole('admin'), id, validate, updateMarket)
router.delete('/:id', requireAuth, requireRole('admin'), id, validate, deleteMarket)
export default router
