"use strict";
/**
 * TOEFL trao quyền — Khu luyện tập (scope=practice) + Gói tăng tốc trước kỳ thi (scope=package:< cuốn id>).
 * Quản trị viên đại lượng mở / màn; Giáo viên hạn học viên thuộc quyền quản lý của mình bắt đầu thi vọt tới trước đâm bao.
 * lối vào chỉ phụ trách biểu hiện Khóa thái; có thể hay không tiến dùng bản module /api/toefl/access và /api/toefl/exam-start làm chuẩn.
 * thư thả lời nói nghĩa: Thi thử màn ngừng / đến kỳ lúc, đã mở khảo thi Chưa hoàn thành buổi diễn 24h bên trong có thể trở về thi xong, không cắt ngang đang tiến hành đáp lại.
 */
var PKG_PREFIX = "package:";
var GRACE_MS = 24 * 3600 * 1000;

function nowIso() {
  return new Date().toISOString();
}

function ensureSchema(db) {
  db.exec(
    "CREATE TABLE IF NOT EXISTS toefl_grants (" +
      "id INTEGER PRIMARY KEY AUTOINCREMENT," +
      "user_id INTEGER NOT NULL," +
      "scope TEXT NOT NULL," +
      "status TEXT NOT NULL DEFAULT 'on'," +
      "start_at TEXT," +
      "expire_at TEXT," +
      "created_by INTEGER," +
      "created_by_name TEXT," +
      "created_at TEXT NOT NULL," +
      "updated_at TEXT NOT NULL" +
    ");" +
    "CREATE UNIQUE INDEX IF NOT EXISTS toefl_grants_user_scope ON toefl_grants (user_id, scope);" +
    "CREATE TABLE IF NOT EXISTS toefl_exam_starts (" +
      "user_id INTEGER NOT NULL," +
      "package_id TEXT NOT NULL," +
      "started_at TEXT NOT NULL," +
      "finished_at TEXT," +
      "PRIMARY KEY (user_id, package_id)" +
    ");"
  );
}

function parseTime(v, what) {
  if (v == null || v === "") return { v: null };
  var ms = Date.parse(v);
  if (isNaN(ms)) return { error: what + " cách thức không đúng " };
  return { v: new Date(ms).toISOString() };
}

/** trao quyền Trạng thái cơ: none/off/scheduled/expired/on. nowMs do thuyên chuyển phương truyền vào, thuận tiện Kiểm tra. */
function grantState(row, nowMs) {
  if (!row) return { on: false, reason: "none" };
  if (row.status!== "on") return { on: false, reason: "off" };
  if (row.start_at && nowMs < Date.parse(row.start_at)) {
    return { on: false, reason: "scheduled", startAt: row.start_at, expireAt: row.expire_at || null };
  }
  if (row.expire_at && nowMs >= Date.parse(row.expire_at)) {
    return { on: false, reason: "expired", startAt: row.start_at || null, expireAt: row.expire_at };
  }
  return { on: true, startAt: row.start_at || null, expireAt: row.expire_at || null };
}

/** Gói tăng tốc trước kỳ thi Trạng thái = trao quyền Trạng thái + bắt đầu thi thư thả.
 * ponytail: thư thả cửa sổ 24h —— màn ngừng sau bắt đầu thi Chưa hoàn thành cuốn có thể tại cửa sổ bên trong thi xong bổn tràng; ngoài cửa sổ Chưa hoàn thành ghi chép coi là vứt bỏ khảo thi. */
function packageState(grant, start, nowMs) {
  var st = grantState(grant, nowMs);
  if (st.on) return st;
  if (start &&!start.finished_at && nowMs - Date.parse(start.started_at) < GRACE_MS) {
    return { on: true, grace: true, reason: "grace", expireAt: st.expireAt || null };
  }
  return st;
}

