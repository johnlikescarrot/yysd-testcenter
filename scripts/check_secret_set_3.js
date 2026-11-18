#!/usr/bin/env node
// ponytail: assert tuyệt mật che đậy cuộn lại 3 is 40 keyed questions + catalog id
var fs = require("fs");
var path = require("path");
var root = path.join(__dirname, "..");
function must(cond, msg) { if (!cond) throw new Error(msg); }

var html = fs.readFileSync(path.join(root, "library/mock/cambridge-reading/secret-set-3-reading.html"), "utf8");
must(html.indexOf('exam:title" content=" tuyệt mật che đậy cuộn lại 3(Đọc hiểu)"') >= 0, "title meta");
must(html.indexOf(" tuyệt mật che đậy cuộn lại 2") < 0, "leftover che đậy cuộn lại 2");
must(html.indexOf("Giraffes") < 0, "leftover set2 passage");

var m = html.match(/const TEST = (\{[\s\S]*?\n\});\n/);
must(m, "TEST json");
var TEST = JSON.parse(m[1]);
var expect = [
  "FALSE","FALSE","TRUE","NOT GIVEN","TRUE","TRUE","FALSE",
  "102 million","Sweden","granite","four","forecourt","harbour",
  "C","B","A","H","B","F",
  "technological","stress","sunlight","tree","air",
  "B","D",
  "D","B","A","C","B",
  "NO","NOT GIVEN","YES","NOT GIVEN",
  "E","C","D","G","B"
];
function norm(s) {
  return String(s || "").toLowerCase().replace(/[£$,.;:!?"'’]/g, "").replace(/\s+/g, " ").trim().replace(/^(a|an|the)\s+/, "");
}
var got = [];
TEST.passages.forEach(function (p) {
  p.groups.forEach(function (g) {
    g.questions.forEach(function (q) {
      got.push(q.answer[0]);
      must(q.answer.map(norm).indexOf(norm(q.answer[0])) >= 0, "self-grade Q" + q.no);
      must(q.explain && q.explain.indexOf(" Xác định vị trí ") >= 0 && q.explain.length > 40, "explain Q" + q.no);
    });
  });
});
must(got.length === 40, "need 40 got " + got.length);
got.forEach(function (a, i) { must(a === expect[i], "Q" + (i + 1) + " " + a + " != " + expect[i]); });
must(TEST.passages[1].groups[2].answerSet.join("") === "BD", "multi B+D");
must(TEST.passages[0].passage.title.indexOf("Sydney") >= 0, "p1 title");
must(TEST.passages[2].groups[2].box.G.indexOf("more marked that") >= 0, "ending G screenshot wording");

var man = JSON.parse(fs.readFileSync(path.join(root, "library/manifest.json"), "utf8"));
var items = man.items || man;
var hit = (items || []).filter(function (it) { return it.id === "secret-set-3-reading"; });
must(hit.length === 1, "manifest id");
must(/tuyệt mật che đậy cuộn lại 3/.test(hit[0].title), "manifest title");

console.log("check_secret_set_3: ok");
