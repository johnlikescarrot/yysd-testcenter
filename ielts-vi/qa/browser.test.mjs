import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { lessons } from '../lessons.js';
import { storageKey } from '../learning.js';
import { openBrowser } from './chrome.mjs';
import { build, projectPath, publicFiles, root, serve } from './site.mjs';

let browser;
let server;
let captureCount = 0;
before(async () => {
  server = await serve(await build());
  browser = await openBrowser();
});
after(async () => {
  await browser?.close();
  await server?.close();
});

async function setup(t, options = {}) {
  const page = await browser.newPage(options);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.coverage.startJSCoverage({ resetOnNavigation: false });
  const capture = async () => {
    const entries = await page.coverage.stopJSCoverage();
    const directory = process.env.NODE_V8_COVERAGE;
    if (directory) {
      // Hợp nhất độ bao phủ V8 thật của Chromium với các bài kiểm thử Node.
      const result = entries.flatMap(entry => {
        const path = new URL(entry.url).pathname.slice(projectPath.length);
        return publicFiles.includes(path) && path.endsWith('.js')
          ? [{ scriptId: entry.scriptId, url: pathToFileURL(join(root, path)).href, functions: entry.functions }] : [];
      });
      await writeFile(join(directory, `coverage-browser-${process.pid}-${++captureCount}.json`), JSON.stringify({ result }));
    }
  };
  t.after(async () => {
    await capture();
    await page.close();
    assert.deepEqual(errors, []);
  });
  return { page, capture };
}

const date = day => new Date(`2026-11-${day}T09:00:00+07:00`);
const check = page => page.locator('#check-answer').click();
const next = page => page.locator('#advance').click();
const pick = (page, index) => page.locator('#answer-form input[type=radio]').nth(index).check();
const closeResult = page => page.locator('#result-close').click();
const content = (page, id) => page.locator(`#${id}`).innerText();
const nav = (page, id) => page.locator(`nav a[data-nav=${id}]`).click();
const draft = 'Longer opening hours would help many people study and use the internet after they finish work.';

async function answer(page, question) {
  if (question.kind === 'choice') await pick(page, question.options.indexOf(question.answers[0]));
  if (question.kind === 'gap') await page.locator('#answer').fill(question.answers[0]);
  if (question.kind === 'write') await page.locator('#answer').fill(draft);
  await check(page);
  await next(page);
}

async function doLesson(page, lesson) {
  await page.locator(`[data-lesson=${lesson.id}]`).click();
  for (const question of lesson.questions) await answer(page, question);
  await closeResult(page);
}

test('học bốn kỹ năng, kiểm tra lỗi và mẫu, ôn theo hạn, mở khóa và lưu tiến độ', { timeout: 60_000 }, async t => {
  const { page, capture } = await setup(t, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, timezoneId: 'Asia/Ho_Chi_Minh' });
  await page.clock.install({ time: date(18) });
  await page.goto(server.url);
  assert.equal(await page.locator('html').getAttribute('lang'), 'vi');
  assert.equal(await page.locator('.lesson').count(), 12);
  assert.equal(await page.locator('.lesson:disabled').count(), 11);
  await page.locator('.unit-head').first().click();
  await nav(page, 'on-tap');
  assert.equal(await content(page, 'review-heading'), 'Chưa có câu đến hạn');
  await page.locator('#review-path').click();
  await page.locator('#start').click();
  await page.locator('#exercise summary').click();
  assert.match(await page.locator('#exercise details p').innerText(), /north entrance/);
  const audio = page.locator('#exercise audio');
  assert.equal(await audio.getAttribute('preload'), 'none');
  const started = await audio.evaluate(async element => {
    await element.play();
    const seconds = element.duration;
    element.pause();
    return seconds;
  });
  assert.ok(started > 10);
  await check(page);
  assert.match(await content(page, 'validation'), /Chọn một đáp án/);
  await pick(page, 0);
  await check(page);
  assert.match(await content(page, 'feedback'), /Chưa đúng.*north entrance/s);
  await next(page);
  await check(page);
  assert.match(await content(page, 'validation'), /Nhập đáp án/);
  await page.locator('#answer').fill(' 10.15 ');
  await check(page);
  assert.match(await content(page, 'feedback'), /Chính xác/);
  await next(page);
  await answer(page, lessons[0].questions[2]);
  assert.match(await page.locator('.result').innerText(), /2 \/ 3.*\+20 XP/);
  await closeResult(page);
  assert.equal(await content(page, 'streak'), '1 ngày');
  assert.equal(await content(page, 'goal-percent'), '100%');
  assert.equal(await content(page, 'badge-first'), 'Đã đạt');
  assert.equal(await page.locator('[data-lesson=garden]').isEnabled(), true);

  await nav(page, 'on-tap');
  assert.equal(await content(page, 'nav-due'), '1');
  // Nếu ngày hệ thống thay đổi, không mở một phiên dựa trên số liệu cũ.
  await page.clock.setSystemTime(date(17));
  await page.locator('#start-review').click();
  assert.equal(await page.locator('#session').isVisible(), false);
  await page.clock.setSystemTime(date(18));
  await nav(page, 'lo-trinh');
  await doLesson(page, lessons[1]);
  await nav(page, 'on-tap');
  await page.locator('#start-review').click();
  await pick(page, 0);
  await check(page);
  await next(page);
  assert.match(await page.locator('.result').innerText(), /không cộng điểm mới/);
  await closeResult(page);
  await page.locator('#start-review').click();
  await answer(page, lessons[0].questions[0]);
  assert.match(await page.locator('.result').innerText(), /\+5 XP/);
  await closeResult(page);
  assert.equal(await content(page, 'review-heading'), 'Chưa có câu đến hạn');

  await nav(page, 'tien-do');
  await page.locator('#goal').selectOption('60');
  assert.equal(await content(page, 'goal-value'), '45 / 60 XP');
  await page.locator('.skip').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#tien-do').isVisible(), true);
  await nav(page, 'lo-trinh');
  await page.locator('#start').click();
  await answer(page, lessons[2].questions[0]);
  await check(page);
  assert.match(await content(page, 'validation'), /15 từ/);
  await page.locator('#answer').fill(draft);
  assert.match(await content(page, 'words'), /^16 \/ 15/);
  await check(page);
  assert.match(await content(page, 'feedback'), /Đối chiếu với mẫu/);
  await next(page);
  await answer(page, lessons[2].questions[2]);
  assert.match(await page.locator('.result').innerText(), /2 \/ 2/);
  await closeResult(page);

  await page.clock.setSystemTime(date(19));
  await page.locator('[data-lesson=routine]').click();
  await answer(page, lessons[3].questions[0]);
  const timer = page.locator('#timer-start');
  await timer.click();
  await page.clock.runFor(1_000);
  assert.match(await content(page, 'timer-status'), /59 giây/);
  await page.clock.fastForward(60_000);
  assert.match(await content(page, 'timer-status'), /Hết giờ/);
  await timer.click();
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#session').isVisible(), false);
  assert.equal(await page.locator('[data-lesson=routine]').getAttribute('data-state'), 'ready');
  await doLesson(page, lessons[3]);

  await page.clock.setSystemTime(date(20));
  for (const lesson of lessons.slice(4)) await doLesson(page, lesson);
  assert.equal(await content(page, 'badge-xp'), 'Đã đạt');
  assert.equal(await content(page, 'badge-streak'), 'Đã đạt');
  await page.locator('#start').click();
  assert.equal(new URL(page.url()).hash, '#on-tap');
  await capture();
  await page.coverage.startJSCoverage({ resetOnNavigation: false });
  await page.reload();
  assert.equal(await page.locator('#on-tap').isVisible(), true);
  await nav(page, 'tien-do');
  assert.equal(await content(page, 'completed'), '12 / 12');
  assert.equal(await page.locator('#week li').count(), 7);
  assert.equal(await page.locator('#goal').inputValue(), '60');
  await page.locator('#reset').click();
  await page.getByRole('button', { name: 'Giữ tiến độ' }).click();
  assert.equal(await content(page, 'completed'), '12 / 12');
  await page.locator('#reset').click();
  await page.locator('#confirm-delete').click();
  assert.equal(await content(page, 'completed'), '0 / 12');
  assert.equal(await content(page, 'xp'), '0 XP');
  assert.deepEqual(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).activity, storageKey), {});
  await page.locator('.brand').click();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 390);
});

