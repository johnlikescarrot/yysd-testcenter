import { describe, expect, it, vi } from "vitest";
import { JSDOM } from "jsdom";
import { LESSONS_URL, LIBRARY_URL, bootPage, fetchJson, sessionFromParams, urlParams } from "../vi/assets/js/boot.js";
import { createStore } from "../vi/assets/js/store.js";
import { docs, jsonResponse, loadDoc, memoryStorage, units } from "./helpers.js";

const NOW = new Date("2026-11-18T09:00:00");

function mockFetch({ lessonsOk = true, docsOk = true } = {}) {
  return vi.fn(async (url) => {
    if (url === LESSONS_URL) return jsonResponse({ units: lessonsOk ? units() : [] }, lessonsOk);
    if (url === LIBRARY_URL) return jsonResponse({ docs: docsOk ? docs() : [] }, docsOk);
    return jsonResponse({}, false);
  });
}

function page(file, url) {
  const dom = loadDoc(file, url);
  return dom;
}

describe("tiện ích boot", () => {
  it("urlParams", () => {
    expect(urlParams("?bai=u1l1&ky-nang=vocab").get("bai")).toBe("u1l1");
    expect(urlParams().get("x")).toBeNull();
    expect(urlParams("").toString()).toBe("");
  });

  it("sessionFromParams chọn bài hoặc phiên luyện tập", () => {
    const store = createStore({ storage: memoryStorage(), now: () => NOW });
    store.update({ srs: { u1l3q1: { id: "u1l3q1", due: NOW.getTime() - 1, reps: 1 } } });
    const lesson = sessionFromParams(units(), store, urlParams("?bai=u1l2"), NOW);
    expect(lesson.lessonId).toBe("u1l2");
    const practice = sessionFromParams(units(), store, urlParams("?bai=practice&ky-nang=vocab"), NOW);
    expect(practice.lessonId).toBe("practice");
    expect(practice.questions.length).toBe(10);
    const fallback = sessionFromParams(units(), store, urlParams("?bai=khong-co"), NOW);
    expect(fallback.lessonId).toBe("u1l1");
    const empty = sessionFromParams([], store, urlParams("?bai=u1l1"), NOW);
    expect(empty.questions).toEqual([]);
    expect(empty.title).toBe("Bài học");
  });

  it("fetchJson xử lý mọi trường hợp", async () => {
    expect(await fetchJson(null, "x", { a: 1 })).toEqual({ a: 1 });
    expect(await fetchJson(vi.fn().mockResolvedValue(jsonResponse({ b: 2 })), "x", {})).toEqual({ b: 2 });
    expect(await fetchJson(vi.fn().mockResolvedValue(null), "x", { a: 1 })).toEqual({ a: 1 });
    expect(await fetchJson(vi.fn().mockResolvedValue(jsonResponse({}, false)), "x", { a: 1 })).toEqual({ a: 1 });
    expect(await fetchJson(vi.fn().mockRejectedValue(new Error("mất mạng")), "x", { a: 1 })).toEqual({ a: 1 });
  });
});

