"use strict";
/**
 * TOEFL ủy quyền - Khu vực luyện tập(scope=practice)+ đánh trước chạy nước rút che phủ(scope=package:<cuộn lại id>) 
 * người quản lý loạt mở/ải núi; giáo viên giới hạn bản thân dưới tên của ai đó của học viên mở đánh trước chạy nước rút che phủ 
 * phía trước chỉ chịu trách nhiệm về hiển thị khóa; có thể không thể tiến lên biến thể cũ của gốc mô-đun của /api/toefl/access và /api/toefl/exam-start làm chuẩn 
 * gia hạn nghĩa của từ: bắt chước đánh đóng cửa/đến hạn biến thể cũ của |, đã mở đánh chưa hoàn thành của số lần chiếu của một bộ phim 24h bên trong có thể trở về làm xong bài thi, không gián đoạn tiến hành bắn trúng mục tiêu trả lời 
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
  if (isNaN(ms)) return { error: what + " hình thức không chính xác " };
  return { v: new Date(ms).toISOString() };
}

/** ủy quyền tình trạng máy móc: none/off/scheduled/expired/on nowMs theo điều chuyển vuông nhập vào, tiện lợi kiểm tra  */
function grantState(row, nowMs) {
  if (!row) return { on: false, reason: "none" };
  if (row.status !== "on") return { on: false, reason: "off" };
  if (row.start_at && nowMs < Date.parse(row.start_at)) {
    return { on: false, reason: "scheduled", startAt: row.start_at, expireAt: row.expire_at || null };
  }
  if (row.expire_at && nowMs >= Date.parse(row.expire_at)) {
    return { on: false, reason: "expired", startAt: row.start_at || null, expireAt: row.expire_at };
  }
  return { on: true, startAt: row.start_at || null, expireAt: row.expire_at || null };
}

/** đánh trước chạy nước rút che phủ tình trạng = ủy quyền tình trạng + mở đánh gia hạn 
 *  ponytail: gia hạn biến thể cũ của 24h -- đóng cửa hoàng hậu mở đánh chưa hoàn thành của cuộn lại có thể tồn tại biến thể cũ của bên trong làm xong bài thi gốc sân phơi; biến thể cũ của bên ngoài của chưa hoàn thành ghi chép coi như từ bỏ đánh  */
function packageState(grant, start, nowMs) {
  var st = grantState(grant, nowMs);
  if (st.on) return st;
  if (start && !start.finished_at && nowMs - Date.parse(start.started_at) < GRACE_MS) {
    return { on: true, grace: true, reason: "grace", expireAt: st.expireAt || null };
  }
  return st;
}

function loadGrantRows(db, scopes, orgId) {
  var marks = scopes.map(function () { return "?"; }).join(",");
  var stmt = db.prepare(
    "SELECT g.*, u.display_name, u.phone FROM toefl_grants g JOIN users u ON u.id = g.user_id " +
    "WHERE g.scope IN (" + marks + ") AND u.org_id = ? ORDER BY g.updated_at DESC"
  );
  return stmt.all.apply(stmt, scopes.concat([orgId]));
}

function validateGrantWindow(body) {
  var on = body.action !== "off";
  var start = parseTime(body.startAt, " bắt đầu thời gian ");
  if (start.error) return { error: start.error };
  var expire = parseTime(body.expireAt, " đến hạn thời gian ");
  if (expire.error) return { error: expire.error };
  if (on && expire.v && Date.parse(expire.v) <= Date.now()) {
    return { error: " đến hạn thời gian đã băng qua, mời chọn tương lai của thời gian " };
  }
  if (on && start.v && expire.v && Date.parse(start.v) >= Date.parse(expire.v)) {
    return { error: " đến hạn thời gian yêu cầu buổi tối đi bắt đầu thời gian " };
  }
  return { on: on, start: start.v, expire: expire.v };
}

// loạt mục tiêu phân tích: dấu phẩy chia cắt + đi lặp lại + giới hạn trên(bảo vệ đầu tiên viết nổ hoặc bùng nổ) thuần khiết hàm số, selfCheck che phủ 
function splitScopes(raw) {
  var list = String(raw == null || raw === "" ? "practice" : raw).split(",")
    .map(function (x) { return x.trim(); })
    .filter(Boolean)
    .filter(function (v, i, a) { return a.indexOf(v) === i; })
    .slice(0, 20);
  return list.length ? list : ["practice"];
}

function adminNameOf(db, req) {
  if (!req.user.phone) return " trụ sở chính ";
  var t = db.prepare("SELECT name FROM teachers WHERE phone = ?").get(req.user.phone);
  return (t && t.name) || " người quản lý ";
}

