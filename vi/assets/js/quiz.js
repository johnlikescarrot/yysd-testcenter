/* =========================================================================
   quiz.js — dựng phiên học, chấm điểm, tổng kết XP.
   Hỗ trợ 4 dạng câu: choice, listen, fill, order.
   ========================================================================= */

import { mulberry32, normalize, shuffle } from "./util.js";
import { sessionXp } from "./gamify.js";

export const QUESTION_TYPES = ["choice", "listen", "fill", "order"];

/** Danh sách phẳng các bài học kèm thông tin unit. */
export function allLessons(units = []) {
  const list = [];
  for (const unit of units) {
    for (const lesson of unit.lessons || []) {
      list.push({ ...lesson, unitId: unit.id, unitTitle: unit.title, skill: unit.skill, level: unit.level });
    }
  }
  return list;
}

/** Tìm bài học theo id. */
export function findLesson(units = [], lessonId) {
  return allLessons(units).find((lesson) => lesson.id === lessonId) || null;
}

/** Bài kế tiếp trong lộ trình tuyến tính. */
export function nextLesson(units = [], completed = {}) {
  const list = allLessons(units);
  return list.find((lesson) => !completed[lesson.id]) || list[list.length - 1] || null;
}

/** Tỉ lệ hoàn thành lộ trình. */
export function pathProgress(units = [], completed = {}) {
  const list = allLessons(units);
  if (!list.length) return { done: 0, total: 0, percent: 0 };
  const done = list.filter((lesson) => completed[lesson.id]).length;
  return { done, total: list.length, percent: Math.round((done / list.length) * 100) };
}

function prepareQuestion(question, rng) {
  if (question.type === "choice" || question.type === "listen") {
    const items = question.options.map((text, index) => ({ text, correct: index === question.answer }));
    const shuffled = shuffle(items, rng);
    return {
      ...question,
      options: shuffled.map((item) => item.text),
      answer: shuffled.findIndex((item) => item.correct)
    };
  }
  if (question.type === "order") {
    return { ...question, bank: shuffle(question.bank, rng) };
  }
  return { ...question };
}

/** Dựng phiên học tất định từ seed. */
export function buildSession(lesson, options = {}) {
  if (!lesson || !Array.isArray(lesson.questions)) {
    return { id: "empty", unitId: "", title: "", questions: [] };
  }
  const seed = options.seed ?? 1;
  const rng = mulberry32(seed);
  const size = Math.min(options.size ?? lesson.questions.length, lesson.questions.length);
  const questions = shuffle(lesson.questions, rng)
    .slice(0, size)
    .map((question) => prepareQuestion(question, rng));
  return {
    id: `session-${lesson.id}-${seed}`,
    lessonId: lesson.id,
    unitId: lesson.unitId || "",
    title: lesson.title,
    questions
  };
}

/** Phiên luyện tập theo kỹ năng, ưu tiên thẻ đến hạn ôn. */
export function practiceSession(units, options = {}) {
  const skill = options.skill || "all";
  const seed = options.seed ?? 1;
  const due = new Set(options.dueIds || []);
  const size = options.size ?? 10;
  const pool = allLessons(units)
    .filter((lesson) => skill === "all" || lesson.skill === skill)
    .flatMap((lesson) => (lesson.questions || []).map((q) => ({ ...q, lessonId: lesson.id })));
  const rng = mulberry32(seed);
  const sorted = shuffle(pool, rng).sort((a, b) => Number(due.has(b.id)) - Number(due.has(a.id)));
  return {
    id: `practice-${skill}-${seed}`,
    lessonId: "practice",
    unitId: "practice",
    title: `Luyện ${skill}`,
    questions: sorted.slice(0, size).map((question) => prepareQuestion(question, rng))
  };
}

/** Đáp án đúng dạng chữ để hiển thị. */
export function expectedAnswer(question) {
  if (!question) return "";
  if (question.type === "choice" || question.type === "listen") {
    return question.options?.[question.answer] ?? "";
  }
  if (question.type === "order") {
    return Array.isArray(question.answer) ? question.answer.join(" ") : String(question.answer ?? "");
  }
  return String(question.answer ?? "");
}

/** Chấm một câu trả lời. */
export function checkAnswer(question, response) {
  if (!question) return { correct: false, expected: "" };
  const expected = expectedAnswer(question);
  if (question.type === "choice" || question.type === "listen") {
    return { correct: Number(response) === question.answer, expected };
  }
  if (question.type === "fill") {
    const accepted = [expected, ...(question.accept || [])].map(normalize);
    return { correct: accepted.includes(normalize(response)), expected };
  }
  if (question.type === "order") {
    const given = Array.isArray(response) ? response.join(" ") : response;
    return { correct: normalize(given) === normalize(expected), expected };
  }
  return { correct: false, expected };
}

/** Tổng kết phiên: độ chính xác, XP, chuỗi đúng dài nhất. */
export function scoreSession(questions = [], answers = []) {
  const results = questions.map((question) => {
    const answer = answers.find((item) => item.questionId === question.id);
    const correct = Boolean(answer && checkAnswer(question, answer.response).correct);
    return { questionId: question.id, correct };
  });
  const correct = results.filter((item) => item.correct).length;
  const total = results.length;
  const { xp, maxCombo } = sessionXp(results);
  return {
    results,
    correct,
    total,
    accuracy: total ? Math.round((correct / total) * 100) : 0,
    perfect: total > 0 && correct === total,
    xp,
    maxCombo
  };
}
