#!/usr/bin/env python3
"""Tạo sáu tài liệu PDF tiếng Việt kèm thư mục Google Scholar phong phú.

Yêu cầu: reportlab và phông DejaVu Sans (có sẵn trên Ubuntu/GH Actions).
Chạy: python3 ielts/scripts/build_pdfs.py
"""
from __future__ import annotations
import json
from html import escape
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, Frame, PageTemplate, Paragraph,
                                Spacer, Table, TableStyle, KeepTogether)

ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / "research" / "sources.json"
OUT = ROOT / "pdfs"

FONT_CANDIDATES = [
    ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
     "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
    ("/usr/share/fonts/dejavu/DejaVuSans.ttf",
     "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf"),
]

BOOKS = [
    {
        "file": "01-tong-quan-nghien-cuu-ielts.pdf",
        "title": "Tổng quan nghiên cứu IELTS",
        "subtitle": "Giá trị, độ tin cậy, washback và khung CEFR",
        "focus": "ielts",
        "summary": "Tài liệu này tổng hợp cơ sở học thuật của kỳ thi IELTS và giải thích vì sao một ứng dụng luyện thi cần đo lường tiến bộ thay vì chỉ đếm số bài đã làm. IELTS gồm bốn kỹ năng Nghe, Đọc, Viết, Nói; mỗi kỹ năng có cấu trúc, rubric và bằng chứng giá trị riêng. Các nghiên cứu về washback nhắc chúng ta rằng luyện thi quá hẹp có thể tăng điểm ngắn hạn nhưng làm nghèo năng lực học thuật thật sự.",
        "principles": [
            "Luyện theo năng lực, không luyện theo mẹo: mỗi bài phải gắn với một kỹ năng có thể quan sát và phản hồi được.",
            "Đo độ tin cậy bằng nhiều bài ngắn thay vì một bài dài duy nhất; tổng hợp tỉ lệ đúng theo kỹ năng và theo dạng câu.",
            "Dùng khung CEFR và band ước tính chỉ để định hướng, không thay thế kết quả chính thức.",
            "Thiết kế washback tích cực: giải thích bằng tiếng Việt, ví dụ tiếng Anh, và luôn hỏi «vì sao đáp án này đúng».",
        ],
        "plan": [
            ["Tuần 1", "Chẩn đoán bốn kỹ năng", "Ghi band xuất phát, xác định hai điểm yếu rõ nhất"],
            ["Tuần 2", "Nghe + Đọc nền tảng", "30 phút/ngày, đan xen nhận diện và suy luận"],
            ["Tuần 3", "Viết + Nói có phản hồi", "Viết 2 đoạn/tuần, ghi âm 3 bài Part 2"],
            ["Tuần 4", "Mô phỏng & đối chiếu", "Một vòng đủ bốn kỹ năng, so sánh với tuần 1"],
        ],
    },
    {
        "file": "02-chien-luoc-nghe.pdf",
        "title": "Chiến lược Nghe IELTS",
        "subtitle": "Từ nhận diện âm thanh tới giá trị nhận thức của bài giảng",
        "focus": "listening",
        "summary": "Nghe IELTS không chỉ là «nghe rõ từ». Người học phải xử lý tín hiệu âm thanh, giữ thông tin trong bộ nhớ làm việc, đoán ý định người nói và đối chiếu với cách diễn đạt lại trong câu hỏi. Tài liệu trình bày ba lớp luyện tập: nhận diện (bottom-up), suy luận (top-down) và siêu nhận thức (lên kế hoạch, kiểm tra, sửa lỗi).",
        "principles": [
            "Nghe chủ động: dự đoán từ loại và nội dung trước khi bấm phát, kiểm tra ngay sau khi nghe.",
            "Ghi âm theo cụm ý thay vì cố chép từng từ; bộ nhớ làm việc có giới hạn.",
            "Luyện paraphrase: đáp án đúng thường không lặp nguyên từ trong bản ghi.",
            "Dùng transcript sau khi đã trả lời, không phải trong lúc nghe.",
            "Câu có ngữ nghĩa bất ngờ tạo tín hiệu chú ý mạnh hơn (xem De Loof và cộng sự, 2018).",
        ],
        "plan": [
            ["Tuần 1", "Nhận diện số, tên, thời gian", "20 câu/ngày, ghi dạng số và chính tả"],
            ["Tuần 2", "Bản đồ & biểu mẫu", "Tập cụm vị trí, hướng đi và tự sửa lời"],
            ["Tuần 3", "Bài giảng Part 3–4", "Ghi cấu trúc đoạn, phân biệt ý chính và ví dụ"],
            ["Tuần 4", "Mô phỏng 30 phút", "Không dừng, không tua, đối chiếu transcript"],
        ],
    },
    {
        "file": "03-chien-luoc-doc.pdf",
        "title": "Chiến lược Đọc IELTS",
        "subtitle": "Quét thông tin, suy luận và vốn từ học thuật",
        "focus": "reading",
        "summary": "Bài đọc Academic kiểm tra khả năng xử lý văn bản học thuật trong 60 phút với 40 câu. Hai chế độ đọc cần tách bạch: skimming để nắm cấu trúc và scanning để tìm chi tiết. Nghiên cứu về giá trị cấu trúc của IELTS so sánh yêu cầu đề thi với nhiệm vụ đọc thực tế ở đại học; vì vậy lộ trình bền vững phải xây vốn từ và khả năng nhận diện thái độ tác giả, không chỉ luyện mẹo.",
        "principles": [
            "Đọc câu hỏi trước, gạch chân từ khoá và xác định dạng câu (True/False/Not Given, matching, gap-fill).",
            "Phân biệt «không được nói đến» với «bị phủ định» — lỗi kinh điển của dạng Not Given.",
            "Học từ theo cụm và ngữ cảnh, theo bốn chiều hình thức – nghĩa – cách dùng của Nation.",
            "Sau mỗi bài, viết lại một câu tóm tắt cho mỗi đoạn bằng tiếng Việt để kiểm tra hiểu thật.",
            "Tăng dần độ khó văn bản, giữ thời gian đọc dưới áp lực nhưng không bỏ qua phản hồi.",
        ],
        "plan": [
            ["Tuần 1", "Skimming & tiêu đề đoạn", "3 đoạn/ngày, viết tiêu đề 8–10 chữ"],
            ["Tuần 2", "Scanning & điền khuyết", "Giới hạn 90 giây cho mỗi lượt tìm"],
            ["Tuần 3", "Quan điểm tác giả", "Nhận diện tính từ đánh giá và từ nhượng bộ"],
            ["Tuần 4", "Một Passage 20 phút", "Chấm 13–14 câu, phân tích lỗi theo dạng"],
        ],
    },
    {
        "file": "04-chien-luoc-viet.pdf",
        "title": "Chiến lược Viết IELTS",
        "subtitle": "Cấu trúc đoạn, rubric và phản hồi có thể hành động",
        "focus": "writing",
        "summary": "Writing Task 1 yêu cầu mô tả, so sánh và nêu overview; Task 2 yêu cầu lập luận có vị trí rõ ràng. Bốn tiêu chí chấm — Task Achievement/Response, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy — có trọng số bằng nhau. Phản hồi hữu ích vì thế phải chỉ ra được cụ thể câu nào thiếu liên kết, cụm nào dùng chưa học thuật, và cần sửa gì ở bài sau.",
        "principles": [
            "Luôn có overview hoặc luận điểm ở đoạn mở đầu; đừng chép lại đề bài.",
            "Mỗi thân bài một ý, theo cấu trúc chủ đề – giải thích – ví dụ – liên kết.",
            "Dùng liên kết học thuật tiết chế: however, moreover, in contrast, as a result.",
            "Ưu tiên collocation chính xác thay vì từ «khó»; tránh từ đa nghĩa things, stuff.",
            "Phản hồi nên ngắn, cụ thể, kèm một câu viết lại mẫu; đây là cách tăng hiệu quả luyện tập.",
        ],
        "plan": [
            ["Tuần 1", "Overview & mô tả xu hướng", "3 biểu đồ, mỗi bài 150 từ"],
            ["Tuần 2", "Luận điểm & thân bài", "4 đề Task 2, lập dàn ý 10 phút"],
            ["Tuần 3", "Liên kết & từ vựng", "Sửa lại 2 bài cũ, thay 10 cụm từ"],
            ["Tuần 4", "Hai bài trong 60 phút", "Tự chấm theo bốn tiêu chí, ghi mục tiêu tuần sau"],
        ],
    },
    {
        "file": "05-chien-luoc-noi.pdf",
        "title": "Chiến lược Nói IELTS",
        "subtitle": "Mở rộng ý, tương tác và phát âm dưới áp lực thời gian",
        "focus": "speaking",
        "summary": "Bài nói kéo dài 11–14 phút gồm ba phần, đánh giá Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy và Pronunciation. Nghiên cứu về phong cách giám khảo cho thấy mức độ hỗ trợ trong phỏng vấn có thể ảnh hưởng tới mẫu lời nói thu được; người học vì thế cần luyện cả khả năng tự mở rộng ý lẫn khả năng xử lý câu hỏi bất ngờ.",
        "principles": [
            "Part 1: trả lời trực tiếp + một chi tiết + lý do ngắn; tránh câu một từ.",
            "Part 2: ghi bốn điểm tựa theo cue card, không viết kịch bản đầy đủ.",
            "Part 3: khái quát hoá, nêu nguyên nhân – hệ quả – đối chiếu, dùng cấu trúc giả định.",
            "Kéo dài nhịp nói bằng cụm tự nhiên thay vì lặp «em... à...» hay nói quá nhanh.",
            "Ghi âm, nghe lại và tự chấm theo bốn tiêu chí; một lần nghe lại giá trị hơn ba lần nói qua.",
        ],
        "plan": [
            ["Tuần 1", "Part 1 mở rộng", "10 câu/ngày, mỗi câu 2–3 câu con"],
            ["Tuần 2", "Cue card 2 phút", "4 chủ đề/tuần, ghi chú 1 phút"],
            ["Tuần 3", "Part 3 trừu tượng", "Vì sao / nên hay không / so sánh quá khứ"],
            ["Tuần 4", "Phỏng vấn mô phỏng", "Ghi âm trọn bài 14 phút, tự chấm"],
        ],
    },
    {
        "file": "06-phuong-phap-hoc-tap.pdf",
        "title": "Phương pháp học tập & Gamification",
        "subtitle": "Lặp lại ngắt quãng, kiểm tra chủ động và động lực bền vững",
        "focus": "method",
        "summary": "Tài liệu giải thích vì sao ứng dụng dùng bài học ngắn, thẻ ôn tập SM-2, điểm kinh nghiệm, chuỗi ngày và giải đấu. Bằng chứng ủng hộ luyện tập phân tán, kiểm tra chủ động và mục tiêu cụ thể; đồng thời cảnh báo rằng phần thưởng bên ngoài nếu lạm dụng có thể làm giảm động lực nội tại. Thiết kế vì thế ưu tiên phản hồi, cảm nhận tiến bộ và quyền tự chọn mục tiêu.",
        "principles": [
            "Ôn đúng lúc: SM-2 tăng khoảng cách sau mỗi lần nhớ đúng và đặt lại khi quên.",
            "Kiểm tra chủ động (retrieval) hiệu quả hơn đọc lại; mỗi thẻ là một lần tự trả lời.",
            "Mục tiêu ngày cụ thể, vừa sức, có thanh tiến độ rõ ràng.",
            "Phần thưởng đi kèm ý nghĩa: streak, huy hiệu và giải đấu chỉ là tín hiệu, không thay thế nội dung.",
            "Tôn trọng nghỉ ngơi: một ngày bỏ lỡ có «đóng băng» chuỗi, không trừng phạt người học.",
            "Không thu thập dữ liệu cá nhân; mọi tiến độ nằm trên thiết bị của người học.",
        ],
        "plan": [
            ["Tuần 1", "Thiết lập thói quen", "10 XP/ngày, 6 thẻ từ vựng SM-2"],
            ["Tuần 2", "Tăng mục tiêu", "20 XP/ngày, thêm một bài bốn kỹ năng"],
            ["Tuần 3", "Ôn xen kẽ", "Trộn thẻ cũ với câu mới, theo dõi tỉ lệ thuộc"],
            ["Tuần 4", "Tự điều chỉnh", "Chọn 30 hoặc 50 XP, đối chiếu band ước tính"],
        ],
    },
]


