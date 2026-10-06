import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import mongoose from 'mongoose'
import rateLimit from 'express-rate-limit'
import swaggerUi from 'swagger-ui-express'
import { notFound, errorHandler } from './middleware/errorHandler.js'
import { sanitizeInput } from './middleware/sanitize.js'
import { openapi } from './docs/openapi.js'
import { UPLOAD_ROOT } from './controllers/uploadController.js'
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import marketRoutes from './routes/marketRoutes.js'
import farmerRoutes from './routes/farmerRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import favoriteRoutes from './routes/favoriteRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import publicRoutes from './routes/publicRoutes.js'

const app = express()
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1)

// ---- Interactive API docs (own relaxed CSP, mounted before the strict helmet) ----
app.get('/api/docs.json', (req, res) => res.json(openapi))
app.use('/api/docs', helmet({ contentSecurityPolicy: false }), swaggerUi.serve, swaggerUi.setup(openapi, { customSiteTitle: 'MarketLink API' }))

// cross-origin resource policy must allow the Vite/Vercel frontend to display /uploads images
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))

const allowed = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim()).filter(Boolean)
app.use(cors({
  origin(origin, cb) {
    if (!origin || allowed.includes(origin)) return cb(null, true) // no Origin = curl/server-to-server
    cb(null, false)
  },
  credentials: true
}))
app.use(express.json({ limit: '200kb' }))
app.use(sanitizeInput)
if (process.env.NODE_ENV !== 'test') app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// ---- Locally stored images (server/uploads/images/...) ----
app.use('/uploads', express.static(UPLOAD_ROOT, { maxAge: '7d', fallthrough: false, index: false, dotfiles: 'ignore', setHeaders: (res) => res.set('X-Content-Type-Options', 'nosniff') }))

app.get('/api/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting']
  const db = states[mongoose.connection.readyState] || 'unknown'
  res.status(db === 'connected' ? 200 : 503).json({ success: db === 'connected', message: 'MarketLink API', database: db, uptimeSeconds: Math.round(process.uptime()), time: new Date().toISOString() })
})

app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: Number(process.env.RATE_LIMIT_MAX) || 600, standardHeaders: true, legacyHeaders: false, skip: (req) => req.path.startsWith('/notifications/stream') || req.path === '/health', message: { success: false, message: 'Too many requests, please try again later.' } }))

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/markets', marketRoutes)
app.use('/api/farmers', farmerRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/favorites', favoriteRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/uploads', uploadRoutes)
app.use('/api', publicRoutes)

app.use(notFound)
app.use(errorHandler)
export default app
