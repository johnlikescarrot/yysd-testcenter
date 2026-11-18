import test from 'node:test';
import assert from 'node:assert/strict';
import { PAGES, createInitialUi, renderPage, createController, formatTimer } from '../js/app.js';
import { createInitialState, touchState } from '../js/core/state.js';
import { STREAK_FREEZE_COST, STREAK_REPAIR_COST } from '../js/core/gamify.js';
import { CURRICULUM, VOCAB, PROMPTS, PAPERS, DOCS, lessonData } from './helpers/fixtures.mjs';

const NOW = new Date('2026-11-18T09:00:00').getTime();
const data = { curriculum: CURRICULUM, vocab: VOCAB, prompts: PROMPTS, papers: PAPERS, docs: DOCS, wordOfDay: VOCAB[0] };
const freshState = () => touchState(createInitialState(NOW), NOW);

function harness(page, options = {}) {
  const calls = { persist: [], speak: [], notify: [], download: [], navigate: [] };
  const deps = {
    now: () => NOW,
    persist: (state) => calls.persist.push(state),
    speak: (text, rate) => calls.speak.push({ text, rate }),
    notify: (text) => calls.notify.push(text),
    download: (filename, content) => calls.download.push({ filename, content }),
    navigate: (href) => calls.navigate.push(href),
    ...options.deps,
  };
  const controller = createController({
    page,
    state: options.state || freshState(),
    data: options.data || data,
    ui: options.ui,
    deps,
  });
  return { controller, calls };
}

test('PAGES có đủ 6 trang và formatTimer xử lý mọi mốc', () => {
  assert.deepEqual(PAGES, ['dashboard', 'learn', 'lesson', 'practice', 'progress', 'library']);
  assert.equal(formatTimer(0), '00:00');
  assert.equal(formatTimer(0, NOW), '00:00 · hết giờ');
  assert.equal(formatTimer(65_000), '01:05');
  assert.equal(formatTimer(3_661_000), '61:01');
});

test('createInitialUi tạo trạng thái riêng cho từng trang', () => {
  const state = freshState();
  const lesson = createInitialUi({ page: 'lesson', state, data: lessonData(), now: NOW });
  assert.equal(lesson.index, 0);
  assert.equal(lesson.tokens.length, 0);

  const build = createInitialUi({
    page: 'lesson',
    state,
    data: { lesson: { exercises: [{ type: 'build', words: ['a', 'b'] }] } },
    now: NOW,
  });
  assert.equal(build.tokens.length, 2);

  const practice = createInitialUi({ page: 'practice', state, data, now: NOW });
  assert.equal(practice.mode, 'the');
  assert.equal(practice.queue.length, 4);
  assert.equal(practice.dict.wordId, 'analyse');

  const due = createInitialUi({
    page: 'practice',
    state: { ...state, cards: { benefit: { due: NOW - 1, interval: 1 } } },
    data,
    now: NOW,
  });
  assert.deepEqual(due.queue, ['benefit']);

  const emptyPractice = createInitialUi({ page: 'practice', state, data: { vocab: [] }, now: NOW });
  assert.equal(emptyPractice.queue.length, 0);
  assert.equal(emptyPractice.dict.wordId, null);

  const library = createInitialUi({ page: 'library', state, data, now: NOW });
  assert.deepEqual(library, { now: NOW, query: '', tag: 'all' });
  assert.deepEqual(createInitialUi({ page: 'dashboard', state, data, now: NOW }), { now: NOW });
});

test('renderPage định tuyến đủ 6 trang và trang mặc định', () => {
  const state = freshState();
  const lessonUi = createInitialUi({ page: 'lesson', state, data: lessonData(), now: NOW });
  for (const page of PAGES) {
    const ui = page === 'lesson' ? lessonUi : createInitialUi({ page, state, data, now: NOW });
    const html = renderPage({ page: page === 'lesson' ? 'lesson' : page, state, data: page === 'lesson' ? lessonData() : data, ui, now: NOW });
    assert.ok(html.length > 100, page);
  }
  const fallback = renderPage({ page: 'khong-co', state, data, ui: {}, now: NOW });
  assert.match(fallback, /Một bài ngắn, một bước tiến/);
});

