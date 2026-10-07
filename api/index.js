import mongoose from 'mongoose'
import app from '../server/src/app.js'
import { connectDB } from '../server/src/config/db.js'

let connecting = null

async function ensureDB() {
  const state = mongoose.connection.readyState // 0=disc, 1=conn, 2=connecting
  if (state === 1) return
  if (state === 0) connecting = null // purana promise reset karo
  if (!connecting) {
    connecting = connectDB(process.env.MONGO_URI).catch((err) => {
      connecting = null
      throw err
    })
  }
  await connecting
}

export default async function handler(req, res) {
  try {
    await ensureDB()
    return app(req, res)
  } catch (error) {
    console.error('Vercel API error:', error)
    return res.status(500).json({
      success: false,
      message: 'Server initialization failed',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message,
    })
  }
}
