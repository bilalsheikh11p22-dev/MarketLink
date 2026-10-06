import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Send, Sparkles, MapPin, Trash2 } from 'lucide-react'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import ProductImage from '../../components/image/ProductImage.jsx'
import { getAIResponse, getSuggestedQuestions, getHistory, clearHistory } from '../../services/aiService.js'
import * as productService from '../../services/productService.js'
import { normalizeList, normalizeProduct } from '../../utils/normalize.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'

const WELCOME = { id: 'welcome', role: 'assistant', text: "Hi! Ask me about products, prices, budgets, markets and pickup times. I only answer from what is actually on MarketLink right now.", products: [], markets: [] }

export default function AIAssistant() {
  const { isAuthenticated } = useAuth()
  const { lang } = useLanguage()
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [coords, setCoords] = useState(null)
  const [geoMsg, setGeoMsg] = useState('')
  const [setupNote, setSetupNote] = useState('')
  const [sideRecs, setSideRecs] = useState([])
  const bottomRef = useRef(null)
  const suggestions = getSuggestedQuestions()

  useEffect(() => { document.title = 'AI Assistant — MarketLink' }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [messages])
  useEffect(() => {
    productService.getProducts({ limit: 3, sort: 'rating', inStock: true }).then((r) => setSideRecs(normalizeList(r.data?.items, normalizeProduct))).catch(() => {})
  }, [])
  useEffect(() => {
    if (!isAuthenticated) return
    getHistory().then((r) => {
      const past = (r.data?.messages || []).map((m) => ({ id: m._id, role: m.role, text: m.text, products: [], markets: [] }))
      if (past.length) setMessages([WELCOME, ...past])
    }).catch(() => {})
  }, [isAuthenticated])

  const shareLocation = () => {
    if (!navigator.geolocation) { setGeoMsg('Your browser does not support location.'); return }
    setGeoMsg('Requesting location…')
    navigator.geolocation.getCurrentPosition(
      (p) => { setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }); setGeoMsg('Location shared with the assistant for this session.') },
      () => setGeoMsg('Location permission denied. You can still ask about markets by name.'),
      { timeout: 8000 }
    )
  }

  const send = async (text) => {
    const q = (text ?? input).trim()
    if (!q || busy) return
    setInput(''); setBusy(true)
    setMessages((m) => [...m, { id: `u-${Date.now()}`, role: 'user', text: q }])
    try {
      const ai = await getAIResponse(q, { language: lang === 'ur' || lang === 'roman' ? lang : 'en', coords })
      setSetupNote(ai.setupNote)
      setMessages((m) => [...m, { id: `a-${Date.now()}`, role: 'assistant', text: ai.text, products: ai.products, markets: ai.markets }])
    } catch (e) {
      setMessages((m) => [...m, { id: `e-${Date.now()}`, role: 'assistant', error: true, text: e.status === 429 ? 'Too many questions — please wait a minute.' : `The assistant could not reach the MarketLink server. ${e.message || ''}`.trim(), products: [], markets: [] }])
    } finally { setBusy(false) }
  }

  const clear = async () => { try { await clearHistory() } catch { /* ignore */ } setMessages([WELCOME]) }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream pt-28">
        <div className="container-page pb-16">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-olive/15 text-olive px-3 py-1 text-xs font-medium mb-3"><Sparkles size={14} aria-hidden="true" /> Grounded in live MarketLink data</div>
            <h1 className="font-display text-2xl sm:text-3xl text-forest-deep">MarketLink AI Assistant</h1>
            {setupNote && <p role="status" className="mt-2 max-w-2xl rounded-lg bg-olive/10 px-3 py-2 text-sm text-forest-deep">{setupNote}</p>}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <aside className="lg:col-span-3 order-2 lg:order-1">
              <div className="rounded-2xl border border-forest/8 bg-cream-soft p-4 lg:sticky lg:top-24">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-forest/45 mb-3">Try asking</h2>
                <ul className="space-y-2">{suggestions.map((q) => <li key={q}><button type="button" onClick={() => send(q)} className="w-full text-left text-sm text-forest-deep hover:text-olive focus-visible:underline">{q}</button></li>)}</ul>
                <button type="button" onClick={shareLocation} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-forest/15 px-3 py-2 text-xs hover:border-olive"><MapPin size={14} aria-hidden="true" /> Share my location</button>
                {geoMsg && <p role="status" className="mt-2 text-xs text-forest/60">{geoMsg}</p>}
                {isAuthenticated && <button type="button" onClick={clear} className="mt-3 inline-flex items-center gap-2 text-xs text-forest/55 hover:text-red-700"><Trash2 size={13} aria-hidden="true" /> Clear chat history</button>}
              </div>
            </aside>

            <section className="lg:col-span-6 order-1 lg:order-2 flex flex-col rounded-2xl border border-forest/8 bg-cream-soft min-h-[60vh]" aria-label="Conversation">
              <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5 max-h-[65vh]" aria-live="polite">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line ${m.role === 'user' ? 'bg-forest-deep text-cream' : m.error ? 'bg-red-50 text-red-900' : 'bg-white text-forest-deep border border-forest/8'}`}>
                      {m.text}
                      {m.products?.length > 0 && (
                        <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {m.products.map((p) => (
                            <li key={p.id}><Link to={`/products/${p.id}`} className="flex items-center gap-3 rounded-lg border border-forest/10 p-2 hover:border-olive">
                              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-forest/5"><ProductImage product={p} alt="" /></div>
                              <div className="min-w-0"><p className="font-medium text-xs truncate">{p.name}</p><p className="text-[11px] text-forest/55">Rs. {p.price}/{p.unit} · {p.stock} in stock</p></div>
                            </Link></li>
                          ))}
                        </ul>
                      )}
                      {m.markets?.length > 0 && (
                        <ul className="mt-3 flex flex-wrap gap-2">{m.markets.map((mk) => <li key={mk.id}><Link to={`/markets/${mk.id}`} className="inline-block rounded-full border border-forest/15 px-3 py-1 text-xs hover:border-olive">{mk.name}{mk.distanceKm != null ? ` · ${mk.distanceKm} km` : ''}</Link></li>)}</ul>
                      )}
                    </div>
                  </div>
                ))}
                {busy && <p className="text-xs text-forest/50">Looking through MarketLink…</p>}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={(e) => { e.preventDefault(); send() }} className="flex gap-2 border-t border-forest/8 p-3">
                <label htmlFor="ai-input" className="sr-only">Ask the assistant</label>
                <input id="ai-input" value={input} maxLength={500} onChange={(e) => setInput(e.target.value)} placeholder="Ask about products, markets, budgets…" className="flex-1 border border-forest/15 bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-olive" />
                <button type="submit" disabled={busy || !input.trim()} aria-label="Send message" className="flex items-center justify-center bg-forest-deep px-4 text-cream disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-olive"><Send size={16} aria-hidden="true" /></button>
              </form>
            </section>

            <aside className="lg:col-span-3 order-3">
              <div className="rounded-2xl border border-forest/8 bg-cream-soft p-4">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-forest/45 mb-3">Top rated in stock</h2>
                {sideRecs.length === 0 ? <p className="text-sm text-forest/55">No products to show yet.</p> : (
                  <ul className="space-y-3">{sideRecs.map((p) => (
                    <li key={p.id}><Link to={`/products/${p.id}`} className="flex items-center gap-3 hover:text-olive">
                      <div className="h-12 w-12 shrink-0 overflow-hidden"><ProductImage product={p} alt="" /></div>
                      <span className="text-sm">{p.name}<span className="block text-xs text-forest/55">Rs. {p.price}/{p.unit}</span></span>
                    </Link></li>))}</ul>
                )}
                <Link to="/insights" className="mt-4 inline-block text-xs text-olive hover:underline">Personalised insights →</Link>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
