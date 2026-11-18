/* =========================================================================
   diagnostic.js - Assessment Console (vocab placement session)
   ========================================================================= */
(function () {
  "use strict";

  var A = window.YYSD_AUTH;
  var Y = window.YYSD;
  var contentEl = document.getElementById("content");
  var examCenter = document.getElementById("diag-exam-center");
  var examSub = document.getElementById("diag-exam-sub");
  var exitLink = document.getElementById("diag-exit-link");
  var OPT_KEYS = ["A", "B", "C", "D", "E", "F"];

  var TYPE_LABEL = {
    listening_choice: " cười âm thanh chọn biến thể cũ của | ",
    english_to_chinese: " chăm sóc Anh lựa chọn ",
    chinese_to_english: " thích chọn Anh ",
    spelling: " đánh vần lấp chỗ trống công việc "
  };
  var RATING_STAR = {
    excellent: " xuất sắc ",
    good: " tốt ",
    weak: " yêu cầu củng cố "
  };
  var LEVEL_NAME = {
    high_school: " trường trung học phổ thông biến thể của | ",
    cet4: " Từ vựng CET-4 ",
    ielts: " IELTS biến thể của | "
  };

  var state = {
    session: null,
    selected: null,
    feedback: null,
    submitting: false,
    timerStart: null,
    elapsedBase: 0,
    timerId: null,
    qStart: null,
    report: null,
    gate: false,
    earlyAborted: false
  };

  state.gate = new URLSearchParams(location.search).get("gate") === "1";

  function esc(s) {
    return Y && Y.esc ? Y.esc(s) : String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function api(path, opts) {
    if (!A || !A.api) return Promise.reject(new Error(" mời trước đăng ký "));
    return A.api(path, opts);
  }

  function elapsedNow() {
    var base = state.elapsedBase || 0;
    if (!state.timerStart) return base;
    return base + Math.floor((Date.now() - state.timerStart) / 1000);
  }

  function formatTime(sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function startTimer(base) {
    state.elapsedBase = base || 0;
    state.timerStart = Date.now();
    if (state.timerId) clearInterval(state.timerId);
    state.timerId = setInterval(function () {
      var el = document.getElementById("diag-timer");
      if (el) el.textContent = formatTime(elapsedNow());
      var chip = document.getElementById("diag-hud-timer");
      if (chip) chip.textContent = formatTime(elapsedNow());
    }, 1000);
  }

  function stopTimer() {
    if (state.timerId) clearInterval(state.timerId);
    state.timerId = null;
    state.elapsedBase = elapsedNow();
    state.timerStart = null;
  }

  function setSessionMode(on) {
    document.body.classList.toggle("is-diag-session", !!on);
    if (examCenter) examCenter.hidden = !on;
    if (examSub) {
      examSub.textContent = on
        ? "IN SESSION"
        : (state.gate ? "First-time Placement" : "Vocabulary Placement Assessment");
    }
  }

  function updateExamHud(sess) {
    if (!examCenter || !sess) return;
    var prog = sess.stage_progress || { answered: 0, total: 0, correct: 0 };
    var qNo = Math.min((prog.answered || 0) + 1, prog.total || 0);
    if (sess.stage_done) qNo = prog.total || 0;
    var answered = prog.answered || 0;
    var wrong = Math.max(0, answered - (prog.correct || 0));
    var errPct = answered ? Math.round((wrong / answered) * 100) : 0;
    examCenter.innerHTML =
      '<span class="diag-hud-chip"><em>giai đoạn</em><b>' + esc(sess.stage_name || "-") + "</b></span>" +
      '<span class="diag-hud-chip"><em>chủ đề gầm</em><b>' + qNo + " / " + (prog.total || 0) + "</b></span>" +
      '<span class="diag-hud-chip"><em>Thời lượng</em><b id="diag-hud-timer">' + esc(formatTime(elapsedNow())) + "</b></span>" +
      '<span class="diag-hud-chip"><em>sai lầm tỉ lệ</em><b>' + (answered ? errPct + "%" : "-") + "</b></span>";
  }

  function speakWord(text) {
    if (window.YysdWordAudio && window.YysdWordAudio.speak) {
      window.YysdWordAudio.speak(text);
    } else if (window.speechSynthesis) {
      var u = new SpeechSynthesisUtterance(text);
      u.lang = "en-GB";
      window.speechSynthesis.speak(u);
    }
  }

  function requireLogin() {
    setSessionMode(false);
    if (!A || !A.getToken || !A.getToken()) {
      var next = state.gate ? "diagnostic.html?gate=1" : "diagnostic.html";
      contentEl.innerHTML =
        '<div class="diag-brief">' +
        '<p class="diag-kicker">Access</p>' +
        "<h1>mời trước đăng ký</h1>" +
        '<p class="diag-lead">sử dụng học sinh số tài khoản đăng ký hoàng hậu bắt đầu biến thể của | năng lực chẩn đoán </p>' +
        '<div class="diag-actions"><a class="btn btn--primary" href="login.html?next=' +
        encodeURIComponent(next) +
        '">đi đăng ký</a></div></div>';
      return false;
    }
    if (A.isTeacher && A.isTeacher()) {
      contentEl.innerHTML =
        '<div class="diag-brief">' +
        '<p class="diag-kicker">Teacher</p>' +
        "<h1>mời sử dụng học sinh số tài khoản</h1>" +
        '<p class="diag-lead">giáo viên có thể tồn tại học tình cảm biển quảng cáo xem xét lớp học chẩn đoán cái nhìn tổng quan </p>' +
        '<div class="diag-actions"><a class="btn btn--ghost" href="teacher.html">mở giáo viên cuối</a></div></div>';
      return false;
    }
    return true;
  }

  function applyGateChrome() {
    if (!state.gate) return;
    document.title = " đầu tiên biến thể của | năng lực kiểm tra · Trung tâm YYSD ";
    if (exitLink) {
      exitLink.textContent = " hoàn thành kém phát triển đi vào từ khu vực ";
      exitLink.removeAttribute("href");
      exitLink.style.opacity = "0.65";
      exitLink.style.pointerEvents = "none";
    }
  }

  function renderIntro(resumeSession) {
    setSessionMode(false);
    applyGateChrome();
    var title = state.gate ? " đầu tiên biến thể của | năng lực kiểm tra " : " biến thể của | năng lực chẩn đoán ";
    var resumeHtml = "";
    if (resumeSession) {
      resumeHtml =
        '<p class="diag-lead">phát hiện đến chưa hoàn thành số lần chiếu của một bộ phim(' +
        esc(resumeSession.stage_name || "") + " · đã hình thức gắn liền có nghĩa giống như từ tự do " +
        ((resumeSession.stage_progress && resumeSession.stage_progress.answered) || 0) +
        " Câu hỏi) </p>" +
        '<div class="diag-actions">' +
        '<button type="button" class="btn btn--primary" id="diag-resume">tiếp tục kiểm tra</button>' +
        '<button type="button" class="btn btn--ghost" id="diag-restart">Bắt đầu lại</button>' +
        "</div>";
    } else {
      resumeHtml =
        '<div class="diag-actions">' +
        '<button type="button" class="btn btn--primary" id="diag-start">' +
        (state.gate ? " bắt đầu kiểm tra " : " bắt đầu chẩn đoán ") +
        "</button>" +
        (state.gate
          ? ""
          : '<a class="btn btn--ghost" href="diagnostic-mistakes.html">chẩn đoán lỗi chủ đề gốc</a>') +
        "</div>";
    }

    contentEl.innerHTML =
      '<div class="diag-brief">' +
      '<p class="diag-kicker">' + (state.gate ? "Mandatory Placement" : "Assessment Briefing") + "</p>" +
      "<h1>" + esc(title) + "</h1>" +
      (state.gate
        ? '<p class="diag-lead diag-lead--gate"><strong>đầu tiên đi vào từ khu vực trước phải hoàn thành đầu tiên năng lực kiểm tra </strong>chấm dứt thế hệ trẻ thành công chi tiết thông báo, học đề xuất biến thể của | đề xuất bắt nguồn kho từ </p>'
        : '<p class="diag-lead">cứng bậc cửa nâng cao: trường trung học phổ thông ≥90%, cấp 4 ≥80% vuông có thể đi vào xuống một giai đoạn; xuất sắc biến thể của | sử dụng trong thông báo xếp hạng </p>') +
      '<div class="diag-meta-row">' +
      '<span class="diag-meta-pill">dự báo 20–40 phút</span>' +
      '<span class="diag-meta-pill">tối đa 95 Câu hỏi</span>' +
      '<span class="diag-meta-pill">ngay lập tức gửi thông tin phản hồi</span>' +
      '<span class="diag-meta-pill">sai lầm tỉ lệ &gt; 50% dời lên ngày sớm hơn chấm dứt</span>' +
      "</div>" +
      '<ul class="diag-rules">' +
      "<li><span>giai đoạn một</span><div><strong>trường trung học phổ thông biến thể của |</strong> · 30 Câu hỏi · đi qua biến thể của | <strong>90%</strong>(Ít nhất 27/30)· xuất sắc 95%</div></li>" +
      "<li><span>giai đoạn hai</span><div><strong>Từ vựng CET-4</strong> · 30 Câu hỏi · đi qua biến thể của | <strong>80%</strong>(Ít nhất 24/30)· xuất sắc 90%</div></li>" +
      "<li><span>giai đoạn ba</span><div><strong>IELTS biến thể của |</strong> · 35 Câu hỏi · đi qua xếp hạng <strong>80%</strong>(Ít nhất 28/35)· xuất sắc 90%; hoàn thành hoàng hậu dù thế nào đi nữa liệu có đi qua bằng chấm dứt</div></li>" +
      "<li><span>chủ đề khuôn</span><div>cười âm thanh chọn biến thể cũ của | / chăm sóc Anh lựa chọn / thích chọn Anh / đánh vần lấp chỗ trống công việc(nghiêm ngặt phối hoặc kết hôn, bỏ qua chữ hoa và chữ thường)</div></li>" +
      "<li><span>sản xuất</span><div>đề xuất bắt nguồn kho từ, năng lực thông báo, chẩn đoán lỗi chủ đề gốc</div></li>" +
      "</ul>" +
      resumeHtml +
      '<p class="diag-msg" id="diag-err" hidden></p></div>';

    var err = document.getElementById("diag-err");
    function showErr(msg) {
      if (!err) return;
      err.hidden = !msg;
      err.textContent = msg || "";
    }

    var startBtn = document.getElementById("diag-start");
    if (startBtn) {
      startBtn.addEventListener("click", function () {
        startBtn.disabled = true;
        showErr("");
        api("/api/diagnostic/start", { method: "POST", body: {} })
          .then(function (d) {
            if (d.resume_available) {
              renderIntro(d.session);
              return;
            }
            enterSession(d.session);
          })
          .catch(function (e) {
            startBtn.disabled = false;
            showErr(e.message || " không thể bắt đầu ");
          });
      });
    }
    var resumeBtn = document.getElementById("diag-resume");
    if (resumeBtn) {
      resumeBtn.addEventListener("click", function () {
        enterSession(resumeSession);
      });
    }
    var restartBtn = document.getElementById("diag-restart");
    if (restartBtn) {
      restartBtn.addEventListener("click", function () {
        restartBtn.disabled = true;
        api("/api/diagnostic/start", { method: "POST", body: { force: true } })
          .then(function (d) { enterSession(d.session); })
          .catch(function (e) {
            restartBtn.disabled = false;
            showErr(e.message || " không thể tiếp tục ");
          });
      });
    }
  }

  function enterSession(session) {
    state.session = session;
    state.selected = null;
    state.feedback = null;
    state.report = null;
    state.earlyAborted = false;
    startTimer(session.elapsed_seconds || 0);
    if (session.status === "completed") {
      stopTimer();
      setSessionMode(false);
      renderComplete(session);
      return;
    }
    setSessionMode(true);
    updateExamHud(session);
    if (session.stage_done) {
      renderStageGate();
      return;
    }
    renderQuestion();
  }

  function renderQuestion() {
    var sess = state.session;
    if (!sess || !sess.current_question) {
      if (sess && sess.stage_done) return renderStageGate();
      contentEl.innerHTML = '<div class="diag-brief"><p>chủ đề tải bị đánh bại</p></div>';
      return;
    }
    state.qStart = Date.now();
    state.selected = null;
    state.feedback = null;
    setSessionMode(true);
    updateExamHud(sess);

    var q = sess.current_question;
    var prog = sess.stage_progress || { answered: 0, total: 1 };
    var pct = prog.total ? Math.round((prog.answered / prog.total) * 100) : 0;

    contentEl.innerHTML =
      '<div class="diag-session">' +
      '<div class="diag-session__progress" aria-hidden="true"><i style="width:' + pct + '%"></i></div>' +
      '<div class="diag-session__paper">' +
      questionBodyHTML(q) +
      '<div class="diag-feedback" id="diag-fb"></div>' +
      '<p class="diag-msg" id="diag-err" hidden></p>' +
      "</div>" +
      '<div class="diag-session__dock"><div class="diag-session__dock-inner">' +
      '<button type="button" class="btn btn--primary" id="diag-submit">nộp câu trả lời</button>' +
      '<button type="button" class="btn btn--ghost" id="diag-next" hidden>xuống một chủ đề</button>' +
      "</div></div></div>";

    bindQuestionControls(q);
  }

  function questionBodyHTML(q) {
    var type = q.question_type;
    var html = '<span class="diag-qtype">' + esc(TYPE_LABEL[type] || type) + "</span>";
    if (type === "listening_choice") {
      html +=
        '<div class="diag-listen">' +
        '<button type="button" class="diag-play" id="diag-play" aria-label=" phát sóng cách phát âm ">▶</button>' +
        '<p class="diag-hint">phát sóng âm thanh hoàng hậu, chọn bạn nghe thấy của từ</p></div>';
      html += optionsHTML(q.options || []);
    } else if (type === "english_to_chinese") {
      html += '<p class="diag-prompt">' + esc(q.question_content) + "</p>";
      html += '<p class="diag-hint">chọn biến thể của chính xác của ngôn ngữ Trung Quốc nghĩa của cái gì đó</p>';
      html += optionsHTML(q.options || []);
    } else if (type === "chinese_to_english") {
      html += '<p class="diag-prompt diag-prompt--cn">' + esc(q.question_content) + "</p>";
      html += '<p class="diag-hint">chọn tương ứng với của tiếng Anh từ</p>';
      html += optionsHTML(q.options || []);
    } else {
      html +=
        '<p class="diag-ipa">' +
        esc(q.phonetic || (q.question_content && q.question_content.phonetic) || "") +
        "</p>";
      html +=
        '<div class="diag-example">' +
        esc((q.question_content && q.question_content.example) || q.example_sentence || "______") +
        "</div>";
      html +=
        '<p class="diag-hint">theo ký hiệu phiên âm biến thể của | ngữ cảnh điền vào biểu mẫu tiếng Anh đánh vần(bỏ qua chữ hoa và chữ thường; hình thức của từ khác xem như khác câu trả lời)</p>';
      html +=
        '<input class="diag-input" id="diag-spell" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder=" tại đây nhập khẩu đánh vần ">';
    }
    return html;
  }

  function optionsHTML(opts) {
    return (
      '<div class="diag-options" id="diag-opts" role="listbox">' +
      opts.map(function (o, i) {
        return (
          '<button type="button" class="diag-opt" role="option" data-opt="' +
          esc(o) +
          '" data-i="' +
          i +
          '"><span class="diag-opt__key">' +
          (OPT_KEYS[i] || String(i + 1)) +
          "</span><span>" +
          esc(o) +
          "</span></button>"
        );
      }).join("") +
      "</div>"
    );
  }

  function bindQuestionControls(q) {
    var play = document.getElementById("diag-play");
    if (play) {
      play.addEventListener("click", function () {
        speakWord(String(q.question_content || ""));
      });
      setTimeout(function () {
        speakWord(String(q.question_content || ""));
      }, 200);
    }
    document.querySelectorAll(".diag-opt").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (state.feedback) return;
        state.selected = btn.getAttribute("data-opt");
        document.querySelectorAll(".diag-opt").forEach(function (b) {
          b.classList.toggle("is-selected", b === btn);
        });
      });
    });
    var submit = document.getElementById("diag-submit");
    var next = document.getElementById("diag-next");
    if (submit) submit.addEventListener("click", function () { submitAnswer(q); });
    if (next) {
      next.addEventListener("click", function () {
        state.feedback = null;
        if (state.earlyAborted || (state.session && state.session.status === "completed")) {
          stopTimer();
          setSessionMode(false);
          renderComplete(state.session);
          return;
        }
        if (state.session.stage_done) renderStageGate();
        else renderQuestion();
      });
    }
    var spell = document.getElementById("diag-spell");
    if (spell) {
      spell.addEventListener("keydown", function (e) {
        if (e.key === "Enter") submitAnswer(q);
      });
      spell.focus();
    }
  }

  function submitAnswer(q) {
    if (state.submitting || state.feedback) return;
    var ua = state.selected;
    if (q.question_type === "spelling") {
      var input = document.getElementById("diag-spell");
      ua = input ? input.value : "";
    }
    if (ua == null || String(ua).trim() === "") {
      var err = document.getElementById("diag-err");
      if (err) {
        err.hidden = false;
        err.textContent = " mời trước trả lời ";
      }
      return;
    }
    state.submitting = true;
    var spent = Math.max(1, Math.round((Date.now() - (state.qStart || Date.now())) / 1000));
    var submitBtn = document.getElementById("diag-submit");
    if (submitBtn) submitBtn.disabled = true;

    api("/api/diagnostic/session/" + state.session.session_id + "/answer", {
      method: "POST",
      body: {
        qid: q.qid,
        user_answer: ua,
        time_spent_seconds: spent,
        elapsed_seconds: elapsedNow()
      }
    })
      .then(function (d) {
        state.submitting = false;
        state.session = d.session;
        state.feedback = d.session.last_feedback;
        if (d.early_aborted) {
          state.earlyAborted = true;
          state.report = d.report || null;
        }
        updateExamHud(state.session);
        showFeedback(d.is_correct, d.correct_answer, ua, d.early_aborted);
      })
      .catch(function (e) {
        state.submitting = false;
        if (submitBtn) submitBtn.disabled = false;
        var errEl = document.getElementById("diag-err");
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = e.message || " nộp bị đánh bại ";
        }
      });
  }

  function showFeedback(ok, correct, userAnswer, earlyAborted) {
    var fb = document.getElementById("diag-fb");
    if (fb) {
      fb.className = "diag-feedback is-visible " + (ok ? "is-ok" : "is-bad");
      fb.innerHTML = ok
        ? " Đúng "
        : (" Sai · Đáp án đúng: <strong>" + esc(correct) + "</strong>");
      if (earlyAborted) {
        fb.innerHTML +=
          '<div class="diag-early-abort">sai lầm tỉ lệ đã vượt qua 50%, gốc sân phơi kiểm tra dời lên ngày sớm hơn chấm dứt mời nhấn«xem xét thông báo» </div>';
      }
    }
    var submit = document.getElementById("diag-submit");
    var next = document.getElementById("diag-next");
    if (submit) submit.hidden = true;
    if (next) {
      next.hidden = false;
      next.textContent = earlyAborted ? " xem xét thông báo " : " xuống một chủ đề ";
      next.focus();
    }

    document.querySelectorAll(".diag-opt").forEach(function (btn) {
      btn.disabled = true;
      var v = btn.getAttribute("data-opt");
      if (v === String(correct)) btn.classList.add("is-correct");
      if (v === String(userAnswer) && !ok) btn.classList.add("is-wrong");
    });
    var spell = document.getElementById("diag-spell");
    if (spell) {
      spell.disabled = true;
      spell.style.borderColor = ok ? "var(--diag-ok)" : "var(--diag-bad)";
      spell.style.background = ok ? "var(--diag-ok-bg)" : "var(--diag-bad-bg)";
    }
  }

  function renderStageGate() {
    setSessionMode(true);
    updateExamHud(state.session);
    contentEl.innerHTML =
      '<div class="diag-brief diag-section-break">' +
      '<p class="diag-kicker">Section Review</p>' +
      '<div class="state state--brand"><div class="spinner spinner--brand"></div>đang ở thanh toán gốc giai đoạn...</div></div>';
    api("/api/diagnostic/session/" + state.session.session_id + "/next-stage", {
      method: "POST",
      body: { elapsed_seconds: elapsedNow() }
    })
      .then(function (d) {
        state.session = d.session;
        state.report = d.report || null;
        if (d.next_action === "continue") renderStageTransition(d.stage_result, true);
        else {
          stopTimer();
          renderStageTransition(d.stage_result, false);
        }
      })
      .catch(function (e) {
        contentEl.innerHTML =
          '<div class="diag-brief"><p class="diag-msg">' +
          esc(e.message || " thanh toán bị đánh bại ") +
          '</p><button type="button" class="btn btn--primary" id="diag-retry-stage">thử lại</button></div>';
        document.getElementById("diag-retry-stage").addEventListener("click", renderStageGate);
      });
  }

  function renderStageTransition(result, canContinue) {
    setSessionMode(!canContinue ? false : true);
    if (canContinue) updateExamHud(state.session);
    else if (examCenter) examCenter.hidden = true;

    var rating = result.rating || "weak";
    contentEl.innerHTML =
      '<div class="diag-brief diag-section-break">' +
      '<p class="diag-kicker">Stage Complete</p>' +
      "<h1>" + esc(result.name || "") + "</h1>" +
      '<div class="diag-stat-grid">' +
      '<div class="diag-stat"><div class="diag-stat__val">' +
      Math.round((result.accuracy || 0) * 100) +
      '%</div><div class="diag-stat__lbl">Tỉ lệ đúng</div></div>' +
      '<div class="diag-stat"><div class="diag-stat__val">' +
      Math.round((result.spelling_accuracy || 0) * 100) +
      '%</div><div class="diag-stat__lbl">đánh vần</div></div>' +
      '<div class="diag-stat"><div class="diag-stat__val">' +
      result.correct + "/" + result.total +
      '</div><div class="diag-stat__lbl">trả lời hoặc đáp lại câu hỏi của ai đó</div></div>' +
      "</div>" +
      '<p class="diag-rating diag-rating--' + esc(rating) + '">' +
      esc(RATING_STAR[rating] || rating) +
      (result.is_passed ? " · đạt tiêu chuẩn đặt ra " : " · chưa đạt tới thực tế đề xuất biến thể của | ") +
      (result.early_aborted ? " · dời lên ngày sớm hơn chấm dứt " : "") +
      "</p>" +
      '<p class="diag-lead" style="margin-top:18px">' +
      (canContinue
        ? " gốc giai đoạn đã đi qua thực tế đề xuất biến thể của |, đi vào xuống một giai đoạn "
        : " gốc sân phơi kiểm tra đã chấm dứt, có thể xem xét hoàn chỉnh năng lực thông báo ") +
      "</p>" +
      '<div class="diag-actions" id="diag-stage-actions"></div></div>';

    var actions = document.getElementById("diag-stage-actions");
    if (canContinue) {
      actions.innerHTML =
        '<button type="button" class="btn btn--primary" id="diag-continue">đi vào xuống một giai đoạn</button>';
      document.getElementById("diag-continue").addEventListener("click", function () {
        renderQuestion();
      });
    } else {
      actions.innerHTML =
        '<button type="button" class="btn btn--primary" id="diag-to-complete">xem xét kết trái</button>';
      document.getElementById("diag-to-complete").addEventListener("click", function () {
        renderComplete(state.session);
      });
    }
  }

  function renderComplete(session) {
    setSessionMode(false);
    var sid = session.session_id;
    var loadReport = state.report
      ? Promise.resolve(state.report)
      : api("/api/diagnostic/session/" + sid + "/report").then(function (d) {
          return d.report;
        });

    contentEl.innerHTML =
      '<div class="diag-brief"><div class="state state--brand"><div class="spinner spinner--brand"></div>tạo ra phiếu điểm hoặc bảng điểm...</div></div>';

    loadReport
      .then(function (report) {
        state.report = report;
        var stages = (report && report.stages) || [];
        var answeredStages = stages.filter(Boolean);
        var totalQ = 0;
        var totalC = 0;
        answeredStages.forEach(function (s) {
          totalQ += s.total || 0;
          totalC += s.correct || 0;
        });
        var acc = totalQ ? Math.round((totalC / totalQ) * 100) : 0;
        contentEl.innerHTML =
          '<div class="diag-brief">' +
          '<p class="diag-kicker">Result Summary</p>' +
          "<h1>kiểm tra hoàn thành</h1>" +
          (report && report.early_aborted
            ? '<p class="diag-lead">biến thể cũ của sai lầm tỉ lệ vượt qua 50%, gốc sân phơi kiểm tra đã dời lên ngày sớm hơn chấm dứt </p>'
            : '<p class="diag-lead">đã hoàn thành gốc sân phơi biến thể của | năng lực chẩn đoán </p>') +
          '<div class="diag-stat-grid">' +
          '<div class="diag-stat"><div class="diag-stat__val">' + totalQ +
          '</div><div class="diag-stat__lbl">tổng thể chủ đề đếm</div></div>' +
          '<div class="diag-stat"><div class="diag-stat__val">' + acc +
          '%</div><div class="diag-stat__lbl">tổng thể đúng tỉ lệ</div></div>' +
          '<div class="diag-stat"><div class="diag-stat__val">' +
          formatTime((report && report.total_time_seconds) || state.elapsedBase) +
          '</div><div class="diag-stat__lbl">Thời lượng</div></div>' +
          "</div>" +
          '<p class="diag-lead">đề xuất bắt nguồn kho từ: <strong>' +
          esc(LEVEL_NAME[report.recommended_start_level] || report.recommended_start_level) +
          "</strong></p>" +
          '<div class="diag-actions">' +
          (state.gate
            ? '<a class="btn btn--primary" href="diagnostic-report.html?session=' +
              sid +
              '&placement=1">xem xét chi tiết thông báo biến thể của | học đề xuất</a>'
            : '<a class="btn btn--primary" href="diagnostic-report.html?session=' +
              sid +
              '">xem xét chi tiết năng lực thông báo</a>' +
              '<a class="btn btn--ghost" href="diagnostic-mistakes.html">đi vào lỗi chủ đề gốc</a>' +
              '<a class="btn btn--ghost" href="zone.html?zone=study&s=vocab">trở về từ khu vực</a>') +
          "</div></div>";
        if (state.gate) {
          setTimeout(function () {
            location.replace(
              "diagnostic-report.html?session=" + sid + "&placement=1"
            );
          }, 600);
        }
      })
      .catch(function (e) {
        contentEl.innerHTML =
          '<div class="diag-brief"><p class="diag-msg">' + esc(e.message) + "</p></div>";
      });
  }

  window.YYSD_DIAG = {
    TYPE_LABEL: TYPE_LABEL,
    RATING_STAR: RATING_STAR,
    LEVEL_NAME: LEVEL_NAME,
    esc: esc
  };

  if (!requireLogin()) return;
  api("/api/diagnostic/status")
    .then(function (d) {
      if (d && d.resume_available) renderIntro(d.session);
      else renderIntro(null);
    })
    .catch(function () {
      renderIntro(null);
    });
})();
