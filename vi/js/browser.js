/* Kết nối trình duyệt: fetch dữ liệu, localStorage, giọng đọc, tải tệp, đồng hồ.
   Tệp này mỏng và không chứa logic nghiệp vụ nên được loại khỏi phạm vi coverage. */

import { createController, createInitialUi } from './app.js';
import { loadState, saveState, touchState } from './core/state.js';
import { dayKey } from './core/date.js';
import { rng } from './core/quiz.js';
import { statsHtml } from './views/layout.js';

const PAGE = document.body.dataset.page || 'dashboard';

async function fetchJson(path) {
  const response = await fetch(new URL(path, document.baseURI), { cache: 'no-cache' });
  if (!response.ok) throw new Error(`HTTP ${response.status} — ${path}`);
  return response.json();
}

function query(name) {
  return new URLSearchParams(window.location.search).get(name);
}

async function loadData() {
  const curriculum = await fetchJson('./data/curriculum.json');
  if (PAGE === 'lesson') {
    const lessonId = query('bai');
    let unit = null;
    let lesson = null;
    for (const candidate of curriculum.units) {
      const meta = candidate.lessons.find((item) => item.id === lessonId);
      if (meta) {
        unit = candidate;
        lesson = meta;
        break;
      }
    }
    if (!unit || !lesson) throw new Error('Không tìm thấy bài học trong lộ trình.');
    const detail = await fetchJson(`./data/units/${unit.id}.json`);
    const full = detail.lessons.find((item) => item.id === lesson.id);
    if (!full) throw new Error('Bài học chưa có nội dung.');
    return { curriculum, unit, lesson: full };
  }
  if (PAGE === 'dashboard') {
    const file = await fetchJson('./data/vocab.json');
    const vocab = file.words || [];
    const index = Math.floor(rng(`word-${dayKey(Date.now())}`)() * vocab.length);
    return { curriculum, vocab, wordOfDay: vocab[index] || null };
  }
  if (PAGE === 'practice') {
    const [vocabFile, prompts] = await Promise.all([
      fetchJson('./data/vocab.json'),
      fetchJson('./data/prompts.json'),
    ]);
    return { curriculum, vocab: vocabFile.words || [], prompts };
  }
  if (PAGE === 'library') {
    const [paperFile, pdfFile] = await Promise.all([
      fetchJson('./data/papers.json'),
      fetchJson('./data/pdfs.json'),
    ]);
    return { curriculum, papers: paperFile.papers || [], docs: pdfFile.docs || [] };
  }
  return { curriculum };
}

function speak(text, rate = 1) {
  if (!text || !('speechSynthesis' in window)) return;
  const utterance = new SpeechSynthesisUtterance(String(text));
  utterance.lang = 'en-GB';
  utterance.rate = rate;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function download(filename, content) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

let toastTimer = 0;
function notify(text) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.append(toast);
  }
  toast.textContent = text;
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

function renderStats(controller) {
  const holder = document.getElementById('stats');
  if (holder) holder.innerHTML = statsHtml(controller.getState(), Date.now());
}

async function main() {
  const root = document.getElementById('app');
  if (!root) return;
  const loaded = loadState(window.localStorage, Date.now());
  let state = touchState(loaded.state, Date.now());
  saveState(window.localStorage, state);

  let data;
  try {
    data = await loadData();
  } catch (error) {
    root.innerHTML = `<div class="shell-wrap"><div class="card"><h1>Chưa tải được nội dung</h1>
      <p class="muted">Ứng dụng cần chạy qua máy chủ tĩnh (GitHub Pages hoặc <code>python3 -m http.server</code>).
      Lỗi: ${String(error.message || error)}</p>
      <p><a class="btn btn--primary" href="./index.html">Về trang chủ</a></p></div></div>`;
    document.body.dataset.ready = 'true';
    return;
  }

  const controller = createController({
    page: PAGE,
    state,
    data,
    ui: createInitialUi({ page: PAGE, state, data, now: Date.now() }),
    deps: {
      now: () => Date.now(),
      persist: (next) => {
        state = next;
        saveState(window.localStorage, next);
        renderStats(controller);
      },
      speak,
      notify,
      download,
    },
  });

  const paint = (html) => {
    const focused = document.activeElement;
    const activeId = focused && focused.id ? focused.id : null;
    root.innerHTML = html;
    if (activeId) {
      const restored = document.getElementById(activeId);
      if (restored) restored.focus({ preventScroll: true });
    }
    renderStats(controller);
  };

  const apply = (result) => {
    if (result && typeof result.html === 'string') paint(result.html);
  };

  root.innerHTML = controller.html();
  renderStats(controller);

  root.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-action]');
    if (!trigger || trigger.tagName === 'FORM') return;
    if (trigger.closest('a[href]')) return;
    if (trigger.tagName === 'LABEL') return;
    event.preventDefault();
    apply(controller.dispatch(trigger.dataset.action, {
      value: trigger.dataset.value,
      kind: trigger.dataset.kind,
      topic: trigger.dataset.topic,
      slow: trigger.dataset.slow,
    }));
  });

  root.addEventListener('submit', (event) => {
    const form = event.target.closest('[data-action]');
    if (!form) return;
    event.preventDefault();
    const formData = new FormData(form);
    const text = formData.get('query') ?? formData.get('answer') ?? '';
    apply(controller.dispatch(form.dataset.action, { text: String(text), value: form.dataset.value }));
  });

  // Ghi nhớ nội dung đang gõ mà không vẽ lại (giữ nguyên vị trí con trỏ).
  root.addEventListener('input', (event) => {
    const input = event.target;
    if (!input.matches('input[name="answer"]')) return;
    const scope = input.id === 'dictation-input' ? 'dict' : 'lesson';
    controller.dispatch('draft', { text: input.value, scope });
  });

  root.addEventListener('change', async (event) => {
    const input = event.target;
    if (!input.matches('[data-import]')) return;
    const file = input.files && input.files[0];
    if (!file) return;
    const text = await file.text();
    apply(controller.dispatch('import-data', { text }));
  });

  window.setInterval(() => {
    if (!controller.getUi().timer) return;
    paint(controller.tick(Date.now()));
  }, 500);

  document.body.dataset.ready = 'true';
}

main();

// Đăng ký service worker để ứng dụng dùng được khi mất mạng (bỏ qua trên môi trường không hỗ trợ).
if ('serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
