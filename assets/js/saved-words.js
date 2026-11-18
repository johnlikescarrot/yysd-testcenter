/* saved-words.js - AI sổ tay từ vựng danh sách */
(function () {
  "use strict";
  var Y = window.YYSD;
  var contentEl = document.getElementById("content");
  var searchQuery = "";

  var navLink = document.querySelector('#nav a[data-zone="study"]');
  if (navLink) navLink.classList.add("is-active");
  document.getElementById("year").textContent = new Date().getFullYear();
  document.title = " sổ tay từ vựng · Trung tâm YYSD ";

  function formatDate(iso) {
    if (!iso) return "-";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleString("vi-VN", { hour12: false, month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  function filtered() {
    var words = Y.savedWords();
    var q = searchQuery.toLowerCase().trim();
    if (!q) return words;
    return words.filter(function (w) {
      return (w.word + " " + w.meaning + " " + (w.ipa || "")).toLowerCase().indexOf(q) >= 0;
    });
  }

  function render() {
    var words = filtered();
    var n = Y.savedWordCount();
    var html = '<div class="cam-hero vocab-hero wrong-words-hero bento-panel">' +
      '<div class="cam-hero__badge"><div class="lbl">Từ mới</div><div class="num">' + n + "</div></div>" +
      "<div><h1>AI sổ tay từ vựng</h1>" +
      '<div class="meta">' + (n ? n + " dùng trong | sưu tầm từ mới " : " tạm thời không có từ mới · tồn tại từ khu vực sử dụng AI nghiên cứu biến thể cũ của | hoàng hậu cây coca đi vào ") + "</div>" +
      '<div class="vocab-hero__actions">' +
        '<a class="btn btn--primary btn--sm" href="zone.html?zone=study&s=vocab">đi AI nghiên cứu biến thể cũ của |</a>' +
        (n ? '<button type="button" class="btn btn--ghost btn--sm" id="btn-clear">dọn dẹp sổ tay từ vựng</button>' : "") +
      "</div></div></div>" +
      '<div class="wrong-words-toolbar">' +
        '<label class="catalog-search wrong-words-search">' +
          '<span class="catalog-search__ico" aria-hidden="true">⌕</span>' +
          '<input type="search" id="word-search" placeholder=" tìm kiếm từ mới..." autocomplete="off" spellcheck="false" value="' +
            Y.esc(searchQuery) + '">' +
        "</label></div>";

    if (!words.length) {
      html += '<div class="soon-box premium-empty">' + (n ? " không có phối hoặc kết hôn của từ mới " : " vẫn không có từ mới trở về từ khu vực sử dụng AI nghiên cứu biến thể cũ của |, lại điểm«trở thành thành viên sổ tay từ vựng» ") + "</div>";
    } else {
      html += '<div class="wrong-words-list">' + words.map(function (w) {
        var key = String(w.word).toLowerCase();
        return '<article class="wrong-word-card" data-key="' + Y.esc(key) + '">' +
          '<div class="wrong-word-card__main">' +
            '<div class="wrong-word-card__head">' +
              "<h3>" + Y.esc(w.word) + ' <span class="wrong-word-card__ipa">' + Y.esc(w.ipa || "") + "</span></h3>" +
            "</div>" +
            '<p class="wrong-word-card__meaning">' + Y.esc(w.meaning || "") + "</p>" +
            '<div class="wrong-word-card__meta">' +
              '<span class="wrong-word-card__date">' + Y.esc(formatDate(w.savedAt)) + "</span>" +
            "</div>" +
          "</div>" +
          '<div class="wrong-word-card__actions">' +
            '<button type="button" class="btn btn--ghost btn--sm btn-speak" data-word="' + Y.esc(w.word) + '">🔊 Phát âm</button>' +
            '<button type="button" class="btn btn--ghost btn--sm btn-remove" data-key="' + Y.esc(key) + '">di chuyển đi ra</button>' +
          "</div></article>";
      }).join("") + "</div>";
    }

    contentEl.innerHTML = html;

    var search = document.getElementById("word-search");
    if (search) {
      search.addEventListener("input", function () {
        searchQuery = search.value;
        render();
        var again = document.getElementById("word-search");
        if (again) { again.focus(); again.setSelectionRange(again.value.length, again.value.length); }
      });
    }
    var clearBtn = document.getElementById("btn-clear");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        if (!confirm(" rõ ràng dọn dẹp sổ tay từ vựng? ")) return;
        Y.clearSavedWords();
        render();
      });
    }
    contentEl.querySelectorAll(".btn-remove").forEach(function (btn) {
      btn.addEventListener("click", function () {
        Y.removeSavedWord(btn.getAttribute("data-key"));
        render();
      });
    });
    var synth = window.speechSynthesis;
    contentEl.querySelectorAll(".btn-speak").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (!synth) return;
        synth.cancel();
        var u = new SpeechSynthesisUtterance(btn.getAttribute("data-word") || "");
        u.lang = "en-GB";
        u.rate = 0.9;
        synth.speak(u);
      });
    });
  }

  render();
})();
