/* =========================================================================
   cambridge.js — volume page: pick Test → jump into paper (mode picker / CDT)
   ========================================================================= */
(function () {
  "use strict";
  var Y = window.YYSD;

  var params = new URLSearchParams(location.search);
  var vol = (params.get("vol") || "").trim();
  var skillQ = (params.get("skill") || "").trim().toLowerCase();
  var contentEl = document.getElementById("content");

  document.title = "Cambridge IELTS " + vol + " · YYSD · Trung tâm Khóa học Quốc tế";
  var navLink = document.querySelector('#nav a[data-zone="mock"]');
  if (navLink) navLink.classList.add("is-active");
  document.getElementById("year").textContent = new Date().getFullYear();

  var SKILLS = [
    { subject: "cambridge-listening", key: "listening", name: "Nghe" },
    { subject: "cambridge-reading", key: "reading", name: "Đọc" },
    { subject: "cambridge-writing", key: "writing", name: "Viết" }
  ];

  var skillFilter = SKILLS.filter(function (s) { return s.key === skillQ; })[0] || null;
  var accent = skillFilter ? skillFilter.key : "mock";
  document.body.classList.add("cam-page", "cam-page--" + accent, "cam-page--pick-test");

  var backHref = skillFilter
    ? "zone.html?zone=mock&s=" + encodeURIComponent(skillFilter.key)
    : "zone.html?zone=mock&s=mock";
  var backLabel = skillFilter ? skillFilter.name + "trình tựLuyện tập" : "che đậy họThi thử";

  var backLink = document.querySelector(".minimal-back__link");
  if (backLink) {
    backLink.href = backHref;
    backLink.textContent = "← Quay lại" + backLabel;
  }

  function testDone(papers) {
    var res = Y.results();
    if (skillFilter) {
      var it = papers[skillFilter.subject];
      return !!(it && res[it.id]);
    }
    var list = SKILLS.filter(function (s) { return papers[s.subject]; });
    var done = list.filter(function (s) { return res[papers[s.subject].id]; }).length;
    return { done: done, total: list.length, complete: list.length && done >= list.length };
  }

  function hrefForTest(papers) {
    if (skillFilter) {
      var item = papers[skillFilter.subject];
      if (!item) return "";
      // B1: skill practice enters CDT; pack chosen at gate (drill vs exam)
      return Y.fileHref(item, "") + "&cdt=1";
    }
    var listen = papers["cambridge-listening"];
    if (!listen) return "";
    return Y.fileHref(listen, "") + "&cdt=1&pack=exam&suite=1";
  }

  Y.load().then(function (items) {
    var cam = items.filter(function (it) {
      return Y.isCambridge(it.subject) && Y.camVolume(it) === vol;
    });
    if (skillFilter) {
      cam = cam.filter(function (it) { return it.subject === skillFilter.subject; });
    }

    if (!cam.length) {
      contentEl.innerHTML = '<div class="state state--brand"><h3>chưatìm thấynên sáchNội dung</h3>' +
        '<p>mời biến thể của<a href="' + backHref + '">' + Y.esc(backLabel) + "</a>lạiđi vào.</p></div>";
      return;
    }

    var byTest = {};
    cam.forEach(function (it) {
      var t = Y.camTestNo(it) || "1";
      (byTest[t] = byTest[t] || {})[it.subject] = it;
    });

    var tests = Object.keys(byTest).sort(function (a, b) { return Number(a) - Number(b); });
    if (!skillFilter) {
      tests = tests.filter(function (t) { return !!byTest[t]["cambridge-listening"]; });
    }

    var volProg = Y.camVolumeProgress(items, vol);

    var crumb = '<div class="minimal-crumb cam-crumb">' +
      '<a href="index.html">Trang chủ</a> <span class="crumb-sep" aria-hidden="true">★</span> ' +
      '<a href="zone.html?zone=mock">IELTS Hệ thống Kiểm tra Tiếng Anh Quốc tế</a> <span class="crumb-sep" aria-hidden="true">★</span> ' +
      '<a href="' + backHref + '">' + Y.esc(backLabel) + '</a> <span class="crumb-sep" aria-hidden="true">★</span> ' +
      "Cambridge IELTS " + Y.esc(vol) + "</div>";

    var metaLine = skillFilter
      ? "mục đơn lẻtrình tựLuyện tập · hầu như" + skillFilter.name
      : "Chính thứcĐề thi thậtche đậy cuộn lại · Chọn Test Bắt đầuche đậy họThi thử";
    var hint = skillFilter
      ? "Chọnbộ Test,đi vàohọ đánhbề mặt tiếp xúchọChọn«Luyện tập»có thể«Thi thử»(bề mặt tiếp xúcgiống hệt,hầu nhưquy tắckhác)."
      : "Chọnbộ Test,nhấnNghe → Đọc → Viếttrình tựHoàn thànhche đậy họ họ thậtThi thử.";

    var hero = '<div class="cam-hero cam-hero--' + accent + '">' +
      '<div class="cam-hero__badge"><div class="lbl">CAMBRIDGE IELTS</div><div class="num">' + Y.esc(vol) + "</div></div>" +
      "<div><h1>Cambridge IELTS " + Y.esc(vol) + "</h1>" +
      '<div class="meta">' + metaLine +
      (!skillFilter && volProg.total ? " · Đã hoàn thành " + volProg.done + "/" + volProg.total + " lượng từ cho quà tặng" : "") +
      "</div></div></div>";

    var tabs = tests.map(function (t) {
      var papers = byTest[t];
      var href = hrefForTest(papers);
      if (!href) return "";
      var prog = testDone(papers);
      var complete = skillFilter ? prog === true : prog.complete;
      var status = complete
        ? '<span class="test-tab__done" aria-label="Đã hoàn thành">✓</span>'
        : (!skillFilter && prog.done
          ? '<span class="test-tab__part">' + prog.done + "/" + prog.total + "</span>"
          : '<span class="test-tab__go" aria-hidden="true">Bắt đầu</span>');
      return '<a class="test-tab' + (complete ? " test-tab--complete" : "") +
        '" href="' + Y.esc(href) + '" data-test="' + Y.esc(t) + '">' +
        '<span class="test-tab__kicker">TEST</span>' +
        '<span class="test-tab__num">' + Y.esc(t) + "</span>" +
        '<span class="test-tab__status">' + status + "</span></a>";
    }).join("");

    contentEl.innerHTML = crumb + hero +
      '<p class="cam-pick-hint">' + Y.esc(hint) + "</p>" +
      '<div class="test-tabs test-tabs--pick" role="navigation" aria-label="Chọn Test">' + tabs + "</div>";

    contentEl.querySelector(".test-tabs").addEventListener("click", function (e) {
      var a = e.target.closest("a.test-tab");
      if (!a || !a.getAttribute("href")) return;
      e.preventDefault();
      (window.YYSD_GO || function (h) { location.href = h; })(a.href);
    });
  }).catch(function (err) {
    var msg = location.protocol === "file:"
      ? "Vui lòng truy cập qua địa chỉ web(http://)thămhình thức kết hợp gốc trạm,mở tệp trực tiếp bằng cách nhấp đúp sẽ bị trình duyệt chặn."
      : err.message;
    contentEl.innerHTML = '<div class="state state--brand"><h3>Tải thất bại</h3><p>' + Y.esc(msg) + "</p></div>";
  });
})();
