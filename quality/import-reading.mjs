// Reuse the portal's author-maintained sample. Read the markup, never execute an exam's scripts.
import { readFile, writeFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const file = new URL('../library/practice/ielts/sample-academic-reading-1.html', import.meta.url);
const destination = new URL('../ielts-vi/assets/honeybees.js', import.meta.url);
const { window } = new JSDOM(await readFile(file, 'utf8'));
const { document } = window;
const clean = (node) => node.textContent.trim().replace(/\s+/g, ' ');
const paragraphs = [...document.querySelectorAll('.passage p')].map(clean);
const questions = [...document.querySelectorAll('.q[data-answer]')].map((node, index) => {
  const stem = node.querySelector('.stem').cloneNode(true);
  if (clean(stem.querySelector('.num')) !== `${index + 1}.`) throw new Error('Question numbering changed');
  stem.querySelector('.num').remove();
  const prompt = clean(stem);
  const answers = node.dataset.answer.split('|');
  const options = [...node.querySelectorAll('.opts label')].map(clean);
  const note = clean(node.querySelector('.ans-note'));
  const split = note.indexOf('. ');
  if (!note.startsWith(`Đáp án: ${answers[0]}`) || split < 0) throw new Error(`Missing explanation: ${prompt}`);
  const explanation = note.slice(split + 2);
  if (options.length) {
    const answer = options.indexOf(answers[0]);
    if (answer < 0) throw new Error(`Missing correct option: ${prompt}`);
    return { type: 'choice', prompt, options, answer, explanation };
  }
  return { type: 'fill', prompt: `${prompt} (ONE WORD ONLY)`, answers, explanation };
});
if (paragraphs.length !== 4 || questions.length !== 8) throw new Error('Unexpected passage or answer count');
const data = { context: { text: [clean(document.querySelector('.passage h2')), ...paragraphs].join('\n\n') }, questions };
await writeFile(destination, `// Generated from the portal sample by quality/import-reading.mjs.\nexport const honeybees = ${JSON.stringify(data, null, 2)};\n`);
window.close();
