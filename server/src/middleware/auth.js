import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) throw new ApiError(401, 'Authentication required')
  let payload
  try { payload = jwt.verify(token, process.env.JWT_SECRET) }
  catch { throw new ApiError(401, 'Invalid or expired token') }
  const user = await User.findById(payload.id)
  if (!user || !user.isActive) throw new ApiError(401, 'User not found or inactive')
  req.user = user
  next()
})

export const requireRole = (...roles) => asyncHandler(async (req, res, next) => {
  if (!req.user) throw new ApiError(401, 'Authentication required')
  if (!roles.includes(req.user.role)) throw new ApiError(403, 'You do not have permission for this action')
  next()
})

export const optionalAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(payload.id)
      if (user && user.isActive) req.user = user
    } catch { /* ignore */ }
  }
  next()
})

import Farmer from '../models/Farmer.js'
/** Farmer routes: requires a farmer profile that is approved (not pending/rejected/suspended). Admins pass through. */
export const requireApprovedFarmer = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'admin') return next()
  const farmer = await Farmer.findOne({ user: req.user._id })
  if (!farmer) throw new ApiError(403, 'Farmer profile required')
  if (farmer.verificationStatus !== 'approved') throw new ApiError(403, `Farmer account is ${farmer.verificationStatus}`)
  req.farmer = farmer
  next()
})
