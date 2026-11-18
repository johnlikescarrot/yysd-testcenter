/* vocab-challenge-ui.js — vượt ải hub + A→D quiz + Sổ lỗi sai Luyện tập */
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
    return q.length? "?" + q.join("&"): "";
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
    return Y && Y.esc? Y.esc(String(s == null? "": s)): String(s == null? "": s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function needAuth() {
    if (!A ||!A.getToken ||!A.getToken()) {
      location.href = "login.html?next=" + encodeURIComponent(location.pathname + location.search);
      return false;
    }
    return true;
  }

  function speak(word) {
    var WA = window.YysdWordAudio;
    if (WA && WA.speakUs) { WA.speakUs(word); return; }
    if (WA && WA.speak) { WA.speak(word, 2); return; }
    if (!window.speechSynthesis ||!word) return;
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
    var accept = (wj && Array.isArray(wj.acceptCN))? wj.acceptCN.filter(Boolean): [];
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
    return !!(s && s.indexOf("Chưa có nghĩa") < 0 && s.trim().length > 1);
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
    var correct = isRealCn(quizMeaning(w))? quizMeaning(w): "";
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
    var opts = correct? [correct].concat(distract): distract;
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
        waiting:!!session.waiting,
        optionBank: session.optionBank || []
      }));
    } catch (e) { /* quota */ }
  }
  function loadQuizDraft(attemptId, phase) {
    try {
      var raw = sessionStorage.getItem(DRAFT_KEY + attemptId);
      if (!raw) return null;
      var d = JSON.parse(raw);
      if (!d || d.phase!== phase ||!d.words ||!d.words.length) return null;
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
    return day > 0? day: 1;
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
    return out.length? out: [String((w && w.word) || "")];
  }

  function spellMatches(user, expected) {
    if (window.YYSD_EN_SPELL && YYSD_EN_SPELL.matchesAny) {
      return YYSD_EN_SPELL.matchesAny(user, Array.isArray(expected)? expected: [expected]);
    }
    if (window.YYSD_EN_SPELL && YYSD_EN_SPELL.matches) {
      var list = Array.isArray(expected)? expected: [expected];
      for (var i = 0; i < list.length; i++) {
        if (YYSD_EN_SPELL.matches(user, list[i])) return true;
      }
      return false;
    }
    var u = String(user || "").trim().toLowerCase();
    var list2 = Array.isArray(expected)? expected: [expected];
    for (var j = 0; j < list2.length; j++) {
      if (u === String(list2[j] || "").trim().toLowerCase()) return true;
    }
    return false;
  }

  function bindEnglishSpellInput(el) {
    if (!window.YYSD_EN_SPELL ||!window.YYSD_EN_SPELL.bind) return;
    YYSD_EN_SPELL.bind(el, {
      isLocked: function () { return!!session.answered ||!!session.imeBlocked; },
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
        livesHtml += '<span class="heart' + (i >= session.lives? " lost": "") + '">❤️</span>';
      }
    }
    document.body.classList.toggle("vc-playing",!!opts.showLives);
    root.innerHTML =
      '<div class="vl-app">' +
        '<div class="vl-top-bar">' +
          '<div class="vl-brand"> YYSD · <span> Vượt ải từ vựng </span></div>' +
          '<div class="vl-list-badge">' + esc(badge || " vượt ải ") + "</div>" +
          (opts.showLives? '<div class="vl-lives" id="lives">' + livesHtml + "</div>": "") +
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
    if (!list ||!list.length) return "";
    return list.map(function (n) {
      return '<p class="vc-notice' + (warn? " vc-notice--warn": "") + '">' + esc(n) + "</p>";
    }).join("");
  }

  function phaseLabel(phase) {
    if (phase === "new_words") return " Kiểm tra từ mới ";
    if (phase === "retest") return " Kiểm tra lại từ sai ";
    if (phase === "makeup") return " Vòng ôn bổ sung ";
    if (phase === "scheduled_review") return " Kiểm tra ôn tập ";
    return phase || "";
  }

  function taskStatusLabel(st, inProgress) {
    if (st === "completed") return " Đã đạt ";
    if (st === "failed") return " Cần làm lại ";
    if (st === "pending") return inProgress? " Đang vượt ải ": " Chờ làm ";
    return st || "";
  }

  function taskTypeLabel(t) {
    return t === "review"? " Ôn tập ngẫu nhiên ": " Từ mới ";
  }

  function stageChipSub(plan) {
    if (!plan) return "—";
    var parts = [];
    if (plan.new) parts.push("L" + plan.new);
    if (plan.reviews && plan.reviews.length) parts.push(" phục " + plan.reviews.join(","));
    return parts.join("·") || "—";
  }

  function stageStatusLabel(st) {
    if (st === "completed") return " Đã qua ";
    if (st === "current") return " Màn này ";
    return " Khóa ";
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
          return '<div class="' + cls + '"' + attrs + ' title=" thứ ' + s.stage + " màn · " +
            esc(stageChipSub(s.plan)) + '">' +
            "<span>" + s.stage + "</span>" +
            "<small>" + esc(stageStatusLabel(s.status)) + "</small>" +
            "</div>";
        }).join("") +
      "</div>" +
      '<p class="vc-meta vc-stage-hint"> tổng ' + (stagesData.totalStages || stages.length) +
        " màn · nhấn vào <strong> Đã qua </strong> cửa khẩu có thể tự chủ trọng luyện (không ảnh hưởng Tiến độ) </p>"
    );
  }

  function renderStagePanel(stage, stagesData) {
    var panel = document.getElementById("vc-stage-panel");
    if (!panel) return;
    if (!stage ||!stagesData) {
      panel.hidden = true;
      panel.innerHTML = "";
      return;
    }
    var info = (stagesData.stages || []).filter(function (s) { return s.stage === stage; })[0];
    if (!info ||!info.practiceable) {
      panel.hidden = true;
      return;
    }
    panel.hidden = false;
    panel.innerHTML =
      '<div class="vc-stage-panel-head">' +
        "<strong> thứ " + stage + " màn · Đã đạt </strong>" +
        '<button type="button" class="vc-stage-panel-close" id="vc-stage-close" aria-label=" Đóng ">×</button>' +
      "</div>" +
      '<p class="vc-meta">' + esc(stageChipSub(info.plan)) + " · lựa chọn muốn nặng luyện nhiệm vụ </p>" +
      '<div class="vc-stage-panel-actions">' +
        info.tasks.map(function (t) {
          return '<button type="button" class="vl-btn vl-btn-sm vc-stage-practice" data-list="' + t.listNo +
            '" data-type="' + esc(t.taskType) + '" data-stage="' + stage + '">' +
            "List " + t.listNo + " · " + taskTypeLabel(t.taskType) + " Luyện tập </button>";
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
    if (!stages ||!stages.length) return "—";
    return stages.map(function (d) { return " thứ " + d + " màn "; }).join(", ");
  }

  function ebbinghausIntroHtml(plan, progressDay, todayPlan) {
    if (!plan ||!plan.dayRows) {
      return noticesHtml([" ngải tân hạo tư vượt ải: mỗi màn trước Từ mới (5 mạng · 18 giây) → Ôn tập (20 câu · 3 mạng). "]);
    }
    progressDay = Math.floor(Number(progressDay) || 0) || 1;
    var stageNew = todayPlan && todayPlan.new? ("List " + todayPlan.new): "—";
    var stageRev = todayPlan && todayPlan.reviews && todayPlan.reviews.length
      ? todayPlan.reviews.map(function (n) { return "List " + n; }).join(", ")
      : "—";

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
      return '<tr class="' + cls + '"><td>List ' + no + "</td><td> thứ " + (li.newDay || "—") +
        " màn </td><td>" + formatReviewStages(li.reviewDays) + "</td></tr>";
    }).join("");

    var dayRows = plan.dayRows.map(function (row) {
      var cls = row.day === progressDay? " is-today": "";
      var newPart = row.new? (" mới List " + row.new): "—";
      var revPart = row.reviews.length
        ? row.reviews.map(function (r) { return "L" + r; }).join(", ")
        : "—";
      return '<tr class="' + cls + '"><td> thứ ' + row.day + " màn </td><td>" + newPart +
        "</td><td>" + revPart + "</td></tr>";
    }).join("");

    return (
      '<details class="vc-ebb-intro">' +
        '<summary class="vc-ebb-intro-sum">' +
          '<span class="vc-ebb-intro-title"> ngải tân hạo Tư Khoa học vượt ải </span>' +
          '<span class="vc-ebb-intro-teaser"> kết hợp trí nhớ đường cong an bài Từ mới và Ôn tập · nhấn vào triển khai quy tắc và ' +
            plan.totalDays + " màn kế hoạch hoàn hảo </span>" +
        "</summary>" +
        '<div class="vc-ebb-intro-body">' +
          '<p class="vc-ebb-intro-lead"> bản vượt ải đem <strong> ngải tân hạo tư quên đi đường cong </strong> rả thành <strong>' + plan.totalDays +
            " màn </strong> Học tập nhiệm vụ: tại Từ mới Học tập sau đích mấu chốt tiết điểm tự động an bài Ôn tập, trợ giúp ngươi đang ở đây chính xác thời gian củng cố trí nhớ. </p>" +
          '<p class="vc-ebb-intro-note"> màn mấy theo như bạn <strong> hoàn thành nhiệm vụ Tiến độ </strong> đẩy mạnh, và lịch ngày ngày không quan hệ; Tiến độ mau, trong một ngày có thể liên tục hoàn thành nhiều màn. </p>' +
          '<ul class="vc-ebb-rules">' +
            "<li><strong> mỗi màn trình tự </strong>: hoàn thành trước Màn này <strong> Từ mới vượt ải </strong>, làm tiếp Màn này <strong> Kiểm tra ôn tập </strong>. </li>" +
            "<li><strong> Từ mới Đánh giá </strong>: nghe phát âm → chọn trúng văn nghĩa → Chính tả Tiếng Anh; <strong>5 mạng </strong>, mỗi câu <strong>18 giây</strong>; từ sai tại chỗ Làm lại đến hoàn toàn đúng. </li>" +
            "<li><strong> Kiểm tra ôn tập </strong>: từ Đã học List rút <strong>20 câu</strong> (câu sai thêm quyền); <strong>3 mạng </strong>; thông qua sau ghi nhập trắc nghiệm bộ phận trì. </li>" +
            "<li><strong> chỉnh thể tiết tấu </strong>: " + plan.totalLists + " List phân tán tại <strong>" + plan.totalDays +
              " màn </strong> Vừa hoàn thành; càng về sau Ôn tập nhiệm vụ càng nhiều, mời bảo trì Học tập tiết tấu. </li>" +
          "</ul>" +
          '<div class="vc-ebb-today-plan">' +
            "<strong> bạn trước mắt Tiến độ: thứ " + progressDay + " màn </strong>" +
            " · Màn này Từ mới " + stageNew + " · Màn này Ôn tập " + stageRev +
          "</div>" +
          '<details class="vc-ebb-sub">' +
            '<summary> theo như List Xem: từng List Từ mới màn và Ôn tập màn </summary>' +
            '<div class="vc-ebb-scroll">' +
              '<table class="vc-ebb-table">' +
                "<thead><tr><th>List</th><th> Từ mới màn </th><th> Ôn tập màn </th></tr></thead>" +
                "<tbody>" + listRows + "</tbody>" +
              "</table>" +
            "</div>" +
          "</details>" +
          '<details class="vc-ebb-sub">' +
            '<summary> theo như màn Xem: ' + plan.totalDays + " màn Đầy đủ nhiệm vụ bề ngoài </summary>" +
            '<div class="vc-ebb-scroll vc-ebb-scroll--tall">' +
              '<table class="vc-ebb-table">' +
                "<thead><tr><th> Tiến độ màn </th><th> Màn này Từ mới </th><th> Màn này Ôn tập List</th></tr></thead>" +
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
    var n = (session.idx + 1) + "</strong> / " + session.words.length + " · còn thừa sinh mệnh " + session.lives;
    if (session.phase === "practice") {
      el.innerHTML = " thứ <strong>" + n;
      return;
    }
    el.innerHTML = phaseLabel(session.phase) + " · thứ <strong>" + n;
  }

  function updateLives() {
    var el = document.getElementById("lives");
    if (el) {
      var h = "";
      var maxL = session.livesMax || HP_MAX;
      for (var i = 0; i < maxL; i++) {
        h += '<span class="heart' + (i >= session.lives? " lost": "") + '">❤️</span>';
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
      if (!session.answered &&!session.gameOver &&!session.imeBlocked) onTimeout();
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
      ? gate.require({ reason: reason, strikes: reason === "violation"? session.imeViolations: 0 })
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
    if (!gate ||!gate.showCheat) {
      alert(" nhiều lần hoán đổi Tiếng Việt đưa vào cú pháp, lần này Kiểm tra đã hết hiệu lực. ");
      location.href = isPractice? "vocab-challenge.html?view=notebook": "vocab-challenge.html";
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
      if (spell &&!spell.disabled) spell.focus();
    });
  }

  // ---- hub ----

  function renderHub() {
    shell('<div class="state state--brand"><div class="spinner spinner--brand"></div> thêm năm Tiến độ …</div>', " Tiến độ ");
    Promise.all([
      A.api("/api/vocab-challenge/me" + bookQs()),
      A.api("/api/vocab-challenge/lists" + bookQs()).catch(function (e) { return e; })
    ]).then(function (pair) {
      var me = pair[0];
      var lists = pair[1];
      if (!me ||!me.ok) {
        shell('<p class="vs-empty"> Tải dữ liệu thất bại, mời Làm mới Thử lại. </p>', "Sai");
        return;
      }
      if (!me.assigned) {
        shell(
          '<p class="vc-notice vc-notice--warn"> Giáo viên chưa cho bạn bố trí vượt ải từ quyển. bố trí sau là được từ List 1 Bắt đầu trục cấp giải tỏa. </p>' +
          '<div class="vc-actions"><a class="vl-btn" href="zone.html?zone=study"> Quay lại Khu từ vựng </a></div>',
          " đợi bố trí "
        );
        return;
      }
      if (me.needsBook) {
        var picker = '<p class="vc-notice"> Giáo viên cho bạn bố trí nhiều bản vượt ải từ quyển, mời lựa chọn một quyển Vào học: </p>' +
          '<div class="vc-actions">' +
          (me.assignments || []).map(function (a) {
            return '<a class="vl-btn vl-btn-primary" href="vocab-challenge.html?book=' +
              encodeURIComponent(a.bookId) + '">' + esc(a.bookLabel || a.bookId) + "</a>";
          }).join("") +
          "</div>";
        if (bookParam) {
          shell('<p class="vc-notice vc-notice--warn"> nên từ quyển chưa bố trí. </p>' + picker, " chọn từ quyển ");
        } else {
          shell(picker, " chọn từ quyển ");
        }
        return;
      }
      if (!lists ||!lists.ok) {
        shell('<p class="vs-empty">' + esc((lists && (lists.error || lists.message)) || " không cách nào thêm năm List") + "</p>", "Sai");
        return;
      }
      var prog = lists.progress || me.progress || {};
      var pool = me.pool || {};
      var isEbb =!!(lists.progressDay || (me.todayTasks && me.todayTasks.length));
      var todayTasks = lists.todayTasks || me.todayTasks || [];
      var programComplete =!!(lists.programComplete || me.programComplete);
      var progressDay = lists.progressDay || me.progressDay || (prog.progressDay || 1);

      var chips = (lists.lists || []).map(function (l) {
        var cls = "vc-list-chip";
        if (l.cleared || l.clearedNew) cls += " is-cleared is-open";
        else if (l.unlocked) cls += " is-open";
        if (l.current) cls += " is-current";
        if (l.todayRole === "new") cls += " is-today-new";
        if (l.todayRole === "review") cls += " is-today-review";
        if (l.todayStatus === "completed") cls += " is-done-today";
        var sub = l.cleared || l.clearedNew? " Hoàn thành ": l.todayRole === "new"? " Màn này mới ":
          l.todayRole === "review"? " Màn này Ôn tập ": l.unlocked? " Đã học ": " Khóa ";
        return '<div class="' + cls + '"><span>L' + l.listNo + "</span>" +
          "<small>" + sub + "</small></div>";
      }).join("");

      var passedStages = lists.stages && lists.stages.stages
        ? lists.stages.stages.filter(function (s) { return s.status === "completed"; }).length
        : 0;
      var stageGrid = isEbb? stageGridHtml(lists.stages, progressDay): "";

      var learnHref = "";
      var cur = (lists.lists || []).filter(function (l) {
        return l.todayRole === "new" && l.todayStatus!== "completed";
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
          todayHtml = '<p class="vc-notice"> ngải tân hạo tư ' +
            (((lists.ebbinghausPlan && lists.ebbinghausPlan.totalDays) || (prog.totalDays) || 78)) +
            " màn kế hoạch đã Tất cả hoàn thành. Sổ lỗi sai nhưng thể luyện tập. </p>";
        } else {
          todayHtml =
            '<section class="vc-day-card">' +
              '<h2 class="vc-day-title"> thứ ' + displayProgressDay(progressDay, programComplete) + " màn · Màn này nhiệm vụ </h2>" +
              '<p class="vc-meta"> hoàn thành trước Từ mới, làm tiếp Ôn tập · Từ mới 5 mạng · Ôn tập 20 câu 3 mạng </p>' +
              '<ul class="vc-day-tasks">' +
              todayTasks.map(function (t) {
                var btn = "";
                if (t.canStart && t.status!== "completed" &&!me.activeAttemptId) {
                  btn = '<button type="button" class="vl-btn vl-btn-sm vc-task-start" data-list="' +
                    t.listNo + '" data-type="' + esc(t.taskType) + '">' +
                    (t.status === "failed"? " Làm lại ": " Bắt đầu ") + "</button>";
                }
                return '<li class="vc-day-task vc-day-task--' + esc(t.status) + '">' +
                  "<span>List " + t.listNo + " · " + taskTypeLabel(t.taskType) +
                  " · " + taskStatusLabel(t.status,!!me.activeAttemptId) + "</span>" + btn + "</li>";
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
            ? " · Đã hoàn thành " + shownDay + " / " + totalStages + " màn "
            : " · Tiến độ màn " + shownDay +
              " · Đã đạt " + passedStages + " / " + totalStages + " màn ")
        : esc(lists.bookLabel || lists.bookId) +
          " · Hoàn thành màn List " + (prog.clearedListNo || 0) +
          " · cửa ải kế tiếp List " + (prog.nextListNo || 1) +
          " · Làm lại hạn ngạch " + (lists.retestQuota || 0) + " câu ";

      var noticeLine = isEbb
        ? ""
        : " theo như trình tự vượt ải: Từ mới (5 mạng · mỗi câu 18 giây) → Kiểm tra lại từ sai → thi lại đến hoàn toàn đúng. ";

      var introHtml = isEbb
        ? ebbinghausIntroHtml(lists.ebbinghausPlan, progressDay, lists.todayPlan)
        : noticesHtml([noticeLine]);

      var resumeHtml = "";
      if (me.activeAttemptId) {
        resumeHtml =
          '<p class="vc-notice vc-notice--warn"> bạn có đang tiến hành vượt ải, có thể Tiếp tục hoàn thành hoặc Đăng xuất hết hiệu lực. </p>' +
          '<div class="vc-actions"><button type="button" class="vl-btn vl-btn-primary" id="vc-resume"> Tiếp tục vượt ải </button></div>';
      }

      shell(
        introHtml +
        todayHtml +
        resumeHtml +
        '<p class="vc-meta">' + metaLine +
        '</p><p class="vc-meta"> trắc nghiệm bộ phận trì ' + (pool.active || 0) +
          " · ngoan cố từ " + (pool.stubborn || 0) +
          " · Sổ lỗi sai " + (pool.notebook || 0) + "</p>" +
        (isEbb? stageGrid: ('<div class="vc-list-grid">' + chips + "</div>")) +
        '<div class="vc-actions">' +
          (!isEbb
            ? '<button type="button" class="vl-btn vl-btn-primary" id="vc-start"> Bắt đầu List ' +
              (prog.nextListNo || 1) + "</button>"
            : "") +
          (learnHref
            ? '<a class="vl-btn" href="' + esc(learnHref) + '"> trước Học tập bản List</a>'
            : "") +
          '<a class="vl-btn" href="vocab-challenge.html?view=notebook"> Sổ lỗi sai </a>' +
          '<a class="vl-btn" href="zone.html?zone=study"> Quay lại </a>' +
        "</div>",
        lists.bookLabel || " vượt ải "
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
      if (msg.indexOf(" tài khoản học viên ") >= 0 || (A.isTeacher && A.isTeacher())) {
        shell(
          '<p class="vc-notice vc-notice--warn"> Giáo viên tài khoản không thể trực tiếp vượt ải. mời trước tiên ở Cổng giáo viên hoán đổi đến « Khu tính năng học tập », lại mở ra bổn trang. </p>' +
          '<div class="vc-actions"><a class="vl-btn vl-btn-primary" href="teacher-mode-picker.html"> lựa chọn Khu tính năng học tập </a></div>',
          " Giáo viên Xem trước "
        );
        return;
      }
      shell('<p class="vs-empty">' + esc(msg || " Tải dữ liệu thất bại, mời Làm mới Thử lại ") + "</p>", "Sai");
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
      shell('<div class="state state--brand"><div class="spinner spinner--brand"></div> chuẩn bị đề mục …</div>', " Bắt đầu ");
      var body = {};
      if (listNo) body.listNo = listNo;
      if (taskType) body.taskType = taskType;
      if (bookParam) body.bookId = bookParam;
      A.api("/api/vocab-challenge/start", { method: "POST", body: body })
        .then(function (d) {
          if (!d ||!d.ok) {
            shell(
              '<p class="vc-notice vc-notice--warn">' + esc((d && d.error) || " không cách nào Bắt đầu ") + "</p>" +
              '<div class="vc-actions"><button type="button" class="vl-btn" id="vc-back"> Quay lại </button></div>',
              "Sai"
            );
            document.getElementById("vc-back").onclick = renderHub;
            return;
          }
          enterPhase(d);
        })
        .catch(function (e) {
          shell(
            '<p class="vc-notice vc-notice--warn">' + esc((e && e.message) || " Khởi động thất bại ") + "</p>" +
            '<div class="vc-actions"><button type="button" class="vl-btn" id="vc-back"> Quay lại </button></div>',
            "Sai"
          );
          var back = document.getElementById("vc-back");
          if (back) back.onclick = renderHub;
        });
    });
  }

  function enterPhase(d) {
    // ponytail: submit-new/makeup responses omitted attemptId before fix — keep session id
    session.attemptId = d.attemptId || session.attemptId;
    session.phase = d.phase;
    session.listId = d.listId || session.listId || "";
    session.listNo = d.listNo || session.listNo || 0;
    session.taskType = d.taskType || session.taskType ||
      (d.phase === "scheduled_review"? "review": "new");
    session.notices = d.notices || [];
    mergeOptionBank(d.optionBank);
    mergeOptionBank((d.items || []).map(parseWord).map(quizMeaning));
    var saved = loadQuizDraft(session.attemptId, session.phase);
    if (saved) {
      session.words = saved.words;
      session.answers = saved.answers || [];
      session.livesMax = saved.livesMax || d.livesMax ||
        (session.taskType === "review"? HP_REVIEW: HP_MAX);
      session.lives = saved.lives!= null? saved.lives: session.livesMax;
      session.idx = saved.waiting? (saved.idx + 1): (saved.idx || 0);
      if (session.idx < 0) session.idx = 0;
      if (session.idx > session.words.length) session.idx = session.words.length;
      session.gameOver = session.lives <= 0;
      session.waiting = false;
      if (saved.optionBank && saved.optionBank.length) mergeOptionBank(saved.optionBank);
    } else {
      session.words = shuffle((d.items || []).map(parseWord).filter(function (w) { return w.word; }));
      session.answers = [];
      session.idx = 0;
      session.livesMax = d.livesMax || (session.taskType === "review"? HP_REVIEW: HP_MAX);
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

    if (session.phase === "retest" &&!session.words.length) {
      shell(
        noticesHtml(session.notices) +
        '<p class="vc-meta"> bản Giai đoạn không cần đáp lại. </p>' +
        '<div class="vc-actions">' +
          '<button type="button" class="vl-btn vl-btn-primary" id="vc-empty-pass"> Xác nhận qua cửa </button>' +
        "</div>",
        " Làm lại "
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
    if (focus && spell &&!spell.disabled) spell.focus();
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
      else if (b.getAttribute("data-v") === session.selectedMeaning &&!meaningOk) b.classList.add("wrong");
    });
  }

  function paintSpellResult(spellOk) {
    var spell = document.getElementById("spell");
    if (!spell) return;
    spell.classList.remove("spell-ok", "spell-bad");
    spell.classList.add(spellOk? "spell-ok": "spell-bad");
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
    var spellRaw = spellEl? spellEl.value.trim(): "";
    var spell = spellRaw.toLowerCase();
    var meaningOk =!!(session.selectedMeaning && session.selectedMeaning === quizMeaning(w));
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
      fb.textContent = timeout? "✅ đã đến giờ, nhưng đáp lại Đúng! ": "✅ Chính xác hoàn toàn! ";
    } else {
      session.lives = Math.max(0, session.lives - 1);
      updateLives();
      fb.className = "vl-feedback show " + (timeout? "timeout": "fail");
      fb.textContent = timeout
        ? ("⏰ đã đến giờ! Đáp án: " + w.word + " (" + quizMeaning(w) + ") ")
        : ("❌ Đáp án đúng: " + w.word + " (" + quizMeaning(w) + ") ");
    }
    session.answers.push({
      word: w.word,
      correct: ok,
      userAnswer: timeout? (spellRaw || "(timeout)"): spell,
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
      if (fb &&!session.answered) {
        fb.className = "vl-feedback";
        fb.textContent = "";
      }
      revealSpellRow(true);
    };
    function submitQuiz() {
      var r = applyGrade(w, false);
      if (r === "needMeaning") {
        var fb = document.getElementById("fb");
        if (fb) { fb.className = "vl-feedback show fail"; fb.textContent = " mời trước lựa chọn Tiếng Việt Nghĩa "; }
      } else if (r === "needSpell") {
        var fb = document.getElementById("fb");
        if (fb) { fb.className = "vl-feedback show fail"; fb.textContent = " mời trước Chính tả Tiếng Anh "; }
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
      if (session.gameOver ||!session.waiting) return;
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
        if (!confirm(" Đăng xuất đem hết hiệu lực lần này vượt ải, Đồng ý? ")) return;
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
    return noticesHtml(session.idx === 0? session.notices: []) +
      '<p class="vl-listen-hint">' + esc(hint) + "</p>" +
      '<button type="button" class="vl-btn" id="listen">🔊 phát ra phát âm </button>' +
      '<div class="vl-opts" id="opts">' +
        opts.map(function (o, i) {
          return '<button type="button" class="vl-opt" data-v="' + esc(o) + '"><span class="label">' +
            labels[i] + ".</span> " + esc(o) + "</button>";
        }).join("") +
      "</div>" +
      '<div class="vl-spell-row" id="spellRow" hidden>' +
        '<input type="text" id="spell" lang="en" inputmode="latin" placeholder=" Tiếng Anh Chính tả (mời dùng Tiếng Anh đưa vào cú pháp) " ' +
          'autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />' +
        '<button type="button" class="vl-btn vl-btn-primary" id="submit" disabled> Nộp bài </button>' +
      "</div>" +
      '<div class="vl-feedback" id="fb"></div>' +
      '<div class="vl-nav-row">' +
        (showAbort
          ? '<button type="button" class="vl-btn vl-btn-abort" id="vc-abort"> Đăng xuất cũng hết hiệu lực </button>'
          : (session.phase === "practice"
            ? '<button type="button" class="vl-btn vl-btn-abort" id="vc-abort"> Đăng xuất Luyện tập </button>'
            : "")) +
        '<button type="button" class="vl-btn vl-btn-primary" id="qnext" disabled> Câu tiếp theo →</button>' +
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
      questionInner(phaseLabel(session.phase) + " · nghe phát âm, trước chọn trúng văn Nghĩa, lại Chính tả Tiếng Anh ", true),
      "List " + session.listNo,
      { showLives: true, showTimer: true }
    );
    setQuizCounter();
    bindQuizQuestion(w);
  }

  function finishPhase() {
    clearQuizDraft(session.attemptId);
    shell('<div class="state state--brand"><div class="spinner spinner--brand"></div> Nộp bài Vừa …</div>', " Nộp bài ");
    var path = session.phase === "new_words"
      ? "/api/vocab-challenge/submit-new"
      : session.phase === "scheduled_review"
        ? "/api/vocab-challenge/submit-scheduled-review"
        : "/api/vocab-challenge/submit-review";
    A.api(path, {
      method: "POST",
      body: { attemptId: session.attemptId, answers: session.answers }
    }).then(function (d) {
      if (!d ||!d.ok) {
        shell(
          '<p class="vc-notice vc-notice--warn">' + esc((d && d.error) || " Nộp bài thất bại ") + "</p>" +
          '<div class="vc-actions"><button type="button" class="vl-btn" id="vc-back"> Quay lại </button></div>',
          "Sai"
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
            '<p class="vc-meta"> sinh mệnh hao hết · Sai ' + (d.wrongCount || 0) + " (" + maxL +
              " mạng dùng hết " + (isReviewFail? ", đem rút lần nữa câu ": ", không ghi vào câu sai ") + ") </p>" +
            '<div class="vc-actions">' +
              '<button type="button" class="vl-btn vl-btn-primary" id="vc-retry"> trực tiếp thi lại </button>' +
              (!isReviewFail
                ? '<a class="vl-btn" href="' + esc(href) + '"> đi trước Học tập </a>'
                : "") +
              '<button type="button" class="vl-btn" id="vc-hub"> Quay lại Tiến độ </button>' +
            "</div>",
            " không thông qua "
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
        '<p class="vc-notice vc-notice--warn">' + esc((err && err.message) || " Nộp bài thất bại ") + "</p>" +
        '<div class="vc-actions"><button type="button" class="vl-btn" id="vc-back"> Quay lại </button></div>',
        "Sai"
      );
      var back = document.getElementById("vc-back");
      if (back) back.onclick = renderHub;
    });
  }

  function renderCleared(d) {
    session.attemptId = 0;
    var prog = d.progress || {};
    var dayNote = d.dayAdvanced? '<p class="vc-notice"> Màn này nhiệm vụ đã Tất cả hoàn thành, đã Vào học cửa ải kế tiếp. </p>': "";
    var shown = displayProgressDay(
      prog.progressDay,
      !!(d.todayTasks && d.todayTasks.programComplete)
    );
    shell(
      noticesHtml(d.notices || []) +
      dayNote +
      (d.stubbornReleased && d.stubbornReleased.length
        ? noticesHtml([" ngoan cố từ tạm thời cho đi: " + d.stubbornReleased.join(", ")], true)
        : "") +
      '<p class="vc-meta">' +
        (prog.progressDay
          ? " Tiến độ màn " + shown + " · Hoàn thành Từ mới List " + (prog.clearedListNo || session.listNo)
          : " Hoàn thành màn đến List " + (prog.clearedListNo || session.listNo) +
            " · cửa ải kế tiếp List " + (prog.nextListNo || ((prog.clearedListNo || 0) + 1))) +
      "</p>" +
      '<div class="vc-actions">' +
        '<button type="button" class="vl-btn vl-btn-primary" id="vc-hub"> Quay lại Màn này nhiệm vụ </button>' +
      "</div>",
      " qua cửa "
    );
    document.getElementById("vc-hub").onclick = renderHub;
  }

  // ---- notebook ----

  function renderNotebook() {
    shell('<div class="state state--brand"><div class="spinner spinner--brand"></div> thêm năm Sổ lỗi sai …</div>', " Sổ lỗi sai ");
    A.api("/api/vocab-challenge/notebook" + bookQs())
      .then(function (d) {
        if (!d ||!d.ok) {
          shell('<p class="vs-empty">' + esc((d && d.error) || "Tải dữ liệu thất bại") + "</p>", " Sổ lỗi sai ");
          return;
        }
        var rows = d.words || [];
        var body = rows.length
          ? rows.map(function (r) {
              return '<div class="vc-nb-row"><div><b>' + esc(r.word) + "</b> " +
                '<span class="vc-meta">' + esc(r.ipa || "") + "</span><br>" +
                '<span class="vc-meta">' + esc(r.meaning || "") + "</span></div>" +
                "<div class=\"vc-nb-miss\"> sai " + (r.missCount || 1) + " lần </div></div>";
            }).join("")
          : '<p class="vs-empty"> Sổ lỗi sai hay trống không. </p>';
        shell(
          '<p class="vc-notice"> Sổ lỗi sai vĩnh cửu giữ lại; nơi này chủ động Luyện tập không ảnh hưởng vượt ải trắc nghiệm bộ phận trì. </p>' +
          body +
          '<div class="vc-actions">' +
            (rows.length
              ? '<button type="button" class="vl-btn vl-btn-primary" id="vc-practice"> Bắt đầu từ sai Kiểm tra </button>'
              : "") +
            '<a class="vl-btn" href="vocab-challenge.html' +
              (bookParam? "?book=" + encodeURIComponent(bookParam): "") + '"> Quay lại vượt ải </a>' +
          "</div>",
          " Sổ lỗi sai · " + (rows.length || 0)
        );
        var btn = document.getElementById("vc-practice");
        if (btn) btn.onclick = startPractice;
      })
      .catch(function () {
        shell('<p class="vs-empty"> Tải dữ liệu thất bại </p>', " Sổ lỗi sai ");
      });
  }

  function startListPractice(listNo, taskType, stageNo) {
    shell('<div class="state state--brand"><div class="spinner spinner--brand"></div> rút câu …</div>', "Luyện tập");
    A.api(
      "/api/vocab-challenge/list-practice-pool?listNo=" + encodeURIComponent(listNo) +
        "&taskType=" + encodeURIComponent(taskType || "new") +
        (bookParam? "&bookId=" + encodeURIComponent(bookParam): "")
    )
      .then(function (d) {
        if (!d ||!d.ok ||!(d.words || []).length) {
          shell(
            '<p class="vs-empty">' + esc((d && d.error) || " không có thể luyện tập từ ") + "</p>" +
            '<div class="vc-actions"><button type="button" class="vl-btn" id="vc-back-hub"> Quay lại </button></div>',
            "Luyện tập"
          );
          var back = document.getElementById("vc-back-hub");
          if (back) back.onclick = renderHub;
          return;
        }
        session.phase = "practice";
        session.attemptId = 0;
        session.practiceLabel = stageNo
          ? (" thứ " + stageNo + " màn · List " + listNo + " · " + taskTypeLabel(taskType))
          : ("List " + listNo + " · " + taskTypeLabel(taskType));
        session.notices = [d.notice || " Đã đạt cửa khẩu Luyện tập không ảnh hưởng vượt ải Tiến độ và trắc nghiệm bộ phận trì. "];
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
        shell('<p class="vs-empty"> Tải dữ liệu thất bại </p><div class="vc-actions"><button type="button" class="vl-btn" id="vc-back-hub"> Quay lại </button></div>', "Luyện tập");
        var back = document.getElementById("vc-back-hub");
        if (back) back.onclick = renderHub;
      });
  }

  function startPractice() {
    shell('<div class="state state--brand"><div class="spinner spinner--brand"></div> rút câu …</div>', "Luyện tập");
    A.api("/api/vocab-challenge/notebook/practice-pool?limit=20" +
      (bookParam? "&bookId=" + encodeURIComponent(bookParam): ""))
      .then(function (d) {
        if (!d ||!d.ok ||!(d.words || []).length) {
          shell('<p class="vs-empty"> không có thể luyện tập từ </p>', "Luyện tập");
          return;
        }
        session.phase = "practice";
        session.attemptId = 0;
        session.practiceLabel = " Sổ lỗi sai Luyện tập ";
        session.notices = [d.notice || " Sổ lỗi sai Luyện tập không ảnh hưởng vượt ải trắc nghiệm bộ phận trì. "];
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
      var wrong = session.answers.filter(function (a) { return!a.correct; }).length;
      shell(
        noticesHtml(session.notices) +
        '<p class="vc-meta"> Luyện tập chấm dứt · đối với ' + (session.answers.length - wrong) +
          " / sai " + wrong + " (không đưa vào trắc nghiệm bộ phận trì) </p>" +
        '<div class="vc-actions">' +
          '<a class="vl-btn vl-btn-primary" href="vocab-challenge.html?view=notebook"> Quay lại Sổ lỗi sai </a>' +
          '<a class="vl-btn" href="vocab-challenge.html"> vượt ải Trang chủ </a>' +
        "</div>",
        " Luyện tập kết quả "
      );
      return;
    }
    session.selectedMeaning = null;
    session.answered = false;
    session.waiting = false;
    shell(
      questionInner((session.practiceLabel || "Luyện tập") + " · nghe phát âm, trước chọn trúng văn Nghĩa, lại Chính tả Tiếng Anh ", false),
      "Luyện tập",
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
