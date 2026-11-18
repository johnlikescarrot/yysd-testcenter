import { cards, lessons } from "./course.mjs";

const key = "yysd.ielts.vi.progress.v1";
const intervals = [1, 3, 7, 14];
const dayMs = 86400000;

// Calendar-day ordinals: local midnight, not elapsed hours or a UTC streak.
export function dayOf(date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / dayMs;
}

export function fresh() {
  return { version: 1, history: {}, review: {}, completed: [] };
}

const known = new Set(cards.map((q) => q.id));
const courseIds = new Set(lessons.map((l) => l.id));
const record = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const validDay = (day) =>
  Number.isSafeInteger(day) && day >= 0 && day <= 3652059;

export function restore(store) {
  try {
    const s = JSON.parse(store.getItem(key));
    if (
      !record(s) ||
      s.version !== 1 ||
      !record(s.history) ||
      !record(s.review) ||
      !Array.isArray(s.completed)
    )
      return fresh();
    const out = fresh();
    out.completed = [...new Set(s.completed.filter((id) => courseIds.has(id)))];
    for (const [d, ids] of Object.entries(s.history)) {
      if (validDay(+d) && String(+d) === d && Array.isArray(ids)) {
        const keep = [...new Set(ids.filter((id) => known.has(id)))];
        if (keep.length) out.history[d] = keep;
      }
    }
    for (const [id, r] of Object.entries(s.review)) {
      if (
        known.has(id) &&
        record(r) &&
        validDay(r.due) &&
        Number.isInteger(r.level) &&
        r.level >= 0 &&
        r.level <= intervals.length
      )
        out.review[id] = { due: r.due, level: r.level };
    }
    return out;
  } catch {
    return fresh();
  }
}

export function save(store, state) {
  try {
    store.setItem(key, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

// Commit a completed session, not half an attempt. XP marks practice, not a band.
export function finish(s, day, results, lessonId) {
  const ids = new Set(s.history[day] || []);
  const previous = ids.size;
  for (const { id, correct } of results) {
    ids.add(id);
    const old = s.review[id];
    if (!correct) s.review[id] = { due: day, level: 0 };
    else if (!old || old.due <= day) {
      const level = Math.min((old?.level || 0) + 1, intervals.length);
      s.review[id] = { level, due: day + intervals[level - 1] };
    }
  }
  s.history[day] = [...ids];
  if (lessonId && !s.completed.includes(lessonId)) s.completed.push(lessonId);
  return (ids.size - previous) * 5;
}

export function dueCards(s, day) {
  return cards
    .filter((c) => s.review[c.id]?.due <= day)
    .sort((a, b) => s.review[a.id].due - s.review[b.id].due);
}

export function summary(s, day) {
  let cursor = s.history[day] ? day : day - 1;
  let streak = 0;
  while (s.history[cursor--]) streak++;
  return {
    streak,
    xp: Object.values(s.history).reduce((n, ids) => n + ids.length * 5, 0),
    week: Array.from({ length: 7 }, (_, i) => Boolean(s.history[day - 6 + i])),
    next: lessons.find((l) => !s.completed.includes(l.id)) || lessons[0],
    skills: new Set(
      lessons.filter((l) => s.completed.includes(l.id)).map((l) => l.skill),
    ).size,
  };
}
