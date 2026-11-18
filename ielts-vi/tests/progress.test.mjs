import { test } from "node:test";
import assert from "node:assert/strict";
import { lessons, cards, skills } from "../assets/course.mjs";
import {
  dayOf,
  fresh,
  restore,
  save,
  finish,
  dueCards,
  summary,
} from "../assets/progress.mjs";
const storeOf = (value) => ({ getItem: () => JSON.stringify(value) });
const answer = (id, correct = true) => [{ id, correct }];

test("bank integrity: stable keys, every skill, answer and explanation; no duplicate options", () => {
  assert.equal(new Set(cards.map((c) => c.id)).size, cards.length);
  assert.equal(new Set(lessons.map((l) => l.id)).size, lessons.length);
  assert.deepEqual(
    [...new Set(lessons.map((l) => l.skill))].sort(),
    Object.keys(skills).sort(),
  );
  for (const q of cards) {
    assert.ok(q.context && q.prompt && q.why && q.options[q.answer]);
    assert.equal(new Set(q.options).size, q.options.length);
  }
});

test("streak uses calendar dates (around DST and midnight), grace until yesterday, then breaks", () => {
  for (const [y, m, d] of [
    [2026, 2, 8],
    [2026, 10, 1],
    [2026, 11, 31],
  ]) {
    assert.equal(
      dayOf(new Date(y, m, d + 1, 0)) - dayOf(new Date(y, m, d, 23, 59)),
      1,
    );
  }
  const s = fresh();
  finish(s, 12, answer("clock"), null);
  finish(s, 13, answer("sky"), null);
  assert.equal(summary(s, 13).streak, 2);
  assert.equal(summary(s, 14).streak, 2);
  assert.equal(summary(s, 15).streak, 0);
  assert.deepEqual(summary(s, 14).week, [
    false,
    false,
    false,
    false,
    true,
    true,
    false,
  ]);
});

test("replays never farm daily XP or postpone a future review; errors return immediately", () => {
  const s = fresh();
  assert.equal(finish(s, 50, answer("hive"), "evidence"), 5);
  assert.deepEqual(s.review.hive, { level: 1, due: 51 });
  assert.equal(finish(s, 50, answer("hive"), "evidence"), 0);
  assert.equal(s.review.hive.level, 1);
  for (const [day, due, level] of [
    [51, 54, 2],
    [54, 61, 3],
    [61, 75, 4],
    [75, 89, 4],
  ]) {
    finish(s, day, answer("hive"), null);
    assert.deepEqual(s.review.hive, { level, due });
  }
  finish(s, 76, answer("clock", false), null);
  finish(s, 77, answer("hive", false), null);
  assert.deepEqual(
    dueCards(s, 77).map((q) => q.id),
    ["clock", "hive"],
  );
  finish(s, 77, answer("clock"), null);
  assert.deepEqual(s.review.clock, { level: 1, due: 78 });
  assert.deepEqual(s.completed, ["evidence"]);
  assert.equal(summary(s, 77).xp, 40);
  assert.equal(summary(s, 77).next.id, lessons[1].id);
  for (const lesson of lessons)
    finish(s, 78, answer(lesson.cards[0].id), lesson.id);
  assert.equal(summary(s, 78).next, lessons[0]);
  assert.equal(summary(s, 78).skills, 4);
});

test("storage recovery drops untrusted records and malformed shapes; quotas are recoverable", () => {
  const base = fresh();
  for (const val of [
    null,
    [],
    {},
    2,
    { ...base, version: 9 },
    { ...base, review: [] },
    { ...base, history: null },
    { ...base, completed: "no" },
  ])
    assert.deepEqual(restore(storeOf(val)), fresh());
  assert.deepEqual(restore({ getItem: () => "{bad" }), fresh());
  const state = restore(
    storeOf({
      ...base,
      completed: ["evidence", "evidence", "junk"],
      history: {
        1: ["x"],
        2: ["sky", "sky", "junk"],
        3: 0,
        "02": ["sky"],
        "-1": ["clock"],
        "not-a-day": ["clock"],
        9999999: ["sky"],
      },
      review: {
        sky: { level: 1, due: 2 },
        clock: { level: 7, due: 1 },
        hive: { level: -1, due: 1 },
        bikes: { level: 0.5, due: 1 },
        weights: { level: 0, due: -1 },
        yoga: null,
        rise: [],
        nope: { level: 0, due: 2 },
      },
    }),
  );
  assert.deepEqual(state, {
    version: 1,
    completed: ["evidence"],
    history: { 2: ["sky"] },
    review: { sky: { level: 1, due: 2 } },
  });
  let json;
  assert.ok(
    save(
      {
        setItem: (k, v) => {
          assert.match(k, /ielts/);
          json = v;
        },
      },
      state,
    ),
  );
  assert.deepEqual(JSON.parse(json), state);
  assert.equal(
    save(
      {
        setItem() {
          throw Error("quota");
        },
      },
      state,
    ),
    false,
  );
});

test("weekly ranks reset on local Monday; earned streak milestones persist", () => {
  const s = fresh(),
    monday = dayOf(new Date(2026, 10, 16));
  for (let i = 0; i < 7; i++) finish(s, monday - 7 + i, answer("sky"), null);
  assert.equal(summary(s, monday).weekXp, 0);
  assert.equal(summary(s, monday).best, 7);
  for (const [count, tier] of [
    [1, "Đồng"],
    [6, "Bạc"],
    [15, "Vàng"],
  ]) {
    finish(
      s,
      monday,
      cards.slice(0, count).map((c) => ({ id: c.id, correct: true })),
      null,
    );
    assert.equal(summary(s, monday).tier, tier);
    assert.equal(summary(s, monday).weekXp, count * 5);
  }
  finish(s, monday + 7, answer("sky"), null);
  assert.equal(summary(s, monday).weekXp, 75);
  assert.equal(summary(s, monday + 7).weekXp, 5);
  assert.equal(summary(s, monday + 7).best, 8);
});
