import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import { lessons, questions } from '../../ielts-vi/assets/course.js';
import { emptyProgress, localDay, storageKey } from '../../ielts-vi/assets/progress.js';
import { mount } from '../../ielts-vi/assets/study.js';

const html = await readFile(new URL('../../ielts-vi/index.html', import.meta.url), 'utf8');
const baseDate = new Date(2026, 10, 18, 12);
const day = localDay(baseDate);

function setup(t, { state, denied = false, manualMount = false } = {}) {
  const { window } = new JSDOM(html, { url: 'https://example.test/yysd-testcenter/' });
  const { document } = window;
  const get = (id) => document.getElementById(id);
  const dialog = get('lesson-dialog');
  dialog.showModal = () => { dialog.open = true; };
  dialog.close = () => {
    dialog.open = false;
    dialog.dispatchEvent(new window.Event('close'));
  };
  let instant = new Date(baseDate);
  let counter = 0;
  const timers = new Map();
  const clock = {
    now: () => instant,
    setInterval: (fn) => { counter += 1; timers.set(counter, fn); return counter; },
    clearInterval: (id) => { timers.delete(id); },
  };
  function advance(ms) {
    instant = new Date(instant.getTime() + ms);
    for (const fn of timers.values()) fn();
  }
  if (state) window.localStorage.setItem(storageKey, JSON.stringify(state));
  if (denied) Object.defineProperty(window, 'localStorage', { get: () => { throw new Error('Denied'); } });
  if (!manualMount) mount(document, window, clock);
  const select = (index) => { document.querySelectorAll('.option input')[index].checked = true; };
  const submit = () => get('session-form').dispatchEvent(new window.Event('submit', { cancelable: true }));
  const respond = (index) => { select(index); submit(); submit(); };
  t.after(() => window.close());
  return { window, document, dialog, get, timers, advance, submit, select, respond };
}

test('answers, receives feedback, submits a lesson and reviews its mistakes', (t) => {
  const { window, document, dialog, get, submit, respond, select } = setup(t);
  assert.equal(document.documentElement.lang, 'vi');
  assert.equal(document.querySelectorAll('.lesson').length, lessons.length);
  assert.equal(get('begin-review').disabled, true);
  get('continue-lesson').click();
  assert.equal(dialog.open, true);
  assert.equal(document.activeElement, get('question-prompt'));
  assert.equal(get('question-prompt').lang, 'en');
  assert.equal(document.querySelector('audio').getAttribute('src'), 'audio/booking.mp3');
  assert.match(document.querySelector('details').textContent, /Northgate Library/);
  submit();
  assert.match(get('response-error').textContent, /chọn/);
  select(0); // wrong
  submit();
  assert.match(get('feedback').textContent, /Chưa đúng.*Friday/);
  assert.equal(get('session-meter').value, 1);
  submit();
  respond(0);
  submit();
  assert.match(get('response-error').textContent, /nhập/);
  document.querySelector('.response-label input').value = ' Notebook ';
  submit();
  assert.match(get('feedback').textContent, /Chính xác/);
  assert.equal(window.localStorage.getItem(storageKey), null, 'only save complete sessions');
  submit();
  assert.match(get('question-host').textContent, /2 \/ 3.*\+14.*1 câu sai/);
  assert.match(get('xp-summary').textContent, /^14 /);
  assert.match(get('goal-note').textContent, /đạt mục tiêu/);
  assert.match(get('streak-count').textContent, /^1 /);
  assert.equal(document.querySelectorAll('.week .practiced').length, 1);
  assert.equal(document.querySelectorAll('.badges .is-earned').length, 1);
  assert.match(get('lesson-booking').textContent, /Đã học/);
  assert.match(get('continue-lesson').textContent, /Tiếp tục/);
  assert.equal(get('continue-lesson').dataset.lesson, 'shade');
  submit();
  assert.equal(dialog.open, false);
  assert.equal(document.activeElement, get('continue-lesson'));
  get('begin-review').click();
  assert.match(get('session-title').textContent, /Ôn tập/);
  respond(1);
  assert.match(get('question-host').textContent, /lên lịch/);
  submit();
  assert.equal(document.activeElement, get('continue-lesson'));
  assert.equal(get('begin-review').disabled, true);
  assert.equal(JSON.parse(window.localStorage.getItem(storageKey)).cards['booking-1'].due, day + 1);
});

