import { describe, expect, it } from "vitest";
import {
  SKILL_PATH_UNITS,
  buildWordBankPool,
  evaluateExercise,
  getPathProgress,
  getUnitById,
  normalizeAnswer,
  selectAdaptiveDrill,
} from "../src/ielts-curriculum.js";
import {
  CAST_CHARACTERS,
  INTERACTIVE_STORIES,
  ROLEPLAY_SCENARIOS,
  evaluateSpeakingResponse,
  getRoleplayById,
  getStoryById,
} from "../src/stories-roleplay.js";
import {
  ACADEMIC_PDF_CATALOG,
  buildScholarlyReportHtml,
  getEnrichedPdfCatalog,
  getPdfById,
} from "../src/pdf-report.js";
import {
  STORAGE_KEY,
  commitHlrReview,
  commitUnitLesson,
  createDefaultAppState,
  createMemoryBacking,
  exportStateJson,
  importStateJson,
  loadAppState,
  recordExternalExamScore,
  saveAppState,
} from "../src/storage.js";

describe("ielts-curriculum", () => {
  it("kiểm chứng 8 chặng tuyến tính, xáo trộn Word Bank và chấm đủ 7 dạng bài + giải thích lỗi", () => {
    expect(SKILL_PATH_UNITS.length).toBe(8);
    expect(getUnitById("unit-1-listening-traps")?.order).toBe(1);
    expect(getUnitById("missing")).toBeNull();

    // Word bank luôn xáo trộn khác thứ tự đáp án và viết thường toàn bộ
    for (const unit of SKILL_PATH_UNITS) {
      for (const ex of unit.exercises) {
        if (ex.answerTokens) {
          const pool = buildWordBankPool(ex);
          expect(pool.every((c) => c.text === c.text.toLowerCase())).toBe(true);
          const prefix = pool.slice(0, ex.answerTokens.length).map((c) => c.text).join(" ");
          expect(prefix).not.toBe(ex.answerTokens.join(" ").toLowerCase());
        }
      }
    }
    // Nhánh đảo vị trí khi tình cờ trùng thứ tự đáp án + nhánh tie-breaker chipId
    const synthetic = buildWordBankPool({ id: "syn", answerTokens: ["a", "b"] });
    expect(synthetic.map((c) => c.text)).toEqual(["b", "a"]);
    const tiePool = buildWordBankPool({ id: "t", answerTokens: ["alpha", "apple", "amber"] });
    expect(tiePool.length).toBe(3);

    expect(normalizeAnswer("  Accommodation. ")).toBe("accommodation");
    expect(normalizeAnswer(null)).toBe("");

    // Chấm MCQ, Cloze, Word Bank, Pairs, TFNG, Error Fix, SUS (cả word bank lẫn trắc nghiệm)
    const u1 = getUnitById("unit-1-listening-traps");
    expect(evaluateExercise(u1.exercises[0], "£180").correct).toBe(true);
    const wrongMcq = evaluateExercise(u1.exercises[0], "");
    expect(wrongMcq.correct).toBe(false);
    expect(wrongMcq.userDisplay).toBe("(Chưa trả lời)");
    expect(wrongMcq.explanation.citation.scholarUrl).toContain("scholar.google.com");

    expect(evaluateExercise(u1.exercises[1], "Accommodation").correct).toBe(true);
    expect(evaluateExercise(u1.exercises[1], null).correct).toBe(false);

    expect(evaluateExercise(u1.exercises[2], u1.exercises[2].answerTokens).correct).toBe(true);
    expect(
      evaluateExercise(u1.exercises[2], u1.exercises[2].answerTokens.join(" ")).correct,
    ).toBe(true);

    const pairAns = Object.fromEntries(u1.exercises[3].pairs.map((p) => [p.left, p.right]));
    expect(evaluateExercise(u1.exercises[3], pairAns).correct).toBe(true);
    expect(evaluateExercise(u1.exercises[3], null).correct).toBe(false);

    const u8 = getUnitById("unit-8-sus-c2-synthesis");
    expect(evaluateExercise(u8.exercises[0], u8.exercises[0].answerTokens).correct).toBe(true);
    expect(evaluateExercise(u8.exercises[1], u8.exercises[1].answer).correct).toBe(true);

    // Bài tập không có citationId & kiểu lạ
    const customEval = evaluateExercise({ id: "x", type: "other", ruleVi: "r", trapVi: "t" }, "");
    expect(customEval.explanation.citation).toBeNull();

    // Tiến độ cây kỹ năng & chọn bài thích ứng
    const prog = getPathProgress({
      "unit-1-listening-traps": 3,
      "unit-2-reading-tfng": 1,
    });
    expect(prog[0].status).toBe("legendary");
    expect(prog[1].status).toBe("completed");
    expect(prog[2].status).toBe("current");
    expect(prog[3].status).toBe("available");
    expect(getPathProgress()[0].status).toBe("current");

    expect(selectAdaptiveDrill(130, 90, 4).targetDifficulty).toBe(3);
    expect(selectAdaptiveDrill(85, 90, 4).targetDifficulty).toBe(3);
    expect(selectAdaptiveDrill(85, 50, 4).targetDifficulty).toBe(1);
    expect(selectAdaptiveDrill(85, 75, 0).targetDifficulty).toBe(2);
    expect(selectAdaptiveDrill(0, 50, 3).targetDifficulty).toBe(1);
    expect(selectAdaptiveDrill().exercises.length).toBe(5);
  });
});

