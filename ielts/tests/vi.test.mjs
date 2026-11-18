import test from 'node:test';
import assert from 'node:assert/strict';
import { STRINGS, t, hasCjk, assertVietnamese } from '../assets/js/vi.mjs';

test('bảng chuỗi là bất biến và chỉ chứa tiếng Việt', () => {
  assert.ok(Object.isFrozen(STRINGS));
  assert.equal(STRINGS.brand, 'YYSD IELTS');
  assert.equal(hasCjk(Object.values(STRINGS).join(' ')), false);
});

test('t() điền biến, giữ placeholder và trả khoá khi thiếu', () => {
  assert.equal(t('quizProgress', { current: 2, total: 3 }), 'Câu 2 / 3');
  assert.equal(t('quizProgress', { current: 2 }), 'Câu 2 / {total}');
  assert.equal(t('quizProgress'), 'Câu {current} / {total}');
  assert.equal(t('completedLead', { xp: 12 }), 'Bạn nhận 12 XP. Chuỗi ngày và huy hiệu đã được cập nhật.');
  assert.equal(t('khong-ton-tai'), 'khong-ton-tai');
  assert.equal(t('brand', { unused: 1 }), 'YYSD IELTS');
});

test('hasCjk và assertVietnamese bảo vệ bản địa hoá', () => {
  const han = '\u4e2d\u6587';
  assert.equal(hasCjk(han), true);
  assert.equal(hasCjk('Tiếng Việt 2026'), false);
  assert.equal(hasCjk(42), false);
  assert.equal(assertVietnamese('Xin chào'), 'Xin chào');
  assert.throws(() => assertVietnamese(han), /chưa được Việt hoá/);
});
