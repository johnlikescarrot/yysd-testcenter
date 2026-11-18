"use strict";
var assert = require("assert");
var fs = require("fs");
var path = require("path");
var vm = require("vm");
var F = require("../assets/js/toefl-full.js");

// ngày cuốn danh sách không cứng rắn mã hóa: Server theo như library/toefl bốn khoa đầy đủ hết đẻ ra
var TIKU = require("../server/tiku.js");
var repo = path.join(__dirname, "..");
var diskMocks = TIKU.stockMocks(repo);
assert.ok(diskMocks.length >= 22, "date packs on disk: " + diskMocks.length);
assert.strictEqual(diskMocks.indexOf("2025-07-16") >= 0, true);
["reading", "listening", "writing", "speaking"].forEach(function (s) {
  assert.ok(fs.existsSync(path.join(repo, "library/toefl", diskMocks[0] + "-" + s + ".json")), "missing " + s);
});

// Thi thử toàn phần = bốn khoa cùng id đầy đủ hết đẻ ra bề ngoài, config.js dặm không hề sao ngày danh sách
global.window = global;
global.localStorage = { getItem: function () { return null; }, setItem: function () {}, removeItem: function () {} };
global.document = {
  addEventListener: function () {}, getElementById: function () { return null; },
  querySelector: function () { return null; }, querySelectorAll: function () { return []; }
};
require("../assets/js/config.js");
var Y = global.window.YYSD;
var full = Y.TOEFL_FULL;
assert.ok(full.length >= 22, "TOEFL_FULL derived: " + full.length);
assert.strictEqual(fs.readFileSync(path.join(__dirname, "../assets/js/config.js"), "utf8").indexOf('var TOEFL_FULL = ['), -1,
  "TOEFL_FULL phải do bốn khoa bề ngoài đẻ ra, không cho phép cứng rắn mã hóa ngày cuốn ");
full.forEach(function (p) {
  ["TOEFL_READING", "TOEFL_LISTENING", "TOEFL_WRITING", "TOEFL_SPEAKING"].forEach(function (L) {
    assert.ok(Y[L].some(function (x) { return x.id === p.id; }), p.id + " thiếu " + L);
  });
  assert.ok(/· Thi thử toàn phần $/.test(p.title), p.id + " tiêu đề: " + p.title);
  assert.ok(p.duration > 0, p.id + " không có lúc dài, tạp diện văn bản trên nút bấm sẽ thiếu con số ");
});

// một bình tạp phiến: thực chạy paint nhìn tuyển ra tới HTML
var mockSrc = fs.readFileSync(path.join(__dirname, "../app/assets/js/mock.js"), "utf8");
function mockSandbox(api) {
  var sb = { URLSearchParams: URLSearchParams, encodeURIComponent: encodeURIComponent, Promise: Promise, console: console };
  sb.window = sb;
  sb.YYSD = Y;
  sb.location = { pathname: "/app/mock.html", search: "", href: "" };
  sb.document = global.document;
  if (api) sb.YYSD_APP = { api: api };
  vm.runInNewContext(mockSrc, sb);
  return sb;
}
var host = { innerHTML: "", onclick: null };
mockSandbox().YYSD_HIT_MOCK.paint(host);
var html = host.innerHTML;
assert.strictEqual((html.match(/class="hit-mock-card"/g) || []).length, 10, " mỗi trang 10 tấm thẻ ");
assert.ok(html.indexOf(">TOEFL Mock 1<") >= 0, " tạp diện chỉ có TOEFL Mock đánh số ");
assert.ok(html.indexOf(" đề thi thật Thi thử · tự động cho điểm ") >= 0, " bộ đi theo wofo");
assert.strictEqual((html.match(/ chỉ khảo thi [Đọc Nghe Nói Viết]/g) || []).length, 40, " mỗi tạp bốn cách chỉ khảo thi X");
assert.strictEqual((html.match(/> toàn khoa Thi thử </g) || []).length, 10, " chính giữa một cách là toàn khoa Thi thử ");
assert.strictEqual((html.match(/kind=single/g) || []).length, 40, " Đơn kỹ năng cửa vào ");
assert.ok(/href="mock\.html\?kind=single&amp;id=2025-07-16&amp;skill=speaking"/.test(html), " Nói Đơn kỹ năng cửa vào ");
assert.ok(html.indexOf("kind=full&amp;id=2025-07-16") >= 0, " trọn bộ cửa vào ");
assert.ok(html.indexOf(" Thi trực tiếp ") < 0 && html.indexOf(" phút ") < 0, " tạp diện không hiện ra ngày và lúc dài ");
assert.ok(html.indexOf("hit-mock-pager") >= 0 && html.indexOf('data-page="3"') >= 0, " mỗi trang 10 bộ + dưới đáy điểm trang ");
assert.ok(html.indexOf("doorHTML") < 0 && html.indexOf(" trọn bộ bao ") < 0, " hai tầng lựa chọn bình đã hợp nhất ");
assert.strictEqual((html.match(/hit-mode-badge/g) || []).length, 0, " Không access lúc không cho Khóa chương ");

