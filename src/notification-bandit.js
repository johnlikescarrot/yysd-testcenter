/**
 * Thuật toán Nhắc học Thông minh Recovering-Difference Softmax Bandit
 * Dựa trên Yancey & Settles (2020), ACM SIGKDD:
 * "A Sleeping, Recovering Bandit Algorithm for Optimizing Recurring Notifications"
 * DOI: 10.1145/3394486.3403070
 *
 * Mỗi mẫu nhắc học là một "cánh tay" (arm) có thể ngủ (sleeping) nếu không phù hợp ngữ cảnh
 * hiện tại, và tự phục hồi độ mới mẻ (novelty recovery) khi lâu ngày chưa gửi lại.
 */

export const REMINDER_TEMPLATES = Object.freeze([
  Object.freeze({
    id: "streak_guard",
    character: "Sida",
    category: "streak",
    titleVi: "Giữ lửa chuỗi {streak} ngày học IELTS!",
    bodyVi: "Chỉ 4 phút hoàn thành 1 bài học ngắn hôm nay để bảo vệ chuỗi {streak} ngày liên tiếp của bạn.",
    condition: "needs_today_lesson",
    priorReward: 0.68,
  }),
  Object.freeze({
    id: "hlr_decay",
    character: "Hùng",
    category: "srs",
    titleVi: "{dueCount} từ vựng học thuật đang chạm ngưỡng quên",
    bodyVi: "Ôn lại ngay theo đường cong Ebbinghaus-HLR giúp tăng gấp đôi chu kỳ ghi nhớ dài hạn.",
    condition: "has_due_cards",
    priorReward: 0.66,
  }),
  Object.freeze({
    id: "friend_streak",
    character: "Mai",
    category: "social",
    titleVi: "Bạn đồng hành đang chờ nối Chuỗi Bạn Bè!",
    bodyVi: "Hoàn thành bài học hôm nay để giữ vững {friendCount} Chuỗi Bạn Bè cùng tiến tới Band {targetBand}.",
    condition: "has_friends",
    priorReward: 0.64,
  }),
  Object.freeze({
    id: "league_push",
    character: "Linh",
    category: "league",
    titleVi: "Giải đấu {leagueName}: Chỉ cách nhóm thăng hạng một bước",
    bodyVi: "Kiếm thêm 30 XP từ bài luyện Paraphrase hoặc đề Cambridge để bứt phá trên bảng xếp hạng tuần.",
    condition: "always",
    priorReward: 0.6,
  }),
  Object.freeze({
    id: "band_microstep",
    character: "Linh",
    category: "goal",
    titleVi: "Tiến gần mục tiêu IELTS Band {targetBand} mỗi ngày",
    bodyVi: "Luyện tập phân tán 5 phút mỗi ngày hiệu quả hơn học dồn hàng giờ cuối tuần (Cepeda et al., 2006).",
    condition: "always",
    priorReward: 0.62,
  }),
  Object.freeze({
    id: "sus_challenge",
    character: "Hùng",
    category: "novelty",
    titleVi: "Thử thách Câu Bất Ngờ Ngữ Nghĩa hôm nay!",
    bodyVi: "Một câu tiếng Anh đúng ngữ pháp nhưng đầy bất ngờ đang chờ bạn giải mã để kích hoạt trí nhớ sâu.",
    condition: "always",
    priorReward: 0.59,
  }),
]);

/**
 * Khởi tạo trạng thái thống kê cho toàn bộ các cánh tay bandit.
 */
export function createInitialBanditState() {
  const arms = {};
  for (const tpl of REMINDER_TEMPLATES) {
    arms[tpl.id] = {
      pulls: 1,
      rewards: tpl.priorReward,
      lastSentDayIndex: -7,
    };
  }
  return {
    dayIndex: 0,
    temperature: 0.18,
    recoveryGain: 0.22,
    recoveryTauDays: 3.0,
    arms,
    history: [],
  };
}

/**
 * Kiểm tra xem một mẫu thông báo có đang thức (eligible) trong ngữ cảnh học viên hiện tại không.
 */
export function isTemplateEligible(template, context = {}) {
  if (template.condition === "needs_today_lesson") {
    return !context.studiedToday && (Number(context.streak) || 0) > 0;
  }
  if (template.condition === "has_due_cards") {
    return (Number(context.dueCount) || 0) > 0;
  }
  if (template.condition === "has_friends") {
    return (Number(context.friendCount) || 0) > 0;
  }
  return true;
}