test('trình duyệt chặn lưu: bài học vẫn hoạt động và có thông báo', async t => {
  const { page } = await setup(t);
  await page.addInitScript(() => {
    Storage.prototype.getItem = Storage.prototype.setItem = () => { throw new DOMException('Unavailable', 'SecurityError'); };
  });
  await page.goto(`${server.url}#khong-ton-tai`);
  assert.match(await content(page, 'storage-notice'), /Không thể lưu/);
  await page.locator('#start').click();
  await page.locator('#exit').click();
  await doLesson(page, lessons[0]);
  assert.equal(await content(page, 'xp'), '20 XP');
  assert.equal(await page.locator('#storage-notice').isVisible(), true);
});

test('bản tĩnh chỉ có nội dung IELTS tiếng Việt và các tài liệu liên kết đúng', async t => {
  const { page } = await setup(t);
  const unsupported = /[\p{Letter}&&[^\p{Script=Latin}]]/v;
  for (const file of publicFiles.filter(file => /\.(js|html|css|svg)$/u.test(file))) {
    const source = await readFile(join(root, file), 'utf8');
    assert.doesNotMatch(source, unsupported, file);
  }
  await page.goto(`${server.url}tai-lieu.html`);
  assert.equal(await page.locator('html').getAttribute('lang'), 'vi');
  for (const [article, count] of [['cam-nang', 6], ['so-tay', 7]]) {
    const find = page.locator(`#${article} .references li`);
    const references = await find.evaluateAll(entries => entries
      .map(li => ({ doi: li.querySelector('a[href^="https://doi.org/"]')?.href, query: li.querySelector('a[href^="https://scholar.google.com/"]')?.href }))
      .filter(item => item.doi));
    assert.equal(references.length, count);
    assert.equal(new Set(references.map(item => item.doi)).size, count);
    for (const item of references) assert.equal(new URL(item.query).searchParams.get('q'), new URL(item.doi).pathname.slice(1));
  }
  const links = await page.locator('a[download]').evaluateAll(items => items.map(node => node.href));
  assert.equal(links.length, 2);
  for (const href of links) {
    const response = await page.request.get(href);
    assert.equal(response.headers()['content-type'], 'application/pdf');
    assert.equal((await response.body()).subarray(0, 4).toString(), '%PDF');
  }
  assert.equal((await page.request.get(`${server.url}server/server.js`)).status(), 404);
  assert.equal((await page.request.get(`${server.url}package.json`)).status(), 404);
  await page.getByRole('link', { name: 'Về lộ trình' }).click();
  assert.equal(await page.locator('h1').filter({ hasText: 'Lộ trình của bạn' }).isVisible(), true);
});