// lật giấy đi chân thật click handler
host.onclick({ target: { closest: function () { return { disabled: false, getAttribute: function () { return "3"; } }; } } });
assert.strictEqual((host.innerHTML.match(/class="hit-mock-card"/g) || []).length, full.length - 20, " trang cuối chỉ còn hai bộ ");
assert.ok(host.innerHTML.indexOf(">TOEFL Mock 21<") >= 0, " cố định cuốn số: trang thứ ba từ Mock 21 nảy sinh ");

// không kích hoạt: tờ nguyên tạp không phủ lên (Học viên chỉ nhìn đạt được chính mình đám kia)
var lockHost = { innerHTML: "", onclick: null };
mockSandbox(function (url) {
  return Promise.resolve(url.indexOf("access") >= 0? { access: { packages: {} } }: {});
}).YYSD_HIT_MOCK.paint(lockHost);
var locked = new Promise(function (r) { setTimeout(r, 5); }).then(function () {
  var h = lockHost.innerHTML;
  assert.strictEqual(h.indexOf('class="hit-mock-card"'), -1, " không kích hoạt cuốn không phủ lên ");
  assert.ok(h.indexOf("hit-empty") >= 0, " một bộ cũng không có kích hoạt lúc cho chỗ trống thái ");
});

// Giáo viên tổ cuốn nhập vào cùng một cái liền đem hộp: đánh số tiếp tại ngày cuốn về sau, cửa vào đi bank.html, chỉ phủ lên bộ này cuốn thật sự có khoa
var packHost = { innerHTML: "", onclick: null };
mockSandbox(function (url) {
  if (url.indexOf("catalog") >= 0) {
    return Promise.resolve({ catalog: { papers: [{ id: "pk-9", kind: "full", blocks: [{ skill: "reading" }, { skill: "speaking" }] }] } });
  }
  return Promise.resolve({ access: { staff: true } });
}).YYSD_HIT_MOCK.paint(packHost);
var mixed = new Promise(function (r) { setTimeout(r, 5); }).then(function () {
  packHost.onclick({ target: { closest: function () { return { disabled: false, getAttribute: function () { return "3"; } }; } } });
  var h = packHost.innerHTML;
  assert.ok(h.indexOf(">TOEFL Mock 23<") >= 0, " Giáo viên tổ cuốn tiếp tại ngày cuốn đánh số đằng sau ");
  assert.ok(h.indexOf("bank.html?id=pk-9") >= 0, " Giáo viên tổ cuốn nút bấm chính đi tổ khảo hạch trận ");
  assert.ok(h.indexOf("bank.html?id=pk-9&amp;skill=speaking") >= 0, " Giáo viên tổ cuốn Đơn kỹ năng cửa vào mang skill");
  var pkCard = h.split('class="hit-mock-card"').filter(function (x) { return x.indexOf("bank.html?id=pk-9") >= 0; })[0];
  assert.ok(pkCard, " Giáo viên tổ cuốn tạp phiến ");
  assert.strictEqual((pkCard.match(/ chỉ khảo thi /g) || []).length, 2, " bộ này cuốn chỉ có Đọc và Nói hai ô vuông ");
  assert.strictEqual(pkCard.indexOf(" chỉ khảo thi Nghe "), -1, " không có nghe lực cuốn không cho chỉ khảo thi Nghe ");
});

