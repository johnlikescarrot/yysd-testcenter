import assert from "node:assert/strict";
import puppeteer from "puppeteer-core";
import { serveProject } from "./serve.mjs";
const { origin, server } = await serveProject();
let browser;
try {
  browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  });
  const page = await browser.newPage(),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
  });
  page.on("dialog", (d) => d.accept());
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(origin);
  await page.waitForSelector(".lesson-row");
  await page.click("#start");
  for (const choice of [1, 0, 2]) {
    await page.click(`[data-choice="${choice}"]`);
    await page.click("#advance");
  }
  assert.equal(await page.$eval("#xp", (e) => e.textContent), "25");
  await page.click("#return");
  await page.reload();
  assert.equal(await page.$eval("#xp", (e) => e.textContent), "25");
  await page.goto(
    origin + "library/mock/cambridge-listening/cambridge-21-test-1.html",
  );
  await page.click(".pc-go");
  await page.click(".mode-start");
  await page.waitForSelector(".tx-sent");
  await page.click("#txVi");
  await page.waitForSelector(".tx-translation");
  await page.click(".tx-sent");
  await page.waitForFunction(
    () => {
      const p = document.getElementById("player");
      return p.readyState >= 2 && !p.paused && p.currentTime > 5;
    },
    { timeout: 12000 },
  );
  await page.click(".submit-btn");
  await page.waitForFunction(
    () =>
      getComputedStyle(document.getElementById("resultArea")).display !==
      "none",
  );
  await page.goto(
    origin + "library/mock/cambridge-writing/cambridge-19-test-1-writing.html",
  );
  await page.click(".pc-go");
  await page.type("#t1", "Overall, the trend rose.");
  await page.reload();
  await page.click(".pc-go");
  assert.equal(
    await page.$eval("#t1", (e) => e.value),
    "Overall, the trend rose.",
  );
  await page.click(".submit-btn");
  await page.goto(origin);
  await page.waitForSelector("#paper-history li:nth-child(2)");
  const results = await page.$eval("#paper-history", (e) => e.textContent);
  assert.match(results, /4 từ/);
  assert.match(results, /0 \/ 40/);
  assert.ok(!results.includes("Overall,"));
  await page.setViewport({ width: 390, height: 844 });
  assert.ok(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth ===
        document.documentElement.clientWidth,
    ),
  );
  await page.click('[data-skill="Listening"]');
  assert.equal((await page.$$(".lesson-row")).length, 2);
  await page.click(".lesson-row");
  await page.keyboard.press("Escape");
  assert.ok(await page.$eval("#session", (e) => !e.open));
  assert.deepEqual(errors, []);
  console.log(
    "Chromium: mounted subpath, lesson completion/reload, real MP3 playback and Vietnamese transcript, draft restore, exam history, mobile layout and keyboard dismissal OK.",
  );
} finally {
  if (browser) await browser.close();
  server.close();
}
