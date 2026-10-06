import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { submitContact, customerInsights } from '../controllers/publicController.js'
import { requireAuth } from '../middleware/auth.js'
const router = Router()
router.post('/contact', rateLimit({ windowMs: 60 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false }), submitContact)
router.get('/insights/me', requireAuth, customerInsights)
export default router
