// Strips MongoDB operator keys ($...) and dotted keys from user input to prevent NoSQL injection.
function clean(value) {
  if (Array.isArray(value)) return value.map(clean)
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      if (key.startsWith('$') || key.includes('.')) delete value[key]
      else value[key] = clean(value[key])
    }
  }
  return value
}
export function sanitizeInput(req, res, next) {
  if (req.body) clean(req.body)
  if (req.params) clean(req.params)
  if (req.query) {
    // req.query is a getter in newer Express builds; clean in place.
    clean(req.query)
  }
  next()
}
export const escapeRegex = (s = '') => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
