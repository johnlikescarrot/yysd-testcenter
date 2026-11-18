/* vocab-learn.js — Giao diện học từ vựng (thẻ + danh sách); đồng bộ tiến độ tủ sách */

function yysdMeaningForList(raw, accept) {
  if (accept && accept.length) return accept.join("; ");
  var s = String(raw == null ? "" : raw).trim();
  if (!s) return "";
  s = s.replace(/\s*(?:Trái nghĩa|Đồng nghĩa|Bất quy tắc|Nguồn gốc từ|Dễ nhầm)\s*[:][\s\S]*$/i, "");
  s = s.replace(/\s{2,}/g, " ").trim();
  if (s.length > 120) {
    var cut = s.split(/[;.]/)[0].trim();
    if (cut.length >= 4) s = cut;
  }
  return s;
}

(function () {
  "use strict";
  var A = window.YYSD_AUTH;
  var params = new URLSearchParams(location.search);
  var bookId = (params.get("book") || "").trim();
  var listId = (params.get("list") || "").trim();
  var assignEventId = Number(params.get("event") || 0) || 0;
  var app = document.getElementById("vl-app");
  var backEl = document.getElementById("vl-back");

  var meta = { title: "", stageLabel: "" };
  var words = [];
  var state = {
    learnView: "card",
    learnIdx: 0,
    blurAllOff: false, // card view only
    blurOne: true, // card view: meaning blur per word
    blurWordList: false,
    blurMeaningList: true,
    saving: false
  };

  function esc(s) {
    return String(s == null? "": s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function speak(word, accent) {
    var WA = window.YysdWordAudio;
    if (WA && WA.speak) {
      WA.speak(word, accent || WA.UK);
      return;
    }
    if (!window.speechSynthesis ||!word) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(word);
    u.lang = accent === 2? "en-US": "en-GB";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }

  function accentOf(w) {
    var usW = String((w && (w.wordUs || w.word)) || "").trim();
    var ukW = String((w && (w.wordUk || w.word)) || "").trim();
    var usI = String((w && w.ipaUs) || "").trim();
    var ukI = String((w && w.ipaUk) || "").trim();
    if (!usI &&!ukI && w && w.ipa) {
      var parts = String(w.ipa).split(/\s*·\s*/).map(function (p) { return p.trim(); }).filter(Boolean);
      ukI = parts[0] || "";
      usI = parts[1] || parts[0] || "";
    }
    return {
      usW: usW,
      ukW: ukW || usW,
      usI: usI,
      ukI: ukI || usI,
      dual: (usI && ukI && usI!== ukI) || (usW && ukW && usW!== ukW)
    };
  }

  function saveProgress(done) {
    if (!A ||!A.api ||!bookId ||!listId) return Promise.resolve();
    var wordIdx = state.learnIdx;
    // shelf progress may mark done at last card; assignment only on explicit finish
    var isDone =!!done;
    var body = { bookId: bookId, listId: listId, wordIdx: wordIdx, done: isDone };
    if (done && assignEventId) body.assignmentEventId = assignEventId;
    return A.api("/api/vocab-shelf/progress", {
      method: "POST",
      body: body
    });
  }

  function learnViewToggleHtml() {
    return '<div class="vl-view-tabs" id="learnViewTabs">' +
      '<button type="button" class="vl-view-tab' + (state.learnView === "card"? " active": "") +
        '" data-v="card"> tạp phiến </button>' +
      '<button type="button" class="vl-view-tab' + (state.learnView === "list"? " active": "") +
        '" data-v="list"> liệt biểu List </button>' +
      "</div>";
  }

  function bindLearnChrome() {
    var tabs = document.getElementById("learnViewTabs");
    if (tabs) {
      tabs.onclick = function (e) {
        var b = e.target.closest(".vl-view-tab");
        if (!b) return;
        state.learnView = b.getAttribute("data-v");
        renderLearn();
      };
    }
    var blurBtn = document.getElementById("btnBlurAll");
    if (blurBtn) {
      blurBtn.onclick = function () {
        state.blurAllOff =!state.blurAllOff;
        state.blurOne = true;
        renderLearn();
      };
    }
    var blurWordBtn = document.getElementById("btnBlurWord");
    if (blurWordBtn) {
      blurWordBtn.onclick = function () {
        state.blurWordList =!state.blurWordList;
        renderLearn();
      };
    }
    var blurMeaningBtn = document.getElementById("btnBlurMeaning");
    if (blurMeaningBtn) {
      blurMeaningBtn.onclick = function () {
        state.blurMeaningList =!state.blurMeaningList;
        renderLearn();
      };
    }
  }

  function quizHrefForList() {
    return "vocab-quiz.html?book=" + encodeURIComponent(bookId) +
      "&lists=" + encodeURIComponent(listId);
  }

  function askStartListQuiz() {
    var existing = document.getElementById("vl-quiz-overlay");
    if (existing) existing.remove();
    var ov = document.createElement("div");
    ov.id = "vl-quiz-overlay";
    ov.className = "vl-overlay show";
    ov.innerHTML =
      '<div class="vl-result-box" role="dialog" aria-modal="true">' +
        "<h2> Từ vựng Đánh giá </h2>" +
        '<div style="color:#4d625b;font-size:14px;margin-top:6px"> Đồng ý Bắt đầu bản List đơn độc từ Đánh giá không? </div>' +
        '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:16px">' +
          '<button type="button" class="vl-btn" id="vl-quiz-cancel"> Đăng xuất </button>' +
          '<button type="button" class="vl-btn vl-btn-primary" id="vl-quiz-ok"> Đồng ý </button>' +
        "</div></div>";
    document.body.appendChild(ov);
    document.getElementById("vl-quiz-cancel").onclick = function () { ov.remove(); };
    document.getElementById("vl-quiz-ok").onclick = function () {
      location.href = quizHrefForList();
    };
  }

  function bindQuizEntry() {
    var btn = document.getElementById("btnQuizList");
    if (btn) btn.onclick = askStartListQuiz;
  }

  function shell(inner) {
    app.innerHTML =
      '<div class="vl-top-bar">' +
        '<div class="vl-brand"> YYSD · <span> từ kho Học tập </span></div>' +
        '<div class="vl-list-badge">' + esc(meta.stageLabel || "") + "</div>" +
      "</div>" +
      '<div class="vl-info-row"><div id="counter"></div></div>' +
      '<div id="panel">' + inner + "</div>";
  }

  function renderLearnList() {
    var blurWord = state.blurWordList;
    var blurMeaning = state.blurMeaningList;
    shell("");
    document.getElementById("counter").innerHTML =
      esc(meta.title || "") + " · liệt biểu List quan sát <strong>" + words.length + "</strong> từ · điểm kích[ấn vào] một nhóm tiến vào tạp phiến ";
    var rows = words.map(function (w, i) {
      var acc = accentOf(w);
      var ipaHtml = acc.dual
        ? '<div class="w-ipa"> Mỹ ' + esc(acc.usW!== w.word? acc.usW + " ": "") + esc(acc.usI) +
          "</div><div class=\"w-ipa\"> Anh " + esc(acc.ukW!== acc.usW? acc.ukW + " ": "") + esc(acc.ukI) + "</div>"
        : '<span class="w-ipa">' + esc(acc.usI || w.ipa || "") + "</span>";
      return '<tr class="word-row" data-i="' + i + '">' +
        '<td class="w-no">' + (i + 1) + "</td>" +
        '<td><div class="w-en' + (blurWord? " blurred": "") + '" title="' +
          (blurWord? " điểm kích[ấn vào] tạm thời biểu hiện Từ vựng ": "") + '">' + esc(w.word) + "</div></td>" +
        '<td class="col-ipa">' + ipaHtml + "</td>" +
        '<td class="col-pos"><span class="w-pos">' + esc(w.pos || "") + "</span></td>" +
        '<td><span class="w-meaning' + (blurMeaning? " blurred": "") + '" title="' +
          (blurMeaning? " điểm kích[ấn vào] tạm thời biểu hiện Giải nghĩa ": "") + '">' +
          esc(yysdMeaningForList(w.meaning, w.acceptCN)) + "</span></td>" +
        '<td class="col-speak">' +
          '<button type="button" class="vl-btn btn-speak-row" data-w="' + esc(acc.ukW) +
            '" data-accent="1" style="padding:6px 8px;font-size:12px" title=" Anh âm "> Anh </button> ' +
          '<button type="button" class="vl-btn btn-speak-row" data-w="' + esc(acc.usW) +
            '" data-accent="2" style="padding:6px 8px;font-size:12px" title=" Mỹ âm "> Mỹ </button></td>' +
        "</tr>";
    }).join("");
    document.getElementById("panel").innerHTML =
      '<div class="vl-toolbar">' +
        learnViewToggleHtml() +
        '<button type="button" class="vl-btn' + (blurWord? " is-on": "") + '" id="btnBlurWord">' +
          (blurWord? " biểu hiện Từ vựng ": " mơ hồ Từ vựng ") + "</button>" +
        '<button type="button" class="vl-btn' + (blurMeaning? " is-on": "") + '" id="btnBlurMeaning">' +
          (blurMeaning? " biểu hiện Giải nghĩa ": " mơ hồ Giải nghĩa ") + "</button>" +
      "</div>" +
      '<div style="overflow-x:auto">' +
        '<table class="vl-word-table">' +
          "<thead><tr><th>#</th><th> Từ vựng </th><th class=\"col-ipa\"> ký âm </th>" +
          "<th class=\"col-pos\"> từ tính </th><th> Giải nghĩa </th><th> phát âm </th></tr></thead>" +
          "<tbody>" + rows + "</tbody></table></div>";
    bindLearnChrome();
    app.querySelectorAll(".word-row").forEach(function (tr) {
      tr.onclick = function (e) {
        if (e.target.closest(".btn-speak-row")) return;
        // peek one blurred cell without leaving list
        var peek = e.target.closest(".w-en.blurred,.w-meaning.blurred");
        if (peek) {
          e.stopPropagation();
          peek.classList.remove("blurred");
          return;
        }
        state.learnIdx = Number(tr.getAttribute("data-i")) || 0;
        state.learnView = "card";
        state.blurOne = true;
        saveProgress(false);
        renderLearn();
      };
    });
    app.querySelectorAll(".btn-speak-row").forEach(function (b) {
      b.onclick = function (e) {
        e.stopPropagation();
        speak(b.getAttribute("data-w"), Number(b.getAttribute("data-accent")) || 1);
      };
    });
  }

  function renderLearnCard() {
    var w = words[state.learnIdx];
    if (!w) return;
    var blur = state.blurAllOff? false: state.blurOne;
    shell("");
    document.getElementById("counter").innerHTML =
      esc(meta.title || "") + " · thứ <strong>" + (state.learnIdx + 1) + "</strong> / " + words.length + " từ ";

    var coll = "";
    if (w.collocations && w.collocations.length) {
      coll = '<div class="vl-section"><div class="vl-section-title"> phối hợp </div><div class="vl-collocs">' +
        w.collocations.map(function (c) {
          return '<span class="vl-coloc">' + esc(c.phrase) +
            (c.meaning? ' <span style="color:#6b7e78">→ ' + esc(c.meaning) + "</span>": "") + "</span>";
        }).join("") + "</div></div>";
    }
    var exam = "";
    if (w.examTag) {
      exam = '<div class="vl-section"><div class="vl-exam">' +
        '<span><span class="lbl"> nơi phát ra </span>' + esc(w.examTag.source || "") + "</span>" +
        '<span><span class="lbl"> chủ đề </span>' + esc(w.examTag.topic || "") + "</span>" +
        '<span><span class="lbl"> cách dùng </span>' + esc(w.examTag.commonUsage || "") + "</span>" +
        "</div></div>";
    }
    var note = w.note
      ? '<div class="vl-section"><div class="vl-section-title"> Giải thích đáp án </div><div class="vl-root-text">' +
        esc(w.note) + "</div></div>"
      : "";
    var root = w.root
      ? '<div class="vl-section"><div class="vl-section-title"> từ căn hóa giải </div><div class="vl-root-text">' +
        esc(w.root) + "</div></div>"
      : "";
    var ex = "";
    if (w.exampleEn) {
      var en = esc(w.exampleEn);
      try {
        en = en.replace(
          new RegExp("\\b" + w.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "gi"),
          function (m) { return '<span class="vl-hl">' + m + "</span>"; }
        );
      } catch (e) {}
      ex = '<div class="vl-section"><div class="vl-section-title"> Câu ví dụ </div><div class="vl-ex-en">' + en +
        "</div>" + (w.exampleZh? '<div class="vl-ex-zh">' + esc(w.exampleZh) + "</div>": "") + "</div>";
    }
    var syn = "";
    if ((w.synonyms && w.synonyms.length) || (w.antonyms && w.antonyms.length)) {
      syn = '<div class="vl-section">' +
        (w.synonyms && w.synonyms.length? '<div class="vl-syn"> Đồng nghĩa: ' + esc(w.synonyms.join(" · ")) + "</div>": "") +
        (w.antonyms && w.antonyms.length? '<div class="vl-syn"> Trái nghĩa: ' + esc(w.antonyms.join(" · ")) + "</div>": "") +
        "</div>";
    }

    var acc = accentOf(w);
    var wordBlock = acc.dual
      ? '<div class="vl-accent"><div class="vl-accent-row"><span class="vl-accent-tag"> Mỹ </span>' +
          '<div class="vl-word" style="font-size:1.6rem">' + esc(acc.usW) + "</div>" +
          '<div class="vl-ipa">' + esc(acc.usI) + "</div></div>" +
          '<div class="vl-accent-row"><span class="vl-accent-tag"> Anh </span>' +
          '<div class="vl-word" style="font-size:1.35rem">' + esc(acc.ukW) + "</div>" +
          '<div class="vl-ipa">' + esc(acc.ukI) + "</div></div></div>"
      : '<div class="vl-word">' + esc(w.word) + "</div>" +
        '<div class="vl-ipa">' + esc(acc.usI || w.ipa || "") + "</div>";
    var atEnd = state.learnIdx >= words.length - 1;
    document.getElementById("panel").innerHTML =
      '<div class="vl-toolbar">' +
        learnViewToggleHtml() +
        '<button type="button" class="vl-btn" id="btnBlurAll">' +
          (state.blurAllOff? " khôi phục cam chịu mơ hồ ": " bản khóa Tất cả văn bản rõ ràng ") + "</button>" +
        '<button type="button" class="vl-btn" id="btnSpeakUk">🔊 Anh âm </button>' +
        '<button type="button" class="vl-btn" id="btnSpeakUs">🔊 Mỹ âm </button>' +
        '<button type="button" class="vl-btn" id="btnQuizList"> Từ vựng Đánh giá </button>' +
      "</div>" +
      wordBlock +
      (w.pos? '<div class="vl-pos">' + esc(w.pos) + "</div>": "") +
      '<div class="vl-meaning' + (blur? " blurred": "") + '" id="meaning">' +
        esc(w.meaning) + '<span class="vl-hint"> điểm kích[ấn vào] biểu hiện / che giấu </span></div>' +
      exam + coll + ex + note + root + syn +
      '<div class="vl-nav-row">' +
        '<button type="button" class="vl-btn" id="prev">← một cái đằng trước </button>' +
        '<button type="button" class="vl-btn vl-btn-primary" id="next">' +
          (atEnd? " hoàn thành bản List": " kế tiếp →") + "</button>" +
      "</div>";

    bindLearnChrome();
    bindQuizEntry();
    document.getElementById("btnSpeakUk").onclick = function () { speak(acc.ukW, 1); };
    document.getElementById("btnSpeakUs").onclick = function () { speak(acc.usW, 2); };
    document.getElementById("meaning").onclick = function () {
      if (state.blurAllOff) return;
      state.blurOne =!state.blurOne;
      renderLearn();
    };
    document.getElementById("prev").onclick = function () {
      if (state.learnIdx > 0) {
        state.learnIdx--;
        state.blurOne = true;
        saveProgress(false);
        renderLearn();
      }
    };
    document.getElementById("next").onclick = function () {
      if (atEnd) {
        saveProgress(true).then(function () {
          location.href = assignEventId
            ? "dashboard.html"
            : ("vocab-shelf.html?book=" + encodeURIComponent(bookId));
        }).catch(function (e) {
          alert((e && e.message) || " Lưu thất bại, mời Thử lại ");
        });
        return;
      }
      state.learnIdx++;
      state.blurOne = true;
      saveProgress(false).catch(function () {});
      renderLearn();
    };
  }

  function renderLearn() {
    if (state.learnView === "list") renderLearnList();
    else renderLearnCard();
  }

  function fail(msg, href) {
    app.innerHTML = '<div class="vl-state"><p>' + esc(msg) + '</p>' +
      (href? '<p style="margin-top:12px"><a class="vl-btn vl-btn-primary" href="' + href +
        '" style="display:inline-block;text-decoration:none"> Quay lại </a></p>': "") +
      "</div>";
  }

  function boot() {
    if (!bookId ||!listId) {
      fail(" thiếu khuyết từ sách hoặc List tham số ", "vocab-shelf.html");
      return;
    }
    if (!A ||!A.getToken ||!A.getToken()) {
      location.href = "login.html?next=" + encodeURIComponent(location.pathname + location.search);
      return;
    }
    app.innerHTML = '<div class="vl-state"> Đang tải …</div>';
    // ponytail: same as quiz — homework deep-link must not require prior shelf add
    A.api("/api/vocab-shelf/add", { method: "POST", body: { bookId: bookId } })
      .catch(function () {})
      .then(function () {
        return A.api("/api/vocab-shelf/lesson?bookId=" + encodeURIComponent(bookId) +
          "&listId=" + encodeURIComponent(listId));
      })
      .then(function (d) {
        if (!d.words ||!d.words.length) {
          fail(" nên List không có Từ vựng ", "vocab-shelf.html?book=" + encodeURIComponent(bookId));
          return;
        }
        words = d.words;
        meta.title = (d.book && d.book.label) || bookId;
        meta.stageLabel = (d.list && d.list.label) || listId;
        state.learnIdx = Math.max(0, Math.min(d.progress && d.progress.wordIdx || 0, words.length - 1));
        if (backEl) {
          backEl.innerHTML = '<a href="vocab-shelf.html?book=' + encodeURIComponent(bookId) +
            '">← Quay lại ' + esc(meta.title) + "</a>";
        }
        document.title = meta.stageLabel + " · " + meta.title + " · YYSD ";
        renderLearn();
      })
      .catch(function (e) {
        fail((e && e.message) || " Tải dữ liệu thất bại ", "vocab-shelf.html");
      });
  }

  boot();
})();
