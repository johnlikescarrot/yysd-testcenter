import test from 'node:test';
import assert from 'node:assert/strict';
import { statsHtml, goalRing, goalPicker, bar, levelCard, methodNote, emptyState, wordCard, timerHtml, footerNote } from '../js/views/layout.js';
import { icon } from '../js/views/icons.js';
import { renderDashboard } from '../js/views/dashboard.js';
import { renderLearn } from '../js/views/learn.js';
import { renderLesson } from '../js/views/lesson.js';
import { renderPractice } from '../js/views/practice.js';
import { renderProgress } from '../js/views/progress.js';
import { renderLibrary } from '../js/views/library.js';
import { createInitialState, touchState } from '../js/core/state.js';
import { CURRICULUM, VOCAB, PROMPTS, PAPERS, DOCS, lessonData } from './helpers/fixtures.mjs';

const NOW = new Date('2026-11-18T09:00:00').getTime();
const state = () => ({ ...touchState(createInitialState(NOW), NOW), combo: 5 });
const data = { curriculum: CURRICULUM, vocab: VOCAB, prompts: PROMPTS, papers: PAPERS, docs: DOCS, wordOfDay: VOCAB[0] };

test('icon trả về SVG và có biểu tượng dự phòng', () => {
  assert.match(icon('flame'), /^<svg/);
  assert.match(icon('khong-co', 'big'), /class="big"/);
  assert.match(icon('info'), /aria-hidden="true"/);
});

test('statsHtml hiển thị chuỗi, XP, đá quý và tim', () => {
  const html = statsHtml(state(), NOW);
  assert.match(html, /stat--streak/);
  assert.match(html, /stat--dp|stat--xp/);
  assert.match(html, /Đã đầy/);
});

test('goalRing, goalPicker và bar', () => {
  const html = goalRing({ ...state(), goal: 40 }, NOW);
  assert.match(html, /Mục tiêu hôm nay/);
  assert.match(html, /stroke-dasharray/);
  assert.match(goalPicker({ goal: 60 }), /aria-pressed="true"[^>]*>60 XP/);
  assert.match(bar(0.42, 'Reading'), /width:42.0%/);
  assert.match(bar(2, 'Vượt'), /width:100.0%/);
});

test('levelCard hiển thị cấp và cấp kế tiếp', () => {
  assert.match(levelCard({ xp: 0 }), /lên cấp 2/);
  assert.match(levelCard({ xp: 999999 }), /cấp cao nhất/);
});

test('methodNote và emptyState', () => {
  const note = methodNote({ title: 'Tiêu đề', text: 'Nội dung', cite: 'Nguồn A' });
  assert.match(note, /Tiêu đề/);
  assert.match(note, /Nguồn: Nguồn A/);
  assert.match(methodNote({ title: 'T', text: 'X' }), /callout/);
  assert.match(emptyState({ title: 'Trống', text: 'Chưa có', action: { href: './x.html', label: 'Đi' } }), /href="\.\/x.html"/);
  assert.match(emptyState({ title: 'Trống', text: 'Chưa có' }), /Trống/);
});

test('wordCard xử lý từ thiếu và từ đã có thẻ', () => {
  assert.equal(wordCard(null, {}), '');
  assert.match(wordCard(VOCAB[0], {}), /Thẻ mới/);
  assert.match(wordCard(VOCAB[0], { analyse: { due: NOW } }), /analyse/);
});

test('timerHtml và footerNote', () => {
  assert.equal(timerHtml(null), '');
  assert.match(timerHtml({ kind: 'prep', topic: 'Chủ đề', label: '00:59' }), /Chuẩn bị/);
  assert.match(timerHtml({ kind: 'speak', label: '01:00' }), /Nói/);
  assert.match(footerNote(2026), /2026/);
});

