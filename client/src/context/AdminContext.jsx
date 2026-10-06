import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api.js'
import { useAuth } from './AuthContext.jsx'
import { readJSON, writeJSON, isPlainObject, STORAGE_KEYS } from '../utils/storage.js'
import { resolveImageUrl } from '../config/images.js'

/**
 * Admin data layer. Everything is loaded from the API (no seeded/mock records) and adapted to the
 * shapes the admin pages already render. Every moderation action is a real, audited API call.
 */
const AdminContext = createContext(null)

const DEFAULT_SETTINGS = {
  appearance: 'light',
  notifications: { farmerApplications: true, reportedContent: true, newOrders: true, systemAlerts: true },
  dashboard: { showSalesChart: true, showUserChart: true, showOrderChart: true }
}

const day = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '')
const idOf = (v) => (v && typeof v === 'object' ? String(v._id || v.id || '') : v ? String(v) : '')

const toUser = (u) => ({
  id: idOf(u._id || u.id), name: u.name, email: u.email, phone: u.phone || '', role: u.role,
  status: u.isActive === false ? 'suspended' : 'active', avatar: resolveImageUrl(u.avatar) || '',
  city: u.city || '', joined: day(u.createdAt)
})
const toFarmer = (f) => ({
  id: idOf(f._id || f.id), userId: idOf(f.user), name: f.user?.name || f.businessName, farm: f.businessName,
  email: f.user?.email || '', phone: f.phone || '', marketId: idOf(f.market), marketName: f.market?.name || '',
  location: f.location || '', specialty: (f.categories || []).join(', '), rating: f.rating || 0,
  status: f.verificationStatus, joined: day(f.createdAt), image: resolveImageUrl(f.profileImage) || '',
  description: f.description || '', categories: f.categories || []
})
const toApplication = (f) => ({
  id: idOf(f._id || f.id), farmerId: idOf(f._id || f.id), name: f.user?.name || f.businessName, farm: f.businessName,
  email: f.user?.email || '', phone: f.phone || '', location: f.location || '', description: f.description || '',
  categories: f.categories || [], submittedAt: day(f.createdAt),
  status: f.verificationStatus === 'pending' ? 'pending' : f.verificationStatus === 'rejected' ? 'rejected' : 'approved',
  marketPreference: f.market?.name || 'Not chosen'
})
const toMarket = (m) => ({
  id: idOf(m._id || m.id), name: m.name, location: m.location || '', address: m.address || '',
  coordinates: m.lat != null && m.lng != null ? { lat: m.lat, lng: m.lng } : null,
  operatingDays: m.operatingDays || [], openingTime: m.openingTime, closingTime: m.closingTime,
  status: m.isActive === false ? 'suspended' : m.status || 'open', image: resolveImageUrl(m.image) || '', description: m.description || ''
})
const toProduct = (p) => ({
  id: idOf(p._id || p.id), name: p.name, category: p.category, price: p.price, unit: p.unit, stock: p.stock,
  farmerId: idOf(p.farmer), farmerName: p.farmer?.businessName || '', marketId: idOf(p.market), marketName: p.market?.name || '',
  status: p.status, availability: p.availability, description: p.description || '', image: resolveImageUrl(p.images?.[0]) || ''
})
const toOrder = (o) => ({
  id: idOf(o._id || o.id), orderNumber: o.orderNumber, customerId: idOf(o.customer), customerName: o.customer?.name || '',
  farmerId: idOf(o.farmer), farmerName: o.farmer?.businessName || '', status: o.status,
  items: (o.items || []).map((i) => ({ productId: idOf(i.product), name: i.name, qty: i.quantity, price: i.price })),
  itemCount: (o.items || []).reduce((s, i) => s + i.quantity, 0), amount: o.total,
  pickupDate: o.pickupDate || '', pickupTime: o.pickupTime || '', createdAt: o.createdAt
})

const loadSettings = () => {
  const s = readJSON(STORAGE_KEYS.adminSettings, null, isPlainObject)
  return s ? {
    appearance: s.appearance === 'dark' ? 'dark' : 'light',
    notifications: { ...DEFAULT_SETTINGS.notifications, ...(s.notifications || {}) },
    dashboard: { ...DEFAULT_SETTINGS.dashboard, ...(s.dashboard || {}) }
  } : DEFAULT_SETTINGS
}

