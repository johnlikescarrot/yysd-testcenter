/* =========================================================================
   ui.js — premium motion: hero stagger, reveal, count-up, parallax, swap
   ========================================================================= */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (document.querySelector(".stagger-in") && !reduced) {
    requestAnimationFrame(function () {
      document.body.classList.add("is-motion-ready");
    });
  } else {
    document.body.classList.add("is-motion-ready");
  }

  var topbar = document.querySelector(".minimal-topbar");
  if (topbar) {
    function onScroll() {
      topbar.classList.toggle("is-scrolled", window.scrollY > 48);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  var revealIO;
  function bindReveal(els) {
    if (!("IntersectionObserver" in window) || !els || !els.length) return;
    if (!revealIO) {
      revealIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-visible");
          revealIO.unobserve(e.target);
        });
      }, { threshold: 0.1, rootMargin: "0px 0px -32px 0px" });
    }
    els.forEach(function (el, i) {
      if (el.classList.contains("is-visible")) return;
      if (!el.style.getPropertyValue("--reveal-delay")) {
        el.style.setProperty("--reveal-delay", String((i % 8) * 70) + "ms");
      }
      revealIO.observe(el);
    });
  }
  window.YYSD_UI_REVEAL = bindReveal;
  bindReveal(document.querySelectorAll(".reveal"));

  if ("IntersectionObserver" in window) {
    function countUp(el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      if (!target || isNaN(target)) { el.textContent = "0"; return; }
      var suffix = el.getAttribute("data-suffix") || "";
      var start = performance.now();
      function tick(now) {
        var p = Math.min((now - start) / 900, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      el.textContent = "0";
      requestAnimationFrame(tick);
    }
    window.YYSD_UI_COUNTUP = countUp;

    document.querySelectorAll("[data-count]").forEach(function (el) {
      var sio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          countUp(e.target);
          sio.unobserve(e.target);
        });
      }, { threshold: 0.4 });
      sio.observe(el);
    });
  }

  var wm = document.querySelector(".hero-motifs");
  if (wm && !reduced) {
    var parallaxPending = false;
    window.addEventListener("scroll", function () {
      if (parallaxPending) return;
      parallaxPending = true;
      requestAnimationFrame(function () {
        wm.style.transform = "translateY(" + (window.scrollY * 0.06) + "px)";
        parallaxPending = false;
      });
    }, { passive: true });
  }

  window.YYSD_UI_SWAP = function (el, html) {
    if (!el) return;
    if (reduced) { el.innerHTML = html; return; }
    el.classList.add("is-swapping");
    setTimeout(function () {
      el.innerHTML = html;
      el.classList.remove("is-swapping");
      bindReveal(el.querySelectorAll(".reveal"));
    }, 160);
  };

  window.YYSD_DEBOUNCE = function (fn, ms) {
    var t;
    return function () {
      var args = arguments;
      var self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, ms || 200);
    };
  };

  document.addEventListener("keydown", function (e) {
    var wrap = null;
    var sel = "";
    if (document.querySelector(".test-tabs") && document.querySelector(".test-tabs").contains(document.activeElement)) {
      wrap = document.querySelector(".test-tabs");
      sel = ".test-tab";
    } else if (document.querySelector(".vocab-range-chips") && document.querySelector(".vocab-range-chips").contains(document.activeElement)) {
      wrap = document.querySelector(".vocab-range-chips");
      sel = ".vocab-range-chip";
    }
    if (!wrap || !sel) return;
    var btns = [].slice.call(wrap.querySelectorAll(sel));
    var idx = btns.indexOf(document.activeElement);
    if (idx < 0) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      btns[(idx + 1) % btns.length].click();
      btns[(idx + 1) % btns.length].focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      btns[(idx - 1 + btns.length) % btns.length].click();
      btns[(idx - 1 + btns.length) % btns.length].focus();
    }
  });
})();

