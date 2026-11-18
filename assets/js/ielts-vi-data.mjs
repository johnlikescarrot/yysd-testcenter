/** Original, short practice questions. These are not official IELTS questions. */
export const lessons = [
  {
    id: 'vocabulary',
    title: 'Từ vựng học thuật',
    label: 'TỪ VỰNG',
    description: 'Hiểu từ qua ngữ cảnh, không chỉ học thuộc nghĩa.',
    questions: [
      {
        id: 'vocab-investigate',
        prompt: 'Chọn từ phù hợp để hoàn thành câu.',
        context: 'The study aims to _____ the effects of air pollution.',
        options: ['investigate', 'decorate', 'postpone'],
        optionLanguage: 'en',
        answer: 0,
        explanation: 'Investigate nghĩa là nghiên cứu hoặc điều tra một vấn đề. Cụm “investigate the effects” thường gặp trong văn học thuật.'
      },
      {
        id: 'vocab-significant',
        prompt: '“A significant increase” có nghĩa là gì?',
        options: ['Một mức tăng đáng kể', 'Một mức giảm nhẹ', 'Một kết quả không rõ ràng'],
        answer: 0,
        explanation: 'Significant thường chỉ điều đáng kể hoặc có ý nghĩa. Trong thống kê, nghĩa cụ thể phụ thuộc vào ngữ cảnh.'
      },
      {
        id: 'vocab-suggest',
        prompt: 'Từ nào gần nghĩa nhất với “suggest” trong câu sau?',
        context: 'The results suggest a possible link between sleep and memory.',
        options: ['indicate', 'prove conclusively', 'ignore'],
        optionLanguage: 'en',
        answer: 0,
        explanation: 'Ở đây, suggest gần nghĩa với indicate: kết quả cho thấy khả năng có liên hệ, nhưng không tự chứng minh quan hệ nhân quả.'
      },
      {
        id: 'vocab-mitigate',
        prompt: 'Trong câu sau, “mitigate” nghĩa là gì?',
        context: 'Planting trees can help mitigate the effects of urban heat.',
        options: ['Làm giảm tác động', 'Đo chính xác', 'Làm tăng tốc độ'],
        answer: 0,
        explanation: 'Mitigate là làm giảm mức độ nghiêm trọng của một vấn đề hoặc tác động bất lợi.'
      }
    ]
  },
  {
    id: 'reading',
    title: 'Đọc và tìm bằng chứng',
    label: 'ĐỌC HIỂU',
    description: 'Phân biệt thông tin có trong bài và điều chưa được đề cập.',
    questions: [
      {
        id: 'read-streets',
        prompt: '“The town planted trees along two streets.”',
        context: 'In 2018, a town planted trees along two streets. Three years later, residents reported cooler summer afternoons. The study did not measure changes in air quality.',
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        optionLanguage: 'en',
        answer: 0,
        explanation: 'Đoạn văn nói rõ cây được trồng dọc theo hai con phố. Vì vậy thông tin là TRUE.'
      },
      {
        id: 'read-air',
        prompt: '“Air quality improved after the trees were planted.”',
        context: 'In 2018, a town planted trees along two streets. Three years later, residents reported cooler summer afternoons. The study did not measure changes in air quality.',
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        optionLanguage: 'en',
        answer: 2,
        explanation: 'Nghiên cứu không đo chất lượng không khí. Không có đủ bằng chứng để khẳng định chất lượng đã cải thiện hay không.'
      },
      {
        id: 'read-summer',
        prompt: '“Residents reported cooler summer afternoons.”',
        context: 'In 2018, a town planted trees along two streets. Three years later, residents reported cooler summer afternoons. The study did not measure changes in air quality.',
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        optionLanguage: 'en',
        answer: 0,
        explanation: 'Ý này được nêu trực tiếp trong câu thứ hai. Chú ý “reported” cho biết đó là nhận xét của cư dân.'
      },
      {
        id: 'read-date',
        prompt: 'Theo đoạn văn, cây được trồng vào năm nào?',
        context: 'In 2018, a town planted trees along two streets. Three years later, residents reported cooler summer afternoons. The study did not measure changes in air quality.',
        options: ['2018', '2021', 'Không được đề cập'],
        answer: 0,
        explanation: 'Câu đầu tiên cho biết thời điểm trồng cây là năm 2018. Ba năm sau là thời điểm cư dân đưa ra nhận xét.'
      }
    ]
  },
  {
    id: 'writing',
    title: 'Viết rõ ràng hơn',
    label: 'VIẾT',
    description: 'Luyện cấu trúc câu và cách trình bày ý chính.',
    questions: [
      {
        id: 'write-agreement',
        prompt: 'Chọn cách viết đúng để hoàn thành câu.',
        context: 'The proportion of students _____ from 20% to 35%.',
        options: ['increased', 'increase', 'were increased'],
        optionLanguage: 'en',
        answer: 0,
        explanation: 'Chủ ngữ “the proportion” là số ít; câu mô tả thay đổi trong quá khứ dùng “increased”.'
      },
      {
        id: 'write-although',
        prompt: 'Chọn từ nối thể hiện sự tương phản.',
        context: '_____ public transport is convenient, some commuters prefer to drive.',
        options: ['Although', 'Because', 'Therefore'],
        optionLanguage: 'en',
        answer: 0,
        explanation: 'Although nối hai mệnh đề có ý tương phản. Không thêm “but” vào mệnh đề còn lại trong cấu trúc này.'
      },
      {
        id: 'write-solution',
        prompt: 'Chọn câu đúng và tự nhiên nhất.',
        options: ['One possible solution is to invest in public transport.', 'One possible solution is invest in public transport.', 'One possible solution are investing public transport.'],
        optionLanguage: 'en',
        answer: 0,
        explanation: 'Sau “one possible solution is”, cấu trúc “to + động từ” phù hợp; “invest in” cần giới từ in.'
      },
      {
        id: 'write-overview',
        prompt: 'Trong IELTS Academic Writing Task 1, phần tổng quan nên làm gì?',
        options: ['Nêu những đặc điểm hoặc xu hướng chính', 'Liệt kê mọi con số trong biểu đồ', 'Nêu quan điểm cá nhân không liên quan'],
        answer: 0,
        explanation: 'Phần tổng quan cần làm nổi bật những đặc điểm chính; chọn lọc số liệu để hỗ trợ thay vì liệt kê tất cả.'
      }
    ]
  },
  {
    id: 'listening',
    title: 'Nghe từ và con số',
    label: 'NGHE',
    description: 'Luyện nhận diện thông tin ngắn bằng giọng đọc của thiết bị.',
    questions: [
      {
        id: 'listen-time',
        prompt: 'Thư viện mở cửa lúc mấy giờ?',
        audio: 'The library opens at nine thirty in the morning.',
        options: ['9:30 a.m.', '9:13 a.m.', '10:30 a.m.'],
        optionLanguage: 'en',
        answer: 0,
        explanation: '“Nine thirty” là 9 giờ 30. Để ý sự khác biệt giữa “thirteen” và “thirty”.'
      },
      {
        id: 'listen-day',
        prompt: 'Cuộc họp được chuyển sang thứ mấy?',
        audio: 'The meeting has been moved to Thursday.',
        options: ['Thursday', 'Tuesday', 'Wednesday'],
        optionLanguage: 'en',
        answer: 0,
        explanation: 'Người nói dùng “moved to Thursday”: cuộc họp được chuyển sang thứ Năm.'
      },
      {
        id: 'listen-price',
        prompt: 'Chi phí cho mỗi người là bao nhiêu?',
        audio: 'The workshop costs fifteen pounds per person.',
        options: ['£15', '£50', '£5'],
        answer: 0,
        explanation: '“Fifteen pounds per person” là 15 bảng Anh mỗi người. So sánh cách nhấn âm của fifteen và fifty.'
      },
      {
        id: 'listen-deadline',
        prompt: 'Hạn nộp biểu mẫu là khi nào?',
        audio: 'Please submit the form by Friday afternoon.',
        options: ['Chiều thứ Sáu', 'Sáng thứ Sáu', 'Chiều thứ Hai'],
        answer: 0,
        explanation: '“By Friday afternoon” cho biết cần nộp trước hoặc vào chiều thứ Sáu.'
      }
    ]
  }
];

export const allQuestions = lessons.flatMap((lesson) => lesson.questions);

export function findLesson(id) {
  return lessons.find((lesson) => lesson.id === id);
}
