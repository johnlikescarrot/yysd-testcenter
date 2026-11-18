import test from 'node:test';
import assert from 'node:assert/strict';
import { QUEST_POOL, dailyQuests, applyQuestProgress, isQuestDone, claimRewards, questsSummary } from '../js/core/quests.js';

test('dailyQuests chọn 3 nhiệm vụ ổn định theo ngày', () => {
  const a = dailyQuests('2026-11-18');
  const b = dailyQuests('2026-11-18');
  const c = dailyQuests('2026-11-19');
  assert.equal(a.length, 3);
  assert.deepEqual(a.map((quest) => quest.id), b.map((quest) => quest.id));
  assert.notDeepEqual(a.map((quest) => quest.id), c.map((quest) => quest.id));
  assert.ok(a.every((quest) => quest.progress === 0 && quest.rewarded === false));
  assert.ok(a.every((quest) => QUEST_POOL.some((item) => item.id === quest.id)));
});

test('applyQuestProgress cộng dồn và chặn vượt mục tiêu', () => {
  const quests = [
    { id: 'xp', metric: 'xp', target: 30, progress: 0, gems: 8 },
    { id: 'lessons', metric: 'lessons', target: 2, progress: 0, gems: 10 },
  ];
  const one = applyQuestProgress(quests, { xp: 10 });
  assert.equal(one[0].progress, 10);
  assert.equal(one[1].progress, 0);
  const capped = applyQuestProgress(one, { xp: 99, lessons: 5 });
  assert.equal(capped[0].progress, 30);
  assert.equal(capped[1].progress, 2);
  assert.equal(applyQuestProgress(quests, {})[0].progress, 0);
  assert.equal(applyQuestProgress(quests, { xp: -5 })[0].progress, 0);
  assert.deepEqual(applyQuestProgress(null, { xp: 1 }), []);
});

test('isQuestDone và claimRewards trao thưởng một lần', () => {
  assert.equal(isQuestDone(null), false);
  assert.equal(isQuestDone({ progress: 1, target: 2 }), false);
  assert.equal(isQuestDone({ progress: 2, target: 2 }), true);

  const quests = [
    { id: 'a', progress: 2, target: 2, gems: 8, rewarded: false },
    { id: 'b', progress: 0, target: 2, gems: 10, rewarded: false },
  ];
  const first = claimRewards(quests);
  assert.equal(first.gems, 8);
  assert.equal(first.quests[0].rewarded, true);
  const second = claimRewards(first.quests);
  assert.equal(second.gems, 0);
  assert.deepEqual(claimRewards(null), { quests: [], gems: 0 });
});

test('questsSummary tổng hợp', () => {
  assert.deepEqual(questsSummary([]), { done: 0, total: 0, ratio: 0 });
  const summary = questsSummary([{ progress: 2, target: 2 }, { progress: 0, target: 3 }]);
  assert.equal(summary.done, 1);
  assert.equal(summary.total, 2);
  assert.equal(summary.ratio, 0.5);
  assert.equal(questsSummary(null).total, 0);
});
