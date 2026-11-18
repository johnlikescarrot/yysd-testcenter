/** Ứng dụng IELTS tiếng Việt: reducer thuần + lớp ghép DOM mỏng. */
import { STRINGS, t, assertVietnamese } from './vi.mjs';
import { createCard, reviewCard, dueQueue, mastery, DAY_MS } from './srs.mjs';
import {
  initialState, leagueFor, xpForLesson, awardXp, updateStreak, dailyProgress,
  setGoal, unlockBadges, leaderboard, bandEstimate, scoreToCefr,
  GOALS, MAX_HEARTS, BADGES, LEAGUES
} from './gamification.mjs';
import {
  SKILLS, QUESTIONS, PDFS, ROLEPLAY, SAMPLE_BOARD,
  questionsFor, checkAnswer, explain, skillById
} from './questions.mjs';
import { loadState, saveState } from './storage.mjs';

export const STORAGE_KEY = 'yysd-ielts-vi-v1';

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}

export function defaultState(now = 0) {
  return {
    ...initialState(now),
    lesson: null,
    feedback: null,
    message: '',
    sessionXp: 0,
    showLeagues: false,
    showSchools: false,
    showRoleplay: false,
    showBackup: false,
    reminder: false,
    cards: ['coherent', 'nuance', 'substantial', 'mitigate', 'scrutinise', 'allocate']
      .map((id, index) => createCard(id, now - index * DAY_MS))
  };
}

function questionById(id) {
  return QUESTIONS.find((question) => question.id === id) ?? null;
}

function completed(state, now) {
  const total = state.lesson.ids.length;
  const xp = xpForLesson({
    correct: state.lesson.correct,
    total,
    combo: state.streak,
    goalReached: dailyProgress(state) >= 100
  });
  let next = awardXp(state, xp, now);
  next = updateStreak(next, now);
  next = {
    ...next,
    lessons: next.lessons + 1,
    lesson: null,
    feedback: null,
    sessionXp: xp,
    message: t('completedLead', { xp })
  };
  return unlockBadges(next);
}

/** Mọi thay đổi trạng thái đều đi qua đây — thuần, dễ kiểm chứng 100%. */
export function reducer(state, action, context = {}) {
  const now = (context.now ?? (() => Date.now()))();
  switch (action.type) {
    case 'start': {
      if (state.hearts <= 0) return { ...state, message: STRINGS.heartsEmpty };
      const pool = questionsFor(action.skill, 'all', 3);
      if (pool.length === 0) return { ...state, message: STRINGS.noQuestion };
      return {
        ...state,
        hearts: state.hearts - 1,
        lastHeartLoss: now,
        lesson: { skill: action.skill, ids: pool.map((q) => q.id), index: 0, correct: 0 },
        feedback: null,
        message: ''
      };
    }
    case 'answer': {
      if (!state.lesson) return state;
      const question = questionById(state.lesson.ids[state.lesson.index]);
      const ok = checkAnswer(question, action.index);
      return {
        ...state,
        answered: state.answered + 1,
        correct: state.correct + (ok ? 1 : 0),
        lesson: { ...state.lesson, correct: state.lesson.correct + (ok ? 1 : 0) },
        feedback: { ok, text: explain(question, action.index), id: question ? question.id : null },
        message: ''
      };
    }
    case 'next': {
      if (!state.lesson || !state.feedback) return state;
      const index = state.lesson.index + 1;
      if (index < state.lesson.ids.length) {
        return { ...state, lesson: { ...state.lesson, index }, feedback: null };
      }
      return completed(state, now);
    }
    case 'review': {
      const queue = dueQueue(state.cards, now, 1);
      if (queue.length === 0) return { ...state, message: STRINGS.noDueCards };
      const target = queue[0];
      const cards = state.cards.map((card) => card.id === target.id ? reviewCard(card, 4, now) : card);
      return awardXp({ ...state, cards, message: `Đã ôn thẻ «${target.id}».` }, 2, now);
    }
    case 'goal':
      return setGoal(state, action.value);
    case 'refill':
      return { ...state, hearts: MAX_HEARTS, lastHeartLoss: null, message: '' };
    case 'pdf':
      return unlockBadges({ ...state, pdfsOpened: state.pdfsOpened + 1, message: '' });
    case 'leagues':
      return { ...state, showLeagues: !state.showLeagues };
    case 'schools':
      return { ...state, showSchools: !state.showSchools };
    case 'roleplay':
      return { ...state, showRoleplay: !state.showRoleplay };
    case 'reminder':
      return { ...state, reminder: !state.reminder };
    case 'backup':
      return { ...state, showBackup: !state.showBackup };
    case 'close':
      return {
        ...state, showBackup: false, showLeagues: false,
        showSchools: false, showRoleplay: false
      };
    case 'reset':
      return defaultState(now);
    default:
      return state;
  }
}

