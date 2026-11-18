/* =========================================================================
   home.js — keynote landing + ~60s product tour in hero MacBook
   ========================================================================= */
(function () {
  "use strict";

  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  var nextBtn = document.querySelector("[data-ha-next]");
  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      var panels = document.querySelectorAll(".ha-panel");
      if (panels[1]) panels[1].scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* —— Product tour —— */
  var root = document.getElementById("ha-product-tour");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (root && !reduced) {
    var cursor = root.querySelector(".ha-demo__cursor");
    var caption = root.querySelector(".ha-demo__caption");
    var ripple = root.querySelector(".ha-demo__ripple");
    var cx = 72;
    var cy = 74;
    var running = false;
    var gen = 0;

    function wait(ms) {
      return new Promise(function (resolve) { setTimeout(resolve, ms); });
    }

    function showScene(name) {
      root.querySelectorAll(".ha-demo__scene").forEach(function (sc) {
        sc.classList.toggle("is-active", sc.getAttribute("data-scene") === name);
      });
      root.querySelectorAll(".is-hot").forEach(function (el) { el.classList.remove("is-hot"); });
      root.querySelectorAll(".is-picked").forEach(function (el) { el.classList.remove("is-picked"); });
      var daily1 = root.querySelector('.ha-daily__card[data-step="1"]');
      var daily2 = root.querySelector('.ha-daily__card[data-step="2"]');
      if (daily1) daily1.hidden = false;
      if (daily2) daily2.hidden = true;
    }

    function setCaption(text) {
      caption.textContent = text || "";
      caption.classList.toggle("is-on", !!text);
    }

    function hitPoint(name) {
      var el = root.querySelector('[data-hit="' + name + '"]');
      if (!el) return { x: 50, y: 50, el: null };
      var box = root.getBoundingClientRect();
      var r = el.getBoundingClientRect();
      return {
        el: el,
        x: ((r.left + r.width * 0.55) - box.left) / box.width * 100,
        y: ((r.top + r.height * 0.55) - box.top) / box.height * 100
      };
    }

    function moveCursor(x, y, ms) {
      cx = x;
      cy = y;
      root.style.setProperty("--cx", x + "%");
      root.style.setProperty("--cy", y + "%");
      var dur = (ms || 700) + "ms";
      cursor.style.transitionDuration = dur;
      cursor.style.left = x + "%";
      cursor.style.top = y + "%";
      return wait(ms || 700);
    }

    function clickPulse() {
      root.style.setProperty("--rx", cx + "%");
      root.style.setProperty("--ry", cy + "%");
      root.classList.add("is-clicking", "is-ripping");
      return wait(160).then(function () {
        root.classList.remove("is-clicking");
        return wait(300);
      }).then(function () {
        root.classList.remove("is-ripping");
      });
    }

    function hot(name, on) {
      var el = root.querySelector('[data-hit="' + name + '"]');
      if (el) el.classList.toggle("is-hot", !!on);
    }

    function scanItem(hit, text, dwell) {
      var p = hitPoint(hit);
      hot(hit, true);
      setCaption(text);
      return moveCursor(p.x, p.y, 780).then(function () {
        return wait(dwell || 1600);
      }).then(function () {
        hot(hit, false);
      });
    }

    function tourOnce(token) {
      showScene("hub");
      setCaption("");
      root.classList.add("is-ready");
      return moveCursor(78, 76, 0)
        .then(function () { return wait(900); })
        .then(function () {
          if (token !== gen) return;
          setCaption("Đề Cambridge IELTS");
          var p = hitPoint("ielts");
          hot("ielts", true);
          return moveCursor(p.x, p.y, 900);
        })
        .then(function () {
          if (token !== gen) return;
          return clickPulse();
        })
        .then(function () {
          if (token !== gen) return;
          hot("ielts", false);
          showScene("ielts-menu");
          setCaption("Lộ trình đủ bốn kỹ năng IELTS");
          return wait(700);
        })
        .then(function () {
          if (token !== gen) return;
          return scanItem("listen", "Luyện Nghe lần lượt để quen dạng câu hỏi", 1500);
        })
        .then(function () {
          if (token !== gen) return;
          return scanItem("read", "Luyện Đọc với đánh dấu và ghi chú", 1500);
        })
        .then(function () {
          if (token !== gen) return;
          return scanItem("write", "Luyện Viết theo dạng đề chính thức", 1500);
        })
        .then(function () {
          if (token !== gen) return;
          return scanItem("speak", "Luyện Nói và thi thử với AI", 1500);
        })
        .then(function () {
          if (token !== gen) return;
          return scanItem("full", "Thi thử trọn bộ theo nhịp thi trên máy", 2200);
        })
        .then(function () {
          if (token !== gen) return;
          return scanItem("aiw", "Nhận phản hồi bài viết từ AI", 1400);
        })
        .then(function () {
          if (token !== gen) return;
          setCaption("Bắt đầu thi thử trên máy");
          hot("full", true);
          var p = hitPoint("full");
          return moveCursor(p.x, p.y, 600).then(clickPulse);
        })
        .then(function () {
          if (token !== gen) return;
          hot("full", false);
          showScene("cdt");
          setCaption("Làm bài IELTS có bấm giờ");
          return wait(900);
        })
        .then(function () {
          if (token !== gen) return;
          var p = hitPoint("optB");
          return moveCursor(p.x, p.y, 900);
        })
        .then(function () {
          if (token !== gen) return;
          return clickPulse().then(function () {
            var opt = root.querySelector('[data-hit="optB"]');
            if (opt) opt.classList.add("is-picked");
            setCaption("Chọn đáp án và sang câu tiếp theo");
          });
        })
        .then(function () { return wait(2800); })
        .then(function () {
          if (token !== gen) return;
          showScene("hub");
          setCaption("Trở về trung tâm học tập");
          return moveCursor(78, 76, 500).then(function () { return wait(700); });
        })
        .then(function () {
          if (token !== gen) return;
          setCaption("Từ vựng hôm nay");
          hot("vocab", true);
          var p = hitPoint("vocab");
          return moveCursor(p.x, p.y, 900);
        })
        .then(function () {
          if (token !== gen) return;
          return clickPulse();
        })
        .then(function () {
          if (token !== gen) return;
          hot("vocab", false);
          showScene("vocab-menu");
          setCaption("Lộ trình học từ có hệ thống");
          return wait(700);
        })
        .then(function () {
          if (token !== gen) return;
          return scanItem("daily", "Ôn từ theo mục tiêu hôm nay", 1700);
        })
        .then(function () {
          if (token !== gen) return;
          return scanItem("books", "Giáo trình từ vựng · THPT / CET-4 / IELTS", 1500);
        })
        .then(function () {
          if (token !== gen) return;
          return scanItem("themes", "Mở rộng vốn từ theo chủ đề", 1500);
        })
        .then(function () {
          if (token !== gen) return;
          return scanItem("wrong", "Sổ câu sai tự lưu từ cần ôn", 1500);
        })
        .then(function () {
          if (token !== gen) return;
          return scanItem("diag", "Đánh giá vốn từ để chọn bài đầu tiên", 1500);
        })
        .then(function () {
          if (token !== gen) return;
          setCaption("Bắt đầu ôn từ hôm nay");
          hot("daily", true);
          var p = hitPoint("daily");
          return moveCursor(p.x, p.y, 600).then(clickPulse);
        })
        .then(function () {
          if (token !== gen) return;
          hot("daily", false);
          showScene("daily");
          setCaption("Chọn nghĩa phù hợp");
          return wait(800);
        })
        .then(function () {
          if (token !== gen) return;
          var p = hitPoint("meanA");
          return moveCursor(p.x, p.y, 850);
        })
        .then(function () {
          if (token !== gen) return;
          return clickPulse().then(function () {
            var btn = root.querySelector('[data-hit="meanA"]');
            if (btn) btn.classList.add("is-picked");
            setCaption("Trả lời đúng");
          });
        })
        .then(function () { return wait(1400); })
        .then(function () {
          if (token !== gen) return;
          var s1 = root.querySelector('.ha-daily__card[data-step="1"]');
          var s2 = root.querySelector('.ha-daily__card[data-step="2"]');
          if (s1) s1.hidden = true;
          if (s2) s2.hidden = false;
          setCaption("Tiếp tục với từ kế tiếp");
          return wait(500);
        })
        .then(function () {
          if (token !== gen) return;
          var p = hitPoint("next");
          return moveCursor(p.x, p.y, 700);
        })
        .then(function () {
          if (token !== gen) return;
          return clickPulse().then(function () {
            setCaption("Mỗi ngày luyện thêm một chút");
          });
        })
        .then(function () { return wait(2200); })
        .then(function () {
          if (token !== gen) return;
          setCaption("");
          showScene("hub");
          return moveCursor(78, 76, 500).then(function () { return wait(800); });
        });
    }

    function loop() {
      if (!running) return;
      var token = ++gen;
      tourOnce(token).then(function () {
        if (running && token === gen) loop();
      });
    }

    function start() {
      if (running) return;
      running = true;
      loop();
    }

    function stop() {
      running = false;
      gen++;
      setCaption("");
      root.classList.remove("is-ready", "is-clicking", "is-ripping");
    }

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && e.intersectionRatio > 0.35) start();
          else stop();
        });
      }, { threshold: [0, 0.35, 0.6] });
      io.observe(root);
    } else {
      start();
    }
  }

  /* —— Vocab Mac: CSS-only word list scroll —— */
  var vroot = document.getElementById("ha-vocab-tour");
  if (vroot) {
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) vroot.classList.remove("is-scrolling");
  }

  /* —— Task calendar Mac demo —— */
  var cal = document.getElementById("ha-cal-tour");
  if (cal && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var days = cal.querySelectorAll("[data-cal-day]");
    var card = cal.querySelector(".ha-cal-pop");
    var pickIdx = 3;
    var calRunning = false;
    var calGen = 0;

    function calWait(ms) {
      return new Promise(function (resolve) { setTimeout(resolve, ms); });
    }

    function calReset() {
      days.forEach(function (d) { d.classList.remove("is-scan", "is-pick"); });
      if (card) card.classList.remove("is-on");
    }

    function calOnce(token) {
      calReset();
      var chain = Promise.resolve().then(function () {
        if (token !== calGen) return;
        return calWait(600);
      });
      days.forEach(function (day) {
        chain = chain.then(function () {
          if (token !== calGen) return;
          days.forEach(function (d) { d.classList.remove("is-scan"); });
          day.classList.add("is-scan");
          return calWait(520);
        });
      });
      return chain.then(function () {
        if (token !== calGen) return;
        days.forEach(function (d) { d.classList.remove("is-scan"); });
        if (days[pickIdx]) days[pickIdx].classList.add("is-pick");
        return calWait(900);
      }).then(function () {
        if (token !== calGen) return;
        if (card) card.classList.add("is-on");
        return calWait(5200);
      }).then(function () {
        if (token !== calGen) return;
        if (card) card.classList.remove("is-on");
        return calWait(700);
      }).then(function () {
        if (token !== calGen) return;
        days.forEach(function (d) { d.classList.remove("is-pick"); });
        return calWait(1100);
      });
    }

    function calLoop() {
      if (!calRunning) return;
      var token = ++calGen;
      calOnce(token).then(function () {
        if (calRunning && token === calGen) calLoop();
      });
    }

    function calStart() {
      if (calRunning) return;
      calRunning = true;
      calLoop();
    }

    function calStop() {
      calRunning = false;
      calGen++;
      calReset();
    }

    if ("IntersectionObserver" in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && e.intersectionRatio > 0.35) calStart();
          else calStop();
        });
      }, { threshold: [0, 0.35, 0.6] });
      cio.observe(cal);
    } else {
      calStart();
    }
  } else if (cal) {
    var c = cal.querySelector(".ha-cal-pop");
    var d = cal.querySelector('[data-cal-day="3"]');
    if (c) c.classList.add("is-on");
    if (d) d.classList.add("is-pick");
  }

  /* —— Teacher folder + page flip —— */
  var tflow = document.getElementById("ha-teacher-flow");
  if (tflow) {
    var folder = tflow.querySelector(".ha-folder");
    var tabs = Array.prototype.slice.call(tflow.querySelectorAll("[data-tflow]"));
    var panels = Array.prototype.slice.call(tflow.querySelectorAll("[data-tflow-panel]"));
    var ids = tabs.map(function (t) { return t.getAttribute("data-tflow"); });
    var idx = 0;
    var timer = null;
    var dwell = 5800;
    var flipMs = 980;
    var openMs = 1250;
    var opened = false;
    var opening = false;
    var flipping = false;
    var flipTimer = null;
    var flipGen = 0;
    var tReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function clearLeaving() {
      panels.forEach(function (panel) {
        panel.classList.remove("is-leaving", "is-back", "is-under");
      });
      flipping = false;
    }

    function finishFlip(from, to, gen) {
      if (gen !== flipGen) return;
      if (from && from !== to) {
        from.classList.remove("is-on", "is-leaving", "is-back", "is-under");
      }
      if (to) to.classList.remove("is-under");
      flipping = false;
      flipTimer = null;
    }

    function showTeacher(id, opts) {
      opts = opts || {};
      var n = ids.indexOf(id);
      if (n < 0) return;
      if (n === idx && !opts.force) return;

      var dir = opts.dir != null ? opts.dir : (n > idx ? 1 : -1);
      var from = panels[idx];
      var to = panels[n];
      idx = n;

      tabs.forEach(function (tab) {
        var on = tab.getAttribute("data-tflow") === id;
        tab.classList.toggle("is-on", on);
        tab.setAttribute("aria-selected", on ? "true" : "false");
      });

      if (tReduced || !opened || !from || from === to) {
        if (flipTimer) clearTimeout(flipTimer);
        flipGen += 1;
        clearLeaving();
        panels.forEach(function (panel) {
          panel.classList.toggle("is-on", panel === to);
          panel.classList.remove("is-leaving", "is-back", "is-under");
        });
        return;
      }

      if (flipTimer) clearTimeout(flipTimer);
      flipGen += 1;
      var gen = flipGen;
      flipping = true;

      /* Reset mid-flight pages so the next flip starts clean */
      panels.forEach(function (panel) {
        if (panel !== from && panel !== to) {
          panel.classList.remove("is-on", "is-leaving", "is-back", "is-under");
        }
      });
      from.classList.add("is-on");
      from.classList.remove("is-leaving", "is-back", "is-under");
      to.classList.add("is-on", "is-under");
      to.classList.remove("is-leaving", "is-back");

      /* Double rAF: paint resting pose, then start turn (avoids skipped transitions) */
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          if (gen !== flipGen) return;
          from.classList.add("is-leaving");
          from.classList.toggle("is-back", dir < 0);

          var done = function () {
            from.removeEventListener("transitionend", onEnd);
            finishFlip(from, to, gen);
          };
          var onEnd = function (e) {
            if (e.target !== from || e.propertyName !== "transform") return;
            done();
          };
          from.addEventListener("transitionend", onEnd);
          flipTimer = setTimeout(done, flipMs);
        });
      });
    }

    function nextTeacher() {
      if (flipping) return;
      showTeacher(ids[(idx + 1) % ids.length], { dir: 1 });
    }

    function startTeacher() {
      if (tReduced || timer || !opened) return;
      timer = setInterval(nextTeacher, dwell);
    }

    function stopTeacher() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    function openFolder() {
      if (!folder || opened || opening) return;
      opening = true;
      folder.classList.add("is-open");
      if (tReduced) {
        opened = true;
        opening = false;
        showTeacher(ids[0], { force: true });
        return;
      }
      setTimeout(function () {
        opened = true;
        opening = false;
        startTeacher();
      }, openMs);
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var id = tab.getAttribute("data-tflow");
        var n = ids.indexOf(id);
        showTeacher(id, { dir: n >= idx ? 1 : -1 });
        stopTeacher();
        if (opened) startTeacher();
      });
    });

    if (tReduced) {
      openFolder();
    } else if ("IntersectionObserver" in window) {
      var tio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && e.intersectionRatio > 0.28) {
            openFolder();
            if (opened) startTeacher();
          } else {
            stopTeacher();
          }
        });
      }, { threshold: [0, 0.28, 0.55] });
      tio.observe(tflow);
    } else {
      openFolder();
      startTeacher();
    }
  }

  var A = window.YYSD_AUTH;
  if (!A || !A.getToken || !A.getToken()) return;
  if (A.isTeacher && A.isTeacher()) return;

  document.querySelectorAll(".home-market__cta").forEach(function (cta) {
    cta.innerHTML =
      '<a class="home-btn home-btn--primary" href="ielts-vi/">Luyện IELTS miễn phí</a>' +
      '<a class="home-btn home-btn--ghost" href="zone.html?zone=mock&s=ielts">Luyện đề IELTS</a>';
  });
})();
