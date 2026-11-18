#!/usr/bin/env node
"use strict";
/** List 1 sample: deepen meaning; keep Excel order. */
var fs = require("fs");
var path = require("path");

var HTML = path.join(__dirname, "../library/study/vocab/trường trung học phổ thông từ LIST1.html");
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
    meaning: "v. ① bao gồm, chứa(cầm một người nào đó có thể một vật gì đó coi như công nhân thực thể toàn bộ của phần); ② coi như đi vào, tính toán đi vào Thường dùng include sb/sth in; including(bao gồm...trong đó, hoàng hậu nhận chăn bao gồm phần); included(bao gồm trong đó, luôn luôn đặt sau, như tax included) Trái nghĩa exclude ",
    acceptCN: [" bao gồm ", " chứa ", " coi như đi vào "]
  },
  videophone: {
    pos: "n.",
    meaning: "n. điện thoại video, video điện thoại(có thể đồng thời truyền đạt giọng biến thể của | hình ảnh của điện thoại) cũng có thể ngón tay sử dụng điện thoại video tiến hành của nói chuyện ",
    acceptCN: [" điện thoại video ", " video điện thoại "]
  },
  alcohol: {
    pos: "n.",
    meaning: "n. ① cồn, ethanol C2H5OH; ② rượu, ngậm trong miệng đồ uống có cồn thường thấy: drink alcohol(uống rượu), alcohol abuse(uống rượu nhiều), alcohol-free(không có cồn của) ",
    acceptCN: [" cồn ", " rượu ", " ethanol C2H5OH "]
  },
  ought: {
    pos: "modal v.",
    meaning: " tinh thần động từ nên, nên(bề mặt bên ngoài nhiệm vụ, trách nhiệm có thể khuyên nhủ, giọng điệu luôn luôn Bỉ must yếu) cấu trúc: ought to do; bên kia đi: ought to have done(nên đã làm và chưa làm) lời nói thông thường biến thể của | luôn luôn chăn should thay thế cho ",
    acceptCN: [" nên ", " nên ", " nên "]
  },
  memorial: {
    pos: "n. / adj.",
    meaning: "n. đài tưởng niệm, hội trường tưởng niệm, tưởng niệm vật; lễ tưởng niệm(memorial service) adj. tưởng niệm của, tưởng nhớ của thường thấy: war memorial(chiến tranh đài tưởng niệm), in memory / memorial of(làm tưởng niệm...) ",
    acceptCN: [" đài tưởng niệm ", " tưởng niệm của ", " lễ tưởng niệm "]
  },
  crazy: {
    pos: "adj.",
    meaning: "adj. ① điên cuồng của, tinh thần không bình thường của; ② cuồng nhiệt của, bị mê hoặc của(be crazy about); ③ khó tin của, từ chối thừa nhận khôn ngoan của(crazy idea); ④ Nói: Rất tốt, khiến cho một người phấn khích của go crazy / drive sb crazy ",
    acceptCN: [" điên cuồng của ", " cuồng nhiệt của ", " khó tin của "]
  },
  challenging: {
    pos: "adj.",
    meaning: "adj. có thử thách bản chất của, thử thách năng lực/sự kiên trì của; khó khăn nhưng đáng làm của đến từ challenge thường thấy: challenging task / job; mentally challenging ",
    acceptCN: [" có thử thách bản chất của ", " thử thách người của "]
  },
  exact: {
    pos: "adj. / v.",
    meaning: "adj. chính xác của, rõ ràng của, vừa của(exact time / number; to be exact rõ ràng trợ từ kết cấu: dùng trước động từ hoặc tính từ thuyết phục; the exact opposite một cách rõ ràng đối lập) v. khăng khăng, hỏi(so sánh trang trọng, exact a promise / revenge) ",
    acceptCN: [" chính xác của ", " rõ ràng của ", " khăng khăng "]
  },
  translate: {
    pos: "v.",
    meaning: "v. ① Dịch(translate sth into / from); ② thay đổi, thay đổi thành(ideas translate into action); ③ có thể giải quyết giải thích làm, tương đương với Danh từ translation ",
    acceptCN: [" Dịch ", " thay đổi ", " dịch sang "]
  },
  dizzy: {
    pos: "adj.",
    meaning: "adj. chóng mặt của, chóng mặt của; khiến người cảm thấy chóng mặt của(dizzy heights khiến cho một người chóng mặt của chiều cao) feel dizzy; a dizzy spell(một trận chóng mặt) ",
    acceptCN: [" chóng mặt của ", " chóng mặt của "]
  },
  sure: {
    pos: "adj. / adv.",
    meaning: "adj. rõ ràng của, có nắm bắt của; chắc chắn có thể xảy ra của make sure(đảm bảo); be sure of / that; for sure(chắc chắn trợ từ kết cấu: dùng trước động từ hoặc tính từ); be sure to(phải) adv. đương nhiên, thực sự(lời nói thông thường trả lời) ",
    acceptCN: [" rõ ràng của ", " đương nhiên ", " tin chắc "]
  },
  welfare: {
    pos: "n.",
    meaning: "n. ① lợi ích vật chất, an sinh xã hội(social welfare / welfare system); ② thành phố cấp địa khu An Khang, hạnh phúc(child / animal welfare); ③ cứu trợ khẩn cấp vàng(xuất sắc Châu Mỹ) well + fare → tốt tình cảnh ",
    acceptCN: [" lợi ích vật chất ", " thành phố cấp địa khu An Khang ", " hạnh phúc "]
  },
  ordinary: {
    pos: "adj.",
    meaning: "adj. phổ thông của, bình thường của, bình thường của, giống của ordinary people / life; out of the ordinary(không thông thường) Trái nghĩa extraordinary ",
    acceptCN: [" phổ thông của ", " bình thường của ", " bình thường của "]
  },
  apply: {
    pos: "v.",
    meaning: "v. ① nộp đơn xin(apply for a job / scholarship; apply to a university); ② đưa vào sử dụng, sử dụng(apply theory to practice); ③ có thể áp dụng(the rule applies to everyone); ④ sơn(apply cream); ⑤ tập trung chú ý làm việc cho đi(apply oneself to) Danh từ application ",
    acceptCN: [" nộp đơn xin ", " đưa vào sử dụng ", " có thể áp dụng ", " sơn "]
  },
  lecture: {
    pos: "n. / v.",
    meaning: "n. bài giảng, dạy, diễn thuyết(give / attend a lecture; lecture hall) v. dạy, giảng bài(lecture on); khiển trách, đưa ra hướng dẫn(lecture sb about) ",
    acceptCN: [" bài giảng ", " dạy ", " khiển trách "]
  },
  grateful: {
    pos: "adj.",
    meaning: "adj. biết ơn của, cảm ơn của be grateful for sth; be grateful to sb; I would be grateful if...(trang trọng yêu cầu) Trái nghĩa ungrateful Danh từ gratitude ",
    acceptCN: [" biết ơn của ", " cảm ơn của "]
  },
  feel: {
    pos: "v. / n.",
    meaning: "v. ① cảm giác, nghĩ rằng(feel tired / feel that); ② chạm(feel the fabric); ③ cảm nhận đến(feel the heat) feel like(muốn; cảm giác giống); feel free(mời theo ý muốn) n. cảm giác, bầu không khí(the feel of) bất quy tắc: feel–felt–felt ",
    acceptCN: [" cảm giác ", " nghĩ rằng ", " chạm "]
  },
  congratulate: {
    pos: "v.",
    meaning: "v. chúc mừng, chúc mừng congratulate sb on sth; congratulate oneself(vui mừng bản thân) Danh từ congratulation(s) ",
    acceptCN: [" chúc mừng ", " chúc mừng "]
  },
  position: {
    pos: "n. / v.",
    meaning: "n. ① vị trí, phương hướng(in position trong trường hợp đó vị trí); ② vị trí, một vị trí(a senior position); ③ lập trường, cách thức(take a position); ④ tình cảnh(in a difficult position) v. đặt, tìm chỗ cho ",
    acceptCN: [" vị trí ", " vị trí ", " lập trường ", " đặt "]
  },
  component: {
    pos: "n. / adj.",
    meaning: "n. phần, bộ phận, phần tử, thành phần(key component; electronic component) adj. hình thành của, cấu thành của com-(ở cùng một nơi) + pon(đặt) ",
    acceptCN: [" phần ", " bộ phận ", " phần tử "]
  },
  never: {
    pos: "adv.",
    meaning: "adv. không bao giờ, không đời nào, chưa từng luôn luôn biến thể của | thì hoàn thành sử dụng cùng nhau(have never done) never mind(không sao đâu); never ever(không đời nào); never before Trái nghĩa always ",
    acceptCN: [" không bao giờ ", " không đời nào ", " chưa từng "]
  },
  accuracy: {
    pos: "n.",
    meaning: "n. độ chính xác, chính xác, chính xác vượt qua with accuracy; high / improve accuracy Tính từ accurate; Trái nghĩa inaccuracy ",
    acceptCN: [" độ chính xác ", " chính xác ", " chính xác vượt qua "]
  },
  illegal: {
    pos: "adj.",
    meaning: "adj. bất hợp pháp của, bất hợp pháp của, bất hợp pháp của it is illegal to do; illegal activity / parking il-(không) + legal Danh từ illegality; Trái nghĩa legal ",
    acceptCN: [" bất hợp pháp của ", " bất hợp pháp của ", " bất hợp pháp của "]
  },
  victory: {
    pos: "n.",
    meaning: "n. chiến thắng, chiến thắng, Thành công win a victory; narrow victory(thắng sát nút); victory over vict(chinh phục) Trái nghĩa defeat / loss ",
    acceptCN: [" chiến thắng ", " chiến thắng ", " Thành công "]
  },
  survive: {
    pos: "v.",
    meaning: "v. ① sống sót, sống sót đến(survive an accident); ② sống sót, giữ(survive on); ③ so với...sống được chiều dài; ④ thẳng băng qua, khó khăn trải qua Danh từ survival; Tính từ surviving ",
    acceptCN: [" sống sót ", " sống sót ", " thẳng băng qua "]
  },
  biography: {
    pos: "n.",
    meaning: "n. tiểu sử, cuộc đời viết ghi chép write a biography of sb; autobiography(tự truyện) bio(sự sống) + graphy(viết) ",
    acceptCN: [" tiểu sử ", " cuộc đời "]
  },
  satisfaction: {
    pos: "n.",
    meaning: "n. hài lòng, thoả mãn, hài lòng with satisfaction; to one's satisfaction; customer / job satisfaction Động từ satisfy; Tính từ satisfied / satisfactory ",
    acceptCN: [" hài lòng ", " thoả mãn ", " hài lòng "]
  },
  memory: {
    pos: "n.",
    meaning: "n. ① khả năng ghi nhớ, trí nhớ(have a good memory); ② hồi tưởng(childhood memories; in memory of làm tưởng niệm); ③ bộ nhớ, bộ nhớ trong(máy tính) Động từ memorize; Tính từ memorable ",
    acceptCN: [" nhớ ", " hồi tưởng ", " bộ nhớ trong "]
  },
  former: {
    pos: "adj. / n.",
    meaning: "adj. trước đây của, trước đây của, người tiền nhiệm của(former teacher / president) n. the former(cái trước, và the latter tương đối) in former times ",
    acceptCN: [" trước đây của ", " cái trước ", " người tiền nhiệm "]
  },
  rule: {
    pos: "n. / v.",
    meaning: "n. ① quy tắc, quy định, quy ước(school rules; as a rule thông thường); ② cai trị, cai trị biến thể của v. cai trị, Quản lý; phán quyết(rule that); rule out(loại bỏ) ",
    acceptCN: [" quy tắc ", " cai trị ", " phán quyết "]
  },
  virtue: {
    pos: "n.",
    meaning: "n. ① Mỹ và Đức, đạo đức và hành vi(patience is a virtue); ② ưu điểm, điểm tốt; ③ trinh tiết(cũ công lý) by virtue of(dựa vào, do) Trái nghĩa vice ",
    acceptCN: [" Mỹ và Đức ", " ưu điểm ", " đạo đức và hành vi "]
  },
  suitable: {
    pos: "adj.",
    meaning: "adj. thích hợp của, phù hợp của, phù hợp của be suitable for; a suitable candidate suit + -able Trái nghĩa unsuitable ",
    acceptCN: [" thích hợp của ", " phù hợp của ", " phù hợp của "]
  },
  botanical: {
    pos: "adj.",
    meaning: "adj. thực vật học của, biến thể của | thực vật có liên quan đến của botanical garden(vườn bách thảo); botanical name(thực vật học tên) Danh từ botany / botanist ",
    acceptCN: [" thực vật học của ", " thực vật của "]
  },
  remark: {
    pos: "n. / v.",
    meaning: "n. bình luận về, bày tỏ ý kiến, bài phát biểu(make a remark; opening remarks lời mở đầu vở kịch) v. bình luận về, nhắc đến(remark on / upon); chú ý đến đến(so sánh trang trọng) ",
    acceptCN: [" bình luận về ", " bài phát biểu ", " chú ý đến đến "]
  },
  telescope: {
    pos: "n. / v.",
    meaning: "n. ống nhòm(look through a telescope; space / radio telescope) v. biến thể của | rút lại, rút ngắn(khiến chồng chéo; Thời gian/sự kiện nén) tele-(xa) + scope(chăm sóc) ",
    acceptCN: [" ống nhòm ", " biến thể của | rút lại "]
  },
  copy: {
    pos: "n. / v.",
    meaning: "n. ① bản sao, bản photocopy; ② một gốc, một lượng từ cho quà tặng(báo chí và tạp chí sách); ③ sao chép v. nhân bản, sao chép, bắt chước a copy of; copy down; hard copy(giấy món) Trái nghĩa original ",
    acceptCN: [" nhân bản ", " bản sao ", " sao chép "]
  },
  fantastic: {
    pos: "adj.",
    meaning: "adj. ① Rất tốt, kinh ngạc của(Nói); ② kỳ lạ của, khó tin của, không thực tế của(fantastic story / idea) và fantasy liên quan ",
    acceptCN: [" Rất tốt ", " kỳ lạ của ", " khó tin của "]
  },
  whom: {
    pos: "pron.",
    meaning: "pron. ai(cách bổ ngữ, công nhân động từ có thể giới từ tân ngữ) to / with / for / of whom trang trọng phương ngữ cơ thể được sử dụng phổ biến; lời nói thông thường đa dụng who ",
    acceptCN: [" ai(cách bổ ngữ)", " ai "]
  },
  differ: {
    pos: "v.",
    meaning: "v. ① khác, có sự khác biệt(differ from; differ in); ② bất đồng ý kiến(opinions differ; agree to differ tìm kiếm điểm chung) Danh từ difference; Tính từ different ",
    acceptCN: [" khác ", " có sự khác biệt ", " bất đồng ý kiến "]
  },
  accident: {
    pos: "n.",
    meaning: "n. ① tai nạn, bất ngờ sự kiện(traffic / car accident; have an accident); ② tình cờ(by accident tình cờ, một cách tình cờ) chú ý đến biến thể của | incident(sự kiện)phân biệt ",
    acceptCN: [" tai nạn ", " bất ngờ ", " tình cờ "]
  },
  hear: {
    pos: "v.",
    meaning: "v. ① nghe thấy(nhấn mạnh kết trái, listen nhấn mạnh chuyển động); ② nghe(hear of / about); ③ nhận được tin tức(hear from) hear–heard–heard ",
    acceptCN: [" nghe thấy ", " nghe ", " nghe thấy "]
  },
  portable: {
    pos: "adj. / n.",
    meaning: "adj. di động của, xách tay của, có thể mang theo của(portable device / charger) n. di động thiết bị port(mang theo) + -able ",
    acceptCN: [" di động của ", " xách tay của ", " có thể mang theo của "]
  },
  still: {
    pos: "adv. / adj. / n. / v.",
    meaning: "adv. vẫn, vẫn; mặc dù như thế(thay đổi hoặc thay thế nhấn mạnh“ tiếp tục/vượt ngoài mong đợi ”) adj. tĩnh của, tĩnh lặng của(stand still; still water) n. tĩnh vật vẽ(still life); nồi chưng cất v. khiến tĩnh lặng ",
    acceptCN: [" vẫn ", " tĩnh của ", " tĩnh lặng "]
  },
  change: {
    pos: "n. / v.",
    meaning: "v. thay đổi, thay đổi, thay thế, chuyển đổi n. ① thay đổi, thay đổi(climate change); ② tiền thối, đưa tiền thối; ③ thay thế(for a change trao đổi trao đổi cách) change into ",
    acceptCN: [" thay đổi ", " thay đổi ", " tiền thối "]
  },
  garbage: {
    pos: "n.",
    meaning: "n. rác, rác rưởi(phong cách Mỹ được sử dụng phổ biến; Anh loại đa dụng rubbish) cũng có thể ngón tay vô nghĩa, kém chất lượng nội dung garbage can; take out the garbage ",
    acceptCN: [" rác ", " rác rưởi "]
  },
  disappoint: {
    pos: "v.",
    meaning: "v. khiến thất vọng, khiến làm mất hứng disappoint sb; be disappointed at / with / in Tính từ disappointed / disappointing; Danh từ disappointment ",
    acceptCN: [" khiến thất vọng ", " làm mất hứng "]
  },
  will: {
    pos: "modal v. / n. / v.",
    meaning: " tinh thần động từ sẽ; muốn n. ① ý chí, nguyện vọng(free will; against one's will; Where there is a will...); ② di chúc v. ý định khát vọng thúc đẩy; đứng di chúc cầm...biến thể của | won't = will not ",
    acceptCN: [" sẽ ", " muốn ", " ý chí ", " di chúc "]
  },
  promote: {
    pos: "v.",
    meaning: "v. ① thúc đẩy, thúc đẩy(promote health / awareness); ② thăng chức lên vị trí cao hơn(promote sb to); ③ tiếp thị, truyền bá(promote a product) Danh từ promotion Trái nghĩa demote / hinder ",
    acceptCN: [" thúc đẩy ", " thăng chức lên vị trí cao hơn ", " tiếp thị "]
  },
  settle: {
    pos: "v.",
    meaning: "v. ① giải quyết, giải quyết(settle a dispute); ② định cư, tìm chỗ cho(settle in / settle down); ③ tĩnh lặng đi xuống; ④ thanh toán, trả tiền nghĩa của một từ theo ngữ cảnh thay đổi ",
    acceptCN: [" giải quyết ", " định cư ", " tìm chỗ cho ", " thanh toán "]
  },
  explanation: {
    pos: "n.",
    meaning: "n. Giải thích, Hướng dẫn, giải thích give an explanation; in explanation of; detailed explanation Động từ explain ",
    acceptCN: [" Giải thích ", " Hướng dẫn ", " giải thích "]
  },
  date: {
    pos: "n. / v.",
    meaning: "n. ① ngày tháng, thập kỷ của một thế kỷ(What's the date today?); ② cuộc hẹn; ③ táo tàu out of date(lỗi thời); up to date(mới nhất của) v. chỉ rõ ngày tháng; và...cuộc hẹn; đi ngược dòng đến(date from / back to) ",
    acceptCN: [" ngày tháng ", " cuộc hẹn ", " táo tàu "]
  },
  howl: {
    pos: "v. / n.",
    meaning: "v. / n. hú hét, tức giận gầm, khóc thương thảm thiết; cười phá lên(howl with laughter) gió, quái thú, người đều ổn sử dụng từ tượng thanh ",
    acceptCN: [" hú hét ", " tức giận gầm ", " khóc thương thảm thiết "]
  },
  match: {
    pos: "n. / v.",
    meaning: "n. ① cuộc thi(football match); ② phù hợp của người có thể vật(a good match); ③ que diêm(strike a match) v. phối hoặc kết hôn, phù hợp, Bỉ được dùng trong |(match with / match the requirements) ",
    acceptCN: [" cuộc thi ", " phối hoặc kết hôn ", " que diêm "]
  },
  conference: {
    pos: "n.",
    meaning: "n. cuộc họp, hội thảo, đại hội(so sánh trang trọng, quy mô luôn luôn lớn hơn meeting) attend a conference; press conference(họp báo); video conference ",
    acceptCN: [" cuộc họp ", " hội thảo ", " đại hội "]
  },
  float: {
    pos: "v. / n.",
    meaning: "v. nổi, trôi nổi, biến thể của |; nêu cách nghĩ thăm dò(float an idea) n. nổi vật; diễu hành xe diễu hành(parade float); phao Trái nghĩa sink ",
    acceptCN: [" nổi ", " trôi nổi ", " xe diễu hành "]
  },
  neighbour: {
    pos: "n.",
    meaning: "n. hàng xóm, hàng xóm; quốc gia láng giềng(neighbourhood khu nhà) Anh loại đánh vần neighbour; phong cách Mỹ neighbor next-door neighbour ",
    acceptCN: [" hàng xóm ", " hàng xóm "]
  },
  microwave: {
    pos: "n. / v.",
    meaning: "n. lò vi sóng; gợn sóng v. sử dụng lò vi sóng đun nóng microwave oven; heat sth in the microwave micro(nhỏ bé) + wave(Ba Lan) ",
    acceptCN: [" lò vi sóng ", " gợn sóng "]
  }
};

var html = fs.readFileSync(HTML, "utf8");
var m = html.match(/const wordData = (\[[\s\S]*?\]);/);
if (!m) throw new Error("wordData not found");
var words = Function("return (" + m[1] + ");")();
if (words.length !== EXCEL_ORDER.length) throw new Error("count " + words.length);
words.forEach(function (w, i) {
  if (w.word !== EXCEL_ORDER[i]) throw new Error("order @" + i + " " + w.word + " != " + EXCEL_ORDER[i]);
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
