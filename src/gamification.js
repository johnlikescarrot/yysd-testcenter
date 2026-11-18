/**
 * Hệ thống Trò chơi hóa Học tập IELTS Toàn diện (src/gamification.js)
 * Tích hợp đầy đủ các cơ chế động lực cốt lõi từ Duolingo:
 * - XP, hệ số Combo, Mục tiêu XP hàng ngày & Thuốc Nhân đôi XP (15 phút)
 * - Chuỗi Ngày Học (Daily Streak) & Đóng băng Chuỗi (Streak Freeze)
 * - Chuỗi Bạn Bè (Friend Streaks — tối đa 5 bạn đồng hành)
 * - 10 Giải đấu Hàng tuần: Đồng, Bạc, Vàng, Lam ngọc, Hồng ngọc, Lục bảo,
 *   Thạch anh tím, Ngọc trai, Hắc diện thạch, Kim cương (bảng 30 học viên)
 * - Hệ thống Năng lượng (Energy 0-25) & Chế độ Siêu Cấp IELTS (không giới hạn năng lượng)
 * - Đá quý (Gems), Cửa hàng Vật phẩm, Nhiệm vụ Hàng ngày, 12 Huy hiệu Thành tích
 * - Xưởng Ảnh đại diện Tùy chỉnh với 4 Bộ Trang phục Theo mùa
 */

export const MAX_FRIEND_STREAKS = 5;
export const MAX_ENERGY = 25;
export const ENERGY_COST_WRONG = 2;
export const ENERGY_RECHARGE_MINUTES = 20;

export const WEEKLY_LEAGUES = Object.freeze([
  Object.freeze({ tier: 0, id: "bronze", nameVi: "Đồng", nameEn: "Bronze", color: "#b45309", promoteMinXp: 120 }),
  Object.freeze({ tier: 1, id: "silver", nameVi: "Bạc", nameEn: "Silver", color: "#64748b", promoteMinXp: 200 }),
  Object.freeze({ tier: 2, id: "gold", nameVi: "Vàng", nameEn: "Gold", color: "#ca8a04", promoteMinXp: 300 }),
  Object.freeze({ tier: 3, id: "sapphire", nameVi: "Lam ngọc", nameEn: "Sapphire", color: "#1d4ed8", promoteMinXp: 420 }),
  Object.freeze({ tier: 4, id: "ruby", nameVi: "Hồng ngọc", nameEn: "Ruby", color: "#be123c", promoteMinXp: 560 }),
  Object.freeze({ tier: 5, id: "emerald", nameVi: "Lục bảo", nameEn: "Emerald", color: "#047857", promoteMinXp: 720 }),
  Object.freeze({ tier: 6, id: "amethyst", nameVi: "Thạch anh tím", nameEn: "Amethyst", color: "#7e22ce", promoteMinXp: 900 }),
  Object.freeze({ tier: 7, id: "pearl", nameVi: "Ngọc trai", nameEn: "Pearl", color: "#0f766e", promoteMinXp: 1120 }),
  Object.freeze({ tier: 8, id: "obsidian", nameVi: "Hắc diện thạch", nameEn: "Obsidian", color: "#1e293b", promoteMinXp: 1400 }),
  Object.freeze({ tier: 9, id: "diamond", nameVi: "Kim cương", nameEn: "Diamond", color: "#0284c7", promoteMinXp: 1800 }),
]);

export const DAILY_XP_GOALS = Object.freeze([
  Object.freeze({ xp: 10, labelVi: "Nhẹ nhàng (5 phút/ngày)" }),
  Object.freeze({ xp: 20, labelVi: "Đều đặn (10 phút/ngày)" }),
  Object.freeze({ xp: 30, labelVi: "Nghiêm túc (15 phút/ngày)" }),
  Object.freeze({ xp: 50, labelVi: "Bứt phá Band 8+ (25 phút/ngày)" }),
]);

export const SEASONAL_SUITS = Object.freeze([
  Object.freeze({
    id: "spring_blossom",
    nameVi: "Áo Học Viện Xuân Hoa Đào",
    seasonVi: "Mùa Xuân",
    primary: "#be185d",
    accent: "#fbcfe8",
    costGems: 0,
  }),
  Object.freeze({
    id: "summer_ocean",
    nameVi: "Vest Hạ Biển Xanh Đà Nẵng",
    seasonVi: "Mùa Hạ",
    primary: "#0369a1",
    accent: "#bae6fd",
    costGems: 80,
  }),
  Object.freeze({
    id: "autumn_hanoi",
    nameVi: "Áo Khoác Thu Vàng Hà Nội",
    seasonVi: "Mùa Thu",
    primary: "#b45309",
    accent: "#fde68a",
    costGems: 100,
  }),
  Object.freeze({
    id: "winter_cambridge",
    nameVi: "Áo Choàng Đông Học Viện Cambridge",
    seasonVi: "Mùa Đông",
    primary: "#162447",
    accent: "#e2e8f0",
    costGems: 120,
  }),
]);

