import { useEffect, useState } from 'react'
import { api } from '../services/api.js'
import { normalizeFarmer, normalizeList, normalizeMarket, normalizeProduct } from '../utils/normalize.js'

let cache = null
/** Public catalogue (markets, farmers, products) from the API, cached for the session. */
export default function useCatalog() {
  const [state, setState] = useState(cache || { markets: [], farmers: [], products: [], loading: true, error: '' })
  useEffect(() => {
    if (cache) return
    let off = false
    Promise.all([api('/markets?limit=100'), api('/farmers?limit=100'), api('/products?limit=100')])
      .then(([m, f, p]) => {
        cache = {
          markets: normalizeList(m.data?.markets, normalizeMarket),
          farmers: normalizeList(f.data?.farmers || f.data?.items, normalizeFarmer),
          products: normalizeList(p.data?.items || p.data?.products, normalizeProduct),
          loading: false, error: ''
        }
        if (!off) setState(cache)
      })
      .catch((e) => { if (!off) setState({ markets: [], farmers: [], products: [], loading: false, error: e.message }) })
    return () => { off = true }
  }, [])
  return state
}
