/**
 * Tiện ích ngày giờ thuần tuý (không phụ thuộc DOM) — dùng cho chuỗi ngày,
 * nhiệm vụ hằng ngày, bảng xếp hạng tuần và biểu đồ nhiệt.
 */

export const DAY_MS = 86400000;

const pad2 = (value) => String(value).padStart(2, '0');

/** Khoá ngày theo giờ địa phương: YYYY-MM-DD. */
export function dayKey(timestamp) {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Đổi khoá ngày thành mốc nửa đêm giờ địa phương. */
export function parseDayKey(key) {
  const [y, m, d] = String(key).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1).getTime();
}

/** Số ngày lệch giữa hai khoá ngày (dương nếu `toKey` muộn hơn). */
export function dayDiff(fromKey, toKey) {
  return Math.round((parseDayKey(toKey) - parseDayKey(fromKey)) / DAY_MS);
}

/** Cộng/trừ ngày trên khoá ngày. */
export function addDays(key, amount) {
  return dayKey(parseDayKey(key) + amount * DAY_MS);
}

/** Khoá tuần theo chuẩn ISO, ví dụ 2026-W46. */
export function weekKey(timestamp) {
  const d = new Date(timestamp);
  const utc = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utc - yearStart) / DAY_MS + 1) / 7);
  return `${utc.getUTCFullYear()}-W${pad2(week)}`;
}

/** Thứ Hai của tuần chứa `timestamp`. */
export function startOfWeek(timestamp) {
  const d = new Date(timestamp);
  const day = (d.getDay() + 6) % 7;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d.getTime();
}

/** Đồng hồ đếm ngược dạng MM:SS (hoặc H:MM:SS khi vượt 1 giờ). */
export function formatClock(ms) {
  const total = Math.max(0, Math.ceil(Number(ms || 0) / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (hours > 0) return `${hours}:${pad2(minutes)}:${pad2(seconds)}`;
  return `${pad2(minutes)}:${pad2(seconds)}`;
}

/** Nhãn ngày thân thiện bằng tiếng Việt. */
export function humanDay(key, todayKey) {
  if (!key) return 'Chưa học';
  const diff = dayDiff(key, todayKey);
  if (diff === 0) return 'Hôm nay';
  if (diff === 1) return 'Hôm qua';
  if (diff === -1) return 'Ngày mai';
  if (diff > 1 && diff <= 6) return `${diff} ngày trước`;
  if (diff < -1 && diff >= -6) return `Sau ${Math.abs(diff)} ngày`;
  const [y, m, d] = String(key).split('-');
  return `${d}/${m}/${y}`;
}

/** Dữ liệu biểu đồ nhiệt `days` ngày gần nhất. */
export function heatmapData(history, now, days = 28) {
  const byDay = new Map();
  for (const entry of Array.isArray(history) ? history : []) {
    byDay.set(entry.day, entry);
  }
  const today = dayKey(now);
  const cells = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = addDays(today, -offset);
    const xp = byDay.get(day)?.xp || 0;
    let level = 0;
    if (xp >= 60) level = 4;
    else if (xp >= 40) level = 3;
    else if (xp >= 20) level = 2;
    else if (xp > 0) level = 1;
    cells.push({ day, xp, level });
  }
  return cells;
}

/** Thứ trong tuần bằng tiếng Việt (0 là Chủ nhật theo Date). */
export function weekdayVi(timestamp) {
  const names = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  return names[new Date(timestamp).getDay()];
}
