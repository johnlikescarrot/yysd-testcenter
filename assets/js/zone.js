/* =========================================================================
   zone.js — zone catalog with search, tier filters, collapsible groups
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

  document.title = z.label + " · Trung tâm Luyện thi Quốc tế YYSD ";
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
        activeCat === "mock" || (activeCat === "jingting" &&!jtVol)) &&
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
      { id: "all", label: " Tất cả quyển " },
      { id: "new", label: " mới nhất Vol.19+" },
      { id: "mid", label: " tiến giai Vol.13–18" },
      { id: "base", label: " trụ cột Vol.7–12" }
    ];
    subFiltersEl.innerHTML = tiers.map(function (t) {
      return '<button type="button" class="chip chip--sub' + (camTier === t.id? " is-active": "") +
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
    var list = zone === "mock"? nav.filter(catHasContent): nav;
    // ponytail: Nghe sâu đọng ở Nghe links hạ, không chiếm độc lập chip / hub nhóm
    if (zone === "mock") list = list.filter(function (c) { return c.key!== "jingting"; });
    return list;
  }

  function navCat(key) {
    return nav.filter(function (c) { return c.key === key; })[0];
  }

  function buildFilters() {
    var chips = ['<button type="button" class="chip' + (activeCat === "all"? " is-active": "") + '" data-s="all"> Tất cả </button>'];
    visibleNav().forEach(function (c) {
      chips.push('<button type="button" class="chip' + (activeCat === c.key? " is-active": "") +
        '" data-s="' + c.key + '">' + Y.esc(c.label) + "</button>");
    });
    // Nghe sâu từ Nghe cửa vào Vào học lúc, thanh điều hướng bổ một quả trước mắt chip
    if (activeCat === "jingting") {
      chips.push('<button type="button" class="chip is-active" data-s="jingting"> Nghe sâu (Intensive Listening) </button>');
    }
    filtersEl.innerHTML = chips.join("");
    // ponytail: only reset after items load; early empty nav was wiping s=ielts → all
    if (zone === "mock" && activeCat!== "all" && activeCat!== "jingting" && allItems.length &&
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
      searchInput.placeholder = next === "lab"? " tìm kiếm đề mục tên …": " tìm kiếm TOEFL bộ câu …";
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
    if (!b ||!contentEl.contains(b)) return;
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
    if (!Lab ||!labIndex) return;
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
      items = card? Lab.cardResults(card).items: [];
    }
    var box = document.createElement("div");
    box.id = "lab-sheet";
    box.className = "hit-lab-sheet";
    box.innerHTML = '<div class="hit-lab-sheet__box"><h3> Xem ghi chép </h3>' +
      (items.length
        ? '<div class="hit-lab-sheet__list">' + items.map(function (d) {
          return '<div class="hit-lab-sheet__row ' + (d.ok? "is-ok": "is-bad") + '"><b>Q' +
            Y.esc(String(d.no)) + "</b><span>" + (d.ok? "Đúng": "Sai") +
            "</span><span> của bạn: " + Y.esc(d.ua || " (Chưa trả lời) ") +
            (d.expect? " · đang giải: " + Y.esc(d.expect): "") + "</span></div>";
        }).join("") + "</div>"
        : "<p> còn không có đáp lại ghi chép. </p>") +
      '<button type="button" class="btn btn--ghost btn--sm" data-lab="sheet-close"> Đóng </button></div>';
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
    searchInput.placeholder = zone === "mock"? " tìm kiếm Thi thử, quyển mấy, Test…"
      : (zone === "toefl"? (activeCat === "lab"? " tìm kiếm đề mục tên …": " tìm kiếm TOEFL bộ câu …"): " tìm kiếm nội dung tên …");
    var onSearch = window.YYSD_DEBOUNCE? window.YYSD_DEBOUNCE(function () {
      searchQuery = searchInput.value.trim();
      buildSubFilters();
      render();
    }, 200): function () {
      searchQuery = searchInput.value.trim();
      buildSubFilters();
      render();
    };
    searchInput.addEventListener("input", onSearch);
  }

  function itemsOf(subject) {
    return allItems.filter(function (it) { return it.subject === subject; })
      .sort(function (a, b) {
        return String(a.title).localeCompare(String(b.title), "zh-Hans-CN", { numeric: true, sensitivity: "base" });
      });
  }

  function emptyBox(title, desc, href, cta) {
    return '<div class="soon-box soon-box--rich">' +
      "<h3>" + Y.esc(title) + "</h3>" +
      "<p>" + Y.esc(desc) + "</p>" +
      (href
        ? '<a class="btn btn--ghost btn--sm" href="' + Y.esc(href) + '">' + Y.esc(cta || " Quay lại IELTS ") + "</a>"
        : "") +
      "</div>";
  }

  function leafBody(subject, skill) {
    if (subject === "ielts-speaking") {
      return '<div class="spk-cta-grid bento-grid bento-grid--3">' +
        '<a class="bento-cta" href="speaking.html">' +
          '<span class="bento-cta__badge">Part 1</span>' +
          '<div><p class="bento-cta__title"> Nói Thi thử </p>' +
          '<p class="bento-cta__desc"> ghi âm đáp lại · AI tứ duy cho điểm </p></div>' +
          '<span class="spk-cta-go"> Vào học ›</span></a>' +
        '<a class="bento-cta bento-cta--teal" href="speaking-select.html">' +
          '<span class="bento-cta__badge"> Chuyên sâu </span>' +
          '<div><p class="bento-cta__title"> Chuyên sâu Chọn đề </p>' +
          '<p class="bento-cta__desc"> phác thảo chọn chủ đề, tổ một bộ Part 1</p></div>' +
          '<span class="spk-cta-go"> Chọn đề ›</span></a>' +
        '<a class="bento-cta bento-cta--orange" href="ai-tutor.html">' +
          '<span class="bento-cta__badge">AI</span>' +
          '<div><p class="bento-cta__title">AI Trợ giảng IELTS </p>' +
          '<p class="bento-cta__desc"> Nói cơ trải qua / Viết phê chữa </p></div>' +
          '<span class="spk-cta-go"> Vào học ›</span></a></div>';
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
    return emptyBox(" nên khối Sắp ra mắt ", " nội dung đang chuẩn bị, đi trước Khác kỹ năng Luyện tập, hoặc từ IELTS quan sát lựa chọn lần nữa. ", "zone.html?zone=mock", " Quay lại IELTS quan sát ");
  }

  function countOf(subject) {
    if (subject === "ielts-speaking") return 1;
    if (Y.isCambridge(subject)) return Y.camVolumes(allItems.filter(function (it) { return it.subject === subject; })).length;
    if (subject === "jingting") {
      return Y.jingtingVolumes? Y.jingtingVolumes(itemsOf(subject)).length: itemsOf(subject).length;
    }
    return itemsOf(subject).length;
  }
  function unitOf(subject) { return (Y.isCambridge(subject) || subject === "jingting")? " quyển ": " bài "; }

  // Vocab hub — Học tập đài: trái Tiến độ quỹ + phải chủ module; chẩn đoán năng lực / mỗi ngày từ đơn là chips
  function dailyWordChipMeta() {
    var dwTask = null;
    var dwResult = null;
    try {
      dwTask = JSON.parse(localStorage.getItem("yysd:daily-word:task") || "null");
      dwResult = JSON.parse(localStorage.getItem("yysd:daily-word:result") || "null");
    } catch (e) {}
    function pad(n) { return (n < 10? "0": "") + n; }
    var today = (function (d) {
      return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    })(new Date());
    var resume =!!(dwTask && dwTask.wordList && dwTask.wordList.length &&!dwTask.completed);
    var done =!resume &&!!(dwResult && dwResult.date === today);
    if (resume) {
      return { href: "daily-word-learn.html", label: " mỗi ngày Từ vựng · Tiếp tục ", state: "is-resume" };
    }
    if (done) {
      return { href: "daily-word-result.html", label: " mỗi ngày Từ vựng · Đã hoàn thành ", state: "is-done" };
    }
    return { href: "daily-word-setup.html", label: " mỗi ngày Từ vựng ", state: "is-idle" };
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

    return '<section class="vocab-desk" data-vocab-desk aria-label=" Từ vựng Học tập đài ">' +
      '<aside class="vocab-desk__rail" aria-label=" Học tập Tiến độ ">' +
        '<p class="vocab-desk__rail-kicker"> Học tập Tiến độ </p>' +
        '<ul class="vocab-desk__stats">' +
          '<li><span> giá sách bản mấy </span><b data-desk="shelfBooks">—</b></li>' +
          '<li><span> từ sách Học tập </span><b data-desk="activeLists">—</b></li>' +
          '<li><span> hôm nay Đã học </span><b data-desk="todayWords">—</b></li>' +
          '<li><span> tuần này Đã học </span><b data-desk="weekWords">—</b></li>' +
        "</ul>" +
        '<div class="vocab-desk__chips">' +
          '<a class="vocab-desk__chip" href="diagnostic.html"> Chẩn đoán năng lực </a>' +
          '<a class="vocab-desk__chip vocab-desk__chip--' + dw.state + '" href="' + Y.esc(dw.href) + '">' +
            Y.esc(dw.label) + "</a>" +
        "</div>" +
      "</aside>" +
      '<div class="vocab-desk__main">' +
        '<header class="vocab-desk__head">' +
          '<div class="vocab-desk__head-copy">' +
            '<p class="vocab-desk__brand"> YYSD · Từ vựng </p>' +
            "<h2> Học tập đài </h2>" +
            "<p> từ kho Học tập · vượt ải giải tỏa · Đánh giá củng cố · câu sai nấu lại. </p>" +
          "</div>" +
          bookSvg +
        "</header>" +
        '<div class="vocab-desk__mods" role="navigation" aria-label=" Từ vựng chủ module ">' +
          mod("shelf", "vocab-shelf.html", "01", " từ kho ", " giá sách bản mấy ", "—", " tục học ", "—", " Vào học giá sách ", "vocab-shelf.html") +
          mod("challenge", "vocab-challenge.html", "02", " Vượt ải từ vựng ", " trước mắt màn ", "—", " trắc nghiệm bộ phận trì ", "—", " Bắt đầu vượt ải ", "vocab-challenge.html") +
          mod("quiz", "vocab-quiz.html", "03", " Từ vựng Đánh giá ", " tuần này số lần ", "—", " gần nhất Tỷ lệ đúng ", "—", " Bắt đầu Đánh giá ", "vocab-quiz.html") +
          mod("wrong", "wrong-words.html", "04", " Sổ lỗi sai ", " đợi Ôn tập buổi diễn ", "—", " từ sai mấy ", "—", " đi Ôn tập ", "wrong-words.html") +
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
      set("shelf-m1", "0 bản ");
      set("shelf-m2", "0");
      set("quiz-m1", "0");
      set("quiz-m2", "—");
      set("wrong-m1", "0");
      set("wrong-m2", "0");
      set("challenge-m1", "—");
      set("challenge-m2", "—");
    }
    if (!A ||!A.getToken ||!A.getToken() ||!A.api) {
      paintGuest();
      return;
    }
    Promise.all([
      A.api("/api/vocab-shelf/desk"),
      A.api("/api/vocab-challenge/me").catch(function () { return null; })
    ]).then(function (pair) {
      var d = pair[0];
      var ch = pair[1];
      if (!d ||!d.ok) { paintGuest(); return; }
      set("shelfBooks", String(d.shelfBooks || 0));
      set("activeLists", d.continueLearn && d.continueLearn.listLabel
        ? String(d.continueLearn.listLabel)
        : String(d.activeLists || 0));
      set("todayWords", String(d.todayWords || 0));
      set("weekWords", String(d.weekWords || 0));
      set("shelf-m1", (d.shelfBooks || 0) + " bản ");
      set("shelf-m2", d.continueLearn && d.continueLearn.listLabel
        ? String(d.continueLearn.listLabel)
        : String(d.activeLists || 0));
      set("quiz-m1", String(d.weekQuizzes || 0));
      set("quiz-m2", d.lastAccuracy!= null? d.lastAccuracy + "%": "—");
      set("wrong-m1", String(d.pendingSessions || 0));
      set("wrong-m2", String(d.mistakeWords || 0));
      if (ch && ch.needsBook && ch.assignments && ch.assignments.length > 1) {
        set("challenge-m1", ch.assignments.length + " bản ");
        set("challenge-m2", " chọn từ quyển ");
        setCta("challenge-cta", "vocab-challenge.html", " đi vượt ải ");
      } else if (ch && ch.assigned && ch.progress) {
        var totalDays = (ch.progress && ch.progress.totalDays) || 78;
        var bookHref = "vocab-challenge.html" +
          (ch.assignment && ch.assignment.bookId
            ? "?book=" + encodeURIComponent(ch.assignment.bookId)
            : "");
        if (ch.programComplete) {
          set("challenge-m1", "Đã hoàn thành");
          setCta("challenge-cta", bookHref, " Xem Tiến độ ");
        } else if (ch.progressDay) {
          set("challenge-m1", " thứ " + Math.min(ch.progressDay, totalDays) + " màn ");
          setCta("challenge-cta", bookHref, ch.activeAttemptId? " Tiếp tục vượt ải ": " đi vượt ải ");
        } else {
          set("challenge-m1", "L" + (ch.progress.nextListNo || 1));
          setCta("challenge-cta", bookHref, " đi vượt ải ");
        }
        set("challenge-m2", String((ch.pool && ch.pool.active) || 0));
      } else {
        set("challenge-m1", " đợi bố trí ");
        set("challenge-m2", "—");
        setCta("challenge-cta", "vocab-challenge.html", " Xem vượt ải ");
      }
      if (d.continueLearn) {
        setCta("shelf-cta", d.continueLearn.href, " tục học · " + (d.continueLearn.listLabel || "List"));
      } else if ((d.shelfBooks || 0) > 0) {
        setCta("shelf-cta", "vocab-shelf.html", " Tiếp tục Học tập ");
      } else {
        setCta("shelf-cta", "vocab-shelf.html", " tăng thêm từ sách ");
      }
      if (d.continueQuiz) {
        setCta("quiz-cta", d.continueQuiz.href, " tục trắc · " + (d.continueQuiz.label || " Đánh giá "));
      }
      if (d.continueWrong) {
        setCta("wrong-cta", d.continueWrong.href, " tục Ôn tập · " + (d.continueWrong.wrongCount || "") + " từ ");
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
    // hub chỉ lưu lại Nghe / Đọc / Nói / Viết / Thi thử năm hàng; Nghe sâu đang nghe lực links dặm
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
              { href: "speaking.html", label: " Nói Thi thử " },
              { href: "speaking-select.html", label: " Chuyên sâu Chọn đề " },
              { href: "ai-tutor.html", label: "AI Trợ giảng IELTS " }
            ]
          : [{ href: headHref, label: cat.desc || cat.label }];
      return '<article class="ielts-hub__card ielts-hub__card--' + Y.esc(cat.key) + '">' +
        '<a class="ielts-hub__hit" href="' + Y.esc(headHref) + '">' +
          '<span class="ielts-hub__ico" aria-hidden="true">' + (Y.skillGlyph? Y.skillGlyph(cat.key): "") + "</span>" +
          '<span class="ielts-hub__eyebrow">' + Y.esc(en[cat.key] || "") + "</span>" +
          "<h3>" + Y.esc(cat.label) + "</h3>" +
          '<p class="ielts-hub__desc">' + Y.esc(cat.desc || "") + "</p>" +
        "</a>" +
        '<ul class="ielts-hub__links">' +
          links.map(function (l) {
            return '<li><a href="' + Y.esc(l.href) + '">' + Y.esc(l.label) + "</a></li>";
          }).join("") +
        "</ul>" +
        '<a class="ielts-hub__go" href="' + Y.esc(headHref) + '"> Vào học ' + Y.esc(cat.label) + " <span aria-hidden=\"true\">›</span></a>" +
      "</article>";
    }).join("");

    return '<section class="ielts-hub" aria-label=" IELTS cửa vào ">' +
      '<header class="ielts-hub__intro">' +
        '<p class="ielts-hub__kicker">Cambridge IELTS</p>' +
        "<h2> lựa chọn huấn luyện của bạn đường nhỏ </h2>" +
        "<p> thi đơn chặt chẽ đặt nền móng, bộ câu Thi thử luyện trường thi. bốn khoa khẩu âm rõ ràng, chút:điểm đi vào chính là đối ứng Ngân hàng đề. </p>" +
      "</header>" +
      '<div class="ielts-hub__grid">' + cards + "</div>" +
    "</section>";
  }

  var TOEFL_SKILL = {
    full: { list: "TOEFL_FULL", page: "toefl-full.html", badge: " toàn bộ cuốn ", empty: " tạm thời chưa có Đầy đủ bộ câu " },
    reading: { list: "TOEFL_READING", page: "toefl-reading.html", badge: "Đọc", empty: " tạm thời chưa có Đề thi Đọc " },
    listening: { list: "TOEFL_LISTENING", page: "toefl-listening.html", badge: "Nghe", empty: " tạm thời chưa có Đề thi Nghe " },
    writing: { list: "TOEFL_WRITING", page: "toefl-writing.html", badge: "Viết", empty: " tạm thời chưa có Đề thi Viết " },
    speaking: { list: "TOEFL_SPEAKING", page: "toefl-speaking.html", badge: "Nói", empty: " tạm thời chưa có Nói đề thi thật " }
  };

  function toeflPaperCards(skill) {
    var spec = TOEFL_SKILL[skill] || TOEFL_SKILL.reading;
    var papers = Y[spec.list] || [];
    if (!papers.length) {
      return emptyBox(spec.empty, " đề mục thượng truyền(*upload) sau sẽ xuất hiện ở chỗ này. ", "zone.html?zone=toefl", " Quay lại TOEFL quan sát ");
    }
    return '<div class="exam-grid">' + papers.map(function (p) {
      var practice = spec.page + "?id=" + encodeURIComponent(p.id) + "&mode=practice";
      var mock = spec.page + "?id=" + encodeURIComponent(p.id) + "&mode=mock";
      return '<article class="exam-card">' +
        '<div class="exam-card__top"><span class="badge badge--toefl-' + skill + '">' + spec.badge + "</span></div>" +
        "<h3>" + Y.esc(p.title) + "</h3>" +
        "<p>" + Y.esc(p.desc || "") + "</p>" +
        '<div class="exam-card__meta"><span>⏱️ ' + Y.esc(String(p.duration || 30)) + " phút </span></div>" +
        '<div class="exam-card__foot toefl-card-acts">' +
          '<a class="btn btn--ghost btn--sm" href="' + practice + '"> Luyện tập </a>' +
          '<a class="btn btn--primary btn--sm" href="' + mock + '"> Thi thử </a>' +
        "</div></article>";
    }).join("") + "</div>";
  }

  function toeflDoorCards(keys, opts) {
    opts = opts || {};
    var en = { lab: "By Type", dates: "By Date", full: "Full Test", listening: "Listening", reading: "Reading", speaking: "Speaking", writing: "Writing" };
    var kindOf = { lab: "reading", dates: "mock", full: "mock" };
    var cards = nav.filter(function (cat) { return keys.indexOf(cat.key) >= 0; }).map(function (cat) {
      var soon =!!cat.soon;
      var headHref = soon? "": ("zone.html?zone=toefl&s=" + encodeURIComponent(cat.key));
      var hit = soon
        ? '<div class="ielts-hub__hit">'
        : '<a class="ielts-hub__hit" href="' + Y.esc(headHref) + '">';
      var hitEnd = soon? "</div>": "</a>";
      var go = soon
        ? '<span class="ielts-hub__go is-soon"> Sắp ra mắt </span>'
        : '<a class="ielts-hub__go" href="' + Y.esc(headHref) + '"> Vào học ' + Y.esc(cat.label) + ' <span aria-hidden="true">›</span></a>';
      var kind = kindOf[cat.key] || cat.key;
      var glyph = cat.key === "lab"? "reading": (cat.key === "dates"? "mock": cat.key);
      return '<article class="ielts-hub__card ielts-hub__card--' + Y.esc(kind) + (soon? " is-soon": "") + '">' +
        hit +
          '<span class="ielts-hub__ico" aria-hidden="true">' + (Y.skillGlyph? Y.skillGlyph(glyph): "") + "</span>" +
          '<span class="ielts-hub__eyebrow">' + Y.esc(en[cat.key] || "") + "</span>" +
          "<h3>" + Y.esc(cat.label) + "</h3>" +
          '<p class="ielts-hub__desc">' + Y.esc(cat.desc || "") + "</p>" +
        hitEnd +
        go +
      "</article>";
    }).join("");
    return '<section class="ielts-hub" aria-label="' + Y.esc(opts.aria || " TOEFL cửa vào ") + '">' +
      '<header class="ielts-hub__intro">' +
        '<p class="ielts-hub__kicker">Enhanced TOEFL iBT</p>' +
        "<h2>" + Y.esc(opts.h2 || " lựa chọn phương thức huấn luyện ") + "</h2>" +
        "<p>" + Y.esc(opts.p || "") + "</p>" +
        (opts.link? '<p><a class="ielts-hub__go" href="' + Y.esc(opts.link.href) + '">' +
          Y.esc(opts.link.label) + ' <span aria-hidden="true">›</span></a></p>': "") +
      "</header>" +
      '<div class="' + Y.esc(opts.grid || "ielts-hub__grid") + '">' + cards + "</div>" +
    "</section>";
  }

  function toeflHubHTML() {
    return toeflDoorCards(["lab", "dates"], {
      aria: " TOEFL cửa vào ",
      h2: " lựa chọn phương thức huấn luyện ",
      p: " theo như dạng bài mở ra chặt chẽ một bài, hoặc theo như cuộc thi nhật tiến nhập cả cuốn Luyện tập và Thi thử. ",
      link: { href: "toefl-score.html", label: " Bảng điểm và Thi thử Lịch sử " },
      grid: "ielts-hub__grid ielts-hub__grid--2"
    });
  }

  function toeflDateHubHTML() {
    return toeflDoorCards(["reading", "listening", "speaking", "writing"], {
      aria: " theo như cuộc thi ngày Thi thử ",
      h2: " theo như cuộc thi ngày Thi thử ",
      p: " theo như cuộc thi nhật tiến nhập thi đơn Luyện tập và Thi thử. Đầy đủ liền khảo thi mời được cơ khảo thi hệ thống Mock Test. ",
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
    if (!Lab) return emptyBox(" chặt chẽ mục lục không thêm năm ", " mời Làm mới sau Thử lại. ", "zone.html?zone=toefl", " Quay lại TOEFL quan sát ");
    if (!labIndex) {
      loadLabThen(render);
      return '<div class="state state--brand"><p> Đang tải dạng bài mục lục …</p></div>';
    }
    var types = Lab.TYPES[labSkill] || Lab.TYPES.reading;
    if (!types.some(function (t) { return t.key === labType; })) labType = types[0].key;
    var filters = labSkill === "listening"? Lab.FILTERS_LISTEN: Lab.FILTERS;
    if (!filters.some(function (f) { return f.key === labFilter; })) labFilter = "all";
    var q = (searchQuery || "").toLowerCase();
    var cards = labIndex.filter(function (it) {
      if (it.skill!== labSkill || it.type!== labType) return false;
      if (labFilter === "todo" && Lab.isDone(it)) return false;
      if (labFilter === "hot" &&!it.hot) return false;
      if (labFilter === "fav" &&!Lab.isFavCard(it)) return false;
      var blob = (it.titleEn || it.title || "") + " " + (it.titleZh || "") + " " + it.date + " " + (it.listenCode || "");
      if (q && blob.toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    function chipRow(kind, items, cur) {
      return '<div class="chip-row">' + items.map(function (it) {
        return '<button type="button" class="chip' + (cur === it.key? " is-active": "") +
          '" data-lab="' + kind + '" data-v="' + Y.esc(it.key) + '">' + Y.esc(it.label) + "</button>";
      }).join("") + "</div>";
    }
    function statusTxt(st, kind) {
      if (!st.attempted) return " không làm ";
      if (kind === "speaking") return st.ok + "/" + st.total + " đã lục ";
      if (st.done >= st.total && st.total) return (st.ok === st.total? " Đúng toàn bộ ": (st.ok + "/" + st.total + "Đúng"));
      return st.ok + "/" + st.total;
    }
    function acts(href, recId, attempted) {
      return '<div class="hit-lab__acts">' +
        '<a class="hit-lab__go" href="' + Y.esc(href) + '">' + (attempted? " làm tiếp một lần ": " Bắt đầu luyện tập ") + "</a>" +
        (attempted? '<button type="button" class="hit-lab__rec" data-lab="record" data-rec="' + Y.esc(recId) + '"> Xem ghi chép </button>': "") +
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
          var label = (it.listenCode || "") + (it.titleEn &&!/^(q\d+|choose a response)/i.test(it.titleEn)
            ? " · " + Lab.displayTitle(it): "");
          var href = Lab.hrefOf(it, "practice");
          var cls = "hit-lab__row" + (row.attempted? (row.ok === row.total && row.total? " is-ok": " is-bad"): "");
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
      body = blocks || emptyBox(" không có phù hợp bộ lọc đề mục ", " đổi một cái dạng bài hoặc bộ lọc thử lại. ", "zone.html?zone=toefl&s=lab", " Xem Tất cả ");
    } else {
      var countWord = labSkill === "reading" && labType === "complete_words"? " chỗ trống ": " câu ";
      body = cards.length
        ? '<div class="hit-lab__grid">' + cards.map(function (it) {
          var href = Lab.hrefOf(it, "practice");
          var st = Lab.cardResults(it);
          return '<article class="hit-lab__card">' +
            '<p class="hit-lab__kicker">' + Y.esc(Lab.typeLabel(it.skill, it.type)) +
              (it.hot? " · Tần suất cao ": "") + " · " + it.itemCount + " " + countWord + "</p>" +
            "<h3>" + Y.esc(Lab.displayTitle(it)) + "</h3>" +
            "<p>" + Y.esc(it.date) + "</p>" +
            '<p class="hit-lab__stat">' + Y.esc(statusTxt(st, labSkill)) + "</p>" +
            acts(href, "card|" + it.skill + "|" + it.paperId + "|" + it.taskIndex, st.attempted) +
          "</article>";
        }).join("") + "</div>"
        : emptyBox(" không có phù hợp bộ lọc đề mục ", " đổi một cái dạng bài hoặc bộ lọc thử lại. ", "zone.html?zone=toefl&s=lab", " Xem Tất cả ");
    }
    return '<section class="hit-lab" aria-label=" theo như dạng bài chặt chẽ ">' +
      '<header class="hit-lab__intro"><h2> theo như dạng bài chặt chẽ </h2><p> trước Trắc nghiệm hình, gọi thêm đề mục Vào học ETS cơ khảo thi giao diện. </p></header>' +
      chipRow("skill", Lab.SKILLS, labSkill) +
      chipRow("type", types, labType) +
      chipRow("filter", filters, labFilter) +
      body +
    "</section>";
  }

  function categoryHTML(cat) {
    var sub = Y.SUBJECT[cat.subject] || { color: "var(--c-cambridge)" };
    // ponytail: vocab desk owns its own title — skip generic subject head
    var head = cat.key === "vocab"? "": ('<div class="subject-group__head">' +
      '<span class="subject-dot" style="background:' + sub.color + '"></span>' +
      "<h2>" + Y.esc(cat.key === "jingting" && jtVol? (" Cambridge IELTS " + jtVol): cat.label) + '</h2><span class="cnt">' +
      (cat.key === "mock" || cat.key === "ielts"? Y.camVolumes(allItems).length + " quyển "
        : cat.key === "alevel" && alevelCatalog && window.YYSD_ALEVEL
          ? window.YYSD_ALEVEL.qpCount(alevelCatalog) + " bộ "
        : (zone === "toefl" && TOEFL_SKILL[cat.key]
          ? (Y[TOEFL_SKILL[cat.key].list] || []).length + " bộ "
          : countOf(cat.subject) + unitOf(cat.subject || ""))) +
      "</span></div>");

    var body;
    if (cat.key === "mock" || cat.key === "ielts") {
      var vols = Y.camVolumes(allItems);
      body = vols.length
        ? Y.cambridgeCatalogHTML(vols, allItems, "", { tier: camTier, query: searchQuery, collapseLegacy: true })
        : emptyBox(" tạm thời chưa có Đề Cambridge IELTS ", " Giáo viên thượng truyền(*upload) bộ câu sau sẽ xuất hiện ở chỗ này. cũng có thể trước làm thi đơn Nghe hoặc Đọc Luyện tập. ", "zone.html?zone=mock&s=listening", " đi luyện Nghe ");
    } else if (zone === "toefl" && cat.soon) {
      body = emptyBox(cat.label + " Sắp ra mắt ", " bốn khoa cơ khảo thi đã mở thả, cái này một khoa sau đó gia nhập. ", "zone.html?zone=toefl", " Quay lại TOEFL quan sát ");
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
        : emptyBox(" nên kỹ năng tạm thời chưa có nội dung ", " thử trước một chút Khác kỹ năng, hoặc sau đó lại đến. ", "zone.html?zone=mock", " Quay lại IELTS quan sát ");
    } else if (cat.key === "jingting") {
      var jtItems = itemsOf("jingting");
      body = jtItems.length && Y.jingtingCatalogHTML
        ? Y.jingtingCatalogHTML(jtItems, "", { vol: jtVol, query: searchQuery, tier: camTier })
        : emptyBox(" tạm thời chưa có Nghe sâu nội dung ", " Nghe sâu trong tài liệu truyền sau sẽ xuất hiện ở chỗ này. ", "zone.html?zone=mock&s=listening", " Quay lại Nghe ");
    } else if (cat.href) {
      body = '<a class="bento-cta" href="' + Y.esc(cat.href) + '">' +
        '<div><p class="bento-cta__title">' + Y.esc(cat.label) + "</p>" +
        '<p class="bento-cta__desc">' + Y.esc(cat.desc || "") + "</p></div>" +
        '<span class="spk-cta-go"> Vào học ›</span></a>';
    } else if (cat.key === "alevel") {
      var A = window.YYSD_ALEVEL;
      var qp = alevelCatalog? A.qpCount(alevelCatalog): 0;
      body = alevelCatalog && A.hasContent(alevelCatalog)
        ? '<p class="alevel-zone-intro">CAIE môn học phổ biến đề thi thật · online Xem trước · miễn phí download · đã thu nhận sử dụng ' + qp + " bộ </p>" +
          A.catalogPreviewHTML(alevelCatalog, "", 6) +
          '<div class="alevel-zone-more"><a class="btn btn--primary pressable" href="alevel.html"> Vào học A-Level Ngân hàng đề →</a></div>'
        : '<div class="soon-box">A-Level đề thi thật trù bị Vừa, kính xin đợi. </div>';
    } else if (cat.key === "vocab") {
      body = vocabBentoHTML();
    } else if (cat.children) {
      body = '<div class="leaf-wrap">' + cat.children.map(nodeBlockHTML).join("") + "</div>";
    } else {
      body = leafBody(cat.subject, cat.skill);
    }
    var accent = cat.skill || (cat.key === "mock" || cat.key === "ielts"? "mock": cat.key);
    return '<div class="subject-group subject-group--' + Y.esc(accent) + '">' + head + body + "</div>";
  }

  function syncZoneQuery() {
    if (zone!== "mock" && zone!== "toefl") return;
    try {
      var u = new URL(location.href);
      var cur = u.searchParams.get("s") || "";
      var want = activeCat === "all"? "": activeCat;
      var changed = false;
      if (!want) {
        if (cur) { u.searchParams.delete("s"); changed = true; }
      } else if (cur!== want) {
        u.searchParams.set("s", want);
        changed = true;
      }
      if (activeCat === "jingting" && jtVol) {
        if (u.searchParams.get("vol")!== jtVol) {
          u.searchParams.set("vol", jtVol);
          changed = true;
        }
      } else if (u.searchParams.has("vol")) {
        u.searchParams.delete("vol");
        changed = true;
      }
      if (activeCat === "lab") {
        if (u.searchParams.get("skill")!== labSkill) { u.searchParams.set("skill", labSkill); changed = true; }
        if (labType && u.searchParams.get("type")!== labType) { u.searchParams.set("type", labType); changed = true; }
        if (labFilter && labFilter!== "all") {
          if (u.searchParams.get("f")!== labFilter) { u.searchParams.set("f", labFilter); changed = true; }
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
    /* ponytail: IELTS hub / vocab hub are portals — hide search (vocab always) */
    var isIeltsHub = zone === "mock" && activeCat === "all" &&!searchQuery;
    var isToeflHub = zone === "toefl" && activeCat === "all" &&!searchQuery;
    var isVocabHub = zone === "study" && activeCat === "vocab";
    var hub = isIeltsHub || isToeflHub || isVocabHub;
    document.body.classList.toggle("is-ielts-hub", isIeltsHub || isToeflHub);
    document.body.classList.toggle("is-vocab-hub", isVocabHub);
    toolbarEl.hidden = hub;
    toolbarEl.setAttribute("aria-hidden", hub? "true": "false");
    // ponytail:.catalog-toolbar { display:flex } overrides [hidden]
    toolbarEl.style.display = hub? "none": "";
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
      html = '<div class="catalog-search-meta"> tìm được ' + matched.length + " đầu kết quả </div>" +
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
              "<b>AI Trợ giảng IELTS </b>" +
              "<span> Nói cơ trải qua Luyện tập / Thi thử toàn phần · Viết phê chữa · tùy thời mở luyện </span>" +
            "</span>" +
            '<span class="ai-tutor-entry__cta"> lập tức bắt đầu <span aria-hidden="true">→</span></span>' +
          "</a>"
        : "";
      var cats = activeCat === "all"? visibleNav()
        : activeCat === "jingting" && navCat("jingting")? [navCat("jingting")]
        : visibleNav().filter(function (c) { return c.key === activeCat; });
      html = aiTutorHTML + cats.map(categoryHTML).join("");
      if (activeCat === "jingting" &&!cats.length) {
        html = emptyBox(" tạm thời chưa có Nghe sâu nội dung ", " Nghe sâu trong tài liệu truyền sau sẽ xuất hiện ở chỗ này. ", "zone.html?zone=mock&s=listening", " Quay lại Nghe ");
      }
    }
    function bindJtFolds(root) {
      if (!root) return;
      root.querySelectorAll("details.catalog-collapse--jt").forEach(function (d) {
        if (d.dataset.jtBound) return;
        d.dataset.jtBound = "1";
        var body = d.querySelector(":scope >.catalog-collapse__body");
        var summary = d.querySelector(":scope > summary");
        if (!body ||!summary) return;
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
    if (window.YYSD_UI_SWAP && contentEl.innerHTML &&!contentEl.querySelector(".spinner--brand")) {
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
      if (it.zone!== zone) return false;
      if (zone === "study" && it.subject === "grammar") return false;
      if (zone === "mock" && it.subject === "ielts") return false;
      // IELTS khu (mock) chỉ lưu lại IELTS kỹ năng; A-Level đi Chương trình quốc tế alevel.html
      if (allow && allow.indexOf(it.subject) < 0) return false;
      return true;
    });
    buildFilters();
    render();
  }

  var manifestP = Y.load();
  // A-Level catalog only on Chương trình quốc tế pages — not in IELTS /mock zone
  var catalogP = Promise.resolve(null);

  Promise.all([manifestP, catalogP]).then(function (res) {
    var go = function () { finishZoneLoad(res[0]); };
    // First-time student must finish vocab placement before using Khu từ vựng
    if (zone === "study" && activeCat === "vocab" && window.YYSD_DIAG_GATE) {
      window.YYSD_DIAG_GATE.ensure({ requireLogin: true }).then(function (ok) {
        if (ok) go();
      });
      return;
    }
    go();
  }).catch(function (err) {
    var msg = location.protocol === "file:"
      ? " xin thông qua địa chỉ Internet (http://) truy cập trang web, bản địa double-click mở ra sẽ bị trình duyệt chặn đường. "
      : err.message;
    contentEl.innerHTML = '<div class="state state--brand"><h3> Tải dữ liệu thất bại </h3><p>' + Y.esc(msg) + '</p></div>';
  });

  document.getElementById("year").textContent = new Date().getFullYear();
})();
