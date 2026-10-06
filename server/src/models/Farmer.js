import mongoose from 'mongoose'
const slotSchema = new mongoose.Schema({
  day: { type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], required: true },
  start: { type: String, required: true },   // HH:mm
  end: { type: String, required: true },
  capacity: { type: Number, default: 5, min: 1, max: 200 },
  active: { type: Boolean, default: true }
}, { _id: true })
const farmerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  businessName: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  market: { type: mongoose.Schema.Types.ObjectId, ref: 'Market', index: true },
  profileImage: { type: String, default: '' },
  farmImage: { type: String, default: '' },
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'suspended'], default: 'pending', index: true },
  rating: { type: Number, default: 0 },
  categories: [{ type: String }],
  pickupSlots: [slotSchema]
}, { timestamps: true })
export default mongoose.model('Farmer', farmerSchema)
