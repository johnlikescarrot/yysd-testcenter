"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const Core = require("../assets/js/ielts-vn-core.js");
const fixed = (day) =>
  new Date(`2026-11-${String(day).padStart(2, "0")}T05:00:00.000Z`);

function memoryStorage(initial) {
  const values = new Map(initial || []);
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    },
    values,
  };
}

test("date helpers format local calendar keys and reject invalid dates", () => {
  assert.equal(Core.localDateKey(fixed(3)), "2026-11-03");
  assert.equal(Core.localDateKey("2026-01-09T12:00:00Z"), "2026-01-09");
  assert.throws(() => Core.localDateKey("not-a-date"), {
    name: "TypeError",
    message: "Ngày không hợp lệ",
  });
  assert.equal(Core.dayDifference("2026-11-01", "2026-11-03"), 2);
  assert.equal(Core.dayDifference("bad", "2026-11-03"), Infinity);
  assert.equal(Core.dayDifference("2026-11-04", "2026-11-03"), -1);
  assert.equal(Core.weekStartKey(fixed(3)), "2026-11-02");
  assert.equal(Core.weekStartKey(), Core.weekStartKey(new Date()));
  assert.throws(() => Core.weekStartKey("invalid"), /Ngày không hợp lệ/);
  assert.match(
    Core.recordStudy(Core.createInitialState()).lastStudyDate,
    /^\d{4}-\d{2}-\d{2}$/,
  );
});

test("initial and normalized state remain safe across malformed and stale storage", () => {
  assert.equal(Core.createInitialState(fixed(3)).today, "2026-11-03");
  assert.equal(Core.createInitialState().version, 1);
  const fresh = Core.createInitialState(fixed(3));
  assert.equal(Core.normalizeState(null, fixed(3)).xp, 0);
  assert.equal(Core.normalizeState([], fixed(3)).streak, 0);
  const repaired = Core.normalizeState(
    {
      version: 1,
      xp: -7,
      streak: "bad",
      bestStreak: 4.9,
      answers: 3,
      correct: 2,
      todayXp: 9,
      lessons: 1,
      reviewed: 2,
      answeredIds: "bad",
      mastered: null,
      history: {},
      lastStudyDate: "2026-11-02",
    },
    fixed(3),
  );
  assert.equal(repaired.xp, 0);
  assert.equal(repaired.streak, 0);
  assert.equal(repaired.bestStreak, 4);
  assert.deepEqual(repaired.answeredIds, []);
  assert.deepEqual(repaired.mastered, []);
  assert.deepEqual(repaired.history, []);
  assert.equal(repaired.answers, 3);
  const stale = Core.normalizeState(
    {
      version: 1,
      xp: 90,
      today: "2026-11-02",
      todayXp: 20,
      answers: 7,
      correct: 5,
      lessons: 2,
      reviewed: 4,
      answeredIds: ["old"],
      mastered: ["x"],
    },
    fixed(3),
  );
  assert.equal(stale.xp, 90);
  assert.equal(stale.todayXp, 0);
  assert.equal(stale.answers, 0);
  assert.deepEqual(stale.answeredIds, []);
  assert.deepEqual(stale.claimedGoals, []);
  assert.deepEqual(stale.mastered, ["x"]);
  assert.equal(
    Core.normalizeState({ version: 2, xp: 8 }, fixed(3)).xp,
    fresh.xp,
  );
});

test("study streak increments once per day, continues on the next day, and resets after a gap", () => {
  let state = Core.createInitialState(fixed(1));
  state = Core.recordStudy(state, fixed(1));
  assert.equal(state.streak, 1);
  state = Core.recordStudy(state, fixed(1));
  assert.equal(state.streak, 1);
  state = Core.recordStudy(state, fixed(2));
  assert.equal(state.streak, 2);
  assert.equal(state.bestStreak, 2);
  state = Core.recordStudy(state, fixed(4));
  assert.equal(state.streak, 1);
  assert.equal(state.bestStreak, 2);
  assert.deepEqual(state.history, ["2026-11-01", "2026-11-02", "2026-11-04"]);
  const priorToday = Core.createInitialState(fixed(3));
  priorToday.lastStudyDate = "2026-11-02";
  priorToday.today = "2026-11-03";
  priorToday.streak = 8;
  priorToday.history = ["2026-11-03"];
  assert.equal(Core.recordStudy(priorToday, fixed(3)).streak, 9);
  const duplicateHistory = Core.createInitialState(fixed(4));
  duplicateHistory.lastStudyDate = "2026-11-03";
  duplicateHistory.streak = 3;
  duplicateHistory.history = ["2026-11-03", "2026-11-04"];
  const deduplicated = Core.recordStudy(duplicateHistory, fixed(4));
  assert.equal(deduplicated.streak, 4);
  assert.deepEqual(deduplicated.history, ["2026-11-03", "2026-11-04"]);
});

