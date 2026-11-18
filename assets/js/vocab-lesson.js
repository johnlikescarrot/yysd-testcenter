/* =========================================================================
   vocab-lesson.js — YYSD«Từ vựngnhỏ môn học»động cơ từ mượn(Trung Quốcmột đăng ký nhiềuquốc gia láng giềngcơ chế,trạm bên tronglên một cấp)

   SCOPE(kế hoạchđồng ý ngầm,đãcăn chỉnh):
   - chủchiến trường:cơ chếtrạm bên trongKhu vực Từ vựng,ngâmbiến thể của,không phảiđộc lập App
   - thiết bị:điện thoại di độngcó ưu tiên,màn hình máy tínhtiền tố có thể sử dụng
   - LIST HTML rút lui họ«biến thể cũ của dừnghướng dẫn»(exam.html);chủ CTA tiến lên hình thức kết hợp gốcPhátthiết bị

   MECHANISM SPEC(8 chồng lên nhau → tiền tố có thểkhai thác tài nguyên):
   1. Path     → zone/vocab CTA chỉ vềhình thức kết hợp gốc đầu«Bắt đầu +N Kinh nghiệm»
   2. Lesson   → mỗi môn học 8 biến thể cũ của / ~12–16 câu / một họ một loại bỏ / đỉnh hàng ràoTiến độ
   3. Mix      → meaning_to_word | collocation | listen_meaning | example_cloze | scramble | type_spell
   4. Feedback → Nóibiến thể củakhen ngợi / dịu dàng và mềm mạisửa lỗi +«Tiếp tục»;họ đúng N họ
   5. Learn    → Bài tậpnhỏ môn học không cài;Câu saibao gồm trong một bộ sưu tập + từ tượng thanh đong chính sảnh tiền tố có thể lặp lại luyện tập
   6. Retry    → họ biến thể cũ của trao đổi họ khuôn từ tượng thanh đong chính sảnh lặp lại luyện tập(nhãn«Câu sailặp lại luyện tập»)
   7. Celebrate→ nhẹthanh toán:Kinh nghiệm + Tỉ lệ đúng + nhẹ họ chiến thắng + IELTS Hệ thống Kiểm tra Tiếng Anh Quốc tếmột dòng thơGợi ý
   8. Habit    → localStorage nhẹ họ chiến thắng(khôngđe dọađặt lại về không)

   DATA BRIDGE:
   - fetch library/{item.file} → trích xuất wordData tin học mảngnghĩa đenđo lường → Function toán tính một biểu thức
   - trường số:word, meaning, ipa?, acceptCN?, example?, phrases?

   URL:
   - Bài tập: vocab-lesson.html?id=<manifestId> | ?book=gaozhong|cet4|special
   - cuộc viễn chinhnhà thờ: ?from=realm&shrine=shrine-01
   - trại huấn luyện: ?from=realm&mode=camp
   ========================================================================= */
