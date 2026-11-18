/* =========================================================================
   alevel-papers.js — CAIE / A-Level official paper component labels
   Paper code e.g. "12" → Paper 1, variant 2 → display as 9709/12
   ========================================================================= */
window.YYSD_ALEVEL_PAPERS = (function () {
  "use strict";

  var SEASON_MM = { m: "03", s: "06", w: "11" };
  var SEASON_VI = { m: "Tháng 2–3", s: "Tháng 5–6", w: "Tháng 10–11" };
  var SEASON_SHORT = { m: "T2–3", s: "T5–6", w: "T10–11" };

  // The tens digit identifies the CIE paper.
  var BY_CODE = {
    "9709": [
      { d: 1, short: "P1", name: "Pure Mathematics 1", nameVi: "Toán thuần túy P1", level: "AS/A2",
        desc: "11/12/13 · đại số, hàm số, hình học tọa độ, lượng giác, dãy số và nhập môn giải tích" },
      { d: 2, short: "P2", name: "Pure Mathematics 2", nameVi: "Toán thuần túy P2", level: "AS",
        desc: "21/22/23 · đại số, hàm mũ và logarit, lượng giác, giải tích, giải phương trình bằng phương pháp số (lộ trình AS)" },
      { d: 3, short: "P3", name: "Pure Mathematics 3", nameVi: "Toán thuần túy P3", level: "A2",
        desc: "31/32/33 · vectơ, phương trình vi phân, số phức và các chủ đề toán thuần túy A2" },
      { d: 4, short: "M1", name: "Mechanics", nameVi: "Cơ học M1", level: "AS/A2",
        desc: "41/42/43 · lực và cân bằng, chuyển động thẳng, động lượng, các định luật Newton, công và năng lượng" },
      { d: 5, short: "S1", name: "Probability & Statistics 1", nameVi: "Xác suất và thống kê S1", level: "AS/A2",
        desc: "51/52/53 · biểu diễn dữ liệu, hoán vị và tổ hợp, xác suất, biến ngẫu nhiên rời rạc và phân phối chuẩn" },
      { d: 6, short: "S2", name: "Probability & Statistics 2", nameVi: "Xác suất và thống kê S2", level: "A2",
        desc: "61/62/63 · phân phối Poisson, biến ngẫu nhiên liên tục, ước lượng và kiểm định giả thuyết" }
    ],
    "9231": [
      { d: 1, short: "FP1", name: "Further Pure Mathematics 1", nameVi: "Toán nâng cao FP1", level: "AS/A2",
        desc: "11/12/13 · ma trận, số phức và chuỗi số" },
      { d: 2, short: "FP2", name: "Further Pure Mathematics 2", nameVi: "Toán nâng cao FP2", level: "A2",
        desc: "21/22/23 · toán thuần túy nâng cao ở bậc A2" },
      { d: 3, short: "FM", name: "Further Mechanics", nameVi: "Toán nâng cao FM", level: "AS/A2",
        desc: "31/32/33 · cơ học nâng cao" },
      { d: 4, short: "FS", name: "Further Probability & Statistics", nameVi: "Toán nâng cao FS", level: "AS/A2",
        desc: "41/42/43 · xác suất và thống kê nâng cao" }
    ],
    "9700": "science",
    "9701": "science",
    "9702": "science",
    "9708": [
      { d: 1, short: "P1", name: "Multiple Choice", nameVi: "P1 Trắc nghiệm", level: "AS",
        desc: "11/12/13 · 30 câu trắc nghiệm theo chương trình AS" },
      { d: 2, short: "P2", name: "Data Response and Essays", nameVi: "P2 Phân tích dữ liệu", level: "AS",
        desc: "21/22/23 · phân tích dữ liệu và câu trả lời ngắn theo chương trình AS" },
      { d: 3, short: "P3", name: "Multiple Choice", nameVi: "P3 Trắc nghiệm", level: "A2",
        desc: "31/32/33 · trắc nghiệm A2" },
      { d: 4, short: "P4", name: "Data Response and Essays", nameVi: "P4 Phân tích dữ liệu", level: "A2",
        desc: "41/42/43 · phân tích dữ liệu và viết luận theo chương trình A2" }
    ],
    "9706": [
      { d: 1, short: "P1", name: "Multiple Choice", nameVi: "P1 Trắc nghiệm", level: "AS",
        desc: "11/12/13 · trắc nghiệm theo chương trình AS" },
      { d: 2, short: "P2", name: "Structured Questions", nameVi: "P2  – Câu hỏi có cấu trúc", level: "AS",
        desc: "21/22/23 · câu hỏi có cấu trúc theo chương trình AS" },
      { d: 3, short: "P3", name: "Structured Questions", nameVi: "P3  – Câu hỏi có cấu trúc", level: "A2",
        desc: "31/32/33 · câu hỏi có cấu trúc theo chương trình A2" },
      { d: 4, short: "P4", name: "Structured Questions", nameVi: "P4  – Câu hỏi có cấu trúc", level: "A2",
        desc: "41/42/43 · câu hỏi có cấu trúc theo chương trình A2" }
    ]
  };

  var SCIENCE = [
    { d: 1, short: "P1", name: "Multiple Choice", nameVi: "P1 Trắc nghiệm", level: "AS",
      desc: "11/12/13 · trắc nghiệm theo chương trình AS" },
    { d: 2, short: "P2", name: "AS Level Structured Questions", nameVi: "P2 AS – Câu hỏi có cấu trúc", level: "AS",
      desc: "21/22/23 · câu hỏi có cấu trúc theo chương trình AS" },
    { d: 3, short: "P3", name: "Advanced Practical Skills", nameVi: "P3 AS – Thực hành", level: "AS",
      desc: "31/32/33 · thực hành thí nghiệm và phân tích dữ liệu ở bậc AS" },
    { d: 4, short: "P4", name: "A Level Structured Questions", nameVi: "P4 A2 – Câu hỏi có cấu trúc", level: "A2",
      desc: "41/42/43 · câu hỏi có cấu trúc theo chương trình A2" },
    { d: 5, short: "P5", name: "Planning, Analysis and Evaluation", nameVi: "P5 A2 – Thực hành", level: "A2",
      desc: "51/52/53 · thiết kế thí nghiệm, phân tích và đánh giá dữ liệu" }
  ];

  // Sort sessions newest first within each year.
  var SEASON_SORT = { w: 1, s: 2, m: 3 };

  function schema(code) {
    var key = String(code).toUpperCase();
    var s = BY_CODE[key];
    if (s === "science") return SCIENCE;
    if (Array.isArray(s)) return s;
    return null;
  }

  function paperDigit(paper) {
    var p = String(paper);
    if (p.length < 2) return parseInt(p, 10) || 0;
    return parseInt(p.charAt(0), 10);
  }

  function paperVariant(paper) {
    return String(paper).slice(-1);
  }

  function componentMeta(code, paper) {
    var digit = paperDigit(paper);
    var list = schema(code);
    if (!list) {
      return {
        digit: digit,
        short: "P" + digit,
        name: "Paper " + digit,
        nameVi: "Paper " + digit,
        level: ""
      };
    }
    var hit = list.find(function (c) { return c.d === digit; });
    if (hit) return Object.assign({ digit: digit }, hit);
    return {
      digit: digit,
      short: "P" + digit,
      name: "Paper " + digit,
      nameVi: "Paper " + digit,
      level: ""
    };
  }

  function officialCode(code, paper) {
    return String(code).toUpperCase() + "/" + String(paper);
  }

  function fileStem(code, season, yy, paper) {
    return String(code).toLowerCase() + "_" + season + String(yy).slice(-2) + "_" + String(paper);
  }

  function sessionLine(year, season) {
    return year + " " + (SEASON_VI[season] || season);
  }

  function sessionShort(season) {
    return SEASON_SHORT[season] || season;
  }

  function subjectFileTag(name) {
    return String(name || "").replace(/[^A-Za-z0-9]+/g, "");
  }

  function displayFilename(type, subjectName, year, season, paper) {
    return type + "-" + year + (SEASON_MM[season] || "06") + "-" +
      subjectFileTag(subjectName) + "-P" + paper + ".pdf";
  }

  function matchesLevel(code, paper, filter) {
    if (!filter || filter === "all") return true;
    var lvl = componentMeta(code, paper).level || "";
    if (filter === "as") return lvl.indexOf("AS") >= 0;
    if (filter === "a2") return lvl.indexOf("A2") >= 0;
    return true;
  }

  // Use components for mathematics and AS/A2 for the sciences.
  function filterMode(code) {
    var key = String(code).toUpperCase();
    if (key === "9709" || key === "9231") return "component";
    if (key === "9700") return "level";
    return "level";
  }

  function matchesComponent(code, paper, filter) {
    if (!filter || filter === "all") return true;
    return String(paperDigit(paper)) === String(filter);
  }

  // Sort first by component, then by variant number.
  function comparePaper(code, paperA, paperB) {
    var da = paperDigit(paperA);
    var db = paperDigit(paperB);
    if (da !== db) return da - db;
    return (parseInt(String(paperA), 10) || 0) - (parseInt(String(paperB), 10) || 0);
  }

  function sortFlatRows(rows) {
    return rows.slice().sort(function (a, b) {
      if (b.year !== a.year) return b.year - a.year;
      var sa = SEASON_SORT[a.season] || 9;
      var sb = SEASON_SORT[b.season] || 9;
      if (sa !== sb) return sa - sb;
      return comparePaper(a.code || b.code, a.paper, b.paper);
    });
  }

  function rowSubtitle(code, paper) {
    var meta = componentMeta(code, paper);
    return officialCode(code, paper) + " · " + meta.nameVi + " · " + (meta.level || "");
  }

  function componentTitle(comp) {
    return comp.short + " · " + comp.nameVi;
  }

  function rowTitle(code, paper, year, season) {
    return officialCode(code, paper) + " · " + sessionLine(year, season);
  }

  function rowMeta(paper) {
    return "Mã đề " + paperVariant(paper);
  }

  function sectionHeading(comp) {
    return comp.name + " (" + comp.nameVi + ")";
  }

  function componentsPresent(code, items) {
    var seen = {};
    items.forEach(function (it) {
      seen[paperDigit(it.paper)] = true;
    });
    var list = schema(code) || [];
    var out = [];
    list.forEach(function (c) {
      if (seen[c.d]) out.push(c);
    });
    Object.keys(seen).forEach(function (d) {
      d = parseInt(d, 10);
      if (!out.some(function (c) { return c.d === d; })) {
        out.push(componentMeta(code, d + "1"));
      }
    });
    out.sort(function (a, b) { return a.d - b.d; });
    return out;
  }

  function pairRows(items) {
    var map = {};
    items.forEach(function (it) {
      var key = it.year + "|" + it.season + "|" + it.paper;
      if (!map[key]) {
        map[key] = {
          year: it.year,
          season: it.season,
          seasonLabelVi: it.seasonLabelVi,
          paper: it.paper,
          code: it.code,
          qp: null,
          ms: null
        };
      }
      map[key][it.type] = it;
    });
    return Object.keys(map).map(function (k) { return map[k]; });
  }

  function groupByComponent(code, items) {
    var rows = pairRows(items);
    var groups = {};
    rows.forEach(function (row) {
      var digit = paperDigit(row.paper);
      if (!groups[digit]) groups[digit] = [];
      groups[digit].push(row);
    });
    Object.keys(groups).forEach(function (d) {
      groups[d].sort(function (a, b) {
        if (b.year !== a.year) return b.year - a.year;
        var sa = SEASON_SORT[a.season] || 9;
        var sb = SEASON_SORT[b.season] || 9;
        if (sa !== sb) return sa - sb;
        return comparePaper(code, a.paper, b.paper);
      });
    });
    return groups;
  }

  function hintFor(code) {
    if (schema(code)) {
      return "Xếp theo số bài thi CIE (Paper 1, 2…), rồi đến mã đề (11, 12, 13…). Năm và kỳ thi được xếp từ mới đến cũ.";
    }
    return "";
  }

  return {
    schema: schema,
    paperDigit: paperDigit,
    paperVariant: paperVariant,
    componentMeta: componentMeta,
    officialCode: officialCode,
    fileStem: fileStem,
    sessionLine: sessionLine,
    sessionShort: sessionShort,
    displayFilename: displayFilename,
    filterMode: filterMode,
    matchesLevel: matchesLevel,
    matchesComponent: matchesComponent,
    comparePaper: comparePaper,
    sortFlatRows: sortFlatRows,
    rowSubtitle: rowSubtitle,
    componentTitle: componentTitle,
    rowTitle: rowTitle,
    rowMeta: rowMeta,
    sectionHeading: sectionHeading,
    componentsPresent: componentsPresent,
    pairRows: pairRows,
    groupByComponent: groupByComponent,
    hintFor: hintFor
  };
})();
