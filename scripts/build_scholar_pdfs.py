#!/usr/bin/env python3
"""Sinh 6 bo cam nang PDF hoc thuat IELTS tieng Viet voi trich dan Google Scholar.

Doc truc tiep co so du lieu 80 cong trinh khoa hoc kiem chung tu src/scholar-citations.js
va ket xuat 6 tai lieu PDF chuan in an A4 trong assets/docs/, nhung phong TrueType DejaVu
hien thi sac net day du dau tieng Viet va gan lien ket truc tiep toi scholar.google.com.
"""

from __future__ import annotations

import json
import subprocess
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "assets" / "docs"
FONT_DIR = Path("/usr/share/fonts/truetype/dejavu")

NAVY = colors.HexColor("#162447")
NAVY_SOFT = colors.HexColor("#1e3a5f")
EMERALD = colors.HexColor("#15803d")
GOLD = colors.HexColor("#b45309")
SLATE = colors.HexColor("#334155")
MUTED = colors.HexColor("#64748b")
BORDER = colors.HexColor("#cbd5e1")
ROW_ALT = colors.HexColor("#f8fafc")
CALLOUT_BG = colors.HexColor("#f6f3ec")
LINK_HEX = "#1d4ed8"


def register_fonts() -> None:
    """Dang ky bo phong TrueType DejaVu ho tro tron ven bang ma tieng Viet."""
    font_files = {
        "ViSans": "DejaVuSans.ttf",
        "ViSans-Bold": "DejaVuSans-Bold.ttf",
        "ViSerif": "DejaVuSerif.ttf",
    }
    for alias, filename in font_files.items():
        path = FONT_DIR / filename
        if not path.exists():
            alt = next(Path("/usr/share/fonts").rglob(filename))
            path = alt
        pdfmetrics.registerFont(TTFont(alias, str(path)))
    pdfmetrics.registerFontFamily(
        "ViSans",
        normal="ViSans",
        bold="ViSans-Bold",
        italic="ViSerif",
        boldItalic="ViSans-Bold",
    )


def load_scholar_data() -> dict:
    """Xuat du lieu trich dan, danh muc PDF va bang diem tu cac mo-dun ES trong src/."""
    node_script = (
        "import { SCHOLAR_CITATIONS, SCHOLAR_DOMAINS } from './src/scholar-citations.js';"
        "import { PROFICIENCY_BANDS } from './src/proficiency-score.js';"
        "import { WEEKLY_LEAGUES } from './src/gamification.js';"
        "import { getEnrichedPdfCatalog } from './src/pdf-report.js';"
        "console.log(JSON.stringify({"
        "citations: SCHOLAR_CITATIONS, domains: SCHOLAR_DOMAINS, "
        "bands: PROFICIENCY_BANDS, leagues: WEEKLY_LEAGUES, "
        "catalog: getEnrichedPdfCatalog()}));"
    )
    raw = subprocess.check_output(
        ["node", "--input-type=module", "-e", node_script],
        cwd=ROOT,
        text=True,
    )
    return json.loads(raw)