function mountRoutes(app, deps) {
  var db = deps.db;
  ensureSchema(db);

  // practice hoặc package:<đã đưa hàng lên kệ full/single cuộn lại>; che phủ id 7-Eleven đi hq- tiền tố
  function scopeInfo(scope) {
    scope = String(scope || "practice").trim();
    if (scope === "practice") return { scope: "practice" };
    if (scope.indexOf(PKG_PREFIX) === 0) {
      var p = deps.tiku.resolvePackage(db, scope.slice(PKG_PREFIX.length));
      if (!p) return { error: " không thể tìm thấy này đánh trước chạy nước rút che phủ(có thể vẫn chưa đưa hàng lên kệ)" };
      return { scope: PKG_PREFIX + p.id, packageId: p.id };
    }
    return { error: " chưa biết phạm vi " };
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
        phone: deps.maskPhone ? deps.maskPhone(r.phone) : "",
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
      "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) " +
      "ON CONFLICT(user_id, scope) DO UPDATE SET status = excluded.status, start_at = excluded.start_at, " +
      "expire_at = excluded.expire_at, created_by_name = excluded.created_by_name, updated_at = excluded.updated_at"
    );
    db.transaction(function () {
      scopes.forEach(function (scope) {
        okIds.forEach(function (id) {
          upsert.run(id, scope, win.on ? "on" : "off", win.on ? win.start : null, win.on ? win.expire : null,
            req.user.sub || null, actorName, now, now);
        });
      });
    })();
  }

  // Dành cho học viên: lối vào kiểm tra của chỉ sự thật nguồn(practice + nên học sinh của packages tình trạng bề mặt bên ngoài)
  app.get("/api/toefl/access", deps.authMiddleware, function (req, res) {
    var staff = req.user.role === "teacher" || deps.isOrgAdminReq(req);
    if (staff) {
      return res.json({ ok: true, access: { staff: true, practice: { on: true }, packages: {} } });
    }
    var now = Date.now();
    var practice = grantState(
      db.prepare("SELECT * FROM toefl_grants WHERE user_id = ? AND scope = 'practice'").get(req.user.sub), now);
    var starts = Object.create(null);
    db.prepare("SELECT * FROM toefl_exam_starts WHERE user_id = ?").all(req.user.sub).forEach(function (s) {
      starts[s.package_id] = s;
    });
    var packages = {};
    db.prepare("SELECT * FROM toefl_grants WHERE user_id = ? AND scope LIKE 'package:%'").all(req.user.sub)
      .forEach(function (g) {
        var pid = g.scope.slice(PKG_PREFIX.length);
        packages[pid] = packageState(g, starts[pid] || null, now);
      });
    res.json({ ok: true, access: { staff: false, practice: practice, packages: packages } });
  });

  // Dành cho học viên: mở đánh -- chính quy lối vào(mock xác nhận đầu / bank phát sóng đầu)bắt đầu hương đầu sử dụng 
  // đã mở đánh chưa hoàn thành của đi rồi quay lại sử dụng trước đây started_at(bảo vệ gia hạn không giới hạn sôi); hoàn thành băng qua của lại đo thời gian 
  app.post("/api/toefl/exam-start", deps.authMiddleware, function (req, res) {
    var info = scopeInfo(PKG_PREFIX + String((req.body && req.body.packageId) || ""));
    if (info.error || !info.packageId) return res.status(404).json({ error: " này che đậy bắt chước đánh vẫn chưa đưa hàng lên kệ " });
    if (req.user.role === "teacher" || deps.isOrgAdminReq(req)) return res.json({ ok: true, staff: true });
    var now = Date.now();
    var grant = db.prepare("SELECT * FROM toefl_grants WHERE user_id = ? AND scope = ?").get(req.user.sub, info.scope);
    var start = db.prepare("SELECT * FROM toefl_exam_starts WHERE user_id = ? AND package_id = ?")
      .get(req.user.sub, info.packageId);
    var st = packageState(grant, start, now);
    if (!st.on) {
      var TEXT = {
        none: " này một che phủ vẫn chưa mở, mời biến thể của | giáo viên ",
        scheduled: " vẫn chưa đến mở thời gian ",
        expired: " này một che phủ đã đến hạn ",
        off: " này một che phủ đã chăn ngừng sử dụng "
      };
      return res.status(403).json({ error: TEXT[st.reason] || " tạm thời không thể bắt đầu ", reason: st.reason });
    }
    var startedAt = start && !start.finished_at ? start.started_at : new Date(now).toISOString();
    if (!start || start.finished_at) {
      db.prepare(
        "INSERT INTO toefl_exam_starts (user_id, package_id, started_at, finished_at) VALUES (?, ?, ?, NULL) " +
        "ON CONFLICT(user_id, package_id) DO UPDATE SET started_at = excluded.started_at, finished_at = NULL"
      ).run(req.user.sub, info.packageId, startedAt);
    }
    res.json({ ok: true, startedAt: startedAt, grace: !!st.grace });
  });

  // Dành cho học viên: hoàn thành báo cáo lên cấp trên(nộp bài thi đầu best-effort điều chuyển, chỉ sử dụng trong đóng gia hạn)
  app.post("/api/toefl/exam-done", deps.authMiddleware, function (req, res) {
    var pid = deps.tiku.normPackageId(String((req.body && req.body.packageId) || "").trim().slice(0, 64));
    if (!pid) return res.status(400).json({ error: " thiếu packageId" });
    db.prepare("UPDATE toefl_exam_starts SET finished_at = ? WHERE user_id = ? AND package_id = ? AND finished_at IS NULL")
      .run(nowIso(), req.user.sub, pid);
    res.json({ ok: true });
  });

  // khu vực hậu trường(giáo viên/người quản lý): có thể mở khóa của che phủ danh sách
  app.get("/api/toefl/packages", deps.authMiddleware, function (req, res) {
    if (req.user.role !== "teacher" && !deps.isOrgAdminReq(req)) {
      return res.status(403).json({ error: " không có quyền giới hạn " });
    }
    res.setHeader("Cache-Control", "private, no-store");
    res.json({ ok: true, packages: deps.tiku.listPackages(db) });
  });

  // người quản lý cuối: thời điểm hiện tại ủy quyền Đài Loan tài khoản(ngậm trong miệng tình trạng, phía trước không cần bản thân coi như thời gian) scope= hoặc scopes= dấu phẩy loạt
  app.get("/api/admin/grants", deps.adminAuthMiddleware, function (req, res) {
    var rs = resolveScopes(splitScopes(req.query.scopes != null ? req.query.scopes : req.query.scope));
    if (rs.error) return res.status(400).json({ error: rs.error });
    res.json({ ok: true, grants: grantLedger(req, rs.scopes) });
  });

  // người quản lý cuối: loạt mở/ải núi scope hoặc scopes(loạt mục tiêu)× studentIds cái nĩa cưỡi; mở = che phủ loại viết đi vào bắt đầu/đến hạn; ải núi = status off
  app.post("/api/admin/grants", deps.adminAuthMiddleware, function (req, res) {
    var body = req.body || {};
    var rawScopes = Array.isArray(body.scopes) && body.scopes.length
      ? body.scopes.map(function (s) { return String(s); })
      : splitScopes(body.scope);
    var rs = resolveScopes(rawScopes);
    if (rs.error) return res.status(400).json({ error: rs.error });
    var ids = (Array.isArray(body.studentIds) ? body.studentIds : []).map(Number).filter(Boolean);
    if (!ids.length) return res.status(400).json({ error: " mời trước chọn học sinh " });
    if (ids.length > 500) return res.status(400).json({ error: " đầu tiên tối đa 500 người " });
    var win = validateGrantWindow(body);
    if (win.error) return res.status(400).json({ error: win.error });
    var marks = ids.map(function () { return "?"; }).join(",");
    var stmt = db.prepare("SELECT id FROM users WHERE org_id = ? AND id IN (" + marks + ")");
    var okIds = stmt.all.apply(stmt, [req.user.orgId].concat(ids)).map(function (r) { return r.id; });
    if (!okIds.length) return res.status(400).json({ error: " không có tìm thấy những... này học sinh " });
    applyGrants(req, rs.scopes, okIds, win);
    res.json({ ok: true, count: okIds.length * rs.scopes.length, students: okIds.length, scopes: rs.scopes.length, action: win.on ? "on" : "off" });
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
    if (got !== want) throw new Error("toefl-access selfCheck: " + what + " got " + got + " want " + want);
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

  // gia hạn: đóng cửa/đến hạn hoàng hậu đã mở đánh chưa hoàn thành của số lần chiếu của một bộ phim 24h bên trong cho qua
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

  db.prepare("INSERT INTO users (id, phone, org_id, display_name) VALUES (1,'13800000001',1,'thiên can đầu tiên trong mười thiên can')").run();
  db.prepare("INSERT INTO toefl_grants (user_id, scope, status, start_at, expire_at, created_by, created_by_name, created_at, updated_at) " +
    "VALUES (1,'practice','on',NULL,NULL,9,'trụ sở chính','x','x')").run();
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

  // splitScopes: đồng ý ngầm practice, đi lặp lại, đi khoảng trống, giới hạn trên 20
  eq(splitScopes(null).join(), "practice", "default practice");
  eq(splitScopes("").join(), "practice", "empty practice");
  eq(splitScopes(" practice , package:a ,practice, package:a ").join(), "practice,package:a", "dedupe+trim");
  eq(splitScopes(Array.apply(null, { length: 25 }).map(function (_, i) { return "s" + i; }).join(",")).length, 20, "cap 20");
}

module.exports = { ensureSchema: ensureSchema, grantState: grantState, packageState: packageState, loadGrantRows: loadGrantRows, mountRoutes: mountRoutes, selfCheck: selfCheck };
