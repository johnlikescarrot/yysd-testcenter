/* =========================================================================
   admin-assign.js — assign students to a teacher (admin only)
   ========================================================================= */
(function () {
  "use strict";
  var A = window.YYSD_AUTH;
  var API_BASE = (A && A.API_BASE) || "https://api.youyisida.com";
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var teacherSelect = document.getElementById("teacher-select");
  var studentList = document.getElementById("student-list");
  var studentQ = document.getElementById("student-q");
  var pickedHint = document.getElementById("picked-hint");
  var saveBtn = document.getElementById("save-btn");
  var msgEl = document.getElementById("msg");
  var logoutBtn = document.getElementById("logout-btn");

  var teachers = [];
  var students = [];
  var selected = {};
  var activeTeacherId = 0;

  function token() {
    try {
      return localStorage.getItem("yysd:teacher:token") ||
        localStorage.getItem("yysd:auth:token") || "";
    } catch (e) { return ""; }
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function showMsg(text, ok) {
    msgEl.textContent = text || "";
    msgEl.className = "auth-msg" + (ok ? " auth-msg--ok" : text ? " auth-msg--err" : "");
  }

  function api(path, opts) {
    opts = opts || {};
    var h = { "Content-Type": "application/json" };
    var t = token();
    if (t) h.Authorization = "Bearer " + t;
    return fetch(API_BASE + path, {
      method: opts.method || "GET",
      headers: h,
      body: opts.body ? JSON.stringify(opts.body) : undefined
    }).then(function (r) {
      return r.json().then(function (d) {
        if (!r.ok) throw new Error((d && d.error) || "yêu cầuThất bại");
        return d;
      });
    });
  }

  if (!token()) {
    location.replace("login.html?next=" + encodeURIComponent("admin-assign.html"));
    return;
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      if (A && A.logout) A.logout();
      else {
        try {
          localStorage.removeItem("yysd:teacher:token");
          localStorage.removeItem("yysd:auth:token");
        } catch (e) {}
        location.href = "index.html";
      }
    });
  }

  function studentLabel(s) {
    return (s.displayName ? s.displayName + " · " : "") + (s.phone || ("#" + s.id));
  }

  function renderStudents() {
    if (!activeTeacherId) {
      studentList.innerHTML = '<p class="profile-hint">mời trướcChọnGiáo viên</p>';
      pickedHint.textContent = "mời trướcChọnGiáo viên";
      saveBtn.disabled = true;
      return;
    }
    var q = (studentQ.value || "").trim().toLowerCase();
    var visible = students.filter(function (s) {
      if (!q) return true;
      return studentLabel(s).toLowerCase().indexOf(q) >= 0;
    });
    studentList.innerHTML = visible.map(function (s) {
      var checked = selected[s.id] ? " checked" : "";
      return '<label class="cal-check">' +
        '<input type="checkbox" data-sid="' + s.id + '"' + checked + ">" +
        "<span><b>" + esc(s.displayName || "chưa có tiêu đề") + "</b>" +
        "<small>" + esc(s.phone) +
        (s.scoreCount ? " · " + s.scoreCount + " dảiKết quả" : "") +
        "</small></span></label>";
    }).join("") || '<p class="profile-hint">không cóGhép nốiHọc viên</p>';

    var n = Object.keys(selected).length;
    pickedHint.textContent = "đã chọn " + n + " thuật ngữ cổ logicđược sinh(Lưuhọ sẽche phủnênGiáo viênthời điểm hiện tạidanh sách tên)";
    saveBtn.disabled = false;
  }

  function loadAssignments(teacherId) {
    selected = {};
    return api("/api/admin/assignments?teacherId=" + teacherId).then(function (d) {
      (d.studentIds || []).forEach(function (id) { selected[id] = true; });
      renderStudents();
    });
  }

  teacherSelect.addEventListener("change", function () {
    activeTeacherId = Number(teacherSelect.value) || 0;
    showMsg("");
    if (!activeTeacherId) {
      selected = {};
      renderStudents();
      return;
    }
    loadAssignments(activeTeacherId).catch(function (e) { showMsg(e.message); });
  });

  studentQ.addEventListener("input", renderStudents);

  studentList.addEventListener("change", function (e) {
    var t = e.target;
    if (!t || !t.getAttribute("data-sid")) return;
    var id = Number(t.getAttribute("data-sid"));
    if (t.checked) selected[id] = true;
    else delete selected[id];
    pickedHint.textContent = "đã chọn " + Object.keys(selected).length + " thuật ngữ cổ logicđược sinh(Lưuhọ sẽche phủnênGiáo viênthời điểm hiện tạidanh sách tên)";
  });

  document.getElementById("select-all").addEventListener("click", function () {
    if (!activeTeacherId) return;
    var q = (studentQ.value || "").trim().toLowerCase();
    students.forEach(function (s) {
      if (q && studentLabel(s).toLowerCase().indexOf(q) < 0) return;
      selected[s.id] = true;
    });
    renderStudents();
  });

  document.getElementById("clear-all").addEventListener("click", function () {
    selected = {};
    renderStudents();
  });

  saveBtn.addEventListener("click", function () {
    if (!activeTeacherId) return;
    showMsg("Lưuhình thức kết hợp Trung Quốc…");
    saveBtn.disabled = true;
    api("/api/admin/assignments", {
      method: "PUT",
      body: {
        teacherId: activeTeacherId,
        studentIds: Object.keys(selected).map(Number)
      }
    }).then(function (d) {
      showMsg("đãLưu:nênGiáo viênhiện có " + (d.studentIds || []).length + " thuật ngữ cổ logicđược sinh", true);
      saveBtn.disabled = false;
    }).catch(function (e) {
      showMsg(e.message);
      saveBtn.disabled = false;
    });
  });

  Promise.all([
    api("/api/admin/teachers"),
    api("/api/admin/students")
  ]).then(function (res) {
    teachers = res[0].teachers || [];
    students = res[1].students || [];
    teacherSelect.innerHTML = '<option value="">mờiChọnGiáo viên</option>' +
      teachers.map(function (t) {
        return '<option value="' + t.id + '">' +
          esc((t.name || "Giáo viên") + " · " + t.phone + "(đãphân phối " + t.studentCount + " người)") +
          "</option>";
      }).join("");
    renderStudents();
  }).catch(function (e) {
    showMsg(e.message || "không cóngười quản lýQuyền hạn,mờisử dụngngười quản lýTài khoảnĐăng nhập");
    teacherSelect.innerHTML = '<option value="">không thểTải</option>';
    if (String(e.message).indexOf("người quản lý") >= 0 || String(e.message).indexOf("Đăng nhập") >= 0) {
      setTimeout(function () {
        location.href = "login.html?next=" + encodeURIComponent("admin-assign.html");
      }, 1200);
    }
  });
})();
