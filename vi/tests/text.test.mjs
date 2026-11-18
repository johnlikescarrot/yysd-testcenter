import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml, stripDiacritics, searchKey, formatInt, formatPercent, truncate, pluralVi } from '../js/core/text.js';

test('escapeHtml thoát mọi ký tự nguy hiểm', () => {
  assert.equal(escapeHtml(`<a href="x">'&'</a>`), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
  assert.equal(escapeHtml(null), '');
  assert.equal(escapeHtml(undefined), '');
  assert.equal(escapeHtml(42), '42');
});

test('stripDiacritics bỏ dấu tiếng Việt', () => {
  assert.equal(stripDiacritics('Đường phố Việt Nam'), 'Duong pho Viet Nam');
  assert.equal(stripDiacritics(null), '');
});

test('searchKey chuẩn hoá chữ thường và khoảng trắng', () => {
  assert.equal(searchKey('  Ôn   TẬP ngắt quãng '), 'on tap ngat quang');
  assert.equal(searchKey(undefined), '');
});

test('formatInt và formatPercent', () => {
  assert.equal(formatInt(1234), '1.234');
  assert.equal(formatInt('không phải số'), '0');
  assert.equal(formatInt(NaN), '0');
  assert.equal(formatPercent(0.256, 1), '25.6%');
  assert.equal(formatPercent(2), '100%');
  assert.equal(formatPercent(-1), '0%');
  assert.equal(formatPercent('x'), '0%');
});

test('truncate và pluralVi', () => {
  assert.equal(truncate('ngắn', 20), 'ngắn');
  assert.equal(truncate('một chuỗi rất dài cần cắt', 10), 'một chuỗi…');
  assert.equal(truncate(null, 3), '');
  assert.equal(pluralVi(1, 'bài', 'bài học'), 'bài');
  assert.equal(pluralVi(2, 'bài', 'bài học'), 'bài học');
});
