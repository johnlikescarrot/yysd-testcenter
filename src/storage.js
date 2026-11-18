/**
 * Quản lý Trạng thái Học viên Bền vững & Cầu nối Toàn Nền tảng (src/storage.js)
 * Lưu trữ an toàn qua localStorage (có bộ nhớ dự phòng khi chạy môi trường không có DOM),
 * đồng bộ kết quả thi thử Cambridge IELTS / từ vựng vào hệ thống XP, Chuỗi Ngày Học,
 * Giải đấu Hàng tuần, Điểm Năng lực 0-160 và hàng đợi lặp lại ngắt quãng HLR.
 */

import {
  awardActivityCompletion,
  createInitialGamificationState,
  syncEnergy,
  toDateKey,
} from "./gamification.js";
import {
  DEFAULT_HLR_WEIGHTS,
  createHlrCard,
  reviewHlrCard,
} from "./hlr-srs.js";
import {
  createInitialBanditState,
} from "./notification-bandit.js";
import {
  clampProficiencyScore,
  rawScoreToIeltsBand,
  roundIeltsBand,
  updateProficiencyScore,
} from "./proficiency-score.js";
import { SKILL_PATH_UNITS } from "./ielts-curriculum.js";

export const STORAGE_KEY = "yysd:duo-ielts:v1";
export const SCHEMA_VERSION = 1;

/**
 * Tạo bộ thẻ từ vựng học thuật HLR khởi đầu để học viên có thể trải nghiệm ôn tập ngay.
 */
export function buildInitialHlrDeck(nowMs) {
  const pastMs = nowMs - 18 * 3600000; // Tạo cách đây 18 giờ để một số thẻ sẵn sàng ôn tập
  return SKILL_PATH_UNITS.slice(0, 4).flatMap((unit) =>
    unit.vocabularySeeds.map((seed) =>
      createHlrCard({
        ...seed,
        nowMs: pastMs,
      }),
    ),
  );
}

/**
 * Khởi tạo trạng thái hoàn chỉnh của học viên IELTS.
 */
export function createDefaultAppState(nowMs = Date.now()) {
  const todayKey = toDateKey(nowMs);
  return {
    version: SCHEMA_VERSION,
    profile: {
      displayName: "Học viên IELTS",
      targetBand: 7.5,
      proficiencyScore: 82, // Tương đương B1+ / Band 5.5 khởi đầu
      recentAccuracyPct: 78,
    },
    gamification: createInitialGamificationState(todayKey),
    completedUnits: {},
    completedStories: [],
    completedRoleplays: [],
    hlrWeights: { ...DEFAULT_HLR_WEIGHTS },
    hlrCards: buildInitialHlrDeck(nowMs),
    bandit: createInitialBanditState(),
    activityLog: [],
  };
}

/**
 * Tạo kho lưu trữ trừu tượng hỗ trợ cả window.localStorage lẫn bộ nhớ thử nghiệm.
 */
export function createMemoryBacking() {
  const map = new Map();
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    },
  };
}

/**
 * Đọc trạng thái học viên từ kho lưu trữ, tự động khôi phục mặc định nếu dữ liệu hỏng
 * và đồng bộ năng lượng theo thời gian thực.
 */
