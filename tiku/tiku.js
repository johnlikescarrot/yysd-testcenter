/* Ngân hàng đề trung tâm Giáo viên đứng - đề mục thẩm duyệt / đã có bài thi / kích hoạt (Quản trị viên) */
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
    complete_words: " Từ vựng lấp chỗ trống ", daily_life: " sinh hoạt Đọc ", academic: " Học thuật văn chương ",
    choose_response: " nghe câu chọn đáp lại ", conversation: " đối thoại ", announcement: " thông tri ", lecture: " Học thuật toạ đàm ",
    sentence: " câu xây dựng ", email: " Email Viết ", discussion: " Thảo luận học thuật ",
    repeat: " Nghe thuật lại ", interview: " mô phỏng phỏng vấn "
  };
  var TYPES = {
    reading: ["complete_words", "daily_life", "academic"],
    listening: ["choose_response", "conversation", "announcement", "lecture"],
    writing: ["sentence", "email", "discussion"],
    speaking: ["repeat", "interview"]
  };
  var KIND_ZH = { practice: "Luyện tập", full: " Thi thử toàn phần ", single: " Thi thử từng kỹ năng " };
  var ST_ZH = { draft: " bản nháp ", pending: " đợi tra xét ", live: " đã lên khung(vào VIP) ", unpublished: " đã loại bỏ " };

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
        Authorization: token()? "Bearer " + token(): ""
      },
      body: opts.body? JSON.stringify(opts.body): undefined,
      cache: "no-store",
      signal: opts.signal
    }).then(function (r) {
      return r.text().then(function (text) {
        var d = {};
        if (text) { try { d = JSON.parse(text); } catch (e) { throw new Error(" Server dị thường "); } }
        if (!r.ok) throw new Error((d && d.error) || "Yêu cầu thất bại");
        return d;
      });
    });
  }
  function esc(s) {
    return String(s == null? "": s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function msg(t, ok) {
    var el = document.getElementById("msg");
    if (!el) return;
    el.textContent = t || "";
    el.className = "msg show" + (ok? " ok": "");
    clearTimeout(toastTimer);
    if (t) toastTimer = setTimeout(function () { el.classList.remove("show"); }, 3200);
  }
  function show(id) {
    if (id!== "app") clearReview();
    ["gate", "login", "app"].forEach(function (k) {
      document.getElementById(k).classList.toggle("hidden", k!== id);
    });
  }
  function blockOf(id) {
    for (var i = 0; i < pool.length; i++) if (pool[i].id === id) return pool[i];
    return null;
  }
  function bankSetParts(s) {
    var m = /^(R-CW|R-RDL|R-RAP|L-CR|L-LCN|L-ANO|L-AT|W-BS|W-WE|W-AD|S-LRP|S-INT)(\d+)(?:-Q(\d+))?$/i.exec(String(s || ""));

    return m? [m[1].toUpperCase(), Number(m[2]), m[3]? Number(m[3]): 0]: null;
  }
  function isBankSet(s) {
    return!!bankSetParts(s);
  }
  function setLabel(s) {
    var m = /^prediction-(\d{4}-\d{2}-\d{2})$/.exec(String(s || ""));
    return m? m[1] + " dự đoán bao ": isBankSet(s)? String(s): "Set " + s;
  }
  function isPrediction(b) {
    return (b.sources || [b.source]).indexOf("prediction") >= 0 || /^prediction-/.test(String(b.set || ""));
  }
  function blockLine(b) {
    var set = b.set? setLabel(b.set): "";
    return (TYPE_ZH[b.type] || SKILL_ZH[b.skill] || "") +
      (set? " · " + set: "") +
      (b.paperId &&!isBankSet(b.set) &&!isPrediction(b)? " · " + b.paperId: "") +
      (b.n > 1? " · " + b.n + " câu ": "");
  }
  function dotStyle(b) {
    return " style=\"--sk:" + (SKILL_DOT[b.skill] || "var(--faint)") + "\"";
  }
  function ts(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso).slice(0, 16).replace("T", " ");
    function p(n) { return n < 10? "0" + n: String(n); }
    return p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes());
  }

  /* ——— bộ lọc và câu trì ——— */
  function typeOptions() {
    var keys = F.skill && TYPES[F.skill]
      ? TYPES[F.skill]
      : ["complete_words", "daily_life", "academic", "choose_response", "conversation", "announcement", "lecture", "sentence", "email", "discussion", "repeat", "interview"];
    return '<option value=""> Tất cả dạng bài </option>' + keys.map(function (k) {
      return '<option value="' + k + '"' + (F.typ === k? " selected": "") + ">" + TYPE_ZH[k] + "</option>";
    }).join("");
  }
  function blockMatches(b, skip) {
    skip = skip || {};
    if (!skip.skill && F.skill && b.skill!== F.skill) return false;
    if (!skip.typ && F.typ &&!F.q && b.type!== F.typ) return false;
    if (!skip.set && F.set && String(b.set)!== String(F.set)) return false;
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
      return fa!== fb? fa - fb: (ra[1]!== rb[1]? ra[1] - rb[1]: (ra[2] || 0) - (rb[2] || 0));
    }
    if (ra) return 1;
    if (rb) return -1;
    var na = Number(a), nb = Number(b);
    if (!isNaN(na) &&!isNaN(nb)) return na - nb;
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
      if (b.set!= null && b.set!== "") seen[String(b.set)] = 1;
    });
    return Object.keys(seen).sort(cmpSet);
  }
  function dropGoneSet() {
    if (F.set && setKeys().indexOf(String(F.set)) < 0) F.set = "";
  }
  function setOptions() {
    dropGoneSet();
    var keys = setKeys();
    return '<option value=""> Tất cả bộ số / ngày </option>' + keys.map(function (k) {
      return '<option value="' + esc(k) + '"' + (String(F.set) === String(k)? " selected": "") + ">" + esc(setLabel(k)) + "</option>";
    }).join("");
  }
  function paintFilters() {
    var setOpts = setOptions();
    return '<input id="f-q" class="q" aria-label=" tìm kiếm văn chương, Câu hỏi, Phương án hoặc Giải thích đáp án " value="' + esc(F.q) + '" placeholder=" lục soát văn chương / Câu hỏi / Phương án / Giải thích đáp án ">' +
      '<select id="f-skill" aria-label=" kỹ năng "><option value=""> Tất cả kỹ năng </option>' +
      SKILL_ORDER.map(function (s) {
        return '<option value="' + s + '"' + (F.skill === s? " selected": "") + ">" + SKILL_ZH[s] + "</option>";
      }).join("") + "</select>" +
      '<select id="f-type" aria-label=" dạng bài ">' + typeOptions() + "</select>" +
      '<select id="f-set" aria-label=" bộ số hoặc ngày ">' + setOpts + "</select>" +
      '<select id="f-src" aria-label=" nơi phát ra "><option value=""> Tất cả nơi phát ra </option>' +
      '<option value="set"' + (F.src === "set"? " selected": "") + "> chính thức bộ câu </option>" +
      '<option value="date"' + (F.src === "date"? " selected": "") + "> Thi thử cuốn </option>" +
      '<option value="bank"' + (F.src === "bank"? " selected": "") + "> Ngân hàng đề </option>" +
      '<option value="prediction"' + (F.src === "prediction"? " selected": "") + "> dự đoán bao </option></select>";
  }
  function blockPreviewHref(b) {
    if (isPrediction(b)) return "";
    var local = w.location.hostname === "localhost" || w.location.hostname === "127.0.0.1";
    var app = local? "/app/": "https://app.youyisida.com/";
    var skill = b.skill || "reading";
    var q = "mode=practice&preview=1&from=app&task=" + encodeURIComponent(b.task) +
      "&end=" + encodeURIComponent(b.end == null? b.task: b.end);
    if ((b.source === "bank" || b.source === "date") && b.paperId) {
      return app + "toefl-" + skill + ".html?id=" + encodeURIComponent(b.paperId) + "&" + q;
    }
    return app + "toefl-" + skill + ".html?set=" + encodeURIComponent(b.set || 1) + "&" + q;
  }
  function updatePoolList() {
    var el = document.getElementById("pool-list");
    if (!el) return;
    var list = filtered();
    document.getElementById("pool-count").textContent = " si đến " + list.length + " câu khối ";
    el.innerHTML = list.length
      ? list.map(function (b) {
        var href = blockPreviewHref(b);
        return '<article class="block' + (reviewId === b.id? " is-on": "") + '"' + dotStyle(b) + '>' +
          '<button type="button" class="block-review" data-inspect="' + esc(b.id) + '" aria-pressed="' + (reviewId === b.id) + '" aria-controls="review-body">' +
          '<b>' + esc(b.title || b.titleZh) + "</b>" +
          (b.titleZh && b.title && b.titleZh!== b.title? '<span class="sub">' + esc(b.titleZh) + "</span>": "") +
          '<span class="meta">' + esc(blockLine(b)) + '</span><span class="review-label"> thẩm duyệt </span></button>' +
          (href? '<a class="block-pv" data-bpv="' + esc(b.id) + '" href="' + esc(href) + '" target="yysd-preview"> ngoại bộ Xem trước </a>': "") + '</article>';
      }).join("")
      : '<div class="empty"><b> không có điều kiện phù hợp câu khối </b><p> đổi lại bộ lọc điều kiện thử xem </p></div>';
  }

  /* Giáo viên chỉ đọc thẩm duyệt: phục dùng Đọc biểu hiện, không tiếp Nhập học sinh kế lúc, cho điểm hoặc ghi âm. */
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
    if (typeof path!== "string") return "";
    if (/^\/api\/tiku\/prediction\/media\/[a-f0-9]{24}\.[a-z0-9]{1,8}$/.test(path)) return path;
    var decoded;
    try { decoded = decodeURIComponent(path); } catch (e) { return ""; }
    if (/[\\:%?#\x00-\x1f\x7f]/.test(decoded) || /\/\//.test(decoded) || /(^|\/)\.{1,2}(\/|$)/.test(decoded.replace(/^\.\//, ""))) return "";
    decoded = decoded.replace(/^\.\//, "").replace(/^\//, "");
    if (!/^library\/toefl\/.+/.test(decoded)) return "";
    var local = w.location.hostname === "localhost" || w.location.hostname === "127.0.0.1";
    return new URL(decoded, local? new URL("/app/", w.location.href): "https://app.youyisida.com/").href;
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
    if (/\.(mp4|webm|mov|m4v)$/i.test(path)) return kind === "audio"? "audio": "video";
    if (/\.(png|jpe?g|gif|webp|svg|avif)$/i.test(path)) return "image";
    return /^(audio|video|image)$/.test(kind)? kind: "attachment";
  }
  function reviewMedia(host, item, seq, body) {
    if (!item ||!item.path) return;
    var box = document.createElement("figure");
    box.className = "review-media";
    var caption = document.createElement("figcaption");
    caption.textContent = item.label || " truyền thông phụ kiện ";
    var slot = document.createElement("div");
    box.appendChild(caption);
    box.appendChild(slot);
    host.appendChild(box);
    var metadata = reviewData && (reviewData.media || []).filter(function (m) { return m.path === item.path; })[0];
    if (item.available === false || (metadata && metadata.available === false)) {
      slot.textContent = " nguyên đứng cự tuyệt phỏng vấn, không lấy được này tài nguyên; đề mục và văn tự tư liệu nhưng có thể thẩm duyệt. ";
      slot.className = "review-error";
      return;
    }
    var path = mediaPath(item.path);
    if (!path) { slot.textContent = " không hỗ trợ truyền thông đường nhỏ "; return; }
    var kind = mediaKind(item.path, item.kind);
    function mount(url) {
      if (!reviewCurrent(seq, body)) return;
      slot.innerHTML = "";
      var el = document.createElement(kind === "image"? "img": kind === "attachment"? "a": kind);
      if (kind === "attachment") {
        el.href = url;
        el.download = String(item.path).split("/").pop();
        el.className = "link-btn";
        el.textContent = " download phụ kiện ";
      } else {
        if (kind === "image") el.alt = caption.textContent;
        else { el.controls = true; el.preload = "none"; el.setAttribute("aria-label", caption.textContent); }
        el.src = url;
        el.addEventListener("error", function () { if (reviewCurrent(seq, body)) fail(" truyền thông không cách nào phát ra hoặc biểu hiện, mời Thử lại "); });
      }
      slot.appendChild(el);
    }
    function fail(text) {
      slot.innerHTML = '<p class="review-error" role="status"></p><button type="button" class="sm"> Thử lại truyền thông </button>';
      slot.querySelector("p").textContent = text;
      slot.querySelector("button").onclick = load;
    }
    function load() {
      if (!reviewCurrent(seq, body)) return;
      slot.textContent = " thêm năm truyền thông …";
      if (path.indexOf("/api/")!== 0) { mount(path); return; }
      var controller = new AbortController();
      reviewRequests.push(controller);
      fetch(API + path, {
        headers: { "X-Tenant-Slug": "yysd", Authorization: token()? "Bearer " + token(): "" },
        cache: "no-store", signal: controller.signal, redirect: "error"
      }).then(function (r) {
        if (!r.ok) throw new Error(" truyền thông Tải dữ liệu thất bại (" + r.status + "), mời Thử lại ");
        return r.blob();
      }).then(function (blob) {
        if (!reviewCurrent(seq, body)) return;
        // phụ kiện chỉ download, không cho nguyên bao HTML {các loại:đợi} văn bản tài liệu theo đạo sư trang chấp hành.
        if (kind === "attachment") blob = new Blob([blob], { type: "application/octet-stream" });
        var url = URL.createObjectURL(blob);
        reviewBlobs.push(url);
        mount(url);
      }).catch(function (e) {
        if (reviewCurrent(seq, body) && e.name!== "AbortError") fail(e.message || " truyền thông Tải dữ liệu thất bại, mời Thử lại ");
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
      script.onload = function () { script.remove(); if (w.YYSD_TOEFL) resolve(w.YYSD_TOEFL); else reject(new Error(" Đọc biểu hiện lắp ráp(bộ phận) Tải dữ liệu thất bại ")); };
      script.onerror = function () { script.remove(); reject(new Error(" Đọc biểu hiện lắp ráp(bộ phận) Tải dữ liệu thất bại, mời Thử lại ")); };
      document.head.appendChild(script);
    }).catch(function (e) { readingLoad = null; throw e; });
    return readingLoad;
  }
  function renderReview(data, body, seq, T) {
    var b = data.block || blockOf(reviewId) || {};
    body.innerHTML = '<div class="pane-title"><h3></h3><button type="button" class="sm" id="review-export"> dẫn xuất nguyên bao số liệu </button></div><p class="muted review-meta"></p>';
    body.querySelector("h3").textContent = b.titleZh || b.title || " đề mục nội dung ";
    body.querySelector(".review-meta").textContent = blockLine(b) + " · Giáo viên chỉ đọc ";
    body.querySelector("#review-export").disabled =!(data.sourceItems || []).length;
    var no = 0;
    (data.tasks || []).forEach(function (task, ti) {
      var section = document.createElement("article");
      section.className = "review-task";
      body.appendChild(section);
      reviewNote(section, " câu khối " + (ti + 1), task.title || task.titleZh || TYPE_ZH[task.type]);
      reviewNote(section, " nói rõ ", task.instruction);
      var passage = document.createElement("div");
      passage.className = "review-passage";
      if (task.type === "complete_words") {
        var saved = {};
        (task.passage || []).forEach(function (p) { if (p.id) saved[p.id] = p.answer; });
        T.renderBlanksReview(task, passage, saved);
        section.appendChild(passage);
      } else if (task.paras || task.layout || task.image) {
        var insertion = (task.questions || []).filter(T.isInsertQ)[0];
        T.renderPassage(Object.assign({}, task, { image: "" }), passage,!!insertion);
        if (insertion) T.markInsertReview(passage, insertion, "", T.insertSentence(task, insertion));
        section.appendChild(passage);
      }
      reviewNote(section, " đợi cắm vào câu ", task.insertSentence);
      reviewMedia(section, { path: task.audio, label: " đề mục âm tần ", kind: "audio" }, seq, body);
      reviewMedia(section, { path: task.image, label: " đề mục phối đồ ", kind: "image" }, seq, body);
      reviewNote(section, " Nghe Bài gốc ", task.transcript);
      reviewNote(section, " tình cảnh ", task.context);
      reviewNote(section, " đề mục ", task.stem);
      reviewNote(section, " Viết nhiệm vụ ", task.prompt);
      reviewNote(section, " Viết yếu điểm ", task.bullets);
      reviewNote(section, " người thu hàng ", task.to);
      reviewNote(section, " chủ đề ", task.subject);
      reviewNote(section, " dạy dỗ vấn đề ", task.professor);
      reviewNote(section, " thảo luận thiếp ", task.posts);
      if (task.type === "sentence") {
        reviewNote(section, " câu kết cấu ", (task.parts || []).map(function (p) { return p.slot? "____": p.t || ""; }).join(" "));
        reviewNote(section, " từ khối ", (task.bank || []).join(" / "));
        reviewNote(section, " Đúng trình tự ", (task.answer || []).join(" "));
      }
      reviewNote(section, task.type === "repeat"? " ứng với thuật lại ": " Bài mẫu tham khảo / thí dụ mẫu ", task.sample);
      reviewNote(section, " Khác bài văn mẫu ", task.samples);
      reviewNote(section, " Giải thích đáp án ", task.analysis || task.explain);
      (task.questions || []).forEach(function (q, qi) {
        var question = document.createElement("section");
        question.className = "review-question";
        section.appendChild(question);
        reviewNote(question, " vấn đề " + (qi + 1), q.stem);
        var options = document.createElement("div");
        options.className = "review-options";
        // renderOptions đem id liều tiến thuộc tính; chỉ truyền bên trong trị số, tuyệt không truyền nguyên bao id.
        T.renderOptions(Object.assign({}, q, { id: ++no }), options, q.answer);
        options.querySelectorAll("input").forEach(function (input) {
          input.disabled = true;
          var correct = (Array.isArray(q.answer)? q.answer: [q.answer]).indexOf(input.value) >= 0;
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
        reviewNote(question, " Giải thích đáp án ", q.analysis || q.explain);
        reviewNote(question, " Nghe Bài gốc ", q.transcript);
        reviewMedia(question, { path: q.audio, label: " vấn đề âm tần ", kind: "audio" }, seq, body);
        reviewMedia(question, { path: q.image, label: " vấn đề phối đồ ", kind: "image" }, seq, body);
      });
    });
    if (!(data.tasks || []).length) reviewNote(body, " nội dung nhắc nhở ", " tạm thời chưa có sau khi chuyển đổi đề mục, mời Xem phía dưới nguyên bao bổ sung nội dung. ");
    (data.sourceItems || []).forEach(function (item, i) {
      var extra = reviewDetails(body, " nguyên bao bổ sung " + (i + 1) + (item.labelZh? " · " + item.labelZh: ""));
      [
        [" Bài gốc toàn văn ", "full"], [" bổ từ và Đáp án ", "slots"], [" Tiếng Việt văn dịch ", "stimulusTextZh"],
        [" đoạn văn dịch ", "paragraphsZh"], [" tiêu đề văn dịch ", "labelZh"], [" Câu hỏi văn dịch ", "stemZh"],
        [" Nghe văn dịch ", "transcriptZh"], [" Viết nhiệm vụ ", "prompt"], [" nguyên bao bài văn mẫu ", "essay"],
        [" bài văn mẫu văn dịch ", "translation"], [" Nói tình cảnh ", "scenario"]
      ].forEach(function (field) { reviewNote(extra, field[0], item[field[1]]); });
      if ((item.questions || []).length) {
        var analyses = reviewDetails(extra, " Tất cả vấn đề văn dịch và Phương án Giải thích đáp án ");
        item.questions.forEach(function (q, qi) {
          reviewNote(analyses, " vấn đề " + (qi + 1), q.stemZh || q.stem);
          reviewNote(analyses, " vấn đề nhãn hiệu ", q.labelZh);
          (q.choices || []).slice().sort(function (a, b) { return a.order - b.order; }).forEach(function (choice, ci) {
            reviewNote(analyses, String.fromCharCode(65 + ci) + " Phương án văn dịch ", choice.labelZh);
          });
          reviewNote(analyses, " Tất cả Phương án Giải thích đáp án ", q.explanations || q.analysis || q.explain);
          reviewNote(analyses, " nguyên bao đề mục đoạn / cắm vào vị trí ", q.questionParagraphs);
        });
      }
      if ((item.transcriptSentences || []).length) {
        var transcript = reviewDetails(extra, " trục câu Nghe Bài gốc và văn dịch ");
        item.transcriptSentences.forEach(function (sentence, si) {
          var timing = sentence.startTime!= null? " (" + sentence.startTime + " - " + (sentence.endTime == null? "": sentence.endTime) + ") ": "";
          reviewNote(transcript, " câu " + (si + 1) + timing, sentence.text);
          reviewNote(transcript, " văn dịch ", sentence.translationZh);
        });
      }
      (item.qs || []).forEach(function (q, qi) {
        reviewNote(extra, " Nói vấn đề / ứng với thuật lại " + (qi + 1), q.sentence);
        reviewNote(extra, " Nói làm mẫu Đáp án " + (qi + 1), q.modelAnswerText);
      });
    });
    var media = data.media || [];
    if (media.length) {
      var group = reviewDetails(body, " nguyên bao Tất cả truyền thông và phụ kiện (" + media.length + ") ");
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
    body.innerHTML = '<p role="status"> thêm năm đề mục nội dung …</p><div class="skel skel-row"></div><div class="skel skel-row"></div>';
    if (focus) body.focus();
    if (w.YYSD_TIKU_GATE && w.YYSD_TIKU_GATE.local && /(?:\?|&)demo=1(?:&|$)/.test(w.location.search || "")) {
      body.textContent = " tại đây chỉ biểu thị bố cục; chân thật đề mục và dự đoán bao cần thông qua Giáo viên chứng thực sau thẩm duyệt. ";
      return;
    }
    var controller = new AbortController();
    reviewRequests.push(controller);
    Promise.all([api("/api/tiku/blocks/" + encodeURIComponent(id), { signal: controller.signal }), ensureReading()]).then(function (xs) {
      if (!reviewCurrent(seq, body)) return;
      var data = xs[0];
      if (!data.ok) throw new Error(" đề mục Tải dữ liệu thất bại ");
      reviewData = data;
      renderReview(data, body, seq, xs[1]);
    }).catch(function (e) {
      if (!reviewCurrent(seq, body)) return;
      clearReview();
      body.innerHTML = '<p class="review-error" role="status"></p><button type="button" class="btn" id="review-retry"> Thử lại thẩm duyệt </button>';
      body.querySelector("p").textContent = e.message || " đề mục Tải dữ liệu thất bại, mời Thử lại ";
    });
  }
  function exportReview() {
    if (!reviewData ||!(reviewData.sourceItems || []).length) return;
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
    var summary = predictionSummary? " dự đoán bao: " + predictionSummary.groups + " tổ / " + predictionSummary.questions + " tử câu; " +
      (predictionSummary.media - predictionSummary.unavailableMedia) + "/" + predictionSummary.media + " truyền thông đã lấy được. " +
      (predictionSummary.unavailableMedia? predictionSummary.unavailableMedia + " tài nguyên nguyên đứng cự tuyệt phỏng vấn, đã đánh dấu thiếu thốn. ": ""): "";
    document.getElementById("main").innerHTML =
      '<div class="bench review-bench"><section class="card pool-pane">' +
        '<div class="pane-title"><h2> đề mục thẩm duyệt </h2><span class="n" id="pool-count" role="status"></span></div>' +
        '<div class="filters">' + paintFilters() + '</div><p class="pool-meta"> nhấn vào « thẩm duyệt » Xem chính văn, Đáp án và Giải thích đáp án; dự đoán bao chỉ Giáo viên có thể thấy được. ' + esc(summary) + '</p>' +
        '<div class="pool" id="pool-list"></div></section>' +
        '<section class="card review-pane" aria-labelledby="review-heading"><div class="pane-title"><h2 id="review-heading"> chỉ đọc nội dung </h2></div>' +
        '<div id="review-body" tabindex="-1"><div class="empty"><b> lựa chọn một cái câu khối thẩm duyệt </b><p> sẽ không đáp lại, tính theo thời gian, cho điểm hoặc ghi âm. </p></div></div></section></div>';
    updatePoolList();
    if (reviewId && blockOf(reviewId)) loadReview(reviewId, false);
  }

  /* ——— của tôi cuốn ——— */
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
        (review? " không có đợi tra xét cuốn ": " còn không có đã có bài thi ") + "</b><p>" +
        (review? " trước mắt không có cần khảo hạch bài thi. ": " đã có bài thi sẽ giữ lại ở chỗ này; bản luân phiên không mới tăng nhân công tổ cuốn. ") +
        '</p><button type="button" class="btn" data-tab="pool"> đi thẩm duyệt đề mục </button></div>';
      return;
    }
    main.innerHTML = '<div class="paper-list">' + list.map(function (p) {
      var acts = [];
      if (review) {
        acts.push('<button type="button" class="sm" data-ok="' + esc(p.id) + '"> thông qua </button>');
        acts.push('<button type="button" class="sm danger" data-no="' + esc(p.id) + '"> lui về </button>');
      } else {
        if (p.status === "draft" || p.status === "pending") acts.push('<button type="button" class="sm primary" data-sub="' + esc(p.id) + '"> lên khung(vào VIP) </button>');
        if (p.status === "live" || (p.status === "pending" && p.live)) acts.push('<button type="button" class="sm danger" data-off="' + esc(p.id) + '"> loại bỏ </button>');
      }
      acts.push('<button type="button" class="sm" data-pv="' + esc(p.id) + '"> Xem trước </button>');
      var blocks = p.blocks || [];
      return '<article class="card paper-row">' +
        '<div class="r1"><span class="pt">' + esc(p.title) + '</span>' +
          '<span class="pill kind">' + esc(KIND_ZH[p.kind] || p.kind) + '</span>' +
          '<span class="pill ' + esc(p.status) + '">' + esc(ST_ZH[p.status] || p.status) + "</span></div>" +
        '<div class="r2"><span>' + blocks.length + ' câu khối </span><span class="sep">·</span>' +
          '<span>' + (totalMins(p)? " lúc dài cộng lại " + totalMins(p) + " phút ": " không Thời gian ") + '</span><span class="sep">·</span>' +
          "<span> Update lúc " + esc(ts(p.updatedAt)) + "</span>" +
          (p.owner === "hq"? '<span class="sep">·</span><span> tổng bộ </span>': "") +
          (p.makerName && p.owner!== "hq" && me && me.isAdmin? '<span class="sep">·</span><span>' + esc(p.makerName) + " " + esc(p.makerPhone || "") + "</span>": "") +
          (p.rejectNote? '<span class="sep">·</span><span style="color:var(--accent)"> lui về: ' + esc(p.rejectNote) + "</span>": "") + "</div>" +
        (blocks.length? '<div class="r2">' + blocks.slice(0, 6).map(function (b) { return esc(b.titleZh || b.title); }).join(", ") + (blocks.length > 6? " …": "") + "</div>": "") +
        '<div class="acts">' + acts.join("") + "</div></article>";
    }).join("") + "</div>";
  }

  /* ——— kích hoạt (Quản trị viên): Học viên nhiều chọn × đối tượng nhiều chọn (Khu luyện tập + Gói tăng tốc trước kỳ thi) đại lượng ——— */
  function grantStateText(st) {
    if (!st) return "";
    if (st.on && st.grace) return " thư thả Vừa ";
    if (st.on) return st.expireAt? " Đã kích hoạt · đến " + ts(st.expireAt): " Đã kích hoạt ";
    if (st.reason === "scheduled") return " đúng giờ " + ts(st.startAt);
    if (st.reason === "expired") return " Đã hết hạn ";
    if (st.reason === "off") return " Đã tạm ngưng ";
    return "";
  }
  function checkedScopes() {
    return Object.keys(grantSel).filter(function (k) { return grantSel[k]; });
  }
  function scopeTitle(scope) {
    if (scope === "practice") return " đề thi thật Ngân hàng đề ";
    var id = scope.slice("package:".length);
    var p = (pkgs || []).filter(function (x) { return x.id === id; })[0];
    return p? p.title: id;
  }
  function stuFiltered() {
    var q = stuQ.toLowerCase();
    return (stuList || []).filter(function (s) {
      return!q || ((s.displayName || "") + " " + s.phone).toLowerCase().indexOf(q) >= 0;
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
          '<div class="pane-title"><h2> Học viên </h2><span class="n"> tổng ' + (stuList || []).length + " người · Đã chọn đối tượng " + m + ' </span></div>' +
          '<div class="filters">' +
            '<input id="g-q" class="q" value="' + esc(stuQ) + '" placeholder=" lục soát tính danh / Số điện thoại ">' +
            '<button type="button" class="sm" id="g-all"> Chọn tất cả trước mắt </button>' +
            '<button type="button" class="sm" id="g-none"> Xóa trống </button>' +
          "</div>" +
          (students.length
            ? '<div class="g-list">' + students.map(function (s) {
              var items = (byUser[s.id] || { items: [] }).items;
              var n = items.filter(function (it) { return it.state && it.state.on; }).length;
              return '<label class="g-row">' +
                '<input type="checkbox" data-gsel="' + esc(s.id) + '"' + (stuSel[s.id]? " checked": "") + ">" +
                '<span class="g-who">' + esc(s.displayName || " (không mệnh danh) ") + "<i>" + esc(s.phone) + "</i></span>" +
                (m? '<span class="pill ' + (n === m? "live": "unpublished") + '"> đã mở ' + n + "/" + m + "</span>": "") +
              "</label>";
            }).join("") + "</div>"
            : '<div class="empty"><b> không có phù hợp Học viên </b></div>') +
        "</section>" +
        '<section class="card sheet">' +
          '<div class="pane-title"><h2> kích hoạt đối tượng </h2><span class="n"> phác thảo mấy cái, một lần liền kích hoạt mấy cái </span></div>' +
          '<div class="g-list scope-list">' +
            '<label class="g-row">' +
              '<input type="checkbox" data-gscope="practice"' + (grantSel.practice? " checked": "") + ">" +
              '<span class="g-who"> đề thi thật Ngân hàng đề <i> toàn bộ Khu luyện tập </i></span>' +
            "</label>" +
            pkgs.map(function (p) {
              var sc = "package:" + p.id;
              return '<label class="g-row">' +
                '<input type="checkbox" data-gscope="' + esc(sc) + '"' + (grantSel[sc]? " checked": "") + ">" +
                '<span class="g-who">' + esc(p.title) + "<i>" + (p.kind === "single"? " Đơn kỹ năng bao ": " trọn bộ bao ") + "</i></span>" +
              "</label>";
            }).join("") +
          "</div>" +
          '<div class="minis" style="margin-top:.8rem">' +
            '<label class="f"><span> Bắt đầu (có thể chỗ trống = lập tức) </span><input type="datetime-local" id="g-start" value="' + esc(gwStart) + '"></label>' +
            '<label class="f"><span> đến kỳ (có thể chỗ trống = tuy nhiên thời hạn) </span><input type="datetime-local" id="g-exp" value="' + esc(gwExp) + '"></label>' +
          "</div>" +
          '<div class="actions" style="margin-top:.6rem">' +
            '<button type="button" class="btn primary" id="g-on"> kích hoạt / đổi mới chọn trúng </button>' +
            '<button type="button" class="btn danger" id="g-off"> Tạm ngưng chọn trúng </button>' +
          "</div>" +
          '<p class="hint"> đại lượng quy tắc: mỗi vị phác thảo chọn Học viên × từng phác thảo chọn đối tượng, một lần Tất cả có hiệu lực (xài chung phía trên Bắt đầu / đến kỳ thời gian). Thi thử màn ngừng hoặc đến kỳ lúc, đã mở thi Học viên 24 giờ bên trong có thể thi xong bổn tràng; Khu luyện tập Tạm ngưng sau lập tức chặn đường. </p>' +
          '<div class="ledger">' +
            '<div class="picked-head"><span> trao quyền đài sổ sách (lựa chọn đối tượng) </span><span>' + ledger.length + " đầu </span></div>" +
            (Object.keys(byUser).length
              ? Object.keys(byUser).map(function (uid) {
                var u = byUser[uid];
                return '<div class="row2"><span class="who2">' + esc(u.name || u.phone || ("#" + uid)) +
                  (u.name && u.phone? ' <span class="muted">' + esc(u.phone) + "</span>": "") + "</span>" +
                  '<span class="lg-chips">' + u.items.map(function (it) {
                    var on = it.state && it.state.on;
                    return '<span class="lg-item"><span class="pill ' + (on? "live": "unpublished") + '">' +
                      esc(scopeTitle(it.scope)) + " · " + esc(grantStateText(it.state)) + "</span>" +
                      (on? '<button type="button" class="sm danger" data-grev="' + esc(it.userId) + "|" + esc(it.scope) + '"> thu hồi </button>': "") +
                      "</span>";
                  }).join("") + "</span></div>";
              }).join("")
              : '<p class="muted" style="margin:.4rem 0 0"> lựa chọn đối tượng còn không có cho bất luận kẻ nào lái qua. </p>') +
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
    // mỗi lần tiến kích hoạt đều nặng kéo bao liệt biểu List, mới vừa lên giá Đầy đủ / Thi thử từng kỹ năng mới phải xuất hiện
    var jobs = [api("/api/toefl/packages").then(function (d) { pkgs = d.packages || []; })];
    if (!stuList) jobs.push(api("/api/admin/students").then(function (d) { stuList = d.students || []; }));
    return Promise.all(jobs).then(function () {
      return refreshLedger();
    }).catch(function (e) { msg(e.message); });
  }
  function submitGrants(action, ids, onlyScope) {
    var scopes = onlyScope? [onlyScope]: checkedScopes();
    if (!scopes.length) { msg(" trước phác thảo chọn bên phải kích hoạt đối tượng "); return; }
    var body = { scopes: scopes, studentIds: ids, action: action };
    if (action!== "off") {
      body.startAt = gwStart? new Date(gwStart).toISOString(): "";
      body.expireAt = gwExp? new Date(gwExp).toISOString(): "";
    }
    api("/api/admin/grants", { method: "POST", body: body }).then(function (d) {
      msg((action === "on"? " Đã kích hoạt ": " Đã tạm ngưng ") + (d.count || ids.length * scopes.length) + " tổ hợp ", true);
      return refreshLedger();
    }).catch(function (e) { msg(e.message); });
  }

  /* đã có bài thi Xem trước và cao thấp khung giữ lại. */
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
    var tabs = [["pool", " đề mục thẩm duyệt "], ["mine", " đã có bài thi "]];
    if (me && me.canGrant) tabs.push(["grant", " kích hoạt "]);
    if (me && me.isAdmin) tabs.push(["review", " xét duyệt "]);
    document.getElementById("tabs").innerHTML = tabs.map(function (t) {
      return '<button type="button" class="' + (tab === t[0]? "is-on": "") + '" data-tab="' + t[0] + '">' + t[1] + "</button>";
    }).join("") + '<button type="button" class="tab-refresh" data-refresh="1"> Làm mới </button>';
  }
  function paint() {
    clearReview();
    paintTabs();
    var who = document.getElementById("who");
    if (who) who.textContent = (me.name || me.phone || "") + (me.isAdmin? " · tổng bộ ": me.canGrant? " · Quản trị viên ": "");
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
      msg(" đã Làm mới · " + pool.length + " câu khối ", true);
    }).catch(function (e) {
      msg(e.message || " Làm mới thất bại ");
    }).then(function () {
      btns.forEach(function (b) { b.disabled = false; });
    });
  }
  function bootApp() {
    show("app");
    api("/api/tiku/me").then(function (d) {
      me = d.teacher;
      if ((tab === "grant" &&!me.canGrant) || (tab === "review" &&!me.isAdmin)) tab = "pool";
      return reload();
    }).catch(function (e) {
      show("login");
      document.getElementById("login-msg").textContent = e.message || " mời một lần nữa Đăng nhập ";
    });
  }

  // nhỏ nhất có thể vận hành kiểm tra: node tiku/tiku.js; không phỏng vấn API, không học lấy Đăng nhập bằng chứng.
  if (typeof window === "undefined") {
    var assert = require("assert");
    var privatePath = "/api/tiku/prediction/media/0123456789abcdef01234567.mp3";
    assert.strictEqual(mediaPath(privatePath), privatePath);
    assert.ok(mediaPath("library/toefl/audio/Question 1.mp3").indexOf("/app/library/toefl/") >= 0);
    ["javascript:alert(1)", "data:audio/mp3;base64,AA", "https://evil.example/a.mp3", "//evil.example/a.mp3", "library/toefl/../../secret", "library/toefl/%2e%2e/secret", "library/toefl/%252e%252e/secret", "library/toefl/a.mp3?token=secret", privatePath + "?token=secret"].forEach(function (path) {
      assert.strictEqual(mediaPath(path), "");
    });
    assert.strictEqual(setLabel("prediction-2026-10-17"), "2026-10-17 dự đoán bao ");
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
      if (tabBtn === "grant" &&!(me && me.canGrant)) { msg(" kích hoạt phục vụ cần Quản trị viên tài khoản "); return; }
      clearReview();
      tab = tabBtn;
      paint();
      if (tab === "grant") ensureGrant();
      return;
    }
    if (t.getAttribute("data-bpv")) {
      ev.preventDefault();
      var previewBlock = blockOf(t.getAttribute("data-bpv"));
      if (previewBlock &&!isPrediction(previewBlock)) openPreview(blockPreviewHref(previewBlock));
      return;
    }
    var inspect = t.getAttribute("data-inspect");
    if (inspect) { loadReview(inspect, true); return; }
    if (t.id === "review-retry") { loadReview(reviewId, true); return; }
    if (t.id === "review-export") { exportReview(); return; }
    var sub = t.getAttribute("data-sub");
    if (sub) {
      api("/api/tiku/papers/" + sub + "/submit", { method: "POST", body: {} })
        .then(function () { msg(" đã lên khung(vào VIP) ", true); return reload(); })
        .catch(function (e) { msg(e.message); });
      return;
    }
    if (t.id === "g-all") { stuFiltered().forEach(function (s) { stuSel[s.id] = 1; }); paintGrant(); return; }
    if (t.id === "g-none") { stuSel = {}; paintGrant(); return; }
    var grev = t.getAttribute("data-grev");
    if (grev) {
      var gp = String(grev).split("|");
      if (confirm(" thu hồi «" + scopeTitle(gp[1]) + "» kích hoạt? đang thi có thể thi xong bổn tràng. ")) submitGrants("off", [Number(gp[0])], gp[1]);
      return;
    }
    if (t.id === "g-on" || t.id === "g-off") {
      var gids = Object.keys(stuSel).map(Number).filter(Boolean);
      if (!gids.length) { msg(" trước tiên ở bên trái phác thảo chọn Học viên "); return; }
      var gsc = checkedScopes();
      if (!gsc.length) { msg(" trước phác thảo chọn bên phải kích hoạt đối tượng "); return; }
      if (t.id === "g-off") {
        if (!confirm(" Tạm ngưng cái này " + gids.length + " danh học sinh × " + gsc.length + " đối tượng kích hoạt? đang tiến hành Thi thử 24 giờ bên trong có thể thi xong bổn tràng, Khu luyện tập lập tức chặn đường. ")) return;
        submitGrants("off", gids);
      } else {
        submitGrants("on", gids);
      }
      return;
    }
    var off = t.getAttribute("data-off");
    if (off && confirm(" loại bỏ sau không thể lại treo trở về, Đồng ý? ")) {
      api("/api/tiku/papers/" + off + "/unpublish", { method: "POST", body: {} })
        .then(function () { msg(" đã loại bỏ ", true); return reload(); })
        .catch(function (e) { msg(e.message); });
      return;
    }
    var okid = t.getAttribute("data-ok");
    if (okid) {
      api("/api/tiku/papers/" + okid + "/approve", { method: "POST", body: {} })
        .then(function () { msg(" Đã đạt ", true); return reload(); })
        .catch(function (e) { msg(e.message); });
      return;
    }
    var noid = t.getAttribute("data-no");
    if (noid) {
      var note = prompt(" lui về nguyên nhân (có thể chỗ trống) ") || "";
      api("/api/tiku/papers/" + noid + "/reject", { method: "POST", body: { note: note } })
        .then(function () { msg(" đã lui quay về ", true); return reload(); })
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
    else if (ev.target.getAttribute && ev.target.getAttribute("data-gscope")!= null) {
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
    if (typ) typ.outerHTML = '<select id="f-type" aria-label=" dạng bài ">' + typeOptions() + "</select>";
    var set = document.getElementById("f-set");
    if (set) set.outerHTML = '<select id="f-set" aria-label=" bộ số hoặc ngày ">' + setOptions() + "</select>";
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
      var hit =!q || (who? who.textContent: "").toLowerCase().indexOf(q) >= 0;
      row.classList.toggle("hidden",!hit);
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
      document.getElementById("login-msg").textContent = e.message || " Đăng nhập thất bại ";
    });
  };

  if (!w.YYSD_TIKU_GATE ||!w.YYSD_TIKU_GATE.ok) {
    show("gate");
    return;
  }
  // ponytail: localhost?demo=1 Không API Xem trước giao diện
  if (w.YYSD_TIKU_GATE.local && /(?:\?|&)demo=1(?:&|$)/.test(w.location.search || "")) {
    me = { name: " biểu thị Giáo viên ", phone: "13800000000", isAdmin: true, canGrant: true };
    pool = [
      { id: "d1", skill: "reading", type: "complete_words", title: "Archaeopteryx", titleZh: " chim thuỷ tổ lấp chỗ trống ", set: 2, n: 10, source: "set" },
      { id: "d2", skill: "reading", type: "daily_life", title: "Campus Notice", titleZh: " sân trường thông tri ", set: 1, n: 5, source: "set" },
      { id: "d3", skill: "reading", type: "academic", title: "Hollywood", titleZh: " Hollywood thời đại hoàng kim ", set: 1, n: 10, source: "set" },
      { id: "d4", skill: "reading", type: "academic", title: "Coral Reefs", titleZh: " đá san hô sinh thái ", set: 3, n: 10, source: "set" },
      { id: "d5", skill: "listening", type: "lecture", title: "Art History", titleZh: " Nghệ thuật lịch sử toạ đàm ", set: 3, n: 6, source: "set" },
      { id: "d6", skill: "listening", type: "conversation", title: "Library", titleZh: " đồ thư quán mượn sách ", set: 2, n: 5, source: "set" },
      { id: "d7", skill: "listening", type: "choose_response", title: "Quick Response", titleZh: " nghe câu chọn đáp lại ", set: 1, n: 8, source: "set" },
      { id: "d8", skill: "writing", type: "email", title: "Email to Prof", titleZh: " cho dạy dỗ ghi Email ", paperId: "2025-09-02", n: 1, source: "date" },
      { id: "d9", skill: "writing", type: "discussion", title: "Urban Planning", titleZh: " Thảo luận học thuật ", set: 4, n: 1, source: "set" },
      { id: "d10", skill: "writing", type: "sentence", title: "Build a Sentence", titleZh: " câu xây dựng ", set: 2, n: 5, source: "set" },
      { id: "d11", skill: "speaking", type: "repeat", title: "Listen & Repeat", titleZh: " Nghe thuật lại ", set: 1, n: 8, source: "set" },
      { id: "d12", skill: "speaking", type: "interview", title: "Interview", titleZh: " mô phỏng phỏng vấn ", set: 2, n: 5, source: "set" }
    ];
    papers = [
      { id: "tp_demo1", title: " tháng mười chạy nước rút Thi thử A cuốn ", kind: "full", status: "live", owner: "teacher", skillMinutes: { reading: 35, listening: 36, writing: 29, speaking: 16 }, blocks: [pool[0], pool[4], pool[7], pool[10]], updatedAt: "2026-10-13T10:24:00" },
      { id: "tp_demo2", title: " Đọc Chuyên sâu · Học thuật văn chương ", kind: "single", status: "draft", owner: "teacher", skillMinutes: {}, blocks: [pool[2], pool[3]], updatedAt: "2026-10-12T18:02:00" }
    ];
    var dt = (w.location.search.match(/(?:\?|&)tab=(pool|mine|grant)(?:&|$)/) || [])[1];
    if (dt) tab = dt;
    show("app");
    paint();
    return;
  }
  if (token()) bootApp();
  else show("login");
})(typeof window!== "undefined"? window: { location: { hostname: "localhost", protocol: "http:", href: "http://localhost:8000/tiku/" } });
