/* Khởi tạo dịch tiếng Việt trên trình duyệt: dịch DOM hiện tại và nội dung nạp động. */
(function () {
  "use strict";
  var core = window.YYSD_I18N_VI;
  if (!core) return;
  function translateTree(root) {
    if (!root || !document.createTreeWalker) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), node;
    while ((node = walker.nextNode())) {
      var tag = node.parentNode && node.parentNode.tagName;
      if (/^(SCRIPT|STYLE|CODE|PRE)$/.test(tag || "")) continue;
      node.nodeValue = core.translateText(node.nodeValue);
    }
    if (root.querySelectorAll) root.querySelectorAll("[placeholder],[title],[aria-label]").forEach(function (el) {
      ["placeholder", "title", "aria-label"].forEach(function (a) {
        if (el.hasAttribute(a)) el.setAttribute(a, core.translateText(el.getAttribute(a)));
      });
    });
  }
  function init() {
    document.documentElement.lang = "vi";
    document.title = core.translateText(document.title);
    translateTree(document.body);
    new MutationObserver(function (ms) {
      ms.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.nodeType === 1) translateTree(n); }); });
    }).observe(document.body, { childList: true, subtree: true });
  }
  window.YYSD_I18N_VI_INIT = init;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
