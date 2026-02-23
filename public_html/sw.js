const CACHE_NAME = 're-evented-v1.0.0';
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

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 