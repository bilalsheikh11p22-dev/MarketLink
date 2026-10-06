import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { favoriteKey, toFavorite } from '../data/favorites.js'
import * as svc from '../services/favoriteService.js'
import { normalizeFarmer, normalizeMarket, normalizeProduct } from '../utils/normalize.js'
import { STORAGE_KEYS, isArray, readJSON, writeJSON } from '../utils/storage.js'
import { useAuth } from './AuthContext.jsx'

// Signed-in users: favourites live on the server (optimistic updates, rolled back on failure).
// Guests: kept in localStorage and merged into the account at login. No mock seed.

const FavoritesContext = createContext(null)
const isValidItem = (f) => f && typeof f === 'object' && f.id !== undefined && ['product', 'farmer', 'market'].includes(f.type)
const loadLocal = () => readJSON(STORAGE_KEYS.favorites, [], isArray).filter(isValidItem)

function fromServer(fav) {
  return [
    ...fav.products.map((p) => toFavorite('product', normalizeProduct(p))),
    ...fav.farmers.map((f) => toFavorite('farmer', normalizeFarmer(f))),
    ...fav.markets.map((m) => toFavorite('market', normalizeMarket(m)))
  ]
}

export function FavoritesProvider({ children }) {
  const { isAuthenticated, user } = useAuth()
  const [favorites, setFavorites] = useState(loadLocal)
  const merged = useRef(null)

  useEffect(() => { if (!isAuthenticated) writeJSON(STORAGE_KEYS.favorites, favorites) }, [favorites, isAuthenticated])

  // On sign-in: push guest favourites to the account, then load the account's list.
  useEffect(() => {
    if (!isAuthenticated) { merged.current = null; return }
    if (merged.current === user?.id) return
    merged.current = user?.id
    let cancelled = false
    ;(async () => {
      const local = loadLocal()
      await Promise.allSettled(local.map((f) => svc.add(f.type, f.id)))
      try {
        const res = await svc.list()
        if (!cancelled) { setFavorites(fromServer(res.data.favorites)); writeJSON(STORAGE_KEYS.favorites, []) }
      } catch { /* keep local view */ }
    })()
    return () => { cancelled = true }
  }, [isAuthenticated, user?.id])

  const keys = useMemo(() => new Set(favorites.map((f) => favoriteKey(f.type, f.id))), [favorites])
  const isFavorite = useCallback((type, id) => keys.has(favoriteKey(type, id)), [keys])

  const addFavorite = useCallback((item) => {
    setFavorites((prev) => (prev.some((f) => f.type === item.type && f.id === item.id) ? prev : [{ ...item, savedAt: new Date().toISOString() }, ...prev]))
    if (isAuthenticated) svc.add(item.type, item.id).catch(() => setFavorites((prev) => prev.filter((f) => !(f.type === item.type && f.id === item.id))))
  }, [isAuthenticated])

  const removeFavorite = useCallback((type, id) => {
    let removed
    setFavorites((prev) => { removed = prev.find((f) => f.type === type && f.id === id); return prev.filter((f) => !(f.type === type && f.id === id)) })
    if (isAuthenticated) svc.remove(type, id).catch(() => removed && setFavorites((prev) => [removed, ...prev]))
  }, [isAuthenticated])

  const toggleFavorite = useCallback((item) => {
    const currently = keys.has(favoriteKey(item.type, item.id))
    if (currently) removeFavorite(item.type, item.id); else addFavorite(item)
    return !currently
  }, [keys, addFavorite, removeFavorite])

  const clearFavorites = useCallback(() => { favorites.forEach((f) => removeFavorite(f.type, f.id)) }, [favorites, removeFavorite])
  const value = useMemo(() => ({ favorites, isFavorite, addFavorite, removeFavorite, toggleFavorite, clearFavorites, count: favorites.length }), [favorites, isFavorite, addFavorite, removeFavorite, toggleFavorite, clearFavorites])
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used within a FavoritesProvider')
  return ctx
}
