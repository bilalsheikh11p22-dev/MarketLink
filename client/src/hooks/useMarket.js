import { useEffect, useState } from 'react'
import { getMarket } from '../services/marketService.js'
import { api } from '../services/api.js'
import { normalizeFarmer, normalizeList, normalizeMarket, normalizeProduct } from '../utils/normalize.js'

/** Loads one market (and optionally its farmers / products) from the API. */
export default function useMarket(id, { farmers = false, products = false } = {}) {
  const [state, setState] = useState({ market: null, farmers: [], products: [], loading: true, notFound: false, error: '' })
  useEffect(() => {
    let cancelled = false
    setState((s) => ({ ...s, loading: true, notFound: false, error: '' }))
    Promise.all([
      getMarket(id),
      farmers ? api(`/markets/${id}/farmers`) : null,
      products ? api(`/markets/${id}/products?limit=100`) : null
    ])
      .then(([m, f, p]) => {
        if (cancelled) return
        const fl = normalizeList(f?.data?.farmers, normalizeFarmer)
        const pl = normalizeList(p?.data?.items, normalizeProduct)
        const market = normalizeMarket(m.data.market)
        setState({
          market: { ...market, farmersCount: farmers ? fl.length : undefined, productsCount: products ? (p.data.pagination?.total ?? pl.length) : undefined },
          farmers: fl, products: pl, loading: false, notFound: false, error: ''
        })
      })
      .catch((e) => { if (!cancelled) setState({ market: null, farmers: [], products: [], loading: false, notFound: e.status === 404 || e.status === 422, error: e.message }) })
    return () => { cancelled = true }
  }, [id, farmers, products])
  return state
}
