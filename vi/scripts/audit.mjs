#!/usr/bin/env node
/* Kiểm tra tĩnh các tiêu chí Lighthouse + chất lượng nội dung cho IELTS Việt.
   Không cần Chrome: kiểm tra HTML/CSS/JS/dữ liệu và ngân sách tải trang.
   Chạy: node vi/scripts/audit.mjs */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PAGES = ["index.html", "hoc.html", "luyen-tap.html", "thu-vien.html", "bang-xep-hang.html", "ho-so.html"];
const failures = [];
const notes = [];

function fail(message) {
  failures.push(message);
}

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

function kb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function contrast(hexA, hexB) {
  const lum = (hex) => {
    const value = hex.replace("#", "");
    const parts = value.length === 3 ? [...value].map((c) => c + c) : value.match(/../g);
    const [r, g, b] = parts.map((p) => {
      const c = parseInt(p, 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const a = lum(hexA);
  const b = lum(hexB);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const TITLE_MIN = 15;
const TITLE_MAX = 65;
const DESC_MIN = 70;
const DESC_MAX = 165;

for (const page of PAGES) {
  const html = read(page);
  const label = `[${page}]`;

  if (!/<html lang="vi">/.test(html)) fail(`${label} thiếu <html lang="vi">`);
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1]?.trim() || "";
  if (title.length < TITLE_MIN || title.length > TITLE_MAX) fail(`${label} title dài ${title.length} ký tự (${TITLE_MIN}–${TITLE_MAX})`);
  const desc = html.match(/<meta name="description" content="([^"]+)"/)?.[1]?.trim() || "";
  if (desc.length < DESC_MIN || desc.length > DESC_MAX) fail(`${label} meta description dài ${desc.length} (${DESC_MIN}–${DESC_MAX})`);
  if (!/name="viewport" content="width=device-width, initial-scale=1"/.test(html)) fail(`${label} viewport thiếu hoặc chặn zoom`);
  if (!/name="theme-color"/.test(html)) fail(`${label} thiếu theme-color`);
  if (!/rel="manifest"/.test(html)) fail(`${label} thiếu manifest`);
  if (!/type="module"/.test(html)) fail(`${label} không nạp module ES`);
  if (/user-scalable=no|maximum-scale=1/.test(html)) fail(`${label} chặn phóng to`);
  if (/https?:\/\/(?!localhost)[^"]+\.(css|js|woff2?|png|jpg)/.test(html)) fail(`${label} tải tài nguyên bên ngoài`);
  if (/on(click|submit|load)=/i.test(html)) fail(`${label} có inline event handler`);

  const h1 = [...html.matchAll(/<h1[\s>]/g)].length;
  if (h1 !== 1) fail(`${label} có ${h1} thẻ h1 (cần đúng 1)`);

  const headings = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
  let previous = 1;
  for (const level of headings) {
    if (level > previous + 1) fail(`${label} nhảy bậc tiêu đề h${previous} → h${level}`);
    previous = level;
  }

  const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  for (const img of imgs) {
    if (!/alt=/.test(img)) fail(`${label} <img> thiếu alt`);
  }

  const inputs = [...html.matchAll(/<(input|select)\b[^>]*>/g)].map((m) => m[0]);
  for (const input of inputs) {
    const id = input.match(/id="([^"]+)"/)?.[1];
    if (!id) continue;
    if (!new RegExp(`for="${id}"`).test(html) && !/aria-label=/.test(input)) {
      fail(`${label} ${input.slice(0, 40)}… thiếu label`);
    }
  }

  for (const anchor of [...html.matchAll(/<a\b[^>]*>/g)].map((m) => m[0])) {
    if (!/href=/.test(anchor)) fail(`${label} có <a> thiếu href`);
    if (/href="javascript:/i.test(anchor)) fail(`${label} có link javascript:`);
    if (/target="_blank"/.test(anchor) && !/rel="[^"]*noopener/.test(anchor)) fail(`${label} target=_blank thiếu rel=noopener`);
  }

  if (/[\u4e00-\u9fff]/.test(html.replace(/<!--[\s\S]*?-->/g, ""))) {
    fail(`${label} còn chữ Hán — bản tiếng Việt phải sạch CJK`);
  }
}

const cssFiles = fs.readdirSync(path.join(ROOT, "assets/css")).filter((f) => f.endsWith(".css"));
const cssBytes = cssFiles.reduce((sum, file) => sum + fs.statSync(path.join(ROOT, "assets/css", file)).size, 0);
const jsFiles = fs.readdirSync(path.join(ROOT, "assets/js")).filter((f) => f.endsWith(".js"));
const jsBytes = jsFiles.reduce((sum, file) => sum + fs.statSync(path.join(ROOT, "assets/js", file)).size, 0);
const dataBytes = ["data/lessons.json", "data/library.json"].reduce((sum, file) => sum + fs.statSync(path.join(ROOT, file)).size, 0);

if (cssBytes > 80 * 1024) fail(`CSS ${kb(cssBytes)} vượt ngân sách 80 KB`);
if (jsBytes > 220 * 1024) fail(`JS ${kb(jsBytes)} vượt ngân sách 220 KB`);
if (dataBytes > 120 * 1024) fail(`Dữ liệu ${kb(dataBytes)} vượt ngân sách 120 KB`);
notes.push(`CSS ${kb(cssBytes)} · JS ${kb(jsBytes)} · JSON ${kb(dataBytes)}`);

const manifest = JSON.parse(read("manifest.webmanifest"));
if (manifest.lang !== "vi") fail("manifest.lang phải là vi");
if (!manifest.icons?.length) fail("manifest thiếu icon");
for (const icon of manifest.icons || []) {
  if (!fs.existsSync(path.join(ROOT, icon.src))) fail(`manifest trỏ tới icon không tồn tại: ${icon.src}`);
}
if (manifest.display !== "standalone") fail("manifest.display nên là standalone");
if (!fs.existsSync(path.join(ROOT, "assets/js/sw.js"))) fail("thiếu service worker");

// Màu chữ trên nền phải đạt WCAG AA (>= 4.5:1)
const pairs = [
  ["#101827", "#f6f3ec", "chữ chính trên giấy"],
  ["#59616f", "#f6f3ec", "chữ phụ trên giấy"],
  ["#ffffff", "#0b1c33", "chữ trên navy"],
  ["#7c5c22", "#f4ead3", "nhãn vàng"],
  ["#ffffff", "#2c6e49", "chữ trên xanh"],
  ["#ffffff", "#a63a34", "chữ trên đỏ"]
];
for (const [fg, bg, name] of pairs) {
  const ratio = contrast(fg, bg);
  if (ratio < 4.5) fail(`Độ tương phản ${name} chỉ ${ratio.toFixed(2)}:1 (< 4.5)`);
}

// Thư viện: đủ tài liệu, PDF tồn tại, trích dẫn Scholar
const library = JSON.parse(read("data/library.json"));
let citations = 0;
for (const doc of library.docs) {
  const file = path.join(ROOT, doc.file.replace(/^assets\/pdf\//, "assets/pdf/"));
  if (!fs.existsSync(file)) fail(`Thiếu PDF ${doc.file}`);
  else if (fs.statSync(file).size < 20 * 1024) fail(`PDF ${doc.file} quá nhỏ`);
  citations += doc.citations.length;
  for (const citation of doc.citations) {
    const query = encodeURIComponent(citation.query);
    if (!citation.query || !citation.title || !citation.authors) fail(`Trích dẫn thiếu trường trong ${doc.id}`);
    if (!query) fail(`Trích dẫn rỗng trong ${doc.id}`);
  }
}
if (citations < 50) fail(`Chỉ có ${citations} trích dẫn (cần ≥ 50)`);
notes.push(`${library.docs.length} tài liệu · ${citations} trích dẫn Google Scholar`);

const lessons = JSON.parse(read("data/lessons.json"));
const questions = lessons.units.flatMap((unit) => unit.lessons.flatMap((lesson) => lesson.questions));
if (questions.length < 40) fail(`Chỉ có ${questions.length} câu hỏi (cần ≥ 40)`);
for (const question of questions) {
  if (!["choice", "fill", "order", "listen"].includes(question.type)) fail(`Câu ${question.id} dùng dạng lạ`);
  if (!question.explain) fail(`Câu ${question.id} thiếu giải thích tiếng Việt`);
  if ((question.type === "choice" || question.type === "listen") && !(question.answer >= 0 && question.answer < question.options.length)) {
    fail(`Câu ${question.id} có chỉ số đáp án sai`);
  }
  if (question.type === "order" && question.bank.length !== question.answer.length) {
    fail(`Câu ${question.id} có ngân hàng từ không khớp đáp án`);
  }
}
notes.push(`${lessons.units.length} unit · ${questions.length} câu hỏi`);
if (/[\u4e00-\u9fff]/.test(read("data/lessons.json"))) fail("Nội dung bài học còn chữ Hán");
if (/[\u4e00-\u9fff]/.test(read("data/library.json"))) fail("Thư viện còn chữ Hán");

console.log("Kiểm tra Lighthouse của IELTS Việt");
console.log("---------------------------------");
for (const note of notes) console.log(`· ${note}`);
if (failures.length) {
  console.error(`\n✖ ${failures.length} vấn đề:`);
  for (const message of failures) console.error(`  - ${message}`);
  process.exit(1);
}
console.log("\n✓ Tất cả kiểm tra đạt: SEO, a11y cơ bản, hiệu năng, PWA, nội dung, trích dẫn.");
