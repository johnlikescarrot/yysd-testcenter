/** Cơ chế động lực: XP, streak, năng lượng, giải đấu, huy hiệu, ước tính band. */
export const DAY_MS = 86_400_000;
export const MAX_HEARTS = 5;
export const HEART_REGEN_MS = 30 * 60 * 1000;
export const GOALS = Object.freeze([10, 20, 30, 50]);

export const LEAGUES = Object.freeze([
  { id: 'dong', name: 'Đồng', minXp: 0 },
  { id: 'bac', name: 'Bạc', minXp: 150 },
  { id: 'vang', name: 'Vàng', minXp: 400 },
  { id: 'ngoc', name: 'Ngọc', minXp: 900 },
  { id: 'kimcuong', name: 'Kim cương', minXp: 1800 }
]);

export const BADGES = Object.freeze([
  { id: 'first-lesson', name: 'Bước đầu tiên', hint: 'Hoàn thành bài học đầu tiên' },
  { id: 'streak-7', name: 'Bảy ngày liền', hint: 'Duy trì chuỗi 7 ngày' },
  { id: 'xp-500', name: 'Năm trăm XP', hint: 'Tích luỹ 500 XP' },
  { id: 'perfect', name: 'Bài không lỗi', hint: 'Trả lời đúng toàn bộ một bài' },
  { id: 'scholar', name: 'Nhà nghiên cứu', hint: 'Mở một tài liệu PDF học thuật' }
]);

export const CEFR_BANDS = Object.freeze([
  [0, 'Tiền A1'], [10, 'A1 sớm'], [20, 'A1 cao'], [30, 'A2'],
  [60, 'B1 sớm'], [80, 'B1 cao'], [100, 'B2 sớm'], [115, 'B2 cao'], [130, 'C1–C2']
]);

export function dayNumber(ms = 0) {
  return Math.floor(ms / DAY_MS);
}

export function initialState(now = 0) {
  return {
    xp: 0, todayXp: 0, todayKey: dayNumber(now), dailyGoal: 20,
    hearts: MAX_HEARTS, lastHeartLoss: null, streak: 0, bestStreak: 0,
    lastActiveDay: null, freezes: 1, lessons: 0, correct: 0, answered: 0,
    badges: [], pdfsOpened: 0, league: 'dong', band: 0
  };
}

export function leagueFor(xp) {
  let current = LEAGUES[0];
  for (const league of LEAGUES) {
    if (xp >= league.minXp) current = league;
  }
  return current;
}

export function xpForLesson({ correct = 0, total = 0, combo = 0, goalReached = false } = {}) {
  if (total <= 0) return 0;
  const base = Math.round((correct / total) * 10);
  const bonus = Math.min(5, Math.floor(combo / 3));
  return Math.max(1, base + bonus + (goalReached ? 5 : 0));
}

export function awardXp(state, amount, now = 0) {
  if (!Number.isFinite(amount) || amount <= 0) return state;
  const gained = Math.round(amount);
  const day = dayNumber(now);
  const todayXp = (day === state.todayKey ? state.todayXp : 0) + gained;
  const xp = state.xp + gained;
  return { ...state, xp, todayXp, todayKey: day, league: leagueFor(xp).id };
}

export function updateStreak(state, now = 0) {
  const day = dayNumber(now);
  if (state.lastActiveDay === null) {
    return { ...state, streak: 1, bestStreak: Math.max(1, state.bestStreak), lastActiveDay: day };
  }
  const gap = day - state.lastActiveDay;
  if (gap === 0) return state;
  if (gap === 1) {
    const streak = state.streak + 1;
    return { ...state, streak, bestStreak: Math.max(streak, state.bestStreak), lastActiveDay: day };
  }
  if (gap === 2 && state.freezes > 0) {
    const streak = state.streak + 1;
    return {
      ...state, streak, bestStreak: Math.max(streak, state.bestStreak),
      lastActiveDay: day, freezes: state.freezes - 1
    };
  }
  return { ...state, streak: 1, lastActiveDay: day };
}

export function spendHeart(state, now = 0) {
  if (state.hearts <= 0) return state;
  return { ...state, hearts: state.hearts - 1, lastHeartLoss: now };
}

export function regenerateHearts(state, now = 0) {
  if (!state.lastHeartLoss || state.hearts >= MAX_HEARTS) return state;
  const gained = Math.floor((now - state.lastHeartLoss) / HEART_REGEN_MS);
  if (gained <= 0) return state;
  const hearts = Math.min(MAX_HEARTS, state.hearts + gained);
  return { ...state, hearts, lastHeartLoss: hearts === MAX_HEARTS ? null : state.lastHeartLoss };
}

export function dailyProgress(state) {
  const goal = state.dailyGoal > 0 ? state.dailyGoal : 20;
  return Math.min(100, Math.round((state.todayXp / goal) * 100));
}

export function setGoal(state, goal) {
  return GOALS.includes(goal) ? { ...state, dailyGoal: goal } : state;
}

export function clampBand(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(9, Math.max(0, value));
}

/** Trung bình bốn kỹ năng, làm tròn tới nửa band gần nhất như thang IELTS. */
export function bandEstimate({ listening = 0, reading = 0, writing = 0, speaking = 0 } = {}) {
  const parts = [listening, reading, writing, speaking].map(clampBand);
  const average = parts.reduce((sum, value) => sum + value, 0) / parts.length;
  return Math.round(average * 2) / 2;
}

export function scoreToCefr(score) {
  const value = Math.min(160, Math.max(0, Number.isFinite(score) ? score : 0));
  let label = CEFR_BANDS[0][1];
  for (const [min, name] of CEFR_BANDS) {
    if (value >= min) label = name;
  }
  return label;
}

export function unlockBadges(state) {
  const earned = new Set(state.badges);
  if (state.lessons >= 1) earned.add('first-lesson');
  if (state.streak >= 7) earned.add('streak-7');
  if (state.xp >= 500) earned.add('xp-500');
  if (state.answered > 0 && state.correct === state.answered) earned.add('perfect');
  if (state.pdfsOpened >= 1) earned.add('scholar');
  const badges = BADGES.filter((badge) => earned.has(badge.id)).map((badge) => badge.id);
  return badges.length === state.badges.length ? state : { ...state, badges };
}

export function leaderboard(entries) {
  if (!Array.isArray(entries)) return [];
  return entries
    .map((entry, index) => ({
      name: entry && entry.name ? entry.name : `Người học ${index + 1}`,
      xp: entry && Number.isFinite(entry.xp) ? entry.xp : 0,
      me: Boolean(entry && entry.me)
    }))
    .sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name, 'vi'))
    .slice(0, 10);
}
