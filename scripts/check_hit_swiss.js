#!/usr/bin/env node
"use strict";
// câu hỏi từ đề thi các năm trước ngân hàng câu hỏi một xem | danh sách động cơ: liên kết hình dạng, tốc độ tiến triển phán đoán, lọc, định dạng chọn, XSS nghĩa chuyển, hóa đơn tiếp theo phân tích
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ROOT = path.resolve(__dirname, "..");
const sourcePath = path.join(ROOT, "app/assets/js/hit-shell.js");
const source = fs.readFileSync(sourcePath, "utf8");
const exportMarker = "  w.YYSD_HIT = {";
assert.equal(source.split(exportMarker).length, 2, "unique VM injection point");
const storage = {};
let reads = 0;
const window = {
  localStorage: {
    getItem: key => { reads++; return storage[key] || null; },
    setItem: (key, value) => { storage[key] = String(value); }
  },
  URLSearchParams: URLSearchParams
};
const ctx = { window, URLSearchParams };
// tốc độ tiến triển phím của thật nguồn: trước cào toefl-lab.js, lại sử dụng nó cho hit-shell.js
vm.runInNewContext(fs.readFileSync(path.join(ROOT, "assets/js/toefl-lab.js"), "utf8"), ctx,
  { filename: "assets/js/toefl-lab.js", timeout: 1000 });
assert.ok(window.YYSD_TOEFL_LAB, "item-state store loaded");
vm.runInNewContext(source.replace(exportMarker,
  "  w.__lib = { cardHTML: cardHTML, rowHTML: rowHTML, panelHTML: panelHTML, itemHref: itemHref," +
  " libSearchHTML: libSearchHTML, cat: libCatalog," +
  " libStateOf: libStateOf, doneInSpan: doneInSpan, libView: libView, LIB: LIB };\n" + exportMarker),
  ctx, { filename: sourcePath, timeout: 1000 });
const { cardHTML, rowHTML, panelHTML, itemHref, libSearchHTML, cat, libStateOf, doneInSpan, libView, LIB } = window.__lib;
const hit = window.YYSD_HIT;

function params(href, skill) {
  const url = new URL(href, "https://example.test/app/");
  assert.equal(url.pathname, "/app/" + skill + ".html");
  return Object.fromEntries(url.searchParams);
}
assert.equal(itemHref("reading", "bank-rap", 4, 4), "reading.html?id=bank-rap&mode=practice&task=4");
assert.equal(params(itemHref("listening", "bank-cr", 7, 12), "listening").taskEnd, "12");
assert.deepEqual(params(itemHref("writing", 'b"a&nk', 0, 9), "writing"),
  { id: 'b"a&nk', mode: "practice", task: "0", taskEnd: "9" });

const card = { type: "academic", paperId: "bank-rap", code: "R-RAP1", sort: 3, task: 2, end: 2, n: 5, title: "Tigers", zh: " hổ " };
const row = { type: "conversation", paperId: "bank-lcn", code: "L-CV1", task: 0, end: 2, n: 6,
  cells: [{ task: 0, end: 0, label: "C01" }, { task: 1, end: 1, label: "C02" }, { task: 2, end: 2, label: "C03" }] };
const meta = { type: "academic", en: "Academic Passage", head: "Read an Academic Passage", zh: " học thuật bài viết ", idx: "set" };
const dailyMeta = { type: "daily_life", en: "Read in Daily Life", zh: " sống đọc ", idx: "set", count: 1 };
const rowMeta = { type: "conversation", en: "Conversation", zh: " Hội thoại ", idx: "set", prog: 1 };
const speakingMeta = LIB.speaking[0];

// tốc độ tiến triển: nhấn task..end tất cả coi như khả năng coi như đã hoàn thành, vượt qua biên giới không xâu lại ngành học
assert.equal(doneInSpan("reading", card.paperId, card.task, card.end, {}), 0);
assert.equal(libStateOf("reading", card, {}).cls, "todo");
const one = {};
one["reading|bank-rap|2"] = { at: 1 };
assert.equal(libStateOf("reading", Object.assign({}, card, { end: 4 }), one).cls, "mid");
assert.equal(libStateOf("reading", card, one).cls, "done");
assert.equal(libStateOf("listening", card, one).cls, "todo", "same task number, other skill");

