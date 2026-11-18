/** Bảng xếp hạng tuần với đối thủ mô phỏng ổn định theo tuần. */

import { rng } from './quiz.js';
import { weekKey } from './date.js';

export const BOT_NAMES = [
  'Minh Anh', 'Bảo Long', 'Thu Hà', 'Gia Hân', 'Quốc Việt', 'Lan Chi',
  'Đức Huy', 'Mai Phương', 'Hoàng Nam', 'Ngọc Diệp', 'Tấn Phát', 'Khánh Ly',
];

/** Điểm XP của các đối thủ trong tuần, tỉ lệ với điểm của người học. */
export function leagueBots(week, userXp) {
  const random = rng(`league-${week}`);
  const scale = Math.max(60, Math.round((Number(userXp) || 0) * 0.85));
  return BOT_NAMES.map((name, index) => ({
    id: `bot-${index}`,
    name,
    xp: Math.round(scale * (0.25 + random() * 0.7)),
  }));
}

/** Bảng xếp hạng đầy đủ (người học + đối thủ), sắp xếp giảm dần. */
export function weeklyStandings(state, now) {
  const week = weekKey(now);
  const userXp = (state?.history || [])
    .filter((entry) => weekKey(`${entry.day}T12:00:00`) === week)
    .reduce((sum, entry) => sum + (entry.xp || 0), 0);
  const rows = [
    ...leagueBots(week, userXp),
    { id: 'me', name: (state?.profile?.name || 'Bạn'), xp: userXp, me: true },
  ];
  return rows.sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name, 'vi'));
}

/** Thứ hạng của người học. */
export function myRank(standings) {
  const index = (standings || []).findIndex((row) => row.me);
  return index < 0 ? 0 : index + 1;
}

/** Số người được thăng hạng mỗi tuần (tối thiểu 3). */
export function promotionCutoff(standings) {
  return Math.max(3, Math.ceil((standings || []).length * 0.2));
}

/** Tóm tắt vị trí tuần này. */
export function leagueSummary(state, now) {
  const standings = weeklyStandings(state, now);
  const rank = myRank(standings);
  const cutoff = promotionCutoff(standings);
  const me = standings.find((row) => row.me);
  return {
    standings,
    rank,
    cutoff,
    xp: me?.xp || 0,
    promoting: rank > 0 && rank <= cutoff,
    total: standings.length,
  };
}
