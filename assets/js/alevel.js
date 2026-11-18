/* =========================================================================
   alevel.js — exam board hub (CAIE / Edexcel / Oxford AQA)
   ========================================================================= */
(function () {
  "use strict";
  var Y = window.YYSD;
  var A = window.YYSD_ALEVEL;
  var contentEl = document.getElementById("content");
  var board = (new URLSearchParams(location.search).get("board") || "caie").trim();

  document.title = "A-Level thực Ngân hàng đề · Trung tâm Luyện thi Quốc tế YYSD ";
  document.getElementById("year").textContent = new Date().getFullYear();

  function render(catalog) {
    var qp = A.qpCount(catalog);
    var current = A.boardOf(catalog, board) || catalog.boards[0];
    if (current && current.id!== board) {
      board = current.id;
    }
    var boardLabel = current? (current.labelZh || current.label): "A-Level";

    var crumb = '<div class="minimal-crumb cam-crumb">' +
      '<a href="index.html"> Trang chủ </a> <span class="crumb-sep" aria-hidden="true">★</span> ' +
      '<span> Chương trình quốc tế </span> <span class="crumb-sep" aria-hidden="true">★</span> ' +
      "A-Level thực Ngân hàng đề </div>";

    var hero = '<div class="cam-hero alevel-hero">' +
      '<div class="cam-hero__badge alevel-hero__badge"><div class="lbl">A-LEVEL</div><div class="num">📚</div></div>' +
      "<div><h1>A-Level đề thi các năm </h1>" +
      '<div class="meta">CAIE · Edexcel · Oxford AQA · đã thu nhận sử dụng ' + qp + " bộ đề thi thật · miễn phí Xem trước download </div></div></div>";

    var tabs = (catalog.boards || []).map(function (b) {
      var active = b.id === board;
      var empty =!b.subjects ||!b.subjects.length;
      return '<button type="button" class="alevel-board-tab' + (active? " is-active": "") +
        (empty? " is-soon": "") + '" data-board="' + Y.esc(b.id) + '"' +
        (empty? ' disabled title=" Đang chuẩn bị "': "") + ">" +
        Y.esc(b.labelZh || b.label) + "</button>";
    }).join("");

    contentEl.innerHTML = crumb + hero +
      '<div class="alevel-board-tabs" role="tablist">' + tabs + "</div>" +
      '<div class="alevel-board-heading"><span class="subject-dot"></span><h2>' + Y.esc(boardLabel) + "</h2></div>" +
      A.hubBoardHTML(catalog, board, "") +
      '<p class="alevel-footnote"> Lời giải chi tiết và hướng dẫn từng bước sẽ được mở trong các phiên bản tiếp theo; hiện tại đề thi thật và Mark Scheme đều có thể sử dụng miễn phí. </p>';
  }

  contentEl.addEventListener("click", function (e) {
    var tab = e.target.closest(".alevel-board-tab:not(.is-soon)");
    if (!tab) return;
    var next = tab.getAttribute("data-board");
    if (next && next!== board) {
      location.href = "alevel.html?board=" + encodeURIComponent(next);
    }
  });

  A.loadCatalog().then(render).catch(function (err) {
    var msg = location.protocol === "file:"
      ? " xin thông qua địa chỉ Internet (http://) truy cập trang web, bản địa double-click mở ra sẽ bị trình duyệt chặn đường. "
      : err.message;
    contentEl.innerHTML = '<div class="state state--brand"><h3> Tải dữ liệu thất bại </h3><p>' + Y.esc(msg) + "</p></div>";
  });
})();
