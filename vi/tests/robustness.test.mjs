import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialUi, renderPage, createController } from '../js/app.js';
import { createInitialState, touchState, todayEntry, bumpHistory, weekXp, studyDayCount, heartRegenMs } from '../js/core/state.js';
import { findLesson, allLessons, isUnitUnlocked, isLessonUnlocked, nextLesson } from '../js/core/content.js';
import { parseDayKey } from '../js/core/date.js';
import { regenHearts, heartsLabel, applyAnswer, registerStudyDay, spendGems, earnGems } from '../js/core/gamify.js';
import { searchPapers, tagsOf, citationsFor } from '../js/core/papers.js';
import { rng, expectedText, reviewExercise, searchVocab } from '../js/core/quiz.js';
import { estimateBand, bandLabel } from '../js/core/scoring.js';
import { renderDashboard } from '../js/views/dashboard.js';
import { renderLesson } from '../js/views/lesson.js';
import { renderPractice } from '../js/views/practice.js';
import { renderProgress } from '../js/views/progress.js';
import { renderLibrary } from '../js/views/library.js';
import { renderLearn } from '../js/views/learn.js';
import { timerHtml, wordCard } from '../js/views/layout.js';
import { CURRICULUM, VOCAB, PROMPTS, PAPERS, DOCS } from './helpers/fixtures.mjs';

const NOW = new Date('2026-11-18T09:00:00').getTime();
const data = { curriculum: CURRICULUM, vocab: VOCAB, prompts: PROMPTS, papers: PAPERS, docs: DOCS, wordOfDay: VOCAB[0] };
const freshState = () => touchState(createInitialState(NOW), NOW);

test('createInitialUi chịu được dữ liệu thiếu', () => {
  const ui = createInitialUi({ page: 'practice', state: {}, data: {}, now: NOW });
  assert.deepEqual(ui.queue, []);
  assert.equal(ui.dict.wordId, null);
  assert.equal(createInitialUi({ page: 'lesson', state: {}, data: {}, now: NOW }).tokens.length, 0);
});

test('renderPage tự lấy thời gian khi thiếu now', () => {
  const state = freshState();
  const html = renderPage({ page: 'dashboard', state, data, ui: {} });
  assert.match(html, /Chào buổi/);
});

test('createController không truyền deps vẫn chạy', () => {
  const controller = createController({ page: 'dashboard', state: freshState(), data });
  const out = controller.dispatch('set-goal', { value: 60 });
  assert.equal(out.state.goal, 60);
  assert.ok(controller.getUi().now > 0);

  const noNow = createController({ page: 'progress', state: freshState(), data, ui: { query: '' }, deps: {} });
  assert.match(noNow.html(), /Tiến độ/);
  assert.ok(noNow.getUi().now > 0);
});

test('bài học chịu được ui thiếu selected, draft, tokens', () => {
  const lesson = {
    id: 'x',
    title: 'X',
    xp: 5,
    exercises: [
      { id: 'b', type: 'build', skill: 'reading', prompt: 'Xếp', words: ['a', 'b'], answer: 'a b', explain: 'x' },
      { id: 'g', type: 'gap', skill: 'reading', prompt: 'Điền', stem: 'The ___.', answer: 'a', explain: 'x' },
      { id: 'l', type: 'listen', skill: 'listening', prompt: 'Nghe', stem: 'Hello there.', answer: 'Hello there.', explain: 'x' },
      { id: 'm', type: 'mcq', skill: 'reading', prompt: 'Chọn', stem: '?', options: ['a', 'b'], answer: 0, explain: 'x' },
    ],
  };
  const controller = createController({ page: 'lesson', state: freshState(), data: { ...CURRICULUM.units[0] && { curriculum: CURRICULUM, unit: CURRICULUM.units[0], lesson }, unit: CURRICULUM.units[0], lesson }, deps: { now: () => NOW } });
  controller.dispatch('select-token', { value: 'x' });
  controller.dispatch('undo-token', { value: 'x' });
  assert.ok(controller.html());

  const bare = createController({
    page: 'lesson',
    state: freshState(),
    data: { curriculum: CURRICULUM, unit: CURRICULUM.units[0], lesson },
    ui: { index: 0, results: [], feedback: null, now: NOW },
    deps: { now: () => NOW },
  });
  bare.dispatch('select-token', { value: 'x' });
  bare.dispatch('undo-token', { value: 'x' });
  bare.dispatch('check');
  assert.equal(bare.getUi().feedback.correct, false);
  bare.dispatch('next');
  bare.dispatch('check');
  assert.equal(bare.getUi().index, 1);
  bare.dispatch('next');
  const spoke = [];
  const withSpeak = createController({
    page: 'lesson',
    state: freshState(),
    data: { curriculum: CURRICULUM, unit: CURRICULUM.units[0], lesson },
    ui: { index: 0, results: [], feedback: { correct: true }, now: NOW, tokens: [] },
    deps: { now: () => NOW, speak: (text) => spoke.push(text) },
  });
  withSpeak.dispatch('next');
  withSpeak.dispatch('check');
  withSpeak.dispatch('next');
  assert.equal(withSpeak.getUi().index, 2);
  assert.ok(spoke.includes('Hello there.'));
  withSpeak.dispatch('play-audio');
  withSpeak.dispatch('play-audio', { value: 'slow' });
  assert.equal(spoke.length, 3);
});

