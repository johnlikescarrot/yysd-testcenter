"use strict";
var assert = require("assert");
var fs = require("fs");
var path = require("path");
var vm = require("vm");
var F = require("../assets/js/toefl-full.js");

// ngày tháng cuộn lại danh sách mục không mã hóa cứng: phục vụ cuối nhấn library/toefl bốn ngành học đầy đủ sản xuất
var TIKU = require("../server/tiku.js");
var repo = path.join(__dirname, "..");
var diskMocks = TIKU.stockMocks(repo);
assert.ok(diskMocks.length >= 22, "date packs on disk: " + diskMocks.length);
assert.strictEqual(diskMocks.indexOf("2025-07-16") >= 0, true);
["reading", "listening", "writing", "speaking"].forEach(function (s) {
  assert.ok(fs.existsSync(path.join(repo, "library/toefl", diskMocks[0] + "-" + s + ".json")), "missing " + s);
});

// hoàn chỉnh bắt chước đánh = bốn ngành học giống id đầy đủ của sản xuất bề mặt bên ngoài, config.js biến thể của | không còn sao chép ngày tháng danh sách mục
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
  "TOEFL_FULL phải theo bốn ngành học bề mặt bên ngoài sản xuất, không cho phép mã hóa cứng ngày tháng cuộn lại ");
full.forEach(function (p) {
  ["TOEFL_READING", "TOEFL_LISTENING", "TOEFL_WRITING", "TOEFL_SPEAKING"].forEach(function (L) {
    assert.ok(Y[L].some(function (x) { return x.id === p.id; }), p.id + " sự thiếu " + L);
  });
  assert.ok(/· hoàn chỉnh bắt chước đánh$/.test(p.title), p.id + " tiêu đề: " + p.title);
  assert.ok(p.duration > 0, p.id + " không có thời lượng, dừng mặt nút bấm nội dung có thể sự thiếu chữ số ");
});

// một xem | thẻ: thật cào paint chăm sóc phủ màu đi ra của HTML
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
assert.strictEqual((html.match(/class="hit-mock-card"/g) || []).length, 10, " mỗi đầu 10 mở ra dừng ");
assert.ok(html.indexOf(">TOEFL Mock 1<") >= 0, " dừng mặt chỉ có TOEFL Mock đánh số ");
assert.ok(html.indexOf(" câu hỏi từ đề thi các năm trước bắt chước đánh · tự động chấm điểm ") >= 0, " thứ cấp hàng biến thể của wofo");
assert.strictEqual((html.match(/chỉ đánh[đọc thính giác lời nói thông thường viết]/g) || []).length, 40, " mỗi dừng bốn hình vuông chỉ đánh X");
assert.strictEqual((html.match(/>tất cả ngành học bắt chước đánh</g) || []).length, 10, " ở giữa một hình vuông là tất cả ngành học bắt chước đánh ");
assert.strictEqual((html.match(/kind=single/g) || []).length, 40, " hóa đơn ngành học lối vào ");
assert.ok(/href="mock\.html\?kind=single&amp;id=2025-07-16&amp;skill=speaking"/.test(html), " lời nói thông thường hóa đơn ngành học lối vào ");
assert.ok(html.indexOf("kind=full&amp;id=2025-07-16") >= 0, " toàn bộ bộ sưu tập lối vào ");
assert.ok(html.indexOf(" Trong nước · trực tiếp ") < 0 && html.indexOf(" phút ") < 0, " dừng mặt không xuất hiện ngày tháng biến thể cũ của thời lượng ");
assert.ok(html.indexOf("hit-mock-pager") >= 0 && html.indexOf('data-page="3"') >= 0, " mỗi đầu 10 Bộ + đáy chèn ngắt trang ");
assert.ok(html.indexOf("doorHTML") < 0 && html.indexOf(" toàn bộ bộ sưu tập che phủ ") < 0, " hai chồng lên nhau chọn xem | đã biến thể của | ");
assert.strictEqual((html.match(/hit-mode-badge/g) || []).length, 0, " không có access biến thể cũ của | không cho khóa chương ");

// lật đầu đi thật click handler
host.onclick({ target: { closest: function () { return { disabled: false, getAttribute: function () { return "3"; } }; } } });
assert.strictEqual((host.innerHTML.match(/class="hit-mock-card"/g) || []).length, full.length - 20, " trang cuối chỉ còn lại hai che đậy ");
assert.ok(host.innerHTML.indexOf(">TOEFL Mock 21<") >= 0, " cố định cuộn lại gầm: thu ba đầu biến thể của | Mock 21 dậy ");

// chưa mở: toàn bộ mở ra dừng không kết xuất(học sinh chỉ chăm sóc được bản thân biến thể của xác minh)
var lockHost = { innerHTML: "", onclick: null };
mockSandbox(function (url) {
  return Promise.resolve(url.indexOf("access") >= 0 ? { access: { packages: {} } } : {});
}).YYSD_HIT_MOCK.paint(lockHost);
var locked = new Promise(function (r) { setTimeout(r, 5); }).then(function () {
  var h = lockHost.innerHTML;
  assert.strictEqual(h.indexOf('class="hit-mock-card"'), -1, " chưa mở của cuộn lại không kết xuất ");
  assert.ok(h.indexOf("hit-empty") >= 0, " bộ tất cả chưa mở biến thể cũ của | cho trống không ");
});

