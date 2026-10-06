import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: {
    type: String,
    required: function () { return !this.googleId },
    minlength: 6,
    select: false
  },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['customer', 'farmer', 'admin'], default: 'customer' },
  isActive: { type: Boolean, default: true },
  city: { type: String, default: '' },
  language: { type: String, enum: ['en', 'ur', 'roman'], default: 'en' },
  notificationPrefs: {
    order: { type: Boolean, default: true },
    pickup: { type: Boolean, default: true },
    stock: { type: Boolean, default: true },
    restock: { type: Boolean, default: true },
    system: { type: Boolean, default: true },
    email: { type: Boolean, default: false }
  },
  googleId: { type: String, default: null, select: false },
  resetOtpHash: { type: String, default: null, select: false },
  resetOtpExpires: { type: Date, default: null, select: false }
}, { timestamps: true })

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})
userSchema.methods.comparePassword = function (c) {
  if (!this.password) return Promise.resolve(false)
  return bcrypt.compare(c, this.password)
}
userSchema.methods.toSafeObject = function () {
  return { id: this._id.toString(), name: this.name, email: this.email, phone: this.phone, avatar: this.avatar, role: this.role, language: this.language, notificationPrefs: this.notificationPrefs, isActive: this.isActive, city: this.city, createdAt: this.createdAt }
}
export default mongoose.model('User', userSchema)
