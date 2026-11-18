/* ai-word.js - Khu vực từ vựng AI nghiên cứu biến thể cũ của |(gốc đầu kết trái + chất vấn kỹ lưỡng + sổ tay từ vựng) */
window.YYSD_AI_WORD = (function () {
  "use strict";

  var Y = window.YYSD;
  var A = window.YYSD_AUTH;
  var history = [];
  var lastMeta = null;
  var quota = null;
  var busy = false;

  function shellHTML() {
    return '<div class="ai-word" id="ai-word">' +
      '<div class="ai-word__head">' +
        "<h3>AI nghiên cứu biến thể cũ của |</h3>" +
        '<span class="ai-word__quota" id="ai-word-quota">hôm nay hạn ngạch tải Trung Quốc...</span>' +
      "</div>" +
      '<p class="ai-word__hint">nghiên cứu từ, cụm từ, câu, có thể sử dụng ngôn ngữ Trung Quốc ngược nghiên cứu; có thể tiếp tục chất vấn kỹ lưỡng </p>' +
      '<form class="ai-word__form" id="ai-word-form">' +
        '<label class="ai-word__search">' +
          '<span class="catalog-search__ico" aria-hidden="true">⌕</span>' +
          '<input type="search" id="ai-word-input" placeholder=" nhập khẩu tiếng Anh từ / cụm từ / câu, có thể ngôn ngữ Trung Quốc..." autocomplete="off" spellcheck="false">' +
        "</label>" +
        '<button type="submit" class="btn btn--primary btn--sm" id="ai-word-submit">kiểm tra</button>' +
      "</form>" +
      '<div class="ai-word__panel" id="ai-word-panel"' + (history.length ? "" : " hidden") + ">" +
        '<div class="ai-word__msgs" id="ai-word-msgs"></div>' +
        '<div class="ai-word__bar">' +
          '<button type="button" class="btn btn--ghost btn--sm" id="ai-word-save"' +
            (lastMeta && lastMeta.word ? "" : " disabled") + ">trở thành thành viên sổ tay từ vựng</button>" +
          '<button type="button" class="btn btn--ghost btn--sm" id="ai-word-clear">viết tắt của Tân Cương kiểm tra</button>' +
        "</div>" +
        '<form class="ai-word__follow" id="ai-word-follow">' +
          '<input type="search" id="ai-word-follow-input" placeholder=" tiếp tục chất vấn kỹ lưỡng..." autocomplete="off">' +
          '<button type="submit" class="btn btn--primary btn--sm">truyền đi</button>' +
        "</form>" +
      "</div>" +
      '<p class="ai-word__status" id="ai-word-status" hidden></p>' +
    "</div>";
  }

  function loginNext() {
    location.href = "login.html?next=" + encodeURIComponent(location.pathname + location.search);
  }

  function ensureLogin() {
    if (!A || !A.getToken || !A.getToken()) {
      loginNext();
      return false;
    }
    return true;
  }

  function api(path, opts) {
    return A.api(path, opts).catch(function (err) {
      var msg = String(err && err.message || "");
      // ponytail: " mời sử dụng học sinh số tài khoản đăng ký " also contains Đăng nhập - must not bounce teachers off zone
      if (A && A.isTeacher && A.isTeacher()) throw err;
      if (msg.indexOf(" học sinh số tài khoản ") >= 0) throw err;
      if (msg.indexOf(" Đăng nhập ") >= 0 || msg.indexOf(" chưa đăng ký ") >= 0) loginNext();
      throw err;
    });
  }

  function setStatus(msg, kind) {
    var el = document.getElementById("ai-word-status");
    if (!el) return;
    if (!msg) { el.hidden = true; el.textContent = ""; return; }
    el.hidden = false;
    el.textContent = msg;
    el.className = "ai-word__status" + (kind ? " is-" + kind : "");
  }

  function renderQuota() {
    var el = document.getElementById("ai-word-quota");
    if (!el) return;
    if (!quota) { el.textContent = " hôm nay hạn ngạch -"; return; }
    el.textContent = " hôm nay phần còn lại " + quota.left + " / " + quota.limit + " tiếp theo ";
  }

  function paintMsgs() {
    var box = document.getElementById("ai-word-msgs");
    if (!box) return;
    box.innerHTML = history.map(function (m) {
      return '<div class="ai-word__msg ai-word__msg--' + (m.role === "assistant" ? "assistant" : "user") + '">' +
        "<pre>" + Y.esc(m.content) + "</pre></div>";
    }).join("");
    box.scrollTop = box.scrollHeight;
  }

  function syncPanel() {
    var panel = document.getElementById("ai-word-panel");
    var saveBtn = document.getElementById("ai-word-save");
    if (panel) panel.hidden = !history.length;
    if (saveBtn) saveBtn.disabled = !(lastMeta && lastMeta.word);
    paintMsgs();
    renderQuota();
  }

  function loadQuota() {
    if (!A || !A.getToken || !A.getToken()) return;
    api("/api/ai-word/quota").then(function (d) {
      quota = d.quota;
      renderQuota();
    }).catch(function () {});
  }

  function ask(content) {
    if (busy) return;
    if (!ensureLogin()) return;
    content = String(content || "").trim();
    if (!content) return;
    busy = true;
    setStatus(" đang ở kiểm tra...");
    var submit = document.getElementById("ai-word-submit");
    var followBtn = document.querySelector("#ai-word-follow button");
    if (submit) submit.disabled = true;
    if (followBtn) followBtn.disabled = true;

    api("/api/ai-word/ask", {
      method: "POST",
      body: { content: content, history: history }
    }).then(function (d) {
      history.push({ role: "user", content: content });
      history.push({ role: "assistant", content: d.reply || "" });
      if (d.meta && d.meta.word) lastMeta = d.meta;
      quota = d.quota || quota;
      var input = document.getElementById("ai-word-input");
      var follow = document.getElementById("ai-word-follow-input");
      if (input) input.value = "";
      if (follow) follow.value = "";
      syncPanel();
      setStatus(quota && quota.left === 0 ? " hôm nay hạn ngạch đã dùng hết " : "", quota && quota.left === 0 ? "warn" : "");
    }).catch(function (err) {
      setStatus((err && err.message) || " kiểm tra bị đánh bại ", "err");
    }).then(function () {
      busy = false;
      if (submit) submit.disabled = false;
      if (followBtn) followBtn.disabled = false;
    });
  }

  function saveWord() {
    if (!lastMeta || !lastMeta.word) {
      setStatus(" tạm thời không thể sưu tầm của mục từ điển ", "warn");
      return;
    }
    Y.addSavedWord({
      word: lastMeta.word,
      ipa: lastMeta.ipa || "",
      meaning: lastMeta.meaning || "",
      note: ""
    });
    setStatus(" đã trở thành thành viên sổ tay từ vựng: " + lastMeta.word, "ok");
    var card = document.querySelector('.wrong-notebook-strip[aria-label=" sổ tay từ vựng "]');
    if (card && Y.savedWordsStripHTML) {
      card.outerHTML = Y.savedWordsStripHTML("");
    }
  }

  function clearChat() {
    history = [];
    lastMeta = null;
    syncPanel();
    setStatus("");
    var input = document.getElementById("ai-word-input");
    if (input) input.focus();
  }

  function bind(root) {
    var el = (root || document).querySelector("#ai-word");
    if (!el || el.getAttribute("data-bound") === "1") {
      if (el) syncPanel();
      return;
    }
    el.setAttribute("data-bound", "1");
    syncPanel();
    loadQuota();

    var form = el.querySelector("#ai-word-form");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = el.querySelector("#ai-word-input");
        ask(input && input.value);
      });
    }
    var follow = el.querySelector("#ai-word-follow");
    if (follow) {
      follow.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = el.querySelector("#ai-word-follow-input");
        ask(input && input.value);
      });
    }
    var saveBtn = el.querySelector("#ai-word-save");
    if (saveBtn) saveBtn.addEventListener("click", saveWord);
    var clearBtn = el.querySelector("#ai-word-clear");
    if (clearBtn) clearBtn.addEventListener("click", clearChat);
  }

  return { shellHTML: shellHTML, bind: bind };
})();
