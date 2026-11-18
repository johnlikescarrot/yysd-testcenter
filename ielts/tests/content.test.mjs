import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { test } from 'node:test';
import guides from '../content/guides.json' with { type: 'json' };
import references from '../content/references.json' with { type: 'json' };
import { graded, lessons, skills, units } from '../site/catalog.mjs';
import { citationIds, pages } from '../scripts/pages.mjs';

const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const foreignScript = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Cyrillic}\p{Script=Arabic}\p{Script=Thai}]/u;

test('mỗi chặng có đủ bốn kỹ năng, ngữ liệu và đáp án không trùng ID', async () => {
  const ids = new Set();
  const itemIds = new Set();
  for (const [index] of units.entries()) {
    const group = lessons.filter((lesson) => lesson.unit === index + 1);
    assert.deepEqual(group.map((lesson) => lesson.skill), Object.keys(skills));
  }
  for (const lesson of lessons) {
    assert.ok(!ids.has(lesson.id) && idPattern.test(lesson.id));
    ids.add(lesson.id);
    assert.ok(lesson.title && lesson.intro && lesson.items.length >= 3);
    if (lesson.skill === 'listen') {
      assert.match(lesson.source.audio, /^[a-z-]+\.mp3$/);
      assert.ok(lesson.source.body.length);
      await access(new URL(`../site/media/${lesson.source.audio}`, import.meta.url));
    }
    for (const item of lesson.items) {
      assert.ok(!itemIds.has(item.id) && idPattern.test(item.id));
      itemIds.add(item.id);
      assert.ok(item.prompt && item.explain);
      assert.ok(['choice', 'input', 'write', 'speak'].includes(item.kind));
      if (graded(item)) {
        assert.ok(item.answers.length && item.answers.every(Boolean));
        if (item.kind === 'choice') {
          assert.equal(new Set(item.options).size, item.options.length);
          assert.ok(item.answers.every((answer) => item.options.includes(answer)));
        }
      } else {
        assert.ok(item.model && !item.answers);
      }
    }
  }
});

test('nguồn trích dẫn khớp với PDF và HTML; kiểm tra mọi trang Việt hóa', () => {
  const all = pages();
  const cited = new Set();
  const dois = new Set();
  for (const guide of guides) {
    assert.match(guide.id, idPattern);
    const html = all.get(`${guide.id}.html`);
    const ids = citationIds(guide);
    assert.ok(ids.length >= 5);
    for (const id of ids) {
      const ref = references[id];
      assert.ok(ref?.title && ref.authors, id);
      cited.add(id);
      assert.ok(html.includes(`href="#ref-${id}"`) && html.includes(`id="ref-${id}"`));
      if (ref.doi) {
        assert.match(ref.doi, /^10\.\d{4,9}\/\S+$/);
        assert.ok(html.includes(`https://doi.org/${ref.doi}`));
        dois.add(ref.doi);
      } else {
        assert.match(ref.url, /^https:\/\/ielts\.org\//);
        assert.ok(html.includes(ref.url));
      }
    }
    assert.equal((html.match(/https:\/\/scholar\.google\.com\/scholar\?/g) ?? []).length, ids.filter((id) => references[id].doi).length);
    assert.ok(all.get('resources.html').includes(`href="pdf/${guide.id}.pdf"`));
  }
  assert.equal(cited.size, Object.keys(references).length);
  assert.ok(dois.size >= 19);
  for (const html of all.values()) {
    assert.match(html, /<html lang="vi">/);
    assert.doesNotMatch(html, foreignScript);
    assert.ok(!html.includes('href="/') && !html.includes('src="/'), 'URL tương đối cho GitHub Pages');
  }
  assert.doesNotMatch(JSON.stringify(lessons), foreignScript);
});
