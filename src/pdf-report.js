/**
 * Danh mục 6 Cẩm nang PDF Học thuật IELTS & Trình tạo Báo cáo Trích dẫn Google Scholar
 * (src/pdf-report.js)
 *
 * Liên kết trực tiếp kho 6 tài liệu PDF học thuật tiếng Việt (assets/docs/*.pdf)
 * với 64 công trình khoa học kiểm duyệt trên Google Scholar và cho phép học viên
 * xuất báo cáo tiến độ cá nhân hóa chuẩn in ấn PDF.
 */

import {
  SCHOLAR_CITATIONS,
  formatApaCitation,
  getCitationsByDomain,
  getCitationsForSkills,
} from "./scholar-citations.js";
import { computeTargetGap, scoreToProfile } from "./proficiency-score.js";
import { buildForgettingCurvePoints, getReviewQueue } from "./hlr-srs.js";
import { WEEKLY_LEAGUES } from "./gamification.js";

export const ACADEMIC_PDF_CATALOG = Object.freeze([
  Object.freeze({
    id: "pdf-complete-handbook",
    titleVi: "Cẩm Nang Khoa Học Luyện Thi IELTS Toàn Diện (Tổng Hợp 80 Nghiên Cứu)",
    subtitleVi:
      "Tích hợp lặp lại ngắt quãng Half-Life Regression, trò chơi hóa Duolingo, khung đối chiếu 0–160 / CEFR / IELTS và toàn bộ 80 trích dẫn Google Scholar.",
    filePath: "assets/docs/cam-nang-khoa-hoc-ielts-toan-dien.pdf",
    domains: ["srs-cognitive", "gamification", "vietnamese-efl"],
    includeAllCitations: true,
    targetBandVi: "Band 4.5 → 9.0",
    highlightsVi: [
      "Công thức Hồi quy Chu kỳ Bán rã (Settles & Meeder, 2016) & đường cong ôn tập tối ưu",
      "Cơ chế sai số dự đoán phần thưởng (De Loof et al., 2018) & thuật toán Bandit nhắc học (Yancey & Settles, 2020)",
      "Bảng đối chiếu chi tiết Điểm năng lực 0–160 ↔ CEFR A1–C2 ↔ IELTS 2.0–9.0",
      "Toàn bộ 80 tài liệu tham khảo chuẩn APA 7 có liên kết trực tiếp tới Google Scholar & DOI",
    ],
  }),
  Object.freeze({
    id: "pdf-reading-science",
    titleVi: "Chiến Lược Đọc Học Thuật IELTS Reading Dựa Trên Bằng Chứng Thực Nghiệm",
    subtitleVi:
      "Mô hình nhận thức xã hội Khalifa & Weir (2009), dữ liệu theo dõi mắt Bax (2013, 2019) và ngưỡng bao phủ từ vựng 98% của Nation (2006).",
    filePath: "assets/docs/chien-luoc-ielts-reading-hoc-thuat.pdf",
    domains: ["reading", "vocabulary", "srs-cognitive"],
    includeAllCitations: false,
    targetBandVi: "Band 5.5 → 9.0",
    highlightsVi: [
      "Quy trình 3 bước xử lý True / False / Not Given không mắc bẫy suy diễn",
      "Phân bổ 60 phút (17–20–23 phút) theo độ khó tăng dần của 3 bài đọc Cambridge",
      "Kỹ thuật khoanh vùng từ đồng nghĩa và giải phẫu câu phức học thuật",
    ],
  }),
  Object.freeze({
    id: "pdf-listening-metacognition",
    titleVi: "Nghe Hiểu Học Thuật & Siêu Nhận Thức Trong IELTS Listening",
    subtitleVi:
      "Kết hợp giải mã âm thanh bottom-up của Field (2008, 2009, 2013), chu trình siêu nhận thức Vandergrift & Tafaghodtari (2010) và danh sách từ nói ASWL (Dang et al., 2017).",
    filePath: "assets/docs/chien-luoc-ielts-listening-sieu-nhan-thuc.pdf",
    domains: ["listening", "vocabulary", "srs-cognitive"],
    includeAllCitations: false,
    targetBandVi: "Band 5.0 → 9.0",
    highlightsVi: [
      "Bản đồ 5 tầng xử lý nghe hiểu và cách hóa giải bẫy tự sửa thông tin Section 1–3",
      "Hệ thống từ chỉ dấu diễn ngôn (signposting) trong bài giảng đại học Section 4",
      "Phương pháp nghe sâu 4 bước kết hợp gỡ băng và lặp lại ngắt quãng",
    ],
  }),
  Object.freeze({
    id: "pdf-writing-discourse",
    titleVi: "Tư Duy Học Thuật, Liên Kết & Ngôn Ngữ Rào Đón Trong IELTS Writing",
    subtitleVi:
      "Ứng dụng Hyland (2005), Shaw & Weir (2007), Biber et al. (2011), Crossley et al. (2016) và nghiên cứu về thí sinh Việt Nam (Nguyen & Nguyen, 2022; Dang & Dang, 2021).",
    filePath: "assets/docs/cam-nang-ielts-writing-hoc-thuat.pdf",
    domains: ["writing", "vocabulary", "vietnamese-efl"],
    includeAllCitations: false,
    targetBandVi: "Band 6.0 → 8.5+",
    highlightsVi: [
      "Công thức viết đoạn Overview Task 1 và chuẩn xác hóa giới từ số liệu (by / to / of)",
      "Ma trận ngôn ngữ rào đón (hedging) và danh từ hóa (nominalization) cho Task 2",
      "Danh mục kiểm tra 10 lỗi chuyển di Việt–Anh thường làm kẹt điểm ở Band 6.0",
    ],
  }),
  Object.freeze({
    id: "pdf-speaking-caf",
    titleVi: "Phát Triển Độ Trôi Chảy, Tương Tác & Vốn Từ Trong IELTS Speaking",
    subtitleVi:
      "Tổng hợp Taylor (2011), Galaczi & Taylor (2018), Seedhouse & Nakatsuhara (2018), mô hình CAF của Skehan (2009) và Iwashita et al. (2008).",
    filePath: "assets/docs/cam-nang-ielts-speaking-tuong-tac.pdf",
    domains: ["speaking", "gamification", "vietnamese-efl"],
    includeAllCitations: false,
    targetBandVi: "Band 5.5 → 8.5+",
    highlightsVi: [
      "Chiến thuật lập dàn ý 60 giây Part 2 giúp tăng độ dài cụm nói liền mạch (mean length of run)",
      "Khung mở rộng câu trả lời Part 3 từ hiện tượng sang nguyên nhân, điều kiện và hệ quả",
      "Hướng dẫn khắc phục âm cuối, trọng âm từ và ngữ điệu cho người nói tiếng Việt",
    ],
  }),
  Object.freeze({
    id: "pdf-vocabulary-vietnam",
    titleVi: "Từ Vựng Học Thuật, Collocation & Lộ Trình Tối Ưu Cho Người Học Việt Nam",
    subtitleVi:
      "Tích hợp AWL (Coxhead, 2000), AVL (Gardner & Davies, 2014), ACL (Ackermann & Chen, 2013), ASWL (Dang et al., 2017), Nguyen & Webb (2017) và Vu & Peters (2021).",
    filePath: "assets/docs/tu-vung-hoc-thuat-collocation-viet-nam.pdf",
    domains: ["vocabulary", "vietnamese-efl", "srs-cognitive", "gamification"],
    includeAllCitations: false,
    targetBandVi: "Band 4.5 → 8.5+",
    highlightsVi: [
      "Học từ theo Giả thuyết Tải trọng Tham gia (Laufer & Hulstijn, 2001) & hiệu ứng truy xuất (Karpicke & Roediger, 2008)",
      "Bảng kết hợp từ học thuật trọng tâm theo 8 chủ đề thi IELTS phổ biến nhất",
      "Kế hoạch 12 tuần kết hợp Chuỗi Ngày Học, Nhiệm vụ XP và ôn tập HLR dành riêng cho học viên Việt Nam",
    ],
  }),
]);

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Trả về danh sách các cẩm nang PDF kèm số lượng trích dẫn Google Scholar thực tế trong từng cuốn.
 */
