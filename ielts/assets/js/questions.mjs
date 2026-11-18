/** Ngân hàng câu hỏi minh hoạ: đề giữ tiếng Anh, giải thích bằng tiếng Việt. */
export const SKILLS = Object.freeze([
  { id: 'listening', name: 'Nghe', icon: '🎧', hint: 'Nhận diện từ khoá và ý chính', color: '#2f5d8a' },
  { id: 'reading', name: 'Đọc', icon: '📖', hint: 'Quét thông tin, phán đoán ý tác giả', color: '#1f6f5f' },
  { id: 'writing', name: 'Viết', icon: '✍️', hint: 'Cấu trúc đoạn, liên kết và từ vựng học thuật', color: '#8a5a2b' },
  { id: 'speaking', name: 'Nói', icon: '🎙️', hint: 'Trả lời tự nhiên, mở rộng ý có chủ đích', color: '#7a3f6b' }
]);

export const QUESTIONS = Object.freeze([
  {
    id: 'L1', skill: 'listening', level: 'B1', tag: 'note-completion',
    prompt: 'The lecture says the library will close early on Friday because of ____.',
    options: ['a staff training session', 'a public holiday', 'building maintenance', 'a power shortage'],
    answer: 0,
    explanation: 'Từ khoá «close early» đi cùng «staff training». Khi nghe, hãy ghi danh từ ngay sau cụm chỉ thời gian; các phương án còn lại là bẫy ngữ nghĩa thường gặp.'
  },
  {
    id: 'L2', skill: 'listening', level: 'B1', tag: 'matching',
    prompt: 'What does the tutor recommend before the field trip?',
    options: ['Reading the safety notes', 'Buying a notebook', 'Booking a bus ticket', 'Emailing the museum'],
    answer: 0,
    explanation: 'Câu hỏi dùng «recommend», bản ghi thường dùng «make sure you ...» thay vì lặp từ. Luyện nhận diện cách diễn đạt lại (paraphrase).'
  },
  {
    id: 'L3', skill: 'listening', level: 'B2', tag: 'multiple-choice',
    prompt: 'The speaker mentions the survey mainly to ____.',
    options: ['criticise earlier research', 'justify a change in method', 'describe a funding source', 'compare two cities'],
    answer: 1,
    explanation: 'Ở mức B2, ý chính thường nằm ở câu chốt sau ví dụ. Đừng chọn phương án chỉ nhắc lại một chi tiết nghe được.'
  },
  {
    id: 'L4', skill: 'listening', level: 'B2', tag: 'map-labelling',
    prompt: 'Where is the new computer room relative to the main hall?',
    options: ['Opposite it', 'Behind it', 'Next to it', 'Two floors above it'],
    answer: 2,
    explanation: 'Với dạng bản đồ, hãy ghi sẵn các cụm vị trí: next to, opposite, behind, on your left. Nghe cả câu chỉnh hướng vì người nói thường tự sửa.'
  },
  {
    id: 'L5', skill: 'listening', level: 'C1', tag: 'inference',
    prompt: 'How does the student feel about the revised deadline?',
    options: ['Relieved but cautious', 'Openly annoyed', 'Completely indifferent', 'Confused about the task'],
    answer: 0,
    explanation: 'Câu hỏi thái độ đòi hỏi nghe ngữ điệu và từ giảm nhẹ («that helps, although ...»). Đây là dạng inferencing khó nhất của Part 3.'
  },
  {
    id: 'L6', skill: 'listening', level: 'A2', tag: 'form-completion',
    prompt: 'What time does the workshop begin?',
    options: ['9.15', '9.50', '10.15', '10.50'],
    answer: 0,
    explanation: 'Phân biệt «nine fifteen» và «nine fifty». Luyện nghe số với nhịp nói tự nhiên, ghi ngay dạng số trước khi chuyển sang câu tiếp theo.'
  },
  {
    id: 'R1', skill: 'reading', level: 'B1', tag: 'true-false-not-given',
    prompt: 'Passage claim: «The programme was extended after its first year.» Text: «Initially planned for twelve months, the scheme continued into a second year.»',
    options: ['True', 'False', 'Not Given'],
    answer: 0,
    explanation: '«Initially planned for twelve months» + «continued into a second year» tương đương «extended after its first year». Không tự suy thêm thông tin.'
  },
  {
    id: 'R2', skill: 'reading', level: 'B1', tag: 'short-answer',
    prompt: 'Which word in the text means «a small but important difference»?',
    options: ['nuance', 'volume', 'margin', 'sequence'],
    answer: 0,
    explanation: 'Dạng tìm từ yêu cầu khớp chính xác từ trong bài. Đọc định nghĩa trước, quét đoạn có cấu trúc định nghĩa, rồi đối chiếu từ loại.'
  },
  {
    id: 'R3', skill: 'reading', level: 'B2', tag: 'matching-headings',
    prompt: 'A paragraph lists three failed trials, then explains what researchers changed. Best heading?',
    options: ['Early funding decisions', 'Lessons from unsuccessful attempts', 'A profile of the lead scientist', 'Future commercial applications'],
    answer: 1,
    explanation: 'Tiêu đề phải bao phủ toàn đoạn. Các thất bại + điều chỉnh = «lessons from unsuccessful attempts»; phương án chỉ nêu một chi tiết là bẫy.'
  },
  {
    id: 'R4', skill: 'reading', level: 'B2', tag: 'sentence-completion',
    prompt: 'The author argues that urban trees mainly improve ____.',
    options: ['property prices', 'thermal comfort', 'traffic flow', 'tourism revenue'],
    answer: 1,
    explanation: 'Tìm cụm «mainly» / «primarily» trong bài để tránh chọn lợi ích được nhắc qua nhưng không phải luận điểm chính.'
  },
  {
    id: 'R5', skill: 'reading', level: 'C1', tag: 'writers-views',
    prompt: 'The writer refers to «a conveniently neat explanation» in order to ____.',
    options: ['endorse it warmly', 'signal mild scepticism', 'introduce a definition', 'apologise for an error'],
    answer: 1,
    explanation: 'Từ «conveniently neat» mang sắc thái hoài nghi. Nhận diện thái độ qua tính từ đánh giá, không chỉ qua nội dung sự thật.'
  },
  {
    id: 'R6', skill: 'reading', level: 'A2', tag: 'scanning',
    prompt: 'A notice says: «Bring a printed copy of your receipt.» What must you bring?',
    options: ['A digital photo', 'A printed receipt', 'Your passport', 'A handwritten note'],
    answer: 1,
    explanation: 'Quét thông tin (scanning): xác định danh từ cần tìm trước, rồi dò mắt theo từ khoá thay vì đọc toàn văn bản.'
  },
  {
    id: 'W1', skill: 'writing', level: 'B1', tag: 'task1-overview',
    prompt: 'Which sentence is the best overview for a line graph with two rising trends?',
    options: ['The first line went up in 1990.', 'Both categories increased overall, with one rising far more sharply.', 'I will describe the graph below.', 'The graph has many numbers.'],
    answer: 1,
    explanation: 'Overview phải khái quát xu hướng chính, không liệt kê số liệu và không lặp lại đề bài.'
  },
  {
    id: 'W2', skill: 'writing', level: 'B1', tag: 'cohesion',
    prompt: 'Choose the most academic linking phrase for an additional supporting point.',
    options: ['And also', 'Moreover', 'By the way', 'Plus'],
    answer: 1,
    explanation: '«Moreover» phù hợp văn phong học thuật; «and also», «plus» thân mật, «by the way» lệch chức năng.'
  },
  {
    id: 'W3', skill: 'writing', level: 'B2', tag: 'task2-thesis',
    prompt: 'A Task 2 prompt asks whether remote work benefits employees. Best thesis?',
    options: ['Remote work is very popular nowadays.', 'I think it is good and bad.', 'Although flexibility saves commuting time, blurred boundaries can erode wellbeing.', 'Many people talked about this topic.'],
    answer: 2,
    explanation: 'Luận điểm tốt có nhượng bộ + lập trường rõ ràng, báo hiệu hai thân bài; tránh phát biểu chung chung hoặc liệt kê cảm nghĩ.'
  },
  {
    id: 'W4', skill: 'writing', level: 'B2', tag: 'lexical-resource',
    prompt: 'Replace the informal phrase «a lot of big problems» in an academic essay.',
    options: ['tons of huge issues', 'numerous substantial challenges', 'many massive things', 'loads of trouble'],
    answer: 1,
    explanation: 'Tiêu chí Lexical Resource ưu tiên collocation tự nhiên và sắc thái trung tính; tránh từ phóng đại và từ đa nghĩa «things».'
  },
  {
    id: 'W5', skill: 'writing', level: 'C1', tag: 'task1-comparison',
    prompt: 'Which comparison is both accurate and concise?',
    options: ['A was slightly higher than B, at 42% compared with 39%.', 'A was much more enormous than B.', 'A and B are extremely different numbers.', 'A is bigger, B is smaller, and that is interesting.'],
    answer: 0,
    explanation: 'So sánh cần định lượng, dùng trạng từ mức độ phù hợp và tránh bình luận cá nhân trong Task 1.'
  },
  {
    id: 'W6', skill: 'writing', level: 'A2', tag: 'punctuation',
    prompt: 'Which sentence is punctuated correctly?',
    options: ['However the results were unclear.', 'However, the results were unclear.', 'However; the results were unclear', 'However the results, were unclear.'],
    answer: 1,
    explanation: 'Sau trạng từ liên kết đầu câu dùng dấu phẩy. Đây là lỗi nhỏ nhưng ảnh hưởng tiêu chí Grammar Range and Accuracy.'
  },
  {
    id: 'S1', skill: 'speaking', level: 'B1', tag: 'part1-extension',
    prompt: '«Do you enjoy cooking?» Which answer best extends naturally?',
    options: ['Yes.', 'Yes, I do, especially at weekends when I have time to try new recipes.', 'Cooking is a thing.', 'I do not know.'],
    answer: 1,
    explanation: 'Part 1 cần trả lời trực tiếp + một chi tiết cụ thể + lý do ngắn. Tránh câu một từ và tránh phát biểu trừu tượng.'
  },
  {
    id: 'S2', skill: 'speaking', level: 'B1', tag: 'part2-structure',
    prompt: 'Best way to use the one-minute preparation in Speaking Part 2?',
    options: ['Write a full script', 'Note four cue-card anchors and one personal example', 'Memorise a model answer', 'Say nothing and improvise'],
    answer: 1,
    explanation: 'Ghi chú theo bốn gợi ý của cue card giúp nói đủ hai phút mà vẫn tự nhiên; viết kịch bản dễ gây ngữ điệu đọc thuộc.'
  },
  {
    id: 'S3', skill: 'speaking', level: 'B2', tag: 'part3-abstract',
    prompt: 'A Part 3 question asks why cities invest in public parks. Strongest opening?',
    options: ['Parks are green.', 'One reason is that accessible green space can reduce pressure on urban health systems.', 'I like parks very much.', 'It depends, maybe.'],
    answer: 1,
    explanation: 'Part 3 đòi hỏi khái quát hoá: nêu nguyên nhân, dùng cấu trúc giả định và từ vựng trừu tượng, không kể chuyện cá nhân.'
  },
  {
    id: 'S4', skill: 'speaking', level: 'B2', tag: 'fluency',
    prompt: 'Which filler is most natural when buying thinking time?',
    options: ['«That is an interesting question — let me think for a moment.»', '«I have no idea at all.»', '«Please wait silently.»', '«Next question.»'],
    answer: 0,
    explanation: 'Chiến lược kéo dài nhịp nói bằng cụm tự nhiên giúp giữ Fluency and Coherence mà không lặp từ vô nghĩa.'
  },
  {
    id: 'S5', skill: 'speaking', level: 'C1', tag: 'pronunciation',
    prompt: 'Which technique most improves intelligibility under time pressure?',
    options: ['Speaking as fast as possible', 'Chunking ideas and stressing key content words', 'Avoiding all pauses', 'Lowering volume at the end of sentences'],
    answer: 1,
    explanation: 'Nhấn từ mang nội dung và chia câu thành cụm ý (chunking) giúp giám khảo theo dõi; tốc độ cao lại làm giảm độ rõ.'
  },
  {
    id: 'S6', skill: 'speaking', level: 'A2', tag: 'part1-frequency',
    prompt: '«How often do you read?» Which is a natural reply?',
    options: ['Every days.', 'Most evenings, usually for about twenty minutes.', 'I am reading very much.', 'Yes, I read.'],
    answer: 1,
    explanation: 'Trả lời tần suất bằng cụm trạng ngữ + khoảng thời gian cụ thể; tránh lỗi «every days» và tránh chỉ đáp «Yes».'
  }
]);

