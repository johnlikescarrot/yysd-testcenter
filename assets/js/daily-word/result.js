/* =========================================================================
   daily-word/result.js - thanh toán đầu + có thể bảo tồn/cấp giáo viên của hôm nay thông báo
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
    if (p.length < 7) return p || "-";
    return p.slice(0, 3) + "****" + p.slice(-4);
  }

  function fmtTime(sec) {
    sec = Number(sec) || 0;
    if (!sec) return "-";
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    if (!m) return s + " giây ";
    return m + " điểm " + (s ? s + " giây " : "");
  }

  function pad2(n) { return n < 10 ? "0" + n : String(n); }

  function fmtFinished(ts) {
    if (!ts) return "";
    var d = new Date(ts);
    if (isNaN(d.getTime())) return "";
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()) +
      " " + pad2(d.getHours()) + ":" + pad2(d.getMinutes());
  }

  function buildReportText(r) {
    var total = r.total || 0;
    var mastered = r.mastered != null ? r.mastered : total;
    var rate = total ? Math.round((mastered / total) * 100) : 0;
    var lines = [];
    lines.push("[YYSD · hôm nay từ học thông báo]");
    lines.push(" ngày tháng: " + (r.date || "-"));
    lines.push(" thì hoàn thành giữa: " + (fmtFinished(r.finishedAt) || "-"));
    lines.push(" Học viên: " + (r.studentName || " chưa điền vào biểu mẫu và tên "));
    lines.push(" điện thoại di động: " + maskPhone(r.studentPhone));
    lines.push(" Sách từ vựng: " + (r.bookLabel || "-"));
    lines.push(" học số lượng: " + total + " Từ ");
    lines.push(" nắm bắt tỉ lệ: " + rate + "%(nắm bắt " + mastered + " / " + total + ")");
    lines.push(" Thời lượng: " + fmtTime(r.elapsedSec));
    lines.push("");
    lines.push(" phát âm yếu biến thể cũ của |: " + ((r.weakSpeak && r.weakSpeak.length) ? r.weakSpeak.join(", ") : " không có "));
    lines.push(" đánh vần dễ lỗi biến thể cũ của |: " + ((r.weakSpell && r.weakSpell.length) ? r.weakSpell.join(", ") : " không có "));
    lines.push(" nghĩa của cái gì đó dễ lỗi biến thể cũ của |: " + ((r.weakMeaning && r.weakMeaning.length) ? r.weakMeaning.join(", ") : " không có "));
    lines.push("");
    lines.push(" hôm nay học từ rõ ràng và chi tiết: ");
    (r.words || []).forEach(function (w, i) {
      var tags = [];
      if (w.speakingWrong) tags.push(" phát âm yếu ");
      if (w.spellingWrong) tags.push(" đánh vần yếu ");
      if (w.meaningWrong) tags.push(" nghĩa của cái gì đó yếu ");
      lines.push((i + 1) + ". " + w.word +
        (w.ipa ? " " + w.ipa : "") +
        (w.meaning ? " - " + w.meaning : "") +
        (tags.length ? " [" + tags.join("·") + "]" : ""));
    });
    if (!(r.words && r.words.length)) {
      lines.push("(vô minh mỏng hoặc thon)");
    }
    lines.push("");
    lines.push("-- học sinh có thể ảnh chụp màn hình/truyền đi tờ báo này nói cho giáo viên --");
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
      root.innerHTML = '<div class="dw-fail"><p>tạm thời không có hôm nay thông báo</p>' +
        '<p><a href="daily-word-setup.html">bắt đầu hôm nay nhiệm vụ</a></p></div>';
      return;
    }

    var total = r.total || 0;
    var mastered = r.mastered != null ? r.mastered : total;
    var rate = total ? Math.round((mastered / total) * 100) : 0;
    var speakN = (r.weakSpeak || []).length;
    var spellN = (r.weakSpell || []).length;
    var meaningN = (r.weakMeaning || []).length;
    var reportText = buildReportText(r);
    var fileName = " hàng ngày từ thông báo-" + (r.date || DW.todayStr()) +
      (r.studentName ? "-" + r.studentName : "") + ".txt";

    function listHtml(arr) {
      if (!arr || !arr.length) return "<li>không có</li>";
      return arr.map(function (w) { return "<li>" + DW.esc(w) + "</li>"; }).join("");
    }

    function wordsTable() {
      var words = r.words || [];
      if (!words.length) return '<p class="dw-hint">không có từ rõ ràng và chi tiết</p>';
      var rows = words.map(function (w, i) {
        var tags = [];
        if (w.speakingWrong) tags.push('<span class="dw-tag dw-tag--bad">Phát âm</span>');
        if (w.spellingWrong) tags.push('<span class="dw-tag dw-tag--bad">đánh vần</span>');
        if (w.meaningWrong) tags.push('<span class="dw-tag dw-tag--bad">Định nghĩa</span>');
        if (!tags.length) tags.push('<span class="dw-tag dw-tag--ok">đi qua</span>');
        return "<tr>" +
          "<td>" + (i + 1) + "</td>" +
          "<td><strong>" + DW.esc(w.word) + "</strong>" +
            (w.ipa ? '<div class="dw-ipa">' + DW.esc(w.ipa) + "</div>" : "") + "</td>" +
          "<td>" + DW.esc(w.meaning || "-") + "</td>" +
          "<td>" + tags.join(" ") + "</td>" +
          "</tr>";
      }).join("");
      return '<div class="dw-table-wrap"><table class="dw-table">' +
        "<thead><tr><th>#</th><th>Từ vựng</th><th>Định nghĩa</th><th>Kết quả</th></tr></thead>" +
        "<tbody>" + rows + "</tbody></table></div>";
    }

    root.innerHTML =
      '<div class="dw-shell dw-shell--report">' +
        '<header class="dw-top no-print">' +
          '<a class="dw-back" href="zone.html?zone=study&s=vocab" aria-label=" Quay lại ">←</a>' +
          '<div class="dw-top__title">hôm nay học thông báo</div>' +
        "</header>" +
        '<div class="dw-report" id="dw-report-card">' +
          '<div class="dw-report__brand">YYSD · hôm nay từ học thông báo</div>' +
          '<div class="dw-report__meta">' +
            '<div><span>Học viên</span><strong>' + DW.esc(r.studentName || " chưa điền vào biểu mẫu và tên ") + "</strong></div>" +
            '<div><span>điện thoại di động</span><strong>' + DW.esc(maskPhone(r.studentPhone)) + "</strong></div>" +
            '<div><span>ngày tháng</span><strong>' + DW.esc(r.date || "-") + "</strong></div>" +
            '<div><span>Sách từ vựng</span><strong>' + DW.esc(r.bookLabel || " hàng ngày từ ") + "</strong></div>" +
            '<div><span>Thời lượng</span><strong>' + DW.esc(fmtTime(r.elapsedSec)) + "</strong></div>" +
            '<div><span>Hoàn thành</span><strong>' + DW.esc(fmtFinished(r.finishedAt) || "-") + "</strong></div>" +
          "</div>" +
          '<div class="dw-stats">' +
            '<div class="dw-stat"><div class="dw-stat__n">' + total + '</div><div class="dw-stat__l">hôm nay học</div></div>' +
            '<div class="dw-stat"><div class="dw-stat__n">' + rate + '%</div><div class="dw-stat__l">nắm bắt tỉ lệ</div></div>' +
            '<div class="dw-stat"><div class="dw-stat__n">' + speakN + '</div><div class="dw-stat__l">phát âm yếu</div></div>' +
            '<div class="dw-stat"><div class="dw-stat__n">' + (spellN + meaningN) + '</div><div class="dw-stat__l">đánh vần/nghĩa của cái gì đó yếu</div></div>' +
          "</div>" +
          '<div class="dw-weak"><h3>phát âm yếu biến thể cũ của |</h3><ul>' + listHtml(r.weakSpeak) + "</ul></div>" +
          '<div class="dw-weak"><h3>đánh vần dễ lỗi biến thể cũ của |</h3><ul>' + listHtml(r.weakSpell) + "</ul></div>" +
          '<div class="dw-weak"><h3>nghĩa của cái gì đó dễ lỗi biến thể cũ của |</h3><ul>' + listHtml(r.weakMeaning) + "</ul></div>" +
          '<div class="dw-weak"><h3>hôm nay từ rõ ràng và chi tiết</h3>' + wordsTable() + "</div>" +
          '<p class="dw-report__foot">mời bảo tồn có thể truyền đi tờ báo này nói cho giáo viên</p>' +
        "</div>" +
        '<div class="dw-result-actions no-print">' +
          '<button type="button" class="dw-btn dw-btn--primary" id="dw-copy">nhân bản thông báo cho giáo viên</button>' +
          '<button type="button" class="dw-btn dw-btn--ghost" id="dw-download">Tải xuống TXT Báo cáo</button>' +
          '<button type="button" class="dw-btn dw-btn--ghost" id="dw-print">đóng dấu / tồn tại PDF</button>' +
          '<a class="dw-btn dw-btn--ghost" href="daily-word-setup.html">lại học một hình thành</a>' +
          '<a class="dw-btn dw-btn--ghost" href="zone.html?zone=study&s=vocab">trở về từ trung tâm</a>' +
          '<p class="dw-hint" id="dw-share-tip" hidden>đã nhân bản, có thể dán đến Weixin hoặc WeChat cấp giáo viên</p>' +
        "</div>" +
      "</div>";

    document.getElementById("dw-copy").addEventListener("click", function () {
      var tip = document.getElementById("dw-share-tip");
      copyText(reportText).then(function () {
        tip.hidden = false;
        tip.textContent = " đã nhân bản, có thể dán đến Weixin hoặc WeChat cấp giáo viên ";
      }).catch(function () {
        tip.hidden = false;
        tip.textContent = " nhân bản bị đánh bại, mời chuyển sang«Tải xuống TXT»";
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
