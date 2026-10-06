import { api, API_URL } from './api.js'

// Farmer
export const farmerAnalytics = (days = 30) => api(`/farmers/me/analytics?days=${days}`)
export const farmerForecast = (weeks = 8) => api(`/farmers/me/forecast?weeks=${weeks}`)
export const farmerWaste = () => api('/farmers/me/waste')
export const farmerAssistant = (message, language) => api('/ai/farmer-chat', { method: 'POST', body: { message, language } })
export const getMySlots = () => api('/farmers/me/pickup-slots')
export const setMySlots = (slots) => api('/farmers/me/pickup-slots', { method: 'PUT', body: { slots } })
export const getSlotAvailability = (farmerId, date) => api(`/farmers/${farmerId}/pickup-slots?date=${date}`)
export const pickupQueue = (date) => api(`/orders/queue${date ? `?date=${date}` : ''}`)
export const verifyPickup = (orderId, token) => api(`/orders/${orderId}/verify-pickup`, { method: 'POST', body: { token } })
export const adjustStock = (id, body) => api(`/products/${id}/stock`, { method: 'PATCH', body })

// Customer
export const customerInsights = () => api('/insights/me')
export const getPickupCode = (orderId) => api(`/orders/${orderId}/pickup-code`)
export const submitContact = (body) => api('/contact', { method: 'POST', body })
export const aiHistory = (scope = 'customer') => api(`/ai/history?scope=${scope}`)
export const clearAiHistory = (scope = 'customer') => api(`/ai/history?scope=${scope}`, { method: 'DELETE' })

// Admin
export const adminAnalytics = (days = 30) => api(`/admin/analytics?days=${days}`)
export const adminImpact = (days = 90) => api(`/admin/impact?days=${days}`)
export const adminAuditLogs = (params = {}) => api(`/admin/audit-logs?${new URLSearchParams(params)}`)
export const adminBroadcast = (body) => api('/admin/notifications/broadcast', { method: 'POST', body })
export const adminNotificationStats = () => api('/admin/notifications/stats')
export const adminReviews = (params = {}) => api(`/admin/reviews?${new URLSearchParams(params)}`)
export const adminModerateReview = (id, status) => api(`/admin/reviews/${id}`, { method: 'PUT', body: { status } })

/** Downloads a CSV report (needs the auth header, so we fetch then save a Blob). */
export async function downloadReport(type) {
  const token = localStorage.getItem('marketlink_token')
  const res = await fetch(`${API_URL}/admin/reports/${type}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Download failed')
  const url = URL.createObjectURL(await res.blob())
  const a = Object.assign(document.createElement('a'), { href: url, download: `marketlink-${type}.csv` })
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
}
