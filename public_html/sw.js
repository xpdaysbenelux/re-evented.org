// Tombstone service worker.
// The previous SW used stale-while-revalidate and served outdated HTML.
// This version deletes all caches, unregisters itself, and reloads controlled
// clients so returning visitors are freed from the old SW on their next visit.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then(clients => clients.forEach(client => client.navigate(client.url)))
  );
});
