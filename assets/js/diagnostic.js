/* =========================================================================
   diagnostic.js — Assessment Console (vocab placement session)
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
    listening_choice: "cười cổ đại âm thanh chọn biến thể cũ của",
    english_to_chinese: "chăm sóc Anh nướclựa chọn",
    chinese_to_english: "thíchchọn Anh nước",
    spelling: "đánh vầnĐiền khuyết"
  };
  var RATING_STAR = {
    excellent: "xuất sắc",
    good: "tốt",
    weak: "yêu cầucủng cố"
  };
  var LEVEL_NAME = {
    high_school: "trường trung học phổ thôngTừ vựng",
    cet4: "cấp 4Từ vựng",
    ielts: "IELTS Hệ thống Kiểm tra Tiếng Anh Quốc tếTừ vựng"
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
    if (!A || !A.api) return Promise.reject(new Error("mời trướcĐăng nhập"));
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
      '<span class="diag-hud-chip"><em>Giai đoạn</em><b>' + esc(sess.stage_name || "—") + "</b></span>" +
      '<span class="diag-hud-chip"><em>họ gầm</em><b>' + qNo + " / " + (prog.total || 0) + "</b></span>" +
      '<span class="diag-hud-chip"><em>sử dụng biến thể cũ của</em><b id="diag-hud-timer">' + esc(formatTime(elapsedNow())) + "</b></span>" +
      '<span class="diag-hud-chip"><em>Lỗitỉ lệ</em><b>' + (answered ? errPct + "%" : "—") + "</b></span>";
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
        "<h1>mời trướcĐăng nhập</h1>" +
        '<p class="diag-lead">sử dụngHọc viênTài khoảnĐăng nhậphọBắt đầuTừ vựngNăng lựcchẩn đoán.</p>' +
        '<div class="diag-actions"><a class="btn btn--primary" href="login.html?next=' +
        encodeURIComponent(next) +
        '">điĐăng nhập</a></div></div>';
      return false;
    }
    if (A.isTeacher && A.isTeacher()) {
      contentEl.innerHTML =
        '<div class="diag-brief">' +
        '<p class="diag-kicker">Teacher</p>' +
        "<h1>mờisử dụngHọc viênTài khoản</h1>" +
        '<p class="diag-lead">Giáo viêntiền tố có thể tồn tại học hình thức kết hợp tình cảmbiển quảng cáoXemlớp học nhóm học sinhchẩn đoáncái nhìn tổng quan.</p>' +
        '<div class="diag-actions"><a class="btn btn--ghost" href="teacher.html">mởCổng giáo viên</a></div></div>';
      return false;
    }
    return true;
  }

  function applyGateChrome() {
    if (!state.gate) return;
    document.title = "đầu tiênTừ vựngNăng lựcBài kiểm tra · YYSD · Trung tâm Khóa học Quốc tế";
    if (exitLink) {
      exitLink.textContent = "Hoàn thànhkém phát triểnđi vàoKhu vực Từ vựng";
      exitLink.removeAttribute("href");
      exitLink.style.opacity = "0.65";
      exitLink.style.pointerEvents = "none";
    }
  }

  function renderIntro(resumeSession) {
    setSessionMode(false);
    applyGateChrome();
    var title = state.gate ? "đầu tiênTừ vựngNăng lựcBài kiểm tra" : "Từ vựngNăng lựcchẩn đoán";
    var resumeHtml = "";
    if (resumeSession) {
      resumeHtml =
        '<p class="diag-lead">phát hiệnđếnChưa hoàn thànhsố lần chiếu của một bộ phim(' +
        esc(resumeSession.stage_name || "") + " · đã hình thức gắn liền có nghĩa giống như từ tự do " +
        ((resumeSession.stage_progress && resumeSession.stage_progress.answered) || 0) +
        " họ).</p>" +
        '<div class="diag-actions">' +
        '<button type="button" class="btn btn--primary" id="diag-resume">Tiếp tụcBài kiểm tra</button>' +
        '<button type="button" class="btn btn--ghost" id="diag-restart">tiếp tục</button>' +
        "</div>";
    } else {
      resumeHtml =
        '<div class="diag-actions">' +
        '<button type="button" class="btn btn--primary" id="diag-start">' +
        (state.gate ? "Bắt đầuBài kiểm tra" : "Bắt đầuchẩn đoán") +
        "</button>" +
        (state.gate
          ? ""
          : '<a class="btn btn--ghost" href="diagnostic-mistakes.html">chẩn đoánSổ lỗi sai</a>') +
        "</div>";
    }

    contentEl.innerHTML =
      '<div class="diag-brief">' +
      '<p class="diag-kicker">' + (state.gate ? "Mandatory Placement" : "Assessment Briefing") + "</p>" +
      "<h1>" + esc(title) + "</h1>" +
      (state.gate
        ? '<p class="diag-lead diag-lead--gate"><strong>đầu tiênđi vàoKhu vực Từ vựngtrước phảiHoàn thànhđầu tiênNăng lựcBài kiểm tra.</strong>Kết thúcthế hệ trẻhọchi tiếtBáo cáo,họcGợi ýđề xuấtbắt nguồnkho từ.</p>'
        : '<p class="diag-lead">cứngbậc cửanâng cao:trường trung học phổ thông ≥90%,cấp 4 ≥80% họ tiền tố có thểđi vàoxuống mộtGiai đoạn;xuất sắcbiến thể củasử dụng trongBáo cáoxếp hạng.</p>') +
      '<div class="diag-meta-row">' +
      '<span class="diag-meta-pill">dự báo 20–40 phút</span>' +
      '<span class="diag-meta-pill">tối đa 95 câu</span>' +
      '<span class="diag-meta-pill">ngay lập tứcPhản hồi</span>' +
      '<span class="diag-meta-pill">Lỗitỉ lệ &gt; 50% dời lên ngày sớm hơnKết thúc</span>' +
      "</div>" +
      '<ul class="diag-rules">' +
      "<li><span>Giai đoạnmột</span><div><strong>trường trung học phổ thôngTừ vựng</strong> · 30 câu · đi quabiến thể của <strong>90%</strong>(ít nhất 27/30)· xuất sắc 95%</div></li>" +
      "<li><span>Giai đoạn</span><div><strong>cấp 4Từ vựng</strong> · 30 câu · đi quabiến thể của <strong>80%</strong>(ít nhất 24/30)· xuất sắc 90%</div></li>" +
      "<li><span>Giai đoạnhọ</span><div><strong>IELTS Hệ thống Kiểm tra Tiếng Anh Quốc tếTừ vựng</strong> · 35 câu · đi quaxếp hạng <strong>80%</strong>(ít nhất 28/35)· xuất sắc 90%;Hoàn thànhhọdù thế nào đi nữaliệu có hay khôngđi quabằngKết thúc</div></li>" +
      "<li><span>họ khuôn</span><div>cười cổ đại âm thanh chọn biến thể cũ của / chăm sóc Anh nướclựa chọn / thíchchọn Anh nước / đánh vầnĐiền khuyết(nghiêm ngặtGhép nối,bỏ quachữ hoa và chữ thường)</div></li>" +
      "<li><span>sản xuất sinh viên tốt nghiệp</span><div>đề xuấtbắt nguồnkho từ,Năng lựcBáo cáo,chẩn đoánSổ lỗi sai</div></li>" +
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
            showErr(e.message || "không thểBắt đầu");
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
            showErr(e.message || "không thểtiếp tục");
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
      contentEl.innerHTML = '<div class="diag-brief"><p>Đề bàiTải thất bại</p></div>';
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
      '<button type="button" class="btn btn--primary" id="diag-submit">Nộp bàiĐáp án</button>' +
      '<button type="button" class="btn btn--ghost" id="diag-next" hidden>Câu sau</button>' +
      "</div></div></div>";

    bindQuestionControls(q);
  }

  function questionBodyHTML(q) {
    var type = q.question_type;
    var html = '<span class="diag-qtype">' + esc(TYPE_LABEL[type] || type) + "</span>";
    if (type === "listening_choice") {
      html +=
        '<div class="diag-listen">' +
        '<button type="button" class="diag-play" id="diag-play" aria-label="Phátcách phát âm">▶</button>' +
        '<p class="diag-hint">PhátAudiohọ,Chọnbạnnghe thấyTừ vựng</p></div>';
      html += optionsHTML(q.options || []);
    } else if (type === "english_to_chinese") {
      html += '<p class="diag-prompt">' + esc(q.question_content) + "</p>";
      html += '<p class="diag-hint">Chọnbiến thể củachính xácTiếng TrungNghĩa</p>';
      html += optionsHTML(q.options || []);
    } else if (type === "chinese_to_english") {
      html += '<p class="diag-prompt diag-prompt--cn">' + esc(q.question_content) + "</p>";
      html += '<p class="diag-hint">Chọntương ứng vớiTiếng AnhTừ vựng</p>';
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
        '<p class="diag-hint">rễ biến thể củaký hiệu phiên âmngữ cảnhđiền vào biểu mẫuTiếng Anhđánh vần(bỏ quachữ hoa và chữ thường;hình thức của từ ví dụ: biến tốkhácxem nhưkhácĐáp án)</p>';
      html +=
        '<input class="diag-input" id="diag-spell" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="tại đâynhập khẩuđánh vần">';
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
        err.textContent = "mời trướctrả lời";
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
          errEl.textContent = e.message || "Nộp bàiThất bại";
        }
      });
  }

  function showFeedback(ok, correct, userAnswer, earlyAborted) {
    var fb = document.getElementById("diag-fb");
    if (fb) {
      fb.className = "diag-feedback is-visible " + (ok ? "is-ok" : "is-bad");
      fb.innerHTML = ok
        ? "Đúng"
        : ("Lỗi · Đáp án đúng: <strong>" + esc(correct) + "</strong>");
      if (earlyAborted) {
        fb.innerHTML +=
          '<div class="diag-early-abort">Lỗitỉ lệ đãvượt qua 50%,hình thức kết hợp gốc sân phơiBài kiểm tradời lên ngày sớm hơnKết thúc.mờinhấn«XemBáo cáo».</div>';
      }
    }
    var submit = document.getElementById("diag-submit");
    var next = document.getElementById("diag-next");
    if (submit) submit.hidden = true;
    if (next) {
      next.hidden = false;
      next.textContent = earlyAborted ? "XemBáo cáo" : "Câu sau";
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
      '<div class="state state--brand"><div class="spinner spinner--brand"></div>đang ở thời điểm đóthanh toánhình thức kết hợp gốcGiai đoạn…</div></div>';
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
          esc(e.message || "thanh toánThất bại") +
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
      '</div><div class="diag-stat__lbl">thường dùng ở dạng phủ định trả lời hoặc đáp lại câu hỏi của ai đó</div></div>' +
      "</div>" +
      '<p class="diag-rating diag-rating--' + esc(rating) + '">' +
      esc(RATING_STAR[rating] || rating) +
      (result.is_passed ? " · đạt tiêu chuẩn đặt ra" : " · chưa họthực tếđề xuấtbiến thể của") +
      (result.early_aborted ? " · dời lên ngày sớm hơnKết thúc" : "") +
      "</p>" +
      '<p class="diag-lead" style="margin-top:18px">' +
      (canContinue
        ? "hình thức kết hợp gốcGiai đoạnđãđi quathực tếđề xuấtbiến thể của,đi vàoxuống mộtGiai đoạn."
        : "hình thức kết hợp gốc sân phơiBài kiểm trađãKết thúc,tiền tố có thểXemhoàn chỉnhNăng lựcBáo cáo.") +
      "</p>" +
      '<div class="diag-actions" id="diag-stage-actions"></div></div>';

    var actions = document.getElementById("diag-stage-actions");
    if (canContinue) {
      actions.innerHTML =
        '<button type="button" class="btn btn--primary" id="diag-continue">đi vàoxuống mộtGiai đoạn</button>';
      document.getElementById("diag-continue").addEventListener("click", function () {
        renderQuestion();
      });
    } else {
      actions.innerHTML =
        '<button type="button" class="btn btn--primary" id="diag-to-complete">XemKết quả</button>';
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
      '<div class="diag-brief"><div class="state state--brand"><div class="spinner spinner--brand"></div>tạo raphiếu điểm hoặc bảng điểm…</div></div>';

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
          "<h1>Bài kiểm traHoàn thành</h1>" +
          (report && report.early_aborted
            ? '<p class="diag-lead">biến thể cũ củaLỗitỉ lệvượt qua 50%,hình thức kết hợp gốc sân phơiBài kiểm trađãdời lên ngày sớm hơnKết thúc.</p>'
            : '<p class="diag-lead">Đã hoàn thànhhình thức kết hợp gốc sân phơiTừ vựngNăng lựcchẩn đoán.</p>') +
          '<div class="diag-stat-grid">' +
          '<div class="diag-stat"><div class="diag-stat__val">' + totalQ +
          '</div><div class="diag-stat__lbl">tổng thể họ đếm</div></div>' +
          '<div class="diag-stat"><div class="diag-stat__val">' + acc +
          '%</div><div class="diag-stat__lbl">tổng thểTỉ lệ đúng</div></div>' +
          '<div class="diag-stat"><div class="diag-stat__val">' +
          formatTime((report && report.total_time_seconds) || state.elapsedBase) +
          '</div><div class="diag-stat__lbl">sử dụng biến thể cũ của</div></div>' +
          "</div>" +
          '<p class="diag-lead">đề xuấtbắt nguồnkho từ:<strong>' +
          esc(LEVEL_NAME[report.recommended_start_level] || report.recommended_start_level) +
          "</strong></p>" +
          '<div class="diag-actions">' +
          (state.gate
            ? '<a class="btn btn--primary" href="diagnostic-report.html?session=' +
              sid +
              '&placement=1">Xemchi tiếtBáo cáohọcGợi ý</a>'
            : '<a class="btn btn--primary" href="diagnostic-report.html?session=' +
              sid +
              '">Xemchi tiếtNăng lựcBáo cáo</a>' +
              '<a class="btn btn--ghost" href="diagnostic-mistakes.html">đi vàoSổ lỗi sai</a>' +
              '<a class="btn btn--ghost" href="zone.html?zone=study&s=vocab">Quay lạiKhu vực Từ vựng</a>') +
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