describe("bootPage", () => {
  it("trang học", async () => {
    const dom = page("index.html");
    const { page: name, store, result } = await bootPage({
      document: dom.window.document,
      window: dom.window,
      fetch: mockFetch(),
      now: NOW,
      register: false,
      watch: false
    });
    expect(name).toBe("home");
    expect(result.next.id).toBe("u1l1");
    expect(store.get().todayKey).toBe("2026-11-18");
    expect(dom.window.document.querySelector("[data-nav='home']").getAttribute("aria-current")).toBe("page");
    expect(dom.window.document.querySelector("#home-path").children.length).toBe(5);
  });

  it("trang luyện tập", async () => {
    const dom = page("luyen-tap.html");
    const { result } = await bootPage({
      document: dom.window.document,
      window: dom.window,
      fetch: mockFetch(),
      now: NOW,
      register: false,
      watch: false
    });
    expect(result.counts.all).toBe(50);
  });

  it("trang bài học theo id", async () => {
    const dom = page("hoc.html", "http://localhost/vi/hoc.html?bai=u2l2");
    const { result } = await bootPage({
      document: dom.window.document,
      window: dom.window,
      fetch: mockFetch(),
      now: NOW,
      register: false,
      watch: false
    });
    expect(result.session.lessonId).toBe("u2l2");
    expect(dom.window.document.querySelector("#lesson-title").textContent).toBe("Câu điều kiện & nhượng bộ");
    expect(dom.window.document.title).toContain("Câu điều kiện");
  });

  it("trang bài học dạng luyện tập", async () => {
    const dom = page("hoc.html", "http://localhost/vi/hoc.html?bai=practice&ky-nang=grammar");
    const { result } = await bootPage({
      document: dom.window.document,
      window: dom.window,
      fetch: mockFetch(),
      now: NOW,
      register: false,
      watch: false
    });
    expect(result.session.lessonId).toBe("practice");
    expect(result.session.questions.length).toBe(10);
  });

  it("trang thư viện", async () => {
    const dom = page("thu-vien.html");
    const { result } = await bootPage({
      document: dom.window.document,
      window: dom.window,
      fetch: mockFetch(),
      now: NOW,
      register: false,
      watch: false
    });
    expect(result.stats.citations).toBe(54);
    expect(dom.window.document.querySelectorAll(".doc").length).toBe(6);
  });

  it("trang bảng xếp hạng và hồ sơ", async () => {
    const leagueDom = page("bang-xep-hang.html");
    const league = await bootPage({
      document: leagueDom.window.document,
      window: leagueDom.window,
      fetch: mockFetch(),
      now: NOW,
      register: false,
      watch: false
    });
    expect(league.result.rows).toHaveLength(15);

    const profileDom = page("ho-so.html");
    const profile = await bootPage({
      document: profileDom.window.document,
      window: profileDom.window,
      fetch: mockFetch(),
      now: NOW,
      register: false,
      watch: false
    });
    expect(profile.result.earned).toEqual([]);
  });

  it("trang lạ không làm gì", async () => {
    const dom = new JSDOM("<!doctype html><html><body data-page='unknown'></body></html>", { url: "http://localhost/vi/" }).window;
    const outcome = await bootPage({
      document: dom.document,
      window: dom,
      fetch: mockFetch(),
      now: NOW,
      register: false,
      watch: false
    });
    expect(outcome.page).toBe("unknown");
    expect(outcome.result).toBeNull();
  });

  it("dữ liệu lỗi vẫn hiển thị trang", async () => {
    const dom = page("index.html");
    const failing = vi.fn().mockRejectedValue(new Error("offline"));
    const { result } = await bootPage({
      document: dom.window.document,
      window: dom.window,
      fetch: failing,
      now: NOW,
      register: false,
      watch: false
    });
    expect(result.next).toBeNull();
    expect(dom.window.document.querySelectorAll("#home-library article").length).toBe(0);

    const dom2 = page("index.html");
    const notOk = vi.fn().mockResolvedValue(jsonResponse({}, false));
    const second = await bootPage({
      document: dom2.window.document,
      window: dom2.window,
      fetch: notOk,
      now: NOW,
      register: false,
      watch: false
    });
    expect(second.result.path.total).toBe(0);
  });

  it("không có fetch toàn cục vẫn chạy", async () => {
    vi.stubGlobal("fetch", undefined);
    const dom = page("index.html");
    const outcome = await bootPage({
      document: dom.window.document,
      window: dom.window,
      now: NOW,
      register: false,
      watch: false
    });
    expect(outcome.result.next).toBeNull();
    vi.unstubAllGlobals();
  });

  it("đăng ký PWA mặc định và theo dõi mạng", async () => {
    const dom = page("index.html");
    const outcome = await bootPage({
      document: dom.window.document,
      window: dom.window,
      fetch: mockFetch(),
      now: NOW
    });
    expect(typeof outcome.unwatch).toBe("function");
    dom.window.dispatchEvent(new dom.window.Event("offline"));
    expect(dom.window.document.querySelector("#offline-banner").classList.contains("is-visible")).toBe(true);
    dom.window.dispatchEvent(new dom.window.Event("online"));
    expect(dom.window.document.querySelector("#offline-banner").classList.contains("is-visible")).toBe(false);
    outcome.unwatch();
    // registerServiceWorker: jsdom không có serviceWorker → null, không lỗi
    expect(dom.window.navigator.serviceWorker).toBeUndefined();
  });

  it("dùng store được truyền vào", () => {
    const store = createStore({ storage: memoryStorage(), now: () => NOW });
    expect(store.get().xp).toBe(0);
  });
});
