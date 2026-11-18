import { mount } from './study.js';

mount(document, window, {
  now: () => new Date(),
  setInterval: (tick, ms) => window.setInterval(tick, ms),
  clearInterval: (id) => window.clearInterval(id),
});
