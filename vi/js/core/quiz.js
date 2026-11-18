/** Chấm điểm, xáo trộn và sinh bài ôn tập — thuần tuý, không DOM. */

import { searchKey } from './text.js';

/** Chuẩn hoá câu trả lời: chữ thường, bỏ dấu câu, gộp khoảng trắng. */
export function normalizeAnswer(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFC')
    .replace(/[’‘]/g, "'")
    .replace(/[.,!?;:"“”()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Băm chuỗi thành số nguyên 32-bit (FNV-1a). */
function hashSeed(seed) {
  const text = String(seed ?? '');
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  }
  return hash >>> 0;
}

/** Bộ sinh số ngẫu nhiên có hạt giống (mulberry32) — ổn định giữa các lần tải. */
export function rng(seed) {
  let state = hashSeed(seed);
  return () => {
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Xáo trộn bản sao của mảng (Fisher–Yates có hạt giống). */
export function shuffle(items, seed) {
  const random = rng(seed);
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Chuỗi đáp án hiển thị cho một câu hỏi. */
export function expectedText(exercise) {
  if (!exercise) return '';
  if (exercise.type === 'mcq') return String(exercise.options?.[exercise.answer] ?? '');
  return String(exercise.answer ?? '');
}

/** Chấm một câu trả lời. */
export function checkAnswer(exercise, response) {
  if (!exercise) return { correct: false, expected: '', given: '' };
  const expected = expectedText(exercise);

  if (exercise.type === 'mcq') {
    const given = Number(response);
    return {
      correct: Number.isInteger(given) && given === Number(exercise.answer),
      expected,
      given: Number.isInteger(given) ? String(exercise.options?.[given] ?? '') : '',
    };
  }

  if (exercise.type === 'build') {
    const given = Array.isArray(response) ? normalizeAnswer(response.join(' ')) : normalizeAnswer(response);
    const target = normalizeAnswer(exercise.answer);
    const accepted = [target, ...(exercise.accept || []).map(normalizeAnswer)];
    return { correct: accepted.includes(given), expected, given };
  }

  const given = normalizeAnswer(response);
  const accepted = [normalizeAnswer(exercise.answer), ...(exercise.accept || []).map(normalizeAnswer)];
  return { correct: given !== '' && accepted.includes(given), expected, given };
}

/** Tạo token cho ngân hàng từ (giữ nguyên thứ tự đã xáo, có id ổn định). */
export function buildTokens(exercise, seed) {
  const words = Array.isArray(exercise?.words) ? exercise.words : [];
  const shuffled = shuffle(words, seed ?? exercise?.id ?? 'bank');
  return shuffled.map((text, index) => ({ id: `${index}-${text}`, text }));
}

/** Tổng hợp kết quả một phiên học. */
export function sessionScore(results) {
  const list = Array.isArray(results) ? results : [];
  const total = list.length;
  const flags = list.map((item) => item === true || item?.correct === true);
  const correct = flags.filter(Boolean).length;
  const accuracy = total > 0 ? correct / total : 0;
  let bestCombo = 0;
  let run = 0;
  for (const flag of flags) {
    run = flag ? run + 1 : 0;
    bestCombo = Math.max(bestCombo, run);
  }
  return { total, correct, accuracy, bestCombo, passed: total > 0 && accuracy >= 0.6 };
}

/** Sinh câu hỏi ôn tập từ một từ vựng và kho từ còn lại. */
export function reviewExercise(word, pool, seed) {
  const others = (pool || []).filter((item) => item.id !== word.id).slice(0, 3);
  const options = shuffle([word, ...others], seed ?? word.id).map((item) => item.term);
  return {
    id: `on-${word.id}`,
    type: 'mcq',
    skill: 'vocab',
    prompt: 'Từ nào khớp với nghĩa tiếng Việt sau?',
    stem: `“${word.vi}”`,
    options,
    answer: options.indexOf(word.term),
    explain: `${word.term} /${word.ipa}/ — ${word.vi}. Ví dụ: ${word.example} (${word.exampleVi})`,
  };
}

/** Chọn các từ cần ôn: ưu tiên thẻ đến hạn, sau đó tới từ ít gặp. */
export function pickReviewWords(deck, vocab, now, limit = 10) {
  const words = Array.isArray(vocab) ? vocab : [];
  const cards = deck && typeof deck === 'object' ? deck : {};
  const byId = new Map(words.map((word) => [word.id, word]));
  const due = [];
  const fresh = [];
  for (const [id, card] of Object.entries(cards)) {
    const word = byId.get(id);
    if (!word) continue;
    if (card.due <= now) due.push({ word, card });
    else fresh.push({ word, card });
  }
  due.sort((a, b) => a.card.due - b.card.due);
  fresh.sort((a, b) => (a.card.seen || 0) - (b.card.seen || 0));
  return [...due, ...fresh].slice(0, limit).map((entry) => entry.word);
}

/** Tìm từ vựng theo truy vấn không dấu (dùng cho trang luyện tập). */
export function searchVocab(vocab, query) {
  const key = searchKey(query);
  if (!key) return [...(vocab || [])];
  return (vocab || []).filter((word) => {
    const haystack = searchKey(`${word.term} ${word.vi} ${(word.tags || []).join(' ')}`);
    return haystack.includes(key);
  });
}