export function loadAppState(backing, nowMs = Date.now()) {
  const defaults = createDefaultAppState(nowMs);
  if (!backing) return defaults;
  try {
    const raw = backing.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || parsed.version !== SCHEMA_VERSION) {
      return defaults;
    }
    const mergedGamification = syncEnergy(
      {
        ...defaults.gamification,
        ...(parsed.gamification || {}),
        avatar: {
          ...defaults.gamification.avatar,
          ...(parsed.gamification?.avatar || {}),
        },
      },
      nowMs,
    );
    return {
      version: SCHEMA_VERSION,
      profile: {
        ...defaults.profile,
        ...(parsed.profile || {}),
        proficiencyScore: clampProficiencyScore(
          parsed.profile?.proficiencyScore ?? defaults.profile.proficiencyScore,
        ),
        targetBand: roundIeltsBand(parsed.profile?.targetBand || defaults.profile.targetBand) || 7.5,
      },
      gamification: mergedGamification,
      completedUnits: parsed.completedUnits && typeof parsed.completedUnits === "object"
        ? { ...parsed.completedUnits }
        : {},
      completedStories: Array.isArray(parsed.completedStories) ? [...parsed.completedStories] : [],
      completedRoleplays: Array.isArray(parsed.completedRoleplays) ? [...parsed.completedRoleplays] : [],
      hlrWeights: { ...DEFAULT_HLR_WEIGHTS, ...(parsed.hlrWeights || {}) },
      hlrCards: Array.isArray(parsed.hlrCards) && parsed.hlrCards.length > 0
        ? parsed.hlrCards
        : defaults.hlrCards,
      bandit: parsed.bandit && parsed.bandit.arms ? parsed.bandit : defaults.bandit,
      activityLog: Array.isArray(parsed.activityLog) ? parsed.activityLog.slice(0, 30) : [],
    };
  } catch {
    return defaults;
  }
}

/**
 * Lưu trạng thái học viên xuống kho lưu trữ một cách an toàn.
 */
