/** Tìm kiếm, lọc và thống kê trích dẫn học thuật (Google Scholar). */

import { searchKey } from './text.js';

/** Xây URL tìm kiếm Google Scholar từ tiêu đề + tác giả. */
export function scholarUrl(title, authors) {
  const query = [title, authors].filter(Boolean).join(' ');
  return `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`;
}

/** URL DOI chuẩn. */
export function doiUrl(doi) {
  return doi ? `https://doi.org/${doi}` : null;
}

/** Lọc + tìm trích dẫn theo truy vấn và nhãn chủ đề. */
export function searchPapers(papers, query, tag) {
  const key = searchKey(query);
  return (papers || []).filter((paper) => {
    if (tag && tag !== 'all' && !(paper.tags || []).includes(tag)) return false;
    if (!key) return true;
    const tags = (paper.tags || []).map((tag) => String(tag).replace(/-/g, ' ')).join(' ');
    const haystack = searchKey(
      [paper.title, paper.authors, paper.venue, paper.findingVi, paper.applyVi, tags].join(' '),
    );
    return haystack.includes(key);
  });
}

/** Toàn bộ nhãn chủ đề kèm số lượng. */
export function tagsOf(papers) {
  const counts = new Map();
  for (const paper of papers || []) {
    for (const tag of paper.tags || []) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'vi'))
    .map(([id, count]) => ({ id, count }));
}

/** Thống kê thư viện: số tài liệu, số trích dẫn, khoảng năm, số DOI. */
export function libraryStats(papers, docs) {
  const list = papers || [];
  const years = list.map((paper) => paper.year).filter((year) => Number.isFinite(year));
  return {
    papers: list.length,
    docs: (docs || []).length,
    withDoi: list.filter((paper) => Boolean(paper.doi)).length,
    fromYear: years.length > 0 ? Math.min(...years) : null,
    toYear: years.length > 0 ? Math.max(...years) : null,
  };
}

/** Sắp xếp trích dẫn: mới nhất trước, cùng năm thì theo tác giả. */
export function sortPapers(papers) {
  return [...(papers || [])].sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    return String(a.authors).localeCompare(String(b.authors), 'vi');
  });
}

/** Nhóm trích dẫn theo tài liệu PDF mà chúng hỗ trợ. */
export function citationsFor(papers, docId) {
  return (papers || []).filter((paper) => (paper.docs || []).includes(docId));
}

/** Đoạn trích APA rút gọn (hiển thị trong thư viện). */
export function apaLine(paper) {
  const authors = paper.authors || 'Khuyết danh';
  const venue = paper.venue ? ` ${paper.venue}.` : '';
  const doi = paper.doi ? ` https://doi.org/${paper.doi}` : '';
  return `${authors} (${paper.year}). ${paper.title}.${venue}${doi}`;
}
