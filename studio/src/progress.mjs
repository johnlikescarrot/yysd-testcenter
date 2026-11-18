import { cards, lessons } from "./lessons.mjs";

export const storageKey = "yysd:ielts-atlas:v1";
const intervals = [1, 3, 7, 14, 30];
export const empty = () => ({ version: 1, goal: 1, sessions: [] });

// An ordinal for the *local calendar day*: DST does not shorten a study day.
export function localDay(date) {
  return (
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000
  );
}
export function lessonCards(lesson) {
  return lesson.items.map((_, i) => `${lesson.id}:${i}`);
}
function validSession(s) {
  if (
    !s ||
    !Number.isSafeInteger(s.day) ||
    !Array.isArray(s.picks) ||
    !s.picks.length ||
    s.picks.length > 5
  )
    return false;
  const ids = new Set();
  for (const pick of s.picks) {
    if (!Array.isArray(pick)) return false;
    const [id, choice] = pick;
    if (
      !cards.has(id) ||
      ids.has(id) ||
      !Number.isInteger(choice) ||
      choice < 0 ||
      choice >= cards.get(id).options.length
    )
      return false;
    ids.add(id);
  }
  if (s.unit === "review") return true;
  const lesson = lessons.find((l) => l.id === s.unit);
  return (
    !!lesson &&
    ids.size === lesson.items.length &&
    lessonCards(lesson).every((id) => ids.has(id))
  );
}
export function restore(raw) {
  try {
    const s = JSON.parse(raw);
    if (
      s?.version === 1 &&
      [1, 2, 3].includes(s.goal) &&
      Array.isArray(s.sessions) &&
      s.sessions.every(validSession)
    )
      return s;
  } catch {
    /* A partial write or an incompatible value must not block practice. */
  }
  return empty();
}
export function summarize(state, today) {
  const boxes = new Map(),
    days = new Map(),
    completed = new Set(),
    credited = new Set();
  let xp = 0;
  for (const { day, unit, picks } of state.sessions) {
    if (day > today) continue;
    const units = days.get(day) ?? new Set();
    if (unit !== "review") {
      completed.add(unit);
      if (!units.has(unit)) xp += 10;
    }
    units.add(unit);
    days.set(day, units);
    for (const [id, choice] of picks) {
      const previous = boxes.get(id),
        correct = cards.get(id).key === choice;
      const stamp = `${day}/${id}`;
      if (correct && !credited.has(stamp)) {
        xp += 5;
        credited.add(stamp);
      }
      if (!correct) boxes.set(id, { due: day, step: 0 });
      else if (!previous || previous.due <= day) {
        const step = Math.min(previous?.step ?? 0, intervals.length - 1);
        boxes.set(id, { due: day + intervals[step], step: step + 1 });
      }
    }
  }
  let cursor = days.has(today) ? today : today - 1,
    streak = 0;
  while (days.has(cursor--)) streak++;
  const due = [...boxes]
    .filter(([, b]) => b.due <= today)
    .sort((a, b) => a[1].due - b[1].due)
    .map(([id]) => id);
  const next =
    lessons.find((l) => !completed.has(l.id)) ??
    lessons[today % lessons.length];
  const badges = [
    completed.size > 0,
    new Set(lessons.filter((l) => completed.has(l.id)).map((l) => l.skill))
      .size === 4,
    [...days.keys()].some((d) => days.has(d - 1) && days.has(d - 2)),
  ];
  return {
    xp,
    streak,
    due,
    days,
    completed,
    next,
    badges,
    count: days.get(today)?.size ?? 0,
  };
}