test('renderDashboard có bài kế tiếp và không còn bài', () => {
  const html = renderDashboard({ state: state(), data, now: NOW });
  assert.match(html, /Một bài ngắn, một bước tiến/);
  assert.match(html, /bai-hoc\.html\?bai=lesson-1/);
  assert.match(html, /Nhiệm vụ hôm nay/);
  assert.match(html, /Hạng đấu tuần này/);

  const done = state();
  done.lessonsDone = { 'lesson-1': {}, 'lesson-2': {}, 'lesson-3': {} };
  const finished = renderDashboard({ state: done, data, now: NOW });
  assert.match(finished, /Bạn đã đi hết lộ trình/);
  assert.match(finished, /luyen-tap\.html/);
});

test('renderDashboard hiển thị nút hồi phục khi chuỗi đã đứt', () => {
  const broken = { ...state(), lastStudyDay: '2026-11-10', streak: 4, gems: 1000 };
  assert.match(renderDashboard({ state: broken, data, now: NOW }), /data-action="repair-streak"/);
});

test('renderLearn phân biệt đơn vị đang học, đã xong và khoá', () => {
  const html = renderLearn({ state: state(), data });
  assert.match(html, /Lộ trình 8 chương/);
  assert.match(html, /node--current/);
  assert.match(html, /node--locked/);
  assert.match(html, /aria-disabled="true"/);

  const finished = { ...state(), lessonsDone: { 'lesson-1': { accuracy: 1 }, 'lesson-2': { accuracy: 1 } } };
  const html2 = renderLearn({ state: finished, data });
  assert.match(html2, /node--done/);
  assert.match(html2, /Hoàn thành/);
});

test('renderLesson hiển thị từng dạng câu hỏi', () => {
  const base = {
    state: state(),
    data: lessonData(),
    ui: { index: 0, selected: [], draft: '', feedback: null, results: [], hint: false, finished: false, summary: null, tokens: [] },
    now: NOW,
  };
  const mcq = renderLesson({ ...base, data: { ...lessonData(), lesson: { ...lessonData().lesson, exercises: [{ id: 'a', type: 'mcq', skill: 'reading', prompt: 'Chọn', stem: 'Câu', options: ['A', 'B'], answer: 1, explain: 'Vì B' }] } } });
  assert.match(mcq, /data-action="choose-option"/);
  assert.match(mcq, /Kiểm tra/);

  const gap = renderLesson({ ...base, data: { ...lessonData(), lesson: { ...lessonData().lesson, exercises: [{ id: 'b', type: 'gap', skill: 'reading', prompt: 'Điền', stem: 'The ___ end.', answer: 'answer', explain: 'Giải thích' }] } } });
  assert.match(gap, /class="blank"/);
  assert.match(gap, /name="answer"/);

  const build = renderLesson({ ...base, data: { ...lessonData(), lesson: { ...lessonData().lesson, exercises: [{ id: 'c', type: 'build', skill: 'reading', prompt: 'Xếp', words: ['a', 'b'], answer: 'a b', explain: 'x' }] } }, ui: { ...base.ui, tokens: [{ id: '1-a', text: 'a' }, { id: '2-b', text: 'b' }], selected: ['1-a'] } });
  assert.match(build, /data-action="select-token"/);
  assert.match(build, /data-action="undo-token"/);

  const listen = renderLesson({ ...base, data: { ...lessonData(), lesson: { ...lessonData().lesson, exercises: [{ id: 'd', type: 'listen', skill: 'listening', prompt: 'Nghe', audio: 'Hello.', answer: 'Hello.', explain: 'x' }] } } });
  assert.match(listen, /data-action="play-audio"/);
});

