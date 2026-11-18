/**
 * Ôn tập ngắt quãng (SM-2 rút gọn) cho thẻ từ vựng.
 * Mỗi thẻ: { ease, interval (ngày), reps, lapses, due (mốc thời gian), seen }
 */

import { DAY_MS, dayKey } from './date.js';

export const MIN_EASE = 1.3;
export const MAX_EASE = 3;

export const GRADES = [
  { id: 'again', label: 'Lại', hint: 'Quên hẳn' },
  { id: 'hard', label: 'Khó', hint: 'Nhớ mang máng' },
  { id: 'good', label: 'Tốt', hint: 'Nhớ đúng' },
  { id: 'easy', label: 'Dễ', hint: 'Quá dễ' },
];

const clampEase = (value) => Math.max(MIN_EASE, Math.min(MAX_EASE, Math.round(value * 100) / 100));

/** Thẻ mới, đến hạn ngay. */
export function newCard(now) {
  return { ease: 2.5, interval: 0, reps: 0, lapses: 0, due: now, last: 0, seen: 0 };
}

/** Lên lịch ôn cho một thẻ theo mức đánh giá. */
export function schedule(card, grade, now) {
  const choice = GRADES.find((item) => item.id === grade);
  if (!choice) throw new Error(`Mức đánh giá không hợp lệ: ${grade}`);
  const base = { ...newCard(now), ...card, seen: (card.seen || 0) + 1, last: now };

  if (choice.id === 'again') {
    return {
      ...base,
      reps: 0,
      lapses: (base.lapses || 0) + 1,
      interval: 0,
      ease: clampEase(base.ease - 0.2),
      due: now + 10 * 60 * 1000,
    };
  }

  const ease = clampEase(base.ease + (choice.id === 'easy' ? 0.15 : choice.id === 'hard' ? -0.15 : 0));
  const reps = (base.reps || 0) + 1;
  let interval;
  if (reps === 1) interval = 1;
  else if (reps === 2) interval = 3;
  else interval = Math.max(1, Math.round(base.interval * ease * (choice.id === 'hard' ? 0.7 : 1)));

  return { ...base, reps, interval, ease, due: now + interval * DAY_MS };
}

/** Thẻ đã đến hạn ôn. */
export function isDue(card, now) {
  return Boolean(card) && card.due <= now;
}

/** Danh sách thẻ đến hạn, sắp xếp theo hạn gần nhất. */
export function dueCards(cards, now) {
  return Object.entries(cards || {})
    .filter(([, card]) => isDue(card, now))
    .sort((a, b) => a[1].due - b[1].due);
}

/** Nhãn thời điểm ôn kế tiếp bằng tiếng Việt. */
export function relativeDue(card, now) {
  if (!card) return 'Chưa có';
  if (card.due <= now) return 'Đến hạn';
  const days = Math.ceil((card.due - now) / DAY_MS);
  if (days <= 1) return 'Ngày mai';
  return `${days} ngày nữa`;
}

/** Thống kê kho thẻ: tổng, đến hạn, đã thuộc (khoảng ôn ≥ 21 ngày). */
export function deckStats(cards, now) {
  const entries = Object.values(cards || {});
  const due = entries.filter((card) => isDue(card, now)).length;
  const mastered = entries.filter((card) => (card.interval || 0) >= 21).length;
  const reviews = entries.reduce((sum, card) => sum + (card.seen || 0), 0);
  const lapses = entries.reduce((sum, card) => sum + (card.lapses || 0), 0);
  const accuracy = reviews > 0 ? Math.max(0, Math.min(1, 1 - lapses / reviews)) : 1;
  return { total: entries.length, due, mastered, reviews, lapses, accuracy };
}

/** Tạo bản đồ thẻ mới cho danh sách từ vựng. */
export function seedDeck(vocab, now) {
  const deck = {};
  for (const word of vocab || []) {
    deck[word.id] = newCard(now);
  }
  return deck;
}

/** Khoá ngày ôn gần nhất, dùng cho biểu đồ. */
export function lastReviewDay(cards) {
  const entries = Object.values(cards || {});
  if (entries.length === 0) return null;
  const latest = entries.reduce((max, card) => Math.max(max, card.last || 0), 0);
  return latest > 0 ? dayKey(latest) : null;
}
