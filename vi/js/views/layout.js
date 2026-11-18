/** Thành phần dùng chung: thanh thống kê, hộp mục tiêu, thẻ trích dẫn. */

import { escapeHtml as esc } from '../core/text.js';
import { levelInfo, heartsLabel } from '../core/gamify.js';
import { formatInt, formatPercent } from '../core/text.js';
import { goalProgress, todayXp } from '../core/state.js';
import { icon } from './icons.js';

/** Thanh thống kê (chuỗi, XP, đá quý, tim) trên cùng. */
export function statsHtml(state, now) {
  return `
    <span class="stat stat--streak" title="${esc(state.streak)} ngày liên tiếp">
      ${icon('flame')}<span>${formatInt(state.streak)}</span><span class="stat-meta">ngày</span>
    </span>
    <span class="stat stat--xp" title="Tổng điểm kinh nghiệm">
      ${icon('bolt')}<span>${formatInt(state.xp)}</span><span class="stat-meta">XP</span>
    </span>
    <span class="stat stat--gem" title="Đá quý">
      ${icon('gem')}<span>${formatInt(state.gems)}</span>
    </span>
    <span class="stat stat--heart" title="${esc(heartsLabel(state, now))}">
      ${icon('heart')}<span>${formatInt(state.hearts)}</span>
      <span class="stat-meta">/${formatInt(5)}</span>
    </span>`;
}

/** Vòng tròn tiến độ mục tiêu ngày. */
export function goalRing(state, now) {
  const progress = goalProgress(state, now);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress.ratio);
  return `
    <div class="ring">
      <svg viewBox="0 0 140 140" role="img" aria-label="Mục tiêu hôm nay: ${progress.xp} trên ${progress.goal} XP">
        <circle class="ring-track" cx="70" cy="70" r="${radius}"></circle>
        <circle class="ring-fill" cx="70" cy="70" r="${radius}"
          stroke-dasharray="${circumference.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}"></circle>
      </svg>
      <span class="ring-text">
        <span class="ring-value">${formatInt(progress.xp)}</span>
        <span class="ring-label">/ ${formatInt(progress.goal)} XP</span>
      </span>
    </div>`;
}

/** Chọn mục tiêu ngày. */
export function goalPicker(state) {
  const options = [20, 40, 60, 100];
  return `<div class="filters" role="group" aria-label="Chọn mục tiêu XP mỗi ngày">
    ${options
      .map(
        (goal) => `<button class="filter" type="button" data-action="set-goal" data-value="${goal}"
          aria-pressed="${state.goal === goal}">${goal} XP</button>`,
      )
      .join('')}
  </div>`;
}

/** Thanh tiến độ nhỏ kèm nhãn. */
export function bar(ratio, label, extraClass = '') {
  const percent = Math.max(0, Math.min(100, ratio * 100));
  return `<div class="bar-row">
    <span>${esc(label)}</span>
    <span class="bar-track ${extraClass}" role="presentation"><span style="width:${percent.toFixed(1)}%"></span></span>
    <span class="tiny faint">${formatPercent(ratio)}</span>
  </div>`;
}

/** Thẻ hồ sơ cấp độ. */
export function levelCard(state) {
  const level = levelInfo(state.xp);
  return `<div class="row row--between">
    <div>
      <p class="eyebrow">Cấp ${level.level} · ${esc(level.title)}</p>
      <p class="small muted" style="margin:0">
        ${level.next ? `Còn ${formatInt(level.remaining)} XP để lên cấp ${level.next.level}` : 'Bạn đã đạt cấp cao nhất'}
      </p>
    </div>
    <span class="pill">${icon('star')}${formatPercent(level.ratio)}</span>
  </div>`;
}

/** Hộp thông tin phương pháp kèm trích dẫn. */
export function methodNote({ title, text, cite }) {
  return `<aside class="callout">
    <h3>${esc(title)}</h3>
    <p>${text}</p>
    ${cite ? `<p class="tiny faint">Nguồn: ${cite}</p>` : ''}
  </aside>`;
}

/** Trạng thái rỗng. */
export function emptyState({ title, text, action }) {
  return `<div class="card center">
    <p class="eyebrow">${icon('spark')}Bắt đầu</p>
    <h2>${esc(title)}</h2>
    <p class="muted">${esc(text)}</p>
    ${action ? `<p><a class="btn btn--primary" href="${esc(action.href)}">${esc(action.label)}</a></p>` : ''}
  </div>`;
}

/** Khối "từ của ngày". */
export function wordCard(word, deck) {
  if (!word) return '';
  const status = deck?.[word.id];
  return `<article class="card">
    <p class="eyebrow">${icon('cards')}Từ của ngày</p>
    <h3 style="font-family:var(--font-display);font-size:1.6rem;margin-bottom:.1rem">${esc(word.term)}</h3>
    <p class="small faint" style="margin:0 0 .4rem">/${esc(word.ipa)}/ · ${esc(word.pos)}</p>
    <p style="margin:0 0 .5rem"><strong>${esc(word.vi)}</strong></p>
    <p class="small muted" style="margin:0 0 .6rem">${esc(word.example)}<br><em>${esc(word.exampleVi)}</em></p>
    ${status ? '' : `<p class="tiny faint" style="margin:0">Thẻ mới — sẽ xuất hiện trong phiên ôn tập đầu tiên.</p>`}
     <p style="margin:.7rem 0 0"><a href="./luyen-tap.html">Ôn từ vựng ngay ${icon('chevron')}</a></p>
  </article>`;
}

/** Đồng hồ đếm ngược (dùng cho Speaking). */
export function timerHtml(timer) {
  if (!timer) return '';
  const label = timer.kind === 'prep' ? 'Chuẩn bị' : 'Nói';
  return `<div class="row row--between card card--flat" style="padding:.7rem .9rem">
    <span class="small muted">${esc(label)} · ${esc(timer.topic || '')}</span>
    <span class="timer" role="timer" aria-live="off">${esc(timer.label || '00:00')}</span>
    <button class="btn btn--ghost btn--sm" type="button" data-action="stop-timer">Dừng</button>
  </div>`;
}

/** Chân trang dùng chung (render tĩnh trong HTML, giữ ở đây cho tài liệu). */
export function footerNote(year) {
  return `© ${year} YYSD · IELTS Việt — học liệu tham khảo, không thay thế kỳ thi chính thức.`;
}

export { esc, icon, todayXp };
