// sw.js — Service worker for offline caching
//
// Strategies:
//   Navigation (HTML): network-first, cache fallback (always get latest deploy)
//   Assets (JS/CSS):   stale-while-revalidate (fast load, background update)
//
// Bump CACHE_NAME to force a full cache clear (e.g. after breaking changes).

const CACHE_NAME = 'sea-sweep-v5';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/board.js',
  './js/animation.js',
  './js/particles.js',
  './js/renderer.js',
  './js/input.js',
  './js/levels.js',
  './js/audio.js',
  './js/storage.js',
  './js/i18n.js',
  './js/ui.js',
  './js/ads.js',
  './js/main.js',
  './manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Navigation requests (HTML pages): network-first
  // This ensures users always get the latest index.html on deploy.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // All other assets (JS, CSS, manifest): stale-while-revalidate
  // Serve from cache immediately for fast load, fetch in background to update cache.
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(request).then((cached) => {
        const networkFetch = fetch(request).then((response) => {
          cache.put(request, response.clone());
          return response;
        });
        return cached || networkFetch;
      })
    )
  );
});
