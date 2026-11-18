import assert from 'node:assert/strict';
import test from 'node:test';
import { loadWorkbooks, parseWorkbook } from '../workbooks.mjs';

for (const [skill, total, topics] of [['listening', 257, 8], ['reading', 331, 10], ['writing', 398, 14]]) {
  test(`publishes every ${skill} entry with its original English example`, async () => {
    const books = await loadWorkbooks(skill);
    assert.equal(new Set(books.map((b) => b.number)).size, topics);
    const entries = books.flatMap(({ rows }) => rows);
    assert.equal(entries.length, total);
    for (const row of entries) {
      assert.ok(row.term && row.example && row.meaning);
      assert.doesNotMatch(row.term, /\p{Script=Han}/u);
      if (skill === 'writing') assert.ok(row.note);
    }
  });
}

test('a source workbook is parsed as data, never executed, and missing translations stop the build', () => {
  const header = '<meta name="exam:title" content="Bài 01 · Chủ đề">\nconst wordData = ';
  const record = "{word:'Loan', meaning:'khoản vay', example:'I need a loan.'}";
  const read = (html) => parseWorkbook(html, 'reading', 'example.html');
  assert.equal(read(`${header}[${record}]; throw new Error('must not run');`).rows[0].term, 'Loan');
  assert.throws(() => read(''), /Missing/);
  assert.throws(() => read(`${header}[];`), /invalid workbook/);
  assert.throws(() => read(`${header}[{...someVariable}];`), /Non-literal/);
  assert.throws(() => read(`${header}[${record.replace("'khoản vay'", 'lookup()')}];`), /localized string/);
  assert.throws(() => read(`${header}[${record.replace('khoản vay', '贷款')}];`), /localized string/);
});