function stat(label, value, note) {
  return `<div class="stat"><span class="stat__label">${assertVietnamese(label)}</span>`
    + `<strong class="stat__value">${assertVietnamese(String(value))}</strong>`
    + `<span class="stat__note">${assertVietnamese(note)}</span></div>`;
}

function quizHtml(state) {
  const lesson = state.lesson;
  const question = questionById(lesson.ids[lesson.index]);
  const skill = skillById(lesson.skill);
  const options = question.options.map((option, index) =>
    `<li><button type="button" class="option" data-action="answer" data-index="${index}">`
    + `<span class="option__key">${String.fromCharCode(65 + index)}</span>`
    + `<span>${escapeHtml(option)}</span></button></li>`).join('');
  const feedback = state.feedback
    ? `<div class="feedback ${state.feedback.ok ? 'is-correct' : 'is-wrong'}" role="status">`
      + `<strong>${state.feedback.ok ? STRINGS.correctTitle : STRINGS.wrongTitle}</strong>`
      + `<p>${assertVietnamese(state.feedback.text)}</p>`
      + `<button type="button" class="btn btn--primary" data-action="next">${STRINGS.nextQuestion}</button></div>`
    : '';
  return `<section class="panel quiz" aria-labelledby="quiz-heading">`
    + `<h2 id="quiz-heading">${STRINGS.quizTitle} · ${skill.name}</h2>`
    + `<p class="muted">${t('quizProgress', { current: lesson.index + 1, total: lesson.ids.length })}</p>`
    + `<p class="quiz__prompt">${escapeHtml(question.prompt)}</p>`
    + `<ul class="options">${options}</ul>${feedback}</section>`;
}

function pathHtml() {
  const cards = SKILLS.map((skill) =>
    `<li class="skill" style="--skill:${skill.color}">`
    + `<span class="skill__icon" aria-hidden="true">${skill.icon}</span>`
    + `<h3>${skill.name}</h3><p>${skill.hint}</p>`
    + `<button type="button" class="btn btn--soft" data-action="start" data-skill="${skill.id}">`
    + `${STRINGS.startLesson}</button></li>`).join('');
  return `<section class="panel" aria-labelledby="today-heading">`
    + `<h2 id="today-heading">${STRINGS.todayTitle}</h2>`
    + `<p class="muted">${STRINGS.todayLead}</p><ul class="skills">${cards}</ul></section>`;
}

function badgesHtml(state) {
  if (state.badges.length === 0) return `<p class="muted">${STRINGS.badgesEmpty}</p>`;
  return `<ul class="badges">${BADGES.filter((badge) => state.badges.includes(badge.id))
    .map((badge) => `<li class="badge"><strong>${badge.name}</strong><span>${badge.hint}</span></li>`)
    .join('')}</ul>`;
}

function boardHtml(board, xp) {
  const entries = leaderboard([{ name: 'Bạn', xp, me: true }, ...board]);
  return `<ol class="board">${entries.map((entry) =>
    `<li class="${entry.me ? 'is-me' : ''}"><span>${entry.me ? 'Bạn' : escapeHtml(entry.name)}</span>`
    + `<b>${entry.xp} XP</b></li>`).join('')}</ol>`;
}

function goalsHtml(state) {
  return `<div class="goals" role="group" aria-label="${STRINGS.goalLabel}">`
    + GOALS.map((goal) => `<button type="button" data-action="goal" data-value="${goal}" `
      + `class="chip ${goal === state.dailyGoal ? 'is-active' : ''}" `
      + `aria-pressed="${goal === state.dailyGoal}">${goal} XP</button>`).join('')
    + `</div><div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" `
    + `aria-valuenow="${dailyProgress(state)}"><span style="width:${dailyProgress(state)}%"></span></div>`;
}

