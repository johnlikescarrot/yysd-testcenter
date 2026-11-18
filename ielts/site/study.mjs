import { lessons, lessonById, questions, skills } from './catalog.mjs';

export const storageKey = 'yysd:ielts-vi:v1';
export const points = 10;
export const goals = [10, 20, 30];
const intervals = [0, 1, 3, 7, 14, 30];
const fresh = () => ({ goal: 20, done: [], days: {}, review: {} });

function record(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function known(list, index) {
  return Array.isArray(list) ? [...new Set(list.filter((id) => index.has(id)))] : [];
}

function validDay(value) {
  return typeof value === 'string' && /^\d{4}-\d\d-\d\d$/.test(value)
    && new Date(value).toJSON() === `${value}T00:00:00.000Z`;
}

export function parseState(serialized) {
  const raw = record(JSON.parse(serialized));
  const days = Object.fromEntries(Object.entries(record(raw.days))
    .filter(([day]) => validDay(day)).map(([day, ids]) => [day, known(ids, questions)]));
  const review = {};
  for (const [id, value] of Object.entries(record(raw.review))) {
    const { due, level } = record(value);
    if (questions.has(id) && validDay(due) && Number.isInteger(level) && level >= 0 && level < intervals.length) {
      review[id] = { due, level };
    }
  }
  return { goal: goals.includes(raw.goal) ? raw.goal : 20, done: known(raw.done, lessonById), days, review };
}

export function readState(window) {
  try {
    return { state: parseState(window.localStorage.getItem(storageKey)), available: true };
  } catch {
    // Distinguish an unreadable or older value from an empty, usable store.
    return { state: fresh(), available: false };
  }
}

export function writeState(window, state) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function dayKey(date = new Date()) {
  const parts = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
  return parts.map((part, index) => String(part).padStart(index ? 2 : 4, '0')).join('-');
}

export function shiftDay(day, offset) {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function normalize(text) {
  return text.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();
}

export function isCorrect(item, response) {
  return item.answers.some((answer) => normalize(answer) === normalize(response));
}

export function finishPractice(state, lessonId, results, today) {
  const earned = new Set(state.days[today]);
  const review = { ...state.review };
  for (const { id, correct } of results) {
    const previous = review[id];
    if (!correct) {
      review[id] = { due: today, level: 0 };
    } else {
      earned.add(id);
      if (!previous || previous.due <= today) {
        const level = Math.min((previous?.level ?? 0) + 1, intervals.length - 1);
        review[id] = { due: shiftDay(today, intervals[level]), level };
      }
    }
  }
  return {
    ...state,
    done: lessonId ? [...new Set([...state.done, lessonId])] : state.done,
    days: { ...state.days, [today]: [...earned] },
    review,
  };
}

export function nextLesson(state) {
  return lessons.find((lesson) => !state.done.includes(lesson.id)) ?? lessons[0];
}

export function dueItems(state, today) {
  return Object.entries(state.review)
    .filter(([, item]) => item.due <= today)
    .sort(([idA, a], [idB, b]) => a.due.localeCompare(b.due) || idA.localeCompare(idB))
    .map(([id]) => questions.get(id));
}

export function nextReviewDay(state, today) {
  return Object.values(state.review).map(({ due }) => due).filter((day) => day > today).sort()[0];
}

export function dailyPoints(state, day) {
  return (state.days[day]?.length ?? 0) * points;
}

export function totalPoints(state) {
  return Object.keys(state.days).reduce((sum, day) => sum + dailyPoints(state, day), 0);
}

export function streak(state, today) {
  let day = Object.hasOwn(state.days, today) ? today : shiftDay(today, -1);
  let count = 0;
  while (Object.hasOwn(state.days, day)) {
    count += 1;
    day = shiftDay(day, -1);
  }
  return count;
}

export function week(state, today) {
  return Array.from({ length: 7 }, (_, index) => {
    const day = shiftDay(today, index - 6);
    return { day, active: Object.hasOwn(state.days, day) };
  });
}

export function skillProgress(state) {
  return Object.entries(skills).map(([id, skill]) => {
    const group = lessons.filter((lesson) => lesson.skill === id);
    return { ...skill, id, total: group.length, done: group.filter((lesson) => state.done.includes(lesson.id)).length };
  });
}

export function milestones(state, today) {
  return [
    { name: 'Bước đầu tiên', hint: 'Hoàn thành một bài luyện.', icon: 'compass', earned: state.done.length > 0 },
    { name: 'Ba ngày liên tiếp', hint: 'Học hoặc ôn tập ba ngày liên tiếp.', icon: 'flame', earned: streak(state, today) >= 3 },
    { name: 'Đủ bốn kỹ năng', hint: 'Hoàn thành ít nhất một bài ở mỗi kỹ năng.', icon: 'award', earned: skillProgress(state).every((skill) => skill.done > 0) },
  ];
}
