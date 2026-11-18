import { describe, expect, it } from "vitest";
import {
  allLessons,
  buildSession,
  checkAnswer,
  expectedAnswer,
  findLesson,
  nextLesson,
  pathProgress,
  practiceSession,
  scoreSession
} from "../vi/assets/js/quiz.js";

const units = [
  {
    id: "u1",
    title: "Unit 1",
    skill: "vocab",
    level: "A2",
    lessons: [
      {
        id: "u1l1",
        title: "Bài 1",
        goal: "Mục tiêu",
        questions: [
          { id: "q1", type: "choice", prompt: "Chọn", options: ["sai", "đúng"], answer: 1, explain: "vì thế" },
          { id: "q2", type: "fill", prompt: "Điền", answer: "inevitable", accept: ["unavoidable"] },
          { id: "q3", type: "order", prompt: "Sắp xếp", bank: ["I", "am", "here"], answer: ["I", "am", "here"] },
          { id: "q4", type: "listen", prompt: "Nghe", audio: "Hello", options: ["a", "b"], answer: 0 },
          { id: "q5", type: "odd", prompt: "Không hỗ trợ", answer: "x" }
        ]
      }
    ]
  },
  { id: "u2", title: "Unit 2", skill: "listening", level: "B1", lessons: [{ id: "u2l1", title: "Bài 2", questions: [{ id: "q6", type: "choice", options: ["x", "y"], answer: 0, prompt: "p" }] }] }
];

describe("lộ trình", () => {
  it("allLessons gắn thông tin unit", () => {
    const list = allLessons(units);
    expect(list).toHaveLength(2);
    expect(list[0]).toMatchObject({ id: "u1l1", unitId: "u1", skill: "vocab", level: "A2" });
    expect(allLessons()).toEqual([]);
  });

  it("findLesson", () => {
    expect(findLesson(units, "u2l1").title).toBe("Bài 2");
    expect(findLesson(units, "không có")).toBeNull();
  });

  it("nextLesson trả bài chưa hoàn thành hoặc bài cuối", () => {
    expect(nextLesson(units, {}).id).toBe("u1l1");
    expect(nextLesson(units, { u1l1: true }).id).toBe("u2l1");
    expect(nextLesson(units, { u1l1: true, u2l1: true }).id).toBe("u2l1");
    expect(nextLesson([], {})).toBeNull();
  });

  it("pathProgress", () => {
    expect(pathProgress(units, {})).toEqual({ done: 0, total: 2, percent: 0 });
    expect(pathProgress(units, { u1l1: true })).toEqual({ done: 1, total: 2, percent: 50 });
    expect(pathProgress([], {})).toEqual({ done: 0, total: 0, percent: 0 });
  });
});

describe("buildSession", () => {
  it("tạo phiên ổn định theo seed", () => {
    const lesson = allLessons(units)[0];
    const a = buildSession(lesson, { seed: 5 });
    const b = buildSession(lesson, { seed: 5 });
    expect(a.questions).toHaveLength(5);
    expect(a.questions.map((q) => q.id)).toEqual(b.questions.map((q) => q.id));
    expect(a.lessonId).toBe("u1l1");
    expect(a.id).toBe("session-u1l1-5");
  });

  it("giới hạn số câu và xáo trộn đáp án đúng", () => {
    const lesson = allLessons(units)[0];
    const session = buildSession(lesson, { seed: 2, size: 2 });
    expect(session.questions).toHaveLength(2);
    expect(session.questions[0].unitId).toBeUndefined();
    for (const question of session.questions) {
      if (question.type === "choice" || question.type === "listen") {
        expect(question.options[question.answer]).toBeDefined();
      }
      if (question.type === "order") {
        expect([...question.bank].sort()).toEqual([...question.bank].sort());
      }
    }
  });

  it("không có bài trả phiên rỗng", () => {
    expect(buildSession(null).questions).toEqual([]);
    expect(buildSession({ id: "x" }).id).toBe("empty");
  });
});

describe("practiceSession", () => {
  it("lọc theo kỹ năng và ưu tiên thẻ đến hạn", () => {
    const session = practiceSession(units, { skill: "vocab", seed: 1, dueIds: ["q3"], size: 3 });
    expect(session.title).toBe("Luyện vocab");
    expect(session.questions).toHaveLength(3);
    expect(session.questions[0].id).toBe("q3");
    expect(session.lessonId).toBe("practice");
  });

  it("mặc định lấy mọi kỹ năng", () => {
    const session = practiceSession(units, { seed: 1, size: 99 });
    expect(session.questions).toHaveLength(6);
    expect(session.id).toBe("practice-all-1");
  });
});

describe("chấm điểm", () => {
  it("expectedAnswer cho từng dạng", () => {
    expect(expectedAnswer({ type: "choice", options: ["a", "b"], answer: 1 })).toBe("b");
    expect(expectedAnswer({ type: "order", answer: ["a", "b"] })).toBe("a b");
    expect(expectedAnswer({ type: "order", answer: "a b" })).toBe("a b");
    expect(expectedAnswer({ type: "fill", answer: "x" })).toBe("x");
    expect(expectedAnswer(null)).toBe("");
  });

  it("checkAnswer choice/listen", () => {
    const q = { type: "choice", options: ["a", "b"], answer: 1 };
    expect(checkAnswer(q, 1).correct).toBe(true);
    expect(checkAnswer(q, "1").correct).toBe(true);
    expect(checkAnswer(q, 0).correct).toBe(false);
    expect(checkAnswer(null, 0).correct).toBe(false);
  });

  it("checkAnswer fill tha thứ dấu và chấp nhận biến thể", () => {
    const q = { type: "fill", answer: "Inevitable", accept: ["unavoidable"] };
    expect(checkAnswer(q, "inevitable").correct).toBe(true);
    expect(checkAnswer(q, "unavoidable").correct).toBe(true);
    expect(checkAnswer(q, "sai").correct).toBe(false);
  });

  it("checkAnswer order nhận mảng hoặc chuỗi", () => {
    const q = { type: "order", answer: ["The", "study", "found"] };
    expect(checkAnswer(q, ["The", "study", "found"]).correct).toBe(true);
    expect(checkAnswer(q, "the study found").correct).toBe(true);
    expect(checkAnswer(q, ["study", "The"]).correct).toBe(false);
  });

  it("dạng không hỗ trợ luôn sai", () => {
    expect(checkAnswer({ type: "odd" }, "x").correct).toBe(false);
  });

  it("scoreSession tính XP, độ chính xác và perfect", () => {
    const questions = [
      { id: "q1", type: "choice", options: ["a", "b"], answer: 1 },
      { id: "q2", type: "fill", answer: "x" }
    ];
    const summary = scoreSession(questions, [
      { questionId: "q1", response: 1 },
      { questionId: "q2", response: "x" }
    ]);
    expect(summary).toMatchObject({ correct: 2, total: 2, accuracy: 100, perfect: true, maxCombo: 2 });
    expect(summary.xp).toBe(20);
    expect(summary.results).toHaveLength(2);
  });

  it("scoreSession với câu chưa trả lời", () => {
    const questions = [{ id: "q1", type: "choice", options: ["a"], answer: 0 }];
    const summary = scoreSession(questions, []);
    expect(summary.correct).toBe(0);
    expect(summary.perfect).toBe(false);
    expect(scoreSession([], [])).toMatchObject({ total: 0, accuracy: 0, perfect: false });
  });
});
