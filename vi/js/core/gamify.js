/**
 * Cơ chế trò chơi hoá: XP, cấp độ, trái tim, chuỗi ngày, đá quý, hạng đấu.
 * Toàn bộ hàm là thuần tuý — nhận state, trả state mới.
 */

import { dayKey, dayDiff, DAY_MS } from './date.js';

export const MAX_HEARTS = 5;
export const HEART_REGEN_MS = 20 * 60 * 1000;
export const STREAK_FREEZE_COST = 200;
export const STREAK_REPAIR_COST = 350;
export const STARTING_GEMS = 120;

export const LEVELS = [
  { level: 1, title: 'Nhập môn', min: 0 },
  { level: 2, title: 'Người học', min: 120 },
  { level: 3, title: 'Tay ngang', min: 300 },
  { level: 4, title: 'Bền bỉ', min: 600 },
  { level: 5, title: 'Thành thạo', min: 1000 },
  { level: 6, title: 'Sắc sảo', min: 1600 },
  { level: 7, title: 'Chuyên sâu', min: 2400 },
  { level: 8, title: 'Bậc thầy', min: 3400 },
  { level: 9, title: 'Huyền thoại', min: 4600 },
];

export const LEAGUES = [
  { id: 'dong', name: 'Đồng', min: 0, color: '#a9826a' },
  { id: 'bac', name: 'Bạc', min: 250, color: '#8b94a0' },
  { id: 'vang', name: 'Vàng', min: 600, color: '#c7a45d' },
  { id: 'bach-kim', name: 'Bạch kim', min: 1200, color: '#6f8fa8' },
  { id: 'kim-cuong', name: 'Kim cương', min: 2200, color: '#2f7d8c' },
];

/** Thông tin cấp độ hiện tại và tiến độ tới cấp kế tiếp. */
export function levelInfo(xp) {
  const total = Math.max(0, Number(xp) || 0);
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (total >= level.min) current = level;
  }
  const next = LEVELS.find((level) => level.min > total) || null;
  if (!next) {
    return { level: current.level, title: current.title, xp: total, next: null, ratio: 1, remaining: 0 };
  }
  const span = next.min - current.min;
  const progress = total - current.min;
  return {
    level: current.level,
    title: current.title,
    xp: total,
    next: { level: next.level, title: next.title, min: next.min },
    ratio: Math.max(0, Math.min(1, progress / span)),
    remaining: next.min - total,
  };
}

/** Thưởng XP theo chuỗi trả lời đúng liên tiếp (combo). */
export function comboBonus(combo) {
  if (combo < 3) return 0;
  if (combo < 6) return 2;
  if (combo < 10) return 4;
  return 6;
}

/** XP của một bài học: XP gốc + thưởng chính xác + thưởng combo. */
export function lessonXp({ baseXp = 10, correct = 0, total = 0, combo = 0 }) {
  const base = Math.max(0, Math.round(Number(baseXp) || 0));
  const accuracy = total > 0 ? correct / total : 0;
  let bonus = 0;
  if (total > 0 && correct === total) bonus = 5;
  else if (accuracy >= 0.8) bonus = 2;
  return base + bonus + comboBonus(combo);
}

/** Hồi trái tim theo thời gian (1 trái / 20 phút). */
export function regenHearts(state, now) {
  if (state.hearts >= MAX_HEARTS) {
    return { ...state, heartsUpdatedAt: now };
  }
  const elapsed = Math.max(0, now - (state.heartsUpdatedAt || now));
  const gained = Math.floor(elapsed / HEART_REGEN_MS);
  if (gained <= 0) return state;
  const hearts = Math.min(MAX_HEARTS, state.hearts + gained);
  if (hearts >= MAX_HEARTS) {
    return { ...state, hearts: MAX_HEARTS, heartsUpdatedAt: now };
  }
  return {
    ...state,
    hearts,
    heartsUpdatedAt: state.heartsUpdatedAt + gained * HEART_REGEN_MS,
  };
}

/** Nhãn đếm ngược tới trái tim kế tiếp. */
export function heartsLabel(state, now) {
  if (state.hearts >= MAX_HEARTS) return 'Đã đầy';
  const elapsed = Math.max(0, now - (state.heartsUpdatedAt || now));
  const remaining = Math.max(0, HEART_REGEN_MS - (elapsed % HEART_REGEN_MS));
  const minutes = Math.ceil(remaining / 60000);
  return `+1 sau ${minutes} phút`;
}

/** Áp dụng một câu trả lời: trái tim, combo, thống kê kỹ năng. */
export function applyAnswer(state, { correct, skill }) {
  const next = { ...state };
  if (correct) {
    next.combo = (state.combo || 0) + 1;
    next.bestCombo = Math.max(state.bestCombo || 0, next.combo);
  } else {
    next.combo = 0;
    next.hearts = Math.max(0, state.hearts - 1);
    next.heartsUpdatedAt = state.heartsUpdatedAt || Date.now();
  }
  if (skill) {
    const prev = state.skills?.[skill] || { correct: 0, total: 0 };
    next.skills = {
      ...state.skills,
      [skill]: { correct: prev.correct + (correct ? 1 : 0), total: prev.total + 1 },
    };
  }
  return next;
}

