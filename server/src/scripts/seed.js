import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'
import { UPLOAD_ROOT } from '../controllers/uploadController.js'
import User from '../models/User.js'
import Market from '../models/Market.js'
import Farmer from '../models/Farmer.js'
import Product from '../models/Product.js'
import Order from '../models/Order.js'
import Review from '../models/Review.js'
import Cart from '../models/Cart.js'
import Favorite from '../models/Favorite.js'
import Notification from '../models/Notification.js'
import AuditLog from '../models/AuditLog.js'
import ChatMessage from '../models/ChatMessage.js'

/**
 * Image paths are only stored when a matching file really exists in server/uploads/images/<folder>/.
 * Name your files by slug (e.g. products/organic-tomatoes.jpg, markets/green-valley-farmers-market.jpg,
 * farmers/khan-organic-farm.jpg, farms/khan-organic-farm.jpg). Missing files are left empty so the
 * frontend shows its placeholder. Nothing is invented.
 */
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
function findUpload(folder, name) {
  const dir = path.join(UPLOAD_ROOT, 'images', folder)
  if (!fs.existsSync(dir)) return ''
  const hit = fs.readdirSync(dir).find((f) => f.toLowerCase().startsWith(slug(name) + '.') && /\.(jpe?g|png|webp|avif)$/i.test(f))
  return hit ? `/uploads/images/${folder}/${hit}` : ''
}
const imgs = (folder, name) => { const p = findUpload(folder, name); return p ? [p] : [] }

async function seed() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SEED !== 'true') throw new Error('Refusing to seed in production (set ALLOW_SEED=true to override)')
  await connectDB(process.env.MONGO_URI)
  await Promise.all([User, Market, Farmer, Product, Order, Review, Cart, Favorite, Notification, AuditLog, ChatMessage].map((m) => m.deleteMany({})))

  await User.create({ name: 'Admin User', email: 'admin@marketlink.com', password: 'password123', role: 'admin', phone: '0300-0000001' })
  await User.create({ name: 'Sara Customer', email: 'customer@marketlink.com', password: 'password123', role: 'customer', phone: '0300-0000002', city: 'Karachi' })
  const farmerUser = await User.create({ name: 'Ahmed Khan', email: 'ahmed@example.com', password: 'password123', role: 'farmer', phone: '0300-1111111' })
  const farmerUser2 = await User.create({ name: 'Ayesha Malik', email: 'ayesha@example.com', password: 'password123', role: 'farmer', phone: '0300-2222222' })

  // Coordinates below are real approximate centres of the named Karachi areas (used for distance search demos).
  const mk = (m) => ({ ...m, image: findUpload('markets', m.name), gallery: [] })
  const markets = await Market.insertMany([
    mk({ name: 'Green Valley Farmers Market', description: 'Fresh produce from Malir farms.', location: 'Malir, Karachi', address: 'Main Malir Road', openingTime: '07:00', closingTime: '14:00', operatingDays: ['Wed', 'Thu', 'Fri', 'Sat', 'Sun'], lat: 24.8934, lng: 67.1983, status: 'open' }),
    mk({ name: 'Clifton Fresh Market', description: 'Dairy and greens near the sea.', location: 'Clifton, Karachi', address: 'Block 5 Clifton', openingTime: '08:00', closingTime: '18:00', operatingDays: ['Tue', 'Thu', 'Sat', 'Sun'], lat: 24.8138, lng: 67.0300, status: 'open' }),
    mk({ name: 'Gulshan Community Market', description: 'Herbs and vegetables.', location: 'Gulshan-e-Iqbal', address: 'Block 13-D', openingTime: '08:00', closingTime: '16:00', operatingDays: ['Fri', 'Sat', 'Sun'], lat: 24.9215, lng: 67.0921, status: 'open' })
  ])

  const f1 = await Farmer.create({ user: farmerUser._id, businessName: 'Khan Organic Farm', description: 'Certified organic vegetables.', phone: farmerUser.phone, location: 'Malir', market: markets[0]._id, verificationStatus: 'approved', categories: ['Vegetables', 'Dairy'], profileImage: findUpload('farmers', 'Khan Organic Farm'), farmImage: findUpload('farms', 'Khan Organic Farm'),
    pickupSlots: ['Wed', 'Thu', 'Fri', 'Sat', 'Sun'].flatMap((day) => [{ day, start: '09:00', end: '10:00', capacity: 5 }, { day, start: '10:00', end: '11:00', capacity: 5 }]) })
  const f2 = await Farmer.create({ user: farmerUser2._id, businessName: 'Malik Herb Garden', description: 'Fresh herbs and greens.', phone: farmerUser2.phone, location: 'Gulshan', market: markets[2]._id, verificationStatus: 'approved', categories: ['Herbs', 'Vegetables'], profileImage: findUpload('farmers', 'Malik Herb Garden'), farmImage: findUpload('farms', 'Malik Herb Garden'),
    pickupSlots: ['Fri', 'Sat', 'Sun'].map((day) => ({ day, start: '10:00', end: '12:00', capacity: 8 })) })

  const P = (name, description, category, price, unit, farmer, market, stock) => ({ name, description, category, price, unit, farmer: farmer._id, market: market._id, stock, images: imgs('products', name), availability: stock <= 0 ? 'out_of_stock' : stock <= 10 ? 'low_stock' : 'in_stock' })
  await Product.insertMany([
    P('Organic Tomatoes', 'Vine-ripened organic tomatoes.', 'Vegetables', 180, 'kg', f1, markets[0], 80),
    P('Fresh Mint', 'Aromatic mint bunches.', 'Herbs', 40, 'bunch', f2, markets[2], 50),
    P('Baby Spinach', 'Tender baby spinach.', 'Vegetables', 120, '250g', f1, markets[0], 30),
    P('Sweet Carrots', 'Crunchy sweet carrots.', 'Vegetables', 90, 'kg', f1, markets[0], 60),
    P('Coriander Bunch', 'Fresh coriander.', 'Herbs', 30, 'bunch', f2, markets[2], 40),
    P('Buffalo Milk', 'Farm-fresh buffalo milk.', 'Dairy', 220, 'litre', f1, markets[1], 25)
  ])
  for (const M of [Product, Order, Review, Favorite, Farmer, Market]) {
    try { await M.syncIndexes() } catch (e) { console.warn(`[seed] index sync skipped for ${M.modelName}: ${e.message}`) }
  }
  console.log('Seed complete (no orders/reviews are fabricated). Demo password for all accounts: password123')
  console.log('  admin@marketlink.com | customer@marketlink.com | ahmed@example.com | ayesha@example.com')
  await mongoose.disconnect()
}
seed().catch((e) => { console.error(e.message); process.exit(1) })
