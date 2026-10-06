/* MarketLink service worker.
 * Caches only the static app shell and build assets. It NEVER caches API responses, uploads,
 * authenticated pages' data or anything with an Authorization header, so private data (orders,
 * QR codes, notifications) is always fetched live from the server. */
const CACHE = 'marketlink-shell-v1'
const SHELL = ['/', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()))
})
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()))
})
self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return            // API / uploads live on another origin or path: never cached
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/uploads')) return
  if (req.headers.get('authorization')) return
  if (req.mode === 'navigate') {                              // network first, fall back to cached shell when offline
    e.respondWith(fetch(req).catch(() => caches.match('/')))
    return
  }
  if (url.pathname.startsWith('/assets/') || SHELL.includes(url.pathname)) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res
    })))
  }
})