export const SHOP_ITEMS = Object.freeze([
  Object.freeze({
    id: "streak_freeze",
    nameVi: "Đóng băng Chuỗi Ngày Học",
    descVi: "Tự động bảo vệ chuỗi ngày học nếu bạn lỡ bận 1 ngày (tối đa tích trữ 2 chiếc).",
    costGems: 60,
    category: "powerup",
  }),
  Object.freeze({
    id: "double_xp",
    nameVi: "Thuốc Nhân Đôi XP (15 phút)",
    descVi: "Nhân đôi toàn bộ XP nhận được từ bài học, truyện ngắn, nhập vai và đề thi Cambridge.",
    costGems: 50,
    category: "powerup",
  }),
  Object.freeze({
    id: "energy_refill",
    nameVi: "Nạp Đầy 25 Năng Lượng",
    descVi: "Khôi phục ngay 25/25 đơn vị năng lượng để tiếp tục chinh phục chặng khó.",
    costGems: 40,
    category: "powerup",
  }),
  Object.freeze({
    id: "combo_shield",
    nameVi: "Lá Chắn Giữ Mạch Combo",
    descVi: "Bảo toàn mạch trả lời đúng liên tiếp và miễn trừ hao hụt năng lượng cho 1 câu sai.",
    costGems: 45,
    category: "powerup",
  }),
  Object.freeze({
    id: "super_pass",
    nameVi: "Huy Hiệu Siêu Cấp IELTS (7 ngày)",
    descVi: "Mở khóa năng lượng vô hạn trong 7 ngày bằng chính Đá quý tích lũy khi học — hoàn toàn miễn phí.",
    costGems: 180,
    category: "super",
  }),
]);

export const FRIEND_DIRECTORY = Object.freeze([
  Object.freeze({ id: "f_minhanh", name: "Nguyễn Minh Anh", city: "Hà Nội", targetBand: 7.5, activeToday: true }),
  Object.freeze({ id: "f_hoangnam", name: "Trần Hoàng Nam", city: "TP. Hồ Chí Minh", targetBand: 8.0, activeToday: true }),
  Object.freeze({ id: "f_khanhlinh", name: "Lê Khánh Linh", city: "Đà Nẵng", targetBand: 7.0, activeToday: true }),
  Object.freeze({ id: "f_quocbao", name: "Phạm Quốc Bảo", city: "Vinh, Nghệ An", targetBand: 7.5, activeToday: false }),
  Object.freeze({ id: "f_thaochi", name: "Võ Thảo Chi", city: "Huế", targetBand: 8.5, activeToday: true }),
  Object.freeze({ id: "f_ducmanh", name: "Đỗ Đức Mạnh", city: "Hải Phòng", targetBand: 6.5, activeToday: false }),
  Object.freeze({ id: "f_ngocdiep", name: "Bùi Ngọc Diệp", city: "Cần Thơ", targetBand: 7.5, activeToday: true }),
]);

export const BADGE_DEFINITIONS = Object.freeze([
  Object.freeze({ id: "first_step", nameVi: "Khởi Hành Học Thuật", descVi: "Hoàn thành bài học IELTS đầu tiên." }),
  Object.freeze({ id: "perfect_lesson", nameVi: "Chuẩn Xác Tuyệt Đối", descVi: "Đạt độ chính xác 100% trong một bài học." }),
  Object.freeze({ id: "streak_3", nameVi: "Lửa Nhiệt Huyết 3 Ngày", descVi: "Duy trì chuỗi học liên tiếp 3 ngày." }),
  Object.freeze({ id: "streak_7", nameVi: "Chiến Binh Tuần Lễ", descVi: "Duy trì chuỗi học liên tiếp 7 ngày." }),
  Object.freeze({ id: "streak_30", nameVi: "Kỷ Luật Thép 30 Ngày", descVi: "Duy trì chuỗi học liên tiếp 30 ngày." }),
  Object.freeze({ id: "friend_bond", nameVi: "Đồng Hành Tiến Bước", descVi: "Kết nối ít nhất 3 Chuỗi Bạn Bè học IELTS." }),
  Object.freeze({ id: "xp_500", nameVi: "Học Giả Chăm Chỉ", descVi: "Tích lũy đạt 500 XP học thuật." }),
  Object.freeze({ id: "xp_2000", nameVi: "Tinh Hoa Học Viện", descVi: "Tích lũy đạt 2.000 XP học thuật." }),
  Object.freeze({ id: "story_reader", nameVi: "Mọt Sách Học Thuật", descVi: "Hoàn thành một truyện ngắn IELTS tương tác." }),
  Object.freeze({ id: "roleplay_star", nameVi: "Đối Thoại Tự Tin", descVi: "Hoàn thành phiên nhập vai IELTS Speaking." }),
  Object.freeze({ id: "cambridge_hero", nameVi: "Chinh Phục Phòng Thi", descVi: "Hoàn thành một bài thi Cambridge IELTS." }),
  Object.freeze({ id: "diamond_tier", nameVi: "Đỉnh Cao Kim Cương", descVi: "Thăng hạng lên Giải đấu Kim cương." }),
]);

