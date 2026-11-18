#!/usr/bin/env node
/**
 * Kiểm thử khói cho bản chạy thật trong DOM (jsdom).
 *
 * Mục đích: mở từng trang HTML đã sinh, nạp browser.js + dữ liệu JSON thật,
 * rồi mô phỏng vài thao tác của người học. Bắt được lỗi runtime mà kiểm thử
 * đơn vị không thấy (ví dụ tên trường dữ liệu lệch hoặc thiếu phần tử DOM).
 *
 * Chạy: cd vi && npm install --no-save jsdom && node ../scripts/vi/smoke.mjs
 */

import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(fileURLToPath(new URL('../../vi/', import.meta.url)));

function click(window, selector, index = 0) {
  const nodes = [...window.document.querySelectorAll(selector)];
  if (nodes.length <= index) return false;
  nodes[index].click();
  return true;
}

function submit(window, selector) {
  const form = window.document.querySelector(selector);
  if (!form) return false;
  form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
  return true;
}

function typeInto(window, selector, value) {
  const input = window.document.querySelector(selector);
  if (!input) return false;
  input.value = value;
  return true;
}

const PAGES = [
  {
    file: 'index.html',
    page: 'dashboard',
    marker: 'Một bài ngắn, một bước tiến',
    interact(window) {
      const problems = [];
      if (!click(window, '[data-action="set-goal"]', 0)) problems.push('không có nút chọn mục tiêu');
      const pressed = window.document.querySelector('[data-action="set-goal"][aria-pressed="true"]');
      if (!pressed) problems.push('không cập nhật trạng thái mục tiêu');
      if (!click(window, '[data-action="toggle-setting"], [data-action="buy-freeze"]', 0)) {
        problems.push('không có nút tương tác trên trang chủ');
      }
      return problems;
    },
  },
  {
    file: 'hoc.html',
    page: 'learn',
    marker: 'Lộ trình 8 chương',
    interact(window) {
      const problems = [];
      if (!window.document.querySelector('a[href^="./bai-hoc.html?bai="]')) problems.push('không có liên kết vào bài học');
      return problems;
    },
  },
  {
    file: 'bai-hoc.html?bai=doc-1-1',
    page: 'lesson',
    marker: 'Kiểm tra',
    interact(window) {
      const problems = [];
      if (!click(window, '[data-action="choose-option"]', 0)) problems.push('không có lựa chọn đáp án');
      if (!submit(window, 'form[data-action="check"]')) problems.push('không gửi được câu trả lời');
      if (!window.document.querySelector('.feedback')) problems.push('không hiện phản hồi sau khi kiểm tra');
      if (!click(window, '[data-action="next"]', 0)) problems.push('không chuyển được sang câu tiếp theo');
      return problems;
    },
  },
  {
    file: 'luyen-tap.html',
    page: 'practice',
    marker: 'Bốn cách luyện không tốn trái tim',
    interact(window) {
      const problems = [];
      if (!click(window, '[data-action="reveal-card"]', 0)) problems.push('không lật được thẻ');
      if (!window.document.querySelector('[data-action="grade-card"]')) problems.push('không hiện nút đánh giá thẻ');
      if (!click(window, '[data-action="mode"]', 1)) problems.push('không chuyển được chế độ nghe');
      if (!window.document.querySelector('[data-action="check-dictation"]')) problems.push('chế độ nghe thiếu ô nhập');
      return problems;
    },
  },
  {
    file: 'thu-vien.html',
    page: 'library',
    marker: 'Kho trích dẫn',
    interact(window) {
      const problems = [];
      const before = window.document.querySelectorAll('.plain-list li').length;
      if (!typeInto(window, '#paper-query', 'cepeda')) problems.push('thiếu ô tìm kiếm');
      if (!submit(window, 'form[data-action="search-papers"]')) problems.push('không gửi được tìm kiếm');
      const after = window.document.querySelectorAll('.plain-list li').length;
      if (after === 0 || after >= before) problems.push('tìm kiếm không lọc danh sách');
      return problems;
    },
  },
  {
    file: 'tien-do.html',
    page: 'progress',
    marker: 'Tiến độ của bạn',
    interact(window) {
      const problems = [];
      if (!click(window, '[data-action="toggle-setting"]', 0)) problems.push('không có công tắc cài đặt');
      if (!window.document.querySelector('.badge-card')) problems.push('không hiện thành tựu');
      return problems;
    },
  },
];

