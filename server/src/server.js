import 'dotenv/config'
import app from './app.js'
import mongoose from 'mongoose'
import { connectDB } from './config/db.js'
import { startJobs } from './services/jobs.js'

const PORT = process.env.PORT || 5000

function checkEnv() {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set')
  if (process.env.NODE_ENV === 'production') {
    if (process.env.JWT_SECRET.length < 32 || /change_this/i.test(process.env.JWT_SECRET)) throw new Error('JWT_SECRET must be a random string of at least 32 characters in production')
    if (!process.env.CLIENT_URL) throw new Error('CLIENT_URL must be set in production (CORS allow-list)')
  }
}

async function start() {
  try {
    checkEnv()
    await connectDB(process.env.MONGO_URI)
    const server = app.listen(PORT, () => console.log(`MarketLink API listening on port ${PORT}`))
    startJobs()
    const shutdown = async () => { server.close(); await mongoose.disconnect(); process.exit(0) }
    process.on('SIGTERM', shutdown); process.on('SIGINT', shutdown)
  } catch (err) {
    console.error('Failed to start server:', err.message)
    process.exit(1)
  }
}
start()
