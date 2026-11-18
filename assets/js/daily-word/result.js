/* =========================================================================
   daily-word/result.js — kết toán trang + có thể Lưu / chia thầy hôm nay báo cáo
   ========================================================================= */
(function () {
  "use strict";
  var DW = window.YYSD_DAILY_WORD;
  var root = document.getElementById("dw-root");

  function loadResult() {
    try {
      return JSON.parse(localStorage.getItem(DW.KEYS.result) || "null");
    } catch (e) {
      return null;
    }
  }

  function maskPhone(p) {
    p = String(p || "");
    if (p.length < 7) return p || "—";
    return p.slice(0, 3) + "****" + p.slice(-4);
  }

  function fmtTime(sec) {
    sec = Number(sec) || 0;
    if (!sec) return "—";
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    if (!m) return s + " giây ";
    return m + " điểm " + (s? s + " giây ": "");
  }

  function pad2(n) { return n < 10? "0" + n: String(n); }

  function fmtFinished(ts) {
    if (!ts) return "";
    var d = new Date(ts);
    if (isNaN(d.getTime())) return "";
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()) +
      " " + pad2(d.getHours()) + ":" + pad2(d.getMinutes());
  }

  function buildReportText(r) {
    var total = r.total || 0;
    var mastered = r.mastered!= null? r.mastered: total;
    var rate = total? Math.round((mastered / total) * 100): 0;
    var lines = [];
    lines.push("[YYSD · hôm nay Từ vựng Học tập báo cáo]");
    lines.push(" ngày: " + (r.date || "—"));
    lines.push(" thời gian hoàn thành: " + (fmtFinished(r.finishedAt) || "—"));
    lines.push(" Học viên: " + (r.studentName || " Chưa điền ghi tính danh "));
    lines.push(" điện thoại: " + maskPhone(r.studentPhone));
    lines.push(" từ sách: " + (r.bookLabel || "—"));
    lines.push(" Học tập số lượng: " + total + " từ ");
    lines.push(" nắm giữ dẫn đầu: " + rate + "% (nắm giữ " + mastered + " / " + total + ") ");
    lines.push(" thời gian sử dụng: " + fmtTime(r.elapsedSec));
    lines.push("");
    lines.push(" Các từ phát âm còn yếu: " + ((r.weakSpeak && r.weakSpeak.length)? r.weakSpeak.join(", "): " Không "));
    lines.push(" Chính tả Dễ từ sai: " + ((r.weakSpell && r.weakSpell.length)? r.weakSpell.join(", "): " Không "));
    lines.push(" Giải nghĩa Dễ từ sai: " + ((r.weakMeaning && r.weakMeaning.length)? r.weakMeaning.join(", "): " Không "));
    lines.push("");
    lines.push(" hôm nay Học tập Từ vựng rõ ràng chi tiết: ");
    (r.words || []).forEach(function (w, i) {
      var tags = [];
      if (w.speakingWrong) tags.push(" phát âm yếu ");
      if (w.spellingWrong) tags.push(" Chính tả yếu ");
      if (w.meaningWrong) tags.push(" Giải nghĩa yếu ");
      lines.push((i + 1) + ". " + w.word +
        (w.ipa? " " + w.ipa: "") +
        (w.meaning? " — " + w.meaning: "") +
        (tags.length? " [" + tags.join("·") + "]": ""));
    });
    if (!(r.words && r.words.length)) {
      lines.push(" (Không rõ ràng chi tiết) ");
    }
    lines.push("");
    lines.push("—— Học viên có thể Screenshots / phát bản báo cáo nhanh cho Giáo viên ——");
    return lines.join("\n");
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        if (!document.execCommand("copy")) throw new Error("copy failed");
        resolve();
      } catch (e) {
        reject(e);
      } finally {
        document.body.removeChild(ta);
      }
    });
  }

  function downloadText(filename, text) {
    var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      URL.revokeObjectURL(url);
      a.remove();
    }, 0);
  }

  function boot() {
    var r = loadResult();
    var task = DW.getTask();
    if (!r && task && task.completed) {
      r = {
        total: task.wordList.length,
        mastered: task.wordList.length,
        weakSpeak: task.weakSpeak || [],
        weakSpell: task.weakSpell || [],
        bookLabel: task.bookLabel || "",
        words: (task.wordList || []).map(function (w) {
          return { word: w.word, meaning: w.meaning || "", ipa: w.ipa || "" };
        }),
        studentName: task.studentName || "",
        studentPhone: task.studentPhone || "",
        elapsedSec: 0,
        date: task.date,
        finishedAt: Date.now()
      };
    }
    if (!r) {
      root.innerHTML = '<div class="dw-fail"><p> tạm thời chưa có hôm nay báo cáo </p>' +
        '<p><a href="daily-word-setup.html"> Bắt đầu hôm nay nhiệm vụ </a></p></div>';
      return;
    }

    var total = r.total || 0;
    var mastered = r.mastered!= null? r.mastered: total;
    var rate = total? Math.round((mastered / total) * 100): 0;
    var speakN = (r.weakSpeak || []).length;
    var spellN = (r.weakSpell || []).length;
    var meaningN = (r.weakMeaning || []).length;
    var reportText = buildReportText(r);
    var fileName = " mỗi ngày Từ vựng báo cáo -" + (r.date || DW.todayStr()) +
      (r.studentName? "-" + r.studentName: "") + ".txt";

    function listHtml(arr) {
      if (!arr ||!arr.length) return "<li> Không </li>";
      return arr.map(function (w) { return "<li>" + DW.esc(w) + "</li>"; }).join("");
    }

    function wordsTable() {
      var words = r.words || [];
      if (!words.length) return '<p class="dw-hint"> Không Từ vựng rõ ràng chi tiết </p>';
      var rows = words.map(function (w, i) {
        var tags = [];
        if (w.speakingWrong) tags.push('<span class="dw-tag dw-tag--bad"> phát âm </span>');
        if (w.spellingWrong) tags.push('<span class="dw-tag dw-tag--bad"> Chính tả </span>');
        if (w.meaningWrong) tags.push('<span class="dw-tag dw-tag--bad"> Giải nghĩa </span>');
        if (!tags.length) tags.push('<span class="dw-tag dw-tag--ok"> thông qua </span>');
        return "<tr>" +
          "<td>" + (i + 1) + "</td>" +
          "<td><strong>" + DW.esc(w.word) + "</strong>" +
            (w.ipa? '<div class="dw-ipa">' + DW.esc(w.ipa) + "</div>": "") + "</td>" +
          "<td>" + DW.esc(w.meaning || "—") + "</td>" +
          "<td>" + tags.join(" ") + "</td>" +
          "</tr>";
      }).join("");
      return '<div class="dw-table-wrap"><table class="dw-table">' +
        "<thead><tr><th>#</th><th> Từ vựng </th><th> Giải nghĩa </th><th> kết quả </th></tr></thead>" +
        "<tbody>" + rows + "</tbody></table></div>";
    }

    root.innerHTML =
      '<div class="dw-shell dw-shell--report">' +
        '<header class="dw-top no-print">' +
          '<a class="dw-back" href="zone.html?zone=study&s=vocab" aria-label=" Quay lại ">←</a>' +
          '<div class="dw-top__title"> hôm nay Học tập báo cáo </div>' +
        "</header>" +
        '<div class="dw-report" id="dw-report-card">' +
          '<div class="dw-report__brand"> YYSD · hôm nay Từ vựng Học tập báo cáo </div>' +
          '<div class="dw-report__meta">' +
            '<div><span> Học viên </span><strong>' + DW.esc(r.studentName || " Chưa điền ghi tính danh ") + "</strong></div>" +
            '<div><span> điện thoại </span><strong>' + DW.esc(maskPhone(r.studentPhone)) + "</strong></div>" +
            '<div><span> ngày </span><strong>' + DW.esc(r.date || "—") + "</strong></div>" +
            '<div><span> từ sách </span><strong>' + DW.esc(r.bookLabel || " mỗi ngày Từ vựng ") + "</strong></div>" +
            '<div><span> thời gian sử dụng </span><strong>' + DW.esc(fmtTime(r.elapsedSec)) + "</strong></div>" +
            '<div><span> hoàn thành </span><strong>' + DW.esc(fmtFinished(r.finishedAt) || "—") + "</strong></div>" +
          "</div>" +
          '<div class="dw-stats">' +
            '<div class="dw-stat"><div class="dw-stat__n">' + total + '</div><div class="dw-stat__l"> hôm nay Học tập </div></div>' +
            '<div class="dw-stat"><div class="dw-stat__n">' + rate + '%</div><div class="dw-stat__l"> nắm giữ dẫn đầu </div></div>' +
            '<div class="dw-stat"><div class="dw-stat__n">' + speakN + '</div><div class="dw-stat__l"> Phát âm cần cải thiện </div></div>' +
            '<div class="dw-stat"><div class="dw-stat__n">' + (spellN + meaningN) + '</div><div class="dw-stat__l"> Chính tả / Giải nghĩa yếu </div></div>' +
          "</div>" +
          '<div class="dw-weak"><h3> Các từ phát âm cần cải thiện </h3><ul>' + listHtml(r.weakSpeak) + "</ul></div>" +
          '<div class="dw-weak"><h3> Chính tả Dễ từ sai </h3><ul>' + listHtml(r.weakSpell) + "</ul></div>" +
          '<div class="dw-weak"><h3> Giải nghĩa Dễ từ sai </h3><ul>' + listHtml(r.weakMeaning) + "</ul></div>" +
          '<div class="dw-weak"><h3> hôm nay Từ vựng rõ ràng chi tiết </h3>' + wordsTable() + "</div>" +
          '<p class="dw-report__foot"> Vui lòng lưu hoặc gửi báo cáo nhanh cho Giáo viên </p>' +
        "</div>" +
        '<div class="dw-result-actions no-print">' +
          '<button type="button" class="dw-btn dw-btn--primary" id="dw-copy"> Sao chép báo cáo nhanh gửi Giáo viên </button>' +
          '<button type="button" class="dw-btn dw-btn--ghost" id="dw-download"> download TXT báo cáo </button>' +
          '<button type="button" class="dw-btn dw-btn--ghost" id="dw-print"> đóng dấu / tồn PDF</button>' +
          '<a class="dw-btn dw-btn--ghost" href="daily-word-setup.html"> lại học một tổ </a>' +
          '<a class="dw-btn dw-btn--ghost" href="zone.html?zone=study&s=vocab"> Quay lại Từ vựng trung tâm </a>' +
          '<p class="dw-hint" id="dw-share-tip" hidden> đã phục chế, có thể dán đến vi tín chia Giáo viên </p>' +
        "</div>" +
      "</div>";

    document.getElementById("dw-copy").addEventListener("click", function () {
      var tip = document.getElementById("dw-share-tip");
      copyText(reportText).then(function () {
        tip.hidden = false;
        tip.textContent = " đã phục chế, có thể dán đến vi tín chia Giáo viên ";
      }).catch(function () {
        tip.hidden = false;
        tip.textContent = " phục chế thất bại, mời đổi dùng « download TXT»";
      });
    });
    document.getElementById("dw-download").addEventListener("click", function () {
      downloadText(fileName, reportText);
    });
    document.getElementById("dw-print").addEventListener("click", function () {
      window.print();
    });

    if (task && task.completed) DW.clearTask();
  }

  boot();
})();
