import { useEffect, useRef, useState } from 'react'
import AnalyticsHeader from '../../components/analytics/AnalyticsHeader.jsx'
import * as svc from '../../services/insightService.js'
import { useLanguage } from '../../context/LanguageContext.jsx'

const SUGGESTIONS = ['What is low on stock?', 'How much should I restock?', 'How are my sales?', 'Which products might go unsold?']

export default function FarmerAssistant() {
  const { lang: language } = useLanguage()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')
  const end = useRef(null)
  useEffect(() => { svc.aiHistory('farmer').then((r) => setMessages((r.data?.messages || []).map((m) => ({ role: m.role, text: m.text })))).catch(() => {}) }, [])
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }) }, [messages])
  const send = async (q) => {
    const message = (q ?? text).trim()
    if (!message || busy) return
    setText(''); setMessages((m) => [...m, { role: 'user', text: message }]); setBusy(true)
    try {
      const r = await svc.farmerAssistant(message, language)
      setMessages((m) => [...m, { role: 'assistant', text: r.data.reply || 'I have no information for that.' }]); setNote(r.data.setupNote || '')
    } catch (e) { setMessages((m) => [...m, { role: 'assistant', text: e.message || 'The assistant is unavailable.', error: true }]) } finally { setBusy(false) }
  }
  return (
    <div className="space-y-6">
      <AnalyticsHeader title="Business assistant" subtitle="Answers use your real stock, orders and demand estimates." />
      {note && <p role="status" className="rounded-lg bg-olive/10 px-3 py-2 text-sm text-forest-deep">{note}</p>}
      <div className="rounded-2xl border border-forest/10 bg-cream-soft p-4 min-h-[18rem] max-h-[28rem] overflow-y-auto space-y-3" aria-live="polite">
        {messages.length === 0 && <p className="text-sm text-forest/55">Ask about stock, demand, sales or unsold produce.</p>}
        {messages.map((m, i) => <div key={i} className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm ${m.role === 'user' ? 'ml-auto bg-forest text-cream' : m.error ? 'bg-red-50 text-red-900' : 'bg-white text-forest-deep'}`}>{m.text}</div>)}
        {busy && <p className="text-xs text-forest/50">Thinking…</p>}
        <div ref={end} />
      </div>
      <div className="flex flex-wrap gap-2">{SUGGESTIONS.map((s) => <button key={s} type="button" onClick={() => send(s)} className="rounded-full border border-forest/15 px-3 py-1.5 text-xs hover:border-olive">{s}</button>)}</div>
      <div className="flex gap-2">
        <label htmlFor="farmer-ai" className="sr-only">Message</label>
        <input id="farmer-ai" value={text} maxLength={500} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Ask about your business…" className="flex-1 border border-forest/15 bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-olive" />
        <button type="button" onClick={() => send()} disabled={busy || !text.trim()} className="bg-forest-deep px-5 text-sm text-cream disabled:opacity-50">Send</button>
      </div>
    </div>
  )
}
