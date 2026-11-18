const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../vi/core.js');

test('local calendar keys and valid dates', () => {
  assert.equal(core.dayKey(new Date(2024, 0, 2)), '2024-01-02');
  assert.match(core.dayKey(), /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(core.dayNumber('2024-02-30'), null);
  assert.equal(core.dayNumber('no'), null);
  assert.equal(core.dayNumber('2024-02-29') + 1, core.dayNumber('2024-03-01'));
});
test('rejects invalid or missing persisted data', () => {
  assert.deepEqual(core.clean(null), { xp: 0, streak: 0, lastDay: '' });
  assert.deepEqual(core.clean({ xp: -1, streak: 1.5, lastDay: 'x' }), { xp: 0, streak: 0, lastDay: '' });
  assert.deepEqual(core.record(null, 'x', 10), core.clean(null));
});
test('awards points and counts each consecutive local day once', () => {
  const first = core.record(null, '2024-02-28', 20);
  const again = core.record(first, '2024-02-28', 5);
  const next = core.record(again, '2024-02-29', 10);
  assert.deepEqual(next, { xp: 35, streak: 2, lastDay: '2024-02-29' });
  assert.equal(core.activeStreak(next, '2024-03-01'), 2);
  assert.equal(core.activeStreak(next, '2024-03-02'), 0);
  assert.equal(core.activeStreak(next, 'x'), 0);
  assert.equal(core.activeStreak(null, '2024-03-01'), 0);
  assert.deepEqual(core.record(next, '2024-03-02', -1), { xp: 35, streak: 1, lastDay: '2024-03-02' });
  assert.equal(core.record(next, '2024-02-27', 0).streak, 1);
});
test('exports the same helpers in a browser context', () => {
  const vm = require('node:vm');
  const fs = require('node:fs');
  const filename = require.resolve('../vi/core.js');
  const browser = { globalThis: {} };
  vm.runInNewContext(fs.readFileSync(filename, 'utf8'), browser, { filename });
  assert.equal(typeof browser.globalThis.IeltsCore.record, 'function');
});
