/**
 * Hệ thống quy đổi Điểm Năng lực 0-160 <-> CEFR (A1-C2) <-> IELTS Band (2.0-9.0)
 * Lấy cảm hứng từ thang điểm chi tiết 0-160 của Duolingo kết hợp bảng đối chiếu
 * CEFR & IELTS Academic chính thức của Cambridge.
 */

export const PROFICIENCY_BANDS = Object.freeze([
  Object.freeze({
    minScore: 0,
    maxScore: 9,
    cefr: "Pre-A1",
    cefrLabelVi: "Khởi đầu A1",
    ieltsBand: 2.0,
    canDoVi: "Nhận diện từ vựng sinh hoạt cơ bản, chữ số, ngày tháng và đánh vần tên riêng.",
  }),
  Object.freeze({
    minScore: 10,
    maxScore: 19,
    cefr: "A1",
    cefrLabelVi: "Sơ cấp A1",
    ieltsBand: 2.5,
    canDoVi: "Hiểu câu đơn ngắn về bản thân, gia đình, địa điểm và thông tin đăng ký đơn giản.",
  }),
  Object.freeze({
    minScore: 20,
    maxScore: 29,
    cefr: "A1+",
    cefrLabelVi: "Sơ cấp A1 vững",
    ieltsBand: 3.0,
    canDoVi: "Nắm bắt ý chính trong hội thoại chậm, điền biểu mẫu IELTS Listening Section 1 cơ bản.",
  }),
  Object.freeze({
    minScore: 30,
    maxScore: 44,
    cefr: "A2",
    cefrLabelVi: "Tiền trung cấp A2",
    ieltsBand: 3.5,
    canDoVi: "Giao tiếp các tình huống quen thuộc hàng ngày và đọc hiểu thông báo ngắn.",
  }),
  Object.freeze({
    minScore: 45,
    maxScore: 59,
    cefr: "A2+",
    cefrLabelVi: "Tiền trung cấp A2 cao",
    ieltsBand: 4.0,
    canDoVi: "Mô tả trải nghiệm cá nhân, nắm được bố cục biểu đồ đơn giản và đoạn văn ngắn.",
  }),
  Object.freeze({
    minScore: 60,
    maxScore: 74,
    cefr: "B1",
    cefrLabelVi: "Trung cấp B1",
    ieltsBand: 5.0,
    canDoVi: "Xử lý được thông tin thực tế trong bài nghe Section 1-2, viết đoạn luận có cấu trúc cơ bản.",
  }),
  Object.freeze({
    minScore: 75,
    maxScore: 89,
    cefr: "B1+",
    cefrLabelVi: "Trung cấp B1 cao",
    ieltsBand: 5.5,
    canDoVi: "Nhận diện diễn đạt tương đương (paraphrase) phổ biến, trình bày quan điểm cá nhân rõ ý.",
  }),
  Object.freeze({
    minScore: 90,
    maxScore: 104,
    cefr: "B2",
    cefrLabelVi: "Trung cao cấp B2",
    ieltsBand: 6.0,
    canDoVi: "Đọc hiểu văn bản học thuật tổng quát, phân biệt True/False/Not Given và mô tả xu hướng số liệu.",
  }),
  Object.freeze({
    minScore: 105,
    maxScore: 119,
    cefr: "B2+",
    cefrLabelVi: "Trung cao cấp B2 vững",
    ieltsBand: 6.5,
    canDoVi: "Đáp ứng chuẩn đầu vào đa số đại học quốc tế; lập luận mạch lạc, sử dụng collocation học thuật tự nhiên.",
  }),
  Object.freeze({
    minScore: 120,
    maxScore: 129,
    cefr: "C1",
    cefrLabelVi: "Cao cấp C1",
    ieltsBand: 7.0,
    canDoVi: "Theo dõi tốt bài giảng Section 4, viết nghị luận chặt chẽ kèm ngôn ngữ rào đón (hedging) chính xác.",
  }),
  Object.freeze({
    minScore: 130,
    maxScore: 139,
    cefr: "C1+",
    cefrLabelVi: "Cao cấp C1 vững",
    ieltsBand: 7.5,
    canDoVi: "Làm chủ từ vựng học thuật ít gặp, diễn đạt trôi chảy, suy luận sắc bén ở các câu hỏi khó.",
  }),
  Object.freeze({
    minScore: 140,
    maxScore: 149,
    cefr: "C2-",
    cefrLabelVi: "Thành thạo C2 khởi đầu",
    ieltsBand: 8.0,
    canDoVi: "Sử dụng tiếng Anh học thuật linh hoạt, tinh tế với rất ít sai sót ngữ pháp hay từ vựng.",
  }),
  Object.freeze({
    minScore: 150,
    maxScore: 155,
    cefr: "C2",
    cefrLabelVi: "Thành thạo C2",
    ieltsBand: 8.5,
    canDoVi: "Phân tích và phản biện chuyên sâu các chủ đề trừu tượng với phong thái tự nhiên như học giả.",
  }),
  Object.freeze({
    minScore: 156,
    maxScore: 160,
    cefr: "C2+",
    cefrLabelVi: "Thành thạo xuất sắc C2",
    ieltsBand: 9.0,
    canDoVi: "Làm chủ toàn diện, chính xác tuyệt đối và tự nhiên ở mọi ngữ cảnh học thuật quốc tế.",
  }),
]);

