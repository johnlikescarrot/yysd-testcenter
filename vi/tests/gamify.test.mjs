import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_HEARTS, HEART_REGEN_MS, STREAK_FREEZE_COST, STREAK_REPAIR_COST, HEART_REFILL_COST,
  LEVELS, LEAGUES, levelInfo, comboBonus, lessonXp, regenHearts, heartsLabel, applyAnswer,
  registerStudyDay, streakStatus, spendGems, earnGems, buyStreakFreeze, repairStreak,
  leagueForXp, leagueProgress, refillHearts,
} from '../js/core/gamify.js';
import { dayKey } from '../js/core/date.js';

const NOW = new Date('2026-11-18T09:00:00').getTime();
const DAY = 86400000;

const baseState = (overrides = {}) => ({
  xp: 0, gems: 1000, hearts: 5, heartsUpdatedAt: NOW, combo: 0, bestCombo: 0,
  streak: 0, longestStreak: 0, lastStudyDay: null, freezes: 0, skills: {},
  ...overrides,
});

test('levelInfo xử lý mốc, cấp cao nhất và giá trị bất thường', () => {
  const first = levelInfo(0);
  assert.equal(first.level, 1);
  assert.equal(first.ratio, 0);
  assert.ok(first.next);
  const mid = levelInfo(650);
  assert.equal(mid.level, 4);
  assert.ok(mid.ratio > 0 && mid.ratio < 1);
  assert.ok(mid.remaining > 0);
  const top = levelInfo(999999);
  assert.equal(top.level, LEVELS.at(-1).level);
  assert.equal(top.next, null);
  assert.equal(top.ratio, 1);
  assert.equal(top.remaining, 0);
  assert.equal(levelInfo(-50).level, 1);
  assert.equal(levelInfo('abc').level, 1);
});

test('comboBonus tăng theo bậc', () => {
  assert.equal(comboBonus(0), 0);
  assert.equal(comboBonus(3), 2);
  assert.equal(comboBonus(6), 4);
  assert.equal(comboBonus(12), 6);
});

test('lessonXp cộng thưởng chính xác và combo', () => {
  assert.equal(lessonXp({ baseXp: 10, correct: 5, total: 5, combo: 5 }), 10 + 5 + 2);
  assert.equal(lessonXp({ baseXp: 10, correct: 4, total: 5 }), 12);
  assert.equal(lessonXp({ baseXp: 10, correct: 2, total: 5 }), 10);
  assert.equal(lessonXp({ baseXp: 10, correct: 0, total: 0 }), 10);
  assert.equal(lessonXp({ baseXp: 'x', correct: 1, total: 1, combo: 20 }), 5 + 6);
});

test('regenHearts hồi tim theo 20 phút', () => {
  const full = regenHearts(baseState({ hearts: 5 }), NOW + 1000);
  assert.equal(full.hearts, 5);
  const none = regenHearts(baseState({ hearts: 3 }), NOW + 1000);
  assert.equal(none.hearts, 3);
  const one = regenHearts(baseState({ hearts: 3 }), NOW + HEART_REGEN_MS + 1000);
  assert.equal(one.hearts, 4);
  assert.equal(one.heartsUpdatedAt, NOW + HEART_REGEN_MS);
  const filled = regenHearts(baseState({ hearts: 4 }), NOW + HEART_REGEN_MS * 5);
  assert.equal(filled.hearts, MAX_HEARTS);
  assert.equal(filled.heartsUpdatedAt, NOW + HEART_REGEN_MS * 5);
  const backward = regenHearts(baseState({ hearts: 2, heartsUpdatedAt: NOW }), NOW - 5000);
  assert.equal(backward.hearts, 2);
});

test('heartsLabel mô tả thời gian hồi', () => {
  assert.equal(heartsLabel(baseState({ hearts: 5 }), NOW), 'Đã đầy');
  assert.match(heartsLabel(baseState({ hearts: 3 }), NOW + 60_000), /^\+1 sau \d+ phút$/);
  assert.match(heartsLabel(baseState({ hearts: 3 }), NOW + 19 * 60_000), /^\+1 sau 1 phút$/);
});

test('applyAnswer cập nhật combo, tim và kỹ năng', () => {
  const right = applyAnswer(baseState({ combo: 2 }), { correct: true, skill: 'reading' });
  assert.equal(right.combo, 3);
  assert.equal(right.bestCombo, 3);
  assert.deepEqual(right.skills.reading, { correct: 1, total: 1 });

  const again = applyAnswer(right, { correct: true, skill: 'reading' });
  assert.deepEqual(again.skills.reading, { correct: 2, total: 2 });

  const wrong = applyAnswer({ ...right, hearts: 3 }, { correct: false, skill: 'writing' });
  assert.equal(wrong.combo, 0);
  assert.equal(wrong.hearts, 2);
  assert.deepEqual(wrong.skills.writing, { correct: 0, total: 1 });

  const noSkill = applyAnswer(baseState(), { correct: true });
  assert.equal(noSkill.skills && Object.keys(noSkill.skills).length, 0);
  assert.equal(noSkill.hearts, 5);

  const floor = applyAnswer(baseState({ hearts: 0 }), { correct: false });
  assert.equal(floor.hearts, 0);
  assert.ok(floor.heartsUpdatedAt);
});

