/*
 * Ooruly service worker — offline support for the static guide.
 *
 * Strategy (chosen so code edits are never masked by a stale cache):
 *   - Precache the app shell on install so the guide opens offline.
 *   - Code + markup (HTML, CSS, JS, manifest): STALE-WHILE-REVALIDATE. Serve the cached copy fast,
 *     but always fetch a fresh one in the background and update the cache, so the next load shows
 *     your latest changes. Falls back to cache when offline.
 *   - Same-origin images: cache-first (photos don't change once published).
 *   - Navigations: network-first, falling back to the cached shell offline.
 *
 * Third-party requests (Font Awesome, Google Fonts, Leaflet, OSM tiles, MakeMyTrip, Google Maps)
 * are left to the network and simply won't work offline — which is fine and honest.
 *
 * Bump VERSION whenever the shell list changes to force a clean re-cache.
 */
const VERSION = 'ooruly-v7';
const SHELL = [
    './',
    './index.html',
    './style.css',
    './data.js',
    './booking.js',
    './features.js',
    './app.js',
    './manifest.webmanifest',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

// Let the page tell a waiting worker to take over immediately (used by the update prompt).
self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);
    const sameOrigin = url.origin === self.location.origin;

    // Navigations: network-first, fall back to the cached shell offline.
    if (req.mode === 'navigate') {
        event.respondWith(fetch(req).catch(() => caches.match('./index.html')));
        return;
    }

    if (!sameOrigin) return; // cross-origin: default network handling

    // Same-origin images: cache-first (they never change once published).
    if (/\.(?:jpg|jpeg|png|webp|svg|gif)$/i.test(url.pathname)) {
        event.respondWith(
            caches.match(req).then((cached) => cached || fetch(req).then((res) => {
                const copy = res.clone();
                caches.open(VERSION).then((cache) => cache.put(req, copy));
                return res;
            }))
        );
        return;
    }

    // Code + markup: stale-while-revalidate so edits show up on the next load.
    event.respondWith(
        caches.open(VERSION).then((cache) =>
            cache.match(req).then((cached) => {
                const network = fetch(req).then((res) => {
                    if (res && res.status === 200) cache.put(req, res.clone());
                    return res;
                }).catch(() => cached);
                return cached || network;
            })
        )
    );
});
