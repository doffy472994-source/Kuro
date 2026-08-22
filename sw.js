const CACHE = "kuro-v1";

// Resources to pre-cache on install (the app shell)
const PRECACHE = ["/", "/index.html"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  // Delete old cache versions
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Always go network-first for API calls — never serve stale AI responses
  const isApi =
    url.pathname.startsWith("/api/") ||
    url.hostname === "api.anthropic.com" ||
    url.hostname === "api.groq.com" ||
    url.hostname === "generativelanguage.googleapis.com" ||
    url.hostname === "openrouter.ai" ||
    url.hostname === "api.openai.com" ||
    url.hostname === "api.exa.ai";

  if (isApi || request.method !== "GET") {
    e.respondWith(fetch(request));
    return;
  }

  // Cache-first for the app shell and static assets — works offline
  e.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
    )
  );
});
