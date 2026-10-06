import { API_URL } from './api.js'

/** Uploads one image to the backend (folder: products|farmers|farms|markets|avatars). Returns the stored relative path. */
export async function uploadImage(folder, file) {
  const fd = new FormData()
  fd.append('image', file)
  let token = null
  try { token = localStorage.getItem('marketlink_token') } catch { /* storage unavailable */ }
  const res = await fetch(`${API_URL}/uploads/images/${folder}`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.message || `Upload failed (${res.status})`)
  return json.data.path
}
