import { describe, expect, it } from "vitest";
import {
  PROFICIENCY_BANDS,
  clampProficiencyScore,
  computeOverallIeltsBand,
  computeTargetGap,
  formatLinkedInBadge,
  ieltsBandToScore,
  rawScoreToIeltsBand,
  roundIeltsBand,
  scoreToProfile,
  updateProficiencyScore,
} from "../src/proficiency-score.js";
import {
  DEFAULT_HLR_WEIGHTS,
  MAX_HALF_LIFE_HOURS,
  MIN_HALF_LIFE_HOURS,
  buildForgettingCurvePoints,
  classifyMemoryStrength,
  createHlrCard,
  extractHlrFeatures,
  getReviewQueue,
  predictHalfLifeHours,
  predictRecallProbability,
  reviewHlrCard,
} from "../src/hlr-srs.js";
import {
  REMINDER_TEMPLATES,
  computeRecoveringUtility,
  createInitialBanditState,
  interpolateTemplate,
  isTemplateEligible,
  recordReminderOutcome,
  selectSmartReminder,
} from "../src/notification-bandit.js";

describe("proficiency-score", () => {
  it("giới hạn điểm 0-160 và làm tròn IELTS Band theo chuẩn Cambridge", () => {
    expect(clampProficiencyScore(-10)).toBe(0);
    expect(clampProficiencyScore(220)).toBe(160);
    expect(clampProficiencyScore("abc")).toBe(0);
    expect(clampProficiencyScore(112.6)).toBe(113);

    expect(roundIeltsBand("nan")).toBe(0);
    expect(roundIeltsBand(7.24)).toBe(7.0);
    expect(roundIeltsBand(7.26)).toBe(7.5);
    expect(roundIeltsBand(10)).toBe(9.0);

    expect(computeOverallIeltsBand({})).toBe(0);
    expect(computeOverallIeltsBand({ listening: 6.5, reading: 6.5, writing: 6.0, speaking: 6.0 })).toBe(6.5);
    expect(computeOverallIeltsBand({ listening: 7.0, reading: 7.0, writing: 6.5, speaking: 6.5 })).toBe(7.0);
    expect(computeOverallIeltsBand({ listening: 6.0, reading: 6.0, writing: 6.0, speaking: 6.5 })).toBe(6.0);
  });

  it("quy đổi chính xác điểm thô 40 câu Listening và Academic Reading", () => {
    expect(rawScoreToIeltsBand(40, 40, "listening")).toBe(9.0);
    expect(rawScoreToIeltsBand(30, 40, "listening")).toBe(7.0);
    expect(rawScoreToIeltsBand(23, 40, "reading")).toBe(6.0);
    expect(rawScoreToIeltsBand(0, 40, "reading")).toBe(2.0);
    expect(rawScoreToIeltsBand(10, 0)).toBe(4.0);
    expect(rawScoreToIeltsBand(null)).toBe(2.0);
  });

  it("ánh xạ hai chiều giữa thang 0-160, CEFR A1-C2 và IELTS Band, kèm huy hiệu LinkedIn", () => {
    expect(PROFICIENCY_BANDS.length).toBe(14);
    expect(scoreToProfile(0).cefr).toBe("Pre-A1");
    expect(scoreToProfile(125).ieltsBand).toBe(7.0);
    expect(scoreToProfile(160).ieltsBand).toBe(9.0);

    expect(ieltsBandToScore(1.5)).toBe(8);
    expect(ieltsBandToScore(4.5)).toBe(58);
    expect(ieltsBandToScore(7.5)).toBe(135);
    expect(ieltsBandToScore(9.0)).toBe(158);

    const up = updateProficiencyScore(90, 7.5, 0.5);
    expect(up).toBeGreaterThan(90);
    expect(updateProficiencyScore(90, 7.5, 0)).toBeGreaterThan(90);

    const gap = computeTargetGap(82, 7.5);
    expect(gap.reached).toBe(false);
    expect(gap.pointsNeeded).toBeGreaterThan(0);
    expect(computeTargetGap(155, 7.5).reached).toBe(true);
    expect(computeTargetGap(100, 0).targetBand).toBe(7.0);

    const badge = formatLinkedInBadge(125, "Nguyễn An", "2026-11-18");
    expect(badge.summaryVi).toContain("Nguyễn An");
    expect(badge.summaryVi).toContain("125/160");
    expect(badge.linkedInUrl).toContain("linkedin.com/profile/add");
    expect(formatLinkedInBadge(100, "   ").learnerName).toBe("Học viên YYSD");
    expect(formatLinkedInBadge(100, "").learnerName).toBe("Học viên YYSD");
    expect(formatLinkedInBadge(100).learnerName).toBe("Học viên YYSD");
  });
});

