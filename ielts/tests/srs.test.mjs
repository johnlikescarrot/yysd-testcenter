import test from 'node:test';
import assert from 'node:assert/strict';
import { DAY_MS, MIN_EASE, DEFAULT_EASE, createCard, reviewCard, isDue, dueQueue, mastery } from '../assets/js/srs.mjs';

test('createCard khởi tạo đúng, kể cả không truyền thời gian', () => {
  assert.deepEqual(createCard('alpha'), {
    id: 'alpha', repetitions: 0, ease: DEFAULT_EASE, interval: 0, lapses: 0, dueAt: 0
  });
  assert.equal(createCard('beta', 1000).dueAt, 1000);
});

test('reviewCard từ chối đầu vào không hợp lệ', () => {
  assert.throws(() => reviewCard(null, 4), TypeError);
  assert.throws(() => reviewCard(createCard('a'), 'x'), TypeError);
  assert.throws(() => reviewCard(createCard('a'), Number.NaN), TypeError);
});

test('reviewCard đặt lại lịch khi điểm dưới 3 và giữ sàn ease', () => {
  const now = 10 * DAY_MS;
  const missed = reviewCard(createCard('a', 0), 1, now);
  assert.equal(missed.repetitions, 0);
  assert.equal(missed.interval, 1);
  assert.equal(missed.lapses, 1);
  assert.equal(missed.dueAt, now + DAY_MS);
  const floored = reviewCard({ id: 'a', ease: MIN_EASE, lapses: 2, dueAt: 0 }, 0, now);
  assert.equal(floored.ease, MIN_EASE);
  assert.equal(floored.lapses, 3);
  const noLapses = reviewCard({ id: 'a' }, 1, now);
  assert.equal(noLapses.lapses, 1);
});

test('reviewCard tăng khoảng cách 1 → 6 → ease × interval', () => {
  const first = reviewCard(createCard('a'), 5, 0);
  assert.equal(first.repetitions, 1);
  assert.equal(first.interval, 1);
  assert.equal(first.dueAt, DAY_MS);
  const second = reviewCard(first, 4, DAY_MS);
  assert.equal(second.repetitions, 2);
  assert.equal(second.interval, 6);
  assert.equal(second.dueAt, DAY_MS + 6 * DAY_MS);
  const third = reviewCard(second, 3, second.dueAt);
  assert.equal(third.repetitions, 3);
  assert.ok(third.interval > 6);
  const tiny = reviewCard({ id: 'a', repetitions: 2, interval: 0.1, ease: 1.3 }, 5, 0);
  assert.equal(tiny.interval, 1);
  const noInterval = reviewCard({ id: 'a', repetitions: 2 }, 5, 0);
  assert.equal(noInterval.repetitions, 3);
  assert.equal(noInterval.interval, 3);
  const bare = reviewCard({ id: 'a' }, 5, 7 * DAY_MS);
  assert.equal(bare.repetitions, 1);
  assert.equal(bare.lapses, undefined);
});

test('reviewCard kẹp điểm đánh giá trong khoảng 0–5', () => {
  const high = reviewCard(createCard('a'), 99, 0);
  assert.equal(high.ease, 2.6);
  const low = reviewCard(createCard('a'), -99, 0);
  assert.equal(low.repetitions, 0);
});

test('isDue xử lý thẻ rỗng, thiếu hạn và hai chiều so sánh', () => {
  assert.equal(isDue(null, 0), true);
  assert.equal(isDue({ id: 'a' }, 5), true);
  assert.equal(isDue({ dueAt: 10 }, 9), false);
  assert.equal(isDue({ dueAt: 10 }, 10), true);
});

test('dueQueue lọc, sắp, giới hạn và chịu đầu vào sai', () => {
  const cards = [
    { id: 'late', dueAt: 30 }, { id: 'soon', dueAt: 5 },
    { id: 'future', dueAt: 90 }, { id: 'nodue' }
  ];
  assert.deepEqual(dueQueue(null, 10), []);
  assert.deepEqual(dueQueue(cards, 10, 2).map((c) => c.id), ['nodue', 'soon']);
  assert.equal(dueQueue(cards, 10, 0).length, 0);
  assert.equal(dueQueue(cards, 10, -3).length, 0);
  assert.equal(dueQueue(cards, 100).length, 4);
  assert.deepEqual(dueQueue([{ id: 'x' }, { id: 'y' }], 0).map((c) => c.id), ['x', 'y']);
});

test('mastery đo tỉ lệ thẻ đã thuộc', () => {
  assert.equal(mastery(null), 0);
  assert.equal(mastery([]), 0);
  assert.equal(mastery([{ repetitions: 3 }, { repetitions: 2 }, { id: 'x' }]), 33);
  assert.equal(mastery([{ repetitions: 4 }, { repetitions: 5 }]), 100);
});
