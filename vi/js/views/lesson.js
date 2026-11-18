/** Trình học bài: 4 dạng câu hỏi, phản hồi tức thì, tổng kết cuối bài. */

import { escapeHtml as esc, formatInt, formatPercent } from '../core/text.js';
import { icon } from './icons.js';
import { methodNote } from './layout.js';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

function stemHtml(exercise) {
  const text = String(exercise.stem || '');
  if (!text.includes('___')) return `<p class="stem">${esc(text)}</p>`;
  return `<p class="stem">${esc(text).replace('___', '<span class="blank" aria-hidden="true">…</span>')}</p>`;
}

function optionRows(exercise, ui) {
  const feedback = ui.feedback;
  return exercise.options
    .map((option, index) => {
      const chosen = Array.isArray(ui.selected) && ui.selected.includes(index);
      let modifier = '';
      if (feedback) {
        if (index === exercise.answer) modifier = ' option--right';
        else if (chosen) modifier = ' option--wrong';
      }
      return `<button class="option${modifier}" type="button" data-action="choose-option" data-value="${index}"
        aria-pressed="${chosen}" ${feedback ? 'disabled' : ''}>
        <span class="option-key" aria-hidden="true">${LETTERS[index]}</span>
        <span>${esc(option)}</span>
      </button>`;
    })
    .join('');
}

function buildArea(ui) {
  const tokens = ui.tokens || [];
  const selected = Array.isArray(ui.selected) ? ui.selected : [];
  const chosen = selected
    .map((id) => tokens.find((token) => token.id === id))
    .filter(Boolean);
  return `
    <div class="answer-box" data-placeholder="${chosen.length ? '' : 'Chạm vào từ bên dưới để xếp câu'}" aria-live="polite">
      ${chosen
        .map(
          (token) => `<button class="chip" type="button" data-action="undo-token" data-value="${esc(token.id)}"
            aria-label="Bỏ từ ${esc(token.text)}">${esc(token.text)}</button>`,
        )
        .join('')}
    </div>
    <div class="bank" role="group" aria-label="Ngân hàng từ">
      ${tokens
        .map(
          (token) => `<button class="chip ${selected.includes(token.id) ? 'chip--used' : ''}" type="button"
            data-action="select-token" data-value="${esc(token.id)}" ${selected.includes(token.id) ? 'tabindex="-1"' : ''}>${esc(token.text)}</button>`,
        )
        .join('')}
    </div>`;
}

function textArea(exercise, ui) {
  return `<div class="answer-line">
    <label class="sr-only" for="answer-input">Câu trả lời</label>
    <input class="text-field" id="answer-input" name="answer" type="text" autocomplete="off"
      autocapitalize="off" spellcheck="false" placeholder="${esc(exercise.placeholder || 'Nhập câu trả lời')}"
      value="${esc(ui.draft || '')}" ${ui.feedback ? 'disabled' : ''}>
    <button class="btn btn--primary" type="submit" ${ui.feedback ? 'disabled' : ''}>Kiểm tra</button>
  </div>`;
}

function listenArea(exercise, ui) {
  return `
    <div class="row" style="margin-bottom:.8rem">
      <button class="btn btn--ghost" type="button" data-action="play-audio">${icon('volume')}Nghe câu</button>
      <button class="btn btn--quiet" type="button" data-action="play-audio" data-value="slow">Nghe chậm</button>
      <span class="tiny faint">Có thể nghe lại không giới hạn</span>
    </div>
    ${textArea(exercise, ui)}`;
}

