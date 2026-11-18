import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeAnswer, rng, shuffle, expectedText, checkAnswer, buildTokens,
  sessionScore, reviewExercise, pickReviewWords, searchVocab,
} from '../js/core/quiz.js';
import { VOCAB } from './helpers/fixtures.mjs';

const NOW = new Date('2026-11-18T09:00:00').getTime();
const DAY = 86400000;

test('normalizeAnswer bỏ dấu câu, giữ dấu nháy', () => {
  assert.equal(normalizeAnswer('  Hello,   World!  '), 'hello world');
  assert.equal(normalizeAnswer("It’s fine."), "it's fine");
  assert.equal(normalizeAnswer(null), '');
  assert.equal(normalizeAnswer('A (b) c'), 'a b c');
});

test('rng và shuffle ổn định theo hạt giống', () => {
  const a = rng('seed');
  const b = rng('seed');
  assert.equal(a(), b());
  const first = shuffle([1, 2, 3, 4, 5], 'x');
  const second = shuffle([1, 2, 3, 4, 5], 'x');
  assert.deepEqual(first, second);
  assert.deepEqual([...first].sort(), [1, 2, 3, 4, 5]);
  assert.notDeepEqual(shuffle([1, 2, 3, 4, 5], 'y'), first);
});

test('expectedText lấy đáp án đúng theo loại câu hỏi', () => {
  assert.equal(expectedText({ type: 'mcq', options: ['a', 'b'], answer: 1 }), 'b');
  assert.equal(expectedText({ type: 'gap', answer: 'word' }), 'word');
  assert.equal(expectedText(null), '');
  assert.equal(expectedText({ type: 'mcq' }), '');
});

test('checkAnswer cho mcq, build, gap và trường hợp rỗng', () => {
  assert.deepEqual(checkAnswer(null, 1), { correct: false, expected: '', given: '' });

  const mcq = { type: 'mcq', options: ['A', 'B'], answer: 1 };
  assert.equal(checkAnswer(mcq, 1).correct, true);
  assert.equal(checkAnswer(mcq, '1').correct, true);
  assert.equal(checkAnswer(mcq, 0).correct, false);
  assert.equal(checkAnswer(mcq, 'x').correct, false);
  assert.equal(checkAnswer(mcq, 5).correct, false);

  const build = { type: 'build', words: ['This', 'is', 'a', 'test'], answer: 'This is a test', accept: ['It is a test'] };
  assert.equal(checkAnswer(build, ['This', 'is', 'a', 'test']).correct, true);
  assert.equal(checkAnswer(build, 'This is a test').correct, true);
  assert.equal(checkAnswer(build, ['It', 'is', 'a', 'test']).correct, true);
  assert.equal(checkAnswer(build, ['This', 'is', 'test']).correct, false);

  const gap = { type: 'gap', answer: 'answer', accept: ['reply'] };
  assert.equal(checkAnswer(gap, 'Answer').correct, true);
  assert.equal(checkAnswer(gap, ' reply ').correct, true);
  assert.equal(checkAnswer(gap, '').correct, false);
  assert.equal(checkAnswer(gap, 'wrong').correct, false);
});

test('buildTokens sinh id ổn định và đủ từ', () => {
  const tokens = buildTokens({ id: 'e1', words: ['a', 'b', 'c'] });
  assert.equal(tokens.length, 3);
  assert.deepEqual(tokens.map((token) => token.text).sort(), ['a', 'b', 'c']);
  assert.equal(new Set(tokens.map((token) => token.id)).size, 3);
  assert.deepEqual(buildTokens({ words: null }), []);
  assert.deepEqual(buildTokens(null), []);
  assert.deepEqual(buildTokens({ id: 'x', words: ['a', 'a'] }).map((token) => token.id).length, 2);
});

test('sessionScore tính độ chính xác và chuỗi đúng dài nhất', () => {
  const empty = sessionScore(null);
  assert.deepEqual(empty, { total: 0, correct: 0, accuracy: 0, bestCombo: 0, passed: false });

  const mixed = sessionScore([true, true, false, true, { correct: true }]);
  assert.equal(mixed.total, 5);
  assert.equal(mixed.correct, 4);
  assert.equal(mixed.bestCombo, 2);
  assert.equal(mixed.passed, true);

  const failed = sessionScore([false, false, true]);
  assert.equal(failed.passed, false);
  assert.equal(failed.bestCombo, 1);
});

test('reviewExercise tạo câu hỏi trắc nghiệm từ từ vựng', () => {
  const item = reviewExercise(VOCAB[0], VOCAB, 'seed');
  assert.equal(item.type, 'mcq');
  assert.equal(item.skill, 'vocab');
  assert.equal(item.options.length, 4);
  assert.equal(item.options[item.answer], VOCAB[0].term);
  assert.ok(item.explain.includes(VOCAB[0].vi));

  const lonely = reviewExercise(VOCAB[0], VOCAB, 'seed2');
  assert.ok(lonely.options.includes(VOCAB[0].term));
});

test('pickReviewWords ưu tiên thẻ đến hạn và bỏ qua từ lạ', () => {
  const deck = {
    analyse: { due: NOW - DAY, seen: 2 },
    benefit: { due: NOW - 2 * DAY, seen: 1 },
    context: { due: NOW + DAY, seen: 0 },
    ghost: { due: NOW, seen: 0 },
  };
  const picked = pickReviewWords(deck, VOCAB, NOW, 2);
  assert.deepEqual(picked.map((word) => word.id), ['benefit', 'analyse']);

  const fresh = pickReviewWords({}, VOCAB, NOW, 12);
  assert.equal(fresh.length, 0);

  const upcoming = pickReviewWords(
    { context: { due: NOW + 2 * DAY, seen: 0 }, factor: { due: NOW + DAY, seen: 0 } },
    VOCAB,
    NOW,
    5,
  );
  assert.deepEqual(upcoming.map((word) => word.id), ['context', 'factor']);

  const later = pickReviewWords({ context: { due: NOW + DAY, seen: 0 } }, VOCAB, NOW, 5);
  assert.deepEqual(later.map((word) => word.id), ['context']);

  assert.equal(pickReviewWords({ analyse: { due: NOW } }, VOCAB, NOW).length, 1);
  const none = pickReviewWords(null, null, NOW, 5);
  assert.deepEqual(none, []);
});

test('searchVocab tìm không dấu', () => {
  assert.equal(searchVocab(VOCAB, '').length, VOCAB.length);
  assert.deepEqual(searchVocab(VOCAB, 'phan tich').map((word) => word.id), ['analyse']);
  assert.deepEqual(searchVocab(VOCAB, 'loi ich').map((word) => word.id), ['benefit']);
  assert.deepEqual(searchVocab(VOCAB, 'khong co gi'), []);
  assert.deepEqual(searchVocab(null, 'x'), []);
});
