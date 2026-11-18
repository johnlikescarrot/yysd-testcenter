/* =========================================================================
   daily-word/stages.js - năm một bước: image / speaking / spelling / meaning / detail
   ========================================================================= */
(function (global) {
  "use strict";

  var DW = global.YYSD_DAILY_WORD;

  function placeholderSvg(word) {
    var letter = String(word || "?").charAt(0).toUpperCase();
    return "data:image/svg+xml," + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="#dbeafe"/><stop offset="100%" stop-color="#bfdbfe"/></linearGradient></defs>' +
      '<rect width="100%" height="100%" fill="url(#g)"/>' +
      '<text x="50%" y="52%" text-anchor="middle" font-size="180" font-family="Georgia,serif" fill="#1e3a5f">' +
      letter + "</text></svg>"
    );
  }

  function imgSrc(wordObj, bookId) {
    var key = DW.imageKey(bookId, wordObj.word);
    var cached = DW.getImages()[key];
    var url = cached || wordObj.imageUrl || "";
    return url ? DW.absMediaUrl(url) : placeholderSvg(wordObj.word);
  }

  function renderImage(host, ctx) {
    var w = ctx.word;
    var showZh = !!ctx.showHint;
    var canNext = !!ctx.canNext;
    host.innerHTML =
      '<div class="dw-stage dw-stage--image">' +
        '<div class="dw-card">' +
          '<div class="dw-card__img-wrap"><img class="dw-card__img" alt="" src="' + DW.esc(imgSrc(w, ctx.bookId)) + '"></div>' +
          '<div class="dw-card__body">' +
            '<button type="button" class="dw-def-play" data-act="play">nhấn phát sóng phát âm</button>' +
            '<div class="dw-word">' + DW.esc(w.word) + "</div>" +
            (w.ipa ? '<div class="dw-ipa">' + DW.esc(w.ipa) + "</div>" : "") +
            (showZh ? '<div class="dw-zh">' + DW.esc(w.meaning || "-") + "</div>" : "") +
          "</div>" +
        "</div>" +
        '<button type="button" class="dw-hint-btn" data-act="hint">' +
          (showZh ? " đã hiển thị ngôn ngữ Trung Quốc chỉ ra " : " hiển thị ngôn ngữ Trung Quốc chỉ ra(có thể nhấn trống)") +
        "</button>" +
        '<button type="button" class="dw-btn dw-btn--primary" data-act="to-speak"' +
          (canNext ? "" : " disabled") + ">bắt đầu gót chân dấu phẩy</button>" +
      "</div>";
  }

  function renderSpeaking(host, ctx) {
    var w = ctx.word;
    var rec = ctx.recording;
    var status = ctx.speakStatus || "";
    var tries = ctx.speakTries || 0;
    var canSkip = tries >= 3;
    host.innerHTML =
      '<div class="dw-stage dw-stage--speak">' +
        '<div class="dw-card dw-card--speak">' +
          '<div class="dw-card__img-wrap"><img class="dw-card__img" alt="" src="' + DW.esc(imgSrc(w, ctx.bookId)) + '"></div>' +
          '<div class="dw-card__body dw-card__body--speak">' +
            '<button type="button" class="dw-def-play" data-act="play">phát sóng phát âm tiêu chuẩn</button>' +
            '<div class="dw-word">' + DW.esc(w.word) + "</div>" +
            (w.ipa ? '<div class="dw-ipa">' + DW.esc(w.ipa) + "</div>" : "") +
          "</div>" +
        "</div>" +
        '<button type="button" class="dw-mic' + (rec ? " is-rec" : "") +
          '" data-act="mic" aria-label="' + (rec ? " thả ra chấm dứt " : " nhấn sống ghi âm ") + '">' +
          (rec ? "●" : "◎") +
        "</button>" +
        '<p class="dw-hint" id="dw-speak-hint">' +
          (rec ? " thả ra chấm dứt ghi âm " : (status || " nhấn sống microphone gót chân dấu phẩy, thả ra chấm dứt ")) +
        "</p>" +
        (canSkip
          ? '<button type="button" class="dw-btn dw-btn--ghost" data-act="skip-speak">nhảy qua và ký hiệu yếu</button>'
          : "") +
        (tries > 0 && !canSkip
          ? '<button type="button" class="dw-btn dw-btn--ghost" data-act="retry-speak">lại thử đầu tiên</button>'
          : "") +
      "</div>";
  }

  function renderSpelling(host, ctx) {
    var w = ctx.word;
    var feedback = ctx.spellFeedback || "";
    var reveal = ctx.spellReveal;
    host.innerHTML =
      '<div class="dw-stage dw-stage--spell">' +
        '<div class="dw-spell-head">' +
          '<img class="dw-spell-thumb" alt="" src="' + DW.esc(imgSrc(w, ctx.bookId)) + '">' +
          '<div class="dw-zh dw-zh--lg">' + DW.esc(w.meaning) + "</div>" +
        "</div>" +
        '<label class="dw-spell-label">đánh vần này từ' +
          '<input class="dw-spell-input" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" ' +
            'data-act="spell-input" value="' + DW.esc(ctx.spellValue || "") + '"' +
            (reveal ? " disabled" : "") + ">" +
        "</label>" +
        (feedback ? '<p class="dw-feedback">' + feedback + "</p>" : "") +
        (reveal
          ? '<p class="dw-answer">Đáp án đúng: <strong>' + DW.esc(w.word) + "</strong></p>"
          : '<button type="button" class="dw-btn dw-btn--primary" data-act="submit-spell">Nộp bài</button>') +
      "</div>";
  }

  function renderMeaning(host, ctx) {
    var w = ctx.word;
    var feedback = ctx.meaningFeedback || "";
    var reveal = ctx.meaningReveal;
    host.innerHTML =
      '<div class="dw-stage dw-stage--meaning">' +
        '<div class="dw-spell-head">' +
          '<img class="dw-spell-thumb" alt="" src="' + DW.esc(imgSrc(w, ctx.bookId)) + '">' +
          '<div>' +
            '<div class="dw-word" style="font-size:1.55rem;margin:0">' + DW.esc(w.word) + "</div>" +
            (w.ipa ? '<div class="dw-ipa">' + DW.esc(w.ipa) + "</div>" : "") +
          "</div>" +
        "</div>" +
        '<label class="dw-spell-label">viết đi ra ngôn ngữ Trung Quốc ý nghĩa' +
          '<input class="dw-spell-input dw-meaning-input" type="text" autocomplete="off" ' +
            'lang="vi" inputmode="text" spellcheck="false" ' +
            'data-act="meaning-input" placeholder=" ví dụ: chắc chắn của; công ty " value="' +
            DW.esc(ctx.meaningValue || "") + '"' +
            (reveal ? " disabled" : "") + ">" +
        "</label>" +
        (feedback ? '<p class="dw-feedback">' + feedback + "</p>" : "") +
        (reveal
          ? '<p class="dw-answer">tham khảo nghĩa của cái gì đó: <strong>' + DW.esc(w.meaning || "-") + "</strong></p>"
          : '<button type="button" class="dw-btn dw-btn--primary" data-act="submit-meaning">Nộp bài</button>') +
      "</div>";
  }

  function renderDetail(host, ctx) {
    var w = ctx.word;
    var isLast = ctx.isLast;
    var phrases = String(w.phrases || "").trim();
    var example = String(w.example || "").trim();
    host.innerHTML =
      '<div class="dw-stage dw-stage--detail">' +
        '<div class="dw-detail">' +
          '<div class="dw-word">' + DW.esc(w.word) + "</div>" +
          (w.ipa ? '<div class="dw-ipa">' + DW.esc(w.ipa) + "</div>" : "") +
          (w.pos ? '<span class="dw-pos">' + DW.esc(w.pos) + "</span>" : "") +
          '<p class="dw-zh dw-zh--lg">' + DW.esc(w.meaning) + "</p>" +
          (phrases ? '<div class="dw-block"><h3>Cụm đi kèm</h3><p>' + DW.esc(phrases) + "</p></div>" : "") +
          (example ? '<div class="dw-block"><h3>Câu ví dụ</h3><p>' + DW.esc(example) +
            '</p><button type="button" class="dw-btn dw-btn--ghost dw-btn--sm" data-act="play-ex">phát sóng câu ví dụ</button></div>' : "") +
        "</div>" +
        '<button type="button" class="dw-btn dw-btn--primary" data-act="next-word">' +
          (isLast ? " xem xét hôm nay thông báo " : " cái tiếp theo từ ") +
        "</button>" +
      "</div>";
  }

  function render(host, stage, ctx) {
    if (stage === "image") return renderImage(host, ctx);
    if (stage === "speaking") return renderSpeaking(host, ctx);
    if (stage === "spelling") return renderSpelling(host, ctx);
    if (stage === "meaning") return renderMeaning(host, ctx);
    if (stage === "detail") return renderDetail(host, ctx);
    host.innerHTML = '<p class="dw-fail">chưa biết giai đoạn</p>';
  }

  global.YYSD_DAILY_WORD_STAGES = {
    render: render,
    placeholderSvg: placeholderSvg,
    imgSrc: imgSrc
  };
})(typeof window !== "undefined" ? window : global);
