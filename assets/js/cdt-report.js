/* =========================================================================
   cdt-report.js — suite L/R/W report + AI writing grade + copy-to-teacher
   ========================================================================= */
(function () {
  "use strict";

  var Y = window.YYSD;
  var qs = new URLSearchParams(location.search);
  var suite = (qs.get("suite") || "").trim();

  function $(id) { return document.getElementById(id); }

  function esc(s) {
    return String(s == null? "": s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function suiteIds(base) {
    return {
      listening: base,
      reading: base + "-reading",
      writing: base + "-writing"
    };
  }

  function wordCount(s) {
    return (s || "").trim().split(/\s+/).filter(Boolean).length;
  }

  function skillCard(label, rec, kind) {
    if (!rec) {
      return '<article class="cdt-report__card is-empty"><h3>' + esc(label) + "</h3>" +
        '<div class="big"> Chưa hoàn thành </div>' +
        '<div class="meta">Finish section Nộp bài sau sẽ xuất hiện ở chỗ này </div></article>';
    }
    var big = "";
    var meta = "";
    if (kind === "writing") {
      var n1 = wordCount(rec.writingTask1);
      var n2 = wordCount(rec.writingTask2);
      big = (rec.writingWords!= null? rec.writingWords: n1 + n2) + " từ ";
      meta = "Task 1: " + n1 + " từ (đề nghị ≥150) · Task 2: " + n2 + " từ (đề nghị ≥250) ";
    } else {
      big = (rec.score!= null? rec.score: "—") +
        (rec.total!= null? " / " + rec.total: "");
      meta = rec.band!= null? "Band " + rec.band: " đã Nộp bài ";
      if (rec.date) meta += " · " + new Date(rec.date).toLocaleString("zh-CN");
    }
    return '<article class="cdt-report__card"><h3>' + esc(label) + "</h3>" +
      '<div class="big">' + esc(String(big)) + "</div>" +
      '<div class="meta">' + esc(meta) + "</div></article>";
  }

  function looksLikeJsonLeak(s) {
    s = String(s || "").trim();
    return!s? false: (s.indexOf("WRITING_JSON") >= 0 || s.charAt(0) === "{" || s.charAt(0) === "[");
  }

  function renderGradeHtml(d) {
    var g = d && d.grade;
    var html = "";
    if (g &&!looksLikeJsonLeak(g.overall)) {
      html += '<div><h4> Viết cho điểm · Overall ' + esc(g.overall) +
        ' <span style="font-weight:500;font-size:12px;color:#64748b"> (AI cổ phân · không nghi thức điểm thi) </span></h4><dl>' +
        "<dt>Task</dt><dd>" + esc(g.task) + "</dd>" +
        "<dt>Coherence</dt><dd>" + esc(g.coherence) + "</dd>" +
        "<dt>Lexical</dt><dd>" + esc(g.lexical) + "</dd>" +
        "<dt>Grammar</dt><dd>" + esc(g.grammar) + "</dd></dl>" +
        (g.comment &&!looksLikeJsonLeak(g.comment)? "<p>" + esc(g.comment) + "</p>": "") +
        "</div>";
      if (g.modelEssay &&!looksLikeJsonLeak(g.modelEssay)) {
        html += "<h4> cùng câu cao phân bài văn mẫu </h4><pre class=\"model\">" + esc(g.modelEssay) + "</pre>";
      }
      if (g.corrections && g.corrections.length) {
        html += "<h4> Gợi ý sửa lỗi từ vựng & ngữ pháp </h4><ul>" + g.corrections.filter(function (c) {
          return c &&!looksLikeJsonLeak(c.bad) &&!looksLikeJsonLeak(c.good);
        }).map(function (c) {
          return "<li><s>" + esc(c.bad) + "</s> → <b>" + esc(c.good) + "</b>" +
            (c.why? " (" + esc(c.why) + ") ": "") + "</li>";
        }).join("") + "</ul>";
      }
      if (g.nextSteps && g.nextSteps.length) {
        html += "<h4> xách điểm đề nghị </h4><ul>" + g.nextSteps.filter(function (n) {
          return!looksLikeJsonLeak(n);
        }).map(function (n) { return "<li>" + esc(n) + "</li>"; }).join("") + "</ul>";
      }
    }
    var fb = d && d.feedback? String(d.feedback).trim(): "";
    if (fb &&!looksLikeJsonLeak(fb)) html += "<p>" + esc(fb) + "</p>";
    return html || "<p> Không nhận được kết quả chấm điểm có cấu trúc, vui lòng nhấn nút Thử lại </p>";
  }

  function setHint(msg, isError) {
    var el = $("rpt-hint");
    if (!el) return;
    el.textContent = msg || "";
    el.className = "cdt-report__hint" + (isError? " is-error": "");
  }

  function copyTeacherText(wRec, title) {
    var t1 = (wRec && wRec.writingTask1) || "";
    var t2 = (wRec && wRec.writingTask2) || "";
    return "[" + (title || " IELTS Writing ") + "]\n\n--- Task 1 ---\n" + t1 +
      "\n\n--- Task 2 ---\n" + t2;
  }

  function gradeTask(taskType, wRec) {
    var essay = taskType === "task1"? (wRec.writingTask1 || ""): (wRec.writingTask2 || "");
    essay = essay.trim();
    if (essay.length < 80) {
      setHint(taskType === "task1"? "Task 1 viết văn qua ngắn hoặc Chưa trả lời ": "Task 2 viết văn qua ngắn hoặc Chưa trả lời ", true);
      return;
    }
    var prompt = taskType === "task1"? wRec.writingPrompt1: wRec.writingPrompt2;
    if (!prompt) {
      setHint(" thiếu khuyết Câu hỏi (mời từ bản bộ Viết một lần nữa Finish một lần để bảo tồn Câu hỏi) ", true);
      return;
    }
    if (!window.YYSD_AUTH ||!YYSD_AUTH.getToken ||!YYSD_AUTH.getToken()) {
      setHint(" Vui lòng đăng nhập trước khi sử dụng tính năng AI chấm bài ", true);
      return;
    }
    if (YYSD_AUTH.isTeacher && YYSD_AUTH.isTeacher()) {
      setHint(" Tài khoản Giáo viên vui lòng chuyển sang giao diện học sinh để trải nghiệm AI chấm bài ", true);
      return;
    }
    var btn1 = $("rpt-ai-t1");
    var btn2 = $("rpt-ai-t2");
    if (btn1) btn1.disabled = true;
    if (btn2) btn2.disabled = true;
    setHint(" Đang chấm bài …");
    YYSD_AUTH.api("/api/ai-tutor/writing-grade", {
      method: "POST",
      body: {
        taskType: taskType,
        prompt: prompt,
        chartNote: taskType === "task1"? (wRec.writingChartNote || ""): "",
        essay: essay
      }
    }).then(function (res) {
      var box = $(taskType === "task1"? "rpt-grade-t1": "rpt-grade-t2");
      if (box) {
        box.hidden = false;
        box.innerHTML = "<h3>" + (taskType === "task1"? "Task 1": "Task 2") +
          " Kết quả chấm bài </h3>" + renderGradeHtml(res);
      }
      var qHint = "";
      if (res.quota && res.quota.textLeft!= null) {
        qHint = " hôm nay văn tự khoản độ còn thừa " + res.quota.textLeft + "/" + res.quota.textLimit;
        if (res.quota.textLeft <= 0) qHint += " (Đã dùng hết, hẹn gặp lại ngày mai) ";
      }
      setHint(qHint || " Chấm bài hoàn thành ");
    }).catch(function (err) {
      var msg = (err && err.message) || " Chấm bài thất bại ";
      setHint(msg, true);
    }).then(function () {
      if (btn1) btn1.disabled = false;
      if (btn2) btn2.disabled = false;
    });
  }

  function render() {
    if (!suite) {
      $("rpt-skills").innerHTML =
        '<article class="cdt-report__card is-empty"><h3> báo cáo </h3>' +
        '<div class="big"> Thiếu tham số bộ đề thi </div>' +
        '<div class="meta"> mời từ Thi thử Finish section Vào học </div></article>';
      return;
    }

    var ids = suiteIds(suite);
    var store = Y.results();
    var L = store[ids.listening];
    var R = store[ids.reading];
    var W = store[ids.writing];

    var titleRec = L || R || W;
    var title = (titleRec && titleRec.title) || suite;
    // normalize to suite label
    var m = String(title).match(/Cambridge(?:\s*IELTS)?\s*0*(\d+)/i);
    var t = String(title).match(/Test\s*0*(\d+)/i);
    var suiteLabel = (m && t)
      ? (" Đề thi Cambridge IELTS " + m[1] + " - Test " + t[1])
      : title.replace(/\s*\((?:Nghe|Đọc|Viết|Listening|Reading|Writing)\)\s*/gi, "").trim();

    $("rpt-title").textContent = suiteLabel + " · Thi thử báo cáo ";
    document.title = suiteLabel + " · Thi thử báo cáo · YYSD ";

    var vol = m? m[1]: "";
    var back = $("rpt-back");
    if (back) back.href = vol? ("cambridge.html?vol=" + encodeURIComponent(vol)): "zone.html?zone=mock&s=mock";
    var retry = $("rpt-retry");
    if (retry) {
      var retryHref = "exam.html?id=" + encodeURIComponent(ids.listening) + "&cdt=1&pack=exam&suite=1";
      try {
        var ev = new URLSearchParams(location.search).get("event");
        if (ev && /^\d+$/.test(String(ev))) retryHref += "&event=" + encodeURIComponent(ev);
      } catch (e) { /* ignore */ }
      retry.href = retryHref;
    }

    $("rpt-skills").innerHTML =
      skillCard("Listening", L, "listening") +
      skillCard("Reading", R, "reading") +
      skillCard("Writing", W, "writing");

    var wrongActs = $("rpt-wrong-acts");
    if (wrongActs) {
      var hasWrong = (L && L.wrong && L.wrong.length) || (R && R.wrong && R.wrong.length);
      if (hasWrong) {
        wrongActs.hidden = false;
        var href = "wrong-record.html?items=" + encodeURIComponent([ids.listening, ids.reading].join(",")) + "&local=1";
        wrongActs.innerHTML =
          '<a class="btn btn--ghost btn--sm" href="' + href + '"> Xem bản bộ nghe đọc câu sai </a>' +
          ' <a class="btn btn--ghost btn--sm" href="results.html#tab=wrongs"> sai lời tựa lục </a>';
      } else {
        wrongActs.hidden = true;
        wrongActs.innerHTML = "";
      }
    }

    var writingSec = $("rpt-writing");
    if (!W) {
      writingSec.hidden = true;
      return;
    }
    writingSec.hidden = false;
    $("rpt-essay-t1").textContent = W.writingTask1 || " (Chưa trả lời) ";
    $("rpt-essay-t2").textContent = W.writingTask2 || " (Chưa trả lời) ";

    $("rpt-ai-t1").onclick = function () { gradeTask("task1", W); };
    $("rpt-ai-t2").onclick = function () { gradeTask("task2", W); };
    $("rpt-copy").onclick = function () {
      var txt = copyTeacherText(W, suiteLabel + "Viết");
      function done() { setHint(" đã phục chế toàn văn, có thể dán chia Giáo viên "); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(done, function () {
          fallbackCopy(txt); done();
        });
      } else {
        fallbackCopy(txt); done();
      }
    };
  }

  function fallbackCopy(txt) {
    var ta = document.createElement("textarea");
    ta.value = txt;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
