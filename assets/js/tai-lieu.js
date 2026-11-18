/**
 * Trình điều khiển Thư Viện PDF Học Thuật & 80 Trích Dẫn Google Scholar (assets/js/tai-lieu.js)
 */

import {
  buildScholarlyReportHtml,
  formatApaCitation,
  formatBibtexCitation,
  getCitationById,
  getDomainStats,
  getEnrichedPdfCatalog,
  loadAppState,
  searchCitations,
  toDateKey,
} from "../../src/index.js";

function esc(val) {
  return String(val ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

let toastTimer = null;
function showToast(text) {
  const el = document.getElementById("scholar-toast");
  if (!el) return;
  el.textContent = text;
  el.hidden = false;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.hidden = true;
  }, 3000);
}

function renderPdfCatalog() {
  const grid = document.getElementById("pdf-catalog-grid");
  if (!grid) return;
  const catalog = getEnrichedPdfCatalog();
  grid.innerHTML = catalog
    .map(
      (doc) => `
      <article class="yi-unit">
        <div class="yi-badges-inline">
          <span class="yi-tag yi-tag--emerald">${doc.citationCount} trích dẫn Google Scholar</span>
          <span class="yi-tag yi-tag--blue">${esc(doc.targetBandVi)}</span>
        </div>
        <h3>${esc(doc.titleVi)}</h3>
        <p class="yi-muted">${esc(doc.subtitleVi)}</p>
        <ul style="margin:0 0 10px;padding-left:18px;font-size:14px;">
          ${doc.highlightsVi.map((h) => `<li>${esc(h)}</li>`).join("")}
        </ul>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:auto;">
          <a class="yi-btn yi-btn--primary" href="${esc(doc.filePath)}" download>Tải PDF</a>
          <button type="button" class="yi-btn" data-preview-pdf="${esc(doc.filePath)}" data-preview-title="${esc(doc.titleVi)}">
            Xem trực tuyến
          </button>
        </div>
      </article>`,
    )
    .join("");
}

function populateDomains() {
  const sel = document.getElementById("scholar-domain");
  if (!sel) return;
  for (const dom of getDomainStats()) {
    const opt = document.createElement("option");
    opt.value = dom.id;
    opt.textContent = `${dom.label} (${dom.count} công trình)`;
    sel.appendChild(opt);
  }
}

function renderCitations() {
  const query = document.getElementById("scholar-search")?.value || "";
  const domain = document.getElementById("scholar-domain")?.value || "all";
  const results = searchCitations(query, domain);
  const countEl = document.getElementById("scholar-count");
  const listEl = document.getElementById("scholar-list");
  if (countEl) {
    countEl.textContent = `Đang hiển thị ${results.length} công trình nghiên cứu kiểm chứng từ Google Scholar.`;
  }
  if (!listEl) return;

  listEl.innerHTML = results
    .map(
      (c, i) => `
      <article class="yi-unit">
        <div class="yi-badges-inline">
          <span class="yi-tag">[${i + 1}] Năm ${c.year}</span>
          ${c.doi ? `<span class="yi-tag yi-tag--blue">DOI: ${esc(c.doi)}</span>` : `<span class="yi-tag">Chuyên khảo khảo thí</span>`}
        </div>
        <h3 style="font-size:16px;">${esc(c.title)}</h3>
        <p class="yi-muted" style="margin:0;"><strong>${esc(c.authors)}</strong> (${c.year}) · <em>${esc(c.venue)}</em></p>
        <p style="margin:4px 0;font-size:14px;"><strong>Ứng dụng IELTS:</strong> ${esc(c.takeawayVi)}</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <a class="yi-btn yi-btn--primary" href="${esc(c.scholarUrl)}" target="_blank" rel="noopener noreferrer">
            Mở trên Google Scholar
          </a>
          ${
            c.doiUrl
              ? `<a class="yi-btn" href="${esc(c.doiUrl)}" target="_blank" rel="noopener noreferrer">Mở liên kết DOI</a>`
              : ""
          }
          <button type="button" class="yi-btn" data-copy-apa="${esc(c.id)}">Sao chép APA 7</button>
          <button type="button" class="yi-btn" data-copy-bib="${esc(c.id)}">Sao chép BibTeX</button>
        </div>
      </article>`,
    )
    .join("");
}

document.addEventListener("click", (ev) => {
  const btn = ev.target.closest("button");
  if (!btn) return;

  if (btn.dataset.previewPdf) {
    const sec = document.getElementById("pdf-preview-section");
    const frame = document.getElementById("pdf-preview-frame");
    const title = document.getElementById("pdf-preview-title");
    if (sec && frame && title) {
      title.textContent = `Xem trước: ${btn.dataset.previewTitle}`;
      frame.src = btn.dataset.previewPdf;
      sec.hidden = false;
      sec.scrollIntoView({ behavior: "smooth" });
    }
    return;
  }
  if (btn.id === "btn-close-preview") {
    const sec = document.getElementById("pdf-preview-section");
    const frame = document.getElementById("pdf-preview-frame");
    if (sec && frame) {
      frame.removeAttribute("src");
      sec.hidden = true;
    }
    return;
  }
  if (btn.id === "btn-export-personal-pdf") {
    const state = loadAppState(window.localStorage);
    const html = buildScholarlyReportHtml({
      learnerName: state.profile.displayName,
      proficiencyScore: state.profile.proficiencyScore,
      targetBand: state.profile.targetBand,
      gamification: state.gamification,
      hlrCards: state.hlrCards,
      generatedDate: toDateKey(),
      includeAllCitations: true,
    });
    const win = window.open("", "_blank");
    if (win) {
      win.document.open();
      win.document.write(html);
      win.document.close();
      win.focus();
    }
    return;
  }
  if (btn.dataset.copyApa) {
    const c = getCitationById(btn.dataset.copyApa);
    if (c && navigator.clipboard) {
      navigator.clipboard.writeText(formatApaCitation(c));
      showToast("Đã sao chép trích dẫn chuẩn APA 7 vào bộ nhớ tạm!");
    }
    return;
  }
  if (btn.dataset.copyBib) {
    const c = getCitationById(btn.dataset.copyBib);
    if (c && navigator.clipboard) {
      navigator.clipboard.writeText(formatBibtexCitation(c));
      showToast("Đã sao chép mã BibTeX vào bộ nhớ tạm!");
    }
  }
});

document.getElementById("scholar-search")?.addEventListener("input", renderCitations);
document.getElementById("scholar-domain")?.addEventListener("change", renderCitations);

renderPdfCatalog();
populateDomains();
renderCitations();
