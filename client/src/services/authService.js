import { api } from './api.js'

export const register = (p) => api('/auth/register', { method: 'POST', body: p })
export const login = (p) => api('/auth/login', { method: 'POST', body: p })
export const me = () => api('/auth/me')
export const forgotPassword = (email) => api('/auth/forgot-password', { method: 'POST', body: { email } })
export const verifyOtp = (email, code) => api('/auth/verify-otp', { method: 'POST', body: { email, code } })
export const resetPassword = (email, code, password) =>
  api('/auth/reset-password', { method: 'POST', body: { email, code, password } })
export const googleLogin = (credential) => api('/auth/google', { method: 'POST', body: { credential } })

export default { register, login, me, forgotPassword, verifyOtp, resetPassword, googleLogin }
