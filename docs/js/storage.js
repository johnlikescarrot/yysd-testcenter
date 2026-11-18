import { createInitialState } from './state.js';

export const STORAGE_KEY = 'yysd-vi-ielts-state';

export function loadState(storage, day) {
  const fallback = createInitialState(day);
  let raw = null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch (error) {
    return fallback;
  }
  if (raw === null) return fallback;
  let parsed = null;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
  if (parsed === null) return fallback;
  if (typeof parsed !== 'object') return fallback;
  if (typeof parsed.xp !== 'number') return fallback;
  return Object.assign(fallback, parsed);
}

export function saveState(storage, state) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    return false;
  }
}
