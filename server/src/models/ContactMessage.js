import mongoose from 'mongoose'
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
  subject: { type: String, default: '', maxlength: 160 },
  message: { type: String, required: true, maxlength: 3000 },
  status: { type: String, enum: ['new', 'read', 'resolved'], default: 'new' }
}, { timestamps: true })
export default mongoose.model('ContactMessage', contactSchema)