const COHORT_PEERS = [
  "Phan Gia Hân", "Nguyễn Tuấn Kiệt", "Lê Phương Thảo", "Trần Minh Quân", "Hoàng Bảo Ngọc",
  "Vũ Đăng Khoa", "Đặng Thu Hà", "Bùi Anh Tuấn", "Đỗ Khánh Vy", "Ngô Quang Hải",
  "Dương Thanh Trúc", "Lý Hải Đăng", "Mai Ngọc Ánh", "Trịnh Quốc Khánh", "Đinh Thùy Dương",
  "Hồ Minh Triết", "Cao Bảo Châu", "Tạ Đức Anh", "Lương Mỹ Linh", "Chu Nhật Minh",
  "Phùng Hà My", "Vương Gia Bảo", "Tô Yến Nhi", "Nguyễn Thành Đạt", "Trần Diệu Linh",
  "Lê Hoàng Phúc", "Phạm Thanh Hằng", "Hoàng Quốc Việt", "Vũ Ngọc Hân",
];

/**
 * Chuyển dấu thời gian hoặc chuỗi ngày về định dạng YYYY-MM-DD (UTC).
 */
export function toDateKey(input = Date.now()) {
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return input;
  }
  const d = new Date(input);
  return d.toISOString().slice(0, 10);
}

/**
 * Tính số ngày chênh lệch (dateKeyB - dateKeyA).
 */
export function diffDays(dateKeyA, dateKeyB) {
  if (!dateKeyA || !dateKeyB) return Infinity;
  const msA = Date.parse(`${dateKeyA}T00:00:00Z`);
  const msB = Date.parse(`${dateKeyB}T00:00:00Z`);
  return Math.round((msB - msA) / 86400000);
}

/**
 * Tạo trạng thái trò chơi hóa mặc định cho học viên mới.
 */
export function createInitialGamificationState(todayKey = "2026-11-18") {
  return {
    totalXp: 0,
    weeklyXp: 0,
    todayXp: 0,
    todayDateKey: todayKey,
    dailyGoalXp: 20,
    gems: 150,
    energy: MAX_ENERGY,
    lastEnergySyncMs: Date.parse(`${todayKey}T00:00:00Z`),
    superUntilMs: 0,
    doubleXpUntilMs: 0,
    streakFreezes: 1,
    comboShields: 0,
    streak: 0,
    longestStreak: 0,
    lastStudyDateKey: "",
    studyDates: [],
    leagueTier: 0,
    lessonsCompleted: 0,
    perfectLessons: 0,
    storiesCompleted: 0,
    roleplaysCompleted: 0,
    cambridgeCompleted: 0,
    reviewsCompleted: 0,
    earnedBadges: [],
    claimedQuestsDateKey: todayKey,
    claimedQuestIds: [],
    friendStreaks: [
      { id: "f_minhanh", name: "Nguyễn Minh Anh", city: "Hà Nội", targetBand: 7.5, streak: 3, lastSyncedDate: "", nudgedDate: "" },
      { id: "f_quocbao", name: "Phạm Quốc Bảo", city: "Vinh, Nghệ An", targetBand: 7.5, streak: 2, lastSyncedDate: "", nudgedDate: "" },
    ],
    unlockedSuits: ["spring_blossom"],
    avatar: {
      skinTone: "#f5d0b5",
      hairStyle: "scholar",
      hairColor: "#1f2937",
      glasses: "round",
      suitId: "spring_blossom",
      expression: "smile",
    },
  };
}

