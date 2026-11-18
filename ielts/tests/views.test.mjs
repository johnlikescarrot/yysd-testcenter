import assert from 'node:assert/strict';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import { lessons } from '../site/catalog.mjs';
import { mount } from '../site/app.mjs';
import { parseState, storageKey } from '../site/study.mjs';
import { escape, lessonLink, reviewLink } from '../site/ui/html.mjs';
import { pages } from '../scripts/pages.mjs';

const content = pages();
const now = () => '2026-11-18';
const base = 'https://example.github.io/yysd-testcenter/';

function page(t, filename, { state, blocked = false, mountNow = true } = {}) {
  const html = content.get(filename.split('?')[0]);
  const { window } = new JSDOM(html, { url: new URL(filename, base) });
  const doc = window.document;
  t.after(() => window.close());
  if (state) window.localStorage.setItem(storageKey, JSON.stringify(state));
  if (blocked) {
    Object.defineProperty(window, 'localStorage', {
      get() { throw new Error('storage blocked'); },
    });
  }
  if (mountNow) mount(doc, window, now);
  const select = (selector) => doc.querySelector(selector);
  const text = (selector) => select(selector).textContent.trim();
  const click = () => select('form button').click();
  return { doc, window, select, text, click };
}

function answer(view, item, value = item.answers?.[0]) {
  const { doc, select, click } = view;
  if (item.kind === 'choice') {
    const option = [...doc.querySelectorAll('input[type=radio]')].find((input) => input.value === value);
    option.checked = true;
  } else if (item.kind === 'input') {
    select('#response').value = value;
  }
  click();
}

const listen = lessons[0];
const row = (id) => `[data-lesson="${id}"]`;

test('lộ trình mới và đích chuyển tiếp theo trạng thái', (t) => {
  const view = page(t, 'index.html');
  assert.equal(view.text('[data-next]'), 'Bắt đầu luyện');
  assert.equal(view.select('[data-next]').href, new URL(lessonLink(listen.id), base).href);
  assert.equal(view.select('.is-next').dataset.lesson, listen.id);
  assert.equal(view.text('[data-completed]'), '0 / 8 bài đã học');
  assert.equal(view.text('[data-streak]'), '0');
  assert.equal(view.select('[data-storage-notice]').hidden, true);
  const state = { done: [listen.id], days: { [now()]: [listen.items[0].id, listen.items[1].id] }, review: { 'l1-card': { due: now(), level: 0 } } };
  const returning = page(t, 'index.html', { state });
  assert.equal(returning.text('[data-next]'), 'Tiếp tục luyện');
  assert.match(returning.text(row(listen.id)), /Đã học/);
  assert.equal(returning.text('[data-review-note]'), '1 câu đến hạn ôn tập');
  assert.equal(returning.text('[data-streak]'), '1');
  assert.equal(returning.select('.week-dot.is-active .icon').tagName, 'svg');
  assert.match(returning.text('[data-goal-today]'), /đã đạt mục tiêu/);
  const complete = page(t, 'index.html', { state: { done: lessons.map(({ id }) => id) } });
  assert.equal(complete.text('[data-next]'), 'Luyện lại lộ trình');
  assert.equal(complete.select('.is-next'), null);
});

test('chỉ hiện câu đến hạn; phân biệt lịch trống và lịch tương lai', (t) => {
  const empty = page(t, 'review.html');
  assert.equal(empty.text('main h2'), 'Chưa có câu đến hạn');
  const scheduled = { review: { 'l1-time': { due: '2026-11-19', level: 1 } } };
  const future = page(t, 'review.html', { state: scheduled });
  assert.equal(future.text('main h2'), 'Bạn đã ôn xong hôm nay');
  assert.match(future.text('main .panel p'), /19 tháng 11/);
  scheduled.review['l1-entrance'] = { due: now(), level: 0 };
  const ready = page(t, 'review.html', { state: scheduled });
  assert.equal(ready.text('main h2'), '1 câu cần ôn');
  assert.match(ready.text('.review-list li'), /entrance/);
  assert.equal(ready.select('main .button').getAttribute('href'), reviewLink);
});

test('chọn mục tiêu, xem cột mốc và cảnh báo lưu lỗi', (t) => {
  const state = { goal: 10, done: [listen.id], days: { [now()]: ['l1-time'] } };
  const view = page(t, 'progress.html', { state });
  assert.equal(view.select('#daily-goal').value, '10');
  assert.equal(view.doc.querySelectorAll('.skill-list li').length, 4);
  assert.match(view.text('[data-milestones]'), /Đã đạt/);
  assert.match(view.text('[data-milestones]'), /Chưa đạt/);
  const change = (target, value) => {
    const goal = target.select('#daily-goal');
    goal.value = value;
    goal.dispatchEvent(new target.window.Event('change'));
  };
  change(view, '');
  assert.equal(parseState(view.window.localStorage.getItem(storageKey)).goal, 10);
  change(view, '30');
  assert.equal(parseState(view.window.localStorage.getItem(storageKey)).goal, 30);
  assert.match(view.text('[data-goal-today]'), /Còn 20 XP/);
  assert.match(view.text('[data-goal-message]'), /30 XP/);
  const blocked = page(t, 'progress.html', { blocked: true });
  change(blocked, '10');
  assert.equal(blocked.select('[data-storage-notice]').hidden, false);
  assert.match(blocked.text('[data-goal-today]'), /Còn 10 XP/);
});

