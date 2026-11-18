/* =========================================================================
   teacher.js — 教师端「我的学生」
   ========================================================================= */
(function () {
  "use strict";

  var T = window.YYSD_TEACHER;
  var Y = window.YYSD;
  var searchQuery = "";
  var students = [];
  var events = [];
  var scores = [];
  var viewStudent = null;
  var selectedDay = "";
  var monthCursor = new Date();
  monthCursor.setDate(1);
  monthCursor.setHours(0, 0, 0, 0);

  var STATUS_LABEL = { PENDING: "Đang chờ", COMPLETED: "Đã hoàn thành", OVERDUE: "Quá hạn" };

  var welcomeEl = document.getElementById("teacher-welcome");
  var listEl = document.getElementById("teacher-students");
  var refreshBtn = document.getElementById("refresh-btn");
  var logoutBtn = document.getElementById("logout-btn");
  var yearEl = document.getElementById("year");
  var rosterHead = document.getElementById("roster-head");
  var rosterMain = document.getElementById("roster-main");
  var studentHead = document.getElementById("student-head");
  var studentMain = document.getElementById("student-main");
  var calEl = document.getElementById("stu-cal");
  var dayEl = document.getElementById("stu-day");
  var reportMonthEl = document.getElementById("report-month");
  var reportExportBtn = document.getElementById("report-export");

  if (yearEl) yearEl.textContent = new Date().getFullYear();
  if (logoutBtn) logoutBtn.addEventListener("click", function () { T.logout(); });
  if (refreshBtn) refreshBtn.addEventListener("click", load);
  var searchEl = document.getElementById("student-search");
  if (searchEl) {
    searchEl.addEventListener("input", function () {
      searchQuery = searchEl.value.trim().toLowerCase();
      renderRoster();
    });
  }

  function studentIdFromUrl() {
    try { return Number(new URLSearchParams(location.search).get("student") || 0) || 0; }
    catch (e) { return 0; }
  }

  function studentLabel(student) {
    if (student && student.displayName) return student.displayName;
    return (student && student.phone) || "Học viên chưa đặt tên";
  }

  function avatarSrc(url) {
    if (!url) return "";
    if (/^https?:\/\//i.test(url) || url.indexOf("data:") === 0) return url;
    return T.API_BASE + url;
  }

  function fillAvatar(el, url, fallback) {
    if (!el) return;
    var src = avatarSrc(url);
    if (src) {
      el.innerHTML = '<img src="' + src.replace(/"/g, "") + '" alt="">';
      el.classList.add("has-img");
    } else {
      el.textContent = fallback || "—";
      el.classList.remove("has-img");
    }
  }

  function avatarFallback(student) {
    var name = (student && student.displayName) || "";
    if (name) return name.slice(0, 1);
    return ((student && student.phone) || "").replace(/\D/g, "").slice(-4) || "HV";
  }

  function renderTeacherAvatar(url, phone) {
    fillAvatar(document.getElementById("teacher-avatar"), url, (phone || "").replace(/\D/g, "").slice(-4) || "GV");
  }

  function showAvatarMsg(text, ok) {
    var el = document.getElementById("teacher-avatar-msg");
    if (!el) return;
    el.textContent = text || "";
    el.className = "auth-msg" + (ok ? " auth-msg--ok" : text ? " auth-msg--err" : "");
  }

  var avatarInput = document.getElementById("teacher-avatar-input");
  if (avatarInput) {
    avatarInput.addEventListener("change", function () {
      var file = this.files && this.files[0];
      this.value = "";
      if (!file || !window.YYSD_AUTH || !window.YYSD_AUTH.uploadAvatar) return;
      showAvatarMsg("Đang tải lên…");
      window.YYSD_AUTH.uploadAvatar(file)
        .then(function (d) {
          renderTeacherAvatar(d.avatarUrl, (T.getTeacher() || {}).phone);
          T.setTeacher({
            phone: (T.getTeacher() || {}).phone,
            name: (T.getTeacher() || {}).name || "",
            avatarUrl: d.avatarUrl || ""
          });
          showAvatarMsg("Đã cập nhật ảnh đại diện", true);
        })
        .catch(function (e) { showAvatarMsg(e.message); });
    });
  }

  function matchesSearch(student) {
    if (!searchQuery) return true;
    var name = (student.displayName || "").toLowerCase();
    var phone = (student.phone || "").toLowerCase();
    return name.indexOf(searchQuery) >= 0 || phone.indexOf(searchQuery) >= 0;
  }

  function sortKey(student) {
    return (student.displayName || student.phone || "");
  }

  function fmtDate(iso) {
    if (!iso) return "—";
    try { return new Date(iso).toLocaleString("vi-VN"); } catch (e) { return iso; }
  }

  function fmtDuration(sec) {
    if (sec == null || sec === "" || !isFinite(Number(sec))) return "—";
    var n = Math.max(0, Math.round(Number(sec)));
    var h = Math.floor(n / 3600);
    var m = Math.floor((n % 3600) / 60);
    var s = n % 60;
    if (h > 0) return h + " giờ" + (m ? " " + m + " phút" : "");
    if (m > 0) return m + " phút" + (s ? " " + s + " giây" : "");
    return s + " giây";
  }

  function fmtScore(row) {
    if (!row) return "—";
    if (row.score == null && row.writingWords == null) return "—";
    if (row.score != null) {
      var s = String(row.score);
      if (row.total != null) s += " / " + row.total;
      if (row.band != null) s += " · Band " + row.band;
      return s;
    }
    return row.writingWords ? row.writingWords + " từ" : "Đã hoàn thành";
  }

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function dayKeyOf(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso).slice(0, 10);
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function todayKey() { return dayKeyOf(new Date().toISOString()); }

  function currentMonthKey() {
    var d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1);
  }

  function fillReportMonths() {
    if (!reportMonthEl || reportMonthEl.options.length) return;
    var d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    var cur = currentMonthKey();
    var i;
    for (i = 0; i < 12; i++) {
      var key = d.getFullYear() + "-" + pad(d.getMonth() + 1);
      var opt = document.createElement("option");
      opt.value = key;
      opt.textContent = "Tháng " + (d.getMonth() + 1) + "/" + d.getFullYear();
      if (key === cur) opt.selected = true;
      reportMonthEl.appendChild(opt);
      d.setMonth(d.getMonth() - 1);
    }
  }

  function prettyDay(key) {
    var p = String(key || "").split("-");
    if (p.length !== 3) return key || "";
    return Number(p[2]) + "/" + Number(p[1]) + "/" + p[0];
  }

  function applyMe(me) {
    me = me || {};
    var label = me.name || me.phone || "";
    if (welcomeEl) welcomeEl.textContent = label ? "Chào mừng, " + label : "";
    renderTeacherAvatar(me.avatarUrl, me.phone);
    T.setTeacher({
      phone: me.phone,
      name: me.name || "",
      avatarUrl: me.avatarUrl || "",
      isAdmin: !!me.isAdmin
    });
    try {
      localStorage.setItem("yysd:auth:user", JSON.stringify({
        phone: me.phone || "",
        role: "teacher",
        displayName: me.name || "",
        avatarUrl: me.avatarUrl || "",
        isAdmin: !!me.isAdmin
      }));
    } catch (e) {}
    document.querySelectorAll("[data-admin-only]").forEach(function (el) {
      el.hidden = !me.isAdmin;
    });
  }

  function failBox(msg) {
    return '<div class="state state--brand teacher-empty"><h3>Không tải được nội dung</h3><p>' +
      Y.esc(msg) + '</p><p><a class="btn btn--ghost btn--sm" href="teacher-login.html">Đăng nhập lại</a></p></div>';
  }

  function renderRoster() {
    var visible = students.filter(matchesSearch).slice().sort(function (a, b) {
      return sortKey(a).localeCompare(sortKey(b), "zh");
    });
    if (!visible.length) {
      listEl.innerHTML = '<div class="state state--brand teacher-empty">' +
        '<h3>' + (searchQuery ? "Không tìm thấy học viên phù hợp" : "Chưa có học viên") + '</h3>' +
        '<p>' + (searchQuery ? "hãy thử tên đăng nhập hoặc số điện thoại khác." : "Học viên sẽ xuất hiện sau khi được phân công.") + '</p></div>';
      return;
    }
    listEl.innerHTML = visible.map(function (student) {
      var overdue = student.hasOverdue ? " is-overdue" : "";
      var src = avatarSrc(student.avatarUrl);
      var av = src
        ? '<img src="' + src.replace(/"/g, "") + '" alt="">'
        : Y.esc(avatarFallback(student));
      return '<a class="teacher-student-card' + overdue + '" href="teacher.html?student=' +
        student.id + '">' +
        '<span class="profile-avatar' + (src ? " has-img" : "") + '">' + av + "</span>" +
        "<b>" + Y.esc(studentLabel(student)) + "</b>" +
        (student.hasOverdue ? '<span class="teacher-student-card__late">Quá hạn</span>' : "") +
        "</a>";
    }).join("");
  }

  function eventsOnDay(dayKey) {
    return events.filter(function (ev) { return dayKeyOf(ev.createdAt) === dayKey; });
  }

  function latestAssignDay() {
    var latest = "";
    var latestTs = 0;
    events.forEach(function (ev) {
      var ts = Date.parse(ev.createdAt || "") || 0;
      if (ts > latestTs) {
        latestTs = ts;
        latest = dayKeyOf(ev.createdAt);
      }
    });
    return latest || todayKey();
  }

  function chipStatusClass(st) {
    if (st === "COMPLETED") return "is-done";
    if (st === "OVERDUE") return "is-overdue";
    return "is-pending";
  }

  function scoreForEvent(ev) {
    var id = String(ev.id);
    var i;
    for (i = 0; i < scores.length; i++) {
      if (String(scores[i].assignmentEventId || "") === id) return scores[i];
    }
    var linked = ev.linkedExerciseIds || [];
    var j;
    for (j = 0; j < linked.length; j++) {
      for (i = 0; i < scores.length; i++) {
        if (String(scores[i].id) === String(linked[j])) return scores[i];
      }
    }
    return null;
  }

  function yearChoices() {
    var nowY = new Date().getFullYear();
    var minY = nowY - 5;
    var maxY = nowY;
    events.forEach(function (ev) {
      var k = dayKeyOf(ev.createdAt);
      if (!k) return;
      var yy = Number(k.slice(0, 4));
      if (yy && yy < minY) minY = yy;
      if (yy && yy > maxY) maxY = yy;
    });
    var cy = monthCursor.getFullYear();
    if (cy < minY) minY = cy;
    if (cy > maxY) maxY = cy;
    var out = [];
    var yy;
    for (yy = maxY; yy >= minY; yy--) out.push(yy);
    return out;
  }

  function syncDayToMonth() {
    var y = monthCursor.getFullYear();
    var mo = monthCursor.getMonth();
    var prefix = y + "-" + pad(mo + 1) + "-";
    if (selectedDay && selectedDay.indexOf(prefix) === 0) return;
    var latest = "";
    var latestTs = 0;
    events.forEach(function (ev) {
      var k = dayKeyOf(ev.createdAt);
      if (!k || k.indexOf(prefix) !== 0) return;
      var ts = Date.parse(ev.createdAt || "") || 0;
      if (ts >= latestTs) {
        latestTs = ts;
        latest = k;
      }
    });
    if (latest) {
      selectedDay = latest;
      return;
    }
    var t = todayKey();
    selectedDay = t.indexOf(prefix) === 0 ? t : prefix + "01";
  }

  function applyMonth(y, m) {
    monthCursor = new Date(Number(y), Number(m), 1);
    monthCursor.setHours(0, 0, 0, 0);
    syncDayToMonth();
    renderCal();
    renderDay();
  }

  function renderCal() {
    var y = monthCursor.getFullYear();
    var m = monthCursor.getMonth();
    var firstDow = new Date(y, m, 1).getDay();
    var daysInMonth = new Date(y, m + 1, 0).getDate();
    var cells = [];
    var i;
    for (i = 0; i < firstDow; i++) cells.push('<div class="cal-month__cell is-empty"></div>');
    for (i = 1; i <= daysInMonth; i++) {
      var dayKey = y + "-" + pad(m + 1) + "-" + pad(i);
      var dayEvents = eventsOnDay(dayKey);
      var chips = dayEvents.slice(0, 3).map(function (ev) {
        return '<span class="cal-month__chip ' + chipStatusClass(ev.status) + '">' +
          Y.esc(ev.title) + "</span>";
      }).join("");
      if (dayEvents.length > 3) {
        chips += '<span class="cal-month__more">+' + (dayEvents.length - 3) + "</span>";
      }
      var cellCls = "cal-month__cell";
      if (dayKey === todayKey()) cellCls += " is-today";
      if (dayKey === selectedDay) cellCls += " is-selected";
      if (dayEvents.length) cellCls += " has-events";
      cells.push(
        '<div class="' + cellCls + '" data-day="' + dayKey + '" role="button" tabindex="0">' +
          '<div class="cal-month__day">' + i + "</div>" +
          '<div class="cal-month__chips">' + chips + "</div></div>"
      );
    }
    var yearOpts = yearChoices().map(function (yy) {
      return '<option value="' + yy + '"' + (yy === y ? " selected" : "") + ">" + yy + "</option>";
    }).join("");
    var monthOpts = "";
    var mi;
    for (mi = 0; mi < 12; mi++) {
      monthOpts += '<option value="' + mi + '"' + (mi === m ? " selected" : "") + ">" + (mi + 1) + "</option>";
    }
    calEl.innerHTML =
      '<div class="cal-month">' +
        '<div class="cal-month__nav">' +
          '<button type="button" class="btn btn--ghost btn--sm" data-nav-dir="-1" aria-label="Tháng trước">‹</button>' +
          '<label class="cal-month__pick"><span class="visually-hidden">Năm</span>' +
            '<select data-cal-year>' + yearOpts + "</select></label>" +
          '<label class="cal-month__pick"><span class="visually-hidden">Tháng</span>' +
            '<select data-cal-month>' + monthOpts + "</select></label>" +
          '<button type="button" class="btn btn--ghost btn--sm" data-nav-dir="1" aria-label="Tháng sau">›</button>' +
        "</div>" +
        '<div class="cal-month__weekdays">' +
          "<span>CN</span><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span>" +
        "</div>" +
        '<div class="cal-month__grid">' + cells.join("") + "</div></div>";
  }

  function attemptButton(row) {
    if (!row) return "";
    var hasEssay = !!(row.writingTask1 || row.writingTask2);
    var wrongN = (row.wrong && row.wrong.length) || 0;
    var btnLabel = hasEssay ? "Xem bài viết" : (wrongN ? ("Xem câu sai (" + wrongN + ")") : "Xem chi tiết");
    return '<button type="button" class="btn btn--ghost btn--sm" data-attempt="' +
      Y.esc(String(row.attemptId || "")) + '">' + btnLabel + "</button>";
  }

  function renderDay() {
    var dayEvents = eventsOnDay(selectedDay);
    var heading = prettyDay(selectedDay);
    if (!dayEvents.length) {
      dayEl.innerHTML = '<div class="stu-day-panel"><h2>' + Y.esc(heading) + "</h2>" +
        '<p class="teacher-empty-row">Ngày này không có bài tập được giao</p></div>';
      return;
    }
    var rows = dayEvents.map(function (ev) {
      var st = ev.status || "PENDING";
      var row = scoreForEvent(ev);
      var meta = [];
      if (st === "COMPLETED" && row) {
        meta.push("Điểm " + fmtScore(row));
        meta.push("Thời gian làm bài: " + fmtDuration(row.durationSec));
        if (row.date) meta.push("Hoàn thành " + fmtDate(row.date));
      } else if (ev.exerciseTotal) {
        meta.push("Tiến độ " + (ev.exerciseDone || 0) + " / " + ev.exerciseTotal);
      }
      if (ev.dueTime) meta.push("Hạn nộp " + fmtDate(ev.dueTime));
      return '<article class="stu-day-item ' + chipStatusClass(st) + '">' +
        "<header><b>" + Y.esc(ev.title) + "</b>" +
        '<span class="cal-status-pill ' +
          (st === "COMPLETED" ? "cal-status--done" : st === "OVERDUE" ? "cal-status--overdue" : "cal-status--pending") +
          '">' + Y.esc(STATUS_LABEL[st] || st) + "</span></header>" +
        (meta.length ? '<p class="stu-day-item__meta">' + Y.esc(meta.join(" · ")) + "</p>" : "") +
        attemptButton(row) + "</article>";
    }).join("");
    dayEl.innerHTML = '<div class="stu-day-panel"><h2>' + Y.esc(heading) + " Bài tập được giao</h2>" + rows + "</div>";
  }

  function renderStudentHome() {
    fillAvatar(document.getElementById("student-avatar"), viewStudent && viewStudent.avatarUrl, avatarFallback(viewStudent));
    document.getElementById("student-title").textContent = studentLabel(viewStudent);
    document.getElementById("student-sub").textContent = (viewStudent && viewStudent.phone) || "";
    renderCal();
    renderDay();
  }

  function findAttempt(attemptId) {
    var aid = Number(attemptId);
    for (var i = 0; i < scores.length; i++) {
      if (Number(scores[i].attemptId) === aid) return scores[i];
    }
    return null;
  }

  function openAttemptDetail(attemptId) {
    var r = findAttempt(attemptId);
    var modal = document.getElementById("attempt-modal");
    var body = document.getElementById("attempt-body");
    var title = document.getElementById("attempt-modal-title");
    if (!modal || !body || !r) return;
    var wrong = r.wrong || [];
    title.textContent = (r.title || r.id) + " · " + fmtScore(r);
    var head =
      '<p class="teacher-attempt-meta">' + Y.esc(studentLabel(viewStudent)) +
      (r.band != null ? " · Band " + r.band : "") + "</p>" +
      '<p class="teacher-attempt-meta">Bắt đầu ' + fmtDate(r.startedAt) +
      " · Hoàn thành " + fmtDate(r.date) +
      " · Tổng thời gian " + Y.esc(fmtDuration(r.durationSec)) + "</p>";
    var list;
    if (r.writingTask1 || r.writingTask2) {
      list = '<div class="teacher-essay">' +
        (r.writingTask1 ? "<section><h4>Task 1</h4><pre>" + Y.esc(r.writingTask1) + "</pre></section>" : "") +
        (r.writingTask2 ? "<section><h4>Task 2</h4><pre>" + Y.esc(r.writingTask2) + "</pre></section>" : "") +
        "</div>";
    } else if (!wrong.length) {
      list = '<p class="teacher-empty-row">Lượt này không có chi tiết câu sai' +
        (r.score != null && r.total != null && r.score === r.total ? " (đúng tất cả)" : " (bản ghi cũ hoặc dạng bài này không gửi chi tiết)") +
        "</p>";
    } else {
      list = '<ul class="teacher-wrong-list">' + wrong.map(function (w) {
        return "<li><b>Câu " + Y.esc(String(w.no)) + " câu</b>" +
          "<span>Học viên trả lời: " + Y.esc(w.ua || "Chưa trả lời") + "</span>" +
          "<span>Đáp án: " + Y.esc(w.ans || "—") + "</span></li>";
      }).join("") + "</ul>";
    }
    body.innerHTML = head + list;
    var panel = modal.querySelector(".cal-modal__panel");
    window.YYSD_BIND_SHEET(panel, closeAttemptDetail);
    window.YYSD_SURFACE(modal, true, document.activeElement);
    panel.querySelector("button").focus();
  }

  function closeAttemptDetail() {
    var modal = document.getElementById("attempt-modal");
    if (modal) window.YYSD_SURFACE(modal, false);
  }

  document.addEventListener("keydown", function (event) {
    var modal = document.getElementById("attempt-modal");
    if (!modal || modal.hidden || modal.inert) return;
    if (event.key === "Escape") closeAttemptDetail();
    if (event.key === "Tab") {
      var controls = modal.querySelectorAll("button, a[href]");
      var edge = event.shiftKey ? controls[0] : controls[controls.length - 1];
      if (edge && document.activeElement === edge) {
        event.preventDefault();
        (event.shiftKey ? controls[controls.length - 1] : controls[0]).focus();
      }
    }
  });

  function setView(studentMode) {
    if (rosterHead) rosterHead.hidden = !!studentMode;
    if (rosterMain) rosterMain.hidden = !!studentMode;
    if (studentHead) studentHead.hidden = !studentMode;
    if (studentMain) studentMain.hidden = !studentMode;
  }

  function loadRoster() {
    setView(false);
    listEl.innerHTML = '<div class="state state--brand"><div class="spinner spinner--brand"></div></div>';
    Promise.all([T.api("/api/teacher/me"), T.api("/api/teacher/students")]).then(function (res) {
      applyMe(res[0].teacher || {});
      students = res[1].students || [];
      renderRoster();
    }).catch(function (e) {
      listEl.innerHTML = failBox(e.message);
    });
  }

  function loadStudent(id) {
    setView(true);
    fillReportMonths();
    calEl.innerHTML = '<div class="state state--brand"><div class="spinner spinner--brand"></div></div>';
    dayEl.innerHTML = "";
    Promise.all([
      T.api("/api/teacher/me"),
      T.api("/api/teacher/students/" + id + "/calendar"),
      T.api("/api/teacher/students/" + id + "/scores")
    ]).then(function (res) {
      applyMe(res[0].teacher || {});
      viewStudent = res[1].student || { id: id };
      events = res[1].events || [];
      scores = res[2].scores || [];
      selectedDay = latestAssignDay();
      var parts = selectedDay.split("-");
      if (parts.length === 3) {
        monthCursor = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
      }
      renderStudentHome();
    }).catch(function (e) {
      calEl.innerHTML = failBox(e.message);
    });
  }

  function load() {
    var id = studentIdFromUrl();
    if (id) loadStudent(id);
    else loadRoster();
  }

  load();

  if (calEl) {
    calEl.addEventListener("click", function (e) {
      var nav = e.target.closest("[data-nav-dir]");
      if (nav) {
        applyMonth(monthCursor.getFullYear(), monthCursor.getMonth() + Number(nav.getAttribute("data-nav-dir")));
        return;
      }
      var cell = e.target.closest("[data-day]");
      if (!cell) return;
      selectedDay = cell.getAttribute("data-day") || selectedDay;
      renderCal();
      renderDay();
    });
    calEl.addEventListener("change", function (e) {
      if (!e.target.closest("[data-cal-year], [data-cal-month]")) return;
      var yEl = calEl.querySelector("[data-cal-year]");
      var mEl = calEl.querySelector("[data-cal-month]");
      applyMonth(yEl && yEl.value, mEl && mEl.value);
    });
  }
  if (dayEl) {
    dayEl.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-attempt]");
      if (!btn) return;
      openAttemptDetail(btn.getAttribute("data-attempt"));
    });
  }
  var attemptModal = document.getElementById("attempt-modal");
  if (attemptModal) {
    attemptModal.addEventListener("click", function (e) {
      if (e.target.getAttribute("data-close-attempt")) closeAttemptDetail();
    });
  }
  if (reportExportBtn) {
    reportExportBtn.addEventListener("click", function () {
      var id = viewStudent && viewStudent.id;
      if (!id) return;
      var month = (reportMonthEl && reportMonthEl.value) || currentMonthKey();
      window.open("teacher-student-report.html?student=" + id + "&month=" + encodeURIComponent(month), "_blank");
    });
  }
})();
