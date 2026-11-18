/** Lộ trình học: các đơn vị, bài học, trạng thái mở khoá. */

import { escapeHtml as esc, formatInt } from '../core/text.js';
import {
  unitStatus,
  unitProgress,
  isLessonUnlocked,
  courseProgress,
  nextLesson,
} from '../core/content.js';
import { icon } from './icons.js';

function lessonNode(state, curriculum, unit, lesson) {
  const done = Boolean(state.lessonsDone[lesson.id]);
  const unlocked = isLessonUnlocked(state, curriculum, unit, lesson);
  const status = done ? 'done' : unlocked ? 'current' : 'locked';
  const meta = done
    ? `Đã xong · ${Math.round((state.lessonsDone[lesson.id].accuracy || 0) * 100)}% chính xác`
    : unlocked
      ? 'Sẵn sàng học'
      : 'Hoàn thành bài trước để mở';

  const inner = `
    <span class="node-dot">${icon(done ? 'check' : unlocked ? 'play' : 'lock')}</span>
    <span>
      <p class="node-title">${esc(lesson.title)}</p>
      <p class="node-meta">${esc(meta)}</p>
    </span>
    <span class="node-xp">+${formatInt(lesson.xp)} XP</span>`;

  if (unlocked) {
    return `<a class="node node--${status}" href="./bai-hoc.html?bai=${encodeURIComponent(lesson.id)}"
      aria-label="${esc(lesson.title)} — ${esc(meta)}">${inner}</a>`;
  }
  return `<div class="node node--locked" aria-disabled="true">${inner}</div>`;
}

export function renderLearn({ state, data }) {
  const curriculum = data.curriculum;
  const course = courseProgress(state, curriculum);
  const next = nextLesson(state, curriculum);

  return `
  <section class="card" aria-labelledby="path-title">
    <div class="row row--between">
      <div>
        <p class="eyebrow">${icon('flag')}Lộ trình 8 chương</p>
        <h1 id="path-title" style="margin-bottom:.2rem">Từ nền tảng tới band mục tiêu</h1>
        <p class="muted" style="margin:0;max-width:60ch">
          Mỗi chương mở khoá khi bạn hoàn thành 60% chương trước. Bài học ngắn 5–8 phút,
          trộn bốn kỹ năng và ngữ pháp nền.
        </p>
      </div>
      <div style="min-width:min(240px,100%)">
        <p class="small muted" style="margin:0 0 .3rem">${course.done}/${course.total} bài đã xong</p>
        <div class="unit-progress" style="width:100%" role="presentation"><span style="width:${(course.ratio * 100).toFixed(0)}%"></span></div>
        ${next ? `<p style="margin:.7rem 0 0"><a class="btn btn--primary btn--sm" href="./bai-hoc.html?bai=${encodeURIComponent(next.lesson.id)}">Học bài kế tiếp ${icon('chevron')}</a></p>` : ''}
      </div>
    </div>
  </section>

  <div class="stack" style="margin-top:1rem">
    ${curriculum.units
      .map((unit) => {
        const status = unitStatus(state, curriculum, unit);
        const progress = unitProgress(state, unit);
        return `<section class="card unit" aria-labelledby="unit-${esc(unit.id)}">
          <div class="unit-head">
            <span class="unit-badge ${status === 'locked' ? 'unit-badge--locked' : ''}">${unit.order}</span>
            <div class="grow">
              <p class="eyebrow" style="margin:0 0 .2rem">${esc(unit.skillLabel)} · ${esc(unit.level)}</p>
              <h2 id="unit-${esc(unit.id)}" style="margin:0">${esc(unit.title)}</h2>
              <p class="small muted" style="margin:.2rem 0 0">${esc(unit.blurb)}</p>
            </div>
            <div class="row row--tight">
              <span class="pill ${status === 'done' ? 'pill--ok' : status === 'locked' ? 'pill--muted' : ''}">
                ${icon(status === 'locked' ? 'lock' : status === 'done' ? 'check' : 'play')}
                ${status === 'done' ? 'Hoàn thành' : status === 'locked' ? 'Chưa mở' : `${progress.done}/${progress.total} bài`}
              </span>
            </div>
          </div>
          <div class="path">
            ${unit.lessons.map((lesson) => lessonNode(state, curriculum, unit, lesson)).join('')}
          </div>
        </section>`;
      })
      .join('')}
  </div>

  <aside class="callout" style="margin-top:1rem">
    <h3>Nguyên tắc mở khoá</h3>
    <p>Mỗi bài cần bài trước hoàn thành. Nếu thấy quá tải, hãy quay lại Luyện tập để ôn thẻ từ vựng —
      não cần thời gian củng cố giữa các buổi học.</p>
  </aside>`;
}
