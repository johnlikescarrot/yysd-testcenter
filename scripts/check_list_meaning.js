#!/usr/bin/env node
"use strict";
var fs = require("fs");
var path = require("path");
var src = fs.readFileSync(path.join(__dirname, "../assets/js/vocab-learn.js"), "utf8");
var m = src.match(/^function yysdMeaningForList\(raw, accept\) \{\n[\s\S]*?\n\}\n/m);
if (!m) {
  console.error("FAIL: yysdMeaningForList not found");
  process.exit(1);
}
var fn = Function(m[0] + "\nreturn yysdMeaningForList;")();

function eq(got, want, label) {
  if (got!== want) {
    console.error("FAIL:", label);
    console.error(" got ", JSON.stringify(got));
    console.error(" want", JSON.stringify(want));
    process.exit(1);
  }
}

eq(
  fn("adj. ① trống không, không có một bóng người; ② trống rỗng, vô tình ý nghĩa (empty promises). v. trống không, Xóa trống (empty the bin). n. chai không, chỗ trống rương. empty of (không có …). Trái nghĩa full. "),
  "adj. ① trống không, không có một bóng người; ② trống rỗng, vô tình ý nghĩa. v. trống không, Xóa trống. n. chai không, chỗ trống rương. ",
  "empty"
);
eq(
  fn("n. mắt cá chân, mắt cá chân các đốt ngón tay. twist / sprain one's ankle (bị trật mắt cá chân); ankle boots (mắt cá chân giày). "),
  "n. mắt cá chân, mắt cá chân các đốt ngón tay. ",
  "ankle"
);
eq(
  fn("v. bơi lội; bơi qua (swim the river); xoay tròn, mê muội (my head is swimming); tràn ngập (eyes swimming with tears). n. bơi lội. go for a swim; swimming pool. Bất quy tắc: swim–swam–swum. "),
  "v. bơi lội; bơi qua; xoay tròn, mê muội; tràn ngập. n. bơi lội. ",
  "swim"
);
eq(
  fn("v. ① chúc phúc, phù hộ (God bless you; bless sb with sth giao phó người nào đó vật gì đó); ② khiến cho may mắn được đến. n. blessing chúc phúc, chuyện may mắn. a blessing in disguise (nhân họa đắc phúc). be blessed with (may mắn có được). tôn giáo dùng từ đã Đời sống hóa, Nói God bless bề ngoài mong ước hoặc nhảy mũi lúc đáp lại. "),
  "v. ① chúc phúc, phù hộ; ② khiến cho may mắn được đến. n. chúc phúc, chuyện may mắn. ",
  "bless"
);
eq(fn(" theo; dựa theo "), " theo; dựa theo ", "cet4 passthrough");
eq(fn("adv. bởi vậy, do đó, như vậy. so sánh chính thức, tương đương với therefore / so. thus far (cho tới bây giờ). "), "adv. bởi vậy, do đó, như vậy. ", "thus");
eq(fn("prep. theo; dựa theo. thường dùng according to plan (theo kế hoạch). ", [" dựa theo ", " theo "]), " dựa theo; theo ", "prefer acceptCN");

console.log("OK: list meaning");