async function loadJsdom() {
  try {
    const requireFromVi = createRequire(path.join(ROOT, 'package.json'));
    return requireFromVi('jsdom');
  } catch {
    console.error('Thiếu jsdom. Chạy: npm install --no-save jsdom (trong thư mục vi).');
    process.exit(2);
  }
}

function fetchStub() {
  return async (input) => {
    const url = new URL(String(input));
    const relative = url.pathname.replace(/^\/vi\//, '');
    const body = await readFile(path.join(ROOT, relative), 'utf8');
    return {
      ok: true,
      status: 200,
      json: async () => JSON.parse(body),
    };
  };
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function settle(document, timeoutMs = 5000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (document.body.dataset.ready === 'true') return true;
    await wait(20);
  }
  return false;
}

function text(document) {
  return document.getElementById('app')?.textContent ?? '';
}

async function run() {
  const { JSDOM, VirtualConsole } = await loadJsdom();
  let failures = 0;

  for (const [index, spec] of PAGES.entries()) {
    const html = await readFile(path.join(ROOT, spec.file.split('?')[0]), 'utf8');
    const virtualConsole = new VirtualConsole();
    const errors = [];
    virtualConsole.on('jsdomError', (error) => errors.push(error.message));
    virtualConsole.on('error', (message) => errors.push(String(message)));

    const dom = new JSDOM(html, {
      url: `http://localhost/vi/${spec.file}`,
      runScripts: 'outside-only',
      pretendToBeVisual: true,
      virtualConsole,
    });

    globalThis.window = dom.window;
    globalThis.document = dom.window.document;
    globalThis.localStorage = dom.window.localStorage;
    globalThis.fetch = fetchStub();
    globalThis.Blob = dom.window.Blob;
    globalThis.FormData = dom.window.FormData;

    const before = text(dom.window.document);
    let crash = null;
    try {
      await import(new URL(`../../vi/js/browser.js?v=${index}`, import.meta.url).href);
    } catch (error) {
      crash = String(error && error.message ? error.message : error);
    }
    const ready = crash ? false : await settle(dom.window.document);

    const content = text(dom.window.document);
    const problems = [];
    if (crash) problems.push(`lỗi khi chạy: ${crash}`);
    else if (!ready) problems.push('browser.js không đánh dấu data-ready (lỗi khi khởi động)');
    if (!content.includes(spec.marker)) problems.push(`thiếu nội dung "${spec.marker}"`);
    if (before === content) problems.push('không có nội dung nào được vẽ');
    if (errors.length > 0) problems.push(`lỗi console: ${errors.join(' | ')}`);

    if (problems.length === 0 && spec.interact) {
      try {
        problems.push(...spec.interact(dom.window));
      } catch (error) {
        problems.push(`lỗi khi tương tác: ${error.message}`);
      }
    }

    if (problems.length === 0) {
      console.log(`✓ ${spec.page.padEnd(9)} ${spec.file}`);
    } else {
      failures += 1;
      console.log(`✗ ${spec.page.padEnd(9)} ${spec.file}`);
      for (const problem of problems) console.log(`   - ${problem}`);
    }

    dom.window.close();
  }

  if (failures > 0) {
    console.error(`\n${failures} trang có lỗi.`);
    process.exit(1);
  }
  console.log(`\nTất cả ${PAGES.length} trang khởi động sạch.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
