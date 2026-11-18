/** Chuỗi ký tự, định dạng số và tìm kiếm không dấu. */

const ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Thoát ký tự HTML để render an toàn. */
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}

/** Bỏ dấu tiếng Việt để tìm kiếm. */
export function stripDiacritics(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/** Chuẩn hoá khoá tìm kiếm: không dấu, chữ thường, gộp khoảng trắng. */
export function searchKey(value) {
  return stripDiacritics(value).toLowerCase().replace(/\s+/g, ' ').trim();
}

/** Định dạng số nguyên kiểu Việt Nam (1.250). */
export function formatInt(value) {
  const number = Number(value);
  return new Intl.NumberFormat('vi-VN').format(Number.isFinite(number) ? number : 0);
}

/** Định dạng phần trăm từ tỉ lệ 0..1. */
export function formatPercent(ratio, digits = 0) {
  const number = Number(ratio);
  const safe = Number.isFinite(number) ? Math.max(0, Math.min(1, number)) : 0;
  return `${(safe * 100).toFixed(digits)}%`;
}

/** Rút gọn văn bản dài, thêm dấu ba chấm. */
export function truncate(value, max = 120) {
  const text = String(value ?? '');
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

/** Chọn dạng số ít / số nhiều tiếng Việt. */
export function pluralVi(count, one, many) {
  return Number(count) === 1 ? one : many;
}
