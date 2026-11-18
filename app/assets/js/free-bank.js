/* ponytail: miễn phí ngân hàng câu hỏi danh sách - index.json điều khiển, hash định tuyến #labelId */
(function (w) {
  "use strict";
  var INDEX = "library/toefl/free/index.json";
  var PAGES = { reading: "reading.html", listening: "listening.html", writing: "writing.html", speaking: "speaking.html" };
  var SKILLS = [
    { skill: "reading", zh: " Đọc hiểu " },
    { skill: "listening", zh: " Nghe hiểu " },
    { skill: "writing", zh: " Viết " },
    { skill: "speaking", zh: " Nói " }
  ];
  // ponytail: lặp lại vĩnh viễn 7 con trai chủ đề, được phỏng vấn vĩnh viễn 4 hỏi, bò sát theo đuổi con trai chủ đề sản xuất task; phần còn lại loại mỗi chủ đề hóa đơn task
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
      '<span class="hit-set-st">' + (done ? " đã hoàn thành " : " chưa bắt đầu ") + '</span><span class="hit-row-arrow" aria-hidden="true">↗</span></a>';
  }

  function paintLibrary() {
    host.innerHTML = '<div class="hit-library">' +
      '<aside class="hit-sidebar"><h2>luyện tập môn học</h2><nav aria-label=" luyện tập môn học ">' + SKILLS.map(function (s) {
        return '<button type="button" data-skill="' + s.skill + '" aria-pressed="false"><span><strong>' + s.zh +
          '</strong><small lang="en">' + s.skill.charAt(0).toUpperCase() + s.skill.slice(1) +
          '</small></span><span aria-hidden="true">↗</span></button>';
      }).join("") + '</nav><p>trước chọn môn học, lại chọn chủ đề khuôn <br>nộp bài thi hoàng hậu xem xét câu trả lời biến thể của | phân tích </p><a class="hit-back" href="home.html">← trở về trang chủ</a></aside>' +
      '<section class="hit-library-results" aria-labelledby="free-skill-heading">' +
      '<div class="hit-row"><h2 id="free-skill-heading"></h2><a class="hit-back" href="#" data-free-back hidden>← trở về toàn bộ chủ đề khuôn</a></div>' +
      '<div class="hit-tabs" data-free-tabs role="group" aria-label=" lọc chủ đề khuôn "></div>' +
      '<form class="hit-search" role="search"><label>tìm kiếm chủ đề<input type="search" name="query" autocomplete="off" placeholder=" nhập khẩu ngôn ngữ Trung Quốc có thể tiếng Anh chủ đề tên "></label>' +
      '<label>luyện tập tốc độ tiến triển<select name="status"><option value="all">toàn bộ tốc độ tiến triển</option><option value="todo">chưa bắt đầu</option><option value="done">đã hoàn thành</option></select></label></form>' +
      '<div class="hit-list-summary"><span data-free-count role="status" aria-live="polite" aria-atomic="true"></span><button type="button" class="hit-out" data-reset>đặt lại lọc</button></div>' +
      '<div class="hit-list-columns" aria-hidden="true"><span>số thứ tự</span><span>luyện tập nội dung</span><span>tốc độ tiến triển</span><span></span></div>' +
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
    var text = state.query.trim().toLocaleLowerCase();
    var records = w.YYSD_HIT.doneMap();
    var rows = [];
    ((sec && sec.groups) || []).forEach(function (g) {
      if (shownId && Number(g.labelId) !== shownId) return;
      (g.items || []).forEach(function (it) {
        var done = w.YYSD_HIT.isDone(sec.skill, 0, it.id, records);
        if (state.status === "todo" && done || state.status === "done" && !done) return;
        if (text && [it.topic, g.name].join(" ").toLocaleLowerCase().indexOf(text) < 0) return;
        rows.push(rowHTML(sec, g, it, rows.length, done));
      });
    });
    host.querySelector("[data-free-count]").textContent = " Tổng cộng " + rows.length + " hình thành luyện tập ";
    host.querySelector("[data-free-list]").innerHTML = rows.length ? rows.join("") :
      '<div class="hit-empty"><b>không có phù hợp với điều kiện của luyện tập</b><p>thử thử khác từ khóa, có thể dọn dẹp lọc xem xét toàn bộ chủ đề </p><button type="button" class="hit-go" data-reset>dọn dẹp lọc</button></div>';
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
      var tabs = [{ labelId: 0, name: " toàn bộ chủ đề khuôn " }].concat((sec && sec.groups) || []);
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
    host.innerHTML = '<p class="hit-status" role="status">ngân hàng câu hỏi tải Trung Quốc...</p>';
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
      .catch(function () { index = null; host.innerHTML = '<p class="hit-status" role="alert">ngân hàng câu hỏi tạm thời không thể sử dụng, mời một lát nữa lại thử </p>'; });
  }

  w.YYSD_FREE_BANK = { init: init };
})(window);
