/* Trung tâm ngân hàng đề:sản xuấtphảiGiáo viêncuối;hình thức kết hợp gốc họkiểm tracho qua.một cách dễ dàngsửaLàm mớihọ(cũtin học bộ nhớ đệmđầukhông có). */
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
    b.textContent = "Làm mới";
    row.insertBefore(b, document.getElementById("out"));
    b.addEventListener("click", hardReload);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", injectRefresh);
  else injectRefresh();
})(window);