// dừng mặt biến thể của nó: số thứ tự + tiêu đề + tình trạng; đọc không làm cho thấy chủ đề đếm cũng không làm cho thấy ngôn ngữ Trung Quốc hàng
const c0 = cardHTML("reading", meta, card, 0, {});
assert.match(c0, /hit-lib-card is-todo/);
assert.ok(c0.includes(" chưa bắt đầu ") && c0.includes("<span class=\"hit-lib-idx\">Set 3</span>"), "idx lấy dữ liệu biến thể của | của đánh số, không phải kết xuất vị trí ");
assert.doesNotMatch(c0, /hit-lib-n|hit-lib-sub|Câu hỏi|hổ/, " đọc dừng chỉ tiếng Anh tiêu đề, không có tiêu đề đếm không có ngôn ngữ Trung Quốc hàng ");
assert.ok(c0.includes('href="reading.html?id=bank-rap&mode=practice&task=2"'), "card link");
assert.equal(cardHTML("reading", meta, card, 41, {}).includes("Set 3"), true, "filtered position must not renumber");
assert.ok(cardHTML("reading", dailyMeta, Object.assign({}, card, { n: 2 }), 0, {}).includes('<span class="hit-lib-n" lang="en">2 questions</span>'));
assert.ok(cardHTML("reading", dailyMeta, Object.assign({}, card, { n: 1 }), 0, {}).includes("1 question<"));
const s0 = cardHTML("speaking", speakingMeta, { type: "repeat", paperId: "bank-lr", code: "S-LRP7", sort: 7, task: 0, end: 6, n: 7, title: "Gym", zh: " Nghe và đọc lại " }, 0, {});
assert.ok(s0.includes('<span class="hit-lib-idx">#7</span>') && s0.includes('lang="en">Gym</h3>') && s0.includes('<p class="hit-lib-sub">Nghe và đọc lại</p>'), " Nói #N + tiếng Anh tiêu đề + thu ba hàng chủ đề khuôn ngôn ngữ Trung Quốc tên ");
assert.ok(cardHTML("speaking", speakingMeta, { type: "repeat", paperId: "bank-lr", sort: 7, task: 0, end: 0, n: 1, title: "" }, 0, {}).includes("Listen and Repeat"), " sự thiếu tiêu đề cung cấp mạng lưới an toàn sử dụng chủ đề khuôn tiếng Anh tên ");

const r0 = rowHTML("listening", rowMeta, row, 3, one);
assert.match(r0, /hit-lib-row is-todo/);
assert.ok(r0.includes(" Hoàn thành 0/3") && r0.includes("Set 4"));
assert.doesNotMatch(r0, /hit-lib-title/, " hàng loại không làm cho thấy tiêu đề ");
assert.equal((r0.match(/hit-lib-num\b/g) || []).length, 3, "one cell per question");
assert.ok(r0.includes('class="hit-lib-start"') && r0.includes(">Bắt đầu làm bài</a>"), " toàn bộ bộ sưu tập lối vào tồn tại che đậy chủ đề hàng bên phải ");
assert.ok(r0.includes('href="listening.html?id=bank-lcn&mode=practice&task=0&taskEnd=2"'), " bắt đầu làm chủ đề che phủ task..end, không phải hóa đơn chủ đề ");
const rDone = rowHTML("listening", rowMeta, row, 0, {
  "listening|bank-lcn|0": { at: 1 }, "listening|bank-lcn|1": { at: 1 }, "listening|bank-lcn|2": { at: 1 } });
assert.match(rDone, /hit-lib-row is-done/);
assert.ok(rDone.includes(" Hoàn thành 3/3"));
// viết hình thành biến thể của hàng làm cho thấy tình trạng và không phải hoàn thành đếm(biến thể của nó)
const bsMeta = { type: "sentence", en: "Build a Sentence", zh: " Xây dựng câu ", idx: "set" };
assert.ok(rowHTML("writing", bsMeta, { type: "sentence", paperId: "bank-bs", sort: 1, task: 0, end: 1,
  cells: [{ task: 0, end: 0, label: "1" }, { task: 1, end: 1, label: "2" }] }, 0, one).includes(" chưa bắt đầu "));

