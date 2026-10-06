import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import * as orderService from '../services/orderService.js'
import { useAuth } from './AuthContext.jsx'

// OrderContext now talks to the real API. Orders are never stored in localStorage and there is no mock seed.
// `toUiOrder` adapts the API order to the shape the order pages already render.

const OrderContext = createContext(null)

export function toUiOrder(o) {
  if (!o) return null
  return {
    id: o._id || o.id,
    orderNumber: o.orderNumber,
    checkoutGroup: o.checkoutGroup,
    createdAt: o.createdAt,
    status: o.status,
    statusHistory: o.statusHistory || [],
    farmer: o.farmer && typeof o.farmer === 'object' ? { id: o.farmer._id, name: o.farmer.businessName, phone: o.farmer.phone, location: o.farmer.location } : { id: o.farmer },
    items: (o.items || []).map((i) => ({
      productId: i.product?._id || i.product, name: i.name, price: i.price, listPrice: i.listPrice, discountPercent: i.discountPercent,
      unit: i.unit, quantity: i.quantity, image: i.image || i.product?.images?.[0] || '', farmerId: i.farmer, subtotal: i.subtotal
    })),
    subtotal: o.subtotal, total: o.total,
    pickup: { date: o.pickupDate, time: o.pickupTime || 'Any time during market hours', marketName: o.pickupLocation || o.farmer?.location || o.farmer?.businessName || 'Pickup point' },
    notes: o.notes,
    pickupVerifiedAt: o.pickupVerifiedAt,
    paymentMethod: o.paymentStatus === 'paid' ? 'Paid at pickup' : 'Pay at Pickup'
  }
}

export function OrderProvider({ children }) {
  const { isAuthenticated, user } = useAuth()
  const isCustomer = isAuthenticated && user?.role === 'customer'
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const loaded = useRef(false)

  const refresh = useCallback(async () => {
    if (!isCustomer) { setOrders([]); return }
    setLoading(!loaded.current); setError('')
    try {
      const res = await orderService.getOrders()
      setOrders((res.data?.orders || []).map(toUiOrder)); loaded.current = true
    } catch (e) { setError(e.message || 'Could not load your orders.') } finally { setLoading(false) }
  }, [isCustomer])

  useEffect(() => { loaded.current = false; refresh() }, [refresh])

  // Live updates: the notification stream announces order changes; refresh when one arrives.
  useEffect(() => {
    const on = (e) => { if (['order', 'pickup'].includes(e.detail?.type)) refresh() }
    window.addEventListener('marketlink:notification', on)
    return () => window.removeEventListener('marketlink:notification', on)
  }, [refresh])

  // `payload` is the checkout request body. Returns the created UI orders. Throws with the server's message.
  const createOrder = useCallback(async (payload) => {
    const res = await orderService.createOrder(payload)
    const created = (res.data?.orders || [res.data?.order]).filter(Boolean).map(toUiOrder)
    setOrders((prev) => [...created, ...prev.filter((p) => !created.some((c) => c.id === p.id))])
    return created
  }, [])

  const fetchOrder = useCallback(async (id) => {
    const res = await orderService.getOrder(id)
    const ui = toUiOrder(res.data.order)
    setOrders((prev) => (prev.some((o) => o.id === ui.id) ? prev.map((o) => (o.id === ui.id ? ui : o)) : [ui, ...prev]))
    return ui
  }, [])

  const cancelOrder = useCallback(async (id) => {
    const res = await orderService.cancelOrder(id)
    const ui = toUiOrder(res.data.order)
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: ui.status, statusHistory: ui.statusHistory } : o)))
    return ui
  }, [])

  const getOrderById = useCallback((id) => orders.find((o) => o.id === id), [orders])
  const getOrders = useCallback(() => orders, [orders])

  const value = useMemo(() => ({ orders, loading, error, refresh, createOrder, fetchOrder, cancelOrder, getOrderById, getOrders }), [orders, loading, error, refresh, createOrder, fetchOrder, cancelOrder, getOrderById, getOrders])
  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

export function useOrders() {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error('useOrders must be used within an OrderProvider')
  return ctx
}
