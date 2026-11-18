import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STORAGE_KEY, clearProgress, completeLesson, dueQuestions, emptyProgress, isDay,
  loadProgress, localDay, normaliseProgress, recentDays, saveProgress, shiftDay, streakFor
} from '../assets/js/ielts-vi-core.mjs';

function storage(initial = {}) {
  const values = { ...initial };
  return {
    getItem: (key) => values[key] ?? null,
    setItem: (key, value) => { values[key] = value; },
    removeItem: (key) => { delete values[key]; }
  };
}

const blocked = {
  getItem() { throw new Error('blocked'); },
  setItem() { throw new Error('blocked'); },
  removeItem() { throw new Error('blocked'); }
};

test('days are real calendar dates and date arithmetic crosses months and leap years', () => {
  assert.equal(isDay(null), false);
  assert.equal(isDay('2025-1-01'), false);
  assert.equal(isDay('2025-02-30'), false);
  assert.equal(isDay('2024-02-29'), true);
  assert.equal(localDay(new Date(2024, 0, 2, 14)), '2024-01-02');
  assert.match(localDay(), /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(shiftDay('2024-03-01', -1), '2024-02-29');
  assert.equal(shiftDay('2024-12-31', 1), '2025-01-01');
});

test('progress normalization rejects malformed and unsafe persisted data', () => {
  assert.deepEqual(normaliseProgress(null), emptyProgress());
  assert.deepEqual(normaliseProgress('hello'), emptyProgress());
  assert.deepEqual(normaliseProgress({ version: 2 }), emptyProgress());
  assert.deepEqual(normaliseProgress({ version: 1, xp: -1, days: null, lessons: null, reviews: null }), emptyProgress());
  const input = {
    version: 1, xp: 35, days: ['2026-11-18', 'oops', '2026-11-17', '2026-11-18'],
    lessons: { reading: 2, 'bad key': 7, invalid: -1, fraction: 1.5 },
    reviews: {
      'read-streets': { due: '2026-11-20', step: 1 },
      'bad key': { due: '2026-11-20', step: 1 },
      'missing-value': null,
      'bad-date': { due: '2026-02-30', step: 1 },
      'bad-step': { due: '2026-11-20', step: -1 },
      'large-step': { due: '2026-11-20', step: 5 },
      'fraction-step': { due: '2026-11-20', step: 1.5 }
    }
  };
  assert.deepEqual(normaliseProgress(input), {
    version: 1, xp: 35, days: ['2026-11-17', '2026-11-18'],
    lessons: { reading: 2 }, reviews: { 'read-streets': { due: '2026-11-20', step: 1 } }
  });
  assert.deepEqual(normaliseProgress({ version: 1, xp: Number.MAX_SAFE_INTEGER + 1 }), emptyProgress());
  assert.deepEqual(normaliseProgress({ version: 1, xp: '12', lessons: 8, reviews: 9 }), emptyProgress());
});

test('storage handles normal, corrupt, unavailable, and disabled browser storage', () => {
  const store = storage();
  assert.deepEqual(loadProgress(store), { progress: emptyProgress(), available: true });
  const progress = { ...emptyProgress(), xp: 25 };
  assert.equal(saveProgress(store, progress), true);
  assert.deepEqual(loadProgress(store), { progress, available: true });
  assert.equal(clearProgress(store), true);
  assert.deepEqual(loadProgress(store).progress, emptyProgress());
  assert.deepEqual(loadProgress(storage({ [STORAGE_KEY]: '{bad json' })), { progress: emptyProgress(), available: true });
  assert.deepEqual(loadProgress(blocked), { progress: emptyProgress(), available: false });
  assert.deepEqual(loadProgress(null), { progress: emptyProgress(), available: false });
  assert.equal(saveProgress(blocked, progress), false);
  assert.equal(clearProgress(blocked), false);
});

test('streaks count contiguous local days without punishing a day still in progress', () => {
  const days = ['2026-11-15', '2026-11-16', '2026-11-17'];
  assert.equal(streakFor(days, '2026-11-17'), 3);
  assert.equal(streakFor(days, '2026-11-18'), 3);
  assert.equal(streakFor(days, '2026-11-19'), 0);
  assert.equal(streakFor(['2026-11-20'], '2026-11-18'), 0);
  assert.deepEqual(recentDays(['2026-11-17', '2026-11-18'], '2026-11-18'), [
    { day: '2026-11-12', active: false }, { day: '2026-11-13', active: false },
    { day: '2026-11-14', active: false }, { day: '2026-11-15', active: false },
    { day: '2026-11-16', active: false }, { day: '2026-11-17', active: true },
    { day: '2026-11-18', active: true }
  ]);
});

test('lessons award XP once per completion and schedule correct and incorrect answers', () => {
  const original = emptyProgress();
  const result = completeLesson(original, 'reading', [
    { id: 'one', correct: true }, { id: 'two', correct: false }
  ], '2026-11-18');
  assert.deepEqual(original, emptyProgress());
  assert.equal(result.earned, 15);
  assert.equal(result.correct, 1);
  assert.deepEqual(result.progress, {
    version: 1, xp: 15, days: ['2026-11-18'], lessons: { reading: 1 },
    reviews: { one: { step: 1, due: '2026-11-21' }, two: { step: 0, due: '2026-11-19' } }
  });
  const early = completeLesson(result.progress, 'reading', [
    { id: 'one', correct: true }, { id: 'two', correct: true }
  ], '2026-11-18');
  assert.deepEqual(early.progress.reviews, result.progress.reviews);
  assert.equal(early.progress.lessons.reading, 2);
  assert.deepEqual(early.progress.days, ['2026-11-18']);
  assert.equal(early.progress.xp, 35);
  const questions = [{ id: 'one' }, { id: 'two' }, { id: 'unknown' }];
  assert.deepEqual(dueQuestions(early.progress, questions, '2026-11-19'), [{ id: 'two' }]);
  assert.deepEqual(dueQuestions(early.progress, questions, '2026-11-21'), [{ id: 'one' }, { id: 'two' }]);
});

test('successful due reviews lengthen intervals; mistakes reset them', () => {
  let progress = emptyProgress();
  for (const [today, expectedStep, expectedDue] of [
    ['2026-01-01', 1, '2026-01-04'],
    ['2026-01-04', 2, '2026-01-11'],
    ['2026-01-11', 3, '2026-01-25'],
    ['2026-01-25', 4, '2026-02-24'],
    ['2026-02-24', 4, '2026-03-26']
  ]) {
    progress = completeLesson(progress, 'review', [{ id: 'one', correct: true }], today).progress;
    assert.deepEqual(progress.reviews.one, { step: expectedStep, due: expectedDue });
  }
  progress = completeLesson(progress, 'review', [{ id: 'one', correct: false }], '2026-03-26').progress;
  assert.deepEqual(progress.reviews.one, { step: 0, due: '2026-03-27' });
  progress = completeLesson(progress, 'review', [{ id: 'one', correct: true }], '2026-03-27').progress;
  assert.deepEqual(progress.reviews.one, { step: 1, due: '2026-03-30' });
});
