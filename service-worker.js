/*
   RUTAKIDS - SERVICE WORKER
   Offline caching strategy for same-origin assets
*/

const CACHE_NAME = 'rutakids-v1.8.5';
const RUNTIME_CACHE = 'rutakids-runtime-v1.8.5';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/css/animations.css',
  '/js/data.js',
  '/js/ui.js',
  '/js/cloud.js',
  '/js/config.js',
  '/js/app.js',
  '/manifest.json',
  '/assets/logo/logoruta1.PNG',
  '/assets/logo/pwa-icon-72.png',
  '/assets/logo/pwa-icon-96.png',
  '/assets/logo/pwa-icon-128.png',
  '/assets/logo/pwa-icon-144.png',
  '/assets/logo/pwa-icon-152.png',
  '/assets/logo/pwa-icon-180.png',
  '/assets/logo/pwa-icon-192.png',
  '/assets/logo/pwa-icon-384.png',
  '/assets/logo/pwa-icon-512.png',
  '/assets/logo/favicon-16.png',
  '/assets/logo/favicon-32.png',
  '/assets/logo/favicon-48.png',
  '/assets/icons/badge-72.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[Service Worker] Install failed:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE)
          .map((cacheName) => caches.delete(cacheName))
      ))
      .then(() => self.clients.claim())
  );
});

const cacheRuntimeResponse = async (request, response) => {
  if (!response || response.status !== 200 || response.type !== 'basic') return response;
  const cache = await caches.open(RUNTIME_CACHE);
  cache.put(request, response.clone());
  return response;
};

const networkFirstNavigation = async (event) => {
  try {
    const response = await fetch(event.request);
    return cacheRuntimeResponse(event.request, response);
  } catch (error) {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    return caches.match('/index.html');
  }
};

const cacheFirstStatic = async (event) => {
  const cached = await caches.match(event.request);
  if (cached) return cached;

  try {
    const response = await fetch(event.request);
    return cacheRuntimeResponse(event.request, response);
  } catch (error) {
    if (event.request.destination === 'document') {
      return caches.match('/index.html');
    }
    throw error;
  }
};

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Cross-origin requests go directly to network.
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(event));
    return;
  }

  event.respondWith(cacheFirstStatic(event));
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(Promise.resolve());
  }
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'RutaKids';
  const options = {
    body: data.body || 'Nueva notificacion',
    icon: '/assets/logo/logoruta1.PNG',
    badge: '/assets/icons/badge-72.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: data.actions || []
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url || '/'));
});

self.addEventListener('message', (event) => {
  if (event.data?.action === 'skipWaiting') {
    self.skipWaiting();
  }

  if (event.data?.action === 'clearCache') {
    event.waitUntil(
      caches.keys().then((cacheNames) => Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName))))
    );
  }
});
