"use strict";
/**
 * Ngân hàng đề trung tâm — papers are block-id lists pointing at existing Set / dated JSON.
 */
var crypto = require("crypto");
var fs = require("fs");
var path = require("path");

var KINDS = { practice: 1, full: 1, single: 1 };
var SKILLS = ["reading", "listening", "writing", "speaking"];
var SKILL_ZH = { reading: "Đọc", listening: "Nghe", writing: "Viết", speaking: "Nói" };
var STATUSES = { draft: 1, pending: 1, live: 1, unpublished: 1 };
var GROUP_TYPES = {
  complete_words: 1,
  choose_response: 1,
  sentence: 1,
  repeat: 1,
  interview: 1
};
var TYPE_ZH = {
  complete_words: " Từ vựng lấp chỗ trống ",
  daily_life: " sinh hoạt Đọc ",
  academic: " Học thuật văn chương ",
  choose_response: " nghe câu chọn đáp lại ",
  conversation: " đối thoại ",
  announcement: " thông tri ",
  lecture: " Học thuật toạ đàm ",
  sentence: " câu xây dựng ",
  email: " Email Viết ",
  discussion: " Thảo luận học thuật ",
  repeat: " Nghe thuật lại ",
  interview: " mô phỏng phỏng vấn "
};
// chạy nước rút bao ngày cuốn = library/toefl dặm bốn khoa đầy đủ hết cùng tên ngày; Giáo viên thượng truyền(*upload) tiếp xúc lên khung(vào VIP), không hề cứng rắn mã hóa danh sách
function stockMocks(repoRoot) {
  var dir = path.join(repoRoot || path.join(__dirname, ".."), "library", "toefl");
  var names;
  try { names = fs.readdirSync(dir); } catch (e) { return []; }
  var byId = {};
  names.forEach(function (f) {
    var m = /^(\d{4}-\d{2}-\d{2})-(reading|listening|writing|speaking)\.json$/.exec(f);
    if (!m) return;
    (byId[m[1]] = byId[m[1]] || {})[m[2]] = true;
  });
  return Object.keys(byId).filter(function (id) {
    return SKILLS.every(function (s) { return byId[id][s]; });
  }).sort();
}

function nowIso() {
  return new Date().toISOString();
}

function clip(s, n) {
  return String(s == null? "": s).trim().slice(0, n || 200);
}

function parseJson(raw, fallback) {
  try {
    var v = JSON.parse(raw);
    return v == null? fallback: v;
  } catch (e) {
    return fallback;
  }
}

function ensureSchema(db) {
  try { db.exec("ALTER TABLE teachers ADD COLUMN can_tiku INTEGER NOT NULL DEFAULT 0"); } catch (e) { /* exists */ }
  db.exec(
    "CREATE TABLE IF NOT EXISTS tiku_ip_allow (" +
      "ip TEXT PRIMARY KEY," +
      "note TEXT," +
      "created_at TEXT NOT NULL" +
    ");" +
    "CREATE TABLE IF NOT EXISTS tiku_papers (" +
      "id TEXT PRIMARY KEY," +
      "title TEXT NOT NULL UNIQUE," +
      "kind TEXT NOT NULL," +
      "status TEXT NOT NULL," +
      "owner TEXT NOT NULL," +
      "maker_id INTEGER," +
      "maker_phone TEXT," +
      "maker_name TEXT," +
      "skill_minutes TEXT," +
      "blocks TEXT NOT NULL," +
      "live_json TEXT," +
      "reject_note TEXT," +
      "created_at TEXT NOT NULL," +
      "updated_at TEXT NOT NULL," +
      "published_at TEXT" +
    ");"
  );
}

function clientIp(req) {
  var raw = String((req && req.ip) || "");
  if (raw.indexOf("::ffff:") === 0) raw = raw.slice(7);
  return raw.trim();
}

function isLoopback(ip) {
  return ip === "127.0.0.1" || ip === "::1" || ip === "localhost";
}

function v4(s) {
  var p = String(s).split(".");
  if (p.length!== 4) return null;
  var n = 0;
  for (var i = 0; i < 4; i++) {
    if (!/^\d{1,3}$/.test(p[i]) || +p[i] > 255) return null;
    n = n * 256 + +p[i];
  }
  return n;
}

/* điều mục thế nhưng là đơn IP, cũng có thể là IPv4 mạng lưới đoạn (CIDR). băng thông rộng trọng đám sẽ ở đoạn bên trong đổi ra khỏi miệng IP, thuần túy chính xác xứng đôi sẽ đem Giáo viên ngăn tại bên ngoài. */
function ipMatches(ip, entry) {
  var slash = entry.indexOf("/");
  if (slash < 0) return ip === entry;
  var bits = entry.slice(slash + 1);
  var a = v4(ip), net = v4(entry.slice(0, slash));
  if (a === null || net === null ||!/^\d{1,2}$/.test(bits) || +bits > 32) return false;
  var mask = +bits === 0? 0: ((-1 << (32 - +bits)) >>> 0);
  return ((a & mask) >>> 0) === ((net & mask) >>> 0);
}

// shortcut: IPv6 điều mục chỉ làm chính xác xứng đôi, không hỗ trợ tiền tố; thật muốn cho đi IPv6 mạng lưới đoạn lại bổ Giải thích đáp án.
function validIpEntry(s) {
  var slash = s.indexOf("/");
  if (slash < 0) return v4(s)!== null;
  return v4(s.slice(0, slash))!== null && /^\d{1,2}$/.test(s.slice(slash + 1)) && +s.slice(slash + 1) <= 32;
}

function ipAllowed(db, ip) {
  if (isLoopback(ip)) return true;
  if (!ip) return false;
  var rows = db.prepare("SELECT ip FROM tiku_ip_allow").all();
  for (var i = 0; i < rows.length; i++) {
    if (ipMatches(ip, rows[i].ip)) return true;
  }
  return false;
}

function listIps(db) {
  return db.prepare("SELECT ip, note, created_at FROM tiku_ip_allow ORDER BY ip").all();
}

