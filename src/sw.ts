import { precacheAndRoute, addPlugins, addRoute } from 'workbox-precaching';
import { skipWaiting, clientsClaim } from 'workbox-core';
import { registerRoute } from 'workbox-routing';

/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

declare let self: ServiceWorkerGlobalScope;

const manifest = self.__WB_MANIFEST;
console.log('UPDATED!');
console.log(manifest);

function headersCrossOrigIsolate(original: Headers): Headers {
    const headers = new Headers(original);
    headers.set("Cross-Origin-Embedder-Policy", "require-corp"); // or: credentialless
    headers.set("Cross-Origin-Opener-Policy", "same-origin");
    return headers;
}

// Force cross-origin-isolation (thanks github pages)
addPlugins([{
    requestWillFetch: async param => {
        let request = param.request;
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
        return request;
    },
    fetchDidSucceed: async param => {
        let r = param.response;

        const headers = headersCrossOrigIsolate(r.headers);

        return new Response(r.body, { status: r.status, statusText: r.statusText, headers });
    },
}]);

precacheAndRoute(manifest);
// IMPORTANT: do not use / paths as it will ignore registration url!
registerRoute('version', async handle => {
    return new Response(__COMMIT_HASH__, {
        status: 200,
        headers: headersCrossOrigIsolate(new Headers()),
    });
})

// When updating:
skipWaiting();// Become active immediately
clientsClaim();// Claim pages that would have had the previous SW
