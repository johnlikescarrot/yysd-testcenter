#!/usr/bin/env node
/* Xác minh PDF tồn tại, đúng số trang trong library.json và có liên kết Scholar. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const library = JSON.parse(fs.readFileSync(path.join(ROOT, "data/library.json"), "utf8"));
let failures = 0;
let links = 0;

for (const doc of library.docs) {
  const file = path.join(ROOT, doc.file);
  if (!fs.existsSync(file)) {
    console.error(`✖ Thiếu ${doc.file}`);
    failures += 1;
    continue;
  }
  const buffer = fs.readFileSync(file);
  const pdfLinks = (buffer.toString("latin1").match(/scholar\.google\.com/g) || []).length;
  const pages = (buffer.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
  links += pdfLinks;
  if (pdfLinks < doc.citations.length) {
    console.error(`✖ ${doc.file}: chỉ có ${pdfLinks} liên kết Scholar (cần ${doc.citations.length})`);
    failures += 1;
  }
  if (pages && Math.abs(pages - doc.pages) > 1) {
    console.error(`✖ ${doc.file}: ${pages} trang nhưng library.json ghi ${doc.pages}`);
    failures += 1;
  }
  console.log(`✓ ${doc.file} · ${doc.pages} trang · ${pdfLinks} liên kết Scholar`);
}

if (failures) {
  console.error(`\n${failures} tệp PDF có vấn đề.`);
  process.exit(1);
}
console.log(`\nTất cả ${library.docs.length} tài liệu hợp lệ · ${links} liên kết Google Scholar.`);
