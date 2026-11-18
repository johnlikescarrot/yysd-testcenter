/* english-ime-gate.js - block spell tests until English IME is confirmed */
(function () {
  "use strict";

  var PROBE = "test";
  var CHEAT_LIMIT = 3; // ponytail: vượt qua 3 tiếp theo giữa chừng trúng mục tiêu ngôn ngữ IME → Thứ 4 tiếp theo phân biệt thực hành gian lận
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
        '<p class="ime-gate-strikes">đã chuyển đổi ngôn ngữ Trung Quốc phương pháp nhập <strong>' + strikes + "</strong> tiếp theo " +
        (strikes >= CHEAT_LIMIT
          ? "(một lần nữa chuyển đổi sẽ trở nên không hiệu lực gốc tiếp theo kiểm tra)"
          : "(vượt qua " + CHEAT_LIMIT + " tiếp theo sẽ trở nên không hiệu lực gốc tiếp theo kiểm tra)") +
        "</p>";
    }
    overlay = document.createElement("div");
    overlay.className = "yysd-ime-gate";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "ime-gate-title");
    overlay.innerHTML =
      '<div class="ime-gate-panel">' +
        '<h2 id="ime-gate-title">yêu cầu điều chuyển toàn bộ thành công tiếng Anh nhập khẩu chế độ</h2>' +
        (isViolation
          ? '<p class="ime-gate-lead ime-gate-lead--warn">phát hiện đến ngôn ngữ Trung Quốc phương pháp nhập, mời chuyển đổi xoay vòng tiếng Anh hoàng hậu lại tiếp tục kiểm tra </p>'
          : '<p class="ime-gate-lead">từ phát hiện yêu cầu sử dụng tiếng Anh phương pháp nhập ngôn ngữ Trung Quốc phương pháp nhập của tiếng Anh Lenovo có thể tự động sửa tất cả, không thể sử dụng trong đánh vần </p>') +
        strikeHint +
        '<p class="ime-gate-tip">Mac: Caps Lock hoặc Control+Space chuyển đổi đến ABC/tiếng Anh<br>' +
        "Windows: Shift hoặc Win+Space chuyển đổi đến ENG</p>" +
        '<p class="ime-gate-probe-label">mời bên dưới<strong>theo đuổi chữ</strong>nhập khẩu <code>test</code> biến thể cũ của xác nhận: </p>' +
        '<div class="ime-gate-progress"></div>' +
        '<input type="text" class="ime-gate-input yysd-en-spell" id="ime-gate-probe" ' +
          'autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" ' +
          'lang="en" inputmode="latin" aria-label=" nhập khẩu test xác nhận tiếng Anh phương pháp nhập " />' +
        '<p class="ime-gate-err" hidden></p>' +
      "</div>";
    document.body.appendChild(overlay);
    document.body.classList.add("yysd-ime-gate-open");
    document.addEventListener("keydown", trapTab, true);

    var input = overlay.querySelector("#ime-gate-probe");
    resetProbe(input);

    input.addEventListener("compositionstart", function () {
      composing = true;
      showError(" phát hiện đến ngôn ngữ Trung Quốc phương pháp nhập, mời chuyển đổi đến tiếng Anh phương pháp nhập ");
      resetProbe(input);
    });

    input.addEventListener("compositionend", function () {
      composing = false;
      if (input.value) {
        showError(" phát hiện đến ngôn ngữ Trung Quốc phương pháp nhập, mời chuyển đổi đến tiếng Anh phương pháp nhập ");
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
        showError(" phát hiện đến ngôn ngữ Trung Quốc phương pháp nhập, mời chuyển đổi đến tiếng Anh phương pháp nhập ");
        resetProbe(input);
        return;
      }
      if (t === "insertText" && e.data != null) {
        if (e.data.length !== 1 || /[^a-zA-Z]/.test(e.data)) {
          e.preventDefault();
          if (/[\u4e00-\u9fff]/.test(e.data)) {
            showError(" mời sử dụng tiếng Anh phương pháp nhập ");
            resetProbe(input);
          }
          return;
        }
        if (e.data.toLowerCase() !== PROBE[probeIdx]) {
          e.preventDefault();
          showError(" mời nhấn trình tự theo đuổi chữ nhập khẩu test");
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
      showError(" mời thủ công theo đuổi chữ nhập khẩu, không thể dán ");
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
        '<h2 id="ime-cheat-title">phát hiện đến thực hành gian lận hành động</h2>' +
        '<p class="ime-gate-lead ime-gate-lead--warn">kiểm tra giữa chừng nhiều lần chuyển đổi đến ngôn ngữ Trung Quốc phương pháp nhập(đã vượt qua ' +
          CHEAT_LIMIT + " tiếp theo), gốc tiếp theo trả lời không hợp lệ </p>" +
        '<p class="ime-gate-tip">mời sử dụng tiếng Anh phương pháp nhập hoàn thành đánh vần có sẵn lựa chọn tiếp tục, có thể rút lui gốc tiếp theo kiểm tra </p>' +
        '<div class="ime-gate-actions">' +
          '<button type="button" class="vl-btn vl-btn-primary" id="ime-cheat-restart">Bắt đầu lại</button>' +
          '<button type="button" class="vl-btn" id="ime-cheat-exit">rút lui kiểm tra</button>' +
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
