// Central place for image paths and URL resolution.
// Static images live in client/public/images (served by Vite/Vercel at /images/...).
// Dynamic images (products, farmers, markets) are stored on the backend and referenced by a relative path
// such as /uploads/images/products/x.jpg. We resolve those against the API origin instead of hardcoding hosts.

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
export const API_ORIGIN = (import.meta.env.VITE_UPLOADS_URL || API.replace(/\/api\/?$/, '')).replace(/\/$/, '')

export const PLACEHOLDERS = {
  product: '/images/placeholders/product.svg',
  farmer: '/images/placeholders/farmer.svg',
  market: '/images/placeholders/market.svg',
  avatar: '/images/placeholders/avatar.svg',
  generic: '/images/placeholders/generic.svg'
}

// Static assets that exist in the project today (checked against client/public/images).
export const STATIC_IMAGES = {
  authFarm: '/images/auth/auth-farm.jpg',
  authMarket: '/images/auth/auth-market.jpg',
  storyFarmFresh: '/images/story/farm-fresh.jpg',
  storyFarmerPortrait: '/images/story/farmer-portrait.jpg',
  storyFreshProduce: '/images/story/fresh-produce.jpg',
  storyMarketCommunity: '/images/story/market-community.jpg',
  storyProductCollection: '/images/story/product-collection.jpg'
}

/** Turns whatever the API stored into a loadable URL. Empty/invalid values return '' (caller shows a placeholder). */
export function resolveImageUrl(src) {
  if (!src || typeof src !== 'string') return ''
  const s = src.trim()
  if (!s) return ''
  if (/^(https?:)?\/\//i.test(s) || s.startsWith('data:') || s.startsWith('blob:')) return s
  if (s.startsWith('/uploads/')) return `${API_ORIGIN}${s}`
  if (s.startsWith('uploads/')) return `${API_ORIGIN}/${s}`
  return s.startsWith('/') ? s : `/${s}`
}
export const placeholderFor = (kind = 'generic') => PLACEHOLDERS[kind] || PLACEHOLDERS.generic