describe("stories-roleplay", () => {
  it("cung cấp 4 nhân vật, 3 truyện tương tác, 3 kịch bản nhập vai và bộ chấm 4 tiêu chí Speaking", () => {
    expect(Object.keys(CAST_CHARACTERS)).toEqual(["linh", "hung", "mai", "sida"]);
    expect(INTERACTIVE_STORIES.length).toBe(3);
    expect(ROLEPLAY_SCENARIOS.length).toBe(3);

    expect(getStoryById("story-dissertation-pivot")?.cefr).toBe("B2");
    expect(getStoryById("none")).toBeNull();
    const rp = getRoleplayById("rp-speaking-part3-ai");
    expect(rp?.character).toBe("linh");
    expect(getRoleplayById("none")).toBeNull();

    // Câu quá ngắn
    expect(evaluateSpeakingResponse(rp, "Yes good").valid).toBe(false);
    expect(evaluateSpeakingResponse(rp, null).valid).toBe(false);

    // Câu trả lời Band 8+
    const high = evaluateSpeakingResponse(
      rp,
      "I believe AI tutoring acts as a double-edged sword because diagnostic feedback supports autonomous critical thinking, whereas uncritical over-reliance could weaken independent analytical synthesis significantly.",
    );
    expect(high.valid).toBe(true);
    expect(high.overallBand).toBeGreaterThanOrEqual(7.5);
    expect(high.matchedKeywords.length).toBeGreaterThanOrEqual(4);

    // Câu trả lời trung bình có lỗi chuyển di tiếng Việt
    const mid = evaluateSpeakingResponse(
      rp,
      "According to me, although technology helps students find informations, but because people are lazy so they copy answers every day.",
    );
    expect(mid.valid).toBe(true);
    expect(mid.overallBand).toBeGreaterThanOrEqual(6.5);
    expect(mid.transferTipsVi.length).toBe(4);

    // Câu trả lời ngắn đơn giản không từ nối và lặp từ (uniqueRatio < 0.7)
    const basic = evaluateSpeakingResponse(rp, "Books are good and books are good and books help.");
    expect(basic.valid).toBe(true);
    expect(basic.overallBand).toBeLessThan(6.5);
    expect(basic.criteria.fluencyCoherence.noteVi).toContain("từ đánh dấu");
  });
});