/** Ghi nhận một ngày học, xử lý chuỗi ngày và bảo hiểm chuỗi. */
export function registerStudyDay(state, now) {
  const today = dayKey(now);
  const last = state.lastStudyDay || null;
  if (last === today) return state;

  const gap = last ? dayDiff(last, today) : null;
  let streak = 1;
  let freezes = state.freezes || 0;
  let usedFreeze = false;

  if (gap === 1) {
    streak = (state.streak || 0) + 1;
  } else if (gap === 2 && freezes > 0) {
    streak = (state.streak || 0) + 1;
    freezes -= 1;
    usedFreeze = true;
  }

  return {
    ...state,
    streak,
    longestStreak: Math.max(state.longestStreak || 0, streak),
    lastStudyDay: today,
    freezes,
    freezeUsedDay: usedFreeze ? today : state.freezeUsedDay || null,
  };
}

/** Trạng thái chuỗi ngày để hiển thị (đã học hôm nay chưa, sắp mất chưa). */
export function streakStatus(state, now) {
  const today = dayKey(now);
  const last = state.lastStudyDay || null;
  if (!last) {
    return { activeToday: false, atRisk: false, gap: null, days: 0, label: 'Bắt đầu chuỗi hôm nay' };
  }
  const gap = dayDiff(last, today);
  if (gap <= 0) {
    return { activeToday: true, atRisk: false, gap, days: state.streak, label: 'Đã giữ chuỗi hôm nay' };
  }
  if (gap === 1) {
    return { activeToday: false, atRisk: true, gap, days: state.streak, label: 'Học ngay để giữ chuỗi' };
  }
  return { activeToday: false, atRisk: false, gap, days: state.streak, label: 'Chuỗi đã đứt — có thể hồi phục' };
}

/** Trừ đá quý nếu đủ; trả về null khi không đủ. */
export function spendGems(state, amount) {
  const cost = Math.max(0, Math.round(Number(amount) || 0));
  const gems = state.gems || 0;
  if (gems < cost) return null;
  return { ...state, gems: gems - cost };
}

/** Cộng đá quý. */
export function earnGems(state, amount) {
  return { ...state, gems: Math.max(0, (state.gems || 0) + Math.max(0, Math.round(Number(amount) || 0))) };
}

/** Mua bảo hiểm chuỗi bằng đá quý. */
export function buyStreakFreeze(state) {
  const paid = spendGems(state, STREAK_FREEZE_COST);
  if (!paid) return { state, ok: false, message: 'Không đủ đá quý để mua bảo hiểm chuỗi.' };
  return {
    state: { ...paid, freezes: (paid.freezes || 0) + 1 },
    ok: true,
    message: 'Đã mua 1 bảo hiểm chuỗi. Chuỗi sẽ được giữ khi bạn lỡ một ngày.',
  };
}

/** Hồi phục chuỗi đã đứt bằng đá quý (chỉ khi đứt đúng 1 ngày). */
export function repairStreak(state, now) {
  const status = streakStatus(state, now);
  const broken = status.gap !== null && status.gap > 1 && status.days > 0;
  if (!broken) {
    return { state, ok: false, message: 'Chuỗi của bạn vẫn an toàn, chưa cần hồi phục.' };
  }
  const paid = spendGems(state, STREAK_REPAIR_COST);
  if (!paid) return { state, ok: false, message: 'Không đủ đá quý để hồi phục chuỗi.' };
  return {
    state: {
      ...paid,
      lastStudyDay: dayKey(now - DAY_MS),
      streakRepairs: (paid.streakRepairs || 0) + 1,
    },
    ok: true,
    message: 'Chuỗi đã được hồi phục. Đừng để mất lần nữa nhé!',
  };
}

/** Hạng đấu hiện tại theo tổng XP. */
export function leagueForXp(xp) {
  const total = Math.max(0, Number(xp) || 0);
  let current = LEAGUES[0];
  for (const league of LEAGUES) {
    if (total >= league.min) current = league;
  }
  return current;
}

/** Hạng kế tiếp và tiến độ thăng hạng. */
export function leagueProgress(xp) {
  const total = Math.max(0, Number(xp) || 0);
  const current = leagueForXp(total);
  const index = LEAGUES.findIndex((league) => league.id === current.id);
  const next = LEAGUES[index + 1] || null;
  if (!next) {
    return { current, next: null, ratio: 1, remaining: 0 };
  }
  const span = next.min - current.min;
  return {
    current,
    next,
    ratio: Math.max(0, Math.min(1, (total - current.min) / span)),
    remaining: next.min - total,
  };
}

export const HEART_REFILL_COST = 350;

/** Nạp đầy trái tim bằng đá quý. */
export function refillHearts(state, now = Date.now()) {
  if (state.hearts >= MAX_HEARTS) {
    return { state, ok: false, message: 'Trái tim của bạn đã đầy.' };
  }
  const paid = spendGems(state, HEART_REFILL_COST);
  if (!paid) return { state, ok: false, message: 'Không đủ đá quý để nạp tim. Ôn thẻ từ vựng trong lúc chờ nhé.' };
  return {
    state: { ...paid, hearts: MAX_HEARTS, heartsUpdatedAt: now },
    ok: true,
    message: 'Đã nạp đầy 5 trái tim. Học tiếp thôi!',
  };
}
