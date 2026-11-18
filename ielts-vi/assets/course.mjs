// Each card is keyed by a stable ID, never by its display text or array index.
// Audio excerpts are the original English recordings already in the YYSD bank.
export const skills = {
  reading: "Đọc",
  listening: "Nghe",
  writing: "Viết",
  speaking: "Nói",
};
export const lessons = [
  {
    id: "evidence",
    skill: "reading",
    title: "Đọc tìm bằng chứng",
    subtitle: "Phân biệt điều tác giả viết với điều mình suy đoán.",
    topic: "True · False · Not Given",
    cards: [
      {
        id: "hive",
        context:
          "A foraging bee may follow a winding route, yet it returns home by a near-straight path.",
        prompt: "The bee retraces its outward route on the way home.",
        options: ["True", "False", "Not Given"],
        answer: 1,
        why: "“A near-straight path” trái với nhận định ong về tổ theo đúng đường vòng lúc đi.",
      },
      {
        id: "sky",
        context:
          "Even behind clouds, bees can infer the position of the sun from polarised light.",
        prompt: "Bees can locate the sun without seeing it directly.",
        options: ["True", "False", "Not Given"],
        answer: 0,
        why: "“Without seeing it directly” diễn đạt lại tình huống mặt trời bị mây che.",
      },
      {
        id: "clock",
        context:
          "An internal clock helps the bee adjust for the movement of the sun.",
        prompt: "This clock is more precise in bees than in ants.",
        options: ["True", "False", "Not Given"],
        answer: 2,
        why: "Đoạn văn không so sánh ong với kiến. Thiếu bằng chứng không có nghĩa là nhận định sai.",
      },
    ],
  },
  {
    id: "listen-detail",
    skill: "listening",
    title: "Nghe lấy chi tiết",
    subtitle: "Bắt từ khóa trong lời hướng dẫn tại phòng tập.",
    topic: "Listening for detail",
    cards: [
      {
        id: "bikes",
        audio: 1,
        context: "Cardio machines and bikes are over here.",
        prompt: "Which equipment is mentioned alongside the cardio machines?",
        options: ["Benches", "Lockers", "Bikes"],
        answer: 2,
        why: "Sau liên từ “and”, người nói nhắc tới “bikes”.",
      },
      {
        id: "weights",
        audio: 2,
        context: "The weight room provides dumbbells and benches.",
        prompt: "Where can you find benches?",
        options: [
          "In the yoga studio",
          "In the weight room",
          "At the entrance",
        ],
        answer: 1,
        why: "Cụm “the weight room” nêu địa điểm; “benches” là một trong hai vật ở đó.",
      },
      {
        id: "yoga",
        audio: 3,
        context: "Our yoga studio offers classes for all fitness levels.",
        prompt: "Who can attend the classes?",
        options: [
          "Participants of any fitness level",
          "Only advanced athletes",
          "Only new members",
        ],
        answer: 0,
        why: "Từ “all” bao gồm cả người mới lẫn người đã có kinh nghiệm.",
      },
    ],
  },
  {
    id: "trends",
    skill: "writing",
    title: "Viết câu mô tả xu hướng",
    subtitle: "Chọn giới từ và số liệu cho phần Academic Writing Task 1.",
    topic: "Describing change",
    cards: [
      {
        id: "rise",
        context: "Library visits: 400 in May; 500 in June.",
        prompt: "Visits rose ___ 100 in June.",
        options: ["to", "by", "at"],
        answer: 1,
        why: "“By 100” là mức tăng. “To 500” mới là giá trị cuối kỳ.",
      },
      {
        id: "points",
        context:
          "In 2010, 30% of commuters cycled. In 2020, the figure was 40%.",
        prompt: "Which sentence reports the change precisely?",
        options: [
          "It doubled.",
          "It fell by ten percent.",
          "It rose by ten percentage points.",
        ],
        answer: 2,
        why: "40% trừ 30% bằng 10 điểm phần trăm. Đó không phải mức tăng tương đối 10%.",
      },
      {
        id: "overview",
        context: "East: 12 → 20 → 28. West: 8 → 14 → 19.",
        prompt: "Which overview is supported by both series?",
        options: [
          "Both rose throughout the period.",
          "The West overtook the East.",
          "Neither changed overall.",
        ],
        answer: 0,
        why: "Mỗi giá trị đều lớn hơn giá trị liền trước ở cả hai vùng; không có lần đổi thứ hạng nào.",
      },
    ],
  },
  {
    id: "extend",
    skill: "speaking",
    title: "Nói dài hơn bằng một ví dụ",
    subtitle: "Trả lời thành tiếng trước khi đối chiếu cách phát triển ý.",
    topic: "Speaking · Part 1",
    cards: [
      {
        id: "place",
        context:
          "Where do you like to study? Say your answer aloud, then add one reason.",
        prompt: "Which follow-up gives a concrete reason?",
        options: [
          "Study means learning.",
          "I use the library because my flat is noisy.",
          "I study and study.",
        ],
        answer: 1,
        why: "Câu trả lời nối địa điểm với hoàn cảnh cụ thể. Thử thay “my flat is noisy” bằng lý do của bạn.",
      },
      {
        id: "past",
        context:
          "Describe a time you learned something new. Tell the story aloud.",
        prompt: "Which phrase introduces a particular occasion?",
        options: [
          "In general, people learn.",
          "Learning is important.",
          "Last winter, my neighbour taught me to swim.",
        ],
        answer: 2,
        why: "“Last winter” đặt sự việc vào một thời điểm. Hãy kể tiếp bạn làm gì và kết quả ra sao.",
      },
      {
        id: "clarify",
        context:
          "You did not hear the last part of the examiner’s question. Practise asking for clarification aloud.",
        prompt: "Which request is clear and polite?",
        options: [
          "Could you repeat the last part, please?",
          "I am finished.",
          "I agree with you.",
        ],
        answer: 0,
        why: "Bạn đang xin nghe lại chứ không trả lời một câu hỏi khác. Bài này không chấm phát âm hay cho band nói.",
      },
    ],
  },
  {
    id: "paraphrase",
    skill: "reading",
    title: "Nhận ra cách diễn đạt lại",
    subtitle: "Theo dõi ý nghĩa thay vì chỉ dò từ giống nhau.",
    topic: "Matching information",
    cards: [
      {
        id: "limit",
        context:
          "Access to the archive is restricted to registered researchers.",
        prompt: "Which statement has the same meaning?",
        options: [
          "Anyone can enter.",
          "Researchers must register to enter.",
          "The archive is permanently closed.",
        ],
        answer: 1,
        why: "“Restricted to” đặt điều kiện cho việc vào kho lưu trữ; không có nghĩa là đóng cửa.",
      },
      {
        id: "some",
        context: "A small proportion of seedlings survived the first frost.",
        prompt: "Which phrase preserves the meaning?",
        options: [
          "No seedlings survived.",
          "Most seedlings survived.",
          "Only a few seedlings survived.",
        ],
        answer: 2,
        why: "“A small proportion” là một phần nhỏ, không phải toàn bộ hay bằng không.",
      },
      {
        id: "cause",
        context:
          "The report links rainfall with crop yields, but does not establish causation.",
        prompt: "What did the report identify?",
        options: ["An association", "A proven cause", "A contradiction"],
        answer: 0,
        why: "Tác giả nói đến mối liên hệ; phần sau “but” giới hạn kết luận về nhân quả.",
      },
    ],
  },
  {
    id: "listen-purpose",
    skill: "listening",
    title: "Nghe mục đích của lời nói",
    subtitle: "Nhận ra lời giới thiệu, mô tả và mời gọi.",
    topic: "Speaker intention",
    cards: [
      {
        id: "locker",
        audio: 4,
        context: "Locker rooms contain storage bins and changing facilities.",
        prompt: "What is the speaker doing?",
        options: [
          "Announcing a closure",
          "Describing facilities",
          "Taking a booking",
        ],
        answer: 1,
        why: "Người nói liệt kê những tiện ích có trong phòng thay đồ, không đưa ra lịch hay yêu cầu.",
      },
      {
        id: "smoothie",
        audio: 5,
        context:
          "Enjoy our smoothie bar and sample nutritious drinks and snacks.",
        prompt: "Which action is the listener invited to take?",
        options: ["Try the refreshments", "Clean the bar", "Prepare a meal"],
        answer: 0,
        why: "Động từ “sample” ở đây nghĩa là dùng thử. “Enjoy” mở đầu một lời mời.",
      },
      {
        id: "audience",
        audio: 3,
        context: "Our yoga studio offers classes for all fitness levels.",
        prompt: "Which concern does this information address?",
        options: [
          "The price of a membership",
          "The location of the exit",
          "Whether a beginner can join",
        ],
        answer: 2,
        why: "“All fitness levels” giúp người mới yên tâm; câu nói không nhắc giá hoặc lối ra.",
      },
    ],
  },
  {
    id: "argue",
    skill: "writing",
    title: "Nối luận điểm với dẫn chứng",
    subtitle: "Dựng một đoạn thân bài có lý do và ví dụ.",
    topic: "Writing · Task 2",
    cards: [
      {
        id: "claim",
        context: "Claim: Public parks can improve access to exercise.",
        prompt: "Which example directly supports this claim?",
        options: [
          "A free running track lets residents train after work.",
          "Trees are usually green.",
          "The city has an airport.",
        ],
        answer: 0,
        why: "Đường chạy miễn phí minh họa trực tiếp cho khả năng tiếp cận hoạt động thể chất.",
      },
      {
        id: "contrast",
        context:
          "Cycling is cheap. ___, it may not be practical for very long journeys.",
        prompt: "Choose the connector that fits the relationship.",
        options: ["For instance", "Therefore", "However"],
        answer: 2,
        why: "Vế sau nêu giới hạn của lợi ích vừa kể; quan hệ ở đây là tương phản.",
      },
      {
        id: "qualify",
        context: "The evidence comes from a survey of one school.",
        prompt: "Which conclusion respects this limitation?",
        options: [
          "All children agree.",
          "These pupils generally preferred shorter lessons.",
          "The result applies worldwide.",
        ],
        answer: 1,
        why: "“These pupils” giới hạn kết luận đúng theo mẫu khảo sát; hai phương án kia khái quát quá mức.",
      },
    ],
  },
  {
    id: "compare",
    skill: "speaking",
    title: "So sánh hai góc nhìn",
    subtitle: "Tập nêu khác biệt và lý giải lựa chọn của mình.",
    topic: "Speaking · Part 3",
    cards: [
      {
        id: "whereas",
        context:
          "Compare travelling by train and by car. Give your own answer aloud.",
        prompt: "Which response explicitly contrasts them?",
        options: [
          "Both are vehicles.",
          "Trains run to a timetable, whereas cars offer flexibility.",
          "Travel is interesting.",
        ],
        answer: 1,
        why: "“Whereas” nối hai đặc điểm tương phản. Hãy thử nói lại bằng tiêu chí chi phí hoặc thời gian.",
      },
      {
        id: "future",
        context:
          "How might work change in the future? Take a moment to answer aloud.",
        prompt: "Which response signals uncertainty appropriately?",
        options: [
          "It never changes.",
          "It changed yesterday.",
          "Remote work may become more common.",
        ],
        answer: 2,
        why: "“May” diễn đạt một dự đoán có điều kiện, không khẳng định chắc chắn.",
      },
      {
        id: "reason",
        context:
          "Some people prefer small towns. Explain your view aloud in two sentences.",
        prompt: "Which detail explains this preference?",
        options: [
          "Short commutes leave more time for family.",
          "Towns are towns.",
          "Cities exist too.",
        ],
        answer: 0,
        why: "Câu này giải thích vì sao một đặc điểm của thị trấn nhỏ có ích cho người sống ở đó.",
      },
    ],
  },
];
export const cards = lessons.flatMap((lesson) => lesson.cards);
