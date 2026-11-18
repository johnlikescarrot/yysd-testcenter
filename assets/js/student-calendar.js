/* =========================================================================
   student-calendar.js - học sinh cuối nhiệm vụ lịch
   ========================================================================= */
(function () {
  "use strict";

  var A = window.YYSD_AUTH;
  var Y = window.YYSD;
  var view = "month";
  var events = [];
  var catalogById = {};
  var catalogItems = [];
  var cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  var activeEvent = null;

  var viewEl = document.getElementById("stu-cal-view");
  var statsEl = document.getElementById("stu-cal-stats");
  var modal = document.getElementById("stu-detail-modal");
  var detailBody = document.getElementById("stu-detail-body");
  var detailActions = document.getElementById("stu-detail-actions");

  document.getElementById("year").textContent = new Date().getFullYear();

  if (!A.requireLogin()) return;
  if (A.isTeacher && A.isTeacher()) {
    document.getElementById("cal-desc").textContent =
      " giáo viên số tài khoản mời đi đến«Dành cho giáo viên → nhiệm vụ lịch»phát hành biến thể của | giám sát nhiệm vụ ";
    viewEl.innerHTML =
      '<div class="state state--brand teacher-empty"><h3>giáo viên mời sử dụng phát hành Đài Loan</h3>' +
      '<p><a class="btn btn--primary btn--sm" href="teacher-calendar.html">mở nhiệm vụ phát hành Đài Loan</a></p></div>';
    return;
  }

  var TYPE_LABEL = {
    ASSIGNMENT: " luyện tập bài tập về nhà ",
    LESSON: " khóa học lịch trình ",
    ANNOUNCEMENT: " nhắc nhở sự việc "
  };
  var STATUS_LABEL = {
    PENDING: " chưa hoàn thành ",
    COMPLETED: " đã hoàn thành ",
    OVERDUE: " đã bị quá hạn "
  };

  function esc(s) { return Y.esc(s); }

  var VOCAB_BOOK_LABEL = {
    gaozhong: " trường trung học phổ thông biến thể của | ",
    cet4: " Từ vựng CET-4 ",
    special: " IELTS chuyên biệt biến thể của | "
  };

  function vocabLinkedTitle(xid) {
    var s = String(xid || "");
    var i = s.indexOf("||");
    if (i <= 0) return "";
    var book = s.slice(0, i);
    var list = s.slice(i + 2);
    var bookLabel = VOCAB_BOOK_LABEL[book] ||
      (book.indexOf("theme:") === 0 ? book.slice(6) : book);
    return bookLabel + " · " + list;
  }

  function catalogTitle(xid, uploadName, pack) {
    if (String(xid).indexOf("upload-") === 0) return uploadName || " giáo viên tải lên của luyện tập ";
    var p = String(pack || "").toLowerCase();
    if (p === "vocab-quiz" || p === "vocab-learn" || String(xid).indexOf("||") > 0) {
      var vt = vocabLinkedTitle(xid);
      if (vt) return vt;
    }
    var it = catalogById[xid] || (Y.resolveItem ? Y.resolveItem(catalogItems, xid) : null);
    return it ? Y.displayTitle(it) : xid;
  }

  function explainOnly(ev) {
    return !!(Y.isExplainOnlyAssignment && Y.isExplainOnlyAssignment((ev && ev.linkedExerciseIds) || []));
  }

  function statusLabel(ev) {
    if (explainOnly(ev)) return " giải thích chi tiết ";
    return STATUS_LABEL[ev.status] || ev.status;
  }

  function parseVocabLinked(linkedIds) {
    var refs = [];
    (linkedIds || []).forEach(function (raw) {
      var s = String(raw || "");
      var i = s.indexOf("||");
      if (i <= 0) return;
      var b = s.slice(0, i);
      var lid = s.slice(i + 2);
      if (!b || !lid) return;
      refs.push({ bookId: b, listId: lid, raw: b + "||" + lid });
    });
    if (refs.length) {
      return {
        bookId: refs[0].bookId,
        listIds: refs.map(function (r) { return r.listId; }),
        refs: refs.map(function (r) { return r.raw; })
      };
    }
    // legacy: old catalog item ids
    var id0 = String((linkedIds && linkedIds[0]) || "");
    var it = catalogById[id0] || (Y.resolveItem ? Y.resolveItem(catalogItems, id0) : null);
    var legacyBook = "gaozhong";
    if (it && Y.vocabBookOfSubject) legacyBook = Y.vocabBookOfSubject(it.subject) || "gaozhong";
    else if (/cet4|cấp 4/i.test(id0)) legacyBook = "cet4";
    else if (/listening|reading|writing|special|chuyên biệt/i.test(id0)) legacyBook = "special";
    return { bookId: legacyBook, listIds: (linkedIds || []).slice(), refs: [] };
  }

  function vocabQuizHref(eventId, linkedIds) {
    var parsed = parseVocabLinked(linkedIds || []);
    if (parsed.refs && parsed.refs.length) {
      return "vocab-quiz.html?refs=" + parsed.refs.map(encodeURIComponent).join(",") +
        "&event=" + encodeURIComponent(eventId);
    }
    var qs = "book=" + encodeURIComponent(parsed.bookId) +
      "&event=" + encodeURIComponent(eventId);
    if (parsed.listIds.length) {
      qs += "&lists=" + parsed.listIds.map(encodeURIComponent).join(",");
    }
    return "vocab-quiz.html?" + qs;
  }

  function vocabLearnHref(eventId, linkedIds) {
    var parsed = parseVocabLinked(linkedIds || []);
    var list = parsed.listIds[0] || "";
    return "vocab-learn.html?book=" + encodeURIComponent(parsed.bookId) +
      "&list=" + encodeURIComponent(list) +
      "&event=" + encodeURIComponent(eventId);
  }

  function examHref(itemId, eventId, linkedIds, cdtPack) {
    var pack = String(cdtPack || "").toLowerCase();
    if (pack === "vocab-quiz") {
      return vocabQuizHref(eventId, linkedIds || [itemId]);
    }
    if (pack === "vocab-learn") {
      return vocabLearnHref(eventId, linkedIds || [itemId]);
    }
    var href = "exam.html?id=" + encodeURIComponent(itemId) +
      "&event=" + encodeURIComponent(eventId);
    // ponytail: any Cambridge assign → CDT; cdtPack from teacher (skill mock = exam)
    if (Y.cambridgeCdtQs) href += Y.cambridgeCdtQs(itemId, linkedIds, cdtPack);
    return href;
  }

  function typeClass(t) {
    if (t === "ASSIGNMENT") return "cal-tag--assignment";
    if (t === "LESSON") return "cal-tag--lesson";
    return "cal-tag--announce";
  }

  function statusClass(st) {
    if (st === "COMPLETED") return "cal-status--done";
    if (st === "OVERDUE") return "cal-status--overdue";
    return "cal-status--pending";
  }

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function dayKeyOf(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso).slice(0, 10);
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function fmtDate(iso) {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleString("vi-VN", {
        hour12: false, month: "numeric", day: "numeric",
        hour: "2-digit", minute: "2-digit"
      });
    } catch (e) { return iso; }
  }

  function eventDayKeys(ev) {
    var keys = {};
    var a = dayKeyOf(ev.startTime);
    var b = dayKeyOf(ev.dueTime);
    if (a) keys[a] = 1;
    if (b) keys[b] = 1;
    if (!a && !b && ev.createdAt) keys[dayKeyOf(ev.createdAt)] = 1;
    return keys;
  }

  function eventsOnDay(dayKey) {
    return events.filter(function (ev) { return eventDayKeys(ev)[dayKey]; });
  }

  function startOfWeek(d) {
    var x = new Date(d);
    x.setHours(0, 0, 0, 0);
    x.setDate(x.getDate() - x.getDay());
    return x;
  }

  function renderStats() {
    var pending = 0, done = 0, overdue = 0;
    events.forEach(function (ev) {
      if (explainOnly(ev)) return;
      if (ev.status === "COMPLETED") done++;
      else if (ev.status === "OVERDUE") overdue++;
      else pending++;
    });
    statsEl.innerHTML =
      '<div class="teacher-stat"><b>' + events.length + "</b><span>toàn bộ nhiệm vụ</span></div>" +
      '<div class="teacher-stat"><b>' + pending + "</b><span>ở lại hoàn thành</span></div>" +
      '<div class="teacher-stat"><b>' + done + "</b><span>đã hoàn thành</span></div>" +
      '<div class="teacher-stat"><b>' + overdue + "</b><span>đã bị quá hạn</span></div>";
  }

  function chipHtml(ev) {
    var cls = typeClass(ev.eventType);
    if (ev.status === "OVERDUE") cls += " is-overdue";
    if (ev.status === "COMPLETED") cls += " is-done";
    return '<button type="button" class="cal-month__chip ' + cls + '" data-open="' + ev.id + '">' +
      esc(ev.title) + "</button>";
  }

  function renderMonth() {
    var y = cursor.getFullYear();
    var m = cursor.getMonth();
    var todayKey = dayKeyOf(new Date().toISOString());
    var firstDow = new Date(y, m, 1).getDay();
    var daysInMonth = new Date(y, m + 1, 0).getDate();
    var cells = [];
    var i;
    for (i = 0; i < firstDow; i++) cells.push('<div class="cal-month__cell is-empty"></div>');
    for (i = 1; i <= daysInMonth; i++) {
      var dayKey = y + "-" + pad(m + 1) + "-" + pad(i);
      var dayEvents = eventsOnDay(dayKey);
      var chips = dayEvents.slice(0, 3).map(chipHtml).join("");
      if (dayEvents.length > 3) {
        chips += '<span class="cal-month__more">+' + (dayEvents.length - 3) + "</span>";
      }
      var cellCls = "cal-month__cell";
      if (dayKey === todayKey) cellCls += " is-today";
      if (dayEvents.length) cellCls += " has-events";
      cells.push(
        '<div class="' + cellCls + '" style="--cell-i:' + (i % 7) + '">' +
          '<div class="cal-month__day">' + i + "</div>" +
          '<div class="cal-month__chips">' + chips + "</div></div>"
      );
    }
    viewEl.innerHTML =
      '<div class="cal-month">' +
        '<div class="cal-month__nav">' +
          '<button type="button" class="btn btn--ghost btn--sm" data-nav-dir="-1">‹</button>' +
          "<strong>" + y + " năm " + (m + 1) + " tháng</strong>" +
          '<button type="button" class="btn btn--ghost btn--sm" data-nav-dir="1">›</button>' +
        "</div>" +
        '<div class="cal-month__weekdays">' +
          "<span>viết tắt của</span><span>một</span><span>hai</span><span>ba</span><span>bốn</span><span>năm</span><span>sáu</span>" +
        "</div>" +
        '<div class="cal-month__grid">' + cells.join("") + "</div></div>";
  }

  function renderWeek() {
    var start = startOfWeek(cursor);
    var todayKey = dayKeyOf(new Date().toISOString());
    var days = [];
    var i;
    for (i = 0; i < 7; i++) {
      var d = new Date(start);
      d.setDate(start.getDate() + i);
      var dayKey = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
      var dayEvents = eventsOnDay(dayKey);
      var dayCls = "cal-week__day" + (dayKey === todayKey ? " is-today" : "");
      days.push(
        '<div class="' + dayCls + '">' +
          '<div class="cal-week__head">' +
            "<b>" + (d.getMonth() + 1) + "/" + d.getDate() + "</b>" +
            "<span>" + " viết tắt của một hoặc hai ba bốn năm sáu ".charAt(d.getDay()) + "</span>" +
          "</div>" +
          '<div class="cal-week__list">' +
            (dayEvents.length ? dayEvents.map(chipHtml).join("") : '<p class="profile-hint">không có sắp xếp</p>') +
          "</div></div>"
      );
    }
    var end = new Date(start);
    end.setDate(start.getDate() + 6);
    viewEl.innerHTML =
      '<div class="cal-week">' +
        '<div class="cal-month__nav">' +
          '<button type="button" class="btn btn--ghost btn--sm" data-nav-dir="-7">‹</button>' +
          "<strong>" + (start.getMonth() + 1) + "/" + start.getDate() +
            " – " + (end.getMonth() + 1) + "/" + end.getDate() + "</strong>" +
          '<button type="button" class="btn btn--ghost btn--sm" data-nav-dir="7">›</button>' +
        "</div>" +
        '<div class="cal-week__grid">' + days.join("") + "</div></div>";
  }

  function renderAgenda() {
    if (!events.length) {
      viewEl.innerHTML =
        '<div class="state state--brand teacher-empty"><h3>tạm thời vô cùng công việc</h3>' +
        "<p>giáo viên sắp xếp bài tập về nhà có thể khóa học hoàng hậu, có thể xuất hiện tồn tại biến thể của | </p></div>";
      return;
    }
    var sorted = events.slice().sort(function (a, b) {
      var oa = explainOnly(a) ? 3 : (a.status === "OVERDUE" ? 0 : (a.status === "PENDING" ? 1 : 2));
      var ob = explainOnly(b) ? 3 : (b.status === "OVERDUE" ? 0 : (b.status === "PENDING" ? 1 : 2));
      if (oa !== ob) return oa - ob;
      return String(a.dueTime || a.startTime || "").localeCompare(String(b.dueTime || b.startTime || ""));
    });
    var rows = sorted.map(function (ev) {
      var ids = ev.linkedExerciseIds || [];
      var doneN = ev.exerciseDone || 0;
      var totalN = ev.exerciseTotal != null ? ev.exerciseTotal : ids.length;
      var prog = (!explainOnly(ev) && totalN)
        ? '<span class="cal-progress__txt">' + doneN + "/" + totalN + " luyện tập</span>"
        : "";
      var cta = ev.status === "COMPLETED"
        ? '<button type="button" class="btn btn--ghost btn--sm" data-open="' + ev.id + '">xem xét</button>'
        : (ids.length === 1 ||
            ((ev.cdtPack === "vocab-quiz" || ev.cdtPack === "vocab-learn") && ids.length)
          ? '<a class="btn btn--primary btn--sm" href="' + examHref(ids[0], ev.id, ids, ev.cdtPack) + '">' +
              (ev.cdtPack === "vocab-quiz" ? " bắt đầu phát hiện "
                : (ev.cdtPack === "vocab-learn" ? " bắt đầu học "
                  : (Y.isExplainId && Y.isExplainId(ids[0]) ? " đi vào giải thích chi tiết " : " đi làm "))) + "</a>"
          : '<button type="button" class="btn btn--primary btn--sm" data-open="' + ev.id + '">đi làm</button>');
      return '<article class="cal-todo-row ' + statusClass(ev.status) + '">' +
        '<div class="cal-todo-row__main">' +
          '<div class="cal-todo-row__tags">' +
            '<span class="cal-tag ' + typeClass(ev.eventType) + '">' + esc(TYPE_LABEL[ev.eventType] || "") + "</span>" +
            '<span class="cal-status-pill ' + statusClass(ev.status) + '">' +
              esc(statusLabel(ev)) + "</span>" +
          "</div>" +
          "<h3>" + esc(ev.title) + "</h3>" +
          '<p class="cal-card__meta">' +
            (ev.dueTime ? " đóng " + esc(fmtDate(ev.dueTime)) : "") +
            (ev.startTime ? (ev.dueTime ? " · " : "") + " Bắt đầu " + esc(fmtDate(ev.startTime)) : "") +
            (prog ? " · " + prog : "") +
          "</p>" +
        "</div>" +
        '<div class="cal-todo-row__act">' + cta + "</div>" +
      "</article>";
    }).join("");
    viewEl.innerHTML = '<div class="cal-todo-list">' + rows + "</div>";
  }

  function render() {
    renderStats();
    if (view === "week") renderWeek();
    else if (view === "agenda") renderAgenda();
    else renderMonth();
  }

  function canManualComplete(ev) {
    if (!ev || ev.status === "COMPLETED") return false;
    if (ev.eventType === "ASSIGNMENT" && (ev.linkedExerciseIds || []).length) {
      // ponytail: danh sách học không có tự động nộp bài thi, cho phép học sinh thủ công thu hút hoàn thành
      return String(ev.cdtPack || "").toLowerCase() === "vocab-learn";
    }
    return true;
  }

  function markCalSeen(id) {
    // ponytail: shared with dashboard.js hôm nay điểm tiêu«viết tắt của Tân Cương»ký hiệu
    var key = "yysd:cal-seen-ids";
    var n = Number(id);
    if (!n) return;
    try {
      var s = JSON.parse(localStorage.getItem(key) || "[]");
      if (s.indexOf(n) >= 0) return;
      s.push(n);
      if (s.length > 200) s = s.slice(-200);
      localStorage.setItem(key, JSON.stringify(s));
    } catch (e) {}
  }

  function openDetail(id) {
    var ev = null;
    events.forEach(function (e) { if (e.id === id) ev = e; });
    if (!ev) return;
    markCalSeen(ev.id);
    activeEvent = ev;
    document.getElementById("stu-detail-title").textContent = ev.title;
    var doneSet = {};
    (ev.doneExerciseIds || []).forEach(function (xid) { doneSet[xid] = 1; });
    var linkedIds = ev.linkedExerciseIds || [];
    var pack = String(ev.cdtPack || "").toLowerCase();
    var isVocab = pack === "vocab-quiz" || pack === "vocab-learn";
    var exList = linkedIds.map(function (xid) {
      var title = catalogTitle(xid, ev.attachmentName, pack);
      var kind = (!isVocab && Y.drillKindLabel) ? Y.drillKindLabel(xid) : "";
      var explain = !!(Y.isExplainId && Y.isExplainId(xid));
      var done = isVocab ? ev.status === "COMPLETED" : (!explain && !!doneSet[xid]);
      var href = examHref(xid, ev.id, linkedIds, ev.cdtPack);
      return '<li class="cal-ex-row' + (done ? " is-done" : "") + '">' +
        "<span><b>" + esc(title) + "</b>" +
          (done ? '<small class="cal-ex-done">đã hoàn thành</small>' : "") +
          (kind ? '<small class="cal-ex-kind">' + esc(kind) + "</small>" : "") +
        "</span>" +
        (done
          ? '<a class="btn btn--ghost btn--sm" href="' + href + '">lại chăm sóc đầu tiên</a>'
          : '<a class="btn btn--primary btn--sm" href="' + href + '">' +
              (pack === "vocab-quiz" ? " bắt đầu phát hiện " : (pack === "vocab-learn" ? " bắt đầu học "
                : (explain ? " đi vào giải thích chi tiết " : " ngay lập tức đi làm "))) +
            "</a>") +
        "</li>";
    }).join("");

    var totalN = ev.exerciseTotal != null ? ev.exerciseTotal : (ev.linkedExerciseIds || []).length;
    var doneN = ev.exerciseDone || 0;
    var progHint = "";
    if (explainOnly(ev)) {
      progHint = '<p class="profile-hint">giải thích chi tiết có thể hình thức gắn liền có nghĩa giống như từ tự do chủ đề chăm sóc đúng lỗi, không ghi chép thành tích, không tính hoàn thành </p>';
    } else if (ev.status !== "COMPLETED" && totalN) {
      progHint = isVocab
        ? (pack === "vocab-quiz"
          ? '<p class="profile-hint">xông qua rào cản đi qua hoàng hậu, nhiệm vụ sẽ tự động ký hiệu làm đã hoàn thành </p>'
          : '<p class="profile-hint">học hoàn thành gốc List hoàng hậu, nhiệm vụ sẽ tự động ký hiệu làm đã hoàn thành </p>')
        : '<p class="profile-hint">hoàn thành toàn bộ ' + totalN + " lượng từ cho quà tặng luyện tập hoàng hậu, nhiệm vụ sẽ tự động ký hiệu làm đã hoàn thành </p>";
    }
    detailBody.innerHTML =
      '<p><span class="cal-tag ' + typeClass(ev.eventType) + '">' +
        esc(TYPE_LABEL[ev.eventType] || "") + "</span> " +
        '<span class="cal-status-pill ' + statusClass(ev.status) + '">' +
        esc(statusLabel(ev)) + "</span></p>" +
      "<p>" + esc(ev.description || " giáo viên chưa điền vào biểu mẫu thêm giải thích ") + "</p>" +
      '<p class="cal-card__meta">Bắt đầu: ' + esc(fmtDate(ev.startTime)) +
        " · đóng: " + esc(fmtDate(ev.dueTime)) +
        ((!explainOnly(ev) && totalN) ? " · luyện tập tốc độ tiến triển " + doneN + "/" + totalN : "") + "</p>" +
      (exList
        ? "<h3>có liên quan luyện tập</h3><ul class=\"cal-ex-list\">" + exList + "</ul>" + progHint
        : (ev.eventType === "ASSIGNMENT"
          ? "<p class=\"profile-hint\">chưa có liên quan cụ thể luyện tập, có thể theo lẽ thường Triều Minh hoàn thành và thủ công chọn </p>"
          : ""));

    var acts = '<button type="button" class="btn btn--ghost" data-close="1">đóng</button>';
    if (canManualComplete(ev)) {
      acts += '<button type="button" class="btn btn--primary" id="mark-done-btn">ký hiệu hoàn thành</button>';
    } else if (ev.status === "COMPLETED") {
      acts += '<span class="profile-hint">đã hoàn thành' +
        (ev.completedAt ? " · " + esc(fmtDate(ev.completedAt)) : "") + "</span>";
    } else if ((ev.linkedExerciseIds || []).length === 1) {
      acts += '<a class="btn btn--primary" href="' +
        examHref(ev.linkedExerciseIds[0], ev.id, ev.linkedExerciseIds, ev.cdtPack) + '">ngay lập tức đi làm</a>';
    }
    detailActions.innerHTML = acts;
    modal.hidden = false;
  }

  function closeDetail() {
    modal.hidden = true;
    activeEvent = null;
  }

  function load() {
    viewEl.innerHTML = '<div class="state state--brand"><div class="spinner spinner--brand"></div></div>';
    Promise.all([
      A.api("/api/student/calendar"),
      Y.load(),
      Y.loadListeningTaxonomy ? Y.loadListeningTaxonomy().catch(function () { return null; }) : Promise.resolve(null),
      Y.loadReadingTaxonomy ? Y.loadReadingTaxonomy().catch(function () { return null; }) : Promise.resolve(null)
    ]).then(function (res) {
      events = res[0].events || [];
      catalogById = {};
      catalogItems = res[1] || [];
      catalogItems.forEach(function (it) { catalogById[it.id] = it; });
      render();
      openFromHash();
    }).catch(function (e) {
      if (String(e.message).indexOf(" Đăng nhập ") >= 0) {
        A.setToken("");
        location.href = "login.html?next=" + encodeURIComponent("dashboard.html");
        return;
      }
      viewEl.innerHTML = '<div class="state state--brand"><h3>Tải không thành công</h3><p>' + esc(e.message) + "</p></div>";
    });
  }

  function openFromHash() {
    var m = /^#event-(\d+)$/.exec(location.hash || "");
    if (m) openDetail(Number(m[1]));
  }

  document.querySelectorAll("[data-view]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      view = btn.getAttribute("data-view") || "month";
      document.querySelectorAll("[data-view]").forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
      });
      render();
    });
  });

  document.getElementById("refresh-btn").addEventListener("click", load);

  viewEl.addEventListener("click", function (e) {
    var open = e.target.closest("[data-open]");
    if (open) openDetail(Number(open.getAttribute("data-open")));
    var navBtn = e.target.closest("[data-nav-dir]");
    if (navBtn) {
      var delta = Number(navBtn.getAttribute("data-nav-dir")) || 0;
      if (view === "week") cursor.setDate(cursor.getDate() + delta);
      else cursor.setMonth(cursor.getMonth() + delta);
      render();
    }
  });

  modal.addEventListener("click", function (e) {
    if (e.target.getAttribute("data-close")) closeDetail();
    if (e.target.id === "mark-done-btn" && activeEvent) {
      e.target.disabled = true;
      A.api("/api/student/calendar/" + activeEvent.id + "/status", {
        method: "PATCH",
        body: { status: "COMPLETED" }
      }).then(function () {
        closeDetail();
        load();
      }).catch(function (err) {
        e.target.disabled = false;
        alert(err.message);
      });
    }
  });

  window.addEventListener("hashchange", openFromHash);

  load();
})();
