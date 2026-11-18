/**
 * Lộ trình Học tập IELTS Tuyến tính 8 Chặng & Bộ Giải thích Lỗi sai Miễn phí
 * (src/ielts-curriculum.js)
 *
 * Kết hợp cấu trúc cây kỹ năng tuyến tính ngắn gọn của Duolingo (CEFR A2 -> C2 / Band 4.5 -> 8.5+)
 * với 6 dạng bài tập tương tác IELTS thực chiến:
 *  - mcq: Trắc nghiệm học thuật 4 phương án
 *  - word_bank: Ghép thẻ từ viết thường (luôn xáo trộn khác thứ tự đáp án, không lộ hoa đầu câu)
 *  - cloze: Điền từ vựng/chính tả IELTS (chấp nhận cả Anh-Anh và Anh-Mỹ)
 *  - tfng: True / False / Not Given trên trích đoạn học thuật chuẩn Cambridge
 *  - pairs: Nối cặp diễn đạt tương đương (paraphrase) & collocation học thuật
 *  - sus: Câu Bất Ngờ Ngữ Nghĩa (Semantically Unpredictable Sentences — De Loof et al., 2018;
 *         Benoit et al., 1996) kích hoạt sai số dự đoán phần thưởng giúp nhớ sâu cấu trúc ngữ pháp
 *  - error_fix: Phát hiện & sửa lỗi điển hình của thí sinh IELTS Việt Nam
 */

import { getCitationById } from "./scholar-citations.js";