describe("hlr-srs", () => {
  it("tính chu kỳ bán rã, xác suất nhớ và cập nhật trọng số HLR khi trả lời đúng/sai", () => {
    const t0 = Date.parse("2026-11-18T00:00:00Z");
    const card = createHlrCard({
      id: "c1",
      term: "mitigate",
      meaningVi: "giảm nhẹ",
      difficulty: 0.5,
      nowMs: t0,
    });
    const cardDefaults = createHlrCard({ id: "c2", term: "x", meaningVi: "y", difficulty: 0 });
    expect(cardDefaults.difficulty).toBe(0.4);
    expect(extractHlrFeatures({}).bias).toBe(1);

    expect(card.halfLifeHours).toBeGreaterThan(MIN_HALF_LIFE_HOURS);
    expect(card.halfLifeHours).toBeLessThan(MAX_HALF_LIFE_HOURS);
    expect(predictHalfLifeHours(card)).toBe(card.halfLifeHours);
    expect(predictRecallProbability(card.halfLifeHours, card.halfLifeHours)).toBeCloseTo(0.5, 2);
    expect(predictRecallProbability(0, 0)).toBe(1);

    const afterRight = reviewHlrCard(card, true, t0 + 6 * 3600000, DEFAULT_HLR_WEIGHTS);
    expect(afterRight.card.right).toBe(1);
    expect(afterRight.card.consecutiveRight).toBe(1);
    expect(afterRight.card.halfLifeHours).toBeGreaterThan(card.halfLifeHours);

    const afterWrong = reviewHlrCard(afterRight.card, false, t0 + 12 * 3600000, afterRight.weights);
    expect(afterWrong.card.wrong).toBe(1);
    expect(afterWrong.card.consecutiveRight).toBe(0);
    expect(afterWrong.card.halfLifeHours).toBeLessThan(afterRight.card.halfLifeHours);

    const noLast = reviewHlrCard({ ...card, lastReviewedMs: 0, right: 0, wrong: 0, consecutiveRight: 0 }, true);
    expect(noLast.card.right).toBe(1);
  });

  it("phân loại độ bền trí nhớ, xếp hàng đợi ôn tập và sinh đường cong quên", () => {
    expect(classifyMemoryStrength(0.9).code).toBe("gold");
    expect(classifyMemoryStrength(0.7).code).toBe("good");
    expect(classifyMemoryStrength(0.45).code).toBe("fading");
    expect(classifyMemoryStrength(0.2).code).toBe("cracked");
    expect(classifyMemoryStrength(null).code).toBe("cracked");

    const t0 = Date.parse("2026-11-18T00:00:00Z");
    const cFresh = createHlrCard({ id: "a", term: "a", meaningVi: "a", nowMs: t0 });
    const cOld = {
      ...createHlrCard({ id: "b", term: "b", meaningVi: "b", difficulty: 0.7, nowMs: t0 - 48 * 3600000 }),
      halfLifeHours: 0,
    };
    const cTie = {
      ...createHlrCard({ id: "c", term: "c", meaningVi: "c", difficulty: 0.3, nowMs: 0 }),
      halfLifeHours: 4,
    };
    const q = getReviewQueue([cFresh, cOld, cTie], t0, 0.6);
    expect(q.due.length).toBe(1);
    expect(q.due[0].id).toBe("b");
    expect(getReviewQueue([], t0).averageRetentionPct).toBe(100);
    expect(getReviewQueue().all).toEqual([]);

    const curve = buildForgettingCurvePoints(24);
    expect(curve.length).toBe(8);
    expect(curve[0].retentionPct).toBe(100);
    expect(curve[3].retentionPct).toBe(50);
  });
});

