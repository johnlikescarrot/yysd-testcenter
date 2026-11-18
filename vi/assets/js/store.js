/* =========================================================================
   store.js — trạng thái học tập, lưu bền trong localStorage.
   Thiết kế: hàm thuần cho load/save, lớp createStore bọc subscribe.
   ========================================================================= */

import { dayKey } from "./util.js";

export const STATE_VERSION = 2;
export const STORAGE_KEY = "yysd:ielts-vi:state";
export const HEART_MAX = 5;
export const HEART_REGEN_MS = 25 * 60 * 1000;

/** Trạng thái khởi tạo cho người học mới. */
function mondayKey(date) {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return dayKey(d);
}

export function defaultState(now = new Date()) {
  const today = dayKey(now);
  return {
    version: STATE_VERSION,
    name: "Người học",
    xp: 0,
    gems: 120,
    hearts: HEART_MAX,
    heartsAt: now.getTime(),
    streak: 0,
    bestStreak: 0,
    streakFreezes: 1,
    lastStudyDay: "",
    dailyGoal: 50,
    todayXp: 0,
    todayKey: today,
    weekXp: 0,
    weekStart: mondayKey(now),
    completed: {},
    srs: {},
    badges: [],
    reviews: 0,
    todayLessons: 0,
    todayCorrect: 0,
    todayAnswered: 0,
    todayReviews: 0,
    docsRead: 0,
    readDocs: []
  };
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/** Hợp nhất trạng thái đã lưu với mặc định, loại bỏ dữ liệu hỏng. */
export function hydrate(raw, now = new Date()) {
  const base = defaultState(now);
  if (!isPlainObject(raw)) return base;
  if (raw.version !== STATE_VERSION) return base;
  const merged = { ...base };
  for (const key of Object.keys(base)) {
    const value = raw[key];
    const fallback = base[key];
    if (typeof fallback === "number" && typeof value === "number" && Number.isFinite(value)) {
      merged[key] = value;
    } else if (typeof fallback === "string" && typeof value === "string") {
      merged[key] = value;
    } else if (Array.isArray(fallback) && Array.isArray(value)) {
      merged[key] = [...value];
    } else if (isPlainObject(fallback) && isPlainObject(value)) {
      merged[key] = { ...value };
    }
  }
  merged.hearts = Math.min(HEART_MAX, Math.max(0, merged.hearts));
  return merged;
}

/** Đọc trạng thái từ storage; không bao giờ ném lỗi. */
export function loadState(storage, now = new Date()) {
  if (!storage || typeof storage.getItem !== "function") return defaultState(now);
  try {
    const text = storage.getItem(STORAGE_KEY);
    if (!text) return defaultState(now);
    return hydrate(JSON.parse(text), now);
  } catch {
    return defaultState(now);
  }
}

/** Ghi trạng thái; trả về true nếu ghi thành công. */
export function saveState(storage, state) {
  if (!storage || typeof storage.setItem !== "function") return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

/** Kho trạng thái nhỏ, đồng bộ, có subscribe để UI cập nhật. */
export function createStore(options = {}) {
  const now = typeof options.now === "function" ? options.now : () => new Date();
  const storage = options.storage ?? null;
  let state = loadState(storage, now());
  const listeners = new Set();

  function emit() {
    for (const listener of listeners) listener(state);
  }

  return {
    get() {
      return state;
    },
    /** update(fn) nhận bản nháp; update(obj) gộp nông. */
    update(patch) {
      const draft = { ...state };
      const next = typeof patch === "function" ? patch(draft) : { ...draft, ...patch };
      state = next || draft;
      for (const key of ["completed", "srs"]) {
        if (!isPlainObject(state[key])) state[key] = {};
      }
      saveState(storage, state);
      emit();
      return state;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    reset() {
      state = defaultState(now());
      saveState(storage, state);
      emit();
      return state;
    }
  };
}
