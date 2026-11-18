import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { launch } from 'chrome-launcher';
import lighthouse, { desktopConfig } from 'lighthouse';
import { executablePath } from './chrome.mjs';
import { build, root, serve } from './site.mjs';

const reportFolder = join(root, 'audit-results');
await mkdir(reportFolder, { recursive: true });
const chrome = await launch({
  chromePath: await executablePath(),
  chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  logLevel: 'silent',
});
try {
  const server = await serve(await build());
  try {
    const start = process.env.AUDIT_URL ?? server.url;
    const pages = { 'lo-trinh': '', 'on-tap': '#on-tap', 'tien-do': '#tien-do', 'tai-lieu': 'tai-lieu.html' };
    const categories = ['performance', 'accessibility', 'best-practices', 'seo'];
    let failed = false;
    for (const [name, path] of Object.entries(pages)) {
      for (const [device, config] of [['mobile', undefined], ['desktop', desktopConfig]]) {
        const result = await lighthouse(new URL(path, start).href,
          { port: chrome.port, onlyCategories: categories, logLevel: 'error', output: 'html' }, config);
        const scores = Object.fromEntries(categories.map(category => [category, result.lhr.categories[category].score * 100]));
        await writeFile(join(reportFolder, `${name}-${device}.html`), result.report);
        console.log(`${name} (${device}): ${JSON.stringify(scores)}`);
        for (const category of categories) {
          if (scores[category] === 100) continue;
          failed = true;
          const scored = result.lhr.categories[category].auditRefs.filter(ref => ref.weight > 0);
          for (const { id } of scored) {
            const { score, displayValue } = result.lhr.audits[id];
            if (score !== null && score < 1) console.error(`${id}: ${score} ${displayValue ?? ''}`);
          }
        }
      }
    }
    if (failed) process.exitCode = 1;
  } finally {
    await server.close();
  }
} finally {
  await chrome.kill();
}
