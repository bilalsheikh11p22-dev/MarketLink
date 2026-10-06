// Safe localStorage helpers. Every read tolerates missing keys, malformed
// JSON and blocked storage (private mode) — the app never crashes because
// of what is (or isn't) in localStorage. `validate` lets a caller reject
// data with the wrong shape and fall back to defaults instead.

export function readJSON(key, fallback, validate) {
  for (const store of ['localStorage']) {
    try {
      const raw = window[store].getItem(key)
      if (raw === null) continue
      const parsed = JSON.parse(raw)
      if (validate && !validate(parsed)) return fallback
      return parsed
    } catch {
      return fallback
    }
  }
  return fallback
}

export function writeJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeKey(key) {
  try {
    window.localStorage.removeItem(key)
    window.sessionStorage.removeItem(key)
  } catch {
    // storage unavailable — nothing to remove
  }
}

export const isArray = Array.isArray
export const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

// One place for every Step 7 key, so Step 11 can find (and replace) them.
export const STORAGE_KEYS = {
  auth: 'marketlink_auth_user',
  accounts: 'marketlink_accounts',
  favorites: 'marketlink_favorites',
  reviews: 'marketlink_reviews',
  farmerReplies: 'marketlink_farmer_replies',
  notifications: 'marketlink_notifications',
  profile: 'marketlink_profile',
  adminData: 'marketlink_admin_data',
  adminSettings: 'marketlink_admin_settings',
  adminNotifications: 'marketlink_admin_notifications'
}
