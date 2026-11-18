/* =========================================================================
   boot.js — khởi động trang: nạp dữ liệu, gắn controller, đăng ký PWA.
   Tất cả dependency có thể truyền vào để test bằng jsdom.
   ========================================================================= */

import { createStore } from "./store.js";
import { initHome } from "./page-home.js";
import { initLesson } from "./page-lesson.js";
import { initLibrary } from "./page-library.js";
import { initLeague } from "./page-league.js";
import { initProfile } from "./page-profile.js";
import { initPractice } from "./page-practice.js";
import { loadJson, markActiveNav, setText, showBanner } from "./page-common.js";
import { registerServiceWorker, watchConnectivity } from "./pwa.js";
import { buildSession, findLesson, nextLesson, practiceSession } from "./quiz.js";
import { dueCards } from "./srs.js";
import { dayKey, hashString } from "./util.js";

export const LESSONS_URL = "data/lessons.json";
export const LIBRARY_URL = "data/library.json";

/** Lấy tham số ?bai=...&ky-nang=... */
export function urlParams(search) {
  return new URLSearchParams(search || "");
}

/** Tải JSON qua fetch, trả về fallback nếu lỗi. */
export async function fetchJson(fetchImpl, url, fallback) {
  if (typeof fetchImpl !== "function") return fallback;
  try {
    const response = await fetchImpl(url);
    if (!response || !response.ok) return fallback;
    return await response.json();
  } catch {
    return fallback;
  }
}

/** Dựng phiên học từ URL (?bai=<id> hoặc ?bai=practice&ky-nang=...). */
export function sessionFromParams(units, store, params, now) {
  const requested = params.get("bai");
  if (requested === "practice") {
    const skill = params.get("ky-nang") || "all";
    const dueIds = dueCards(store.get().srs, now).map((card) => card.id);
    return practiceSession(units, {
      skill,
      seed: hashString(`${skill}-${dayKey(now)}`),
      size: 10,
      dueIds
    });
  }
  const lesson = findLesson(units, requested) || nextLesson(units, store.get().completed);
  if (!lesson) {
    return { id: "empty", lessonId: "", unitId: "", title: "Bài học", questions: [] };
  }
  return buildSession(lesson, { seed: hashString(lesson.id) });
}

/** Khởi động trang hiện tại. */
export async function bootPage(env = {}) {
  const doc = env.document || globalThis.document;
  const win = env.window || globalThis.window;
  const fetchImpl = env.fetch || (typeof globalThis.fetch === "function" ? globalThis.fetch.bind(globalThis) : null);
  const now = env.now instanceof Date ? env.now : new Date(env.now ?? Date.now());
  const page = doc?.body?.dataset?.page || "";
  const store = env.store || createStore({ storage: win?.localStorage ?? null, now: () => now });
  const params = urlParams(env.search ?? win?.location?.search);
  markActiveNav(doc);

  let result = null;
  const needsUnits = page === "home" || page === "practice" || page === "lesson" || page === "profile";
  const needsDocs = page === "home" || page === "library";
  const unitsData = needsUnits ? await fetchJson(fetchImpl, LESSONS_URL, { units: [] }) : { units: [] };
  const docsData = needsDocs ? await fetchJson(fetchImpl, LIBRARY_URL, { docs: [] }) : { docs: [] };
  const units = unitsData.units || [];
  const docs = docsData.docs || [];

  if (page === "home") {
    result = initHome({ document: doc, store, units, docs, now });
  } else if (page === "practice") {
    result = initPractice({ document: doc, store, units, now });
  } else if (page === "lesson") {
    const session = sessionFromParams(units, store, params, now);
    setText(doc, "#lesson-title", session.title || "Bài học");
    if (doc) doc.title = `${session.title || "Bài học"} · IELTS Việt`;
    result = initLesson({ document: doc, store, session, now: () => now, speech: env.speech });
  } else if (page === "library") {
    result = initLibrary({ document: doc, store, docs, now });
  } else if (page === "league") {
    result = initLeague({ document: doc, store, now });
  } else if (page === "profile") {
    result = initProfile({ document: doc, store, units, now });
  }

  if (env.register !== false) {
    await registerServiceWorker(win?.navigator, { url: "./assets/js/sw.js" });
  }
  let unwatch = null;
  if (env.watch !== false) {
    unwatch = watchConnectivity(win, (online) => {
      showBanner(doc, "#offline-banner", online ? "" : "Bạn đang offline — tiến độ vẫn được lưu.");
    });
  }
  return { page, store, result, unwatch };
}

export { loadJson };

