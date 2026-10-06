import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { API_TO_LABEL, LABEL_TO_API } from '../data/farmerOrders.js'
import * as productService from '../services/productService.js'
import * as orderService from '../services/orderService.js'
import * as farmerService from '../services/farmerService.js'
import * as insight from '../services/insightService.js'
import * as reviewService from '../services/reviewService.js'
import { api } from '../services/api.js'
import { useAuth } from './AuthContext.jsx'

// FarmerContext is the farmer portal's data layer. It is backed by the real API; nothing is seeded or
// persisted locally. Adapters keep the shapes the existing farmer pages already render.

const FarmerContext = createContext(null)
const EMPTY_PROFILE = { id: '', name: '', email: '', phone: '', avatar: '', farmName: '', farmDescription: '', specialty: '', location: '', marketId: '', marketName: '', bio: '', stallNumber: '' }

const toUiProduct = (p) => ({
  id: p._id, name: p.name, category: p.category, description: p.description, price: p.price, unit: p.unit, stock: p.stock,
  available: p.stock > 0 && p.availability !== 'out_of_stock', images: p.images || [], rating: p.rating || 0, reviewCount: p.reviewCount || 0,
  updatedAt: p.updatedAt, discountPercent: p.discountPercent || 0, lowStockThreshold: p.lowStockThreshold, tags: [], farmerId: p.farmer
})
const toUiOrder = (o) => ({
  id: o._id, orderNumber: o.orderNumber, customer: o.customer?.name || 'Customer', customerPhone: o.customer?.phone,
  createdAt: o.createdAt, status: API_TO_LABEL[o.status] || o.status, apiStatus: o.status, statusHistory: o.statusHistory || [],
  items: (o.items || []).map((i) => ({ productId: i.product?._id || i.product, name: i.name, quantity: i.quantity, unit: i.unit, price: i.price, image: i.image || i.product?.images?.[0] || '' })),
  subtotal: o.subtotal, total: o.total, notes: o.notes,
  pickup: { date: o.pickupDate, time: o.pickupTime || 'Any time', marketName: o.pickupLocation || '' }
})
const toUiReview = (r) => ({ id: r._id, customer: r.user?.name || 'Customer', rating: r.rating, date: (r.createdAt || '').slice(0, 10), product: r.product?.name || '', text: r.comment || '', title: r.title || '', verified: !!r.verifiedPurchase, reply: r.farmerReply?.text || null })