(function () {
  "use strict";
  var Y = window.YYSD;
  var CORE = window.YYSD_WORD_REALM;
  var STORY = window.YYSD_WORD_REALM_STORY;
  var SFX = window.YYSD_WORD_REALM_SFX;
  var params = new URLSearchParams(location.search);
  var idParam = (params.get("id") || "").trim();
  var bookParam = (params.get("book") || "").trim();
  var fromRealm = (params.get("from") || "") === "realm";
  var shrineParam = (params.get("shrine") || "").trim();
  var campMode = fromRealm && (params.get("mode") || "") === "camp";
  var realmEntry = !!(fromRealm || shrineParam || campMode);
  // cuộc viễn chinhchiến đấuhầu nhưtrụ sở chínhtrạm;Bài tậpnhỏ môn học không nhậnảnh hưởng
  if (realmEntry) {
    var A0 = window.YYSD_AUTH;
    if (!A0 || !A0.canWordRealm || !A0.canWordRealm()) {
      location.replace("zone.html?zone=study&s=vocab");
      return;
    }
  }

  var WORDS_PER_LESSON = 8;
  var CAMP_WORDS = 18;
  var REALM_WORDS_MIN = 20; // shrine pad + denser queue
  var HEARTS_MAX = 5; // homework
  var REALM_HEARTS = 4; // cuộc viễn chinhthay đổi hoặc thay thế biến thể cũ của:của hệ thống chịu lỗithay đổi hoặc thay thế ít
  var XP_PER_LESSON = 10;
  var XP_CAMP = 6;
  var ANSWER_SEC = 9;
  var ANSWER_SEC_SPELL = 14;
  var weekly = (CORE && CORE.weeklyTheme) ? CORE.weeklyTheme() : null;
  var STREAK_KEY = "yysd:vocab-lesson-streak";
  var PRAISE = ["cao nhất gậy!", "tuyệt vời!!", "xuất sắc thán từ!", "đúngngâm nga!", "xinh đẹp!", "núi Thái ở Sơn Đông biến thể của biến thể cũ của!"];
  var answerTimer = null;

  var root = document.getElementById("vl-root");
  var state = {
    item: null,
    book: null,
    shrineId: null,
    camp: false,
    title: "",
    words: [],
    queue: [],
    idx: 0,
    hearts: HEARTS_MAX,
    refilled: false,
    combo: 0,
    correct: 0,
    answered: 0,
    wrongBank: [],
    everWrong: [],
    startedAt: null,
    phase: "load", // load | play | feedback | celebrate | command
    selected: null,
    scramblePicked: [],
    freeRefillShown: false,
    battle: null, // realm chiến đấuhọtình trạng;Bài tậpnhỏ môn học làm với tư cách null
    timedOut: false
  };

  function battleMode() {
    return !!(state.battle && (state.shrineId || state.camp));
  }

  function esc(s) { return Y.esc(String(s == null ? "" : s)); }

  function libraryUrl(file) {
    var base = location.pathname.replace(/\/[^/]*$/, "/");
    return base + "library/" + String(file || "").replace(/^\//, "");
  }

  // ponytail: trusted local LIST HTML only — Function beats a half-baked JSON rewriter
  function parseWordData(html) {
    var m = html.match(/(?:const|var|let)\s+wordData\s*=\s*(\[[\s\S]*?\]);/);
    if (!m) return [];
    try {
      var arr = Function('"use strict"; return (' + m[1] + ");")();
      if (!Array.isArray(arr)) return [];
      return arr.map(function (w) {
        var word = String(w.word || "").trim();
        var meaning = String(w.meaning || "").trim();
        if (!word || !meaning) return null;
        return {
          word: word,
          meaning: meaning,
          ipa: String(w.ipa || "").trim(),
          acceptCN: Array.isArray(w.acceptCN) ? w.acceptCN : [],
          example: String(w.example || "").trim(),
          phrases: String(w.phrases || w.collocations || "").trim(),
          collocations: String(w.collocations || w.phrases || "").trim(),
          mnemonic: String(w.mnemonic || "").trim(),
          derivatives: String(w.derivatives || "").trim(),
          distinguish: String(w.distinguish || "").trim(),
          pos: String(w.pos || "").trim()
        };
      }).filter(Boolean);
    } catch (e) {
      return [];
    }
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function pickDistractors(pool, target, key, n) {
    var others = pool.filter(function (w) {
      return String(w[key]).toLowerCase() !== String(target[key]).toLowerCase();
    });
    return shuffle(others).slice(0, n);
  }

  function escapeRe(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /** Split "en(zh), en(zh)" → [{en, zh}, ...] */
  function parsePhrasePairs(phrases) {
    var raw = String(phrases || "").trim();
    if (!raw) return [];
    return raw.split(/[,,]/).map(function (part) {
      part = part.trim();
      if (!part) return null;
      var m = part.match(/^(.+?)\s*[((]\s*(.+?)\s*[))]\s*$/);
      if (!m) return null;
      return { en: m[1].trim(), zh: m[2].trim() };
    }).filter(Boolean);
  }

  function englishOnly(example) {
    var s = String(example || "").trim();
    if (!s) return "";
    var cut = s.search(/[((]/);
    if (cut >= 0) s = s.slice(0, cut);
    return s.trim();
  }

  /** Blank first occurrence of word (multi-word ok). null if not found. */
  function blankWord(text, word) {
    word = String(word || "").trim();
    text = String(text || "");
    if (!word || !text) return null;
    var parts = word.split(/\s+/).map(escapeRe);
    var re = new RegExp("\\b" + parts.join("\\s+") + "\\b", "i");
    if (!re.test(text)) return null;
    return text.replace(re, "____");
  }

  function wordChoiceOptions(word, pool) {
    var opts = shuffle([word].concat(pickDistractors(pool, word, "word", 3))).slice(0, 4);
    while (opts.length < 4 && pool.length) {
      var extra = pool[Math.floor(Math.random() * pool.length)];
      if (!opts.some(function (o) { return o.word === extra.word; })) opts.push(extra);
    }
    return opts.map(function (o) { return { key: o.word, label: o.word }; });
  }

  function attachCloze(ex, blank, hintZh, pool) {
    ex.blank = blank;
    ex.hintZh = hintZh || "";
    ex.options = wordChoiceOptions(ex.word, pool);
    return ex;
  }

  function tryCollocation(ex, pool) {
    var raw = ex.word.collocations || ex.word.phrases;
    var pairs = shuffle(parsePhrasePairs(raw));
    for (var i = 0; i < pairs.length; i++) {
      var blank = blankWord(pairs[i].en, ex.word.word);
      if (blank) return attachCloze(ex, blank, pairs[i].zh, pool);
    }
    return null;
  }

  function tryExampleCloze(ex, pool) {
    var blank = blankWord(englishOnly(ex.word.example), ex.word.word);
    if (!blank) return null;
    return attachCloze(ex, blank, "", pool);
  }

  /** ghi chép/dùng trong/phân biệt:tiết lộGợi ýmột văn bản bài viết,chọn ratương ứng vớiTừ vựng */
  function tryHintPick(ex, pool, field) {
    var hint = String(ex.word[field] || "").trim();
    if (!hint || hint.length < 4) return null;
    ex.hintZh = hint;
    ex.options = wordChoiceOptions(ex.word, pool);
    return ex;
  }

  function speak(word) {
    if (window.YysdWordAudio) {
      window.YysdWordAudio.speak(word);
      return;
    }
    if (!window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(word);
      u.lang = "en-GB";
      u.rate = 0.92;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  function lessonHref(item) {
    return "vocab-lesson.html?id=" + encodeURIComponent(item.id);
  }

  function guideHref(item) {
    return Y.fileHref(item, "");
  }

  function buildExercises(words, allPool, retry) {
    var types = [
      "meaning_to_word", "collocation", "listen_meaning", "example_cloze",
      "scramble", "mnemonic_pick", "derivative_pick", "distinguish_pick"
    ];
    var queue = [];
    words.forEach(function (w, i) {
      var type = retry
        ? (i % 2 === 0 ? "type_spell" : "meaning_to_word")
        : types[i % types.length];
      queue.push(makeExercise(type, w, allPool, retry));
      if (!retry && i % 3 === 2) {
        queue.push(makeExercise("type_spell", w, allPool, false));
      }
    });
    return shuffle(queue);
  }

  /** trại huấn luyện:của học sinh viết chính tả + cười cổ đại họdựa chủ yếu vào,khôngthúc đẩydòng chính của liên lạc */
  function buildCampExercises(words, allPool) {
    var queue = [];
    words.forEach(function (w, i) {
      queue.push(makeExercise(i % 2 === 0 ? "type_spell" : "listen_meaning", w, allPool, false));
      queue.push(makeExercise(i % 2 === 0 ? "collocation" : "scramble", w, allPool, false));
    });
    return shuffle(queue);
  }

  /** cuộc viễn chinhnhà thờ:mỗi biến thể cũ của họ chặt đầu như một hình thức tử hình,họ đo lườngkéo lên */
  function buildRealmExercises(words, allPool) {
    var types = ["meaning_to_word", "collocation", "listen_meaning", "example_cloze", "scramble", "type_spell"];
    var queue = [];
    words.forEach(function (w, i) {
      queue.push(makeExercise(types[i % types.length], w, allPool, false));
      queue.push(makeExercise(types[(i + 2) % types.length], w, allPool, false));
      queue.push(makeExercise(types[(i + 4) % types.length], w, allPool, false));
    });
    return shuffle(queue);
  }

  function padRealmWords(lex, words, minN) {
    var seen = {};
    var out = [];
    (words || []).forEach(function (w) {
      var k = String(w.word || "").toLowerCase();
      if (!k || seen[k]) return;
      seen[k] = true;
      out.push(w);
    });
    // sửa biến thể cũ củacó ưu tiênhình thức kết hợp Trung Quốcvô cùng khó khăn,không đủlạirơi xuốnghọ nhà kho
    var hard = (lex.words || []).filter(function (w) { return (w.tier || 1) >= 2; });
    var pool = shuffle(hard.length >= minN ? hard : (lex.words || []).slice());
    for (var i = 0; i < pool.length && out.length < minN; i++) {
      var k2 = String(pool[i].word || "").toLowerCase();
      if (!k2 || seen[k2]) continue;
      seen[k2] = true;
      out.push(pool[i]);
    }
    return out;
  }

  function makeExercise(type, word, pool, retry) {
    var ex = { type: type, word: word, retry: !!retry, options: null, letters: null, blank: "", hintZh: "" };
    if (type === "collocation") {
      if (tryCollocation(ex, pool)) return ex;
      return makeExercise("meaning_to_word", word, pool, retry);
    }
    if (type === "example_cloze") {
      if (tryExampleCloze(ex, pool)) return ex;
      return makeExercise("meaning_to_word", word, pool, retry);
    }
    if (type === "mnemonic_pick") {
      if (tryHintPick(ex, pool, "mnemonic")) return ex;
      return makeExercise("meaning_to_word", word, pool, retry);
    }
    if (type === "derivative_pick") {
      if (tryHintPick(ex, pool, "derivatives")) return ex;
      return makeExercise("collocation", word, pool, retry);
    }
    if (type === "distinguish_pick") {
      if (tryHintPick(ex, pool, "distinguish")) return ex;
      return makeExercise("example_cloze", word, pool, retry);
    }
    if (type === "meaning_to_word" || type === "listen_meaning") {
      ex.options = wordChoiceOptions(word, pool);
    } else if (type === "word_to_meaning") {
      var mopts = shuffle([word].concat(pickDistractors(pool, word, "meaning", 3))).slice(0, 4);
      ex.options = mopts.map(function (o) { return { key: o.word, label: o.meaning }; });
    } else if (type === "scramble") {
      var letters = word.word.replace(/\s+/g, "").toLowerCase().split("");
      if (letters.length > 12) letters = letters.slice(0, 12);
      ex.letters = shuffle(letters);
      if (ex.letters.join("") === word.word.replace(/\s+/g, "").toLowerCase()) {
        ex.letters = shuffle(ex.letters);
      }
    }
    return ex;
  }

  function promptFor(ex) {
    if (ex.retry) {
      if (ex.type === "type_spell") return "Câu sailặp lại luyện tập · cười cổ đại âm thanh viếtTừ vựng";
      return "Câu sailặp lại luyện tập · chọn raĐúngTừ vựng";
    }
    if (ex.type === "meaning_to_word") return "chọn ratương ứng vớiTiếng AnhTừ vựng";
    if (ex.type === "word_to_meaning") return "chọn raĐúngTiếng TrungNghĩa";
    if (ex.type === "listen_meaning") return "cười cổ đại âm thanh,chọn raĐúngTừ vựng";
    if (ex.type === "collocation") return "sửa họthường thấyghép đôi";
    if (ex.type === "example_cloze") return "rễ biến thể củacâu ví dụchọn rakhai quậtTừ vựng";
    if (ex.type === "mnemonic_pick") return "rễ biến thể củaGhi nhớGợi ýchọn raTừ vựng";
    if (ex.type === "derivative_pick") return "rễ biến thể củatừ phái sinhchọn rahọ biến thể cũ của";
    if (ex.type === "distinguish_pick") return "rễ biến thể củaphân biệt và phân tíchGiải thíchchọn raTừ vựng";
    if (ex.type === "scramble") return "cầmchữ cái của bảng chữ cáimột hàng họĐúngTừ vựng";
    if (ex.type === "type_spell") return "cười cổ đại âm thanh,viết đi raTiếng Anhđánh vần";
    return "ChọnĐáp án đúng";
  }

  function ieltsHint(word) {
    var m = word.meaning || "";
    if (/khí tượng khí hậu|Môi trường|gây ô nhiễm/.test(m)) return "loại nàybiến thể cũ của họxuất hiệntồn tạiNghe Section 3/4 ĐọcMôi trườngChủ đề.";
    if (/bằng chứng|nghiên cứu|dữ liệu|Khoa học/.test(m)) return "Học thuậtbiến thể cũ của:ĐọcĐánh giáhọNghemột khóa bài giảngTần suất cao.";
    if (/áp lực|tập thể dục|ăn uống|Sức khỏe/.test(m)) return "Đời sốngTình huốngbiến thể cũ của:Nghe Section 1–2 Nói Part 1 được sử dụng phổ biến.";
    return "ghi chépghép đôiBỉ ghi chép cô đơn biến thể cũ của thay đổi hoặc thay thế ổn định——Viếtđồng nghĩathay thếbiến thể cũ của họtrực tiếpsử dụng dùng trong.";
  }

  /** Mythic combat tip for Word Realm (no exam framing). */
  function realmHint() {
    var lines = [
      "chữ cái của bảng chữ cáilà chỉ theo sau bởi danh từ kiếm hai lưỡi mũi giáo.ghi chép cho phépâm tiết,ngấu nghiến biến thể cũ của sau một mệnh đề giả định trong trường hợp đó có thểlùi lại.",
      "đánh liên tụckhiến kiếm hai lưỡi ánh sángtăng mạnh——Ghi nhớhọ chỉphản hồidũng cảmLặp lại.",
      "ngắn biến thể cũ của là chỉ theo sau bởi danh từdao găm,chiều dài biến thể cũ của là chỉ theo sau bởi danh từ lặp lại cạnh của lưỡi dao.hôm naybạn một lần nữa nhiều họ một chỗ ngồi cầu.",
      "thay thế chongười khácnhớmột dùng trong biến thể cũ của,ngôi sao mảnh vụn sau một mệnh đề giả định trong trường hợp đó có thể tồn tạilòng bàn taynhiều dừng một giây đơn vị thời gian."
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  }

  function renderShell() {
    var battle = battleMode();
    var hud = battle
      ? ('<header class="vl-battle-hud">' +
          '<a class="vl-x" id="vl-exit" href="#" aria-label="Đăng xuất">×</a>' +
          '<div class="vl-hp vl-hp--hero" id="vl-hp-hero">' +
            '<span class="vl-hp__label">dũng cảm</span>' +
            '<div class="vl-hp__track"><i id="vl-hp-hero-bar"></i></div>' +
            '<span class="vl-hp__n" id="vl-hp-hero-n"></span></div>' +
          '<div class="vl-hp vl-hp--enemy" id="vl-hp-enemy">' +
            '<span class="vl-hp__label" id="vl-enemy-name"></span>' +
            '<div class="vl-hp__track"><i id="vl-hp-enemy-bar"></i></div>' +
            '<span class="vl-hp__n" id="vl-hp-enemy-n"></span></div>' +
        "</header>" +
        '<div class="vl-arena" id="vl-arena" aria-hidden="true">' +
          '<div class="vl-enemy" id="vl-enemy"><span class="vl-enemy__glyph" id="vl-enemy-glyph"></span></div>' +
          '<div class="vl-float" id="vl-float" hidden></div>' +
        "</div>")
      : ('<header class="vl-top">' +
          '<a class="vl-x" id="vl-exit" href="#" aria-label="Đăng xuất">×</a>' +
          '<div class="vl-progress" aria-hidden="true"><div class="vl-progress__bar" id="vl-bar"></div></div>' +
          // ponytail: homework is learn+record, not hearts — realm keeps HP via battleMode
          '<div class="vl-top__meta" id="vl-top-meta" aria-live="polite"></div>' +
        "</header>");
    root.innerHTML =
      '<div class="vl' + (battle ? " vl--battle" : "") + '">' + hud +
        '<div class="vl-combo" id="vl-combo" hidden></div>' +
        '<main class="vl-main" id="vl-main"></main>' +
        '<footer class="vl-foot" id="vl-foot"></footer>' +
        '<div class="vl-modal" id="vl-modal" hidden></div>' +
      "</div>";
    if (battle) paintBattleHud(true);
    document.getElementById("vl-exit").addEventListener("click", function (e) {
      e.preventDefault();
      var back = exitHref();
      if (state.phase === "play" || state.phase === "feedback") {
        if (!confirm(battle ? "chiến đấuhọ tiền tố phủ định cho động từ chưaKết thúc,rõ ràngrút lui?" : "nhỏ môn học họ tiền tố phủ định cho động từ chưaKết thúc,rõ ràngrời khỏi?")) return;
      }
      location.href = back;
    });
  }

  function paintBattleHud(init) {
    if (!battleMode()) return;
    var b = state.battle;
    var heroPct = Math.max(0, Math.round((b.heroHp / b.heroMaxHp) * 100));
    var enemyPct = Math.max(0, Math.round((b.enemyHp / b.enemyMaxHp) * 100));
    var hb = document.getElementById("vl-hp-hero-bar");
    var eb = document.getElementById("vl-hp-enemy-bar");
    var hn = document.getElementById("vl-hp-hero-n");
    var en = document.getElementById("vl-hp-enemy-n");
    if (hb) hb.style.width = heroPct + "%";
    if (eb) eb.style.width = enemyPct + "%";
    if (hn) hn.textContent = b.heroHp + "/" + b.heroMaxHp;
    if (en) en.textContent = b.enemyHp + "/" + b.enemyMaxHp;
    if (init) {
      var name = document.getElementById("vl-enemy-name");
      var glyph = document.getElementById("vl-enemy-glyph");
      var foe = document.getElementById("vl-enemy");
      if (name) name.textContent = b.enemy.name;
      if (foe) {
        foe.className = "vl-enemy vl-enemy--" + (b.enemy.skin || "mist") +
          (b.enemy.portrait ? " vl-enemy--portrait" : "");
        if (b.enemy.portrait) {
          foe.innerHTML = '<img class="vl-enemy__art" src="' + esc(b.enemy.portrait) +
            '" alt="" onerror="this.remove();var g=this.parentNode&&this.parentNode.querySelector(\'.vl-enemy__glyph\');">';
          if (glyph) glyph.textContent = "";
        } else if (glyph) {
          glyph.textContent = b.enemy.glyph || "◆";
        }
      } else if (glyph) {
        glyph.textContent = b.enemy.glyph || "◆";
      }
    }
  }

  function enemyVisualHTML(enemy) {
    if (!enemy) return '<div class="vl-mascot vl-mascot--lg" aria-hidden="true">✦</div>';
    if (enemy.portrait) {
      return '<div class="vl-enemy vl-enemy--' + esc(enemy.skin || "mist") +
        ' vl-enemy--idle vl-enemy--portrait" aria-hidden="true">' +
        '<img class="vl-enemy__art" src="' + esc(enemy.portrait) + '" alt=""></div>' +
        '<p class="vl-enemy__title">' + esc(enemy.title || "") + " · " + esc(enemy.name) + "</p>" +
        (enemy.intro ? '<p class="vl-enemy__intro">' + esc(enemy.intro) + "</p>" : "");
    }
    return '<div class="vl-enemy vl-enemy--' + esc(enemy.skin || "mist") +
      ' vl-enemy--idle" aria-hidden="true"><span class="vl-enemy__glyph">' +
      esc(enemy.glyph || "◆") + "</span></div>" +
      '<p class="vl-enemy__title">' + esc(enemy.title || "") + " · " + esc(enemy.name) + "</p>" +
      (enemy.intro ? '<p class="vl-enemy__intro">' + esc(enemy.intro) + "</p>" : "");
  }

  function battleFloat(text, kind) {
    var el = document.getElementById("vl-float");
    var arena = document.getElementById("vl-arena");
    var foe = document.getElementById("vl-enemy");
    if (!el) return;
    el.hidden = false;
    el.className = "vl-float vl-float--" + (kind || "hit");
    el.textContent = text;
    if (foe) {
      foe.classList.remove("is-hit", "is-strike", "is-slash");
      void foe.offsetWidth;
      foe.classList.add(kind === "hurt" ? "is-strike" : "is-hit");
    }
    if (arena && kind === "hurt") {
      arena.classList.remove("is-shake");
      void arena.offsetWidth;
      arena.classList.add("is-shake");
    }
    clearTimeout(battleFloat._t);
    battleFloat._t = setTimeout(function () { el.hidden = true; }, 700);
  }

  /** Letter-blade slash across the foe on a successful answer */
  function playSlashFx(crit) {
    var arena = document.getElementById("vl-arena");
    var foe = document.getElementById("vl-enemy");
    if (!arena) return;
    var old = arena.querySelector(".vl-slash");
    if (old) old.remove();
    var el = document.createElement("div");
    el.className = "vl-slash" + (crit ? " is-crit" : "");
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = "<i></i><b></b>";
    arena.appendChild(el);
    if (foe) {
      foe.classList.remove("is-slash");
      void foe.offsetWidth;
      foe.classList.add("is-slash");
    }
    clearTimeout(playSlashFx._t);
    playSlashFx._t = setTimeout(function () {
      el.remove();
      if (foe) foe.classList.remove("is-slash");
    }, 520);
  }

  function isBossFight() {
    return !!(state.shrineId && STORY && STORY.isBossShrine && STORY.isBossShrine(state.shrineId));
  }

  function clearAnswerTimer() {
    if (answerTimer) {
      clearInterval(answerTimer);
      answerTimer = null;
    }
  }

  function startAnswerTimer(ex) {
    clearAnswerTimer();
    if (!battleMode()) return;
    var sec = (ex.type === "type_spell" || ex.type === "scramble") ? ANSWER_SEC_SPELL : ANSWER_SEC;
    var left = sec;
    var foot = document.getElementById("vl-foot");
    if (foot && !document.getElementById("vl-timer")) {
      foot.insertAdjacentHTML("afterbegin",
        '<div class="vl-timer" id="vl-timer" aria-live="polite">' +
          '<div class="vl-timer__track"><i id="vl-timer-bar" style="width:100%"></i></div>' +
          '<span class="vl-timer__n" id="vl-timer-n">' + sec + "s</span></div>");
    }
    function tick() {
      var bar = document.getElementById("vl-timer-bar");
      var n = document.getElementById("vl-timer-n");
      if (bar) bar.style.width = Math.max(0, Math.round((left / sec) * 100)) + "%";
      if (n) n.textContent = left + "s";
      if (left <= 0) {
        clearAnswerTimer();
        state.timedOut = true;
        grade(ex, null, true);
        return;
      }
      left -= 1;
    }
    tick();
    answerTimer = setInterval(tick, 1000);
  }

  /** hình thức gắn liền có nghĩa giống như từ tự do họ/vượt quá thời gian:quái vậtcắncài máu(cuộc viễn chinhkhông cómiễn phísửa) */
  function applyEnemyAttack() {
    if (!battleMode() || !state.battle) return false;
    var dmg = CORE.enemyAttackDamage
      ? CORE.enemyAttackDamage(isBossFight())
      : (isBossFight() ? 2 : 1);
    state.hearts = Math.max(0, state.hearts - dmg);
    state.battle.heroHp = state.hearts;
    state.battle.lastHit = dmg;
    state.battle.crit = false;
    battleFloat("cắn -" + dmg, "hurt");
    if (SFX) SFX.hurt();
    if (state.battle.heroHp <= 0) state.battle.lost = true;
    paintHearts();
    return true;
  }

  function fleeHref() {
    var r = (state.shrineRegion || params.get("region") || "").trim();
    if (state.camp) return "word-realm.html?view=hub";
    return r
      ? ("word-realm.html?view=map&region=" + encodeURIComponent(r))
      : "word-realm.html?view=hub";
  }

  function mistAfterScript(shrineId) {
    var m = String(shrineId || "").match(/^shrine-0([1-7])$/);
    if (!m) return "";
    return "mist_after_0" + m[1];
  }

  function vnAlreadySeen(id) {
    if (!id) return true;
    try {
      var s = JSON.parse(localStorage.getItem("yysd:word-realm-vn-seen") || "{}");
      return !!s[id];
    } catch (e) { return false; }
  }

  function exitHref() {
    if (state.camp || state.shrineId || fromRealm) {
      // After mist shrine clear → story beat VN (once, before dream)
      if (state.shrineId && state.battle && state.battle.won && !state.camp) {
        var boss = STORY && STORY.bossOf ? STORY.bossOf(state.shrineId) : null;
        if (boss && boss.vnPost && !vnAlreadySeen(boss.vnPost)) {
          return "word-realm.html?view=vn&script=" + encodeURIComponent(boss.vnPost) +
            "&next=clear&region=" + encodeURIComponent(state.shrineRegion || "mist");
        }
        var after = mistAfterScript(state.shrineId);
        if (after && !vnAlreadySeen(after)) {
          return "word-realm.html?view=vn&script=" + encodeURIComponent(after) +
            "&next=map&region=mist";
        }
      }
      if (CORE && CORE.pendingDream && CORE.pendingDream()) {
        return "word-realm.html?view=dream";
      }
      var r = (state.shrineRegion || params.get("region") || "").trim();
      return r
        ? ("word-realm.html?view=map&region=" + encodeURIComponent(r))
        : "word-realm.html?view=hub";
    }
    if (state.book) return "vocab-shelf.html?book=" + encodeURIComponent(state.book);
    return "zone.html?zone=study&s=vocab";
  }

  function showCutscene(opts, done) {
    opts = opts || {};
    var lines = opts.lines || [];
    var i = 0;
    function paint() {
      var line = lines[i] || "";
      document.getElementById("vl-main").innerHTML =
        '<div class="vl-cut">' +
          '<p class="vl-cut__kicker">' + esc(opts.kicker || "cốt truyện") + "</p>" +
          "<h2>" + esc(opts.title || "") + "</h2>" +
          '<p class="vl-cut__line">' + esc(line) + "</p>" +
          '<p class="vl-cut__step">' + (i + 1) + " / " + lines.length + "</p>" +
        "</div>";
      document.getElementById("vl-foot").innerHTML =
        '<button type="button" class="vl-btn vl-btn--ghost" id="vl-cut-skip">nhảy qua</button>' +
        '<button type="button" class="vl-btn vl-btn--primary" id="vl-cut-next">' +
          (i >= lines.length - 1 ? (opts.doneLabel || "Tiếp tục") : "xuốngmột dòng thơ") + "</button>";
      document.getElementById("vl-cut-skip").onclick = function () { done(); };
      document.getElementById("vl-cut-next").onclick = function () {
        if (i >= lines.length - 1) done();
        else { i++; paint(); }
      };
    }
    if (!lines.length) { done(); return; }
    paint();
  }

  function paintHearts() {
    if (battleMode()) {
      state.battle.heroHp = state.hearts;
      paintBattleHud(false);
      return;
    }
    // Bài tậpnhỏ môn học:đỉnh hàng ràohiển thịhọ biến thể cũ củabao gồm trong một bộ sưu tậpđếm,không cài
    var el = document.getElementById("vl-top-meta");
    if (!el) return;
    var n = state.everWrong.length;
    el.textContent = n ? ("ở lại ghi chép " + n) : "họchình thức kết hợp Trung Quốc";
  }

  function paintProgress() {
    if (!battleMode()) {
      var bar = document.getElementById("vl-bar");
      if (bar) {
        var total = Math.max(state.queue.length, 1);
        var pct = Math.min(100, Math.round((state.idx / total) * 100));
        bar.style.width = pct + "%";
      }
    } else {
      paintBattleHud(false);
    }
    var combo = document.getElementById("vl-combo");
    if (!combo) return;
    if (state.combo >= 2 && state.phase === "feedback") {
      combo.hidden = false;
      combo.textContent = (battleMode() && state.combo >= 4 ? "đánh liên tụcđòn chí mạng trò chơi!×" : "họ đúng ") +
        state.combo + (battleMode() && state.combo >= 4 ? "" : " họ");
    } else {
      combo.hidden = true;
    }
  }

  function showModal(html) {
    var m = document.getElementById("vl-modal");
    m.hidden = false;
    m.innerHTML = '<div class="vl-modal__card">' + html + "</div>";
  }

  function hideModal() {
    var m = document.getElementById("vl-modal");
    m.hidden = true;
    m.innerHTML = "";
  }

  function renderQuestion() {
    clearAnswerTimer();
    state.phase = "play";
    state.selected = null;
    state.scramblePicked = [];
    state.timedOut = false;
    hideModal();
    var ex = state.queue[state.idx];
    if (!ex) {
      maybeRetryOrCelebrate();
      return;
    }
    paintHearts();
    paintProgress();
    var main = document.getElementById("vl-main");
    var foot = document.getElementById("vl-foot");
    var badge = ex.retry
      ? '<span class="vl-badge vl-badge--retry">Câu sailặp lại luyện tập</span>'
      : (ex.type === "collocation"
        ? '<span class="vl-badge">đánh</span>'
        : (ex.type === "example_cloze"
          ? '<span class="vl-badge">ví dụ</span>'
          : (ex.type === "mnemonic_pick"
            ? '<span class="vl-badge">ghi chép</span>'
            : (ex.type === "derivative_pick"
              ? '<span class="vl-badge">dùng trong</span>'
              : (ex.type === "distinguish_pick"
                ? '<span class="vl-badge">phân biệt</span>'
                : (ex.type.indexOf("listen") === 0 || ex.type === "type_spell"
                  ? '<span class="vl-badge">Nghe</span>'
                  : '<span class="vl-badge">viết tắt của Tân Cương luyện tập</span>'))))));

    var body = "";
    if (ex.type === "meaning_to_word") {
      body = '<p class="vl-prompt-cn">' + esc(ex.word.meaning) + "</p>" + optionsHTML(ex);
    } else if (ex.type === "word_to_meaning") {
      body = '<p class="vl-prompt-en">' + esc(ex.word.word) + "</p>" +
        (ex.word.ipa ? '<p class="vl-ipa">' + esc(ex.word.ipa) + "</p>" : "") +
        optionsHTML(ex);
    } else if (ex.type === "listen_meaning") {
      body = '<button type="button" class="vl-play" id="vl-play" aria-label="PhátPhát âm">▶</button>' +
        '<p class="vl-hint">nhấnPhát,lạitrình đơn phần mềmbiến thể cũ của</p>' + optionsHTML(ex);
    } else if (ex.type === "mnemonic_pick" || ex.type === "derivative_pick" || ex.type === "distinguish_pick") {
      body = '<p class="vl-prompt-cn">' + esc(ex.hintZh || "") + "</p>" + optionsHTML(ex);
    } else if (ex.type === "collocation" || ex.type === "example_cloze") {
      body = '<p class="vl-cloze">' + esc(ex.blank || "____") + "</p>" +
        (ex.hintZh ? '<p class="vl-hint">' + esc(ex.hintZh) + "</p>" : "") +
        optionsHTML(ex);
    } else if (ex.type === "scramble") {
      body = '<p class="vl-prompt-cn">' + esc(ex.word.meaning) + "</p>" +
        '<div class="vl-scramble-out" id="vl-scramble-out"></div>' +
        '<div class="vl-scramble-pool" id="vl-scramble-pool"></div>';
    } else if (ex.type === "type_spell") {
      body = '<button type="button" class="vl-play" id="vl-play" aria-label="PhátPhát âm">▶</button>' +
        '<p class="vl-hint">cười cổ đại âm thanhđánh vần(tiền tố có thểkhông phân biệt chữ hoa và chữ thường)</p>' +
        '<label class="vl-input-wrap">Tiếng Anhđánh vần' +
        '<input type="text" id="vl-input" class="vl-input" autocomplete="off" autocapitalize="off" spellcheck="false"></label>';
    }

    main.innerHTML =
      '<div class="vl-q">' + badge +
        '<h1 class="vl-title">' + esc(promptFor(ex)) + "</h1>" + body +
      "</div>";

    foot.innerHTML =
      '<button type="button" class="vl-btn vl-btn--ghost" id="vl-skip">nhảy qua</button>' +
      '<button type="button" class="vl-btn vl-btn--primary" id="vl-check" disabled>kiểm tra</button>';

    bindQuestion(ex);
    if (ex.type === "listen_meaning" || ex.type === "type_spell") {
      speak(ex.word.word);
      var play = document.getElementById("vl-play");
      if (play) play.addEventListener("click", function () { speak(ex.word.word); });
    }
    if (ex.type === "type_spell") {
      var inp = document.getElementById("vl-input");
      inp.focus();
      inp.addEventListener("input", function () {
        document.getElementById("vl-check").disabled = !inp.value.trim();
      });
      inp.addEventListener("keydown", function (e) {
        if (e.key === "Enter") document.getElementById("vl-check").click();
      });
    }
    startAnswerTimer(ex);
  }

  function optionsHTML(ex) {
    return '<div class="vl-options" role="listbox">' + ex.options.map(function (o, i) {
      return '<button type="button" class="vl-opt" role="option" data-key="' + esc(o.key) + '" data-i="' + i + '">' +
        '<span class="vl-opt__n">' + (i + 1) + "</span>" +
        '<span class="vl-opt__t">' + esc(o.label) + "</span></button>";
    }).join("") + "</div>";
  }

  function bindQuestion(ex) {
    var check = document.getElementById("vl-check");
    document.getElementById("vl-skip").onclick = function () { grade(ex, null, true); };
    check.onclick = function () { submit(ex); };

    if (ex.options) {
      root.querySelectorAll(".vl-opt").forEach(function (btn) {
        btn.addEventListener("click", function () {
          root.querySelectorAll(".vl-opt").forEach(function (b) { b.classList.remove("is-on"); });
          btn.classList.add("is-on");
          state.selected = btn.getAttribute("data-key");
          check.disabled = false;
        });
      });
      window.onkeydown = function (e) {
        var n = parseInt(e.key, 10);
        if (n >= 1 && n <= (ex.options.length || 0)) {
          var btn = root.querySelector('.vl-opt[data-i="' + (n - 1) + '"]');
          if (btn) btn.click();
        } else if (e.key === "Enter" && !check.disabled) check.click();
      };
    }

    if (ex.type === "scramble") {
      var pool = document.getElementById("vl-scramble-pool");
      var out = document.getElementById("vl-scramble-out");
      var poolLeft = ex.letters.slice();
      function paintScramble() {
        out.innerHTML = state.scramblePicked.map(function (ch, i) {
          return '<button type="button" class="vl-chip" data-from="out" data-i="' + i + '">' + esc(ch) + "</button>";
        }).join("") || '<span class="vl-scramble-ph">chọnchữ cái của bảng chữ cái</span>';
        pool.innerHTML = poolLeft.map(function (ch, i) {
          return '<button type="button" class="vl-chip" data-from="pool" data-i="' + i + '">' + esc(ch) + "</button>";
        }).join("");
        check.disabled = !state.scramblePicked.length;
        out.querySelectorAll('[data-from="out"]').forEach(function (b) {
          b.onclick = function () {
            var i = +b.getAttribute("data-i");
            poolLeft.push(state.scramblePicked.splice(i, 1)[0]);
            paintScramble();
          };
        });
        pool.querySelectorAll('[data-from="pool"]').forEach(function (b) {
          b.onclick = function () {
            var i = +b.getAttribute("data-i");
            state.scramblePicked.push(poolLeft.splice(i, 1)[0]);
            paintScramble();
          };
        });
      }
      paintScramble();
    }
  }

  function submit(ex) {
    if (ex.type === "scramble") {
      grade(ex, state.scramblePicked.join(""), false);
      return;
    }
    if (ex.type === "type_spell") {
      var v = (document.getElementById("vl-input").value || "").trim();
      grade(ex, v, false);
      return;
    }
    grade(ex, state.selected, false);
  }

  function normWord(s) {
    return String(s || "").trim().toLowerCase().replace(/\s+/g, " ");
  }

  function isCorrect(ex, answer) {
    var w = normWord(ex.word.word);
    if (ex.type === "word_to_meaning") return normWord(answer) === w;
    if (ex.type === "scramble" || ex.type === "type_spell") {
      return normWord(answer).replace(/\s+/g, "") === w.replace(/\s+/g, "");
    }
    return normWord(answer) === w;
  }

  function grade(ex, answer, skipped) {
    clearAnswerTimer();
    window.onkeydown = null;
    var ok = !skipped && isCorrect(ex, answer);
    var timedOut = !!state.timedOut;
    state.timedOut = false;
    state.answered++;
    state.phase = "feedback";
    if (ok) {
      state.correct++;
      state.combo++;
      if (battleMode()) {
        var dmg = CORE.battleDamage(state.combo);
        state.battle.lastHit = dmg;
        state.battle.crit = dmg >= 2;
        state.battle.enemyHp = Math.max(0, state.battle.enemyHp - dmg);
        if (state.battle.enemyHp <= 0) state.battle.won = true;
        battleFloat((state.battle.crit ? "đòn chí mạng trò chơichặt đầu như một hình thức tử hình -" : "chặt đầu như một hình thức tử hình đánh -") + dmg, "hit");
        playSlashFx(state.battle.crit);
        if (SFX) SFX.hit(state.battle.crit);
      }
    } else {
      state.combo = 0;
      if (battleMode()) {
        applyEnemyAttack();
      }
      // ponytail: homework — no hearts; wrong → wrongBank for retry/notebook
      if (!ex.retry) {
        var exists = state.wrongBank.some(function (w) {
          return normWord(w.word) === normWord(ex.word.word);
        });
        if (!exists) state.wrongBank.push(ex.word);
        var seen = state.everWrong.some(function (w) {
          return normWord(w.word) === normWord(ex.word.word);
        });
        if (!seen) state.everWrong.push(ex.word);
      }
    }
    paintHearts();
    paintProgress();
    showFeedback(ex, ok, skipped, timedOut);
  }

  function showFeedback(ex, ok, skipped, timedOut) {
    var foot = document.getElementById("vl-foot");
    var praise = PRAISE[Math.floor(Math.random() * PRAISE.length)];
    var badTitle = timedOut
      ? "Thời gianđến · ngấu nghiến biến thể cũ củabắt đầutấn công"
      : (skipped ? "đãnhảy qua · ngấu nghiến biến thể cũ củabắt đầutấn công" : "hình thức gắn liền có nghĩa giống như từ tự do họ · ngấu nghiến biến thể cũ củabắt đầutấn công");
    if (!battleMode()) {
      badTitle = skipped ? "đãnhảy qua" : "lại ghi chépđầu tiênsau một mệnh đề giả định trong trường hợp đó tốt";
    }
    var msg = ok
      ? '<div class="vl-fb vl-fb--ok"><strong>' + esc(praise) + "</strong>" +
        (ex.word.example ? '<p class="vl-fb__ex">' + esc(ex.word.example) + "</p>" : "") +
        "</div>"
      : '<div class="vl-fb vl-fb--bad"><strong>' + esc(badTitle) + "</strong>" +
        "<p>Đáp án đúng: <b>" + esc(ex.word.word) + "</b> · " + esc(ex.word.meaning) + "</p></div>";

    // inject feedback above foot
    var main = document.getElementById("vl-main");
    var old = main.querySelector(".vl-fb");
    if (old) old.remove();
    main.insertAdjacentHTML("beforeend", msg);
    root.querySelectorAll(".vl-opt").forEach(function (b) {
      b.disabled = true;
      if (normWord(b.getAttribute("data-key")) === normWord(ex.word.word)) b.classList.add("is-right");
      else if (b.classList.contains("is-on")) b.classList.add("is-wrong");
    });

    var nextLabel = "Tiếp tục";
    if (battleMode() && state.battle.won) nextLabel = "đánh hỏng!";
    else if (battleMode() && state.battle.lost) nextLabel = "bị đánh bại hoàn toàn…";
    foot.innerHTML = '<button type="button" class="vl-btn vl-btn--primary vl-btn--wide" id="vl-next">' +
      nextLabel + "</button>";
    document.getElementById("vl-next").onclick = function () {
      if (battleMode() && state.battle.won) {
        celebrate();
        return;
      }
      if (battleMode() && state.battle.lost) {
        showDefeat();
        return;
      }
      advance();
    };
  }

  function offerRefill() {
    // hầu nhưcuộc viễn chinhchiến đấuhọ vẫncó thể xảy rađi đến sửa;Bài tậpnhỏ môn họckhông cònkích hoạt
    if (!battleMode()) {
      advance();
      return;
    }
    state.freeRefillShown = true;
    showModal(
      '<div class="vl-refill">' +
        '<div class="vl-mascot" aria-hidden="true">✦</div>' +
        "<h2>Ghi nhớhọ sẽ biến thể của</h2>" +
        "<p>thần linhmượn bạnđầu tiênlạingưng tụ——lạisụp đổđơn giản hình thức kết hợp yêu cầurút lui.</p>" +
        '<button type="button" class="vl-btn vl-btn--primary vl-btn--wide" id="vl-refill">miễn phílạingưng tụ</button>' +
      "</div>"
    );
    document.getElementById("vl-refill").onclick = function () {
      state.hearts = HEARTS_MAX;
      state.refilled = true;
      state.battle.heroHp = HEARTS_MAX;
      state.battle.lost = false;
      paintHearts();
      hideModal();
      advance();
    };
  }

  function advance() {
    state.idx++;
    window.onkeydown = null;
    if (battleMode() && state.battle.won) {
      celebrate();
      return;
    }
    if (state.idx >= state.queue.length) maybeRetryOrCelebrate();
    else renderQuestion();
  }

  function maybeRetryOrCelebrate() {
    if (battleMode()) {
      // họ đến mức tối đa:phảiđánh hỏng khả năng coi như chiến thắng;dạng kết hợp kẻ thù vẫnsống sót sau tai nạn nghiêm trọng = sức mạnh thể chấttiêu haothua trận(không còntự độngthông quan)
      if (state.battle.enemyHp <= 0) {
        state.battle.won = true;
        celebrate();
        return;
      }
      state.battle.lost = true;
      showDefeat();
      return;
    }
    if (state.wrongBank.length && state.phase !== "retrying") {
      var retryWords = state.wrongBank.slice(0, 6);
      state.wrongBank = [];
      state.phase = "retrying";
      var bridge = document.getElementById("vl-main");
      document.getElementById("vl-foot").innerHTML = "";
      bridge.innerHTML =
        '<div class="vl-bridge">' +
          '<div class="vl-mascot" aria-hidden="true">✦</div>' +
          "<h2>ở cùng một nơiđếnÔn tậpkhông cao nhấtthành thạophầnquán bar từ mượn phục vụ đồ uống</h2>" +
          "<p>trao đổi hạt họ khuôn lại luyện tậpmột lần từ đầu đến cuối,nhẹ nhàng.</p>" +
          '<button type="button" class="vl-btn vl-btn--primary" id="vl-retry-go">Bắt đầulặp lại luyện tập</button>' +
        "</div>";
      document.getElementById("vl-retry-go").onclick = function () {
        state.queue = buildExercises(retryWords, state.words, true);
        state.idx = 0;
        renderQuestion();
      };
      return;
    }
    celebrate();
  }

  function showDefeat() {
    state.phase = "defeat";
    window.onkeydown = null;
    hideModal();
    if (SFX) SFX.lose();
    var back = exitHref();
    var retry = state.shrineId
      ? ("vocab-lesson.html?from=realm&shrine=" + encodeURIComponent(state.shrineId))
      : campHrefSafe();
    var enemyName = (state.battle && state.battle.enemy && state.battle.enemy.name) || "ngấu nghiến biến thể cũ của";
    var isBoss = isBossFight();
    var exhausted = state.battle && state.battle.enemyHp > 0 && state.idx >= state.queue.length;
    var soft = exhausted
      ? (enemyName + "vẫn chưasụp đổ,bạn chặt đầu như một hình thức tử hình đánhtiêu hao.nhà thờ chưathắp sáng.")
      : (isBoss
        ? (enemyName + "lẩm bẩm Forget… nhà thờ chưathắp sáng.họ kéo:«họ tiền tố phủ định cho động từ chưaviết xong.xoay vòngđạo sĩ tu luyện khổ hạnhsân phơi nhúng vào nước kiếm hai lưỡi,lại đến.»")
        : (enemyName + "vẫn tồn tại.nhà thờ chưathắp sáng,phá hủy đầu chưarơi xuống."));
    var hint = isBoss
      ? "Boss thua trậnkhôngthúc đẩycốt truyện.đặt giới hạn thời gianhình thức gắn liền có nghĩa giống như từ tự do họ,thường dùng ở dạng phủ định trả lời hoặc đáp lại câu hỏi của ai đóchặt đầu như một hình thức tử hình đánh,hình thức gắn liền có nghĩa giống như từ tự do họ/vượt quá thời giantheo thứ tựcắn."
      : "hình thức gắn liền có nghĩa giống như từ tự do họvượt quá thời gianthành phốtheo thứ tựcắn.trên bên tráihọ × tiền tố có thểrút lui(nhà thờ khôngthắp sáng).";
    document.getElementById("vl-main").innerHTML =
      '<div class="vl-celebrate vl-defeat' + (isBoss ? " vl-defeat--boss" : "") + '">' +
        '<div class="vl-enemy vl-enemy--down" aria-hidden="true">☠</div>' +
        "<h2>" + (isBoss ? "Boss rút lui" : (exhausted ? "chặt đầu như một hình thức tử hình đánhtiêu hao" : "rút lui")) + "</h2>" +
        '<p class="vl-celebrate__soft">' + esc(soft) + "</p>" +
        '<p class="vl-celebrate__hint">' + esc(hint) + "</p>" +
      "</div>";
    document.getElementById("vl-foot").innerHTML =
      '<a class="vl-btn vl-btn--primary vl-btn--wide" href="' + esc(retry) + '">một lần nữathử thách</a>' +
      '<a class="vl-btn vl-btn--ghost" href="' + esc(campHrefSafe()) + '">điđạo sĩ tu luyện khổ hạnhsân phơi</a>' +
      '<a class="vl-btn vl-btn--ghost" href="' + esc(fleeHref()) + '">xoay vòngcuộc viễn chinhbản đồ</a>';
  }

  function campHrefSafe() {
    return "vocab-lesson.html?from=realm&mode=camp";
  }

  function readStreak() {
    try { return JSON.parse(localStorage.getItem(STREAK_KEY) || "{}"); }
    catch (e) { return {}; }
  }

  function writeStreak(n, lastDay) {
    try {
      localStorage.setItem(STREAK_KEY, JSON.stringify({ n: n, lastDay: lastDay }));
    } catch (e) {}
  }

  function bumpStreak() {
    var day = new Date().toISOString().slice(0, 10);
    var s = readStreak();
    if (s.lastDay === day) return s.n || 1;
    var y = new Date();
    y.setDate(y.getDate() - 1);
    var yday = y.toISOString().slice(0, 10);
    var n = (s.lastDay === yday) ? (s.n || 0) + 1 : 1;
    writeStreak(n, day);
    return n;
  }

  function saveLessonResult() {
    var item = state.item;
    if (!item) return;
    var total = Math.max(state.answered, 1);
    var score = state.correct;
    var store = {};
    try { store = JSON.parse(localStorage.getItem("yysd:results") || "{}"); } catch (e) {}
    var attemptAt = new Date().toISOString();
    var record = {
      id: item.id,
      title: item.title,
      zone: item.zone,
      subject: item.subject,
      score: score,
      total: total,
      band: null,
      date: attemptAt,
      startedAt: state.startedAt,
      durationSec: state.startedAt
        ? Math.round((Date.now() - Date.parse(state.startedAt)) / 1000)
        : null,
      wrong: state.everWrong.map(function (w) { return w.word; }),
      lesson: true
    };
    store[item.id] = record;
    try { localStorage.setItem("yysd:results", JSON.stringify(store)); } catch (e) {}
    if (window.YYSD_AUTH && YYSD_AUTH.pushScoreRecord) {
      YYSD_AUTH.pushScoreRecord(Object.assign({}, record, { attemptAt: attemptAt, wrong: [] }));
    }

    if (state.everWrong.length && state.book) {
      Y.mergeWrongWords(state.book, state.everWrong.map(function (w) {
        return {
          word: w.word, ipa: w.ipa, meaning: w.meaning, acceptCN: w.acceptCN,
          userSpelling: "", userMeaning: "", spellingCorrect: false, meaningCorrect: false
        };
      }), { id: item.id, title: item.title, subject: item.subject });
    }
  }

  function celebrate() {
    state.phase = "celebrate";
    window.onkeydown = null;
    if (state.battle) {
      state.battle.won = true;
      state.battle.enemyHp = 0;
      state.battle.lost = false;
    }
    if (!state.camp && !state.shrineId) saveLessonResult();
    // hầu nhưdòng chính của liên lạcđánh hỏng viết nhà thờTiến độ;trại huấn luyện / thua trậnkhông đời nàoviết
    if (state.shrineId && CORE && !state.camp) CORE.markCleared(state.shrineId);

    var postBoss = state.shrineId && STORY && STORY.bossOf
      ? STORY.bossOf(state.shrineId) : null;

    function paintCelebrate() {
      if (SFX) SFX.win();
      var streak = bumpStreak();
      var baseXp = state.camp ? XP_CAMP : XP_PER_LESSON;
      var xp = baseXp + Math.min(state.camp ? 3 : 5, Math.floor(state.correct / 3));
      if (streak >= 2) xp += 2;
      if (postBoss) xp += 5;
      if (state.camp && weekly && weekly.bonusXp) xp += weekly.bonusXp;
      var rpgGain = null;
      if (window.YYSD_VOCAB_RPG) {
        rpgGain = window.YYSD_VOCAB_RPG.addXp(xp, state.camp ? "camp" : (state.shrineId ? "shrine" : "lesson"));
      }
      var rate = state.answered ? Math.round((state.correct / state.answered) * 100) : 0;
      var sample = state.words[0] || { meaning: "", word: "" };
      var back = exitHref();
      var nextLesson = "";
      if (state.item && !state.shrineId && !state.camp) {
        nextLesson = '<a class="vl-btn vl-btn--ghost" href="' + esc(guideHref(state.item)) + '">Xembiến thể cũ của dừnghướng dẫn</a>';
      }
      var hasDream = !!(CORE && CORE.pendingDream && CORE.pendingDream());
      var continueLabel = hasDream
        ? "đi vàoxứ mơ ›"
        : ((state.camp || state.shrineId || fromRealm) ? "trở vềcuộc viễn chinhbản đồ" : "biên laibiến thể cũ của họ");
      var softLine;
      var enemyName = state.battle && state.battle.enemy ? state.battle.enemy.name : "";
      if (state.camp) {
        softLine = "đạo sĩ tu luyện khổ hạnhcọc gỗsụp đổ.chưathúc đẩycốt truyện,chưarơi xuốngphá hủy đầu——Ghi nhớhọtăng trưởng." +
          (weekly ? (" hình thức kết hợp gốc họChủ đề«" + weekly.name + "»thêm +" + (weekly.bonusXp || 0) + ".") : "");
      } else if (state.shrineId) {
        var clearLine = "";
        if (STORY && state.shrineMeta) {
          clearLine = STORY.shrineBeat(state.shrineMeta.region, state.shrineMeta.index).clear;
        }
        softLine = (clearLine ? clearLine + " " : "") +
          (enemyName ? ("đánh hỏng«" + enemyName + "».") : "") + "nhà thờ đãthắp sáng." +
          (hasDream ? " ngôi sao mảnh vụnrung chuyển——cóxứ mơở lại chăm sóc." : "");
      } else {
        softLine = "hình thức kết hợp gốc môn họcHoàn thành.biên laibiến thể cũ của họTiếp tụcBài tập,có thể đi«biến thể cũ của biên giới»mạo hiểm.";
      }
      var headline = battleMode()
        ? ((postBoss ? "Boss đánh hỏng · " : "đánh hỏng · ") + (enemyName || "ngấu nghiến biến thể cũ của"))
        : (state.camp ? "huấn luyệnHoàn thành!" : "hình thức kết hợp gốc họHoàn thành!");
      var mascot;
      if (battleMode() && state.battle.enemy && state.battle.enemy.portrait) {
        mascot = '<div class="vl-enemy vl-enemy--down vl-enemy--portrait vl-enemy--' +
          esc(state.battle.enemy.skin || "mist") +
          '" aria-hidden="true"><img class="vl-enemy__art" src="' +
          esc(state.battle.enemy.portrait) + '" alt=""></div>';
      } else if (battleMode()) {
        mascot = '<div class="vl-enemy vl-enemy--down vl-enemy--' +
          esc((state.battle.enemy && state.battle.enemy.skin) || "mist") +
          '" aria-hidden="true">' + esc((state.battle.enemy && state.battle.enemy.glyph) || "◆") + "</div>";
      } else {
        mascot = '<div class="vl-mascot vl-mascot--lg" aria-hidden="true">✦</div>';
      }

      var levelLine = "";
      var levelBanner = "";
      if (rpgGain) {
        levelLine = '<p class="vl-celebrate__lv">Lv.' + rpgGain.after.level + " · " +
          esc(rpgGain.after.title) +
          (rpgGain.leveledUp ? ' <span class="vl-celebrate__up">LEVEL UP!</span>' : "") +
          "</p>";
        if (rpgGain.leveledUp) {
          levelBanner =
            '<div class="vl-levelup" role="status">' +
              '<p class="vl-levelup__kicker">Memory Power surges</p>' +
              "<h3>Lv." + rpgGain.before.level + " → Lv." + rpgGain.after.level + "</h3>" +
              '<p class="vl-levelup__en">Title: ' + esc(rpgGain.after.title) + "</p>" +
              '<p class="vl-levelup__zh">tênthay cũ đổi mới:' + esc(rpgGain.after.title) + " · Ghi nhớhọphản hồibạnLặp lại.</p>" +
            "</div>";
        }
      }

      var bar = document.getElementById("vl-bar");
      if (bar) bar.style.width = "100%";
      if (battleMode()) paintBattleHud(false);
      var combo = document.getElementById("vl-combo");
      if (combo) combo.hidden = true;
      document.getElementById("vl-main").innerHTML =
        '<div class="vl-celebrate' + (rpgGain && rpgGain.leveledUp ? " is-levelup" : "") + '">' + mascot +
          levelBanner +
          "<h2>" + esc(headline) + "</h2>" +
          '<p class="vl-celebrate__xp">+' + xp +
            (battleMode() ? " Ghi nhớhọ" : " Kinh nghiệm") + "</p>" +
          levelLine +
          '<div class="vl-celebrate__stats">' +
            "<div><span>Tỉ lệ đúng</span><b>" + rate + "%</b></div>" +
            "<div><span>nhẹ họ chiến thắng</span><b>" + streak + " ngày</b></div>" +
          "</div>" +
          '<p class="vl-celebrate__hint">' +
            esc(battleMode() ? realmHint() : ieltsHint(sample)) + "</p>" +
          '<p class="vl-celebrate__soft">' + esc(softLine) + "</p>" +
        "</div>";
      document.getElementById("vl-foot").innerHTML =
        '<a class="vl-btn vl-btn--primary vl-btn--wide" href="' + esc(back) + '">' + esc(continueLabel) + "</a>" +
        nextLesson;
    }

    // vnPost plays on word-realm after celebrate exit — skip legacy Chinese post when present
    if (postBoss && postBoss.post && postBoss.post.length && !postBoss.vnPost) {
      showCutscene({
        kicker: "Boss sau chiến tranh",
        title: postBoss.name,
        lines: postBoss.post,
        doneLabel: "nhậnchiến đấu trái cây"
      }, paintCelebrate);
    } else {
      paintCelebrate();
    }
  }

  function fail(msg) {
    var back = fromRealm || campMode || shrineParam
      ? '<a href="word-realm.html">Quay lạibiến thể cũ của biên giớicuộc viễn chinh</a>'
      : '<a href="zone.html?zone=study&s=vocab">Quay lạiKhu vực Từ vựng</a>';
    root.innerHTML = '<div class="vl-fail"><h2>tá từ mượn không mở ngoại động từ hoặc nội động từ đại từ này họ</h2><p>' + esc(msg) +
      "</p><p>" + back + "</p></div>";
  }

  function resetPlayState(words, pool, title, opts) {
    opts = opts || {};
    clearAnswerTimer();
    state.title = title;
    state.words = words;
    state.queue = opts.camp
      ? buildCampExercises(words, pool)
      : (state.shrineId
        ? buildRealmExercises(words, pool)
        : buildExercises(words, pool, false));
    state.idx = 0;
    var realmFight = !!(opts.camp || state.shrineId);
    var heroMax = realmFight ? REALM_HEARTS : HEARTS_MAX;
    state.hearts = heroMax;
    state.refilled = false;
    state.freeRefillShown = false;
    state.combo = 0;
    state.correct = 0;
    state.answered = 0;
    state.wrongBank = [];
    state.everWrong = [];
    state.timedOut = false;
    state.startedAt = new Date().toISOString();

    if (realmFight && CORE) {
      var qLen = state.queue.length;
      // dạng kết hợp kẻ thù thay đổi hoặc thay thế dày:đa sốthường dùng ở dạng phủ định trả lời hoặc đáp lại câu hỏi của ai đótài năngđánh hỏng;Boss tiếp cậnhọ đếm;họ đến mức tối đa chưa đánh hỏng = đánh bại
      var enemyMax = isBossFight()
        ? Math.max(20, Math.ceil(qLen * 0.9))
        : Math.max(18, Math.ceil(qLen * 0.78));
      state.battle = CORE.createBattle({
        queueLen: qLen,
        enemyMaxHp: enemyMax,
        heroMaxHp: heroMax,
        camp: !!opts.camp,
        region: opts.camp ? "camp" : (state.shrineRegion || "mist")
      });
      var bossMeta = state.shrineId && STORY && STORY.bossOf
        ? STORY.bossOf(state.shrineId) : null;
      if (bossMeta && state.battle.enemy) {
        state.battle.enemy = {
          id: bossMeta.id,
          name: bossMeta.name,
          title: "địa phương Boss",
          skin: state.shrineRegion || "mist",
          glyph: state.battle.enemy.glyph,
          portrait: bossMeta.portrait || state.battle.enemy.portrait || "",
          intro: bossMeta.pre && bossMeta.pre[0] ? bossMeta.pre[0] : state.battle.enemy.intro
        };
      }
    } else {
      state.battle = null;
    }

    document.title = title + (opts.camp ? " · ngôi sao mảnh vụnđạo sĩ tu luyện khổ hạnhsân phơi" : (realmFight ? " · ngấu nghiến biến thể cũ của chiến đấu" : " · Từ vựngnhỏ môn học"));
    var sub = document.getElementById("vl-sub");
    if (sub) sub.textContent = title + " · cân trong cân đĩa hoặc trên cân " + state.queue.length + " họ";
    renderShell();

    function showStartGate() {
      var xpShow = opts.camp ? XP_CAMP : XP_PER_LESSON;
      var enemy = state.battle && state.battle.enemy;
      var isBoss = !!(state.shrineId && STORY && STORY.isBossShrine && STORY.isBossShrine(state.shrineId));
      var blurb = opts.camp
        ? ("ngôi sao mảnh vụnđạo sĩ tu luyện khổ hạnh · " + words.length + " biến thể cũ của · " + state.queue.length + " chặt đầu như một hình thức tử hình · đặt giới hạn thời gian · khôngthúc đẩycốt truyện")
        : (realmFight
          ? ((isBoss ? "Boss chiến đấu · " : "ngấu nghiến biến thể cũ của chiến đấu · ") + words.length + " biến thể cũ của · " +
            state.queue.length + " chặt đầu như một hình thức tử hình · đặt giới hạn thời gian " + ANSWER_SEC + "/" + ANSWER_SEC_SPELL +
            "s · dạng kết hợp kẻ thù HP " + (state.battle ? state.battle.enemyMaxHp : "—"))
          : ("hôm naymột nhỏ họ · " + words.length + " dùng trong biến thể cũ của · cân trong cân đĩa hoặc trên cân 5–8 phút"));
      var guide = opts.guideHref
        ? '<a class="vl-start__guide" href="' + esc(opts.guideHref) + '">trước chăm sóc biến thể cũ của dừnghướng dẫn</a>'
        : (opts.enterLine
          ? '<p class="vl-start__guide">' + esc(opts.enterLine) + "</p>"
          : "");
      var startVisual = enemyVisualHTML(enemy);
      var cta = realmFight ? ("Bắt đầuthử thách +" + xpShow + " Ghi nhớhọ") : ("Bắt đầu +" + xpShow + " Kinh nghiệm");
      document.getElementById("vl-main").innerHTML =
        '<div class="vl-start">' + startVisual +
          "<h1>" + esc(title) + "</h1>" +
          "<p>" + esc(blurb) + "</p>" +
          '<button type="button" class="vl-btn vl-btn--primary vl-btn--wide" id="vl-go">' +
            esc(cta) + "</button>" +
          guide +
        "</div>";
      document.getElementById("vl-foot").innerHTML = "";
      var go = document.getElementById("vl-go");
      if (go) go.onclick = function () { renderQuestion(); };
    }

    // Boss VN plays on word-realm before lesson (?bossVn=1); skip legacy Chinese cutscene
    var skipBossCut = params.get("bossVn") === "1" || (params.get("bossVn") || "") === "1";
    var preBoss = state.shrineId && STORY && STORY.bossOf
      ? STORY.bossOf(state.shrineId) : null;
    if (preBoss && preBoss.pre && preBoss.pre.length && !preBoss.vnPre && !skipBossCut) {
      showCutscene({
        kicker: "Boss chiến đấu trước",
        title: preBoss.name,
        lines: preBoss.pre,
        doneLabel: "đi vàochiến trường"
      }, showStartGate);
    } else {
      showStartGate();
    }
  }

  function startWithItem(item, allWords) {
    state.item = item;
    state.book = Y.vocabBookOfSubject(item.subject);
    state.shrineId = null;
    state.camp = false;
    var words = shuffle(allWords).slice(0, Math.min(WORDS_PER_LESSON, allWords.length));
    if (words.length < 4) {
      fail("đại từ nàyBàibiến thể cũ của cao nhất ít,trao đổi mộtBàithử thử.");
      return;
    }
    resetPlayState(words, allWords, Y.displayTitle(item), { guideHref: guideHref(item) });
  }

  function startShrine(lex, shrine) {
    var words = padRealmWords(lex, CORE.shrineWords(lex, shrine.id), REALM_WORDS_MIN);
    if (words.length < 4) {
      fail("đại từ này chỗ ngồi nhà thờ biến thể cũ của bề mặt bên ngoài khônghoàn chỉnh.");
      return;
    }
    state.item = null;
    state.book = null;
    state.camp = false;
    state.shrineId = shrine.id;
    state.shrineMeta = shrine;
    state.shrineRegion = shrine.region;
    var beat = STORY
      ? STORY.shrineBeat(shrine.region, shrine.index)
      : { shrineName: shrine.id, enter: "" };
    resetPlayState(words, words.concat(lex.words.slice(0, 80)), beat.shrineName, {
      enterLine: beat.enter
    });
  }

  function startCamp(lex) {
    var theme = weekly || ((CORE && CORE.weeklyTheme) ? CORE.weeklyTheme() : null);
    var words = CORE.randomCampWords(lex, CAMP_WORDS, theme ? { tiers: theme.tiers } : null);
    if (words.length < 4) {
      fail("kho từcao nhất nhỏ,không thểmở ngoại động từ hoặc nội động từ dạy.");
      return;
    }
    state.item = null;
    state.book = null;
    state.shrineId = null;
    state.camp = true;
    state.shrineRegion = "";
    var title = theme ? ("ngôi sao mảnh vụnđạo sĩ tu luyện khổ hạnhsân phơi · " + theme.name) : "ngôi sao mảnh vụnđạo sĩ tu luyện khổ hạnhsân phơi";
    resetPlayState(words, lex.words, title, {
      camp: true,
      enterLine: theme ? theme.blurb : ""
    });
  }

  function resolveItem(items) {
    if (idParam) {
      for (var i = 0; i < items.length; i++) {
        if (items[i].id === idParam) return items[i];
      }
      return null;
    }
    var book = bookParam || "gaozhong";
    var stats = Y.vocabBookStats(items, book);
    if (!stats || !stats.lists.length) return null;
    var prog = Y.vocabProgress(stats.lists);
    return prog.next || stats.lists[0];
  }

  // expose for smoke / reuse
  Y.parseVocabWordData = parseWordData;
  Y.vocabLessonHref = lessonHref;

  function bootHomework() {
    return Y.load().then(function (items) {
      var item = resolveItem(items);
      if (!item) {
        fail("không thể tìm thấytương ứng vớiBài.mời biến thể củaKhu vực Từ vựnglạiđi vào.");
        return;
      }
      if (!item.file) {
        fail("nênNội dungkhông cóbiến thể cũ của bề mặt bên ngoàitài liệu.");
        return;
      }
      root.innerHTML = '<div class="vl-loading">đang ở thời điểm đósự chuẩn bịnhỏ môn học…</div>';
      return fetch(libraryUrl(item.file)).then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.text();
      }).then(function (html) {
        var words = parseWordData(html);
        if (words.length < 4) throw new Error("không thểGiải thíchbiến thể cũ của bề mặt bên ngoài(cần wordData)");
        startWithItem(item, words);
      });
    });
  }

  function bootRealm() {
    if (!CORE) {
      fail("biến thể cũ của biên giớilõichưaTải.mời biến thể của biến thể cũ của biên giớicuộc viễn chinhlạiđi vào.");
      return Promise.resolve();
    }
    root.innerHTML = '<div class="vl-loading">đang ở thời điểm đómở ra' + (campMode ? "đạo sĩ tu luyện khổ hạnhsân phơi" : "nhà thờ tổ") + "…</div>";
    return CORE.loadLexicon().then(function (lex) {
      if (campMode) {
        startCamp(lex);
        return;
      }
      var shrine = CORE.shrineById(lex, shrineParam);
      if (!shrine) {
        fail("không thể tìm thấyđại từ này chỗ ngồi nhà thờ.mời biến thể củacuộc viễn chinhbản đồlạiđi vào.");
        return;
      }
      // pilot:hầu như sương mù họchươngtiền tố có thể chiến đấu
      if (shrine.region && shrine.region !== "mist") {
        fail("theo sauchươngchưanở hoa,mời trướcHoàn thànhbuổi sáng sương mùcánh đồng.");
        return;
      }
      startShrine(lex, shrine);
    });
  }

  function startLessonBoot() {
    var boot;
    if (campMode || shrineParam) boot = bootRealm();
    else if (fromRealm) {
      fail("mời biến thể củacuộc viễn chinhbản đồđi vàonhà thờ tổ,có thểmởngôi sao mảnh vụnđạo sĩ tu luyện khổ hạnhsân phơi.");
      boot = Promise.resolve();
    } else boot = bootHomework();

    boot.catch(function (err) {
      fail(err.message || String(err));
    });
  }

  if (window.YYSD_DIAG_GATE) {
    window.YYSD_DIAG_GATE.ensure({ requireLogin: true }).then(function (ok) {
      if (ok) startLessonBoot();
    });
  } else {
    startLessonBoot();
  }
})();