export const SKILL_PATH_UNITS = Object.freeze([
  {
    id: "unit-1-listening-traps",
    order: 1,
    cefr: "A2+",
    targetBand: 5.0,
    skill: "listening",
    titleVi: "Chặng 1: Nghe Section 1–2 & Bẫy Tự Sửa Thông Tin",
    subtitleVi: "Nhận diện tín hiệu đính chính (actually, sorry, rather) và chính tả chuẩn Anh-Anh.",
    guidebookVi:
      "Trong IELTS Listening Section 1–2, người nói thường nêu một con số hoặc ngày giờ rồi lập tức tự đính chính sau các từ khóa như 'actually', 'wait', 'on second thoughts'. Đừng vội chốt phương án đầu tiên bạn nghe thấy (Field, 2008).",
    citationId: "field2008listening",
    xpReward: 20,
    vocabularySeeds: [
      { id: "v_deposit", term: "refundable deposit", meaningVi: "tiền đặt cọc có hoàn lại", skill: "listening", difficulty: 0.35, exampleEn: "Tenants must pay a refundable deposit before collecting the keys." },
      { id: "v_itinerary", term: "itinerary", meaningVi: "lịch trình chuyến đi chi tiết", skill: "listening", difficulty: 0.45, exampleEn: "The revised itinerary excludes the museum visit on Tuesday." },
    ],
    exercises: [
      {
        id: "u1_e1",
        type: "mcq",
        difficulty: 1,
        promptVi: "Nghe đoạn hội thoại đặt phòng sau và chọn khoản tiền đặt cọc cuối cùng khách phải trả:",
        stimulusEn:
          "Receptionist: The standard studio requires a £250 deposit — oh, pardon me, since you booked the student package, that drops to £180, though the £40 cleaning fee still applies separately.",
        options: ["£250", "£180", "£220", "£40"],
        answer: "£180",
        ruleVi: "Tín hiệu tự đính chính 'oh, pardon me... that drops to £180' bác bỏ con số gây nhiễu £250; phí dọn dẹp £40 được tính riêng (separately), không thuộc tiền đặt cọc.",
        trapVi: "Bẫy cộng gộp £180 + £40 = £220 hoặc ghi vội số đầu tiên £250.",
        citationId: "field2008listening",
      },
      {
        id: "u1_e2",
        type: "cloze",
        difficulty: 1,
        promptVi: "Điền danh từ chỉ 'chỗ ở / nơi lưu trú' thường bị thí sinh viết thiếu chữ c hoặc m trong Section 1:",
        stimulusEn: "First-year international students are guaranteed on-campus ________ if they apply before June.",
        acceptedAnswers: ["accommodation"],
        hintVi: "Gồm 13 chữ cái: hai chữ 'c' và hai chữ 'm' (a-c-c-o-m-m-o-d-a-t-i-o-n).",
        ruleVi: "Từ 'accommodation' là từ sai chính tả hàng đầu trong IELTS Listening; luôn nhớ quy tắc nhân đôi cả 'cc' lẫn 'mm' và là danh từ không đếm được trong tiếng Anh Anh.",
        trapVi: "Viết thiếu một chữ 'm' (accomodation) sẽ mất trọn điểm câu điền từ dù nghe đúng.",
        citationId: "webb2007repetition",
      },
      {
        id: "u1_e3",
        type: "word_bank",
        difficulty: 2,
        promptVi: "Sắp xếp các thẻ từ để tạo câu thông báo thay đổi lịch trình chuẩn Section 2:",
        sourceVi: "Buổi định hướng đã được dời sang chiều thứ Năm.",
        answerTokens: ["the", "orientation", "session", "has", "been", "postponed", "until", "thursday", "afternoon"],
        distractorTokens: ["since", "cancelled"],
        ruleVi: "Cấu trúc bị động thì hiện tại hoàn thành 'has been postponed until + mốc thời gian' thường dùng để diễn đạt lại 'moved to a later time' trong đề Cambridge.",
        trapVi: "Phân biệt 'postponed' (hoãn sang lúc khác) với 'cancelled' (hủy hẳn) và dùng giới từ 'until' thay vì 'since'.",
        citationId: "vandergrift2010metacognitive",
      },
      {
        id: "u1_e4",
        type: "pairs",
        difficulty: 2,
        promptVi: "Nối cụm từ trong câu hỏi IELTS Listening với cách diễn đạt tương đương trong băng nghe:",
        pairs: [
          { left: "free of charge", right: "at no extra cost" },
          { left: "compulsory", right: "mandatory for all" },
          { left: "twice a month", right: "every fortnight" },
          { left: "book in advance", right: "reserve ahead of time" },
        ],
        ruleVi: "Đề IELTS Listening hiếm khi lặp nguyên văn từ trong đề; nhận diện nhanh 'fortnight = hai tuần' và 'complimentary / at no extra cost = miễn phí' quyết định điểm số.",
        trapVi: "Nhầm 'fortnight' (14 ngày) với 'four nights' (4 đêm).",
        citationId: "field2013cognitive",
      },
    ],
  },
  {
    id: "unit-2-reading-tfng",
    order: 2,
    cefr: "B1+",
    targetBand: 6.0,
    skill: "reading",
    titleVi: "Chặng 2: Đọc Học Thuật — Giải Mã True / False / Not Given",
    subtitleVi: "Phân biệt sắc bén giữa thông tin mâu thuẫn (FALSE) và thông tin không đủ cơ sở (NOT GIVEN).",
    guidebookVi:
      "Nghiên cứu theo dõi ánh mắt của Bax (2013) chỉ ra thí sinh Band 7.5+ khoanh vùng các từ giới hạn mức độ (only, all, primarily, rarely) trước khi đối chiếu với mệnh đề gốc. Chọn FALSE khi bài đọc khẳng định điều trái ngược; chọn NOT GIVEN khi bài đọc không cung cấp dữ kiện kiểm chứng.",
    citationId: "bax2013eyetracking",
    xpReward: 25,
    vocabularySeeds: [
      { id: "v_scarce", term: "scarce", meaningVi: "khan hiếm, thiếu hụt", skill: "reading", difficulty: 0.4, exampleEn: "Freshwater resources remain scarce across arid coastal regions." },
      { id: "v_corroborate", term: "corroborate", meaningVi: "chứng thực, củng cố bằng bằng chứng", skill: "reading", difficulty: 0.65, exampleEn: "Ice-core samples corroborate earlier climate simulations." },
    ],
    exercises: [
      {
        id: "u2_e1",
        type: "tfng",
        difficulty: 2,
        promptVi: "Đọc đoạn trích học thuật và xác định nhận định bên dưới là TRUE, FALSE hay NOT GIVEN:",
        stimulusEn:
          "Passage: While vertical farming substantially reduces freshwater consumption compared with conventional agriculture, its heavy reliance on artificial LED lighting continues to limit profitability for staple grain crops.\nStatement: Vertical farming is currently the most profitable method for growing staple grains.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: "FALSE",
        ruleVi: "Đoạn văn nêu rõ sự phụ thuộc vào đèn LED 'continues to limit profitability for staple grain crops' (tiếp tục hạn chế khả năng sinh lời đối với cây lương thực chính), trực tiếp mâu thuẫn với 'most profitable method'.",
        trapVi: "Đừng thấy các từ giống nhau ('vertical farming', 'profitability', 'staple grains') mà chọn TRUE.",
        citationId: "bax2013eyetracking",
      },
      {
        id: "u2_e2",
        type: "tfng",
        difficulty: 2,
        promptVi: "Đọc đoạn trích và xác định nhận định sau là TRUE, FALSE hay NOT GIVEN:",
        stimulusEn:
          "Passage: Archaeologists unearthed over three hundred obsidian blades at the coastal settlement, indicating extensive maritime trade networks across the Aegean during the Bronze Age.\nStatement: Local artisans preferred obsidian blades to bronze tools for domestic cooking.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: "NOT GIVEN",
        ruleVi: "Bài đọc chỉ chứng minh có mạng lưới giao thương đường biển qua lưỡi đá vỏ chai (obsidian), hoàn toàn không so sánh sự ưa thích giữa đá vỏ chai và công cụ đồng trong nấu ăn.",
        trapVi: "Lỗi suy diễn quá đà: thấy không có sự so sánh rồi vội chọn FALSE thay vì NOT GIVEN.",
        citationId: "bax2019reading",
      },
      {
        id: "u2_e3",
        type: "mcq",
        difficulty: 2,
        promptVi: "Chọn tiêu đề (Heading) khái quát chính xác nhất cho đoạn văn sau:",
        stimulusEn:
          "Early municipal tramways promised cleaner streets than horse-drawn carriages, yet the coal-fired power stations supplying their electricity merely shifted particulate pollution from city centres to working-class suburbs.",
        options: [
          "The relocation rather than elimination of urban pollution",
          "Why horse-drawn carriages outperformed electric trams",
          "Government subsidies for suburban power stations",
          "Public resistance to nineteenth-century tram fares",
        ],
        answer: "The relocation rather than elimination of urban pollution",
        ruleVi: "Động từ 'merely shifted... from city centres to working-class suburbs' được diễn đạt tương đương chính xác bằng 'relocation rather than elimination' (dịch chuyển chứ không xóa bỏ).",
        trapVi: "Tránh chọn tiêu đề chỉ lặp từ khóa phụ ('horse-drawn carriages', 'power stations') nhưng sai luận điểm trung tâm.",
        citationId: "khalifa2009reading",
      },
      {
        id: "u2_e4",
        type: "pairs",
        difficulty: 2,
        promptVi: "Nối động từ học thuật trong bài đọc IELTS với nghĩa tiếng Việt chuẩn xác:",
        pairs: [
          { left: "corroborate", right: "chứng thực bằng bằng chứng" },
          { left: "deteriorate", right: "xuống cấp, xấu đi" },
          { left: "proliferate", right: "gia tăng nhanh chóng" },
          { left: "supersede", right: "thay thế cái đã lỗi thời" },
        ],
        ruleVi: "Làm chủ nhóm động từ học thuật tần suất cao giúp đạt ngưỡng hiểu 98% từ vựng của văn bản IELTS Reading (Nation, 2006).",
        trapVi: "Dễ nhầm 'corroborate' (chứng thực) với 'collaborate' (hợp tác).",
        citationId: "nation2006howlarge",
      },
    ],
  },
  {
    id: "unit-3-awl-collocations",
    order: 3,
    cefr: "B2",
    targetBand: 6.5,
    skill: "vocabulary",
    titleVi: "Chặng 3: Từ Vựng Học Thuật (AWL) & Kết Hợp Từ (ACL)",
    subtitleVi: "Xây dựng vốn cụm từ nguyên khối dựa trên Coxhead (2000) và Ackermann & Chen (2013).",
    guidebookVi:
      "Thay vì học từ đơn lẻ dễ dẫn đến dịch từng chữ từ tiếng Việt, hãy học trọn cụm động từ + danh từ (collocation) từ danh sách ACL như 'pose a threat', 'conduct research', 'alleviate poverty' (Boers & Webb, 2018; Nguyen & Webb, 2017).",
    citationId: "coxhead2000awl",
    xpReward: 25,
    vocabularySeeds: [
      { id: "v_mitigate", term: "mitigate", meaningVi: "giảm nhẹ tác động tiêu cực", skill: "vocabulary", difficulty: 0.5, exampleEn: "Urban tree canopies help mitigate extreme summer heat." },
      { id: "v_empirical", term: "empirical evidence", meaningVi: "bằng chứng thực nghiệm", skill: "vocabulary", difficulty: 0.55, exampleEn: "Policy reforms should rest on solid empirical evidence." },
    ],
    exercises: [
      {
        id: "u3_e1",
        type: "mcq",
        difficulty: 2,
        promptVi: "Chọn động từ kết hợp tự nhiên nhất (Academic Collocation) để hoàn thành câu:",
        stimulusEn: "Prolonged drought continues to ________ a severe threat to regional food security.",
        options: ["pose", "make", "create", "give"],
        answer: "pose",
        ruleVi: "Trong danh sách Academic Collocation List (Ackermann & Chen, 2013), danh từ 'threat / challenge / risk' kết hợp chuẩn mực với động từ 'pose' (pose a severe threat to).",
        trapVi: "Dịch trực tiếp 'tạo ra mối đe dọa' thành 'make/create a threat' khiến điểm Lexical Resource dừng ở Band 5.5–6.0.",
        citationId: "ackermann2013acl",
      },
      {
        id: "u3_e2",
        type: "cloze",
        difficulty: 2,
        promptVi: "Điền động từ học thuật (bắt đầu bằng chữ 'm') mang nghĩa 'giảm nhẹ hậu quả xấu':",
        stimulusEn: "Investing in flood barriers can ________ the economic damage caused by coastal storms.",
        acceptedAnswers: ["mitigate", "minimise", "minimize"],
        hintVi: "Từ điển hình Band 7.5+: m-i-t-i-g-a-t-e (cũng chấp nhận minimise/minimize).",
        ruleVi: "Cụm 'mitigate damage / risks / emissions' thuộc nhóm từ vựng học thuật chủ lực cho cả Writing Task 2 chủ đề môi trường lẫn Reading Passage 3.",
        trapVi: "Không thêm giới từ 'down' sau 'mitigate' (dùng trực tiếp 'mitigate + tân ngữ').",
        citationId: "coxhead2000awl",
      },
      {
        id: "u3_e3",
        type: "pairs",
        difficulty: 2,
        promptVi: "Nối động từ với danh từ tạo thành Collocation chuẩn Band 7.5+:",
        pairs: [
          { left: "alleviate", right: "traffic congestion" },
          { left: "allocate", right: "public funds" },
          { left: "bridge", right: "the digital divide" },
          { left: "foster", right: "critical thinking" },
        ],
        ruleVi: "Ghi nhớ cụm nguyên khối (intact chunks) giúp tăng tốc độ diễn đạt và tránh lỗi kết hợp từ do ảnh hưởng tiếng mẹ đẻ (Nguyen & Webb, 2017).",
        trapVi: "Tránh dùng 'reduce' hoặc 'give' lặp đi lặp lại cho mọi danh từ trong bài luận.",
        citationId: "nguyen2017vietnamese",
      },
      {
        id: "u3_e4",
        type: "word_bank",
        difficulty: 2,
        promptVi: "Ghép câu học thuật sử dụng cụm danh từ 'empirical evidence':",
        sourceVi: "Bằng chứng thực nghiệm ủng hộ việc học phân tán hàng ngày.",
        answerTokens: ["empirical", "evidence", "supports", "daily", "distributed", "learning"],
        distractorTokens: ["support", "evidences"],
        ruleVi: "'Evidence' là danh từ không đếm được nên không bao giờ có '-s' và đi với động từ chia ngôi thứ ba số ít 'supports'.",
        trapVi: "Thêm '-s' vào 'evidences', 'researches', 'knowledges', 'informations' là lỗi ngữ pháp phổ biến nhất trong bài viết IELTS.",
        citationId: "gardner2014avl",
      },
    ],
  },
  {
    id: "unit-4-writing-task1",
    order: 4,
    cefr: "B2+",
    targetBand: 6.5,
    skill: "writing",
    titleVi: "Chặng 4: IELTS Writing Task 1 — Đoạn Tổng Quan & Số Liệu",
    subtitleVi: "Viết đoạn Overview đạt Band 7+ và dùng giới từ chỉ mức thay đổi chính xác tuyệt đối.",
    guidebookVi:
      "Theo tiêu chí chấm Task Achievement (Shaw & Weir, 2007), thiếu đoạn Overview rõ ràng sẽ giới hạn điểm Task 1 ở mức Band 5.0. Một đoạn Overview mạnh nêu 2–3 xu hướng tổng thể và sự tương phản nổi bật nhất mà không liệt kê con số vụn vặt.",
    citationId: "shaw2007writing",
    xpReward: 25,
    vocabularySeeds: [
      { id: "v_outstrip", term: "outstrip", meaningVi: "vượt xa về quy mô hoặc tốc độ", skill: "writing", difficulty: 0.6, exampleEn: "Solar power generation outstripped coal output by 2024." },
      { id: "v_plateau", term: "reach a plateau", meaningVi: "chững lại ở mức ổn định sau khi tăng", skill: "writing", difficulty: 0.55, exampleEn: "Enrolment figures reached a plateau at roughly 45 percent." },
    ],
    exercises: [
      {
        id: "u4_e1",
        type: "mcq",
        difficulty: 2,
        promptVi: "Tỷ lệ tái chế tăng từ 20% năm 2010 lên 55% năm 2020. Câu nào dùng giới từ chính xác?",
        stimulusEn: "Data: Recycling rate — 2010: 20% | 2020: 55% (mức chênh lệch: +35 điểm phần trăm).",
        options: [
          "The recycling rate rose by 35 percentage points to 55% in 2020.",
          "The recycling rate rose by 55% from 20% in 2020.",
          "The recycling rate increased to 35% between 2010 and 2020.",
          "There was a rise of 55 percentage points over the decade.",
        ],
        answer: "The recycling rate rose by 35 percentage points to 55% in 2020.",
        ruleVi: "Quy tắc vàng Task 1: 'rise TO + mốc đích (55%)', 'rise BY + khoảng chênh lệch (35 percentage points)', và 'a rise OF + khoảng chênh lệch'.",
        trapVi: "Nhầm lẫn giữa 'rise by' và 'rise to' làm sai lệch hoàn toàn dữ liệu biểu đồ và bị trừ nặng ở tiêu chí Task Achievement.",
        citationId: "shaw2007writing",
      },
      {
        id: "u4_e2",
        type: "word_bank",
        difficulty: 2,
        promptVi: "Ghép câu mở đầu đoạn Overview chuẩn mực cho biểu đồ đường:",
        sourceVi: "Nhìn chung, sản lượng điện mặt trời tăng đều trong khi than đá giảm mạnh.",
        answerTokens: ["overall", "solar", "output", "rose", "steadily", "whereas", "coal", "declined", "sharply"],
        distractorTokens: ["moreover", "rapid"],
        ruleVi: "Liên từ 'whereas' nối hai xu hướng trái chiều trong cùng một câu phức gọn gàng; trạng từ 'steadily / sharply' bổ nghĩa chính xác cho động từ xu hướng.",
        trapVi: "Không dùng tính từ 'rapid' bổ nghĩa cho động từ và không dùng 'moreover' khi hai vế đối lập.",
        citationId: "biber2011nounphrase",
      },
      {
        id: "u4_e3",
        type: "cloze",
        difficulty: 2,
        promptVi: "Điền trạng từ mang nghĩa 'lần lượt / tương ứng theo thứ tự đã nêu' ở cuối câu so sánh số liệu:",
        stimulusEn: "Rail and bus travel accounted for 38% and 24% of commuter journeys, ________.",
        acceptedAnswers: ["respectively"],
        hintVi: "Bắt đầu bằng 'r', kết thúc bằng '-ly' (12 chữ cái).",
        ruleVi: "Trạng từ 'respectively' giúp nén hai dữ kiện song song vào một câu học thuật súc tích mà vẫn rõ nghĩa tuyệt đối.",
        trapVi: "Đừng nhầm 'respectively' (lần lượt) với 'respectfully' (lễ phép) hoặc 'irrespective' (bất kể).",
        citationId: "kim2018lexical",
      },
    ],
  },
  {
    id: "unit-5-writing-task2",
    order: 5,
    cefr: "C1",
    targetBand: 7.0,
    skill: "writing",
    titleVi: "Chặng 5: IELTS Writing Task 2 — Rào Đón & Mạch Lạc Luận Điểm",
    subtitleVi: "Ứng dụng ngôn ngữ rào đón của Hyland (2005) và liên kết quy chiếu của Crossley et al. (2016).",
    guidebookVi:
      "Thí sinh thường mất điểm vì khái quát hóa tuyệt đối ('Remote work destroys all teamwork'). Văn phong học thuật Band 7.5+ sử dụng ngôn ngữ rào đón (hedging: 'may erode', 'tends to weaken') và liên kết quy chiếu ('Such policies', 'This shift') thay vì mở đầu mọi câu bằng 'Firstly, Secondly, Moreover' (Hyland, 2005; Crossley et al., 2016).",
    citationId: "hyland2005stance",
    xpReward: 30,
    vocabularySeeds: [
      { id: "v_exacerbate", term: "exacerbate", meaningVi: "làm trầm trọng thêm vấn đề sẵn có", skill: "writing", difficulty: 0.65, exampleEn: "Unregulated short-term rentals may exacerbate urban housing shortages." },
      { id: "v_viable", term: "economically viable", meaningVi: "khả thi về mặt kinh tế", skill: "writing", difficulty: 0.55, exampleEn: "Public transit expansion becomes economically viable in dense corridors." },
    ],
    exercises: [
      {
        id: "u5_e1",
        type: "error_fix",
        difficulty: 3,
        promptVi: "Câu Task 2 dưới đây mắc lỗi khái quát hóa cực đoan. Chọn phiên bản nâng cấp đạt chuẩn Band 8.0:",
        stimulusEn: "Draft: Online education definitely replaces every traditional university classroom for all students.",
        options: [
          "While online platforms considerably widen access to lectures, they are unlikely to replace hands-on university laboratories entirely.",
          "Online education 100% destroys all universities in every single country today.",
          "Firstly, online education is good. Moreover, universities are also very good for everybody.",
          "Every student always hates going to traditional classrooms because of the Internet.",
        ],
        answer:
          "While online platforms considerably widen access to lectures, they are unlikely to replace hands-on university laboratories entirely.",
        ruleVi: "Mệnh đề nhượng bộ 'While...' kết hợp rào đón 'are unlikely to... entirely' thể hiện tư duy phản biện cân bằng, tránh lỗi 'over-generalisation' trong tiêu chí Task Response.",
        trapVi: "Các từ tuyệt đối 'every, all, always, 100%, definitely' dễ khiến luận điểm thiếu thuyết phục trước giám khảo.",
        citationId: "hyland2005stance",
      },
      {
        id: "u5_e2",
        type: "mcq",
        difficulty: 3,
        promptVi: "Chọn cụm liên kết quy chiếu (cohesive reference) tự nhiên nhất để nối hai câu sau:",
        stimulusEn:
          "Many municipalities have introduced congestion charges during peak weekday hours. ________ has encouraged thousands of drivers to switch to suburban rail.",
        options: ["This measure", "On the contrary", "For example", "Nevertheless"],
        answer: "This measure",
        ruleVi: "Cụm danh từ quy chiếu 'This measure' tóm gọn toàn bộ hành động thu phí ùn tắc ở câu trước, tạo mạch liên kết tự nhiên chuẩn Band 8+ (Crossley et al., 2016).",
        trapVi: "Lạm dụng từ nối sai quan hệ logic như 'On the contrary' hoặc 'Nevertheless' sẽ làm giảm điểm Coherence & Cohesion.",
        citationId: "crossley2016cohesion",
      },
      {
        id: "u5_e3",
        type: "word_bank",
        difficulty: 3,
        promptVi: "Sắp xếp câu chủ đề sử dụng danh từ hóa (nominalization — Biber et al., 2011):",
        sourceVi: "Đô thị hóa nhanh có thể làm trầm trọng thêm tình trạng thiếu nhà ở.",
        answerTokens: ["rapid", "urbanisation", "can", "exacerbate", "affordable", "housing", "shortages"],
        distractorTokens: ["exacerbates", "urbanise"],
        ruleVi: "Cụm danh từ nén 'rapid urbanisation' và 'affordable housing shortages' đi cùng động từ khuyết thiếu rào đón 'can exacerbate' tạo mật độ thông tin học thuật cao.",
        trapVi: "Sau động từ khuyết thiếu 'can' luôn dùng động từ nguyên thể không 'to' ('exacerbate').",
        citationId: "moore2005dimensions",
      },
    ],
  },
  {
    id: "unit-6-speaking-caf",
    order: 6,
    cefr: "C1",
    targetBand: 7.5,
    skill: "speaking",
    titleVi: "Chặng 6: IELTS Speaking Part 2–3 — Độ Lưu Loát & Mở Rộng Ý",
    subtitleVi: "Cân bằng Độ phức tạp – Chính xác – Trôi chảy (Skehan, 2009) và tương tác tự nhiên.",
    guidebookVi:
      "Seedhouse et al. (2014) chỉ ra sự khác biệt cốt lõi giữa Band 6.0 và Band 7.5 ở Speaking Part 3 nằm ở khả năng chuyển từ ví dụ cá nhân sang phân tích xã hội khái quát, sử dụng từ đánh dấu diễn ngôn tự nhiên ('That is an intriguing question', 'Looking at the broader picture') và giữ nhịp nói liền mạch (Kormos & Denes, 2004).",
    citationId: "seedhouse2014speaking",
    xpReward: 30,
    vocabularySeeds: [
      { id: "v_double_edged", term: "a double-edged sword", meaningVi: "con dao hai lưỡi (vừa có lợi vừa có hại)", skill: "speaking", difficulty: 0.45, exampleEn: "Algorithmic recommendations can be a double-edged sword for young readers." },
      { id: "v_pivotal", term: "play a pivotal role", meaningVi: "đóng vai trò then chốt, quyết định", skill: "speaking", difficulty: 0.5, exampleEn: "Community libraries still play a pivotal role in lifelong learning." },
    ],
    exercises: [
      {
        id: "u6_e1",
        type: "mcq",
        difficulty: 3,
        promptVi: "Giám khảo hỏi Part 3: 'Should museums always be free to enter?' Cách mở lời nào tự nhiên và đạt Band 7.5+?",
        stimulusEn: "Mục tiêu: câu giờ tự nhiên 2 giây để lập ý + nêu quan điểm có phân tầng điều kiện.",
        options: [
          "Ideally, yes, especially for national collections, because waiving admission fees makes cultural heritage accessible regardless of income.",
          "Museums are good. I went to a museum yesterday with my best friend and took photos.",
          "According to a recent study by Oxford University in 2023, 78.4% of museums are free.",
          "Yes, free.",
        ],
        answer:
          "Ideally, yes, especially for national collections, because waiving admission fees makes cultural heritage accessible regardless of income.",
        ruleVi: "Câu trả lời đi thẳng vào phân tích chính sách chung, giới hạn phạm vi khéo léo ('especially for national collections') và dùng collocation tự nhiên ('waiving admission fees', 'cultural heritage').",
        trapVi: "Ở Part 3, không thu hẹp về kể chuyện cá nhân vụn vặt (như Part 1) và tuyệt đối không bịa số liệu nghiên cứu giả.",
        citationId: "seedhouse2018discourse",
      },
      {
        id: "u6_e2",
        type: "pairs",
        difficulty: 3,
        promptVi: "Nối cách nói đơn giản Band 5.5 với cách diễn đạt tự nhiên Band 7.5+ trong IELTS Speaking:",
        pairs: [
          { left: "very important", right: "absolutely pivotal" },
          { left: "relax after work", right: "unwind after a demanding shift" },
          { left: "has good and bad sides", right: "acts as a double-edged sword" },
          { left: "I remember clearly", right: "it remains vivid in my memory" },
        ],
        ruleVi: "Nâng cấp từ vựng theo ngữ cảnh tự nhiên (idiomatic precision) giúp tăng trực tiếp điểm Lexical Resource mà không bị gượng ép (Iwashita et al., 2008).",
        trapVi: "Tránh nhồi nhét thành ngữ cũ kỹ không hợp ngữ cảnh như 'raining cats and dogs' trong bài thảo luận học thuật.",
        citationId: "skehan2009caf",
      },
      {
        id: "u6_e3",
        type: "word_bank",
        difficulty: 3,
        promptVi: "Ghép câu chuyển ý mượt mà khi mở rộng luận điểm trong Speaking Part 3:",
        sourceVi: "Nhìn từ góc độ rộng hơn, không gian xanh cải thiện sức khỏe tinh thần đô thị.",
        answerTokens: ["from", "a", "broader", "perspective", "green", "spaces", "enhance", "urban", "wellbeing"],
        distractorTokens: ["perspectives", "enhances"],
        ruleVi: "Cụm mở đầu 'From a broader perspective' giúp chuyển dịch mượt mà từ ý cụ thể sang tầm vĩ mô, tăng điểm Fluency & Coherence.",
        trapVi: "Chú ý phát âm rõ phụ âm cuối /s/ trong 'spaces' và đi với động từ số nhiều 'enhance'.",
        citationId: "galaczi2018interactional",
      },
    ],
  },
  {
    id: "unit-7-vietnamese-mastery",
    order: 7,
    cefr: "C1+",
    targetBand: 8.0,
    skill: "writing",
    titleVi: "Chặng 7: Khắc Phục Lỗi Chuyển Di Đặc Thù Của Người Học Việt",
    subtitleVi: "Xử lý triệt để lỗi cặp liên từ thừa, mạo từ, danh từ không đếm được và phụ âm cuối.",
    guidebookVi:
      "Dựa trên các nghiên cứu thực nghiệm về người học Việt Nam (Nguyen & Nguyen, 2022; Dang & Dang, 2021; Vu & Peters, 2021), chặng này giúp bạn xóa bỏ hoàn toàn các lỗi chuyển di từ cấu trúc 'Mặc dù... nhưng...' ('Although... but...') và 'Bởi vì... nên...' ('Because... so...') để tiến vững lên Band 8.0.",
    citationId: "nguyen2022ieltswritingvn",
    xpReward: 30,
    vocabularySeeds: [
      { id: "v_indispensable", term: "indispensable", meaningVi: "không thể thiếu được, thiết yếu", skill: "vocabulary", difficulty: 0.6, exampleEn: "Accurate data collection is indispensable for public health planning." },
      { id: "v_disparity", term: "income disparity", meaningVi: "sự chênh lệch thu nhập", skill: "writing", difficulty: 0.65, exampleEn: "Targeted scholarships help narrow regional educational disparities." },
    ],
    exercises: [
      {
        id: "u7_e1",
        type: "error_fix",
        difficulty: 3,
        promptVi: "Sửa lỗi chuyển di ngữ pháp từ tiếng Việt ('Mặc dù... nhưng...') trong câu sau:",
        stimulusEn: "Error: Although public transport is affordable, but many commuters still prefer motorbikes.",
        options: [
          "Although public transport is affordable, many commuters still prefer motorbikes.",
          "Although public transport is affordable, however many commuters prefer motorbikes.",
          "Despite public transport is affordable, many commuters still prefer motorbikes.",
          "Because motorbikes are convenient, so commuters rarely take the bus.",
        ],
        answer: "Although public transport is affordable, many commuters still prefer motorbikes.",
        ruleVi: "Trong tiếng Anh, một câu phức chỉ dùng MỘT liên từ nối hai mệnh đề: dùng 'Although S + V, S + V' HOẶC 'S + V, but S + V', tuyệt đối không dùng cả 'Although' lẫn 'but' (tương tự không dùng cả 'Because' lẫn 'so').",
        trapVi: "'Despite' phải đi với cụm danh từ hoặc V-ing ('Despite the affordability of public transport'), không đi trực tiếp với mệnh đề S + V.",
        citationId: "nguyen2022ieltswritingvn",
      },
      {
        id: "u7_e2",
        type: "error_fix",
        difficulty: 3,
        promptVi: "Sửa lỗi 'According to me' và danh từ không đếm được trong câu sau:",
        stimulusEn: "Error: According to me, governments should provide more informations about preventive healthcare.",
        options: [
          "In my view, governments should provide clearer information about preventive healthcare.",
          "According to my opinion, governments should provide many informations on healthcare.",
          "In my view, governments should provide an information about preventive healthcare.",
          "According to me, government should gives more information about preventive healthcare.",
        ],
        answer: "In my view, governments should provide clearer information about preventive healthcare.",
        ruleVi: "'According to' chỉ dùng để dẫn nguồn bên ngoài (According to the report / WHO), không bao giờ dùng cho bản thân ('In my view / I maintain that'). Đồng thời 'information' là danh từ không đếm được.",
        trapVi: "'According to my opinion' cũng là lỗi trộn cấu trúc (chỉ viết 'In my opinion').",
        citationId: "dang2021vietnamielts",
      },
      {
        id: "u7_e3",
        type: "cloze",
        difficulty: 3,
        promptVi: "Điền danh từ học thuật (bắt đầu bằng 'd') mang nghĩa 'sự chênh lệch / bất bình đẳng' giữa thành thị và nông thôn:",
        stimulusEn: "Digital infrastructure grants aim to narrow the educational ________ between urban and rural provinces.",
        acceptedAnswers: ["disparity", "divide"],
        hintVi: "d-i-s-p-a-r-i-t-y (hoặc d-i-v-i-d-e).",
        ruleVi: "Cụm 'narrow the disparity / bridge the divide between A and B' là cấu trúc đắt giá cho các đề IELTS Writing & Speaking về giáo dục, y tế và kinh tế vùng miền.",
        trapVi: "Chú ý giới từ đi kèm: 'between A and B' (dùng 'and', không dùng 'with').",
        citationId: "vu2021vietnam",
      },
    ],
  },
  {
    id: "unit-8-sus-c2-synthesis",
    order: 8,
    cefr: "C2",
    targetBand: 8.5,
    skill: "reading",
    titleVi: "Chặng 8: Câu Bất Ngờ Ngữ Nghĩa (SUS) & Đỉnh Cao Band 8.5+",
    subtitleVi: "Kích hoạt sai số dự đoán phần thưởng (De Loof et al., 2018) & đảo ngữ học thuật C2.",
    guidebookVi:
      "Duolingo nổi tiếng với những câu chuẩn ngữ pháp nhưng bất ngờ về ngữ nghĩa (Semantically Unpredictable Sentences — Benoit et al., 1996). Nghiên cứu thần kinh học nhận thức của De Loof et al. (2018) chứng minh yếu tố bất ngờ tạo ra tín hiệu sai số dự đoán phần thưởng (reward prediction error), buộc não bộ phân tích sâu từng hình vị ngữ pháp thay vì đoán mò theo thói quen, qua đó khắc sâu từ vựng học thuật dài hạn!",
    citationId: "deloof2018rpe",
    xpReward: 35,
    vocabularySeeds: [
      { id: "v_scrutinise", term: "scrutinise", meaningVi: "thẩm tra, xem xét tỉ mỉ từng chi tiết", skill: "reading", difficulty: 0.75, exampleEn: "Independent auditors scrutinise every assumption in the fiscal forecast." },
      { id: "v_unprecedented", term: "unprecedented", meaningVi: "chưa từng có tiền lệ", skill: "writing", difficulty: 0.7, exampleEn: "Satellite sensors recorded marine warming on an unprecedented scale." },
    ],
    exercises: [
      {
        id: "u8_e1",
        type: "sus",
        difficulty: 3,
        promptVi: "[Câu Bất Ngờ Ngữ Nghĩa — SUS] Sắp xếp các thẻ từ thành câu đảo ngữ C2 đúng ngữ pháp tuyệt đối:",
        sourceVi: "Hiếm khi nào chú chim cánh cụt lịch thiệp lại thẩm tra bảng ngân sách hàng quý của thư viện.",
        answerTokens: [
          "seldom", "does", "the", "polite", "penguin", "scrutinise", "the", "library", "quarterly", "budget",
        ],
        distractorTokens: ["scrutinises", "do"],
        ruleVi: "Khi trạng từ phủ định/hiếm gặp 'Seldom / Rarely / Never' đứng đầu câu, bắt buộc đảo trợ động từ 'does' lên trước chủ ngữ số ít ('the polite penguin') và đưa động từ chính 'scrutinise' về nguyên thể!",
        trapVi: "Không đoán theo thói quen — hãy kiểm tra chính xác sự hòa hợp chủ-vị ('penguin' -> 'does' + 'scrutinise').",
        citationId: "deloof2018rpe",
      },
      {
        id: "u8_e2",
        type: "sus",
        difficulty: 3,
        promptVi: "[Câu Bất Ngờ Ngữ Nghĩa — SUS] Chọn bản hiểu nghĩa chính xác nhất cho câu giả định loại 3 đảo ngữ sau:",
        stimulusEn:
          "Had the nocturnal tortoise submitted a peer-reviewed bibliography, the committee might have endorsed its subterranean tramway.",
        options: [
          "Vì chú rùa ăn đêm đã không nộp danh mục tài liệu bình duyệt nên hội đồng đã không phê duyệt tuyến tàu điện ngầm của nó.",
          "Chú rùa ăn đêm vừa nộp danh mục tài liệu và chắc chắn sẽ xây xong tuyến tàu điện ngầm vào năm tới.",
          "Hội đồng yêu cầu chú rùa từ bỏ nghiên cứu khoa học để chuyển sang vận hành tàu điện.",
          "Mặc dù đã nộp danh mục tài liệu bình duyệt, chú rùa vẫn từ chối sự phê duyệt của hội đồng.",
        ],
        answer:
          "Vì chú rùa ăn đêm đã không nộp danh mục tài liệu bình duyệt nên hội đồng đã không phê duyệt tuyến tàu điện ngầm của nó.",
        ruleVi: "Đảo ngữ điều kiện loại 3 'Had + S + V3/ed, S + might have + V3/ed' diễn tả giả định trái với quá khứ — đồng thời giúp bạn khắc sâu 3 từ C1/C2: 'nocturnal' (hoạt động về đêm), 'peer-reviewed' (bình duyệt) và 'endorse' (chấp thuận/ủng hộ).",
        trapVi: "Không bị phân tâm bởi chủ ngữ hài hước — cấu trúc 'Had + S + V3' luôn mang hàm ý sự việc KHÔNG xảy ra trong quá khứ.",
        citationId: "benoit1996sus",
      },
      {
        id: "u8_e3",
        type: "cloze",
        difficulty: 3,
        promptVi: "Điền tính từ học thuật C2 (13 chữ cái, bắt đầu bằng 'u') mang nghĩa 'chưa từng có tiền lệ':",
        stimulusEn: "Advances in protein-folding models have accelerated biomedical discovery at an ________ pace.",
        acceptedAnswers: ["unprecedented"],
        hintVi: "u-n-p-r-e-c-e-d-e-n-t-e-d (đi chuẩn với cụm 'at an unprecedented pace / on an unprecedented scale').",
        ruleVi: "Cụm 'at an unprecedented pace' là collocation học thuật bậc C2 xuất hiện dày đặc trong Cambridge IELTS 16–20 Reading Passage 3 và bài mẫu Writing Band 8.5.",
        trapVi: "Chú ý gốc từ '-precedent-' (tiền lệ), tránh viết nhầm thành 'unpresidented'.",
        citationId: "karpicke2008retrieval",
      },
    ],
  },
]);

