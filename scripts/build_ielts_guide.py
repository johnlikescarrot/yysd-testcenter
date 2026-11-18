#!/usr/bin/env python3
"""Build YYSD's Vietnamese IELTS guide; requires reportlab and DejaVu fonts."""
from html import escape
from pathlib import Path
from urllib.parse import quote

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    HRFlowable,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
)

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "docs/ielts/cam-nang-ielts.pdf"
FONT_DIR = Path("/usr/share/fonts/truetype/dejavu")
pdfmetrics.registerFont(TTFont("DejaVu", str(FONT_DIR / "DejaVuSans.ttf")))
pdfmetrics.registerFont(TTFont("DejaVuBold", str(FONT_DIR / "DejaVuSans-Bold.ttf")))
pdfmetrics.registerFontFamily("DejaVu", normal="DejaVu", bold="DejaVuBold")

# Bibliographic details checked against publisher, journal, or institutional records.
SOURCES = [
    ("Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013).", "Improving Students’ Learning With Effective Learning Techniques: Promising Directions From Cognitive and Educational Psychology", "Psychological Science in the Public Interest, 14(1), 4–58.", "10.1177/1529100612453266"),
    ("Kim, S. K., & Webb, S. (2022).", "The Effects of Spaced Practice on Second Language Learning: A Meta-Analysis", "Language Learning, 72, 269–319.", "10.1111/lang.12479"),
    ("Latimier, A., Peyre, H., & Ramus, F. (2021).", "A Meta-Analytic Review of the Benefit of Spacing out Retrieval Practice Episodes on Retention", "Educational Psychology Review, 33, 959–987.", "10.1007/s10648-020-09572-8"),
    ("Nakata, T. (2017).", "Does Repeated Practice Make Perfect? The Effects of Within-Session Repeated Retrieval on Second Language Vocabulary Learning", "Studies in Second Language Acquisition, 39(4), 653–679.", "10.1017/S0272263116000280"),
    ("Kim, S. K., & Webb, S. (2023).", "Does spaced practice have the same effects on different second language vocabulary learning activities? Fill-in-the-blanks versus flashcards", "The Modern Language Journal, 107, 944–964.", "10.1111/modl.12879"),
    ("Maie, R., Oikawa, G., Chen, Y., & Uchihara, T. (2025).", "Cumulative Testing for L2 Vocabulary Learning: The Impact of Retrieval Practice and Proficiency", "TESOL Quarterly, 59, 1979–2008.", "10.1002/tesq.3391"),
    ("Rogers, J., & Cheung, A. (2021).", "Does it matter when you review? Input spacing, ecological validity, and the learning of L2 vocabulary", "Studies in Second Language Acquisition, 43(5), 1138–1156.", "10.1017/S0272263120000236"),
    ("Shortt, M., Tilak, S., Kuznetcova, I., Martens, B., & Akinkuolie, B. (2023).", "Gamification in mobile-assisted language learning: a systematic review of Duolingo literature from public release of 2012 to early 2020", "Computer Assisted Language Learning, 36(3), 517–554.", "10.1080/09588221.2021.1933540"),
    ("Rachels, J. R., & Rockinson-Szapkiw, A. J. (2018).", "The effects of a mobile gamification app on elementary students’ Spanish achievement and self-efficacy", "Computer Assisted Language Learning, 31(1–2), 72–89.", "10.1080/09588221.2017.1382536"),
    ("Zhang, X. (2025).", "Vocabulary knowledge towards L2 reading and listening performance", "Reading in a Foreign Language, 37(2), 109–126.", "10.64152/10125/67500"),
    ("Terai, M., Yamashita, J., & Pasich, K. E. (2021).", "Effects of Learning Direction in Retrieval Practice on EFL Vocabulary Learning", "Studies in Second Language Acquisition, 43(5), 1116–1137.", "10.1017/S0272263121000346"),
    ("Smith, S. (2019).", "IELTS Vocabulary: Ensuring Prepared Students", "The TESOL Encyclopedia of English Language Teaching.", "10.1002/9781118784235.eelt0761"),
]

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="TitleVI", fontName="DejaVuBold", fontSize=24, leading=33, textColor=colors.HexColor("#102a4c"), spaceAfter=14))
styles.add(ParagraphStyle(name="SubtitleVI", fontName="DejaVu", fontSize=11, leading=18, textColor=colors.HexColor("#426a55"), spaceAfter=14))
styles.add(ParagraphStyle(name="HeadingVI", fontName="DejaVuBold", fontSize=14, leading=20, textColor=colors.HexColor("#102a4c"), spaceBefore=12, spaceAfter=8, keepWithNext=True))
styles.add(ParagraphStyle(name="BodyVI", fontName="DejaVu", fontSize=9.4, leading=15.5, textColor=colors.HexColor("#263b34"), spaceAfter=8))
styles.add(ParagraphStyle(name="SmallVI", fontName="DejaVu", fontSize=8.2, leading=13, textColor=colors.HexColor("#40554b"), spaceAfter=6))
styles.add(ParagraphStyle(name="RefVI", fontName="DejaVu", fontSize=8.3, leading=13.4, textColor=colors.HexColor("#263b34"), spaceAfter=10, wordWrap="CJK"))
styles.add(ParagraphStyle(name="CoverNoteVI", fontName="DejaVu", fontSize=9, leading=15, alignment=TA_CENTER, textColor=colors.HexColor("#51665a")))

