/**
 * Truyện Ngắn Học Thuật Tương Tác & Đối Thoại Nhập Vai Nhân Vật (src/stories-roleplay.js)
 * Lấy cảm hứng từ Duolingo Stories & Video-Call Roleplay, thiết kế chuyên biệt cho
 * bối cảnh IELTS Listening Section 3, Academic Reading và IELTS Speaking Part 1–3.
 */

export const CAST_CHARACTERS = Object.freeze({
  linh: Object.freeze({
    id: "linh",
    nameVi: "Cô Linh",
    roleVi: "Giám khảo Học thuật IELTS",
    personalityVi: "Điềm tĩnh, sắc sảo, luôn phân tích rành mạch từng tiêu chí Band 8.5+.",
    accentColor: "#6d28d9",
    badge: "GK",
  }),
  hung: Object.freeze({
    id: "hung",
    nameVi: "Thầy Hùng",
    roleVi: "Cố vấn Thư viện & Đọc sâu",
    personalityVi: "Ấm áp, dí dỏm, chuyên giải mã từ vựng khó và bẫy ngụy biện học thuật.",
    accentColor: "#b45309",
    badge: "CV",
  }),
  mai: Object.freeze({
    id: "mai",
    nameVi: "Bạn Mai",
    roleVi: "Bạn đồng hành Nghiên cứu",
    personalityVi: "Tràn đầy năng lượng, thực hành thảo luận Section 3 và giữ lửa Chuỗi Bạn Bè.",
    accentColor: "#be185d",
    badge: "BH",
  }),
  sida: Object.freeze({
    id: "sida",
    nameVi: "Sida",
    roleVi: "Linh vật Thông thái YYSD",
    personalityVi: "Nhắc ôn từ HLR đúng thời điểm vàng và ăn mừng mỗi lần bạn thăng hạng.",
    accentColor: "#15803d",
    badge: "SD",
  }),
});