test('luồng bài học: chọn đáp án, kiểm tra, gợi ý và chuyển câu', () => {
  const { controller, calls } = harness('lesson', { data: lessonData() });
  assert.equal(controller.page, 'lesson');

  controller.dispatch('choose-option', { value: 1 });
  assert.deepEqual(controller.getUi().selected, [1]);
  controller.dispatch('hint');
  assert.equal(controller.getUi().hint, true);
  controller.dispatch('check');
  const afterCheck = controller.getUi();
  assert.equal(afterCheck.feedback.correct, true);
  assert.equal(afterCheck.results.length, 1);
  assert.ok(calls.notify.some((text) => text.includes('Chính xác')));
  assert.ok(calls.persist.length >= 1);

  controller.dispatch('choose-option', { value: 0 });
  assert.deepEqual(controller.getUi().selected, [1]);
  controller.dispatch('check');
  assert.equal(controller.getUi().results.length, 1);

  controller.dispatch('next');
  assert.equal(controller.getUi().index, 1);
  assert.equal(controller.getUi().feedback, null);
});

test('luồng bài học: câu điền từ, xếp câu, nghe và bỏ qua', () => {
  const { controller, calls } = harness('lesson', { data: lessonData() });
  controller.dispatch('next');
  assert.equal(controller.getUi().index, 0);
  controller.dispatch('check');
  assert.equal(controller.getUi().feedback.correct, false);
  controller.dispatch('next');
  assert.equal(controller.getUi().index, 1);

  controller.dispatch('check');
  assert.equal(controller.getUi().feedback.correct, false);
  controller.dispatch('next');

  const build = controller.getUi();
  assert.equal(build.index, 2);
  assert.equal(build.tokens.length, 4);
  controller.dispatch('select-token', { value: build.tokens[0].id });
  controller.dispatch('select-token', { value: build.tokens[0].id });
  assert.deepEqual(controller.getUi().selected, [build.tokens[0].id]);
  controller.dispatch('undo-token', { value: build.tokens[0].id });
  assert.deepEqual(controller.getUi().selected, []);
  controller.dispatch('select-token', { value: build.tokens[0].id });
  controller.dispatch('check');
  assert.equal(controller.getUi().feedback.correct, false);
  assert.equal(controller.getUi().results.length, 3);
  controller.dispatch('skip');
  assert.equal(controller.getUi().feedback.correct, false);
  assert.equal(controller.getUi().results.at(-1), false);
  controller.dispatch('select-token', { value: 'x' });
  controller.dispatch('undo-token', { value: 'x' });
  assert.deepEqual(controller.getUi().selected, [build.tokens[0].id]);
  controller.dispatch('next');

  assert.equal(controller.getUi().index, 3);
  assert.ok(calls.speak.some((item) => item.text === 'Open the door.'));
  controller.dispatch('play-audio', { value: 'slow' });
  assert.ok(calls.speak.some((item) => item.rate === 0.72));
  controller.dispatch('play-audio', {});
  controller.dispatch('draft', { text: 'Open the door.' });
  controller.dispatch('check', { text: 'Open the door.' });
  assert.equal(controller.getUi().feedback.correct, true);
  controller.dispatch('next');
  assert.equal(controller.getUi().finished, true);
  assert.ok(controller.getUi().summary.xp >= 10);
  assert.match(controller.html(), /Bài tiếp theo|Xem lộ trình/);
});

