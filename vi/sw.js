/* Service worker: giữ ứng dụng dùng được khi mất mạng.
   - Tài nguyên tĩnh (CSS, JS, JSON, PDF, ảnh): cache-first, làm mới ngầm.
   - Trang HTML: network-first, rơi về bản cache hoặc trang 404 khi ngoại tuyến. */

const VERSION = 'yysd-ielts-vi-v1';
const SHELL = [
  './',
  './index.html',
  './hoc.html',
  './bai-hoc.html',
  './luyen-tap.html',
  './thu-vien.html',
  './tien-do.html',
  './404.html',
  './css/app.css',
  './js/app.js',
  './js/browser.js',
  './manifest.webmanifest',
  './img/favicon.svg',
  './data/curriculum.json',
  './data/vocab.json',
  './data/papers.json',
  './data/pdfs.json',
  './data/prompts.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const isPage = request.mode === 'navigate';

  if (isPage) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match('./index.html'))
            .then((cached) => cached || caches.match('./404.html')),
        ),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        fetch(request)
          .then((response) => caches.open(VERSION).then((cache) => cache.put(request, response.clone())))
          .catch(() => {});
        return cached;
      }
      return fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match('./index.html'));
    }),
  );
});
