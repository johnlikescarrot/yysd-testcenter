/** Tiến độ: band ước lượng, biểu đồ nhiệt, thành tựu, bảng hạng, sao lưu. */

import { escapeHtml as esc, formatInt
, formatPercent } from '../core/text.js';
import { ACHIEVEMENTS, studyDayCount, weekXp, todayXp } from '../core/state.js';
import { estimateProfile, bandLabel, gapToTarget } from '../core/scoring.js';
import { heatmapData, weekdayVi, dayKey } from '../core/date.js';
import { levelInfo, leagueProgress } from '../core/gamify.js';
import { leagueSummary } from '../core/league.js';
import { deckStats } from '../core/srs.js';
import { icon } from './icons.js';
import { bar } from './layout.js';

function kpis(state, data, now) {
  const stats = deckStats(state.cards, now);
  const lessons = Object.keys(state.lessonsDone).length;
  const total = Object.values(state.skills).reduce((sum, item) => sum + (item.total || 0), 0);
  const correct = Object.values(state.skills).reduce((sum, item) => sum + (item.correct || 0), 0);
  return `
  <div class="kpi-grid">
    <div class="kpi"><span class="kpi-value">${formatInt(state.xp)}</span><span class="kpi-label">XP tích luỹ</span></div>
    <div class="kpi"><span class="kpi-value">${formatInt(state.streak)}</span><span class="kpi-label">Chuỗi hiện tại</span></div>
    <div class="kpi"><span class="kpi-value">${formatInt(lessons)}</span><span class="kpi-label">Bài đã học</span></div>
    <div class="kpi"><span class="kpi-value">${total > 0 ? formatPercent(correct / total) : '—'}</span><span class="kpi-label">Độ chính xác</span></div>
    <div class="kpi"><span class="kpi-value">${stats.mastered}</span><span class="kpi-label">Từ đã thuộc</span></div>
    <div class="kpi"><span class="kpi-value">${Object.keys(state.achievements).length}/${ACHIEVEMENTS.length}</span><span class="kpi-label">Thành tựu</span></div>
    <div class="kpi"><span class="kpi-value">${formatInt(studyDayCount(state))}</span><span class="kpi-label">Ngày đã học</span></div>
    <div class="kpi"><span class="kpi-value">${formatInt(weekXp(state, now))}</span><span class="kpi-label">XP tuần này</span></div>
  </div>`;
}

function bandSection(state) {
  const estimate = estimateProfile(state.skills);
  const label = bandLabel(estimate.overall);
  const gap = gapToTarget(estimate.overall, 7);
  return `
  <article class="card">
    <div class="section-head">
      <h2>Band ước lượng theo kỹ năng</h2>
      <span class="pill ${estimate.overall >= 6.5 ? 'pill--ok' : 'pill--info'}">Overall ${estimate.overall ? estimate.overall.toFixed(1) : '—'}</span>
    </div>
    <p class="small muted">${esc(label.label)} — ${esc(label.note)}</p>
    <div class="bars" style="margin:.8rem 0">
      ${estimate.rows
        .map(
          (row) => `<div class="bar-row">
            <span>${esc(row.skill.name)} · ${esc(row.skill.vi)}</span>
            <span class="bar-track" role="presentation"><span style="width:${row.band ? (row.band / 9) * 100 : 0}%"></span></span>
            <span class="tiny faint">${row.band ? row.band.toFixed(1) : '—'}</span>
          </div>`,
        )
        .join('')}
    </div>
    <div class="callout callout--info"><h3>Mục tiêu 7.0</h3><p>${esc(gap.message)}</p></div>
    <p class="tiny faint">Band ước lượng từ độ chính xác khi luyện trên ứng dụng, dựa trên bảng quy đổi tham khảo của IELTS. Không thay thế bài thi thật.</p>
  </article>`;
}

function weekBars(state, now) {
  const cells = heatmapData(state.history, now, 7);
  const max = Math.max(1, ...cells.map((cell) => cell.xp));
  const goal = state.goal || 40;
  return `
  <article class="card">
    <div class="section-head">
      <h2>Bảy ngày gần nhất</h2>
      <span class="pill pill--muted">Mục tiêu ${formatInt(goal)} XP/ngày</span>
    </div>
    <div class="bars">
      ${cells
        .map(
          (cell) => `<div class="bar-row">
            <span>${esc(weekdayVi(`${cell.day}T12:00:00`))}</span>
            <span class="bar-track ${cell.xp >= goal ? 'bar-track--gold' : ''}" role="presentation"><span style="width:${((cell.xp / max) * 100).toFixed(1)}%"></span></span>
            <span class="tiny faint">${formatInt(cell.xp)}</span>
          </div>`,
        )
        .join('')}
    </div>
    <p class="tiny faint" style="margin:.7rem 0 0">Cột vàng: đạt mục tiêu ngày. Hôm nay: ${formatInt(todayXp(state, now))} XP.</p>
  </article>`;
}

