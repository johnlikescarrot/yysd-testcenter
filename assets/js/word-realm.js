/* =========================================================================
   word-realm.js - Hub / cái đinh điểm bản đồ / sách hướng dẫn minh họa(Thứ 2 biến thể của)
   ========================================================================= */
(function () {
  "use strict";
  var Y = window.YYSD;
  var RPG = window.YYSD_VOCAB_RPG;
  var STORY = window.YYSD_WORD_REALM_STORY;
  var CORE = window.YYSD_WORD_REALM;
  var SFX = window.YYSD_WORD_REALM_SFX;
  var A = window.YYSD_AUTH;
  // hầu như xuất sắc lợi ích suy nghĩ đạt tới trụ sở chính trạm có thể thấy rõ; người thuê biến thể cũ của dây xích trực tiếp tá biên lai biến thể cũ của | khu vực
  if (!A || !A.canWordRealm || !A.canWordRealm()) {
    location.replace("zone.html?zone=study&s=vocab");
    return;
  }
  var params = new URLSearchParams(location.search);
  var root = document.getElementById("wr-root");
  // bumped: Phase 0 VN prologue
  var PROLOGUE_KEY = "yysd:word-realm-prologue-v3";
  var VN_MIST3_KEY = "yysd:word-realm-vn-mist3";
  var VN_FLAGS_KEY = "yysd:word-realm-vn-flags";
  var VN_SEEN_KEY = "yysd:word-realm-vn-seen";
  var REGION_ORDER = ["mist", "stone", "tide", "ash", "archive", "throne"];
  var lexCache = null;
  var VN = window.YYSD_WORD_REALM_VN;
  var VN_SCRIPT = window.YYSD_WORD_REALM_VN_SCRIPT;

  function esc(s) { return Y.esc(String(s == null ? "" : s)); }

  function viewParam() {
    var v = (params.get("view") || "").trim();
    if (v === "map" || v === "codex" || v === "hub" || v === "dream" || v === "lore" ||
        v === "vn" || v === "clear") return v;
    // biến thể của | chiến đấu trở về luôn luôn dải region=: trực tiếp rơi xuống đất sơ đồ
    if ((params.get("region") || "").trim()) return "map";
    return "hub";
  }

  var CH1_SETTLE_KEY = "yysd:word-realm-ch1-settle";
  var MIST_MID = { "shrine-04": "mist_event_04", "shrine-06": "mist_event_06" };

  function mistChapterCleared() {
    return CORE.isCleared("shrine-08");
  }

  function seenCh1Settle() {
    try { return localStorage.getItem(CH1_SETTLE_KEY) === "1"; } catch (e) { return false; }
  }

  function markCh1Settle() {
    try { localStorage.setItem(CH1_SETTLE_KEY, "1"); } catch (e) {}
  }

  function loadVnSeen() {
    try { return JSON.parse(localStorage.getItem(VN_SEEN_KEY) || "{}") || {}; }
    catch (e) { return {}; }
  }

  function vnSeen(id) {
    return !!loadVnSeen()[id];
  }

  function markVnSeen(id) {
    if (!id) return;
    var s = loadVnSeen();
    s[id] = 1;
    try { localStorage.setItem(VN_SEEN_KEY, JSON.stringify(s)); } catch (e) {}
    if (id === "mist_after_03" || id === "mist_clear3") {
      try { localStorage.setItem(VN_MIST3_KEY, "1"); } catch (e2) {}
    }
  }

  /** Preserve paragraph breaks from story novel strings. */
  function proseHTML(text) {
    return String(text || "")
      .split(/\n\n+/)
      .map(function (p) { return "<p>" + esc(p).replace(/\n/g, "<br>") + "</p>"; })
      .join("");
  }

  function portraitHTML(src, fallback, cls) {
    if (!src) return '<div class="' + cls + '" aria-hidden="true"><span>' + esc(fallback) + "</span></div>";
    return '<div class="' + cls + ' ' + cls + '--img" aria-hidden="true">' +
      '<img src="' + esc(src) + '" alt="" loading="lazy" onerror="this.style.display=\'none\';var s=this.nextElementSibling;if(s)s.hidden=false">' +
      '<span hidden>' + esc(fallback) + "</span></div>";
  }

  function regionParam() {
    var r = (params.get("region") || "").trim();
    if (!STORY.regions[r]) {
      try { r = localStorage.getItem("yysd:word-realm-region") || "mist"; }
      catch (e) { r = "mist"; }
    }
    // pilot: viết tắt của sương mù trước đây chương giống nhau rơi xuống mist
    if (!CORE.regionUnlocked(r)) r = "mist";
    return r;
  }

  function setQuery(view, region, pin) {
    if (region) {
      try { localStorage.setItem("yysd:word-realm-region", region); } catch (e) {}
    }
    var u = new URL(location.href);
    var keepPin = pin || u.searchParams.get("pin") || "";
    u.searchParams.set("view", view || "hub");
    if (region) u.searchParams.set("region", region);
    else u.searchParams.delete("region");
    if (view === "map" && keepPin) u.searchParams.set("pin", keepPin);
    else u.searchParams.delete("pin");
    u.searchParams.delete("book");
    history.replaceState(null, "", u.pathname + u.search);
    params = new URLSearchParams(location.search);
  }

  function hrefView(view, region) {
    var q = "?view=" + encodeURIComponent(view);
    if (region) q += "&region=" + encodeURIComponent(region);
    return "word-realm.html" + q;
  }

  function lessonHref(shrineId) {
    var base = "vocab-lesson.html?from=realm&shrine=" + encodeURIComponent(shrineId);
    var mid = MIST_MID[shrineId];
    if (mid && !vnSeen(mid)) {
      return "word-realm.html?view=vn&script=" + encodeURIComponent(mid) +
        "&next=lesson&shrine=" + encodeURIComponent(shrineId);
    }
    var boss = STORY.bossOf && STORY.bossOf(shrineId);
    if (boss && boss.vnPre && !vnSeen(boss.vnPre)) {
      return "word-realm.html?view=vn&script=" + encodeURIComponent(boss.vnPre) +
        "&next=lesson&shrine=" + encodeURIComponent(shrineId);
    }
    return base;
  }

  function resolveVnNext() {
    var next = (params.get("next") || "hub").trim();
    var shrine = (params.get("shrine") || "").trim();
    var region = (params.get("region") || "").trim();
    if (next === "lesson" && shrine) {
      location.href = "vocab-lesson.html?from=realm&shrine=" + encodeURIComponent(shrine) + "&bossVn=1";
      return;
    }
    if (next === "clear") {
      setQuery("clear", region || "mist");
      boot();
      return;
    }
    if (next === "map") {
      setQuery("map", region || "mist");
      boot();
      return;
    }
    setQuery("hub");
    boot();
  }

  function campHref() {
    return "vocab-lesson.html?from=realm&mode=camp";
  }

  function seenPrologue() {
    try { return localStorage.getItem(PROLOGUE_KEY) === "1"; } catch (e) { return false; }
  }

  function markPrologue() {
    try { localStorage.setItem(PROLOGUE_KEY, "1"); } catch (e) {}
  }

  function shrineBeat(shrine) {
    return STORY.shrineBeat(shrine.region, shrine.index, " cuộc viễn chinh nhà thờ " + shrine.index);
  }

  function unlockedFragments(doneCount) {
    return (STORY.fragments || []).filter(function (f) {
      return doneCount >= f.afterShrine;
    });
  }

  function isRegionUnlocked(regionId) {
    if (CORE.regionUnlocked) return CORE.regionUnlocked(regionId);
    if (STORY.regionUnlocked) return STORY.regionUnlocked(regionId, CORE.isCleared);
    return true;
  }

  /** Hub: six-chapter saga progress (replaces grey Ch2 teaser). */
  function sagaProgressHTML(doneCount) {
    var chapters = STORY.chapters || [];
    if (!chapters.length) return "";
    var cards = chapters.map(function (ch) {
      var open = isRegionUnlocked(ch.region);
      var range = CORE.regionRange(ch.region);
      var cleared = 0;
      for (var i = range.start; i <= range.end; i++) {
        var id = "shrine-" + String(i).padStart(2, "0");
        if (CORE.isCleared(id)) cleared++;
      }
      var total = range.end - range.start + 1;
      var done = cleared >= total;
      var cls = "wr-saga__ch" + (open ? " is-open" : " is-locked") + (done ? " is-done" : "");
      return '<article class="' + cls + '">' +
        '<p class="wr-kicker">' + (open ? (done ? " đã thông quan " : " tiến hành Trung Quốc ") : " chưa được giải quyết khóa ") + "</p>" +
        "<h3>" + esc(ch.title) + "</h3>" +
        "<p>" + esc(open ? ch.summary : " đánh bại trước một chương Boss hoàng hậu mở ") + "</p>" +
        (open
          ? ('<span class="wr-saga__prog">' + cleared + "/" + total + "</span>")
          : '<span class="wr-saga__lock">khóa</span>') +
        "</article>";
    }).join("");
    return '<section class="wr-saga" aria-label=" một bản anh hùng ca sáu chương ">' +
      '<p class="wr-kicker">biến thể cũ của | biên giới một bản anh hùng ca · sáu chương</p>' +
      "<h2>cuộc viễn chinh hồ sơ</h2>" +
      '<p class="wr-saga__lead">biến thể của | buổi sáng sương mù đến quên ngai vàng--thắp sáng ' + doneCount + "/" +
        (CORE.shrineTotal ? CORE.shrineTotal() : 48) + " chỗ ngồi nhà thờ </p>" +
      '<div class="wr-saga__grid">' + cards + "</div></section>";
  }

  function allFragments() {
    return STORY.fragments || [];
  }

  function topChrome(snap, active) {
    var muteOn = SFX && SFX.muted();
    return '<header class="wr-top">' +
      '<a class="wr-back" href="zone.html?zone=study&s=vocab">← rời khỏi biến thể cũ của | biên giới</a>' +
      '<div class="wr-brand"><span>biến thể cũ của | biên giới cuộc viễn chinh</span><em>Hub · Map · Codex</em></div>' +
      '<div class="wr-top__right">' +
        '<button type="button" class="wr-mute" id="wr-mute" aria-pressed="' + (muteOn ? "true" : "false") + '">' +
          (muteOn ? " giọng: ải núi " : " giọng: mở ") + "</button>" +
        '<div class="wr-lv">Lv.' + snap.level + " · " + esc(snap.title) + "</div>" +
      "</div>" +
    "</header>" +
    '<nav class="wr-tabs" aria-label=" cuộc viễn chinh điều hướng ">' +
      '<a class="wr-tab' + (active === "hub" ? " is-on" : "") + '" href="' + hrefView("hub") + '">trại</a>' +
      '<a class="wr-tab' + (active === "map" ? " is-on" : "") + '" href="' + hrefView("map", regionParam()) + '">bản đồ</a>' +
      '<a class="wr-tab' + (active === "codex" ? " is-on" : "") + '" href="' + hrefView("codex") + '">sách hướng dẫn minh họa</a>' +
    "</nav>";
  }

  function bindMute() {
    var btn = document.getElementById("wr-mute");
    if (!btn || !SFX) return;
    btn.onclick = function () {
      SFX.setMuted(!SFX.muted());
      if (SFX) SFX.ui();
      btn.textContent = SFX.muted() ? " giọng: ải núi " : " giọng: mở ";
      btn.setAttribute("aria-pressed", SFX.muted() ? "true" : "false");
    };
  }

  function boardHTML(snap) {
    // ponytail: địa phương đi một vòng thông báo hoặc thông tri biến thể của vị trí--sử dụng gốc đi một vòng XP tạo ra vững vàng giả đối thủ, không nhận máy chủ
    var me = snap.weekXp || 0;
    var ghosts = [
      { name: " sương mù trước đây người học việc ", xp: Math.max(0, me - 12) },
      { name: " đơn vị đo lường khô cho ngũ cốc bằng mười đấu phương ngữ người đi bộ ", xp: Math.max(8, Math.round(me * 0.7) + 5) },
      { name: " thuỷ triều âm thanh thư ký ", xp: Math.max(0, me - 3) }
    ];
    var rows = [{ name: " tôi(dũng cảm người mà)", xp: me, me: true }].concat(ghosts);
    rows.sort(function (a, b) { return b.xp - a.xp; });
    return '<ol class="wr-board">' + rows.map(function (r, i) {
      return '<li class="' + (r.me ? "is-me" : "") + '">' +
        '<span><em>' + (i + 1) + "</em> " + esc(r.name) + "</span><b>" + r.xp + " XP</b></li>";
    }).join("") +
      '<li class="wr-board__soon"><span>giống cơ chế thời gian thực thông báo hoặc thông tri</span><em>sắp nở hoa</em></li></ol>';
  }

  function saveVnFlags(flags) {
    try { localStorage.setItem(VN_FLAGS_KEY, JSON.stringify(flags || {})); } catch (e) {}
  }

  function finishPrologue(flags) {
    saveVnFlags(flags);
    markPrologue();
    setQuery("hub");
    boot();
  }

  function playVnScript(scriptKey, done) {
    var pack = VN_SCRIPT && VN_SCRIPT[scriptKey];
    if (!VN || !pack) {
      if (done) done({});
      return;
    }
    var portraits = Object.assign({}, (VN_SCRIPT && VN_SCRIPT.portraits) || {}, {
      hero: (STORY.cast && STORY.cast.hero && STORY.cast.hero.portrait) || "",
      ella: (STORY.cast && STORY.cast.ella && STORY.cast.ella.portrait) || ""
    });
    root.innerHTML = "";
    VN.play(root, pack, {
      portraits: portraits,
      onDone: function (flags) {
        markVnSeen(scriptKey);
        if (done) done(flags);
      },
      onSkip: function (flags) {
        markVnSeen(scriptKey);
        if (done) done(flags);
      }
    });
  }

  function renderPrologue() {
    playVnScript("prologue", finishPrologue);
  }

  function renderVnRoute() {
    var key = (params.get("script") || "").trim();
    if (!key || !VN_SCRIPT || !VN_SCRIPT[key]) {
      resolveVnNext();
      return;
    }
    playVnScript(key, function () { resolveVnNext(); });
  }

  function maybePlayMist3Vn(then) {
    if (vnSeen("mist_after_03") || vnSeen("mist_clear3")) { then(); return; }
    try {
      if (localStorage.getItem(VN_MIST3_KEY) === "1") { then(); return; }
    } catch (e) {}
    if (CORE.clearedCount() < 3) { then(); return; }
    playVnScript("mist_after_03", then);
  }

  function maybePlayMistEnter(then) {
    if (vnSeen("mist_enter")) { then(); return; }
    playVnScript("mist_enter", then);
  }

  function maybePlayMistRevisit(then) {
    if (!mistChapterCleared() || vnSeen("mist_revisit")) { then(); return; }
    playVnScript("mist_revisit", then);
  }

  function renderChapterClear() {
    setQuery("clear", "mist");
    markCh1Settle();
    var snap = RPG.snapshot();
    var ch = STORY.chapterOfRegion ? STORY.chapterOfRegion("mist") : (STORY.chapters && STORY.chapters[0]);
    var ella = (STORY.cast && STORY.cast.ella) || { name: " ngải cứu hoặc ngải đắng kéo " };
    root.innerHTML =
      topChrome(snap, "hub") +
      '<section class="wr-clear" aria-label=" đầu tiên chương thông quan ">' +
        '<p class="wr-kicker">Chapter I · Cleared</p>' +
        "<h1>" + esc(ch ? ch.title : " đầu tiên chương ") + "</h1>" +
        '<p class="wr-clear__en">Those Who Remember Names</p>' +
        '<div class="wr-clear__stats">' +
          '<div class="wr-stat"><span>hạng</span><b>Lv.' + snap.level + "</b></div>" +
          '<div class="wr-stat"><span>tên</span><b>' + esc(snap.title) + "</b></div>" +
          '<div class="wr-stat"><span>nhớ cua sức mạnh</span><b>' + snap.totalXp + "</b></div>" +
          '<div class="wr-stat"><span>thắp sáng nhà thờ</span><b>' + CORE.clearedCount() + "/" +
            (CORE.shrineTotal ? CORE.shrineTotal() : 48) + "</b></div>" +
        "</div>" +
        '<div class="wr-clear__ella">' +
          portraitHTML(ella.portrait, "✎", "wr-ella__face") +
          '<div><p class="wr-kicker">viết tắt của | quan chức hoặc nhân viên chính phủ nhỏ ngải cứu hoặc ngải đắng kéo · ghi chép sự kiện</p>' +
          "<p>«đầu tiên chương hoàn thành sương mù trước đây nhớ các bạn của tên hoàn thành hướng đông của đường vẫn tồn tại sương mù biến thể của |--trước xoay vòng trại nghỉ ngơi và tái tổ chức, xuống một chương nở hoa biến thể cũ của | tôi có thể đánh thức bạn »</p></div>" +
        "</div>" +
        '<p class="wr-clear__lead">đầu tiên chương thông quan · sương mù trước đây thử chơi</p>' +
        '<div class="wr-clear__actions">' +
          '<a class="wr-btn wr-btn--gold" href="' + hrefView("hub") + '">xoay vòng trại ›</a>' +
          '<a class="wr-btn wr-btn--ghost" href="' + hrefView("map", "mist") + '">lại tuần tra sương mù trước đây</a>' +
          '<button type="button" class="wr-btn wr-btn--ghost" id="wr-clear-replay">lặp lại chăm sóc thông quan diễn</button>' +
        "</div>" +
      "</section>";
    bindMute();
    var replay = document.getElementById("wr-clear-replay");
    if (replay) {
      replay.onclick = function () {
        location.href = "word-realm.html?view=vn&script=mist_boss_post&next=clear&region=mist";
      };
    }
  }

  function renderLore() {
    setQuery("lore");
    var snap = RPG.snapshot();
    var vols = (STORY.chronicle && STORY.chronicle.volumes) || [];
    var pitch = (STORY.chronicle && STORY.chronicle.pitch) || "";
    var volHTML = vols.map(function (v) {
      return '<article class="wr-lore-card">' +
        '<p class="wr-kicker">dệt năm</p>' +
        "<h2>" + esc(v.title) + "</h2>" +
        proseHTML(v.body) +
        "</article>";
    }).join("");
    root.innerHTML =
      topChrome(snap, "codex") +
      '<section class="wr-lore">' +
        '<header class="wr-codex__head">' +
          "<h1>" + esc(STORY.sagaTitle || " biến thể cũ của | biên giới dệt năm ") + "</h1>" +
          "<p>" + esc(pitch) + "</p>" +
          '<p><a class="wr-btn wr-btn--ghost" href="' + hrefView("codex") + '">← xoay vòng sách hướng dẫn minh họa</a> ' +
          '<button type="button" class="wr-btn wr-btn--gold" id="wr-replay-pro">lặp lại chăm sóc lời mở đầu diễn</button></p>' +
        "</header>" +
        volHTML +
      "</section>";
    var replay = document.getElementById("wr-replay-pro");
    if (replay) {
      replay.onclick = function () {
        try { localStorage.removeItem(PROLOGUE_KEY); } catch (e) {}
        renderPrologue();
      };
    }
    bindMute();
  }

  function currentShrineNode(nodes) {
    return nodes.find(function (n) { return !n.isChest && n.state === "current"; }) || null;
  }

  function renderHub(lex) {
    setQuery("hub");
    var snap = RPG.snapshot();
    var nodes = CORE.pathNodes(lex);
    var cur = currentShrineNode(nodes);
    var doneCount = CORE.clearedCount();
    var frags = unlockedFragments(doneCount);
    var mentor = STORY.mentorLines[doneCount % STORY.mentorLines.length];
    var hero = (STORY.cast && STORY.cast.hero) || { name: " biến thể cũ của | cua dũng cảm người mà ", role: " vật chủ ", blurb: "" };
    var ella = (STORY.cast && STORY.cast.ella) || null;
    var stats = lex.stats || {};
    var nextHref = cur ? lessonHref(cur.shrine.id) : hrefView("map", "mist");
    var nextBeat = cur ? shrineBeat(cur.shrine) : null;
    var nextRegion = cur ? (STORY.regions[cur.shrine.region] || STORY.regions.mist) : null;
    var chapter = cur && STORY.chapterOfRegion
      ? STORY.chapterOfRegion(cur.shrine.region)
      : (STORY.chapters && STORY.chapters[0]) || null;
    var isBossNext = !!(cur && STORY.isBossShrine && STORY.isBossShrine(cur.shrine.id));
    var boss = isBossNext && STORY.bossOf ? STORY.bossOf(cur.shrine.id) : null;
    var theme = CORE.weeklyTheme ? CORE.weeklyTheme() : null;
    var totalShrines = CORE.shrineTotal ? CORE.shrineTotal() : 48;
    var mistDone = mistChapterCleared();
    var mistRange = CORE.regionRange("mist");
    var mistLit = 0;
    for (var mi = mistRange.start; mi <= mistRange.end; mi++) {
      if (CORE.isCleared("shrine-" + String(mi).padStart(2, "0"))) mistLit++;
    }
    var questMeta = chapter
      ? ("Quest · " + (chapter.questLine || chapter.summary) +
        " · " + (chapter.recLevel || "-") +
        (chapter.region === "mist" && !mistDone
          ? (" · tốc độ tiến triển " + mistLit + "/8")
          : ""))
      : "";
    var settleBanner = mistDone
      ? ('<section class="wr-clear-banner">' +
          '<p class="wr-kicker">Chapter I · Cleared</p>' +
          "<h2>đầu tiên chương thông quan · sương mù trước đây thử chơi</h2>" +
          "<p>buổi sáng sương mù đã thanh trừng theo sau chương chưa nở hoa--trước tồn tại tu luyện khổ hạnh sân phơi giữ kiếm hai lưỡi cảm thấy, có thể lặp lại tuần tra sương mù trước đây </p>" +
          '<a class="wr-btn wr-btn--gold" href="' + hrefView("map", "mist") + '">lại tuần tra sương mù trước đây ›</a>' +
          (seenCh1Settle()
            ? (' <a class="wr-btn wr-btn--ghost" href="' + hrefView("clear") + '">lặp lại chăm sóc thanh toán</a>')
            : (' <a class="wr-btn wr-btn--ghost" href="' + hrefView("clear") + '">nhận thông quan thanh toán ›</a>')) +
        "</section>")
      : "";

    root.innerHTML =
      topChrome(snap, "hub") +
      '<section class="wr-hub">' +
        '<div class="wr-hero-card">' +
          portraitHTML(hero.portrait, "✦", "wr-hero-art") +
          '<div class="wr-hero-body">' +
            '<p class="wr-kicker">' + esc(hero.role) + " · trại</p>" +
            "<h1>" + esc(hero.name) + "</h1>" +
            "<p>" + esc(hero.blurb) + "</p>" +
            '<div class="wr-stat-row">' +
              '<div class="wr-stat"><span>hạng</span><b>Lv.' + snap.level + "</b></div>" +
              '<div class="wr-stat"><span>tên</span><b>' + esc(snap.title) + "</b></div>" +
              '<div class="wr-stat"><span>nhớ cua sức mạnh</span><b>' + snap.totalXp + "</b></div>" +
              '<div class="wr-stat"><span>thắp sáng nhà thờ</span><b>' + doneCount + "/" +
                (CORE.shrineTotal ? CORE.shrineTotal() : 48) + "</b></div>" +
            "</div>" +
            '<div class="wr-xp"><i style="width:' + snap.pct + '%"></i></div>' +
            '<p class="wr-xp__txt">' + snap.into + " / " + snap.need + " · gốc đi một vòng " + snap.weekXp + " XP</p>" +
          "</div>" +
        "</div>" +
        settleBanner +
        '<nav class="wr-camp-menu" aria-label=" trại mệnh lệnh ">' +
          '<p class="wr-camp-menu__label">COMMAND</p>' +
          '<div class="wr-camp-menu__grid">' +
            '<a class="wr-camp-menu__btn" href="' + hrefView("map", cur ? cur.shrine.region : regionParam()) +
              '">cuộc viễn chinh<span>bản đồ · thắp sáng nhà thờ tổ</span></a>' +
            '<a class="wr-camp-menu__btn" href="' + campHref() +
              '">tu luyện khổ hạnh<span>ngôi sao mảnh vụn tu luyện khổ hạnh sân phơi · hầu như nhớ cua sức mạnh</span></a>' +
            '<a class="wr-camp-menu__btn" href="' + hrefView("codex") +
              '">sách hướng dẫn minh họa<span>phá hủy đầu ' + frags.length + "/" + allFragments().length + "</span></a>" +
            '<a class="wr-camp-menu__btn" href="' + hrefView("lore") +
              '">dệt năm<span>lời mở đầu biến thể của | một bản anh hùng ca toàn văn</span></a>' +
            '<button type="button" class="wr-camp-menu__btn" id="wr-hub-replay-pro">lời mở đầu<span>lặp lại chấp nhận một sự thật khó chịu sân phơi diễn</span></button>' +
            (mistDone
              ? ('<a class="wr-camp-menu__btn" href="' + hrefView("clear") +
                '">thanh toán<span>đầu tiên chương thông quan nhìn lại</span></a>')
              : "") +
          "</div>" +
        "</nav>" +
        (theme
          ? ('<section class="wr-weekly">' +
              '<p class="wr-kicker">gốc đi một vòng đi một vòng luôn luôn</p>' +
              "<h2>" + esc(theme.name) + "</h2>" +
              "<p>" + esc(theme.blurb) + "</p>" +
              '<a class="wr-btn wr-btn--gold" href="' + campHref() + '">đi vào đi một vòng luôn luôn huấn luyện +' +
                (theme.bonusXp || 0) + " ›</a></section>")
          : "") +
        '<section class="wr-ella">' +
          portraitHTML(ella && ella.portrait, "✎", "wr-ella__face") +
          '<div class="wr-ella__body">' +
            '<p class="wr-kicker">viết tắt của | quan chức hoặc nhân viên chính phủ nhỏ ngải cứu hoặc ngải đắng kéo · nhiệm vụ tấm</p>' +
            (chapter
              ? ("<h2>" + esc(chapter.title) + "</h2>" +
                (questMeta ? '<p class="wr-ella__quest">' + esc(questMeta) + "</p>" : "") +
                '<div class="wr-ella__novel">' + proseHTML(chapter.novel || chapter.summary) + "</div>" +
                '<p class="wr-ella__tip">«' + esc(chapter.ellaTip) + "»</p>")
              : "<h2>sổ ghi chép mở ra</h2><p>trước đi bản đồ thắp sáng một chỗ ngồi nhà thờ </p>") +
          "</div>" +
        "</section>" +
        '<section class="wr-quest' + (isBossNext ? " wr-quest--boss" : "") +
          (mistDone && !cur ? " wr-quest--clear" : "") + '">' +
          '<p class="wr-kicker">' +
            (mistDone && (!cur || cur.shrine.region !== "mist")
              ? " xuống một chương "
              : (isBossNext ? " địa phương Boss" : " hôm nay mục tiêu ")) + "</p>" +
          (nextBeat
            ? ("<h2>" + esc(nextBeat.shrineName) + " · " + esc(nextRegion.name) +
              (boss ? (" · " + esc(boss.name)) : "") + "</h2>" +
              "<p>" + esc(nextBeat.enter) + "</p>" +
              (chapter && chapter.recLevel
                ? ('<p class="wr-quest__rec">đề xuất ' + esc(chapter.recLevel) +
                  (nextBeat.shrineName ? (" · xuống một nhà thờ: " + esc(nextBeat.shrineName)) : "") + "</p>")
                : "") +
              '<a class="wr-btn wr-btn--gold" href="' + nextHref + '">' +
                (isBossNext ? " thử thách Boss ›" : " ra trận ›") + "</a>" +
              '<a class="wr-btn wr-btn--ghost" href="' + hrefView("map", cur.shrine.region) + '">địa phương sơ đồ dùng trong | xem xét</a>')
            : (mistDone
              ? ("<h2>sương mù trước đây đã thông quan</h2>" +
                "<p>theo sau chương chưa nở hoa đi tu luyện khổ hạnh sân phơi giữ kiếm hai lưỡi cảm thấy, có thể lặp lại tuần tra sương mù trước đây xem lại biến thể cũ của | luật </p>" +
                '<a class="wr-btn wr-btn--gold" href="' + campHref() + '">ngôi sao mảnh vụn tu luyện khổ hạnh sân phơi ›</a>' +
                '<a class="wr-btn wr-btn--ghost" href="' + hrefView("map", "mist") + '">lại tuần tra sương mù trước đây</a>')
              : ("<h2>cuộc viễn chinh tạm thời không có xuống một nhà thờ</h2><p>đi sách hướng dẫn minh họa nhấn mạnh phá hủy đầu, có thể theo học nâng cao luyện sân phơi giữ kiếm hai lưỡi cảm thấy </p>"))) +
          '<p class="wr-mentor">«' + esc(mentor) + "»" +
            (ella ? " -- " + esc(ella.name) : "") + "</p>" +
          '<p class="wr-lex-meta">trộn kho từ ' + (stats.total || "-") +
            " · vô cùng khó khăn " + ((stats.byTier && stats.byTier[4]) || 0) +
            " · một bản anh hùng ca " + doneCount + "/" + totalShrines + "</p>" +
        "</section>" +
        sagaProgressHTML(doneCount) +
        '<section class="wr-panel wr-panel--board">' +
          "<h2>gốc đi một vòng biến thể cũ của | biên giới thông báo hoặc thông tri</h2>" +
          "<p>nhấn gốc đi một vòng nhớ cua sức mạnh sắp xếp bóng ma đối thủ chỉ để đối chiếu, cơ chế thời gian thực thông báo hoặc thông tri một lát nữa lên mạng </p>" +
          boardHTML(snap) +
        "</section>" +
      "</section>";
    bindMute();
    var hubReplay = document.getElementById("wr-hub-replay-pro");
    if (hubReplay) {
      hubReplay.onclick = function () {
        try { localStorage.removeItem(PROLOGUE_KEY); } catch (e) {}
        renderPrologue();
      };
    }
  }

  function renderDream() {
    var id = CORE.pendingDream() || (params.get("dream") || "").trim();
    var dream = id ? CORE.peekDream(id) : null;
    if (!dream) {
      setQuery("hub");
      boot();
      return;
    }
    var snap = RPG.snapshot();
    var i = 0;
    function paint() {
      setQuery("dream");
      root.innerHTML =
        topChrome(snap, "hub") +
        '<section class="wr-dream">' +
          '<p class="wr-kicker">hoàng tử phá hủy hình ảnh</p>' +
          "<h1>" + esc(dream.title) + "</h1>" +
          '<p class="wr-dream__line">' + esc(dream.lines[i] || "") + "</p>" +
          '<p class="wr-dream__step">' + (i + 1) + " / " + dream.lines.length + "</p>" +
          '<div class="wr-dream__actions">' +
            '<button type="button" class="wr-btn wr-btn--ghost" id="wr-dream-skip">nhảy qua xứ mơ</button>' +
            '<button type="button" class="wr-btn wr-btn--gold" id="wr-dream-next">' +
              (i >= dream.lines.length - 1 ? " thức dậy · xoay vòng trại " : " xuống một dòng thơ ") + "</button>" +
          "</div>" +
        "</section>";
      function finish() {
        CORE.consumeDream(dream.id);
        location.href = hrefView("hub");
      }
      bindMute();
      document.getElementById("wr-dream-skip").onclick = finish;
      document.getElementById("wr-dream-next").onclick = function () {
        if (i >= dream.lines.length - 1) finish();
        else { i++; paint(); }
      };
    }
    paint();
  }

  function pinNodesForRegion(nodes, regionId) {
    var range = CORE.regionRange(regionId);
    return nodes.filter(function (n) {
      return !n.isChest && n.shrine.index >= range.start && n.shrine.index <= range.end;
    });
  }

  function chestNear(nodes, shrineId) {
    var ck = "chest-" + shrineId;
    return nodes.find(function (n) { return n.isChest && n.chestId === ck; }) || null;
  }

  function renderMap(lex) {
    var regionId = regionParam();
    if (!STORY.regions[regionId]) regionId = "mist";
    if (!isRegionUnlocked(regionId)) {
      // Fall back to the furthest unlocked region
      for (var ri = REGION_ORDER.length - 1; ri >= 0; ri--) {
        if (isRegionUnlocked(REGION_ORDER[ri])) { regionId = REGION_ORDER[ri]; break; }
      }
    }
    var region = STORY.regions[regionId];
    var snap = RPG.snapshot();
    var nodes = CORE.pathNodes(lex);
    var pins = pinNodesForRegion(nodes, regionId);
    var layout = STORY.pinLayout || [];
    var cur = currentShrineNode(nodes);
    var doneCount = CORE.clearedCount();
    var selectedId = (params.get("pin") || "").trim();
    if (!selectedId && cur && cur.shrine.region === regionId) selectedId = cur.shrine.id;
    if (!selectedId && pins[0]) selectedId = pins[0].shrine.id;
    setQuery("map", regionId, selectedId);

    var segs = REGION_ORDER.map(function (id) {
      var reg = STORY.regions[id];
      var on = id === regionId;
      var open = isRegionUnlocked(id);
      if (!open) {
        return '<span class="wr-seg is-locked" title=" đánh bại trước một chương Boss hoàng hậu mở khóa " aria-disabled="true">' +
          esc(reg.name) + "</span>";
      }
      return '<a class="wr-seg' + (on ? " is-on" : "") + '" href="' + hrefView("map", id) + '">' +
        esc(reg.name) + "</a>";
    }).join("");

    var clearHTML = "";
    var regionDone = 0;
    var pinsHTML = pins.map(function (n, i) {
      var pos = layout[i] || { left: 20 + i * 8, top: 40 };
      var beat = shrineBeat(n.shrine);
      var isBoss = (i + 1) === pins.length;
      var cls = "wr-pin is-" + n.state + (n.shrine.id === selectedId ? " is-selected" : "") +
        (isBoss ? " is-boss" : "");
      var label = isBoss ? "Boss" : String(i + 1);
      var tag = n.state === "current" ? " mục tiêu " : (n.state === "done" ? " đã thắp sáng " : " chưa biến thể của | ");
      if (n.state === "done" || n.state === "current") {
        regionDone += n.state === "done" ? 1 : 0;
        clearHTML += '<span class="wr-fog-clear' + (n.state === "current" ? " is-current" : "") +
          '" style="left:' + pos.left + "%;top:" + pos.top + '%" aria-hidden="true"></span>';
      }
      if (n.state === "current" || n.state === "done") {
        return '<a class="' + cls + '" style="left:' + pos.left + "%;top:" + pos.top + '%" href="' +
          hrefView("map", regionId) + "&pin=" + encodeURIComponent(n.shrine.id) +
          '" data-pin="' + esc(n.shrine.id) + '" title="' + esc(beat.shrineName) + '">' +
          '<span class="wr-pin__dot">' + (n.state === "done" ? "✓" : "✦") + "</span>" +
          '<span class="wr-pin__tag">' + tag + (isBoss ? " · Boss" : "") + "</span></a>";
      }
      return '<div class="' + cls + '" style="left:' + pos.left + "%;top:" + pos.top +
        '%" title="' + esc(beat.shrineName) + '" aria-disabled="true">' +
        '<span class="wr-pin__dot">' + label + "</span>" +
        '<span class="wr-pin__tag">' + tag + "</span></div>";
    }).join("");
    var fogOpacity = Math.max(0.18, 0.72 - regionDone * 0.07);

    var selected = pins.find(function (n) { return n.shrine.id === selectedId; }) || pins[0];
    var detail = "";
    if (selected) {
      var beat = shrineBeat(selected.shrine);
      var chest = chestNear(nodes, selected.shrine.id);
      var enemy = CORE.enemyFor(selected.shrine.region);
      var actions = "";
      if (selected.state === "current" || selected.state === "done") {
        actions += '<a class="wr-btn wr-btn--gold" href="' + lessonHref(selected.shrine.id) + '">' +
          (selected.state === "done" ? " một lần nữa thử thách " : " đi vào ngấu nghiến biến thể cũ của | chiến đấu ") + "</a>";
      } else {
        actions += '<span class="wr-btn wr-btn--ghost" aria-disabled="true">chưa mở khóa</span>';
      }
      if (chest && chest.state === "chest") {
        actions += '<button type="button" class="wr-btn wr-btn--ghost" data-chest="' +
          esc(chest.chestId) + '">nhận phá hủy đầu +5</button>';
      } else if (chest && chest.state === "claimed") {
        actions += '<span class="wr-detail__meta">phá hủy đầu đã nhận</span>';
      }
      detail =
        '<div class="wr-detail" id="wr-detail">' +
          '<p class="wr-kicker">' + esc(enemy.name) + " · " + esc(enemy.title) + "</p>" +
          "<h2>" + esc(beat.shrineName) + (pins.indexOf(selected) === pins.length - 1 ? " · địa phương ải núi nền tảng " : "") + "</h2>" +
          "<p>" + esc(selected.state === "done" ? beat.clear : beat.enter) + "</p>" +
          '<div class="wr-detail__actions">' + actions + "</div>" +
        "</div>";
    }

    var jumpHint = "";
    if (cur && cur.shrine.region !== regionId) {
      var cr = STORY.regions[cur.shrine.region];
      jumpHint = '<p class="wr-map__jump">thời điểm hiện tại mục tiêu tồn tại«' + esc(cr.name) +
        '»· <a href="' + hrefView("map", cur.shrine.region) + '">đi đến ›</a></p>';
    }

    root.innerHTML =
      topChrome(snap, "map") +
      '<nav class="wr-segs" aria-label=" địa phương ">' + segs + "</nav>" +
      '<p class="wr-transit">' + esc(region.transit || region.blurb) + "</p>" +
      jumpHint +
      '<div class="wr-layout wr-layout--map">' +
        '<main class="wr-map-board wr-map-board--' + esc(region.mapTone || regionId) + '">' +
          '<div class="wr-map-board__head">' +
            "<h1>" + esc(region.name) + "</h1>" +
            "<p>" + esc(region.blurb) + "</p>" +
            '<p class="wr-map__hint">chọn sáng dậy của cái đinh điểm · đã thắp sáng ' + doneCount + "/" +
              (CORE.shrineTotal ? CORE.shrineTotal() : 48) + "</p>" +
          "</div>" +
          '<div class="wr-map-stage' + (region.mapImage ? " has-art" : "") +
            '" id="wr-map-stage">' +
            (region.mapImage
              ? ('<img class="wr-map-art" src="' + esc(region.mapImage) +
                '" alt="" decoding="async" fetchpriority="low">')
              : "") +
            '<div class="wr-map-wash" aria-hidden="true"></div>' +
            '<div class="wr-map-fog" style="opacity:' + fogOpacity + '" aria-hidden="true"></div>' +
            '<div class="wr-fog-clears" aria-hidden="true">' + clearHTML + "</div>" +
            pinsHTML +
          "</div>" +
          detail +
        "</main>" +
        '<aside class="wr-side">' +
          '<section class="wr-panel">' +
            "<h2>ra trận chỉ ra</h2>" +
            "<p>trả lời hoặc đáp lại câu hỏi của ai đó chặt máu, liên kết đúng đòn chí mạng sương mù theo thắp sáng tách ra rút lui không thắp sáng nhà thờ </p>" +
            '<a class="wr-panel wr-panel--link" href="' + hrefView("hub") + '">← xoay vòng trại</a>' +
          "</section>" +
          '<section class="wr-panel">' +
            "<h2>gốc đi một vòng biến thể cũ của | biên giới thông báo hoặc thông tri</h2>" +
            "<p>gốc đi một vòng nhớ cua sức mạnh đối chiếu </p>" +
            boardHTML(snap) +
          "</section>" +
        "</aside>" +
      "</div>";

    bindMute();
    var chestBtn = root.querySelector("[data-chest]");
    if (chestBtn) {
      chestBtn.addEventListener("click", function () {
        var gain = CORE.claimChest(chestBtn.getAttribute("data-chest"), 5);
        if (!gain) return;
        if (SFX) SFX.ui();
        boot();
      });
    }
  }

  function renderCodex(lex) {
    setQuery("codex");
    var snap = RPG.snapshot();
    var doneCount = CORE.clearedCount();
    var frags = allFragments();
    var unlocked = unlockedFragments(doneCount);
    var unlockedIds = {};
    unlocked.forEach(function (f) { unlockedIds[f.id] = true; });
    var enemies = STORY.enemies || {};
    var beatenRegions = {};
    REGION_ORDER.forEach(function (id) {
      var range = CORE.regionRange(id);
      var allDone = true;
      for (var i = range.start; i <= range.end; i++) {
        var sid = "shrine-" + String(i).padStart(2, "0");
        if (!CORE.isCleared(sid)) { allDone = false; break; }
      }
      // gặp gỡ tức là đăng ký: nên khu vực ít nhất thắp sáng 1 nhà thờ nhưng«gặp phải»
      var met = false;
      for (var j = range.start; j <= range.end; j++) {
        var s2 = "shrine-" + String(j).padStart(2, "0");
        if (CORE.isCleared(s2)) { met = true; break; }
      }
      beatenRegions[id] = { met: met, cleared: allDone };
    });

    var fragHTML = frags.map(function (f) {
      var open = !!unlockedIds[f.id];
      return '<article class="wr-codex-card' + (open ? " is-open" : " is-locked") + '">' +
        '<p class="wr-kicker">' + (open ? " đã thu thập " : (" thắp sáng " + f.afterShrine + " nhà thờ hoàng hậu mở khóa ")) + "</p>" +
        "<h3>" + esc(open ? f.title : " phá hủy đầu · ? ? ? ") + "</h3>" +
        "<p>" + esc(open ? f.body : " sương mù phong tước sống hoàn thành chữ viết tay tiếp tục cuộc viễn chinh, tài năng dấu phẩy đến hoàng tử để lại của câu ") + "</p>" +
      "</article>";
    }).join("");

    var foeHTML = REGION_ORDER.map(function (id) {
      var e = enemies[id];
      if (!e) return "";
      var st = beatenRegions[id];
      var open = st.met;
      return '<article class="wr-codex-card wr-codex-card--foe' + (open ? " is-open" : " is-locked") + '">' +
        '<div class="wr-foe-glyph wr-foe-glyph--' + esc(e.skin) + '" aria-hidden="true">' +
          esc(open ? e.glyph : "?") + "</div>" +
        '<div><p class="wr-kicker">' + (st.cleared ? " địa phương thanh trừng " : (open ? " đã gặp phải " : " chưa gặp phải ")) + "</p>" +
        "<h3>" + esc(open ? e.name : "? ? ? ") + "</h3>" +
        "<p>" + esc(open ? e.intro : " chưa dấu chân ") + "</p></div></article>";
    }).join("");

    var cast = STORY.cast || {};
    var castKeys = [
      { k: "hero", need: 0 },
      { k: "ella", need: 0 },
      { k: "prince", need: 0 },
      { k: "deity", need: 32 },
      { k: "eaterKing", need: 40 }
    ];
    var castHTML = castKeys.map(function (row) {
      var c = cast[row.k];
      if (!c) return "";
      var open = doneCount >= row.need;
      return '<article class="wr-codex-card' + (open ? " is-open" : " is-locked") + '">' +
        '<p class="wr-kicker">' + esc(open ? c.role : " chưa cho thấy ") + "</p>" +
        "<h3>" + esc(open ? c.name : "? ? ? ") + "</h3>" +
        "<p>" + esc(open ? c.blurb : (" thắp sáng " + row.need + " nhà thờ hoàng hậu, hồ sơ khả năng có thể viết đi ra này tên ")) + "</p></article>";
    }).join("");

    var sagaHTML = (STORY.chapters || []).map(function (ch) {
      var open = isRegionUnlocked(ch.region);
      return '<article class="wr-codex-card' + (open ? " is-open" : " is-locked") + '">' +
        '<p class="wr-kicker">' + (open ? (" Thứ " + ch.chapter + " Chương ") : " chưa được giải quyết khóa ") + "</p>" +
        "<h3>" + esc(open ? ch.title : " cuộn lại · ? ? ? ") + "</h3>" +
        (open
          ? ('<div class="wr-codex-prose">' + proseHTML(ch.novel) + "</div>")
          : "<p>đánh bại trước một chương Boss, tài năng mở ra này một cuộn lại </p>") +
        "</article>";
    }).join("");

    root.innerHTML =
      topChrome(snap, "codex") +
      '<section class="wr-codex">' +
        '<header class="wr-codex__head">' +
          "<h1>sách hướng dẫn minh họa</h1>" +
          "<p>lời mở đầu biến thể của | dệt năm bất kỳ lúc nào thú vị để đọc phá hủy đầu theo dòng chính mở khóa; tu luyện khổ hạnh sân phơi không rơi xuống </p>" +
          '<p><a class="wr-btn wr-btn--gold" href="' + hrefView("lore") + '">mở ra biến thể cũ của | biên giới dệt năm · lời mở đầu toàn văn ›</a></p>' +
        "</header>" +
        "<h2>một bản anh hùng ca sáu chương</h2>" +
        '<div class="wr-codex-grid">' + sagaHTML + "</div>" +
        "<h2>hoàng tử phá hủy đầu · " + unlocked.length + "/" + frags.length + "</h2>" +
        '<div class="wr-codex-grid">' + fragHTML + "</div>" +
        "<h2>ngấu nghiến biến thể cũ của | danh mục</h2>" +
        '<div class="wr-codex-grid wr-codex-grid--foe">' + foeHTML + "</div>" +
        "<h2>chuyến đi bạn đồng hành biến thể của | kẻ thù cũ</h2>" +
        '<div class="wr-codex-grid">' + castHTML + "</div>" +
      "</section>";
    bindMute();
  }

  function render(lex) {
    lexCache = lex;
    var view = viewParam();
    if (view === "vn") renderVnRoute();
    else if (view === "dream") renderDream();
    else if (view === "clear") renderChapterClear();
    else if (view === "map") {
      if (regionParam() === "mist" && !vnSeen("mist_enter")) {
        maybePlayMistEnter(function () { renderMap(lex); });
      } else if (regionParam() === "mist" && mistChapterCleared() && !vnSeen("mist_revisit")) {
        maybePlayMistRevisit(function () { renderMap(lex); });
      } else {
        renderMap(lex);
      }
    }
    else if (view === "codex") renderCodex(lex);
    else if (view === "lore") renderLore();
    else renderHub(lex);
  }

  function boot() {
    root.innerHTML = '<div class="wr-loading">đang ở mở ra biến thể cũ của | biên giới...</div>';
    if (viewParam() === "vn") {
      renderVnRoute();
      return;
    }
    var ready = lexCache ? Promise.resolve(lexCache) : CORE.loadLexicon();
    ready.then(function (lex) {
      if (!lex.shrines || !lex.shrines.length) {
        root.innerHTML = '<div class="wr-empty">biến thể cũ của | biên giới kho từ chưa tạo ra </div>';
        return;
      }
      if (params.get("pin") && viewParam() !== "map" && viewParam() !== "vn") setQuery("map", regionParam());
      // chiến đấu thanh toán mang về của xứ mơ, có thể trại chưa xong gieo xứ mơ
      if (viewParam() === "dream" || (CORE.pendingDream() && viewParam() === "hub" && !params.get("region"))) {
        renderDream();
        return;
      }
      render(lex);
    }).catch(function (err) {
      root.innerHTML = '<div class="wr-empty">Tải không thành công: ' + esc(err.message) + "</div>";
    });
  }

  // fix hrefView pin append when already has query - used above with string concat
  // pin links use hrefView("map", regionId) + "&pin=" which is correct

  function startWordRealm() {
    if (!seenPrologue()) renderPrologue();
    else {
      maybePlayMist3Vn(function () { boot(); });
    }
  }

  if (window.YYSD_DIAG_GATE) {
    window.YYSD_DIAG_GATE.ensure({ requireLogin: true }).then(function (ok) {
      if (ok) startWordRealm();
    });
  } else {
    startWordRealm();
  }
})();
