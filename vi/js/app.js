/**
 * Bộ điều khiển ứng dụng: nhận hành động từ DOM, cập nhật state/ui và trả HTML mới.
 * Hoàn toàn không chạm DOM trực tiếp để có thể kiểm thử 100%.
 */

import { dayKey } from './core/date.js';
import {
  setGoal,
  toggleSetting,
  exportState,
  importState,
  recordLesson,
  recordReview,
} from './core/state.js';
import {
  buyStreakFreeze,
  repairStreak,
  refillHearts,
  applyAnswer,
} from './core/gamify.js';
import { checkAnswer, buildTokens, pickReviewWords, normalizeAnswer } from './core/quiz.js';
import { nextLesson } from './core/content.js';
import { renderDashboard } from './views/dashboard.js';
import { renderLearn } from './views/learn.js';
import { renderLesson } from './views/lesson.js';
import { renderPractice } from './views/practice.js';
import { renderProgress } from './views/progress.js';
import { renderLibrary } from './views/library.js';

export const PAGES = ['dashboard', 'learn', 'lesson', 'practice', 'progress', 'library'];

const MODES = ['the', 'nghe', 'viet', 'noi'];

function tokensFor(exercise) {
  return exercise && exercise.type === 'build' ? buildTokens(exercise) : [];
}

/** Trạng thái giao diện ban đầu cho từng trang. */
export function createInitialUi({ page, state, data, now }) {
  const base = { now };
  if (page === 'lesson') {
    const exercise = data?.lesson?.exercises?.[0];
    return {
      ...base,
      index: 0,
      selected: [],
      draft: '',
      feedback: null,
      results: [],
      hint: false,
      finished: false,
      summary: null,
      tokens: tokensFor(exercise),
    };
  }
  if (page === 'practice') {
    const vocab = data?.vocab || [];
    const queue = pickReviewWords(state?.cards || {}, vocab, now, 20);
    const ids = queue.length > 0 ? queue.map((word) => word.id) : vocab.slice(0, 12).map((word) => word.id);
    return {
      ...base,
      mode: 'the',
      queue: ids,
      pos: 0,
      revealed: false,
      dict: { wordId: ids[0] || null, draft: '', feedback: null },
      writingTask: 0,
      writingOpen: null,
      speakingOpen: null,
      timer: null,
    };
  }
  if (page === 'library') {
    return { ...base, query: '', tag: 'all' };
  }
  return base;
}

/** Render HTML của trang hiện tại. */
export function renderPage({ page, state, data, ui, now }) {
  const at = now ?? ui?.now ?? Date.now();
  switch (page) {
    case 'dashboard':
      return renderDashboard({ state, data, now: at });
    case 'learn':
      return renderLearn({ state, data, now: at });
    case 'lesson':
      return renderLesson({ state, data, ui, now: at });
    case 'practice':
      return renderPractice({ state, data, ui: { ...ui, now: at } });
    case 'progress':
      return renderProgress({ state, data, ui: { ...ui, now: at }, now: at });
    case 'library':
      return renderLibrary({ state, data, ui });
    default:
      return renderDashboard({ state, data, now: at });
  }
}

