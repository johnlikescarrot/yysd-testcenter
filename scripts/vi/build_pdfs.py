#!/usr/bin/env python3
"""Sinh 7 tài liệu PDF tiếng Việt cho thư viện, kèm danh mục trích dẫn Google Scholar.

Chạy: python3 scripts/vi/build_pdfs.py
Phụ thuộc: reportlab, font DejaVu (đã có sẵn trên hầu hết hệ Linux).
"""

import json
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (ListFlowable, ListItem, PageBreak, Paragraph,
                                SimpleDocTemplate, Spacer)

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "vi" / "data"
OUT = ROOT / "vi" / "library" / "pdf"
FONT_DIR = Path("/usr/share/fonts/truetype/dejavu")

NAVY = HexColor("#07192f")
GOLD = HexColor("#a98234")
INK = HexColor("#101827")
MUTED = HexColor("#55606f")
LINE = HexColor("#e5ddcd")

pdfmetrics.registerFont(TTFont("VI", str(FONT_DIR / "DejaVuSans.ttf")))
pdfmetrics.registerFont(TTFont("VI-Bold", str(FONT_DIR / "DejaVuSans-Bold.ttf")))
pdfmetrics.registerFont(TTFont("VI-Serif", str(FONT_DIR / "DejaVuSerif.ttf")))
pdfmetrics.registerFont(TTFont("VI-SerifBold", str(FONT_DIR / "DejaVuSerif-Bold.ttf")))
pdfmetrics.registerFontFamily("VI", normal="VI", bold="VI-Bold", italic="VI", boldItalic="VI-Bold")
pdfmetrics.registerFontFamily("VI-Serif", normal="VI-Serif", bold="VI-SerifBold",
                              italic="VI-Serif", boldItalic="VI-SerifBold")

styles = getSampleStyleSheet()
S = {
    "kicker": ParagraphStyle("kicker", fontName="VI-Bold", fontSize=9, leading=12,
                             textColor=GOLD, spaceAfter=6),
    "title": ParagraphStyle("title", fontName="VI-SerifBold", fontSize=26, leading=31,
                            textColor=NAVY, spaceAfter=10),
    "subtitle": ParagraphStyle("subtitle", fontName="VI", fontSize=11.5, leading=17,
                               textColor=MUTED, spaceAfter=18),
    "h1": ParagraphStyle("h1", fontName="VI-SerifBold", fontSize=17, leading=22,
                         textColor=NAVY, spaceBefore=14, spaceAfter=8),
    "h2": ParagraphStyle("h2", fontName="VI-Bold", fontSize=12, leading=17,
                         textColor=NAVY, spaceBefore=10, spaceAfter=4),
    "body": ParagraphStyle("body", fontName="VI", fontSize=10.5, leading=16.5,
                           textColor=INK, alignment=TA_JUSTIFY, spaceAfter=8),
    "small": ParagraphStyle("small", fontName="VI", fontSize=8.6, leading=12.5,
                            textColor=MUTED, spaceAfter=5),
    "ref": ParagraphStyle("ref", fontName="VI", fontSize=8.4, leading=12,
                          textColor=INK, spaceAfter=6, leftIndent=10, firstLineIndent=-10),
    "bullet": ParagraphStyle("bullet", fontName="VI", fontSize=10.2, leading=16,
                             textColor=INK, spaceAfter=4),
    "callout": ParagraphStyle("callout", fontName="VI", fontSize=9.8, leading=15,
                              textColor=INK, backColor=HexColor("#fdf8ec"),
                              borderColor=HexColor("#e5ddcd"), borderWidth=0.6,
                              borderPadding=8, spaceBefore=8, spaceAfter=12),
}


def load():
    papers = json.loads((DATA / "papers.json").read_text(encoding="utf-8"))["papers"]
    docs = json.loads((DATA / "pdfs.json").read_text(encoding="utf-8"))["docs"]
    return papers, docs


def scholar(title, authors):
    query = f"{title} {authors}".replace(" ", "+")
    return f"https://scholar.google.com/scholar?q={query}"


