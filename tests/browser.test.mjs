import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright-core';
import { lessons } from '../assets/js/ielts-vi-data.mjs';
import { STORAGE_KEY, shiftDay } from '../assets/js/ielts-vi-core.mjs';
import { browserArgs, executablePath } from './browser-runtime.mjs';
import { serveBuild } from './static-server.mjs';

execFileSync('node', ['scripts/build-ielts-pages.mjs'], { stdio: 'inherit' });
const { server, url } = await serveBuild();
const browser = await chromium.launch({ executablePath, args: browserArgs, headless: true });
// Most scenarios reuse one page; a second tab shares this context when testing storage.
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const measuring = process.argv.includes('--coverage');
const coverageChunks = [];
if (measuring) await page.coverage.startJSCoverage({ resetOnNavigation: false });
let checks = 0;

// Chromium may discard coverage at navigation, so collect it before each hop.
async function checkpoint() {
  if (!measuring) return;
  coverageChunks.push(...await page.coverage.stopJSCoverage());
  await page.coverage.startJSCoverage({ resetOnNavigation: false });
}
async function goto(address) {
  await checkpoint();
  return page.goto(address);
}
async function reload() {
  await checkpoint();
  return page.reload();
}
async function follow(locator) {
  await checkpoint();
  await locator.click();
}

