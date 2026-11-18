import test from "node:test";
import assert from "node:assert/strict";
import { cards, lessons, skills } from "../../studio/src/lessons.mjs";
import {
  empty,
  lessonCards,
  localDay,
  restore,
  summarize,
} from "../../studio/src/progress.mjs";

const l = lessons[0],
  ids = lessonCards(l);
function session(day, unit = l.id, qids = ids, correct = true) {
  return {
    day,
    unit,
    picks: qids.map((id) => [id, (cards.get(id).key + (correct ? 0 : 1)) % 3]),
  };
}

test("content: stable unique questions; all four skills; no out-of-range keys", () => {
  assert.equal(new Set(lessons.map((l) => l.id)).size, lessons.length);
  assert.equal(
    cards.size,
    lessons.reduce((n, l) => n + l.items.length, 0),
  );
  assert.deepEqual(
    new Set(lessons.map((l) => l.skill)),
    new Set(Object.keys(skills)),
  );
  for (const c of cards.values()) {
    assert.equal(new Set(c.options).size, 3);
    assert.ok(c.options[c.key]);
    assert.ok(c.note.length > 10);
    assert.ok(c.lesson.audio || c.lesson.text);
  }
});
test("local calendar arithmetic crosses leap days, DST, year and month boundaries", () => {
  for (const d of [
    new Date(2024, 1, 29, 23, 58),
    new Date(2024, 2, 10, 23),
    new Date(2024, 10, 3, 23),
    new Date(2026, 11, 31, 23),
  ]) {
    const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 1);
    assert.equal(localDay(next) - localDay(d), 1);
  }
});
test("malformed storage, wrong schema, unknown cards, incomplete or mixed sessions rejected", () => {
  const ok = session(2);
  const unknown = "not-a-card";
  for (const raw of [
    "!",
    null,
    "null",
    "{}",
    JSON.stringify({ ...empty(), version: 2 }),
    JSON.stringify({ ...empty(), goal: 9 }),
    JSON.stringify({ ...empty(), sessions: {} }),
  ])
    assert.deepEqual(restore(raw), empty());
  for (const s of [
    null,
    { ...ok, day: NaN },
    { ...ok, picks: null },
    { ...ok, picks: [] },
    { ...ok, picks: Array(6).fill(ok.picks[0]) },
    { ...ok, picks: [42] },
    { ...ok, picks: [[unknown, 1]] },
    { ...ok, picks: [ok.picks[0], ok.picks[0]] },
    { ...ok, picks: [[ids[0], 0.5]] },
    { ...ok, picks: [[ids[0], -1]] },
    { ...ok, picks: [[ids[0], 3]] },
    { ...ok, unit: "unknown" },
    { ...ok, picks: ok.picks.slice(1) },
    { ...ok, picks: [...ok.picks.slice(1), [lessonCards(lessons[1])[1], 1]] },
  ])
    assert.deepEqual(
      restore(JSON.stringify({ ...empty(), goal: 2, sessions: [s] })),
      empty(),
    );
  const valid = {
    ...empty(),
    goal: 3,
    sessions: [ok, session(3, "review", ids.slice(0, 1))],
  };
  assert.deepEqual(restore(JSON.stringify(valid)), valid);
});
test("XP is awarded once per lesson/day and correct card/day; review does not farm bonuses", () => {
  const s = empty();
  s.sessions.push(
    session(10),
    session(10),
    session(10, "review"),
    session(11, "review"),
    session(12),
  );
  const first = summarize(s, 10);
  assert.equal(first.xp, 25);
  assert.equal(first.count, 2);
  assert.equal(first.completed.size, 1);
  assert.equal(first.next, lessons[1]);
  assert.deepEqual(first.badges, [true, false, false]);
  assert.equal(summarize(s, 11).xp, 40);
  assert.equal(summarize(s, 12).xp, 65);
  assert.equal(summarize(s, 12).streak, 3);
  assert.equal(summarize(s, 13).streak, 3);
  assert.equal(summarize(s, 14).streak, 0);
  assert.equal(summarize(s, 14).badges[2], true);
});
test("review due dates: wrong now; correct in 1/3/7/14/30 days; early repeats do not postpone; lapse resets", () => {
  const s = empty();
  s.sessions.push(session(0, l.id, ids, false));
  assert.deepEqual(summarize(s, 0).due, ids);
  let d = 0;
  for (const delay of [1, 3, 7, 14, 30, 30]) {
    s.sessions.push(session(d, "review"));
    assert.deepEqual(summarize(s, d).due, []);
    s.sessions.push(session(d, "review"));
    assert.deepEqual(summarize(s, d + delay - 1).due, []);
    d += delay;
    assert.deepEqual(summarize(s, d).due, ids);
  }
  s.sessions.push(session(d, "review", ids, false));
  assert.deepEqual(summarize(s, d).due, ids);
  s.sessions.push(session(d, "review"));
  assert.deepEqual(summarize(s, d + 1).due, ids);
});
test("review queue oldest first; empty progress and completing all skills", () => {
  const s = empty();
  assert.deepEqual(summarize(s, 0).badges, [false, false, false]);
  assert.equal(summarize(s, 1).count, 0);
  for (const lesson of lessons)
    s.sessions.push(session(10, lesson.id, lessonCards(lesson)));
  s.sessions.push(session(11, "review", [ids[0]]));
  const v = summarize(s, 14);
  assert.equal(v.due.at(-1), ids[0]);
  assert.deepEqual(v.badges, [true, true, false]);
  assert.equal(v.next, lessons[14 % lessons.length]);
});

test("weekly tier resets on Monday; lifetime XP and streak do not", () => {
  const s = empty();
  const sunday = localDay(new Date(2026, 10, 22));
  const monday = sunday + 1;
  for (const l of lessons.slice(0, 3))
    s.sessions.push(session(sunday, l.id, lessonCards(l)));
  assert.deepEqual(summarize(s, sunday).league, {
    name: "Bạc",
    xp: 75,
    next: 150,
  });
  assert.deepEqual(summarize(s, monday).league, {
    name: "Đồng",
    xp: 0,
    next: 75,
  });
  assert.equal(summarize(s, monday).xp, 75);
  assert.equal(summarize(s, monday).streak, 1);
});
