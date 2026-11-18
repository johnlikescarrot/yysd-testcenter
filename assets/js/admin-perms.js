/* =========================================================================
   admin-perms.js — batch grant/revoke access (admin only)
   scope=practice toàn bộKhu vực Luyện tập;scope=package:<cuộn lạiid> đơn lẻđánh trướcthể thao chạy nước rúthọ
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
    return (s.displayName ? s.displayName + " · " : "") + (s.phone || ("#" + s.id));
  }

  function fmtWhen(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    return (d.getMonth() + 1) + "mặt trăng" + d.getDate() + "viết tắt của " + p(d.getHours()) + ":" + p(d.getMinutes());
  }

  /* st = phục vụcuối coi như tốt state({on,reason,startAt,expireAt}) */
  function stateInfo(st) {
    if (!st) return { cls: "cal-status--none", text: "chưamở đường mới hoặc tuyến đường sắt", when: "" };
    if (st.on) return { cls: "cal-status--done", text: "đãmở đường mới hoặc tuyến đường sắt", when: st.expireAt ? fmtWhen(st.expireAt) + " đến hạn khoản vay" : "dài hạnhiệu quả" };
    if (st.reason === "scheduled") return { cls: "cal-status--pending", text: "ấn định thời gianmở", when: fmtWhen(st.startAt) + " mở" };
    if (st.reason === "expired") return { cls: "cal-status--overdue", text: "đãđến hạn khoản vay", when: "đến hạn khoản vayhọ " + fmtWhen(st.expireAt) };
    return { cls: "cal-status--off", text: "đãngừng sử dụng", when: "" };
  }

  function stateChip(st) {
    var i = stateInfo(st);
    return '<span class="cal-status-pill ' + i.cls + '"' +
      (i.when ? ' title="' + esc(i.when) + '"' : "") + ">" + i.text + "</span>";
  }

  function stateOf(id) {
    return grants[id] ? grants[id].state : null;
  }

  function scopeName() {
    var o = scopeSel && scopeSel.options[scopeSel.selectedIndex];
    return o ? o.textContent : "Khu vực Luyện tập";
  }
  function isPkg() { return scope.indexOf("package:") === 0; }
  /* đánh trướcthể thao chạy nước rúthọcủa nhà máy điệnlà chỉ theo sau bởi danh từgia hạn thời hạn(làm xong bài thihình thức kết hợp gốc sân phơi);Khu vực Luyện tậpngừng sử dụnglà chỉ theo sau bởi danh từngay lập tứcNộp bài */
  function offHint() {
    return isPkg() ? "đang ở thời điểm đóđánhcó thểlàm xong bài thihình thức kết hợp gốc sân phơi,Chưa bắt đầukhông thểlại tiến lên." : "Đang thực hiệntrả lờicó thểngay lập tứcNộp bài.";
  }

  function loadPackages() {
    if (!scopeSel) return Promise.resolve();
    return api("/api/toefl/packages").then(function (d) {
      (d.packages || []).forEach(function (p) {
        var opt = document.createElement("option");
        opt.value = "package:" + p.id;
        opt.textContent = "đánh trướcthể thao chạy nước rúthọ · " + p.title + (p.kind === "single" ? "(họ ngành học)" : "");
        scopeSel.appendChild(opt);
      });
    }).catch(function () { /* lấykhông đếnsau một mệnh đề giả định trong trường hợp đó chỉhiển thịKhu vực Luyện tập */ });
  }

  function updateFoot() {
    var n = Object.keys(selected).length;
    pickedHint.textContent = n ? ("đã chọn " + n + " thuật ngữ cổ logicđược sinh") : "chọn một hoặc nhiều lựa chọn từ danh sáchHọc viên,Cài đặtThời gianhọmở đường mới hoặc tuyến đường sắt";
    grantBtn.disabled = !n;
    revokeBtn.disabled = !n;
  }

  function renderStudents() {
    var q = (studentQ.value || "").trim().toLowerCase();
    var visible = students.filter(function (s) {
      if (!q) return true;
      return studentLabel(s).toLowerCase().indexOf(q) >= 0;
    });
    studentList.innerHTML = visible.map(function (s) {
      return '<label class="cal-check">' +
        '<input type="checkbox" data-sid="' + s.id + '"' + (selected[s.id] ? " checked" : "") + ">" +
        "<span><b>" + esc(s.displayName || "chưa có tiêu đề") + "</b><small>" + esc(s.phone || "") + "</small></span>" +
        stateChip(stateOf(s.id)) + "</label>";
    }).join("") || '<p class="profile-hint">không cóGhép nốiHọc viên</p>';
    updateFoot();
  }

  function renderLedger() {
    if (!grantRows.length) {
      grantList.innerHTML = '<p class="profile-hint">tạm thời không cóủy quyềnghi chép</p>';
      return;
    }
    grantList.innerHTML = grantRows.map(function (g) {
      var i = stateInfo(g.state);
      var meta = [g.phone || "", i.when, g.updatedByName ? g.updatedByName + " làm việc" : ""]
        .filter(Boolean).join(" · ");
      return '<div class="perm-row">' +
        '<div class="perm-row__main"><b>' + esc(g.name || ("#" + g.userId)) + "</b>" +
        "<small>" + esc(meta) + "</small></div>" +
        stateChip(g.state) +
        '<button type="button" class="btn btn--ghost btn--sm" data-revoke="' + g.userId + '">lấy lại</button>' +
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
    showMsg("Lưuhình thức kết hợp Trung Quốc…", true);
    grantBtn.disabled = true;
    revokeBtn.disabled = true;
    return api("/api/admin/grants", { method: "POST", body: body }).then(function (d) {
      selected = {};
      return loadGrants().then(function () {
        showMsg(body.action === "off" ? ("đãngừng sử dụng " + d.count + " người") : ("đãmở đường mới hoặc tuyến đường sắt " + d.count + " người"), true);
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
    if (action === "off" && !window.confirm("ngừng sử dụngđại từ này " + ids.length + " thuật ngữ cổ logicđược sinh«" + scopeName() + "»Quyền hạn?" + offHint())) return;
    var body = { studentIds: ids, scope: scope, action: action };
    if (action !== "off") {
      body.startAt = startAt.value ? new Date(startAt.value).toISOString() : "";
      body.expireAt = expireAt.value ? new Date(expireAt.value).toISOString() : "";
    }
    post(body);
  }

  studentQ.addEventListener("input", renderStudents);

  studentList.addEventListener("change", function (e) {
    var t = e.target;
    if (!t || !t.getAttribute("data-sid")) return;
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
    if (!window.confirm("lấy lại«" + (g.name || "#" + id) + "»«" + scopeName() + "»Quyền hạn?" + offHint())) return;
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
    showMsg(e.message || "không cóngười quản lýQuyền hạn,mờisử dụngngười quản lýTài khoảnĐăng nhập");
    studentList.innerHTML = '<p class="profile-hint">không thểTải</p>';
    grantList.innerHTML = '<p class="profile-hint">không thểTải</p>';
    // ponytail: đãĐăng nhậpnhưngvai tròkhông chính xácbiến thể cũ của biến thể cũ của tồn tạiở nơi ban đầuchăm sócGợi ý;đi login có thể chăn đãĐăng nhậphọc ngôn ngữ hội thoạihình dạng gốcnảy lại,thực hiện một chuyến đi khứ hồinhảy
    if (String(e.message).indexOf("người quản lý") < 0) {
      setTimeout(function () {
        location.href = "login.html?next=" + encodeURIComponent("admin-perms.html");
      }, 1200);
    }
  });
})();
