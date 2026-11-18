#!/usr/bin/env python3
"""Sinh thư mục học thuật `research/sources.json` kèm liên kết Google Scholar.

Mỗi mục là một tham chiếu thư mục thật (tác giả, năm, nhan đề, nguồn).
Liên kết Scholar được tạo tự động từ nhan đề + tác giả để tra cứu nhanh;
không sao chép toàn văn bài báo có bản quyền.
"""
from __future__ import annotations
import json
from pathlib import Path
from urllib.parse import quote_plus

OUT = Path(__file__).resolve().parents[1] / "research" / "sources.json"

# (tác giả, năm, nhan đề, nguồn xuất bản, nhóm, DOI, ghi chú tiếng Việt)
REFS = [
    ("Hashemi, A. & Daneshfar, S.", 2018, "A Review of the IELTS Test: Focus on Validity, Reliability, and Washback", "Indonesian Journal of English Language Teaching and Applied Linguistics, 3(1), 39-56", "ielts", "", "Tổng quan kinh điển về giá trị, độ tin cậy và washback của IELTS."),
    ("Messick, S.", 1996, "Validity and Washback in Language Testing", "Language Testing, 13(3), 241-256", "ielts", "10.1177/026553229601300302", "Đặt washback vào khung giá trị hệ quả của bài kiểm tra."),
    ("Green, A.", 2007, "IELTS Washback in Context: Preparation for Academic Writing in Higher Education", "Cambridge University Press, Studies in Language Testing 25", "ielts", "", "Nghiên cứu ảnh hưởng của luyện thi tới cách dạy viết học thuật."),
    ("Green, A.", 2007, "Washback to Learning Outcomes: A Comparative Study of IELTS Preparation and University Pre-sessional Language Courses", "Assessment in Education, 14(1), 75-97", "ielts", "", "So sánh kết quả học của khoá luyện thi và khoá dự bị đại học."),
    ("Green, A.", 2013, "Washback in Language Assessment", "International Journal of English Studies, 13(2), 39-51", "ielts", "10.6018/ijes.13.2.185891", "Khái quát hoá cơ chế washback trong đánh giá ngôn ngữ."),
    ("Hayes, B. & Read, J.", 2004, "IELTS Test Preparation in New Zealand: Preparing Students for the IELTS Academic Module", "In Washback in Language Testing: Research Contexts and Methods, 97-111", "ielts", "", "Bằng chứng washback trong lớp luyện IELTS học thuật."),
    ("Nguyen, H. T. M.", 2023, "The Washback of the IELTS as an English Language Proficiency Exit Test on the Learning of Final-Year English Majors", "TESL-EJ, 27(2)", "ielts", "10.55593/ej.27106a8", "Bối cảnh Việt Nam: áp lực điểm chuẩn và hành vi học tập."),
    ("Dang, C. N. & Dang, T. N. Y.", 2023, "The Predictive Validity of the IELTS Test and Contribution of IELTS Preparation Courses: Insights from Vietnamese International Students in the UK", "RELC Journal", "ielts", "10.1177/0033688220985533", "Đọc và nghe tương quan mạnh nhất với kết quả học đại học."),
    ("Dooey, P. & Oliver, R.", 2002, "An Investigation into the Predictive Validity of IELTS", "IELTS Research Reports, 3", "ielts", "", "Khảo sát giá trị dự báo theo nhóm ngôn ngữ mẹ đẻ."),
    ("Feast, V.", 2002, "The Impact of IELTS Scores on Performance at University", "IELTS Research Reports, 3", "ielts", "", "Đối chiếu band IELTS với điểm số đại học."),
    ("Brown, J. D.", 1997, "Do Tests Washback on the Language Classroom?", "The TESOLANZ Journal, 5, 63-80", "ielts", "", "Câu hỏi nền tảng về tác động của thi cử lên lớp học."),
    ("Lewthwaite, M.", 2007, "Teacher and Student Attitudes to IELTS Writing Tasks: Positive or Negative Washback", "UGRU Journal, 5, 1-16", "ielts", "", "Thái độ của giáo viên và học viên với nhiệm vụ viết."),
    ("Taylor, L. & Weir, C. J. (Eds.)", 2012, "IELTS Collected Papers 2: Research in Reading and Listening Assessment", "Cambridge University Press, Studies in Language Testing 34", "ielts", "", "Tập nghiên cứu chính thức về giá trị cấu trúc hai kỹ năng."),
    ("Taylor, L. & Falvey, P. (Eds.)", 2007, "IELTS Collected Papers: Research in Speaking and Writing Assessment", "Cambridge University Press, Studies in Language Testing 19", "ielts", "", "Tập nghiên cứu chính thức về nói và viết."),
    ("Cronbach, L. J.", 1951, "Coefficient Alpha and the Internal Structure of Tests", "Psychometrika, 16(3), 297-334", "framework", "", "Nền tảng độ tin cậy nội nhất của bài trắc nghiệm."),
    ("Messick, S.", 1989, "Validity", "In Educational Measurement (3rd ed.), 13-103", "framework", "", "Khung giá trị thống nhất trong đo lường giáo dục."),
    ("Bachman, L. F.", 1990, "Fundamental Considerations in Language Testing", "Oxford University Press", "framework", "", "Mô hình năng lực ngôn ngữ giao tiếp."),
    ("Bachman, L. F. & Palmer, A. S.", 1996, "Language Testing in Practice", "Oxford University Press", "framework", "", "Cách thiết kế và lập luận giá trị cho bài thi."),
    ("Weir, C. J.", 2005, "Language Testing and Validation: An Evidence-Based Approach", "Palgrave Macmillan", "framework", "", "Khung validation dựa trên bằng chứng."),
    ("Kane, M. T.", 2006, "Validation", "In Educational Measurement (4th ed.), 17-64", "framework", "", "Chuỗi lập luận giá trị theo phương pháp Kane."),
    ("Chapelle, C. A., Enright, M. K. & Jamieson, J. M.", 2008, "Building a Validity Argument for the Test of English as a Foreign Language", "Routledge", "framework", "", "Mẫu hình lập luận giá trị cho bài thi tiếng Anh quy mô lớn."),
    ("Kunnan, A. J.", 1998, "An Introduction to Structural Equation Modelling for Language Assessment Research", "Language Testing, 15(3), 295-332", "framework", "", "Mô hình cấu trúc tuyến tính trong nghiên cứu đánh giá."),
    ("Shohamy, E.", 2001, "The Power of Tests: A Critical Perspective on the Uses of Language Tests", "Longman", "framework", "", "Góc nhìn phản biện về hệ quả xã hội của thi cử."),
    ("Council of Europe", 2001, "Common European Framework of Reference for Languages: Learning, Teaching, Assessment", "Cambridge University Press", "framework", "", "Khung tham chiếu CEFR gốc."),
    ("Council of Europe", 2020, "CEFR Companion Volume with New Descriptors", "Council of Europe Publishing", "framework", "", "Bổ sung mô tả năng lực và mức độ CEFR."),
    ("Hughes, A.", 2003, "Testing for Language Teachers (2nd ed.)", "Cambridge University Press", "framework", "", "Sổ tay thực hành thiết kế đề thi cho giáo viên."),
    ("McNamara, T.", 2000, "Language Testing", "Oxford University Press", "framework", "", "Giới thiệu toàn cảnh ngành đánh giá ngôn ngữ."),
    ("Fulcher, G.", 2010, "Practical Language Testing", "Hodder Education", "framework", "", "Quy trình biên soạn đề và rubric chấm điểm."),
    ("Xi, X.", 2008, "Methods of Test Validation", "In Encyclopedia of Language and Education, Vol. 7", "framework", "", "Tổng hợp phương pháp kiểm chứng giá trị bài thi."),
    ("Weir, C. J., Hawkey, R., Green, A., Unaldi, A. & Devi, S.", 2012, "The Relationship Between the Academic Reading Construct as Measured by IELTS and the Reading Experiences of Students in Their First Year of Study at a British University", "In Taylor & Weir (2012), 37-119", "reading", "", "Đối chiếu yêu cầu đọc trong IELTS với thực tế đại học."),
    ("Moore, T., Morton, J. & Price, S.", 2012, "Construct Validity in the IELTS Academic Reading Test: A Comparison of Reading Requirements in IELTS Test Items and in University Study", "In Taylor & Weir (2012), 120-170", "reading", "", "So sánh cấu trúc đề đọc với nhiệm vụ học thuật thật."),
    ("Weir, C. J., Hawkey, R., Green, A. & Devi, S.", 2012, "The Cognitive Processes Underlying the Academic Reading Construct as Measured by IELTS", "In Taylor & Weir (2012), 171-230", "reading", "", "Phân tích quá trình nhận thức khi làm bài đọc."),
    ("Green, A. & Hawkey, R.", 2012, "The Process of Writing Test Items for the IELTS Academic Reading Test", "In Taylor & Weir (2012), 231-300", "reading", "", "Quy trình biên soạn câu hỏi đọc học thuật."),
    ("Alderson, J. C.", 2000, "Assessing Reading", "Cambridge University Press", "reading", "", "Giáo trình nền tảng về đánh giá kỹ năng đọc."),
    ("Grabe, W.", 2009, "Reading in a Second Language: Moving from Theory to Practice", "Cambridge University Press", "reading", "", "Từ mô hình xử lý đọc tới hoạt động lớp học."),
    ("Urquhart, A. H. & Weir, C. J.", 1998, "Reading in a Second Language: Process, Product and Practice", "Longman", "reading", "", "Ba chiều quá trình - kết quả - luyện tập của đọc L2."),
    ("Read, J.", 2000, "Assessing Vocabulary", "Cambridge University Press", "reading", "", "Đo lường vốn từ trong bài đọc học thuật."),
    ("Nation, I. S. P.", 2013, "Learning Vocabulary in Another Language (2nd ed.)", "Cambridge University Press", "reading", "", "Khung bốn chiều: form, meaning, use và độ phủ từ vựng."),
    ("Schmitt, N.", 2010, "Researching Vocabulary", "Palgrave Macmillan", "reading", "", "Phương pháp nghiên cứu và dạy từ vựng."),
    ("Field, J.", 2012, "The Cognitive Validity of the Lecture-Based Question in the IELTS Listening Paper", "In Taylor & Weir (2012), 391-453", "listening", "", "Kiểm chứng quá trình nhận thức khi nghe bài giảng."),
    ("Field, J.", 2008, "Listening in the Language Classroom", "Cambridge University Press", "listening", "", "Phân biệt cách tiếp cận bottom-up và top-down."),
    ("Buck, G.", 2001, "Assessing Listening", "Cambridge University Press", "listening", "", "Khung cấu trúc năng lực nghe và dạng câu hỏi."),
    ("Vandergrift, L. & Goh, C. C. M.", 2012, "Teaching and Learning Second Language Listening: Metacognition in Action", "Routledge", "listening", "", "Chiến lược siêu nhận thức cho người học nghe L2."),
    ("Badger, R. & Yan, X.", 2012, "The Use of Tactics and Strategies by Chinese Students in IELTS Listening", "In Taylor & Weir (2012)", "listening", "", "Chiến thuật làm bài nghe của người học châu Á."),
    ("Benoit, C., Grice, M. & Hazan, V.", 1996, "The SUS Test: A Method for the Assessment of Text-to-Speech Synthesis Intelligibility Using Semantically Unpredictable Sentences", "Speech Communication, 18(4), 381-392", "listening", "", "Câu ngữ nghĩa bất ngờ và độ dễ hiểu của lời nói."),
    ("De Loof, E., Ergo, K., Naert, L., Janssens, C., Talsma, D., Van Opstal, F. & Verguts, T.", 2018, "Signed Reward Prediction Errors Drive Declarative Learning", "PLOS ONE, 13(1), e0189212", "listening", "10.1371/journal.pone.0189212", "Câu bất ngờ tạo tín hiệu phần thưởng giúp ghi nhớ tốt hơn."),
    ("Baddeley, A.", 1992, "Working Memory", "Science, 255(5044), 556-559", "listening", "", "Giới hạn bộ nhớ làm việc khi xử lý chuỗi âm thanh."),
    ("Shaw, S. D. & Weir, C. J.", 2007, "Examining Writing in a Second Language", "Cambridge University Press, Studies in Language Testing 26", "writing", "", "Khung validation cho bài viết L2."),
    ("Weigle, S. C.", 2002, "Assessing Writing", "Cambridge University Press", "writing", "", "Thiết kế rubric và độ tin cậy giám khảo."),
    ("Hamp-Lyons, L.", 1991, "Assessing Second Language Writing in Academic Contexts", "Ablex", "writing", "", "Đánh giá viết trong bối cảnh học thuật."),
    ("Cumming, A.", 2005, "Writing in a Second Language", "In Handbook of Research in Second Language Teaching and Learning", "writing", "", "Tổng quan nghiên cứu về quá trình viết L2."),
    ("Hyland, K.", 2003, "Second Language Writing", "Cambridge University Press", "writing", "", "Thể loại và diễn ngôn học thuật."),
    ("Swales, J. M.", 1990, "Genre Analysis: English in Academic and Research Settings", "Cambridge University Press", "writing", "", "Mô hình phân tích thể loại cho bài luận học thuật."),
    ("Laufer, B. & Hulstijn, J.", 2001, "Incidental Vocabulary Acquisition in a Second Language: The Construct of Task-Based Involvement", "Applied Linguistics, 22(1), 1-26", "method", "", "Giả thuyết tải trọng tham gia (need, search, evaluation)."),
    ("Hulstijn, J. H. & Laufer, B.", 2001, "Some Empirical Evidence for the Involvement Load Hypothesis", "Language Learning, 51(1), 87-113", "method", "", "Bằng chứng thực nghiệm cho nhiệm vụ có tải nhận thức cao."),
    ("Brown, A. & Hill, K.", 2007, "Interviewer Style and Candidate Performance in the IELTS Oral Interview", "In Taylor & Falvey (2007)", "speaking", "", "Ảnh hưởng của phong cách giám khảo lên band Nói."),
    ("Brown, A.", 2007, "An Investigation of the Rating Process in the IELTS Oral Interview", "In Taylor & Falvey (2007)", "speaking", "", "Quá trình chấm điểm nói và độ tin cậy giám khảo."),
    ("O'Loughlin, K.", 2007, "An Investigation into the Role of Gender in the IELTS Oral Interview", "In Taylor & Falvey (2007)", "speaking", "", "Yếu tố giới tính trong tương tác phỏng vấn."),
    ("Luoma, S.", 2004, "Assessing Speaking", "Cambridge University Press", "speaking", "", "Khung năng lực nói và tiêu chí chấm."),
    ("Plough, I., Banerjee, J. & Iwashita, N.", 2018, "Interactional Competence: Genie Out of the Bottle", "Language Testing, 35(3), 427-445", "speaking", "", "Năng lực tương tác trong bài phỏng vấn nói."),
    ("Douglas, D.", 2000, "Assessing Languages for Specific Purposes", "Cambridge University Press", "speaking", "", "Bối cảnh hoá nhiệm vụ nói theo mục đích."),
    ("Jiang, X., Rollinson, J., Plonsky, L., Gustafson, E. & Pajak, B.", 2022, "Evaluating the Reading and Listening Outcomes of Beginning-Level Duolingo Courses", "Foreign Language Annals, 54(4), 974-1002", "method", "10.1111/flan.12600", "Kết quả học tương đương bốn học kỳ đại học ở trình độ khởi đầu."),
    ("Rachels, J. R. & Rockinson-Szapkiw, A. J.", 2018, "The Effects of a Mobile Gamification App on Elementary Students' Spanish Achievement and Self-Efficacy", "Computer Assisted Language Learning, 31(1-2), 72-89", "method", "10.1080/09588221.2017.1382536", "Gamification không hơn lớp học nhưng nâng cảm nhận hiệu quả bản thân."),
    ("Yancey, K. P. & Settles, B.", 2020, "A Sleeping, Recovering Bandit Algorithm for Optimizing Recurring Notifications", "KDD '20, 3008-3016", "method", "10.1145/3394486.3403351", "Thuật toán chọn thời điểm nhắc học phù hợp từng người."),
    ("Huynh, D., Zuo, L. & Iida, H.", 2016, "Analyzing Gamification of Duolingo with Focus on its Course Structure", "GALA 2016, LNCS 10056, 268-277", "method", "", "Phân rã cấu trúc khoá học theo cơ chế trò chơi."),
    ("Saad, S. M. & Rahim, N. A. A.", 2022, "Vocabulary Acquisition Using Duolingo in French Language Learning: A Malaysian Context", "E-Bangi, 19(2), 256-281", "method", "", "Ứng dụng gamification phù hợp người mới học từ vựng."),
    ("Kim, S. K. & Webb, S.", 2022, "The Effects of Spaced Practice on Second Language Learning: A Meta-Analysis", "Language Learning, 72(1)", "method", "", "Phân tích tổng hợp: luyện tập phân tán có hiệu ứng trung bình - lớn."),
    ("Kim, S. K. & Webb, S.", 2023, "Does Spaced Practice Have the Same Effects on Different Second Language Vocabulary Learning Activities? Fill-in-the-Blanks versus Flashcards", "The Modern Language Journal, 107(4)", "method", "10.1111/modl.12879", "So sánh flashcard và điền khuyết trong ôn tập ngắt quãng."),
    ("Nakata, T.", 2015, "Effects of Expanding and Equal Spacing on Second Language Vocabulary Learning", "Studies in Second Language Acquisition, 37(4), 677-711", "method", "10.1017/S0272263114000825", "Khoảng cách đều và tăng dần tương đương về hiệu quả."),
    ("Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T. & Rohrer, D.", 2006, "Distributed Practice in Verbal Recall Tasks: A Review and Quantitative Synthesis", "Psychological Bulletin, 132(3), 354-380", "method", "", "Tổng quan định lượng kinh điển về hiệu ứng phân tán."),
    ("Karpicke, J. D. & Bauernschmidt, S. T.", 2011, "Spaced Retrieval: Absolute Spacing Enhances Learning Regardless of Relative Spacing", "Journal of Experimental Psychology: Learning, Memory, and Cognition, 37(5), 1250-1257", "method", "", "Khoảng cách tuyệt đối quyết định ghi nhớ dài hạn."),
    ("Roediger, H. L. & Karpicke, J. D.", 2006, "Test-Enhanced Learning: Taking Memory Tests Improves Long-Term Retention", "Psychological Science, 17(3), 249-255", "method", "", "Kiểm tra chủ động mạnh hơn ôn đọc lại."),
    ("Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J. & Willingham, D. T.", 2013, "Improving Students' Learning with Effective Learning Techniques", "Psychological Science in the Public Interest, 14(1), 4-58", "method", "", "Xếp hạng hiệu quả của mười kỹ thuật học tập."),
    ("Bjork, R. A. & Bjork, E. L.", 2011, "Making Things Hard on Yourself, but in a Good Way", "In Psychology and the Real World, 56-64", "method", "", "Khó khăn mong muốn (desirable difficulties)."),
    ("Ebbinghaus, H.", 1913, "Memory: A Contribution to Experimental Psychology", "Teachers College, Columbia University", "method", "", "Đường cong quên lãng và nguồn gốc ôn tập ngắt quãng."),
    ("Chukharev-Hudilainen, E. & Klepikova, T. A.", 2016, "The Effectiveness of Computer-Based Spaced Repetition in Foreign Language Vocabulary Instruction: A Double-Blind Study", "CALICO Journal, 33(3), 334-354", "method", "10.1558/cj.v33i3.26055", "Ba phút mỗi ngày tăng gần ba lần ghi nhớ dài hạn."),
    ("Seibert Hanson, A. E. & Brown, C. M.", 2020, "Enhancing L2 Learning Through a Mobile Assisted Spaced-Repetition Tool: An Effective but Bitter Pill?", "Computer Assisted Language Learning, 33(1-2), 133-155", "method", "", "Hiệu quả đi kèm thách thức về duy trì động lực."),
    ("Lafleur, L.", 2024, "The Effects of Interleaved Spaced Repetition and Gamification on Digital Flashcard Vocabulary Learning in Foreign Language Education", "Doctoral dissertation, Kyoto University", "method", "10.13140/RG.2.2.14365.32480", "Ôn xen kẽ kết hợp phần thưởng hàng ngày."),
    ("Webb, S.", 2007, "The Effects of Repetition on Vocabulary Knowledge", "Applied Linguistics, 28(1), 46-65", "method", "", "Số lần tiếp xúc và các lớp kiến thức từ vựng."),
    ("Pellicer-Sanchez, A.", 2016, "Incidental L2 Vocabulary Acquisition From and While Reading", "Studies in Second Language Acquisition, 38(1), 97-130", "method", "", "Học từ vựng qua đọc: ý nghĩa, hình thức và tốc độ."),
    ("Deterding, S., Dixon, D., Khaled, R. & Nacke, L.", 2011, "From Game Design Elements to Gamefulness: Defining Gamification", "MindTrek '11, 9-15", "method", "", "Định nghĩa học thuật về gamification."),
    ("Hamari, J., Koivisto, J. & Sarsa, H.", 2014, "Does Gamification Work? A Literature Review of Empirical Studies on Gamification", "HICSS '14, 3025-3034", "method", "", "Tổng quan bằng chứng thực nghiệm về gamification."),
    ("Sailer, M., Hense, J. U., Mayr, S. K. & Mandl, H.", 2017, "How Gamification Motivates: An Experimental Study of the Effects of Specific Game Design Elements on Psychological Need Satisfaction", "Computers in Human Behavior, 69, 371-383", "method", "", "Cơ chế thoả mãn nhu cầu tự chủ, năng lực, gắn kết."),
    ("Deci, E. L., Koestner, R. & Ryan, R. M.", 1999, "A Meta-Analytic Review of Experiments Examining the Effects of Extrinsic Rewards on Intrinsic Motivation", "Psychological Bulletin, 125(6), 627-668", "method", "", "Cảnh báo lạm dụng phần thưởng bên ngoài."),
    ("Ryan, R. M. & Deci, E. L.", 2000, "Self-Determination Theory and the Facilitation of Intrinsic Motivation", "American Psychologist, 55(1), 68-78", "method", "", "Lý thuyết tự quyết: nền tảng thiết kế động lực bền vững."),
    ("Locke, E. A. & Latham, G. P.", 2002, "Building a Practically Useful Theory of Goal Setting and Task Motivation", "American Psychologist, 57(9), 705-717", "method", "", "Mục tiêu cụ thể, vừa sức và phản hồi giúp tăng hiệu suất."),
    ("Bandura, A.", 1997, "Self-Efficacy: The Exercise of Control", "W. H. Freeman", "method", "", "Cảm nhận hiệu quả bản thân và duy trì nỗ lực."),
    ("Csikszentmihalyi, M.", 1990, "Flow: The Psychology of Optimal Experience", "Harper & Row", "method", "", "Cân bằng độ khó - kỹ năng để đạt trạng thái dòng chảy."),
    ("Fogg, B. J.", 2009, "A Behavior Model for Persuasive Design", "Persuasive '09, LNCS 5921", "method", "", "Động lực - khả năng - tín hiệu kích hoạt hành vi."),
    ("Fians, G.", 2021, "Esperanto Revolutionaries and Geeks: Language Politics, Digital Media and the Making of an International Community", "Palgrave Macmillan", "method", "", "Cộng đồng học ngôn ngữ và động lực xã hội."),
]

