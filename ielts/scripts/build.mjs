import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import guides from '../content/guides.json' with { type: 'json' };
import { pages } from './pages.mjs';
import { openBrowser } from './chrome.mjs';
import { output, serve } from './serve.mjs';

const source = (path) => fileURLToPath(new URL(`../site/${path}`, import.meta.url));
await rm(output, { recursive: true, force: true });
await mkdir(join(output, 'pdf'), { recursive: true });
await Promise.all([
  ...Array.from(pages(), ([filename, html]) => writeFile(join(output, filename), html)),
  cp(source('media'), join(output, 'media'), { recursive: true }),
  writeFile(join(output, '.nojekyll'), ''),
  writeFile(join(output, 'robots.txt'), 'User-agent: *\nAllow: /\n'),
  build({ entryPoints: [source('entry.mjs')], outfile: join(output, 'app.mjs'), bundle: true, minify: true, charset: 'utf8', format: 'esm' }),
  build({ entryPoints: [source('style.css')], outfile: join(output, 'style.css'), minify: true }),
]);

const { server, url } = await serve();
let browser;
try {
  browser = await openBrowser();
  const page = await browser.newPage();
  for (const guide of guides) {
    const response = await page.goto(`${url}${guide.id}.html`);
    if (!response.ok()) throw new Error(`Không thể in tài liệu: ${guide.id}`);
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({
      path: join(output, 'pdf', `${guide.id}.pdf`), format: 'A4', tagged: true, outline: true,
      printBackground: true, margin: { top: '15mm', right: '16mm', bottom: '15mm', left: '16mm' },
    });
    const pdf = await readFile(join(output, 'pdf', `${guide.id}.pdf`), 'latin1');
    if (!pdf.startsWith('%PDF-') || !pdf.includes('https://scholar.google.com/scholar?')) {
      throw new Error(`PDF không có liên kết học thuật: ${guide.id}`);
    }
  }
} finally {
  await browser?.close();
  server.close();
}
console.log(`Đã dựng ${pages().size} trang HTML và ${guides.length} PDF: ${output}`);
