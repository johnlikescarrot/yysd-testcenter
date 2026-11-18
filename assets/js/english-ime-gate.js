/* english-ime-gate.js — block spell tests until English IME is confirmed */
(function () {
  "use strict";

  var PROBE = "test";
  var CHEAT_LIMIT = 3; // ponytail: vượt qua 3 tiếp theogiữa chừngtrúng mục tiêu đặc biệt trong tranh luậnhọ IME →  4 tiếp theo dạng kết hợp phân biệtthực hành gian lận
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
        '<p class="ime-gate-strikes">đãchuyển đổiTiếng Trungphương pháp nhập <strong>' + strikes + "</strong> tiếp theo" +
        (strikes >= CHEAT_LIMIT
          ? "(một lần nữachuyển đổisẽtrở nên không hiệu lựchình thức kết hợp gốc tiếp theoBài kiểm tra)"
          : "(vượt qua " + CHEAT_LIMIT + " tiếp theo sẽtrở nên không hiệu lựchình thức kết hợp gốc tiếp theoBài kiểm tra)") +
        "</p>";
    }
    overlay = document.createElement("div");
    overlay.className = "yysd-ime-gate";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "ime-gate-title");
    overlay.innerHTML =
      '<div class="ime-gate-panel">' +
        '<h2 id="ime-gate-title">yêu cầu điều chuyểnhình thức liên kết toàn bộ họTiếng Anhnhập khẩuchế độ</h2>' +
        (isViolation
          ? '<p class="ime-gate-lead ime-gate-lead--warn">phát hiệnđếnTiếng Trungphương pháp nhập,mờichuyển đổixoay vòngTiếng Anhhọ lạiTiếp tụcBài kiểm tra.</p>'
          : '<p class="ime-gate-lead">Từ vựngphát hiệnYêu cầusử dụngTiếng Anhphương pháp nhập.Tiếng Trungphương pháp nhậpTiếng Anhliên tưởng về mặt nhận thứccó thểtự độngsửa họ,không thểsử dụng trongđánh vần.</p>') +
        strikeHint +
        '<p class="ime-gate-tip">Mac:Caps Lock có thể Control+Space chuyển đổiđến ABC/Tiếng Anh<br>' +
        "Windows:Shift có thể Win+Space chuyển đổiđến ENG</p>" +
        '<p class="ime-gate-probe-label">mờibên dưới<strong>hình thức kết hợp theo đuổi chữ</strong>nhập khẩu <code>test</code> biến thể cũ củaXác nhận:</p>' +
        '<div class="ime-gate-progress"></div>' +
        '<input type="text" class="ime-gate-input yysd-en-spell" id="ime-gate-probe" ' +
          'autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" ' +
          'lang="en" inputmode="latin" aria-label="nhập khẩu test Xác nhậnTiếng Anhphương pháp nhập" />' +
        '<p class="ime-gate-err" hidden></p>' +
      "</div>";
    document.body.appendChild(overlay);
    document.body.classList.add("yysd-ime-gate-open");
    document.addEventListener("keydown", trapTab, true);

    var input = overlay.querySelector("#ime-gate-probe");
    resetProbe(input);

    input.addEventListener("compositionstart", function () {
      composing = true;
      showError("phát hiệnđếnTiếng Trungphương pháp nhập,mờichuyển đổiđếnTiếng Anhphương pháp nhập");
      resetProbe(input);
    });

    input.addEventListener("compositionend", function () {
      composing = false;
      if (input.value) {
        showError("phát hiệnđếnTiếng Trungphương pháp nhập,mờichuyển đổiđếnTiếng Anhphương pháp nhập");
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
        showError("phát hiệnđếnTiếng Trungphương pháp nhập,mờichuyển đổiđếnTiếng Anhphương pháp nhập");
        resetProbe(input);
        return;
      }
      if (t === "insertText" && e.data != null) {
        if (e.data.length !== 1 || /[^a-zA-Z]/.test(e.data)) {
          e.preventDefault();
          if (/[\u4e00-\u9fff]/.test(e.data)) {
            showError("mờisử dụngTiếng Anhphương pháp nhập");
            resetProbe(input);
          }
          return;
        }
        if (e.data.toLowerCase() !== PROBE[probeIdx]) {
          e.preventDefault();
          showError("mời nhấntrình tựhình thức kết hợp theo đuổi chữnhập khẩu test");
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
      showError("mờithủ cônghình thức kết hợp theo đuổi chữnhập khẩu,không thểdán");
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
        '<h2 id="ime-cheat-title">phát hiệnđếnthực hành gian lậnhành động</h2>' +
        '<p class="ime-gate-lead ime-gate-lead--warn">Bài kiểm tragiữa chừngnhiều lầnchuyển đổiđếnTiếng Trungphương pháp nhập(đãvượt qua ' +
          CHEAT_LIMIT + " tiếp theo),hình thức kết hợp gốc tiếp theotrả lờikhông hợp lệ.</p>" +
        '<p class="ime-gate-tip">mờisử dụngTiếng Anhphương pháp nhậpHoàn thànhđánh vần.có sẵnlựa chọntiếp tục,có thểĐăng xuấthình thức kết hợp gốc tiếp theoBài kiểm tra.</p>' +
        '<div class="ime-gate-actions">' +
          '<button type="button" class="vl-btn vl-btn-primary" id="ime-cheat-restart">tiếp tục</button>' +
          '<button type="button" class="vl-btn" id="ime-cheat-exit">Đăng xuấtBài kiểm tra</button>' +
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