export const INTERACTIVE_STORIES = Object.freeze([
  Object.freeze({
    id: "story-dissertation-pivot",
    titleVi: "Bước Ngoặt Đề Tài Luận Văn",
    subtitleVi: "Tình huống IELTS Listening Section 3 — Thảo luận với giảng viên hướng dẫn",
    cefr: "B2",
    targetBand: 6.5,
    xpReward: 25,
    glossary: Object.freeze({
      "sample size": "cỡ mẫu khảo sát",
      skewed: "bị lệch (phân phối dữ liệu)",
      longitudinal: "nghiên cứu theo chiều dọc (dài hạn)",
      feasible: "khả thi trong giới hạn thời gian/nguồn lực",
    }),
    lines: Object.freeze([
      {
        speaker: "mai",
        en: "Dr Hung, I collected forty questionnaires on commuter cycling, yet the results look noticeably skewed.",
        vi: "Thầy Hùng ơi, em đã thu được 40 phiếu khảo sát về việc đi xe đạp đi làm, nhưng kết quả có vẻ bị lệch rõ rệt.",
      },
      {
        speaker: "hung",
        en: "Let me guess — you distributed the survey solely outside the university gymnasium?",
        vi: "Để thầy đoán nhé — em chỉ phát phiếu khảo sát ngay trước cửa nhà thi đấu của trường thôi đúng không?",
      },
      {
        speaker: "mai",
        en: "Guilty as charged! Should I switch to a two-year longitudinal study instead?",
        vi: "Đúng hệt ạ! Hay là em chuyển hẳn sang nghiên cứu theo dõi dọc trong hai năm ạ?",
      },
      {
        speaker: "hung",
        en: "With only six weeks left, that is hardly feasible. Broaden your sample size across three subway stations instead.",
        vi: "Chỉ còn 6 tuần thì phương án đó khó khả thi. Thay vào đó, hãy mở rộng cỡ mẫu tại ba nhà ga tàu điện ngầm.",
      },
    ]),
    checkpoints: Object.freeze([
      {
        id: "st1_q1",
        questionVi: "Vì sao dữ liệu khảo sát ban đầu của Mai bị lệch (skewed)?",
        options: [
          "Vì Mai chỉ khảo sát nhóm người ở trước nhà thi đấu đại học.",
          "Vì Mai phát phiếu tại quá nhiều nhà ga tàu điện ngầm.",
          "Vì nghiên cứu kéo dài tới hai năm.",
        ],
        answer: "Vì Mai chỉ khảo sát nhóm người ở trước nhà thi đấu đại học.",
        explainVi: "Trạng từ 'solely' (chỉ duy nhất) chỉ ra lỗi chọn mẫu thiên lệch (sampling bias) — chủ đề kinh điển của IELTS Listening Section 3.",
      },
      {
        id: "st1_q2",
        questionVi: "Giải pháp thực tế nào thầy Hùng khuyên Mai thực hiện trong 6 tuần còn lại?",
        options: [
          "Mở rộng cỡ mẫu khảo sát ra ba trạm tàu điện ngầm.",
          "Chuyển sang nghiên cứu dọc kéo dài hai năm.",
          "Hủy bỏ đề tài về giao thông đô thị.",
        ],
        answer: "Mở rộng cỡ mẫu khảo sát ra ba trạm tàu điện ngầm.",
        explainVi: "'Hardly feasible' mang nghĩa phủ định ('hầu như không khả thi'); giải pháp được chốt nằm sau từ 'instead'.",
      },
    ]),
  }),
  Object.freeze({
    id: "story-rooftop-beehives",
    titleVi: "Những Tổ Ong Trên Mái Nhà Thư Viện",
    subtitleVi: "Tình huống Đọc & Nghe học thuật — Sinh thái đô thị & Sáng kiến xanh",
    cefr: "C1",
    targetBand: 7.5,
    xpReward: 30,
    glossary: Object.freeze({
      pollinators: "sinh vật thụ phấn (ong, bướm)",
      monoculture: "độc canh một loại cây trồng",
      pesticide: "thuốc trừ sâu hóa học",
      thrive: "sinh trưởng mạnh mẽ, phát triển thịnh vượng",
    }),
    lines: Object.freeze([
      {
        speaker: "linh",
        en: "Surprisingly, honeybees installed on our library roof thrive better than colonies near rural farmland.",
        vi: "Đáng ngạc nhiên là đàn ong mật đặt trên mái thư viện lại phát triển khỏe mạnh hơn cả các đàn ong gần vùng đất nông nghiệp.",
      },
      {
        speaker: "mai",
        en: "That sounds counter-intuitive. Surely the countryside offers far more wildflowers?",
        vi: "Nghe thật ngược trực giác! Chẳng phải vùng nông thôn có nhiều hoa dại hơn hẳn sao cô?",
      },
      {
        speaker: "linh",
        en: "Intensive monoculture blooms for just a few weeks and relies heavily on pesticide sprays.",
        vi: "Canh tác độc canh thâm canh chỉ nở hoa trong vài tuần ngắn ngủi và phụ thuộc nhiều vào thuốc trừ sâu.",
      },
      {
        speaker: "hung",
        en: "Meanwhile, botanical gardens and balcony planters keep urban pollinators nourished from March through October.",
        vi: "Trong khi đó, vườn bách thảo và cây trồng ban công nuôi dưỡng đàn ong đô thị liên tục từ tháng Ba đến tháng Mười.",
      },
    ]),
    checkpoints: Object.freeze([
      {
        id: "st2_q1",
        questionVi: "Tính từ 'counter-intuitive' trong lời của Mai có nghĩa sát nhất là gì?",
        options: [
          "Trái ngược với suy đoán thông thường.",
          "Hoàn toàn hiển nhiên, không cần chứng minh.",
          "Tốn kém quá nhiều ngân sách bảo trì.",
        ],
        answer: "Trái ngược với suy đoán thông thường.",
        explainVi: "'Counter-intuitive' là từ vựng Band 8.0 cực hay để phản hồi câu hỏi bất ngờ trong IELTS Speaking Part 3.",
      },
      {
        id: "st2_q2",
        questionVi: "Hai lợi thế giúp đàn ong đô thị phát triển tốt hơn vùng độc canh nông thôn là gì?",
        options: [
          "Ít thuốc trừ sâu hơn và nguồn hoa đa dạng kéo dài từ tháng 3 đến tháng 10.",
          "Nhiệt độ mái nhà lạnh hơn và không có vườn bách thảo.",
          "Chỉ có một loại hoa duy nhất nở quanh năm.",
        ],
        answer: "Ít thuốc trừ sâu hơn và nguồn hoa đa dạng kéo dài từ tháng 3 đến tháng 10.",
        explainVi: "Kết hợp thông tin từ hai lượt lời liên tiếp: tránh 'pesticide sprays' + nguồn phấn hoa kéo dài 'from March through October'.",
      },
    ]),
  }),
  Object.freeze({
    id: "story-silent-concert",
    titleVi: "Thí Nghiệm Âm Học Trong Bảo Tàng Cổ",
    subtitleVi: "Tình huống Kiến trúc & Di sản — Chủ đề ưa thích của Cambridge Reading Passage 2",
    cefr: "C1+",
    targetBand: 8.0,
    xpReward: 30,
    glossary: Object.freeze({
      reverberation: "độ vang âm trong không gian kín",
      acoustic: "thuộc về âm học",
      retrofit: "cải tạo, lắp bổ sung công nghệ mới cho công trình cũ",
      unobtrusive: "kín đáo, không phá vỡ mỹ quan chung",
    }),
    lines: Object.freeze([
      {
        speaker: "hung",
        en: "Visitors adore the marble dome, yet the six-second reverberation renders guided lectures almost unintelligible.",
        vi: "Du khách rất mê mái vòm đá cẩm thạch, nhưng độ vang kéo dài sáu giây khiến các bài thuyết minh gần như không thể nghe rõ.",
      },
      {
        speaker: "linh",
        en: "Heritage regulations prohibit altering the original stonework, so any acoustic retrofit must remain completely unobtrusive.",
        vi: "Quy định bảo tồn di sản cấm thay đổi kết cấu đá nguyên bản, nên mọi giải pháp cải tạo âm học phải hoàn toàn kín đáo.",
      },
      {
        speaker: "mai",
        en: "What about micro-perforated timber panels disguised as exhibition benches? They absorb mid-frequency echoes effortlessly.",
        vi: "Thế còn các tấm gỗ đục lỗ siêu nhỏ ngụy trang thành ghế nghỉ triển lãm thì sao ạ? Chúng hấp thụ tiếng vọng tần số trung rất hiệu quả.",
      },
    ]),
    checkpoints: Object.freeze([
      {
        id: "st3_q1",
        questionVi: "Ràng buộc pháp lý nào đặt ra cho nhóm cải tạo bảo tàng?",
        options: [
          "Không được làm thay đổi kết cấu đá nguyên bản và giải pháp phải kín đáo.",
          "Phải thay toàn bộ mái vòm cẩm thạch bằng gỗ.",
          "Cấm tổ chức mọi buổi thuyết minh có hướng dẫn viên.",
        ],
        answer: "Không được làm thay đổi kết cấu đá nguyên bản và giải pháp phải kín đáo.",
        explainVi: "'Prohibit altering' = cấm thay đổi; 'unobtrusive' = tinh tế, không gây chướng mắt.",
      },
    ]),
  }),
]);

