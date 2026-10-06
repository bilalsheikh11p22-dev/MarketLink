import { api } from './api.js'
export const createOrder = (body) => api('/orders', { method: 'POST', body })
export const getOrders = (params = {}) => api(`/orders?${new URLSearchParams({ limit: 50, ...params })}`)
export const getOrder = (id) => api(`/orders/${id}`)
export const cancelOrder = (id) => api(`/orders/${id}/cancel`, { method: 'PUT' })
export const updateOrderStatus = (id, status, note) => api(`/orders/${id}/status`, { method: 'PUT', body: { status, note } })
export const getPickupCode = (id) => api(`/orders/${id}/pickup-code`)
export default { createOrder, getOrders, getOrder, cancelOrder, updateOrderStatus, getPickupCode }