// giáo viên hình thành cuộn lại sáp nhập vào giống hệt dùng trong | tiện lợi hộp nhỏ: đánh số nhận tồn tại ngày tháng cuộn lại sau, lối vào đi bank.html, chỉ kết xuất này che đậy cuộn lại thật một số ngành học
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
  assert.ok(h.indexOf(">TOEFL Mock 23<") >= 0, " giáo viên hình thành cuộn lại nhận tồn tại ngày tháng cuộn lại đánh số phía sau ");
  assert.ok(h.indexOf("bank.html?id=pk-9") >= 0, " giáo viên hình thành cuộn lại chủ nút bấm đi hình thành kiểm tra sân phơi ");
  assert.ok(h.indexOf("bank.html?id=pk-9&amp;skill=speaking") >= 0, " giáo viên hình thành cuộn lại hóa đơn ngành học lối vào dải skill");
  var pkCard = h.split('class="hit-mock-card"').filter(function (x) { return x.indexOf("bank.html?id=pk-9") >= 0; })[0];
  assert.ok(pkCard, " giáo viên hình thành cuộn lại thẻ ");
  assert.strictEqual((pkCard.match(/chỉ đánh/g) || []).length, 2, " này che đậy cuộn lại chỉ có đọc biến thể cũ của lời nói thông thường hai hình vuông ");
  assert.strictEqual(pkCard.indexOf(" chỉ đánh thính giác "), -1, " không có thính giác của cuộn lại không cho chỉ đánh thính giác ");
});

// giáo viên hình thành cuộn lại chỉ đánh một ngành học: biến thể của | nên ngành học đầu tiên dùng trong | chủ đề cục bắt đầu, hoàn thành này một ngành học trong trường hợp đó nộp bài thi
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
assert.strictEqual(run.i, 2, " chỉ đánh thính giác: biến thể của | thính giác đầu tiên dùng trong | chủ đề cục bắt đầu ");
assert.strictEqual(trSb.YYSD_TIKU_RUN.advance("listening", null), true, " thính giác hoàn thành tức là chấm dứt ");
assert.ok(jumps[jumps.length - 1].indexOf("done=1") >= 0, " chấm dứt đi nộp bài thi xoay vòng nhảy ");

assert.strictEqual(F.mockHubHref("full"), "app/mock.html?kind=full");
assert.ok(F.skillHref("2025-07-04", "mock", "reading").indexOf("full=1") >= 0);
assert.ok(F.listBack("reading").indexOf("zone.html") >= 0);

var ngx = fs.readFileSync(path.join(__dirname, "../server/deploy/nginx-app.conf"), "utf8");
assert.ok(ngx.indexOf("try_files $uri @web_toefl") >= 0, "app set library must win before web dated papers");
assert.ok(ngx.indexOf("location @web_toefl") >= 0);
assert.ok(fs.readFileSync(path.join(__dirname, "../app/assets/js/toefl-speaking.js"), "utf8").indexOf("encodeURI(") >= 0);
assert.ok(fs.readFileSync(path.join(__dirname, "../toefl-listening.html"), "utf8").indexOf("clip.src = task.audio") >= 0,
  " thính giác âm thanh theo giấy thi đầu trực tiếp lấy con đường(810 dải audio tất cả ASCII, không cần thiết encodeURI)");
var play = fs.readFileSync(path.join(__dirname, "../app/assets/js/play.js"), "utf8");
assert.ok(play.indexOf("showLoadError(") >= 0 && play.indexOf("Unable to load this set") >= 0, "load failure must surface a visible panel");

["reading", "listening", "writing", "speaking"].forEach(function (skill) {
  var page = fs.readFileSync(path.join(__dirname, "../app/" + skill + ".html"), "utf8");
  assert.ok(page.indexOf("toefl-" + skill + ".html?") >= 0, "app/" + skill + ".html chỉ làm nhảy đến, phòng thi vẫn tồn tại rễ lĩnh vực ");
});
assert.ok(/assets\/js\/play\.js\?v=/.test(fs.readFileSync(path.join(__dirname, "../app/review.html"), "utf8")),
  "play.js phải dải phiên bản gầm(cũ bộ nhớ đệm = dead Submit buttons)");

// định dạng: wofo loại hai sắp xếp tiện lợi hộp nhỏ + góc bo tròn dừng da; rút lui thành công toàn bộ đội hình bề mặt bên ngoài có thể Thụy Sĩ một góc vuông da coi như trở về
var libCss = fs.readFileSync(path.join(__dirname, "../app/assets/css/hit.css"), "utf8");
assert.ok(/\.hit-mock-cards\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/.test(libCss),
  " chạy nước rút che phủ phải là hai sắp xếp lưới ");
assert.ok(/\.hit-mock-skill\s*\{[^}]*repeat\(2,/.test(libCss), " hóa đơn ngành học lối vào 2×2");
assert.ok(/\.hit-mock-card\s*\{[^}]*border-radius:\s*12px/.test(libCss), " thẻ góc bo tròn biến thể của wofo");
assert.ok(/\.hit-mock-pager/.test(libCss), " chèn ngắt trang dải có loại ");

require("./check_toefl_paper").checkLive();
Promise.all([locked, mixed]).then(function () { console.log("ok toefl mock picker"); });
