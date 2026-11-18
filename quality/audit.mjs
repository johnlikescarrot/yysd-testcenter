import { mkdir, writeFile } from 'node:fs/promises';
import lighthouse from 'lighthouse';
import desktop from 'lighthouse/core/config/desktop-config.js';
import { guides } from './materials.mjs';
import { withChrome, withSite } from './test-site.mjs';

const reports = new URL('./reports/', import.meta.url);
const categories = ['performance', 'accessibility', 'best-practices', 'seo'];
const pages = [['home', ''], ...guides.map(({ slug }) => [slug, `resources/${slug}.html`])];
let failures = 0;
await mkdir(reports, { recursive: true });
function reportFailure(message) {
  const escaped = message.replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A');
  console.error(process.env.GITHUB_ACTIONS === 'true' ? `::error title=Lighthouse::${escaped}` : message);
}

const audit = (url) => withChrome(async (browser) => {
  const port = Number(new URL(browser.wsEndpoint()).port);
  for (const [name, path] of pages) {
    for (const [formFactor, config] of [['mobile', undefined], ['desktop', desktop]]) {
      const { lhr, report } = await lighthouse(new URL(path, url).href, {
        port, output: ['html', 'json'], logLevel: 'error', onlyCategories: categories,
      }, config);
      const label = `${name}-${formFactor}`;
      await writeFile(new URL(`${label}.html`, reports), report[0]);
      await writeFile(new URL(`${label}.json`, reports), report[1]);
      if (lhr.runtimeError) throw new Error(`${label}: ${lhr.runtimeError.message}`);
      const scores = categories.map((category) => [category, lhr.categories[category].score]);
      console.log(`${label}: ${scores.map(([key, score]) => `${key}=${Math.round(score * 100)}`).join(', ')}`);
      for (const [key, score] of scores) {
        if (score === 1) continue;
        failures += 1;
        const missed = lhr.categories[key].auditRefs.flatMap(({ id, weight }) => {
          const entry = lhr.audits[id];
          return weight > 0 && entry.score !== null && entry.score < 1
            ? [`${id}: ${entry.displayValue ?? entry.title}`] : [];
        });
        reportFailure(`${label}: ${key} ${Math.round(score * 100)}/100. ${missed.join('; ')}`);
      }
    }
  }
});
const liveUrl = process.env.IELTS_PAGES_URL;
try {
  if (liveUrl) await audit(liveUrl.endsWith('/') ? liveUrl : `${liveUrl}/`);
  else await withSite(audit);
} catch (error) {
  reportFailure(error.message);
  failures += 1;
}
if (failures) process.exitCode = 1;