/**
 * Kiểm tra trạng thái Siêu Cấp IELTS (năng lượng vô hạn) và Nhân Đôi XP hiện hành.
 */
export function isSuperActive(state, nowMs = Date.now()) {
  return Number(state.superUntilMs || 0) > Number(nowMs);
}

export function isDoubleXpActive(state, nowMs = Date.now()) {
  return Number(state.doubleXpUntilMs || 0) > Number(nowMs);
}

/**
 * Tự động hồi phục năng lượng theo thời gian thực (1 đơn vị mỗi 20 phút, tối đa 25).
 */
export function syncEnergy(state, nowMs = Date.now()) {
  if (isSuperActive(state, nowMs) || state.energy >= MAX_ENERGY) {
    return { ...state, energy: MAX_ENERGY, lastEnergySyncMs: Number(nowMs) };
  }
  const elapsedMin = Math.max(0, (Number(nowMs) - Number(state.lastEnergySyncMs || nowMs)) / 60000);
  const gained = Math.floor(elapsedMin / ENERGY_RECHARGE_MINUTES);
  if (gained <= 0) return state;
  const nextEnergy = Math.min(MAX_ENERGY, state.energy + gained);
  return {
    ...state,
    energy: nextEnergy,
    lastEnergySyncMs: Number(nowMs),
  };
}

/**
 * Xử lý năng lượng khi trả lời sai 1 câu (tự kích hoạt Lá Chắn nếu có, hoặc miễn trừ nếu đang Siêu Cấp).
 */
export function consumeEnergyOnMistake(state, nowMs = Date.now()) {
  const synced = syncEnergy(state, nowMs);
  if (isSuperActive(synced, nowMs)) {
    return { state: synced, shieldUsed: false, depleted: false };
  }
  if ((synced.comboShields || 0) > 0) {
    return {
      state: { ...synced, comboShields: synced.comboShields - 1 },
      shieldUsed: true,
      depleted: false,
    };
  }
  const nextEnergy = Math.max(0, synced.energy - ENERGY_COST_WRONG);
  return {
    state: { ...synced, energy: nextEnergy, lastEnergySyncMs: Number(nowMs) },
    shieldUsed: false,
    depleted: nextEnergy === 0,
  };
}

/**
 * Cập nhật Chuỗi Ngày Học (Daily Streak) và tự động dùng Đóng băng Chuỗi nếu nghỉ 1 ngày.
 */
export function advanceDailyStreak(state, dateKey) {
  const day = toDateKey(dateKey);
  const gap = diffDays(state.lastStudyDateKey, day);
  let nextStreak = state.streak;
  let nextFreezes = state.streakFreezes;
  let freezeUsed = false;

  if (gap <= 0) {
    nextStreak = Math.max(1, state.streak);
  } else if (gap === 1) {
    nextStreak = state.streak + 1;
  } else if (gap === 2 && nextFreezes > 0) {
    nextStreak = state.streak + 1;
    nextFreezes -= 1;
    freezeUsed = true;
  } else {
    nextStreak = 1;
  }

  const nextDates = state.studyDates.includes(day)
    ? state.studyDates
    : [...state.studyDates.slice(-29), day];
  const longestStreak = Math.max(state.longestStreak, nextStreak);

  // Thưởng Đá quý khi chạm cột mốc chuỗi mới
  let milestoneGems = 0;
  if (gap >= 1 && [3, 7, 14, 30, 100, 365].includes(nextStreak)) {
    milestoneGems = Math.min(200, nextStreak * 5);
  }

  // Đồng bộ Chuỗi Bạn Bè khi học viên hoàn thành bài học trong ngày
  const nextFriends = state.friendStreaks.map((fr) => {
    if (fr.lastSyncedDate === day) return fr;
    const directoryEntry = FRIEND_DIRECTORY.find((d) => d.id === fr.id);
    const friendActive = directoryEntry ? directoryEntry.activeToday : true;
    return {
      ...fr,
      streak: friendActive ? fr.streak + 1 : fr.streak,
      lastSyncedDate: day,
    };
  });

  return {
    state: {
      ...state,
      streak: nextStreak,
      longestStreak,
      streakFreezes: nextFreezes,
      lastStudyDateKey: day,
      studyDates: nextDates,
      gems: state.gems + milestoneGems,
      friendStreaks: nextFriends,
    },
    freezeUsed,
    milestoneGems,
  };
}

/**
 * Kiểm tra và trao tất cả Huy hiệu Thành tích mới đạt điều kiện.
 */
