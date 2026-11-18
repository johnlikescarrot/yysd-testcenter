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
    return Y && Y.esc ? Y.esc(String(s == null ? "" : s)) : String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function needAuth() {
    if (!A || !A.getToken || !A.getToken()) {
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
            '<span class="vs-card__meta">Tiến độ ' + done + " / " + total + " List</span>" +
            "</a>";
        }).join("")
      : '<p class="vs-empty">giá sáchvẫn như trướctrống không.trước điThêmmột hình thức kết hợp gốc biến thể cũ của viết tắt của quán bar từ mượn phục vụ đồ uống.</p>';

    content.innerHTML =
      '<div class="vs-hero bento-panel">' +
        '<h1 class="bento-panel__title">tôikho từgiá sách</h1>' +
        '<p class="bento-panel__desc">trở thành thành viênbiến thể cũ của viết tắt của họtài nănghọcphát hiện.tiền tố có thểbất kỳ lúc nàoloại bỏ(họcTiến độcó thểkhôi phục thứ gì đó về trạng thái ban đầu).</p>' +
        '<div class="vs-actions">' +
          '<a class="btn btn--primary btn--sm" href="vocab-shelf.html?view=catalog">Thêmbiến thể cũ của viết tắt của</a>' +
          '<a class="btn btn--ghost btn--sm" href="zone.html?zone=study&s=vocab">← Khu vực Từ vựng</a>' +
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
    var id = raw.indexOf("theme:") === 0 ? raw.slice(6) : raw;
    id = id.toLowerCase();
    if (BOOK_EMOJI[id]) return BOOK_EMOJI[id];
    var label = String((b && b.label) || "");
    var hay = id + " " + label;
    if (/trường trung học phổ thông/.test(label) && (b && b.kind) === "main") return "📚";
    if (/chuyên biệt/.test(label)) return "🎯";
    if (/sáu cấp|cet-?6/i.test(hay)) return "📘";
    if (/cấp 4|cet-?4/i.test(hay)) return "📗";
    if (/cho một người bốn|TEM-8 hoặc Kỳ thi chuyên ngành tiếng Anh cấp 8/i.test(hay)) return "🎓";
    if (/dự thi đầu vào chương trình sau đại học/i.test(hay)) return "📖";
    if (/nâng bằng tay họ|toefl/i.test(hay)) return "✈️";
    if (/IELTS Hệ thống Kiểm tra Tiếng Anh Quốc tế|ielts/i.test(hay)) return "🌏";
    if (/TOEIC Bài kiểm tra tiếng Anh giao tiếp quốc tế|toeic/i.test(hay)) return "🪪";
    if (/hóa học/.test(label)) return "🧪";
    if (/Địa lí/.test(label)) return "🗺️";
    if (/toán học/.test(label)) return "🔢";
    if (/vật lý/.test(label)) return "⚛️";
    if (/động vật/.test(label)) return "🐾";
    if (/thực vật/.test(label)) return "🌿";
    if (/ăn uống|món ngon|thực phẩm/.test(label)) return "🍜";
    if (/thành phố/.test(label)) return "🏙️";
    if (/đi ra đâu đó chuyến đi ngắn|Du lịch|kết nối/.test(label)) return "🚗";
    if (/giáo dục khoa học|Giáo dục/.test(label)) return "🔬";
    if (/Nghề nghiệp|nơi làm việc/.test(label)) return "💼";
    if (/ngày lễ/.test(label)) return "🎉";
    if (/văn học|nghệ thuật/.test(label)) return "🎨";
    if (/Thể thao/.test(label)) return "⚽";
    if (/trò chơi/.test(label)) return "🎮";
    if (/phim và truyền hình|sét hình ảnh/.test(label)) return "🎬";
    if (/âm nhạc|phát sóng/.test(label)) return "🎵";
    if (/cụm từ ngữ pháp/.test(label)) return "💬";
    if (/Collins tên/.test(label)) return "⭐";
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
        var added = !!onShelf[b.id];
        var wc = b.wordCount != null ? (b.wordCount + " biến thể cũ của · ") : "";
        return '<div class="vs-bento-tile' + (added ? " is-on-shelf" : "") +
          '" data-id="' + esc(b.id) + '">' +
          '<span class="vs-bento-emoji" aria-hidden="true">' + bookEmoji(b) + "</span>" +
          "<b class=\"vs-bento-title\">" + esc(b.label) + "</b>" +
          '<span class="vs-bento-meta">' + esc(wc + b.listCount + " List · " + (b.tag || b.kind)) +
          "</span>" +
          (added
            ? '<button type="button" class="btn btn--ghost btn--sm" data-act="remove">di chuyểnxuất bản sáchchống đỡ</button>'
            : '<button type="button" class="btn btn--primary btn--sm" data-act="add">trở thành thành viêngiá sách</button>') +
          "</div>";
      }).join("");
      content.innerHTML =
        '<div class="vs-hero bento-panel">' +
          '<h1 class="bento-panel__title">Thêmbiến thể cũ của viết tắt của</h1>' +
          '<p class="bento-panel__desc">trường trung học phổ thông / cấp 4 / IELTS Hệ thống Kiểm tra Tiếng Anh Quốc tếchuyên biệtPhân loạiChủ đềbiến thể cũ của viết tắt của họ biến thể củacó sẵn.</p>' +
          '<div class="vs-actions">' +
            '<a class="btn btn--ghost btn--sm" href="vocab-shelf.html">← tôigiá sách</a>' +
            '<label class="catalog-search vs-search"><input type="search" id="vs-q" placeholder="Tìm kiếmbiến thể cũ của viết tắt của" value="' +
              esc(q) + '"></label>' +
          "</div>" +
        "</div>" +
        '<div class="vs-bento" id="vs-list">' +
          (tiles || '<p class="vs-empty">không cóGhép nốibiến thể cũ của viết tắt của</p>') +
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
            alert((err && err.message) || "làm việcThất bại");
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
        ? "đã học hoàn thành"
        : (l.wordIdx > 0 ? ("học được điều gì đó " + (l.wordIdx + 1) + " biến thể cũ của") : "Chưa bắt đầu");
      var wc = l.wordCount != null ? l.wordCount + " biến thể cũ của · " : "";
      return '<a class="vs-list-row" href="vocab-learn.html?book=' + encodeURIComponent(book.id) +
        "&list=" + encodeURIComponent(l.id) + '">' +
        "<div><b>" + esc(l.label) + "</b>" +
        '<span class="vs-row__meta">' + esc(wc + hint) + "</span></div>" +
        '<span class="vs-go">' + (l.done ? "Ôn tập ›" : "học ›") + "</span></a>";
    }).join("");

    content.innerHTML =
      '<div class="vs-hero bento-panel">' +
        '<h1 class="bento-panel__title">' + esc(book.label || book.id) + "</h1>" +
        '<p class="bento-panel__desc">' + esc((book.listCount || 0) + " dùng trong List · điểm mở ngoại động từ hoặc nội động từBắt đầuhọc") + "</p>" +
        '<div class="vs-actions">' +
          '<a class="btn btn--ghost btn--sm" href="vocab-shelf.html">← giá sách</a>' +
          '<button type="button" class="btn btn--ghost btn--sm" id="vs-remove">di chuyểnxuất bản sáchchống đỡ</button>' +
          '<a class="btn btn--ghost btn--sm" href="vocab-quiz.html?book=' +
            encodeURIComponent(book.id) + '">Từ vựngphát hiện</a>' +
        "</div>" +
      "</div>" +
      '<div class="vs-list">' + rows + "</div>";

    document.getElementById("vs-remove").onclick = function () {
      if (!confirm("di chuyển đi rahọc giả hoặc học trò thời phong kiến Trung QuốchọTiến độsẽkhôi phục thứ gì đó về trạng thái ban đầu,rõ ràng?")) return;
      api("/api/vocab-shelf/remove", { method: "POST", body: { bookId: book.id } })
        .then(function () { location.href = "vocab-shelf.html"; })
        .catch(function (e) { alert((e && e.message) || "loại bỏThất bại"); });
    };
  }

  function boot() {
    if (!needAuth()) return;
    content.innerHTML = '<div class="state state--brand"><div class="spinner spinner--brand"></div>Đang tải…</div>';

    if (bookParam) {
      api("/api/vocab-shelf/book?bookId=" + encodeURIComponent(bookParam))
        .then(renderBook)
        .catch(function (e) {
          content.innerHTML = '<div class="state"><p>' + esc((e && e.message) || "Tải thất bại") +
            '</p><p><a class="btn btn--primary btn--sm" href="vocab-shelf.html">xoay vònggiá sách</a></p></div>';
        });
      return;
    }

    Promise.all([
      api("/api/vocab-shelf/bookshelf"),
      view === "catalog" ? api("/api/vocab-shelf/catalog") : Promise.resolve(null)
    ]).then(function (pair) {
      if (view === "catalog") renderCatalog(pair[1], pair[0]);
      else renderShelf(pair[0]);
    }).catch(function (e) {
      content.innerHTML = '<div class="state"><p>' + esc((e && e.message) || "Tải thất bại") + "</p></div>";
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
