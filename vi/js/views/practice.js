/** Luyện tập: thẻ từ vựng (SRS), nghe chép, viết luận, speaking có hẹn giờ. */

import { escapeHtml as esc, formatInt, formatPercent } from '../core/text.js';
import { deckStats } from '../core/srs.js';
import { icon } from './icons.js';
import { timerHtml } from './layout.js';

const MODES = [
  { id: 'the', label: 'Thẻ từ vựng', icon: 'cards', text: 'Ôn theo lịch 1 → 3 → 7 ngày' },
  { id: 'nghe', label: 'Nghe chép', icon: 'headphones', text: 'Nghe từ rồi viết lại chính xác' },
  { id: 'viet', label: 'Viết luận', icon: 'pencil', text: 'Đề Task 1 & Task 2 kèm dàn ý' },
  { id: 'noi', label: 'Speaking', icon: 'clock', text: 'Cue card có hẹn giờ 1–2 phút' },
];

function tile(mode, ui) {
  const active = ui.mode === mode.id;
  return `<button class="tile" type="button" data-action="mode" data-value="${mode.id}" aria-pressed="${active}"
    style="${active ? 'border-color:var(--gold-dark);box-shadow:var(--shadow-md)' : ''}">
    <span class="tile-icon">${icon(mode.icon)}</span>
    <h3>${esc(mode.label)}</h3>
    <p>${esc(mode.text)}</p>
  </button>`;
}

function flashcard({ state, data, ui }) {
  const queue = ui.queue;
  const stats = deckStats(state.cards, ui.now);
  if (queue.length === 0) {
    return `<article class="card center"><h2>Chưa có thẻ để ôn</h2>
      <p class="muted">Kho từ vựng đang trống. Hãy bắt đầu từ một bài học.</p>
      <p><a class="btn btn--primary" href="./hoc.html">Mở lộ trình</a></p></article>`;
  }
  if (ui.pos >= queue.length) {
    return `<article class="card center"><h2>Đã ôn xong lượt này</h2>
      <p class="muted">Bạn vừa ôn ${queue.length} thẻ. Các thẻ vừa đánh giá đã được lên lịch cho những ngày tới.</p>
      <p><button class="btn btn--primary" type="button" data-action="restart-review">Ôn thêm lượt nữa</button></p></article>`;
  }
  const word = data.vocab.find((item) => item.id === queue[ui.pos]);
  if (!word) {
    return `<article class="card center"><h2>Thẻ không còn trong kho</h2>
      <p class="muted">Từ này đã được gỡ khỏi kho từ vựng.</p>
      <p><button class="btn btn--primary" type="button" data-action="restart-review">Chọn thẻ khác</button></p></article>`;
  }
  return `
  <article class="card">
    <div class="row row--between" style="margin-bottom:.8rem">
      <span class="pill pill--info">${icon('cards')}${ui.pos + 1}/${queue.length} thẻ</span>
      <span class="small muted">${formatInt(stats.due)} thẻ đến hạn · ${formatInt(stats.mastered)} đã thuộc</span>
    </div>
    <div class="flashcard">
      <div>
        <p class="eyebrow" style="justify-content:center">${esc((word.tags || []).join(' · ') || 'IELTS')}</p>
        <p class="flashcard-word">${esc(word.term)}</p>
        <p class="flashcard-ipa">/${esc(word.ipa)}/ · ${esc(word.pos)}</p>
        <p style="margin:.8rem 0 0">
          <button class="btn btn--ghost btn--sm" type="button" data-action="play-word" data-value="${esc(word.id)}">
            ${icon('volume')}Nghe phát âm
          </button>
        </p>
        ${
          ui.revealed
            ? `<div class="flashcard-back">
                 <p style="margin:0 0 .4rem"><strong>${esc(word.vi)}</strong></p>
                 <p class="small muted" style="margin:0 0 .4rem">${esc(word.enDef)}</p>
                 <p class="small" style="margin:0 0 .4rem">${esc(word.example)}</p>
                 <p class="small muted" style="margin:0 0 .4rem"><em>${esc(word.exampleVi)}</em></p>
                 <p class="tiny faint" style="margin:0">Kết hợp: ${esc((word.colloc || []).join(' · '))}</p>
               </div>`
            : ''
        }
      </div>
    </div>
    <div style="margin-top:1rem">
      ${
        ui.revealed
          ? `<p class="small muted" style="margin:0 0 .5rem">Bạn nhớ từ này ở mức nào?</p>
             <div class="grade-row">
               <button class="grade" type="button" data-action="grade-card" data-value="again">Lại<span>quên</span></button>
               <button class="grade" type="button" data-action="grade-card" data-value="hard">Khó<span>mang máng</span></button>
               <button class="grade" type="button" data-action="grade-card" data-value="good">Tốt<span>nhớ đúng</span></button>
               <button class="grade" type="button" data-action="grade-card" data-value="easy">Dễ<span>quá dễ</span></button>
             </div>`
          : `<button class="btn btn--primary btn--block" type="button" data-action="reveal-card">Hiện nghĩa</button>`
      }
    </div>
  </article>`;
}

