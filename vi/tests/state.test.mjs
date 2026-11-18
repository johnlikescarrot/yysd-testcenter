import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STORAGE_KEY, SCHEMA_VERSION, GOALS, HISTORY_LIMIT, ACHIEVEMENTS,
  createInitialState, migrate, loadState, saveState, exportState, importState,
  todayEntry, bumpHistory, touchState, todayXp, goalProgress, weekXp, studyDayCount,
  setGoal, toggleSetting, unlockAchievements, recordLesson, recordReview,
  heartRegenMs, resetState,
} from '../js/core/state.js';
import { CURRICULUM, VOCAB } from './helpers/fixtures.mjs';
import { dayKey } from '../js/core/date.js';
import { MAX_HEARTS, HEART_REGEN_MS } from '../js/core/gamify.js';

const NOW = new Date('2026-11-18T09:00:00').getTime();
const DAY = 86400000;
const TODAY = dayKey(NOW);

function memoryStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, value),
    map,
  };
}

test('createInitialState tạo hồ sơ mới hợp lệ', () => {
  const state = createInitialState(NOW);
  assert.equal(state.version, SCHEMA_VERSION);
  assert.equal(state.goal, 40);
  assert.equal(state.hearts, MAX_HEARTS);
  assert.equal(state.gems, 120);
  assert.equal(state.streak, 0);
  assert.deepEqual(state.lessonsDone, {});
  assert.deepEqual(state.history, []);
  assert.equal(state.settings.sound, true);
  assert.equal(GOALS.length, 4);
  assert.ok(ACHIEVEMENTS.length >= 13);
});

test('migrate hợp nhất dữ liệu cũ và bỏ dữ liệu hỏng', () => {
  assert.equal(migrate(null, NOW).version, SCHEMA_VERSION);
  assert.equal(migrate([], NOW).version, SCHEMA_VERSION);
  assert.equal(migrate('x', NOW).version, SCHEMA_VERSION);

  const migrated = migrate({
    xp: 100,
    profile: { name: 'An' },
    settings: { sound: false },
    quests: { day: TODAY, items: [{ id: 'x' }] },
    history: [{ day: '2026-11-17', xp: 10 }, null, { day: 5 }],
    cards: { analyse: { ease: 2.5 } },
    skills: { reading: { correct: 1, total: 2 } },
    lessonsDone: { 'lesson-1': {} },
    unitsDone: { 'unit-1': NOW },
    achievements: { 'first-lesson': NOW },
  }, NOW);
  assert.equal(migrated.xp, 100);
  assert.equal(migrated.profile.name, 'An');
  assert.equal(migrated.settings.sound, false);
  assert.equal(migrated.quests.items.length, 1);
  assert.equal(migrated.history.length, 1);
  assert.ok(migrated.cards.analyse);
  assert.ok(migrated.skills.reading);
  assert.ok(migrated.lessonsDone['lesson-1']);
  assert.ok(migrated.unitsDone['unit-1']);
  assert.ok(migrated.achievements['first-lesson']);

  const broken = migrate({
    quests: { day: TODAY, items: 'x' }, history: 'x', cards: [], skills: [], lessonsDone: [], unitsDone: [], achievements: [],
  }, NOW);
  assert.deepEqual(broken.quests.items, []);
  assert.deepEqual(broken.history, []);
  assert.deepEqual(broken.cards, {});
  assert.deepEqual(broken.skills, {});
  assert.deepEqual(broken.lessonsDone, {});
});

test('migrate sắp xếp và giới hạn lịch sử', () => {
  const history = Array.from({ length: HISTORY_LIMIT + 10 }, (_, index) => ({
    day: dayKey(NOW - (HISTORY_LIMIT + 10 - index) * DAY),
    xp: 1,
  })).reverse();
  const migrated = migrate({ history }, NOW);
  assert.equal(migrated.history.length, HISTORY_LIMIT);
  assert.ok(migrated.history[0].day < migrated.history.at(-1).day);
});

test('loadState xử lý storage thiếu, rỗng, hỏng và hợp lệ', () => {
  assert.equal(loadState(null, NOW).restored, false);
  const empty = loadState(memoryStorage(), NOW);
  assert.equal(empty.restored, false);
  assert.equal(empty.error, false);

  const broken = loadState(memoryStorage({ [STORAGE_KEY]: '{không phải json' }), NOW);
  assert.equal(broken.error, true);
  assert.equal(broken.restored, false);

  const good = loadState(memoryStorage({ [STORAGE_KEY]: JSON.stringify({ xp: 250 }) }), NOW);
  assert.equal(good.restored, true);
  assert.equal(good.state.xp, 250);
});

