/**
 * Thuật toán Lặp lại Ngắt quãng Hồi quy Chu kỳ Bán rã (Half-Life Regression — HLR)
 * Dựa trên Settles & Meeder (2016), ACL: "A Trainable Spaced Repetition Model for Language Learning"
 * DOI: 10.18653/v1/P16-1174
 *
 * Xác suất nhớ lại mục kiến thức sau khoảng thời gian deltaHours:
 *   p = 2^(-deltaHours / halfLifeHours)
 * Chu kỳ bán rã ước lượng:
 *   h = clamp(2^(theta · x), MIN_HALF_LIFE_HOURS, MAX_HALF_LIFE_HOURS)
 */

export const MIN_HALF_LIFE_HOURS = 0.5;
export const MAX_HALF_LIFE_HOURS = 24 * 180; // 180 ngày (4320 giờ)

export const DEFAULT_HLR_WEIGHTS = Object.freeze({
  bias: 2.2, // Chu kỳ bán rã khởi điểm ~4.6 giờ
  rightSqrt: 1.85, // Tăng mạnh chu kỳ bán rã sau mỗi lần nhớ đúng
  wrongSqrt: -1.15, // Rút ngắn chu kỳ bán rã khi quên để ôn lại sớm
  difficulty: -1.1, // Từ học thuật C1/C2 khó nhớ hơn từ cơ bản A2/B1
  streakBonus: 0.35, // Thưởng chuỗi trả lời đúng liên tiếp
});

function clamp(val, lo, hi) {
  return Math.max(lo, Math.min(hi, val));
}

/**
 * Trích xuất vector đặc trưng x cho một thẻ từ vựng / kỹ năng IELTS.
 */
export function extractHlrFeatures(card) {
  const right = Math.max(0, Number(card.right) || 0);
  const wrong = Math.max(0, Number(card.wrong) || 0);
  const difficulty = clamp(Number(card.difficulty) || 0.4, 0, 1);
  const consecutiveRight = Math.max(0, Number(card.consecutiveRight) || 0);
  return {
    bias: 1,
    rightSqrt: Math.sqrt(1 + right) - 1,
    wrongSqrt: Math.sqrt(1 + wrong) - 1,
    difficulty,
    streakBonus: Math.min(3, consecutiveRight * 0.5),
  };
}

/**
 * Tính chu kỳ bán rã trí nhớ h (đơn vị: giờ) từ thẻ và bộ trọng số HLR.
 */
export function predictHalfLifeHours(card, weights = DEFAULT_HLR_WEIGHTS) {
  const x = extractHlrFeatures(card);
  const dot =
    weights.bias * x.bias +
    weights.rightSqrt * x.rightSqrt +
    weights.wrongSqrt * x.wrongSqrt +
    weights.difficulty * x.difficulty +
    weights.streakBonus * x.streakBonus;
  const raw = 2 ** clamp(dot, -2, 13);
  return Number(clamp(raw, MIN_HALF_LIFE_HOURS, MAX_HALF_LIFE_HOURS).toFixed(3));
}

/**
 * Dự đoán xác suất nhớ lại p trong khoảng (0, 1] theo đường cong quên Ebbinghaus-HLR.
 */
export function predictRecallProbability(elapsedHours, halfLifeHours) {
  const delta = Math.max(0, Number(elapsedHours) || 0);
  const h = clamp(Number(halfLifeHours) || MIN_HALF_LIFE_HOURS, MIN_HALF_LIFE_HOURS, MAX_HALF_LIFE_HOURS);
  const p = 2 ** (-delta / h);
  return Number(clamp(p, 0.0001, 1).toFixed(4));
}

/**
 * Tạo mới một thẻ ôn tập HLR chuẩn hóa.
 */
export function createHlrCard({
  id,
  term,
  meaningVi,
  skill = "vocabulary",
  exampleEn = "",
  difficulty = 0.4,
  nowMs = Date.now(),
}) {
  const base = {
    id: String(id),
    term: String(term),
    meaningVi: String(meaningVi),
    skill: String(skill),
    exampleEn: String(exampleEn),
    difficulty: clamp(Number(difficulty) || 0.4, 0, 1),
    right: 0,
    wrong: 0,
    consecutiveRight: 0,
    lastReviewedMs: Number(nowMs),
  };
  return {
    ...base,
    halfLifeHours: predictHalfLifeHours(base),
  };
}

/**
 * Ghi nhận kết quả một lần ôn tập (correct: boolean) và cập nhật đồng thời
 * thẻ HLR cùng bộ trọng số cá nhân hóa bằng hạ gradient trực tuyến (SGD).
 */
