import { Router } from 'express'
import { param } from 'express-validator'
import { listFarmers, getFarmer, getFarmerProducts, farmerDashboard, updateMyProfile, getMyProducts, getMySlots, setMySlots, getSlotAvailability, myAnalytics, myForecast, myWaste } from '../controllers/farmerController.js'
import { requireAuth, requireRole, requireApprovedFarmer } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
const router = Router()
const id = param('id').isMongoId().withMessage('invalid id')
const mine = [requireAuth, requireRole('farmer'), requireApprovedFarmer]
router.get('/', listFarmers)
router.get('/me/dashboard', ...mine, farmerDashboard)
router.put('/me/profile', ...mine, updateMyProfile)
router.get('/me/products', ...mine, getMyProducts)
router.get('/me/pickup-slots', ...mine, getMySlots)
router.put('/me/pickup-slots', ...mine, setMySlots)
router.get('/me/analytics', ...mine, myAnalytics)
router.get('/me/forecast', ...mine, myForecast)
router.get('/me/waste', ...mine, myWaste)
router.get('/:id', id, validate, getFarmer)
router.get('/:id/products', id, validate, getFarmerProducts)
router.get('/:id/pickup-slots', id, validate, getSlotAvailability)
export default router
