/* =========================================================================
   util.js — tiện ích thuần (pure) dùng chung cho IELTS Việt
   Không phụ thuộc DOM, không phụ thuộc thời gian hệ thống (luôn truyền vào).
   ========================================================================= */

/** Giới hạn giá trị trong khoảng [min, max]. */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/** Khoá ngày theo giờ địa phương, dạng YYYY-MM-DD (dùng để tính streak). */
export function dayKey(date) {
  const d = date instanceof Date ? date : new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

/** Cộng/trừ số ngày, trả về Date mới. */
export function addDays(date, days) {
  const d = new Date(date instanceof Date ? date.getTime() : date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Số ngày lệch giữa hai khoá ngày (b - a). */
export function dayDiff(a, b) {
  const ms = new Date(`${b}T00:00:00`).getTime() - new Date(`${a}T00:00:00`).getTime();
  return Math.round(ms / 86400000);
}

/**
 * Chuẩn hoá câu trả lời: chữ thường, bỏ dấu tiếng Việt, bỏ dấu câu,
 * gộp khoảng trắng. Dùng cho chấm điểm nên phải tha thứ lỗi gõ.
 */
export function normalize(text) {
  if (text === null || text === undefined) return "";
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Fisher–Yates trên bản sao, nhận RNG để tái lập kết quả trong test. */
export function shuffle(list, rng) {
  const random = typeof rng === "function" ? rng : Math.random;
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** RNG tất định (mulberry32) — cùng seed cho cùng chuỗi số. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Băm chuỗi thành số nguyên 32-bit (dùng làm seed ổn định). */
export function hashString(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Escape HTML trước khi chèn vào DOM. */
export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Định dạng số theo chuẩn Việt Nam. */
export function formatNumber(value, locale = "vi-VN") {
  return new Intl.NumberFormat(locale).format(Number(value) || 0);
}

/** Phần trăm nguyên, an toàn với total = 0. */
export function percent(part, total) {
  if (!total) return 0;
  return Math.round((Number(part) / Number(total)) * 100);
}

/** Chọn ngẫu nhiên một phần tử. */
export function pick(list, rng) {
  const random = typeof rng === "function" ? rng : Math.random;
  if (!list.length) return undefined;
  return list[Math.floor(random() * list.length)];
}

/** Định dạng thời gian ngắn: 90 → "1 phút 30 giây". */
export function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.round(Number(ms) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (!minutes) return `${seconds} giây`;
  if (!seconds) return `${minutes} phút`;
  return `${minutes} phút ${seconds} giây`;
}
