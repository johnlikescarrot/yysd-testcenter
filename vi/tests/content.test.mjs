import test from 'node:test';
import assert from 'node:assert/strict';
import {
  findUnit, findLesson, allLessons, unitProgress, isUnitDone, isUnitUnlocked,
  isLessonUnlocked, nextLesson, courseProgress, unitStatus, validateCurriculum,
} from '../js/core/content.js';
import { CURRICULUM } from './helpers/fixtures.mjs';

const emptyState = () => ({ lessonsDone: {} });

test('truy vấn chương trình học', () => {
  assert.equal(findUnit(CURRICULUM, 'unit-1').title, 'Đơn vị một');
  assert.equal(findUnit(CURRICULUM, 'không-có'), null);
  assert.equal(findUnit(null, 'x'), null);

  const found = findLesson(CURRICULUM, 'lesson-3');
  assert.equal(found.unit.id, 'unit-2');
  assert.equal(found.lesson.title, 'Bài ba');
  assert.equal(findLesson(CURRICULUM, 'missing'), null);
  assert.equal(findLesson(null, 'x'), null);

  assert.equal(allLessons(CURRICULUM).length, 3);
  assert.deepEqual(allLessons(null), []);
});

test('tiến độ đơn vị và khoá học', () => {
  const state = emptyState();
  assert.deepEqual(unitProgress(state, CURRICULUM.units[0]), { done: 0, total: 2, ratio: 0 });
  assert.deepEqual(unitProgress(state, null), { done: 0, total: 0, ratio: 0 });

  const half = { lessonsDone: { 'lesson-1': { accuracy: 1 } } };
  assert.equal(unitProgress(half, CURRICULUM.units[0]).ratio, 0.5);
  assert.equal(isUnitDone(half, CURRICULUM.units[0]), false);
  assert.equal(isUnitDone({ lessonsDone: { 'lesson-1': {}, 'lesson-2': {} } }, CURRICULUM.units[0]), true);
  assert.equal(isUnitDone(half, { lessons: [] }), false);

  assert.equal(isUnitUnlocked(state, CURRICULUM, CURRICULUM.units[0]), true);
  assert.equal(isUnitUnlocked(state, CURRICULUM, CURRICULUM.units[1]), false);
  assert.equal(isUnitUnlocked({ lessonsDone: { 'lesson-1': {}, 'lesson-2': {} } }, CURRICULUM, CURRICULUM.units[1]), true);
  assert.equal(isUnitUnlocked(state, CURRICULUM, { id: 'unknown' }), false);
  assert.equal(isUnitUnlocked(state, CURRICULUM, null), false);

  assert.equal(courseProgress(emptyState(), CURRICULUM).total, 3);
  assert.equal(courseProgress({ lessonsDone: { 'lesson-1': {} } }, CURRICULUM).done, 1);
  assert.equal(courseProgress(emptyState(), null).total, 0);
});

test('mở khoá bài học theo thứ tự', () => {
  const state = emptyState();
  const unit = CURRICULUM.units[0];
  assert.equal(isLessonUnlocked(state, CURRICULUM, unit, unit.lessons[0]), true);
  assert.equal(isLessonUnlocked(state, CURRICULUM, unit, unit.lessons[1]), false);
  assert.equal(isLessonUnlocked({ lessonsDone: { 'lesson-1': {} } }, CURRICULUM, unit, unit.lessons[1]), true);
  assert.equal(isLessonUnlocked(state, CURRICULUM, CURRICULUM.units[1], CURRICULUM.units[1].lessons[0]), false);
  assert.equal(isLessonUnlocked(state, CURRICULUM, unit, { id: 'unknown' }), false);
});

