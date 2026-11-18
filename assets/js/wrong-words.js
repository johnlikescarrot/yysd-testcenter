/* wrong-words.js — unified wrong book: date + book + lists sessions */
(function () {
  "use strict";
  var Y = window.YYSD;
  var A = window.YYSD_AUTH;
  var contentEl = document.getElementById("content");
  var params = new URLSearchParams(location.search);
  var sessionId = Number(params.get("session") || 0);

  var navLink = document.querySelector('#nav a[data-zone="study"]');
  if (navLink) navLink.classList.add("is-active");
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

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

  function fail(msg) {
    contentEl.innerHTML = '<div class="state"><h3> không cách nào mở ra </h3><p>' + esc(msg) +
      '</p><p><a href="zone.html?zone=study&s=vocab"> Quay lại Khu từ vựng </a></p></div>';
  }

  function importLocalOnce() {
    if (!Y ||!Y.wrongWords) return Promise.resolve();
    try {
      if (localStorage.getItem("yysd:wrongbook:local-imported") === "1") {
        return Promise.resolve();
      }
    } catch (e) {}
    var books = [];
    ["gaozhong", "cet4", "cet4-lite", "special"].forEach(function (k) {
      var words = Y.wrongWords(k) || [];
      if (!words.length) return;
      books.push({
        bookId: k,
        words: words.map(function (w) {
          return { word: w.word, ipa: w.ipa, meaning: w.meaning };
        })
      });
    });
    if (!books.length) {
      try { localStorage.setItem("yysd:wrongbook:local-imported", "1"); } catch (e2) {}
      return Promise.resolve();
    }
    return A.api("/api/vocab-shelf/wrongbook/import-local", {
      method: "POST",
      body: { books: books }
    }).then(function () {
      try { localStorage.setItem("yysd:wrongbook:local-imported", "1"); } catch (e3) {}
    }).catch(function () {});
  }

  function renderList(data) {
    var sessions = data.sessions || [];
    var total = data.totalMistakes || 0;
    document.title = " Sổ lỗi sai · Trung tâm Luyện thi Quốc tế YYSD ";
    var rows = sessions.length
      ? sessions.map(function (s) {
          return '<a class="vs-list-row" href="wrong-words.html?session=' + s.id + '">' +
            "<div><b>" + esc(s.title) + "</b>" +
            '<span class="vs-row__meta"> từ sai ' + (s.wrongCount || 0) +
            (s.passed? " · lúc ấy Hoàn thành màn ": "") + "</span></div>" +
            '<span class="vs-go"> Xem ›</span></a>';
        }).join("")
      : '<div class="soon-box premium-empty"> còn không có sai lời tựa lục. đi « Từ vựng Đánh giá » hoàn thành một cuộc sau, từ sai sẽ theo như ngày + từ sách + List xuất hiện ở nơi này. </div>';

    contentEl.innerHTML =
      '<div class="cam-hero vocab-hero wrong-words-hero bento-panel">' +
        '<div class="cam-hero__badge"><div class="lbl"> câu sai </div><div class="num">' + total + "</div></div>" +
        "<div><h1> Sổ lỗi sai </h1>" +
        '<div class="meta"> theo như Đánh giá buổi diễn: ngày + từ sách + List · trả lời không tự động xóa bỏ, có thể chủ động xóa bỏ cả trận </div>' +
        '<div class="vocab-hero__actions">' +
          '<a class="btn btn--primary btn--sm" href="vocab-quiz.html"> đi Đánh giá </a>' +
          '<a class="btn btn--ghost btn--sm" href="zone.html?zone=study&s=vocab">← Khu từ vựng </a>' +
        "</div></div></div>" +
      '<div class="vs-list" style="margin-top:14px">' + rows + "</div>";
  }

  function renderSession(data) {
    var s = data.session;
    var mistakes = data.mistakes || [];
    document.title = s.title + " · Sổ lỗi sai · YYSD ";
    var cards = mistakes.length
      ? '<div class="wrong-words-list">' + mistakes.map(function (w) {
          return '<article class="wrong-word-card">' +
            '<div class="wrong-word-card__main">' +
              '<div class="wrong-word-card__head"><h3>' + esc(w.word) +
                ' <span class="wrong-word-card__ipa">' + esc(w.ipa || "") + "</span></h3></div>" +
              '<p class="wrong-word-card__meaning">' + esc(w.meaning || "") + "</p>" +
              (w.userAnswer
                ? '<p class="wrong-word-card__attempt"> đáp lại: ' + esc(w.userAnswer) + "</p>"
                : "") +
            "</div>" +
            '<div class="wrong-word-card__actions">' +
              '<button type="button" class="btn btn--ghost btn--sm btn-speak" data-word="' +
                esc(w.word) + '">🔊 phát âm </button>' +
            "</div></article>";
        }).join("") + "</div>"
      : '<div class="soon-box premium-empty"> trận này trước mắt không từ sai (Làm lại đã Xóa trống liệt biểu List). ghi chép nhưng giữ lại, có thể chủ động xóa bỏ. </div>';

    contentEl.innerHTML =
      '<div class="cam-hero vocab-hero wrong-words-hero bento-panel">' +
        '<div class="cam-hero__badge"><div class="lbl"> buổi diễn </div><div class="num">' +
          mistakes.length + "</div></div>" +
        "<div><h1>" + esc(s.title) + "</h1>" +
        '<div class="meta">' + esc(s.bookLabel) + " · Kiểm tra lại từ sai sẽ đổi mới bổn tràng liệt biểu List </div>" +
        '<div class="vocab-hero__actions">' +
          '<a class="btn btn--ghost btn--sm" href="wrong-words.html">← Tất cả buổi diễn </a>' +
          (mistakes.length
            ? '<a class="btn btn--primary btn--sm" href="vocab-quiz.html?session=' + s.id +
              '"> Kiểm tra lại từ sai </a>'
            : "") +
          '<button type="button" class="btn btn--ghost btn--sm" id="btn-del-session"> xóa bỏ bổn tràng </button>' +
        "</div></div></div>" +
      cards;

    contentEl.querySelectorAll(".btn-speak").forEach(function (btn) {
      btn.onclick = function () {
        var word = btn.getAttribute("data-word");
        if (!window.speechSynthesis ||!word) return;
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(word);
        u.lang = "en-GB";
        window.speechSynthesis.speak(u);
      };
    });
    document.getElementById("btn-del-session").onclick = function () {
      if (!confirm(" xóa bỏ sau không thể khôi phục, Đồng ý xóa bỏ trận này sai lời tựa lục? ")) return;
      A.api("/api/vocab-shelf/wrongbook/session/remove", {
        method: "POST",
        body: { sessionId: s.id }
      }).then(function () {
        location.href = "wrong-words.html";
      }).catch(function (e) {
        alert((e && e.message) || " xóa bỏ thất bại ");
      });
    };
  }

  function boot() {
    if (!needAuth()) return;
    contentEl.innerHTML = '<div class="state state--brand"><div class="spinner spinner--brand"></div> Đang tải …</div>';
    importLocalOnce().then(function () {
      if (sessionId) {
        return A.api("/api/vocab-shelf/wrongbook/session?id=" + encodeURIComponent(sessionId))
          .then(renderSession);
      }
      return A.api("/api/vocab-shelf/wrongbook").then(renderList);
    }).catch(function (e) {
      fail((e && e.message) || "Tải dữ liệu thất bại");
    });
  }

  boot();
})();
