/* câu hỏi từ đề thi các năm trước ngân hàng câu hỏi khu vực hạn chế ra vào: có thể không thể tiến lên sau cuối /api/toefl/access làm chuẩn lấy không đến=khóa(fail-safe) 
   miễn phí cuộn lại(id=)/đánh trước chạy nước rút che phủ(bank + viết tắt của practice)/giáo viên xem trước(preview=1) không khóa  */
(function (w) {
  "use strict";

  var LOCKED = { on: false, reason: "error" };
  var REASONS = {
    none: { t: " luyện tập khu vực vẫn chưa mở ", d: " câu hỏi từ đề thi các năm trước ngân hàng câu hỏi cần giáo viên mở hoàng hậu tài năng đi vào miễn phí ngân hàng câu hỏi không cần mở, đăng ký tức là làm " },
    scheduled: { t: " luyện tập khu vực chưa mở ", d: " giáo viên đã làm bạn sắp xếp mở, thời gian cuối cùng trong trường hợp đó có thể đi vào luyện tập " },
    expired: { t: " luyện tập phạm vi quyền hạn đã đến hạn ", d: " đã hoàn thành của ghi chép vẫn có thể tồn tại cá nhân đầu xem xét nghĩ tiếp tục luyện tập, mời biến thể của | giáo viên tiếp tục biến thể của " },
    off: { t: " luyện tập khu vực đã ngừng sử dụng ", d: " giáo viên đã ngừng sử dụng bạn của luyện tập phạm vi quyền hạn như yêu cầu tiếp tục, mời biến thể của | giáo viên lại mở " },
    error: { t: " tạm thời không thể xác nhận phạm vi quyền hạn ", d: " Internet có thể phục vụ bất thường, làm an toàn động cơ trước khóa sống mời một lát nữa lại kiểm tra " }
  };

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function fmtWhen(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    return (d.getMonth() + 1) + " tháng " + d.getDate() + " viết tắt của " + pad(d.getHours()) + ":" + pad(d.getMinutes());
  }
  function fmtLeft(ms) {
    var s = Math.max(0, Math.floor(ms / 1000));
    var day = Math.floor(s / 86400);
    var h = Math.floor((s % 86400) / 3600);
    var m = Math.floor((s % 3600) / 60);
    if (day > 0) return day + " ngày " + pad(h) + ":" + pad(m) + ":" + pad(s % 60);
    if (h > 0) return h + ":" + pad(m) + ":" + pad(s % 60);
    return m + ":" + pad(s % 60);
  }

  function fetchAccess() {
    var A = w.YYSD_APP;
    if (!A || !A.api) return Promise.resolve(LOCKED);
    return A.api("/api/toefl/access").then(function (d) {
      var ac = d && d.access;
      if (ac && ac.staff) return { on: true, staff: true };
      return (ac && ac.practice) || LOCKED;
    }).catch(function (e) {
      var m = (e && e.message) || "";
      if (m.indexOf(" Đăng nhập ") >= 0) {
        w.location.replace("login.html?next=" + encodeURIComponent(location.pathname.split("/").pop() + location.search));
        return new Promise(function () {});
      }
      return LOCKED;
    });
  }

  // miễn phí cuộn lại / đánh trước chạy nước rút che phủ / giáo viên xem trước trực tiếp cho qua; phần còn lại(ngậm trong miệng tình trạng không rõ)tất cả yêu cầu băng qua khóa
  function exemptOf(search, run) {
    var qs = new URLSearchParams(search);
    if (qs.get("preview") === "1") return true;
    if (qs.get("id")) return true;
    if (qs.get("bank")) return !!(run && run.kind && run.kind !== "practice");
    return false;
  }
  function exempt() {
    var run = null;
    try { run = w.YYSD_TIKU_RUN && w.YYSD_TIKU_RUN.load ? w.YYSD_TIKU_RUN.load() : null; } catch (e) {}
    return exemptOf(location.search, run);
  }

  function showLock(st) {
    var old = document.getElementById("yysd-lock");
    if (old) old.remove();
    var meta = REASONS[st.reason] || REASONS.none;
    var box = document.createElement("div");
    box.id = "yysd-lock";
    box.className = "yysd-lock";
    box.innerHTML = '<div class="yysd-lock-card">' +
      '<span class="yysd-lock-icon" aria-hidden="true">🔒</span>' +
      "<h2>" + meta.t + "</h2><p>" + meta.d + "</p>" +
      '<p class="yysd-lock-count" id="yysd-lock-count"></p>' +
      '<div class="yysd-lock-acts">' +
        '<button type="button" id="yysd-lock-retry">lại kiểm tra</button>' +
        '<a href="free.html">đi miễn phí ngân hàng câu hỏi</a>' +
        '<a href="home.html">trở về trang chủ</a>' +
      "</div></div>";
    document.body.appendChild(box);

    var countEl = box.querySelector("#yysd-lock-count");
    if (st.reason === "scheduled" && st.startAt) {
      var tick = function () {
        var left = Date.parse(st.startAt) - Date.now();
        if (left <= 0) {
          fetchAccess().then(function (next) {
            if (next.on) location.reload();
            else showLock(next);
          });
          return;
        }
        countEl.textContent = " cách một khoảng ... từ mở vẫn còn " + fmtLeft(left);
        setTimeout(tick, 1000);
      };
      tick();
    } else if (st.reason === "expired" && st.expireAt) {
      countEl.textContent = " đến hạn thời gian: " + fmtWhen(st.expireAt);
    }

    box.querySelector("#yysd-lock-retry").onclick = function () {
      var btn = this;
      btn.disabled = true;
      btn.textContent = " kiểm tra Trung Quốc...";
      fetchAccess().then(function (next) {
        if (next.on) location.reload();
        else showLock(next);
      });
    };
  }

  // tự động nộp bài thi: chủ đề làm một nửa chăn đến hạn/lấy lại biến thể cũ của | sử dụng
  function cut(reason, onCut) {
    if (w.__yysdCut) return;
    w.__yysdCut = true;
    var box = document.createElement("div");
    box.className = "yysd-cut";
    box.innerHTML = "<div><b>" + (reason === "expired" ? " luyện tập thời gian đã đến " : " luyện tập phạm vi quyền hạn đã chăn lấy lại ") + "</b><p>" +
      (reason === "expired" ? " đã làm bạn tự động nộp bài thi, đang ở nhảy đến..." : " giáo viên lấy lại hoàn thành luyện tập phạm vi quyền hạn, đã làm bạn tự động nộp bài thi ") + "</p></div>";
    document.body.appendChild(box);
    setTimeout(function () {
      if (onCut) onCut();
      else location.reload();
    }, 1200);
  }

  function armWatch(st, onCut) {
    var bar = document.querySelector(".ets-bar-right");
    var chip = null;
    if (bar && st.expireAt) {
      chip = document.createElement("span");
      chip.className = "ets-expire-chip";
      bar.insertBefore(chip, bar.firstChild);
    }
    var tick = function () {
      if (w.__yysdCut) return;
      if (!st.expireAt) return;
      var left = Date.parse(st.expireAt) - Date.now();
      if (left <= 5000) { cut("expired", onCut); return; }
      if (chip) {
        chip.textContent = " phần còn lại " + fmtLeft(left);
        if (left < 60000) chip.classList.add("is-soon");
      }
      setTimeout(tick, 1000);
    };
    if (st.expireAt) tick();

    var poll = function () {
      if (w.__yysdCut) return;
      fetchAccess().then(function (next) {
        if (w.__yysdCut) return;
        if (!next.on) {
          cut(next.reason === "expired" ? "expired" : "off", onCut);
          return;
        }
        st = next;
        setTimeout(poll, 300000);
      });
    };
    setTimeout(poll, 300000);

    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState !== "visible" || w.__yysdCut) return;
      fetchAccess().then(function (next) {
        if (!next.on && !w.__yysdCut) {
          cut(next.reason === "expired" ? "expired" : "off", onCut);
        }
      });
    });
  }

  function gate() {
    if (exempt()) return Promise.resolve({ on: true, staff: true });
    return fetchAccess();
  }

  // cổng thông tin web(practice / bốn dùng trong | lab / bank): khóa sống trong trường hợp đó biến thể của | khóa dừng, Quay lại false
  function boot() {
    return gate().then(function (st) {
      if (st.on) return true;
      showLock(st);
      return false;
    });
  }

  // làm chủ đề đầu: cho qua hoàng hậu treo đếm ngược chip + thăm dò; đến hạn/chăn lấy lại điều chuyển onCut tự động nộp bài thi
  function paper(onCut) {
    return gate().then(function (st) {
      if (!st.on) {
        showLock(st);
        return false;
      }
      armWatch(st, onCut);
      return true;
    });
  }

  w.YYSD_ACCESS = { fetch: fetchAccess, boot: boot, paper: paper, showLock: showLock, _exemptOf: exemptOf };
})(window);
