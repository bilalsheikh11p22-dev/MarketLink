import { api } from './api.js'
export const getCart = () => api('/cart')
export const addToCart = (productId, quantity = 1) => api('/cart', { method: 'POST', body: { productId, quantity } })
export const updateCartItem = (productId, quantity) => api(`/cart/${productId}`, { method: 'PUT', body: { quantity } })
export const removeCartItem = (productId) => api(`/cart/${productId}`, { method: 'DELETE' })
export const clearCart = () => api('/cart', { method: 'DELETE' })
export default { getCart, addToCart, updateCartItem, removeCartItem, clearCart }
