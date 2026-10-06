import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { register, login, me, updateProfile, forgotPassword, verifyResetOtp, resetPassword, googleAuth } from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// Tighter limit on OTP-related endpoints since a 6-digit code is brute-forceable.
const otpLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false })

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Too many attempts, try again later.' } })
router.post('/register', loginLimiter, register)
router.post('/login', loginLimiter, login)
router.get('/me', requireAuth, me)
router.put('/profile', requireAuth, updateProfile)
router.post('/forgot-password', otpLimiter, forgotPassword)
router.post('/verify-otp', otpLimiter, verifyResetOtp)
router.post('/reset-password', otpLimiter, resetPassword)
router.post('/google', googleAuth)
export default router
