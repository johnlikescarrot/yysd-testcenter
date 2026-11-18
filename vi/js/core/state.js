/**
 * Trạng thái người học: khởi tạo, lưu/khôi phục, ghi nhận kết quả học,
 * thành tựu và nhiệm vụ. Mọi hàm đều thuần tuý (storage được tiêm vào).
 */

import { dayKey, weekKey, DAY_MS } from './date.js';
import {
  MAX_HEARTS,
  STARTING_GEMS,
  HEART_REGEN_MS,
  regenHearts,
  registerStudyDay,
  lessonXp,
} from './gamify.js';
import { sessionScore } from './quiz.js';
import { newCard, schedule } from './srs.js';
import { dailyQuests, applyQuestProgress, claimRewards } from './quests.js';

export const STORAGE_KEY = 'yysd:ielts-vi:v1';
export const SCHEMA_VERSION = 1;
export const GOALS = [20, 40, 60, 100];
export const HISTORY_LIMIT = 180;

const isRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export const ACHIEVEMENTS = [
  { id: 'first-lesson', title: 'Bước đầu tiên', desc: 'Hoàn thành bài học đầu tiên', icon: 'spark', gems: 20,
    test: (s) => Object.keys(s.lessonsDone || {}).length >= 1 },
  { id: 'five-lessons', title: 'Vào guồng', desc: 'Hoàn thành 5 bài học', icon: 'book', gems: 20,
    test: (s) => Object.keys(s.lessonsDone || {}).length >= 5 },
  { id: 'ten-lessons', title: 'Mười bước tiến', desc: 'Hoàn thành 10 bài học', icon: 'book', gems: 30,
    test: (s) => Object.keys(s.lessonsDone || {}).length >= 10 },
  { id: 'streak-3', title: 'Ba ngày bền bỉ', desc: 'Giữ chuỗi 3 ngày', icon: 'flame', gems: 20,
    test: (s) => s.streak >= 3 },
  { id: 'streak-7', title: 'Một tuần không nghỉ', desc: 'Giữ chuỗi 7 ngày', icon: 'flame', gems: 30,
    test: (s) => s.streak >= 7 },
  { id: 'streak-30', title: 'Ba mươi ngày', desc: 'Giữ chuỗi 30 ngày', icon: 'flame', gems: 50,
    test: (s) => s.streak >= 30 },
  { id: 'xp-500', title: 'Năm trăm XP', desc: 'Tích luỹ 500 XP', icon: 'bolt', gems: 25,
    test: (s) => s.xp >= 500 },
  { id: 'xp-1500', title: 'Một nghìn rưỡi XP', desc: 'Tích luỹ 1.500 XP', icon: 'bolt', gems: 40,
    test: (s) => s.xp >= 1500 },
  { id: 'perfect-5', title: 'Năm lần hoàn hảo', desc: 'Đạt 100% ở 5 bài học', icon: 'crown', gems: 30,
    test: (s) => (s.perfectLessons || 0) >= 5 },
  { id: 'combo-10', title: 'Chuỗi mười câu', desc: 'Đúng liên tiếp 10 câu', icon: 'check', gems: 25,
    test: (s) => (s.bestCombo || 0) >= 10 },
  { id: 'deck-40', title: 'Kho thẻ cá nhân', desc: 'Có 40 thẻ từ vựng', icon: 'cards', gems: 25,
    test: (s) => Object.keys(s.cards || {}).length >= 40 },
  { id: 'unit-1', title: 'Chinh phục chương đầu', desc: 'Hoàn thành một đơn vị học', icon: 'flag', gems: 35,
    test: (s) => Object.keys(s.unitsDone || {}).length >= 1 },
  { id: 'review-100', title: 'Trăm lần ôn tập', desc: 'Ôn tập 100 lượt thẻ', icon: 'repeat', gems: 30,
    test: (s) => (s.reviews || 0) >= 100 },
];

/** Trạng thái mặc định của một người học mới. */
export function createInitialState(now = Date.now()) {
  return {
    version: SCHEMA_VERSION,
    createdAt: now,
    profile: { name: 'Bạn' },
    goal: 40,
    xp: 0,
    gems: STARTING_GEMS,
    hearts: MAX_HEARTS,
    heartsUpdatedAt: now,
    combo: 0,
    bestCombo: 0,
    streak: 0,
    longestStreak: 0,
    lastStudyDay: null,
    freezes: 1,
    freezeUsedDay: null,
    streakRepairs: 0,
    lessonsDone: {},
    unitsDone: {},
    perfectLessons: 0,
    reviews: 0,
    skills: {},
    cards: {},
    quests: { day: null, items: [] },
    achievements: {},
    history: [],
    settings: { sound: true, reminders: true },
    seenIntro: false,
  };
}