export const ROLEPLAY_SCENARIOS = Object.freeze([
  Object.freeze({
    id: "rp-speaking-part3-ai",
    character: "linh",
    titleVi: "Đối thoại cùng Cô Linh: Trí Tuệ Nhân Tạo & Tư Duy Độc Lập",
    partLabelVi: "IELTS Speaking Part 3 · Thảo luận học thuật",
    targetBand: 7.5,
    xpReward: 30,
    openingEn:
      "Welcome back. Let's explore technology in education: to what extent do you think AI study tools strengthen or weaken students' independent thinking?",
    openingVi:
      "Chào mừng bạn quay lại. Hãy bàn về công nghệ trong giáo dục: theo bạn, công cụ học tập AI củng cố hay làm suy yếu tư duy độc lập của người học?",
    suggestedKeywords: [
      "double-edged sword",
      "diagnostic feedback",
      "critical thinking",
      "over-reliance",
      "autonomous",
      "whereas",
    ],
    modelUpgradeEn:
      "I tend to view AI tutoring as a double-edged sword. When used for immediate diagnostic feedback, it fosters autonomous learning; however, uncritical over-reliance on generated essays can gradually erode students' analytical depth.",
  }),
  Object.freeze({
    id: "rp-speaking-part2-city",
    character: "hung",
    titleVi: "Đối thoại cùng Thầy Hùng: Không Gian Công Cộng Đáng Sống",
    partLabelVi: "IELTS Speaking Part 2 & 3 · Đô thị & Môi trường",
    targetBand: 7.0,
    xpReward: 25,
    openingEn:
      "Could you describe a public park or waterfront in Vietnam that positively transforms daily life for local residents, and explain why it matters?",
    openingVi:
      "Bạn hãy mô tả một công viên hoặc không gian ven sông tại Việt Nam giúp nâng cao chất lượng sống hàng ngày của người dân và giải thích vì sao nơi đó quan trọng?",
    suggestedKeywords: [
      "pedestrian",
      "unwind",
      "social cohesion",
      "biodiversity",
      "accessible",
      "although",
    ],
    modelUpgradeEn:
      "Although central districts are increasingly congested, the pedestrian promenade offers an accessible sanctuary where residents of all generations unwind, exercise at dawn, and strengthen neighbourhood social cohesion.",
  }),
  Object.freeze({
    id: "rp-office-hours",
    character: "mai",
    titleVi: "Thảo luận cùng Bạn Mai: Thống Nhất Đề Cương Thuyết Trình Nhóm",
    partLabelVi: "Giao tiếp Học thuật Đại học · Phân tích & Thương lượng",
    targetBand: 7.5,
    xpReward: 25,
    openingEn:
      "Our seminar presentation on renewable microgrids is only ten minutes long. How should we prioritise the case studies without overwhelming the audience?",
    openingVi:
      "Bài thuyết trình hội thảo về lưới điện vi mô tái tạo của nhóm chỉ dài 10 phút. Chúng ta nên ưu tiên các nghiên cứu tình huống thế nào để không làm khán giả quá tải?",
    suggestedKeywords: [
      "prioritise",
      "empirical",
      "concise",
      "viable",
      "in contrast",
      "sustainable",
    ],
    modelUpgradeEn:
      "Rather than listing five superficial examples, we should prioritise two contrasting empirical case studies, keeping our data visuals concise while highlighting why community solar microgrids prove economically viable and sustainable.",
  }),
]);

