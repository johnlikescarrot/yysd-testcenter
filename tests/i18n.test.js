import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, LOCALES, STRINGS, createI18n, interpolate } from "../vi/assets/js/i18n.js";

describe("i18n", () => {
  it("mặc định là tiếng Việt", () => {
    expect(DEFAULT_LOCALE).toBe("vi");
    expect(LOCALES).toEqual(["vi", "en"]);
  });

  it("interpolate thay biến và giữ placeholder thiếu", () => {
    expect(interpolate("Xin chào {name}", { name: "Mai" })).toBe("Xin chào Mai");
    expect(interpolate("Thiếu {name}")).toBe("Thiếu {name}");
    expect(interpolate("Số {count}", { count: 3 })).toBe("Số 3");
  });

  it("dịch vi và en", () => {
    const vi = createI18n("vi");
    const en = createI18n("en");
    expect(vi.t("lesson.correct")).toBe("Chính xác!");
    expect(en.t("lesson.correct")).toBe("Correct!");
    expect(vi.locale).toBe("vi");
    expect(en.available).toEqual(LOCALES);
  });

  it("ngôn ngữ không hợp lệ quay về tiếng Việt", () => {
    const i18n = createI18n("fr");
    expect(i18n.locale).toBe("vi");
    expect(i18n.setLocale("en")).toBe("en");
    expect(i18n.setLocale("de")).toBe("en");
    expect(i18n.locale).toBe("en");
  });

  it("thiếu khoá thì trả về key hoặc bản tiếng Việt", () => {
    const i18n = createI18n("en");
    expect(i18n.t("khong.ton.tai")).toBe("khong.ton.tai");
    const spy = createI18n("vi");
    expect(spy.t("home.goalProgress", { done: 3, goal: 9 })).toBe("3/9 XP");
  });

  it("mọi khoá tiếng Việt đều có bản tiếng Anh", () => {
    const viKeys = Object.keys(STRINGS.vi).sort();
    const enKeys = Object.keys(STRINGS.en).sort();
    expect(enKeys).toEqual(viKeys);
  });
});
