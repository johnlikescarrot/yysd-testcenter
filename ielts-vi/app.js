import { lessons, objective, skills, units } from './lessons.js';
import {
  checkAnswer, dueItems, finish, lessonItems, load, localDay,
  newProgress, nextLesson, reviewLimit, save, stats, utcDay, wordCount,
} from './learning.js';
import { icon, pathMarkup } from './path.js';

const byId = id => document.getElementById(id);
const text = (id, value) => { byId(id).textContent = value; };
const day = () => localDay(new Date());
const weekday = new Intl.DateTimeFormat('vi-VN', { weekday: 'short', timeZone: 'UTC' });
const dateLabel = new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'long', timeZone: 'UTC' });
const getStorage = () => window.localStorage;
const loaded = load(getStorage);
let progress = loaded.progress;
let session;
let timer;
let returnFocus;
const dialog = byId('session');
const exercise = byId('exercise');
const views = [...document.querySelectorAll('[data-view]')];
const nav = [...document.querySelectorAll('[data-nav]')];
function drawPath() {
  const next = nextLesson(progress);
  text('start-label', next === lessons[0] ? 'Bắt đầu học' : next ? 'Tiếp tục học' : 'Xem lịch ôn');
  byId('start').disabled = false;
  byId('units').innerHTML = pathMarkup(progress);
}

function drawReview(today) {
  const count = dueItems(progress, today).length;
  text('nav-due', count);
  byId('nav-due').hidden = !count;
  byId('start-review').hidden = !count;
  byId('review-path').hidden = Boolean(count);
  text('review-heading', count ? `${count} câu đến hạn` : 'Chưa có câu đến hạn');
  text('review-detail', count ? `Mỗi lượt ôn có tối đa ${reviewLimit} câu. Trả lời đúng để nhận điểm và lùi lịch ôn.`
    : 'Sau khi hoàn thành một bài, những câu cần ôn sẽ xuất hiện ở đây.');
}

function drawStats(today) {
  const numbers = stats(progress, today);
  byId('today').dateTime = today;
  text('today', dateLabel.format(utcDay(today)));
  text('streak', `${numbers.streak} ngày`);
  text('xp', `${numbers.xp} XP`);
  text('best', `${numbers.best} ngày`);
  text('completed', `${numbers.completed} / ${lessons.length}`);
  text('path-summary', numbers.completed ? `${numbers.completed} / ${lessons.length} bài đã xong` : `${units.length} chặng · ${lessons.length} bài`);
  const max = Math.max(progress.goal, ...numbers.week.map(item => item.xp));
  byId('week').innerHTML = numbers.week.map(item => `<li>
    <span>${item.xp}<span class="sr-only"> XP</span></span>
    <meter min="0" max="${max}" value="${item.xp}" aria-label="Điểm ngày ${dateLabel.format(utcDay(item.day))}"></meter>
    <time datetime="${item.day}">${weekday.format(utcDay(item.day))}</time></li>`).join('');
  byId('goal').value = progress.goal;
  byId('daily').max = progress.goal;
  byId('daily').value = Math.min(numbers.today, progress.goal);
  text('goal-value', `${numbers.today} / ${progress.goal} XP`);
  text('goal-percent', `${Math.min(100, Math.floor(100 * numbers.today / progress.goal))}%`);
  text('goal-note', numbers.today >= progress.goal ? 'Bạn đã đạt mục tiêu hôm nay!' : 'Hoàn thành một bài để nhận 20 XP.');
  for (const [badge, earned] of Object.entries({ first: numbers.completed > 0, streak: numbers.best >= 3, xp: numbers.xp >= 100 })) {
    const node = byId(`badge-${badge}`);
    node.textContent = earned ? 'Đã đạt' : 'Chưa đạt';
    node.classList.toggle('earned', earned);
  }
}

function draw() {
  const today = day();
  drawPath();
  drawReview(today);
  drawStats(today);
}

function persist() {
  byId('storage-notice').hidden = save(getStorage, progress);
  draw();
}

