const choice = (prompt, options, correct, explanation) => ({
  kind: 'choice', prompt, options, answers: [options[correct]], explanation,
});
const gap = (prompt, answers, explanation) => ({ kind: 'gap', prompt, answers, explanation });
const reflect = (kind, prompt, sample, explanation) => ({ kind, prompt, sample, explanation });

export const skills = {
  listening: { label: 'Nghe', activity: 'Nghe đoạn ghi âm rồi tìm bằng chứng cho câu trả lời.' },
  reading: { label: 'Đọc', activity: 'Đọc đoạn trích, đối chiếu câu hỏi với bằng chứng trong bài.' },
  writing: { label: 'Viết', activity: 'Viết một phần ngắn và đối chiếu với bài mẫu.' },
  speaking: { label: 'Nói', activity: 'Trả lời thành tiếng trước khi xem gợi ý.' },
};

export const units = [
  {
    id: 'nen-tang', title: 'Xây nền tảng', description: 'Nắm ý chính và diễn đạt một ý trọn vẹn.',
    lessons: [
      {
        id: 'library', skill: 'listening', title: 'Nghe thông tin cụ thể', minutes: 4,
        audio: 'library',
        text: 'Hello, this is a reminder about Saturday’s library tour. Please meet at the north entrance at ten fifteen, not at the main desk. The tour is free, but bring your library card if you want to borrow anything afterwards. It will last about forty minutes, and photography is allowed in the reading room.',
        questions: [
          choice('Where should visitors meet?', ['At the main desk', 'At the north entrance', 'In the reading room'], 1,
            'Cụm “meet at the north entrance” chỉ nơi tập trung. Quầy chính được nhắc đến để loại trừ.'),
          gap('What time does the tour group meet? Write the time in digits.', ['10:15', '10.15', '10:15 am', '10:15 a.m.'],
            'Bạn nghe “ten fifteen”, tức 10 giờ 15. Đừng nhầm với thời lượng 40 phút ở cuối.'),
          choice('What do visitors need if they want to borrow something?', ['A library card', 'A tour ticket', 'A photo ID'], 0,
            '“If you want to borrow anything” là điều kiện đi kèm lời nhắc “bring your library card”.'),
        ],
      },
      {
        id: 'garden', skill: 'reading', title: 'Tìm ý chính của đoạn', minutes: 4,
        text: 'A vacant lot in Brook Street used to collect rubbish. After neighbours turned it into a shared garden, more residents started to talk to one another. The garden supplies only a small amount of food, but surveys suggest that its greatest value is bringing people together.',
        questions: [
          choice('Which heading best fits the whole paragraph?', ['How to grow more food', 'Why surveys fail', 'A garden that builds community'], 2,
            'Hai câu cuối nhấn mạnh kết nối hàng xóm, còn lượng thực phẩm chỉ là một chi tiết phụ.'),
          choice('What happened before the garden was created?', ['Residents held weekly surveys.', 'Rubbish collected on the site.', 'The site supplied most of the local food.'], 1,
            '“Used to collect rubbish” nói về tình trạng cũ của mảnh đất.'),
          gap('Complete in ONE WORD from the text: The garden supplies a small amount of ___.', ['food'],
            'Tìm cụm “a small amount of food”. Đề yêu cầu lấy đúng một từ trong đoạn.'),
        ],
      },
      {
        id: 'argument', skill: 'writing', title: 'Phát triển một luận điểm', minutes: 5,
        questions: [
          choice('Which sentence could open a paragraph supporting longer library hours?', ['Libraries have shelves and tables.', 'Longer opening hours would give shift workers more access to library services.', 'Some people agree and others disagree.'], 1,
            'Một câu chủ đề tốt đưa ra lập luận cụ thể, đủ rõ để phát triển trong phần còn lại của đoạn.'),
          reflect('write', 'Write two or three sentences explaining how longer opening hours could help shift workers. Use at least 15 words.',
            'Many shift workers finish after public libraries close. Opening one or two evenings a week would give them a quiet place to study or use the internet after work.',
            'Tự kiểm: bạn đã nêu ai được hưởng lợi, giải thích trở ngại và chỉ ra thay đổi cụ thể chưa?'),
          choice('Which example best supports that argument?', ['The library bought new chairs.', 'Books are available in many languages.', 'A nurse finishing at six could use the library on her way home.'], 2,
            'Ví dụ này minh họa trực tiếp lợi ích của việc mở cửa muộn hơn cho người làm theo ca.'),
        ],
      },
      {
        id: 'routine', skill: 'speaking', title: 'Trả lời và mở rộng', minutes: 4,
        questions: [
          choice('Which answer directly responds to “When do you usually read?” and gives a reason?', ['Most evenings, because reading helps me relax after work.', 'Reading is a popular pastime.', 'I prefer novels to newspapers.'], 0,
            '“Most evenings” trả lời thời điểm; mệnh đề “because” làm rõ lý do.'),
          reflect('speak', 'Do you prefer to study alone or with other people? Give a reason and one example.',
            'I usually study alone because I can set my own pace. For example, I pause recordings and repeat difficult phrases without interrupting anyone else.',
            'Tự kiểm: câu đầu đã trả lời đúng lựa chọn chưa? Ví dụ có bổ sung ý thay vì lặp lại lý do không?'),
          choice('What is a natural way to clarify “I study better in a structured environment”?', ['Can I start the whole test again?', 'I mean a place with a clear timetable, like a class.', 'Structured environment is the same as environment.'], 1,
            '“I mean” rồi giải thích bằng từ đơn giản là một cách làm rõ nghĩa khi cần.'),
        ],
      },
    ],
  },
  {
    id: 'chien-thuat', title: 'Rèn chiến thuật', description: 'Nhận ra bẫy, chọn bằng chứng và tổ chức ý.',
    lessons: [
      {
        id: 'workshop', skill: 'listening', title: 'Nhận ra bẫy đổi ý', minutes: 4,
        audio: 'workshop',
        text: 'We originally booked room fourteen for the photography workshop, but we’ve moved it to room forty because it has better lighting. You don’t need to bring a camera; there are enough for everyone. Please bring a notebook, though. The session starts at half past two. If you arrive early, wait near the stairs rather than outside the room.',
        questions: [
          gap('Which room is the workshop in now? Write the room number in digits.', ['40'],
            '“Originally” giới thiệu phương án cũ; sau “but” mới là phòng được dùng: room forty.'),
          choice('What should participants bring?', ['A camera', 'A desk lamp', 'A notebook'], 2,
            'Máy ảnh có sẵn. Từ “though” đánh dấu điều cần mang thật sự: sổ tay.'),
          choice('Where should early arrivals wait?', ['Near the stairs', 'Outside the room', 'At the entrance'], 0,
            '“Rather than” đối chiếu địa điểm đúng “near the stairs” với địa điểm bị loại “outside the room”.'),
        ],
      },
      {
        id: 'bus', skill: 'reading', title: 'Đúng, Sai hay Không có thông tin?', minutes: 5,
        text: 'In May, Norwick introduced a temporary weekend bus service to its coastal park. Passenger numbers exceeded expectations on the first two weekends. However, the town has not decided whether to keep the service after September. Weekday buses continue to run on the existing timetable.',
        questions: [
          choice('Passenger numbers were higher than expected on the first two weekends.', ['True', 'False', 'Not Given'], 0,
            '“Exceeded expectations” có nghĩa là vượt mức dự kiến, đúng với phát biểu.'),
          choice('The town has already decided to keep the weekend service after September.', ['True', 'False', 'Not Given'], 1,
            'Đoạn văn nói rõ “has not decided”, trái với “has already decided”.'),
          choice('Most passengers on the weekend buses were tourists.', ['True', 'False', 'Not Given'], 2,
            'Bài đọc cho biết số lượng, không cho biết ai là hành khách. Không suy diễn từ địa điểm ven biển.'),
        ],
      },
      {
        id: 'overview', skill: 'writing', title: 'Viết phần tổng quan', minutes: 5,
        text: 'Share of town commuters who cycled to work: Hillford, 12% in 2015 and 25% in 2025. Eastbridge, 24% in 2015 and 26% in 2025. Westly, 20% in 2015 and 15% in 2025.',
        questions: [
          choice('Which statement identifies the greatest increase?', ['Westly increased by five percentage points.', 'Hillford increased by thirteen percentage points.', 'Eastbridge increased by twenty-six percentage points.'], 1,
            'Hillford tăng từ 12% lên 25%, tức 13 điểm phần trăm, nhiều hơn Eastbridge (2 điểm).'),
          reflect('write', 'Write a two-sentence overview comparing the main trends. Use at least 15 words.',
            'Overall, cycling became more common in Hillford and Eastbridge, while its share fell in Westly. Hillford recorded by far the largest increase over the period.',
            'Tự kiểm: bạn đã nêu cả xu hướng tăng và giảm, đồng thời chọn đặc điểm nổi bật thay vì liệt kê tất cả số liệu chưa?'),
          choice('Which phrasing reports the change in Westly accurately?', ['It rose from 15% to 20%.', 'It dropped by 15 percentage points.', 'It fell from 20% to 15%.'], 2,
            'Sau “from” là số ban đầu, sau “to” là số cuối. “By” phải đi với mức thay đổi, ở đây là 5 điểm phần trăm.'),
        ],
      },
      {
        id: 'story', skill: 'speaking', title: 'Kể chuyện có cấu trúc', minutes: 5,
        questions: [
          choice('Which opening sets the scene for a talk about a memorable journey?', ['Last summer, my sister and I took a slow train along the coast.', 'Journeys are good, and travel is good too.', 'In conclusion, the view was memorable.'], 0,
            'Câu mở cho người nghe biết thời gian, người tham gia và bối cảnh.'),
          reflect('speak', 'Describe a journey you remember well. Say where you went, who you went with, and why it was memorable.',
            'Last summer, my sister and I took a train along the coast. At first it was foggy, but the sky cleared just as we reached a stretch of cliffs. I still remember how the whole carriage went quiet to look.',
            'Tự kiểm: kể theo trình tự dễ theo dõi, có một chi tiết cụ thể và kết lại bằng lý do bạn nhớ chuyến đi.'),
          choice('Which phrase signals the turning point in a spoken story?', ['For instance, the tickets had numbers.', 'Then something unexpected happened.', 'There are advantages on both sides.'], 1,
            'Thay vì kể một danh sách, hãy dùng dấu hiệu chuyển ý như “Then something unexpected happened”.'),
        ],
      },
    ],
  },
  {
    id: 'van-dung', title: 'Vận dụng linh hoạt', description: 'Làm việc với lập luận và ngữ liệu học thuật.',
    lessons: [
      {
        id: 'trees', skill: 'listening', title: 'Theo dõi bài nói học thuật', minutes: 5,
        audio: 'trees',
        text: 'Our study compared streets with and without trees. First, we measured surface temperatures in the afternoon. Shaded pavements were cooler, but the difference varied across streets. We had expected tree height to be the main factor. In fact, canopy width was more important. Next year, we plan to check whether these results hold in drier neighbourhoods.',
        questions: [
          choice('Which result surprised the researchers?', ['No paved areas were cooler.', 'Tree height was the only factor.', 'Canopy width mattered more than tree height.'], 2,
            '“We had expected” nêu giả thuyết; “In fact” báo hiệu kết quả khác với dự đoán.'),
          gap('Complete in ONE WORD from the recording: Temperatures were measured in the ___.', ['afternoon'],
            'Cụm “in the afternoon” cho biết thời điểm đo. Câu hỏi chỉ cần một từ.'),
          choice('What will the researchers do next year?', ['Test their findings in drier neighbourhoods', 'Replace pavements with grass', 'Measure the height of only the tallest tree'], 0,
            'Câu cuối nêu bước tiếp theo: kiểm tra xem kết quả có đúng ở các khu vực khô hơn không.'),
        ],
      },
      {
        id: 'headings', skill: 'reading', title: 'Ghép tiêu đề với đoạn văn', minutes: 5,
        text: 'A. The first seaweed farms in this bay used floating ropes. Fishers adapted equipment they already had, which helped keep start-up costs relatively low.\n\nB. A recent storm damaged several farms. Producers now spread their ropes across separate sites, making it less likely that one storm will ruin an entire crop.\n\nC. Researchers are studying whether the farms affect local wildlife. The early data are promising, but the project will continue for several seasons before any conclusion is drawn.',
        questions: [
          choice('Which heading best fits paragraph A?', ['Reducing losses from storms', 'Getting started with familiar equipment', 'An unexpected market for seaweed'], 1,
            'Đoạn A tập trung vào cách tái sử dụng thiết bị sẵn có để bắt đầu với chi phí thấp.'),
          choice('Which heading best fits paragraph B?', ['Reducing the risk of losing an entire crop', 'Choosing a new rope material', 'Making an early profit'], 0,
            'Bão là bối cảnh; ý chính là chia các khu nuôi để tránh mất toàn bộ sản lượng cùng lúc.'),
          choice('Which heading best fits paragraph C?', ['An immediate improvement in wildlife', 'Why monitoring has been abandoned', 'An environmental question still being studied'], 2,
            'Dữ liệu ban đầu chưa đủ để kết luận. Tiêu đề phải phản ánh mức độ chắc chắn của đoạn.'),
        ],
      },
      {
        id: 'views', skill: 'writing', title: 'Cân nhắc hai quan điểm', minutes: 5,
        questions: [
          choice('A task says: “Discuss both views and give your own opinion.” What must the response do?', ['Explain one view but leave the other in the introduction.', 'Discuss both views and make the writer’s position clear.', 'List facts without giving an opinion.'], 1,
            'Đề có hai yêu cầu: phân tích cả hai quan điểm và nói rõ lập trường của người viết.'),
          reflect('write', 'Some people favour free public transport, while others think passengers should pay. Write an introduction stating your position in at least 15 words.',
            'Opinions differ over whether public transport should be free or funded partly by fares. Although free travel can improve access, I favour low fares with exemptions for passengers who need them.',
            'Tự kiểm: phần mở bài có giới thiệu cả hai phía và cho thấy bạn ủng hộ phương án nào không?'),
          choice('Which argument acknowledges a benefit before explaining a limitation?', ['Free transport is always better in every respect.', 'Some people travel on buses.', 'Free fares can improve access, but they do not make a slow service more reliable.'], 2,
            'Cấu trúc nhượng bộ cho thấy bạn đã cân nhắc cả lợi ích lẫn giới hạn của chính sách.'),
        ],
      },
      {
        id: 'discussion', skill: 'speaking', title: 'Phát triển ý trong thảo luận', minutes: 5,
        questions: [
          choice('Which reply develops a reason for making city centres more walkable?', ['Wider pavements could encourage short trips on foot because pedestrians would have more space.', 'I walk sometimes, yes.', 'City centres are in cities.'], 0,
            'Câu trả lời nối thay đổi cụ thể (vỉa hè rộng) với tác động và nguyên nhân.'),
          reflect('speak', 'Should cities restrict private cars in city centres? Explain one benefit and one possible drawback.',
            'Restrictions could make the air cleaner in busy streets. However, people who work late may struggle to get home if public transport stops early. I would improve evening services before introducing a ban.',
            'Tự kiểm: nêu một lợi ích, một bất lợi và điều kiện cụ thể để cân bằng hai phía.'),
          choice('Which phrase introduces an example rather than another claim?', ['On the other hand,', 'For example,', 'To conclude,'], 1,
            '“For example” báo hiệu minh họa. Chỉ dùng từ nối nếu đúng với quan hệ giữa các ý.'),
        ],
      },
    ],
  },
];

export const lessons = units.flatMap(unit => unit.lessons);
export const questionId = (lesson, index) => `${lesson.id}-${index + 1}`;
export const objective = question => ['choice', 'gap'].includes(question.kind);
export const reviewable = lessons.flatMap(lesson => lesson.questions
  .map((question, index) => ({ id: questionId(lesson, index), question, lesson }))
  .filter(item => objective(item.question)));