def build_styles() -> dict[str, ParagraphStyle]:
    """Xay dung he thong kieu chu hoc thuat ro rang, thoang dau tieng Viet."""
    base = getSampleStyleSheet()
    return {
        "kicker": ParagraphStyle(
            "kicker",
            parent=base["Normal"],
            fontName="ViSans-Bold",
            fontSize=8.5,
            leading=12,
            textColor=GOLD,
            spaceAfter=4,
        ),
        "title": ParagraphStyle(
            "title",
            parent=base["Title"],
            fontName="ViSans-Bold",
            fontSize=17,
            leading=23,
            textColor=NAVY,
            alignment=0,
            spaceAfter=6,
        ),
        "subtitle": ParagraphStyle(
            "subtitle",
            parent=base["Normal"],
            fontName="ViSans",
            fontSize=9.8,
            leading=14.5,
            textColor=SLATE,
            spaceAfter=10,
        ),
        "h2": ParagraphStyle(
            "h2",
            parent=base["Heading2"],
            fontName="ViSans-Bold",
            fontSize=12.2,
            leading=17,
            textColor=NAVY,
            spaceBefore=12,
            spaceAfter=5,
        ),
        "body": ParagraphStyle(
            "body",
            parent=base["Normal"],
            fontName="ViSans",
            fontSize=9.3,
            leading=14.2,
            textColor=SLATE,
            spaceAfter=6,
        ),
        "callout": ParagraphStyle(
            "callout",
            parent=base["Normal"],
            fontName="ViSans",
            fontSize=9.0,
            leading=13.8,
            textColor=NAVY,
        ),
        "ref": ParagraphStyle(
            "ref",
            parent=base["Normal"],
            fontName="ViSans",
            fontSize=8.3,
            leading=12.4,
            textColor=SLATE,
            leftIndent=12,
            firstLineIndent=-12,
            spaceAfter=2,
        ),
        "ref_note": ParagraphStyle(
            "ref_note",
            parent=base["Normal"],
            fontName="ViSerif",
            fontSize=8.0,
            leading=11.8,
            textColor=MUTED,
            leftIndent=12,
            spaceAfter=5.5,
        ),
        "th": ParagraphStyle(
            "th",
            parent=base["Normal"],
            fontName="ViSans-Bold",
            fontSize=8.3,
            leading=11.5,
            textColor=colors.white,
        ),
        "td": ParagraphStyle(
            "td",
            parent=base["Normal"],
            fontName="ViSans",
            fontSize=8.1,
            leading=11.5,
            textColor=SLATE,
        ),
    }


def make_table(
    headers: list[str],
    rows: list[list[str]],
    col_widths: list[float],
    styles: dict[str, ParagraphStyle],
) -> Table:
    """Tao bang hoc thuat co tieu de xanh hai quan va dong xen ke diu mat."""
    data = [[Paragraph(escape(h), styles["th"]) for h in headers]]
    for row in rows:
        data.append([Paragraph(escape(cell), styles["td"]) for cell in row])
    tbl = Table(data, colWidths=col_widths, repeatRows=1)
    tbl.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, ROW_ALT]),
                ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 4.5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4.5),
            ]
        )
    )
    return tbl


def make_callout(text: str, styles: dict[str, ParagraphStyle]) -> Table:
    """Tao hop nhan manh kien thuc cot loi tren nen giay nga."""
    tbl = Table([[Paragraph(text, styles["callout"])]], colWidths=[174 * mm])
    tbl.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), CALLOUT_BG),
                ("LINEBEFORE", (0, 0), (0, -1), 3, GOLD),
                ("BOX", (0, 0), (-1, -1), 0.5, BORDER),
                ("LEFTPADDING", (0, 0), (-1, -1), 9),
                ("RIGHTPADDING", (0, 0), (-1, -1), 9),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    return tbl