export function evaluateBadges(state) {
  const owned = new Set(state.earnedBadges);
  const newlyEarned = [];
  const checks = [
    ["first_step", state.lessonsCompleted >= 1],
    ["perfect_lesson", state.perfectLessons >= 1],
    ["streak_3", state.streak >= 3],
    ["streak_7", state.streak >= 7],
    ["streak_30", state.streak >= 30],
    ["friend_bond", state.friendStreaks.length >= 3],
    ["xp_500", state.totalXp >= 500],
    ["xp_2000", state.totalXp >= 2000],
    ["story_reader", state.storiesCompleted >= 1],
    ["roleplay_star", state.roleplaysCompleted >= 1],
    ["cambridge_hero", state.cambridgeCompleted >= 1],
    ["diamond_tier", state.leagueTier >= 9],
  ];
  for (const [id, ok] of checks) {
    if (ok && !owned.has(id)) {
      owned.add(id);
      newlyEarned.push(id);
    }
  }
  return {
    earnedBadges: Array.from(owned),
    newlyEarned,
  };
}

/**
 * Tính thưởng XP, Đá quý, Chuỗi ngày học và Huy hiệu sau khi hoàn thành một hoạt động học tập.
 * activityType: "lesson" | "review" | "story" | "roleplay" | "cambridge"
 */
export function awardActivityCompletion(
  state,
  {
    activityType = "lesson",
    baseXp = 15,
    correctCount = 5,
    totalCount = 5,
    maxCombo = 3,
    nowMs = Date.now(),
  } = {},
) {
  const day = toDateKey(nowMs);
  const safeTotal = Math.max(1, Number(totalCount) || 1);
  const safeCorrect = Math.max(0, Math.min(safeTotal, Number(correctCount) || 0));
  const accuracy = safeCorrect / safeTotal;
  const accuracyBonus = accuracy === 1 ? 10 : Math.round(accuracy * 5);
  const comboBonus = Math.min(10, Math.floor(Math.max(0, Number(maxCombo) || 0) / 2) * 2);
  const multiplier = isDoubleXpActive(state, nowMs) ? 2 : 1;
  const earnedXp = Math.max(5, Math.round((Number(baseXp) + accuracyBonus + comboBonus) * multiplier));
  const earnedGems = accuracy === 1 ? 12 : 6;

  const resetDay = state.todayDateKey !== day;
  const prevTodayXp = resetDay ? 0 : state.todayXp;
  const claimedIds = state.claimedQuestsDateKey === day ? state.claimedQuestIds : [];

  const streakResult = advanceDailyStreak(state, day);
  const updated = {
    ...streakResult.state,
    totalXp: streakResult.state.totalXp + earnedXp,
    weeklyXp: streakResult.state.weeklyXp + earnedXp,
    todayXp: prevTodayXp + earnedXp,
    todayDateKey: day,
    claimedQuestsDateKey: day,
    claimedQuestIds: claimedIds,
    gems: streakResult.state.gems + earnedGems,
    lessonsCompleted: streakResult.state.lessonsCompleted + (activityType === "lesson" ? 1 : 0),
    perfectLessons:
      streakResult.state.perfectLessons + (activityType === "lesson" && accuracy === 1 ? 1 : 0),
    reviewsCompleted: streakResult.state.reviewsCompleted + (activityType === "review" ? 1 : 0),
    storiesCompleted: streakResult.state.storiesCompleted + (activityType === "story" ? 1 : 0),
    roleplaysCompleted: streakResult.state.roleplaysCompleted + (activityType === "roleplay" ? 1 : 0),
    cambridgeCompleted: streakResult.state.cambridgeCompleted + (activityType === "cambridge" ? 1 : 0),
  };

  const badgeResult = evaluateBadges(updated);
  updated.earnedBadges = badgeResult.earnedBadges;

  return {
    state: updated,
    earnedXp,
    earnedGems: earnedGems + streakResult.milestoneGems,
    multiplier,
    accuracyPct: Math.round(accuracy * 100),
    freezeUsed: streakResult.freezeUsed,
    newlyEarnedBadges: badgeResult.newlyEarned,
    dailyGoalMet: updated.todayXp >= updated.dailyGoalXp,
  };
}

/**
 * Thêm bạn học vào danh sách Chuỗi Bạn Bè (tối đa 5 người như Duolingo Friend Streaks).
 */
