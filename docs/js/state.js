import { MAX_HEARTS, GOALS, INTERVALS, QUESTIONS, LEAGUES, BADGES, SCORE_TABLE } from './data.js';

export function createInitialState(day) {
  return {
    day,
    xp: 0,
    xpToday: 0,
    xpWeek: 0,
    hearts: MAX_HEARTS,
    streak: 0,
    lastDay: '',
    goalIndex: 2,
    answered: 0,
    correct: 0,
    lessonIndex: 0,
    inLesson: false,
    feedback: null,
    feedbackKind: '',
    theme: 'auto',
    friendStreak: false,
    cards: [],
    view: 'hoc',
    resetOpen: false
  };
}

export function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function addDays(day, amount) {
  const stamp = Date.parse(day + 'T00:00:00Z') + amount * 86400000;
  return new Date(stamp).toISOString().slice(0, 10);
}

export function dayDifference(from, to) {
  if (from === '') return 1;
  const a = Date.parse(from + 'T00:00:00Z');
  const b = Date.parse(to + 'T00:00:00Z');
  return Math.round((b - a) / 86400000);
}

export function nextStreak(state, today) {
  const diff = dayDifference(state.lastDay, today);
  if (diff === 0) return state.streak;
  if (diff === 1) return state.streak + 1;
  return 1;
}

export function normalise(value) {
  return String(value).trim().toLowerCase().replace(/\s+/g, ' ');
}

export function isCorrect(question, choice) {
  return normalise(choice) === normalise(question.answer);
}

export function scheduleCard(card, correct, day) {
  const repetitions = card.repetitions + 1;
  const position = clamp(repetitions - 1, 0, INTERVALS.length - 1);
  const interval = INTERVALS[position];
  if (correct) {
    return { id: card.id, repetitions, interval, due: addDays(day, interval) };
  }
  return { id: card.id, repetitions: 0, interval: 1, due: addDays(day, 1) };
}

export function mergeCard(cards, card) {
  return cards.filter((item) => item.id !== card.id).concat([card]);
}

export function applyAnswer(state, question, choice, day) {
  const correct = isCorrect(question, choice);
  let gained = 2;
  let hearts = state.hearts;
  if (correct) {
    gained = question.xp;
  } else {
    hearts = clamp(state.hearts - 1, 0, MAX_HEARTS);
  }
  const seed = { id: question.id, repetitions: 0, interval: 1, due: day };
  const card = scheduleCard(seed, correct, day);
  let added = 0;
  if (correct) added = 1;
  return {
    correct,
    state: {
      ...state,
      day,
      lastDay: day,
      streak: nextStreak(state, day),
      xp: state.xp + gained,
      xpToday: state.xpToday + gained,
      xpWeek: state.xpWeek + gained,
      hearts,
      answered: state.answered + 1,
      correct: state.correct + added,
      cards: mergeCard(state.cards, card),
      feedback: correct ? question.explainCorrect : question.explainWrong,
      feedbackKind: correct ? 'good' : 'bad',
      lessonIndex: state.lessonIndex + 1
    }
  };
}

export function startLesson(state) {
  return { ...state, inLesson: true, feedback: null, feedbackKind: '', lessonIndex: state.lessonIndex };
}

export function advanceLesson(state) {
  const next = state.lessonIndex + 1;
  if (next >= QUESTIONS.length) {
    return { ...state, lessonIndex: 0, inLesson: false, feedback: null, feedbackKind: '' };
  }
  return { ...state, lessonIndex: next, feedback: null, feedbackKind: '' };
}

export function levelFor(xp) {
  return Math.floor(xp / 100) + 1;
}

export function leagueFor(weeklyXp) {
  return LEAGUES.filter((league) => weeklyXp >= league.min).at(-1);
}

export function bandFor(xp) {
  return SCORE_TABLE.filter((row) => xp >= row.min).at(-1).band;
}

export function dailyPercent(state) {
  return Math.min(100, Math.round((state.xpToday / GOALS[state.goalIndex]) * 100));
}

export function accuracy(state) {
  if (state.answered === 0) return 0;
  return Math.round((state.correct / state.answered) * 100);
}

export function dueCards(cards, day) {
  return cards.filter((card) => card.due <= day);
}

export function earnedBadges(state) {
  return BADGES.filter((badge) => badge.test(state)).map((badge) => badge.id);
}

export function nextGoalIndex(index) {
  if (index >= GOALS.length - 1) return 0;
  return index + 1;
}

export function cycleGoal(state) {
  return { ...state, goalIndex: nextGoalIndex(state.goalIndex) };
}

export function refillHearts(state) {
  return { ...state, hearts: MAX_HEARTS };
}

export function toggleFriend(state) {
  return { ...state, friendStreak: !state.friendStreak };
}

export function toggleTheme(state) {
  if (state.theme === 'auto') return { ...state, theme: 'dark' };
  return { ...state, theme: 'auto' };
}

export function setView(state, view) {
  return { ...state, view };
}

export function openReset(state) {
  return { ...state, resetOpen: true };
}

export function closeReset(state) {
  return { ...state, resetOpen: false };
}

export function startReview(state, day) {
  const due = dueCards(state.cards, day).length;
  return {
    ...state,
    inLesson: true,
    view: 'hoc',
    feedback: 'Có ' + due + ' thẻ cần ôn tập hôm nay. Hãy trả lời lại để kéo dài khoảng cách ôn.',
    feedbackKind: 'note'
  };
}

export function resetProgress(day) {
  return createInitialState(day);
}