SECTION_CONTENT: dict[str, list[dict]] = {
    "pdf-complete-handbook": [
        {
            "heading": "1. Nền Tảng Khoa Học Nhận Thức & Hồi Quy Chu Kỳ Bán Rã (HLR)",
            "paragraphs": [
                (
                    "Lộ trình học IELTS thông minh của YYSD được thiết kế dựa trên hai nguyên lý "
                    "được xếp hạng hiệu quả cao nhất trong tâm lý học nhận thức: thực hành truy "
                    "xuất chủ động (Roediger & Karpicke, 2006; Karpicke & Roediger, 2008; Karpicke "
                    "& Blunt, 2011) và luyện tập phân tán theo khoảng cách tối ưu (Cepeda et al., "
                    "2006, 2009; Dunlosky et al., 2013; Rawson & Dunlosky, 2013). Thay vì học dồn "
                    "hàng trăm từ vựng trong một buổi tối, hệ thống chia kiến thức thành các chặng "
                    "ngắn 3–5 phút nhằm kiểm soát tải nhận thức (Sweller, 1988) và duy trì độ khó "
                    "mong muốn (Bjork, Dunlosky, & Kornell, 2013)."
                ),
                (
                    "Trái tim của phòng ôn tập YYSD là thuật toán Hồi quy Chu kỳ Bán rã (Half-Life "
                    "Regression — Settles & Meeder, 2016) được phát triển tại Duolingo: xác suất "
                    "nhớ lại một từ hoặc cấu trúc sau khoảng thời gian Δ giờ tuân theo hàm mũ "
                    "p = 2^(-Δ/h), trong đó chu kỳ bán rã h = 2^(θ·x) được cá nhân hóa trực tuyến "
                    "dựa trên lịch sử trả lời đúng, số lần nhầm lẫn, độ khó từ vựng và mạch combo. "
                    "Bên cạnh đó, các bài tập Câu Bất Ngờ Ngữ Nghĩa (Benoit, Grice, & Hazan, 1996) "
                    "kích hoạt tín hiệu sai số dự đoán phần thưởng dương (De Loof et al., 2018), "
                    "giúp khắc sâu cấu trúc đảo ngữ và giả định học thuật C1–C2."
                ),
            ],
        },
        {
            "heading": "2. Cơ Chế Trò Chơi Hóa, 10 Giải Đấu & Nhắc Học Thông Minh Bandit",
            "paragraphs": [
                (
                    "Các nghiên cứu thực nghiệm về học ngôn ngữ trên thiết bị di động (Loewen et "
                    "al., 2019; Jiang et al., 2022; Shortt et al., 2023; Kessler, Loewen, & "
                    "Gonulal, 2023; Rachels & Rockinson-Szapkiw, 2018) chứng minh rằng điểm kinh "
                    "nghiệm XP, Chuỗi Ngày Học, Chuỗi Bạn Bè (tối đa 5 người), 10 Giải đấu Hàng "
                    "tuần (Đồng → Kim cương), thanh Năng lượng 25 đơn vị, huy hiệu và ảnh đại diện "
                    "theo mùa thỏa mãn trọn vẹn ba nhu cầu tâm lý trong Thuyết Tự quyết của Ryan & "
                    "Deci (2000, 2020): tự chủ, năng lực và kết nối xã hội (Deterding et al., 2011; "
                    "Hamari, Koivisto, & Sarsa, 2014; Huynh, Zuo, & Iida, 2016; Sailer et al., "
                    "2017; Phan, 2025). Hệ thống nhắc học sử dụng thuật toán Recovering-Difference "
                    "Softmax Bandit (Yancey & Settles, 2020) tự động luân phiên thông điệp để giữ "
                    "sự mới mẻ mỗi ngày."
                ),
            ],
            "table_type": "bands",
        },
    ],
    "pdf-reading-science": [
        {
            "heading": "1. Mô Hình Nhận Thức Xã Hội & Bằng Chứng Theo Dõi Chuyển Động Mắt",
            "paragraphs": [
                (
                    "Theo mô hình đọc học thuật của Khalifa & Weir (2009) và nghiên cứu kiểm chứng "
                    "trên sinh viên đại học Anh của Weir et al. (2009) cùng Davies (2008), bài thi "
                    "IELTS Academic Reading đánh giá đồng thời bốn cấp độ xử lý: đọc lướt nắm bố "
                    "cục (expeditious skimming), đọc quét định vị dữ kiện (scanning), đọc kỹ cục bộ "
                    "tại mệnh đề đích (careful local reading) và tổng hợp luận điểm liên đoạn "
                    "(Grabe & Yamashita, 2022)."
                ),
                (
                    "Dữ liệu theo dõi chuyển động mắt (eye-tracking) của Bax (2013) và Bax & Chan "
                    "(2019) chỉ ra sự khác biệt then chốt giữa thí sinh Band 8.0+ và thí sinh Band "
                    "5.5: người đọc giỏi không đọc dàn trải toàn bài nhiều lần mà định vị nhanh cụm "
                    "diễn đạt tương đương (paraphrase), sau đó tập trung phân tích chính xác các từ "
                    "giới hạn phạm vi (solely, predominantly, unlikely, seldom). Để đạt tốc độ xử lý "
                    "này, người học cần hướng tới ngưỡng bao phủ từ vựng 98% của Nation (2006) thông "
                    "qua bộ từ AWL (Coxhead, 2000) và AVL (Gardner & Davies, 2014)."
                ),
            ],
            "table": {
                "headers": [
                    "Dạng câu hỏi IELTS Reading",
                    "Cơ chế nhận thức (Khalifa & Weir, 2009)",
                    "Chiến thuật thực chiến Band 8.0+",
                ],
                "rows": [
                    [
                        "True / False / Not Given",
                        "Đọc kỹ cục bộ & kiểm định logic mệnh đề",
                        "Tách chủ ngữ, vị ngữ và từ giới hạn mức độ; FALSE = mâu thuẫn trực tiếp, NOT GIVEN = thiếu dữ kiện.",
                    ],
                    [
                        "Matching Headings",
                        "Đọc hiểu toàn cục & khái quát luận điểm đoạn",
                        "Đọc câu mở đoạn, câu chuyển hướng (however/yet) và câu kết trước khi nhìn danh sách tiêu đề.",
                    ],
                    [
                        "Summary Completion",
                        "Phân tích cú pháp & kết hợp từ (collocation)",
                        "Xác định từ loại, tính đếm được và đối chiếu từ đồng nghĩa sát nghĩa nhất trong đoạn văn.",
                    ],
                    [
                        "Matching Information / Claims",
                        "Đọc quét tên riêng & nhận diện thái độ tác giả",
                        "Gạch chân tên nhà nghiên cứu và động từ tường thuật (corroborate, dispute, contend).",
                    ],
                ],
            },
        },
    ],
    "pdf-listening-metacognition": [
        {
            "heading": "1. Năm Tầng Giải Mã Âm Thanh & Chu Trình Nghe Siêu Nhận Thức",
            "paragraphs": [
                (
                    "Các công trình kiểm chứng IELTS Listening của Field (2008, 2009, 2013) và "
                    "Geranpayeh & Taylor (2013; Elliott & Wilson, 2013) chỉ ra rằng nhiều thí sinh "
                    "mất điểm không phải vì thiếu từ vựng trên mặt chữ mà vì đứt gãy ở khâu giải mã "
                    "âm thanh từ dưới lên (nối âm, nuốt âm cuối, dạng yếu của trợ động từ và giới từ). "
                    "Đặc biệt ở Section 4, thí sinh phải vừa theo dõi từ chỉ dấu bài giảng (turning "
                    "now to, by contrast, crucially) vừa nén ý thành từ khóa điền vào dàn bài."
                ),
                (
                    "Nghiên cứu thực nghiệm của Vandergrift (2007), Vandergrift & Tafaghodtari (2010) "
                    "và Vandergrift & Goh (2012) khẳng định chu trình nghe siêu nhận thức gồm 4 bước "
                    "— (1) dự đoán từ loại & ngữ cảnh trước khi nghe, (2) giám sát tín hiệu tự đính "
                    "chính khi nghe, (3) nghe lại đoạn khó không nhìn phụ đề, (4) đối chiếu bản gỡ "
                    "băng và lưu từ nói học thuật ASWL (Dang, Coxhead, & Webb, 2017) vào hệ thống "
                    "HLR (Settles & Meeder, 2016) — giúp tăng điểm nghe bền vững vượt trội."
                ),
            ],
            "table": {
                "headers": [
                    "Phần thi Listening",
                    "Ngữ cảnh & giọng đọc",
                    "Bẫy phổ biến & tín hiệu hóa giải",
                ],
                "rows": [
                    [
                        "Section 1 (10 câu)",
                        "Hội thoại giao dịch đời sống",
                        "Tự sửa số điện thoại, mã bưu chính, giá tiền sau 'actually / oh sorry / rather'.",
                    ],
                    [
                        "Section 2 (10 câu)",
                        "Độc thoại hướng dẫn & bản đồ",
                        "Xác định điểm xuất phát trên bản đồ; phân biệt 'postponed' (hoãn) và 'cancelled' (hủy).",
                    ],
                    [
                        "Section 3 (10 câu)",
                        "Thảo luận học thuật sinh viên - giảng viên",
                        "Theo dõi sự đồng thuận cuối cùng thay vì ý kiến đề xuất ban đầu bị bác bỏ.",
                    ],
                    [
                        "Section 4 (10 câu)",
                        "Bài giảng đại học liên tục",
                        "Bám sát từ chỉ dấu chuyển mục, từ đồng nghĩa học thuật và chính tả danh từ số ít/nhiều.",
                    ],
                ],
            },
        },
    ],
    "pdf-writing-discourse": [
        {
            "heading": "1. Ngôn Ngữ Rào Đón, Danh Từ Hóa & Khắc Phục Lỗi Chuyển Di Việt – Anh",
            "paragraphs": [
                (
                    "Khung kiểm chứng IELTS Writing của Shaw & Weir (2007), kết hợp nghiên cứu thể "
                    "loại của Moore & Morton (2005), Green (2007) và Riazi & Knox (2013), nhấn mạnh "
                    "rằng bài viết Band 7.5–9.0 đòi hỏi lập trường xuyên suốt, luận điểm phát triển "
                    "sâu và văn phong học thuật chừng mực. Theo Hyland (2005), ngôn ngữ rào đón "
                    "(hedges: may, tend to, is likely to, in many contexts) giúp người viết tránh "
                    "lỗi khái quát hóa tuyệt đối và tăng sức thuyết phục phản biện."
                ),
                (
                    "Về ngữ pháp và liên kết, Biber, Gray, & Poonpon (2011), Crossley & McNamara "
                    "(2014), Crossley, Kyle, & McNamara (2016), Kim, Crossley, & Kyle (2018), Kyle "
                    "& Crossley (2018) và Cooper (2013) chứng minh bài luận điểm cao nổi bật nhờ "
                    "cụm danh từ nén giàu thông tin (rapid urban expansion, stringent emission "
                    "standards), collocation chuẩn ACL (Ackermann & Chen, 2013) và liên kết quy "
                    "chiếu (this policy, such disparities) thay vì lạm dụng từ nối máy móc. Đối với "
                    "thí sinh Việt Nam, các nghiên cứu của Dang & Dang (2021) và Nguyen & Nguyen "
                    "(2022) khuyến nghị rà soát kỹ lỗi 'Although... but...', 'Because... so...', "
                    "'According to me' và danh từ không đếm được ở 3 phút kiểm bài cuối cùng."
                ),
            ],
            "table": {
                "headers": [
                    "Tiêu chí (25%/tiêu chí)",
                    "Rào cản thường gặp ở Band 6.0",
                    "Chiến lược nâng cấp lên Band 7.5–8.5",
                ],
                "rows": [
                    [
                        "Task Achievement / Response",
                        "Overview mờ nhạt; luận điểm Task 2 khái quát quá đà",
                        "Viết Overview nêu 2 xu hướng lớn nhất; dùng rào đón (Hyland, 2005) và phản biện có điều kiện.",
                    ],
                    [
                        "Coherence & Cohesion",
                        "Mỗi câu đều mở đầu bằng Firstly, Moreover, Besides",
                        "Liên kết bằng đại từ/danh từ quy chiếu (This trend, Such initiatives) và câu chủ đề sắc gọn.",
                    ],
                    [
                        "Lexical Resource",
                        "Dịch từng chữ từ tiếng Việt (make a threat, big rise)",
                        "Sử dụng cụm collocation chuẩn ACL (pose a threat, substantial surge, mitigate emissions).",
                    ],
                    [
                        "Grammatical Range & Accuracy",
                        "Lỗi cặp liên từ thừa, thiếu mạo từ, sai chia động từ",
                        "Kết hợp mệnh đề nhượng bộ (While/Whereas), danh từ hóa (Biber et al., 2011) và kiểm lỗi 3 phút cuối.",
                    ],
                ],
            },
        },
    ],
    "pdf-speaking-caf": [
        {
            "heading": "1. Năng Lực Tương Tác, Cân Bằng CAF & Độ Dễ Hiểu Trong Phát Âm",
            "paragraphs": [
                (
                    "Theo Taylor (2011; Weir & Taylor, 2011), Galaczi & Taylor (2018) và nghiên cứu "
                    "khối liệu IELTS Speaking của Seedhouse et al. (2014) cùng Seedhouse & "
                    "Nakatsuhara (2018), bài thi vấn đáp đo lường năng lực giao tiếp tự nhiên tăng "
                    "dần từ chủ đề quen thuộc (Part 1), độc thoại có chuẩn bị 2 phút (Part 2) đến "
                    "thảo luận xã hội trừu tượng (Part 3). Các phân tích thực nghiệm của Kormos & "
                    "Denes (2004), Iwashita et al. (2008) và De Jong et al. (2015) xác nhận độ dài "
                    "cụm nói liền mạch và vị trí ngắt nghỉ tự nhiên giữa các mệnh đề quan trọng hơn "
                    "việc cố nói thật nhanh."
                ),
                (
                    "Mô hình đánh đổi CAF của Skehan (2009) giải thích cách tận dụng 60 giây ghi chú "
                    "ở Part 2 bằng 4–5 cụm collocation chủ chốt để giải phóng bộ nhớ làm việc cho "
                    "ngữ pháp phức. Về tiêu chí Pronunciation, Derwing, Rossiter, & Munro (2002) "
                    "khẳng định trọng tâm là độ dễ hiểu (intelligibility): người học Việt Nam (Hoang, "
                    "2020) chỉ cần phát âm rõ phụ âm cuối (/s/, /z/, /t/, /d/, /ʃ/), nhấn đúng trọng "
                    "âm từ đa âm tiết và lên xuống giọng theo cụm ý là hoàn toàn chinh phục Band 8.0+."
                ),
            ],
            "table": {
                "headers": [
                    "Phần thi Speaking",
                    "Thời lượng",
                    "Khung triển khai tự nhiên theo Seedhouse & Nakatsuhara (2018)",
                ],
                "rows": [
                    [
                        "Part 1 (Phỏng vấn)",
                        "4–5 phút",
                        "Trả lời trực tiếp + lý do ngắn hoặc chi tiết cụ thể (2–3 câu tự nhiên, không học vẹt).",
                    ],
                    [
                        "Part 2 (Thẻ chủ đề)",
                        "3–4 phút",
                        "Ghi 5 cụm collocation trong 1 phút; triển khai bối cảnh → diễn biến → cảm nhận → tác động.",
                    ],
                    [
                        "Part 3 (Thảo luận sâu)",
                        "4–5 phút",
                        "Nêu quan điểm khái quát → giải thích cơ chế xã hội → ví dụ đối chiếu → điều kiện ngoại lệ.",
                    ],
                ],
            },
        },
    ],
    "pdf-vocabulary-vietnam": [
        {
            "heading": "1. Hệ Sinh Thái Danh Sách Từ Khối Liệu & Lộ Trình Cho Người Học Việt Nam",
            "paragraphs": [
                (
                    "Nghiên cứu ngôn ngữ học khối liệu hiện đại cung cấp bản đồ từ vựng cực kỳ rõ "
                    "ràng cho thí sinh IELTS: củng cố 2.500–3.000 từ cốt lõi (Brezina & Gablasova, "
                    "2015; Dang & Webb, 2016), tiếp nối bằng 570 họ từ AWL (Coxhead, 2000), danh "
                    "sách AVL (Gardner & Davies, 2014), 1.741 họ từ nói học thuật ASWL (Dang, "
                    "Coxhead, & Webb, 2017), 2.469 cụm kết hợp từ ACL (Ackermann & Chen, 2013), 505 "
                    "biểu thức đa từ (Martinez & Schmitt, 2012) và 150 cụm động từ PHaVE (Garnier & "
                    "Schmitt, 2015)."
                ),
                (
                    "Theo Giả thuyết Tải trọng Tham gia của Laufer & Hulstijn (2001; Hulstijn & "
                    "Laufer, 2001) cùng tổng quan của Schmitt (2008), Webb (2007) và Boers & Webb "
                    "(2018), mỗi mục từ cần được truy xuất chủ động 8–10+ lần trong ngữ cảnh đặt câu, "
                    "ghép thẻ paraphrase và nối cặp collocation. Các công trình thực hiện trực tiếp "
                    "trên người học Việt Nam (Nguyen & Webb, 2017; Vu & Peters, 2021; Dang & Dang, "
                    "2021; Nguyen & Nguyen, 2022; Phan, 2025) cho thấy sự kết hợp giữa học cụm "
                    "collocation nguyên khối, ôn tập HLR hàng ngày và duy trì Chuỗi Ngày Học 15 phút "
                    "giúp thu hẹp nhanh nhất khoảng cách từ Band 5.5 lên Band 7.5+."
                ),
            ],
            "table": {
                "headers": [
                    "Giai đoạn (12 tuần)",
                    "Trọng tâm từ vựng khối liệu",
                    "Hoạt động hàng ngày trên nền tảng YYSD",
                ],
                "rows": [
                    [
                        "Tuần 1–3 (Band 5.0→6.0)",
                        "Từ cốt lõi NGSL + PHaVE + chính tả Section 1",
                        "20 XP/ngày trên Lộ trình Chặng 1–2 + 15 thẻ HLR + 2 bài Nghe sâu.",
                    ],
                    [
                        "Tuần 4–7 (Band 6.0→7.0)",
                        "AWL (Coxhead, 2000) + ASWL (Dang et al., 2017)",
                        "30 XP/ngày Chặng 3–5 + Truyện ngắn tương tác + 2 đề Cambridge Reading/Listening.",
                    ],
                    [
                        "Tuần 8–12 (Band 7.0→8.0+)",
                        "ACL Collocations + Hedging + sửa lỗi chuyển di",
                        "50 XP/ngày Chặng 6–8 (SUS) + Nhập vai Speaking + Thi thử trọn bộ Cambridge 17–20.",
                    ],
                ],
            },
        },
    ],
}


