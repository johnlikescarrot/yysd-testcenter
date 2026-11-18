import { describe, it, expect } from 'vitest';
import { loadState, saveState, STORAGE_KEY } from '../docs/js/storage.js';

const DAY = '2026-11-18';

function memory(initial) {
  return {
    data: initial === undefined ? {} : { [STORAGE_KEY]: initial },
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(this.data, key) ? this.data[key] : null;
    },
    setItem(key, value) {
      this.data[key] = value;
    }
  };
}

describe('lưu trữ cục bộ', () => {
  it('trả về trạng thái mặc định khi chưa có dữ liệu', () => {
    expect(loadState(memory(), DAY).xp).toBe(0);
  });

  it('trả về mặc định khi bộ nhớ phát sinh lỗi', () => {
    const broken = {
      getItem() {
        throw new Error('blocked');
      }
    };
    expect(loadState(broken, DAY).day).toBe(DAY);
  });

  it('trả về mặc định khi JSON hỏng hoặc sai kiểu', () => {
    expect(loadState(memory('{oops'), DAY).xp).toBe(0);
    expect(loadState(memory('null'), DAY).xp).toBe(0);
    expect(loadState(memory('"text"'), DAY).xp).toBe(0);
    expect(loadState(memory('{"xp":"nope"}'), DAY).xp).toBe(0);
  });

  it('khôi phục trạng thái hợp lệ', () => {
    const saved = JSON.stringify({
      xp: 42,
      streak: 7,
      hearts: 3,
      goalIndex: 1,
      cards: [],
      answered: 5,
      correct: 4
    });
    const state = loadState(memory(saved), DAY);
    expect(state.xp).toBe(42);
    expect(state.streak).toBe(7);
    expect(state.day).toBe(DAY);
    expect(state.friendStreak).toBe(false);
  });

  it('ghi thành công và xử lý lỗi khi ghi', () => {
    const store = memory();
    expect(saveState(store, { xp: 3 })).toBe(true);
    expect(JSON.parse(store.getItem(STORAGE_KEY)).xp).toBe(3);
    const broken = {
      setItem() {
        throw new Error('quota');
      }
    };
    expect(saveState(broken, { xp: 3 })).toBe(false);
  });
});