test("answers award XP, count accuracy, mark mastered items once and keep a bounded answer log", () => {
  let state = Core.createInitialState(fixed(1));
  const question = { id: "q1", answer: "A", skill: "reading" };
  let result = Core.applyAnswer(state, question, "A", fixed(1));
  state = result.state;
  assert.equal(result.correct, true);
  assert.equal(result.xpEarned, Core.XP_PER_CORRECT);
  assert.deepEqual(state.mastered, ["q1"]);
  result = Core.applyAnswer(state, question, "B", fixed(1));
  state = result.state;
  assert.equal(result.correct, false);
  assert.equal(result.xpEarned, 1);
  assert.deepEqual(state.mastered, ["q1"]);
  assert.equal(state.answers, 2);
  assert.equal(state.correct, 1);
  assert.equal(state.lastSkill, "reading");
  assert.equal(Core.accuracy(state), 50);
  assert.throws(
    () => Core.applyAnswer(state, {}, "A", fixed(1)),
    /mã định danh/,
  );
  const noSkill = Core.applyAnswer(
    Core.createInitialState(fixed(1)),
    { id: "q2", answer: "x" },
    "x",
    fixed(1),
  );
  assert.equal(noSkill.state.lastSkill, "vocabulary");
  const long = Core.createInitialState(fixed(1));
  long.answeredIds = Array.from({ length: 100 }, (_, i) => String(i));
  assert.equal(
    Core.applyAnswer(long, { id: "last", answer: 0 }, 0, fixed(1)).state
      .answeredIds.length,
    100,
  );
  assert.equal(
    Core.applyAnswer(long, { id: "last", answer: 0 }, 0, fixed(1)).state
      .answeredIds[99],
    "last",
  );
});

test("lesson and review actions record study and award their configured XP", () => {
  let state = Core.completeLesson(Core.createInitialState(fixed(8)), fixed(8));
  assert.equal(state.lessons, 1);
  assert.equal(state.xp, 5);
  state = Core.completeReview(state, fixed(8));
  assert.equal(state.reviewed, 1);
  assert.equal(state.xp, 5 + Core.XP_PER_REVIEW);
  assert.equal(state.todayXp, state.xp);
  assert.equal(state.weekXp, state.xp);
  assert.equal(state.streak, 1);
  const oldWeek = Object.assign(Core.createInitialState(fixed(1)), {
    weekXp: 55,
    weekOf: "2026-10-26",
  });
  assert.equal(Core.normalizeState(oldWeek, fixed(2)).weekXp, 0);
});

test("daily mission rewards are granted once when each target is reached", () => {
  const empty = Core.createInitialState(fixed(8));
  assert.equal(Core.claimGoalRewards(empty, fixed(8)).reward, 0);
  const ready = Object.assign(Core.createInitialState(fixed(8)), {
    lessons: 1,
    correct: 5,
    reviewed: 3,
    xp: 25,
  });
  const claimed = Core.claimGoalRewards(ready, fixed(8));
  assert.equal(claimed.reward, 35);
  assert.equal(claimed.state.xp, 60);
  assert.equal(claimed.state.todayXp, 35);
  assert.equal(claimed.state.weekXp, 35);
  assert.deepEqual(claimed.state.claimedGoals, [
    "lesson",
    "practice",
    "review",
  ]);
  assert.equal(Core.claimGoalRewards(claimed.state, fixed(8)).reward, 0);
  const partial = Object.assign(Core.createInitialState(fixed(8)), {
    lessons: 1,
    claimedGoals: ["lesson"],
  });
  assert.equal(Core.claimGoalRewards(partial, fixed(8)).reward, 0);
});

test("levels, daily goals, accuracy and safe escaping cover boundary values", () => {
  assert.deepEqual(Core.levelForXp(0), {
    level: 1,
    current: 0,
    needed: 100,
    progress: 0,
  });
  assert.equal(Core.levelForXp(257).level, 3);
  assert.equal(Core.levelForXp(-4).current, 0);
  assert.equal(Core.levelForXp("not-a-number").level, 1);
  const goals = Core.dailyGoals(
    Object.assign(Core.createInitialState(fixed(1)), {
      lessons: 1,
      correct: 9,
      reviewed: 2,
    }),
  );
  assert.equal(goals[0].done, true);
  assert.equal(goals[1].progress, 100);
  assert.equal(goals[2].done, false);
  assert.equal(goals[2].progress, 67);
  assert.equal(goals[0].claimed, false);
  assert.equal(Core.accuracy({ answers: 0, correct: 0 }), 0);
  assert.equal(Core.accuracy({ answers: 3, correct: 2 }), 67);
  assert.equal(
    Core.escapeHtml('<b & "x" \'>'),
    "&lt;b &amp; &quot;x&quot; &#39;&gt;",
  );
  assert.equal(Core.escapeHtml("IELTS"), "IELTS");
});

test("local persistence handles absent data, valid data, corrupt JSON and storage failures", () => {
  const storage = memoryStorage();
  assert.equal(Core.loadState(storage, fixed(4)).today, "2026-11-04");
  const value = Core.createInitialState(fixed(4));
  value.xp = 42;
  assert.equal(Core.saveState(storage, value), true);
  assert.equal(Core.loadState(storage, fixed(4)).xp, 42);
  storage.setItem(Core.STORAGE_KEY, "{");
  assert.equal(Core.loadState(storage, fixed(4)).xp, 0);
  const broken = {
    getItem() {
      throw new Error("blocked");
    },
    setItem() {
      throw new Error("quota");
    },
  };
  assert.equal(Core.loadState(broken, fixed(4)).xp, 0);
  assert.equal(Core.saveState(broken, value), false);
});