// Bảng quy đổi điểm thô 40 câu chuẩn Cambridge IELTS (Listening & Academic Reading)
const LISTENING_THRESHOLDS = [
  [39, 9.0], [37, 8.5], [35, 8.0], [32, 7.5], [30, 7.0],
  [26, 6.5], [23, 6.0], [18, 5.5], [16, 5.0], [13, 4.5],
  [10, 4.0], [7, 3.5], [5, 3.0], [3, 2.5], [0, 2.0],
];

const ACADEMIC_READING_THRESHOLDS = [
  [39, 9.0], [37, 8.5], [35, 8.0], [33, 7.5], [30, 7.0],
  [27, 6.5], [23, 6.0], [19, 5.5], [15, 5.0], [13, 4.5],
  [10, 4.0], [8, 3.5], [6, 3.0], [4, 2.5], [0, 2.0],
];

/**
 * Giới hạn điểm năng lực trong khoảng hợp lệ [0, 160].
 */
export function clampProficiencyScore(score) {
  const num = Number(score);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(160, Math.round(num)));
}

/**
 * Làm tròn điểm IELTS Overall theo quy tắc chính thức của Cambridge:
 * .25 làm tròn lên .5; .75 làm tròn lên band nguyên kế tiếp.
 */
export function roundIeltsBand(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  const clamped = Math.max(0, Math.min(9, num));
  return Math.round(clamped * 2) / 2;
}

/**
 * Tính IELTS Overall từ điểm 4 kỹ năng (Nghe, Đọc, Viết, Nói).
 */
export function computeOverallIeltsBand({ listening, reading, writing, speaking }) {
  const vals = [listening, reading, writing, speaking]
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v) && v > 0);
  if (vals.length === 0) return 0;
  const mean = vals.reduce((acc, v) => acc + Math.min(9, v), 0) / vals.length;
  const floorHalf = Math.floor(mean);
  const frac = mean - floorHalf;
  if (frac >= 0.75) return Math.min(9, floorHalf + 1.0);
  if (frac >= 0.25) return Math.min(9, floorHalf + 0.5);
  return floorHalf;
}

/**
 * Quy đổi số câu đúng (trên 40) sang điểm Band IELTS Listening hoặc Academic Reading.
 */
export function rawScoreToIeltsBand(correct, total = 40, skill = "reading") {
  const safeTotal = Number(total) > 0 ? Number(total) : 40;
  const safeCorrect = Math.max(0, Math.min(safeTotal, Number(correct) || 0));
  const scaled = Math.round((safeCorrect / safeTotal) * 40);
  const table = skill === "listening" ? LISTENING_THRESHOLDS : ACADEMIC_READING_THRESHOLDS;
  const matched = table.find(([minRaw]) => scaled >= minRaw);
  return matched[1];
}

