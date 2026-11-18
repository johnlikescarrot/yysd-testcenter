/* =========================================================================
   page-lesson.js — trình học tương tác: chọn đáp án, điền từ, sắp xếp câu,
   nghe, tim, chuỗi đúng, tổng kết XP, cập nhật SRS.
   ========================================================================= */

import { createI18n } from "./i18n.js";
import { applySession, earnedBadges, loseHeart, refreshHearts } from "./gamify.js";
import { checkAnswer, expectedAnswer, scoreSession } from "./quiz.js";
import { gradeQuestion } from "./srs.js";
import { createEl, q, setText, updateTopbar } from "./page-common.js";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

/** Giọng đọc mặc định dùng Web Speech API nếu có. */
export function createSpeech(win) {
  const synth = win?.speechSynthesis;
  return {
    supported: Boolean(synth),
    speak(text) {
      if (!synth || !text) return false;
      const utterance = new win.SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.95;
      synth.cancel();
      synth.speak(utterance);
      return true;
    }
  };
}

/** Khởi tạo trình học. */
export function initLesson(options = {}) {
  const {
    document,
    store,
    session,
    i18n = createI18n(),
    now = () => new Date(),
    speech = createSpeech(document?.defaultView)
  } = options;
  if (!document || !store) throw new Error("initLesson cần document và store");

  const els = {
    card: q(document, "#lesson-card"),
    summary: q(document, "#lesson-summary"),
    progress: q(document, "#lesson-progress-fill"),
    step: q(document, "#lesson-step"),
    prompt: q(document, "#lesson-prompt"),
    media: q(document, "#lesson-media"),
    options: q(document, "#lesson-options"),
    fillWrap: q(document, "#lesson-fill-wrap"),
    fill: q(document, "#lesson-fill"),
    orderWrap: q(document, "#lesson-order-wrap"),
    orderAnswer: q(document, "#lesson-answer"),
    bank: q(document, "#lesson-bank"),
    feedback: q(document, "#lesson-feedback"),
    check: q(document, "#lesson-check"),
    next: q(document, "#lesson-next")
  };

  const questions = session?.questions || [];
  let index = 0;
  const answers = [];
  let pending = null;
  let orderPicks = [];
  let submitted = false;
  let finished = false;
  let summary = null;

  function state() {
    return refreshHearts(store.get(), now());
  }

  function syncHearts() {
    const current = state();
    if (current.hearts !== store.get().hearts) store.update(() => current);
    updateTopbar(document, store.get());
  }

  function updateProgress() {
    const pct = Math.round((index / Math.max(1, questions.length)) * 100);
    if (els.progress) els.progress.style.width = `${pct}%`;
    setText(document, "#lesson-step", i18n.t("lesson.question", { current: Math.min(index + 1, questions.length), total: questions.length }));
  }

  function clearFeedback() {
    if (!els.feedback) return;
    els.feedback.textContent = "";
    els.feedback.className = "feedback";
    submitted = false;
  }

  function renderListen(question) {
    if (question.type !== "listen" || !els.media) return;
    const button = createEl(document, "button", "btn btn--gold", `🔊 ${i18n.t("lesson.playAudio")}`);
    button.type = "button";
    button.addEventListener("click", () => speech.speak(question.audio));
    const hint = createEl(document, "p", "lesson__hint", i18n.t("lesson.speakHint"));
    els.media.append(button, hint);
  }

  function renderOptions(question) {
    if (!els.options) return;
    els.options.textContent = "";
    els.options.hidden = false;
    question.options.forEach((text, i) => {
      const button = createEl(document, "button", "option");
      button.type = "button";
      button.dataset.index = String(i);
      button.setAttribute("aria-pressed", "false");
      const key = createEl(document, "span", "option__key", LETTERS[i] || String(i + 1));
      key.setAttribute("aria-hidden", "true");
      button.append(key, createEl(document, "span", "", text));
      button.addEventListener("click", () => select(i));
      els.options.append(button);
    });
  }

  function renderFill(question) {
    if (!els.fillWrap) return;
    els.fillWrap.hidden = false;
    if (els.fill) {
      els.fill.value = "";
      els.fill.placeholder = i18n.t("lesson.fillPlaceholder");
      els.fill.setAttribute("aria-label", question.prompt);
      els.fill.addEventListener("input", () => {
        pending = els.fill.value;
        if (els.check) els.check.disabled = !String(els.fill.value).trim();
      });
    }
  }

  function renderOrder(question) {
    if (!els.orderWrap || !els.bank) return;
    els.orderWrap.hidden = false;
    els.bank.textContent = "";
    if (els.orderAnswer) els.orderAnswer.textContent = "";
    orderPicks = [];
    question.bank.forEach((word, i) => {
      const chip = createEl(document, "button", "chip", word);
      chip.type = "button";
      chip.dataset.word = String(i);
      chip.addEventListener("click", () => pickToken(i));
      els.bank.append(chip);
    });
  }

  function renderTokenChips() {
    if (!els.orderAnswer) return;
    els.orderAnswer.textContent = "";
    orderPicks.forEach((wordIndex, position) => {
      const chip = createEl(document, "button", "chip", questions[index].bank[wordIndex]);
      chip.type = "button";
      chip.setAttribute("aria-label", `Bỏ từ ${questions[index].bank[wordIndex]}`);
      chip.addEventListener("click", () => removeToken(position));
      els.orderAnswer.append(chip);
    });
  }

  function pickToken(wordIndex) {
    if (submitted || finished) return;
    if (orderPicks.includes(wordIndex)) return;
    orderPicks.push(wordIndex);
    const chip = els.bank?.querySelector(`[data-word="${wordIndex}"]`);
    if (chip) chip.disabled = true;
    renderTokenChips();
    pending = orderPicks.map((i) => questions[index].bank[i]);
    if (els.check) els.check.disabled = !orderPicks.length;
  }

  function removeToken(position) {
    if (submitted || finished) return;
    const [wordIndex] = orderPicks.splice(position, 1);
    const chip = els.bank?.querySelector(`[data-word="${wordIndex}"]`);
    if (chip) chip.disabled = false;
    renderTokenChips();
    pending = orderPicks.map((i) => questions[index].bank[i]);
    if (els.check) els.check.disabled = !orderPicks.length;
  }

  function select(optionIndex) {
    if (submitted || finished) return;
    pending = optionIndex;
    [...(els.options?.children || [])].forEach((child, i) => {
      child.setAttribute("aria-pressed", String(i === optionIndex));
    });
    if (els.check) els.check.disabled = false;
  }

  function render() {
    if (!questions.length) {
      setText(document, "#lesson-prompt", "Chưa có câu hỏi cho bài này.");
      if (els.check) els.check.hidden = true;
      return;
    }
    const question = questions[index];
    clearFeedback();
    pending = null;
    orderPicks = [];
    if (els.check) {
      els.check.disabled = true;
      els.check.hidden = false;
      els.check.textContent = i18n.t("lesson.check");
    }
    if (els.next) els.next.hidden = true;
    if (els.media) els.media.textContent = "";
    if (els.fillWrap) els.fillWrap.hidden = true;
    if (els.orderWrap) els.orderWrap.hidden = true;
    els.options && (els.options.hidden = true);
    setText(document, "#lesson-prompt", question.prompt);
    updateProgress();
    syncHearts();

    if (question.type === "choice" || question.type === "listen") {
      renderOptions(question);
      renderListen(question);
    } else if (question.type === "fill") {
      renderFill(question);
      els.fill?.focus();
    } else if (question.type === "order") {
      renderOrder(question);
    }
  }

  function markOptions(question, correct) {
    [...(els.options?.children || [])].forEach((child, i) => {
      child.disabled = true;
      if (question.type === "choice" || question.type === "listen") {
        if (i === question.answer) child.classList.add("option--correct");
        if (!correct && pending === i) child.classList.add("option--wrong");
      }
    });
  }

  function showFeedback(correct, question, expected) {
    if (!els.feedback) return;
    els.feedback.textContent = "";
    const title = createEl(document, "strong", "", correct ? i18n.t("lesson.correct") : i18n.t("lesson.wrong", { answer: expected }));
    els.feedback.append(title);
    if (question.explain) els.feedback.append(createEl(document, "span", "", question.explain));
    els.feedback.className = `feedback is-visible ${correct ? "feedback--correct" : "feedback--wrong"}`;
    els.feedback.setAttribute("role", "status");
  }

  function submit() {
    if (submitted || finished || !questions.length) return null;
    const question = questions[index];
    if (pending === null || (question.type === "fill" && !String(pending).trim())) return null;
    const result = checkAnswer(question, pending);
    submitted = true;
    answers.push({ questionId: question.id, response: pending });
    if (els.check) els.check.hidden = true;
    if (els.next) els.next.hidden = false;
    if (question.type === "choice" || question.type === "listen") markOptions(question, result.correct);
    if (!result.correct) {
      const loss = loseHeart(store.get(), now());
      if (loss.ok) store.update(() => loss.state);
      syncHearts();
    }
    showFeedback(result.correct, question, result.expected || expectedAnswer(question));
    return result;
  }

  function finish() {
    if (finished) return summary;
    finished = true;
    summary = scoreSession(questions, answers);
    const at = now();
    let srs = { ...store.get().srs };
    for (const result of summary.results) {
      srs = gradeQuestion(srs, result.questionId, result.correct, at);
    }
    store.update((draft) => {
      const applied = applySession(
        { ...draft, srs },
        {
          lessonId: session.lessonId,
          xp: summary.xp,
          correct: summary.correct,
          total: summary.total,
          perfect: summary.perfect,
          reviews: summary.total
        },
        at
      );
      applied.badges = earnedBadges({
        lessons: Object.keys(applied.completed).length,
        streak: applied.streak,
        xp: applied.xp,
        perfect: summary.perfect ? 1 : 0,
        reviews: applied.reviews,
        docsRead: applied.docsRead
      });
      return applied;
    });
    updateTopbar(document, store.get());
    if (els.card) els.card.hidden = true;
    if (els.summary) {
      els.summary.hidden = false;
      els.summary.textContent = "";
      const box = createEl(document, "div", "summary");
      box.append(createEl(document, "p", "eyebrow", session.title || "Bài học"));
      box.append(createEl(document, "h2", "", i18n.t("lesson.complete")));
      box.append(createEl(document, "p", "", i18n.t("lesson.earned", { xp: summary.xp })));
      const stats = createEl(document, "div", "summary__stats");
      for (const [value, label] of [
        [`${summary.correct}/${summary.total}`, "Câu đúng"],
        [`${summary.accuracy}%`, "Chính xác"],
        [String(summary.maxCombo), "Chuỗi dài nhất"]
      ]) {
        const item = createEl(document, "div", "summary__stat");
        item.append(createEl(document, "strong", "", value));
        item.append(createEl(document, "span", "", label));
        stats.append(item);
      }
      box.append(stats);
      const actions = createEl(document, "div", "lesson__actions");
      const home = createEl(document, "a", "btn", i18n.t("lesson.backHome"));
      home.href = "index.html";
      const again = createEl(document, "a", "btn btn--ghost", i18n.t("lesson.again"));
      again.href = `hoc.html?bai=${encodeURIComponent(session.lessonId || "")}`;

      actions.append(home, again);
      box.append(actions);
      els.summary.append(box);
    }
    if (els.progress) els.progress.style.width = "100%";
    return summary;
  }

  function next() {
    if (finished) return summary;
    if (!submitted) return null;
    if (index + 1 >= questions.length) return finish();
    index += 1;
    render();
    return null;
  }

  if (els.check) els.check.addEventListener("click", submit);
  if (els.next) els.next.addEventListener("click", next);

  render();
  return {
    get index() {
      return index;
    },
    get answers() {
      return [...answers];
    },
    get pending() {
      return pending;
    },
    isFinished() {
      return finished;
    },
    select,
    pickToken,
    removeToken,
    submit,
    next,
    finish,
    render,
    session
  };
}
