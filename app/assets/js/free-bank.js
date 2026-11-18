/* ponytail: 免费题库列表 — index.json 驱动，hash 路由 #labelId */
(function (w) {
  "use strict";
  var INDEX = "library/toefl/free/index.json";
  var PAGES = { reading: "reading.html", listening: "listening.html", writing: "writing.html", speaking: "speaking.html" };
  var SKILLS = [
    { skill: "reading", zh: "Đọc" },
    { skill: "listening", zh: "Nghe" },
    { skill: "writing", zh: "Viết" },
    { skill: "speaking", zh: "Nói" }
  ];
  // ponytail: 复述恒 7 子题、面试恒 4 问，爬虫逐子题产出 task；其余类型每题单 task
  var SPAN = { 1331: 6, 1332: 3 };

  var index = null;
  var host = null;
  var shownId = 0;
  var shownSkill = "";
  var state = { skill: "reading", query: "", status: "all" };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function skillOf(skill) {
    var hit = SKILLS.filter(function (s) { return s.skill === skill; })[0];
    return hit || SKILLS[0];
  }
  function sectionOf(skill) {
    if (!index) return null;
    return (index.sections || []).filter(function (s) { return s.skill === skill; })[0] || null;
  }
  function groupById(id) {
    var found = null;
    ((index && index.sections) || []).forEach(function (sec) {
      (sec.groups || []).forEach(function (g) {
        if (Number(g.labelId) === id) found = { sec: sec, g: g };
      });
    });
    return found;
  }
  function hashId() {
    var m = String(location.hash || "").match(/^#(\d+)$/);
    return m ? Number(m[1]) : 0;
  }

  function rowHTML(sec, g, it, i, done) {
    var url = PAGES[sec.skill] + "?id=" + encodeURIComponent(it.id) + "&task=0";
    var end = SPAN[g.labelId];
    if (end != null) url += "&end=" + end;
    return '<a class="hit-set-row' + (done ? " is-done" : "") + '" href="' + esc(url) + '">' +
      '<span class="hit-set-num">' + String(i + 1).padStart(2, "0") + "</span>" +
      '<div class="hit-set-info"><h4>' + esc(it.topic || g.name) + "</h4><p>" + esc(g.name) +
      (it.difficulty ? " / Độ khó: " + esc(it.difficulty) : "") + "</p></div>" +
      '<span class="hit-set-st">' + (done ? "Đã hoàn thành" : "Chưa bắt đầu") + '</span><span class="hit-row-arrow" aria-hidden="true">↗</span></a>';
  }

  function paintLibrary() {
    host.innerHTML = '<div class="hit-library">' +
      '<aside class="hit-sidebar"><h2>Kỹ năng luyện tập</h2><nav aria-label="Kỹ năng luyện tập">' + SKILLS.map(function (s) {
        return '<button type="button" data-skill="' + s.skill + '" aria-pressed="false"><span><strong>' + s.zh +
          '</strong><small lang="en">' + s.skill.charAt(0).toUpperCase() + s.skill.slice(1) +
          '</small></span><span aria-hidden="true">↗</span></button>';
      }).join("") + '</nav><p>Chọn kỹ năng rồi chọn dạng bài. Sau khi nộp, bạn có thể xem đáp án và lời giải.</p><a class="hit-back" href="home.html">← Về trang chủ</a></aside>' +
      '<section class="hit-library-results" aria-labelledby="free-skill-heading">' +
      '<div class="hit-row"><h2 id="free-skill-heading"></h2><a class="hit-back" href="#" data-free-back hidden>← Về tất cả dạng bài</a></div>' +
      '<div class="hit-tabs" data-free-tabs role="group" aria-label="Lọc dạng bài"></div>' +
      '<form class="hit-search" role="search"><label>Tìm bài luyện<input type="search" name="query" autocomplete="off" placeholder="Nhập tên tiếng Việt hoặc tiếng Anh"></label>' +
      '<label>Tiến độ luyện tập<select name="status"><option value="all">Mọi trạng thái</option><option value="todo">Chưa bắt đầu</option><option value="done">Đã hoàn thành</option></select></label></form>' +
      '<div class="hit-list-summary"><span data-free-count role="status" aria-live="polite" aria-atomic="true"></span><button type="button" class="hit-out" data-reset>Đặt lại bộ lọc</button></div>' +
      '<div class="hit-list-columns" aria-hidden="true"><span>Số thứ tự</span><span>Nội dung luyện tập</span><span>Tiến độ</span><span></span></div>' +
      '<div class="hit-set-list" data-free-list></div></section></div>';
  }

  function resetFilters() {
    state.query = "";
    state.status = "all";
    host.querySelector('[name="query"]').value = "";
    host.querySelector('[name="status"]').value = "all";
  }

  function paintList() {
    var sec = sectionOf(state.skill);
    var text = w.YYSD_HIT.searchKey(state.query);
    var records = w.YYSD_HIT.doneMap();
    var rows = [];
    ((sec && sec.groups) || []).forEach(function (g) {
      if (shownId && Number(g.labelId) !== shownId) return;
      (g.items || []).forEach(function (it) {
        var done = w.YYSD_HIT.isDone(sec.skill, 0, it.id, records);
        if (state.status === "todo" && done || state.status === "done" && !done) return;
        if (text && w.YYSD_HIT.searchKey([it.topic, g.name, g.en].join(" ")).indexOf(text) < 0) return;
        rows.push(rowHTML(sec, g, it, rows.length, done));
      });
    });
    host.querySelector("[data-free-count]").textContent = "Có " + rows.length + " nhóm bài";
    host.querySelector("[data-free-list]").innerHTML = rows.length ? rows.join("") :
      '<div class="hit-empty"><b>Không có bài luyện phù hợp</b><p>Thử từ khóa khác hoặc xóa bộ lọc để xem tất cả các bài.</p><button type="button" class="hit-go" data-reset>Xóa bộ lọc</button></div>';
  }

  function render() {
    if (!index) return;
    var id = hashId();
    var found = id ? groupById(id) : null;
    id = found ? id : 0;
    if (id !== shownId) { resetFilters(); shownId = id; }
    if (found) state.skill = found.sec.skill;
    if (state.skill !== shownSkill) {
      shownSkill = state.skill;
      var sec = sectionOf(state.skill);
      var tabs = [{ labelId: 0, name: "Tất cả dạng bài" }].concat((sec && sec.groups) || []);
      host.querySelector("[data-free-tabs]").innerHTML = tabs.map(function (g) {
        return '<button type="button" data-label="' + esc(Number(g.labelId)) + '" aria-pressed="false">' + esc(g.name) + '</button>';
      }).join("");
      host.querySelector("#free-skill-heading").innerHTML = esc(skillOf(state.skill).zh) + ' <small lang="en">' +
        esc(state.skill.charAt(0).toUpperCase() + state.skill.slice(1)) + '</small>';
    }
    host.querySelectorAll("[data-skill], [data-label]").forEach(function (button) {
      var active = button.hasAttribute("data-skill") ? button.getAttribute("data-skill") === state.skill : Number(button.getAttribute("data-label")) === shownId;
      button.classList.toggle("is-on", active);
      button.setAttribute("aria-pressed", String(active));
    });
    host.querySelector("[data-free-back]").hidden = !shownId;
    paintList();
  }

  function init(el) {
    host = el;
    var qsSkill = new URLSearchParams(location.search).get("skill");
    if (qsSkill && SKILLS.some(function (s) { return s.skill === qsSkill; })) state.skill = qsSkill;
    host.innerHTML = '<p class="hit-status" role="status">Đang tải kho bài…</p>';
    host.addEventListener("click", function (ev) {
      if (!index) return;
      var t = ev.target.closest("[data-skill], [data-label]");
      if (t) {
        ev.preventDefault();
        var skill = t.getAttribute("data-skill");
        if (skill) state.skill = skillOf(skill).skill;
        resetFilters();
        location.hash = skill ? "" : (Number(t.getAttribute("data-label")) || "");
        render();
        t.focus();
        return;
      }
      if (ev.target.closest("[data-reset], [data-free-back]")) {
        ev.preventDefault();
        resetFilters();
        location.hash = "";
        render();
        host.querySelector('[name="query"]').focus();
      }
    });
    host.addEventListener("submit", function (ev) { ev.preventDefault(); });
    host.addEventListener("input", function (ev) {
      if (ev.target.name !== "query" || !index) return;
      state.query = ev.target.value;
      paintList();
    });
    host.addEventListener("change", function (ev) {
      if (ev.target.name !== "status" || !index) return;
      state.status = ev.target.value;
      paintList();
    });
    w.addEventListener("hashchange", render);
    fetch(INDEX, { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("index " + r.status); return r.json(); })
      .then(function (d) { index = d; paintLibrary(); render(); })
      .catch(function () { index = null; host.innerHTML = '<p class="hit-status" role="alert">Kho bài tạm thời không tải được. Hãy thử lại sau.</p>'; });
  }

  w.YYSD_FREE_BANK = { init: init };
})(window);
