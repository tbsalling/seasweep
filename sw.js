// sw.js — Service worker for offline caching

const CACHE_NAME = 'sea-sweep-v2';
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
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
