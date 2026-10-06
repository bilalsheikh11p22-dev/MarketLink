import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { chat, farmerChat, history, clearHistory } from '../controllers/aiController.js'
import { optionalAuth, requireAuth, requireRole, requireApprovedFarmer } from '../middleware/auth.js'
const router = Router()
const limiter = rateLimit({ windowMs: 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Too many assistant requests, slow down.' } })
router.post('/chat', limiter, optionalAuth, chat)
router.post('/farmer-chat', limiter, requireAuth, requireRole('farmer'), requireApprovedFarmer, farmerChat)
router.get('/history', requireAuth, history)
router.delete('/history', requireAuth, clearHistory)
export default router
