import { api } from './api.js'
export const getAdminDashboard = () => api('/admin/dashboard')
export const getAdminUsers = () => api('/admin/users')
export const updateAdminUser = (id, body) => api(`/admin/users/${id}`, { method: 'PUT', body })
export const getAdminFarmers = () => api('/admin/farmers')
export const updateAdminFarmer = (id, body) => api(`/admin/farmers/${id}`, { method: 'PUT', body })
export const getAdminAnalytics = () => api('/admin/analytics')
export default { getAdminDashboard, getAdminUsers, updateAdminUser, getAdminFarmers, updateAdminFarmer, getAdminAnalytics }
