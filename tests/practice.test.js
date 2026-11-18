const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync('vi/index.html', 'utf8');
const core = fs.readFileSync('vi/core.js', 'utf8');
const practice = fs.readFileSync('vi/practice.js', 'utf8');
function page() {
  const dom = new JSDOM(html, { url: 'https://example.org/vi/', runScripts: 'outside-only' });
  dom.window.eval(core); dom.window.eval(practice);
  return dom;
}
test('lesson gives feedback, completes and persists progress', () => {
  const dom = page(); const doc = dom.window.document;
  for (let i = 0; i < 6; i++) {
    doc.querySelector('.answer').click();
    assert.notEqual(doc.querySelector('#feedback').textContent, '');
    assert.equal(doc.querySelectorAll('.answer:disabled').length, 3);
    doc.querySelector('#next').click();
  }
  assert.match(doc.querySelector('#question').textContent, /6 câu/);
  assert.equal(doc.querySelector('#progress').getAttribute('aria-valuenow'), '6');
  assert.equal(doc.querySelector('#streak').textContent, '1');
  assert.ok(JSON.parse(dom.window.localStorage.getItem('yysd-ielts-vi-progress-v1')).xp > 0);
  doc.querySelector('#answers button').click();
  assert.equal(doc.querySelector('#step').textContent, 'Câu 1 / 6');
  dom.window.close();
});
test('unavailable storage does not prevent practice', () => {
  const dom = new JSDOM(html, { url: 'https://example.org/vi/', runScripts: 'outside-only' });
  Object.defineProperty(dom.window, 'localStorage', { get() { throw new Error('blocked'); } });
  dom.window.eval(core); dom.window.eval(practice);
  assert.match(dom.window.document.querySelector('#storage-note').textContent, /Không thể lưu/);
  dom.window.document.querySelector('.answer').click();
  assert.notEqual(dom.window.document.querySelector('#feedback').textContent, '');
  dom.window.close();
});
