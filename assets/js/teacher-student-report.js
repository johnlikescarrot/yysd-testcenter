/* teacher-student-report.js - printable monthly học thông tin nói */
(function () {
  "use strict";
  var T = window.YYSD_TEACHER;
  var Y = window.YYSD;
  var STATUS = { PENDING: " ở lại hoàn thành ", COMPLETED: " đã hoàn thành ", OVERDUE: " đã bị quá hạn " };
  var SKILL = { listening: " Nghe hiểu ", reading: " Đọc hiểu ", writing: " Viết ", speaking: " Nói " };
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
    return Number(p[0]) + " năm " + Number(p[1]) + " tháng ";
  }
  function fmtDate(iso) {
    if (!iso) return "-";
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return String(iso).slice(0, 10);
      return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    } catch (e) { return String(iso).slice(0, 10); }
  }
  function fmtDuration(sec) {
    if (sec == null || sec === "" || !isFinite(Number(sec))) return "-";
    var n = Math.max(0, Math.round(Number(sec)));
    var h = Math.floor(n / 3600);
    var m = Math.floor((n % 3600) / 60);
    var s = n % 60;
    if (h > 0) return h + " giờ " + (m ? m + " điểm " : "");
    if (m > 0) return m + " điểm " + (s ? s + " giây " : "");
    return s + " giây ";
  }
  function fmtScore(row) {
    if (!row) return "-";
    if (row.score == null && row.band == null) return "-";
    var s = "";
    if (row.score != null) {
      s = String(row.score);
      if (row.total != null) s += " / " + row.total;
    }
    if (row.band != null) s += (s ? " · " : "") + "Band " + row.band;
    return s || "-";
  }
  function meter(pct) {
    var n = pct == null ? 0 : Math.max(0, Math.min(100, Number(pct)));
    return '<div class="rpt-meter" aria-hidden="true"><i style="width:' + n + '%"></i></div>';
  }
  function nameOf(d) {
    return (d.student && d.student.displayName) || (d.student && d.student.phone) || " Học viên ";
  }
  function teacherOf(d) {
    return (d.teacher && d.teacher.name) || (d.teacher && d.teacher.phone) || " Giáo viên ";
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
        return "<li><b>Thứ " + esc(String(w.no)) + " Câu hỏi</b> Trả lời " + esc(w.ua || " Chưa trả lời ") +
          " Đúng " + esc(w.ans || "-") +
          (w.stem ? "<div>" + esc(w.stem) + "</div>" : "") +
          (w.explain ? "<div>" + esc(w.explain) + "</div>" : "") +
          "</li>";
      }).join("") + "</ul>";
    }
    if (mistakes.length) {
      return "<ul class=\"rpt-wrong\">" + mistakes.map(function (m) {
        return "<li><b>" + esc(m.word || "") + "</b> " + esc(m.meaning || "") +
          " Trả lời " + esc(m.ua || " Chưa trả lời ") + " Đúng " + esc(m.ans || "-") + "</li>";
      }).join("") + "</ul>";
    }
    return "";
  }

  function render(d) {
    document.title = nameOf(d) + " · " + monthLabel(d.month) + " học thông tin nói ";
    if (back) back.href = "teacher.html?student=" + (d.student && d.student.id || studentId);
    var s = d.summary || {};
    var cover =
      '<header class="rpt-cover">' +
        '<p class="eyebrow">MONTHLY REPORT</p>' +
        "<h1>" + esc(nameOf(d)) + " · " + esc(monthLabel(d.month)) + " học thông tin nói</h1>" +
        "<p>suy ra giáo viên " + esc(teacherOf(d)) +
        (d.student && d.student.phone ? " Học viên " + esc(d.student.phone) : "") + "</p>" +
      "</header>";
    if (d.empty) {
      root.innerHTML = cover + '<p class="rpt-empty">tháng này không có ghi chép</p>';
      return;
    }
    var rate = s.completionRate == null ? "-" : s.completionRate + "%";
    var kpis =
      '<div class="rpt-kpis">' +
        "<div class=\"rpt-kpi\"><b>" + (s.assigned || 0) + "</b><span>sắp xếp bài tập về nhà</span></div>" +
        "<div class=\"rpt-kpi\"><b>" + esc(String(rate)) + "</b><span>bài tập về nhà hoàn thành tỉ lệ</span></div>" +
        "<div class=\"rpt-kpi\"><b>" + (s.practiceCount || 0) + "</b><span>tự luyện tập / bắt chước đánh / Từ vựng</span></div>" +
        "<div class=\"rpt-kpi\"><b>" + (s.practiceAvgPercent == null ? "-" : s.practiceAvgPercent + "%") +
          "</b><span>tự luyện tập trung bình ghi điểm tỉ lệ</span></div>" +
      "</div>";
    var charts = "<h2>biểu đồ</h2><p>bài tập về nhà hoàn thành tỉ lệ</p>" + meter(s.completionRate == null ? 0 : s.completionRate);
    var skills = d.skills || {};
    charts += Object.keys(SKILL).map(function (k) {
      var sk = skills[k] || {};
      if (!sk.n) return "";
      var label = sk.avgPercent != null ? sk.avgPercent + "%" : (sk.avgBand != null ? "Band " + sk.avgBand : "-");
      return '<div class="rpt-skill"><span>' + SKILL[k] + "</span>" +
        meter(sk.avgPercent) + "<span>" + esc(label) + "</span></div>";
    }).join("");
    if (s.practiceAvgBand != null) {
      charts += "<p>tự luyện tập trung bình Band " + esc(String(s.practiceAvgBand)) + "</p>";
    }
    var listRows = rowsOf(d).map(function (item) {
      return "<tr><td>" + esc(item.title) + "</td><td>" + esc(item.kind) + "</td><td>" +
        esc(STATUS[item.status] || item.status || "-") + "</td><td>" + esc(fmtScore(item)) +
        "</td><td>" + esc(fmtDuration(item.durationSec)) + "</td><td>" + esc(fmtDate(item.date)) + "</td></tr>";
    }).join("");
    var list = "<h2>tháng này ghi chép</h2><table><thead><tr><th>tên</th><th>loại</th><th>tình trạng</th><th>Kết quả</th><th>Thời lượng</th><th>ngày tháng</th></tr></thead><tbody>" +
      listRows + "</tbody></table>";
    var detailItems = rowsOf(d).filter(function (item) {
      return (item.wrong && item.wrong.length) || item.writingTask1 || item.writingTask2 || (item.mistakes && item.mistakes.length);
    });
    var details = "<h2>lỗi chủ đề biến thể của | viết bài văn</h2>" + (detailItems.length ? detailItems.map(function (item) {
      return '<article class="rpt-item"><h3>' + esc(item.title) + " · " + esc(item.kind) + "</h3>" +
        '<p class="rpt-meta">' + esc(fmtDate(item.date)) + " · " + esc(fmtScore(item)) + "</p>" +
        wrongBlock(item) + "</article>";
    }).join("") : "<p>tháng này không có báo cáo lên cấp trên của lỗi chủ đề có thể viết bài văn </p>");
    root.innerHTML = cover + kpis + charts + list + details;
  }

  if (printBtn) printBtn.addEventListener("click", function () { window.print(); });
  if (!studentId) {
    root.innerHTML = '<p class="err">thiếu học sinh</p>';
    return;
  }
  T.api("/api/teacher/students/" + studentId + "/report" + (month ? "?month=" + encodeURIComponent(month) : ""))
    .then(function (d) {
      render(d || {});
    })
    .catch(function (e) {
      root.innerHTML = '<p class="err">' + esc(e.message || " Tải không thành công ") + "</p>";
    });
})();