TOPICS = {
    "ielts": "Giá trị, độ tin cậy & washback của IELTS",
    "framework": "Khung đo lường, validation & CEFR",
    "reading": "Đọc học thuật & từ vựng",
    "listening": "Nghe & xử lý nhận thức",
    "writing": "Viết học thuật & rubric",
    "speaking": "Nói & tương tác phỏng vấn",
    "method": "Khoa học học tập, SRS & gamification",
}


def scholar_url(authors: str, year: int, title: str) -> str:
    return "https://scholar.google.com/scholar?q=" + quote_plus(f"{authors} {year} {title}")


def main() -> None:
    items = []
    for index, (authors, year, title, venue, topic, doi, note) in enumerate(REFS, start=1):
        items.append({
            "id": f"S{index:03d}",
            "authors": authors,
            "year": year,
            "title": title,
            "venue": venue,
            "topic": topic,
            "topicLabel": TOPICS[topic],
            "doi": doi,
            "doiUrl": f"https://doi.org/{doi}" if doi else "",
            "scholar": scholar_url(authors, year, title),
            "note": note,
        })
    data = {
        "title": "Thư mục học thuật YYSD IELTS",
        "language": "vi",
        "description": "Tham chiếu thư mục phục vụ tài liệu PDF tiếng Việt; mỗi mục có liên kết tra cứu scholar.google.com.",
        "licenseNote": "Chỉ lưu thông tin thư mục và liên kết tra cứu, không sao chép toàn văn bài báo.",
        "generated": "2026-11-18",
        "count": len(items),
        "topics": TOPICS,
        "sources": items,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    write_html(data)
    print(f"[sources] {len(items)} tham chiếu · {len(TOPICS)} nhóm · {OUT}")


def esc(value: str) -> str:
    from html import escape
    return escape(value, quote=True)


def write_html(data: dict) -> None:
    """Trang tĩnh liệt kê toàn bộ thư mục — thân thiện SEO và không cần JS."""
    from html import escape
    grouped = {}
    for src in data["sources"]:
        grouped.setdefault(src["topic"], []).append(src)
    parts = [
        "<!DOCTYPE html>", '<html lang="vi">', "<head>",
        '<meta charset="UTF-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1">',
        "<title>Thư mục học thuật · YYSD IELTS</title>",
        '<meta name="description" content="Thư mục học thuật tiếng Việt với 90 liên kết tra cứu Google Scholar về IELTS, bốn kỹ năng và khoa học học tập.">',
        '<link rel="stylesheet" href="assets/css/app.css">', "</head><body>",
        '<main class="wrap">',
        '<header class="chrome"><div class="wrap chrome__inner">',
        '<a class="brand" href="./"><span class="brand__mark" aria-hidden="true">Y</span>',
        "<span><b>YYSD IELTS</b><small>Thư viện nghiên cứu tiếng Việt</small></span></a>",
        '<nav aria-label="Điều hướng chính"><a href="./">Ứng dụng</a>',
        '<a href="#thu-muc">Thư mục</a></nav></div></header>',
        '<section class="hero"><p class="eyebrow">GOOGLE SCHOLAR · 90 NGUỒN</p>',
        "<h1>Thư mục học thuật YYSD IELTS</h1>",
        '<p class="lead">Mỗi mục gồm thông tin thư mục, ghi chú tiếng Việt và liên kết tra cứu trực tiếp trên scholar.google.com. Nhan đề học thuật giữ nguyên tiếng Anh để bảo đảm khả năng kiểm chứng.</p>',
        '<p><a class="btn btn--primary" href="https://scholar.google.com/" target="_blank" rel="noopener">Mở Google Scholar ↗</a>',
        '<a class="btn btn--ghost" href="pdfs/01-tong-quan-nghien-cuu-ielts.pdf">Tải PDF tổng quan</a></p>',
        "</section>",
        '<section id="thu-muc" class="panel"><h2>Toàn bộ nguồn theo nhóm</h2>',
        f'<p class="muted">{data["count"]} nguồn · {len(data["topics"])} nhóm · cập nhật {data["generated"]}.',
        "Chỉ lưu thông tin thư mục, không sao chép toàn văn bài báo có bản quyền.</p>",
    ]
    for topic, items in grouped.items():
        parts.append(f'<h3>{esc(items[0]["topicLabel"])} ({len(items)})</h3><ol class="board">')
        for src in items:
            doi = (f' · <a href="{esc(src["doiUrl"])}" target="_blank" rel="noopener">DOI {esc(src["doi"])}</a>'
                   if src["doiUrl"] else "")
            parts.append(
                "<li><div><strong>" + esc(src["authors"]) + f" ({src['year']}).</strong> "
                + "<em>" + esc(src["title"]) + "</em>. " + esc(src["venue"]) + "."
                + doi + '<br><span class="muted">' + esc(src["note"]) + "</span> "
                + f'<a href="{esc(src["scholar"])}" target="_blank" rel="noopener">Tra cứu trên Google Scholar ↗</a>'
                + "</div></li>"
            )
        parts.append("</ol>")
    parts += [
        "</section>", '<footer class="footer"><div class="wrap">',
        "<p>Giao diện tiếng Việt · đề thi và nhan đề học thuật giữ nguyên tiếng Anh.</p>",
        "<p>Bản quyền 2026 · YYSD Test Center</p></div></footer></main></body></html>",
    ]
    target = OUT.parent.parent / "nghien-cuu.html"
    target.write_text("\n".join(parts) + "\n", encoding="utf-8")
    print(f"[sources] {target} · {data['count']} liên kết Scholar")


if __name__ == "__main__":
    main()
