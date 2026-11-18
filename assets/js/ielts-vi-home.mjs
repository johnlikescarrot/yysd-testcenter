import { allQuestions, lessons } from './ielts-vi-data.mjs';
import { clearProgress, dueQuestions, loadProgress, localDay, recentDays, streakFor } from './ielts-vi-core.mjs';

let storage;
try { storage = window.localStorage; } catch { storage = null; }
const loaded = loadProgress(storage);
let progress = loaded.progress;
const byId = (id) => document.getElementById(id);

function render() {
  const today = localDay();
  byId('streak-count').textContent = streakFor(progress.days, today);
  byId('xp-count').textContent = progress.xp.toLocaleString('vi-VN');
  byId('completed-count').textContent = Object.values(progress.lessons).reduce((total, count) => total + count, 0);
  document.querySelectorAll('[data-lesson-id]').forEach((row) => {
    const count = progress.lessons[row.dataset.lessonId] || 0;
    row.querySelector('[data-lesson-status]').textContent = count ? `Đã học ${count} lần` : 'Chưa bắt đầu';
  });
  const next = lessons.find((lesson) => !progress.lessons[lesson.id]);
  const continueLink = byId('continue-link');
  if (next) {
    continueLink.href = `study.html?lesson=${encodeURIComponent(next.id)}`;
    continueLink.firstChild.textContent = progress.days.length ? 'Tiếp tục học ' : 'Bắt đầu bài học ';
  } else if (dueQuestions(progress, allQuestions, today).length) {
    continueLink.href = 'study.html?lesson=review';
    continueLink.firstChild.textContent = 'Ôn tập bài học ';
  } else {
    continueLink.href = 'study.html?lesson=vocabulary';
    continueLink.firstChild.textContent = 'Luyện lại bài học ';
  }
  const week = recentDays(progress.days, today);
  const weekList = byId('week-days');
  weekList.replaceChildren();
  const dayFormatter = new Intl.DateTimeFormat('vi-VN', { weekday: 'short', timeZone: 'UTC' });
  for (const item of week) {
    const date = new Date(`${item.day}T12:00:00Z`);
    const day = document.createElement('li');
    const mark = document.createElement('span');
    const label = document.createElement('span');
    mark.className = item.active ? 'week-mark is-active' : 'week-mark';
    mark.textContent = item.active ? '✓' : '·';
    mark.setAttribute('aria-hidden', 'true');
    label.textContent = dayFormatter.format(date).replace('.', '');
    day.setAttribute('aria-label', `${item.day}: ${item.active ? 'đã học' : 'chưa học'}`);
    day.append(mark, label);
    weekList.append(day);
  }
  byId('weekly-count').textContent = `${week.filter((item) => item.active).length} / 7 ngày`;
  const due = dueQuestions(progress, allQuestions, today).length;
  byId('review-description').textContent = due
    ? `Bạn có ${due} câu đến hạn ôn tập. Cùng xem lại nhé!`
    : progress.days.length
      ? 'Chưa có câu nào đến hạn. Hãy quay lại sau hoặc tiếp tục bài học mới.'
      : 'Hoàn thành bài học để tạo lịch ôn tập cho riêng bạn.';
  if (!loaded.available) byId('storage-message').textContent = 'Trình duyệt không cho phép lưu tiến độ; bài học vẫn có thể sử dụng.';
}

byId('reset-progress').addEventListener('click', () => {
  if (clearProgress(storage)) {
    progress = loadProgress(storage).progress;
    byId('storage-message').textContent = 'Đã xóa tiến độ trên thiết bị này.';
    document.querySelector('.reset-details').open = false;
    render();
  } else {
    byId('storage-message').textContent = 'Không thể xóa tiến độ. Hãy kiểm tra cài đặt lưu trữ của trình duyệt.';
  }
});
render();
