/* teacher-student-report.js — printable monthly 学情报告 */
(function () {
  "use strict";
  var T = window.YYSD_TEACHER;
  var Y = window.YYSD;
  var STATUS = { PENDING: "Đang chờ", COMPLETED: "Đã hoàn thành", OVERDUE: "Quá hạn" };
  var SKILL = { listening: "Nghe", reading: "Đọc", writing: "Viết", speaking: "Nói" };
  var q = new URLSearchParams(location.search);
  var studentId = Number(q.get("student") || 0);
  var month = q.get("month") || "";
  var root = document.getElementById("rpt-root");
  var back = document.getElementById("rpt-back");
  var printBtn = document.getElementById("rpt-print");

  function esc(s) { return Y ? Y.esc(s) : String(s == null ? "" : s); }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function monthLabel(ym) {
    var p = String(ym || "").split("-");
    if (p.length !== 2) return ym || "";
    return "Tháng " + Number(p[1]) + "/" + p[0];
  }
  function fmtDate(iso) {
    if (!iso) return "—";
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return String(iso).slice(0, 10);
      return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    } catch (e) { return String(iso).slice(0, 10); }
  }
  function fmtDuration(sec) {
    if (sec == null || sec === "" || !isFinite(Number(sec))) return "—";
    var n = Math.max(0, Math.round(Number(sec)));
    var h = Math.floor(n / 3600);
    var m = Math.floor((n % 3600) / 60);
    var s = n % 60;
    if (h > 0) return h + " giờ" + (m ? " " + m + " phút" : "");
    if (m > 0) return m + " phút" + (s ? " " + s + " giây" : "");
    return s + " giây";
  }
  function fmtScore(row) {
    if (!row) return "—";
    if (row.score == null && row.band == null) return "—";
    var s = "";
    if (row.score != null) {
      s = String(row.score);
      if (row.total != null) s += " / " + row.total;
    }
    if (row.band != null) s += (s ? " · " : "") + "Band " + row.band;
    return s || "—";
  }
  function meter(pct) {
    var n = pct == null ? 0 : Math.max(0, Math.min(100, Number(pct)));
    return '<div class="rpt-meter" aria-hidden="true"><i style="width:' + n + '%"></i></div>';
  }
  function nameOf(d) {
    return (d.student && d.student.displayName) || (d.student && d.student.phone) || "Học viên";
  }
  function teacherOf(d) {
    return (d.teacher && d.teacher.name) || (d.teacher && d.teacher.phone) || "Giáo viên";
  }
  function rowsOf(d) {
    return (d.assignments || []).concat(d.practices || []).concat(d.diagnostics || []);
  }
  function wrongBlock(item) {
    if (item.writingTask1 || item.writingTask2) {
      return (item.writingTask1 ? "<h4>Task 1</h4><pre class=\"rpt-essay\">" + esc(item.writingTask1) + "</pre>" : "") +
        (item.writingTask2 ? "<h4>Task 2</h4><pre class=\"rpt-essay\">" + esc(item.writingTask2) + "</pre>" : "");
    }
    var wrong = item.wrong || [];
    var mistakes = item.mistakes || [];
    if (wrong.length) {
      return "<ul class=\"rpt-wrong\">" + wrong.map(function (w) {
        return "<li><b>Câu " + esc(String(w.no)) + " câu</b>　Câu trả lời " + esc(w.ua || "Chưa trả lời") +
          "　Đúng " + esc(w.ans || "—") +
          (w.stem ? "<div>" + esc(w.stem) + "</div>" : "") +
          (w.explain ? "<div>" + esc(w.explain) + "</div>" : "") +
          "</li>";
      }).join("") + "</ul>";
    }
    if (mistakes.length) {
      return "<ul class=\"rpt-wrong\">" + mistakes.map(function (m) {
        return "<li><b>" + esc(m.word || "") + "</b> " + esc(m.meaning || "") +
          "　Câu trả lời " + esc(m.ua || "Chưa trả lời") + "　Đúng " + esc(m.ans || "—") + "</li>";
      }).join("") + "</ul>";
    }
    return "";
  }

  function render(d) {
    document.title = nameOf(d) + " · " + monthLabel(d.month) + "Báo cáo học tập";
    if (back) back.href = "teacher.html?student=" + (d.student && d.student.id || studentId);
    var s = d.summary || {};
    var cover =
      '<header class="rpt-cover">' +
        '<p class="eyebrow">MONTHLY REPORT</p>' +
        "<h1>" + esc(nameOf(d)) + " · " + esc(monthLabel(d.month)) + "Báo cáo học tập</h1>" +
        "<p>Xuất PDF cho giáo viên " + esc(teacherOf(d)) +
        (d.student && d.student.phone ? "　Học viên " + esc(d.student.phone) : "") + "</p>" +
      "</header>";
    if (d.empty) {
      root.innerHTML = cover + '<p class="rpt-empty">Tháng này chưa có kết quả</p>';
      return;
    }
    var rate = s.completionRate == null ? "—" : s.completionRate + "%";
    var kpis =
      '<div class="rpt-kpis">' +
        "<div class=\"rpt-kpi\"><b>" + (s.assigned || 0) + "</b><span>Bài tập được giao</span></div>" +
        "<div class=\"rpt-kpi\"><b>" + esc(String(rate)) + "</b><span>Tỉ lệ hoàn thành bài được giao</span></div>" +
        "<div class=\"rpt-kpi\"><b>" + (s.practiceCount || 0) + "</b><span>Tự luyện / Thi thử / Từ vựng</span></div>" +
        "<div class=\"rpt-kpi\"><b>" + (s.practiceAvgPercent == null ? "—" : s.practiceAvgPercent + "%") +
          "</b><span>Tỉ lệ điểm trung bình khi tự luyện</span></div>" +
      "</div>";
    var charts = "<h2>Biểu đồ</h2><p>Tỉ lệ hoàn thành bài được giao</p>" + meter(s.completionRate == null ? 0 : s.completionRate);
    var skills = d.skills || {};
    charts += Object.keys(SKILL).map(function (k) {
      var sk = skills[k] || {};
      if (!sk.n) return "";
      var label = sk.avgPercent != null ? sk.avgPercent + "%" : (sk.avgBand != null ? "Band " + sk.avgBand : "—");
      return '<div class="rpt-skill"><span>' + SKILL[k] + "</span>" +
        meter(sk.avgPercent) + "<span>" + esc(label) + "</span></div>";
    }).join("");
    if (s.practiceAvgBand != null) {
      charts += "<p>Trung bình tự luyện Band " + esc(String(s.practiceAvgBand)) + "</p>";
    }
    var listRows = rowsOf(d).map(function (item) {
      return "<tr><td>" + esc(item.title) + "</td><td>" + esc(item.kind) + "</td><td>" +
        esc(STATUS[item.status] || item.status || "—") + "</td><td>" + esc(fmtScore(item)) +
        "</td><td>" + esc(fmtDuration(item.durationSec)) + "</td><td>" + esc(fmtDate(item.date)) + "</td></tr>";
    }).join("");
    var list = "<h2>Kết quả trong tháng</h2><table><thead><tr><th>Tên</th><th>Loại</th><th>Trạng thái</th><th>Kết quả</th><th>Thời gian làm bài:</th><th>ngày</th></tr></thead><tbody>" +
      listRows + "</tbody></table>";
    var detailItems = rowsOf(d).filter(function (item) {
      return (item.wrong && item.wrong.length) || item.writingTask1 || item.writingTask2 || (item.mistakes && item.mistakes.length);
    });
    var details = "<h2>Câu sai và bài viết</h2>" + (detailItems.length ? detailItems.map(function (item) {
      return '<article class="rpt-item"><h3>' + esc(item.title) + " · " + esc(item.kind) + "</h3>" +
        '<p class="rpt-meta">' + esc(fmtDate(item.date)) + " · " + esc(fmtScore(item)) + "</p>" +
        wrongBlock(item) + "</article>";
    }).join("") : "<p>Tháng này chưa có câu sai hoặc bài viết được gửi lên.</p>");
    root.innerHTML = cover + kpis + charts + list + details;
  }

  if (printBtn) printBtn.addEventListener("click", function () { window.print(); });
  if (!studentId) {
    root.innerHTML = '<p class="err">Thiếu mã học viên</p>';
    return;
  }
  T.api("/api/teacher/students/" + studentId + "/report" + (month ? "?month=" + encodeURIComponent(month) : ""))
    .then(function (d) {
      render(d || {});
    })
    .catch(function (e) {
      root.innerHTML = '<p class="err">' + esc(e.message || "Không tải được nội dung") + "</p>";
    });
})();
