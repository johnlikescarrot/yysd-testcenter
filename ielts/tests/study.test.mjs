import assert from 'node:assert/strict';
import { test } from 'node:test';
import { lessons, questions } from '../site/catalog.mjs';
import {
  dailyPoints, dayKey, dueItems, finishPractice, isCorrect, milestones, nextLesson, nextReviewDay, parseState, readState,
  shiftDay, skillProgress, storageKey, streak, totalPoints, week, writeState,
} from '../site/study.mjs';

const today = '2026-11-18';
const initial = () => parseState('{}');
const listenId = lessons[0].id;
const q1 = 'l1-time';
const q2 = 'l1-entrance';
const result = (id, correct = true) => ({ id, correct });

test('tiến độ lỗi được xử lý mà không làm ứng dụng ngừng chạy', () => {
  const storage = new Map();
  const capable = { localStorage: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) } };
  assert.deepEqual(readState(capable), { state: initial(), available: true });
  assert.equal(writeState(capable, { ...initial(), goal: 30 }), true);
  assert.equal(readState(capable).state.goal, 30);
  storage.set(storageKey, 'không phải JSON');
  assert.deepEqual(readState(capable), { state: initial(), available: false });
  const blocked = { get localStorage() { throw new Error('blocked'); } };
  assert.deepEqual(readState(blocked), { state: initial(), available: false });
  assert.equal(writeState(blocked, initial()), false);
  assert.deepEqual(parseState('[]'), initial());
  assert.deepEqual(parseState('false'), initial());
});

test('chỉ giữ ID, ngày và mức ôn hợp lệ khi đọc lại', () => {
  const parsed = parseState(JSON.stringify({
    goal: 30, done: [listenId, listenId, 'unknown'],
    days: { [today]: [q1, q1, 'unknown'], '2026-11-19': 3, '2026-02-30': [q1], notaday: [q1] },
    review: {
      [q1]: { due: '2026-11-19', level: 1 },
      [q2]: { due: 2026, level: 1 },
      'l1-card': { due: today, level: 1.5 },
      'l1-floor': { due: today, level: -1 },
      'r1-main': { due: today, level: 6 },
      'r1-cost': null,
      unknown: { due: today, level: 0 },
    },
  }));
  assert.deepEqual(parsed, {
    goal: 30, done: [listenId], days: { [today]: [q1], '2026-11-19': [] },
    review: { [q1]: { due: '2026-11-19', level: 1 } },
  });
  assert.equal(parseState('{"goal":"30"}').goal, 20);
});

test('ngày học theo giờ địa phương và phép cộng ngày không phụ thuộc đổi giờ', () => {
  assert.equal(dayKey(new Date(2024, 1, 29, 23, 30)), '2024-02-29');
  assert.match(dayKey(), /^\d{4}-\d\d-\d\d$/);
  assert.equal(shiftDay('2024-02-28', 1), '2024-02-29');
  assert.equal(shiftDay('2024-03-01', -1), '2024-02-29');
  assert.equal(shiftDay('2026-01-01', -1), '2025-12-31');
  assert.equal(shiftDay('2026-12-30', 7), '2027-01-06');
});

test('đáp án tiếng Anh chấp nhận biến thể được liệt kê, không chấm gần đúng', () => {
  const { item } = questions.get('w1-verb');
  assert.equal(isCorrect(item, '　ＤＲＯＰＰＥＤ  '), true);
  assert.equal(isCorrect(item, 'drops'), false);
  assert.equal(isCorrect(questions.get(q1).item, '2:30    P.M.'), true);
});

test('XP tính một lần mỗi câu mỗi ngày; sai được ôn lại ngay', () => {
  const state = finishPractice(initial(), listenId, [result(q1), result(q2, false)], today);
  assert.equal(dailyPoints(state, today), 10);
  assert.equal(dailyPoints(state, '2026-11-17'), 0);
  assert.equal(streak(state, today), 1);
  assert.deepEqual(state.review, { [q1]: { due: '2026-11-19', level: 1 }, [q2]: { due: today, level: 0 } });
  assert.deepEqual(dueItems(state, today).map(({ item }) => item.id), [q2]);
  assert.equal(nextReviewDay(state, today), '2026-11-19');
  const repeat = finishPractice(state, listenId, [result(q1), result(q2)], today);
  assert.deepEqual(repeat.done, [listenId]);
  assert.equal(dailyPoints(repeat, today), 20);
  assert.equal(totalPoints(repeat), 20);
  assert.equal(repeat.review[q1].due, state.review[q1].due);
  assert.equal(nextLesson(state).id, lessons[1].id);
  assert.equal(nextLesson({ ...state, done: lessons.map(({ id }) => id) }).id, listenId);
});

test('lịch giãn cách chỉ tiến khi đến hạn và đặt lại nếu sai', () => {
  let day = today;
  let state = initial();
  for (const interval of [1, 3, 7, 14, 30, 30]) {
    state = finishPractice(state, null, [result(q1)], day);
    assert.equal(state.review[q1].due, shiftDay(day, interval));
    day = state.review[q1].due;
  }
  assert.equal(totalPoints(state), 60);
  assert.deepEqual(state.done, []);
  state = finishPractice(state, null, [result(q1, false), result(q2, false), result('r1-main', false)], day);
  assert.equal(state.review[q1].level, 0);
  assert.equal(nextReviewDay(state, day), undefined);
  assert.deepEqual(dueItems(state, day).map(({ item }) => item.id), [q2, q1, 'r1-main']);
  state = finishPractice(state, null, [result('r1-main', false)], shiftDay(day, 1));
  assert.deepEqual(dueItems(state, shiftDay(day, 1)).map(({ item }) => item.id), [q2, q1, 'r1-main']);
});

test('đếm chuỗi ngày có hoạt động, kể cả khi không có XP', () => {
  let state = initial();
  for (const offset of [-2, -1, 0]) {
    state = finishPractice(state, listenId, [result(q1, false)], shiftDay(today, offset));
  }
  assert.equal(dailyPoints(state, today), 0);
  assert.equal(streak(initial(), today), 0);
  assert.equal(streak(state, today), 3);
  assert.equal(streak(state, shiftDay(today, 1)), 3);
  assert.equal(streak(state, shiftDay(today, 2)), 0);
  const days = week(state, today);
  assert.equal(days.length, 7);
  assert.equal(days[0].day, shiftDay(today, -6));
  assert.deepEqual(days.map(({ active }) => active), [false, false, false, false, true, true, true]);
  assert.deepEqual(milestones(state, today).map(({ earned }) => earned), [true, true, false]);
  state.done = lessons.filter(({ unit }) => unit === 1).map(({ id }) => id);
  assert.deepEqual(skillProgress(state).map(({ done, total }) => [done, total]), [[1, 2], [1, 2], [1, 2], [1, 2]]);
  assert.deepEqual(milestones(state, today).map(({ earned }) => earned), [true, true, true]);
});
