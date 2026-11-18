#!/usr/bin/env node
/** Smoke: HQ-only gate + Mistvale-only chapter pilot. */
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const assert = (c, m) => { if (!c) { console.error("FAIL:", m); process.exit(1); } };

const auth = fs.readFileSync(path.join(root, "assets/js/auth.js"), "utf8");
assert(auth.includes("function canWordRealm") && auth.includes("canWordRealm: canWordRealm"), "auth canWordRealm");
assert(/function canWordRealm\(\)\s*\{[^}]*return false/.test(auth), "auth realm offline");

const nav = fs.readFileSync(path.join(root, "assets/js/nav.js"), "utf8");
assert(!nav.includes('label: " biến thể cũ của | biên giới "') && !nav.includes('label: " biến thể cũ của | biên giới cuộc viễn chinh "'), "nav no realm top link");

const zone = fs.readFileSync(path.join(root, "assets/js/zone.js"), "utf8");
assert(!zone.includes("vocab-realm-banner"), "zone banner hidden offline");

const realm = fs.readFileSync(path.join(root, "assets/js/word-realm.js"), "utf8");
assert(realm.includes("canWordRealm") && realm.includes('location.replace("zone.html?zone=study&s=vocab")'), "realm hard gate");
assert(realm.includes(" sương mù trước đây thử chơi ") && realm.includes(" theo sau chương chưa nở hoa "), "clear CTA mist-only");
assert(!realm.includes(" đi đến đơn vị đo lường khô cho ngũ cốc bằng mười đấu phương ngữ hẻm núi ") && !realm.includes(" phía đông hàng · đơn vị đo lường khô cho ngũ cốc bằng mười đấu phương ngữ hẻm núi ›"), "no stone launch CTA");

const lesson = fs.readFileSync(path.join(root, "assets/js/vocab-lesson.js"), "utf8");
assert(lesson.includes("canWordRealm") && lesson.includes('shrine.region !== "mist"'), "lesson mist-only");

const story = fs.readFileSync(path.join(root, "assets/js/word-realm-story.js"), "utf8");
assert(story.includes('return regionId === "mist"'), "story mist-only unlock");

console.log("word-realm gate smoke ok");