export function reviewHlrCard(
  card,
  correct,
  nowMs = Date.now(),
  weights = DEFAULT_HLR_WEIGHTS,
  learningRate = 0.03,
) {
  const elapsedHours = Math.max(0.05, (Number(nowMs) - Number(card.lastReviewedMs || nowMs)) / 3600000);
  const predictedH = predictHalfLifeHours(card, weights);
  const predictedP = predictRecallProbability(elapsedHours, predictedH);
  const observedP = correct ? 0.99 : 0.01;
  const empiricalH = clamp(
    -elapsedHours / Math.log2(observedP),
    MIN_HALF_LIFE_HOURS,
    MAX_HALF_LIFE_HOURS,
  );

  // Hạ gradient có điều chuẩn L2 theo công thức Settles & Meeder (2016)
  const feats = extractHlrFeatures(card);
  const pErr = predictedP - (correct ? 1 : 0);
  const hLogErr = Math.log2(predictedH) - Math.log2(empiricalH);
  const step = clamp(pErr * 0.6 + hLogErr * 0.08, -1.5, 1.5);
  const l2 = 0.002;
  const nextWeights = {};
  for (const key of Object.keys(DEFAULT_HLR_WEIGHTS)) {
    const curW = Number(weights[key]);
    const updated = curW - learningRate * (step * feats[key] + l2 * (curW - DEFAULT_HLR_WEIGHTS[key]));
    nextWeights[key] = Number(clamp(updated, -5, 6).toFixed(4));
  }

  const nextCard = {
    ...card,
    right: (Number(card.right) || 0) + (correct ? 1 : 0),
    wrong: (Number(card.wrong) || 0) + (correct ? 0 : 1),
    consecutiveRight: correct ? (Number(card.consecutiveRight) || 0) + 1 : 0,
    lastReviewedMs: Number(nowMs),
  };
  nextCard.halfLifeHours = predictHalfLifeHours(nextCard, nextWeights);
  nextCard.nextDueMs = Math.round(Number(nowMs) + nextCard.halfLifeHours * 3600000);

  return {
    card: nextCard,
    weights: nextWeights,
    priorRecallProb: predictedP,
  };
}

/**
 * Phân loại trạng thái ghi nhớ của thẻ (tương tự thanh độ bền kỹ năng vỡ/vàng của Duolingo).
 */
export function classifyMemoryStrength(recallProb) {
  const p = Number(recallProb) || 0;
  if (p >= 0.85) return { code: "gold", labelVi: "Vững vàng", needsReview: false };
  if (p >= 0.6) return { code: "good", labelVi: "Ổn định", needsReview: false };
  if (p >= 0.38) return { code: "fading", labelVi: "Sắp quên — nên ôn", needsReview: true };
  return { code: "cracked", labelVi: "Cần củng cố ngay", needsReview: true };
}

/**
 * Sắp xếp hàng đợi ôn tập thông minh ưu tiên các thẻ có xác suất nhớ thấp nhất.
 */
export function getReviewQueue(cards = [], nowMs = Date.now(), threshold = 0.6) {
  const enriched = cards.map((card) => {
    const elapsedHours = Math.max(0, (Number(nowMs) - Number(card.lastReviewedMs || nowMs)) / 3600000);
    const halfLifeHours = Number(card.halfLifeHours) || predictHalfLifeHours(card);
    const recallProb = predictRecallProbability(elapsedHours, halfLifeHours);
    const status = classifyMemoryStrength(recallProb);
    return {
      ...card,
      elapsedHours: Number(elapsedHours.toFixed(2)),
      halfLifeHours,
      recallProb,
      status,
      isDue: recallProb <= threshold,
    };
  });
  enriched.sort((a, b) => a.recallProb - b.recallProb || b.difficulty - a.difficulty);
  return {
    all: enriched,
    due: enriched.filter((c) => c.isDue),
    averageRetentionPct: enriched.length
      ? Math.round((enriched.reduce((sum, c) => sum + c.recallProb, 0) / enriched.length) * 100)
      : 100,
  };
}

/**
 * Tạo chuỗi điểm đường cong quên (0h -> 14 ngày) phục vụ biểu đồ trực quan và báo cáo PDF.
 */
export function buildForgettingCurvePoints(halfLifeHours) {
  const checkpoints = [0, 6, 12, 24, 48, 72, 168, 336];
  return checkpoints.map((hours) => ({
    hours,
    labelVi: hours < 24 ? `${hours} giờ` : `${hours / 24} ngày`,
    retentionPct: Math.round(predictRecallProbability(hours, halfLifeHours) * 100),
  }));
}
