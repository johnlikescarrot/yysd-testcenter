import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MIN_EASE, MAX_EASE, GRADES, newCard, schedule, isDue, dueCards, relativeDue, deckStats, seedDeck, lastReviewDay,
} from '../js/core/srs.js';
import { DAY_MS, dayKey } from '../js/core/date.js';

const NOW = new Date('2026-11-18T09:00:00').getTime();

test('newCard tạo thẻ mới đến hạn ngay', () => {
  const card = newCard(NOW);
  assert.deepEqual(card, { ease: 2.5, interval: 0, reps: 0, lapses: 0, due: NOW, last: 0, seen: 0 });
  assert.deepEqual(GRADES.map((grade) => grade.id), ['again', 'hard', 'good', 'easy']);
});

test('schedule từ chối mức đánh giá lạ', () => {
  assert.throws(() => schedule(newCard(NOW), 'tuyệt', NOW), /không hợp lệ/);
});

test('schedule "again" đặt lại chuỗi và tăng lapses', () => {
  const card = { ease: 2.5, interval: 12, reps: 4, lapses: 1, due: NOW, last: NOW - DAY_MS, seen: 5 };
  const next = schedule(card, 'again', NOW);
  assert.equal(next.reps, 0);
  assert.equal(next.lapses, 2);
  assert.equal(next.interval, 0);
  assert.equal(next.ease, 2.3);
  assert.equal(next.due, NOW + 10 * 60 * 1000);
  assert.equal(next.seen, 6);

  const floor = schedule({ ease: 1.4, reps: 1, interval: 1, lapses: 0 }, 'again', NOW);
  assert.equal(floor.ease, MIN_EASE);
});

test('schedule "good" tăng khoảng ôn 1 → 3 → nhân ease', () => {
  let card = newCard(NOW);
  card = schedule(card, 'good', NOW);
  assert.equal(card.reps, 1);
  assert.equal(card.interval, 1);
  assert.equal(card.due, NOW + DAY_MS);

  card = schedule(card, 'good', NOW + DAY_MS);
  assert.equal(card.reps, 2);
  assert.equal(card.interval, 3);

  card = schedule(card, 'good', NOW + 4 * DAY_MS);
  assert.equal(card.reps, 3);
  assert.equal(card.interval, 8);
  assert.equal(card.ease, 2.5);
  assert.equal(card.seen, 3);
});

test('schedule "hard" giảm ease và nhân 0.7', () => {
  const base = { ease: 2.5, interval: 10, reps: 3, lapses: 0, due: NOW, last: 0, seen: 3 };
  const card = schedule(base, 'hard', NOW);
  assert.equal(card.ease, 2.35);
  assert.equal(card.interval, 16);
  assert.equal(card.reps, 4);

  const tiny = schedule({ ease: 1.5, interval: 1, reps: 5, lapses: 0 }, 'hard', NOW);
  assert.ok(tiny.interval >= 1);
  const floor = schedule({ ease: 1.3, interval: 2, reps: 4, lapses: 0 }, 'hard', NOW);
  assert.equal(floor.ease, MIN_EASE);
});

test('schedule "easy" cộng ease và chặn trần', () => {
  const card = schedule({ ease: 2.5, interval: 6, reps: 3, lapses: 0 }, 'easy', NOW);
  assert.equal(card.ease, 2.65);
  assert.equal(card.interval, 16);
  const ceiling = schedule({ ease: 2.95, interval: 6, reps: 3, lapses: 0 }, 'easy', NOW);
  assert.equal(ceiling.ease, MAX_EASE);
});

test('isDue và dueCards', () => {
  assert.equal(isDue(null, NOW), false);
  assert.equal(isDue({ due: NOW + 1 }, NOW), false);
  assert.equal(isDue({ due: NOW }, NOW), true);
  const cards = {
    b: { due: NOW - DAY_MS },
    a: { due: NOW - 2 * DAY_MS },
    c: { due: NOW + DAY_MS },
  };
  assert.deepEqual(dueCards(cards, NOW).map(([id]) => id), ['a', 'b']);
  assert.deepEqual(dueCards(null, NOW), []);
});

test('relativeDue mô tả thời điểm ôn kế tiếp', () => {
  assert.equal(relativeDue(null, NOW), 'Chưa có');
  assert.equal(relativeDue({ due: NOW - 1 }, NOW), 'Đến hạn');
  assert.equal(relativeDue({ due: NOW + 1000 }, NOW), 'Ngày mai');
  assert.equal(relativeDue({ due: NOW + 3 * DAY_MS }, NOW), '3 ngày nữa');
});

test('deckStats thống kê kho thẻ', () => {
  const empty = deckStats(null, NOW);
  assert.deepEqual(empty, { total: 0, due: 0, mastered: 0, reviews: 0, lapses: 0, accuracy: 1 });

  const cards = {
    a: { interval: 25, seen: 4, lapses: 1, due: NOW - 1 },
    b: { interval: 4, seen: 2, lapses: 0, due: NOW + DAY_MS },
  };
  const stats = deckStats(cards, NOW);
  assert.equal(stats.total, 2);
  assert.equal(stats.due, 1);
  assert.equal(stats.mastered, 1);
  assert.equal(stats.reviews, 6);
  assert.equal(stats.lapses, 1);
  assert.ok(stats.accuracy > 0.8 && stats.accuracy < 0.9);

  const noisy = deckStats({ a: { interval: 0, seen: 2, lapses: 5, due: NOW } }, NOW);
  assert.equal(noisy.accuracy, 0);
});

test('seedDeck tạo thẻ cho toàn bộ kho từ', () => {
  const deck = seedDeck([{ id: 'x' }, { id: 'y' }], NOW);
  assert.deepEqual(Object.keys(deck).sort(), ['x', 'y']);
  assert.equal(deck.x.due, NOW);
  assert.deepEqual(seedDeck(null, NOW), {});
});

test('lastReviewDay trả về ngày ôn gần nhất', () => {
  assert.equal(lastReviewDay(null), null);
  assert.equal(lastReviewDay({ a: { last: 0 } }), null);
  assert.equal(lastReviewDay({ a: { last: NOW } }), dayKey(NOW));
  assert.equal(lastReviewDay({ a: { last: NOW - DAY_MS }, b: { last: NOW } }), dayKey(NOW));
});
