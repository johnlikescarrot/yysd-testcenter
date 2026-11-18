import assert from 'node:assert/strict';
import test from 'node:test';
import { byLesson, lessons, questions, skills, units } from '../../ielts-vi/assets/course.js';
import {
  assess, currentQuestion, dueCards, emptyProgress, finish, localDay, makeSession,
  previousWeek, readProgress, reviewLimit, saveProgress, storageKey, streak, summary, wordCount,
} from '../../ielts-vi/assets/progress.js';

function allAnswers(session, correct = true) {
  for (const id of session.ids) {
    const question = questions[id];
    const response = question.type === 'choice' ? (correct ? question.answer : (question.answer + 1) % question.options.length)
      : question.type === 'fill' ? (correct ? question.answers[0] : '!!!')
        : question.type === 'write' ? question.example : true;
    session.results.push(assess(question, response));
  }
  return session;
}

test('curriculum: three sequences, four skills, unique questions and valid models', () => {
  assert.equal(units.length, 3);
  assert.equal(lessons.length, 12);
  assert.equal(lessons.reduce((n, lesson) => n + lesson.questions.length, 0), 36);
  for (const unit of units) assert.deepEqual(unit.lessons.map(({ skill }) => skill), Object.keys(skills));
  for (const lesson of lessons) {
    assert.equal(byLesson[lesson.id], lesson);
    assert.equal(lesson.questions.length, 3);
    for (const question of lesson.questions) {
      assert.equal(question.lessonId, lesson.id);
      if (question.type === 'choice') {
        assert.ok(question.options[question.answer]);
        assert.equal(new Set(question.options).size, question.options.length);
      }
      if (question.type === 'write') assert.ok(wordCount(question.example) >= question.minimum);
    }
    if (lesson.skill === 'listen') assert.match(lesson.context.audio, /^\w+\.mp3$/);
  }
});

test('uses local civil dates and keeps yesterday’s streak alive until a missed day', () => {
  const day = localDay(new Date(2026, 2, 8, 23, 58));
  assert.equal(localDay(new Date(2026, 2, 9, 0, 1)), day + 1);
  const week = previousWeek(day);
  assert.equal(week.length, 7);
  assert.equal(week[0].ordinal, day - 6);
  assert.equal(week[6].date.toISOString(), '2026-03-08T00:00:00.000Z');
  const state = { ...emptyProgress(), activity: { [day - 1]: 1, [day - 2]: 1, [day - 3]: 3 } };
  assert.equal(streak(state, day), 3);
  assert.equal(streak(state, day + 1), 0);
  assert.equal(summary(state, day + 1).badges[1].earned, true, 'earned streak badge persists');
  state.activity[day] = 1;
  assert.equal(streak(state, day), 4);
});

test('invalid saved records are ignored without losing trusted fields', () => {
  const storage = (raw) => () => ({ getItem: (key) => {
    assert.equal(key, storageKey);
    return raw;
  } });
  assert.deepEqual(readProgress(storage(null)), emptyProgress());
  assert.deepEqual(readProgress(storage('{')), emptyProgress());
  assert.deepEqual(readProgress(storage('{"version":2}')), emptyProgress());
  assert.deepEqual(readProgress(() => { throw new Error('Disabled'); }), emptyProgress());
  assert.deepEqual(readProgress(storage('{"version":1}')), emptyProgress());
  const mixed = {
    version: 1, goal: 3, xp: 12,
    completed: { booking: 2, routine: 3, survey: -1, repair: 0, absent: 1 },
    cards: {
      'booking-1': { stage: 2, due: 35, note: '<b>stripped</b>' },
      'booking-2': { stage: 9, due: 36 }, 'booking-3': { stage: 0, due: -1 },
      'routine-3': { stage: 2, due: 1 },
    },
    activity: { 28: 2, '029': 1, 30: '1', 31: 0 },
  };
  assert.deepEqual(readProgress(storage(JSON.stringify(mixed))), {
    version: 1, goal: 3, xp: 12, completed: { booking: 2, repair: 0 },
    cards: { 'booking-1': { stage: 2, due: 35 } }, activity: { 28: 2 },
  });
  assert.equal(saveProgress(() => ({ setItem(key, raw) {
    assert.equal(key, storageKey);
    assert.deepEqual(JSON.parse(raw), mixed);
  } }), mixed), true);
  assert.equal(saveProgress(() => ({ setItem() { throw new Error('Full'); } }), mixed), false);
});