test('renderLesson hiện gợi ý, phản hồi và tổng kết', () => {
  const dataLesson = { ...lessonData(), lesson: { ...lessonData().lesson, exercises: [{ id: 'a', type: 'mcq', skill: 'reading', prompt: 'Chọn', stem: 'Câu', options: ['A', 'B'], answer: 1, explain: 'Vì B', hint: 'Gợi ý riêng' }] } };
  const hint = renderLesson({ state: state(), data: dataLesson, ui: { index: 0, selected: [], draft: '', feedback: null, results: [true], hint: true, finished: false, summary: null, tokens: [] }, now: NOW });
  assert.match(hint, /Gợi ý riêng/);

  const ok = renderLesson({ state: state(), data: dataLesson, ui: { index: 0, selected: [1], feedback: { correct: true, expected: 'B', given: 'B' }, results: [true], hint: false, finished: false, summary: null, tokens: [] }, now: NOW });
  assert.match(ok, /feedback--ok/);
  assert.match(ok, /data-action="next"/);

  const bad = renderLesson({ state: state(), data: dataLesson, ui: { index: 0, selected: [0], feedback: { correct: false, expected: 'B', given: 'A' }, results: [false], hint: false, finished: false, summary: null, tokens: [] }, now: NOW });
  assert.match(bad, /feedback--bad/);
  assert.match(bad, /Đáp án đúng/);

  const summaryUi = {
    index: 0, selected: [], draft: '', feedback: null, results: [true], hint: false, finished: true,
    summary: { score: { correct: 1, total: 1, accuracy: 1, bestCombo: 1 }, xp: 15, gems: 5, unlocked: [{ title: 'Bước đầu tiên' }], next: { lesson: { id: 'lesson-2' } } },
    tokens: [],
  };
  const summary = renderLesson({ state: state(), data: dataLesson, ui: summaryUi, now: NOW });
  assert.match(summary, /Hoàn hảo/);
  assert.match(summary, /Mở khoá thành tựu/);
  assert.match(summary, /bai-hoc\.html\?bai=lesson-2/);

  const lastLesson = renderLesson({ state: state(), data: dataLesson, ui: { ...summaryUi, summary: { ...summaryUi.summary, unlocked: [], next: null } }, now: NOW });
  assert.match(lastLesson, /Xem lộ trình/);
  assert.doesNotMatch(lastLesson, /bai-hoc\.html\?bai=lesson-2/);
  assert.match(lastLesson, /Ôn từ vựng/);
});

test('renderLesson chặn khi hết tim', () => {
  const html = renderLesson({ state: { ...state(), hearts: 0, gems: 100 }, data: lessonData(), ui: { index: 0, tokens: [], results: [] }, now: NOW });
  assert.match(html, /Bạn đã dùng hết trái tim/);
  assert.match(html, /data-action="refill-hearts"/);
});

test('renderPractice: thẻ từ vựng đủ trạng thái', () => {
  const ui = { mode: 'the', queue: VOCAB.map((w) => w.id), pos: 0, revealed: false, dict: { wordId: VOCAB[0].id, draft: '', feedback: null }, writingTask: 0, writingOpen: null, speakingOpen: null, timer: null, now: NOW };
  const html = renderPractice({ state: state(), data, ui });
  assert.match(html, /Thẻ từ vựng/);
  assert.match(html, /data-action="reveal-card"/);
  assert.match(html, /data-action="play-word"/);

  const revealed = renderPractice({ state: state(), data, ui: { ...ui, revealed: true } });
  assert.match(revealed, /data-action="grade-card"/);
  assert.match(revealed, /Kết hợp/);

  const empty = renderPractice({ state: state(), data: { ...data, vocab: [] }, ui: { ...ui, queue: [] } });
  assert.match(empty, /Chưa có thẻ để ôn/);

  const finished = renderPractice({ state: state(), data, ui: { ...ui, pos: 4 } });
  assert.match(finished, /Đã ôn xong lượt này/);

  const missing = renderPractice({ state: state(), data, ui: { ...ui, queue: ['ghost'], pos: 0 } });
  assert.match(missing, /Thẻ không còn trong kho/);
});

