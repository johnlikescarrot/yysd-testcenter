import { describe, expect, it } from "vitest";
import {
  BADGES,
  LEAGUES,
  LEVELS,
  applySession,
  comboMultiplier,
  dailyGoalStatus,
  dailyQuests,
  daysLeftInWeek,
  earnedBadges,
  leagueFor,
  levelFromXp,
  loseHeart,
  msToNextHeart,
  questProgress,
  refillHeartsWithGems,
  refreshHearts,
  rollWeek,
  sessionXp,
  streakAfterStudy,
  weekStartKey,
  xpForAnswer
} from "../vi/assets/js/gamify.js";
import { HEART_MAX, HEART_REGEN_MS, defaultState } from "../vi/assets/js/store.js";

const NOW = new Date("2026-11-18T09:00:00"); // thứ Tư

function stateAt(overrides = {}) {
  return { ...defaultState(NOW), ...overrides };
}

describe("cấp độ", () => {
  it("tính level, tiến độ và mốc kế tiếp", () => {
    expect(levelFromXp(0)).toMatchObject({ level: 1, title: LEVELS[0].title, progress: 0 });
    expect(levelFromXp(150).level).toBe(2);
    expect(levelFromXp(150).progress).toBe(25);
    expect(levelFromXp(5000)).toMatchObject({ level: LEVELS.length, progress: 100 });
    expect(levelFromXp(-50).level).toBe(1);
    expect(levelFromXp("x").level).toBe(1);
    expect(levelFromXp(100).nextAt).toBe(300);
  });
});

describe("giải đấu", () => {
  it("chọn theo XP tuần", () => {
    expect(leagueFor(0).id).toBe("dong");
    expect(leagueFor(200).id).toBe("bac");
    expect(leagueFor(900).id).toBe("luc-bao");
    expect(leagueFor(99999).id).toBe(LEAGUES.at(-1).id);
    expect(leagueFor(-1).id).toBe("dong");
  });

  it("tuần bắt đầu thứ Hai", () => {
    expect(weekStartKey(NOW)).toBe("2026-11-16");
    expect(weekStartKey(new Date("2026-11-22T23:00:00"))).toBe("2026-11-16");
    expect(daysLeftInWeek(NOW)).toBe(5);
    expect(daysLeftInWeek(new Date("2026-11-22T09:00:00"))).toBe(1);
  });

  it("rollWeek reset XP khi sang tuần", () => {
    const state = stateAt({ weekStart: "2026-11-09", weekXp: 120 });
    expect(rollWeek(state, NOW)).toMatchObject({ weekStart: "2026-11-16", weekXp: 0 });
    const fresh = stateAt({ weekStart: "2026-11-16", weekXp: 40 });
    expect(rollWeek(fresh, NOW)).toBe(fresh);
  });
});

describe("tim", () => {
  it("hồi tim theo thời gian", () => {
    const full = stateAt({ hearts: HEART_MAX, heartsAt: NOW.getTime() - 999999 });
    const refreshed = refreshHearts(full, NOW);
    expect(refreshed.hearts).toBe(HEART_MAX);
    expect(refreshed.heartsAt).toBe(NOW.getTime());

    const early = stateAt({ hearts: 2, heartsAt: NOW.getTime() - 1000 });
    expect(refreshHearts(early, NOW)).toBe(early);

    const one = refreshHearts(stateAt({ hearts: 2, heartsAt: NOW.getTime() - HEART_REGEN_MS }), NOW);
    expect(one.hearts).toBe(3);
    expect(msToNextHeart(one, NOW)).toBe(HEART_REGEN_MS);

    const capped = refreshHearts(stateAt({ hearts: 4, heartsAt: NOW.getTime() - HEART_REGEN_MS * 10 }), NOW);
    expect(capped.hearts).toBe(HEART_MAX);
    expect(capped.heartsAt).toBe(NOW.getTime());
  });

  it("msToNextHeart trả 0 khi đầy tim", () => {
    expect(msToNextHeart(stateAt({ hearts: HEART_MAX }), NOW)).toBe(0);
    const partial = stateAt({ hearts: 1, heartsAt: NOW.getTime() - HEART_REGEN_MS / 2 });
    expect(msToNextHeart(partial, NOW)).toBe(HEART_REGEN_MS / 2);
  });

  it("mất tim", () => {
    const result = loseHeart(stateAt({ hearts: 3 }), NOW);
    expect(result.ok).toBe(true);
    expect(result.state.hearts).toBe(2);
    const empty = loseHeart(stateAt({ hearts: 0, heartsAt: NOW.getTime() }), NOW);
    expect(empty.ok).toBe(false);
    expect(empty.state.hearts).toBe(0);
  });

  it("hồi tim bằng đá quý", () => {
    const poor = refillHeartsWithGems(stateAt({ hearts: 2, gems: 10 }), NOW);
    expect(poor.ok).toBe(false);
    const full = refillHeartsWithGems(stateAt({ hearts: HEART_MAX, gems: 500 }), NOW);
    expect(full.ok).toBe(false);
    const success = refillHeartsWithGems(stateAt({ hearts: 1, gems: 120 }), NOW);
    expect(success.ok).toBe(true);
    expect(success.state.hearts).toBe(HEART_MAX);
    expect(success.state.gems).toBe(70);
  });
});

