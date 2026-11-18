/* teacher-vocab-challenge.js */
(function () {
  "use strict";
  var T = window.YYSD_TEACHER;
  var Y = window.YYSD;
  var root = document.getElementById("tvc-root");
  if (!T ||!root) return;

  var ASSIGNABLE = [
    { id: "gaozhong", label: " bố trí Kho từ vựng THPT " },
    { id: "cet4-lite", label: " Giao bộ Đại học Rút gọn " }
  ];

  function esc(s) {
    return Y && Y.esc? Y.esc(String(s == null? "": s)): String(s == null? "": s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function label(s) {
    return (s && (s.displayName || s.name || s.phone)) || (" Học viên #" + (s && s.id));
  }

  function formatProgress(b) {
    var prog = b && b.progress;
    if (!prog) return "—";
    var total = prog.totalDays || 78;
    if (prog.progressDay) {
      if (b.programComplete) return "Đã hoàn thành" + total + " màn ";
      return " thứ " + Math.min(prog.progressDay, total) + " màn ";
    }
    return " Hoàn thành L" + prog.clearedListNo;
  }

  function paint(students) {
    if (!students.length) {
      root.innerHTML = '<div class="state state--brand teacher-empty"><h3> tạm thời chưa có Học viên </h3><p>' +
        " trước mắt cơ cấu còn không có tài khoản học viên. </p></div>";
      return;
    }
    root.innerHTML =
      '<div class="table-wrap"><table class="data teacher-table">' +
        "<thead><tr><th> Học viên </th><th> đã bố trí từ quyển </th><th> thao tác </th></tr></thead>" +
        "<tbody>" +
        students.map(function (s) {
          var books = s.assignments && s.assignments.length
            ? s.assignments
            : (s.assignment? [{
                bookId: s.assignment.bookId,
                bookLabel: s.assignment.bookLabel || s.assignment.bookId,
                progress: s.progress,
                todayTasks: s.todayTasks,
                programComplete: s.programComplete,
                pool: s.pool
              }]: []);
          var assigned = {};
          books.forEach(function (b) { assigned[b.bookId] = true; });
          var bookHtml = books.length
            ? books.map(function (b) {
                return '<div style="margin-bottom:8px">' +
                  "<b>" + esc(b.bookLabel || b.bookId) + "</b><br>" +
                  '<span class="teacher-card__meta">' + esc(formatProgress(b)) + "</span><br>" +
                  '<button type="button" class="btn btn--ghost btn--sm" data-unassign="' +
                    s.studentId + '" data-book="' + esc(b.bookId) + '"> Hủy bố trí </button>' +
                  "</div>";
              }).join("")
            : " không bố trí ";
          var btns = ASSIGNABLE.map(function (a) {
            if (assigned[a.id]) return "";
            return '<button type="button" class="btn btn--ghost btn--sm" data-assign="' +
              s.studentId + '" data-book="' + a.id + '">' + esc(a.label) + "</button> ";
          }).join("") +
            '<button type="button" class="btn btn--ghost btn--sm" data-refresh="' +
              s.studentId + '"> Làm mới </button>';
          return "<tr data-id=\"" + s.studentId + "\">" +
            "<td><b>" + esc(label(s)) + "</b><br><span class=\"teacher-card__meta\">" +
              esc(s.phone || "") + "</span></td>" +
            "<td>" + bookHtml + "</td>" +
            "<td>" + btns + "</td>" +
            "</tr>";
        }).join("") +
        "</tbody></table></div>";

    root.onclick = function (e) {
      var t = e.target && e.target.nodeType === 1? e.target: (e.target && e.target.parentElement);
      if (!t ||!t.closest) return;
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
    el.style.color = ok? "#1f553f": "#8a3b2a";
  }

  function doAssign(studentId, bookId) {
    msg(" Đang giao bài…", true);
    T.api("/api/vocab-challenge/teacher/assign", {
      method: "POST",
      body: { studentId: studentId, bookId: bookId }
    }).then(function (d) {
      if (!d ||!d.ok) {
        msg((d && d.error) || " bố trí thất bại ", false);
        return;
      }
      msg(d.unchanged? " đã là nên từ quyển ": " bố trí thành công ", true);
      load();
    }).catch(function (e) {
      msg((e && e.message) || " bố trí thất bại ", false);
    });
  }

  function doUnassign(studentId, bookId) {
    msg(" Đang hủy…", true);
    T.api("/api/vocab-challenge/teacher/unassign", {
      method: "POST",
      body: { studentId: studentId, bookId: bookId }
    }).then(function (d) {
      if (!d ||!d.ok) {
        msg((d && d.error) || " Hủy thất bại ", false);
        return;
      }
      msg(" đã Hủy bố trí (Tiến độ giữ lại) ", true);
      load();
    }).catch(function (e) {
      msg((e && e.message) || " Hủy thất bại ", false);
    });
  }

  function loadOne(studentId) {
    T.api("/api/vocab-challenge/teacher/student?studentId=" + encodeURIComponent(studentId))
      .then(function () { load(); })
      .catch(function () { msg(" Làm mới thất bại ", false); });
  }

  function load() {
    T.api("/api/vocab-challenge/teacher/roster")
      .then(function (roster) {
        paint((roster && roster.students) || []);
      })
      .catch(function () {
        root.innerHTML = '<p class="vs-empty"> Tải dữ liệu thất bại, xin xác nhận đã Đăng nhập Giáo viên tài khoản. </p>';
      });
  }

  load();
})();
