  // The UI (ProductCard, FarmerCard, MarketCard, etc.) was originally built
  // against static mock data shaped like { id, images:[...], farmer:{id,name} }.
  // The real API returns Mongo documents shaped like { _id, images:[...],
  // farmer:{_id, businessName, ...} }. Rather than rewrite every component,
  // these functions adapt the real API response into the same shape the UI
  // already knows how to render, so pages can switch from mock data to real
  // data by changing only where they fetch from.

  // Missing images stay EMPTY here; <AppImage>/<ProductImage>/... then show a local placeholder.
  // (Previously this injected paths to placeholder files that did not exist.)

  export function normalizeProduct(p) {
    if (!p) return null
    const farmer = p.farmer && typeof p.farmer === 'object'
      ? { id: p.farmer._id || p.farmer.id, name: p.farmer.businessName || p.farmer.name, rating: p.farmer.rating, image: p.farmer.profileImage }
      : { id: p.farmer, name: '' }
    const market = p.market && typeof p.market === 'object'
      ? { id: p.market._id || p.market.id, name: p.market.name, location: p.market.location }
      : p.market ? { id: p.market, name: '' } : null
    return {
      ...p,
      id: p._id || p.id,
      images: p.images?.length ? p.images : [],
      farmer,
      farmerId: farmer.id,
      market,
      marketId: market?.id,
      available: p.availability ? p.availability !== 'out_of_stock' : (p.stock ?? 0) > 0,
      reviewCount: p.reviewCount ?? 0
    }
  }

  export function normalizeFarmer(f) {
    if (!f) return null
    const market = f.market && typeof f.market === 'object' ? { id: f.market._id || f.market.id, name: f.market.name } : null
    return {
      ...f,
      id: f._id || f.id,
      name: f.user?.name || f.name || f.businessName,
      farm: f.businessName,
      specialty: f.categories?.[0] || f.specialty || '',
      marketId: market?.id,
      marketName: market?.name || '',
      location: f.location || '',
      rating: f.rating ?? 0,
      image: f.profileImage || f.user?.avatar || '',
      farmImage: f.farmImage || ''
    }
  }

  export function normalizeMarket(m) {
    if (!m) return null
    return {
      ...m,
      id: m._id || m.id,
      // marketUtils.js checks `status === 'active'` (a holdover from the
      // original mock data); the real API's Market.status enum uses 'open'.
      status: m.status === 'open' ? 'active' : m.status,
      hours: { open: m.openingTime, close: m.closingTime, days: m.operatingDays || [] },
      coordinates: m.lat != null && m.lng != null ? { lat: m.lat, lng: m.lng } : null,
      // Not tracked by the real Market model yet (no live geolocation /
      // aggregate rating pipeline) — neutral defaults so the distance/rating
      // filters don't throw, though they won't meaningfully filter until
      // those are added server-side.
      distanceKm: m.distanceKm ?? null,
      rating: m.rating ?? null,
      image: m.image || '',
      gallery: m.image ? [m.image] : []
    }
  }

  export function normalizeOrder(o) {
    if (!o) return null
    return { ...o, id: o._id || o.id }
  }

  export function normalizeReview(r) {
    if (!r) return null
    return { ...r, id: r._id || r.id, author: r.user?.name || r.author || 'Anonymous' }
  }

  export function normalizeNotification(n) {
    if (!n) return null
    return { ...n, id: n._id || n.id }
  }

  export const normalizeList = (list, fn) => (Array.isArray(list) ? list.map(fn) : [])
