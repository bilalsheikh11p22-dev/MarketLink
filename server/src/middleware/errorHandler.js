import { ApiError } from '../utils/ApiError.js'

export function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`))
}

export function errorHandler(err, req, res, next) {
  let status = err.statusCode || 500
  let message = err.message || 'Internal server error'
  if (err.name === 'ValidationError') {
    status = 422
    message = Object.values(err.errors).map((e) => e.message).join(', ')
  }
  if (err.code === 11000) {
    status = 409
    const field = Object.keys(err.keyPattern || {})[0] || 'field'
    message = `${field} already exists`
  }
  if (err.name === 'CastError') { status = 400; message = 'Invalid ID format' }
  if (process.env.NODE_ENV !== 'production' && status === 500) console.error(err)
  res.status(status).json({ success: false, message, errors: err.errors || undefined })
}
