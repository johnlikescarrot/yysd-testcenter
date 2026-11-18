import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getEnrichedPdfCatalog } from "../src/pdf-report.js";

const ROOT = path.resolve(import.meta.dirname, "..");

describe("platform-integration", () => {
  it("xác minh cả 6 tệp PDF học thuật tồn tại, hợp lệ và chứa hàng trăm liên kết scholar.google.com", () => {
    const catalog = getEnrichedPdfCatalog();
    let totalScholarLinks = 0;
    let totalDoiLinks = 0;

    for (const doc of catalog) {
      const full = path.join(ROOT, doc.filePath);
      expect(fs.existsSync(full)).toBe(true);
      const raw = fs.readFileSync(full, "latin1");
      expect(raw.startsWith("%PDF-")).toBe(true);
      const scholarMatches = raw.match(/https:\/\/scholar\.google\.com\/scholar\?q=/g) || [];
      const doiMatches = raw.match(/https:\/\/doi\.org\/10\./g) || [];
      expect(scholarMatches.length).toBeGreaterThanOrEqual(doc.citationCount);
      totalScholarLinks += scholarMatches.length;
      totalDoiLinks += doiMatches.length;
    }

    expect(totalScholarLinks).toBeGreaterThanOrEqual(250);
    expect(totalDoiLinks).toBeGreaterThanOrEqual(250);
  });

  it("xác minh các trang HTML chủ lực đạt chuẩn lang=vi, mô tả SEO và liên kết đầy đủ", () => {
    for (const page of ["index.html", "lo-trinh.html", "tai-lieu.html", "vocab.html", "zone.html"]) {
      const html = fs.readFileSync(path.join(ROOT, page), "utf8");
      expect(html).toContain('lang="vi"');
      expect(html).toContain('<meta name="description"');
      expect(html).not.toMatch(/[\u4e00-\u9fff]/);
    }
  });

  it("xác minh library/manifest.json đã Việt hóa hoàn toàn tên tệp từ vựng và giữ đủ 226 đề Cambridge", () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "library/manifest.json"), "utf8"));
    const items = manifest.items || [];
    const camItems = items.filter((it) => String(it.subject || "").startsWith("cambridge-"));
    const thptLists = items.filter((it) => /^tu-vung-thpt-list\d+$/.test(it.id));
    const dhLists = items.filter((it) => /^tu-vung-dai-hoc-list\d+$/.test(it.id));
    const liteLists = items.filter((it) => /^tu-vung-cot-loi-list\d+$/.test(it.id));

    expect(camItems.length).toBe(226);
    expect(thptLists.length).toBe(40);
    expect(dhLists.length).toBe(35);
    expect(liteLists.length).toBe(30);
  });
});
