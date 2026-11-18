/* Trung tâm ngân hàng đềGiáo viêntrạm - Đề bàixem xét hoặc đọc kỹ / đã cóbài thi / mở đường mới hoặc tuyến đường sắt(người quản lý) */
(function (w) {
  "use strict";
  var API = (w.location.hostname === "localhost" || w.location.hostname === "127.0.0.1")
    ? (w.location.protocol + "//" + w.location.hostname + ":3000")
    : "https://api.youyisida.com";
  var TK = "yysd:teacher:token";
  var SKILL_ZH = { reading: "Đọc", listening: "Nghe", writing: "Viết", speaking: "Nói" };
  var SKILL_ORDER = ["reading", "listening", "writing", "speaking"];
  var SKILL_DOT = { reading: "var(--sk-reading)", listening: "var(--sk-listening)", writing: "var(--sk-writing)", speaking: "var(--sk-speaking)" };
  var TYPE_ZH = {
    complete_words: "Từ vựngĐiền khuyết", daily_life: "Đời sốngĐọc", academic: "Học thuậtbài viết",
    choose_response: "Nghe câu, chọn đáp án", conversation: "nói chuyện với ai đó", announcement: "thông báo", lecture: "Bài giảng học thuật",
    sentence: "Xây dựng câu", email: "Viết email", discussion: "Thảo luận học thuật",
    repeat: "Nghelặp lại lời của chính mình hoặc của người khác", interview: "Mô phỏngđược phỏng vấn với tư cách ứng viên"
  };
  var TYPES = {
    reading: ["complete_words", "daily_life", "academic"],
    listening: ["choose_response", "conversation", "announcement", "lecture"],
    writing: ["sentence", "email", "discussion"],
    speaking: ["repeat", "interview"]
  };
  var KIND_ZH = { practice: "Luyện tập", full: "hoàn chỉnhThi thử", single: "mục đơn lẻThi thử" };
  var ST_ZH = { draft: "bản thảo", pending: "ở lại xem xét", live: "đãđưa hàng lên kệ", unpublished: "đãgỡ xuống khỏi kệ ví dụ: sản phẩm bị nhiễm bẩn" };

  var me = null;
  var pool = [];
  var predictionSummary = null;
  var papers = [];
  var tab = "pool";
  var F = { skill: "", typ: "", set: "", src: "", q: "" };
  var reviewId = "";
  var reviewSeq = 0;
  var reviewData = null;
  var reviewBlobs = [];
  var reviewRequests = [];
  var pkgs = null;
  var stuList = null;
  var grantSel = { practice: true };
  var stuSel = {};
  var stuQ = "";
  var gwStart = "";
  var gwExp = "";
  var ledger = [];
  var toastTimer = 0;

  function token() {
    try { return localStorage.getItem(TK) || ""; } catch (e) { return ""; }
  }
  function api(path, opts) {
    opts = opts || {};
    return fetch(API + path, {
      method: opts.method || "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-Slug": "yysd",
        Authorization: token() ? "Bearer " + token() : ""
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      cache: "no-store",
      signal: opts.signal
    }).then(function (r) {
      return r.text().then(function (text) {
        var d = {};
        if (text) { try { d = JSON.parse(text); } catch (e) { throw new Error("máy chủ máy tínhbất thường"); } }
        if (!r.ok) throw new Error((d && d.error) || "yêu cầuThất bại");
        return d;
      });
    });
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function msg(t, ok) {
    var el = document.getElementById("msg");
    if (!el) return;
    el.textContent = t || "";
    el.className = "msg show" + (ok ? " ok" : "");
    clearTimeout(toastTimer);
    if (t) toastTimer = setTimeout(function () { el.classList.remove("show"); }, 3200);
  }
  function show(id) {
    if (id !== "app") clearReview();
    ["gate", "login", "app"].forEach(function (k) {
      document.getElementById(k).classList.toggle("hidden", k !== id);
    });
  }
  function blockOf(id) {
    for (var i = 0; i < pool.length; i++) if (pool[i].id === id) return pool[i];
    return null;
  }
  function bankSetParts(s) {
    var m = /^(R-CW|R-RDL|R-RAP|L-CR|L-LCN|L-ANO|L-AT|W-BS|W-WE|W-AD|S-LRP|S-INT)(\d+)(?:-Q(\d+))?$/i.exec(String(s || ""));

    return m ? [m[1].toUpperCase(), Number(m[2]), m[3] ? Number(m[3]) : 0] : null;
  }
  function isBankSet(s) {
    return !!bankSetParts(s);
  }
  function setLabel(s) {
    var m = /^prediction-(\d{4}-\d{2}-\d{2})$/.exec(String(s || ""));
    return m ? m[1] + " dự báohọ" : isBankSet(s) ? String(s) : "Set " + s;
  }
  function isPrediction(b) {
    return (b.sources || [b.source]).indexOf("prediction") >= 0 || /^prediction-/.test(String(b.set || ""));
  }
  function blockLine(b) {
    var set = b.set ? setLabel(b.set) : "";
    return (TYPE_ZH[b.type] || SKILL_ZH[b.skill] || "") +
      (set ? " · " + set : "") +
      (b.paperId && !isBankSet(b.set) && !isPrediction(b) ? " · " + b.paperId : "") +
      (b.n > 1 ? " · " + b.n + " họ" : "");
  }
  function dotStyle(b) {
    return " style=\"--sk:" + (SKILL_DOT[b.skill] || "var(--faint)") + "\"";
  }
  function ts(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso).slice(0, 16).replace("T", " ");
    function p(n) { return n < 10 ? "0" + n : String(n); }
    return p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes());
  }

  /* ——— Lọchọ họ ——— */
  function typeOptions() {
    var keys = F.skill && TYPES[F.skill]
      ? TYPES[F.skill]
      : ["complete_words", "daily_life", "academic", "choose_response", "conversation", "announcement", "lecture", "sentence", "email", "discussion", "repeat", "interview"];
    return '<option value="">Tất cảhọ khuôn</option>' + keys.map(function (k) {
      return '<option value="' + k + '"' + (F.typ === k ? " selected" : "") + ">" + TYPE_ZH[k] + "</option>";
    }).join("");
  }
  function blockMatches(b, skip) {
    skip = skip || {};
    if (!skip.skill && F.skill && b.skill !== F.skill) return false;
    if (!skip.typ && F.typ && !F.q && b.type !== F.typ) return false;
    if (!skip.set && F.set && String(b.set) !== String(F.set)) return false;
    if (!skip.src && F.src && (b.sources || [b.source]).indexOf(F.src) < 0) return false;
    if (!skip.q && F.q) {
      var blob = (b.hay || "") + " " + (b.title || "") + " " + (b.titleZh || "") + " " + (TYPE_ZH[b.type] || "") + " " + (b.paperId || "") + " " + (b.set || "");
      if (blob.toLowerCase().indexOf(F.q) < 0) return false;
    }
    return true;
  }
  function cmpSet(a, b) {
    var ra = bankSetParts(a);
    var rb = bankSetParts(b);
    if (ra && rb) {
      var fam = { "R-CW": 1, "R-RDL": 2, "R-RAP": 3, "L-CR": 4, "L-LCN": 5, "L-ANO": 6, "L-AT": 7, "W-BS": 8, "W-WE": 9, "W-AD": 10, "S-LRP": 11, "S-INT": 12 };

      var fa = fam[ra[0]] || 11;
      var fb = fam[rb[0]] || 11;
      return fa !== fb ? fa - fb : (ra[1] !== rb[1] ? ra[1] - rb[1] : (ra[2] || 0) - (rb[2] || 0));
    }
    if (ra) return 1;
    if (rb) return -1;
    var na = Number(a), nb = Number(b);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return String(a || "").localeCompare(String(b || ""));
  }
  function filtered() {
    return pool.filter(function (b) { return blockMatches(b, {}); }).sort(function (a, b) {
      var c = cmpSet(a.set, b.set);
      return c || String(a.title || "").localeCompare(String(b.title || ""));
    });
  }
  function setKeys() {
    var seen = {};
    pool.forEach(function (b) {
      if (!blockMatches(b, { set: 1, q: 1 })) return;
      if (b.set != null && b.set !== "") seen[String(b.set)] = 1;
    });
    return Object.keys(seen).sort(cmpSet);
  }
  function dropGoneSet() {
    if (F.set && setKeys().indexOf(String(F.set)) < 0) F.set = "";
  }
  function setOptions() {
    dropGoneSet();
    var keys = setKeys();
    return '<option value="">Tất cảche đậy gầm / ngày tháng</option>' + keys.map(function (k) {
      return '<option value="' + esc(k) + '"' + (String(F.set) === String(k) ? " selected" : "") + ">" + esc(setLabel(k)) + "</option>";
    }).join("");
  }
  function paintFilters() {
    var setOpts = setOptions();
    return '<input id="f-q" class="q" aria-label="Tìm kiếmbài viết,họ biến thể cũ của,Phương áncó thểGiải thích" value="' + esc(F.q) + '" placeholder="tìm kiếmbài viết / họ biến thể cũ của / Phương án / Giải thích">' +
      '<select id="f-skill" aria-label="môn học"><option value="">Tất cảmôn học</option>' +
      SKILL_ORDER.map(function (s) {
        return '<option value="' + s + '"' + (F.skill === s ? " selected" : "") + ">" + SKILL_ZH[s] + "</option>";
      }).join("") + "</select>" +
      '<select id="f-type" aria-label="họ khuôn">' + typeOptions() + "</select>" +
      '<select id="f-set" aria-label="che đậy gầm có thểngày tháng">' + setOpts + "</select>" +
      '<select id="f-src" aria-label="nguồn thông tin"><option value="">Tất cảnguồn thông tin</option>' +
      '<option value="set"' + (F.src === "set" ? " selected" : "") + ">Chính thứcche đậy họ</option>" +
      '<option value="date"' + (F.src === "date" ? " selected" : "") + ">Thi thửcuộn lại</option>" +
      '<option value="bank"' + (F.src === "bank" ? " selected" : "") + ">ngân hàng câu hỏi cho người ra đề hoặc học sinh chuẩn bị thi</option>" +
      '<option value="prediction"' + (F.src === "prediction" ? " selected" : "") + ">dự báohọ</option></select>";
  }
  function blockPreviewHref(b) {
    if (isPrediction(b)) return "";
    var local = w.location.hostname === "localhost" || w.location.hostname === "127.0.0.1";
    var app = local ? "/app/" : "https://app.youyisida.com/";
    var skill = b.skill || "reading";
    var q = "mode=practice&preview=1&from=app&task=" + encodeURIComponent(b.task) +
      "&end=" + encodeURIComponent(b.end == null ? b.task : b.end);
    if ((b.source === "bank" || b.source === "date") && b.paperId) {
      return app + "toefl-" + skill + ".html?id=" + encodeURIComponent(b.paperId) + "&" + q;
    }
    return app + "toefl-" + skill + ".html?set=" + encodeURIComponent(b.set || 1) + "&" + q;
  }
  function updatePoolList() {
    var el = document.getElementById("pool-list");
    if (!el) return;
    var list = filtered();
    document.getElementById("pool-count").textContent = "hình thức kết hợp cái sàng đến " + list.length + " dùng trong họ cục";
    el.innerHTML = list.length
      ? list.map(function (b) {
        var href = blockPreviewHref(b);
        return '<article class="block' + (reviewId === b.id ? " is-on" : "") + '"' + dotStyle(b) + '>' +
          '<button type="button" class="block-review" data-inspect="' + esc(b.id) + '" aria-pressed="' + (reviewId === b.id) + '" aria-controls="review-body">' +
          '<b>' + esc(b.title || b.titleZh) + "</b>" +
          (b.titleZh && b.title && b.titleZh !== b.title ? '<span class="sub">' + esc(b.titleZh) + "</span>" : "") +
          '<span class="meta">' + esc(blockLine(b)) + '</span><span class="review-label">xem xét hoặc đọc kỹ</span></button>' +
          (href ? '<a class="block-pv" data-bpv="' + esc(b.id) + '" href="' + esc(href) + '" target="yysd-preview">bên ngoàixem trước</a>' : "") + '</article>';
      }).join("")
      : '<div class="empty"><b>không cóphù hợp vớiđiều kiệnhọ cục</b><p>trao đổi dùng trongLọcđiều kiệnthử thử</p></div>';
  }

  /* Giáo viênchỉ đọc tin họcxem xét hoặc đọc kỹ:đi rồi quay lại sử dụngĐọchiển thị,khôngtruy cập mạngHọc viênđo thời gian,Chấm điểmcó thểGhi âm. */
  function clearReview() {
    reviewSeq += 1;
    reviewData = null;
    document.querySelectorAll("#review-body audio,#review-body video").forEach(function (el) {
      el.pause();
      el.removeAttribute("src");
      el.load();
    });
    reviewRequests.forEach(function (c) { c.abort(); });
    reviewRequests = [];
    reviewBlobs.forEach(function (url) { URL.revokeObjectURL(url); });
    reviewBlobs = [];
  }
  function reviewCurrent(seq, host) {
    return seq === reviewSeq && tab === "pool" && host === document.getElementById("review-body");
  }
  function mediaPath(path) {
    if (typeof path !== "string") return "";
    if (/^\/api\/tiku\/prediction\/media\/[a-f0-9]{24}\.[a-z0-9]{1,8}$/.test(path)) return path;
    var decoded;
    try { decoded = decodeURIComponent(path); } catch (e) { return ""; }
    if (/[\\:%?#\x00-\x1f\x7f]/.test(decoded) || /\/\//.test(decoded) || /(^|\/)\.{1,2}(\/|$)/.test(decoded.replace(/^\.\//, ""))) return "";
    decoded = decoded.replace(/^\.\//, "").replace(/^\//, "");
    if (!/^library\/toefl\/.+/.test(decoded)) return "";
    var local = w.location.hostname === "localhost" || w.location.hostname === "127.0.0.1";
    return new URL(decoded, local ? new URL("/app/", w.location.href) : "https://app.youyisida.com/").href;
  }
  function reviewText(value) {
    if (value == null) return "";
    if (Array.isArray(value)) return value.map(reviewText).filter(Boolean).join("\n\n");
    if (typeof value === "object") return Object.keys(value).map(function (k) { return k + ": " + reviewText(value[k]); }).join("\n");
    return String(value);
  }
  function reviewNote(host, label, value) {
    var text = reviewText(value);
    if (!text) return;
    var box = document.createElement("div");
    box.className = "review-note";
    var heading = document.createElement("h4");
    heading.textContent = label;
    var content = document.createElement("div");
    content.className = "review-text";
    content.textContent = text;
    box.appendChild(heading);
    box.appendChild(content);
    host.appendChild(box);
  }
  function reviewDetails(host, label) {
    var details = document.createElement("details");
    details.className = "review-details";
    var summary = document.createElement("summary");
    summary.textContent = label;
    details.appendChild(summary);
    host.appendChild(details);
    return details;
  }
  function mediaKind(path, kind) {
    if (/\.(mp3|m4a|wav|ogg|aac|flac)$/i.test(path)) return "audio";
    if (/\.(mp4|webm|mov|m4v)$/i.test(path)) return kind === "audio" ? "audio" : "video";
    if (/\.(png|jpe?g|gif|webp|svg|avif)$/i.test(path)) return "image";
    return /^(audio|video|image)$/.test(kind) ? kind : "attachment";
  }
  function reviewMedia(host, item, seq, body) {
    if (!item || !item.path) return;
    var box = document.createElement("figure");
    box.className = "review-media";
    var caption = document.createElement("figcaption");
    caption.textContent = item.label || "truyền thôngphụ lục trong tài liệu";
    var slot = document.createElement("div");
    box.appendChild(caption);
    box.appendChild(slot);
    host.appendChild(box);
    var metadata = reviewData && (reviewData.media || []).filter(function (m) { return m.path === item.path; })[0];
    if (item.available === false || (metadata && metadata.available === false)) {
      slot.textContent = "họ trạmtừ chốithăm,chưagiành đượcnàyhuyện Tư Nguyên ở Quế Lâm;Đề bàichữ viếttài liệuvẫn tiền tố có thểxem xét hoặc đọc kỹ.";
      slot.className = "review-error";
      return;
    }
    var path = mediaPath(item.path);
    if (!path) { slot.textContent = "không thể chịu đựng đượccầmtruyền thôngcon đường"; return; }
    var kind = mediaKind(item.path, item.kind);
    function mount(url) {
      if (!reviewCurrent(seq, body)) return;
      slot.innerHTML = "";
      var el = document.createElement(kind === "image" ? "img" : kind === "attachment" ? "a" : kind);
      if (kind === "attachment") {
        el.href = url;
        el.download = String(item.path).split("/").pop();
        el.className = "link-btn";
        el.textContent = "Tải xuốngphụ lục trong tài liệu";
      } else {
        if (kind === "image") el.alt = caption.textContent;
        else { el.controls = true; el.preload = "none"; el.setAttribute("aria-label", caption.textContent); }
        el.src = url;
        el.addEventListener("error", function () { if (reviewCurrent(seq, body)) fail("truyền thôngkhông thểPhátcó thểhiển thị,mờithử lại"); });
      }
      slot.appendChild(el);
    }
    function fail(text) {
      slot.innerHTML = '<p class="review-error" role="status"></p><button type="button" class="sm">thử lạitruyền thông</button>';
      slot.querySelector("p").textContent = text;
      slot.querySelector("button").onclick = load;
    }
    function load() {
      if (!reviewCurrent(seq, body)) return;
      slot.textContent = "Tảitruyền thông…";
      if (path.indexOf("/api/") !== 0) { mount(path); return; }
      var controller = new AbortController();
      reviewRequests.push(controller);
      fetch(API + path, {
        headers: { "X-Tenant-Slug": "yysd", Authorization: token() ? "Bearer " + token() : "" },
        cache: "no-store", signal: controller.signal, redirect: "error"
      }).then(function (r) {
        if (!r.ok) throw new Error("truyền thôngTải thất bại(" + r.status + "),mờithử lại");
        return r.blob();
      }).then(function (blob) {
        if (!reviewCurrent(seq, body)) return;
        // phụ lục trong tài liệuchỉTải xuống,không nhường họ họ HTML đợitài liệutheo một tôn giáo đặc biệt là Hồi giáohọ đầuthực hiện.
        if (kind === "attachment") blob = new Blob([blob], { type: "application/octet-stream" });
        var url = URL.createObjectURL(blob);
        reviewBlobs.push(url);
        mount(url);
      }).catch(function (e) {
        if (reviewCurrent(seq, body) && e.name !== "AbortError") fail(e.message || "truyền thôngTải thất bại,mờithử lại");
      });
    }
    load();
  }
  var readingLoad = null;
  function ensureReading() {
    if (w.YYSD_TOEFL) return Promise.resolve(w.YYSD_TOEFL);
    if (readingLoad) return readingLoad;
    readingLoad = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "https://app.youyisida.com/assets/js/reading.js?v=20261016prediction1";
      script.onload = function () { script.remove(); if (w.YYSD_TOEFL) resolve(w.YYSD_TOEFL); else reject(new Error("Đọchiển thịmô-đunTải thất bại")); };
      script.onerror = function () { script.remove(); reject(new Error("Đọchiển thịmô-đunTải thất bại,mờithử lại")); };
      document.head.appendChild(script);
    }).catch(function (e) { readingLoad = null; throw e; });
    return readingLoad;
  }
  function renderReview(data, body, seq, T) {
    var b = data.block || blockOf(reviewId) || {};
    body.innerHTML = '<div class="pane-title"><h3></h3><button type="button" class="sm" id="review-export">suy rahọ họdữ liệu</button></div><p class="muted review-meta"></p>';
    body.querySelector("h3").textContent = b.titleZh || b.title || "Đề bàiNội dung";
    body.querySelector(".review-meta").textContent = blockLine(b) + " · Giáo viênchỉ đọc tin học";
    body.querySelector("#review-export").disabled = !(data.sourceItems || []).length;
    var no = 0;
    (data.tasks || []).forEach(function (task, ti) {
      var section = document.createElement("article");
      section.className = "review-task";
      body.appendChild(section);
      reviewNote(section, "họ cục " + (ti + 1), task.title || task.titleZh || TYPE_ZH[task.type]);
      reviewNote(section, "Giải thích", task.instruction);
      var passage = document.createElement("div");
      passage.className = "review-passage";
      if (task.type === "complete_words") {
        var saved = {};
        (task.passage || []).forEach(function (p) { if (p.id) saved[p.id] = p.answer; });
        T.renderBlanksReview(task, passage, saved);
        section.appendChild(passage);
      } else if (task.paras || task.layout || task.image) {
        var insertion = (task.questions || []).filter(T.isInsertQ)[0];
        T.renderPassage(Object.assign({}, task, { image: "" }), passage, !!insertion);
        if (insertion) T.markInsertReview(passage, insertion, "", T.insertSentence(task, insertion));
        section.appendChild(passage);
      }
      reviewNote(section, "ở lạichèn vàoCâu", task.insertSentence);
      reviewMedia(section, { path: task.audio, label: "Đề bàiAudio", kind: "audio" }, seq, body);
      reviewMedia(section, { path: task.image, label: "Đề bàikết hợp sơ đồ", kind: "image" }, seq, body);
      reviewNote(section, "NgheVăn bản gốc", task.transcript);
      reviewNote(section, "tình huống", task.context);
      reviewNote(section, "Đề bài", task.stem);
      reviewNote(section, "ViếtNhiệm vụ", task.prompt);
      reviewNote(section, "Viếtđiểm chính", task.bullets);
      reviewNote(section, "người nhận thư từ", task.to);
      reviewNote(section, "Chủ đề", task.subject);
      reviewNote(section, "giáo sưcâu hỏi", task.professor);
      reviewNote(section, "thảo luậnvừa khít", task.posts);
      if (task.type === "sentence") {
        reviewNote(section, "Câucấu trúc", (task.parts || []).map(function (p) { return p.slot ? "____" : p.t || ""; }).join(" "));
        reviewNote(section, "biến thể cũ của cục", (task.bank || []).join(" / "));
        reviewNote(section, "Đúngtrình tự", (task.answer || []).join(" "));
      }
      reviewNote(section, task.type === "repeat" ? "họ Ưnglặp lại lời của chính mình hoặc của người khác" : "tham khảomô hình họ / minh họa", task.sample);
      reviewNote(section, "Khácmô hình họ", task.samples);
      reviewNote(section, "Giải thích", task.analysis || task.explain);
      (task.questions || []).forEach(function (q, qi) {
        var question = document.createElement("section");
        question.className = "review-question";
        section.appendChild(question);
        reviewNote(question, "câu hỏi " + (qi + 1), q.stem);
        var options = document.createElement("div");
        options.className = "review-options";
        // renderOptions cầm id chắp vá tiến lênthuộc tính;chỉ truyền đạtbên tronggiá trị số,không đời nàotruyền đạt họ họ id.
        T.renderOptions(Object.assign({}, q, { id: ++no }), options, q.answer);
        options.querySelectorAll("input").forEach(function (input) {
          input.disabled = true;
          var correct = (Array.isArray(q.answer) ? q.answer : [q.answer]).indexOf(input.value) >= 0;
          input.checked = correct;
          if (correct) {
            input.parentNode.classList.add("is-key");
            var key = document.createElement("span");
            key.className = "review-key";
            key.textContent = "Đáp án đúng";
            input.parentNode.appendChild(key);
          }
        });
        question.appendChild(options);
        reviewNote(question, "Đáp án đúng", q.answer);
        reviewNote(question, "Giải thích", q.analysis || q.explain);
        reviewNote(question, "NgheVăn bản gốc", q.transcript);
        reviewMedia(question, { path: q.audio, label: "câu hỏiAudio", kind: "audio" }, seq, body);
        reviewMedia(question, { path: q.image, label: "câu hỏikết hợp sơ đồ", kind: "image" }, seq, body);
      });
    });
    if (!(data.tasks || []).length) reviewNote(body, "Nội dungGợi ý", "tạm thời không cóthay đổihọĐề bài,mờiXembên dướihọ họbổ sungNội dung.");
    (data.sourceItems || []).forEach(function (item, i) {
      var extra = reviewDetails(body, "họ họbổ sung " + (i + 1) + (item.labelZh ? " · " + item.labelZh : ""));
      [
        ["Văn bản gốctoàn văn", "full"], ["sửa biến thể cũ củaĐáp án", "slots"], ["Tiếng TrungBản dịch", "stimulusTextZh"],
        ["đoạnBản dịch", "paragraphsZh"], ["tiêu đềBản dịch", "labelZh"], ["họ biến thể cũ củaBản dịch", "stemZh"],
        ["NgheBản dịch", "transcriptZh"], ["ViếtNhiệm vụ", "prompt"], ["họ họ mô hình họ", "essay"],
        ["mô hình họBản dịch", "translation"], ["Nóitình huống", "scenario"]
      ].forEach(function (field) { reviewNote(extra, field[0], item[field[1]]); });
      if ((item.questions || []).length) {
        var analyses = reviewDetails(extra, "Tất cảcâu hỏiBản dịchPhương ánGiải thích");
        item.questions.forEach(function (q, qi) {
          reviewNote(analyses, "câu hỏi " + (qi + 1), q.stemZh || q.stem);
          reviewNote(analyses, "câu hỏinhãn", q.labelZh);
          (q.choices || []).slice().sort(function (a, b) { return a.order - b.order; }).forEach(function (choice, ci) {
            reviewNote(analyses, String.fromCharCode(65 + ci) + " Phương ánBản dịch", choice.labelZh);
          });
          reviewNote(analyses, "Tất cảPhương ánGiải thích", q.explanations || q.analysis || q.explain);
          reviewNote(analyses, "họ họĐề bàiđoạn / chèn vàovị trí", q.questionParagraphs);
        });
      }
      if ((item.transcriptSentences || []).length) {
        var transcript = reviewDetails(extra, "hình thức kết hợp theo đuổi biến thể củaNgheVăn bản gốcBản dịch");
        item.transcriptSentences.forEach(function (sentence, si) {
          var timing = sentence.startTime != null ? "(" + sentence.startTime + " - " + (sentence.endTime == null ? "" : sentence.endTime) + ")" : "";
          reviewNote(transcript, "biến thể của " + (si + 1) + timing, sentence.text);
          reviewNote(transcript, "Bản dịch", sentence.translationZh);
        });
      }
      (item.qs || []).forEach(function (q, qi) {
        reviewNote(extra, "Nóicâu hỏi / họ Ưnglặp lại lời của chính mình hoặc của người khác " + (qi + 1), q.sentence);
        reviewNote(extra, "Nóitrình diễnĐáp án " + (qi + 1), q.modelAnswerText);
      });
    });
    var media = data.media || [];
    if (media.length) {
      var group = reviewDetails(body, "họ họTất cảtruyền thôngphụ lục trong tài liệu(" + media.length + ")");
      group.open = true;
      media.forEach(function (item) { reviewMedia(group, item, seq, body); });
    }
  }
  function loadReview(id, focus) {
    clearReview();
    reviewId = id;
    var seq = reviewSeq;
    var body = document.getElementById("review-body");
    if (!body) return;
    updatePoolList();
    body.innerHTML = '<p role="status">TảiĐề bàiNội dung…</p><div class="skel skel-row"></div><div class="skel skel-row"></div>';
    if (focus) body.focus();
    if (w.YYSD_TIKU_GATE && w.YYSD_TIKU_GATE.local && /(?:\?|&)demo=1(?:&|$)/.test(w.location.search || "")) {
      body.textContent = "biến thể củachỉtrình diễnsắp xếp;thậtĐề bàidự báohọ yêu cầuđi quaGiáo viênxác thựchọxem xét hoặc đọc kỹ.";
      return;
    }
    var controller = new AbortController();
    reviewRequests.push(controller);
    Promise.all([api("/api/tiku/blocks/" + encodeURIComponent(id), { signal: controller.signal }), ensureReading()]).then(function (xs) {
      if (!reviewCurrent(seq, body)) return;
      var data = xs[0];
      if (!data.ok) throw new Error("Đề bàiTải thất bại");
      reviewData = data;
      renderReview(data, body, seq, xs[1]);
    }).catch(function (e) {
      if (!reviewCurrent(seq, body)) return;
      clearReview();
      body.innerHTML = '<p class="review-error" role="status"></p><button type="button" class="btn" id="review-retry">thử lạixem xét hoặc đọc kỹ</button>';
      body.querySelector("p").textContent = e.message || "Đề bàiTải thất bại,mờithử lại";
    });
  }
  function exportReview() {
    if (!reviewData || !(reviewData.sourceItems || []).length) return;
    var url = URL.createObjectURL(new Blob([JSON.stringify(reviewData.sourceItems, null, 2)], { type: "application/json" }));
    reviewBlobs.push(url);
    var link = document.createElement("a");
    link.href = url;
    link.download = "prediction-" + reviewId.replace(/[^a-z0-9_-]/gi, "_") + ".json";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
  function paintPool() {
    var summary = predictionSummary ? "dự báohọ:" + predictionSummary.groups + " họ / " + predictionSummary.questions + " con trai họ;" +
      (predictionSummary.media - predictionSummary.unavailableMedia) + "/" + predictionSummary.media + " dùng trongtruyền thôngđãgiành được." +
      (predictionSummary.unavailableMedia ? predictionSummary.unavailableMedia + " dùng tronghuyện Tư Nguyên ở Quế Lâmhọ trạmtừ chốithăm,đãđánh dấuthiếu." : "") : "";
    document.getElementById("main").innerHTML =
      '<div class="bench review-bench"><section class="card pool-pane">' +
        '<div class="pane-title"><h2>Đề bàixem xét hoặc đọc kỹ</h2><span class="n" id="pool-count" role="status"></span></div>' +
        '<div class="filters">' + paintFilters() + '</div><p class="pool-meta">nhấn«xem xét hoặc đọc kỹ»Xemvăn bản chính trái với chú thích chân trang,Đáp ánGiải thích;dự báohọ hầu nhưGiáo viêncó thể thấy rõ rằng điều này đúng.' + esc(summary) + '</p>' +
        '<div class="pool" id="pool-list"></div></section>' +
        '<section class="card review-pane" aria-labelledby="review-heading"><div class="pane-title"><h2 id="review-heading">chỉ đọc tin họcNội dung</h2></div>' +
        '<div id="review-body" tabindex="-1"><div class="empty"><b>Chọnmột dùng trong họ cụcxem xét hoặc đọc kỹ</b><p>không có khả năngtrả lời,đo thời gian,Chấm điểmcó thểGhi âm.</p></div></div></section></div>';
    updatePoolList();
    if (reviewId && blockOf(reviewId)) loadReview(reviewId, false);
  }

  /* ——— tôi cuộn lại ——— */
  function totalMins(p) {
    var m = p.skillMinutes || {};
    return SKILL_ORDER.reduce(function (a, s) { return a + (Number(m[s]) || 0); }, 0);
  }
  function paintList(rows, review) {
    var main = document.getElementById("main");
    var list = (rows || []).slice();
    if (review) list = list.filter(function (p) { return p.status === "pending"; });
    if (!list.length) {
      main.innerHTML = '<div class="empty"><b>' +
        (review ? "không cóở lại xem xét cuộn lại" : "họkhông cóđã cóbài thi") + "</b><p>" +
        (review ? "thời điểm hiện tạikhông cócầnkiểm toánbài thi." : "đã cóbài thicó thểgiữtồn tạibiến thể của;hình thức kết hợp gốc bánh xe khôngthêm cái gì đó mớinhân tạohọ cuộn lại.") +
        '</p><button type="button" class="btn" data-tab="pool">đixem xét hoặc đọc kỹĐề bài</button></div>';
      return;
    }
    main.innerHTML = '<div class="paper-list">' + list.map(function (p) {
      var acts = [];
      if (review) {
        acts.push('<button type="button" class="sm" data-ok="' + esc(p.id) + '">đi qua</button>');
        acts.push('<button type="button" class="sm danger" data-no="' + esc(p.id) + '">trả lại một món đồ</button>');
      } else {
        if (p.status === "draft" || p.status === "pending") acts.push('<button type="button" class="sm primary" data-sub="' + esc(p.id) + '">đưa hàng lên kệ</button>');
        if (p.status === "live" || (p.status === "pending" && p.live)) acts.push('<button type="button" class="sm danger" data-off="' + esc(p.id) + '">gỡ xuống khỏi kệ ví dụ: sản phẩm bị nhiễm bẩn</button>');
      }
      acts.push('<button type="button" class="sm" data-pv="' + esc(p.id) + '">xem trước</button>');
      var blocks = p.blocks || [];
      return '<article class="card paper-row">' +
        '<div class="r1"><span class="pt">' + esc(p.title) + '</span>' +
          '<span class="pill kind">' + esc(KIND_ZH[p.kind] || p.kind) + '</span>' +
          '<span class="pill ' + esc(p.status) + '">' + esc(ST_ZH[p.status] || p.status) + "</span></div>" +
        '<div class="r2"><span>' + blocks.length + ' dùng trong họ cục</span><span class="sep">·</span>' +
          '<span>' + (totalMins(p) ? "thời lượngcộng tổng " + totalMins(p) + " phút" : "khôngđặt giới hạn thời gian") + '</span><span class="sep">·</span>' +
          "<span>thay cũ đổi mớihọ " + esc(ts(p.updatedAt)) + "</span>" +
          (p.owner === "hq" ? '<span class="sep">·</span><span>trụ sở chính</span>' : "") +
          (p.makerName && p.owner !== "hq" && me && me.isAdmin ? '<span class="sep">·</span><span>' + esc(p.makerName) + " " + esc(p.makerPhone || "") + "</span>" : "") +
          (p.rejectNote ? '<span class="sep">·</span><span style="color:var(--accent)">trả lại một món đồ:' + esc(p.rejectNote) + "</span>" : "") + "</div>" +
        (blocks.length ? '<div class="r2">' + blocks.slice(0, 6).map(function (b) { return esc(b.titleZh || b.title); }).join(",") + (blocks.length > 6 ? " …" : "") + "</div>" : "") +
        '<div class="acts">' + acts.join("") + "</div></article>";
    }).join("") + "</div>";
  }

  /* ——— mở đường mới hoặc tuyến đường sắt(người quản lý):Học viênnhiều chọn × mục tiêunhiều chọn(Khu vực Luyện tập + đánh trướcthể thao chạy nước rúthọ)loạt ——— */
  function grantStateText(st) {
    if (!st) return "";
    if (st.on && st.grace) return "gia hạn thời hạnhình thức kết hợp Trung Quốc";
    if (st.on) return st.expireAt ? "đãmở đường mới hoặc tuyến đường sắt · đến " + ts(st.expireAt) : "đãmở đường mới hoặc tuyến đường sắt";
    if (st.reason === "scheduled") return "ấn định thời gian " + ts(st.startAt);
    if (st.reason === "expired") return "đãđến hạn khoản vay";
    if (st.reason === "off") return "đãngừng sử dụng";
    return "";
  }
  function checkedScopes() {
    return Object.keys(grantSel).filter(function (k) { return grantSel[k]; });
  }
  function scopeTitle(scope) {
    if (scope === "practice") return "Đề thi thậtngân hàng câu hỏi cho người ra đề hoặc học sinh chuẩn bị thi";
    var id = scope.slice("package:".length);
    var p = (pkgs || []).filter(function (x) { return x.id === id; })[0];
    return p ? p.title : id;
  }
  function stuFiltered() {
    var q = stuQ.toLowerCase();
    return (stuList || []).filter(function (s) {
      return !q || ((s.displayName || "") + " " + s.phone).toLowerCase().indexOf(q) >= 0;
    });
  }
  function paintGrant() {
    var main = document.getElementById("main");
    if (!pkgs) {
      main.innerHTML = '<div class="card pool-pane"><div class="skel skel-row"></div><div class="skel skel-row"></div><div class="skel skel-row"></div></div>';
      return;
    }
    var m = checkedScopes().length;
    var byUser = {};
    ledger.forEach(function (r) {
      var u = byUser[r.userId] || (byUser[r.userId] = { name: r.name, phone: r.phone, items: [] });
      u.items.push(r);
    });
    var students = stuFiltered();
    main.innerHTML =
      '<div class="bench">' +
        '<section class="card pool-pane">' +
          '<div class="pane-title"><h2>Học viên</h2><span class="n"> ' + (stuList || []).length + " người · đã chọnmục tiêu " + m + ' dùng trong</span></div>' +
          '<div class="filters">' +
            '<input id="g-q" class="q" value="' + esc(stuQ) + '" placeholder="tìm kiếmhọ và tên / điện thoại di độnggầm">' +
            '<button type="button" class="sm" id="g-all">họ chọnthời điểm hiện tại</button>' +
            '<button type="button" class="sm" id="g-none">dọn dẹp</button>' +
          "</div>" +
          (students.length
            ? '<div class="g-list">' + students.map(function (s) {
              var items = (byUser[s.id] || { items: [] }).items;
              var n = items.filter(function (it) { return it.state && it.state.on; }).length;
              return '<label class="g-row">' +
                '<input type="checkbox" data-gsel="' + esc(s.id) + '"' + (stuSel[s.id] ? " checked" : "") + ">" +
                '<span class="g-who">' + esc(s.displayName || "(chưa có tiêu đề)") + "<i>" + esc(s.phone) + "</i></span>" +
                (m ? '<span class="pill ' + (n === m ? "live" : "unpublished") + '">đã mở ngoại động từ hoặc nội động từ ' + n + "/" + m + "</span>" : "") +
              "</label>";
            }).join("") + "</div>"
            : '<div class="empty"><b>không cóphù hợp vớiHọc viên</b></div>') +
        "</section>" +
        '<section class="card sheet">' +
          '<div class="pane-title"><h2>mở đường mới hoặc tuyến đường sắtmục tiêu</h2><span class="n">họmột vài,đầu tiênsau một mệnh đề giả định trong trường hợp đómở đường mới hoặc tuyến đường sắtmột vài</span></div>' +
          '<div class="g-list scope-list">' +
            '<label class="g-row">' +
              '<input type="checkbox" data-gscope="practice"' + (grantSel.practice ? " checked" : "") + ">" +
              '<span class="g-who">Đề thi thậtngân hàng câu hỏi cho người ra đề hoặc học sinh chuẩn bị thi<i>toàn bộKhu vực Luyện tập</i></span>' +
            "</label>" +
            pkgs.map(function (p) {
              var sc = "package:" + p.id;
              return '<label class="g-row">' +
                '<input type="checkbox" data-gscope="' + esc(sc) + '"' + (grantSel[sc] ? " checked" : "") + ">" +
                '<span class="g-who">' + esc(p.title) + "<i>" + (p.kind === "single" ? "họ ngành học họ" : "toàn bộ bộ sưu tậphọ") + "</i></span>" +
              "</label>";
            }).join("") +
          "</div>" +
          '<div class="minis" style="margin-top:.8rem">' +
            '<label class="f"><span>Bắt đầu(tiền tố có thể trống không = ngay lập tức)</span><input type="datetime-local" id="g-start" value="' + esc(gwStart) + '"></label>' +
            '<label class="f"><span>đến hạn khoản vay(tiền tố có thể trống không = chỉbiến thể của)</span><input type="datetime-local" id="g-exp" value="' + esc(gwExp) + '"></label>' +
          "</div>" +
          '<div class="actions" style="margin-top:.6rem">' +
            '<button type="button" class="btn primary" id="g-on">mở đường mới hoặc tuyến đường sắt / thay cũ đổi mớilựa chọn</button>' +
            '<button type="button" class="btn danger" id="g-off">ngừng sử dụnglựa chọn</button>' +
          "</div>" +
          '<p class="hint">loạtquy tắc:mỗi vị tríchọn một hoặc nhiều lựa chọn từ danh sáchHọc viên × mỗi dùng trongchọn một hoặc nhiều lựa chọn từ danh sáchmục tiêu,đầu tiênTất cảcó hiệu lực(dùng chungbên trênBắt đầu/đến hạn khoản vayThời gian).Thi thửcủa nhà máy điệncó thểđến hạn khoản vaybiến thể cũ của,đã mở ngoại động từ hoặc nội động từ đánhHọc viên 24 giờbên trong tiền tố có thểlàm xong bài thihình thức kết hợp gốc sân phơi;Khu vực Luyện tậpngừng sử dụnghọngay lập tứcđánh chặn.</p>' +
          '<div class="ledger">' +
            '<div class="picked-head"><span>ủy quyềnĐài Loan viết tắt tài khoản(chọnmục tiêu)</span><span>' + ledger.length + " dải</span></div>" +
            (Object.keys(byUser).length
              ? Object.keys(byUser).map(function (uid) {
                var u = byUser[uid];
                return '<div class="row2"><span class="who2">' + esc(u.name || u.phone || ("#" + uid)) +
                  (u.name && u.phone ? ' <span class="muted">' + esc(u.phone) + "</span>" : "") + "</span>" +
                  '<span class="lg-chips">' + u.items.map(function (it) {
                    var on = it.state && it.state.on;
                    return '<span class="lg-item"><span class="pill ' + (on ? "live" : "unpublished") + '">' +
                      esc(scopeTitle(it.scope)) + " · " + esc(grantStateText(it.state)) + "</span>" +
                      (on ? '<button type="button" class="sm danger" data-grev="' + esc(it.userId) + "|" + esc(it.scope) + '">lấy lại</button>' : "") +
                      "</span>";
                  }).join("") + "</span></div>";
              }).join("")
              : '<p class="muted" style="margin:.4rem 0 0">chọnmục tiêuhọ tiền tố phủ định cho động từ chưa cung cấpbất kỳngười mở ngoại động từ hoặc nội động từ.</p>') +
          "</div>" +
        "</section></div>";
  }

  function refreshLedger() {
    var scopes = checkedScopes();
    if (!scopes.length) { ledger = []; paint(); return Promise.resolve(); }
    return api("/api/admin/grants?scopes=" + encodeURIComponent(scopes.join(",")))
      .then(function (d) { ledger = d.grants || []; paint(); })
      .catch(function (e) { msg(e.message); ledger = []; paint(); });
  }
  function ensureGrant() {
    // mỗi lầntiến lênmở đường mới hoặc tuyến đường sắthọ lặp lại kéo họdanh sách,cứngđưa hàng lên kệhoàn chỉnh/mục đơn lẻThi thửkhả năng có thểxuất hiện
    var jobs = [api("/api/toefl/packages").then(function (d) { pkgs = d.packages || []; })];
    if (!stuList) jobs.push(api("/api/admin/students").then(function (d) { stuList = d.students || []; }));
    return Promise.all(jobs).then(function () {
      return refreshLedger();
    }).catch(function (e) { msg(e.message); });
  }
  function submitGrants(action, ids, onlyScope) {
    var scopes = onlyScope ? [onlyScope] : checkedScopes();
    if (!scopes.length) { msg("trướcchọn một hoặc nhiều lựa chọn từ danh sáchbên phảimở đường mới hoặc tuyến đường sắtmục tiêu"); return; }
    var body = { scopes: scopes, studentIds: ids, action: action };
    if (action !== "off") {
      body.startAt = gwStart ? new Date(gwStart).toISOString() : "";
      body.expireAt = gwExp ? new Date(gwExp).toISOString() : "";
    }
    api("/api/admin/grants", { method: "POST", body: body }).then(function (d) {
      msg((action === "on" ? "đãmở đường mới hoặc tuyến đường sắt " : "đãngừng sử dụng ") + (d.count || ids.length * scopes.length) + " dùng tronglắp ráp", true);
      return refreshLedger();
    }).catch(function (e) { msg(e.message); });
  }

  /* đã cóbài thixem trướclên xuốngchống đỡgiữ. */
  function previewHref(paper) {
    var id = paper && paper.id;
    if (!id) return "";
    var host = (w.location.hostname === "localhost" || w.location.hostname === "127.0.0.1")
      ? "/app/bank.html"
      : "https://app.youyisida.com/bank.html";
    return host + "?id=" + encodeURIComponent(id) + "&preview=1";
  }
  function openPreview(url) {
    if (!url) return;
    var prev = w.open(url, "yysd-preview");
    if (prev) try { prev.focus(); } catch (e) {}
  }

  function paintTabs() {
    var tabs = [["pool", "Đề bàixem xét hoặc đọc kỹ"], ["mine", "đã cóbài thi"]];
    if (me && me.canGrant) tabs.push(["grant", "mở đường mới hoặc tuyến đường sắt"]);
    if (me && me.isAdmin) tabs.push(["review", "kiểm toán"]);
    document.getElementById("tabs").innerHTML = tabs.map(function (t) {
      return '<button type="button" class="' + (tab === t[0] ? "is-on" : "") + '" data-tab="' + t[0] + '">' + t[1] + "</button>";
    }).join("") + '<button type="button" class="tab-refresh" data-refresh="1">Làm mới</button>';
  }
  function paint() {
    clearReview();
    paintTabs();
    var who = document.getElementById("who");
    if (who) who.textContent = (me.name || me.phone || "") + (me.isAdmin ? " · trụ sở chính" : me.canGrant ? " · người quản lý" : "");
    if (tab === "pool") paintPool();
    else if (tab === "grant") paintGrant();
    else if (tab === "review") paintList(papers, true);
    else paintList(papers, false);
  }
  function reload() {
    return Promise.all([api("/api/tiku/pool"), api("/api/tiku/papers")]).then(function (xs) {
      pool = xs[0].blocks || [];
      predictionSummary = xs[0].prediction;
      papers = xs[1].papers || [];
      if (tab === "grant") return ensureGrant();
      paint();
    });
  }
  function refreshNow() {
    clearReview();
    var btns = document.querySelectorAll("#refresh,[data-refresh]");
    btns.forEach(function (b) { b.disabled = true; });
    return reload().then(function () {
      msg("đãLàm mới · " + pool.length + " dùng trong họ cục", true);
    }).catch(function (e) {
      msg(e.message || "Làm mớiThất bại");
    }).then(function () {
      btns.forEach(function (b) { b.disabled = false; });
    });
  }
  function bootApp() {
    show("app");
    api("/api/tiku/me").then(function (d) {
      me = d.teacher;
      if ((tab === "grant" && !me.canGrant) || (tab === "review" && !me.isAdmin)) tab = "pool";
      return reload();
    }).catch(function (e) {
      show("login");
      document.getElementById("login-msg").textContent = e.message || "mờilạiĐăng nhập";
    });
  }

  // biến thể củanhỏthiên thểkiểm tra:node tiku/tiku.js;khôngthăm API,khôngcủa máy tínhĐăng nhậpbằng chứng.
  if (typeof window === "undefined") {
    var assert = require("assert");
    var privatePath = "/api/tiku/prediction/media/0123456789abcdef01234567.mp3";
    assert.strictEqual(mediaPath(privatePath), privatePath);
    assert.ok(mediaPath("library/toefl/audio/Question 1.mp3").indexOf("/app/library/toefl/") >= 0);
    ["javascript:alert(1)", "data:audio/mp3;base64,AA", "https://evil.example/a.mp3", "//evil.example/a.mp3", "library/toefl/../../secret", "library/toefl/%2e%2e/secret", "library/toefl/%252e%252e/secret", "library/toefl/a.mp3?token=secret", privatePath + "?token=secret"].forEach(function (path) {
      assert.strictEqual(mediaPath(path), "");
    });
    assert.strictEqual(setLabel("prediction-2026-10-17"), "2026-10-17 dự báohọ");
    assert.strictEqual(setLabel("R-CW12"), "R-CW12");
    assert.strictEqual(setLabel("W-BS1-Q1"), "W-BS1-Q1");
    F.src = "prediction";
    assert.strictEqual(blockMatches({ source: "set", sources: ["set", "prediction"] }), true);
    assert.strictEqual(blockMatches({ source: "bank" }), false);
    F.src = "";
    assert.strictEqual(blockPreviewHref({ sources: ["prediction"] }), "");
    var T = require("../app/assets/js/reading.js"), host = { innerHTML: "" };
    T.renderBlanksReview({ passage: [{ t: "<script>" }, { id: 1, prefix: "test", answer: "ing" }] }, host, { 1: "ing" });
    assert.ok(host.innerHTML.indexOf("&lt;script&gt;") >= 0 && host.innerHTML.indexOf("is-ok") >= 0);
    T.renderOptions({ id: 1, options: { A: "<img onerror=alert(1)>" } }, host, "A");
    assert.ok(host.innerHTML.indexOf("&lt;img") >= 0);
    var paused = 0, revoked = 0, aborted = 0, currentBody = {};
    var revoke = URL.revokeObjectURL;
    global.document = {
      getElementById: function () { return currentBody; },
      querySelectorAll: function () { return [{ pause: function () { paused += 1; }, removeAttribute: function () {}, load: function () {} }]; }
    };
    URL.revokeObjectURL = function () { revoked += 1; };
    reviewBlobs = ["blob:check"];
    reviewRequests = [{ abort: function () { aborted += 1; } }];
    var oldSeq = reviewSeq;
    assert.strictEqual(reviewCurrent(oldSeq, currentBody), true);
    clearReview();
    assert.strictEqual(reviewCurrent(oldSeq, currentBody), false);
    assert.strictEqual(paused + revoked + aborted, 3);
    URL.revokeObjectURL = revoke;
    delete global.document;
    console.log("ok prediction-ui-review-check");
    return;
  }

  /* ——— sự kiện ——— */
  document.addEventListener("click", function (ev) {
    var t = ev.target.closest("[data-tab],[data-bpv],[data-inspect],[data-sub],[data-off],[data-ok],[data-no],[data-pv],[data-grev],[data-refresh],#review-retry,#review-export,#g-on,#g-off,#g-all,#g-none,#refresh,#out");
    if (!t) return;
    if (t.id === "refresh" || t.getAttribute("data-refresh")) { refreshNow(); return; }
    if (t.id === "out") {
      clearReview();
      reviewId = "";
      localStorage.removeItem(TK);
      show("login");
      return;
    }
    var tabBtn = t.getAttribute("data-tab");
    if (tabBtn) {
      if (tabBtn === "grant" && !(me && me.canGrant)) { msg("mở đường mới hoặc tuyến đường sắtphục vụcầnngười quản lýTài khoản"); return; }
      clearReview();
      tab = tabBtn;
      paint();
      if (tab === "grant") ensureGrant();
      return;
    }
    if (t.getAttribute("data-bpv")) {
      ev.preventDefault();
      var previewBlock = blockOf(t.getAttribute("data-bpv"));
      if (previewBlock && !isPrediction(previewBlock)) openPreview(blockPreviewHref(previewBlock));
      return;
    }
    var inspect = t.getAttribute("data-inspect");
    if (inspect) { loadReview(inspect, true); return; }
    if (t.id === "review-retry") { loadReview(reviewId, true); return; }
    if (t.id === "review-export") { exportReview(); return; }
    var sub = t.getAttribute("data-sub");
    if (sub) {
      api("/api/tiku/papers/" + sub + "/submit", { method: "POST", body: {} })
        .then(function () { msg("đãđưa hàng lên kệ", true); return reload(); })
        .catch(function (e) { msg(e.message); });
      return;
    }
    if (t.id === "g-all") { stuFiltered().forEach(function (s) { stuSel[s.id] = 1; }); paintGrant(); return; }
    if (t.id === "g-none") { stuSel = {}; paintGrant(); return; }
    var grev = t.getAttribute("data-grev");
    if (grev) {
      var gp = String(grev).split("|");
      if (confirm("lấy lại«" + scopeTitle(gp[1]) + "»mở đường mới hoặc tuyến đường sắt?đang ở thời điểm đóđánh tiền tố có thểlàm xong bài thihình thức kết hợp gốc sân phơi.")) submitGrants("off", [Number(gp[0])], gp[1]);
      return;
    }
    if (t.id === "g-on" || t.id === "g-off") {
      var gids = Object.keys(stuSel).map(Number).filter(Boolean);
      if (!gids.length) { msg("trước tồn tạibên tráichọn một hoặc nhiều lựa chọn từ danh sáchHọc viên"); return; }
      var gsc = checkedScopes();
      if (!gsc.length) { msg("trướcchọn một hoặc nhiều lựa chọn từ danh sáchbên phảimở đường mới hoặc tuyến đường sắtmục tiêu"); return; }
      if (t.id === "g-off") {
        if (!confirm("ngừng sử dụngđại từ này " + gids.length + " thuật ngữ cổ logicđược sinh × " + gsc.length + " dùng trongmục tiêumở đường mới hoặc tuyến đường sắt?Đang thực hiệnThi thử 24 giờbên trong tiền tố có thểlàm xong bài thihình thức kết hợp gốc sân phơi,Khu vực Luyện tậpngay lập tứcđánh chặn.")) return;
        submitGrants("off", gids);
      } else {
        submitGrants("on", gids);
      }
      return;
    }
    var off = t.getAttribute("data-off");
    if (off && confirm("gỡ xuống khỏi kệ ví dụ: sản phẩm bị nhiễm bẩnhọkhông thểlạitrở về,rõ ràng?")) {
      api("/api/tiku/papers/" + off + "/unpublish", { method: "POST", body: {} })
        .then(function () { msg("đãgỡ xuống khỏi kệ ví dụ: sản phẩm bị nhiễm bẩn", true); return reload(); })
        .catch(function (e) { msg(e.message); });
      return;
    }
    var okid = t.getAttribute("data-ok");
    if (okid) {
      api("/api/tiku/papers/" + okid + "/approve", { method: "POST", body: {} })
        .then(function () { msg("đãđi qua", true); return reload(); })
        .catch(function (e) { msg(e.message); });
      return;
    }
    var noid = t.getAttribute("data-no");
    if (noid) {
      var note = prompt("trả lại một món đồLí do(tiền tố có thể trống không)") || "";
      api("/api/tiku/papers/" + noid + "/reject", { method: "POST", body: { note: note } })
        .then(function () { msg("đãtrả lại một món đồ", true); return reload(); })
        .catch(function (e) { msg(e.message); });
      return;
    }
    var pv = t.getAttribute("data-pv");
    if (pv) {
      var paper = papers.filter(function (x) { return x.id === pv; })[0];
      if (paper) openPreview(previewHref(paper));
    }
  });

  document.addEventListener("change", function (ev) {
    var id = ev.target.id;
    if (id === "f-skill") { F.skill = ev.target.value; F.typ = ""; syncFilterDom(); updatePoolList(); }
    else if (id === "f-type") { F.typ = ev.target.value; syncFilterDom(); updatePoolList(); }
    else if (id === "f-set") { F.set = ev.target.value; updatePoolList(); }
    else if (id === "f-src") { F.src = ev.target.value; syncFilterDom(); updatePoolList(); }
    else if (ev.target.getAttribute && ev.target.getAttribute("data-gscope") != null) {
      var gsc2 = ev.target.getAttribute("data-gscope");
      if (ev.target.checked) grantSel[gsc2] = 1; else delete grantSel[gsc2];
      refreshLedger(); return;
    }
    else if (id === "g-start") { gwStart = ev.target.value; return; }
    else if (id === "g-exp") { gwExp = ev.target.value; return; }
    else {
      var gsel = ev.target.getAttribute && ev.target.getAttribute("data-gsel");
      if (gsel) {
        var gid = Number(gsel);
        if (ev.target.checked) stuSel[gid] = 1; else delete stuSel[gid];
      }
    }
  });
  function syncFilterDom() {
    var typ = document.getElementById("f-type");
    if (typ) typ.outerHTML = '<select id="f-type" aria-label="họ khuôn">' + typeOptions() + "</select>";
    var set = document.getElementById("f-set");
    if (set) set.outerHTML = '<select id="f-set" aria-label="che đậy gầm có thểngày tháng">' + setOptions() + "</select>";
  }
  document.addEventListener("input", function (ev) {
    if (ev.target.id === "f-q") { F.q = ev.target.value.toLowerCase(); updatePoolList(); }
    else if (ev.target.id === "g-q") { stuQ = ev.target.value; filterStuRows(); }
  });

  w.addEventListener("pagehide", clearReview);

  function filterStuRows() {
    var q = stuQ.toLowerCase();
    document.querySelectorAll(".g-row").forEach(function (row) {
      var who = row.querySelector(".g-who");
      var hit = !q || (who ? who.textContent : "").toLowerCase().indexOf(q) >= 0;
      row.classList.toggle("hidden", !hit);
    });
  }

  document.getElementById("login-form").onsubmit = function (ev) {
    ev.preventDefault();
    document.getElementById("login-msg").textContent = "";
    api("/api/teacher/login", {
      method: "POST",
      body: {
        phone: document.getElementById("phone").value.trim(),
        password: document.getElementById("password").value,
        activationCode: (document.getElementById("activationCode") || {}).value || ""
      }
    }).then(function (d) {
      localStorage.setItem(TK, d.token);
      bootApp();
    }).catch(function (e) {
      document.getElementById("login-msg").textContent = e.message || "Đăng nhậpThất bại";
    });
  };

  if (!w.YYSD_TIKU_GATE || !w.YYSD_TIKU_GATE.ok) {
    show("gate");
    return;
  }
  // ponytail: localhost ?demo=1 không có API xem trướcbề mặt tiếp xúc
  if (w.YYSD_TIKU_GATE.local && /(?:\?|&)demo=1(?:&|$)/.test(w.location.search || "")) {
    me = { name: "trình diễnGiáo viên", phone: "13800000000", isAdmin: true, canGrant: true };
    pool = [
      { id: "d1", skill: "reading", type: "complete_words", title: "Archaeopteryx", titleZh: "thuỷ tổbiến thể củaĐiền khuyết", set: 2, n: 10, source: "set" },
      { id: "d2", skill: "reading", type: "daily_life", title: "Campus Notice", titleZh: "Khuôn viên trườngthông báo", set: 1, n: 5, source: "set" },
      { id: "d3", skill: "reading", type: "academic", title: "Hollywood", titleZh: "tốt tên một loại cỏ dại như cỏ chenopodium dạng kết hợp khu vực thấp trong một rào chắn bao quanhthời đại hoàng kim", set: 1, n: 10, source: "set" },
      { id: "d4", skill: "reading", type: "academic", title: "Coral Reefs", titleZh: "rạn san hôsinh thái", set: 3, n: 10, source: "set" },
      { id: "d5", skill: "listening", type: "lecture", title: "Art History", titleZh: "lịch sử nghệ thuậtmột khóa bài giảng", set: 3, n: 6, source: "set" },
      { id: "d6", skill: "listening", type: "conversation", title: "Library", titleZh: "thư việnmượn viết tắt của", set: 2, n: 5, source: "set" },
      { id: "d7", skill: "listening", type: "choose_response", title: "Quick Response", titleZh: "Nghe câu, chọn đáp án", set: 1, n: 8, source: "set" },
      { id: "d8", skill: "writing", type: "email", title: "Email to Prof", titleZh: "cung cấpgiáo sưviếtthư từ", paperId: "2025-09-02", n: 1, source: "date" },
      { id: "d9", skill: "writing", type: "discussion", title: "Urban Planning", titleZh: "Thảo luận học thuật", set: 4, n: 1, source: "set" },
      { id: "d10", skill: "writing", type: "sentence", title: "Build a Sentence", titleZh: "Xây dựng câu", set: 2, n: 5, source: "set" },
      { id: "d11", skill: "speaking", type: "repeat", title: "Listen & Repeat", titleZh: "Nghelặp lại lời của chính mình hoặc của người khác", set: 1, n: 8, source: "set" },
      { id: "d12", skill: "speaking", type: "interview", title: "Interview", titleZh: "Mô phỏngđược phỏng vấn với tư cách ứng viên", set: 2, n: 5, source: "set" }
    ];
    papers = [
      { id: "tp_demo1", title: "tháng Mườithể thao chạy nước rútThi thử A cuộn lại", kind: "full", status: "live", owner: "teacher", skillMinutes: { reading: 35, listening: 36, writing: 29, speaking: 16 }, blocks: [pool[0], pool[4], pool[7], pool[10]], updatedAt: "2026-10-13T10:24:00" },
      { id: "tp_demo2", title: "Đọcchuyên biệt · Học thuậtbài viết", kind: "single", status: "draft", owner: "teacher", skillMinutes: {}, blocks: [pool[2], pool[3]], updatedAt: "2026-10-12T18:02:00" }
    ];
    var dt = (w.location.search.match(/(?:\?|&)tab=(pool|mine|grant)(?:&|$)/) || [])[1];
    if (dt) tab = dt;
    show("app");
    paint();
    return;
  }
  if (token()) bootApp();
  else show("login");
})(typeof window !== "undefined" ? window : { location: { hostname: "localhost", protocol: "http:", href: "http://localhost:8000/tiku/" } });
