import { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react'
import { STORAGE_KEYS, isPlainObject, readJSON, writeJSON } from '../utils/storage.js'
import * as authService from '../services/authService.js'

const AuthContext = createContext(null)
const TOKEN_KEY = 'marketlink_token'

function loadUser() {
  const fromLocal = readJSON(STORAGE_KEYS.auth, null, isPlainObject)
  if (fromLocal) return fromLocal
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEYS.auth)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return isPlainObject(parsed) ? parsed : null
  } catch {
    return null
  }
}

function persistUser(user, remember) {
  try { window.localStorage.removeItem(STORAGE_KEYS.auth); window.sessionStorage.removeItem(STORAGE_KEYS.auth) } catch {}
  if (!user) return
  if (remember) writeJSON(STORAGE_KEYS.auth, user)
  else try { window.sessionStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(user)) } catch {}
}

function persistToken(token) {
  try { if (token) localStorage.setItem(TOKEN_KEY, token); else localStorage.removeItem(TOKEN_KEY) } catch {}
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)
  const [remember, setRemember] = useState(() => readJSON(STORAGE_KEYS.auth, null, isPlainObject) !== null)
  const [bootstrapped, setBootstrapped] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const token = localStorage.getItem(TOKEN_KEY)
      if (!token) { setBootstrapped(true); return }
      try {
        const res = await authService.me()
        if (!cancelled && res?.data?.user) {
          persistUser(res.data.user, true)
          setUser(res.data.user)
        }
      } catch {
        persistToken(null)
        persistUser(null, false)
        if (!cancelled) setUser(null)
      }
      finally { if (!cancelled) setBootstrapped(true) }
    })()
    return () => { cancelled = true }
  }, [])

  const applySession = useCallback((u, token, keep) => {
    persistToken(token)
    persistUser(u, keep)
    setRemember(keep)
    setUser(u)
  }, [])

  const login = useCallback(async ({ email, password, remember: keep = true }) => {
    try {
      const res = await authService.login({ email, password })
      const u = res.data?.user
      const token = res.data?.token
      if (u && token) {
        applySession(u, token, keep)
        return { ok: true, user: u }
      }
      return { ok: false, error: 'Unexpected response from server.' }
    } catch (err) {
      return { ok: false, error: err.message || 'Invalid email or password.' }
    }
  }, [applySession])

  const googleLogin = useCallback(async (credential, keep = true) => {
    try {
      const res = await authService.googleLogin(credential)
      const u = res.data?.user
      const token = res.data?.token
      if (u && token) {
        applySession(u, token, keep)
        return { ok: true, user: u }
      }
      return { ok: false, error: 'Unexpected response from server.' }
    } catch (err) {
      return { ok: false, error: err.message || 'Google sign-in failed.' }
    }
  }, [applySession])

  const register = useCallback(async (payload) => {
    const isFarmer = payload.role === 'farmer'
    try {
      const res = await authService.register({
        name: payload.name,
        email: payload.email,
        password: payload.password,
        phone: payload.phone,
        city: payload.city,
        role: isFarmer ? 'farmer' : 'customer',
        ...(isFarmer
          ? {
              farmName: payload.farmName,
              farmLocation: payload.farmLocation,
              farmDescription: payload.farmDescription,
              categories: payload.categories
            }
          : {})
      })
      if (res.data?.pending) return { ok: true, pending: true }
      const u = res.data?.user
      const token = res.data?.token
      if (u && token) {
        applySession(u, token, true)
        return { ok: true, user: u }
      }
      return { ok: false, error: 'Unexpected response from server.' }
    } catch (err) {
      return { ok: false, error: err.message || 'Could not create account.' }
    }
  }, [applySession])

  const logout = useCallback(() => { persistToken(null); persistUser(null, false); setUser(null) }, [])

  const hasRole = useCallback((roles) => {
    if (!user?.role) return false
    const list = Array.isArray(roles) ? roles : [roles]
    return list.includes(user.role)
  }, [user])

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    remember,
    bootstrapped,
    login,
    googleLogin,
    register,
    logout,
    hasRole,
    hasToken: typeof localStorage !== 'undefined' && !!localStorage.getItem(TOKEN_KEY)
  }), [user, remember, bootstrapped, login, googleLogin, register, logout, hasRole])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
export default AuthContext