function upsertIp(db, ip, note) {
  ip = clip(ip, 80);
  if (!ip ||!validIpEntry(ip) || isLoopback(ip)) return { error: " không có hiệu quả IP hoặc mạng lưới đoạn " };
  db.prepare(
    "INSERT INTO tiku_ip_allow (ip, note, created_at) VALUES (?,?,?) " +
    "ON CONFLICT(ip) DO UPDATE SET note = excluded.note"
  ).run(ip, clip(note, 80), nowIso());
  return { ok: true };
}

function deleteIp(db, ip) {
  db.prepare("DELETE FROM tiku_ip_allow WHERE ip =?").run(clip(ip, 80));
  return { ok: true };
}

function teacherCanTiku(db, teacher, isAdmin) {
  if (isAdmin) return true;
  if (!teacher ||!teacher.id) return false;
  var row = db.prepare("SELECT can_tiku FROM teachers WHERE id =?").get(teacher.id);
  return !!(row && row.can_tiku);
}

function setCanTiku(db, teacherId, on) {
  var id = Math.floor(Number(teacherId) || 0);
  if (!id) return { error: " không có hiệu quả Giáo viên " };
  var r = db.prepare("UPDATE teachers SET can_tiku =? WHERE id =?").run(on? 1: 0, id);
  if (!r.changes) return { error: " Giáo viên không tồn tại " };
  return { ok: true };
}

function listTeachersFlag(db) {
  return db.prepare(
    "SELECT id, phone, name, can_tiku, last_login_at FROM teachers ORDER BY id"
  ).all();
}

var PREDICTION_DIR = "server/data/toefl-prediction-2026-10-17";

function predictionManifest(repoRoot) {
  var file = path.join(repoRoot, PREDICTION_DIR, "manifest.json");
  return fs.existsSync(file)? JSON.parse(fs.readFileSync(file, "utf8")): null;
}

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { return null; }
}

function blockDetail(repoRoot, id) {
  var block = poolIndex(buildPool(repoRoot))[id];
  if (!block) return null;
  var file = block.source === "prediction"
    ? path.join(repoRoot, PREDICTION_DIR, block.skill + ".json")
    : path.join(repoRoot, block.source === "date"? "library": "app/library", "toefl",
      (block.paperId || "set-" + block.set) + "-" + block.skill + ".json");
  var paper = readJson(file);
  if (!paper) throw new Error(" đề mục văn bản tài liệu thiếu thốn ");
  var prediction = predictionManifest(repoRoot);
  var sourceItems = [];
  var assets = {};
  if (prediction && (block.sources || []).indexOf("prediction") >= 0) {
    var snapshot = readJson(path.join(repoRoot, PREDICTION_DIR, "snapshot.json"));
    if (!snapshot) throw new Error(" dự đoán bao nguyên thủy tư liệu thiếu thốn ");
    prediction.members.filter(function (m) { return m.blockId === id; }).forEach(function (m) {
      var item = snapshot.sections[m.key].items.filter(function (x) { return x.num === m.num; })[0];
      if (!item) throw new Error(" dự đoán bao nơi phát ra quan hệ thiếu thốn ");
      sourceItems.push(item);
    });
    prediction.assets.forEach(function (a) { assets[a.path] = a; });
  }
  var media = {};
  function rewrite(value) {
    if (Array.isArray(value)) return value.map(rewrite);
    if (value && typeof value === "object") {
      var out = {};
      Object.keys(value).forEach(function (k) { out[k] = rewrite(value[k]); });
      return out;
    }
    if (typeof value!== "string") return value;
    var asset = assets[value];
    if (asset) {
      var url = "/api/tiku/prediction/media/" + asset.filename;
      media[url] = { path: url, label: path.basename(asset.path), kind: asset.type, available:!asset.error };
      return url;
    }
    if (value.indexOf(PREDICTION_DIR + "/media/") === 0) {
      return "/api/tiku/prediction/media/" + path.basename(value);
    }
    return value;
  }
  var tasks = paper.tasks.slice(block.task, block.end + 1).map(rewrite);
  sourceItems.forEach(rewrite);
  return { ok: true, block: block, tasks: tasks, sourceItems: sourceItems, media: Object.keys(media).map(function (k) { return media[k]; }) };
}

function taskHay(t) {
  var parts = [];
  function add(s) {
    if (s!= null && s!== "") parts.push(String(s));
  }
  function walk(obj, depth) {
    if (obj == null || depth > 6) return;
    if (typeof obj === "string" || typeof obj === "number") {
      add(obj);
      return;
    }
    if (Array.isArray(obj)) {
      obj.forEach(function (x) { walk(x, depth + 1); });
      return;
    }
    if (typeof obj!== "object") return;
    Object.keys(obj).forEach(function (k) {
      if (/^(audio|image|fromSec|toSec|module|id|prefix)$/i.test(k)) return;
      walk(obj[k], depth + 1);
    });
  }
  walk(t, 0);
  return parts.join(" ").toLowerCase();
}

// Câu hỏi dặm không có có thể đọc tiểu tiêu đề lúc, subject/class/code dặm thường thường mới là (Email đề mục, toạ đàm bài tên). vô không cách mà lại mang liền ký tự hơn nửa là đánh số.
var CODE_LIKE = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)+$/;
function blockTitle(t, typ) {
  var fields = ["subject", "class", "code", "title", "titleZh"];
  for (var i = 0; i < fields.length; i++) {
    var v = t[fields[i]];
    if (typeof v === "string" && v.length > 1 &&!CODE_LIKE.test(v)) return v;
  }
  return TYPE_ZH[typ] || typ;
}

