import { describe, expect, it } from "vitest";
import {
  SCHOLAR_BASE,
  availableSkills,
  citationCount,
  citationsFor,
  filterDocs,
  libraryStats,
  scholarUrl,
  searchDocs,
  sortDocs
} from "../vi/assets/js/library.js";

const docs = [
  {
    id: "a",
    title: "Ôn tập ngắt quãng",
    summary: "Cách nhớ lâu",
    author: "YYSD",
    year: "2026",
    level: "B1",
    skills: ["vocab", "reading"],
    tags: ["trí nhớ"],
    order: 2,
    citations: [
      { title: "Distributed practice", authors: "Cepeda", year: 2006, venue: "Psych Bulletin", query: "cepeda spaced" },
      { title: "Spacing", authors: "Kornell", year: 2009, venue: "ACP", query: "", url: "https://example.com/x" }
    ]
  },
  { id: "b", title: "Chiến lược nghe", summary: "Nghe hiểu", year: "2025", level: "B2", skills: ["listening"], tags: [], order: 1, citations: [] }
];

describe("scholarUrl", () => {
  it("tạo liên kết tìm kiếm", () => {
    expect(scholarUrl({ query: "spaced repetition" })).toBe(`${SCHOLAR_BASE}spaced%20repetition`);
    expect(scholarUrl({ title: "A title" })).toBe(`${SCHOLAR_BASE}A%20title`);
    expect(scholarUrl("chuỗi")).toBe(`${SCHOLAR_BASE}chu%E1%BB%97i`);
    expect(scholarUrl({})).toBe(SCHOLAR_BASE);
    expect(scholarUrl(null)).toBe(SCHOLAR_BASE);
  });
});

describe("thống kê", () => {
  it("citationCount và libraryStats", () => {
    expect(citationCount(docs[0])).toBe(2);
    expect(citationCount({})).toBe(0);
    expect(libraryStats(docs)).toEqual({ docs: 2, citations: 2, unique: 2 });
    expect(libraryStats()).toEqual({ docs: 0, citations: 0, unique: 0 });
  });
});

describe("tìm kiếm và lọc", () => {
  it("searchDocs trả tất cả khi rỗng", () => {
    expect(searchDocs(docs, "")).toHaveLength(2);
    expect(searchDocs(docs)).toHaveLength(2);
  });

  it("tìm theo tiêu đề, tóm tắt, tác giả, tag và trích dẫn", () => {
    expect(searchDocs(docs, "ngắt quãng").map((d) => d.id)).toEqual(["a"]);
    expect(searchDocs(docs, "trí nhớ").map((d) => d.id)).toEqual(["a"]);
    expect(searchDocs(docs, "yysd").map((d) => d.id)).toEqual(["a"]);
    expect(searchDocs(docs, "cepeda").map((d) => d.id)).toEqual(["a"]);
    expect(searchDocs(docs, "không có gì")).toEqual([]);
  });

  it("filterDocs theo kỹ năng và trình độ", () => {
    expect(filterDocs(docs, { skill: "listening" }).map((d) => d.id)).toEqual(["b"]);
    expect(filterDocs(docs, { level: "B1" }).map((d) => d.id)).toEqual(["a"]);
    expect(filterDocs(docs, { skill: "vocab", level: "B2" })).toEqual([]);
    expect(filterDocs(docs)).toHaveLength(2);
  });

  it("sortDocs", () => {
    expect(sortDocs(docs, "featured").map((d) => d.id)).toEqual(["b", "a"]);
    expect(sortDocs(docs, "citations").map((d) => d.id)).toEqual(["a", "b"]);
    expect(sortDocs(docs, "newest").map((d) => d.id)).toEqual(["a", "b"]);
    expect(sortDocs(docs).map((d) => d.id)).toEqual(["b", "a"]);
  });

  it("availableSkills sắp xếp duy nhất", () => {
    expect(availableSkills(docs)).toEqual(["listening", "reading", "vocab"]);
    expect(availableSkills()).toEqual([]);
  });
});

describe("citationsFor", () => {
  it("thêm url Scholar và giữ url có sẵn", () => {
    const citations = citationsFor(docs[0]);
    expect(citations[0].url).toContain("scholar.google.com");
    expect(citations[1].url).toBe("https://example.com/x");
    expect(citationsFor({})).toEqual([]);
    expect(citationsFor(null)).toEqual([]);
  });
});
