import assert from 'node:assert/strict';
import test from 'node:test';
import profileName from '../../server/profile-name.js';

test('server accepts real Vietnamese display names, preserves existing scripts and enforces the character limit', () => {
  for (const name of ['Nguyễn Đình An', 'Lê Trà My', '王小明', 'Lan·7_A-B.C']) {
    assert.deepEqual(profileName(` ${name.normalize('NFD')} `), { value: name });
  }
  assert.deepEqual(profileName('ệ'.repeat(20).normalize('NFD')), { value: 'ệ'.repeat(20) });
  for (const invalid of [null, 'A', 'x'.repeat(21), 'Linh/An', 'Mai\nAn']) assert.ok(profileName(invalid).error);
});