async function check(name, fn) {
  await goto(url);
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
    assert.equal((await goto(url)).status(), 200);
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
    await goto(`${url}study.html?lesson=vocabulary`);
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
    await goto(url);
    assert.equal(await page.locator('#xp-count').innerText(), '25');
    assert.equal(await page.locator('#streak-count').innerText(), '1');
    assert.equal(await page.locator('#completed-count').innerText(), '1');
    assert.match(await page.locator('[data-lesson-id="vocabulary"] [data-lesson-status]').textContent(), /Đã học 1 lần/);
    assert.match(await page.locator('#continue-link').getAttribute('href'), /lesson=reading/);
    await reload();
    assert.equal(await page.locator('#xp-count').innerText(), '25');
  });

  for (const lesson of lessons) {
    await check(`all questions and explanations work: ${lesson.id}`, async () => {
      await goto(`${url}study.html?lesson=${lesson.id}`);
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
    await goto(`${url}study.html?lesson=review`);
    assert.match(await page.locator('#empty-title').innerText(), /Chưa có câu nào/);
    await goto(url);
    await page.evaluate(({ key, id }) => {
      const day = new Date();
      const today = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
      localStorage.setItem(key, JSON.stringify({ version: 1, xp: 10, days: [today], lessons: { vocabulary: 1 }, reviews: { [id]: { step: 0, due: today } } }));
    }, { key: STORAGE_KEY, id: lessons[0].questions[0].id });
    await reload();
    assert.match(await page.locator('#review-description').innerText(), /1 câu đến hạn/);
    await follow(page.locator('.review-link'));
    assert.equal(await page.locator('#question-count').innerText(), 'Câu 1 / 1');
    await answerQuestion(page, 'investigate', true);
    const state = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), STORAGE_KEY);
    assert.equal(state.lessons.review, 1);
    assert.equal(state.reviews[lessons[0].questions[0].id].due, shiftDay(state.days[0], 3));
  });

  await check('continuation recommends due review or practice after all lessons', async () => {
    await page.evaluate(({ key, ids, questionId }) => {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const state = { version: 1, xp: 50, days: [today], lessons: Object.fromEntries(ids.map((id) => [id, 1])), reviews: { [questionId]: { step: 0, due: today } } };
      localStorage.setItem(key, JSON.stringify(state));
    }, { key: STORAGE_KEY, ids: lessons.map((lesson) => lesson.id), questionId: lessons[0].questions[0].id });
    await reload();
    assert.match(await page.locator('#continue-link').getAttribute('href'), /lesson=review/);
    await page.evaluate((key) => {
      const state = JSON.parse(localStorage.getItem(key));
      state.reviews = {};
      localStorage.setItem(key, JSON.stringify(state));
    }, STORAGE_KEY);
    await reload();
    assert.match(await page.locator('#continue-link').getAttribute('href'), /lesson=vocabulary/);
    assert.match(await page.locator('#continue-link').innerText(), /Luyện lại/);
  });

  await check('default lesson and repeated submit are handled safely', async () => {
    await goto(`${url}study.html`);
    assert.equal(await page.locator('#lesson-label').innerText(), lessons[0].label);
    await page.locator('#answer-form').dispatchEvent('submit');
    assert.equal(await page.locator('#answer-feedback').isHidden(), true);
    const first = lessons[0].questions[0];
    await page.getByLabel(first.options[first.answer], { exact: true }).check();
    await page.locator('#check-answer').click();
    await page.locator('#answer-form').dispatchEvent('submit');
    await page.locator('#next-question').click();
    for (const question of lessons[0].questions.slice(1)) await answerQuestion(page, question.options[question.answer], true);
    assert.match(await page.locator('#result-summary').innerText(), /4 \/ 4/);
  });

  await check('listening uses the device speech API and provides a transcript', async () => {
    await goto(`${url}study.html?lesson=listening`);
    await page.evaluate(() => {
      window.testSpeech = [];
      Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: class {
        constructor(text) { this.text = text; }
      } });
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
        cancel() { window.testSpeech.push('cancel'); },
        speak(message) { window.testSpeech.push({ text: message.text, lang: message.lang, rate: message.rate }); }
      } });
    });
    await page.locator('#play-audio').click();
    assert.deepEqual(await page.evaluate(() => window.testSpeech), [
      'cancel', { text: lessons[3].questions[0].audio, lang: 'en-GB', rate: 0.9 }
    ]);
    await page.locator('#show-transcript').click();
    assert.equal(await page.locator('#audio-transcript').innerText(), lessons[3].questions[0].audio);
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
    await answerQuestion(page, lessons[3].questions[0].options[lessons[3].questions[0].answer], true);
    assert.deepEqual((await page.evaluate(() => window.testSpeech)).slice(-2), ['cancel', 'cancel']);
    await page.evaluate(() => { delete window.speechSynthesis; delete window.SpeechSynthesisUtterance; });
    await answerQuestion(page, lessons[3].questions[1].options[lessons[3].questions[1].answer], true);
    assert.equal(await page.locator('#play-audio').isHidden(), true);
    await page.locator('#show-transcript').click();
    assert.equal(await page.locator('#audio-transcript').innerText(), lessons[3].questions[2].audio);
  });

  await check('concurrent lessons preserve progress from another tab', async () => {
    await goto(`${url}study.html?lesson=vocabulary`);
    const other = await page.context().newPage();
    other.on('pageerror', (error) => errors.push(error.message));
    try {
      await other.goto(`${url}study.html?lesson=reading`);
      for (const question of lessons[0].questions) await answerQuestion(page, question.options[question.answer], true);
      for (const question of lessons[1].questions) await answerQuestion(other, question.options[question.answer], true);
      const state = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), STORAGE_KEY);
      assert.equal(state.xp, 60);
      assert.equal(state.lessons.vocabulary, 1);
      assert.equal(state.lessons.reading, 1);
      assert.equal(Object.keys(state.reviews).length, 8);
    } finally {
      await other.close();
    }
  });

  await check('localized existing reading sample grades and retries without estimating a band', async () => {
    await follow(page.locator('.extended-practice'));
    assert.equal(await page.locator('html').getAttribute('lang'), 'vi');
    assert.doesNotMatch(await page.locator('body').innerText(), /[\u3400-\u9fff]/);
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `sample overflow at ${width}px`);
    }
    await page.locator('input[name="q1"][value="TRUE"]').check();
    await page.locator('input[name="q2"][value="TRUE"]').check();
    await page.locator('input[name="q3"][value="NOT GIVEN"]').check();
    await page.locator('input[name="q4"][value="TRUE"]').check();
    await page.locator('input[name="q5"]').fill(' compass ');
    await page.locator('input[name="q6"]').fill('POLARIZED');
    await page.locator('input[name="q7"]').fill('optic');
    await page.locator('#submit').click();
    assert.match(await page.locator('#result').innerText(), /6 \/ 8/);
    assert.match(await page.locator('#result').innerText(), /Không quy đổi sang band/);
    assert.equal(await page.locator('.answer-status').count(), 8);
    assert.equal(await page.locator('.right').count(), 6);
    assert.equal(await page.locator('.wrong').count(), 2);
    assert.equal(await page.locator('input[name="q1"][value="TRUE"]').isDisabled(), true);
    assert.equal(await page.locator('input[name="q1"][value="TRUE"]').locator('..').evaluate((element) => element.classList.contains('is-incorrect-answer')), true);
    assert.equal(await page.locator('input[name="q1"][value="FALSE"]').locator('..').evaluate((element) => element.classList.contains('is-correct-answer')), true);
    await follow(page.locator('#retry'));
    assert.equal(await page.locator('#submit').isVisible(), true);
    assert.equal(await page.locator('input[name="q5"]').inputValue(), '');
    await follow(page.locator('.sample-header a'));
    assert.match(page.url(), /index\.html#lo-trinh$/);
  });

  await check('reading sample reports a raw score to the existing same-origin viewer', async () => {
    await page.evaluate(() => {
      window.addEventListener('message', (event) => {
        if (event.origin === window.location.origin && event.data.type === 'yysd:score') window.sampleScore = event.data;
      });
      const frame = document.createElement('iframe');
      frame.id = 'sample-frame';
      frame.src = 'library/practice/ielts/sample-academic-reading-1.html';
      document.body.append(frame);
    });
    const sample = page.frameLocator('#sample-frame');
    await sample.locator('input[name="q1"][value="FALSE"]').check();
    await sample.locator('#submit').click();
    await page.waitForFunction(() => window.sampleScore);
    assert.deepEqual(await page.evaluate(() => window.sampleScore), { type: 'yysd:score', score: 1, total: 8 });
  });

  await check('keyboard selection and feedback', async () => {
    await goto(`${url}study.html?lesson=writing`);
    const first = page.locator('input[name="answer"]').first();
    await first.focus();
    await page.keyboard.press('Space');
    assert.equal(await first.isChecked(), true);
    await page.keyboard.press('ArrowDown');
    assert.equal(await page.locator('input[name="answer"]:checked').count(), 1);
    await page.locator('#check-answer').click();
    assert.equal(await page.locator('#answer-feedback').isVisible(), true);
    assert.equal(await page.locator('#next-question').evaluate((element) => element === document.activeElement), true);
  });

  await check('unknown lesson and explicit reset', async () => {
    await goto(`${url}study.html?lesson=not-real`);
    assert.match(await page.locator('#empty-title').innerText(), /Không tìm thấy/);
    await goto(url);
    await page.evaluate((key) => localStorage.setItem(key, JSON.stringify({ version: 1, xp: 40, days: [], lessons: {}, reviews: {} })), STORAGE_KEY);
    await reload();
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
    await goto(url);
    assert.match(await page.locator('#storage-message').innerText(), /không cho phép lưu/);
    await page.locator('.reset-details summary').click();
    await page.locator('#reset-progress').click();
    assert.match(await page.locator('#storage-message').innerText(), /Không thể xóa/);
    await goto(`${url}study.html?lesson=reading`);
    for (const question of lessons[1].questions) await answerQuestion(page, question.options[question.answer], true);
    assert.match(await page.locator('#result-storage').innerText(), /Không thể lưu/);
  });

  assert.deepEqual(errors, [], 'unexpected browser exceptions');
  console.log(`\n${checks} browser scenarios passed.`);
} finally {
  if (measuring) {
    coverageChunks.push(...await page.coverage.stopJSCoverage());
    await mkdir('coverage', { recursive: true });
    await writeFile('coverage/browser-v8.json', JSON.stringify(coverageChunks));
  }
  await browser.close();
  await new Promise((done) => server.close(done));
}
