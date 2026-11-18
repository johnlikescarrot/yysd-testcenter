/* teacher-vocab-challenge.js */
(function () {
  "use strict";
  var T = window.YYSD_TEACHER;
  var Y = window.YYSD;
  var root = document.getElementById("tvc-root");
  if (!T || !root) return;

  var ASSIGNABLE = [
    { id: "gaozhong", label: "Giao giáo trình THPT" },
    { id: "cet4-lite", label: "Giao CET-4 rút gọn" }
  ];

  function esc(s) {
    return Y && Y.esc ? Y.esc(String(s == null ? "" : s)) : String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function label(s) {
    return (s && (s.displayName || s.name || s.phone)) || ("Học viên #" + (s && s.id));
  }

  function formatProgress(b) {
    var prog = b && b.progress;
    if (!prog) return "—";
    var total = prog.totalDays || 78;
    if (prog.progressDay) {
      if (b.programComplete) return "Đã hoàn thành " + total + " chặng";
      return "Câu " + Math.min(prog.progressDay, total) + " chặng";
    }
    return "Đã qua L" + prog.clearedListNo;
  }

  function paint(students) {
    if (!students.length) {
      root.innerHTML = '<div class="state state--brand teacher-empty"><h3>Chưa có học viên</h3><p>' +
        "Đơn vị này chưa có tài khoản học viên.</p></div>";
      return;
    }
    root.innerHTML =
      '<div class="table-wrap"><table class="data teacher-table">' +
        "<thead><tr><th>Học viên</th><th>Giáo trình đã giao</th><th>Thao tác</th></tr></thead>" +
        "<tbody>" +
        students.map(function (s) {
          var books = s.assignments && s.assignments.length
            ? s.assignments
            : (s.assignment ? [{
                bookId: s.assignment.bookId,
                bookLabel: s.assignment.bookLabel || s.assignment.bookId,
                progress: s.progress,
                todayTasks: s.todayTasks,
                programComplete: s.programComplete,
                pool: s.pool
              }] : []);
          var assigned = {};
          books.forEach(function (b) { assigned[b.bookId] = true; });
          var bookHtml = books.length
            ? books.map(function (b) {
                return '<div style="margin-bottom:8px">' +
                  "<b>" + esc(b.bookLabel || b.bookId) + "</b><br>" +
                  '<span class="teacher-card__meta">' + esc(formatProgress(b)) + "</span><br>" +
                  '<button type="button" class="btn btn--ghost btn--sm" data-unassign="' +
                    s.studentId + '" data-book="' + esc(b.bookId) + '">Hủy giao</button>' +
                  "</div>";
              }).join("")
            : "Chưa giao";
          var btns = ASSIGNABLE.map(function (a) {
            if (assigned[a.id]) return "";
            return '<button type="button" class="btn btn--ghost btn--sm" data-assign="' +
              s.studentId + '" data-book="' + a.id + '">' + esc(a.label) + "</button> ";
          }).join("") +
            '<button type="button" class="btn btn--ghost btn--sm" data-refresh="' +
              s.studentId + '">Làm mới</button>';
          return "<tr data-id=\"" + s.studentId + "\">" +
            "<td><b>" + esc(label(s)) + "</b><br><span class=\"teacher-card__meta\">" +
              esc(s.phone || "") + "</span></td>" +
            "<td>" + bookHtml + "</td>" +
            "<td>" + btns + "</td>" +
            "</tr>";
        }).join("") +
        "</tbody></table></div>";

    root.onclick = function (e) {
      var t = e.target && e.target.nodeType === 1 ? e.target : (e.target && e.target.parentElement);
      if (!t || !t.closest) return;
      var assignBtn = t.closest("[data-assign]");
      var unassignBtn = t.closest("[data-unassign]");
      var refreshBtn = t.closest("[data-refresh]");
      if (assignBtn) {
        doAssign(Number(assignBtn.getAttribute("data-assign")), assignBtn.getAttribute("data-book"));
      } else if (unassignBtn) {
        doUnassign(Number(unassignBtn.getAttribute("data-unassign")), unassignBtn.getAttribute("data-book"));
      } else if (refreshBtn) {
        loadOne(Number(refreshBtn.getAttribute("data-refresh")));
      }
    };
  }

  function msg(text, ok) {
    var el = document.getElementById("tvc-msg");
    if (!el) return;
    el.textContent = text || "";
    el.style.color = ok ? "#1f553f" : "#8a3b2a";
  }

  function doAssign(studentId, bookId) {
    msg("Đang giao…", true);
    T.api("/api/vocab-challenge/teacher/assign", {
      method: "POST",
      body: { studentId: studentId, bookId: bookId }
    }).then(function (d) {
      if (!d || !d.ok) {
        msg((d && d.error) || "Không giao được bài", false);
        return;
      }
      msg(d.unchanged ? "Học viên đã có giáo trình này" : "Đã giao thành công", true);
      load();
    }).catch(function (e) {
      msg((e && e.message) || "Không giao được bài", false);
    });
  }

  function doUnassign(studentId, bookId) {
    msg("Đang hủy…", true);
    T.api("/api/vocab-challenge/teacher/unassign", {
      method: "POST",
      body: { studentId: studentId, bookId: bookId }
    }).then(function (d) {
      if (!d || !d.ok) {
        msg((d && d.error) || "Không hủy được", false);
        return;
      }
      msg("Đã hủy giao bài (tiến độ vẫn được giữ lại)", true);
      load();
    }).catch(function (e) {
      msg((e && e.message) || "Không hủy được", false);
    });
  }

  function loadOne(studentId) {
    T.api("/api/vocab-challenge/teacher/student?studentId=" + encodeURIComponent(studentId))
      .then(function () { load(); })
      .catch(function () { msg("Không làm mới được", false); });
  }

  function load() {
    T.api("/api/vocab-challenge/teacher/roster")
      .then(function (roster) {
        paint((roster && roster.students) || []);
      })
      .catch(function () {
        root.innerHTML = '<p class="vs-empty">Không tải được nội dung, hãy kiểm tra bạn đã đăng nhập bằng tài khoản giáo viên.</p>';
      });
  }

  load();
})();
