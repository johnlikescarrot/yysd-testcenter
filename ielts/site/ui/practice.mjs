import { graded, lessonById, skills } from '../catalog.mjs';
import { dailyPoints, dueItems, finishPractice, isCorrect, nextLesson } from '../study.mjs';
import { emptyState, escape, icon, lessonLink } from './html.mjs';

function context(lesson) {
  const { source } = lesson;
  if (!source) return '';
  const paragraphs = source.body.map((text) => `<p lang="en">${escape(text)}</p>`).join('');
  return `<aside class="source-paper" aria-label="Ngữ liệu luyện tập"><p class="eyebrow">${source.audio ? 'ĐOẠN NGHE' : 'NGỮ LIỆU'}</p>
    <h2 lang="en">${escape(source.title)}</h2>${source.audio ? `<audio controls preload="none" aria-label="Bản nghe tiếng Anh"><source src="media/${source.audio}" type="audio/mpeg"></audio>
      <p class="mini-note">Giọng đọc tổng hợp. Bạn có thể nghe lại hoặc mở lời thoại.</p>
      <details><summary>Lời thoại tiếng Anh</summary>${paragraphs}</details>` : paragraphs}</aside>`;
}

function answers(item) {
  if (item.kind === 'choice') {
    return `<div class="choices">${item.options.map((option, i) => `<label class="choice">
      <input type="radio" name="response" value="${escape(option)}" required><span class="choice-key" aria-hidden="true">${String.fromCharCode(65 + i)}</span>
      <span lang="en">${escape(option)}</span></label>`).join('')}</div>`;
  }
  if (item.kind === 'input') {
    return `<label class="field-label" for="response">Câu trả lời bằng tiếng Anh</label>
      <input type="text" id="response" name="response" lang="en" autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="120" required>`;
  }
  if (item.kind === 'write') {
    return `<label class="field-label" for="draft">Bản nháp (không lưu)</label>
      <textarea id="draft" lang="en" rows="4" maxlength="1800"></textarea>
      <p class="mini-note">Viết bằng tiếng Anh, rồi đối chiếu với mẫu. Ứng dụng không chấm điểm đoạn viết tự do.</p>`;
  }
  return '<p class="spoken-instruction">Hãy nói thành tiếng trước khi xem mẫu. Ứng dụng không thu âm hay chấm phát âm.</p>';
}

function explanation(item, correct) {
  if (!graded(item)) {
    return `<section class="feedback" aria-labelledby="feedback-title"><h2 id="feedback-title" tabindex="-1">Gợi ý tự đối chiếu</h2>
      <p class="model" lang="en">${escape(item.model)}</p><p>${escape(item.explain)}</p></section>`;
  }
  return `<section class="feedback ${correct ? 'feedback--correct' : 'feedback--retry'}" aria-labelledby="feedback-title">
    <h2 id="feedback-title" tabindex="-1">${correct ? 'Chính xác!' : 'Chưa chính xác'}</h2>
    <p><strong>${correct ? 'Đáp án' : 'Đáp án gợi ý'}:</strong> <span lang="en">${escape(item.answers[0])}</span></p>
    <p>${escape(item.explain)}</p></section>`;
}

function summary(doc, target, lesson, results, xp) {
  const correct = results.filter((item) => item.correct).length;
  const heading = lesson ? 'Đã hoàn thành bài luyện!' : 'Đã hoàn thành lượt ôn!';
  target.innerHTML = `<section class="panel lesson-result" aria-labelledby="result-title">
    <span class="tile tile--award">${icon('award')}</span><h1 id="result-title" tabindex="-1">${heading}</h1>
    <p>${correct} / ${results.length} câu làm đúng <span aria-hidden="true">·</span> <strong>+${xp} XP</strong></p>
    <p class="mini-note">Câu đúng chỉ nhận XP một lần mỗi ngày. Kết quả luyện tập không quy đổi sang band IELTS.</p>
    <div class="lesson-actions"><a class="button" href="./#lo-trinh">Về lộ trình ${icon('arrow')}</a>
    <a class="button button--quiet" href="review.html">Xem lịch ôn</a></div></section>`;
  doc.querySelector('#result-title').focus();
}

