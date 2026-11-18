/* =========================================================================
   gamify.js — XP, tim, chuỗi ngày, giải đấu, nhiệm vụ, huy hiệu.
   Toàn bộ hàm thuần; thời gian luôn được truyền vào.
   ========================================================================= */

import { clamp, dayDiff, dayKey } from "./util.js";
import { HEART_MAX, HEART_REGEN_MS } from "./store.js";

export const LEVELS = [
  { min: 0, title: "Người mới nhập môn" },
  { min: 100, title: "Người học đều đặn" },
  { min: 300, title: "Thợ săn từ vựng" },
  { min: 600, title: "Chiến binh IELTS" },
  { min: 1000, title: "Bậc thầy học thuật" },
  { min: 1800, title: "Huyền thoại Band 9" }
];

export const LEAGUES = [
  { id: "dong", name: "Đồng", icon: "🥉", min: 0 },
  { id: "bac", name: "Bạc", icon: "🥈", min: 150 },
  { id: "vang", name: "Vàng", icon: "🥇", min: 400 },
  { id: "luc-bao", name: "Ngọc lục bảo", icon: "💚", min: 800 },
  { id: "kim-cuong", name: "Kim cương", icon: "💎", min: 1400 }
];

/** Cấp độ từ tổng XP. */
export function levelFromXp(xp) {
  const total = Math.max(0, Number(xp) || 0);
  let index = 0;
  for (let i = 0; i < LEVELS.length; i += 1) {
    if (total >= LEVELS[i].min) index = i;
  }
  const current = LEVELS[index];
  const next = LEVELS[index + 1];
  const span = next ? next.min - current.min : 1;
  const into = total - current.min;
  return {
    level: index + 1,
    title: current.title,
    into,
    span,
    nextAt: next ? next.min : current.min,
    progress: next ? Math.min(100, Math.round((into / span) * 100)) : 100
  };
}

/** Giải đấu hiện tại theo XP tuần. */
export function leagueFor(weeklyXp) {
  const xp = Math.max(0, Number(weeklyXp) || 0);
  let current = LEAGUES[0];
  for (const league of LEAGUES) {
    if (xp >= league.min) current = league;
  }
  return current;
}

/** Đồng bộ tuần: trả về trạng thái mới nếu sang tuần. */
export function rollWeek(state, now = new Date()) {
  const start = weekStartKey(now);
  if (state.weekStart === start) return state;
  return { ...state, weekStart: start, weekXp: 0 };
}

/** Thứ Hai của tuần chứa `now`. */
export function weekStartKey(now = new Date()) {
  const d = new Date(now.getTime());
  const mondayOffset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - mondayOffset);
  return dayKey(d);
}

/** Số ngày còn lại của tuần (theo lịch). */
export function daysLeftInWeek(now = new Date()) {
  return 7 - ((now.getDay() + 6) % 7);
}

/** Cập nhật tim theo thời gian: 1 tim / 25 phút, tối đa 5. */
export function refreshHearts(state, now = new Date()) {
  if (state.hearts >= HEART_MAX) {
    return { ...state, hearts: HEART_MAX, heartsAt: now.getTime() };
  }
  const elapsed = now.getTime() - (state.heartsAt || now.getTime());
  const gained = Math.floor(Math.max(0, elapsed) / HEART_REGEN_MS);
  if (gained <= 0) return state;
  const hearts = Math.min(HEART_MAX, state.hearts + gained);
  const rest = hearts === HEART_MAX ? 0 : Math.max(0, elapsed - gained * HEART_REGEN_MS);
  return { ...state, hearts, heartsAt: now.getTime() - rest };
}

/** Thời gian còn lại tới tim kế tiếp (ms). */
export function msToNextHeart(state, now = new Date()) {
  if (state.hearts >= HEART_MAX) return 0;
  const elapsed = now.getTime() - (state.heartsAt || now.getTime());
  return Math.max(0, HEART_REGEN_MS - (elapsed % HEART_REGEN_MS));
}