test('nextLesson bỏ qua bài đã xong và tôn trọng khoá', () => {
  assert.equal(nextLesson(emptyState(), CURRICULUM).lesson.id, 'lesson-1');
  assert.equal(nextLesson({ lessonsDone: { 'lesson-1': {} } }, CURRICULUM).lesson.id, 'lesson-2');
  const finished = nextLesson({ lessonsDone: { 'lesson-1': {}, 'lesson-2': {} } }, CURRICULUM);
  assert.equal(finished.lesson.id, 'lesson-3');
  const all = nextLesson({ lessonsDone: { 'lesson-1': {}, 'lesson-2': {}, 'lesson-3': {} } }, CURRICULUM);
  assert.equal(all, null);
  const locked = nextLesson(emptyState(), { units: [CURRICULUM.units[1]] });
  assert.equal(locked.lesson.id, 'lesson-3');
  assert.equal(nextLesson(emptyState(), null), null);
});

test('unitStatus phân biệt done / current / locked', () => {
  assert.equal(unitStatus(emptyState(), CURRICULUM, CURRICULUM.units[0]), 'current');
  assert.equal(unitStatus(emptyState(), CURRICULUM, CURRICULUM.units[1]), 'locked');
  assert.equal(unitStatus({ lessonsDone: { 'lesson-1': {}, 'lesson-2': {} } }, CURRICULUM, CURRICULUM.units[0]), 'done');
});

test('validateCurriculum chấp nhận dữ liệu tốt', () => {
  const full = {
    units: [{
      id: 'u', title: 'U', lessons: [{
        id: 'l', title: 'L', xp: 10, exercises: [
          { id: 'e1', type: 'mcq', options: ['a', 'b'], answer: 0, explain: 'x' },
          { id: 'e2', type: 'gap', answer: 'a', explain: 'x' },
          { id: 'e3', type: 'build', words: ['a'], answer: 'a', explain: 'x' },
          { id: 'e4', type: 'listen', answer: 'a', explain: 'x' },
        ],
      }],
    }],
  };
  assert.deepEqual(validateCurriculum(full), []);
});

test('validateCurriculum bắt mọi lỗi cấu trúc', () => {
  assert.deepEqual(validateCurriculum(null), ['Chương trình phải có ít nhất một đơn vị.']);
  assert.deepEqual(validateCurriculum({ units: [] }), ['Chương trình phải có ít nhất một đơn vị.']);

  const noId = validateCurriculum({ units: [{ title: 'x', lessons: [{ id: 'l', title: 't', xp: 1, exercises: [{ id: 'e', type: 'mcq', options: ['a', 'b'], answer: 0, explain: 'y' }] }] }] });
  assert.ok(noId.includes('Đơn vị thiếu id.'));

  const errors = validateCurriculum({
    units: [
      {
        id: 'dup', title: '', lessons: [
          { id: 'dup-l', title: '', xp: 0, exercises: [
            { id: 'e1', type: 'nope', explain: '' },
            { id: 'e1', type: 'mcq', options: ['a'], answer: 'x', explain: 'ok' },
            { id: 'e2', type: 'build', words: [], answer: '', explain: 'ok' },
            { id: 'e3', type: 'gap', explain: 'ok' },
            { type: 'gap', answer: 'a', explain: 'ok' },
          ] },
          { id: 'dup-l', title: 't', xp: 5, exercises: [] },
          { title: 'thiếu id', xp: 5, exercises: [] },
        ],
      },
      { id: 'dup', title: 'x', lessons: [] },
      { id: 'empty', title: 'x', lessons: [] },
    ],
  });
  const joined = errors.join('\n');
  assert.match(joined, /Trùng id đơn vị: dup/);
  assert.match(joined, /Đơn vị dup thiếu tiêu đề/);
  assert.match(joined, /Bài dup-l thiếu tiêu đề/);
  assert.match(joined, /Bài dup-l cần xp > 0/);
  assert.match(joined, /Trùng id câu hỏi: e1/);
  assert.match(joined, /loại không hỗ trợ: nope/);
  assert.match(joined, /Câu e1 cần ít nhất 2 lựa chọn/);
  assert.match(joined, /Câu e1 thiếu chỉ số đáp án/);
  assert.match(joined, /Câu e2 thiếu ngân hàng từ/);
  assert.match(joined, /Câu e3 thiếu đáp án/);
  assert.match(joined, /có câu hỏi thiếu id/);
  assert.match(joined, /không có bài tập/);
  assert.match(joined, /Bài trong dup thiếu id/);
  assert.match(joined, /không có bài học/);
});
