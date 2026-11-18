/* đề thi thật Ngân hàng đề khu gác cổng: có thể hay không tiến về sau đầu /api/toefl/access làm chuẩn. không lấy được = Khóa (fail-safe).
    miễn phí cuốn (id=)/ Gói tăng tốc trước kỳ thi (bank + không phải practice)/ Giáo viên Xem trước (preview=1) không Khóa. */
(function (w) {
  "use strict";

  var LOCKED = { on: false, reason: "error" };
  var REASONS = {
    none: { t: " Khu luyện tập còn chưa mở thông ", d: " đề thi thật Ngân hàng đề cần Giáo viên kích hoạt sau mới có thể tiến nhập. miễn phí Ngân hàng đề không cần kích hoạt, Đăng nhập tiếp xúc làm. " },
    scheduled: { t: " Khu luyện tập chưa Mở ", d: " Giáo viên đã cho bạn an bài kích hoạt, thời gian đến có thể đi vào Luyện tập. " },
    expired: { t: " Luyện tập quyền hạn Đã hết hạn ", d: " đã làm xong ghi chép nhưng có thể tại cá nhân trang Xem. muốn tiếp tục Luyện tập, xin liên lạc Giáo viên tục thời hạn. " },
    off: { t: " Khu luyện tập Đã tạm ngưng ", d: " Giáo viên Đã tạm ngưng của bạn Luyện tập quyền hạn. ví dụ cần Tiếp tục, xin liên lạc Giáo viên một lần nữa kích hoạt. " },
    error: { t: " tạm thời không cách nào Xác nhận quyền hạn ", d: " mạng lưới *internet hoặc phục vụ dị thường, là lý do an toàn trước khóa lại. xin sau một lần nữa kiểm tra. " }
  };

  function pad(n) { return (n < 10? "0": "") + n; }
  function fmtWhen(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    return (d.getMonth() + 1) + " tháng " + d.getDate() + " ngày " + pad(d.getHours()) + ":" + pad(d.getMinutes());
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
    if (!A ||!A.api) return Promise.resolve(LOCKED);
    return A.api("/api/toefl/access").then(function (d) {
      var ac = d && d.access;
      if (ac && ac.staff) return { on: true, staff: true };
      return (ac && ac.practice) || LOCKED;
    }).catch(function (e) {
      var m = (e && e.message) || "";
      if (m.indexOf("Đăng nhập") >= 0) {
        w.location.replace("login.html?next=" + encodeURIComponent(location.pathname.split("/").pop() + location.search));
        return new Promise(function () {});
      }
      return LOCKED;
    });
  }

  // miễn phí cuốn / Gói tăng tốc trước kỳ thi / Giáo viên Xem trước trực tiếp cho đi; còn lại (hàm Trạng thái không rõ) đều phải qua Khóa
  function exemptOf(search, run) {
    var qs = new URLSearchParams(search);
    if (qs.get("preview") === "1") return true;
    if (qs.get("id")) return true;
    if (qs.get("bank")) return !!(run && run.kind && run.kind!== "practice");
    return false;
  }
  function exempt() {
    var run = null;
    try { run = w.YYSD_TIKU_RUN && w.YYSD_TIKU_RUN.load? w.YYSD_TIKU_RUN.load(): null; } catch (e) {}
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
        '<button type="button" id="yysd-lock-retry"> một lần nữa kiểm tra </button>' +
        '<a href="free.html"> đi miễn phí Ngân hàng đề </a>' +
        '<a href="home.html"> Về trang chủ </a>' +
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
        countEl.textContent = " cách Mở còn có " + fmtLeft(left);
        setTimeout(tick, 1000);
      };
      tick();
    } else if (st.reason === "expired" && st.expireAt) {
      countEl.textContent = " đến kỳ thời gian: " + fmtWhen(st.expireAt);
    }

    box.querySelector("#yysd-lock-retry").onclick = function () {
      var btn = this;
      btn.disabled = true;
      btn.textContent = " kiểm tra Vừa …";
      fetchAccess().then(function (next) {
        if (next.on) location.reload();
        else showLock(next);
      });
    };
  }

  // tự động Nộp bài: câu làm một nửa bị đến kỳ / thu hồi lúc dùng
  function cut(reason, onCut) {
    if (w.__yysdCut) return;
    w.__yysdCut = true;
    var box = document.createElement("div");
    box.className = "yysd-cut";
    box.innerHTML = "<div><b>" + (reason === "expired"? " Luyện tập thời gian đã đến ": " Luyện tập quyền hạn đã bị thu hồi ") + "</b><p>" +
      (reason === "expired"? " đã cho bạn tự động Nộp bài, đang nhảy chuyển …": " Giáo viên thu hồi Luyện tập quyền hạn, đã cho bạn tự động Nộp bài. ") + "</p></div>";
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
        chip.textContent = " còn thừa " + fmtLeft(left);
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
          cut(next.reason === "expired"? "expired": "off", onCut);
          return;
        }
        st = next;
        setTimeout(poll, 300000);
      });
    };
    setTimeout(poll, 300000);

    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState!== "visible" || w.__yysdCut) return;
      fetchAccess().then(function (next) {
        if (!next.on &&!w.__yysdCut) {
          cut(next.reason === "expired"? "expired": "off", onCut);
        }
      });
    });
  }

  function gate() {
    if (exempt()) return Promise.resolve({ on: true, staff: true });
    return fetchAccess();
  }

  // cửa vào trang (practice / bốn cái lab / bank): khóa lại tràn lan Khóa tạp, Quay lại false
  function boot() {
    return gate().then(function (st) {
      if (st.on) return true;
      showLock(st);
      return false;
    });
  }

  // làm bài trang: cho đi sau treo đảo kế thì chip + bỏ phiếu; đến kỳ / bị bắt quay về điều onCut tự động Nộp bài
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
