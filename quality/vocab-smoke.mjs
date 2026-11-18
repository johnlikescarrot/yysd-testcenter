// The original eight listening books still expose wordData for the shelf and
// timed assignment bridge. Exercise their real cards, inputs and result rows.
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const dir = new URL('../library/study/vocab-special-listening/', import.meta.url);
const files = (await readdir(dir)).filter((name) => name.endsWith('.html')).sort();
assert.equal(files.length, 8);
let entries = 0;
for (const file of files) {
  const source = await readFile(new URL(file, dir), 'utf8');
  assert.doesNotMatch(source, /\p{Script=Han}/u, file);
  const errors = [];
  const dom = new JSDOM(source, {
    url: 'https://centre.invalid/book/', runScripts: 'dangerously',
    beforeParse(window) {
      window.Math.random = () => 0.9999; // Deterministic shuffle, original word order.
      window.confirm = () => true;
      window.HTMLElement.prototype.scrollIntoView = () => {}; // jsdom has no layout.
      window.addEventListener('error', (event) => errors.push(event.message));
    },
  });
  try {
    const { document } = dom.window;
    const get = (id) => document.getElementById(id);
    const words = [...document.querySelectorAll('#learnGrid .word-card')];
    entries += words.length;
    assert.ok(words.length >= 30);
    // Tests are intentionally hidden in the standalone card reader. Teachers use
    // the same handlers in assignments; do not re-enable its legacy test tab.
    get('btnStartTest').click();
    const reply = (card, meaning) => {
      get('inputSpelling').value = card.querySelector('.word-headword').textContent.trim();
      get('inputMeaning').value = meaning;
      get('btnSubmit').click();
    };
    const meaning = words[0].querySelector('.word-meaning').textContent;
    reply(words[0], ` ${meaning.toLocaleUpperCase('vi').normalize('NFD')} `);
    assert.match(get('feedback').textContent, /đều đúng/);
    get('btnNext').click();
    reply(words[1], words[1].querySelector('.word-meaning').textContent[0]);
    assert.match(get('feedback').textContent, /nghĩa chưa đúng/);
    get('btnQuit').click();
    const records = dom.window.testResultsData;
    assert.equal(records[0].earned, 1);
    assert.ok(records[0].acceptCN.includes(meaning));
    assert.equal(records[1].spellingCorrect, true);
    assert.equal(records[1].meaningCorrect, false);
    assert.equal(records[2].userMeaning, '');
    assert.equal(get('summary').querySelector('.num').textContent, `1 / ${records.length}`);
    assert.deepEqual(errors, []);
    assert.equal(records.length, Number(source.match(/const TOTAL_DICT = (\d+)/)[1])
      + Number(source.match(/const TOTAL_QUIZ = (\d+)/)[1]));
  } finally {
    dom.window.close();
  }
}
assert.equal(entries, 257);
console.log('All 8 listening vocabulary books passed: 257 English cards, Vietnamese meanings and structured grading.');