/** Trừ 1 tim; trả về { state, ok }. */
export function loseHeart(state, now = new Date()) {
  const fresh = refreshHearts(state, now);
  if (fresh.hearts <= 0) return { state: fresh, ok: false };
  return {
    state: { ...fresh, hearts: fresh.hearts - 1, heartsAt: fresh.heartsAt || now.getTime() },
    ok: true
  };
}

/** Dùng 50 đá quý để hồi đầy tim. */
export function refillHeartsWithGems(state, now = new Date()) {
  const COST = 50;
  if (state.gems < COST || state.hearts >= HEART_MAX) {
    return { state, ok: false };
  }
  return {
    state: { ...state, hearts: HEART_MAX, gems: state.gems - COST, heartsAt: now.getTime() },
    ok: true
  };
}

/**
 * Cập nhật chuỗi ngày sau khi học xong một bài.
 * - Cùng ngày: giữ nguyên.
 * - Hôm qua: +1.
 * - Cách > 1 ngày nhưng còn băng giữ chuỗi: dùng 1 băng, +1.
 * - Cách xa hơn: về 1.
 */
export function streakAfterStudy(state, now = new Date()) {
  const today = dayKey(now);
  if (state.lastStudyDay === today) {
    return { streak: state.streak, bestStreak: Math.max(state.bestStreak, state.streak), freezes: state.streakFreezes, usedFreeze: false };
  }
  const gap = state.lastStudyDay ? dayDiff(state.lastStudyDay, today) : Infinity;
  let freezes = state.streakFreezes;
  let usedFreeze = false;
  let streak;
  if (gap === 1) {
    streak = state.streak + 1;
  } else if (gap > 1 && gap <= 3 && freezes > 0 && state.streak > 0) {
    streak = state.streak + 1;
    freezes -= 1;
    usedFreeze = true;
  } else {
    streak = 1;
  }
  return {
    streak,
    bestStreak: Math.max(state.bestStreak || 0, streak),
    freezes,
    usedFreeze
  };
}

/** Tiến độ mục tiêu ngày. */
export function dailyGoalStatus(state) {
  const goal = Math.max(10, state.dailyGoal || 50);
  const done = Math.max(0, state.todayXp || 0);
  return { goal, done, percent: clamp(Math.round((done / goal) * 100), 0, 100), doneFlag: done >= goal };
}

export const COMBO_STEPS = [
  { min: 0, multiplier: 1 },
  { min: 3, multiplier: 1.2 },
  { min: 6, multiplier: 1.5 },
  { min: 10, multiplier: 2 }
];

/** Hệ số nhân XP theo chuỗi đúng liên tiếp. */
export function comboMultiplier(combo) {
  let multiplier = 1;
  for (const step of COMBO_STEPS) {
    if (combo >= step.min) multiplier = step.multiplier;
  }
  return multiplier;
}

/** XP cho một câu trả lời (10 XP cơ bản, thưởng chuỗi, tối đa 40). */
export function xpForAnswer(correct, combo = 0) {
  if (!correct) return 0;
  return Math.min(40, Math.round(10 * comboMultiplier(combo)));
}

/** Tổng XP của một phiên: cộng dồn từng câu theo chuỗi. */
export function sessionXp(results) {
  let combo = 0;
  let xp = 0;
  for (const result of results) {
    if (result.correct) {
      xp += xpForAnswer(true, combo);
      combo += 1;
    } else {
      combo = 0;
    }
  }
  return { xp, maxCombo: combo };
}

/** Nhiệm vụ ngày, tất định theo ngày + seed. */
export const QUEST_TEMPLATES = [
  { id: "xp", icon: "⚡", title: "Kiếm 40 XP", target: 40, metric: "xp", reward: 10 },
  { id: "answers", icon: "✅", title: "Trả lời đúng 15 câu", target: 15, metric: "correct", reward: 10 },
  { id: "reviews", icon: "🔁", title: "Ôn 10 thẻ", target: 10, metric: "reviews", reward: 10 },
  { id: "lesson", icon: "📘", title: "Hoàn thành 1 bài học", target: 1, metric: "lessons", reward: 15 },
  { id: "accuracy", icon: "🎯", title: "Đạt 80% chính xác", target: 80, metric: "accuracy", reward: 15 }
];

