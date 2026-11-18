/** Build only the self-contained Vietnamese hub, not the multi-GB legacy library. */
import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const files = [
  'index.html',
  'study.html',
  'assets/css/ielts-vi.css',
  'assets/js/ielts-vi-core.mjs',
  'assets/js/ielts-vi-data.mjs',
  'assets/js/ielts-vi-home.mjs',
  'assets/js/ielts-vi-lesson.mjs',
  'assets/img/favicon.svg',
  'assets/img/logo.svg',
  'docs/ielts/cam-nang-ielts.pdf',
  'library/practice/ielts/sample-academic-reading-1.html'
];
const destination = resolve('pages-dist');
await rm(destination, { recursive: true, force: true });
for (const file of files) {
  const target = resolve(destination, file);
  await mkdir(dirname(target), { recursive: true });
  await cp(resolve(file), target);
}
await cp(resolve('.nojekyll'), resolve(destination, '.nojekyll'));
console.log(`Prepared ${files.length} files and .nojekyll in pages-dist/`);
