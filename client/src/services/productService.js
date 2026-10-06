import { api } from './api.js'
export const getProducts = (params = {}) => { const q = new URLSearchParams(params).toString(); return api(`/products${q ? `?${q}` : ''}`) }
export const getProduct = (id) => api(`/products/${id}`)
export const createProduct = (body) => api('/products', { method: 'POST', body })
export const updateProduct = (id, body) => api(`/products/${id}`, { method: 'PUT', body })
export const deleteProduct = (id) => api(`/products/${id}`, { method: 'DELETE' })
export default { getProducts, getProduct, createProduct, updateProduct, deleteProduct }
