/* =========================================================================
   teacher-calendar.js — Cổng giáo viênNhiệm vụphát hànhĐài Loan viết tắt
   ========================================================================= */
(function () {
  "use strict";

  var T = window.YYSD_TEACHER;
  var Y = window.YYSD;
  var view = "list";
  var events = [];
  var students = [];
  var catalog = [];
  var listenTax = { types: [], scenes: [], diffs: ["họ", "hình thức kết hợp Trung Quốc", "khó để"], groups: [], parts: [] };
  var readTax = { types: [], scenes: [], diffs: ["họ", "hình thức kết hợp Trung Quốc", "khó để"], groups: [], parts: [] };
  var taxonomy = listenTax;
  var shelfBooks = []; // /api/vocab-shelf/catalog — same books as student kho từ
  var monthCursor = new Date();
  monthCursor.setDate(1);
  monthCursor.setHours(0, 0, 0, 0);
  var selectedStudents = {};
  var selectedExercises = {};
  var exerciseCat = "vocab";
  var exerciseSkill = "listening";
  var pickVol = "";
  var pickTest = "";
  var pickVocabGroup = "core"; // core | theme
  var pickVocabBook = "";
  var pickVocabRange = "";
  var pickQType = "";
  var pickScene = "";
  var pickDiff = "";
  var detailEventId = null;

  var CAT_HINT = {
    vocab: "Từ vựngphát hiện:tiền tố có thể bước qua biến thể cũ của viết tắt củachọn một hoặc nhiều lựa chọn từ danh sáchnhiều List;Học viêntừng cái một List xông qua rào cản,Tất cảđi quakhả năng coi nhưHoàn thành.",
    part: "kiếm hai lưỡi tao nhãmục đơn lẻ:trước chọn sách Test,lại họ Section / Passage(Luyện tậpquy tắc,tiền tố có thể tiếp tục làm).",
    qtype: "Nghehọ khuôn:chọn họ khuôn sách,lạichia tayhọ«Luyện tập»có thể«Giải thích chi tiết»(tiền tố có thểđồng thờihọ;Giải thích chi tiếtkhông ghi chépKết quả,không tínhHoàn thành).",
    scene: "NgheTình huốngLuyện tập:chọnTình huốngsách,lại họ Part(hình thức liên kết toàn bộ họLuyện tậpquy tắc).",
    rqtype: "Đọchọ khuônLuyện tập:chọn họ khuôn sách,lại họ họ họ(chỉ đi ra nên họ họ,bài viếtvẫn là chỉ theo sau bởi danh từ hình thức liên kết toàn bộ tờ Passage).",
    rscene: "ĐọcTình huốngLuyện tập:chọnTình huốngsách,lại họ Passage(hình thức liên kết toàn bộ tờLuyện tậpquy tắc).",
    skill: "mục đơn lẻThi thử:trước chọn sách Test,lại họ họ ngành học hình thức liên kết toàn bộ cuộn lại(họ đánhThi thửquy tắc).",
    suite: "một bộ hoàn chỉnhThi thử:trước chọn sách,lại họ một vài che đậy Test Nghe+Đọc+Viết.",
    rsecret: "Đọctuyệt mậtche đậy cuộn lại:chọn một hoặc nhiều lựa chọn từ danh sáchhình thức liên kết toàn bộ cuộn lạisắp xếp.",
    lsecret: "Nghetuyệt mậtche đậy cuộn lại:chọn một hoặc nhiều lựa chọn từ danh sáchhình thức liên kết toàn bộ cuộn lại có thể Section sắp xếp."
  };

  function cdtPackForCat(cat) {
    if (cat === "part" || cat === "qtype" || cat === "scene" || cat === "rqtype" || cat === "rscene") return "drill";
    if (cat === "skill" || cat === "suite" || cat === "rsecret" || cat === "lsecret") return "exam";
    if (cat === "vocab") return "vocab-quiz";
    return "";
  }

  // ponytail: bookId||listId so theme books don't collide on list "1"
  function vocabRef(bookId, listId) {
    return String(bookId || "") + "||" + String(listId || "");
  }

  function parseVocabRef(raw) {
    var s = String(raw || "");
    var i = s.indexOf("||");
    if (i <= 0) return null;
    var bookId = s.slice(0, i);
    var listId = s.slice(i + 2);
    if (!bookId || !listId) return null;
    return { bookId: bookId, listId: listId };
  }

  function shelfBookById(id) {
    for (var i = 0; i < shelfBooks.length; i++) {
      if (shelfBooks[i].id === id) return shelfBooks[i];
    }
    return null;
  }

  function vocabAssignLabel(xid) {
    var p = parseVocabRef(xid);
    if (!p) return "";
    var book = shelfBookById(p.bookId);
    var listLabel = p.listId;
    if (book && book.lists) {
      for (var i = 0; i < book.lists.length; i++) {
        if (String(book.lists[i].id) === String(p.listId)) {
          listLabel = book.lists[i].label || listLabel;
          break;
        }
      }
      return (book.label || p.bookId) + " · " + listLabel;
    }
    return p.bookId + " · " + p.listId;
  }

  function isCambridgeBrowse() {
    return exerciseCat === "part" || exerciseCat === "skill" || exerciseCat === "suite"
      || isQTypeBrowse() || isSceneBrowse();
  }

  function isQTypeBrowse() {
    return exerciseCat === "qtype" || exerciseCat === "rqtype";
  }

  function isSceneBrowse() {
    return exerciseCat === "scene" || exerciseCat === "rscene";
  }

  function isReadingTax() {
    return exerciseCat === "rqtype" || exerciseCat === "rscene";
  }

  function isTaxonomyBrowse() {
    return isQTypeBrowse() || isSceneBrowse();
  }

  function applyTaxonomy() {
    taxonomy = isReadingTax() ? readTax : listenTax;
  }

  function isVocabBrowse() {
    return exerciseCat === "vocab";
  }

  function isBrowseMode() {
    return isCambridgeBrowse() || isVocabBrowse();
  }

  function isVocabSubject(subject) {
    return /^vocab/.test(subject || "");
  }

  function vocabBooksInGroup() {
    return shelfBooks.filter(function (b) {
      if (pickVocabGroup === "theme") return b.kind === "theme";
      return b.kind !== "theme";
    });
  }

  function vocabListsForBook(bookId) {
    var b = shelfBookById(bookId);
    return (b && b.lists) || [];
  }

  function vocabRangesForBook(bookId) {
    var lists = vocabListsForBook(bookId);
    var chunk = 10;
    if (!lists.length) return [{ id: "all", label: "Tất cả", startIdx: 0, endIdx: -1 }];
    var ranges = [];
    for (var i = 0; i < lists.length; i += chunk) {
      var slice = lists.slice(i, i + chunk);
      var a = slice[0];
      var z = slice[slice.length - 1];
      var start = a.listNo != null ? a.listNo : i + 1;
      var end = z.listNo != null ? z.listNo : i + slice.length;
      ranges.push({
        id: "r" + i,
        label: "List " + start + (start === end ? "" : ("–" + end)),
        startIdx: i,
        endIdx: i + slice.length - 1
      });
    }
    return ranges;
  }

  function ensureVocabBrowseDefaults() {
    if (pickVocabGroup !== "theme") pickVocabGroup = "core";
    var books = vocabBooksInGroup();
    var ids = books.map(function (b) { return b.id; });
    if (!pickVocabBook || ids.indexOf(pickVocabBook) < 0) {
      pickVocabBook = ids[0] || "";
    }
    var ranges = pickVocabBook ? vocabRangesForBook(pickVocabBook) : [];
    var rids = ranges.map(function (r) { return r.id; });
    if (!pickVocabRange || rids.indexOf(pickVocabRange) < 0) {
      pickVocabRange = rids[0] || "";
    }
  }

  function listsInVocabRange(bookId) {
    var lists = vocabListsForBook(bookId);
    var ranges = vocabRangesForBook(bookId);
    var range = null;
    for (var i = 0; i < ranges.length; i++) {
      if (ranges[i].id === pickVocabRange) { range = ranges[i]; break; }
    }
    if (!range || range.endIdx < 0) return lists;
    return lists.slice(range.startIdx, range.endIdx + 1);
  }

  function suiteBaseId(id) {
    return String(id || "").replace(/-reading$/, "").replace(/-writing$/, "");
  }

  function suiteIdsOf(base) {
    return [base, base + "-reading", base + "-writing"];
  }

  function buildSuites() {
    var map = {};
    catalog.forEach(function (it) {
      if (it.partNum) return;
      var base = suiteBaseId(it.id);
      if (!/^cambridge-\d+-test-\d+$/.test(base)) return;
      if (!map[base]) map[base] = { base: base, listening: null, reading: null, writing: null };
      if (it.subject === "cambridge-listening") map[base].listening = it;
      else if (it.subject === "cambridge-reading") map[base].reading = it;
      else if (it.subject === "cambridge-writing") map[base].writing = it;
    });
    return Object.keys(map).sort(function (a, b) {
      return b.localeCompare(a, undefined, { numeric: true });
    }).map(function (k) { return map[k]; }).filter(function (s) {
      return s.listening && s.reading && s.writing;
    });
  }

  function isSecretReading(it) {
    if (!it || it.subject !== "cambridge-reading") return false;
    return /^secret-set-\d+/.test(it.id || "");
  }

  function isSecretListening(it) {
    if (!it || it.subject !== "cambridge-listening") return false;
    return /^secret-set-\d+/.test(it.id || "");
  }

  function itemInCat(it, cat) {
    if (!cat) return true;
    if (cat === "rsecret") return isSecretReading(it);
    if (cat === "lsecret") return isSecretListening(it);
    if (isSecretReading(it) || isSecretListening(it)) return false;
    if (cat === "vocab") return isVocabSubject(it.subject);
    if (cat === "part") {
      if (!it.partNum) return false;
      if (exerciseSkill === "listening") return it.subject === "cambridge-listening";
      if (exerciseSkill === "reading") return it.subject === "cambridge-reading";
      return it.subject === "cambridge-listening" || it.subject === "cambridge-reading";
    }
    if (cat === "skill") {
      if (it.partNum) return false;
      if (exerciseSkill === "listening") return it.subject === "cambridge-listening";
      if (exerciseSkill === "reading") return it.subject === "cambridge-reading";
      if (exerciseSkill === "writing") return it.subject === "cambridge-writing";
      return it.subject === "cambridge-listening" ||
        it.subject === "cambridge-reading" ||
        it.subject === "cambridge-writing";
    }
    if (cat === "suite") return false;
    return true;
  }

  function itemCatLabel(it) {
    if (it.partNum) {
      return it.partKind === "s" ? ("Section " + it.partNum) : ("Passage " + it.partNum);
    }
    if (isVocabSubject(it.subject)) {
      if (Y.vocabBookOfSubject) {
        var bk = Y.vocabBookOfSubject(it.subject);
        if (bk === "gaozhong") return "trường trung học phổ thôngTừ vựng";
        if (bk === "cet4") return "cấp 4Từ vựng";
        if (bk === "special") return "IELTS Hệ thống Kiểm tra Tiếng Anh Quốc tếchuyên biệtTừ vựng";
      }
      return "Từ vựng";
    }
    if (it.subject === "cambridge-listening") return "Nghehình thức liên kết toàn bộ cuộn lại";
    if (it.subject === "cambridge-reading") return "Đọchình thức liên kết toàn bộ cuộn lại";
    if (it.subject === "cambridge-writing") return "Viếthình thức liên kết toàn bộ cuộn lại";
    if (it.subject === "ielts") return "Thi thử";
    return (Y.ZONE[it.zone] || {}).label || it.zone || "";
  }

  function cambridgeVolumes() {
    var seen = {};
    var out = [];
    catalog.forEach(function (it) {
      if (!Y.isCambridge || !Y.isCambridge(it.subject)) return;
      if (it.partNum) return;
      var v = Y.camVolume ? String(Y.camVolume(it) || "") : "";
      if (!v || seen[v]) return;
      seen[v] = 1;
      out.push(v);
    });
    return out.sort(function (a, b) {
      return Number(b) - Number(a);
    });
  }

  function testsForVolume(vol) {
    var seen = {};
    var out = [];
    catalog.forEach(function (it) {
      if (!Y.isCambridge || !Y.isCambridge(it.subject)) return;
      if (it.partNum) return;
      if (vol && String(Y.camVolume(it) || "") !== String(vol)) return;
      var t = String(Y.camTestNo(it) || "");
      if (!t || seen[t]) return;
      seen[t] = 1;
      out.push(t);
    });
    return out.sort(function (a, b) { return Number(a) - Number(b); });
  }

  function taxRows() {
    return isSceneBrowse() ? (taxonomy.parts || []) : (taxonomy.groups || []);
  }

  function taxonomyVolumes() {
    var seen = {};
    var out = [];
    taxRows().forEach(function (row) {
      var v = String(row.volume || "");
      if (!v || seen[v]) return;
      seen[v] = 1;
      out.push(v);
    });
    return out.sort(function (a, b) { return Number(b) - Number(a); });
  }

  function taxonomyTests(vol) {
    var seen = {};
    var out = [];
    (taxonomy.groups || []).forEach(function (g) {
      if (vol && String(g.volume) !== String(vol)) return;
      if (pickQType && g.qType !== pickQType) return;
      if (pickDiff && g.diff !== pickDiff) return;
      var t = String(g.test || "");
      if (!t || seen[t]) return;
      seen[t] = 1;
      out.push(t);
    });
    return out.sort(function (a, b) { return Number(a) - Number(b); });
  }

  function groupLabel(g) {
    var unit = isReadingTax() ? "Passage " : "Part ";
    var bits = ["kiếm hai lưỡi" + g.volume, "Test " + g.test, unit + g.part, "Q" + g.qFrom + "-" + g.qTo];
    var extra = [g.qType, g.scene, g.diff].filter(Boolean);
    return bits.join(" ") + (extra.length ? " · " + extra.join(" · ") : "");
  }

  function partSceneLabel(p) {
    var unit = isReadingTax() ? "Passage " : "Part ";
    return "kiếm hai lưỡi" + p.volume + " Test " + p.test + " " + unit + p.part + (p.scene ? (" · " + p.scene) : "");
  }

  function ensureBrowseDefaults() {
    if (!isCambridgeBrowse()) return;
    if (isTaxonomyBrowse()) {
      var tvols = taxonomyVolumes();
      if (pickVol && tvols.indexOf(pickVol) < 0) pickVol = tvols[0] || "";
      if (isQTypeBrowse()) {
        var types = taxonomy.types || [];
        if (!pickQType || types.indexOf(pickQType) < 0) pickQType = types[0] || "";
        var tests = taxonomyTests(pickVol);
        if (pickTest && tests.indexOf(pickTest) < 0) pickTest = "";
      } else {
        var scenes = taxonomy.scenes || [];
        if (!pickScene || scenes.indexOf(pickScene) < 0) pickScene = scenes[0] || "";
      }
      return;
    }
    var vols = cambridgeVolumes();
    if (pickVol && vols.indexOf(pickVol) < 0) pickVol = vols[0] || "";
    var tests = testsForVolume(pickVol);
    if (!pickTest || tests.indexOf(pickTest) < 0) pickTest = tests[0] || "";
    if (exerciseCat === "part") {
      if (exerciseSkill !== "listening" && exerciseSkill !== "reading") exerciseSkill = "listening";
    } else if (exerciseCat === "skill") {
      if (["listening", "reading", "writing", "all"].indexOf(exerciseSkill) < 0) {
        exerciseSkill = "listening";
      }
    }
  }

  function matchVolTest(it) {
    if (!pickTest) return false;
    if (pickVol && String(Y.camVolume(it) || "") !== String(pickVol)) return false;
    return String(Y.camTestNo(it) || "") === String(pickTest);
  }

  function renderChipRow(host, items, attr, active, prefix) {
    if (!host) return;
    host.innerHTML = items.map(function (v) {
      var on = String(v) === String(active);
      var label = v ? ((prefix || "") + v)
        : (attr === "ex-vol" ? "Tất cảsách" : (attr === "ex-test" ? "Tất cả Tests" : "Tất cả"));
      return '<button type="button" class="chip chip--sub' + (on ? " is-active" : "") +
        '" data-' + attr + '="' + esc(v) + '">' + esc(label) + "</button>";
    }).join("");
  }

  var viewEl = document.getElementById("cal-view");
  var statsEl = document.getElementById("cal-stats");
  var createModal = document.getElementById("create-modal");
  var detailModal = document.getElementById("detail-modal");
  var createMsg = document.getElementById("create-msg");

  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("logout-btn").addEventListener("click", function () { T.logout(); });

  var TYPE_LABEL = {
    ASSIGNMENT: "Luyện tậpBài tập",
    LESSON: "Khóa họclịch trình",
    ANNOUNCEMENT: "Nhắc nhởsự việc"
  };

  function esc(s) { return Y.esc(s); }

  function showMsg(text, ok) {
    createMsg.textContent = text || "";
    // ok===null → neutral (phát hànhhình thức kết hợp Trung Quốc…); true→ok; false/omit with text→err
    var cls = "auth-msg";
    if (ok === true) cls += " auth-msg--ok";
    else if (ok === false || (text && ok !== null)) cls += " auth-msg--err";
    createMsg.className = cls;
  }

  function fromLocalInput(v) {
    if (!v) return null;
    var d = new Date(v);
    if (isNaN(d.getTime())) return null;
    return d.toISOString();
  }

  function fmtDate(iso) {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString("zh-CN", { hour12: false, month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch (e) { return iso; }
  }

  function openCreate() {
    if (Y.ensureSecretCatChips) Y.ensureSecretCatChips();
    showMsg("");
    document.getElementById("create-form").reset();
    selectedStudents = {};
    selectedExercises = {};
    exerciseCat = "vocab";
    exerciseSkill = "listening";
    pickVol = "";
    pickTest = "";
    pickVocabBook = "";
    pickVocabRange = "";
    pickQType = "";
    pickScene = "";
    pickDiff = "";
    var hint = document.getElementById("html-file-hint");
    if (hint) hint.textContent = "Tải lênhọcó ưu tiêncó hiệu lực;Học viênsẽ tồn tại trạm bên trongmởlàm họ.";
    document.getElementById("f-type").value = "ASSIGNMENT";
    syncTypeUi();
    renderStudentList();
    renderExerciseList();
    createModal.hidden = false;
  }

  function closeCreate() { createModal.hidden = true; }
  function closeDetail() { detailModal.hidden = true; detailEventId = null; }

  function studentPrintName(s) {
    if (s && s.displayName) return s.displayName;
    return (s && s.phone) || "Học viên";
  }

  function exercisePrintLabel(xid, attachmentName) {
    if (!xid && attachmentName) return "Tải lênLuyện tập:" + attachmentName;
    if (String(xid).indexOf("upload-") === 0) return "Tải lênLuyện tập:" + (attachmentName || xid);
    var vLabel = vocabAssignLabel(xid);
    if (vLabel) return vLabel;
    var it = catalog.filter(function (c) { return c.id === xid; })[0]
      || (Y.resolveItem ? Y.resolveItem(catalog, xid) : null);
    var kind = Y.drillKindLabel ? Y.drillKindLabel(xid) : "";
    var title = it ? Y.displayTitle(it) : String(xid || "");
    return kind ? title + " · " + kind : title;
  }

  function snapshotAssignPrint(body, file) {
    var ids = body.targetStudentIds || [];
    var people = ids.map(function (id) {
      var s = null;
      var i;
      for (i = 0; i < students.length; i++) {
        if (Number(students[i].id) === Number(id)) { s = students[i]; break; }
      }
      return { name: studentPrintName(s) };
    }).sort(function (a, b) {
      return (a.name || "").localeCompare(b.name || "", "zh");
    });
    var names = file
      ? ["Tải lênLuyện tập:" + file.name]
      : (body.linkedExerciseIds || []).map(function (xid) {
        return exercisePrintLabel(xid, body.htmlFileName);
      }).filter(Boolean);
    var teacher = T.getTeacher() || {};
    return {
      title: body.title || "Bài tập",
      due: body.dueTime,
      teacher: teacher.name || teacher.phone || "Giáo viên",
      students: people,
      exercises: names
    };
  }

  function printAssignList(job) {
    if (!job || !job.students.length) return;
    var due = "chưaCài đặthạn chótbiến thể của";
    if (job.due) {
      try {
        due = new Date(job.due).toLocaleString("zh-CN", {
          hour12: false, year: "numeric", month: "numeric", day: "numeric",
          hour: "2-digit", minute: "2-digit"
        });
      } catch (e) { due = String(job.due); }
    }
    var ex = job.exercises.length
      ? "<ul>" + job.exercises.map(function (n) { return "<li>" + esc(n) + "</li>"; }).join("") + "</ul>"
      : "<p>chưacó liên quanLuyện tập</p>";
    var last = job.students.length - 1;
    var pages = job.students.map(function (s, i) {
      return '<section class="page' + (i === last ? " is-last" : "") + '">' +
        "<h1>" + esc(s.name) + "</h1>" +
        '<p class="meta">sắp xếpGiáo viên ' + esc(job.teacher) + "</p>" +
        "<p><b>Nhiệm vụ</b> " + esc(job.title) + "</p>" +
        "<p><b>hạn chótbiến thể của</b> " + esc(due) + "</p>" +
        "<p><b>Luyện tập</b></p>" + ex +
        "</section>";
    }).join("");
    var html = "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>" +
      esc(job.title) + " · Nhiệm vụdanh sách</title><style>" +
      "body{font:16px/1.55 -apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif;color:#1c1e1a;margin:0}" +
      ".page{padding:36px 40px;page-break-after:always}" +
      ".page.is-last{page-break-after:auto}" +
      "h1{font-size:22px;margin:0 0 8px}" +
      ".meta{color:#5c6358;margin:0 0 18px}" +
      "p{margin:0 0 8px}" +
      "ul{margin:0;padding-left:1.2em}" +
      "@media print{body{margin:0}.page{padding:12px 0}}" +
      "</style></head><body>" + pages + "</body></html>";
    var w = window.open("", "_blank");
    if (!w) {
      alert("trình duyệt phần mềmđánh chặnđóng dấucửa sổ,mờicho phépcửa sổ pop-up tin họchọthử lại");
      return;
    }
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  }

  function syncTypeUi() {
    var type = document.getElementById("f-type").value;
    var ex = document.getElementById("exercise-fieldset");
    var dueWrap = document.getElementById("f-due-wrap");
    var form = document.getElementById("create-form");
    ex.hidden = type !== "ASSIGNMENT";
    dueWrap.hidden = type === "LESSON";
    if (form) form.classList.toggle("assign-desk--meta-only", type !== "ASSIGNMENT");
    document.getElementById("f-start-label").textContent =
      type === "LESSON" ? "đi họcThời gian" : "Bắt đầuThời gian(có sẵn)";
  }

  function stampBrowseLabels() {
    ["exercise-vol-filter", "exercise-book-filter", "exercise-test-filter", "exercise-skill-filter"].forEach(function (id) {
      var el = document.getElementById(id);
      var lab = el && el.previousElementSibling;
      if (!lab || !lab.classList.contains("assign-filter-label")) return;
      lab.textContent = el.getAttribute("aria-label") || lab.textContent;
    });
  }

  function studentLabel(s) {
    return s.displayName ? s.displayName + "(" + s.phone + ")" : s.phone;
  }

  function renderStudentList() {
    var q = (document.getElementById("student-q").value || "").trim().toLowerCase();
    var html = students.filter(function (s) {
      if (!q) return true;
      return studentLabel(s).toLowerCase().indexOf(q) >= 0;
    }).map(function (s) {
      var checked = selectedStudents[s.id] ? " checked" : "";
      return '<label class="cal-check">' +
        '<input type="checkbox" data-student="' + s.id + '"' + checked + ">" +
        '<span>' + esc(studentLabel(s)) + "</span></label>";
    }).join("");
    document.getElementById("student-list").innerHTML = html ||
      ('<p class="profile-hint">' +
        ((T.isAdmin && T.isAdmin())
          ? 'tạm thời không cóHọc viên.mời trước đến<a href="admin-assign.html">Phân bổ học viên</a>từ mượn ràng buộc.'
          : "tạm thời không cóHọc viên.mờibiến thể củangười quản lýcầmPhân bổ học viêncung cấp bạn.") +
      "</p>");
    document.getElementById("student-picked").textContent =
      "đã chọn " + Object.keys(selectedStudents).length + " người";
  }

  function syncExerciseCatUi() {
    document.querySelectorAll("#exercise-cats [data-ex-cat]").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-ex-cat") === exerciseCat);
    });
    var browse = document.getElementById("exercise-browse");
    var q = (document.getElementById("exercise-q").value || "").trim();
    var showBrowse = isBrowseMode() && !q;
    if (browse) browse.hidden = !showBrowse;
    var hint = document.getElementById("exercise-cat-hint");
    if (hint) {
      hint.textContent = q && isBrowseMode()
        ? (isVocabBrowse()
          ? "đang ở thời điểm đóTìm kiếmTất cảkho từhình thức kết hợp gốc List(Học viênkho từgiống hệt);dọn dẹptiền tố có thểtrở vềchia thành nhómxuống biến thể của."
          : "đang ở thời điểm đóTìm kiếmTất cảGhép nốihọ;dọn dẹpTìm kiếmtiền tố có thểtrở về«sách → Test»xuống biến thể của.")
        : (CAT_HINT[exerciseCat] || "trước chọnBài tậploại,lạichọn một hoặc nhiều lựa chọn từ danh sáchNội dung.");
    }
    if (!showBrowse) return;

    var volHost = document.getElementById("exercise-vol-filter");
    var bookHost = document.getElementById("exercise-book-filter");
    var testHost = document.getElementById("exercise-test-filter");
    var skillBar = document.getElementById("exercise-skill-filter");

    if (isVocabBrowse()) {
      ensureVocabBrowseDefaults();
      var books = vocabBooksInGroup();
      if (volHost) {
        volHost.setAttribute("aria-label", "biến thể cũ của viết tắt củaloại chính");
        volHost.innerHTML =
          '<button type="button" class="chip chip--sub' + (pickVocabGroup === "core" ? " is-active" : "") +
            '" data-ex-vgroup="core">lõibiến thể cũ của viết tắt của</button>' +
          '<button type="button" class="chip chip--sub' + (pickVocabGroup === "theme" ? " is-active" : "") +
            '" data-ex-vgroup="theme">Chủ đềbiến thể cũ của viết tắt của</button>';
      }
      if (bookHost) {
        bookHost.hidden = false;
        bookHost.setAttribute("aria-label", pickVocabGroup === "theme" ? "Chủ đềbiến thể cũ của hình thức kết hợp gốc" : "lõibiến thể cũ của hình thức kết hợp gốc");
        bookHost.innerHTML = books.map(function (b) {
          var on = b.id === pickVocabBook;
          var meta = b.listCount != null ? (" · " + b.listCount + " List") : "";
          return '<button type="button" class="chip chip--sub' + (on ? " is-active" : "") +
            '" data-ex-vbook="' + esc(b.id) + '" title="' + esc((b.tag || "") + meta) + '">' +
            esc(b.label) + "</button>";
        }).join("") || '<span class="profile-hint">nênchia thành nhómtạm thời không có biến thể cũ của hình thức kết hợp gốc</span>';
      }
      var ranges = pickVocabBook ? vocabRangesForBook(pickVocabBook) : [];
      if (testHost) {
        testHost.hidden = false;
        testHost.setAttribute("aria-label", "List chia cái gì thành các phần");
        testHost.innerHTML = ranges.map(function (r) {
          var on = r.id === pickVocabRange;
          return '<button type="button" class="chip chip--sub' + (on ? " is-active" : "") +
            '" data-ex-vrange="' + esc(r.id) + '">' + esc(r.label) + "</button>";
        }).join("");
      }
      if (skillBar) {
        // ponytail: vocab assign is quiz-only — no mode toggle
        skillBar.hidden = true;
        skillBar.innerHTML = "";
      }
      stampBrowseLabels();
      return;
    }

    if (bookHost) {
      bookHost.hidden = true;
      bookHost.innerHTML = "";
    }

    ensureBrowseDefaults();
    if (volHost) volHost.setAttribute("aria-label", "kiếm hai lưỡi cầu sách");
    var vols = isTaxonomyBrowse() ? taxonomyVolumes() : cambridgeVolumes();
    renderChipRow(volHost, [""].concat(vols), "ex-vol", pickVol, "Cam ");

    if (isQTypeBrowse()) {
      if (testHost) {
        testHost.hidden = false;
        testHost.setAttribute("aria-label", "Test");
        renderChipRow(testHost, [""].concat(taxonomyTests(pickVol)), "ex-test", pickTest, "Test ");
      }
      if (skillBar) {
        skillBar.hidden = false;
        skillBar.setAttribute("aria-label", "họ khuôn");
        skillBar.innerHTML = (taxonomy.types || []).map(function (t) {
          var on = t === pickQType;
          return '<button type="button" class="chip chip--sub' + (on ? " is-active" : "") +
            '" data-ex-qtype="' + esc(t) + '">' + esc(t) + "</button>";
        }).join("");
      }
      if (bookHost) {
        bookHost.hidden = false;
        bookHost.setAttribute("aria-label", "Độ khó");
        var diffs = [""].concat(taxonomy.diffs || ["họ", "hình thức kết hợp Trung Quốc", "khó để"]);
        bookHost.innerHTML = diffs.map(function (d) {
          var on = String(pickDiff || "") === String(d);
          return '<button type="button" class="chip chip--sub' + (on ? " is-active" : "") +
            '" data-ex-diff="' + esc(d) + '">' + esc(d || "Tất cảĐộ khó") + "</button>";
        }).join("");
      }
      stampBrowseLabels();
      return;
    }

    if (isSceneBrowse()) {
      if (testHost) {
        testHost.hidden = true;
        testHost.innerHTML = "";
      }
      if (bookHost) {
        bookHost.hidden = true;
        bookHost.innerHTML = "";
      }
      if (skillBar) {
        skillBar.hidden = false;
        skillBar.setAttribute("aria-label", "Tình huống");
        skillBar.innerHTML = (taxonomy.scenes || []).map(function (s) {
          var on = s === pickScene;
          return '<button type="button" class="chip chip--sub' + (on ? " is-active" : "") +
            '" data-ex-scene="' + esc(s) + '">' + esc(s) + "</button>";
        }).join("");
      }
      stampBrowseLabels();
      return;
    }

    if (testHost) {
      testHost.hidden = false;
      testHost.setAttribute("aria-label", "Test");
    }
    var tests = testsForVolume(pickVol);
    renderChipRow(testHost, tests, "ex-test", pickTest, "Test ");

    if (skillBar) {
      skillBar.setAttribute("aria-label", "Kỹ năng");
      if (exerciseCat === "suite") {
        skillBar.hidden = true;
        skillBar.innerHTML = "";
      } else if (exerciseCat === "part") {
        skillBar.hidden = false;
        skillBar.innerHTML =
          '<button type="button" class="chip chip--sub' + (exerciseSkill === "listening" ? " is-active" : "") +
          '" data-ex-skill="listening">Nghe Section</button>' +
          '<button type="button" class="chip chip--sub' + (exerciseSkill === "reading" ? " is-active" : "") +
          '" data-ex-skill="reading">Đọc Passage</button>';
      } else {
        skillBar.hidden = false;
        skillBar.innerHTML =
          '<button type="button" class="chip chip--sub' + (exerciseSkill === "listening" ? " is-active" : "") +
          '" data-ex-skill="listening">Nghe</button>' +
          '<button type="button" class="chip chip--sub' + (exerciseSkill === "reading" ? " is-active" : "") +
          '" data-ex-skill="reading">Đọc</button>' +
          '<button type="button" class="chip chip--sub' + (exerciseSkill === "writing" ? " is-active" : "") +
          '" data-ex-skill="writing">Viết</button>' +
          '<button type="button" class="chip chip--sub' + (exerciseSkill === "all" ? " is-active" : "") +
          '" data-ex-skill="all">Tất cả</button>';
      }
    }
    stampBrowseLabels();
  }

  function renderExerciseList() {
    syncExerciseCatUi();
    var q = (document.getElementById("exercise-q").value || "").trim().toLowerCase();
    var html = "";
    var searching = !!q;

    if (exerciseCat === "suite") {
      var suites = buildSuites().filter(function (s) {
        if (searching) {
          var hay = (s.base + " " + Y.displayTitle(s.listening)).toLowerCase();
          return hay.indexOf(q) >= 0;
        }
        return (!pickVol || String(Y.camVolume(s.listening) || "") === String(pickVol)) &&
          String(Y.camTestNo(s.listening) || "") === String(pickTest);
      }).slice(0, searching ? 80 : 8);
      html = suites.map(function (s) {
        var ids = suiteIdsOf(s.base);
        var allOn = ids.every(function (id) { return selectedExercises[id]; });
        var vol = Y.camVolume ? Y.camVolume(s.listening) : "";
        var testNo = Y.camTestNo ? Y.camTestNo(s.listening) : "";
        var title = (vol && testNo)
          ? ("Cambridge IELTS " + vol + " · Test " + testNo + " một bộ hoàn chỉnhThi thử")
          : (Y.displayTitle(s.listening) + " · một bộ hoàn chỉnh");
        return '<label class="cal-check cal-suite-li">' +
          '<input type="checkbox" data-suite="' + esc(s.base) + '"' + (allOn ? " checked" : "") + ">" +
          "<span><b>" + esc(title) + "</b><small>Nghe + Đọc + Viết · họ đánhquy trình</small></span></label>";
      }).join("");
    } else if (isVocabBrowse()) {
      var shelfRows = [];
      if (searching) {
        shelfBooks.forEach(function (b) {
          (b.lists || []).forEach(function (list) {
            var hay = (b.label + " " + b.id + " " + (list.label || "") + " " + list.id).toLowerCase();
            if (hay.indexOf(q) >= 0) {
              shelfRows.push({ book: b, list: list });
            }
          });
        });
        shelfRows = shelfRows.slice(0, 120);
      } else {
        ensureVocabBrowseDefaults();
        var book = shelfBookById(pickVocabBook);
        listsInVocabRange(pickVocabBook).forEach(function (list) {
          shelfRows.push({ book: book || { id: pickVocabBook, label: pickVocabBook }, list: list });
        });
      }
      html = shelfRows.map(function (row) {
        var key = vocabRef(row.book.id, row.list.id);
        var checked = selectedExercises[key] ? " checked" : "";
        var wc = row.list.wordCount != null ? (row.list.wordCount + " biến thể cũ của") : "kho từ List";
        return '<label class="cal-check">' +
          '<input type="checkbox" data-exercise="' + esc(key) + '"' + checked + ">" +
          "<span><b>" + esc(row.list.label || ("List " + row.list.id)) + "</b>" +
          "<small>" + esc(row.book.label || row.book.id) + " · " + esc(wc) + "</small></span></label>";
      }).join("");
    } else if (isTaxonomyBrowse()) {
      ensureBrowseDefaults();
      var rows = [];
      if (isQTypeBrowse()) {
        rows = (taxonomy.groups || []).filter(function (g) {
          if (searching) {
            return (groupLabel(g) + " " + g.id).toLowerCase().indexOf(q) >= 0;
          }
          if (pickQType && g.qType !== pickQType) return false;
          if (pickVol && String(g.volume) !== String(pickVol)) return false;
          if (pickTest && String(g.test) !== String(pickTest)) return false;
          if (pickDiff && g.diff !== pickDiff) return false;
          return true;
        });
      } else {
        rows = (taxonomy.parts || []).filter(function (p) {
          if (searching) {
            return (partSceneLabel(p) + " " + p.id).toLowerCase().indexOf(q) >= 0;
          }
          if (pickScene && p.scene !== pickScene) return false;
          if (pickVol && String(p.volume) !== String(pickVol)) return false;
          return true;
        });
      }
      rows = rows.slice(0, searching ? 240 : 200);
      html = rows.map(function (row) {
        var title = isQTypeBrowse() ? groupLabel(row) : partSceneLabel(row);
        var small = isQTypeBrowse()
          ? (row.qType + (row.scene ? (" · " + row.scene) : "") + (row.diff ? (" · " + row.diff) : ""))
          : (row.scene || (isReadingTax() ? "Tình huống Passage" : "Tình huống Part"));
        if (exerciseCat === "qtype") {
          var xId = row.id + "-explain";
          var pOn = selectedExercises[row.id] ? " checked" : "";
          var xOn = selectedExercises[xId] ? " checked" : "";
          return '<div class="cal-check cal-check--qtype">' +
            "<span><b>" + esc(title) + "</b><small>" + esc(small) + "</small></span>" +
            '<span class="cal-duals">' +
              '<label class="cal-dual"><input type="checkbox" data-exercise="' + esc(row.id) + '"' + pOn + ">Luyện tập</label>" +
              '<label class="cal-dual"><input type="checkbox" data-exercise="' + esc(xId) + '"' + xOn + ">Giải thích chi tiết</label>" +
            "</span></div>";
        }
        var checked = selectedExercises[row.id] ? " checked" : "";
        return '<label class="cal-check">' +
          '<input type="checkbox" data-exercise="' + esc(row.id) + '"' + checked + ">" +
          "<span><b>" + esc(title) + "</b><small>" + esc(small) + "</small></span></label>";
      }).join("");
    } else {
      var items = catalog.filter(function (it) {
        if (!itemInCat(it, exerciseCat)) return false;
        if (searching) {
          var hay = (Y.displayTitle(it) + " " + it.title + " " + it.id + " " +
            (it.subject || "") + " " + (Y.partSearchText ? Y.partSearchText(it) : "") + " " +
            (Y.secretSearchText ? Y.secretSearchText(it) : "")).toLowerCase();
          return hay.indexOf(q) >= 0;
        }
        if (isCambridgeBrowse() && !matchVolTest(it)) return false;
        return true;
      });
      if (exerciseCat === "rsecret" || exerciseCat === "lsecret") {
        items.sort(function (a, b) {
          function key(it) {
            var m = String(it.id || "").match(/^secret-set-(\d+)(?:-reading)?(?:-(s|p)(\d+))?$/i);
            return m ? [Number(m[1]), m[3] ? Number(m[3]) : 0] : [9999, 0];
          }
          var ka = key(a), kb = key(b);
          return ka[0] - kb[0] || ka[1] - kb[1];
        });
      }
      items = items.slice(0, searching ? 120 : 40);
      html = items.map(function (it) {
        var checked = selectedExercises[it.id] ? " checked" : "";
        var topic = (Y.secretTopicLine && Y.secretTopicLine(it)) || (Y.secretPaperTopics && Y.secretPaperTopics(it));
        var label = exerciseCat === "skill"
          ? ("mục đơn lẻThi thử · " + itemCatLabel(it))
          : exerciseCat === "rsecret" ? (topic || "Đọctuyệt mậtche đậy cuộn lại")
          : exerciseCat === "lsecret" ? (topic || "Nghetuyệt mậtche đậy cuộn lại")
          : itemCatLabel(it);
        return '<label class="cal-check">' +
          '<input type="checkbox" data-exercise="' + esc(it.id) + '"' + checked + ">" +
          "<span><b>" + esc(Y.displayTitle(it)) + "</b><small>" + esc(label) + "</small></span></label>";
      }).join("");
    }

    var emptyMsg = searching
      ? "không cóGhép nốiLuyện tập"
      : (isVocabBrowse()
        ? (shelfBooks.length ? "từ nàyviết tắt của / chia cái gì thành các phầntạm thời không có List,trao đổi một hình thức kết hợp gốc thử thử" : "kho từĐang tảicó thể làm với tư cách trống không")
        : (isTaxonomyBrowse()
          ? "nênLọcxuống tạm thờikhông có tiêu đềmắt,trao đổi họ khuôn / Tình huốngcó thể trao đổi một sách thử thử"
          : (isCambridgeBrowse() ? "nên sách / Test xuống tạm thời không cóNội dung,trao đổi một sách thử thử" : "không cóGhép nốiLuyện tập")));
    var listEl = document.getElementById("exercise-list");
    listEl.classList.toggle("cal-check-list--lsecret", exerciseCat === "lsecret");
    listEl.classList.toggle("cal-check-list--rsecret", exerciseCat === "rsecret");
    listEl.innerHTML = html || '<p class="profile-hint">' + emptyMsg + "</p>";
    updateExercisePicked();
  }

  function updateExercisePicked() {
    var nPick = Object.keys(selectedExercises).length;
    var el = document.getElementById("exercise-picked");
    if (!el) return;
    if (isVocabBrowse() && nPick) {
      el.textContent = "đã chọn " + nPick + " dùng trong List · Học viênsẽtừng cái mộtxông qua rào cản";
      return;
    }
    el.textContent = "đã chọn " + nPick + " lượng từ cho quà tặngLuyện tập";
  }

  function renderStats() {
    var total = events.length;
    var a = 0, l = 0, n = 0, overdue = 0;
    events.forEach(function (ev) {
      if (ev.eventType === "ASSIGNMENT") a++;
      else if (ev.eventType === "LESSON") l++;
      else n++;
      if (ev.statusSummary && ev.statusSummary.overdue) overdue += ev.statusSummary.overdue;
    });
    statsEl.innerHTML =
      '<div class="teacher-stat"><b>' + total + "</b><span>Tất cảNhiệm vụ</span></div>" +
      '<div class="teacher-stat"><b>' + a + "</b><span>Luyện tậpBài tập</span></div>" +
      '<div class="teacher-stat"><b>' + l + "</b><span>Khóa họclịch trình</span></div>" +
      '<div class="teacher-stat"><b>' + overdue + "</b><span>bị quá hạnlượt người</span></div>";
  }

  var STATUS_LABEL = {
    PENDING: "Chưa hoàn thành",
    COMPLETED: "Đã hoàn thành",
    OVERDUE: "Đã quá hạn"
  };

  function statusClass(st) {
    if (st === "COMPLETED") return "cal-status--done";
    if (st === "OVERDUE") return "cal-status--overdue";
    return "cal-status--pending";
  }

  function progressBar(done, total) {
    if (!total) return '<span class="cal-progress__txt">không liên quanhình thức kết hợp: liên minh vớiLuyện tập</span>';
    var pct = Math.round((done / total) * 100);
    return '<div class="cal-progress" title="' + done + "/" + total + '">' +
      '<div class="cal-progress__track"><span class="cal-progress__fill" style="width:' + pct + '%"></span></div>' +
      '<span class="cal-progress__txt">' + done + "/" + total + " Luyện tập</span></div>";
  }

  function typeClass(t) {
    if (t === "ASSIGNMENT") return "cal-tag--assignment";
    if (t === "LESSON") return "cal-tag--lesson";
    return "cal-tag--announce";
  }

  function renderList() {
    if (!events.length) {
      viewEl.innerHTML = '<div class="state state--brand teacher-empty"><h3>họkhông cóNhiệm vụ</h3><p>nhấn«huyện Xinjian ở Nam XươngNhiệm vụ»sắp xếpLuyện tậpcó thểKhóa họclịch trình.</p></div>';
      return;
    }
    var rows = events.map(function (ev) {
      var sum = ev.statusSummary || {};
      var done = sum.completed || 0;
      var total = sum.total || 0;
      return '<article class="cal-todo-row" data-id="' + ev.id + '">' +
        '<div class="cal-todo-row__main">' +
          '<div class="cal-todo-row__tags">' +
            '<span class="cal-tag ' + typeClass(ev.eventType) + '">' + esc(TYPE_LABEL[ev.eventType] || ev.eventType) + "</span>" +
          "</div>" +
          "<h3>" + esc(ev.title) + "</h3>" +
          '<p class="cal-card__meta">' +
            (ev.dueTime ? "Hạn " + esc(fmtDate(ev.dueTime)) : "") +
            (ev.startTime ? (ev.dueTime ? " · " : "") + "Bắt đầu " + esc(fmtDate(ev.startTime)) : "") +
            " · Học viênHoàn thành " + done + "/" + total +
            (sum.overdue ? " · bị quá hạn " + sum.overdue : "") +
          "</p>" +
        "</div>" +
        '<div class="cal-todo-row__act">' +
          '<button type="button" class="btn btn--ghost btn--sm" data-detail="' + ev.id + '">XemHoàn thànhhoàn cảnh</button>' +
        "</div>" +
      "</article>";
    }).join("");
    viewEl.innerHTML = '<div class="cal-todo-list">' + rows + "</div>";
  }

  function dayKeyOf(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso).slice(0, 10);
    var pad = function (n) { return n < 10 ? "0" + n : "" + n; };
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function renderMonth() {
    var y = monthCursor.getFullYear();
    var m = monthCursor.getMonth();
    var firstDow = new Date(y, m, 1).getDay();
    var daysInMonth = new Date(y, m + 1, 0).getDate();
    var cells = [];
    var i;
    for (i = 0; i < firstDow; i++) cells.push('<div class="cal-month__cell is-empty"></div>');
    for (i = 1; i <= daysInMonth; i++) {
      var dayKey = y + "-" + (m + 1 < 10 ? "0" : "") + (m + 1) + "-" + (i < 10 ? "0" : "") + i;
      var dayEvents = events.filter(function (ev) {
        return dayKeyOf(ev.dueTime) === dayKey || dayKeyOf(ev.startTime) === dayKey;
      });
      var chips = dayEvents.slice(0, 3).map(function (ev) {
        return '<button type="button" class="cal-month__chip ' + typeClass(ev.eventType) +
          '" data-detail="' + ev.id + '">' + esc(ev.title) + "</button>";
      }).join("");
      if (dayEvents.length > 3) {
        chips += '<span class="cal-month__more">+' + (dayEvents.length - 3) + "</span>";
      }
      cells.push(
        '<div class="cal-month__cell">' +
          '<div class="cal-month__day">' + i + "</div>" +
          '<div class="cal-month__chips">' + chips + "</div>" +
        "</div>"
      );
    }
    viewEl.innerHTML =
      '<div class="cal-month">' +
        '<div class="cal-month__nav">' +
          '<button type="button" class="btn btn--ghost btn--sm" id="month-prev">‹</button>' +
          "<strong>" + y + " họ " + (m + 1) + " mặt trăng</strong>" +
          '<button type="button" class="btn btn--ghost btn--sm" id="month-next">›</button>' +
        "</div>" +
        '<div class="cal-month__weekdays">' +
          "<span>viết tắt của</span><span>một</span><span></span><span>họ</span><span>bốn</span><span>năm</span><span>sáu</span>" +
        "</div>" +
        '<div class="cal-month__grid">' + cells.join("") + "</div>" +
      "</div>";
  }

  function render() {
    renderStats();
    if (view === "month") renderMonth();
    else renderList();
  }

  function openDetail(id) {
    detailEventId = id;
    document.getElementById("detail-body").innerHTML =
      '<div class="state state--brand"><div class="spinner spinner--brand"></div></div>';
    detailModal.hidden = false;
    T.api("/api/calendar/events/" + id).then(function (d) {
      var ev = d.event || {};
      document.getElementById("detail-modal-title").textContent = ev.title || "Nhiệm vụChi tiết";
      var isVq = String(ev.cdtPack || "").toLowerCase() === "vocab-quiz";
      var studentsHtml = (ev.students || []).map(function (s) {
        var st = s.status || "PENDING";
        var prog;
        if (isVq) {
          if (st === "COMPLETED" && s.quizResult) {
            var qr = s.quizResult;
            if (qr.passedLists && (ev.linkedExerciseIds || []).length > 1) {
              var n = Object.keys(qr.passedLists).length;
              prog = "Tất cảđi qua " + n + "/" + (ev.linkedExerciseIds || []).length +
                " List(gần đây " + (qr.correct || 0) + "/" + (qr.total || 0) + ")";
            } else {
              prog = "đi qua " + (qr.correct || 0) + "/" + (qr.total || 0) +
                "(họ " + (qr.wrong || 0) + ")";
            }
          } else if (s.quizResult && s.quizResult.passedLists) {
            var pl = Object.keys(s.quizResult.passedLists).length;
            var tot = Math.max(1, (ev.linkedExerciseIds || []).length);
            prog = "Tiến độ " + pl + "/" + tot + " List";
          } else {
            prog = "chưađi qua / Chưa hoàn thành";
          }
        } else {
          prog = s.exerciseTotal
            ? (s.exerciseDone || 0) + "/" + s.exerciseTotal + " Luyện tậpĐã hoàn thành"
            : "—";
        }
        var stLabel = STATUS_LABEL[st] || st;
        if (Y.isExplainOnlyAssignment && Y.isExplainOnlyAssignment(ev.linkedExerciseIds || [])) {
          stLabel = "Giải thích chi tiết";
          prog = "không ghi chépKết quả,không tínhHoàn thành";
        }
        return "<tr class=\"" + statusClass(st) + "\">" +
          "<td><b>" + esc(s.displayName || s.phone) + "</b>" +
            (s.displayName ? "<small class=\"cal-phone\">" + esc(s.phone) + "</small>" : "") +
          "</td>" +
          '<td><span class="cal-status-pill ' + statusClass(st) + '">' +
            esc(stLabel) + "</span></td>" +
          "<td>" + esc(prog) + "</td>" +
          "<td>" + esc(fmtDate(s.completedAt)) + "</td></tr>";
      }).join("");
      var exHtml = (ev.linkedExerciseIds || []).map(function (xid) {
        if (String(xid).indexOf("upload-") === 0) {
          return "<li>Tải lênLuyện tập:" + esc(ev.attachmentName || xid) + "</li>";
        }
        var vLabel = vocabAssignLabel(xid);
        if (vLabel) return "<li>" + esc(vLabel) + "</li>";
        var it = catalog.filter(function (c) { return c.id === xid; })[0]
          || (Y.resolveItem ? Y.resolveItem(catalog, xid) : null);
        var kind = Y.drillKindLabel ? Y.drillKindLabel(xid) : "";
        return "<li>" + esc(it ? Y.displayTitle(it) : xid) +
          (kind ? '<small class="cal-ex-kind">' + esc(kind) + "</small>" : "") +
          "</li>";
      }).join("");
      var doneN = (ev.students || []).filter(function (s) { return s.status === "COMPLETED"; }).length;
      var totalN = (ev.students || []).length;
      document.getElementById("detail-body").innerHTML =
        '<p><span class="cal-tag ' + typeClass(ev.eventType) + '">' +
          esc(TYPE_LABEL[ev.eventType] || ev.eventType) + "</span></p>" +
        "<p>" + esc(ev.description || "không cóthêmGiải thích") + "</p>" +
        "<p class=\"cal-card__meta\">Bắt đầu:" + esc(fmtDate(ev.startTime)) +
          " · Hạn:" + esc(fmtDate(ev.dueTime)) + "</p>" +
        (ev.attachmentName
          ? "<p class=\"profile-hint\">phụ lục trong tài liệu:" + esc(ev.attachmentName) + "</p>"
          : "") +
        (exHtml ? "<h3>có liên quanLuyện tập</h3><ul>" + exHtml + "</ul>" +
          "<p class=\"profile-hint\">" +
            (isVq
              ? "Học viênphải tồn tạiTừ vựngphát hiệnhình thức kết hợp Trung Quốcxông qua rào cảnđi qua(họ khôngvượt qua 5 câu)họ,Nhiệm vụkhả năng coi nhưHoàn thành;chưađi quaphải lặp lại khảo sát."
              : "Học viênphảiHoàn thànhmức đó hoặc cao hơnTất cảLuyện tậphọ,Nhiệm vụkhả năng có thểtự độngthay đổi thành«Đã hoàn thành».") +
          "</p>" : "") +
        "<h3>Học viênHoàn thànhhoàn cảnh <span class=\"cal-detail__count\">" + doneN + "/" + totalN + " ngườiĐã hoàn thành</span></h3>" +
        '<table class="teacher-table cal-status-table"><thead><tr>' +
          "<th>Học viên</th><th>tình trạng</th><th>" + (isVq ? "phát hiệnKết quả" : "Luyện tậpTiến độ") + "</th><th>thì hoàn thành ngữ phápgiữa</th></tr></thead>" +
        "<tbody>" + (studentsHtml || '<tr><td colspan="4" class="teacher-empty-row">tạm thời không có</td></tr>') +
        "</tbody></table>";
    }).catch(function (e) {
      document.getElementById("detail-body").innerHTML = "<p class=\"auth-msg auth-msg--err\">" + esc(e.message) + "</p>";
    });
  }

  function load() {
    viewEl.innerHTML = '<div class="state state--brand"><div class="spinner spinner--brand"></div></div>';
    // ponytail: soft-fail catalog/Y — publish already saved; don't paint whole page as fail
    Promise.all([
      T.api("/api/calendar/events"),
      T.api("/api/teacher/students"),
      Y.load().catch(function () { return []; }),
      T.api("/api/vocab-shelf/catalog").catch(function () { return { books: shelfBooks }; }),
      (Y.loadListeningTaxonomy
        ? Y.loadListeningTaxonomy().catch(function () { return { types: [], scenes: [], diffs: ["họ", "hình thức kết hợp Trung Quốc", "khó để"], groups: [], parts: [] }; })
        : Promise.resolve({ types: [], scenes: [], diffs: ["họ", "hình thức kết hợp Trung Quốc", "khó để"], groups: [], parts: [] })),
      (Y.loadReadingTaxonomy
        ? Y.loadReadingTaxonomy().catch(function () { return { types: [], scenes: [], diffs: ["họ", "hình thức kết hợp Trung Quốc", "khó để"], groups: [], parts: [] }; })
        : Promise.resolve({ types: [], scenes: [], diffs: ["họ", "hình thức kết hợp Trung Quốc", "khó để"], groups: [], parts: [] }))
    ]).then(function (res) {
      events = res[0].events || [];
      students = (res[1].students || []).map(function (s) {
        return { id: s.id, phone: s.phone, displayName: s.displayName || "" };
      });
      catalog = Y.expandAssignableParts ? Y.expandAssignableParts(res[2] || []) : (res[2] || []);
      shelfBooks = (res[3] && res[3].books) || shelfBooks || [];
      listenTax = res[4] || listenTax;
      readTax = res[5] || readTax;
      applyTaxonomy();
      render();
    }).catch(function (e) {
      // ponytail: stay put — same as teacher.js
      viewEl.innerHTML = '<div class="state state--brand"><h3>Tải thất bại</h3><p>' + esc(e.message) +
        '</p><p><a class="btn btn--ghost btn--sm" href="teacher-login.html">lạiĐăng nhập</a></p></div>';
    });
  }

  document.querySelectorAll("[data-view]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      view = btn.getAttribute("data-view") || "list";
      document.querySelectorAll("[data-view]").forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
      });
      render();
    });
  });

  document.getElementById("refresh-btn").addEventListener("click", load);
  document.getElementById("create-btn").addEventListener("click", openCreate);
  document.getElementById("f-type").addEventListener("change", syncTypeUi);

  createModal.addEventListener("click", function (e) {
    if (e.target.getAttribute("data-close")) closeCreate();
  });
  detailModal.addEventListener("click", function (e) {
    if (e.target.getAttribute("data-close-detail")) closeDetail();
  });

  document.getElementById("student-q").addEventListener("input", renderStudentList);
  document.getElementById("exercise-q").addEventListener("input", renderExerciseList);
  document.getElementById("exercise-cats").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-ex-cat]");
    if (!btn) return;
    exerciseCat = btn.getAttribute("data-ex-cat") || "vocab";
    if (exerciseCat === "part") exerciseSkill = "listening";
    else if (exerciseCat === "skill") exerciseSkill = "listening";
    pickVol = "";
    pickTest = "";
    pickVocabGroup = "core";
    pickVocabBook = "";
    pickVocabRange = "";
    pickQType = "";
    pickScene = "";
    pickDiff = "";
    applyTaxonomy();
    renderExerciseList();
  });

  var browseEl = document.getElementById("exercise-browse");
  if (browseEl) {
    browseEl.addEventListener("click", function (e) {
      var vgroup = e.target.closest("[data-ex-vgroup]");
      if (vgroup) {
        pickVocabGroup = vgroup.getAttribute("data-ex-vgroup") === "theme" ? "theme" : "core";
        pickVocabBook = "";
        pickVocabRange = "";
        // ponytail: keep checks — cross-book multi-select
        renderExerciseList();
        return;
      }
      var vbook = e.target.closest("[data-ex-vbook]");
      if (vbook) {
        pickVocabBook = vbook.getAttribute("data-ex-vbook") || "";
        pickVocabRange = "";
        renderExerciseList();
        return;
      }
      var vrange = e.target.closest("[data-ex-vrange]");
      if (vrange) {
        pickVocabRange = vrange.getAttribute("data-ex-vrange") || "";
        renderExerciseList();
        return;
      }
      var volBtn = e.target.closest("[data-ex-vol]");
      if (volBtn) {
        pickVol = volBtn.getAttribute("data-ex-vol") || "";
        pickTest = "";
        renderExerciseList();
        return;
      }
      var testBtn = e.target.closest("[data-ex-test]");
      if (testBtn) {
        pickTest = testBtn.getAttribute("data-ex-test") || "";
        renderExerciseList();
        return;
      }
      var skillBtn = e.target.closest("[data-ex-skill]");
      if (skillBtn) {
        exerciseSkill = skillBtn.getAttribute("data-ex-skill") || "listening";
        renderExerciseList();
        return;
      }
      var qtypeBtn = e.target.closest("[data-ex-qtype]");
      if (qtypeBtn) {
        pickQType = qtypeBtn.getAttribute("data-ex-qtype") || "";
        pickTest = "";
        renderExerciseList();
        return;
      }
      var sceneBtn = e.target.closest("[data-ex-scene]");
      if (sceneBtn) {
        pickScene = sceneBtn.getAttribute("data-ex-scene") || "";
        renderExerciseList();
        return;
      }
      var diffBtn = e.target.closest("[data-ex-diff]");
      if (diffBtn) {
        pickDiff = diffBtn.getAttribute("data-ex-diff") || "";
        pickTest = "";
        renderExerciseList();
      }
    });
  }

  document.getElementById("select-all-students").addEventListener("click", function () {
    students.forEach(function (s) { selectedStudents[s.id] = true; });
    renderStudentList();
  });
  document.getElementById("clear-students").addEventListener("click", function () {
    selectedStudents = {};
    renderStudentList();
  });

  document.getElementById("student-list").addEventListener("change", function (e) {
    var t = e.target;
    if (!t || !t.getAttribute("data-student")) return;
    var id = Number(t.getAttribute("data-student"));
    if (t.checked) selectedStudents[id] = true;
    else delete selectedStudents[id];
    document.getElementById("student-picked").textContent =
      "đã chọn " + Object.keys(selectedStudents).length + " người";
  });

  document.getElementById("exercise-list").addEventListener("change", function (e) {
    var t = e.target;
    if (!t) return;
    var suite = t.getAttribute("data-suite");
    if (suite) {
      suiteIdsOf(suite).forEach(function (id) {
        if (t.checked) selectedExercises[id] = true;
        else delete selectedExercises[id];
      });
    } else if (t.getAttribute("data-exercise")) {
      var id = t.getAttribute("data-exercise");
      if (t.checked) selectedExercises[id] = true;
      else delete selectedExercises[id];
      if (isVocabBrowse()) updateExercisePicked();
    } else {
      return;
    }
    updateExercisePicked();
  });

  viewEl.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-detail]");
    if (btn) openDetail(Number(btn.getAttribute("data-detail")));
    if (e.target.id === "month-prev") {
      monthCursor.setMonth(monthCursor.getMonth() - 1);
      renderMonth();
    }
    if (e.target.id === "month-next") {
      monthCursor.setMonth(monthCursor.getMonth() + 1);
      renderMonth();
    }
  });

  document.getElementById("delete-event-btn").addEventListener("click", function () {
    if (!detailEventId) return;
    if (!confirm("Xác nhậnXóanênNhiệm vụ?Học viêncuối sẽđồng bộbiến mất.")) return;
    T.api("/api/calendar/events/" + detailEventId, { method: "DELETE" })
      .then(function () {
        closeDetail();
        load();
      })
      .catch(function (e) { alert(e.message); });
  });

  document.getElementById("create-form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    showMsg("");
    var type = document.getElementById("f-type").value;
    var targetStudentIds = Object.keys(selectedStudents).map(Number);
    if (!targetStudentIds.length) {
      showMsg("mờiít nhấtChọnmộtthuật ngữ cổ logicđược sinh");
      return;
    }
    var fileInput = document.getElementById("f-html");
    var file = fileInput && fileInput.files && fileInput.files[0];
    if (file && type !== "ASSIGNMENT") {
      showMsg("chỉ cóLuyện tậpBài tậpcó thểTải lên HTML");
      return;
    }
    if (file && !/\.html?$/i.test(file.name)) {
      showMsg("hầu nhưtán thành .html tài liệu");
      return;
    }
    if (file && file.size > 2 * 1024 * 1024) {
      showMsg("HTML không thểvượt qua 2MB");
      return;
    }

    function post(body) {
      showMsg("phát hànhhình thức kết hợp Trung Quốc…", null);
      return T.api("/api/calendar/events", { method: "POST", body: body })
        .then(function () {
          var n = targetStudentIds.length;
          showMsg("đãcấp " + n + " thuật ngữ cổ logicđược sinh · họmởở lại làmtương đương vớinhìn thấy", true);
          var job = type === "ASSIGNMENT" ? snapshotAssignPrint(body, file) : null;
          closeCreate();
          load();
          if (job && confirm("liệu có hay khôngcầnđóng dấuHọc viênNhiệm vụdanh sách?")) printAssignList(job);
        })
        .catch(function (e) { showMsg(e.message, false); });
    }

    var linkedIds = type === "ASSIGNMENT" && !file ? Object.keys(selectedExercises) : [];
    var pack = type === "ASSIGNMENT" && !file ? cdtPackForCat(exerciseCat) : "";
    if (pack === "vocab-quiz") {
      if (!linkedIds.length) {
        showMsg("mờiít nhấtchọn một hoặc nhiều lựa chọn từ danh sách 1 dùng trong List", false);
        return;
      }
      for (var vi = 0; vi < linkedIds.length; vi++) {
        if (!parseVocabRef(linkedIds[vi])) {
          showMsg("kho từChọnkhông hợp lệ,mờilạichọn một hoặc nhiều lựa chọn từ danh sách List", false);
          return;
        }
      }
    }

    var startTime = fromLocalInput(document.getElementById("f-start").value);
    var dueTime = fromLocalInput(document.getElementById("f-due").value);
    if (type === "ASSIGNMENT" && !startTime && !dueTime) {
      showMsg("mờiCài đặtBắt đầuThời giancó thểHạnThời gian", false);
      return;
    }

    var body = {
      title: document.getElementById("f-title").value.trim(),
      description: "",
      eventType: type,
      startTime: startTime,
      dueTime: dueTime,
      targetStudentIds: targetStudentIds,
      linkedExerciseIds: linkedIds,
      cdtPack: pack
    };

    if (file) {
      var reader = new FileReader();
      reader.onload = function () {
        body.htmlContent = String(reader.result || "");
        body.htmlFileName = file.name;
        post(body);
      };
      reader.onerror = function () { showMsg("của máy tínhtài liệuThất bại"); };
      reader.readAsText(file);
      return;
    }
    post(body);
  });

  var htmlInput = document.getElementById("f-html");
  if (htmlInput) {
    htmlInput.addEventListener("change", function () {
      var f = this.files && this.files[0];
      var hint = document.getElementById("html-file-hint");
      if (!hint) return;
      if (!f) {
        hint.textContent = "Tải lênhọcó ưu tiêncó hiệu lực;Học viênsẽ tồn tại trạm bên trongmởlàm họ.tiền tố có thểbên dướichọn một hoặc nhiều lựa chọn từ danh sáchtrang webhiện cóLuyện tập.";
        return;
      }
      hint.textContent = "đãChọn:" + f.name + "(" + Math.round(f.size / 1024) + " KB)· sẽcó ưu tiêncó hiệu lực,bên dướichọn một hoặc nhiều lựa chọn từ danh sáchsẽ chănbỏ qua";
    });
  }

  load();
})();