test('grades each response mode without scoring free expression', () => {
  const question = questions['booking-1'];
  assert.equal(assess(question, null), null);
  assert.deepEqual(assess(question, 0), { correct: false });
  assert.deepEqual(assess(question, 1), { correct: true });
  assert.equal(assess(questions['booking-3'], '   '), null);
  assert.deepEqual(assess(questions['booking-3'], '  Ｎｏｔｅｂｏｏｋ  '), { correct: true });
  assert.deepEqual(assess({ type: 'fill', answers: ['42 King Street', '42 King St'] }, ' 42 KING   ST '), { correct: true });
  assert.deepEqual(assess(questions['booking-3'], 'notebook!'), { correct: false });
  assert.equal(assess(questions['routine-3'], false), null);
  assert.deepEqual(assess(questions['routine-3'], true), { correct: null });
  assert.equal(wordCount('  '), 0);
  assert.equal(wordCount('I don’t need a well-known book #2.'), 7);
  assert.equal(assess(questions['overview-3'], 'Too short.'), null);
  assert.deepEqual(assess(questions['overview-3'], questions['overview-3'].example), { correct: null });
});

test('only finished sessions count; retakes cannot farm learning XP or postpone a correct card', () => {
  const initial = emptyProgress();
  const session = makeSession('booking', initial, 100);
  assert.equal(currentQuestion(session).id, 'booking-1');
  assert.equal(makeSession('toString', initial, 100), null);
  assert.equal(makeSession('review', initial, 100), null);
  assert.equal(finish(initial, session, 100), null);
  session.results.push({ correct: false }, { correct: true }, { correct: false });
  assert.equal(currentQuestion(session), undefined);
  const result = finish(initial, session, 100);
  assert.equal(result.earned, 12);
  assert.equal(result.correct, 1);
  assert.equal(result.total, 3);
  assert.deepEqual(initial, emptyProgress(), 'completion must not mutate saved input');
  assert.deepEqual(dueCards(result.state, 100), ['booking-1', 'booking-3']);
  assert.deepEqual(result.state.cards['booking-2'], { stage: 1, due: 101 });
  const second = finish(result.state, allAnswers(makeSession('booking', result.state, 100)), 100);
  assert.equal(second.earned, 4);
  assert.equal(second.state.xp, 16);
  assert.equal(second.state.activity[100], 2);
  assert.equal(second.state.completed.booking, 3);
  assert.equal(second.state.cards['booking-2'], result.state.cards['booking-2']);
  const third = finish(second.state, allAnswers(makeSession('booking', second.state, 100)), 100);
  assert.equal(third.earned, 0);
  assert.equal(summary(third.state, 100).nextLesson.id, 'shade');
  assert.equal(summary(third.state, 100).badges[0].earned, true);
});

test('review prioritizes mistakes, sorts by date, limits each batch and caps intervals', () => {
  let state = emptyProgress();
  for (const lesson of lessons) state = finish(state, allAnswers(makeSession(lesson.id, state, 30)), 30).state;
  assert.equal(summary(state, 31).badges[2].earned, true);
  assert.equal(summary(state, 31).nextLesson, undefined);
  state.cards['booking-2'] = { stage: 0, due: 31 };
  state.cards['booking-3'] = { stage: 1, due: 30 };
  assert.deepEqual(dueCards(state, 31).slice(0, 3), ['booking-2', 'booking-3', 'booking-1']);
  const review = makeSession('review', state, 31);
  assert.equal(review.ids.length, reviewLimit);
  const reviewed = finish(state, allAnswers(review), 31);
  assert.equal(reviewed.earned, reviewLimit * 2);
  assert.deepEqual(reviewed.state.cards['booking-3'], { stage: 2, due: 34 });
  assert.deepEqual(reviewed.state.cards['booking-2'], { stage: 1, due: 32 });
  const isolated = { ...emptyProgress(), cards: { 'booking-1': { stage: 2, due: 34 } } };
  const third = finish(isolated, allAnswers(makeSession('review', isolated, 34)), 34).state;
  assert.deepEqual(third.cards['booking-1'], { stage: 3, due: 41 });
  const fourth = finish(third, allAnswers(makeSession('review', third, 41)), 41).state;
  assert.deepEqual(fourth.cards['booking-1'], { stage: 4, due: 55 });
  const fifth = finish(fourth, allAnswers(makeSession('review', fourth, 55)), 55).state;
  assert.deepEqual(fifth.cards['booking-1'], { stage: 4, due: 69 });
  const lapse = finish(fifth, allAnswers(makeSession('review', fifth, 69), false), 69).state;
  assert.deepEqual(lapse.cards['booking-1'], { stage: 0, due: 69 });
});
