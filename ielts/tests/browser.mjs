import assert from 'node:assert/strict';
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { after, before, test } from 'node:test';
import { openBrowser } from '../scripts/chrome.mjs';
import { output, serve } from '../scripts/serve.mjs';
import { lessons } from '../site/catalog.mjs';
import { lessonLink } from '../site/ui/html.mjs';
import guides from '../content/guides.json' with { type: 'json' };

const prefix = '/yysd-testcenter/';
let app;
let browser;

before(async () => {
  app = await serve({ prefix });
  browser = await openBrowser();
});

after(async () => {
  await browser?.close();
  app?.server.close();
});

async function tab(t, options) {
  const page = await browser.newPage(options);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  t.after(async () => {
    await page.close();
    assert.deepEqual(errors, []);
  });
  return page;
}

test('di động: làm bài Nghe, ôn câu sai và lưu mục tiêu qua tải lại', async (t) => {
  const page = await tab(t, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'vi-VN', timezoneId: 'Asia/Ho_Chi_Minh' });
  const initial = await page.goto(app.url);
  assert.equal(initial.status(), 200);
  assert.equal(await page.locator('html').getAttribute('lang'), 'vi');
  assert.equal(await page.locator('.lesson-row').count(), 8);
  await page.getByRole('link', { name: 'Bắt đầu luyện' }).click();
  await page.getByRole('button', { name: 'Kiểm tra' }).waitFor();
  await page.locator('summary').click();
  assert.equal(await page.locator('details').getAttribute('open'), '');
  const audioSource = await page.locator('audio source').getAttribute('src');
  const media = await page.request.get(new URL(audioSource, app.url).href, { headers: { Range: 'bytes=0-31' } });
  assert.equal(media.status(), 206);
  assert.match(media.headers()['content-type'], /audio\/mpeg/);
  assert.equal((await media.body()).length, 32);
  await page.locator('audio').evaluate((audio) => audio.load());
  await page.waitForFunction(() => document.querySelector('audio')?.duration > 10);
  await page.getByRole('radio', { name: '2:00 p.m.' }).check();
  await page.getByRole('button', { name: 'Kiểm tra' }).click();
  await page.getByRole('heading', { name: 'Chưa chính xác' }).waitFor();
  await page.getByRole('button', { name: 'Câu tiếp theo' }).click();
  await page.getByRole('textbox', { name: 'Câu trả lời bằng tiếng Anh' }).fill('WEST');
  await page.getByRole('button', { name: 'Kiểm tra' }).click();
  await page.getByRole('button', { name: 'Câu tiếp theo' }).click();
  await page.getByRole('radio', { name: 'A student card' }).check();
  await page.getByRole('button', { name: 'Kiểm tra' }).click();
  await page.getByRole('button', { name: 'Câu tiếp theo' }).click();
  await page.getByRole('radio', { name: 'Beside the lift on the second floor' }).check();
  await page.getByRole('button', { name: 'Kiểm tra' }).click();
  await page.getByRole('button', { name: 'Hoàn thành', exact: true }).click();
  await page.getByRole('heading', { name: 'Đã hoàn thành bài luyện!' }).waitFor();
  assert.match(await page.locator('.lesson-result').innerText(), /3 \/ 4.*\+30 XP/);
  await page.getByRole('link', { name: 'Xem lịch ôn' }).click();
  await page.getByRole('link', { name: 'Bắt đầu ôn tập' }).click();
  await page.getByRole('radio', { name: '2:30 p.m.' }).check();
  await page.getByRole('button', { name: 'Kiểm tra' }).click();
  await page.getByRole('button', { name: 'Hoàn thành', exact: true }).click();
  await page.getByRole('heading', { name: 'Đã hoàn thành lượt ôn!' }).waitFor();
  assert.match(await page.locator('.lesson-result').innerText(), /1 \/ 1.*\+10 XP/);
  await page.getByRole('link', { name: 'Tiến độ' }).click();
  await page.getByLabel('Mục tiêu mỗi ngày').selectOption('30');
  await page.reload();
  const goal = page.getByLabel('Mục tiêu mỗi ngày');
  await page.waitForFunction(() => document.querySelector('#daily-goal')?.value === '30');
  assert.equal(await goal.inputValue(), '30');
  assert.match(await page.locator('[data-progress-summary]').innerText(), /40 XP/);
  assert.match(await page.locator('[data-milestones]').innerText(), /Bước đầu tiên/);
  assert.ok(page.url().includes(prefix));
});

