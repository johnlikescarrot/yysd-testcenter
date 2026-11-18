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
  retrieval: paper('Karpicke, J. D., & Roediger, H. L., III', 2008, 'The Critical Importance of Retrieval for Learning',
    'Science, 319(5865), 966–968', '10.1126/science.1152408'),
  intentional: paper('Webb, S., Yanagisawa, A., & Uchihara, T.', 2020, 'How Effective Are Intentional Vocabulary-Learning Activities? A Meta-Analysis',
    'The Modern Language Journal, 104(4), 715–738', '10.1111/modl.12671'),
  incidental: paper('Webb, S., Uchihara, T., & Yanagisawa, A.', 2023, 'How effective is second language incidental vocabulary learning? A meta-analysis',
    'Language Teaching, 56(2), 161–180', '10.1017/S0261444822000507'),
  repetition: paper('Uchihara, T., Webb, S., & Yanagisawa, A.', 2019, 'The Effects of Repetition on Incidental Vocabulary Learning: A Meta-Analysis of Correlational Studies',
    'Language Learning, 69(3), 559–599', '10.1111/lang.12343'),
  gloss: paper('Yanagisawa, A., Webb, S., & Uchihara, T.', 2020, 'How Do Different Forms of Glossing Contribute to L2 Vocabulary Learning from Reading? A Meta-Regression Analysis',
    'Studies in Second Language Acquisition, 42(2), 411–438', '10.1017/S0272263119000688'),
  coverage: paper('Schmitt, N., Jiang, X., & Grabe, W.', 2011, 'The Percentage of Words Known in a Text and Reading Comprehension',
    'The Modern Language Journal, 95(1), 26–43', '10.1111/j.1540-4781.2011.01146.x'),
  wordKnowledge: paper('Webb, S.', 2007, 'The Effects of Repetition on Vocabulary Knowledge',
    'Applied Linguistics, 28(1), 46–65', '10.1093/applin/aml048'),
  selfExplain: paper('Bisra, K., Liu, Q., Nesbit, J. C., Salimi, F., & Winne, P. H.', 2018, 'Inducing Self-Explanation: a Meta-Analysis',
    'Educational Psychology Review, 30, 703–725', '10.1007/s10648-018-9434-x'),
  feedback: paper('Butler, A. C., & Roediger, H. L., III', 2008, 'Feedback enhances the positive effects and reduces the negative effects of multiple-choice testing',
    'Memory & Cognition, 36(3), 604–616', '10.3758/MC.36.3.604'),
  transfer: paper('Butler, A. C.', 2010, 'Repeated testing produces superior transfer of learning relative to repeated studying',
    'Journal of Experimental Psychology: Learning, Memory, and Cognition, 36(5), 1118–1133', '10.1037/a0019902'),
  testing: paper('Adesope, O. O., Trevisan, D. A., & Sundararajan, N.', 2017, 'Rethinking the Use of Tests: A Meta-Analysis of Practice Testing',
    'Review of Educational Research, 87(3), 659–701', '10.3102/0034654316689306'),
  format: { title: 'Cấu trúc IELTS Academic', url: 'https://ielts.org/take-a-test/test-types/ielts-academic-test' },
  scoring: { title: 'Mô tả thang điểm Viết và Nói', url: 'https://ielts.org/organisations/ielts-for-organisations/understanding-ielts-scoring/resources-for-setting-your-ielts-scores' },
  samples: { title: 'Câu hỏi mẫu IELTS Academic', url: 'https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test' },
};

