import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { guides } from './materials.mjs';
import { withChrome, withSite } from './test-site.mjs';

const reports = new URL('./reports/', import.meta.url);
await mkdir(reports, { recursive: true });
await withSite((url) => withChrome(async (browser) => {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('request', (request) => {
    if (!request.url().startsWith(url) && !request.url().startsWith('data:')) errors.push(`Offsite request: ${request.url()}`);
  });
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`${response.status()}: ${response.url()}`);
  });
  for (const [name, width, height] of [['mobile', 360, 800], ['desktop', 1440, 900]]) {
    await page.setViewport({ width, height, isMobile: name === 'mobile', hasTouch: name === 'mobile' });
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.waitForSelector('.lesson.suggested');
    assert.equal(await page.$eval('html', (el) => el.lang), 'vi');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name} overflows horizontally`);
    await page.screenshot({ path: fileURLToPath(new URL(`${name}.png`, reports)) });
  }
  await page.focus('#continue-lesson');
  await page.keyboard.press('Enter');
  await page.waitForSelector('dialog[open]');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'question-prompt');
  const duration = await page.$eval('audio', (el) => new Promise((resolve, reject) => {
    el.onloadedmetadata = () => resolve(el.duration);
    el.onerror = () => reject(new Error('Unable to decode lesson audio'));
    el.load();
  }));
  assert.ok(duration >= 15 && duration < 40);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('dialog').open
    && document.activeElement.id === 'continue-lesson');
  await page.click('#continue-lesson');
  const submit = () => page.click('#session-action');
  await page.click('.option input[value="0"]'); // Wrong: enters the review queue.
  await submit();
  assert.match(await page.$eval('#feedback', (el) => el.textContent), /Chưa đúng/);
  await submit();
  await page.click('.option input[value="0"]');
  await submit();
  await submit();
  await page.type('.response-label input', 'notebook');
  await submit();
  await submit();
  assert.match(await page.$eval('#question-host', (el) => el.textContent), /2 \/ 3/);
  await submit();
  await page.reload({ waitUntil: 'networkidle0' });
  assert.match(await page.$eval('#xp-summary', (el) => el.textContent), /^14 /);
  await page.click('#begin-review');
  await page.click('.option input[value="1"]');
  await submit();
  await submit();
  await submit();
  assert.equal(await page.$eval('#begin-review', (el) => el.disabled), true);
  await page.waitForFunction(() => !document.querySelector('dialog').open
    && document.activeElement.id === 'continue-lesson');

  for (const { slug } of guides) {
    const pdf = await fetch(new URL(`resources/${slug}.pdf`, url));
    assert.equal(pdf.headers.get('content-type'), 'application/pdf');
    assert.match(await pdf.text(), /^%PDF-/);
    await page.goto(new URL(`resources/${slug}.html`, url).href);
    assert.equal(await page.$eval('html', (el) => el.lang), 'vi');
    assert.ok(await page.$eval('.references li:last-child', (el) => el.id));
  }
  assert.deepEqual(errors, []);
  console.log('Chromium: mobile/desktop, keyboard, audio, lesson, saved progress, review, and handbooks passed.');
}));
