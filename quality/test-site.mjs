import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname } from 'node:path';
import { once } from 'node:events';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

const projectPath = '/yysd-testcenter/';
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg', '.pdf': 'application/pdf',
};

export async function withSite(callback) {
  const server = createServer(async (request, response) => {
    const { pathname } = new URL(request.url, 'http://127.0.0.1');
    const name = pathname.slice(projectPath.length) || 'index.html';
    try {
      if (!pathname.startsWith(projectPath) || !/^[\w./-]+$/.test(name) || name.includes('..') || !types[extname(name)]) {
        throw new Error('Not found');
      }
      const body = await readFile(new URL(`./dist/${name}`, import.meta.url));
      response.writeHead(200, { 'Content-Type': types[extname(name)], 'Content-Length': body.length });
      response.end(request.method === 'HEAD' ? undefined : body);
    } catch {
      response.writeHead(404).end();
    }
  });
  const listening = once(server, 'listening');
  server.listen(0, '127.0.0.1');
  await listening;
  try {
    return await callback(`http://127.0.0.1:${server.address().port}${projectPath}`);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
}

export async function withChrome(callback) {
  const browser = await puppeteer.launch({
    executablePath: await chromium.executablePath(), headless: 'shell',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });
  try {
    return await callback(browser);
  } finally {
    await browser.close();
  }
}
