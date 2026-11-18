/* Service worker: giữ ứng dụng dùng được khi mất mạng.
   - Tài nguyên tĩnh (CSS, JS, JSON, PDF, ảnh): cache-first, làm mới ngầm.
   - Trang HTML: network-first, rơi về bản cache hoặc trang lỗi khi ngoại tuyến. */

const VERSION = 'yysd-ielts-vi-v2';
const SHELL = [
  './',
  './index.html',
  './hoc.html',
  './bai-hoc.html',
  './luyen-tap.html',
  './thu-vien.html',
  './tien-do.html',
  './404.html',
  './js/app.js',
  './js/browser.js',
  './js/core/content.js',
  './js/core/date.js',
  './js/core/gamify.js',
  './js/core/league.js',
  './js/core/papers.js',
  './js/core/quests.js',
  './js/core/quiz.js',
  './js/core/scoring.js',
  './js/core/srs.js',
  './js/core/state.js',
  './js/core/text.js',
  './js/views/dashboard.js',
  './js/views/icons.js',
  './js/views/layout.js',
  './js/views/learn.js',
  './js/views/lesson.js',
  './js/views/library.js',
  './js/views/practice.js',
  './js/views/progress.js',
  './manifest.webmanifest',
  './img/favicon.svg',
  './data/curriculum.json',
  './data/vocab.json',
  './data/papers.json',
  './data/pdfs.json',
  './data/prompts.json',
  './data/units/doc-tfng.json',
  './data/units/nen-tang-doc.json',
  './data/units/nghe-so-lieu.json',
  './data/units/ngu-phap-cau-phuc.json',
  './data/units/noi-part-2.json',
  './data/units/tu-vung-awl.json',
  './data/units/viet-task-1.json',
  './data/units/viet-task-2.json',
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
