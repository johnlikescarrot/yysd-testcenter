// Regression checks for the original portal. Never fetch remote scripts or media.
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { Script } from 'node:vm';
import test from 'node:test';
import { JSDOM, VirtualConsole } from 'jsdom';

const root = new URL('../', import.meta.url);
const source = (file) => readFile(new URL(file, root), 'utf8');
const { items, count } = JSON.parse(await source('library/manifest.json'));
const papers = items.filter(({ subject }) => /^cambridge-(listening|reading|writing)$/.test(subject));
const oldScript = /\p{Script=Han}/u;

async function paperWindow(t, file) {
  // In this test the learner's browser is offline: no API, microphone, real audio or clipboard.
  const errors = [];
  const messages = [];
  const dom = new JSDOM(await source(`library/${file}`), {
    url: `https://example.test/project/library/${file}`, runScripts: 'dangerously',
    virtualConsole: new VirtualConsole().on('jsdomError', (error) => errors.push(error.message)),
    beforeParse(window) {
      window.scrollTo = () => {};
      window.HTMLMediaElement.prototype.pause = () => {};
      window.HTMLMediaElement.prototype.load = () => {};
      window.HTMLMediaElement.prototype.play = () => Promise.resolve();
      window.postMessage = (data) => messages.push(data);
    },
  });
  t.after(() => { dom.window.close(); assert.deepEqual(errors, [], file); });
  return { window: dom.window, document: dom.window.document, messages };
}

