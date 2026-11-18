import { describe, expect, it, vi } from "vitest";
import { JSDOM } from "jsdom";
import { bootPage, fetchJson } from "../vi/assets/js/boot.js";
import {
  applySession,
  dailyGoalStatus,
  loseHeart,
  msToNextHeart,
  refreshHearts
} from "../vi/assets/js/gamify.js";
import {
  availableSkills,
  citationsFor,
  filterDocs,
  libraryStats,
  searchDocs,
  sortDocs
} from "../vi/assets/js/library.js";
import { renderFeaturedDocs, renderPath, renderQuests } from "../vi/assets/js/page-home.js";
import { initLeague } from "../vi/assets/js/page-league.js";
import { initLesson } from "../vi/assets/js/page-lesson.js";
import { initLibrary } from "../vi/assets/js/page-library.js";
import { initPractice } from "../vi/assets/js/page-practice.js";
import { initProfile } from "../vi/assets/js/page-profile.js";
import { createStore, defaultState } from "../vi/assets/js/store.js";
import { buildSession, checkAnswer, expectedAnswer, practiceSession } from "../vi/assets/js/quiz.js";
import { loadJson } from "../vi/assets/js/page-common.js";
import { loadDoc, memoryStorage, units as realUnits } from "./helpers.js";

const NOW = new Date("2026-11-18T09:00:00");

function bare(html) {
  return new JSDOM(`<!doctype html><html><body>${html}</body></html>`, { url: "http://localhost/vi/" }).window.document;
}

function newStore(overrides = {}) {
  const store = createStore({ storage: memoryStorage(), now: () => NOW });
  if (Object.keys(overrides).length) store.update(overrides);
  return store;
}

describe("boot: mặc định và dữ liệu thiếu", () => {
  it("dùng document/window toàn cục và tham số mặc định", async () => {
    document.body.dataset.page = "";
    const outcome = await bootPage({ fetch: vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }), register: false, watch: false, now: 0 });
    expect(outcome.page).toBe("");
    expect(outcome.result).toBeNull();
    expect(outcome.store.get().xp).toBe(0);
  });

  it("now dạng chuỗi và search truyền vào", async () => {
    const dom = new JSDOM("<!doctype html><html><body data-page='lesson'></body></html>", { url: "http://localhost/vi/hoc.html" }).window;
    const outcome = await bootPage({
      document: dom.document,
      window: dom,
      fetch: vi.fn().mockResolvedValue({ ok: true, json: async () => ({ units: [] }) }),
      register: false,
      watch: false,
      now: "2026-11-18T09:00:00",
      search: "?bai=u1l1"
    });
    expect(outcome.page).toBe("lesson");
    expect(outcome.result.session.questions).toEqual([]);
    expect(dom.document.title).toContain("Bài học");
  });

  it("window tối giản, dữ liệu không có mảng", async () => {
    const dom = new JSDOM("<!doctype html><html><body data-page='home'></body></html>", { url: "http://localhost/vi/" }).window;
    const outcome = await bootPage({
      document: dom.document,
      window: { navigator: {}, addEventListener: () => {}, removeEventListener: () => {} },
      fetch: vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }),
      register: false,
      watch: false,
      now: NOW
    });
    expect(outcome.result.path.total).toBe(0);
    expect(outcome.result.state.readDocs).toEqual([]);
  });

  it("practice không có ky-nang dùng tất cả", async () => {
    const dom = new JSDOM("<!doctype html><html><body data-page='lesson'></body></html>", { url: "http://localhost/vi/" }).window;
    const outcome = await bootPage({
      document: dom.document,
      window: dom,
      fetch: vi.fn().mockResolvedValue({ ok: true, json: async () => ({ units: realUnits() }) }),
      register: false,
      watch: false,
      now: NOW,
      search: "?bai=practice"
    });
    expect(outcome.result.session.title).toBe("Luyện all");
    expect(outcome.result.session.questions).toHaveLength(10);
  });

  it("fetchJson nhận null", async () => {
    expect(await fetchJson(null, "x", { a: 1 })).toEqual({ a: 1 });
  });

  it("không truyền fetch/now dùng mặc định toàn cục", async () => {
    const dom = new JSDOM("<!doctype html><html><body data-page=''></body></html>", { url: "http://localhost/vi/" }).window;
    const outcome = await bootPage({ document: dom.document, window: dom, register: false, watch: false });
    expect(outcome.page).toBe("");
    expect(outcome.store.get().xp).toBe(0);
  });

  it("bài chưa có tiêu đề dùng nhãn mặc định", async () => {
    const dom = new JSDOM("<!doctype html><html><body data-page='lesson'><h1 id='lesson-title'></h1></body></html>", { url: "http://localhost/vi/" }).window;
    const outcome = await bootPage({
      document: dom.document,
      window: dom,
      fetch: vi.fn().mockResolvedValue({ ok: true, json: async () => ({ units: [{ id: "u", lessons: [{ id: "l", questions: [] }] }] }) }),
      register: false,
      watch: false,
      now: NOW,
      search: "?bai=l"
    });
    expect(outcome.result.session.lessonId).toBe("l");
    expect(dom.document.querySelector("#lesson-title").textContent).toBe("Bài học");
    expect(dom.document.title).toContain("Bài học");
  });
});