describe("chuỗi ngày", () => {
  it("cùng ngày giữ nguyên", () => {
    const state = stateAt({ lastStudyDay: "2026-11-18", streak: 4, bestStreak: 6 });
    expect(streakAfterStudy(state, NOW)).toMatchObject({ streak: 4, bestStreak: 6, usedFreeze: false });
  });

  it("hôm qua tăng 1", () => {
    const state = stateAt({ lastStudyDay: "2026-11-17", streak: 4, bestStreak: 4 });
    expect(streakAfterStudy(state, NOW)).toMatchObject({ streak: 5, bestStreak: 5 });
  });

  it("dùng băng giữ chuỗi khi cách 2-3 ngày", () => {
    const state = stateAt({ lastStudyDay: "2026-11-15", streak: 4, bestStreak: 4, streakFreezes: 1 });
    const result = streakAfterStudy(state, NOW);
    expect(result.streak).toBe(5);
    expect(result.freezes).toBe(0);
    expect(result.usedFreeze).toBe(true);
  });

  it("không có băng thì bắt đầu lại", () => {
    const state = stateAt({ lastStudyDay: "2026-11-10", streak: 9, bestStreak: 9, streakFreezes: 0 });
    expect(streakAfterStudy(state, NOW).streak).toBe(1);
  });

  it("học lần đầu", () => {
    expect(streakAfterStudy(stateAt({ lastStudyDay: "", streak: 0 }), NOW).streak).toBe(1);
  });
});

describe("mục tiêu, XP, nhiệm vụ", () => {
  it("dailyGoalStatus", () => {
    expect(dailyGoalStatus(stateAt({ dailyGoal: 50, todayXp: 25 }))).toMatchObject({ goal: 50, done: 25, percent: 50 });
    expect(dailyGoalStatus(stateAt({ dailyGoal: 50, todayXp: 80 }))).toMatchObject({ percent: 100, doneFlag: true });
    expect(dailyGoalStatus(stateAt({ dailyGoal: 1, todayXp: 0 })).goal).toBe(10);
    expect(dailyGoalStatus(stateAt({ dailyGoal: 50, todayXp: -5 })).done).toBe(0);
  });

  it("combo và XP mỗi câu", () => {
    expect(comboMultiplier(0)).toBe(1);
    expect(comboMultiplier(3)).toBe(1.2);
    expect(comboMultiplier(6)).toBe(1.5);
    expect(comboMultiplier(10)).toBe(2);
    expect(xpForAnswer(false, 10)).toBe(0);
    expect(xpForAnswer(true, 0)).toBe(10);
    expect(xpForAnswer(true, 5)).toBe(12);
    expect(xpForAnswer(true, 20)).toBe(20);
  });

  it("sessionXp cộng dồn theo chuỗi", () => {
    const results = [{ correct: true }, { correct: true }, { correct: true }, { correct: false }, { correct: true }];
    const { xp, maxCombo } = sessionXp(results);
    expect(xp).toBe(40);
    expect(maxCombo).toBe(1);
    expect(sessionXp([])).toEqual({ xp: 0, maxCombo: 0 });
  });

  it("dailyQuests ổn định theo ngày", () => {
    const a = dailyQuests("2026-11-18");
    const b = dailyQuests("2026-11-18");
    const c = dailyQuests("2026-11-19");
    expect(a).toHaveLength(3);
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
    expect(a.map((q) => q.id)).not.toEqual(c.map((q) => q.id));
  });

  it("questProgress", () => {
    const quest = { id: "xp", target: 40, metric: "xp" };
    expect(questProgress(quest, { xp: 20 })).toMatchObject({ percent: 50, complete: false });
    expect(questProgress(quest, { xp: 90 })).toMatchObject({ percent: 100, complete: true });
    expect(questProgress(quest, {})).toMatchObject({ value: 0 });
  });
});

describe("huy hiệu", () => {
  it("mở khoá theo số liệu", () => {
    expect(BADGES.length).toBe(7);
    expect(earnedBadges({})).toEqual([]);
    expect(
      earnedBadges({ lessons: 1, streak: 7, xp: 500, perfect: 1, reviews: 25, docsRead: 1 })
    ).toEqual(["first-lesson", "streak-3", "streak-7", "xp-500", "perfect", "reviewer", "reader"]);
    expect(earnedBadges({ streak: 3 })).toContain("streak-3");
  });
});

describe("applySession", () => {
  it("cộng XP, chuỗi, hoàn thành bài", () => {
    const state = stateAt({ todayKey: "2026-11-18", xp: 100, weekXp: 20, streak: 2, bestStreak: 2, lastStudyDay: "2026-11-17", reviews: 4 });
    const next = applySession(
      state,
      { lessonId: "u1l1", xp: 30, correct: 4, total: 5, perfect: false, reviews: 5 },
      NOW
    );
    expect(next.xp).toBe(130);
    expect(next.weekXp).toBe(50);
    expect(next.todayXp).toBe(30);
    expect(next.todayLessons).toBe(1);
    expect(next.todayAnswered).toBe(5);
    expect(next.streak).toBe(3);
    expect(next.completed).toEqual({ u1l1: true });
    expect(next.reviews).toBe(9);
  });

  it("reset số liệu ngày khi sang ngày mới", () => {
    const state = stateAt({ todayKey: "2026-11-17", todayXp: 40, todayLessons: 2, todayCorrect: 9, todayAnswered: 10, todayReviews: 3 });
    const next = applySession(state, { lessonId: "u1l1", xp: 10, correct: 1, total: 2, perfect: true }, NOW);
    expect(next.todayXp).toBe(10);
    expect(next.todayLessons).toBe(1);
    expect(next.todayCorrect).toBe(1);
    expect(next.todayAnswered).toBe(2);
    expect(next.todayReviews).toBe(0);
    expect(next.gems).toBe(state.gems + 20);
  });

  it("không đánh dấu hoàn thành cho phiên luyện tập", () => {
    const state = stateAt();
    const next = applySession(state, { lessonId: "practice", xp: 5, correct: 1, total: 1 }, NOW);
    expect(next.completed).toEqual({});
    expect(next.xp).toBe(5);
  });
});