test('kiểm tra câu điền từ khi chưa có draft và undo-token khi chưa chọn gì', () => {
  const single = (exercise) => createController({
    page: 'lesson',
    state: freshState(),
    data: { curriculum: CURRICULUM, unit: CURRICULUM.units[0], lesson: { id: 'l', title: 'L', xp: 5, exercises: [exercise] } },
    deps: { now: () => NOW },
  });

  const gap = single({ id: 'g', type: 'gap', skill: 'reading', prompt: 'P', stem: 'S ___.', answer: 'a', explain: 'e' });
  gap.getUi().draft = undefined;
  gap.dispatch('check');
  assert.equal(gap.getUi().feedback.correct, false);
  assert.equal(gap.getUi().draft, '');

  const build = single({ id: 'b', type: 'build', skill: 'reading', prompt: 'P', words: ['a', 'b'], answer: 'a b', explain: 'e' });
  build.getUi().selected = undefined;
  build.dispatch('check');
  assert.equal(build.getUi().feedback.correct, false);

  const undo = single({ id: 'b2', type: 'build', skill: 'reading', prompt: 'P', words: ['a'], answer: 'a', explain: 'e' });
  undo.getUi().selected = undefined;
  undo.dispatch('undo-token', { value: 'x' });
  assert.deepEqual(undo.getUi().selected, []);
});

test('skip hai lần liên tiếp chỉ ghi một kết quả', () => {
  const { controller } = { controller: createController({ page: 'lesson', state: freshState(), data: { curriculum: CURRICULUM, unit: CURRICULUM.units[0], lesson: { id: 'l', title: 'L', xp: 5, exercises: [{ id: 'q', type: 'gap', skill: 'reading', prompt: 'P', stem: 'S', answer: 'a', explain: 'e' }] } }, ui: { index: 0, results: [], feedback: null, draft: undefined, now: NOW }, deps: { now: () => NOW } }) };
  controller.dispatch('skip');
  controller.dispatch('skip');
  assert.equal(controller.getUi().results.length, 1);
});

test('grade-card cộng đá quý khi hoàn thành nhiệm vụ ôn thẻ', () => {
  const quests = { day: '2026-11-18', items: [{ id: 'review', metric: 'review', target: 3, progress: 0, gems: 6, title: 'Ôn 3 thẻ' }] };
  const state = { ...freshState(), quests };
  const notes = [];
  const controller = createController({
    page: 'practice',
    state,
    data,
    ui: { mode: 'the', queue: ['analyse', 'benefit', 'context'], pos: 0, revealed: true, dict: { wordId: 'analyse', draft: '', feedback: null }, writingTask: 0, writingOpen: null, speakingOpen: null, timer: null, now: NOW },
    deps: { now: () => NOW, notify: (text) => notes.push(text) },
  });
  for (let i = 0; i < 3; i += 1) controller.dispatch('grade-card', { value: 'good' });
  assert.ok(notes.some((text) => text.includes('đá quý')));
});

