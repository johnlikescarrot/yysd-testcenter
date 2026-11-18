/* english-ime-gate.js — block spell tests until English IME is confirmed */
(function () {
  "use strict";

  var PROBE = "test";
  var CHEAT_LIMIT = 3; // ponytail: 超过 3 次中途切中文 IME → 第 4 次判作弊
  var overlay = null;
  var pending = null;
  var probeIdx = 0;
  var composing = false;

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function close() {
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
    document.body.classList.remove("yysd-ime-gate-open");
    document.removeEventListener("keydown", trapTab, true);
    composing = false;
  }

  function trapTab(e) {
    if (!overlay || e.key !== "Tab") return;
    var input = overlay.querySelector(".ime-gate-input");
    if (input) {
      e.preventDefault();
      input.focus();
    }
  }

  function renderProgress() {
    var el = overlay && overlay.querySelector(".ime-gate-progress");
    if (!el) return;
    var html = "";
    for (var i = 0; i < PROBE.length; i++) {
      var cls = "ime-gate-char";
      if (i < probeIdx) cls += " done";
      else if (i === probeIdx) cls += " active";
      html += '<span class="' + cls + '">' + esc(PROBE[i]) + "</span>";
    }
    el.innerHTML = html;
  }

  function showError(msg) {
    var el = overlay && overlay.querySelector(".ime-gate-err");
    if (!el) return;
    el.textContent = msg || "";
    el.hidden = !msg;
  }

  function resetProbe(input) {
    probeIdx = 0;
    composing = false;
    if (input) {
      input.value = "";
      input.disabled = false;
    }
    showError("");
    renderProgress();
  }

  function pass() {
    var p = pending;
    pending = null;
    close();
    if (p) p.resolve();
  }

  function buildOverlay(reason, meta) {
    meta = meta || {};
    var isViolation = reason === "violation";
    var strikes = meta.strikes || 0;
    var strikeHint = "";
    if (isViolation && strikes > 0) {
      strikeHint =
        '<p class="ime-gate-strikes">Đã chuyển khỏi bộ gõ tiếng Anh <strong>' + strikes + "</strong> lần" +
        (strikes >= CHEAT_LIMIT
          ? " (nếu chuyển lần nữa, bài kiểm tra sẽ mất hiệu lực)"
          : " (quá " + CHEAT_LIMIT + " lần sẽ làm bài kiểm tra mất hiệu lực)") +
        "</p>";
    }
    overlay = document.createElement("div");
    overlay.className = "yysd-ime-gate";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "ime-gate-title");
    overlay.innerHTML =
      '<div class="ime-gate-panel">' +
        '<h2 id="ime-gate-title">Chuyển sang bộ gõ tiếng Anh</h2>' +
        (isViolation
          ? '<p class="ime-gate-lead ime-gate-lead--warn">Đã phát hiện bộ gõ không ở chế độ tiếng Anh, hãy chuyển về tiếng Anh để tiếp tục.</p>'
          : '<p class="ime-gate-lead">Bài chính tả yêu cầu dùng bộ gõ tiếng Anh. Hãy tắt tính năng gợi ý để tự viết từng chữ cái.</p>') +
        strikeHint +
        '<p class="ime-gate-tip">Mac: Caps Lock hoặc Control+Space chuyển sang ABC/tiếng Anh<br>' +
        "Windows: Shift hoặc Win+Space chuyển sang ENG</p>" +
        '<p class="ime-gate-probe-label">Hãy gõ <code>test</code> <strong>từng chữ cái</strong> để xác nhận:</p>' +
        '<div class="ime-gate-progress"></div>' +
        '<input type="text" class="ime-gate-input yysd-en-spell" id="ime-gate-probe" ' +
          'autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" ' +
          'lang="en" inputmode="latin" aria-label="gõ test để xác nhận bộ gõ tiếng Anh" />' +
        '<p class="ime-gate-err" hidden></p>' +
      "</div>";
    document.body.appendChild(overlay);
    document.body.classList.add("yysd-ime-gate-open");
    document.addEventListener("keydown", trapTab, true);

    var input = overlay.querySelector("#ime-gate-probe");
    resetProbe(input);

    input.addEventListener("compositionstart", function () {
      composing = true;
      showError("Đã phát hiện bộ gõ không ở chế độ tiếng Anh, Hãy chuyển sang bộ gõ tiếng Anh");
      resetProbe(input);
    });

    input.addEventListener("compositionend", function () {
      composing = false;
      if (input.value) {
        showError("Đã phát hiện bộ gõ không ở chế độ tiếng Anh, Hãy chuyển sang bộ gõ tiếng Anh");
        resetProbe(input);
      }
    });

    input.addEventListener("beforeinput", function (e) {
      var t = e.inputType || "";
      if (t.indexOf("delete") === 0) {
        e.preventDefault();
        resetProbe(input);
        return;
      }
      if (composing || t.indexOf("Composition") >= 0 || t === "insertReplacementText" ||
          t === "insertFromPaste" || t === "insertFromComposition" || t === "insertFromDrop") {
        e.preventDefault();
        showError("Đã phát hiện bộ gõ không ở chế độ tiếng Anh, Hãy chuyển sang bộ gõ tiếng Anh");
        resetProbe(input);
        return;
      }
      if (t === "insertText" && e.data != null) {
        if (e.data.length !== 1 || /[^a-zA-Z]/.test(e.data)) {
          e.preventDefault();
          if (/[\u4e00-\u9fff]/.test(e.data)) {
            showError("Hãy dùng bộ gõ tiếng Anh");
            resetProbe(input);
          }
          return;
        }
        if (e.data.toLowerCase() !== PROBE[probeIdx]) {
          e.preventDefault();
          showError("Hãy gõ lần lượt từng chữ cái test");
          resetProbe(input);
          return;
        }
        e.preventDefault();
        probeIdx++;
        input.value = PROBE.slice(0, probeIdx);
        renderProgress();
        showError("");
        if (probeIdx >= PROBE.length) {
          input.disabled = true;
          setTimeout(pass, 120);
        }
      }
    });

    input.addEventListener("paste", function (e) {
      e.preventDefault();
      showError("Hãy tự gõ từng chữ cái, không dán văn bản");
      resetProbe(input);
    });

    setTimeout(function () { input.focus(); }, 50);
  }

  function require(opts) {
    opts = opts || {};
    if (pending) return pending.promise;
    var reason = opts.reason || "start";
    var resolve;
    var promise = new Promise(function (res) { resolve = res; });
    pending = { resolve: resolve, promise: promise };
    buildOverlay(reason, { strikes: opts.strikes || 0 });
    return promise;
  }

  function showCheat(opts) {
    opts = opts || {};
    reset();
    overlay = document.createElement("div");
    overlay.className = "yysd-ime-gate yysd-ime-gate--cheat";
    overlay.setAttribute("role", "alertdialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "ime-cheat-title");
    overlay.innerHTML =
      '<div class="ime-gate-panel ime-gate-panel--cheat">' +
        '<h2 id="ime-cheat-title">Bài kiểm tra đã dừng</h2>' +
        '<p class="ime-gate-lead ime-gate-lead--warn">Bộ gõ đã chuyển khỏi tiếng Anh nhiều lần trong khi kiểm tra (vượt giới hạn ' +
          CHEAT_LIMIT + " lần), lượt trả lời này không còn hiệu lực.</p>" +
        '<p class="ime-gate-tip">Dùng bộ gõ tiếng Anh để hoàn thành bài chính tả. Có thể bắt đầu lại, hoặc thoát bài kiểm tra này.</p>' +
        '<div class="ime-gate-actions">' +
          '<button type="button" class="vl-btn vl-btn-primary" id="ime-cheat-restart">Bắt đầu lại</button>' +
          '<button type="button" class="vl-btn" id="ime-cheat-exit">Thoát bài kiểm tra</button>' +
        "</div>" +
      "</div>";
    document.body.appendChild(overlay);
    document.body.classList.add("yysd-ime-gate-open");
    overlay.querySelector("#ime-cheat-restart").onclick = function () {
      reset();
      if (opts.onRestart) opts.onRestart();
    };
    overlay.querySelector("#ime-cheat-exit").onclick = function () {
      reset();
      if (opts.onExit) opts.onExit();
    };
  }

  function isOpen() {
    return !!overlay;
  }

  function reset() {
    pending = null;
    close();
  }

  window.YYSD_IME_GATE = {
    require: require,
    isOpen: isOpen,
    reset: reset,
    showCheat: showCheat,
    CHEAT_LIMIT: CHEAT_LIMIT
  };
})();
