/* Đề thi thậtngân hàng câu hỏi cho người ra đề hoặc học sinh chuẩn bị thihọhạn chế ra vào:họkhông thểtiến lên biến thể cũ củabackend máy tính /api/toefl/access làm chuẩn.lấykhông đến=khóa(fail-safe).
   miễn phícuộn lại(id=)/đánh trướcthể thao chạy nước rúthọ(bank + viết tắt của practice)/Giáo viênxem trước(preview=1) không khóa. */
(function (w) {
  "use strict";

  var LOCKED = { on: false, reason: "error" };
  var REASONS = {
    none: { t: "Khu vực Luyện tậphọ tiền tố phủ định cho động từ chưamở đường mới hoặc tuyến đường sắt", d: "Đề thi thậtngân hàng câu hỏi cho người ra đề hoặc học sinh chuẩn bị thicầnGiáo viênmở đường mới hoặc tuyến đường sắthọtài năngđi vào.miễn phíngân hàng câu hỏi cho người ra đề hoặc học sinh chuẩn bị thikhông cầnmở đường mới hoặc tuyến đường sắt,Đăng nhậptức là làm." },
    scheduled: { t: "Khu vực Luyện tậpchưamở", d: "Giáo viênđã làm với tư cách bạnsắp xếpmở đường mới hoặc tuyến đường sắt,Thời giancuối cùngsau một mệnh đề giả định trong trường hợp đó họđi vàoLuyện tập." },
    expired: { t: "Luyện tậpQuyền hạnđãđến hạn khoản vay", d: "đãhoàn thànhghi chépvẫn tiền tố có thể tồn tạicá nhânđầuXem.nghĩ vềTiếp tụcLuyện tập,mờibiến thể củaGiáo viêntiếp tục biến thể của." },
    off: { t: "Khu vực Luyện tậpđãngừng sử dụng", d: "Giáo viênđãngừng sử dụngbạnLuyện tậpQuyền hạn.như yêu cầuTiếp tục,mờibiến thể củaGiáo viênlạimở đường mới hoặc tuyến đường sắt." },
    error: { t: "tạm thờikhông thểXác nhậnQuyền hạn", d: "mạng lưới máy tínhcó thểphục vụbất thường,làm với tư cáchan toànđộng cơtrước khóa sống.mờimột lát nữalạikiểm tra." }
  };

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function fmtWhen(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    return (d.getMonth() + 1) + "mặt trăng" + d.getDate() + "viết tắt của " + pad(d.getHours()) + ":" + pad(d.getMinutes());
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
      if (m.indexOf("Đăng nhập") >= 0) {
        w.location.replace("login.html?next=" + encodeURIComponent(location.pathname.split("/").pop() + location.search));
        return new Promise(function () {});
      }
      return LOCKED;
    });
  }

  // miễn phícuộn lại / đánh trướcthể thao chạy nước rúthọ / Giáo viênxem trướctrực tiếpcho qua;phần còn lại(ngậm trong miệngtình trạngkhông rõ)họ hình thức kết hợp yêu cầu khóa
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
        '<button type="button" id="yysd-lock-retry">lạikiểm tra</button>' +
        '<a href="free.html">đimiễn phíngân hàng câu hỏi cho người ra đề hoặc học sinh chuẩn bị thi</a>' +
        '<a href="home.html">Quay lạiTrang chủ</a>' +
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
        countEl.textContent = "cách một khoảng ... từmởvẫn còn " + fmtLeft(left);
        setTimeout(tick, 1000);
      };
      tick();
    } else if (st.reason === "expired" && st.expireAt) {
      countEl.textContent = "đến hạn khoản vayThời gian:" + fmtWhen(st.expireAt);
    }

    box.querySelector("#yysd-lock-retry").onclick = function () {
      var btn = this;
      btn.disabled = true;
      btn.textContent = "kiểm trahình thức kết hợp Trung Quốc…";
      fetchAccess().then(function (next) {
        if (next.on) location.reload();
        else showLock(next);
      });
    };
  }

  // tự độngNộp bài:họ làmmột nửachănđến hạn khoản vay/lấy lạibiến thể cũ của sử dụng
  function cut(reason, onCut) {
    if (w.__yysdCut) return;
    w.__yysdCut = true;
    var box = document.createElement("div");
    box.className = "yysd-cut";
    box.innerHTML = "<div><b>" + (reason === "expired" ? "Luyện tậpThời gianđã đến" : "Luyện tậpQuyền hạnđã chănlấy lại") + "</b><p>" +
      (reason === "expired" ? "đã làm với tư cách bạntự độngNộp bài,đang ở thời điểm đótin học nhảy đến một vị trí mới trong tài liệu siêu văn bản…" : "Giáo viênlấy lạiLuyện tậpQuyền hạn,đã làm với tư cách bạntự độngNộp bài.") + "</p></div>";
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
        chip.textContent = "Còn lại " + fmtLeft(left);
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

  // cổng thông tin web(practice / bốn dùng trong lab / bank):khóa sống sau một mệnh đề giả định trong trường hợp đó biến thể của khóa dừng,Quay lại false
  function boot() {
    return gate().then(function (st) {
      if (st.on) return true;
      showLock(st);
      return false;
    });
  }

  // làm họ đầu:cho quahọĐếm ngược chip + tin học thăm dò;đến hạn khoản vay/chănlấy lạiđiều chuyển onCut tự độngNộp bài
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