story = []


def add(text, style="BodyVI"):
    story.append(Paragraph(text, styles[style]))


def heading(text):
    add(text, "HeadingVI")


def link(label, url):
    return f'<link href="{escape(url, quote=True)}" color="#315e47">{escape(label)}</link>'


add("YYSD · CẨM NANG HỌC TẬP", "SubtitleVI")
add("Hành trình IELTS<br/>của bạn", "TitleVI")
add("Một hướng dẫn ngắn bằng tiếng Việt: hiểu bài thi, học đều đặn và kiểm tra điều mình đã học.", "SubtitleVI")
story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#b9cbb8"), spaceAfter=12))
heading("Trước khi bắt đầu")
add("Cẩm nang này hỗ trợ tự học, không phải tài liệu IELTS chính thức và không dự đoán band điểm. Các bài học ngắn trong YYSD là bài tập do nhóm biên soạn; chúng không thay thế đề thi đầy đủ, phản hồi của giáo viên hoặc luyện nói với người thật.")
add("Các hướng dẫn về cấu trúc bên dưới dành cho <b>IELTS Academic</b>. Academic và General Training có phần Reading và Writing khác nhau; hãy xác nhận thông tin hiện hành tại IELTS.org trước ngày thi.")
heading("Nhìn nhanh cấu trúc IELTS Academic")
add("<b>Listening:</b> khoảng 30 phút, 4 phần, 40 câu. <b>Reading:</b> 60 phút, 3 phần, 40 câu. Với IELTS Online, người thi nghe mỗi bản ghi một lần. Thời gian chuyển đáp án có thể khác theo hình thức thi; xem hướng dẫn chính thức cho hình thức bạn chọn.")
add("<b>Writing:</b> 60 phút cho hai bài. Task 1 yêu cầu ít nhất 150 từ; Task 2 ít nhất 250 từ và có trọng số gấp đôi Task 1. <b>Speaking:</b> 11–14 phút, ba phần, với giám khảo. Nguồn: " + link("IELTS Online", "https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-online") + "; " + link("Academic Reading", "https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-reading") + "; " + link("Academic Writing", "https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-writing") + ".")
heading("Những tiêu chí cần nhớ")
add("Writing được đánh giá theo đáp ứng yêu cầu đề, mạch lạc và liên kết, vốn từ, cùng phạm vi và độ chính xác ngữ pháp. Speaking được đánh giá theo độ trôi chảy và mạch lạc, vốn từ, ngữ pháp và phát âm. Hãy kiểm tra mô tả chính thức thay vì ghi nhớ các mẹo đoán điểm.")
story.append(PageBreak())
heading("Học ít nhưng có chủ đích")
add("<b>1. Tự nhớ trước khi xem đáp án.</b> Che phần giải thích, thử tự trả lời, rồi kiểm tra và sửa lỗi. Tổng quan nghiên cứu đánh giá cao thực hành truy hồi và học giãn cách [1–3]. Tác dụng phụ thuộc nhiệm vụ, người học và cách áp dụng; không có kỹ thuật nào đảm bảo kết quả cho mọi người.")
add("<b>2. Ôn lại sau một khoảng thời gian.</b> Dành vài phút để xem lại từ hoặc câu đã học, đặc biệt là lỗi cũ. Nghiên cứu về ngôn ngữ thứ hai cho thấy học giãn cách có ích trong nhiều điều kiện [2, 5–7]. Lịch 1, 3, 7, 14 và 30 ngày trong ứng dụng chỉ là gợi ý thực hành, không phải lịch tối ưu đã được xác nhận cho từng cá nhân.")
add("<b>3. Đặt từ trong ngữ cảnh.</b> Ghi một cụm từ, một câu ví dụ và tình huống sử dụng, thay vì chỉ ghi bản dịch. Luyện nhận diện từ khi đọc, nghe và thử dùng trong nói hoặc viết [10–12].")
add("<b>4. Dùng điểm và chuỗi ngày như lời nhắc, không phải thước đo năng lực.</b> Trò chơi hóa có thể giúp trải nghiệm hấp dẫn hơn nhưng bằng chứng và kết quả còn khác nhau giữa các nghiên cứu [8–9]. Nếu bỏ lỡ một ngày, hãy tiếp tục mà không tự trách.")
heading("Một tuần gợi ý")
for line in [
    "<b>Ngày 1:</b> làm một bài từ vựng ngắn; viết hai câu có từ mới.",
    "<b>Ngày 2:</b> đọc một đoạn ngắn; gạch bằng chứng cho từng câu trả lời.",
    "<b>Ngày 3:</b> nghe một đoạn phù hợp trình độ; ghi số, ngày tháng và từ nối.",
    "<b>Ngày 4:</b> viết một đoạn có ý chính, ví dụ và câu kết; tự kiểm tra ngữ pháp.",
    "<b>Ngày 5:</b> nói về một chủ đề quen thuộc; nghe lại và tự nhận xét độ rõ ràng.",
    "<b>Ngày 6:</b> ôn các câu đến hạn; ghi lại lỗi còn lặp lại.",
    "<b>Ngày 7:</b> làm bài dài hơn hoặc nghỉ, rồi điều chỉnh kế hoạch cho tuần tới.",
]:
    add(line)