/**
 * Xáo trộn tất định danh sách thẻ từ cho bài tập Word Bank,
 * ĐẢM BẢO thứ tự hiển thị KHÔNG BAO GIỜ trùng nguyên xi với thứ tự đáp án.
 */
export function buildWordBankPool(exercise) {
  const combined = [...exercise.answerTokens, ...(exercise.distractorTokens || [])].map(
    (token, index) => ({
      chipId: `${exercise.id}_c${index}`,
      text: token.toLowerCase(),
    }),
  );
  // Hoán vị tất định theo mã ký tự để vừa tự nhiên vừa kiểm thử ổn định
  const shuffled = [...combined].sort((a, b) => {
    const hashA = (a.text.charCodeAt(0) * 31 + a.chipId.charCodeAt(a.chipId.length - 1) * 17) % 97;
    const hashB = (b.text.charCodeAt(0) * 31 + b.chipId.charCodeAt(b.chipId.length - 1) * 17) % 97;
    return hashA - hashB || a.chipId.localeCompare(b.chipId);
  });

  const targetPrefix = exercise.answerTokens.join(" ").toLowerCase();
  const currentPrefix = shuffled
    .slice(0, exercise.answerTokens.length)
    .map((c) => c.text)
    .join(" ");
  if (currentPrefix === targetPrefix && shuffled.length >= 2) {
    return [...shuffled.slice(1), shuffled[0]];
  }
  return shuffled;
}

