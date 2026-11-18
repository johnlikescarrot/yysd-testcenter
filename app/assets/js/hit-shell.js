/* HIT hub shell — 顶栏/首页/个人页 + 真题题库一屏列表 */
(function (w) {
  "use strict";
  var LINKS = [
    { href: "home.html", key: "home", zh: "Trang chủ" },
    { href: "practice.html", key: "practice", zh: "Kho đề thi" },
    { href: "mock.html", key: "mock", zh: "Luyện trước kỳ thi" },
    { href: "profile.html", key: "profile", zh: "Cá nhân" }
  ];
  var SUBJECTS = [
    { skill: "reading", zh: "Đọc", chips: ["Điền chữ cái còn thiếu", "Đọc trong đời sống", "Bài đọc học thuật"] },
    { skill: "listening", zh: "Nghe", chips: ["Nghe và chọn lời đáp", "Hội thoại", "Bài giảng"] },
    { skill: "speaking", zh: "Nói", chips: ["Nghe và nhắc lại", "Phỏng vấn mô phỏng"] },
    { skill: "writing", zh: "Viết", chips: ["Sắp xếp thành câu", "Thư điện tử", "Thảo luận học thuật"] }
  ];
  var SKILL_ZH = { reading: "Đọc", listening: "Nghe", speaking: "Nói", writing: "Viết" };

  function parse(raw, fallback) {
    try { return JSON.parse(raw); } catch (e) { return fallback; }
  }
  // 进度存储只有一套：assets/js/toefl-lab.js 的 yysd:toefl-item-state
  function L() { return w.YYSD_TOEFL_LAB; }
  function doneMap() { return L().state(); }
  function lookup(skill, task, set, records) {
    return (records || doneMap())[L().canon(skill, set, task)] || null;
  }
  function isDone(skill, task, set, records) { return !!lookup(skill, task, set, records); }
  function markDone(skill, task, rec) { L().markState(skill, rec && rec.set, task, rec); }

  function initial(name) {
    var s = String(name || "").trim();
    return s ? s.charAt(0) : "U";
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function avatarBox(u, cls) {
    var A = w.YYSD_APP;
    var src = A && A.avatarSrc ? A.avatarSrc(u.avatarUrl) : "";
    var name = u.displayName || u.phone || "";
    if (src) {
      return '<span class="hit-avatar' + (cls ? " " + cls : "") + ' has-img"><img src="' +
        esc(src) + '" alt=""></span>';
    }
    return '<span class="hit-avatar' + (cls ? " " + cls : "") + '" aria-hidden="true">' +
      esc(initial(name)) + "</span>";
  }

  function refreshChrome() {
    var A = w.YYSD_APP;
    var u = A && A.user ? A.user() : {};
    var who = document.getElementById("hit-who");
    if (who) who.textContent = u.displayName || u.phone || "";
    var av = document.querySelector(".hit-top .hit-avatar");
    if (!av) return;
    var wrap = document.createElement("div");
    wrap.innerHTML = avatarBox(u, "");
    av.replaceWith(wrap.firstChild);
  }

  function navHTML(active) {
    var A = w.YYSD_APP;
    var u = A && A.user ? A.user() : {};
    var name = u.displayName || u.phone || "";
    var labOn = /^(reading|listening|speaking|writing)$/.test(active);
    var pills = LINKS.map(function (l) {
      var on = l.key === active || (l.key === "practice" && labOn);
      return '<a href="' + l.href + '" class="hit-tab' + (on ? " is-on" : "") + '"' + (on ? ' aria-current="page"' : '') + '><b>' +
        l.zh + "</b></a>";
    }).join("");
    return '<header class="hit-top">' +
      '<a class="hit-brand" href="home.html"><span class="hit-logo-mark" aria-hidden="true">Y</span>' +
      '<span>YYSD<small>Luyện TOEFL</small></span></a>' +
      '<nav class="hit-pills" aria-label="Điều hướng chính">' + pills + "</nav>" +
      '<div class="hit-user">' + avatarBox({ displayName: name, phone: u.phone, avatarUrl: u.avatarUrl }, "") +
      '<span class="hit-who" id="hit-who">' + esc(name) + "</span>" +
      '<button type="button" class="hit-out" id="hit-reload">Tải lại</button>' +
      '<button type="button" class="hit-out" id="hit-out">Đăng xuất</button></div></header>';
  }

  function hardReload() {
    if (w.yysdDesktop && typeof w.yysdDesktop.reload === "function") {
      w.yysdDesktop.reload();
      return;
    }
    var u = new URL(location.href);
    u.searchParams.set("_r", String(Date.now()));
    location.replace(u.pathname + u.search + u.hash);
  }

  function mount(active) {
    var A = w.YYSD_APP;
    if (A && !A.requireLogin(location.pathname.split("/").pop() + location.search)) return false;
    document.body.insertAdjacentHTML("afterbegin", '<a class="hit-skip" href="#hit-content">Đến nội dung chính</a>' + navHTML(active));
    var main = document.querySelector("main");
    if (main) {
      if (!main.id) main.id = "hit-content";
      main.tabIndex = -1;
      document.querySelector(".hit-skip").href = "#" + main.id;
      document.querySelector(".hit-skip").onclick = function (ev) { ev.preventDefault(); main.focus(); };
    }
    document.body.insertAdjacentHTML("beforeend", '<footer class="hit-footer"><span>Trung tâm Khóa học Quốc tế YYSD</span><span>Luyện TOEFL</span></footer>');
    var out = document.getElementById("hit-out");
    if (out) out.onclick = function () { A.logout(); location.replace("login.html"); };
    var reload = document.getElementById("hit-reload");
    if (reload) reload.onclick = hardReload;
    return true;
  }

  /* ---------- 真题题库：科目 tab + 题型 segmented + 题目列表，一屏到底 ----------
     版式与文案照 hanginthere：idx 决定序号写法，cells 决定行式题号格，其余走大卡；皮肤瑞士黑红、圆角 0。 */
  var LIB = {
    reading: [
      { type: "complete_words", en: "Complete the Words", zh: "Điền chữ cái còn thiếu", idx: "set" },
      { type: "daily_life", en: "Read in Daily Life", zh: "Đọc trong đời sống", idx: "set", count: 1 },
      { type: "academic", en: "Academic Passage", head: "Read an Academic Passage", zh: "Bài đọc học thuật", idx: "set" }
    ],
    listening: [
      { type: "choose_response", en: "Choose a Response", head: "Listen and Choose a Response", zh: "Nghe và chọn lời đáp", idx: "set", prog: 1 },
      { type: "conversation", en: "Conversation", zh: "Hội thoại", idx: "set", prog: 1 },
      { type: "announcement", en: "Announcement", zh: "Thông báo", idx: "set", prog: 1 },
      { type: "lecture", en: "Academic Talk", zh: "Bài giảng học thuật", idx: "set" }
    ],
    speaking: [
      { type: "repeat", en: "Listen and Repeat", zh: "Nghe và nhắc lại", idx: "hash", sub: 1 },
      { type: "interview", en: "Take an Interview", zh: "Trả lời phỏng vấn", idx: "hash", sub: 1 }
    ],
    writing: [
      { type: "sentence", en: "Build a Sentence", zh: "Sắp xếp thành câu", idx: "set" },
      { type: "email", en: "Write an Email", zh: "Viết thư điện tử", idx: "pad", sub: 1 },
      { type: "discussion", en: "Academic Discussion", zh: "Thảo luận học thuật", idx: "pad", sub: 1 }
    ]
  };
  var LIB_SKILLS = ["reading", "listening", "speaking", "writing"];
  var LIB_FILTERS = [{ key: "all", zh: "Tất cả" }, { key: "todo", zh: "Chưa làm" }, { key: "hot", zh: "Thường gặp" }];
  var LIB_HEAD = {
    reading: { kicker: "TOEFL READING LAB", zh: "Luyện Đọc", lead: "Chọn dạng bài, sau đó chọn số câu để bắt đầu." },
    listening: { kicker: "TOEFL LISTENING LAB", zh: "Luyện Nghe", lead: "Chọn dạng bài, sau đó mở bài muốn luyện." },
    speaking: { kicker: "TOEFL SPEAKING LAB", zh: "Luyện Nói", lead: "Chọn dạng bài, sau đó mở bài muốn luyện." },
    writing: { kicker: "TOEFL WRITING LAB", zh: "Luyện Viết", lead: "Chọn dạng bài để tập viết. Bản nháp được lưu trên thiết bị này." }
  };
  var libCatalog = {};
  var libHost = null;
  var libView = { skill: "reading", type: "", filter: "all", query: "", records: null };

  function libMeta(skill, type) {
    return (LIB[skill] || []).filter(function (m) { return m.type === type; })[0] ||
      { type: type, en: type, zh: type, idx: "set" };
  }
  function libGroups(skill, type) {
    return (libCatalog[skill] || []).filter(function (g) { return g.type === type; });
  }
  function itemHref(skill, paperId, task, end) {
    return skill + ".html?id=" + encodeURIComponent(paperId) + "&mode=practice&task=" + encodeURIComponent(task) +
      (end > task ? "&taskEnd=" + encodeURIComponent(end) : "");
  }
  // 一次列表只解析一遍进度表
  function doneInSpan(skill, paperId, from, to, records) {
    var d = records || doneMap();
    var n = 0;
    for (var i = from; i <= to; i++) if (d[L().canon(skill, paperId, i)]) n++;
    return n;
  }
  function libStateOf(skill, g, records) {
    var total = g.end - g.task + 1;
    var done = doneInSpan(skill, g.paperId, g.task, g.end, records);
    return { total: total, done: done, cls: done >= total ? "done" : (done ? "mid" : "todo") };
  }
  function stateLabel(st) {
    return st.cls === "done" ? "Đã hoàn thành" : (st.cls === "mid" ? "Đang làm " + st.done + "/" + st.total : "Chưa bắt đầu");
  }
  function hotChip(g) {
    if (!g.hot) return "";
    var tier = g.hot > 1 ? ["🔥🔥", "Rất thường gặp"] : ["🔥", "Thường gặp"];
    return '<span class="hit-lib-hot" role="img" title="' + tier[1] + '">' + tier[0] + "</span>";
  }
  function idxLabel(meta, g, i) {
    var n = g.sort || i + 1;
    if (meta.idx === "hash") return "#" + n;
    if (meta.idx === "pad") return (n < 10 ? "0" : "") + n;
    return "Set " + n;
  }
  function cardHTML(skill, meta, g, i, records) {
    var st = libStateOf(skill, g, records);
    return '<a class="hit-lib-card is-' + st.cls + '" href="' + itemHref(skill, g.paperId, g.task, g.end) + '">' +
      '<div class="hit-lib-meta"><span class="hit-lib-idx">' + idxLabel(meta, g, i) + "</span>" +
      (meta.count ? '<span class="hit-lib-n" lang="en">' + g.n + " question" + (g.n > 1 ? "s" : "") + "</span>" : "") + hotChip(g) + "</div>" +
      '<h3 class="hit-lib-title" lang="en">' + esc(g.title || meta.en) + "</h3>" +
      (meta.sub ? '<p class="hit-lib-sub">' + esc(g.zh || meta.zh) + "</p>" : "") +
      '<div class="hit-lib-foot">' + stateLabel(st) + "</div></a>";
  }
  // 题号格只进这一道。一整套（task..end）要单独的入口，否则 Windows 同学只能一题一题点。
  function setStartHTML(skill, g) {
    if (!(Number(g.end) > Number(g.task))) return "";
    return '<a class="hit-lib-start" href="' + itemHref(skill, g.paperId, g.task, g.end) + '">Bắt đầu làm bài</a>';
  }
  function rowHTML(skill, meta, g, i, records) {
    var cells = g.cells || [];
    var d = records || doneMap();
    var done = 0;
    var nums = cells.map(function (c) {
      var on = !!d[L().canon(skill, g.paperId, c.task)];
      if (on) done++;
      return '<a class="hit-lib-num' + (on ? " is-done" : "") + '" href="' +
        itemHref(skill, g.paperId, c.task, c.end) + '" title="' + esc(c.label) + '">' + esc(c.label) + "</a>";
    }).join("");
    var st = libStateOf(skill, g, records);
    return '<div class="hit-lib-row is-' + st.cls + '">' +
      '<div class="hit-lib-meta"><span class="hit-lib-idx">' + idxLabel(meta, g, i) + "</span>" + hotChip(g) +
      setStartHTML(skill, g) + "</div>" +
      '<div class="hit-lib-foot">' + (meta.prog ? "Đã làm " + st.done + "/" + st.total : stateLabel(st)) + "</div>" +
      '<div class="hit-lib-nums">' + nums + "</div></div>";
  }
  function libKept(skill, groups, records, hit) {
    var keep = [];
    groups.forEach(function (g, i) {
      if (hit && !hit(g)) return;
      if (libView.filter === "todo" && libStateOf(skill, g, records).cls === "done") return;
      if (libView.filter === "hot" && !g.hot) return;
      keep.push({ g: g, i: i });
    });
    return keep;
  }
  function libBody(skill, meta, keep, records) {
    var rows = keep.some(function (x) { return x.g.cells; });
    return '<div class="' + (rows ? "hit-lib-rows" : "hit-lib-grid") + '">' + keep.map(function (x) {
      return (rows ? rowHTML : cardHTML)(skill, meta, x.g, x.i, records);
    }).join("") + "</div>";
  }
  function filterHTML(groups) {
    var filters = LIB_FILTERS.filter(function (f) {
      return f.key !== "hot" || groups.some(function (g) { return g.hot; });
    });
    return '<div class="hit-filter" role="group" aria-label="Lọc bài">' + filters.map(function (f) {
      return '<button type="button" data-filter="' + f.key + '"' +
        (libView.filter === f.key ? ' class="is-on" aria-pressed="true"' : ' aria-pressed="false"') + ">" + f.zh + "</button>";
    }).join("") + "</div>";
  }
  function panelHTML(skill, meta, groups, records) {
    var keep = libKept(skill, groups, records);
    var body = keep.length ? libBody(skill, meta, keep, records) :
      '<div class="hit-empty"><b>Không có bài khớp bộ lọc</b><p>Chọn “Tất cả” để xem các bài khác.</p></div>';
    return '<div class="hit-lib-panelhead"><h2 lang="en">' + esc(meta.head || meta.en) + "</h2>" + filterHTML(groups) + "</div>" + body;
  }
  // 搜索跨该科目全部题型：题目名只记得住中文或英文，不该先逼用户猜题型
  function searchKey(text) {
    return text.trim().toLowerCase().normalize("NFD").replace(/\p{Mark}/gu, "").replace(/đ/g, "d");
  }
  function libSearchHTML(skill, query, records) {
    var t = searchKey(query);
    var parts = [];
    var total = 0;
    (LIB[skill] || []).forEach(function (meta) {
      var keep = libKept(skill, libGroups(skill, meta.type), records, function (g) {
        return searchKey([g.title, g.zh, g.code].join(" ")).indexOf(t) >= 0;
      });
      if (!keep.length) return;
      total += keep.length;
      parts.push('<h2 class="hit-lib-searchtype">' + esc(meta.zh) + '<span lang="en">' + esc(meta.en) + "</span></h2>" +
        libBody(skill, meta, keep, records));
    });
    var body = total ? parts.join("") :
      '<div class="hit-empty"><b>Không có bài khớp với “' + esc(query.trim()) + '”</b><p>Thử từ khóa khác, hoặc xóa nội dung tìm kiếm để xem tất cả.</p>' +
      '<button type="button" class="hit-go" data-clear>Xóa tìm kiếm</button></div>';
    return '<div class="hit-lib-panelhead"><h2>Tìm “' + esc(query.trim()) + '”<span class="hit-lib-count">Tìm thấy ' +
      total + " nhóm</span></h2>" + filterHTML(libCatalog[skill] || []) + "</div>" + body;
  }
  function segHTML(skill) {
    return (LIB[skill] || []).map(function (m, i) {
      return '<button type="button" role="tab" data-type="' + m.type + '">' +
        '<span class="hit-lib-segnum">' + (i < 9 ? "0" : "") + (i + 1) + "</span>" +
        '<span class="hit-lib-segname"><strong lang="en">' + esc(m.en) + "</strong><small>" + esc(m.zh) + "</small></span></button>";
    }).join("");
  }
  function paintLib() {
    if (!libHost) return;
    var skill = libView.skill;
    var types = LIB[skill] || [];
    if (!libView.type || !types.some(function (m) { return m.type === libView.type; })) libView.type = types[0].type;
    var meta = libMeta(skill, libView.type);
    libHost.querySelectorAll("[data-skill]").forEach(function (b) {
      var on = b.getAttribute("data-skill") === skill;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-selected", String(on));
    });
    libHost.querySelectorAll("[data-type]").forEach(function (b) {
      var on = b.getAttribute("data-type") === libView.type && !libView.query.trim();
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-selected", String(on));
    });
    var panel = libHost.querySelector(".hit-lib-panel");
    var hc = LIB_HEAD[skill];
    libHost.querySelector(".hit-lib-head").innerHTML = '<p class="hit-kicker">' + hc.kicker + "</p><h1>" +
      hc.zh + '</h1><p class="hit-lead">' + hc.lead + "</p>";
    var searching = !!libView.query.trim();
    panel.setAttribute("aria-label", searching ? "Kết quả tìm kiếm" : meta.zh);
    if (!libCatalog[skill]) {
      panel.innerHTML = '<p class="hit-lib-note">Đang tải danh mục đề…</p>';
      return;
    }
    libView.records = doneMap();
    panel.innerHTML = searching ? libSearchHTML(skill, libView.query, libView.records) :
      panelHTML(skill, meta, libGroups(skill, libView.type), libView.records);
  }
  function loadCatalog(skill) {
    if (libCatalog[skill]) { paintLib(); return Promise.resolve(libCatalog[skill]); }
    return fetch("library/toefl/bank-catalog-" + skill + ".json", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        libCatalog[skill] = (d && d.groups) || [];
        paintLib();
        return libCatalog[skill];
      })
      .catch(function () {
        libCatalog[skill] = [];
        paintLib();
        return [];
      });
  }
  function paintBankPapers(host, papers) {
    if (!papers || !papers.length) return;
    host.querySelector(".hit-lib-extra").innerHTML = '<h2 class="hit-minor-heading">Đề do giáo viên soạn</h2><div class="hit-set-list">' +
      papers.map(function (p) {
        return '<a class="hit-set-row" href="bank.html?id=' + encodeURIComponent(p.id) + '"><div class="hit-set-info"><h4>' +
          esc(p.title || p.id) + "</h4><p>" + esc((p.makerName ? p.makerName + " · " : "") + "Luyện tập") + "</p></div></a>";
      }).join("") + "</div>";
  }
  function clearQuery() {
    libView.query = "";
    var el = libHost && libHost.querySelector('[name="query"]');
    if (el) el.value = "";
  }
  function paintPractice(host) {
    libHost = host;
    var q = new URLSearchParams(location.search).get("skill");
    if (LIB_SKILLS.indexOf(q) >= 0) libView.skill = q;
    host.innerHTML = '<section class="hit-lib">' +
      '<div class="hit-lib-head"></div>' +
      '<nav class="hit-lib-skills" role="tablist" aria-label="Kỹ năng">' + LIB_SKILLS.map(function (s) {
        return '<button type="button" role="tab" data-skill="' + s + '">' + SKILL_ZH[s] +
          '<small lang="en">' + s.toUpperCase() + "</small></button>";
      }).join("") + "</nav>" +
      '<div class="hit-lib-seg" role="tablist" aria-label="Dạng bài">' + segHTML(libView.skill) + "</div>" +
      '<form class="hit-search" role="search"><label>Tìm bài luyện<input type="search" name="query" autocomplete="off" placeholder="Nhập tên tiếng Việt hoặc tiếng Anh"></label></form>' +
      '<div class="hit-lib-panel" role="tabpanel"></div>' +
      '<div class="hit-lib-extra"></div></section>';
    host.addEventListener("click", function (ev) {
      var sk = ev.target.closest("[data-skill]");
      if (sk) {
        libView.skill = sk.getAttribute("data-skill");
        libView.type = "";
        clearQuery();
        libHost.querySelector(".hit-lib-seg").innerHTML = segHTML(libView.skill);
        try {
          var q = new URLSearchParams(location.search);
          q.set("skill", libView.skill);
          history.replaceState(null, "", "?" + q);
        } catch (e) {}
        loadCatalog(libView.skill);
        return;
      }
      var tp = ev.target.closest("[data-type]");
      if (tp) {
        libView.type = tp.getAttribute("data-type");
        paintLib();
        return;
      }
      var ft = ev.target.closest("[data-filter]");
      if (ft) {
        libView.filter = ft.getAttribute("data-filter");
        paintLib();
        return;
      }
      if (ev.target.closest("[data-clear]")) {
        clearQuery();
        paintLib();
      }
    });
    host.addEventListener("submit", function (ev) { ev.preventDefault(); });
    host.addEventListener("input", function (ev) {
      if (ev.target.name !== "query") return;
      libView.query = ev.target.value;
      paintLib();
    });
    paintLib();
    loadCatalog(libView.skill);
    var A = w.YYSD_APP;
    if (A && A.api) {
      A.api("/api/tiku/catalog?kind=practice").then(function (d) {
        paintBankPapers(host, d.catalog && d.catalog.papers);
      }).catch(function () {});
    }
  }

  function dayKey(t) {
    var d = new Date(t);
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }

  function stats() {
    var d = doneMap();
    var keys = Object.keys(d);
    var score = 0;
    var total = 0;
    var recs = [];
    var days = {};
    keys.forEach(function (k) {
      var rec = d[k] || {};
      if (rec.total) { score += Number(rec.score) || 0; total += Number(rec.total) || 0; }
      if (rec.at) days[dayKey(rec.at)] = 1;
      var parts = k.split("|");
      recs.push({
        at: rec.at || 0,
        skill: SKILL_ZH[parts[0]] || parts[0] || "—",
        set: String(parts[1] || "1").replace(/^set-/, ""),
        pct: rec.total ? Math.round((Number(rec.score) || 0) / rec.total * 100) + "%" : (rec.ok === false ? "—" : "ok")
      });
    });
    recs.sort(function (a, b) { return b.at - a.at; });
    var streak = 0;
    var cursor = new Date();
    for (;;) {
      if (!days[dayKey(cursor.getTime())]) break;
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return {
      n: keys.length,
      avg: total ? Math.round(score / total * 100) + "%" : "—",
      streak: streak,
      recs: recs.slice(0, 6)
    };
  }

  function fmtWhen(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    var p2 = function (n) { return (n < 10 ? "0" : "") + n; };
    return p2(d.getDate()) + "/" + p2(d.getMonth() + 1) + " " + p2(d.getHours()) + ":" + p2(d.getMinutes());
  }

  function paintProfile(host) {
    var A = w.YYSD_APP;
    var acc = null;
    function permHTML() {
      var row = function (name, label, ok) {
        return '<div class="hit-perm"><span>' + name + '</span><span class="' +
          (ok ? "hit-perm-on" : "hit-perm-off") + '">' + label + "</span></div>";
      };
      var practiceRow;
      if (acc && acc.staff) {
        practiceRow = row("Kho đề thi", "Đã mở quyền truy cập", true);
      } else if (acc && acc.failed) {
        practiceRow = row("Kho đề thi", "Không tra cứu được", false);
      } else {
        var p = acc || { on: false, reason: "none" };
        var label = "Chưa mở quyền truy cập";
        if (p.on) label = p.expireAt ? fmtWhen(p.expireAt) + " – hết hạn" : "Đã mở quyền truy cập";
        else if (p.reason === "expired") label = "Đã hết hạn";
        else if (p.reason === "scheduled") label = fmtWhen(p.startAt) + " – bắt đầu";
        else if (p.reason === "off") label = "Đã ngừng sử dụng";
        practiceRow = row("Kho đề thi", label, !!p.on);
      }
      return practiceRow + row("Kho bài miễn phí", "Đã mở quyền truy cập", true);
    }
    function draw() {
      var u = A && A.user ? A.user() : {};
      var name = u.displayName || u.phone || "Học viên";
      var teacher = u.role === "teacher";
      var s = stats();
      var perms = permHTML();
      var rows = s.recs.length ? s.recs.map(function (r) {
        var when = r.at ? dayKey(r.at) : "—";
        var setLabel = /^\d+$/.test(r.set) ? "Bộ " + r.set : "Kho bài miễn phí";
        return "<tr><td>" + when + "</td><td>" + r.skill + "</td><td>" + setLabel + '</td><td class="hit-score">' + r.pct + "</td></tr>";
      }).join("") : '<tr><td colspan="4">Chưa có lượt làm bài nào.</td></tr>';
      var nameBlock = teacher
        ? '<div class="hit-profile-name">' + esc(name) + "</div>"
        : '<form class="hit-name-form" id="hit-name-form">' +
          '<input id="hit-display-name" maxlength="20" value="' + esc(u.displayName || "") +
          '" placeholder="Tên người dùng" aria-label="Tên người dùng" autocomplete="nickname">' +
          '<button type="submit" class="hit-save">Lưu</button></form>';
      host.innerHTML =
        '<div class="hit-profile">' +
          '<div class="hit-profile-card">' +
            '<label class="hit-avatar-edit">' + avatarBox(u, "is-lg") +
            '<input type="file" id="hit-avatar-file" class="hit-file-input" accept="image/jpeg,image/png,image/webp">' +
            '<span class="hit-avatar-hint">Đổi ảnh đại diện</span></label>' +
            nameBlock +
            '<p class="hit-profile-msg" id="hit-profile-msg" role="status" aria-live="polite"></p>' +
            '<div class="hit-profile-role">Tài khoản luyện tập</div>' +
            '<div class="hit-perm-list">' + perms + "</div>" +
            '<div class="hit-profile-links">' +
              '<a href="soon.html?p=wordbook">Sổ từ mới</a>' +
              '<a href="soon.html?p=history">Lịch sử luyện tập</a>' +
            "</div>" +
          "</div>" +
          "<div>" +
            '<div class="hit-stat-grid">' +
              "<div class=\"hit-stat\"><strong>" + s.n + "</strong><span>Số bài đã làm</span></div>" +
              "<div class=\"hit-stat\"><strong>" + s.avg + "</strong><span>Tỷ lệ đúng trung bình</span></div>" +
              "<div class=\"hit-stat\"><strong>—</strong><span>Lượt thi thử còn lại</span></div>" +
              "<div class=\"hit-stat\"><strong>" + s.streak + "</strong><span>Số ngày liên tiếp</span></div>" +
            "</div>" +
            '<div class="hit-profile-card">' +
              "<h3>Bài luyện gần đây</h3>" +
              '<table class="hit-table"><thead><tr><th>Ngày</th><th>Kỹ năng</th><th>Bộ đề</th><th>Kết quả</th></tr></thead><tbody>' +
              rows + "</tbody></table></div>" +
          "</div>" +
        "</div>";
      bindProfile(host);
    }
    function msg(text, ok) {
      var el = document.getElementById("hit-profile-msg");
      if (!el) return;
      el.textContent = text || "";
      el.className = "hit-profile-msg" + (text ? (ok ? " is-ok" : " is-err") : "");
    }
    function bindProfile() {
      var file = document.getElementById("hit-avatar-file");
      if (file) file.onchange = function () {
        var f = this.files && this.files[0];
        this.value = "";
        if (!f || !A || !A.uploadAvatar) return;
        msg("Đang tải lên…");
        A.uploadAvatar(f).then(function () {
          draw();
          refreshChrome();
          msg("Đã cập nhật ảnh đại diện", true);
        }).catch(function (e) { msg(e.message || "Không tải lên được"); });
      };
      var form = document.getElementById("hit-name-form");
      if (form) form.onsubmit = function (ev) {
        ev.preventDefault();
        var name = (document.getElementById("hit-display-name") || {}).value || "";
        name = String(name).trim();
        msg("");
        A.api("/api/auth/profile", { method: "PATCH", body: { displayName: name } })
          .then(function (d) {
            var u = d.user || {};
            A.setUser({ displayName: u.displayName || name, avatarUrl: u.avatarUrl || A.user().avatarUrl || "" });
            draw();
            refreshChrome();
            msg("Đã lưu tên người dùng", true);
          })
          .catch(function (e) { msg(e.message || "Không lưu được"); });
      };
    }
    draw();
    if (A && A.api) {
      A.api("/api/toefl/access").then(function (d) {
        var ac = d && d.access;
        acc = ac && ac.staff ? { staff: true } : ((ac && ac.practice) || null);
        draw();
      }).catch(function () {
        acc = { failed: true };
        draw();
      });
      A.api("/api/auth/me").then(function (d) {
        var u = d.user || {};
        A.setUser({
          displayName: u.displayName || u.name || "",
          avatarUrl: u.avatarUrl || "",
          role: u.role || ""
        });
        draw();
        refreshChrome();
      }).catch(function () {});
    }
  }

  function paintHome(host) {
    var A = w.YYSD_APP;
    var u = A && A.user ? A.user() : {};
    var name = u.displayName || u.phone || "";
    var s = stats();
    host.innerHTML =
      '<section class="hit-hero" aria-labelledby="home-heading"><div>' +
        '<p class="hit-greeting">Chào mừng bạn trở lại' + (name ? ", " + esc(name) : "") + '</p>' +
        '<h1 id="home-heading">Luyện từng bài.<br><span>Vững từng kỹ năng.</span></h1>' +
        '<p class="hit-lead">Làm trọn một đề thi thử hoặc bắt đầu với một dạng câu hỏi.</p></div>' +
        '<aside class="hit-overview"><div class="hit-minor-heading"><h2>Tiến độ học của bạn</h2><span>Lịch sử trên thiết bị</span></div>' +
        '<dl class="hit-hero-stats"><div><dt>Bài luyện đã xong</dt><dd>' + s.n + '<small> bài</small></dd></div>' +
        '<div><dt>Tỷ lệ đúng trung bình</dt><dd>' + s.avg + '</dd></div>' +
        '<div><dt>Chuỗi ngày học</dt><dd>' + s.streak + '<small> ngày</small></dd></div></dl>' +
        '<a class="hit-resume" href="profile.html"><span><small>Mỗi lượt luyện đều được ghi lại</small><strong>Xem tiến độ của bạn</strong></span><span>Lịch sử học tập ↗</span></a></aside></section>' +
      '<section class="hit-study-modes" aria-label="Chọn cách luyện">' +
        '<article class="hit-home-mock"><div><p class="hit-mode-label">Full-length practice</p><h2>Thi thử trọn bộ</h2>' +
        '<p>Đọc, Nghe, Viết và Nói. Làm đủ bốn kỹ năng để tập phân bổ thời gian.</p>' +
        '<a class="hit-go" href="official.html">Vào khu thi thử <span aria-hidden="true">↗</span></a></div>' +
        '<div class="hit-mode-number">15<span> bộ đề thi thử</span></div></article>' +
        '<a class="hit-home-practice" href="free.html"><div><p class="hit-mode-label">Focused practice</p><h2>Luyện theo dạng bài</h2>' +
        '<p>Chọn từng kỹ năng và dạng bài để tập trung vào phần còn yếu.</p></div><span class="hit-mode-bottom">Vào kho bài <span aria-hidden="true">↗</span></span></a></section>' +
      '<section class="hit-home-subjects"><div class="hit-section-heading"><h2>Bắt đầu với một kỹ năng</h2><span>Luyện riêng từng dạng bài</span></div>' +
        '<div class="hit-subject-strip">' + SUBJECTS.map(function (subject) {
          return '<a href="free.html?skill=' + subject.skill + '"><span>' + subject.zh + '<span aria-hidden="true">↗</span></span><h3 lang="en">' +
            subject.skill.charAt(0).toUpperCase() + subject.skill.slice(1) + '</h3><p>' + subject.chips.join(" / ") + '</p></a>';
        }).join("") + '</div></section>' +
      '<section class="hit-recent"><div class="hit-section-heading"><h2>Bài luyện gần đây</h2><a href="profile.html">Xem lịch sử ↗</a></div>' +
        (s.recs.length ? s.recs.slice(0, 3).map(function (r) {
          return '<a class="hit-recent-row" href="profile.html"><span>' + esc(r.skill) + '</span><strong>' +
            (/^\d+$/.test(r.set) ? 'Bộ ' + esc(r.set) : 'Kho bài miễn phí') + '</strong><span>' +
            (r.at ? esc(dayKey(r.at)) : '—') + '</span><span>' + esc(r.pct) + '</span><span aria-hidden="true">↗</span></a>';
        }).join("") : '<div class="hit-empty"><b>Bắt đầu nhóm bài đầu tiên</b><p>Sau khi bạn làm xong bài đầu tiên, lịch sử học sẽ xuất hiện ở đây.</p></div>') + '</section>';
  }

  w.YYSD_HIT = {
    searchKey: searchKey,
    mount: mount,
    doneMap: doneMap,
    isDone: isDone,
    markDone: markDone,
    paintPractice: paintPractice,
    paintProfile: paintProfile,
    paintHome: paintHome
  };
})(window);
