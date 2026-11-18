/* vocab-challenge-ui.js - xông qua rào cản hub + A→D quiz + lỗi chủ đề gốc luyện tập */
(function () {
  "use strict";
  var Y = window.YYSD;
  var A = window.YYSD_AUTH;
  var root = document.getElementById("vc-root");
  var params = new URLSearchParams(location.search);
  var view = params.get("view") || "hub"; // hub | notebook | practice
  var bookParam = params.get("book") || "";

  function bookQs(extra) {
    var q = [];
    if (bookParam) q.push("bookId=" + encodeURIComponent(bookParam));
    if (extra) q.push(String(extra).replace(/^[?&]/, ""));
    return q.length ? "?" + q.join("&") : "";
  }

  var HP_MAX = 5;
  var HP_REVIEW = 3;
  var TIME_SEC = 18;
  var session = {
    attemptId: 0,
    phase: "",
    taskType: "new",
    listId: "",
    listNo: 0,
    bookId: "",
    notices: [],
    optionBank: [],
    words: [],
    answers: [],
    idx: 0,
    selectedMeaning: null,
    answered: false,
    waiting: false,
    lives: HP_MAX,
    livesMax: HP_MAX,
    timer: null,
    timerLeft: TIME_SEC,
    timerPaused: false,
    imeBlocked: false,
    imeGatePassed: false,
    imeViolations: 0,
    imeDebounce: null,
    gameOver: false,
    pendingStart: null
  };

  function esc(s) {
    return Y && Y.esc ? Y.esc(String(s == null ? "" : s)) : String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function needAuth() {
    if (!A || !A.getToken || !A.getToken()) {
      location.href = "login.html?next=" + encodeURIComponent(location.pathname + location.search);
      return false;
    }
    return true;
  }

  function speak(word) {
    var WA = window.YysdWordAudio;
    if (WA && WA.speakUs) { WA.speakUs(word); return; }
    if (WA && WA.speak) { WA.speak(word, 2); return; }
    if (!window.speechSynthesis || !word) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(word);
    u.lang = "en-US";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function parseWord(it) {
    var wj = it.word_json || it.wordJson || null;
    if (typeof wj === "string") {
      try { wj = JSON.parse(wj); } catch (e) { wj = null; }
    }
    var accept = (wj && Array.isArray(wj.acceptCN)) ? wj.acceptCN.filter(Boolean) : [];
    var spellings = [];
    function add(s) {
      s = String(s || "").trim();
      if (s && spellings.indexOf(s) < 0) spellings.push(s);
    }
    add(it.word);
    if (wj) {
      add(wj.word);
      add(wj.wordUs);
      add(wj.wordUk);
      if (Array.isArray(wj.spellings)) wj.spellings.forEach(add);
    }
    return {
      word: String(it.word || (wj && wj.word) || ""),
      wordUs: (wj && wj.wordUs) || String(it.word || ""),
      wordUk: (wj && wj.wordUk) || "",
      spellings: spellings,
      ipa: it.ipa || (wj && (wj.ipaUs || wj.ipa)) || "",
      meaning: it.meaning || (wj && wj.meaning) || "",
      acceptCN: accept,
      word_json: wj,
      listId: it.listId || it.sourceListId || null
    };
  }

  function quizMeaning(w) {
    if (!w) return "";
    if (w.acceptCN && w.acceptCN.length) {
      var cn = w.acceptCN.filter(Boolean).join(" / ");
      if (cn) return cn;
    }
    return String(w.meaning || "").trim();
  }

  function isRealCn(s) {
    return !!(s && s.indexOf(" tạm thời không có nghĩa của cái gì đó ") < 0 && /[\u4e00-\u9fff]/.test(s));
  }

  function mergeOptionBank(extra) {
    var seen = {};
    var out = [];
    (session.optionBank || []).concat(extra || []).forEach(function (g) {
      if (!isRealCn(g) || seen[g]) return;
      seen[g] = true;
      out.push(g);
    });
    session.optionBank = out;
  }

  function meaningOptions(w, pool, n) {
    n = n || 4;
    var correct = isRealCn(quizMeaning(w)) ? quizMeaning(w) : "";
    var used = {};
    if (correct) used[correct] = true;
    var distract = [];
    function take(arr) {
      var shuffled = shuffle(arr || []);
      for (var i = 0; i < shuffled.length && distract.length < n - 1; i++) {
        var m = shuffled[i];
        if (!isRealCn(m) || used[m]) continue;
        used[m] = true;
        distract.push(m);
      }
    }
    take((pool || []).map(quizMeaning));
    take(session.optionBank || []);
    var opts = correct ? [correct].concat(distract) : distract;
    return shuffle(opts);
  }

  var DRAFT_KEY = "yysd:vc:draft:";
  function saveQuizDraft() {
    if (!session.attemptId) return;
    try {
      sessionStorage.setItem(DRAFT_KEY + session.attemptId, JSON.stringify({
        phase: session.phase,
        words: session.words,
        answers: session.answers,
        idx: session.idx,
        lives: session.lives,
        livesMax: session.livesMax,
        waiting: !!session.waiting,
        optionBank: session.optionBank || []
      }));
    } catch (e) { /* quota */ }
  }
  function loadQuizDraft(attemptId, phase) {
    try {
      var raw = sessionStorage.getItem(DRAFT_KEY + attemptId);
      if (!raw) return null;
      var d = JSON.parse(raw);
      if (!d || d.phase !== phase || !d.words || !d.words.length) return null;
      return d;
    } catch (e) { return null; }
  }
  function clearQuizDraft(attemptId) {
    if (!attemptId) return;
    try { sessionStorage.removeItem(DRAFT_KEY + attemptId); } catch (e) { /* ignore */ }
  }

  function displayProgressDay(day, complete, total) {
    total = total || 78;
    day = Math.floor(Number(day) || 0);
    if (complete || day > total) return total;
    return day > 0 ? day : 1;
  }

  function spellForms(w) {
    var out = [];
    function add(s) {
      s = String(s || "").trim();
      if (s && out.indexOf(s) < 0) out.push(s);
    }
    add(w && w.word);
    add(w && w.wordUs);
    add(w && w.wordUk);
    if (w && Array.isArray(w.spellings)) w.spellings.forEach(add);
    var wj = w && (w.word_json || w.wordJson);
    if (wj && typeof wj === "object") {
      add(wj.word);
      add(wj.wordUs);
      add(wj.wordUk);
      if (Array.isArray(wj.spellings)) wj.spellings.forEach(add);
    }
    return out.length ? out : [String((w && w.word) || "")];
  }

  function spellMatches(user, expected) {
    if (window.YYSD_EN_SPELL && YYSD_EN_SPELL.matchesAny) {
      return YYSD_EN_SPELL.matchesAny(user, Array.isArray(expected) ? expected : [expected]);
    }
    if (window.YYSD_EN_SPELL && YYSD_EN_SPELL.matches) {
      var list = Array.isArray(expected) ? expected : [expected];
      for (var i = 0; i < list.length; i++) {
        if (YYSD_EN_SPELL.matches(user, list[i])) return true;
      }
      return false;
    }
    var u = String(user || "").trim().toLowerCase();
    var list2 = Array.isArray(expected) ? expected : [expected];
    for (var j = 0; j < list2.length; j++) {
      if (u === String(list2[j] || "").trim().toLowerCase()) return true;
    }
    return false;
  }

  function bindEnglishSpellInput(el) {
    if (!window.YYSD_EN_SPELL || !window.YYSD_EN_SPELL.bind) return;
    YYSD_EN_SPELL.bind(el, {
      isLocked: function () { return !!session.answered || !!session.imeBlocked; },
      onImeViolation: onImeViolation
    });
  }

  function shell(inner, badge, opts) {
    opts = opts || {};
    clearTimer();
    var livesHtml = "";
    if (opts.showLives) {
      var maxL = session.livesMax || HP_MAX;
      for (var i = 0; i < maxL; i++) {
        livesHtml += '<span class="heart' + (i >= session.lives ? " lost" : "") + '">❤️</span>';
      }
    }
    document.body.classList.toggle("vc-playing", !!opts.showLives);
    root.innerHTML =
      '<div class="vl-app">' +
        '<div class="vl-top-bar">' +
          '<div class="vl-brand">YYSD · <span>từ xông qua rào cản</span></div>' +
          '<div class="vl-list-badge">' + esc(badge || " xông qua rào cản ") + "</div>" +
          (opts.showLives ? '<div class="vl-lives" id="lives">' + livesHtml + "</div>" : "") +
        "</div>" +
        '<div class="vl-info-row">' +
          '<div id="vc-counter"></div>' +
          (opts.showTimer
            ? '<div class="vl-timer" id="timerWrap" style="display:none">⏱ <span class="num" id="timerNum">' +
              TIME_SEC + "</span>s</div>"
            : "") +
        "</div>" +
        '<div id="vc-panel">' + inner + "</div>" +
      "</div>";
  }

  function noticesHtml(list, warn) {
    if (!list || !list.length) return "";
    return list.map(function (n) {
      return '<p class="vc-notice' + (warn ? " vc-notice--warn" : "") + '">' + esc(n) + "</p>";
    }).join("");
  }

  function phaseLabel(phase) {
    if (phase === "new_words") return " cách diễn đạt mới kiểm tra ";
    if (phase === "retest") return " lỗi biến thể cũ của | lặp lại khảo sát ";
    if (phase === "makeup") return " thi bổ sung tuần hoàn ";
    if (phase === "scheduled_review") return " xem lại phát hiện ";
    return phase || "";
  }

  function taskStatusLabel(st, inProgress) {
    if (st === "completed") return " đã đi qua ";
    if (st === "failed") return " yêu cầu lặp lại khảo sát ";
    if (st === "pending") return inProgress ? " xông qua rào cản Trung Quốc " : " ở lại làm ";
    return st || "";
  }

  function taskTypeLabel(t) {
    return t === "review" ? " xem lại rút ra khảo sát " : " cách diễn đạt mới ";
  }

  function stageChipSub(plan) {
    if (!plan) return "-";
    var parts = [];
    if (plan.new) parts.push("L" + plan.new);
    if (plan.reviews && plan.reviews.length) parts.push(" đi rồi quay lại " + plan.reviews.join(","));
    return parts.join("·") || "-";
  }

  function stageStatusLabel(st) {
    if (st === "completed") return " đã băng qua ";
    if (st === "current") return " gốc ải núi ";
    return " khóa ";
  }

  function stageGridHtml(stagesData, progressDay) {
    var stages = (stagesData && stagesData.stages) || [];
    if (!stages.length) return "";
    return (
      '<div id="vc-stage-panel" hidden></div>' +
      '<div class="vc-stage-grid">' +
        stages.map(function (s) {
          var cls = "vc-stage-chip is-" + s.status;
          if (s.stage === progressDay) cls += " is-progress";
          var attrs = s.practiceable
            ? (' data-stage="' + s.stage + '" tabindex="0" role="button"')
            : "";
          return '<div class="' + cls + '"' + attrs + ' title=" Thứ ' + s.stage + " ải núi · " +
            esc(stageChipSub(s.plan)) + '">' +
            "<span>" + s.stage + "</span>" +
            "<small>" + esc(stageStatusLabel(s.status)) + "</small>" +
            "</div>";
        }).join("") +
      "</div>" +
      '<p class="vc-meta vc-stage-hint">Tổng cộng ' + (stagesData.totalStages || stages.length) +
        " ải núi · nhấn<strong>đã băng qua</strong>của trạm kiểm soát có thể độc lập lặp lại luyện tập(không ảnh hưởng tốc độ tiến triển)</p>"
    );
  }

  function renderStagePanel(stage, stagesData) {
    var panel = document.getElementById("vc-stage-panel");
    if (!panel) return;
    if (!stage || !stagesData) {
      panel.hidden = true;
      panel.innerHTML = "";
      return;
    }
    var info = (stagesData.stages || []).filter(function (s) { return s.stage === stage; })[0];
    if (!info || !info.practiceable) {
      panel.hidden = true;
      return;
    }
    panel.hidden = false;
    panel.innerHTML =
      '<div class="vc-stage-panel-head">' +
        "<strong>Thứ " + stage + " ải núi · đã đi qua</strong>" +
        '<button type="button" class="vc-stage-panel-close" id="vc-stage-close" aria-label=" đóng ">×</button>' +
      "</div>" +
      '<p class="vc-meta">' + esc(stageChipSub(info.plan)) + " · chọn yêu cầu lặp lại luyện tập của nhiệm vụ</p>" +
      '<div class="vc-stage-panel-actions">' +
        info.tasks.map(function (t) {
          return '<button type="button" class="vl-btn vl-btn-sm vc-stage-practice" data-list="' + t.listNo +
            '" data-type="' + esc(t.taskType) + '" data-stage="' + stage + '">' +
            "List " + t.listNo + " · " + taskTypeLabel(t.taskType) + " luyện tập</button>";
        }).join("") +
      "</div>";
    document.getElementById("vc-stage-close").onclick = function () { renderStagePanel(null, null); };
    panel.querySelectorAll(".vc-stage-practice").forEach(function (btn) {
      btn.onclick = function () {
        startListPractice(
          Number(btn.getAttribute("data-list")),
          btn.getAttribute("data-type"),
          Number(btn.getAttribute("data-stage"))
        );
      };
    });
    try { panel.scrollIntoView({ behavior: "smooth", block: "nearest" }); }
    catch (e) { panel.scrollIntoView(); }
  }

  function formatReviewStages(stages) {
    if (!stages || !stages.length) return "-";
    return stages.map(function (d) { return " Thứ " + d + " ải núi "; }).join(", ");
  }

  function ebbinghausIntroHtml(plan, progressDay, todayPlan) {
    if (!plan || !plan.dayRows) {
      return noticesHtml([" ngải cứu hoặc ngải đắng khách mời to lớn Slovakia xông qua rào cản: mỗi ải núi trước cách diễn đạt mới(5 sinh mệnh · 18 giây)→ Ôn tập(20 Câu hỏi · 3 sinh mệnh) "]);
    }
    progressDay = Math.floor(Number(progressDay) || 0) || 1;
    var stageNew = todayPlan && todayPlan.new ? ("List " + todayPlan.new) : "-";
    var stageRev = todayPlan && todayPlan.reviews && todayPlan.reviews.length
      ? todayPlan.reviews.map(function (n) { return "List " + n; }).join(", ")
      : "-";

    var listNos = Object.keys(plan.listIndex).sort(function (a, b) {
      return Number(a) - Number(b);
    });
    var listRows = listNos.map(function (no) {
      var li = plan.listIndex[no];
      var cls = "";
      if (todayPlan) {
        if (todayPlan.new === Number(no) || (todayPlan.reviews || []).indexOf(Number(no)) >= 0) {
          cls = " is-today";
        }
      }
      return '<tr class="' + cls + '"><td>List ' + no + "</td><td>Thứ " + (li.newDay || "-") +
        " ải núi</td><td>" + formatReviewStages(li.reviewDays) + "</td></tr>";
    }).join("");

    var dayRows = plan.dayRows.map(function (row) {
      var cls = row.day === progressDay ? " is-today" : "";
      var newPart = row.new ? (" viết tắt của Tân Cương List " + row.new) : "-";
      var revPart = row.reviews.length
        ? row.reviews.map(function (r) { return "L" + r; }).join(", ")
        : "-";
      return '<tr class="' + cls + '"><td>Thứ ' + row.day + " ải núi</td><td>" + newPart +
        "</td><td>" + revPart + "</td></tr>";
    }).join("");

    return (
      '<details class="vc-ebb-intro">' +
        '<summary class="vc-ebb-intro-sum">' +
          '<span class="vc-ebb-intro-title">ngải cứu hoặc ngải đắng khách mời to lớn Slovakia khoa học xông qua rào cản</span>' +
          '<span class="vc-ebb-intro-teaser">kết hợp nhớ đường cong sắp xếp cách diễn đạt mới biến thể của | xem lại · nhấn mở ra quy tắc biến thể của | ' +
            plan.totalDays + " ải núi hoàn chỉnh kế hoạch</span>" +
        "</summary>" +
        '<div class="vc-ebb-intro-body">' +
          '<p class="vc-ebb-intro-lead">gốc xông qua rào cản sẽ<strong>ngải cứu hoặc ngải đắng khách mời to lớn Slovakia quên đường cong</strong>xé mở thành công <strong>' + plan.totalDays +
            " ải núi</strong>học nhiệm vụ: tồn tại cách diễn đạt mới học hoàng hậu của điểm mấu chốt điểm nút tự động sắp xếp xem lại, sự giúp đỡ bạn tồn tại đúng của thời gian củng cố nhớ </p>" +
          '<p class="vc-ebb-intro-note">ải núi đếm nhấn bạn<strong>hoàn thành nhiệm vụ của tốc độ tiến triển</strong>thúc đẩy, biến thể của | lịch ngày tháng không liên quan; tốc độ tiến triển nhanh nếu, một ngày bên trong có thể liên tục hoàn thành nhiều ải núi </p>' +
          '<ul class="vc-ebb-rules">' +
            "<li><strong>mỗi ải núi trình tự</strong>: trước hoàn thành gốc ải núi<strong>cách diễn đạt mới xông qua rào cản</strong>, lại làm gốc ải núi<strong>xem lại phát hiện</strong> </li>" +
            "<li><strong>cách diễn đạt mới phát hiện</strong>: cười phát âm → lựa chọn ngôn ngữ công lý → đánh vần tiếng Anh; <strong>5 sinh mệnh</strong>, mỗi chủ đề <strong>18 giây</strong>; lỗi biến thể cũ của | tại hiện trường lặp lại khảo sát đến tất cả đúng </li>" +
            "<li><strong>xem lại phát hiện</strong>: biến thể của | đã học List rút ra <strong>20 Câu hỏi</strong>(lỗi chủ đề thêm trọng số); <strong>3 sinh mệnh</strong>; đi qua hoàng hậu viết đi vào rút ra khảo sát ao </li>" +
            "<li><strong>thực thể toàn bộ nhịp điệu</strong>: " + plan.totalLists + " cái List phân tán tồn tại <strong>" + plan.totalDays +
              " ải núi</strong>Trung Quốc hoàn thành; từ chung chỉ các dân tộc hoặc quốc gia ở nam Trung Quốc hoặc nam Châu Á trong các thời kỳ lịch sử khác nhau từ bây giờ xem lại nhiệm vụ từ chung chỉ các dân tộc hoặc quốc gia ở nam Trung Quốc hoặc nam Châu Á trong các thời kỳ lịch sử khác nhau nhiều, mời giữ học nhịp điệu </li>" +
          "</ul>" +
          '<div class="vc-ebb-today-plan">' +
            "<strong>bạn thời điểm hiện tại tốc độ tiến triển: Thứ " + progressDay + " ải núi</strong>" +
            " · gốc ải núi cách diễn đạt mới " + stageNew + " · gốc ải núi xem lại " + stageRev +
          "</div>" +
          '<details class="vc-ebb-sub">' +
            '<summary>nhấn List xem xét: mỗi dùng trong | List của cách diễn đạt mới ải núi biến thể của | xem lại ải núi</summary>' +
            '<div class="vc-ebb-scroll">' +
              '<table class="vc-ebb-table">' +
                "<thead><tr><th>List</th><th>cách diễn đạt mới ải núi</th><th>xem lại ải núi</th></tr></thead>" +
                "<tbody>" + listRows + "</tbody>" +
              "</table>" +
            "</div>" +
          "</details>" +
          '<details class="vc-ebb-sub">' +
            '<summary>nhấn ải núi xem xét: ' + plan.totalDays + " ải núi hoàn chỉnh nhiệm vụ bề mặt bên ngoài</summary>" +
            '<div class="vc-ebb-scroll vc-ebb-scroll--tall">' +
              '<table class="vc-ebb-table">' +
                "<thead><tr><th>tốc độ tiến triển ải núi</th><th>gốc ải núi cách diễn đạt mới</th><th>gốc ải núi xem lại List</th></tr></thead>" +
                "<tbody>" + dayRows + "</tbody>" +
              "</table>" +
            "</div>" +
          "</details>" +
        "</div>" +
      "</details>"
    );
  }

  function setQuizCounter() {
    var el = document.getElementById("vc-counter");
    if (!el) return;
    var n = (session.idx + 1) + "</strong> / " + session.words.length + " · phần còn lại sự sống " + session.lives;
    if (session.phase === "practice") {
      el.innerHTML = " Thứ <strong>" + n;
      return;
    }
    el.innerHTML = phaseLabel(session.phase) + " · Thứ <strong>" + n;
  }

  function updateLives() {
    var el = document.getElementById("lives");
    if (el) {
      var h = "";
      var maxL = session.livesMax || HP_MAX;
      for (var i = 0; i < maxL; i++) {
        h += '<span class="heart' + (i >= session.lives ? " lost" : "") + '">❤️</span>';
      }
      el.innerHTML = h;
    }
    setQuizCounter();
  }

  function clearTimer() {
    if (session.timer) {
      clearInterval(session.timer);
      session.timer = null;
    }
  }

  function tickTimer() {
    session.timerLeft--;
    var num = document.getElementById("timerNum");
    if (num) {
      num.textContent = session.timerLeft;
      num.classList.toggle("warning", session.timerLeft <= 3);
    }
    if (session.timerLeft <= 0) {
      clearTimer();
      if (!session.answered && !session.gameOver && !session.imeBlocked) onTimeout();
    }
  }

  function startTimer() {
    clearTimer();
    session.timerPaused = false;
    session.timerLeft = TIME_SEC;
    var wrap = document.getElementById("timerWrap");
    var num = document.getElementById("timerNum");
    if (wrap) wrap.style.display = "block";
    if (num) {
      num.textContent = session.timerLeft;
      num.className = "num";
    }
    session.timer = setInterval(tickTimer, 1000);
  }

  function pauseTimerForIme() {
    clearTimer();
    session.timerPaused = true;
  }

  function resumeTimerIfNeeded() {
    if (!session.timerPaused || session.answered || session.gameOver || session.imeBlocked) return;
    session.timerPaused = false;
    if (session.timerLeft <= 0) return;
    session.timer = setInterval(tickTimer, 1000);
  }

  function requireImeGate(reason, cb) {
    if (reason === "start" && session.imeGatePassed) {
      cb();
      return;
    }
    session.imeBlocked = true;
    pauseTimerForIme();
    var gate = window.YYSD_IME_GATE;
    var p = gate
      ? gate.require({ reason: reason, strikes: reason === "violation" ? session.imeViolations : 0 })
      : Promise.resolve();
    p.then(function () {
      session.imeBlocked = false;
      session.imeGatePassed = true;
      cb();
    });
  }

  function handleImeCheat() {
    session.gameOver = true;
    session.imeBlocked = true;
    pauseTimerForIme();
    if (window.YYSD_IME_GATE) YYSD_IME_GATE.reset();
    var gate = window.YYSD_IME_GATE;
    var isPractice = session.phase === "practice";
    if (!gate || !gate.showCheat) {
      alert(" nhiều lần chuyển đổi ngôn ngữ Trung Quốc phương pháp nhập, gốc tiếp theo kiểm tra đã trở nên không hiệu lực ");
      location.href = isPractice ? "vocab-challenge.html?view=notebook" : "vocab-challenge.html";
      return;
    }
    gate.showCheat({
      onRestart: function () {
        if (isPractice) {
          startPractice();
          return;
        }
        var listNo = session.listNo;
        var taskType = session.taskType;
        var attemptId = session.attemptId;
        var go = function () {
          session.attemptId = 0;
          startChallenge(listNo, taskType);
        };
        if (attemptId) {
          A.api("/api/vocab-challenge/void", {
            method: "POST",
            body: { attemptId: attemptId }
          }).finally(go);
        } else {
          go();
        }
      },
      onExit: function () {
        if (isPractice) {
          location.href = "vocab-challenge.html?view=notebook";
          return;
        }
        if (session.attemptId) {
          A.api("/api/vocab-challenge/void", {
            method: "POST",
            body: { attemptId: session.attemptId }
          }).finally(function () {
            session.attemptId = 0;
            renderHub();
          });
        } else {
          renderHub();
        }
      }
    });
  }

  function onImeViolation() {
    if (session.imeBlocked || session.answered || session.gameOver) return;
    if (window.YYSD_IME_GATE && window.YYSD_IME_GATE.isOpen()) return;
    if (session.imeDebounce) return;
    session.imeDebounce = setTimeout(function () { session.imeDebounce = null; }, 1200);
    session.imeViolations++;
    var limit = (window.YYSD_IME_GATE && YYSD_IME_GATE.CHEAT_LIMIT) || 3;
    if (session.imeViolations > limit) {
      handleImeCheat();
      return;
    }
    requireImeGate("violation", function () {
      resumeTimerIfNeeded();
      var spell = document.getElementById("spell");
      if (spell && !spell.disabled) spell.focus();
    });
  }

  // ---- hub ----

  function renderHub() {
    shell('<div class="state state--brand"><div class="spinner spinner--brand"></div>tải tốc độ tiến triển...</div>', " tốc độ tiến triển ");
    Promise.all([
      A.api("/api/vocab-challenge/me" + bookQs()),
      A.api("/api/vocab-challenge/lists" + bookQs()).catch(function (e) { return e; })
    ]).then(function (pair) {
      var me = pair[0];
      var lists = pair[1];
      if (!me || !me.ok) {
        shell('<p class="vs-empty">Tải không thành công, mời cải tiến thử lại </p>', " Sai ");
        return;
      }
      if (!me.assigned) {
        shell(
          '<p class="vc-notice vc-notice--warn">giáo viên chưa làm bạn sắp xếp xông qua rào cản biến thể cũ của | sách sắp xếp hoàng hậu tương đương với biến thể của | List 1 bắt đầu theo đuổi cấp mở khóa </p>' +
          '<div class="vc-actions"><a class="vl-btn" href="zone.html?zone=study">trở về từ khu vực</a></div>',
          " ở lại sắp xếp "
        );
        return;
      }
      if (me.needsBook) {
        var picker = '<p class="vc-notice">giáo viên làm bạn sắp xếp hoàn thành nhiều gốc xông qua rào cản biến thể cũ của | sách, mời chọn một gốc đi vào: </p>' +
          '<div class="vc-actions">' +
          (me.assignments || []).map(function (a) {
            return '<a class="vl-btn vl-btn-primary" href="vocab-challenge.html?book=' +
              encodeURIComponent(a.bookId) + '">' + esc(a.bookLabel || a.bookId) + "</a>";
          }).join("") +
          "</div>";
        if (bookParam) {
          shell('<p class="vc-notice vc-notice--warn">nên biến thể cũ của | sách chưa sắp xếp </p>' + picker, " chọn biến thể cũ của | sách ");
        } else {
          shell(picker, " chọn biến thể cũ của | sách ");
        }
        return;
      }
      if (!lists || !lists.ok) {
        shell('<p class="vs-empty">' + esc((lists && (lists.error || lists.message)) || " không thể tải List") + "</p>", " Sai ");
        return;
      }
      var prog = lists.progress || me.progress || {};
      var pool = me.pool || {};
      var isEbb = !!(lists.progressDay || (me.todayTasks && me.todayTasks.length));
      var todayTasks = lists.todayTasks || me.todayTasks || [];
      var programComplete = !!(lists.programComplete || me.programComplete);
      var progressDay = lists.progressDay || me.progressDay || (prog.progressDay || 1);

      var chips = (lists.lists || []).map(function (l) {
        var cls = "vc-list-chip";
        if (l.cleared || l.clearedNew) cls += " is-cleared is-open";
        else if (l.unlocked) cls += " is-open";
        if (l.current) cls += " is-current";
        if (l.todayRole === "new") cls += " is-today-new";
        if (l.todayRole === "review") cls += " is-today-review";
        if (l.todayStatus === "completed") cls += " is-done-today";
        var sub = l.cleared || l.clearedNew ? " đã đi qua " : l.todayRole === "new" ? " gốc ải núi viết tắt của Tân Cương " :
          l.todayRole === "review" ? " gốc ải núi xem lại " : l.unlocked ? " đã học " : " khóa ";
        return '<div class="' + cls + '"><span>L' + l.listNo + "</span>" +
          "<small>" + sub + "</small></div>";
      }).join("");

      var passedStages = lists.stages && lists.stages.stages
        ? lists.stages.stages.filter(function (s) { return s.status === "completed"; }).length
        : 0;
      var stageGrid = isEbb ? stageGridHtml(lists.stages, progressDay) : "";

      var learnHref = "";
      var cur = (lists.lists || []).filter(function (l) {
        return l.todayRole === "new" && l.todayStatus !== "completed";
      })[0];
      if (!cur) {
        cur = (lists.lists || []).filter(function (l) { return l.current; })[0];
      }
      if (cur) {
        learnHref = "vocab-learn.html?book=" + encodeURIComponent(lists.bookId) +
          "&list=" + encodeURIComponent(cur.id);
      }

      var todayHtml = "";
      if (isEbb) {
        if (programComplete) {
          todayHtml = '<p class="vc-notice">ngải cứu hoặc ngải đắng khách mời to lớn Slovakia ' +
            (((lists.ebbinghausPlan && lists.ebbinghausPlan.totalDays) || (prog.totalDays) || 78)) +
            " ải núi kế hoạch đã toàn bộ hoàn thành lỗi chủ đề gốc vẫn có thể luyện tập </p>";
        } else {
          todayHtml =
            '<section class="vc-day-card">' +
              '<h2 class="vc-day-title">Thứ ' + displayProgressDay(progressDay, programComplete) + " ải núi · gốc ải núi nhiệm vụ</h2>" +
              '<p class="vc-meta">trước hoàn thành cách diễn đạt mới, lại làm xem lại · cách diễn đạt mới 5 sinh mệnh · Ôn tập 20 Câu hỏi 3 sinh mệnh</p>' +
              '<ul class="vc-day-tasks">' +
              todayTasks.map(function (t) {
                var btn = "";
                if (t.canStart && t.status !== "completed" && !me.activeAttemptId) {
                  btn = '<button type="button" class="vl-btn vl-btn-sm vc-task-start" data-list="' +
                    t.listNo + '" data-type="' + esc(t.taskType) + '">' +
                    (t.status === "failed" ? " lặp lại khảo sát " : " Bắt đầu ") + "</button>";
                }
                return '<li class="vc-day-task vc-day-task--' + esc(t.status) + '">' +
                  "<span>List " + t.listNo + " · " + taskTypeLabel(t.taskType) +
                  " · " + taskStatusLabel(t.status, !!me.activeAttemptId) + "</span>" + btn + "</li>";
              }).join("") +
              "</ul></section>";
        }
      }

      var totalStages = (lists.ebbinghausPlan && lists.ebbinghausPlan.totalDays) ||
        (lists.stages && lists.stages.totalStages) || (prog.totalDays) || 78;
      var shownDay = displayProgressDay(progressDay, programComplete, totalStages);
      var metaLine = isEbb
        ? esc(lists.bookLabel || lists.bookId) +
          (programComplete
            ? " · đã hoàn thành " + shownDay + " / " + totalStages + " ải núi "
            : " · tốc độ tiến triển ải núi " + shownDay +
              " · đã đi qua " + passedStages + " / " + totalStages + " ải núi ")
        : esc(lists.bookLabel || lists.bookId) +
          " · đã thông quan List " + (prog.clearedListNo || 0) +
          " · xuống một ải núi List " + (prog.nextListNo || 1) +
          " · lặp lại khảo sát hạn ngạch " + (lists.retestQuota || 0) + " Câu hỏi ";

      var noticeLine = isEbb
        ? ""
        : " nhấn trình tự xông qua rào cản: cách diễn đạt mới(5 sinh mệnh · mỗi chủ đề 18 giây)→ lỗi biến thể cũ của | lặp lại khảo sát → thi bổ sung đến tất cả đúng ";

      var introHtml = isEbb
        ? ebbinghausIntroHtml(lists.ebbinghausPlan, progressDay, lists.todayPlan)
        : noticesHtml([noticeLine]);

      var resumeHtml = "";
      if (me.activeAttemptId) {
        resumeHtml =
          '<p class="vc-notice vc-notice--warn">bạn có tiến hành bắn trúng mục tiêu xông qua rào cản, có thể tiếp tục hoàn thành có thể rút lui trở nên không hiệu lực </p>' +
          '<div class="vc-actions"><button type="button" class="vl-btn vl-btn-primary" id="vc-resume">tiếp tục xông qua rào cản</button></div>';
      }

      shell(
        introHtml +
        todayHtml +
        resumeHtml +
        '<p class="vc-meta">' + metaLine +
        '</p><p class="vc-meta">rút ra khảo sát ao ' + (pool.active || 0) +
          " · cứng đầu biến thể cũ của | " + (pool.stubborn || 0) +
          " · Sổ lỗi sai " + (pool.notebook || 0) + "</p>" +
        (isEbb ? stageGrid : ('<div class="vc-list-grid">' + chips + "</div>")) +
        '<div class="vc-actions">' +
          (!isEbb
            ? '<button type="button" class="vl-btn vl-btn-primary" id="vc-start">Bắt đầu List ' +
              (prog.nextListNo || 1) + "</button>"
            : "") +
          (learnHref
            ? '<a class="vl-btn" href="' + esc(learnHref) + '">trước học gốc List</a>'
            : "") +
          '<a class="vl-btn" href="vocab-challenge.html?view=notebook">Sổ lỗi sai</a>' +
          '<a class="vl-btn" href="zone.html?zone=study">Quay lại</a>' +
        "</div>",
        lists.bookLabel || " xông qua rào cản "
      );

      root.querySelectorAll(".vc-task-start").forEach(function (btn) {
        btn.onclick = function () {
          startChallenge(
            Number(btn.getAttribute("data-list")),
            btn.getAttribute("data-type") || "new"
          );
        };
      });
      if (isEbb && lists.stages) {
        root.querySelectorAll(".vc-stage-chip.is-completed[data-stage]").forEach(function (chip) {
          chip.onclick = function () {
            renderStagePanel(Number(chip.getAttribute("data-stage")), lists.stages);
          };
          chip.onkeydown = function (e) {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              chip.click();
            }
          };
        });
      }
      var startBtn = document.getElementById("vc-start");
      if (startBtn) {
        startBtn.onclick = function () {
          startChallenge(prog.nextListNo || 1, "new");
        };
      }
      var resumeBtn = document.getElementById("vc-resume");
      if (resumeBtn) {
        resumeBtn.onclick = function () {
          A.api("/api/vocab-challenge/attempt?id=" + encodeURIComponent(me.activeAttemptId))
            .then(function (d) {
              if (d && d.ok) enterPhase(d);
              else renderHub();
            })
            .catch(function () { renderHub(); });
        };
      }
    }).catch(function (e) {
      var msg = (e && e.message) || "";
      if (msg.indexOf(" học sinh số tài khoản ") >= 0 || (A.isTeacher && A.isTeacher())) {
        shell(
          '<p class="vc-notice vc-notice--warn">giáo viên số tài khoản không thể trực tiếp xông qua rào cản mời trước theo một tôn giáo giáo viên cuối chuyển đổi đến«trang web chức năng khu vực», lại mở gốc đầu </p>' +
          '<div class="vc-actions"><a class="vl-btn vl-btn-primary" href="teacher-mode-picker.html">chọn trang web chức năng khu vực</a></div>',
          " giáo viên xem trước "
        );
        return;
      }
      shell('<p class="vs-empty">' + esc(msg || " Tải không thành công, mời cải tiến thử lại ") + "</p>", " Sai ");
    });
  }

  function startChallenge(listNo, taskType) {
    session.imeGatePassed = false;
    session.imeViolations = 0;
    if (session.imeDebounce) {
      clearTimeout(session.imeDebounce);
      session.imeDebounce = null;
    }
    session.pendingStart = { listNo: listNo, taskType: taskType || "new" };
    requireImeGate("start", function () {
      shell('<div class="state state--brand"><div class="spinner spinner--brand"></div>sự chuẩn bị chủ đề...</div>', " Bắt đầu ");
      var body = {};
      if (listNo) body.listNo = listNo;
      if (taskType) body.taskType = taskType;
      if (bookParam) body.bookId = bookParam;
      A.api("/api/vocab-challenge/start", { method: "POST", body: body })
        .then(function (d) {
          if (!d || !d.ok) {
            shell(
              '<p class="vc-notice vc-notice--warn">' + esc((d && d.error) || " không thể bắt đầu ") + "</p>" +
              '<div class="vc-actions"><button type="button" class="vl-btn" id="vc-back">Quay lại</button></div>',
              " Sai "
            );
            document.getElementById("vc-back").onclick = renderHub;
            return;
          }
          enterPhase(d);
        })
        .catch(function (e) {
          shell(
            '<p class="vc-notice vc-notice--warn">' + esc((e && e.message) || " bắt đầu bị đánh bại ") + "</p>" +
            '<div class="vc-actions"><button type="button" class="vl-btn" id="vc-back">Quay lại</button></div>',
            " Sai "
          );
          var back = document.getElementById("vc-back");
          if (back) back.onclick = renderHub;
        });
    });
  }

  function enterPhase(d) {
    // ponytail: submit-new/makeup responses omitted attemptId before fix - keep session id
    session.attemptId = d.attemptId || session.attemptId;
    session.phase = d.phase;
    session.listId = d.listId || session.listId || "";
    session.listNo = d.listNo || session.listNo || 0;
    session.taskType = d.taskType || session.taskType ||
      (d.phase === "scheduled_review" ? "review" : "new");
    session.notices = d.notices || [];
    mergeOptionBank(d.optionBank);
    mergeOptionBank((d.items || []).map(parseWord).map(quizMeaning));
    var saved = loadQuizDraft(session.attemptId, session.phase);
    if (saved) {
      session.words = saved.words;
      session.answers = saved.answers || [];
      session.livesMax = saved.livesMax || d.livesMax ||
        (session.taskType === "review" ? HP_REVIEW : HP_MAX);
      session.lives = saved.lives != null ? saved.lives : session.livesMax;
      session.idx = saved.waiting ? (saved.idx + 1) : (saved.idx || 0);
      if (session.idx < 0) session.idx = 0;
      if (session.idx > session.words.length) session.idx = session.words.length;
      session.gameOver = session.lives <= 0;
      session.waiting = false;
      if (saved.optionBank && saved.optionBank.length) mergeOptionBank(saved.optionBank);
    } else {
      session.words = shuffle((d.items || []).map(parseWord).filter(function (w) { return w.word; }));
      session.answers = [];
      session.idx = 0;
      session.livesMax = d.livesMax || (session.taskType === "review" ? HP_REVIEW : HP_MAX);
      session.lives = session.livesMax;
      session.gameOver = false;
      session.waiting = false;
      saveQuizDraft();
    }

    if (d.cleared || d.phase === "cleared") {
      clearQuizDraft(session.attemptId);
      renderCleared(d);
      return;
    }

    if (session.phase === "retest" && !session.words.length) {
      shell(
        noticesHtml(session.notices) +
        '<p class="vc-meta">gốc giai đoạn không cần thiết trả lời </p>' +
        '<div class="vc-actions">' +
          '<button type="button" class="vl-btn vl-btn-primary" id="vc-empty-pass">xác nhận thông quan</button>' +
        "</div>",
        " lặp lại khảo sát "
      );
      document.getElementById("vc-empty-pass").onclick = function () {
        A.api("/api/vocab-challenge/submit-review", {
          method: "POST",
          body: { attemptId: session.attemptId, answers: [] }
        }).then(function (r) {
          if (r && r.cleared) renderCleared(r);
          else enterPhase(r);
        });
      };
      return;
    }

    if (session.gameOver || session.idx >= session.words.length) {
      if (session.gameOver) padUnansweredWrong();
      finishPhase();
      return;
    }

    beginQuestionPhase();
  }

  function beginQuestionPhase() {
    requireImeGate("start", renderQuestion);
  }

  function revealSpellRow(focus) {
    var row = document.getElementById("spellRow");
    if (!row) return;
    if (!row.classList.contains("is-open")) {
      row.hidden = false;
      void row.offsetWidth;
      row.classList.add("is-open");
    }
    var submit = document.getElementById("submit");
    if (submit) submit.disabled = false;
    var spell = document.getElementById("spell");
    bindEnglishSpellInput(spell);
    if (focus && spell && !spell.disabled) spell.focus();
  }

  function lockQuizControls() {
    var spell = document.getElementById("spell");
    var submit = document.getElementById("submit");
    if (spell) spell.disabled = true;
    if (submit) submit.disabled = true;
    root.querySelectorAll(".vl-opt").forEach(function (b) { b.classList.add("disabled"); });
  }

  function paintMeaningResult(w, meaningOk) {
    root.querySelectorAll(".vl-opt").forEach(function (b) {
      b.classList.remove("selected");
      if (b.getAttribute("data-v") === quizMeaning(w)) b.classList.add("correct");
      else if (b.getAttribute("data-v") === session.selectedMeaning && !meaningOk) b.classList.add("wrong");
    });
  }

  function paintSpellResult(spellOk) {
    var spell = document.getElementById("spell");
    if (!spell) return;
    spell.classList.remove("spell-ok", "spell-bad");
    spell.classList.add(spellOk ? "spell-ok" : "spell-bad");
  }

  function padUnansweredWrong() {
    var seen = {};
    session.answers.forEach(function (a) { seen[a.word] = true; });
    session.words.forEach(function (w) {
      if (!seen[w.word]) {
        session.answers.push({ word: w.word, correct: false, userAnswer: "(lives)", userMeaning: "" });
      }
    });
  }

  function afterAnswer() {
    session.waiting = true;
    saveQuizDraft();
    var nextBtn = document.getElementById("qnext");
    var isPractice = session.phase === "practice";
    if (session.lives <= 0) {
      if (nextBtn) nextBtn.disabled = true;
      session.gameOver = true;
      setTimeout(function () {
        if (isPractice) {
          session.idx = session.words.length;
          renderPracticeQ();
        } else {
          padUnansweredWrong();
          finishPhase();
        }
      }, 900);
      return;
    }
    if (session.idx >= session.words.length - 1) {
      if (nextBtn) nextBtn.disabled = true;
      setTimeout(function () {
        if (isPractice) {
          session.idx += 1;
          renderPracticeQ();
        } else {
          finishPhase();
        }
      }, 900);
      return;
    }
    if (nextBtn) nextBtn.disabled = false;
  }

  function applyGrade(w, timeout) {
    if (session.answered || session.gameOver) return;
    var spellEl = document.getElementById("spell");
    var spellRaw = spellEl ? spellEl.value.trim() : "";
    var spell = spellRaw.toLowerCase();
    var meaningOk = !!(session.selectedMeaning && session.selectedMeaning === quizMeaning(w));
    var spellOk = spellMatches(spellRaw, spellForms(w));
    var ok = meaningOk && spellOk;
    if (!timeout) {
      if (!session.selectedMeaning) return "needMeaning";
      if (!spell) return "needSpell";
    }
    session.answered = true;
    clearTimer();
    revealSpellRow(false);
    lockQuizControls();
    paintMeaningResult(w, meaningOk);
    paintSpellResult(spellOk);
    var fb = document.getElementById("fb");
    if (ok) {
      fb.className = "vl-feedback show ok";
      fb.textContent = timeout ? "✅ thời gian đến, nhưng trả lời đúng! " : "✅ hoàn chỉnh đúng! ";
    } else {
      session.lives = Math.max(0, session.lives - 1);
      updateLives();
      fb.className = "vl-feedback show " + (timeout ? "timeout" : "fail");
      fb.textContent = timeout
        ? ("⏰ thời gian đến! Đáp án: " + w.word + "(" + quizMeaning(w) + ")")
        : ("❌ Đáp án đúng: " + w.word + "(" + quizMeaning(w) + ")");
    }
    session.answers.push({
      word: w.word,
      correct: ok,
      userAnswer: timeout ? (spellRaw || "(timeout)") : spell,
      userMeaning: session.selectedMeaning || ""
    });
    afterAnswer();
    return "ok";
  }

  function onTimeout() {
    var w = session.words[session.idx];
    if (!w) return;
    applyGrade(w, true);
  }

  function bindQuizQuestion(w) {
    document.getElementById("listen").onclick = function () { speak(w.word); };
    speak(w.word);
    document.getElementById("opts").onclick = function (e) {
      var b = e.target.closest(".vl-opt");
      if (!b || session.answered) return;
      root.querySelectorAll(".vl-opt").forEach(function (x) { x.classList.remove("selected"); });
      b.classList.add("selected");
      session.selectedMeaning = b.getAttribute("data-v");
      var fb = document.getElementById("fb");
      if (fb && !session.answered) {
        fb.className = "vl-feedback";
        fb.textContent = "";
      }
      revealSpellRow(true);
    };
    function submitQuiz() {
      var r = applyGrade(w, false);
      if (r === "needMeaning") {
        var fb = document.getElementById("fb");
        if (fb) { fb.className = "vl-feedback show fail"; fb.textContent = " mời trước chọn ngôn ngữ Trung Quốc ý nghĩa "; }
      } else if (r === "needSpell") {
        var fb = document.getElementById("fb");
        if (fb) { fb.className = "vl-feedback show fail"; fb.textContent = " mời trước đánh vần tiếng Anh "; }
        var spellEl = document.getElementById("spell");
        if (spellEl) spellEl.focus();
      }
    }
    document.getElementById("submit").onclick = submitQuiz;
    bindEnglishSpellInput(document.getElementById("spell"));
    document.getElementById("spell").onkeydown = function (e) {
      if (e.key === "Enter") submitQuiz();
    };
    document.getElementById("qnext").onclick = function () {
      if (session.gameOver || !session.waiting) return;
      session.idx += 1;
      if (session.phase === "practice") renderPracticeQ();
      else renderQuestion();
    };
    var abort = document.getElementById("vc-abort");
    if (abort) {
      abort.onclick = function () {
        if (session.phase === "practice") {
          clearTimer();
          renderHub();
          return;
        }
        if (!confirm(" rút lui sẽ trở nên không hiệu lực gốc tiếp theo xông qua rào cản, rõ ràng? ")) return;
        clearTimer();
        var aid = session.attemptId;
        A.api("/api/vocab-challenge/void", {
          method: "POST",
          body: { attemptId: aid }
        }).finally(function () {
          clearQuizDraft(aid);
          session.attemptId = 0;
          renderHub();
        });
      };
    }
    startTimer();
  }

  function questionInner(hint, showAbort) {
    var w = session.words[session.idx];
    var opts = meaningOptions(w, session.words, 4);
    var labels = ["A", "B", "C", "D"];
    return noticesHtml(session.idx === 0 ? session.notices : []) +
      '<p class="vl-listen-hint">' + esc(hint) + "</p>" +
      '<button type="button" class="vl-btn" id="listen">🔊 phát sóng phát âm</button>' +
      '<div class="vl-opts" id="opts">' +
        opts.map(function (o, i) {
          return '<button type="button" class="vl-opt" data-v="' + esc(o) + '"><span class="label">' +
            labels[i] + ".</span> " + esc(o) + "</button>";
        }).join("") +
      "</div>" +
      '<div class="vl-spell-row" id="spellRow" hidden>' +
        '<input type="text" id="spell" lang="en" inputmode="latin" placeholder=" tiếng Anh đánh vần(mời sử dụng tiếng Anh phương pháp nhập)" ' +
          'autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />' +
        '<button type="button" class="vl-btn vl-btn-primary" id="submit" disabled>Nộp bài</button>' +
      "</div>" +
      '<div class="vl-feedback" id="fb"></div>' +
      '<div class="vl-nav-row">' +
        (showAbort
          ? '<button type="button" class="vl-btn vl-btn-abort" id="vc-abort">rút lui và trở nên không hiệu lực</button>'
          : (session.phase === "practice"
            ? '<button type="button" class="vl-btn vl-btn-abort" id="vc-abort">rút lui luyện tập</button>'
            : "")) +
        '<button type="button" class="vl-btn vl-btn-primary" id="qnext" disabled>xuống một chủ đề →</button>' +
      "</div>";
  }

  function renderQuestion() {
    var w = session.words[session.idx];
    if (!w) {
      finishPhase();
      return;
    }
    session.selectedMeaning = null;
    session.answered = false;
    session.waiting = false;
    saveQuizDraft();
    shell(
      questionInner(phaseLabel(session.phase) + " · cười phát âm, trước lựa chọn ngôn ngữ ý nghĩa, lại đánh vần tiếng Anh ", true),
      "List " + session.listNo,
      { showLives: true, showTimer: true }
    );
    setQuizCounter();
    bindQuizQuestion(w);
  }

  function finishPhase() {
    clearQuizDraft(session.attemptId);
    shell('<div class="state state--brand"><div class="spinner spinner--brand"></div>nộp Trung Quốc...</div>', " Nộp bài ");
    var path = session.phase === "new_words"
      ? "/api/vocab-challenge/submit-new"
      : session.phase === "scheduled_review"
        ? "/api/vocab-challenge/submit-scheduled-review"
        : "/api/vocab-challenge/submit-review";
    A.api(path, {
      method: "POST",
      body: { attemptId: session.attemptId, answers: session.answers }
    }).then(function (d) {
      if (!d || !d.ok) {
        shell(
          '<p class="vc-notice vc-notice--warn">' + esc((d && d.error) || " nộp bị đánh bại ") + "</p>" +
          '<div class="vc-actions"><button type="button" class="vl-btn" id="vc-back">Quay lại</button></div>',
          " Sai "
        );
        document.getElementById("vc-back").onclick = renderHub;
        return;
      }
      if (d.failed) {
        var isReviewFail = session.phase === "scheduled_review";
        var maxL = session.livesMax || HP_MAX;
        A.api("/api/vocab-challenge/me" + bookQs()).then(function (me) {
          var bid = (me && me.assignment && me.assignment.bookId) || "";
          var href = session.listId
            ? ("vocab-learn.html?book=" + encodeURIComponent(bid) +
              "&list=" + encodeURIComponent(session.listId))
            : "vocab-challenge.html";
          shell(
            noticesHtml(d.notices || [], true) +
            '<p class="vc-meta">sự sống tiêu hao · Sai ' + (d.wrongCount || 0) + " cái(" + maxL +
              " sinh mệnh sử dụng hết " + (isReviewFail ? ", sẽ lại rút ra chủ đề " : ", chưa ghi chép đi vào lỗi chủ đề ") + ")</p>" +
            '<div class="vc-actions">' +
              '<button type="button" class="vl-btn vl-btn-primary" id="vc-retry">trực tiếp lặp lại đánh</button>' +
              (!isReviewFail
                ? '<a class="vl-btn" href="' + esc(href) + '">trước đi học</a>'
                : "") +
              '<button type="button" class="vl-btn" id="vc-hub">trở về tốc độ tiến triển</button>' +
            "</div>",
            " chưa đi qua "
          );
          document.getElementById("vc-retry").onclick = function () {
            var ps = session.pendingStart || {};
            startChallenge(ps.listNo || session.listNo, ps.taskType || session.taskType);
          };
          document.getElementById("vc-hub").onclick = renderHub;
        });
        return;
      }
      if (d.cleared) {
        renderCleared(d);
        return;
      }
      enterPhase(d);
    }).catch(function (err) {
      shell(
        '<p class="vc-notice vc-notice--warn">' + esc((err && err.message) || " nộp bị đánh bại ") + "</p>" +
        '<div class="vc-actions"><button type="button" class="vl-btn" id="vc-back">Quay lại</button></div>',
        " Sai "
      );
      var back = document.getElementById("vc-back");
      if (back) back.onclick = renderHub;
    });
  }

  function renderCleared(d) {
    session.attemptId = 0;
    var prog = d.progress || {};
    var dayNote = d.dayAdvanced ? '<p class="vc-notice">gốc ải núi nhiệm vụ đã toàn bộ hoàn thành, đã đi vào xuống một ải núi </p>' : "";
    var shown = displayProgressDay(
      prog.progressDay,
      !!(d.todayTasks && d.todayTasks.programComplete)
    );
    shell(
      noticesHtml(d.notices || []) +
      dayNote +
      (d.stubbornReleased && d.stubbornReleased.length
        ? noticesHtml([" cứng đầu biến thể cũ của | khi thời gian đến gần cho qua: " + d.stubbornReleased.join(", ")], true)
        : "") +
      '<p class="vc-meta">' +
        (prog.progressDay
          ? " tốc độ tiến triển ải núi " + shown + " · đã đi qua cách diễn đạt mới List " + (prog.clearedListNo || session.listNo)
          : " đã thông quan đến List " + (prog.clearedListNo || session.listNo) +
            " · xuống một ải núi List " + (prog.nextListNo || ((prog.clearedListNo || 0) + 1))) +
      "</p>" +
      '<div class="vc-actions">' +
        '<button type="button" class="vl-btn vl-btn-primary" id="vc-hub">trở về gốc ải núi nhiệm vụ</button>' +
      "</div>",
      " thông quan "
    );
    document.getElementById("vc-hub").onclick = renderHub;
  }

  // ---- notebook ----

  function renderNotebook() {
    shell('<div class="state state--brand"><div class="spinner spinner--brand"></div>tải lỗi chủ đề gốc...</div>', " Sổ lỗi sai ");
    A.api("/api/vocab-challenge/notebook" + bookQs())
      .then(function (d) {
        if (!d || !d.ok) {
          shell('<p class="vs-empty">' + esc((d && d.error) || " Tải không thành công ") + "</p>", " Sổ lỗi sai ");
          return;
        }
        var rows = d.words || [];
        var body = rows.length
          ? rows.map(function (r) {
              return '<div class="vc-nb-row"><div><b>' + esc(r.word) + "</b> " +
                '<span class="vc-meta">' + esc(r.ipa || "") + "</span><br>" +
                '<span class="vc-meta">' + esc(r.meaning || "") + "</span></div>" +
                "<div class=\"vc-nb-miss\">lỗi " + (r.missCount || 1) + " tiếp theo</div></div>";
            }).join("")
          : '<p class="vs-empty">lỗi chủ đề gốc vẫn trống không của </p>';
        shell(
          '<p class="vc-notice">lỗi chủ đề gốc vĩnh cửu giữ; nơi này chủ động luyện tập không ảnh hưởng xông qua rào cản rút ra khảo sát ao </p>' +
          body +
          '<div class="vc-actions">' +
            (rows.length
              ? '<button type="button" class="vl-btn vl-btn-primary" id="vc-practice">bắt đầu lỗi biến thể cũ của | kiểm tra</button>'
              : "") +
            '<a class="vl-btn" href="vocab-challenge.html' +
              (bookParam ? "?book=" + encodeURIComponent(bookParam) : "") + '">trở về xông qua rào cản</a>' +
          "</div>",
          " Sổ lỗi sai · " + (rows.length || 0)
        );
        var btn = document.getElementById("vc-practice");
        if (btn) btn.onclick = startPractice;
      })
      .catch(function () {
        shell('<p class="vs-empty">Tải không thành công</p>', " Sổ lỗi sai ");
      });
  }

  function startListPractice(listNo, taskType, stageNo) {
    shell('<div class="state state--brand"><div class="spinner spinner--brand"></div>rút ra chủ đề...</div>', " luyện tập ");
    A.api(
      "/api/vocab-challenge/list-practice-pool?listNo=" + encodeURIComponent(listNo) +
        "&taskType=" + encodeURIComponent(taskType || "new") +
        (bookParam ? "&bookId=" + encodeURIComponent(bookParam) : "")
    )
      .then(function (d) {
        if (!d || !d.ok || !(d.words || []).length) {
          shell(
            '<p class="vs-empty">' + esc((d && d.error) || " không có có thể luyện tập của biến thể cũ của | ") + "</p>" +
            '<div class="vc-actions"><button type="button" class="vl-btn" id="vc-back-hub">Quay lại</button></div>',
            " luyện tập "
          );
          var back = document.getElementById("vc-back-hub");
          if (back) back.onclick = renderHub;
          return;
        }
        session.phase = "practice";
        session.attemptId = 0;
        session.practiceLabel = stageNo
          ? (" Thứ " + stageNo + " ải núi · List " + listNo + " · " + taskTypeLabel(taskType))
          : ("List " + listNo + " · " + taskTypeLabel(taskType));
        session.notices = [d.notice || " đã đi qua trạm kiểm soát luyện tập không ảnh hưởng xông qua rào cản tốc độ tiến triển biến thể của | rút ra khảo sát ao "];
        session.words = shuffle(d.words.map(parseWord).filter(function (w) { return w.word; }));
        mergeOptionBank(d.optionBank);
        mergeOptionBank(session.words.map(quizMeaning));
        session.answers = [];
        session.idx = 0;
        session.livesMax = HP_MAX;
        session.lives = HP_MAX;
        session.gameOver = false;
        session.waiting = false;
        session.imeViolations = 0;
        session.imeGatePassed = false;
        if (session.imeDebounce) {
          clearTimeout(session.imeDebounce);
          session.imeDebounce = null;
        }
        requireImeGate("start", renderPracticeQ);
      })
      .catch(function () {
        shell('<p class="vs-empty">Tải không thành công</p><div class="vc-actions"><button type="button" class="vl-btn" id="vc-back-hub">Quay lại</button></div>', " luyện tập ");
        var back = document.getElementById("vc-back-hub");
        if (back) back.onclick = renderHub;
      });
  }

  function startPractice() {
    shell('<div class="state state--brand"><div class="spinner spinner--brand"></div>rút ra chủ đề...</div>', " luyện tập ");
    A.api("/api/vocab-challenge/notebook/practice-pool?limit=20" +
      (bookParam ? "&bookId=" + encodeURIComponent(bookParam) : ""))
      .then(function (d) {
        if (!d || !d.ok || !(d.words || []).length) {
          shell('<p class="vs-empty">không có có thể luyện tập của biến thể cũ của |</p>', " luyện tập ");
          return;
        }
        session.phase = "practice";
        session.attemptId = 0;
        session.practiceLabel = " lỗi chủ đề gốc luyện tập ";
        session.notices = [d.notice || " lỗi chủ đề gốc luyện tập không ảnh hưởng xông qua rào cản rút ra khảo sát ao "];
        session.words = shuffle(d.words.map(parseWord).filter(function (w) { return w.word; }));
        mergeOptionBank(d.optionBank);
        mergeOptionBank(session.words.map(quizMeaning));
        session.answers = [];
        session.idx = 0;
        session.livesMax = HP_MAX;
        session.lives = HP_MAX;
        session.gameOver = false;
        session.waiting = false;
        session.imeViolations = 0;
        session.imeGatePassed = false;
        if (session.imeDebounce) {
          clearTimeout(session.imeDebounce);
          session.imeDebounce = null;
        }
        requireImeGate("start", renderPracticeQ);
      });
  }

  function renderPracticeQ() {
    var w = session.words[session.idx];
    if (!w) {
      var wrong = session.answers.filter(function (a) { return !a.correct; }).length;
      shell(
        noticesHtml(session.notices) +
        '<p class="vc-meta">luyện tập chấm dứt · đối với ' + (session.answers.length - wrong) +
          " / lỗi " + wrong + "(chưa tính toán đi vào rút ra khảo sát ao)</p>" +
        '<div class="vc-actions">' +
          '<a class="vl-btn vl-btn-primary" href="vocab-challenge.html?view=notebook">trở về lỗi chủ đề gốc</a>' +
          '<a class="vl-btn" href="vocab-challenge.html">xông qua rào cản trang chủ</a>' +
        "</div>",
        " luyện tập kết trái "
      );
      return;
    }
    session.selectedMeaning = null;
    session.answered = false;
    session.waiting = false;
    shell(
      questionInner((session.practiceLabel || " luyện tập ") + " · cười phát âm, trước lựa chọn ngôn ngữ ý nghĩa, lại đánh vần tiếng Anh ", false),
      " luyện tập ",
      { showLives: true, showTimer: true }
    );
    setQuizCounter();
    bindQuizQuestion(w);
  }

  // ---- boot ----

  if (!needAuth()) return;
  if (view === "notebook" || view === "practice") {
    if (view === "practice") startPractice();
    else renderNotebook();
  } else {
    renderHub();
  }
})();
