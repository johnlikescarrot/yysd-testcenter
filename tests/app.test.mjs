import { describe, it, expect, beforeAll, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { JSDOM } from 'jsdom';
import { QUESTIONS } from '../docs/js/data.js';

const HTML_PATH = resolve(process.cwd(), 'docs/index.html');

function click(action, attrs = {}) {
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('data-action', action);
  for (const [key, value] of Object.entries(attrs)) button.setAttribute(key, value);
  document.body.appendChild(button);
  button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  button.remove();
}

function clickRaw(element) {
  document.body.appendChild(element);
  element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  element.remove();
}

let app;

beforeAll(async () => {
  const html = readFileSync(HTML_PATH, 'utf8');
  const dom = new JSDOM(html, { url: 'https://yysd.test/' });
  document.documentElement.setAttribute('lang', 'vi');
  document.head.innerHTML = dom.window.document.head.innerHTML;
  document.body.innerHTML = dom.window.document.body.innerHTML;
  window.localStorage.clear();
  vi.resetModules();
  const module = await import('../docs/js/main.js');
  expect(module).toBeTruthy();
  app = document.querySelector('#app');
  expect(app).toBeNull();
});

describe('ứng dụng trong trình duyệt', () => {
  it('dựng giao diện tiếng Việt ngay khi tải', () => {
    expect(document.getElementById('stat-xp').textContent).toBe('0');
    expect(document.getElementById('unit-list').innerHTML).toContain('Đơn vị 8');
    expect(document.getElementById('pdf-list').innerHTML).toContain('.pdf');
    expect(document.getElementById('league-name').textContent).toBe('Đồng');
    expect(document.getElementById('stat-lastday').textContent).toBe('Chưa có');
    expect(document.getElementById('lesson-status').textContent).toBe('Sẵn sàng');
    expect(document.getElementById('year').textContent).toHaveLength(4);
  });

  it('bỏ qua cú nhấp không có hành động hoặc hành động không rõ', () => {
    clickRaw(document.createElement('div'));
    click('khong-ton-tai');
    expect(document.getElementById('stat-xp').textContent).toBe('0');
  });

  it('bắt đầu bài học và trả lời đúng, rồi trả lời sai', () => {
    click('start');
    expect(document.getElementById('lesson-status').textContent).toBe('Đang học');
    expect(document.getElementById('lesson-area').innerHTML).toContain('data-choice');
    click('answer', { 'data-choice': QUESTIONS[0].answer });
    expect(document.getElementById('stat-xp').textContent).toBe('10');
    expect(document.getElementById('feedback').innerHTML).toContain('good');
    expect(document.getElementById('stat-streak').textContent).toBe('1');
    click('next');
    click('answer', { 'data-choice': 'sai-hoan-toan' });
    expect(document.getElementById('feedback').innerHTML).toContain('bad');
    expect(document.getElementById('stat-hearts').textContent).toBe('4');
    expect(document.getElementById('stat-accuracy').textContent).toBe('50');
  });

  it('chạy toàn bộ chu kỳ hành động còn lại', () => {
    click('review');
    expect(document.getElementById('feedback').textContent).toContain('thẻ cần ôn');
    click('goal');
    click('goal');
    click('goal');
    click('heart');
    expect(document.getElementById('stat-hearts').textContent).toBe('5');
    click('friend');
    click('theme');
    expect(document.querySelector('[data-action="theme"]').getAttribute('aria-pressed')).toBe('true');
    click('theme');
    expect(document.querySelector('[data-action="theme"]').getAttribute('aria-pressed')).toBe('false');
    click('tab', { 'data-view': 'tai-lieu' });
    click('reset-open');
    expect(document.getElementById('reset-dialog').hidden).toBe(false);
    click('reset-no');
    expect(document.getElementById('reset-dialog').hidden).toBe(true);
    click('close');
    click('reset-open');
    click('reset-yes');
    expect(document.getElementById('stat-xp').textContent).toBe('0');
    expect(document.getElementById('stat-lastday').textContent).toBe('Chưa có');
  });

  it('lưu tiến độ vào bộ nhớ cục bộ', () => {
    click('start');
    click('answer', { 'data-choice': QUESTIONS[0].answer });
    const saved = window.localStorage.getItem('yysd-vi-ielts-state');
    expect(saved).toBeTruthy();
    expect(JSON.parse(saved).xp).toBe(10);
  });
});