function blocksFromPaper(paper, meta) {
  var tasks = (paper && paper.tasks) || [];
  var out = [];
  var i = 0;
  while (i < tasks.length) {
    var t = tasks[i] || {};
    var typ = String(t.type || "");
    var end = i;
    if (GROUP_TYPES[typ] &&!(meta && meta.noGroup)) {
      while (end + 1 < tasks.length && tasks[end + 1].type === typ) end++;
    }
    var title = clip(blockTitle(t, typ), 120);
    var hay = "";
    var j;
    for (j = i; j <= end; j++) hay += " " + taskHay(tasks[j] || {});
    out.push({
      id: meta.prefix + "-" + typ + "-" + i,
      source: meta.source,
      skill: meta.skill,
      type: typ,
      title: title,
      titleZh: clip(t.titleZh || TYPE_ZH[typ] || title, 120),
      set: t.set || meta.set || null,
      paperId: meta.paperId || null,
      task: i,
      end: end,
      n: ((t.questions || []).length) || (end - i + 1),
      hay: hay
    });
    i = end + 1;
  }
  return out;
}

function buildPool(repoRoot) {
  var out = [];
  var n;
  for (n = 1; n <= 10; n++) {
    SKILLS.forEach(function (skill) {
      var file = path.join(repoRoot, "app", "library", "toefl", "set-" + n + "-" + skill + ".json");
      var paper = readJson(file);
      if (!paper) return;
      out = out.concat(blocksFromPaper(paper, {
        source: "set",
        skill: skill,
        set: n,
        prefix: "set-" + n + "-" + skill
      }));
    });
  }
  stockMocks(repoRoot).forEach(function (id) {
    SKILLS.forEach(function (skill) {
      var file = path.join(repoRoot, "library", "toefl", id + "-" + skill + ".json");
      var paper = readJson(file);
      if (!paper) return;
      out = out.concat(blocksFromPaper(paper, {
        source: "date",
        skill: skill,
        paperId: id,
        prefix: "date-" + id + "-" + skill
      }));
    });
  });
  ["bank-cw", "bank-rdl", "bank-rap"].forEach(function (id) {
    var file = path.join(repoRoot, "app", "library", "toefl", id + "-reading.json");
    var paper = readJson(file);
    if (!paper) return;
    out = out.concat(blocksFromPaper(paper, {
      source: "bank",
      skill: "reading",
      paperId: id,
      prefix: "bank-" + id + "-reading",
      noGroup: true
    }));
  });
  ["bank-cr", "bank-lcn", "bank-ano", "bank-at"].forEach(function (id) {
    var file = path.join(repoRoot, "app", "library", "toefl", id + "-listening.json");
    var paper = readJson(file);
    if (!paper) return;
    out = out.concat(blocksFromPaper(paper, {
      source: "bank",
      skill: "listening",
      paperId: id,
      prefix: "bank-" + id + "-listening",
      noGroup: true
    }));
  });
  ["bank-bs", "bank-we", "bank-ad"].forEach(function (id) {
    var file = path.join(repoRoot, "app", "library", "toefl", id + "-writing.json");
    var paper = readJson(file);
    if (!paper) return;
    out = out.concat(blocksFromPaper(paper, {
      source: "bank",
      skill: "writing",
      paperId: id,
      prefix: "bank-" + id + "-writing",
      noGroup: true
    }));
  });
  ["bank-lr", "bank-iv"].forEach(function (id) {
    var file = path.join(repoRoot, "app", "library", "toefl", id + "-speaking.json");
    var paper = readJson(file);
    if (!paper) return;
    out = out.concat(blocksFromPaper(paper, {
      source: "bank",
      skill: "speaking",
      paperId: id,
      prefix: "bank-" + id + "-speaking",
      noGroup: true
    }));
  });

  var prediction = predictionManifest(repoRoot);
  if (prediction) {
    var byId = poolIndex(out);
    var predictionPapers = {};
    prediction.members.forEach(function (member) {
      var b = byId[member.blockId];
      if (!member.reused) {
        b = Object.assign({}, member.block);
        var paper = predictionPapers[b.skill];
        if (!paper) paper = predictionPapers[b.skill] = readJson(path.join(repoRoot, PREDICTION_DIR, b.skill + ".json"));
        if (!paper) throw new Error(" dự đoán bao đề mục văn bản tài liệu thiếu thốn ");
        b.hay = paper.tasks.slice(b.task, b.end + 1).map(taskHay).join(" ");
        out.push(b);
        byId[b.id] = b;
      }
      if (!b) throw new Error(" dự đoán bao phục dùng câu khối không tồn tại: " + member.blockId);
      b.sources = [b.source];
      if (b.source!== "prediction") b.sources.push("prediction");
    });
  }
  return out;
}

function poolIndex(pool) {
  var map = Object.create(null);
  pool.forEach(function (b) { map[b.id] = b; });
  return map;
}

function normalizeMinutes(kind, raw) {
  if (kind === "practice") return {};
  var src = raw && typeof raw === "object"? raw: {};
  var out = {};
  SKILLS.forEach(function (s) {
    var n = Math.floor(Number(src[s]) || 0);
    if (n > 0) out[s] = Math.min(300, n);
  });
  return out;
}

function normalizeBlocks(raw, index) {
  if (!Array.isArray(raw) ||!raw.length) return { error: " ít nhất chọn một câu khối " };
  if (raw.length > 80) return { error: " câu khối quá nhiều " };
  var out = [];
  var seen = Object.create(null);
  for (var i = 0; i < raw.length; i++) {
    var id = clip((raw[i] && (raw[i].id || raw[i])) || "", 80);
    var b = index[id];
    if (!b) return { error: " câu khối không tồn tại: " + id };
    if (seen[id]) continue;
    seen[id] = 1;
    out.push(b);
  }
  if (!out.length) return { error: " ít nhất chọn một câu khối " };
  return { blocks: out };
}

function validateKind(kind, blocks) {
  if (!KINDS[kind]) return " loại hình không có hiệu quả ";
  if (blocks.some(function (b) { return b.source === "prediction"; })) return " dự đoán bao chỉ cung Giáo viên thẩm duyệt, không thể lên khung(vào VIP) cho học sinh ";
  if (kind!== "single") return "";
  var skill = blocks[0] && blocks[0].skill;
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].skill!== skill) return " Thi thử từng kỹ năng không thể lẫn vào khoa ";
  }
  return "";
}

