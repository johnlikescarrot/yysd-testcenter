/* =========================================================================
   mascot.js — Sida companion (Duolingo-style contextual reactions)
   ponytail: mock exams stay silent until score; study/practice get live hints
   ========================================================================= */
(function () {
  "use strict";

  if (document.body.dataset.noMascot!= null) return;

  var ONBOARD_KEY = "yysd:mascot-onboarded";
  var OFF_KEY = "yysd:mascot-off";
  var IDLE_MS = 45000;
  var ONBOARD_STEPS = [
    " Xin chào, ta là tư đạt, lỗi của bạn câu bản bồi luyện. ",
    " Khu từ vựng để học từ vựng, Khu luyện tập Nghe sâu câu phức học thuật, Khu đề thi Cambridge IELTS —— nhấn vào tôi, tôi luôn sẵn sàng hỗ trợ bạn. ",
    " Khi làm bài tôi sẽ phản hồi theo thời gian thực; thi thử xong tôi sẽ giúp bạn phân tích Band điểm. "
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
    btn.textContent = " triệu hoán tư đạt ";
    btn.setAttribute("aria-label", " một lần nữa bắt đầu dùng tư đạt Học tập trợ thủ ");
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
      op = op!= null? op: ".45";
      return '<ellipse class="sida-blush" cx="70" cy="124" rx="11" ry="6.5" fill="' + blush + '" opacity="' + op + '"/>' +
        '<ellipse class="sida-blush" cx="130" cy="124" rx="11" ry="6.5" fill="' + blush + '" opacity="' + op + '"/>';
    }

    function roundEye(cx, cy, opts) {
      opts = opts || {};
      var side = cx < 100? "l": "r";
      var py = opts.py!= null? opts.py: cy + 1;
      var px = opts.px!= null? opts.px: cx;
      var pr = opts.pr!= null? opts.pr: 4.5;
      var hx = opts.hx!= null? opts.hx: cx + (cx < 100? 2.5: -2.5);
      var hy = opts.hy!= null? opts.hy: cy - 2;
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
      " Học tập đặt nền móng, Luyện tập mạnh mẽ kỹ năng, Thi thử nghiệm chân chương —— ba bước đi ổn nhất. ",
      " Trang chủ A-Level chuyên khu có thể trực tiếp chọn hội đồng thi và kỹ năng, đề thi thật miễn phí Xem trước download. ",
      " Từ vựng IELTS chuyên sâu theo như nghe nói đọc ghi tập, so với mù quáng xoát từ hiệu suất cao. ",
      " Đề Cambridge IELTS từ Vol.19+ mới nhất quyển Bắt đầu thi thử, cảm thụ tiếp cận nhất trường thi. "
    ],
    study: [
      " Từ vựng Nền tảng THPT và Từ vựng Đại học Cốt lõi tách ra xoát, đừng xen lẫn trong một cái LIST dặm. ",
      " Học từ vựng cần vượt qua cả kiểm tra chính tả và giải nghĩa, nhớ vững cả hai mới tính là thuộc. ",
      " Ngữ pháp tinh giảng làm xong theo nhà tiểu trắc, câu sai hồi đầu lại nhìn một lần Giải thích đáp án. ",
      " Nghe / Đọc / Từ vựng Viết chuyên sâu, đối ứng bạn kế tiếp muốn công kỹ năng. ",
      " không biết từ sẽ tự động tiến Sổ lỗi sai, nhớ rõ đi Ôn tập. "
    ],
    practice: [
      " Khu luyện tập có Câu phức học thuật hóa giải và Nghe sâu (Intensive Listening), Chuyên sâu xách điểm nhanh nhất. ",
      " Nghe sâu Đọc nhại muốn trục câu vượt qua kiểm tra, chú ý liền đọc, yếu đọc và nuốt âm. ",
      " Câu phức học thuật trước tìm trụ cột, lại hủy đi định ngữ, trạng ngữ và đồng vị lời nói. ",
      " Đọc Luyện tập cuốn Nộp bài sau có thể xem trọng điểm, không phải Thi thử cũng có thể luyện tập cảm giác. "
    ],
    mock: [
      " Khu đề thi Cambridge IELTS Nghe Đọc hỗ trợ tính theo thời gian, tận lực theo như thực khảo thi tiết tấu. ",
      " Đọc câu có thể cao sáng, làm bút ký, và cơ khảo thi thói quen bảo trì nhất trí. ",
      " Nộp bài sau Band và Điểm số sẽ ghi tạc « Kết quả của tôi ». ",
      " Cùng một bộ đề có thể làm lại lần hai để so sánh điểm số và thấy sự tiến bộ. ",
      "A-Level đề thi thật tại « Chương trình quốc tế » dặm, hòa nhã tư phân khu lẫn nhau không lẫn vào dùng. "
    ],
    vocab: {
      gaozhong: [
        " Từ vựng Nền tảng THPT theo như LIST đẩy mạnh, hoàn thành một cái phác thảo một cái. ",
        " Kiểm tra hình thức cùng lúc khảo thi Chính tả và Tiếng Việt Giải nghĩa. ",
        " từ sai tự động thu nhập Sổ lỗi sai, hôm sau Ôn tập hiệu quả tốt nhất. "
      ],
      cet4: [
        " Từ vựng Đại học Cốt lõi số lượng hòa nhã tư có trùng điệp, đánh tốt nội tình hai đầu được lợi. ",
        " Giải nghĩa ghi từ khóa là được, không cần học thuộc lòng cả từ điển Câu ví dụ. ",
        " Mục tiêu hôm nay: ghi nhớ vững chắc 15 từ, hiệu quả hơn nhiều so với học vội vàng. "
      ],
      special: [
        " Từ vựng chuyên sâu theo như nghe nói đọc ghi điểm Bài, cái đó khoa yếu trước hết xoát cái đó khoa. ",
        " những mục này từ tại Đề Cambridge IELTS dặm xuất hiện tần suất cao, đáng giá đọc kỹ. ",
        " phối hợp đồng kỹ năng đích Thi thử / Luyện tập, nhớ rõ càng lao. "
      ]
    },
    results: [
      " Điểm số đã đồng bộ đám mây, đổi thiết bị Đăng nhập sau có thể tại « Kết quả của tôi » Xem. ",
      "Band quỹ tích có thể nhìn gần nhất mấy lần Thi thử xu thế. ",
      " Điểm số thấp kỹ năng, đi luyện tập khu làm Chuyên sâu thường thường so với cứng rắn xoát câu có tác dụng. "
    ],
    general: [
      " Mỗi ngày luyện Nghe sâu 15 phút hiệu quả hơn nhiều so với cắm đầu làm ba đề Đọc. ",
      " Đọc xem trước Câu hỏi lại Dẫn chứng, đừng từ đoạn thứ nhất đọc được vĩ. ",
      " Nghe lấp chỗ trống chú ý đơn số nhiều, chữ hoa hay thường và từ tính biến hình. ",
      " Viết lưu 5 phút kiểm tra Chính tả, lúc thái và chủ vị nhất trí. ",
      " Nói không phải lưng Đáp án, là luyện lưu loát độ và quan điểm triển khai. "
    ]
  };

  var HINT_LINES = {
    correct: [
      " đúng rồi! Tiếp tục bảo trì. ",
      " chuẩn xác! này nắm giữ. ",
      " xinh đẹp, Câu tiếp theo ổn định. ",
      " chính là cái này cảm giác, tiết tấu rất tốt. "
    ],
    "partial-spelling": [
      " Nghĩa đúng rồi! Chính tả lại thẩm tra đối chiếu thoáng một phát chữ cái trình tự. ",
      " ý tứ nắm giữ, phương pháp sáng tác nhớ một cái liền điểm tối đa. ",
      " Giải nghĩa vượt qua kiểm tra, Chính tả kém một ít, lại nhìn liếc. "
    ],
    "partial-meaning": [
      " Chính tả đúng rồi! Tiếng Việt Giải nghĩa lại suy nghĩ một chút. ",
      " phương pháp sáng tác không có vấn đề, Nghĩa lại củng cố thoáng một phát. ",
      " chữ cái hoàn toàn đúng, ý tứ còn kém một hơi. "
    ],
    partial: [
      " tiếp cận, nhìn xem phản hồi bên trong chi tiết. ",
      " một nửa đúng rồi, cách hoàn toàn đúng không xa. ",
      " phương hướng đúng rồi, điều chỉnh lại một chút. "
    ],
    wrong: [
      " cái này câu đáng giá tiến Sổ lỗi sai, trễ giờ lại xoát một lần. ",
      " Không sao, hiểu Bỉ Mông đối với quan trọng hơn. ",
      " Hãy đánh dấu lại trước, lát nữa quay lại xem lại nhé. ",
      " sai rồi liền nhớ kỹ, lần sau chú ý. "
    ],
    pass: [
      " vượt qua kiểm tra! câu này Đọc nhại đúng chỗ. ",
      " Nghe sâu thông qua, Tiếp tục bảo trì này ngữ tốc. ",
      " kết cấu Nộp bài thành công, so sánh tham khảo hoàn thiện thoáng một phát. ",
      " Ngữ pháp tiểu trắc cái này câu bắt lại. "
    ],
    fail: [
      " nghe nữa một lần, chú ý liền đọc và yếu đọc. ",
      " không có đạt tiêu chuẩn, thả chậm ngữ tốc trục từ Đọc nhại. ",
      " Câu phức học thuật đừng nóng vội, trước vòng ra trụ cột sẽ tìm từ câu. ",
      " nhìn lại một chút Giải thích đáp án, lần sau sẽ tốt hơn. "
    ]
  };

  var STREAK_CELEBRATE = [
    " tam liên đối với! Trạng thái đã đến. ",
    " lợi hại, liên tục trả lời! ",
    " tiết tấu rất tốt, bảo trì này xúc cảm. ",
    " liền đối ba đạo, hôm nay Từ vựng xúc cảm không sai. "
  ];

  var GREET_DEFAULTS = {
    home: [
      " Xin chào, ta là tư đạt. Học tập, Luyện tập, Thi thử, tôi đều tại. ",
      " Chào mừng bạn đến với YYSD. Trên con đường ôn luyện thi, có khó khăn gì cứ nhấn vào tôi nhé. "
    ],
    study: [
      " Khu từ vựng đã đến. Từ vựng, Ngữ pháp, Chuyên sâu từ —— làm gì chắc đó. ",
      " trước học giỏi Từ vựng Ngữ pháp, Thi thử mới có thể ổn. "
    ],
    practice: [
      " Khu luyện tập! Nghe sâu, Câu phức học thuật, Đọc cuốn, Chuyên sâu xách điểm. ",
      " Luyện tập đúng trọng tâm hiệu quả hơn nhiều so với làm đề tràn lan, hãy chọn một phần để bắt đầu nào. "
    ],
    mock: [
      " Khu đề thi. Đề Cambridge IELTS tính theo thời gian luyện, Nộp bài tự động đánh giá Band. ",
      " Toàn phần Môi trường luyện một lần, so với xoát mười bộ mảnh vỡ câu có tác dụng. "
    ],
    results: [
      " đến xem chiến tích. mỗi lần Thi thử đều đáng giá ghi chép. ",
      "Biểu đồ Band điểm tại đây, tiến bộ thấy rõ ngay lập tức. "
    ],
    vocab: {
      gaozhong: " Từ vựng Nền tảng THPT LIST đã đến. Chính tả và Giải nghĩa đều phải qua màn. ",
      cet4: " Từ vựng Đại học Cốt lõi Luyện tập. hôm nay trước ổn cầm một đám hạch tâm từ. ",
      special: " Từ vựng IELTS chuyên sâu. theo như kỹ năng xoát, hiệu suất cao hơn. "
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
    host.setAttribute("aria-label", " tư đạt Học tập trợ thủ ");
    host.dataset.state = "default";
    host.innerHTML =
      '<div class="yysd-mascot__bubble" id="sida-bubble" hidden>' +
        '<button type="button" class="yysd-mascot__min" aria-label=" thu hồi bong bóng khí ">—</button>' +
        '<button type="button" class="yysd-mascot__close" aria-label=" Đóng tư đạt ">×</button>' +
        '<div class="yysd-mascot__head">' +
          '<b> tư đạt </b><span class="yysd-mascot__streak" id="sida-streak" hidden></span>' +
        '</div>' +
        '<p id="sida-text"></p>' +
        '<button type="button" class="yysd-mascot__next" id="sida-next" hidden> bước tiếp theo </button>' +
      '</div>' +
      '<button type="button" class="yysd-mascot__figure" id="sida-figure" aria-expanded="false" aria-label=" triển khai tư đạt nhắc nhở ">' +
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
    if (!Y ||!Y.touchStreak) { el.hidden = true; return; }
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
    host.classList.toggle("is-expressive", state!== "default");
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
    if (!host ||!bubble) return;
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
    var open =!bubble.hidden;
    fig.setAttribute("aria-expanded", open? "true": "false");
    fig.setAttribute("aria-label", open? " thu hồi tư đạt nhắc nhở ": " triển khai tư đạt nhắc nhở ");
  }

  function show(text, opts) {
    if (!mounted) mount();
    opts = opts || {};
    queue.push({
      text: text,
      state: opts.state || "default",
      ms: opts.ms!= null? opts.ms: 5000,
      pinned:!!opts.pinned,
      onboard:!!opts.onboard
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
    host.classList.toggle("is-speaking",!item.pinned &&!item.onboard);
    host.querySelector("#sida-text").textContent = item.text;
    var nextBtn = host.querySelector("#sida-next");
    if (nextBtn) nextBtn.hidden =!item.onboard;
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
        if (sub.indexOf("grammar") >= 0) return " Ngữ pháp câu từ từ suy nghĩ, hiểu rõ nhất đạo là nhất đạo. ";
        if (sub.indexOf("vocab") >= 0) return " Bạn vẫn đang học từ vựng chứ? Các từ làm sai sẽ tự động được thêm vào Sổ từ hay sai. ";
        return pick([" Từ vựng Luyện tập đừng đuổi, Chính tả và Giải nghĩa đều muốn ổn. ", " Khu từ vựng Tiến độ sẽ Lưu, làm xong nhớ rõ nhìn lầm câu bản. "]);
      }
      if (ctx.zone === "practice") {
        if (sub === "jingting") return " Nghe sâu kẹt? lui về nửa nhanh chóng lại theo một lần. ";
        if (sub === "changnanju") return " Câu phức học thuật trước tìm chủ vị tân, đừng để bên ngoài tân trang thành phần hù đến. ";
        return " Chuyên sâu Luyện tập quý ở kiên trì, luyện thêm một câu? ";
      }
    }
    if (ctx.page === "zone") {
      if (ctx.zone === "mock") return pick([" lục soát «Cambridge 19»«Test 1» có thể rất nhanh tìm được bài thi. ", " Thi thử nhớ rõ mở tính theo thời gian, thói quen thực khảo thi tiết tấu. "]);
      if (ctx.zone === "practice") return " Nghe sâu và Câu phức học thuật đều ở đây, chọn một Chuyên sâu Bắt đầu. ";
      if (ctx.zone === "study") return " THPT từ, Đại học B1 từ, Chuyên sâu từ —— hôm nay muốn công khối kia? ";
    }
    if (ctx.page === "vocab") {
      if (ctx.book === "cet4") return " Đại học B1 LIST đẩy mạnh Vừa? hôm nay nhớ kỹ 15 cũng rất bổng. ";
      if (ctx.book === "special") return " Từ vựng chuyên sâu phối hợp đồng khoa mắt Luyện tập, nhớ rõ càng lao. ";
      return " Từ vựng Nền tảng THPT làm gì chắc đó, Sổ lỗi sai nhớ rõ Ôn tập. ";
    }
    if (ctx.page === "results") return " có thể chọn một bộ điểm thấp bài thi, đi luyện tập khu bổ Chuyên sâu. ";
    return pick([" Bạn còn ở đó không? Nhấn vào tôi để nhận một mẹo ôn thi hữu ích nhé. ", " Học tập · Luyện tập · Thi thử, có thắc mắc gì cứ nhấn vào tôi bất cứ lúc nào. "]);
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
      nextBtn.textContent = i >= ONBOARD_STEPS.length - 1? " đã biết ": " bước tiếp theo (" + (i + 1) + "/" + ONBOARD_STEPS.length + ")";
    }
    show(ONBOARD_STEPS[i], { state: i === 0? "wave": "happy", pinned: true, onboard: true });
  }

  function needsOnboard() {
    if (examPage) return false;
    try { return!localStorage.getItem(ONBOARD_KEY); } catch (e) { return false; }
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
    if (!Y ||!Y.touchStreak) return "";
    var s = Y.touchStreak();
    if (s.visit >= 7) return pick([" liên tục " + s.visit + " ngày, bạn đúng là chiến thần ôn thi kiên trì! ", " thứ " + s.visit + " trời giáng tạp, thói quen đã dưỡng thành. "]);
    if (s.visit >= 3) return pick([" liên tục " + s.visit + " ngày, bảo trì! ", " liên tục " + s.visit + " ngày qua rồi, tiết tấu rất tốt. "]);
    if (s.visit === 2) return "Chuỗi 2 ngày đã đến, thói quen tốt! ";
    return "";
  }

  function greetDefault(key, book) {
    if (key === "vocab") {
      var v = GREET_DEFAULTS.vocab[book || "gaozhong"] || GREET_DEFAULTS.vocab.gaozhong;
      return typeof v === "string"? v: pick(v);
    }
    return pick(GREET_DEFAULTS[key] || GREET_DEFAULTS.home);
  }

  function greet() {
    if (onboardActive) return;
    var ctx = pageCtx();
    var zone = ctx.zone || "mock";
    var key = ctx.page === "zone"? (GREET_DEFAULTS[zone]? zone: "mock"): ctx.page;
    if (key === "other") return;
    var st = { home: "wave", study: "default", practice: "default", mock: "default", results: "happy", vocab: "happy", zone: "default" };
    var stKey = key === "zone"? zone: key;

    function deliver(line) {
      updateStreakBadge();
      var s = streakMsg();
      if (s) line = s + " " + line;
      show(line, { state: st[stKey] || "default", ms: stKey === "home"? 6500: 6000 });
    }

    var Y = window.YYSD;
    if (Y && Y.load && (key === "home" || key === "zone" || key === "results")) {
      var ctxPromise = key === "results"
        ? Promise.resolve().then(function () {
            return Y.mascotResultsLine(Object.keys(Y.results()).map(function (k) { return Y.results()[k]; }));
          })
        : Y.load().then(function (items) {
            return Y.mascotSmartLine? Y.mascotSmartLine(items, key === "home"? null: zone): Y.mascotPathLine(items);
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
    var t = title? "«" + title + "»": "";
    if (zone === "study") {
      if (sub === "grammar") return " Ngữ pháp tinh giảng " + t + " đã bắt đầu, theo nhà tiểu trắc ta giúp ngươi chằm chằm. ";
      if (sub === "vocab-cet4") return " Từ vựng Đại học Cốt lõi " + t + ", Chính tả và Giải nghĩa đều phải qua màn. ";
      if (sub.indexOf("vocab-special") === 0) return " Từ vựng chuyên sâu " + t + ", kết hợp kỹ năng nhớ càng lao. ";
      if (sub.indexOf("vocab") >= 0) return "Từ vựng" + t + " mở luyện, từ sai sẽ tự động tiến Sổ lỗi sai. ";
      return pick([" Học tập hình thức khởi động, tôi cùng ngươi nhất đạo nhất đạo đến. ", " bên cạnh học bên cạnh trắc, không biết nhớ kỹ. "]);
    }
    if (zone === "practice") {
      if (sub === "jingting") return " Nghe sâu " + t + ", Đọc nhại vượt qua kiểm tra muốn nhiều lần luyện, đừng nóng vội. ";
      if (sub === "changnanju") return " Câu phức học thuật " + t + ", trước hủy đi trụ cột lại đối với văn dịch. ";
      if (sub === "ielts") return " Đọc Luyện tập " + t + ", theo như Câu hỏi Dẫn chứng, đừng đọc một lượt toàn văn. ";
      return " Chuyên sâu Luyện tập " + t + ", lượng biến mới có thể biến chất. ";
    }
    return "";
  }

  function greetExamZone(zone) {
    var line = examStartLine(zone, examSubject, examTitle);
    if (!line) return;
    var st = zone === "practice"? "think": "happy";
    if (examSubject === "jingting") st = "think";
    show(line, { state: st, ms: 5500 });
  }

  function onHint(result) {
    if (examZone === "mock" ||!result) return;
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
    var st = isCorrect? "happy"
      : (result === "wrong" || result === "fail")? "confused": "think";
    show(lines[Math.floor(Math.random() * lines.length)], { state: st, ms: 3200 });
  }

  function onStudyScore(d) {
    if (d.wrongWords && d.wrongWords.length) {
      var n = d.wrongWords.length;
      show(pick([
        " hoàn thành! có " + n + " cái sai lầm từ đã thu nhập Sổ lỗi sai, đi Ôn tập một chút đi. ",
        n + " từ Vào học Sổ lỗi sai, hôm sau lại xoát một lần nhớ rõ càng lao. ",
        " bản luân phiên có " + n + " cái sai lầm từ, Sổ lỗi sai đã đổi mới mới. "
      ]), { state: "happy", ms: 6500 });
      return;
    }
    onScore(d);
  }

  function onScore(d) {
    if (d.score == null || d.total == null ||!d.total) {
      show(pick([" hoàn thành! Điểm số đã Lưu. ", " Nộp bài thành công, đi « Kết quả của tôi » xem một chút đi. "]), { state: "celebrate", ms: 6000 });
      return;
    }
    var ratio = d.score / d.total;
    var s = d.score + "/" + d.total;
    if (ratio >= 0.85) {
      show(pick([
        " quá tuyệt vời! " + s + ", bảo trì cái trạng thái này. ",
        s + ", hầu như hoàn toàn đúng! có thể khiêu chiến càng khó nội dung. ",
        s + ", xinh đẹp! câu sai tiếp qua một lần liền ổn. "
      ]), { state: "celebrate", ms: 7000 });
    } else if (ratio >= 0.6) {
      show(pick([
        s + ", không sai. nhìn xem câu sai lại củng cố thoáng một phát. ",
        s + ", đạt tiêu chuẩn tuyến trở lên, tra lậu bổ khuyết còn có thể lại phát triển. ",
        s + ", có cơ sở, Chuyên sâu Luyện tập có thể đẩy nữa một chút. "
      ]), { state: "happy", ms: 6500 });
    } else {
      show(pick([
        s + ", đừng nản chí. hiểu câu sai điểm số mấy quan trọng hơn. ",
        s + ", trước phục um tùm câu, so với vội vã xoát một bộ kế có tác dụng. ",
        s + ", đã xác định được điểm cần cải thiện, bạn hãy vào khu luyện tập để củng cố chuyên sâu nhé. "
      ]), { state: "confused", ms: 7000 });
    }
  }

  function mockSkillTip(d, band, ratio) {
    var sub = String(d.subject || "");
    var low = (band!= null &&!isNaN(band) && band < 6.5) || (ratio!= null && ratio < 0.65);
    if (sub.indexOf("listening") >= 0) {
      return pick(low? [
        " Nghe: Chính tả và đơn số nhiều là mất điểm trọng tai khu, Nghe sâu Đọc nhại rất hữu dụng. ",
        " Nghe: Section 4 Học thuật từ nhiều nghe mấy lần, đi luyện tập khu Nghe sâu bổ thoáng một phát. "
      ]: [
        " Nghe: tiết tấu không sai, bảo trì dự phán Câu tiếp theo dạng bài. ",
        " Nghe: Chính tả ổn định, lần sau thử xem cao hơn quyển Cambridge câu. "
      ]);
    }
    if (sub.indexOf("reading") >= 0) {
      return pick(low? [
        " Đọc: câu sai Dẫn chứng từ sẽ tìm một lần, đừng đọc một lượt toàn văn. ",
        " Đọc: thời gian eo hẹp trước hết bảo vệ đơn giản câu, phán đoán / lấp chỗ trống ưu tiên. "
      ]: [
        " Đọc: Dẫn chứng chuẩn xác, chú ý Passage 3 thời gian phân phối. ",
        " Đọc: triển khai không sai, thử xem Thời gian xoát một bộ kế bảo trì xúc cảm. "
      ]);
    }
    if (sub.indexOf("writing") >= 0) {
      return pick(low? [
        " Viết: kiểm tra đoạn kết cấu và dính liền từ, so với chồng chất từ quan trọng hơn. ",
        " Viết: Task 2 trước nhóm đề cương cử động nữa bút, ăn khớp so với từ ngữ trau chuốt quan trọng hơn. "
      ]: [
        " Viết: kết cấu rõ ràng, lần sau thử xem cao cấp hơn luận chứng. ",
        " Viết: biểu đạt ổn định, chú ý Số từ và đoạn cân đối. "
      ]);
    }
    if (sub.indexOf("speaking") >= 0) {
      return low? " Nói: lưu loát độ ưu tiên, quan điểm triển khai dùng because / for example xâu chuỗi. "
        : " Nói: biểu đạt trôi chảy, lần sau thử xem phức tạp hơn chủ đề Từ vựng. ";
    }
    return "";
  }

  function onMockScore(d) {
    mount();
    var line, st = "happy", tip = "";
    var band = d.band!= null? Number(d.band): null;
    var ratio = (d.score!= null && d.total)? d.score / d.total: null;

    if (band!= null &&!isNaN(band)) {
      if (band >= 7.5) { line = pick(["Band " + band + ", vô cùng xuất sắc! ", "Band " + band + ", ổn! bảo trì tiết tấu. "]); st = "celebrate"; }
      else if (band >= 6.5) { line = pick(["Band " + band + ", đạt tiêu chuẩn. ", "Band " + band + ", không sai, Tiếp tục củng cố yếu hạng. "]); st = "happy"; }
      else if (band >= 5.5) { line = pick(["Band " + band + ", có tiến bộ không gian. ", "Band " + band + ", yếu hạng tìm đúng rồi có thể lại phát triển. "]); st = "default"; }
      else { line = pick(["Band " + band + ", đừng nản chí, phân tích câu sai quan trọng hơn làm đề tràn lan. ", "Band " + band + ", trước hiểu câu sai, điểm sẽ cùng bên trên. "]); st = "confused"; }
    } else if (d.score!= null && d.total) {
      line = d.score + "/" + d.total + " hoàn thành. ";
      if (ratio >= 0.85) { line += pick([" biểu hiện rất tốt! ", " tiếp cận điểm tối đa xúc cảm! "]); st = "celebrate"; }
      else if (ratio >= 0.6) { line += pick([" không sai, Tiếp tục củng cố. ", " có trụ cột, Chuyên sâu còn có thể đẩy nữa. "]); st = "happy"; }
      else { line += pick([" nhìn xem sai lời giải trong đề bài tích. ", " vào khu luyện tập để củng cố các phần còn yếu nhé. "]); st = "confused"; }
    } else {
      line = pick([" Thi thử hoàn thành, Điểm số đã Lưu. ", " Nộp bài thành công! đi « Kết quả của tôi » nhìn tình hình cụ thể và tỉ mỉ. "]);
      st = "celebrate";
    }

    tip = mockSkillTip(d, band, ratio);
    if (tip) line += " " + tip;
    else line += pick([" đi « Kết quả của tôi » Xem chi tiết. ", " Điểm số lưu trong mục «Kết quả của tôi», bạn có thể xem lại bất cứ lúc nào. "]);

    show(line, { state: st, ms: 10000 });
  }

  function onTimer(level) {
    if (examZone === "mock") return;
    if (level === "danger") {
      show(pick([
        " thời gian không nhiều lắm! nắm chặt kiểm tra bài thi tạp. ",
        " cuối cùng 1 phút! không có viết trước đoán bên trên, đừng lưu chỗ trống. ",
        " nhanh Nộp bài rồi, Xác nhận câu số có hay không bôi thác hành. "
      ]), { state: "panic", ms: 5000 });
    } else if (level === "low") {
      show(pick([
        " còn lại không đến 5 phút, lưu ý thoáng một phát tiết tấu. ",
        " thời gian thiên nhanh, ưu tiên làm có nắm chắc đề mục. ",
        "5 phút đảo kế thì, Đọc câu đừng tại nhất đạo nan đề bên trên hao tổn quá lâu. "
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
    if (d.type!== "yysd:score") return;
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
