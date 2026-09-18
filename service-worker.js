const CACHE_NAME = "fatim-site-plano-v18";

const APP_FILES = [
  "./",
  "./index.html",
  "./blog.html",
  "./sobre.html",
  "./pwa.js",
  "./fatim-icon-192.png",
  "./fatim-icon-512.png",
  "./anuario-liturgico.html",
  "./styles.css",
  "./anuario-liturgico.js",
  "./liturgical-data.js",
  "./manifest.webmanifest",
  "./anuario-liturgico.webmanifest",
  "./icon.svg",
  "./fatim-logo.png",
  "./FATIM_Logo_AZUL.png",
  "./FATIM_Logo_BRANCO.png",
  "./email.svg",
  "./whatsapp.svg",
  "./facebook.svg",
  "./instagram.svg",
  "./youtube.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key !== CACHE_NAME)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  const refreshFromNetwork = url.origin === self.location.origin &&
    ["document", "script", "style"].includes(event.request.destination);

  if (refreshFromNetwork) {
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request, { cache: "no-cache" });
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(event.request, response.clone());
        }
        return response;
      } catch (error) {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        throw error;
      }
    })());
    return;
  }

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true })
      .then((cached) => cached || fetch(event.request))
  );
});
