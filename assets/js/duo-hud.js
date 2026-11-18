/**
 * Cầu nối đồng bộ XP, Chuỗi Ngày Học & Báo cáo PDF Học thuật trên toàn bộ nền tảng
 * (assets/js/duo-hud.js) — Tự động ghi nhận điểm thi từ exam.html / cdt-report.html.
 */

import {
  buildScholarlyReportHtml,
  loadAppState,
  recordExternalExamScore,
  saveAppState,
  toDateKey,
} from "../../src/index.js";

window.addEventListener("message", (event) => {
  const data = event?.data;
  if (!data || data.type !== "yysd:score") return;
  const state = loadAppState(window.localStorage);
  const wrongWords = Array.isArray(data.wrongItems)
    ? data.wrongItems
        .filter((w) => w && (w.word || w.ans))
        .slice(0, 12)
        .map((w) => ({
          term: String(w.word || w.ans).trim(),
          meaningVi: String(w.meaning || w.explain || "Từ cần ôn tập từ đề thi Cambridge"),
        }))
    : [];
  const updated = recordExternalExamScore(state, {
    title: document.title || "Đề thi Cambridge IELTS",
    skill: /listening|nghe/i.test(document.title) ? "listening" : "reading",
    score: Number(data.score) || 0,
    total: Number(data.total) || 40,
    band: data.band ?? null,
    wrongWords,
  });
  saveAppState(window.localStorage, updated.state);
});

window.YYSD_EXPORT_SCHOLAR_PDF = function exportScholarPdf() {
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
};
