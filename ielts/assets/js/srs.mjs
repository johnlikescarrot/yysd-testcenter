/** Lặp lại ngắt quãng SM-2, đã rút gọn cho bài học ngắn. */
export const DAY_MS = 86_400_000;
export const MIN_EASE = 1.3;
export const DEFAULT_EASE = 2.5;

export function createCard(id, now = 0) {
  return { id, repetitions: 0, ease: DEFAULT_EASE, interval: 0, lapses: 0, dueAt: now };
}

/** Đánh giá một thẻ. grade 0–5; dưới 3 đặt lại lịch, từ 3 trở lên tăng khoảng cách. */
export function reviewCard(card, grade, now = 0) {
  if (!card || !Number.isFinite(grade)) {
    throw new TypeError('Thẻ ôn tập hoặc điểm đánh giá không hợp lệ');
  }
  const g = Math.min(5, Math.max(0, Math.round(grade)));
  const miss = 5 - g;
  const easeDelta = 0.1 - miss * (0.08 + miss * 0.02);
  const ease = Math.max(MIN_EASE, (card.ease ?? DEFAULT_EASE) + easeDelta);
  if (g < 3) {
    return {
      ...card, ease, repetitions: 0, interval: 1,
      lapses: (card.lapses ?? 0) + 1, dueAt: now + DAY_MS
    };
  }
  const repetitions = (card.repetitions ?? 0) + 1;
  let interval = 1;
  if (repetitions === 2) interval = 6;
  else if (repetitions > 2) interval = Math.max(1, Math.round((card.interval ?? 1) * ease));
  return { ...card, ease, repetitions, interval, dueAt: now + interval * DAY_MS };
}

export function isDue(card, now = 0) {
  return !card || (card.dueAt ?? 0) <= now;
}

/** Hàng đợi ôn tập: lọc thẻ đến hạn, sắp theo hạn cũ nhất, giới hạn số lượng. */
export function dueQueue(cards, now = 0, limit = 10) {
  if (!Array.isArray(cards)) return [];
  return cards
    .filter((card) => isDue(card, now))
    .sort((a, b) => (a.dueAt ?? 0) - (b.dueAt ?? 0))
    .slice(0, Math.max(0, limit));
}

export function mastery(cards) {
  if (!Array.isArray(cards) || cards.length === 0) return 0;
  const learned = cards.filter((card) => (card.repetitions ?? 0) >= 3).length;
  return Math.round((learned / cards.length) * 100);
}
