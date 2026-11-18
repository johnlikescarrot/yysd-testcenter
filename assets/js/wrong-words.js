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

  function fail(msg) {
    contentEl.innerHTML = '<div class="state"><h3>không thểmở</h3><p>' + esc(msg) +
      '</p><p><a href="zone.html?zone=study&s=vocab">Quay lạiKhu vực Từ vựng</a></p></div>';
  }

  function importLocalOnce() {
    if (!Y || !Y.wrongWords) return Promise.resolve();
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
    document.title = "Sổ lỗi sai · YYSD · Trung tâm Khóa học Quốc tế";
    var rows = sessions.length
      ? sessions.map(function (s) {
          return '<a class="vs-list-row" href="wrong-words.html?session=' + s.id + '">' +
            "<div><b>" + esc(s.title) + "</b>" +
            '<span class="vs-row__meta">họ biến thể cũ của ' + (s.wrongCount || 0) +
            (s.passed ? " · lúc đóđãthông quan" : "") + "</span></div>" +
            '<span class="vs-go">Xem ›</span></a>';
        }).join("")
      : '<div class="soon-box premium-empty">họkhông cóCâu saighi chép.đi«Từ vựngphát hiện»Hoàn thànhmột sân phơi họ,họ biến thể cũ của có thểhàng ngày pháp luậtbiến thể của + biến thể cũ của viết tắt của + List xuất hiệntồn tạibiến thể của.</div>';

    contentEl.innerHTML =
      '<div class="cam-hero vocab-hero wrong-words-hero bento-panel">' +
        '<div class="cam-hero__badge"><div class="lbl">Câu sai</div><div class="num">' + total + "</div></div>" +
        "<div><h1>Sổ lỗi sai</h1>" +
        '<div class="meta">nhấnphát hiệnsố lần chiếu của một bộ phim:ngày tháng + biến thể cũ của viết tắt của + List · thường dùng ở dạng phủ định trả lời hoặc đáp lại câu hỏi của ai đókhôngtự độngXóa,tiền tố có thểthủ côngXóahình thức liên kết toàn bộ sân phơi</div>' +
        '<div class="vocab-hero__actions">' +
          '<a class="btn btn--primary btn--sm" href="vocab-quiz.html">điphát hiện</a>' +
          '<a class="btn btn--ghost btn--sm" href="zone.html?zone=study&s=vocab">← Khu vực Từ vựng</a>' +
        "</div></div></div>" +
      '<div class="vs-list" style="margin-top:14px">' + rows + "</div>";
  }

  function renderSession(data) {
    var s = data.session;
    var mistakes = data.mistakes || [];
    document.title = s.title + " · Sổ lỗi sai · YYSD";
    var cards = mistakes.length
      ? '<div class="wrong-words-list">' + mistakes.map(function (w) {
          return '<article class="wrong-word-card">' +
            '<div class="wrong-word-card__main">' +
              '<div class="wrong-word-card__head"><h3>' + esc(w.word) +
                ' <span class="wrong-word-card__ipa">' + esc(w.ipa || "") + "</span></h3></div>" +
              '<p class="wrong-word-card__meaning">' + esc(w.meaning || "") + "</p>" +
              (w.userAnswer
                ? '<p class="wrong-word-card__attempt">trả lời:' + esc(w.userAnswer) + "</p>"
                : "") +
            "</div>" +
            '<div class="wrong-word-card__actions">' +
              '<button type="button" class="btn btn--ghost btn--sm btn-speak" data-word="' +
                esc(w.word) + '">🔊 Phát âm</button>' +
            "</div></article>";
        }).join("") + "</div>"
      : '<div class="soon-box premium-empty">đại từ này sân phơihiện tạikhông cóhọ biến thể cũ của(lặp lại khảo sát đãdọn dẹpdanh sách).ghi chépvẫngiữ,tiền tố có thểthủ côngXóa.</div>';

    contentEl.innerHTML =
      '<div class="cam-hero vocab-hero wrong-words-hero bento-panel">' +
        '<div class="cam-hero__badge"><div class="lbl">số lần chiếu của một bộ phim</div><div class="num">' +
          mistakes.length + "</div></div>" +
        "<div><h1>" + esc(s.title) + "</h1>" +
        '<div class="meta">' + esc(s.bookLabel) + " · họ biến thể cũ của lặp lại khảo sát có thểthay cũ đổi mớihình thức kết hợp gốc sân phơidanh sách</div>" +
        '<div class="vocab-hero__actions">' +
          '<a class="btn btn--ghost btn--sm" href="wrong-words.html">← Tất cảsố lần chiếu của một bộ phim</a>' +
          (mistakes.length
            ? '<a class="btn btn--primary btn--sm" href="vocab-quiz.html?session=' + s.id +
              '">họ biến thể cũ của lặp lại khảo sát</a>'
            : "") +
          '<button type="button" class="btn btn--ghost btn--sm" id="btn-del-session">Xóahình thức kết hợp gốc sân phơi</button>' +
        "</div></div></div>" +
      cards;

    contentEl.querySelectorAll(".btn-speak").forEach(function (btn) {
      btn.onclick = function () {
        var word = btn.getAttribute("data-word");
        if (!window.speechSynthesis || !word) return;
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(word);
        u.lang = "en-GB";
        window.speechSynthesis.speak(u);
      };
    });
    document.getElementById("btn-del-session").onclick = function () {
      if (!confirm("Xóahọkhông thểkhôi phục,rõ ràngXóađại từ này sân phơiCâu saighi chép?")) return;
      A.api("/api/vocab-shelf/wrongbook/session/remove", {
        method: "POST",
        body: { sessionId: s.id }
      }).then(function () {
        location.href = "wrong-words.html";
      }).catch(function (e) {
        alert((e && e.message) || "XóaThất bại");
      });
    };
  }

  function boot() {
    if (!needAuth()) return;
    contentEl.innerHTML = '<div class="state state--brand"><div class="spinner spinner--brand"></div>Đang tải…</div>';
    importLocalOnce().then(function () {
      if (sessionId) {
        return A.api("/api/vocab-shelf/wrongbook/session?id=" + encodeURIComponent(sessionId))
          .then(renderSession);
      }
      return A.api("/api/vocab-shelf/wrongbook").then(renderList);
    }).catch(function (e) {
      fail((e && e.message) || "Tải thất bại");
    });
  }

  boot();
})();
