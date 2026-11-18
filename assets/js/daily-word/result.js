/* =========================================================================
   daily-word/result.js — thanh toánđầu + tiền tố có thểLưu/cấpGiáo viênhôm nayBáo cáo
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
    if (!m) return s + " giây đơn vị thời gian";
    return m + " phần" + (s ? s + " giây đơn vị thời gian" : "");
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
    lines.push("【YYSD · hôm nayTừ vựnghọcBáo cáo】");
    lines.push("ngày tháng:" + (r.date || "—"));
    lines.push("thì hoàn thành ngữ phápgiữa:" + (fmtFinished(r.finishedAt) || "—"));
    lines.push("Học viên:" + (r.studentName || "Chưa điềnviếthọ và tên"));
    lines.push("điện thoại di động:" + maskPhone(r.studentPhone));
    lines.push("biến thể cũ của viết tắt của:" + (r.bookLabel || "—"));
    lines.push("họcsố lượng:" + total + " biến thể cũ của");
    lines.push("Thành thạotỉ lệ:" + rate + "%(Thành thạo " + mastered + " / " + total + ")");
    lines.push("sử dụng biến thể cũ của:" + fmtTime(r.elapsedSec));
    lines.push("");
    lines.push("Phát âmyếubiến thể cũ của:" + ((r.weakSpeak && r.weakSpeak.length) ? r.weakSpeak.join(",") : "không có"));
    lines.push("đánh vầnDễ saibiến thể cũ của:" + ((r.weakSpell && r.weakSpell.length) ? r.weakSpell.join(",") : "không có"));
    lines.push("NghĩaDễ saibiến thể cũ của:" + ((r.weakMeaning && r.weakMeaning.length) ? r.weakMeaning.join(",") : "không có"));
    lines.push("");
    lines.push("hôm nayhọcTừ vựngrõ ràng và chi tiết:");
    (r.words || []).forEach(function (w, i) {
      var tags = [];
      if (w.speakingWrong) tags.push("Phát âmyếu");
      if (w.spellingWrong) tags.push("đánh vầnyếu");
      if (w.meaningWrong) tags.push("Nghĩayếu");
      lines.push((i + 1) + ". " + w.word +
        (w.ipa ? " " + w.ipa : "") +
        (w.meaning ? " — " + w.meaning : "") +
        (tags.length ? " [" + tags.join("·") + "]" : ""));
    });
    if (!(r.words && r.words.length)) {
      lines.push("(vô minh Phật giáomỏng hoặc thon)");
    }
    lines.push("");
    lines.push("—— Học viêntiền tố có thểtin học ảnh chụp màn hình/truyền đitờ báo nàyhình thức kết hợp nói cung cấpGiáo viên ——");
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
      root.innerHTML = '<div class="dw-fail"><p>tạm thời không cóhôm nayBáo cáo</p>' +
        '<p><a href="daily-word-setup.html">Bắt đầuhôm nayNhiệm vụ</a></p></div>';
      return;
    }

    var total = r.total || 0;
    var mastered = r.mastered != null ? r.mastered : total;
    var rate = total ? Math.round((mastered / total) * 100) : 0;
    var speakN = (r.weakSpeak || []).length;
    var spellN = (r.weakSpell || []).length;
    var meaningN = (r.weakMeaning || []).length;
    var reportText = buildReportText(r);
    var fileName = "Hằng ngàyTừ vựngBáo cáo-" + (r.date || DW.todayStr()) +
      (r.studentName ? "-" + r.studentName : "") + ".txt";

    function listHtml(arr) {
      if (!arr || !arr.length) return "<li>không có</li>";
      return arr.map(function (w) { return "<li>" + DW.esc(w) + "</li>"; }).join("");
    }

    function wordsTable() {
      var words = r.words || [];
      if (!words.length) return '<p class="dw-hint">không cóTừ vựngrõ ràng và chi tiết</p>';
      var rows = words.map(function (w, i) {
        var tags = [];
        if (w.speakingWrong) tags.push('<span class="dw-tag dw-tag--bad">Phát âm</span>');
        if (w.spellingWrong) tags.push('<span class="dw-tag dw-tag--bad">đánh vần</span>');
        if (w.meaningWrong) tags.push('<span class="dw-tag dw-tag--bad">Nghĩa</span>');
        if (!tags.length) tags.push('<span class="dw-tag dw-tag--ok">đi qua</span>');
        return "<tr>" +
          "<td>" + (i + 1) + "</td>" +
          "<td><strong>" + DW.esc(w.word) + "</strong>" +
            (w.ipa ? '<div class="dw-ipa">' + DW.esc(w.ipa) + "</div>" : "") + "</td>" +
          "<td>" + DW.esc(w.meaning || "—") + "</td>" +
          "<td>" + tags.join(" ") + "</td>" +
          "</tr>";
      }).join("");
      return '<div class="dw-table-wrap"><table class="dw-table">' +
        "<thead><tr><th>#</th><th>Từ vựng</th><th>Nghĩa</th><th>Kết quả</th></tr></thead>" +
        "<tbody>" + rows + "</tbody></table></div>";
    }

    root.innerHTML =
      '<div class="dw-shell dw-shell--report">' +
        '<header class="dw-top no-print">' +
          '<a class="dw-back" href="zone.html?zone=study&s=vocab" aria-label="Quay lại">←</a>' +
          '<div class="dw-top__title">hôm nayhọcBáo cáo</div>' +
        "</header>" +
        '<div class="dw-report" id="dw-report-card">' +
          '<div class="dw-report__brand">YYSD · hôm nayTừ vựnghọcBáo cáo</div>' +
          '<div class="dw-report__meta">' +
            '<div><span>Học viên</span><strong>' + DW.esc(r.studentName || "Chưa điềnviếthọ và tên") + "</strong></div>" +
            '<div><span>điện thoại di động</span><strong>' + DW.esc(maskPhone(r.studentPhone)) + "</strong></div>" +
            '<div><span>ngày tháng</span><strong>' + DW.esc(r.date || "—") + "</strong></div>" +
            '<div><span>biến thể cũ của viết tắt của</span><strong>' + DW.esc(r.bookLabel || "Hằng ngàyTừ vựng") + "</strong></div>" +
            '<div><span>sử dụng biến thể cũ của</span><strong>' + DW.esc(fmtTime(r.elapsedSec)) + "</strong></div>" +
            '<div><span>Hoàn thành</span><strong>' + DW.esc(fmtFinished(r.finishedAt) || "—") + "</strong></div>" +
          "</div>" +
          '<div class="dw-stats">' +
            '<div class="dw-stat"><div class="dw-stat__n">' + total + '</div><div class="dw-stat__l">hôm nayhọc</div></div>' +
            '<div class="dw-stat"><div class="dw-stat__n">' + rate + '%</div><div class="dw-stat__l">Thành thạotỉ lệ</div></div>' +
            '<div class="dw-stat"><div class="dw-stat__n">' + speakN + '</div><div class="dw-stat__l">Phát âmyếu</div></div>' +
            '<div class="dw-stat"><div class="dw-stat__n">' + (spellN + meaningN) + '</div><div class="dw-stat__l">đánh vần/Nghĩayếu</div></div>' +
          "</div>" +
          '<div class="dw-weak"><h3>Phát âmyếubiến thể cũ của</h3><ul>' + listHtml(r.weakSpeak) + "</ul></div>" +
          '<div class="dw-weak"><h3>đánh vầnDễ saibiến thể cũ của</h3><ul>' + listHtml(r.weakSpell) + "</ul></div>" +
          '<div class="dw-weak"><h3>NghĩaDễ saibiến thể cũ của</h3><ul>' + listHtml(r.weakMeaning) + "</ul></div>" +
          '<div class="dw-weak"><h3>hôm nayTừ vựngrõ ràng và chi tiết</h3>' + wordsTable() + "</div>" +
          '<p class="dw-report__foot">mờiLưucó thểtruyền đitờ báo nàyhình thức kết hợp nói cung cấpGiáo viên</p>' +
        "</div>" +
        '<div class="dw-result-actions no-print">' +
          '<button type="button" class="dw-btn dw-btn--primary" id="dw-copy">nhân bảnBáo cáocung cấpGiáo viên</button>' +
          '<button type="button" class="dw-btn dw-btn--ghost" id="dw-download">Tải xuống TXT Báo cáo</button>' +
          '<button type="button" class="dw-btn dw-btn--ghost" id="dw-print">đóng dấu / tồn tại PDF</button>' +
          '<a class="dw-btn dw-btn--ghost" href="daily-word-setup.html">lại học một họ</a>' +
          '<a class="dw-btn dw-btn--ghost" href="zone.html?zone=study&s=vocab">Quay lạiTừ vựngtrung tâm</a>' +
          '<p class="dw-hint" id="dw-share-tip" hidden>đãnhân bản,tiền tố có thểdánđếnWeixin hoặc WeChatcấpGiáo viên</p>' +
        "</div>" +
      "</div>";

    document.getElementById("dw-copy").addEventListener("click", function () {
      var tip = document.getElementById("dw-share-tip");
      copyText(reportText).then(function () {
        tip.hidden = false;
        tip.textContent = "đãnhân bản,tiền tố có thểdánđếnWeixin hoặc WeChatcấpGiáo viên";
      }).catch(function () {
        tip.hidden = false;
        tip.textContent = "nhân bảnThất bại,mờichuyển sang«Tải xuống TXT»";
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
