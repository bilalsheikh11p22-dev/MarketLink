import { Router } from 'express'
import { param } from 'express-validator'
import { createReview, listProductReviews, listFarmerReviews, replyToReview, deleteReview, listMyReviews, updateReview, listFarmerReviewsPublic, deleteReply } from '../controllers/reviewController.js'
import { requireAuth, requireRole, requireApprovedFarmer } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
const router = Router()
const id = param('id').isMongoId().withMessage('invalid id')
router.get('/product/:id', id, validate, listProductReviews)
router.get('/farmer/me', requireAuth, requireRole('farmer'), requireApprovedFarmer, listFarmerReviews)
router.get('/me', requireAuth, listMyReviews)
router.get('/farmer/:id', id, validate, listFarmerReviewsPublic)
router.post('/', requireAuth, createReview)
router.put('/:id', requireAuth, id, validate, updateReview)
router.delete('/:id/reply', requireAuth, requireRole('farmer'), requireApprovedFarmer, id, validate, deleteReply)
router.put('/:id/reply', requireAuth, requireRole('farmer'), requireApprovedFarmer, id, validate, replyToReview)
router.delete('/:id', requireAuth, id, validate, deleteReview)
export default router
