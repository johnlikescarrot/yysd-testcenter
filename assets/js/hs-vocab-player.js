/* hs-vocab-player.js - high-school dual-mode learn + lives quiz */
(function () {
  "use strict";
  var Y = window.YYSD;
  var A = window.YYSD_AUTH;
  var root = document.getElementById("hsv-root");
  var params = new URLSearchParams(location.search);
  var mode = params.get("mode") || "unit"; // unit | custom | wrong
  var listNo = Number(params.get("list") || 0);
  var batchIdParam = Number(params.get("batchId") || 0);
  var panel = params.get("panel") || "learn"; // learn | quiz
  var wrongDate = params.get("date") || "";
  var wrongSource = params.get("source") || "";
  var startCountParam = Number(params.get("startCount") || 0);

  // ponytail: all hs-vocab entry points redirected to new modules
  if (mode === "wrong") {
    location.replace("wrong-words.html");
    return;
  }
  if (panel === "quiz" || mode === "custom") {
    location.replace("vocab-quiz.html?book=gaozhong");
    return;
  }
  location.replace("vocab-shelf.html?book=gaozhong");
  return;

  var MAX_LIVES = 5;
  var TIME_LIMIT = 20;
  var state = {
    words: [],
    bank: [],
    status: null,
    idx: 0,
    blur: true,
    view: "learn",
    quizType: 1,
    quizOrder: [],
    qIdx: 0,
    lives: MAX_LIVES,
    correct: 0,
    wrong: 0,
    mistakes: [],
    selectedMeaning: null,
    answered: false,
    waiting: false,
    gameOver: false,
    timer: null,
    timerLeft: TIME_LIMIT,
    batch: null,
    quizCount: 0,
    listNo: listNo
  };

  function esc(s) {
    return Y && Y.esc ? Y.esc(String(s == null ? "" : s)) : String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function parseWordData(html) {
    var m = html.match(/(?:const|var|let)\s+wordData\s*=\s*(\[[\s\S]*?\]);/);
    if (!m) return [];
    try {
      var arr = Function('"use strict"; return (' + m[1] + ");")();
      return Array.isArray(arr) ? arr.filter(function (w) { return w && w.word; }) : [];
    } catch (e) {
      return [];
    }
  }

  function normalizeWord(w, list, globalIdx) {
    var ex = String(w.example || "");
    var em = ex.match(/^(.+?)[((](.+)[))]\s*$/);
    var coll = w.collocations;
    if (typeof coll === "string") {
      coll = coll.split(/[,, ]/).map(function (s) {
        s = s.trim();
        var cm = s.match(/^(.+?)[((](.+?)[))]$/);
        return cm ? { phrase: cm[1].trim(), meaning: cm[2].trim() } : { phrase: s, meaning: "" };
      }).filter(function (c) { return c.phrase; });
    }
    if (!Array.isArray(coll)) coll = [];
    return {
      en: String(w.word || w.en || "").trim(),
      word: String(w.word || w.en || "").trim(),
      phonetic: String(w.ipa || w.phonetic || "").trim(),
      ipa: String(w.ipa || w.phonetic || "").trim(),
      pos: String(w.pos || "").trim(),
      meaning: String(w.meaning || "").trim(),
      exampleEn: w.exampleEn || (em ? em[1].trim() : ex),
      exampleZh: w.exampleZh || (em ? em[2].trim() : ""),
      collocations: coll,
      root: w.root || "",
      synonyms: Array.isArray(w.synonyms) ? w.synonyms : [],
      antonyms: Array.isArray(w.antonyms) ? w.antonyms : [],
      examTag: w.examTag || null,
      paraphrase: w.paraphrase || null,
      acceptCN: Array.isArray(w.acceptCN) ? w.acceptCN : [],
      listNo: list,
      globalIdx: globalIdx
    };
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function speak(word) {
    if (!window.speechSynthesis || !word) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(word);
    u.lang = "en-GB";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }

  function requireLogin() {
    if (!A || !A.getToken || !A.getToken()) {
      location.href = "login.html?next=" + encodeURIComponent(location.pathname + location.search);
      return false;
    }
    return true;
  }

  function api(path, opts) {
    return A.api(path, opts || {});
  }

  function fail(msg) {
    root.innerHTML = '<div class="hsv-state"><p>' + esc(msg) + '</p>' +
      '<p style="margin-top:12px"><a class="hsv-back" href="vocab.html?book=gaozhong">← trở về trường trung học phổ thông biến thể của |</a></p></div>';
  }

  function loadBank() {
    return Y.load().then(function (items) {
      var lists = items.filter(function (it) {
        return it.zone === "study" && it.subject === "vocab";
      }).sort(function (a, b) { return Y.vocabListNo(a) - Y.vocabListNo(b); });
      var chain = Promise.resolve([]);
      lists.forEach(function (item) {
        chain = chain.then(function (acc) {
          return fetch("library/" + item.file).then(function (r) {
            if (!r.ok) throw new Error(" Tải không thành công " + item.file);
            return r.text();
          }).then(function (html) {
            var n = Y.vocabListNo(item);
            var words = parseWordData(html).map(function (w, i) {
              return normalizeWord(w, n, acc.length + i);
            });
            return acc.concat(words);
          });
        });
      });
      return chain.then(function (bank) {
        state.bank = bank;
        return { bank: bank, lists: lists };
      });
    });
  }

  function wordsForUnit(n) {
    return state.bank.filter(function (w) { return w.listNo === n; });
  }

  function boot() {
    if (!requireLogin()) return;
    loadBank().then(function () {
      return api("/api/hs-vocab/status");
    }).then(function (st) {
      state.status = st;
      if (mode === "unit") return bootUnit();
      if (mode === "custom") return bootCustom();
      if (mode === "wrong") return bootWrong();
      fail(" chưa biết chế độ ");
    }).catch(function (e) {
      fail((e && e.message) || " Tải không thành công ");
    });
  }

  function bootUnit() {
    if (!listNo) return fail(" thiếu đơn vị gầm ");
    state.words = wordsForUnit(listNo);
    if (!state.words.length) return fail(" Đơn vị " + listNo + " không có từ ");
    state.view = panel === "quiz" ? "setup" : "learn";
    renderShell();
  }

  function bootCustom() {
    var st = state.status;
    var active = st.active_batch;
    if (batchIdParam) {
      var hist = (st.batches || []).find(function (b) { return b.id === batchIdParam; });
      if (!hist) return fail(" không thể tìm thấy nên xác minh tiếp theo ");
      state.batch = hist;
      state.words = state.bank.slice(hist.start_idx, hist.start_idx + hist.count);
      state.view = panel === "quiz" ? "setup" : "learn";
      return renderShell();
    }
    if (active) {
      state.batch = active;
      state.words = state.bank.slice(active.start_idx, active.start_idx + active.count);
      state.view = panel === "quiz" ? "setup" : "learn";
      return renderShell();
    }
    // need to start a batch - show count picker or auto-start from hub
    if (startCountParam >= 10 && startCountParam <= 200) {
      return startCustomBatch(startCountParam).catch(function (e) {
        fail(e.message || " mở xác minh bị đánh bại ");
      });
    }
    state.view = "custom-start";
    renderShell();
  }

  function bootWrong() {
    if (!wrongDate || !wrongSource) return fail(" thiếu lỗi chủ đề chia thành nhóm tham số ");
    return api("/api/hs-vocab/mistakes/group?date=" + encodeURIComponent(wrongDate) +
      "&source=" + encodeURIComponent(wrongSource)).then(function (d) {
      state.words = (d.items || []).map(function (it, i) {
        if (it.word_json) return normalizeWord(it.word_json, 0, i);
        return normalizeWord({ word: it.word, ipa: it.ipa, meaning: it.meaning }, 0, i);
      });
      if (!state.words.length) return fail(" nên chia thành nhóm không có lỗi biến thể cũ của | ");
      state.view = "setup";
      renderShell();
    });
  }

  function startCustomBatch(count) {
    return api("/api/hs-vocab/custom/start", {
      method: "POST",
      body: { count: count, bank_total: state.bank.length }
    }).then(function (st) {
      state.status = st;
      state.batch = st.active_batch;
      if (!state.batch) throw new Error(" mở xác minh bị đánh bại ");
      state.words = state.bank.slice(state.batch.start_idx, state.batch.start_idx + state.batch.count);
      state.view = "learn";
      history.replaceState(null, "", "hs-vocab.html?mode=custom");
      renderShell();
    });
  }

  function badgeText() {
    if (mode === "unit") return " Đơn vị " + listNo;
    if (mode === "wrong") return " lỗi chủ đề lại khảo sát ";
    if (state.batch) {
      return (state.batch.batch_date || "") + " · " + state.batch.count + " Từ ";
    }
    return " tùy chỉnh ";
  }

  function renderShell() {
    document.title = badgeText() + " · trường trung học phổ thông biến thể của | ";
    if (state.view === "custom-start") {
      root.innerHTML =
        '<a class="hsv-back" href="vocab.html?book=gaozhong&view=custom">← Quay lại</a>' +
        '<div class="hsv-setup">' +
        '<h2>tùy chỉnh học</h2>' +
        '<p>đã học được thu <strong>' + (state.status.cursor_idx + 1) + '</strong> Từ / Tổng cộng ' +
        state.bank.length + ' Từ mời thiết lập gốc xác minh số lượng(10–200) </p>' +
        '<label>gốc xác minh từ đếm<input type="number" id="hsv-count" min="10" max="200" value="50"></label>' +
        '<button type="button" class="hsv-btn hsv-btn-primary" id="hsv-start-batch">bắt đầu gốc xác minh</button>' +
        '</div>';
      document.getElementById("hsv-start-batch").onclick = function () {
        var n = Number(document.getElementById("hsv-count").value);
        startCustomBatch(n).catch(function (e) { alert(e.message || " mở xác minh bị đánh bại "); });
      };
      return;
    }
    if (state.view === "setup") {
      var maxQ = state.words.length;
      var defaultQ = mode === "unit" ? maxQ : Math.min(40, maxQ);
      root.innerHTML =
        '<a class="hsv-back" href="vocab.html?book=gaozhong">← Quay lại</a>' +
        '<div class="hsv-setup">' +
        '<h2>xông qua rào cản phát hiện</h2>' +
        '<p>' + esc(badgeText()) + ' · Tổng cộng ' + maxQ + ' Từ hình thức gắn liền có nghĩa giống như từ tự do hoàn thành và sự sống chưa tiêu hao khả năng coi như thông quan </p>' +
        (mode === "unit"
          ? '<p>gốc đơn vị sẽ phát hiện toàn bộ <strong>' + maxQ + '</strong> Từ </p>'
          : '<label>kiểm tra ngẫu nhiên số lượng(1–' + maxQ + ')<input type="number" id="hsv-qcount" min="1" max="' + maxQ + '" value="' + defaultQ + '"></label>') +
        '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:12px">' +
        '<button type="button" class="hsv-btn" id="hsv-to-learn">trước đi học</button>' +
        '<button type="button" class="hsv-btn hsv-btn-primary" id="hsv-begin-quiz">bắt đầu xông qua rào cản</button>' +
        '</div></div>';
      document.getElementById("hsv-to-learn").onclick = function () {
        state.view = "learn";
        renderShell();
      };
      document.getElementById("hsv-begin-quiz").onclick = function () {
        var n = mode === "unit" ? maxQ : Number(document.getElementById("hsv-qcount").value);
        if (!n || n < 1 || n > maxQ) { alert(" mời nhập khẩu hiệu quả kiểm tra ngẫu nhiên số lượng "); return; }
        beginQuiz(n);
      };
      return;
    }
    renderApp();
  }

  function renderApp() {
    var livesHtml = "";
    for (var i = 0; i < MAX_LIVES; i++) {
      livesHtml += '<span class="heart' + (i >= state.lives ? " lost" : "") + '">❤️</span>';
    }
    root.innerHTML =
      '<a class="hsv-back" href="vocab.html?book=gaozhong">← trở về trường trung học phổ thông biến thể của |</a>' +
      '<div class="hsv-top">' +
        '<div class="hsv-brand">xuất sắc dễ suy nghĩ đạt tới · <span>trường trung học phổ thông biến thể của |</span></div>' +
        '<div class="hsv-badge">' + esc(badgeText()) + '</div>' +
        (state.view === "quiz" ? '<div class="hsv-lives" id="hsv-lives">' + livesHtml + '</div>' : '') +
      '</div>' +
      '<div class="hsv-tabs">' +
        '<button type="button" class="hsv-tab' + (state.view === "learn" ? " active" : "") + '" data-v="learn">học</button>' +
        '<button type="button" class="hsv-tab' + (state.view === "quiz" ? " active" : "") + '" data-v="quiz">xông qua rào cản phát hiện</button>' +
      '</div>' +
      '<div class="hsv-info">' +
        '<div id="hsv-counter"></div>' +
        '<div class="hsv-timer" id="hsv-timer" style="display:none">⏱ <span class="num" id="hsv-timer-num">20</span>s</div>' +
      '</div>' +
      '<div id="hsv-panel"></div>' +
      '<div class="hsv-overlay" id="hsv-overlay"><div class="hsv-result" id="hsv-result"></div></div>';

    root.querySelector(".hsv-tabs").onclick = function (e) {
      var btn = e.target.closest(".hsv-tab");
      if (!btn) return;
      var v = btn.getAttribute("data-v");
      if (v === "learn") {
        clearInterval(state.timer);
        state.view = "learn";
        state.gameOver = false;
        renderApp();
      } else {
        state.view = "setup";
        renderShell();
      }
    };
    if (state.view === "learn") renderLearn();
    else renderQuizFrame();
  }

  function renderLearn() {
    var w = state.words[state.idx];
    if (!w) return;
    document.getElementById("hsv-counter").innerHTML =
      'Thứ <strong>' + (state.idx + 1) + '</strong> / ' + state.words.length + ' Từ';
    var collHtml = "";
    if (w.collocations && w.collocations.length) {
      collHtml = '<div class="hsv-section"><div class="hsv-section-title">Cụm đi kèm</div><div class="hsv-collocs">' +
        w.collocations.map(function (c) {
          return '<span class="hsv-coloc">' + esc(c.phrase) +
            (c.meaning ? ' <span style="color:#6b7e78">→ ' + esc(c.meaning) + '</span>' : '') + '</span>';
        }).join("") + '</div></div>';
    }
    var examHtml = "";
    if (w.examTag) {
      examHtml = '<div class="hsv-section"><div class="hsv-exam">' +
        '<span><span class="lbl">Nguồn </span>' + esc(w.examTag.source || "") + '</span>' +
        '<span><span class="lbl">chủ đề </span>' + esc(w.examTag.topic || "") + '</span>' +
        '<span><span class="lbl">cách dùng </span>' + esc(w.examTag.commonUsage || "") + '</span>' +
        '</div></div>';
    }
    var rootHtml = w.root
      ? '<div class="hsv-section"><div class="hsv-section-title">gốc từ tháo rời</div><div class="hsv-root-text">' + esc(w.root) + '</div></div>'
      : "";
    var exHtml = "";
    if (w.exampleEn) {
      var en = esc(w.exampleEn);
      try {
        en = en.replace(new RegExp("\\b" + w.en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "gi"),
          function (m) { return '<span class="hsv-hl">' + m + "</span>"; });
      } catch (e) {}
      exHtml = '<div class="hsv-section"><div class="hsv-section-title">Câu ví dụ</div>' +
        '<div class="hsv-ex-en">' + en + '</div>' +
        (w.exampleZh ? '<div class="hsv-ex-zh">' + esc(w.exampleZh) + '</div>' : '') +
        '</div>';
    }
    var synHtml = "";
    if ((w.synonyms && w.synonyms.length) || (w.antonyms && w.antonyms.length)) {
      synHtml = '<div class="hsv-section">' +
        (w.synonyms.length ? '<div class="hsv-syn">đồng nghĩa: ' + esc(w.synonyms.join(" · ")) + '</div>' : '') +
        (w.antonyms.length ? '<div class="hsv-syn">Trái nghĩa: ' + esc(w.antonyms.join(" · ")) + '</div>' : '') +
        '</div>';
    }
    document.getElementById("hsv-panel").innerHTML =
      '<div class="hsv-card">' +
        '<div class="hsv-word">' + esc(w.en) + '</div>' +
        '<div class="hsv-ipa">' + esc(w.phonetic) + '</div>' +
        (w.pos ? '<div class="hsv-pos">' + esc(w.pos) + '</div>' : '') +
        '<div class="hsv-audio"><button type="button" class="hsv-btn" id="hsv-speak">🔊 Phát âm</button></div>' +
        '<div class="hsv-meaning' + (state.blur ? " blurred" : "") + '" id="hsv-meaning">' +
          esc(w.meaning) + '<span class="hsv-hint">nhấn hiển thị/che giấu</span></div>' +
        examHtml + collHtml + exHtml + rootHtml + synHtml +
        '<div class="hsv-nav">' +
          '<button type="button" id="hsv-prev">← cái trước</button>' +
          '<button type="button" class="hsv-btn-primary" id="hsv-next">cái tiếp theo →</button>' +
          '<button type="button" class="hsv-btn hsv-btn-primary" id="hsv-go-quiz">đi phát hiện</button>' +
        '</div>' +
      '</div>';
    document.getElementById("hsv-speak").onclick = function () { speak(w.en); };
    document.getElementById("hsv-meaning").onclick = function () {
      state.blur = !state.blur;
      renderLearn();
    };
    document.getElementById("hsv-prev").onclick = function () {
      if (state.idx > 0) { state.idx--; state.blur = true; renderLearn(); }
    };
    document.getElementById("hsv-next").onclick = function () {
      if (state.idx < state.words.length - 1) { state.idx++; state.blur = true; renderLearn(); }
    };
    document.getElementById("hsv-go-quiz").onclick = function () {
      state.view = "setup";
      renderShell();
    };
  }

  function beginQuiz(count) {
    state.quizCount = count;
    state.quizOrder = shuffle(state.words.map(function (_, i) { return i; })).slice(0, count);
    state.qIdx = 0;
    state.lives = MAX_LIVES;
    state.correct = 0;
    state.wrong = 0;
    state.mistakes = [];
    state.gameOver = false;
    state.answered = false;
    state.waiting = false;
    state.view = "quiz";
    // prefer paraphrase tab only if current pool has any paraphrase
    state.quizType = 1;
    renderApp();
  }

  function renderQuizFrame() {
    var hasPara = state.quizOrder.some(function (i) { return state.words[i] && state.words[i].paraphrase; });
    document.getElementById("hsv-panel").innerHTML =
      '<div class="hsv-quiz-types">' +
        '<button type="button" class="hsv-qtype' + (state.quizType === 1 ? " active" : "") + '" data-t="1">cười âm thanh đánh vần</button>' +
        (hasPara ? '<button type="button" class="hsv-qtype' + (state.quizType === 2 ? " active" : "") + '" data-t="2">đồng nghĩa thay thế</button>' : '') +
      '</div>' +
      '<div id="hsv-qbody"></div>' +
      '<div class="hsv-feedback" id="hsv-fb"></div>' +
      '<div class="hsv-nav"><button type="button" class="hsv-btn hsv-btn-primary" id="hsv-qnext" disabled>xuống một chủ đề →</button></div>';
    document.querySelector(".hsv-quiz-types").onclick = function (e) {
      var b = e.target.closest(".hsv-qtype");
      if (!b || state.answered || state.gameOver) return;
      state.quizType = Number(b.getAttribute("data-t"));
      renderQuizFrame();
    };
    document.getElementById("hsv-qnext").onclick = nextQuiz;
    renderQuizQuestion();
  }

  function currentQuizWord() {
    return state.words[state.quizOrder[state.qIdx]];
  }

  function buildMeaningOptions(w) {
    var correct = w.meaning;
    var pool = state.words.map(function (x) { return x.meaning; }).filter(function (m) { return m && m !== correct; });
    pool = shuffle(pool).slice(0, 3);
    var used = {};
    used[correct] = true;
    pool.forEach(function (m) { used[m] = true; });
    var extras = [" bàn / bàn học ", " chạy / chạy ", " cửa sổ / cửa sổ ", " màu vàng / vàng kim ",
      " yên tĩnh / tĩnh lặng ", " bạn / bạn ", " thời tiết / khí hậu ", " trường học / Khuôn viên trường "];
    for (var i = 0; i < extras.length && pool.length < 3; i++) {
      if (used[extras[i]]) continue;
      used[extras[i]] = true;
      pool.push(extras[i]);
    }
    return shuffle([correct].concat(pool));
  }

  function startTimer() {
    clearInterval(state.timer);
    state.timerLeft = TIME_LIMIT;
    var el = document.getElementById("hsv-timer");
    var num = document.getElementById("hsv-timer-num");
    if (el) el.style.display = "block";
    if (num) { num.textContent = state.timerLeft; num.className = "num"; }
    state.timer = setInterval(function () {
      state.timerLeft--;
      if (num) {
        num.textContent = state.timerLeft;
        num.classList.toggle("warning", state.timerLeft <= 3);
      }
      if (state.timerLeft <= 0) {
        clearInterval(state.timer);
        if (!state.answered && !state.gameOver) onTimeout();
      }
    }, 1000);
  }

  function renderQuizQuestion() {
    if (state.gameOver) return;
    if (state.qIdx >= state.quizOrder.length) {
      endGame(true);
      return;
    }
    state.answered = false;
    state.waiting = false;
    state.selectedMeaning = null;
    var w = currentQuizWord();
    document.getElementById("hsv-counter").innerHTML =
      'Thứ <strong>' + (state.qIdx + 1) + '</strong> / ' + state.quizOrder.length + ' Câu hỏi · Đúng ' + state.correct;
    var livesEl = document.getElementById("hsv-lives");
    if (livesEl) {
      var h = "";
      for (var i = 0; i < MAX_LIVES; i++) h += '<span class="heart' + (i >= state.lives ? " lost" : "") + '">❤️</span>';
      livesEl.innerHTML = h;
    }
    var usePara = state.quizType === 2 && w.paraphrase;
    if (usePara) renderType2(w);
    else renderType1(w);
    startTimer();
  }

  function renderType1(w) {
    var body = document.getElementById("hsv-qbody");
    var opts = buildMeaningOptions(w);
    var labels = ["A", "B", "C", "D"];
    body.innerHTML =
      '<div class="hsv-listen-hint">cười phát âm, chọn đúng ngôn ngữ Trung Quốc, lại đánh vần tiếng Anh</div>' +
      '<button type="button" class="hsv-btn" id="hsv-qlisten">🔊 phát sóng phát âm</button>' +
      '<div class="hsv-spell-row">' +
        '<input type="text" id="hsv-spell" placeholder=" đánh vần tiếng Anh..." autocomplete="off">' +
        '<button type="button" class="hsv-btn hsv-btn-primary" id="hsv-submit" disabled>Nộp bài</button>' +
      '</div>' +
      '<div class="hsv-opts" id="hsv-opts">' +
        opts.map(function (o, i) {
          return '<button type="button" class="hsv-opt" data-v="' + esc(o) + '"><span class="label">' +
            labels[i] + '.</span> ' + esc(o) + '</button>';
        }).join("") +
      '</div>';
    document.getElementById("hsv-qlisten").onclick = function () { speak(w.en); };
    setTimeout(function () { speak(w.en); }, 250);
    document.getElementById("hsv-opts").onclick = function (e) {
      var b = e.target.closest(".hsv-opt");
      if (!b || state.answered) return;
      document.querySelectorAll("#hsv-opts .hsv-opt").forEach(function (x) { x.classList.remove("correct"); });
      b.classList.add("correct");
      state.selectedMeaning = b.getAttribute("data-v");
      document.getElementById("hsv-submit").disabled = false;
      document.getElementById("hsv-spell").focus();
    };
    document.getElementById("hsv-submit").onclick = submitSpell;
    document.getElementById("hsv-spell").onkeydown = function (e) {
      if (e.key === "Enter") submitSpell();
    };
    document.getElementById("hsv-qnext").disabled = true;
    var fb = document.getElementById("hsv-fb");
    fb.className = "hsv-feedback";
    fb.style.display = "none";
  }

  function submitSpell() {
    if (state.answered || state.gameOver || !state.selectedMeaning) return;
    var spell = document.getElementById("hsv-spell").value.trim().toLowerCase();
    if (!spell) {
      var fb0 = document.getElementById("hsv-fb");
      fb0.className = "hsv-feedback show fail";
      fb0.style.display = "block";
      fb0.textContent = " mời đánh vần tiếng Anh từ ";
      return;
    }
    state.answered = true;
    clearInterval(state.timer);
    document.getElementById("hsv-spell").disabled = true;
    document.getElementById("hsv-submit").disabled = true;
    document.querySelectorAll("#hsv-opts .hsv-opt").forEach(function (b) { b.classList.add("disabled"); });
    var w = currentQuizWord();
    var meaningOk = state.selectedMeaning === w.meaning;
    var spellOk = spell === w.en.toLowerCase();
    var ok = meaningOk && spellOk;
    document.querySelectorAll("#hsv-opts .hsv-opt").forEach(function (b) {
      if (b.getAttribute("data-v") === w.meaning) b.classList.add("correct");
      else if (b.getAttribute("data-v") === state.selectedMeaning && !meaningOk) b.classList.add("wrong");
    });
    var fb = document.getElementById("hsv-fb");
    fb.style.display = "block";
    if (ok) {
      fb.className = "hsv-feedback show ok";
      fb.textContent = "✅ hoàn chỉnh đúng! ";
      state.correct++;
    } else {
      state.lives--;
      state.wrong++;
      pushMistake(w, spell);
      fb.className = "hsv-feedback show fail";
      fb.textContent = "❌ Đáp án đúng: " + w.en + "(" + w.meaning + ")";
      updateLivesUI();
    }
    afterAnswer();
  }

  function renderType2(w) {
    var p = w.paraphrase;
    var body = document.getElementById("hsv-qbody");
    var orig = esc(p.original);
    try {
      orig = orig.replace(new RegExp("\\b" + w.en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "gi"),
        function (m) { return '<span class="hsv-hl">' + m + "</span>"; });
    } catch (e) {}
    var opts = shuffle([p.correct].concat(p.distractors || []).slice(0, 4));
    var labels = ["A", "B", "C", "D"];
    body.innerHTML =
      '<div class="hsv-ex-en" style="margin-bottom:10px">📖 ' + orig + '</div>' +
      '<div class="hsv-listen-hint">chọn biến thể của | nguyên văn ý tưởng biến thể của tiếp cận của tùy chọn</div>' +
      '<div class="hsv-opts" id="hsv-popts">' +
        opts.map(function (o, i) {
          return '<button type="button" class="hsv-opt" data-v="' + esc(o) + '"><span class="label">' +
            labels[i] + '.</span> ' + esc(o) + '</button>';
        }).join("") +
      '</div>';
    document.getElementById("hsv-popts").onclick = function (e) {
      var b = e.target.closest(".hsv-opt");
      if (!b || state.answered) return;
      handlePara(b, b.getAttribute("data-v"), p.correct, p.explanation || "");
    };
    document.getElementById("hsv-qnext").disabled = true;
    var fb = document.getElementById("hsv-fb");
    fb.className = "hsv-feedback";
    fb.style.display = "none";
  }

  function handlePara(btn, selected, correct, explanation) {
    state.answered = true;
    clearInterval(state.timer);
    document.querySelectorAll("#hsv-popts .hsv-opt").forEach(function (b) { b.classList.add("disabled"); });
    var ok = selected === correct;
    document.querySelectorAll("#hsv-popts .hsv-opt").forEach(function (b) {
      if (b.getAttribute("data-v") === correct) b.classList.add("correct");
      else if (b === btn && !ok) b.classList.add("wrong");
    });
    var fb = document.getElementById("hsv-fb");
    fb.style.display = "block";
    var w = currentQuizWord();
    if (ok) {
      fb.className = "hsv-feedback show ok";
      fb.innerHTML = "✅ Đúng! " + (explanation ? "<div>" + esc(explanation) + "</div>" : "");
      state.correct++;
    } else {
      state.lives--;
      state.wrong++;
      pushMistake(w, selected);
      fb.className = "hsv-feedback show fail";
      fb.innerHTML = "❌ " + esc(correct) + (explanation ? "<div>" + esc(explanation) + "</div>" : "");
      updateLivesUI();
    }
    afterAnswer();
  }

  function onTimeout() {
    state.answered = true;
    state.waiting = true;
    var w = currentQuizWord();
    pushMistake(w, "(timeout)");
    state.lives--;
    state.wrong++;
    updateLivesUI();
    var fb = document.getElementById("hsv-fb");
    fb.style.display = "block";
    fb.className = "hsv-feedback show timeout";
    fb.textContent = "⏰ thời gian đến! Đáp án: " + w.en + "(" + w.meaning + ")";
    afterAnswer();
  }

  function pushMistake(w, userAnswer) {
    state.mistakes.push({
      word: w.en,
      ipa: w.ipa,
      meaning: w.meaning,
      user_answer: userAnswer,
      word_json: w
    });
  }

  function updateLivesUI() {
    var livesEl = document.getElementById("hsv-lives");
    if (!livesEl) return;
    var h = "";
    for (var i = 0; i < MAX_LIVES; i++) h += '<span class="heart' + (i >= state.lives ? " lost" : "") + '">❤️</span>';
    livesEl.innerHTML = h;
  }

  function afterAnswer() {
    state.waiting = true;
    var nextBtn = document.getElementById("hsv-qnext");
    if (state.lives <= 0) {
      nextBtn.disabled = true;
      setTimeout(function () { endGame(false); }, 900);
      return;
    }
    if (state.qIdx >= state.quizOrder.length - 1) {
      nextBtn.disabled = true;
      setTimeout(function () { endGame(true); }, 900);
      return;
    }
    nextBtn.disabled = false;
  }

  function nextQuiz() {
    if (state.gameOver || !state.waiting) return;
    state.qIdx++;
    renderQuizQuestion();
  }

  function endGame(passedClear) {
    // passedClear means finished all questions with lives left
    var passed = !!passedClear && state.lives > 0 && state.qIdx >= state.quizOrder.length - 1 && state.wrong + state.correct >= state.quizOrder.length;
    // recompute: if we got here via lives, passed=false; via complete with lives>0, true
    if (state.lives <= 0) passed = false;
    else if (state.correct + state.wrong >= state.quizOrder.length) passed = true;
    else passed = false;

    state.gameOver = true;
    clearInterval(state.timer);
    var payload = { passed: passed, mistakes: state.mistakes };
    var req;
    if (mode === "unit") {
      payload.list_no = listNo;
      req = api("/api/hs-vocab/unit/finish", { method: "POST", body: payload });
    } else if (mode === "custom") {
      payload.batch_id = state.batch && state.batch.id;
      req = api("/api/hs-vocab/custom/finish", { method: "POST", body: payload });
    } else {
      payload.source = "wrong-retest";
      req = api("/api/hs-vocab/mistakes/retest-finish", { method: "POST", body: payload });
    }
    req.catch(function () { /* still show UI */ }).then(function () {
      showResult(passed);
    });
  }

  function showResult(passed) {
    var ov = document.getElementById("hsv-overlay");
    var box = document.getElementById("hsv-result");
    var uniq = {};
    state.mistakes.forEach(function (m) { uniq[m.word] = m; });
    var errKeys = Object.keys(uniq);
    box.innerHTML =
      '<div style="font-size:40px">' + (passed ? "🎉" : "💪") + '</div>' +
      '<h2>' + (passed ? " xông qua rào cản Trấn Thành Công hoặc trấn Chengkung ở huyện Đài Đông |! " : " xông qua rào cản bị đánh bại ") + '</h2>' +
      '<div class="sub">' + (passed ? " đã thông quan, tốc độ tiến triển đã bảo tồn " : " sự sống tiêu hao có thể không hoàn chỉnh, mời thử lại(tốc độ tiến triển chưa thúc đẩy)") + '</div>' +
      '<div class="score">' + state.correct + '<span> / ' + state.quizOrder.length + '</span></div>' +
      '<div class="sub">Sai ' + state.wrong + ' · phần còn lại sự sống ' + Math.max(0, state.lives) + '</div>' +
      (errKeys.length
        ? '<div class="hsv-err-list">' + errKeys.map(function (k) {
            return '<div><strong>' + esc(k) + '</strong> · ' + esc(uniq[k].meaning || "") + '</div>';
          }).join("") + '</div>'
        : '') +
      '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:14px">' +
        '<button type="button" class="hsv-btn hsv-btn-primary" id="hsv-retry">lại xông qua rào cản</button>' +
        '<a class="hsv-btn" href="vocab.html?book=gaozhong">trở về biến thể cũ của | viết tắt của |</a>' +
        '<a class="hsv-btn" href="wrong-words.html?book=gaozhong">Sổ lỗi sai</a>' +
      '</div>';
    ov.classList.add("show");
    document.getElementById("hsv-retry").onclick = function () {
      ov.classList.remove("show");
      state.view = "setup";
      renderShell();
    };
  }

  boot();
})();
