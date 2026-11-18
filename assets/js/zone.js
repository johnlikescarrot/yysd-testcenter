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

  document.title = z.label + " · Trung tâm Luyện thi Quốc tế YYSD";
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
      { id: "all", label: "Tất cả các tập" },
      { id: "new", label: "Mới nhất Vol.19+" },
      { id: "mid", label: "Nâng cao Vol.13–18" },
      { id: "base", label: "Cơ bản Vol.7–12" }
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
    // ponytail: 精听挂在听力 links 下，不占独立 chip / hub 列
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
    // 精听从听力入口进入时，顶栏补一枚当前 chip
    if (activeCat === "jingting") {
      chips.push('<button type="button" class="chip is-active" data-s="jingting">Luyện nghe kỹ</button>');
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
      searchInput.placeholder = next === "lab" ? "Tìm theo tên câu hỏi…" : "Tìm bộ đề TOEFL…";
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
    box.innerHTML = '<div class="hit-lab-sheet__box"><h3>Xem kết quả</h3>' +
      (items.length
        ? '<div class="hit-lab-sheet__list">' + items.map(function (d) {
          return '<div class="hit-lab-sheet__row ' + (d.ok ? "is-ok" : "is-bad") + '"><b>Q' +
            Y.esc(String(d.no)) + "</b><span>" + (d.ok ? "Đúng" : "Sai") +
            "</span><span>Bạn trả lời: " + Y.esc(d.ua || "(Chưa trả lời)") +
            (d.expect ? " · Đáp án: " + Y.esc(d.expect) : "") + "</span></div>";
        }).join("") + "</div>"
        : "<p>Chưa có lượt trả lời nào.</p>") +
      '<button type="button" class="btn btn--ghost btn--sm" data-lab="sheet-close">Đóng</button></div>';
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
    searchInput.placeholder = zone === "mock" ? "Tìm đề thi thử, tập, Test…"
      : (zone === "toefl" ? (activeCat === "lab" ? "Tìm theo tên câu hỏi…" : "Tìm bộ đề TOEFL…") : "Tìm theo tên…");
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
        return String(a.title).localeCompare(String(b.title), "vi", { numeric: true, sensitivity: "base" });
      });
  }

  function emptyBox(title, desc, href, cta) {
    return '<div class="soon-box soon-box--rich">' +
      "<h3>" + Y.esc(title) + "</h3>" +
      "<p>" + Y.esc(desc) + "</p>" +
      (href
        ? '<a class="btn btn--ghost btn--sm" href="' + Y.esc(href) + '">' + Y.esc(cta || "Trở về IELTS") + "</a>"
        : "") +
      "</div>";
  }

  function leafBody(subject, skill) {
    if (subject === "ielts-speaking") {
      return '<div class="spk-cta-grid bento-grid bento-grid--3">' +
        '<a class="bento-cta" href="speaking.html">' +
          '<span class="bento-cta__badge">Part 1</span>' +
          '<div><p class="bento-cta__title">Thi thử Nói</p>' +
          '<p class="bento-cta__desc">Thu âm câu trả lời · AI nhận xét theo bốn tiêu chí</p></div>' +
          '<span class="spk-cta-go">Vào luyện ›</span></a>' +
        '<a class="bento-cta bento-cta--teal" href="speaking-select.html">' +
          '<span class="bento-cta__badge">Theo chủ đề</span>' +
          '<div><p class="bento-cta__title">Chọn chủ đề luyện tập</p>' +
          '<p class="bento-cta__desc">Chọn chủ đề, để tạo một bài Part 1</p></div>' +
          '<span class="spk-cta-go">Chọn chủ đề ›</span></a>' +
        '<a class="bento-cta bento-cta--orange" href="ai-tutor.html">' +
          '<span class="bento-cta__badge">AI</span>' +
          '<div><p class="bento-cta__title">Gia sư IELTS bằng AI</p>' +
          '<p class="bento-cta__desc">Chủ đề luyện Nói / Nhận xét bài viết</p></div>' +
          '<span class="spk-cta-go">Vào luyện ›</span></a></div>';
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
    return emptyBox("Mục này sắp ra mắt", "Nội dung đang được chuẩn bị, bạn có thể luyện kỹ năng khác, hoặc quay lại chọn trong kho IELTS.", "zone.html?zone=mock", "Về tổng quan IELTS");
  }

  function countOf(subject) {
    if (subject === "ielts-speaking") return 1;
    if (Y.isCambridge(subject)) return Y.camVolumes(allItems.filter(function (it) { return it.subject === subject; })).length;
    if (subject === "jingting") {
      return Y.jingtingVolumes ? Y.jingtingVolumes(itemsOf(subject)).length : itemsOf(subject).length;
    }
    return itemsOf(subject).length;
  }
  function unitOf(subject) { return (Y.isCambridge(subject) || subject === "jingting") ? " Quyển" : " bài"; }

  // Vocab hub — 学习台：左进度轨 + 右主模块；诊断/每日单词为 chips
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
      return { href: "daily-word-learn.html", label: "Từ vựng hằng ngày · Tiếp tục", state: "is-resume" };
    }
    if (done) {
      return { href: "daily-word-result.html", label: "Từ vựng hằng ngày · Đã hoàn thành", state: "is-done" };
    }
    return { href: "daily-word-setup.html", label: "Từ vựng hằng ngày", state: "is-idle" };
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

    return '<section class="vocab-desk" data-vocab-desk aria-label="Bàn học từ vựng">' +
      '<aside class="vocab-desk__rail" aria-label="Tiến độ học">' +
        '<p class="vocab-desk__rail-kicker">Tiến độ học</p>' +
        '<ul class="vocab-desk__stats">' +
          '<li><span>Số sách trên kệ</span><b data-desk="shelfBooks">—</b></li>' +
          '<li><span>Học theo sách</span><b data-desk="activeLists">—</b></li>' +
          '<li><span>Hôm nay đã học</span><b data-desk="todayWords">—</b></li>' +
          '<li><span>Tuần này đã học</span><b data-desk="weekWords">—</b></li>' +
        "</ul>" +
        '<div class="vocab-desk__chips">' +
          '<a class="vocab-desk__chip" href="diagnostic.html">Đánh giá năng lực</a>' +
          '<a class="vocab-desk__chip vocab-desk__chip--' + dw.state + '" href="' + Y.esc(dw.href) + '">' +
            Y.esc(dw.label) + "</a>" +
        "</div>" +
      "</aside>" +
      '<div class="vocab-desk__main">' +
        '<header class="vocab-desk__head">' +
          '<div class="vocab-desk__head-copy">' +
            '<p class="vocab-desk__brand">YYSD · Từ vựng</p>' +
            "<h2>Bàn học</h2>" +
            "<p>Học theo kho từ · Vượt chặng để mở khóa · Kiểm tra để củng cố · Ôn lại từ sai.</p>" +
          "</div>" +
          bookSvg +
        "</header>" +
        '<div class="vocab-desk__mods" role="navigation" aria-label="Hoạt động từ vựng">' +
          mod("shelf", "vocab-shelf.html", "01", "Kho từ", "Số sách trên kệ", "—", "Học tiếp", "—", "Mở kệ sách", "vocab-shelf.html") +
          mod("challenge", "vocab-challenge.html", "02", "Thử thách từ vựng", "Chặng hiện tại", "—", "Nhóm từ để kiểm tra", "—", "Bắt đầu thử thách", "vocab-challenge.html") +
          mod("quiz", "vocab-quiz.html", "03", "Kiểm tra từ vựng", "Số lượt tuần này", "—", "Tỉ lệ đúng gần đây", "—", "Bắt đầu kiểm tra", "vocab-quiz.html") +
          mod("wrong", "wrong-words.html", "04", "Sổ câu sai", "Lượt cần ôn", "—", "Số từ sai", "—", "Ôn ngay", "wrong-words.html") +
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
      set("shelf-m1", "0 quyển");
      set("shelf-m2", "0");
      set("quiz-m1", "0");
      set("quiz-m2", "—");
      set("wrong-m1", "0");
      set("wrong-m2", "0");
      set("challenge-m1", "—");
      set("challenge-m2", "—");
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
      set("shelf-m1", (d.shelfBooks || 0) + " quyển");
      set("shelf-m2", d.continueLearn && d.continueLearn.listLabel
        ? String(d.continueLearn.listLabel)
        : String(d.activeLists || 0));
      set("quiz-m1", String(d.weekQuizzes || 0));
      set("quiz-m2", d.lastAccuracy != null ? d.lastAccuracy + "%" : "—");
      set("wrong-m1", String(d.pendingSessions || 0));
      set("wrong-m2", String(d.mistakeWords || 0));
      if (ch && ch.needsBook && ch.assignments && ch.assignments.length > 1) {
        set("challenge-m1", ch.assignments.length + " quyển");
        set("challenge-m2", "Chọn giáo trình");
        setCta("challenge-cta", "vocab-challenge.html", "Vào thử thách");
      } else if (ch && ch.assigned && ch.progress) {
        var totalDays = (ch.progress && ch.progress.totalDays) || 78;
        var bookHref = "vocab-challenge.html" +
          (ch.assignment && ch.assignment.bookId
            ? "?book=" + encodeURIComponent(ch.assignment.bookId)
            : "");
        if (ch.programComplete) {
          set("challenge-m1", "Đã hoàn thành");
          setCta("challenge-cta", bookHref, "Xem tiến độ");
        } else if (ch.progressDay) {
          set("challenge-m1", "Câu " + Math.min(ch.progressDay, totalDays) + " chặng");
          setCta("challenge-cta", bookHref, ch.activeAttemptId ? "Tiếp tục thử thách" : "Vào thử thách");
        } else {
          set("challenge-m1", "L" + (ch.progress.nextListNo || 1));
          setCta("challenge-cta", bookHref, "Vào thử thách");
        }
        set("challenge-m2", String((ch.pool && ch.pool.active) || 0));
      } else {
        set("challenge-m1", "Chờ giao bài");
        set("challenge-m2", "—");
        setCta("challenge-cta", "vocab-challenge.html", "Xem thử thách");
      }
      if (d.continueLearn) {
        setCta("shelf-cta", d.continueLearn.href, "Học tiếp · " + (d.continueLearn.listLabel || "List"));
      } else if ((d.shelfBooks || 0) > 0) {
        setCta("shelf-cta", "vocab-shelf.html", "Học tiếp");
      } else {
        setCta("shelf-cta", "vocab-shelf.html", "Thêm giáo trình");
      }
      if (d.continueQuiz) {
        setCta("quiz-cta", d.continueQuiz.href, "Tiếp tục kiểm tra · " + (d.continueQuiz.label || "Kiểm tra"));
      }
      if (d.continueWrong) {
        setCta("wrong-cta", d.continueWrong.href, "Tiếp tục ôn · " + (d.continueWrong.wrongCount || "") + " từ");
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
    // hub 只保留听力/阅读/口语/写作/模考五列；精听在听力 links 里
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
              { href: "speaking.html", label: "Thi thử Nói" },
              { href: "speaking-select.html", label: "Chọn chủ đề luyện tập" },
              { href: "ai-tutor.html", label: "Gia sư IELTS bằng AI" }
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
        '<a class="ielts-hub__go" href="' + Y.esc(headHref) + '">Mở ' + Y.esc(cat.label) + " <span aria-hidden=\"true\">›</span></a>" +
      "</article>";
    }).join("");

    return '<section class="ielts-hub" aria-label="Khu IELTS">' +
      '<header class="ielts-hub__intro">' +
        '<p class="ielts-hub__kicker">Cambridge IELTS</p>' +
        "<h2>Chọn cách luyện thi</h2>" +
        "<p>Luyện theo kỹ năng hoặc làm một đề trọn bộ. Để học theo lộ trình ngắn, chọn Sải bước bên dưới.</p>" +
        '<p><a class="ielts-hub__go" href="ielts-vi/">Sải bước · Học và ôn tập miễn phí →</a></p>' +
      "</header>" +
      '<div class="ielts-hub__grid">' + cards + "</div>" +
    "</section>";
  }

  var TOEFL_SKILL = {
    full: { list: "TOEFL_FULL", page: "toefl-full.html", badge: "Toàn bộ đề", empty: "Chưa có đề trọn bộ" },
    reading: { list: "TOEFL_READING", page: "toefl-reading.html", badge: "Đọc", empty: "Chưa có đề Đọc" },
    listening: { list: "TOEFL_LISTENING", page: "toefl-listening.html", badge: "Nghe", empty: "Chưa có đề Nghe" },
    writing: { list: "TOEFL_WRITING", page: "toefl-writing.html", badge: "Viết", empty: "Chưa có đề Viết" },
    speaking: { list: "TOEFL_SPEAKING", page: "toefl-speaking.html", badge: "Nói", empty: "Chưa có đề Nói" }
  };

  function toeflPaperCards(skill) {
    var spec = TOEFL_SKILL[skill] || TOEFL_SKILL.reading;
    var papers = Y[spec.list] || [];
    if (!papers.length) {
      return emptyBox(spec.empty, "Đề sẽ xuất hiện ở đây sau khi được tải lên.", "zone.html?zone=toefl", "Về tổng quan TOEFL");
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
          '<a class="btn btn--ghost btn--sm" href="' + practice + '">Luyện tập</a>' +
          '<a class="btn btn--primary btn--sm" href="' + mock + '">Thi thử</a>' +
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
        ? '<span class="ielts-hub__go is-soon">Sắp ra mắt</span>'
        : '<a class="ielts-hub__go" href="' + Y.esc(headHref) + '">Mở ' + Y.esc(cat.label) + ' <span aria-hidden="true">›</span></a>';
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
    return '<section class="ielts-hub" aria-label="' + Y.esc(opts.aria || "Khu TOEFL") + '">' +
      '<header class="ielts-hub__intro">' +
        '<p class="ielts-hub__kicker">Enhanced TOEFL iBT</p>' +
        "<h2>" + Y.esc(opts.h2 || "Chọn cách luyện") + "</h2>" +
        "<p>" + Y.esc(opts.p || "") + "</p>" +
        (opts.link ? '<p><a class="ielts-hub__go" href="' + Y.esc(opts.link.href) + '">' +
          Y.esc(opts.link.label) + ' <span aria-hidden="true">›</span></a></p>' : "") +
      "</header>" +
      '<div class="' + Y.esc(opts.grid || "ielts-hub__grid") + '">' + cards + "</div>" +
    "</section>";
  }

  function toeflHubHTML() {
    return toeflDoorCards(["lab", "dates"], {
      aria: "Khu TOEFL",
      h2: "Chọn cách luyện",
      p: "Luyện riêng từng dạng câu hỏi, hoặc chọn ngày thi để luyện hay thi thử cả đề.",
      link: { href: "toefl-score.html", label: "Bảng điểm và lịch sử thi thử" },
      grid: "ielts-hub__grid ielts-hub__grid--2"
    });
  }

  function toeflDateHubHTML() {
    return toeflDoorCards(["reading", "listening", "speaking", "writing"], {
      aria: "Thi thử theo ngày thi",
      h2: "Thi thử theo ngày thi",
      p: "Chọn ngày thi để luyện hoặc thi thử từng kỹ năng. Để thi liên tục các kỹ năng, vào hệ thống Mock Test.",
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
    if (!Lab) return emptyBox("Chưa tải được danh mục bài luyện", "Hãy tải lại trang rồi thử lại.", "zone.html?zone=toefl", "Về tổng quan TOEFL");
    if (!labIndex) {
      loadLabThen(render);
      return '<div class="state state--brand"><p>Đang tải danh mục dạng câu hỏi…</p></div>';
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
      if (!st.attempted) return "Chưa làm";
      if (kind === "speaking") return st.ok + "/" + st.total + " Đã ghi âm";
      if (st.done >= st.total && st.total) return (st.ok === st.total ? "Đúng tất cả" : (st.ok + "/" + st.total + " Đúng"));
      return st.ok + "/" + st.total;
    }
    function acts(href, recId, attempted) {
      return '<div class="hit-lab__acts">' +
        '<a class="hit-lab__go" href="' + Y.esc(href) + '">' + (attempted ? "Làm lại" : "Bắt đầu luyện") + "</a>" +
        (attempted ? '<button type="button" class="hit-lab__rec" data-lab="record" data-rec="' + Y.esc(recId) + '">Xem kết quả</button>' : "") +
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
      body = blocks || emptyBox("Không có câu hỏi phù hợp", "Hãy đổi dạng câu hỏi hoặc bộ lọc.", "zone.html?zone=toefl&s=lab", "Xem tất cả");
    } else {
      var countWord = labSkill === "reading" && labType === "complete_words" ? "Trống" : "câu";
      body = cards.length
        ? '<div class="hit-lab__grid">' + cards.map(function (it) {
          var href = Lab.hrefOf(it, "practice");
          var st = Lab.cardResults(it);
          return '<article class="hit-lab__card">' +
            '<p class="hit-lab__kicker">' + Y.esc(Lab.typeLabel(it.skill, it.type)) +
              (it.hot ? " · tần suất cao" : "") + " · " + it.itemCount + " " + countWord + "</p>" +
            "<h3>" + Y.esc(Lab.displayTitle(it)) + "</h3>" +
            "<p>" + Y.esc(it.date) + "</p>" +
            '<p class="hit-lab__stat">' + Y.esc(statusTxt(st, labSkill)) + "</p>" +
            acts(href, "card|" + it.skill + "|" + it.paperId + "|" + it.taskIndex, st.attempted) +
          "</article>";
        }).join("") + "</div>"
        : emptyBox("Không có câu hỏi phù hợp", "Hãy đổi dạng câu hỏi hoặc bộ lọc.", "zone.html?zone=toefl&s=lab", "Xem tất cả");
    }
    return '<section class="hit-lab" aria-label="Luyện theo dạng câu hỏi">' +
      '<header class="hit-lab__intro"><h2>Luyện theo dạng câu hỏi</h2><p>Chọn dạng câu hỏi, rồi chọn bài để mở giao diện thi trên máy ETS giao diện thi.</p></header>' +
      chipRow("skill", Lab.SKILLS, labSkill) +
      chipRow("type", types, labType) +
      chipRow("filter", filters, labFilter) +
      body +
    "</section>";
  }

  function categoryHTML(cat) {
    var sub = Y.SUBJECT[cat.subject] || { color: "var(--c-cambridge)" };
    // ponytail: vocab desk owns its own title — skip generic subject head
    var head = cat.key === "vocab" ? "" : ('<div class="subject-group__head">' +
      '<span class="subject-dot" style="background:' + sub.color + '"></span>' +
      "<h2>" + Y.esc(cat.key === "jingting" && jtVol ? ("Cambridge IELTS " + jtVol) : cat.label) + '</h2><span class="cnt">' +
      (cat.key === "mock" || cat.key === "ielts" ? Y.camVolumes(allItems).length + " Quyển"
        : cat.key === "alevel" && alevelCatalog && window.YYSD_ALEVEL
          ? window.YYSD_ALEVEL.qpCount(alevelCatalog) + " bộ đề"
        : (zone === "toefl" && TOEFL_SKILL[cat.key]
          ? (Y[TOEFL_SKILL[cat.key].list] || []).length + " bộ đề"
          : countOf(cat.subject) + unitOf(cat.subject || ""))) +
      "</span></div>");

    var body;
    if (cat.key === "mock" || cat.key === "ielts") {
      var vols = Y.camVolumes(allItems);
      body = vols.length
        ? Y.cambridgeCatalogHTML(vols, allItems, "", { tier: camTier, query: searchQuery, collapseLegacy: true })
        : emptyBox("Chưa có đề Cambridge", "Đề sẽ xuất hiện sau khi giáo viên tải lên. Bạn cũng có thể luyện riêng phần Nghe hoặc Đọc.", "zone.html?zone=mock&s=listening", "Luyện Nghe");
    } else if (zone === "toefl" && cat.soon) {
      body = emptyBox(cat.label + "Sắp ra mắt", "Đã mở thi trên máy cho bốn kỹ năng, kỹ năng này sẽ được bổ sung sau.", "zone.html?zone=toefl", "Về tổng quan TOEFL");
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
        : emptyBox("Mục này chưa có nội dung", "Hãy thử kỹ năng khác, hoặc quay lại sau.", "zone.html?zone=mock", "Về tổng quan IELTS");
    } else if (cat.key === "jingting") {
      var jtItems = itemsOf("jingting");
      body = jtItems.length && Y.jingtingCatalogHTML
        ? Y.jingtingCatalogHTML(jtItems, "", { vol: jtVol, query: searchQuery, tier: camTier })
        : emptyBox("Chưa có bài luyện nghe kỹ", "Tài liệu nghe kỹ sẽ xuất hiện sau khi được tải lên.", "zone.html?zone=mock&s=listening", "Trở về phần Nghe");
    } else if (cat.href) {
      body = '<a class="bento-cta" href="' + Y.esc(cat.href) + '">' +
        '<div><p class="bento-cta__title">' + Y.esc(cat.label) + "</p>" +
        '<p class="bento-cta__desc">' + Y.esc(cat.desc || "") + "</p></div>" +
        '<span class="spk-cta-go">Vào luyện ›</span></a>';
    } else if (cat.key === "alevel") {
      var A = window.YYSD_ALEVEL;
      var qp = alevelCatalog ? A.qpCount(alevelCatalog) : 0;
      body = alevelCatalog && A.hasContent(alevelCatalog)
        ? '<p class="alevel-zone-intro">CAIE đề thi các môn phổ biến · xem trực tuyến · tải miễn phí · hiện có ' + qp + " bộ đề</p>" +
          A.catalogPreviewHTML(alevelCatalog, "", 6) +
          '<div class="alevel-zone-more"><a class="btn btn--primary pressable" href="alevel.html">Mở A-Level kho đề →</a></div>'
        : '<div class="soon-box">A-Level đang chuẩn bị đề thi, vui lòng quay lại sau.</div>';
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
    /* ponytail: IELTS hub / vocab hub are portals — hide search (vocab always) */
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
      html = '<div class="catalog-search-meta">Tìm thấy ' + matched.length + " kết quả</div>" +
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
              "<b>Gia sư IELTS bằng AI</b>" +
              "<span>Luyện chủ đề Nói / thi thử như thi thật · Nhận xét bài viết · luyện bất cứ lúc nào</span>" +
            "</span>" +
            '<span class="ai-tutor-entry__cta">Bắt đầu ngay <span aria-hidden="true">→</span></span>' +
          "</a>"
        : "";
      var cats = activeCat === "all" ? visibleNav()
        : activeCat === "jingting" && navCat("jingting") ? [navCat("jingting")]
        : visibleNav().filter(function (c) { return c.key === activeCat; });
      html = aiTutorHTML + cats.map(categoryHTML).join("");
      if (activeCat === "jingting" && !cats.length) {
        html = emptyBox("Chưa có bài luyện nghe kỹ", "Tài liệu nghe kỹ sẽ xuất hiện sau khi được tải lên.", "zone.html?zone=mock&s=listening", "Trở về phần Nghe");
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
      // 雅思区（mock）只保留雅思科目；A-Level 走国际课程 alevel.html
      if (allow && allow.indexOf(it.subject) < 0) return false;
      return true;
    });
    buildFilters();
    render();
  }

  var manifestP = Y.load();
  // A-Level catalog only on 国际课程 pages — not in 雅思/mock zone
  var catalogP = Promise.resolve(null);

  Promise.all([manifestP, catalogP]).then(function (res) {
    var go = function () { finishZoneLoad(res[0]); };
    // First-time student must finish vocab placement before using 单词区
    if (zone === "study" && activeCat === "vocab" && window.YYSD_DIAG_GATE) {
      window.YYSD_DIAG_GATE.ensure({ requireLogin: true }).then(function (ok) {
        if (ok) go();
      });
      return;
    }
    go();
  }).catch(function (err) {
    var msg = location.protocol === "file:"
      ? "Hãy dùng địa chỉ web (http://)để mở trang, trình duyệt sẽ chặn nếu bạn mở trực tiếp tệp trên máy."
      : err.message;
    contentEl.innerHTML = '<div class="state state--brand"><h3>Không tải được nội dung</h3><p>' + Y.esc(msg) + '</p></div>';
  });

  document.getElementById("year").textContent = new Date().getFullYear();
})();