describe("edge: gamify", () => {
  it("tim có heartsAt = 0", () => {
    const state = { ...defaultState(NOW), hearts: 2, heartsAt: 0 };
    expect(refreshHearts(state, NOW).hearts).toBe(2);
    expect(msToNextHeart(state, NOW)).toBe(25 * 60 * 1000);
    const noElapsed = loseHeart({ ...state, hearts: 3 }, new Date(0));
    expect(noElapsed.state.hearts).toBe(2);
    expect(noElapsed.ok).toBe(true);
  });

  it("dailyGoal = 0 dùng mặc định 50", () => {
    expect(dailyGoalStatus({ ...defaultState(NOW), dailyGoal: 0, todayXp: 0 }).goal).toBe(50);
  });

  it("applySession thiếu số liệu", () => {
    const state = defaultState(NOW);
    const next = applySession(state, { lessonId: "u1l1" }, NOW);
    expect(next.xp).toBe(0);
    expect(next.todayCorrect).toBe(0);
    expect(next.todayAnswered).toBe(0);
    expect(next.todayReviews).toBe(0);
  });
});

describe("edge: library", () => {
  it("trích dẫn thiếu tiêu đề/query", () => {
    const stats = libraryStats([
      { citations: [{ query: "truy vấn" }, { title: "Tiêu đề" }, {}] },
      { citations: [{ title: "Tiêu đề" }] }
    ]);
    expect(stats).toEqual({ docs: 2, citations: 4, unique: 3 });
    expect(libraryStats([{}]).citations).toBe(0);
  });

  it("searchDocs với tài liệu thiếu trường", () => {
    const docs = [{ title: "Chỉ tiêu đề" }];
    expect(searchDocs(docs, "tiêu đề")).toHaveLength(1);
    expect(searchDocs(docs, "khác")).toHaveLength(0);
  });

  it("filterDocs với tài liệu thiếu skills", () => {
    expect(filterDocs([{ level: "B1" }], { skill: "vocab" })).toEqual([]);
    expect(filterDocs([{ level: "B1" }], { skill: "all" })).toHaveLength(1);
    expect(filterDocs([{ title: "không level" }], { level: "all" })).toHaveLength(1);
  });

  it("sortDocs với năm và thứ tự thiếu", () => {
    expect(sortDocs([{ id: "a", year: "2026" }, { id: "b" }], "newest").map((d) => d.id)).toEqual(["a", "b"]);
    expect(sortDocs([{ id: "a" }, { id: "b" }], "newest").map((d) => d.id)).toEqual(["a", "b"]);
    expect(sortDocs([{ id: "a", year: "2026" }, { id: "b" }, { id: "c", order: 1 }], "featured").map((d) => d.id)).toEqual(["c", "a", "b"]);
  });

  it("citationsFor tạo url khi thiếu", () => {
    expect(citationsFor({ citations: [{ query: "abc" }] })[0].url).toContain("scholar");
    expect(citationsFor({})).toEqual([]);
  });

  it("availableSkills bỏ tài liệu thiếu skills", () => {
    expect(availableSkills([{}, { skills: ["b", "a"] }])).toEqual(["a", "b"]);
  });
});

