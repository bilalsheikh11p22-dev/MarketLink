import { api, API_URL } from './api.js'
export const list = (params = {}) => api(`/notifications?${new URLSearchParams({ limit: 50, ...params })}`)
export const markRead = (id) => api(`/notifications/${id}/read`, { method: 'PUT' })
export const markAllRead = () => api('/notifications/read-all', { method: 'PUT' })
export const remove = (id) => api(`/notifications/${id}`, { method: 'DELETE' })
export const getPreferences = () => api('/notifications/preferences')
export const updatePreferences = (prefs) => api('/notifications/preferences', { method: 'PUT', body: prefs })
export const streamUrl = (token) => `${API_URL}/notifications/stream?token=${encodeURIComponent(token)}`
export default { list, markRead, markAllRead, remove, getPreferences, updatePreferences, streamUrl }
