import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import { initLeague } from "../vi/assets/js/page-league.js";
import { createStore } from "../vi/assets/js/store.js";
import { loadDoc, memoryStorage } from "./helpers.js";

const NOW = new Date("2026-11-18T09:00:00");

describe("bảng xếp hạng", () => {
  it("vẽ 15 dòng, tô màu vùng và hạng người dùng", () => {
    const dom = loadDoc("bang-xep-hang.html");
    const document = dom.window.document;
    const store = createStore({ storage: memoryStorage(), now: () => NOW });
    store.update({ name: "Lan", weekXp: 500 });
    const result = initLeague({ document, store, now: NOW });
    expect(document.querySelectorAll("#league-rows li")).toHaveLength(15);
    expect(document.querySelector("#league-name").textContent).toContain("Vàng");
    expect(document.querySelector("#league-days").textContent).toContain("ngày");
    expect(document.querySelectorAll(".league-row--user")).toHaveLength(1);
    expect(document.querySelectorAll(".league-row--promote").length).toBe(5);
    expect(document.querySelectorAll(".league-row--demote").length).toBe(2);
    expect(document.querySelectorAll(".league-row--promote .league-row__name small").length).toBe(5);
    expect(document.querySelector("#league-rank").textContent).toMatch(/#\d+/);
    expect(result.me.name).toBe("Lan");
    expect(result.daysLeft).toBe(5);
    expect(result.rows).toHaveLength(15);
  });

  it("tất định trong cùng tuần", () => {
    const dom = loadDoc("bang-xep-hang.html");
    const store = createStore({ storage: memoryStorage(), now: () => NOW });
    const first = initLeague({ document: dom.window.document, store, now: NOW });
    const second = initLeague({ document: dom.window.document, store, now: NOW });
    expect(first.rows.map((r) => `${r.name}${r.weeklyXp}`)).toEqual(second.rows.map((r) => `${r.name}${r.weeklyXp}`));
    expect(first.seed).toBe(second.seed);
  });

  it("hoạt động khi thiếu danh sách", () => {
    const d = new JSDOM("<!doctype html><html><body></body></html>").window.document;
    const store = createStore({ storage: memoryStorage(), now: () => NOW });
    const result = initLeague({ document: d, store, now: NOW });
    expect(result.rows).toHaveLength(15);
    expect(() => initLeague({})).toThrow("initLeague");
  });
});