def ref_paragraph(paper):
    link = scholar(paper["title"], paper["authors"])
    doi = f" · https://doi.org/{paper['doi']}" if paper.get("doi") else ""
    text = (
        f"{escape(paper['authors'])} ({paper['year']}). <i>{escape(paper['title'])}</i>. "
        f"{escape(paper['venue'])}.{escape(doi)} "
        f'<link href="{link}" color="#72541a">Google Scholar</link>'
    )
    return Paragraph(text, S["ref"])


def bullets(items):
    return ListFlowable(
        [ListItem(Paragraph(escape(item), S["bullet"]), leftIndent=12) for item in items],
        bulletType="bullet", start="•", leftIndent=14, bulletFontSize=8, bulletColor=GOLD,
    )


SECTIONS = {
    "cam-nang-30-ngay": [
        ("Tuần 1 — Dựng lại thói quen", [
            "Mục tiêu của tuần đầu không phải là điểm số mà là sự đều đặn. Hãy chọn một khung giờ cố định 20 phút mỗi ngày, "
            "đặt mục tiêu 20 XP trong ứng dụng và chỉ học một bài ngắn. Nghiên cứu về luyện tập ngắt quãng cho thấy "
            "phân bổ thời gian thành nhiều buổi nhỏ hiệu quả hơn dồn vào cuối tuần, kể cả khi tổng thời gian bằng nhau.",
            "Trong tuần này, hãy học hết chương 1 (Skimming & Scanning) và chương 2 (Listening: số liệu). Mỗi bài chỉ 5–8 phút, "
            "nhưng hãy làm lại bài đã học sau 24 giờ. Việc làm lại không lãng phí: đó chính là lúc trí nhớ được củng cố.",
        ]),
        ("Tuần 2 — Từ vựng và phản xạ nghe", [
            "Bắt đầu ôn thẻ từ vựng mỗi ngày. Đánh giá trung thực: nếu bạn phải suy nghĩ hơn ba giây, hãy chọn “Khó” thay vì “Tốt”. "
            "Lịch ôn sẽ tự điều chỉnh: thẻ khó quay lại sớm, thẻ dễ giãn ra xa.",
            "Với phần nghe, nguyên tắc là nghe chép từng câu ngắn thay vì nghe cả đoạn dài. Nghe một câu, viết lại, rồi so với đáp án. "
            "Sai ở đâu, nghe lại đúng chỗ đó — đây là cách rèn nhận diện âm hiệu quả hơn nghe thụ động hàng giờ.",
        ]),
        ("Tuần 3 — Viết và nói có cấu trúc", [
            "Viết một bài Task 2 trong 40 phút, không tra từ điển. Sau khi viết xong, hãy tự chấm theo checklist bốn tiêu chí "
            "trước khi đọc bài mẫu. Khoảng cách giữa bài của bạn và bài mẫu chính là tài liệu học tập tốt nhất.",
            "Với Speaking, hãy ghi âm 2 phút cho một cue card, rồi nghe lại và ghi ra giấy những lần bạn dừng quá lâu. "
            "Đừng cố xoá hết khoảng dừng — hãy giảm dần số lần bí từ bằng các cụm ứng cứu.",
        ]),
        ("Tuần 4 — Kiểm tra và điều chỉnh", [
            "Làm một bài kiểm tra thử đầy đủ theo thời gian thật. Ghi lại điểm từng phần, sau đó quay lại Luyện tập để "
            "xử lý đúng kỹ năng yếu nhất, thay vì học lại phần mình đã giỏi.",
            "Cuối 30 ngày, hãy viết ra ba điều bạn làm tốt hơn so với ngày đầu. Đây không phải bài tập cảm xúc: "
            "nhìn thấy tiến bộ cụ thể là cách duy trì động lực bền vững nhất.",
        ]),
        ("Lỗi thường gặp", [
            "Học quá nhiều trong một ngày rồi nghỉ ba ngày. Chuỗi ngày trong ứng dụng được thiết kế để chống lại thói quen này, "
            "nhưng chỉ bạn mới giữ được nó.",
            "Đọc lời giải trước khi tự làm. Cảm giác “hiểu” khi đọc lời giải không giống với khả năng tự làm trong phòng thi.",
        ]),
    ],
    "tu-vung-hoc-thuat": [
        ("Học từ theo cụm, không học từ rời", [
            "Một từ chỉ thực sự thuộc về bạn khi bạn biết nó đi với giới từ nào, động từ nào, và trong ngữ cảnh nào. "
            "“Analyse” đi với “data”, “conduct” đi với “research”, “draw” đi với “conclusion”. Học các cụm này cùng lúc "
            "giúp bạn viết nhanh hơn và ít lỗi hơn.",
            "Trong ứng dụng, mỗi thẻ từ vựng có hai đến ba cụm kết hợp. Khi ôn, hãy tự đặt một câu mới với cụm đó — "
            "không cần dài, chỉ cần đúng.",
        ]),
        ("Ba cấp độ nhớ một từ", [
            "Cấp 1 — nhận ra: bạn thấy từ và biết nghĩa đại khái. Cấp 2 — nhớ lại: bạn đọc nghĩa tiếng Việt và viết được từ. "
            "Cấp 3 — sử dụng: bạn dùng từ đúng ngữ pháp trong một câu của mình.",
            "Bài kiểm tra trong ứng dụng chủ yếu đo cấp 2. Cấp 3 chỉ đạt được khi bạn viết và nói. Vì vậy đừng chỉ ôn thẻ — "
            "hãy viết một đoạn ngắn mỗi tuần có sử dụng 5 từ vừa học.",
        ]),
        ("Nhóm từ theo chủ đề thi", [
            "Môi trường: sustainable, renewable, emission, biodiversity, recycle. Đô thị: urbanisation, infrastructure, "
            "congestion, commute. Giáo dục: curriculum, tuition, literacy, inequality. Sức khoẻ: obesity, nutrition, wellbeing.",
            "Khi gặp đề Writing về một chủ đề, hãy lấy giấy nháp và viết ra 6–8 cụm thuộc chủ đề đó trước khi bắt đầu viết câu đầu tiên.",
        ]),
        ("Tự kiểm tra", [
            "Che cột nghĩa tiếng Việt và đọc to từ tiếng Anh. Với mỗi từ, hãy nói một câu hoàn chỉnh. "
            "Nếu bạn dừng hơn năm giây, từ đó cần quay lại lịch ôn sớm.",
            "Mỗi tuần chọn 10 từ khó nhất và viết một đoạn 100 từ. Đây là bài tập kết hợp từ vựng và viết — "
            "hai kỹ năng được chấm cùng lúc trong bài thi thật.",
        ]),
    ],
    "chien-luoc-reading": [
        ("Quy trình 3 bước cho mỗi bài đọc", [
            "Bước 1 (2 phút): đọc tiêu đề, đọc lướt câu đầu và câu cuối mỗi đoạn để nắm cấu trúc bài. "
            "Bước 2: đọc câu hỏi, gạch chân từ khoá, xác định dạng câu hỏi. Bước 3: quay lại bài, định vị đoạn chứa đáp án, "
            "đọc kỹ 2–3 câu xung quanh.",
            "Sai lầm phổ biến là đọc cả bài thật kỹ trước khi xem câu hỏi. Với 60 phút cho 40 câu, bạn không có thời gian cho việc đó.",
        ]),
        ("True / False / Not Given", [
            "Hãy hỏi ba câu theo thứ tự: (1) Bài có nói về điều này không? Nếu không → Not Given. "
            "(2) Bài nói giống hệt hoặc tương đương về nghĩa? → True. (3) Bài nói ngược lại? → False.",
            "Cẩn thận với các từ tuyệt đối trong câu hỏi: all, always, never, only. Nếu bài không khẳng định tuyệt đối như vậy, "
            "đáp án thường là False hoặc Not Given tuỳ vào việc bài có đề cập hay không.",
        ]),
        ("Matching headings", [
            "Đừng chọn heading vì nó có nhiều từ giống đoạn văn — đó là bẫy. Hãy đọc câu chủ đề, xác định ý khái quát, "
            "rồi tìm heading diễn đạt đúng ý đó bằng từ khác.",
            "Loại trừ trước: heading nào chỉ nói về một chi tiết nhỏ trong đoạn thì loại. Heading đúng phải bao quát được cả đoạn.",
        ]),
        ("Quản lý thời gian", [
            "Chia 60 phút: 17 phút cho passage 1, 20 phút cho passage 2, 23 phút cho passage 3. Luôn để lại 2–3 phút chuyển đáp án.",
            "Nếu một câu mất hơn 90 giây, hãy đánh dấu, chọn tạm và đi tiếp. Quay lại sau nếu còn thời gian.",
        ]),
    ],
    "listening-so-lieu": [
        ("Bốn nhóm lỗi mất điểm nhiều nhất", [
            "Thứ nhất: cặp số dễ nhầm (13/30, 14/40, 15/50). Thứ hai: giờ (quarter past, half past, quarter to). "
            "Thứ ba: đánh vần tên riêng. Thứ tư: chính tả số ít/số nhiều và đuôi động từ.",
            "Mỗi nhóm lỗi này có thể luyện riêng trong 10 phút/ngày và tiến bộ rất nhanh, vì bản chất là nhận diện âm chứ không phải hiểu nghĩa.",
        ]),
        ("Nghe chép chính tả đúng cách", [
            "Chọn câu 6–10 từ. Nghe một lần, viết những gì nghe được. Nghe lại lần hai, sửa. Chỉ sau đó mới xem đáp án. "
            "So sánh từng từ và khoanh tròn chỗ sai — đó là dữ liệu quý hơn điểm số.",
            "Không nghe lại quá ba lần cho một câu. Nếu vẫn không ra, đó là dấu hiệu bạn chưa nhận diện được âm đó, "
            "và cần luyện đúng âm thay vì nghe mò.",
        ]),
        ("Từ vựng hay viết sai", [
            "accommodation, environment, government, necessary, February, Wednesday, receipt, restaurant, separate, until. "
            "Đây là những từ xuất hiện trong đề và bị viết sai nhiều nhất.",
            "Mẹo: học theo nhóm lỗi chính tả (âm câm, phụ âm đôi, đuôi -tion) thay vì học từng từ rời.",
        ]),
        ("Trước khi nghe", [
            "Đọc trước câu hỏi trong thời gian chờ. Gạch chân từ khoá và dự đoán loại đáp án: số, tên, giá tiền hay thời gian. "
            "Dự đoán trước giúp bạn chỉ cần xác nhận khi nghe, thay vì xử lý từ đầu.",
        ]),
    ],
    "writing-task-2": [
        ("Khung bốn đoạn", [
            "Mở bài (40–50 từ): paraphrase đề và nêu quan điểm. Thân bài 1 (90–110 từ): luận điểm 1 + giải thích + ví dụ. "
            "Thân bài 2 (90–110 từ): luận điểm 2 hoặc nhượng bộ. Kết luận (35–45 từ): khẳng định lại quan điểm, không thêm ý mới.",
            "Giám khảo đọc bài của bạn một lần. Nếu cấu trúc không nhìn thấy được ngay, điểm Coherence sẽ thấp dù ý hay.",
        ]),
        ("Câu chủ đề và ví dụ", [
            "Mỗi đoạn thân bài mở bằng một câu nêu luận điểm cụ thể. Tránh câu chung chung như “Education is very important”. "
            "Thay vào đó: “Free tuition would widen access for low-income students”.",
            "Ví dụ nên cụ thể nhưng trung thực. Nếu không chắc số liệu, hãy dùng ví dụ định tính có bối cảnh rõ ràng, "
            "ví dụ một quốc gia hoặc một chính sách cụ thể mà bạn biết.",
        ]),
        ("Từ nối dùng đúng chỗ", [
            "Từ nối chỉ có giá trị khi quan hệ ý nghĩa thật sự rõ ràng. Một bài 250 từ cần khoảng 4–6 từ nối, không phải 15.",
            "Nhóm theo chức năng: bổ sung (furthermore, in addition), tương phản (however, whereas), "
            "nguyên nhân (because, due to), kết quả (therefore, as a result), ví dụ (for instance).",
        ]),
        ("Checklist trước khi nộp", [
            "Đã trả lời đúng toàn bộ câu hỏi chưa? Đã nêu quan điểm rõ chưa? Mỗi đoạn có một ý chính chưa? "
            "Có lỗi ngữ pháp nào lặp lại nhiều lần không? Bài có đủ 250 từ không?",
            "Đừng dành 5 phút cuối để “làm đẹp” câu chữ. Hãy dùng thời gian đó để sửa lỗi chia động từ và mạo từ — "
            "những lỗi này ảnh hưởng điểm Grammatical Range and Accuracy trực tiếp.",
        ]),
    ],
    "speaking-part-2": [
        ("Một phút chuẩn bị", [
            "Ghi bốn từ khoá, không viết câu. Ví dụ với cue card “describe a skill”: touch-type / 3 years / ten minutes daily / "
            "can think while typing. Bốn từ khoá này đủ để bạn nói hai phút mà không bị lạc.",
            "Đừng học thuộc bài nói. Giám khảo nhận ra ngay giọng đọc thuộc lòng và điểm Fluency sẽ bị ảnh hưởng.",
        ]),
        ("Khung hai phút", [
            "Mở (15 giây): giới thiệu chủ đề. Thân (75 giây): trả lời từng gạch đầu dòng của cue card, mỗi ý 2–3 câu. "
            "Kết (20 giây): cảm nhận hoặc bài học.",
            "Dùng dấu hiệu chuyển ý: “As for when…”, “What I remember most is…”, “Looking back…”. Chúng giúp bạn có thời gian nghĩ "
            "mà vẫn nghe tự nhiên.",
        ]),
        ("Cụm ứng cứu khi bí từ", [
            "“I can't remember the exact word, but it's a kind of…”, “What I mean is…”, “It's similar to… but…”, "
            "“Let me put it another way…”. Bốn cụm này che được gần như mọi khoảng trống từ vựng.",
            "Đừng im lặng. Im lặng dài bị trừ điểm Fluency nặng hơn việc diễn đạt vòng.",
        ]),
        ("Tự sửa phát âm", [
            "Ghi âm bằng điện thoại, nghe lại và chỉ chọn một lỗi để sửa trong tuần (ví dụ đuôi -s hoặc trọng âm từ). "
            "Sửa từng lỗi một hiệu quả hơn cố sửa tất cả cùng lúc.",
            "Đọc to các câu mẫu trong tài liệu này, nhưng đổi nội dung sang câu chuyện của bạn. Nói đúng cấu trúc với nội dung riêng "
            "là cách học nhanh nhất.",
        ]),
    ],
    "hieu-band-descriptors": [
        ("Bốn tiêu chí Writing", [
            "Task Response (trả lời đúng đề), Coherence and Cohesion (mạch lạc và liên kết), Lexical Resource (từ vựng), "
            "Grammatical Range and Accuracy (ngữ pháp). Điểm mỗi tiêu chí được làm tròn đến 0.5 rồi lấy trung bình.",
            "Sai lầm phổ biến: cố dùng từ khó nhưng sai ngữ cảnh. Điểm Lexical Resource đánh giá độ chính xác và khả năng kết hợp từ, "
            "không đánh giá độ hiếm của từ.",
        ]),
        ("Bốn tiêu chí Speaking", [
            "Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, Pronunciation. "
            "Điểm trung bình của bốn tiêu chí, làm tròn đến 0.5.",
            "Bạn không cần giọng bản ngữ. Bạn cần nói rõ, ngắt nghỉ hợp lý và dùng trọng âm câu để truyền đạt ý.",
        ]),
        ("Ví dụ band 5 và band 7", [
            "Band 5: “The government should to spend money for education because it is very important for everyone.” "
            "Band 7: “Governments should invest in education because a better-educated workforce raises long-term productivity.”",
            "Khác biệt không nằm ở từ dài hơn, mà ở cấu trúc chính xác và ý được phát triển cụ thể.",
        ]),
        ("Bảng quy đổi Reading và Listening", [
            "Reading học thuật: 39–40 câu đúng ≈ band 9; 30–32 ≈ 7.0; 23–26 ≈ 6.0; 15–18 ≈ 5.0. "
            "Listening: 39–40 ≈ 9; 30–31 ≈ 7.0; 23–25 ≈ 6.0; 16–17 ≈ 5.0.",
            "Bảng này là tham khảo, có thể chênh 0.5 band giữa các năm. Ứng dụng dùng bảng tương tự để ước lượng band của bạn "
            "từ độ chính xác khi luyện.",
        ]),
    ],
}


