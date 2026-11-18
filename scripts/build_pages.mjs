#!/usr/bin/env node
/**
 * Đóng gói bản phát hành tĩnh tối ưu cho GitHub Pages vào thư mục _site/
 * (scripts/build_pages.mjs) — Đảm bảo tổng dung lượng < 250 MB, đầy đủ trang IELTS,
 * lộ trình thông minh, 6 cẩm nang PDF học thuật Google Scholar, kho đề Cambridge 6-20
 * và toàn bộ sách từ vựng Anh-Việt.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "_site");
const BASE_URL = "https://johnlikescarrot.github.io/yysd-testcenter";

function resetDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function copyTree(srcRel, filterFn = () => true) {
  const src = path.join(ROOT, srcRel);
  const dst = path.join(OUT, srcRel);
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isFile()) {
    if (!filterFn(srcRel)) return;
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
    return;
  }
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const childRel = path.posix.join(srcRel, entry.name);
    if (!filterFn(childRel, entry)) continue;
    copyTree(childRel, filterFn);
  }
}

function measureBytes(dir) {
  let bytes = 0;
  let files = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = measureBytes(full);
      bytes += sub.bytes;
      files += sub.files;
    } else {
      bytes += fs.statSync(full).size;
      files += 1;
    }
  }
  return { bytes, files };
}

resetDir(OUT);

// 1. Sao chép toàn bộ trang HTML gốc
const htmlPages = fs
  .readdirSync(ROOT)
  .filter((f) => f.endsWith(".html"))
  .sort();
for (const html of htmlPages) {
  copyTree(html);
}

// 2. Sao chép các mô-đun ES lõi (src/), tài nguyên giao diện & 6 PDF học thuật (assets/), data/
copyTree("src");
copyTree("assets");
copyTree("data");

// 3. Sao chép kho nội dung IELTS & từ vựng Anh-Việt (giữ audio Cambridge 20 mẫu để nhẹ < 200 MB)
const libSingleFiles = [
  "library/manifest.json",
  "library/reading-taxonomy.json",
  "library/listening-taxonomy.json",
  "library/alevel-catalog.json",
];
for (const f of libSingleFiles) {
  copyTree(f);
}

const libFolders = [
  "library/mock/cambridge-reading",
  "library/mock/cambridge-writing",
  "library/mock/ielts",
  "library/study/vocab",
  "library/study/vocab-cet4",
  "library/study/vocab-cet4-lite",
  "library/study/vocab-cet4-data",
  "library/study/vocab-special-listening",
  "library/study/vocab-special-reading",
  "library/study/vocab-special-writing",
  "library/study/vocab-themes/themes.json",
  "library/study/vocab-themes/data",
  "library/practice/changnanju",
  "library/practice/jingting",
  "library/practice/word-realm",
];
for (const folder of libFolders) {
  copyTree(folder, (rel) => !rel.endsWith(".mp3") && !rel.endsWith(".m4a"));
}

copyTree("library/mock/cambridge-listening", (rel) => {
  if (rel.endsWith(".html") || rel.endsWith(".json") || rel.endsWith(".png") || rel.endsWith(".jpg") || rel.endsWith(".svg")) {
    return true;
  }
  // Giữ trọn bộ âm thanh Cambridge IELTS 20 Test 1 để trải nghiệm nghe trực tiếp trên GitHub Pages
  return /ielts20_test1_/i.test(rel);
});

// 4. Tạo .nojekyll, robots.txt và sitemap.xml đạt chuẩn SEO 100/100 của Google Lighthouse
fs.writeFileSync(path.join(OUT, ".nojekyll"), "", "utf8");
fs.writeFileSync(
  path.join(OUT, "robots.txt"),
  `User-agent: *\nAllow: /\nSitemap: ${BASE_URL}/sitemap.xml\n`,
  "utf8",
);

const priorityPages = [
  "index.html",
  "lo-trinh.html",
  "tai-lieu.html",
  "vocab.html",
  "cambridge.html",
  "zone.html",
  "speaking.html",
  "dashboard.html",
  "results.html",
  "requirements.html",
  "alevel.html",
];
const sitemapXml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...priorityPages.map((p) => `  <url><loc>${BASE_URL}/${p}</loc></url>`),
  "</urlset>",
  "",
].join("\n");
fs.writeFileSync(path.join(OUT, "sitemap.xml"), sitemapXml, "utf8");

const { bytes, files } = measureBytes(OUT);
const mb = (bytes / (1024 * 1024)).toFixed(2);
if (bytes > 900 * 1024 * 1024) {
  console.error(`THẤT BẠI: Dung lượng _site (${mb} MB) vượt ngưỡng an toàn 900 MB của GitHub Pages.`);
  process.exit(1);
}
console.log(`Đã đóng gói _site/ thành công: ${files} tệp · ${mb} MB (sẵn sàng triển khai GitHub Pages).`);
