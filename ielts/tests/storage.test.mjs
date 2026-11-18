import test from 'node:test';
import assert from 'node:assert/strict';
import { memoryStorage, browserStorage, loadState, saveState } from '../assets/js/storage.mjs';

test('memoryStorage lưu, đọc, xoá và nhận seed', () => {
  const store = memoryStorage({ a: '1' });
  assert.equal(store.get('a'), '1');
  assert.equal(store.get('b'), null);
  assert.equal(store.set('b', '2'), true);
  assert.equal(store.get('b'), '2');
  assert.equal(store.remove('a'), true);
  assert.equal(store.get('a'), null);
  assert.equal(memoryStorage().get('x'), null);
});

test('browserStorage nuốt lỗi của localStorage', () => {
  const good = browserStorage({
    getItem: (k) => `v:${k}`, setItem: () => {}, removeItem: () => {}
  });
  assert.equal(good.get('a'), 'v:a');
  assert.equal(good.set('a', 'b'), true);
  assert.equal(good.remove('a'), true);
  const broken = browserStorage({
    getItem: () => { throw new Error('khoá'); },
    setItem: () => { throw new Error('đầy'); },
    removeItem: () => { throw new Error('khoá'); }
  });
  assert.equal(broken.get('a'), null);
  assert.equal(broken.set('a', 'b'), false);
  assert.equal(broken.remove('a'), false);
});

test('loadState dùng fallback khi không có storage, rỗng, hỏng hoặc lỗi đọc', () => {
  const fallback = { xp: 0, hearts: 5 };
  assert.deepEqual(loadState(null, 'k', fallback), fallback);
  assert.deepEqual(loadState(memoryStorage(), 'k', fallback), fallback);
  assert.deepEqual(loadState(memoryStorage({ k: '{"xp":9}' }), 'k', fallback), { xp: 9, hearts: 5 });
  assert.deepEqual(loadState(memoryStorage({ k: '{hỏng' }), 'k', fallback), fallback);
  const throwing = { get: () => { throw new Error('lỗi'); } };
  assert.deepEqual(loadState(throwing, 'k', fallback), fallback);
});

test('saveState trả false khi thiếu storage, lỗi ghi hoặc vòng lặp JSON', () => {
  assert.equal(saveState(null, 'k', { a: 1 }), false);
  const store = memoryStorage();
  assert.equal(saveState(store, 'k', { a: 1 }), true);
  assert.equal(store.get('k'), '{"a":1}');
  assert.equal(saveState({ set: () => { throw new Error('lỗi'); } }, 'k', {}), false);
  const cyclic = {}; cyclic.self = cyclic;
  assert.equal(saveState(store, 'k', cyclic), false);
});
