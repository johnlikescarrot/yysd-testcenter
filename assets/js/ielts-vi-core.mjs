/** Small, local-only progress model for the Vietnamese IELTS practice. */
export const STORAGE_KEY = 'yysd:ielts-vi:progress:v1';
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ID_PATTERN = /^[a-z0-9-]+$/;
const INTERVALS = [1, 3, 7, 14, 30];

export function emptyProgress() {
  return { version: 1, xp: 0, days: [], lessons: {}, reviews: {} };
}

export function isDay(value) {
  if (typeof value !== 'string' || !DAY_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

export function localDay(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function shiftDay(day, amount) {
  const date = new Date(`${day}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

export function normaliseProgress(value) {
  const progress = emptyProgress();
  if (!value || typeof value !== 'object' || value.version !== 1) return progress;
  if (Number.isSafeInteger(value.xp) && value.xp >= 0) progress.xp = value.xp;
  if (Array.isArray(value.days)) progress.days = [...new Set(value.days.filter(isDay))].sort();
  if (value.lessons && typeof value.lessons === 'object') {
    for (const [id, count] of Object.entries(value.lessons)) {
      if (ID_PATTERN.test(id) && Number.isSafeInteger(count) && count > 0) progress.lessons[id] = count;
    }
  }
  if (value.reviews && typeof value.reviews === 'object') {
    for (const [id, item] of Object.entries(value.reviews)) {
      if (ID_PATTERN.test(id) && item && isDay(item.due) && Number.isInteger(item.step) && item.step >= 0 && item.step < INTERVALS.length) {
        progress.reviews[id] = { due: item.due, step: item.step };
      }
    }
  }
  return progress;
}

export function loadProgress(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return { progress: emptyProgress(), available: true };
    try {
      return { progress: normaliseProgress(JSON.parse(raw)), available: true };
    } catch {
      return { progress: emptyProgress(), available: true };
    }
  } catch {
    return { progress: emptyProgress(), available: false };
  }
}

export function saveProgress(storage, progress) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

export function clearProgress(storage) {
  try {
    storage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function streakFor(days, today) {
  const active = new Set(days);
  let cursor = active.has(today) ? today : shiftDay(today, -1);
  let count = 0;
  while (active.has(cursor)) {
    count += 1;
    cursor = shiftDay(cursor, -1);
  }
  return count;
}

export function recentDays(days, today) {
  const active = new Set(days);
  return Array.from({ length: 7 }, (_, index) => {
    const day = shiftDay(today, index - 6);
    return { day, active: active.has(day) };
  });
}

export function dueQuestions(progress, questions, today) {
  return questions.filter((question) => {
    const review = progress.reviews[question.id];
    return review && review.due <= today;
  });
}

export function completeLesson(progress, lessonId, answers, today) {
  const next = normaliseProgress(progress);
  const correct = answers.filter((answer) => answer.correct).length;
  const earned = 10 + correct * 5;
  next.xp += earned;
  next.days = [...new Set([...next.days, today])].sort();
  next.lessons[lessonId] = (next.lessons[lessonId] || 0) + 1;
  for (const answer of answers) {
    const previous = next.reviews[answer.id];
    // Early re-practice must not postpone an already scheduled review.
    if (answer.correct && previous && previous.due > today) continue;
    const step = answer.correct ? Math.min((previous?.step ?? 0) + 1, INTERVALS.length - 1) : 0;
    next.reviews[answer.id] = { step, due: shiftDay(today, INTERVALS[step]) };
  }
  return { progress: next, earned, correct };
}
