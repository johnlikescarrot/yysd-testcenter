/* tenant-boot.js — Khởi tạo cổng giáo viên & nhận diện thương hiệu trước khi vẽ giao diện */
(function () {
  "use strict";

  if (window.yysdDesktop && location.hostname !== "app.youyisida.com") {
    location.replace("https://app.youyisida.com/login.html");
    return;
  }

  function isCloudHost() {
    var h = (location.hostname || "").toLowerCase();
    return h === "youyisida.com" || h.slice(-14) === ".youyisida.com";
  }

  var page = "";
  var teacherTok = "";
  try {
    teacherTok = localStorage.getItem("yysd:teacher:token") || "";
    var mode = localStorage.getItem("yysd:teacher:mode") || "";
    if (teacherTok && mode !== "site") {
      var parts = location.pathname.split("/").filter(Boolean);
      page = parts.length ? parts[parts.length - 1] : "index.html";
      var teacherOk = {
        "teacher.html": 1,
        "teacher-login.html": 1,
        "teacher-register.html": 1,
        "teacher-mode-picker.html": 1,
        "teacher-calendar.html": 1,
        "teacher-diagnostic.html": 1,
        "teacher-student-diagnostic.html": 1,
        "teacher-student-report.html": 1,
        "teacher-vocab-challenge.html": 1,
        "admin-assign.html": 1,
        "admin-perms.html": 1,
        "platform.html": 1,
        "maintenance.html": 1,
        "agreement.html": 1,
        "privacy.html": 1,
        "download.html": 1,
        "lo-trinh.html": 1,
        "tai-lieu.html": 1
      };
      if (!teacherOk[page]) {
        location.replace(mode === "admin" ? "teacher.html" : "teacher-mode-picker.html");
        return;
      }
    }
  } catch (e) {}

  /* Chỉ kiểm tra chế độ bảo trì trên máy chủ đám mây chính thức; bỏ qua trên GitHub Pages & máy chủ tĩnh */
  if (isCloudHost()) {
    try {
      var maintPage = page || (function () {
        var p = location.pathname.split("/").filter(Boolean);
        return p.length ? p[p.length - 1] : "index.html";
      })();
      var maintSkip = {
        "maintenance.html": 1, "login.html": 1, "register.html": 1,
        "forgot-password.html": 1, "teacher-login.html": 1, "teacher-register.html": 1
      };
      if (!maintSkip[maintPage]) {
        var tok = teacherTok || "";
        try { if (!tok) tok = localStorage.getItem("yysd:auth:token") || ""; } catch (e2) {}
        var headers = {};
        if (tok) headers.Authorization = "Bearer " + tok;
        fetch("https://api.youyisida.com/api/maintenance", { headers: headers })
          .then(function (r) { return r.json(); })
          .then(function (d) {
            if (d && d.on && !d.allow) location.replace("maintenance.html");
          })
          .catch(function () {});
      }
    } catch (e) {}
  }

  function tenantSlug() {
    try {
      var q = new URLSearchParams(location.search).get("tenant");
      if (q && /^[a-z0-9]([a-z0-9-]{0,30}[a-z0-9])?$/.test(q)) return q.toLowerCase();
    } catch (e) {}
    var h = (location.hostname || "").toLowerCase();
    if (!h || h === "localhost" || h === "127.0.0.1") return "yysd";
    if (h === "youyisida.com" || h === "www.youyisida.com") return "yysd";
    var m = h.match(/^([a-z0-9-]+)\.youyisida\.com$/);
    if (!m) return "yysd";
    var s = m[1];
    if (/^(www|api|admin|platform|mail|static|cdn|test|dev|staging|app|jingting|tiku)$/.test(s)) return "yysd";
    return s;
  }

  var slug = tenantSlug();
  if (slug === "yysd") return;

  var el = document.documentElement;
  el.classList.add("tenant-brand-pending");

  var st = document.createElement("style");
  st.textContent = "html.tenant-brand-pending body{visibility:hidden}";
  document.head.appendChild(st);

  try {
    var org = JSON.parse(localStorage.getItem("yysd:org") || "null");
    if (org && org.slug === slug && org.name && document.title) {
      if (document.title.indexOf("·") >= 0) {
        document.title = document.title.replace(/^[^·]+·/, org.name + " ·");
      } else if (document.title.indexOf("YYSD") >= 0) {
        document.title = org.name;
      }
    }
  } catch (e) {}
})();