test('bàn phím, thiết bị hẹp và lời nhắc chính xác ở luồng tự đối chiếu', async (t) => {
  const page = await tab(t, { viewport: { width: 320, height: 760 }, reducedMotion: 'reduce' });
  await page.goto(app.url);
  await page.keyboard.press('Tab');
  assert.equal(await page.locator(':focus').innerText(), 'Chuyển đến nội dung chính');
  await page.keyboard.press('Enter');
  assert.equal(await page.locator(':focus').getAttribute('id'), 'main');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
  const lesson = lessons[2];
  await page.goto(new URL(lessonLink(lesson.id), app.url).href);
  for (const item of lesson.items.slice(0, -1)) {
    if (item.kind === 'choice') await page.getByRole('radio', { name: item.answers[0], exact: true }).check();
    else await page.getByRole('textbox').fill(item.answers[0]);
    await page.getByRole('button', { name: 'Kiểm tra' }).click();
    await page.getByRole('button', { name: 'Câu tiếp theo' }).click();
  }
  await page.getByLabel('Bản nháp (không lưu)').fill('My own overview.');
  await page.getByRole('button', { name: 'Xem mẫu' }).click();
  assert.equal(await page.locator(':focus').innerText(), 'Gợi ý tự đối chiếu');
  await page.getByRole('button', { name: 'Hoàn thành', exact: true }).click();
  assert.match(await page.locator('.lesson-result').innerText(), /3 \/ 3.*\+30 XP/);
  assert.doesNotMatch(await page.evaluate(() => JSON.stringify(window.localStorage)), /My own overview/);
  await page.goto(new URL('practice.html?bai=unknown', app.url).href);
  await page.getByRole('heading', { name: 'Không tìm thấy bài luyện' }).waitFor();
});

test('các bản PDF tại đường dẫn dự án có ngôn ngữ, cấu trúc và liên kết tra cứu', async (t) => {
  const page = await tab(t, { javaScriptEnabled: false });
  await page.goto(new URL('resources.html', app.url).href);
  const downloads = page.getByRole('link', { name: /^Tải PDF:/ });
  assert.equal(await downloads.count(), guides.length);
  for (const guide of guides) {
    const pdfHref = await page.getByRole('link', { name: `Tải PDF: ${guide.title}` }).getAttribute('href');
    const result = await page.request.get(new URL(pdfHref, app.url).href);
    assert.equal(result.status(), 200);
    assert.match(result.headers()['content-type'], /application\/pdf/);
    const pdf = (await result.body()).toString('latin1');
    assert.match(pdf, /^%PDF-/);
    assert.match(pdf, /\/Lang \(vi\)/);
    assert.match(pdf, /\/StructTreeRoot/);
    assert.match(pdf, /https:\/\/scholar\.google\.com\/scholar\?/);
    assert.match(pdf, /https:\/\/doi\.org\/10\./);
    const guideResponse = await page.request.get(new URL(`${guide.id}.html`, app.url).href);
    assert.equal(guideResponse.status(), 200);
    assert.match(await guideResponse.text(), /Nguồn tham khảo/);
  }
  const files = await readdir(output, { recursive: true, withFileTypes: true });
  let bytes = 0;
  for (const entry of files.filter((file) => file.isFile())) bytes += (await stat(join(entry.parentPath, entry.name))).size;
  assert.ok(bytes < 1024 * 1024, `Ngân sách xuất bản 1 MiB: ${bytes} byte`);
});
