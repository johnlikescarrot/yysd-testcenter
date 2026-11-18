/** Merge per-navigation Chromium V8 coverage for the two new browser UI modules. */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import v8ToIstanbul from 'v8-to-istanbul';
import libCoverage from 'istanbul-lib-coverage';

const modules = ['ielts-vi-home.mjs', 'ielts-vi-lesson.mjs'];
const entries = JSON.parse(await readFile('coverage/browser-v8.json', 'utf8'));
const map = libCoverage.createCoverageMap({});
const seen = new Set();

for (const entry of entries) {
  const name = new URL(entry.url).pathname.split('/').pop();
  if (!modules.includes(name)) continue;
  const file = resolve(`assets/js/${name}`);
  const source = await readFile(file, 'utf8');
  // Chromium may omit script source after a pagehide; verify it whenever supplied.
  if (typeof entry.source === 'string' && entry.source !== source) throw new Error(`Browser coverage source differs from ${file}`);
  const converter = v8ToIstanbul(file, 0, { source });
  await converter.load();
  converter.applyCoverage(entry.functions);
  map.merge(converter.toIstanbul());
  seen.add(name);
}

const report = {};
for (const name of modules) {
  if (!seen.has(name)) throw new Error(`No browser coverage collected for ${name}`);
  const summary = map.fileCoverageFor(resolve(`assets/js/${name}`)).toSummary().data;
  report[name] = summary;
  const scores = Object.fromEntries(['lines', 'branches', 'functions'].map((kind) => [kind, summary[kind].pct]));
  console.log(`Browser V8 coverage (${name}):`, JSON.stringify(scores));
  if (['lines', 'branches', 'functions'].some((kind) => summary[kind].total === 0 || summary[kind].pct < 100)) process.exitCode = 1;
}
await writeFile('coverage/browser-summary.json', JSON.stringify(report, null, 2) + '\n');