test('saveState ghi được và chịu lỗi', () => {
  const storage = memoryStorage();
  assert.equal(saveState(storage, { xp: 5 }), true);
  assert.equal(storage.map.get(STORAGE_KEY), '{"xp":5}');
  assert.equal(saveState(null, {}), false);
  assert.equal(saveState({ setItem() { throw new Error('full'); } }, {}), false);
});

test('exportState và importState tròn vòng dữ liệu', () => {
  const state = createInitialState(NOW);
  const text = exportState(state, NOW);
  assert.match(text, /"app": "yysd-ielts-vi"/);
  const back = importState(text, NOW);
  assert.equal(back.ok, true);
  assert.equal(back.state.xp, state.xp);

  const bare = importState(JSON.stringify({ xp: 42 }), NOW);
  assert.equal(bare.ok, true);
  assert.equal(bare.state.xp, 42);

  const invalid = importState('not json', NOW);
  assert.equal(invalid.ok, false);
  assert.match(invalid.message, /Không đọc được tệp/);

  const wrongShape = importState(JSON.stringify([1, 2]), NOW);
  assert.equal(wrongShape.ok, false);
  assert.match(wrongShape.message, /không đúng định dạng/);

  const nullState = importState(JSON.stringify(null), NOW);
  assert.equal(nullState.ok, false);
});

test('todayEntry và bumpHistory cập nhật đúng ngày', () => {
  assert.deepEqual(todayEntry({ history: [] }, NOW), { day: TODAY, xp: 0, lessons: 0, correct: 0, total: 0 });
  const history = [{ day: TODAY, xp: 10, lessons: 1, correct: 5, total: 6 }];
  assert.equal(todayEntry({ history }, NOW).xp, 10);

  const added = bumpHistory([], TODAY, { xp: 20, lessons: 1, correct: 4, total: 5 });
  assert.equal(added.length, 1);
  assert.equal(added[0].xp, 20);

  const updated = bumpHistory(added, TODAY, { xp: 5, correct: 1, total: 1 });
  assert.equal(updated[0].xp, 25);
  assert.equal(updated[0].lessons, 1);
  assert.equal(updated[0].correct, 5);
  assert.equal(updated[0].total, 6);

  const nullHistory = bumpHistory(null, TODAY, { xp: 1 });
  assert.equal(nullHistory.length, 1);
});

test('touchState hồi tim, tạo nhiệm vụ ngày và bản ghi hôm nay', () => {
  const state = createInitialState(NOW - DAY);
  const touched = touchState(state, NOW);
  assert.equal(touched.quests.day, TODAY);
  assert.equal(touched.quests.items.length, 3);
  assert.equal(touched.history.length, 1);

  const again = touchState(touched, NOW);
  assert.equal(again.history.length, 1);
  assert.deepEqual(again.quests, touched.quests);

  const hearts = touchState({ ...state, hearts: 2, heartsUpdatedAt: NOW - HEART_REGEN_MS * 2 }, NOW);
  assert.equal(hearts.hearts, 4);
});

test('todayXp, goalProgress, weekXp, studyDayCount', () => {
  const state = {
    ...createInitialState(NOW),
    goal: 40,
    history: [{ day: TODAY, xp: 20, lessons: 1, correct: 3, total: 4 }, { day: dayKey(NOW - 5 * DAY), xp: 30 }],
  };
  assert.equal(todayXp(state, NOW), 20);
  assert.deepEqual(goalProgress(state, NOW), { xp: 20, goal: 40, ratio: 0.5, reached: false });
  assert.equal(goalProgress({ ...state, goal: 10 }, NOW).reached, true);
  assert.ok(weekXp(state, NOW) >= 20);
  assert.equal(studyDayCount(state), 2);
  assert.equal(weekXp({ history: [] }, NOW), 0);
  assert.equal(goalProgress({ ...state, goal: 0 }, NOW).ratio, 0.5);
});

test('setGoal và toggleSetting chỉ nhận giá trị hợp lệ', () => {
  const state = createInitialState(NOW);
  assert.equal(setGoal(state, 60).goal, 60);
  assert.equal(setGoal(state, 45).goal, 40);
  assert.equal(setGoal(state, '60').goal, 40);
  assert.equal(toggleSetting(state, 'sound').settings.sound, false);
  assert.equal(toggleSetting(state, 'khong-co'), state);
});

