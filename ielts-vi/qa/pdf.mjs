import { join } from 'node:path';
import { downloads, root, serve } from './site.mjs';
import { openBrowser } from './chrome.mjs';

const browser = await openBrowser();
const server = await serve();
try {
  const page = await browser.newPage();
  for (const [id, path] of Object.entries(downloads)) {
    await page.goto(`${server.url}tai-lieu.html`);
    await page.evaluate(articleId => {
      document.querySelectorAll('article').forEach(article => {
        if (article.id !== articleId) article.remove();
      });
      const article = document.getElementById(articleId);
      // Giữ cấu trúc đề mục phù hợp cho PDF độc lập.
      for (const node of article.querySelectorAll('h2, h3')) {
        const heading = document.createElement(node.tagName === 'H2' ? 'h1' : 'h2');
        heading.id = node.id;
        heading.textContent = node.textContent;
        node.replaceWith(heading);
      }
      document.title = article.querySelector('h1').textContent;
    }, id);
    await page.pdf({ path: join(root, path), preferCSSPageSize: true, tagged: true, outline: true });
    console.log(path);
  }
} finally {
  await browser.close();
  await server.close();
}