const DISCOURSE_MARKERS = [
  "however", "whereas", "while", "although", "furthermore", "moreover",
  "consequently", "therefore", "for instance", "for example", "in contrast",
  "nevertheless", "rather than", "on the other hand", "because", "since",
];

const COMPLEX_GRAMMAR_PATTERNS = [
  /\b(although|though|even though|whereas|while|unless|provided that)\b/i,
  /\b(which|who|whose|whereby|that)\b/i,
  /\b(would|could|might|tend to|appear to|likely to)\b/i,
  /\b(having|being|compared with|rather than)\b/i,
];

const VIETNAMESE_TRANSFER_ALERTS = [
  {
    pattern: /\balthough\b[^.!?]*\bbut\b/i,
    tipVi: "Phát hiện cấu trúc 'Although ... but ...': hãy bỏ 'but' để câu phức chuẩn ngữ pháp Band 7+.",
  },
  {
    pattern: /\bbecause\b[^.!?]*\bso\b/i,
    tipVi: "Phát hiện cấu trúc 'Because ... so ...': chỉ giữ một trong hai liên từ ('Because' hoặc 'so').",
  },
  {
    pattern: /\baccording to me\b/i,
    tipVi: "Thay 'according to me' bằng 'In my view' hoặc 'From my perspective'.",
  },
  {
    pattern: /\b(informations|knowledges|researches|evidences|advices)\b/i,
    tipVi: "Danh từ không đếm được (information, knowledge, research, evidence, advice) không thêm '-s'.",
  },
];

/**
 * Truy xuất truyện ngắn tương tác hoặc kịch bản nhập vai theo ID.
 */
export function getStoryById(id) {
  return INTERACTIVE_STORIES.find((s) => s.id === id) || null;
}

export function getRoleplayById(id) {
  return ROLEPLAY_SCENARIOS.find((r) => r.id === id) || null;
}

/**
 * Đánh giá câu trả lời tiếng Anh của học viên trong phiên Nhập vai IELTS Speaking
 * theo 4 tiêu chí chính thức của Cambridge (FC, LR, GRA, P) dựa trên nghiên cứu của
 * Iwashita et al. (2008), Skehan (2009) và Seedhouse et al. (2014).
 */
