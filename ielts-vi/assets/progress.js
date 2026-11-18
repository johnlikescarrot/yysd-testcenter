import { byLesson, lessons, questions, skills } from './course.js';

export const storageKey = 'yysd:ielts-vi:progress:v1';
export const goals = [1, 2, 3];
export const reviewLimit = 8;
const intervals = [1, 3, 7, 14];
const dayMs = 86_400_000;

export function localDay(date) {
  // Convert the local calendar date, not the instant, to a day ordinal (also works across DST).
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / dayMs;
}

export function previousWeek(day) {
  return Array.from({ length: 7 }, (_, index) => {
    const ordinal = day - 6 + index;
    return { ordinal, date: new Date(ordinal * dayMs) };
  });
}

export function emptyProgress() {
  return { version: 1, goal: 1, xp: 0, completed: {}, cards: {}, activity: {} };
}

const bounded = (value, max = 1_000_000) => Number.isSafeInteger(value) && value >= 0 && value <= max;
const objective = (question) => question.type === 'choice' || question.type === 'fill';

export function readProgress(getStorage) {
  const empty = emptyProgress();
  try {
    const stored = JSON.parse(getStorage().getItem(storageKey));
    if (stored?.version !== 1) return empty;
    for (const lesson of lessons) {
      const count = stored.completed?.[lesson.id];
      if (bounded(count, lesson.questions.filter(objective).length)) empty.completed[lesson.id] = count;
    }
    for (const [id, question] of Object.entries(questions)) {
      const card = stored.cards?.[id];
      if (objective(question) && bounded(card?.stage, intervals.length) && bounded(card.due)) {
        empty.cards[id] = { stage: card.stage, due: card.due };
      }
    }
    for (const [day, count] of Object.entries(stored.activity ?? {})) {
      if (/^(0|[1-9]\d{0,5})$/.test(day) && bounded(count) && count > 0) empty.activity[day] = count;
    }
    if (goals.includes(stored.goal)) empty.goal = stored.goal;
    if (bounded(stored.xp)) empty.xp = stored.xp;
  } catch {
    return empty;
  }
  return empty;
}

