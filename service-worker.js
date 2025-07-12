const CACHE_NAME = 'inventory-app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Dodaj inne zasoby, które chcesz cachować, np. pliki CSS, JS, obrazy
];

// Instalacja Service Worker'a
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Aktywacja Service Worker'a
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Obsługa zapytań sieciowych (strategia Cache, then Network)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Zwróć zasób z cache'u, jeśli jest dostępny
        if (response) {
          return response;
        }
        // W przeciwnym razie, pobierz zasób z sieci
        return fetch(event.request).then((networkResponse) => {
          // Spróbuj dodać pobrany zasób do cache'u
          return caches.open(CACHE_NAME).then((cache) => {
            // Ważne: Sprawdź, czy odpowiedź jest prawidłowa, zanim ją cachujesz
            // np. status 200 i typ odpowiedzi (basic, cors, opaque)
            if (networkResponse.ok || networkResponse.type === 'opaque') {
                cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
      .catch(() => {
        // Opcjonalnie: Zwróć stronę offline, jeśli nic nie jest dostępne
        // return caches.match('/offline.html');
      })
  );
});