function newId() {
  return "tp_" + crypto.randomBytes(8).toString("hex");
}

function workingOf(row) {
  return {
    title: row.title,
    kind: row.kind,
    skillMinutes: parseJson(row.skill_minutes, {}),
    blocks: parseJson(row.blocks, [])
  };
}

function liveOf(row) {
  if (row.live_json) return parseJson(row.live_json, null);
  if (row.status === "live") return workingOf(row);
  return null;
}

function publicPaper(row, live) {
  var body = live || liveOf(row);
  if (!body) return null;
  return {
    id: row.id,
    title: body.title,
    kind: body.kind,
    skillMinutes: body.skillMinutes || {},
    blocks: body.blocks || [],
    makerName: row.owner === "hq"? " tổng bộ ": (row.maker_name || ""),
    owner: row.owner,
    status: row.status
  };
}

function staffPaper(row) {
  return {
    id: row.id,
    title: row.title,
    kind: row.kind,
    status: row.status,
    owner: row.owner,
    makerId: row.maker_id,
    makerPhone: row.maker_phone || "",
    makerName: row.maker_name || "",
    skillMinutes: parseJson(row.skill_minutes, {}),
    blocks: parseJson(row.blocks, []),
    live: liveOf(row),
    rejectNote: row.reject_note || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at
  };
}

function snapshot(row) {
  return JSON.stringify(workingOf(row));
}

function getPaper(db, id) {
  return db.prepare("SELECT * FROM tiku_papers WHERE id =?").get(id);
}

function titleTaken(db, title, exceptId) {
  var row = db.prepare("SELECT id FROM tiku_papers WHERE title =?").get(title);
  return !!(row && row.id!== exceptId);
}

function canEdit(row, teacher, isAdmin) {
  if (!row) return false;
  if (row.status === "unpublished") return false;
  if (isAdmin) return true;
  if (row.owner === "hq") return false;
  return !!(teacher && row.maker_id === teacher.id);
}

function canUnpublish(row, teacher, isAdmin) {
  if (!row || row.status!== "live" &&!(row.live_json && row.status === "pending")) return false;
  if (row.status === "unpublished") return false;
  if (isAdmin) return true;
  if (row.owner === "hq") return false;
  return !!(teacher && row.maker_id === teacher.id);
}

function createPaper(db, teacher, body, isAdmin, index) {
  var title = clip(body && body.title, 80);
  var kind = clip(body && body.kind, 20);
  if (!title) return { error: " mời điền cuốn tên " };
  if (titleTaken(db, title, "")) return { error: " cuốn tên đã tồn tại " };
  var nb = normalizeBlocks(body && body.blocks, index);
  if (nb.error) return nb;
  var kindErr = validateKind(kind, nb.blocks);
  if (kindErr) return { error: kindErr };
  var minutes = normalizeMinutes(kind, body && body.skillMinutes);
  var id = clip(body && body.id, 40) || newId();
  if (getPaper(db, id)) return { error: " cuốn đã tồn tại " };
  var owner = isAdmin && body && body.owner === "hq"? "hq": "teacher";
  if (!isAdmin) owner = "teacher";
  db.prepare(
    "INSERT INTO tiku_papers (id, title, kind, status, owner, maker_id, maker_phone, maker_name, " +
    "skill_minutes, blocks, live_json, reject_note, created_at, updated_at, published_at) " +
    "VALUES (?,?,?, 'draft',?,?,?,?,?,?, NULL, '',?,?, NULL)"
  ).run(
    id, title, kind, owner,
    teacher && teacher.id || null,
    teacher && teacher.phone || "",
    teacher && teacher.name || "",
    JSON.stringify(minutes),
    JSON.stringify(nb.blocks),
    nowIso(), nowIso()
  );
  return { ok: true, paper: staffPaper(getPaper(db, id)) };
}

function savePaper(db, id, teacher, body, isAdmin, index) {
  var row = getPaper(db, id);
  if (!row) return { error: " cuốn không tồn tại " };
  if (!canEdit(row, teacher, isAdmin)) return { error: " không thể sửa bộ này cuốn " };
  var title = clip(body && body.title, 80) || row.title;
  if (titleTaken(db, title, id)) return { error: " cuốn tên đã tồn tại " };
  var kind = clip(body && body.kind, 20) || row.kind;
  var nb = normalizeBlocks(body && body.blocks, index);
  if (nb.error) return nb;
  var kindErr = validateKind(kind, nb.blocks);
  if (kindErr) return { error: kindErr };
  var minutes = normalizeMinutes(kind, body && body.skillMinutes);
  // miễn tra xét: sửa đã lên khung(vào VIP) cuốn trực tiếp bảo trì lên khung(vào VIP) cũng Làm mới live_json, Học viên đầu lập tức có hiệu lực
  var wasLive = row.status === "live";
  db.prepare(
    "UPDATE tiku_papers SET title=?, kind=?, skill_minutes=?, blocks=?, status=?, updated_at=? WHERE id=?"
  ).run(title, kind, JSON.stringify(minutes), JSON.stringify(nb.blocks), wasLive? "live": row.status, nowIso(), id);
  if (wasLive) {
    db.prepare("UPDATE tiku_papers SET live_json=? WHERE id=?").run(snapshot(getPaper(db, id)), id);
  }
  return { ok: true, paper: staffPaper(getPaper(db, id)) };
}

