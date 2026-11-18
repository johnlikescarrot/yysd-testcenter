// Exercise the actual hub, account shell and standalone papers without live tenants,
// SMS, cloud scores or a multi-gigabyte checkout. No browser request leaves this fixture.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { withChrome } from './test-site.mjs';

const base = 'https://centre.invalid/site/';
const repo = new URL('../', import.meta.url);
const types = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.pdf': 'application/pdf', '.mp3': 'audio/mpeg' };
const noHan = (text) => assert.doesNotMatch(text, /\p{Script=Han}/u);
const titleOf = (page, selector) => page.$eval(selector, (el) => el.textContent);

await withChrome(async (browser) => {
  const page = await browser.newPage();
  const errors = [];
  page.setDefaultTimeout(8000);
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('dialog', (dialog) => dialog.accept());
  await page.setRequestInterception(true);
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  page.on('request', async (req) => {
    const url = new URL(req.url());
    if (url.hostname === 'api.youyisida.com') {
      const headers = { 'Access-Control-Allow-Origin': new URL(base).origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS', 'Access-Control-Allow-Headers': '*' };
      if (req.method() === 'OPTIONS') return req.respond({ status: 204, headers });
      const slug = req.headers()['x-tenant-slug'] || 'yysd';
      const data = url.pathname === '/api/tenant/bootstrap' ? { org: { usable: true, slug,
        name: slug === 'yysd' ? '优益思达国际课程中心' : 'Trường mẫu' } }
        : url.pathname === '/api/auth/login' ? { error: '手机号或密码错误' }
          : url.pathname === '/api/auth/me' ? { user: { role: 'student', displayName: 'Học viên mẫu' } } : {};
      return req.respond({ status: data.error ? 400 : 200, contentType: 'application/json', headers, body: JSON.stringify(data) });
    }
    if (!req.url().startsWith(base)) return req.respond({ status: 204 });
    const file = url.pathname.slice(new URL(base).pathname.length);
    try {
      const mime = types[extname(file)];
      if (!mime || !/^[\w./-]+$/.test(file) || file.includes('..')) throw Error('Not a fixture');
      const bytes = await readFile(new URL(file, repo));
      return req.respond({ status: 200, contentType: mime, body: bytes });
    } catch {
      if (/\.(js|css|json|html)$/.test(file)) errors.push(`Missing local asset: ${file}`);
      return req.respond({ status: 404 });
    }
  });
  const go = (path) => page.goto(base + path);
  for (const width of [360, 1440]) {
    await page.setViewport({ width, height: 800 });
    await go('index.html');
    await page.waitForSelector('.reme-topbar');
    assert.equal(await titleOf(page, '.ha-hero a[href="ielts-vi/"]'), 'Bắt đầu lộ trình IELTS');
    if (width === 360) {
      await page.click('.nav-menu-btn');
      await page.waitForSelector('.nav-drawer:not([hidden])');
      noHan(await titleOf(page, '.nav-drawer'));
      await page.keyboard.press('Escape');
    }
    await page.waitForFunction(() => document.querySelector('.minimal-brand b')?.textContent.includes('YYSD'));
    noHan(await titleOf(page, '.minimal-brand'));
  }
  await go('login.html');
  await page.type('#phone', '13800000000');
  await page.type('#password', 'fixture');
  await page.click('#login-form button[type="submit"]');
  await page.waitForFunction(() => document.querySelector('#msg').textContent.includes('mật khẩu không đúng'));
  await go('register.html?tenant=school');
  await page.waitForSelector('html.tenant-brand-ready');
  assert.equal(await titleOf(page, '.minimal-brand b'), 'Trường mẫu');
  assert.equal(await page.$eval('#reg-key', (el) => el.required), true);
  assert.equal(await page.$eval('#code-field', (el) => el.hidden), true);
  // Seed an offline learner session; no credentials or requests to a real service.
  await page.evaluate(() => localStorage.setItem('yysd:auth:token', 'offline-fixture'));
  await go('zone.html?zone=mock');
  await page.waitForSelector('.ielts-hub a[href="ielts-vi/"]');
  noHan(await titleOf(page, '.ielts-hub'));
  for (const n of [1, 2, 3]) {
    const path = `exam.html?id=placement-test-${n}`;
    assert.ok(await page.$(`.ielts-hub a[href="${path}"]`));
  }
  await go('cambridge.html?vol=20&skill=reading');
  await page.waitForSelector('.test-tab');
  assert.equal(await page.$$eval('.test-tab', (els) => els.length), 4);
  assert.match(await page.$eval('.test-tab', (el) => el.href), /id=cambridge-20-test-1-reading&cdt=1$/);
  noHan(await titleOf(page, '#content'));
  await go('exam.html?id=cambridge-20-test-1-reading&tenant=school');
  await page.waitForSelector('#exam-frame');
  const frame = await (await page.$('#exam-frame')).contentFrame();
  await frame.waitForFunction(() => document.querySelector('.brandtag')?.textContent === 'Trường mẫu');
  await frame.click('.paper-card');
  await frame.click('.practice .mode-start');
  await frame.click('input[name="Q1"][value="FALSE"]');
  await frame.click('.submit-btn');
  await frame.waitForSelector('#resultArea', { visible: true });
  assert.equal(await titleOf(frame, '#resCorrect'), '1/40');
  assert.equal(await frame.$eval('.ritem.wrong', (el) => el.dataset.qno), '2');
  await go('library/mock/cambridge-listening/cambridge-20-test-1.html');
  await page.click('.paper-card.listen');
  await page.click('.practice .mode-start');
  assert.match(await titleOf(page, '#testModeTag'), /Luyện tập/);
  assert.equal(await page.evaluate(() => document.querySelectorAll('#questionsHolder .section-banner').length), 4);
  await page.type('#L1', 'fish');
  await page.click('.submit-btn');
  await page.waitForSelector('#resultArea', { visible: true });
  assert.equal(await titleOf(page, '#resCorrect'), '1/40');
  noHan(await titleOf(page, '#detailHolder'));
  await go('library/mock/cambridge-writing/cambridge-20-test-1-writing.html');
  await page.click('[onclick="startTest()"]');
  await page.type('#t1', 'An English draft.');
  await page.click('.submit-btn');
  assert.equal(await titleOf(page, '#r1'), '3');
  assert.equal(await titleOf(page, '#dump1'), 'An English draft.');
  await page.reload();
  assert.equal(await page.$eval('#t1', (el) => el.value), 'An English draft.');
  await go('cdt-report.html?suite=cambridge-20-test-1');
  assert.match(await titleOf(page, '#rpt-title'), /Cambridge IELTS 20 · Test 1/);
  assert.match(await page.$eval('#rpt-back', (el) => el.href), /cambridge.html\?vol=20$/);
  for (const n of [1, 2, 3]) {
    await go(`library/mock/ielts/placement-test-${n}.html`);
    await page.type('#L_Q1', n === 1 ? 'Thursday' : '');
    await page.click('#testArea .submit-btn');
    await page.waitForSelector('#resultsArea', { visible: true });
    assert.match(await titleOf(page, '#scoreText'), new RegExp(`${n === 1 ? 1 : 0} / 36$`));
    assert.match(await titleOf(page, '#finalBand'), /Chờ tự đánh giá/);
    noHan(await titleOf(page, '#resultsArea'));
    await page.click('#w_confirm');
    await page.click('#s_confirm');
    assert.match(await titleOf(page, '#finalBand'), /^\d\.\d$/);
  }
  await go('alevel-view.html?id=caie-9231-2025-w-11-qp');
  await page.waitForSelector('#view-shell:not([hidden])');
  assert.match(await page.$eval('#btn-download', (el) => el.href), /9231_w25_qp_11\.pdf$/);
  assert.ok(await page.$('a[download][href="ielts-vi/resources/tu-de-den-loi-giai.pdf"]'));
  noHan(await titleOf(page, '#view-title'));
  await go('app/free.html?skill=reading');
  await page.waitForSelector('[data-free-list] .hit-set-row');
  await page.type('[name="query"]', 'khoa hoc tu nhien');
  await page.waitForFunction(() => document.querySelector('[data-free-list] .hit-set-row h4')?.textContent === 'Khoa học tự nhiên');
  assert.match(await titleOf(page, '[data-free-list] .hit-set-row'), /Độ khó: (Dễ|Trung bình|Khó)/);
  noHan(await titleOf(page, 'main'));
  await page.select('[name="status"]', 'done');
  await page.waitForSelector('.hit-empty');
  assert.match(await titleOf(page, '.hit-empty'), /Không có bài luyện phù hợp/);
  assert.deepEqual(errors, []);
  console.log('Passed: hub and tenant accounts, Cambridge L/R/W, three placement tests, PDF reader, and Vietnamese TOEFL search and filters.');
});