/** Tạo bộ điều khiển cho một trang. */
export function createController({ page, state, data, ui, deps = {} }) {
  const clock = deps.now || (() => Date.now());
  let currentState = state;
  let currentUi = ui || createInitialUi({ page, state, data, now: clock() });
  const effects = [];

  const view = () => {
    currentUi = { ...currentUi, now: currentUi.now || clock() };
    return renderPage({ page, state: currentState, data, ui: currentUi, now: currentUi.now });
  };

  const emit = (effect) => effects.push(effect);

  const resetExerciseUi = (exercise) => ({
    ...currentUi,
    selected: [],
    draft: '',
    feedback: null,
    hint: false,
    tokens: tokensFor(exercise),
  });

  function finishLesson() {
    const { unit, lesson } = data;
    const outcome = recordLesson(currentState, {
      unit,
      lesson,
      results: currentUi.results,
      now: currentUi.now,
    });
    currentState = outcome.state;
    const next = nextLesson(currentState, data.curriculum);
    currentUi = {
      ...currentUi,
      finished: true,
      summary: { score: outcome.score, xp: outcome.xp, gems: outcome.gems, unlocked: outcome.unlocked, next },
    };
    emit({ type: 'toast', text: `+${outcome.xp} XP · chuỗi ${currentState.streak} ngày` });
    if (outcome.unlocked.length > 0) {
      emit({ type: 'toast', text: `Mở khoá: ${outcome.unlocked.map((item) => item.title).join(', ')}` });
    }
  }

  function checkExercise(detail) {
    if (currentUi.feedback) return;
    const exercise = data.lesson.exercises[currentUi.index];
    if (!exercise) return;
    let response = null;
    if (exercise.type === 'mcq') {
      response = Array.isArray(currentUi.selected) && currentUi.selected.length > 0 ? currentUi.selected[0] : null;
    } else if (exercise.type === 'build') {
      response = (currentUi.selected || []).map((id) => currentUi.tokens.find((token) => token.id === id)?.text);
    } else {
      response = detail?.text ?? currentUi.draft;
    }
    const result = checkAnswer(exercise, response);
    currentState = applyAnswer(currentState, { correct: result.correct, skill: exercise.skill });
    currentUi = {
      ...currentUi,
      feedback: result,
      draft: exercise.type === 'gap' || exercise.type === 'listen' ? String(response ?? '') : currentUi.draft,
      results: [...currentUi.results, result.correct],
    };
    if (result.correct) emit({ type: 'toast', text: 'Chính xác! Chuỗi đúng tăng thêm 1.' });
  }

  function skipExercise() {
    if (currentUi.feedback) return;
    const exercise = data.lesson.exercises[currentUi.index];
    if (!exercise) return;
    const result = checkAnswer(exercise, null);
    currentState = applyAnswer(currentState, { correct: false, skill: exercise.skill });
    currentUi = {
      ...currentUi,
      feedback: { ...result, correct: false },
      results: [...currentUi.results, false],
    };
  }

  function nextExercise() {
    if (!currentUi.feedback) return;
    toNextExercise();
  }

  function toNextExercise() {
    const exercises = data.lesson.exercises;
    const index = currentUi.index + 1;
    if (index >= exercises.length) {
      finishLesson();
      return;
    }
    const exercise = exercises[index];
    currentUi = { ...resetExerciseUi(exercise), index };
    if (exercise.type === 'listen') {
      emit({ type: 'speak', text: exercise.audio || exercise.stem, rate: 1 });
    }
  }

  function switchMode(mode) {
    if (!MODES.includes(mode)) return;
    currentUi = { ...currentUi, mode, revealed: false };
  }

  function gradeCard(grade) {
    const wordId = currentUi.queue[currentUi.pos];
    if (!wordId) return;
    const before = currentState.gems;
    currentState = recordReview(currentState, wordId, grade, currentUi.now);
    const gained = currentState.gems - before;
    if (gained > 0) emit({ type: 'toast', text: `+${gained} đá quý từ nhiệm vụ` });
    currentUi = { ...currentUi, pos: currentUi.pos + 1, revealed: false };
  }

  function checkDictation(detail) {
    if (currentUi.dict.feedback) return;
    const word = data.vocab.find((item) => item.id === currentUi.dict.wordId);
    if (!word) return;
    const typed = detail?.text ?? currentUi.dict.draft;
    const correct = normalizeAnswer(typed) === normalizeAnswer(word.term);
    currentState = recordReview(currentState, word.id, correct ? 'good' : 'again', currentUi.now);
    currentUi = {
      ...currentUi,
      dict: {
        ...currentUi.dict,
        draft: String(typed ?? ''),
        feedback: { correct, expected: word.term },
      },
    };
    if (correct) emit({ type: 'toast', text: 'Nghe chuẩn! Thẻ đã được lên lịch ôn.' });
  }

  function nextDictation() {
    const queue = currentUi.queue;
    if (queue.length === 0) return;
    const nextIndex = (currentUi.pos + 1) % queue.length;
    currentUi = {
      ...currentUi,
      pos: nextIndex,
      dict: { wordId: queue[nextIndex], draft: '', feedback: null },
    };
    emit({ type: 'speak', text: data.vocab.find((word) => word.id === queue[nextIndex])?.term, rate: 1 });
  }

  function startTimer(detail) {
    const seconds = Number(detail?.value);
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    currentUi = {
      ...currentUi,
      timer: {
        startedAt: currentUi.now,
        limit: seconds * 1000,
        kind: detail?.kind === 'prep' ? 'prep' : 'speak',
        topic: detail?.topic || '',
        label: formatTimer(seconds * 1000, 0),
      },
    };
  }

  function dispatch(action, detail = {}) {
    const now = clock();
    currentUi = { ...currentUi, now };
    switch (action) {
      case 'set-goal':
        currentState = setGoal(currentState, Number(detail.value));
        break;
      case 'buy-freeze': {
        const result = buyStreakFreeze(currentState);
        currentState = result.state;
        emit({ type: 'toast', text: result.message });
        break;
      }
      case 'repair-streak': {
        const result = repairStreak(currentState, now);
        currentState = result.state;
        emit({ type: 'toast', text: result.message });
        break;
      }
      case 'refill-hearts': {
        const result = refillHearts(currentState, now);
        currentState = result.state;
        emit({ type: 'toast', text: result.message });
        break;
      }
      case 'toggle-setting':
        currentState = toggleSetting(currentState, detail.value);
        break;
      case 'export-data':
        emit({ type: 'download', filename: `yysd-ielts-${dayKey(now)}.json`, content: exportState(currentState, now) });
        break;
      case 'import-data': {
        const result = importState(detail.text, now);
        if (result.ok) currentState = result.state;
        emit({ type: 'toast', text: result.message });
        break;
      }
      case 'mode':
        switchMode(detail.value);
        break;
      case 'reveal-card':
        currentUi = { ...currentUi, revealed: true };
        break;
      case 'grade-card':
        gradeCard(detail.value);
        break;
      case 'restart-review': {
        const due = pickReviewWords(currentState.cards, data.vocab, now, 20);
        const queue = due.length > 0 ? due.map((word) => word.id) : data.vocab.slice(0, 12).map((word) => word.id);
        currentUi = { ...currentUi, queue, pos: 0, revealed: false, dict: { wordId: queue[0] || null, draft: '', feedback: null } };
        break;
      }
      case 'play-word': {
        const word = data.vocab.find((item) => item.id === detail.value);
        if (word) emit({ type: 'speak', text: word.term, rate: detail.slow ? 0.75 : 1 });
        break;
      }
      case 'check-dictation':
        checkDictation(detail);
        break;
      case 'next-dictation':
        nextDictation();
        break;
      case 'writing-task':
        currentUi = { ...currentUi, writingTask: Number(detail.value) || 0 };
        break;
      case 'toggle-writing':
        currentUi = { ...currentUi, writingOpen: currentUi.writingOpen === detail.value ? null : detail.value };
        break;
      case 'toggle-speaking':
        currentUi = { ...currentUi, speakingOpen: currentUi.speakingOpen === detail.value ? null : detail.value };
        break;
      case 'start-timer':
        startTimer(detail);
        break;
      case 'stop-timer':
        currentUi = { ...currentUi, timer: null };
        break;
      case 'search-papers':
        currentUi = { ...currentUi, query: detail.text ?? '', tag: 'all' };
        break;
      case 'filter-tag':
        currentUi = { ...currentUi, tag: detail.value || 'all' };
        break;
      case 'clear-search':
        currentUi = { ...currentUi, query: '', tag: 'all' };
        break;
      case 'choose-option':
        if (!currentUi.feedback) currentUi = { ...currentUi, selected: [Number(detail.value)] };
        break;
      case 'select-token': {
        const selected = Array.isArray(currentUi.selected) ? currentUi.selected : [];
        if (!currentUi.feedback && !selected.includes(detail.value)) {
          currentUi = { ...currentUi, selected: [...selected, detail.value] };
        }
        break;
      }
      case 'undo-token': {
        const selected = Array.isArray(currentUi.selected) ? currentUi.selected : [];
        if (!currentUi.feedback) {
          currentUi = { ...currentUi, selected: selected.filter((id) => id !== detail.value) };
        }
        break;
      }
      case 'hint':
        currentUi = { ...currentUi, hint: true };
        break;
      case 'play-audio': {
        const exercise = data?.lesson?.exercises?.[currentUi.index];
        if (exercise) {
          emit({ type: 'speak', text: exercise.audio || exercise.stem, rate: detail.value === 'slow' ? 0.72 : 1 });
        }
        break;
      }
      case 'check':
        checkExercise(detail);
        break;
      case 'skip':
        skipExercise();
        break;
      case 'next':
        nextExercise();
        break;
      default:
        break;
    }

    if (action === 'draft') {
      const text = String(detail.text ?? '');
      currentUi = {
        ...currentUi,
        draft: text,
        dict: detail.scope === 'dict' && currentUi.dict ? { ...currentUi.dict, draft: text } : currentUi.dict,
      };
    }

    if (deps.persist) deps.persist(currentState);

    const html = view();
    const out = effects.splice(0, effects.length);
    for (const effect of out) {
      if (effect.type === 'speak' && deps.speak) deps.speak(effect.text, effect.rate);
      if (effect.type === 'toast' && deps.notify) deps.notify(effect.text);
      if (effect.type === 'download' && deps.download) deps.download(effect.filename, effect.content);
    }
    return { html, effects: out, state: currentState };
  }

  function tick(now = clock()) {
    const started = currentUi.timer;
    if (!started) return view();
    const remaining = Math.max(0, started.startedAt + started.limit - now);
    currentUi = {
      ...currentUi,
      now,
      timer: { ...started, label: formatTimer(remaining, now) },
    };
    return view();
  }

  function sync(state) {
    currentState = state;
    return view();
  }

  return {
    page,
    html: view,
    tick,
    dispatch,
    sync,
    getState: () => currentState,
    getUi: () => currentUi,
  };
}

/** Định dạng đồng hồ đếm ngược MM:SS. */
export function formatTimer(remainingMs, now = 0) {
  const total = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  const suffix = now && total === 0 ? ' · hết giờ' : '';
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}${suffix}`;
}
