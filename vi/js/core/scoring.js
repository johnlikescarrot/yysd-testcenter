/** Quy đổi điểm IELTS và nhãn năng lực — dùng cho trang Tiến độ. */

export const SKILLS = [
  { id: 'reading', name: 'Reading', vi: 'Đọc', color: '#102a4c' },
  { id: 'listening', name: 'Listening', vi: 'Nghe', color: '#c7a45d' },
  { id: 'writing', name: 'Writing', vi: 'Viết', color: '#8a6a2f' },
  { id: 'speaking', name: 'Speaking', vi: 'Nói', color: '#6c7a89' },
  { id: 'vocab', name: 'Vocabulary', vi: 'Từ vựng', color: '#a98234' },
  { id: 'grammar', name: 'Grammar', vi: 'Ngữ pháp', color: '#1f4d7a' },
];

export const BAND_LABELS = [
  { min: 8.5, label: 'Thành thạo (C2)', note: 'Sử dụng tiếng Anh gần như bản ngữ.' },
  { min: 7.5, label: 'Rất tốt (C1)', note: 'Dùng ngôn ngữ linh hoạt, chính xác.' },
  { min: 6.5, label: 'Khá (B2+)', note: 'Đủ sức học tập và làm việc bằng tiếng Anh.' },
  { min: 5.5, label: 'Trung cấp (B2)', note: 'Giao tiếp hiệu quả trong nhiều ngữ cảnh.' },
  { min: 4.5, label: 'Sơ trung cấp (B1)', note: 'Xử lý được tình huống quen thuộc.' },
  { min: 3.5, label: 'Cơ bản (A2)', note: 'Hiểu và dùng câu đơn giản.' },
  { min: 0, label: 'Khởi đầu (A1)', note: 'Làm quen với từ và mẫu câu cơ bản.' },
];

/** Bảng quy đổi Reading học thuật: [điểm thô tối thiểu, band]. */
const READING_TABLE = [
  [39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6],
  [19, 5.5], [15, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5],
];

/** Bảng quy đổi Listening: [điểm thô tối thiểu, band]. */
const LISTENING_TABLE = [
  [39, 9], [37, 8.5], [35, 8], [32, 7.5], [30, 7], [26, 6.5], [23, 6],
  [18, 5.5], [16, 5], [13, 4.5], [11, 4], [8, 3.5], [6, 3], [4, 2.5],
];

/** Bảng ước lượng theo độ chính xác cho từ vựng / ngữ pháp. */
const ACCURACY_TABLE = [
  [0.95, 8.5], [0.88, 8], [0.8, 7.5], [0.72, 7], [0.64, 6.5], [0.56, 6],
  [0.48, 5.5], [0.4, 5], [0.32, 4.5], [0.24, 4], [0.16, 3.5],
];

/** Làm tròn band theo quy tắc IELTS (0.25 → 0.5, 0.75 → 1.0). */
export function roundBand(value) {
  const number = Number(value);
  const safe = Number.isFinite(number) ? Math.max(0, Math.min(9, number)) : 0;
  return Math.round(safe * 2) / 2;
}

/** Tra band từ số câu đúng trên bảng quy đổi 40 câu (tự co giãn theo tổng). */
function bandFromTable(table, correct, total) {
  if (!(total > 0)) return 0;
  const scaled = Math.round((Math.max(0, correct) / total) * 40);
  for (const [threshold, band] of table) {
    if (scaled >= threshold) return band;
  }
  return 1;
}

/** Ước lượng band cho một kỹ năng từ độ chính xác. */
export function estimateBand(skill, correct, total) {
  if (skill === 'reading') return bandFromTable(READING_TABLE, correct, total);
  if (skill === 'listening') return bandFromTable(LISTENING_TABLE, correct, total);
  const ratio = total > 0 ? Math.max(0, Math.min(1, correct / total)) : 0;
  for (const [threshold, band] of ACCURACY_TABLE) {
    if (ratio >= threshold) return band;
  }
  return 3;
}

/** Band tổng (overall) từ danh sách band 4 kỹ năng. */
export function overallBand(bands) {
  const list = (Array.isArray(bands) ? bands : []).filter((value) => Number.isFinite(Number(value)));
  if (list.length === 0) return 0;
  const average = list.reduce((sum, value) => sum + Number(value), 0) / list.length;
  return roundBand(average);
}

/** Nhãn năng lực tiếng Việt cho một band. */
export function bandLabel(band) {
  const value = Number(band) || 0;
  return BAND_LABELS.find((entry) => value >= entry.min);
}

/** Ước lượng band cho toàn bộ kỹ năng đã luyện. */
export function estimateProfile(skills) {
  const rows = SKILLS.map((skill) => {
    const stat = skills?.[skill.id] || { correct: 0, total: 0 };
    const band = stat.total > 0 ? estimateBand(skill.id, stat.correct, stat.total) : null;
    return { skill, correct: stat.correct, total: stat.total, band };
  });
  const bands = rows.filter((row) => row.band !== null).map((row) => row.band);
  return { rows, overall: overallBand(bands), count: bands.length };
}

/** Điểm cần đạt: khoảng cách tới mục tiêu band. */
export function gapToTarget(overall, target) {
  const gap = roundBand(target) - roundBand(overall);
  if (gap <= 0) return { reached: true, gap: 0, message: 'Bạn đã chạm mục tiêu. Giữ nhịp và nâng chuẩn lên 0.5 band.' };
  return {
    reached: false,
    gap,
    message: `Còn ${gap.toFixed(1)} band — tương đương khoảng ${Math.max(1, Math.round(gap * 30))} giờ luyện có hướng dẫn.`,
  };
}
