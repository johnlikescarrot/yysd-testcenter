/* =========================================================================
   page-common.js — helper DOM dùng chung cho các trang.
   Tất cả hàm nhận `document` để test được bằng jsdom.
   ========================================================================= */

/** Lấy phần tử đầu tiên, null nếu không có. */
export function q(document, selector) {
  return document ? document.querySelector(selector) : null;
}

/** Lấy tất cả phần tử. */
export function qa(document, selector) {
  return document ? [...document.querySelectorAll(selector)] : [];
}

/** Gán textContent nếu phần tử tồn tại. */
export function setText(document, selector, value) {
  const el = q(document, selector);
  if (el) el.textContent = String(value);
  return el;
}

/** Cập nhật dải thống kê trên thanh trên cùng. */
export function updateTopbar(document, state, extra = {}) {
  setText(document, '[data-stat="streak"]', state.streak);
  setText(document, '[data-stat="hearts"]', state.hearts);
  setText(document, '[data-stat="gems"]', state.gems);
  setText(document, '[data-stat="xp"]', state.xp);
  if (extra.heartsLabel !== undefined) {
    setText(document, '[data-stat="hearts-label"]', extra.heartsLabel);
  }
}

/** Đánh dấu mục nav hiện tại theo <body data-page>. */
export function markActiveNav(document) {
  const page = document?.body?.dataset?.page;
  if (!page) return;
  qa(document, "[data-nav]").forEach((link) => {
    if (link.dataset.nav === page) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

/** Hiện/ẩn một banner (offline, thông báo). */
export function showBanner(document, selector, message) {
  const el = q(document, selector);
  if (!el) return null;
  if (message) {
    el.textContent = message;
    el.classList.add("is-visible");
  } else {
    el.textContent = "";
    el.classList.remove("is-visible");
  }
  return el;
}

/** Tải JSON, trả về giá trị mặc định nếu lỗi (offline vẫn chạy). */
export async function loadJson(url, fallback, fetchImpl = globalThis.fetch) {
  try {
    if (typeof fetchImpl !== "function") return fallback;
    const response = await fetchImpl(url);
    if (!response.ok) return fallback;
    return await response.json();
  } catch {
    return fallback;
  }
}

/** Rút gọn ngày cho hiển thị: 18/11. */
export function shortDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** Tạo phần tử với class + text, an toàn khi thiếu document. */
export function createEl(document, tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}