/**
 * Chuẩn hóa chuỗi trả lời để chấm điểm công bằng (không phân biệt hoa/thường, dấu câu thừa).
 */
export function normalizeAnswer(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:]+$/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Chấm điểm một bài tập bất kỳ và trả về Giải thích Lỗi sai Sư phạm Miễn phí
 * (tương tự Duolingo Explain My Answer nhưng hoàn toàn miễn phí và kèm trích dẫn Google Scholar).
 */
export function evaluateExercise(exercise, userResponse) {
  let correct = false;
  let expectedDisplay = "";
  let userDisplay = "";

  if (exercise.type === "mcq" || exercise.type === "tfng" || exercise.type === "error_fix" || (exercise.type === "sus" && exercise.options)) {
    expectedDisplay = exercise.answer;
    userDisplay = String(userResponse || "").trim();
    correct = normalizeAnswer(userDisplay) === normalizeAnswer(exercise.answer);
  } else if (exercise.type === "cloze") {
    expectedDisplay = exercise.acceptedAnswers.join(" / ");
    userDisplay = String(userResponse || "").trim();
    const norm = normalizeAnswer(userDisplay);
    correct = exercise.acceptedAnswers.some((ans) => normalizeAnswer(ans) === norm);
  } else if (exercise.type === "word_bank" || exercise.type === "sus") {
    const tokens = Array.isArray(userResponse)
      ? userResponse.map((t) => normalizeAnswer(t)).filter(Boolean)
      : normalizeAnswer(userResponse).split(" ").filter(Boolean);
    expectedDisplay = exercise.answerTokens.join(" ");
    userDisplay = tokens.join(" ");
    correct = userDisplay === normalizeAnswer(expectedDisplay);
  } else if (exercise.type === "pairs") {
    expectedDisplay = exercise.pairs.map((p) => `${p.left} = ${p.right}`).join("; ");
    const map = userResponse && typeof userResponse === "object" ? userResponse : {};
    userDisplay = `${Object.keys(map).length}/${exercise.pairs.length} cặp`;
    correct = exercise.pairs.every(
      (p) => normalizeAnswer(map[p.left]) === normalizeAnswer(p.right),
    );
  }

  const citation = getCitationById(exercise.citationId);
  const headlineVi = correct
    ? "Chính xác xuất sắc! Bạn đã nắm vững điểm học thuật này."
    : "Chưa chính xác — cùng xem phân tích chi tiết để ghi nhớ sâu hơn:";

  return {
    exerciseId: exercise.id,
    correct,
    userDisplay: userDisplay || "(Chưa trả lời)",
    expectedDisplay,
    explanation: {
      headlineVi,
      ruleVi: exercise.ruleVi,
      trapVi: exercise.trapVi,
      citation: citation
        ? {
            id: citation.id,
            shortRef: `${citation.authors} (${citation.year})`,
            title: citation.title,
            scholarUrl: citation.scholarUrl,
          }
        : null,
    },
  };
}