export function saveProgress(getStorage, state) {
  try {
    getStorage().setItem(storageKey, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function dueCards(state, day) {
  return Object.entries(state.cards)
    .filter(([, card]) => card.due <= day)
    .sort(([, a], [, b]) => (a.stage === 0) !== (b.stage === 0) ? a.stage - b.stage : a.due - b.due)
    .map(([id]) => id);
}

export function streak(state, day) {
  let cursor = state.activity[day] ? day : day - 1;
  while (state.activity[cursor]) cursor -= 1;
  return (state.activity[day] ? day : day - 1) - cursor;
}

export function summary(state, day) {
  const completed = Object.keys(state.completed).length;
  const days = streak(state, day);
  const due = dueCards(state, day).length;
  return {
    completed, days, due, today: state.activity[day] ?? 0,
    nextLesson: lessons.find((lesson) => !Object.hasOwn(state.completed, lesson.id)),
    badges: [
      { title: 'Bước đầu tiên', detail: 'Hoàn thành bài học đầu tiên', earned: completed > 0 },
      { title: 'Ba ngày bền bỉ', detail: 'Duy trì chuỗi 3 ngày', earned: consecutiveThree(state) },
      { title: 'Đi hết lộ trình', detail: `Hoàn thành ${lessons.length} bài học`, earned: completed === lessons.length },
    ],
  };
}

function consecutiveThree(state) {
  return Object.keys(state.activity).some((key) => state.activity[Number(key) - 1]
    && state.activity[Number(key) - 2]);
}

// A focus session is a short drill, not a completed curriculum lesson. Never
// move a scheduled card forward just to fill a batch or hand out extra XP.
export function focusPlan(state, day) {
  const due = dueCards(state, day);
  const candidates = Object.keys(skills).map((skill) => {
    const pool = lessons.filter((lesson) => lesson.skill === skill).flatMap((lesson) => lesson.questions.filter(objective));
    const skillIds = new Set(pool.map(({ id }) => id));
    const ready = due.filter((id) => skillIds.has(id));
    const unseen = pool.filter(({ id }) => !Object.hasOwn(state.cards, id));
    return {
      skill, mistakes: ready.filter((id) => state.cards[id].stage === 0).length,
      due: ready.length, unseenShare: unseen.length / pool.length,
      ids: ready.concat(unseen.map(({ id }) => id)).slice(0, 4),
    };
  }).filter(({ ids }) => ids.length);
  // Prioritize unresolved errors, then due reviews, then the least explored skill.
  candidates.sort((a, b) => b.mistakes - a.mistakes || b.due - a.due || b.unseenShare - a.unseenShare);
  return candidates[0];
}

export function weeklyChallenge(state, day) {
  const monday = day - (new Date(day * dayMs).getUTCDay() + 6) % 7;
  const active = (start, end) => Object.keys(state.activity).filter((key) => Number(key) >= start && Number(key) <= end).length;
  const days = active(monday, day);
  const tier = days >= 5 ? 'Vàng' : days >= 3 ? 'Bạc' : days >= 1 ? 'Đồng' : 'Khởi động';
  return { days, tier, previous: active(monday - 7, monday - 1) };
}

export function makeSession(lessonId, state, day) {
  if (lessonId === 'focus') {
    const plan = focusPlan(state, day);
    return plan ? { lessonId: null, focusSkill: plan.skill, ids: plan.ids, results: [] } : null;
  }
  if (lessonId === 'review') {
    const ids = dueCards(state, day).slice(0, reviewLimit);
    return ids.length ? { lessonId: null, ids, results: [] } : null;
  }
  return Object.hasOwn(byLesson, lessonId)
    ? { lessonId, ids: byLesson[lessonId].questions.map(({ id }) => id), results: [] }
    : null;
}

export function currentQuestion(session) {
  return questions[session.ids[session.results.length]];
}

const normalize = (value) => value.normalize('NFKC').toLowerCase().trim().replace(/\s+/g, ' ');
export const wordCount = (value) => (value.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? []).length;

export function assess(question, response) {
  if (question.type === 'speak') return response === true ? { correct: null } : null;
  if (question.type === 'write') return wordCount(response) >= question.minimum ? { correct: null } : null;
  if (question.type === 'choice') return response === null ? null : { correct: response === question.answer };
  const clean = normalize(response);
  return clean ? { correct: question.answers.some((answer) => normalize(answer) === clean) } : null;
}

function nextCard(previous, correct, day) {
  if (!correct) return { stage: 0, due: day };
  if (previous && previous.due > day) return previous;
  const stage = Math.min((previous?.stage ?? 0) + 1, intervals.length);
  return { stage, due: day + intervals[stage - 1] };
}

export function finish(state, session, day) {
  if (session.results.length !== session.ids.length) return null;
  const completed = { ...state.completed };
  const cards = { ...state.cards };
  let correct = 0;
  let total = 0;
  session.results.forEach((result, index) => {
    if (result.correct !== null) {
      const id = session.ids[index];
      cards[id] = nextCard(cards[id], result.correct, day);
      total += 1;
      correct += Number(result.correct);
    }
  });
  let earned = 0;
  if (session.lessonId) {
    const best = completed[session.lessonId];
    if (best === undefined) earned = 10;
    earned += Math.max(0, correct - (best ?? 0)) * 2;
    completed[session.lessonId] = Math.max(best ?? 0, correct);
  } else {
    earned = correct * 2;
  }
  return {
    earned, correct, total,
    state: {
      ...state, completed, cards, xp: state.xp + earned,
      activity: { ...state.activity, [day]: (state.activity[day] ?? 0) + 1 },
    },
  };
}