const section = (heading, paragraphs, list = []) => ({ heading, paragraphs, list });
export const guides = [
  {
    slug: 'hoc-it-nho-lau', number: '01', title: 'Học ít, nhớ lâu',
    description: 'Lập lịch và tự kiểm tra khi luyện IELTS Academic.',
    sources: ['dunlosky', 'roediger', 'rowland', 'yang', 'cepeda', 'kim', 'hattie', 'sailer', 'retrieval'],
    pages: [
      [
        section('1. Tự nhớ trước khi xem đáp án', [
          'Sau một đoạn đọc hoặc đoạn nghe, hãy tạm đóng tài liệu. Viết lại ý chính hoặc thử trả lời từ trí nhớ, rồi đối chiếu với nguồn. Tự kiểm tra và học giãn cách có bằng chứng tốt hơn việc chỉ đọc lại trong nhiều bối cảnh [1]. Thí nghiệm và tổng quan về luyện truy hồi cho thấy lợi ích đối với việc nhớ sau một khoảng thời gian; tổng quan lớp học cũng ghi nhận lợi ích trong nhiều tình huống [2, 3, 4].',
          'Trong thí nghiệm về cặp từ ngoại ngữ, việc tiếp tục tự nhớ sau lần trả lời đúng đầu tiên giúp người học nhớ lại tốt hơn ở lượt kiểm tra sau [9]. Hãy thử với một thông báo: nghe, đóng bản chép, ghi giờ hẹn mới; hôm sau thử nhớ lại trước khi mở đáp án.',
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
    sources: ['format', 'scoring', 'samples', 'nation', 'vandergrift', 'jeon', 'kang', 'lyster', 'lee', 'kim', 'coverage'],
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
          'Đọc lướt để hiểu cấu trúc, sau đó quay lại đoạn liên quan. Với dạng đúng, sai hoặc không có thông tin, tìm câu xác nhận hoặc bác bỏ; nếu không có đủ dữ kiện cho cả hai, đừng dùng kiến thức ngoài bài. Vốn từ và ngữ pháp có liên hệ với khả năng đọc hiểu ngôn ngữ thứ hai [6]. Trong một nghiên cứu với hai bài đọc, người biết nhiều từ hơn thường hiểu tốt hơn; không có ngưỡng mà điểm đọc đột ngột tăng [11]. Đây không phải công thức quy đổi sang band.',
        ], ['Tự kiểm: Mình có thể chỉ rõ từ hoặc cụm từ nào giới hạn nhận định không?']),
      ],
      [
        section('Viết · Viết, nhận phản hồi rồi sửa', [
          'Phần 1 yêu cầu ít nhất 150 từ để mô tả thông tin trực quan. Phần 2 cần ít nhất 250 từ và có trọng số gấp đôi phần 1. Thử phân bổ khoảng 20 và 40 phút. Đối chiếu bài với các tiêu chí chính thức như đáp ứng yêu cầu, mạch lạc và liên kết, từ vựng, phạm vi và độ chính xác ngữ pháp [1, 2].',
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
    slug: 'tu-trong-ngu-canh', number: '03', title: 'Nhớ từ trong ngữ cảnh',
    description: 'Từ một câu tiếng Anh đến thẻ ôn có thể dùng khi đọc, viết và nói.',
    sources: ['coverage', 'incidental', 'intentional', 'gloss', 'repetition', 'wordKnowledge', 'retrieval', 'kim'],
    pages: [
      [
        section('Chọn đoạn vừa sức, rồi đọc vì ý nghĩa', [
          'Nếu liên tục phải dừng lại tra từ, hãy thử một đoạn ngắn hoặc quen chủ đề hơn. Trong nghiên cứu trên hai văn bản, tỷ lệ từ người học đã biết có liên hệ với mức độ hiểu theo chiều tăng dần, chứ không xuất hiện một ngưỡng kỳ diệu [1].',
          'Đọc lần đầu để trả lời một câu hỏi thật: Người viết đổi kế hoạch vì sao? Chỉ chọn một hoặc hai cụm từ có ích cho lần đọc sau. Việc gặp từ khi tập trung vào nội dung có thể giúp học từ, nhưng không bảo đảm nắm trọn mọi từ mới [2].',
        ]),
        section('Ví dụ: một từ, hai tình huống', [
          'The train was delayed by twenty minutes. Ở đây, delayed có nghĩa là “bị trễ”. Trong The council delayed the vote, chủ thể chủ động hoãn một việc. Ghi cả cụm đi kèm; đừng học thuộc một bản dịch rồi áp vào mọi câu.',
          'Thử đoán nghĩa, mở chú giải tiếng Việt ngắn, rồi đọc lại câu tiếng Anh. Phân tích tổng hợp về đọc có chú giải ghi nhận lợi ích so với đọc không chú giải [4]. Đọc theo ngữ cảnh và tập từ có chủ đích phục vụ những mục tiêu bổ sung nhau [2, 3].',
        ]),
      ],
      [
        section('Lật thẻ theo hai hướng', [
          'Mặt trước: The meeting was ___ until Friday. Mặt sau: delayed; cụm delay a meeting. Che mặt sau, thử điền từ và nói nghĩa của cả câu. Sau đó đổi chiều: từ ý “hoãn chuyến đi”, tự tạo một câu mới. Một câu như We delayed the trip until June là đáp án có thể dùng, không phải đáp án duy nhất.',
          'Nhận ra nghĩa, nhớ chính tả và dùng được kết hợp từ là những cách biết một từ khác nhau [6]. Đúng một lần chưa phải đã nhớ lâu: tiếp tục tự nhớ ở buổi sau thay vì chỉ nhìn đáp án [7].',
        ]),
        section('Gặp lại có mục đích', [
          'Các nghiên cứu ghi nhận mối liên hệ giữa số lần gặp từ và việc học được từ trong ngữ cảnh; số lần cần thiết thay đổi theo người học, văn bản và cách kiểm tra [5, 6]. Không có căn cứ để hứa rằng cứ gặp đúng một số lần là sẽ thành thạo.',
          'Chọn một câu mới cùng cụm từ cho lượt ôn kế tiếp. Học rải buổi có cơ sở trong nghiên cứu ngôn ngữ thứ hai [8], nhưng các mốc ôn của Sải bước là lựa chọn thiết kế, không phải lịch bắt buộc.',
        ], ['Ngày ___ | Cụm từ ___ | Nghĩa trong câu này ___', 'Câu mới do mình viết ___ | Ghi chú về cách dùng ___',
          'Lượt sau: nhận ra khi đọc? ___ | nhớ và tự dùng khi nói? ___']),
      ],
    ],
  },
  {
    slug: 'tu-de-den-loi-giai', number: '04', title: 'Từ đề đến lời giải',
    description: 'Phiếu chữa bài dùng kèm đề luyện, đáp án và hướng dẫn chấm trong thư viện.',
    sources: ['testing', 'yang', 'feedback', 'selfExplain', 'transfer', 'cepeda', 'hattie'],
    pages: [
      [
        section('Trước khi mở đáp án', [
          'Chọn một câu trong đề. Với A-Level, ghép đúng môn, mã đề, kỳ và năm của Question Paper với Mark Scheme. Với IELTS, kiểm tra kỹ năng, tập và số Test. Để riêng đáp án trong lượt làm đầu tiên.',
          'Làm trên giấy và ghi cả bước suy luận lẫn đáp án. Tự kiểm tra trong lúc học có thể hỗ trợ ghi nhớ; tổng quan về luyện kiểm tra và nghiên cứu trong lớp học đều cho thấy lợi ích, nhưng không đảm bảo điểm của một kỳ thi cụ thể [1, 2].',
        ]),
        section('Sau khi mở hướng dẫn chấm', [
          'Tìm điểm đầu tiên nơi lời giải của bạn khác đáp án. Với một câu trắc nghiệm, đừng chỉ ghi chữ cái đúng: giải thích vì sao phương án đã chọn không thỏa điều kiện. Trong một thí nghiệm, phản hồi sau trắc nghiệm giúp người học ít nhớ nhầm phương án nhiễu hơn [3].',
          'Ví dụ tự soạn: A class grew from 20 to 25 students. Số học sinh tăng 5, nhưng tỷ lệ tăng là 5 ÷ 20 = 25%. Nếu đã chia cho 25, hãy ghi “so với số ban đầu”, không chỉ ghi 25%. Tự giải thích vì sao một bước hợp lý là một kỹ thuật đã được nghiên cứu ở nhiều dạng nhiệm vụ [4].',
        ]),
      ],
      [
        section('Tách nhớ đáp án khỏi biết làm', [
          'Thử một tình huống mới: một lớp giảm từ 25 xuống 20 học sinh. Tự tính trước khi xem tiếp. Đáp án: giảm 5 ÷ 25 = 20%. Hai ví dụ thay đổi cùng 5 học sinh nhưng có mẫu số khác nhau. Nếu bạn chỉ nhớ “25%”, lượt luyện thứ hai sẽ phát hiện chỗ nhầm.',
          'Nghiên cứu thực nghiệm đã quan sát được lợi ích của luyện truy hồi ở một số câu hỏi suy luận mới [5]. Khi tự ôn, hãy kiểm tra khả năng áp dụng bằng câu mới, rồi quay lại sau một khoảng nghỉ [6]. Hai ví dụ trên là bài minh họa của sổ tay, không trích từ đề chính thức.',
        ]),
        section('Phiếu chữa một câu', [
          'Phản hồi có ích khi giúp thấy khoảng cách giữa mục tiêu, bài đã làm và việc cần sửa [7]. Điền một dòng cho mỗi câu quan trọng; nếu đáp án chưa giải thích tại sao, đánh dấu để hỏi giáo viên.',
        ], ['Môn / kỹ năng ___ | mã đề ___ | câu ___', 'Đáp án ban đầu ___ | bằng chứng hoặc bước tính ___',
          'Chỗ sai đầu tiên ___ | giải thích bằng lời của mình ___', 'Câu mới để thử ___ | ngày làm lại ___ | kết quả ___']),
        section('Ranh giới của phiếu tự học', [
          'Sổ tay không sửa đề PDF hoặc hướng dẫn chấm gốc. Khi cần điểm chính thức, hãy theo quy định của hội đồng thi. Điểm tự luyện và điểm kinh nghiệm trong ứng dụng không thay cho điểm thi.',
        ]),
      ],
    ],
  },
].map((guide) => ({ ...guide, sources: guide.sources.map((id) => sources[id]) }));

export const doiLink = (doi) => `https://doi.org/${doi}`;
// Prefer a verified publication record; otherwise provide a DOI search, not a guessed cluster ID.
const scholarRecords = {
  '10.1037/bul0000309': 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=5nMeyZQAAAAJ&citation_for_view=5nMeyZQAAAAJ%3AVztgr1qGG8IC',
  '10.1111/lang.12479': 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=QXVNAAYAAAAJ&citation_for_view=QXVNAAYAAAAJ:u-x6o8ySG0sC',
  '10.1037/0033-2909.132.3.354': 'https://scholar.google.com/scholar_lookup?doi=10.1037/0033-2909.132.3.354',
};
export const scholarLink = (doi) => scholarRecords[doi] ?? `https://scholar.google.com/scholar?q=${encodeURIComponent(doi)}`;
export const citation = (paper) => `${paper.author} (${paper.year}). ${paper.title}. ${paper.journal}.`;
