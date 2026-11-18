#!/usr/bin/env node
/* Sinh 6 cẩm nang PDF tiếng Việt từ vi/data/library.json + pdf-content.mjs.
   Mỗi trích dẫn có liên kết bấm được tới Google Scholar. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";
import { CONTENT } from "./pdf-content.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const VI = path.join(ROOT, "vi");
const OUT = path.join(VI, "assets/pdf");

const NAVY = "#0b1c33";
const GOLD = "#8a6a2f";
const MUTED = "#545c6b";
const LINE = "#ddd6c6";

function resolveFont(file) {
  const dir = process.env.PDF_FONT_DIR || "/usr/share/fonts/truetype/dejavu";
  const candidates = [
    path.join(dir, file),
    path.join(ROOT, "vi/assets/fonts", file),
    `/usr/share/fonts/truetype/dejavu/${file}`,
    `/usr/share/fonts/TTF/${file}`,
    `/Library/Fonts/${file}`
  ];
  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (!found) {
    throw new Error(`Không tìm thấy font ${file}. Đặt PDF_FONT_DIR trỏ tới thư mục chứa DejaVu.`);
  }
  return found;
}

function scholarUrl(citation) {
  return `https://scholar.google.com/scholar?q=${encodeURIComponent(citation.query || citation.title)}`;
}

function ensureSpace(doc, needed) {
  const bottom = doc.page.height - doc.page.margins.bottom - 26;
  if (doc.y + needed > bottom) doc.addPage();
}

function heading(doc, text) {
  ensureSpace(doc, 70);
  doc.moveDown(0.6);
  doc.fillColor(NAVY).font("bold").fontSize(15).text(text, { lineGap: 3 });
  doc.moveDown(0.35);
  doc.strokeColor(GOLD).lineWidth(1.2).moveTo(doc.x, doc.y).lineTo(doc.x + 54, doc.y).stroke();
  doc.moveDown(0.6);
}

function paragraph(doc, text) {
  doc.fillColor("#1d2430").font("body").fontSize(10.5).text(text, {
    align: "justify",
    lineGap: 4.2,
    paragraphGap: 6
  });
  doc.moveDown(0.35);
}

function bullet(doc, text) {
  ensureSpace(doc, 34);
  const x = doc.x;
  doc.fillColor(GOLD).font("bold").fontSize(10.5).text("•", x, doc.y, { continued: false });
  doc.fillColor("#1d2430").font("body").fontSize(10.5).text(text, x + 14, doc.y - doc.currentLineHeight(), {
    width: doc.page.width - doc.page.margins.right - x - 14,
    lineGap: 3.4
  });
  doc.moveDown(0.25);
}

function callout(doc, text) {
  ensureSpace(doc, 80);
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const padding = 12;
  const height = doc.heightOfString(text, { width: width - padding * 2, lineGap: 3.5 }) + padding * 2;
  const top = doc.y;
  doc.save();
  doc.roundedRect(doc.page.margins.left, top, width, height, 8).fill("#f6efdf");
  doc.restore();
  doc.fillColor("#5b4720").font("body").fontSize(10).text(text, doc.page.margins.left + padding, top + padding, {
    width: width - padding * 2,
    lineGap: 3.5
  });
  doc.y = top + height + 12;
}

function table(doc, spec) {
  const widths = [0.24, 0.44, 0.32];
  const left = doc.page.margins.left;
  const total = doc.page.width - left - doc.page.margins.right;
  const cols = widths.map((w) => total * w);
  const pad = 6;
  const rowHeight = (cells) =>
    Math.max(...cells.map((cell, i) => doc.heightOfString(String(cell), { width: cols[i] - pad * 2 }) + pad * 2));
  ensureSpace(doc, 60);
  let y = doc.y;
  doc.font("bold").fontSize(9);
  const headerHeight = rowHeight(spec.headers);
  doc.save();
  doc.rect(left, y, total, headerHeight).fill(NAVY);
  doc.restore();
  let x = left;
  doc.fillColor("#fffdf7");
  spec.headers.forEach((cell, i) => {
    doc.text(String(cell), x + pad, y + pad, { width: cols[i] - pad * 2 });
    x += cols[i];
  });
  y += headerHeight;
  doc.font("body").fontSize(9).fillColor("#1d2430");
  spec.rows.forEach((row, index) => {
    const height = rowHeight(row);
    if (y + height > doc.page.height - doc.page.margins.bottom - 30) return;
    if (index % 2 === 0) {
      doc.save();
      doc.rect(left, y, total, height).fill("#faf7ef");
      doc.restore();
    }
    x = left;
    doc.fillColor("#1d2430").font("body").fontSize(9);
    row.forEach((cell, i) => {
      doc.text(String(cell), x + pad, y + pad, { width: cols[i] - pad * 2 });
      x += cols[i];
    });
    doc.strokeColor(LINE).lineWidth(0.6).moveTo(left, y + height).lineTo(left + total, y + height).stroke();
    y += height;
  });
  doc.y = y + 14;
}

function coverPage(doc, meta, citationCount) {
  const { width, height } = doc.page;
  doc.save();
  doc.rect(0, 0, width, height).fill(NAVY);
  doc.rect(0, height - 8, width, 8).fill(GOLD);
  doc.restore();
  doc.fillColor("#d9c392").font("bold").fontSize(11).text("YYSD · IELTS VIỆT", 56, 64, { characterSpacing: 2 });
  doc.fillColor("#fffdf7").font("bold").fontSize(30).text(meta.title, 56, 150, {
    width: width - 112,
    lineGap: 6
  });
  doc.moveDown(0.6);
  doc.fillColor("#c9d3e2").font("body").fontSize(13).text(meta.subtitle, { width: width - 140, lineGap: 4 });
  doc.moveDown(1.6);
  doc.fillColor("#d9c392").font("body").fontSize(11).text(
    `Trình độ ${meta.level} · ${meta.pages} trang · ${citationCount} trích dẫn Google Scholar`,
    { lineGap: 3 }
  );
  doc.moveDown(0.4);
  doc.fillColor("#9fb0c7").font("body").fontSize(10).text(meta.author, { lineGap: 3 });
  doc.fillColor("#9fb0c7").font("body").fontSize(9).text(
    "Tài liệu học thuật nội bộ. Mọi trích dẫn đều có liên kết tới scholar.google.com để bạn tự kiểm chứng nguồn.",
    56,
    height - 110,
    { width: width - 112, lineGap: 3 }
  );
}

function citationsSection(doc, citations) {
  doc.addPage();
  heading(doc, "Trích dẫn học thuật & nguồn kiểm chứng");
  paragraph(
    doc,
    "Danh sách dưới đây là các nghiên cứu được tham chiếu trong tài liệu. Mỗi mục có liên kết tìm kiếm trên Google Scholar (scholar.google.com). Hãy đọc bản gốc khi bạn cần trích dẫn trong bài luận hoặc muốn kiểm tra số liệu."
  );
  citations.forEach((citation, index) => {
    ensureSpace(doc, 74);
    const top = doc.y;
    doc.fillColor(GOLD).font("bold").fontSize(9).text(String(index + 1).padStart(2, "0"), 56, top + 1, { width: 22 });
    doc.fillColor("#101827").font("bold").fontSize(10).text(citation.title, 80, top, {
      width: doc.page.width - 136,
      lineGap: 2.5
    });
    doc.fillColor(MUTED).font("body").fontSize(9).text(
      `${citation.authors} (${citation.year}). ${citation.venue}`,
      80,
      doc.y,
      { width: doc.page.width - 136, lineGap: 2.5 }
    );
    doc.fillColor(GOLD).font("body").fontSize(8.5).text("Google Scholar ↗", 80, doc.y + 2, {
      link: scholarUrl(citation),
      underline: true
    });
    doc.moveDown(0.55);
  });
}

function checklistSection(doc, items) {
  heading(doc, "Checklist tự đánh giá");
  paragraph(doc, "Đánh dấu vào ô khi bạn đã thực sự làm được — không phải khi bạn đã đọc qua.");
  items.forEach((item) => {
    ensureSpace(doc, 36);
    const top = doc.y;
    doc.save();
    doc.rect(56, top + 2, 9, 9).strokeColor(GOLD).lineWidth(1).stroke();
    doc.restore();
    doc.fillColor("#1d2430").font("body").fontSize(10.5).text(item, 74, top, {
      width: doc.page.width - 130,
      lineGap: 3
    });
    doc.moveDown(0.5);
  });
}

function buildDoc(meta, content, citations) {
  const file = path.join(OUT, path.basename(meta.file));
  fs.mkdirSync(OUT, { recursive: true });
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 56, bottom: 64, left: 56, right: 56 },
    bufferPages: true,
    info: {
      Title: meta.title,
      Author: meta.author,
      Subject: meta.summary,
      Keywords: (meta.tags || []).join(", "),
      Creator: "IELTS Việt · YYSD"
    }
  });
  doc.pipe(fs.createWriteStream(file));
  doc.registerFont("body", resolveFont("DejaVuSans.ttf"));
  doc.registerFont("bold", resolveFont("DejaVuSans-Bold.ttf"));

  coverPage(doc, meta, citations.length);
  doc.addPage();
  heading(doc, "Lời nói đầu");
  paragraph(doc, content.intro);
  paragraph(doc, `Tài liệu này gồm ${content.sections.length} phần chính, một checklist tự đánh giá và ${citations.length} trích dẫn học thuật có liên kết Google Scholar. Bạn có thể đọc trên điện thoại ở chế độ offline sau khi tải PDF.`);

  for (const section of content.sections) {
    heading(doc, section.heading);
    (section.paragraphs || []).forEach((text) => paragraph(doc, text));
    (section.bullets || []).forEach((text) => bullet(doc, text));
    if (section.table) table(doc, section.table);
    if (section.callout) callout(doc, `Ghi chú: ${section.callout}`);
  }

  doc.addPage();
  checklistSection(doc, content.checklist);
  citationsSection(doc, citations);

  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i += 1) {
    doc.switchToPage(range.start + i);
    if (i === 0) continue;
    const bottom = doc.page.height - 40;
    doc.fillColor(MUTED).font("body").fontSize(8).text(`IELTS Việt · ${meta.title}`, 56, bottom, {
      width: 300,
      lineBreak: false
    });
    doc.fillColor(MUTED).font("body").fontSize(8).text(`Trang ${i + 1}`, 0, bottom, {
      width: doc.page.width - 56,
      align: "right",
      lineBreak: false
    });
  }
  doc.end();
  console.log(`✓ ${meta.file}`);
}

const library = JSON.parse(fs.readFileSync(path.join(VI, "data/library.json"), "utf8"));
for (const meta of library.docs) {
  const content = CONTENT[meta.id];
  if (!content) throw new Error(`Thiếu nội dung cho ${meta.id}`);
  buildDoc(meta, content, meta.citations);
}
