const CACHE = 'studyla-v3'

// Pre-cache these on install
const PRECACHE = [
  '/logo.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/manifest.json',
]

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).catch(() => {})
  )
  self.skipWaiting()
})

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return

  const url = new URL(e.request.url)

  // Skip API routes — always network, never cache
  if (url.pathname.startsWith('/api/')) return

  // Skip cross-origin requests (Supabase, Google Fonts, etc.)
  if (url.origin !== self.location.origin) return

  // Next.js static chunks + images → Cache First (these never change, fast on iOS)
  const isStatic = url.pathname.startsWith('/_next/static/') ||
                   url.pathname.match(/\.(png|jpg|jpeg|svg|gif|ico|woff2|woff|ttf)$/)

  if (isStatic) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached
        return fetch(e.request).then(res => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(CACHE).then(c => c.put(e.request, clone))
          }
          return res
        })
      })
    )
    return
  }

  // HTML pages → Network First, cache as fallback (iOS: stale-while-revalidate feel)
  e.respondWith(
    fetch(e.request, { signal: AbortSignal.timeout(8000) })
      .then(res => {
        if (res.ok) {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
        }
        return res
      })
      .catch(() => caches.match(e.request))
  )
})
