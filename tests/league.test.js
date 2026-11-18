import { describe, expect, it } from "vitest";
import { RIVALS, buildCohort, daysRemaining, userRank } from "../vi/assets/js/league.js";

describe("bảng xếp hạng", () => {
  it("tạo 15 dòng, có người dùng và thứ hạng liên tục", () => {
    const rows = buildCohort({ seed: 3, user: { name: "Lan", weeklyXp: 120 } });
    expect(rows).toHaveLength(15);
    expect(rows.map((row) => row.rank)).toEqual(Array.from({ length: 15 }, (_, i) => i + 1));
    const sorted = [...rows].sort((a, b) => b.weeklyXp - a.weeklyXp);
    expect(rows[0].weeklyXp).toBeGreaterThanOrEqual(rows.at(-1).weeklyXp);
    expect(sorted[0].rank).toBe(1);
    const me = userRank(rows);
    expect(me).toMatchObject({ name: "Lan", weeklyXp: 120, isUser: true });
    expect(rows.filter((row) => row.zone === "promote").length).toBeGreaterThan(0);
    expect(rows.at(-1).zone).toBe("demote");
    expect(rows.at(-2).zone).toBe("demote");
  });

  it("tất định theo seed", () => {
    const a = buildCohort({ seed: 9, user: { name: "A", weeklyXp: 50 } });
    const b = buildCohort({ seed: 9, user: { name: "A", weeklyXp: 50 } });
    expect(a.map((row) => row.name)).toEqual(b.map((row) => row.name));
    const c = buildCohort({ seed: 10, user: { name: "A", weeklyXp: 50 } });
    expect(a.map((row) => row.name)).not.toEqual(c.map((row) => row.name));
  });

  it("giá trị mặc định", () => {
    const rows = buildCohort();
    expect(rows).toHaveLength(15);
    expect(userRank(rows)).toMatchObject({ name: "Bạn", weeklyXp: 0 });
    expect(rows.every((row) => RIVALS.includes(row.name) || row.isUser)).toBe(true);
    expect(userRank([])).toBeNull();
  });

  it("xử lý XP âm và danh sách tên xoay vòng", () => {
    const rows = buildCohort({ seed: 1, size: 4, user: { name: "", weeklyXp: -10 } });
    expect(rows).toHaveLength(4);
    expect(userRank(rows).weeklyXp).toBe(0);
    expect(userRank(rows).name).toBe("Bạn");
  });

  it("daysRemaining", () => {
    expect(daysRemaining(new Date("2026-11-16T10:00:00"))).toBe(7);
    expect(daysRemaining(new Date("2026-11-22T10:00:00"))).toBe(1);
  });
});
