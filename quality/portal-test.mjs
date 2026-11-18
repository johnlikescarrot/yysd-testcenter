// Regression checks for the original portal. Never fetch remote scripts or media.
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { Script } from 'node:vm';
import { parse } from 'acorn';
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
});

for (const file of ['placement-junior-1', 'placement-test-1', 'placement-test-2', 'placement-test-3']) {
  test(`${file}: Vietnamese instructions, exam inputs and full score report`, async (t) => {
    const { document, window } = await paperWindow(t, `mock/ielts/${file}.html`);
    assert.equal(document.documentElement.lang, 'vi');
    const key = window.eval('answerKey');
    const count = file.includes('junior') ? 35 : 36;
    assert.equal(Object.keys(key).length, count);
    for (const [id, answers] of Object.entries(key)) {
      const el = document.getElementById(id);
      if (el?.tagName === 'SELECT') {
        const option = [...el.options].find(({ value }) => value.toLowerCase() === answers[0].toLowerCase());
        assert.ok(option, `option ${id}`);
        el.value = option.value;
      } else if (el) el.value = answers[0];
      else {
        const radio = [...document.getElementsByName(id)].find(({ value }) => value.toLowerCase() === answers[0].toLowerCase());
        assert.ok(radio, `radio ${id}`);
        radio.checked = true;
      }
    }
    document.getElementById('W_Q9').value = 'A personal response in English.';
    window.submitTest();
    assert.ok(document.getElementById('scoreText').textContent.endsWith(`${count} / ${count}`));
    assert.equal(document.getElementById('accuracyText').textContent, 'Tỷ lệ đúng: 100%');
    assert.match(document.getElementById('writingContent').textContent, /A personal response in English\./);
    assert.doesNotMatch(document.body.textContent, oldScript);
    assert.equal(document.querySelectorAll('.rubric-row input').length, 8);
  });
}

test('four localized listening parts keep their English transcripts, clocks and audio identities', async () => {
  const expected = [56, 36, 73, 34];
  for (let i = 0; i < expected.length; i += 1) {
    const part = i + 1;
    const id = `cam10-t1-p${part}`;
    const data = JSON.parse(await source(`library/practice/jingting/data/${id}.json`));
    assert.equal(data.id, id);
    assert.equal(data.audioUrl, `library/mock/cambridge-listening/ielts10_test1_audio${part}.mp3`);
    assert.equal(data.sentences.length, expected[i]);
    for (const { en, vi, start, end } of data.sentences) {
      assert.ok(en.length && vi.length && start >= 0 && end >= start);
      assert.doesNotMatch(vi, oldScript);
    }
  }
});

for (const [lang, line] of [['vi', 'Xin chào.'], ['zh', '早上好。']]) {
  test(`intensive listening identifies the ${lang} transcript and reveals it in both modes`, async (t) => {
    const dom = new JSDOM(await source('jingting-player.html'), { url: 'https://example.test/project/jingting-player.html', runScripts: 'outside-only' });
    const { window } = dom;
    const { document } = window;
    t.after(() => window.close());
    window.Element.prototype.scrollIntoView = () => {};
    window.HTMLMediaElement.prototype.pause = () => {};
    window.fetch = async () => ({ ok: true, json: async () => ({
      title: 'Cambridge IELTS', audioUrl: 'audio.mp3', examHref: 'exam.html',
      sentences: [{ en: 'Good morning.', [lang]: line, start: 3, end: 5 }],
    }) });
    window.eval(await source('assets/js/jingting-player.js'));
    await new Promise((resolve) => setImmediate(resolve));
    const toggle = document.getElementById('jtShowZh');
    assert.equal(toggle.textContent, lang === 'vi' ? 'Bản dịch tiếng Việt' : 'Bản dịch gốc (tiếng Trung)');
    toggle.click();
    assert.equal(toggle.getAttribute('aria-pressed'), 'true');
    assert.equal(document.querySelector('.jt-full-zh').lang, lang);
    assert.equal(document.querySelector('.jt-full-zh').textContent, line);
    document.querySelector('[data-mode="line"]').click();
    assert.equal(document.getElementById('jtLineZh').lang, lang);
    assert.equal(document.getElementById('jtLineZh').textContent, line);
  });
}

test('the API asks for Vietnamese coaching but keeps examiner turns, answers and protocol keys in English', async () => {
  // Test the real pure prompt builders without starting Express, SQLite or a paid AI call.
  const src = await source('server/server.js');
  const decls = parse(src, { ecmaVersion: 2022 }).body.filter((n) => n.type === 'FunctionDeclaration');
  function load(name) {
    const node = decls.find((n) => n.id.name === name);
    return new Script(`(${src.slice(node.start, node.end)})`).runInNewContext();
  }
  const tutor = load('buildTutorSystem');
  assert.match(tutor('tutor'), /Explain in Vietnamese/);
  assert.match(tutor('examiner', 'part2'), /Speak ONLY in English/);
  assert.match(tutor('examiner', 'full', { examMode: 'mock', part1: [] }), /SCORE_JSON:/);
  for (const type of ['task1', 'task2']) {
    const prompt = load('buildWritingGradeSystem')(type, 'An English question.', '');
    assert.match(prompt, /in Vietnamese; quote student English/);
    assert.match(prompt, /WRITING_JSON:/);
    assert.doesNotMatch(prompt, oldScript);
  }
  assert.match(load('buildWordLookupSystem')(), /WORD_JSON:.*meaning/);
});
