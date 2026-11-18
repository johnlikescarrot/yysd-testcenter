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

  document.title = z.label + " · YYSD · Trung tâm Khóa học Quốc tế";
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
      { id: "all", label: "Tất cảsách" },
      { id: "new", label: "mới nhất Vol.19+" },
      { id: "mid", label: "nâng cao Vol.13–18" },
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
    // ponytail: tinh chất cười cổ đại tồn tạiNghe links xuống,không biến thể củađộc lập chip / hub sắp xếp
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
    // tinh chấtnghe theoNghelối vàođi vàobiến thể cũ của,đỉnh hàng rào sửa một họthời điểm hiện tại chip
    if (activeCat === "jingting") {
      chips.push('<button type="button" class="chip is-active" data-s="jingting">Nghetinh chất cười cổ đại</button>');
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
      searchInput.placeholder = next === "lab" ? "Tìm kiếmĐề bàitên của một sự vật…" : "Tìm kiếmnâng bằng tay họ che đậy họ…";
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
    box.innerHTML = '<div class="hit-lab-sheet__box"><h3>Xemghi chép</h3>' +
      (items.length
        ? '<div class="hit-lab-sheet__list">' + items.map(function (d) {
          return '<div class="hit-lab-sheet__row ' + (d.ok ? "is-ok" : "is-bad") + '"><b>Q' +
            Y.esc(String(d.no)) + "</b><span>" + (d.ok ? "Đúng" : "Lỗi") +
            "</span><span>Của bạn: " + Y.esc(d.ua || "(Chưa trả lời)") +
            (d.expect ? " · tháng đầu tiên của năm âm lịch họ:" + Y.esc(d.expect) : "") + "</span></div>";
        }).join("") + "</div>"
        : "<p>họkhông cótrả lờighi chép.</p>") +
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
    searchInput.placeholder = zone === "mock" ? "Tìm kiếmThi thử,sách đếm,Test…"
      : (zone === "toefl" ? (activeCat === "lab" ? "Tìm kiếmĐề bàitên của một sự vật…" : "Tìm kiếmnâng bằng tay họ che đậy họ…") : "Tìm kiếmNội dungtên của một sự vật…");
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
        return String(a.title).localeCompare(String(b.title), "zh-Hans-CN", { numeric: true, sensitivity: "base" });
      });
  }

  function emptyBox(title, desc, href, cta) {
    return '<div class="soon-box soon-box--rich">' +
      "<h3>" + Y.esc(title) + "</h3>" +
      "<p>" + Y.esc(desc) + "</p>" +
      (href
        ? '<a class="btn btn--ghost btn--sm" href="' + Y.esc(href) + '">' + Y.esc(cta || "Quay lạiIELTS Hệ thống Kiểm tra Tiếng Anh Quốc tế") + "</a>"
        : "") +
      "</div>";
  }

  function leafBody(subject, skill) {
    if (subject === "ielts-speaking") {
      return '<div class="spk-cta-grid bento-grid bento-grid--3">' +
        '<a class="bento-cta" href="speaking.html">' +
          '<span class="bento-cta__badge">Part 1</span>' +
          '<div><p class="bento-cta__title">NóiThi thử</p>' +
          '<p class="bento-cta__desc">Ghi âmtrả lời · AI bốn đức tính xã hội: lễChấm điểm</p></div>' +
          '<span class="spk-cta-go">đi vào ›</span></a>' +
        '<a class="bento-cta bento-cta--teal" href="speaking-select.html">' +
          '<span class="bento-cta__badge">chuyên biệt</span>' +
          '<div><p class="bento-cta__title">chuyên biệtchọn họ</p>' +
          '<p class="bento-cta__desc">chọn một hoặc nhiều lựa chọn từ danh sáchChủ đề,họbộ Part 1</p></div>' +
          '<span class="spk-cta-go">chọn họ ›</span></a>' +
        '<a class="bento-cta bento-cta--orange" href="ai-tutor.html">' +
          '<span class="bento-cta__badge">AI</span>' +
          '<div><p class="bento-cta__title">AI IELTS Hệ thống Kiểm tra Tiếng Anh Quốc tếGiáo viên</p>' +
          '<p class="bento-cta__desc">Nóihọ họ / ViếtChấm bài</p></div>' +
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
    return emptyBox("nêntấmsắplên mạng", "Nội dungsự chuẩn bịhình thức kết hợp Trung Quốc,trước điKhácmôn họcLuyện tập,có thể biến thể củaIELTS Hệ thống Kiểm tra Tiếng Anh Quốc tếcái nhìn tổng quanlạiChọn.", "zone.html?zone=mock", "Quay lạiIELTS Hệ thống Kiểm tra Tiếng Anh Quốc tếcái nhìn tổng quan");
  }

  function countOf(subject) {
    if (subject === "ielts-speaking") return 1;
    if (Y.isCambridge(subject)) return Y.camVolumes(allItems.filter(function (it) { return it.subject === subject; })).length;
    if (subject === "jingting") {
      return Y.jingtingVolumes ? Y.jingtingVolumes(itemsOf(subject)).length : itemsOf(subject).length;
    }
    return itemsOf(subject).length;
  }
  function unitOf(subject) { return (Y.isCambridge(subject) || subject === "jingting") ? " sách" : " lượng từ cho quà tặng"; }

  // Vocab hub — họcĐài Loan viết tắt:họTiến độhình vị hạn chế đường ray + hình thức kết hợp bên phải chủmô-đun trong phần mềm;chẩn đoán/Hằng ngàyTừ vựnglàm với tư cách chips
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
      return { href: "daily-word-learn.html", label: "Hằng ngàyTừ vựng · Tiếp tục", state: "is-resume" };
    }
    if (done) {
      return { href: "daily-word-result.html", label: "Hằng ngàyTừ vựng · Đã hoàn thành", state: "is-done" };
    }
    return { href: "daily-word-setup.html", label: "Hằng ngàyTừ vựng", state: "is-idle" };
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

    return '<section class="vocab-desk" data-vocab-desk aria-label="Từ vựnghọcĐài Loan viết tắt">' +
      '<aside class="vocab-desk__rail" aria-label="họcTiến độ">' +
        '<p class="vocab-desk__rail-kicker">họcTiến độ</p>' +
        '<ul class="vocab-desk__stats">' +
          '<li><span>giá sáchhình thức kết hợp gốc đếm</span><b data-desk="shelfBooks">—</b></li>' +
          '<li><span>biến thể cũ của viết tắt củahọc</span><b data-desk="activeLists">—</b></li>' +
          '<li><span>hôm nayđã học</span><b data-desk="todayWords">—</b></li>' +
          '<li><span>hình thức kết hợp gốc họ đã học</span><b data-desk="weekWords">—</b></li>' +
        "</ul>" +
        '<div class="vocab-desk__chips">' +
          '<a class="vocab-desk__chip" href="diagnostic.html">Năng lựcchẩn đoán</a>' +
          '<a class="vocab-desk__chip vocab-desk__chip--' + dw.state + '" href="' + Y.esc(dw.href) + '">' +
            Y.esc(dw.label) + "</a>" +
        "</div>" +
      "</aside>" +
      '<div class="vocab-desk__main">' +
        '<header class="vocab-desk__head">' +
          '<div class="vocab-desk__head-copy">' +
            '<p class="vocab-desk__brand">YYSD · Từ vựng</p>' +
            "<h2>họcĐài Loan viết tắt</h2>" +
            "<p>kho từhọc · xông qua rào cảnmở khóa · phát hiệncủng cố · Câu sainấu chảy lại.</p>" +
          "</div>" +
          bookSvg +
        "</header>" +
        '<div class="vocab-desk__mods" role="navigation" aria-label="Từ vựngchủmô-đun trong phần mềm">' +
          mod("shelf", "vocab-shelf.html", "01", "kho từ", "giá sáchhình thức kết hợp gốc đếm", "—", "tiếp tục học", "—", "đi vàogiá sách", "vocab-shelf.html") +
          mod("challenge", "vocab-challenge.html", "02", "Thử thách từ vựng", "thời điểm hiện tạihọ", "—", "rút ra khảo sát họ", "—", "Bắt đầuxông qua rào cản", "vocab-challenge.html") +
          mod("quiz", "vocab-quiz.html", "03", "Từ vựngphát hiện", "hình thức kết hợp gốc họsố lần", "—", "gần đâyTỉ lệ đúng", "—", "Bắt đầuphát hiện", "vocab-quiz.html") +
          mod("wrong", "wrong-words.html", "04", "Sổ lỗi sai", "đợi được thông báohọsố lần chiếu của một bộ phim", "—", "họ biến thể cũ của đếm", "—", "điÔn tập", "wrong-words.html") +
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
      set("shelf-m1", "0 hình thức kết hợp gốc");
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
      set("shelf-m1", (d.shelfBooks || 0) + " hình thức kết hợp gốc");
      set("shelf-m2", d.continueLearn && d.continueLearn.listLabel
        ? String(d.continueLearn.listLabel)
        : String(d.activeLists || 0));
      set("quiz-m1", String(d.weekQuizzes || 0));
      set("quiz-m2", d.lastAccuracy != null ? d.lastAccuracy + "%" : "—");
      set("wrong-m1", String(d.pendingSessions || 0));
      set("wrong-m2", String(d.mistakeWords || 0));
      if (ch && ch.needsBook && ch.assignments && ch.assignments.length > 1) {
        set("challenge-m1", ch.assignments.length + " hình thức kết hợp gốc");
        set("challenge-m2", "chọn biến thể cũ của sách");
        setCta("challenge-cta", "vocab-challenge.html", "đixông qua rào cản");
      } else if (ch && ch.assigned && ch.progress) {
        var totalDays = (ch.progress && ch.progress.totalDays) || 78;
        var bookHref = "vocab-challenge.html" +
          (ch.assignment && ch.assignment.bookId
            ? "?book=" + encodeURIComponent(ch.assignment.bookId)
            : "");
        if (ch.programComplete) {
          set("challenge-m1", "Đã hoàn thành");
          setCta("challenge-cta", bookHref, "XemTiến độ");
        } else if (ch.progressDay) {
          set("challenge-m1", " " + Math.min(ch.progressDay, totalDays) + " họ");
          setCta("challenge-cta", bookHref, ch.activeAttemptId ? "Tiếp tụcxông qua rào cản" : "đixông qua rào cản");
        } else {
          set("challenge-m1", "L" + (ch.progress.nextListNo || 1));
          setCta("challenge-cta", bookHref, "đixông qua rào cản");
        }
        set("challenge-m2", String((ch.pool && ch.pool.active) || 0));
      } else {
        set("challenge-m1", "ở lạisắp xếp");
        set("challenge-m2", "—");
        setCta("challenge-cta", "vocab-challenge.html", "Xemxông qua rào cản");
      }
      if (d.continueLearn) {
        setCta("shelf-cta", d.continueLearn.href, "tiếp tục học · " + (d.continueLearn.listLabel || "List"));
      } else if ((d.shelfBooks || 0) > 0) {
        setCta("shelf-cta", "vocab-shelf.html", "Tiếp tụchọc");
      } else {
        setCta("shelf-cta", "vocab-shelf.html", "Thêmbiến thể cũ của viết tắt của");
      }
      if (d.continueQuiz) {
        setCta("quiz-cta", d.continueQuiz.href, "tiếp tục khảo sát · " + (d.continueQuiz.label || "phát hiện"));
      }
      if (d.continueWrong) {
        setCta("wrong-cta", d.continueWrong.href, "tiếp tụcÔn tập · " + (d.continueWrong.wrongCount || "") + " biến thể cũ của");
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
    // hub chỉgiữNghe/Đọc/Nói/Viết/Thi thửnăm sắp xếp;tinh chất cười cổ đại tồn tạiNghe links biến thể của
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
              { href: "speaking.html", label: "NóiThi thử" },
              { href: "speaking-select.html", label: "chuyên biệtchọn họ" },
              { href: "ai-tutor.html", label: "AI IELTS Hệ thống Kiểm tra Tiếng Anh Quốc tếGiáo viên" }
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

    return '<section class="ielts-hub" aria-label="IELTS Hệ thống Kiểm tra Tiếng Anh Quốc tếlối vào">' +
      '<header class="ielts-hub__intro">' +
        '<p class="ielts-hub__kicker">Cambridge IELTS</p>' +
        "<h2>Chọnbạnhuấn luyệncon đường</h2>" +
        "<p>mục đơn lẻdệt may làm sạchtá từ mượnCơ bản,che đậy họThi thửluyện tậpcó mặt tại hiện trường dự thi.bốn ngành họcngôn ngữ học âm thanh lời nóirõ ràng,điểmđi vàochính xáctương ứng vớingân hàng câu hỏi cho người ra đề hoặc học sinh chuẩn bị thi.</p>" +
      "</header>" +
      '<div class="ielts-hub__grid">' + cards + "</div>" +
    "</section>";
  }

  var TOEFL_SKILL = {
    full: { list: "TOEFL_FULL", page: "toefl-full.html", badge: "họ cuộn lại", empty: "tạm thời không cóhoàn chỉnhche đậy họ" },
    reading: { list: "TOEFL_READING", page: "toefl-reading.html", badge: "Đọc", empty: "tạm thời không cóĐọcĐề thi thật" },
    listening: { list: "TOEFL_LISTENING", page: "toefl-listening.html", badge: "Nghe", empty: "tạm thời không cóNgheĐề thi thật" },
    writing: { list: "TOEFL_WRITING", page: "toefl-writing.html", badge: "Viết", empty: "tạm thời không cóViếtĐề thi thật" },
    speaking: { list: "TOEFL_SPEAKING", page: "toefl-speaking.html", badge: "Nói", empty: "tạm thời không cóNóiĐề thi thật" }
  };

  function toeflPaperCards(skill) {
    var spec = TOEFL_SKILL[skill] || TOEFL_SKILL.reading;
    var papers = Y[spec.list] || [];
    if (!papers.length) {
      return emptyBox(spec.empty, "Đề bàiTải lênhọ có thểxuất hiệntồn tạibiến thể của.", "zone.html?zone=toefl", "Quay lạinâng bằng tay họcái nhìn tổng quan");
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
        ? '<span class="ielts-hub__go is-soon">sắplên mạng</span>'
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
    return '<section class="ielts-hub" aria-label="' + Y.esc(opts.aria || "nâng bằng tay họlối vào") + '">' +
      '<header class="ielts-hub__intro">' +
        '<p class="ielts-hub__kicker">Enhanced TOEFL iBT</p>' +
        "<h2>" + Y.esc(opts.h2 || "Chọnhuấn luyệncách thức") + "</h2>" +
        "<p>" + Y.esc(opts.p || "") + "</p>" +
        (opts.link ? '<p><a class="ielts-hub__go" href="' + Y.esc(opts.link.href) + '">' +
          Y.esc(opts.link.label) + ' <span aria-hidden="true">›</span></a></p>' : "") +
      "</header>" +
      '<div class="' + Y.esc(opts.grid || "ielts-hub__grid") + '">' + cards + "</div>" +
    "</section>";
  }

  function toeflHubHTML() {
    return toeflDoorCards(["lab", "dates"], {
      aria: "nâng bằng tay họlối vào",
      h2: "Chọnhuấn luyệncách thức",
      p: "nhấn họ khuôntháo dỡdệt may làm sạchmột tờ,có thể nhấnKì thiviết tắt củađi vàohình thức liên kết toàn bộ cuộn lạiLuyện tậpThi thử.",
      link: { href: "toefl-score.html", label: "phiếu điểm hoặc bảng điểmThi thửLịch sử" },
      grid: "ielts-hub__grid ielts-hub__grid--2"
    });
  }

  function toeflDateHubHTML() {
    return toeflDoorCards(["reading", "listening", "speaking", "writing"], {
      aria: "nhấnKì thiviết tắt củaThi thử",
      h2: "nhấnKì thiviết tắt củaThi thử",
      p: "nhấnKì thiviết tắt củađi vàomục đơn lẻLuyện tậpThi thử.hoàn chỉnhhọ đánh mời đến họ đánhhệ thống Mock Test.",
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
    if (!Lab) return emptyBox("dệt may làm sạchmục lụcchưaTải", "mờiLàm mớihọthử lại.", "zone.html?zone=toefl", "Quay lạinâng bằng tay họcái nhìn tổng quan");
    if (!labIndex) {
      loadLabThen(render);
      return '<div class="state state--brand"><p>Đang tảihọ khuônmục lục…</p></div>';
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
      if (!st.attempted) return "chưa làm";
      if (kind === "speaking") return st.ok + "/" + st.total + " đã khắc gỗ";
      if (st.done >= st.total && st.total) return (st.ok === st.total ? "Tất cảĐúng" : (st.ok + "/" + st.total + " Đúng"));
      return st.ok + "/" + st.total;
    }
    function acts(href, recId, attempted) {
      return '<div class="hit-lab__acts">' +
        '<a class="hit-lab__go" href="' + Y.esc(href) + '">' + (attempted ? "lại làmmột lần từ đầu đến cuối" : "Bắt đầuLuyện tập") + "</a>" +
        (attempted ? '<button type="button" class="hit-lab__rec" data-lab="record" data-rec="' + Y.esc(recId) + '">Xemghi chép</button>' : "") +
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
      body = blocks || emptyBox("không cóphù hợp vớiLọcĐề bài", "trao đổi một dùng trong họ khuôn có thểLọclại thử.", "zone.html?zone=toefl&s=lab", "XemTất cả");
    } else {
      var countWord = labSkill === "reading" && labType === "complete_words" ? "trống không" : "họ";
      body = cards.length
        ? '<div class="hit-lab__grid">' + cards.map(function (it) {
          var href = Lab.hrefOf(it, "practice");
          var st = Lab.cardResults(it);
          return '<article class="hit-lab__card">' +
            '<p class="hit-lab__kicker">' + Y.esc(Lab.typeLabel(it.skill, it.type)) +
              (it.hot ? " · Tần suất cao" : "") + " · " + it.itemCount + " " + countWord + "</p>" +
            "<h3>" + Y.esc(Lab.displayTitle(it)) + "</h3>" +
            "<p>" + Y.esc(it.date) + "</p>" +
            '<p class="hit-lab__stat">' + Y.esc(statusTxt(st, labSkill)) + "</p>" +
            acts(href, "card|" + it.skill + "|" + it.paperId + "|" + it.taskIndex, st.attempted) +
          "</article>";
        }).join("") + "</div>"
        : emptyBox("không cóphù hợp vớiLọcĐề bài", "trao đổi một dùng trong họ khuôn có thểLọclại thử.", "zone.html?zone=toefl&s=lab", "XemTất cả");
    }
    return '<section class="hit-lab" aria-label="nhấn họ khuôndệt may làm sạch">' +
      '<header class="hit-lab__intro"><h2>nhấn họ khuôndệt may làm sạch</h2><p>trướccâu hỏi trắc nghiệmkhuôn,lạinêu bật chủ đề chínhmắtđi vào ETS họ đánhbề mặt tiếp xúc.</p></header>' +
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
      (cat.key === "mock" || cat.key === "ielts" ? Y.camVolumes(allItems).length + " sách"
        : cat.key === "alevel" && alevelCatalog && window.YYSD_ALEVEL
          ? window.YYSD_ALEVEL.qpCount(alevelCatalog) + " che đậy"
        : (zone === "toefl" && TOEFL_SKILL[cat.key]
          ? (Y[TOEFL_SKILL[cat.key].list] || []).length + " che đậy"
          : countOf(cat.subject) + unitOf(cat.subject || ""))) +
      "</span></div>");

    var body;
    if (cat.key === "mock" || cat.key === "ielts") {
      var vols = Y.camVolumes(allItems);
      body = vols.length
        ? Y.cambridgeCatalogHTML(vols, allItems, "", { tier: camTier, query: searchQuery, collapseLegacy: true })
        : emptyBox("tạm thời không có kiếm hai lưỡi cầuĐề thi thật", "Giáo viênTải lênche đậy họ họ có thểxuất hiệntồn tạibiến thể của.có thểtrước làmmục đơn lẻNghecó thểĐọcLuyện tập.", "zone.html?zone=mock&s=listening", "đi luyện tậpNghe");
    } else if (zone === "toefl" && cat.soon) {
      body = emptyBox(cat.label + "sắplên mạng", "bốn ngành học họ đánh đãnở hoa,đại từ này một ngành họcngay sau đótrở thành thành viên.", "zone.html?zone=toefl", "Quay lạinâng bằng tay họcái nhìn tổng quan");
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
        : emptyBox("nênmôn họctạm thời không cóNội dung", "trước thử thửKhácmôn học,có thểmột lát nữalại đến.", "zone.html?zone=mock", "Quay lạiIELTS Hệ thống Kiểm tra Tiếng Anh Quốc tếcái nhìn tổng quan");
    } else if (cat.key === "jingting") {
      var jtItems = itemsOf("jingting");
      body = jtItems.length && Y.jingtingCatalogHTML
        ? Y.jingtingCatalogHTML(jtItems, "", { vol: jtVol, query: searchQuery, tier: camTier })
        : emptyBox("tạm thời không có tinh chất cười cổ đạiNội dung", "tinh chất cười cổ đạiTư liệuTải lênhọ có thểxuất hiệntồn tạibiến thể của.", "zone.html?zone=mock&s=listening", "Quay lạiNghe");
    } else if (cat.href) {
      body = '<a class="bento-cta" href="' + Y.esc(cat.href) + '">' +
        '<div><p class="bento-cta__title">' + Y.esc(cat.label) + "</p>" +
        '<p class="bento-cta__desc">' + Y.esc(cat.desc || "") + "</p></div>" +
        '<span class="spk-cta-go">đi vào ›</span></a>';
    } else if (cat.key === "alevel") {
      var A = window.YYSD_ALEVEL;
      var qp = alevelCatalog ? A.qpCount(alevelCatalog) : 0;
      body = alevelCatalog && A.hasContent(alevelCatalog)
        ? '<p class="alevel-zone-intro">CAIE phổ biếnmôn họcĐề thi thật · trực tuyếnxem trước · miễn phíTải xuống · đãbao gồm trong một bộ sưu tập ' + qp + " che đậy</p>" +
          A.catalogPreviewHTML(alevelCatalog, "", 6) +
          '<div class="alevel-zone-more"><a class="btn btn--primary pressable" href="alevel.html">đi vào A-Level ngân hàng câu hỏi cho người ra đề hoặc học sinh chuẩn bị thi →</a></div>'
        : '<div class="soon-box">A-Level Đề thi thậtchuẩn bịhình thức kết hợp Trung Quốc,kính mời làm gì đó cách nói kính trọngmong chờ.</div>';
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
      html = '<div class="catalog-search-meta">tìm thấy ' + matched.length + " dảiKết quả</div>" +
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
              "<b>AI IELTS Hệ thống Kiểm tra Tiếng Anh Quốc tếGiáo viên</b>" +
              "<span>Nóihọ họLuyện tập / họ thậtThi thử · ViếtChấm bài · bất kỳ lúc nàomở ngoại động từ hoặc nội động từ luyện tập</span>" +
            "</span>" +
            '<span class="ai-tutor-entry__cta">ngay lập tứcBắt đầu <span aria-hidden="true">→</span></span>' +
          "</a>"
        : "";
      var cats = activeCat === "all" ? visibleNav()
        : activeCat === "jingting" && navCat("jingting") ? [navCat("jingting")]
        : visibleNav().filter(function (c) { return c.key === activeCat; });
      html = aiTutorHTML + cats.map(categoryHTML).join("");
      if (activeCat === "jingting" && !cats.length) {
        html = emptyBox("tạm thời không có tinh chất cười cổ đạiNội dung", "tinh chất cười cổ đạiTư liệuTải lênhọ có thểxuất hiệntồn tạibiến thể của.", "zone.html?zone=mock&s=listening", "Quay lạiNghe");
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
      // IELTS Hệ thống Kiểm tra Tiếng Anh Quốc tếhọ(mock)chỉgiữIELTS Hệ thống Kiểm tra Tiếng Anh Quốc tếmôn học;A-Level điChương trình quốc tế alevel.html
      if (allow && allow.indexOf(it.subject) < 0) return false;
      return true;
    });
    buildFilters();
    render();
  }

  var manifestP = Y.load();
  // A-Level catalog only on Chương trình quốc tế pages — not in IELTS Hệ thống Kiểm tra Tiếng Anh Quốc tế/mock zone
  var catalogP = Promise.resolve(null);

  Promise.all([manifestP, catalogP]).then(function (res) {
    var go = function () { finishZoneLoad(res[0]); };
    // First-time student must finish vocab placement before using Khu vực Từ vựng
    if (zone === "study" && activeCat === "vocab" && window.YYSD_DIAG_GATE) {
      window.YYSD_DIAG_GATE.ensure({ requireLogin: true }).then(function (ok) {
        if (ok) go();
      });
      return;
    }
    go();
  }).catch(function (err) {
    var msg = location.protocol === "file:"
      ? "Vui lòng truy cập qua địa chỉ web(http://)thămhình thức kết hợp gốc trạm,mở tệp trực tiếp bằng cách nhấp đúp sẽ bị trình duyệt chặn."
      : err.message;
    contentEl.innerHTML = '<div class="state state--brand"><h3>Tải thất bại</h3><p>' + Y.esc(msg) + '</p></div>';
  });

  document.getElementById("year").textContent = new Date().getFullYear();
})();