export const PDFS = Object.freeze([
  { id: 'tong-quan', name: 'Tổng quan nghiên cứu IELTS', file: '01-tong-quan-nghien-cuu-ielts.pdf', note: 'Giá trị, độ tin cậy, washback và khung CEFR' },
  { id: 'nghe', name: 'Chiến lược Nghe', file: '02-chien-luoc-nghe.pdf', note: 'Nhận diện, tốc độ, cognitive validity' },
  { id: 'doc', name: 'Chiến lược Đọc', file: '03-chien-luoc-doc.pdf', note: 'Quét, suy luận, từ vựng học thuật' },
  { id: 'viet', name: 'Chiến lược Viết', file: '04-chien-luoc-viet.pdf', note: 'Cấu trúc đoạn, phản hồi và rubric' },
  { id: 'noi', name: 'Chiến lược Nói', file: '05-chien-luoc-noi.pdf', note: 'Tương tác, mở rộng ý, phát âm' },
  { id: 'phuong-phap', name: 'Phương pháp học tập & gamification', file: '06-phuong-phap-hoc-tap.pdf', note: 'Lặp lại ngắt quãng, động lực, đo lường' }
]);

export const ROLEPLAY = Object.freeze({
  examiner: 'Hãy kể về một thói quen giúp bạn học tập tốt hơn.',
  outline: [
    'Chọn một thói quen cụ thể và nói khi nào bạn bắt đầu.',
    'Kể một tình huống nó thực sự giúp ích, có chi tiết thời gian và cảm xúc.',
    'Mở rộng bằng đối chiếu quá khứ – hiện tại, rồi nêu một giới hạn của thói quen ấy.',
    'Kết bằng câu khái quát để chuyển sang câu hỏi Part 3.'
  ]
});

export const SAMPLE_BOARD = Object.freeze([
  { name: 'Bạn', xp: 0, me: true },
  { name: 'Minh Anh', xp: 320, me: false },
  { name: 'Bảo Châu', xp: 285, me: false },
  { name: 'Gia Hân', xp: 240, me: false },
  { name: 'Khôi Nguyên', xp: 180, me: false },
  { name: 'Thảo My', xp: 120, me: false }
]);

export function skillById(id) {
  return SKILLS.find((skill) => skill.id === id) ?? null;
}

export function questionsFor(skill, level = 'all', limit = 5) {
  if (!skillById(skill)) return [];
  const exact = QUESTIONS.filter((q) => q.skill === skill && (level === 'all' || q.level === level));
  const pool = exact.length > 0 ? exact : QUESTIONS.filter((q) => q.skill === skill);
  return pool.slice(0, Math.max(0, limit));
}

export function checkAnswer(question, answer) {
  if (!question) return false;
  return Number(question.answer) === Number(answer);
}

export function explain(question, answer) {
  if (!question) return 'Câu hỏi không tồn tại.';
  const head = checkAnswer(question, answer) ? 'Chính xác!' : 'Chưa đúng — vẫn tiến bộ.';
  return `${head} ${question.explanation}`;
}