def register_fonts() -> str:
    for regular, bold in FONT_CANDIDATES:
        if Path(regular).exists() and Path(bold).exists():
            pdfmetrics.registerFont(TTFont("DejaVu", regular))
            pdfmetrics.registerFont(TTFont("DejaVu-Bold", bold))
            pdfmetrics.registerFontFamily("DejaVu", normal="DejaVu", bold="DejaVu-Bold",
                                          italic="DejaVu", boldItalic="DejaVu-Bold")
            return "DejaVu"
    raise SystemExit("Thiếu phông DejaVu Sans — cài fonts-dejavu-core rồi chạy lại.")


def styles() -> dict:
    return {
        "title": ParagraphStyle("title", fontName="DejaVu-Bold", fontSize=21, leading=27,
                                textColor=colors.HexColor("#173a63"), spaceAfter=4),
        "sub": ParagraphStyle("sub", fontName="DejaVu", fontSize=11, leading=16,
                              textColor=colors.HexColor("#4c5a6e"), spaceAfter=10),
        "h": ParagraphStyle("h", fontName="DejaVu-Bold", fontSize=13, leading=18,
                            textColor=colors.HexColor("#173a63"), spaceBefore=12, spaceAfter=5),
        "body": ParagraphStyle("body", fontName="DejaVu", fontSize=10, leading=15,
                               alignment=TA_JUSTIFY, spaceAfter=6),
        "bullet": ParagraphStyle("bullet", fontName="DejaVu", fontSize=10, leading=15,
                                 leftIndent=12, bulletIndent=2, spaceAfter=3),
        "ref": ParagraphStyle("ref", fontName="DejaVu", fontSize=8.4, leading=12,
                              spaceAfter=3),
        "small": ParagraphStyle("small", fontName="DejaVu", fontSize=8.5, leading=12,
                                textColor=colors.HexColor("#4c5a6e")),
    }


