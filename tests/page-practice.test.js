import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import { SKILLS, countBySkill, initPractice } from "../vi/assets/js/page-practice.js";
import { createStore } from "../vi/assets/js/store.js";
import { loadDoc, memoryStorage, units } from "./helpers.js";

const NOW = new Date("2026-11-18T09:00:00");

describe("luyện tập", () => {
  it("đếm câu hỏi theo kỹ năng", () => {
    const counts = countBySkill(units());
    expect(counts.all).toBe(50);
    expect(counts.vocab).toBe(10);
    expect(counts.speaking).toBe(10);
    expect(countBySkill([])).toEqual({ all: 0 });
  });

  it("vẽ thẻ kỹ năng và số liệu", () => {
    const dom = loadDoc("luyen-tap.html");
    const document = dom.window.document;
    const store = createStore({ storage: memoryStorage(), now: () => NOW });
    store.update({ srs: { u1l1q1: { id: "u1l1q1", due: NOW.getTime() - 1, reps: 1 } } });
    const result = initPractice({ document, store, units: units(), now: NOW });
    expect(document.querySelectorAll("#practice-skills .skill-card")).toHaveLength(SKILLS.length);
    expect(document.querySelector("#practice-total").textContent).toBe("50");
    expect(document.querySelector("#practice-due").textContent).toBe("1");
    expect(document.querySelector("#practice-progress").textContent).toBe("0%");
    expect(result.counts.vocab).toBe(10);
    const links = [...document.querySelectorAll("#practice-skills a")].map((a) => a.getAttribute("href"));
    expect(links[1]).toContain("hoc.html?bai=practice&ky-nang=vocab");
  });

  it("hoạt động khi thiếu phần tử và tham số", () => {
    const d = new JSDOM("<!doctype html><html><body></body></html>").window.document;
    const store = createStore({ storage: memoryStorage(), now: () => NOW });
    expect(initPractice({ document: d, store, units: [], now: NOW }).counts.all).toBe(0);
    expect(() => initPractice({})).toThrow("initPractice");
  });
});
