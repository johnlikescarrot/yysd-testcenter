const paper = (author, year, title, journal, doi) => ({ author, year, title, journal, doi });
const sources = {
  dunlosky: paper('Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T.', 2013,
    'Improving Students’ Learning With Effective Learning Techniques: Promising Directions From Cognitive and Educational Psychology',
    'Psychological Science in the Public Interest, 14(1), 4–58', '10.1177/1529100612453266'),
  roediger: paper('Roediger, H. L., III, & Karpicke, J. D.', 2006,
    'Test-Enhanced Learning: Taking Memory Tests Improves Long-Term Retention',
    'Psychological Science, 17(3), 249–255', '10.1111/j.1467-9280.2006.01693.x'),
  rowland: paper('Rowland, C. A.', 2014, 'The Effect of Testing Versus Restudy on Retention: A Meta-Analytic Review of the Testing Effect',
    'Psychological Bulletin, 140(6), 1432–1463', '10.1037/a0037559'),
  yang: paper('Yang, C., Luo, L., Vadillo, M. A., Yu, R., & Shanks, D. R.', 2021,
    'Testing (Quizzing) Boosts Classroom Learning: A Systematic and Meta-Analytic Review',
    'Psychological Bulletin, 147(4), 399–435', '10.1037/bul0000309'),
  cepeda: paper('Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D.', 2006,
    'Distributed Practice in Verbal Recall Tasks: A Review and Quantitative Synthesis',
    'Psychological Bulletin, 132(3), 354–380', '10.1037/0033-2909.132.3.354'),
  kim: paper('Kim, S. K., & Webb, S.', 2022, 'The Effects of Spaced Practice on Second Language Learning: A Meta-Analysis',
    'Language Learning, 72(1), 269–319', '10.1111/lang.12479'),
  hattie: paper('Hattie, J., & Timperley, H.', 2007, 'The Power of Feedback',
    'Review of Educational Research, 77(1), 81–112', '10.3102/003465430298487'),
  sailer: paper('Sailer, M., & Homner, L.', 2020, 'The Gamification of Learning: A Meta-Analysis',
    'Educational Psychology Review, 32, 77–112', '10.1007/s10648-019-09498-w'),
  nation: paper('Nation, P.', 2007, 'The Four Strands',
    'Innovation in Language Learning and Teaching, 1(1), 2–13', '10.2167/illt039.0'),
  vandergrift: paper('Vandergrift, L., & Tafaghodtari, M. H.', 2010,
    'Teaching L2 Learners How to Listen Does Make a Difference: An Empirical Study',
    'Language Learning, 60(2), 470–497', '10.1111/j.1467-9922.2009.00559.x'),
  jeon: paper('Jeon, E. H., & Yamashita, J.', 2014, 'L2 Reading Comprehension and Its Correlates: A Meta-Analysis',
    'Language Learning, 64(1), 160–212', '10.1111/lang.12034'),
  kang: paper('Kang, E., & Han, Z.', 2015, 'The Efficacy of Written Corrective Feedback in Improving L2 Written Accuracy: A Meta-Analysis',
    'The Modern Language Journal, 99(1), 1–18', '10.1111/modl.12189'),
  lyster: paper('Lyster, R., & Saito, K.', 2010, 'Oral Feedback in Classroom SLA: A Meta-Analysis',
    'Studies in Second Language Acquisition, 32(2), 265–302', '10.1017/S0272263109990520'),
  lee: paper('Lee, J., Jang, J., & Plonsky, L.', 2015, 'The Effectiveness of Second Language Pronunciation Instruction: A Meta-Analysis',
    'Applied Linguistics, 36(3), 345–366', '10.1093/applin/amu040'),
  intentional: paper('Webb, S., Yanagisawa, A., & Uchihara, T.', 2020,
    'How Effective Are Intentional Vocabulary-Learning Activities? A Meta-Analysis',
    'The Modern Language Journal, 104(4), 715–738', '10.1111/modl.12671'),
  incidental: paper('Webb, S., Uchihara, T., & Yanagisawa, A.', 2023,
    'How effective is second language incidental vocabulary learning? A meta-analysis',
    'Language Teaching, 56(2), 161–180', '10.1017/S0261444822000507'),
  encounters: paper('Uchihara, T., Webb, S., & Yanagisawa, A.', 2019,
    'The Effects of Repetition on Incidental Vocabulary Learning: A Meta-Analysis of Correlational Studies',
    'Language Learning, 69(3), 559–599', '10.1111/lang.12343'),
  webb: paper('Webb, S.', 2007, 'The Effects of Repetition on Vocabulary Knowledge',
    'Applied Linguistics, 28(1), 46–65', '10.1093/applin/aml048'),
  recall: paper('Karpicke, J. D., & Roediger, H. L., III', 2008, 'The Critical Importance of Retrieval for Learning',
    'Science, 319(5865), 966–968', '10.1126/science.1152408'),
  extensive: paper('Nakanishi, T.', 2015, 'A Meta-Analysis of Extensive Reading Research',
    'TESOL Quarterly, 49(1), 6–37', '10.1002/tesq.157'),
  strategies: paper('Graham, S., & Perin, D.', 2007, 'A Meta-Analysis of Writing Instruction for Adolescent Students',
    'Journal of Educational Psychology, 99(3), 445–476', '10.1037/0022-0663.99.3.445'),
  self: paper('Panadero, E., Jonsson, A., & Botella, J.', 2017,
    'Effects of self-assessment on self-regulated learning and self-efficacy: Four meta-analyses',
    'Educational Research Review, 22, 74–98', '10.1016/j.edurev.2017.08.004'),
  peer: paper('Vuogan, A., & Li, S.', 2023, 'Examining the Effectiveness of Peer Feedback in Second Language Writing: A Meta-Analysis',
    'TESOL Quarterly, 57(4), 1115–1138', '10.1002/tesq.3178'),
  writers: paper('Biber, D., Nekrasova, T., & Horn, B.', 2011,
    'The Effectiveness of Feedback for L1-English and L2-Writing Development: A Meta-Analysis',
    'ETS Research Report Series, 2011(1), i–99', '10.1002/j.2333-8504.2011.tb02241.x'),
  information: paper('Wisniewski, B., Zierer, K., & Hattie, J.', 2020,
    'The Power of Feedback Revisited: A Meta-Analysis of Educational Feedback Research',
    'Frontiers in Psychology, 10, 3087', '10.3389/fpsyg.2019.03087'),
  format: { title: 'Cấu trúc IELTS Academic', url: 'https://ielts.org/take-a-test/test-types/ielts-academic-test' },
  scoring: { title: 'Mô tả thang điểm Viết và Nói', url: 'https://ielts.org/organisations/ielts-for-organisations/understanding-ielts-scoring/resources-for-setting-your-ielts-scores' },
  samples: { title: 'Câu hỏi mẫu IELTS Academic', url: 'https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test' },
};

