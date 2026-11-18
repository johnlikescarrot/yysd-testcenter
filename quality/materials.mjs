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
  pan: paper('Pan, S. C., & Rickard, T. C.', 2018, 'Transfer of Test-Enhanced Learning: Meta-Analytic Review and Synthesis',
    'Psychological Bulletin, 144(7), 710–756', '10.1037/bul0000151'),
  nguyen: paper('Nguyen, H. T. M.', 2023,
    'The Washback of the International English Language Testing System (IELTS) as an English Language Proficiency Exit Test on the Learning of Final-Year English Majors',
    'TESL-EJ, 27(2)', '10.55593/ej.27106a8'),
  dalman: paper('Dalman, M., & Plonsky, L.', 2025, 'The Effectiveness of Second-Language Listening Strategy Instruction: A Meta-Analysis',
    'Language Teaching Research, 29(3), 1039–1068', '10.1177/13621688211072981'),
  bax: paper('Bax, S.', 2013, 'The Cognitive Processing of Candidates During Reading Tests: Evidence From Eye-Tracking',
    'Language Testing, 30(4), 441–465', '10.1177/0265532212473244'),
  green: paper('Green, A.', 2007, 'Washback to Learning Outcomes: A Comparative Study of IELTS Preparation and University Pre-Sessional Language Courses',
    'Assessment in Education: Principles, Policy & Practice, 14(1), 75–97', '10.1080/09695940701272880'),
  seedhouse: paper('Seedhouse, P.', 2019, 'The Dual Personality of ‘Topic’ in the IELTS Speaking Test',
    'ELT Journal, 73(3), 247–256', '10.1093/elt/ccz009'),
  format: { title: 'Cấu trúc IELTS Academic', url: 'https://ielts.org/take-a-test/test-types/ielts-academic-test' },
  scoring: { title: 'Mô tả thang điểm Viết và Nói', url: 'https://ielts.org/organisations/ielts-for-organisations/understanding-ielts-scoring/resources-for-setting-your-ielts-scores' },
  samples: { title: 'Câu hỏi mẫu IELTS Academic', url: 'https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test' },
};