function submitPaper(db, id, teacher, isAdmin, index) {
  var row = getPaper(db, id);
  if (!row) return { error: " cuốn không tồn tại " };
  if (!canEdit(row, teacher, isAdmin)) return { error: " không thể lên khung(vào VIP) bộ này cuốn " };
  if (row.status === "unpublished") return { error: " đã loại bỏ, mời trùng tân tổ cuốn " };
  var blocks = parseJson(row.blocks, []);
  var kindErr = validateKind(row.kind, blocks);
  if (kindErr) return { error: kindErr };
  if (index) {
    var nb = normalizeBlocks(blocks, index);
    if (nb.error) return nb;
  }
  // miễn tra xét: cơ cấu tổ cuốn trực tiếp lên khung(vào VIP) (SaaS tự trị, bình đài không tra xét nội dung)
  var t = nowIso();
  db.prepare(
    "UPDATE tiku_papers SET status='live', live_json=?, reject_note='', " +
    "published_at=COALESCE(published_at,?), updated_at=? WHERE id=?"
  ).run(snapshot(row), t, t, id);
  return { ok: true, paper: staffPaper(getPaper(db, id)) };
}

function approvePaper(db, id, body) {
  var row = getPaper(db, id);
  if (!row) return { error: " cuốn không tồn tại " };
  if (row.status!== "pending") return { error: " không có ở đây đợi tra xét " };
  var kindErr = validateKind(row.kind, parseJson(row.blocks, []));
  if (kindErr) return { error: kindErr };
  var title = clip(body && body.title, 80) || row.title;
  if (titleTaken(db, title, id)) return { error: " cuốn tên đã tồn tại " };
  var t = nowIso();
  db.prepare(
    "UPDATE tiku_papers SET title=?, live_json=?, status='live', reject_note='', " +
    "published_at=COALESCE(published_at,?), updated_at=? WHERE id=?"
  ).run(title, snapshot(Object.assign({}, row, { title: title })), t, t, id);
  return { ok: true, paper: staffPaper(getPaper(db, id)) };
}

function rejectPaper(db, id, note) {
  var row = getPaper(db, id);
  if (!row) return { error: " cuốn không tồn tại " };
  if (row.status!== "pending") return { error: " không có ở đây đợi tra xét " };
  var next = row.live_json? "live": "draft";
  db.prepare("UPDATE tiku_papers SET status=?, reject_note=?, updated_at=? WHERE id=?")
    .run(next, clip(note, 200), nowIso(), id);
  return { ok: true, paper: staffPaper(getPaper(db, id)) };
}

function unpublishPaper(db, id, teacher, isAdmin) {
  var row = getPaper(db, id);
  if (!row) return { error: " cuốn không tồn tại " };
  if (row.status === "unpublished") return { error: " đã loại bỏ " };
  if (!row.live_json && row.status!== "live") return { error: " còn chưa lên khung(vào VIP) " };
  if (!isAdmin && (row.owner === "hq" ||!teacher || row.maker_id!== teacher.id)) {
    return { error: " không thể loại bỏ bộ này cuốn " };
  }
  db.prepare("UPDATE tiku_papers SET status='unpublished', updated_at=? WHERE id=?")
    .run(nowIso(), id);
  return { ok: true, paper: staffPaper(getPaper(db, id)) };
}

function listStaff(db, teacher, isAdmin) {
  var rows = isAdmin
    ? db.prepare("SELECT * FROM tiku_papers ORDER BY updated_at DESC").all()
    : db.prepare("SELECT * FROM tiku_papers WHERE maker_id =? ORDER BY updated_at DESC").all(teacher.id);
  return rows.map(staffPaper);
}

function catalog(db, kind) {
  var rows = db.prepare(
    "SELECT * FROM tiku_papers WHERE status IN ('live','pending') AND live_json IS NOT NULL"
  ).all();
  var papers = [];
  var sets = [];
  var mocks = [];
  rows.forEach(function (row) {
    var live = liveOf(row);
    if (!live) return;
    if (String(row.id).indexOf("hq-set-") === 0) {
      var n = Number(String(row.id).slice(7));
      if (n >= 1 && n <= 10 && sets.indexOf(n) < 0) sets.push(n);
    }
    var hm = /^hq-(\d{4}-\d{2}-\d{2})$/.exec(String(row.id));
    if (hm && mocks.indexOf(hm[1]) < 0) mocks.push(hm[1]);
    if (kind && live.kind!== kind) return;
    if (String(row.id).indexOf("hq-set-") === 0) return;
    if (String(row.id).indexOf("hq-20") === 0) return;
    papers.push(publicPaper(row, live));
  });
  return {
    papers: papers,
    stock: { sets: sets.sort(function (a, b) { return a - b; }), mocks: mocks.sort() }
  };
}

function playPaper(db, id) {
  var row = getPaper(db, id);
  if (!row) return { error: " cuốn không tồn tại " };
  var live = liveOf(row);
  if (!live) return { error: " bộ này cuốn còn chưa lên khung " };
  return { ok: true, paper: publicPaper(row, live) };
}

/* Gói tăng tốc trước kỳ thi = đã phát hành full/single cuốn (hàm tổng bộ ngày cuốn, lối vào khỏa thân ngày id và hq- tiền tố đều nhận thức) */
function normPackageId(dbId) {
  var s = String(dbId || "");
  return s.indexOf("hq-") === 0? s.slice(3): s;
}

// ponytail: status cũng tạp live/pending —— loại bỏ cuốn live_json vẫn còn, nhưng không thể tính lại bao
function resolvePackage(db, id) {
  id = clip(id, 64);
  var row = id? (getPaper(db, id) || getPaper(db, "hq-" + id)): null;
  if (!row || (row.status!== "live" && row.status!== "pending")) return null;
  var live = liveOf(row);
  if (!live || (live.kind!== "full" && live.kind!== "single")) return null;
  return { id: normPackageId(row.id), kind: live.kind, title: live.title, row: row };
}

function listPackages(db) {
  var rows = db.prepare(
    "SELECT * FROM tiku_papers WHERE status IN ('live','pending') AND live_json IS NOT NULL ORDER BY updated_at DESC"
  ).all();
  return rows.map(function (row) {
    var live = liveOf(row);
    if (!live || (live.kind!== "full" && live.kind!== "single")) return null;
    return {
      id: normPackageId(row.id),
      title: live.title,
      kind: live.kind,
      owner: row.owner,
      makerName: row.owner === "hq"? " tổng bộ ": (row.maker_name || "")
    };
  }).filter(Boolean);
}

