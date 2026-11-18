// Dữ liệu tĩnh của ứng dụng. Mọi chuỗi giao diện đều là tiếng Việt;
// các câu hỏi luyện thi giữ nguyên tiếng Anh như đề thi IELTS thật.
export const MAX_HEARTS = 5;
export const GOALS = [10, 20, 50];
export const INTERVALS = [1, 2, 4, 7, 15, 30, 60, 120];
export const SCHOLAR_CITATION_COUNT = 110;

export const SKILLS = [
  { id: 'nghe', label: 'Nghe', note: 'Listening · 30 phút · 40 câu' },
  { id: 'doc', label: 'Đọc', note: 'Reading · 60 phút · 40 câu' },
  { id: 'viet', label: 'Viết', note: 'Writing · 60 phút · 2 bài' },
  { id: 'noi', label: 'Nói', note: 'Speaking · 11–14 phút · 3 phần' }
];

export const UNITS = [
  { id: 1, skill: 'Đọc', title: 'Nhận diện ý chính', detail: 'Skimming, tiêu đề đoạn và câu chủ đề.' },
  { id: 2, skill: 'Đọc', title: 'Tìm thông tin chi tiết', detail: 'Scanning, True / False / Not Given.' },
  { id: 3, skill: 'Nghe', title: 'Thông tin thực tế', detail: 'Số liệu, tên riêng, biểu mẫu và bản đồ.' },
  { id: 4, skill: 'Nghe', title: 'Ý kiến và thái độ', detail: 'Nghe hội thoại, bài giảng và thảo luận học thuật.' },
  { id: 5, skill: 'Viết', title: 'Task 1: Biểu đồ', detail: 'Mô tả xu hướng, so sánh và tổng quan.' },
  { id: 6, skill: 'Viết', title: 'Task 2: Tiểu luận', detail: 'Lập luận, ví dụ và kết cấu đoạn.' },
  { id: 7, skill: 'Nói', title: 'Part 1–2: Cá nhân', detail: 'Câu trả lời ngắn và bài nói 2 phút.' },
  { id: 8, skill: 'Nói', title: 'Part 3: Thảo luận', detail: 'Mở rộng ý, so sánh và giả định.' }
];

