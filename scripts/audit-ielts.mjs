/** Reproducible Lighthouse mobile audits of the actual Pages artifact. */
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { browserArgs, executablePath } from '../tests/browser-runtime.mjs';
import { serveBuild } from '../tests/static-server.mjs';

execFileSync('node', ['scripts/build-ielts-pages.mjs'], { stdio: 'inherit' });
const { server, url } = await serveBuild();
const chrome = await chromeLauncher.launch({ chromePath: executablePath, chromeFlags: [...browserArgs, '--headless'] });
try {
  await mkdir('.lighthouse', { recursive: true });
  for (const [name, path] of [['home', ''], ['lesson', 'study.html?lesson=vocabulary']]) {
    const result = await lighthouse(`${url}${path}`, {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
    });
    await writeFile(`.lighthouse/ielts-${name}.json`, result.report);
    const scores = Object.fromEntries(Object.entries(result.lhr.categories).map(([id, category]) => [id, category.score === null ? null : Math.round(category.score * 100)]));
    console.log(`Lighthouse mobile (${name}):`, JSON.stringify(scores));
    if (Object.values(scores).some((score) => score === null || score < 100)) process.exitCode = 1;
  }
} finally {
  await chrome.kill();
  await new Promise((done) => server.close(done));
}