test('renderPractice: nghe chép với phản hồi đúng và sai', () => {
  const ui = { mode: 'nghe', queue: [VOCAB[0].id], pos: 0, revealed: false, dict: { wordId: VOCAB[0].id, draft: '', feedback: null }, writingTask: 0, writingOpen: null, speakingOpen: null, timer: null, now: NOW };
  const html = renderPractice({ state: state(), data, ui });
  assert.match(html, /data-action="check-dictation"/);
  assert.match(html, /data-action="play-word"/);

  const right = renderPractice({ state: state(), data, ui: { ...ui, dict: { ...ui.dict, draft: 'analyse', feedback: { correct: true, expected: 'analyse' } } } });
  assert.match(right, /feedback--ok/);
  assert.match(right, /data-action="next-dictation"/);

  const wrong = renderPractice({ state: state(), data, ui: { ...ui, dict: { ...ui.dict, feedback: { correct: false, expected: 'analyse' } } } });
  assert.match(wrong, /feedback--bad/);

  const noWord = renderPractice({ state: state(), data, ui: { ...ui, dict: { wordId: null, draft: '', feedback: null } } });
  assert.match(noWord, /Chưa có từ để nghe/);
});

test('renderPractice: viết luận, speaking và hẹn giờ', () => {
  const ui = { mode: 'viet', queue: [], pos: 0, revealed: false, dict: {}, writingTask: 0, writingOpen: 'w1', speakingOpen: null, timer: { kind: 'speak', topic: 'Đề', label: '19:00' }, now: NOW };
  const writing = renderPractice({ state: state(), data, ui });
  assert.match(writing, /Viết luận IELTS/);
  assert.match(writing, /Dàn ý/);
  assert.match(writing, /data-action="start-timer"/);
  assert.match(writing, /19:00/);

  const task2 = renderPractice({ state: state(), data, ui: { ...ui, writingTask: 2, writingOpen: null } });
  assert.match(task2, /Đề hai/);
  assert.doesNotMatch(task2, /Đề một/);

  const speaking = renderPractice({ state: state(), data, ui: { ...ui, mode: 'noi', speakingOpen: 's1', timer: null } });
  assert.match(speaking, /Speaking có hẹn giờ/);
  assert.match(speaking, /Bài nói mẫu/);
  assert.match(speaking, /Chuẩn bị 1 phút/);
  assert.match(speaking, /Thu gọn/);

  const closed = renderPractice({ state: state(), data, ui: { ...ui, mode: 'noi', speakingOpen: null } });
  assert.match(closed, /Mở cue card/);
});

test('renderProgress hiển thị số liệu và sao lưu', () => {
  const rich = { ...state(), xp: 800, streak: 4, lessonsDone: { 'lesson-1': {} }, skills: { reading: { correct: 30, total: 40 } }, cards: { analyse: { due: NOW, interval: 25 } }, achievements: { 'first-lesson': NOW }, history: [{ day: '2026-11-18', xp: 30 }] };
  const html = renderProgress({ state: rich, data, now: NOW });
  assert.match(html, /Tiến độ của bạn/);
  assert.match(html, /Band ước lượng/);
  assert.match(html, /Thành tựu/);
  assert.match(html, /Bảng hạng tuần/);
  assert.match(html, /data-action="export-data"/);
  assert.match(html, /data-import/);
  assert.match(html, /heat-cell/);
  assert.match(html, /Mục tiêu 7.0/);
});

test('renderLibrary: tài liệu, tìm kiếm và lọc', () => {
  const ui = { query: '', tag: 'all' };
  const html = renderLibrary({ data, ui });
  assert.match(html, /Thư viện PDF/);
  assert.match(html, /Google Scholar/);
  assert.match(html, /cam-nang\.pdf/);
  assert.match(html, /data-action="filter-tag"/);

  const filtered = renderLibrary({ data, ui: { query: 'cepeda', tag: 'all' } });
  assert.match(filtered, /Distributed practice/);
  assert.match(filtered, /data-action="clear-search"/);

  const none = renderLibrary({ data, ui: { query: 'zzzz', tag: 'all' } });
  assert.match(none, /Không tìm thấy trích dẫn/);

  const byTag = renderLibrary({ data, ui: { query: '', tag: 'tu-vung' } });
  assert.match(byTag, /aria-pressed="true"[^>]*>Từ vựng/);
});
