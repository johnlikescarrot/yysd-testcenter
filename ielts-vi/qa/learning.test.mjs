import assert from 'node:assert/strict';
import { test } from 'node:test';
import { lessons, reviewable } from '../lessons.js';
import {
  checkAnswer, dueItems, finish, lessonItems, lessonState, load, localDay,
  newProgress, nextLesson, save, shiftDay, stats, storageKey, wordCount,
} from '../learning.js';

const p = '2026-11-18';
const day = offset => shiftDay(p, offset);
const createReview = (...pairs) => ({ lesson: null, results: pairs.map(([item, correct]) => ({ item, correct })) });
const complete = (progress, index, date, correct = true) => {
  const lesson = lessons[index];
  return finish(progress, { lesson, results: lessonItems(lesson).map(item => ({ item, correct })) }, date);
};

test('dùng ngày lịch địa phương, dịch ngày theo UTC qua tháng và năm nhuận', () => {
  assert.equal(localDay(new Date(2024, 1, 9, 23, 59)), '2024-02-09');
  assert.equal(shiftDay('2024-03-01', -1), '2024-02-29');
  assert.equal(shiftDay('2026-12-31', 2), '2027-01-02');
  assert.equal(shiftDay('2026-11-01', 1), '2026-11-02');
});

test('khôi phục phần hợp lệ, không tính mốc lạ, XP trùng hoặc ngày giả', () => {
  let data = null;
  const storage = () => ({ getItem: key => { assert.equal(key, storageKey); return data; }, setItem: (key, value) => { assert.equal(key, storageKey); data = value; } });
  assert.deepEqual(load(storage), { progress: newProgress(), available: true });
  const raw = {
    goal: 60,
    completed: { library: p, argument: 1, routine: '2026-11-1', garden: '2026-02-31', bus: '2026-13-01', bogus: p },
    cards: {
      [`${reviewable[0].id}`]: { level: 4, due: p }, [`${reviewable[1].id}`]: null,
      [`${reviewable[2].id}`]: { level: 'bad', due: p }, [`${reviewable[3].id}`]: { level: -1, due: p },
      [`${reviewable[4].id}`]: { level: 6, due: p }, 'made-up': { level: 1, due: day(1) },
    },
    activity: { [p]: ['lesson:library', 'bogus', 'lesson:library'], 'bad': [], [day(1)]: 'no', [day(2)]: ['no'] },
  };
  assert.equal(save(storage, raw), true);
  assert.deepEqual(load(storage).progress, {
    goal: 60, completed: { library: p }, cards: { [reviewable[0].id]: { level: 4, due: p } }, activity: { [p]: ['lesson:library'] },
  });
  data = '{"goal":0}';
  assert.deepEqual(load(storage).progress, newProgress());
  data = '{';
  assert.deepEqual(load(storage), { progress: newProgress(), available: false });
  const blocked = () => { throw new Error('Không có quyền lưu'); };
  assert.equal(save(blocked, raw), false);
  assert.equal(load(blocked).available, false);
});

test('chuẩn hóa câu trả lời, đếm từ và không đổi sai chính tả thành đúng', () => {
  const question = { answers: ["I don't know", '10.15'] };
  assert.equal(checkAnswer(question, ' Ｉ  don’t   Know '), true);
  assert.equal(checkAnswer(question, '10.15'), true);
  assert.equal(checkAnswer(question, 'I dont kno'), false);
  assert.equal(wordCount(''), 0);
  assert.equal(wordCount('It’s a well-known rule in 2026.'), 6);
});

test('mở bài tiếp theo sau khi hoàn tất và không thưởng hai lần trong ngày', () => {
  const progress = newProgress();
  assert.equal(lessonState(lessons[0], progress), 'ready');
  assert.equal(lessonState(lessons[1], progress), 'locked');
  assert.deepEqual(complete(progress, 0, p, false), { correct: 0, total: 3, xp: 20 });
  assert.equal(lessonState(lessons[0], progress), 'done');
  assert.equal(nextLesson(progress), lessons[1]);
  assert.equal(complete(progress, 0, p).xp, 0);
  assert.equal(complete(progress, 0, day(1)).xp, 20);
  assert.equal(progress.completed.library, p);
  for (let i = 1; i < lessons.length; i += 1) complete(progress, i, p);
  assert.equal(nextLesson(progress), undefined);
});

test('lên lịch ôn, giữ câu sai và dời khoảng cách theo chuỗi trả lời đúng', () => {
  const progress = newProgress();
  const [one, two] = reviewable;
  complete(progress, 0, p);
  assert.deepEqual(dueItems(progress, p), []);
  assert.equal(dueItems(progress, day(1)).length, 3);
  assert.deepEqual(finish(progress, createReview([one, false]), day(1)), { correct: 0, total: 1, xp: 0 });
  assert.equal(progress.cards[one.id].level, 0);
  assert.equal(progress.activity[day(1)], undefined);
  assert.equal(finish(progress, createReview([one, true]), day(1)).xp, 5);
  assert.equal(finish(progress, createReview([one, true]), day(1)).xp, 0);
  assert.equal(progress.cards[one.id].due, day(2));
  assert.equal(dueItems(progress, day(2))[0].id, two.id);
  let when = day(2);
  for (const [index, interval] of [3, 7, 14, 30, 30].entries()) {
    finish(progress, createReview([one, true]), when);
    when = shiftDay(when, interval);
    assert.deepEqual(progress.cards[one.id], { level: Math.min(index + 2, 5), due: when });
  }
});

test('thống kê trước nửa đêm và qua ngày bỏ lỡ, biểu đồ đúng bảy ngày', () => {
  const progress = newProgress();
  assert.equal(stats(progress, p).best, 0);
  for (const offset of [0, 1, 2, 4, 7]) complete(progress, 0, day(offset));
  finish(progress, createReview([reviewable[0], true]), day(2));
  assert.deepEqual(stats(progress, day(3)), {
    completed: 1, today: 0, xp: 65, best: 3, streak: 3,
    week: [0, 0, 0, 20, 20, 25, 0].map((xp, index) => ({ day: day(index - 3), xp })),
  });
  assert.equal(stats(progress, day(6)).streak, 0);
  assert.equal(stats(progress, day(7)).streak, 1);
});
