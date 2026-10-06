import { api } from './api.js'
export const getMarkets = (params = {}) => { const q = new URLSearchParams(params).toString(); return api(`/markets${q ? `?${q}` : ''}`) }
export const getMarket = (id) => api(`/markets/${id}`)
export const getMarketAnalytics = (id) => api(`/markets/${id}/analytics`)
export default { getMarkets, getMarket, getMarketAnalytics }
