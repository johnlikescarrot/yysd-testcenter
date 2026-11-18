/* platform.js — platform super-admin console */
(function () {
  "use strict";

  var A = window.YYSD_AUTH;
  if (!A) return;

  function msg(t, ok) {
    var el = document.getElementById("plat-msg");
    if (!el) return;
    el.style.color = ok? "#2e7d32": "#c62828";
    el.textContent = t || "";
  }

  function badge(org) {
    if (org.status === "suspended" ||!org.usable) {
      return '<span class="plat-badge plat-badge--bad"> Đã tạm ngưng </span>';
    }
    if (org.expiringSoon) {
      return '<span class="plat-badge plat-badge--warn"> sắp đến kỳ </span>';
    }
    if (org.status === "trial") {
      return '<span class="plat-badge plat-badge--warn"> dùng thử </span>';
    }
    return '<span class="plat-badge plat-badge--ok"> bình thường </span>';
  }

  function hostBase() {
    var h = location.hostname;
    if (h === "localhost" || h === "127.0.0.1") return h + (location.port? ":" + location.port: "");
    return h.replace(/^[^.]+\./, "") === "youyisida.com" || h.indexOf("youyisida.com") >= 0
      ? "youyisida.com"
      : h;
  }

  function orgUrl(slug) {
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
      return location.origin + "/?tenant=" + encodeURIComponent(slug);
    }
    return "https://" + slug + "." + hostBase().replace(/^www\./, "");
  }

  function renderList(orgs) {
    var box = document.getElementById("plat-list");
    var warn = document.getElementById("plat-expiring");
    var soon = (orgs || []).filter(function (o) { return o.expiringSoon; });
    if (soon.length) {
      warn.hidden = false;
      warn.textContent = " sắp đến kỳ (14 ngày bên trong): " + soon.map(function (o) {
        return o.name + " (thừa " + o.expiresInDays + " ngày) ";
      }).join(", ");
    } else {
      warn.hidden = true;
    }

    box.innerHTML = (orgs || []).map(function (o) {
      return (
        '<article class="plat-card" data-id="' + o.id + '">' +
          '<div class="plat-card__top">' +
            '<div><span class="plat-card__name">' + escapeHtml(o.name) + "</span> " + badge(o) +
            '<div class="plat-card__meta">' + escapeHtml(o.slug) + ".… · Quản trị viên " +
            escapeHtml(o.adminPhone || " không thiết ") +
            (o.expiresAt? " · đến kỳ " + String(o.expiresAt).slice(0, 10): " · không ngày quy định ") +
            "</div></div>" +
            (o.logoUrl? '<img src="' + A.logoSrc(o.logoUrl) + '" alt="" width="40" height="40" style="border-radius:6px;object-fit:cover">': "") +
          "</div>" +
          '<div class="plat-card__stats">' +
            "<span> Học viên " + o.studentCount + "</span>" +
            "<span> Giáo viên " + o.teacherCount + "</span>" +
            "<span>7 ngày sinh động " + o.active7d + "</span>" +
            "<span>30 ngày sinh động " + o.active30d + "</span>" +
          "</div>" +
          '<div class="plat-card__actions">' +
            '<a class="btn btn--ghost btn--sm" href="' + orgUrl(o.slug) + '" target="_blank" rel="noopener"> mở ra trạm điểm[web] </a>' +
            '<button type="button" class="btn btn--ghost btn--sm" data-act="edit"> biên tập </button>' +
            (o.status === "suspended"
              ? '<button type="button" class="btn btn--primary btn--sm" data-act="activate"> khôi phục kích hoạt </button>'
              : '<button type="button" class="btn btn--ghost btn--sm" data-act="suspend"> màn ngừng </button>') +
            (o.slug!== "yysd"
              ? '<button type="button" class="btn btn--ghost btn--sm" data-act="keys"> Mã khóa đăng ký </button>'
              : "") +
            '<button type="button" class="btn btn--primary btn--sm" data-act="impersonate"> phục vụ khách hàng Vào học </button>' +
          "</div>" +
        "</article>"
      );
    }).join("") || "<p> tạm thời chưa có cơ cấu </p>";
  }

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  function load() {
    return A.api("/api/platform/orgs").then(function (d) {
      renderList(d.orgs || []);
      return d;
    }).then(function () {
      return A.api("/api/platform/audit");
    }).then(function (d) {
      var ul = document.getElementById("plat-audit-list");
      ul.innerHTML = (d.logs || []).slice(0, 30).map(function (l) {
        return "<li>" + escapeHtml(l.createdAt) + " · " + escapeHtml(l.actorPhone) +
          " · " + escapeHtml(l.action) + " · " + escapeHtml(l.detail) + "</li>";
      }).join("") || "<li> tạm thời chưa có </li>";
    });
  }

  function fileToDataUrl(file) {
    return new Promise(function (resolve, reject) {
      if (!file) return resolve("");
      var r = new FileReader();
      r.onload = function () { resolve(String(r.result || "")); };
      r.onerror = function () { reject(new Error(" đọc đến hình ảnh thất bại ")); };
      r.readAsDataURL(file);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    // bàn điều khiển chỉ cho phép tổng bộ đứng youyisida.com (slug=yysd)
    if (A.isHqSite &&!A.isHqSite()) {
      msg(" Bảng điều khiển hệ thống chỉ có thể tại YYSD tổng bộ trang web sử dụng. ");
      return;
    }
    if (!A.getToken()) {
      location.replace((window.YYSD_TEACHER? "teacher-login.html": "login.html") +
        "?next=" + encodeURIComponent("platform.html"));
      return;
    }
    var logoutBtn = document.getElementById("logout-btn") || document.getElementById("plat-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        if (window.YYSD_TEACHER && YYSD_TEACHER.getToken && YYSD_TEACHER.getToken()) YYSD_TEACHER.logout();
        else A.logout();
      });
    }

    function gateThenLoad() {
      return A.api("/api/auth/me").then(function (d) {
        var u = d.user || {};
        if (!u.isPlatformAdmin) {
          msg(" trước mắt tài khoản không cách nào Vào học Bảng điều khiển hệ thống. ");
          return null;
        }
        A.setUser({
          phone: u.phone || "",
          role: u.role || "",
          displayName: u.displayName || u.name || "",
          avatarUrl: u.avatarUrl || "",
          isAdmin:!!u.isAdmin,
          isPlatformAdmin: true
        });
        return load();
      });
    }

    document.getElementById("c-submit").addEventListener("click", function () {
      var body = {
        name: document.getElementById("c-name").value.trim(),
        slug: document.getElementById("c-slug").value.trim().toLowerCase(),
        adminPhone: document.getElementById("c-admin").value.trim(),
        expiresAt: document.getElementById("c-expires").value
          ? new Date(document.getElementById("c-expires").value + "T23:59:59").toISOString()
          : null,
        contractNote: document.getElementById("c-note").value.trim(),
        status: "trial"
      };
      A.api("/api/platform/orgs", { method: "POST", body: body }).then(function () {
        msg(" đã sáng tạo ", true);
        document.getElementById("c-name").value = "";
        document.getElementById("c-slug").value = "";
        return load();
      }).catch(function (e) { msg(e.message || " sáng tạo thất bại "); });
    });

    var dlg = document.getElementById("plat-edit");
    var editing = null;
    var keysDlg = document.getElementById("plat-keys");
    var keysOrgId = 0;

    function randKey(prefix) {
      var s = Math.random().toString(36).slice(2, 6).toUpperCase() +
        Math.random().toString(36).slice(2, 6).toUpperCase();
      return prefix + "-" + s;
    }

    function fillKeysForm(keys) {
      ["student", "teacher", "org_admin"].forEach(function (role) {
        var row = (keys || []).filter(function (k) { return k.role === role; })[0] || {};
        document.getElementById("k-" + role + "-key").value = row.keyValue || "";
        document.getElementById("k-" + role + "-max").value = row.maxUses!= null? row.maxUses: 0;
        document.getElementById("k-" + role + "-used").textContent =
          " Đã dùng " + (row.usedCount || 0) + " / " + (row.maxUses || 0);
      });
    }

    function openKeysDialog(id) {
      keysOrgId = id;
      A.api("/api/platform/orgs/" + id + "/reg-keys")
        .then(function (d) {
          document.getElementById("k-org-name").textContent = (d.name || "") + " · " + (d.slug || "");
          fillKeysForm(d.keys || []);
          keysDlg.showModal();
        })
        .catch(function (e) { msg(e.message); });
    }

    document.getElementById("plat-keys").addEventListener("click", function (ev) {
      var btn = ev.target.closest("[data-k-act]");
      if (!btn) return;
      var act = btn.getAttribute("data-k-act");
      var role = btn.getAttribute("data-role");
      if (act === "gen" && role) {
        var prefix = role === "student"? "STU": role === "teacher"? "TCH": "ADM";
        document.getElementById("k-" + role + "-key").value = randKey(prefix);
        document.getElementById("k-" + role + "-reset").checked = true;
        return;
      }
      if (act === "add" && role) {
        var maxEl = document.getElementById("k-" + role + "-max");
        var n = Math.max(0, Math.floor(Number(maxEl.value) || 0));
        maxEl.value = n + 10;
        return;
      }
    });

    document.getElementById("plat-keys-form").addEventListener("submit", function (ev) {
      var val = ev.submitter && ev.submitter.value;
      if (val === "cancel") return;
      ev.preventDefault();
      if (!keysOrgId) return;
      var keys = ["student", "teacher", "org_admin"].map(function (role) {
        return {
          role: role,
          keyValue: document.getElementById("k-" + role + "-key").value.trim(),
          maxUses: Math.max(0, Math.floor(Number(document.getElementById("k-" + role + "-max").value) || 0)),
          resetUsed:!!document.getElementById("k-" + role + "-reset").checked
        };
      });
      A.api("/api/platform/orgs/" + keysOrgId + "/reg-keys", {
        method: "PUT",
        body: { keys: keys }
      }).then(function (d) {
        fillKeysForm(d.keys || []);
        ["student", "teacher", "org_admin"].forEach(function (role) {
          document.getElementById("k-" + role + "-reset").checked = false;
        });
        msg(" Mã khóa đăng ký đã Lưu ", true);
        keysDlg.close();
      }).catch(function (e) { msg(e.message || " Lưu thất bại "); });
    });

    document.getElementById("plat-list").addEventListener("click", function (ev) {
      var btn = ev.target.closest("[data-act]");
      if (!btn) return;
      var card = btn.closest(".plat-card");
      var id = Number(card && card.getAttribute("data-id"));
      if (!id) return;
      var act = btn.getAttribute("data-act");

      if (act === "suspend") {
        if (!confirm(" Xác nhận màn ngừng nên cơ cấu? đối phương đem không cách nào Đăng nhập. ")) return;
        A.api("/api/platform/orgs/" + id + "/suspend", { method: "POST", body: {} })
          .then(load).catch(function (e) { msg(e.message); });
        return;
      }
      if (act === "activate") {
        A.api("/api/platform/orgs/" + id + "/activate", { method: "POST", body: {} })
          .then(load).catch(function (e) { msg(e.message); });
        return;
      }
      if (act === "keys") {
        openKeysDialog(id);
        return;
      }
      if (act === "impersonate") {
        A.api("/api/platform/orgs/" + id + "/impersonate", { method: "POST", body: {} })
          .then(function (d) {
            if (d.entryUrl) {
              window.open(d.entryUrl, "_blank", "noopener");
              msg(" đã mở ra phục vụ khách hàng hội thoại (2 giờ bên trong có hiệu quả) ", true);
            }
          }).catch(function (e) { msg(e.message); });
        return;
      }
      if (act === "edit") {
        A.api("/api/platform/orgs").then(function (d) {
          editing = (d.orgs || []).filter(function (o) { return o.id === id; })[0];
          if (!editing) return;
          document.getElementById("e-id").value = editing.id;
          document.getElementById("e-name").value = editing.name || "";
          document.getElementById("e-slug").value = editing.slug || "";
          document.getElementById("e-admin").value = editing.adminPhone || "";
          document.getElementById("e-expires").value = editing.expiresAt
            ? String(editing.expiresAt).slice(0, 10): "";
          document.getElementById("e-status").value = editing.status || "active";
          document.getElementById("e-note").value = editing.contractNote || "";
          document.getElementById("e-logo").value = "";
          dlg.showModal();
        });
      }
    });

    document.getElementById("plat-edit-form").addEventListener("submit", function (ev) {
      var val = ev.submitter && ev.submitter.value;
      if (val === "cancel") return;
      ev.preventDefault();
      var id = Number(document.getElementById("e-id").value);
      var file = document.getElementById("e-logo").files[0];
      fileToDataUrl(file).then(function (dataUrl) {
        var body = {
          name: document.getElementById("e-name").value.trim(),
          slug: document.getElementById("e-slug").value.trim().toLowerCase(),
          adminPhone: document.getElementById("e-admin").value.trim() || null,
          status: document.getElementById("e-status").value,
          expiresAt: document.getElementById("e-expires").value
            ? new Date(document.getElementById("e-expires").value + "T23:59:59").toISOString()
            : null,
          contractNote: document.getElementById("e-note").value.trim()
        };
        if (dataUrl) body.logoDataUrl = dataUrl;
        return A.api("/api/platform/orgs/" + id, { method: "PATCH", body: body });
      }).then(function () {
        dlg.close();
        msg(" đã Lưu ", true);
        return load();
      }).catch(function (e) { msg(e.message || " Lưu thất bại "); });
    });

    function loadMaint() {
      return A.api("/api/maintenance").then(function (d) {
        var btn = document.getElementById("maint-toggle");
        if (!btn) return;
        btn.setAttribute("data-on", d.on? "1": "0");
        btn.textContent = d.on? " Đóng bảo vệ (khôi phục mọi người phỏng vấn) ": " mở ra bảo vệ (chỉ chừa mình có thể tiến) ";
      });
    }
    var maintBtn = document.getElementById("maint-toggle");
    if (maintBtn) {
      maintBtn.addEventListener("click", function () {
        var on = maintBtn.getAttribute("data-on")!== "1";
        A.api("/api/maintenance", { method: "POST", body: { on: on } })
          .then(function () {
            msg(on? " bảo vệ đã mở ra, những người khác tạm thời vào không được ": " bảo vệ đã đóng bế, trang web khôi phục phỏng vấn ", true);
            return loadMaint();
          })
          .catch(function (e) { msg(e.message || " hoán đổi thất bại "); });
      });
    }

    function esc(s) {
      return String(s == null? "": s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    function loadTiku() {
      var box = document.getElementById("tiku-teachers");
      var ips = document.getElementById("tiku-ips");
      if (!box ||!ips) return Promise.resolve();
      return Promise.all([
        A.api("/api/platform/tiku/teachers"),
        A.api("/api/platform/tiku/ips")
      ]).then(function (xs) {
        box.innerHTML = (xs[0].teachers || []).map(function (t) {
          return '<label style="display:block;margin:.35rem 0"><input type="checkbox" data-tiku="' + t.id + '"' +
            (t.canTiku? " checked": "") + "> " + esc(t.name || "") + " " + esc(t.phone) + "</label>";
        }).join("") || "<p> còn không có Giáo viên tài khoản. </p>";
        ips.innerHTML = (xs[1].ips || []).map(function (x) {
          return "<li>" + esc(x.ip) + (x.note? " · " + esc(x.note): "") +
            ' <button type="button" class="btn btn--ghost btn--sm" data-del-ip="' + esc(x.ip) + '"> xóa </button></li>';
        }).join("");
      });
    }
    var tikuTeachers = document.getElementById("tiku-teachers");
    if (tikuTeachers) {
      tikuTeachers.addEventListener("change", function (ev) {
        var el = ev.target.closest("[data-tiku]");
        if (!el) return;
        A.api("/api/platform/tiku/teachers/" + el.getAttribute("data-tiku"), {
          method: "POST",
          body: { canTiku:!!el.checked }
        }).then(function () { msg(" đã đổi mới mới Ngân hàng đề quyền hạn ", true); }).catch(function (e) { msg(e.message); });
      });
    }
    var tikuAdd = document.getElementById("tiku-ip-add");
    if (tikuAdd) {
      tikuAdd.onclick = function () {
        var ip = (document.getElementById("tiku-ip") || {}).value || "";
        var note = (document.getElementById("tiku-ip-note") || {}).value || "";
        msg(" đang tăng thêm …", true);
        A.api("/api/platform/tiku/ips", {
          method: "POST",
          body: { ip: ip.trim(), note: note.trim() }
        }).then(function () { msg(" đã tăng thêm IP", true); return loadTiku(); }).catch(function (e) { msg(e.message); });
      };
    }
    var tikuIps = document.getElementById("tiku-ips");
    if (tikuIps) {
      tikuIps.addEventListener("click", function (ev) {
        var btn = ev.target.closest("[data-del-ip]");
        if (!btn) return;
        A.api("/api/platform/tiku/ips", { method: "DELETE", body: { ip: btn.getAttribute("data-del-ip") } })
          .then(function () { return loadTiku(); }).catch(function (e) { msg(e.message); });
      });
    }

    gateThenLoad().then(loadMaint).then(loadTiku).catch(function (e) {
      msg((e && e.message) || " không cách nào Vào học Bảng điều khiển hệ thống ");
    });
  });
})();
