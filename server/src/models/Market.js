import mongoose from 'mongoose'
const marketSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  location: { type: String, default: '' },
  address: { type: String, default: '' },
  image: { type: String, default: '' },
  gallery: [{ type: String }],
  openingTime: { type: String, default: '08:00' },
  closingTime: { type: String, default: '18:00' },
  operatingDays: [{ type: String }],
  contact: { type: String, default: '' },
  // Coordinates are only stored when an admin supplies them. Never auto-invented.
  lat: { type: Number, min: -90, max: 90 },
  lng: { type: Number, min: -180, max: 180 },
  isActive: { type: Boolean, default: true },
  status: { type: String, enum: ['open', 'closed', 'pending', 'suspended'], default: 'open' }
}, { timestamps: true })
marketSchema.index({ isActive: 1, name: 1 })
export default mongoose.model('Market', marketSchema)
