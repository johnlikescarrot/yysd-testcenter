/* =========================================================================
   league.js — bảng xếp hạng tuần mô phỏng, tất định theo seed.
   Không gọi mạng: dữ liệu nằm trên thiết bị, phù hợp chế độ offline.
   ========================================================================= */

import { mulberry32 } from "./util.js";

export const RIVALS = [
  "Minh Anh", "Gia Hân", "Quốc Bảo", "Thảo Vy", "Đức Huy",
  "Khánh Linh", "Hoàng Nam", "Ngọc Mai", "Tuấn Kiệt", "Phương Thảo",
  "Bảo Ngọc", "Anh Dũng", "Hồng Nhung", "Trung Hiếu", "Lan Chi",
  "Việt Hoàng", "Mai Phương", "Thanh Tú"
];

/** Tạo bảng xếp hạng 15 người, chèn người học hiện tại. */
export function buildCohort(options = {}) {
  const seed = options.seed ?? 11;
  const size = options.size ?? 15;
  const user = options.user || { name: "Bạn", weeklyXp: 0 };
  const rng = mulberry32(seed);
  const rivals = [];
  for (let i = 0; i < size - 1; i += 1) {
    const base = Math.max(10, Math.round(user.weeklyXp * (0.35 + rng() * 1.6) + rng() * 80));
    rivals.push({
      id: `rival-${i + 1}`,
      name: RIVALS[i % RIVALS.length],
      weeklyXp: base,
      avatar: ["🦊", "🐼", "🦉", "🐯", "🐨", "🐸", "🦄"][i % 7],
      isUser: false
    });
  }
  const rows = [
    ...rivals,
    { id: "user", name: user.name || "Bạn", weeklyXp: Math.max(0, user.weeklyXp || 0), avatar: "⭐", isUser: true }
  ].sort((a, b) => b.weeklyXp - a.weeklyXp || a.name.localeCompare(b.name));
  const promoteCount = Math.max(1, Math.round(size / 3));
  return rows.map((row, index) => ({
    ...row,
    rank: index + 1,
    zone: index < promoteCount ? "promote" : index >= size - 2 ? "demote" : "stay"
  }));
}

/** Vị trí của người học trong bảng. */
export function userRank(rows = []) {
  return rows.find((row) => row.isUser) || null;
}

/** Số ngày còn lại của tuần tính từ thứ Hai. */
export function daysRemaining(now = new Date()) {
  const day = (now.getDay() + 6) % 7;
  return 7 - day;
}