def format_ref_markup(idx: int, cit: dict) -> str:
    """Tao doan van APA 7 co gan lien ket sieu van ban toi Google Scholar va DOI."""
    authors = escape(cit["authors"])
    year = cit["year"]
    title = escape(cit["title"])
    venue = escape(cit["venue"])
    scholar_url = escape(cit["scholarUrl"], {'"': "&quot;"})
    links = f'<link href="{scholar_url}" color="{LINK_HEX}"><u>[Google Scholar]</u></link>'
    if cit.get("doiUrl"):
        doi_url = escape(cit["doiUrl"], {'"': "&quot;"})
        doi_txt = escape(cit["doi"])
        links = f'<link href="{doi_url}" color="{LINK_HEX}"><u>DOI: {doi_txt}</u></link> · ' + links
    return f"<b>[{idx}]</b> {authors} ({year}). <i>{title}</i>. {venue}. {links}"


def render_pdf(doc_meta: dict, data: dict, styles: dict[str, ParagraphStyle]) -> tuple[Path, int]:
    """Ket xuat mot cuon cam nang PDF hoc thuat hoan chinh."""
    out_path = ROOT / doc_meta["filePath"]
    out_path.parent.mkdir(parents=True, exist_ok=True)
    title_short = doc_meta["titleVi"][:58]

    def draw_chrome(canvas, doc) -> None:
        canvas.saveState()
        canvas.setStrokeColor(BORDER)
        canvas.setLineWidth(0.5)
        canvas.line(18 * mm, 281 * mm, 192 * mm, 281 * mm)
        canvas.setFont("ViSans", 7.5)
        canvas.setFillColor(MUTED)
        canvas.drawString(
            18 * mm, 283.5 * mm, "Trung tâm Luyện thi Quốc tế YYSD · Thư viện Học thuật IELTS"
        )
        canvas.drawRightString(192 * mm, 283.5 * mm, "Nguồn kiểm chứng: scholar.google.com")
        canvas.line(18 * mm, 14 * mm, 192 * mm, 14 * mm)
        canvas.drawString(18 * mm, 9.5 * mm, title_short)
        canvas.drawRightString(192 * mm, 9.5 * mm, f"Trang {doc.page}")
        canvas.restoreState()

    pdf = SimpleDocTemplate(
        str(out_path),
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=20 * mm,
        bottomMargin=18 * mm,
        title=doc_meta["titleVi"],
        author="Trung tâm Luyện thi Quốc tế YYSD",
        subject="Cẩm nang học thuật luyện thi IELTS tiếng Việt kèm trích dẫn Google Scholar",
    )

    citations = doc_meta["citations"]
    story = [
        Paragraph(
            f"ẤN PHẨM HỌC THUẬT IELTS YYSD · MỤC TIÊU {escape(doc_meta['targetBandVi'])} · "
            f"{len(citations)} TRÍCH DẪN GOOGLE SCHOLAR",
            styles["kicker"],
        ),
        Paragraph(escape(doc_meta["titleVi"]), styles["title"]),
        Paragraph(escape(doc_meta["subtitleVi"]), styles["subtitle"]),
        HRFlowable(width="100%", thickness=1.4, color=NAVY, spaceAfter=8),
    ]

    highlights_html = "<b>Trọng tâm ứng dụng cho học viên:</b><br/>" + "<br/>".join(
        f"• {escape(h)}" for h in doc_meta["highlightsVi"]
    )
    story.append(make_callout(highlights_html, styles))
    story.append(Spacer(1, 4 * mm))

    for sec in SECTION_CONTENT[doc_meta["id"]]:
        story.append(Paragraph(escape(sec["heading"]), styles["h2"]))
        for para in sec["paragraphs"]:
            story.append(Paragraph(escape(para), styles["body"]))
        if sec.get("table_type") == "bands":
            rows = [
                [
                    f"{b['minScore']}–{b['maxScore']}",
                    f"{b['cefr']} ({b['cefrLabelVi']})",
                    f"Band {b['ieltsBand']:.1f}",
                    b["canDoVi"],
                ]
                for b in data["bands"][3:]
            ]
            story.append(
                make_table(
                    ["Điểm 0–160", "Khung CEFR", "IELTS", "Mô tả năng lực học thuật"],
                    rows,
                    [22 * mm, 38 * mm, 21 * mm, 93 * mm],
                    styles,
                )
            )
            story.append(Spacer(1, 3 * mm))
            league_rows = [
                [
                    f"Bậc {lg['tier'] + 1}",
                    f"Giải {lg['nameVi']} ({lg['nameEn']})",
                    f"{lg['promoteMinXp']} XP/tuần",
                ]
                for lg in data["leagues"]
            ]
            story.append(
                make_table(
                    ["Cấp giải đấu", "Tên Giải đấu Hàng tuần", "Ngưỡng XP thăng hạng khuyến nghị"],
                    league_rows,
                    [30 * mm, 78 * mm, 66 * mm],
                    styles,
                )
            )
        elif "table" in sec:
            tbl_cfg = sec["table"]
            story.append(
                make_table(
                    tbl_cfg["headers"],
                    tbl_cfg["rows"],
                    [42 * mm, 52 * mm, 80 * mm],
                    styles,
                )
            )

    story.append(
        Paragraph(
            f"Danh Mục Tài Liệu Tham Khảo Chuẩn APA 7 Từ Google Scholar ({len(citations)} Công Trình)",
            styles["h2"],
        )
    )
    story.append(
        Paragraph(
            "Mọi công trình dưới đây đều là nghiên cứu khoa học bình duyệt hoặc chuyên khảo khảo thí "
            "chính thức. Nhấp trực tiếp vào liên kết [Google Scholar] hoặc mã DOI để đọc bản gốc và "
            "xem mạng lưới trích dẫn học thuật cập nhật.",
            styles["body"],
        )
    )

    for idx, cit in enumerate(citations, start=1):
        story.append(Paragraph(format_ref_markup(idx, cit), styles["ref"]))
        story.append(
            Paragraph(
                f"→ Ứng dụng luyện thi IELTS: {escape(cit['takeawayVi'])}",
                styles["ref_note"],
            )
        )

    pdf.build(story, onFirstPage=draw_chrome, onLaterPages=draw_chrome)
    return out_path, len(citations)


def main() -> None:
    """Sinh toan bo 6 cuon cam nang PDF hoc thuat IELTS tieng Viet."""
    register_fonts()
    data = load_scholar_data()
    styles = build_styles()
    total_links = 0
    for doc_meta in data["catalog"]:
        path, ref_count = render_pdf(doc_meta, data, styles)
        total_links += ref_count
        size_kb = path.stat().st_size / 1024
        print(
            f"Da tao {path.relative_to(ROOT)} ({size_kb:.1f} KB, {ref_count} trich dan Google Scholar)"
        )
    print(
        f"HOAN TAT: 6 tai lieu PDF hoc thuat voi tong cong {total_links} lien ket Google Scholar."
    )


if __name__ == "__main__":
    main()
