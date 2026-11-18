import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import {
  defaultState, reducer, render, escapeHtml, createApp, STORAGE_KEY
} from '../assets/js/app.mjs';
import { memoryStorage } from '../assets/js/storage.mjs';
import { MAX_HEARTS } from '../assets/js/gamification.mjs';
import { DAY_MS } from '../assets/js/srs.mjs';

const NOW = 20 * DAY_MS + 1000;
const ctx = { now: () => NOW };

function makeDom() {
  return new JSDOM('<!doctype html><html lang="vi"><body><div id="app"></div></body></html>', {
    url: 'https://example.test/'
  }).window.document;
}

test('escapeHtml mã hoá mọi ký tự nhạy cảm và chịu giá trị không phải chuỗi', () => {
  assert.equal(escapeHtml('<a href="x">&\'</a>'), '&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;');
  assert.equal(escapeHtml('không có gì'), 'không có gì');
  assert.equal(escapeHtml(42), '42');
});

test('defaultState gồm sáu thẻ SRS và các cờ giao diện', () => {
  const s = defaultState(NOW);
  assert.equal(s.cards.length, 6);
  assert.equal(s.hearts, MAX_HEARTS);
  assert.equal(s.lesson, null);
  assert.equal(s.showLeagues, false);
  assert.equal(defaultState().cards[0].id, 'coherent');
  assert.equal(STORAGE_KEY, 'yysd-ielts-vi-v1');
});

test('render: trạng thái mặc định dùng model mặc định', () => {
  const html = render(defaultState(NOW));
  assert.match(html, /Luyện IELTS mà không thấy mình đang/);
  assert.match(html, /Lộ trình hôm nay/);
  assert.match(html, /Chưa có huy hiệu/);
  assert.match(html, /Đang tắt/);
  assert.match(html, /Sẵn sàng/);
  assert.match(html, /pdfs\/01-tong-quan-nghien-cuu-ielts\.pdf/);
  assert.doesNotMatch(html, /Bảng xếp hạng tuần/);
  assert.doesNotMatch(html, /Mã lớp mẫu/);
});

test('render: trạng thái đầy đủ bật mọi panel và hai nhánh phản hồi', () => {
  const base = defaultState(NOW);
  const rich = {
    ...base,
    message: 'Bạn nhận 12 XP.',
    hearts: 0,
    todayXp: 45,
    dailyGoal: 30,
    xp: 520,
    streak: 7,
    bestStreak: 9,
    reminder: true,
    badges: ['first-lesson', 'perfect'],
    showLeagues: true,
    showSchools: true,
    showRoleplay: true,
    showBackup: true,
    lesson: { skill: 'reading', ids: ['R1', 'R2'], index: 0, correct: 0 },
    feedback: { ok: true, text: 'Chính xác! Giải thích mẫu.', id: 'R1' }
  };
  const html = render(rich, { now: NOW, board: [{ name: 'Minh Anh', xp: 320 }] });
  assert.match(html, /Bạn nhận 12 XP/);
  assert.match(html, /Cần nạp lại/);
  assert.match(html, /Hết năng lượng/);
  assert.match(html, /Chính xác!/);
  assert.match(html, /Bảng xếp hạng tuần/);
  assert.match(html, /Mã lớp mẫu/);
  assert.match(html, /Giám khảo/);
  assert.match(html, /Bản sao lưu tiến độ/);
  assert.match(html, /Đang bật/);
  assert.match(html, /Bước đầu tiên/);
  assert.match(html, /30 XP/);
  const wrong = render({ ...rich, feedback: { ok: false, text: 'Chưa đúng.', id: 'R1' } }, { now: NOW });
  assert.match(wrong, /Chưa đúng — vẫn tiến bộ/);
  assert.match(wrong, /is-wrong/);
});

test('reducer start: hết năng lượng, kỹ năng sai và bắt đầu hợp lệ', () => {
  const base = defaultState(NOW);
  assert.match(reducer({ ...base, hearts: 0 }, { type: 'start', skill: 'reading' }, ctx).message, /Hết năng lượng/);
  assert.equal(reducer(base, { type: 'start', skill: 'sai' }, ctx).message, 'Câu hỏi không tồn tại.');
  const started = reducer(base, { type: 'start', skill: 'listening' }, ctx);
  assert.equal(started.hearts, MAX_HEARTS - 1);
  assert.equal(started.lesson.skill, 'listening');
  assert.equal(started.lesson.ids.length, 3);
  assert.equal(started.lastHeartLoss, NOW);
});

test('reducer answer: không bài, đúng, sai và câu thiếu', () => {
  const base = defaultState(NOW);
  const started = reducer(base, { type: 'start', skill: 'reading' }, ctx);
  assert.equal(reducer(base, { type: 'answer', index: 0 }, ctx), base);
  const right = reducer(started, { type: 'answer', index: 0 }, ctx);
  assert.equal(right.feedback.ok, true);
  assert.equal(right.correct, 1);
  assert.equal(right.lesson.correct, 1);
  const wrong = reducer(started, { type: 'answer', index: 2 }, ctx);
  assert.equal(wrong.feedback.ok, false);
  assert.equal(wrong.correct, 0);
  const broken = { ...started, lesson: { ...started.lesson, ids: ['khong-co'] } };
  const missing = reducer(broken, { type: 'answer', index: 0 }, ctx);
  assert.equal(missing.feedback.id, null);
  assert.equal(missing.feedback.ok, false);
});

