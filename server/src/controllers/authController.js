import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { OAuth2Client } from 'google-auth-library'
import User from '../models/User.js'
import Farmer from '../models/Farmer.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { success } from '../utils/ApiResponse.js'
import { sendEmail, otpEmailTemplate } from '../utils/sendEmail.js'

function signToken(user) {
  return jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  })
}

const googleClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null
const OTP_TTL_MS = 10 * 60 * 1000 // 10 minutes

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, city, farmName, farmLocation, farmDescription, categories } = req.body
  if (!name || !email || !password) throw new ApiError(400, 'Name, email and password are required')
  if ([name, email, password].some((v) => typeof v !== 'string')) throw new ApiError(400, 'Name, email and password must be text')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) throw new ApiError(422, 'A valid email is required')
  if (typeof password !== 'string' || password.length < 6 || password.length > 128) throw new ApiError(400, 'Password must be 6-128 characters')
  if (String(name).length > 100) throw new ApiError(422, 'Name is too long')
  const exists = await User.findOne({ email: email.toLowerCase() })
  if (exists) throw new ApiError(409, 'Email already registered')
  const safeRole = role === 'farmer' ? 'farmer' : 'customer'
  const user = await User.create({
    name, email: email.toLowerCase(), password, phone: phone || '', role: safeRole, city: city || ''
  })

  if (safeRole === 'farmer') {
    await Farmer.create({
      user: user._id,
      businessName: farmName || `${name}'s Farm`,
      description: farmDescription || '',
      phone: phone || '',
      location: farmLocation || '',
      categories: Array.isArray(categories) ? categories : [],
      verificationStatus: 'pending'
    })
    // Farmer accounts need admin approval before they can sell — no token
    // is issued yet, so they aren't logged in until approved.
    return success(res, { user: user.toSafeObject(), pending: true }, 'Registration submitted for approval', 201)
  }

  const token = signToken(user)
  success(res, { user: user.toSafeObject(), token }, 'Registered successfully', 201)
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) throw new ApiError(400, 'Email and password are required')
  if (typeof email !== 'string' || typeof password !== 'string') throw new ApiError(400, 'Email and password must be text')
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
  if (!user) throw new ApiError(401, 'Invalid email or password')
  if (!user.isActive) throw new ApiError(403, 'Account is suspended')
  if (!(await user.comparePassword(password))) throw new ApiError(401, 'Invalid email or password')
  if (user.role === 'farmer') {
    const farmer = await Farmer.findOne({ user: user._id })
    if (farmer?.verificationStatus === 'pending') throw new ApiError(403, 'Your farmer account is still awaiting approval.')
    if (farmer?.verificationStatus === 'rejected') throw new ApiError(403, 'Your farmer application was not approved.')
    if (farmer?.verificationStatus === 'suspended') throw new ApiError(403, 'Your farmer account is suspended. Contact support.')
  }
  success(res, { user: await safeUser(user), token: signToken(user) }, 'Logged in')
})

async function safeUser(user) {
  const out = user.toSafeObject()
  if (user.role === 'farmer') { const f = await Farmer.findOne({ user: user._id }).select('_id verificationStatus'); if (f) { out.farmerId = f._id.toString(); out.farmerStatus = f.verificationStatus } }
  return out
}

export const me = asyncHandler(async (req, res) => {
  success(res, { user: await safeUser(req.user) })
})

// PUT /auth/profile — whitelisted self-service fields only (role/email cannot be changed here).
export const updateProfile = asyncHandler(async (req, res) => {
  for (const f of ['name', 'phone', 'city', 'avatar']) if (typeof req.body[f] === 'string') req.user[f] = req.body[f].trim().slice(0, 200)
  if (req.body.language !== undefined) {
    if (!['en', 'ur', 'roman'].includes(req.body.language)) throw new ApiError(422, 'language must be en, ur or roman')
    req.user.language = req.body.language
  }
  if (!req.user.name) throw new ApiError(422, 'name cannot be empty')
  await req.user.save()
  success(res, { user: req.user.toSafeObject() }, 'Profile updated')
})

