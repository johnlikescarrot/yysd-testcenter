import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SKILLS, BAND_LABELS, roundBand, estimateBand, overallBand, bandLabel, estimateProfile, gapToTarget,
} from '../js/core/scoring.js';

test('roundBand làm tròn theo quy tắc IELTS', () => {
  assert.equal(roundBand(6.1), 6);
  assert.equal(roundBand(6.25), 6.5);
  assert.equal(roundBand(6.75), 7);
  assert.equal(roundBand(6.5), 6.5);
  assert.equal(roundBand(-3), 0);
  assert.equal(roundBand(12), 9);
  assert.equal(roundBand('x'), 0);
});

test('estimateBand dùng bảng quy đổi Reading và Listening', () => {
  assert.equal(estimateBand('reading', 39, 40), 9);
  assert.equal(estimateBand('reading', 30, 40), 7);
  assert.equal(estimateBand('reading', 23, 40), 6);
  assert.equal(estimateBand('reading', 15, 40), 5);
  assert.equal(estimateBand('reading', 0, 40), 1);
  assert.equal(estimateBand('reading', 5, 0), 0);
  assert.equal(estimateBand('listening', 35, 40), 8);
  assert.equal(estimateBand('listening', 26, 40), 6.5);
  assert.equal(estimateBand('listening', 4, 40), 2.5);
});

test('estimateBand co giãn theo tổng số câu', () => {
  assert.equal(estimateBand('reading', 10, 13), 7);
  assert.equal(estimateBand('listening', 3, 5), 6);
});

test('estimateBand cho từ vựng và ngữ pháp dựa trên độ chính xác', () => {
  assert.equal(estimateBand('vocab', 95, 100), 8.5);
  assert.equal(estimateBand('vocab', 72, 100), 7);
  assert.equal(estimateBand('grammar', 48, 100), 5.5);
  assert.equal(estimateBand('grammar', 0, 10), 3);
  assert.equal(estimateBand('grammar', 0, 0), 3);
  assert.equal(estimateBand('writing', 10, 10), 8.5);
});

test('overallBand lấy trung bình và làm tròn', () => {
  assert.equal(overallBand([6.5, 6.5, 6, 6.5]), 6.5);
  assert.equal(overallBand([7, 6.5]), 7);
  assert.equal(overallBand([]), 0);
  assert.equal(overallBand(null), 0);
  assert.equal(overallBand(['x', 7]), 7);
});

test('bandLabel trả về mô tả tiếng Việt', () => {
  assert.equal(bandLabel(9).label, BAND_LABELS[0].label);
  assert.equal(bandLabel(7.5).label, 'Rất tốt (C1)');
  assert.equal(bandLabel(4.5).label, 'Sơ trung cấp (B1)');
  assert.equal(bandLabel(0).label, 'Khởi đầu (A1)');
  assert.equal(bandLabel('x').label, 'Khởi đầu (A1)');
});

test('estimateProfile tổng hợp kỹ năng đã luyện', () => {
  const profile = estimateProfile({
    reading: { correct: 30, total: 40 },
    listening: { correct: 26, total: 40 },
    vocab: { correct: 0, total: 0 },
  });
  assert.equal(profile.rows.length, SKILLS.length);
  assert.equal(profile.rows.find((row) => row.skill.id === 'reading').band, 7);
  assert.equal(profile.rows.find((row) => row.skill.id === 'vocab').band, null);
  assert.equal(profile.count, 2);
  assert.equal(profile.overall, 7);
  assert.equal(estimateProfile(null).overall, 0);
});

test('gapToTarget tính khoảng cách tới mục tiêu', () => {
  const reached = gapToTarget(7.5, 7);
  assert.equal(reached.reached, true);
  assert.equal(reached.gap, 0);
  const gap = gapToTarget(6, 7);
  assert.equal(gap.reached, false);
  assert.equal(gap.gap, 1);
  assert.match(gap.message, /Còn 1\.0 band/);
});