export const QUESTIONS = [
  { id: 'q1', skill: 'Đọc', prompt: 'Choose the word that best completes the sentence: The committee will ___ the proposal next week.', options: ['review', 'revisit to', 'reviewing', 'reviews'], answer: 'review', explainCorrect: 'Sau "will" cần động từ nguyên mẫu không "to": "review" là đáp án đúng.', explainWrong: 'Hãy nhớ: thì tương lai với "will" luôn đi với động từ nguyên mẫu, không thêm -s, -ing hay "to".', xp: 10 },
  { id: 'q2', skill: 'Đọc', prompt: 'In IELTS Reading, "NOT GIVEN" means that the statement ___.', options: ['is directly contradicted', 'has no information in the passage', 'is paraphrased', 'is the main idea'], answer: 'has no information in the passage', explainCorrect: 'NOT GIVEN nghĩa là bài đọc không cung cấp thông tin để khẳng định hay phủ định.', explainWrong: 'Phân biệt: FALSE = thông tin trái ngược; NOT GIVEN = không có thông tin.', xp: 10 },
  { id: 'q3', skill: 'Nghe', prompt: 'Which word is a synonym of "annual" in an IELTS Listening recording?', options: ['yearly', 'monthly', 'daily', 'weekly'], answer: 'yearly', explainCorrect: '"Annual" và "yearly" đều nghĩa là hằng năm — dạng paraphrase rất hay gặp.', explainWrong: 'Bài nghe thường thay từ bằng synonym: annual → yearly.', xp: 10 },
  { id: 'q4', skill: 'Nghe', prompt: 'A speaker says "The lecture finishes at a quarter to five". What time is it?', options: ['16:45', '17:15', '17:45', '16:15'], answer: '16:45', explainCorrect: '"A quarter to five" là 15 phút trước 5 giờ, tức 16:45.', explainWrong: '"A quarter to" = kém 15 phút; "a quarter past" = hơn 15 phút.', xp: 10 },
  { id: 'q5', skill: 'Viết', prompt: 'Which phrase best introduces an overview in Writing Task 1?', options: ['Overall, ...', 'In my opinion, ...', 'To conclude my essay, ...', 'For example, ...'], answer: 'Overall, ...', explainCorrect: '"Overall," là cách chuẩn để mở phần tổng quan của Task 1.', explainWrong: 'Task 1 cần tổng quan khách quan; "In my opinion" dành cho Task 2.', xp: 10 },
  { id: 'q6', skill: 'Viết', prompt: 'Task 2 requires a minimum of how many words?', options: ['150', '200', '250', '300'], answer: '250', explainCorrect: 'Task 2 tối thiểu 250 từ; Task 1 tối thiểu 150 từ.', explainWrong: 'Nhớ cặp số: Task 1 = 150 từ, Task 2 = 250 từ.', xp: 10 },
  { id: 'q7', skill: 'Nói', prompt: 'Which answer best extends a Part 3 response?', options: ['Yes, I do.', 'Yes, and that is mainly because ...', 'I like it.', 'It is fine.'], answer: 'Yes, and that is mainly because ...', explainCorrect: 'Part 3 đánh giá khả năng mở rộng ý: nêu lý do, ví dụ, so sánh.', explainWrong: 'Câu trả lời một từ hoặc một cụm ngắn làm giới hạn band điểm Speaking.', xp: 10 },
  { id: 'q8', skill: 'Từ vựng', prompt: 'Select the academic collocation: "to ___ a significant impact on".', options: ['have', 'make', 'do', 'take'], answer: 'have', explainCorrect: 'Collocation chuẩn: "to have a significant impact on something".', explainWrong: 'Học collocation theo cụm, không dịch từng từ: have an impact on.', xp: 10 },
  { id: 'q9', skill: 'Đọc', prompt: 'The word "mitigate" is closest in meaning to ___.', options: ['worsen', 'reduce', 'ignore', 'measure'], answer: 'reduce', explainCorrect: '"Mitigate" = giảm nhẹ, làm dịu bớt tác động.', explainWrong: 'Từ vựng học thuật hay gặp: mitigate ≈ alleviate ≈ reduce.', xp: 10 },
  { id: 'q10', skill: 'Nghe', prompt: 'In a form-completion task, "postcode SW1A 1AA" is mainly testing ___.', options: ['spelling and letters', 'opinion', 'inference', 'grammar'], answer: 'spelling and letters', explainCorrect: 'Dạng điền biểu mẫu thường kiểm tra chính tả, chữ cái và số.', explainWrong: 'Với mã bưu chính, hãy nghe rõ từng chữ cái và số.', xp: 10 },
  { id: 'q11', skill: 'Viết', prompt: 'Which sentence avoids an over-generalisation in Task 2?', options: ['Everyone agrees that ...', 'Many urban residents tend to ...', 'All people always ...', 'Nobody ever ...'], answer: 'Many urban residents tend to ...', explainCorrect: 'Dùng "many", "tend to" giúp lập luận đo lường được, tránh khái quát hoá.', explainWrong: 'Tránh "all / everyone / always / nobody" nếu không có số liệu.', xp: 10 },
  { id: 'q12', skill: 'Nói', prompt: 'A good Part 2 cue-card answer lasts approximately ___.', options: ['30 seconds', '1 minute', '1–2 minutes', '4 minutes'], answer: '1–2 minutes', explainCorrect: 'Part 2 cho 1 phút chuẩn bị và nói 1–2 phút.', explainWrong: 'Giám khảo sẽ dừng bạn sau 2 phút; hãy luyện đủ độ dài.', xp: 10 }
];

export const LEAGUES = [
  { id: 'dong', name: 'Đồng', min: 0 },
  { id: 'bac', name: 'Bạc', min: 60 },
  { id: 'vang', name: 'Vàng', min: 150 },
  { id: 'ngoc-bich', name: 'Ngọc Bích', min: 300 },
  { id: 'hong-ngoc', name: 'Hồng Ngọc', min: 500 },
  { id: 'luc-bao', name: 'Lục Bảo', min: 800 },
  { id: 'thach-anh', name: 'Thạch Anh Tím', min: 1200 },
  { id: 'ngoc-trai', name: 'Ngọc Trai', min: 1700 },
  { id: 'hac-dieu-thach', name: 'Hắc Diệu Thạch', min: 2300 },
  { id: 'kim-cuong', name: 'Kim Cương', min: 3000 }
];

export const FRIENDS = [
  { name: 'Minh Anh', xp: 240, streak: 21 },
  { name: 'Bảo Châu', xp: 198, streak: 14 },
  { name: 'Đức Khang', xp: 176, streak: 9 },
  { name: 'Hà My', xp: 142, streak: 30 },
  { name: 'Ngọc Linh', xp: 118, streak: 6 },
  { name: 'Quang Huy', xp: 95, streak: 12 },
  { name: 'Thu Trang', xp: 74, streak: 4 },
  { name: 'Văn Nam', xp: 52, streak: 3 }
];

