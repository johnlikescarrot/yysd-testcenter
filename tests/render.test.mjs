import { describe, it, expect } from 'vitest';
import * as R from '../docs/js/render.js';
import * as S from '../docs/js/state.js';
import { UNITS, BADGES, PDFS, QUESTIONS } from '../docs/js/data.js';

const DAY = '2026-11-18';

describe('kết xuất giao diện', () => {
  it('thoát ký tự đặc biệt', () => {
    expect(R.escapeHtml('<b title="x">& \'</b>')).toBe('&lt;b title=&quot;x&quot;&gt;&amp; &#39;&lt;/b&gt;');
  });

  it('kết xuất lời mở đầu và câu hỏi', () => {
    expect(R.renderIntro()).toContain('Bắt đầu');
    const html = R.renderQuestion(QUESTIONS[0], 0);
    expect(html).toContain('Câu 1');
    expect(html).toContain('data-action="answer"');
    expect(html).toContain('review');
  });

  it('phản hồi rỗng và có nội dung', () => {
    expect(R.renderFeedback(S.createInitialState(DAY))).toBe('');
    const state = { ...S.createInitialState(DAY), feedback: 'Chính xác!', feedbackKind: 'good' };
    expect(R.renderFeedback(state)).toContain('data-kind="good"');
  });

  it('kết xuất đơn vị, huy hiệu và tài liệu', () => {
    expect(R.renderUnits(UNITS)).toContain('Đơn vị 8');
    expect((R.renderUnits(UNITS).match(/<article/g) || []).length).toBe(UNITS.length);
    expect((R.renderBadges(S.createInitialState(DAY)).match(/<li/g) || []).length).toBe(BADGES.length);
    expect(R.renderPdfs(PDFS)).toContain('10-tai-lieu-tham-khao.pdf');
    expect(R.renderPdfs(PDFS)).toContain('rel="noopener noreferrer"');
  });

  it('bảng giải đấu có dòng của người học', () => {
    const html = R.renderLeague({ xpWeek: 130, streak: 5 });
    expect(html).toContain('row--me');
    expect(html).toContain('Bạn');
    expect((html.match(/<tr/g) || []).length).toBe(9);
  });

  it('trạng thái bài học và ngày học cuối', () => {
    const base = S.createInitialState(DAY);
    expect(R.renderLessonStatus(base)).toBe('Sẵn sàng');
    expect(R.renderLessonStatus(S.startLesson(base))).toBe('Đang học');
    expect(R.renderLastDay(base)).toBe('Chưa có');
    expect(R.renderLastDay({ ...base, lastDay: DAY })).toBe(DAY);
  });
});
