/* vocab-shelf-ui.js — bookshelf hub + book list picker */
(function () {
  "use strict";
  var Y = window.YYSD;
  var A = window.YYSD_AUTH;
  var content = document.getElementById("content");
  var params = new URLSearchParams(location.search);
  var bookParam = (params.get("book") || "").trim();
  var view = (params.get("view") || "").trim(); // "" | catalog

  function esc(s) {
    return Y && Y.esc? Y.esc(String(s == null? "": s)): String(s == null? "": s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function needAuth() {
    if (!A ||!A.getToken ||!A.getToken()) {
      location.href = "login.html?next=" + encodeURIComponent(location.pathname + location.search);
      return false;
    }
    return true;
  }

  function api(path, opts) {
    return A.api(path, opts || {});
  }

  function renderShelf(shelf) {
    var books = (shelf && shelf.books) || [];
    var cards = books.length
      ? books.map(function (b) {
          var meta = b.book || {};
          var done = b.doneLists || 0;
          var total = meta.listCount || 0;
          return '<a class="vs-card" href="vocab-shelf.html?book=' + encodeURIComponent(b.bookId) + '">' +
            '<span class="vs-card__tag">' + esc(meta.tag || meta.kind || "") + "</span>" +
            '<b class="vs-card__title">' + esc(meta.label || b.bookId) + "</b>" +
            '<span class="vs-card__meta"> Tiến độ ' + done + " / " + total + " List</span>" +
            "</a>";
        }).join("")
      : '<p class="vs-empty"> giá sách hay trống không. đi trước tăng thêm một quyển từ sách nhé. </p>';

    content.innerHTML =
      '<div class="vs-hero bento-panel">' +
        '<h1 class="bento-panel__title"> của tôi từ kho giá sách </h1>' +
        '<p class="bento-panel__desc"> gia nhập từ lời bạt mới có thể Học tập và Đánh giá. có thể tùy thời dời trừ (Học tập Tiến độ sẽ thành số 0). </p>' +
        '<div class="vs-actions">' +
          '<a class="btn btn--primary btn--sm" href="vocab-shelf.html?view=catalog"> tăng thêm từ sách </a>' +
          '<a class="btn btn--ghost btn--sm" href="zone.html?zone=study&s=vocab">← Khu từ vựng </a>' +
        "</div>" +
      "</div>" +
      '<div class="vs-grid">' + cards + "</div>";
  }

  // ponytail: id→emoji map; theme ids arrive as "theme:chem"
  var BOOK_EMOJI = {
    gaozhong: "📚",
    cet4: "📗",
    "cet4-lite": "📘",
    special: "🎯",
    cet6: "📘",
    tem: "🎓",
    kaoyan: "📖",
    gaokao: "🏫",
    bec: "💼",
    gmat: "📊",
    gre: "🧠",
    sat: "✏️",
    toeic: "🪪",
    toefl: "✈️",
    ielts: "🌏",
    primary: "🌱",
    junior: "🚌",
    senior: "🎒",
    nce: "📕",
    oxford3000: "📙",
    collins: "⭐",
    phrases: "💬",
    chem: "🧪",
    geo: "🗺️",
    math: "🔢",
    phys: "⚛️",
    animals: "🐾",
    plants: "🌿",
    food: "🍜",
    urban: "🏙️",
    travel: "🚗",
    edu: "🔬",
    work: "💼",
    festivals: "🎉",
    literature: "🎨",
    sports: "⚽",
    game: "🎮",
    film: "🎬",
    music: "🎵"
  };
  var TAG_EMOJI = {
    exam: "📗",
    abroad: "✈️",
    k12: "🎒",
    learning: "📖",
    subject: "📐",
    nature: "🌿",
    life: "🏠",
    arts: "🎭",
    media: "📺"
  };

  function bookEmoji(b) {
    var raw = String((b && b.id) || "");
    var id = raw.indexOf("theme:") === 0? raw.slice(6): raw;
    id = id.toLowerCase();
    if (BOOK_EMOJI[id]) return BOOK_EMOJI[id];
    var label = String((b && b.label) || "");
    var hay = id + " " + label;
    if (/ THPT /.test(label) && (b && b.kind) === "main") return "📚";
    if (/ Chuyên sâu /.test(label)) return "🎯";
    if (/ Đại học B2 |cet-?6/i.test(hay)) return "📘";
    if (/ Đại học B1 |cet-?4/i.test(hay)) return "📗";
    if (/ Chuyên ngữ B2 | Chuyên ngữ C1 /i.test(hay)) return "🎓";
    if (/ Sau đại học /i.test(hay)) return "📖";
    if (/ TOEFL |toefl/i.test(hay)) return "✈️";
    if (/ IELTS |ielts/i.test(hay)) return "🌏";
    if (/ TOEIC |toeic/i.test(hay)) return "🪪";
    if (/ Hóa học /.test(label)) return "🧪";
    if (/ Địa lý /.test(label)) return "🗺️";
    if (/ Toán học /.test(label)) return "🔢";
    if (/ Vật lý /.test(label)) return "⚛️";
    if (/ Động vật /.test(label)) return "🐾";
    if (/ Thực vật /.test(label)) return "🌿";
    if (/ Ẩm thực | Ẩm thực | Thực phẩm /.test(label)) return "🍜";
    if (/ Đô thị /.test(label)) return "🏙️";
    if (/ Di chuyển | Du lịch | Giao thông /.test(label)) return "🚗";
    if (/ Khoa học & Giáo dục | Giáo dục /.test(label)) return "🔬";
    if (/ Nghề nghiệp | Công sở /.test(label)) return "💼";
    if (/ Lễ hội /.test(label)) return "🎉";
    if (/ Văn học | Nghệ thuật /.test(label)) return "🎨";
    if (/ Thể thao /.test(label)) return "⚽";
    if (/ Trò chơi /.test(label)) return "🎮";
    if (/ Điện ảnh & Truyền hình | Điện ảnh /.test(label)) return "🎬";
    if (/ Âm nhạc | Phát thanh /.test(label)) return "🎵";
    if (/ Cụm từ /.test(label)) return "💬";
    if (/ Collins /.test(label)) return "⭐";
    var tag = String((b && b.tag) || "").toLowerCase();
    if (TAG_EMOJI[tag]) return TAG_EMOJI[tag];
    return "📗";
  }

  function renderCatalog(catalog, shelf) {
    var onShelf = {};
    ((shelf && shelf.books) || []).forEach(function (b) { onShelf[b.bookId] = true; });
    var q = "";
    function paint(filter) {
      var books = (catalog.books || []).filter(function (b) {
        if (!filter) return true;
        var hay = (b.label + " " + b.id + " " + (b.tag || "")).toLowerCase();
        return hay.indexOf(filter.toLowerCase()) >= 0;
      });
      var tiles = books.map(function (b) {
        var added =!!onShelf[b.id];
        var wc = b.wordCount!= null? (b.wordCount + " từ · "): "";
        return '<div class="vs-bento-tile' + (added? " is-on-shelf": "") +
          '" data-id="' + esc(b.id) + '">' +
          '<span class="vs-bento-emoji" aria-hidden="true">' + bookEmoji(b) + "</span>" +
          "<b class=\"vs-bento-title\">" + esc(b.label) + "</b>" +
          '<span class="vs-bento-meta">' + esc(wc + b.listCount + " List · " + (b.tag || b.kind)) +
          "</span>" +
          (added
            ? '<button type="button" class="btn btn--ghost btn--sm" data-act="remove"> dời ra giá sách </button>'
            : '<button type="button" class="btn btn--primary btn--sm" data-act="add"> thêm vào kho truyện </button>') +
          "</div>";
      }).join("");
      content.innerHTML =
        '<div class="vs-hero bento-panel">' +
          '<h1 class="bento-panel__title"> tăng thêm từ sách </h1>' +
          '<p class="bento-panel__desc"> THPT / Đại học B1 / IELTS Chuyên sâu và phân loại từ chủ đề sách bày ra có thể chọn. </p>' +
          '<div class="vs-actions">' +
            '<a class="btn btn--ghost btn--sm" href="vocab-shelf.html">← giá sách của tôi </a>' +
            '<label class="catalog-search vs-search"><input type="search" id="vs-q" placeholder=" tìm kiếm từ sách " value="' +
              esc(q) + '"></label>' +
          "</div>" +
        "</div>" +
        '<div class="vs-bento" id="vs-list">' +
          (tiles || '<p class="vs-empty"> không có thất phối từ sách </p>') +
        "</div>";

      var input = document.getElementById("vs-q");
      if (input) {
        input.oninput = function () {
          q = input.value || "";
          paint(q);
          var el = document.getElementById("vs-q");
          if (el) { el.focus(); el.setSelectionRange(q.length, q.length); }
        };
      }
      document.getElementById("vs-list").onclick = function (e) {
        var btn = e.target.closest("button[data-act]");
        if (!btn) return;
        var row = btn.closest("[data-id]");
        var id = row && row.getAttribute("data-id");
        if (!id) return;
        var act = btn.getAttribute("data-act");
        btn.disabled = true;
        api("/api/vocab-shelf/" + act, { method: "POST", body: { bookId: id } })
          .then(function () {
            if (act === "add") onShelf[id] = true;
            else delete onShelf[id];
            paint(q);
          })
          .catch(function (err) {
            alert((err && err.message) || " thao tác thất bại ");
            btn.disabled = false;
          });
      };
    }
    paint("");
  }

  function renderBook(detail) {
    var book = detail.book || {};
    var lists = detail.lists || [];
    var rows = lists.map(function (l) {
      var hint = l.done
        ? " Đã học hết "
        : (l.wordIdx > 0? (" học được thứ " + (l.wordIdx + 1) + " từ "): " Chưa bắt đầu ");
      var wc = l.wordCount!= null? l.wordCount + " từ · ": "";
      return '<a class="vs-list-row" href="vocab-learn.html?book=' + encodeURIComponent(book.id) +
        "&list=" + encodeURIComponent(l.id) + '">' +
        "<div><b>" + esc(l.label) + "</b>" +
        '<span class="vs-row__meta">' + esc(wc + hint) + "</span></div>" +
        '<span class="vs-go">' + (l.done? " Ôn tập ›": " Học tập ›") + "</span></a>";
    }).join("");

    content.innerHTML =
      '<div class="vs-hero bento-panel">' +
        '<h1 class="bento-panel__title">' + esc(book.label || book.id) + "</h1>" +
        '<p class="bento-panel__desc">' + esc((book.listCount || 0) + " List · ấn mở Bắt đầu học ") + "</p>" +
        '<div class="vs-actions">' +
          '<a class="btn btn--ghost btn--sm" href="vocab-shelf.html">← giá sách </a>' +
          '<button type="button" class="btn btn--ghost btn--sm" id="vs-remove"> dời ra giá sách </button>' +
          '<a class="btn btn--ghost btn--sm" href="vocab-quiz.html?book=' +
            encodeURIComponent(book.id) + '"> Từ vựng Đánh giá </a>' +
        "</div>" +
      "</div>" +
      '<div class="vs-list">' + rows + "</div>";

    document.getElementById("vs-remove").onclick = function () {
      if (!confirm(" dời ra kẻ học sau tập Tiến độ đem thành số 0, Đồng ý? ")) return;
      api("/api/vocab-shelf/remove", { method: "POST", body: { bookId: book.id } })
        .then(function () { location.href = "vocab-shelf.html"; })
        .catch(function (e) { alert((e && e.message) || " dời trừ thất bại "); });
    };
  }

  function boot() {
    if (!needAuth()) return;
    content.innerHTML = '<div class="state state--brand"><div class="spinner spinner--brand"></div> Đang tải …</div>';

    if (bookParam) {
      api("/api/vocab-shelf/book?bookId=" + encodeURIComponent(bookParam))
        .then(renderBook)
        .catch(function (e) {
          content.innerHTML = '<div class="state"><p>' + esc((e && e.message) || "Tải dữ liệu thất bại") +
            '</p><p><a class="btn btn--primary btn--sm" href="vocab-shelf.html"> thư trả lời khung </a></p></div>';
        });
      return;
    }

    Promise.all([
      api("/api/vocab-shelf/bookshelf"),
      view === "catalog"? api("/api/vocab-shelf/catalog"): Promise.resolve(null)
    ]).then(function (pair) {
      if (view === "catalog") renderCatalog(pair[1], pair[0]);
      else renderShelf(pair[0]);
    }).catch(function (e) {
      content.innerHTML = '<div class="state"><p>' + esc((e && e.message) || "Tải dữ liệu thất bại") + "</p></div>";
    });
  }

  if (window.YYSD_DIAG_GATE) {
    window.YYSD_DIAG_GATE.ensure({ requireLogin: true }).then(function (ok) {
      if (ok) boot();
    });
  } else {
    boot();
  }
})();