export function evaluateSpeakingResponse(scenario, responseText) {
  const clean = String(responseText || "").trim();
  const words = clean.match(/[A-Za-z][A-Za-z'-]*/g) || [];
  const wordCount = words.length;

  if (wordCount < 5) {
    return {
      valid: false,
      wordCount,
      overallBand: 0,
      messageVi: "Vui lòng nhập hoặc nói ít nhất 5 từ tiếng Anh để Cô Linh/Thầy Hùng phân tích chi tiết 4 tiêu chí.",
      criteria: null,
      matchedKeywords: [],
      transferTipsVi: [],
      modelUpgradeEn: scenario.modelUpgradeEn,
    };
  }

  const lowerWords = words.map((w) => w.toLowerCase());
  const uniqueRatio = new Set(lowerWords).size / wordCount;
  const sophisticatedWords = lowerWords.filter((w) => w.length >= 8);
  const lowerText = clean.toLowerCase();

  const usedMarkers = DISCOURSE_MARKERS.filter((m) => lowerText.includes(m));
  const matchedKeywords = scenario.suggestedKeywords.filter((kw) =>
    lowerText.includes(kw.toLowerCase()),
  );
  const complexHits = COMPLEX_GRAMMAR_PATTERNS.filter((rx) => rx.test(clean)).length;
  const transferTipsVi = VIETNAMESE_TRANSFER_ALERTS.filter((a) => a.pattern.test(clean)).map(
    (a) => a.tipVi,
  );

  // 1. Fluency & Coherence (độ dài phát triển ý + từ nối mạch lạc)
  const fcRaw = Math.min(9, 4.5 + Math.min(2.5, wordCount / 18) + Math.min(1.5, usedMarkers.length * 0.75));
  // 2. Lexical Resource (đa dạng từ vựng + từ học thuật dài + từ khóa chủ đề)
  const lrRaw = Math.min(
    9,
    4.5 +
      (uniqueRatio >= 0.7 ? 1.0 : 0.5) +
      Math.min(1.5, sophisticatedWords.length * 0.4) +
      Math.min(1.5, matchedKeywords.length * 0.6),
  );
  // 3. Grammatical Range & Accuracy (mệnh đề phức/rào đón trừ lỗi chuyển di)
  const graRaw = Math.max(
    4.5,
    Math.min(9, 5.0 + Math.min(3.0, complexHits * 0.85) - transferTipsVi.length * 0.75),
  );
  // 4. Pronunciation & Prosody readiness (nhịp ngắt cụm & nhắc phụ âm cuối cho người Việt)
  const pRaw = Math.min(8.5, 5.5 + (wordCount >= 20 ? 1.0 : 0.5) + (usedMarkers.length >= 1 ? 1.0 : 0));

  const roundHalf = (n) => Math.round(n * 2) / 2;
  const fc = roundHalf(fcRaw);
  const lr = roundHalf(lrRaw);
  const gra = roundHalf(graRaw);
  const pron = roundHalf(pRaw);
  const overallBand = roundHalf((fc + lr + gra + pron) / 4);

  return {
    valid: true,
    wordCount,
    overallBand,
    messageVi:
      overallBand >= 7.5
        ? "Lập luận sắc sảo, cấu trúc linh hoạt và vốn từ học thuật rất ấn tượng!"
        : overallBand >= 6.5
          ? "Phát triển ý rõ ràng! Bổ sung thêm 1–2 cụm collocation học thuật và mệnh đề nhượng bộ sẽ đưa bạn lên Band 7.5+."
          : "Khởi đầu tốt! Hãy kéo dài câu trả lời lên 30–45 từ kèm liên từ đối lập (whereas, although) và ví dụ cụ thể.",
    criteria: {
      fluencyCoherence: {
        band: fc,
        labelVi: "Độ trôi chảy & Mạch lạc (FC)",
        noteVi:
          usedMarkers.length > 0
            ? `Đã sử dụng hiệu quả từ nối diễn ngôn: ${usedMarkers.join(", ")}.`
            : "Hãy thêm từ đánh dấu diễn ngôn (however, whereas, for instance) để liên kết luận điểm.",
      },
      lexicalResource: {
        band: lr,
        labelVi: "Vốn từ vựng Học thuật (LR)",
        noteVi: `Độ đa dạng từ đạt ${Math.round(uniqueRatio * 100)}%, gồm ${sophisticatedWords.length} từ học thuật đa âm tiết.`,
      },
      grammaticalRange: {
        band: gra,
        labelVi: "Độ rộng & Chính xác Ngữ pháp (GRA)",
        noteVi: `Ghi nhận ${complexHits} cấu trúc phức / rào đón học thuật (Skehan, 2009).`,
      },
      pronunciation: {
        band: pron,
        labelVi: "Ngữ điệu & Phát âm Khuyến nghị (P)",
        noteVi:
          "Lưu ý nhấn trọng âm từ học thuật, ngắt nhịp trước liên từ và bật rõ âm cuối /s/, /z/, /t/, /d/.",
      },
    },
    matchedKeywords,
    transferTipsVi,
    modelUpgradeEn: scenario.modelUpgradeEn,
  };
}
