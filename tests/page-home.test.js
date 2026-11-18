import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import { initHome, renderFeaturedDocs, renderPath, renderQuests } from "../vi/assets/js/page-home.js";
import { createStore } from "../vi/assets/js/store.js";
import { docs, loadDoc, memoryStorage, units } from "./helpers.js";

const NOW = new Date("2026-11-18T09:00:00");

function setup() {
  const dom = loadDoc("index.html");
  return { dom, document: dom.window.document, store: createStore({ storage: memoryStorage(), now: () => NOW }) };
}

describe("trang học", () => {
  it("hiển thị lời chào, mục tiêu, lộ trình và nhiệm vụ", () => {
    const { document, store } = setup();
    const result = initHome({ document, store, units: units(), docs: docs(), now: NOW });
    expect(document.querySelector("[data-bind='greeting']").textContent).toContain("Người học");
    expect(document.querySelector("#stat-streak").textContent).toBe("0");
    expect(document.querySelector("#goal-goal").textContent).toBe("50");
    expect(document.querySelector("#goal-progress").getAttribute("aria-valuenow")).toBe("0");
    expect(document.querySelector("#home-path").querySelectorAll("a").length).toBe(10);
    expect(document.querySelectorAll(".lesson-link--locked").length).toBe(9);
    expect(document.querySelectorAll(".lesson-link--next").length).toBe(1);
    expect(document.querySelectorAll("#home-quests .quest").length).toBe(3);
    expect(document.querySelectorAll("#home-library article").length).toBe(2);
    expect(document.querySelector("#continue-link").href).toContain("hoc.html?bai=u1l1");
    expect(document.querySelector("#home-badges").textContent).toContain("Chưa có huy hiệu");
    expect(result.path).toEqual({ done: 0, total: 10, percent: 0 });
    expect(result.next.id).toBe("u1l1");
  });

  it("phản ánh tiến độ đã hoàn thành và mục tiêu đạt được", () => {
    const { document, store } = setup();
    store.update({
      xp: 320,
      weekXp: 320,
      todayXp: 60,
      streak: 4,
      bestStreak: 4,
      lastStudyDay: "2026-11-18",
      completed: { u1l1: true, u1l2: true },
      todayCorrect: 8,
      todayAnswered: 10,
      badges: ["perfect"],
      reviews: 30,
      docsRead: 1,
      srs: { u1l1q1: { id: "u1l1q1", due: NOW.getTime() - 1000, reps: 1 } }
    });
    initHome({ document, store, units: units(), docs: docs(), now: NOW });
    expect(document.querySelector("#goal-note").textContent).toContain("Đã đạt mục tiêu");
    expect(document.querySelector("#goal-fill").style.width).toBe("100%");
    expect(document.querySelector("#continue-link").textContent).toBe("Tiếp tục bài học");
    expect(document.querySelector("#continue-link").href).toContain("u2l1");
    expect(document.querySelectorAll(".lesson-link--done").length).toBe(2);
    expect(document.querySelector("#home-badges").textContent).toContain("Bước đầu tiên");
    expect(document.querySelector("#streak-ring").style.getPropertyValue("--streak-progress")).toBe("57");
    expect(document.querySelector("#stat-league").textContent).toBe("Bạc");
    expect(document.querySelectorAll("#home-quests .quest").length).toBe(3);
    expect(document.querySelector("#home-quests").textContent).toContain("💎");
  });

  it("hồi tim và cuộn tuần khi cần", () => {
    const { document, store } = setup();
    store.update({ hearts: 1, heartsAt: NOW.getTime() - 26 * 60 * 1000, weekStart: "2026-11-09", weekXp: 200 });
    initHome({ document, store, units: units(), docs: docs(), now: NOW });
    expect(store.get().hearts).toBe(2);
    expect(store.get().weekXp).toBe(0);
    expect(store.get().weekStart).toBe("2026-11-16");
  });

  it("hoạt động khi thiếu dữ liệu và phần tử", () => {
    const d = new JSDOM("<!doctype html><html><body></body></html>").window.document;
    expect(renderPath(d, units(), {})).toEqual([]);
    expect(renderQuests(d, { todayKey: "2026-11-18" }, NOW)).toEqual([]);
    expect(renderFeaturedDocs(d, docs())).toEqual([]);
    const store = createStore({ storage: memoryStorage(), now: () => NOW });
    const result = initHome({ document: d, store, units: [], docs: [], now: NOW });
    expect(result.next).toBeNull();
    expect(result.links).toEqual([]);
  });

  it("báo lỗi khi thiếu tham số", () => {
    expect(() => initHome({})).toThrow("initHome");
  });

  it("cắt tóm tắt tài liệu dài", () => {
    const d = new JSDOM('<!doctype html><html><body><div id="home-library"></div></body></html>').window.document;
    const longDoc = { ...docs()[0], summary: "x".repeat(300) };
    renderFeaturedDocs(d, [longDoc]);
    expect(d.querySelector("#home-library p").textContent.endsWith("…")).toBe(true);
  });
});
