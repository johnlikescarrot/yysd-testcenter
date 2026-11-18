/* english-ime-gate.js — block spell tests until English IME is confirmed */
(function () {
  "use strict";

  var PROBE = "test";
  var CHEAT_LIMIT = 3; // ponytail: vượt qua 3 lần trên đường đánh trúng văn IME → thứ 4 lần phán ăn gian
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
    if (!overlay || e.key!== "Tab") return;
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
    el.hidden =!msg;
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
        '<p class="ime-gate-strikes"> đã hoán đổi Tiếng Việt đưa vào cú pháp <strong>' + strikes + "</strong> lần " +
        (strikes >= CHEAT_LIMIT
          ? " (lần nữa hoán đổi đem hết hiệu lực lần này Kiểm tra) "
          : " (vượt qua " + CHEAT_LIMIT + " lần đem hết hiệu lực lần này Kiểm tra) ") +
        "</p>";
    }
    overlay = document.createElement("div");
    overlay.className = "yysd-ime-gate";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "ime-gate-title");
    overlay.innerHTML =
      '<div class="ime-gate-panel">' +
        '<h2 id="ime-gate-title"> mời điều chỉnh thành Tiếng Anh đưa vào hình thức </h2>' +
        (isViolation
          ? '<p class="ime-gate-lead ime-gate-lead--warn"> Đánh giá đến Tiếng Việt đưa vào cú pháp, mời hoán đổi quay về Tiếng Anh sau lại Tiếp tục Kiểm tra. </p>'
          : '<p class="ime-gate-lead"> Từ vựng Đánh giá yêu cầu sử dụng Tiếng Anh đưa vào cú pháp. Tiếng Việt đưa vào cú pháp Tiếng Anh liên tưởng sẽ tự động bổ toàn, không cách nào dùng cho Chính tả. </p>') +
        strikeHint +
        '<p class="ime-gate-tip">Mac: Caps Lock hoặc Control+Space hoán đổi đến ABC/ Tiếng Anh <br>' +
        "Windows: Shift hoặc Win+Space hoán đổi đến ENG</p>" +
        '<p class="ime-gate-probe-label"> mời tại phía dưới <strong> chữ trục </strong> đưa vào <code>test</code> dùng Xác nhận: </p>' +
        '<div class="ime-gate-progress"></div>' +
        '<input type="text" class="ime-gate-input yysd-en-spell" id="ime-gate-probe" ' +
          'autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" ' +
          'lang="en" inputmode="latin" aria-label=" đưa vào test Xác nhận Tiếng Anh đưa vào cú pháp " />' +
        '<p class="ime-gate-err" hidden></p>' +
      "</div>";
    document.body.appendChild(overlay);
    document.body.classList.add("yysd-ime-gate-open");
    document.addEventListener("keydown", trapTab, true);

    var input = overlay.querySelector("#ime-gate-probe");
    resetProbe(input);

    input.addEventListener("compositionstart", function () {
      composing = true;
      showError(" Đánh giá đến Tiếng Việt đưa vào cú pháp, mời hoán đổi đến Tiếng Anh đưa vào cú pháp ");
      resetProbe(input);
    });

    input.addEventListener("compositionend", function () {
      composing = false;
      if (input.value) {
        showError(" Đánh giá đến Tiếng Việt đưa vào cú pháp, mời hoán đổi đến Tiếng Anh đưa vào cú pháp ");
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
        showError(" Đánh giá đến Tiếng Việt đưa vào cú pháp, mời hoán đổi đến Tiếng Anh đưa vào cú pháp ");
        resetProbe(input);
        return;
      }
      if (t === "insertText" && e.data!= null) {
        if (e.data.length!== 1 || /[^a-zA-Z]/.test(e.data)) {
          e.preventDefault();
          if (/[^\x00-\x7F]/.test(e.data)) {
            showError(" xin sử dụng Tiếng Anh đưa vào cú pháp ");
            resetProbe(input);
          }
          return;
        }
        if (e.data.toLowerCase()!== PROBE[probeIdx]) {
          e.preventDefault();
          showError(" xin nhấn trình tự chữ trục đưa vào test");
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
      showError(" mời chủ động chữ trục đưa vào, không thể dán ");
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
        '<h2 id="ime-cheat-title"> Đánh giá đến hành vi ăn gian </h2>' +
        '<p class="ime-gate-lead ime-gate-lead--warn"> trong khảo nghiệm đồ nhiều lần hoán đổi đến Tiếng Việt đưa vào cú pháp (đã vượt qua ' +
          CHEAT_LIMIT + " lần), câu trả lời lần này không hợp lệ. </p>" +
        '<p class="ime-gate-tip"> xin sử dụng Tiếng Anh đưa vào cú pháp hoàn thành Chính tả. có thể chọn chọn bắt đầu lại, hoặc Đăng xuất lần này Kiểm tra. </p>' +
        '<div class="ime-gate-actions">' +
          '<button type="button" class="vl-btn vl-btn-primary" id="ime-cheat-restart"> bắt đầu lại </button>' +
          '<button type="button" class="vl-btn" id="ime-cheat-exit"> Đăng xuất Kiểm tra </button>' +
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
    return!!overlay;
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
