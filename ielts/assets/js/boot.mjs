/** Khởi chạy trong trình duyệt; toàn bộ logic nằm ở các module đã kiểm chứng. */
import { createApp } from './app.mjs';
import { browserStorage } from './storage.mjs';

createApp({ document, storage: browserStorage(window.localStorage), now: () => Date.now() });

/** Đăng ký ngoại tuyến, tách riêng để kiểm chứng cả hai nhánh. */
export function registerServiceWorker(nav) {
  if (!('serviceWorker' in nav)) return false;
  nav.serviceWorker.register('./sw.js').catch(() => {});
  return true;
}

registerServiceWorker(navigator);