/* Shared portal surfaces. Native exam dialogs inside timed papers are separate. */
(function () {
  "use strict";
  var script = document.currentScript;
  var cssHref = new URL("../css/confirm.css", script && script.src || new URL("assets/js/ui.js", document.baseURI)).href;
  var timers = new WeakMap();
  var sources = new WeakMap();
  var lastPtr = null;
  document.addEventListener("pointerdown", function (e) {
    lastPtr = { target: e.target, x: e.clientX, y: e.clientY };
  }, true);

  function anchorPanel(panel, source) {
    if (!panel || !source) return;
    var bounds = panel.getBoundingClientRect();
    var from = source.getBoundingClientRect();
    var hit = lastPtr && source.contains(lastPtr.target) ? lastPtr : { x: from.x + from.width / 2, y: from.y + from.height / 2 };
    panel.style.transformOrigin = Math.max(0, Math.min(bounds.width, hit.x - bounds.x)) + "px " +
      Math.max(0, Math.min(bounds.height, hit.y - bounds.y)) + "px";
  }

  window.YYSD_SURFACE = function (el, open, trigger) {
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    clearTimeout(timers.get(el));
    el.setAttribute("data-surface", "");
    if (open) {
      var source = trigger || document.activeElement;
      sources.set(el, source);
      if (source && source !== document.body) source.classList.add("is-surface-source");
      el.hidden = false;
      el.inert = false;
      anchorPanel(el.querySelector(".cal-modal__panel"), source);
      // Read after unhiding so an opening transition can reverse a closing one.
      el.getBoundingClientRect();
      el.classList.add("is-open");
    } else {
      el.classList.remove("is-open");
      el.inert = true;
      var origin = sources.get(el);
      if (origin) {
        origin.classList.remove("is-surface-source");
        if (origin.isConnected && origin !== document.body) origin.focus();
      }
      sources.delete(el);
      var hide = function () { el.hidden = true; timers.delete(el); };
      if (reduced) hide();
      else timers.set(el, setTimeout(hide, 180));
    }
  };

  // A sheet can be dismissed using its close button, Escape or a short flick of
  // its grip. Never take over scrolling, selection, or gestures in the content.
  function projectY(dy, elapsed) { return dy + 90 * dy / Math.max(32, elapsed); }
  window.YYSD_BIND_SHEET = function (panel, dismiss) {
    if (!panel || panel.querySelector(".cal-sheet-grip")) return;
    var grip = document.createElement("div");
    grip.className = "cal-sheet-grip";
    grip.setAttribute("aria-hidden", "true");
    panel.prepend(grip);
    var drag;
    grip.addEventListener("pointerdown", function (e) {
      drag = { y: e.clientY, start: e.timeStamp, id: e.pointerId };
      grip.setPointerCapture(e.pointerId);
    });
    grip.addEventListener("pointermove", function (e) {
      if (drag && drag.id === e.pointerId) panel.style.translate = "0 " + Math.max(0, e.clientY - drag.y) + "px";
    });
    function end(e) {
      if (!drag || drag.id !== e.pointerId) return;
      var dy = Math.max(0, e.clientY - drag.y);
      var close = e.type === "pointerup" && dy >= 24 && projectY(dy, e.timeStamp - drag.start) > 96;
      drag = null;
      panel.style.removeProperty("translate");
      if (close) dismiss();
    }
    grip.addEventListener("pointerup", end);
    grip.addEventListener("pointercancel", end);
  };

  function ask(message, alertOnly) {
    if (document.querySelector("dialog.yysd-decision[open]")) return Promise.resolve(false);
    if (!document.getElementById("yysd-confirm-css")) {
      var css = document.createElement("link");
      css.id = "yysd-confirm-css";
      css.rel = "stylesheet";
      css.href = cssHref;
      document.head.appendChild(css);
    }
    var dialog = document.createElement("dialog");
    dialog.className = "yysd-decision cal-modal--confirm";
    dialog.setAttribute("aria-labelledby", "yysd-decision-title");
    dialog.setAttribute("aria-describedby", "yysd-decision-message");
    var title = document.createElement("h2");
    title.id = "yysd-decision-title";
    title.textContent = alertOnly ? "Thông báo" : "Xác nhận";
    var body = document.createElement("p");
    body.id = "yysd-decision-message";
    body.textContent = message;
    var form = document.createElement("form");
    form.method = "dialog";
    function choice(value, label) {
      var b = document.createElement("button");
      b.type = "submit";
      b.value = value;
      b.textContent = label;
      form.appendChild(b);
    }
    if (!alertOnly) choice("no", "Hủy");
    choice("yes", alertOnly ? "Đóng" : "Đồng ý");
    dialog.append(title, body, form);
    document.body.appendChild(dialog);
    return new Promise(function (resolve) {
      dialog.addEventListener("close", function () {
        var accepted = dialog.returnValue === "yes";
        dialog.remove();
        resolve(accepted);
      }, { once: true });
      dialog.showModal();
    });
  }
  window.YYSD_CONFIRM = function (message) { return ask(message, false); };
  window.YYSD_ALERT = function (message) { return ask(message, true); };
  window.YYSD_ASK = window.YYSD_CONFIRM;
})();