// lọc: todo loại bỏ đã hoàn thành; tần số cao nút bấm chỉ tồn tại nên chủ đề khuôn thật có tá đánh dấu biến thể cũ của | xuất hiện; định dạng theo dữ liệu cố định(cells → hàng loại)
libView.filter = "all";
const all = panelHTML("reading", meta, [card, Object.assign({}, card, { code: "R-RAP4", sort: 4, task: 3, end: 3 })], {});
assert.match(all, /hit-lib-grid/, "cards without cells");
assert.ok(all.includes('<h2 lang="en">Read an Academic Passage</h2>'), " bảng điều khiển tiêu đề sử dụng nó của head nội dung ");
assert.doesNotMatch(all, /hình thành · Tổng cộng|đã cái sàng đi ra|tần số cao/, " không có thống kê hàng, cũng chưa tá đánh dấu biến thể cũ của | không cho tần số cao nút bấm ");
assert.match(panelHTML("listening", rowMeta, [row], {}), /hit-lib-rows/, "rows with cells");
assert.match(panelHTML("reading", meta, [Object.assign({}, card, { hot: 2 })], {}), /tần số cao/);
libView.filter = "hot";
assert.match(panelHTML("reading", meta, [card], one), /này lọc xuống không có chủ đề/);
libView.filter = "todo";
assert.equal(panelHTML("reading", meta, [Object.assign({}, card, { end: 2 })], one).includes("is-todo"), false, "todo che giấu đã hoàn thành ");
libView.filter = "all";

// Tìm kiếm: bước qua nên môn học toàn bộ chủ đề khuôn, tiếng Anh tiêu đề / ngôn ngữ Trung Quốc tiêu đề / chủ đề gầm tất cả có thể bắn trúng, và biến thể của | lọc chồng lên
cat.reading = [card, Object.assign({}, card, { code: "R-RAP4", sort: 4, task: 3, end: 3, title: " Hollywood thời đại hoàng kim " }),
  { type: "complete_words", paperId: "bank-cw", code: "R-CW9", sort: 9, task: 40, end: 41, n: 2, title: "Career Fair" }];
cat.listening = [row];
const sEn = libSearchHTML("reading", "tigers", {});
assert.match(sEn, /hit-lib-searchtype/, " bắn trúng kết trái nhấn chủ đề khuôn phân đoạn ");
assert.equal((sEn.match(/hit-lib-card/g) || []).length, 1, " chỉ kết xuất bắn trúng của biến thể của hình thành ");
assert.ok(sEn.includes(" bắn trúng 1 hình thành ") && sEn.includes('href="reading.html?id=bank-rap&mode=practice&task=2"'), " tiếng Anh tiêu đề bắn trúng ");
assert.doesNotMatch(sEn, /tần số cao|hình thành · Tổng cộng/, " tìm kiếm đầu không cho thống kê hàng, cũng chưa tá đánh dấu biến thể cũ của | không cho tần số cao ");
assert.ok(libSearchHTML("reading", " Hollywood ", {}).includes("Set 4"), " ngôn ngữ Trung Quốc tiêu đề cũng bắn trúng, số thứ tự vẫn lấy mục lục sort");
assert.ok(libSearchHTML("reading", "r-cw9", {}).includes("Career Fair"), " chủ đề gầm cũng bắn trúng ");
const sRow = libSearchHTML("listening", "l-cv1", {});
assert.match(sRow, /hit-lib-rows/, " hàng loại chủ đề khuôn bắn trúng hoàng hậu vẫn là hàng loại ");
assert.ok(sRow.includes("C02"), " chủ đề gầm hình vuông kết xuất ");
libView.filter = "todo";
const sDone = libSearchHTML("reading", "r-rap1", one);
assert.ok(sDone.includes(" bắn trúng 0 hình thành ") && sDone.includes("data-clear"), " chưa làm lọc biến thể của | tồn tại tìm kiếm dùng trong |, trống không kết trái cho dọn dẹp nút bấm ");
libView.filter = "all";
const sNone = libSearchHTML("reading", "  <b>zz ", {});
assert.ok(sNone.includes(" ngân hàng câu hỏi biến thể của | không có«&lt;b&gt;zz»") && sNone.includes(" Tìm kiếm«&lt;b&gt;zz»"), " từ khóa xoay vòng làm cho thấy cũng nghĩa chuyển ");
assert.doesNotMatch(sNone, /«<b>/, " từ khóa biến thể của | của nhãn không có khả năng rò rỉ trở thành sự thật DOM");
cat.reading = []; cat.listening = [];

