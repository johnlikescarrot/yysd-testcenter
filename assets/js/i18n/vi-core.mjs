/**
 * Browser counterpart of scripts/vi_lib.py — pure, side-effect free.
 * GENERATED DATA lives in ./vi-dictionary.mjs (see localization/vi/curated.txt).
 *
 * NOTE: the Chinese literals below are intentionally source data for the
 * translator itself.  This directory is excluded from build-time localisation.
 */

export const CJK_RE = /[\u3400-\u9fff\uf900-\ufaff]/;

export const PUNCTUATION = Object.freeze({
  "，": ", ",
  "、": ", ",
  "：": ": ",
  "；": "; ",
  "（": "(",
  "）": ")",
  "《": "«",
  "》": "»",
  "「": "«",
  "」": "»",
  "“": "«",
  "”": "»",
  "？": "?",
  "！": "!",
  "。": ".",
  "％": "%",
  "－": "-",
  "　": " ",
});

export const TEMPLATE_SPECS = Object.freeze([
  [/答案：\s*(TRUE|FALSE|YES|NO|NOT GIVEN|[A-D])\s*。/g, "Đáp án: $1."],
  [/正确答案：/g, "Đáp án đúng: "],
  [/官方答案：/g, "Đáp án chính thức: "],
  [/解析：/g, "Giải thích: "],
  [/定位：/g, "Vị trí: "],
  [/你的：/g, "Của bạn: "],
  [/第\s*(\d+)\s*题/g, "Câu $1"],
  [/共\s*(\d+)\s*题/g, "Tổng $1 câu"],
  [/(\d+)\s*题/g, "$1 câu"],
  [/(\d+)\s*分钟/g, "$1 phút"],
  [/(\d+)\s*秒/g, "$1 giây"],
  [/(\d+)\s*分/g, "$1 điểm"],
  [/剑\s*(\d+)/g, "Cambridge $1"],
  [/（未作答）/g, "(Chưa trả lời)"],
  [/使用\/运用该词/g, "dùng / vận dụng từ này"],
  [/运用该词/g, "vận dụng từ này"],
  [/使用该词/g, "dùng từ này"],
  [/释义\./g, "Nghĩa."],
]);

export function hasCjk(text) {
  return typeof text === "string" && CJK_RE.test(text);
}

export function normalizePunctuation(text) {
  let result = text;
  for (const [source, target] of Object.entries(PUNCTUATION)) {
    result = result.replaceAll(source, target);
  }
  return result;
}

export function tidy(text) {
  return text
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+([,.;:!?\]\)])/g, "$1")
    .replace(/([\[\(])[ \t]+/g, "$1")
    .trim();
}

export function applyTemplates(text, templates = TEMPLATE_SPECS) {
  let result = text;
  for (const [pattern, replacement] of templates) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

export function applyPhrases(text, dictionary) {
  let result = text;
  for (const key of dictionary.phraseOrder) {
    result = result.replaceAll(key, ` ${dictionary.phrases[key]} `);
  }
  return result;
}

export function translate(text, dictionary) {
  if (typeof text !== "string") {
    return "";
  }
  if (Object.prototype.hasOwnProperty.call(dictionary.exact, text)) {
    return dictionary.exact[text];
  }
  if (!hasCjk(text)) {
    return text;
  }
  return tidy(normalizePunctuation(applyPhrases(applyTemplates(text), dictionary)));
}

export function cjkRuns(text) {
  if (!hasCjk(text)) {
    return [];
  }
  return text.match(/[\u3400-\u9fff\uf900-\ufaff]+/g) || [];
}

export function coverageStats(before, after) {
  const matchAll = /[\u3400-\u9fff\uf900-\ufaff]/g;
  const count = (value) => (value.match(matchAll) || []).length;
  const cjkBefore = count(before);
  const cjkAfter = count(after);
  return { cjkBefore, cjkAfter, cjkRemoved: cjkBefore - cjkAfter };
}
