/* one check: một cuộc Thi thử toàn phần bốn khoa dùng chung một cái sid, Đơn kỹ năng Luyện tập tất cả tính một cuộc */
var path = require("path");
var FULL = path.join(__dirname, "..", "assets", "js", "toefl-full.js");

function load(search) {
  global.location = { search: search, hostname: "app.youyisida.com", pathname: "/x.html", replace: function () {} };
  delete require.cache[FULL];
  return require(FULL);
}
function ok(c, m) { if (!c) throw new Error(m); }

global.sessionStorage = {
  map: {},
  getItem: function (k) { return Object.prototype.hasOwnProperty.call(this.map, k)? this.map[k]: null; },
  setItem: function (k, v) { this.map[k] = String(v); },
  removeItem: function (k) { delete this.map[k]; }
};

var single = load("?id=bank-cw&mode=practice");
ok(single.currentSid() === 0, " Đơn kỹ năng Luyện tập không nên có cả trận sid");

var first = load("?id=set-9&mode=mock&full=1");
var pack = first.startPack("set-9", "mock");
ok(first.currentSid() === pack.sid && pack.sid > 0, " cả trận sid ứng với đến từ pack.sid");

var reload = load("?id=set-9&mode=mock&full=1");
ok(reload.enterSkill("set-9", "mock", "reading") === true, "reading nên tiến cuộc thi ");
ok(reload.currentSid() === pack.sid, " đổi trang sau sid phải trả là cùng một cuộc ");

var key = "yysd:toefl-full:set-9";
var old = JSON.parse(global.sessionStorage.getItem(key));
delete old.sid;
global.sessionStorage.setItem(key, JSON.stringify(old));
var legacy = load("?id=set-9&mode=mock&full=1");
legacy.enterSkill("set-9", "mock", "reading");
ok(legacy.currentSid() > 0 && legacy.load("set-9").sid === legacy.currentSid(), " xưa cũ cuốn bao không có sid muốn bổ một cái ");

console.log("ok toefl sid");
