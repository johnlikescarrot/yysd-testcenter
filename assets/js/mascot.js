/* =========================================================================
   mascot.js - Sida companion (Duolingo-style contextual reactions)
   ponytail: mock exams stay silent until score; study/practice get live hints
   ========================================================================= */
(function () {
  "use strict";

  if (document.body.dataset.noMascot != null) return;

  var ONBOARD_KEY = "yysd:mascot-onboarded";
  var OFF_KEY = "yysd:mascot-off";
  var IDLE_MS = 45000;
  var ONBOARD_STEPS = [
    " xin chào, tôi là suy nghĩ đạt tới, bạn của lỗi chủ đề gốc bạn tập ",
    " từ khu vực biến thể của từ, luyện tập khu vực tinh chất cười chiều dài khó biến thể của, câu hỏi từ đề thi các năm trước khu vực Cambridge câu hỏi từ đề thi các năm trước--điểm tôi tất cả có thể cho đề xuất ",
    " làm chủ đề biến thể cũ của | tôi có thể thời gian thực gửi thông tin phản hồi; bắt chước làm xong bài thi tôi có thể biến thể cũ của | bạn chơi lại ván cờ Band "
  ];

  var examPage = /exam\.html/.test(location.pathname);
  var examZone = null;
  var examSubject = null;
  var examTitle = null;
  var mounted = false;
  var onboardStep = 0;
  var onboardActive = false;

  function isOff() {
    try { return localStorage.getItem(OFF_KEY) === "1"; } catch (e) { return false; }
  }

  function enableMascot() {
    try { localStorage.removeItem(OFF_KEY); } catch (e) {}
    location.reload();
  }

  function mountRestore() {
    if (document.querySelector(".yysd-mascot-restore")) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "yysd-mascot-restore";
    btn.textContent = " triệu hồi suy nghĩ đạt tới ";
    btn.setAttribute("aria-label", " lại bắt đầu sử dụng suy nghĩ đạt tới học trợ lý ");
    btn.addEventListener("click", enableMascot);
    document.body.appendChild(btn);
  }

  if (isOff()) {
    window.YYSD_MASCOT = { enable: enableMascot, say: function () {}, configure: function () {} };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", mountRestore);
    } else {
      mountRestore();
    }
    return;
  }

  function sidaSvg(p) {
    var g = p + "b";
    var ink = "#5A7A8F";
    var brow = "#9BB5C4";
    var blush = "#FFB8C8";

    function blushPair(op) {
      op = op != null ? op : ".45";
      return '<ellipse class="sida-blush" cx="70" cy="124" rx="11" ry="6.5" fill="' + blush + '" opacity="' + op + '"/>' +
        '<ellipse class="sida-blush" cx="130" cy="124" rx="11" ry="6.5" fill="' + blush + '" opacity="' + op + '"/>';
    }

    function roundEye(cx, cy, opts) {
      opts = opts || {};
      var side = cx < 100 ? "l" : "r";
      var py = opts.py != null ? opts.py : cy + 1;
      var px = opts.px != null ? opts.px : cx;
      var pr = opts.pr != null ? opts.pr : 4.5;
      var hx = opts.hx != null ? opts.hx : cx + (cx < 100 ? 2.5 : -2.5);
      var hy = opts.hy != null ? opts.hy : cy - 2;
      return '<circle cx="' + cx + '" cy="' + cy + '" r="9" fill="#fff"/>' +
        '<circle class="sida-pupil sida-pupil-' + side + '" cx="' + px + '" cy="' + py + '" r="' + pr + '" fill="' + ink + '"/>' +
        '<circle cx="' + hx + '" cy="' + hy + '" r="1.8" fill="#fff"/>';
    }

    var body =
      '<ellipse class="sida-shadow" cx="100" cy="208" rx="40" ry="6" fill="#4AB5D8" opacity=".14"/>' +
      '<g class="sida-body">' +
        '<rect x="48" y="62" width="104" height="130" rx="24" fill="url(#' + g + ')"/>' +
        '<rect x="48" y="62" width="104" height="130" rx="24" fill="none" stroke="#fff" stroke-width="1.5" opacity=".28"/>' +
        '<rect x="48" y="182" width="104" height="10" rx="4" fill="#3A9CC4" opacity=".35"/>' +
        '<g class="sida-pages">' +
          '<path d="M138 58 L154 52 L156 88 L140 94 Z" fill="#F0EBE0"/>' +
          '<path d="M142 56 L158 50 L160 82 L144 88 Z" fill="#F7F3EA"/>' +
          '<line x1="146" y1="62" x2="154" y2="60" stroke="#D8E8F0" stroke-width="1"/>' +
          '<line x1="147" y1="68" x2="155" y2="66" stroke="#D8E8F0" stroke-width="1"/>' +
          '<line x1="148" y1="74" x2="156" y2="72" stroke="#D8E8F0" stroke-width="1"/>' +
          '<text class="sida-page-mark" x="150" y="80" font-size="9" fill="#C5D5DE" opacity=".7">×</text>' +
        '</g>' +
        '<g class="sida-note">' +
          '<rect x="136" y="44" width="24" height="24" rx="6" fill="#FFB4A2" transform="rotate(10 148 56)"/>' +
          '<text x="148" y="60" text-anchor="middle" font-size="13" font-weight="600" fill="#E89A88" transform="rotate(10 148 56)">?</text>' +
        '</g>' +
      '</g>';

    var faces =
      '<g class="sida-expr sida-expr--default">' +
        blushPair() +
        '<path class="sida-brow" d="M72 108 Q82 102 92 108" fill="none" stroke="' + brow + '" stroke-width="2" stroke-linecap="round"/>' +
        '<path class="sida-brow" d="M108 108 Q118 102 128 108" fill="none" stroke="' + brow + '" stroke-width="2" stroke-linecap="round"/>' +
        '<g class="sida-eye-wrap">' + roundEye(82, 118) + roundEye(118, 118) + '</g>' +
        '<path class="sida-mouth sida-mouth-line" d="M90 132 Q100 137 110 132" fill="none" stroke="' + ink + '" stroke-width="2.2" stroke-linecap="round"/>' +
      '</g>' +
      '<g class="sida-expr sida-expr--happy">' +
        blushPair(".55") +
        '<path class="sida-brow" d="M70 106 Q82 98 94 106" fill="none" stroke="' + brow + '" stroke-width="2" stroke-linecap="round"/>' +
        '<path class="sida-brow" d="M106 106 Q118 98 130 106" fill="none" stroke="' + brow + '" stroke-width="2" stroke-linecap="round"/>' +
        '<path class="sida-eye-l" d="M74 118 Q82 110 90 118" fill="none" stroke="' + ink + '" stroke-width="2.5" stroke-linecap="round"/>' +
        '<path class="sida-eye-r" d="M110 118 Q118 110 126 118" fill="none" stroke="' + ink + '" stroke-width="2.5" stroke-linecap="round"/>' +
        '<path class="sida-mouth" d="M86 130 Q100 142 114 130" fill="none" stroke="' + ink + '" stroke-width="2.6" stroke-linecap="round"/>' +
      '</g>' +
      '<g class="sida-expr sida-expr--comfort">' +
        blushPair(".4") +
        '<path class="sida-brow" d="M72 110 Q82 106 90 112" fill="none" stroke="' + brow + '" stroke-width="2" stroke-linecap="round"/>' +
        '<path class="sida-brow" d="M110 112 Q118 106 128 110" fill="none" stroke="' + brow + '" stroke-width="2" stroke-linecap="round"/>' +
        roundEye(82, 120, { py: 122, pr: 4 }) +
        roundEye(118, 120, { py: 122, pr: 4 }) +
        '<path class="sida-mouth" d="M90 134 Q100 138 110 134" fill="none" stroke="' + ink + '" stroke-width="2.2" stroke-linecap="round"/>' +
      '</g>';

    return '<svg class="sida-v4" viewBox="0 0 200 220" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><linearGradient id="' + g + '" x1="100" y1="62" x2="100" y2="192" gradientUnits="userSpaceOnUse">' +
      '<stop offset="0" stop-color="#C5EFFA"/><stop offset=".5" stop-color="#8ECAE6"/><stop offset="1" stop-color="#4AB5D8"/></linearGradient></defs>' +
      body + faces +
    '</svg>';
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function pageCtx() {
    var p = location.pathname;
    var q = new URLSearchParams(location.search);
    if (examPage) return { page: "exam", zone: examZone, subject: examSubject, title: examTitle };
    if (p.indexOf("zone.html") >= 0) return { page: "zone", zone: q.get("zone") || "mock" };
    if (p.indexOf("vocab-shelf.html") >= 0 || p.indexOf("vocab-learn.html") >= 0 ||
        p.indexOf("vocab-quiz.html") >= 0 || p.indexOf("vocab.html") >= 0) {
      return { page: "vocab", book: q.get("book") || "gaozhong" };
    }
    if (p.indexOf("results.html") >= 0) return { page: "results" };
    if (p.indexOf("index.html") >= 0 || p.endsWith("/") || p === "") return { page: "home" };
    return { page: "other" };
  }

  var TIPS = {
    home: [
      " học tá nền, luyện tập bướng bỉnh khả năng kỹ thuật, bắt chước thử thách thật chương--ba một bước đi biến thể của ổn định ",
      " Trang chủ A-Level khu vực thành lập cho mục đích nhất định có thể trực tiếp chọn dự thi hẹp biến thể cũ của môn học, câu hỏi từ đề thi các năm trước miễn phí xem trước tải xuống ",
      " IELTS chuyên biệt biến thể của | nhấn nghe quyển, Bỉ mù quáng chải biến thể cũ của | hiệu suất cao ",
      " Cambridge câu hỏi từ đề thi các năm trước biến thể của | Vol.19+ mới nhất sách bắt đầu bắt chước đánh, cảm nhận biến thể của tiếp cận phòng thi "
    ],
    study: [
      " trường trung học phổ thông biến thể của | biến thể cũ của cấp 4 biến thể của | tách ra chải, rời khỏi bùn tồn tại một dùng trong | LIST biến thể của | ",
      " biến thể của từ yêu cầu đồng thời vượt qua rào cản đánh vần biến thể cũ của nghĩa của cái gì đó, hai dùng trong | tất cả ghi chép chắc chắn khả năng coi như có thể ",
      " ngữ pháp tinh chất nói hoàn thành theo sảnh nhỏ khảo sát, lỗi chủ đề quay lại lại chăm sóc một lần phân tích ",
      " Nghe hiểu/Đọc hiểu/viết chuyên biệt biến thể của |, tương ứng với bạn chấp nhận yêu cầu tấn công của môn học ",
      " không có khả năng của biến thể cũ của | có thể tự động tiến lên lỗi chủ đề gốc, nhớ đi xem lại "
    ],
    practice: [
      " luyện tập khu vực có chiều dài khó biến thể của tháo rời biến thể cũ của thính giác tinh chất cười, chuyên biệt dùng trong và chia biến thể của nhanh ",
      " tinh chất cười gót chân dấu phẩy yêu cầu theo đuổi biến thể của vượt qua rào cản, chú ý đến nối âm, yếu dấu phẩy biến thể cũ của nuốt âm ",
      " chiều dài khó biến thể của trước cố gắng tìm thân chính, lại xé mở định ngữ, thành phần trạng ngữ biến thể cũ của cùng vị trí phương ngữ ",
      " đọc luyện tập cuộn lại nộp bài thi hoàng hậu có thể chăm sóc ghi điểm, viết tắt của bắt chước đánh cũng có thể luyện tập một kỹ năng cảm thấy "
    ],
    mock: [
      " câu hỏi từ đề thi các năm trước khu vực Cambridge IELTS thính giác đọc tán thành đo thời gian, càng nhiều càng tốt nhấn thật đánh nhịp điệu ",
      " đọc chủ đề có thể tô sáng, làm ghi chép lại, biến thể cũ của máy móc đánh thói quen giữ nhất quán ",
      " nộp bài thi hoàng hậu Band biến thể cũ của thành tích có thể ghi chép tồn tại«Kết quả của tôi» ",
      " giống hệt che đậy chủ đề có thể hai chải, so sánh hai tiếp theo ghi điểm chăm sóc tiến bộ ",
      "A-Level câu hỏi từ đề thi các năm trước tồn tại«Chương trình quốc tế»biến thể của |, biến thể cũ của IELTS khu vực được phân bổ lẫn nhau không bùn sử dụng "
    ],
    vocab: {
      gaozhong: [
        " trường trung học phổ thông biến thể của | nhấn LIST thúc đẩy, hoàn thành một dùng trong | thu hút một dùng trong | ",
        " kiểm tra chế độ huyện Huitong ở Huaihua | biến thể cũ của | đánh đánh vần biến thể cũ của ngôn ngữ Trung Quốc nghĩa của cái gì đó ",
        " lỗi biến thể cũ của | tự động thu vào lỗi chủ đề gốc, ngày hôm sau xem lại kết quả tốt nhất "
      ],
      cet4: [
        " cấp 4 biến thể của | đo lường biến thể cũ của IELTS có chồng chéo, tá tốt nền tảng cả hai đầu hưởng lợi từ ",
        " nghĩa của cái gì đó viết từ khóa tương đương với, không cần biến thể của hoàn chỉnh từ điển câu ví dụ ",
        " hôm nay mục tiêu: ổn định ổn định nhớ 15 cái, Bỉ có khao khát mãnh liệt nhiều thay đổi hoặc thay thế hiệu quả "
      ],
      special: [
        " chuyên biệt biến thể của | nhấn nghe chia đơn vị, như thế nào ngành học yếu trong trường hợp đó trước chải như thế nào ngành học ",
        " những... này biến thể cũ của | tồn tại Cambridge câu hỏi từ đề thi các năm trước biến thể của | xuất hiện tần số cao, đáng đọc cẩn thận và kỹ lưỡng ",
        " phù hợp giống môn học của bắt chước đánh/luyện tập, nhớ thay đổi hoặc thay thế chắc chắn "
      ]
    },
    results: [
      " thành tích đã đồng bộ cao trên mây, trao đổi thiết bị đăng ký hoàng hậu có thể tồn tại«Kết quả của tôi»xem xét ",
      "Band quỹ đạo có thể chăm sóc gần đây một vài lần bắt chước đánh xu hướng ",
      " ghi điểm thấp của môn học, đi luyện tập khu vực làm chuyên biệt thường thường Bỉ cứng làm nhiều câu hỏi luyện tập hiệu quả "
    ],
    general: [
      " mỗi ngày tinh chất cười 15 phút, Bỉ mù quáng chải ba che đậy đọc thay đổi hoặc thay thế hiệu quả ",
      " đọc trước chăm sóc chủ đề biến thể cũ của | lại định hướng, rời khỏi biến thể của | đầu tiên đoạn dấu phẩy đến đuôi ",
      " thính giác lấp chỗ trống công việc chú ý đến hóa đơn số nhiều, chữ hoa và chữ thường biến thể cũ của loại từ bị biến dạng ",
      " viết biến thể cũ của 5 phút kiểm tra đánh vần, thì biến thể cũ của chủ nói nhất quán ",
      " lời nói thông thường không phải biến thể của câu trả lời, là luyện tập lưu loát vượt qua biến thể cũ của quan điểm mở ra "
    ]
  };

  var HINT_LINES = {
    correct: [
      " Đúng rồi!! tiếp tục giữ ",
      " chính xác! này nắm bắt hoàn thành ",
      " xinh đẹp, xuống một chủ đề ổn định sống ",
      " chính xác này cảm giác, nhịp điệu tốt "
    ],
    "partial-spelling": [
      " ý nghĩa Đúng rồi!! đánh vần lại kiểm tra thử xem thứ tự chữ cái ",
      " ý tưởng nắm bắt hoàn thành, phong cách viết ghi chép một ghi chép trong trường hợp đó điểm tối đa ",
      " nghĩa của cái gì đó vượt qua rào cản, đánh vần xem | điểm, lại chăm sóc một cái nhìn "
    ],
    "partial-meaning": [
      " đánh vần Đúng rồi!! ngôn ngữ Trung Quốc nghĩa của cái gì đó lại nghĩ nghĩ ",
      " phong cách viết không vấn đề gì, ý nghĩa lại củng cố thử xem ",
      " chữ cái tất cả đúng, ý tưởng vẫn sự khác biệt một hơi "
    ],
    partial: [
      " tiếp cận hoàn thành, xem qua gửi thông tin phản hồi biến thể của | của chi tiết ",
      " một nửa Đúng rồi!, loài thú thần thoại tất cả đúng không xa ",
      " hướng Đúng rồi!, lại điều chỉnh thử xem "
    ],
    wrong: [
      " này chủ đề đáng tiến lên lỗi chủ đề gốc, trễ lại chải một lần ",
      " không sao đâu, làm hiểu Bỉ mưa phùn đúng thay đổi hoặc thay thế quan trọng ",
      " trước ký hiệu, đợi có thể biến thể của quay lại chơi lại ván cờ ",
      " lỗi hoàn thành trong trường hợp đó nhớ hoàn thành, lần tới chú ý đến "
    ],
    pass: [
      " vượt qua rào cản! này biến thể của gót chân dấu phẩy đến đúng vị trí hoàn thành ",
      " tinh chất cười đi qua, tiếp tục giữ này phương ngữ nhanh ",
      " cấu trúc nộp Trấn Thành Công hoặc trấn Chengkung ở huyện Đài Đông |, đối chiếu tham khảo toàn diện thử xem ",
      " ngữ pháp nhỏ khảo sát này chủ đề bắt giữ hoàn thành "
    ],
    fail: [
      " lại cười một lần, chú ý đến nối âm biến thể cũ của yếu dấu phẩy ",
      " chưa đạt tiêu chuẩn đặt ra, giảm tốc độ phương ngữ nhanh theo đuổi biến thể cũ của | gót chân dấu phẩy ",
      " chiều dài khó biến thể của rời khỏi khẩn cấp, trước giam giữ đi ra thân chính lại cố gắng tìm mệnh đề ",
      " lại xem qua phân tích, lần tới có thể thay đổi hoặc thay thế tốt "
    ]
  };

  var STREAK_CELEBRATE = [
    " ba liên kết đúng! tình trạng đến hoàn thành ",
    " kinh khủng, liên tục trả lời hoặc đáp lại câu hỏi của ai đó! ",
    " nhịp điệu tốt, giữ này cảm giác ",
    " liên kết đúng ba đường, hôm nay biến thể của | cảm giác đúng "
  ];

  var GREET_DEFAULTS = {
    home: [
      " xin chào, tôi là suy nghĩ đạt tới học, luyện tập, bắt chước đánh, tôi tất cả tồn tại ",
      " chào đón đến xuất sắc lợi ích suy nghĩ đạt tới chuẩn bị cho kỳ thi trên đường, bận việc gì đó điểm tôi trong trường hợp đó hàng "
    ],
    study: [
      " từ khu vực cuối cùng biến thể của |, Ngữ pháp, chuyên biệt biến thể cũ của |--tiến chắc chắn và đánh mạnh ",
      " trước noi gương tốt biến thể của | ngữ pháp, bắt chước đánh tài năng ổn định "
    ],
    practice: [
      " Khu vực luyện tập! tinh chất cười, Câu dài phức tạp, đọc cuộn lại, chuyên biệt dùng trong và chia ",
      " tập trung luyện tập Bỉ mù quáng làm nhiều câu hỏi luyện tập thay đổi hoặc thay thế hiệu quả, chọn một dùng trong | bắt đầu quán bar "
    ],
    mock: [
      " Khu vực đề thi Cambridge câu hỏi từ đề thi các năm trước đo thời gian luyện tập, nộp bài thi tự động ước lượng Band ",
      " tất cả thật môi trường luyện tập đầu tiên, Bỉ chải mười che đậy mảnh chủ đề hiệu quả "
    ],
    results: [
      " đến xem qua chiến công mỗi lần bắt chước đánh tất cả đáng ghi chép ",
      "Band quỹ đạo tồn tại này, tiến bộ rõ ràng ngay từ cái nhìn đầu tiên "
    ],
    vocab: {
      gaozhong: " trường trung học phổ thông biến thể của | LIST cuối cùng đánh vần biến thể cũ của nghĩa của cái gì đó tất cả yêu cầu vượt qua rào cản ",
      cet4: " cấp 4 biến thể của | luyện tập hôm nay trước thu lợi chắc chắn một xác minh lõi biến thể cũ của | ",
      special: " IELTS chuyên biệt biến thể của | nhấn môn học chải, hiệu suất thay đổi hoặc thay thế cao "
    }
  };

  function contextTips() {
    var ctx = pageCtx();
    if (ctx.page === "vocab") return TIPS.vocab[ctx.book] || TIPS.vocab.gaozhong;
    if (ctx.page === "zone" && TIPS[ctx.zone]) return TIPS[ctx.zone];
    if (ctx.page === "results") return TIPS.results;
    if (ctx.page === "home") return TIPS.home;
    if (ctx.page === "exam" && ctx.zone === "study") return TIPS.study;
    if (ctx.page === "exam" && ctx.zone === "practice") return TIPS.practice;
    return TIPS.general;
  }

  var host, bubble, state = "default";
  var queue = [], busy = false, idleTimer, lastAct = Date.now();
  var lastHintAt = 0;
  var correctStreak = 0;

  function mount() {
    if (mounted) return;
    mounted = true;
    host = document.createElement("div");
    host.className = "yysd-mascot";
    host.setAttribute("role", "complementary");
    host.setAttribute("aria-label", " suy nghĩ đạt tới học trợ lý ");
    host.dataset.state = "default";
    host.innerHTML =
      '<div class="yysd-mascot__bubble" id="sida-bubble" hidden>' +
        '<button type="button" class="yysd-mascot__min" aria-label=" nhận dậy bong bóng ">-</button>' +
        '<button type="button" class="yysd-mascot__close" aria-label=" đóng suy nghĩ đạt tới ">×</button>' +
        '<div class="yysd-mascot__head">' +
          '<b>suy nghĩ đạt tới</b><span class="yysd-mascot__streak" id="sida-streak" hidden></span>' +
        '</div>' +
        '<p id="sida-text"></p>' +
        '<button type="button" class="yysd-mascot__next" id="sida-next" hidden>Bước tiếp theo</button>' +
      '</div>' +
      '<button type="button" class="yysd-mascot__figure" id="sida-figure" aria-expanded="false" aria-label=" mở ra suy nghĩ đạt tới chỉ ra ">' +
        sidaSvg("widget") +
      '</button>';
    document.body.appendChild(host);
    bubble = host.querySelector("#sida-bubble");
    if (window.YYSD && YYSD.touchStreak) YYSD.touchStreak();
    updateStreakBadge();
    host.querySelector("#sida-figure").addEventListener("click", onTap);
    host.querySelector(".yysd-mascot__close").addEventListener("click", dismiss);
    host.querySelector(".yysd-mascot__min").addEventListener("click", closeBubble);
    host.querySelector("#sida-next").addEventListener("click", advanceOnboard);
    ["mousemove", "keydown", "scroll", "touchstart"].forEach(function (ev) {
      document.addEventListener(ev, poke, { passive: true });
    });
    resetIdle();
  }

  function updateStreakBadge() {
    if (!host) return;
    var el = host.querySelector("#sida-streak");
    if (!el) return;
    var Y = window.YYSD;
    if (!Y || !Y.touchStreak) { el.hidden = true; return; }
    var s = Y.touchStreak();
    if (s.visit >= 2) {
      el.textContent = "\uD83D\uDD25 " + s.visit;
      el.hidden = false;
    } else {
      el.hidden = true;
    }
  }

  function setState(s) {
    state = s || "default";
    if (!host) return;
    host.dataset.state = state;
    host.classList.toggle("is-expressive", state !== "default");
  }

  function bumpFigure() {
    if (!host) return;
    host.classList.remove("is-tapped");
    void host.offsetWidth;
    host.classList.add("is-tapped");
    clearTimeout(bumpFigure._t);
    bumpFigure._t = setTimeout(function () { host.classList.remove("is-tapped"); }, 360);
  }

  function closeBubble() {
    if (!host || !bubble) return;
    bubble.hidden = true;
    host.classList.remove("is-bubble-open", "is-minimized", "is-onboarding", "is-speaking");
    clearTimeout(drain._t);
    busy = false;
    queue.length = 0;
    setState("default");
    syncFigureAria();
    var nextBtn = host.querySelector("#sida-next");
    if (nextBtn) nextBtn.hidden = true;
  }

  function syncFigureAria() {
    var fig = host && host.querySelector("#sida-figure");
    if (!fig) return;
    var open = !bubble.hidden;
    fig.setAttribute("aria-expanded", open ? "true" : "false");
    fig.setAttribute("aria-label", open ? " nhận dậy suy nghĩ đạt tới chỉ ra " : " mở ra suy nghĩ đạt tới chỉ ra ");
  }

  function show(text, opts) {
    if (!mounted) mount();
    opts = opts || {};
    queue.push({
      text: text,
      state: opts.state || "default",
      ms: opts.ms != null ? opts.ms : 5000,
      pinned: !!opts.pinned,
      onboard: !!opts.onboard
    });
    if (!busy) drain();
  }

  function drain() {
    if (!queue.length) { busy = false; return; }
    busy = true;
    var item = queue.shift();
    setState(item.state);
    bubble.hidden = false;
    host.classList.remove("is-minimized");
    if (item.pinned) host.classList.add("is-bubble-open");
    else host.classList.remove("is-bubble-open");
    if (item.onboard) host.classList.add("is-onboarding");
    else host.classList.remove("is-onboarding");
    host.classList.toggle("is-speaking", !item.pinned && !item.onboard);
    host.querySelector("#sida-text").textContent = item.text;
    var nextBtn = host.querySelector("#sida-next");
    if (nextBtn) nextBtn.hidden = !item.onboard;
    syncFigureAria();
    clearTimeout(drain._t);
    if (item.pinned || item.onboard) { busy = false; return; }
    drain._t = setTimeout(function () {
      if (!queue.length) closeBubble();
      else setState("default");
      drain();
    }, item.ms);
  }

  function poke() { lastAct = Date.now(); resetIdle(); }

  function resetIdle() {
    if (examZone === "mock" || onboardActive) return;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () {
      if (Date.now() - lastAct < IDLE_MS - 500) return;
      show(idleLine(), { state: "wave", ms: 6000 });
    }, IDLE_MS);
  }

  function idleLine() {
    var ctx = pageCtx();
    var sub = ctx.subject || "";
    if (ctx.page === "exam") {
      if (ctx.zone === "study") {
        if (sub.indexOf("grammar") >= 0) return " ngữ pháp chủ đề chậm rãi nghĩ, ăn thâm nhập cùng nhau là cùng nhau ";
        if (sub.indexOf("vocab") >= 0) return " vẫn tồn tại biến thể của từ? lỗi biến thể cũ của | có thể tự động tiến lên lỗi chủ đề gốc ";
        return pick([" biến thể của | luyện tập rời khỏi đuổi kịp, đánh vần biến thể cũ của nghĩa của cái gì đó tất cả yêu cầu ổn định ", " từ khu vực tốc độ tiến triển có thể bảo tồn, hoàn thành nhớ hiểu sai những gì nhìn hoặc đọc chủ đề gốc "]);
      }
      if (ctx.zone === "practice") {
        if (sub === "jingting") return " tinh chất cười bị kẹt hoàn thành? trả lại một nửa nhanh lại gót chân một lần ";
        if (sub === "changnanju") return " chiều dài khó biến thể của trước cố gắng tìm mô hình câu chủ-vị-tân SVO hoặc câu chủ-vị-tân, rời khỏi chăn trang trí thành phần dọa đến ";
        return " chuyên biệt luyện tập đắt tồn tại kiên trì, lại luyện tập một dòng thơ? ";
      }
    }
    if (ctx.page === "zone") {
      if (ctx.zone === "mock") return pick([" tìm kiếm«Cambridge 19»«Test 1»có thể nhanh tìm thấy bánh hấp ", " bắt chước đánh nhớ mở đo thời gian, thói quen thật đánh nhịp điệu "]);
      if (ctx.zone === "practice") return " tinh chất cười biến thể cũ của chiều dài khó biến thể của tất cả tồn tại này, chọn một dùng trong | chuyên biệt bắt đầu ";
      if (ctx.zone === "study") return " trường trung học phổ thông biến thể cũ của |, cấp 4 biến thể cũ của |, chuyên biệt biến thể cũ của |--hôm nay nghĩ tấn công như thế nào cục? ";
    }
    if (ctx.page === "vocab") {
      if (ctx.book === "cet4") return " cấp 4 LIST thúc đẩy Trung Quốc? hôm nay nhớ 15 dùng trong | trong trường hợp đó gậy ";
      if (ctx.book === "special") return " chuyên biệt biến thể của | phù hợp giống môn học luyện tập, nhớ thay đổi hoặc thay thế chắc chắn ";
      return " trường trung học phổ thông biến thể của | tiến chắc chắn và đánh mạnh, lỗi chủ đề gốc nhớ xem lại ";
    }
    if (ctx.page === "results") return " có thể gánh bằng đòn gánh bộ chia thấp của bánh hấp, đi luyện tập khu vực sửa chuyên biệt ";
    return pick([" vẫn tồn tại gì?? điểm tôi giành được một dải chuẩn bị cho kỳ thi nhỏ mẹo ", " học·luyện tập·bắt chước đánh, bận việc gì đó bất kỳ lúc nào điểm tôi "]);
  }

  function onTap() {
    poke();
    bumpFigure();
    if (onboardActive) { advanceOnboard(); return; }
    if (!bubble.hidden) {
      closeBubble();
      return;
    }
    show(pick(contextTips()), { state: "happy", pinned: true });
  }

  function finishOnboard() {
    onboardActive = false;
    try { localStorage.setItem(ONBOARD_KEY, "1"); } catch (e) {}
    host.classList.remove("is-onboarding");
    var nextBtn = host.querySelector("#sida-next");
    if (nextBtn) nextBtn.hidden = true;
  }

  function advanceOnboard() {
    onboardStep++;
    if (onboardStep >= ONBOARD_STEPS.length) {
      finishOnboard();
      closeBubble();
      greet();
      return;
    }
    showOnboardStep(onboardStep);
  }

  function showOnboardStep(i) {
    onboardActive = true;
    var nextBtn = host.querySelector("#sida-next");
    if (nextBtn) {
      nextBtn.textContent = i >= ONBOARD_STEPS.length - 1 ? " OK! " : " Bước tiếp theo (" + (i + 1) + "/" + ONBOARD_STEPS.length + ")";
    }
    show(ONBOARD_STEPS[i], { state: i === 0 ? "wave" : "happy", pinned: true, onboard: true });
  }

  function needsOnboard() {
    if (examPage) return false;
    try { return !localStorage.getItem(ONBOARD_KEY); } catch (e) { return false; }
  }

  function runOnboard(done) {
    if (!needsOnboard()) { if (done) done(); return; }
    onboardStep = 0;
    showOnboardStep(0);
    runOnboard._done = done;
  }

  function dismiss() {
    if (onboardActive) finishOnboard();
    try { localStorage.setItem(OFF_KEY, "1"); } catch (e) {}
    host.classList.add("is-hidden");
    setTimeout(function () { host.remove(); mounted = false; mountRestore(); }, 400);
  }

  function streakMsg() {
    var Y = window.YYSD;
    if (!Y || !Y.touchStreak) return "";
    var s = Y.touchStreak();
    if (s.visit >= 7) return pick([" liên tục " + s.visit + " ngày, bạn là chuẩn bị cho kỳ thi chủ nhà không chịu dời đi mặc dù bị nhà phát triển bất động sản gây áp lực! ", " Thứ " + s.visit + " ngày chấm công vào, thói quen đã bồi dưỡng hoàn thành "]);
    if (s.visit >= 3) return pick([" liên tục " + s.visit + " ngày, giữ! ", " liên tục " + s.visit + " ngày đến hoàn thành, nhịp điệu tốt "]);
    if (s.visit === 2) return " liên tục 2 ngày đến hoàn thành, tốt thói quen! ";
    return "";
  }

  function greetDefault(key, book) {
    if (key === "vocab") {
      var v = GREET_DEFAULTS.vocab[book || "gaozhong"] || GREET_DEFAULTS.vocab.gaozhong;
      return typeof v === "string" ? v : pick(v);
    }
    return pick(GREET_DEFAULTS[key] || GREET_DEFAULTS.home);
  }

  function greet() {
    if (onboardActive) return;
    var ctx = pageCtx();
    var zone = ctx.zone || "mock";
    var key = ctx.page === "zone" ? (GREET_DEFAULTS[zone] ? zone : "mock") : ctx.page;
    if (key === "other") return;
    var st = { home: "wave", study: "default", practice: "default", mock: "default", results: "happy", vocab: "happy", zone: "default" };
    var stKey = key === "zone" ? zone : key;

    function deliver(line) {
      updateStreakBadge();
      var s = streakMsg();
      if (s) line = s + " " + line;
      show(line, { state: st[stKey] || "default", ms: stKey === "home" ? 6500 : 6000 });
    }

    var Y = window.YYSD;
    if (Y && Y.load && (key === "home" || key === "zone" || key === "results")) {
      var ctxPromise = key === "results"
        ? Promise.resolve().then(function () {
            return Y.mascotResultsLine(Object.keys(Y.results()).map(function (k) { return Y.results()[k]; }));
          })
        : Y.load().then(function (items) {
            return Y.mascotSmartLine ? Y.mascotSmartLine(items, key === "home" ? null : zone) : Y.mascotPathLine(items);
          });
      ctxPromise.then(function (ctxLine) {
        deliver(ctxLine || greetDefault(stKey, ctx.book));
      }).catch(function () { deliver(greetDefault(stKey, ctx.book)); });
      return;
    }
    deliver(greetDefault(stKey, ctx.book));
  }

  function examStartLine(zone, subject, title) {
    var sub = subject || "";
    var t = title ? "«" + title + "»" : "";
    if (zone === "study") {
      if (sub === "grammar") return " ngữ pháp tinh chất nói " + t + " bắt đầu hoàn thành, theo sảnh nhỏ khảo sát tôi biến thể cũ của | bạn nhìn chăm chú ";
      if (sub === "vocab-cet4") return " Từ vựng CET-4 " + t + ", đánh vần biến thể cũ của nghĩa của cái gì đó tất cả yêu cầu vượt qua rào cản ";
      if (sub.indexOf("vocab-special") === 0) return " chuyên biệt biến thể của | " + t + ", kết hợp môn học ghi chép thay đổi hoặc thay thế chắc chắn ";
      if (sub.indexOf("vocab") >= 0) return " biến thể của | " + t + " mở luyện tập, lỗi biến thể cũ của | có thể tự động tiến lên lỗi chủ đề gốc ";
      return pick([" học chế độ khởi động, tôi đi cùng bạn cùng nhau cùng nhau đến ", " bên học bên khảo sát, không có khả năng của ghi chép đi xuống "]);
    }
    if (zone === "practice") {
      if (sub === "jingting") return " tinh chất cười " + t + ", gót chân dấu phẩy vượt qua rào cản yêu cầu biến thể của | luyện tập, rời khỏi khẩn cấp ";
      if (sub === "changnanju") return " Câu dài phức tạp " + t + ", trước xé mở thân chính lại đúng văn bản dịch ";
      if (sub === "ielts") return " đọc luyện tập " + t + ", nhấn chủ đề biến thể cũ của | định hướng, rời khỏi đọc xuyên suốt toàn văn ";
      return " chuyên biệt luyện tập " + t + ", thay đổi về lượng tài năng thay đổi chất ";
    }
    return "";
  }

  function greetExamZone(zone) {
    var line = examStartLine(zone, examSubject, examTitle);
    if (!line) return;
    var st = zone === "practice" ? "think" : "happy";
    if (examSubject === "jingting") st = "think";
    show(line, { state: st, ms: 5500 });
  }

  function onHint(result) {
    if (examZone === "mock" || !result) return;
    var now = Date.now();
    if (now - lastHintAt < 1200) return;
    lastHintAt = now;

    var isCorrect = result === "correct" || result === "pass";
    if (isCorrect) {
      correctStreak++;
      if (correctStreak >= 3) {
        correctStreak = 0;
        show(STREAK_CELEBRATE[Math.floor(Math.random() * STREAK_CELEBRATE.length)],
          { state: "celebrate", ms: 3800 });
        return;
      }
    } else {
      correctStreak = 0;
    }

    var lines = HINT_LINES[result];
    if (!lines) return;
    var st = isCorrect ? "happy"
      : (result === "wrong" || result === "fail") ? "confused" : "think";
    show(lines[Math.floor(Math.random() * lines.length)], { state: st, ms: 3200 });
  }

  function onStudyScore(d) {
    if (d.wrongWords && d.wrongWords.length) {
      var n = d.wrongWords.length;
      show(pick([
        " Hoàn thành! có " + n + " dùng trong | lỗi biến thể cũ của | đã thu vào lỗi chủ đề gốc, đi xem lại thử xem quán bar ",
        n + " dùng trong | biến thể cũ của | tiến lên hoàn thành lỗi chủ đề gốc, ngày hôm sau lại chải một lần nhớ thay đổi hoặc thay thế chắc chắn ",
        " gốc bánh xe có " + n + " dùng trong | lỗi biến thể cũ của |, lỗi chủ đề gốc đã thay cũ đổi mới "
      ]), { state: "happy", ms: 6500 });
      return;
    }
    onScore(d);
  }

  function onScore(d) {
    if (d.score == null || d.total == null || !d.total) {
      show(pick([" hoàn thành hoàn thành! thành tích đã bảo tồn ", " nộp bài thi Trấn Thành Công hoặc trấn Chengkung ở huyện Đài Đông |, đi«Kết quả của tôi»xem qua quán bar "]), { state: "celebrate", ms: 6000 });
      return;
    }
    var ratio = d.score / d.total;
    var s = d.score + "/" + d.total;
    if (ratio >= 0.85) {
      show(pick([
        " cao nhất gậy hoàn thành! " + s + ", giữ này tình trạng ",
        s + ", hầu như tất cả đúng! có thể thử thách thay đổi hoặc thay thế khó của nội dung hoàn thành ",
        s + ", xinh đẹp! lỗi chủ đề lại băng qua một lần trong trường hợp đó ổn định hoàn thành "
      ]), { state: "celebrate", ms: 7000 });
    } else if (ratio >= 0.6) {
      show(pick([
        s + ", đúng xem qua lỗi chủ đề lại củng cố thử xem ",
        s + ", điểm hoặc vạch đạt mức đó hoặc cao hơn hoàn thành, nghiên cứu rò rỉ lấp chỗ trống vẫn có thể lại tăng ",
        s + ", có nền hoàn thành, chuyên biệt luyện tập có thể lại đẩy một cầm "
      ]), { state: "happy", ms: 6500 });
    } else {
      show(pick([
        s + ", rời khỏi nản lòng làm hiểu lỗi chủ đề tỷ số đếm thay đổi hoặc thay thế quan trọng ",
        s + ", trước chơi lại ván cờ lỗi chủ đề, Bỉ một cách khẩn trương chải xuống bộ hiệu quả ",
        s + ", yếu điểm tìm thấy hoàn thành, đi luyện tập khu vực sửa chuyên biệt thử thử "
      ]), { state: "confused", ms: 7000 });
    }
  }

  function mockSkillTip(d, band, ratio) {
    var sub = String(d.subject || "");
    var low = (band != null && !isNaN(band) && band < 6.5) || (ratio != null && ratio < 0.65);
    if (sub.indexOf("listening") >= 0) {
      return pick(low ? [
        " Nghe hiểu: đánh vần biến thể cũ của hóa đơn số nhiều là mất chia khu vực bị thiên tai nặng nề, tinh chất cười gót chân dấu phẩy hữu ích ",
        " Nghe hiểu: Section 4 học thuật biến thể cũ của | nhiều cười bàn nhỏ biến thể của, đi luyện tập khu vực tinh chất cười sửa thử xem "
      ] : [
        " Nghe hiểu: nhịp điệu đúng, giữ dự đoán xuống một chủ đề chủ đề khuôn ",
        " Nghe hiểu: đánh vần ổn định sống hoàn thành, lần tới thử thử thay đổi hoặc thay thế cao sách của Cambridge chủ đề "
      ]);
    }
    if (sub.indexOf("reading") >= 0) {
      return pick(low ? [
        " Đọc hiểu: lỗi chủ đề định hướng biến thể cũ của | lại cố gắng tìm một lần, rời khỏi đọc xuyên suốt toàn văn ",
        " Đọc hiểu: thời gian chặt trong trường hợp đó trước Bulgaria đơn giản chủ đề, phán đoán/lấp chỗ trống công việc có ưu tiên "
      ] : [
        " Đọc hiểu: định hướng chính xác, Lưu ý Passage 3 của thời gian phân phối ",
        " Đọc hiểu: phát huy đúng, thử thử đặt giới hạn thời gian chải xuống bộ giữ cảm giác "
      ]);
    }
    if (sub.indexOf("writing") >= 0) {
      return pick(low ? [
        " Viết: kiểm tra đoạn cấu trúc biến thể cũ của liên kết biến thể cũ của |, Bỉ chất đống biến thể cũ của | thay đổi hoặc thay thế quan trọng ",
        " Viết: Task 2 trước sắp xếp dàn ý lại bắt đầu viết hoặc vẽ, logic Bỉ tu từ quan trọng "
      ] : [
        " Viết: cấu trúc rõ ràng, lần tới thử thử thay đổi hoặc thay thế cấp cao của chứng minh một quan điểm ",
        " Viết: diễn đạt ổn định sống hoàn thành, chú ý đến số lượng ký tự viết biến thể cũ của đoạn bằng nhau "
      ]);
    }
    if (sub.indexOf("speaking") >= 0) {
      return low ? " Nói: lưu loát vượt qua có ưu tiên, quan điểm mở ra sử dụng because / for example thiết lập mối quan hệ "
        : " Nói: diễn đạt trôi chảy, lần tới thử thử thay đổi hoặc thay thế phức tạp nếu dòng đề tặng chuyển tiền ";
    }
    return "";
  }

  function onMockScore(d) {
    mount();
    var line, st = "happy", tip = "";
    var band = d.band != null ? Number(d.band) : null;
    var ratio = (d.score != null && d.total) ? d.score / d.total : null;

    if (band != null && !isNaN(band)) {
      if (band >= 7.5) { line = pick(["Band " + band + ", rất đáng chú ý! ", "Band " + band + ", ổn định hoàn thành! giữ nhịp điệu "]); st = "celebrate"; }
      else if (band >= 6.5) { line = pick(["Band " + band + ", đạt tiêu chuẩn đặt ra hoàn thành ", "Band " + band + ", đúng, tiếp tục củng cố điểm yếu của một người "]); st = "happy"; }
      else if (band >= 5.5) { line = pick(["Band " + band + ", có tiến bộ không gian ", "Band " + band + ", điểm yếu của một người cố gắng tìm cho phép hoàn thành trong trường hợp đó có thể lại tăng "]); st = "default"; }
      else { line = pick(["Band " + band + ", rời khỏi nản lòng, chơi lại ván cờ Bỉ làm nhiều câu hỏi luyện tập quan trọng ", "Band " + band + ", trước làm hiểu lỗi chủ đề, điểm có thể theo kịp "]); st = "confused"; }
    } else if (d.score != null && d.total) {
      line = d.score + "/" + d.total + " Hoàn thành ";
      if (ratio >= 0.85) { line += pick([" thể hiện tốt! ", " tiếp cận điểm tối đa cảm giác! "]); st = "celebrate"; }
      else if (ratio >= 0.6) { line += pick([" đúng, tiếp tục củng cố ", " có nền, chuyên biệt vẫn có thể lại đẩy "]); st = "happy"; }
      else { line += pick([" xem qua lỗi ghi chú tách ", " đi luyện tập khu vực sửa thử xem yếu sau cổ "]); st = "confused"; }
    } else {
      line = pick([" bắt chước làm xong bài thi thành công, thành tích đã bảo tồn ", " nộp bài thi Trấn Thành Công hoặc trấn Chengkung ở huyện Đài Đông |! đi«Kết quả của tôi»chăm sóc chi tiết "]);
      st = "celebrate";
    }

    tip = mockSkillTip(d, band, ratio);
    if (tip) line += " " + tip;
    else line += pick([" đi«Kết quả của tôi»xem xét chi tiết ", " thành tích tồn tại«Kết quả của tôi»biến thể của |, bất kỳ lúc nào có thể chơi lại ván cờ "]);

    show(line, { state: st, ms: 10000 });
  }

  function onTimer(level) {
    if (examZone === "mock") return;
    if (level === "danger") {
      show(pick([
        " thời gian không nhiều hoàn thành! nắm chắc kiểm tra hình thức gắn liền có nghĩa giống như từ tự do chủ đề dừng ",
        " cuối cùng 1 phút! chưa viết của trước đoán dùng trong |, rời khỏi chừa trống trong tài liệu ",
        " nhanh nộp bài thi hoàn thành, xác nhận chủ đề gầm Có ... không? bôi lỗi hàng "
      ]), { state: "panic", ms: 5000 });
    } else if (level === "low") {
      show(pick([
        " vẫn còn lại không đến 5 phút, chú ý thử xem nhịp điệu ",
        " thời gian nghiêng chặt, có ưu tiên làm có nắm bắt của chủ đề ",
        "5 phút đếm ngược, đọc chủ đề rời khỏi tồn tại cùng nhau vấn đề khó dùng trong | lãng phí cao nhất thời gian "
      ]), { state: "confused", ms: 4500 });
    }
  }

  function configure(detail) {
    examZone = (detail && detail.zone) || null;
    examSubject = (detail && detail.subject) || null;
    examTitle = (detail && detail.title) || null;
    if (examZone === "mock") return;
    mount();
    greetExamZone(examZone);
    resetIdle();
  }

  function revealMockScore(d) {
    examZone = "mock";
    mount();
    if (host) {
      host.classList.add("is-ceremony");
      setTimeout(function () { host.classList.remove("is-ceremony"); }, 900);
    }
    onMockScore(d || {});
  }

  function boot() {
    mount();
    if (needsOnboard()) {
      runOnboard(greet);
    } else {
      greet();
    }
  }

  window.YYSD_MASCOT = {
    say: show,
    enable: enableMascot,
    configure: configure,
    revealScore: revealMockScore,
    react: function (type, data) {
      if (type === "score") {
        if (examZone === "mock" || (data && data.zone === "mock")) revealMockScore(data);
        else if (examZone === "study") onStudyScore(data || {});
        else onScore(data || {});
      } else if (type === "timer") onTimer(data);
      else if (type === "hint") onHint(data);
      else if (type === "tip") onTap();
    }
  };

  window.addEventListener("message", function (e) {
    var d = e.data;
    if (!d) return;
    if (d.type === "yysd:mascot-hint") { onHint(d.result); return; }
    if (d.type !== "yysd:score") return;
    if (examPage && examZone === "mock") return;
    else if (examPage && examZone === "study") onStudyScore(d);
    else if (examPage) onScore(d);
    else onScore(d);
  });

  document.addEventListener("yysd:mascot", function (e) {
    var d = e.detail || {};
    if (d.type === "config") configure(d);
    else if (d.type === "reveal") revealMockScore(d);
    else if (d.type === "hint") onHint(d.result);
    else if (d.type === "score") {
      if (examZone === "mock") revealMockScore(d);
      else if (examZone === "study") onStudyScore(d);
      else onScore(d);
    } else if (d.type === "timer") onTimer(d.level);
    else if (d.text) show(d.text, d);
  });

  document.addEventListener("yysd:mascot-config", function (e) { configure(e.detail || {}); });
  document.addEventListener("yysd:mascot-reveal", function (e) { revealMockScore(e.detail || {}); });

  if (!examPage) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  }
})();
