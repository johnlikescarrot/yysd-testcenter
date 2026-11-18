import { BADGES, FRIENDS } from './data.js';
import { earnedBadges } from './state.js';

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

export function renderIntro() {
  return '<p class="lesson__intro">Nhấn <strong>Bắt đầu</strong> để mở câu hỏi đầu tiên. Mỗi câu trả lời đúng được điểm kinh nghiệm; câu sai được giải thích chi tiết bằng tiếng Việt và đưa vào hàng đợi ôn tập.</p><ol class="lesson__steps"><li>Đọc câu hỏi và chọn đáp án.</li><li>Xem giải thích, ghi nhận điểm kinh nghiệm.</li><li>Chuyển câu tiếp theo hoặc ôn tập các câu cần nhớ lại.</li></ol>';
}

export function renderQuestion(question, index) {
  const options = question.options
    .map((option) => '<button class="option" type="button" data-action="answer" data-choice="' + escapeHtml(option) + '" aria-pressed="false">' + escapeHtml(option) + '</button>')
    .join('');
  return '<p class="question"><span class="question__meta">Câu ' + (index + 1) + ' · ' + escapeHtml(question.skill) + '</span>' + escapeHtml(question.prompt) + '</p><div class="options">' + options + '</div><button class="btn btn--secondary" type="button" data-action="next">Câu tiếp theo</button>';
}

export function renderFeedback(state) {
  if (state.feedback === null) return '';
  return '<span data-kind="' + escapeHtml(state.feedbackKind) + '">' + escapeHtml(state.feedback) + '</span>';
}

export function renderUnits(units) {
  return units
    .map((unit) => '<article class="unit"><span class="unit__tag">Đơn vị ' + unit.id + ' · ' + escapeHtml(unit.skill) + '</span><h3>' + escapeHtml(unit.title) + '</h3><p>' + escapeHtml(unit.detail) + '</p></article>')
    .join('');
}

export function renderLeague(state) {
  const rows = FRIENDS.concat([{ name: 'Bạn', xp: state.xpWeek, streak: state.streak }]);
  rows.sort((first, second) => second.xp - first.xp);
  return rows
    .map((row, index) => {
      let open = '<tr>';
      if (row.name === 'Bạn') open = '<tr class="row--me">';
      return open + '<td>' + (index + 1) + '</td><td>' + escapeHtml(row.name) + '</td><td>' + row.xp + '</td><td>' + row.streak + '</td></tr>';
    })
    .join('');
}

export function renderBadges(state) {
  const earned = earnedBadges(state);
  return BADGES.map((badge) => '<li data-earned="' + earned.includes(badge.id) + '"><strong>' + escapeHtml(badge.name) + '</strong><span>' + escapeHtml(badge.note) + '</span></li>').join('');
}

export function renderPdfs(pdfs) {
  return pdfs
    .map((pdf) => '<li><strong>' + escapeHtml(pdf.title) + '</strong><span>' + escapeHtml(pdf.topic) + '</span><br><a href="tai-lieu/' + escapeHtml(pdf.file) + '" target="_blank" rel="noopener noreferrer">Mở tài liệu PDF</a></li>')
    .join('');
}

export function renderLessonStatus(state) {
  if (state.inLesson) return 'Đang học';
  return 'Sẵn sàng';
}

export function renderLastDay(state) {
  if (state.lastDay === '') return 'Chưa có';
  return state.lastDay;
}
