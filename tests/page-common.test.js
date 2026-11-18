import { describe, expect, it, vi } from "vitest";
import { JSDOM } from "jsdom";
import {
  createEl,
  loadJson,
  markActiveNav,
  q,
  qa,
  setText,
  shortDate,
  showBanner,
  updateTopbar
} from "../vi/assets/js/page-common.js";

function doc() {
  return new JSDOM(`<!doctype html><html><body data-page="home">
    <a data-nav="home" href="#">Học</a><a data-nav="profile" href="#">Hồ sơ</a>
    <span data-stat="streak">0</span><span data-stat="hearts">5</span>
    <span data-stat="gems">1</span><span data-stat="xp">2</span>
    <span data-stat="hearts-label"></span>
    <div id="target"></div><div class="banner" id="banner"></div>
  </body></html>`, { url: "http://localhost/vi/" }).window.document;
}

describe("truy vấn DOM", () => {
  it("q và qa an toàn", () => {
    const d = doc();
    expect(q(d, "#target")).not.toBeNull();
    expect(q(d, "#missing")).toBeNull();
    expect(q(null, "#target")).toBeNull();
    expect(qa(d, "a")).toHaveLength(2);
    expect(qa(null, "a")).toEqual([]);
  });

  it("setText chỉ ghi khi có phần tử", () => {
    const d = doc();
    expect(setText(d, "#target", "xin chào").textContent).toBe("xin chào");
    expect(setText(d, "#missing", "x")).toBeNull();
  });

  it("createEl tạo class và text", () => {
    const d = doc();
    const el = createEl(d, "li", "tag", "Nhãn");
    expect(el.tagName).toBe("LI");
    expect(el.className).toBe("tag");
    expect(el.textContent).toBe("Nhãn");
    expect(createEl(d, "span").textContent).toBe("");
  });
});

describe("topbar và nav", () => {
  it("cập nhật chỉ số", () => {
    const d = doc();
    updateTopbar(d, { streak: 4, hearts: 3, gems: 90, xp: 320 }, { heartsLabel: "3/5" });
    expect(d.querySelector('[data-stat="streak"]').textContent).toBe("4");
    expect(d.querySelector('[data-stat="xp"]').textContent).toBe("320");
    expect(d.querySelector('[data-stat="hearts-label"]').textContent).toBe("3/5");
  });

  it("markActiveNav đánh dấu đúng và bỏ dấu cũ", () => {
    const d = doc();
    const profile = d.querySelector('[data-nav="profile"]');
    profile.setAttribute("aria-current", "page");
    markActiveNav(d);
    expect(d.querySelector('[data-nav="home"]').getAttribute("aria-current")).toBe("page");
    expect(profile.hasAttribute("aria-current")).toBe(false);
  });

  it("markActiveNav bỏ qua khi thiếu data-page", () => {
    const d = doc();
    delete d.body.dataset.page;
    markActiveNav(d);
    expect(d.querySelector('[data-nav="home"]').getAttribute("aria-current")).toBeNull();
    expect(() => markActiveNav(null)).not.toThrow();
  });
});

describe("banner và tải dữ liệu", () => {
  it("showBanner bật/tắt", () => {
    const d = doc();
    expect(showBanner(d, "#banner", "Offline").classList.contains("is-visible")).toBe(true);
    expect(showBanner(d, "#banner", "").classList.contains("is-visible")).toBe(false);
    expect(showBanner(d, "#missing", "x")).toBeNull();
  });

  it("loadJson xử lý ok/lỗi/exception", async () => {
    expect(await loadJson("x", { a: 1 }, vi.fn().mockResolvedValue({ ok: true, json: async () => ({ b: 2 }) }))).toEqual({ b: 2 });
    expect(await loadJson("x", { a: 1 }, vi.fn().mockResolvedValue({ ok: false }))).toEqual({ a: 1 });
    expect(await loadJson("x", { a: 1 }, vi.fn().mockRejectedValue(new Error("mạng")))).toEqual({ a: 1 });
  });

  it("loadJson dùng fetch toàn cục", async () => {
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true, json: async () => ({ c: 3 }) });
    expect(await loadJson("x", {})).toEqual({ c: 3 });
    spy.mockRestore();
  });

  it("shortDate", () => {
    expect(shortDate(new Date(2026, 10, 18))).toBe("18/11");
    expect(shortDate("2026-01-05T00:00:00")).toBe("05/01");
  });
});