describe("pdf-report & storage", () => {
  it("làm giàu danh mục 6 PDF học thuật và xuất báo cáo HTML đầy đủ trích dẫn Google Scholar", () => {
    expect(ACADEMIC_PDF_CATALOG.length).toBe(6);
    const catalog = getEnrichedPdfCatalog();
    expect(catalog[0].citationCount).toBe(80);
    expect(catalog.every((d) => d.citationCount >= 20)).toBe(true);
    expect(getPdfById("pdf-reading-science")?.filePath).toContain(".pdf");
    expect(getPdfById("missing")).toBeNull();

    const htmlDefault = buildScholarlyReportHtml();
    expect(htmlDefault).toContain('lang="vi"');
    expect(htmlDefault).toContain("https://scholar.google.com/scholar?q=");

    const st = createDefaultAppState(Date.parse("2026-11-18T10:00:00Z"));
    const htmlFull = buildScholarlyReportHtml({
      learnerName: "Trần <Minh> & \"Anh\"",
      proficiencyScore: 155,
      targetBand: 7.0,
      gamification: { streak: 12, leagueTier: 5 },
      hlrCards: [...st.hlrCards, { id: "z", term: "z", meaningVi: "z", halfLifeHours: 0 }],
      includeAllCitations: true,
    });
    expect(htmlFull).toContain("&lt;Minh&gt;");
    expect(htmlFull).toContain("80 công trình");
    expect(htmlFull).toContain("Giải Lục bảo");
    expect(buildScholarlyReportHtml({ learnerName: null })).toContain("Báo Cáo Học Thuật");
  });

  it("lưu/tải trạng thái bền vững, đồng bộ bài học, ôn tập HLR, điểm thi Cambridge và sao lưu JSON", () => {
    const t0 = Date.parse("2026-11-18T12:00:00Z");
    const mem = createMemoryBacking();
    expect(mem.getItem("none")).toBeNull();
    mem.setItem("tmp", "1");
    mem.removeItem("tmp");
    expect(mem.getItem("tmp")).toBeNull();

    // Tải khi chưa có dữ liệu / không có backing / dữ liệu lỗi
    expect(loadAppState(null, t0).version).toBe(1);
    expect(loadAppState(mem, t0).hlrCards.length).toBe(8);
    mem.setItem(STORAGE_KEY, "{bad-json");
    expect(loadAppState(mem, t0).version).toBe(1);
    mem.setItem(STORAGE_KEY, JSON.stringify({ version: 999 }));
    expect(loadAppState(mem, t0).version).toBe(1);
    mem.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        profile: { targetBand: "bad" },
        completedUnits: null,
        completedStories: null,
        completedRoleplays: null,
        hlrCards: [],
        bandit: {},
        activityLog: null,
      }),
    );
    expect(loadAppState(mem, t0).profile.targetBand).toBe(7.5);
    mem.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        completedUnits: { u1: 1 },
        completedStories: ["s1"],
        completedRoleplays: ["r1"],
        activityLog: [{ type: "lesson" }],
      }),
    );
    expect(loadAppState(mem, t0).completedStories).toEqual(["s1"]);

    // Lỗi khi ghi localStorage đầy bộ nhớ
    const brokenBacking = {
      getItem() { throw new Error("denied"); },
      setItem() { throw new Error("quota"); },
    };
    expect(loadAppState(brokenBacking, t0).version).toBe(1);
    expect(saveAppState(null, {})).toBe(false);
    expect(saveAppState(brokenBacking, {})).toBe(false);

    // Ghi nhận chặng học mới (độ chính xác cao & thấp)
    let st = createDefaultAppState();
    const u5 = getUnitById("unit-5-writing-task2");
    const c1 = commitUnitLesson(st, { unit: u5, correctCount: 3, totalCount: 3, nowMs: t0 });
    expect(c1.state.completedUnits[u5.id]).toBe(1);
    expect(c1.state.hlrCards.length).toBe(10);
    const c2 = commitUnitLesson(c1.state, { unit: u5, correctCount: 1, totalCount: 3 });
    expect(c2.state.completedUnits[u5.id]).toBe(2);

    // Ghi nhận ôn tập HLR
    expect(commitHlrReview(c2.state, "missing", true, t0).ok).toBe(false);
    const rev1 = commitHlrReview(c2.state, c2.state.hlrCards[0].id, true, t0);
    expect(rev1.ok).toBe(true);
    const rev2 = commitHlrReview(rev1.state, rev1.state.hlrCards[0].id, false);
    expect(rev2.ok).toBe(true);

    // Đồng bộ điểm thi Cambridge IELTS
    const ex1 = recordExternalExamScore(rev2.state, {
      title: "Cambridge IELTS 19 Test 1",
      skill: "listening",
      score: 35,
      total: 40,
      wrongWords: [
        { term: "archipelago", meaningVi: "quần đảo" },
        { term: "archipelago", meaningVi: "trùng lặp" },
        { term: "   " },
        { term: "silt", meaningVi: "" },
        null,
      ],
      nowMs: t0,
    });
    expect(ex1.computedBand).toBe(8.0);
    expect(ex1.addedCardsCount).toBe(2);

    const ex2 = recordExternalExamScore(ex1.state, {
      skill: "writing",
      score: 10,
      total: 40,
      band: 7.0,
    });
    expect(ex2.computedBand).toBe(7.0);
    expect(recordExternalExamScore(ex2.state).computedBand).toBe(2.0);

    // Sao lưu & khôi phục JSON
    expect(saveAppState(mem, ex2.state)).toBe(true);
    const exported = exportStateJson(ex2.state);
    const imported = importStateJson(exported, t0);
    expect(imported.ok).toBe(true);
    expect(imported.state.gamification.cambridgeCompleted).toBe(2);
    expect(importStateJson("bad").ok).toBe(false);
    expect(importStateJson(null).ok).toBe(false);
    expect(importStateJson('{"version":2}').ok).toBe(false);
    expect(importStateJson(exported).ok).toBe(true);
  });
});