export function addFriendStreak(state, friendId) {
  if (state.friendStreaks.length >= MAX_FRIEND_STREAKS) {
    return { ok: false, reasonVi: "Bạn đã đạt giới hạn tối đa 5 Chuỗi Bạn Bè.", state };
  }
  if (state.friendStreaks.some((f) => f.id === friendId)) {
    return { ok: false, reasonVi: "Bạn đồng hành này đã có trong danh sách Chuỗi Bạn Bè.", state };
  }
  const found = FRIEND_DIRECTORY.find((f) => f.id === friendId);
  if (!found) {
    return { ok: false, reasonVi: "Không tìm thấy hồ sơ bạn học.", state };
  }
  const next = {
    ...state,
    friendStreaks: [
      ...state.friendStreaks,
      {
        id: found.id,
        name: found.name,
        city: found.city,
        targetBand: found.targetBand,
        streak: 1,
        lastSyncedDate: "",
        nudgedDate: "",
      },
    ],
  };
  next.earnedBadges = evaluateBadges(next).earnedBadges;
  return { ok: true, reasonVi: `Đã bắt đầu Chuỗi Bạn Bè cùng ${found.name}!`, state: next };
}

/**
 * Gỡ một bạn học khỏi danh sách Chuỗi Bạn Bè.
 */
export function removeFriendStreak(state, friendId) {
  return {
    ...state,
    friendStreaks: state.friendStreaks.filter((f) => f.id !== friendId),
  };
}

/**
 * Gửi lời cổ vũ nhắc bạn đồng hành giữ chuỗi (+5 XP khích lệ tinh thần đồng đội, 1 lần/ngày/bạn).
 */
export function nudgeFriend(state, friendId, dateKey = "2026-11-18") {
  const day = toDateKey(dateKey);
  const idx = state.friendStreaks.findIndex((f) => f.id === friendId);
  if (idx < 0) return { ok: false, messageVi: "Không tìm thấy bạn đồng hành.", state };
  const target = state.friendStreaks[idx];
  if (target.nudgedDate === day) {
    return { ok: false, messageVi: `Bạn đã gửi lời cổ vũ cho ${target.name} hôm nay rồi.`, state };
  }
  const nextFriends = state.friendStreaks.map((f, i) =>
    i === idx ? { ...f, nudgedDate: day } : f,
  );
  return {
    ok: true,
    messageVi: `Đã gửi lời cổ vũ học IELTS tới ${target.name} (+5 XP)!`,
    state: {
      ...state,
      totalXp: state.totalXp + 5,
      weeklyXp: state.weeklyXp + 5,
      friendStreaks: nextFriends,
    },
  };
}

/**
 * Mua vật phẩm hỗ trợ hoặc mở khóa Trang phục Theo mùa bằng Đá quý (Gems).
 */
export function purchaseShopItem(state, itemId, nowMs = Date.now()) {
  const suit = SEASONAL_SUITS.find((s) => s.id === itemId);
  if (suit) {
    if (state.unlockedSuits.includes(suit.id)) {
      return { ok: false, messageVi: "Bạn đã sở hữu bộ trang phục này.", state };
    }
    if (state.gems < suit.costGems) {
      return { ok: false, messageVi: "Chưa đủ Đá quý — hãy hoàn thành bài học hoặc nhiệm vụ ngày.", state };
    }
    return {
      ok: true,
      messageVi: `Đã mở khóa & khoác thử ${suit.nameVi}!`,
      state: {
        ...state,
        gems: state.gems - suit.costGems,
        unlockedSuits: [...state.unlockedSuits, suit.id],
        avatar: { ...state.avatar, suitId: suit.id },
      },
    };
  }

  const item = SHOP_ITEMS.find((s) => s.id === itemId);
  if (!item) {
    return { ok: false, messageVi: "Vật phẩm không tồn tại.", state };
  }
  if (item.id === "streak_freeze" && state.streakFreezes >= 2) {
    return { ok: false, messageVi: "Bạn đã tích trữ tối đa 2 Đóng băng Chuỗi.", state };
  }
  if (item.id === "energy_refill" && state.energy >= MAX_ENERGY) {
    return { ok: false, messageVi: "Thanh năng lượng của bạn đang đầy 25/25.", state };
  }
  if (state.gems < item.costGems) {
    return { ok: false, messageVi: "Chưa đủ Đá quý để đổi vật phẩm này.", state };
  }

  const next = { ...state, gems: state.gems - item.costGems };
  if (item.id === "streak_freeze") next.streakFreezes += 1;
  if (item.id === "double_xp") {
    const base = Math.max(Number(nowMs), Number(state.doubleXpUntilMs) || 0);
    next.doubleXpUntilMs = base + 15 * 60 * 1000;
  }
  if (item.id === "energy_refill") {
    next.energy = MAX_ENERGY;
    next.lastEnergySyncMs = Number(nowMs);
  }
  if (item.id === "combo_shield") next.comboShields += 1;
  if (item.id === "super_pass") {
    const base = Math.max(Number(nowMs), Number(state.superUntilMs) || 0);
    next.superUntilMs = base + 7 * 86400000;
    next.energy = MAX_ENERGY;
  }

  return { ok: true, messageVi: `Đổi thành công: ${item.nameVi}!`, state: next };
}