function loadGrantRows(db, scopes, orgId) {
  var marks = scopes.map(function () { return "?"; }).join(",");
  var stmt = db.prepare(
    "SELECT g.*, u.display_name, u.phone FROM toefl_grants g JOIN users u ON u.id = g.user_id " +
    "WHERE g.scope IN (" + marks + ") AND u.org_id =? ORDER BY g.updated_at DESC"
  );
  return stmt.all.apply(stmt, scopes.concat([orgId]));
}

function validateGrantWindow(body) {
  var on = body.action!== "off";
  var start = parseTime(body.startAt, " lúc bắt đầu lúc giữa ");
  if (start.error) return { error: start.error };
  var expire = parseTime(body.expireAt, " đến kỳ thời gian ");
  if (expire.error) return { error: expire.error };
  if (on && expire.v && Date.parse(expire.v) <= Date.now()) {
    return { error: " đến kỳ thời gian Đã qua, mời chọn tương lai thời gian " };
  }
  if (on && start.v && expire.v && Date.parse(start.v) >= Date.parse(expire.v)) {
    return { error: " đến kỳ thời gian cần muộn tại lúc bắt đầu lúc giữa " };
  }
  return { on: on, start: start.v, expire: expire.v };
}

// đại lượng đối tượng Giải thích đáp án: dấu phẩy ngăn + đi trọng + hạn mức cao nhất (phòng một lần ghi bạo). thuần túy hàm số, selfCheck bao trùm.
function splitScopes(raw) {
  var list = String(raw == null || raw === ""? "practice": raw).split(",")
    .map(function (x) { return x.trim(); })
    .filter(Boolean)
    .filter(function (v, i, a) { return a.indexOf(v) === i; })
    .slice(0, 20);
  return list.length? list: ["practice"];
}

function adminNameOf(db, req) {
  if (!req.user.phone) return " tổng bộ ";
  var t = db.prepare("SELECT name FROM teachers WHERE phone =?").get(req.user.phone);
  return (t && t.name) || " Quản trị viên ";
}

