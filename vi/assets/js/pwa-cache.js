/* =========================================================================
   pwa-cache.js — chiến lược cache thuần cho service worker.
   ========================================================================= */

export const CACHE_NAME = "yysd-ielts-vi-v1";

export const CORE_ASSETS = [
  "./",
  "./index.html",
  "./hoc.html",
  "./luyen-tap.html",
  "./thu-vien.html",
  "./bang-xep-hang.html",
  "./ho-so.html",
  "./assets/css/app.css",
  "./assets/js/util.js",
  "./assets/js/i18n.js",
  "./assets/js/store.js",
  "./assets/js/gamify.js",
  "./assets/js/srs.js",
  "./assets/js/quiz.js",
  "./assets/js/library.js",
  "./assets/js/league.js",
  "./assets/js/page-home.js",
  "./assets/js/page-lesson.js",
  "./assets/js/page-library.js",
  "./assets/js/page-league.js",
  "./assets/js/page-profile.js",
  "./assets/js/page-practice.js",
  "./assets/js/pwa.js",
  "./assets/js/pwa-cache.js",
  "./assets/img/icon.svg",
  "./manifest.webmanifest",
  "./data/lessons.json",
  "./data/library.json"
];

/** Chỉ cache request GET cùng origin (trừ API). */
export function shouldCache(request, origin) {
  if (!request || request.method !== "GET") return false;
  if (typeof request.url !== "string") return false;
  if (!request.url.startsWith(origin)) return false;
  return !request.url.includes("/api/");
}

/** Có nên trả từ cache trước không (tài liệu + asset tĩnh). */
export function isCacheFirst(url) {
  return /\.(?:css|js|json|svg|png|jpg|jpeg|webp|woff2|pdf|webmanifest)$/.test(url) || url.endsWith("/");
}

/** Khoá cache chuẩn hoá cho một URL. */
export function cacheKeyFor(url) {
  return new URL(url).pathname;
}