export function getEnrichedPdfCatalog() {
  return ACADEMIC_PDF_CATALOG.map((doc) => {
    const citations = doc.includeAllCitations
      ? SCHOLAR_CITATIONS
      : SCHOLAR_CITATIONS.filter((c) => doc.domains.includes(c.domain));
    return {
      ...doc,
      citationCount: citations.length,
      citations,
    };
  });
}

/**
 * Tìm một tài liệu PDF học thuật theo mã ID.
 */
export function getPdfById(pdfId) {
  return getEnrichedPdfCatalog().find((d) => d.id === pdfId) || null;
}

/**
 * Tạo tài liệu HTML chuẩn in ấn / lưu PDF (A4, đầy đủ dấu tiếng Việt) tổng hợp hồ sơ năng lực
 * của học viên cùng danh mục trích dẫn học thuật có liên kết trực tiếp tới Google Scholar.
 */
export function buildScholarlyReportHtml({
  learnerName = "Học viên YYSD",
  proficiencyScore = 95,
  targetBand = 7.5,
  gamification = {},
  hlrCards = [],
  focusSkills = ["reading", "listening", "writing", "speaking", "vocabulary"],
  generatedDate = "2026-11-18",
  includeAllCitations = false,
} = {}) {
  const profile = scoreToProfile(proficiencyScore);
  const gap = computeTargetGap(proficiencyScore, targetBand);
  const queue = getReviewQueue(hlrCards);
  const avgHalfLife =
    hlrCards.length > 0
      ? hlrCards.reduce((sum, c) => sum + (Number(c.halfLifeHours) || 12), 0) / hlrCards.length
      : 24;
  const curve = buildForgettingCurvePoints(avgHalfLife);
  const league = WEEKLY_LEAGUES[Math.max(0, Math.min(9, Number(gamification.leagueTier) || 0))];
  const citations = includeAllCitations
    ? SCHOLAR_CITATIONS
    : getCitationsForSkills(focusSkills, 24);
  const domainSummary = ["srs-cognitive", "gamification", "reading", "listening", "writing", "speaking", "vocabulary", "vietnamese-efl"]
    .map((d) => `${d}: ${getCitationsByDomain(d).length}`)
    .join(" · ");

  const curveRows = curve
    .map(
      (pt) =>
        `<tr><td>${escapeHtml(pt.labelVi)}</td><td><strong>${pt.retentionPct}%</strong></td></tr>`,
    )
    .join("");

  const citationItems = citations
    .map(
      (c, idx) =>
        `<li class="ref-item">` +
        `<span class="ref-num">[${idx + 1}]</span> ` +
        `<span class="ref-apa">${escapeHtml(formatApaCitation(c))}</span> ` +
        `<a href="${escapeHtml(c.scholarUrl)}" target="_blank" rel="noopener noreferrer">Tra cứu Google Scholar</a>` +
        `<div class="ref-note">Ứng dụng sư phạm: ${escapeHtml(c.takeawayVi)}</div>` +
        `</li>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<title>Báo Cáo Học Thuật IELTS — ${escapeHtml(learnerName)}</title>
<style>
  @page { size: A4; margin: 16mm; }
  body { font-family: "DejaVu Sans", system-ui, -apple-system, "Segoe UI", sans-serif; color: #162447; background: #fffcf7; line-height: 1.6; margin: 0; padding: 24px; }
  h1 { font-size: 22px; margin: 0 0 6px; color: #162447; }
  h2 { font-size: 16px; margin: 22px 0 8px; padding-bottom: 4px; border-bottom: 1.5px solid #cbd5e1; color: #162447; }
  .meta { font-size: 12px; color: #475569; margin-bottom: 16px; }
  .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
  .card { border: 1px solid #cbd5e1; border-radius: 10px; padding: 10px 12px; background: #ffffff; }
  .card b { display: block; font-size: 18px; color: #162447; }
  .card span { font-size: 11px; color: #475569; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
  th, td { border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; }
  th { background: #f1f5f9; }
  ol.refs { padding-left: 0; list-style: none; font-size: 11.5px; }
  .ref-item { margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px dashed #e2e8f0; }
  .ref-num { font-weight: 700; color: #162447; }
  .ref-note { color: #334155; margin-top: 3px; font-style: italic; }
  a { color: #1d4ed8; text-decoration: underline; }
</style>
</head>
<body>
  <h1>Báo Cáo Chẩn Đoán &amp; Lộ Trình Học Thuật IELTS Cá Nhân Hóa</h1>
  <p class="meta">Học viên: <strong>${escapeHtml(learnerName)}</strong> · Ngày xuất: ${escapeHtml(generatedDate)} · Trung tâm Luyện thi Quốc tế YYSD</p>
  <div class="grid">
    <div class="card"><b>${profile.score}/160</b><span>Điểm năng lực (${escapeHtml(profile.cefr)})</span></div>
    <div class="card"><b>Band ${profile.ieltsBand.toFixed(1)}</b><span>Mục tiêu: Band ${gap.targetBand.toFixed(1)}</span></div>
    <div class="card"><b>${Number(gamification.streak) || 0} ngày</b><span>Chuỗi học · Giải ${escapeHtml(league.nameVi)}</span></div>
    <div class="card"><b>${queue.averageRetentionPct}%</b><span>Độ bền trí nhớ HLR (${queue.due.length} thẻ cần ôn)</span></div>
  </div>
  <h2>1. Nhận Định Năng Lực &amp; Khuyến Nghị Dựa Trên Nghiên Cứu</h2>
  <p><strong>Mô tả năng lực hiện tại (${escapeHtml(profile.cefrLabelVi)}):</strong> ${escapeHtml(profile.canDoVi)}</p>
  <p><strong>Lộ trình tới mục tiêu Band ${gap.targetBand.toFixed(1)}:</strong> ${
    gap.reached
      ? "Bạn đã đạt hoặc vượt ngưỡng mục tiêu hiện tại — khuyến nghị nâng mục tiêu lên +0.5 Band và duy trì ôn tập phân tán."
      : `Cần tích lũy thêm ${gap.pointsNeeded} điểm năng lực (~${gap.recommendedSessions} phiên học ngắn kết hợp đề thi Cambridge IELTS) theo nguyên lý luyện tập phân tán (Cepeda et al., 2006) và truy xuất chủ động (Karpicke &amp; Roediger, 2008).`
  }</p>
  <h2>2. Dự Báo Đường Cong Ghi Nhớ Half-Life Regression (Chu kỳ bán rã TB: ${avgHalfLife.toFixed(1)} giờ)</h2>
  <table>
    <thead><tr><th>Khoảng cách sau lần ôn</th><th>Xác suất ghi nhớ dự báo (Settles &amp; Meeder, 2016)</th></tr></thead>
    <tbody>${curveRows}</tbody>
  </table>
  <h2>3. Danh Mục Tài Liệu Khoa Học Kiểm Chứng Từ Google Scholar (${citations.length} công trình)</h2>
  <p class="meta">Thống kê kho học thuật YYSD (${SCHOLAR_CITATIONS.length} công trình): ${escapeHtml(domainSummary)}</p>
  <ol class="refs">${citationItems}</ol>
</body>
</html>`;
}
