#!/usr/bin/env node
"use strict";
// đề thi thật Ngân hàng đề một bình liệt biểu List động cơ: kết nối hình thái, Tiến độ phán định, bộ lọc, ma-két trang in lựa chọn, XSS chuyển nghĩa, đơn lần Giải thích đáp án
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ROOT = path.resolve(__dirname, "..");
const sourcePath = path.join(ROOT, "app/assets/js/hit-shell.js");
const source = fs.readFileSync(sourcePath, "utf8");
const exportMarker = " w.YYSD_HIT = {";
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
// Tiến độ khóa chân thật nơi phát ra: chạy trước toefl-lab.js, lại dùng nó cho hit-shell.js
vm.runInNewContext(fs.readFileSync(path.join(ROOT, "assets/js/toefl-lab.js"), "utf8"), ctx,
  { filename: "assets/js/toefl-lab.js", timeout: 1000 });
assert.ok(window.YYSD_TOEFL_LAB, "item-state store loaded");
vm.runInNewContext(source.replace(exportMarker,
  " w.__lib = { cardHTML: cardHTML, rowHTML: rowHTML, panelHTML: panelHTML, itemHref: itemHref," +
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
const meta = { type: "academic", en: "Academic Passage", head: "Read an Academic Passage", zh: " Học thuật văn chương ", idx: "set" };
const dailyMeta = { type: "daily_life", en: "Read in Daily Life", zh: " sinh hoạt Đọc ", idx: "set", count: 1 };
const rowMeta = { type: "conversation", en: "Conversation", zh: " đối thoại ", idx: "set", prog: 1 };
const speakingMeta = LIB.speaking[0];

// Tiến độ: theo như task..end toàn bộ tính mới tính Đã hoàn thành, vượt giới không chuỗi khoa
assert.equal(doneInSpan("reading", card.paperId, card.task, card.end, {}), 0);
assert.equal(libStateOf("reading", card, {}).cls, "todo");
const one = {};
one["reading|bank-rap|2"] = { at: 1 };
assert.equal(libStateOf("reading", Object.assign({}, card, { end: 4 }), one).cls, "mid");
assert.equal(libStateOf("reading", card, one).cls, "done");
assert.equal(libStateOf("listening", card, one).cls, "todo", "same task number, other skill");

// tạp diện theo nó: tự số + tiêu đề + Trạng thái; Đọc không hiện câu mấy cũng không lộ ra Tiếng Việt đi
const c0 = cardHTML("reading", meta, card, 0, {});
assert.match(c0, /hit-lib-card is-todo/);
assert.ok(c0.includes(" Chưa bắt đầu ") && c0.includes("<span class=\"hit-lib-idx\">Set 3</span>"), "idx lấy số liệu bên trong đánh số, không phải phủ lên vị lần ");
assert.doesNotMatch(c0, /hit-lib-n|hit-lib-sub| câu | hổ /, " Đọc tạp chỉ Tiếng Anh tiêu đề, vô đề mấy Không Tiếng Việt đi ");
assert.ok(c0.includes('href="reading.html?id=bank-rap&mode=practice&task=2"'), "card link");
assert.equal(cardHTML("reading", meta, card, 41, {}).includes("Set 3"), true, "filtered position must not renumber");
assert.ok(cardHTML("reading", dailyMeta, Object.assign({}, card, { n: 2 }), 0, {}).includes('<span class="hit-lib-n" lang="en">2 questions</span>'));
assert.ok(cardHTML("reading", dailyMeta, Object.assign({}, card, { n: 1 }), 0, {}).includes("1 question<"));
const s0 = cardHTML("speaking", speakingMeta, { type: "repeat", paperId: "bank-lr", code: "S-LRP7", sort: 7, task: 0, end: 6, n: 7, title: "Gym", zh: " nghe xong Đọc nhại " }, 0, {});
assert.ok(s0.includes('<span class="hit-lib-idx">#7</span>') && s0.includes('lang="en">Gym</h3>') && s0.includes('<p class="hit-lib-sub"> nghe xong Đọc nhại </p>'), " Nói #N + Tiếng Anh tiêu đề + thứ ba đi dạng bài tên tiếng Trung ");
assert.ok(cardHTML("speaking", speakingMeta, { type: "repeat", paperId: "bank-lr", sort: 7, task: 0, end: 0, n: 1, title: "" }, 0, {}).includes("Listen and Repeat"), " thiếu tiêu đề lật tẩy dùng dạng bài Tiếng Anh tên ");

const r0 = rowHTML("listening", rowMeta, row, 3, one);
assert.match(r0, /hit-lib-row is-todo/);
assert.ok(r0.includes(" hoàn thành 0/3") && r0.includes("Set 4"));
assert.doesNotMatch(r0, /hit-lib-title/, " đi thức không hiện tiêu đề ");
assert.equal((r0.match(/hit-lib-num\b/g) || []).length, 3, "one cell per question");
assert.ok(r0.includes('class="hit-lib-start"') && r0.includes("> Bắt đầu làm bài </a>"), " trọn bộ cửa vào đang bẫy câu đi phía bên phải ");
assert.ok(r0.includes('href="listening.html?id=bank-lcn&mode=practice&task=0&taskEnd=2"'), " Bắt đầu làm bài bao trùm task..end, không phải đơn câu ");
const rDone = rowHTML("listening", rowMeta, row, 0, {
  "listening|bank-lcn|0": { at: 1 }, "listening|bank-lcn|1": { at: 1 }, "listening|bank-lcn|2": { at: 1 } });
assert.match(rDone, /hit-lib-row is-done/);
assert.ok(rDone.includes(" hoàn thành 3/3"));
// Viết Sắp xếp câu đi lộ ra Trạng thái mà không phải hoàn thành mấy (theo nó)
const bsMeta = { type: "sentence", en: "Build a Sentence", zh: " câu xây dựng ", idx: "set" };
assert.ok(rowHTML("writing", bsMeta, { type: "sentence", paperId: "bank-bs", sort: 1, task: 0, end: 1,
  cells: [{ task: 0, end: 0, label: "1" }, { task: 1, end: 1, label: "2" }] }, 0, one).includes(" Chưa bắt đầu "));

// bộ lọc: todo xóa Đã hoàn thành; nút bấm thường dùng chỉ ở nên dạng bài thật sự có đánh nhãn hiệu lúc xuất hiện; ma-két trang in do số liệu định (cells → đi thức)
libView.filter = "all";
const all = panelHTML("reading", meta, [card, Object.assign({}, card, { code: "R-RAP4", sort: 4, task: 3, end: 3 })], {});
assert.match(all, /hit-lib-grid/, "cards without cells");
assert.ok(all.includes('<h2 lang="en">Read an Academic Passage</h2>'), " mặt bản tiêu đề dùng của nó head văn án ");
assert.doesNotMatch(all, / tổ · tổng | đã si ra | Tần suất cao /, " không có công tác thống kê đi, cũng không còn đánh nhãn hiệu lúc không cho nút bấm thường dùng ");
assert.match(panelHTML("listening", rowMeta, [row], {}), /hit-lib-rows/, "rows with cells");
assert.match(panelHTML("reading", meta, [Object.assign({}, card, { hot: 2 })], {}), / Tần suất cao /);
libView.filter = "hot";
assert.match(panelHTML("reading", meta, [card], one), / này bộ lọc hạ không có đề mục /);
libView.filter = "todo";
assert.equal(panelHTML("reading", meta, [Object.assign({}, card, { end: 2 })], one).includes("is-todo"), false, "todo che giấu Đã hoàn thành ");
libView.filter = "all";

// tìm kiếm: vượt qua nên kỹ năng Tất cả dạng bài, Tiếng Anh tiêu đề / Tiếng Việt tiêu đề / câu số đều có thể trúng mục tiêu, lại cùng bộ lọc chồng lên
cat.reading = [card, Object.assign({}, card, { code: "R-RAP4", sort: 4, task: 3, end: 3, title: " Hollywood thời đại hoàng kim " }),
  { type: "complete_words", paperId: "bank-cw", code: "R-CW9", sort: 9, task: 40, end: 41, n: 2, title: "Career Fair" }];
cat.listening = [row];
const sEn = libSearchHTML("reading", "tigers", {});
assert.match(sEn, /hit-lib-searchtype/, " trúng mục tiêu kết quả theo như dạng bài phân khúc ");
assert.equal((sEn.match(/hit-lib-card/g) || []).length, 1, " chỉ phủ lên trúng mục tiêu cái kia tổ ");
assert.ok(sEn.includes(" trúng mục tiêu 1 tổ ") && sEn.includes('href="reading.html?id=bank-rap&mode=practice&task=2"'), " Tiếng Anh tiêu đề trúng mục tiêu ");
assert.doesNotMatch(sEn, / Tần suất cao | tổ · tổng /, " tìm kiếm đầu không cho công tác thống kê đi, cũng không còn đánh nhãn hiệu lúc không cho Tần suất cao ");
assert.ok(libSearchHTML("reading", " Hollywood ", {}).includes("Set 4"), " Tiếng Việt tiêu đề cũng trúng mục tiêu, tự số nhưng lấy mục lục sort");
assert.ok(libSearchHTML("reading", "r-cw9", {}).includes("Career Fair"), " câu số cũng trúng mục tiêu ");
const sRow = libSearchHTML("listening", "l-cv1", {});
assert.match(sRow, /hit-lib-rows/, " đi thức dạng bài trúng mục tiêu sau vẫn là đi thức ");
assert.ok(sRow.includes("C02"), " câu số cách phủ lên ");
libView.filter = "todo";
const sDone = libSearchHTML("reading", "r-rap1", one);
assert.ok(sDone.includes(" trúng mục tiêu 0 tổ ") && sDone.includes("data-clear"), " không làm bộ lọc xếp ở tìm kiếm bên trên, chỗ trống kết quả cho nút xóa trống ");
libView.filter = "all";
const sNone = libSearchHTML("reading", " <b>zz ", {});
assert.ok(sNone.includes(" Ngân hàng đề dặm không có «&lt;b&gt;zz»") && sNone.includes(" tìm kiếm «&lt;b&gt;zz»"), " từ khóa quay về lộ ra cũng chuyển nghĩa ");
assert.doesNotMatch(sNone, /«<b>/, " từ khóa bên trong nhãn hiệu sẽ không rò trở thành sự thật DOM");
cat.reading = []; cat.listening = [];

// XSS: tiêu đề, Tiếng Việt đi, cells nhãn hiệu, Tần suất cao ngọn lửa Tất cả chuyển nghĩa
const hostile = { type: "x", paperId: 'p"><svg>', task: 0, end: 0, n: 1, title: '<img src=x onerror="boom">&', hot: 1 };
const hostileCard = Object.assign({}, hostile, { zh: '<b> Vừa </b>' });
const html = cardHTML("reading", { type: "x", en: '<i>E</i>', zh: '<b> Vừa </b>', idx: "set" }, hostile, 0, {}) +
  cardHTML("speaking", speakingMeta, hostileCard, 0, {}) +
  rowHTML("reading", { type: "x", en: "x", zh: '<b> Vừa </b>', idx: "set" },
    { type: "x", paperId: "ok", task: 0, end: 0, n: 1, title: "<script>bad</script>", cells: [{ task: 0, end: 0, label: '"><svg>' }] }, 0, {});
assert.ok(html.includes("&lt;img src=x onerror=&quot;boom&quot;&gt;&amp;"));
assert.ok(html.includes("<p class=\"hit-lib-sub\">&lt;b&gt; Vừa &lt;/b&gt;</p>"), " Tiếng Việt đi cũng chuyển nghĩa ");
assert.ok(html.includes('title="&quot;&gt;&lt;svg&gt;"'));
assert.doesNotMatch(html, /<(?:img|svg|b|i|script)>/);
assert.ok(html.includes('role="img" title=" Tần suất cao câu ">🔥</span>'), "hot chip một nhóm nổi giận ");
assert.doesNotMatch(html, / Bắt đầu làm bài /, " chỉ có vượt qua nhiều đề bộ mới cho trọn bộ cửa vào ");
assert.ok(cardHTML("reading", meta, Object.assign({}, hostile, { hot: 3 }), 0, {}).includes('title=" siêu cao tần câu ">🔥🔥</span>'), " hai cấp Tần suất cao ");

// một lần mặt bản chỉ Giải thích đáp án một lần Tiến độ bề ngoài
storage["yysd:toefl-item-state"] = JSON.stringify(Object.fromEntries(
  Array.from({ length: 1000 }, (_, i) => ["reading|bank-x|" + i, { at: 1 }])));
const catalog = Array.from({ length: 60 }, (_, i) => ({ type: "academic", paperId: "bank-x", code: "X" + i, task: i, end: i, n: 1, title: "X" + i }));
reads = 0;
panelHTML("reading", meta, catalog, hit.doneMap());
assert.equal(reads, 1, "one completion-record parse per paint");

// bốn khoa dạng bài bề ngoài và trong mục lục type phải đối được, nếu không segmented điểm là trống không
const catDir = path.join(ROOT, "app/library/toefl");
Object.keys(LIB).forEach(skill => {
  const groups = JSON.parse(fs.readFileSync(path.join(catDir, "bank-catalog-" + skill + ".json"), "utf8")).groups;
  const declared = LIB[skill].map(m => m.type);
  const actual = Array.from(new Set(groups.map(g => g.type))).sort();
  assert.equal(declared.slice().sort().join(","), actual.join(","), skill + " dạng bài bề ngoài = mục lục type");
  declared.forEach(t => assert.ok(groups.some(g => g.type === t), skill + "/" + t + " có câu "));
  if (skill!== "listening") groups.forEach(g => {
    assert.ok(g.sort > 0, skill + "/" + g.type + " tự động số, tạp diện không thể dựa vào phủ lên vị lần ");
    assert.ok(!g.cells || g.cells.length > 1, skill + "/" + g.type + " đi thức hẳn là nhiều câu tổ ");
    if (!g.cells) assert.ok(g.title && g.title!== LIB[skill].find(m => m.type === g.type).en, skill + "/" + g.type + " tạp diện có thực tiêu đề (không phải dạng bài tên) ");
    // chỉ có họa thứ ba làm được dạng bài, mục lục zh mới là dạng bài tên; Đọc / Nghe zh là văn chương Tiếng Việt tiêu đề, không tham dự so với
    if (g.zh && LIB[skill].find(m => m.type === g.type).sub) assert.equal(g.zh, LIB[skill].find(m => m.type === g.type).zh, skill + "/" + g.type + " tạp diện Tiếng Việt đi = segmented nhãn hiệu, đồng nhất bình không thể hai cái tên ");
  });
});
console.log("ok hit-lib-check: links/span-state/filters/search/layout/escaping/one-parse; 4 skills match bank-catalog");