const section = (heading, paragraphs, list = []) => ({ heading, paragraphs, list });
export const guides = [
  {
    slug: 'hoc-it-nho-lau', number: '01', title: 'Học ít, nhớ lâu',
    description: 'Lập lịch và tự kiểm tra khi luyện IELTS Academic.',
    sources: ['dunlosky', 'roediger', 'rowland', 'yang', 'cepeda', 'kim', 'hattie', 'sailer'],
    pages: [
      [
        section('1. Tự nhớ trước khi xem đáp án', [
          'Sau một đoạn đọc hoặc đoạn nghe, hãy tạm đóng tài liệu. Viết lại ý chính hoặc thử trả lời từ trí nhớ, rồi đối chiếu với nguồn. Tự kiểm tra và học giãn cách có bằng chứng tốt hơn việc chỉ đọc lại trong nhiều bối cảnh [1]. Thí nghiệm và tổng quan về luyện truy hồi cho thấy lợi ích đối với việc nhớ sau một khoảng thời gian; tổng quan lớp học cũng ghi nhận lợi ích trong nhiều tình huống [2, 3, 4].',
          'Ví dụ: nghe một thông báo rồi ghi địa điểm, giờ tập trung và một thay đổi. Sau khi đối chiếu, tự giải thích vì sao mình chọn giờ cũ thay vì giờ mới.',
        ]),
        section('2. Chia bài ôn thành nhiều lượt', [
          'Luyện rải ra nhiều ngày thường có lợi cho ghi nhớ hơn việc dồn vào một buổi. Khoảng cách phù hợp phụ thuộc tài liệu và thời điểm cần nhớ lại [5, 6].',
          'Sải bước dùng mốc 1, 3, 7, 14 ngày sau các lượt trả lời đúng và ưu tiên câu sai ngay trong lượt ôn tiếp theo. Đây là quy tắc thiết kế đơn giản, không phải công thức tối ưu cho mọi người. Bạn vẫn có thể mở lại bài bất kỳ lúc nào.',
        ]),
        section('3. Biến phản hồi thành việc làm tiếp theo', [
          'Phản hồi hữu ích giúp làm rõ mục tiêu, kết quả hiện tại và bước tiếp theo [7]. Khi làm sai, hãy ghi loại lỗi và một cách sửa có thể thử ở câu mới, thay vì chỉ chép đáp án.',
        ], [
          'Nghe: nhận ra thông tin bị đính chính sau từ chỉ đối lập.',
          'Đọc: chỉ đúng câu làm bằng chứng; nếu không thấy, ghi rõ điều còn thiếu.',
          'Viết và Nói: sửa một điểm cụ thể rồi thử lại với đề khác.',
        ]),
      ],
      [
        section('Một tuần học có thể bắt đầu ngay', [
          'Mỗi buổi dành khoảng 10–20 phút. Thay đổi thứ tự hoặc giảm lượng bài nếu thấy khó duy trì. Khi đã quen bài ngắn, thêm bài mẫu chính thức theo thời gian thật.',
        ], [
          'Ngày 1 · Nghe một lượt và đối chiếu bản chép. Ghi đúng một lỗi nghe.',
          'Ngày 2 · Đọc một đoạn. Với mỗi câu, xác định từ khóa và bằng chứng.',
          'Ngày 3 · Ôn các câu đến hạn. Tự giải thích một lỗi mà không nhìn đáp án.',
          'Ngày 4 · Viết hai câu tổng quan hoặc một đoạn lập luận, rồi sửa theo bảng tự kiểm.',
          'Ngày 5 · Nói về một chủ đề, chuẩn bị bằng từ khóa và thử thêm ví dụ.',
          'Ngày 6 · Làm bài mới ở kỹ năng đang yếu. Đối chiếu lỗi cũ và lỗi mới.',
          'Ngày 7 · Ôn lại, ghi hướng luyện cho tuần sau và dành thời gian nghỉ.',
        ]),
        section('Mẫu nhật ký lỗi', [
          'Ngày ___  |  Kỹ năng ___  |  Câu hoặc dạng bài ___',
          'Mình đã nghĩ gì? ___  |  Bằng chứng hoặc phản hồi ___',
          'Cách sửa có thể thử ở câu tiếp theo ___  |  Ngày tự kiểm lại ___',
        ]),
        section('Dùng điểm để giữ nhịp, không để đo trình độ', [
          'Điểm kinh nghiệm, mục tiêu ngày và huy hiệu giúp bạn nhìn lại thói quen. Tổng quan về trò chơi hóa cho thấy kết quả phụ thuộc cách triển khai và bối cảnh [8]. Điểm luyện trong ứng dụng không tương đương điểm thi IELTS.',
        ]),
      ],
    ],
  },
  {
    slug: 'bon-ky-nang', number: '02', title: 'Chiến lược bốn kỹ năng',
    description: 'Cấu trúc IELTS Academic, bài tập mẫu và bảng tự kiểm.',
    sources: ['format', 'scoring', 'samples', 'nation', 'vandergrift', 'jeon', 'kang', 'lyster', 'lee', 'kim'],
    pages: [
      [
        section('Nhận biết cấu trúc bài thi', [
          'IELTS Academic có bốn phần: Nghe khoảng 30 phút (40 câu); Đọc 60 phút (40 câu); Viết 60 phút (hai bài); Nói 11–14 phút (ba phần) [1]. Nghe và Nói có cùng dạng với hệ Tổng quát, còn Đọc và Viết khác. Kiểm tra hướng dẫn về thời gian chuyển đáp án theo hình thức thi bạn đăng ký.',
          'Lộ trình này bổ sung cho việc làm đề mẫu chính thức [3], không thay thế bài thi. Khi lập kế hoạch, dành thời gian cho đầu vào, diễn đạt, chú ý đến hình thức ngôn ngữ và phát triển độ trôi chảy [4].',
        ]),
        section('Nghe · Kiểm tra dự đoán', [
          'Trước khi nghe, dự đoán loại thông tin cần điền: giờ, địa điểm, tên, số lượng hay danh từ. Sau khi nghe lần đầu, xác định đoạn đã bỏ lỡ; khi luyện ở nhà, có thể nghe lại rồi mới đọc bản chép. Nghiên cứu về dạy nghe theo quy trình gợi ý lợi ích của dự đoán, theo dõi và tự kiểm tra; nghiên cứu này không trực tiếp đo điểm IELTS [5].',
        ], ['Tự kiểm: Mình đã phân biệt được phương án được nhắc đến và phương án cuối cùng chưa?']),
        section('Đọc · Tìm câu làm bằng chứng', [
          'Đọc lướt để hiểu cấu trúc, sau đó quay lại đoạn liên quan. Với dạng đúng, sai hoặc không có thông tin, tìm câu xác nhận hoặc bác bỏ; nếu không có đủ dữ kiện cho cả hai, đừng dùng kiến thức ngoài bài. Vốn từ và ngữ pháp có liên hệ với khả năng đọc hiểu ngôn ngữ thứ hai [6]; mối liên hệ đó không tự chứng minh hiệu quả của một mẹo làm bài.',
        ], ['Tự kiểm: Mình có thể chỉ rõ từ hoặc cụm từ nào giới hạn nhận định không?']),
      ],
      [
        section('Viết · Viết, nhận phản hồi rồi sửa', [
          'Phần 1 yêu cầu ít nhất 150 từ để mô tả thông tin trực quan. Phần 2 cần ít nhất 250 từ và có trọng số lớn hơn. Thử phân bổ khoảng 20 và 40 phút. Đối chiếu bài với các tiêu chí chính thức như đáp ứng yêu cầu, mạch lạc và liên kết, từ vựng, phạm vi và độ chính xác ngữ pháp [1, 2].',
          'Phản hồi sửa lỗi có thể giúp tăng độ chính xác ngữ pháp khi viết bằng ngôn ngữ thứ hai, nhưng hiệu quả thay đổi theo người học, bối cảnh và thể loại [7]. Hãy sửa một lỗi thường gặp trong chính đoạn mình vừa viết, sau đó dùng cấu trúc đã sửa ở đề mới.',
        ], ['Tự kiểm phần 1: Có câu tổng quan, so sánh nổi bật và số liệu đúng không?',
          'Tự kiểm phần 2: Quan điểm có trả lời trực tiếp đề và được giải thích bằng lý do, ví dụ hay không?']),
        section('Nói · Phát triển ý, không học thuộc', [
          'Phần 1 hỏi về chủ đề quen thuộc. Phần 2 cho bạn một phút chuẩn bị rồi nói trong một đến hai phút. Phần 3 thảo luận câu hỏi khái quát hơn [1]. Khi luyện, nói theo từ khóa và thử tự nghe lại hoặc nhờ người khác phản hồi. Hãy đối chiếu với bốn tiêu chí chính thức, trong đó phát âm là một tiêu chí riêng [2].',
          'Nghiên cứu về phản hồi nói và dạy phát âm nhìn chung ủng hộ luyện tập có phản hồi [8, 9]. Làm lại vào ngày khác với chủ đề mới để tập áp dụng chứ không học thuộc câu mẫu [10].',
        ], ['Tự kiểm: Đã trả lời thẳng, giải thích, đưa ví dụ rõ và nói đủ rõ để người khác theo kịp chưa?']),
      ],
    ],
  },
  {
    slug: 'tu-trong-ngu-canh', number: '03', title: 'Từ vựng trong ngữ cảnh',
    description: 'Biến một chi tiết trong bài đọc thành thẻ ôn rồi dùng từ trong câu mới.',
    sources: ['intentional', 'incidental', 'encounters', 'webb', 'recall', 'kim', 'extensive'],
    pages: [
      [
        section('Từ “đã gặp” đến “dùng được”', [
          'Trong bài đọc về ong mật, bạn có thể nhận ra “compass” nhờ từ “sun”. Nhưng nếu che câu gốc, bạn có thể tự viết từ ấy ra không? Nhận diện một từ và tự gọi được từ ấy là hai yêu cầu khác nhau. Các nghiên cứu phân biệt bài kiểm tra nhớ nghĩa với bài kiểm tra tái tạo hình thức từ [1].',
          'Đọc và nghe để hiểu nội dung vẫn tạo cơ hội học từ; không phải từ nào xuất hiện cũng được ghi nhớ. Nên kết hợp tiếp xúc tự nhiên với vài thẻ ôn có chủ đích, thay vì biến mọi câu trong bài thành thẻ [1, 2].',
        ]),
        section('Phiếu thực hành · suy từ ngữ cảnh', [
          'Câu nguồn: “Central to this ability is the bee’s use of the sun as a compass.”',
          'Bước 1: Khoanh cụm “as a compass”. Viết bằng tiếng Việt vai trò của mặt trời trong câu, đừng chỉ dịch từng chữ.',
          'Bước 2: Che câu nguồn. Điền một từ: “The walkers used the stars as a ___.” Sau đó mở lại câu để kiểm tra chính tả và nghĩa.',
          'Bước 3: Viết câu khác trong đó một vật đóng vai trò la bàn. Từ nào giữ nguyên? Chủ thể và bối cảnh nào đã đổi?',
        ]),
        section('Đừng đếm số lần gặp như một lời hứa', [
          'Tần suất gặp từ có liên hệ với việc học từ, nhưng kết quả còn phụ thuộc ngữ cảnh và điều người học đã biết. Biết nghĩa, chính tả và cách dùng không nhất thiết tiến bộ cùng tốc độ [3, 4].',
        ]),
      ],
      [
        section('Tạo một thẻ có thể tự kiểm', [
          'Mặt trước: chép một câu tiếng Anh, bỏ trống đúng một từ. Nếu nhiều đáp án đều hợp lý, ghi thêm ngữ cảnh hoặc chấp nhận nhiều cách viết. Ví dụ, bài đọc chấp nhận cả “polarised” và “polarized”.',
          'Mặt sau: ghi đáp án, nghĩa trong câu và một dấu hiệu giúp bạn suy ra đáp án. Tự trả lời trước khi lật. Trong một thí nghiệm học từ, việc truy hồi nhiều lần đã giúp người học nhớ lâu hơn chỉ tiếp tục học lại sau khi trả lời đúng [5].',
        ]),
        section('Lịch thử trong một tuần', [
          'Ngày đầu: tạo ba thẻ từ bài vừa học. Ngày sau: tự viết đáp án trước khi xem. Vài ngày sau nữa: dùng lại từ trong câu khác. Chọn khoảng cách vừa đủ thử thách; nghiên cứu không đưa ra một lịch tối ưu cho mọi người [6].',
          'Dành một buổi đọc một văn bản vừa sức chỉ vì nội dung thú vị. Đọc mở rộng và luyện từng câu có mục đích khác nhau; các nghiên cứu về đọc mở rộng không có nghĩa là một buổi làm thẻ sẽ làm tăng điểm IELTS [7].',
        ], ['Từ/cụm từ: __________   Câu có chỗ trống: ____________________',
          'Dấu hiệu trong bài: __________   Câu mới của mình: ____________________',
          'Ngày làm lại: __________   Tự nhớ được hay cần gợi ý? __________']),
      ],
    ],
  },
  {
    slug: 'xuong-sua-bai', number: '04', title: 'Xưởng sửa bài Viết',
    description: 'Phiếu luyện Task 1 và Task 2: chẩn đoán một vấn đề, xin phản hồi cụ thể và thử lại.',
    sources: ['format', 'scoring', 'strategies', 'self', 'peer', 'writers', 'kang', 'information'],
    pages: [
      [
        section('Không bắt đầu bằng một con số', [
          'Dùng tiêu chí chính thức để đặt câu hỏi về bài viết của bạn [1, 2], không tự quy đổi số từ hoặc số lỗi thành band. Với Task 1, tìm câu tổng quan; với Task 2, gạch dưới lập trường. Nếu không tìm thấy, đó là việc đầu tiên cần sửa.',
          'Chiến lược lập kế hoạch và chỉnh sửa có cơ sở trong nghiên cứu dạy viết cho thanh thiếu niên [3]. Tự đánh giá có thể hỗ trợ điều tiết việc học [4]. Hai kết quả này không trực tiếp xác nhận một điểm IELTS cho bản nháp của bạn.',
        ]),
        section('Bài thực hành · mô tả mà không suy diễn', [
          'Số lượt côn trùng ghé hoa trong 10 phút: vườn rau thơm 12 rồi 18 lượt; vườn hồng 9 rồi 8 lượt. Hai lần đo diễn ra vào thứ Hai và thứ Sáu.',
          'Nháp: “The new flowers made eighteen different bees come to the herb garden.” Đánh dấu hai suy diễn: dữ liệu không nêu nguyên nhân và không đếm số cá thể.',
          'Sửa: “Visits to the herb garden rose from 12 to 18, whereas the rose garden recorded one fewer visit on Friday.” Giải thích vì sao “visits” chính xác hơn “different bees”.',
        ]),
        section('Làm lại với một bảng số liệu khác', [
          'Khu A: 22 rồi 19 lượt. Khu B: 10 rồi 14 lượt. Viết hai câu so sánh. Bạn có thể dùng cấu trúc đối lập nào mà không thêm nguyên nhân ngoài dữ liệu?',
        ]),
      ],
      [
        section('Task 2 · Nhờ người đọc chỉ đúng chỗ vướng', [
          'Đề luyện: “Should schools offer more lessons outside the classroom?” Viết một đoạn gồm lập trường, lý do và một ví dụ có thể kiểm tra được. Đổi bài với bạn học; đừng yêu cầu bạn chấm band.',
          'Hãy hỏi: “Câu nào khiến bạn hiểu lý do của mình? Ở câu nào bạn cần thêm ví dụ?” Tổng quan về phản hồi đồng đẳng trong viết ngoại ngữ ghi nhận lợi ích rõ hơn ở việc sửa bài đã viết so với viết một bài mới [5].',
        ]),
        section('Từ nhận xét đến hành động', [
          'Phân biệt phản hồi về ý và phản hồi về hình thức. Ví dụ: thêm trường hợp học sinh không thể đi xa để làm rõ giới hạn của lập luận; sau đó kiểm tra chủ ngữ và động từ trong câu mới. Kết quả nghiên cứu thay đổi theo người học, nhiệm vụ và loại phản hồi [6, 7].',
          'Một nhận xét có thông tin cụ thể hữu ích hơn một nhãn chung như “chưa tốt”; giá trị của phản hồi phụ thuộc điều nó chỉ ra và cách người học sử dụng [8]. Hãy sửa một đoạn rồi kiểm tra lại trên đề khác.',
        ], ['Câu ban đầu: ____________________   Vấn đề người đọc chỉ ra: ____________________',
          'Bản sửa: ____________________   Lý do thay đổi: ____________________',
          'Đề luyện tiếp theo: ____________________   Điều cần tự kiểm: ____________________']),
      ],
    ],
  },
].map((guide) => ({ ...guide, sources: guide.sources.map((id) => sources[id]) }));

export const doiLink = (doi) => `https://doi.org/${doi}`;
export const scholarLink = (doi) => `https://scholar.google.com/scholar?q=${encodeURIComponent(doi)}`;
export const citation = (paper) => `${paper.author} (${paper.year}). ${paper.title}. ${paper.journal}.`;
