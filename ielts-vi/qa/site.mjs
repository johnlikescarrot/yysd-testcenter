import { createServer } from 'node:http';
import { readFile, mkdir, copyFile, rm, writeFile } from 'node:fs/promises';
import { once } from 'node:events';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { newProgress } from '../learning.js';
import { pathMarkup } from '../path.js';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const dist = join(root, 'dist');
export const projectPath = '/yysd-testcenter/';
export const downloads = { 'cam-nang': 'media/cam-nang-ielts.pdf', 'so-tay': 'media/so-tay-on-tap.pdf' };
export const publicFiles = [
  'index.html', 'style.css', 'app.js', 'learning.js', 'lessons.js', 'path.js', 'tai-lieu.html', 'tai-lieu.css',
  'media/mark.svg', 'media/icons.svg', 'media/hero.svg', 'media/library.mp3', 'media/workshop.mp3', 'media/trees.mp3',
  ...Object.values(downloads),
];
const validFiles = new Set(publicFiles);
const types = {
  '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8',
  '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.pdf': 'application/pdf',
};

export async function build() {
  await rm(dist, { recursive: true, force: true });
  for (const file of publicFiles) {
    const dest = join(dist, file);
    await mkdir(dirname(dest), { recursive: true });
    await copyFile(join(root, file), dest);
  }
  const homepage = join(dist, 'index.html');
  const html = await readFile(homepage, 'utf8');
  await writeFile(homepage, html.replace('<!-- initial-path -->', pathMarkup(newProgress())));
  return dist;
}

// Mô phỏng đường dẫn dự án trên Pages, không phục vụ bất kỳ tệp nội bộ nào.
export async function serve(directory = root) {
  const server = createServer(async (request, response) => {
    const { pathname } = new URL(request.url, 'http://127.0.0.1');
    const file = pathname.slice(projectPath.length) || 'index.html';
    if (pathname.startsWith(projectPath) && validFiles.has(file)) {
      try {
        const content = await readFile(join(directory, file));
        response.writeHead(200, { 'Content-Type': types[extname(file)], 'Content-Length': content.length });
        response.end(content);
        return;
      } catch { /* Tệp chưa tạo hoặc không đọc được. */ }
    }
    response.writeHead(404);
    response.end('Không tìm thấy');
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return {
    url: `http://127.0.0.1:${server.address().port}${projectPath}`,
    close: () => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())),
  };
}