export const BADGES = [
  { id: 'khoi-dau', name: 'Khởi đầu', note: 'Trả lời câu hỏi đầu tiên.', test: (s) => s.answered >= 1 },
  { id: 'chuoi-3', name: 'Giữ nhịp 3 ngày', note: 'Duy trì chuỗi 3 ngày học.', test: (s) => s.streak >= 3 },
  { id: 'muoi-cau', name: 'Chăm chỉ', note: 'Hoàn thành 10 câu hỏi.', test: (s) => s.answered >= 10 },
  { id: 'chinh-xac', name: 'Chuẩn xác', note: 'Đạt 5 câu trả lời đúng.', test: (s) => s.correct >= 5 },
  { id: 'muc-tieu', name: 'Về đích', note: 'Đạt mục tiêu XP trong ngày.', test: (s) => s.xpToday >= GOALS[s.goalIndex] },
  { id: 'on-tap', name: 'Nhớ lâu', note: 'Có ít nhất 3 thẻ ôn tập.', test: (s) => s.cards.length >= 3 },
  { id: 'ban-be', name: 'Cùng nhau', note: 'Bật chuỗi bạn bè.', test: (s) => s.friendStreak },
  { id: 'cap-do', name: 'Lên cấp', note: 'Đạt cấp độ 2.', test: (s) => s.xp >= 100 }
];

export const SCORE_TABLE = [
  { min: 0, score: '0–29', cefr: 'A1', band: '3.0', can: 'Dùng từ và cụm từ đơn giản.' },
  { min: 30, score: '30–59', cefr: 'A2', band: '4.5', can: 'Trò chuyện chủ đề quen thuộc.' },
  { min: 60, score: '60–79', cefr: 'B1 sớm', band: '5.5', can: 'Xử lý tình huống khi đi lại.' },
  { min: 80, score: '80–99', cefr: 'B1 cao', band: '6.0', can: 'Kể chuyện và nêu ý kiến.' },
  { min: 100, score: '100–114', cefr: 'B2 sớm', band: '6.5', can: 'Hiểu tin tức và thảo luận sở thích.' },
  { min: 115, score: '115–129', cefr: 'B2 cao', band: '7.0', can: 'Dùng tiếng Anh trong bối cảnh học thuật.' },
  { min: 130, score: '130–160', cefr: 'C1–C2', band: '8.0', can: 'Diễn đạt sắc thái tinh tế.' }
];

export const PDFS = [
  { file: '01-tong-quan-ielts.pdf', title: 'Tổng quan kỳ thi IELTS và lộ trình tự học', topic: 'Cấu trúc bài thi, band descriptors, chiến lược 12 tuần.' },
  { file: '02-doc-hieu.pdf', title: 'Chiến lược IELTS Reading', topic: 'Skimming, scanning, nhận diện paraphrase và quản trị thời gian.' },
  { file: '03-nghe-hieu.pdf', title: 'Chiến lược IELTS Listening', topic: 'Dự đoán, chính tả, tín hiệu diễn ngôn và xử lý giọng nói.' },
  { file: '04-viet-task-1.pdf', title: 'IELTS Writing Task 1', topic: 'Biểu đồ, tổng quan, ngôn ngữ so sánh và kiểm tra lỗi.' },
  { file: '05-viet-task-2.pdf', title: 'IELTS Writing Task 2', topic: 'Phân tích đề, lập luận, coherence và phản hồi sửa lỗi.' },
  { file: '06-noi.pdf', title: 'IELTS Speaking ba phần', topic: 'Mở rộng câu trả lời, độ trôi chảy và tự đánh giá.' },
  { file: '07-tu-vung-va-on-tap.pdf', title: 'Từ vựng học thuật và ôn tập ngắt quãng', topic: 'Tải trọng nhận thức, collocation, lịch ôn cá nhân hoá.' },
  { file: '08-gamification.pdf', title: 'Gamification và động lực học tập', topic: 'Chuỗi ngày, huy hiệu, giải đấu, tự quyết và dòng chảy.' },
  { file: '09-co-so-khao-thi.pdf', title: 'Cơ sở khoa học của khảo thí ngôn ngữ', topic: 'Độ giá trị, độ tin cậy, washback và khung CEFR.' },
  { file: '10-tai-lieu-tham-khao.pdf', title: 'Tổng hợp trích dẫn học thuật', topic: 'Toàn bộ công trình có liên kết Google Scholar.' }
];
