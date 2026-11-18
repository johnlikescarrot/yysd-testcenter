import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DAY_MS, MAX_HEARTS, HEART_REGEN_MS, GOALS, LEAGUES, BADGES, CEFR_BANDS,
  dayNumber, initialState, leagueFor, xpForLesson, awardXp, updateStreak,
  spendHeart, regenerateHearts, dailyProgress, setGoal, clampBand,
  bandEstimate, scoreToCefr, unlockBadges, leaderboard
} from '../assets/js/gamification.mjs';

const now = 20 * DAY_MS + 1000;

test('hằng số và trạng thái khởi tạo', () => {
  assert.equal(dayNumber(), 0);
  assert.equal(dayNumber(now), 20);
  const s = initialState(now);
  assert.equal(s.hearts, MAX_HEARTS);
  assert.equal(s.todayKey, 20);
  assert.equal(s.freezes, 1);
  assert.equal(s.league, 'dong');
  assert.ok(Object.isFrozen(GOALS) && Object.isFrozen(LEAGUES) && Object.isFrozen(BADGES));
  assert.equal(CEFR_BANDS.length, 9);
});

test('leagueFor đi qua từng ngưỡng', () => {
  assert.equal(leagueFor(-10).id, 'dong');
  assert.equal(leagueFor(150).id, 'bac');
  assert.equal(leagueFor(400).id, 'vang');
  assert.equal(leagueFor(900).id, 'ngoc');
  assert.equal(leagueFor(99999).id, 'kimcuong');
});

test('xpForLesson: tổng bằng 0, thưởng combo, thưởng mục tiêu và sàn 1 XP', () => {
  assert.equal(xpForLesson(), 0);
  assert.equal(xpForLesson({ correct: 0, total: 5 }), 1);
  assert.equal(xpForLesson({ correct: 3, total: 3, combo: 0 }), 10);
  assert.equal(xpForLesson({ correct: 3, total: 3, combo: 30 }), 15);
  assert.equal(xpForLesson({ correct: 3, total: 3, combo: 0, goalReached: true }), 15);
});

test('awardXp bỏ qua giá trị sai, cộng cùng ngày và reset ngày mới', () => {
  const s = initialState(now);
  assert.equal(awardXp(s, Number.NaN, now), s);
  assert.equal(awardXp(s, 0, now), s);
  assert.equal(awardXp(s, -5, now), s);
  const first = awardXp(s, 10, now);
  assert.equal(first.todayXp, 10);
  const same = awardXp(first, 5, now + 1000);
  assert.equal(same.todayXp, 15);
  assert.equal(same.xp, 15);
  const nextDay = awardXp(same, 200, now + DAY_MS);
  assert.equal(nextDay.todayXp, 200);
  assert.equal(nextDay.xp, 215);
  assert.equal(nextDay.todayKey, 21);
  assert.equal(nextDay.league, 'bac');
});

test('updateStreak đủ các trường hợp ngày', () => {
  const s = { ...initialState(now), lastActiveDay: 10, streak: 4, bestStreak: 9, freezes: 1 };
  const d = 10 * DAY_MS;
  const start = updateStreak(initialState(d), d);
  assert.equal(start.streak, 1);
  assert.equal(start.lastActiveDay, 10);
  assert.equal(updateStreak(s, d), s);
  const one = updateStreak(s, 11 * DAY_MS);
  assert.equal(one.streak, 5);
  assert.equal(one.bestStreak, 9);
  const frozen = updateStreak(s, 12 * DAY_MS);
  assert.equal(frozen.streak, 5);
  assert.equal(frozen.freezes, 0);
  const noFreeze = updateStreak({ ...s, freezes: 0 }, 12 * DAY_MS);
  assert.equal(noFreeze.streak, 1);
  const longGap = updateStreak(s, 20 * DAY_MS);
  assert.equal(longGap.streak, 1);
  assert.equal(longGap.bestStreak, 9);
});

