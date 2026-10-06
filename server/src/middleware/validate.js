import { validationResult } from 'express-validator'
import { ApiError } from '../utils/ApiError.js'
export function validate(req, res, next) {
  const result = validationResult(req)
  if (result.isEmpty()) return next()
  const errors = result.array().map((e) => ({ field: e.path, message: e.msg }))
  next(new ApiError(422, errors.map((e) => `${e.field}: ${e.message}`).join('; '), errors))
}
