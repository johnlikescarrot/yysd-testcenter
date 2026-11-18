/* Pure learning-state helpers shared by the page and its tests. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.IeltsCore = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DAY = 86400000;
  function dayKey(date) {
    const d = date || new Date();
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
  }
  function dayNumber(key) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key || '')) return null;
    const [year, month, day] = key.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
    return date.getTime() / DAY;
  }
  function clean(raw) {
    const value = raw && typeof raw === 'object' ? raw : {};
    const number = n => Number.isSafeInteger(n) && n >= 0 ? n : 0;
    return { xp: number(value.xp), streak: number(value.streak), lastDay: dayNumber(value.lastDay) === null ? '' : value.lastDay };
  }
  function record(raw, today, points) {
    const state = clean(raw);
    const current = dayNumber(today);
    if (current === null) return state;
    const last = dayNumber(state.lastDay);
    const streak = last === current ? state.streak : last === current - 1 ? state.streak + 1 : 1;
    const reward = Number.isSafeInteger(points) && points > 0 ? points : 0;
    return { xp: state.xp + reward, streak, lastDay: today };
  }
  function activeStreak(raw, today) {
    const state = clean(raw);
    const current = dayNumber(today);
    const last = dayNumber(state.lastDay);
    return current !== null && last !== null && (last === current || last === current - 1) ? state.streak : 0;
  }
  return { dayKey, dayNumber, clean, record, activeStreak };
}));