function pdfHtml() {
  return `<ul class="pdfs">${PDFS.map((pdf) =>
    `<li><a href="pdfs/${pdf.file}" target="_blank" rel="noopener" data-action="pdf" data-pdf="${pdf.id}">`
    + `<strong>${pdf.name}</strong><span>${pdf.note}</span><em>${STRINGS.pdfOpen} ↗</em></a></li>`).join('')}</ul>`;
}

export function render(state, model = {}) {
  const now = model.now ?? 0;
  const board = model.board ?? SAMPLE_BOARD;
  const due = dueQueue(state.cards, now).length;
  const league = leagueFor(state.xp);
  const band = bandEstimate({
    listening: state.band, reading: state.band, writing: state.band, speaking: state.band
  });
  const message = state.message
    ? `<p class="notice" role="status">${assertVietnamese(state.message)}</p>` : '';
  return `<a class="skip" href="#main">${STRINGS.skip}</a>`
    + `<header class="chrome"><div class="wrap chrome__inner">`
    + `<a class="brand" href="./"><span class="brand__mark" aria-hidden="true">Y</span>`
    + `<span><b>${STRINGS.brand}</b><small>${STRINGS.langNote}</small></span></a>`
    + `<nav aria-label="${STRINGS.navToday}"><a href="#today">${STRINGS.navToday}</a>`
    + `<a href="#library">${STRINGS.navResearch}</a>`
    + `<a href="#practice">${STRINGS.navPractice}</a></nav></div></header>`
    + `<main id="main" class="wrap">`
    + `<section class="hero"><p class="eyebrow">${STRINGS.heroEyebrow}</p>`
    + `<h1>${STRINGS.heroTitle}</h1><p class="lead">${STRINGS.heroLead}</p>`
    + `<div class="hero__actions"><a class="btn btn--primary" href="#today">${STRINGS.startFree}</a>`
    + `<a class="btn btn--ghost" href="#library">${STRINGS.openLibrary}</a></div>`
    + `<div class="hero__owl" aria-hidden="true"><span>🦉</span></div></section>`
    + `<section class="stats" aria-label="${STRINGS.statGoal}">`
    + stat(STRINGS.statXp, `${state.xp} XP`, league.name)
    + stat(STRINGS.statStreak, `${state.streak} ngày`, `Tốt nhất ${state.bestStreak}`)
    + stat(STRINGS.statHearts, `${state.hearts}/${MAX_HEARTS}`, state.hearts > 0 ? 'Sẵn sàng' : 'Cần nạp lại')
    + stat(STRINGS.statGoal, `${dailyProgress(state)}%`, `${state.todayXp}/${state.dailyGoal} XP`)
    + stat(STRINGS.statBand, band.toFixed(1), scoreToCefr(state.xp))
    + `</section>${message}`
    + (state.hearts === 0 ? `<p class="notice">${STRINGS.heartsEmpty}</p>` : '')
    + (state.lesson ? quizHtml(state) : `<div id="today">${pathHtml()}</div>`)
    + `<section class="panel" aria-labelledby="review-heading">`
    + `<h2 id="review-heading">${STRINGS.reviewTitle}</h2><p class="muted">${STRINGS.reviewLead}</p>`
    + `<p class="big">${due} <span>${STRINGS.dueCards}</span> · ${mastery(state.cards)}% thuộc</p>`
    + `<button type="button" class="btn btn--soft" data-action="review">${STRINGS.reviewNow}</button></section>`
    + `<section id="practice" class="panel" aria-labelledby="gamification-heading">`
    + `<h2 id="gamification-heading">${STRINGS.gamificationTitle}</h2>`
    + `<p class="muted">${STRINGS.gamificationLead}</p>`
    + `<h3>${STRINGS.goalLabel}</h3>${goalsHtml(state)}`
    + `<p class="muted">${STRINGS.cefrNote}</p>`
    + `<h3>${STRINGS.badgesTitle}</h3>${badgesHtml(state)}`
    + `<div class="row"><button type="button" class="btn btn--soft" data-action="leagues">${STRINGS.navLeagues}</button>`
    + `<button type="button" class="btn btn--soft" data-action="refill">${STRINGS.refill}</button>`
    + `<button type="button" class="btn btn--soft" data-action="reminder">${STRINGS.reminderToggle}</button></div>`
    + `<p class="muted">${STRINGS.reminderTitle}: ${state.reminder ? STRINGS.reminderOn : STRINGS.reminderOff}</p>`
    + `<p class="muted">${STRINGS.bandNote}</p>`
    + (state.showLeagues ? `<div class="sheet">${LEAGUES.map((item) =>
      `<span class="chip">${item.name} · ${item.minXp} XP</span>`).join('')}`
      + `<h3>${STRINGS.leaguesTitle}</h3><p class="muted">${STRINGS.leaguesLead}</p>`
      + boardHtml(board, state.xp) + `<button type="button" class="btn btn--ghost" data-action="close">${STRINGS.close}</button></div>` : '')
    + `</section>`
    + `<section id="library" class="panel" aria-labelledby="library-heading">`
    + `<h2 id="library-heading">${STRINGS.researchTitle}</h2>`
    + `<p class="muted">${STRINGS.researchLead}</p><p class="muted">${STRINGS.researchNote}</p>`
    + pdfHtml() + `<p class="muted"><a href="nghien-cuu.html">${STRINGS.openScholarIndex}</a> · `
    + `${STRINGS.scholarLink}: <a href="https://scholar.google.com/" target="_blank" rel="noopener">`
    + `scholar.google.com ↗</a></p></section>`
    + `<section class="panel" aria-labelledby="schools-heading">`
    + `<h2 id="schools-heading">${STRINGS.schoolsTitle}</h2><p class="muted">${STRINGS.schoolsLead}</p>`
    + `<button type="button" class="btn btn--soft" data-action="schools">${STRINGS.navSchools}</button>`
    + (state.showSchools ? `<p class="sheet">${STRINGS.schoolsPanel}</p>` : '') + `</section>`
    + `<section class="panel" aria-labelledby="roleplay-heading">`
    + `<h2 id="roleplay-heading">${STRINGS.roleplayTitle}</h2><p class="muted">${STRINGS.roleplayLead}</p>`
    + `<button type="button" class="btn btn--soft" data-action="roleplay">${STRINGS.navPractice}</button>`
    + (state.showRoleplay ? `<div class="sheet"><p><b>Giám khảo:</b> «${ROLEPLAY.examiner}»</p><ol>`
      + ROLEPLAY.outline.map((item) => `<li>${item}</li>`).join('') + `</ol></div>` : '') + `</section>`
    + `<section class="panel" aria-labelledby="privacy-heading">`
    + `<h2 id="privacy-heading">${STRINGS.reminderLead}</h2>`
    + `<div class="row"><button type="button" class="btn btn--soft" data-action="backup">${STRINGS.backup}</button>`
    + `<button type="button" class="btn btn--ghost" data-action="reset">${STRINGS.reset}</button></div>`
    + (state.showBackup ? `<div class="sheet"><h3>${STRINGS.backupTitle}</h3>`
      + `<p class="muted">${STRINGS.backupLead}</p><pre>${escapeHtml(JSON.stringify(state))}</pre>`
      + `<button type="button" class="btn btn--ghost" data-action="close">${STRINGS.close}</button></div>` : '')
    + `</section></main><footer class="footer"><div class="wrap">`
    + `<p>${STRINGS.footerNote}</p><p>${STRINGS.footerRights}</p></div></footer>`;
}