test('check-dictation chịu được draft thiếu', () => {
  const notes = [];
  const controller = createController({
    page: 'practice',
    state: freshState(),
    data,
    ui: { mode: 'nghe', queue: ['analyse'], pos: 0, revealed: false, dict: { wordId: 'analyse' }, writingTask: 0, writingOpen: null, speakingOpen: null, timer: null, now: NOW },
    deps: { now: () => NOW, notify: (text) => notes.push(text) },
  });
  controller.dispatch('check-dictation', {});
  assert.equal(controller.getUi().dict.feedback.correct, false);
  assert.equal(controller.getUi().dict.draft, '');
});

test('dispatch draft không có nội dung và tick không có hẹn giờ', () => {
  const controller = createController({ page: 'lesson', state: freshState(), data: { curriculum: CURRICULUM, unit: CURRICULUM.units[0], lesson: { id: 'l', title: 'L', xp: 5, exercises: [{ id: 'q', type: 'gap', skill: 'reading', prompt: 'P', stem: 'S', answer: 'a', explain: 'e' }] } }, deps: { now: () => NOW } });
  controller.dispatch('draft', {});
  assert.equal(controller.getUi().draft, '');
  assert.ok(controller.tick().length > 0);
});

test('hàm lõi chịu được tham số thiếu', () => {
  assert.equal(new Date(parseDayKey('2026')).getMonth(), 0);
  assert.deepEqual(findLesson({ units: [{ id: 'u' }] }, 'x'), null);
  assert.deepEqual(allLessons({ units: [{ id: 'u' }] }), []);
  assert.equal(isUnitUnlocked(freshState(), null, CURRICULUM.units[0]), false);
  assert.equal(isLessonUnlocked(freshState(), { units: [{ id: 'unit-1' }] }, { id: 'unit-1' }, {}), false);
  assert.equal(nextLesson(freshState(), { units: [{ id: 'unit-1' }] }), null);
  const partial = { units: [{ id: 'a', lessons: [{ id: 'a1' }, { id: 'a2' }] }, { id: 'b', lessons: [{ id: 'b1' }] }] };
  assert.equal(nextLesson({ lessonsDone: { a1: {} } }, partial).lesson.id, 'a2');
  const gaps = { units: [{ id: 'a', lessons: [{ id: 'a1' }] }, { id: 'b', lessons: [] }, { id: 'c', lessons: [{ id: 'c1' }] }] };
  assert.equal(nextLesson({ lessonsDone: { a1: {} } }, gaps), null);

  assert.equal(regenHearts({ hearts: 2 }, NOW).hearts, 2);
  assert.match(heartsLabel({ hearts: 2 }, NOW), /\+1 sau/);
  assert.ok(applyAnswer({}, { correct: false }).heartsUpdatedAt);
  assert.equal(registerStudyDay({}, NOW).streak, 1);
  assert.equal(registerStudyDay({ lastStudyDay: '2026-11-17' }, NOW).streak, 1);
  assert.equal(registerStudyDay({ lastStudyDay: '2026-11-16', freezes: 1 }, NOW).streak, 1);
  assert.equal(spendGems({}, NaN).gems, 0);
  assert.equal(earnGems({}, 5).gems, 5);
  assert.equal(earnGems({}, NaN).gems, 0);

  assert.deepEqual(searchPapers([{ id: 'x', title: 'T' }], 't', 'all').map((p) => p.id), ['x']);
  assert.deepEqual(searchPapers([{ id: 'x', title: 'T' }], 't', 'la').map((p) => p.id), []);
  assert.deepEqual(tagsOf([{ id: 'y', title: 'T' }]), []);
  assert.deepEqual(citationsFor([{ id: 'z', title: 'T' }], 'doc'), []);
  assert.equal(typeof rng(undefined), 'function');
  assert.equal(expectedText({ type: 'gap' }), '');
  assert.equal(reviewExercise(VOCAB[0], null).options.length, 1);
  assert.deepEqual(searchVocab(undefined, 'x'), []);
  assert.deepEqual(searchVocab(), []);
  assert.equal(searchVocab([{ term: 'alpha', vi: 'an pha' }], 'alpha').length, 1);

  assert.equal(estimateBand('reading', 0, 40), 1);
  assert.equal(estimateBand('grammar', 0, 100), 3);
  assert.equal(bandLabel(NaN).label, 'Khởi đầu (A1)');
});

