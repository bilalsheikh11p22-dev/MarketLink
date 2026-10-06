// Small, dependency-free form validators. Each returns an error string or ''.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const validateRequired = (v, label = 'This field') => (String(v ?? '').trim() ? '' : `${label} is required`)

export function validateEmail(v) {
  if (!String(v ?? '').trim()) return 'Email is required'
  return EMAIL_RE.test(v.trim()) ? '' : 'Enter a valid email address'
}

export function validatePhone(v) {
  const digits = String(v ?? '').replace(/[^\d]/g, '')
  if (!digits) return 'Phone number is required'
  return digits.length >= 10 && digits.length <= 13 ? '' : 'Enter a valid phone number'
}

export function validatePassword(v) {
  if (!v) return 'Password is required'
  if (v.length < 8) return 'Use at least 8 characters'
  return ''
}

export function passwordStrength(v) {
  let score = 0
  if (v.length >= 8) score++
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++
  if (/\d/.test(v)) score++
  if (/[^A-Za-z0-9]/.test(v)) score++
  return score // 0–4
}
