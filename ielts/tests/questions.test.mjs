import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SKILLS, QUESTIONS, PDFS, ROLEPLAY, SAMPLE_BOARD, skillById,
  questionsFor, checkAnswer, explain
} from '../assets/js/questions.mjs';

test('dữ liệu bốn kỹ năng, 24 câu, sáu PDF và kịch bản đóng vai', () => {
  assert.equal(SKILLS.length, 4);
  assert.equal(QUESTIONS.length, 24);
  assert.equal(PDFS.length, 6);
  assert.equal(ROLEPLAY.outline.length, 4);
  assert.equal(SAMPLE_BOARD.length, 6);
  assert.ok(Object.isFrozen(QUESTIONS));
  for (const q of QUESTIONS) {
    assert.ok(q.options.length >= 3);
    assert.ok(q.answer >= 0 && q.answer < q.options.length);
    assert.ok(q.explanation.length > 20);
  }
});

test('skillById trả về kỹ năng hoặc null', () => {
  assert.equal(skillById('reading').name, 'Đọc');
  assert.equal(skillById('khong-co'), null);
});

test('questionsFor lọc theo kỹ năng, cấp độ và giới hạn', () => {
  assert.deepEqual(questionsFor('khong-co'), []);
  assert.equal(questionsFor('listening', 'B1').length, 2);
  assert.equal(questionsFor('writing', 'B1', 1).length, 1);
  assert.equal(questionsFor('speaking', 'Z9').length, 5);
  assert.equal(questionsFor('speaking').length, 5);
  assert.equal(questionsFor('speaking', 'all', 0).length, 0);
  assert.equal(questionsFor('speaking', 'all', -2).length, 0);
});

test('checkAnswer và explain xử lý đúng, sai và câu rỗng', () => {
  const q = QUESTIONS[0];
  assert.equal(checkAnswer(q, 0), true);
  assert.equal(checkAnswer(q, '0'), true);
  assert.equal(checkAnswer(q, 1), false);
  assert.equal(checkAnswer(null, 0), false);
  assert.match(explain(q, 0), /^Chính xác!/);
  assert.match(explain(q, 2), /^Chưa đúng/);
  assert.equal(explain(null, 0), 'Câu hỏi không tồn tại.');
});
