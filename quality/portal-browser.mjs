// Exercise the original landing page and its handoff to practice. Chromium
// receives only repo files and a guest bootstrap fixture, never live accounts.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { withChrome } from './test-site.mjs';

const base = 'https://portal.example.test/course/';
const root = new URL('../', import.meta.url);
const mime = { '.svg': 'image/svg+xml', '.js': 'application/javascript', '.html': 'text/html; charset=utf-8', '.css': 'text/css' };
await withChrome(async (browser) => {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setRequestInterception(true);
  page.on('request', async (request) => {
    const url = new URL(request.url());
    if (url.pathname.startsWith('/api/')) {
      const body = url.pathname === '/api/tenant/bootstrap' ? { org: { slug: 'yysd', name: 'Trung tâm YYSD', usable: true } } : {};
      await request.respond({ contentType: 'application/json', headers: {
        'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'X-Tenant-Slug, Content-Type',
      }, body: JSON.stringify(body) });
      return;
    }
    if (!url.href.startsWith(base)) { await request.respond({ status: 204 }); return; }
    let file = url.pathname.slice(new URL(base).pathname.length);
    if (file === 'ielts-vi/') file += 'index.html';
    const allowed = /^(?:index\.html|assets\/(?:js|css|img)\/[\w.-]+|ielts-vi\/(?:index\.html|assets\/[\w.-]+))$/;
    if (!allowed.test(file)) { await request.respond({ status: 404 }); return; }
    try {
      await request.respond({ contentType: mime[extname(file)], body: await readFile(new URL(file, root)) });
    } catch { await request.respond({ status: 404 }); }
  });

  for (const width of [375, 1440]) {
    await page.setViewport({ width, height: 900 });
    await page.goto(`${base}index.html`, { waitUntil: 'networkidle0' });
    assert.equal(await page.$eval('html', (el) => el.lang), 'vi');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Portal overflows at ${width}px`);
    if (width === 375) {
      await page.click('.nav-menu-btn');
      await page.waitForSelector('.nav-drawer.is-open');
      assert.equal(await page.evaluate(() => document.activeElement.className), 'nav-drawer__close');
      assert.ok(await page.$('.nav-drawer a[href="ielts-vi/"]'));
      await page.keyboard.down('Shift');
      await page.keyboard.press('Tab');
      await page.keyboard.up('Shift');
      assert.ok(await page.evaluate(() => document.activeElement.closest('.nav-drawer') !== null));
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => document.querySelector('.nav-drawer').hidden && document.activeElement.matches('.nav-menu-btn'));
    }
  }
  await page.evaluate(() => { window.decision = window.YYSD_ASK('Bạn muốn rời bài luyện?'); });
  await page.waitForSelector('dialog[open]');
  await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(() => window.decision), false);
  await page.evaluate(() => { window.decision = window.YYSD_ASK('Bạn muốn tiếp tục?'); });
  await page.click('dialog button[value="yes"]');
  assert.equal(await page.evaluate(() => window.decision), true);
  await page.click('.ha-cta a[href="ielts-vi/"]');
  await page.waitForSelector('#continue-lesson:not([hidden])');
  assert.match(page.url(), /\/course\/ielts-vi\/$/);
  assert.deepEqual(errors, []);
  console.log('Portal: Vietnamese landing, drawer, keyboard decisions, and guest lesson link passed.');
});
