// Pure helpers for the Market pages: time formatting, mock open/closed
// status, search + filter logic and the (API-free) directions URL.
// Nothing here touches React, so the same functions can be reused when
// the data starts coming from a backend.

import { AREA_COORDINATES } from '../data/markets.js'

// ---------------------------------------------------------------- clock
// Open/closed state always uses the visitor's real day and time.
export const USE_REAL_CLOCK = true
const MOCK_NOW = { day: 'Saturday', time: '10:30' }
const JS_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function getNow() {
  if (!USE_REAL_CLOCK) return MOCK_NOW
  const d = new Date()
  return {
    day: JS_DAYS[d.getDay()],
    time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }
}

// ---------------------------------------------------------------- time
function toMinutes(t) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

/** "14:00" -> "02:00 PM" */
export function formatTime(t) {
  const [h, m] = t.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`
}

export function formatHours(market) {
  return `${formatTime(market.openingTime)} – ${formatTime(market.closingTime)}`
}

export function formatOperatingDays(market) {
  const days = market.operatingDays || []
  if (days.length === 0) return 'Days not set'
  if (days.length === 7) return 'Every day'
  if (days.length >= 4) return `${days[0].slice(0, 3)} – ${days[days.length - 1].slice(0, 3)}`
  return days.map((d) => d.slice(0, 3)).join(' · ')
}

// ---------------------------------------------------------------- status
/** "Open Today" filter = the market trades on the given day. */
export function isOpenToday(market, day = getNow().day) {
  return market.status === 'active' && (market.operatingDays || []).some((d) => String(d).slice(0, 3).toLowerCase() === String(day).slice(0, 3).toLowerCase())
}

/** Detailed state used by the card/hours indicator. */
export function getMarketStatus(market, now = getNow()) {
  if (!isOpenToday(market, now.day)) return { state: 'closed', label: 'Closed today' }
  const mins = toMinutes(now.time)
  if (mins < toMinutes(market.openingTime)) return { state: 'opens-later', label: `Opens ${formatTime(market.openingTime)}` }
  if (mins >= toMinutes(market.closingTime)) return { state: 'closed', label: 'Closed for today' }
  return { state: 'open', label: 'Open now' }
}

// ---------------------------------------------------------------- filters
export const DEFAULT_FILTERS = {
  distance: 'any', // 'any' | 5 | 10 | 20      (single choice)
  days: [], //         weekday names            (multi choice -> OR)
  openStatus: 'all', // 'all' | 'open' | 'closed' (single choice)
  rating: 'all' //     'all' | 4 | 4.5          (single choice)
}

export function countActiveFilters(filters) {
  return (
    (filters.distance !== 'any' ? 1 : 0) +
    filters.days.length +
    (filters.openStatus !== 'all' ? 1 : 0) +
    (filters.rating !== 'all' ? 1 : 0)
  )
}

/** Case-insensitive, trimmed, partial match on name / location / address. */
export function matchesMarketQuery(market, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [market.name, market.location, market.address].some((field) => field.toLowerCase().includes(q))
}

/**
 * Applies search + location + every filter group. Different groups are
 * combined with AND; the operating-day group is multi-select so its own
 * values are combined with OR. Never mutates the input array.
 */
export function filterMarkets(markets, { query = '', location = 'Karachi', filters = DEFAULT_FILTERS } = {}) {
  const now = getNow()
  return markets.filter((m) => {
    if (!matchesMarketQuery(m, query)) return false
    if (location !== 'Karachi' && !String(m.location || '').toLowerCase().includes(location.toLowerCase())) return false
    if (filters.distance !== 'any' && !(m.distanceKm != null && m.distanceKm <= filters.distance)) return false
    if (filters.rating !== 'all' && !(m.rating >= filters.rating)) return false
    if (filters.days.length > 0 && !filters.days.some((d) => (m.operatingDays || []).some((x) => String(x).slice(0, 3).toLowerCase() === d.slice(0, 3).toLowerCase()))) return false
    if (filters.openStatus === 'open' && !isOpenToday(m, now.day)) return false
    if (filters.openStatus === 'closed' && isOpenToday(m, now.day)) return false
    return true
  })
}

export const PRODUCT_CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Herbs', 'Dairy', 'Grains']

/** Product search: name, category, farm name and the farmer's own name. */
export function matchesProductQuery(product, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [product.name, product.category, product.farmer?.name].some((f) =>
    (f || '').toLowerCase().includes(q)
  )
}

/** Exact category match ("All" disables the filter). */
export function matchesCategory(product, selectedCategory) {
  return selectedCategory === 'All' || product.category === selectedCategory
}

export function sortByDistance(markets) {
  return [...markets].sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
}

// ---------------------------------------------------------------- directions
/**
 * Future-ready external directions link. It is a plain URL (no API key,
 * no SDK) — swap the base for another provider whenever you like.
 */
export function getDirectionsUrl(market) {
  if (!market.coordinates) {
    const q = encodeURIComponent([market.name, market.address || market.location].filter(Boolean).join(', '))
    return `https://www.google.com/maps/search/?api=1&query=${q}`
  }
  const { lat, lng } = market.coordinates
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

export function formatCoordinates(c) {
  if (!c) return 'Not provided'
  const { lat, lng } = c
  return `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`
}

export { AREA_COORDINATES }
