import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import { initLibrary } from "../vi/assets/js/page-library.js";
import { createStore } from "../vi/assets/js/store.js";
import { docs, loadDoc, memoryStorage } from "./helpers.js";

function setup() {
  const dom = loadDoc("thu-vien.html");
  const document = dom.window.document;
  const store = createStore({ storage: memoryStorage() });
  const controller = initLibrary({ document, store, docs: docs() });
  return { dom, document, store, controller };
}

describe("thư viện PDF", () => {
  it("hiển thị 6 tài liệu với 54 trích dẫn", () => {
    const { document, controller } = setup();
    expect(document.querySelectorAll("#library-list .doc")).toHaveLength(6);
    expect(document.querySelectorAll("#library-list .citations a")).toHaveLength(54);
    expect(document.querySelector("[data-bind='library-stats']").textContent).toContain("54");
    expect(document.querySelector("#library-empty").hidden).toBe(true);
    expect(controller.stats).toEqual({ docs: 6, citations: 54, unique: 54 });
    expect(document.querySelector("#library-skill option").value).toBe("all");
    expect(document.querySelectorAll("#library-skill option")).toHaveLength(6);
    expect(document.querySelectorAll("#library-level option").length).toBeGreaterThan(1);
  });

  it("tìm kiếm theo từ khoá và tác giả", () => {
    const { controller, document } = setup();
    expect(controller.setQuery("ngắt quãng").length).toBe(1);
    expect(controller.setQuery("Kornell").length).toBe(1);
    expect(controller.setQuery("không tồn tại").length).toBe(0);
    expect(document.querySelector("#library-empty").hidden).toBe(false);
    expect(controller.setQuery("").length).toBe(6);
  });

  it("lọc theo kỹ năng và trình độ, sắp xếp", () => {
    const { controller } = setup();
    const listening = controller.setSkill("listening");
    expect(listening.length).toBeGreaterThan(0);
    expect(listening.every((doc) => doc.skills.includes("listening"))).toBe(true);
    expect(controller.setLevel("B2–C1").every((doc) => doc.level === "B2–C1")).toBe(true);
    expect(controller.setSkill("all").length).toBeGreaterThan(1);
    expect(controller.setLevel("all").length).toBe(6);
    expect(controller.setSort("citations")[0].citations.length).toBe(9);
    expect(controller.setSort("newest").length).toBe(6);
    expect(controller.setSort("featured").length).toBe(6);
  });

  it("sự kiện input/change cập nhật danh sách", () => {
    const { document, controller } = setup();
    const search = document.querySelector("#library-search");
    search.value = "Writing";
    search.dispatchEvent(new document.defaultView.Event("input"));
    expect(controller.visible().length).toBe(1);

    const skill = document.querySelector("#library-skill");
    skill.value = "writing";
    skill.dispatchEvent(new document.defaultView.Event("change"));
    expect(controller.view.skill).toBe("writing");
    expect(controller.visible().length).toBe(1);

    const level = document.querySelector("#library-level");
    level.value = "A2–B2";
    level.dispatchEvent(new document.defaultView.Event("change"));
    expect(controller.view.level).toBe("A2–B2");

    const sort = document.querySelector("#library-sort");
    sort.value = "citations";
    sort.dispatchEvent(new document.defaultView.Event("change"));
    expect(controller.view.sort).toBe("citations");
  });

  it("đánh dấu đã đọc và mở khoá huy hiệu", () => {
    const { document, store, controller } = setup();
    const button = document.querySelector('[data-read="on-tap-ngat-quang"]');
    button.click();
    expect(store.get().docsRead).toBe(1);
    expect(store.get().readDocs).toEqual(["on-tap-ngat-quang"]);
    expect(store.get().badges).toContain("reader");
    const refreshed = document.querySelector('[data-read="on-tap-ngat-quang"]');
    expect(refreshed.disabled).toBe(true);
    expect(refreshed.textContent).toContain("Đã đọc");
    controller.markRead("on-tap-ngat-quang");
    expect(store.get().docsRead).toBe(1);
  });

  it("thuộc tính tải xuống và liên kết PDF", () => {
    const { document } = setup();
    const download = document.querySelector(".doc__actions a[download]");
    expect(download.getAttribute("download")).toBe("on-tap-ngat-quang.pdf");
    expect(download.getAttribute("href")).toBe("assets/pdf/on-tap-ngat-quang.pdf");
    const scholar = document.querySelector(".citations a");
    expect(scholar.href).toContain("scholar.google.com");
    expect(scholar.rel).toBe("noopener");
  });

  it("hoạt động khi thiếu phần tử", () => {
    const d = new JSDOM("<!doctype html><html><body></body></html>").window.document;
    const store = createStore({ storage: memoryStorage() });
    const controller = initLibrary({ document: d, store, docs: docs() });
    expect(controller.visible()).toHaveLength(6);
    expect(d.querySelector("#library-list")).toBeNull();
    expect(() => controller.markRead("writing-task-2")).not.toThrow();
    expect(store.get().docsRead).toBe(1);
    expect(() => initLibrary({})).toThrow("initLibrary");
  });
});
