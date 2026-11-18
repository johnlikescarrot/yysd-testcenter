/* =========================================================================
   zone.js - zone catalog with search, tier filters, collapsible groups
   ========================================================================= */
(function () {
  "use strict";
  var Y = window.YYSD;

  var params = new URLSearchParams(location.search);
  var zone = params.get("zone");
  if (!Y.ZONE[zone]) zone = "mock";
  var focusSubject = params.get("s") || "";
  if (zone === "toefl" && focusSubject === "full") {
    location.replace("app/mock.html?kind=full");
    return;
  }
  var z = Y.ZONE[zone];
  var nav = Y.navOf(zone);
  var activeCat = "all";
  var searchQuery = "";
  var camTier = "all";
  var jtVol = (params.get("vol") || "").trim();
  var labIndex = null;
  var labSkill = params.get("skill") || "reading";
  var labType = params.get("type") || "";
  var labFilter = params.get("f") || "all";

  document.body.classList.add("zone-page", "zone-page--" + zone);

  document.title = z.label + " · Trung tâm YYSD ";
  document.getElementById("crumb-zone").textContent = z.label;
  document.getElementById("zone-en").textContent = z.en || z.label;
  document.getElementById("zone-title").textContent = z.label;
  document.getElementById("zone-desc").textContent = z.desc;

  var navLink = document.querySelector('#nav a[data-zone="' + zone + '"]');
  if (navLink) navLink.classList.add("is-active");

  var filtersEl = document.getElementById("filters");
  var subFiltersEl = document.getElementById("sub-filters");
  var searchInput = document.getElementById("catalog-search");
  var contentEl = document.getElementById("content");
  var toolbarEl = document.querySelector(".catalog-toolbar");
  var allItems = [];
  var alevelCatalog = null;

  function catOfSubject(s) {
    function walk(nodes, top) {
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (n.subject === s) return top;
        if (n.children) {
          var hit = walk(n.children, top);
          if (hit) return hit;
        }
      }
      return null;
    }
    for (var i = 0; i < nav.length; i++) {
      var c = nav[i];
      if (c.subject === s) return c;
      if (c.children) {
        var hit = walk(c.children, c);
        if (hit) return hit;
      }
    }
    return null;
  }
  // ponytail: legacy s=ielts → hub; subject keys map to flat NAV.mock
  if (focusSubject === "ielts") activeCat = "all";
  else if (focusSubject === "cambridge-listening") activeCat = "listening";
  else if (focusSubject === "cambridge-reading") activeCat = "reading";
  else if (focusSubject === "cambridge-writing") activeCat = "writing";
  else if (focusSubject) {
    var byKey = nav.filter(function (c) { return c.key === focusSubject; })[0];
    if (byKey) activeCat = byKey.key;
    else {
      var fc = catOfSubject(focusSubject);
      if (fc) activeCat = fc.key;
    }
  }
  // External IELTS hubs: deep-link chips skip zone catalog
  if (zone === "mock") {
    var landCat = nav.filter(function (c) { return c.key === activeCat; })[0];
    if (landCat && landCat.href) {
      location.replace(landCat.href);
      return;
    }
  }

  function showCambridgeSubFilters() {
    return zone === "mock" &&
      (activeCat === "listening" || activeCat === "reading" || activeCat === "writing" ||
        activeCat === "mock" || (activeCat === "jingting" && !jtVol)) &&
      !searchQuery;
  }

  function buildSubFilters() {
    if (!subFiltersEl) return;
    if (!showCambridgeSubFilters()) {
      subFiltersEl.innerHTML = "";
      subFiltersEl.hidden = true;
      return;
    }
    subFiltersEl.hidden = false;
    var tiers = [
      { id: "all", label: " toàn bộ sách " },
      { id: "new", label: " mới nhất Vol.19+" },
      { id: "mid", label: " nâng cao Vol.13–18" },
      { id: "base", label: " nền Vol.7–12" }
    ];
    subFiltersEl.innerHTML = tiers.map(function (t) {
      return '<button type="button" class="chip chip--sub' + (camTier === t.id ? " is-active" : "") +
        '" data-tier="' + t.id + '">' + t.label + "</button>";
    }).join("");
  }

  function catHasContent(cat) {
    if (cat.key === "alevel") {
      return window.YYSD_ALEVEL && alevelCatalog && window.YYSD_ALEVEL.hasContent(alevelCatalog);
    }
    if (cat.key === "mock" || cat.key === "ielts") return Y.camVolumes(allItems).length > 0;
    if (cat.key === "speaking") return true;
    if (cat.key === "writing") {
      return Y.camVolumes(allItems.filter(function (it) { return it.subject === "cambridge-writing"; })).length > 0;
    }
    if (cat.key === "vocab") return Y.vocabBooksForZone(allItems).length > 0;
    if (cat.href) return true;
    if (cat.children) {
      return cat.children.some(function (ch) {
        if (Y.isCambridge(ch.subject)) {
          return Y.camVolumes(allItems.filter(function (it) { return it.subject === ch.subject; })).length > 0;
        }
        return itemsOf(ch.subject).length > 0;
      });
    }
    if (Y.isCambridge(cat.subject)) {
      return Y.camVolumes(allItems.filter(function (it) { return it.subject === cat.subject; })).length > 0;
    }
    return countOf(cat.subject) > 0;
  }

  function visibleNav() {
    var list = zone === "mock" ? nav.filter(catHasContent) : nav;
    // ponytail: tinh chất cười treo tồn tại thính giác links xuống, không biến thể của độc lập chip / hub sắp xếp
    if (zone === "mock") list = list.filter(function (c) { return c.key !== "jingting"; });
    return list;
  }

  function navCat(key) {
    return nav.filter(function (c) { return c.key === key; })[0];
  }

  function buildFilters() {
    var chips = ['<button type="button" class="chip' + (activeCat === "all" ? " is-active" : "") + '" data-s="all">Tất cả</button>'];
    visibleNav().forEach(function (c) {
      chips.push('<button type="button" class="chip' + (activeCat === c.key ? " is-active" : "") +
        '" data-s="' + c.key + '">' + Y.esc(c.label) + "</button>");
    });
    // tinh chất nghe theo thính giác lối vào đi vào biến thể cũ của |, đỉnh hàng rào sửa một lượng từ cho tiền xu thời điểm hiện tại chip
    if (activeCat === "jingting") {
      chips.push('<button type="button" class="chip is-active" data-s="jingting">thính giác tinh chất cười</button>');
    }
    filtersEl.innerHTML = chips.join("");
    // ponytail: only reset after items load; early empty nav was wiping s=ielts → all
    if (zone === "mock" && activeCat !== "all" && activeCat !== "jingting" && allItems.length &&
        !visibleNav().some(function (c) { return c.key === activeCat; })) {
      activeCat = "all";
      filtersEl.querySelectorAll(".chip").forEach(function (c) {
        c.classList.toggle("is-active", c.getAttribute("data-s") === "all");
      });
      syncZoneQuery();
    }
    buildSubFilters();
  }

  filtersEl.addEventListener("click", function (e) {
    var b = e.target.closest(".chip");
    if (!b || b.closest("#sub-filters")) return;
    var next = b.getAttribute("data-s");
    var cat = nav.filter(function (c) { return c.key === next; })[0];
    if (cat && cat.href) {
      (window.YYSD_GO || function (h) { location.href = h; })(cat.href);
      return;
    }
    filtersEl.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("is-active"); });
    b.classList.add("is-active");
    activeCat = next;
    jtVol = "";
    if (searchInput && zone === "toefl") {
      searchInput.placeholder = next === "lab" ? " tìm kiếm chủ đề tên..." : " tìm kiếm TOEFL che đậy chủ đề...";
    }
    syncZoneQuery();
    buildSubFilters();
    if (zone === "study" && next === "vocab" && window.YYSD_DIAG_GATE) {
      window.YYSD_DIAG_GATE.ensure({ requireLogin: true }).then(function (ok) {
        if (ok) render();
      });
      return;
    }
    render();
  });

  contentEl.addEventListener("click", function (e) {
    var b = e.target.closest("[data-lab]");
    if (!b || !contentEl.contains(b)) return;
    var kind = b.getAttribute("data-lab");
    var v = b.getAttribute("data-v") || "";
    if (kind === "record") { showLabSheet(b.getAttribute("data-rec") || ""); return; }
    if (kind === "sheet-close") { hideLabSheet(); return; }
    if (kind === "skill") { labSkill = v; labType = ""; }
    else if (kind === "type") labType = v;
    else if (kind === "filter") labFilter = v;
    else return;
    syncZoneQuery();
    render();
  });

  function hideLabSheet() {
    var el = document.getElementById("lab-sheet");
    if (el) el.remove();
  }
  function showLabSheet(rec) {
    var Lab = window.YYSD_TOEFL_LAB;
    if (!Lab || !labIndex) return;
    hideLabSheet();
    var parts = String(rec || "").split("|");
    var items = [];
    if (parts[0] === "set") {
      items = Lab.setResults(labIndex.filter(function (it) {
        return it.skill === "listening" && it.paperId === parts[1] && it.type === parts[2];
      })).items;
    } else {
      var card = labIndex.filter(function (it) {
        return it.skill === parts[1] && it.paperId === parts[2] && Number(it.taskIndex) === Number(parts[3]);
      })[0];
      items = card ? Lab.cardResults(card).items : [];
    }
    var box = document.createElement("div");
    box.id = "lab-sheet";
    box.className = "hit-lab-sheet";
    box.innerHTML = '<div class="hit-lab-sheet__box"><h3>xem xét ghi chép</h3>' +
      (items.length
        ? '<div class="hit-lab-sheet__list">' + items.map(function (d) {
          return '<div class="hit-lab-sheet__row ' + (d.ok ? "is-ok" : "is-bad") + '"><b>Q' +
            Y.esc(String(d.no)) + "</b><span>" + (d.ok ? " Đúng " : " Sai ") +
            "</span><span>của bạn: " + Y.esc(d.ua || "(Chưa trả lời)") +
            (d.expect ? " · tháng đầu tiên của năm âm lịch chia: " + Y.esc(d.expect) : "") + "</span></div>";
        }).join("") + "</div>"
        : "<p>vẫn không có trả lời ghi chép </p>") +
      '<button type="button" class="btn btn--ghost btn--sm" data-lab="sheet-close">đóng</button></div>';
    document.body.appendChild(box);
    box.addEventListener("click", function (e) {
      if (e.target === box || e.target.closest("[data-lab=sheet-close]")) hideLabSheet();
    });
  }

  if (subFiltersEl) {
    subFiltersEl.addEventListener("click", function (e) {
      var b = e.target.closest(".chip");
      if (!b) return;
      subFiltersEl.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("is-active"); });
      b.classList.add("is-active");
      camTier = b.getAttribute("data-tier");
      render();
    });
  }

  if (searchInput) {
    searchInput.placeholder = zone === "mock" ? " tìm kiếm bắt chước đánh, sách đếm, Test..."
      : (zone === "toefl" ? (activeCat === "lab" ? " tìm kiếm chủ đề tên..." : " tìm kiếm TOEFL che đậy chủ đề...") : " tìm kiếm nội dung tên...");
    var onSearch = window.YYSD_DEBOUNCE ? window.YYSD_DEBOUNCE(function () {
      searchQuery = searchInput.value.trim();
      buildSubFilters();
      render();
    }, 200) : function () {
      searchQuery = searchInput.value.trim();
      buildSubFilters();
      render();
    };
    searchInput.addEventListener("input", onSearch);
  }

  function itemsOf(subject) {
    return allItems.filter(function (it) { return it.subject === subject; })
      .sort(function (a, b) {
        return String(a.title).localeCompare(String(b.title), "vi-VN-CN", { numeric: true, sensitivity: "base" });
      });
  }

  function emptyBox(title, desc, href, cta) {
    return '<div class="soon-box soon-box--rich">' +
      "<h3>" + Y.esc(title) + "</h3>" +
      "<p>" + Y.esc(desc) + "</p>" +
      (href
        ? '<a class="btn btn--ghost btn--sm" href="' + Y.esc(href) + '">' + Y.esc(cta || " trở về IELTS ") + "</a>"
        : "") +
      "</div>";
  }

  function leafBody(subject, skill) {
    if (subject === "ielts-speaking") {
      return '<div class="spk-cta-grid bento-grid bento-grid--3">' +
        '<a class="bento-cta" href="speaking.html">' +
          '<span class="bento-cta__badge">Part 1</span>' +
          '<div><p class="bento-cta__title">lời nói thông thường bắt chước đánh</p>' +
          '<p class="bento-cta__desc">ghi âm trả lời · AI bốn đức tính xã hội: lễ chấm điểm</p></div>' +
          '<span class="spk-cta-go">đi vào ›</span></a>' +
        '<a class="bento-cta bento-cta--teal" href="speaking-select.html">' +
          '<span class="bento-cta__badge">chuyên biệt</span>' +
          '<div><p class="bento-cta__title">chuyên biệt chọn chủ đề</p>' +
          '<p class="bento-cta__desc">chọn chủ đề, hình thành bộ Part 1</p></div>' +
          '<span class="spk-cta-go">chọn chủ đề ›</span></a>' +
        '<a class="bento-cta bento-cta--orange" href="ai-tutor.html">' +
          '<span class="bento-cta__badge">AI</span>' +
          '<div><p class="bento-cta__title">AI IELTS giáo viên</p>' +
          '<p class="bento-cta__desc">lời nói thông thường máy móc kinh điển / viết chấm</p></div>' +
          '<span class="spk-cta-go">đi vào ›</span></a></div>';
    }
    if (Y.isCambridge(subject)) {
      var vols = Y.camVolumes(allItems.filter(function (it) { return it.subject === subject; }));
      if (vols.length) {
        return '<div class="vol-grid">' + vols.map(function (v) {
          return Y.camVolumeCardHTML(v, "", allItems, { skill: skill || "" });
        }).join("") + "</div>";
      }
    } else if (subject === "jingting") {
      var jt = itemsOf(subject);
      if (jt.length && Y.jingtingCatalogHTML) {
        return Y.jingtingCatalogHTML(jt, "", { vol: jtVol, query: searchQuery, tier: camTier });
      }
      if (jt.length) {
        return '<div class="exam-grid">' + jt.map(function (it) { return Y.cardHTML(it, ""); }).join("") + "</div>";
      }
    } else {
      var its = itemsOf(subject);
      if (its.length) {
        if (its.length > 8 && Y.isVocabListSubject(subject)) {
          return '<div class="catalog-rows">' + its.map(function (it) { return Y.compactItemRowHTML(it, ""); }).join("") + "</div>";
        }
        return '<div class="exam-grid">' + its.map(function (it) { return Y.cardHTML(it, ""); }).join("") + "</div>";
      }
    }
    return emptyBox(" nên tấm sắp lên mạng ", " nội dung sự chuẩn bị Trung Quốc, trước đi khác môn học luyện tập, có thể biến thể của | IELTS cái nhìn tổng quan lại chọn ", "zone.html?zone=mock", " trở về IELTS cái nhìn tổng quan ");
  }

  function countOf(subject) {
    if (subject === "ielts-speaking") return 1;
    if (Y.isCambridge(subject)) return Y.camVolumes(allItems.filter(function (it) { return it.subject === subject; })).length;
    if (subject === "jingting") {
      return Y.jingtingVolumes ? Y.jingtingVolumes(itemsOf(subject)).length : itemsOf(subject).length;
    }
    return itemsOf(subject).length;
  }
  function unitOf(subject) { return (Y.isCambridge(subject) || subject === "jingting") ? " sách " : " lượng từ cho quà tặng "; }

  // Vocab hub - học Đài Loan: trái tốc độ tiến triển đường ray + bên phải chủ mô-đun; Chẩn đoán/hàng ngày từ làm chips
  function dailyWordChipMeta() {
    var dwTask = null;
    var dwResult = null;
    try {
      dwTask = JSON.parse(localStorage.getItem("yysd:daily-word:task") || "null");
      dwResult = JSON.parse(localStorage.getItem("yysd:daily-word:result") || "null");
    } catch (e) {}
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    var today = (function (d) {
      return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    })(new Date());
    var resume = !!(dwTask && dwTask.wordList && dwTask.wordList.length && !dwTask.completed);
    var done = !resume && !!(dwResult && dwResult.date === today);
    if (resume) {
      return { href: "daily-word-learn.html", label: " hàng ngày từ · Tiếp tục ", state: "is-resume" };
    }
    if (done) {
      return { href: "daily-word-result.html", label: " hàng ngày từ · đã hoàn thành ", state: "is-done" };
    }
    return { href: "daily-word-setup.html", label: " hàng ngày từ ", state: "is-idle" };
  }

  function vocabBentoHTML() {
    var dw = dailyWordChipMeta();
    var bookSvg =
      '<svg class="vocab-desk__book" viewBox="0 0 160 110" aria-hidden="true">' +
        '<path fill="#f7f3ea" stroke="#102a4c" stroke-width="2.2" d="M80 18c-18-10-46-12-62-8v72c18-5 44-2 62 10 18-12 44-15 62-10V10c-16-4-44-2-62 8z"/>' +
        '<path fill="none" stroke="#c7a45d" stroke-width="1.6" d="M80 20v70"/>' +
        '<path fill="none" stroke="#d8cbb5" stroke-width="1.2" d="M34 36h30M34 48h28M34 60h26M96 36h30M96 48h28M96 60h26"/>' +
      "</svg>";

    function mod(cls, href, kicker, title, m1k, m1v, m2k, m2v, cta, ctaHref) {
      return '<article class="vocab-desk__mod vocab-desk__mod--' + cls + '">' +
        '<a class="vocab-desk__mod-hit" href="' + Y.esc(href) + '">' +
          '<span class="vocab-desk__mod-kicker">' + kicker + "</span>" +
          "<h3>" + title + "</h3>" +
          '<dl class="vocab-desk__metrics">' +
            "<div><dt>" + m1k + "</dt><dd data-desk=\"" + cls + "-m1\">" + m1v + "</dd></div>" +
            "<div><dt>" + m2k + "</dt><dd data-desk=\"" + cls + "-m2\">" + m2v + "</dd></div>" +
          "</dl>" +
        "</a>" +
        '<a class="vocab-desk__continue" data-desk="' + cls + '-cta" href="' + Y.esc(ctaHref || href) + '">' +
          Y.esc(cta) + " <span aria-hidden=\"true\">›</span></a>" +
      "</article>";
    }

    return '<section class="vocab-desk" data-vocab-desk aria-label=" từ học Đài Loan ">' +
      '<aside class="vocab-desk__rail" aria-label=" học tốc độ tiến triển ">' +
        '<p class="vocab-desk__rail-kicker">học tốc độ tiến triển</p>' +
        '<ul class="vocab-desk__stats">' +
          '<li><span>giá sách gốc đếm</span><b data-desk="shelfBooks">-</b></li>' +
          '<li><span>biến thể cũ của | viết tắt của | học</span><b data-desk="activeLists">-</b></li>' +
          '<li><span>hôm nay đã học</span><b data-desk="todayWords">-</b></li>' +
          '<li><span>gốc đi một vòng đã học</span><b data-desk="weekWords">-</b></li>' +
        "</ul>" +
        '<div class="vocab-desk__chips">' +
          '<a class="vocab-desk__chip" href="diagnostic.html">năng lực chẩn đoán</a>' +
          '<a class="vocab-desk__chip vocab-desk__chip--' + dw.state + '" href="' + Y.esc(dw.href) + '">' +
            Y.esc(dw.label) + "</a>" +
        "</div>" +
      "</aside>" +
      '<div class="vocab-desk__main">' +
        '<header class="vocab-desk__head">' +
          '<div class="vocab-desk__head-copy">' +
            '<p class="vocab-desk__brand">YYSD · Từ vựng</p>' +
            "<h2>học Đài Loan</h2>" +
            "<p>kho từ học · xông qua rào cản mở khóa · phát hiện củng cố · lỗi chủ đề nấu chảy lại </p>" +
          "</div>" +
          bookSvg +
        "</header>" +
        '<div class="vocab-desk__mods" role="navigation" aria-label=" từ chủ mô-đun ">' +
          mod("shelf", "vocab-shelf.html", "01", " kho từ ", " giá sách gốc đếm ", "-", " tiếp tục học ", "-", " đi vào giá sách ", "vocab-shelf.html") +
          mod("challenge", "vocab-challenge.html", "02", " từ xông qua rào cản ", " thời điểm hiện tại ải núi ", "-", " rút ra khảo sát ao ", "-", " bắt đầu xông qua rào cản ", "vocab-challenge.html") +
          mod("quiz", "vocab-quiz.html", "03", " từ phát hiện ", " gốc đi một vòng số lần ", "-", " gần đây đúng tỉ lệ ", "-", " bắt đầu phát hiện ", "vocab-quiz.html") +
          mod("wrong", "wrong-words.html", "04", " Sổ lỗi sai ", " đợi được thông báo thực hành số lần chiếu của một bộ phim ", "-", " lỗi biến thể cũ của | đếm ", "-", " đi xem lại ", "wrong-words.html") +
        "</div>" +
      "</div>" +
    "</section>";
  }

  function bindVocabDesk(root) {
    var desk = root && root.querySelector("[data-vocab-desk]");
    if (!desk) return;
    var A = window.YYSD_AUTH;
    function set(key, val) {
      var el = desk.querySelector('[data-desk="' + key + '"]');
      if (el) el.textContent = val;
    }
    function setCta(key, href, label) {
      var el = desk.querySelector('[data-desk="' + key + '"]');
      if (!el) return;
      if (href) el.setAttribute("href", href);
      if (label) el.innerHTML = Y.esc(label) + ' <span aria-hidden="true">›</span>';
    }
    function paintGuest() {
      set("shelfBooks", "0");
      set("activeLists", "0");
      set("todayWords", "0");
      set("weekWords", "0");
      set("shelf-m1", "0 gốc ");
      set("shelf-m2", "0");
      set("quiz-m1", "0");
      set("quiz-m2", "-");
      set("wrong-m1", "0");
      set("wrong-m2", "0");
      set("challenge-m1", "-");
      set("challenge-m2", "-");
    }
    if (!A || !A.getToken || !A.getToken() || !A.api) {
      paintGuest();
      return;
    }
    Promise.all([
      A.api("/api/vocab-shelf/desk"),
      A.api("/api/vocab-challenge/me").catch(function () { return null; })
    ]).then(function (pair) {
      var d = pair[0];
      var ch = pair[1];
      if (!d || !d.ok) { paintGuest(); return; }
      set("shelfBooks", String(d.shelfBooks || 0));
      set("activeLists", d.continueLearn && d.continueLearn.listLabel
        ? String(d.continueLearn.listLabel)
        : String(d.activeLists || 0));
      set("todayWords", String(d.todayWords || 0));
      set("weekWords", String(d.weekWords || 0));
      set("shelf-m1", (d.shelfBooks || 0) + " gốc ");
      set("shelf-m2", d.continueLearn && d.continueLearn.listLabel
        ? String(d.continueLearn.listLabel)
        : String(d.activeLists || 0));
      set("quiz-m1", String(d.weekQuizzes || 0));
      set("quiz-m2", d.lastAccuracy != null ? d.lastAccuracy + "%" : "-");
      set("wrong-m1", String(d.pendingSessions || 0));
      set("wrong-m2", String(d.mistakeWords || 0));
      if (ch && ch.needsBook && ch.assignments && ch.assignments.length > 1) {
        set("challenge-m1", ch.assignments.length + " gốc ");
        set("challenge-m2", " chọn biến thể cũ của | sách ");
        setCta("challenge-cta", "vocab-challenge.html", " đi xông qua rào cản ");
      } else if (ch && ch.assigned && ch.progress) {
        var totalDays = (ch.progress && ch.progress.totalDays) || 78;
        var bookHref = "vocab-challenge.html" +
          (ch.assignment && ch.assignment.bookId
            ? "?book=" + encodeURIComponent(ch.assignment.bookId)
            : "");
        if (ch.programComplete) {
          set("challenge-m1", " đã hoàn thành ");
          setCta("challenge-cta", bookHref, " xem xét tốc độ tiến triển ");
        } else if (ch.progressDay) {
          set("challenge-m1", " Thứ " + Math.min(ch.progressDay, totalDays) + " ải núi ");
          setCta("challenge-cta", bookHref, ch.activeAttemptId ? " tiếp tục xông qua rào cản " : " đi xông qua rào cản ");
        } else {
          set("challenge-m1", "L" + (ch.progress.nextListNo || 1));
          setCta("challenge-cta", bookHref, " đi xông qua rào cản ");
        }
        set("challenge-m2", String((ch.pool && ch.pool.active) || 0));
      } else {
        set("challenge-m1", " ở lại sắp xếp ");
        set("challenge-m2", "-");
        setCta("challenge-cta", "vocab-challenge.html", " xem xét xông qua rào cản ");
      }
      if (d.continueLearn) {
        setCta("shelf-cta", d.continueLearn.href, " tiếp tục học · " + (d.continueLearn.listLabel || "List"));
      } else if ((d.shelfBooks || 0) > 0) {
        setCta("shelf-cta", "vocab-shelf.html", " tiếp tục học ");
      } else {
        setCta("shelf-cta", "vocab-shelf.html", " thêm biến thể cũ của | viết tắt của | ");
      }
      if (d.continueQuiz) {
        setCta("quiz-cta", d.continueQuiz.href, " tiếp tục khảo sát · " + (d.continueQuiz.label || " phát hiện "));
      }
      if (d.continueWrong) {
        setCta("wrong-cta", d.continueWrong.href, " tiếp tục xem lại · " + (d.continueWrong.wrongCount || "") + " Từ ");
      }
    }).catch(function () { paintGuest(); });
  }

  function leafBlockHTML(label, subject) {
    return '<div class="leaf-block">' +
      '<div class="leaf-block__head"><h4>' + Y.esc(label) + "</h4>" +
        '<span class="cnt">' + countOf(subject) + unitOf(subject) + "</span></div>" +
      leafBody(subject) +
      "</div>";
  }

  function nodeBlockHTML(node) {
    if (node.children) {
      var inner = node.children.map(function (ch) {
        return leafBlockHTML(ch.label, ch.subject);
      }).join("");
      return '<div class="leaf-block leaf-block--group">' +
        '<div class="leaf-block__head"><h4>' + Y.esc(node.label) + "</h4></div>" +
        '<div class="leaf-nest">' + inner + "</div></div>";
    }
    return leafBlockHTML(node.label, node.subject);
  }

  function ieltsHubHTML() {
    // hub chỉ giữ thính giác/Đọc hiểu/Nói/Viết/bắt chước đánh năm sắp xếp; tinh chất cười tồn tại thính giác links biến thể của |
    var hubKeys = { listening: 1, reading: 1, speaking: 1, writing: 1, mock: 1 };
    var en = {
      listening: "Listening",
      reading: "Reading",
      speaking: "Speaking",
      writing: "Writing",
      mock: "Full Mock"
    };
    /* ponytail: shared glyphs from config.js */
    var cols = visibleNav().filter(function (c) { return hubKeys[c.key]; });
    var cards = cols.map(function (cat) {
      var headHref = cat.href || ("zone.html?zone=mock&s=" + encodeURIComponent(cat.key));
      var links = cat.links && cat.links.length
        ? cat.links
        : cat.key === "speaking"
          ? [
              { href: "speaking.html", label: " lời nói thông thường bắt chước đánh " },
              { href: "speaking-select.html", label: " chuyên biệt chọn chủ đề " },
              { href: "ai-tutor.html", label: "AI IELTS giáo viên " }
            ]
          : [{ href: headHref, label: cat.desc || cat.label }];
      return '<article class="ielts-hub__card ielts-hub__card--' + Y.esc(cat.key) + '">' +
        '<a class="ielts-hub__hit" href="' + Y.esc(headHref) + '">' +
          '<span class="ielts-hub__ico" aria-hidden="true">' + (Y.skillGlyph ? Y.skillGlyph(cat.key) : "") + "</span>" +
          '<span class="ielts-hub__eyebrow">' + Y.esc(en[cat.key] || "") + "</span>" +
          "<h3>" + Y.esc(cat.label) + "</h3>" +
          '<p class="ielts-hub__desc">' + Y.esc(cat.desc || "") + "</p>" +
        "</a>" +
        '<ul class="ielts-hub__links">' +
          links.map(function (l) {
            return '<li><a href="' + Y.esc(l.href) + '">' + Y.esc(l.label) + "</a></li>";
          }).join("") +
        "</ul>" +
        '<a class="ielts-hub__go" href="' + Y.esc(headHref) + '">đi vào' + Y.esc(cat.label) + " <span aria-hidden=\"true\">›</span></a>" +
      "</article>";
    }).join("");

    return '<section class="ielts-hub" aria-label=" IELTS lối vào ">' +
      '<header class="ielts-hub__intro">' +
        '<p class="ielts-hub__kicker">Cambridge IELTS</p>' +
        "<h2>chọn bạn của huấn luyện con đường</h2>" +
        "<p>mục đơn lẻ làm sạch tá nền, che đậy chủ đề bắt chước đánh luyện tập có mặt tại hiện trường bốn ngành học âm thanh lời nói rõ ràng, điểm đi vào chính xác tương ứng với ngân hàng câu hỏi </p>" +
      "</header>" +
      '<div class="ielts-hub__grid">' + cards + "</div>" +
    "</section>";
  }

  var TOEFL_SKILL = {
    full: { list: "TOEFL_FULL", page: "toefl-full.html", badge: " tất cả cuộn lại ", empty: " tạm thời không có hoàn chỉnh che đậy chủ đề " },
    reading: { list: "TOEFL_READING", page: "toefl-reading.html", badge: " Đọc hiểu ", empty: " tạm thời không có đọc câu hỏi từ đề thi các năm trước " },
    listening: { list: "TOEFL_LISTENING", page: "toefl-listening.html", badge: " Nghe hiểu ", empty: " tạm thời không có thính giác câu hỏi từ đề thi các năm trước " },
    writing: { list: "TOEFL_WRITING", page: "toefl-writing.html", badge: " Viết ", empty: " tạm thời không có viết câu hỏi từ đề thi các năm trước " },
    speaking: { list: "TOEFL_SPEAKING", page: "toefl-speaking.html", badge: " Nói ", empty: " tạm thời không có lời nói thông thường câu hỏi từ đề thi các năm trước " }
  };

  function toeflPaperCards(skill) {
    var spec = TOEFL_SKILL[skill] || TOEFL_SKILL.reading;
    var papers = Y[spec.list] || [];
    if (!papers.length) {
      return emptyBox(spec.empty, " chủ đề tải lên hoàng hậu có thể xuất hiện tồn tại biến thể của | ", "zone.html?zone=toefl", " trở về TOEFL cái nhìn tổng quan ");
    }
    return '<div class="exam-grid">' + papers.map(function (p) {
      var practice = spec.page + "?id=" + encodeURIComponent(p.id) + "&mode=practice";
      var mock = spec.page + "?id=" + encodeURIComponent(p.id) + "&mode=mock";
      return '<article class="exam-card">' +
        '<div class="exam-card__top"><span class="badge badge--toefl-' + skill + '">' + spec.badge + "</span></div>" +
        "<h3>" + Y.esc(p.title) + "</h3>" +
        "<p>" + Y.esc(p.desc || "") + "</p>" +
        '<div class="exam-card__meta"><span>⏱️ ' + Y.esc(String(p.duration || 30)) + " phút</span></div>" +
        '<div class="exam-card__foot toefl-card-acts">' +
          '<a class="btn btn--ghost btn--sm" href="' + practice + '">luyện tập</a>' +
          '<a class="btn btn--primary btn--sm" href="' + mock + '">bắt chước đánh</a>' +
        "</div></article>";
    }).join("") + "</div>";
  }

  function toeflDoorCards(keys, opts) {
    opts = opts || {};
    var en = { lab: "By Type", dates: "By Date", full: "Full Test", listening: "Listening", reading: "Reading", speaking: "Speaking", writing: "Writing" };
    var kindOf = { lab: "reading", dates: "mock", full: "mock" };
    var cards = nav.filter(function (cat) { return keys.indexOf(cat.key) >= 0; }).map(function (cat) {
      var soon = !!cat.soon;
      var headHref = soon ? "" : ("zone.html?zone=toefl&s=" + encodeURIComponent(cat.key));
      var hit = soon
        ? '<div class="ielts-hub__hit">'
        : '<a class="ielts-hub__hit" href="' + Y.esc(headHref) + '">';
      var hitEnd = soon ? "</div>" : "</a>";
      var go = soon
        ? '<span class="ielts-hub__go is-soon">sắp lên mạng</span>'
        : '<a class="ielts-hub__go" href="' + Y.esc(headHref) + '">đi vào' + Y.esc(cat.label) + ' <span aria-hidden="true">›</span></a>';
      var kind = kindOf[cat.key] || cat.key;
      var glyph = cat.key === "lab" ? "reading" : (cat.key === "dates" ? "mock" : cat.key);
      return '<article class="ielts-hub__card ielts-hub__card--' + Y.esc(kind) + (soon ? " is-soon" : "") + '">' +
        hit +
          '<span class="ielts-hub__ico" aria-hidden="true">' + (Y.skillGlyph ? Y.skillGlyph(glyph) : "") + "</span>" +
          '<span class="ielts-hub__eyebrow">' + Y.esc(en[cat.key] || "") + "</span>" +
          "<h3>" + Y.esc(cat.label) + "</h3>" +
          '<p class="ielts-hub__desc">' + Y.esc(cat.desc || "") + "</p>" +
        hitEnd +
        go +
      "</article>";
    }).join("");
    return '<section class="ielts-hub" aria-label="' + Y.esc(opts.aria || " TOEFL lối vào ") + '">' +
      '<header class="ielts-hub__intro">' +
        '<p class="ielts-hub__kicker">Enhanced TOEFL iBT</p>' +
        "<h2>" + Y.esc(opts.h2 || " chọn huấn luyện cách thức ") + "</h2>" +
        "<p>" + Y.esc(opts.p || "") + "</p>" +
        (opts.link ? '<p><a class="ielts-hub__go" href="' + Y.esc(opts.link.href) + '">' +
          Y.esc(opts.link.label) + ' <span aria-hidden="true">›</span></a></p>' : "") +
      "</header>" +
      '<div class="' + Y.esc(opts.grid || "ielts-hub__grid") + '">' + cards + "</div>" +
    "</section>";
  }

  function toeflHubHTML() {
    return toeflDoorCards(["lab", "dates"], {
      aria: " TOEFL lối vào ",
      h2: " chọn huấn luyện cách thức ",
      p: " nhấn chủ đề khuôn tháo dỡ làm sạch một tờ, có thể nhấn dự thi viết tắt của đi vào toàn bộ cuộn lại luyện tập biến thể của | bắt chước đánh ",
      link: { href: "toefl-score.html", label: " phiếu điểm hoặc bảng điểm biến thể của | bắt chước đánh lịch sử " },
      grid: "ielts-hub__grid ielts-hub__grid--2"
    });
  }

  function toeflDateHubHTML() {
    return toeflDoorCards(["reading", "listening", "speaking", "writing"], {
      aria: " nhấn dự thi viết tắt của bắt chước đánh ",
      h2: " nhấn dự thi viết tắt của bắt chước đánh ",
      p: " nhấn dự thi viết tắt của đi vào mục đơn lẻ luyện tập biến thể của | bắt chước đánh hoàn chỉnh liên kết đánh mời đến máy móc đánh hệ thống Mock Test ",
      grid: "ielts-hub__grid"
    });
  }

  function loadLabThen(cb) {
    if (labIndex) { cb(); return; }
    fetch("library/toefl/lab-index.json", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("lab"); return r.json(); })
      .then(function (d) { labIndex = d.items || []; cb(); })
      .catch(function () { labIndex = []; cb(); });
  }

  function toeflLabHTML() {
    var Lab = window.YYSD_TOEFL_LAB;
    if (!Lab) return emptyBox(" làm sạch mục lục chưa tải ", " mời cải tiến hoàng hậu thử lại ", "zone.html?zone=toefl", " trở về TOEFL cái nhìn tổng quan ");
    if (!labIndex) {
      loadLabThen(render);
      return '<div class="state state--brand"><p>đang ở tải chủ đề khuôn mục lục...</p></div>';
    }
    var types = Lab.TYPES[labSkill] || Lab.TYPES.reading;
    if (!types.some(function (t) { return t.key === labType; })) labType = types[0].key;
    var filters = labSkill === "listening" ? Lab.FILTERS_LISTEN : Lab.FILTERS;
    if (!filters.some(function (f) { return f.key === labFilter; })) labFilter = "all";
    var q = (searchQuery || "").toLowerCase();
    var cards = labIndex.filter(function (it) {
      if (it.skill !== labSkill || it.type !== labType) return false;
      if (labFilter === "todo" && Lab.isDone(it)) return false;
      if (labFilter === "hot" && !it.hot) return false;
      if (labFilter === "fav" && !Lab.isFavCard(it)) return false;
      var blob = (it.titleEn || it.title || "") + " " + (it.titleZh || "") + " " + it.date + " " + (it.listenCode || "");
      if (q && blob.toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    function chipRow(kind, items, cur) {
      return '<div class="chip-row">' + items.map(function (it) {
        return '<button type="button" class="chip' + (cur === it.key ? " is-active" : "") +
          '" data-lab="' + kind + '" data-v="' + Y.esc(it.key) + '">' + Y.esc(it.label) + "</button>";
      }).join("") + "</div>";
    }
    function statusTxt(st, kind) {
      if (!st.attempted) return " chưa làm ";
      if (kind === "speaking") return st.ok + "/" + st.total + " đã khắc gỗ ";
      if (st.done >= st.total && st.total) return (st.ok === st.total ? " toàn bộ đúng " : (st.ok + "/" + st.total + " Đúng "));
      return st.ok + "/" + st.total;
    }
    function acts(href, recId, attempted) {
      return '<div class="hit-lab__acts">' +
        '<a class="hit-lab__go" href="' + Y.esc(href) + '">' + (attempted ? " lại làm một lần " : " bắt đầu luyện tập ") + "</a>" +
        (attempted ? '<button type="button" class="hit-lab__rec" data-lab="record" data-rec="' + Y.esc(recId) + '">xem xét ghi chép</button>' : "") +
      "</div>";
    }
    var body;
    if (labSkill === "listening") {
      var sets = {};
      cards.forEach(function (it) {
        if (!sets[it.paperId]) sets[it.paperId] = { date: it.date, paperId: it.paperId, items: [] };
        sets[it.paperId].items.push(it);
      });
      var blocks = Object.keys(sets).sort().reverse().map(function (pid) {
        var set = sets[pid];
        set.items.sort(function (a, b) { return a.taskIndex - b.taskIndex; });
        var st = Lab.setResults(set.items);
        if (labFilter === "todo" && st.attempted && st.done >= st.total) return "";
        var setHref = Lab.hrefSet("listening", pid, labType, "practice");
        var rows = set.items.map(function (it) {
          var row = Lab.cardResults(it);
          var label = (it.listenCode || "") + (it.titleEn && !/^(q\d+|choose a response)/i.test(it.titleEn)
            ? " · " + Lab.displayTitle(it) : "");
          var href = Lab.hrefOf(it, "practice");
          var cls = "hit-lab__row" + (row.attempted ? (row.ok === row.total && row.total ? " is-ok" : " is-bad") : "");
          return '<a class="' + cls + '" href="' + Y.esc(href) + '"><span>' + Y.esc(label) +
            "</span><em>" + Y.esc(statusTxt(row, "listening")) + "</em></a>";
        }).join("");
        return '<article class="hit-lab__set">' +
          '<header class="hit-lab__set-head">' +
            "<h3>Set " + Y.esc(set.date) + "</h3>" +
            "<span>" + st.done + "/" + st.total + "</span>" +
            acts(setHref, "set|" + pid + "|" + labType, st.attempted) +
          "</header>" + rows +
        "</article>";
      }).filter(Boolean).join("");
      body = blocks || emptyBox(" không có phù hợp với lọc của chủ đề ", " trao đổi một dùng trong | chủ đề khuôn có thể lọc lại thử ", "zone.html?zone=toefl&s=lab", " xem xét toàn bộ ");
    } else {
      var countWord = labSkill === "reading" && labType === "complete_words" ? " trống không " : " Câu hỏi ";
      body = cards.length
        ? '<div class="hit-lab__grid">' + cards.map(function (it) {
          var href = Lab.hrefOf(it, "practice");
          var st = Lab.cardResults(it);
          return '<article class="hit-lab__card">' +
            '<p class="hit-lab__kicker">' + Y.esc(Lab.typeLabel(it.skill, it.type)) +
              (it.hot ? " · tần số cao " : "") + " · " + it.itemCount + " " + countWord + "</p>" +
            "<h3>" + Y.esc(Lab.displayTitle(it)) + "</h3>" +
            "<p>" + Y.esc(it.date) + "</p>" +
            '<p class="hit-lab__stat">' + Y.esc(statusTxt(st, labSkill)) + "</p>" +
            acts(href, "card|" + it.skill + "|" + it.paperId + "|" + it.taskIndex, st.attempted) +
          "</article>";
        }).join("") + "</div>"
        : emptyBox(" không có phù hợp với lọc của chủ đề ", " trao đổi một dùng trong | chủ đề khuôn có thể lọc lại thử ", "zone.html?zone=toefl&s=lab", " xem xét toàn bộ ");
    }
    return '<section class="hit-lab" aria-label=" nhấn chủ đề khuôn làm sạch ">' +
      '<header class="hit-lab__intro"><h2>nhấn chủ đề khuôn làm sạch</h2><p>trước câu hỏi trắc nghiệm khuôn, lại nêu bật chủ đề chính mắt đi vào ETS máy móc đánh bề mặt tiếp xúc </p></header>' +
      chipRow("skill", Lab.SKILLS, labSkill) +
      chipRow("type", types, labType) +
      chipRow("filter", filters, labFilter) +
      body +
    "</section>";
  }

  function categoryHTML(cat) {
    var sub = Y.SUBJECT[cat.subject] || { color: "var(--c-cambridge)" };
    // ponytail: vocab desk owns its own title - skip generic subject head
    var head = cat.key === "vocab" ? "" : ('<div class="subject-group__head">' +
      '<span class="subject-dot" style="background:' + sub.color + '"></span>' +
      "<h2>" + Y.esc(cat.key === "jingting" && jtVol ? (" Cambridge IELTS " + jtVol) : cat.label) + '</h2><span class="cnt">' +
      (cat.key === "mock" || cat.key === "ielts" ? Y.camVolumes(allItems).length + " sách "
        : cat.key === "alevel" && alevelCatalog && window.YYSD_ALEVEL
          ? window.YYSD_ALEVEL.qpCount(alevelCatalog) + " Bộ "
        : (zone === "toefl" && TOEFL_SKILL[cat.key]
          ? (Y[TOEFL_SKILL[cat.key].list] || []).length + " Bộ "
          : countOf(cat.subject) + unitOf(cat.subject || ""))) +
      "</span></div>");

    var body;
    if (cat.key === "mock" || cat.key === "ielts") {
      var vols = Y.camVolumes(allItems);
      body = vols.length
        ? Y.cambridgeCatalogHTML(vols, allItems, "", { tier: camTier, query: searchQuery, collapseLegacy: true })
        : emptyBox(" tạm thời không có Cambridge câu hỏi từ đề thi các năm trước ", " giáo viên tải lên che đậy chủ đề hoàng hậu có thể xuất hiện tồn tại biến thể của | cũng có thể trước làm mục đơn lẻ thính giác có thể đọc luyện tập ", "zone.html?zone=mock&s=listening", " đi luyện tập thính giác ");
    } else if (zone === "toefl" && cat.soon) {
      body = emptyBox(cat.label + " sắp lên mạng ", " bốn ngành học máy móc đánh đã nở hoa, này một ngành học ngay sau đó trở thành thành viên ", "zone.html?zone=toefl", " trở về TOEFL cái nhìn tổng quan ");
    } else if (zone === "toefl" && TOEFL_SKILL[cat.key]) {
      body = toeflPaperCards(cat.key);
    } else if (zone === "mock" && (cat.key === "listening" || cat.key === "reading" || cat.key === "writing")) {
      var skillVols = Y.camVolumes(allItems.filter(function (it) { return it.subject === cat.subject; }));
      body = skillVols.length
        ? Y.cambridgeCatalogHTML(skillVols, allItems, "", {
            tier: camTier,
            query: searchQuery,
            collapseLegacy: true,
            skill: cat.skill || ""
          })
        : emptyBox(" nên môn học tạm thời không có nội dung ", " trước thử thử khác môn học, có thể một lát nữa lại đến ", "zone.html?zone=mock", " trở về IELTS cái nhìn tổng quan ");
    } else if (cat.key === "jingting") {
      var jtItems = itemsOf("jingting");
      body = jtItems.length && Y.jingtingCatalogHTML
        ? Y.jingtingCatalogHTML(jtItems, "", { vol: jtVol, query: searchQuery, tier: camTier })
        : emptyBox(" tạm thời không có tinh chất cười nội dung ", " tinh chất cười liệu tải lên hoàng hậu có thể xuất hiện tồn tại biến thể của | ", "zone.html?zone=mock&s=listening", " trở về thính giác ");
    } else if (cat.href) {
      body = '<a class="bento-cta" href="' + Y.esc(cat.href) + '">' +
        '<div><p class="bento-cta__title">' + Y.esc(cat.label) + "</p>" +
        '<p class="bento-cta__desc">' + Y.esc(cat.desc || "") + "</p></div>" +
        '<span class="spk-cta-go">đi vào ›</span></a>';
    } else if (cat.key === "alevel") {
      var A = window.YYSD_ALEVEL;
      var qp = alevelCatalog ? A.qpCount(alevelCatalog) : 0;
      body = alevelCatalog && A.hasContent(alevelCatalog)
        ? '<p class="alevel-zone-intro">CAIE phổ biến môn học câu hỏi từ đề thi các năm trước · trực tuyến xem trước · miễn phí tải xuống · đã bao gồm ' + qp + " Bộ</p>" +
          A.catalogPreviewHTML(alevelCatalog, "", 6) +
          '<div class="alevel-zone-more"><a class="btn btn--primary pressable" href="alevel.html">đi vào A-Level Ngân hàng đề →</a></div>'
        : '<div class="soon-box">A-Level câu hỏi từ đề thi các năm trước chuẩn bị Trung Quốc, kính mời mong chờ </div>';
    } else if (cat.key === "vocab") {
      body = vocabBentoHTML();
    } else if (cat.children) {
      body = '<div class="leaf-wrap">' + cat.children.map(nodeBlockHTML).join("") + "</div>";
    } else {
      body = leafBody(cat.subject, cat.skill);
    }
    var accent = cat.skill || (cat.key === "mock" || cat.key === "ielts" ? "mock" : cat.key);
    return '<div class="subject-group subject-group--' + Y.esc(accent) + '">' + head + body + "</div>";
  }

  function syncZoneQuery() {
    if (zone !== "mock" && zone !== "toefl") return;
    try {
      var u = new URL(location.href);
      var cur = u.searchParams.get("s") || "";
      var want = activeCat === "all" ? "" : activeCat;
      var changed = false;
      if (!want) {
        if (cur) { u.searchParams.delete("s"); changed = true; }
      } else if (cur !== want) {
        u.searchParams.set("s", want);
        changed = true;
      }
      if (activeCat === "jingting" && jtVol) {
        if (u.searchParams.get("vol") !== jtVol) {
          u.searchParams.set("vol", jtVol);
          changed = true;
        }
      } else if (u.searchParams.has("vol")) {
        u.searchParams.delete("vol");
        changed = true;
      }
      if (activeCat === "lab") {
        if (u.searchParams.get("skill") !== labSkill) { u.searchParams.set("skill", labSkill); changed = true; }
        if (labType && u.searchParams.get("type") !== labType) { u.searchParams.set("type", labType); changed = true; }
        if (labFilter && labFilter !== "all") {
          if (u.searchParams.get("f") !== labFilter) { u.searchParams.set("f", labFilter); changed = true; }
        } else if (u.searchParams.has("f")) { u.searchParams.delete("f"); changed = true; }
      } else {
        ["skill", "type", "f"].forEach(function (k) {
          if (u.searchParams.has(k)) { u.searchParams.delete(k); changed = true; }
        });
      }
      if (!changed) return;
      history.replaceState(null, "", u.pathname + u.search + u.hash);
    } catch (e) { /* ignore */ }
  }

  function syncToolbar() {
    if (!toolbarEl) return;
    /* ponytail: IELTS hub / vocab hub are portals - hide search (vocab always) */
    var isIeltsHub = zone === "mock" && activeCat === "all" && !searchQuery;
    var isToeflHub = zone === "toefl" && activeCat === "all" && !searchQuery;
    var isVocabHub = zone === "study" && activeCat === "vocab";
    var hub = isIeltsHub || isToeflHub || isVocabHub;
    document.body.classList.toggle("is-ielts-hub", isIeltsHub || isToeflHub);
    document.body.classList.toggle("is-vocab-hub", isVocabHub);
    toolbarEl.hidden = hub;
    toolbarEl.setAttribute("aria-hidden", hub ? "true" : "false");
    // ponytail: .catalog-toolbar { display:flex } overrides [hidden]
    toolbarEl.style.display = hub ? "none" : "";
    if (hub) syncZoneQuery();
  }

  syncToolbar();

  function render() {
    syncToolbar();
    var html;
    if (searchQuery && zone === "toefl" && activeCat === "lab") {
      html = toeflLabHTML();
    } else if (searchQuery) {
      var matched = Y.searchItems(allItems, searchQuery);
      html = '<div class="catalog-search-meta">tìm thấy ' + matched.length + " dải kết trái</div>" +
        Y.searchResultsHTML(matched, "");
    } else if (zone === "mock" && activeCat === "all") {
      html = ieltsHubHTML();
    } else if (zone === "toefl" && activeCat === "all") {
      html = toeflHubHTML();
    } else if (zone === "toefl" && activeCat === "lab") {
      html = toeflLabHTML();
    } else if (zone === "toefl" && activeCat === "dates") {
      html = toeflDateHubHTML();
    } else {
      var aiTutorHTML = zone === "practice"
        ? '<a class="ai-tutor-entry pressable" href="ai-tutor.html">' +
            '<span class="ai-tutor-entry__badge" aria-hidden="true">AI</span>' +
            '<span class="ai-tutor-entry__body">' +
              '<span class="ai-tutor-entry__kicker">Featured</span>' +
              "<b>AI IELTS giáo viên</b>" +
              "<span>lời nói thông thường máy móc kinh điển luyện tập / tất cả thật bắt chước đánh · viết chấm · bất kỳ lúc nào mở luyện tập</span>" +
            "</span>" +
            '<span class="ai-tutor-entry__cta">ngay lập tức bắt đầu <span aria-hidden="true">→</span></span>' +
          "</a>"
        : "";
      var cats = activeCat === "all" ? visibleNav()
        : activeCat === "jingting" && navCat("jingting") ? [navCat("jingting")]
        : visibleNav().filter(function (c) { return c.key === activeCat; });
      html = aiTutorHTML + cats.map(categoryHTML).join("");
      if (activeCat === "jingting" && !cats.length) {
        html = emptyBox(" tạm thời không có tinh chất cười nội dung ", " tinh chất cười liệu tải lên hoàng hậu có thể xuất hiện tồn tại biến thể của | ", "zone.html?zone=mock&s=listening", " trở về thính giác ");
      }
    }
    function bindJtFolds(root) {
      if (!root) return;
      root.querySelectorAll("details.catalog-collapse--jt").forEach(function (d) {
        if (d.dataset.jtBound) return;
        d.dataset.jtBound = "1";
        var body = d.querySelector(":scope > .catalog-collapse__body");
        var summary = d.querySelector(":scope > summary");
        if (!body || !summary) return;
        // init height
        if (d.open) {
          body.style.height = "auto";
        } else {
          body.style.height = "0px";
        }
        summary.addEventListener("click", function (e) {
          e.preventDefault();
          if (d.classList.contains("is-animating")) return;
          d.classList.add("is-animating");
          if (d.open) {
            // close
            d.classList.add("is-closing");
            body.style.height = body.scrollHeight + "px";
            body.offsetHeight;
            body.style.height = "0px";
            window.setTimeout(function () {
              d.open = false;
              d.classList.remove("is-closing", "is-animating");
            }, 340);
          } else {
            d.open = true;
            d.classList.add("is-opening");
            body.style.height = "0px";
            body.offsetHeight;
            body.style.height = body.scrollHeight + "px";
            window.setTimeout(function () {
              body.style.height = "auto";
              d.classList.remove("is-opening", "is-animating");
            }, 340);
          }
        });
      });
    }

    function afterRender() {
      if (window.YYSD_AI_WORD && window.YYSD_AI_WORD.bind) window.YYSD_AI_WORD.bind(contentEl);
      bindJtFolds(contentEl);
      bindVocabDesk(contentEl);
    }
    if (window.YYSD_UI_SWAP && contentEl.innerHTML && !contentEl.querySelector(".spinner--brand")) {
      window.YYSD_UI_SWAP(contentEl, html);
      // ponytail: UI_SWAP writes DOM after 160ms; bind must wait
      setTimeout(afterRender, 180);
    } else {
      contentEl.innerHTML = html;
      if (window.YYSD_UI_REVEAL) window.YYSD_UI_REVEAL(contentEl.querySelectorAll(".reveal"));
      afterRender();
    }
  }

  buildFilters();

  function finishZoneLoad(items) {
    var allow = (Y.ZONE_SUBJECTS && Y.ZONE_SUBJECTS[zone]) || null;
    allItems = items.filter(function (it) {
      if (it.zone !== zone) return false;
      if (zone === "study" && it.subject === "grammar") return false;
      if (zone === "mock" && it.subject === "ielts") return false;
      // IELTS khu vực(mock)chỉ giữ IELTS môn học; A-Level đi quốc tế khóa học alevel.html
      if (allow && allow.indexOf(it.subject) < 0) return false;
      return true;
    });
    buildFilters();
    render();
  }

  var manifestP = Y.load();
  // A-Level catalog only on Chương trình quốc tế pages - not in IELTS/mock zone
  var catalogP = Promise.resolve(null);

  Promise.all([manifestP, catalogP]).then(function (res) {
    var go = function () { finishZoneLoad(res[0]); };
    // First-time student must finish vocab placement before using Khu vực từ vựng
    if (zone === "study" && activeCat === "vocab" && window.YYSD_DIAG_GATE) {
      window.YYSD_DIAG_GATE.ensure({ requireLogin: true }).then(function (ok) {
        if (ok) go();
      });
      return;
    }
    go();
  }).catch(function (err) {
    var msg = location.protocol === "file:"
      ? " mời đi qua trang web(http://)thăm gốc trạm, địa phương nhấp đúp mở có thể chăn trình duyệt đánh chặn "
      : err.message;
    contentEl.innerHTML = '<div class="state state--brand"><h3>Tải không thành công</h3><p>' + Y.esc(msg) + '</p></div>';
  });

  document.getElementById("year").textContent = new Date().getFullYear();
})();