function heat(state, now) {
  const cells = heatmapData(state.history, now, 28);
  return `
  <article class="card">
    <div class="section-head">
      <h2>28 ngày gần đây</h2>
      <span class="pill">${icon('flame')}${formatInt(state.longestStreak)} kỷ lục</span>
    </div>
    <div class="heatmap" role="img" aria-label="Biểu đồ nhiệt 28 ngày học tập">
      ${cells.map((cell) => `<span class="heat-cell" data-level="${cell.level}" title="${esc(cell.day)}: ${cell.xp} XP"></span>`).join('')}
    </div>
    <div class="heat-legend"><span>Ít</span>
      <span class="heat-cell" data-level="0"></span><span class="heat-cell" data-level="1"></span>
      <span class="heat-cell" data-level="2"></span><span class="heat-cell" data-level="3"></span>
      <span class="heat-cell" data-level="4"></span><span>Nhiều</span>
    </div>
    <p class="tiny faint" style="margin:.6rem 0 0">Ngày hôm nay: ${esc(dayKey(now))} · chuỗi ${formatInt(state.streak)} ngày.</p>
  </article>`;
}

function achievements(state) {
  return `
  <article class="card">
    <div class="section-head">
      <h2>Thành tựu</h2>
      <span class="pill pill--muted">${Object.keys(state.achievements).length}/${ACHIEVEMENTS.length}</span>
    </div>
    <ul class="badges">
      ${ACHIEVEMENTS.map((achievement) => {
        const unlocked = Boolean(state.achievements[achievement.id]);
        return `<li class="badge-card ${unlocked ? '' : 'badge-card--locked'}">
          ${icon(achievement.icon)}
          <strong>${esc(achievement.title)}</strong>
          <small>${esc(achievement.desc)}</small>
        </li>`;
      }).join('')}
    </ul>
  </article>`;
}

function standings(state, now) {
  const league = leagueSummary(state, now);
  const info = leagueProgress(state.xp);
  return `
  <article class="card">
    <div class="section-head">
      <h2>Bảng hạng tuần</h2>
      <span class="pill" style="color:${info.current.color}">${icon('crown')}${esc(info.current.name)}</span>
    </div>
    <p class="small muted" style="margin:0 0 .6rem">
      Vị trí ${league.rank}/${league.total} · top ${league.cutoff} được thăng hạng.
      ${info.next ? `Còn ${formatInt(info.remaining)} XP tích luỹ để lên hạng ${esc(info.next.name)}.` : 'Bạn đang ở hạng cao nhất.'}
    </p>
    <ol class="standings">
      ${league.standings
        .map(
          (row, index) => `<li class="standing ${row.me ? 'standing--me' : ''}">
            <span class="standing-rank">${index + 1}</span>
            <span>${esc(row.name)}${row.me ? ' (bạn)' : ''}</span>
            <span class="standing-xp">${formatInt(row.xp)} XP</span>
          </li>`,
        )
        .join('')}
    </ol>
    <p class="tiny faint" style="margin:.6rem 0 0">Đối thủ là dữ liệu mô phỏng ổn định theo tuần, giúp bạn có mốc phấn đấu — không phải người dùng thật.</p>
  </article>`;
}

function backup(state) {
  return `
  <article class="card">
    <div class="section-head"><h2>Dữ liệu của bạn</h2><span class="pill pill--info">${icon('shield')}Lưu trên thiết bị</span></div>
    <p class="small muted">Tiến độ lưu trong trình duyệt của bạn. Xuất tệp JSON để chuyển sang thiết bị khác hoặc sao lưu.</p>
    <div class="row">
      <button class="btn btn--ghost btn--sm" type="button" data-action="export-data">${icon('download')}Xuất tiến độ</button>
      <label class="btn btn--ghost btn--sm" for="import-file" style="cursor:pointer">
        ${icon('upload')}Khôi phục từ tệp
      </label>
      <input class="sr-only" id="import-file" type="file" accept="application/json,.json" data-import>
    </div>
    <div class="row" style="margin-top:.9rem">
      <button class="btn btn--quiet btn--sm" type="button" data-action="toggle-setting" data-value="sound"
        aria-pressed="${state.settings.sound}">${icon('volume')}Âm thanh: ${state.settings.sound ? 'bật' : 'tắt'}</button>
      <button class="btn btn--quiet btn--sm" type="button" data-action="toggle-setting" data-value="reminders"
        aria-pressed="${state.settings.reminders}">${icon('clock')}Nhắc học: ${state.settings.reminders ? 'bật' : 'tắt'}</button>
    </div>
    ${bar(levelInfo(state.xp).ratio, `Cấp ${levelInfo(state.xp).level} · ${levelInfo(state.xp).title}`)}
  </article>`;
}

export function renderProgress({ state, data, now }) {
  return `
  <section aria-labelledby="progress-title">
    <p class="eyebrow">${icon('chart')}Bức tranh tổng thể</p>
    <h1 id="progress-title">Tiến độ của bạn</h1>
    <p class="muted" style="max-width:60ch">Số liệu dưới đây được tính từ chính các câu bạn đã trả lời. Hãy xem đây là
      bản đồ để chọn kỹ năng yếu nhất, không phải điểm số chính thức.</p>
  </section>
  <div style="margin-top:1rem">${kpis(state, data, now)}</div>
  <section class="grid grid--2" style="margin-top:1rem">
    ${bandSection(state)}
    ${weekBars(state, now)}
  </section>
  <section class="grid grid--2" style="margin-top:1rem">
    ${heat(state, now)}
    ${standings(state, now)}
  </section>
  <section class="grid grid--2" style="margin-top:1rem">
    ${achievements(state)}
    ${backup(state)}
  </section>
  <p class="tiny faint center" style="margin-top:1rem">Cập nhật lần cuối: ${esc(new Date(now).toLocaleString('vi-VN'))}</p>`;
}
