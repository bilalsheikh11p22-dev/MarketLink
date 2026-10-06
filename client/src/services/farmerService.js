import { api } from './api.js'
export const getFarmers = () => api('/farmers')
export const getFarmer = (id) => api(`/farmers/${id}`)
export const getFarmerProducts = (id) => api(`/farmers/${id}/products`)
export const getFarmerDashboard = () => api('/farmers/me/dashboard')
export default { getFarmers, getFarmer, getFarmerProducts, getFarmerDashboard }
