/** Thư viện PDF và kho trích dẫn Google Scholar. */

import { escapeHtml as esc, formatInt } from '../core/text.js';
import { searchPapers, tagsOf, libraryStats, sortPapers, scholarUrl, doiUrl, apaLine } from '../core/papers.js';
import { icon } from './icons.js';

export const TAG_LABELS = {
  'phuong-phap': 'Phương pháp học',
  'tu-vung': 'Từ vựng',
  'doc': 'Reading',
  'nghe': 'Listening',
  'viet': 'Writing',
  'noi': 'Speaking',
  'danh-gia': 'Đánh giá & phản hồi',
  'dong-luc': 'Động lực',
};

function tagLabel(tag) {
  return TAG_LABELS[tag] || tag;
}

function docCard(doc, papers) {
  const cites = papers.filter((paper) => (paper.docs || []).includes(doc.id));
  return `<article class="pdf-card">
    <div class="pdf-cover">
      <div>
        <p class="pdf-cover-kicker">${esc(doc.kicker)}</p>
        <p class="pdf-cover-title">${esc(doc.title)}</p>
      </div>
      <div>
        <p class="pdf-cover-meta">${formatInt(doc.pages)} trang · ${esc(doc.level)}</p>
        <p class="pdf-cover-meta">${formatInt(cites.length)} trích dẫn</p>
      </div>
    </div>
    <h3 style="margin:.4rem 0 .2rem">${esc(doc.title)}</h3>
    <p class="small muted" style="margin:0">${esc(doc.summary)}</p>
    <ul class="small" style="margin:.5rem 0 0;padding-inline-start:1.1em">
      ${doc.bullets.map((line) => `<li>${esc(line)}</li>`).join('')}
    </ul>
    <p class="row row--tight" style="margin:.7rem 0 0">
      <a class="btn btn--ghost btn--sm" href="./${esc(doc.file)}" target="_blank" rel="noopener">${icon('book')}Mở PDF</a>
      <a class="btn btn--quiet btn--sm" href="./${esc(doc.file)}" download>${icon('download')}Tải về</a>
    </p>
  </article>`;
}

function citeRow(paper) {
  const doi = doiUrl(paper.doi);
  return `<li class="cite">
    <span class="cite-title">${esc(paper.title)}</span>
    <span class="cite-meta">${esc(apaLine(paper))}</span>
    <span class="small" style="color:var(--ink-muted)"><strong>Phát hiện:</strong> ${esc(paper.findingVi)}</span>
    <span class="small" style="color:var(--ink-muted)"><strong>Áp dụng:</strong> ${esc(paper.applyVi)}</span>
    <span class="cite-links">
      <a href="${esc(scholarUrl(paper.title, paper.authors))}" target="_blank" rel="noopener">Google Scholar ${icon('external')}</a>
      ${doi ? `<a href="${esc(doi)}" target="_blank" rel="noopener">DOI ${icon('external')}</a>` : ''}
      ${(paper.docs || []).length > 0 ? `<span class="faint">PDF: ${paper.docs.map((doc) => esc(doc)).join(', ')}</span>` : ''}
    </span>
  </li>`;
}

export function renderLibrary({ data, ui }) {
  const papers = data.papers || [];
  const docs = data.docs || [];
  const stats = libraryStats(papers, docs);
  const tags = tagsOf(papers);
  const filtered = sortPapers(searchPapers(papers, ui.query, ui.tag));

  return `
  <section aria-labelledby="library-title">
    <p class="eyebrow">${icon('library')}Học liệu có trích dẫn</p>
    <h1 id="library-title">Thư viện PDF &amp; bằng chứng khoa học</h1>
    <p class="muted" style="max-width:64ch">Mỗi tài liệu trong thư viện đều ghi rõ nghiên cứu đứng sau. Nhấn “Google Scholar”
      để tự kiểm chứng nguồn — chúng tôi không muốn bạn tin ứng dụng này một cách mù quáng.</p>
    <p class="row row--tight" style="margin:1rem 0">
      <span class="pill pill--info">${icon('book')}${formatInt(stats.docs)} tài liệu PDF</span>
      <span class="pill">${icon('quote')}${formatInt(stats.papers)} trích dẫn</span>
      <span class="pill pill--muted">${formatInt(stats.withDoi)} DOI</span>
      <span class="pill pill--muted">${stats.fromYear}–${stats.toYear}</span>
    </p>
  </section>

  <section class="grid" aria-label="Tài liệu PDF">
    ${docs.map((doc) => docCard(doc, papers)).join('')}
  </section>

  <section class="card" style="margin-top:1.2rem" aria-labelledby="cites-title">
    <div class="section-head">
      <h2 id="cites-title">Kho trích dẫn</h2>
      <span class="pill pill--muted">${formatInt(filtered.length)} / ${formatInt(papers.length)}</span>
    </div>
    <form class="search" role="search" data-action="search-papers">
      <label class="sr-only" for="paper-query">Tìm theo tác giả, tiêu đề, chủ đề</label>
      <input class="text-field" id="paper-query" name="query" type="search" placeholder="Ví dụ: spaced repetition, Nation, writing"
        value="${esc(ui.query)}">
      <button class="btn btn--primary" type="submit">${icon('search')}Tìm</button>
      ${ui.query ? `<button class="btn btn--ghost" type="button" data-action="clear-search">Xoá lọc</button>` : ''}
    </form>
    <div class="filters" role="group" aria-label="Lọc theo chủ đề" style="margin-bottom:.8rem">
      <button class="filter" type="button" data-action="filter-tag" data-value="all" aria-pressed="${ui.tag === 'all'}">Tất cả</button>
      ${tags
        .map(
          (tag) => `<button class="filter" type="button" data-action="filter-tag" data-value="${esc(tag.id)}"
            aria-pressed="${ui.tag === tag.id}">${esc(tagLabel(tag.id))} (${tag.count})</button>`,
        )
        .join('')}
    </div>
    ${
      filtered.length > 0
        ? `<ul class="plain-list">${filtered.map(citeRow).join('')}</ul>`
        : `<div class="callout"><h3>Không tìm thấy trích dẫn</h3><p>Thử từ khoá ngắn hơn hoặc bỏ bộ lọc chủ đề.</p></div>`
    }
  </section>

  <aside class="callout" style="margin-top:1rem">
    <h3>Cách đọc trích dẫn</h3>
    <p>“Phát hiện” tóm tắt kết quả nghiên cứu bằng tiếng Việt. “Áp dụng” nói rõ phần nào của ứng dụng dựa trên kết quả đó.
      Nếu một nghiên cứu chỉ đúng trong bối cảnh hẹp, chúng tôi ghi rõ để bạn không suy rộng.</p>
  </aside>`;
}