function seedStock(db, repoRoot) {
  var index = poolIndex(buildPool(repoRoot));
  var titles = {
    1: "Set 1 Luyện tập ", 2: "Set 2 Luyện tập ", 3: "Set 3 Luyện tập ", 4: "Set 4 Luyện tập ", 5: "Set 5 Luyện tập ",
    6: "Set 6 Luyện tập ", 7: "Set 7 Luyện tập ", 8: "Set 8 Luyện tập ", 9: "Set 9 Luyện tập ", 10: "Set 10 Luyện tập "
  };
  var n;
  for (n = 1; n <= 10; n++) {
    var blocks = [];
    Object.keys(index).forEach(function (id) {
      if (index[id].source === "set" && index[id].set === n) blocks.push(index[id]);
    });
    upsertSeed(db, "hq-set-" + n, titles[n], "practice", blocks, {});
  }
  stockMocks(repoRoot).forEach(function (id) {
    var seedBlocks = [];
    Object.keys(index).forEach(function (bid) {
      if (index[bid].paperId === id) seedBlocks.push(index[bid]);
    });
    var rp = readJson(path.join(repoRoot, "library", "toefl", id + "-reading.json"));
    var title = clip(String((rp && rp.title) || "").replace(/·\s* Đọc $/, "· Thi thử toàn phần "), 80) ||
      " TOEFL iBT " + id + " · Thi thử toàn phần ";
    upsertSeed(db, "hq-" + id, title, "full", seedBlocks, {
      reading: 36, listening: 36, writing: 29, speaking: 16
    });
  });
}

function upsertSeed(db, id, title, kind, blocks, minutes) {
  if (getPaper(db, id)) return;
  if (titleTaken(db, title, id)) return;
  var t = nowIso();
  var working = { title: title, kind: kind, skillMinutes: minutes || {}, blocks: blocks };
  db.prepare(
    "INSERT INTO tiku_papers (id, title, kind, status, owner, maker_id, maker_phone, maker_name, " +
    "skill_minutes, blocks, live_json, reject_note, created_at, updated_at, published_at) " +
    "VALUES (?,?,?, 'live', 'hq', NULL, '', ' tổng bộ ',?,?,?, '',?,?,?)"
  ).run(id, title, kind, JSON.stringify(minutes || {}), JSON.stringify(blocks), JSON.stringify(working), t, t, t);
}

function sendErr(res, code, msg) {
  return res.status(code).json({ error: msg });
}

