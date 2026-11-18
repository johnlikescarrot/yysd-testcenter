/* ngân hàng câu hỏi trung tâm: sản xuất phải giáo viên cuối; gốc máy móc kiểm tra cho qua một cách dễ dàng sửa cải tiến cúc áo(cũ bộ nhớ đệm đầu không có)  */
(function (w) {
  "use strict";
  function local() {
    var h = (w.location && w.location.hostname) || "";
    return h === "localhost" || h === "127.0.0.1";
  }
  function desktop() {
    return !!(w.yysdDesktop && w.yysdDesktop.device);
  }
  w.YYSD_TIKU_GATE = { ok: local() || desktop(), local: local, desktop: desktop };
  function hardReload() {
    if (w.yysdDesktop && typeof w.yysdDesktop.reload === "function") w.yysdDesktop.reload();
    else w.location.reload();
  }
  function injectRefresh() {
    var row = document.querySelector("#app .top .row");
    if (!row || document.getElementById("refresh")) return;
    var b = document.createElement("button");
    b.type = "button";
    b.className = "btn ghost";
    b.id = "refresh";
    b.textContent = " cải tiến ";
    row.insertBefore(b, document.getElementById("out"));
    b.addEventListener("click", hardReload);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", injectRefresh);
  else injectRefresh();
})(window);
