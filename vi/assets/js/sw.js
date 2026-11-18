/* =========================================================================
   sw.js — service worker dạng module cho IELTS Việt.
   Precache lõi ứng dụng, cache-first cho asset, network-first cho HTML.
   ========================================================================= */

import { CACHE_NAME, CORE_ASSETS, isCacheFirst, shouldCache } from "./pwa-cache.js";

const scope = self;

async function precache() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(CORE_ASSETS);
}

async function cleanup() {
  const keys = await caches.keys();
  await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
}

async function respond(event) {
  const { request } = event;
  if (!shouldCache(request, scope.location.origin)) return undefined;
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached && isCacheFirst(request.url)) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok && response.type === "basic") {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    if (cached) return cached;
    if (request.mode === "navigate") return cache.match("./index.html");
    throw new Error("offline");
  }
}

scope.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => scope.skipWaiting()));
});

scope.addEventListener("activate", (event) => {
  event.waitUntil(cleanup().then(() => scope.clients.claim()));
});

scope.addEventListener("fetch", (event) => {
  if (!shouldCache(event.request, scope.location.origin)) return;
  event.respondWith(respond(event));
});

export { precache, cleanup, respond };
