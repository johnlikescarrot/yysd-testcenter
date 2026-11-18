(function () {
  'use strict';
  const questions = [
    { category: 'TỪ VỰNG · CONTEXT', question: 'Chọn từ phù hợp nhất để hoàn thành câu.', passage: 'The city plans to _____ public transport to reduce traffic congestion.', options: ['improve', 'ignore', 'prevent'], answer: 0, explanation: '“Improve public transport” nghĩa là cải thiện giao thông công cộng.' },
    { category: 'ĐỌC HIỂU · MAIN IDEA', question: 'Ý chính của đoạn văn là gì?', passage: 'A local library extended its opening hours. More students now use it to study in the evening.', options: ['The library has fewer visitors.', 'Longer hours help students study later.', 'Students prefer to study at home.'], answer: 1, explanation: 'Đoạn văn nói giờ mở cửa dài hơn giúp sinh viên sử dụng thư viện vào buổi tối.' },
    { category: 'TỪ VỰNG · COLLOCATION', question: 'Chọn cách kết hợp từ tự nhiên nhất.', passage: 'Researchers _____ a study on sleep and learning.', options: ['conducted', 'manufactured', 'borrowed'], answer: 0, explanation: '“Conduct a study” là cụm thường dùng, nghĩa là tiến hành một nghiên cứu.' },
    { category: 'WRITING · TASK 2', question: 'Trong IELTS Writing Task 2, bài viết cần tối thiểu bao nhiêu từ?', options: ['100 từ', '150 từ', '250 từ'], answer: 2, explanation: 'Theo IELTS, Task 2 yêu cầu tối thiểu 250 từ. Hãy dành thời gian phát triển và kiểm tra lập luận.' },
    { category: 'ĐỌC HIỂU · DETAIL', question: 'Theo đoạn văn, điều gì đã thay đổi?', passage: 'In 2020, 40% of commuters cycled to work. By 2024, the figure had risen to 55%.', options: ['The share of cyclists increased.', 'The share of cyclists decreased.', 'The share stayed the same.'], answer: 0, explanation: 'Tỷ lệ tăng từ 40% lên 55%, tức tăng 15 điểm phần trăm.' },
    { category: 'WRITING · COHERENCE', question: 'Từ nối nào thể hiện sự tương phản?', passage: 'The course is demanding. _____, many students find it rewarding.', options: ['For example', 'However', 'Therefore'], answer: 1, explanation: '“However” thể hiện sự tương phản giữa hai ý.' }
  ];
  const $ = id => document.getElementById(id);
  const key = 'yysd-ielts-vi-progress-v1';
  let state;
  let available = true;
  try { state = IeltsCore.clean(JSON.parse(localStorage.getItem(key) || 'null')); } catch (_) { state = IeltsCore.clean(null); available = false; }
  let index = 0;
  let score = 0;
  let answered = false;
  function showStats() {
    $('streak').textContent = IeltsCore.activeStreak(state, IeltsCore.dayKey());
    $('xp').textContent = state.xp;
    if (!available) $('storage-note').textContent = 'Không thể lưu tiến độ trên trình duyệt này; bạn vẫn có thể luyện tập.';
  }
  function render() {
    const q = questions[index];
    answered = false;
    $('step').textContent = `Câu ${index + 1} / ${questions.length}`;
    $('category').textContent = q.category;
    $('question').textContent = q.question;
    $('passage').textContent = q.passage || '';
    $('passage').hidden = !q.passage;
    $('feedback').textContent = '';
    $('next').hidden = true;
    $('answers').replaceChildren();
    $('progress').setAttribute('aria-valuenow', index);
    $('progress-fill').style.width = `${index / questions.length * 100}%`;
    q.options.forEach((option, choice) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'answer'; button.textContent = option;
      button.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const correct = choice === q.answer;
        if (correct) score++;
        button.classList.add(correct ? 'correct' : 'incorrect');
        $('feedback').textContent = `${correct ? 'Chính xác!' : 'Chưa đúng.'} ${q.explanation}`;
        $('answers').querySelectorAll('button').forEach(item => { item.disabled = true; });
        $('next').hidden = false;
        $('next').focus();
      });
      $('answers').appendChild(button);
    });
  }
  $('next').addEventListener('click', () => {
    index++;
    if (index < questions.length) { render(); $('question').setAttribute('tabindex', '-1'); $('question').focus(); return; }
    state = IeltsCore.record(state, IeltsCore.dayKey(), 10 + score * 5);
    try { localStorage.setItem(key, JSON.stringify(state)); } catch (_) { available = false; }
    showStats();
    $('progress').setAttribute('aria-valuenow', questions.length);
    $('progress-fill').style.width = '100%';
    $('step').textContent = 'Hoàn thành';
    $('category').textContent = 'BẠN ĐÃ HOÀN THÀNH';
    $('question').textContent = `Bạn trả lời đúng ${score} / ${questions.length} câu.`;
    $('question').setAttribute('tabindex', '-1'); $('question').focus();
    $('passage').hidden = true; $('answers').replaceChildren();
    $('feedback').textContent = `Bạn nhận được ${10 + score * 5} điểm. Hãy quay lại vào ngày mai để duy trì thói quen.`;
    $('next').hidden = true;
    const retry = document.createElement('button'); retry.type = 'button'; retry.className = 'button'; retry.textContent = 'Luyện lại';
    retry.addEventListener('click', () => { index = 0; score = 0; render(); $('question').focus(); });
    $('answers').appendChild(retry);
  });
  showStats(); render();
}());
