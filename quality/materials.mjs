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
  field: paper('Field, J.', 2003, 'Promoting perception: lexical segmentation in L2 listening',
    'ELT Journal, 57(4), 325–334', '10.1093/elt/57.4.325'),
  goh: paper('Goh, C. C. M.', 2000, 'A cognitive perspective on language learners’ listening comprehension problems',
    'System, 28(1), 55–75', '10.1016/S0346-251X(99)00060-3'),
  coverage: paper('Nation, I. S. P.', 2006, 'How Large a Vocabulary Is Needed for Reading and Listening?',
    'The Canadian Modern Language Review, 63(1), 59–82', '10.3138/cmlr.63.1.59'),
  schmitt: paper('Schmitt, N., Jiang, X., & Grabe, W.', 2011, 'The Percentage of Words Known in a Text and Reading Comprehension',
    'The Modern Language Journal, 95(1), 26–43', '10.1111/j.1540-4781.2011.01146.x'),
  repetition: paper('Webb, S.', 2007, 'The Effects of Repetition on Vocabulary Knowledge',
    'Applied Linguistics, 28(1), 46–65', '10.1093/applin/aml048'),
  gloss: paper('Yanagisawa, A., Webb, S., & Uchihara, T.', 2020,
    'How do different forms of glossing contribute to L2 vocabulary learning from reading? A meta-regression analysis',
    'Studies in Second Language Acquisition, 42(2), 411–438', '10.1017/S0272263119000688'),
  intentional: paper('Webb, S., Yanagisawa, A., & Uchihara, T.', 2020,
    'How Effective Are Intentional Vocabulary-Learning Activities? A Meta-Analysis',
    'The Modern Language Journal, 104(4), 715–738', '10.1111/modl.12671'),
  incidental: paper('Uchihara, T., Webb, S., & Yanagisawa, A.', 2019,
    'The Effects of Repetition on Incidental Vocabulary Learning: A Meta-Analysis of Correlational Studies',
    'Language Learning, 69(3), 559–599', '10.1111/lang.12343'),
  hyland: paper('Hyland, K., & Hyland, F.', 2006, 'Feedback on second language students’ writing',
    'Language Teaching, 39(2), 83–101', '10.1017/S0261444806003399'),
  peer: paper('Yu, S., & Lee, I.', 2016, 'Peer feedback in second language writing (2005–2014)',
    'Language Teaching, 49(4), 461–493', '10.1017/S0261444816000161'),
  teng: paper('Teng, L. S., & Zhang, L. J.', 2020,
    'Empowering learners in the second/foreign language classroom: Can self-regulated learning strategies-based writing instruction make a difference?',
    'Journal of Second Language Writing, 48, 100701', '10.1016/j.jslw.2019.100701'),
  lambert: paper('Lambert, C., Kormos, J., & Minn, D.', 2017, 'Task repetition and second language speech processing',
    'Studies in Second Language Acquisition, 39(1), 167–196', '10.1017/S0272263116000085'),
  munro: paper('Munro, M. J., & Derwing, T. M.', 1995,
    'Foreign Accent, Comprehensibility, and Intelligibility in the Speech of Second Language Learners',
    'Language Learning, 45(1), 73–97', '10.1111/j.1467-1770.1995.tb00963.x'),
  saito: paper('Saito, K.', 2012, 'Effects of Instruction on L2 Pronunciation Development: A Synthesis of 15 Quasi-Experimental Intervention Studies',
    'TESOL Quarterly, 46(4), 842–854', '10.1002/tesq.67'),
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
    slug: 'nghe-va-doi-chieu', number: '03', title: 'Nghe lại để tìm chỗ vướng',
    description: 'Phân biệt lỗi nghe âm, lỗi nhận từ và lỗi chọn thông tin qua một thông báo đặt chỗ.',
    sources: ['goh', 'field', 'vandergrift', 'coverage', 'roediger', 'repetition', 'kim', 'samples'],
    pages: [
      [
        section('Nghe sai ở đâu?', [
          'Một đáp án sai chưa cho biết người nghe gặp khó ở bước nào. Goh phân biệt những trở ngại khi nhận âm, phân tích lời nói và dùng thông tin để hiểu ý [1]. Field xem xét việc xác định ranh giới từ trong dòng lời nói [2]. Hai người cùng bỏ lỡ giờ hẹn có thể cần hai cách luyện khác nhau.',
          'Mở bài “Nghe một cuộc đặt chỗ”. Trước khi phát, ghi hai nhãn: giờ đến và giờ bắt đầu. Nghe một lượt, tắt âm thanh rồi điền hai giờ. Chưa mở bản chép. Việc dự đoán, kiểm tra và đánh giá lại cách nghe là trọng tâm của cách dạy nghe theo quy trình [3].',
        ]),
        section('Đối chiếu có mục đích', [], [
          'Không nghe ra “quarter past” nhưng hiểu ngay khi đọc? Đánh dấu lỗi nhận âm. Nghe lại đúng cụm, rồi thử viết khi không nhìn chữ.',
          'Nghe ra cụm nhưng chưa biết nghĩa? Ghi cả cụm, nghĩa và một ví dụ. Vốn từ cần cho việc hiểu còn phụ thuộc văn bản và mục đích nghe [4].',
          'Biết cả hai giờ nhưng chọn giờ bắt đầu cho câu hỏi về giờ đến? Gạch dưới động từ trong câu hỏi; luyện tách hai thông tin thay vì nghe lại toàn bộ.',
        ]),
      ],
      [
        section('Một lượt nghe – kiểm tra – chuyển tình huống', [
          'Chép lại ba chi tiết từ trí nhớ, sau đó tự sửa bằng bút màu khác. Luyện truy hồi khác với đọc lại đáp án [5]. Gặp lại từ và cách dùng có thể giúp củng cố nhiều khía cạnh của kiến thức từ vựng [6].',
          'Ví dụ tự soạn: “The doors open at six, but ticket collection starts at a quarter to six.” Câu hỏi: “When can visitors first collect tickets?” Đáp án: 5:45. Six là giờ mở cửa; “a quarter to” là kém mười lăm phút.',
        ]),
        section('Phiếu ghi một lỗi nghe', [], [
          'Câu hỏi cần thông tin gì? ___  |  Mình nghe được gì? ___',
          'Từ hoặc cụm trong bản chép: ___  |  Vướng ở âm, nghĩa hay suy luận? ___',
          'Lần tới mình sẽ thử: ___  |  Ngày nghe lại mà không xem chữ: ___',
        ]),
        section('Kiểm tra bằng bài mới', [
          'Quay lại vào ngày khác thay vì chỉ lặp ngay một đoạn [7]. Trong chế độ luyện bạn được nghe lại; đừng nhầm điều đó với điều kiện của bài thi. Sau buổi ôn, dùng bài mẫu của IELTS để làm quen yêu cầu và giới hạn từ [8].',
        ]),
      ],
    ],
  },
  {
    slug: 'tu-trong-ngu-canh', number: '04', title: 'Học từ trong ngữ cảnh',
    description: 'Dùng thử thách năm từ để chuyển từ nhận diện nghĩa sang tự dùng từ trong một tình huống mới.',
    sources: ['coverage', 'schmitt', 'jeon', 'gloss', 'intentional', 'repetition', 'incidental', 'kim', 'rowland'],
    pages: [
      [
        section('Biết bản dịch chưa chắc đã hiểu câu', [
          'Tỷ lệ từ quen thuộc có liên quan đến mức độ hiểu khi đọc, nhưng không có một số từ hay tỷ lệ cố định bảo đảm điểm IELTS. Độ khó của văn bản, ngữ pháp và kiến thức nền cũng có vai trò [1, 2, 3].',
          'Ví dụ: “Please renew your loan before Friday.” Trong thư viện, loan là lượt mượn và renew là gia hạn; trong ngân hàng, loan có thể là khoản vay. Khi làm thẻ, giữ cả câu thay vì chỉ ghi một cặp từ tương đương.',
        ]),
        section('Làm thử thách năm từ', [], [
          'Đọc câu tiếng Anh thành tiếng. Che các lựa chọn và tự giải thích từ được hỏi bằng tiếng Việt.',
          'Mở các lựa chọn. Đối chiếu nghĩa với ngữ cảnh: ai đang làm gì, ở đâu? Chú giải có thể hỗ trợ học từ khi đọc [4], nhưng đừng dừng ở việc nhận mặt chữ.',
          'Đặt một câu mới. Chẳng hạn: “I renewed the book online.” Thử đổi sang quá khứ hoặc thay tân ngữ để kiểm tra mình có thực sự dùng được từ.',
        ]),
      ],
      [
        section('Ba lượt gặp một từ', [
          'Lượt một: hiểu nghĩa trong câu. Lượt hai: tự gọi lại từ theo gợi ý tiếng Việt. Lượt ba: dùng từ trong một tình huống khác. Hoạt động học từ có chủ đích và gặp lại từ qua nhiều lần là hai hướng nghiên cứu bổ sung cho nhau [5, 6, 7]. Ba lượt ở đây là bài tập gợi ý, không phải ngưỡng thành thạo.',
          'Sải bước xếp câu sai vào lượt ôn tiếp theo. Với câu đúng, khoảng cách tăng dần. Nghiên cứu về học giãn cách và tự kiểm tra ủng hộ việc trở lại kiến thức sau một khoảng nghỉ [8, 9], không xác nhận một lịch tối ưu cho mọi từ.',
        ]),
        section('Tự kiểm sau một tuần', [], [
          'Không nhìn thẻ: viết nghĩa của deposit khi thuê nhà. Đặt câu có cả deposit và rent để phân biệt tiền cọc với tiền thuê.',
          'Giải thích tại sao catalogue không có nghĩa giống hệt một quyển sách. Dùng cả catalogue và shelf để chỉ dẫn cho người đọc.',
          'Ghi lại một nghĩa bạn đã chọn sai và câu ví dụ mới giúp phân biệt hai từ. Mang câu đó đến buổi học tiếp theo.',
        ]),
      ],
    ],
  },
  {
    slug: 'sua-doan-viet', number: '05', title: 'Tự sửa một đoạn lập luận',
    description: 'Viết một đoạn ngắn, xin phản hồi đúng chỗ và thử lại ý tưởng ở đề mới.',
    sources: ['format', 'scoring', 'hyland', 'hattie', 'kang', 'peer', 'teng', 'nation'],
    pages: [
      [
        section('Trước khi sửa từng từ', [
          'Trong Task 2, thí sinh viết ít nhất 250 từ để phát triển một lập luận. Bài luyện ngắn trong ứng dụng chỉ tập một phần của công việc này [1]. Kiểm tra xem đoạn của bạn có trả lời đề và phát triển ý không trước khi kiểm tra lỗi ngữ pháp [2].',
          'Đề nhỏ: “Should towns extend library opening hours?” Viết ba câu: quan điểm, lý do, một tình huống cụ thể. Không cần tìm số liệu nếu bạn không có nguồn.',
        ]),
        section('Gọi đúng tên điều cần sửa', [
          'Ví dụ: “Longer hours would help workers. Libraries are important. Many people go there.” Câu đầu nêu đối tượng, nhưng hai câu sau không giải thích vì sao giờ mở cửa lại giúp họ. Sửa ý trước: “A worker who finishes at six could collect a reserved book on the way home.”',
          'Phản hồi có nhiều hình thức và có ích khi dẫn tới một hành động sửa cụ thể [3, 4]. Câu hỏi tốt cho người đọc thử là “Ở đâu bạn phải tự đoán bước nối giữa lý do và ví dụ?”',
        ]),
      ],
      [
        section('Sửa một lỗi ngôn ngữ rồi thử lại', [
          'Bản nháp: “A student who work late cannot visit in time.” Tìm chủ ngữ của mệnh đề quan hệ rồi sửa work thành works. Tự viết một câu mới với chủ ngữ số nhiều. Việc sửa lỗi bằng văn bản có thể cải thiện độ chính xác, nhưng hiệu quả phụ thuộc bối cảnh [5].',
          'Khi học cùng bạn, mỗi người đánh dấu một câu thuyết phục và một chỗ còn khó hiểu. Người viết giải thích sẽ sửa gì hoặc vì sao giữ nguyên. Tổng quan về phản hồi đồng đẳng bàn cả lợi ích lẫn điều kiện để người học sử dụng được góp ý [6].',
        ]),
        section('Phiếu sửa đoạn', [], [
          'Quan điểm của mình: ___  |  Ví dụ hỗ trợ trực tiếp: ___',
          'Câu trước khi sửa: ___  |  Câu sau khi sửa: ___  |  Lý do: ___',
          'Đề mới để thử lại cùng kỹ năng: ___  |  Điều cần nhờ giáo viên nhận xét: ___',
        ]),
        section('So sánh hai bản viết', [
          'Hẹn một buổi ngắn để lên kế hoạch, viết lại và tự xem xét kết quả; đây là cách luyện tự điều chỉnh, không phải dự đoán band [7]. Cân đối việc chú ý hình thức với diễn đạt ý nghĩa thực sự [8].',
        ]),
      ],
    ],
  },
  {
    slug: 'ke-chuyen-thanh-tieng', number: '06', title: 'Kể chuyện thành tiếng',
    description: 'Dùng một phút chuẩn bị để kể có trình tự, rồi luyện lại với một chi tiết khác.',
    sources: ['format', 'scoring', 'lambert', 'munro', 'saito', 'lee', 'lyster', 'kim'],
    pages: [
      [
        section('Lập dàn ý bằng bốn từ khóa', [
          'Trong Speaking Part 2, bạn có một phút chuẩn bị và tối đa hai phút nói [1]. Thử đề: “Describe a place where you enjoy studying.” Viết bốn gợi ý ngắn: địa điểm, thời điểm, việc bạn làm ở đó, lý do bạn quay lại. Không chép cả câu.',
          'Ví dụ: “library – last winter – a shared desk – quiet”. Từ khóa thứ hai gợi một kỷ niệm, từ thứ tư giúp kết thúc bằng lý do. Khi tự nghe lại, dùng tiêu chí chính thức để định hướng nhận xét chứ không quy số từ hay số giây thành band [2].',
        ]),
        section('Nói lại mà không đọc thuộc', [
          'Lần đầu, kể trọn ý. Lần hai, chỉ đổi chi tiết về một người bạn đã gặp. Luyện lặp lại cùng nhiệm vụ có thể làm thay đổi cách xử lý lời nói [3]. Kết quả ở một đề đã quen không chứng minh bạn sẽ nói trôi chảy ở đề mới; hãy thử thêm đề khác.',
        ]),
      ],
      [
        section('Ưu tiên người nghe hiểu được', [
          'Có giọng địa phương không đồng nghĩa người nghe không hiểu [4]. Nhờ bạn học ghi lại ba điều họ thực sự nghe được. Nếu thời điểm hoặc địa điểm bị nhầm, đánh dấu cụm đó và thử ngắt nhịp ở một ranh giới ý khác.',
          'Các tổng quan về dạy phát âm cho thấy cần xác định rõ mục tiêu và cách đánh giá [5, 6]. Mỗi lượt chỉ thử một thay đổi, chẳng hạn nhấn từ mang thông tin mới trong “not the MAIN library, the SMALL one”.',
        ]),
        section('Nhận phản hồi không làm đứt mạch kể', [], [
          'Người nghe đợi đến hết lượt rồi hỏi lại một chi tiết chưa rõ. Người nói thử diễn đạt lại mà không nhìn mẫu. Phản hồi nói có nhiều hình thức, không chỉ là sửa ngay từng âm [7].',
          'Hôm sau, dùng lại cách lập dàn ý với một hoạt động thay vì một địa điểm. Việc cách buổi giúp tách luyện nhớ dài hạn khỏi sự quen miệng tức thời [8].',
          'Ghi chú cá nhân: từ khóa của mình ___  |  chi tiết người nghe bỏ lỡ ___  |  lần sau mình sẽ ___ .',
        ]),
      ],
    ],
  },
].map((guide) => ({ ...guide, sources: guide.sources.map((id) => sources[id]) }));

export const doiLink = (doi) => `https://doi.org/${doi}`;
export const scholarLink = (doi) => `https://scholar.google.com/scholar?q=${encodeURIComponent(doi)}`;
export const citation = (paper) => `${paper.author} (${paper.year}). ${paper.title}. ${paper.journal}.`;
