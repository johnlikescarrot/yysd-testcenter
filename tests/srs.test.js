import { describe, expect, it } from "vitest";
import {
  AGAIN_DELAY_MS,
  DAY_MS,
  GRADES,
  dueCards,
  gradeQuestion,
  newCard,
  retention,
  review,
  upcomingCards
} from "../vi/assets/js/srs.js";

const NOW = new Date("2026-11-18T08:00:00Z");

describe("thẻ mới", () => {
  it("khởi tạo đúng", () => {
    const card = newCard("q1", NOW);
    expect(card).toMatchObject({ id: "q1", ease: 2.5, interval: 0, reps: 0, lapses: 0, due: NOW.getTime() });
    expect(GRADES).toEqual(["again", "hard", "good", "easy"]);
  });
});

describe("review", () => {
  it("again: hẹn lại sau 10 phút, giảm ease và tăng lapses", () => {
    const card = newCard("q", NOW);
    const next = review(card, "again", NOW);
    expect(next.interval).toBe(0);
    expect(next.lapses).toBe(1);
    expect(next.ease).toBeCloseTo(2.3);
    expect(next.due).toBe(NOW.getTime() + AGAIN_DELAY_MS);
    expect(next.lastGrade).toBe("again");
  });

  it("không hạ ease dưới 1.3", () => {
    const card = { ...newCard("q", NOW), ease: 1.35 };
    expect(review(card, "again", NOW).ease).toBe(1.3);
    expect(review({ ...card, ease: 1.3 }, "hard", NOW).ease).toBe(1.3);
  });

  it("hard: khoảng tối thiểu 1 ngày", () => {
    const fresh = review(newCard("q", NOW), "hard", NOW);
    expect(fresh.interval).toBe(1);
    const learned = review({ ...newCard("q", NOW), interval: 10, reps: 2 }, "hard", NOW);
    expect(learned.interval).toBe(12);
  });

  it("good: 1 ngày lần đầu, sau đó nhân ease", () => {
    const first = review(newCard("q", NOW), "good", NOW);
    expect(first.interval).toBe(1);
    const second = review(first, "good", NOW);
    expect(second.interval).toBe(Math.round(1 * first.ease));
    expect(second.due).toBe(NOW.getTime() + second.interval * DAY_MS);
  });

  it("easy: 2 ngày lần đầu, tăng ease tối đa 3", () => {
    const first = review(newCard("q", NOW), "easy", NOW);
    expect(first.interval).toBe(2);
    expect(first.ease).toBeCloseTo(2.65);
    const maxed = review({ ...newCard("q", NOW), ease: 2.95, reps: 2, interval: 5 }, "easy", NOW);
    expect(maxed.ease).toBe(3);
    expect(maxed.interval).toBeGreaterThanOrEqual(2);
  });

  it("grade không hợp lệ trả bản sao", () => {
    const card = newCard("q", NOW);
    const next = review(card, "unknown", NOW);
    expect(next).toEqual(card);
    expect(next).not.toBe(card);
  });

  it("card không hợp lệ dùng thẻ mới", () => {
    const next = review(null, "good", NOW);
    expect(next.id).toBe("unknown");
    expect(next.reps).toBe(1);
    const weird = review("xấu", "good", NOW);
    expect(weird.reps).toBe(1);
  });
});

describe("hàng đợi", () => {
  it("dueCards lọc, sắp xếp và giới hạn", () => {
    const srs = {
      a: { id: "a", due: NOW.getTime() - 1000, reps: 1 },
      b: { id: "b", due: NOW.getTime() - 5000, reps: 2 },
      c: { id: "c", due: NOW.getTime() + 5000, reps: 0 }
    };
    expect(dueCards(srs, NOW).map((card) => card.id)).toEqual(["b", "a"]);
    expect(dueCards(srs, NOW, 1).map((card) => card.id)).toEqual(["b"]);
    expect(dueCards(null, NOW)).toEqual([]);
  });

  it("dueCards xếp theo id khi hạn bằng nhau", () => {
    const srs = {
      z: { id: "z", due: NOW.getTime(), reps: 1 },
      a: { id: "a", due: NOW.getTime(), reps: 1 }
    };
    expect(dueCards(srs, NOW).map((card) => card.id)).toEqual(["a", "z"]);
  });

  it("upcomingCards lấy trong 7 ngày", () => {
    const srs = {
      soon: { id: "soon", due: NOW.getTime() + DAY_MS, reps: 1 },
      later: { id: "later", due: NOW.getTime() + 20 * DAY_MS, reps: 1 },
      past: { id: "past", due: NOW.getTime() - DAY_MS, reps: 1 }
    };
    expect(upcomingCards(srs, NOW).map((card) => card.id)).toEqual(["soon"]);
    expect(upcomingCards(srs, NOW, 30).map((card) => card.id)).toEqual(["soon", "later"]);
    expect(upcomingCards(null, NOW)).toEqual([]);
  });
});

describe("retention và gradeQuestion", () => {
  it("retention", () => {
    expect(retention({})).toBe(0);
    expect(retention({ a: { reps: 1, due: 0 }, b: { reps: 0, due: 0 } })).toBe(50);
    expect(retention(null)).toBe(0);
  });

  it("gradeQuestion tạo thẻ mới khi đúng", () => {
    const srs = gradeQuestion({}, "q1", true, NOW);
    expect(srs.q1.reps).toBe(1);
    expect(srs.q1.lastGrade).toBe("good");
  });

  it("gradeQuestion dùng easy khi thẻ đã học", () => {
    const srs = gradeQuestion({ q1: { ...newCard("q1", NOW), reps: 3 } }, "q1", true, NOW);
    expect(srs.q1.lastGrade).toBe("easy");
  });

  it("gradeQuestion trả again khi sai", () => {
    const srs = gradeQuestion(null, "q2", false, NOW);
    expect(srs.q2.lastGrade).toBe("again");
    expect(srs.q2.lapses).toBe(1);
  });
});
