import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
createRequire(import.meta.url)("../assets/js/i18n-vi.js");
const i = globalThis.YYSD_I18N_VI;
test("dịch chuỗi giao diện sang tiếng Việt", () => {
  assert.equal(i.translateText("首页"), "Trang chủ");
  assert.equal(i.translateText("优益思达国际课程中心 · 教师端"), "Trung tâm Khóa học Quốc tế YYSD · Dành cho giáo viên");
  assert.equal(i.translateText("Listening Practice"), "Listening Luyện tập"); // thuật ngữ kỹ năng giữ nguyên
  assert.equal(i.translateText(""), "");
  assert.equal(i.translateText(null), null);
  assert.equal(i.translateText(42), 42);
  assert.equal(i.translateText("IELTS"), "IELTS");
});
test("từ điển không rỗng và khóa dài được ưu tiên", () => {
  assert.ok(Object.keys(i.PHRASES).length > 80);
  assert.equal(i.translateText("返回首页"), "Về trang chủ");
});
test("nạp trong môi trường trình duyệt (vm)", async () => {
  const vm = await import("node:vm");
  const fs = await import("node:fs");
  const src = fs.readFileSync(new URL("../assets/js/i18n-vi.js", import.meta.url), "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(src, sandbox);
  assert.equal(sandbox.YYSD_I18N_VI.translateText("登录"), "Đăng nhập");
  const sandbox2 = {};
  vm.runInNewContext(src, sandbox2);
  assert.equal(sandbox2.YYSD_I18N_VI.translateText("注册"), "Đăng ký");
});
