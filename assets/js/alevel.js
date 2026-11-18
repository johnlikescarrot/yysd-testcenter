/* =========================================================================
   alevel.js — exam board hub (CAIE / Edexcel / Oxford AQA)
   ========================================================================= */
(function () {
  "use strict";
  var Y = window.YYSD;
  var A = window.YYSD_ALEVEL;
  var contentEl = document.getElementById("content");
  var board = (new URLSearchParams(location.search).get("board") || "caie").trim();

  document.title = "Kho đề A-Level · Trung tâm YYSD";
  document.getElementById("year").textContent = new Date().getFullYear();

  function render(catalog) {
    var qp = A.qpCount(catalog);
    var current = A.boardOf(catalog, board) || catalog.boards[0];
    if (current && current.id !== board) {
      board = current.id;
    }
    var boardLabel = current ? (current.labelVi || current.label) : "A-Level";

    var crumb = '<div class="minimal-crumb cam-crumb">' +
      '<a href="index.html">Trang chủ</a> <span class="crumb-sep" aria-hidden="true">★</span> ' +
      '<span>Chương trình quốc tế</span> <span class="crumb-sep" aria-hidden="true">★</span> ' +
      "Kho đề A-Level</div>";

    var hero = '<div class="cam-hero alevel-hero">' +
      '<div class="cam-hero__badge alevel-hero__badge"><div class="lbl">A-LEVEL</div><div class="num">📚</div></div>' +
      "<div><h1>Đề A-Level các năm</h1>" +
      '<div class="meta">CAIE · Edexcel · Oxford AQA · đã có ' + qp + " bộ đề · Xem và tải miễn phí</div></div></div>";

    var tabs = (catalog.boards || []).map(function (b) {
      var active = b.id === board;
      var empty = !b.subjects || !b.subjects.length;
      return '<button type="button" class="alevel-board-tab' + (active ? " is-active" : "") +
        (empty ? " is-soon" : "") + '" data-board="' + Y.esc(b.id) + '"' +
        (empty ? ' disabled title="Đang chuẩn bị"' : "") + ">" +
        Y.esc(b.labelVi || b.label) + "</button>";
    }).join("");

    contentEl.innerHTML = crumb + hero +
      '<div class="alevel-board-tabs" role="tablist">' + tabs + "</div>" +
      '<div class="alevel-board-heading"><span class="subject-dot"></span><h2>' + Y.esc(boardLabel) + "</h2></div>" +
      A.hubBoardHTML(catalog, board, "") +
      '<p class="alevel-footnote">Đề và hướng dẫn chấm hiện được cung cấp miễn phí. Lời giải chi tiết dự kiến là tính năng trả phí trong phiên bản sau.</p>';
  }

  contentEl.addEventListener("click", function (e) {
    var tab = e.target.closest(".alevel-board-tab:not(.is-soon)");
    if (!tab) return;
    var next = tab.getAttribute("data-board");
    if (next && next !== board) {
      location.href = "alevel.html?board=" + encodeURIComponent(next);
    }
  });

  A.loadCatalog().then(render).catch(function (err) {
    var msg = location.protocol === "file:"
      ? "Hãy mở trang qua máy chủ HTTP thay vì mở trực tiếp tệp HTML."
      : err.message;
    contentEl.innerHTML = '<div class="state state--brand"><h3>Không tải được tài liệu</h3><p>' + Y.esc(msg) + "</p></div>";
  });
})();
