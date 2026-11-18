import { copyFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { lessons } from '../ielts-vi/assets/course.js';
import { guides } from './materials.mjs';

const output = new URL('./dist/', import.meta.url);
const source = new URL('../ielts-vi/', import.meta.url);
const files = [
  'index.html', 'assets/mark.svg', 'assets/trail.svg', 'assets/icons.svg',
  ...lessons.filter((lesson) => lesson.context?.audio).map(({ context }) => `audio/${context.audio}`),
  ...guides.flatMap(({ slug }) => [`resources/${slug}.html`, `resources/${slug}.pdf`]),
];

// Publish only this edition. Never package the server, CNAME or legacy exam banks.
await rm(output, { recursive: true, force: true });
await Promise.all(['assets/', 'audio/', 'resources/'].map((dir) => mkdir(new URL(dir, output), { recursive: true })));
await Promise.all(files.map((file) => copyFile(new URL(file, source), new URL(file, output))));
// One first-party module request instead of a five-deep ES module waterfall.
await build({
  entryPoints: ['main.js', 'style.css'].map((name) => fileURLToPath(new URL(`assets/${name}`, source))),
  bundle: true, minify: true, format: 'esm', target: 'es2022', charset: 'utf8',
  outdir: fileURLToPath(new URL('assets/', output)),
});
await writeFile(new URL('.nojekyll', output), '');
console.log(`Prepared ${files.length + 2} IELTS files in quality/dist/`);