function route(moveFocus) {
  const hash = location.hash.slice(1);
  if (hash === 'noi-dung' && moveFocus) return;
  const view = views.find(node => node.id === hash) ?? views[0];
  for (const node of views) node.hidden = node !== view;
  for (const link of nav) {
    if (link.dataset.nav === view.id) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  if (moveFocus) view.querySelector('h1').focus();
}

const stopTimer = () => window.clearInterval(timer);
function startTimer() {
  const button = byId('timer-start');
  const end = Date.now() + 60_000;
  button.disabled = true;
  text('timer-status', '60 giây');
  timer = window.setInterval(() => {
    const seconds = Math.ceil((end - Date.now()) / 1000);
    if (seconds > 0) text('timer-status', `${seconds} giây`);
    else {
      stopTimer();
      text('timer-status', 'Hết giờ');
      text('timer-announcement', 'Đã hết 60 giây luyện nói.');
      button.disabled = false;
    }
  }, 250);
}

function renderContext(lesson) {
  if (lesson.audio) return `<div class="context">
    <p>Đoạn nghe luyện tập · Giọng tổng hợp</p>
    <audio src="media/${lesson.audio}.mp3" controls preload="none" aria-label="Phát đoạn nghe"></audio>
    <details><summary>Xem lời thoại tiếng Anh</summary><p lang="en">${lesson.text}</p></details>
  </div>`;
  if (lesson.text) return `<div class="context"><p lang="en">${lesson.text}</p></div>`;
  return '';
}

const inputs = {
  choice: question => `<fieldset><legend class="sr-only">Chọn một đáp án</legend>${question.options.map((option, i) => `
    <label class="option"><input type="radio" name="answer" value="${i}"><span lang="en">${option}</span></label>`).join('')}</fieldset>`,
  gap: () => '<label for="answer">Đáp án của bạn</label><input id="answer" name="answer" type="text" lang="en" maxlength="80" autocomplete="off" spellcheck="false">',
  write: () => '<label for="answer">Viết bằng tiếng Anh</label><textarea id="answer" name="answer" lang="en" rows="4" maxlength="3000" aria-describedby="words"></textarea><p id="words" class="field-note">0 / 15 từ tối thiểu</p>',
  speak: () => `<p class="field-note">Hãy trả lời thành tiếng. Đồng hồ là tùy chọn; ứng dụng không thu âm.</p>
    <div class="timer"><button class="button button-outline" type="button" id="timer-start">Bật đồng hồ 60 giây</button><span id="timer-status" role="timer"></span><span id="timer-announcement" class="sr-only" role="status"></span></div>`,
};
const checkLabels = { choice: 'Kiểm tra', gap: 'Kiểm tra', write: 'Đối chiếu bài mẫu', speak: 'Xem mẫu sau khi nói' };
const validators = {
  choice: value => value === null ? 'Chọn một đáp án trước khi kiểm tra.' : '',
  gap: value => value.trim() ? '' : 'Nhập đáp án của bạn trước khi kiểm tra.',
  write: value => wordCount(value) < 15 ? 'Hãy viết ít nhất 15 từ trước khi đối chiếu.' : '',
  speak: () => '',
};
const answerFor = { choice: (question, value) => question.options[Number(value)], gap: (_question, value) => value };

function showQuestion() {
  const { lesson, question } = session.items[session.results.length];
  const index = session.results.length + 1;
  const length = session.items.length;
  const final = index === length;
  exercise.innerHTML = `
    <div class="step"><span id="step-label">Câu ${index} / ${length}</span><progress aria-labelledby="step-label" value="${index - 1}" max="${length}"></progress></div>
    <p class="field-note">${skills[lesson.skill].activity}</p>
    ${renderContext(lesson)}
    <h3 id="prompt" lang="en" tabindex="-1">${question.prompt}</h3>
    <form id="answer-form" novalidate>
      ${inputs[question.kind](question)}
      <p id="validation" class="validation" role="alert"></p>
      <div class="actions"><button type="submit" id="check-answer" class="button button-primary">${checkLabels[question.kind]}</button></div>
    </form>
    <section id="feedback" class="feedback" aria-label="Phản hồi" tabindex="-1" hidden></section>
    <div class="actions"><button id="advance" type="button" class="button button-primary" hidden>${final ? 'Xem kết quả' : 'Câu tiếp theo'}${icon('arrow', 18)}</button></div>`;
  const form = byId('answer-form');
  if (question.kind === 'write') byId('answer').addEventListener('input', event => text('words', `${wordCount(event.target.value)} / 15 từ tối thiểu`));
  if (question.kind === 'speak') byId('timer-start').addEventListener('click', startTimer);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const value = new FormData(form).get('answer');
    const error = validators[question.kind](value);
    text('validation', error);
    if (error) {
      form.elements.namedItem('answer').length ? form.elements.namedItem('answer')[0].focus() : byId('answer').focus();
      return;
    }
    stopTimer();
    const graded = objective(question);
    const correct = graded && checkAnswer(question, answerFor[question.kind](question, value));
    session.results.push({ item: session.items[index - 1], correct });
    for (const control of form.elements) control.disabled = true;
    byId('check-answer').hidden = true;
    exercise.querySelector('progress').value = index;
    const feedback = byId('feedback');
    feedback.dataset.result = graded ? (correct ? 'correct' : 'retry') : 'sample';
    const label = graded ? (correct ? 'Chính xác!' : 'Chưa đúng, xem lời giải nhé.') : 'Đối chiếu với mẫu';
    feedback.innerHTML = `<h3>${label}</h3><p lang="en">${graded ? question.answers[0] : question.sample}</p><p>${question.explanation}</p>`;
    feedback.hidden = false;
    byId('advance').hidden = false;
    feedback.focus();
  });
  byId('advance').addEventListener('click', final ? showResult : showQuestion);
  byId('prompt').focus();
}