test('state chịu được lịch sử thiếu trường', () => {
  assert.equal(todayEntry({ history: [{ day: '2026-01-01', xp: 5 }] }, NOW).xp, 0);
  assert.equal(todayEntry({}, NOW).xp, 0);
  const partialDelta = bumpHistory([], '2026-11-18', {});
  assert.equal(partialDelta[0].xp, 0);
  const emptyDelta = bumpHistory([{ day: '2026-11-18' }], '2026-11-18', {});
  assert.equal(emptyDelta[0].xp, 0);
  const updated = bumpHistory([{ day: '2026-11-18' }], '2026-11-18', { xp: 5, correct: 2, total: 3 });
  assert.deepEqual(updated[0], { day: '2026-11-18', xp: 5, lessons: 0, correct: 2, total: 3 });
  assert.equal(weekXp({}, NOW), 0);
  assert.equal(studyDayCount({}), 0);
  assert.ok(heartRegenMs({ hearts: 1 }, NOW) > 0);
});

test('dashboard hiển thị buổi tối, thành tựu và hạng cao', () => {
  const afternoon = new Date('2026-11-18T14:00:00').getTime();
  assert.match(renderDashboard({ state: freshState(), data, now: afternoon }), /Chào buổi chiều/);
  const evening = new Date('2026-11-18T20:00:00').getTime();
  const html = renderDashboard({ state: freshState(), data, now: evening });
  assert.match(html, /Chào buổi tối/);
  assert.match(html, /Overall —/);

  const active = {
    ...freshState(),
    goal: 10,
    history: [{ day: '2026-11-18', xp: 900 }],
    quests: { day: '2026-11-18', items: [{ id: 'q', metric: 'xp', target: 5, progress: 5, gems: 2, title: 'Nhiệm vụ' }] },
  };
  const busy = renderDashboard({ state: active, data, now: NOW });
  assert.match(busy, /Hoàn thành/);
  assert.match(busy, /thăng hạng/);
  assert.match(busy, /standing--me/);
  assert.match(busy, /quest-done/);

  const skilled = { ...freshState(), skills: { reading: { correct: 30, total: 40 } } };
  const withBands = renderDashboard({ state: skilled, data, now: NOW });
  assert.match(withBands, /Overall 7\.0/);
  assert.match(withBands, /width:77\.7/);
});

test('learn hiển thị bài đã xong thiếu accuracy và lộ trình hoàn tất', () => {
  const state = { ...freshState(), lessonsDone: { 'lesson-1': {}, 'lesson-2': {}, 'lesson-3': {} } };
  const html = renderLearn({ state, data });
  assert.match(html, /0% chính xác/);
  assert.doesNotMatch(html, /Học bài kế tiếp/);
});

test('lesson hiển thị tip và prompt mặc định', () => {
  const html = renderLesson({
    state: freshState(),
    data: { ...CURRICULUM.units[0], curriculum: CURRICULUM, unit: CURRICULUM.units[0], lesson: { id: 'l', title: 'L', xp: 5, exercises: [{ id: 'q', type: 'mcq', skill: 'reading', options: ['a', 'b'], answer: 0, explain: 'e', tip: 'Mẹo nhỏ' }] } },
    ui: { index: 0, selected: undefined, draft: '', feedback: { correct: false, expected: 'a', given: '' }, results: [false], hint: false, finished: false, summary: null, tokens: undefined },
    now: NOW,
  });
  assert.match(html, /Mẹo nhỏ/);

  const build = renderLesson({
    state: freshState(),
    data: { curriculum: CURRICULUM, unit: CURRICULUM.units[0], lesson: { id: 'l', title: 'L', xp: 5, exercises: [{ id: 'b', type: 'build', skill: 'reading', prompt: 'Xếp', words: ['a'], answer: 'a', explain: 'e' }] } },
    ui: { index: 0, selected: undefined, draft: '', feedback: null, results: [], hint: false, finished: false, summary: null, tokens: undefined },
    now: NOW,
  });
  assert.match(build, /Xếp/);
  assert.match(html, /Chọn đáp án đúng/);
});

