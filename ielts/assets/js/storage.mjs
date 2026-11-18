/** Lưu trữ an toàn: bộ nhớ tạm cho test, localStorage cho trình duyệt. */
export function memoryStorage(seed = {}) {
  const data = { ...seed };
  return {
    get(key) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
    },
    set(key, value) {
      data[key] = value;
      return true;
    },
    remove(key) {
      delete data[key];
      return true;
    }
  };
}

export function browserStorage(ls) {
  return {
    get(key) {
      try { return ls.getItem(key); } catch { return null; }
    },
    set(key, value) {
      try { ls.setItem(key, value); return true; } catch { return false; }
    },
    remove(key) {
      try { ls.removeItem(key); return true; } catch { return false; }
    }
  };
}

export function loadState(storage, key, fallback) {
  if (!storage) return { ...fallback };
  try {
    const raw = storage.get(key);
    if (!raw) return { ...fallback };
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return { ...fallback };
  }
}

export function saveState(storage, key, state) {
  if (!storage) return false;
  try {
    return storage.set(key, JSON.stringify(state));
  } catch {
    return false;
  }
}