const EMPTY = { users: [], farmers: [], applications: [], markets: [], products: [], orders: [], reviews: [], categories: [] }

export function AdminProvider({ children }) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [data, setData] = useState(EMPTY)
  const [status, setStatus] = useState('idle') // idle | loading | ready | error
  const [error, setError] = useState('')
  const [settings, setSettings] = useState(loadSettings)

  const refresh = useCallback(async () => {
    if (!isAdmin) return
    setStatus((s) => (s === 'ready' ? 'ready' : 'loading')); setError('')
    try {
      const get = (p) => api(p).then((r) => r.data)
      const [u, f, m, p, o, c] = await Promise.all([
        get('/admin/users?limit=100'), get('/admin/farmers?limit=100'), get('/markets?limit=100'),
        get('/admin/products?limit=100'), get('/admin/orders?limit=100'), get('/products/categories')
      ])
      const farmersRaw = f.farmers || []
      const products = (p.items || []).map(toProduct)
      const cats = Array.isArray(c?.categories) ? c.categories : Array.isArray(c) ? c : []
      const names = [...new Set([...cats.map((x) => (typeof x === 'string' ? x : x.name)), ...products.map((x) => x.category)].filter(Boolean))]
      setData({
        users: (u.users || []).map(toUser),
        farmers: farmersRaw.filter((x) => x.verificationStatus !== 'pending' && x.verificationStatus !== 'rejected').map(toFarmer),
        applications: farmersRaw.map(toApplication),
        markets: (m.markets || []).map(toMarket),
        products,
        orders: (o.orders || []).map(toOrder),
        reviews: [],
        categories: names.map((name) => ({ id: name, name, slug: name.toLowerCase().replace(/\s+/g, '-'), productCount: products.filter((x) => x.category === name).length, status: 'active' }))
      })
      setStatus('ready')
    } catch (e) { setError(e.message || 'Failed to load admin data'); setStatus('error') }
  }, [isAdmin])

  useEffect(() => { refresh() }, [refresh])

  const act = useCallback(async (fn) => { await fn(); await refresh() }, [refresh])
  const putUser = (id, body) => act(() => api(`/admin/users/${id}`, { method: 'PUT', body }))
  const putFarmer = (id, verificationStatus) => act(() => api(`/admin/farmers/${id}`, { method: 'PUT', body: { verificationStatus } }))
  const putProduct = (id, body) => act(() => api(`/products/${id}`, { method: 'PUT', body }))
  const putMarket = (id, body) => act(() => api(`/markets/${id}`, { method: 'PUT', body }))

  const value = useMemo(() => ({
    ...data, settings, status, error, refresh,
    approveFarmer: (id) => putFarmer(id, 'approved'),
    rejectFarmer: (id) => putFarmer(id, 'rejected'),
    suspendFarmer: (id) => putFarmer(id, 'suspended'),
    activateFarmer: (id) => putFarmer(id, 'approved'),
    suspendUser: (id) => putUser(id, { isActive: false }),
    activateUser: (id) => putUser(id, { isActive: true }),
    changeUserRole: (id, role) => putUser(id, { role }),
    approveProduct: (id) => putProduct(id, { status: 'published' }),
    hideProduct: (id) => putProduct(id, { status: 'hidden' }),
    removeProduct: (id) => act(() => api(`/products/${id}`, { method: 'DELETE' })),
    suspendMarket: (id) => putMarket(id, { status: 'suspended' }),
    deleteMarket: (id) => act(() => api(`/markets/${id}`, { method: 'DELETE' })),
    updateOrderStatus: (id, s) => act(() => api(`/orders/${id}/status`, { method: 'PUT', body: { status: s } })),
    saveSettings: (next) => {
      const merged = {
        appearance: next.appearance === 'dark' ? 'dark' : 'light',
        notifications: { ...DEFAULT_SETTINGS.notifications, ...(next.notifications || {}) },
        dashboard: { ...DEFAULT_SETTINGS.dashboard, ...(next.dashboard || {}) }
      }
      setSettings(merged); writeJSON(STORAGE_KEYS.adminSettings, merged)
    },
    resetAdminData: () => { setSettings(DEFAULT_SETTINGS); writeJSON(STORAGE_KEYS.adminSettings, DEFAULT_SETTINGS) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [data, settings, status, error, refresh, act])

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}
export default AdminContext