test('unlockAchievements mở khoá và cộng đá quý đúng một lần', () => {
  const state = { ...createInitialState(NOW), lessonsDone: { 'lesson-1': {} }, streak: 3 };
  const first = unlockAchievements(state, NOW);
  assert.ok(first.unlocked.some((item) => item.id === 'first-lesson'));
  assert.ok(first.unlocked.some((item) => item.id === 'streak-3'));
  assert.ok(first.state.gems > state.gems);

  const second = unlockAchievements(first.state, NOW);
  assert.equal(second.unlocked.length, 0);

  const bare = unlockAchievements({ achievements: {}, gems: 0 }, NOW);
  assert.ok(Array.isArray(bare.unlocked));
  assert.equal(bare.state.gems, 0);
});

test('unlockAchievements bao phủ toàn bộ mốc thành tựu', () => {
  const lessonsDone = {};
  for (let i = 0; i < 12; i += 1) lessonsDone[`l-${i}`] = {};
  const cards = {};
  for (let i = 0; i < 45; i += 1) cards[`w-${i}`] = { ease: 2.5 };
  const state = {
    ...createInitialState(NOW),
    lessonsDone,
    cards,
    streak: 30,
    xp: 2000,
    perfectLessons: 6,
    bestCombo: 12,
    reviews: 120,
    unitsDone: { unit: NOW },
    achievements: {},
  };
  const result = unlockAchievements(state, NOW);
  assert.equal(result.unlocked.length, ACHIEVEMENTS.length);
});

test('recordLesson cộng XP, chuỗi, nhiệm vụ và thành tựu', () => {
  const fresh = touchState(createInitialState(NOW), NOW);
  const unit = CURRICULUM.units[0];
  const lesson = { ...unit.lessons[0], id: 'lesson-1' };
  const outcome = recordLesson(fresh, { unit, lesson, results: [true, true, true, true, true], now: NOW });
  assert.ok(outcome.xp >= lesson.xp);
  assert.equal(outcome.state.streak, 1);
  assert.equal(outcome.state.lastStudyDay, TODAY);
  assert.ok(outcome.state.lessonsDone['lesson-1']);
  assert.equal(outcome.state.perfectLessons, 1);
  assert.ok(outcome.state.gems > fresh.gems);
  assert.equal(outcome.score.correct, 5);
  assert.ok(outcome.unlocked.length >= 1);
  assert.equal(todayXp(outcome.state, NOW), outcome.xp);
});

test('recordLesson xử lý bài sai nhiều và hoàn thành đơn vị', () => {
  const state = { ...touchState(createInitialState(NOW), NOW), lessonsDone: { 'lesson-1': { accuracy: 0.9 } } };
  const unit = CURRICULUM.units[0];
  const lesson = { ...unit.lessons[1], id: 'lesson-2' };
  const outcome = recordLesson(state, { unit, lesson, results: [false, false, true], now: NOW });
  assert.equal(outcome.score.passed, false);
  assert.equal(outcome.gems, 2);
  assert.ok(outcome.state.unitsDone['unit-1']);
  assert.equal(outcome.state.perfectLessons, 0);
});

test('recordLesson không lỗi khi thiếu unit', () => {
  const state = touchState(createInitialState(NOW), NOW);
  const outcome = recordLesson(state, { lesson: { id: 'x', xp: 5 }, results: [true], now: NOW });
  assert.deepEqual(outcome.state.unitsDone, {});
});

test('recordReview lên lịch thẻ mới và thẻ đã có', () => {
  const state = touchState(createInitialState(NOW), NOW);
  const first = recordReview(state, VOCAB[0].id, 'good', NOW);
  assert.ok(first.cards[VOCAB[0].id]);
  assert.equal(first.reviews, 1);
  assert.ok(first.gems >= state.gems);

  const second = recordReview(first, VOCAB[0].id, 'again', NOW + DAY);
  assert.equal(second.cards[VOCAB[0].id].lapses, 1);
  assert.equal(second.reviews, 2);
});

test('heartRegenMs và resetState', () => {
  assert.equal(heartRegenMs({ hearts: MAX_HEARTS, heartsUpdatedAt: NOW }, NOW), 0);
  const partial = heartRegenMs({ hearts: 2, heartsUpdatedAt: NOW - 60_000 }, NOW + 60_000);
  assert.equal(partial, HEART_REGEN_MS - 120_000);
  assert.ok(heartRegenMs({ hearts: 2, heartsUpdatedAt: NOW }, NOW - 5000) > 0);

  const reset = resetState(NOW);
  assert.equal(reset.xp, 0);
  assert.equal(reset.hearts, MAX_HEARTS);
  assert.equal(reset.createdAt, NOW);
});
