import { GOALS, QUESTIONS, UNITS, PDFS } from './data.js';
import * as S from './state.js';
import * as R from './render.js';
import { loadState, saveState } from './storage.js';

export function createApp(doc, storage, day) {
  let state = loadState(storage, day);
  const find = (id) => doc.getElementById(id);

  const actions = {
    start: () => {
      state = S.startLesson(state);
    },
    answer: (button) => {
      const question = QUESTIONS[state.lessonIndex % QUESTIONS.length];
      state = S.applyAnswer(state, question, button.getAttribute('data-choice'), day).state;
    },
    next: () => {
      state = S.advanceLesson(state);
    },
    review: () => {
      state = S.startReview(state, day);
    },
    goal: () => {
      state = S.cycleGoal(state);
    },
    heart: () => {
      state = S.refillHearts(state);
    },
    friend: () => {
      state = S.toggleFriend(state);
    },
    theme: () => {
      state = S.toggleTheme(state);
    },
    tab: (button) => {
      state = S.setView(state, button.getAttribute('data-view'));
    },
    'reset-open': () => {
      state = S.openReset(state);
    },
    'reset-yes': () => {
      state = S.resetProgress(day);
    },
    'reset-no': () => {
      state = S.closeReset(state);
    },
    close: () => {
      state = S.closeReset(state);
    }
  };

  function render() {
    find('stat-streak').textContent = String(state.streak);
    find('stat-xp').textContent = String(state.xp);
    find('stat-level').textContent = String(S.levelFor(state.xp));
    find('stat-hearts').textContent = String(state.hearts);
    find('stat-goal').textContent = String(GOALS[state.goalIndex]);
    find('stat-band').textContent = S.bandFor(state.xp);
    find('goal-bar').value = S.dailyPercent(state);
    find('goal-text').textContent = state.xpToday + ' / ' + GOALS[state.goalIndex] + ' XP';
    find('stat-answered').textContent = String(state.answered);
    find('stat-accuracy').textContent = String(S.accuracy(state));
    find('stat-due').textContent = String(S.dueCards(state.cards, day).length);
    find('stat-lastday').textContent = R.renderLastDay(state);
    find('lesson-status').textContent = R.renderLessonStatus(state);
    find('unit-list').innerHTML = R.renderUnits(UNITS);
    find('league-body').innerHTML = R.renderLeague(state);
    find('league-name').textContent = S.leagueFor(state.xpWeek).name;
    find('badge-list').innerHTML = R.renderBadges(state);
    find('pdf-list').innerHTML = R.renderPdfs(PDFS);
    const question = QUESTIONS[state.lessonIndex % QUESTIONS.length];
    let lesson = R.renderIntro();
    if (state.inLesson) lesson = R.renderQuestion(question, state.lessonIndex % QUESTIONS.length);
    find('lesson-area').innerHTML = lesson;
    find('feedback').innerHTML = R.renderFeedback(state);
    find('reset-dialog').hidden = !state.resetOpen;
    doc.body.classList.toggle('theme-dark', state.theme === 'dark');
    const themeButton = doc.querySelector('[data-action="theme"]');
    themeButton.setAttribute('aria-pressed', String(state.theme === 'dark'));
    find('year').textContent = day.slice(0, 4);
  }

  doc.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (button === null) return;
    const handler = actions[button.getAttribute('data-action')];
    if (handler === undefined) return;
    handler(button);
    saveState(storage, state);
    render();
  });

  render();
  return { render, actions };
}