export function saveAppState(backing, state) {
  if (!backing) return false;
  try {
    backing.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

/**
 * Ghi nhận hoàn thành một chặng trên Lộ trình IELTS Tuyến tính, đồng thời nạp từ vựng mới vào HLR.
 */
export function commitUnitLesson(
  state,
  { unit, correctCount, totalCount, maxCombo = 3, nowMs = Date.now() },
) {
  const reward = awardActivityCompletion(state.gamification, {
    activityType: "lesson",
    baseXp: unit.xpReward,
    correctCount,
    totalCount,
    maxCombo,
    nowMs,
  });

  const observedBand =
    reward.accuracyPct >= 85
      ? unit.targetBand
      : Math.max(4.0, roundIeltsBand(unit.targetBand - 0.5));
  const nextScore = updateProficiencyScore(state.profile.proficiencyScore, observedBand, 0.22);
  const nextAccuracy = Math.round(state.profile.recentAccuracyPct * 0.6 + reward.accuracyPct * 0.4);

  // Nạp các từ vựng hạt giống của chặng vào bộ thẻ HLR nếu chưa có
  const existingIds = new Set(state.hlrCards.map((c) => c.id));
  const addedCards = unit.vocabularySeeds
    .filter((seed) => !existingIds.has(seed.id))
    .map((seed) => createHlrCard({ ...seed, nowMs }));

  const nextCompleted = {
    ...state.completedUnits,
    [unit.id]: (Number(state.completedUnits[unit.id]) || 0) + 1,
  };

  const logEntry = {
    type: "lesson",
    titleVi: unit.titleVi,
    xp: reward.earnedXp,
    accuracyPct: reward.accuracyPct,
    dateKey: toDateKey(nowMs),
  };

  return {
    state: {
      ...state,
      profile: {
        ...state.profile,
        proficiencyScore: nextScore,
        recentAccuracyPct: nextAccuracy,
      },
      gamification: reward.state,
      completedUnits: nextCompleted,
      hlrCards: [...state.hlrCards, ...addedCards],
      activityLog: [logEntry, ...state.activityLog.slice(0, 29)],
    },
    reward,
    newScore: nextScore,
  };
}

/**
 * Ghi nhận kết quả ôn tập 1 thẻ từ vựng trong phòng thí nghiệm HLR.
 */
export function commitHlrReview(state, cardId, correct, nowMs = Date.now()) {
  const idx = state.hlrCards.findIndex((c) => c.id === cardId);
  if (idx < 0) return { ok: false, state, reward: null };
  const target = state.hlrCards[idx];
  const updatedHlr = reviewHlrCard(target, correct, nowMs, state.hlrWeights);
  const nextCards = state.hlrCards.map((c, i) => (i === idx ? updatedHlr.card : c));

  const reward = awardActivityCompletion(state.gamification, {
    activityType: "review",
    baseXp: 8,
    correctCount: correct ? 1 : 0,
    totalCount: 1,
    maxCombo: correct ? 2 : 0,
    nowMs,
  });

  return {
    ok: true,
    priorRecallProb: updatedHlr.priorRecallProb,
    nextHalfLifeHours: updatedHlr.card.halfLifeHours,
    reward,
    state: {
      ...state,
      gamification: reward.state,
      hlrWeights: updatedHlr.weights,
      hlrCards: nextCards,
    },
  };
}

/**
 * Cầu nối toàn nền tảng: Đồng bộ điểm thi từ bất kỳ đề Cambridge IELTS (Listening/Reading/Writing)
 * hoặc bài kiểm tra từ vựng nào vào XP, Chuỗi Ngày Học, Điểm 0-160 và bộ thẻ HLR!
 */
export function recordExternalExamScore(
  state,
  {
    title = "Đề thi Cambridge IELTS",
    skill = "reading",
    score = 0,
    total = 40,
    band = null,
    wrongWords = [],
    nowMs = Date.now(),
  } = {},
) {
  const computedBand =
    band != null && Number(band) > 0
      ? roundIeltsBand(band)
      : rawScoreToIeltsBand(score, total, skill === "listening" ? "listening" : "reading");

  const reward = awardActivityCompletion(state.gamification, {
    activityType: "cambridge",
    baseXp: 40,
    correctCount: score,
    totalCount: total,
    maxCombo: score >= total * 0.75 ? 6 : 2,
    nowMs,
  });

  const nextScore = updateProficiencyScore(state.profile.proficiencyScore, computedBand, 0.3);
  const existingTerms = new Set(state.hlrCards.map((c) => c.term.toLowerCase()));
  const newCards = [];
  for (const w of wrongWords) {
    if (!w || !w.term) continue;
    const key = String(w.term).trim().toLowerCase();
    if (!key || existingTerms.has(key)) continue;
    existingTerms.add(key);
    newCards.push(
      createHlrCard({
        id: `ext_${key.replace(/[^a-z0-9]+/g, "_")}`,
        term: String(w.term).trim(),
        meaningVi: String(w.meaningVi || "Từ vựng cần củng cố từ phòng thi"),
        skill,
        difficulty: 0.65,
        nowMs,
      }),
    );
  }

  const logEntry = {
    type: "cambridge",
    titleVi: `${title} (Band ${computedBand.toFixed(1)})`,
    xp: reward.earnedXp,
    accuracyPct: reward.accuracyPct,
    dateKey: toDateKey(nowMs),
  };

  return {
    state: {
      ...state,
      profile: {
        ...state.profile,
        proficiencyScore: nextScore,
        recentAccuracyPct: reward.accuracyPct,
      },
      gamification: reward.state,
      hlrCards: [...state.hlrCards, ...newCards],
      activityLog: [logEntry, ...state.activityLog.slice(0, 29)],
    },
    reward,
    computedBand,
    newScore: nextScore,
    addedCardsCount: newCards.length,
  };
}

/**
 * Xuất bản sao lưu tiến độ học tập ra chuỗi JSON và nhập lại an toàn.
 */
export function exportStateJson(state) {
  return JSON.stringify(state, null, 2);
}

export function importStateJson(jsonText, nowMs = Date.now()) {
  const mem = createMemoryBacking();
  try {
    const parsed = JSON.parse(String(jsonText || ""));
    if (!parsed || typeof parsed !== "object" || parsed.version !== SCHEMA_VERSION) {
      return { ok: false, errorVi: "Tệp sao lưu không đúng định dạng phiên bản YYSD.", state: null };
    }
    mem.setItem(STORAGE_KEY, JSON.stringify(parsed));
    return { ok: true, errorVi: "", state: loadAppState(mem, nowMs) };
  } catch {
    return { ok: false, errorVi: "Nội dung JSON không hợp lệ.", state: null };
  }
}