export function dailyQuests(day = "2026-01-01", seed = 7) {
  const numeric = [...day].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) + seed;
  const rotated = [...QUEST_TEMPLATES.slice(numeric % QUEST_TEMPLATES.length), ...QUEST_TEMPLATES.slice(0, numeric % QUEST_TEMPLATES.length)];
  return rotated.slice(0, 3).map((quest) => ({ ...quest }));
}

/** Tiến độ nhiệm vụ theo số liệu phiên. */
export function questProgress(quest, stats = {}) {
  const value = Number(stats[quest.metric] || 0);
  return {
    ...quest,
    value,
    percent: clamp(Math.round((value / quest.target) * 100), 0, 100),
    complete: value >= quest.target
  };
}

export const BADGES = [
  { id: "first-lesson", icon: "🌱", title: "Bước đầu tiên", desc: "Hoàn thành bài học đầu tiên" },
  { id: "streak-3", icon: "🔥", title: "Ba ngày bền bỉ", desc: "Giữ chuỗi 3 ngày" },
  { id: "streak-7", icon: "🔥", title: "Một tuần không nghỉ", desc: "Giữ chuỗi 7 ngày" },
  { id: "xp-500", icon: "⚡", title: "Năm trăm XP", desc: "Tích luỹ 500 XP" },
  { id: "perfect", icon: "💯", title: "Không sai câu nào", desc: "Hoàn thành bài học đúng 100%" },
  { id: "reviewer", icon: "🧠", title: "Chủ nhân trí nhớ", desc: "Ôn tập 25 thẻ" },
  { id: "reader", icon: "📚", title: "Mọt tài liệu", desc: "Đọc một tài liệu PDF trong thư viện" }
];

/** Danh sách id huy hiệu đạt được theo số liệu tổng. */
export function earnedBadges(stats = {}) {
  const earned = [];
  if ((stats.lessons || 0) >= 1) earned.push("first-lesson");
  if ((stats.streak || 0) >= 3) earned.push("streak-3");
  if ((stats.streak || 0) >= 7) earned.push("streak-7");
  if ((stats.xp || 0) >= 500) earned.push("xp-500");
  if ((stats.perfect || 0) >= 1) earned.push("perfect");
  if ((stats.reviews || 0) >= 25) earned.push("reviewer");
  if ((stats.docsRead || 0) >= 1) earned.push("reader");
  return earned;
}

/** Áp dụng kết quả phiên học vào trạng thái (không ghi storage). */
export function applySession(state, session, now = new Date()) {
  const today = dayKey(now);
  const sameDay = state.todayKey === today;
  const streak = streakAfterStudy(state, now);
  const xpGain = Math.max(0, session.xp || 0);
  const gemGain = session.perfect ? 20 : 0;
  const base = {
    todayXp: sameDay ? state.todayXp : 0,
    todayLessons: sameDay ? state.todayLessons || 0 : 0,
    todayCorrect: sameDay ? state.todayCorrect || 0 : 0,
    todayAnswered: sameDay ? state.todayAnswered || 0 : 0,
    todayReviews: sameDay ? state.todayReviews || 0 : 0
  };
  const isPathLesson = Boolean(session.lessonId) && !String(session.lessonId).startsWith("practice");
  return {
    ...state,
    xp: state.xp + xpGain,
    gems: state.gems + gemGain,
    todayXp: base.todayXp + xpGain,
    todayLessons: base.todayLessons + 1,
    todayCorrect: base.todayCorrect + (session.correct || 0),
    todayAnswered: base.todayAnswered + (session.total || 0),
    todayReviews: base.todayReviews + (session.reviews || 0),
    todayKey: today,
    weekXp: (state.weekXp || 0) + xpGain,
    streak: streak.streak,
    bestStreak: streak.bestStreak,
    streakFreezes: streak.freezes,
    lastStudyDay: today,
    completed: isPathLesson ? { ...state.completed, [session.lessonId]: true } : { ...state.completed },
    reviews: state.reviews + (session.reviews || 0)
  };
}
