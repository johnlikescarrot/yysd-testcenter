import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import { initProfile } from "../vi/assets/js/page-profile.js";
import { createStore } from "../vi/assets/js/store.js";
import { loadDoc, memoryStorage, units } from "./helpers.js";

const NOW = new Date("2026-11-18T09:00:00");

function setup(overrides = {}) {
  const dom = loadDoc("ho-so.html");
  const document = dom.window.document;
  const store = createStore({ storage: memoryStorage(), now: () => NOW });
  if (Object.keys(overrides).length) store.update(overrides);
  const result = initProfile({ document, store, units: units(), now: NOW });
  return { dom, document, store, result };
}

describe("hồ sơ", () => {
  it("hiển thị thống kê và toàn bộ huy hiệu", () => {
    const { document, result } = setup({ xp: 500, streak: 3, bestStreak: 8, reviews: 30, docsRead: 1 });
    expect(document.querySelector("#profile-xp").textContent).toBe("500");
    expect(document.querySelector("#profile-streak").textContent).toBe("3");
    expect(document.querySelector("#profile-best").textContent).toBe("8");
    expect(document.querySelector("#profile-level").textContent).toContain("Thợ săn");
    expect(document.querySelectorAll("#profile-badges .badge")).toHaveLength(7);
    expect(document.querySelectorAll("#profile-badges .badge--earned").length).toBeGreaterThanOrEqual(4);
    expect(document.querySelectorAll("#profile-badges .badge--locked .sr-only").length).toBeGreaterThan(0);
    expect(result.earned).toContain("xp-500");
    expect(result.earned).toContain("reader");
  });

  it("hiển thị thẻ đến hạn và thẻ sắp tới", () => {
    const srs = {
      u1l1q1: { id: "u1l1q1", due: NOW.getTime() - 1000, reps: 1, seen: 2 },
      "id-không-tồn-tại": { id: "id-không-tồn-tại", due: NOW.getTime() - 500, reps: 1, seen: 1 },
      u1l2q1: { id: "u1l2q1", due: NOW.getTime() + 2 * 86400000, reps: 2, seen: 3 }
    };
    const { document, result } = setup({ srs, hearts: 5 });
    const dueText = document.querySelector("#profile-due").textContent;
    expect(dueText).toContain("significant");
    expect(dueText).toContain("id-không-tồn-tại");
    expect(dueText).toContain("hạn 18/11");
    expect(document.querySelector("#profile-soon").textContent).toContain("1 thẻ");
    expect(document.querySelector("#profile-retention").textContent).toBe("100%");
    expect(result.due).toHaveLength(2);
    expect(result.upcoming).toHaveLength(1);
  });

  it("trạng thái chưa có thẻ đến hạn", () => {
    const { document, result } = setup();
    expect(document.querySelector("#profile-due").textContent).toContain("Không có thẻ nào đến hạn");
    expect(result.due).toHaveLength(0);
    expect(document.querySelector("#profile-retention").textContent).toBe("0%");
  });

  it("đặt lại tiến độ cần xác nhận hai bước", () => {
    const { document, store } = setup({ xp: 500, streak: 6 });
    const button = document.querySelector("#reset-progress");
    button.click();
    expect(button.dataset.armed).toBe("true");
    expect(button.textContent).toContain("Nhấn lần nữa");
    expect(store.get().xp).toBe(500);
    button.click();
    expect(store.get().xp).toBe(0);
    expect(button.dataset.armed).toBeUndefined();
    expect(document.querySelector("#profile-xp").textContent).toBe("0");
  });

  it("hoạt động khi thiếu phần tử và tham số", () => {
    const d = new JSDOM("<!doctype html><html><body></body></html>").window.document;
    const store = createStore({ storage: memoryStorage(), now: () => NOW });
    const result = initProfile({ document: d, store, units: [], now: NOW });
    expect(result.earned).toEqual([]);
    expect(() => initProfile({})).toThrow("initProfile");
  });
});
