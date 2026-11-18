/* Kiểm tra: trang gốc phải nạp bộ dịch tiếng Việt; trang mới phải lang=vi. */
import { readFileSync, readdirSync } from "node:fs";
let bad = [];
for (const f of readdirSync(".").filter((x) => x.endsWith(".html"))) {
  const t = readFileSync(f, "utf8");
  if (f !== "requirements.html" && !t.includes("i18n-vi.js")) bad.push(f + ": thiếu i18n-vi.js");
}
for (const f of ["hoc-ielts.html", "tai-lieu.html"]) {
  if (!readFileSync(f, "utf8").includes('<html lang="vi">')) bad.push(f + ": thiếu lang=vi");
}
if (bad.length) { console.error(bad.join("\n")); process.exit(1); }
console.log("OK: toàn bộ trang gốc đã nạp bộ dịch tiếng Việt.");
