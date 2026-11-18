/** Trang chủ: mục tiêu ngày, bài kế tiếp, nhiệm vụ, hạng đấu, từ của ngày. */

import { escapeHtml as esc, formatInt, formatPercent } from '../core/text.js';
import { levelInfo, streakStatus, leagueProgress, heartsLabel } from '../core/gamify.js';
import { goalProgress } from '../core/state.js';
import { nextLesson, courseProgress } from '../core/content.js';
import { questsSummary, isQuestDone } from '../core/quests.js';
import { leagueSummary } from '../core/league.js';
import { estimateProfile, bandLabel } from '../core/scoring.js';
import { icon } from './icons.js';
import { goalRing, goalPicker, levelCard, methodNote, wordCard } from './layout.js';

function greeting(now) {
  const hour = new Date(now).getHours();
  if (hour < 11) return 'Chào buổi sáng';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

function nextCta(next) {
  if (!next) {
    return `<a class="btn btn--primary" href="./luyen-tap.html">Ôn tập từ vựng ${icon('chevron')}</a>`;
  }
  return `<a class="btn btn--primary" href="./bai-hoc.html?bai=${encodeURIComponent(next.lesson.id)}">
    Tiếp tục học ${icon('chevron')}</a>`;
}

export function renderDashboard({ state, data, now }) {
  const next = nextLesson(state, data.curriculum);
  const goal = goalProgress(state, now);
  const level = levelInfo(state.xp);
  const streak = streakStatus(state, now);
  const summary = questsSummary(state.quests.items);
  const league = leagueSummary(state, now);
  const leagueInfo = leagueProgress(state.xp);
  const estimate = estimateProfile(state.skills);
  const course = courseProgress(state, data.curriculum);
  const label = bandLabel(estimate.overall);
  const top = league.standings.slice(0, 4);

  return `
  <section class="hero" aria-labelledby="hero-title">
    <div class="card hero-main">
      <p class="eyebrow">${icon('spark')}${esc(greeting(now))} · cấp ${level.level} ${esc(level.title)}</p>
      <h1 id="hero-title">${next ? 'Một bài ngắn, một bước tiến.' : 'Bạn đã đi hết lộ trình!'}</h1>
      <p class="muted" style="max-width:46ch">
        ${next
          ? `Bài kế tiếp: <strong>${esc(next.lesson.title)}</strong> · ${esc(next.unit.title)}. Mục tiêu hôm nay còn ${formatInt(Math.max(0, goal.goal - goal.xp))} XP.`
          : 'Chuyển sang ôn tập ngắt quãng để giữ những gì đã học. Chuỗi ngày vẫn được tính khi bạn ôn thẻ.'}
      </p>
      <div class="hero-actions">
        ${nextCta(next)}
        <a class="btn btn--ghost" href="./hoc.html">Xem lộ trình</a>
      </div>
      <div class="row" style="margin-top:1rem">
        <span class="pill pill--info">${icon('flag')}${course.done}/${course.total} bài</span>
        <span class="pill">${icon('flame')}${formatInt(streak.days)} ngày</span>
        <span class="pill pill--muted">${icon('clock')}${esc(heartsLabel(state, now))}</span>
      </div>
    </div>

    <div class="card goal">
      <div class="row row--between">
        <h2 style="margin:0">Mục tiêu hôm nay</h2>
        <span class="pill ${goal.reached ? 'pill--ok' : ''}">${goal.reached ? 'Hoàn thành' : formatPercent(goal.ratio)}</span>
      </div>
      ${goalRing(state, now)}
      ${goalPicker(state)}
      <p class="tiny faint" style="margin:0">Mục tiêu ${formatInt(goal.goal)} XP ~ 3–4 bài ngắn. Học đều hiệu quả hơn học dồn.</p>
    </div>
  </section>

  <section class="grid grid--2" style="margin-top:1rem" aria-labelledby="quests-title">
    <article class="card">
      <div class="section-head">
        <h2 id="quests-title">Nhiệm vụ hôm nay</h2>
        <span class="pill pill--muted">${summary.done}/${summary.total}</span>
      </div>
      <ul class="quest-list">
        ${state.quests.items
          .map(
            (quest) => `<li class="quest">
              <span class="quest-icon">${icon(quest.icon || 'check')}</span>
              <div>
                <p class="quest-title">${esc(quest.title)}</p>
                <p class="tiny faint" style="margin:0">${esc(quest.hint)}</p>
                <div class="quest-bar" role="presentation"><span style="width:${Math.min(100, (quest.progress / quest.target) * 100).toFixed(0)}%"></span></div>
              </div>
              <span class="${isQuestDone(quest) ? 'quest-done' : 'tiny faint'}">${isQuestDone(quest) ? icon('check') : `${quest.progress}/${quest.target}`}</span>
            </li>`,
          )
          .join('')}
      </ul>
      <p class="tiny faint" style="margin:.8rem 0 0">Hoàn thành nhiệm vụ để nhận đá quý — dùng mua bảo hiểm chuỗi hoặc hồi phục chuỗi.</p>
    </article>

    <article class="card">
      <div class="section-head">
        <h2>Chuỗi ngày & bảo hiểm</h2>
        <span class="pill">${icon('flame')}${formatInt(state.longestStreak)} kỷ lục</span>
      </div>
      <p style="margin:0 0 .5rem">${esc(streak.label)}.</p>
      ${levelCard(state)}
      <div class="row" style="margin-top:.9rem">
        <span class="pill pill--info">${icon('shield')}${state.freezes} bảo hiểm</span>
        <button class="btn btn--ghost btn--sm" type="button" data-action="buy-freeze">Mua bảo hiểm (200 ${icon('gem')})</button>
        ${streak.gap !== null && streak.gap > 1 && streak.days > 0
          ? `<button class="btn btn--ghost btn--sm" type="button" data-action="repair-streak">Hồi phục chuỗi (350 ${icon('gem')})</button>`
          : ''}
      </div>
      <p class="tiny faint" style="margin:.7rem 0 0">Bảo hiểm giữ chuỗi khi bạn lỡ đúng một ngày. Học tối thiểu 1 bài mỗi ngày để chuỗi tự tăng.</p>
    </article>
  </section>

  <section class="grid grid--2" style="margin-top:1rem">
    <article class="card">
      <div class="section-head">
        <h2>Hạng đấu tuần này</h2>
        <span class="pill" style="color:${leagueInfo.current.color}">${icon('crown')}${esc(leagueInfo.current.name)}</span>
      </div>
      <p class="small muted" style="margin:0 0 .6rem">
        Bạn đang ở vị trí <strong>${league.rank}/${league.total}</strong>.
        ${league.promoting ? `Nằm trong nhóm thăng hạng (${league.cutoff} người đầu).` : `Cần vào top ${league.cutoff} để thăng hạng.`}
      </p>
      <ol class="standings">
        ${top
          .map(
            (row, index) => `<li class="standing ${row.me ? 'standing--me' : ''}">
              <span class="standing-rank">${index + 1}</span>
              <span>${esc(row.name)}</span>
              <span class="standing-xp">${formatInt(row.xp)} XP</span>
            </li>`,
          )
          .join('')}
      </ol>
      <p style="margin:.7rem 0 0"><a href="./tien-do.html">Xem toàn bộ bảng và tiến độ ${icon('chevron')}</a></p>
    </article>

    <article class="card">
      <div class="section-head">
        <h2>Band ước lượng</h2>
        <span class="pill pill--ok">Overall ${estimate.overall ? estimate.overall.toFixed(1) : '—'}</span>
      </div>
      <p class="small muted" style="margin:0 0 .7rem">${esc(label.label)} — ${esc(label.note)}</p>
      <div class="bars">
        ${estimate.rows
          .map(
            (row) => `<div class="bar-row">
              <span>${esc(row.skill.vi)}</span>
              <span class="bar-track" role="presentation"><span style="width:${row.band ? (row.band / 9) * 100 : 0}%"></span></span>
              <span class="tiny faint">${row.band ? row.band.toFixed(1) : '—'}</span>
            </div>`,
          )
          .join('')}
      </div>
      <p class="tiny faint" style="margin:.7rem 0 0">Ước lượng dựa trên độ chính xác khi luyện, không phải điểm thi chính thức. Xem cách quy đổi trong Thư viện.</p>
    </article>
  </section>

  <section class="grid grid--2" style="margin-top:1rem">
    ${wordCard(data.wordOfDay, state.cards)}
    <div class="stack">
      ${methodNote({
        title: 'Vì sao chia nhỏ và lặp lại?',
        text: 'Ôn tập ngắt quãng giúp bạn nhớ lâu hơn với ít thời gian hơn so với học dồn một chỗ. Ứng dụng dùng lịch ôn 1 → 3 → 7 ngày để đưa từ quay lại đúng lúc bạn sắp quên.',
        cite: 'Cepeda et al. (2006), <em>Psychological Bulletin</em> — <a href="./thu-vien.html">xem trích dẫn</a>',
      })}
      ${methodNote({
        title: 'Tự kiểm tra tốt hơn đọc lại',
        text: 'Mỗi câu hỏi trong bài học là một lần "lấy lại" kiến thức từ trí nhớ. Việc này tạo ra trí nhớ bền hơn đọc lại ghi chú, dù cảm giác ban đầu khó hơn.',
        cite: 'Roediger &amp; Karpicke (2006), <em>Psychological Science</em> — <a href="./thu-vien.html">xem trích dẫn</a>',
      })}
    </div>
  </section>`;
}