describe("notification-bandit", () => {
  it("đánh giá điều kiện ngủ/thức, phục hồi độ mới và cập nhật phần thưởng Softmax Bandit", () => {
    expect(REMINDER_TEMPLATES.length).toBe(6);
    const init = createInitialBanditState();
    expect(Object.keys(init.arms).length).toBe(6);

    const streakTpl = REMINDER_TEMPLATES[0];
    const hlrTpl = REMINDER_TEMPLATES[1];
    const friendTpl = REMINDER_TEMPLATES[2];
    const alwaysTpl = REMINDER_TEMPLATES[3];
    expect(isTemplateEligible(streakTpl, { studiedToday: false, streak: 5 })).toBe(true);
    expect(isTemplateEligible(streakTpl, { studiedToday: true, streak: 5 })).toBe(false);
    expect(isTemplateEligible(streakTpl)).toBe(false);
    expect(isTemplateEligible(hlrTpl, { dueCount: 3 })).toBe(true);
    expect(isTemplateEligible(hlrTpl, { dueCount: 0 })).toBe(false);
    expect(isTemplateEligible(friendTpl, { friendCount: 2 })).toBe(true);
    expect(isTemplateEligible(friendTpl, {})).toBe(false);
    expect(isTemplateEligible(alwaysTpl, {})).toBe(true);

    const recentU = computeRecoveringUtility({ pulls: 2, rewards: 1, lastSentDayIndex: 5 }, 5);
    const recoveredU = computeRecoveringUtility({ pulls: 2, rewards: 1, lastSentDayIndex: 0 }, 10);
    expect(recoveredU).toBeGreaterThan(recentU);
    expect(computeRecoveringUtility({ pulls: 0, rewards: 0 }, 2, 0.2, 0)).toBeGreaterThan(0);

    const pick1 = selectSmartReminder(
      init,
      { studiedToday: false, streak: 7, dueCount: 4, friendCount: 2, leagueName: "Vàng", targetBand: 7.5 },
      0.01,
    );
    expect(pick1.candidates.length).toBe(6);
    expect(pick1.chosen.titleVi.length).toBeGreaterThan(5);

    const customState = {
      ...init,
      temperature: 0,
      arms: { ...init.arms, sus_challenge: undefined },
    };
    const pickHigh = selectSmartReminder(customState, {}, 0.999999);
    expect(pickHigh.chosen).toBeTruthy();

    const pickNull = selectSmartReminder(null, undefined, null);
    expect(pickNull.candidates.length).toBe(3);

    // Kiểm tra nhánh không khớp biến nội suy
    expect(interpolateTemplate("Xin chào {streak} {unknownVar}")).toBe("Xin chào 1 ");
    const acceptedState = recordReminderOutcome(init, "streak_guard", true);
    expect(acceptedState.arms.streak_guard.pulls).toBe(2);
    expect(acceptedState.dayIndex).toBe(1);

    const dismissedState = recordReminderOutcome(
      { ...acceptedState, dayIndex: 0, history: null },
      "hlr_decay",
      false,
    );
    expect(dismissedState.arms.hlr_decay.pulls).toBe(2);
    expect(recordReminderOutcome(null, "unknown_id", true).dayIndex).toBe(0);
  });
});
