// NOTE: This file creates a service worker that cross-origin-isolates the page (read more here: https://web.dev/coop-coep/) which allows us to use wasm threads.
// Normally you would set the COOP and COEP headers on the server to do this, but Github Pages doesn't allow this, so this is a hack to do that.

// Edited version of: clip-image-sorter - Joseph Rocca, licensed under MIT
// Edited version of: coi-serviceworker v0.1.6 - Guido Zuidhof, licensed under MIT
// From here: https://github.com/josephrocca/clip-image-sorter/blob/main/enable-threads.js

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

async function handleFetch(request) {
    // We need to set `credentials` to "omit" for no-cors requests, per this comment: https://bugs.chromium.org/p/chromium/issues/detail?id=1309901#c7
    if (request.mode === "no-cors") {
        request = new Request(request.url, {
            cache: request.cache,
            credentials: "omit",
            headers: request.headers,
            integrity: request.integrity,
            keepalive: request.keepalive,
            method: request.method,
            mode: request.mode,
            redirect: request.redirect,
            referrer: request.referrer,
            referrerPolicy: request.referrerPolicy,
            signal: request.signal,
        });
    }

    let r = await fetch(request);

    if (r.status === 0) return r;

    const headers = new Headers(r.headers);
    headers.set("Cross-Origin-Embedder-Policy", "require-corp"); // or: credentialless
    headers.set("Cross-Origin-Opener-Policy", "same-origin");

    return new Response(r.body, { status: r.status, statusText: r.statusText, headers });
}

self.addEventListener("fetch", function(e) {
    console.log(e.request.cache);
    if (!(e.request.cache === "only-if-cached" && e.request.mode !== "same-origin")) {
        e.respondWith(handleFetch(e.request)); // respondWith must be executed synchonously (but can be passed a Promise)
    }
});
