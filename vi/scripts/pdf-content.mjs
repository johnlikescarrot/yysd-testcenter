/* Nội dung biên soạn cho 6 cẩm nang PDF. Mỗi mục có đoạn văn, gạch đầu dòng,
   hộp ghi chú và (tuỳ chọn) bảng. Tiếng Việt là ngôn ngữ chính. */

export const CONTENT = {
  "on-tap-ngat-quang": {
    intro:
      "Hầu hết người học IELTS đều từng trải qua cảm giác: tối hôm trước thuộc 60 từ, hôm sau chỉ nhớ được 20. Vấn đề không nằm ở trí thông minh mà ở lịch ôn. Tài liệu này tổng hợp bằng chứng thực nghiệm về ôn tập ngắt quãng (spaced repetition) và chuyển thành một lịch học 30 ngày dùng được ngay cho từ vựng học thuật.",
    sections: [
      {
        heading: "1. Đường cong lãng quên và giới hạn của việc học dồn",
        paragraphs: [
          "Ebbinghaus (1885) lần đầu mô tả đường cong lãng quên: nếu không ôn lại, phần lớn thông tin mới rời khỏi trí nhớ trong vài ngày đầu. Nghiên cứu của Cepeda và cộng sự (2006), tổng hợp hơn 250 thí nghiệm, cho thấy khoảng cách giữa các lần ôn quyết định lượng thông tin giữ lại nhiều hơn cả tổng thời gian học.",
          "Học dồn (cramming) tạo cảm giác quen thuộc tức thời — cảm giác “đã biết” — nhưng độ bền rất thấp. Kornell (2009) chỉ ra rằng người học thường chọn học dồn vì nó dễ chịu, dù kết quả dài hạn kém hơn rõ rệt so với chia nhỏ buổi học."
        ],
        bullets: [
          "Ôn lần 1 sau 1 ngày, lần 2 sau 3 ngày, lần 3 sau 7 ngày, lần 4 sau 14 ngày.",
          "Mỗi lần ôn không quá 15 phút; ưu tiên tự nhớ trước khi xem đáp án.",
          "Ghi lại từ hay quên vào một danh sách riêng — đó là dữ liệu quý, không phải thất bại."
        ],
        callout:
          "Nguyên tắc vàng: một từ được ôn 4 lần cách quãng đáng giá hơn một từ được viết 20 lần trong một buổi."
      },
      {
        heading: "2. Khoảng cách ôn tối ưu cho từ vựng IELTS",
        paragraphs: [
          "Cepeda và cộng sự (2008) tìm ra rằng khoảng cách ôn nên tăng dần theo thời điểm kiểm tra: nếu cần nhớ trong một tháng, khoảng cách tối ưu khoảng 7–10% tổng thời gian đó. Với mục tiêu thi trong 3 tháng, chu kỳ 1–3–7–14–30 ngày là hợp lý và dễ duy trì.",
          "Kang (2016) nhấn mạnh rằng ôn ngắt quãng còn cải thiện khả năng chuyển giao: từ vựng được nhớ trong nhiều ngữ cảnh khác nhau sẽ dễ dùng khi viết và nói hơn là từ chỉ gặp trong một danh sách."
        ],
        table: {
          headers: ["Ngày", "Hoạt động", "Thời lượng"],
          rows: [
            ["1", "Học 20 từ mới, viết câu ví dụ", "20 phút"],
            ["2", "Tự nhớ 20 từ, chấm điểm", "10 phút"],
            ["4", "Ôn từ khó + 10 từ mới", "15 phút"],
            ["8", "Trắc nghiệm xen kẽ 30 từ", "15 phút"],
            ["15", "Viết đoạn văn dùng 10 từ", "20 phút"],
            ["30", "Kiểm tra tổng, cập nhật danh sách khó", "20 phút"]
          ]
        }
      },
      {
        heading: "3. Xen kẽ (interleaving) thay vì học theo khối",
        paragraphs: [
          "Dunlosky và cộng sự (2013) xếp ôn tập ngắt quãng và tự kiểm tra vào nhóm kỹ thuật có hiệu quả cao nhất, trong khi đọc lại và tô sáng bị xếp hạng thấp. Xen kẽ các chủ đề (từ vựng – ngữ pháp – đọc) giúp não phân biệt và chọn đúng kiến thức khi gặp tình huống mới.",
          "Trong ứng dụng, cơ chế này được hiện thực hoá bằng hàng đợi thẻ đến hạn: bài luyện tập tự động trộn câu hỏi từ nhiều unit thay vì lặp lại một dạng duy nhất."
        ],
        bullets: [
          "Một phiên 15 phút: 60% thẻ đến hạn, 30% câu hỏi mới, 10% nội dung đã thuộc.",
          "Đổi kỹ năng giữa các phiên, không học một kỹ năng quá 40 phút liên tục.",
          "Sau mỗi phiên, ghi một câu tự đánh giá: “Từ nào mình vẫn còn mơ hồ?”"
        ]
      },
      {
        heading: "4. Áp dụng vào lịch học cá nhân",
        paragraphs: [
          "Hãy chọn một khung giờ cố định và biến nó thành hành động nhỏ đến mức khó từ chối: 10 phút sau bữa sáng, 15 phút trước khi ngủ. Lally và cộng sự (2010) cho thấy thói quen hình thành nhanh hơn khi hành vi gắn với một tín hiệu cố định trong môi trường hằng ngày.",
          "Đừng đặt mục tiêu “học 2 tiếng mỗi ngày”. Hãy đặt “mở ứng dụng và hoàn thành một phiên 10 phút”. Thành công nhỏ lặp lại tạo động lực tốt hơn một kế hoạch hoàn hảo bị bỏ dở sau bốn ngày."
        ],
        callout:
          "Nếu bỏ một ngày, đừng bỏ hai ngày. Chuỗi ngày là công cụ, không phải bản án — hãy quay lại với phiên ngắn nhất."
      }
    ],
    checklist: [
      "Tôi có danh sách từ khó riêng, cập nhật sau mỗi phiên.",
      "Tôi tự nhớ trước khi mở đáp án.",
      "Tôi ôn cách quãng thay vì học dồn trước kỳ thi.",
      "Tôi đặt lịch ôn trong lịch điện thoại với thông báo."
    ]
  },

  "hieu-ung-kiem-tra": {
    intro:
      "Làm bài kiểm tra thường bị xem là cách đo, không phải cách học. Nghiên cứu về hiệu ứng kiểm tra (testing effect) cho thấy điều ngược lại: quá trình tự nhớ làm ký ức mạnh lên một cách chủ động. Tài liệu này hướng dẫn biến mọi bài luyện thành công cụ học.",
    sections: [
      {
        heading: "1. Vì sao tự nhớ hiệu quả hơn đọc lại",
        paragraphs: [
          "Roediger và Karpicke (2006) yêu cầu sinh viên đọc một đoạn văn rồi hoặc đọc lại, hoặc làm bài kiểm tra ngắn. Sau một tuần, nhóm được kiểm tra nhớ nhiều hơn khoảng 50% dù trước đó họ tự tin ít hơn. Hiện tượng này được gọi là ảo tưởng về độ trôi chảy: đọc lại tạo cảm giác quen nhưng không tạo đường dẫn truy hồi.",
          "Karpicke và Blunt (2011) so sánh việc vẽ sơ đồ khái niệm với tự kiểm tra và kết luận tự kiểm tra vượt trội ở cả câu hỏi ghi nhớ lẫn câu hỏi suy luận. Adesope và cộng sự (2017), qua meta-analysis 217 nghiên cứu, xác nhận hiệu ứng trung bình mạnh (g ≈ 0,61)."
        ],
        bullets: [
          "Che đáp án và tự nói thành tiếng câu trả lời trước khi kiểm tra.",
          "Sai không phải vấn đề — sửa ngay sau khi sai mới là điểm học.",
          "Đặt câu hỏi cho chính mình sau mỗi đoạn đọc thay vì tô sáng."
        ]
      },
      {
        heading: "2. Ứng dụng cho True/False/Not Given",
        paragraphs: [
          "Dạng bài này kiểm tra khả năng phân biệt “không đúng” và “không được nói tới”. Cách luyện hiệu quả là tự viết lại nhận định bằng lời của mình, xác định từ khoá nào phải xuất hiện trong bài, rồi mới đối chiếu. Việc diễn giải chủ động tạo ra nhiều đường truy hồi hơn là đọc lại đáp án.",
          "Sau khi làm sai, hãy ghi lại lý do: (a) không tìm thấy thông tin, (b) hiểu sai từ, (c) suy diễn quá xa. Ba loại lỗi này cần ba cách sửa khác nhau; gộp chúng lại sẽ khiến bạn luyện mãi mà không tiến bộ."
        ],
        callout:
          "Quy tắc 3 giây: trước khi chọn đáp án, hãy chỉ tay vào câu trong bài chứng minh lựa chọn của bạn."
      },
      {
        heading: "3. Lịch tự kiểm tra trong 7 ngày",
        paragraphs: [
          "Một tuần là đủ để tạo thói quen tự kiểm tra nếu mỗi ngày chỉ mất 10 phút. Dùng chính ứng dụng: mỗi phiên học kết thúc bằng 5 câu hỏi ngắn, và mỗi tối dành 3 phút trả lời “hôm nay mình nhớ được gì mà sáng nay chưa chắc?”.",
          "Đừng biến việc tự kiểm tra thành bài thi áp lực. Mục tiêu là tần suất truy hồi, không phải điểm số. Nếu một câu sai, ghi vào thẻ ôn tập và quay lại sau 10 phút."
        ],
        table: {
          headers: ["Ngày", "Hoạt động", "Mục tiêu"],
          rows: [
            ["1", "Đọc chủ động + 5 câu hỏi tự tạo", "Hiểu cấu trúc"],
            ["2", "Tự nhớ 10 từ, không nhìn đáp án", "Truy hồi"],
            ["3", "Làm 1 passage có bấm giờ", "Tốc độ"],
            ["4", "Sửa lỗi sai, viết lại lý do", "Nhận diện lỗi"],
            ["5", "Trắc nghiệm xen kẽ 20 câu", "Phân biệt dạng"],
            ["6", "Nói lại kiến thức trong 2 phút", "Diễn đạt"],
            ["7", "Kiểm tra tổng + lên kế hoạch tuần sau", "Củng cố"]
          ]
        }
      }
    ],
    checklist: [
      "Tôi tự trả lời trước khi xem đáp án.",
      "Tôi ghi lại loại lỗi, không chỉ đáp án đúng.",
      "Tôi dùng câu hỏi ngắn thay vì đọc lại nhiều lần.",
      "Tôi kiểm tra lại sau 1 ngày, 3 ngày và 7 ngày."
    ]
  },

  "chien-luoc-nghe": {
    intro:
      "Nghe là kỹ năng dễ mất điểm nhất vì thông tin chỉ xuất hiện một lần. Tài liệu này trình bày quy trình nghe có kiểm soát: chuẩn bị trước khi băng chạy, theo dõi tín hiệu diễn ngôn trong lúc nghe và rút kinh nghiệm sau khi nghe.",
    sections: [
      {
        heading: "1. Ba giai đoạn của một bài nghe",
        paragraphs: [
          "Vandergrift (2007) tổng kết rằng người nghe giỏi không chỉ giải mã âm thanh mà còn dự đoán, giám sát hiểu biết và sửa chiến lược khi cần. Ông gọi đây là quá trình siêu nhận thức (metacognitive). Goh (2008) chứng minh hướng dẫn siêu nhận thức cải thiện điểm nghe rõ rệt so với chỉ luyện nghe thụ động.",
          "Trước khi nghe: đọc câu hỏi, gạch từ khoá, dự đoán loại thông tin (số, tên, lý do). Trong khi nghe: bám vào tín hiệu như “however”, “the main reason”, “what surprised me”. Sau khi nghe: kiểm tra chính tả, số nhiều, đơn vị."
        ],
        bullets: [
          "Không cố dịch từng từ — theo dõi ý và tín hiệu chuyển ý.",
          "Nếu lỡ mất một câu, bỏ qua ngay; cố níu sẽ mất câu tiếp theo.",
          "Sai chính tả = mất điểm, kể cả khi nghe đúng."
        ]
      },
      {
        heading: "2. Xử lý bẫy paraphrase và số liệu",
        paragraphs: [
          "Field (2008) chỉ ra rằng lỗi nghe thường đến từ việc người học khớp âm thanh với từ đã biết thay vì với ngữ cảnh. Đề thi khai thác điều này bằng cách diễn đạt lại: “a quarter past nine” cho 9:15, “forty” cho £40 nhưng đặt cạnh “fourteen days”.",
          "Chiến lược hiệu quả là viết nhanh ký hiệu thay vì cả từ: 9:15, £40, 15/3. Sau đó mới chuẩn hoá khi chuyển đáp án."
        ],
        table: {
          headers: ["Bạn nghe", "Đáp án thường gặp", "Bẫy"],
          rows: [
            ["a quarter past nine", "9:15", "9:45 (quarter to ten)"],
            ["forty pounds", "£40", "£14 (fourteen)"],
            ["the fifteenth of March", "15/3", "March 50? (nghe nhầm)"],
            ["double the price", "gấp đôi", "hai lần (twice)"]
          ]
        }
      },
      {
        heading: "3. Luyện nghe chủ động với bản ghi",
        paragraphs: [
          "Graham (2017) khuyến nghị dùng bản ghi (transcript) sau khi nghe, không phải trước. Quy trình: nghe – trả lời – nghe lại – đọc bản ghi – đánh dấu chỗ nghe sai – nghe lại lần cuối. Mỗi vòng như vậy dạy bạn một điểm yếu cụ thể: nối âm, trọng âm, hay từ vựng.",
          "Với người mới, hãy chọn đoạn 60–90 giây. Nghe quá dài dễ mất tập trung và không kịp phân tích lỗi."
        ],
        callout:
          "Mỗi bài nghe chỉ cần rút ra một bài học. Một bài học được sửa tốt hơn mười bài nghe qua."
      }
    ],
    checklist: [
      "Tôi đọc câu hỏi và dự đoán trước khi băng chạy.",
      "Tôi ghi số liệu bằng ký hiệu, kiểm tra lại sau khi nghe.",
      "Tôi dùng bản ghi sau khi làm bài, không phải trước.",
      "Tôi ghi lại loại lỗi nghe: nối âm, trọng âm, từ vựng."
    ]
  },

  "writing-task-2": {
    intro:
      "Writing Task 2 không kiểm tra độ dài hay số từ khó, mà kiểm tra khả năng trả lời đúng đề bằng lập luận mạch lạc. Tài liệu này bóc tách tiêu chí chấm, đưa khung 4 đoạn và checklist tự sửa lỗi để bạn viết chắc tay hơn.",
    sections: [
      {
        heading: "1. Đọc đề: ba câu hỏi bắt buộc",
        paragraphs: [
          "Hyland (2003) mô tả writing học thuật như một thể loại xã hội có quy ước riêng: người viết phải định vị mình trong một cuộc tranh luận, không chỉ liệt kê ý. Vì vậy, trước khi viết, hãy xác định: vấn đề là gì, quan điểm của bạn là gì, và bạn sẽ chứng minh bằng hai lý do nào.",
          "Wingate (2012) nhấn mạnh sinh viên thường thất bại vì không hiểu “argument” nghĩa là gì: một luận điểm cần lý do và bằng chứng, không phải một câu khẳng định chung chung."
        ],
        bullets: [
          "Gạch chân từ khoá và giới hạn của đề (ai, ở đâu, trong phạm vi nào).",
          "Viết câu trả lời trực tiếp trong 25 từ — đó là hạt nhân của bài.",
          "Chọn 2 lý do mạnh nhất, bỏ các lý do chỉ để cho dài."
        ]
      },
      {
        heading: "2. Khung 4 đoạn dùng được cho mọi dạng",
        paragraphs: [
          "Mở bài 2 câu: diễn đạt lại đề bằng từ của bạn, rồi nêu quan điểm rõ ràng. Thân bài 1 và 2: mỗi đoạn một ý, theo công thức P-E-E-L (Point – Explain – Example – Link). Kết luận 1–2 câu: khẳng định lại quan điểm, không thêm ý mới.",
          "Swales (1990) gọi cấu trúc này là “move analysis”: mỗi phần của văn bản thực hiện một chức năng giao tiếp riêng. Khi người đọc nhận ra chức năng đó ngay từ câu đầu, bài viết được đánh giá mạch lạc hơn."
        ],
        table: {
          headers: ["Phần", "Chức năng", "Độ dài gợi ý"],
          rows: [
            ["Mở bài", "Paraphrase + thesis", "40–55 từ"],
            ["Thân bài 1", "Lý do 1 + ví dụ", "90–110 từ"],
            ["Thân bài 2", "Lý do 2 + ví dụ", "90–110 từ"],
            ["Kết luận", "Khẳng định lại", "30–40 từ"]
          ]
        }
      },
      {
        heading: "3. Từ nối và kiểm soát giọng văn",
        paragraphs: [
          "Halliday và Hasan (1976) phân biệt liên kết bằng từ nối (cohesion) và mạch lạc về ý (coherence). Chỉ dùng “moreover, furthermore” mà các ý không liên quan sẽ không nâng điểm. Hãy chọn từ nối thể hiện đúng quan hệ: nhân quả (therefore, consequently), tương phản (however, whereas), ví dụ (for instance).",
          "Tránh khẩu ngữ và tuyệt đối hoá: “kids”, “a lot of”, “everyone knows”. Dùng “children”, “a significant proportion”, “it is widely argued”. Đây là những điều chỉnh nhỏ nhưng ảnh hưởng trực tiếp tới Lexical Resource."
        ],
        callout:
          "Một bài viết tốt trả lời đúng câu hỏi. Một bài viết hay còn khiến người đọc tin rằng câu trả lời đó hợp lý."
      }
    ],
    checklist: [
      "Mở bài của tôi trả lời trực tiếp câu hỏi của đề.",
      "Mỗi thân bài có đúng một ý chính, có ví dụ cụ thể.",
      "Tôi không dùng từ nối sai quan hệ logic.",
      "Tôi đã đọc lại để bỏ khẩu ngữ và câu quá dài."
    ]
  },

  "speaking-luu-loat": {
    intro:
      "Lưu loát không phải nói nhanh, mà là nói liền mạch với ít khoảng dừng gây khó hiểu. Tài liệu này hướng dẫn luyện phản xạ, kiểm soát khoảng dừng và dùng ngữ điệu để truyền đạt ý.",
    sections: [
      {
        heading: "1. Ba thành phần của fluency",
        paragraphs: [
          "Segalowitz (2010) chia fluency thành ba tầng: tốc độ xử lý nhận thức, độ trôi chảy khi nói và đánh giá của người nghe. Bạn có thể nói chậm nhưng vẫn lưu loát nếu các khoảng dừng nằm ở ranh giới ý, không phải giữa cụm từ.",
          "Skehan (2014) chỉ ra rằng áp lực thời gian làm giảm độ chính xác nhưng tăng tốc độ; vì vậy cần luyện cả hai chế độ: nói nhanh để phá ngại và nói chậm để kiểm soát ngữ pháp."
        ],
        bullets: [
          "Ngừng ở cuối cụm nghĩa, không ngừng giữa “because … I think”.",
          "Dùng cụm dẫn dắt: “That's an interesting question”, “What I mean is…”.",
          "Tự ghi âm 60 giây mỗi ngày và đếm số lần lặp vô nghĩa."
        ]
      },
      {
        heading: "2. Cấu trúc trả lời Part 2",
        paragraphs: [
          "Một câu chuyện dễ theo dõi cần ba mốc: bối cảnh (khi nào, ở đâu, với ai), diễn biến (điều gì xảy ra, xoay quanh một chi tiết cụ thể) và ý nghĩa (bạn học được gì, cảm xúc ra sao). Dùng từ nối thời gian như “initially”, “at that point”, “looking back”.",
          "Levelt (1989) mô tả quá trình nói gồm khái niệm hoá, hình thành ngôn ngữ và phát âm. Khi bạn chuẩn bị trước các “khối” (chunks) như “what I found most rewarding was…”, bạn giảm tải cho bước hình thành ngôn ngữ và nói trôi hơn."
        ],
        table: {
          headers: ["Phần", "Mốc thời gian", "Cụm hữu ích"],
          rows: [
            ["Bối cảnh", "Khoảng 20 giây", "It all started when…"],
            ["Diễn biến", "60–70 giây", "At that point…, To my surprise…"],
            ["Ý nghĩa", "20–30 giây", "Looking back, I realise…"]
          ]
        }
      },
      {
        heading: "3. Sửa lỗi mà không phá mạch nói",
        paragraphs: [
          "Tự sửa là dấu hiệu của người nói có kiểm soát, miễn là ngắn. Dùng “or rather”, “I mean”, “what I'm trying to say is” để chỉnh lại ý. Tránh quay lại đầu câu và nói lại từ đầu — điều này phá vỡ mạch và làm giảm điểm coherence.",
          "Derwing và Munro (2015) nhấn mạnh rằng phát âm dễ hiểu quan trọng hơn phát âm “giống người bản xứ”. Hãy ưu tiên trọng âm từ và trọng âm câu, vì đó là yếu tố người nghe dựa vào nhiều nhất."
        ],
        callout:
          "Ghi âm 1 phút mỗi ngày trong 2 tuần. Nghe lại và chỉ sửa một lỗi mỗi lần — thay đổi bền vững cần ít mục tiêu."
      }
    ],
    checklist: [
      "Tôi ngừng ở ranh giới ý, không ngừng giữa cụm.",
      "Tôi có 3 cụm dẫn dắt dùng thành thạo.",
      "Tôi kể Part 2 theo 3 mốc bối cảnh – diễn biến – ý nghĩa.",
      "Tôi tự sửa bằng cụm ngắn thay vì nói lại từ đầu."
    ]
  },

  "gamification-dong-luc": {
    intro:
      "Chuỗi ngày, XP và huy hiệu có thể tạo thói quen, nhưng cũng có thể biến việc học thành cuộc đua điểm số vô nghĩa. Tài liệu này tổng hợp bằng chứng và đề xuất cách dùng gamification lành mạnh.",
    sections: [
      {
        heading: "1. Gamification hiệu quả ở đâu?",
        paragraphs: [
          "Hamari và cộng sự (2014) tổng quan 24 nghiên cứu và thấy gamification có tác động tích cực, nhưng hiệu ứng phụ thuộc vào bối cảnh và cách thiết kế. Sailer và cộng sự (2017) chỉ ra rằng các yếu tố như huy hiệu, bảng xếp hạng và nhiệm vụ tác động tới ba nhu cầu tâm lý: năng lực, tự chủ và kết nối.",
          "Nếu phần thưởng chỉ là điểm số bên ngoài, động lực có thể giảm khi phần thưởng biến mất (Deci, Koestner & Ryan, 1999). Vì vậy, thiết kế tốt cần cho người học thấy tiến bộ thật: số từ nhớ được, độ chính xác tăng, bài nói dài hơn."
        ],
        bullets: [
          "Ưu tiên phản hồi về năng lực: “bạn đã nhớ 18/20 từ” thay vì chỉ “+40 XP”.",
          "Cho phép chọn mục tiêu ngày để tăng cảm giác tự chủ.",
          "Dùng chuỗi ngày như tín hiệu thói quen, kèm cơ chế nghỉ hợp lý."
        ]
      },
      {
        heading: "2. Bẫy điểm số và cách tránh",
        paragraphs: [
          "Khi bảng xếp hạng trở thành mục tiêu duy nhất, người học có xu hướng chọn bài dễ, bỏ qua bài khó và học chỉ để lấy XP. Đây là hiện tượng thay thế mục tiêu (goal displacement). Cách giảm thiểu: giới hạn số XP mỗi ngày, thưởng cho độ chính xác và cho việc ôn tập đúng hạn.",
          "Trong IELTS Việt, XP được tính theo chuỗi trả lời đúng và có trần mỗi câu, còn huy hiệu yêu cầu hành vi học thật (chuỗi 7 ngày, 25 thẻ ôn, một bài hoàn hảo). Điểm số phản ánh hành vi, không thay thế hành vi."
        ],
        callout:
          "Câu hỏi kiểm tra: nếu xoá hết XP và huy hiệu, bạn có còn muốn học bài hôm nay không? Nếu câu trả lời là không, hãy đổi mục tiêu sang một kỹ năng cụ thể."
      },
      {
        heading: "3. Thiết kế một tuần học bền vững",
        paragraphs: [
          "Ryan và Deci (2000) cho rằng động lực bền vững đến từ cảm giác tự chủ, năng lực và kết nối. Ba yếu tố này có thể nuôi dưỡng bằng những thay đổi nhỏ: chọn giờ học của riêng mình, ghi lại tiến bộ mỗi tuần, và học cùng một người bạn.",
          "Đặt mục tiêu quá trình thay vì mục tiêu kết quả: “5 phiên 15 phút mỗi tuần” dễ kiểm soát hơn “tăng 0.5 band trong 2 tuần”. Kết quả đến từ quá trình đều đặn, không từ áp lực nhất thời."
        ],
        table: {
          headers: ["Ngày", "Phiên", "Phần thưởng tự thân"],
          rows: [
            ["Thứ 2", "Từ vựng 15 phút", "Đánh dấu từ đã nhớ"],
            ["Thứ 3", "Nghe 15 phút", "Nghe lại đoạn yêu thích"],
            ["Thứ 4", "Ôn thẻ đến hạn", "Xem tiến độ tuần"],
            ["Thứ 5", "Viết 1 đoạn", "Đọc lại và sửa 1 lỗi"],
            ["Thứ 6", "Nói 10 phút", "Ghi âm và nghe lại"],
            ["Thứ 7", "Kiểm tra ngắn", "Nghỉ trọn vẹn"],
            ["Chủ nhật", "Nghỉ / ôn nhẹ", "Lên kế hoạch tuần"]
          ]
        }
      }
    ],
    checklist: [
      "Tôi biết mục tiêu học của mình ngoài XP.",
      "Tôi không chọn bài dễ chỉ để giữ chuỗi.",
      "Tôi có ít nhất một người cùng học hoặc cùng chia sẻ tiến độ.",
      "Tôi dành một ngày nghỉ không cảm thấy tội lỗi."
    ]
  }
};
