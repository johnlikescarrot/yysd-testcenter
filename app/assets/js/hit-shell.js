/* HIT hub shell — thanh điều hướng / Trang chủ / cá nhân trang + đề thi thật Ngân hàng đề một bình liệt biểu List */
(function (w) {
  "use strict";
  var LINKS = [
    { href: "home.html", key: "home", zh: "Trang chủ" },
    { href: "practice.html", key: "practice", zh: " đề thi thật Ngân hàng đề " },
    { href: "mock.html", key: "mock", zh: " Gói tăng tốc trước kỳ thi " },
    { href: "profile.html", key: "profile", zh: " cá nhân " }
  ];
  var SUBJECTS = [
    { skill: "reading", zh: "Đọc", chips: [" Từ vựng lấp chỗ trống ", " Đời sống Đọc ", " Học thuật văn chương "] },
    { skill: "listening", zh: "Nghe", chips: [" nghe câu chọn đáp lại ", " đối thoại ", " toạ đàm "] },
    { skill: "speaking", zh: "Nói", chips: [" Nghe thuật lại ", " mô phỏng phỏng vấn "] },
    { skill: "writing", zh: "Viết", chips: [" câu xây dựng ", " Email ", " Thảo luận học thuật "] }
  ];
  var SKILL_ZH = { reading: "Đọc", listening: "Nghe", speaking: "Nói", writing: "Viết" };

  function parse(raw, fallback) {
    try { return JSON.parse(raw); } catch (e) { return fallback; }
  }
  // Tiến độ tồn trữ chỉ có một bộ: assets/js/toefl-lab.js yysd:toefl-item-state
  function L() { return w.YYSD_TOEFL_LAB; }
  function doneMap() { return L().state(); }
  function lookup(skill, task, set, records) {
    return (records || doneMap())[L().canon(skill, set, task)] || null;
  }
  function isDone(skill, task, set, records) { return!!lookup(skill, task, set, records); }
  function markDone(skill, task, rec) { L().markState(skill, rec && rec.set, task, rec); }

  function initial(name) {
    var s = String(name || "").trim();
    return s? s.charAt(0): "U";
  }

  function esc(s) {
    return String(s == null? "": s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function avatarBox(u, cls) {
    var A = w.YYSD_APP;
    var src = A && A.avatarSrc? A.avatarSrc(u.avatarUrl): "";
    var name = u.displayName || u.phone || "";
    if (src) {
      return '<span class="hit-avatar' + (cls? " " + cls: "") + ' has-img"><img src="' +
        esc(src) + '" alt=""></span>';
    }
    return '<span class="hit-avatar' + (cls? " " + cls: "") + '" aria-hidden="true">' +
      esc(initial(name)) + "</span>";
  }

  function refreshChrome() {
    var A = w.YYSD_APP;
    var u = A && A.user? A.user(): {};
    var who = document.getElementById("hit-who");
    if (who) who.textContent = u.displayName || u.phone || "";
    var av = document.querySelector(".hit-top.hit-avatar");
    if (!av) return;
    var wrap = document.createElement("div");
    wrap.innerHTML = avatarBox(u, "");
    av.replaceWith(wrap.firstChild);
  }

  function navHTML(active) {
    var A = w.YYSD_APP;
    var u = A && A.user? A.user(): {};
    var name = u.displayName || u.phone || "";
    var labOn = /^(reading|listening|speaking|writing)$/.test(active);
    var pills = LINKS.map(function (l) {
      var on = l.key === active || (l.key === "practice" && labOn);
      return '<a href="' + l.href + '" class="hit-tab' + (on? " is-on": "") + '"' + (on? ' aria-current="page"': '') + '><b>' +
        l.zh + "</b></a>";
    }).join("");
    return '<header class="hit-top">' +
      '<a class="hit-brand" href="home.html"><span class="hit-logo-mark" aria-hidden="true"> ưu </span>' +
      '<span> YYSD <small>TOEFL Học tập hệ thống </small></span></a>' +
      '<nav class="hit-pills" aria-label=" Điều hướng chính ">' + pills + "</nav>" +
      '<div class="hit-user">' + avatarBox({ displayName: name, phone: u.phone, avatarUrl: u.avatarUrl }, "") +
      '<span class="hit-who" id="hit-who">' + esc(name) + "</span>" +
      '<button type="button" class="hit-out" id="hit-reload"> Làm mới </button>' +
      '<button type="button" class="hit-out" id="hit-out"> Đăng xuất </button></div></header>';
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
    if (A &&!A.requireLogin(location.pathname.split("/").pop() + location.search)) return false;
    document.body.insertAdjacentHTML("afterbegin", '<a class="hit-skip" href="#hit-content"> nhảy đến nội dung chủ yếu </a>' + navHTML(active));
    var main = document.querySelector("main");
    if (main) {
      if (!main.id) main.id = "hit-content";
      main.tabIndex = -1;
      document.querySelector(".hit-skip").href = "#" + main.id;
      document.querySelector(".hit-skip").onclick = function (ev) { ev.preventDefault(); main.focus(); };
    }
    document.body.insertAdjacentHTML("beforeend", '<footer class="hit-footer"><span> Trung tâm Luyện thi Quốc tế YYSD </span><span>TOEFL Học tập hệ thống </span></footer>');
    var out = document.getElementById("hit-out");
    if (out) out.onclick = function () { A.logout(); location.replace("login.html"); };
    var reload = document.getElementById("hit-reload");
    if (reload) reload.onclick = hardReload;
    return true;
  }

  /* ---------- đề thi thật Ngân hàng đề: kỹ năng tab + dạng bài segmented + đề mục liệt biểu List, một bình đến cùng ----------
      ma-két trang in và văn án theo hanginthere: idx quyết định tự số phương pháp sáng tác, cells quyết định đi thức câu số cách, còn lại đi ki-lô ca-lo; làn da Thụy Sĩ đỏ thẫm, tròn giác 0. */
  var LIB = {
    reading: [
      { type: "complete_words", en: "Complete the Words", zh: " Từ vựng lấp chỗ trống ", idx: "set" },
      { type: "daily_life", en: "Read in Daily Life", zh: " sinh hoạt Đọc ", idx: "set", count: 1 },
      { type: "academic", en: "Academic Passage", head: "Read an Academic Passage", zh: " Học thuật văn chương ", idx: "set" }
    ],
    listening: [
      { type: "choose_response", en: "Choose a Response", head: "Listen and Choose a Response", zh: " nghe câu chọn đáp lại ", idx: "set", prog: 1 },
      { type: "conversation", en: "Conversation", zh: " đối thoại ", idx: "set", prog: 1 },
      { type: "announcement", en: "Announcement", zh: " thông tri ", idx: "set", prog: 1 },
      { type: "lecture", en: "Academic Talk", zh: " Học thuật toạ đàm ", idx: "set" }
    ],
    speaking: [
      { type: "repeat", en: "Listen and Repeat", zh: " nghe xong Đọc nhại ", idx: "hash", sub: 1 },
      { type: "interview", en: "Take an Interview", zh: " phỏng vấn vấn đáp ", idx: "hash", sub: 1 }
    ],
    writing: [
      { type: "sentence", en: "Build a Sentence", zh: " câu xây dựng ", idx: "set" },
      { type: "email", en: "Write an Email", zh: " Email Viết ", idx: "pad", sub: 1 },
      { type: "discussion", en: "Academic Discussion", zh: " Thảo luận học thuật ", idx: "pad", sub: 1 }
    ]
  };
  var LIB_SKILLS = ["reading", "listening", "speaking", "writing"];
  var LIB_FILTERS = [{ key: "all", zh: "Tất cả" }, { key: "todo", zh: " không làm " }, { key: "hot", zh: " Tần suất cao " }];
  var LIB_HEAD = {
    reading: { kicker: "TOEFL READING LAB", zh: " Đọc Luyện tập ", lead: " trước Trắc nghiệm hình, gọi thêm kích câu số Vào học Luyện tập. " },
    listening: { kicker: "TOEFL LISTENING LAB", zh: " Nghe Luyện tập ", lead: " trước Trắc nghiệm hình, gọi thêm kích đề mục Vào học Luyện tập. " },
    speaking: { kicker: "TOEFL SPEAKING LAB", zh: " Luyện kỹ năng Nói ", lead: " trước Trắc nghiệm hình, gọi thêm kích đề mục Vào học Luyện tập. " },
    writing: { kicker: "TOEFL WRITING LAB", zh: " Viết Luyện tập ", lead: " theo như dạng bài Luyện tập đề thi thật, bản nháp sẽ tự động Lưu tại thiết bị này. " }
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
      (end > task? "&taskEnd=" + encodeURIComponent(end): "");
  }
  // một lần liệt biểu List chỉ Giải thích đáp án một lần Tiến độ bề ngoài
  function doneInSpan(skill, paperId, from, to, records) {
    var d = records || doneMap();
    var n = 0;
    for (var i = from; i <= to; i++) if (d[L().canon(skill, paperId, i)]) n++;
    return n;
  }
  function libStateOf(skill, g, records) {
    var total = g.end - g.task + 1;
    var done = doneInSpan(skill, g.paperId, g.task, g.end, records);
    return { total: total, done: done, cls: done >= total? "done": (done? "mid": "todo") };
  }
  function stateLabel(st) {
    return st.cls === "done"? "Đã hoàn thành": (st.cls === "mid"? " đang tiến hành " + st.done + "/" + st.total: " Chưa bắt đầu ");
  }
  function hotChip(g) {
    if (!g.hot) return "";
    var tier = g.hot > 1? ["🔥🔥", " siêu cao tần câu "]: ["🔥", " Tần suất cao câu "];
    return '<span class="hit-lib-hot" role="img" title="' + tier[1] + '">' + tier[0] + "</span>";
  }
  function idxLabel(meta, g, i) {
    var n = g.sort || i + 1;
    if (meta.idx === "hash") return "#" + n;
    if (meta.idx === "pad") return (n < 10? "0": "") + n;
    return "Set " + n;
  }
  function cardHTML(skill, meta, g, i, records) {
    var st = libStateOf(skill, g, records);
    return '<a class="hit-lib-card is-' + st.cls + '" href="' + itemHref(skill, g.paperId, g.task, g.end) + '">' +
      '<div class="hit-lib-meta"><span class="hit-lib-idx">' + idxLabel(meta, g, i) + "</span>" +
      (meta.count? '<span class="hit-lib-n" lang="en">' + g.n + " question" + (g.n > 1? "s": "") + "</span>": "") + hotChip(g) + "</div>" +
      '<h3 class="hit-lib-title" lang="en">' + esc(g.title || meta.en) + "</h3>" +
      (meta.sub? '<p class="hit-lib-sub">' + esc(g.zh || meta.zh) + "</p>": "") +
      '<div class="hit-lib-foot">' + stateLabel(st) + "</div></a>";
  }
  // câu số cách chỉ có tiến đạo này. trọn vẹn (task..end) muốn đơn độc cửa vào, nếu không Windows đồng học chỉ có thể một câu một câu chút:điểm.
  function setStartHTML(skill, g) {
    if (!(Number(g.end) > Number(g.task))) return "";
    return '<a class="hit-lib-start" href="' + itemHref(skill, g.paperId, g.task, g.end) + '"> Bắt đầu làm bài </a>';
  }
  function rowHTML(skill, meta, g, i, records) {
    var cells = g.cells || [];
    var d = records || doneMap();
    var done = 0;
    var nums = cells.map(function (c) {
      var on =!!d[L().canon(skill, g.paperId, c.task)];
      if (on) done++;
      return '<a class="hit-lib-num' + (on? " is-done": "") + '" href="' +
        itemHref(skill, g.paperId, c.task, c.end) + '" title="' + esc(c.label) + '">' + esc(c.label) + "</a>";
    }).join("");
    var st = libStateOf(skill, g, records);
    return '<div class="hit-lib-row is-' + st.cls + '">' +
      '<div class="hit-lib-meta"><span class="hit-lib-idx">' + idxLabel(meta, g, i) + "</span>" + hotChip(g) +
      setStartHTML(skill, g) + "</div>" +
      '<div class="hit-lib-foot">' + (meta.prog? " hoàn thành " + st.done + "/" + st.total: stateLabel(st)) + "</div>" +
      '<div class="hit-lib-nums">' + nums + "</div></div>";
  }
  function libKept(skill, groups, records, hit) {
    var keep = [];
    groups.forEach(function (g, i) {
      if (hit &&!hit(g)) return;
      if (libView.filter === "todo" && libStateOf(skill, g, records).cls === "done") return;
      if (libView.filter === "hot" &&!g.hot) return;
      keep.push({ g: g, i: i });
    });
    return keep;
  }
  function libBody(skill, meta, keep, records) {
    var rows = keep.some(function (x) { return x.g.cells; });
    return '<div class="' + (rows? "hit-lib-rows": "hit-lib-grid") + '">' + keep.map(function (x) {
      return (rows? rowHTML: cardHTML)(skill, meta, x.g, x.i, records);
    }).join("") + "</div>";
  }
  function filterHTML(groups) {
    var filters = LIB_FILTERS.filter(function (f) {
      return f.key!== "hot" || groups.some(function (g) { return g.hot; });
    });
    return '<div class="hit-filter" role="group" aria-label=" đề mục bộ lọc ">' + filters.map(function (f) {
      return '<button type="button" data-filter="' + f.key + '"' +
        (libView.filter === f.key? ' class="is-on" aria-pressed="true"': ' aria-pressed="false"') + ">" + f.zh + "</button>";
    }).join("") + "</div>";
  }
  function panelHTML(skill, meta, groups, records) {
    var keep = libKept(skill, groups, records);
    var body = keep.length? libBody(skill, meta, keep, records):
      '<div class="hit-empty"><b> này bộ lọc hạ không có đề mục </b><p> cắt quay về « Tất cả » nhìn xem Khác câu. </p></div>';
    return '<div class="hit-lib-panelhead"><h2 lang="en">' + esc(meta.head || meta.en) + "</h2>" + filterHTML(groups) + "</div>" + body;
  }
  // tìm kiếm vượt qua nên kỹ năng Tất cả dạng bài: đề mục tên chỉ nhớ rõ ở Tiếng Việt hoặc Tiếng Anh, không nên trước bức người sử dụng đoán dạng bài
  function libSearchHTML(skill, query, records) {
    var t = query.trim().toLocaleLowerCase();
    var parts = [];
    var total = 0;
    (LIB[skill] || []).forEach(function (meta) {
      var keep = libKept(skill, libGroups(skill, meta.type), records, function (g) {
        return [g.title, g.zh, g.code].join(" ").toLocaleLowerCase().indexOf(t) >= 0;
      });
      if (!keep.length) return;
      total += keep.length;
      parts.push('<h2 class="hit-lib-searchtype">' + esc(meta.zh) + '<span lang="en">' + esc(meta.en) + "</span></h2>" +
        libBody(skill, meta, keep, records));
    });
    var body = total? parts.join(""):
      '<div class="hit-empty"><b> Ngân hàng đề dặm không có «' + esc(query.trim()) + '»</b><p> đổi lại từ khóa, hoặc Xóa trống tìm kiếm khung xem Tất cả đề mục. </p>' +
      '<button type="button" class="hit-go" data-clear> Xóa trống tìm kiếm </button></div>';
    return '<div class="hit-lib-panelhead"><h2> tìm kiếm «' + esc(query.trim()) + '»<span class="hit-lib-count"> trúng mục tiêu ' +
      total + " tổ </span></h2>" + filterHTML(libCatalog[skill] || []) + "</div>" + body;
  }
  function segHTML(skill) {
    return (LIB[skill] || []).map(function (m, i) {
      return '<button type="button" role="tab" data-type="' + m.type + '">' +
        '<span class="hit-lib-segnum">' + (i < 9? "0": "") + (i + 1) + "</span>" +
        '<span class="hit-lib-segname"><strong lang="en">' + esc(m.en) + "</strong><small>" + esc(m.zh) + "</small></span></button>";
    }).join("");
  }
  function paintLib() {
    if (!libHost) return;
    var skill = libView.skill;
    var types = LIB[skill] || [];
    if (!libView.type ||!types.some(function (m) { return m.type === libView.type; })) libView.type = types[0].type;
    var meta = libMeta(skill, libView.type);
    libHost.querySelectorAll("[data-skill]").forEach(function (b) {
      var on = b.getAttribute("data-skill") === skill;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-selected", String(on));
    });
    libHost.querySelectorAll("[data-type]").forEach(function (b) {
      var on = b.getAttribute("data-type") === libView.type &&!libView.query.trim();
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-selected", String(on));
    });
    var panel = libHost.querySelector(".hit-lib-panel");
    var hc = LIB_HEAD[skill];
    libHost.querySelector(".hit-lib-head").innerHTML = '<p class="hit-kicker">' + hc.kicker + "</p><h1>" +
      hc.zh + '</h1><p class="hit-lead">' + hc.lead + "</p>";
    var searching =!!libView.query.trim();
    panel.setAttribute("aria-label", searching? " kết quả tìm kiếm ": meta.zh);
    if (!libCatalog[skill]) {
      panel.innerHTML = '<p class="hit-lib-note"> đang ghi vào Ngân hàng đề mục lục …</p>';
      return;
    }
    libView.records = doneMap();
    panel.innerHTML = searching? libSearchHTML(skill, libView.query, libView.records):
      panelHTML(skill, meta, libGroups(skill, libView.type), libView.records);
  }
  function loadCatalog(skill) {
    if (libCatalog[skill]) { paintLib(); return Promise.resolve(libCatalog[skill]); }
    return fetch("library/toefl/bank-catalog-" + skill + ".json", { cache: "no-store" })
      .then(function (r) { return r.ok? r.json(): null; })
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
    if (!papers ||!papers.length) return;
    host.querySelector(".hit-lib-extra").innerHTML = '<h2 class="hit-minor-heading"> Giáo viên tổ cuốn </h2><div class="hit-set-list">' +
      papers.map(function (p) {
        return '<a class="hit-set-row" href="bank.html?id=' + encodeURIComponent(p.id) + '"><div class="hit-set-info"><h4>' +
          esc(p.title || p.id) + "</h4><p>" + esc((p.makerName? p.makerName + " · ": "") + "Luyện tập") + "</p></div></a>";
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
      '<nav class="hit-lib-skills" role="tablist" aria-label=" kỹ năng ">' + LIB_SKILLS.map(function (s) {
        return '<button type="button" role="tab" data-skill="' + s + '">' + SKILL_ZH[s] +
          '<small lang="en">' + s.toUpperCase() + "</small></button>";
      }).join("") + "</nav>" +
      '<div class="hit-lib-seg" role="tablist" aria-label=" dạng bài ">' + segHTML(libView.skill) + "</div>" +
      '<form class="hit-search" role="search"><label> tìm kiếm đề mục <input type="search" name="query" autocomplete="off" placeholder=" đưa vào Tiếng Việt hoặc Tiếng Anh đề mục tên "></label></form>' +
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
      if (ev.target.name!== "query") return;
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
        pct: rec.total? Math.round((Number(rec.score) || 0) / rec.total * 100) + "%": (rec.ok === false? "—": "ok")
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
      avg: total? Math.round(score / total * 100) + "%": "—",
      streak: streak,
      recs: recs.slice(0, 6)
    };
  }

  function fmtWhen(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    var p2 = function (n) { return (n < 10? "0": "") + n; };
    return (d.getMonth() + 1) + " tháng " + d.getDate() + " ngày " + p2(d.getHours()) + ":" + p2(d.getMinutes());
  }

  function paintProfile(host) {
    var A = w.YYSD_APP;
    var acc = null;
    function permHTML() {
      var row = function (name, label, ok) {
        return '<div class="hit-perm"><span>' + name + '</span><span class="' +
          (ok? "hit-perm-on": "hit-perm-off") + '">' + label + "</span></div>";
      };
      var practiceRow;
      if (acc && acc.staff) {
        practiceRow = row(" đề thi thật Ngân hàng đề ", " Đã kích hoạt ", true);
      } else if (acc && acc.failed) {
        practiceRow = row(" đề thi thật Ngân hàng đề ", " điều tra thất bại ", false);
      } else {
        var p = acc || { on: false, reason: "none" };
        var label = " không kích hoạt ";
        if (p.on) label = p.expireAt? fmtWhen(p.expireAt) + " đến kỳ ": " Đã kích hoạt ";
        else if (p.reason === "expired") label = " Đã hết hạn ";
        else if (p.reason === "scheduled") label = fmtWhen(p.startAt) + " Mở ";
        else if (p.reason === "off") label = " Đã tạm ngưng ";
        practiceRow = row(" đề thi thật Ngân hàng đề ", label,!!p.on);
      }
      return practiceRow + row(" miễn phí Ngân hàng đề ", " Đã kích hoạt ", true);
    }
    function draw() {
      var u = A && A.user? A.user(): {};
      var name = u.displayName || u.phone || " đồng học ";
      var teacher = u.role === "teacher";
      var s = stats();
      var perms = permHTML();
      var rows = s.recs.length? s.recs.map(function (r) {
        var when = r.at? dayKey(r.at): "—";
        var setLabel = /^\d+$/.test(r.set)? " thứ " + r.set + " bộ ": " miễn phí Ngân hàng đề ";
        return "<tr><td>" + when + "</td><td>" + r.skill + "</td><td>" + setLabel + '</td><td class="hit-score">' + r.pct + "</td></tr>";
      }).join(""): '<tr><td colspan="4"> còn không có ghi chép. </td></tr>';
      var nameBlock = teacher
        ? '<div class="hit-profile-name">' + esc(name) + "</div>"
        : '<form class="hit-name-form" id="hit-name-form">' +
          '<input id="hit-display-name" maxlength="20" value="' + esc(u.displayName || "") +
          '" placeholder=" Tên người dùng " aria-label=" Tên người dùng " autocomplete="nickname">' +
          '<button type="submit" class="hit-save"> Lưu </button></form>';
      host.innerHTML =
        '<div class="hit-profile">' +
          '<div class="hit-profile-card">' +
            '<label class="hit-avatar-edit">' + avatarBox(u, "is-lg") +
            '<input type="file" id="hit-avatar-file" class="hit-file-input" accept="image/jpeg,image/png,image/webp">' +
            '<span class="hit-avatar-hint"> thay đổi ảnh chân dung </span></label>' +
            nameBlock +
            '<p class="hit-profile-msg" id="hit-profile-msg" role="status" aria-live="polite"></p>' +
            '<div class="hit-profile-role"> Luyện tập tài khoản </div>' +
            '<div class="hit-perm-list">' + perms + "</div>" +
            '<div class="hit-profile-links">' +
              '<a href="soon.html?p=wordbook"> Sổ từ đã lưu </a>' +
              '<a href="soon.html?p=history"> Luyện tập ghi chép </a>' +
            "</div>" +
          "</div>" +
          "<div>" +
            '<div class="hit-stat-grid">' +
              "<div class=\"hit-stat\"><strong>" + s.n + "</strong><span> đã làm bài </span></div>" +
              "<div class=\"hit-stat\"><strong>" + s.avg + "</strong><span> Tỷ lệ đúng trung bình </span></div>" +
              "<div class=\"hit-stat\"><strong>—</strong><span> còn thừa Thi thử </span></div>" +
              "<div class=\"hit-stat\"><strong>" + s.streak + "</strong><span> Chuỗi ngày học </span></div>" +
            "</div>" +
            '<div class="hit-profile-card">' +
              "<h3> Luyện tập gần đây </h3>" +
              '<table class="hit-table"><thead><tr><th> ngày </th><th> kỹ năng </th><th> bộ cuốn </th><th> Điểm số </th></tr></thead><tbody>' +
              rows + "</tbody></table></div>" +
          "</div>" +
        "</div>";
      bindProfile(host);
    }
    function msg(text, ok) {
      var el = document.getElementById("hit-profile-msg");
      if (!el) return;
      el.textContent = text || "";
      el.className = "hit-profile-msg" + (text? (ok? " is-ok": " is-err"): "");
    }
    function bindProfile() {
      var file = document.getElementById("hit-avatar-file");
      if (file) file.onchange = function () {
        var f = this.files && this.files[0];
        this.value = "";
        if (!f ||!A ||!A.uploadAvatar) return;
        msg(" thượng truyền(*upload) Vừa …");
        A.uploadAvatar(f).then(function () {
          draw();
          refreshChrome();
          msg(" ảnh chân dung đã đổi mới mới ", true);
        }).catch(function (e) { msg(e.message || " thượng truyền(*upload) thất bại "); });
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
            msg(" Tên người dùng đã Lưu ", true);
          })
          .catch(function (e) { msg(e.message || " Lưu thất bại "); });
      };
    }
    draw();
    if (A && A.api) {
      A.api("/api/toefl/access").then(function (d) {
        var ac = d && d.access;
        acc = ac && ac.staff? { staff: true }: ((ac && ac.practice) || null);
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
    var u = A && A.user? A.user(): {};
    var name = u.displayName || u.phone || "";
    var s = stats();
    host.innerHTML =
      '<section class="hit-hero" aria-labelledby="home-heading"><div>' +
        '<p class="hit-greeting"> hoan nghênh trở về ' + (name? ", " + esc(name): "") + '</p>' +
        '<h1 id="home-heading"> chăm chú Luyện tập. <br><span> Tiến bộ mỗi ngày. </span></h1>' +
        '<p class="hit-lead"> chọn một bộ Thi thử toàn phần, hoặc từ một cái dạng bài Bắt đầu. </p></div>' +
        '<aside class="hit-overview"><div class="hit-minor-heading"><h2> Tổng quan học tập </h2><span> thiết bị này Học tập ghi chép </span></div>' +
        '<dl class="hit-hero-stats"><div><dt> Đã hoàn thành Luyện tập </dt><dd>' + s.n + '<small> câu </small></dd></div>' +
        '<div><dt> Tỷ lệ đúng trung bình </dt><dd>' + s.avg + '</dd></div>' +
        '<div><dt> Học liên tục </dt><dd>' + s.streak + '<small> ngày </small></dd></div></dl>' +
        '<a class="hit-resume" href="profile.html"><span><small> mỗi lần Luyện tập, đều có ghi chép </small><strong> Xem học tập của bạn Tiến độ </strong></span><span> Học tập ghi chép ↗</span></a></aside></section>' +
      '<section class="hit-study-modes" aria-label=" lựa chọn Học tập phương thức ">' +
        '<article class="hit-home-mock"><div><p class="hit-mode-label">Full-length practice</p><h2> Thi thử toàn phần </h2>' +
        '<p> Đọc, Nghe, Viết, Nói. <br> tại Đầy đủ trong cuộc thi, tìm được mình tiết tấu. </p>' +
        '<a class="hit-go" href="official.html"> Xem Thi thử cửa vào <span aria-hidden="true">↗</span></a></div>' +
        '<div class="hit-mode-number">15<span> bộ Thi thử toàn phần </span></div></article>' +
        '<a class="hit-home-practice" href="free.html"><div><p class="hit-mode-label">Focused practice</p><h2> Ngân hàng đề phân loại Luyện tập </h2>' +
        '<p> theo như kỹ năng, theo như dạng bài, <br> đem mỗi một bạc nhược yếu kém chút:điểm luyện vững chắc. </p></div><span class="hit-mode-bottom"> Vào học Ngân hàng đề <span aria-hidden="true">↗</span></span></a></section>' +
      '<section class="hit-home-subjects"><div class="hit-section-heading"><h2> từ một cái kỹ năng Bắt đầu </h2><span> Chuyên sâu Luyện tập, từng cái đột phá </span></div>' +
        '<div class="hit-subject-strip">' + SUBJECTS.map(function (subject) {
          return '<a href="free.html?skill=' + subject.skill + '"><span>' + subject.zh + '<span aria-hidden="true">↗</span></span><h3 lang="en">' +
            subject.skill.charAt(0).toUpperCase() + subject.skill.slice(1) + '</h3><p>' + subject.chips.join(" / ") + '</p></a>';
        }).join("") + '</div></section>' +
      '<section class="hit-recent"><div class="hit-section-heading"><h2> Luyện tập gần đây </h2><a href="profile.html"> Xem ghi chép ↗</a></div>' +
        (s.recs.length? s.recs.slice(0, 3).map(function (r) {
          return '<a class="hit-recent-row" href="profile.html"><span>' + esc(r.skill) + '</span><strong>' +
            (/^\d+$/.test(r.set)? ' thứ ' + esc(r.set) + ' bộ ': ' miễn phí Ngân hàng đề ') + '</strong><span>' +
            (r.at? esc(dayKey(r.at)): '—') + '</span><span>' + esc(r.pct) + '</span><span aria-hidden="true">↗</span></a>';
        }).join(""): '<div class="hit-empty"><b> từ tổ thứ nhất Luyện tập Bắt đầu </b><p> hoàn thành Luyện tập sau, học tập của bạn ghi chép sẽ biểu hiện ở chỗ này. </p></div>') + '</section>';
  }

  w.YYSD_HIT = {
    mount: mount,
    doneMap: doneMap,
    isDone: isDone,
    markDone: markDone,
    paintPractice: paintPractice,
    paintProfile: paintProfile,
    paintHome: paintHome
  };
})(window);
