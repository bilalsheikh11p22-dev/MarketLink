import Product from '../models/Product.js'
import Market from '../models/Market.js'
import { demandForecast } from './forecast.js'

function minutes(hhmm = '00:00') { const [h, m] = hhmm.split(':').map(Number); return h * 60 + (m || 0) }

/**
 * Flags stock at risk of going unsold. Rules (all explicit, no invented numbers):
 *  - excess: stock > 2x forecast weekly demand (needs forecast with enough data), or
 *            stock > 0 with zero sales in history while product is old enough (>14 days)
 *  - low_demand: forecast exists and is less than 25% of current stock
 *  - closing_soon: the market closes within 3h today and stock remains
 * Suggested discount tiers: excess 15%, low_demand 20%, closing_soon 25% (farmer decides).
 */
export async function wasteAlerts({ farmerId } = {}) {
  const filter = { isActive: true, status: 'published', stock: { $gt: 0 } }
  if (farmerId) filter.farmer = farmerId
  const products = await Product.find(filter).populate('market', 'name closingTime openingTime operatingDays').lean()
  const fc = await demandForecast({ farmerId })
  const byId = Object.fromEntries(fc.forecasts.map((f) => [f.productId, f]))
  const now = new Date()
  const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()]
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const alerts = []
  for (const p of products) {
    const f = byId[String(p._id)]
    const reasons = []
    let suggestedDiscount = 0
    if (f && f.confidence !== 'insufficient_data' && p.stock > Math.max(2 * f.forecastNextWeek, 1)) {
      reasons.push({ type: 'excess', detail: `Stock ${p.stock} ${p.unit} is more than twice the estimated weekly demand (${f.forecastNextWeek}).` }); suggestedDiscount = Math.max(suggestedDiscount, 15)
    }
    if (f && f.confidence !== 'insufficient_data' && f.forecastNextWeek < 0.25 * p.stock) {
      reasons.push({ type: 'low_demand', detail: `Estimated weekly demand (${f.forecastNextWeek}) is under 25% of stock.` }); suggestedDiscount = Math.max(suggestedDiscount, 20)
    }
    if (!f && Date.now() - new Date(p.createdAt).getTime() > 14 * 86400000) {
      reasons.push({ type: 'no_sales', detail: 'Listed for over 14 days with no recorded sales.' }); suggestedDiscount = Math.max(suggestedDiscount, 20)
    }
    const m = p.market
    if (m?.closingTime && (!m.operatingDays?.length || m.operatingDays.includes(dayName))) {
      const left = minutes(m.closingTime) - nowMin
      if (left > 0 && left <= 180) { reasons.push({ type: 'closing_soon', detail: `${m.name} closes in about ${Math.round(left / 60 * 10) / 10}h and ${p.stock} ${p.unit} remain.` }); suggestedDiscount = Math.max(suggestedDiscount, 25) }
    }
    if (reasons.length) alerts.push({ productId: String(p._id), name: p.name, unit: p.unit, stock: p.stock, price: p.price, discountPercent: p.discountPercent || 0, images: p.images, reasons, suggestedDiscount })
  }
  return { rules: 'See service docs: excess (>2x weekly forecast), low demand (<25% of stock), no sales for 14+ days, market closing within 3h.', alerts }
}

export async function marketList() { return Market.find({ isActive: true }).lean() }
