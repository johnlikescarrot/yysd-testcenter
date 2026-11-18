import { lessons } from './course.js';
import { localDay, readProgress, storageKey, summary } from './progress.js';

// The older student dashboard reads the same local record; never send it to a
// teacher, associate it with a phone number, or treat XP as an exam result.
export function mountPortalSummary(panel, window, now) {
  const note = panel.querySelector('[data-study-note]');
  const link = panel.querySelector('[data-study-link]');
  function render() {
    const state = readProgress(() => window.localStorage);
    const { completed, days, due, nextLesson } = summary(state, localDay(now()));
    note.textContent = `${completed}/${lessons.length} bài đã học · ${state.xp} XP · Chuỗi ${days} ngày.`;
    const id = due ? 'review' : nextLesson?.id;
    link.href = id ? `ielts-vi/?lesson=${encodeURIComponent(id)}` : 'ielts-vi/#lo-trinh';
    link.textContent = due ? `Ôn ${due} câu đến hạn` : nextLesson ? `Học: ${nextLesson.title}` : 'Xem lại lộ trình';
  }
  render();
  window.addEventListener('pageshow', render);
  window.addEventListener('storage', ({ key }) => {
    if (key === storageKey || key === null) render();
  });
}