function feedbackHtml(exercise, ui) {
  if (!ui.feedback) return '';
  const ok = ui.feedback.correct;
  return `<section class="feedback ${ok ? 'feedback--ok' : 'feedback--bad'}" aria-live="polite">
    <h3>${icon(ok ? 'check' : 'x')}${ok ? 'Chính xác!' : 'Chưa đúng'}</h3>
    <p>${ok ? esc(ui.feedback.expected) : `Đáp án đúng: <strong>${esc(ui.feedback.expected)}</strong>`}</p>
    <p>${esc(exercise.explain)}</p>
    ${exercise.tip ? `<p class="tiny faint">${esc(exercise.tip)}</p>` : ''}
    <div class="lesson-actions" style="margin-top:.7rem">
      <button class="btn btn--primary" type="button" data-action="next">Tiếp tục ${icon('chevron')}</button>
    </div>
  </section>`;
}

function player({ state, data, ui }) {
  const { unit, lesson } = data;
  const exercise = lesson.exercises[ui.index];
  if (!exercise) {
    return `
  <div class="lesson-shell">
    <article class="card center">
      <p class="eyebrow">${icon('info')}Đang cập nhật</p>
      <h2>Bài học chưa có câu hỏi</h2>
      <p class="muted">Nội dung bài này đang được biên soạn. Hãy chọn một bài khác trong lộ trình.</p>
      <p><a class="btn btn--primary" href="./hoc.html">Xem lộ trình ${icon('chevron')}</a></p>
    </article>
  </div>`;
  }
  const total = Math.max(1, lesson.exercises.length);
  const done = ui.results.length;
  const hintHtml = ui.hint
    ? `<p class="tiny faint" style="margin:.4rem 0 0">${icon('info')}${esc(exercise.hint || `Gợi ý: đáp án bắt đầu bằng “${String(exercise.answer?.[0] ?? '').toUpperCase()}”.`)}</p>`
    : '';

  return `
  <div class="lesson-shell">
    <div class="lesson-top">
      <a class="icon-btn" href="./hoc.html" aria-label="Thoát bài học">${icon('x')}</a>
      <div class="lesson-progress" role="progressbar" aria-valuemin="0" aria-valuemax="${total}"
        aria-valuenow="${ui.index}" aria-label="Tiến độ bài học">
        <span style="width:${((ui.index / total) * 100).toFixed(1)}%"></span>
      </div>
      <span class="lesson-count">${ui.index + 1}/${total}</span>
    </div>

    <article class="card">
      <p class="prompt">${esc(exercise.prompt || 'Chọn đáp án đúng')}</p>
      ${stemHtml(exercise)}
      <form data-action="check" novalidate>
        ${exercise.type === 'mcq' ? `<div class="options">${optionRows(exercise, ui)}</div>` : ''}
        ${exercise.type === 'build' ? buildArea(ui) : ''}
        ${exercise.type === 'gap' ? textArea(exercise, ui) : ''}
        ${exercise.type === 'listen' ? listenArea(exercise, ui) : ''}
        ${
          exercise.type === 'mcq' || exercise.type === 'build'
            ? `<div class="lesson-actions" style="margin-top:1rem">
                 <button class="btn btn--primary" type="submit" ${ui.feedback ? 'disabled' : ''}>Kiểm tra</button>
               </div>`
            : ''
        }
      </form>
      <div class="row row--between" style="margin-top:.8rem">
        <div>
          <button class="btn btn--quiet btn--sm" type="button" data-action="hint" ${ui.hint || ui.feedback ? 'disabled' : ''}>
            ${icon('info')}Gợi ý
          </button>
          <button class="btn btn--quiet btn--sm" type="button" data-action="skip" ${ui.feedback ? 'disabled' : ''}>Bỏ qua</button>
        </div>
        <span class="combo">${state.combo >= 3 ? `${icon('flame')}Chuỗi đúng ${state.combo}` : ''}</span>
      </div>
      ${hintHtml}
      ${feedbackHtml(exercise, ui)}
    </article>

    <div class="card card--flat" style="padding:.85rem 1rem">
      <div class="row row--between">
        <span class="small muted">${icon('book')}${esc(unit.title)} · ${esc(lesson.title)}</span>
        <span class="small muted">Đã trả lời ${done}/${total}</span>
      </div>
    </div>
  </div>`;
}

