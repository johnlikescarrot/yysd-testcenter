import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DAY_MS, dayKey, parseDayKey, dayDiff, addDays, weekKey, startOfWeek,
  formatClock, humanDay, heatmapData, weekdayVi,
} from '../js/core/date.js';

const NOW = new Date('2026-11-18T09:00:00').getTime();

test('dayKey định dạng YYYY-MM-DD theo giờ địa phương', () => {
  assert.equal(dayKey(new Date(2026, 0, 5, 23, 59).getTime()), '2026-01-05');
  assert.equal(dayKey(new Date(2026, 10, 18).getTime()), '2026-11-18');
});

test('parseDayKey trả về nửa đêm giờ địa phương và chịu được khoá thiếu phần', () => {
  const parsed = new Date(parseDayKey('2026-03-09'));
  assert.equal(parsed.getFullYear(), 2026);
  assert.equal(parsed.getMonth(), 2);
  assert.equal(parsed.getDate(), 9);
  const partial = new Date(parseDayKey('2026-03'));
  assert.equal(partial.getMonth(), 2);
  assert.equal(partial.getDate(), 1);
});

test('dayDiff, addDays và mốc tuần', () => {
  assert.equal(dayDiff('2026-11-18', '2026-11-21'), 3);
  assert.equal(dayDiff('2026-11-21', '2026-11-18'), -3);
  assert.equal(addDays('2026-11-18', 5), '2026-11-23');
  assert.equal(addDays('2026-11-01', -2), '2026-10-30');
  assert.ok(DAY_MS > 0);
});

test('weekKey theo chuẩn ISO và ổn định trong cùng tuần', () => {
  const monday = weekKey(new Date(2026, 10, 16, 12).getTime());
  const sunday = weekKey(new Date(2026, 10, 22, 12).getTime());
  assert.equal(monday, sunday);
  assert.match(monday, /^\d{4}-W\d{2}$/);
  assert.equal(weekKey(new Date(2025, 11, 31, 12).getTime()), weekKey(new Date(2026, 0, 1, 12).getTime()));
});

test('startOfWeek trả về thứ Hai', () => {
  const monday = new Date(startOfWeek(NOW));
  assert.equal(monday.getDay(), 1);
  assert.equal(monday.getHours(), 0);
});

test('formatClock hiển thị MM:SS và H:MM:SS', () => {
  assert.equal(formatClock(0), '00:00');
  assert.equal(formatClock(-5000), '00:00');
  assert.equal(formatClock(65_000), '01:05');
  assert.equal(formatClock(3_723_000), '1:02:03');
  assert.equal(formatClock(900), '00:01');
});

test('humanDay có nhãn tiếng Việt cho mọi khoảng', () => {
  assert.equal(humanDay(null, '2026-11-18'), 'Chưa học');
  assert.equal(humanDay('2026-11-18', '2026-11-18'), 'Hôm nay');
  assert.equal(humanDay('2026-11-17', '2026-11-18'), 'Hôm qua');
  assert.equal(humanDay('2026-11-19', '2026-11-18'), 'Ngày mai');
  assert.equal(humanDay('2026-11-15', '2026-11-18'), '3 ngày trước');
  assert.equal(humanDay('2026-11-21', '2026-11-18'), 'Sau 3 ngày');
  assert.equal(humanDay('2026-09-01', '2026-11-18'), '01/09/2026');
});

test('heatmapData tính mức 0–4 và bỏ qua dữ liệu sai', () => {
  const history = [
    { day: '2026-11-18', xp: 70 },
    { day: '2026-11-17', xp: 45 },
    { day: '2026-11-16', xp: 25 },
    { day: '2026-11-15', xp: 10 },
    { day: '2026-11-14', xp: 0 },
  ];
  const cells = heatmapData(history, NOW, 7);
  assert.equal(cells.length, 7);
  assert.equal(cells.at(-1).level, 4);
  assert.equal(cells.at(-2).level, 3);
  assert.equal(cells.at(-3).level, 2);
  assert.equal(cells.at(-4).level, 1);
  assert.equal(cells.at(-5).level, 0);
  assert.deepEqual(heatmapData(null, NOW, 3).map((cell) => cell.level), [0, 0, 0]);
  assert.equal(heatmapData([], NOW, 28).length, 28);
});

test('weekdayVi trả về tên thứ trong tuần', () => {
  assert.equal(weekdayVi(new Date(2026, 10, 18, 12).getTime()), 'Thứ Tư');
  assert.equal(weekdayVi(new Date(2026, 10, 22, 12).getTime()), 'Chủ nhật');
});