// POST /auth/forgot-password { email }
// Generates a 6-digit OTP, stores a bcrypt hash of it (never the raw code)
// on the user document, and emails it to the user.
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body
  if (!email) throw new ApiError(400, 'Email is required')
  const user = await User.findOne({ email: email.toLowerCase() })
  // Always respond the same way whether or not the account exists, so the
  // endpoint can't be used to discover which emails are registered.
  if (user) {
    const code = String(crypto.randomInt(100000, 1000000))
    user.resetOtpHash = await bcrypt.hash(code, 10)
    user.resetOtpExpires = new Date(Date.now() + OTP_TTL_MS)
    await user.save()
    const { subject, html, text } = otpEmailTemplate(code, user.name)
    await sendEmail({ to: user.email, subject, html, text })
  }
  success(res, {}, 'If that email is registered, a reset code has been sent.')
})

// POST /auth/verify-otp { email, code }
export const verifyResetOtp = asyncHandler(async (req, res) => {
  const { email, code } = req.body
  if (!email || !code) throw new ApiError(400, 'Email and code are required')
  const user = await User.findOne({ email: email.toLowerCase() }).select('+resetOtpHash +resetOtpExpires')
  if (!user || !user.resetOtpHash || !user.resetOtpExpires) throw new ApiError(400, 'Invalid or expired code')
  if (user.resetOtpExpires.getTime() < Date.now()) throw new ApiError(400, 'This code has expired. Request a new one.')
  const match = await bcrypt.compare(String(code), user.resetOtpHash)
  if (!match) throw new ApiError(400, 'Invalid code')
  success(res, {}, 'Code verified')
})

// POST /auth/reset-password { email, code, password }
// Re-validates the OTP (never trusts the client-side "verified" state alone)
// then updates the password and invalidates the OTP.
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, code, password } = req.body
  if (!email || !code || !password) throw new ApiError(400, 'Email, code and new password are required')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) throw new ApiError(422, 'A valid email is required')
  if (typeof password !== 'string' || password.length < 6 || password.length > 128) throw new ApiError(400, 'Password must be 6-128 characters')
  if (String(name).length > 100) throw new ApiError(422, 'Name is too long')
  const user = await User.findOne({ email: email.toLowerCase() }).select('+resetOtpHash +resetOtpExpires')
  if (!user || !user.resetOtpHash || !user.resetOtpExpires) throw new ApiError(400, 'Invalid or expired code')
  if (user.resetOtpExpires.getTime() < Date.now()) throw new ApiError(400, 'This code has expired. Request a new one.')
  const match = await bcrypt.compare(String(code), user.resetOtpHash)
  if (!match) throw new ApiError(400, 'Invalid code')
  user.password = password
  user.resetOtpHash = null
  user.resetOtpExpires = null
  await user.save()
  success(res, {}, 'Password updated. You can log in now.')
})

// POST /auth/google { credential }  — credential is the Google ID token from
// Google Identity Services on the client.
export const googleAuth = asyncHandler(async (req, res) => {
  if (!googleClient) throw new ApiError(500, 'Google sign-in is not configured on the server')
  const { credential } = req.body
  if (!credential) throw new ApiError(400, 'Missing Google credential')

  let payload
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID })
    payload = ticket.getPayload()
  } catch {
    throw new ApiError(401, 'Invalid Google credential')
  }
  if (!payload?.email) throw new ApiError(401, 'Google account has no email')

  let user = await User.findOne({ email: payload.email.toLowerCase() })
  if (!user) {
    user = await User.create({
      name: payload.name || payload.email.split('@')[0],
      email: payload.email.toLowerCase(),
      googleId: payload.sub,
      avatar: payload.picture || '',
      role: 'customer'
    })
  } else if (!user.googleId) {
    user.googleId = payload.sub
    await user.save()
  }
  if (!user.isActive) throw new ApiError(403, 'Account is suspended')
  success(res, { user: user.toSafeObject(), token: signToken(user) }, 'Logged in with Google')
})