test('kiểm tra câu mcq khi chưa chọn đáp án và khi không có câu hỏi', () => {
  const { controller } = harness('lesson', { data: lessonData() });
  controller.dispatch('check');
  assert.equal(controller.getUi().feedback.correct, false);
  controller.dispatch('next');

  const broken = harness('lesson', { data: { curriculum: CURRICULUM, unit: CURRICULUM.units[0], lesson: { id: 'x', title: 'T', xp: 5, exercises: [] } } });
  broken.controller.dispatch('check');
  broken.controller.dispatch('skip');
  broken.controller.dispatch('next');
  broken.controller.dispatch('play-audio');
  assert.match(broken.controller.html(), /chưa có câu hỏi/);
});

test('bài học hoàn thành mở khoá thành tựu và phát thông báo', () => {
  const state = freshState();
  const { controller, calls } = harness('lesson', { state, data: lessonData() });
  for (let i = 0; i < 4; i += 1) {
    controller.dispatch('check', { text: 'Open the door.' });
    controller.dispatch('next');
  }
  assert.equal(controller.getUi().finished, true);
  assert.ok(controller.getUi().summary.unlocked.length >= 1);
  assert.ok(calls.notify.some((text) => text.startsWith('Mở khoá:')));
  assert.ok(calls.persist.length >= 4);
  assert.ok(controller.getState().lessonsDone['lesson-1']);
});

test('luyện tập: chế độ, lật thẻ, chấm điểm và phát âm', () => {
  const { controller, calls } = harness('practice');
  controller.dispatch('mode', { value: 'nghe' });
  assert.equal(controller.getUi().mode, 'nghe');
  controller.dispatch('mode', { value: 'sai' });
  assert.equal(controller.getUi().mode, 'nghe');

  controller.dispatch('reveal-card');
  assert.equal(controller.getUi().revealed, true);

  controller.dispatch('play-word', { value: 'analyse' });
  controller.dispatch('play-word', { value: 'analyse', slow: true });
  controller.dispatch('play-word', { value: 'khong-co' });
  assert.deepEqual(calls.speak.map((item) => item.rate), [1, 0.75]);

  const before = controller.getState().cards;
  controller.dispatch('grade-card', { value: 'good' });
  assert.equal(controller.getUi().pos, 1);
  assert.equal(controller.getUi().revealed, false);
  assert.ok(controller.getState().cards.analyse);
  assert.notDeepEqual(before, controller.getState().cards);

  const empty = harness('practice', { data: { ...data, vocab: [] }, ui: { mode: 'the', queue: [], pos: 0, revealed: false, dict: {}, now: NOW } });
  empty.controller.dispatch('grade-card', { value: 'good' });
  empty.controller.dispatch('next-dictation');
  assert.equal(empty.controller.getUi().pos, 0);
});

test('luyện tập: nghe chép chính tả đúng, sai và chuyển từ', () => {
  const { controller, calls } = harness('practice');
  controller.dispatch('check-dictation', { text: 'analyse' });
  assert.equal(controller.getUi().dict.feedback.correct, true);
  assert.ok(calls.notify.some((text) => text.includes('Nghe chuẩn')));
  controller.dispatch('check-dictation', { text: 'benefit' });
  assert.equal(controller.getUi().dict.feedback.correct, true);

  controller.dispatch('next-dictation');
  assert.equal(controller.getUi().dict.feedback, null);
  assert.equal(controller.getUi().dict.wordId, 'benefit');
  assert.ok(calls.speak.some((item) => item.text === 'benefit'));

  controller.dispatch('draft', { text: 'benefit', scope: 'dict' });
  controller.dispatch('check-dictation');
  assert.equal(controller.getUi().dict.feedback.correct, true);

  const noWord = harness('practice', { ui: { mode: 'nghe', queue: ['ghost'], pos: 0, revealed: false, dict: { wordId: 'ghost', draft: '', feedback: null }, now: NOW } });
  noWord.controller.dispatch('check-dictation', { text: 'x' });
  assert.equal(noWord.controller.getUi().dict.feedback, null);

  const wrong = harness('practice');
  wrong.controller.dispatch('check-dictation', { text: 'sai bét' });
  assert.equal(wrong.controller.getUi().dict.feedback.correct, false);
});

