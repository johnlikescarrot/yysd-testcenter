/* =========================================================================
   vocab-rpg.js — biến thể cũ của biên giớicuộc viễn chinh:XP / Cấp độ / tên / họXP / biến thể của hộp
   localStorage key: yysd:vocab-rpg
   ========================================================================= */
window.YYSD_VOCAB_RPG = (function () {
  "use strict";
  var KEY = "yysd:vocab-rpg";
  var TITLES = [
    "biến thể cũ của nụ", "biết con đường nghĩa đen và nghĩa bóng", "hỏng sương mù", "săn bắn biến thể cũ của", "biến thể cũ của biên giới chuyến đi người",
    "cuộc viễn chinh", "giải quyết hoặc vượt qua một vấn đề khókhách hàng", "biến thể cũ của mũi giáo", "biên giới chủ", "huyền thoạibiến thể cũ của họ"
  ];

  function weekId() {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    var week1 = new Date(d.getFullYear(), 0, 4);
    var n = 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
    return d.getFullYear() + "-W" + (n < 10 ? "0" : "") + n;
  }

  function empty() {
    return {
      totalXp: 0,
      weekId: weekId(),
      weekXp: 0,
      chests: {},
      nick: "biến thể cũ của biên giới chuyến đi người"
    };
  }

  function load() {
    var s;
    try { s = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { s = null; }
    if (!s || typeof s !== "object") s = empty();
    if (s.weekId !== weekId()) {
      s.weekId = weekId();
      s.weekXp = 0;
    }
    if (typeof s.totalXp !== "number") s.totalXp = 0;
    if (typeof s.weekXp !== "number") s.weekXp = 0;
    if (!s.chests || typeof s.chests !== "object") s.chests = {};
    return s;
  }

  function save(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
  }

  function xpToNext(level) {
    // Lv1→2 = 30, then +15 each level
    return 30 + Math.max(0, level - 1) * 15;
  }

  function progressFromXp(totalXp) {
    var xp = Math.max(0, Math.floor(totalXp || 0));
    var level = 1;
    var left = xp;
    var need = xpToNext(level);
    var guard = 0;
    while (left >= need && guard < 200) {
      left -= need;
      level++;
      need = xpToNext(level);
      guard++;
    }
    var title = TITLES[Math.min(level - 1, TITLES.length - 1)];
    return {
      totalXp: xp,
      level: level,
      into: left,
      need: need,
      pct: need ? Math.min(100, Math.round((left / need) * 100)) : 0,
      title: title
    };
  }

  function snapshot() {
    var s = load();
    var p = progressFromXp(s.totalXp);
    p.weekXp = s.weekXp;
    p.weekId = s.weekId;
    p.nick = s.nick || "biến thể cũ của biên giới chuyến đi người";
    return p;
  }

  function addXp(amount, reason) {
    var n = Math.max(0, Math.floor(Number(amount) || 0));
    var s = load();
    var before = progressFromXp(s.totalXp);
    s.totalXp += n;
    s.weekXp = (s.weekXp || 0) + n;
    s.weekId = weekId();
    save(s);
    var after = progressFromXp(s.totalXp);
    after.weekXp = s.weekXp;
    return {
      gained: n,
      reason: reason || "",
      leveledUp: after.level > before.level,
      before: before,
      after: after
    };
  }

  function chestKey(book, listId) {
    return String(book || "") + "::" + String(listId || "");
  }

  function hasChest(book, listId) {
    return !!load().chests[chestKey(book, listId)];
  }

  function claimChest(book, listId, xp) {
    var s = load();
    var k = chestKey(book, listId);
    if (s.chests[k]) return null;
    s.chests[k] = new Date().toISOString();
    save(s);
    return addXp(xp == null ? 5 : xp, "chest");
  }

  /** Build path nodes for one book: lists sorted, done/current/locked + chest every 3. */
  function pathNodes(lists, results, bookKey) {
    var Y = window.YYSD;
    var sorted = (lists || []).slice().sort(function (a, b) {
      return (Y.vocabListNo(a) - Y.vocabListNo(b)) ||
        String(a.title).localeCompare(String(b.title), "zh-Hans-CN", { numeric: true });
    });
    var res = results || {};
    var nodes = [];
    var currentSet = false;
    sorted.forEach(function (it, i) {
      var done = !!res[it.id];
      var unlocked = i === 0 || !!res[sorted[i - 1].id];
      var state;
      if (done) state = "done";
      else if (unlocked && !currentSet) { state = "current"; currentSet = true; }
      else state = "locked";
      nodes.push({ item: it, state: state, index: i, isChest: false });
      if ((i + 1) % 3 === 0) {
        var ck = "chest-" + it.id;
        var open = done;
        var claimed = hasChest(bookKey || "book", ck);
        nodes.push({
          item: { id: ck, title: "cuộc viễn chinhbiến thể của hộp", _chestAfter: it.id },
          state: !open ? "chest-locked" : (claimed ? "claimed" : "chest"),
          index: i,
          isChest: true,
          chestId: ck
        });
      }
    });
    // all cleared → keep last lesson as current for replay
    if (!currentSet) {
      for (var r = nodes.length - 1; r >= 0; r--) {
        if (!nodes[r].isChest) { nodes[r].state = "current"; break; }
      }
    }
    return nodes;
  }

  return {
    KEY: KEY,
    TITLES: TITLES,
    weekId: weekId,
    load: load,
    snapshot: snapshot,
    progressFromXp: progressFromXp,
    xpToNext: xpToNext,
    addXp: addXp,
    hasChest: hasChest,
    claimChest: claimChest,
    pathNodes: pathNodes
  };
})();
