import { describe, expect, it } from "vitest";
import {
  BADGE_DEFINITIONS,
  DAILY_XP_GOALS,
  FRIEND_DIRECTORY,
  MAX_ENERGY,
  MAX_FRIEND_STREAKS,
  SEASONAL_SUITS,
  SHOP_ITEMS,
  WEEKLY_LEAGUES,
  addFriendStreak,
  advanceDailyStreak,
  awardActivityCompletion,
  buildLeagueStandings,
  claimDailyQuest,
  consumeEnergyOnMistake,
  createInitialGamificationState,
  diffDays,
  getDailyQuests,
  isDoubleXpActive,
  isSuperActive,
  nudgeFriend,
  purchaseShopItem,
  removeFriendStreak,
  renderAvatarSvg,
  setDailyGoal,
  settleWeeklyLeague,
  syncEnergy,
  toDateKey,
  updateAvatar,
} from "../src/gamification.js";

describe("gamification", () => {
  it("cung cấp đủ 10 Giải đấu Hàng tuần, 4 Trang phục Mùa, 5 Vật phẩm, 12 Huy hiệu và mục tiêu XP", () => {
    expect(WEEKLY_LEAGUES.map((l) => l.nameEn)).toEqual([
      "Bronze", "Silver", "Gold", "Sapphire", "Ruby",
      "Emerald", "Amethyst", "Pearl", "Obsidian", "Diamond",
    ]);
    expect(SEASONAL_SUITS.length).toBe(4);
    expect(SHOP_ITEMS.length).toBe(5);
    expect(BADGE_DEFINITIONS.length).toBe(12);
    expect(DAILY_XP_GOALS.length).toBe(4);
    expect(FRIEND_DIRECTORY.length).toBeGreaterThan(MAX_FRIEND_STREAKS);
  });

  it("quản lý ngày, Chuỗi Ngày Học, Đóng băng Chuỗi và mốc thưởng Đá quý", () => {
    expect(toDateKey("2026-11-18")).toBe("2026-11-18");
    expect(toDateKey(Date.parse("2026-11-18T08:30:00Z"))).toBe("2026-11-18");
    expect(toDateKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(diffDays("", "2026-11-18")).toBe(Infinity);
    expect(diffDays("2026-11-18", "2026-11-20")).toBe(2);

    let st = createInitialGamificationState("2026-11-01");
    st.friendStreaks = [
      ...st.friendStreaks,
      { id: "custom_peer", name: "Bạn mới", city: "Huế", targetBand: 7.0, streak: 1, lastSyncedDate: "", nudgedDate: "" },
    ];
    // Ngày 1
    let r = advanceDailyStreak(st, "2026-11-01");
    expect(r.state.streak).toBe(1);
    // Học lại cùng ngày
    r = advanceDailyStreak(r.state, "2026-11-01");
    expect(r.state.streak).toBe(1);
    // Ngày 2 liên tiếp
    r = advanceDailyStreak(r.state, "2026-11-02");
    expect(r.state.streak).toBe(2);
    // Nghỉ 1 ngày -> tự động dùng Đóng băng Chuỗi và đạt mốc 3 ngày!
    r = advanceDailyStreak(r.state, "2026-11-04");
    expect(r.freezeUsed).toBe(true);
    expect(r.state.streak).toBe(3);
    expect(r.state.streakFreezes).toBe(0);
    expect(r.milestoneGems).toBe(15);
    // Nghỉ 3 ngày khi đã hết Đóng băng Chuỗi -> quay về 1
    r = advanceDailyStreak(r.state, "2026-11-08");
    expect(r.state.streak).toBe(1);
  });

  it("quản lý Năng lượng 25 đơn vị, hồi phục tự động, Lá chắn Combo và Siêu Cấp IELTS", () => {
    const t0 = Date.parse("2026-11-18T00:00:00Z");
    let st = createInitialGamificationState("2026-11-18");
    expect(isSuperActive(st, t0)).toBe(false);
    expect(isSuperActive({}, t0)).toBe(false);
    expect(isDoubleXpActive(st, t0)).toBe(false);
    expect(isDoubleXpActive({}, t0)).toBe(false);
    expect(syncEnergy(st, t0).energy).toBe(MAX_ENERGY);

    // Sai câu làm giảm năng lượng
    const m1 = consumeEnergyOnMistake(st, t0);
    expect(m1.state.energy).toBe(MAX_ENERGY - 2);
    expect(m1.depleted).toBe(false);

    // Chưa đủ 20 phút -> chưa hồi
    expect(syncEnergy(m1.state, t0 + 5 * 60000).energy).toBe(MAX_ENERGY - 2);
    expect(syncEnergy({ ...m1.state, lastEnergySyncMs: 0 }, t0).energy).toBe(MAX_ENERGY - 2);
    // Sau 40 phút -> hồi đủ 25
    expect(syncEnergy(m1.state, t0 + 40 * 60000).energy).toBe(MAX_ENERGY);

    // Cạn năng lượng về 0
    const low = consumeEnergyOnMistake({ ...st, energy: 1, lastEnergySyncMs: t0 }, t0);
    expect(low.depleted).toBe(true);
    expect(low.state.energy).toBe(0);

    // Dùng Lá chắn Combo
    const shielded = consumeEnergyOnMistake({ ...st, comboShields: 1 }, t0);
    expect(shielded.shieldUsed).toBe(true);
    expect(shielded.state.comboShields).toBe(0);

    // Đang ở chế độ Siêu Cấp IELTS
    const superSt = consumeEnergyOnMistake({ ...st, superUntilMs: t0 + 99999 }, t0);
    expect(superSt.state.energy).toBe(MAX_ENERGY);
    expect(isSuperActive(st)).toBe(false);
    expect(isDoubleXpActive(st)).toBe(false);
    expect(syncEnergy(st).energy).toBe(MAX_ENERGY);
    expect(consumeEnergyOnMistake({ ...st, comboShields: 0 }).state.energy).toBeLessThanOrEqual(MAX_ENERGY);
  });

  it("trao XP, nhân đôi XP, mở khóa đủ 12 huy hiệu và hoàn thành Nhiệm vụ Hàng ngày", () => {
    const t0 = Date.parse("2026-11-18T10:00:00Z");
    let st = createInitialGamificationState("2026-11-18");

    const defRes = awardActivityCompletion(st);
    expect(defRes.earnedXp).toBeGreaterThan(0);

    const a1 = awardActivityCompletion(st, {
      activityType: "lesson",
      baseXp: 25,
      correctCount: 5,
      totalCount: 5,
      maxCombo: 5,
      nowMs: t0,
    });
    expect(a1.accuracyPct).toBe(100);
    expect(a1.dailyGoalMet).toBe(true);
    expect(a1.newlyEarnedBadges).toContain("first_step");
    expect(a1.newlyEarnedBadges).toContain("perfect_lesson");

    // Kích hoạt nhân đôi XP và sang ngày mới
    const tNext = Date.parse("2026-11-19T10:00:00Z");
    const a2 = awardActivityCompletion(
      { ...a1.state, doubleXpUntilMs: tNext + 60000, streak: 29, totalXp: 1990, leagueTier: 9 },
      { activityType: "story", baseXp: 20, correctCount: 2, totalCount: 4, maxCombo: 0, nowMs: tNext },
    );
    expect(a2.multiplier).toBe(2);
    expect(a2.newlyEarnedBadges).toContain("story_reader");
    expect(a2.newlyEarnedBadges).toContain("streak_30");
    expect(a2.newlyEarnedBadges).toContain("xp_2000");
    expect(a2.newlyEarnedBadges).toContain("diamond_tier");

    const a3 = awardActivityCompletion(a2.state, { activityType: "roleplay", totalCount: 0, correctCount: 0, nowMs: tNext });
    expect(a3.newlyEarnedBadges).toContain("roleplay_star");
    const a4 = awardActivityCompletion(a3.state, { activityType: "cambridge", nowMs: tNext });
    expect(a4.newlyEarnedBadges).toContain("cambridge_hero");
    const a5 = awardActivityCompletion(a4.state, { activityType: "review", nowMs: tNext });
    expect(a5.state.reviewsCompleted).toBe(1);

    // Nhiệm vụ hàng ngày & nhận thưởng
    const quests = getDailyQuests(a5.state);
    expect(quests.every((q) => q.completed)).toBe(true);
    expect(getDailyQuests(a5.state, "2099-01-01")[0].progress).toBe(0);

    const claim1 = claimDailyQuest(a5.state, "q_daily_xp");
    expect(claim1.ok).toBe(true);
    expect(claimDailyQuest(claim1.state, "q_daily_xp").ok).toBe(false);
    expect(claimDailyQuest(claim1.state, "khong_co").ok).toBe(false);
    expect(claimDailyQuest({ ...claim1.state, claimedQuestsDateKey: "2020-01-01" }, "q_multi_skill").ok).toBe(true);

    expect(setDailyGoal(st, 50).dailyGoalXp).toBe(50);
    expect(setDailyGoal(st, 999).dailyGoalXp).toBe(20);
  });

  it("quản lý Chuỗi Bạn Bè (tối đa 5 bạn) và gửi lời cổ vũ hàng ngày", () => {
    let st = createInitialGamificationState("2026-11-18");
    expect(addFriendStreak(st, "f_minhanh").ok).toBe(false);
    expect(addFriendStreak(st, "khong_ton_tai").ok).toBe(false);

    for (const id of ["f_hoangnam", "f_khanhlinh", "f_thaochi"]) {
      const res = addFriendStreak(st, id);
      expect(res.ok).toBe(true);
      st = res.state;
    }
    expect(st.friendStreaks.length).toBe(5);
    expect(st.earnedBadges).toContain("friend_bond");
    expect(addFriendStreak(st, "f_ducmanh").ok).toBe(false);

    const n1 = nudgeFriend(st, "f_minhanh", "2026-11-18");
    expect(n1.ok).toBe(true);
    expect(nudgeFriend(n1.state, "f_minhanh", "2026-11-18").ok).toBe(false);
    expect(nudgeFriend(n1.state, "missing").ok).toBe(false);

    const removed = removeFriendStreak(n1.state, "f_thaochi");
    expect(removed.friendStreaks.length).toBe(4);
  });

  it("mua đủ 5 vật phẩm Cửa hàng, 4 Trang phục Theo mùa, giải đấu 10 bậc và kết xuất SVG Avatar", () => {
    const t0 = Date.parse("2026-11-18T12:00:00Z");
    let st = { ...createInitialGamificationState("2026-11-18"), gems: 1000, energy: 10 };

    expect(purchaseShopItem(st, "unknown", t0).ok).toBe(false);
    expect(purchaseShopItem(st, "spring_blossom", t0).ok).toBe(false);
    expect(purchaseShopItem({ ...st, gems: 5 }, "summer_ocean", t0).ok).toBe(false);
    expect(purchaseShopItem({ ...st, gems: 5 }, "double_xp", t0).ok).toBe(false);

    const buySuit = purchaseShopItem(st, "winter_cambridge", t0);
    expect(buySuit.ok).toBe(true);
    st = buySuit.state;

    st = purchaseShopItem(st, "streak_freeze", t0).state;
    expect(purchaseShopItem(st, "streak_freeze", t0).ok).toBe(false);

    st = purchaseShopItem(st, "energy_refill", t0).state;
    expect(st.energy).toBe(MAX_ENERGY);
    expect(purchaseShopItem(st, "energy_refill", t0).ok).toBe(false);

    st = purchaseShopItem(st, "double_xp", t0).state;
    expect(isDoubleXpActive(st, t0 + 1000)).toBe(true);

    st = purchaseShopItem(st, "combo_shield", t0).state;
    expect(st.comboShields).toBe(1);

    st = purchaseShopItem(st, "super_pass", t0).state;
    expect(isSuperActive(st, t0 + 1000)).toBe(true);
    expect(purchaseShopItem(st, "combo_shield").ok).toBe(true);

    // Bảng xếp hạng & tổng kết giải đấu (thăng hạng, hạng 2-3, hạng 4-7, an toàn, xuống hạng)
    const top1 = settleWeeklyLeague({ ...st, leagueTier: 0, weeklyXp: 5000 });
    expect(top1.outcome).toBe("promotion");
    expect(top1.newLeague.id).toBe("silver");
    expect(top1.bonusGems).toBe(100);

    const top3 = settleWeeklyLeague({ ...st, leagueTier: 1, weeklyXp: 280 });
    expect(top3.bonusGems).toBe(60);

    const top7 = settleWeeklyLeague({ ...st, leagueTier: 1, weeklyXp: 250 });
    expect(top7.bonusGems).toBe(30);

    const demote = settleWeeklyLeague({ ...st, leagueTier: 2, weeklyXp: 0 });
    expect(demote.outcome).toBe("demotion");
    expect(demote.newLeague.id).toBe("silver");
    expect(demote.bonusGems).toBe(0);

    // Hòa điểm với học viên khác trong bảng xếp hạng
    const tieBoard = buildLeagueStandings({ ...st, leagueTier: 9, weeklyXp: Math.round(1800 * 1.45) });
    expect(tieBoard.nextLeague).toBeNull();
    expect(buildLeagueStandings({ ...st, leagueTier: 0, weeklyXp: 120 }).learnerRank).toBeLessThanOrEqual(30);

    // Tùy chỉnh Avatar & SVG
    const av1 = updateAvatar(st, {
      skinTone: "#eac096",
      hairStyle: "bun",
      hairColor: "#451a03",
      glasses: "none",
      expression: "confident",
      suitId: "winter_cambridge",
    });
    const av2 = updateAvatar(av1, { suitId: "summer_ocean" });
    expect(av2.avatar.suitId).toBe("winter_cambridge");
    expect(updateAvatar(av2).avatar.hairStyle).toBe("bun");

    expect(renderAvatarSvg(av2.avatar)).toContain("<svg");
    expect(renderAvatarSvg(st.avatar)).toContain("<circle");
    expect(renderAvatarSvg()).toContain("Áo Học Viện Xuân Hoa Đào");
  });
});
