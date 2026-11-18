import { dayKey, readState, writeState } from './study.mjs';
import { home, progress, review } from './ui/dashboard.mjs';
import { practice } from './ui/practice.mjs';

const views = { home, progress, review, practice };

export function mount(doc, window, now = dayKey) {
  const { state, available } = readState(window);
  const notice = doc.querySelector('[data-storage-notice]');
  notice.hidden = available;
  const runtime = {
    doc, window, state, now, today: now(),
    latest() {
      const loaded = readState(window);
      return loaded.available ? loaded.state : runtime.state;
    },
    save(next) {
      runtime.state = next;
      notice.hidden = writeState(window, next);
    },
  };
  views[doc.body.dataset.view](runtime);
}