/**
 * Tạo bảng xếp hạng 30 học viên trong Giải đấu Hàng tuần hiện tại.
 * Hạng 1-7: Nhóm Thăng hạng | Hạng 8-23: Nhóm An toàn | Hạng 24-30: Nhóm Xuống hạng.
 */
export function buildLeagueStandings(state, learnerName = "Bạn (Học viên YYSD)") {
  const tier = Math.max(0, Math.min(WEEKLY_LEAGUES.length - 1, Number(state.leagueTier) || 0));
  const league = WEEKLY_LEAGUES[tier];
  const anchor = league.promoteMinXp;

  const entries = COHORT_PEERS.map((name, idx) => {
    // Phân bố điểm tất định, trải đều quanh ngưỡng thăng hạng của từng giải đấu
    const ratio = 1.45 - idx * 0.042;
    const xp = Math.max(15, Math.round(anchor * ratio));
    return { name, xp, isLearner: false };
  });
  entries.push({ name: learnerName, xp: state.weeklyXp, isLearner: true });
  entries.sort((a, b) => b.xp - a.xp || Number(b.isLearner) - Number(a.isLearner));

  const ranked = entries.map((entry, i) => {
    const rank = i + 1;
    let zone = "safe";
    if (rank <= 7 && tier < WEEKLY_LEAGUES.length - 1) zone = "promotion";
    else if (rank >= 24 && tier > 0) zone = "demotion";
    return { ...entry, rank, zone };
  });

  const learnerRow = ranked.find((r) => r.isLearner);
  return {
    league,
    nextLeague: WEEKLY_LEAGUES[tier + 1] || null,
    standings: ranked,
    learnerRank: learnerRow.rank,
    learnerZone: learnerRow.zone,
  };
}

/**
 * Tổng kết tuần giải đấu: thăng hạng nếu thuộc Top 7, xuống hạng nếu hạng 24-30,
 * và trao thưởng Đá quý cho Top 3.
 */
export function settleWeeklyLeague(state) {
  const board = buildLeagueStandings(state);
  let nextTier = board.league.tier;
  if (board.learnerZone === "promotion") nextTier += 1;
  else if (board.learnerZone === "demotion") nextTier -= 1;

  const podiumBonus = board.learnerRank === 1 ? 100 : board.learnerRank <= 3 ? 60 : board.learnerRank <= 7 ? 30 : 0;
  const next = {
    ...state,
    leagueTier: nextTier,
    weeklyXp: 0,
    gems: state.gems + podiumBonus,
  };
  next.earnedBadges = evaluateBadges(next).earnedBadges;
  return {
    state: next,
    previousLeague: board.league,
    newLeague: WEEKLY_LEAGUES[nextTier],
    finalRank: board.learnerRank,
    outcome: board.learnerZone,
    bonusGems: podiumBonus,
  };
}

/**
 * Trả về danh sách 3 Nhiệm vụ Hàng ngày kèm tiến độ và trạng thái nhận rương Đá quý.
 */
export function getDailyQuests(state, dateKey = state.todayDateKey) {
  const isSameDay = state.todayDateKey === dateKey;
  const todayXp = isSameDay ? state.todayXp : 0;
  const claimed = state.claimedQuestsDateKey === dateKey ? state.claimedQuestIds : [];
  const totalInteractive =
    state.lessonsCompleted + state.reviewsCompleted + state.storiesCompleted + state.roleplaysCompleted;

  return [
    {
      id: "q_daily_xp",
      titleVi: `Đạt mục tiêu ${state.dailyGoalXp} XP hôm nay`,
      progress: Math.min(state.dailyGoalXp, todayXp),
      target: state.dailyGoalXp,
      rewardGems: 20,
      completed: todayXp >= state.dailyGoalXp,
      claimed: claimed.includes("q_daily_xp"),
    },
    {
      id: "q_xp_sprint",
      titleVi: "Bứt phá 50 XP trong ngày",
      progress: Math.min(50, todayXp),
      target: 50,
      rewardGems: 35,
      completed: todayXp >= 50,
      claimed: claimed.includes("q_xp_sprint"),
    },
    {
      id: "q_multi_skill",
      titleVi: "Hoàn thành 3 phiên luyện kỹ năng tích lũy",
      progress: Math.min(3, totalInteractive),
      target: 3,
      rewardGems: 30,
      completed: totalInteractive >= 3,
      claimed: claimed.includes("q_multi_skill"),
    },
  ];
}

