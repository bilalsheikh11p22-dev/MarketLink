// Optional LLM provider. Nothing here fabricates data: the model only receives real MarketLink facts
// and is instructed to answer from them. If no key is configured, callers use the database fallback.
export function aiProvider() {
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic'
  if (process.env.OPENAI_API_KEY) return 'openai'
  return null
}
const LANG = { en: 'English', ur: 'Urdu (Arabic script)', roman: 'Roman Urdu (Urdu written in Latin letters)' }

export async function askLLM({ system, user, language = 'en' }) {
  const provider = aiProvider()
  if (!provider) return null
  const sys = `${system}\nRespond in ${LANG[language] || LANG.en}. Use ONLY the facts in the provided data. If the data does not contain the answer, say you do not have that information. Never invent prices, stock, markets or times.`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 20000)
  try {
    if (provider === 'anthropic') {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', signal: controller.signal,
        headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: process.env.AI_MODEL || 'claude-haiku-4-5-20251001', max_tokens: 600, system: sys, messages: [{ role: 'user', content: user }] })
      })
      if (!r.ok) throw new Error(`Anthropic ${r.status}`)
      const j = await r.json()
      return j.content?.map((c) => c.text || '').join('').trim() || null
    }
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', signal: controller.signal,
      headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: process.env.AI_MODEL || 'gpt-4o-mini', max_tokens: 600, messages: [{ role: 'system', content: sys }, { role: 'user', content: user }] })
    })
    if (!r.ok) throw new Error(`OpenAI ${r.status}`)
    const j = await r.json()
    return j.choices?.[0]?.message?.content?.trim() || null
  } catch (e) {
    console.error('[llm] provider call failed:', e.message)
    return null
  } finally { clearTimeout(timer) }
}