/**
 * Tính điểm hữu ích phục hồi độ mới u_i(delta) = meanReward + gamma * (1 - exp(-delta / tau)).
 */
export function computeRecoveringUtility(armState, currentDayIndex, recoveryGain = 0.22, recoveryTauDays = 3.0) {
  const pulls = Math.max(1, Number(armState.pulls) || 1);
  const meanReward = (Number(armState.rewards) || 0) / pulls;
  const deltaDays = Math.max(0, Number(currentDayIndex) - Number(armState.lastSentDayIndex ?? -7));
  const tau = Math.max(0.5, Number(recoveryTauDays) || 3.0);
  const noveltyBonus = recoveryGain * (1 - Math.exp(-deltaDays / tau));
  return Number((meanReward + noveltyBonus).toFixed(4));
}

export function interpolateTemplate(text, context = {}) {
  const vars = {
    streak: String(Number(context.streak) || 1),
    dueCount: String(Number(context.dueCount) || 0),
    friendCount: String(Number(context.friendCount) || 1),
    leagueName: String(context.leagueName || "Đồng"),
    targetBand: Number(context.targetBand || 7.0).toFixed(1),
  };
  return text.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? "");
}

/**
 * Tính phân phối xác suất Softmax và chọn thông báo nhắc học tối ưu cho học viên.
 * Tham số randomValue trong [0, 1) giúp kiểm thử tất định 100%.
 */
export function selectSmartReminder(banditState, context = {}, randomValue = 0.25) {
  const state = banditState && banditState.arms ? banditState : createInitialBanditState();
  const eligible = REMINDER_TEMPLATES.filter((tpl) => isTemplateEligible(tpl, context));
  const temp = Math.max(0.05, Number(state.temperature) || 0.18);

  const scored = eligible.map((tpl) => {
    const arm = state.arms[tpl.id] || { pulls: 1, rewards: tpl.priorReward, lastSentDayIndex: -7 };
    const utility = computeRecoveringUtility(
      arm,
      state.dayIndex,
      state.recoveryGain,
      state.recoveryTauDays,
    );
    return { template: tpl, utility };
  });

  const maxU = Math.max(...scored.map((s) => s.utility));
  const exps = scored.map((s) => Math.exp((s.utility - maxU) / temp));
  const sumExp = exps.reduce((a, b) => a + b, 0);

  const ranked = scored.map((s, idx) => ({
    id: s.template.id,
    character: s.template.character,
    category: s.template.category,
    titleVi: interpolateTemplate(s.template.titleVi, context),
    bodyVi: interpolateTemplate(s.template.bodyVi, context),
    utility: s.utility,
    probability: Number((exps[idx] / sumExp).toFixed(4)),
  }));

  const r = Math.max(0, Math.min(0.999999, Number(randomValue) || 0));
  let cumulative = 0;
  let chosen = ranked[ranked.length - 1];
  for (const candidate of ranked) {
    cumulative += candidate.probability;
    if (r <= cumulative) {
      chosen = candidate;
      break;
    }
  }

  return {
    chosen,
    candidates: ranked.sort((a, b) => b.probability - a.probability),
  };
}

/**
 * Ghi nhận phản hồi của học viên khi nhận thông báo (accepted = true nếu vào học ngay,
 * false nếu bỏ qua) để cập nhật kỳ vọng phần thưởng và đặt lại bộ đếm phục hồi độ mới.
 */
export function recordReminderOutcome(banditState, templateId, accepted) {
  const base = banditState && banditState.arms ? banditState : createInitialBanditState();
  const prevArm = base.arms[templateId];
  if (!prevArm) return base;

  const nextDay = (Number(base.dayIndex) || 0) + 1;
  const reward = accepted ? 1 : 0;
  const nextArms = {
    ...base.arms,
    [templateId]: {
      pulls: prevArm.pulls + 1,
      rewards: Number((prevArm.rewards + reward).toFixed(4)),
      lastSentDayIndex: nextDay,
    },
  };
  const nextHistory = [
    { templateId, accepted: Boolean(accepted), dayIndex: nextDay },
    ...(base.history || []).slice(0, 19),
  ];

  return {
    ...base,
    dayIndex: nextDay,
    arms: nextArms,
    history: nextHistory,
  };
}
