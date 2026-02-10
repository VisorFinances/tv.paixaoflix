// Service Worker for PaixãoFlix Streaming Platform
const CACHE_NAME = "paixaoflix-v1";
const urlsToCache = [
  "/",
  "/manifest.json",
  "/browserconfig.xml",
  "/data/filmes.json",
  "/data/series.json",
  "/data/favoritos.json",
  "/data/kids_filmes.json",
  "/data/kids_series.json",
  "/data/ativa_canais.m3u",
  "/data/ativa_kids_canais.m3u",
  "https://raw.githubusercontent.com/paixaoflix-mobile/paixaoflix-mobile/main/logoof512.png",
  "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Open+Sans:wght@400;600&display=swap",
];

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching app shell");
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Service Worker: Deleting old cache");
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }
  
  // Skip external requests (except our GitHub assets)
  if (url.origin !== location.origin && !url.hostname.includes("githubusercontent.com")) {
    return;
  }
  
  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(request)
          .then((response) => {
            // Cache successful responses
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
            }
            return response;
          })
          .catch(() => {
            // Return offline page for failed requests
            if (request.destination === "document") {
              return caches.match("/offline.html");
            }
            return new Response("Offline", { status: 503 });
          });
      })
  );
});
