import { lessons } from '../catalog.mjs';
import { dailyPoints, dueItems, goals, milestones, nextLesson, nextReviewDay, skillProgress, streak, totalPoints, week } from '../study.mjs';
import { dayLabel, emptyState, escape, icon, lessonLink, reviewLink } from './html.mjs';

function meter(label, value, max) {
  return `<progress aria-label="${label}" value="${value}" max="${max}">${value}/${max}</progress>`;
}

function weeklyStrip(state, today) {
  return `<ul class="week" aria-label="Bảy ngày gần nhất">${week(state, today).map(({ day, active }) => {
    const short = dayLabel(day, { weekday: 'short' });
    const date = dayLabel(day, { weekday: 'long', day: 'numeric', month: 'long' });
    const label = `${date}: ${active ? 'đã học' : 'chưa học'}`;
    return `<li${day === today ? ' aria-current="date"' : ''}><span class="week-dot${active ? ' is-active' : ''}" aria-hidden="true">${active ? icon('check') : '·'}</span><span aria-hidden="true">${short}</span><span class="visually-hidden">${label}</span></li>`;
  }).join('')}</ul>`;
}

function todayPanel(state, today) {
  const xp = dailyPoints(state, today);
  const reached = xp >= state.goal;
  return `<div class="metric-line"><strong>${xp}</strong><span>/ ${state.goal} XP</span></div>
    ${meter('Mục tiêu hôm nay', Math.min(xp, state.goal), state.goal)}
    <p class="mini-note">${reached ? 'Bạn đã đạt mục tiêu hôm nay!' : `Còn ${state.goal - xp} XP để đạt mục tiêu.`}</p>`;
}

export function home({ doc, state, today }) {
  const next = nextLesson(state);
  const complete = state.done.length === lessons.length;
  const link = doc.querySelector('[data-next]');
  link.href = lessonLink(next.id);
  link.firstElementChild.textContent = complete ? 'Luyện lại lộ trình' : state.done.length ? 'Tiếp tục luyện' : 'Bắt đầu luyện';
  doc.querySelector('[data-completed]').textContent = `${state.done.length} / ${lessons.length} bài đã học`;
  doc.querySelector('[data-goal-today]').innerHTML = todayPanel(state, today);
  doc.querySelector('[data-streak]').textContent = streak(state, today);
  doc.querySelector('[data-week]').innerHTML = weeklyStrip(state, today);
  const due = dueItems(state, today).length;
  doc.querySelector('[data-review-note]').textContent = due ? `${due} câu đến hạn ôn tập` : 'Lịch ôn tập của bạn';
  for (const row of doc.querySelectorAll('[data-lesson]')) {
    const id = row.dataset.lesson;
    const done = state.done.includes(id);
    const upcoming = !complete && next.id === id;
    row.classList.toggle('is-next', upcoming);
    row.querySelector('[data-lesson-status]').innerHTML = done
      ? `<span class="pill pill--done">${icon('check')} Đã học</span>`
      : upcoming ? '<span class="pill pill--next">Tiếp theo</span>' : '';
  }
}

export function review({ doc, state, today }) {
  const target = doc.querySelector('[data-view-content]');
  const due = dueItems(state, today);
  if (due.length) {
    target.innerHTML = `<section class="panel stack" aria-labelledby="review-ready">
      <p class="eyebrow">ĐẾN HẠN HÔM NAY</p><h2 id="review-ready">${due.length} câu cần ôn</h2>
      <p>Thử trả lời từ trí nhớ trước khi xem lại giải thích. Câu chưa đúng sẽ được đưa vào lượt ôn tiếp theo.</p>
      <a class="button" href="${reviewLink}">Bắt đầu ôn tập ${icon('arrow')}</a>
      <ul class="review-list">${due.map(({ item, lesson }) => `<li>${icon(lesson.skill)} <span lang="en">${escape(item.prompt)}</span></li>`).join('')}</ul></section>`;
    return;
  }
  const next = nextReviewDay(state, today);
  target.innerHTML = emptyState('review', next ? 'Bạn đã ôn xong hôm nay' : 'Chưa có câu đến hạn', next
    ? `Lượt ôn tiếp theo sớm nhất vào ${dayLabel(next, { day: 'numeric', month: 'long' })}. Bạn vẫn có thể luyện một bài mới.`
    : 'Sau bài đầu tiên, câu trả lời sẽ được xếp vào lịch ôn của riêng bạn.', './#lo-trinh', 'Xem lộ trình');
}

export function progress(runtime) {
  const { doc, state, today } = runtime;
  doc.querySelector('[data-progress-summary]').innerHTML = `
    <div><dt>Điểm luyện tập</dt><dd>${totalPoints(state)} <small>XP</small></dd></div>
    <div><dt>Chuỗi ngày học</dt><dd>${streak(state, today)} <small>ngày</small></dd></div>
    <div><dt>Bài đã học</dt><dd>${state.done.length} <small>/ ${lessons.length}</small></dd></div>`;
  doc.querySelector('[data-week]').innerHTML = weeklyStrip(state, today);
  doc.querySelector('[data-skills]').innerHTML = skillProgress(state).map((skill) => `<li><div class="skill-progress-label">
    <span class="tile tile--${skill.id}">${icon(skill.id)}</span><strong>${skill.label}</strong><span>${skill.done} / ${skill.total}</span></div>
    ${meter(`Số bài đã học: ${skill.label}`, skill.done, skill.total)}</li>`).join('');
  doc.querySelector('[data-milestones]').innerHTML = milestones(state, today).map(({ name, hint, icon: symbol, earned }) => `
    <li><span class="tile ${earned ? 'tile--award' : ''}">${icon(symbol)}</span><div><strong>${name}</strong><p>${hint}</p></div>
      <span class="pill ${earned ? 'pill--done' : ''}">${earned ? 'Đã đạt' : 'Chưa đạt'}</span></li>`).join('');
  const select = doc.querySelector('#daily-goal');
  const current = doc.querySelector('[data-goal-today]');
  current.innerHTML = todayPanel(state, today);
  select.value = state.goal;
  select.addEventListener('change', () => {
    const goal = Number(select.value);
    if (!goals.includes(goal)) return;
    runtime.save({ ...runtime.latest(), goal });
    current.innerHTML = todayPanel(runtime.state, runtime.now());
    doc.querySelector('[data-goal-message]').textContent = `Đã chọn mục tiêu ${goal} XP mỗi ngày.`;
  });
}
