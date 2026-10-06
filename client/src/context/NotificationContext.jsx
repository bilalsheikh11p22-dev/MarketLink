import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import * as svc from '../services/notificationService.js'
import { useAuth } from './AuthContext.jsx'

// Notifications come from the API and arrive live over Server-Sent Events.
// Nothing is seeded or stored locally. If the stream cannot connect the list still works via REST
// and refreshes on window focus.

const NotificationContext = createContext(null)
const TOKEN_KEY = 'marketlink_token'

const toUi = (n) => ({ id: n._id || n.id, type: n.type || 'system', title: n.title, message: n.message || '', link: n.link || null, timestamp: n.createdAt, read: !!n.read })

export function NotificationProvider({ children }) {
  const { isAuthenticated, user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [live, setLive] = useState(false)
  const sourceRef = useRef(null)

  const refresh = useCallback(async () => {
    if (!isAuthenticated) { setNotifications([]); return }
    setLoading(true)
    try { const res = await svc.list(); setNotifications((res.data?.notifications || []).map(toUi)) } catch { /* keep what we have */ } finally { setLoading(false) }
  }, [isAuthenticated])

  useEffect(() => { refresh() }, [refresh, user?.id])

  // Live stream
  useEffect(() => {
    if (!isAuthenticated || typeof EventSource === 'undefined') return undefined
    let token = null
    try { token = localStorage.getItem(TOKEN_KEY) } catch { /* ignore */ }
    if (!token) return undefined
    const es = new EventSource(svc.streamUrl(token))
    sourceRef.current = es
    es.addEventListener('ready', () => setLive(true))
    es.addEventListener('notification', (e) => {
      try {
        const n = toUi(JSON.parse(e.data))
        setNotifications((prev) => (prev.some((p) => p.id === n.id) ? prev : [n, ...prev]))
        window.dispatchEvent(new CustomEvent('marketlink:notification', { detail: n }))
      } catch { /* malformed event */ }
    })
    es.onerror = () => setLive(false) // EventSource retries by itself
    return () => { es.close(); sourceRef.current = null; setLive(false) }
  }, [isAuthenticated, user?.id])

  useEffect(() => {
    const onFocus = () => refresh()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refresh])

  const markAsRead = useCallback(async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    try { await svc.markRead(id) } catch { refresh() }
  }, [refresh])
  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => (n.read ? n : { ...n, read: true })))
    try { await svc.markAllRead() } catch { refresh() }
  }, [refresh])
  const deleteNotification = useCallback(async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    try { await svc.remove(id) } catch { refresh() }
  }, [refresh])

  const unreadCount = useMemo(() => notifications.reduce((n, x) => n + (x.read ? 0 : 1), 0), [notifications])
  const value = useMemo(() => ({ notifications, unreadCount, loading, live, refresh, markAsRead, markAllAsRead, deleteNotification }), [notifications, unreadCount, loading, live, refresh, markAsRead, markAllAsRead, deleteNotification])
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within a NotificationProvider')
  return ctx
}