/**
 * Tra cứu hồ sơ năng lực đầy đủ (CEFR, IELTS Band, mô tả năng lực) từ điểm 0-160.
 */
export function scoreToProfile(score) {
  const s = clampProficiencyScore(score);
  const entry = PROFICIENCY_BANDS.find((b) => s >= b.minScore && s <= b.maxScore);
  return {
    score: s,
    ...entry,
    progressPct: Math.round((s / 160) * 100),
  };
}

/**
 * Quy đổi ngược từ IELTS Band (2.0-9.0) sang điểm năng lực chuẩn trên thang 0-160.
 */
export function ieltsBandToScore(band) {
  const rounded = roundIeltsBand(band);
  if (rounded <= 2.0) return 8;
  if (rounded >= 9.0) return 158;
  // Nội suy mượt cho band 4.5 (nằm giữa 4.0 và 5.0)
  if (rounded === 4.5) return 58;
  const exact = PROFICIENCY_BANDS.find((b) => b.ieltsBand === rounded);
  return Math.round((exact.minScore + exact.maxScore) / 2);
}

/**
 * Cập nhật điểm năng lực 0-160 theo trung bình động có trọng số khi hoàn thành bài học hoặc đề thi.
 */
export function updateProficiencyScore(currentScore, observedBand, weight = 0.25) {
  const cur = clampProficiencyScore(currentScore);
  const target = ieltsBandToScore(observedBand);
  const w = Math.max(0.05, Math.min(1, Number(weight) || 0.25));
  return clampProficiencyScore(cur * (1 - w) + target * w);
}

/**
 * Tính khoảng cách tới mục tiêu IELTS Band của học viên và số buổi luyện tập khuyến nghị.
 */
export function computeTargetGap(currentScore, targetBand = 7.0) {
  const profile = scoreToProfile(currentScore);
  const goalBand = Math.max(4.0, Math.min(9.0, roundIeltsBand(targetBand) || 7.0));
  const goalScore = ieltsBandToScore(goalBand);
  const pointsNeeded = Math.max(0, goalScore - profile.score);
  const bandGap = Math.max(0, Number((goalBand - profile.ieltsBand).toFixed(1)));
  // Theo Cambridge Guided Learning Hours: ~200 giờ mỗi 1.0 band (~240 bài học ngắn + đề thi)
  const recommendedSessions = Math.ceil(pointsNeeded * 3.5);
  return {
    currentScore: profile.score,
    currentCefr: profile.cefr,
    currentBand: profile.ieltsBand,
    targetBand: goalBand,
    targetScore: goalScore,
    pointsNeeded,
    bandGap,
    reached: profile.score >= goalScore,
    recommendedSessions,
  };
}

/**
 * Tạo chứng nhận năng lực để chia sẻ lên hồ sơ LinkedIn (tương tự Duolingo Score on LinkedIn).
 */
export function formatLinkedInBadge(score, learnerName = "Học viên YYSD", issuedDate = "2026-11-18") {
  const p = scoreToProfile(score);
  const cleanName = String(learnerName || "Học viên YYSD").trim() || "Học viên YYSD";
  const summaryVi =
    `${cleanName} đạt ${p.score}/160 Điểm Năng lực Tiếng Anh Học thuật YYSD ` +
    `(CEFR ${p.cefr} — tương đương IELTS Band ${p.ieltsBand.toFixed(1)}). ${p.canDoVi}`;
  const certUrl =
    `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME` +
    `&name=${encodeURIComponent(`YYSD Academic English Score ${p.score}/160 (CEFR ${p.cefr} / IELTS ${p.ieltsBand.toFixed(1)})`)}` +
    `&organizationName=${encodeURIComponent("Trung tâm Luyện thi Quốc tế YYSD")}` +
    `&issueYear=${encodeURIComponent(String(issuedDate).slice(0, 4))}`;
  return {
    learnerName: cleanName,
    issuedDate,
    score: p.score,
    cefr: p.cefr,
    ieltsBand: p.ieltsBand,
    summaryVi,
    linkedInUrl: certUrl,
  };
}
