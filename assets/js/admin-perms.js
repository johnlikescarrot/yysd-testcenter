/* =========================================================================
   admin-perms.js — batch grant/revoke access (admin only)
   scope=practice toàn bộ Khu luyện tập; scope=package:< cuốn id> một cái Gói tăng tốc trước kỳ thi
   ========================================================================= */
(function () {
  "use strict";
  var A = window.YYSD_AUTH;
  var API_BASE = (A && A.API_BASE) || "https://api.youyisida.com";
  var scope = "practice";
  var scopeSel = document.getElementById("scope-select");
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var studentList = document.getElementById("student-list");
  var studentQ = document.getElementById("student-q");
  var pickedHint = document.getElementById("picked-hint");
  var grantBtn = document.getElementById("grant-btn");
  var revokeBtn = document.getElementById("revoke-btn");
  var startAt = document.getElementById("start-at");
  var expireAt = document.getElementById("expire-at");
  var grantList = document.getElementById("grant-list");
  var msgEl = document.getElementById("msg");
  var logoutBtn = document.getElementById("logout-btn");

  var students = [];
  var grants = {};
  var grantRows = [];
  var selected = {};

  function token() {
    try {
      return localStorage.getItem("yysd:teacher:token") ||
        localStorage.getItem("yysd:auth:token") || "";
    } catch (e) { return ""; }
  }

  function esc(s) {
    return String(s == null? "": s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function showMsg(text, ok) {
    msgEl.textContent = text || "";
    msgEl.className = "auth-msg" + (ok? " auth-msg--ok": text? " auth-msg--err": "");
  }

  function api(path, opts) {
    opts = opts || {};
    var h = { "Content-Type": "application/json" };
    var t = token();
    if (t) h.Authorization = "Bearer " + t;
    return fetch(API_BASE + path, {
      method: opts.method || "GET",
      headers: h,
      body: opts.body? JSON.stringify(opts.body): undefined
    }).then(function (r) {
      return r.json().then(function (d) {
        if (!r.ok) throw new Error((d && d.error) || "Yêu cầu thất bại");
        return d;
      });
    });
  }

  if (!token()) {
    location.replace("login.html?next=" + encodeURIComponent("admin-perms.html"));
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
    return (s.displayName? s.displayName + " · ": "") + (s.phone || ("#" + s.id));
  }

  function fmtWhen(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    var p = function (n) { return (n < 10? "0": "") + n; };
    return (d.getMonth() + 1) + " tháng " + d.getDate() + " ngày " + p(d.getHours()) + ":" + p(d.getMinutes());
  }

  /* st = Server coi là tốt state ({on,reason,startAt,expireAt}) */
  function stateInfo(st) {
    if (!st) return { cls: "cal-status--none", text: " không kích hoạt ", when: "" };
    if (st.on) return { cls: "cal-status--done", text: " Đã kích hoạt ", when: st.expireAt? fmtWhen(st.expireAt) + " đến kỳ ": " trường kỳ hữu hiệu " };
    if (st.reason === "scheduled") return { cls: "cal-status--pending", text: " Hẹn giờ mở ", when: fmtWhen(st.startAt) + " Mở " };
    if (st.reason === "expired") return { cls: "cal-status--overdue", text: " Đã hết hạn ", when: " Hết hạn lúc " + fmtWhen(st.expireAt) };
    return { cls: "cal-status--off", text: " Đã tạm ngưng ", when: "" };
  }

  function stateChip(st) {
    var i = stateInfo(st);
    return '<span class="cal-status-pill ' + i.cls + '"' +
      (i.when? ' title="' + esc(i.when) + '"': "") + ">" + i.text + "</span>";
  }

  function stateOf(id) {
    return grants[id]? grants[id].state: null;
  }

  function scopeName() {
    var o = scopeSel && scopeSel.options[scopeSel.selectedIndex];
    return o? o.textContent: " Khu luyện tập ";
  }
  function isPkg() { return scope.indexOf("package:") === 0; }
  /* Gói tăng tốc trước kỳ thi màn ngừng là thư thả (thi xong bổn tràng); Khu luyện tập Tạm ngưng là lập tức Nộp bài */
  function offHint() {
    return isPkg()? " đang thi có thể thi xong bổn tràng, không bắt đầu không thể lại vào. ": " đang tiến hành đáp lại sẽ lập tức Nộp bài. ";
  }

  function loadPackages() {
    if (!scopeSel) return Promise.resolve();
    return api("/api/toefl/packages").then(function (d) {
      (d.packages || []).forEach(function (p) {
        var opt = document.createElement("option");
        opt.value = "package:" + p.id;
        opt.textContent = " Gói tăng tốc trước kỳ thi · " + p.title + (p.kind === "single"? " (Đơn kỹ năng) ": "");
        scopeSel.appendChild(opt);
      });
    }).catch(function () { /* không lấy được cũng chỉ biểu hiện Khu luyện tập */ });
  }

  function updateFoot() {
    var n = Object.keys(selected).length;
    pickedHint.textContent = n? (" Đã chọn " + n + " danh học sinh "): " phác thảo chọn Học viên, thiết trí thời gian sau kích hoạt ";
    grantBtn.disabled =!n;
    revokeBtn.disabled =!n;
  }

  function renderStudents() {
    var q = (studentQ.value || "").trim().toLowerCase();
    var visible = students.filter(function (s) {
      if (!q) return true;
      return studentLabel(s).toLowerCase().indexOf(q) >= 0;
    });
    studentList.innerHTML = visible.map(function (s) {
      return '<label class="cal-check">' +
        '<input type="checkbox" data-sid="' + s.id + '"' + (selected[s.id]? " checked": "") + ">" +
        "<span><b>" + esc(s.displayName || " không mệnh danh ") + "</b><small>" + esc(s.phone || "") + "</small></span>" +
        stateChip(stateOf(s.id)) + "</label>";
    }).join("") || '<p class="profile-hint"> không có thất phối Học viên </p>';
    updateFoot();
  }

  function renderLedger() {
    if (!grantRows.length) {
      grantList.innerHTML = '<p class="profile-hint"> tạm thời chưa có trao quyền ghi chép </p>';
      return;
    }
    grantList.innerHTML = grantRows.map(function (g) {
      var i = stateInfo(g.state);
      var meta = [g.phone || "", i.when, g.updatedByName? g.updatedByName + " thao tác ": ""]
        .filter(Boolean).join(" · ");
      return '<div class="perm-row">' +
        '<div class="perm-row__main"><b>' + esc(g.name || ("#" + g.userId)) + "</b>" +
        "<small>" + esc(meta) + "</small></div>" +
        stateChip(g.state) +
        '<button type="button" class="btn btn--ghost btn--sm" data-revoke="' + g.userId + '"> thu hồi </button>' +
        "</div>";
    }).join("");
  }

  function loadGrants() {
    return api("/api/admin/grants?scope=" + encodeURIComponent(scope)).then(function (d) {
      grantRows = d.grants || [];
      grants = {};
      grantRows.forEach(function (g) { grants[g.userId] = g; });
      renderLedger();
      renderStudents();
    });
  }

  function post(body) {
    showMsg(" Lưu Vừa …", true);
    grantBtn.disabled = true;
    revokeBtn.disabled = true;
    return api("/api/admin/grants", { method: "POST", body: body }).then(function (d) {
      selected = {};
      return loadGrants().then(function () {
        showMsg(body.action === "off"? (" Đã tạm ngưng " + d.count + " người "): (" Đã kích hoạt " + d.count + " người "), true);
      });
    }).catch(function (e) {
      showMsg(e.message);
    }).then(function () {
      updateFoot();
    });
  }

  function batch(action) {
    var ids = Object.keys(selected).map(Number);
    if (!ids.length) return;
    if (action === "off" &&!window.confirm(" Tạm ngưng cái này " + ids.length + " danh học sanh «" + scopeName() + "» quyền hạn? " + offHint())) return;
    var body = { studentIds: ids, scope: scope, action: action };
    if (action!== "off") {
      body.startAt = startAt.value? new Date(startAt.value).toISOString(): "";
      body.expireAt = expireAt.value? new Date(expireAt.value).toISOString(): "";
    }
    post(body);
  }

  studentQ.addEventListener("input", renderStudents);

  studentList.addEventListener("change", function (e) {
    var t = e.target;
    if (!t ||!t.getAttribute("data-sid")) return;
    var id = Number(t.getAttribute("data-sid"));
    if (t.checked) selected[id] = true;
    else delete selected[id];
    updateFoot();
  });

  document.getElementById("select-all").addEventListener("click", function () {
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

  grantBtn.addEventListener("click", function () { batch("on"); });
  revokeBtn.addEventListener("click", function () { batch("off"); });

  grantList.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-revoke]");
    if (!btn) return;
    var id = Number(btn.getAttribute("data-revoke"));
    var g = grants[id];
    if (!g) return;
    if (!window.confirm(" thu hồi «" + (g.name || "#" + id) + "» «" + scopeName() + "» quyền hạn? " + offHint())) return;
    post({ studentIds: [id], scope: scope, action: "off" });
  });

  if (scopeSel) {
    scopeSel.addEventListener("change", function () {
      scope = scopeSel.value;
      selected = {};
      renderStudents();
      showMsg("");
      loadGrants().catch(function (e) { showMsg(e.message); });
    });
  }

  loadPackages();
  api("/api/admin/students").then(function (d) {
    students = d.students || [];
    renderStudents();
    return loadGrants();
  }).catch(function (e) {
    showMsg(e.message || " Không Quản trị viên quyền hạn, xin sử dụng Quản trị viên tài khoản Đăng nhập ");
    studentList.innerHTML = '<p class="profile-hint"> không cách nào thêm năm </p>';
    grantList.innerHTML = '<p class="profile-hint"> không cách nào thêm năm </p>';
    // ponytail: đã Đăng nhập nhưng nhân vật không đúng lúc ở lại tại chỗ nhìn nhắc nhở; đi login sẽ bị đã Đăng nhập hội thoại nguyên dạng bắn ra quay về, qua lại nhảy
    if (String(e.message).indexOf(" Quản trị viên ") < 0) {
      setTimeout(function () {
        location.href = "login.html?next=" + encodeURIComponent("admin-perms.html");
      }, 1200);
    }
  });
})();