def draw_cover(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, A4[1] - 22 * mm, A4[0], 22 * mm, stroke=0, fill=1)
    canvas.setFillColor(GOLD)
    canvas.setFont("VI-Bold", 9)
    canvas.drawString(20 * mm, A4[1] - 13 * mm, "YYSD · IELTS VIỆT")
    canvas.setFillColor(HexColor("#f6ecd6"))
    canvas.setFont("VI", 8.5)
    canvas.drawRightString(A4[0] - 20 * mm, A4[1] - 13 * mm, "Học liệu có trích dẫn · 2026")
    canvas.restoreState()


def draw_footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.5)
    canvas.line(20 * mm, 16 * mm, A4[0] - 20 * mm, 16 * mm)
    canvas.setFont("VI", 7.6)
    canvas.setFillColor(MUTED)
    canvas.drawString(20 * mm, 11.5 * mm, "YYSD · IELTS Việt — tài liệu tham khảo, không thay thế kỳ thi chính thức.")
    canvas.drawRightString(A4[0] - 20 * mm, 11.5 * mm, f"Trang {doc.page}")
    canvas.restoreState()


def build(doc_meta, papers):
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / Path(doc_meta["file"]).name
    pdf = SimpleDocTemplate(
        str(path), pagesize=A4,
        leftMargin=20 * mm, rightMargin=20 * mm, topMargin=28 * mm, bottomMargin=22 * mm,
        title=doc_meta["title"], author="YYSD · IELTS Việt",
        subject="Học liệu IELTS tiếng Việt có trích dẫn Google Scholar",
        creator="YYSD IELTS Việt content pipeline",
    )

    doc_papers = [p for p in papers if doc_meta["id"] in (p.get("docs") or [])]
    extras = [p for p in papers if p not in doc_papers]
    refs = doc_papers + extras[: max(0, 20 - len(doc_papers))]

    story = [
        Paragraph(escape(doc_meta["kicker"].upper()), S["kicker"]),
        Paragraph(escape(doc_meta["title"]), S["title"]),
        Paragraph(escape(doc_meta["summary"]), S["subtitle"]),
    ]
    story.append(Paragraph(
        f"<b>{len(refs)} trích dẫn</b> · {doc_meta['level']} · {doc_meta['pages']} trang · "
        f"Bản quyền nội dung: YYSD · IELTS Việt", S["small"]))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "Cách dùng: đọc phần hướng dẫn trước, sau đó mở ứng dụng và làm đúng bài tập tương ứng. "
        "Mỗi tài liệu kết thúc bằng danh mục nghiên cứu có liên kết Google Scholar để bạn tự kiểm chứng.", S["callout"]))
    story.append(Spacer(1, 6))

    for heading, paragraphs in SECTIONS[doc_meta["id"]]:
        story.append(Paragraph(escape(heading), S["h1"]))
        for text in paragraphs:
            story.append(Paragraph(escape(text), S["body"]))
        story.append(Spacer(1, 4))

    story.append(Paragraph("Điểm cần nhớ", S["h1"]))
    story.append(bullets(doc_meta["bullets"]))
    story.append(Spacer(1, 10))

    story.append(PageBreak())
    story.append(Paragraph("Tài liệu tham khảo", S["h1"]))
    story.append(Paragraph(
        "Các nghiên cứu dưới đây là nền tảng cho những khuyến nghị trong tài liệu. Liên kết “Google Scholar” mở tìm kiếm theo "
        "tiêu đề và tác giả để bạn đọc bản gốc. DOI (khi có) trỏ thẳng tới nhà xuất bản.", S["body"]))
    for paper in refs:
        story.append(ref_paragraph(paper))

    pdf.build(story, onFirstPage=lambda c, d: (draw_cover(c, d), draw_footer(c, d)),
              onLaterPages=draw_footer)
    return path, len(refs)


def main():
    papers, docs = load()
    for meta in docs:
        path, count = build(meta, papers)
        print(f"wrote {path.name} ({count} refs)")
    print(f"done: {len(docs)} tài liệu")


if __name__ == "__main__":
    main()
