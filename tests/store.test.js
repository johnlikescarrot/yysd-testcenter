import { describe, expect, it, vi } from "vitest";
import {
  HEART_MAX,
  STATE_VERSION,
  STORAGE_KEY,
  createStore,
  defaultState,
  hydrate,
  loadState,
  saveState
} from "../vi/assets/js/store.js";

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value);
    },
    data
  };
}

describe("defaultState", () => {
  it("khởi tạo đúng giá trị", () => {
    const state = defaultState(new Date(2026, 10, 18));
    expect(state.version).toBe(STATE_VERSION);
    expect(state.hearts).toBe(HEART_MAX);
    expect(state.todayKey).toBe("2026-11-18");
    expect(state.dailyGoal).toBe(50);
    expect(state.readDocs).toEqual([]);
  });
});

describe("hydrate", () => {
  it("bỏ dữ liệu không phải object", () => {
    const state = hydrate(null, new Date(2026, 0, 1));
    expect(state.xp).toBe(0);
    expect(state.todayKey).toBe("2026-01-01");
  });

  it("bỏ dữ liệu sai phiên bản", () => {
    const state = hydrate({ version: 999, xp: 500 }, new Date(2026, 0, 1));
    expect(state.xp).toBe(0);
  });

  it("giữ trường hợp lệ và bỏ trường sai kiểu", () => {
    const stored = {
      ...defaultState(new Date(2026, 0, 1)),
      xp: 123,
      name: "Lan",
      completed: { u1l1: true },
      srs: { q1: { id: "q1" } },
      hearts: 99,
      streak: "không phải số",
      badges: ["first-lesson"],
      readDocs: ["doc"]
    };
    const state = hydrate(stored, new Date(2026, 0, 1));
    expect(state.xp).toBe(123);
    expect(state.name).toBe("Lan");
    expect(state.completed).toEqual({ u1l1: true });
    expect(state.srs).toEqual({ q1: { id: "q1" } });
    expect(state.hearts).toBe(HEART_MAX);
    expect(state.streak).toBe(0);
    expect(state.badges).toEqual(["first-lesson"]);
    expect(state.readDocs).toEqual(["doc"]);
  });

  it("không cho tim âm", () => {
    const stored = { ...defaultState(), hearts: -4 };
    expect(hydrate(stored).hearts).toBe(0);
  });
});

describe("loadState / saveState", () => {
  it("storage không hợp lệ", () => {
    expect(loadState(null).xp).toBe(0);
    expect(loadState({}).xp).toBe(0);
    expect(saveState(null, {})).toBe(false);
  });

  it("đọc và ghi thành công", () => {
    const storage = memoryStorage();
    const state = defaultState();
    state.xp = 77;
    expect(saveState(storage, state)).toBe(true);
    expect(loadState(storage).xp).toBe(77);
    expect(storage.data[STORAGE_KEY]).toContain("\"xp\":77");
  });

  it("dữ liệu hỏng quay về mặc định", () => {
    const storage = memoryStorage({ [STORAGE_KEY]: "{không phải json" });
    expect(loadState(storage).xp).toBe(0);
  });

  it("không có dữ liệu thì trả mặc định", () => {
    expect(loadState(memoryStorage()).xp).toBe(0);
  });

  it("ghi lỗi trả false", () => {
    const storage = {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota");
      }
    };
    expect(saveState(storage, defaultState())).toBe(false);
  });
});

describe("createStore", () => {
  it("cập nhật bằng object và hàm", () => {
    const store = createStore({ storage: memoryStorage() });
    store.update({ xp: 10 });
    expect(store.get().xp).toBe(10);
    store.update((state) => ({ ...state, xp: state.xp + 5 }));
    expect(store.get().xp).toBe(15);
  });

  it("update trả undefined thì giữ bản nháp", () => {
    const store = createStore();
    store.update((draft) => {
      draft.xp = 42;
      return undefined;
    });
    expect(store.get().xp).toBe(42);
  });

  it("bảo vệ completed và srs khỏi giá trị xấu", () => {
    const store = createStore();
    store.update({ completed: [], srs: "xấu" });
    expect(store.get().completed).toEqual({});
    expect(store.get().srs).toEqual({});
  });

  it("subscribe nhận cập nhật và unsubscribe hoạt động", () => {
    const store = createStore();
    const listener = vi.fn();
    const off = store.subscribe(listener);
    store.update({ xp: 1 });
    expect(listener).toHaveBeenCalledTimes(1);
    off();
    store.update({ xp: 2 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("reset xoá tiến độ và lưu", () => {
    const storage = memoryStorage();
    const store = createStore({ storage });
    store.update({ xp: 200 });
    const state = store.reset();
    expect(state.xp).toBe(0);
    expect(loadState(storage).xp).toBe(0);
  });

  it("không có storage vẫn chạy", () => {
    const store = createStore({ storage: null });
    expect(store.update({ xp: 3 }).xp).toBe(3);
  });
});