/**
 * Nhận thưởng Đá quý khi hoàn thành một Nhiệm vụ Hàng ngày.
 */
export function claimDailyQuest(state, questId, dateKey = state.todayDateKey) {
  const quests = getDailyQuests(state, dateKey);
  const quest = quests.find((q) => q.id === questId);
  if (!quest || !quest.completed || quest.claimed) {
    return { ok: false, rewardGems: 0, state };
  }
  const prevClaimed = state.claimedQuestsDateKey === dateKey ? state.claimedQuestIds : [];
  return {
    ok: true,
    rewardGems: quest.rewardGems,
    state: {
      ...state,
      gems: state.gems + quest.rewardGems,
      claimedQuestsDateKey: dateKey,
      claimedQuestIds: [...prevClaimed, questId],
    },
  };
}

/**
 * Cập nhật mục tiêu XP hàng ngày của học viên.
 */
export function setDailyGoal(state, goalXp) {
  const valid = DAILY_XP_GOALS.some((g) => g.xp === Number(goalXp)) ? Number(goalXp) : 20;
  return { ...state, dailyGoalXp: valid };
}

/**
 * Tùy chỉnh Ảnh đại diện học viên (chỉ cho phép mặc bộ trang phục mùa đã mở khóa).
 */
export function updateAvatar(state, patch = {}) {
  const nextAvatar = { ...state.avatar };
  if (patch.skinTone) nextAvatar.skinTone = String(patch.skinTone);
  if (patch.hairStyle) nextAvatar.hairStyle = String(patch.hairStyle);
  if (patch.hairColor) nextAvatar.hairColor = String(patch.hairColor);
  if (patch.glasses) nextAvatar.glasses = String(patch.glasses);
  if (patch.expression) nextAvatar.expression = String(patch.expression);
  if (patch.suitId && state.unlockedSuits.includes(patch.suitId)) {
    nextAvatar.suitId = patch.suitId;
  }
  return { ...state, avatar: nextAvatar };
}

/**
 * Kết xuất Ảnh đại diện SVG sắc nét với bộ Trang phục Theo mùa đã chọn.
 */
export function renderAvatarSvg(avatar = {}) {
  const suit = SEASONAL_SUITS.find((s) => s.id === avatar.suitId) || SEASONAL_SUITS[0];
  const skin = avatar.skinTone || "#f5d0b5";
  const hair = avatar.hairColor || "#1f2937";
  const hairPath =
    avatar.hairStyle === "bun"
      ? `<circle cx="48" cy="14" r="8" fill="${hair}"/><path d="M24 36c0-14 11-22 24-22s24 8 24 22c-6-5-14-7-24-7s-18 2-24 7Z" fill="${hair}"/>`
      : `<path d="M22 38c0-15 11-24 26-24s26 9 26 24c-5-6-15-9-26-9s-21 3-26 9Z" fill="${hair}"/>`;
  const glassesSvg =
    avatar.glasses === "round"
      ? `<g fill="none" stroke="#162447" stroke-width="2"><circle cx="38" cy="43" r="6"/><circle cx="58" cy="43" r="6"/><path d="M44 43h8"/></g>`
      : "";
  const mouthPath =
    avatar.expression === "confident"
      ? `<path d="M40 54q8 7 16-1" fill="none" stroke="#7c2d12" stroke-width="2.4" stroke-linecap="round"/>`
      : `<path d="M41 54q7 6 14 0" fill="none" stroke="#7c2d12" stroke-width="2.4" stroke-linecap="round"/>`;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="Ảnh đại diện học viên - ${suit.nameVi}">` +
    `<circle cx="48" cy="48" r="46" fill="${suit.accent}" stroke="${suit.primary}" stroke-width="2.5"/>` +
    `<path d="M18 88c4-17 16-25 30-25s26 8 30 25Z" fill="${suit.primary}"/>` +
    `<path d="M40 63l8 12 8-12" fill="#fffcf7"/>` +
    `<circle cx="48" cy="43" r="21" fill="${skin}"/>` +
    hairPath +
    `<circle cx="38" cy="43" r="2.3" fill="#0f172a"/><circle cx="58" cy="43" r="2.3" fill="#0f172a"/>` +
    glassesSvg +
    mouthPath +
    `</svg>`
  );
}
