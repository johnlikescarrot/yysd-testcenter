import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright-core';
import { lessons } from '../assets/js/ielts-vi-data.mjs';
import { STORAGE_KEY, shiftDay } from '../assets/js/ielts-vi-core.mjs';
import { browserArgs, executablePath } from './browser-runtime.mjs';
import { serveBuild } from './static-server.mjs';

execFileSync('node', ['scripts/build-ielts-pages.mjs'], { stdio: 'inherit' });
const { server, url } = await serveBuild();
const browser = await chromium.launch({ executablePath, args: browserArgs, headless: true });
// Headless shell runs in one process, so scenarios reuse one isolated page.
const page = await browser.newPage();
let checks = 0;

async function check(name, fn) {
  await page.goto(url);
  await page.evaluate(() => localStorage.clear());
  await fn();
  checks += 1;
  console.log(`✓ ${name}`);
}

async function answerQuestion(page, text, expectedCorrect) {
  await page.getByLabel(text, { exact: true }).check();
  await page.locator('#check-answer').click();
  const feedback = await page.locator('#feedback-title').innerText();
  assert.equal(feedback.startsWith('Chính xác!'), expectedCorrect);
  await page.locator('#next-question').click();
}

try {
  await check('homepage, relative assets, responsive widths, and PDF under the Pages subpath', async () => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    assert.equal((await page.goto(url)).status(), 200);
    assert.equal(await page.locator('html').getAttribute('lang'), 'vi');
    assert.match(await page.title(), /IELTS/);
    assert.equal(await page.locator('#xp-count').innerText(), '0');
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `overflow at ${width}px`);
    }
    const pdf = await page.request.get(`${url}docs/ielts/cam-nang-ielts.pdf`);
    assert.equal(pdf.status(), 200);
    assert.match(pdf.headers()['content-type'], /application\/pdf/);
    assert.deepEqual(errors, []);
  });

  await check('answers, feedback, XP, persistence, and next lesson', async () => {
    await page.goto(`${url}study.html?lesson=vocabulary`);
    assert.equal(await page.locator('#check-answer').isDisabled(), true);
    await answerQuestion(page, 'decorate', false);
    for (const question of lessons[0].questions.slice(1)) await answerQuestion(page, question.options[question.answer], true);
    assert.match(await page.locator('#result-summary').innerText(), /3 \/ 4/);
    assert.equal(await page.locator('#result-xp').innerText(), '+25 XP');
    const state = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), STORAGE_KEY);
    assert.equal(state.xp, 25);
    assert.equal(state.lessons.vocabulary, 1);
    assert.equal(Object.keys(state.reviews).length, 4);
    assert.match(await page.locator('#next-lesson').getAttribute('href'), /lesson=reading/);
    await page.goto(url);
    assert.equal(await page.locator('#xp-count').innerText(), '25');
    assert.equal(await page.locator('#streak-count').innerText(), '1');
    assert.equal(await page.locator('#completed-count').innerText(), '1');
    assert.match(await page.locator('[data-lesson-id="vocabulary"] [data-lesson-status]').textContent(), /Đã học 1 lần/);
    assert.match(await page.locator('#continue-link').getAttribute('href'), /lesson=reading/);
    await page.reload();
    assert.equal(await page.locator('#xp-count').innerText(), '25');
  });

  for (const lesson of lessons) {
    await check(`all questions and explanations work: ${lesson.id}`, async () => {
        await page.goto(`${url}study.html?lesson=${lesson.id}`);
      for (const question of lesson.questions) {
        assert.equal(await page.locator('#question-title').innerText(), question.prompt);
        if (question.audio) {
          await page.locator('#show-transcript').click();
          assert.equal(await page.locator('#audio-transcript').innerText(), question.audio);
        }
        await answerQuestion(page, question.options[question.answer], true);
      }
      assert.equal(await page.locator('#result-xp').innerText(), '+30 XP');
      assert.match(await page.locator('#result-summary').innerText(), /4 \/ 4/);
      });
  }

  await check('review empty state and a due review', async () => {
    await page.goto(`${url}study.html?lesson=review`);
    assert.match(await page.locator('#empty-title').innerText(), /Chưa có câu nào/);
    await page.goto(url);
    await page.evaluate(({ key, id }) => {
      const day = new Date();
      const today = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
      localStorage.setItem(key, JSON.stringify({ version: 1, xp: 10, days: [today], lessons: { vocabulary: 1 }, reviews: { [id]: { step: 0, due: today } } }));
    }, { key: STORAGE_KEY, id: lessons[0].questions[0].id });
    await page.reload();
    assert.match(await page.locator('#review-description').innerText(), /1 câu đến hạn/);
    await page.locator('.review-link').click();
    assert.equal(await page.locator('#question-count').innerText(), 'Câu 1 / 1');
    await answerQuestion(page, 'investigate', true);
    const state = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), STORAGE_KEY);
    assert.equal(state.lessons.review, 1);
    assert.equal(state.reviews[lessons[0].questions[0].id].due, shiftDay(state.days[0], 3));
  });

  await check('unknown lesson and explicit reset', async () => {
    await page.goto(`${url}study.html?lesson=not-real`);
    assert.match(await page.locator('#empty-title').innerText(), /Không tìm thấy/);
    await page.goto(url);
    await page.evaluate((key) => localStorage.setItem(key, JSON.stringify({ version: 1, xp: 40, days: [], lessons: {}, reviews: {} })), STORAGE_KEY);
    await page.reload();
    await page.locator('.reset-details summary').click();
    await page.locator('#reset-progress').click();
    assert.equal(await page.locator('#xp-count').innerText(), '0');
    assert.match(await page.locator('#storage-message').innerText(), /Đã xóa/);
    assert.equal(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY), null);
  });

  await check('graceful behavior when storage is blocked', async () => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } });
    });
    await page.goto(url);
    assert.match(await page.locator('#storage-message').innerText(), /không cho phép lưu/);
    await page.goto(`${url}study.html?lesson=reading`);
    for (const question of lessons[1].questions) await answerQuestion(page, question.options[question.answer], true);
    assert.match(await page.locator('#result-storage').innerText(), /Không thể lưu/);
  });

  console.log(`\n${checks} browser scenarios passed.`);
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
