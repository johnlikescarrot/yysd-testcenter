/* =========================================================================
   alevel-subject.js - CAIE: học làm đắt-style accordion list (câu hỏi từ đề thi các năm trước tài liệu)
   Other boards: flat year/season table
   ========================================================================= */
(function () {
  "use strict";
  var Y = window.YYSD;
  var A = window.YYSD_ALEVEL;
  var P = window.YYSD_ALEVEL_PAPERS;
  var params = new URLSearchParams(location.search);
  var board = (params.get("board") || "caie").trim();
  var code = (params.get("code") || "").trim();
  var contentEl = document.getElementById("content");

  var activeYear = params.get("year") || "all";
  var activeLevel = params.get("level") || "all";
  var activeSeason = "all";
  var activeComponent = "all";

  document.getElementById("year").textContent = new Date().getFullYear();
  var navLink = document.querySelector('#nav a[data-zone="mock"]');
  if (navLink) navLink.classList.add("is-active");

  var subject, allItems, boardMeta;
  var isCaie = board === "caie" && !!P.schema(code);

  function absoluteUrl(path) {
    return new URL(path, location.href).href;
  }

  function filteredItems() {
    return allItems.filter(function (it) {
      if (activeYear !== "all" && String(it.year) !== activeYear) return false;
      if (!isCaie && activeSeason !== "all" && it.season !== activeSeason) return false;
      if (!isCaie && activeComponent !== "all" &&
          String(P.paperDigit(it.paper)) !== activeComponent) return false;
      if (isCaie && P.filterMode(code) === "component") {
        if (!P.matchesComponent(code, it.paper, activeComponent)) return false;
      } else if (isCaie) {
        if (!P.matchesLevel(code, it.paper, activeLevel)) return false;
      }
      return true;
    });
  }

  function actionBtns(item, label) {
    if (!item) return '<span class="alevel-xwg-missing">tạm thời không có</span>';
    var view = A.viewHref(item, "");
    var dl = A.fileHref(item, "");
    return '<a class="alevel-xwg-btn" href="' + view + '">xem xét</a>' +
      '<a class="alevel-xwg-btn" href="' + dl + '" download target="_blank" rel="noopener">Tải xuống</a>' +
      '<button type="button" class="alevel-xwg-btn alevel-xwg-btn--share" data-share-url="' +
        Y.esc(dl) + '" data-share-title="' + Y.esc(label) + '">chia sẻ</button>';
  }

  function renderXwgFilters(components) {
    var years = A.yearsFor(allItems, null);
    var yearChips = '<button type="button" class="chip' + (activeYear === "all" ? " is-active" : "") +
      '" data-year="all">không giới hạn</button>';
    years.slice(0, 6).forEach(function (y) {
      yearChips += '<button type="button" class="chip' + (activeYear === String(y) ? " is-active" : "") +
        '" data-year="' + y + '">' + y + "</button>";
    });

    var row2 = "";
    if (P.filterMode(code) === "component") {
      var comps = components && components.length ? components : P.componentsPresent(code, allItems);
      row2 = '<button type="button" class="chip' + (activeComponent === "all" ? " is-active" : "") +
        '" data-component="all">không giới hạn</button>';
      comps.forEach(function (c) {
        row2 += '<button type="button" class="chip chip--paper' +
          (activeComponent === String(c.d) ? " is-active" : "") +
          '" data-component="' + c.d + '" title="' + Y.esc(c.nameZh) + '">' +
          Y.esc(c.short) + "</button>";
      });
    } else {
      var levels = [
        { id: "all", label: " không giới hạn " },
        { id: "as", label: "AS" },
        { id: "a2", label: "A2" }
      ];
      row2 = levels.map(function (lv) {
        return '<button type="button" class="chip' + (activeLevel === lv.id ? " is-active" : "") +
          '" data-level="' + lv.id + '">' + lv.label + "</button>";
      }).join("");
    }

    return '<div class="alevel-xwg-filters">' +
      '<div class="alevel-xwg-filter-row alevel-xwg-filter-row--scroll">' + yearChips + "</div>" +
      '<div class="alevel-xwg-filter-row alevel-xwg-filter-row--scroll">' + row2 + "</div>" +
      "</div>";
  }

  function renderXwgList(rows) {
    if (!rows.length) {
      return '<div class="soon-box">tạm thời không có bài thi, yêu cầu điều chuyển toàn bộ lọc </div>';
    }
    var html = rows.map(function (row, i) {
      var fname = P.displayFilename("QP", subject.name, row.year, row.season, row.paper);
      var msLabel = row.ms
        ? P.displayFilename("MS", subject.name, row.year, row.season, row.paper)
        : " Đáp án ";
      return '<details class="alevel-xwg-item"' + (i === 0 ? " open" : "") + ">" +
        '<summary class="alevel-xwg-item__summary">' +
          '<span class="alevel-xwg-item__text">' +
            '<span class="alevel-xwg-item__name">' + Y.esc(fname) + "</span>" +
            '<span class="alevel-xwg-item__sub">' + Y.esc(P.rowSubtitle(row.code, row.paper)) + "</span>" +
          "</span>" +
          '<span class="alevel-xwg-item__chev" aria-hidden="true"></span>' +
        "</summary>" +
        '<div class="alevel-xwg-panel">' +
          '<div class="alevel-xwg-row">' +
            '<span class="alevel-xwg-row__ico" aria-hidden="true">📄</span>' +
            '<span class="alevel-xwg-row__label">bài thi</span>' +
            '<span class="alevel-xwg-row__acts">' + actionBtns(row.qp, fname) + "</span>" +
          "</div>" +
          '<div class="alevel-xwg-row">' +
            '<span class="alevel-xwg-row__ico" aria-hidden="true">📝</span>' +
            '<span class="alevel-xwg-row__label">Đáp án</span>' +
            '<span class="alevel-xwg-row__acts">' + actionBtns(row.ms, msLabel) + "</span>" +
          "</div>" +
        "</div></details>";
    }).join("");
    return '<div class="alevel-xwg-list">' + html + "</div>";
  }

  function renderCaieTable(items) {
    return renderXwgList(P.sortFlatRows(P.pairRows(items)));
  }

  function linkAnswer(item, prefix) {
    if (!item) return '<span class="alevel-paper-missing">-</span>';
    return '<a class="alevel-see-answers" href="' + A.viewHref(item, prefix) + '">Xem đáp án</a>';
  }

  function renderComponentChips(components) {
    if (!components.length) return "";
    var chips = '<button type="button" class="chip' + (activeComponent === "all" ? " is-active" : "") +
      '" data-component="all">Tất cả</button>';
    chips += components.map(function (c) {
      return '<button type="button" class="chip chip--paper' +
        (activeComponent === String(c.d) ? " is-active" : "") +
        '" data-component="' + c.d + '" title="' + Y.esc(c.nameZh) + '">' +
        Y.esc(c.short) + "</button>";
    }).join("");
    return '<div class="alevel-component-filters filters">' + chips + "</div>";
  }

  function renderFlatTable(items) {
    if (!items.length) {
      return '<div class="soon-box">tạm thời không có bài thi, yêu cầu điều chuyển toàn bộ lọc </div>';
    }
    var rows = A.sortItems(items.filter(function (it) { return it.type === "qp"; }))
      .map(function (qp) {
        var ms = items.find(function (it) {
          return it.type === "ms" && it.year === qp.year &&
            it.season === qp.season && it.paper === qp.paper;
        });
        return '<tr class="alevel-paper-row">' +
          "<td>" + qp.year + "</td>" +
          '<td><span class="alevel-season-badge alevel-season-badge--' + Y.esc(qp.season) + '">' +
            Y.esc(A.seasonBadge(qp.season)) + "</span></td>" +
          "<td>Paper " + Y.esc(qp.paper) + "</td>" +
          '<td class="alevel-paper-links">' +
            (qp ? '<a href="' + A.viewHref(qp, "") + '">xem trước</a>' : "-") + "</td>" +
          '<td class="alevel-paper-links">' + linkAnswer(ms, "") + "</td></tr>";
      }).join("");
    return '<div class="alevel-paper-list-wrap"><table class="alevel-paper-list">' +
      "<thead><tr><th>Năm</th><th>đánh mùa</th><th>Paper</th><th>Đề thi thật</th><th>Đáp án</th></tr></thead>" +
      "<tbody>" + rows + "</tbody></table></div>";
  }

  function renderLegacyFilters(components) {
    var years = A.yearsFor(allItems, null);
    var yearOpts = '<option value="all"' + (activeYear === "all" ? " selected" : "") + ">Tất cả</option>" +
      years.map(function (y) {
        return '<option value="' + y + '"' + (activeYear === String(y) ? " selected" : "") + ">" + y + "</option>";
      }).join("");

    var seasons = [
      { id: "all", label: " toàn bộ đánh mùa " },
      { id: "s", label: " Mùa hè " },
      { id: "w", label: " Mùa đông " },
      { id: "m", label: " Mùa xuân " }
    ];
    var seasonChips = seasons.map(function (s) {
      return '<button type="button" class="chip' + (activeSeason === s.id ? " is-active" : "") +
        '" data-season="' + s.id + '">' + s.label + "</button>";
    }).join("");

    return '<div class="alevel-filters">' +
      '<div class="alevel-filter-row">' +
        '<label class="alevel-year-select">Năm<select id="alevel-year">' + yearOpts + "</select></label>" +
        '<div class="filters alevel-season-filters">' + seasonChips + "</div></div>" +
      (components.length ? '<div class="alevel-filter-row alevel-filter-row--paper">' +
        '<span class="alevel-filter-label">cuộn lại rời khỏi</span>' + renderComponentChips(components) + "</div>" : "") +
      "</div>";
  }

  function paint() {
    var items = filteredItems();
    var pairs = isCaie ? P.sortFlatRows(P.pairRows(items)) : P.pairRows(items);
    var updated = subject.updatedYear ? " thay cũ đổi mới đến " + subject.updatedYear : "";
    var qpN = allItems.filter(function (it) { return it.type === "qp"; }).length;
    var components = isCaie ? P.componentsPresent(code, allItems) : [];

    var label = boardMeta ? (boardMeta.label || boardMeta.id) : board;
    document.title = label + " " + code + " " + subject.nameZh + " · A-Level · YYSD ";

    var crumb = '<div class="minimal-crumb cam-crumb">' +
      '<a href="index.html">Trang chủ</a> <span class="crumb-sep" aria-hidden="true">★</span> ' +
      '<a href="alevel.html">Chương trình quốc tế</a> <span class="crumb-sep" aria-hidden="true">★</span> ' +
      '<a href="alevel.html?board=' + encodeURIComponent(board) + '">A-Level</a> <span class="crumb-sep" aria-hidden="true">★</span> ' +
      Y.esc(subject.nameZh) + "</div>";

    var hero = '<div class="cam-hero alevel-hero' + (isCaie ? " alevel-hero--compact" : "") + '">' +
      '<div class="cam-hero__badge alevel-hero__badge"><div class="lbl">' + Y.esc(label) + '</div><div class="num">' +
        Y.esc(code) + "</div></div>" +
      "<div><h1>" + Y.esc(subject.nameZh) + ' <span class="alevel-hero__en">' + Y.esc(subject.name) + "</span></h1>" +
      '<div class="meta">' + Y.esc(updated) + (updated && qpN ? " · " : "") +
        (qpN ? qpN + " che đậy câu hỏi từ đề thi các năm trước " : "") + "</div></div></div>";

    var body;
    if (isCaie) {
      body = '<section class="alevel-xwg">' +
        '<h2 class="alevel-xwg__title">câu hỏi từ đề thi các năm trước tài liệu</h2>' +
        renderXwgFilters(components) +
        '<div class="alevel-xwg-meta">Tổng cộng ' + pairs.length + " Bộ</div>" +
        renderCaieTable(items) +
        "</section>";
    } else {
      body = renderLegacyFilters(components) +
        '<div class="alevel-results-meta">Tổng cộng ' + pairs.length + " Bộ</div>" +
        renderFlatTable(items);
    }

    contentEl.innerHTML = crumb + hero + body;

    var yearSel = document.getElementById("alevel-year");
    if (yearSel) {
      yearSel.addEventListener("change", function () {
        activeYear = yearSel.value;
        paint();
      });
    }
  }

  contentEl.addEventListener("click", function (e) {
    var shareBtn = e.target.closest(".alevel-xwg-btn--share");
    if (shareBtn) {
      var url = absoluteUrl(shareBtn.getAttribute("data-share-url"));
      var title = shareBtn.getAttribute("data-share-title") || "A-Level Đề thi thật ";
      if (navigator.share) {
        navigator.share({ title: title, url: url }).catch(function () {});
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () { alert(" liên kết đã nhân bản, có thể dán chia sẻ "); });
      } else {
        prompt(" nhân bản liên kết: ", url);
      }
      return;
    }

    var yearChip = e.target.closest(".alevel-xwg-filters [data-year]");
    if (yearChip) {
      activeYear = yearChip.getAttribute("data-year");
      paint();
      return;
    }

    var levelChip = e.target.closest(".alevel-xwg-filters [data-level]");
    if (levelChip) {
      activeLevel = levelChip.getAttribute("data-level");
      paint();
      return;
    }

    var xwgCompChip = e.target.closest(".alevel-xwg-filters [data-component]");
    if (xwgCompChip) {
      activeComponent = xwgCompChip.getAttribute("data-component");
      paint();
      return;
    }

    var compChip = e.target.closest(".alevel-component-filters .chip");
    if (compChip) {
      activeComponent = compChip.getAttribute("data-component");
      paint();
      return;
    }

    var chip = e.target.closest(".alevel-season-filters .chip");
    if (chip) {
      activeSeason = chip.getAttribute("data-season");
      paint();
    }
  });

  A.loadCatalog().then(function (catalog) {
    boardMeta = A.boardOf(catalog, board);
    subject = A.subjectOf(catalog, board, code);
    if (!subject) {
      contentEl.innerHTML = '<div class="state state--brand"><h3>chưa tìm thấy nên môn học</h3>' +
        '<p><a href="alevel.html">Quay lại A-Level Trang chủ</a></p></div>';
      return;
    }
    allItems = A.itemsForSubject(catalog, board, code);
    isCaie = board === "caie" && !!P.schema(code);
    paint();
  }).catch(function (err) {
    contentEl.innerHTML = '<div class="state state--brand"><h3>Tải không thành công</h3><p>' + Y.esc(err.message) + "</p></div>";
  });
})();
