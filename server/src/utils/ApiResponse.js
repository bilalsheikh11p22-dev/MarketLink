export function success(res, data = null, message = 'OK', status = 200) {
  return res.status(status).json({ success: true, message, data })
}
export function fail(res, message = 'Error', status = 400, errors = null) {
  return res.status(status).json({ success: false, message, errors })
}
