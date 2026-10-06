import { api } from './api.js'
export const productReviews = (id) => api(`/reviews/product/${id}?limit=50`)
export const farmerReviewsPublic = (id) => api(`/reviews/farmer/${id}`)
export const myReviews = () => api('/reviews/me')
export const createReview = (body) => api('/reviews', { method: 'POST', body })
export const updateReview = (id, body) => api(`/reviews/${id}`, { method: 'PUT', body })
export const deleteReview = (id) => api(`/reviews/${id}`, { method: 'DELETE' })
export const replyToReview = (id, text) => api(`/reviews/${id}/reply`, { method: 'PUT', body: { text } })
export const deleteReply = (id) => api(`/reviews/${id}/reply`, { method: 'DELETE' })
