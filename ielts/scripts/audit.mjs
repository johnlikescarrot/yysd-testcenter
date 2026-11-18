import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { launch } from 'chrome-launcher';
import lighthouse, { desktopConfig } from 'lighthouse';
import guides from '../content/guides.json' with { type: 'json' };
import { lessons } from '../site/catalog.mjs';
import { lessonLink } from '../site/ui/html.mjs';
import { chromeOptions } from './chrome.mjs';
import { serve } from './serve.mjs';

const prefix = '/yysd-testcenter/';
const reports = new URL('../reports/', import.meta.url);
const categories = ['performance', 'accessibility', 'best-practices', 'seo'];
const routes = [
  ['lo-trinh', ''],
  ['bai-luyen', lessonLink(lessons[0].id)],
  ['on-tap', 'review.html'],
  ['tien-do', 'progress.html'],
  ['thu-vien', 'resources.html'],
  ...guides.map((guide) => [guide.id, `${guide.id}.html`]),
];

await mkdir(reports, { recursive: true });
const { server, url } = await serve({ prefix });
const remote = process.env.IELTS_AUDIT_URL;
const base = new URL(remote ? `${remote.replace(/\/$/, '')}/` : url);
const results = [];
try {
  const { executablePath, args } = await chromeOptions();
  const browser = await launch({ chromePath: executablePath, chromeFlags: ['--headless', ...args], envVars: process.env, logLevel: 'silent' });
  try {
    for (const [mode, config] of [['mobile', undefined], ['desktop', desktopConfig]]) {
      for (const [name, path] of routes) {
        const report = await lighthouse(new URL(path, base).href, {
          port: browser.port, logLevel: 'error', output: ['json', 'html'], onlyCategories: categories,
        }, config);
        const { lhr, report: [json, html] } = report;
        const scores = Object.fromEntries(categories.map((category) => [category, lhr.categories[category].score]));
        const id = `${mode}-${name}`;
        results.push({ id, url: lhr.finalDisplayedUrl, scores, version: lhr.lighthouseVersion });
        await Promise.all([
          writeFile(new URL(`${id}.json`, reports), json),
          writeFile(new URL(`${id}.html`, reports), html),
        ]);
        console.log(`${id}: ${categories.map((category) => `${category}=${Math.round((scores[category] ?? 0) * 100)}`).join(' ')}`);
      }
    }
  } finally {
    await browser.kill();
  }
} finally {
  server.close();
  await writeFile(new URL('summary.json', reports), `${JSON.stringify(results, null, 2)}\n`);
}
if (results.some(({ scores }) => Object.values(scores).some((score) => score !== 1))) {
  console.error(`Có trang chưa đạt 100/100 ở cả bốn hạng mục. Xem ${fileURLToPath(reports)}`);
  process.exitCode = 1;
}
