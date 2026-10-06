import Product from '../models/Product.js'
import Market from '../models/Market.js'
import Farmer from '../models/Farmer.js'
import Order from '../models/Order.js'
import ChatMessage from '../models/ChatMessage.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { success } from '../utils/ApiResponse.js'
import { escapeRegex } from '../middleware/sanitize.js'
import { haversineKm, isValidCoord } from '../services/geo.js'
import { askLLM, aiProvider } from '../services/llm.js'
import { demandForecast } from '../services/forecast.js'
import { wasteAlerts } from '../services/waste.js'

const STOP = new Set('the a an i me my for to of and or in on at is are what which where when do you have has any can with under below within about some please show find need want get buy give tell fresh today available'.split(' '))
const CATEGORY_WORDS = { vegetables: 'Vegetables', vegetable: 'Vegetables', veggies: 'Vegetables', sabzi: 'Vegetables', fruits: 'Fruits', fruit: 'Fruits', phal: 'Fruits', dairy: 'Dairy', milk: 'Dairy', doodh: 'Dairy', herbs: 'Herbs', herb: 'Herbs', grains: 'Grains', pulses: 'Pulses' }

const T = {
  en: { none: 'I could not find matching products in stock right now.', found: (n) => `I found ${n} matching product${n === 1 ? '' : 's'} on MarketLink:`, basket: (b, t) => `A basket within your budget of Rs ${b} costs Rs ${t}:`, markets: 'Markets near you:', noCoords: 'Share your location (or use the Nearby Markets page) so I can find markets by distance.', noMarkets: 'No markets with saved coordinates were found within that distance.', hours: 'Opening hours', help: 'Ask me about products, prices, budgets, markets or pickup times.', setup: 'AI language model is not configured, so I am answering directly from MarketLink data.' },
  roman: { none: 'Abhi koi matching product stock mein nahi mila.', found: (n) => `MarketLink par ${n} matching product mile:`, basket: (b, t) => `Aap ke Rs ${b} budget ke andar basket ki qeemat Rs ${t} hai:`, markets: 'Aap ke qareeb markets:', noCoords: 'Apni location share karein ya Nearby Markets page use karein taake main fasle ke hisab se markets dhoond sakoon.', noMarkets: 'Is fasle mein koi market nahi mili.', hours: 'Khulne ke auqaat', help: 'Mujh se products, qeemat, budget, markets ya pickup time ke bare mein poochein.', setup: 'AI model configure nahi hai, is liye jawab seedha MarketLink ke data se de raha hoon.' },
  ur: { none: 'اس وقت اسٹاک میں کوئی مماثل پروڈکٹ نہیں ملی۔', found: (n) => `مارکیٹ لنک پر ${n} مماثل پروڈکٹس ملیں:`, basket: (b, t) => `آپ کے ${b} روپے کے بجٹ میں ٹوکری کی قیمت ${t} روپے ہے:`, markets: 'آپ کے قریب مارکیٹس:', noCoords: 'اپنی لوکیشن شیئر کریں یا قریبی مارکیٹس کا صفحہ استعمال کریں۔', noMarkets: 'اس فاصلے میں کوئی مارکیٹ نہیں ملی۔', hours: 'اوقات', help: 'مجھ سے پروڈکٹس، قیمت، بجٹ، مارکیٹس یا پک اپ کے اوقات کے بارے میں پوچھیں۔', setup: 'AI ماڈل ترتیب نہیں دیا گیا، اس لیے جواب براہ راست مارکیٹ لنک کے ڈیٹا سے دیا جا رہا ہے۔' }
}

function parseIntent(message) {
  const text = message.toLowerCase()
  const budgetMatch = text.match(/(?:under|below|within|budget(?: of)?|upto|up to|rs\.?|pkr|₨|rupees?)\s*(\d{2,6})|(\d{2,6})\s*(?:rs|rupees?|pkr)/)
  const budget = budgetMatch ? Number(budgetMatch[1] || budgetMatch[2]) : null
  const wantsNearby = /\b(near|nearby|closest|nearest|qareeb|paas)\b/.test(text) || /near me/.test(text)
  const wantsMarkets = /\b(market|markets|mandi|bazaar)\b/.test(text)
  const wantsPickup = /\b(pickup|pick up|open|hours|timing|time|closes?|when)\b/.test(text)
  const categories = [...new Set(text.split(/\W+/).map((w) => CATEGORY_WORDS[w]).filter(Boolean))]
  const keywords = text.split(/[^a-z\u0600-\u06ff]+/).filter((w) => w.length > 2 && !STOP.has(w) && !CATEGORY_WORDS[w])
  return { budget, wantsNearby, wantsMarkets, wantsPickup, categories, keywords }
}

const sym = (p) => ({ id: String(p._id), name: p.name, price: p.effectivePrice ?? p.price, listPrice: p.price, discountPercent: p.discountPercent || 0, unit: p.unit, stock: p.stock, category: p.category, images: p.images, farmer: p.farmer?.businessName, farmerId: p.farmer?._id ? String(p.farmer._id) : undefined, market: p.market ? { id: String(p.market._id), name: p.market.name, openingTime: p.market.openingTime, closingTime: p.market.closingTime, operatingDays: p.market.operatingDays } : null })