function summary({ state, data, ui, now }) {
  const { unit, lesson } = data;
  const result = ui.summary;
  const perfect = result.score.correct === result.score.total;
  return `
  <div class="lesson-shell">
    <article class="card center">
      <p class="eyebrow">${icon(perfect ? 'crown' : 'check')}${perfect ? 'Hoàn hảo!' : 'Hoàn thành bài học'}</p>
      <h1>${esc(lesson.title)}</h1>
      <p class="muted">${esc(unit.title)}</p>
      <div class="kpi-grid" style="margin:1rem 0">
        <div class="kpi"><span class="kpi-value">+${formatInt(result.xp)}</span><span class="kpi-label">XP nhận được</span></div>
        <div class="kpi"><span class="kpi-value">${formatPercent(result.score.accuracy)}</span><span class="kpi-label">Chính xác</span></div>
        <div class="kpi"><span class="kpi-value">${formatInt(result.score.bestCombo)}</span><span class="kpi-label">Chuỗi đúng dài nhất</span></div>
        <div class="kpi"><span class="kpi-value">${formatInt(state.streak)}</span><span class="kpi-label">Ngày liên tiếp</span></div>
      </div>
      ${
        result.unlocked.length > 0
          ? `<div class="callout" style="text-align:left;margin-bottom:1rem">
               <h3>${icon('crown')}Mở khoá thành tựu</h3>
               <p>${result.unlocked.map((achievement) => esc(achievement.title)).join(' · ')}</p>
             </div>`
          : ''
      }
      <div class="lesson-actions" style="justify-content:center">
        ${
          result.next
            ? `<a class="btn btn--primary" href="./bai-hoc.html?bai=${encodeURIComponent(result.next.lesson.id)}">Bài tiếp theo ${icon('chevron')}</a>`
            : `<a class="btn btn--primary" href="./hoc.html">Xem lộ trình ${icon('chevron')}</a>`
        }
        <a class="btn btn--ghost" href="./luyen-tap.html">Ôn từ vựng</a>
      </div>
    </article>
    ${methodNote({
      title: 'Ghi lại một câu bạn vừa học',
      text: 'Viết lại một mẫu câu của bài này vào sổ tay bằng tiếng Anh, rồi tự dịch sang tiếng Việt. Việc tạo ra ngôn ngữ (không chỉ nhận diện) giúp bạn nhớ cấu trúc lâu hơn.',
      cite: 'Swain (1995), <em>Principle and Practice in Applied Linguistics</em> — xem Thư viện',
    })}
    <p class="center tiny faint">Hoàn tất lúc ${new Date(now).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
  </div>`;
}

function outOfHearts({ state }) {
  return `<div class="lesson-shell">
    <article class="card center">
      <p class="eyebrow">${icon('heart')}Tạm dừng</p>
      <h1>Bạn đã dùng hết trái tim</h1>
      <p class="muted">Trái tim hồi 1 điểm mỗi 20 phút. Trong lúc chờ, hãy ôn thẻ từ vựng —
        ôn tập không tiêu hao trái tim mà vẫn giữ chuỗi ngày.</p>
      <div class="row" style="justify-content:center">
        <a class="btn btn--primary" href="./luyen-tap.html">Ôn tập ngay</a>
        <button class="btn btn--ghost" type="button" data-action="refill-hearts">Nạp đầy tim (350 ${icon('gem')})</button>
      </div>
      <p class="tiny faint" style="margin-top:1rem">Đá quý hiện có: ${formatInt(state.gems)}</p>
    </article>
  </div>`;
}

export function renderLesson({ state, data, ui, now }) {
  if (ui.finished && ui.summary) return summary({ state, data, ui, now });
  if (state.hearts <= 0) return outOfHearts({ state, now });
  return player({ state, data, ui });
}