function mountRoutes(app, deps) {
  var db = deps.db;
  ensureSchema(db);

  // practice hoặc package:< đã phát hành full/single cuốn >; bao id thống nhất đi hq- tiền tố
  function scopeInfo(scope) {
    scope = String(scope || "practice").trim();
    if (scope === "practice") return { scope: "practice" };
    if (scope.indexOf(PKG_PREFIX) === 0) {
      var p = deps.tiku.resolvePackage(db, scope.slice(PKG_PREFIX.length));
      if (!p) return { error: " Không tìm thấy gói luyện thi cấp tốc này (có thể chưa được phát hành) " };
      return { scope: PKG_PREFIX + p.id, packageId: p.id };
    }
    return { error: " không biết phạm vi " };
  }

  function resolveScopes(raw) {
    var out = [];
    for (var i = 0; i < raw.length; i++) {
      var info = scopeInfo(raw[i]);
      if (info.error) return { error: info.error };
      if (out.indexOf(info.scope) < 0) out.push(info.scope);
    }
    return { scopes: out };
  }

  function grantLedger(req, scopes) {
    var rows = loadGrantRows(db, scopes, req.user.orgId);
    return rows.map(function (r) {
      return {
        userId: r.user_id,
        name: r.display_name || "",
        phone: deps.maskPhone? deps.maskPhone(r.phone): "",
        scope: r.scope,
        state: grantState(r, Date.now()),
        updatedByName: r.created_by_name || "",
        updatedAt: r.updated_at
      };
    });
  }

  function applyGrants(req, scopes, okIds, win) {
    var actorName = adminNameOf(db, req);
    var now = nowIso();
    var upsert = db.prepare(
      "INSERT INTO toefl_grants (user_id, scope, status, start_at, expire_at, created_by, created_by_name, created_at, updated_at) " +
      "VALUES (?,?,?,?,?,?,?,?,?) " +
      "ON CONFLICT(user_id, scope) DO UPDATE SET status = excluded.status, start_at = excluded.start_at, " +
      "expire_at = excluded.expire_at, created_by_name = excluded.created_by_name, updated_at = excluded.updated_at"
    );
    db.transaction(function () {
      scopes.forEach(function (scope) {
        okIds.forEach(function (id) {
          upsert.run(id, scope, win.on? "on": "off", win.on? win.start: null, win.on? win.expire: null,
            req.user.sub || null, actorName, now, now);
        });
      });
    })();
  }

  // Học viên đầu: cửa vào kiểm tra duy nhất sự thật nơi phát ra (practice + nên học viên packages Trạng thái bề ngoài)
  app.get("/api/toefl/access", deps.authMiddleware, function (req, res) {
    var staff = req.user.role === "teacher" || deps.isOrgAdminReq(req);
    if (staff) {
      return res.json({ ok: true, access: { staff: true, practice: { on: true }, packages: {} } });
    }
    var now = Date.now();
    var practice = grantState(
      db.prepare("SELECT * FROM toefl_grants WHERE user_id =? AND scope = 'practice'").get(req.user.sub), now);
    var starts = Object.create(null);
    db.prepare("SELECT * FROM toefl_exam_starts WHERE user_id =?").all(req.user.sub).forEach(function (s) {
      starts[s.package_id] = s;
    });
    var packages = {};
    db.prepare("SELECT * FROM toefl_grants WHERE user_id =? AND scope LIKE 'package:%'").all(req.user.sub)
      .forEach(function (g) {
        var pid = g.scope.slice(PKG_PREFIX.length);
        packages[pid] = packageState(g, starts[pid] || null, now);
      });
    res.json({ ok: true, access: { staff: false, practice: practice, packages: packages } });
  });

  // Học viên đầu: bắt đầu thi —— chính quy cửa vào (mock Xác nhận trang / bank phát ra trang) Bắt đầu trước thuyên chuyển.
  // đã mở khảo thi Chưa hoàn thành phục dùng nguyên started_at (phòng thư thả vô hạn lăn); hoàn thành trôi qua một lần nữa tính theo thời gian.
  app.post("/api/toefl/exam-start", deps.authMiddleware, function (req, res) {
    var info = scopeInfo(PKG_PREFIX + String((req.body && req.body.packageId) || ""));
    if (info.error ||!info.packageId) return res.status(404).json({ error: " Bộ đề thi thử này chưa được phát hành " });
    if (req.user.role === "teacher" || deps.isOrgAdminReq(req)) return res.json({ ok: true, staff: true });
    var now = Date.now();
    var grant = db.prepare("SELECT * FROM toefl_grants WHERE user_id =? AND scope =?").get(req.user.sub, info.scope);
    var start = db.prepare("SELECT * FROM toefl_exam_starts WHERE user_id =? AND package_id =?")
      .get(req.user.sub, info.packageId);
    var st = packageState(grant, start, now);
    if (!st.on) {
      var TEXT = {
        none: " cái này một bao còn chưa mở thông, xin liên lạc Giáo viên ",
        scheduled: " còn chưa tới Mở thời gian ",
        expired: " cái này một bao Đã hết hạn ",
        off: " cái này một bao đã bị Tạm ngưng "
      };
      return res.status(403).json({ error: TEXT[st.reason] || " tạm thời không thể Bắt đầu ", reason: st.reason });
    }
    var startedAt = start &&!start.finished_at? start.started_at: new Date(now).toISOString();
    if (!start || start.finished_at) {
      db.prepare(
        "INSERT INTO toefl_exam_starts (user_id, package_id, started_at, finished_at) VALUES (?,?,?, NULL) " +
        "ON CONFLICT(user_id, package_id) DO UPDATE SET started_at = excluded.started_at, finished_at = NULL"
      ).run(req.user.sub, info.packageId, startedAt);
    }
    res.json({ ok: true, startedAt: startedAt, grace:!!st.grace });
  });

  // Học viên đầu: hoàn thành báo cáo (Nộp bài trang best-effort thuyên chuyển, chỉ dùng tại Đóng thư thả)
  app.post("/api/toefl/exam-done", deps.authMiddleware, function (req, res) {
    var pid = deps.tiku.normPackageId(String((req.body && req.body.packageId) || "").trim().slice(0, 64));
    if (!pid) return res.status(400).json({ error: " thiếu khuyết packageId" });
    db.prepare("UPDATE toefl_exam_starts SET finished_at =? WHERE user_id =? AND package_id =? AND finished_at IS NULL")
      .run(nowIso(), req.user.sub, pid);
    res.json({ ok: true });
  });

  // hậu trường (Giáo viên / Quản trị viên): có thể mở khóa bao liệt biểu List
  app.get("/api/toefl/packages", deps.authMiddleware, function (req, res) {
    if (req.user.role!== "teacher" &&!deps.isOrgAdminReq(req)) {
      return res.status(403).json({ error: " không có quyền hạn " });
    }
    res.setHeader("Cache-Control", "private, no-store");
    res.json({ ok: true, packages: deps.tiku.listPackages(db) });
  });

  // Quản trị viên đầu: trước mắt trao quyền đài sổ sách (hàm Trạng thái, lối vào không cần tự tính thời gian). scope= hoặc scopes= dấu phẩy đại lượng
  app.get("/api/admin/grants", deps.adminAuthMiddleware, function (req, res) {
    var rs = resolveScopes(splitScopes(req.query.scopes!= null? req.query.scopes: req.query.scope));
    if (rs.error) return res.status(400).json({ error: rs.error });
    res.json({ ok: true, grants: grantLedger(req, rs.scopes) });
  });

  // Quản trị viên đầu: đại lượng mở / màn. scope hoặc scopes (đại lượng đối tượng) × studentIds xiên thừa lúc; mở = bao trùm thức ghi nhập Bắt đầu / đến kỳ; màn = status off
  app.post("/api/admin/grants", deps.adminAuthMiddleware, function (req, res) {
    var body = req.body || {};
    var rawScopes = Array.isArray(body.scopes) && body.scopes.length
      ? body.scopes.map(function (s) { return String(s); })
      : splitScopes(body.scope);
    var rs = resolveScopes(rawScopes);
    if (rs.error) return res.status(400).json({ error: rs.error });
    var ids = (Array.isArray(body.studentIds)? body.studentIds: []).map(Number).filter(Boolean);
    if (!ids.length) return res.status(400).json({ error: " Vui lòng chọn học viên trước " });
    if (ids.length > 500) return res.status(400).json({ error: " một lần tối đa 500 người " });
    var win = validateGrantWindow(body);
    if (win.error) return res.status(400).json({ error: win.error });
    var marks = ids.map(function () { return "?"; }).join(",");
    var stmt = db.prepare("SELECT id FROM users WHERE org_id =? AND id IN (" + marks + ")");
    var okIds = stmt.all.apply(stmt, [req.user.orgId].concat(ids)).map(function (r) { return r.id; });
    if (!okIds.length) return res.status(400).json({ error: " không có tìm được những học sinh này " });
    applyGrants(req, rs.scopes, okIds, win);
    res.json({ ok: true, count: okIds.length * rs.scopes.length, students: okIds.length, scopes: rs.scopes.length, action: win.on? "on": "off" });
  });
}