describe("edge: quiz", () => {
  it("lessons mặc định và seed mặc định", () => {
    expect(buildSession({ id: "x", title: "X", questions: [{ id: "q", type: "fill", answer: "a" }] }).id).toBe("session-x-1");
    expect(buildSession({ id: "x", title: "X", questions: [{ id: "q", type: "fill", answer: "a" }] }).unitId).toBe("");
    expect(practiceSession([{ id: "u", title: "U", lessons: [{ id: "l", title: "L" }] }]).questions).toEqual([]);
    expect(practiceSession([{ id: "u", title: "U", lessons: [{ id: "l", title: "L", questions: [{ id: "q", type: "fill", answer: "a" }] }] }], { size: 1 }).questions).toHaveLength(1);
    expect(practiceSession([{ id: "u", title: "U" }]).questions).toEqual([]);
    expect(practiceSession([{ id: "u", title: "U", lessons: [{ id: "l" }] }]).questions).toEqual([]);
  });

  it("expectedAnswer với dữ liệu thiếu", () => {
    expect(expectedAnswer({ type: "choice", answer: 0 })).toBe("");
    expect(expectedAnswer({ type: "order" })).toBe("");
    expect(expectedAnswer({ type: "order", answer: 42 })).toBe("42");
    expect(checkAnswer({ type: "choice", answer: 0 }, 0).expected).toBe("");
  });
});

describe("edge: trang chủ", () => {
  it("unit thiếu icon/subtitle/lessons", () => {
    const d = bare('<div id="home-path"></div>');
    renderPath(d, [{ id: "u", title: "U" }], {});
    expect(d.querySelector(".unit__icon").textContent).toBe("📘");
    expect(d.querySelector(".unit__copy p").textContent).toBe("");
    expect(d.querySelectorAll(".lesson-list li")).toHaveLength(0);
  });

  it("bài thiếu questions/goal", () => {
    const d = bare('<div id="home-path"></div>');
    renderPath(d, [{ id: "u", title: "U", lessons: [{ id: "l", title: "L" }] }], {});
    expect(d.querySelector(".lesson-link small").textContent).toContain("0 câu ·");
  });

  it("nhiệm vụ khi thiếu todayKey", () => {
    const d = bare('<ul id="home-quests"></ul>');
    expect(renderQuests(d, {}, NOW)).toHaveLength(3);
  });

  it("tài liệu tóm tắt ngắn không có dấu ba chấm", () => {
    const d = bare('<div id="home-library"></div>');
    renderFeaturedDocs(d, [{ featured: true, title: "T", summary: "Ngắn", citations: [], id: "x" }]);
    expect(d.querySelector("#home-library p").textContent).toBe("Ngắn");
  });
});

describe("edge: bảng xếp hạng", () => {
  it("thiếu weekStart", () => {
    const dom = loadDoc("bang-xep-hang.html");
    const store = newStore({ weekStart: "" });
    const result = initLeague({ document: dom.window.document, store, now: NOW });
    expect(result.rows).toHaveLength(15);
    expect(dom.window.document.querySelector("#league-week").textContent).toBe("");
  });
});

