"use strict";

/** One computer, one student or teacher. Admins are not seated.
 *  device_key = hardware UUID + file id. File lives outside the app so
 *  reinstall/OS upgrade keep it; disk erase deletes it. */

var crypto = require("crypto");
var ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function init(db) {
  db.exec(
    "CREATE TABLE IF NOT EXISTS seat_meta (k TEXT PRIMARY KEY, v TEXT NOT NULL);" +
    "CREATE TABLE IF NOT EXISTS seats (" +
    "id INTEGER PRIMARY KEY AUTOINCREMENT," +
    "code TEXT NOT NULL UNIQUE," +
    "role TEXT NOT NULL," +
    "phone TEXT," +
    "device_key TEXT," +
    "disabled INTEGER NOT NULL DEFAULT 0," +
    "created_at TEXT NOT NULL" +
    ");"
  );
  var stmts = {
    metaGet: db.prepare("SELECT v FROM seat_meta WHERE k = ?"),
    metaSet: db.prepare(
      "INSERT INTO seat_meta (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v"
    ),
    byCode: db.prepare("SELECT * FROM seats WHERE code = ?"),
    byPhoneRole: db.prepare("SELECT * FROM seats WHERE phone = ? AND role = ?"),
    byDevice: db.prepare("SELECT * FROM seats WHERE device_key = ?"),
    bound: db.prepare("SELECT * FROM seats WHERE phone = ? AND role = ? AND device_key = ?"),
    insert: db.prepare(
      "INSERT INTO seats (code, role, phone, device_key, disabled, created_at) VALUES (?, ?, ?, NULL, 0, ?)"
    ),
    bind: db.prepare("UPDATE seats SET phone = ?, device_key = ? WHERE id = ?"),
    clearDevice: db.prepare("UPDATE seats SET device_key = NULL WHERE id = ?"),
    setDisabled: db.prepare("UPDATE seats SET disabled = ? WHERE id = ?"),
    list: db.prepare("SELECT * FROM seats ORDER BY id DESC")
  };

  function switchOn() {
    var row = stmts.metaGet.get("switch");
    return !!(row && row.v === "1");
  }

  function setSwitch(on) {
    stmts.metaSet.run("switch", on ? "1" : "0");
  }

  function deviceKey(device) {
    if (!device) return "";
    var hw = String(device.hw || "").trim();
    var file = String(device.file || "").trim();
    if (!/^[A-Za-z0-9-]{8,80}$/.test(hw) || !/^[A-Za-z0-9-]{8,80}$/.test(file)) return "";
    return hw + ":" + file;
  }

  function normalizeCode(raw) {
    var s = String(raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (s.length !== 8) return "";
    return s.slice(0, 4) + "-" + s.slice(4);
  }

  function genCode() {
    for (var n = 0; n < 8; n++) {
      var buf = crypto.randomBytes(8);
      var s = "";
      for (var i = 0; i < 8; i++) s += ALPHABET[buf[i] % ALPHABET.length];
      var code = s.slice(0, 4) + "-" + s.slice(4);
      if (!stmts.byCode.get(code)) return code;
    }
    throw new Error(" tạo ra kích hoạt trọng lượng bị đánh bại ");
  }

  function create(role, phone) {
    if (role !== "student" && role !== "teacher") return { error: " mời chọn học sinh có thể giáo viên " };
    phone = phone ? String(phone) : "";
    if (phone && stmts.byPhoneRole.get(phone, role)) return { error: " này người đã có kích hoạt trọng lượng " };
    var code = genCode();
    var info = stmts.insert.run(code, role, phone || null, new Date().toISOString());
    return { seat: stmts.byCode.get(code) || { id: info.lastInsertRowid, code: code, role: role, phone: phone || null } };
  }

  /** Call only after password or registration has succeeded. */
  function authorize(opts) {
    if (opts.isAdmin) return { ok: true };
    var key = deviceKey(opts.device);
    var on = switchOn();
    if (!key) {
      if (on && (opts.purpose === "login" || opts.purpose === "register" || opts.purpose === "reset")) {
        return { error: " mời tải xuống máy móc đánh quy trình hoàng hậu tiếp tục ", status: 403, code: "seat_required" };
      }
      return { ok: true };
    }
    if (opts.purpose === "reset") return { ok: true, claim: key };

    var role = opts.role;
    var phone = opts.phone;
    var held = phone ? stmts.byPhoneRole.get(phone, role) : null;
    if (held && held.disabled) return { error: " số tài khoản đã ngừng sử dụng ", status: 403 };

    if (held && held.device_key && held.device_key === key) {
      return { ok: true, claim: key };
    }
    if (held && held.device_key && held.device_key !== key && !opts.code) {
      return { error: " này mở ra kích hoạt trọng lượng đã ràng buộc khác Đài Loan máy tính, mời biến thể của | người quản lý loại bỏ ", status: 403 };
    }

    var code = normalizeCode(opts.code);
    if (!code) return { error: " này Đài Loan máy tính chưa kích hoạt, mời điền vào biểu mẫu kích hoạt trọng lượng ", status: 403 };
    var row = stmts.byCode.get(code);
    if (!row) return { error: " kích hoạt trọng lượng không hợp lệ ", status: 400 };
    if (row.role !== role) {
      return {
        error: row.role === "teacher" ? " này là giáo viên kích hoạt trọng lượng, mời sử dụng nên giáo viên số tài khoản đăng ký " : " này là học sinh kích hoạt trọng lượng, mời sử dụng học sinh số tài khoản đăng ký ",
        status: 400
      };
    }
    if (row.disabled) return { error: " số tài khoản đã ngừng sử dụng ", status: 403 };
    if (row.phone && row.phone !== phone) return { error: " này mở ra kích hoạt trọng lượng không được phân loại là nên điện thoại di động gầm ", status: 400 };
    if (!row.phone && opts.purpose === "login") {
      return { error: " này là một mở ra viết tắt của Tân Cương người dùng kích hoạt trọng lượng, mời trước đăng ký ", status: 400 };
    }
    if (row.device_key && row.device_key !== key) {
      return { error: " này mở ra kích hoạt trọng lượng đã ràng buộc khác Đài Loan máy tính, mời biến thể của | người quản lý loại bỏ ", status: 403 };
    }
    var taken = stmts.byDevice.get(key);
    if (taken && taken.id !== row.id) return { error: " này Đài Loan máy tính đã ràng buộc khác số tài khoản ", status: 400 };
    return { ok: true, claim: key, bindId: row.id, bindPhone: phone };
  }

  function commitBind(auth) {
    if (!auth || !auth.bindId) return;
    stmts.bind.run(auth.bindPhone, auth.claim, auth.bindId);
  }

  function rejectToken(user) {
    if (!user || user.platformImpersonate || user.adminSeat) return null;
    if (user.role !== "student" && user.role !== "teacher") return null;
    if (!switchOn()) return null;
    if (!user.device) return " mời tải xuống máy móc đánh quy trình hoàng hậu đăng ký ";
    var row = stmts.bound.get(user.phone, user.role, user.device);
    if (!row) return " này Đài Loan máy tính chưa ràng buộc nên số tài khoản ";
    if (row.disabled) return " số tài khoản đã ngừng sử dụng ";
    return null;
  }

  return {
    switchOn: switchOn,
    setSwitch: setSwitch,
    deviceKey: deviceKey,
    normalizeCode: normalizeCode,
    create: create,
    authorize: authorize,
    commitBind: commitBind,
    rejectToken: rejectToken,
    list: function () { return stmts.list.all(); },
    peek: function (code) {
      var n = normalizeCode(code);
      return n ? stmts.byCode.get(n) || null : null;
    },
    boundDevice: function (device) {
      var k = deviceKey(device);
      return k ? stmts.byDevice.get(k) || null : null;
    },
    get: function (id) { return db.prepare("SELECT * FROM seats WHERE id = ?").get(id); },
    unbind: function (id) { stmts.clearDevice.run(id); },
    setDisabled: function (id, disabled) { stmts.setDisabled.run(disabled ? 1 : 0, id); }
  };
}

module.exports = { init: init };