function mountRoutes(app, deps) {
  var db = deps.db;
  var repoRoot = deps.repoRoot;
  ensureSchema(db);
  try { seedStock(db, repoRoot); } catch (e) { console.error("[tiku] seed", e && e.message); }
  // ponytail: no process cache — Làm mới phải lập tức ăn vào mới JSON; Giáo viên tiếp lời, đọc mười mấy cái văn bản tài liệu có thể tiếp nhận
  function pool() {
    return buildPool(repoRoot);
  }
  function index() { return poolIndex(pool()); }

  function tikuAuth(req, res, next) {
    deps.teacherAuthMiddleware(req, res, function () {
      var ip = clientIp(req);
      if (!req.user.masterKey &&!ipAllowed(db, ip)) return sendErr(res, 403, " trước mắt mạng lưới *internet không thể mở ra Ngân hàng đề trung tâm ");
      var teacher = db.prepare("SELECT * FROM teachers WHERE phone =?").get(req.user.phone);
      var admin = deps.isAdminPhone(req.user.phone);
      if (!teacher &&!admin) return sendErr(res, 403, " xin sử dụng Giáo viên tài khoản Đăng nhập ");
      if (!teacherCanTiku(db, teacher, admin)) return sendErr(res, 403, " không kích hoạt Ngân hàng đề trung tâm ");
      req.tikuTeacher = teacher || { id: 0, phone: req.user.phone, name: " tổng bộ " };
      req.tikuAdmin = admin;
      req.tikuCanGrant = admin || deps.isOrgAdminReq(req);
      next();
    });
  }

  function hqOnly(req, res, next) {
    tikuAuth(req, res, function () {
      if (!req.tikuAdmin) return sendErr(res, 403, " chỉ có tổng bộ có thể xét duyệt ");
      next();
    });
  }

  app.get("/api/tiku/me", tikuAuth, function (req, res) {
    res.json({
      ok: true,
      teacher: {
        id: req.tikuTeacher.id,
        phone: req.tikuTeacher.phone,
        name: req.tikuTeacher.name || "",
        isAdmin:!!req.tikuAdmin,
        canGrant:!!req.tikuCanGrant,
        canTiku: true
      }
    });
  });

  app.get("/api/tiku/pool", tikuAuth, function (req, res) {
    res.setHeader("Cache-Control", "private, no-store");
    var prediction = predictionManifest(repoRoot);
    res.json({ ok: true, blocks: pool(), prediction: prediction? {
      groups: prediction.members.length,
      questions: prediction.questionCount,
      media: prediction.assets.length,
      unavailableMedia: prediction.assets.filter(function (a) { return!!a.error; }).length
    }: null });
  });

  app.get("/api/tiku/blocks/:id", tikuAuth, function (req, res) {
    var out = blockDetail(repoRoot, req.params.id);
    if (!out) return sendErr(res, 404, " câu khối không tồn tại ");
    res.setHeader("Cache-Control", "private, no-store");
    res.json(out);
  });

  app.get("/api/tiku/prediction/media/:file", tikuAuth, function (req, res) {
    var filename = req.params.file;
    if (!/^[a-f0-9]{24}\.[a-z0-9]+$/.test(filename)) return sendErr(res, 404, " tài nguyên không tồn tại ");
    var manifest = predictionManifest(repoRoot);
    var asset = manifest && manifest.assets.filter(function (a) { return a.filename === filename &&!a.error; })[0];
    if (!asset) return sendErr(res, 404, " nguyên bao tài nguyên không thể dùng ");
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.type(asset.contentType);
    res.sendFile(path.join(repoRoot, PREDICTION_DIR, "media", filename));
  });

  app.get("/api/tiku/papers", tikuAuth, function (req, res) {
    res.json({ ok: true, papers: listStaff(db, req.tikuTeacher, req.tikuAdmin) });
  });

  app.get("/api/tiku/papers/:id", tikuAuth, function (req, res) {
    var row = getPaper(db, req.params.id);
    if (!row) return sendErr(res, 404, " cuốn không tồn tại ");
    if (!req.tikuAdmin && row.maker_id!== req.tikuTeacher.id && row.owner!== "hq") {
      return sendErr(res, 404, " cuốn không tồn tại ");
    }
    if (!req.tikuAdmin && row.owner === "hq" && row.maker_id!== req.tikuTeacher.id) {
      return sendErr(res, 403, " tổng bộ cuốn chỉ có tổng bộ có thể nhìn tình hình cụ thể và tỉ mỉ ");
    }
    res.json({ ok: true, paper: staffPaper(row) });
  });

  app.post("/api/tiku/papers", tikuAuth, function (req, res) {
    var out = createPaper(db, req.tikuTeacher, req.body || {}, req.tikuAdmin, index());
    if (out.error) return sendErr(res, 400, out.error);
    res.json(out);
  });

  app.put("/api/tiku/papers/:id", tikuAuth, function (req, res) {
    var out = savePaper(db, req.params.id, req.tikuTeacher, req.body || {}, req.tikuAdmin, index());
    if (out.error) return sendErr(res, 400, out.error);
    res.json(out);
  });

  app.post("/api/tiku/papers/:id/submit", tikuAuth, function (req, res) {
    var out = submitPaper(db, req.params.id, req.tikuTeacher, req.tikuAdmin, index());
    if (out.error) return sendErr(res, 400, out.error);
    res.json(out);
  });

  app.post("/api/tiku/papers/:id/approve", hqOnly, function (req, res) {
    var out = approvePaper(db, req.params.id, req.body || {});
    if (out.error) return sendErr(res, 400, out.error);
    res.json(out);
  });

  app.post("/api/tiku/papers/:id/reject", hqOnly, function (req, res) {
    var out = rejectPaper(db, req.params.id, req.body && req.body.note);
    if (out.error) return sendErr(res, 400, out.error);
    res.json(out);
  });

  app.post("/api/tiku/papers/:id/unpublish", tikuAuth, function (req, res) {
    var out = unpublishPaper(db, req.params.id, req.tikuTeacher, req.tikuAdmin);
    if (out.error) return sendErr(res, 400, out.error);
    res.json(out);
  });

  app.get("/api/tiku/catalog", deps.authMiddleware, function (req, res) {
    res.setHeader("Cache-Control", "private, no-store");
    res.json({ ok: true, kind: clip(req.query.kind, 20), catalog: catalog(db, clip(req.query.kind, 20)) });
  });

  app.get("/api/tiku/play/:id", deps.authMiddleware, function (req, res) {
    var out = playPaper(db, req.params.id);
    if (out.error) return sendErr(res, 404, out.error);
    res.json(out);
  });

  app.get("/api/platform/tiku/teachers", deps.platformAuthMiddleware, function (req, res) {
    res.json({
      ok: true,
      teachers: listTeachersFlag(db).map(function (t) {
        return {
          id: t.id,
          phone: t.phone,
          name: t.name || "",
          canTiku:!!t.can_tiku,
          lastLoginAt: t.last_login_at
        };
      })
    });
  });

  app.post("/api/platform/tiku/teachers/:id", deps.platformAuthMiddleware, function (req, res) {
    var out = setCanTiku(db, req.params.id,!!(req.body && req.body.canTiku));
    if (out.error) return sendErr(res, 400, out.error);
    res.json(out);
  });

  app.get("/api/platform/tiku/ips", deps.platformAuthMiddleware, function (req, res) {
    res.json({ ok: true, ips: listIps(db) });
  });

  app.post("/api/platform/tiku/ips", deps.platformAuthMiddleware, function (req, res) {
    var out = upsertIp(db, req.body && req.body.ip, req.body && req.body.note);
    if (out.error) return sendErr(res, 400, out.error);
    res.json({ ok: true, ips: listIps(db) });
  });

  app.delete("/api/platform/tiku/ips", deps.platformAuthMiddleware, function (req, res) {
    deleteIp(db, req.body && req.body.ip);
    res.json({ ok: true, ips: listIps(db) });
  });
}