export function FarmerProvider({ children }) {
  const { isAuthenticated, user } = useAuth()
  const active = isAuthenticated && user?.role === 'farmer'
  const [profile, setProfile] = useState(EMPTY_PROFILE)
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [slots, setSlots] = useState([])
  const [reviews, setReviews] = useState([])
  const [sales, setSales] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [status, setStatus] = useState({ loading: false, error: '' })

  const reload = useCallback(async () => {
    if (!active) return
    setStatus({ loading: true, error: '' })
    try {
      const [dash, prods, ords, sl, rev, an] = await Promise.all([
        farmerService.getFarmerDashboard(), api('/farmers/me/products?limit=100'), orderService.getOrders({ limit: 100 }),
        insight.getMySlots(), api('/reviews/farmer/me'), insight.farmerAnalytics(30)
      ])
      const f = dash.data.farmer
      setProfile({ ...EMPTY_PROFILE, id: f._id, name: user.name, email: user.email, phone: f.phone || user.phone || '', avatar: f.profileImage || user.avatar || '', farmImage: f.farmImage || '', farmName: f.businessName, farmDescription: f.description || '', specialty: f.categories?.[0] || '', location: f.location || '', marketId: f.market || '', bio: f.description || '', verificationStatus: f.verificationStatus })
      setProducts(prods.data.items.map(toUiProduct))
      setOrders(ords.data.orders.map(toUiOrder))
      setSlots(sl.data.slots.map((s) => ({ id: s._id, day: s.day, start: s.start, end: s.end, capacity: s.capacity, active: s.active })))
      setReviews(rev.data.reviews.map(toUiReview))
      // continuous 30-day series so "today" is always the last point
      const byDate = Object.fromEntries(an.data.salesByDay.map((d) => [d.date, d]))
      const series = Array.from({ length: 30 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (29 - i)); const k = d.toISOString().slice(0, 10); return { date: k, sales: byDate[k]?.amount || 0, orders: byDate[k]?.orders || 0 } })
      setSales(series); setTopProducts(an.data.topProducts.map((p) => ({ name: p.name, sales: p.revenue })))
      setStatus({ loading: false, error: '' })
    } catch (e) { setStatus({ loading: false, error: e.message || 'Could not load your farm data.' }) }
  }, [active, user?.name, user?.email, user?.phone, user?.avatar])

  useEffect(() => { reload() }, [reload])
  useEffect(() => {
    const on = (e) => { if (['order', 'stock', 'review'].includes(e.detail?.type)) reload() }
    window.addEventListener('marketlink:notification', on)
    return () => window.removeEventListener('marketlink:notification', on)
  }, [reload])

  // ---- Profile ----
  const getFarmerProfile = useCallback(() => profile, [profile])
  const updateFarmerProfile = useCallback(async (updates) => {
    const body = {}
    if (updates.farmName !== undefined) body.businessName = updates.farmName
    if (updates.farmDescription !== undefined) body.description = updates.farmDescription
    else if (updates.bio !== undefined) body.description = updates.bio
    if (updates.phone !== undefined) body.phone = updates.phone
    if (updates.location !== undefined) body.location = updates.location
    if (updates.avatar !== undefined) body.profileImage = updates.avatar
    if (updates.farmImage !== undefined) body.farmImage = updates.farmImage
    if (Object.keys(body).length) await api('/farmers/me/profile', { method: 'PUT', body })
    setProfile((p) => ({ ...p, ...updates }))
  }, [])

  // ---- Products ----
  const getProducts = useCallback(() => products, [products])
  const addProduct = useCallback(async (v) => {
    const res = await productService.createProduct({ name: v.name, category: v.category, description: v.description, price: v.price, unit: v.unit, stock: v.available === false ? 0 : v.stock, images: v.images })
    const ui = toUiProduct(res.data.product); setProducts((prev) => [ui, ...prev]); return ui
  }, [])
  const updateProduct = useCallback(async (id, v) => {
    const body = {}
    for (const k of ['name', 'category', 'description', 'price', 'unit', 'stock', 'images', 'discountPercent']) if (v[k] !== undefined) body[k] = v[k]
    if (v.available === false) body.stock = 0
    const res = await productService.updateProduct(id, body)
    const ui = toUiProduct(res.data.product); setProducts((prev) => prev.map((p) => (p.id === id ? ui : p))); return ui
  }, [])
  const deleteProduct = useCallback(async (id) => { await productService.deleteProduct(id); setProducts((prev) => prev.filter((p) => p.id !== id)) }, [])
  const updateStock = useCallback(async (id, newStock) => {
    const res = await insight.adjustStock(id, { stock: Math.max(0, Number(newStock)) })
    const ui = toUiProduct(res.data.product); setProducts((prev) => prev.map((p) => (p.id === id ? ui : p))); return ui
  }, [])

  // ---- Orders ----
  const getOrders = useCallback(() => orders, [orders])
  const updateOrderStatus = useCallback(async (id, nextLabel) => {
    const apiStatus = LABEL_TO_API[nextLabel]
    if (!apiStatus) return { success: false, reason: 'invalid-transition' }
    try {
      const res = await orderService.updateOrderStatus(id, apiStatus)
      const ui = toUiOrder(res.data.order); setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: ui.status, apiStatus: ui.apiStatus, statusHistory: ui.statusHistory } : o)))
      return { success: true }
    } catch (e) { return { success: false, reason: e.message } }
  }, [])
  const verifyPickup = useCallback(async (id, code) => {
    const res = await insight.verifyPickup(id, code)
    const ui = toUiOrder(res.data.order); setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: ui.status, apiStatus: ui.apiStatus, statusHistory: ui.statusHistory } : o)))
    return ui
  }, [])

  // ---- Pickup slots (weekly schedule) ----
  const getPickupSlots = useCallback(() => slots, [slots])
  const savePickupSlots = useCallback(async (next) => {
    const res = await insight.setMySlots(next.map((s) => ({ day: s.day, start: s.start, end: s.end, capacity: Number(s.capacity), active: s.active !== false })))
    setSlots(res.data.slots.map((s) => ({ id: s._id, day: s.day, start: s.start, end: s.end, capacity: s.capacity, active: s.active })))
  }, [])

  // ---- Reviews ----
  const getReviews = useCallback(() => reviews, [reviews])
  const replyToReview = useCallback(async (id, text) => { await reviewService.replyToReview(id, text); setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, reply: text } : r))) }, [])

  // ---- Sales (real aggregates) ----
  const getSales = useCallback(() => sales, [sales])
  const getTopProducts = useCallback(() => topProducts, [topProducts])

  const value = useMemo(() => ({ status, reload, getFarmerProfile, updateFarmerProfile, getProducts, addProduct, updateProduct, deleteProduct, updateStock, getOrders, updateOrderStatus, verifyPickup, getPickupSlots, savePickupSlots, getReviews, replyToReview, getSales, getTopProducts }),
    [status, reload, getFarmerProfile, updateFarmerProfile, getProducts, addProduct, updateProduct, deleteProduct, updateStock, getOrders, updateOrderStatus, verifyPickup, getPickupSlots, savePickupSlots, getReviews, replyToReview, getSales, getTopProducts])
  return <FarmerContext.Provider value={value}>{children}</FarmerContext.Provider>
}

export function useFarmer() {
  const ctx = useContext(FarmerContext)
  if (!ctx) throw new Error('useFarmer must be used within a FarmerProvider')
  return ctx
}
