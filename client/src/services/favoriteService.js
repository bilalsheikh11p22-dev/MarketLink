import { api } from './api.js'
export const list = () => api('/favorites')
export const add = (targetType, target) => api('/favorites', { method: 'POST', body: { targetType, target } })
export const remove = (type, id) => api(`/favorites/${type}/${id}`, { method: 'DELETE' })
export default { list, add, remove }