test('practice chịu được từ thiếu colloc/tags và đề thiếu dữ liệu', () => {
  const word = { id: 'w', term: 'word', ipa: 'w', pos: 'noun', vi: 'từ', example: 'e', exampleVi: 'v' };
  const revealed = renderPractice({
    state: freshState(),
    data: { ...data, vocab: [word] },
    ui: { mode: 'the', queue: ['w'], pos: 0, revealed: true, dict: { wordId: 'w', draft: '', feedback: null }, writingTask: 0, writingOpen: null, speakingOpen: null, timer: null, now: NOW },
  });
  assert.match(revealed, /Kết hợp:/);

  const dictation = renderPractice({
    state: freshState(),
    data: { ...data, vocab: [word] },
    ui: { mode: 'nghe', queue: ['w'], pos: 0, revealed: false, dict: { wordId: 'w', draft: '', feedback: null }, writingTask: 0, writingOpen: null, speakingOpen: null, timer: null, now: NOW },
  });
  assert.match(dictation, /IELTS/);

  const bare = renderPractice({
    state: freshState(),
    data: { ...data, prompts: {}, vocab: [] },
    ui: { mode: 'noi', queue: [], pos: 0, revealed: false, dict: {}, writingTask: 0, writingOpen: null, speakingOpen: 's1', timer: null, now: NOW },
  });
  assert.ok(bare.length > 0);

  const noWriting = renderPractice({ state: freshState(), data: { ...data, prompts: { speaking: [] } }, ui: { mode: 'viet', queue: [], pos: 0, revealed: false, dict: {}, writingTask: 0, writingOpen: null, speakingOpen: null, timer: null, now: NOW } });
  assert.ok(noWriting.length > 0);

  const noTips = renderPractice({
    state: freshState(),
    data: { ...data, prompts: { ...PROMPTS, speaking: [{ id: 's9', part: 2, topic: 'T', title: 'T', cue: ['a'], prep: 60, speak: 120, sample: 'S' }] } },
    ui: { mode: 'noi', queue: [], pos: 0, revealed: false, dict: {}, writingTask: 0, writingOpen: null, speakingOpen: 's9', timer: null, now: NOW },
  });
  assert.ok(noTips.length > 0);

  assert.equal(timerHtml({ kind: 'speak' }).includes('00:00'), true);
  assert.equal(wordCard({ id: 'x', term: 'x', ipa: '', pos: '', vi: '', example: '', exampleVi: '', tags: [] }, { x: {} }).length > 0, true);
});

test('progress chịu được hồ sơ trống và hạng cao nhất', () => {
  const empty = renderProgress({ state: { ...freshState(), skills: {}, goal: undefined }, data, now: NOW });
  assert.match(empty, /Overall —/);

  const top = renderProgress({ state: { ...freshState(), xp: 9999, goal: 20, history: [{ day: '2026-11-18', xp: 50 }], skills: { reading: { total: 5 }, listening: { correct: 3 } } }, data, now: NOW });
  assert.match(top, /hạng cao nhất/);
  assert.match(top, /bar-track--gold/);
  assert.match(top, /Âm thanh: bật/);
  const muted = renderProgress({ state: { ...freshState(), settings: { sound: false, reminders: false } }, data, now: NOW });
  assert.match(muted, /Âm thanh: tắt/);
  assert.match(muted, /Nhắc học: tắt/);
  assert.match(top, /—/);
});

test('library chịu được dữ liệu thiếu và nhãn lạ', () => {
  const html = renderLibrary({ data: { papers: [{ id: 'p', title: 'T', authors: 'A', year: 2020, venue: 'V', tags: ['la'], findingVi: 'f', applyVi: 'a' }], docs: [{ id: 'd', kicker: 'K', title: 'T', pages: 1, level: 'A1', summary: 's', bullets: [], tags: ['la'] }] }, ui: { query: '', tag: 'la' } });
  assert.match(html, /aria-pressed="true"[^>]*>la \(1\)</);
  assert.doesNotMatch(html, /PDF:/);
  assert.deepEqual(renderLibrary({ data: {}, ui: { query: '', tag: 'all' } }).length > 0, true);
});
