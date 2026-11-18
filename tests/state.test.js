import { describe, it, expect } from 'vitest';
import * as S from '../docs/js/state.js';
import { QUESTIONS, GOALS, MAX_HEARTS, BADGES, LEAGUES, SCORE_TABLE } from '../docs/js/data.js';

const DAY = '2026-11-18';

describe('máy trạng thái', () => {
  it('tạo trạng thái ban đầu đầy đủ', () => {
    const s = S.createInitialState(DAY);
    expect(s.day).toBe(DAY);
    expect(s.hearts).toBe(MAX_HEARTS);
    expect(s.goalIndex).toBe(2);
    expect(s.cards).toEqual([]);
    expect(s.feedback).toBeNull();
  });

  it('giới hạn giá trị trong ba nhánh', () => {
    expect(S.clamp(-4, 0, 10)).toBe(0);
    expect(S.clamp(5, 0, 10)).toBe(5);
    expect(S.clamp(40, 0, 10)).toBe(10);
  });

  it('cộng ngày và tính khoảng cách ngày', () => {
    expect(S.addDays(DAY, 1)).toBe('2026-11-19');
    expect(S.addDays(DAY, 30)).toBe('2026-12-18');
    expect(S.dayDifference('', DAY)).toBe(1);
    expect(S.dayDifference(DAY, DAY)).toBe(0);
    expect(S.dayDifference('2026-11-17', DAY)).toBe(1);
  });

  it('cập nhật chuỗi ngày cho ba trường hợp', () => {
    const base = S.createInitialState(DAY);
    expect(S.nextStreak(base, DAY)).toBe(1);
    const yesterday = { ...base, lastDay: '2026-11-17', streak: 4 };
    expect(S.nextStreak(yesterday, DAY)).toBe(5);
    const today = { ...base, lastDay: DAY, streak: 4 };
    expect(S.nextStreak(today, DAY)).toBe(4);
    const old = { ...base, lastDay: '2026-10-01', streak: 9 };
    expect(S.nextStreak(old, DAY)).toBe(1);
  });

  it('chuẩn hoá và chấm đáp án', () => {
    expect(S.normalise('  Review   ')).toBe('review');
    expect(S.isCorrect(QUESTIONS[0], ' REVIEW ')).toBe(true);
    expect(S.isCorrect(QUESTIONS[0], 'reviewing')).toBe(false);
  });

  it('lên lịch ôn tập cho câu đúng và câu sai', () => {
    const seed = { id: 'q1', repetitions: 0, interval: 1, due: DAY };
    const good = S.scheduleCard(seed, true, DAY);
    expect(good.repetitions).toBe(1);
    expect(good.due).toBe('2026-11-19');
    const bad = S.scheduleCard({ ...seed, repetitions: 4 }, false, DAY);
    expect(bad.repetitions).toBe(0);
    expect(bad.interval).toBe(1);
    expect(S.mergeCard([good, { id: 'q2' }], { ...good, interval: 4 })).toHaveLength(2);
  });

  it('áp dụng câu trả lời đúng', () => {
    const result = S.applyAnswer(S.createInitialState(DAY), QUESTIONS[0], 'review', DAY);
    expect(result.correct).toBe(true);
    expect(result.state.xp).toBe(10);
    expect(result.state.correct).toBe(1);
    expect(result.state.streak).toBe(1);
    expect(result.state.hearts).toBe(MAX_HEARTS);
    expect(result.state.feedbackKind).toBe('good');
    expect(result.state.cards).toHaveLength(1);
  });

  it('áp dụng câu trả lời sai', () => {
    const result = S.applyAnswer(S.createInitialState(DAY), QUESTIONS[0], 'nope', DAY);
    expect(result.correct).toBe(false);
    expect(result.state.xp).toBe(2);
    expect(result.state.hearts).toBe(MAX_HEARTS - 1);
    expect(result.state.feedbackKind).toBe('bad');
    expect(result.state.correct).toBe(0);
  });

  it('bắt đầu và chuyển bài học, kể cả hết vòng', () => {
    const started = S.startLesson(S.createInitialState(DAY));
    expect(started.inLesson).toBe(true);
    const moved = S.advanceLesson(started);
    expect(moved.lessonIndex).toBe(1);
    const last = S.advanceLesson({ ...started, lessonIndex: QUESTIONS.length - 1 });
    expect(last.lessonIndex).toBe(0);
    expect(last.inLesson).toBe(false);
  });

  it('tính cấp độ, giải đấu, band và tiến độ ngày', () => {
    expect(S.levelFor(0)).toBe(1);
    expect(S.levelFor(250)).toBe(3);
    expect(S.leagueFor(0).id).toBe(LEAGUES[0].id);
    expect(S.leagueFor(9999).id).toBe(LEAGUES.at(-1).id);
    expect(S.bandFor(0)).toBe(SCORE_TABLE[0].band);
    expect(S.bandFor(999)).toBe(SCORE_TABLE.at(-1).band);
    expect(S.dailyPercent({ xpToday: 25, goalIndex: 2 })).toBe(50);
    expect(S.dailyPercent({ xpToday: 500, goalIndex: 2 })).toBe(100);
  });

  it('tính tỉ lệ đúng cho cả trường hợp chưa có câu nào', () => {
    expect(S.accuracy({ answered: 0, correct: 0 })).toBe(0);
    expect(S.accuracy({ answered: 3, correct: 2 })).toBe(67);
  });

  it('lọc thẻ đến hạn và huy hiệu đạt được', () => {
    const cards = [
      { id: 'a', due: '2026-11-17' },
      { id: 'b', due: '2026-11-19' },
      { id: 'c', due: '2026-11-20' }
    ];
    expect(S.dueCards(cards, DAY)).toHaveLength(1);
    const rich = {
      ...S.createInitialState(DAY),
      answered: 12,
      correct: 6,
      streak: 4,
      xp: 150,
      xpToday: 60,
      cards,
      friendStreak: true,
      goalIndex: 2
    };
    expect(S.earnedBadges(rich).sort()).toEqual(BADGES.map((b) => b.id).sort());
    expect(S.earnedBadges(S.createInitialState(DAY))).toEqual([]);
  });

  it('chu kỳ mục tiêu và các công tắc', () => {
    expect(S.nextGoalIndex(0)).toBe(1);
    expect(S.nextGoalIndex(GOALS.length - 1)).toBe(0);
    const base = S.createInitialState(DAY);
    expect(S.cycleGoal(base).goalIndex).toBe(0);
    expect(S.refillHearts({ ...base, hearts: 1 }).hearts).toBe(MAX_HEARTS);
    expect(S.toggleFriend(base).friendStreak).toBe(true);
    expect(S.toggleTheme(base).theme).toBe('dark');
    expect(S.toggleTheme({ ...base, theme: 'dark' }).theme).toBe('auto');
    expect(S.setView(base, 'tai-lieu').view).toBe('tai-lieu');
    expect(S.openReset(base).resetOpen).toBe(true);
    expect(S.closeReset(S.openReset(base)).resetOpen).toBe(false);
    expect(S.startReview(base, DAY).inLesson).toBe(true);
    expect(S.resetProgress(DAY).xp).toBe(0);
  });
});
