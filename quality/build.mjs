import { copyFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { lessons } from '../ielts-vi/assets/course.js';
import { guides } from './materials.mjs';

const output = new URL('./dist/', import.meta.url);
const source = new URL('../ielts-vi/', import.meta.url);
const files = [
  'index.html', 'assets/style.css', 'assets/mark.svg', 'assets/icons.svg',
  'assets/course.js', 'assets/main.js', 'assets/progress.js', 'assets/study.js',
  ...lessons.filter((lesson) => lesson.context?.audio).map(({ context }) => `audio/${context.audio}`),
  ...guides.flatMap(({ slug }) => [`resources/${slug}.html`, `resources/${slug}.pdf`]),
];

// Publish only this edition. Never package the server, CNAME or legacy exam banks.
await rm(output, { recursive: true, force: true });
await Promise.all(['assets/', 'audio/', 'resources/'].map((dir) => mkdir(new URL(dir, output), { recursive: true })));
await Promise.all(files.map((file) => copyFile(new URL(file, source), new URL(file, output))));
await writeFile(new URL('.nojekyll', output), '');
console.log(`Prepared ${files.length} IELTS files in quality/dist/`);