/** Hợp nhất dữ liệu cũ vào lược đồ hiện tại. */
export function migrate(raw, now = Date.now()) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return createInitialState(now);
  const base = createInitialState(now);
  const state = {
    ...base,
    ...raw,
    profile: { ...base.profile, ...(isRecord(raw.profile) ? raw.profile : {}) },
    settings: { ...base.settings, ...(isRecord(raw.settings) ? raw.settings : {}) },
    quests: raw.quests && Array.isArray(raw.quests.items) ? raw.quests : base.quests,
    history: Array.isArray(raw.history) ? raw.history.filter((entry) => entry && typeof entry.day === 'string') : [],
    cards: isRecord(raw.cards) ? raw.cards : {},
    skills: isRecord(raw.skills) ? raw.skills : {},
    lessonsDone: isRecord(raw.lessonsDone) ? raw.lessonsDone : {},
    unitsDone: isRecord(raw.unitsDone) ? raw.unitsDone : {},
    achievements: isRecord(raw.achievements) ? raw.achievements : {},
  };
  state.version = SCHEMA_VERSION;
  state.history = state.history.sort((a, b) => a.day.localeCompare(b.day)).slice(-HISTORY_LIMIT);
  return state;
}

/** Đọc trạng thái từ storage (ví dụ localStorage). */
export function loadState(storage, now = Date.now()) {
  if (!storage || typeof storage.getItem !== 'function') {
    return { state: createInitialState(now), restored: false, error: false };
  }
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return { state: createInitialState(now), restored: false, error: false };
    return { state: migrate(JSON.parse(raw), now), restored: true, error: false };
  } catch {
    return { state: createInitialState(now), restored: false, error: true };
  }
}

/** Ghi trạng thái; trả về true nếu thành công. */
export function saveState(storage, state) {
  if (!storage || typeof storage.setItem !== 'function') return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

/** Xuất tiến độ thành chuỗi JSON để sao lưu. */
export function exportState(state, now = Date.now()) {
  return JSON.stringify({ app: 'yysd-ielts-vi', version: SCHEMA_VERSION, exportedAt: now, state }, null, 2);
}

/** Nhập tiến độ từ chuỗi JSON đã sao lưu. */
export function importState(text, now = Date.now()) {
  try {
    const parsed = JSON.parse(text);
    const raw = parsed && typeof parsed === 'object' && parsed.state ? parsed.state : parsed;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return { ok: false, state: null, message: 'Tệp sao lưu không đúng định dạng.' };
    }
    return { ok: true, state: migrate(raw, now), message: 'Đã khôi phục tiến độ từ tệp sao lưu.' };
  } catch {
    return { ok: false, state: null, message: 'Không đọc được tệp. Hãy chọn tệp JSON do ứng dụng xuất ra.' };
  }
}

/** Bản ghi lịch sử của hôm nay. */
export function todayEntry(state, now) {
  const day = dayKey(now);
  return (state.history || []).find((entry) => entry.day === day) || { day, xp: 0, lessons: 0, correct: 0, total: 0 };
}

/** Cập nhật (hoặc thêm) bản ghi lịch sử của một ngày. */
export function bumpHistory(history, day, delta) {
  const list = Array.isArray(history) ? [...history] : [];
  const index = list.findIndex((entry) => entry.day === day);
  if (index < 0) {
    list.push({ day, xp: 0, lessons: 0, correct: 0, total: 0, ...delta });
  } else {
    list[index] = {
      ...list[index],
      xp: (list[index].xp || 0) + (delta.xp || 0),
      lessons: (list[index].lessons || 0) + (delta.lessons || 0),
      correct: (list[index].correct || 0) + (delta.correct || 0),
      total: (list[index].total || 0) + (delta.total || 0),
    };
  }
  return list.sort((a, b) => a.day.localeCompare(b.day)).slice(-HISTORY_LIMIT);
}

/** Làm mới trạng thái khi mở ứng dụng: hồi tim, nhiệm vụ ngày, lịch sử. */
export function touchState(state, now = Date.now()) {
  let next = regenHearts(state, now);
  const day = dayKey(now);
  if (next.quests.day !== day) {
    next = { ...next, quests: { day, items: dailyQuests(day) } };
  }
  if (!next.history.some((entry) => entry.day === day)) {
    next = { ...next, history: bumpHistory(next.history, day, {}) };
  }
  return next;
}

/** XP hôm nay. */
export function todayXp(state, now) {
  return todayEntry(state, now).xp || 0;
}

/** Tỉ lệ hoàn thành mục tiêu ngày (0..1). */
export function goalProgress(state, now) {
  const goal = state.goal || 40;
  return { xp: todayXp(state, now), goal, ratio: Math.min(1, todayXp(state, now) / goal), reached: todayXp(state, now) >= goal };
}

