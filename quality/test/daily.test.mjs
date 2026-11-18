import assert from 'node:assert/strict';
import test from 'node:test';
import { dailyIds, dailyQuestions, dailySize } from '../../ielts-vi/assets/daily.js';
import { questions } from '../../ielts-vi/assets/course.js';
import { assess, dueCards, emptyProgress, finish, makeSession, readProgress } from '../../ielts-vi/assets/progress.js';

test('daily rotation has stable IDs, unambiguous choices, and eventually visits every source card', () => {
  assert.equal(dailyQuestions.length, 257);
  const seen = new Set();
  for (let day = 20000; day < 20000 + Math.ceil(dailyQuestions.length / dailySize); day += 1) {
    const ids = dailyIds(day);
    assert.equal(new Set(ids).size, dailySize);
    assert.deepEqual(ids, dailyIds(day));
    ids.forEach((id) => seen.add(id));
  }
  assert.equal(seen.size, dailyQuestions.length);
  for (const q of dailyQuestions) {
    assert.equal(questions[q.id], q);
    assert.equal(new Set(q.options).size, 4);
    assert.ok(q.explanation.includes(q.options[q.answer]));
    assert.equal(q.optionLang, 'vi');
  }
});

test('daily credit is separate from course completion and survives midnight and storage round trips', () => {
  const day = 20500;
  const initial = emptyProgress();
  const session = makeSession('daily', initial, day);
  session.results = session.ids.map((id, i) => assess(questions[id], (questions[id].answer + Number(i === 0)) % 4));
  const { state, earned } = finish(initial, session, day + 1);
  assert.equal(earned, 13);
  assert.deepEqual(state.completed, {});
  assert.deepEqual(state.activity, { [day + 1]: 1 });
  assert.deepEqual(dueCards(state, day + 1), [session.ids[0]]);
  assert.equal(makeSession('daily', state, day), null);
  assert.ok(makeSession('daily', state, day + 1));
  assert.deepEqual(finish(state, session, day + 1), { state, earned: 0, correct: 4, total: 5 });
  assert.deepEqual(readProgress(() => ({ getItem: () => JSON.stringify(state) })), state);
});
