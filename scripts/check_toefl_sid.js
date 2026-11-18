/* one check: một sân phơi hoàn chỉnh bắt chước đánh bốn ngành học dùng chung một dùng trong | sid, hóa đơn ngành học luyện tập mỗi coi như một sân phơi */
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
  getItem: function (k) { return Object.prototype.hasOwnProperty.call(this.map, k) ? this.map[k] : null; },
  setItem: function (k, v) { this.map[k] = String(v); },
  removeItem: function (k) { delete this.map[k]; }
};

var single = load("?id=bank-cw&mode=practice");
ok(single.currentSid() === 0, " hóa đơn ngành học luyện tập không nên có toàn bộ sân phơi sid");

var first = load("?id=set-9&mode=mock&full=1");
var pack = first.startPack("set-9", "mock");
ok(first.currentSid() === pack.sid && pack.sid > 0, " toàn bộ sân phơi sid Ưng đến từ pack.sid");

var reload = load("?id=set-9&mode=mock&full=1");
ok(reload.enterSkill("set-9", "mock", "reading") === true, "reading nên tiến lên dự thi ");
ok(reload.currentSid() === pack.sid, " trao đổi đầu hoàng hậu sid phải vẫn giống hệt sân phơi ");

var key = "yysd:toefl-full:set-9";
var old = JSON.parse(global.sessionStorage.getItem(key));
delete old.sid;
global.sessionStorage.setItem(key, JSON.stringify(old));
var legacy = load("?id=set-9&mode=mock&full=1");
legacy.enterSkill("set-9", "mock", "reading");
ok(legacy.currentSid() > 0 && legacy.load("set-9").sid === legacy.currentSid(), " cũ cuộn lại che phủ không có sid yêu cầu sửa một dùng trong | ");

console.log("ok toefl sid");