const ACTIONS = Object.freeze({
  start: 'start', answer: 'answer', next: 'next', review: 'review', goal: 'goal',
  refill: 'refill', pdf: 'pdf', leagues: 'leagues', schools: 'schools',
  roleplay: 'roleplay', reminder: 'reminder', backup: 'backup', close: 'close', reset: 'reset'
});

export function createApp({ document: doc, storage, now = () => Date.now() } = {}) {
  if (!doc) throw new Error('Thiếu document');
  const root = doc.getElementById('app');
  if (!root) throw new Error('Thiếu phần tử #app');
  let state = loadState(storage, STORAGE_KEY, defaultState(now()));
  const context = { now };
  const draw = () => { root.innerHTML = render(state); };
  const dispatch = (action) => {
    state = reducer(state, action, context);
    saveState(storage, STORAGE_KEY, state);
    draw();
    return { ...state };
  };
  root.addEventListener('click', (event) => {
    const node = event.target && event.target.closest ? event.target.closest('[data-action]') : null;
    if (!node) return;
    const type = ACTIONS[node.dataset.action];
    if (!type) return;
    dispatch({
      type,
      skill: node.dataset.skill,
      index: Number(node.dataset.index),
      value: Number(node.dataset.value),
      pdf: node.dataset.pdf
    });
  });
  draw();
  return { getState: () => ({ ...state }), dispatch, draw, root };
}
