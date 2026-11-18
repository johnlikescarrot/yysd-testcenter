import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM(
  '<!doctype html><html lang="vi"><body><div id="app"></div></body></html>',
  { url: 'https://example.test/' }
);
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', {
  value: { serviceWorker: { register: () => Promise.resolve() } }, configurable: true
});

const { registerServiceWorker } = await import('../assets/js/boot.mjs');

test('boot khởi tạo ứng dụng trong document thật', () => {
  assert.match(dom.window.document.getElementById('app').innerHTML, /Lộ trình hôm nay/);
});

test('registerServiceWorker bỏ qua khi không có serviceWorker', () => {
  assert.equal(registerServiceWorker({}), false);
});

test('registerServiceWorker đăng ký và nuốt lỗi', async () => {
  assert.equal(registerServiceWorker({
    serviceWorker: { register: () => Promise.resolve('ok') }
  }), true);
  assert.equal(registerServiceWorker({
    serviceWorker: { register: () => Promise.reject(new Error('từ chối')) }
  }), true);
  await Promise.resolve();
});