function showResult() {
  const { correct, total, xp } = finish(progress, session, day());
  persist();
  exercise.innerHTML = `<div class="result">
    <span class="tile gold">${icon('medal', 30)}</span>
    <h3 id="result-heading" tabindex="-1">${session.lesson ? 'Hoàn thành bài học!' : 'Hoàn thành lượt ôn!'}</h3>
    <p>Đúng <strong>${correct} / ${total}</strong> câu có đáp án · <strong>+${xp} XP</strong></p>
    <p>${xp ? 'Điểm và lịch ôn đã được cập nhật.' : 'Lịch ôn đã được cập nhật. Lần này không cộng điểm mới.'}</p>
    <p>Điểm luyện tập không quy đổi thành điểm thi IELTS.</p>
    <button id="result-close" class="button button-primary" type="button">${session.lesson ? 'Về lộ trình' : 'Về trang ôn tập'}</button>
  </div>`;
  byId('result-close').addEventListener('click', () => dialog.close());
  byId('result-heading').focus();
}

function openSession(lesson, items) {
  returnFocus = document.activeElement;
  session = { lesson, items, results: [] };
  text('session-mode', lesson ? `BÀI NGẮN · ${skills[lesson.skill].label.toLocaleUpperCase('vi-VN')}` : 'ÔN TẬP NGẮT QUÃNG');
  text('session-title', lesson?.title ?? 'Lượt ôn của bạn');
  exercise.replaceChildren();
  dialog.showModal();
  showQuestion();
}

byId('start').addEventListener('click', () => {
  const next = nextLesson(progress);
  if (next) openSession(next, lessonItems(next));
  else location.hash = 'on-tap';
});
byId('units').addEventListener('click', event => {
  const button = event.target.closest('button[data-lesson]');
  if (!button) return;
  const lesson = lessons.find(item => item.id === button.dataset.lesson);
  openSession(lesson, lessonItems(lesson));
});
byId('start-review').addEventListener('click', () => {
  const items = dueItems(progress, day()).slice(0, reviewLimit);
  if (items.length) openSession(null, items);
  else draw();
});
byId('exit').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => {
  stopTimer();
  exercise.replaceChildren();
  if (returnFocus.isConnected && !returnFocus.hidden) returnFocus.focus();
  else document.querySelector('[data-view]:not([hidden]) h1').focus();
});
byId('goal').addEventListener('change', event => {
  progress.goal = Number(event.target.value);
  persist();
});
byId('reset').addEventListener('click', () => byId('confirm-reset').showModal());
byId('confirm-delete').addEventListener('click', () => {
  progress = newProgress();
  persist();
});
window.addEventListener('hashchange', () => route(true));
byId('storage-notice').hidden = loaded.available;
route(false);
draw();
document.body.dataset.enhanced = 'true';
