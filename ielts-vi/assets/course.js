import { honeybees } from './honeybees.js';
import { dailyQuestions } from './daily.js';

export const skills = {
  listen: { name: 'Nghe', icon: 'headphones' },
  read: { name: 'Đọc', icon: 'book' },
  write: { name: 'Viết', icon: 'pen' },
  speak: { name: 'Nói', icon: 'mic' },
};

const choice = (prompt, options, answer, explanation) => ({
  type: 'choice', prompt, options, answer, explanation,
});
const fill = (prompt, answers, explanation) => ({ type: 'fill', prompt, answers, explanation });
const write = (prompt, minimum, example, checklist) => ({
  type: 'write', prompt, minimum, example, checklist,
});
const speak = (prompt, example, checklist) => ({ type: 'speak', prompt, example, checklist });

export const units = [
  {
    id: 'foundation', title: 'Nắm chắc nền tảng', label: 'Khởi động',
    summary: 'Nhận diện thông tin chính và trả lời có căn cứ.',
    lessons: [
      {
        id: 'booking', skill: 'listen', title: 'Nghe một cuộc đặt chỗ', minutes: 4,
        description: 'Phân biệt thông tin ban đầu và chi tiết được sửa lại.',
        instruction: 'Đọc câu hỏi trước, sau đó nghe thông báo ngắn. Chú ý khi người nói tự sửa thông tin.',
        context: {
          audio: 'booking.mp3',
          text: 'Hello, this is Maya from Northgate Library, calling about your photography workshop. Your booking was originally for Thursday, but the tutor is unavailable then, so we have moved it to Friday. Please arrive at quarter past six. The class starts at half past six. You do not need to bring a camera, but please bring a notebook. If you are coming by bus, use the entrance on Park Street, not the main entrance.',
        },
        questions: [
          choice('What day will the workshop take place?', ['Thursday', 'Friday', 'Saturday'], 1,
            'Lịch ban đầu là thứ Năm. Cụm “we have moved it to” báo hiệu lịch mới là thứ Sáu.'),
          choice('What time should visitors arrive?', ['6:15', '6:30', '6:45'], 0,
            '“Quarter past six” nghĩa là 6 giờ 15. Lớp bắt đầu lúc 6 giờ 30, nhưng câu hỏi hỏi giờ đến.'),
          fill('Bring a ______. (ONE WORD ONLY)', ['notebook'],
            'Sau “but please bring”, người nói nêu vật cần mang là sổ ghi chép, không phải máy ảnh.'),
        ],
      },
      {
        id: 'shade', skill: 'read', title: 'Đọc để tìm bằng chứng', minutes: 5,
        description: 'Phân biệt thông tin đúng, sai và không được nêu.',
        instruction: 'Chọn “True” nếu văn bản xác nhận, “False” nếu văn bản bác bỏ và “Not given” nếu thiếu bằng chứng.',
        context: {
          text: 'In 2022, two city schools planted rows of young trees next to their playgrounds. Researchers measured surface temperatures at noon, comparing the shaded areas with nearby ground in direct sun. On hot days, shaded surfaces were up to six degrees cooler. The team did not measure indoor temperatures. The schools are now considering adding trees to their car parks, but no decision has been made.',
        },
        questions: [
          choice('The researchers compared surfaces in shade and in direct sunlight.', ['True', 'False', 'Not given'], 0,
            'Câu thứ hai nêu rõ hai khu vực được so sánh. “Direct sunlight” diễn đạt lại “direct sun”.'),
          choice('The team measured temperatures inside school buildings.', ['True', 'False', 'Not given'], 1,
            'Văn bản nói rõ nhóm nghiên cứu không đo nhiệt độ trong nhà, nên nhận định bị bác bỏ.'),
          choice('Parents paid for the young trees.', ['True', 'False', 'Not given'], 2,
            'Đoạn văn không cho biết cây do ai chi trả. Không suy đoán nguồn kinh phí.'),
        ],
      },
      {
        id: 'overview', skill: 'write', title: 'Viết câu tổng quan', minutes: 5,
        description: 'Chọn điểm nổi bật khi tóm tắt số liệu.',
        instruction: 'Đây là bài nhỏ của phần Viết 1. Tìm xu hướng và điểm đối lập, không cần liệt kê mọi số liệu.',
        context: { text: 'Share of commuters cycling to work: Riverside rose from 12% in 2015 to 24% in 2025. Hilltown fell from 18% to 15% over the same period.' },
        questions: [
          choice('Which sentence gives a useful overview?', [
            'The chart was published in 2025.',
            'In 2015, cycling accounted for 12% in Riverside.',
            'Cycling became more common in Riverside but less common in Hilltown.',
          ], 2, 'Câu tổng quan nêu cả hai xu hướng trái chiều, thay vì lặp một chi tiết riêng lẻ.'),
          choice('Which comparison is accurate?', [
            'Riverside overtook Hilltown by 2025.', 'Hilltown doubled its share.', 'Both towns rose by six points.',
          ], 0, 'Riverside từ thấp hơn (12% so với 18%) thành cao hơn (24% so với 15%).'),
          write('Write an overview comparing the two trends.', 12,
            'Overall, cycling to work became much more common in Riverside, while its share fell slightly in Hilltown.',
            ['Tóm tắt cả hai nơi.', 'Dùng từ chỉ hướng thay đổi chính xác.', 'Không thêm nguyên nhân ngoài số liệu.']),
        ],
      },
      {
        id: 'routine', skill: 'speak', title: 'Nói về thói quen', minutes: 4,
        description: 'Mở rộng câu trả lời bằng lý do và ví dụ.',
        instruction: 'Trả lời trực tiếp trước, rồi thêm một chi tiết thật. Ví dụ chỉ là gợi ý; không cần học thuộc.',
        questions: [
          choice('How do you usually get to school or work?', [
            'Transport is an important social issue.',
            'I usually take the bus because I can read on the way.',
            'The bus station opens at six, I think.',
          ], 1, 'Câu trả lời trực tiếp nêu phương tiện, sau đó phát triển bằng lý do phù hợp.'),
          choice('Which sentence adds a concrete example?', [
            'Reading is generally an excellent activity.',
            'As I said, I can read on the way.',
            'Yesterday I finished a short article before my stop.',
          ], 2, 'Chi tiết về chuyến đi hôm qua cho người nghe một ví dụ cụ thể thay vì lặp ý.'),
          speak('What is one part of your daily routine that you enjoy, and why?',
            'I enjoy walking home after work. It gives me time to clear my head. Last Thursday, I took a different route and found a quiet park near my flat.',
            ['Trả lời thẳng vào câu hỏi.', 'Nói lý do rõ ràng.', 'Thêm một chi tiết cụ thể mà không đọc câu mẫu.']),
        ],
      },
    ],
  },
  {
    id: 'strategies', title: 'Luyện chiến lược', label: 'Vào guồng',
    summary: 'Theo dõi cách diễn đạt lại và phát triển lập luận.',
    lessons: [
      {
        id: 'repair', skill: 'listen', title: 'Nghe ý chính và chi tiết', minutes: 5,
        description: 'Nhận ra cách diễn đạt lại trong một thông báo.',
        instruction: 'Lần đầu, xác định mục đích của thông báo. Sau khi trả lời, đối chiếu cách diễn đạt trong bản chép.',
        context: {
          audio: 'repair.mp3',
          text: 'Welcome to the community repair day. We are not here just to fix broken items. The aim is to show people how to make simple repairs themselves. You can bring a lamp or a small piece of furniture, but please leave bicycles at home this time. We have only one electrician today, so electrical items may take longer. While you wait, a volunteer can help you learn how to sew on a button.',
        },
        questions: [
          choice('What is the main aim of the event?', [
            'To sell repaired furniture', 'To collect old bicycles', 'To teach visitors basic repair skills',
          ], 2, '“Show people how to make simple repairs themselves” có nghĩa là dạy kỹ năng tự sửa chữa.'),
          choice('Which items should visitors not bring?', ['Bicycles', 'Lamps', 'Small furniture'], 0,
            '“Leave bicycles at home” là cách nói gián tiếp rằng không được mang xe đạp.'),
          fill('There is only one ______ at the event. (ONE WORD ONLY)', ['electrician'],
            '“Only one electrician” giải thích vì sao đồ điện có thể phải chờ lâu hơn.'),
        ],
      },
      {
        id: 'seeds', skill: 'read', title: 'Ghép tiêu đề với đoạn văn', minutes: 5,
        description: 'Tách thông điệp chung khỏi ví dụ minh họa.',
        instruction: 'Tóm tắt mỗi đoạn trong vài từ trước khi nhìn các phương án. Đừng chọn chỉ vì thấy từ khóa trùng.',
        context: {
          text: 'A. Seed banks keep samples of crops so that varieties can be recovered in the future. To keep most samples viable, staff first remove moisture and then store the seeds at low temperatures. Each packet carries a code linking it to collection data.\n\nB. Cold storage is useful, but not every seed tolerates drying. Some tropical species need a different method. Researchers may preserve plant tissues instead, an approach that takes more specialist equipment.',
        },
        questions: [
          choice('Which is the best heading for paragraph A?', [
            'When cold storage is unsuitable', 'How seed banks prepare samples for storage', 'Why labels should be removed',
          ], 1, 'Đoạn A mô tả quy trình chính: làm khô, bảo quản lạnh và ghi mã nhận diện.'),
          choice('Which is the best heading for paragraph B?', [
            'An alternative for seeds that cannot be dried', 'How to label each packet', 'The advantages of drying all seeds',
          ], 0, 'Đoạn B nói về trường hợp bảo quản lạnh không phù hợp và cách lưu mô thực vật thay thế.'),
          fill('Each seed packet has a ______ linking it to collection data. (ONE WORD ONLY)', ['code'],
            '“A code linking it to collection data” nêu chính xác chi tiết trên gói.'),
        ],
      },
      {
        id: 'argument', skill: 'write', title: 'Xây dựng đoạn lập luận', minutes: 6,
        description: 'Nối quan điểm, lý do và ví dụ trong phần Viết 2.',
        instruction: 'Bài luyện chỉ yêu cầu một đoạn ngắn, không phải bài luận hoàn chỉnh. Tập trung vào một lý do và giải thích vì sao lý do đó hỗ trợ ý kiến.',
        questions: [
          choice('Which thesis answers: “Should cities charge drivers to enter busy centres?”', [
            'Many people have opinions about city life.',
            'City centres can be busy at different times.',
            'Cities should charge drivers at peak times to reduce congestion.',
          ], 2, 'Luận điểm nêu lập trường rõ ràng và một lý do có thể phát triển.'),
          choice('Which example best supports the congestion argument?', [
            'Some cities are famous for museums.',
            'A peak-hour fee can encourage commuters to switch to the train.',
            'Car colours vary from country to country.',
          ], 1, 'Ví dụ chỉ ra cơ chế: một số người đổi phương tiện, nhờ đó lưu lượng xe có thể giảm.'),
          write('Write one paragraph arguing for or against peak-hour road fees.', 28,
            'A peak-hour charge could make bus travel more reliable. If some drivers take the train instead, buses would spend less time in slow traffic. This could make public transport a more practical choice for workers who cannot change their starting times.',
            ['Có một câu chủ đề.', 'Giải thích mối liên hệ giữa nguyên nhân và kết quả.', 'Đưa ví dụ liên quan hoặc nêu giới hạn của lập luận.']),
        ],
      },
      {
        id: 'place', skill: 'speak', title: 'Kể về một địa điểm', minutes: 5,
        description: 'Lập dàn ý bằng từ khóa cho phần Nói 2.',
        instruction: 'Chuẩn bị bằng cụm từ ngắn, rồi nói theo một trình tự dễ theo dõi. Bộ đếm 60 giây chuẩn bị và 120 giây nói chỉ là công cụ luyện.',
        questions: [
          choice('Which notes provide the clearest route through a talk?', [
            'Where it is → when I went → what I saw → why it matters',
            'Beautiful → interesting → very nice → wonderful',
            'A complete script to memorise word for word',
          ], 0, 'Chuỗi “ở đâu → khi nào → thấy gì → vì sao có ý nghĩa” cho bạn một mạch kể tự nhiên.'),
          choice('Which sentence makes a description more precise?', [
            'It is a very good place.', 'I like it for many different reasons.',
            'A footpath leads from the market to a row of small fishing boats.',
          ], 2, 'Chi tiết về lối đi và thuyền giúp người nghe hình dung không gian cụ thể.'),
          speak('Describe a public place you like visiting. Say where it is, what you do there, and why you go back.',
            'There is a small riverside library near my old school. I first went there to borrow a travel guide. Now I go back on Saturday mornings because the upstairs reading room is quiet and overlooks the water.',
            ['Nêu địa điểm từ đầu.', 'Mô tả ít nhất một chi tiết giác quan hoặc hoạt động.', 'Giải thích lý do quay lại thay vì lặp lời khen.']),
        ],
      },
    ],
  },
  {
    id: 'combine', title: 'Vận dụng linh hoạt', label: 'Bứt phá',
    summary: 'Đọc lập luận tinh tế hơn và nói, viết có sắc thái.',
    lessons: [
      {
        id: 'survey', skill: 'listen', title: 'Theo dõi một bài nói học thuật', minutes: 5,
        description: 'Phân biệt thiết kế nghiên cứu, kết quả và giới hạn.',
        instruction: 'Ghi vài từ khóa, nhất là những từ chỉ đối lập hoặc giới hạn. Không cần chép từng câu.',
        context: {
          audio: 'survey.mp3',
          text: 'For this project, our team compared how people found their way through a science museum. One group received a printed map, while the other used a sign at each staircase. Both groups reached the final room in roughly the same time. However, visitors using the signs asked staff for directions less often. We only tested first-time visitors on quiet mornings, so the findings may not apply on crowded weekends.',
        },
        questions: [
          choice('What did the two groups use?', [
            'Maps and an app', 'Printed maps and signs', 'Signs and recorded instructions',
          ], 1, 'Một nhóm được phát bản đồ giấy; nhóm kia dùng biển chỉ dẫn ở cầu thang.'),
          choice('What difference did the team observe?', [
            'Visitors using signs asked for help less often.', 'Visitors using signs arrived much sooner.',
            'Visitors with maps spent more time looking at exhibits.',
          ], 0, 'Từ “however” báo hiệu kết quả đáng chú ý: nhóm xem biển hỏi đường ít hơn, không phải đến nhanh hơn.'),
          fill('The team tested visitors on quiet ______. (ONE WORD ONLY)', ['mornings'],
            'Cụm “on quiet mornings” cho biết thời điểm và cũng là giới hạn của nghiên cứu.'),
        ],
      },
      {
        id: 'lighting', skill: 'read', title: 'Đọc lập luận có điều kiện', minutes: 6,
        description: 'Tìm từ giới hạn phạm vi của một kết luận.',
        instruction: 'Khoanh các cụm chỉ phạm vi, chẳng hạn đối tượng, thời điểm hay điều kiện. Không mở rộng kết luận vượt quá đoạn văn.',
        context: {
          text: 'A council tested motion-sensitive lighting along one residential path. Lamps remained dim until someone approached. Over six weeks, the new lamps used less electricity than lamps on a nearby path that stayed bright all night. The council noted, however, that the trial did not include busy roads. It will keep different lighting systems in use until it can compare them in busier locations.',
        },
        questions: [
          choice('What can be concluded from the trial?', [
            'Motion-sensitive lighting is safer on busy roads.', 'Every street should switch immediately.',
            'The tested lamps used less electricity in the conditions studied.',
          ], 2, 'Đoạn văn cho biết kết quả về điện năng ở một lối đi, không về độ an toàn hay mọi tuyến đường.'),
          choice('Why will the council keep different systems for now?', [
            'It wants to compare them in busier places.', 'The dim lamps used more electricity.',
            'No one used the residential path.',
          ], 0, 'Câu cuối nêu điều kiện trước khi ra quyết định: so sánh ở nơi đông người hơn.'),
          choice('Which phrase most clearly limits the conclusion?', [
            'someone approached', 'did not include busy roads', 'stayed bright all night',
          ], 1, 'Cụm này cho biết môi trường nào chưa được đưa vào thử nghiệm.'),
        ],
      },
      {
        id: 'revision', skill: 'write', title: 'Sửa lập luận và dùng từ chính xác', minutes: 6,
        description: 'Giảm khẳng định tuyệt đối và kiểm tra câu so sánh.',
        instruction: 'Sau khi viết, đọc một lượt để kiểm tra ý và một lượt để kiểm tra ngôn ngữ. Không tự suy ra điểm thi từ bài luyện này.',
        questions: [
          choice('Which claim is cautious enough when evidence comes from one school?', [
            'This trial suggests that later starts may help some pupils.',
            'All pupils do better if school starts later.', 'School schedules always determine exam results.',
          ], 0, '“Suggests”, “may” và “some” phản ánh đúng giới hạn của một thử nghiệm nhỏ.'),
          choice('Which comparison is grammatically complete?', [
            'Bus use was more higher than car use.', 'The share of bus users was higher than.',
            'The share of bus users was higher than that of car users.',
          ], 2, '“That of” thay cho “the share of”, giúp so sánh hai tỷ lệ, không so tỷ lệ với con người.'),
          write('Revise this claim and give a reason: “Working from home is always better for everyone.”', 22,
            'Working from home may suit people who need long periods of concentration. However, new employees may find it easier to ask questions and build relationships in person.',
            ['Giảm khẳng định tuyệt đối.', 'Nêu một trường hợp cụ thể.', 'Thêm điều kiện hoặc trường hợp ngoại lệ có lý.']),
        ],
      },
      {
        id: 'discussion', skill: 'speak', title: 'Bàn luận một vấn đề xã hội', minutes: 5,
        description: 'Nêu quan điểm, cân nhắc ngoại lệ và giải thích.',
        instruction: 'Ở phần Nói 3, thử đi từ ý kiến chung đến ví dụ. Nếu cần thời gian nghĩ, ngắt nhịp ngắn thay vì lặp lại câu hỏi.',
        questions: [
          choice('Which answer offers a balanced opinion about online classes?', [
            'Yes, online classes, yes, I like them.',
            'They can widen access, although some students need a quiet place and reliable internet.',
            'I attended an online class on Tuesday.',
          ], 1, 'Câu trả lời đề cập lợi ích và điều kiện, thay vì đưa trải nghiệm cá nhân thay cho quan điểm chung.'),
          choice('Which follow-up explains the availability of internet as a barrier?', [
            'For example, a weak connection may mean a student misses instructions during a live class.',
            'The internet has many different websites.', 'Some classes are scheduled in the morning.',
          ], 0, 'Ví dụ nối trực tiếp trở ngại kỹ thuật với việc bỏ lỡ chỉ dẫn trên lớp.'),
          speak('How might online learning affect access to education in rural areas?',
            'Online courses can give learners access to teachers who live far away. That matters when the nearest training centre is a long bus ride away. On the other hand, courses that require live video may exclude families with unstable internet. Downloadable lessons could reduce that problem.',
            ['Nêu ít nhất một lợi ích và một giới hạn.', 'Cho ví dụ hoặc mô tả hệ quả.', 'Duy trì tốc độ nói mà người nghe theo kịp.']),
        ],
      },
    ],
  },
  {
    id: 'fieldwork', title: 'Một ngày ở vườn thực nghiệm', label: 'Vận dụng',
    summary: 'Nghe hướng dẫn, đọc nghiên cứu và trình bày điều quan sát được.',
    lessons: [
      {
        id: 'garden-visit', skill: 'listen', title: 'Chuẩn bị cho chuyến thực địa', minutes: 5,
        description: 'Ghi đúng điểm hẹn, dụng cụ và chi tiết cần quan sát.',
        instruction: 'Bạn sắp tham quan một khu vườn. Đọc câu hỏi rồi nghe người phụ trách dặn dò.',
        context: { audio: 'garden.mp3', text: 'Here are the arrangements for our garden visit on Tuesday. We used to meet by the fountain, but the path is closed for repairs. Please wait at the greenhouse instead. We will walk to the flower beds together. You do not need a camera. We have pencils, but please bring a ruler so that you can measure the flowers. Each pair will watch one plant for ten minutes. Count the visits made by insects, not the number of insects. The same bee may return several times.' },
        questions: [
          fill('Meet the group at the ______. (ONE WORD ONLY)', ['greenhouse'],
            'Đài phun nước là điểm hẹn cũ. Sau “instead”, hướng dẫn viên chốt điểm hẹn ở nhà kính.'),
          choice('What does each visitor need to bring?', ['A camera', 'A pencil', 'A ruler'], 2,
            'Không cần máy ảnh, vườn đã có bút chì. Thước là vật người tham gia phải tự mang.'),
          choice('If one bee returns three times, what should the pair record?', ['One plant', 'Three visits', 'Three insects'], 1,
            'Đơn vị quan sát là lượt ghé hoa, không phải số cá thể khác nhau.'),
        ],
      },
      {
        id: 'honeybees', skill: 'read', title: 'Ong mật tìm đường về tổ', minutes: 20,
        description: 'Bài mẫu từ kho YYSD · 4 câu nhận định và 4 câu điền từ.',
        instruction: 'Đọc bài rồi trả lời theo văn bản. Với câu điền khuyết, chỉ dùng MỘT từ trong bài.',
        ...honeybees,
      },
      {
        id: 'observations', skill: 'write', title: 'So sánh số liệu quan sát', minutes: 8,
        description: 'Phân biệt số lượt với số cá thể, mô tả mà không suy diễn.',
        instruction: 'Hai nhóm ghi số lượt côn trùng ghé hoa trong các khoảng quan sát bằng nhau. Đây là bài luyện ngắn, không phải toàn bộ Task 1.',
        context: { text: 'Insect visits in ten minutes\nHerb garden: 12 on Monday, 18 on Friday.\nRose garden: 9 on Monday, 8 on Friday.' },
        questions: [
          choice('Which statement is supported by both sets of figures?', [
            'Both gardens attracted more visits on Friday.', 'The herb garden recorded more visits on both days.', 'There were eighteen different insects on Friday.',
          ], 1, '12 lớn hơn 9 và 18 lớn hơn 8. Bảng đếm lượt ghé, không đếm các cá thể riêng biệt.'),
          fill('The gap between the gardens was ______ visits on Friday. (ONE NUMBER)', ['10'],
            'Lấy số lượt ở vườn rau thơm trừ số lượt ở vườn hồng vào cùng ngày: 18 − 8 = 10.'),
          write('Compare the two gardens in two sentences. Include figures and do not speculate about the cause.', 18,
            'The herb garden recorded more visits on both days, rising from twelve to eighteen. In contrast, the figure for the rose garden fell slightly from nine to eight.',
            ['Dùng đúng đơn vị “visits”.', 'Nêu ít nhất một so sánh có số liệu.', 'Không thêm nguyên nhân mà bảng không cung cấp.']),
        ],
      },
      {
        id: 'outdoors', skill: 'speak', title: 'Kể một lần học ngoài lớp', minutes: 6,
        description: 'Dùng mốc thời gian và ví dụ để tổ chức câu chuyện.',
        instruction: 'Chọn một trải nghiệm thật. Ghi ba từ khóa: nơi chốn, điều bạn làm và điều bạn hiểu ra.',
        questions: [
          choice('Which detail best illustrates learning by observation?', ['The garden is somewhere in my town.',
            'There are many things to learn in life.', 'I counted each visit, then realised one bee could visit twice.'], 2,
          'Chi tiết đếm lượt cho thấy chính xác điều người nói đã làm và phát hiện.'),
          choice('Which phrase introduces a change in understanding?', ['At first I thought …, but then I noticed …',
            'It is located next to …', 'In addition to the ticket price …'], 0,
          'Cặp “at first … but then …” giúp đối chiếu suy nghĩ ban đầu với quan sát sau đó.'),
          speak('Describe a time you learned something outside a classroom. Say where you were, what you did and why it stayed with you.',
            'Last spring I went to a garden with my cousin. I thought counting bees would be easy, but I kept losing track of one that came back to the same flower. My cousin suggested counting visits instead. That small change taught me to decide what I want to measure before I start.',
            ['Người nghe có hình dung được bối cảnh không?', 'Kể lại một hành động cụ thể.', 'Kết thúc bằng điều bạn rút ra từ trải nghiệm.']),
        ],
      },
    ],
  },
];

export const lessons = units.flatMap(({ lessons: unitLessons }) => unitLessons.map((lesson) => ({
  ...lesson,
  questions: lesson.questions.map((question, index) => ({
    ...question, id: `${lesson.id}-${index + 1}`, lessonId: lesson.id,
  })),
})));
const vocabulary = {
  id: 'daily', title: 'Thử thách 5 từ', activityLabel: 'Từ vựng',
  instruction: 'Đọc câu ví dụ tiếng Anh, tự nhớ nghĩa của từ rồi chọn cách hiểu phù hợp nhất.',
  questions: dailyQuestions,
};
export const byLesson = Object.fromEntries([...lessons, vocabulary].map((lesson) => [lesson.id, lesson]));
export const questions = Object.fromEntries(Object.values(byLesson).flatMap((lesson) => lesson.questions
  .map((question) => [question.id, question])));
