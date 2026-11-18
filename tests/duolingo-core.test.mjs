import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
createRequire(import.meta.url)("../assets/js/duolingo-core.js");
const d = globalThis.YYSD_DUOLINGO;
test("cấp độ theo XP", () => {
  assert.equal(d.levelForXp(0).level, 1);
  assert.deepEqual(d.levelForXp(6500), { level: 10, currentXp: 6500, nextLevelXp: null, progress: 1 });
  assert.equal(d.levelForXp(300).progress, 0.2);
  assert.throws(() => d.levelForXp(-1), TypeError);
  assert.throws(() => d.levelForXp(NaN), TypeError);
  assert.throws(() => d.levelForXp("10"), TypeError);
});
test("giải đấu theo XP tuần", () => {
  assert.equal(d.leagueForXp(0), "Đồng");
  assert.equal(d.leagueForXp(99999), "Kim cương");
  assert.throws(() => d.leagueForXp(-1), TypeError);
  assert.throws(() => d.leagueForXp(Infinity), TypeError);
});
test("chuỗi ngày học", () => {
  assert.equal(d.nextStreak(0, null, "2026-11-18"), 1);
  assert.equal(d.nextStreak(0, "2026-11-18", "2026-11-18"), 1);
  assert.equal(d.nextStreak(5, "2026-11-18", "2026-11-18"), 5);
  assert.equal(d.nextStreak(5, "2026-11-17", "2026-11-18"), 6);
  assert.equal(d.nextStreak(5, "2026-11-10", "2026-11-18"), 1);
  assert.throws(() => d.nextStreak(-1, null, "2026-11-18"), TypeError);
  assert.throws(() => d.nextStreak(1.5, null, "2026-11-18"), TypeError);
  assert.throws(() => d.nextStreak(1, "x", "2026-11-18"), TypeError);
});
test("áp dụng câu trả lời và hồi tim", () => {
  assert.deepEqual(d.applyAnswer({}, true), { xp: 10, hearts: 5, gems: 0, correct: 1, total: 1 });
  assert.equal(d.applyAnswer({ total: 4 }, true).gems, 5);
  assert.equal(d.applyAnswer({ hearts: 1 }, false).hearts, 0);
  assert.equal(d.applyAnswer({ hearts: 0 }, false).hearts, 0);
  assert.throws(() => d.applyAnswer(null, true), TypeError);
  assert.equal(d.refillHearts({ gems: 10 }).ok, false);
  assert.equal(d.refillHearts(null).ok, false);
  assert.deepEqual(d.refillHearts({ gems: 30, hearts: 1 }), { ok: true, state: { gems: 10, hearts: 5 }, message: "Đã hồi đầy Tim" });
  assert.equal(d.refillHearts({ gems: 25 }, 20).state.gems, 5);
});
test("lặp lại cách quãng SM-2", () => {
  assert.equal(d.scheduleReview({}, 5).intervalDays, 1);
  assert.equal(d.scheduleReview({ reps: 1, interval: 1 }, 4).intervalDays, 6);
  assert.ok(d.scheduleReview({ reps: 2, interval: 6, ease: 2.5 }, 5).intervalDays >= 15);
  assert.equal(d.scheduleReview({ reps: 3, interval: 15 }, 2).intervalDays, 1);
  assert.throws(() => d.scheduleReview(null, 3), TypeError);
  assert.throws(() => d.scheduleReview({}, 6), RangeError);
  assert.throws(() => d.scheduleReview({}, 2.5), RangeError);
});
test("huy hiệu và ước lượng band", () => {
  assert.deepEqual(d.badgesFor({}), []);
  assert.ok(d.badgesFor({ xp: 100, streak: 30, correct: 100, total: 100, lessons: 50 }).length >= 4);
  assert.ok(d.badgesFor({ streak: 7 }).includes("Chuỗi 7 ngày"));
  assert.equal(d.bandEstimate(0, 0), null);
  assert.equal(d.bandEstimate(40, 40), 9);
  assert.equal(d.bandEstimate(0, 40), 4);
  assert.throws(() => d.bandEstimate(41, 40), RangeError);
  assert.throws(() => d.bandEstimate("1", 40), RangeError);
});
test("nạp trong môi trường trình duyệt (vm)", async () => {
  const vm = await import("node:vm");
  const fs = await import("node:fs");
  const src = fs.readFileSync(new URL("../assets/js/duolingo-core.js", import.meta.url), "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(src, sandbox);
  assert.equal(sandbox.YYSD_DUOLINGO.leagueForXp(0), "Đồng");
  const sandbox2 = {};
  vm.runInNewContext(src, sandbox2);
  assert.equal(sandbox2.YYSD_DUOLINGO.bandEstimate(20, 40), 6.5);
});
test("bao phủ các nhánh mặc định", () => {
  assert.deepEqual(d.applyAnswer({ xp: 5, hearts: 3, gems: 2, correct: 2, total: 9 }, true), { xp: 15, hearts: 3, gems: 7, correct: 3, total: 10 });
  assert.equal(d.applyAnswer({ hearts: null }, false).hearts, 4);
  assert.equal(d.scheduleReview({ ease: 2, reps: 5, interval: 10 }, 3).reps, 6);
  assert.equal(d.scheduleReview({ ease: 1.3, reps: 0, interval: 0 }, 0).ease, 1.3);
  assert.equal(d.levelForXp(99).level, 1);
  assert.equal(d.levelForXp(100).nextLevelXp, 250);
  assert.equal(d.badgesFor({ xp: 0, streak: 0, correct: 0, total: 0, lessons: 0 }).length, 0);
});
test("quét tổ hợp nhánh", () => {
  for (const q of [0, 1, 2, 3, 4, 5]) d.scheduleReview({ ease: 2.5, reps: 2, interval: 6 }, q);
  for (const xp of [0, 50, 100, 249, 250, 499, 500, 899, 900, 1399, 1400, 1999, 2000, 2999, 3000, 4499, 4500, 6499, 6500, 9999]) d.levelForXp(xp);
  for (const w of [0, 499, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000]) d.leagueForXp(w);
  d.badgesFor({ correct: 90, total: 100 });
  d.badgesFor({ correct: 100, total: 200 });
  d.applyAnswer({ hearts: 5 }, true);
  d.refillHearts({ gems: 20 }, 20);
  assert.equal(d.nextStreak(3, "2026-11-19", "2026-11-18"), 1);
});
test("nhánh Ngọc trống và tổng trống", () => {
  assert.equal(d.refillHearts({}).ok, false);
  assert.equal(d.badgesFor({ correct: 100 }).includes("Bậc thầy chính xác"), true);
});