def page_decor(canvas, doc):
    canvas.saveState()
    canvas.setFont("DejaVu", 8)
    canvas.setFillColor(colors.HexColor("#4c5a6e"))
    canvas.drawString(18 * mm, 10 * mm, "YYSD IELTS · Tài liệu tiếng Việt · scholar.google.com")
    canvas.drawRightString(A4[0] - 18 * mm, 10 * mm, f"Trang {doc.page}")
    canvas.setStrokeColor(colors.HexColor("#d9d3c6"))
    canvas.line(18 * mm, 13 * mm, A4[0] - 18 * mm, 13 * mm)
    canvas.restoreState()


def link(url: str, label: str) -> str:
    return f'<link href="{escape(url, quote=True)}" color="#173a63"><u>{escape(label)}</u></link>'


def build(book: dict, sources: list, st: dict) -> None:
    path = OUT / book["file"]
    doc = BaseDocTemplate(str(path), pagesize=A4,
                          leftMargin=18 * mm, rightMargin=18 * mm,
                          topMargin=18 * mm, bottomMargin=18 * mm,
                          title=book["title"], author="YYSD Test Center",
                          subject="Tài liệu luyện thi IELTS tiếng Việt có trích dẫn học thuật")
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="main")
    doc.addPageTemplates([PageTemplate(id="all", frames=[frame], onPage=page_decor)])

    story = [
        Paragraph("YYSD IELTS · Thư viện nghiên cứu tiếng Việt", st["small"]),
        Spacer(1, 4),
        Paragraph(escape(book["title"]), st["title"]),
        Paragraph(escape(book["subtitle"]), st["sub"]),
        Paragraph("Cập nhật 18/11/2026 · Biên soạn bằng tiếng Việt · Nhan đề học thuật giữ nguyên tiếng Anh để tiện tra cứu.", st["small"]),
        Spacer(1, 6),
        Paragraph("1. Tóm tắt", st["h"]),
        Paragraph(escape(book["summary"]), st["body"]),
        Paragraph("2. Nguyên tắc luyện tập", st["h"]),
    ]
    for item in book["principles"]:
        story.append(Paragraph(escape(item), st["bullet"], bulletText="•"))
    story.append(Paragraph("3. Lộ trình bốn tuần", st["h"]))
    table_data = [["Giai đoạn", "Trọng tâm", "Sản phẩm đo được"]] + book["plan"]
    table = Table(table_data, colWidths=[26 * mm, 55 * mm, 93 * mm], repeatRows=1)
    table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, -1), "DejaVu"),
        ("FONTNAME", (0, 0), (-1, 0), "DejaVu-Bold"),
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e8eef6")),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#d9d3c6")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
    ]))
    story.append(table)
    story += [
        Paragraph("4. Chỉ số cần theo dõi", st["h"]),
        Paragraph("Tỉ lệ đúng theo kỹ năng, số thẻ SM-2 đến hạn, tỉ lệ thẻ đã thuộc, chuỗi ngày học, XP trong ngày và band ước tính. Các chỉ số chỉ mang ý nghĩa định hướng; không quy đổi thành điểm thi chính thức.", st["body"]),
        Paragraph("5. Cách dùng thư mục học thuật", st["h"]),
        Paragraph("Mỗi mục dưới đây gồm thông tin thư mục, ghi chú tiếng Việt và liên kết tới " + link("https://scholar.google.com/", "scholar.google.com") + ". Nhấn «Tra cứu» để xem trích dẫn, bản tóm tắt và các nghiên cứu liên quan. Chúng tôi không sao chép toàn văn bài báo có bản quyền.", st["body"]),
        Paragraph(f"6. Thư mục ({len(sources)} nguồn, {len(set(s['topic'] for s in sources))} nhóm)", st["h"]),
    ]
    grouped = {}
    for src in sources:
        grouped.setdefault(src["topic"], []).append(src)
    for topic, items in grouped.items():
        story.append(Paragraph(f"<b>{escape(items[0]['topicLabel'])}</b> ({len(items)} nguồn)", st["h"]))
        for src in items:
            doi = " · DOI: " + link(src["doiUrl"], src["doi"]) if src["doiUrl"] else ""
            story.append(KeepTogether([
                Paragraph(
                    f"<b>[{src['id']}]</b> {escape(src['authors'])} ({src['year']}). "
                    f"<i>{escape(src['title'])}</i>. {escape(src['venue'])}.{doi}",
                    st["ref"]),
                Paragraph(
                    f"Ghi chú: {escape(src['note'])} · " + link(src["scholar"], "Tra cứu trên Google Scholar ↗"),
                    st["ref"]),
                Spacer(1, 3),
            ]))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Ghi nhận: thư mục được biên soạn cho mục đích học tập; vui lòng kiểm chứng bản quyền trước khi phân phối lại toàn văn. Ứng dụng YYSD IELTS không thu thập dữ liệu cá nhân.", st["small"]))
    doc.build(story)
    print(f"[pdf] {path.name}: {path.stat().st_size/1024:.0f} KB · {len(sources)} trích dẫn Scholar")


def main() -> None:
    register_fonts()
    data = json.loads(SOURCES.read_text(encoding="utf-8"))
    OUT.mkdir(parents=True, exist_ok=True)
    st = styles()
    for book in BOOKS:
        build(book, data["sources"], st)
    print(f"[pdf] Hoàn tất {len(BOOKS)} tài liệu · {len(data['sources'])} nguồn học thuật")


if __name__ == "__main__":
    main()