test('luyện tập: khôi phục lượt ôn ưu tiên thẻ đến hạn', () => {
  const { controller } = harness('practice');
  controller.dispatch('grade-card', { value: 'good' });
  controller.dispatch('restart-review');
  assert.equal(controller.getUi().pos, 0);
  assert.equal(controller.getUi().revealed, false);

  const due = harness('practice', { state: { ...freshState(), cards: { benefit: { due: NOW - 1, interval: 1 } } } });
  due.controller.dispatch('restart-review');
  assert.deepEqual(due.controller.getUi().queue, ['benefit']);

  const scheduled = harness('practice', { state: { ...freshState(), cards: { analyse: { due: NOW + 1, interval: 1 } } } });
  scheduled.controller.dispatch('restart-review');
  assert.deepEqual(scheduled.controller.getUi().queue, ['analyse']);

  const plain = harness('practice');
  plain.controller.dispatch('restart-review');
  assert.equal(plain.controller.getUi().queue.length, 4);

  const emptyVocab = harness('practice', { data: { ...data, vocab: [] } });
  emptyVocab.controller.dispatch('restart-review');
  assert.deepEqual(emptyVocab.controller.getUi().queue, []);
  assert.equal(emptyVocab.controller.getUi().dict.wordId, null);
});

test('luyện tập: đề viết, cue card và hẹn giờ', () => {
  const { controller } = harness('practice');
  controller.dispatch('writing-task', { value: 2 });
  assert.equal(controller.getUi().writingTask, 2);
  controller.dispatch('writing-task', { value: 'x' });
  assert.equal(controller.getUi().writingTask, 0);

  controller.dispatch('toggle-writing', { value: 'w1' });
  assert.equal(controller.getUi().writingOpen, 'w1');
  controller.dispatch('toggle-writing', { value: 'w1' });
  assert.equal(controller.getUi().writingOpen, null);

  controller.dispatch('toggle-speaking', { value: 's1' });
  assert.equal(controller.getUi().speakingOpen, 's1');
  controller.dispatch('toggle-speaking', { value: 's1' });
  assert.equal(controller.getUi().speakingOpen, null);

  controller.dispatch('start-timer', { value: 60, kind: 'prep', topic: 'Chủ đề' });
  assert.equal(controller.getUi().timer.label, '01:00');
  assert.equal(controller.getUi().timer.kind, 'prep');
  const html = controller.html();
  assert.match(html, /Chuẩn bị/);

  controller.dispatch('start-timer', { value: 0 });
  assert.equal(controller.getUi().timer.limit, 60_000);
  controller.dispatch('start-timer', { value: 'x' });
  controller.dispatch('start-timer', { value: 120 });
  assert.equal(controller.getUi().timer.kind, 'speak');
  assert.equal(controller.getUi().timer.topic, '');

  controller.dispatch('stop-timer');
  assert.equal(controller.getUi().timer, null);
  controller.dispatch('tick');
});

test('tick cập nhật đồng hồ và trả HTML', () => {
  const { controller } = harness('practice');
  assert.ok(controller.html());
  controller.dispatch('start-timer', { value: 60, kind: 'speak', topic: 'Đề' });
  const html = controller.tick(NOW + 1000);
  assert.match(html, /00:59/);
  const done = controller.tick(NOW + 120_000);
  assert.match(done, /hết giờ/);
  assert.ok(controller.tick(undefined).length > 0);
});

