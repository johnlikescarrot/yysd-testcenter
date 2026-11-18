/* =========================================================================
   srs.js — ôn tập ngắt quãng kiểu SM-2 rút gọn.
   Tham chiếu: Wozniak (1990), Cepeda và cộng sự (2006) về khoảng cách ôn tập.
   ========================================================================= */

export const GRADES = ["again", "hard", "good", "easy"];
export const AGAIN_DELAY_MS = 10 * 60 * 1000;
export const DAY_MS = 86400000;
export const MIN_EASE = 1.3;
export const MAX_EASE = 3;

/** Thẻ mới: hẹn ôn ngay. */
export function newCard(id, now = new Date()) {
  return {
    id,
    ease: 2.5,
    interval: 0,
    reps: 0,
    lapses: 0,
    due: now.getTime(),
    lastGrade: "",
    seen: 0
  };
}

function schedule(card, grade, now) {
  const next = { ...card, seen: (card.seen || 0) + 1, lastGrade: grade };
  if (grade === "again") {
    next.reps = 0;
    next.interval = 0;
    next.lapses = (card.lapses || 0) + 1;
    next.ease = Math.max(MIN_EASE, card.ease - 0.2);
    next.due = now.getTime() + AGAIN_DELAY_MS;
    return next;
  }
  if (grade === "hard") {
    next.ease = Math.max(MIN_EASE, card.ease - 0.15);
    next.interval = card.interval < 1 ? 1 : Math.max(1, Math.round(card.interval * 1.2));
  } else if (grade === "good") {
    next.interval = card.reps === 0 ? 1 : Math.max(1, Math.round(card.interval * card.ease));
  } else {
    next.ease = Math.min(MAX_EASE, card.ease + 0.15);
    next.interval = card.reps === 0 ? 2 : Math.max(2, Math.round(card.interval * card.ease * 1.3));
  }
  next.reps = (card.reps || 0) + 1;
  next.due = now.getTime() + next.interval * DAY_MS;
  return next;
}

/** Chấm một lần ôn, trả về thẻ mới (không sửa thẻ cũ). */
export function review(card, grade, now = new Date()) {
  const base = card && typeof card === "object" ? card : newCard("unknown", now);
  if (!GRADES.includes(grade)) return { ...base };
  return schedule(base, grade, now);
}

/** Danh sách thẻ đến hạn, sớm nhất trước. */
export function dueCards(srs, now = new Date(), limit = Infinity) {
  const cards = Object.values(srs || {});
  return cards
    .filter((card) => card && card.due <= now.getTime())
    .sort((a, b) => a.due - b.due || String(a.id).localeCompare(String(b.id)))
    .slice(0, limit);
}

/** Thẻ sắp đến hạn (trong `days` ngày), dùng cho hồ sơ. */
export function upcomingCards(srs, now = new Date(), days = 7) {
  const horizon = now.getTime() + days * DAY_MS;
  return Object.values(srs || {})
    .filter((card) => card && card.due > now.getTime() && card.due <= horizon)
    .sort((a, b) => a.due - b.due);
}

/** Tỉ lệ ghi nhớ: số thẻ đã qua ít nhất một lần ôn / tổng thẻ. */
export function retention(srs) {
  const cards = Object.values(srs || {});
  if (!cards.length) return 0;
  const learned = cards.filter((card) => card.reps > 0).length;
  return Math.round((learned / cards.length) * 100);
}

/** Ghi kết quả một câu vào bản đồ SRS, trả về bản đồ mới. */
export function gradeQuestion(srs, id, correct, now = new Date()) {
  const existing = srs?.[id] ?? newCard(id, now);
  const grade = correct ? (existing.reps > 1 ? "easy" : "good") : "again";
  return { ...(srs || {}), [id]: review(existing, grade, now) };
}
