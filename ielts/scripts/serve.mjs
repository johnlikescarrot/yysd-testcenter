import { createServer } from 'node:http';
import { once } from 'node:events';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sirv from 'sirv';

export const output = fileURLToPath(new URL('../dist/', import.meta.url));

export async function serve({ host = '127.0.0.1', port = 0, prefix = '/' } = {}) {
  const staticFiles = sirv(output, {
    dev: true,
    etag: true,
    extensions: [],
    onNoMatch: (_, response) => {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Không tìm thấy trang.');
    },
  });
  const server = createServer((request, response) => {
    if (prefix !== '/' && !request.url.startsWith(prefix)) {
      response.writeHead(404).end();
      return;
    }
    const relative = `/${request.url.slice(prefix.length)}`;
    request.url = /^\/(?:\?|$)/.test(relative) ? `/index.html${relative.slice(1)}` : relative;
    staticFiles(request, response);
  });
  server.listen(port, host);
  await once(server, 'listening');
  return { server, url: `http://${host}:${server.address().port}${prefix}` };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { server } = await serve({ host: '0.0.0.0', port: Number(process.env.PORT ?? 4173) });
  console.log(`IELTS Mỗi Ngày · http://0.0.0.0:${server.address().port}`);
}
