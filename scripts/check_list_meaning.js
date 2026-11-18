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
  if (got !== want) {
    console.error("FAIL:", label);
    console.error(" got ", JSON.stringify(got));
    console.error(" want", JSON.stringify(want));
    process.exit(1);
  }
}

eq(
  fn("adj. ① trống không của, không một bóng người của; ② hốc của, không cố ý công lý của(empty promises) v. làm trống, dọn dẹp(empty the bin) n. trống không chai, trống không hộp empty of(không có...) Trái nghĩa full "),
  "adj. ① trống không của, không một bóng người của; ② hốc của, không cố ý công lý của v. làm trống, dọn dẹp n. trống không chai, trống không hộp ",
  "empty"
);
eq(
  fn("n. mắt cá chân, mắt cá chân khớp twist / sprain one's ankle(bong gân mắt cá chân); ankle boots(mắt cá chân ủng) "),
  "n. mắt cá chân, mắt cá chân khớp ",
  "ankle"
);
eq(
  fn("v. bơi lội; bơi băng qua(swim the river); xoay, chóng mặt(my head is swimming); đầy(eyes swimming with tears) n. bơi lội go for a swim; swimming pool bất quy tắc: swim–swam–swum "),
  "v. bơi lội; bơi băng qua; xoay, chóng mặt; đầy n. bơi lội ",
  "swim"
);
eq(
  fn("v. ① lời chúc, phù hộ và bảo vệ(God bless you; bless sb with sth giao phó một người nào đó một vật gì đó); ② khiến may mắn thay được n. blessing lời chúc, điều may mắn a blessing in disguise(trong họa có phúc) be blessed with(may mắn thay có) tôn giáo cách chọn từ đã hằng ngày biến thể của, Nói God bless bề mặt bên ngoài cầu chúc có thể hắt xì biến thể cũ của | của phản hồi "),
  "v. ① lời chúc, phù hộ và bảo vệ; ② khiến may mắn thay được n. lời chúc, điều may mắn ",
  "bless"
);
eq(fn(" theo; theo "), " theo; theo ", "cet4 passthrough");
eq(fn("adv. do đó, do đó, loại này so sánh trang trọng, tương đương với therefore / so thus far(cho đến giờ) "), "adv. do đó, do đó, loại này ", "thus");
eq(fn("prep. theo; theo Thường dùng according to plan(nhấn kế hoạch) ", [" theo ", " theo "]), " theo; theo ", "prefer acceptCN");

console.log("OK: list meaning");
