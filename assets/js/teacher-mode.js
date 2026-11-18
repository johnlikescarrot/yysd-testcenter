/* teacher-mode.js — phòng học quản lý khu ⇄ Khu tính năng học tập hoán đổi */
(function () {
  "use strict";

  var MODE_KEY = "yysd:teacher:mode";
  var TEACHER_TOKEN_KEY = "yysd:teacher:token";
  var T = window.YYSD_TEACHER;
  var A = window.YYSD_AUTH;

  function pageName() {
    var parts = location.pathname.split("/").filter(Boolean);
    return parts.length? parts[parts.length - 1]: "index.html";
  }

  function getMode() {
    try {
      return localStorage.getItem(MODE_KEY) || "";
    } catch (e) {
      return "";
    }
  }

  function hasChosenMode() {
    var m = getMode();
    return m === "admin" || m === "site";
  }

  function hasTeacherToken() {
    try {
      return!!localStorage.getItem(TEACHER_TOKEN_KEY);
    } catch (e) {
      return false;
    }
  }

  function setMode(mode) {
    try {
      localStorage.setItem(MODE_KEY, mode === "site"? "site": "admin");
    } catch (e) {}
  }

  function clearMode() {
    try {
      localStorage.removeItem(MODE_KEY);
    } catch (e) {}
  }

  function redirectToPicker() {
    if (pageName() === "teacher-mode-picker.html") return;
    location.replace("teacher-mode-picker.html");
  }

  function isSiteMode() {
    try {
      return getMode() === "site" &&
        !!localStorage.getItem(TEACHER_TOKEN_KEY) &&
        !!localStorage.getItem("yysd:auth:token");
    } catch (e) {
      return false;
    }
  }

  function setStudentAuthCookie(on) {
    try {
      var secure = location.protocol === "https:"? "; Secure": "";
      document.cookie = "yysd_auth=" + (on? "1": "") +
        "; path=/; max-age=" + (on? 2592000: 0) + "; SameSite=Lax" + secure;
    } catch (e) {}
  }

  // ponytail: picker.html does not load auth.js — write student keys here
  function writeStudentSession(d) {
    if (!d ||!d.token) return;
    try {
      localStorage.setItem("yysd:auth:token", d.token);
      var u = d.user || {};
      localStorage.setItem("yysd:auth:user", JSON.stringify({
        phone: u.phone || "",
        role: "student",
        displayName: u.displayName || "",
        avatarUrl: u.avatarUrl || "",
        isAdmin:!!u.isAdmin,
        isPlatformAdmin:!!u.isPlatformAdmin
      }));
    } catch (e) {}
    setStudentAuthCookie(true);
  }

  function clearStudentSession() {
    try {
      localStorage.removeItem("yysd:auth:token");
      localStorage.removeItem("yysd:auth:user");
    } catch (e) {}
    if (A && A.clearSession) A.clearSession();
    else setStudentAuthCookie(false);
  }

  function applySiteModeLogin(d) {
    setMode("site");
    writeStudentSession(d);
    if (A && A.applyLogin) {
      A.applyLogin({ token: d.token, user: d.user, role: "student" });
    }
  }

  /** Site mode flag set but student JWT missing or polluted with teacher JWT. */
  function siteModeNeedsRestore() {
    return !!(A && A.teacherSiteModeNeedsRestore && A.teacherSiteModeNeedsRestore());
  }

  function enterViaApi() {
    return T.api("/api/teacher/site-mode/enter", { method: "POST" }).then(function (d) {
      if (!d ||!d.token) throw new Error(" không cách nào Vào học Khu tính năng học tập ");
      applySiteModeLogin(d);
      return d;
    });
  }

  function restoreSiteModeToken() {
    if (!T ||!T.api) return Promise.reject(new Error(" Vui lòng đăng nhập trước Giáo viên tài khoản "));
    if (A && A.ensureTeacherSiteStudentToken && siteModeNeedsRestore()) {
      return A.ensureTeacherSiteStudentToken().then(function (d) {
        return (d && d.token)? d: enterViaApi();
      });
    }
    return enterViaApi();
  }

  function enterAdminMode() {
    setMode("admin");
    clearStudentSession();
    location.href = "teacher.html";
  }

  function enterSiteMode() {
    if (!T ||!T.api) return Promise.reject(new Error(" Vui lòng đăng nhập trước Giáo viên tài khoản "));
    return enterViaApi().then(function (d) {
      location.href = (d && d.redirect) || "index.html";
    });
  }

  function exitSiteMode() {
    setMode("admin");
    clearStudentSession();
    location.href = "teacher.html";
  }

  function switchHtml(active) {
    return (
      '<div class="teacher-mode-switch" role="tablist" aria-label=" Cổng giáo viên hình thức ">' +
        '<button type="button" class="teacher-mode-switch__btn' +
          (active === "admin"? " is-active": "") +
          '" data-mode="admin"> phòng học quản lý khu </button>' +
        '<button type="button" class="teacher-mode-switch__btn' +
          (active === "site"? " is-active": "") +
          '" data-mode="site"> Khu tính năng học tập </button>' +
      "</div>"
    );
  }

  function bindSwitch(root) {
    if (!root || root.__modeBound) return;
    root.__modeBound = true;
    root.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-mode]");
      if (!btn) return;
      var mode = btn.getAttribute("data-mode");
      if (mode === "site") {
        if (isSiteMode()) {
          location.href = "index.html";
          return;
        }
        btn.disabled = true;
        enterSiteMode().catch(function (err) {
          alert((err && err.message) || " không cách nào Vào học Khu tính năng học tập ");
          btn.disabled = false;
        });
        return;
      }
      if (mode === "admin") {
        var busy = document.body.classList.contains("yysd-ime-gate-open") ||
          document.body.classList.contains("vc-playing");
        if (busy &&!confirm(" vượt ải đang tiến hành, ly khai sẽ tạm dừng chủ đề. Đồng ý trở lại phòng học quản lý khu? ")) return;
        if (isSiteMode()) exitSiteMode();
        else if (location.pathname.indexOf("teacher") < 0) location.href = "teacher.html";
      }
    });
  }

  function mountAdminSwitch() {
    var side = document.querySelector(".teacher-side");
    if (!side || side.querySelector(".teacher-mode-switch")) return;
    var wrap = document.createElement("div");
    wrap.innerHTML = switchHtml("admin");
    side.insertBefore(wrap.firstChild, side.firstChild);
    bindSwitch(side);
  }

  function mountSiteBanner() {
    if (!isSiteMode()) return;
    if (document.getElementById("teacher-site-banner")) return;
    var bar = document.createElement("div");
    bar.id = "teacher-site-banner";
    bar.className = "teacher-site-banner";
    bar.innerHTML =
      switchHtml("site") +
      '<span class="teacher-site-banner__hint"> Dùng thử hình thức: và Học viên giống nhau công năng và vượt ải Tiến độ </span>';
    document.body.insertBefore(bar, document.body.firstChild);
    bindSwitch(bar);
    document.body.classList.add("has-teacher-site-banner");
  }

  function boot() {
    if (pageName() === "teacher-mode-picker.html") return;
    if (pageName() === "teacher-student-report.html") return;
    if (pageName() === "download.html") return;
    if (pageName() === "platform.html" || pageName() === "admin-seats.html") {
      if (document.body.classList.contains("teacher-page")) mountAdminSwitch();
      return;
    }

    if (document.body.classList.contains("teacher-page")) {
      if (hasTeacherToken() &&!hasChosenMode()) {
        redirectToPicker();
        return;
      }
      if (isSiteMode()) {
        location.href = "index.html";
        return;
      }
      mountAdminSwitch();
      return;
    }

    if (hasTeacherToken()) {
      if (!hasChosenMode()) {
        redirectToPicker();
        return;
      }
      if (getMode()!== "site") {
        location.replace(getMode() === "admin"? "teacher.html": "teacher-mode-picker.html");
        return;
      }
    }

    if (siteModeNeedsRestore()) {
      restoreSiteModeToken()
        .then(function () { mountSiteBanner(); })
        .catch(function () {
          setMode("admin");
          location.replace("teacher.html");
        });
      return;
    }
    mountSiteBanner();
  }

  window.YYSD_TEACHER_MODE = {
    getMode: getMode,
    setMode: setMode,
    hasChosenMode: hasChosenMode,
    clearMode: clearMode,
    isSiteMode: isSiteMode,
    siteModeNeedsRestore: siteModeNeedsRestore,
    restoreSiteModeToken: restoreSiteModeToken,
    enterAdminMode: enterAdminMode,
    enterSiteMode: enterSiteMode,
    exitSiteMode: exitSiteMode
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
