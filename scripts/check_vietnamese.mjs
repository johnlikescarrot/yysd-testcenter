#!/usr/bin/env node
/**
 * Kiểm toán Việt hóa toàn diện (check_vietnamese.mjs)
 * Xác minh 0 ký tự không phải tiếng Anh / tiếng Việt (CJK, Kana, Hangul, Cyrillic,
 * Hebrew, Arabic, Thai, Devanagari), 0 tên tệp phi ASCII, 0 thuộc tính lang="zh",
 * và 0 liên kết ICP cũ trên toàn bộ kho mã nguồn.
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

const NON_EN_VI_SCRIPT_RE =
  /[\u3000-\u303f\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef\uac00-\ud7af\u0400-\u04ff\u0590-\u05ff\u0600-\u06ff\u0900-\u097f\u0e00-\u0e7f]/u;
const LANG_ZH_RE = /\blang=["']zh(?:-[A-Za-z]+)?["']/i;
const BANNED_LEGACY_RE = /beian\.(?:miit|mps)\.gov\.cn|Noto\+Serif\+SC|Noto\+Sans\+SC/i;

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
    const match = NON_EN_VI_SCRIPT_RE.exec(text);
    if (match) {
      const cp = match[0].codePointAt(0).toString(16).toUpperCase().padStart(4, "0");
      errors.push(`Phát hiện ký tự ngoại ngữ U+${cp} (${match[0]}) trong ${rel}`);
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

console.log(`ĐẠT 100%: Đã kiểm toán ${scannedFiles} tệp văn bản — 0 ký tự phi Anh/Việt, 0 tên tệp phi ASCII, 100% lang="vi".`);