function selfCheck(repoRoot) {
  var Database = require("better-sqlite3");
  var db = new Database(":memory:");
  db.exec("CREATE TABLE teachers (id INTEGER PRIMARY KEY, phone TEXT, name TEXT, can_tiku INTEGER DEFAULT 0)");
  db.prepare("INSERT INTO teachers (id, phone, name, can_tiku) VALUES (1,'13800000001',' giáp ',1)").run();
  db.prepare("INSERT INTO teachers (id, phone, name, can_tiku) VALUES (2,'13800000002',' ất ',1)").run();
  ensureSchema(db);
  db.prepare("INSERT INTO tiku_ip_allow (ip, note, created_at) VALUES ('36.33.245.0/24',' mạng lưới đoạn ','t')").run();
  db.prepare("INSERT INTO tiku_ip_allow (ip, note, created_at) VALUES ('10.0.0.7',' đơn IP','t')").run();
  if (!ipAllowed(db, "36.33.245.222")) throw new Error("cidr should allow");
  if (ipAllowed(db, "36.33.246.222")) throw new Error("cidr leaks out of /24");
  if (!ipAllowed(db, "10.0.0.7") || ipAllowed(db, "10.0.0.8")) throw new Error("exact ip");
  if (!validIpEntry("1.2.3.4") ||!validIpEntry("1.2.3.0/24")) throw new Error("valid entry rejected");
  if (validIpEntry("1.2.3.256") || validIpEntry("1.2.3.0/33") || validIpEntry("::1")) throw new Error("bad entry accepted");
  if (upsertIp(db, "1.2.3.0/33", "x").error!== " không có hiệu quả IP hoặc mạng lưới đoạn ") throw new Error("upsert keeps bad mask");
  var pool = buildPool(repoRoot);
  if (pool.length < 40) throw new Error("pool too small " + pool.length);
  var index = poolIndex(pool);
  var b1 = pool.filter(function (b) { return b.skill === "reading"; })[0];
  var b2 = pool.filter(function (b) { return b.skill === "listening"; })[0];
  if (!b1 ||!b2) throw new Error("need mixed blocks");
  var t1 = { id: 1, phone: "13800000001", name: " giáp " };
  var created = createPaper(db, t1, { title: " chín tháng Đọc luyện ", kind: "single", blocks: [b1.id], skillMinutes: { reading: 20 } }, false, index);
  if (!created.ok) throw new Error(created.error);
  if (validateKind("single", [b1, b2])!== " Thi thử từng kỹ năng không thể lẫn vào khoa ") throw new Error("mix single");
  var mixed = createPaper(db, t1, { title: " lẫn vào khoa thi đơn ", kind: "single", blocks: [b1.id, b2.id] }, false, index);
  if (!mixed.error) throw new Error("should block mixed single");
  var dup = createPaper(db, t1, { title: " chín tháng Đọc luyện ", kind: "practice", blocks: [b1.id] }, false, index);
  if (!dup.error) throw new Error("dup title");
  // miễn tra xét: submit trực tiếp lên khung(vào VIP), Học viên đầu lập tức có thể thấy được
  var sub = submitPaper(db, created.paper.id, t1, false, index);
  if (sub.paper.status!== "live") throw new Error("submit goes straight live");
  if (liveOf(getPaper(db, created.paper.id)).skillMinutes.reading!== 20) throw new Error("students see submit");
  // miễn tra xét: sửa đã lên khung(vào VIP) cuốn bảo trì lên khung(vào VIP) cũng Làm mới live_json
  var saved = savePaper(db, created.paper.id, t1, { title: " chín tháng Đọc luyện ", kind: "single", blocks: [b1.id], skillMinutes: { reading: 15 } }, false, index);
  if (saved.paper.status!== "live") throw new Error("edit keeps live");
  if (liveOf(getPaper(db, created.paper.id)).skillMinutes.reading!== 15) throw new Error("students see edit");
  // miễn tra xét sau không hề sinh ra pending; approve/reject chỉ kiêm dung Lịch sử pending đi
  if (!rejectPaper(db, created.paper.id, "x").error) throw new Error("reject needs pending");
  if (!approvePaper(db, created.paper.id, {}).error) throw new Error("approve needs pending");
  db.prepare("UPDATE tiku_papers SET status='pending' WHERE id=?").run(created.paper.id);
  var rej = rejectPaper(db, created.paper.id, " sửa thời gian ");
  if (rej.paper.status!== "live") throw new Error("reject keeps live");
  db.prepare("UPDATE tiku_papers SET status='pending' WHERE id=?").run(created.paper.id);
  var ok = approvePaper(db, created.paper.id, { title: " chín tháng Đọc luyện " });
  if (ok.paper.status!== "live" ||!ok.paper.live) throw new Error("approve");
  var t2 = { id: 2, phone: "13800000002", name: " ất " };
  if (canEdit(getPaper(db, created.paper.id), t2, false)) throw new Error("other teacher");
  var dead = unpublishPaper(db, created.paper.id, t1, false);
  if (dead.paper.status!== "unpublished") throw new Error("unpub");
  var again = submitPaper(db, created.paper.id, t1, false, index);
  if (!again.error) throw new Error("no relist");
  if (!ipAllowed(db, "127.0.0.1")) throw new Error("loopback");
  if (ipAllowed(db, "8.8.8.8")) throw new Error("empty allow");
  upsertIp(db, "8.8.8.8", "test");
  if (!ipAllowed(db, "8.8.8.8")) throw new Error("allow");
  seedStock(db, repoRoot);
  var cat = catalog(db, "practice");
  var mockCount = stockMocks(repoRoot).length;
  if (cat.stock.sets.length!== 10) throw new Error("seed sets " + cat.stock.sets);
  if (cat.stock.mocks.length!== mockCount) throw new Error("seed mocks " + cat.stock.mocks.length + "/" + mockCount);
  if (mockCount < 22) throw new Error("date mocks on disk " + mockCount);
  if (playPaper(db, created.paper.id).error) throw new Error("in-progress after unpub");
  var pkg = resolvePackage(db, "2025-07-16");
  if (!pkg || pkg.id!== "2025-07-16" || pkg.kind!== "full") throw new Error("resolve date pkg");
  if (!resolvePackage(db, "hq-2025-07-16")) throw new Error("resolve hq prefix");
  if (resolvePackage(db, "hq-set-1")) throw new Error("practice is not a package");
  if (resolvePackage(db, "tp_nope")) throw new Error("missing package");
  var pkgs = listPackages(db);
  if (pkgs.length!== mockCount) throw new Error("packages " + pkgs.length + "/" + mockCount);
  if (normPackageId("hq-2025-09-02")!== "2025-09-02") throw new Error("normPackageId");
  db.close();
}

module.exports = {
  KINDS: KINDS,
  SKILLS: SKILLS,
  SKILL_ZH: SKILL_ZH,
  stockMocks: stockMocks,
  ensureSchema: ensureSchema,
  buildPool: buildPool,
  blockDetail: blockDetail,
  validateKind: validateKind,
  clientIp: clientIp,
  ipAllowed: ipAllowed,
  catalog: catalog,
  seedStock: seedStock,
  resolvePackage: resolvePackage,
  listPackages: listPackages,
  normPackageId: normPackageId,
  mountRoutes: mountRoutes,
  selfCheck: selfCheck
};
