import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import { guides, scholarLink } from '../materials.mjs';

const source = (path) => new URL(`../../ielts-vi/${path}`, import.meta.url);
const scriptsOutsideScope = /[\p{Script=Han}\p{Script=Kana}\p{Script=Hira}\p{Script=Hangul}\p{Script=Cyrillic}\p{Script=Arabic}]/u;

test('the published app declares Vietnamese and avoids untranslated legacy scripts', async () => {
  for (const path of ['index.html', 'assets/course.js', 'assets/study.js', 'assets/progress.js']) {
    const raw = await readFile(source(path), 'utf8');
    assert.doesNotMatch(raw, scriptsOutsideScope, path);
  }
  const dom = new JSDOM(await readFile(source('index.html'), 'utf8'));
  assert.equal(dom.window.document.documentElement.lang, 'vi');
  for (const { slug } of guides) {
    assert.ok(dom.window.document.querySelector(`a[download][href="resources/${slug}.pdf"]`));
    assert.ok(dom.window.document.querySelector(`a[href="resources/${slug}.html"]`));
  }
  dom.window.close();
});

for (const { slug, sources, pages } of guides) {
  test(`${slug}: short PDF, correctly linked references, and matching accessible HTML`, async () => {
    const raw = await readFile(source(`resources/${slug}.html`), 'utf8');
    const pdf = await readFile(source(`resources/${slug}.pdf`), 'latin1');
    const dom = new JSDOM(raw, { url: 'https://example.test/resources/' });
    const { document } = dom.window;
    assert.doesNotMatch(raw, scriptsOutsideScope);
    assert.equal(document.documentElement.lang, 'vi');
    assert.match(pdf, /^%PDF-/);
    assert.match(pdf, /\/Lang \(vi-VN\)/);
    assert.equal([...pdf.matchAll(/\/Type \/Page\b/g)].length, pages.length + 1);
    assert.ok(pdf.length < 100_000);
    assert.equal(document.querySelectorAll('.references li').length, sources.length);
    for (const [index, entry] of sources.entries()) {
      const id = `nguon-${index + 1}`;
      const sourceEntry = document.getElementById(id);
      assert.ok(document.querySelector(`section a[href="#${id}"]`), `no in-text citation for ${id}`);
      if (entry.doi) {
        assert.equal(sourceEntry.querySelector('span').lang, 'en');
        assert.ok(sourceEntry.querySelector(`a[href="https://doi.org/${entry.doi}"]`));
        assert.ok(sourceEntry.querySelector(`a[href="${scholarLink(entry.doi)}"]`));
        assert.ok(pdf.includes(`https://doi.org/${entry.doi}`));
        assert.ok(pdf.includes(scholarLink(entry.doi)));
      } else {
        assert.ok(sourceEntry.querySelector(`a[href="${entry.url}"]`));
        assert.ok(pdf.includes(entry.url));
      }
    }
    dom.window.close();
  });
}
