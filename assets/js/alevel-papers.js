/* =========================================================================
   alevel-papers.js — CAIE / A-Level official paper component labels
   Paper code e.g. "12" → Paper 1, variant 2 → display as 9709/12
   ========================================================================= */
window.YYSD_ALEVEL_PAPERS = (function () {
  "use strict";

  var SEASON_MM = { m: "03", s: "06", w: "11" };
  var SEASON_ZH = { m: "Tháng 2–3", s: "Tháng 5–6", w: "Tháng 10–11" };
  var SEASON_SHORT = { m: "T2–3", s: "T5–6", w: "T10–11" };

  // CIE 标准：卷号十位 = Paper 序号（见 Desktop 编号规则说明.docx）
  var BY_CODE = {
    "9709": [
      { d: 1, short: "P1", name: "Pure Mathematics 1", nameZh: "Toán thuần túy P1", level: "AS/A2",
        desc: "11/12/13 · Đại số, hàm số, hình học tọa độ, lượng giác, dãy số và nhập môn giải tích" },
      { d: 2, short: "P2", name: "Pure Mathematics 2", nameZh: "Toán thuần túy P2", level: "AS",
        desc: "21/22/23 · Đại số, mũ và lôgarit, lượng giác, giải tích và giải phương trình bằng phương pháp số (chỉ lộ trình AS)" },
      { d: 3, short: "P3", name: "Pure Mathematics 3", nameZh: "Toán thuần túy P3", level: "A2",
        desc: "31/32/33 · Vectơ, phương trình vi phân và số phức trong Toán thuần túy A2" },
      { d: 4, short: "M1", name: "Mechanics", nameZh: "Cơ học M1", level: "AS/A2",
        desc: "41/42/43 · Lực và cân bằng, chuyển động thẳng, động lượng, định luật Newton, công và năng lượng" },
      { d: 5, short: "S1", name: "Probability & Statistics 1", nameZh: "Xác suất và thống kê S1", level: "AS/A2",
        desc: "51/52/53 · Biểu diễn dữ liệu, tổ hợp, xác suất, biến ngẫu nhiên rời rạc và phân phối chuẩn" },
      { d: 6, short: "S2", name: "Probability & Statistics 2", nameZh: "Xác suất và thống kê S2", level: "A2",
        desc: "61/62/63 · Phân phối Poisson, biến ngẫu nhiên liên tục, ước lượng và kiểm định giả thuyết" }
    ],
    "9231": [
      { d: 1, short: "FP1", name: "Further Pure Mathematics 1", nameZh: "Toán nâng cao FP1", level: "AS/A2",
        desc: "11/12/13 · Ma trận, số phức và chuỗi" },
      { d: 2, short: "FP2", name: "Further Pure Mathematics 2", nameZh: "Toán nâng cao FP2", level: "A2",
        desc: "21/22/23 · Toán thuần túy nâng cao ở A2" },
      { d: 3, short: "FM", name: "Further Mechanics", nameZh: "Toán nâng cao FM", level: "AS/A2",
        desc: "31/32/33 · Cơ học nâng cao" },
      { d: 4, short: "FS", name: "Further Probability & Statistics", nameZh: "Toán nâng cao FS", level: "AS/A2",
        desc: "41/42/43 · Xác suất và thống kê nâng cao" }
    ],
    "9700": "science",
    "9701": "science",
    "9702": "science",
    "9708": [
      { d: 1, short: "P1", name: "Multiple Choice", nameZh: "P1 Trắc nghiệm", level: "AS",
        desc: "11/12/13 · 30 câu trắc nghiệm thuộc chương trình AS" },
      { d: 2, short: "P2", name: "Data Response and Essays", nameZh: "P2 Xử lý dữ liệu", level: "AS",
        desc: "21/22/23 · Xử lý dữ liệu và trả lời ngắn theo chương trình AS" },
      { d: 3, short: "P3", name: "Multiple Choice", nameZh: "P3 Trắc nghiệm", level: "A2",
        desc: "31/32/33 · A2 Trắc nghiệm" },
      { d: 4, short: "P4", name: "Data Response and Essays", nameZh: "P4 Xử lý dữ liệu", level: "A2",
        desc: "41/42/43 · Xử lý dữ liệu và viết luận theo chương trình A2" }
    ],
    "9706": [
      { d: 1, short: "P1", name: "Multiple Choice", nameZh: "P1 Trắc nghiệm", level: "AS",
        desc: "11/12/13 · Trắc nghiệm theo chương trình AS" },
      { d: 2, short: "P2", name: "Structured Questions", nameZh: "P2 Câu hỏi có cấu trúc", level: "AS",
        desc: "21/22/23 · Câu hỏi có cấu trúc theo chương trình AS" },
      { d: 3, short: "P3", name: "Structured Questions", nameZh: "P3 Câu hỏi có cấu trúc", level: "A2",
        desc: "31/32/33 · Câu hỏi có cấu trúc theo chương trình A2" },
      { d: 4, short: "P4", name: "Structured Questions", nameZh: "P4 Câu hỏi có cấu trúc", level: "A2",
        desc: "41/42/43 · Câu hỏi có cấu trúc theo chương trình A2" }
    ]
  };

  var SCIENCE = [
    { d: 1, short: "P1", name: "Multiple Choice", nameZh: "P1 Trắc nghiệm", level: "AS",
      desc: "11/12/13 · Trắc nghiệm theo chương trình AS" },
    { d: 2, short: "P2", name: "AS Level Structured Questions", nameZh: "P2 AS · Câu hỏi có cấu trúc", level: "AS",
      desc: "21/22/23 · Trả lời câu hỏi có cấu trúc theo chương trình AS" },
    { d: 3, short: "P3", name: "Advanced Practical Skills", nameZh: "P3 AS · Thực hành", level: "AS",
      desc: "31/32/33 · Thực hành và phân tích dữ liệu để đánh giá kỹ năng thí nghiệm AS" },
    { d: 4, short: "P4", name: "A Level Structured Questions", nameZh: "P4 A2 · Câu hỏi có cấu trúc", level: "A2",
      desc: "41/42/43 · Trả lời câu hỏi có cấu trúc theo chương trình A2" },
    { d: 5, short: "P5", name: "Planning, Analysis and Evaluation", nameZh: "P5 A2 · Thực hành", level: "A2",
      desc: "51/52/53 · Thiết kế thí nghiệm, phân tích và đánh giá dữ liệu" }
  ];

  // 同一年份内：冬季 → 夏季 → 春季（考试日期新→旧）
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
        nameZh: "Paper " + digit,
        level: ""
      };
    }
    var hit = list.find(function (c) { return c.d === digit; });
    if (hit) return Object.assign({ digit: digit }, hit);
    return {
      digit: digit,
      short: "P" + digit,
      name: "Paper " + digit,
      nameZh: "Paper " + digit,
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
    return year + " " + (SEASON_ZH[season] || season);
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

  // 学为贵：数学/高数按卷别(P1/FP1…)，生物等按 AS/A2
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

  // CIE 标准：先 Paper 序号（十位），再变卷号（个位）；中国区 14/37 等按数值排
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
    return officialCode(code, paper) + " · " + meta.nameZh + " · " + (meta.level || "");
  }

  function componentTitle(comp) {
    return comp.short + " · " + comp.nameZh;
  }

  function rowTitle(code, paper, year, season) {
    return officialCode(code, paper) + " · " + sessionLine(year, season);
  }

  function rowMeta(paper) {
    return "Mã đề " + paperVariant(paper);
  }

  function sectionHeading(comp) {
    return comp.name + " (" + comp.nameZh + ")";
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
          seasonLabelZh: it.seasonLabelZh,
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
      return "Sắp xếp theo năm và kỳ thi, từ mới đến cũ. Trong mỗi kỳ, các phần thi và mã đề được xếp theo số tăng dần.";
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
