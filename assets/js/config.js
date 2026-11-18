/* =========================================================================
   config.js — shared taxonomy + helpers for YYSDTrung tâm Học tập
   Loaded by the landing page, zone pages, the viewer and results page.
   ========================================================================= */
window.YYSD = (function () {
  "use strict";

  // Bump when library HTML changes so exam iframe skips stale browser cache.
  var CONTENT_VER = "20260909jtopen";
  // ponytail: Cambridge 7/12 Cambridge 10 T4P2 vẫn sự thiếu,mục lụcchỉliệt kêđã có sách
  var JINGTING_OPEN = true;
  var WRONG_WORDS_KEY = "yysd:wrong-words";
  var SAVED_WORDS_KEY = "yysd:saved-words";

  // Homepage display order: Khu vực Từ vựng → Khu vực Luyện tập → Khu vực Đề thi thật
  var ZONES = ["study", "practice", "mock"];

  var ZONE = {
    study:    { label: "Khu vực Từ vựng", en: "Words", icon: "📚",
                desc: "biến thể cũ của viết tắt của,Sổ lỗi sai AI họ biến thể cũ của,bên học bên khảo sát,tá từ mượn chắc chắnCơ bản." },
    practice: { label: "Khu vực Luyện tập", en: "Practice", icon: "✏️",
                desc: "chiều dài khó để biến thể của,chữ sốcủa học sinh viết chính tảđợichuyên biệthuấn luyện,tập trungdùng trong và phần." },
    mock:     { label: "Đề thi thật IELTS", en: "IELTS Past Papers", icon: "🎯",
                desc: "Cambridge IELTSNghe / Đọc / Viếtnăm dương lịchĐề thi thật,trực tuyếnLuyện tập." },
    toefl:    { label: "nâng bằng tay họĐề thi thật", en: "TOEFL", icon: "🎯",
                desc: "viết tắt của Tân Cương nâng bằng tay họĐọchọ đánh:Luyện tậpkhôngđặt giới hạn thời gian,Thi thửnhấnmô-đun trong phần mềmđo thời gian." }
  };

  // ordered subjects per zone (leaf keys used by the manifest / folder classification)
  var ZONE_SUBJECTS = {
    study:    ["grammar", "vocab", "vocab-cet4", "vocab-cet4-lite",
               "vocab-special-listening", "vocab-special-reading", "vocab-special-writing",
               "vocab-themes"],
    practice: ["changnanju", "shuzi-tingxie", "ielts-speaking", "ielts"],
    mock:     ["cambridge-listening", "cambridge-reading", "cambridge-writing", "ielts",
               "ielts-speaking", "ielts-writing", "jingting"],
    toefl:    ["toefl-reading", "toefl-listening", "toefl-speaking", "toefl-writing"]
  };

  var SUBJECT = {
    "cambridge-listening": { label: "Nghe", en: "Listening", color: "var(--c-cambridge-listening)" },
    "cambridge-reading":   { label: "Đọc", en: "Reading", color: "var(--c-cambridge-reading)" },
    "cambridge-writing":   { label: "Viết", en: "Writing", color: "var(--c-writing)" },
    "ielts-speaking":      { label: "Nói", en: "Speaking", color: "var(--c-ielts)" },
    "ielts-writing":       { label: "Viết", en: "Writing", color: "var(--c-ielts)" },
    cambridge: { label: "kiếm hai lưỡi cầuĐề thi thật", en: "Cambridge", color: "var(--c-cambridge)" },
    ielts:   { label: "Đề thi thật IELTS", en: "IELTS", color: "var(--c-ielts)" },
    alevel:  { label: "A-Level Đề thi thật", en: "A-Level", color: "var(--c-pte)" },
    ap:      { label: "AP Đề thi thật", en: "AP", color: "var(--c-toefl)" },
    toefl:   { label: "nâng bằng tay họĐề thi thật", en: "TOEFL", color: "var(--c-toefl)" },
    "toefl-reading": { label: "nâng bằng tay họĐọc", en: "TOEFL Reading", color: "var(--c-toefl)" },
    "toefl-listening": { label: "nâng bằng tay họNghe", en: "TOEFL Listening", color: "var(--c-toefl)" },
    "toefl-writing": { label: "nâng bằng tay họViết", en: "TOEFL Writing", color: "var(--c-toefl)" },
    "toefl-speaking": { label: "nâng bằng tay họNói", en: "TOEFL Speaking", color: "var(--c-toefl)" },
    sat:     { label: "SAT Đề thi thật", en: "SAT", color: "var(--c-grammar)" },
    grammar: { label: "Ngữ pháp", en: "Grammar", color: "var(--c-grammar)" },
    vocab:   { label: "trường trung học phổ thôngTừ vựng", en: "Vocabulary", color: "var(--c-vocab)" },
    "vocab-cet4":    { label: "cấp 4Từ vựng", en: "CET-4", color: "var(--c-vocab)" },
    "vocab-cet4-lite": { label: "cấp 4Từ vựng(đơn giản hóamột đăng ký)", en: "CET-4 Compact", color: "var(--c-vocab)" },
    "vocab-special-listening": { label: "Nghechuyên biệtTừ vựng", en: "Listening Words", color: "var(--c-cambridge-listening)" },
    "vocab-special-reading":   { label: "Đọcchuyên biệtTừ vựng", en: "Reading Words", color: "var(--c-cambridge-reading)" },
    "vocab-special-writing":   { label: "Viếtchuyên biệtTừ vựng", en: "Writing Vocabulary", color: "var(--c-writing)" },
    "vocab-themes": { label: "Kho từ vựng theo chủ đề", en: "Thematic Vocab", color: "var(--c-vocab)" },
    changnanju: { label: "chiều dài khó để biến thể của", en: "Complex Sentences", color: "var(--c-zone-practice)" },
    "shuzi-tingxie": { label: "chữ sốcủa học sinh viết chính tả", en: "Number Dictation", color: "var(--c-zone-practice)" },
    jingting:   { label: "Nghetinh chất cười cổ đại", en: "Intensive Listening", color: "var(--c-listening)" }
  };

  // Display tree for homepage + zone pages (mirrors the course-centre diagram).
  // Each leaf maps to a manifest `subject`; categories may have `children`.
  var NAV = {
    study: [
      { key: "vocab", label: "Từ vựng", children: [
        { label: "trường trung học phổ thôngTừ vựng", subject: "vocab" },
        { label: "cấp 4Từ vựng", subject: "vocab-cet4" },
        { label: "cấp 4Từ vựng(đơn giản hóamột đăng ký)", subject: "vocab-cet4-lite" },
        { key: "vocab-special", label: "IELTS Hệ thống Kiểm tra Tiếng Anh Quốc tếchuyên biệtTừ vựng", children: [
          { label: "Nghechuyên biệtTừ vựng", subject: "vocab-special-listening" },
          { label: "Đọcchuyên biệtTừ vựng", subject: "vocab-special-reading" },
          { label: "Viếtchuyên biệtTừ vựng", subject: "vocab-special-writing" }
        ] },
        { label: "Kho từ vựng theo chủ đề", subject: "vocab-themes", href: "vocab-shelf.html?view=catalog" }
      ] }
    ],
    practice: [
      { key: "changnanju", label: "chiều dài khó để biến thể của", subject: "changnanju" },
      { key: "shuzi-tingxie", label: "chữ sốcủa học sinh viết chính tả", subject: "shuzi-tingxie" },
      { key: "ielts-speaking", label: "IELTS Hệ thống Kiểm tra Tiếng Anh Quốc tếNói", subject: "ielts-speaking" }
    ],
    mock: [
      { key: "listening", label: "Nghe", subject: "cambridge-listening", desc: "NgheĐề thi thậttrình tựLuyện tập", skill: "listening",
        links: [
          { label: "NgheĐề thi thậttrình tựLuyện tập", href: "zone.html?zone=mock&s=listening" }
        ].concat(JINGTING_OPEN ? [
          { label: "NgheĐề thi thậttinh chất cười cổ đại", href: "zone.html?zone=mock&s=jingting" }
        ] : []) },
      { key: "reading", label: "Đọc", subject: "cambridge-reading", desc: "ĐọcĐề thi thậttrình tựLuyện tập", skill: "reading" },
      { key: "speaking", label: "Nói", subject: "ielts-speaking", desc: "AINóiLuyện tập/Thi thử", href: "speaking.html" },
      { key: "writing", label: "Viết", subject: "cambridge-writing", desc: "ViếtĐề thi thậttrình tựLuyện tập", skill: "writing",
        links: [
          { label: "ViếtĐề thi thậttrình tựLuyện tập", href: "zone.html?zone=mock&s=writing" },
          { label: "AIViếtChấm bài", href: "ai-tutor.html?track=writing" }
        ] },
      { key: "mock", label: "Thi thử", subject: "ielts", desc: "kiếm hai lưỡi cầu che đậy họThi thử" },
      // ponytail: under Nghe links only — excluded from hub columns/chips in zone.js
      { key: "jingting", label: "Nghetinh chất cười cổ đại", subject: "jingting", desc: "NgheĐề thi thậttinh chất cười cổ đại" }
    ],
    toefl: [
      { key: "reading", label: "Đọc", subject: "toefl-reading", desc: "ĐọcĐề thi thậttrình tựLuyện tập", skill: "reading" },
      { key: "listening", label: "Nghe", subject: "toefl-listening", desc: "NgheĐề thi thậttrình tựLuyện tập", skill: "listening" },
      { key: "speaking", label: "Nói", subject: "toefl-speaking", desc: "NóiĐề thi thậttrình tựLuyện tập", skill: "speaking" },
      { key: "writing", label: "Viết", subject: "toefl-writing", desc: "ViếtĐề thi thậttrình tựLuyện tập", skill: "writing" }
    ]
  };

  // ponytail: nâng bằng tay họ cuộn lại là chỉ theo sau bởi danh từ JSON,không tiến lên HTML manifest;thêm che đậy chỉ thay đổi đại từ này một bề mặt bên ngoài
  var TOEFL_READING = [
    {
      id: "2025-07-04",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.04 chuyến bay nội địaxuống · Đọc",
      file: "library/toefl/2025-07-04-reading.json",
      duration: 41,
      desc: "65 câu · sáng tác thơ theo điệu có sẵn 40(16 phút)+ Học thuật 25(25 phút)· chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-05",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.05 chuyến bay nội địaxuống · Đọc",
      file: "library/toefl/2025-07-05-reading.json",
      duration: 27,
      desc: "45 câu · sáng tác thơ theo điệu có sẵn 40(12 phút)+ Học thuật 5(15 phút)· chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-08",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.08 · Đọc",
      file: "library/toefl/2025-07-08-reading.json",
      duration: 30,
      desc: "50 câu · Module 1(21 phút)+ Module 2(9 phút)"
    },
    {
      id: "2025-07-11",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.11 chuyến bay nội địaxuống · Đọc",
      file: "library/toefl/2025-07-11-reading.json",
      duration: 18,
      desc: "30 câu · sáng tác thơ theo điệu có sẵn 30 · Module 1(12 phút)+ Module 2(6 phút)· chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-13",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.13 · Đọc",
      file: "library/toefl/2025-07-13-reading.json",
      duration: 30,
      desc: "50 câu · Module 1(21 phút)+ Module 2(9 phút)"
    },
    {
      id: "2025-07-16",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.16 · Đọc",
      file: "library/toefl/2025-07-16-reading.json",
      duration: 30,
      desc: "50 câu · Module 1(21 phút)+ Module 2(9 phút)"
    },
    {
      id: "2025-07-18",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.18 chuyến bay nội địaxuống · Đọc",
      file: "library/toefl/2025-07-18-reading.json",
      duration: 53,
      desc: "113 câu · sáng tác thơ theo điệu có sẵn 80(35 phút)+ Học thuật 33(18 phút)· chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-19",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.19 chuyến bay nội địaxuống · Đọc",
      file: "library/toefl/2025-07-19-reading.json",
      duration: 40,
      desc: "65 câu · sáng tác thơ theo điệu có sẵn 40(20 phút)+ Học thuật 25(20 phút)· chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-25",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.25 chuyến bay nội địaxuống · Đọc",
      file: "library/toefl/2025-07-25-reading.json",
      duration: 30,
      desc: "40 câu · sáng tác thơ theo điệu có sẵn 10(10 phút)+ Học thuật 30(20 phút)· chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-29",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.29 chuyến bay nội địaxuống · Đọc",
      file: "library/toefl/2025-07-29-reading.json",
      duration: 38,
      desc: "55 câu · sáng tác thơ theo điệu có sẵn 40(20 phút)+ Học thuật 15(18 phút)· chuyến bay nội địaxuống"
    },
    {
      id: "2025-08-08",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.08 · Đọc",
      file: "library/toefl/2025-08-08-reading.json",
      duration: 30,
      desc: "50 câu · Module 1(21 phút)+ Module 2(9 phút)"
    },
    {
      id: "2025-08-12",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.12 chuyến bay nội địaxuống · Đọc",
      file: "library/toefl/2025-08-12-reading.json",
      duration: 32,
      desc: "65 câu · sáng tác thơ theo điệu có sẵn 50 + Hàng ngày 5(24 phút)+ Học thuật 10(8 phút)· chuyến bay nội địaxuống"
    },
    {
      id: "2025-08-19",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.19 chuyến bay nội địaxuống · Đọc",
      file: "library/toefl/2025-08-19-reading.json",
      duration: 52,
      desc: "108 câu · sáng tác thơ theo điệu có sẵn 70(28 phút)+ Hàng ngày 3 + Học thuật 35(24 phút)· chuyến bay nội địaxuống"
    },
    {
      id: "2025-08-22",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.22 chuyến bay nội địaxuống · Đọc",
      file: "library/toefl/2025-08-22-reading.json",
      duration: 76,
      desc: "165 câu · sáng tác thơ theo điệu có sẵn 120(48 phút)+ Hàng ngày 10 + Học thuật 35(28 phút)· chuyến bay nội địaxuống"
    },
    {
      id: "2025-08-26",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.26 chuyến bay nội địaxuống · Đọc",
      file: "library/toefl/2025-08-26-reading.json",
      duration: 30,
      desc: "50 câu · Module 1(21 phút)+ Module 2(9 phút)· chuyến bay nội địaxuống"
    },
    {
      id: "2025-08-30",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.30 chuyến bay nội địaxuống · Đọc",
      file: "library/toefl/2025-08-30-reading.json",
      duration: 40,
      desc: "166 câu · sáng tác thơ theo điệu có sẵn 161(32 phút)+ Học thuật 5(8 phút)· chuyến bay nội địaxuống"
    },
    {
      id: "2025-09-02",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.02 · Đọc",
      file: "library/toefl/2025-09-02-reading.json",
      duration: 30,
      desc: "50 câu · Module 1(21 phút)+ Module 2(9 phút)"
    },
    {
      id: "2025-09-05",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.05 · Đọc",
      file: "library/toefl/2025-09-05-reading.json",
      duration: 52,
      desc: "110 câu · sáng tác thơ theo điệu có sẵn 70(28 phút)+ Học thuật 40(24 phút)"
    },
    {
      id: "2025-09-13",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.13 · Đọc",
      file: "library/toefl/2025-09-13-reading.json",
      duration: 52,
      desc: "111 câu · sáng tác thơ theo điệu có sẵn 70(28 phút)+ Hàng ngày 6 + Học thuật 35(24 phút)"
    },
    {
      id: "2025-09-19",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.19 nước ngoàingoại tuyến · Đọc",
      file: "library/toefl/2025-09-19-reading.json",
      duration: 30,
      desc: "50 câu · Module 1(21 phút)+ Module 2(9 phút)· nước ngoàingoại tuyến"
    },
    {
      id: "2025-09-23",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.23 chuyến bay nội địaxuống · Đọc",
      file: "library/toefl/2025-09-23-reading.json",
      duration: 48,
      desc: "100 câu · sáng tác thơ theo điệu có sẵn 80(32 phút)+ Học thuật 20(16 phút)· chuyến bay nội địaxuống"
    },
    {
      id: "2026-09-23",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.23 · Đọc",
      file: "library/toefl/2026-09-23-reading.json",
      duration: 32,
      desc: "80 câu · sáng tác thơ theo điệu có sẵn 80 · Module 1(16 phút)+ Module 2(16 phút)"
    }
  ];
  // ponytail: Nghe PDF không cómô-đun trong phần mềmthời lượng;9.02 nhấn Enhanced hình thức liên kết toàn bộ họ cân trong cân đĩa hoặc trên cân 36 phútxé mở 25+11;9.05 hầu như 13 một khóa bài giảng
  var TOEFL_LISTENING = [
    {
      id: "2025-07-04",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.04 chuyến bay nội địaxuống · Nghe",
      file: "library/toefl/2025-07-04-listening.json",
      duration: 24,
      desc: "12 câu · 3 tờmột khóa bài giảng · Module 1(16 phút)+ Module 2(8 phút)· chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-05",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.05 chuyến bay nội địaxuống · Nghe",
      file: "library/toefl/2025-07-05-listening.json",
      duration: 16,
      desc: "8 câu · 2 tờmột khóa bài giảng · Module 1(8 phút)+ Module 2(8 phút)· chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-08",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.08 · Nghe",
      file: "library/toefl/2025-07-08-listening.json",
      duration: 36,
      desc: "47 câu · Module 1(25 phút)+ Module 2(11 phút)"
    },
    {
      id: "2025-07-11",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.11 chuyến bay nội địaxuống · Nghe",
      file: "library/toefl/2025-07-11-listening.json",
      duration: 16,
      desc: "8 câu · 2 tờmột khóa bài giảng · Module 1(8 phút)+ Module 2(8 phút)· chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-13",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.13 · Nghe",
      file: "library/toefl/2025-07-13-listening.json",
      duration: 36,
      desc: "47 câu · Module 1(25 phút)+ Module 2(11 phút)"
    },
    {
      id: "2025-07-16",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.16 · Nghe",
      file: "library/toefl/2025-07-16-listening.json",
      duration: 36,
      desc: "47 câu · Module 1(25 phút)+ Module 2(11 phút)"
    },
    {
      id: "2025-07-18",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.18 chuyến bay nội địaxuống · Nghe",
      file: "library/toefl/2025-07-18-listening.json",
      duration: 24,
      desc: "16 câu · 4 tờmột khóa bài giảng · Module 1(12 phút)+ Module 2(12 phút)· chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-19",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.19 chuyến bay nội địaxuống · Nghe",
      file: "library/toefl/2025-07-19-listening.json",
      duration: 32,
      desc: "30 câu · Module 1(8 phút)+ Module 2(24 phút)· chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-25",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.25 chuyến bay nội địaxuống · Nghe",
      file: "library/toefl/2025-07-25-listening.json",
      duration: 24,
      desc: "16 câu · 4 tờmột khóa bài giảng(24 phút)· chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-29",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.29 chuyến bay nội địaxuống · Nghe",
      file: "library/toefl/2025-07-29-listening.json",
      duration: 32,
      desc: "20 câu · Module 1(8 phút)+ Module 2(24 phút)· chuyến bay nội địaxuống"
    },
    {
      id: "2025-08-08",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.08 · Nghe",
      file: "library/toefl/2025-08-08-listening.json",
      duration: 36,
      desc: "47 câu · Module 1(25 phút)+ Module 2(11 phút)"
    },
    {
      id: "2025-08-12",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.12 chuyến bay nội địaxuống · Nghe",
      file: "library/toefl/2025-08-12-listening.json",
      duration: 25,
      desc: "20 câu · 5 tờmột khóa bài giảng · Module 1(15 phút)+ Module 2(10 phút)· chuyến bay nội địaxuống"
    },
    {
      id: "2025-08-19",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.19 chuyến bay nội địaxuống · Nghe",
      file: "library/toefl/2025-08-19-listening.json",
      duration: 60,
      desc: "68 câu · 17 tờmột khóa bài giảng · Module 1(32 phút)+ Module 2(28 phút)· chuyến bay nội địaxuống"
    },
    {
      id: "2025-08-22",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.22 chuyến bay nội địaxuống · Nghe",
      file: "library/toefl/2025-08-22-listening.json",
      duration: 40,
      desc: "30 câu · 6 tờmột khóa bài giảng + 2 họnói chuyện với ai đó + 1 văn học liên từ dùng để thể hiện sự tương phản với mệnh đề trước nhưngthông báo · Module 1(24 phút)+ Module 2(16 phút)· chuyến bay nội địaxuống"
    },
    {
      id: "2025-08-26",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.26 chuyến bay nội địaxuống · Nghe",
      file: "library/toefl/2025-08-26-listening.json",
      duration: 36,
      desc: "47 câu · Module 1(25 phút)+ Module 2(11 phút)· chuyến bay nội địaxuống"
    },
    {
      id: "2025-08-30",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.30 chuyến bay nội địaxuống · Nghe",
      file: "library/toefl/2025-08-30-listening.json",
      duration: 47,
      desc: "46 câu · 11 tờmột khóa bài giảng + 1 văn học liên từ dùng để thể hiện sự tương phản với mệnh đề trước nhưngthông báo · Module 1(25 phút)+ Module 2(22 phút)· chuyến bay nội địaxuống"
    },
    {
      id: "2025-09-02",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.02 · Nghe",
      file: "library/toefl/2025-09-02-listening.json",
      duration: 36,
      desc: "47 câu · Module 1(25 phút)+ Module 2(11 phút)"
    },
    {
      id: "2025-09-05",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.05 · Nghe",
      file: "library/toefl/2025-09-05-listening.json",
      duration: 45,
      desc: "52 câu · 13 tờmột khóa bài giảng · Module 1(25 phút)+ Module 2(20 phút)"
    },
    {
      id: "2025-09-13",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.13 · Nghe",
      file: "library/toefl/2025-09-13-listening.json",
      duration: 47,
      desc: "58 câu · 14 tờmột khóa bài giảng + 1 văn học liên từ dùng để thể hiện sự tương phản với mệnh đề trước nhưngthông báo · Module 1(25 phút)+ Module 2(22 phút)"
    },
    {
      id: "2025-09-19",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.19 nước ngoàingoại tuyến · Nghe",
      file: "library/toefl/2025-09-19-listening.json",
      duration: 36,
      desc: "47 câu · Module 1(25 phút)+ Module 2(11 phút)· nước ngoàingoại tuyến"
    },
    {
      id: "2025-09-23",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.23 chuyến bay nội địaxuống · Nghe",
      file: "library/toefl/2025-09-23-listening.json",
      duration: 45,
      desc: "52 câu · 13 tờmột khóa bài giảng · Module 1(25 phút)+ Module 2(20 phút)· chuyến bay nội địaxuống"
    },
    {
      id: "2026-09-23",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.23 · Nghe",
      file: "library/toefl/2026-09-23-listening.json",
      duration: 20,
      desc: "16 câu · 4 tờmột khóa bài giảng · Module 1(10 phút)+ Module 2(10 phút)"
    }
  ];
  // ponytail: họ biến thể của không cóChính thứcthời lượng;thư từ 7 điểm,thảo luận 10 điểmnhấn ETS Enhanced
  var TOEFL_WRITING = [
    {
      id: "2025-07-04",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.04 chuyến bay nội địaxuống · Viết",
      file: "library/toefl/2025-07-04-writing.json",
      duration: 88,
      desc: "4 họthư từ(28 phút)+ 6 tờThảo luận học thuật(60 phút)· không có họ biến thể của · chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-05",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.05 chuyến bay nội địaxuống · Viết",
      file: "library/toefl/2025-07-05-writing.json",
      duration: 75,
      desc: "5 họthư từ(35 phút)+ 4 tờThảo luận học thuật(40 phút)· không có họ biến thể của · chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-08",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.08 · Viết",
      file: "library/toefl/2025-07-08-writing.json",
      duration: 25,
      desc: "họ biến thể của 10 câu(8 phút)+ thư từ(7 phút)+ Thảo luận học thuật(10 phút)"
    },
    {
      id: "2025-07-11",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.11 chuyến bay nội địaxuống · Viết",
      file: "library/toefl/2025-07-11-writing.json",
      duration: 38,
      desc: "4 họthư từ(28 phút)+ 1 tờThảo luận học thuật(10 phút)· không có họ biến thể của · chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-13",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.13 · Viết",
      file: "library/toefl/2025-07-13-writing.json",
      duration: 25,
      desc: "họ biến thể của 10 câu(8 phút)+ thư từ(7 phút)+ Thảo luận học thuật(10 phút)"
    },
    {
      id: "2025-07-16",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.16 · Viết",
      file: "library/toefl/2025-07-16-writing.json",
      duration: 25,
      desc: "họ biến thể của 10 câu(8 phút)+ thư từ(7 phút)+ Thảo luận học thuật(10 phút)"
    },
    {
      id: "2025-07-18",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.18 chuyến bay nội địaxuống · Viết",
      file: "library/toefl/2025-07-18-writing.json",
      duration: 88,
      desc: "4 họthư từ(28 phút)+ 6 tờThảo luận học thuật(60 phút)· không có họ biến thể của · chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-19",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.19 chuyến bay nội địaxuống · Viết",
      file: "library/toefl/2025-07-19-writing.json",
      duration: 44,
      desc: "2 họthư từ(14 phút)+ 3 tờThảo luận học thuật(30 phút)· không có họ biến thể của · chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-25",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.25 chuyến bay nội địaxuống · Viết",
      file: "library/toefl/2025-07-25-writing.json",
      duration: 52,
      desc: "họ biến thể của 2 câu(8 phút)+ 2 họthư từ(14 phút)+ 3 tờThảo luận học thuật(30 phút)· chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-29",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.29 chuyến bay nội địaxuống · Viết",
      file: "library/toefl/2025-07-29-writing.json",
      duration: 54,
      desc: "2 họthư từ(14 phút)+ 4 tờThảo luận học thuật(40 phút)· không có họ biến thể của · chuyến bay nội địaxuống"
    },
    {
      id: "2025-08-08",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.08 · Viết",
      file: "library/toefl/2025-08-08-writing.json",
      duration: 25,
      desc: "họ biến thể của 10 câu(8 phút)+ thư từ(7 phút)+ Thảo luận học thuật(10 phút)"
    },
    {
      id: "2025-08-12",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.12 chuyến bay nội địaxuống · Viết",
      file: "library/toefl/2025-08-12-writing.json",
      duration: 78,
      desc: "4 họthư từ(28 phút)+ 5 tờThảo luận học thuật(50 phút)· không có họ biến thể của · chuyến bay nội địaxuống"
    },
    {
      id: "2025-08-19",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.19 chuyến bay nội địaxuống · Viết",
      file: "library/toefl/2025-08-19-writing.json",
      duration: 71,
      desc: "3 họthư từ(21 phút)+ 5 tờThảo luận học thuật(50 phút)· không có họ biến thể của · chuyến bay nội địaxuống"
    },
    {
      id: "2025-08-22",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.22 chuyến bay nội địaxuống · Viết",
      file: "library/toefl/2025-08-22-writing.json",
      duration: 126,
      desc: "8 họthư từ(56 phút)+ 7 tờThảo luận học thuật(70 phút)· không có họ biến thể của · chuyến bay nội địaxuống"
    },
    {
      id: "2025-08-26",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.26 chuyến bay nội địaxuống · Viết",
      file: "library/toefl/2025-08-26-writing.json",
      duration: 25,
      desc: "họ biến thể của 10 câu(8 phút)+ thư từ(7 phút)+ Thảo luận học thuật(10 phút)· chuyến bay nội địaxuống"
    },
    {
      id: "2025-08-30",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.30 chuyến bay nội địaxuống · Viết",
      file: "library/toefl/2025-08-30-writing.json",
      duration: 85,
      desc: "5 họthư từ(35 phút)+ 5 tờThảo luận học thuật(50 phút)· không có họ biến thể của · chuyến bay nội địaxuống"
    },
    {
      id: "2025-09-02",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.02 · Viết",
      file: "library/toefl/2025-09-02-writing.json",
      duration: 25,
      desc: "họ biến thể của 10 câu(8 phút)+ thư từ(7 phút)+ Thảo luận học thuật(10 phút)"
    },
    {
      id: "2025-09-05",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.05 · Viết",
      file: "library/toefl/2025-09-05-writing.json",
      duration: 68,
      desc: "4 họthư từ(28 phút)+ 4 tờThảo luận học thuật(40 phút)· không có họ biến thể của"
    },
    {
      id: "2025-09-13",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.13 · Viết",
      file: "library/toefl/2025-09-13-writing.json",
      duration: 58,
      desc: "4 họthư từ(28 phút)+ 3 tờThảo luận học thuật(30 phút)· không có họ biến thể của"
    },
    {
      id: "2025-09-19",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.19 nước ngoàingoại tuyến · Viết",
      file: "library/toefl/2025-09-19-writing.json",
      duration: 25,
      desc: "họ biến thể của 10 câu(8 phút)+ thư từ(7 phút)+ Thảo luận học thuật(10 phút)· nước ngoàingoại tuyến"
    },
    {
      id: "2025-09-23",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.23 chuyến bay nội địaxuống · Viết",
      file: "library/toefl/2025-09-23-writing.json",
      duration: 109,
      desc: "7 họthư từ(49 phút)+ 6 tờThảo luận học thuật(60 phút)· không có họ biến thể của · chuyến bay nội địaxuống"
    },
    {
      id: "2026-09-23",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.23 · Viết",
      file: "library/toefl/2026-09-23-writing.json",
      duration: 41,
      desc: "3 họthư từ(21 phút)+ 2 tờThảo luận học thuật(20 phút)· không có họ biến thể của"
    }
  ];
  var TOEFL_SPEAKING = [
    {
      id: "2025-07-04",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.04 chuyến bay nội địaxuống · Nói Form 1",
      file: "library/toefl/2025-07-04-speaking.json",
      duration: 10,
      desc: "chọn khóa họcĐăng ký · cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu + Lịch sửý thứcđược phỏng vấn với tư cách ứng viên 4 câu · chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-04-s2",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.04 chuyến bay nội địaxuống · Nói Form 2",
      file: "library/toefl/2025-07-04-speaking-f2.json",
      duration: 10,
      desc: "thợ mộc · cười cổ đại họlặp lại lời của chính mình hoặc của người khác + tái tạo được tài nguyênnăng lượngđược phỏng vấn với tư cách ứng viên · chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-04-s3",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.04 chuyến bay nội địaxuống · Nói Form 3",
      file: "library/toefl/2025-07-04-speaking-f3.json",
      duration: 10,
      desc: "thư việntài liệu · cười cổ đại họlặp lại lời của chính mình hoặc của người khác + bảo vệ môi trườngthực hànhđược phỏng vấn với tư cách ứng viên · chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-04-s4",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.04 chuyến bay nội địaxuống · Nói Form 4",
      file: "library/toefl/2025-07-04-speaking-f4.json",
      duration: 10,
      desc: "lớp họctrình diễn · cười cổ đại họlặp lại lời của chính mình hoặc của người khác + Lịch sửnghiên cứuđược phỏng vấn với tư cách ứng viên · chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-04-s5",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.04 chuyến bay nội địaxuống · Nói Form 5",
      file: "library/toefl/2025-07-04-speaking-f5.json",
      duration: 10,
      desc: "yoga từ mượn · cười cổ đại họlặp lại lời của chính mình hoặc của người khác + tặng quàđược phỏng vấn với tư cách ứng viên · chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-05",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.05 chuyến bay nội địaxuống · Nói Form 1",
      file: "library/toefl/2025-07-05-speaking.json",
      duration: 10,
      desc: "Khuôn viên trườngquán cà phê · cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu + giấc ngủđược phỏng vấn với tư cách ứng viên 4 câu · chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-05-s2",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.05 chuyến bay nội địaxuống · Nói Form 2",
      file: "library/toefl/2025-07-05-speaking-f2.json",
      duration: 10,
      desc: "khâucúc áo · cười cổ đại họlặp lại lời của chính mình hoặc của người khác + công viên dành cho công chúng giải tríđược phỏng vấn với tư cách ứng viên · chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-05-s3",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.05 chuyến bay nội địaxuống · Nói Form 3",
      file: "library/toefl/2025-07-05-speaking-f3.json",
      duration: 10,
      desc: "làmbánh mì · cười cổ đại họlặp lại lời của chính mình hoặc của người khác + Hàng ngàysắp xếpđược phỏng vấn với tư cách ứng viên · chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-05-s4",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.05 chuyến bay nội địaxuống · Nói Form 4",
      file: "library/toefl/2025-07-05-speaking-f4.json",
      duration: 10,
      desc: "rácPhân loại · cười cổ đại họlặp lại lời của chính mình hoặc của người khác + nghệ thuậtâm nhạcđược phỏng vấn với tư cách ứng viên · chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-08",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.08 · Nói",
      file: "library/toefl/2025-07-08-speaking.json",
      duration: 10,
      desc: "cộng đồngsấy khô trên lửa trà · cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu(4 phút)+ công viên dành cho công chúng giải tríđược phỏng vấn với tư cách ứng viên 4 câu(6 phút)"
    },
    {
      id: "2025-07-11",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.11 chuyến bay nội địaxuống · Nói Form 1",
      file: "library/toefl/2025-07-11-speaking.json",
      duration: 10,
      desc: "Đại họcnghệ thuậthọ · cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu + khí tượng khí hậuđược phỏng vấn với tư cách ứng viên 4 câu · chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-11-s2",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.11 chuyến bay nội địaxuống · Nói Form 2",
      file: "library/toefl/2025-07-11-speaking-f2.json",
      duration: 10,
      desc: "thành phốcột mốc · cười cổ đại họlặp lại lời của chính mình hoặc của người khác + cư trúthói quenđược phỏng vấn với tư cách ứng viên 3 câu(gốc sự thiếu Q4 Audio)· chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-11-s3",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.11 chuyến bay nội địaxuống · Nói Form 3",
      file: "library/toefl/2025-07-11-speaking-f3.json",
      duration: 10,
      desc: "Học viêntrung tâm · cười cổ đại họlặp lại lời của chính mình hoặc của người khác + mua sắm qua mạngđược phỏng vấn với tư cách ứng viên · chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-11-s4",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.11 chuyến bay nội địaxuống · Nói Form 4",
      file: "library/toefl/2025-07-11-speaking-f4.json",
      duration: 4,
      desc: "phòng trưng bày nghệ thuật · cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu · chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-13",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.13 · Nói",
      file: "library/toefl/2025-07-13-speaking.json",
      duration: 10,
      desc: "cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu(4 phút)+ được phỏng vấn với tư cách ứng viên 4 câu(6 phút)"
    },
    {
      id: "2025-07-16",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.16 · Nói",
      file: "library/toefl/2025-07-16-speaking.json",
      duration: 10,
      desc: "thư việntài liệu · cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu(4 phút)+ tái chếđược phỏng vấn với tư cách ứng viên 4 câu(6 phút)"
    },
    {
      id: "2025-07-18",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.18 chuyến bay nội địaxuống · Nói Form 1",
      file: "library/toefl/2025-07-18-speaking.json",
      duration: 10,
      desc: "tập thể dụctrung tâm · cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu + truyền thông xã hộiđược phỏng vấn với tư cách ứng viên 4 câu · chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-18-s2",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.18 chuyến bay nội địaxuống · Nói Form 2",
      file: "library/toefl/2025-07-18-speaking-f2.json",
      duration: 10,
      desc: "Thiên nhiêntrung tâm · cười cổ đại họlặp lại lời của chính mình hoặc của người khác + mua sắm qua mạngđược phỏng vấn với tư cách ứng viên · chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-18-s3",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.18 chuyến bay nội địaxuống · Nói Form 3",
      file: "library/toefl/2025-07-18-speaking-f3.json",
      duration: 10,
      desc: "công việc hàng hảibảo tàng · cười cổ đại họlặp lại lời của chính mình hoặc của người khác + âm nhạcđược phỏng vấn với tư cách ứng viên · chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-18-s4",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.18 chuyến bay nội địaxuống · Nói Form 4",
      file: "library/toefl/2025-07-18-speaking-f4.json",
      duration: 10,
      desc: "động vật hoang dãhọ · cười cổ đại họlặp lại lời của chính mình hoặc của người khác + bảo vệ môi trườngđược phỏng vấn với tư cách ứng viên · chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-18-s5",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.18 chuyến bay nội địaxuống · Nói Form 5",
      file: "library/toefl/2025-07-18-speaking-f5.json",
      duration: 4,
      desc: "thư việnchữ sốhuyện Tư Nguyên ở Quế Lâm · cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu · chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-18-s6",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.18 chuyến bay nội địaxuống · Nói Form 6",
      file: "library/toefl/2025-07-18-speaking-f6.json",
      duration: 4,
      desc: "cộng đồngvườn · cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu · chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-19",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.19 chuyến bay nội địaxuống · Nói Form 1",
      file: "library/toefl/2025-07-19-speaking.json",
      duration: 10,
      desc: "leo núi đábiến thể của · cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu + được phỏng vấn với tư cách ứng viên 4 câu · chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-19-s2",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.19 chuyến bay nội địaxuống · Nói Form 2",
      file: "library/toefl/2025-07-19-speaking-f2.json",
      duration: 10,
      desc: "cộng đồnglàm việchọ · cười cổ đại họlặp lại lời của chính mình hoặc của người khác + thíchđược phỏng vấn với tư cách ứng viên · chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-19-s3",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.19 chuyến bay nội địaxuống · Nói Form 3",
      file: "library/toefl/2025-07-19-speaking-f3.json",
      duration: 10,
      desc: "Khuôn viên trườngtruyền thônglàm · cười cổ đại họlặp lại lời của chính mình hoặc của người khác + cá tínhđược phỏng vấn với tư cách ứng viên · chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-19-s4",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.19 chuyến bay nội địaxuống · Nói Form 4",
      file: "library/toefl/2025-07-19-speaking-f4.json",
      duration: 10,
      desc: "cộng đồngxây dựng đặc biệt với vật liệu đơn giản · cười cổ đại họlặp lại lời của chính mình hoặc của người khác + mua sắmđược phỏng vấn với tư cách ứng viên · chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-25",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.25 chuyến bay nội địaxuống · Nói Form 1",
      file: "library/toefl/2025-07-25-speaking.json",
      duration: 10,
      desc: "hội nghị tuyển dụng · cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu + được phỏng vấn với tư cách ứng viên 4 câu · chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-25-s2",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.25 chuyến bay nội địaxuống · Nói Form 2",
      file: "library/toefl/2025-07-25-speaking-f2.json",
      duration: 10,
      desc: "bảo tàng · cười cổ đại họlặp lại lời của chính mình hoặc của người khác + giải tríđược phỏng vấn với tư cách ứng viên · chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-25-s3",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.25 chuyến bay nội địaxuống · Nói Form 3",
      file: "library/toefl/2025-07-25-speaking-f3.json",
      duration: 10,
      desc: "Văn hóakhớp · cười cổ đại họlặp lại lời của chính mình hoặc của người khác + Văn hóađược phỏng vấn với tư cách ứng viên · chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-25-s4",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.25 chuyến bay nội địaxuống · Nói Form 4",
      file: "library/toefl/2025-07-25-speaking-f4.json",
      duration: 6,
      desc: "thời thơ ấuGiáo dụcđược phỏng vấn với tư cách ứng viên 4 câu · chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-29",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.29 chuyến bay nội địaxuống · Nói Form 1",
      file: "library/toefl/2025-07-29-speaking.json",
      duration: 10,
      desc: "họxe đạp · cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu + mua sắmđược phỏng vấn với tư cách ứng viên 4 câu · chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-29-s2",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.29 chuyến bay nội địaxuống · Nói Form 2",
      file: "library/toefl/2025-07-29-speaking-f2.json",
      duration: 4,
      desc: "công ty du lịch · cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu · chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-29-s3",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.29 chuyến bay nội địaxuống · Nói Form 3",
      file: "library/toefl/2025-07-29-speaking-f3.json",
      duration: 4,
      desc: "máy chiếu · cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu · chuyến bay nội địaxuống"
    },
    {
      id: "2025-07-29-s4",
      title: "viết tắt của Tân Cương nâng bằng tay họ 7.29 chuyến bay nội địaxuống · Nói Form 4",
      file: "library/toefl/2025-07-29-speaking-f4.json",
      duration: 4,
      desc: "trực tuyếnhọcnền tảng · cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu · chuyến bay nội địaxuống"
    },
    {
      id: "2025-08-08",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.08 · Nói",
      file: "library/toefl/2025-08-08-speaking.json",
      duration: 9,
      desc: "cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu(4 phút)+ được phỏng vấn với tư cách ứng viên 3 câu(4.5 phút)"
    },
    {
      id: "2025-08-12",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.12 chuyến bay nội địaxuống · Nói",
      file: "library/toefl/2025-08-12-speaking.json",
      duration: 10,
      desc: "trang phụcquán trọ · cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu + mua sắmthói quenđược phỏng vấn với tư cách ứng viên 4 câu · chuyến bay nội địaxuống"
    },
    {
      id: "2025-08-19",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.19 chuyến bay nội địaxuống · Nói Form 1",
      file: "library/toefl/2025-08-19-speaking.json",
      duration: 10,
      desc: "Khuôn viên trườngquán cà phê · cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu + nghệ thuậtâm nhạcđược phỏng vấn với tư cách ứng viên 4 câu · chuyến bay nội địaxuống"
    },
    {
      id: "2025-08-19-s2",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.19 chuyến bay nội địaxuống · Nói Form 2",
      file: "library/toefl/2025-08-19-speaking-f2.json",
      duration: 10,
      desc: "thư việncơ sở vật chất · cười cổ đại họlặp lại lời của chính mình hoặc của người khác + Đọcđược phỏng vấn với tư cách ứng viên · chuyến bay nội địaxuống"
    },
    {
      id: "2025-08-19-s3",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.19 chuyến bay nội địaxuống · Nói Form 3",
      file: "library/toefl/2025-08-19-speaking-f3.json",
      duration: 10,
      desc: "Khoa họcmụctiết lộ · cười cổ đại họlặp lại lời của chính mình hoặc của người khác + Văn hóakhớpđược phỏng vấn với tư cách ứng viên · chuyến bay nội địaxuống"
    },
    {
      id: "2025-08-19-s4",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.19 chuyến bay nội địaxuống · Nói Form 4",
      file: "library/toefl/2025-08-19-speaking-f4.json",
      duration: 10,
      desc: "xe đạpsửa chữa · cười cổ đại họlặp lại lời của chính mình hoặc của người khác + viết tắt của Tân Cươngthíchđược phỏng vấn với tư cách ứng viên · chuyến bay nội địaxuống"
    },
    {
      id: "2025-08-19-s5",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.19 chuyến bay nội địaxuống · Nói Form 5",
      file: "library/toefl/2025-08-19-speaking-f5.json",
      duration: 6,
      desc: "thíchđược phỏng vấn với tư cách ứng viên 4 câu · chuyến bay nội địaxuống"
    },
    {
      id: "2025-08-19-s6",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.19 chuyến bay nội địaxuống · Nói Form 6",
      file: "library/toefl/2025-08-19-speaking-f6.json",
      duration: 6,
      desc: "tái tạo được tài nguyênnăng lượngđược phỏng vấn với tư cách ứng viên 4 câu · chuyến bay nội địaxuống"
    },
    {
      id: "2025-08-22",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.22 chuyến bay nội địaxuống · Nói Form 1",
      file: "library/toefl/2025-08-22-speaking.json",
      duration: 10,
      desc: "Khuôn viên trườngkhách tham quan · cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu + âm nhạckinh nghiệmđược phỏng vấn với tư cách ứng viên 4 câu · chuyến bay nội địaxuống"
    },
    {
      id: "2025-08-22-s2",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.22 chuyến bay nội địaxuống · Nói Form 2",
      file: "library/toefl/2025-08-22-speaking-f2.json",
      duration: 10,
      desc: "công ty du lịch · cười cổ đại họlặp lại lời của chính mình hoặc của người khác + làm vườnđược phỏng vấn với tư cách ứng viên · chuyến bay nội địaxuống"
    },
    {
      id: "2025-08-22-s3",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.22 chuyến bay nội địaxuống · Nói Form 3",
      file: "library/toefl/2025-08-22-speaking-f3.json",
      duration: 10,
      desc: "Đại họcphòng trưng bày nghệ thuật · cười cổ đại họlặp lại lời của chính mình hoặc của người khác + giấc ngủthói quenđược phỏng vấn với tư cách ứng viên · chuyến bay nội địaxuống"
    },
    {
      id: "2025-08-22-s4",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.22 chuyến bay nội địaxuống · Nói Form 4",
      file: "library/toefl/2025-08-22-speaking-f4.json",
      duration: 6,
      desc: "âm nhạctrải nghiệmđược phỏng vấn với tư cách ứng viên 4 câu · chuyến bay nội địaxuống"
    },
    {
      id: "2025-08-26",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.26 chuyến bay nội địaxuống · Nói",
      file: "library/toefl/2025-08-26-speaking.json",
      duration: 9,
      desc: "cười cổ đại họlặp lại lời của chính mình hoặc của người khác 5 câu(gốc sự thiếu Q1–Q2 Audio)+ thíchđược phỏng vấn với tư cách ứng viên 4 câu · chuyến bay nội địaxuống"
    },
    {
      id: "2025-08-30",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.30 chuyến bay nội địaxuống · Nói Form 1",
      file: "library/toefl/2025-08-30-speaking.json",
      duration: 10,
      desc: "cắm hoa · cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu + trực tuyếnhọcđược phỏng vấn với tư cách ứng viên 4 câu · chuyến bay nội địaxuống"
    },
    {
      id: "2025-08-30-s2",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.30 chuyến bay nội địaxuống · Nói Form 2",
      file: "library/toefl/2025-08-30-speaking-f2.json",
      duration: 10,
      desc: "nhà chim · cười cổ đại họlặp lại lời của chính mình hoặc của người khác + mua sắmthói quenđược phỏng vấn với tư cách ứng viên · chuyến bay nội địaxuống"
    },
    {
      id: "2025-08-30-s3",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.30 chuyến bay nội địaxuống · Nói Form 3",
      file: "library/toefl/2025-08-30-speaking-f3.json",
      duration: 4,
      desc: "trang phụcquán trọ · cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu · chuyến bay nội địaxuống"
    },
    {
      id: "2025-08-30-s4",
      title: "viết tắt của Tân Cương nâng bằng tay họ 8.30 chuyến bay nội địaxuống · Nói Form 4",
      file: "library/toefl/2025-08-30-speaking-f4.json",
      duration: 4,
      desc: "quan sát chim · cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu · chuyến bay nội địaxuống"
    },
    {
      id: "2025-09-02",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.02 · Nói",
      file: "library/toefl/2025-09-02-speaking.json",
      duration: 10,
      desc: "cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu(4 phút)+ được phỏng vấn với tư cách ứng viên 4 câu(6 phút)"
    },
    {
      id: "2025-09-05",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.05 · Nói Form 1",
      file: "library/toefl/2025-09-05-speaking.json",
      duration: 10,
      desc: "Khoa họctiết lộ · cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu + viết tắt của Tân Cươngthíchđược phỏng vấn với tư cách ứng viên 4 câu"
    },
    {
      id: "2025-09-05-s2",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.05 · Nói Form 2",
      file: "library/toefl/2025-09-05-speaking-f2.json",
      duration: 10,
      desc: "Khuôn viên trườngquán cà phê · cười cổ đại họlặp lại lời của chính mình hoặc của người khác + họcviết tắt của Tân Cươngthíchđược phỏng vấn với tư cách ứng viên"
    },
    {
      id: "2025-09-05-s3",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.05 · Nói Form 3",
      file: "library/toefl/2025-09-05-speaking-f3.json",
      duration: 10,
      desc: "công việc hàng hảibảo tàng · cười cổ đại họlặp lại lời của chính mình hoặc của người khác + nghệ thuậtdiễn đạtđược phỏng vấn với tư cách ứng viên"
    },
    {
      id: "2025-09-05-s4",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.05 · Nói Form 4",
      file: "library/toefl/2025-09-05-speaking-f4.json",
      duration: 10,
      desc: "bảo tàngkhách tham quan · cười cổ đại họlặp lại lời của chính mình hoặc của người khác + tái tạo được tài nguyênnăng lượngđược phỏng vấn với tư cách ứng viên"
    },
    {
      id: "2025-09-05-s5",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.05 · Nói Form 5",
      file: "library/toefl/2025-09-05-speaking-f5.json",
      duration: 10,
      desc: "phòng máylàm ca · cười cổ đại họlặp lại lời của chính mình hoặc của người khác + Văn hóakhớpđược phỏng vấn với tư cách ứng viên"
    },
    {
      id: "2025-09-05-s6",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.05 · Nói Form 6 được phỏng vấn với tư cách ứng viên",
      file: "library/toefl/2025-09-05-speaking-f6.json",
      duration: 6,
      desc: "giao thông công cộngthói quen · được phỏng vấn với tư cách ứng viên 4 câu"
    },
    {
      id: "2025-09-05-s7",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.05 · Nói Form 7 được phỏng vấn với tư cách ứng viên",
      file: "library/toefl/2025-09-05-speaking-f7.json",
      duration: 6,
      desc: "Đọcthói quen · được phỏng vấn với tư cách ứng viên 4 câu"
    },
    {
      id: "2025-09-13",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.13 · Nói Form 1",
      file: "library/toefl/2025-09-13-speaking.json",
      duration: 10,
      desc: "quan sát chim · cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu + công viên dành cho công chúng giải trígiải tríđược phỏng vấn với tư cách ứng viên 4 câu"
    },
    {
      id: "2025-09-13-s2",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.13 · Nói Form 2",
      file: "library/toefl/2025-09-13-speaking-f2.json",
      duration: 10,
      desc: "làmsa lát từ mượn · cười cổ đại họlặp lại lời của chính mình hoặc của người khác + bảo vệ môi trườngthói quenđược phỏng vấn với tư cách ứng viên"
    },
    {
      id: "2025-09-13-s3",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.13 · Nói Form 3",
      file: "library/toefl/2025-09-13-speaking-f3.json",
      duration: 10,
      desc: "nướng bánh mì · cười cổ đại họlặp lại lời của chính mình hoặc của người khác + tiêu thụ hàng hóa và dịch vụthói quenđược phỏng vấn với tư cách ứng viên"
    },
    {
      id: "2025-09-13-s4",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.13 · Nói Form 4",
      file: "library/toefl/2025-09-13-speaking-f4.json",
      duration: 10,
      desc: "thư việnkhách tham quan · cười cổ đại họlặp lại lời của chính mình hoặc của người khác + sét hình ảnhgiải tríđược phỏng vấn với tư cách ứng viên"
    },
    {
      id: "2025-09-19",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.19 nước ngoàingoại tuyến · Nói",
      file: "library/toefl/2025-09-19-speaking.json",
      duration: 10,
      desc: "chọn khóa họcĐăng ký · cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu + cá nhânMục tiêuđược phỏng vấn với tư cách ứng viên 4 câu · nước ngoàingoại tuyến"
    },
    {
      id: "2025-09-23",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.23 chuyến bay nội địaxuống · Nói Form 1",
      file: "library/toefl/2025-09-23-speaking.json",
      duration: 10,
      desc: "tập thể dụctrung tâm · cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu + tiêu thụ hàng hóa và dịch vụngân sáchđược phỏng vấn với tư cách ứng viên 4 câu · chuyến bay nội địaxuống"
    },
    {
      id: "2025-09-23-s2",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.23 chuyến bay nội địaxuống · Nói Form 2",
      file: "library/toefl/2025-09-23-speaking-f2.json",
      duration: 10,
      desc: "nhà sáchhỗ trợ · cười cổ đại họlặp lại lời của chính mình hoặc của người khác + công viên dành cho công chúng giải trígiải tríđược phỏng vấn với tư cách ứng viên · chuyến bay nội địaxuống"
    },
    {
      id: "2025-09-23-s3",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.23 chuyến bay nội địaxuống · Nói Form 3",
      file: "library/toefl/2025-09-23-speaking-f3.json",
      duration: 10,
      desc: "quan sát chim · cười cổ đại họlặp lại lời của chính mình hoặc của người khác + bảo vệ môi trườngthói quenđược phỏng vấn với tư cách ứng viên · chuyến bay nội địaxuống"
    },
    {
      id: "2025-09-23-s4",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.23 chuyến bay nội địaxuống · Nói Form 4",
      file: "library/toefl/2025-09-23-speaking-f4.json",
      duration: 4,
      desc: "thư việncơ sở vật chất · cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu · chuyến bay nội địaxuống"
    },
    {
      id: "2025-09-23-s5",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.23 chuyến bay nội địaxuống · Nói Form 5",
      file: "library/toefl/2025-09-23-speaking-f5.json",
      duration: 4,
      desc: "thợ mộccửa vào · cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu · chuyến bay nội địaxuống"
    },
    {
      id: "2025-09-23-s6",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.23 chuyến bay nội địaxuống · Nói Form 6",
      file: "library/toefl/2025-09-23-speaking-f6.json",
      duration: 4,
      desc: "nướng bánh mì · cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu · chuyến bay nội địaxuống"
    },
    {
      id: "2026-09-23",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.23 · Nói Form 1",
      file: "library/toefl/2026-09-23-speaking.json",
      duration: 4,
      desc: "thư việnkhách tham quan · cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu"
    },
    {
      id: "2026-09-23-s2",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.23 · Nói Form 2",
      file: "library/toefl/2026-09-23-speaking-f2.json",
      duration: 4,
      desc: "thợ mộccửa vào · cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu"
    },
    {
      id: "2026-09-23-s3",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.23 · Nói Form 3",
      file: "library/toefl/2026-09-23-speaking-f3.json",
      duration: 4,
      desc: "quan sát chim · cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu"
    },
    {
      id: "2026-09-23-s4",
      title: "viết tắt của Tân Cương nâng bằng tay họ 9.23 · Nói Form 4",
      file: "library/toefl/2026-09-23-speaking-f4.json",
      duration: 4,
      desc: "làm trái cây họ · cười cổ đại họlặp lại lời của chính mình hoặc của người khác 7 câu"
    }
  ];
  // ponytail: hoàn chỉnhThi thử = bốn ngành học giống id đầy đủngày thángcuộn lại,biến thể củabên trênbốn họ bề mặt bên ngoàisản xuất từ cái gì khác;thêm che đậy chỉ thay đổi bốn ngành học bề mặt bên ngoài
  // Chính thứcviết tắt của Tân Cương nâng bằng tay họ họ đánh 101 phútkhông cónghỉ,dừng mặtthời lượngsử dụngthống nhất cách tiếp cận khi thảo luận vấn đề(mỗimôn họcđầu vẫn nhấnbản thâncuộn lạigiới hạn thời gianđộng vật cào mặt đất)
  var TOEFL_FULL = TOEFL_READING.filter(function (r) {
    return [TOEFL_LISTENING, TOEFL_WRITING, TOEFL_SPEAKING].every(function (L) {
      return L.some(function (p) { return p.id === r.id; });
    });
  }).map(function (r) {
    return {
      id: r.id,
      title: String(r.title || "").replace(/·\s*Đọc$/, "· hoàn chỉnhThi thử"),
      duration: 101,
      desc: "Đọc→Nghe→Viết→Nói · cân trong cân đĩa hoặc trên cân 101 phút · không cónghỉ"
    };
  });
  function navOf(zone) { return NAV[zone] || []; }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function results() {
    try { return JSON.parse(localStorage.getItem("yysd:results") || "{}"); }
    catch (e) { return {}; }
  }

  function wrongWordsStore() {
    try { return JSON.parse(localStorage.getItem(WRONG_WORDS_KEY) || "{}"); }
    catch (e) { return {}; }
  }

  function vocabBookOfSubject(subject) {
    if (subject === "vocab") return "gaozhong";
    if (subject === "vocab-cet4") return "cet4";
    if (subject === "vocab-cet4-lite") return "cet4-lite";
    if (isVocabSpecial(subject)) return "special";
    return null;
  }

  function wrongWords(book) {
    var bucket = wrongWordsStore()[book] || {};
    return Object.keys(bucket).map(function (k) { return bucket[k]; })
      .sort(function (a, b) { return String(b.lastWrongAt || "").localeCompare(String(a.lastWrongAt || "")); });
  }

  function wrongWordCount(book) {
    return Object.keys(wrongWordsStore()[book] || {}).length;
  }

  function mergeWrongWords(book, words, source) {
    if (!book || !words || !words.length) return 0;
    var store = wrongWordsStore();
    if (!store[book]) store[book] = {};
    var bucket = store[book];
    var now = new Date().toISOString();
    var n = 0;
    words.forEach(function (w) {
      var key = String(w.word || "").toLowerCase();
      if (!key) return;
      if (!bucket[key]) {
        bucket[key] = {
          word: w.word, ipa: w.ipa || "", meaning: w.meaning || "",
          acceptCN: w.acceptCN || [], sources: [], wrongCount: 0,
          lastWrongAt: now, lastAttempt: null
        };
      }
      var entry = bucket[key];
      entry.wrongCount = (entry.wrongCount || 0) + 1;
      entry.lastWrongAt = now;
      entry.lastAttempt = {
        userSpelling: w.userSpelling || "",
        userMeaning: w.userMeaning || "",
        spellingCorrect: !!w.spellingCorrect,
        meaningCorrect: !!w.meaningCorrect
      };
      if (w.acceptCN && w.acceptCN.length) entry.acceptCN = w.acceptCN;
      if (source && source.id) {
        var seen = entry.sources.some(function (s) { return s.id === source.id; });
        if (!seen) entry.sources.push({ id: source.id, title: source.title || "", subject: source.subject || "" });
      }
      n++;
    });
    try { localStorage.setItem(WRONG_WORDS_KEY, JSON.stringify(store)); } catch (e) {}
    return n;
  }

  function removeWrongWord(book, wordKey) {
    var store = wrongWordsStore();
    if (!store[book]) return;
    delete store[book][String(wordKey || "").toLowerCase()];
    try { localStorage.setItem(WRONG_WORDS_KEY, JSON.stringify(store)); } catch (e) {}
  }

  function clearWrongWords(book) {
    var store = wrongWordsStore();
    delete store[book];
    try { localStorage.setItem(WRONG_WORDS_KEY, JSON.stringify(store)); } catch (e) {}
  }

  function savedWordsStore() {
    try { return JSON.parse(localStorage.getItem(SAVED_WORDS_KEY) || "{}"); }
    catch (e) { return {}; }
  }

  function savedWords() {
    var store = savedWordsStore();
    return Object.keys(store).map(function (k) { return store[k]; })
      .sort(function (a, b) { return String(b.savedAt || "").localeCompare(String(a.savedAt || "")); });
  }

  function savedWordCount() {
    return Object.keys(savedWordsStore()).length;
  }

  function addSavedWord(entry) {
    var word = String((entry && entry.word) || "").trim();
    if (!word) return false;
    var key = word.toLowerCase();
    var store = savedWordsStore();
    var now = new Date().toISOString();
    if (store[key]) {
      store[key].ipa = entry.ipa || store[key].ipa || "";
      store[key].meaning = entry.meaning || store[key].meaning || "";
      store[key].note = entry.note || store[key].note || "";
      store[key].savedAt = now;
    } else {
      store[key] = {
        word: word,
        ipa: (entry && entry.ipa) || "",
        meaning: (entry && entry.meaning) || "",
        note: (entry && entry.note) || "",
        savedAt: now
      };
    }
    try { localStorage.setItem(SAVED_WORDS_KEY, JSON.stringify(store)); } catch (e) { return false; }
    return true;
  }

  function removeSavedWord(wordKey) {
    var store = savedWordsStore();
    delete store[String(wordKey || "").toLowerCase()];
    try { localStorage.setItem(SAVED_WORDS_KEY, JSON.stringify(store)); } catch (e) {}
  }

  function clearSavedWords() {
    try { localStorage.removeItem(SAVED_WORDS_KEY); } catch (e) {}
  }

  function savedWordsStripHTML(prefix) {
    var p = prefix || "";
    var n = savedWordCount();
    return '<div class="wrong-notebook-strip" aria-label="sổ tay từ vựng">' +
      '<div class="wrong-notebook-strip__head"><h3>sổ tay từ vựng</h3>' +
      '<span class="wrong-notebook-strip__hint">AI họ biến thể cũ của họ tiền tố có thể một phím trên đàn piano hoặc bàn phím máy tínhĐã lưu,dễ dàng đểÔn tập</span></div>' +
      '<div class="wrong-notebook-strip__grid">' +
        '<a class="wrong-notebook-card' + (n ? " has-items" : "") + '" href="' + p + 'saved-words.html">' +
          '<span class="wrong-notebook-card__ico" aria-hidden="true">📘</span>' +
          '<span class="wrong-notebook-card__body">' +
            '<b>AI sổ tay từ vựng</b>' +
            '<span>' + (n ? n + " dùng trongtừ mới trong sách giáo khoađợi được thông báohọ" : "tạm thời không cótừ mới trong sách giáo khoa,họ biến thể cũ của họthực vật cây coca từ mượnđi vào") + "</span>" +
          "</span>" +
          (n ? '<span class="wrong-notebook-card__badge">' + n + "</span>" : '<span class="wrong-notebook-card__go">đi vào ›</span>') +
        "</a>" +
      "</div></div>";
  }

  function wrongWordsStripHTML(prefix) {
    var p = prefix || "";
    var n = ["gaozhong", "cet4", "cet4-lite", "special"].reduce(function (sum, k) {
      return sum + (wrongWordCount(k) || 0);
    }, 0);
    return '<div class="wrong-notebook-strip" aria-label="Từ vựngSổ lỗi sai">' +
      '<div class="wrong-notebook-strip__head"><h3>Từ vựngSổ lỗi sai</h3>' +
      '<span class="wrong-notebook-strip__hint">phát hiệnhọ biến thể cũ của nhấnsố lần chiếu của một bộ phimbao gồm trong một bộ sưu tập · ngày tháng + biến thể cũ của viết tắt của + List</span></div>' +
      '<div class="wrong-notebook-strip__grid">' +
        '<a class="wrong-notebook-card' + (n ? " has-items" : "") + '" href="' + p + 'wrong-words.html">' +
          '<span class="wrong-notebook-card__ico" aria-hidden="true">📕</span>' +
          '<span class="wrong-notebook-card__body">' +
            "<b>7-Eleven chuỗi cửa hàng tiện lợiSổ lỗi sai</b>" +
            "<span>" + (n ? n + " dùng trong hình thức kết hợp gốc họ cũ họ biến thể cũ của ở lạiđồng bộ/Ôn tập" : "Hoàn thànhTừ vựngphát hiệnhọtự độngbao gồm trong một bộ sưu tập") + "</span>" +
          "</span>" +
          (n ? '<span class="wrong-notebook-card__badge">' + n + "</span>" : '<span class="wrong-notebook-card__go">đi vào ›</span>') +
        "</a>" +
      "</div></div>";
  }

  // Resolve the manifest path relative to the current page (root or /admin etc.)
  function manifestUrl() {
    // pages at root use "library/...", pages one level deep use "../library/..."
    return (location.pathname.replace(/\/[^/]*$/, "/").endsWith("/admin/") ? "../" : "")
      + "library/manifest.json?v=" + encodeURIComponent(CONTENT_VER);
  }

  var _manifestPromise;
  var _taxPromises = {};
  var _taxById = {};

  function rememberTaxonomy(data) {
    if (!data) return data;
    (data.groups || []).concat(data.parts || []).forEach(function (row) {
      if (row && row.id) _taxById[row.id] = row;
    });
    return data;
  }

  function isExplainId(id) {
    return /-explain$/i.test(String(id || ""));
  }

  function baseExerciseId(id) {
    return String(id || "").replace(/-explain$/i, "");
  }

  function practiceExerciseIds(ids) {
    return (ids || []).filter(function (id) { return !isExplainId(id); });
  }

  function isExplainOnlyAssignment(ids) {
    var all = ids || [];
    return all.length > 0 && practiceExerciseIds(all).length === 0;
  }

  function drillKindLabel(id) {
    var raw = String(id || "");
    var explain = isExplainId(raw);
    var row = _taxById[baseExerciseId(raw)];
    if (!row) return explain ? "Giải thích chi tiết" : "";
    var bits = [];
    if (row.qType) bits.push("họ khuôn:" + row.qType);
    if (row.scene) bits.push("Tình huống:" + row.scene);
    var label = bits.join(" · ");
    if (explain) return label ? ("Giải thích chi tiết · " + label) : "Giải thích chi tiết";
    if (row.qType && raw.indexOf("-reading-") < 0) return label ? ("Luyện tập · " + label) : "Luyện tập";
    return label;
  }

  function loadTaxonomyJson(file) {
    if (_taxPromises[file]) return _taxPromises[file];
    _taxPromises[file] = fetch(manifestUrl().replace("manifest.json", file)).then(function (r) {
      if (!r.ok) throw new Error(file + " HTTP " + r.status);
      return r.json();
    }).then(rememberTaxonomy).catch(function (err) {
      _taxPromises[file] = null;
      throw err;
    });
    return _taxPromises[file];
  }

  function loadListeningTaxonomy() {
    return loadTaxonomyJson("listening-taxonomy.json");
  }

  function loadReadingTaxonomy() {
    return loadTaxonomyJson("reading-taxonomy.json");
  }

  function load() {
    if (_manifestPromise) return _manifestPromise;
    _manifestPromise = fetch(manifestUrl()).then(function (r) {
      if (!r.ok) throw new Error("manifest.json HTTP " + r.status);
      return r.json();
    }).then(function (d) {
      var items = (d && (d.items || d.exams)) || [];   // accept old key too
      items.sort(function (a, b) { return String(b.added || "").localeCompare(String(a.added || "")); });
      return items;
    }).catch(function (err) {
      _manifestPromise = null;
      throw err;
    });
    return _manifestPromise;
  }

  function subjectsOf(zone) { return ZONE_SUBJECTS[zone] || []; }

  function fileHref(item, prefix) {
    // ponytail: lyric tinh chất cười cổ đại họ dây xíchPhátthiết bị,không che đậy exam iframe
    if (item && item.directHref) return (prefix || "") + item.directHref;
    return (prefix || "") + "exam.html?id=" + encodeURIComponent(item.id);
  }

  /** Immersive vocab lesson player (Duolingo-style short lesson). */
  function vocabLessonHref(item, prefix) {
    if (!item || !item.id) return (prefix || "") + "vocab-lesson.html";
    return (prefix || "") + "vocab-lesson.html?id=" + encodeURIComponent(item.id);
  }

  // Render one content card. prefix = path prefix to root pages (e.g. "" or "../")
  function cardHTML(item, prefix) {
    var subj = SUBJECT[item.subject] || { label: "Khác", color: "var(--text-muted)" };
    var done = results()[item.id];
    var isStudy = item.zone === "study";
    var meta = isStudy
      ? '<span>📖 họcTư liệu</span>'
      : '<span>⏱️ ' + (item.duration ? item.duration + " phút" : "khôngđặt giới hạn thời gian") + '</span>';
    var doneText = done
      ? 'Đã hoàn thành' + (done.score != null ? ' · ' + done.score + (done.total ? "/" + done.total : "") : "")
        + (done.band != null ? ' · Band ' + done.band : "")
      : "";
    var cta = isStudy ? "Bắt đầuhọc →"
      : (item.subject === "jingting" ? "Bắt đầutinh chất cười cổ đại →"
        : (item.zone === "mock" ? "đi vàoPhòng thi →" : "Bắt đầuLuyện tập →"));

    return '' +
      '<a class="exam-card ' + (done ? "is-done" : "") + '" href="' + fileHref(item, prefix) + '">' +
        '<span class="done-flag">' + esc(doneText) + '</span>' +
        '<div class="exam-card__top">' +
          '<span class="badge badge--' + esc(item.subject) + '">' + esc(subj.label) + '</span>' +
          '<span class="tag-cat">' + esc((ZONE[item.zone] || {}).label || "") + '</span>' +
        '</div>' +
        '<h3>' + esc(displayTitle(item)) + '</h3>' +
        '<p>' + esc(item.description || "nhấnđi vào,nhấnYêu cầuHoàn thànhhình thức kết hợp gốc lượng từ cho quà tặngNội dung.") + '</p>' +
        '<div class="exam-card__meta">' + meta +
          (item.added ? '<span>📅 ' + esc(item.added) + '</span>' : '') +
        '</div>' +
        '<div class="exam-card__foot">' +
          '<span class="btn btn--primary btn--sm" style="pointer-events:none">' + cta + '</span>' +
        '</div>' +
      '</a>';
  }

  // ---- Vocabulary book grouping (Khu vực Từ vựng → vocab-shelf.html?book=…) ----
  var VOCAB_BOOKS = {
    gaozhong: { key: "gaozhong", label: "trường trung học phổ thôngTừ vựng", subject: "vocab", tag: "IELTS Hệ thống Kiểm tra Tiếng Anh Quốc tếCơ bản", chunk: 10 },
    cet4: {
      key: "cet4", label: "cấp 4Từ vựng", subject: "vocab-cet4", tag: "CET-4", chunk: 10,
      // ponytail: frequency bands replace 10-unit chunks for cet4 hub tabs
      bands: [
        { id: "high", label: "Tần suất cao", start: 1, end: 10 },
        { id: "mid", label: "hình thức kết hợp Trung Quốc tần suất", start: 11, end: 20 },
        { id: "low", label: "thấp tần suất", start: 21, end: 28 },
        { id: "zero", label: "không tần suất", start: 29, end: 35 }
      ]
    },
    "cet4-lite": {
      key: "cet4-lite", label: "cấp 4Từ vựng(đơn giản hóamột đăng ký)", subject: "vocab-cet4-lite", tag: "CET-4 đơn giản hóa", chunk: 10
    },
    special:  {
      key: "special", label: "IELTS Hệ thống Kiểm tra Tiếng Anh Quốc tếchuyên biệtTừ vựng", tag: "chủ đề cụ thể được đề cập trong sách",
      subjects: ["vocab-special-listening", "vocab-special-reading", "vocab-special-writing"]
    }
    // ponytail: themes live in shelf catalog (vocab-shelf.html?view=catalog)
  };

  function isVocabListSubject(subject) {
    return subject === "vocab" || subject === "vocab-cet4" || subject === "vocab-cet4-lite";
  }

  function isVocabSpecial(subject) {
    return String(subject || "").indexOf("vocab-special-") === 0;
  }

  function needsVocabBridge(subject) {
    return isVocabListSubject(subject) || isVocabSpecial(subject);
  }

  function vocabListNo(item) {
    var t = String((item && item.title) || "");
    var m = t.match(/LIST\s*0*(\d+)/i);
    if (m) return Number(m[1]);
    m = t.match(/Bài\s*0*(\d+)/);
    if (m) return Number(m[1]);
    m = t.match(/\s*0*(\d+)\s*tờ/);
    if (m) return Number(m[1]);
    m = String((item && item.id) || "").match(/(?:writing|listening|reading)-vocab-0*(\d+)/i);
    if (m) return Number(m[1]);
    m = String((item && item.file) || "").match(/theme-0*(\d+)/i);
    if (m) return Number(m[1]);
    m = String((item && item.id) || "").match(/theme-0*(\d+)/i);
    if (m) return Number(m[1]);
    m = String((item && item.file) || "").match(/(?:LIST|list|vocab-)0*(\d+)/i);
    return m ? Number(m[1]) : 0;
  }

  // Clear catalog titles for search + UI (manifest keeps raw LIST titles).
  function vocabDisplayTitle(item) {
    var n = vocabListNo(item);
    var s = (item && item.subject) || "";
    if (!n) return (item && item.title) || "";
    if (s === "vocab") return "trường trung học phổ thôngTừ vựngBài" + n;
    if (s === "vocab-cet4") return "Bài " + n;
    if (s === "vocab-cet4-lite") return "đơn giản hóa List " + n;
    if (s === "vocab-special-listening") return "NgheTừ vựngBài" + n;
    if (s === "vocab-special-reading") return "ĐọcTừ vựngBài" + n;
    if (s === "vocab-special-writing") return "ViếtTừ vựngBài" + n;
    if (isVocabSpecial(s)) return "IELTS Hệ thống Kiểm tra Tiếng Anh Quốc tếTừ vựngBài" + n;
    return (item && item.title) || "";
  }

  function displayTitle(item) {
    if (!item) return "";
    if (isVocabListSubject(item.subject) || isVocabSpecial(item.subject)) {
      return vocabDisplayTitle(item);
    }
    return item.title || "";
  }

  // Assignable part ids: cambridge-20-test-1-s1 / cambridge-20-test-1-reading-p1 / secret-set-1-reading-p1
  function parsePartId(id) {
    var m = String(id || "").match(/^(cambridge-\d+-test-\d+(?:-reading)?|secret-set-\d+(?:-reading)?)-(s|p)(\d+)$/i);
    if (!m) return null;
    return { parentId: m[1], kind: m[2].toLowerCase(), num: Number(m[3]) };
  }

  // họ khuônLuyện tập: cambridge-21-test-1-s1-q1-6 / …-q1-6-explain / secret-set-1-reading-p1-q1-13
  function parseGroupId(id) {
    var raw = String(id || "");
    var m = raw.match(/^(cambridge-\d+-test-\d+(?:-reading)?|secret-set-\d+(?:-reading)?)-(s|p)(\d+)-q(\d+)-(\d+)(?:-explain)?$/i);
    if (!m) return null;
    return {
      parentId: m[1], kind: m[2].toLowerCase(), num: Number(m[3]),
      qFrom: Number(m[4]), qTo: Number(m[5]), explain: /-explain$/i.test(raw)
    };
  }

  // Calendar / dashboard: Cambridge L/R/W (full or part) → CDT chrome query
  // cdtPack from teacher assign: drill | exam | "" (infer)
  function cambridgeCdtQs(itemId, linkedIds, cdtPack) {
    var id = String(itemId || "");
    var explain = /-explain$/i.test(id);
    if (explain) id = id.replace(/-explain$/i, "");
    if (!/^(cambridge-\d+-test-\d+(-reading(-p\d+(-q\d+-\d+)?)?|-writing|-s\d+(-q\d+-\d+)?)?|secret-set-\d+(-reading(-p\d+(-q\d+-\d+)?)?|-s\d+(-q\d+-\d+)?)?)$/.test(id)) return "";
    var base = "";
    if (/^cambridge-\d+-test-\d+$/.test(id) || /^secret-set-\d+$/.test(id)) base = id;
    else {
      var m = id.match(/^(cambridge-\d+-test-\d+|secret-set-\d+)(?:-reading(?:-p\d+(?:-q\d+-\d+)?)?|-writing|-s\d+(?:-q\d+-\d+)?)$/);
      if (m) base = m[1];
    }
    var ids = linkedIds || [];
    if (base && ids.indexOf(base) >= 0 &&
        ids.indexOf(base + "-reading") >= 0 &&
        ids.indexOf(base + "-writing") >= 0) {
      return "&cdt=1&pack=exam&suite=1";
    }
    var pack = String(cdtPack || "").toLowerCase();
    var qs = pack === "exam" ? "&cdt=1&pack=exam" : "&cdt=1&pack=drill";
    if (explain) qs += "&explain=1";
    return qs;
  }

  // tuyệt mậtche đậy cuộn lại Section / Passage hình thức kết hợp Trung Quốc Anh nướctiêu đề(Giáo viênsắp xếptruy xuất dữ liệusử dụng)
  var SECRET_PART_TITLES = {
    "secret-set-1-s1": ["thư việnphục vụ", "Library services"],
    "secret-set-1-s2": ["sinh viên đại họcthuê căn hộ", "Types of accommodation"],
    "secret-set-1-s3": ["quần jeanthời trangmục", "Fashion Project on Jeans"],
    "secret-set-1-s4": ["cao su tự nhiênlàm", "Natural rubber production"],
    "secret-set-1-reading-p1": ["nhiều thế hệ liên tiếptượng đồ chơi", "Dolls through the ages"],
    "secret-set-1-reading-p2": ["tàu lượn siêu tốc", "Roller coaster"],
    "secret-set-1-reading-p3": ["họ cuống của quả họ Mori họ Nhật Bản", "Robert Louis Stevenson"],
    "secret-set-2-s1": ["khinh khí cầumáy bay", "High Flyers balloon flights"],
    "secret-set-2-s2": ["phòng trưng bày nghệ thuậtkhách tham quan", "Art Gallery"],
    "secret-set-2-s3": ["người chứng kiến tận mắtlời khai", "Eyewitness reliability"],
    "secret-set-2-s4": ["rừng hoặc đầm lầy ngập mặntái sinh", "The mangrove regeneration project"],
    "secret-set-2-reading-p1": ["hoang dãchiều dàihươu cao cổ", "Giraffes in the wild"],
    "secret-set-2-reading-p2": ["pháp luậttầm quan trọng", "The importance of law"],
    "secret-set-2-reading-p3": ["nghệ thuậtbảo tàngtái tạo một đối tượng nghệ thuật", "Rebranding art museums"],
    "secret-set-3-reading-p1": ["trong mọi trường hợp ni cô nữ tu Phật giáonhà hát opera", "Sydney Opera House"],
    "secret-set-3-reading-p2": ["đích thânđúngthiết kế", "Biophilic Design"],
    "secret-set-3-reading-p3": ["từ tượng thanh đongmọi ngườiđúngâm nhạcbị điếc", "When people are deaf to music"],
    "secret-set-4-reading-p1": ["Úctrên bầu trờinha sĩ", "Australia's Airborne Dentists"],
    "secret-set-4-reading-p2": ["Tasmania Đài Loancon hổ", "The Tasmanian Tiger"],
    "secret-set-4-reading-p3": ["200họÚcphong cảnhLuân Đônhoàng giaKhoa / Viện", "200 Years of Australian Landscapes at the Royal Academy in London"]
  };

  function secretPartPair(id) {
    return SECRET_PART_TITLES[id] || null;
  }

  function secretTopicLine(item) {
    var t = item && SECRET_PART_TITLES[item.id];
    return t ? (t[0] + " · " + t[1]) : "";
  }

  function secretPaperTopics(item) {
    if (!item || item.partNum) return "";
    var kind = item.subject === "cambridge-listening" ? "s" : (item.subject === "cambridge-reading" ? "p" : "");
    if (!kind || !/^secret-set-\d+/.test(item.id || "")) return "";
    var n = kind === "s" ? 4 : 3;
    var bits = [];
    for (var i = 1; i <= n; i++) {
      var t = SECRET_PART_TITLES[item.id + "-" + kind + i];
      if (t) bits.push(t[0]);
    }
    return bits.join(" / ");
  }

  function secretSearchText(item) {
    if (!item) return "";
    var t = SECRET_PART_TITLES[item.id];
    if (t) return t[0] + " " + t[1];
    return secretPaperTopics(item);
  }

  function makePartItem(parent, kind, num) {
    if (!parent || !num) return null;
    var label = kind === "s" ? ("Section " + num) : ("Passage " + num);
    var base = String(parent.title || "").replace(/([^)]*)\s*$/, "").replace(/\s+$/, "");
    return Object.assign({}, parent, {
      id: parent.id + "-" + kind + num,
      title: base + " · " + label,
      partKind: kind,
      partNum: num,
      parentId: parent.id,
      duration: kind === "s" ? 10 : 20
    });
  }

  function makeGroupItem(parent, num, qFrom, qTo, explain) {
    if (!parent || !num || !qFrom || !qTo) return null;
    var kind = parent.subject === "cambridge-reading" ? "p" : "s";
    var part = makePartItem(parent, kind, num);
    if (!part) return null;
    part.id = parent.id + "-" + kind + num + "-q" + qFrom + "-" + qTo;
    part.title = part.title + " Q" + qFrom + "–" + qTo;
    part.qFrom = qFrom;
    part.qTo = qTo;
    if (explain) {
      part.id += "-explain";
      part.title += " · Giải thích chi tiết";
      part.explain = true;
    }
    return part;
  }

  function resolveItem(items, id) {
    var list = items || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    var group = parseGroupId(id);
    if (group) {
      var gParent = null;
      for (var gi = 0; gi < list.length; gi++) {
        if (list[gi].id === group.parentId) { gParent = list[gi]; break; }
      }
      return gParent ? makeGroupItem(gParent, group.num, group.qFrom, group.qTo, group.explain) : null;
    }
    var part = parsePartId(id);
    if (!part) return null;
    var parent = null;
    for (var j = 0; j < list.length; j++) {
      if (list[j].id === part.parentId) { parent = list[j]; break; }
    }
    return parent ? makePartItem(parent, part.kind, part.num) : null;
  }

  // Teacher assignment picker: full paper + each listening section / reading passage
  function expandAssignableParts(items) {
    var out = [];
    (items || []).forEach(function (it) {
      out.push(it);
      if (it.subject === "cambridge-listening") {
        for (var s = 1; s <= 4; s++) out.push(makePartItem(it, "s", s));
      } else if (it.subject === "cambridge-reading") {
        for (var p = 1; p <= 3; p++) out.push(makePartItem(it, "p", p));
      }
    });
    return out;
  }

  function partSearchText(item) {
    if (!item || !item.partNum) return "";
    var v = camVolume(item);
    var t = camTestNo(item);
    var k = item.partKind === "s" ? "s" : "p";
    var skill = item.subject === "cambridge-listening" ? "Nghe" : "Đọc";
    return [
      "c" + v, "c" + v + skill,
      "t" + t + k + item.partNum,
      "t" + t + (item.partKind === "s" ? "section" : "passage") + item.partNum,
      (item.partKind === "s" ? "section" : "passage") + item.partNum,
      skill + "t" + t + k + item.partNum,
      secretSearchText(item)
    ].join(" ");
  }

  // Topic after "·" for special units (secondary line only).
  function vocabTopic(item) {
    var t = String((item && item.title) || "");
    var m = t.match(/[·•]\s*(.+)$/);
    return m ? m[1].replace(/\s*-\s*.*$/, "").trim() : "";
  }

  function vocabBookStats(items, bookKey) {
    var book = VOCAB_BOOKS[bookKey];
    if (!book) return null;
    var lists = [];
    if (book.subject) {
      lists = (items || []).filter(function (it) { return it.subject === book.subject; });
    } else if (book.subjects) {
      lists = (items || []).filter(function (it) { return book.subjects.indexOf(it.subject) >= 0; });
    }
    lists.sort(function (a, b) {
      if (book.subjects) {
        var ai = book.subjects.indexOf(a.subject);
        var bi = book.subjects.indexOf(b.subject);
        if (ai !== bi) return ai - bi;
      }
      var d = vocabListNo(a) - vocabListNo(b);
      return d || String(a.title).localeCompare(String(b.title), "zh-Hans-CN", { numeric: true, sensitivity: "base" });
    });
    return { book: book, total: lists.length, lists: lists };
  }

  function vocabProgress(lists) {
    var res = results();
    var done = 0, last = null, lastNo = 0;
    (lists || []).forEach(function (it) {
      if (!res[it.id]) return;
      done++;
      var n = vocabListNo(it);
      if (n >= lastNo) { lastNo = n; last = it; }
    });
    var sorted = (lists || []).slice().sort(function (a, b) { return vocabListNo(a) - vocabListNo(b); });
    var next = null, i;
    for (i = 0; i < sorted.length; i++) {
      if (vocabListNo(sorted[i]) > lastNo && !res[sorted[i].id]) { next = sorted[i]; break; }
    }
    if (!next) {
      for (i = 0; i < sorted.length; i++) {
        if (!res[sorted[i].id]) { next = sorted[i]; break; }
      }
    }
    if (!next && sorted.length) next = sorted[0];
    return { done: done, total: sorted.length, last: last, next: next };
  }

  function vocabListRanges(lists, chunkSize) {
    var nums = (lists || []).map(vocabListNo).filter(function (n) { return n > 0; });
    if (!nums.length) return [{ id: "all", label: "Tất cả", start: 0, end: 9999 }];
    var max = Math.max.apply(null, nums);
    var chunk = chunkSize || 10;
    var ranges = [];
    for (var start = 1; start <= max; start += chunk) {
      var end = Math.min(start + chunk - 1, max);
      ranges.push({ id: start + "-" + end, label: "Bài " + start + "–" + end, start: start, end: end });
    }
    return ranges;
  }

  function vocabBooksForZone(items) {
    return ["gaozhong", "cet4", "cet4-lite", "special"].map(function (k) {
      return vocabBookStats(items, k);
    }).filter(function (s) { return s && s.total > 0; });
  }

  function vocabBookCardHTML(stats, prefix) {
    var book = stats.book;
    var prog = vocabProgress(stats.lists);
    var unit = book.subject ? " Bài" : " lượng từ cho quà tặng";
    var cnt = stats.total + unit;
    var progTxt = prog.done ? ("đã học " + prog.done + "/" + stats.total) : cnt;
    var shortLabel = book.key === "gaozhong" ? "trường trung học phổ thông"
      : (book.key === "cet4" ? "cấp 4" : (book.key === "cet4-lite" ? "đơn giản hóa" : "IELTS Hệ thống Kiểm tra Tiếng Anh Quốc tế"));
    var tagTier = book.key === "special" ? "new" : (book.key === "cet4" ? "mid" : "base");
    var shieldIcon = '<svg class="vol-card__shield" viewBox="0 0 14 16" aria-hidden="true"><path d="M7 1.2 12 3v5.2c0 3.4-2.1 5.9-5 7.3-2.9-1.4-5-3.9-5-7.3V3L7 1.2Z" fill="currentColor"/></svg>';
    var bookIcon = '<svg class="vol-card__book" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path class="vol-card__book-l" d="M4.5 5.5c2.6 0 4.8.5 6.5 1.6v11.4c-1.7-1.1-3.9-1.6-6.5-1.6V5.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>' +
      '<path class="vol-card__book-r" d="M19.5 5.5c-2.6 0-4.8.5-6.5 1.6v11.4c1.7-1.1 3.9-1.6 6.5-1.6V5.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M12 7.1v11.4" stroke="currentColor" stroke-width="2"/></svg>';
    return '' +
      '<a class="vol-card vol-card--vocab vol-card--tier-' + tagTier + '" href="' + (prefix || "") + 'vocab-shelf.html?book=' + encodeURIComponent(book.key) + '">' +
        '<div class="vol-card__main">' +
        '<div class="vol-card__top">' +
          '<span class="vol-card__vol">' + shieldIcon + ' ' + esc(shortLabel) + '</span>' +
          '<span class="vol-card__tag vol-card__tag--' + tagTier + '">' + esc(book.tag) + '</span>' +
        '</div>' +
        '<div class="vol-card__body">' +
          '<span class="vol-card__ico">' + bookIcon + '</span>' +
          '<div><h3>' + esc(book.label) + '</h3>' +
          '<div class="vol-card__cnt">' + esc(progTxt) + '</div></div>' +
        '</div>' +
        '<div class="vol-card__foot">' +
          '<span class="vol-card__skills"><span class="vc-skill vc-skill--a">biến thể cũ của</span></span>' +
          '<span class="vol-card__go">đi vào ›</span>' +
        '</div>' +
        '</div>' +
      '</a>';
  }

  // ---- Cambridge series grouping (Khu vực Đề thi thật shows one card per volume) ----
  function isCambridge(subject) {
    return subject === "cambridge-listening" || subject === "cambridge-reading" || subject === "cambridge-writing";
  }

  // Reading exams that show passage text (Cambridge, practice reading, placement tests, etc.)
  function isReadingExam(item) {
    if (!item) return false;
    if (item.subject === "cambridge-reading") return true;
    var blob = (item.file || "") + (item.title || "") + (item.description || "");
    return /reading|Đọc/i.test(blob);
  }

  // Pull the volume number (e.g. "15") out of a title like "Cambridge IELTS15 · Test 1(Nghe)".
  function camVolume(item) {
    var m = String((item && item.title) || "").match(/kiếm hai lưỡi(?:cầuIELTS Hệ thống Kiểm tra Tiếng Anh Quốc tế)?\s*0*(\d+)/);
    return m ? m[1] : "";
  }

  // Summarise cambridge items into [{vol, listening, reading, total}], newest volume first.
  // Pull the test number out of a title like "… · Test 1(Nghe)".
  function camTestNo(item) {
    var m = String((item && item.title) || "").match(/Test\s*0*(\d+)/i);
    return m ? m[1] : "";
  }

  function camVolumes(items) {
    var map = {};
    (items || []).forEach(function (it) {
      if (!isCambridge(it.subject)) return;
      var v = camVolume(it); if (!v) return;
      if (!map[v]) map[v] = { vol: v, listening: 0, reading: 0, writing: 0, total: 0, _tests: {} };
      if (it.subject === "cambridge-reading") map[v].reading++;
      else if (it.subject === "cambridge-writing") map[v].writing++;
      else map[v].listening++;
      map[v].total++;
      var t = camTestNo(it); if (t) map[v]._tests[t] = 1;
    });
    return Object.keys(map)
      .sort(function (a, b) { return Number(b) - Number(a); })
      .map(function (k) { var o = map[k]; o.tests = Object.keys(o._tests).length || o.total; delete o._tests; return o; });
  }

  // Tag a volume by recency (cosmetic, like the mockup's mới nhất/nâng cao/Cơ bản).
  function camVolTag(vol) {
    var n = Number(vol);
    if (n >= 19) return { t: "mới nhất", c: "new" };
    if (n >= 13) return { t: "nâng cao", c: "mid" };
    return { t: "Cơ bản", c: "base" };
  }

  /* ponytail: one glyph set for hub / vol-card / skill-panel */
  function skillGlyph(key) {
    var k = key || "mock";
    var map = {
      listening: '<svg class="skill-glyph" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
        '<path d="M4 11a8 8 0 0 1 16 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
        '<path d="M5.5 11v3.2a2.3 2.3 0 0 0 2.3 2.3h.7V11H5.5Zm13 0h-2.5v5.5h.7a2.3 2.3 0 0 0 2.3-2.3V11Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' +
        '<path d="M12 17.5v1.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
      reading: '<svg class="skill-glyph skill-glyph--book" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
        '<path class="vol-card__book-l" d="M4.5 5.5c2.6 0 4.8.5 6.5 1.6v11.4c-1.7-1.1-3.9-1.6-6.5-1.6V5.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' +
        '<path class="vol-card__book-r" d="M19.5 5.5c-2.6 0-4.8.5-6.5 1.6v11.4c1.7-1.1 3.9-1.6 6.5-1.6V5.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' +
        '<path d="M12 7.1v11.4" stroke="currentColor" stroke-width="1.8"/></svg>',
      writing: '<svg class="skill-glyph" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
        '<path d="M14.2 4.8 19.2 9.8 9 20H4v-5L14.2 4.8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' +
        '<path d="M12.5 6.5 17.5 11.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
      speaking: '<svg class="skill-glyph" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
        '<path d="M12 3.8a3.2 3.2 0 0 0-3.2 3.2v5.2a3.2 3.2 0 1 0 6.4 0V7A3.2 3.2 0 0 0 12 3.8Z" stroke="currentColor" stroke-width="1.8"/>' +
        '<path d="M6.2 11.2a5.8 5.8 0 0 0 11.6 0M12 17v3.2M9.2 20.2h5.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
      mock: '<svg class="skill-glyph" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
        '<path d="M12 3.2 19 5.4v6.1c0 4.2-2.8 7.4-7 9.1-4.2-1.7-7-4.9-7-9.1V5.4L12 3.2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' +
        '<path d="M9.2 12.1 11.1 14l3.7-4.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    };
    return map[k] || map.mock;
  }

  // One volume card (clean VOL.NN style) → opens cambridge.html?vol=N
  function camVolumeProgress(items, vol) {
    var cam = (items || []).filter(function (it) {
      return isCambridge(it.subject) && camVolume(it) === String(vol);
    });
    var res = results();
    var done = cam.filter(function (it) { return res[it.id]; }).length;
    return { done: done, total: cam.length };
  }

  function camVolumeCardHTML(v, prefix, items, opts) {
    opts = opts || {};
    var skill = opts.skill || "";
    var accent = skill === "listening" || skill === "reading" || skill === "writing" ? skill : "mock";
    var tag = camVolTag(v.vol);
    var prog = items ? camVolumeProgress(items, v.vol) : null;
    var cntText = prog && prog.done
      ? "Đã hoàn thành " + prog.done + "/" + prog.total + " lượng từ cho quà tặng · " + v.tests + " che đậy"
      : "chứa " + v.tests + " che đậy";
    var doneClass = prog && prog.total && prog.done >= prog.total ? " vol-card--done" : "";
    var markIcon = '<svg class="vol-card__shield" viewBox="0 0 14 16" aria-hidden="true"><path d="M7 1.2 12 3v5.2c0 3.4-2.1 5.9-5 7.3-2.9-1.4-5-3.9-5-7.3V3L7 1.2Z" fill="currentColor"/></svg>';
    var skills = accent === "mock"
      ? '<span class="vc-skill vc-skill--l">L</span><span class="vc-skill vc-skill--r">R</span><span class="vc-skill vc-skill--w">W</span>'
      : accent === "listening"
        ? '<span class="vc-skill vc-skill--l">1</span><span class="vc-skill vc-skill--l">2</span><span class="vc-skill vc-skill--l">3</span><span class="vc-skill vc-skill--l">4</span>'
        : accent === "reading"
          ? '<span class="vc-skill vc-skill--r">P1</span><span class="vc-skill vc-skill--r">P2</span><span class="vc-skill vc-skill--r">P3</span>'
          : '<span class="vc-skill vc-skill--w">T1</span><span class="vc-skill vc-skill--w">T2</span>';
    var href = opts.href || ((prefix || "") + "cambridge.html?vol=" + encodeURIComponent(v.vol) +
      (skill ? "&skill=" + encodeURIComponent(skill) : ""));
    var goLabel = opts.goLabel || (skill ? "Bắt đầuLuyện tập ›" : "Bắt đầuThi thử ›");
    return '' +
      '<a class="vol-card vol-card--' + accent + ' vol-card--tier-' + tag.c + doneClass +
        (opts.cardClass ? " " + opts.cardClass : "") +
        '" href="' + href + '" data-skill="' + accent + '">' +
        '<div class="vol-card__main">' +
        '<div class="vol-card__top">' +
          '<span class="vol-card__vol">' + markIcon + ' VOL.' + esc(v.vol) + '</span>' +
          '<span class="vol-card__tag vol-card__tag--' + tag.c + '">' + tag.t + '</span>' +
        '</div>' +
        '<div class="vol-card__body">' +
          '<span class="vol-card__ico">' + skillGlyph(accent) + '</span>' +
          '<div><h3>Cambridge IELTS ' + esc(v.vol) + '</h3>' +
          '<div class="vol-card__cnt">' + cntText + '</div></div>' +
        '</div>' +
        '<div class="vol-card__foot">' +
          '<span class="vol-card__skills">' + skills + '</span>' +
          '<span class="vol-card__go">' + goLabel + '</span>' +
        '</div>' +
        '</div>' +
      '</a>';
  }

  // Cambridge catalog: tier filter, search, collapsible legacy volumes.
  function cambridgeCatalogHTML(volumes, items, prefix, opts) {
    opts = opts || {};
    var q = String(opts.query || "").toLowerCase().trim();
    var tier = opts.tier || "all";
    var collapseLegacy = opts.collapseLegacy !== false;
    var legacyBefore = opts.legacyBefore != null ? opts.legacyBefore : 13;

    var filtered = (volumes || []).filter(function (v) {
      var n = Number(v.vol);
      if (tier === "new" && n < 19) return false;
      if (tier === "mid" && (n < 13 || n > 18)) return false;
      if (tier === "base" && n >= 13) return false;
      if (q) {
        var hay = ("Cambridge IELTS vol " + v.vol + " cambridge " + v.vol).toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });

    if (!filtered.length) {
      return '<div class="soon-box">không cóGhép nốisách đếm,thử thửKhácLọcđiều kiện.</div>';
    }

    function cards(vols) {
      return vols.map(function (v) {
        var cardOpts = { skill: opts.skill || "" };
        if (opts.goLabel) cardOpts.goLabel = opts.goLabel;
        if (opts.cardHref) cardOpts.href = opts.cardHref(v);
        if (opts.cardClass) cardOpts.cardClass = opts.cardClass;
        return camVolumeCardHTML(v, prefix, items, cardOpts);
      }).join("");
    }

    if (tier !== "all" || q || !collapseLegacy) {
      return '<div class="vol-grid">' + cards(filtered) + '</div>';
    }

    var recent = filtered.filter(function (v) { return Number(v.vol) >= legacyBefore; });
    var legacy = filtered.filter(function (v) { return Number(v.vol) < legacyBefore; });
    var html = '<div class="vol-grid">' + cards(recent) + "</div>";
    if (legacy.length) {
      html += '<details class="catalog-collapse">' +
        '<summary><span class="catalog-collapse__label">thay đổi hoặc thay thế nhiềuCơ bảnsách</span>' +
        '<span class="catalog-collapse__meta">' + legacy.length + " sách · Vol." +
        legacy[legacy.length - 1].vol + "–" + legacy[0].vol + "</span></summary>" +
        '<div class="vol-grid">' + cards(legacy) + "</div></details>";
    }
    return html;
  }

  // Nghetinh chất cười cổ đại:sáchdanh sáchđi vol-grid;điểm tiến lên một sách lại sắp xếp Test / Part
  function jingtingVol(item) {
    var m = String((item && item.title) || "").match(/kiếm hai lưỡi(?:tao nhã|cầuIELTS Hệ thống Kiểm tra Tiếng Anh Quốc tế)?\s*0*(\d+)/);
    if (m) return m[1];
    m = String((item && item.id) || "").match(/cam(\d+)/i);
    return m ? m[1] : "";
  }

  function jingtingTestNo(item) {
    var m = String((item && item.id) || "").match(/-t(\d+)/i);
    if (m) return m[1];
    return camTestNo(item);
  }

  function jingtingPartNo(item) {
    var m = String((item && item.id) || "").match(/-p(\d+)/i);
    if (m) return m[1];
    m = String((item && item.title) || "").match(/Part\s*0*(\d+)/i);
    if (m) return m[1];
    m = String((item && item.title) || "").match(/Section\s*0*(\d+)/i);
    return m ? m[1] : "";
  }

  function jingtingPartRowHTML(item, prefix) {
    var done = results()[item.id];
    var t = jingtingTestNo(item);
    var p = jingtingPartNo(item);
    var label = (t && p) ? ("Test " + t + " · Part " + p) : displayTitle(item);
    return '<a class="catalog-row' + (done ? " is-done" : "") + '" href="' + fileHref(item, prefix) + '">' +
      '<span class="catalog-row__badge badge badge--jingting">Part ' + esc(p || "?") + "</span>" +
      '<span class="catalog-row__title">' + esc(label) + "</span>" +
      (done ? '<span class="catalog-row__status">Đã hoàn thành</span>' : '<span class="catalog-row__go">Bắt đầutinh chất cười cổ đại ›</span>') +
      "</a>";
  }

  function jingtingPlayerItems(items) {
    return (items || []).filter(function (it) {
      return it.directHref && String(it.directHref).indexOf("jingting-player") === 0;
    });
  }

  function jingtingVolumes(items) {
    var map = {};
    jingtingPlayerItems(items).forEach(function (it) {
      var v = jingtingVol(it);
      if (!v) return;
      if (!map[v]) map[v] = { vol: v, listening: 0, reading: 0, writing: 0, total: 0, _tests: {} };
      map[v].listening++;
      map[v].total++;
      var t = jingtingTestNo(it);
      if (t) map[v]._tests[t] = 1;
    });
    return Object.keys(map)
      .sort(function (a, b) { return Number(b) - Number(a); })
      .map(function (k) {
        var o = map[k];
        o.tests = Object.keys(o._tests).length || o.total;
        delete o._tests;
        return o;
      });
  }

  function jingtingTestsHTML(list, prefix) {
    list = list.slice().sort(function (a, b) {
      return (Number(jingtingTestNo(a)) - Number(jingtingTestNo(b))) ||
        (Number(jingtingPartNo(a)) - Number(jingtingPartNo(b))) ||
        String(a.title).localeCompare(String(b.title), "zh");
    });
    var byTest = {};
    list.forEach(function (it) {
      var t = jingtingTestNo(it) || "0";
      if (!byTest[t]) byTest[t] = [];
      byTest[t].push(it);
    });
    var tests = Object.keys(byTest).sort(function (a, b) { return Number(a) - Number(b); });
    if (tests.length <= 1 && tests[0] === "0") {
      return '<div class="catalog-rows">' + list.map(function (it) {
        return jingtingPartRowHTML(it, prefix);
      }).join("") + "</div>";
    }
    return '<div class="vol-grid">' + tests.map(function (t) {
      var parts = byTest[t];
      return '<div class="vol-card vol-card--jingting">' +
        '<div class="vol-card__main">' +
          '<div class="vol-card__top">' +
            '<span class="vol-card__vol">TEST ' + esc(t) + "</span>" +
            '<span class="vol-card__tag vol-card__tag--new">' + parts.length + " Part</span>" +
          "</div>" +
          '<div class="catalog-rows">' + parts.map(function (it) {
            return jingtingPartRowHTML(it, prefix);
          }).join("") + "</div>" +
        "</div></div>";
    }).join("") + "</div>";
  }

  function jingtingCatalogHTML(items, prefix, opts) {
    opts = opts || {};
    items = jingtingPlayerItems(items);
    if (opts.vol) {
      var vol = String(opts.vol);
      var list = items.filter(function (it) { return jingtingVol(it) === vol; });
      if (!list.length) {
        return '<div class="soon-box">chưatìm thấykiếm hai lưỡi' + esc(vol) + " tinh chất cười cổ đại." +
          '<p><a href="zone.html?zone=mock&amp;s=jingting">Quay lạisáchdanh sách</a></p></div>';
      }
      return '<p class="cam-pick-hint"><a href="zone.html?zone=mock&amp;s=jingting">← Quay lạiNghetinh chất cười cổ đại</a>' +
        " · Chọn Test / Part đi vàotinh chất cười cổ đại.</p>" +
        jingtingTestsHTML(list, prefix);
    }
    var vols = jingtingVolumes(items);
    if (!vols.length) return '<div class="soon-box">tạm thời không có tinh chất cười cổ đạiNội dung.</div>';
    return cambridgeCatalogHTML(vols, items, prefix, {
      skill: "listening",
      tier: opts.tier,
      query: opts.query,
      collapseLegacy: true,
      goLabel: "Bắt đầutinh chất cười cổ đại ›",
      cardClass: "vol-card--jingting",
      cardHref: function (v) {
        return (prefix || "") + "zone.html?zone=mock&s=jingting&vol=" + encodeURIComponent(v.vol);
      }
    });
  }

  function relativeWhen(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    var now = new Date();
    var sameDay = d.toDateString() === now.toDateString();
    var yest = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    var time = d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });
    if (sameDay) return "hôm nay " + time;
    if (d.toDateString() === yest.toDateString()) return "hôm qua " + time;
    return d.toLocaleString("zh-CN", { hour12: false });
  }

  function subjectPillLabel(subject) {
    if (subject === "cambridge-listening") return "Nghe";
    if (subject === "cambridge-reading") return "Đọc";
    if (subject === "cambridge-writing") return "Viết";
    var s = SUBJECT[subject];
    return (s && s.label) || "Luyện tập";
  }

  function resultsInsightLine(rows) {
    var listen = rows.filter(function (r) { return r.subject === "cambridge-listening" && r.band != null; }).slice(0, 3);
    var wrongN = 0;
    rows.forEach(function (r) {
      if (r.wrong && r.wrong.length) wrongN += r.wrong.length;
    });
    var parts = [];
    if (listen.length) {
      var avg = listen.reduce(function (s, r) { return s + Number(r.band); }, 0) / listen.length;
      parts.push("Nghegần đây " + listen.length + " tiếp theo bằng Band " + (Math.round(avg * 10) / 10));
    }
    if (wrongN) parts.push("đợi được thông báohọCâu sai " + wrongN);
    else parts.push("Lũy kế " + rows.length + " tiếp theoLuyện tập");
    return parts.join(" · ");
  }

  function resultsSummaryHTML(rows, prefix) {
    if (!rows.length) return "";
    var latest = rows[0];
    var bandRows = rows.filter(function (r) { return r.band != null; });
    var latestBand = bandRows.length ? bandRows[0].band : null;
    var scoreTxt = latest.score != null
      ? latest.score + (latest.total != null ? " / " + latest.total : "")
      : "—";
    var wrongN = (latest.wrong && latest.wrong.length) || 0;
    if (!wrongN && latest.score != null && latest.total != null && latest.score < latest.total) {
      wrongN = Math.max(0, latest.total - latest.score);
    }
    var hasWrong = !!(latest.wrong && latest.wrong.length);
    var mayHaveWrong = hasWrong || (
      (latest.subject === "cambridge-listening" || latest.subject === "cambridge-reading") &&
      latest.score != null && latest.total != null && latest.score < latest.total
    );
    var wrongBtn = mayHaveWrong
      ? '<button type="button" class="btn btn--ghost btn--sm" data-results-tab="wrongs">XemCâu sai</button>'
      : '<span class="results-hero__soon btn btn--ghost btn--sm is-disabled" title="hình thức kết hợp gốc tiếp theo không cóCâu saicó thểchưabao gồm trong một bộ sưu tập">XemCâu sai</span>';
    var pill = subjectPillLabel(latest.subject);
    var insight = resultsInsightLine(rows);
    return '<section class="results-hero reveal" aria-label="Kết quảtổng quan">' +
      '<div class="results-hero__main">' +
        '<span class="results-hero__eyebrow">LATEST RESULT</span>' +
        '<div class="results-hero__title-row">' +
          '<h2>' + esc(latest.title) + "</h2>" +
          '<span class="results-pill">' + esc(pill) + "</span>" +
        "</div>" +
        '<p class="results-hero__meta">gần đâyHoàn thành · ' + esc(relativeWhen(latest.date)) +
          " ·  " + rows.length + " tiếp theoghi chép</p>" +
        '<div class="results-hero__actions">' +
          '<a class="btn btn--primary btn--sm" href="exam.html?id=' + encodeURIComponent(latest.id) + '">lại luyện tậpđầu tiên</a>' +
          wrongBtn +
          '<button type="button" class="results-hero__ghost-link" data-results-tab="archive">Tất cảghi chép</button>' +
        "</div></div>" +
      '<div class="results-hero__stats">' +
        '<div class="results-hero__stat"><b>' + esc(scoreTxt) + '</b><span>gần đâyĐiểm số</span></div>' +
        '<div class="results-hero__stat' + (latestBand != null ? " results-hero__stat--band" : "") + '">' +
          '<b>' + (latestBand != null ? esc(String(latestBand)) : "—") + '</b><span>Band ước tính</span></div>' +
        '<div class="results-hero__stat"><b>' + wrongN + '</b><span>hình thức kết hợp gốc cuộn lạiCâu sai</span></div>' +
      "</div>" +
      (insight ? '<p class="results-insight">' + esc(insight) + "</p>" : "") +
      "</section>";
  }

  function searchItems(items, query) {
    var q = String(query || "").toLowerCase().trim();
    if (!q) return items || [];
    return (items || []).filter(function (it) {
      var hay = (displayTitle(it) + " " + it.title + " " + (it.description || "") + " " +
        it.subject + " " + it.id).toLowerCase();
      return hay.indexOf(q) >= 0;
    });
  }

  function recentActivity(items, limit) {
    var store = results();
    var byId = {};
    (items || []).forEach(function (it) { byId[it.id] = it; });
    return Object.keys(store).map(function (k) { return store[k]; })
      .filter(function (r) { return byId[r.id]; })
      .sort(function (a, b) { return String(b.date || "").localeCompare(String(a.date || "")); })
      .slice(0, limit || 3)
      .map(function (r) { return { item: byId[r.id], result: r }; });
  }

  function continueStripHTML(activities, prefix) {
    if (!activities.length) return "";
    return homeDashboardHTML([], activities, prefix);
  }

  function journeyStats(items) {
    var store = results();
    var byId = {};
    (items || []).forEach(function (it) { byId[it.id] = it; });
    var counts = { study: 0, practice: 0, mock: 0, total: 0 };
    Object.keys(store).forEach(function (k) {
      var it = byId[k];
      if (!it || !counts.hasOwnProperty(it.zone)) return;
      counts[it.zone]++;
      counts.total++;
    });
    return counts;
  }

  function homeIeltsHTML(items, prefix) {
    var p = prefix || "";
    var zones = [
      { step: "01", label: "Khu vực Từ vựng", sub: "Từ vựng · Ngữ pháp · Khóa họctài liệu", href: p + "zone.html?zone=study" },
      { step: "02", label: "Khu vực Luyện tập", sub: "chiều dài khó để biến thể của · chuyên biệthuấn luyện", href: p + "zone.html?zone=practice" },
      { step: "03", label: "Khu vực Đề thi thật", sub: "Cambridge IELTSĐề thi thật", href: p + "zone.html?zone=mock&s=ielts" }
    ];
    var zoneCards = zones.map(function (z) {
      return '<a class="home-ielts__zone pressable" href="' + z.href + '">' +
        '<span class="home-ielts__zone-step">' + z.step + "</span>" +
        "<b>" + esc(z.label) + "</b>" +
        '<span class="home-ielts__zone-sub">' + esc(z.sub) + "</span>" +
        '<span class="home-ielts__zone-go" aria-hidden="true">→</span></a>';
    }).join("");

    return '<section class="home-ielts reveal" aria-label="IELTS Hệ thống Kiểm tra Tiếng Anh Quốc tếchuẩn bị cho kỳ thi">' +
      '<div class="home-ielts__inner">' +
        '<div class="home-ielts__head">' +
          "<div>" +
            '<span class="home-ielts__eyebrow">IELTS PREPARATION</span>' +
            "<h2>IELTS Hệ thống Kiểm tra Tiếng Anh Quốc tếchuẩn bị cho kỳ thi</h2>" +
            "<p>Từ vựng · Luyện tập · Đề thi thậtmột trạmHoàn thành · Cambridge IELTSĐề thi thật · Từ vựngNgữ pháphệ thốngtinh chất nói</p>" +
          "</div>" +
          '<div class="home-ielts__actions">' +
            '<a class="btn btn--primary pressable" href="' + p + 'zone.html?zone=study">đi vàoKhu vực Từ vựng</a>' +
            '<a class="btn btn--gold pressable" href="' + p + 'zone.html?zone=mock&s=ielts">Bắt đầuĐề thi thật</a>' +
          "</div>" +
        "</div>" +
        '<div class="home-ielts__zones">' + zoneCards + "</div>" +
      "</div></section>";
  }

  function homeJourneyHTML(items, prefix) {
    var counts = journeyStats(items);
    var steps = [
      { zone: "study", step: "01", label: "Từ vựng", sub: "Từ vựng · Ngữ pháp", href: (prefix || "") + "zone.html?zone=study" },
      { zone: "practice", step: "02", label: "Luyện tập", sub: "chiều dài khó để biến thể của · chuyên biệt", href: (prefix || "") + "zone.html?zone=practice" },
      { zone: "mock", step: "03", label: "Đề thi thật", sub: "kiếm hai lưỡi cầuĐề thi thật", href: (prefix || "") + "zone.html?zone=mock" }
    ];
    var current = "study";
    if (counts.mock) current = "mock";
    else if (counts.practice) current = "practice";
    else if (counts.study) current = "study";

    var nodes = steps.map(function (s) {
      var n = counts[s.zone] || 0;
      var cls = "home-journey__node";
      if (n) cls += " is-done";
      if (s.zone === current && counts.total) cls += " is-current";
      return '<a class="' + cls + '" href="' + s.href + '">' +
        '<span class="home-journey__step">' + s.step + '</span>' +
        '<span class="home-journey__label">' + esc(s.label) + '</span>' +
        '<span class="home-journey__sub">' + esc(s.sub) + '</span>' +
        (n ? '<span class="home-journey__count">' + n + ' lượng từ cho quà tặng</span>' : "") +
        "</a>";
    }).join("");

    return '<section class="home-journey reveal" aria-label="chuẩn bị cho kỳ thicon đường">' +
      '<div class="home-journey__head">' +
        '<span class="home-journey__eyebrow">LEARNING PATH</span>' +
        '<h2>bạnchuẩn bị cho kỳ thicon đường</h2>' +
        '<p>họctá từ mượnCơ bản → Luyện tậphọKỹ năng → Thi thửbiến thể của thật họ</p>' +
      "</div>" +
      '<div class="home-journey__track">' + nodes + "</div>" +
      "</section>";
  }

  function homeDashboardHTML(items, activities, prefix) {
    var counts = journeyStats(items || []);
    var acts = activities || [];
    var p = prefix || "";

    if (!acts.length) {
      return '<section class="home-dashboard home-dashboard--empty reveal" aria-label="chuẩn bị cho kỳ thibảng điều khiển">' +
        '<div class="home-dashboard__inner">' +
          '<span class="home-dashboard__eyebrow">YOUR COCKPIT</span>' +
          "<h2>Bắt đầubạnchuẩn bị cho kỳ thicon đường</h2>" +
          "<p>biến thể củaKhu vực Từ vựngcó thểKhu vực Đề thi thậtlựa chọn tự dolối vào,Tiến độcó thểLưutồn tại hình thức kết hợp gốctrình duyệt phần mềm.</p>" +
          '<div class="home-dashboard__actions">' +
            '<a class="btn btn--gold btn--sm" href="' + p + 'zone.html?zone=mock">Bắt đầuĐề thi thật</a>' +
            '<a class="btn btn--ghost-dark btn--sm" href="' + p + 'zone.html?zone=study">đi vàoKhu vực Từ vựng</a>' +
          "</div></div></section>";
    }

    var rows = acts.map(function (a) {
      var r = a.result;
      var zone = (ZONE[a.item.zone] || {}).label || "";
      var meta = r.score != null ? r.score + (r.total ? "/" + r.total : "") : "Tiếp tục";
      if (r.band != null) meta += " · Band " + r.band;
      return '<a class="home-dashboard__row" href="' + fileHref(a.item, p) + '">' +
        '<span class="home-dashboard__row-zone">' + esc(zone) + "</span>" +
        '<span class="home-dashboard__row-title">' + esc(displayTitle(a.item)) + "</span>" +
        '<span class="home-dashboard__row-meta">' + esc(meta) + " ›</span></a>";
    }).join("");

    return '<section class="home-dashboard reveal" aria-label="chuẩn bị cho kỳ thibảng điều khiển">' +
      '<div class="home-dashboard__inner">' +
        '<div class="home-dashboard__top">' +
          '<div><span class="home-dashboard__eyebrow">YOUR COCKPIT</span>' +
          "<h2>Tiếp tụcchuẩn bị cho kỳ thi</h2>" +
          "<p>biến thể củalần trướcdừng lạikhu vựcbắt và giữhọc</p></div>" +
          '<div class="home-dashboard__metrics">' +
            '<div class="home-dashboard__metric"><b>' + counts.total + '</b><span>đã làm</span></div>' +
            '<div class="home-dashboard__metric"><b>' + counts.mock + '</b><span>Thi thử</span></div>' +
            '<div class="home-dashboard__metric"><b>' + counts.study + '</b><span>học</span></div>' +
          "</div></div>" +
        '<div class="home-dashboard__list">' + rows + "</div>" +
        '<a class="home-dashboard__all" href="' + p + 'results.html">XemTất cảKết quả →</a>' +
      "</div></section>";
  }

  function compactItemRowHTML(item, prefix) {
    var done = results()[item.id];
    var subj = SUBJECT[item.subject] || { label: "Khác" };
    return '<a class="catalog-row' + (done ? " is-done" : "") + '" href="' + fileHref(item, prefix) + '">' +
      '<span class="catalog-row__badge badge badge--' + esc(item.subject) + '">' + esc(subj.label) + "</span>" +
      '<span class="catalog-row__title">' + esc(displayTitle(item)) + "</span>" +
      (done ? '<span class="catalog-row__status">Đã hoàn thành</span>' : '<span class="catalog-row__go">đi vào ›</span>') +
      "</a>";
  }

  function searchResultsHTML(items, prefix) {
    if (!items.length) {
      return '<div class="soon-box">không cótìm thấyGhép nốiNội dung,thử thửKháctừ khóa.</div>';
    }
    var bySubject = {};
    items.forEach(function (it) {
      (bySubject[it.subject] = bySubject[it.subject] || []).push(it);
    });
    return Object.keys(bySubject).sort().map(function (subj) {
      var label = (SUBJECT[subj] || {}).label || subj;
      var its = bySubject[subj].slice().sort(function (a, b) {
        if (isVocabListSubject(subj)) return vocabListNo(a) - vocabListNo(b);
        return String(a.title).localeCompare(String(b.title), "zh-Hans-CN", { numeric: true, sensitivity: "base" });
      });
      var body = its.length > 8 && isVocabListSubject(subj)
        ? '<div class="catalog-rows">' + its.map(function (it) { return compactItemRowHTML(it, prefix); }).join("") + "</div>"
        : '<div class="exam-grid exam-grid--compact">' + its.map(function (it) { return cardHTML(it, prefix); }).join("") + "</div>";
      return '<div class="catalog-section">' +
        '<div class="catalog-section__head"><h3>' + esc(label) + '</h3><span class="cnt">' + its.length + " lượng từ cho quà tặng</span></div>" +
        body + "</div>";
    }).join("");
  }

  // Count manifest items per subject (within an optional zone).
  function countsBySubject(items, zone) {
    var m = {};
    (items || []).forEach(function (it) {
      if (zone && it.zone !== zone) return;
      m[it.subject] = (m[it.subject] || 0) + 1;
    });
    return m;
  }

  function resultsBandTimelineHTML(rows) {
    var pts = (rows || []).filter(function (r) { return r.band != null; }).slice(0, 10);
    if (!pts.length) return "";
    pts = pts.slice().reverse();
    var maxBand = 9;
    var bars = pts.map(function (r, i) {
      var h = Math.max(12, Math.round((Number(r.band) / maxBand) * 100));
      var d = r.date ? new Date(r.date) : null;
      var dateLabel = d && !isNaN(d.getTime())
        ? (d.getMonth() + 1) + "/" + d.getDate()
        : "";
      var isLatest = i === pts.length - 1;
      return '<div class="band-timeline__item' + (isLatest ? " is-latest" : "") +
        '" style="--h:' + h + '%;--i:' + i + '">' +
        '<div class="band-timeline__bar-wrap"><span class="band-timeline__bar"></span></div>' +
        '<span class="band-timeline__val">' + esc(String(r.band)) + '</span>' +
        (dateLabel ? '<span class="band-timeline__date">' + esc(dateLabel) + '</span>' : "") +
        "</div>";
    }).join("");
    var latest = pts[pts.length - 1].band;
    return '<section class="band-timeline results-panel reveal" aria-label="Band quỹ đạo">' +
      '<div class="band-timeline__head">' +
        '<span class="band-timeline__eyebrow">BAND TRAJECTORY</span>' +
        "<h2>Band quỹ đạo</h2>" +
        "<p>gần đây " + pts.length + " tiếp theo có Band Luyện tập · mới nhất Band " + esc(String(latest)) + "</p>" +
      "</div>" +
      '<div class="band-timeline__chart">' + bars + "</div>" +
      "</section>";
  }

  // HTML chăn cũphát hànhhọ rơi biến thể cũ của,sắp xếphàng rào vẫnbù đắptuyệt mậtche đậy cuộn lạichip máy tính
  function ensureSecretCatChips() {
    var host = document.getElementById("exercise-cats");
    if (!host) return;
    [["rsecret", "Đọctuyệt mậtche đậy cuộn lại"], ["lsecret", "Nghetuyệt mậtche đậy cuộn lại"]].forEach(function (pair) {
      if (host.querySelector('[data-ex-cat="' + pair[0] + '"]')) return;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip";
      btn.setAttribute("data-ex-cat", pair[0]);
      btn.textContent = pair[1];
      host.appendChild(btn);
    });
  }
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", ensureSecretCatChips);
    } else {
      ensureSecretCatChips();
    }
  }

  return {
    CONTENT_VER: CONTENT_VER,
    ensureSecretCatChips: ensureSecretCatChips,
    ZONES: ZONES, ZONE: ZONE, ZONE_SUBJECTS: ZONE_SUBJECTS, SUBJECT: SUBJECT,
    NAV: NAV, navOf: navOf, TOEFL_READING: TOEFL_READING, TOEFL_LISTENING: TOEFL_LISTENING, TOEFL_WRITING: TOEFL_WRITING, TOEFL_SPEAKING: TOEFL_SPEAKING, TOEFL_FULL: TOEFL_FULL,
    esc: esc, results: results, load: load, subjectsOf: subjectsOf,
    fileHref: fileHref, vocabLessonHref: vocabLessonHref, cardHTML: cardHTML, countsBySubject: countsBySubject,
    isCambridge: isCambridge, isReadingExam: isReadingExam, camVolume: camVolume, camTestNo: camTestNo, camVolumes: camVolumes,
    skillGlyph: skillGlyph,
    camVolumeCardHTML: camVolumeCardHTML, camVolumeProgress: camVolumeProgress,
    JINGTING_OPEN: JINGTING_OPEN,
    cambridgeCatalogHTML: cambridgeCatalogHTML, jingtingCatalogHTML: jingtingCatalogHTML,
    jingtingVolumes: jingtingVolumes,
    searchItems: searchItems,
    recentActivity: recentActivity, continueStripHTML: continueStripHTML,
    journeyStats: journeyStats, homeIeltsHTML: homeIeltsHTML, homeJourneyHTML: homeJourneyHTML, homeDashboardHTML: homeDashboardHTML,
    resultsSummaryHTML: resultsSummaryHTML,
    resultsBandTimelineHTML: resultsBandTimelineHTML,
    searchResultsHTML: searchResultsHTML, compactItemRowHTML: compactItemRowHTML,
    VOCAB_BOOKS: VOCAB_BOOKS, isVocabListSubject: isVocabListSubject, isVocabSpecial: isVocabSpecial,
    needsVocabBridge: needsVocabBridge,
    vocabListNo: vocabListNo, vocabDisplayTitle: vocabDisplayTitle,     displayTitle: displayTitle,
    parsePartId: parsePartId, parseGroupId: parseGroupId,
    isExplainId: isExplainId, baseExerciseId: baseExerciseId,
    practiceExerciseIds: practiceExerciseIds, isExplainOnlyAssignment: isExplainOnlyAssignment,
    makePartItem: makePartItem, makeGroupItem: makeGroupItem, resolveItem: resolveItem,
    cambridgeCdtQs: cambridgeCdtQs,
    expandAssignableParts: expandAssignableParts, partSearchText: partSearchText,
    secretTopicLine: secretTopicLine, secretPaperTopics: secretPaperTopics,
    secretSearchText: secretSearchText, secretPartPair: secretPartPair,
    loadListeningTaxonomy: loadListeningTaxonomy,
    loadReadingTaxonomy: loadReadingTaxonomy,
    drillKindLabel: drillKindLabel,
    vocabTopic: vocabTopic,
    vocabBookStats: vocabBookStats, vocabProgress: vocabProgress,
    vocabListRanges: vocabListRanges, vocabBooksForZone: vocabBooksForZone, vocabBookCardHTML: vocabBookCardHTML,
    vocabBookOfSubject: vocabBookOfSubject,
    wrongWords: wrongWords, wrongWordCount: wrongWordCount, mergeWrongWords: mergeWrongWords,
    removeWrongWord: removeWrongWord, clearWrongWords: clearWrongWords, wrongWordsStripHTML: wrongWordsStripHTML,
    savedWords: savedWords, savedWordCount: savedWordCount, addSavedWord: addSavedWord,
    removeSavedWord: removeSavedWord, clearSavedWords: clearSavedWords, savedWordsStripHTML: savedWordsStripHTML
  };
})();
