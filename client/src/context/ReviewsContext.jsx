import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import * as svc from '../services/reviewService.js'
import { summarizeRatings } from '../utils/reviewStats.js'

// Reviews now come from the API. Nothing is seeded or stored locally.
// `toUiReview` adapts the API review to the shape ReviewCard/ReviewsSection already render.

const ReviewsContext = createContext(null)

function toUiReview(r) {
  return {
    id: r._id,
    productId: r.product?._id || r.product,
    productName: r.product?.name,
    farmerId: r.farmer?._id || r.farmer,
    customerId: r.user?._id || r.user,
    customerName: r.user?.name || 'Customer',
    customerAvatar: r.user?.avatar || null,
    rating: r.rating,
    title: r.title || '',
    text: r.comment || '',
    date: (r.createdAt || '').slice(0, 10),
    verifiedPurchase: !!r.verifiedPurchase,
    edited: !!r.edited,
    status: r.status,
    reply: r.farmerReply?.text ? { text: r.farmerReply.text, date: (r.farmerReply.at || '').slice(0, 10), edited: false } : null,
    images: []
  }
}

export function ReviewsProvider({ children }) {
  const [byProduct, setByProduct] = useState({})   // { [productId]: { items, loaded } }
  const [byFarmer, setByFarmer] = useState({})
  const [mine, setMine] = useState({ items: [], loaded: false })

  const loadProductReviews = useCallback(async (productId) => {
    try { const res = await svc.productReviews(productId); setByProduct((m) => ({ ...m, [productId]: { items: res.data.reviews.map(toUiReview), loaded: true } })) }
    catch { setByProduct((m) => ({ ...m, [productId]: { items: m[productId]?.items || [], loaded: true, error: true } })) }
  }, [])
  const loadFarmerReviews = useCallback(async (farmerId) => {
    try { const res = await svc.farmerReviewsPublic(farmerId); setByFarmer((m) => ({ ...m, [farmerId]: { items: res.data.reviews.map(toUiReview), loaded: true } })) }
    catch { setByFarmer((m) => ({ ...m, [farmerId]: { items: m[farmerId]?.items || [], loaded: true, error: true } })) }
  }, [])
  const loadMine = useCallback(async () => {
    try { const res = await svc.myReviews(); setMine({ items: res.data.reviews.map(toUiReview), loaded: true }) } catch { setMine((m) => ({ ...m, loaded: true })) }
  }, [])

  const getReviewsForProduct = useCallback((id) => byProduct[id]?.items ?? [], [byProduct])
  const getReviewsForFarmer = useCallback((id) => byFarmer[id]?.items ?? [], [byFarmer])
  const getReviewsByCustomer = useCallback(() => mine.items, [mine])
  const isLoaded = useCallback((kind, id) => Boolean((kind === 'product' ? byProduct : byFarmer)[id]?.loaded), [byProduct, byFarmer])
  const getReply = useCallback((reviewId) => {
    for (const bucket of [byProduct, byFarmer]) for (const k of Object.keys(bucket)) { const r = bucket[k].items.find((x) => x.id === reviewId); if (r) return r.reply }
    return mine.items.find((x) => x.id === reviewId)?.reply ?? null
  }, [byProduct, byFarmer, mine])

  // All ratings come from real reviews, so the summary is computed from the list itself (no invented distribution).
  const getSummary = useCallback((_avg, _count, list) => summarizeRatings(0, 0, list.map((r) => r.rating)), [])

  const patchEverywhere = (id, fn) => {
    const apply = (m) => Object.fromEntries(Object.entries(m).map(([k, v]) => [k, { ...v, items: v.items.map((r) => (r.id === id ? fn(r) : r)) }]))
    setByProduct(apply); setByFarmer(apply); setMine((m) => ({ ...m, items: m.items.map((r) => (r.id === id ? fn(r) : r)) }))
  }

  /** Returns { review, flagged }. The server decides verifiedPurchase and any moderation hold. */
  const addReview = useCallback(async ({ productId, rating, title, text }) => {
    const res = await svc.createReview({ productId, rating, title, comment: text })
    await Promise.all([loadProductReviews(productId), loadMine()])
    return { review: toUiReview(res.data.review), flagged: !!res.data.flagged, verified: !!res.data.review.verifiedPurchase }
  }, [loadProductReviews, loadMine])

  const updateReview = useCallback(async (id, { rating, title, text }) => {
    const res = await svc.updateReview(id, { rating, title, comment: text })
    const ui = toUiReview(res.data.review)
    patchEverywhere(id, (r) => ({ ...r, ...ui, reply: r.reply }))
    return { flagged: !!res.data.flagged }
  }, [])

  const deleteReview = useCallback(async (id) => {
    await svc.deleteReview(id)
    const drop = (m) => Object.fromEntries(Object.entries(m).map(([k, v]) => [k, { ...v, items: v.items.filter((r) => r.id !== id) }]))
    setByProduct(drop); setByFarmer(drop); setMine((m) => ({ ...m, items: m.items.filter((r) => r.id !== id) }))
  }, [])

  const saveReply = useCallback(async (reviewId, text) => {
    const res = await svc.replyToReview(reviewId, text)
    patchEverywhere(reviewId, (r) => ({ ...r, reply: { text: res.data.review.farmerReply.text, date: (res.data.review.farmerReply.at || '').slice(0, 10), edited: false } }))
  }, [])
  const deleteReply = useCallback(async (reviewId) => { await svc.deleteReply(reviewId); patchEverywhere(reviewId, (r) => ({ ...r, reply: null })) }, [])

  const value = useMemo(() => ({ getReviewsForProduct, getReviewsForFarmer, getReviewsByCustomer, getReply, getSummary, addReview, updateReview, deleteReview, saveReply, deleteReply, loadProductReviews, loadFarmerReviews, loadMine, isLoaded }),
    [getReviewsForProduct, getReviewsForFarmer, getReviewsByCustomer, getReply, getSummary, addReview, updateReview, deleteReview, saveReply, deleteReply, loadProductReviews, loadFarmerReviews, loadMine, isLoaded])
  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>
}

export function useReviews() {
  const ctx = useContext(ReviewsContext)
  if (!ctx) throw new Error('useReviews must be used within a ReviewsProvider')
  return ctx
}
