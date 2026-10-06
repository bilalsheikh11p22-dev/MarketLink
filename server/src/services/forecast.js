import Order from '../models/Order.js'
import Product from '../models/Product.js'
import { weightedMA } from './forecastMath.js'

const WEEK = 7 * 24 * 3600 * 1000
/**
 * Transparent demand estimate (NOT a machine-learning model):
 * weekly units sold per product from non-cancelled orders over the last `weeks` weeks,
 * forecast = weighted moving average (recent weeks weigh more).
 * Confidence depends on how many weeks contain sales. With <3 weeks of history the
 * result is flagged `insufficient_data` instead of pretending to be a prediction.
 */
export async function demandForecast({ farmerId, marketId, weeks = 8 } = {}) {
  const since = new Date(Date.now() - weeks * WEEK)
  const match = { createdAt: { $gte: since }, status: { $ne: 'cancelled' } }
  if (farmerId) match['items.farmer'] = farmerId
  const orders = await Order.find(match).select('items createdAt').lean()
  const perProduct = new Map()
  for (const o of orders) {
    const weekIdx = Math.min(weeks - 1, Math.floor((Date.now() - new Date(o.createdAt).getTime()) / WEEK))
    for (const it of o.items) {
      if (farmerId && String(it.farmer) !== String(farmerId)) continue
      if (marketId && String(it.market) !== String(marketId)) continue
      const key = String(it.product)
      if (!perProduct.has(key)) perProduct.set(key, new Array(weeks).fill(0))
      perProduct.get(key)[weekIdx] += it.quantity
    }
  }
  const ids = [...perProduct.keys()]
  const products = await Product.find({ _id: { $in: ids } }).select('name unit stock category lowStockThreshold').lean()
  const byId = Object.fromEntries(products.map((p) => [String(p._id), p]))
  const rows = []
  for (const [id, buckets] of perProduct) {
    const p = byId[id]; if (!p) continue
    // buckets[0] = most recent week. Weights: 1/(i+1)
    const forecast = Math.round(weightedMA(buckets) * 10) / 10
    const weeksWithSales = buckets.filter((q) => q > 0).length
    const confidence = weeksWithSales >= 6 ? 'medium' : weeksWithSales >= 3 ? 'low' : 'insufficient_data'
    // Back-test: predict the most recent week from the earlier ones and report the error, if enough history.
    let accuracy = null
    if (weeksWithSales >= 4) {
      const predicted = weightedMA(buckets.slice(1)), actual = buckets[0]
      accuracy = { predicted: Math.round(predicted * 10) / 10, actual, absoluteError: Math.round(Math.abs(predicted - actual) * 10) / 10 }
    }
    rows.push({
      productId: id, name: p.name, unit: p.unit, category: p.category, currentStock: p.stock,
      weeklyHistory: [...buckets].reverse(), forecastNextWeek: forecast,
      suggestedStock: confidence === 'insufficient_data' ? null : Math.ceil(forecast * 1.15),
      confidence, accuracy
    })
  }
  rows.sort((a, b) => b.forecastNextWeek - a.forecastNextWeek)
  return {
    method: 'Weighted moving average of weekly units sold (recent weeks weigh more). Suggested stock = forecast + 15% buffer.',
    disclaimer: 'Estimate based only on this platform\'s order history. It is not a guarantee of demand.',
    weeksAnalysed: weeks, ordersAnalysed: orders.length,
    sufficientData: rows.some((r) => r.confidence !== 'insufficient_data'),
    forecasts: rows
  }
}

/** Day-of-week demand index (share of units by weekday) for seasonal/weekly pattern insight. */
export async function weekdayPattern({ farmerId } = {}) {
  const match = { status: { $ne: 'cancelled' } }
  if (farmerId) match['items.farmer'] = farmerId
  const orders = await Order.find(match).select('items createdAt').lean()
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const totals = new Array(7).fill(0)
  for (const o of orders) for (const it of o.items) {
    if (farmerId && String(it.farmer) !== String(farmerId)) continue
    totals[new Date(o.createdAt).getDay()] += it.quantity
  }
  const sum = totals.reduce((a, b) => a + b, 0)
  return days.map((d, i) => ({ day: d, units: totals[i], share: sum ? Math.round((totals[i] / sum) * 1000) / 10 : 0 }))
}