test('catalog labels, lookup keys and assigned drills work with both generations of titles', async (t) => {
  const dom = new JSDOM('', { url: 'https://example.test/project/', runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  dom.window.eval(await source('assets/js/config.js'));
  const api = dom.window.YYSD;
  assert.equal(count, items.length);
  assert.equal(new Set(items.map(({ id }) => id)).size, count);
  for (const { title, description } of items) assert.doesNotMatch(`${title} ${description}`, oldScript);
  for (const item of papers) {
    const id = item.id.match(/^cambridge-(\d+)-test-(\d+)/);
    if (id) {
      assert.equal(api.camVolume(item), id[1]);
      assert.equal(api.camTestNo(item), id[2]);
    }
  }
  assert.equal(api.camVolume({ title: '剑桥雅思15 · Test 1（听力）' }), '15');
  assert.equal(api.camVolume({ title: 'Cambridge IELTS 15 · Test 1 (Nghe)' }), '15');
  const id = 'cambridge-20-test-1-reading-p1-q1-6-explain';
  const drill = api.resolveItem(items, id);
  assert.equal(drill.parentId, 'cambridge-20-test-1-reading');
  assert.equal(drill.id, id);
  assert.match(drill.title, /Passage 1 Q1–6 · Lời giải/);
  assert.equal(api.fileHref(drill), `exam.html?id=${id}`);
  assert.ok(api.TOEFL_FULL.length > 0);
  assert.ok(api.TOEFL_FULL.every((paper) => paper.title.endsWith('Thi thử trọn bộ')));
});

test('every indexed Cambridge paper has a Vietnamese shell and independent writing drafts', async () => {
  for (const item of papers) {
    const html = await source(`library/${item.file}`);
    assert.match(html, /<html lang="vi">/);
    assert.ok(html.includes(`name="exam:title" content="${item.title}"`), item.file);
    if (item.subject === 'cambridge-writing') {
      assert.ok(html.includes(`"${item.id}-draft"`), item.file);
      assert.doesNotMatch(html, oldScript);
    }
    for (const [, attrs, js] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      if (!/\bsrc=/.test(attrs)) new Script(js, { filename: item.file });
    }
  }
});

test('root page inline scripts compile and the guest learning path is reachable', async () => {
  for (const file of (await readdir(root)).filter((name) => name.endsWith('.html'))) {
    const html = await source(file);
    for (const [, attrs, js] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      if (!/\bsrc=|application\/(?:ld\+)?json|type="module"/.test(attrs)) new Script(js, { filename: file });
    }
  }
  assert.match(await source('index.html'), /href="ielts-vi\/"/);
  assert.match(await source('assets/js/zone.js'), /href="ielts-vi\/"/);
});

test('the original eight-question academic reading sample accepts the alternative spelling and reports its score', async (t) => {
  const { document, messages } = await paperWindow(t, 'practice/ielts/sample-academic-reading-1.html');
  const nodes = [...document.querySelectorAll('.q')];
  assert.equal(nodes.length, 8);
  for (const node of nodes) {
    const expected = node.dataset.answer.split('|').at(-1);
    const radio = [...node.querySelectorAll('input[type="radio"]')].find((el) => el.value === expected);
    if (radio) radio.checked = true;
    else node.querySelector('input[type="text"]').value = ` ${expected.toUpperCase()} `;
  }
  document.querySelector('#submit').click();
  assert.equal(document.querySelectorAll('.q.right.reveal').length, 8);
  assert.deepEqual(messages.map(({ type, score, total }) => [type, score, total]), [['yysd:score', 8, 8]]);
});

for (const [skill, file] of [['reading', 'cambridge-20-test-1-reading.html'], ['listening', 'secret-set-1.html']]) {
  test(`${skill}: select sections, render 40 questions, grade actual controls and open report`, async (t) => {
    const { window, document } = await paperWindow(t, `mock/cambridge-${skill}/${file}`);
    window.openMode();
    const checks = document.querySelectorAll('.secbox');
    assert.equal(checks.length, skill === 'reading' ? 3 : 4);
    window.toggleAll();
    assert.equal(document.querySelectorAll('.secbox:checked').length, 0);
    window.toggleAll();
    window.startTest('practice');
    const sections = window.eval('currentPaper');
    for (const section of sections) {
      for (const group of section.groups) {
        group.questions.forEach((q, i) => {
          const answer = group.kind === 'multi' ? group.answerSet[i] : [].concat(q.answer)[0];
          const field = document.getElementById(q.id);
          if (field) field.value = answer;
          else {
            const radio = [...document.getElementsByName(q.id)].find((el) => el.value === answer);
            assert.ok(radio, `${file} ${q.id} has no input for ${answer}`);
            radio.checked = true;
          }
        });
      }
    }
    window.submitTest();
    assert.equal(document.getElementById('resCorrect').textContent, '40/40');
    assert.equal(document.getElementById('resBand').textContent, '9.0');
    assert.match(document.getElementById('resultArea').textContent, /Báo cáo kết quả/);
    window.backToCover();
    window.openMode();
    window.startTest('practice');
    const entry = document.querySelector('#testArea input[type="text"]');
    entry.value = 'weather <cold> & wind';
    window.submitTest();
    assert.ok([...document.querySelectorAll('span.yours')].some((node) => node.textContent === entry.value));
  });
}

test('writing: word count, persistence by paper, self-review and copied paper identity', async (t) => {
  const { window, document } = await paperWindow(t, 'mock/cambridge-writing/cambridge-21-test-2-writing.html');
  window.startTest();
  const draft = document.getElementById('t1');
  draft.value = 'Both figures increased.';
  draft.dispatchEvent(new window.Event('input'));
  assert.equal(document.getElementById('wc1').textContent, '3');
  assert.equal(JSON.parse(window.localStorage.getItem('cambridge-21-test-2-writing-draft')).t1, draft.value);
  window.finishTest();
  assert.equal(document.getElementById('dump1').textContent, draft.value);
  let copied;
  window.navigator.clipboard = { writeText: async (value) => { copied = value; } };
  window.copyAll();
  assert.match(copied, /^\[Cambridge IELTS 21 · Test 2 \(Viết\)\]\n/);
  assert.ok(copied.includes(draft.value));
  await Promise.resolve();
  assert.match(document.getElementById('copyMsg').textContent, /Đã sao chép/);
  window.navigator.clipboard.writeText = async () => { throw new Error('Clipboard denied'); };
  document.execCommand = () => false;
  window.copyAll();
  await Promise.resolve();
  assert.match(document.getElementById('copyMsg').textContent, /sao chép thủ công/);
  Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage denied'); } });
  draft.dispatchEvent(new window.Event('input'));
  assert.match(document.getElementById('saved1').textContent, /không lưu được/);
});

test('admissions lookup pages the full dataset; country, university and English course search remain linked', async (t) => {
  const dom = new JSDOM(await source('requirements.html'), { runScripts: 'dangerously', url: 'https://example.test/project/requirements.html' });
  t.after(() => dom.window.close());
  const { document, Event } = dom.window;
  const field = (id) => document.getElementById(id);
  const rows = () => [...document.querySelectorAll('tr.main')];
  const set = (id, value) => { field(id).value = value; field(id).dispatchEvent(new Event('change')); };
  const total = Number(field('cnt').textContent);
  assert.equal(total, dom.window.eval('DATA.length'));
  assert.ok(total > 50);
  assert.equal(rows().length, 50);
  const original = rows()[0].textContent;
  field('next-page').click();
  assert.notEqual(rows()[0].textContent, original);
  assert.match(field('page-count').textContent, /^Trang 2 \/ /);
  const country = field('fCountry').options[1].value;
  set('fCountry', country);
  assert.equal(field('prev-page').disabled, true);
  assert.ok(rows().every((row) => row.querySelector('.cty').textContent === country));
  set('fUni', field('fUni').options[1].value);
  set('q', rows()[0].querySelector('.major small').textContent);
  assert.ok(rows().length > 0);
  const details = rows()[0].querySelector('.caret');
  details.click();
  assert.equal(details.getAttribute('aria-expanded'), 'true');
  assert.ok(document.getElementById(details.getAttribute('aria-controls')).classList.contains('show'));
  set('q', 'no-matching-example-99999');
  assert.equal(rows().length, 0);
  assert.equal(field('next-page').disabled, true);
  field('reset').click();
  assert.equal(Number(field('cnt').textContent), total);
  assert.equal(rows()[0].textContent, original);
});
