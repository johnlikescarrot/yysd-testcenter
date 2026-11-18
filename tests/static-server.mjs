import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const types = { '.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.pdf': 'application/pdf' };

export async function serveBuild() {
  const root = resolve('pages-dist');
  const server = createServer(async (request, response) => {
    try {
      const path = decodeURIComponent(new URL(request.url, 'http://example.test').pathname);
      if (!path.startsWith('/yysd-testcenter/')) throw new Error('Not found');
      const file = resolve(root, `.${path.slice('/yysd-testcenter'.length)}`) + (path.endsWith('/') ? `${sep}index.html` : '');
      if (!file.startsWith(`${root}${sep}`)) throw new Error('Not found');
      const data = await readFile(file);
      response.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' });
      response.end(data);
    } catch {
      response.writeHead(404, { 'content-type': 'text/plain' });
      response.end('Not found');
    }
  });
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  return { server, url: `http://127.0.0.1:${server.address().port}/yysd-testcenter/` };
}
