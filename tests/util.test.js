import { describe, expect, it, vi } from "vitest";
import {
  addDays,
  clamp,
  dayDiff,
  dayKey,
  escapeHtml,
  formatDuration,
  formatNumber,
  hashString,
  mulberry32,
  normalize,
  percent,
  pick,
  shuffle
} from "../vi/assets/js/util.js";

describe("clamp", () => {
  it("giữ giá trị trong khoảng", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(42, 0, 10)).toBe(10);
  });
});

describe("ngày tháng", () => {
  it("dayKey thêm 0 ở đầu", () => {
    expect(dayKey(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(dayKey(new Date(2026, 10, 18))).toBe("2026-11-18");
    expect(dayKey("2026-03-09T10:00:00")).toBe("2026-03-09");
  });

  it("addDays không sửa đối tượng gốc", () => {
    const base = new Date(2026, 0, 31);
    const next = addDays(base, 1);
    expect(dayKey(base)).toBe("2026-01-31");
    expect(dayKey(next)).toBe("2026-02-01");
    expect(dayKey(addDays(base.getTime(), -2))).toBe("2026-01-29");
  });

  it("dayDiff tính chênh lệch ngày", () => {
    expect(dayDiff("2026-01-01", "2026-01-02")).toBe(1);
    expect(dayDiff("2026-01-02", "2026-01-01")).toBe(-1);
    expect(dayDiff("2026-01-01", "2026-01-01")).toBe(0);
  });
});

describe("normalize", () => {
  it("bỏ dấu, dấu câu và khoảng trắng thừa", () => {
    expect(normalize("  Đây là Tiếng Việt!  ")).toBe("day la tieng viet");
    expect(normalize("Inevitable")).toBe("inevitable");
    expect(normalize("don't  stop")).toBe("don't stop");
  });

  it("an toàn với null/undefined", () => {
    expect(normalize(null)).toBe("");
    expect(normalize(undefined)).toBe("");
  });
});

describe("shuffle và RNG", () => {
  it("shuffle tất định theo rng", () => {
    const rng = mulberry32(42);
    const first = shuffle([1, 2, 3, 4, 5], rng);
    const second = shuffle([1, 2, 3, 4, 5], mulberry32(42));
    expect(first).toEqual(second);
    expect([...first].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it("shuffle dùng Math.random mặc định", () => {
    const spy = vi.spyOn(Math, "random").mockReturnValue(0);
    expect(shuffle(["a", "b"])).toEqual(["b", "a"]);
    spy.mockRestore();
  });

  it("mulberry32 trả về số trong [0,1)", () => {
    const value = mulberry32(7)();
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThan(1);
  });

  it("hashString ổn định và khác nhau", () => {
    expect(hashString("abc")).toBe(hashString("abc"));
    expect(hashString("abc")).not.toBe(hashString("abd"));
  });
});

describe("hiển thị", () => {
  it("escapeHtml", () => {
    expect(escapeHtml("<a href=\"x\">'&'</a>")).toBe(
      "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;"
    );
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
  });

  it("formatNumber", () => {
    expect(formatNumber(1234567)).toMatch(/1\.234\.567/);
    expect(formatNumber("không phải số")).toBe("0");
  });

  it("percent", () => {
    expect(percent(1, 4)).toBe(25);
    expect(percent(5, 0)).toBe(0);
  });

  it("pick", () => {
    expect(pick(["a"], () => 0)).toBe("a");
    expect(pick([], () => 0)).toBeUndefined();
    const spy = vi.spyOn(Math, "random").mockReturnValue(0);
    expect(pick(["x", "y"])).toBe("x");
    spy.mockRestore();
  });

  it("formatDuration", () => {
    expect(formatDuration(5000)).toBe("5 giây");
    expect(formatDuration(120000)).toBe("2 phút");
    expect(formatDuration(90000)).toBe("1 phút 30 giây");
    expect(formatDuration(-500)).toBe("0 giây");
  });
});