/**
 * Truy xuất danh sách 8 chặng kèm trạng thái mở khóa, hoàn thành và vương miện thành thạo.
 */
export function getPathProgress(completedUnitCounts = {}) {
  return SKILL_PATH_UNITS.map((unit, index) => {
    const completions = Math.max(0, Number(completedUnitCounts[unit.id]) || 0);
    const prevUnit = SKILL_PATH_UNITS[index - 1];
    const prevDone = index === 0 || (Number(completedUnitCounts[prevUnit.id]) || 0) >= 1;
    const masteryLevel = Math.min(3, completions); // 0: chưa học, 1: Đồng, 2: Vàng, 3: Huyền thoại
    const status =
      masteryLevel >= 3
        ? "legendary"
        : masteryLevel >= 1
          ? "completed"
          : prevDone
            ? "current"
            : "available";
    return {
      ...unit,
      completions,
      masteryLevel,
      status,
    };
  });
}

/**
 * Tìm một chặng học theo mã ID.
 */
export function getUnitById(unitId) {
  return SKILL_PATH_UNITS.find((u) => u.id === unitId) || null;
}

/**
 * Đề xuất bài tập thích ứng (Adaptive Difficulty) theo điểm năng lực 0-160 và tỷ lệ đúng gần đây:
 * Tự động nâng độ khó khi học viên đạt >= 85% và củng cố nền tảng khi < 60%.
 */
