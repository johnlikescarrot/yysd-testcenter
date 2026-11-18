/* teacher-student-diagnostic.js */
(function () {
  "use strict";
  var T = window.YYSD_TEACHER;
  var Charts = window.YYSD_DIAG_CHARTS || {};
  var root = document.getElementById("stu-root");
  var logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", function () { T.logout(); });

  var LEVEL = { high_school: "THPT", cet4: "CET-4", ielts: "IELTS" };
  var RATING = { excellent: "Xuất sắc", good: "Tốt", weak: "Cần củng cố" };
  var COLORS = { high_school: "#2c3e6b", cet4: "#c8963e", ielts: "#3a7d5a" };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function pct(x) {
    return Math.round((Number(x) || 0) * 100) + "%";
  }

  if (!T.getToken || !T.getToken()) {
    location.replace("teacher-login.html?next=" + encodeURIComponent(location.pathname + location.search));
    return;
  }

  var id = Number(new URLSearchParams(location.search).get("id") || 0);
  if (!id) {
    root.innerHTML = '<p class="diag-msg">Thiếu mã học viên ID</p><a href="teacher-diagnostic.html">Về trang tổng quan</a>';
    return;
  }

  function stageCells(stages) {
    var map = {};
    (stages || []).forEach(function (s) {
      if (s && s.level) map[s.level] = s;
    });
    return ["high_school", "cet4", "ielts"].map(function (lv) {
      var s = map[lv];
      if (!s) return "<td>—</td>";
      return (
        "<td>" +
        esc(pct(s.accuracy)) +
        " · " +
        esc(RATING[s.rating] || "") +
        "</td>"
      );
    }).join("");
  }

  function mistakesTable(mistakes) {
    if (!mistakes || !mistakes.length) {
      return '<p class="diag-lead">Lượt này không ghi nhận câu sai</p>';
    }
    return (
      '<div class="diag-table-wrap"><table class="diag-table"><thead><tr>' +
      "<th>Từ vựng</th><th>Kho từ</th><th>Dạng bài</th><th>Câu trả lời</th><th>Đúng</th></tr></thead><tbody>" +
      mistakes
        .map(function (m) {
          return (
            "<tr><td><strong>" +
            esc(m.word || m.correct_answer) +
            "</strong><div class=\"diag-mist-meta\">" +
            esc(m.meaning || "") +
            "</div></td><td>" +
            esc(LEVEL[m.level] || m.level) +
            "</td><td>" +
            esc(m.question_type || "") +
            '</td><td class="diag-ua">' +
            esc(m.user_answer || " (Trống)") +
            '</td><td class="diag-ca">' +
            esc(m.correct_answer) +
            "</td></tr>"
          );
        })
        .join("") +
      "</tbody></table></div>"
    );
  }

  function render(data) {
    var stu = data.student || {};
    var name = stu.displayName || stu.phone || "#" + stu.id;
    document.getElementById("stu-title").textContent = name + " · Đánh giá vốn từ";
    document.getElementById("stu-sub").textContent =
      "tổng cộng " + (data.sessions || []).length + " bài kiểm tra đã hoàn thành";

    var trend = data.trend || {};
    var series = ["high_school", "cet4", "ielts"].map(function (lv) {
      return {
        label: LEVEL[lv],
        color: COLORS[lv],
        points: (trend[lv] || []).map(function (p) {
          return {
            y: p.accuracy,
            xLabel: p.at ? new Date(p.at).toLocaleDateString("vi-VN") : ""
          };
        })
      };
    }).filter(function (s) { return s.points.length; });

    var chartHtml = series.length
      ? (Charts.lineChartSVG
        ? Charts.lineChartSVG(series)
        : '<p class="diag-lead">Chưa tải được biểu đồ</p>')
      : '<p class="diag-lead">Chưa có đủ lượt kiểm tra, không thể vẽ xu hướng</p>';

    var timeline = (data.sessions || [])
      .map(function (s, idx) {
        var open = idx === 0 ? " is-open" : "";
        return (
          '<details class="diag-timeline__item' +
          open +
          '"' +
          (idx === 0 ? " open" : "") +
          ">" +
          "<summary>" +
          esc(s.tested_at ? new Date(s.tested_at).toLocaleString("vi-VN") : "—") +
          " · Gợi ý " +
          esc(LEVEL[s.recommended_start_level] || s.recommended_start_level || "—") +
          " · Câu sai " +
          ((s.mistakes && s.mistakes.length) || 0) +
          "</summary>" +
          '<div class="diag-timeline__body">' +
          '<div class="diag-table-wrap"><table class="diag-table"><thead><tr>' +
          "<th>THPT</th><th>CET-4</th><th>IELTS</th></tr></thead><tbody><tr>" +
          stageCells(s.stages) +
          "</tr></tbody></table></div>" +
          (s.advice_text
            ? '<p class="diag-advice">' + esc(s.advice_text) + "</p>"
            : "") +
          "<h3 class=\"diag-h3\">Chi tiết câu sai</h3>" +
          mistakesTable(s.mistakes) +
          "</div></details>"
        );
      })
      .join("");

    root.innerHTML =
      '<section class="diag-card diag-card--wide">' +
      "<h2 class=\"diag-h2\">Thay đổi về năng lực</h2>" +
      '<p class="diag-lead">Tỉ lệ đúng qua các lần kiểm tra cùng một kho từ</p>' +
      chartHtml +
      "</section>" +
      '<section class="diag-card diag-card--wide" style="margin-top:16px">' +
      "<h2 class=\"diag-h2\">Lịch sử kiểm tra</h2>" +
      (timeline || '<p class="diag-lead">Chưa có bài đánh giá nào hoàn thành</p>') +
      "</section>" +
      '<p style="margin-top:16px"><a class="btn btn--ghost btn--sm" href="teacher-diagnostic.html">← Về trang tổng quan</a></p>';
  }

  T.api("/api/teacher/student-diagnostic/" + id)
    .then(render)
    .catch(function (e) {
      root.innerHTML =
        '<p class="diag-msg">' +
        esc(e.message || "Không tải được nội dung") +
        '</p><a href="teacher-diagnostic.html">Quay lại</a>';
    });
})();
