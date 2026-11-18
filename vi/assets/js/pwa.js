/* =========================================================================
   pwa.js — đăng ký service worker và nhận diện chế độ cài đặt.
   ========================================================================= */

export const SW_URL = "./sw.js";

/** Có service worker không. */
export function supportsServiceWorker(nav) {
  return Boolean(nav && "serviceWorker" in nav);
}

/** Chế độ standalone (đã cài về màn hình chính). */
export function isStandalone(win) {
  if (!win) return false;
  const media = typeof win.matchMedia === "function" ? win.matchMedia("(display-mode: standalone)") : null;
  return Boolean(media?.matches || win.navigator?.standalone);
}

/**
 * Đăng ký service worker; nuốt lỗi để không chặn trang.
 * Trả về registration hoặc null.
 */
export async function registerServiceWorker(nav, options = {}) {
  if (!supportsServiceWorker(nav)) return null;
  try {
    return await nav.serviceWorker.register(options.url || SW_URL, { scope: options.scope || "./", type: "module" });
  } catch {
    return null;
  }
}

/** Theo dõi mất mạng để hiện thông báo. */
export function watchConnectivity(win, onChange) {
  if (!win || typeof win.addEventListener !== "function") return () => {};
  const online = () => onChange(true);
  const offline = () => onChange(false);
  win.addEventListener("online", online);
  win.addEventListener("offline", offline);
  return () => {
    win.removeEventListener("online", online);
    win.removeEventListener("offline", offline);
  };
}