function dictation({ data, ui }) {
  const word = data.vocab.find((item) => item.id === ui.dict.wordId);
  if (!word) {
    return `<article class="card center"><h2>Chưa có từ để nghe</h2>
      <p class="muted">Kho từ vựng đang trống.</p></article>`;
  }
  const feedback = ui.dict.feedback;
  return `
  <article class="card">
    <div class="row row--between" style="margin-bottom:.6rem">
      <h2 style="margin:0">Nghe và viết lại từ</h2>
      <span class="pill pill--muted">${icon('headphones')}${esc((word.tags || [])[0] || 'IELTS')}</span>
    </div>
    <p class="muted">Bấm nghe, gõ đúng từ bạn nghe được. Không phân biệt hoa thường.</p>
    <div class="row" style="margin-bottom:.8rem">
      <button class="btn btn--ghost" type="button" data-action="play-word" data-value="${esc(word.id)}">${icon('volume')}Nghe</button>
      <button class="btn btn--quiet" type="button" data-action="play-word" data-value="${esc(word.id)}" data-slow="1">Nghe chậm</button>
    </div>
    <form data-action="check-dictation" novalidate>
      <div class="answer-line">
        <label class="sr-only" for="dictation-input">Từ bạn nghe được</label>
        <input class="text-field" id="dictation-input" name="answer" type="text" autocomplete="off"
          autocapitalize="off" spellcheck="false" placeholder="Viết từ bạn nghe được" value="${esc(ui.dict.draft)}"
          ${feedback ? 'disabled' : ''}>
        <button class="btn btn--primary" type="submit" ${feedback ? 'disabled' : ''}>Kiểm tra</button>
      </div>
    </form>
    ${
      feedback
        ? `<section class="feedback ${feedback.correct ? 'feedback--ok' : 'feedback--bad'}" style="margin-top:.9rem" aria-live="polite">
             <h3>${icon(feedback.correct ? 'check' : 'x')}${feedback.correct ? 'Chuẩn!' : 'Chưa đúng'}</h3>
             <p>Đáp án: <strong>${esc(word.term)}</strong> /${esc(word.ipa)}/ — ${esc(word.vi)}</p>
             <p class="small">${esc(word.example)}</p>
             <p style="margin-top:.6rem"><button class="btn btn--primary btn--sm" type="button" data-action="next-dictation">Từ tiếp theo ${icon('chevron')}</button></p>
           </section>`
        : ''
    }
  </article>`;
}

function writing({ data, ui }) {
  const prompts = (data.prompts.writing || []).filter(
    (item) => ui.writingTask === 0 || item.task === ui.writingTask,
  );
  return `
  <article class="card">
    <div class="row row--between" style="margin-bottom:.6rem">
      <h2 style="margin:0">Viết luận IELTS</h2>
      <div class="filters" role="group" aria-label="Lọc theo Task">
        ${[0, 1, 2]
          .map(
            (task) => `<button class="filter" type="button" data-action="writing-task" data-value="${task}"
              aria-pressed="${ui.writingTask === task}">${task === 0 ? 'Tất cả' : `Task ${task}`}</button>`,
          )
          .join('')}
      </div>
    </div>
    <p class="muted">Mỗi đề có dàn ý, cụm từ hữu ích và bài mẫu band 8+. Hãy viết trước, rồi mới đối chiếu.</p>
    ${timerHtml(ui.timer)}
    <div class="stack">
      ${prompts
        .map((prompt) => {
          const open = ui.writingOpen === prompt.id;
          return `<section class="card card--flat" aria-labelledby="w-${esc(prompt.id)}">
            <div class="row row--between">
              <div class="grow">
                <p class="eyebrow" style="margin:0 0 .2rem">Task ${prompt.task} · ${prompt.minutes} phút · tối thiểu ${prompt.minWords} từ</p>
                <h3 id="w-${esc(prompt.id)}" style="margin:0">${esc(prompt.title)}</h3>
              </div>
              <button class="btn btn--ghost btn--sm" type="button" data-action="toggle-writing" data-value="${esc(prompt.id)}"
                aria-expanded="${open}">${open ? 'Thu gọn' : 'Xem dàn ý'}</button>
            </div>
            <p class="small" style="margin:.6rem 0 0;white-space:pre-line">${esc(prompt.prompt)}</p>
            ${
              open
                ? `<div style="margin-top:.8rem">
                     <h4 class="small" style="font-family:var(--font-ui);margin:.4rem 0">Dàn ý</h4>
                     <ol class="small">${prompt.outline.map((line) => `<li>${esc(line)}</li>`).join('')}</ol>
                     <h4 class="small" style="font-family:var(--font-ui);margin:.6rem 0 .3rem">Cụm từ nên dùng</h4>
                     <div class="row row--tight">${prompt.phrases.map((phrase) => `<span class="chip chip--static">${esc(phrase)}</span>`).join('')}</div>
                     <h4 class="small" style="font-family:var(--font-ui);margin:.8rem 0 .3rem">Bài mẫu</h4>
                     <blockquote class="small" style="margin:0;padding:.8rem 1rem;border-left:3px solid var(--gold);background:#fdf8ec;white-space:pre-line">${esc(prompt.model)}</blockquote>
                     <ul class="small" style="margin:.7rem 0 0">${prompt.checklist.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
                     <p style="margin:.7rem 0 0"><button class="btn btn--quiet btn--sm" type="button" data-action="start-timer"
                       data-value="${prompt.minutes * 60}" data-topic="${esc(prompt.title)}">Bắt đầu hẹn giờ ${prompt.minutes} phút</button></p>
                   </div>`
                : ''
            }
          </section>`;
        })
        .join('')}
    </div>
  </article>`;
}

