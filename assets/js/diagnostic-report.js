/* diagnostic-report.js */
(function () {
  "use strict";
  var A = window.YYSD_AUTH;
  var Y = window.YYSD;
  var Charts = window.YYSD_DIAG_CHARTS || {};
  var contentEl = document.getElementById("content");
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var RATING_STAR = {
    excellent: " Xuất sắc ★★★",
    good: " Tốt ★★☆",
    weak: " Cần củng cố ★☆☆"
  };
  var LEVEL_NAME = {
    high_school: " Từ vựng Nền tảng THPT ",
    cet4: " Từ vựng Đại học Cốt lõi ",
    ielts: " Từ vựng IELTS "
  };

  function esc(s) {
    return Y && Y.esc? Y.esc(s): String(s == null? "": s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function thermoHTML(stage) {
    if (!stage) {
      return '<p class="diag-lead"> không tham gia bản Giai đoạn </p>';
    }
    var pct = Math.round((stage.accuracy || 0) * 100);
    var lo = Math.round((stage.ci_lower || 0) * 100);
    var hi = Math.round((stage.ci_upper || 0) * 100);
    var rating = stage.rating || "weak";
    return (
      '<div class="diag-thermo">' +
      '<div class="diag-thermo__label"><span>' +
      esc(stage.name || LEVEL_NAME[stage.level] || "") +
      " · " +
      pct +
      "%</span><span class=\"diag-rating diag-rating--" +
      esc(rating) +
      '">' +
      esc(RATING_STAR[rating] || "") +
      "</span></div>" +
      '<div class="diag-thermo__track">' +
      '<div class="diag-thermo__fill diag-thermo__fill--' +
      esc(rating) +
      '" style="width:' +
      pct +
      '%"></div>' +
      '<div class="diag-thermo__ci" style="left:' +
      lo +
      "%;width:" +
      Math.max(2, hi - lo) +
      '%" title="95% CI"></div>' +
      "</div>" +
      '<p class="diag-mist-meta">95% tin khu lúc giữa ' +
      lo +
      "% – " +
      hi +
      "% · Chính tả " +
      Math.round((stage.spelling_accuracy || 0) * 100) +
      "% (" +
      (stage.spelling_correct || 0) +
      "/" +
      (stage.spelling_total || 0) +
      ") </p></div>"
    );
  }

  if (!A ||!A.getToken ||!A.getToken()) {
    contentEl.innerHTML =
      '<div class="diag-card"><p class="diag-lead"> Vui lòng đăng nhập trước </p><a class="btn btn--primary" href="login.html"> Đăng nhập ngay </a></div>';
    return;
  }

  var params = new URLSearchParams(location.search);
  var sid = params.get("session");
  var isPlacement = params.get("placement") === "1";
  if (!sid) {
    contentEl.innerHTML =
      '<div class="diag-card"><p class="diag-lead"> thiếu khuyết hội thoại tham số </p><a href="diagnostic.html"> Quay lại chẩn đoán năng lực </a></div>';
    return;
  }

  A.api("/api/diagnostic/session/" + encodeURIComponent(sid) + "/report")
    .then(function (d) {
      var report = d.report || {};
      var stages = report.stages || [];
      var vals = { high_school: 0, cet4: 0, ielts: 0 };
      var any = false;
      stages.forEach(function (s) {
        if (s && s.level) {
          vals[s.level] = s.accuracy || 0;
          any = true;
        }
      });
      var stageHtml = ["high_school", "cet4", "ielts"]
        .map(function (lv) {
          var found = (stages || []).find(function (x) { return x && x.level === lv; });
          return (
            '<section style="margin:20px 0">' +
            (found? thermoHTML(found): '<p class="diag-lead">' + esc(LEVEL_NAME[lv]) + " · không tham gia </p>") +
            "</section>"
          );
        })
        .join("");

      var radar =
        any && Charts.radarSVG
          ? '<div class="diag-report-radar"><h2 class="diag-h2"> năng lực ra-đa </h2>' +
            Charts.radarSVG(vals) +
            "</div>"
          : "";

      var bookKey =
        window.YYSD_DIAG_GATE && window.YYSD_DIAG_GATE.bookForLevel
          ? window.YYSD_DIAG_GATE.bookForLevel(report.recommended_start_level)
          : report.recommended_start_level === "cet4"
            ? "cet4"
            : report.recommended_start_level === "ielts"
              ? "special"
              : "gaozhong";
      var bookLabel =
        LEVEL_NAME[report.recommended_start_level] ||
        report.recommended_start_level ||
        " Đề xuất từ kho ";

      var actions = isPlacement
        ? '<a class="btn btn--primary" href="vocab-shelf.html?view=catalog"> Vào học từ kho giá sách · ' +
          esc(bookLabel) +
          "</a>" +
          '<a class="btn btn--ghost" href="diagnostic-mistakes.html"> Xem chẩn đoán câu sai </a>' +
          '<a class="btn btn--ghost" href="zone.html?zone=study&s=vocab"> mở ra Khu từ vựng </a>'
        : '<a class="btn btn--primary" href="diagnostic-mistakes.html"> Vào học Sổ lỗi sai </a>' +
          '<a class="btn btn--ghost" href="diagnostic.html"> lại trắc một lần </a>';

      contentEl.innerHTML =
        '<div class="diag-card">' +
        "<h1>" +
        (isPlacement? " lần đầu xác định và đánh giá báo cáo ": " báo cáo năng lực ") +
        "</h1>" +
        '<p class="diag-lead"> Đề xuất lúc đầu: <strong>' +
        esc(LEVEL_NAME[report.recommended_start_level] || report.recommended_start_level || "—") +
        "</strong> · thời gian sử dụng " +
        Math.round((report.total_time_seconds || 0) / 60) +
        " phút </p>" +
        radar +
        stageHtml +
        '<div class="diag-advice">' +
        (isPlacement? "<h2 class=\"diag-h2\"> Học tập đề nghị </h2>": "") +
        esc(report.advice_text || "") +
        "</div>" +
        '<div class="diag-actions">' +
        actions +
        "</div></div>";
    })
    .catch(function (e) {
      contentEl.innerHTML =
        '<div class="diag-card"><p class="diag-msg">' +
        esc(e.message || "Tải dữ liệu thất bại") +
        '</p><a href="diagnostic.html"> Quay lại </a></div>';
    });
})();