test('năng lượng: tiêu, hồi từng phần, hồi đầy và các đường bỏ qua', () => {
  const s = initialState(now);
  assert.equal(regenerateHearts(s, now), s);
  const full = { ...s, hearts: MAX_HEARTS, lastHeartLoss: now };
  assert.equal(regenerateHearts(full, now), full);
  const spent = spendHeart(s, now);
  assert.equal(spent.hearts, 4);
  assert.equal(spendHeart({ ...spent, hearts: 0 }, now).hearts, 0);
  assert.equal(regenerateHearts(spent, now + 1000), spent);
  const partial = regenerateHearts(spent, now + HEART_REGEN_MS);
  assert.equal(partial.hearts, 5);
  assert.equal(partial.lastHeartLoss, null);
  const many = regenerateHearts({ ...spent, hearts: 0 }, now + HEART_REGEN_MS * 2);
  assert.equal(many.hearts, 2);
  assert.equal(many.lastHeartLoss, now);
});

test('mục tiêu ngày và setGoal', () => {
  const s = initialState(now);
  assert.equal(dailyProgress(s), 0);
  assert.equal(dailyProgress({ ...s, todayXp: 10 }), 50);
  assert.equal(dailyProgress({ ...s, todayXp: 999 }), 100);
  assert.equal(dailyProgress({ ...s, todayXp: 5, dailyGoal: 0 }), 25);
  assert.equal(setGoal(s, 50).dailyGoal, 50);
  assert.equal(setGoal(s, 999), s);
});

test('clampBand và bandEstimate làm tròn nửa band', () => {
  assert.equal(clampBand(Number.NaN), 0);
  assert.equal(clampBand(-3), 0);
  assert.equal(clampBand(12), 9);
  assert.equal(clampBand(6.5), 6.5);
  assert.equal(bandEstimate(), 0);
  assert.equal(bandEstimate({ listening: 6, reading: 6.5, writing: 7, speaking: 5.5 }), 6.5);
  assert.equal(bandEstimate({ listening: 6.25, reading: 6.25, writing: 6.25, speaking: 6.25 }), 6.5);
  assert.equal(bandEstimate({ listening: 6.75, reading: 6.75, writing: 6.75, speaking: 6.75 }), 7);
  assert.equal(bandEstimate({ listening: Number.NaN, reading: 20, writing: -5, speaking: 4 }), 3.5);
});

test('scoreToCefr kẹp giá trị và đi qua toàn bộ thang', () => {
  assert.equal(scoreToCefr(Number.NaN), 'Tiền A1');
  assert.equal(scoreToCefr(-10), 'Tiền A1');
  assert.equal(scoreToCefr(999), 'C1–C2');
  const expected = ['Tiền A1', 'A1 sớm', 'A1 cao', 'A2', 'B1 sớm', 'B1 cao', 'B2 sớm', 'B2 cao', 'C1–C2'];
  for (const [index, min] of [0, 10, 20, 30, 60, 80, 100, 115, 130].entries()) {
    assert.equal(scoreToCefr(min), expected[index]);
  }
});

test('unlockBadges chỉ cập nhật khi có huy hiệu mới', () => {
  const s = initialState(now);
  assert.equal(unlockBadges(s), s);
  const perfect = unlockBadges({ ...s, answered: 3, correct: 3 });
  assert.deepEqual(perfect.badges, ['perfect']);
  const all = unlockBadges({
    ...s, lessons: 2, streak: 7, xp: 500, answered: 3, correct: 3, pdfsOpened: 1
  });
  assert.deepEqual(all.badges, BADGES.map((b) => b.id));
  assert.equal(unlockBadges(all), all);
});

test('leaderboard chuẩn hoá, sắp xếp, xử lý hoà và giới hạn 10', () => {
  assert.deepEqual(leaderboard(null), []);
  const rows = leaderboard([
    { name: 'Bạn', xp: 100, me: true }, null,
    { name: 'An', xp: 100 }, { name: 'Bình', xp: Number.NaN },
    { name: 'Dũng', xp: 300 }, { xp: 50 }
  ]);
  assert.equal(rows[0].name, 'Dũng');
  assert.equal(rows[1].name, 'An');
  assert.equal(rows[2].name, 'Bạn');
  assert.equal(rows[2].me, true);
  assert.equal(rows[3].name, 'Người học 6');
  assert.equal(rows[4].name, 'Bình');
  assert.equal(rows.at(-1).name, 'Người học 2');
  assert.equal(rows.at(-1).xp, 0);
  const twelve = Array.from({ length: 12 }, (_unused, i) => ({ name: `H${i}`, xp: i }));
  assert.equal(leaderboard(twelve).length, 10);
});