// XSS: tiêu đề, ngôn ngữ Trung Quốc hàng, cells nhãn, tần số cao ngọn lửa toàn bộ nghĩa chuyển
const hostile = { type: "x", paperId: 'p"><svg>', task: 0, end: 0, n: 1, title: '<img src=x onerror="boom">&', hot: 1 };
const hostileCard = Object.assign({}, hostile, { zh: '<b>trong</b>' });
const html = cardHTML("reading", { type: "x", en: '<i>E</i>', zh: '<b>trong</b>', idx: "set" }, hostile, 0, {}) +
  cardHTML("speaking", speakingMeta, hostileCard, 0, {}) +
  rowHTML("reading", { type: "x", en: "x", zh: '<b>trong</b>', idx: "set" },
    { type: "x", paperId: "ok", task: 0, end: 0, n: 1, title: "<script>bad</script>", cells: [{ task: 0, end: 0, label: '"><svg>' }] }, 0, {});
assert.ok(html.includes("&lt;img src=x onerror=&quot;boom&quot;&gt;&amp;"));
assert.ok(html.includes("<p class=\"hit-lib-sub\">&lt;b&gt;trong&lt;/b&gt;</p>"), " ngôn ngữ Trung Quốc hàng cũng nghĩa chuyển ");
assert.ok(html.includes('title="&quot;&gt;&lt;svg&gt;"'));
assert.doesNotMatch(html, /<(?:img|svg|b|i|script)>/);
assert.ok(html.includes('role="img" title=" tần số cao chủ đề ">🔥</span>'), "hot chip đảng một lửa ");
assert.doesNotMatch(html, /Bắt đầu làm bài/, " chỉ có bước qua nhiều chủ đề của che đậy khả năng cho toàn bộ bộ sưu tập lối vào ");
assert.ok(cardHTML("reading", meta, Object.assign({}, hostile, { hot: 3 }), 0, {}).includes('title=" vượt quá tần số cao chủ đề ">🔥🔥</span>'), " hai cấp tần số cao ");

// đầu tiên bảng điều khiển chỉ phân tích một lần biểu đồ tiến độ
storage["yysd:toefl-item-state"] = JSON.stringify(Object.fromEntries(
  Array.from({ length: 1000 }, (_, i) => ["reading|bank-x|" + i, { at: 1 }])));
const catalog = Array.from({ length: 60 }, (_, i) => ({ type: "academic", paperId: "bank-x", code: "X" + i, task: i, end: i, n: 1, title: "X" + i }));
reads = 0;
panelHTML("reading", meta, catalog, hit.doneMap());
assert.equal(reads, 1, "one completion-record parse per paint");

// bốn ngành học chủ đề khuôn bề mặt bên ngoài biến thể của | mục lục biến thể của | của type phải đúng được dùng trong |, nếu không thì segmented điểm hoàn thành là trống không của
const catDir = path.join(ROOT, "app/library/toefl");
Object.keys(LIB).forEach(skill => {
  const groups = JSON.parse(fs.readFileSync(path.join(catDir, "bank-catalog-" + skill + ".json"), "utf8")).groups;
  const declared = LIB[skill].map(m => m.type);
  const actual = Array.from(new Set(groups.map(g => g.type))).sort();
  assert.equal(declared.slice().sort().join(","), actual.join(","), skill + " chủ đề khuôn bề mặt bên ngoài = mục lục type");
  declared.forEach(t => assert.ok(groups.some(g => g.type === t), skill + "/" + t + " có chủ đề "));
  if (skill !== "listening") groups.forEach(g => {
    assert.ok(g.sort > 0, skill + "/" + g.type + " có trật tự gầm, dừng mặt không thể dựa vào kết xuất vị trí ");
    assert.ok(!g.cells || g.cells.length > 1, skill + "/" + g.type + " hàng loại nhất định là nhiều chủ đề hình thành ");
    if (!g.cells) assert.ok(g.title && g.title !== LIB[skill].find(m => m.type === g.type).en, skill + "/" + g.type + " dừng mặt có thật tiêu đề(không phải chủ đề khuôn tên)");
    // chỉ có vẽ thu ba hàng của chủ đề khuôn, mục lục zh khả năng là chủ đề khuôn tên; Đọc hiểu/thính giác của zh là bài viết ngôn ngữ Trung Quốc tiêu đề, không tham gia so sánh
    if (g.zh && LIB[skill].find(m => m.type === g.type).sub) assert.equal(g.zh, LIB[skill].find(m => m.type === g.type).zh, skill + "/" + g.type + " dừng mặt ngôn ngữ Trung Quốc hàng = segmented nhãn, giống hệt xem | không thể hai dùng trong | tên ");
  });
});
console.log("ok hit-lib-check: links/span-state/filters/search/layout/escaping/one-parse; 4 skills match bank-catalog");