// Giáo viên tổ cuốn chỉ khảo thi một khoa: từ nên danh sách đậu một cái câu khối Bắt đầu, làm xong cái này một khoa liền Nộp bài
var trSrc = fs.readFileSync(path.join(__dirname, "../app/assets/js/tiku-run.js"), "utf8");
var store = {};
var jumps = [];
var trSb = {
  sessionStorage: {
    getItem: function (k) { return store[k] || null; },
    setItem: function (k, v) { store[k] = v; },
    removeItem: function (k) { delete store[k]; }
  },
  location: { pathname: "/app/bank.html", replace: function (u) { jumps.push(u); } },
  encodeURIComponent: encodeURIComponent
};
trSb.window = trSb;
vm.runInNewContext(trSrc, trSb);
var run = trSb.YYSD_TIKU_RUN.start({
  id: "pk-9", title: "t", kind: "mock",
  blocks: [{ skill: "reading" }, { skill: "reading" }, { skill: "listening" }],
  only: "listening"
});
assert.strictEqual(run.i, 2, " chỉ khảo thi Nghe: từ Nghe cái thứ nhất câu khối Bắt đầu ");
assert.strictEqual(trSb.YYSD_TIKU_RUN.advance("listening", null), true, " Nghe làm xong tiếp xúc chấm dứt ");
assert.ok(jumps[jumps.length - 1].indexOf("done=1") >= 0, " chấm dứt đi Nộp bài quay về nhảy ");

assert.strictEqual(F.mockHubHref("full"), "app/mock.html?kind=full");
assert.ok(F.skillHref("2025-07-04", "mock", "reading").indexOf("full=1") >= 0);
assert.ok(F.listBack("reading").indexOf("zone.html") >= 0);

var ngx = fs.readFileSync(path.join(__dirname, "../server/deploy/nginx-app.conf"), "utf8");
assert.ok(ngx.indexOf("try_files $uri @web_toefl") >= 0, "app set library must win before web dated papers");
assert.ok(ngx.indexOf("location @web_toefl") >= 0);
assert.ok(fs.readFileSync(path.join(__dirname, "../app/assets/js/toefl-speaking.js"), "utf8").indexOf("encodeURI(") >= 0);
assert.ok(fs.readFileSync(path.join(__dirname, "../toefl-listening.html"), "utf8").indexOf("clip.src = task.audio") >= 0,
  " Nghe âm tần do bài thi trang trực tiếp lấy đường nhỏ (810 đầu audio toàn bộ ASCII, không cần encodeURI) ");
var play = fs.readFileSync(path.join(__dirname, "../app/assets/js/play.js"), "utf8");
assert.ok(play.indexOf("showLoadError(") >= 0 && play.indexOf("Unable to load this set") >= 0, "load failure must surface a visible panel");

["reading", "listening", "writing", "speaking"].forEach(function (skill) {
  var page = fs.readFileSync(path.join(__dirname, "../app/" + skill + ".html"), "utf8");
  assert.ok(page.indexOf("toefl-" + skill + ".html?") >= 0, "app/" + skill + ".html chỉ làm nhảy chuyển, trường thi còn đang cây vực ");
});
assert.ok(/assets\/js\/play\.js\?v=/.test(fs.readFileSync(path.join(__dirname, "../app/review.html"), "utf8")),
  "play.js phải mang phiên bản số (xưa cũ trì hoãn tồn = dead Submit buttons) ");

// ma-két trang in: wofo thức song nhóm liền đem hộp + tròn giác tạp làn da; lui được cả hàng ngũ bề ngoài hoặc Thụy Sĩ góc vuông làn da tính trở về
var libCss = fs.readFileSync(path.join(__dirname, "../app/assets/css/hit.css"), "utf8");
assert.ok(/\.hit-mock-cards\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/.test(libCss),
  " chạy nước rút bao phải là song nhóm ô lưới ");
assert.ok(/\.hit-mock-skill\s*\{[^}]*repeat\(2,/.test(libCss), " Đơn kỹ năng cửa vào 2×2");
assert.ok(/\.hit-mock-card\s*\{[^}]*border-radius:\s*12px/.test(libCss), " tạp phiến tròn giác theo wofo");
assert.ok(/\.hit-mock-pager/.test(libCss), " điểm trang đầu có kiểu dáng ");

require("./check_toefl_paper").checkLive();
Promise.all([locked, mixed]).then(function () { console.log("ok toefl mock picker"); });
