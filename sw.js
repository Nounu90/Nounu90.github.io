/* MSTORECASA - service worker */
const V = "mstorecasa-v1";
const CORE = [
  "./", "./index.html", "./manifest.json",
  "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const isFont = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";

  if (url.origin === self.location.origin || isFont) {
    e.respondWith(
      caches.match(req).then(hit => {
        const net = fetch(req).then(res => {
          if (res && (res.ok || res.type === "opaque")) {
            const copy = res.clone();
            caches.open(V).then(c => c.put(req, copy));
          }
          return res;
        }).catch(() => hit);
        return hit || net;
      })
    );
  }
});