test('trang chủ: mục tiêu, bảo hiểm, sửa chuỗi, nạp tim, cài đặt và dữ liệu', () => {
  const rich = { ...freshState(), gems: 1000, hearts: 1, streak: 5, lastStudyDay: '2026-11-01' };
  const { controller, calls } = harness('dashboard', { state: rich, deps: {} });

  controller.dispatch('set-goal', { value: 60 });
  assert.equal(controller.getState().goal, 60);
  controller.dispatch('set-goal', { value: 45 });
  assert.equal(controller.getState().goal, 60);

  const freezesBefore = controller.getState().freezes;
  controller.dispatch('buy-freeze');
  assert.equal(controller.getState().freezes, freezesBefore + 1);
  assert.ok(calls.notify.at(-1).includes('bảo hiểm'));

  controller.dispatch('repair-streak');
  assert.equal(controller.getState().gems, 1000 - STREAK_FREEZE_COST - STREAK_REPAIR_COST);
  assert.equal(controller.getState().streak, 5);
  assert.equal(controller.getState().lastStudyDay, '2026-11-17');
  assert.ok(calls.notify.at(-1));

  controller.dispatch('refill-hearts');
  assert.equal(controller.getState().hearts, 5);

  controller.dispatch('toggle-setting', { value: 'sound' });
  assert.equal(controller.getState().settings.sound, false);

  controller.dispatch('export-data');
  assert.equal(calls.download.length, 1);
  assert.match(calls.download[0].filename, /^yysd-ielts-2026-11-18\.json$/);
  assert.match(calls.download[0].content, /"version"/);

  controller.dispatch('import-data', { text: JSON.stringify({ xp: 777 }) });
  assert.equal(controller.getState().xp, 777);
  assert.match(calls.notify.at(-1), /khôi phục/i);

  controller.dispatch('import-data', { text: 'hỏng' });
  assert.equal(controller.getState().xp, 777);
  assert.ok(calls.notify.at(-1).includes('Không đọc được'));
});

test('dashboard không đủ đá quý cho bảo hiểm và nạp tim', () => {
  const { controller, calls } = harness('dashboard', { state: { ...freshState(), gems: 5, hearts: 1 } });
  controller.dispatch('buy-freeze');
  assert.equal(controller.getState().freezes, 1);
  controller.dispatch('refill-hearts');
  assert.equal(controller.getState().hearts, 1);
  assert.equal(calls.notify.length, 2);
});

test('thư viện: tìm kiếm, lọc nhãn và xoá tìm kiếm', () => {
  const { controller } = harness('library');
  controller.dispatch('search-papers', { text: 'cepeda' });
  assert.equal(controller.getUi().query, 'cepeda');
  assert.match(controller.html(), /Distributed practice/);

  controller.dispatch('filter-tag', { value: 'tu-vung' });
  assert.equal(controller.getUi().tag, 'tu-vung');
  controller.dispatch('filter-tag', {});
  assert.equal(controller.getUi().tag, 'all');
  controller.dispatch('search-papers', {});
  assert.equal(controller.getUi().query, '');
  controller.dispatch('clear-search');
  assert.equal(controller.getUi().query, '');
});

test('hành động lạ, sync và hàm html không làm hỏng trạng thái', () => {
  const { controller } = harness('dashboard');
  const before = controller.getState();
  const out = controller.dispatch('khong-ton-tai');
  assert.equal(out.state, before);
  assert.ok(out.html.length > 0);

  const synced = controller.sync({ ...before, xp: 1234 });
  assert.match(synced, /cấp 5/);
  assert.equal(controller.getState().xp, 1234);

  const ui = controller.getUi();
  const manual = createController({ page: 'progress', state: before, data, ui: { ...ui }, deps: { now: () => NOW } });
  assert.match(manual.html(), /Tiến độ của bạn/);
  assert.equal(manual.getUi().now, NOW);
});

test('điều hướng và hiệu ứng chỉ chạy khi có deps tương ứng', () => {
  const silent = createController({ page: 'lesson', state: freshState(), data: lessonData(), deps: { now: () => NOW } });
  silent.dispatch('choose-option', { value: 1 });
  silent.dispatch('check');
  const out = silent.dispatch('next');
  assert.equal(out.effects.length, 0);
  assert.ok(out.html);
});