test('reducer next: chưa sẵn sàng, câu giữa và hoàn thành ở hai mức mục tiêu', () => {
  const base = defaultState(NOW);
  assert.equal(reducer(base, { type: 'next' }, ctx), base);
  const started = reducer(base, { type: 'start', skill: 'writing' }, ctx);
  assert.equal(reducer(started, { type: 'next' }, ctx), started);
  const answered = reducer(started, { type: 'answer', index: 0 }, ctx);
  const middle = reducer(answered, { type: 'next' }, ctx);
  assert.equal(middle.lesson.index, 1);
  assert.equal(middle.feedback, null);
  const last = { ...answered, lesson: { ...answered.lesson, ids: ['W1'], index: 0 } };
  const finished = reducer(last, { type: 'next' }, ctx);
  assert.equal(finished.lesson, null);
  assert.equal(finished.lessons, 1);
  assert.ok(finished.sessionXp > 0);
  assert.match(finished.message, /Bạn nhận/);
  assert.ok(finished.badges.includes('first-lesson'));
  const goalDone = reducer({ ...last, todayXp: 100 }, { type: 'next' }, ctx);
  assert.ok(goalDone.sessionXp >= finished.sessionXp);
});

test('reducer review: hết thẻ đến hạn và ôn một thẻ', () => {
  const base = defaultState(NOW);
  const empty = { ...base, cards: base.cards.map((c) => ({ ...c, dueAt: NOW + 10 * DAY_MS })) };
  assert.match(reducer(empty, { type: 'review' }, ctx).message, /Tất cả thẻ đã được ôn/);
  const done = reducer(base, { type: 'review' }, ctx);
  assert.equal(done.cards.find((c) => c.id === 'allocate').repetitions, 1);
  assert.equal(done.xp, 2);
  assert.match(done.message, /Đã ôn thẻ/);
});

test('reducer: mọi action còn lại và nhánh mặc định', () => {
  const base = defaultState(NOW);
  assert.equal(reducer(base, { type: 'goal', value: 50 }, ctx).dailyGoal, 50);
  assert.equal(reducer(base, { type: 'goal', value: 999 }, ctx), base);
  assert.equal(reducer({ ...base, hearts: 1 }, { type: 'refill' }, ctx).hearts, MAX_HEARTS);
  const pdf = reducer(base, { type: 'pdf', pdf: 'tong-quan' }, ctx);
  assert.equal(pdf.pdfsOpened, 1);
  assert.ok(pdf.badges.includes('scholar'));
  for (const flag of ['leagues', 'schools', 'roleplay', 'reminder', 'backup']) {
    const key = 'show' + flag[0].toUpperCase() + flag.slice(1);
    const value = flag === 'reminder' ? 'reminder' : key;
    assert.equal(reducer(base, { type: flag }, ctx)[value], true);
  }
  const closed = reducer({ ...base, showLeagues: true, showSchools: true, showRoleplay: true, showBackup: true }, { type: 'close' }, ctx);
  assert.equal(closed.showLeagues, false);
  assert.equal(closed.showBackup, false);
  const reset = reducer({ ...base, xp: 999 }, { type: 'reset' }, ctx);
  assert.equal(reset.xp, 0);
  assert.equal(reset.cards.length, 6);
  assert.equal(reducer(base, { type: 'khong-biet' }), base);
});

test('createApp: lỗi khởi tạo, lưu trữ và tương tác DOM', () => {
  assert.throws(() => createApp(), /Thiếu document/);
  const bare = new JSDOM('<!doctype html><html lang="vi"><body></body></html>').window.document;
  assert.throws(() => createApp({ document: bare }), /phần tử #app/);

  const doc = makeDom();
  const store = memoryStorage();
  const app = createApp({ document: doc, storage: store, now: () => NOW });
  assert.match(app.root.innerHTML, /Lộ trình hôm nay/);
  const started = app.dispatch({ type: 'start', skill: 'speaking' });
  assert.equal(started.lesson.skill, 'speaking');
  assert.match(app.root.innerHTML, /Bài luyện ngắn/);
  assert.equal(JSON.parse(store.get(STORAGE_KEY)).xp, started.xp);

  const button = app.root.querySelector('[data-action="answer"]');
  button.dispatchEvent(new (doc.defaultView.MouseEvent)('click', { bubbles: true }));
  assert.match(app.root.innerHTML, /Câu tiếp theo/);
  app.dispatch({ type: 'reset' });
  assert.match(app.root.innerHTML, /Lộ trình hôm nay/);
});

test('createApp: không truyền now/storage và dữ liệu lưu hỏng', () => {
  const doc = makeDom();
  const app = createApp({ document: doc });
  assert.equal(app.getState().hearts, MAX_HEARTS);
  assert.equal(app.dispatch({ type: 'refill' }).hearts, MAX_HEARTS);
  const doc2 = makeDom();
  const brokenStore = memoryStorage({ [STORAGE_KEY]: '{không hợp lệ' });
  const app2 = createApp({ document: doc2, storage: brokenStore });
  assert.equal(app2.getState().xp, 0);
});

test('createApp: uỷ thác sự kiện bỏ qua target lạ, action lạ và xử lý action hợp lệ', () => {
  const doc = makeDom();
  const root = doc.getElementById('app');
  let handler = null;
  root.addEventListener = (_type, fn) => { handler = fn; };
  const app = createApp({ document: doc, storage: memoryStorage(), now: () => NOW });
  assert.equal(typeof handler, 'function');
  handler({ target: {} });
  handler({ target: root });
  handler({ target: { closest: () => ({ dataset: { action: 'khong-biet' } }) } });
  app.dispatch({ type: 'start', skill: 'reading' });
  const before = app.getState().hearts;
  handler({ target: { closest: () => ({ dataset: { action: 'refill' } }) } });
  assert.equal(app.getState().hearts, MAX_HEARTS);
  assert.ok(before <= MAX_HEARTS);
});
