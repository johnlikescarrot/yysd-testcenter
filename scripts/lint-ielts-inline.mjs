/** Lint the existing sample's inline script, which Super-Linter's HTML checker does not parse. */
import { readFile } from 'node:fs/promises';
import { ESLint } from 'eslint';

const file = 'library/practice/ielts/sample-academic-reading-1.html';
const html = await readFile(file, 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/gi)];
if (scripts.length !== 1) throw new Error(`Expected one inline script in ${file}; found ${scripts.length}.`);

const linter = new ESLint({ overrideConfigFile: '.github/linters/eslint.config.mjs' });
const results = await linter.lintText(scripts[0][1], { filePath: `${file}.mjs` });
const formatter = await linter.loadFormatter('stylish');
const output = formatter.format(results);
if (output) console.log(output);
if (results.some((result) => result.errorCount || result.warningCount || result.fatalErrorCount)) {
  process.exitCode = 1;
} else {
  console.log(`Inline JavaScript linted: ${file}`);
}
