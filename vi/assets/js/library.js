/* =========================================================================
   library.js — tìm kiếm / lọc tài liệu PDF và liên kết Google Scholar.
   ========================================================================= */

import { normalize } from "./util.js";

export const SCHOLAR_BASE = "https://scholar.google.com/scholar?q=";

/** Liên kết tìm kiếm Google Scholar cho một trích dẫn. */
export function scholarUrl(citation) {
  const query = typeof citation === "string" ? citation : citation?.query || citation?.title || "";
  return `${SCHOLAR_BASE}${encodeURIComponent(query.trim())}`;
}

/** Đếm trích dẫn của một tài liệu. */
export function citationCount(doc) {
  return Array.isArray(doc?.citations) ? doc.citations.length : 0;
}

/** Tổng hợp số liệu thư viện. */
export function libraryStats(docs = []) {
  const citations = docs.reduce((sum, doc) => sum + citationCount(doc), 0);
  const unique = new Set(
    docs.flatMap((doc) => (doc.citations || []).map((citation) => normalize(citation.title || citation.query || "")))
  );
  return { docs: docs.length, citations, unique: unique.size };
}

/** Tìm theo tiêu đề, mô tả, thẻ và trích dẫn. */
export function searchDocs(docs = [], query = "") {
  const needle = normalize(query);
  if (!needle) return [...docs];
  return docs.filter((doc) => {
    const haystack = [
      doc.title,
      doc.summary,
      doc.author,
      ...(doc.tags || []),
      ...(doc.citations || []).flatMap((citation) => [citation.title, citation.authors, citation.query])
    ]
      .filter(Boolean)
      .join(" ");
    return normalize(haystack).includes(needle);
  });
}

/** Lọc theo kỹ năng / trình độ / chủ đề. */
export function filterDocs(docs = [], filters = {}) {
  const skill = filters.skill || "all";
  const level = filters.level || "all";
  return docs.filter((doc) => {
    const skillOk = skill === "all" || (doc.skills || []).includes(skill);
    const levelOk = level === "all" || doc.level === level;
    return skillOk && levelOk;
  });
}

/** Sắp xếp: mới nhất, nhiều trích dẫn, hoặc thứ tự gốc. */
export function sortDocs(docs = [], by = "featured") {
  const copy = [...docs];
  if (by === "citations") {
    return copy.sort((a, b) => citationCount(b) - citationCount(a));
  }
  if (by === "newest") {
    return copy.sort((a, b) => String(b.year || "").localeCompare(String(a.year || "")));
  }
  return copy.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

/** Tất cả trích dẫn kèm liên kết Scholar của một tài liệu. */
export function citationsFor(doc) {
  return (doc?.citations || []).map((citation) => ({
    ...citation,
    url: citation.url || scholarUrl(citation)
  }));
}

/** Kỹ năng có mặt trong thư viện (để dựng bộ lọc). */
export function availableSkills(docs = []) {
  return [...new Set(docs.flatMap((doc) => doc.skills || []))].sort();
}