describe("edge: trình học", () => {
  const choice = { id: "q1", type: "choice", prompt: "Chọn", options: ["a", "b"], answer: 1 };
  const fill = { id: "q2", type: "fill", prompt: "Điền", answer: "x" };
  const order = { id: "q3", type: "order", prompt: "Sắp xếp", bank: ["a", "b"], answer: ["a", "b"] };
  const speech = { speak: vi.fn() };
  const session = (questions, extra = {}) => ({ id: "s", lessonId: "u1l1", title: "Bài", questions, ...extra });

  it("mặc định now, session thiếu, phần tử thiếu", () => {
    const d = bare('<h2 id="lesson-prompt"></h2>');
    const store = newStore();
    const controller = initLesson({ document: d, store, speech });
    expect(controller.index).toBe(0);
    expect(controller.submit()).toBeNull();
    expect(d.querySelector("#lesson-prompt").textContent).toContain("Chưa có câu hỏi");
  });

  it("dùng đồng hồ mặc định khi thiếu now", () => {
    const dom = loadDoc("hoc.html");
    const c = initLesson({ document: dom.window.document, store: newStore(), session: session([choice]), speech });
    expect(c.index).toBe(0);
    expect(dom.window.document.querySelectorAll(".option")).toHaveLength(2);
  });

  it("hồi tim trong lúc học", () => {
    const dom = loadDoc("hoc.html");
    const store = newStore({ hearts: 5 });
    store.update({ hearts: 5 });
    // heartsAt cũ để syncHearts phát hiện tim đã hồi
    store.update({ hearts: 1, heartsAt: NOW.getTime() - 30 * 60 * 1000 });
    const controller = initLesson({ document: dom.window.document, store, session: session([choice]), now: () => NOW, speech });
    expect(store.get().hearts).toBe(2);
    expect(controller.pending).toBeNull();
  });

  it("hơn 6 lựa chọn dùng số thay chữ", () => {
    const dom = loadDoc("hoc.html");
    const many = { ...choice, options: ["a", "b", "c", "d", "e", "f", "g"], answer: 6 };
    initLesson({ document: dom.window.document, store: newStore(), session: session([many]), now: () => NOW, speech });
    const keys = [...dom.window.document.querySelectorAll(".option__key")].map((el) => el.textContent);
    expect(keys.at(-1)).toBe("7");
  });

  it("thiếu khung điền từ và khung sắp xếp", () => {
    const d = bare('<div id="lesson-card"><h2 id="lesson-prompt"></h2><div id="lesson-options"></div></div><section id="lesson-summary" hidden></section>');
    const store = newStore();
    const c1 = initLesson({ document: d, store, session: session([fill]), now: () => NOW, speech });
    expect(c1.index).toBe(0);
    const c2 = initLesson({ document: d, store, session: session([order]), now: () => NOW, speech });
    expect(c2.pending).toBeNull();
  });

  it("sắp xếp thiếu ngân hàng từ hoặc thiếu khung đáp án", () => {
    const noBank = bare('<div id="lesson-order-wrap"><div id="lesson-answer"></div></div><h2 id="lesson-prompt"></h2><section id="lesson-summary" hidden></section>');
    expect(initLesson({ document: noBank, store: newStore(), session: session([order]), now: () => NOW, speech }).pending).toBeNull();

    const noAnswer = bare('<div id="lesson-order-wrap"><div id="lesson-bank"></div></div><h2 id="lesson-prompt"></h2><section id="lesson-summary" hidden></section>');
    const c = initLesson({ document: noAnswer, store: newStore(), session: session([order]), now: () => NOW, speech });
    c.pickToken(0);
    c.removeToken(0);
    expect(c.pending).toEqual([]);
  });

  it("thao tác sau khi kết thúc bị bỏ qua", () => {
    const d = bare('<h2 id="lesson-prompt"></h2><div id="lesson-options"></div><div id="lesson-bank"></div><div id="lesson-order"></div><section id="lesson-summary" hidden></section>');
    const store = newStore();
    const c = initLesson({ document: d, store, session: session([choice]), now: () => NOW, speech });
    c.select(1);
    c.submit();
    c.next();
    c.select(0);
    c.pickToken(0);
    c.removeToken(0);
    expect(c.isFinished()).toBe(true);
  });

  it("tổng kết không hoàn hảo, thiếu title/lessonId", () => {
    const dom = loadDoc("hoc.html");
    const store = newStore();
    const c = initLesson({
      document: dom.window.document,
      store,
      session: { id: "s", questions: [choice] },
      now: () => NOW,
      speech
    });
    dom.window.document.querySelectorAll(".option")[0].click();
    c.submit();
    const summary = c.next();
    expect(summary.perfect).toBe(false);
    expect(store.get().badges).not.toContain("first-lesson");
    expect(dom.window.document.querySelector("#lesson-summary").textContent).toContain("Bài học");
    expect(c.answers).toHaveLength(1);
    expect(c.session.id).toBe("s");
  });

  it("đáp án rỗng vẫn hiển thị phản hồi", () => {
    const dom = loadDoc("hoc.html");
    const empty = { id: "qe", type: "choice", prompt: "Rỗng", options: [], answer: 0 };
    const c = initLesson({ document: dom.window.document, store: newStore(), session: session([empty]), now: () => NOW, speech });
    c.select(0);
    const result = c.submit();
    expect(result.correct).toBe(true);
    expect(dom.window.document.querySelector("#lesson-feedback").textContent).toContain("Chính xác");
  });

  it("không có khu vực đáp án vẫn chấm được", () => {
    const d = bare('<h2 id="lesson-prompt"></h2><section id="lesson-summary" hidden></section>');
    const store = newStore();
    const c = initLesson({ document: d, store, session: session([choice]), now: () => NOW, speech });
    c.select(1);
    expect(c.submit().correct).toBe(true);
  });
});

