import { lessons, objective, questionId, reviewable } from './lessons.js';

export const storageKey = 'yysd.ielts.vi.1';
export const goals = [20, 40, 60];
export const lessonXp = 20;
export const reviewXp = 5;
export const reviewLimit = 6;
const spacing = [1, 3, 7, 14, 30];
const reviewIds = new Set(reviewable.map(item => item.id));
const lessonIds = new Set(lessons.map(lesson => lesson.id));
const awardKeys = new Map([
  ...lessons.map(lesson => [`lesson:${lesson.id}`, lessonXp]),
  ...reviewable.map(item => [`review:${item.id}`, reviewXp]),
]);

export const localDay = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export const utcDay = day => new Date(`${day}T00:00:00Z`);
export function shiftDay(day, count) {
  const date = utcDay(day);
  date.setUTCDate(date.getUTCDate() + count);
  return date.toISOString().slice(0, 10);
}

function validDay(day) {
  return typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/u.test(day)
    && Number.isFinite(utcDay(day).getTime()) && shiftDay(day, 0) === day;
}

export const newProgress = () => ({ goal: goals[0], completed: {}, cards: {}, activity: {} });
const entries = value => Object.entries(value ?? {});

function restore(raw) {
  const { goal, completed, cards, activity } = raw ?? {};
  return {
    goal: goals.includes(goal) ? goal : goals[0],
    completed: Object.fromEntries(entries(completed).filter(([id, day]) => lessonIds.has(id) && validDay(day))),
    cards: Object.fromEntries(entries(cards).filter(([id, card]) => reviewIds.has(id)
      && validDay(card?.due) && Number.isInteger(card.level) && card.level >= 0 && card.level <= spacing.length)),
    activity: Object.fromEntries(entries(activity).filter(([day, keys]) => validDay(day) && Array.isArray(keys))
      .map(([day, keys]) => [day, [...new Set(keys.filter(key => awardKeys.has(key)))]]).filter(([, keys]) => keys.length)),
  };
}

export function load(getStorage) {
  try {
    return { progress: restore(JSON.parse(getStorage().getItem(storageKey))), available: true };
  } catch {
    return { progress: newProgress(), available: false };
  }
}

export function save(getStorage, progress) {
  try {
    getStorage().setItem(storageKey, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

const normalize = value => value.normalize('NFKC').toLowerCase().replace(/[’‘]/gu, "'").trim().replace(/\s+/gu, ' ');
export const wordCount = text => (text.match(/[\p{Letter}\p{Number}]+(?:['’-][\p{Letter}\p{Number}]+)*/gu) ?? []).length;
export const checkAnswer = (question, answer) => question.answers.some(value => normalize(value) === normalize(answer));
export const nextLesson = progress => lessons.find(lesson => !Object.hasOwn(progress.completed, lesson.id));
export const lessonState = (lesson, progress) => {
  if (Object.hasOwn(progress.completed, lesson.id)) return 'done';
  return nextLesson(progress) === lesson ? 'ready' : 'locked';
};

export function dueItems(progress, day) {
  return reviewable.filter(item => progress.cards[item.id]?.due <= day)
    .sort((a, b) => progress.cards[a.id].due.localeCompare(progress.cards[b.id].due));
}

export const lessonItems = lesson => lesson.questions.map((question, index) => ({ id: questionId(lesson, index), lesson, question }));

function schedule(progress, id, correct, day) {
  const card = progress.cards[id];
  if (!correct) {
    progress.cards[id] = { level: 0, due: day };
  } else if (!card || card.due <= day) {
    const level = Math.min((card?.level ?? 0) + 1, spacing.length);
    progress.cards[id] = { level, due: shiftDay(day, spacing[level - 1]) };
  }
}

export function finish(progress, session, day) {
  const activity = new Set(progress.activity[day]);
  const previous = activity.size;
  const scored = session.results.filter(result => objective(result.item.question));
  const correct = scored.filter(result => result.correct).length;
  for (const { item, correct: passed } of scored) {
    schedule(progress, item.id, passed, day);
    if (!session.lesson && passed) activity.add(`review:${item.id}`);
  }
  if (session.lesson) {
    const { id } = session.lesson;
    progress.completed[id] ??= day;
    activity.add(`lesson:${id}`);
  }
  if (activity.size) progress.activity[day] = [...activity];
  return { correct, total: scored.length, xp: (activity.size - previous) * (session.lesson ? lessonXp : reviewXp) };
}

export function stats(progress, today) {
  const days = Object.keys(progress.activity).filter(day => day <= today).sort();
  const xpOn = day => (progress.activity[day] ?? []).reduce((total, key) => total + awardKeys.get(key), 0);
  let streak = 0;
  let best = 0;
  let previous;
  for (const day of days) {
    streak = previous === shiftDay(day, -1) ? streak + 1 : 1;
    best = Math.max(streak, best);
    previous = day;
  }
  const week = Array.from({ length: 7 }, (_, index) => {
    const day = shiftDay(today, index - 6);
    return { day, xp: xpOn(day) };
  });
  return {
    completed: Object.keys(progress.completed).length,
    today: xpOn(today), xp: days.reduce((sum, day) => sum + xpOn(day), 0), week, best,
    streak: previous === today || previous === shiftDay(today, -1) ? streak : 0,
  };
}