/** XP trong tuần hiện tại. */
export function weekXp(state, now) {
  const week = weekKey(now);
  return (state.history || [])
    .filter((entry) => weekKey(`${entry.day}T12:00:00`) === week)
    .reduce((sum, entry) => sum + (entry.xp || 0), 0);
}

/** Số ngày đã học (có XP). */
export function studyDayCount(state) {
  return (state.history || []).filter((entry) => (entry.xp || 0) > 0).length;
}

/** Đổi mục tiêu ngày; chỉ nhận các giá trị trong GOALS. */
export function setGoal(state, goal) {
  return GOALS.includes(goal) ? { ...state, goal } : state;
}

/** Bật/tắt một cài đặt. */
export function toggleSetting(state, key) {
  if (!(key in state.settings)) return state;
  return { ...state, settings: { ...state.settings, [key]: !state.settings[key] } };
}

/** Mở khoá thành tựu mới và cộng đá quý thưởng. */
export function unlockAchievements(state, now = Date.now()) {
  const achievements = { ...state.achievements };
  let gems = state.gems;
  const unlocked = [];
  for (const achievement of ACHIEVEMENTS) {
    if (achievements[achievement.id]) continue;
    if (achievement.test(state)) {
      achievements[achievement.id] = now;
      gems += achievement.gems;
      unlocked.push(achievement);
    }
  }
  return { state: { ...state, achievements, gems }, unlocked };
}

/** Ghi nhận kết quả một bài học và mọi hệ quả (XP, chuỗi, nhiệm vụ, thành tựu). */
export function recordLesson(state, { unit, lesson, results, now }) {
  const base = touchState(state, now);
  const score = sessionScore(results);
  const xp = lessonXp({ baseXp: lesson.xp, correct: score.correct, total: score.total, combo: score.bestCombo });
  const gems = score.passed ? Math.max(2, Math.round(xp / 4)) : 2;
  const day = dayKey(now);

  let next = {
    ...base,
    xp: base.xp + xp,
    gems: base.gems + gems,
    hearts: base.hearts,
    combo: 0,
    lessonsDone: {
      ...base.lessonsDone,
      [lesson.id]: { correct: score.correct, total: score.total, accuracy: score.accuracy, at: now },
    },
    perfectLessons: (base.perfectLessons || 0) + (score.total > 0 && score.correct === score.total ? 1 : 0),
    history: bumpHistory(base.history, day, { xp, lessons: 1, correct: score.correct, total: score.total }),
  };

  next = registerStudyDay(next, now);

  next = {
    ...next,
    quests: {
      ...next.quests,
      items: applyQuestProgress(next.quests.items, {
        xp,
        lessons: 1,
        correct: score.correct,
        combo: score.bestCombo,
      }),
    },
  };

  const reward = claimRewards(next.quests.items);
  next = { ...next, gems: next.gems + reward.gems, quests: { ...next.quests, items: reward.quests } };

  const unitLessons = unit?.lessons || [];
  const unitDone = unitLessons.length > 0 && unitLessons.every((item) => next.lessonsDone[item.id]);
  if (unitDone && !next.unitsDone[unit.id]) {
    next = { ...next, unitsDone: { ...next.unitsDone, [unit.id]: now } };
  }

  const outcome = unlockAchievements(next, now);
  return { state: outcome.state, unlocked: outcome.unlocked, score, xp, gems };
}

/** Ghi nhận một lượt ôn thẻ từ vựng. */
export function recordReview(state, cardId, grade, now) {
  const card = state.cards[cardId] || newCard(now);
  const nextCard = schedule(card, grade, now);
  const base = touchState(state, now);
  const items = applyQuestProgress(base.quests.items, { review: 1 });
  const reward = claimRewards(items);
  return {
    ...base,
    cards: { ...base.cards, [cardId]: nextCard },
    reviews: (base.reviews || 0) + 1,
    gems: base.gems + reward.gems,
    quests: { ...base.quests, items: reward.quests },
  };
}

/** Nhãn đếm ngược hồi tim, dùng ở thanh trên. */
export function heartRegenMs(state, now) {
  if (state.hearts >= MAX_HEARTS) return 0;
  const elapsed = Math.max(0, now - (state.heartsUpdatedAt || now));
  return Math.max(0, HEART_REGEN_MS - (elapsed % HEART_REGEN_MS));
}

/** Xoá dữ liệu học (dùng khi người học chọn bắt đầu lại). */
export function resetState(now = Date.now()) {
  return { ...createInitialState(now), createdAt: now, heartsUpdatedAt: now };
}

export { DAY_MS };
