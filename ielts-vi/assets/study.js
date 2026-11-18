import { byLesson, lessons, skills, units } from './course.js';
import {
  assess, currentQuestion, finish, goals, localDay, makeSession, previousWeek,
  readProgress, saveProgress, storageKey, summary, wordCount,
} from './progress.js';

const svgNs = 'http://www.w3.org/2000/svg';
const weekday = new Intl.DateTimeFormat('vi-VN', { weekday: 'short', timeZone: 'UTC' });
const fullDay = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'full', timeZone: 'UTC' });

export function mount(document, window, clock) {
  const get = (id) => document.getElementById(id);
  const dialog = get('lesson-dialog');
  const host = get('question-host');
  const action = get('session-action');
  const feedback = get('feedback');
  const error = get('response-error');
  const continueButton = get('continue-lesson');
  const reviewButton = get('begin-review');
  const goalSelect = get('goal-select');
  const getStorage = () => window.localStorage;
  let state = readProgress(getStorage);
  let day;
  let session;
  let phase;
  let origin;
  let timerId = null;
  let readResponse;

  function text(tag, value, className = '') {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = value;
    return node;
  }

  function english(tag, value, className = '') {
    const node = text(tag, value, className);
    node.lang = 'en';
    return node;
  }

  function button(value, className, handler) {
    const node = text('button', value, className);
    node.type = 'button';
    node.addEventListener('click', handler);
    return node;
  }

  function icon(name, tone) {
    const badge = text('span', '', `side-icon tone-${tone}`);
    const svg = document.createElementNS(svgNs, 'svg');
    const use = document.createElementNS(svgNs, 'use');
    svg.setAttribute('aria-hidden', 'true');
    use.setAttribute('href', `assets/icons.svg#${name}`);
    svg.append(use);
    badge.append(svg);
    return badge;
  }

  function persist() {
    get('storage-note').hidden = saveProgress(getStorage, state);
  }

  function renderPath(next) {
    const path = units.map((unit, index) => {
      const article = text('article', '', 'unit');
      const header = text('header', '', 'unit-header');
      const copy = text('div', '');
      copy.append(text('p', unit.label.toUpperCase(), 'eyebrow'), text('h3', unit.title),
        text('p', unit.summary, 'unit-summary'));
      const number = text('span', `0${index + 1}`, 'unit-no');
      number.setAttribute('aria-hidden', 'true');
      header.append(number, copy);
      const list = text('ol', '', 'unit-list');
      for (const lesson of unit.lessons) {
        const { id, skill } = lesson;
        const item = text('li', '');
        const done = Object.hasOwn(state.completed, id);
        const suggested = id === next;
        const entry = button('', suggested ? 'lesson suggested' : 'lesson', () => start(id, entry.id));
        entry.id = `lesson-${id}`;
        const info = text('span', '', 'lesson-text');
        info.append(text('span', lesson.title, 'lesson-title'),
          text('span', `${skills[skill].name} · ${lesson.minutes} phút · ${lesson.description}`, 'lesson-meta'));
        const label = done ? 'Đã học · Luyện lại' : suggested ? 'Bài tiếp theo →' : 'Mở bài →';
        entry.append(icon(skills[skill].icon, skill), info, text('span', label, 'lesson-status'));
        item.append(entry);
        list.append(item);
      }
      article.append(header, list);
      return article;
    });
    get('learning-path').replaceChildren(...path);
  }

  function renderWeek() {
    const items = previousWeek(day).map(({ ordinal, date }) => {
      const practiced = Boolean(state.activity[ordinal]);
      const li = text('li', '', practiced ? 'practiced' : '');
      const label = `${fullDay.format(date)}: ${practiced ? 'đã luyện' : 'chưa luyện'}`;
      li.title = label;
      const visible = text('span', weekday.format(date));
      visible.setAttribute('aria-hidden', 'true');
      li.append(visible, text('span', label, 'visually-hidden'));
      if (ordinal === day) li.classList.add('current');
      return li;
    });
    get('week').replaceChildren(...items);
  }

  function renderReport(badges) {
    get('xp-summary').textContent = `${state.xp} điểm kinh nghiệm`;
    get('skill-progress').replaceChildren(...Object.entries(skills).map(([key, skill]) => {
      const group = lessons.filter((lesson) => lesson.skill === key);
      const count = group.filter(({ id }) => Object.hasOwn(state.completed, id)).length;
      const li = text('li', '', `tone-${key}`);
      const meter = text('progress', '');
      meter.max = group.length;
      meter.value = count;
      meter.setAttribute('aria-label', `Tiến độ kỹ năng ${skill.name}`);
      li.append(text('strong', skill.name), text('span', `${count} / ${group.length} bài`, 'muted'), meter);
      return li;
    }));
    get('badges').replaceChildren(...badges.map(({ title, detail, earned }) => {
      const li = text('li', '', earned ? 'is-earned' : '');
      const info = text('span', '', 'badge-detail');
      info.append(text('strong', title), text('small', `${earned ? 'Đã nhận' : 'Chưa nhận'} · ${detail}`, 'muted'));
      li.append(icon(earned ? 'check' : 'award', earned ? 'read' : 'listen'), info);
      return li;
    }));
  }

  function renderDashboard() {
    day = localDay(clock.now());
    const { badges, completed, days, due, nextLesson, today } = summary(state, day);
    const target = nextLesson?.id ?? (due ? 'review' : lessons[0].id);
    const label = completed === 0 ? 'Bắt đầu bài đầu tiên'
      : nextLesson ? 'Tiếp tục lộ trình' : due ? 'Ôn các câu đến hạn' : 'Luyện lại từ đầu';
    const arrow = text('span', '→');
    arrow.setAttribute('aria-hidden', 'true');
    continueButton.replaceChildren(label, arrow);
    continueButton.dataset.lesson = target;
    continueButton.disabled = false;
    get('goal-count').textContent = `${today} / ${state.goal}`;
    get('goal-meter').max = state.goal;
    get('goal-meter').value = today;
    get('goal-note').textContent = today >= state.goal
      ? 'Bạn đã đạt mục tiêu hôm nay!' : 'Mỗi lượt học hoặc ôn xong đều được tính.';
    goalSelect.disabled = false;
    goalSelect.value = String(state.goal);
    get('streak-count').textContent = `${days} ngày`;
    get('review-count').textContent = `${due} câu`;
    get('review-note').textContent = due ? 'Câu từng sai được ưu tiên. Mỗi lượt có tối đa 8 câu.'
      : 'Chưa có câu đến hạn. Các câu đã làm sẽ tự lên lịch ôn.';
    reviewButton.disabled = !due;
    renderPath(nextLesson?.id);
    renderWeek();
    renderReport(badges);
  }

  function renderContext(lesson) {
    const { context } = lesson;
    if (!context) return;
    const wrapper = text('div', '', 'context');
    if (context.audio) {
      const audio = text('audio', 'Trình duyệt không phát được âm thanh. Bạn có thể đọc bản chép bên dưới.');
      audio.src = `audio/${context.audio}`;
      audio.controls = true;
      audio.preload = 'none';
      audio.setAttribute('aria-label', 'Đoạn nghe tiếng Anh');
      const transcript = text('details', '');
      transcript.append(text('summary', 'Bản chép lời (có thể xem sau khi nghe)'), english('p', context.text));
      wrapper.append(audio, text('p', 'Giọng đọc tổng hợp; có thể nghe lại trong chế độ luyện.', 'muted'), transcript);
    } else {
      wrapper.append(english('p', context.text));
    }
    host.append(wrapper);
  }

  function renderChoice(question) {
    const field = text('fieldset', '');
    field.setAttribute('aria-labelledby', 'question-prompt');
    question.options.forEach((option, index) => {
      const label = text('label', '', 'option');
      const input = text('input', '');
      input.type = 'radio';
      input.name = 'answer';
      input.value = String(index);
      label.append(input, english('span', option));
      field.append(label);
    });
    host.append(field);
    readResponse = () => {
      const selected = field.querySelector(':checked');
      return selected ? Number(selected.value) : null;
    };
  }

  function renderTextInput(question) {
    const isWriting = question.type === 'write';
    const label = text('label', '', 'response-label');
    const field = english(isWriting ? 'textarea' : 'input', '');
    field.autocomplete = 'off';
    field.maxLength = isWriting ? 3200 : 100;
    label.append(text('span', isWriting ? 'Đoạn viết của bạn' : 'Đáp án của bạn'), field);
    host.append(label);
    if (isWriting) {
      const count = text('p', `0 / ${question.minimum} từ tối thiểu cho bài ngắn`, 'muted');
      count.id = 'word-count';
      field.setAttribute('aria-describedby', count.id);
      field.addEventListener('input', () => {
        count.textContent = `${wordCount(field.value)} / ${question.minimum} từ tối thiểu cho bài ngắn`;
      });
      host.append(count, text('p', 'Đoạn văn không rời trình duyệt và không được lưu sau lượt học.', 'muted'));
    }
    readResponse = () => field.value;
  }

  function stopClock() {
    if (timerId !== null) {
      clock.clearInterval(timerId);
      timerId = null;
    }
  }

  function renderSpeaking() {
    const controls = text('div', '', 'timer-controls');
    const time = text('span', '00:00', 'timer');
    time.setAttribute('role', 'timer');
    time.setAttribute('aria-label', 'Thời gian còn lại');
    const status = text('p', 'Bộ đếm là tùy chọn; ứng dụng không thu âm.', 'muted');
    status.setAttribute('role', 'status');
    const countdown = (seconds, label) => {
      stopClock();
      status.textContent = label;
      const end = clock.now().getTime() + 1000 * seconds;
      const tick = () => {
        const remaining = Math.max(0, Math.ceil((end - clock.now().getTime()) / 1000));
        time.textContent = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
        if (!remaining) {
          stopClock();
          status.textContent = 'Hết giờ. Bạn vẫn có thể hoàn thành phần nói.';
        }
      };
      tick();
      timerId = clock.setInterval(tick, 250);
    };
    controls.append(button('Chuẩn bị · 60 giây', 'button quiet', () => countdown(60, 'Đang chuẩn bị')),
      button('Bắt đầu nói · 120 giây', 'button quiet', () => countdown(120, 'Đang luyện nói')), time);
    const check = text('label', '', 'speaking-check');
    const input = text('input', '');
    input.type = 'checkbox';
    check.append(input, text('span', 'Tôi đã thử trả lời thành tiếng.'));
    host.append(controls, status, check);
    readResponse = () => input.checked;
  }

  function renderQuestion() {
    phase = 'answer';
    feedback.hidden = true;
    error.hidden = true;
    const question = currentQuestion(session);
    const lesson = byLesson[question.lessonId];
    get('session-label').textContent = `CÂU ${session.results.length + 1} / ${session.ids.length} · ${skills[lesson.skill].name.toUpperCase()}`;
    get('session-note').textContent = 'Tiến độ được cập nhật khi bạn hoàn thành lượt này.';
    get('session-meter').value = session.results.length;
    const prompt = english('h3', question.prompt, 'prompt');
    prompt.id = 'question-prompt';
    prompt.tabIndex = -1;
    host.replaceChildren(text('p', lesson.instruction, 'muted'));
    renderContext(lesson);
    host.append(prompt);
    if (question.type === 'choice') renderChoice(question);
    else if (question.type === 'speak') renderSpeaking();
    else renderTextInput(question);
    action.textContent = question.example ? 'Xem gợi ý tự kiểm' : 'Kiểm tra';
    prompt.focus();
  }

  function start(id, trigger) {
    session = makeSession(id, state, localDay(clock.now()));
    if (!session) {
      renderDashboard();
      return;
    }
    origin = trigger;
    get('session-title').textContent = session.lessonId ? byLesson[id].title : 'Ôn tập ngắt quãng';
    get('session-meter').max = session.ids.length;
    dialog.showModal();
    renderQuestion();
  }

  function renderFeedback(question, result) {
    phase = 'feedback';
    error.hidden = true;
    stopClock();
    for (const input of host.querySelectorAll('input, textarea, button')) input.disabled = true;
    const heading = text('h4', result.correct === null ? 'Gợi ý tự kiểm' : result.correct ? 'Chính xác!' : 'Chưa đúng, hãy nhìn lại');
    heading.tabIndex = -1;
    feedback.dataset.tone = result.correct === null ? 'self' : result.correct ? 'correct' : 'retry';
    feedback.replaceChildren(heading);
    if (question.example) {
      const checklist = text('ul', '');
      checklist.append(...question.checklist.map((label) => text('li', label)));
      feedback.append(english('p', question.example), checklist);
    } else {
      const answer = question.type === 'choice' ? question.options[question.answer] : question.answers[0];
      const line = text('p', 'Đáp án: ');
      line.append(english('strong', answer));
      feedback.append(line, text('p', question.explanation));
    }
    feedback.hidden = false;
    get('session-meter').value = session.results.length;
    action.textContent = session.results.length === session.ids.length ? 'Hoàn tất lượt học' : 'Câu tiếp theo';
    heading.focus();
  }

  function renderResult() {
    phase = 'summary';
    const result = finish(state, session, localDay(clock.now()));
    state = result.state;
    persist();
    renderDashboard();
    get('session-label').textContent = 'HOÀN THÀNH';
    const heading = text('h3', 'Bạn đã tiến thêm một bước!', 'prompt');
    heading.tabIndex = -1;
    const list = text('ul', '', 'results-list');
    const incorrect = result.total - result.correct;
    list.append(text('li', `${result.correct} / ${result.total} câu có đáp án đúng.`),
      text('li', `+${result.earned} điểm kinh nghiệm.`),
      text('li', incorrect ? `${incorrect} câu sai được đưa vào lượt ôn.` : 'Các câu đúng được lên lịch ôn lại.'));
    host.replaceChildren(heading, list);
    feedback.hidden = true;
    get('session-note').textContent = 'Viết tự do và luyện nói không được chấm điểm tự động.';
    action.textContent = 'Về lộ trình';
    heading.focus();
  }

  get('session-form').addEventListener('submit', (event) => {
    event.preventDefault();
    if (phase === 'summary') dialog.close();
    else if (phase === 'feedback') {
      if (currentQuestion(session)) renderQuestion();
      else renderResult();
    } else {
      const question = currentQuestion(session);
      const result = assess(question, readResponse());
      if (result) {
        session.results.push(result);
        renderFeedback(question, result);
      } else {
        error.textContent = {
          choice: 'Hãy chọn một đáp án.', fill: 'Hãy nhập đáp án.',
          write: `Hãy viết ít nhất ${question.minimum} từ cho bài này.`, speak: 'Hãy xác nhận bạn đã thử nói.',
        }[question.type];
        error.hidden = false;
        host.querySelector('input, textarea').focus();
      }
    }
  });
  get('close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    stopClock();
    // Remove media and drafts when leaving, including when the learner presses Escape.
    host.replaceChildren();
    feedback.replaceChildren();
    const previous = get(origin);
    (previous.disabled ? continueButton : previous).focus();
  });
  continueButton.addEventListener('click', () => start(continueButton.dataset.lesson, continueButton.id));
  reviewButton.addEventListener('click', () => start('review', reviewButton.id));
  goalSelect.addEventListener('change', () => {
    const goal = Number(goalSelect.value);
    if (goals.includes(goal)) {
      state = { ...state, goal };
      persist();
    }
    renderDashboard();
  });
  window.addEventListener('focus', () => {
    if (day !== localDay(clock.now())) renderDashboard();
  });
  window.addEventListener('storage', (event) => {
    if (event.key === storageKey || event.key === null) {
      state = readProgress(getStorage);
      renderDashboard();
    }
  });
  renderDashboard();
}