function selfCheck() {
  var Database = require("better-sqlite3");
  var db = new Database(":memory:");
  db.exec("CREATE TABLE users (id INTEGER PRIMARY KEY, phone TEXT, org_id INTEGER, display_name TEXT)");
  ensureSchema(db);
  var t0 = Date.parse("2026-10-13T08:00:00.000Z");
  var iso = function (ms) { return new Date(ms).toISOString(); };
  var eq = function (got, want, what) {
    if (got!== want) throw new Error("toefl-access selfCheck: " + what + " got " + got + " want " + want);
  };

  eq(grantState(null, t0).on, false, "no row must be locked");
  eq(grantState({ status: "off" }, t0).reason, "off", "off row");
  eq(grantState({ status: "on" }, t0).on, true, "on row without window");
  var future = { status: "on", start_at: iso(t0 + 3600000) };
  eq(grantState(future, t0).reason, "scheduled", "future start is scheduled");
  eq(grantState(future, t0 + 3600001).on, true, "start passes -> on");
  var past = { status: "on", expire_at: iso(t0 - 1) };
  eq(grantState(past, t0).reason, "expired", "past expire is expired");
  var win = { status: "on", start_at: iso(t0 - 10), expire_at: iso(t0 + 10) };
  eq(grantState(win, t0).on, true, "inside window is on");
  eq(grantState(win, t0 + 10).reason, "expired", "expire bound inclusive");

  // thư thả: màn ngừng / đến kỳ sau đã mở khảo thi Chưa hoàn thành buổi diễn 24h bên trong cho đi
  var open = { started_at: iso(t0 - 3600000), finished_at: null };
  var done = { started_at: iso(t0 - 3600000), finished_at: iso(t0 - 1800000) };
  var stale = { started_at: iso(t0 - 25 * 3600000), finished_at: null };
  eq(packageState({ status: "on" }, null, t0).on, true, "on passthrough");
  eq(packageState({ status: "off" }, open, t0).grace, true, "grace while exam open");
  eq(packageState({ status: "off" }, done, t0).on, false, "finished exam no grace");
  eq(packageState({ status: "off" }, null, t0).reason, "off", "no start no grace");
  eq(packageState({ status: "off" }, stale, t0).on, false, "stale start no grace");
  eq(packageState({ status: "on", expire_at: iso(t0 - 1) }, open, t0).grace, true, "expired still graces open exam");
  eq(packageState({ status: "on", expire_at: iso(t0 + 3600000) }, open, t0).on, true, "on ignores grace");

  db.prepare("INSERT INTO users (id, phone, org_id, display_name) VALUES (1,'13800000001',1,' giáp ')").run();
  db.prepare("INSERT INTO toefl_grants (user_id, scope, status, start_at, expire_at, created_by, created_by_name, created_at, updated_at) " +
    "VALUES (1,'practice','on',NULL,NULL,9,' tổng bộ ','x','x')").run();
  db.prepare("INSERT INTO toefl_grants (user_id, scope, status, created_at, updated_at) VALUES (1,'practice','off','y','y') " +
    "ON CONFLICT(user_id, scope) DO UPDATE SET status = excluded.status").run();
  var row = db.prepare("SELECT * FROM toefl_grants WHERE user_id = 1 AND scope = 'practice'").get();
  eq(row.status, "off", "upsert switches status");
  eq(db.prepare("SELECT COUNT(*) c FROM toefl_grants").get().c, 1, "one row per user×scope");
  eq(loadGrantRows(db, ["practice"], 1).length, 1, "ledger query keeps stmt this");

  db.prepare("INSERT INTO toefl_exam_starts (user_id, package_id, started_at, finished_at) VALUES (1,'pkg-a','x',NULL)").run();
  db.prepare("INSERT INTO toefl_exam_starts (user_id, package_id, started_at, finished_at) VALUES (1,'pkg-a','y',NULL) " +
    "ON CONFLICT(user_id, package_id) DO UPDATE SET started_at = excluded.started_at").run();
  var ex = db.prepare("SELECT * FROM toefl_exam_starts WHERE user_id = 1 AND package_id = 'pkg-a'").get();
  eq(ex.started_at, "y", "exam start upsert");
  eq(db.prepare("SELECT COUNT(*) c FROM toefl_exam_starts").get().c, 1, "one start per user×package");

  // splitScopes: cam chịu practice, đi trọng, đi chỗ trống, hạn mức cao nhất 20
  eq(splitScopes(null).join(), "practice", "default practice");
  eq(splitScopes("").join(), "practice", "empty practice");
  eq(splitScopes(" practice, package:a,practice, package:a ").join(), "practice,package:a", "dedupe+trim");
  eq(splitScopes(Array.apply(null, { length: 25 }).map(function (_, i) { return "s" + i; }).join(",")).length, 20, "cap 20");
}

module.exports = { ensureSchema: ensureSchema, grantState: grantState, packageState: packageState, loadGrantRows: loadGrantRows, mountRoutes: mountRoutes, selfCheck: selfCheck };
