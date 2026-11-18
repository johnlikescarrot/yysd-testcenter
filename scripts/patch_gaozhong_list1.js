#!/usr/bin/env node
"use strict";
/** List 1 sample: deepen meaning; keep Excel order. */
var fs = require("fs");
var path = require("path");

var HTML = path.join(__dirname, "../library/study/vocab/tu-vung-thpt-list1.html");
var EXCEL_ORDER = [
  "include","videophone","alcohol","ought","memorial","crazy","challenging","exact","translate","dizzy",
  "sure","welfare","ordinary","apply","lecture","grateful","feel","congratulate","position","component",
  "never","accuracy","illegal","victory","survive","biography","satisfaction","memory","former","rule",
  "virtue","suitable","botanical","remark","telescope","copy","fantastic","whom","differ","accident",
  "hear","portable","still","change","garbage","disappoint","will","promote","settle","explanation",
  "date","howl","match","conference","float","neighbour","microwave"
];

var overlay = {
  include: {
    pos: "v.",
    meaning: "v. ① kể cả, bao hàm (đem người nào đó hoặc vật gì đó tính làm toàn thân một bộ phận); ② tính nhập, đưa vào. thường dùng include sb/sth in; including (kể cả … ở bên trong, sau tiếp bị băng bó quát bộ phận); included (kể cả ở bên trong, thường từ đứng sau, ví dụ tax included). Trái nghĩa exclude. ",
    acceptCN: [" kể cả ", " bao hàm ", " tính nhập "]
  },
  videophone: {
    pos: "n.",
    meaning: "n. đáng nhìn điện thoại, video điện thoại (có thể đồng thời truyền tống thanh âm và hình ảnh điện thoại). cũng có thể chỉ dùng đáng nhìn điện thoại tiến hành trò chuyện. ",
    acceptCN: [" đáng nhìn điện thoại ", " video điện thoại "]
  },
  alcohol: {
    pos: "n.",
    meaning: "n. ① rượu cồn, ất thuần; ② rượu, hàm rượu cồn đồ uống. thông thường: drink alcohol (uống rượu), alcohol abuse (say rượu), alcohol-free (không có rượu tinh). ",
    acceptCN: [" rượu cồn ", " rượu ", " ất thuần "]
  },
  ought: {
    pos: "modal v.",
    meaning: " thần thái động từ nên, nên (bề ngoài nghĩa vụ, trách nhiệm hoặc khuyên bảo, ngữ khí thường so với must yếu). kết cấu: ought to do; đối diện đi: ought to have done (vốn nên làm mà không làm). Nói dặm thường bị should thay thế. ",
    acceptCN: [" nên ", " nên ", " lý nên "]
  },
  memorial: {
    pos: "n. / adj.",
    meaning: "n. bia kỷ niệm, kỷ niệm quán, vật kỷ niệm; lễ truy điệu (memorial service). adj. kỷ niệm, truy điệu. thông thường: war memorial (chiến tranh bia kỷ niệm), in memory / memorial of (là kỷ niệm …). ",
    acceptCN: [" bia kỷ niệm ", " kỷ niệm ", " lễ truy điệu "]
  },
  crazy: {
    pos: "adj.",
    meaning: "adj. ① điên cuồng, tinh thần thất thường; ② cuồng nhiệt, say mê (be crazy about); ③ hoang đường, không lý trí (crazy idea); ④ Nói: cực tốt, làm cho người hưng phấn. go crazy / drive sb crazy. ",
    acceptCN: [" điên cuồng ", " cuồng nhiệt ", " hoang đường "]
  },
  challenging: {
    pos: "adj.",
    meaning: "adj. có tính khiêu chiến, khảo nghiệm năng lực / nghị lực; khó khăn nhưng đáng giá làm. đến từ challenge. thông thường: challenging task / job; mentally challenging. ",
    acceptCN: [" có tính khiêu chiến ", " khảo nghiệm người "]
  },
  exact: {
    pos: "adj. / v.",
    meaning: "adj. chính xác, xác thực, vừa vặn (exact time / number; to be exact nói xác thực; the exact opposite hoàn toàn trái lại). v. cưỡng cầu, cố gắng (so sánh chính thức, exact a promise / revenge). ",
    acceptCN: [" chính xác ", " xác thực ", " cưỡng cầu "]
  },
  translate: {
    pos: "v.",
    meaning: "v. ① phiên dịch (translate sth into / from); ② chuyển hóa, biến thành (ideas translate into action); ③ khả giải thích là, tương đương với. danh từ translation. ",
    acceptCN: [" phiên dịch ", " chuyển hóa ", " dịch thành "]
  },
  dizzy: {
    pos: "adj.",
    meaning: "adj. cháng váng đầu, mê muội; khiến người choáng váng (dizzy heights làm cho người mê muội độ cao). feel dizzy; a dizzy spell (một hồi mê muội). ",
    acceptCN: [" cháng váng đầu ", " mê muội "]
  },
  sure: {
    pos: "adj. / adv.",
    meaning: "adj. xác định, có nắm chắc; nhất định sẽ phát sinh. make sure (bảo đảm); be sure of / that; for sure (khẳng định); be sure to (nhất định phải). adv. đương nhiên, hoàn toàn chính xác (Nói trả lời). ",
    acceptCN: [" xác định ", " đương nhiên ", " vững tin "]
  },
  welfare: {
    pos: "n.",
    meaning: "n. ① phúc lợi, xã hội bảo đảm (social welfare / welfare system); ② an khang, phúc lợi (child / animal welfare); ③ tiền cứu tế (càng Mỹ). well + fare → Tốt tình cảnh. ",
    acceptCN: [" phúc lợi ", " an khang ", " phúc lợi "]
  },
  ordinary: {
    pos: "adj.",
    meaning: "adj. thông thường, bình thường, bình thường, giống vậy. ordinary people / life; out of the ordinary (không tầm thường). Trái nghĩa extraordinary. ",
    acceptCN: [" thông thường ", " bình thường ", " bình thường "]
  },
  apply: {
    pos: "v.",
    meaning: "v. ① thân thỉnh (apply for a job / scholarship; apply to a university); ② hữu ích,thiết thực, vận dụng (apply theory to practice); ③ áp dụng (the rule applies to everyone); ④ bôi lên (apply cream); ⑤ chuyên tâm tận sức tại (apply oneself to). danh từ application. ",
    acceptCN: [" thân thỉnh ", " hữu ích,thiết thực ", " áp dụng ", " bôi lên "]
  },
  lecture: {
    pos: "n. / v.",
    meaning: "n. toạ đàm, giảng bài, diễn thuyết (give / attend a lecture; lecture hall). v. giảng bài, truyền thụ (lecture on); răn dạy, giáo huấn (lecture sb about). ",
    acceptCN: [" toạ đàm ", " giảng bài ", " răn dạy "]
  },
  grateful: {
    pos: "adj.",
    meaning: "adj. cảm kích, cảm tạ. be grateful for sth; be grateful to sb; I would be grateful if… (chính thức thỉnh cầu). Trái nghĩa ungrateful. danh từ gratitude. ",
    acceptCN: [" cảm kích ", " cảm tạ "]
  },
  feel: {
    pos: "v. / n.",
    meaning: "v. ① cảm giác, cảm thấy (feel tired / feel that); ② chạm đến (feel the fabric); ③ cảm nhận được (feel the heat). feel like (đều muốn; cảm giác như); feel free (thỉnh tùy ý). n. xúc cảm, bầu không khí (the feel of). Bất quy tắc: feel–felt–felt. ",
    acceptCN: [" cảm giác ", " cảm thấy ", " chạm đến "]
  },
  congratulate: {
    pos: "v.",
    meaning: "v. chúc mừng, chúc mừng. congratulate sb on sth; congratulate oneself (may mắn chính mình). danh từ congratulation(s). ",
    acceptCN: [" chúc mừng ", " chúc mừng "]
  },
  position: {
    pos: "n. / v.",
    meaning: "n. ① vị trí, phương vị (in position vào chỗ); ② chức vị, cương vị (a senior position); ③ lập trường, thái độ (take a position); ④ tình cảnh (in a difficult position). v. để đặt, thu xếp. ",
    acceptCN: [" vị trí ", " chức vị ", " lập trường ", " để đặt "]
  },
  component: {
    pos: "n. / adj.",
    meaning: "n. tạo thành bộ phận, bộ kiện, nguyên kiện, thành phần (key component; electronic component). adj. tạo thành, tạo thành. com-(cùng một chỗ) + pon(thả). ",
    acceptCN: [" tạo thành bộ phận ", " bộ kiện ", " nguyên kiện "]
  },
  never: {
    pos: "adv.",
    meaning: "adv. cũng không, tuyệt không, chưa bao giờ. thường và hoàn thành lúc dùng liền nhau (have never done). never mind (Không sao); never ever (tuyệt không); never before. Trái nghĩa always. ",
    acceptCN: [" cũng không ", " tuyệt không ", " chưa bao giờ "]
  },
  accuracy: {
    pos: "n.",
    meaning: "n. độ chuẩn xác, chính xác, độ chính xác. with accuracy; high / improve accuracy. tính từ accurate; Trái nghĩa inaccuracy. ",
    acceptCN: [" độ chuẩn xác ", " chính xác ", " độ chính xác "]
  },
  illegal: {
    pos: "adj.",
    meaning: "adj. phi pháp, phạm luật, không hợp pháp. it is illegal to do; illegal activity / parking. il-(không) + legal. danh từ illegality; Trái nghĩa legal. ",
    acceptCN: [" phi pháp ", " phạm luật ", " không hợp pháp "]
  },
  victory: {
    pos: "n.",
    meaning: "n. thắng lợi, chiến thắng, thành công. win a victory; narrow victory (thắng hiểm); victory over. vict(chinh phục). Trái nghĩa defeat / loss. ",
    acceptCN: [" thắng lợi ", " chiến thắng ", " thành công "]
  },
  survive: {
    pos: "v.",
    meaning: "v. ① may mắn còn sống sót, sống sót (survive an accident); ② còn sống, duy trì (survive on); ③ so với … sống được lâu; ④ gắng gượng qua, khó khăn vượt qua. danh từ survival; tính từ surviving. ",
    acceptCN: [" may mắn còn sống sót ", " còn sống ", " gắng gượng qua "]
  },
  biography: {
    pos: "n.",
    meaning: "n. truyện ký, cuộc đời ghi lại. write a biography of sb; autobiography (tự truyện). bio(sinh mệnh) + graphy(viết). ",
    acceptCN: [" truyện ký ", " cuộc đời "]
  },
  satisfaction: {
    pos: "n.",
    meaning: "n. thoả mãn, thỏa mãn, vừa lòng. with satisfaction; to one's satisfaction; customer / job satisfaction. động từ satisfy; tính từ satisfied / satisfactory. ",
    acceptCN: [" thoả mãn ", " thỏa mãn ", " vừa lòng "]
  },
  memory: {
    pos: "n.",
    meaning: "n. ① trí nhớ, trí nhớ (have a good memory); ② nhớ lại (childhood memories; in memory of là kỷ niệm); ③ tồn trữ khí, bộ nhớ (Máy tính). động từ memorize; tính từ memorable. ",
    acceptCN: [" trí nhớ ", " nhớ lại ", " bộ nhớ "]
  },
  former: {
    pos: "adj. / n.",
    meaning: "adj. trước kia, từ trước, tiền nhậm (former teacher / president). n. the former (người phía trước, và the latter tương đối). in former times. ",
    acceptCN: [" trước kia ", " người phía trước ", " tiền nhiệm "]
  },
  rule: {
    pos: "n. / v.",
    meaning: "n. ① quy tắc, quy định, lệ cũ (school rules; as a rule bình thường); ② thống trị, thống trị thời hạn. v. thống trị, Quản trị; quyết định (rule that); rule out (bài trừ). ",
    acceptCN: [" quy tắc ", " thống trị ", " quyết định "]
  },
  virtue: {
    pos: "n.",
    meaning: "n. ① mỹ đức, đức hạnh (patience is a virtue); ② ưu điểm, sở trường; ③ trinh tiết (xưa cũ nghĩa). by virtue of (bằng vào, bởi vì). Trái nghĩa vice. ",
    acceptCN: [" mỹ đức ", " ưu điểm ", " đức hạnh "]
  },
  suitable: {
    pos: "adj.",
    meaning: "adj. thích hợp, thích hợp, thích hợp. be suitable for; a suitable candidate. suit + -able. Trái nghĩa unsuitable. ",
    acceptCN: [" thích hợp ", " thích hợp ", " thích hợp "]
  },
  botanical: {
    pos: "adj.",
    meaning: "adj. thực vật học, và Thực vật có liên quan. botanical garden (vườn cây); botanical name (thực vật học tên). danh từ botany / botanist. ",
    acceptCN: [" thực vật học ", " thực vật "]
  },
  remark: {
    pos: "n. / v.",
    meaning: "n. bình luận, ngôn luận, nói chuyện (make a remark; opening remarks lời dạo đầu). v. bình luận, nói tới (remark on / upon); chú ý tới (so sánh chính thức). ",
    acceptCN: [" bình luận ", " nói chuyện ", " chú ý tới "]
  },
  telescope: {
    pos: "n. / v.",
    meaning: "n. kính viễn vọng (look through a telescope; space / radio telescope). v. chồng co lại, rút ngắn (khiến cho bộ chồng; thời gian / cô đọng sự kiện). tele-(xa) + scope(nhìn). ",
    acceptCN: [" kính viễn vọng ", " chồng co lại "]
  },
  copy: {
    pos: "n. / v.",
    meaning: "n. ① phó bản, bản sao; ② một quyển, một phần (báo chí sách vở); ③ phim âm bản. v. phục chế, sao chép, bắt chước. a copy of; copy down; hard copy (bằng giấy kiện). Trái nghĩa original. ",
    acceptCN: [" phục chế ", " phó bản ", " sao chép "]
  },
  fantastic: {
    pos: "adj.",
    meaning: "adj. ① cực tốt, giỏi lắm (Nói); ② kỳ dị, hoang đường, không thiết thực (fantastic story / idea). và fantasy tương quan. ",
    acceptCN: [" cực tốt ", " kỳ dị ", " hoang đường "]
  },
  whom: {
    pos: "pron.",
    meaning: "pron. ai (cách mục đích, làm động từ hoặc giới từ Tân ngữ). to / with / for / of whom. chính thức lời nói thể thường dùng; Nói đa dụng who. ",
    acceptCN: [" ai (cách mục đích) ", " người phương nào "]
  },
  differ: {
    pos: "v.",
    meaning: "v. ① bất đồng, phân biệt dị (differ from; differ in); ② ý kiến không hợp (opinions differ; agree to differ cố tìm cái chung,gác lại cái bất đồng). danh từ difference; tính từ different. ",
    acceptCN: [" bất đồng ", " phân biệt dị ", " ý kiến không hợp "]
  },
  accident: {
    pos: "n.",
    meaning: "n. ① sự cố, chuyện ngoài ý muốn (traffic / car accident; have an accident); ② ngẫu nhiên (by accident ngẫu nhiên, trong lúc vô tình). chú ý và incident (sự kiện) phân chia. ",
    acceptCN: [" sự cố ", " ngoài ý muốn ", " ngẫu nhiên "]
  },
  hear: {
    pos: "v.",
    meaning: "v. ① nghe thấy (cường điệu kết quả, listen cường điệu động tác); ② nghe nói (hear of / about); ③ nhận được tin tức (hear from). hear–heard–heard. ",
    acceptCN: [" nghe thấy ", " nghe nói ", " nghe được "]
  },
  portable: {
    pos: "adj. / n.",
    meaning: "adj. tiện mang, tay cầm, có thể mang theo (portable device / charger). n. tiện mang thiết bị. port(mang theo) + -able. ",
    acceptCN: [" tiện mang ", " tay cầm ", " có thể mang theo "]
  },
  still: {
    pos: "adv. / adj. / n. / v.",
    meaning: "adv. vẫn đang, hay; mặc dù như thế (càng mạnh hơn nữa điều “ tiếp tục / ra ngoài ý định ”). adj. bất động, bình tĩnh (stand still; still water). n. tĩnh vật họa (still life); cất khí. v. khiến cho bình tĩnh. ",
    acceptCN: [" vẫn đang ", " bất động ", " bình tĩnh "]
  },
  change: {
    pos: "n. / v.",
    meaning: "v. cải biến, biến hóa, thay đổi, đổi. n. ① cải biến, biến hóa (climate change); ② tiền lẻ, lấy lẻ; ③ thay đổi (for a change thay đổi dạng). change into. ",
    acceptCN: [" cải biến ", " biến hóa ", " tiền lẻ "]
  },
  garbage: {
    pos: "n.",
    meaning: "n. rác rưởi, phế vật (kiểu Mỹ thường dùng; kiểu Anh đa dụng rubbish). cũng có thể chỉ nói nhảm, thấp kém nội dung. garbage can; take out the garbage. ",
    acceptCN: [" rác rưởi ", " phế vật "]
  },
  disappoint: {
    pos: "v.",
    meaning: "v. sự thất vọng, khiến cho mất hứng. disappoint sb; be disappointed at / with / in. tính từ disappointed / disappointing; danh từ disappointment. ",
    acceptCN: [" sự thất vọng ", " mất hứng "]
  },
  will: {
    pos: "modal v. / n. / v.",
    meaning: " thần thái động từ sắp sửa; nguyện ý. n. ① ý chí, ý nguyện (free will; against one's will; Where there is a will…); ② di chúc. v. dùng ý chí đem ra sử dụng; làm di chúc đem … tặng cho. won't = will not. ",
    acceptCN: [" sắp sửa ", " nguyện ý ", " ý chí ", " di chúc "]
  },
  promote: {
    pos: "v.",
    meaning: "v. ① xúc tiến, thúc đẩy (promote health / awareness); ② tấn chức (promote sb to); ③ chào hàng, tuyên truyền (promote a product). danh từ promotion. Trái nghĩa demote / hinder. ",
    acceptCN: [" xúc tiến ", " tấn chức ", " chào hàng "]
  },
  settle: {
    pos: "v.",
    meaning: "v. ① giải quyết, chấm dứt (settle a dispute); ② định cư, dàn xếp (settle in / settle down); ③ bình tĩnh trở lại; ④ kết toán, tiền trả. từ nghĩa theo ngữ cảnh biến hóa. ",
    acceptCN: [" giải quyết ", " định cư ", " dàn xếp ", " kết toán "]
  },
  explanation: {
    pos: "n.",
    meaning: "n. giải thích, nói rõ, giảng giải. give an explanation; in explanation of; detailed explanation. động từ explain. ",
    acceptCN: [" giải thích ", " nói rõ ", " giảng giải "]
  },
  date: {
    pos: "n. / v.",
    meaning: "n. ① ngày, niên đại (What's the date today?); ② cuộc hẹn; ③ táo. out of date (quá hạn); up to date (mới nhất). v. ghi chú rõ ngày; và … cuộc hẹn; ngược dòng tìm hiểu đến (date from / back to). ",
    acceptCN: [" ngày ", " cuộc hẹn ", " táo "]
  },
  howl: {
    pos: "v. / n.",
    meaning: "v. / n. tru lên, gào rít giận dữ, khóc thét; cuồng tiếu (howl with laughter). gió, dã thú, người đều có thể dùng. mô phỏng âm thanh từ. ",
    acceptCN: [" tru lên ", " gào rít giận dữ ", " khóc thét "]
  },
  match: {
    pos: "n. / v.",
    meaning: "n. ① trận đấu (football match); ② xứng đôi người hoặc vật (a good match); ③ diêm (strike a match). v. xứng đôi, xứng đôi, so ra mà vượt (match with / match the requirements). ",
    acceptCN: [" trận đấu ", " xứng đôi ", " diêm "]
  },
  conference: {
    pos: "n.",
    meaning: "n. hội nghị, thảo luận sẽ, đại hội (so sánh chính thức, quy mô thường lớn hơn meeting). attend a conference; press conference (buổi họp báo tin tức); video conference. ",
    acceptCN: [" hội nghị ", " thảo luận sẽ ", " đại hội "]
  },
  float: {
    pos: "v. / n.",
    meaning: "v. trôi nổi, di động, phiêu; đưa ra ý tưởng thăm dò (float an idea). n. trôi nổi vật; du hành màu xe (parade float); phao. Trái nghĩa sink. ",
    acceptCN: [" trôi nổi ", " di động ", " màu xe "]
  },
  neighbour: {
    pos: "n.",
    meaning: "n. hàng xóm, hàng xóm người; nước láng giềng (neighbourhood quảng trường). kiểu Anh Chính tả neighbour; kiểu Mỹ neighbor. next-door neighbour. ",
    acceptCN: [" hàng xóm ", " hàng xóm người "]
  },
  microwave: {
    pos: "n. / v.",
    meaning: "n. lò điện siêu sóng(microwave oven); sóng vi-ba. v. dùng lò điện siêu sóng(microwave oven) đun nóng. microwave oven; heat sth in the microwave. micro(hơi) + wave(sóng). ",
    acceptCN: [" lò điện siêu sóng(microwave oven) ", " sóng vi-ba "]
  }
};

var html = fs.readFileSync(HTML, "utf8");
var m = html.match(/const wordData = (\[[\s\S]*?\]);/);
if (!m) throw new Error("wordData not found");
var words = Function("return (" + m[1] + ");")();
if (words.length!== EXCEL_ORDER.length) throw new Error("count " + words.length);
words.forEach(function (w, i) {
  if (w.word!== EXCEL_ORDER[i]) throw new Error("order @" + i + " " + w.word + "!= " + EXCEL_ORDER[i]);
  var o = overlay[w.word];
  if (!o) throw new Error("missing overlay " + w.word);
  w.meaning = o.meaning;
  w.acceptCN = o.acceptCN;
  w.pos = o.pos;
  if (w.acceptCN.length < 2 || w.acceptCN.length > 4) throw new Error("acceptCN size " + w.word);
});
var next = html.replace(m[0], "const wordData = " + JSON.stringify(words) + ";");
fs.writeFileSync(HTML, next);
console.log("patched LIST1 ·", words.length, "words");
