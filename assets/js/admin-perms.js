/* =========================================================================
   admin-perms.js - batch grant/revoke access (admin only)
   scope=practice toàn bộ luyện tập khu vực; scope=package:<cuộn lại id> đơn lẻ đánh trước chạy nước rút che phủ
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
        if (!r.ok) throw new Error((d && d.error) || " yêu cầu bị đánh bại ");
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
    return (d.getMonth() + 1) + " tháng " + d.getDate() + " viết tắt của " + p(d.getHours()) + ":" + p(d.getMinutes());
  }

  /* st = phục vụ cuối coi như tốt của state({on,reason,startAt,expireAt}) */
  function stateInfo(st) {
    if (!st) return { cls: "cal-status--none", text: " chưa mở ", when: "" };
    if (st.on) return { cls: "cal-status--done", text: " đã mở ", when: st.expireAt ? fmtWhen(st.expireAt) + " đến hạn " : " dài hạn hiệu quả " };
    if (st.reason === "scheduled") return { cls: "cal-status--pending", text: " ấn định thời gian mở ", when: fmtWhen(st.startAt) + " mở " };
    if (st.reason === "expired") return { cls: "cal-status--overdue", text: " đã đến hạn ", when: " đến hạn đi " + fmtWhen(st.expireAt) };
    return { cls: "cal-status--off", text: " đã ngừng sử dụng ", when: "" };
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
    return o ? o.textContent : " Khu vực luyện tập ";
  }
  function isPkg() { return scope.indexOf("package:") === 0; }
  /* đánh trước chạy nước rút che phủ đóng cửa là gia hạn(làm xong bài thi gốc sân phơi); luyện tập khu vực ngừng sử dụng là ngay lập tức nộp bài thi */
  function offHint() {
    return isPkg() ? " đang ở đánh của có thể làm xong bài thi gốc sân phơi, chưa bắt đầu của không thể lại tiến lên " : " tiến hành bắn trúng mục tiêu trả lời có thể ngay lập tức nộp bài thi ";
  }

  function loadPackages() {
    if (!scopeSel) return Promise.resolve();
    return api("/api/toefl/packages").then(function (d) {
      (d.packages || []).forEach(function (p) {
        var opt = document.createElement("option");
        opt.value = "package:" + p.id;
        opt.textContent = " đánh trước chạy nước rút che phủ · " + p.title + (p.kind === "single" ? "(hóa đơn ngành học)" : "");
        scopeSel.appendChild(opt);
      });
    }).catch(function () { /* lấy không đến trong trường hợp đó chỉ hiển thị luyện tập khu vực */ });
  }

  function updateFoot() {
    var n = Object.keys(selected).length;
    pickedHint.textContent = n ? (" đã chọn " + n + " logic được sinh ") : " chọn học sinh, thiết lập thời gian hoàng hậu mở ";
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
        "<span><b>" + esc(s.displayName || " chưa có tiêu đề ") + "</b><small>" + esc(s.phone || "") + "</small></span>" +
        stateChip(stateOf(s.id)) + "</label>";
    }).join("") || '<p class="profile-hint">không có phối hoặc kết hôn của học sinh</p>';
    updateFoot();
  }

  function renderLedger() {
    if (!grantRows.length) {
      grantList.innerHTML = '<p class="profile-hint">tạm thời không có ủy quyền ghi chép</p>';
      return;
    }
    grantList.innerHTML = grantRows.map(function (g) {
      var i = stateInfo(g.state);
      var meta = [g.phone || "", i.when, g.updatedByName ? g.updatedByName + " làm việc " : ""]
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
    showMsg(" bảo tồn Trung Quốc...", true);
    grantBtn.disabled = true;
    revokeBtn.disabled = true;
    return api("/api/admin/grants", { method: "POST", body: body }).then(function (d) {
      selected = {};
      return loadGrants().then(function () {
        showMsg(body.action === "off" ? (" đã ngừng sử dụng " + d.count + " người ") : (" đã mở " + d.count + " người "), true);
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
    if (action === "off" && !window.confirm(" ngừng sử dụng này " + ids.length + " logic được sinh của«" + scopeName() + "»phạm vi quyền hạn? " + offHint())) return;
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
    if (!window.confirm(" lấy lại«" + (g.name || "#" + id) + "»của«" + scopeName() + "»phạm vi quyền hạn? " + offHint())) return;
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
    showMsg(e.message || " không có người quản lý phạm vi quyền hạn, mời sử dụng người quản lý số tài khoản đăng ký ");
    studentList.innerHTML = '<p class="profile-hint">không thể tải</p>';
    grantList.innerHTML = '<p class="profile-hint">không thể tải</p>';
    // ponytail: đã đăng ký nhưng vai trò không chính xác biến thể cũ của | biến thể cũ của tồn tại nơi ban đầu chăm sóc chỉ ra; đi login có thể chăn đã đăng ký hội thoại hình dạng gốc nảy lại, thực hiện một chuyến đi khứ hồi nhảy
    if (String(e.message).indexOf(" người quản lý ") < 0) {
      setTimeout(function () {
        location.href = "login.html?next=" + encodeURIComponent("admin-perms.html");
      }, 1200);
    }
  });
})();
