/* =========================================================================
   alevel-papers.js — CAIE / A-Level official paper component labels
   Paper code e.g. "12" → Paper 1, variant 2 → display as 9709/12
   ========================================================================= */
window.YYSD_ALEVEL_PAPERS = (function () {
  "use strict";

  var SEASON_MM = { m: "03", s: "06", w: "11" };
  var SEASON_ZH = { m: "mùa xuân", s: "mùa hè", w: "mùa đông" };
  var SEASON_SHORT = { m: "biến thể cũ của", s: "nhà Hạ khoảng 2000 TCN", w: "mùa đông" };

  // CIE Chuẩn:cuộn lại gầmhàng chục trong hệ thập phân = Paper số thứ tự(thấy Desktop đánh sốquy tắcGiải thích.docx)
  var BY_CODE = {
    "9709": [
      { d: 1, short: "P1", name: "Pure Mathematics 1", nameZh: "thuần khiết đếm P1", level: "AS/A2",
        desc: "11/12/13 · đại số,hàm số toán,tọa độ hình họchình học,hình tam giác,dãy số,toán vi tích phâncửa vào" },
      { d: 2, short: "P2", name: "Pure Mathematics 2", nameZh: "thuần khiết đếm P2", level: "AS",
        desc: "21/22/23 · đại số,chỉ số thống kêđúng đếm,hình tam giác,toán vi tích phân,lời giải sốphương trình toán học(hầu như AS hành trình)" },
      { d: 3, short: "P3", name: "Pure Mathematics 3", nameZh: "thuần khiết đếm P3", level: "A2",
        desc: "31/32/33 · toán vector,phương trình vi phân toán,ngôn ngữ học số nhiềuđợi A2 thuần khiết đếm" },
      { d: 4, short: "M1", name: "Mechanics", nameZh: "cơ học M1", level: "AS/A2",
        desc: "41/42/43 · họcân bằng,đường thẳngdi chuyển,động lượng,Newton tên gọiđịnh luật khoa học ví dụ: định luật bảo toàn năng lượng,hành động hoặc dịch vụ có công họ" },
      { d: 5, short: "S1", name: "Probability & Statistics 1", nameZh: "xác suất toánthống kê S1", level: "AS/A2",
        desc: "51/52/53 · dữ liệuvề ai đó bày tỏ,sắp xếp theo thứ tựlắp ráp,xác suất toán,các thành viên gia đình ly tántheo tình huốngbiến số toán,toán phân phối chuẩn" },
      { d: 6, short: "S2", name: "Probability & Statistics 2", nameZh: "xác suất toánthống kê S2", level: "A2",
        desc: "61/62/63 · phân phối Poisson trong thống kê,Liên tiếptheo tình huốngbiến số toán,ước tínhgiả sửkiểm tra" }
    ],
    "9231": [
      { d: 1, short: "FP1", name: "Further Pure Mathematics 1", nameZh: "toán cao cấp FP1", level: "AS/A2",
        desc: "11/12/13 · mảng,ngôn ngữ học số nhiều,toán học chuỗiđợi" },
      { d: 2, short: "FP2", name: "Further Pure Mathematics 2", nameZh: "toán cao cấp FP2", level: "A2",
        desc: "21/22/23 · nâng caothuần khiết đếm A2 Nội dung" },
      { d: 3, short: "FM", name: "Further Mechanics", nameZh: "toán cao cấp FM", level: "AS/A2",
        desc: "31/32/33 · nâng caocơ học" },
      { d: 4, short: "FS", name: "Further Probability & Statistics", nameZh: "toán cao cấp FS", level: "AS/A2",
        desc: "41/42/43 · nâng caoxác suất toánthống kê" }
    ],
    "9700": "science",
    "9701": "science",
    "9702": "science",
    "9708": [
      { d: 1, short: "P1", name: "Multiple Choice", nameZh: "P1 câu hỏi trắc nghiệm", level: "AS",
        desc: "11/12/13 · 30 đườngcâu hỏi trắc nghiệm,điều tra AS đề cương kỳ thi đề cương nội dung của kỳ thi" },
      { d: 2, short: "P2", name: "Data Response and Essays", nameZh: "P2 dữ liệuphản hồi", level: "AS",
        desc: "21/22/23 · dữ liệuphản hồiđơn giản hình thức gắn liền có nghĩa giống như từ tự do,điều tra AS đề cương kỳ thi đề cương nội dung của kỳ thi" },
      { d: 3, short: "P3", name: "Multiple Choice", nameZh: "P3 câu hỏi trắc nghiệm", level: "A2",
        desc: "31/32/33 · A2 câu hỏi trắc nghiệm" },
      { d: 4, short: "P4", name: "Data Response and Essays", nameZh: "P4 dữ liệuphản hồi", level: "A2",
        desc: "41/42/43 · dữ liệuphản hồiluận văn,điều tra A2 đề cương kỳ thi đề cương nội dung của kỳ thi" }
    ],
    "9706": [
      { d: 1, short: "P1", name: "Multiple Choice", nameZh: "P1 câu hỏi trắc nghiệm", level: "AS",
        desc: "11/12/13 · câu hỏi trắc nghiệm,điều tra AS đề cương kỳ thi đề cương nội dung của kỳ thi" },
      { d: 2, short: "P2", name: "Structured Questions", nameZh: "P2 cấu trúchọ", level: "AS",
        desc: "21/22/23 · cấu trúcbiến thể củacâu hỏi thi,điều tra AS đề cương kỳ thi đề cương nội dung của kỳ thi" },
      { d: 3, short: "P3", name: "Structured Questions", nameZh: "P3 cấu trúchọ", level: "A2",
        desc: "31/32/33 · cấu trúcbiến thể củacâu hỏi thi,điều tra A2 đề cương kỳ thi đề cương nội dung của kỳ thi" },
      { d: 4, short: "P4", name: "Structured Questions", nameZh: "P4 cấu trúchọ", level: "A2",
        desc: "41/42/43 · cấu trúcbiến thể củacâu hỏi thi,điều tra A2 đề cương kỳ thi đề cương nội dung của kỳ thi" }
    ]
  };

  var SCIENCE = [
    { d: 1, short: "P1", name: "Multiple Choice", nameZh: "P1 câu hỏi trắc nghiệm", level: "AS",
      desc: "11/12/13 · câu hỏi trắc nghiệm,điều tra AS đề cương kỳ thi đề cương nội dung của kỳ thi" },
    { d: 2, short: "P2", name: "AS Level Structured Questions", nameZh: "P2 AScấu trúchọ", level: "AS",
      desc: "21/22/23 · cấu trúcbiến thể củahỏi và đáphọ,điều tra AS đề cương kỳ thi đề cương nội dung của kỳ thi" },
    { d: 3, short: "P3", name: "Advanced Practical Skills", nameZh: "P3 ASthí nghiệmhọ", level: "AS",
      desc: "31/32/33 · thí nghiệmlàm việcdữ liệuphân tích,điều tra AS thí nghiệmKỹ năng" },
    { d: 4, short: "P4", name: "A Level Structured Questions", nameZh: "P4 A2cấu trúchọ", level: "A2",
      desc: "41/42/43 · cấu trúcbiến thể củahỏi và đáphọ,điều tra A2 đề cương kỳ thi đề cương nội dung của kỳ thi" },
    { d: 5, short: "P5", name: "Planning, Analysis and Evaluation", nameZh: "P5 A2thí nghiệmhọ", level: "A2",
      desc: "51/52/53 · thí nghiệmthiết kế,dữ liệuphân tíchđánh giá" }
  ];

  // giống hệtnăm cụ thểbên trong:mùa đông → mùa hè → mùa xuân(Kì thingày thángviết tắt của Tân Cương→cũ)
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

  // học làm với tư cách đắt:toán học/toán cao cấpnhấn cuộn lại họ(P1/FP1…),sinh vậtđợi nhấn AS/A2
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

  // CIE Chuẩn:trước Paper số thứ tự(hàng chục trong hệ thập phân),lại thay đổi cuộn lại gầm(hàng đơn vị trong hệ thập phân);Trung Quốchọ 14/37 đợi nhấngiá trị sốmột hàng
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
    return "thay đổi cuộn lại " + paperVariant(paper);
  }

  function sectionHeading(comp) {
    return comp.name + "(" + comp.nameZh + ")";
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
      return "nhấn CIE Chuẩncuộn lại gầmSắp xếp:Paper 1→2→…,giống Paper bên trong thay đổi cuộn lại 11→12→13→14…;năm cụ thểviết tắt của Tân Cương→cũ,đánhtháng cuối của mùa đông tức là tháng mười hai âm lịch→nhà Hạ khoảng 2000 TCN→biến thể cũ của.";
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
