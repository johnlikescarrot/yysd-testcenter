/* =========================================================================
   mascot.js — Sida companion (Duolingo-style contextual reactions)
   ponytail: mock exams stay silent until score; study/practice get live hints
   ========================================================================= */
(function () {
  "use strict";

  if (document.body.dataset.noMascot != null) return;

  var ONBOARD_KEY = "yysd:mascot-onboarded";
  var OFF_KEY = "yysd:mascot-off";
  var IDLE_MS = 45000;
  var ONBOARD_STEPS = [
    "xin chào,tôi là chỉ theo sau bởi danh từ suy nghĩ họ,bạnSổ lỗi saibạn tập.",
    "Khu vực Từ vựngbiến thể củaTừ vựng,Khu vực Luyện tậptinh chất cười cổ đại chiều dài khó để biến thể của,Khu vực Đề thi thậtkiếm hai lưỡi cầuĐề thi thật——điểm tôi họ họ cung cấpGợi ý.",
    "làm họ biến thể cũ của tôi có thểtheo thời gian thựcPhản hồi;Thi thửhoàn thành tôi có thể biến thể cũ của bạnsau khi hoàn thành ván cờ chơi lại ván cờ Band."
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
    btn.textContent = "triệu hồisuy nghĩ họ";
    btn.setAttribute("aria-label", "lạibắt đầu sử dụngsuy nghĩ họhọctrợ lý");
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
      "họctá từ mượnCơ bản,Luyện tậphọKỹ năng,Thi thửbiến thể của thật họ——họ họ đi biến thể của ổn định.",
      "Trang chủ A-Level khu vực thành lập cho mục đích nhất địnhtiền tố có thểtrực tiếpchọnKì thihẹp biến thể cũ củamôn học,Đề thi thậtmiễn phíxem trướcTải xuống.",
      "IELTS Hệ thống Kiểm tra Tiếng Anh Quốc tếchuyên biệtTừ vựngnhấnnghe nóiđọc và viếtquyển,Bỉmù quángchải biến thể cũ củahiệu suấthọ.",
      "kiếm hai lưỡi cầuĐề thi thậtbiến thể của Vol.19+ mới nhấtsáchBắt đầuThi thử,cảm nhậnbiến thể củatiếp cậnPhòng thi."
    ],
    study: [
      "trường trung học phổ thôngTừ vựngbiến thể cũ củacấp 4Từ vựngtách rachải,họ bùn tồn tại một dùng trong LIST biến thể của.",
      "biến thể củaTừ vựnghình thức kết hợp yêu cầuđồng thờivượt qua rào cảnđánh vầnbiến thể cũ củaNghĩa,dùng trong họ ghi chép chắc chắn khả năng coi như có thể.",
      "Ngữ pháptinh chất nóihoàn thànhhọ chính sảnh nhỏ khảo sát,Câu saiquay lạilại chăm sócmột lần từ đầu đến cuốiGiải thích.",
      "Nghe/Đọc/Viếtchuyên biệtTừ vựng,tương ứng vớibạnchấp nhậnhình thức kết hợp yêu cầu tấn côngmôn học.",
      "không có khả năngbiến thể cũ của có thểtự độngtiến lênSổ lỗi sai,nhớđiÔn tập."
    ],
    practice: [
      "Khu vực Luyện tậpcó chiều dài khó để biến thể củatháo rờibiến thể cũ củaNghetinh chất cười cổ đại,chuyên biệtdùng trong và phần biến thể của.",
      "tinh chất cười cổ đại gót chân dấu phẩy hình thức kết hợp yêu cầu hình thức kết hợp theo đuổi biến thể củavượt qua rào cản,chú ý đếnnối âm trong ngữ âm học,yếu dấu phẩy biến thể cũ củangôn ngữ học nuốt âm.",
      "chiều dài khó để biến thể của trước cố gắng tìmthân chính,lại xé mởđịnh ngữ,thành phần trạng ngữ trạng từ hoặc mệnh đề trạng ngữbiến thể cũ củacùng vị tríphương ngữ.",
      "ĐọcLuyện tậpcuộn lạiNộp bàihọcó thểchăm sócĐiểm số,viết tắt củaThi thửhọluyện tập một kỹ năngcảm thấy."
    ],
    mock: [
      "Khu vực Đề thi thậtCambridge IELTSNgheĐọctán thànhđo thời gian,càng nhiều càng tốtnhấn thật đánhnhịp điệu.",
      "Đọchọ tiền tố có thểtô sáng tin học,làmGhi chú,biến thể cũ của họ đánhthói quengiữnhất quán.",
      "Nộp bàihọ Band biến thể cũ củaKết quảcó thể ghi chép tồn tại«Kết quả của tôi».",
      "giống hệtche đậy họcó thểchải,so sánhtiếp theoĐiểm sốchăm sóctiến bộ.",
      "A-Level Đề thi thậttồn tại«Chương trình quốc tế»biến thể của,biến thể cũ củaIELTS Hệ thống Kiểm tra Tiếng Anh Quốc tếkhu vực được phân bổ cho nhà ởlẫn nhau không bùn sử dụng."
    ],
    vocab: {
      gaozhong: [
        "trường trung học phổ thôngTừ vựngnhấn LIST thúc đẩy,Hoàn thànhmột dùng trong họ một dùng trong.",
        "Bài kiểm trachế độhuyện Huitong ở Huaihuabiến thể cũ của đánhđánh vầnbiến thể cũ củaTiếng TrungNghĩa.",
        "họ biến thể cũ củatự độngthu vàoSổ lỗi sai,ngày hôm sauÔn tậpkết quảtốt nhất."
      ],
      cet4: [
        "cấp 4Từ vựngđo lường biến thể cũ củaIELTS Hệ thống Kiểm tra Tiếng Anh Quốc tếcóchồng chéo,tá từ mượn tốtnền tảngcả hai đầuhưởng lợi từ.",
        "Nghĩaviếttừ khóatương đương với,không cầnbiến thể củahoàn chỉnhtừ điểncâu ví dụ.",
        "hôm nayMục tiêu:ổn định ổn địnhnhớ 15 dùng trong,Bỉ có khao khát mãnh liệt nhiều thay đổi hoặc thay thếhiệu quả."
      ],
      special: [
        "chuyên biệtTừ vựngnhấnnghe nóiđọc và viếtphầnBài,như thế nào ngành học yếu sau một mệnh đề giả định trong trường hợp đó trước chải như thế nào ngành học.",
        "những... nàybiến thể cũ của tồn tại kiếm hai lưỡi cầuĐề thi thậtbiến thể củaxuất hiệntần sốhọ,đángđọc cẩn thận và kỹ lưỡng.",
        "phù hợpgiốngmôn họcThi thử/Luyện tập,nhớthay đổi hoặc thay thế chắc chắn."
      ]
    },
    results: [
      "Kết quảđãđồng bộcao trên mây,trao đổithiết bịĐăng nhậphọ tiền tố có thể tồn tại«Kết quả của tôi»Xem.",
      "Band quỹ đạohọ chăm sócgần đâymột vài lầnThi thửxu hướng.",
      "Điểm sốthấpmôn học,điKhu vực Luyện tậplàmchuyên biệtthường thườngBỉ cứnglàm nhiều câu hỏi luyện tập để chuẩn bị cho kỳ thihiệu quả."
    ],
    general: [
      "mỗi ngàytinh chất cười cổ đại 15 phút,Bỉmù quángchải họ che đậyĐọcthay đổi hoặc thay thếhiệu quả.",
      "Đọctrước chăm sóc họ biến thể cũ của lạiVị trí,họ biến thể củađầu tiênhọ dấu phẩy đến đuôi.",
      "NgheĐiền khuyếtchú ý đếnhọngôn ngữ học số nhiều,chữ hoa và chữ thườngbiến thể cũ củaloại từ danh từbị biến dạng.",
      "Viếtbiến thể cũ của 5 phútkiểm trađánh vần,thì của động từbiến thể cũ của chủ họnhất quán.",
      "Nóikhông phảibiến thể củaĐáp án,là chỉ theo sau bởi danh từ luyện tậplưu loátvượt qua biến thể cũ củaQuan điểmmở ra."
    ]
  };

  var HINT_LINES = {
    correct: [
      "Đúng rồi!!Tiếp tụcgiữ.",
      "chính xác!đại từ nàyThành thạo.",
      "xinh đẹp,Câu sauổn định sống.",
      "chính xácđại từ nàycảm giác,nhịp điệuphó từ mức độ tốt."
    ],
    "partial-spelling": [
      "ý nghĩa hàm chứa trong một cụm từĐúng rồi!!đánh vầnlạikiểm tradùng sau động từ thử xemthứ tự chữ cái.",
      "ý tưởngThành thạo,phong cách viết phong cách văn họcghi chép một ghi chép sau một mệnh đề giả định trong trường hợp đóđiểm tối đa.",
      "Nghĩavượt qua rào cản,đánh vầnsự khác biệtmột chút,lại chăm sócmột cái nhìn."
    ],
    "partial-meaning": [
      "đánh vầnĐúng rồi!!Tiếng TrungNghĩalại nghĩ về nghĩ về.",
      "phong cách viết phong cách văn họckhông vấn đề gì,ý nghĩa hàm chứa trong một cụm từlạicủng cốdùng sau động từ thử xem.",
      "chữ cái của bảng chữ cáihọ đúng,ý tưởnghọ sự khác biệtmột hơi."
    ],
    partial: [
      "tiếp cận,xem quaPhản hồibiến thể củaChi tiết.",
      "một nửaĐúng rồi!,loài thú thần thoại cổ họ đúng không tự tạo khoảng cách văn cổ.",
      "hướngĐúng rồi!,lạiđiều chỉnhdùng sau động từ thử xem."
    ],
    wrong: [
      "đại từ này họđángtiến lênSổ lỗi sai,tàu xelại chảimột lần từ đầu đến cuối.",
      "không sao đâu,làm hiểu Bỉ mưa phùn đúng thay đổi hoặc thay thếquan trọng.",
      "trướcký hiệu,đợi có thể biến thể củaquay lạisau khi hoàn thành ván cờ chơi lại ván cờ.",
      "họ sau một mệnh đề giả định trong trường hợp đónhớ,lần tớichú ý đến."
    ],
    pass: [
      "vượt qua rào cản!đại từ này biến thể của gót chân dấu phẩyđến đúng vị trí.",
      "tinh chất cười cổ đạiđi qua,Tiếp tụcgiữđại từ nàyphương ngữ.",
      "cấu trúcNộp bàiThành công,Đối chiếutham khảohệ thốngdùng sau động từ thử xem.",
      "Ngữ phápnhỏ khảo sát đại từ này họbắt giữ."
    ],
    fail: [
      "lại cười cổ đạimột lần từ đầu đến cuối,chú ý đếnnối âm trong ngữ âm họcbiến thể cũ của yếu dấu phẩy.",
      "tiền tố phủ định cho động từ chưađạt tiêu chuẩn đặt ra,giảm tốc độ cử độngphương ngữ hình thức kết hợp theo đuổi biến thể cũ của gót chân dấu phẩy.",
      "chiều dài khó để biến thể của họ khẩn cấp,trước giam giữ đi rathân chínhlại cố gắng tìmmệnh đề.",
      "lạixem quaGiải thích,lần tớicó thể thay đổi hoặc thay thế tốt."
    ]
  };

  var STREAK_CELEBRATE = [
    "họ họ đúng!tình trạngđến.",
    "dùng để mô tả ai đó hoặc điều gì đó gây ấn tượng mạnh,Liên tiếpthường dùng ở dạng phủ định trả lời hoặc đáp lại câu hỏi của ai đó!",
    "nhịp điệuphó từ mức độ tốt,giữđại từ nàycảm giác khi chạm tay vào thứ gì đó.",
    "họ đúng họ đường,hôm nayTừ vựngcảm giác khi chạm tay vào thứ gì đóđúng."
  ];

  var GREET_DEFAULTS = {
    home: [
      "xin chào,tôi là chỉ theo sau bởi danh từ suy nghĩ họ.học,Luyện tập,Thi thử,tôi họ tồn tại.",
      "chào đónđếnYYSD.chuẩn bị cho kỳ thitrên đường,bận việc gì đóđiểm tôi sau một mệnh đề giả định trong trường hợp đó hàng."
    ],
    study: [
      "Khu vực Từ vựngcuối cùng.Từ vựng,Ngữ pháp,chuyên biệtbiến thể cũ của——tiến chắc chắn và đánh mạnh trong chiến đấu.",
      "trướcnoi gương tốtTừ vựngNgữ pháp,Thi thửtài năngổn định."
    ],
    practice: [
      "Khu vực Luyện tập!tinh chất cười cổ đại,chiều dài khó để biến thể của,Đọccuộn lại,chuyên biệtdùng trong và phần.",
      "tập trungLuyện tậpBỉmù quánglàm nhiều câu hỏi luyện tập để chuẩn bị cho kỳ thithay đổi hoặc thay thếhiệu quả,chọn một dùng trongBắt đầuquán bar từ mượn phục vụ đồ uống."
    ],
    mock: [
      "Khu vực Đề thi thật.kiếm hai lưỡi cầuĐề thi thậtđo thời gianluyện tập,Nộp bàitự độngước lượng Band.",
      "họ thậtMôi trườngluyện tậpđầu tiên,Bỉ chải mười che đậymảnhhọhiệu quả."
    ],
    results: [
      "đếnxem quachiến công.mỗi lầnThi thửhọđángghi chép.",
      "Band quỹ đạotồn tại đại từ này,tiến bộrõ ràng ngay từ cái nhìn đầu tiên thành ngữ."
    ],
    vocab: {
      gaozhong: "trường trung học phổ thôngTừ vựng LIST cuối cùng.đánh vầnbiến thể cũ củaNghĩahọ hình thức kết hợp yêu cầuvượt qua rào cản.",
      cet4: "cấp 4Từ vựngLuyện tập.hôm naytrướcthu lợi chắc chắnmột xác minhlõibiến thể cũ của.",
      special: "IELTS Hệ thống Kiểm tra Tiếng Anh Quốc tếchuyên biệtTừ vựng.nhấnmôn họcchải,hiệu suấtthay đổi hoặc thay thế họ."
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
    host.setAttribute("aria-label", "suy nghĩ họhọctrợ lý");
    host.dataset.state = "default";
    host.innerHTML =
      '<div class="yysd-mascot__bubble" id="sida-bubble" hidden>' +
        '<button type="button" class="yysd-mascot__min" aria-label="nhận dậybong bóng">—</button>' +
        '<button type="button" class="yysd-mascot__close" aria-label="Đóngsuy nghĩ họ">×</button>' +
        '<div class="yysd-mascot__head">' +
          '<b>suy nghĩ họ</b><span class="yysd-mascot__streak" id="sida-streak" hidden></span>' +
        '</div>' +
        '<p id="sida-text"></p>' +
        '<button type="button" class="yysd-mascot__next" id="sida-next" hidden>Bước tiếp theo</button>' +
      '</div>' +
      '<button type="button" class="yysd-mascot__figure" id="sida-figure" aria-expanded="false" aria-label="mở rasuy nghĩ họGợi ý">' +
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
    fig.setAttribute("aria-label", open ? "nhận dậy suy nghĩ họGợi ý" : "mở rasuy nghĩ họGợi ý");
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
        if (sub.indexOf("grammar") >= 0) return "Ngữ pháphọchậm rãinghĩ về,ăn hình thức kết hợp thâm nhậpcùng nhaulà chỉ theo sau bởi danh từcùng nhau.";
        if (sub.indexOf("vocab") >= 0) return "họ tồn tại biến thể củaTừ vựng?họ biến thể cũ của có thểtự độngtiến lênSổ lỗi sai.";
        return pick(["Từ vựngLuyện tậphọ đuổi kịp,đánh vầnbiến thể cũ củaNghĩahọ hình thức kết hợp yêu cầu ổn định.", "Khu vực Từ vựngTiến độcó thểLưu,hoàn thànhnhớhiểu sai những gì nhìn hoặc đọchọ hình thức kết hợp gốc."]);
      }
      if (ctx.zone === "practice") {
        if (sub === "jingting") return "tinh chất cười cổ đạibị kẹt?trả lại một món đồmột nửa lại gót chânmột lần từ đầu đến cuối.";
        if (sub === "changnanju") return "chiều dài khó để biến thể của trước cố gắng tìm chủ họ khách mời,họ chăntrang tríthành phầndọa đến.";
        return "chuyên biệtLuyện tậpđắt tồn tạikiên trì,lại luyện tậpmột dòng thơ?";
      }
    }
    if (ctx.page === "zone") {
      if (ctx.zone === "mock") return pick(["tìm kiếm«Cambridge 19»«Test 1»họtìm thấybánh hấp.", "Thi thửnhớmở ngoại động từ hoặc nội động từđo thời gian,thói quenthật đánhnhịp điệu."]);
      if (ctx.zone === "practice") return "tinh chất cười cổ đại biến thể cũ của chiều dài khó để biến thể của họ tồn tại đại từ này,chọn một dùng trongchuyên biệtBắt đầu.";
      if (ctx.zone === "study") return "trường trung học phổ thôngbiến thể cũ của,cấp 4biến thể cũ của,chuyên biệtbiến thể cũ của——hôm naynghĩ về tấn công như thế nào cục?";
    }
    if (ctx.page === "vocab") {
      if (ctx.book === "cet4") return "cấp 4 LIST thúc đẩyhình thức kết hợp Trung Quốc?hôm naynhớ 15 dùng trong sau một mệnh đề giả định trong trường hợp đó phó từ mức độ gậy.";
      if (ctx.book === "special") return "chuyên biệtTừ vựngphù hợpgiốngmôn họcLuyện tập,nhớthay đổi hoặc thay thế chắc chắn.";
      return "trường trung học phổ thôngTừ vựngtiến chắc chắn và đánh mạnh trong chiến đấu,Sổ lỗi sainhớÔn tập.";
    }
    if (ctx.page === "results") return "có thểgánh bằng đòn gánhbộphần thấpbánh hấp,điKhu vực Luyện tậpsửachuyên biệt.";
    return pick(["họ tồn tại thông tục gì??điểm tôigiành đượcmột dảichuẩn bị cho kỳ thinhỏtừ mượn mẹo.", "học·Luyện tập·Thi thử,bận việc gì đóbất kỳ lúc nàođiểm tôi."]);
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
      nextBtn.textContent = i >= ONBOARD_STEPS.length - 1 ? "biết" : "Bước tiếp theo (" + (i + 1) + "/" + ONBOARD_STEPS.length + ")";
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
    if (s.visit >= 7) return pick(["Liên tiếp " + s.visit + " ngày,bạn là chỉ theo sau bởi danh từchuẩn bị cho kỳ thiđinhmột hộ gia đình!", " " + s.visit + " ngàynhân viên chấm công vào hoặc ra,thói quenđãbồi dưỡng."]);
    if (s.visit >= 3) return pick(["Liên tiếp " + s.visit + " ngày,giữ!", "Liên tiếp " + s.visit + " ngày đến,nhịp điệuphó từ mức độ tốt."]);
    if (s.visit === 2) return "Liên tiếp 2 ngày đến,tốtthói quen!";
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
      if (sub === "grammar") return "Ngữ pháptinh chất nói" + t + "Bắt đầu,họ chính sảnh nhỏ khảo sát tôi biến thể cũ của bạn nhìn chăm chú.";
      if (sub === "vocab-cet4") return "cấp 4Từ vựng" + t + ",đánh vầnbiến thể cũ củaNghĩahọ hình thức kết hợp yêu cầuvượt qua rào cản.";
      if (sub.indexOf("vocab-special") === 0) return "chuyên biệtTừ vựng" + t + ",kết hợpmôn họcghi chép thay đổi hoặc thay thế chắc chắn.";
      if (sub.indexOf("vocab") >= 0) return "Từ vựng" + t + "mở ngoại động từ hoặc nội động từ luyện tập,họ biến thể cũ của có thểtự độngtiến lênSổ lỗi sai.";
      return pick(["họcchế độkhởi động một máy,tôi đi cùng bạncùng nhaucùng nhauđến.", "bên học bên khảo sát,không có khả năngghi chépđi xuống."]);
    }
    if (zone === "practice") {
      if (sub === "jingting") return "tinh chất cười cổ đại" + t + ",gót chân dấu phẩyvượt qua rào cảnhình thức kết hợp yêu cầubiến thể củaluyện tập,họ khẩn cấp.";
      if (sub === "changnanju") return "chiều dài khó để biến thể của" + t + ",trước xé mởthân chínhlại đúngBản dịch.";
      if (sub === "ielts") return "ĐọcLuyện tập" + t + ",nhấn họ biến thể cũ củaVị trí,họđọc xuyên suốttoàn văn.";
      return "chuyên biệtLuyện tập" + t + ",thay đổi về lượngtài năngthay đổi chất.";
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
        "Hoàn thành!có " + n + " dùng trong họ biến thể cũ của đãthu vàoSổ lỗi sai,điÔn tậpdùng sau động từ thử xemquán bar từ mượn phục vụ đồ uống.",
        n + " dùng trong biến thể cũ của tiến lênSổ lỗi sai,ngày hôm saulại chảimột lần từ đầu đến cuốinhớthay đổi hoặc thay thế chắc chắn.",
        "hình thức kết hợp gốc bánh xe có " + n + " dùng trong họ biến thể cũ của,Sổ lỗi saiđãthay cũ đổi mới."
      ]), { state: "happy", ms: 6500 });
      return;
    }
    onScore(d);
  }

  function onScore(d) {
    if (d.score == null || d.total == null || !d.total) {
      show(pick(["Hoàn thành!Kết quảđãLưu.", "Nộp bàiThành công,đi«Kết quả của tôi»xem quaquán bar từ mượn phục vụ đồ uống."]), { state: "celebrate", ms: 6000 });
      return;
    }
    var ratio = d.score / d.total;
    var s = d.score + "/" + d.total;
    if (ratio >= 0.85) {
      show(pick([
        "cao nhất gậy!" + s + ",giữđại từ nàytình trạng.",
        s + ",hầu nhưhọ đúng!có thểthử tháchthay đổi hoặc thay thế khó đểNội dung.",
        s + ",xinh đẹp!Câu sailạimột lần từ đầu đến cuốisau một mệnh đề giả định trong trường hợp đó ổn định."
      ]), { state: "celebrate", ms: 7000 });
    } else if (ratio >= 0.6) {
      show(pick([
        s + ",đúng.xem quaCâu sailạicủng cốdùng sau động từ thử xem.",
        s + ",điểm hoặc vạch đạt trong một kỳ thimức đó hoặc cao hơn,họ rò rỉlấp chỗ trốnghọ họ lại tăng giá cả.",
        s + ",cóCơ bản,chuyên biệtLuyện tậphọ lại đẩy một cầm."
      ]), { state: "happy", ms: 6500 });
    } else {
      show(pick([
        s + ",họnản lòng.làm hiểuCâu saitỷ sốđếm thay đổi hoặc thay thếquan trọng.",
        s + ",trướcsau khi hoàn thành ván cờ chơi lại ván cờCâu sai,Bỉmột cách khẩn trươngchải xuốngbộhiệu quả.",
        s + ",yếuđiểmtìm thấy,điKhu vực Luyện tậpsửachuyên biệtthử thử."
      ]), { state: "confused", ms: 7000 });
    }
  }

  function mockSkillTip(d, band, ratio) {
    var sub = String(d.subject || "");
    var low = (band != null && !isNaN(band) && band < 6.5) || (ratio != null && ratio < 0.65);
    if (sub.indexOf("listening") >= 0) {
      return pick(low ? [
        "Nghe:đánh vầnbiến thể cũ của họngôn ngữ học số nhiềulà chỉ theo sau bởi danh từ mất phầnkhu vực bị thiên tai nặng nề,tinh chất cười cổ đại gót chân dấu phẩy phó từ mức độhữu ích.",
        "Nghe:Section 4 Học thuậtbiến thể cũ của nhiều cười cổ đại bàn nhỏ biến thể của,điKhu vực Luyện tậptinh chất cười cổ đại sửadùng sau động từ thử xem."
      ] : [
        "Nghe:nhịp điệuđúng,giữdự đoánCâu sauhọ khuôn.",
        "Nghe:đánh vầnổn định sống,lần tớithử thử thay đổi hoặc thay thế họ sách kiếm hai lưỡi cầu họ."
      ]);
    }
    if (sub.indexOf("reading") >= 0) {
      return pick(low ? [
        "Đọc:Câu saiVị tríbiến thể cũ của lại cố gắng tìmmột lần từ đầu đến cuối,họđọc xuyên suốttoàn văn.",
        "Đọc:Thời gianchặt sau một mệnh đề giả định trong trường hợp đó trước phòng thủđơn giảnhọ,Đánh giá/Điền khuyếtcó ưu tiên."
      ] : [
        "Đọc:Vị tríchính xác,chú ý đến Passage 3 Thời gianphân phối.",
        "Đọc:phát huyđúng,thử thửđặt giới hạn thời gianchải xuốngbộgiữcảm giác khi chạm tay vào thứ gì đó."
      ]);
    }
    if (sub.indexOf("writing") >= 0) {
      return pick(low ? [
        "Viết:kiểm trađoạncấu trúcbiến thể cũ củaliên kếtbiến thể cũ của,Bỉ chất đống biến thể cũ của thay đổi hoặc thay thếquan trọng.",
        "Viết:Task 2 trước sắp xếpdàn ýlạibắt đầu viết hoặc vẽ,logic từ mượnBỉtu từquan trọng."
      ] : [
        "Viết:cấu trúcrõ ràng,lần tớithử thử thay đổi hoặc thay thếcấp caochứng minh một quan điểm.",
        "Viết:diễn đạtổn định sống,chú ý đếnsố lượng ký tự viếtbiến thể cũ củađoạnbằng nhau."
      ]);
    }
    if (sub.indexOf("speaking") >= 0) {
      return low ? "Nói:lưu loátvượt quacó ưu tiên,Quan điểmmở rasử dụng because / for example thiết lập mối quan hệ."
        : "Nói:diễn đạttrôi chảy về lời nói,lần tớithử thử thay đổi hoặc thay thếphức tạpnếu đứng sau mệnh đề điều kiệndòng đề tặngchuyển tiền.";
    }
    return "";
  }

  function onMockScore(d) {
    mount();
    var line, st = "happy", tip = "";
    var band = d.band != null ? Number(d.band) : null;
    var ratio = (d.score != null && d.total) ? d.score / d.total : null;

    if (band != null && !isNaN(band)) {
      if (band >= 7.5) { line = pick(["Band " + band + ",rấtđáng chú ý!", "Band " + band + ",ổn định!giữnhịp điệu."]); st = "celebrate"; }
      else if (band >= 6.5) { line = pick(["Band " + band + ",đạt tiêu chuẩn đặt ra.", "Band " + band + ",đúng,Tiếp tụccủng cốđiểm yếu của một người."]); st = "happy"; }
      else if (band >= 5.5) { line = pick(["Band " + band + ",cótiến bộkhông gian.", "Band " + band + ",điểm yếu của một ngườicố gắng tìm cho phép sau một mệnh đề giả định trong trường hợp đó họ lại tăng giá cả."]); st = "default"; }
      else { line = pick(["Band " + band + ",họnản lòng,sau khi hoàn thành ván cờ chơi lại ván cờBỉlàm nhiều câu hỏi luyện tập để chuẩn bị cho kỳ thiquan trọng.", "Band " + band + ",trước làm hiểuCâu sai,Điểm sốcó thểtheo kịp."]); st = "confused"; }
    } else if (d.score != null && d.total) {
      line = d.score + "/" + d.total + " Hoàn thành.";
      if (ratio >= 0.85) { line += pick([" thể hiệnphó từ mức độ tốt!", " tiếp cậnđiểm tối đacảm giác khi chạm tay vào thứ gì đó!"]); st = "celebrate"; }
      else if (ratio >= 0.6) { line += pick([" đúng,Tiếp tụccủng cố.", " cóCơ bản,chuyên biệthọ họ lại đẩy."]); st = "happy"; }
      else { line += pick([" xem quaCâu saiGiải thích.", " điKhu vực Luyện tậpsửadùng sau động từ thử xemyếuhọ."]); st = "confused"; }
    } else {
      line = pick(["Thi thửHoàn thành,Kết quảđãLưu.", "Nộp bàiThành công!đi«Kết quả của tôi»chăm sócChi tiết."]);
      st = "celebrate";
    }

    tip = mockSkillTip(d, band, ratio);
    if (tip) line += " " + tip;
    else line += pick([" đi«Kết quả của tôi»XemChi tiết.", " Kết quảtồn tại«Kết quả của tôi»biến thể của,bất kỳ lúc nàohọsau khi hoàn thành ván cờ chơi lại ván cờ."]);

    show(line, { state: st, ms: 10000 });
  }

  function onTimer(level) {
    if (examZone === "mock") return;
    if (level === "danger") {
      show(pick([
        "Thời giankhông nhiều!nắm chắckiểm trahình thức gắn liền có nghĩa giống như từ tự do họ dừng.",
        "cuối cùng 1 phút!tiền tố phủ định cho động từ chưa viết trước đoán dùng trong,họchừa trống trong tài liệu.",
        "Nộp bài,Xác nhậnhọ gầmtrước danh từ Có bạnbôi sơn họ hàng."
      ]), { state: "panic", ms: 5000 });
    } else if (level === "low") {
      show(pick([
        "họ còn lạikhông đến 5 phút,chú ýdùng sau động từ thử xemnhịp điệu.",
        "Thời giannghiêng chặt,có ưu tiênlàm cónắm bắt cũng nghĩa bóngĐề bài.",
        "5 phútĐếm ngược,Đọchọ họ tồn tạicùng nhauvấn đề khódùng trong lãng phí cao nhất thời gian dài."
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
