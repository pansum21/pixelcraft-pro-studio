/**
 * PixelCraft Studio Service Worker (PWA Offline Engine & Auto-Update Manager)
 * Strategy: Network-First with Cache Fallback (Never traps user on stale UI)
 */

const CACHE_NAME = 'pixelcraft-cache-v5.3-live';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './css/style.css',
  './js/app.js',
  './js/state.js',
  './js/utils/colorUtils.js',
  './js/utils/soundEffects.js',
  './js/utils/libraryManager.js',
  './js/utils/authManager.js',
  './js/tools/palette.js',
  './js/tools/contrast.js',
  './js/tools/extractor.js',
  './js/tools/svgViewer.js',
  './js/tools/waveGenerator.js',
  './js/tools/shadowGenerator.js',
  './js/tools/gradient.js',
  './js/tools/codeCard.js',
  './js/tools/imageResizer.js',
  './js/tools/faviconGenerator.js',
  './js/tools/componentSandbox.js',
  './js/tools/tokenExporter.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[PixelCraft SW] Purging stale cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // NETWORK-FIRST STRATEGY: Always fetch fresh content from server first
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to offline cache if network is unreachable
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
