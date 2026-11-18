import { allQuestions, findLesson, lessons } from './ielts-vi-data.mjs';
import { completeLesson, dueQuestions, loadProgress, localDay, saveProgress } from './ielts-vi-core.mjs';

const byId = (id) => document.getElementById(id);
let storage;
try { storage = window.localStorage; } catch { storage = null; }
const { progress } = loadProgress(storage);
const today = localDay();
const lessonId = new URLSearchParams(window.location.search).get('lesson') || 'vocabulary';
const lesson = findLesson(lessonId);
const questions = lessonId === 'review' ? dueQuestions(progress, allQuestions, today).slice(0, 8) : lesson?.questions;
const answers = [];
let index = 0;
let checked = false;

function showEmpty(title, message) {
  byId('study-loading').hidden = true;
  byId('study-empty').hidden = false;
  byId('empty-title').textContent = title;
  byId('empty-message').textContent = message;
}

function shuffledOptions(question) {
  const options = question.options.map((text, originalIndex) => ({ text, originalIndex }));
  for (let i = options.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}

function renderQuestion() {
  const question = questions[index];
  checked = false;
  byId('lesson-label').textContent = lesson ? lesson.label : 'ÔN TẬP';
  byId('lesson-title').textContent = lesson ? lesson.title : 'Ôn tập đến hạn';
  byId('question-count').textContent = `Câu ${index + 1} / ${questions.length}`;
  byId('question-title').textContent = question.prompt;
  const context = byId('question-context');
  context.hidden = !question.context;
  context.textContent = question.context || '';
  const progressValue = Math.round(index / questions.length * 100);
  byId('question-progress').setAttribute('aria-valuenow', String(progressValue));
  byId('question-progress-bar').style.width = `${progressValue}%`;
  const audioTools = byId('audio-tools');
  audioTools.hidden = !question.audio;
  byId('audio-transcript').hidden = true;
  byId('audio-transcript').textContent = question.audio || '';
  byId('play-audio').hidden = !('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window);
  const fieldset = byId('answer-options');
  fieldset.replaceChildren();
  const legend = document.createElement('legend');
  legend.textContent = 'Chọn một câu trả lời';
  fieldset.append(legend);
  shuffledOptions(question).forEach((option) => {
    const label = document.createElement('label');
    label.className = 'answer-option';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'answer';
    input.value = String(option.originalIndex);
    const text = document.createElement('span');
    text.textContent = option.text;
    if (question.optionLanguage) text.lang = question.optionLanguage;
    label.append(input, text);
    fieldset.append(label);
  });
  byId('answer-feedback').hidden = true;
  byId('check-answer').disabled = true;
  byId('check-answer').hidden = false;
  byId('next-question').hidden = true;
  if (index > 0) byId('question-title').focus();
}

function finish() {
  const result = completeLesson(progress, lessonId, answers, localDay());
  const saved = saveProgress(storage, result.progress);
  byId('study-exercise').hidden = true;
  byId('study-result').hidden = false;
  byId('result-summary').textContent = `Bạn trả lời đúng ${result.correct} / ${questions.length} câu. Hãy tiếp tục theo nhịp của riêng mình.`;
  byId('result-xp').textContent = `+${result.earned} XP`;
  if (!saved) byId('result-storage').textContent = 'Không thể lưu tiến độ trên thiết bị. Hãy kiểm tra cài đặt lưu trữ của trình duyệt.';
  const currentIndex = lessons.findIndex((item) => item.id === lessonId);
  const next = currentIndex >= 0 ? lessons[currentIndex + 1] : null;
  const nextLink = byId('next-lesson');
  if (next) {
    nextLink.href = `study.html?lesson=${encodeURIComponent(next.id)}`;
  } else {
    nextLink.hidden = true;
  }
  byId('result-title').focus();
}

if (!questions) {
  showEmpty('Không tìm thấy bài học.', 'Hãy chọn một bài trong lộ trình để tiếp tục.');
} else if (!questions.length) {
  showEmpty('Chưa có câu nào đến hạn.', 'Sau khi hoàn thành một bài học, các câu hỏi sẽ xuất hiện ở đây theo lịch ôn tập.');
} else {
  byId('study-loading').hidden = true;
  byId('study-exercise').hidden = false;
  byId('answer-form').addEventListener('change', () => { byId('check-answer').disabled = false; });
  byId('answer-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const selected = document.querySelector('input[name="answer"]:checked');
    if (!selected || checked) return;
    checked = true;
    const question = questions[index];
    const correct = Number(selected.value) === question.answer;
    answers.push({ id: question.id, correct });
    document.querySelectorAll('input[name="answer"]').forEach((input) => {
      input.disabled = true;
      if (Number(input.value) === question.answer) input.closest('label').classList.add('is-correct');
      else if (input.checked) input.closest('label').classList.add('is-incorrect');
    });
    const feedback = byId('answer-feedback');
    feedback.className = correct ? 'feedback feedback--correct' : 'feedback feedback--incorrect';
    byId('feedback-title').textContent = correct ? 'Chính xác!' : `Cùng xem lại nhé. Đáp án: ${question.options[question.answer]}`;
    byId('feedback-explanation').textContent = question.explanation;
    feedback.hidden = false;
    byId('check-answer').hidden = true;
    byId('next-question').hidden = false;
    byId('next-question').focus();
  });
  byId('next-question').addEventListener('click', () => {
    index += 1;
    if (index === questions.length) finish();
    else renderQuestion();
  });
  byId('play-audio').addEventListener('click', () => {
    const utterance = new SpeechSynthesisUtterance(questions[index].audio);
    utterance.lang = 'en-GB';
    utterance.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  });
  byId('show-transcript').addEventListener('click', () => { byId('audio-transcript').hidden = false; });
  renderQuestion();
}