export function practice(runtime) {
  const { doc, window, state } = runtime;
  const params = new URL(window.location.href).searchParams;
  const reviewing = params.has('on-tap');
  const lesson = reviewing ? null : lessonById.get(params.get('bai'));
  const queue = reviewing ? dueItems(state, runtime.today) : lesson?.items.map((item) => ({ item, lesson }));
  const root = doc.querySelector('[data-view-content]');
  if (!queue?.length) {
    root.innerHTML = emptyState('compass', reviewing ? 'Không có câu đến hạn' : 'Không tìm thấy bài luyện', reviewing
      ? 'Hãy quay lại sau hoặc luyện một bài trong lộ trình.' : 'Liên kết có thể đã thay đổi. Chọn một bài để bắt đầu.',
    reviewing ? 'review.html' : lessonLink(nextLesson(state).id), reviewing ? 'Về lịch ôn' : 'Mở bài gợi ý');
    return;
  }
  const title = reviewing ? 'Ôn tập theo lịch' : lesson.title;
  doc.title = `${title} · IELTS Mỗi Ngày`;
  root.innerHTML = `<header class="lesson-head"><p class="eyebrow">${reviewing ? 'ÔN TẬP' : `${skills[lesson.skill].label.toUpperCase()} · ${lesson.minutes} PHÚT`}</p>
    <h1>${title}</h1><p>${reviewing ? 'Gợi nhớ trước khi xem đáp án.' : lesson.intro}</p>
    <div class="lesson-meter"><progress aria-label="Số câu đã kiểm tra" max="${queue.length}" value="0"></progress><span data-counter></span></div></header>
    <div class="lesson-layout"><div data-context></div><form class="panel question-panel" novalidate>
      <fieldset></fieldset><p class="form-message" role="status"></p><div data-feedback></div>
      <button class="button" type="submit"></button></form></div>`;
  const form = root.querySelector('form');
  const fieldset = form.querySelector('fieldset');
  const status = form.querySelector('[role="status"]');
  const feedback = form.querySelector('[data-feedback]');
  const button = form.querySelector('button');
  const progress = root.querySelector('progress');
  const results = [];
  let position = 0;
  let checked = false;
  let lastSource;

  function render() {
    const task = queue[position];
    const { item } = task;
    if (task.lesson !== lastSource) {
      root.querySelector('[data-context]').innerHTML = context(task.lesson);
      lastSource = task.lesson;
    }
    root.querySelector('[data-counter]').textContent = `Câu ${position + 1} / ${queue.length}`;
    fieldset.disabled = false;
    fieldset.innerHTML = `<legend lang="en" tabindex="-1">${escape(item.prompt)}</legend>${answers(item)}`;
    feedback.innerHTML = '';
    status.textContent = '';
    button.innerHTML = `${graded(item) ? 'Kiểm tra' : 'Xem mẫu'} ${icon('arrow')}`;
    checked = false;
  }

  function check() {
    const { item } = queue[position];
    let correct;
    if (graded(item)) {
      const response = new window.FormData(form).get('response');
      if (!response?.trim()) {
        status.textContent = item.kind === 'choice' ? 'Hãy chọn một đáp án.' : 'Hãy nhập câu trả lời.';
        fieldset.querySelector('input').focus();
        return;
      }
      correct = isCorrect(item, response);
      results.push({ id: item.id, correct });
    }
    checked = true;
    status.textContent = '';
    fieldset.disabled = true;
    feedback.innerHTML = explanation(item, correct);
    progress.value = position + 1;
    button.innerHTML = `${position + 1 === queue.length ? 'Hoàn thành' : 'Câu tiếp theo'} ${icon('arrow')}`;
    feedback.querySelector('h2').focus();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!checked) {
      check();
      return;
    }
    position += 1;
    if (position < queue.length) {
      render();
      fieldset.querySelector('legend').focus();
      return;
    }
    const today = runtime.now();
    const latest = runtime.latest();
    const updated = finishPractice(latest, lesson?.id, results, today);
    runtime.save(updated);
    summary(doc, root, lesson, results, dailyPoints(updated, today) - dailyPoints(latest, today));
  });
  render();
}