add("Điều chỉnh thời lượng theo sức khỏe, lịch sinh hoạt và nhu cầu của bạn. Các bài tập ngắn là bổ trợ, không phải bài thi thử đầy đủ.", "SmallVI")
story.append(PageBreak())
heading("Bốn kỹ năng: thực hành có phản hồi")
add("<b>Listening:</b> đọc yêu cầu trước khi nghe, dự đoán loại thông tin cần điền, sau đó kiểm tra chính tả và giới hạn số từ. Giọng máy trong ứng dụng chỉ giúp nhận diện từ và số, không mô phỏng độ dài, giọng nói hay áp lực của đề thi thật.")
add("<b>Reading:</b> xác định từ khóa rồi tìm câu chứa bằng chứng. Với TRUE / FALSE / NOT GIVEN, phân biệt thông tin khẳng định, thông tin mâu thuẫn và thông tin không được đề cập. Không suy diễn ngoài đoạn văn.")
add("<b>Writing:</b> phân tích yêu cầu, dành thời gian lập ý, rồi đọc lại theo bốn tiêu chí chính thức. Task 1 Academic cần một phần tổng quan về các đặc điểm quan trọng; Task 2 cần phát triển và hỗ trợ lập luận. Không có một khuôn mẫu câu nào tự bảo đảm band điểm.")
add("<b>Speaking:</b> luyện trả lời thành câu, phát triển ý bằng lý do hoặc ví dụ và ghi âm để tự nghe lại. Hãy tìm phản hồi từ giáo viên hoặc bạn học; ứng dụng không chấm phát âm hay đánh giá band Speaking.")
heading("Sử dụng nguồn nghiên cứu một cách thận trọng")
add("Các nghiên cứu sau được lựa chọn vì liên quan đến học ngôn ngữ, từ vựng, truy hồi hoặc trò chơi hóa. Đây không phải tổng quan hệ thống đầy đủ. Một số nghiên cứu về Duolingo xét bối cảnh, ngôn ngữ hoặc nhóm tuổi khác IELTS; không thể suy ra cùng hiệu quả cho mọi người học.")
add("DOI dẫn tới hồ sơ bài báo hoặc nhà xuất bản; liên kết Google Scholar là truy vấn tìm theo tiêu đề, không phải chính bài báo hay bằng chứng đã xác minh kết quả tìm kiếm. Hãy đọc bản gốc và kiểm tra năm, phương pháp, mẫu nghiên cứu cũng như quyền truy cập trước khi trích dẫn.")
heading("Nguồn chính thức")
add(link("IELTS: cách tính điểm", "https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail") + " · " + link("IELTS Academic: định dạng bài thi", "https://ielts.org/take-a-test/test-types/ielts-academic-test") + ".", "SmallVI")
story.append(PageBreak())
heading("Tài liệu nghiên cứu và liên kết tra cứu")
for number, (authors, title, journal, doi) in enumerate(SOURCES, 1):
    scholar = "https://scholar.google.com/scholar?q=" + quote('"' + title + '"')
    add(f"<b>[{number}] {escape(authors)}</b> {escape(title)}. <i>{escape(journal)}</i> " + link("DOI: " + doi, "https://doi.org/" + doi) + " · " + link("Tìm trên Google Scholar", scholar), "RefVI")
add("Ngày biên soạn: 18/11/2026. Thông tin bài thi có thể thay đổi; ưu tiên nguồn chính thức mới nhất.", "SmallVI")


def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("DejaVu", 8)
    canvas.setFillColor(colors.HexColor("#5b6e61"))
    canvas.drawString(20 * mm, 14 * mm, "YYSD · Cẩm nang học tập IELTS")
    canvas.drawRightString(190 * mm, 14 * mm, str(doc.page))
    canvas.restoreState()


document = SimpleDocTemplate(str(OUTPUT), pagesize=(210 * mm, 297 * mm), rightMargin=20 * mm, leftMargin=20 * mm, topMargin=20 * mm, bottomMargin=21 * mm, title="Hành trình IELTS của bạn", author="YYSD")
document.build(story, onFirstPage=footer, onLaterPages=footer)
print(f"Đã tạo {OUTPUT.relative_to(ROOT)}")