describe("edge: thư viện trang", () => {
  it("store thiếu readDocs và tài liệu thiếu tags", () => {
    const dom = loadDoc("thu-vien.html");
    const doc = { id: "x", title: "X", subtitle: "S", summary: "M", level: "B1", file: "assets/pdf/x.pdf", pages: 1, skills: ["vocab"], citations: [] };
    const state = { srs: {}, completed: {}, badges: [], xp: 0 };
    const store = {
      get: () => state,
      update: (fn) => Object.assign(state, fn(state))
    };
    const controller = initLibrary({ document: dom.window.document, store, docs: [doc] });
    expect(controller.visible()).toHaveLength(1);
    controller.markRead("x");
    expect(store.get().docsRead).toBe(1);
    controller.markRead("x");
    expect(store.get().docsRead).toBe(1);
  });

  it("bấm ra ngoài nút đánh dấu không lỗi", () => {
    const dom = loadDoc("thu-vien.html");
    const store = newStore();
    initLibrary({ document: dom.window.document, store, docs: [] });
    const host = dom.window.document.querySelector("#library-list");
    host.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
    expect(store.get().docsRead).toBe(0);
  });
});

describe("edge: hồ sơ", () => {
  it("unit/bài thiếu dữ liệu và huy hiệu perfect", () => {
    const dom = loadDoc("ho-so.html");
    const store = newStore({
      badges: ["perfect"],
      srs: {
        q1: { id: "q1", due: NOW.getTime() - 1, reps: 1 },
        q2: { id: "q2", due: NOW.getTime() - 2, reps: 1 }
      }
    });
    const units = [
      { id: "u", title: "", lessons: [{ id: "l", title: "", questions: [{ id: "q1", prompt: "Câu hỏi" }] }] },
      { id: "u2", title: "U2", lessons: [{ id: "l2", title: "L2" }] }
    ];
    const result = initProfile({ document: dom.window.document, store, units, now: NOW });
    expect(result.earned).toContain("perfect");
    const text = dom.window.document.querySelector("#profile-due").textContent;
    expect(text).toContain("Câu hỏi");
    expect(text).toContain("Ôn tập");
    expect(text).toContain("q2");
  });
});

describe("edge: luyện tập", () => {
  it("unit thiếu skill, bài thiếu questions", () => {
    const dom = loadDoc("luyen-tap.html");
    const store = newStore();
    const result = initPractice({
      document: dom.window.document,
      store,
      units: [{ id: "u", title: "U", lessons: [{ id: "l", title: "L" }] }],
      now: NOW
    });
    expect(result.counts.all).toBe(0);
    expect(result.counts.all).toBeDefined();
  });
});

describe("edge: page-common", () => {
  it("loadJson không có fetch", async () => {
    expect(await loadJson("x", { a: 1 }, null)).toEqual({ a: 1 });
  });
});