test('handles short writing, speaking timer and draft disposal without automatic scores', (t) => {
  const { window, document, dialog, get, timers, advance, submit, respond } = setup(t);
  get('lesson-overview').click();
  assert.match(get('question-host').textContent, /Riverside/);
  respond(2);
  respond(0);
  submit();
  assert.match(get('response-error').textContent, /12 từ/);
  const writing = document.querySelector('textarea');
  writing.value = questions['overview-3'].example;
  writing.dispatchEvent(new window.Event('input'));
  assert.match(get('word-count').textContent, /^[1-9]\d+ \/ 12/);
  submit();
  assert.match(get('feedback').textContent, /Gợi ý tự kiểm.*Tóm tắt cả hai/);
  submit();
  assert.match(get('question-host').textContent, /2 \/ 2/);
  assert.ok(!window.localStorage.getItem(storageKey).includes(writing.value));
  submit();
  assert.equal(document.activeElement.id, 'lesson-overview');
  get('lesson-routine').click();
  respond(1);
  respond(2);
  submit();
  assert.match(get('response-error').textContent, /xác nhận/);
  const [prepare, speak] = document.querySelectorAll('.timer-controls button');
  prepare.click();
  assert.equal(document.querySelector('.timer').textContent, '01:00');
  advance(1700);
  assert.equal(document.querySelector('.timer').textContent, '00:59');
  speak.click();
  assert.equal(timers.size, 1);
  assert.equal(document.querySelector('.timer').textContent, '02:00');
  advance(120_000);
  assert.match(get('question-host').textContent, /Hết giờ/);
  assert.equal(timers.size, 0);
  document.querySelector('.speaking-check input').checked = true;
  submit();
  assert.match(get('feedback').textContent, /chi tiết/);
  get('close-dialog').click();
  assert.equal(dialog.open, false);
  assert.equal(get('question-host').textContent, '');
  assert.equal(JSON.parse(window.localStorage.getItem(storageKey)).completed.routine, undefined);
});

test('refreshes date and external changes, and supports unavailable storage', (t) => {
  const { window, get, advance } = setup(t, { denied: true });
  const select = get('goal-select');
  select.value = '3';
  select.dispatchEvent(new window.Event('change'));
  assert.equal(get('goal-count').textContent, '0 / 3');
  assert.equal(get('storage-note').hidden, false);
  select.value = '9';
  select.dispatchEvent(new window.Event('change'));
  assert.equal(select.value, '3');
  window.dispatchEvent(new window.Event('focus')); // same date
  advance(86_400_000);
  window.dispatchEvent(new window.Event('focus')); // next date
  window.dispatchEvent(new window.StorageEvent('storage', { key: 'unrelated' }));
  assert.equal(select.value, '3');
  window.dispatchEvent(new window.StorageEvent('storage', { key: storageKey }));
  assert.equal(select.value, '1');
  window.dispatchEvent(new window.StorageEvent('storage', { key: null }));
  assert.equal(select.value, '1');
});

test('completed paths recommend practice; stale review requests do not open empty dialogs', (t) => {
  const state = emptyProgress();
  state.completed = Object.fromEntries(lessons.map(({ id }) => [id, 1]));
  const { get, dialog, window, advance } = setup(t, { state });
  assert.match(get('continue-lesson').textContent, /Luyện lại/);
  state.cards['booking-1'] = { stage: 0, due: day };
  window.localStorage.setItem(storageKey, JSON.stringify(state));
  window.dispatchEvent(new window.StorageEvent('storage', { key: storageKey }));
  assert.equal(get('continue-lesson').dataset.lesson, 'review');
  assert.match(get('continue-lesson').textContent, /đến hạn/);
  advance(-86_400_000);
  get('begin-review').click();
  assert.equal(dialog.open, false);
  assert.equal(get('begin-review').disabled, true);
});

test('boot module binds the browser clock and stops a running timer on exit', async (t) => {
  const { get, window, document, respond, dialog } = setup(t, { manualMount: true });
  globalThis.document = document;
  globalThis.window = window;
  try {
    await import('../../ielts-vi/assets/main.js');
    get('lesson-place').click();
    respond(0);
    respond(2);
    document.querySelector('.timer-controls button').click();
    assert.equal(document.querySelector('.timer').textContent, '01:00');
    get('close-dialog').click();
    assert.equal(dialog.open, false);
  } finally {
    delete globalThis.document;
    delete globalThis.window;
  }
});

test('focus controls explain their recommendation and weekly activity survives reload', (t) => {
  const state = emptyProgress();
  state.cards['shade-1'] = { stage: 0, due: day };
  state.activity[day] = 2;
  const { get, window, dialog } = setup(t, { state });
  assert.match(get('focus-note').textContent, /Đọc.*từng sai/);
  assert.equal(get('weekly-title').textContent, 'Hạng cá nhân: Đồng');
  assert.equal(get('weekly-meter').value, 1);
  get('begin-focus').click();
  assert.equal(dialog.open, true);
  assert.match(get('session-title').textContent, /trọng tâm · Đọc/);
  get('close-dialog').click();
  state.cards['shade-1'] = { stage: 2, due: day };
  const reload = () => {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
    window.dispatchEvent(new window.StorageEvent('storage', { key: storageKey }));
  };
  reload();
  assert.match(get('focus-note').textContent, /đến hạn/);
  for (const q of Object.values(questions)) state.cards[q.id] = { stage: 2, due: day + 1 };
  reload();
  assert.equal(get('begin-focus').disabled, true);
  assert.match(get('focus-note').textContent, /quay lại/);
});
