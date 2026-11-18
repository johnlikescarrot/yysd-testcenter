/* HIT hub shell — đỉnh hàng rào/Trang chủ/cá nhânđầu + Đề thi thậtngân hàng câu hỏi cho người ra đề hoặc học sinh chuẩn bị thimột loại bỏdanh sách */
(function (w) {
  "use strict";
  var LINKS = [
    { href: "home.html", key: "home", zh: "Trang chủ" },
    { href: "practice.html", key: "practice", zh: "Đề thi thậtngân hàng câu hỏi cho người ra đề hoặc học sinh chuẩn bị thi" },
    { href: "mock.html", key: "mock", zh: "đánh trướcthể thao chạy nước rúthọ" },
    { href: "profile.html", key: "profile", zh: "cá nhân" }
  ];
  var SUBJECTS = [
    { skill: "reading", zh: "Đọc", chips: ["Từ vựngĐiền khuyết", "Hàng ngàyĐọc", "Học thuậtbài viết"] },
    { skill: "listening", zh: "Nghe", chips: ["Nghe câu, chọn đáp án", "nói chuyện với ai đó", "một khóa bài giảng"] },
    { skill: "speaking", zh: "Nói", chips: ["Nghelặp lại lời của chính mình hoặc của người khác", "Mô phỏngđược phỏng vấn với tư cách ứng viên"] },
    { skill: "writing", zh: "Viết", chips: ["Xây dựng câu", "thư từ", "Thảo luận học thuật"] }
  ];
  var SKILL_ZH = { reading: "Đọc", listening: "Nghe", speaking: "Nói", writing: "Viết" };

  function parse(raw, fallback) {
    try { return JSON.parse(raw); } catch (e) { return fallback; }
  }
  // Tiến độtích trữchỉ cóbộ:assets/js/toefl-lab.js  yysd:toefl-item-state
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
      '<a class="hit-brand" href="home.html"><span class="hit-logo-mark" aria-hidden="true">xuất sắc</span>' +
      '<span>YYSD<small>TOEFL họchệ thống</small></span></a>' +
      '<nav class="hit-pills" aria-label="dẫn dắtthuyền">' + pills + "</nav>" +
      '<div class="hit-user">' + avatarBox({ displayName: name, phone: u.phone, avatarUrl: u.avatarUrl }, "") +
      '<span class="hit-who" id="hit-who">' + esc(name) + "</span>" +
      '<button type="button" class="hit-out" id="hit-reload">Làm mới</button>' +
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
    document.body.insertAdjacentHTML("afterbegin", '<a class="hit-skip" href="#hit-content">nhảy đếnchínhNội dung</a>' + navHTML(active));
    var main = document.querySelector("main");
    if (main) {
      if (!main.id) main.id = "hit-content";
      main.tabIndex = -1;
      document.querySelector(".hit-skip").href = "#" + main.id;
      document.querySelector(".hit-skip").onclick = function (ev) { ev.preventDefault(); main.focus(); };
    }
    document.body.insertAdjacentHTML("beforeend", '<footer class="hit-footer"><span>YYSD · Trung tâm Khóa học Quốc tế</span><span>TOEFL họchệ thống</span></footer>');
    var out = document.getElementById("hit-out");
    if (out) out.onclick = function () { A.logout(); location.replace("login.html"); };
    var reload = document.getElementById("hit-reload");
    if (reload) reload.onclick = hardReload;
    return true;
  }

  /* ---------- Đề thi thậtngân hàng câu hỏi cho người ra đề hoặc học sinh chuẩn bị thi:môn học tab + họ khuôn segmented + Đề bàidanh sách,một loại bỏcuối cùng ----------
     định dạngbáo chíbiến thể của hanginthere:idx quyết định làm gì đósố thứ tựphong cách viết phong cách văn học,cells quyết định làm gì đóhàng loại họ gầm hình vuông,phần còn lạiđi dừng;họThụy Sĩviết tắt của tỉnh Hắc Long Giang họ,góc bo tròn 0. */
  var LIB = {
    reading: [
      { type: "complete_words", en: "Complete the Words", zh: "Từ vựngĐiền khuyết", idx: "set" },
      { type: "daily_life", en: "Read in Daily Life", zh: "Đời sốngĐọc", idx: "set", count: 1 },
      { type: "academic", en: "Academic Passage", head: "Read an Academic Passage", zh: "Học thuậtbài viết", idx: "set" }
    ],
    listening: [
      { type: "choose_response", en: "Choose a Response", head: "Listen and Choose a Response", zh: "Nghe câu, chọn đáp án", idx: "set", prog: 1 },
      { type: "conversation", en: "Conversation", zh: "nói chuyện với ai đó", idx: "set", prog: 1 },
      { type: "announcement", en: "Announcement", zh: "thông báo", idx: "set", prog: 1 },
      { type: "lecture", en: "Academic Talk", zh: "Bài giảng học thuật", idx: "set" }
    ],
    speaking: [
      { type: "repeat", en: "Listen and Repeat", zh: "Nghe và lặp lại", idx: "hash", sub: 1 },
      { type: "interview", en: "Take an Interview", zh: "Hỏi đáp phỏng vấn", idx: "hash", sub: 1 }
    ],
    writing: [
      { type: "sentence", en: "Build a Sentence", zh: "Xây dựng câu", idx: "set" },
      { type: "email", en: "Write an Email", zh: "Viết email", idx: "pad", sub: 1 },
      { type: "discussion", en: "Academic Discussion", zh: "Thảo luận học thuật", idx: "pad", sub: 1 }
    ]
  };
  var LIB_SKILLS = ["reading", "listening", "speaking", "writing"];
  var LIB_FILTERS = [{ key: "all", zh: "Tất cả" }, { key: "todo", zh: "chưa làm" }, { key: "hot", zh: "Tần suất cao" }];
  var LIB_HEAD = {
    reading: { kicker: "TOEFL READING LAB", zh: "ĐọcLuyện tập", lead: "trướccâu hỏi trắc nghiệmkhuôn,lạinhấnhọ gầmđi vàoLuyện tập." },
    listening: { kicker: "TOEFL LISTENING LAB", zh: "NgheLuyện tập", lead: "trướccâu hỏi trắc nghiệmkhuôn,lạinhấnĐề bàiđi vàoLuyện tập." },
    speaking: { kicker: "TOEFL SPEAKING LAB", zh: "NóiLuyện tập", lead: "trướccâu hỏi trắc nghiệmkhuôn,lạinhấnĐề bàiđi vàoLuyện tập." },
    writing: { kicker: "TOEFL WRITING LAB", zh: "ViếtLuyện tập", lead: "nhấn họ khuônLuyện tậpĐề thi thật,bản thảocó thểtự độngLưutồn tại hình thức kết hợp gốc họ." }
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
  // đầu tiêndanh sáchchỉGiải thíchmột lần từ đầu đến cuốibiểu đồ tiến độ
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
    return st.cls === "done" ? "Đã hoàn thành" : (st.cls === "mid" ? "Đang thực hiện " + st.done + "/" + st.total : "Chưa bắt đầu");
  }
  function hotChip(g) {
    if (!g.hot) return "";
    var tier = g.hot > 1 ? ["🔥🔥", "vượt quáTần suất caohọ"] : ["🔥", "Tần suất caohọ"];
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
  // họ gầm hình vuông chỉ tiến lên đại từ nàycùng nhau.mộttoàn bộ bộ sưu tập(task..end)hình thức kết hợp yêu cầumột mìnhlối vào,nếu không thì Windows học cùng trườngchỉ có thểmột họ một họ điểm.
  function setStartHTML(skill, g) {
    if (!(Number(g.end) > Number(g.task))) return "";
    return '<a class="hit-lib-start" href="' + itemHref(skill, g.paperId, g.task, g.end) + '">Bắt đầulàm họ</a>';
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
      '<div class="hit-lib-foot">' + (meta.prog ? "Hoàn thành " + st.done + "/" + st.total : stateLabel(st)) + "</div>" +
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
    return '<div class="hit-filter" role="group" aria-label="Đề bàiLọc">' + filters.map(function (f) {
      return '<button type="button" data-filter="' + f.key + '"' +
        (libView.filter === f.key ? ' class="is-on" aria-pressed="true"' : ' aria-pressed="false"') + ">" + f.zh + "</button>";
    }).join("") + "</div>";
  }
  function panelHTML(skill, meta, groups, records) {
    var keep = libKept(skill, groups, records);
    var body = keep.length ? libBody(skill, meta, keep, records) :
      '<div class="hit-empty"><b>đại từ nàyLọcxuốngkhông cóĐề bài</b><p>cắt xoay vòng«Tất cả»xem quaKháchọ.</p></div>';
    return '<div class="hit-lib-panelhead"><h2 lang="en">' + esc(meta.head || meta.en) + "</h2>" + filterHTML(groups) + "</div>" + body;
  }
  // Tìm kiếmbước qua nênmôn họcTất cảhọ khuôn:Đề bàitên chỉnhớsốngTiếng Trungcó thểTiếng Anh,không nêntrước biến thể củangười dùngđoán họ khuôn
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
    var body = total ? parts.join("") :
      '<div class="hit-empty"><b>ngân hàng câu hỏi cho người ra đề hoặc học sinh chuẩn bị thibiến thể củakhông có«' + esc(query.trim()) + '»</b><p>trao đổi dùng trongtừ khóa,có thểdọn dẹpTìm kiếmkhung ví dụ: khung cửaxem lướtTất cảĐề bài.</p>' +
      '<button type="button" class="hit-go" data-clear>dọn dẹpTìm kiếm</button></div>';
    return '<div class="hit-lib-panelhead"><h2>Tìm kiếm«' + esc(query.trim()) + '»<span class="hit-lib-count">bắn trúng mục tiêu ' +
      total + " họ</span></h2>" + filterHTML(libCatalog[skill] || []) + "</div>" + body;
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
    panel.setAttribute("aria-label", searching ? "Tìm kiếmKết quả" : meta.zh);
    if (!libCatalog[skill]) {
      panel.innerHTML = '<p class="hit-lib-note">đang ở thời điểm đótải vàongân hàng câu hỏi cho người ra đề hoặc học sinh chuẩn bị thimục lục…</p>';
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
    host.querySelector(".hit-lib-extra").innerHTML = '<h2 class="hit-minor-heading">Giáo viênhọ cuộn lại</h2><div class="hit-set-list">' +
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
      '<nav class="hit-lib-skills" role="tablist" aria-label="môn học">' + LIB_SKILLS.map(function (s) {
        return '<button type="button" role="tab" data-skill="' + s + '">' + SKILL_ZH[s] +
          '<small lang="en">' + s.toUpperCase() + "</small></button>";
      }).join("") + "</nav>" +
      '<div class="hit-lib-seg" role="tablist" aria-label="họ khuôn">' + segHTML(libView.skill) + "</div>" +
      '<form class="hit-search" role="search"><label>Tìm kiếmĐề bài<input type="search" name="query" autocomplete="off" placeholder="nhập khẩuTiếng Trungcó thểTiếng AnhĐề bàitên của một sự vật"></label></form>' +
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
    return (d.getMonth() + 1) + "mặt trăng" + d.getDate() + "viết tắt của " + p2(d.getHours()) + ":" + p2(d.getMinutes());
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
        practiceRow = row("Đề thi thậtngân hàng câu hỏi cho người ra đề hoặc học sinh chuẩn bị thi", "đãmở đường mới hoặc tuyến đường sắt", true);
      } else if (acc && acc.failed) {
        practiceRow = row("Đề thi thậtngân hàng câu hỏi cho người ra đề hoặc học sinh chuẩn bị thi", "kiểm traThất bại", false);
      } else {
        var p = acc || { on: false, reason: "none" };
        var label = "chưamở đường mới hoặc tuyến đường sắt";
        if (p.on) label = p.expireAt ? fmtWhen(p.expireAt) + " đến hạn khoản vay" : "đãmở đường mới hoặc tuyến đường sắt";
        else if (p.reason === "expired") label = "đãđến hạn khoản vay";
        else if (p.reason === "scheduled") label = fmtWhen(p.startAt) + " mở";
        else if (p.reason === "off") label = "đãngừng sử dụng";
        practiceRow = row("Đề thi thậtngân hàng câu hỏi cho người ra đề hoặc học sinh chuẩn bị thi", label, !!p.on);
      }
      return practiceRow + row("miễn phíngân hàng câu hỏi cho người ra đề hoặc học sinh chuẩn bị thi", "đãmở đường mới hoặc tuyến đường sắt", true);
    }
    function draw() {
      var u = A && A.user ? A.user() : {};
      var name = u.displayName || u.phone || "học cùng trường";
      var teacher = u.role === "teacher";
      var s = stats();
      var perms = permHTML();
      var rows = s.recs.length ? s.recs.map(function (r) {
        var when = r.at ? dayKey(r.at) : "—";
        var setLabel = /^\d+$/.test(r.set) ? " " + r.set + " che đậy" : "miễn phíngân hàng câu hỏi cho người ra đề hoặc học sinh chuẩn bị thi";
        return "<tr><td>" + when + "</td><td>" + r.skill + "</td><td>" + setLabel + '</td><td class="hit-score">' + r.pct + "</td></tr>";
      }).join("") : '<tr><td colspan="4">họkhông cóghi chép.</td></tr>';
      var nameBlock = teacher
        ? '<div class="hit-profile-name">' + esc(name) + "</div>"
        : '<form class="hit-name-form" id="hit-name-form">' +
          '<input id="hit-display-name" maxlength="20" value="' + esc(u.displayName || "") +
          '" placeholder="tên người dùng" aria-label="tên người dùng" autocomplete="nickname">' +
          '<button type="submit" class="hit-save">Lưu</button></form>';
      host.innerHTML =
        '<div class="hit-profile">' +
          '<div class="hit-profile-card">' +
            '<label class="hit-avatar-edit">' + avatarBox(u, "is-lg") +
            '<input type="file" id="hit-avatar-file" class="hit-file-input" accept="image/jpeg,image/png,image/webp">' +
            '<span class="hit-avatar-hint">thay thế lốp xe mònchân dung</span></label>' +
            nameBlock +
            '<p class="hit-profile-msg" id="hit-profile-msg" role="status" aria-live="polite"></p>' +
            '<div class="hit-profile-role">Luyện tậpTài khoản</div>' +
            '<div class="hit-perm-list">' + perms + "</div>" +
            '<div class="hit-profile-links">' +
              '<a href="soon.html?p=wordbook">sổ tay từ vựng</a>' +
              '<a href="soon.html?p=history">Luyện tậpghi chép</a>' +
            "</div>" +
          "</div>" +
          "<div>" +
            '<div class="hit-stat-grid">' +
              "<div class=\"hit-stat\"><strong>" + s.n + "</strong><span>đã làm họ</span></div>" +
              "<div class=\"hit-stat\"><strong>" + s.avg + "</strong><span>trung bìnhTỉ lệ đúng</span></div>" +
              "<div class=\"hit-stat\"><strong>—</strong><span>Còn lạiThi thử</span></div>" +
              "<div class=\"hit-stat\"><strong>" + s.streak + "</strong><span>Liên tiếpsố ngày</span></div>" +
            "</div>" +
            '<div class="hit-profile-card">' +
              "<h3>gần đâyLuyện tập</h3>" +
              '<table class="hit-table"><thead><tr><th>ngày tháng</th><th>môn học</th><th>che đậy cuộn lại</th><th>Kết quả</th></tr></thead><tbody>' +
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
        msg("Tải lênhình thức kết hợp Trung Quốc…");
        A.uploadAvatar(f).then(function () {
          draw();
          refreshChrome();
          msg("chân dungđãthay cũ đổi mới", true);
        }).catch(function (e) { msg(e.message || "Tải lênThất bại"); });
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
            msg("tên người dùngđãLưu", true);
          })
          .catch(function (e) { msg(e.message || "LưuThất bại"); });
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
        '<p class="hit-greeting">chào đóntrở về' + (name ? "," + esc(name) : "") + '</p>' +
        '<h1 id="home-heading">tập trungLuyện tập.<br><span>một cách ổn địnhtiến lên.</span></h1>' +
        '<p class="hit-lead">chọnbộhoàn chỉnhThi thử,có thể biến thể của một dùng trong họ khuônBắt đầu.</p></div>' +
        '<aside class="hit-overview"><div class="hit-minor-heading"><h2>bạnhọctổng quan</h2><span>hình thức kết hợp gốc họhọcghi chép</span></div>' +
        '<dl class="hit-hero-stats"><div><dt>Đã hoàn thànhLuyện tập</dt><dd>' + s.n + '<small>họ</small></dd></div>' +
        '<div><dt>trung bìnhTỉ lệ đúng</dt><dd>' + s.avg + '</dd></div>' +
        '<div><dt>Liên tiếphọc</dt><dd>' + s.streak + '<small>ngày</small></dd></div></dl>' +
        '<a class="hit-resume" href="profile.html"><span><small>mỗi lầnLuyện tập,họ cóghi chép</small><strong>XembạnhọcTiến độ</strong></span><span>họcghi chép ↗</span></a></aside></section>' +
      '<section class="hit-study-modes" aria-label="Chọnhọccách thức">' +
        '<article class="hit-home-mock"><div><p class="hit-mode-label">Full-length practice</p><h2>họ thậtThi thử</h2>' +
        '<p>Đọc,Nghe,Viết,Nói.<br>tồn tạihoàn chỉnhKì thihình thức kết hợp Trung Quốc,tìm thấybản thânnhịp điệu.</p>' +
        '<a class="hit-go" href="official.html">XemThi thửlối vào <span aria-hidden="true">↗</span></a></div>' +
        '<div class="hit-mode-number">15<span>che đậyhoàn chỉnhThi thử</span></div></article>' +
        '<a class="hit-home-practice" href="free.html"><div><p class="hit-mode-label">Focused practice</p><h2>ngân hàng câu hỏi cho người ra đề hoặc học sinh chuẩn bị thiPhân loạiLuyện tập</h2>' +
        '<p>nhấnmôn học,nhấn họ khuôn,<br>cầm mỗi một dùng trongyếuđiểm luyện tậpmạnh mẽ.</p></div><span class="hit-mode-bottom">đi vàongân hàng câu hỏi cho người ra đề hoặc học sinh chuẩn bị thi <span aria-hidden="true">↗</span></span></a></section>' +
      '<section class="hit-home-subjects"><div class="hit-section-heading"><h2>biến thể của một dùng trongmôn họcBắt đầu</h2><span>chuyên biệtLuyện tập,từng cái mộtđột phá</span></div>' +
        '<div class="hit-subject-strip">' + SUBJECTS.map(function (subject) {
          return '<a href="free.html?skill=' + subject.skill + '"><span>' + subject.zh + '<span aria-hidden="true">↗</span></span><h3 lang="en">' +
            subject.skill.charAt(0).toUpperCase() + subject.skill.slice(1) + '</h3><p>' + subject.chips.join(" / ") + '</p></a>';
        }).join("") + '</div></section>' +
      '<section class="hit-recent"><div class="hit-section-heading"><h2>gần đâyLuyện tập</h2><a href="profile.html">Xemghi chép ↗</a></div>' +
        (s.recs.length ? s.recs.slice(0, 3).map(function (r) {
          return '<a class="hit-recent-row" href="profile.html"><span>' + esc(r.skill) + '</span><strong>' +
            (/^\d+$/.test(r.set) ? ' ' + esc(r.set) + ' che đậy' : 'miễn phíngân hàng câu hỏi cho người ra đề hoặc học sinh chuẩn bị thi') + '</strong><span>' +
            (r.at ? esc(dayKey(r.at)) : '—') + '</span><span>' + esc(r.pct) + '</span><span aria-hidden="true">↗</span></a>';
        }).join("") : '<div class="hit-empty"><b>biến thể củađầu tiênhọLuyện tậpBắt đầu</b><p>Hoàn thànhLuyện tậphọ,bạnhọcghi chépcó thểhiển thịtồn tạibiến thể của.</p></div>') + '</section>';
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
