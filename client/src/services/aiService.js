import { api } from './api.js'

/** Calls the database-grounded assistant. Never fabricates a reply on failure: the caller shows the error. */
export async function getAIResponse(message, { language = 'en', coords } = {}) {
  const res = await api('/ai/chat', { method: 'POST', body: { message, language, ...(coords || {}) } })
  const d = res.data || {}
  return {
    role: 'assistant', text: d.reply || '', mode: d.mode, aiConfigured: !!d.aiConfigured, setupNote: d.setupNote || '',
    products: d.products || [], markets: d.markets || [], basket: d.basket || null
  }
}
export const getHistory = () => api('/ai/history?scope=customer')
export const clearHistory = () => api('/ai/history?scope=customer', { method: 'DELETE' })
export function getSuggestedQuestions() {
  return ['vegetables under 300 rupees', 'Which markets are nearest to me?', 'Is fresh mint in stock?', 'Dairy products available today', 'When does Green Valley market open?']
}
export default { getAIResponse, getHistory, clearHistory, getSuggestedQuestions }
