const CACHE_NAME = 're-evented-v2.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/privacy-policy.html',
  '/terms-and-conditions.html',
  '/cookies-policy.html',
  '/styles.css',
  '/script.js',
  '/img/re-evented-logo.webp',
  '/img/Re-Evented members_2025.webp',
  '/img/Peter-Latten.webp',
  '/img/Dimitri-Bauwens.webp',
  '/img/Frederik-Vannieuwenhuyse.webp',
  '/img/linkedin-icon.svg',
  '/img/XP-Days-Benelux-logo.webp',
  '/img/Regional-Scrum-Gathering-2024-Ghent.webp',
  '/img/Liberating-Structures-gathering-2025-logo.webp'
];

// Install event - cache resources and activate immediately
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch event - stale-while-revalidate strategy
// Serve cached version immediately, then update cache from network in background
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      });
    })
  );
});

// Activate event - clean up old caches and claim all clients immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
}); 