const section = (heading, paragraphs, list = []) => ({ heading, paragraphs, list });
export const guides = [
  {
    slug: 'hoc-it-nho-lau', number: '01', title: 'Học ít, nhớ lâu',
    description: 'Lập lịch và tự kiểm tra khi luyện IELTS Academic.',
    sources: ['dunlosky', 'roediger', 'rowland', 'yang', 'pan', 'cepeda', 'kim', 'hattie', 'sailer', 'nguyen'],
    pages: [
      [
        section('1. Tự nhớ trước khi xem đáp án', [
          'Sau một đoạn đọc hoặc đoạn nghe, hãy tạm đóng tài liệu. Viết lại ý chính hoặc thử trả lời từ trí nhớ, rồi đối chiếu với nguồn. Tự kiểm tra và học giãn cách có bằng chứng tốt hơn việc chỉ đọc lại trong nhiều bối cảnh [1]. Thí nghiệm và tổng quan về luyện truy hồi cho thấy lợi ích đối với việc nhớ sau một khoảng thời gian; tổng quan lớp học cũng ghi nhận lợi ích trong nhiều tình huống [2, 3, 4].',
          'Ví dụ: nghe một thông báo rồi ghi địa điểm, giờ tập trung và một thay đổi. Sau khi đối chiếu, tự giải thích vì sao mình chọn giờ cũ thay vì giờ mới. Ở buổi sau, thử một thông báo khác. Phân tích tổng hợp cho thấy việc tự nhớ có thể giúp vận dụng sang câu mới, nhưng mức độ còn tùy độ tương đồng giữa các nhiệm vụ [5].',
        ]),
        section('2. Chia bài ôn thành nhiều lượt', [
          'Luyện rải ra nhiều ngày thường có lợi cho ghi nhớ hơn việc dồn vào một buổi. Khoảng cách phù hợp phụ thuộc tài liệu và thời điểm cần nhớ lại [6, 7].',
          'Sải bước dùng mốc 1, 3, 7, 14 ngày sau các lượt trả lời đúng và ưu tiên câu sai ngay trong lượt ôn tiếp theo. Đây là quy tắc thiết kế đơn giản, không phải công thức tối ưu cho mọi người. Bạn vẫn có thể mở lại bài bất kỳ lúc nào.',
        ]),
        section('3. Biến phản hồi thành việc làm tiếp theo', [
          'Phản hồi hữu ích giúp làm rõ mục tiêu, kết quả hiện tại và bước tiếp theo [8]. Khi làm sai, hãy ghi loại lỗi và một cách sửa có thể thử ở câu mới, thay vì chỉ chép đáp án.',
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
          'Điểm kinh nghiệm, mục tiêu ngày và huy hiệu giúp bạn nhìn lại thói quen. Tổng quan về trò chơi hóa cho thấy kết quả phụ thuộc cách triển khai và bối cảnh [9]. Một khảo sát sinh viên ngành tiếng Anh ở miền Trung Việt Nam ghi nhận cả động lực lẫn áp lực khi dùng IELTS làm chuẩn đầu ra [10]. Nếu bị cuốn vào điểm hoặc chuỗi ngày, hãy đặt một mục tiêu kỹ năng cụ thể, chẳng hạn tìm được bằng chứng cho hai câu Đọc. Điểm luyện trong ứng dụng không tương đương điểm thi IELTS.',
        ]),
      ],
    ],
  },
  {
    slug: 'bon-ky-nang', number: '02', title: 'Chiến lược bốn kỹ năng',
    description: 'Cấu trúc IELTS Academic, bài tập mẫu và bảng tự kiểm.',
    sources: ['format', 'scoring', 'samples', 'nation', 'vandergrift', 'dalman', 'jeon', 'bax', 'kang', 'green', 'lyster', 'lee', 'seedhouse', 'kim'],
    pages: [
      [
        section('Nhận biết cấu trúc bài thi', [
          'IELTS Academic có bốn phần: Nghe khoảng 30 phút (40 câu); Đọc 60 phút (40 câu); Viết 60 phút (hai bài); Nói 11–14 phút (ba phần) [1]. Nghe và Nói có cùng dạng với hệ Tổng quát, còn Đọc và Viết khác. Kiểm tra hướng dẫn về thời gian chuyển đáp án theo hình thức thi bạn đăng ký.',
          'Lộ trình này bổ sung cho việc làm đề mẫu chính thức [3], không thay thế bài thi. Khi lập kế hoạch, dành thời gian cho đầu vào, diễn đạt, chú ý đến hình thức ngôn ngữ và phát triển độ trôi chảy [4].',
        ]),
        section('Nghe · Kiểm tra dự đoán', [
          'Trước khi nghe, dự đoán loại thông tin cần điền: giờ, địa điểm, tên, số lượng hay danh từ. Sau khi nghe lần đầu, xác định đoạn đã bỏ lỡ; khi luyện ở nhà, có thể nghe lại rồi mới đọc bản chép. Một nghiên cứu dạy nghe theo quy trình sử dụng dự đoán, theo dõi và tự kiểm tra [5]. Phân tích tổng hợp cho thấy dạy chiến lược nghe có lợi trung bình, nhưng hiệu quả thay đổi theo cách luyện và bối cảnh [6]. Đây không phải bằng chứng về mức tăng điểm IELTS.',
        ], ['Tự kiểm: Mình đã phân biệt được phương án được nhắc đến và phương án cuối cùng chưa?']),
        section('Đọc · Tìm câu làm bằng chứng', [
          'Đọc lướt để hiểu cấu trúc, sau đó quay lại đoạn liên quan. Với dạng đúng, sai hoặc không có thông tin, tìm câu xác nhận hoặc bác bỏ; nếu không có đủ dữ kiện cho cả hai, đừng dùng kiến thức ngoài bài. Vốn từ và ngữ pháp có liên hệ với khả năng đọc hiểu ngôn ngữ thứ hai [7]. Trong nghiên cứu theo dõi chuyển động mắt khi làm câu hỏi IELTS, người trả lời đúng và sai có cách tìm thông tin khác nhau ở một số dạng câu [8]. Hãy kết hợp tìm vị trí nhanh với đọc kỹ câu chứa bằng chứng, thay vì đoán theo từ khóa trùng.',
        ], ['Tự kiểm: Mình có thể chỉ rõ từ hoặc cụm từ nào giới hạn nhận định không?']),
      ],
      [
        section('Viết · Viết, nhận phản hồi rồi sửa', [
          'Phần 1 yêu cầu ít nhất 150 từ để mô tả thông tin trực quan. Phần 2 cần ít nhất 250 từ và có trọng số lớn hơn. Thử phân bổ khoảng 20 và 40 phút. Đối chiếu bài với các tiêu chí chính thức như đáp ứng yêu cầu, mạch lạc và liên kết, từ vựng, phạm vi và độ chính xác ngữ pháp [1, 2].',
          'Phản hồi sửa lỗi có thể giúp tăng độ chính xác ngữ pháp khi viết bằng ngôn ngữ thứ hai, nhưng hiệu quả thay đổi theo người học, bối cảnh và thể loại [9]. Hãy sửa một lỗi thường gặp trong đoạn vừa viết, sau đó dùng cấu trúc đã sửa ở đề mới.',
          'Một nghiên cứu so sánh các khóa học không thấy lợi thế rõ ràng về điểm Viết khi chỉ tập trung luyện thi so với học viết học thuật [10]. Bên cạnh làm đề mẫu, hãy tập giải thích lý do và dùng ví dụ cụ thể thay cho học thuộc bài mẫu.',
        ], ['Tự kiểm phần 1: Có câu tổng quan, so sánh nổi bật và số liệu đúng không?',
          'Tự kiểm phần 2: Quan điểm có trả lời trực tiếp đề và được giải thích bằng lý do, ví dụ hay không?']),
        section('Nói · Phát triển ý, không học thuộc', [
          'Phần 1 hỏi về chủ đề quen thuộc. Phần 2 cho bạn một phút chuẩn bị rồi nói trong một đến hai phút. Phần 3 thảo luận câu hỏi khái quát hơn [1]. Khi luyện, nói theo từ khóa và thử tự nghe lại hoặc nhờ người khác phản hồi. Hãy đối chiếu với bốn tiêu chí chính thức, trong đó phát âm là một tiêu chí riêng [2].',
          'Nghiên cứu về phản hồi nói và dạy phát âm nhìn chung ủng hộ luyện tập có phản hồi [11, 12]. Phân tích hội thoại IELTS nhấn mạnh cách thí sinh phát triển chủ đề sau khi trả lời câu hỏi [13]. Hãy trả lời, thêm một lý do và minh họa bằng ví dụ. Thử lại vào ngày khác với chủ đề mới [14].',
        ], ['Tự kiểm: Đã trả lời thẳng, giải thích, đưa ví dụ rõ và nói đủ rõ để người khác theo kịp chưa?']),
      ],
    ],
  },
].map((guide) => ({ ...guide, sources: guide.sources.map((id) => sources[id]) }));

export const doiLink = (doi) => `https://doi.org/${doi}`;
export const scholarLink = (doi) => `https://scholar.google.com/scholar?q=${encodeURIComponent(doi)}`;
export const citation = (paper) => `${paper.author} (${paper.year}). ${paper.title}. ${paper.journal}.`;
