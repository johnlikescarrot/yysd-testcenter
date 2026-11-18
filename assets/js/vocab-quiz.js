/* vocab-quiz.js - bookshelf book → multi-list → template xông qua rào cản (60% / 5 lives / 20s) */
(function () {
  "use strict";
  var Y = window.YYSD;
  var A = window.YYSD_AUTH;
  var root = document.getElementById("vq-root");
  var params = new URLSearchParams(location.search);
  var retestSessionId = Number(params.get("session") || 0);
  var assignEventId = Number(params.get("event") || 0) || 0;
  var preRefs = String(params.get("refs") || "")
    .split(",")
    .map(function (s) { return decodeURIComponent(s.trim()); })
    .filter(function (s) { return s.indexOf("||") > 0; });
  var preListIds = String(params.get("lists") || "")
    .split(",")
    .map(function (s) { return s.trim(); })
    .filter(Boolean);

  var MAX_LIVES = 5;
  var TIME_SEC = 20;
  var meta = {
    bookId: "", bookLabel: "", listIds: [], listLabels: [], sessionId: 0,
    assignmentEventId: 0, assignRefs: [], assignProgress: null
  };
  var words = [];
  var lastQuizPayload = null;
  var lastQuizOpts = null;
  var state = {
    phase: "setup", // setup | quiz | done
    quizOrder: [],
    quizIdx: 0,
    lives: MAX_LIVES,
    correct: 0,
    wrong: 0,
    mistakes: [],
    selectedMeaning: null,
    answered: false,
    waiting: false,
    gameOver: false,
    timer: null,
    timerLeft: TIME_SEC,
    timerPaused: false,
    imeBlocked: false,
    imeViolations: 0,
    imeDebounce: null,
    poolTotal: 0
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

  // ponytail: quiz defaults to Youdao US (type=2)
  function speak(word) {
    var WA = window.YysdWordAudio;
    if (WA && WA.speakUs) {
      WA.speakUs(word);
      return;
    }
    if (WA && WA.speak) {
      WA.speak(word, 2);
      return;
    }
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

  function quizMeaning(w) {
    if (!w) return "(tạm thời không có nghĩa của cái gì đó)";
    var cn = w.acceptCN;
    if (Array.isArray(cn) && cn.length) {
      var joined = cn.filter(Boolean).join(" / ");
      if (joined) return joined;
    }
    var m = String(w.meaning || "").trim();
    return m || "(tạm thời không có nghĩa của cái gì đó)";
  }

  var FALLBACK_CN = [
    " bàn / bàn học ", " chạy / chạy ", " cửa sổ / cửa sổ ", " màu vàng / vàng kim ",
    " yên tĩnh / tĩnh lặng ", " bạn / bạn ", " thời tiết / khí hậu ", " trường học / Khuôn viên trường "
  ];

  function meaningOptions(w, n) {
    n = n || 4;
    var correct = quizMeaning(w);
    var used = {};
    used[correct] = true;
    var pool = [];
    var poolMeanings = shuffle(words.map(quizMeaning));
    for (var i = 0; i < poolMeanings.length && pool.length < n - 1; i++) {
      var m = poolMeanings[i];
      if (!m || used[m]) continue;
      used[m] = true;
      pool.push(m);
    }
    for (var f = 0; f < FALLBACK_CN.length && pool.length < n - 1; f++) {
      var filler = FALLBACK_CN[f];
      if (used[filler]) continue;
      used[filler] = true;
      pool.push(filler);
    }
    return shuffle([correct].concat(pool));
  }

  function shell(inner, opts) {
    opts = opts || {};
    var livesHtml = "";
    if (opts.showLives) {
      for (var i = 0; i < MAX_LIVES; i++) {
        livesHtml += '<span class="heart' + (i >= state.lives ? " lost" : "") + '">❤️</span>';
      }
    }
    root.innerHTML =
      '<div class="vl-app">' +
        '<div class="vl-top-bar">' +
          '<div class="vl-brand">YYSD · <span>từ phát hiện</span></div>' +
          '<div class="vl-list-badge">' + esc(meta.bookLabel || " phát hiện ") + "</div>" +
          (opts.showLives ? '<div class="vl-lives" id="lives">' + livesHtml + "</div>" : "") +
        "</div>" +
        '<div class="vl-info-row">' +
          '<div id="counter"></div>' +
          '<div class="vl-timer" id="timerWrap" style="display:none">⏱ <span class="num" id="timerNum">20</span>s</div>' +
        "</div>" +
        '<div id="panel">' + inner + "</div>" +
        '<div class="vl-overlay" id="overlay"><div class="vl-result-box" id="resultBox"></div></div>' +
      "</div>";
  }

  function renderSetup(shelf, bookDetail) {
    state.phase = "setup";
    var books = (shelf.books || []).map(function (b) { return b.book || { id: b.bookId, label: b.bookId }; });
    var bookId = meta.bookId || (books[0] && books[0].id) || "";
    var lists = (bookDetail && bookDetail.lists) || [];
    var bookOpts = books.map(function (b) {
      return '<option value="' + esc(b.id) + '"' + (b.id === bookId ? " selected" : "") + ">" +
        esc(b.label) + "</option>";
    }).join("");

    var listRows = lists.map(function (l) {
      var wc = l.wordCount != null ? l.wordCount + " Từ " : "";
      return '<label class="vq-check">' +
        '<input type="checkbox" name="list" value="' + esc(l.id) + '">' +
        "<span><b>" + esc(l.label) + "</b> · " + esc(wc || "List") + "</span></label>";
    }).join("");

    root.innerHTML =
      '<div class="vs-hero bento-panel">' +
        '<h1 class="bento-panel__title">từ phát hiện</h1>' +
        '<p class="bento-panel__desc">chọn giá sách biến thể cũ của | viết tắt của | → nhiều chọn List → biến thể của | rút ra 60% · cười âm thanh chọn công lý + đánh vần · 5 sinh mệnh · mỗi chủ đề 20 giây</p>' +
        '<div class="vs-actions">' +
          '<a class="btn btn--ghost btn--sm" href="zone.html?zone=study&s=vocab">← Khu vực từ vựng</a>' +
          '<a class="btn btn--ghost btn--sm" href="vocab-shelf.html">kho từ giá sách</a>' +
        "</div>" +
      "</div>" +
      (books.length
        ? '<div class="bento-panel vq-setup">' +
            '<label class="vq-field">Sách từ vựng' +
              '<select id="vq-book">' + bookOpts + "</select></label>" +
            '<div class="vq-lists-head">' +
              '<span>chọn List(có thể nhiều chọn)</span>' +
              '<button type="button" class="btn btn--ghost btn--sm" id="vq-all">tất cả chọn</button>' +
            "</div>" +
            '<div class="vq-lists" id="vq-lists">' +
              (listRows || '<p class="vs-empty">nên biến thể cũ của | viết tắt của | tạm thời không có List</p>') +
            "</div>" +
            '<button type="button" class="btn btn--primary" id="vq-start" disabled>bắt đầu phát hiện</button>' +
          "</div>"
        : '<div class="bento-panel"><p class="vs-empty">giá sách vẫn trống không của, mời trước<a href="vocab-shelf.html?view=catalog">thêm biến thể cũ của | viết tắt của |</a> </p></div>');

    if (!books.length) return;

    function refreshStart() {
      var n = root.querySelectorAll('input[name="list"]:checked').length;
      var btn = document.getElementById("vq-start");
      if (btn) btn.disabled = n < 1;
    }

    function loadBook(id) {
      meta.bookId = id;
      A.api("/api/vocab-shelf/book?bookId=" + encodeURIComponent(id))
        .then(function (d) { renderSetup(shelf, d); })
        .catch(function (e) { alert((e && e.message) || " Tải không thành công "); });
    }

    document.getElementById("vq-book").onchange = function () {
      loadBook(this.value);
    };
    document.getElementById("vq-all").onclick = function () {
      root.querySelectorAll('input[name="list"]').forEach(function (c) { c.checked = true; });
      refreshStart();
    };
    document.getElementById("vq-lists").onchange = refreshStart;
    document.getElementById("vq-start").onclick = function () {
      var ids = [];
      root.querySelectorAll('input[name="list"]:checked').forEach(function (c) { ids.push(c.value); });
      if (!ids.length) return;
      startQuiz(meta.bookId || bookId, ids);
    };
    refreshStart();
  }

  function listLabelOfRef(ref) {
    var i = String(ref || "").indexOf("||");
    if (i <= 0) return String(ref || "");
    return String(ref).slice(i + 2);
  }

  function bookIdOfRef(ref) {
    var i = String(ref || "").indexOf("||");
    return i > 0 ? String(ref).slice(0, i) : "";
  }

  function passedMap() {
    var p = meta.assignProgress && meta.assignProgress.passedLists;
    return p && typeof p === "object" ? p : {};
  }

  function renderAssignPicker() {
    state.phase = "setup";
    var refs = meta.assignRefs || [];
    var done = passedMap();
    var passedN = refs.filter(function (r) { return !!done[r]; }).length;
    var rows = refs.map(function (ref) {
      var ok = !!done[ref];
      return '<div class="vq-check" style="display:flex;align-items:center;justify-content:space-between;gap:12px">' +
        "<span><b>" + esc(listLabelOfRef(ref)) + "</b>" +
          (bookIdOfRef(ref) ? '<span style="color:#6a7c74"> · ' + esc(bookIdOfRef(ref)) + "</span>" : "") +
        "</span>" +
        (ok
          ? '<span style="color:#1f7a4d;font-weight:600">đã đi qua</span>'
          : '<button type="button" class="btn btn--primary btn--sm" data-vq-ref="' + esc(ref) + '">bắt đầu phát hiện</button>') +
      "</div>";
    }).join("");
    root.innerHTML =
      '<div class="vs-hero bento-panel">' +
        '<h1 class="bento-panel__title">Bài tập · từ phát hiện</h1>' +
        '<p class="bento-panel__desc">Tổng cộng ' + refs.length + " cái List, mời từng cái một xông qua rào cản(" +
          passedN + "/" + refs.length + " đã đi qua) toàn bộ đi qua hoàng hậu bài tập về nhà khả năng coi như hoàn thành </p>" +
        '<div class="vs-actions"><a class="btn btn--ghost btn--sm" href="dashboard.html">← trở về ở lại làm</a></div>' +
      "</div>" +
      '<div class="bento-panel vq-setup">' +
        '<div class="vq-lists">' + (rows || '<p class="vs-empty">không có List</p>') + "</div>" +
      "</div>";
    root.querySelectorAll("[data-vq-ref]").forEach(function (btn) {
      btn.onclick = function () {
        var ref = btn.getAttribute("data-vq-ref");
        if (!ref) return;
        startQuiz("", [ref]);
      };
    });
  }

  function loadAssignProgress() {
    if (!assignEventId) return Promise.resolve(null);
    return A.api("/api/student/assignments/" + assignEventId + "/meta")
      .then(function (d) {
        meta.assignProgress = d.quizProgress || null;
        return meta.assignProgress;
      })
      .catch(function () {
        meta.assignProgress = null;
        return null;
      });
  }

  function beginWithWords(d, opts) {
    opts = opts || {};
    lastQuizPayload = d;
    lastQuizOpts = opts;
    words = shuffle(d.words || []);
    if (!words.length) throw new Error(" không có có thể khảo sát từ ");
    meta.bookId = d.bookId || (d.book && d.book.id) || meta.bookId;
    meta.bookLabel = d.bookLabel || (d.book && d.book.label) || meta.bookId;
    meta.listIds = d.listIds || meta.listIds || [];
    meta.listLabels = d.listLabels || meta.listLabels || [];
    meta.sessionId = opts.sessionId || 0;
    meta.quizToken = d.quizToken || 0;
    MAX_LIVES = d.maxLives || MAX_LIVES || 5;
    TIME_SEC = d.timeLimitSec || TIME_SEC || 20;
    state.poolTotal = d.poolTotal != null ? d.poolTotal : words.length;
    state.quizOrder = shuffle(words.map(function (_, i) { return i; }));
    state.quizIdx = 0;
    state.lives = MAX_LIVES;
    state.correct = 0;
    state.wrong = 0;
    state.mistakes = [];
    state.quizResults = [];
    state.gameOver = false;
    state.phase = "quiz";
    state.imeViolations = 0;
    if (state.imeDebounce) {
      clearTimeout(state.imeDebounce);
      state.imeDebounce = null;
    }
    document.title = (opts.sessionId ? " lỗi biến thể cũ của | lặp lại khảo sát · " : " phát hiện · ") + meta.bookLabel + " · YYSD ";
    requireImeGate("start", renderQuizActive);
  }

  function ensureBookOnShelf(bookId) {
    return A.api("/api/vocab-shelf/add", {
      method: "POST",
      body: { bookId: bookId }
    }).catch(function () { /* already on shelf or ignored */ });
  }

  function startQuiz(bookId, listIds) {
    root.innerHTML = '<div class="vl-state">đang ở hình thành cuộn lại...</div>';
    var ids = listIds || [];
    var asRefs = ids.length && ids.every(function (id) { return String(id).indexOf("||") > 0; });
    var url = asRefs
      ? ("/api/vocab-shelf/quiz-pool?refs=" + encodeURIComponent(ids.join(",")))
      : ("/api/vocab-shelf/quiz-pool?bookId=" + encodeURIComponent(bookId) +
        "&listIds=" + encodeURIComponent(ids.join(",")));
    var prep = asRefs
      ? Promise.resolve()
      : ensureBookOnShelf(bookId);
    prep
      .then(function () { return A.api(url); })
      .then(function (d) {
        beginWithWords(d, {});
      })
      .catch(function (e) {
        alert((e && e.message) || " hình thành cuộn lại bị đánh bại ");
        if (assignEventId && (preRefs.length || preListIds.length)) {
          root.innerHTML = '<div class="state"><p>' + esc((e && e.message) || " hình thành cuộn lại bị đánh bại ") +
            '</p><p><a href="dashboard.html">trở về ở lại làm</a></p></div>';
        } else {
          boot();
        }
      });
  }

  function startRetest(sessionId) {
    root.innerHTML = '<div class="vl-state">đang ở tải lỗi biến thể cũ của |...</div>';
    A.api("/api/vocab-shelf/wrongbook/session?id=" + encodeURIComponent(sessionId))
      .then(function (d) {
        var s = d.session || {};
        beginWithWords({
          words: d.words || [],
          bookId: s.bookId,
          bookLabel: s.bookLabel,
          listIds: s.listIds,
          listLabels: s.listLabels,
          poolTotal: (d.words || []).length,
          maxLives: 5,
          timeLimitSec: 20
        }, { sessionId: sessionId });
      })
      .catch(function (e) {
        alert((e && e.message) || " Tải không thành công ");
        location.href = "wrong-words.html?session=" + encodeURIComponent(sessionId);
      });
  }

  function updateLives() {
    var el = document.getElementById("lives");
    if (!el) return;
    var h = "";
    for (var i = 0; i < MAX_LIVES; i++) {
      h += '<span class="heart' + (i >= state.lives ? " lost" : "") + '">❤️</span>';
    }
    el.innerHTML = h;
  }

  function currentWord() {
    return words[state.quizOrder[state.quizIdx]];
  }

  function recordQuizResult(w, userAnswer, userMeaning, ok) {
    if (!w) return;
    state.quizResults.push({
      word: w.word,
      userAnswer: userAnswer != null ? String(userAnswer) : "",
      userMeaning: userMeaning != null ? String(userMeaning) : ""
    });
    if (!ok) pushMistake(w, userAnswer);
  }

  function pushMistake(w, userAnswer) {
    if (!w) return;
    var exists = state.mistakes.some(function (m) { return m.word === w.word; });
    if (exists) return;
    state.mistakes.push({
      word: w.word,
      ipa: w.ipa,
      meaning: w.meaning,
      listId: w.listId || null,
      userAnswer: userAnswer,
      word_json: w
    });
  }

  function tickTimer() {
    state.timerLeft--;
    var num = document.getElementById("timerNum");
    if (num) {
      num.textContent = state.timerLeft;
      num.classList.toggle("warning", state.timerLeft <= 3);
    }
    if (state.timerLeft <= 0) {
      clearInterval(state.timer);
      state.timer = null;
      if (!state.answered && !state.gameOver && !state.imeBlocked) onTimeout();
    }
  }

  function startTimer() {
    clearInterval(state.timer);
    state.timerPaused = false;
    state.timerLeft = TIME_SEC;
    var wrap = document.getElementById("timerWrap");
    var num = document.getElementById("timerNum");
    if (wrap) wrap.style.display = "block";
    if (num) { num.textContent = state.timerLeft; num.className = "num"; }
    state.timer = setInterval(tickTimer, 1000);
  }

  function pauseTimerForIme() {
    if (state.timer) {
      clearInterval(state.timer);
      state.timer = null;
    }
    state.timerPaused = true;
  }

  function resumeTimerIfNeeded() {
    if (!state.timerPaused || state.answered || state.gameOver || state.imeBlocked) return;
    state.timerPaused = false;
    if (state.timerLeft <= 0) return;
    state.timer = setInterval(tickTimer, 1000);
  }

  function requireImeGate(reason, cb) {
    state.imeBlocked = true;
    pauseTimerForIme();
    var gate = window.YYSD_IME_GATE;
    var p = gate
      ? gate.require({ reason: reason, strikes: reason === "violation" ? state.imeViolations : 0 })
      : Promise.resolve();
    p.then(function () {
      state.imeBlocked = false;
      cb();
    });
  }

  function handleImeCheat() {
    state.gameOver = true;
    state.imeBlocked = true;
    pauseTimerForIme();
    if (window.YYSD_IME_GATE) YYSD_IME_GATE.reset();
    var gate = window.YYSD_IME_GATE;
    if (!gate || !gate.showCheat) {
      alert(" nhiều lần chuyển đổi ngôn ngữ Trung Quốc phương pháp nhập, gốc tiếp theo kiểm tra đã trở nên không hiệu lực ");
      location.href = meta.sessionId
        ? ("wrong-words.html?session=" + encodeURIComponent(meta.sessionId))
        : "vocab-shelf.html";
      return;
    }
    gate.showCheat({
      onRestart: function () {
        if (lastQuizPayload) beginWithWords(lastQuizPayload, lastQuizOpts || {});
        else boot();
      },
      onExit: function () {
        location.href = meta.sessionId
          ? ("wrong-words.html?session=" + encodeURIComponent(meta.sessionId))
          : "vocab-shelf.html";
      }
    });
  }

  function onImeViolation() {
    if (state.imeBlocked || state.answered || state.gameOver) return;
    if (window.YYSD_IME_GATE && window.YYSD_IME_GATE.isOpen()) return;
    if (state.imeDebounce) return;
    state.imeDebounce = setTimeout(function () { state.imeDebounce = null; }, 1200);
    state.imeViolations++;
    var limit = (window.YYSD_IME_GATE && YYSD_IME_GATE.CHEAT_LIMIT) || 3;
    if (state.imeViolations > limit) {
      handleImeCheat();
      return;
    }
    requireImeGate("violation", function () {
      resumeTimerIfNeeded();
      var spell = document.getElementById("spell");
      if (spell && !spell.disabled) spell.focus();
    });
  }

  function softPrompt(msg) {
    var fb = document.getElementById("fb");
    if (!fb) return;
    fb.className = "vl-feedback show fail";
    fb.textContent = msg;
  }

  // ponytail: shared english-spell-input.js blocks Chinese IME autocomplete
  function bindEnglishSpellInput(el) {
    if (!window.YYSD_EN_SPELL || !window.YYSD_EN_SPELL.bind) return;
    YYSD_EN_SPELL.bind(el, {
      isLocked: function () { return !!state.answered || !!state.imeBlocked; },
      onWarn: softPrompt,
      onImeViolation: onImeViolation
    });
  }

  function revealSpellRow(focus) {
    var row = document.getElementById("spellRow");
    if (!row) return;
    if (!row.classList.contains("is-open")) {
      row.hidden = false;
      // ponytail: reflow so fade/slide CSS transition runs
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

  function paintMeaningResult(meaningOk) {
    var w = currentWord();
    root.querySelectorAll(".vl-opt").forEach(function (b) {
      b.classList.remove("selected");
      if (b.getAttribute("data-v") === quizMeaning(w)) b.classList.add("correct");
      else if (b.getAttribute("data-v") === state.selectedMeaning && !meaningOk) b.classList.add("wrong");
    });
  }

  function paintSpellResult(spellOk) {
    var spell = document.getElementById("spell");
    if (!spell) return;
    spell.classList.remove("spell-ok", "spell-bad");
    spell.classList.add(spellOk ? "spell-ok" : "spell-bad");
  }

  function renderQuizActive() {
    var w = currentWord();
    var opts = meaningOptions(w, 4);
    var labels = ["A", "B", "C", "D"];
    state.answered = false;
    state.waiting = false;
    state.selectedMeaning = null;
    shell(
      '<p class="vl-listen-hint">cười phát âm, trước lựa chọn ngôn ngữ ý nghĩa, lại đánh vần tiếng Anh</p>' +
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
      '<div class="vl-nav-row"><button type="button" class="vl-btn vl-btn-primary" id="qnext" disabled>xuống một chủ đề →</button></div>',
      { showLives: true }
    );
    document.getElementById("counter").innerHTML =
      (meta.sessionId ? " lỗi biến thể cũ của | lặp lại khảo sát · " : "") +
      " Thứ <strong>" + (state.quizIdx + 1) + "</strong> / " + state.quizOrder.length +
      " · Đúng " + state.correct +
      (meta.sessionId
        ? ""
        : ' <span style="color:#8a9e96">(chọn tự ' + state.poolTotal + " biến thể cũ của | của 60%)</span>");
    document.getElementById("listen").onclick = function () { speak(w.word); };
    speak(w.word);
    document.getElementById("opts").onclick = function (e) {
      var b = e.target.closest(".vl-opt");
      if (!b || state.answered) return;
      root.querySelectorAll(".vl-opt").forEach(function (x) { x.classList.remove("selected"); });
      b.classList.add("selected");
      state.selectedMeaning = b.getAttribute("data-v");
      var fb = document.getElementById("fb");
      if (fb && !state.answered) {
        fb.className = "vl-feedback";
        fb.textContent = "";
      }
      revealSpellRow(true);
    };
    document.getElementById("submit").onclick = submitQuiz;
    bindEnglishSpellInput(document.getElementById("spell"));
    document.getElementById("spell").onkeydown = function (e) {
      if (e.key === "Enter") submitQuiz();
    };
    document.getElementById("qnext").onclick = nextQuizQ;
    startTimer();
  }

  function submitQuiz() {
    if (state.answered || state.gameOver) return;
    if (!state.selectedMeaning) {
      softPrompt(" mời trước chọn ngôn ngữ Trung Quốc ý nghĩa ");
      return;
    }
    revealSpellRow(false);
    var spellEl = document.getElementById("spell");
    var spell = spellEl ? spellEl.value.trim().toLowerCase() : "";
    if (!spell) {
      softPrompt(" mời trước đánh vần tiếng Anh ");
      if (spellEl) spellEl.focus();
      return;
    }
    state.answered = true;
    clearInterval(state.timer);
    lockQuizControls();
    var w = currentWord();
    var meaningOk = state.selectedMeaning === quizMeaning(w);
    var spellOk = window.YYSD_EN_SPELL && YYSD_EN_SPELL.matches
      ? YYSD_EN_SPELL.matchesAny(spell, w.spellings && w.spellings.length ? w.spellings : [w.word])
      : spell === w.word.toLowerCase();
    var ok = meaningOk && spellOk;
    paintMeaningResult(meaningOk);
    paintSpellResult(spellOk);
    var fb = document.getElementById("fb");
    if (ok) {
      fb.className = "vl-feedback show ok";
      fb.textContent = "✅ hoàn chỉnh đúng! ";
      state.correct++;
    } else {
      state.lives--;
      state.wrong++;
      fb.className = "vl-feedback show fail";
      fb.textContent = "❌ Đáp án đúng: " + w.word + "(" + quizMeaning(w) + ")";
      updateLives();
    }
    recordQuizResult(w, spell, state.selectedMeaning, ok);
    afterAnswer();
  }

  function onTimeout() {
    if (state.answered || state.gameOver) return;
    state.answered = true;
    state.waiting = true;
    var w = currentWord();
    var spellEl = document.getElementById("spell");
    var spellRaw = spellEl ? spellEl.value.trim() : "";
    var spell = spellRaw.toLowerCase();
    var meaningOk = !!(state.selectedMeaning && state.selectedMeaning === quizMeaning(w));
    var spellOk = window.YYSD_EN_SPELL && YYSD_EN_SPELL.matchesAny
      ? YYSD_EN_SPELL.matchesAny(spellRaw, w.spellings && w.spellings.length ? w.spellings : [w.word])
      : !!(spell && spell === w.word.toLowerCase());
    var ok = meaningOk && spellOk;
    revealSpellRow(false);
    lockQuizControls();
    paintMeaningResult(meaningOk);
    paintSpellResult(spellOk);
    var fb = document.getElementById("fb");
    if (ok) {
      fb.className = "vl-feedback show ok";
      fb.textContent = "✅ thời gian đến, nhưng trả lời đúng! ";
      state.correct++;
    } else {
      state.lives--;
      state.wrong++;
      updateLives();
      fb.className = "vl-feedback show timeout";
      fb.textContent = "⏰ thời gian đến! Đáp án: " + w.word + "(" + quizMeaning(w) + ")";
    }
    recordQuizResult(w, spellRaw || "(timeout)", state.selectedMeaning || "", ok);
    afterAnswer();
  }

  function afterAnswer() {
    state.waiting = true;
    var nextBtn = document.getElementById("qnext");
    if (state.lives <= 0) {
      nextBtn.disabled = true;
      setTimeout(function () { endQuiz(false); }, 900);
      return;
    }
    if (state.quizIdx >= state.quizOrder.length - 1) {
      nextBtn.disabled = true;
      setTimeout(function () { endQuiz(true); }, 900);
      return;
    }
    nextBtn.disabled = false;
  }

  function nextQuizQ() {
    if (state.gameOver || !state.waiting) return;
    state.quizIdx++;
    renderQuizActive();
  }

  function endQuiz(finishedAll) {
    var passed = !!(finishedAll && state.lives > 0);
    if (state.lives <= 0) passed = false;
    state.gameOver = true;
    state.phase = "done";
    clearInterval(state.timer);
    var finishReq = meta.sessionId
      ? A.api("/api/vocab-shelf/wrongbook/retest-finish", {
          method: "POST",
          body: { sessionId: meta.sessionId, mistakes: state.mistakes }
        })
      : A.api("/api/vocab-shelf/quiz/finish", {
          method: "POST",
          body: {
            bookId: meta.bookId,
            listIds: meta.listIds,
            listLabels: meta.listLabels,
            quizToken: meta.quizToken || 0,
            results: state.quizResults || [],
            total: state.quizOrder.length,
            correct: state.correct,
            wrong: state.wrong,
            passed: passed,
            mistakes: state.mistakes,
            assignmentEventId: meta.assignmentEventId || assignEventId || 0
          }
        });
    var ov = document.getElementById("overlay");
    var box = document.getElementById("resultBox");
    var isRetest = !!meta.sessionId;
    var isAssign = !!(meta.assignmentEventId || assignEventId);
    box.innerHTML = '<div class="vl-state">đang ở nộp kết trái...</div>';
    ov.classList.add("show");

    finishReq.then(function (d) {
      var assign = d && d.assignment;
      var assignOk = !isAssign || !passed || (assign && assign.ok);
      var assignPartial = !!(assign && assign.partial);
      var title;
      var sub;
      if (isRetest) {
        title = " lặp lại khảo sát chấm dứt ";
        sub = " gốc sân phơi lỗi biến thể cũ của | danh sách đã thay cũ đổi mới làm vẫn lỗi của " + state.mistakes.length + " cái(ghi chép giữ, có thể thủ công xóa) ";
      } else if (passed && assignPartial) {
        title = " gốc List đi qua ";
        sub = " đã băng qua " + (assign.passedCount || 0) + "/" + (assign.totalLists || 0) +
          " cái List mời tiếp tục hoàn thành phần còn lại List, toàn bộ đi qua hoàng hậu bài tập về nhà khả năng coi như hoàn thành lỗi biến thể cũ của | đã viết đi vào lỗi chủ đề gốc ";
        if (assign.quizResult) meta.assignProgress = assign.quizResult;
      } else if (passed && assignOk) {
        title = isAssign ? " phát hiện đi qua · bài tập về nhà đã hoàn thành " : " xông qua rào cản Trấn Thành Công hoặc trấn Chengkung ở huyện Đài Đông |! ";
        sub = isAssign
          ? " thành tích đã nộp cho giáo viên lỗi biến thể cũ của | đã viết đi vào lỗi chủ đề gốc "
          : " đã thông quan lỗi biến thể cũ của | đã viết đi vào lỗi chủ đề gốc ";
      } else if (passed && !assignOk) {
        title = " phát hiện đi qua · bài tập về nhà chưa đồng bộ ";
        sub = " xông qua rào cản đã đi qua, nhưng bài tập về nhà tình trạng nộp bị đánh bại, mời thử lại có thể một lát nữa tồn tại ở lại làm xem xét ";
      } else {
        title = isAssign ? " chưa đi qua · bài tập về nhà chưa hoàn thành " : " xông qua rào cản bị đánh bại ";
        sub = isAssign
          ? " sai lầm đã đạt tới 5 Câu hỏi, phải ngay lập tức lặp lại khảo sát; chưa đi qua không tính hoàn thành bài tập về nhà "
          : " sự sống tiêu hao, có thể thử lại lỗi biến thể cũ của | đã bao gồm ";
      }
      var acts;
      if (isAssign && !passed) {
        acts =
          '<button type="button" class="vl-btn vl-btn-primary" id="retry">ngay lập tức lặp lại khảo sát</button>' +
          '<a class="vl-btn" href="dashboard.html">Đăng xuất(bài tập về nhà chưa hoàn thành)</a>';
      } else if (isAssign && passed && assignPartial) {
        acts =
          '<button type="button" class="vl-btn vl-btn-primary" id="nextList">tiếp tục xuống một List</button>' +
          '<a class="vl-btn" href="dashboard.html">một lát nữa lại làm</a>';
      } else if (isAssign && passed && !assignOk) {
        acts =
          '<button type="button" class="vl-btn vl-btn-primary" id="retry">lại nộp</button>' +
          '<a class="vl-btn" href="dashboard.html">trở về ở lại làm</a>';
      } else if (isAssign && passed) {
        acts =
          '<a class="vl-btn vl-btn-primary" href="dashboard.html">trở về ở lại làm</a>' +
          '<a class="vl-btn" href="wrong-words.html">Sổ lỗi sai</a>';
      } else {
        acts =
          '<button type="button" class="vl-btn vl-btn-primary" id="retry">' +
            (isRetest ? " lại khảo sát lỗi biến thể cũ của | " : " lại phát hiện ") + "</button>" +
          '<a class="vl-btn" href="wrong-words.html' +
            (isRetest ? ("?session=" + meta.sessionId) : "") +
            '">Sổ lỗi sai</a>' +
          (isRetest
            ? '<a class="vl-btn" href="dashboard.html">trở về ở lại làm</a>'
            : '<button type="button" class="vl-btn" id="backSetup">lặp lại chọn List</button>');
      }
      box.innerHTML =
        '<div style="font-size:40px">' + (passed ? "🎉" : "💪") + "</div>" +
        "<h2>" + title + "</h2>" +
        '<div style="color:#4d625b;font-size:14px;margin-top:6px">' + sub + "</div>" +
        '<div class="vl-score">' + state.correct + "<span> / " + state.quizOrder.length + "</span></div>" +
        '<div style="color:#4d625b;font-size:14px">Sai ' + state.wrong +
          " · phần còn lại sự sống " + Math.max(0, state.lives) + "</div>" +
        '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:16px">' +
          acts + "</div>";
      var retry = document.getElementById("retry");
      if (retry) {
        retry.onclick = function () {
          ov.classList.remove("show");
          if (meta.sessionId) startRetest(meta.sessionId);
          else startQuiz(meta.bookId, meta.listIds);
        };
      }
      var nextList = document.getElementById("nextList");
      if (nextList) {
        nextList.onclick = function () {
          ov.classList.remove("show");
          renderAssignPicker();
        };
      }
      var back = document.getElementById("backSetup");
      if (back) {
        back.onclick = function () {
          ov.classList.remove("show");
          boot();
        };
      }
    }).catch(function (e) {
      box.innerHTML =
        "<h2>kết trái nộp bị đánh bại</h2>" +
        '<div style="color:#4d625b;font-size:14px;margin-top:6px">' +
          esc((e && e.message) || " Internet bất thường ") + " mời thử lại, đừng trực tiếp đóng </div>" +
        '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:16px">' +
          '<button type="button" class="vl-btn vl-btn-primary" id="retry">thử lại nộp</button>' +
          '<a class="vl-btn" href="dashboard.html">trở về ở lại làm</a></div>';
      var retry = document.getElementById("retry");
      if (retry) {
        retry.onclick = function () {
          ov.classList.remove("show");
          endQuiz(finishedAll);
        };
      }
    });
  }

  function boot() {
    if (!needAuth()) return;
    root.innerHTML = '<div class="state state--brand"><div class="spinner spinner--brand"></div>Đang tải...</div>';
    if (retestSessionId) {
      startRetest(retestSessionId);
      return;
    }
    var preBook = (params.get("book") || "").trim();
    meta.bookId = preBook;
    meta.assignmentEventId = assignEventId;
    // Teacher assignment: one List at a time (never merge into one mega-quiz)
    if (assignEventId && preRefs.length) {
      meta.assignRefs = preRefs.slice();
      if (preRefs.length === 1) {
        meta.listIds = preRefs.slice();
        startQuiz("", preRefs);
        return;
      }
      loadAssignProgress().then(function () { renderAssignPicker(); });
      return;
    }
    if (assignEventId && preBook && preListIds.length) {
      meta.assignRefs = preListIds.map(function (lid) { return preBook + "||" + lid; });
      if (preListIds.length === 1) {
        meta.listIds = preListIds.slice();
        startQuiz(preBook, preListIds);
        return;
      }
      loadAssignProgress().then(function () { renderAssignPicker(); });
      return;
    }
    // Free deep-link from List học: chỉ khảo sát chỉ định List, nhảy qua sự chuẩn bị đầu
    if (!assignEventId && preRefs.length) {
      meta.listIds = preRefs.slice();
      startQuiz("", preRefs);
      return;
    }
    if (!assignEventId && preBook && preListIds.length) {
      meta.listIds = preListIds.slice();
      startQuiz(preBook, preListIds);
      return;
    }
    A.api("/api/vocab-shelf/bookshelf")
      .then(function (shelf) {
        if (!shelf.books || !shelf.books.length) {
          renderSetup(shelf, null);
          return null;
        }
        var id = preBook || shelf.books[0].bookId;
        meta.bookId = id;
        return A.api("/api/vocab-shelf/book?bookId=" + encodeURIComponent(id))
          .then(function (detail) { renderSetup(shelf, detail); });
      })
      .catch(function (e) {
        root.innerHTML = '<div class="state"><p>' + esc((e && e.message) || " Tải không thành công ") + "</p></div>";
      });
  }

  boot();
})();
