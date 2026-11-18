import { describe, expect, it } from "vitest";
import {
  SCHOLAR_CITATIONS,
  SCHOLAR_DOMAINS,
  buildDoiUrl,
  buildScholarUrl,
  formatApaCitation,
  formatBibtexCitation,
  getAllCitations,
  getCitationById,
  getCitationsByDomain,
  getCitationsForSkills,
  getDomainStats,
  searchCitations,
} from "../src/index.js";

describe("scholar-citations", () => {
  it("cung cấp đầy đủ 80 công trình khoa học kiểm chứng có liên kết Google Scholar hợp lệ", () => {
    const all = getAllCitations();
    expect(all.length).toBe(80);
    expect(all).toBe(SCHOLAR_CITATIONS);
    const ids = new Set();
    for (const c of all) {
      expect(ids.has(c.id)).toBe(false);
      ids.add(c.id);
      expect(c.scholarUrl.startsWith("https://scholar.google.com/scholar?q=")).toBe(true);
      expect(c.year).toBeGreaterThanOrEqual(1988);
      expect(c.year).toBeLessThanOrEqual(2026);
      expect(c.takeawayVi.length).toBeGreaterThan(20);
      expect(Object.keys(SCHOLAR_DOMAINS)).toContain(c.domain);
    }
  });

  it("tạo đúng URL Google Scholar và URL DOI cho cả công trình có và không có DOI", () => {
    const withDoi = getCitationById("settles2016hlr");
    expect(buildDoiUrl(withDoi)).toBe("https://doi.org/10.18653/v1/P16-1174");
    expect(buildScholarUrl(withDoi)).toContain(encodeURIComponent("10.18653/v1/P16-1174"));

    const noDoi = getCitationById("khalifa2009reading");
    expect(buildDoiUrl(noDoi)).toBe("");
    expect(buildScholarUrl(noDoi)).toContain("Khalifa");

    expect(getCitationById("khong_ton_tai")).toBeNull();
    expect(getCitationById("")).toBeNull();
  });

  it("lọc và tìm kiếm trích dẫn theo lĩnh vực, tác giả, năm, DOI và tiếng Việt", () => {
    expect(getCitationsByDomain("all").length).toBe(80);
    expect(getCitationsByDomain("").length).toBe(80);
    const reading = getCitationsByDomain("reading");
    expect(reading.length).toBeGreaterThanOrEqual(7);
    expect(reading.every((c) => c.domain === "reading")).toBe(true);

    expect(searchCitations("").length).toBe(80);
    expect(searchCitations(null).length).toBe(80);
    expect(searchCitations("Settles").some((c) => c.id === "settles2016hlr")).toBe(true);
    expect(searchCitations("Việt Nam", "vietnamese-efl").length).toBeGreaterThanOrEqual(4);
    expect(searchCitations("khong_he_co_tu_khoa_nay_xyz")).toEqual([]);
  });

  it("định dạng chuẩn APA 7 và BibTeX cho cả trường hợp có DOI và không có DOI", () => {
    const hlr = getCitationById("settles2016hlr");
    const apaDoi = formatApaCitation(hlr);
    expect(apaDoi).toContain("Settles, B., & Meeder, B. (2016).");
    expect(apaDoi).toContain("https://doi.org/10.18653/v1/P16-1174");

    const bibDoi = formatBibtexCitation(hlr);
    expect(bibDoi).toContain("@article{settles2016hlr,");
    expect(bibDoi).toContain("doi = {10.18653/v1/P16-1174},");

    const weir = getCitationById("khalifa2009reading");
    const apaNoDoi = formatApaCitation(weir);
    expect(apaNoDoi).toContain("https://scholar.google.com/scholar?q=");
    const bibNoDoi = formatBibtexCitation(weir);
    expect(bibNoDoi).not.toContain("doi = {");
  });

  it("thống kê chính xác theo 8 lĩnh vực và gợi ý tài liệu theo kỹ năng học viên", () => {
    const stats = getDomainStats();
    expect(stats.length).toBe(8);
    expect(stats.reduce((s, d) => s + d.count, 0)).toBe(80);
    expect(stats.every((d) => d.count >= 6)).toBe(true);

    const rec = getCitationsForSkills(["writing", "invalid-skill"], 8);
    expect(rec.length).toBe(8);
    const defaultRec = getCitationsForSkills();
    expect(defaultRec.length).toBe(12);
    const zeroLimitRec = getCitationsForSkills(["reading"], 0);
    expect(zeroLimitRec.length).toBe(12);
  });
});