function speaking({ data, ui }) {
  const cards = data.prompts.speaking || [];
  return `
  <article class="card">
    <h2>Speaking có hẹn giờ</h2>
    <p class="muted">Part 2: 1 phút chuẩn bị, 2 phút nói. Ghi âm bằng điện thoại rồi nghe lại — đây là cách nhanh nhất để thấy lỗi phát âm.</p>
    ${timerHtml(ui.timer)}
    <div class="stack">
      ${cards
        .map((card) => {
          const open = ui.speakingOpen === card.id;
          return `<section class="card card--flat" aria-labelledby="s-${esc(card.id)}">
            <div class="row row--between">
              <div class="grow">
                <p class="eyebrow" style="margin:0 0 .2rem">Part ${card.part} · ${esc(card.topic)}</p>
                <h3 id="s-${esc(card.id)}" style="margin:0">${esc(card.title)}</h3>
              </div>
              <button class="btn btn--ghost btn--sm" type="button" data-action="toggle-speaking" data-value="${esc(card.id)}"
                aria-expanded="${open}">${open ? 'Thu gọn' : 'Mở cue card'}</button>
            </div>
            ${
              open
                ? `<div style="margin-top:.7rem">
                     <p class="small muted" style="margin:0 0 .4rem">Bạn nên nói về:</p>
                     <ul class="small">${card.cue.map((line) => `<li>${esc(line)}</li>`).join('')}</ul>
                     <div class="row" style="margin:.7rem 0">
                       <button class="btn btn--primary btn--sm" type="button" data-action="start-timer"
                         data-value="${card.prep}" data-kind="prep" data-topic="${esc(card.title)}">Chuẩn bị ${Math.round(card.prep / 60)} phút</button>
                       <button class="btn btn--ghost btn--sm" type="button" data-action="start-timer"
                         data-value="${card.speak}" data-kind="speak" data-topic="${esc(card.title)}">Nói ${Math.round(card.speak / 60)} phút</button>
                     </div>
                     <h4 class="small" style="font-family:var(--font-ui);margin:.6rem 0 .3rem">Bài nói mẫu</h4>
                     <blockquote class="small" style="margin:0;padding:.8rem 1rem;border-left:3px solid var(--gold);background:#fdf8ec">${esc(card.sample)}</blockquote>
                     <p class="tiny faint" style="margin:.6rem 0 0">${esc((card.tips || []).join(' · '))}</p>
                   </div>`
                : ''
            }
          </section>`;
        })
        .join('')}
    </div>
  </article>`;
}

export function renderPractice({ state, data, ui }) {
  const stats = deckStats(state.cards, ui.now);
  return `
  <section aria-labelledby="practice-title">
    <p class="eyebrow">${icon('target')}Luyện tập chủ động</p>
    <h1 id="practice-title">Bốn cách luyện không tốn trái tim</h1>
    <p class="muted" style="max-width:62ch">Ôn thẻ, nghe chép, viết và nói đều không trừ trái tim — bạn có thể luyện bao lâu tuỳ thích.
      Trái tim chỉ dùng khi vào bài học mới.</p>
    <div class="grid" style="margin:1rem 0">
      ${MODES.map((mode) => tile(mode, ui)).join('')}
    </div>
    ${ui.timer && ui.mode !== 'viet' && ui.mode !== 'noi' ? timerHtml(ui.timer) : ''}
  </section>
  <p class="row row--tight" style="margin:0 0 .8rem">
    <span class="pill pill--info">${icon('cards')}${formatInt(stats.total)} thẻ</span>
    <span class="pill">${icon('clock')}${formatInt(stats.due)} đến hạn</span>
    <span class="pill pill--ok">${icon('check')}${formatInt(stats.mastered)} đã thuộc</span>
    <span class="pill pill--muted">Độ nhớ ước tính ${formatPercent(stats.accuracy)}</span>
  </p>
  ${ui.mode === 'the' ? flashcard({ state, data, ui }) : ''}
  ${ui.mode === 'nghe' ? dictation({ data, ui }) : ''}
  ${ui.mode === 'viet' ? writing({ data, ui }) : ''}
  ${ui.mode === 'noi' ? speaking({ data, ui }) : ''}`;
}