test('bài Nghe kiểm tra hai dạng câu, chuyển tiêu điểm và lưu kết quả', (t) => {
  const view = page(t, lessonLink(listen.id));
  const { text, select, doc, click, window } = view;
  const audio = select('audio');
  assert.ok(audio);
  assert.equal(audio.querySelector('source').getAttribute('src'), 'media/thu-vien.mp3');
  assert.equal(select('.source-paper details').open, false);
  click();
  assert.equal(text('form [role="status"]'), 'Hãy chọn một đáp án.');
  answer(view, listen.items[0], '2:00 p.m.');
  assert.equal(text('#feedback-title'), 'Chưa chính xác');
  assert.equal(doc.activeElement.id, 'feedback-title');
  assert.equal(select('progress').value, 1);
  click();
  assert.equal(select('audio'), audio);
  assert.equal(doc.activeElement.tagName, 'LEGEND');
  select('#response').value = '  ';
  click();
  assert.equal(text('form [role="status"]'), 'Hãy nhập câu trả lời.');
  // Another tab finished a lesson after this one was opened.
  window.localStorage.setItem(storageKey, JSON.stringify({ done: [lessons[1].id] }));
  answer(view, listen.items[1], '  WEST ');
  assert.equal(text('#feedback-title'), 'Chính xác!');
  click();
  for (const item of listen.items.slice(2)) {
    answer(view, item);
    click();
  }
  assert.equal(text('#result-title'), 'Đã hoàn thành bài luyện!');
  assert.match(text('.lesson-result'), /3 \/ 4.*\+30 XP/);
  assert.equal(doc.activeElement.id, 'result-title');
  const saved = parseState(window.localStorage.getItem(storageKey));
  assert.deepEqual(saved.done, [lessons[1].id, listen.id]);
  assert.equal(saved.review['l1-time'].due, now());
});

test('tự đối chiếu bài viết và nói không đưa vào điểm trắc nghiệm', (t) => {
  for (const lesson of [lessons[2], lessons[3]]) {
    const view = page(t, lessonLink(lesson.id));
    for (const item of lesson.items.slice(0, -1)) {
      answer(view, item);
      view.click();
    }
    const item = lesson.items.at(-1);
    if (item.kind === 'write') {
      view.select('textarea').value = 'A private draft.';
      assert.ok(view.select('.source-paper p[lang="en"]'));
    } else {
      assert.equal(view.select('audio'), null);
      assert.equal(view.select('.source-paper'), null);
      assert.match(view.text('.spoken-instruction'), /không thu âm/);
    }
    view.click();
    assert.equal(view.text('#feedback-title'), 'Gợi ý tự đối chiếu');
    assert.equal(view.text('.model'), item.model);
    view.click();
    assert.match(view.text('.lesson-result'), /3 \/ 3/);
    assert.doesNotMatch(view.window.localStorage.getItem(storageKey), /private draft/);
  }
});

test('lượt ôn kiểm tra nhiều kỹ năng; đường dẫn trống và sai vẫn hữu ích', (t) => {
  const missing = page(t, 'practice.html?bai=khong-ton-tai');
  assert.equal(missing.text('.empty-state h2'), 'Không tìm thấy bài luyện');
  assert.equal(missing.select('.button').href, new URL(lessonLink(listen.id), base).href);
  const empty = page(t, reviewLink);
  assert.equal(empty.text('.empty-state h2'), 'Không có câu đến hạn');
  const state = { review: { 'l1-time': { due: now(), level: 0 }, 'r1-main': { due: now(), level: 0 } } };
  const view = page(t, reviewLink, { state });
  assert.equal(view.text('.lesson-head h1'), 'Ôn tập theo lịch');
  answer(view, listen.items[0]);
  view.click();
  assert.equal(view.select('audio'), null);
  answer(view, lessons[1].items[0]);
  view.click();
  assert.equal(view.text('#result-title'), 'Đã hoàn thành lượt ôn!');
  const saved = parseState(view.window.localStorage.getItem(storageKey));
  assert.equal(saved.review['r1-main'].due, '2026-11-19');
  assert.deepEqual(saved.done, []);
});

test('điểm vào ứng dụng và mã hóa HTML', async (t) => {
  const { doc, window } = page(t, 'index.html', { mountNow: false });
  globalThis.document = doc;
  globalThis.window = window;
  try {
    await import('../site/entry.mjs');
    assert.match(doc.querySelector('[data-goal-today]').textContent, /20 XP/);
  } finally {
    delete globalThis.document;
    delete globalThis.window;
  }
  assert.equal(escape(`một & <hai> "ba" 'bốn'`), 'một &amp; &lt;hai&gt; &quot;ba&quot; &#39;bốn&#39;');
});
