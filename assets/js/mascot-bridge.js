/* =========================================================================
   mascot-bridge.js - per-answer hints from study/practice iframes (not mock)
   ponytail: DOM observers - no edits to hundreds of LIST/practice HTML files
   ========================================================================= */
(function () {
  "use strict";

  function postHint(result) {
    try {
      window.parent.postMessage({ type: "yysd:mascot-hint", result: result }, "*");
    } catch (e) { /* ponytail: iframe edge */ }
  }

  function watchVocabFeedback() {
    var fb = document.getElementById("testFeedback");
    if (!fb) return;
    new MutationObserver(function () {
      if (!fb.classList.contains("visible")) return;
      if (fb.classList.contains("correct-all")) postHint("correct");
      else if (fb.classList.contains("wrong-all")) postHint("wrong");
      else if (fb.classList.contains("partial")) {
        var html = fb.innerHTML || fb.textContent || "";
        if (html.indexOf(" ý nghĩa đúng, đánh vần có nhầm lỗi ") >= 0) postHint("partial-spelling");
        else if (html.indexOf(" đánh vần đúng, ý nghĩa có nhầm lỗi ") >= 0) postHint("partial-meaning");
        else postHint("partial");
      }
    }).observe(fb, { attributes: true, attributeFilter: ["class"] });
  }

  function watchPracticeVerdict() {
    var v = document.querySelector(".verdict");
    if (!v) return;
    new MutationObserver(function () {
      if (!v.classList.contains("show")) return;
      postHint(v.classList.contains("ok") ? "pass" : "fail");
    }).observe(v, { attributes: true, attributeFilter: ["class"] });
  }

  function watchQuizResult() {
    var r = document.getElementById("result");
    if (!r) return;
    var sent = false;
    new MutationObserver(function () {
      if (sent || r.style.display === "none") return;
      var txt = r.textContent || "";
      if (txt.indexOf(" Điểm số ") < 0) return;
      var m = txt.match(/Điểm số\s*(\d+)\s*\/\s*(\d+)/);
      if (!m) return;
      sent = true;
      var ratio = +m[1] / +m[2];
      if (ratio >= 1) postHint("correct");
      else if (ratio >= 0.6) postHint("pass");
      else postHint("fail");
    }).observe(r, { attributes: true, childList: true, characterData: true, subtree: true });
  }

  function watchLongSentenceFeedback() {
    if (!document.querySelector(".sentence-card")) return;
    document.querySelectorAll(".ref-answer").forEach(function (el) {
      new MutationObserver(function () {
        if (el.style.display === "block") postHint("pass");
      }).observe(el, { attributes: true, attributeFilter: ["style"] });
    });
  }

  function boot() {
    watchVocabFeedback();
    watchPracticeVerdict();
    watchQuizResult();
    watchLongSentenceFeedback();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
