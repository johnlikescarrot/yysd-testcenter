import test from 'node:test';
import assert from 'node:assert/strict';
import {
  scholarUrl, doiUrl, searchPapers, tagsOf, libraryStats, sortPapers, citationsFor, apaLine,
} from '../js/core/papers.js';
import { PAPERS, DOCS } from './helpers/fixtures.mjs';

test('scholarUrl mã hoá truy vấn', () => {
  const url = scholarUrl('Distributed practice', 'Cepeda');
  assert.match(url, /^https:\/\/scholar\.google\.com\/scholar\?q=/);
  assert.ok(url.includes('Distributed%20practice'));
  assert.ok(scholarUrl('Only title').includes('Only%20title'));
  assert.ok(scholarUrl(null, 'Author').includes('Author'));
});

test('doiUrl trả null khi không có DOI', () => {
  assert.equal(doiUrl('10.1/x'), 'https://doi.org/10.1/x');
  assert.equal(doiUrl(null), null);
  assert.equal(doiUrl(undefined), null);
});

test('searchPapers lọc theo truy vấn không dấu và nhãn', () => {
  assert.equal(searchPapers(PAPERS, '', 'all').length, PAPERS.length);
  assert.deepEqual(searchPapers(PAPERS, 'cepeda').map((p) => p.id), ['p1']);
  assert.deepEqual(searchPapers(PAPERS, 'tu vung').map((p) => p.id), ['p2']);
  assert.deepEqual(searchPapers(PAPERS, '', 'phuong-phap').map((p) => p.id), ['p1', 'p3']);
  assert.deepEqual(searchPapers(PAPERS, 'khong co', 'all'), []);
  assert.deepEqual(searchPapers(null, '', 'all'), []);
});

test('tagsOf đếm và sắp xếp nhãn', () => {
  const tags = tagsOf(PAPERS);
  assert.deepEqual(tags[0], { id: 'phuong-phap', count: 2 });
  assert.ok(tags.some((tag) => tag.id === 'tu-vung'));
  assert.deepEqual(tagsOf(null), []);
});

test('libraryStats thống kê thư viện', () => {
  const stats = libraryStats(PAPERS, DOCS);
  assert.equal(stats.papers, 3);
  assert.equal(stats.docs, 2);
  assert.equal(stats.withDoi, 2);
  assert.equal(stats.fromYear, 2006);
  assert.equal(stats.toYear, 2006);
  const empty = libraryStats([], []);
  assert.equal(empty.fromYear, null);
  assert.equal(empty.toYear, null);
  assert.equal(libraryStats(null, null).papers, 0);
});

test('sortPapers sắp xếp mới nhất trước', () => {
  const list = [
    { year: 2001, authors: 'B' }, { year: 2020, authors: 'A' }, { year: 2001, authors: 'A' },
  ];
  assert.deepEqual(sortPapers(list).map((item) => item.authors), ['A', 'A', 'B']);
  assert.deepEqual(sortPapers(null), []);
});

test('citationsFor lọc theo tài liệu', () => {
  assert.deepEqual(citationsFor(PAPERS, 'doc-a').map((p) => p.id), ['p1', 'p2']);
  assert.deepEqual(citationsFor(PAPERS, 'doc-b').map((p) => p.id), ['p2']);
  assert.deepEqual(citationsFor(PAPERS, 'doc-z'), []);
  assert.deepEqual(citationsFor(null, 'doc-a'), []);
});

test('apaLine có và không có DOI', () => {
  const withDoi = apaLine(PAPERS[0]);
  assert.match(withDoi, /^Cepeda, N\. J\. \(2006\)\. Distributed practice\. Psychological Bulletin\./);
  assert.ok(withDoi.includes('https://doi.org/10.1037/0033-2909.132.3.354'));
  const without = apaLine(PAPERS[1]);
  assert.ok(!without.includes('doi.org'));
  assert.ok(apaLine({ year: 2020, title: 'T', authors: null }).includes('Khuyết danh'));
  assert.ok(!apaLine({ year: 2020, title: 'T', authors: 'A' }).includes('undefined'));
});
