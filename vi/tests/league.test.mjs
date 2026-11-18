import test from 'node:test';
import assert from 'node:assert/strict';
import { BOT_NAMES, leagueBots, weeklyStandings, myRank, promotionCutoff, leagueSummary } from '../js/core/league.js';

const NOW = new Date('2026-11-18T09:00:00').getTime();
const DAY = 86400000;

test('leagueBots ổn định theo tuần và co giãn theo XP người học', () => {
  const a = leagueBots('2026-W47', 100);
  const b = leagueBots('2026-W47', 100);
  const c = leagueBots('2026-W47', 500);
  assert.equal(a.length, BOT_NAMES.length);
  assert.deepEqual(a, b);
  assert.ok(c[0].xp > a[0].xp);
  assert.ok(leagueBots('2026-W47', 0).every((bot) => bot.xp >= 12));
});

test('weeklyStandings gộp người học và sắp xếp', () => {
  const state = { history: [{ day: '2026-11-17', xp: 30 }, { day: '2026-11-18', xp: 20 }] };
  const standings = weeklyStandings(state, NOW);
  assert.equal(standings.length, BOT_NAMES.length + 1);
  const me = standings.find((row) => row.me);
  assert.equal(me.xp, 50);
  assert.equal(myRank(standings), standings.indexOf(me) + 1);
  for (let i = 1; i < standings.length; i += 1) {
    assert.ok(standings[i - 1].xp >= standings[i].xp);
  }
  const empty = weeklyStandings({}, NOW);
  assert.equal(empty.find((row) => row.me).xp, 0);
  assert.ok(leagueBots('2026-W47', 100).length > 0);
});

test('myRank trả 0 khi không tìm thấy', () => {
  assert.equal(myRank([{ id: 'x', xp: 1 }]), 0);
  assert.equal(myRank(null), 0);
  assert.equal(myRank([{ id: 'me', me: true, xp: 5 }]), 1);
});

test('promotionCutoff tối thiểu 3 người', () => {
  assert.equal(promotionCutoff(new Array(10).fill({})), 3);
  assert.equal(promotionCutoff(new Array(30).fill({})), 6);
  assert.equal(promotionCutoff([]), 3);
  assert.equal(promotionCutoff(null), 3);
});

test('leagueSummary tóm tắt vị trí tuần', () => {
  const state = { history: [{ day: '2026-11-18', xp: 999 }] };
  const summary = leagueSummary(state, NOW);
  assert.equal(summary.rank, myRank(summary.standings));
  assert.equal(summary.promoting, summary.rank <= summary.cutoff);
  assert.equal(summary.total, BOT_NAMES.length + 1);
  assert.equal(summary.xp, 999);
  const quiet = leagueSummary({ history: [] }, NOW + 7 * DAY);
  assert.equal(quiet.xp, 0);
  assert.equal(quiet.promoting, false);
});
