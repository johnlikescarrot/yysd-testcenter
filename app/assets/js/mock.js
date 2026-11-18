/* ponytail: Gói tăng tốc trước kỳ thi picker — exam engine stays on toefl-*.html */
(function (w) {
  "use strict";

  var SKILLS = [
    { key: "reading", label: "Đọc", page: "toefl-reading.html", list: "TOEFL_READING" },
    { key: "listening", label: "Nghe", page: "toefl-listening.html", list: "TOEFL_LISTENING" },
    { key: "writing", label: "Viết", page: "toefl-writing.html", list: "TOEFL_WRITING" }
  ];

  function yysd() { return w.YYSD || {}; }

  function esc(s) {
    return String(s == null? "": s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function examRoot() {
    return (location.pathname.indexOf("/app/") >= 0)? "../": "";
  }

  function packOf(id) {
    return (yysd().TOEFL_FULL || []).filter(function (p) { return p.id === id; })[0] || null;
  }

  function skillPaper(listName, id) {
    return (yysd()[listName] || []).filter(function (p) { return p.id === id; })[0] || null;
  }

  /* ---- bao Khóa thái: /api/toefl/access là duy nhất sự thật nơi phát ra; không lấy được lúc chỉ coi không biết (Bắt đầu trước Server lại lật tẩy) ---- */
  var access = null;
  function fetchAccess() {
    if (access) return Promise.resolve(access);
    var A = w.YYSD_APP;
    if (!A ||!A.api) return Promise.resolve(null);
    return A.api("/api/toefl/access").then(function (d) {
      access = (d && d.access) || null;
      return access;
    }).catch(function () { return null; });
  }

  function lockInfoOf(id) {
    if (!access || access.staff) return { locked: false };
    var st = (access.packages || {})[id];
    if (st && st.on) return { locked: false };
    return { locked: true, reason: st? st.reason: "none" };
  }

  function confirmHref(kind, id, skill) {
    var href = "mock.html?kind=" + encodeURIComponent(kind) + "&id=" + encodeURIComponent(id);
    return skill? href + "&skill=" + encodeURIComponent(skill): href;
  }

  function startFull(id) {
    try {
      sessionStorage.setItem("yysd:toefl-full:" + id, JSON.stringify({
        id: id, mode: "mock", sections: {}, voided: false
      }));
      sessionStorage.removeItem("yysd:toefl-hw:" + id);
    } catch (e) {}
    location.href = examRoot() + "toefl-reading.html?id=" + encodeURIComponent(id) + "&mode=mock&full=1&from=app";
  }

  function startSingle(id, skill) {
    var spec = SKILLS.filter(function (s) { return s.key === skill; })[0];
    var page = spec? spec.page: "toefl-speaking.html";
    location.href = examRoot() + page + "?id=" + encodeURIComponent(id) + "&mode=mock&from=app";
  }

  /* Bắt đầu trước Server cứng rắn kiểm tra (tạp diện chỉ phủ lên Đã kích hoạt cuốn; bị vượt qua sau tại đây nhưng sẽ ngăn đón) */
  function startGuard(packageId, go) {
    var A = w.YYSD_APP;
    if (!A ||!A.api) { go(); return; }
    A.api("/api/toefl/exam-start", { method: "POST", body: { packageId: packageId } }).then(function () {
      go();
    }).catch(function (e) {
      var err = document.getElementById("mock-err");
      if (err) err.textContent = (e && e.message) || " tạm thời không thể Bắt đầu ";
      var btn = document.getElementById("mock-go");
      if (btn) btn.disabled = false;
    });
  }

  /* ---- liền đem hộp: wofo thức tạp phiến, tạp diện chỉ có «TOEFL Mock N»+ toàn khoa Thi thử + bốn cách chỉ khảo thi X ---- */
  var SLOTS = [
    { key: "reading", label: " chỉ khảo thi Đọc ", list: "TOEFL_READING" },
    { key: "listening", label: " chỉ khảo thi Nghe ", list: "TOEFL_LISTENING" },
    { key: "speaking", label: " chỉ khảo thi Nói ", list: "TOEFL_SPEAKING" },
    { key: "writing", label: " chỉ khảo thi Viết ", list: "TOEFL_WRITING" }
  ];
  var PER_PAGE = 10;
  var page = 1;
  var packs = [];
  var draw = function () {};

  function previewOn() {
    return new URLSearchParams(location.search).get("preview") === "1";
  }

  function fullPapers(stock) {
    return (yysd().TOEFL_FULL || []).filter(function (p) {
      if (!stock ||!stock.mocks ||!stock.mocks.length) return true;
      return stock.mocks.indexOf(p.id) >= 0;
    });
  }

  /* đánh số theo như toàn bộ số lượng danh sách tính, lại theo như quyền hạn loại bỏ —— bất đồng Học viên thấy cùng một tờ cuốn cuốn số nhất trí, sẽ nhảy số */
  function buildList(stock, papers) {
    var out = fullPapers(stock).map(function (p) {
      return {
        id: p.id,
        made: false,
        skills: SLOTS.filter(function (s) { return!!skillPaper(s.list, p.id); })
          .map(function (s) { return s.key; }),
        href: function (skill) { return confirmHref(skill? "single": "full", p.id, skill); }
      };
    });
    (papers || []).forEach(function (p) {
      if (p.kind === "practice") return;
      out.push({
        id: p.id,
        made: true,
        skills: SLOTS.map(function (s) { return s.key; }).filter(function (k) {
          return (p.blocks || []).some(function (b) { return b.skill === k; });
        }),
        href: function (skill) {
          return "bank.html?id=" + encodeURIComponent(p.id) +
            (skill? "&skill=" + encodeURIComponent(skill): "");
        }
      });
    });
    return out.map(function (p, i) { p.no = i + 1; return p; });
  }

  function visiblePacks() {
    return packs.filter(function (p) {
      return previewOn() ||!access || access.staff ||!lockInfoOf(p.id).locked;
    });
  }

  function mockCardHTML(p) {
    var skills = SLOTS.filter(function (s) { return p.skills.indexOf(s.key) >= 0; }).map(function (s) {
      return '<a href="' + s2(p.href(s.key)) + '">' + s.label + "</a>";
    }).join("");
    return '<div class="hit-mock-card">' +
      '<div class="hit-mock-id"><b>TOEFL Mock ' + p.no + "</b>" +
      "<span> đề thi thật Thi thử · tự động cho điểm </span></div>" +
      '<a class="hit-mock-main" href="' + s2(p.href("")) + '">' +
      (p.skills.length === 1? " Bắt đầu thi thử ": " toàn khoa Thi thử ") + "</a>" +
      '<div class="hit-mock-skill">' + skills + "</div></div>";
  }

  function s2(v) { return esc(v); }

  function pagerHTML(total) {
    if (total <= PER_PAGE) return "";
    var pages = Math.ceil(total / PER_PAGE);
    function btn(label, n, on, off) {
      return '<button type="button" data-page="' + n + '"' + (on? ' class="is-on"': "") +
        (off? " disabled": "") + ">" + label + "</button>";
    }
    var html = btn("&lt;", page - 1, false, page === 1);
    for (var n = 1; n <= pages; n++) html += btn(String(n), n, n === page, false);
    return '<div class="hit-mock-pager">' + html + btn("&gt;", page + 1, false, page === pages) + "</div>";
  }

  function mockListHTML() {
    var visible = visiblePacks();
    var last = Math.max(1, Math.ceil(visible.length / PER_PAGE));
    if (page > last) page = last;
    var shown = visible.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    return "<h1> Gói tăng tốc trước kỳ thi </h1>" + '<div class="hit-mock-cards">' +
      (shown.length? shown.map(mockCardHTML).join(""):
        '<div class="hit-empty"><b> tại đây còn không có cấp phát cho của bạn bài thi </b><p> liên hệ Giáo viên kích hoạt Gói tăng tốc trước kỳ thi. </p></div>') +
      "</div>" + pagerHTML(visible.length);
  }

  function onPageClick(ev) {
    var b = ev.target.closest("[data-page]");
    if (!b || b.disabled) return;
    page = Number(b.getAttribute("data-page"));
    draw();
  }

  function titleOf(id, skill) {
    var p = packs.filter(function (x) { return x.id === id; })[0];
    if (!p) return "Thi thử";
    var slot = SLOTS.filter(function (s) { return s.key === skill; })[0];
    return "TOEFL Mock " + p.no + (slot? " · " + slot.label: "");
  }

  function confirmHTML(kind, id, skill) {
    var pack = packOf(id);
    var speak = skill === "speaking"? skillPaper("TOEFL_SPEAKING", id): null;
    var spec = SKILLS.filter(function (s) { return s.key === skill; })[0];
    var single = spec? skillPaper(spec.list, id): speak;
    var mins = kind === "full"? (pack && pack.duration): (single && single.duration);
    var back = "mock.html";
    var rules = kind === "full"
      ? "<li> Đọc → Nghe → Viết → Nói, Không có lịch nghỉ ngơi, khoa và khoa giữa không thể Quay lại. </li>" +
        "<li> theo như tất cả khoa chính thức thời hạn liền khảo thi, ước " + (mins || "—") + " phút. </li>" +
        "<li> hoán đổi trang web hoặc ly khai cửa sổ tức thì cả trận hết hiệu lực, bốn khoa đều không ghi điểm. </li>"
      : "<li> chỉ khảo thi " + (spec? spec.label: "Nói") + " một khoa, thời hạn ước " + (mins || "—") + " phút. </li>" +
        "<li> hoán đổi trang web hoặc ly khai cửa sổ tức thì bổn tràng hết hiệu lực, không ghi điểm. </li>" +
        "<li> Bắt đầu sau không thể Quay lại đề mục liệt biểu List. </li>";
    if (!pack && kind === "full") return '<p class="hit-status"> Không tìm thấy bộ này câu. </p><a class="hit-back" href="mock.html">← Quay lại </a>';
    if (kind === "single" &&!single) return '<p class="hit-status"> Không tìm thấy cái này một khoa. </p><a class="hit-back" href="' + back + '">← Quay lại </a>';
    return '<h1> Bắt đầu trước Xác nhận </h1>' +
      '<a class="hit-back" href="' + back + '">← Về danh sách </a>' +
      '<div class="hit-confirm"><h2 id="mock-title">' + esc(titleOf(id, kind === "full"? "": skill)) + "</h2><ul>" + rules + "</ul>" +
      '<p class="hit-status is-warn" id="mock-err"></p>' +
      '<button type="button" class="hit-go" id="mock-go"> Bắt đầu thi thử </button></div>';
  }

  function bindConfirm(kind, id, skill) {
    var btn = document.getElementById("mock-go");
    if (!btn) return;
    btn.onclick = function () {
      btn.disabled = true;
      startGuard(id, function () {
        if (kind === "full") startFull(id);
        else startSingle(id, skill);
      });
    };
  }

  function loadPacks(done) {
    var catP = (w.YYSD_APP && w.YYSD_APP.api)
      ? w.YYSD_APP.api("/api/tiku/catalog").then(function (d) { return (d && d.catalog) || {}; })
        .catch(function () { return {}; })
      : Promise.resolve({});
    return Promise.all([fetchAccess(), catP]).then(function (xs) {
      var cat = xs[1] || {};
      packs = buildList(cat.stock, cat.papers);
      if (done) done();
    });
  }

  function paint(host) {
    var qs = new URLSearchParams(location.search);
    var kind = qs.get("kind") || "";
    var id = qs.get("id") || "";
    var skill = qs.get("skill") || "";
    if (id && (kind === "full" || kind === "single")) {
      host.innerHTML = confirmHTML(kind, id, skill);
      bindConfirm(kind, id, skill);
      loadPacks(function () {
        var t = document.getElementById("mock-title");
        if (t) t.textContent = titleOf(id, kind === "full"? "": skill);
      });
      return "mock";
    }
    draw = function () { host.innerHTML = mockListHTML(); };
    host.onclick = onPageClick;
    if (!packs.length) packs = buildList(null, null);
    draw();
    loadPacks(draw);
    return "mock";
  }

  var api = {
    paint: paint
  };
  w.YYSD_HIT_MOCK = api;
  if (typeof module!== "undefined" && module.exports) module.exports = api;
})(typeof window!== "undefined"? window: global);