export function selectAdaptiveDrill(proficiencyScore = 60, recentAccuracyPct = 75, count = 5) {
  const score = Number(proficiencyScore) || 0;
  const acc = Number(recentAccuracyPct);
  let targetDiff = score >= 115 ? 3 : score >= 75 ? 2 : 1;
  if (acc >= 85 && targetDiff < 3) targetDiff += 1;
  else if (acc < 60 && targetDiff > 1) targetDiff -= 1;

  const allExercises = SKILL_PATH_UNITS.flatMap((u) =>
    u.exercises.map((ex) => ({ ...ex, unitId: u.id, skill: u.skill, targetBand: u.targetBand })),
  );
  const prioritized = [...allExercises].sort(
    (a, b) => Math.abs(a.difficulty - targetDiff) - Math.abs(b.difficulty - targetDiff),
  );
  const safeCount = Math.max(1, Math.min(allExercises.length, Number(count) || 5));
  return {
    targetDifficulty: targetDiff,
    difficultyLabelVi:
      targetDiff === 3
        ? "Nâng cao (Band 7.5–8.5+)"
        : targetDiff === 2
          ? "Trung cao cấp (Band 6.0–7.0)"
          : "Nền tảng vững chắc (Band 4.5–5.5)",
    exercises: prioritized.slice(0, safeCount),
  };
}
