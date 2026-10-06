import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { uploader, saveImage, listImages } from '../controllers/uploadController.js'
const router = Router()
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false })
router.get('/images', requireAuth, requireRole('admin'), listImages)
router.post('/images/:folder', limiter, requireAuth, (req, res, next) => uploader(req, res, (err) => {
  if (!err) return next()
  const code = err.code === 'LIMIT_FILE_SIZE' ? 413 : 422
  res.status(code).json({ success: false, message: err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5 MB or smaller' : 'Invalid upload' })
}), saveImage)
export default router
