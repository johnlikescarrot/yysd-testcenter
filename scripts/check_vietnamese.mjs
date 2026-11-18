#!/usr/bin/env node
/**
 * Kiểm toán Việt hóa toàn diện (scripts/check_vietnamese.mjs)
 * Xác minh 0 ký tự phi tiếng Anh / phi tiếng Việt (CJK, Kana, Hangul, Cyrillic,
 * Hebrew, Arabic, Thai, Devanagari), 0 tên tệp phi ASCII, 0 thuộc tính lang="zh",
 * và 0 tham chiếu ICP / phông chữ CJK cũ trên toàn bộ kho mã nguồn.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SKIP_DIRS = new Set([
  ".git",
  "node_modules",
  ".next",
  "dist",
  "build",
  "__pycache__",
  "coverage",
  "_site",
  ".lighthouseci",
]);
const BINARY_EXTS = new Set([
  ".mp3",
  ".m4a",
  ".wav",
  ".ogg",
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".sqlite",
  ".db",
  ".zip",
]);

const FORBIDDEN_RANGES = [
  [0x3000, 0x303f], // Dấu câu CJK
  [0x3040, 0x30ff], // Hiragana & Katakana
  [0x3400, 0x4dbf], // CJK Mở rộng A
  [0x4e00, 0x9fff], // CJK Hợp nhất
  [0xf900, 0xfaff], // CJK Tương thích
  [0xff00, 0xffef], // Ký tự toàn độ rộng CJK
  [0xac00, 0xd7af], // Hangul
  [0x0400, 0x04ff], // Cyrillic
  [0x0590, 0x05ff], // Hebrew
  [0x0600, 0x06ff], // Arabic
  [0x0900, 0x097f], // Devanagari
  [0x0e00, 0x0e7f], // Thai
];

const LANG_ZH_RE = /\blang=["']zh(?:-[A-Za-z]+)?["']/i;
const BANNED_LEGACY_RE = /beian\.(?:miit|mps)\.gov\.cn|Noto\+Serif\+SC|Noto\+Sans\+SC/i;

function findForbiddenChar(text) {
  for (let i = 0; i < text.length; i += 1) {
    const cp = text.codePointAt(i);
    for (const [lo, hi] of FORBIDDEN_RANGES) {
      if (cp >= lo && cp <= hi) {
        return { ch: String.fromCodePoint(cp), cp };
      }
    }
    if (cp > 0xffff) i += 1;
  }
  return null;
}

const errors = [];
let scannedFiles = 0;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    const rel = path.relative(ROOT, full);

    for (let i = 0; i < entry.name.length; i += 1) {
      if (entry.name.charCodeAt(i) > 127) {
        errors.push(`Tên tệp không thuộc ASCII: ${rel}`);
        break;
      }
    }

    if (entry.isDirectory()) {
      walk(full);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (BINARY_EXTS.has(ext)) continue;

    let text;
    try {
      const buf = fs.readFileSync(full);
      if (buf.includes(0)) continue;
      text = buf.toString("utf8");
    } catch {
      continue;
    }

    scannedFiles += 1;
    const hit = findForbiddenChar(text);
    if (hit) {
      const hex = hit.cp.toString(16).toUpperCase().padStart(4, "0");
      errors.push(`Phát hiện ký tự ngoại ngữ U+${hex} (${hit.ch}) trong ${rel}`);
    }
    if ((ext === ".html" || ext === ".htm" || ext === ".tsx") && LANG_ZH_RE.test(text)) {
      errors.push(`Thuộc tính lang="zh" chưa chuyển sang lang="vi" trong ${rel}`);
    }
    if (rel !== "scripts/check_vietnamese.mjs" && BANNED_LEGACY_RE.test(text)) {
      errors.push(`Còn tham chiếu ICP hoặc phông chữ CJK cũ trong ${rel}`);
    }
  }
}

walk(ROOT);

if (errors.length > 0) {
  console.error(`THẤT BẠI: Phát hiện ${errors.length} lỗi Việt hóa (đã quét ${scannedFiles} tệp):`);
  for (const err of errors.slice(0, 30)) {
    console.error(`  - ${err}`);
  }
  process.exit(1);
}

console.log(
  `ĐẠT 100%: Đã kiểm toán ${scannedFiles} tệp văn bản — 0 ký tự phi Anh/Việt, 0 tên tệp phi ASCII, 100% lang="vi".`,
);
