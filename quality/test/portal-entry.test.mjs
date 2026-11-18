import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { setImmediate } from 'node:timers/promises';
import { runInContext } from 'node:vm';
import { JSDOM } from 'jsdom';

const portal = new URL('https://example.test/yysd-testcenter/');
const app = new URL('ielts-vi/', portal).href;
const file = (path) => readFile(new URL(`../../${path}`, import.meta.url), 'utf8');
const [homeHtml, zoneHtml, nav, config, zone] = await Promise.all(
  ['index.html', 'zone.html', 'assets/js/nav.js', 'assets/js/config.js', 'assets/js/zone.js'].map(file),
);
const link = 'a[href="ielts-vi/"]';

function checkEntry(root) {
  const entry = root.querySelector(link);
  assert.ok(entry);
  assert.equal(entry.href, app);
  assert.equal(entry.lang, 'vi');
  assert.match(entry.textContent, /^Luyện IELTS bằng tiếng Việt/);
}

test('the portal homepage and both IELTS menus link to the Vietnamese edition', (t) => {
  const dom = new JSDOM(homeHtml, { url: new URL('index.html', portal), runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  const { document } = dom.window;
  dom.window.matchMedia = () => ({ matches: true });
  checkEntry(document.querySelector('main'));
  runInContext(nav, dom.getInternalVMContext());

  const desktop = document.getElementById('nav-mega');
  assert.equal(desktop.getAttribute('aria-hidden'), 'true');
  const trigger = document.querySelector('#nav [data-key="ielts"]');
  trigger.dispatchEvent(new dom.window.MouseEvent('mouseenter'));
  assert.equal(desktop.getAttribute('aria-hidden'), 'false');
  checkEntry(desktop);
  assert.ok(desktop.querySelector('a[href="zone.html?zone=mock&s=mock"]'));

  const mobile = document.querySelector('.nav-drawer');
  assert.equal(mobile.hidden, true);
  document.querySelector('.nav-menu-btn').click();
  assert.equal(mobile.hidden, false);
  checkEntry(mobile);
  assert.ok(mobile.querySelector('a[href="speaking.html"]'));
});

test('the legacy IELTS hub offers Vietnamese practice without replacing Cambridge routes', async (t) => {
  const dom = new JSDOM(zoneHtml, {
    url: new URL('zone.html?zone=mock&s=ielts', portal), runScripts: 'outside-only',
  });
  t.after(() => dom.window.close());
  // Exercise the real hub renderer with one manifest entry and no authenticated services.
  const items = [{ zone: 'mock', subject: 'cambridge-reading', title: '剑桥雅思15 · Test 1（阅读）' }];
  dom.window.fetch = async () => ({ ok: true, json: async () => ({ items }) });
  runInContext(config, dom.getInternalVMContext());
  runInContext(zone, dom.getInternalVMContext());
  await setImmediate();
  const hub = dom.window.document.querySelector('.ielts-hub');
  assert.ok(hub);
  checkEntry(hub);
  assert.ok(hub.querySelector('a[href="speaking.html"]'));
  assert.ok(hub.querySelector('a[href="zone.html?zone=mock&s=reading"]'));
  assert.equal(new URL(dom.window.location.href).searchParams.get('zone'), 'mock');
});
