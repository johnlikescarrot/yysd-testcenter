import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { PDFDocument, PDFName } from 'pdf-lib';
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
    const bytes = await readFile(source(`resources/${slug}.pdf`));
    const pdf = await PDFDocument.load(bytes);
    const uris = new Set();
    for (const page of pdf.getPages()) {
      for (const ref of page.node.Annots()?.asArray() ?? []) {
        const annotation = pdf.context.lookup(ref);
        const action = annotation.lookup(PDFName.of('A'));
        const uri = action?.lookup(PDFName.of('URI'));
        if (uri) uris.add(uri.decodeText());
      }
    }
    const dom = new JSDOM(raw, { url: 'https://example.test/resources/' });
    const { document } = dom.window;
    assert.doesNotMatch(raw, scriptsOutsideScope);
    assert.equal(document.documentElement.lang, 'vi');
    assert.equal(pdf.catalog.lookup(PDFName.of('Lang')).decodeText(), 'vi-VN');
    assert.equal(pdf.getPageCount(), pages.length + 1);
    assert.ok(bytes.length < 100_000);
    for (const link of document.querySelectorAll('section a[href^="#nguon-"]')) {
      assert.ok(document.getElementById(link.hash.slice(1)), `broken citation: ${link.hash}`);
    }
    assert.equal(document.querySelectorAll('.references li').length, sources.length);
    for (const [index, entry] of sources.entries()) {
      const id = `nguon-${index + 1}`;
      const sourceEntry = document.getElementById(id);
      assert.ok(document.querySelector(`section a[href="#${id}"]`), `no in-text citation for ${id}`);
      if (entry.doi) {
        assert.equal(sourceEntry.querySelector('span').lang, 'en');
        assert.ok(sourceEntry.querySelector(`a[href="https://doi.org/${entry.doi}"]`));
        assert.ok(sourceEntry.querySelector(`a[href="${scholarLink(entry.doi)}"]`));
        assert.ok(uris.has(`https://doi.org/${entry.doi}`));
        assert.ok(uris.has(scholarLink(entry.doi)));
      } else {
        assert.ok(sourceEntry.querySelector(`a[href="${entry.url}"]`));
        assert.ok(uris.has(entry.url));
      }
    }
    dom.window.close();
  });
}