async function findProducts(intent) {
  const filter = { isActive: true, status: 'published', stock: { $gt: 0 } }
  const ors = []
  if (intent.categories.length) ors.push({ category: { $in: intent.categories } })
  for (const k of intent.keywords.slice(0, 5)) ors.push({ name: { $regex: escapeRegex(k), $options: 'i' } }, { description: { $regex: escapeRegex(k), $options: 'i' } })
  if (ors.length) filter.$or = ors
  const docs = await Product.find(filter).populate('farmer', 'businessName').populate('market', 'name openingTime closingTime operatingDays lat lng').limit(40)
  return docs
}

function buildBasket(products, budget) {
  const sorted = [...products].sort((a, b) => a.effectivePrice - b.effectivePrice)
  const used = new Map(); let total = 0
  let progress = true
  while (progress) {
    progress = false
    for (const p of sorted) {
      const taken = used.get(String(p._id)) || 0
      if (taken < p.stock && total + p.effectivePrice <= budget && taken < 3) { used.set(String(p._id), taken + 1); total += p.effectivePrice; progress = true }
    }
  }
  return { items: sorted.filter((p) => used.has(String(p._id))).map((p) => ({ ...sym(p), quantity: used.get(String(p._id)), lineTotal: Math.round(used.get(String(p._id)) * p.effectivePrice * 100) / 100 })), total: Math.round(total * 100) / 100 }
}

export const chat = asyncHandler(async (req, res) => {
  const message = String(req.body.message || '').trim()
  if (!message) throw new ApiError(422, 'message is required')
  if (message.length > 500) throw new ApiError(422, 'message is too long (max 500 characters)')
  const language = ['en', 'ur', 'roman'].includes(req.body.language) ? req.body.language : 'en'
  const L = T[language]
  const lat = Number(req.body.lat), lng = Number(req.body.lng)
  const haveCoords = isValidCoord(lat, lng)
  const intent = parseIntent(message)

  const products = await findProducts(intent)
  let markets = []
  let marketNote = null
  if (intent.wantsMarkets || intent.wantsNearby || intent.wantsPickup) {
    const all = await Market.find({ isActive: true })
    if (haveCoords) {
      markets = all.filter((m) => m.lat != null && m.lng != null).map((m) => ({ id: String(m._id), name: m.name, location: m.location, openingTime: m.openingTime, closingTime: m.closingTime, operatingDays: m.operatingDays, distanceKm: haversineKm(lat, lng, m.lat, m.lng) })).sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 5)
      if (!markets.length) marketNote = L.noMarkets
    } else {
      markets = all.slice(0, 5).map((m) => ({ id: String(m._id), name: m.name, location: m.location, openingTime: m.openingTime, closingTime: m.closingTime, operatingDays: m.operatingDays }))
      if (intent.wantsNearby) marketNote = L.noCoords
    }
  }

  let basket = null
  let shown = products.slice(0, 6).map(sym)
  if (intent.budget && products.length) { basket = buildBasket(products, intent.budget); shown = basket.items }

  // ---- Deterministic, data-only reply ----
  const lines = []
  if (basket) lines.push(basket.items.length ? L.basket(intent.budget, basket.total) : L.none)
  else if (shown.length) lines.push(L.found(shown.length))
  else if (!markets.length) lines.push(`${L.none} ${L.help}`)
  for (const p of shown) lines.push(`• ${p.name} — Rs ${p.price}/${p.unit}${basket ? ` × ${p.quantity}` : ''} (${p.stock} ${p.unit} in stock${p.market ? `, ${p.market.name}` : ''})`)
  if (markets.length) { lines.push(L.markets); for (const m of markets) lines.push(`• ${m.name}${m.distanceKm != null ? ` — ${m.distanceKm} km` : ''} — ${L.hours}: ${m.openingTime}–${m.closingTime}${m.operatingDays?.length ? ` (${m.operatingDays.join(', ')})` : ''}`) }
  if (marketNote) lines.push(marketNote)
  const fallbackReply = lines.join('\n')

  const provider = aiProvider()
  let reply = fallbackReply, mode = 'database'
  if (provider) {
    const llm = await askLLM({ system: 'You are the MarketLink shopping assistant for a local farmers marketplace (prices in PKR, pay on pickup).', user: `Customer question: ${message}\n\nMarketLink data (JSON):\n${JSON.stringify({ products: shown, markets, basket: basket ? { total: basket.total, budget: intent.budget } : null, note: marketNote })}`, language })
    if (llm) { reply = llm; mode = 'llm' }
  }

  if (req.user) {
    await ChatMessage.create([{ user: req.user._id, scope: 'customer', role: 'user', text: message }, { user: req.user._id, scope: 'customer', role: 'assistant', text: reply, meta: { mode } }])
  }
  success(res, {
    reply, mode, products: shown, markets, basket: basket ? { total: basket.total, budget: intent.budget } : null,
    aiConfigured: !!provider, setupNote: provider ? null : L.setup + ' Set ANTHROPIC_API_KEY or OPENAI_API_KEY on the server to enable the language model.',
    demo: false
  })
})

