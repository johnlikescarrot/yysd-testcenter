import test from 'node:test';
import assert from 'node:assert/strict';
import { allQuestions, findLesson, lessons } from '../assets/js/ielts-vi-data.mjs';

test('each lesson contains valid original questions and a unique review id', () => {
  assert.equal(lessons.length, 5);
  assert.equal(allQuestions.length, 20);
  assert.equal(new Set(allQuestions.map((question) => question.id)).size, allQuestions.length);
  for (const lesson of lessons) {
    assert.equal(findLesson(lesson.id), lesson);
    assert.equal(lesson.questions.length, 4);
    for (const question of lesson.questions) {
      assert.ok(question.prompt && question.explanation);
      assert.equal(question.options.length, 3);
      assert.equal(new Set(question.options).size, 3);
      assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < question.options.length);
      assert.doesNotMatch(JSON.stringify(question), /[\u3400-\u9fff]/);
    }
  }
  assert.equal(findLesson('not-a-lesson'), undefined);
});
