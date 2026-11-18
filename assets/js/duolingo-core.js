/* Lõi gamification kiểu Duolingo cho YYSD IELTS — thuần logic, không phụ thuộc DOM. */
(function (global) {
  "use strict";
  var LEVELS = [
    { level: 1, xp: 0 }, { level: 2, xp: 100 }, { level: 3, xp: 250 },
    { level: 4, xp: 500 }, { level: 5, xp: 900 }, { level: 6, xp: 1400 },
    { level: 7, xp: 2000 }, { level: 8, xp: 3000 }, { level: 9, xp: 4500 },
    { level: 10, xp: 6500 }
  ];
  var LEAGUES = ["Đồng", "Bạc", "Vàng", "Ngọc lục bảo", "Ruby", "Ngọc trai", "Hắc diệu thạch", "Kim cương"];
  function levelForXp(xp) {
    if (typeof xp !== "number" || !isFinite(xp) || xp < 0) throw new TypeError("XP phải là số không âm");
    var current = LEVELS[0], next = null;
    for (var i = 0; i < LEVELS.length; i++) {
      if (xp >= LEVELS[i].xp) current = LEVELS[i];
      if (xp < LEVELS[i].xp && !next) next = LEVELS[i];
    }
    return { level: current.level, currentXp: current.xp, nextLevelXp: next ? next.xp : null,
      progress: next ? (xp - current.xp) / (next.xp - current.xp) : 1 };
  }
  function leagueForXp(weeklyXp) {
    if (typeof weeklyXp !== "number" || !isFinite(weeklyXp) || weeklyXp < 0) throw new TypeError("XP tuần phải là số không âm");
    return LEAGUES[Math.min(LEAGUES.length - 1, Math.floor(weeklyXp / 500))];
  }
  function nextStreak(current, lastDateISO, todayISO) {
    if (!Number.isInteger(current) || current < 0) throw new TypeError("Chuỗi ngày học phải là số nguyên không âm");
    if (!lastDateISO) return 1;
    var day = 86400000, diff = Math.round((Date.parse(todayISO) - Date.parse(lastDateISO)) / day);
    if (isNaN(diff)) throw new TypeError("Ngày không hợp lệ");
    if (diff === 0) return current === 0 ? 1 : current;
    if (diff === 1) return current + 1;
    return 1;
  }
  function applyAnswer(state, correct) {
    if (!state || typeof state !== "object") throw new TypeError("Thiếu trạng thái học tập");
    var s = { xp: state.xp || 0, hearts: state.hearts == null ? 5 : state.hearts, gems: state.gems || 0, correct: state.correct || 0, total: state.total || 0 };
    s.total += 1;
    if (correct) { s.correct += 1; s.xp += 10; if (s.total % 5 === 0) s.gems += 5; }
    else s.hearts = Math.max(0, s.hearts - 1);
    return s;
  }
  function refillHearts(state, cost) {
    cost = cost == null ? 20 : cost;
    if (!state || (state.gems || 0) < cost) return { ok: false, state: state, message: "Không đủ Ngọc để hồi Tim" };
    var s = Object.assign({}, state, { gems: state.gems - cost, hearts: 5 });
    return { ok: true, state: s, message: "Đã hồi đầy Tim" };
  }
  /* SM-2 rút gọn: lặp lại cách quãng cho từ vựng/câu sai */
  function scheduleReview(card, quality) {
    if (!card || typeof card !== "object") throw new TypeError("Thiếu thẻ ôn tập");
    if (!Number.isInteger(quality) || quality < 0 || quality > 5) throw new RangeError("Mức nhớ phải từ 0 đến 5");
    var ease = card.ease || 2.5, reps = card.reps || 0, interval = card.interval || 0;
    if (quality < 3) { reps = 0; interval = 1; }
    else { reps += 1; interval = reps === 1 ? 1 : reps === 2 ? 6 : Math.round(interval * ease); }
    ease = Math.max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    return { ease: ease, reps: reps, intervalDays: interval, dueInDays: interval };
  }
  function badgesFor(stats) {
    var b = [], xp = stats.xp || 0, streak = stats.streak || 0,
      correct = stats.correct || 0, total = stats.total || 0, lessons = stats.lessons || 0;
    if (xp >= 100) b.push("Khởi đầu rực lửa");
    if (streak >= 7) b.push("Chuỗi 7 ngày");
    if (streak >= 30) b.push("Chuỗi 30 ngày");
    if (correct >= 100 && correct / Math.max(1, total) >= 0.9) b.push("Bậc thầy chính xác");
    if (lessons >= 50) b.push("Chinh phục 50 bài học");
    return b;
  }
  function bandEstimate(correct, total) {
    if (!total) return null;
    if (typeof correct !== "number" || correct < 0 || correct > total) throw new RangeError("Số câu đúng không hợp lệ");
    var ratio = correct / total;
    return Math.round((4 + ratio * 5) * 2) / 2; /* thang 4.0–9.0 làm tròn 0.5 */
  }
  var api = { LEVELS: LEVELS, LEAGUES: LEAGUES, levelForXp: levelForXp, leagueForXp: leagueForXp,
    nextStreak: nextStreak, applyAnswer: applyAnswer, refillHearts: refillHearts,
    scheduleReview: scheduleReview, badgesFor: badgesFor, bandEstimate: bandEstimate };
  global.YYSD_DUOLINGO = api;
})(globalThis);
