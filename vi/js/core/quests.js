/** Nhiệm vụ hằng ngày (Duolingo-style) — chọn theo ngày, có hạt giống ổn định. */

import { shuffle } from './quiz.js';

export const QUEST_POOL = [
  { id: 'xp', metric: 'xp', target: 30, title: 'Kiếm 30 XP', hint: 'Học một bài ngắn là đủ', gems: 8, icon: 'bolt' },
  { id: 'lessons', metric: 'lessons', target: 2, title: 'Hoàn thành 2 bài học', hint: 'Chia nhỏ để giữ nhịp', gems: 10, icon: 'book' },
  { id: 'correct', metric: 'correct', target: 15, title: 'Trả lời đúng 15 câu', hint: 'Đọc kỹ đề trước khi chọn', gems: 8, icon: 'check' },
  { id: 'combo', metric: 'combo', target: 8, title: 'Đạt chuỗi đúng 8 câu', hint: 'Giữ bình tĩnh, đừng đoán bừa', gems: 6, icon: 'flame' },
  { id: 'review', metric: 'review', target: 10, title: 'Ôn 10 thẻ từ vựng', hint: 'Ôn tập ngắt quãng hiệu quả hơn học dồn', gems: 6, icon: 'cards' },
];

/** Ba nhiệm vụ của ngày `day` (YYYY-MM-DD), ổn định giữa các lần tải. */
export function dailyQuests(day) {
  return shuffle(QUEST_POOL, `quest-${day}`).slice(0, 3).map((quest) => ({
    ...quest,
    progress: 0,
    rewarded: false,
  }));
}

/** Cộng tiến độ nhiệm vụ theo một sự kiện { xp, lessons, correct, combo, review }. */
export function applyQuestProgress(quests, event = {}) {
  return (quests || []).map((quest) => {
    const gain = Number(event[quest.metric]) || 0;
    if (gain <= 0) return quest;
    return { ...quest, progress: Math.min(quest.target, quest.progress + gain) };
  });
}

/** Nhiệm vụ đã hoàn thành. */
export function isQuestDone(quest) {
  return Boolean(quest) && quest.progress >= quest.target;
}

/** Trao thưởng cho nhiệm vụ đã xong nhưng chưa nhận. */
export function claimRewards(quests) {
  let gems = 0;
  const next = (quests || []).map((quest) => {
    if (!isQuestDone(quest) || quest.rewarded) return quest;
    gems += quest.gems;
    return { ...quest, rewarded: true };
  });
  return { quests: next, gems };
}

/** Tổng quan nhiệm vụ trong ngày. */
export function questsSummary(quests) {
  const items = quests || [];
  const done = items.filter(isQuestDone).length;
  return { done, total: items.length, ratio: items.length > 0 ? done / items.length : 0 };
}
