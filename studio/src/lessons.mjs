// Stable IDs are also the keys in the learner's local review schedule.
export const skills = {
  Reading: { vi: "Đọc", icon: "book" },
  Listening: { vi: "Nghe", icon: "headphones" },
  Writing: { vi: "Viết", icon: "pen" },
  Speaking: { vi: "Nói", icon: "mic" },
};

export const lessons = [
  {
    id: "main-idea",
    skill: "Reading",
    title: "Đọc để nắm ý chính",
    topic: "Tìm ý bao quát và phân biệt chi tiết hỗ trợ.",
    text: "When a university library began lending tools, students first borrowed them to save money. Soon, however, the workshop became a meeting place. Experienced users showed beginners how to repair everyday objects, and students who rarely met in class started projects together.",
    items: [
      [
        "Which heading fits the whole passage?",
        [
          "The price of a new workshop",
          "A lending scheme brings students together",
          "Why students stopped buying books",
        ],
        1,
        "Động cơ ban đầu là tiết kiệm; phần lớn đoạn văn nói về kết nối giữa các sinh viên.",
      ],
      [
        "Why did students first borrow tools?",
        ["To spend less", "To meet their teachers", "To sell objects"],
        0,
        "“To save money” diễn đạt cùng ý với “to spend less”.",
      ],
      [
        "The university required students to join a project.",
        ["TRUE", "FALSE", "NOT GIVEN"],
        2,
        "Đoạn văn cho biết sinh viên bắt đầu làm dự án, không nói nhà trường bắt buộc.",
      ],
    ],
  },
  {
    id: "listen-numbers",
    skill: "Listening",
    title: "Bắt đúng con số",
    topic: "Nghe tên đơn vị trước khi ghi số liệu.",
    audio: "park-area",
    transcript:
      "The park covers 170 acres — that’s 69 hectares. There are three main types of habitat: wetland, grassland and woodland. The speaker then describes the woodland.",
    items: [
      [
        "How many hectares does the park cover?",
        ["170", "69", "3"],
        1,
        "170 đi với acres; khi đổi sang hectares người nói dùng số 69.",
      ],
      [
        "Which unit accompanies the first number?",
        ["Miles", "Hectares", "Acres"],
        2,
        "Cụm đầu tiên là “170 acres”. Nghe theo cặp số và đơn vị.",
      ],
      [
        "What follows the information about the area?",
        ["A list of habitats", "The cost of a visit", "Directions to the park"],
        0,
        "Sau diện tích, người nói giới thiệu ba môi trường sống chính.",
      ],
    ],
  },
  {
    id: "write-overview",
    skill: "Writing",
    title: "Viết câu tổng quan",
    topic: "Chọn xu hướng nổi bật cho Academic Task 1.",
    text: "Library visits per month: North campus, 2010: 200; 2020: 400. South campus, 2010: 300; 2020: 350.",
    items: [
      [
        "Which overview is supported by the figures?",
        [
          "Visits fell at both campuses.",
          "North campus always had the most visits.",
          "Both rose, with faster growth at North campus.",
        ],
        2,
        "Cả hai nơi đều tăng; mức tăng của North (+200) lớn hơn South (+50).",
      ],
      [
        "Complete: Visits at North campus doubled ___ 200 to 400.",
        ["from", "by", "at"],
        0,
        "Dùng “from … to …” khi nêu giá trị đầu và cuối.",
      ],
      [
        "Which statement adds an unsupported explanation?",
        [
          "North overtook South.",
          "Visits rose because more books were bought.",
          "South recorded 350 visits in 2020.",
        ],
        1,
        "Bảng cung cấp số lượt ghé, không cung cấp nguyên nhân tăng.",
      ],
    ],
  },
  {
    id: "speak-example",
    skill: "Speaking",
    title: "Mở rộng câu trả lời",
    topic: "Trả lời thành tiếng rồi thêm một ví dụ cụ thể.",
    text: "Do you like going to parks? Give your own answer aloud before comparing the examples below.",
    items: [
      [
        "Which answer develops a personal reason?",
        [
          "Yes, a park is a park.",
          "Yes. Walking there helps me unwind after work.",
          "I would like to discuss transport policy.",
        ],
        1,
        "Câu trả lời nêu ý kiến rồi giải thích bằng một lợi ích cá nhân.",
      ],
      [
        "Which detail best supports that reason?",
        [
          "My city has several parks.",
          "Green is a colour.",
          "Last Friday, a short walk there helped me relax.",
        ],
        2,
        "Ví dụ có thời điểm, hành động và kết quả gắn với ý “unwind”.",
      ],
      [
        "Which follow-up asks about frequency?",
        ["How often do you visit?", "Who designed it?", "What is it called?"],
        0,
        "“How often” hỏi tần suất; hãy nói câu trả lời của bạn kèm một ví dụ.",
      ],
    ],
  },
  {
    id: "read-evidence",
    skill: "Reading",
    title: "Kiểm chứng nhận định",
    topic: "Phân biệt thông tin trái ngược và thông tin còn thiếu.",
    text: "The town tested a night bus on Fridays for six weeks. Tickets cost the same as daytime tickets. Passenger numbers grew during the trial, but the council has not yet decided whether to extend it.",
    items: [
      [
        "Night tickets were more expensive than daytime tickets.",
        ["TRUE", "FALSE", "NOT GIVEN"],
        1,
        "“Cost the same” trực tiếp phủ định “more expensive”.",
      ],
      [
        "More people used the bus as the trial progressed.",
        ["TRUE", "FALSE", "NOT GIVEN"],
        0,
        "“Passenger numbers grew” là bằng chứng trực tiếp.",
      ],
      [
        "Most passengers wanted a Sunday service.",
        ["TRUE", "FALSE", "NOT GIVEN"],
        2,
        "Đoạn văn không khảo sát mong muốn của hành khách.",
      ],
    ],
  },
  {
    id: "listen-sequence",
    skill: "Listening",
    title: "Theo dấu trình tự",
    topic: "Nhận ra quan hệ trước – sau trong đoạn mô tả.",
    audio: "park-lakes",
    transcript:
      "The original farmland was dug up around forty years ago to extract gravel. Once this work was completed, the gravel pits filled with water, forming two large lakes. The speaker also mentions ponds and a stream.",
    items: [
      [
        "Why was the farmland dug up?",
        ["To plant woodland", "To extract gravel", "To build a school"],
        1,
        "Cụm “to extract gravel” giải thích lý do đào đất.",
      ],
      [
        "What happened after the digging ended?",
        [
          "The lakes dried up.",
          "The park was closed.",
          "The pits filled with water.",
        ],
        2,
        "“Once this work was completed” đánh dấu bước tiếp theo.",
      ],
      [
        "What flows through the park?",
        ["A stream", "A canal", "A wide river"],
        0,
        "Người nói nhắc đến ao và một dòng suối chảy qua công viên.",
      ],
    ],
  },
  {
    id: "write-argument",
    skill: "Writing",
    title: "Dựng một lập luận",
    topic: "Nối luận điểm với lý do và dẫn chứng trong Task 2.",
    text: "Some people believe libraries should offer free evening classes. To what extent do you agree?",
    items: [
      [
        "Which sentence states a clear position?",
        [
          "Libraries exist in many places.",
          "There are two words in evening classes.",
          "I support free evening classes because they widen access.",
        ],
        2,
        "Câu cuối thể hiện lập trường và giới thiệu lý do để phát triển.",
      ],
      [
        "Which example supports wider access?",
        [
          "An evening class lets a daytime worker attend.",
          "Books have different covers.",
          "The building was painted recently.",
        ],
        0,
        "Ví dụ chỉ rõ ai được lợi và vì sao khung giờ tối phù hợp.",
      ],
      [
        "Which phrase introduces a limitation?",
        [
          "For example,",
          "However, staffing these classes costs money.",
          "As a result, access improves.",
        ],
        1,
        "“However” báo hiệu một khía cạnh đối lập: chi phí nhân sự.",
      ],
    ],
  },
  {
    id: "speak-story",
    skill: "Speaking",
    title: "Kể một trải nghiệm",
    topic: "Sắp xếp ý cho lượt nói dài ở Part 2.",
    text: "Describe a skill you learned from another person. Say what the skill was, who helped you and why it mattered. Try telling the story aloud.",
    items: [
      [
        "Which opening sets the scene?",
        [
          "Skills can be learned.",
          "Last winter, my aunt taught me to mend a jacket.",
          "That is why I enjoyed it.",
        ],
        1,
        "Câu này giới thiệu thời gian, người hướng dẫn và kỹ năng.",
      ],
      [
        "Which detail describes an initial difficulty?",
        [
          "Eventually I felt confident.",
          "My aunt lives nearby.",
          "At first, I could not keep the stitches straight.",
        ],
        2,
        "“At first” và vấn đề cụ thể giúp người nghe theo dõi diễn biến.",
      ],
      [
        "Which ending reflects on the experience?",
        [
          "Now I can repair things instead of replacing them.",
          "Next there was a jacket.",
          "Winter is a season.",
        ],
        0,
        "Câu kết giải thích kỹ năng đó thay đổi cuộc sống ra sao. Hãy thử kể lại bằng từ của bạn.",
      ],
    ],
  },
];

export const cards = new Map(
  lessons.flatMap((lesson) =>
    lesson.items.map(([prompt, options, key, note], index) => {
      const id = `${lesson.id}:${index}`;
      return [id, { id, lesson, prompt, options, key, note }];
    }),
  ),
);