test('registerStudyDay: ngày đầu, liên tiếp, dùng bảo hiểm, đứt chuỗi, cùng ngày', () => {
  const today = dayKey(NOW);
  const start = registerStudyDay(baseState(), NOW);
  assert.equal(start.streak, 1);
  assert.equal(start.lastStudyDay, today);

  const same = registerStudyDay(start, NOW);
  assert.equal(same, start);

  const yesterday = dayKey(NOW - DAY);
  const next = registerStudyDay({ ...start, lastStudyDay: yesterday, streak: 3 }, NOW);
  assert.equal(next.streak, 4);
  assert.equal(next.longestStreak, 4);

  const frozen = registerStudyDay({ ...start, lastStudyDay: dayKey(NOW - 2 * DAY), streak: 5, freezes: 2 }, NOW);
  assert.equal(frozen.streak, 6);
  assert.equal(frozen.freezes, 1);
  assert.equal(frozen.freezeUsedDay, today);

  const broken = registerStudyDay({ ...start, lastStudyDay: dayKey(NOW - 5 * DAY), streak: 9, freezes: 3 }, NOW);
  assert.equal(broken.streak, 1);
  assert.equal(broken.freezes, 3);
  assert.equal(broken.freezeUsedDay, null);

  const kept = registerStudyDay({ ...start, lastStudyDay: dayKey(NOW - 2 * DAY), streak: 2, freezes: 0 }, NOW);
  assert.equal(kept.streak, 1);
});

test('streakStatus mô tả trạng thái chuỗi', () => {
  const today = dayKey(NOW);
  assert.equal(streakStatus(baseState(), NOW).activeToday, false);
  assert.equal(streakStatus(baseState(), NOW).gap, null);

  const active = streakStatus({ ...baseState(), lastStudyDay: today, streak: 4 }, NOW);
  assert.equal(active.activeToday, true);
  assert.equal(active.days, 4);

  const atRisk = streakStatus({ ...baseState(), lastStudyDay: dayKey(NOW - DAY), streak: 4 }, NOW);
  assert.equal(atRisk.atRisk, true);

  const broken = streakStatus({ ...baseState(), lastStudyDay: dayKey(NOW - 4 * DAY), streak: 4 }, NOW);
  assert.equal(broken.atRisk, false);
  assert.equal(broken.gap, 4);

  const future = streakStatus({ ...baseState(), lastStudyDay: dayKey(NOW + DAY), streak: 4 }, NOW);
  assert.equal(future.activeToday, true);
});

test('spendGems, earnGems và mua bảo hiểm', () => {
  assert.equal(spendGems(baseState({ gems: 50 }), 100), null);
  assert.equal(spendGems(baseState({ gems: 100 }), 40).gems, 60);
  assert.equal(spendGems(baseState({ gems: 100 }), -5).gems, 100);
  assert.equal(earnGems(baseState({ gems: 100 }), 25).gems, 125);
  assert.equal(earnGems(baseState({ gems: 100 }), -10).gems, 100);

  const bought = buyStreakFreeze(baseState({ gems: 500 }));
  assert.equal(bought.ok, true);
  assert.equal(bought.state.gems, 500 - STREAK_FREEZE_COST);
  assert.equal(bought.state.freezes, 1);

  const failed = buyStreakFreeze(baseState({ gems: 10 }));
  assert.equal(failed.ok, false);
  assert.match(failed.message, /Không đủ đá quý/);
});

test('repairStreak chỉ cho phép khi chuỗi đã đứt', () => {
  const safe = repairStreak(baseState({ gems: 1000, lastStudyDay: dayKey(NOW), streak: 3 }), NOW);
  assert.equal(safe.ok, false);

  const never = repairStreak(baseState({ gems: 1000 }), NOW);
  assert.equal(never.ok, false);

  const poor = repairStreak(baseState({ gems: 10, lastStudyDay: dayKey(NOW - 3 * DAY), streak: 3 }), NOW);
  assert.equal(poor.ok, false);
  assert.match(poor.message, /Không đủ đá quý/);

  const repaired = repairStreak(baseState({ gems: 1000, lastStudyDay: dayKey(NOW - 3 * DAY), streak: 3 }), NOW);
  assert.equal(repaired.ok, true);
  assert.equal(repaired.state.gems, 1000 - STREAK_REPAIR_COST);
  assert.equal(repaired.state.lastStudyDay, dayKey(NOW - DAY));
  assert.equal(repaired.state.streakRepairs, 1);
});

test('hạng đấu theo XP', () => {
  assert.equal(leagueForXp(-10).id, LEAGUES[0].id);
  assert.equal(leagueForXp(300).id, 'bac');
  assert.equal(leagueForXp(9000).id, 'kim-cuong');

  const mid = leagueProgress(300);
  assert.equal(mid.current.id, 'bac');
  assert.ok(mid.next);
  assert.ok(mid.ratio >= 0 && mid.ratio <= 1);
  assert.ok(mid.remaining > 0);

  const top = leagueProgress(9999);
  assert.equal(top.next, null);
  assert.equal(top.ratio, 1);
});

test('refillHearts nạp đầy tim bằng đá quý', () => {
  const full = refillHearts(baseState({ hearts: 5 }), NOW);
  assert.equal(full.ok, false);

  const poor = refillHearts(baseState({ hearts: 1, gems: 10 }), NOW);
  assert.equal(poor.ok, false);

  const ok = refillHearts(baseState({ hearts: 1, gems: 1000 }), NOW);
  assert.equal(ok.ok, true);
  assert.equal(ok.state.hearts, MAX_HEARTS);
  assert.equal(ok.state.gems, 1000 - HEART_REFILL_COST);
});