// ---------------- Farmer business assistant ----------------
export const farmerChat = asyncHandler(async (req, res) => {
  const message = String(req.body.message || '').trim()
  if (!message) throw new ApiError(422, 'message is required')
  if (message.length > 500) throw new ApiError(422, 'message is too long (max 500 characters)')
  const language = ['en', 'ur', 'roman'].includes(req.body.language) ? req.body.language : 'en'
  const farmer = await Farmer.findOne({ user: req.user._id })
  if (!farmer) throw new ApiError(404, 'Farmer profile not found')
  const since = new Date(Date.now() - 30 * 86400000)
  const [products, orders, forecast, waste] = await Promise.all([
    Product.find({ farmer: farmer._id, isActive: true }).select('name stock unit price lowStockThreshold discountPercent').lean(),
    Order.find({ farmer: farmer._id, createdAt: { $gte: since }, status: { $ne: 'cancelled' } }).select('total').lean(),
    demandForecast({ farmerId: farmer._id }), wasteAlerts({ farmerId: farmer._id })
  ])
  const revenue = Math.round(orders.reduce((s, o) => s + o.total, 0) * 100) / 100
  const low = products.filter((p) => p.stock <= p.lowStockThreshold)
  const facts = {
    last30Days: { orders: orders.length, revenue }, lowOrOutOfStock: low.map((p) => ({ name: p.name, stock: p.stock, unit: p.unit })),
    forecastNote: forecast.sufficientData ? forecast.disclaimer : 'Not enough order history for demand estimates yet.',
    topForecasts: forecast.forecasts.filter((f) => f.confidence !== 'insufficient_data').slice(0, 5).map((f) => ({ name: f.name, nextWeek: f.forecastNextWeek, suggestedStock: f.suggestedStock, currentStock: f.currentStock, confidence: f.confidence })),
    wasteAlerts: waste.alerts.slice(0, 5).map((a) => ({ name: a.name, stock: a.stock, suggestedDiscount: a.suggestedDiscount, reasons: a.reasons.map((r) => r.detail) }))
  }
  const t = message.toLowerCase()
  const parts = []
  if (/stock|restock|inventory|low/.test(t) || !/demand|forecast|sales|revenue|waste|discount|expire|unsold/.test(t)) parts.push(low.length ? `Low or out of stock: ${low.map((p) => `${p.name} (${p.stock} ${p.unit})`).join(', ')}.` : 'None of your products are below their low-stock threshold.')
  if (/demand|forecast|restock|how much/.test(t)) parts.push(facts.topForecasts.length ? `Estimated demand next week (estimate, not a guarantee): ${facts.topForecasts.map((f) => `${f.name} ≈ ${f.nextWeek}, suggested stock ${f.suggestedStock}`).join('; ')}.` : facts.forecastNote)
  if (/sales|revenue|orders|how am i/.test(t)) parts.push(`In the last 30 days you had ${orders.length} order(s) worth Rs ${revenue}.`)
  if (/waste|discount|unsold|excess|promot/.test(t)) parts.push(facts.wasteAlerts.length ? `Stock at risk: ${facts.wasteAlerts.map((a) => `${a.name} (${a.stock} left, consider ${a.suggestedDiscount}% off)`).join('; ')}.` : 'No products are currently flagged as at risk of going unsold.')
  const fallback = parts.join('\n')
  let reply = fallback, mode = 'database'
  if (aiProvider()) {
    const llm = await askLLM({ system: 'You are a business assistant for a farmer selling on MarketLink. Give short practical advice.', user: `Farmer question: ${message}\n\nData (JSON):\n${JSON.stringify(facts)}`, language })
    if (llm) { reply = llm; mode = 'llm' }
  }
  await ChatMessage.create([{ user: req.user._id, scope: 'farmer', role: 'user', text: message }, { user: req.user._id, scope: 'farmer', role: 'assistant', text: reply, meta: { mode } }])
  success(res, { reply, mode, facts, aiConfigured: !!aiProvider(), setupNote: aiProvider() ? null : 'AI language model is not configured; answers come directly from your MarketLink data. Set ANTHROPIC_API_KEY or OPENAI_API_KEY to enable it.' })
})

export const history = asyncHandler(async (req, res) => {
  const scope = req.query.scope === 'farmer' ? 'farmer' : 'customer'
  const messages = await ChatMessage.find({ user: req.user._id, scope }).sort({ createdAt: -1 }).limit(60)
  success(res, { messages: messages.reverse() })
})
export const clearHistory = asyncHandler(async (req, res) => {
  await ChatMessage.deleteMany({ user: req.user._id, scope: req.query.scope === 'farmer' ? 'farmer' : 'customer' })
  success(res, null, 'History cleared')
})
