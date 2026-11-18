"""Sinh thư viện tài liệu PDF tiếng Việt kèm trích dẫn Google Scholar."""
import html
import json
from pathlib import Path
from urllib.parse import quote

from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

from references import REFERENCES

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs' / 'tai-lieu'
FONT_DIR = Path('/usr/share/fonts/truetype/dejavu')

TOPICS = [
    ('01-tong-quan-ielts.pdf', 'Tổng quan kỳ thi IELTS và lộ trình tự học',
     'Bốn kỹ năng, thang điểm band, cấu trúc đề và kế hoạch 12 tuần.',
     ['Nắm cấu trúc: Nghe 30 phút, Đọc 60 phút, Viết 60 phút, Nói 11-14 phút.',
      'Đọc kỹ band descriptors để biết tiêu chí chấm, không chỉ học mẹo.',
      'Chia lộ trình thành chặn 2 tuần, mỗi chặn có bài kiểm tra ngắn.',
      'Ghi lại lỗi lặp lại và đưa vào danh sách ôn tập ngắt quãng.'],
     [(0, 17)]),
    ('02-doc-hieu.pdf', 'Chiến lược IELTS Reading',
     'Skimming, scanning, paraphrase và quản trị thời gian cho 40 câu trong 60 phút.',
     ['Đọc tiêu đề, đoạn mở đầu và câu chủ đề để có bản đồ bài đọc.',
      'Với dạng True/False/Not Given, phân biệt trái ngược và không có thông tin.',
      'Dành tối đa 20 phút cho mỗi passage, chuyển câu khó để quay lại sau.',
      'Luyện nhận diện paraphrase: đề bài thường thay từ bằng đồng nghĩa.'],
     [(17, 27), (90, 92)]),
    ('03-nghe-hieu.pdf', 'Chiến lược IELTS Listening',
     'Dự đoán trước khi nghe, bắt tín hiệu và xử lý chính tả, số liệu, giọng nói.',
     ['Đọc câu hỏi trước để dự đoán loại từ cần điền và nội dung sẽ nghe.',
      'Chú ý từ nối, sửa lời nói và nhấn giọng: đó là tín hiệu đổi ý.',
      'Kiểm tra chính tả, số nhiều và chữ cái trong dạng điền biểu mẫu.',
      'Nghe lại transcript và đối chiếu câu trả lời sai với âm thanh gốc.'],
     [(26, 36), (66, 76)]),
    ('04-viet-task-1.pdf', 'IELTS Writing Task 1: Biểu đồ và quy trình',
     'Tổng quan, lựa chọn số liệu, ngôn ngữ so sánh và kiểm tra lỗi.',
     ['Mở bài paraphrase đề, không sao chép nguyên văn.',
      'Viết một câu Overall nêu xu hướng lớn nhất hoặc khác biệt nổi bật.',
      'Nhóm số liệu theo điểm chung, không liệt kê từng con số.',
      'Dành 3 phút cuối để kiểm tra mạo từ, thì và chính tả.'],
     [(37, 46), (5, 11)]),
    ('05-viet-task-2.pdf', 'IELTS Writing Task 2: Tiểu luận lập luận',
     'Phân tích đề, luận điểm, ví dụ, sự mạch lạc và phản hồi sửa lỗi.',
     ['Xác định dạng đề: opinion, discussion, advantages hay two-part.',
      'Mỗi thân bài có một luận điểm, giải thích và ví dụ cụ thể.',
      'Dùng từ nối tiết chế; tránh khái quát hoá với all, everyone, always.',
      'Nhờ phản hồi có trọng tâm vào một loại lỗi mỗi lần viết.'],
     [(37, 51), (11, 17)]),
    ('06-noi.pdf', 'IELTS Speaking ba phần',
     'Mở rộng câu trả lời, độ trôi chảy, phát âm và tự đánh giá.',
     ['Part 1: trả lời trực tiếp rồi thêm một lý do hoặc ví dụ ngắn.',
      'Part 2: dùng 1 phút ghi ý, nói đủ 1-2 phút theo trình tự cue card.',
      'Part 3: so sánh, giả định và nêu hệ quả để thể hiện năng lực lập luận.',
      'Ghi âm, nghe lại và tự chấm theo bốn tiêu chí chính thức.'],
     [(44, 53), (17, 25)]),
    ('07-tu-vung-va-on-tap.pdf', 'Từ vựng học thuật và ôn tập ngắt quãng',
     'Collocation, tải trọng nhận thức và lịch ôn cá nhân hoá.',
     ['Học từ theo cụm collocation thay vì dịch từng chữ.',
      'Ưu tiên danh sách từ học thuật và kiểm tra ngữ cảnh sử dụng.',
      'Ôn theo khoảng cách tăng dần: 1, 2, 4, 7, 15, 30 ngày.',
      'Trả lời sai thì đưa thẻ về đầu hàng đợi, không xoá thẻ.'],
     [(52, 77)]),
    ('08-gamification.pdf', 'Gamification và động lực học tập',
     'Chuỗi ngày, huy hiệu, giải đấu, mục tiêu và lý thuyết tự quyết.',
     ['Đặt mục tiêu ngày nhỏ, đo được và có thể hoàn thành.',
      'Dùng chuỗi ngày như tín hiệu nhắc nhở, không phải áp lực.',
      'Kết hợp động lực nội tại với phần thưởng biểu tượng có chừng mực.',
      'Đánh giá lại sau mỗi tuần: giữ lại yếu tố giúp bạn học đều hơn.'],
     [(76, 90)]),
    ('09-co-so-khao-thi.pdf', 'Cơ sở khoa học của khảo thí ngôn ngữ',
     'Độ giá trị, độ tin cậy, washback, công bằng và khung CEFR.',
     ['Hiểu độ giá trị như chuỗi bằng chứng về cách dùng điểm số.',
      'Phân biệt độ tin cậy của chấm điểm và tính ổn định của đề.',
      'Washback là ảnh hưởng của kỳ thi lên việc dạy và học.',
      'Đối chiếu mô tả CEFR với năng lực thực tế, không chỉ với điểm số.'],
     [(0, 27), (100, 112)]),
    ('10-tai-lieu-tham-khao.pdf', 'Tổng hợp trích dẫn học thuật',
     'Toàn bộ công trình được trích dẫn trong thư viện, kèm liên kết Google Scholar.',
     ['Mỗi mục gồm tác giả, năm, nhan đề và nguồn xuất bản.',
      'Liên kết dẫn tới trang tìm kiếm tương ứng trên Google Scholar.',
      'Danh mục được kiểm chứng tự động bởi tools/check_pdfs.py.',
      'Dùng danh mục này làm điểm xuất phát cho báo cáo hoặc khoá luận.'],
     [(0, 112)]),
]


def scholar_url(ref):
    authors, year, title, _source = ref
    return 'https://scholar.google.com/scholar?q=' + quote(authors + ' ' + str(year) + ' ' + title)


def esc(value):
    return html.escape(str(value), quote=True)


def pick(ranges):
    out = []
    for start, end in ranges:
        out.extend(range(start, min(end, len(REFERENCES))))
    return out


def register_fonts():
    pdfmetrics.registerFont(TTFont('DejaVu', str(FONT_DIR / 'DejaVuSans.ttf')))
    pdfmetrics.registerFont(TTFont('DejaVu-Bold', str(FONT_DIR / 'DejaVuSans-Bold.ttf')))
    pdfmetrics.registerFontFamily('DejaVu', normal='DejaVu', bold='DejaVu-Bold',
                                  italic='DejaVu', boldItalic='DejaVu-Bold')


def make_styles():
    base = getSampleStyleSheet()
    return {
        'title': ParagraphStyle('ViTitle', parent=base['Title'], fontName='DejaVu-Bold',
                                fontSize=20, leading=26, textColor='#14513d', alignment=TA_LEFT),
        'lead': ParagraphStyle('ViLead', parent=base['Normal'], fontName='DejaVu',
                               fontSize=11, leading=17, spaceAfter=8),
        'h': ParagraphStyle('ViH', parent=base['Heading2'], fontName='DejaVu-Bold',
                            fontSize=13, leading=18, spaceBefore=12, spaceAfter=6),
        'body': ParagraphStyle('ViBody', parent=base['Normal'], fontName='DejaVu',
                               fontSize=10, leading=16, spaceAfter=4),
        'cite': ParagraphStyle('ViCite', parent=base['Normal'], fontName='DejaVu',
                               fontSize=9, leading=14, spaceAfter=5, leftIndent=8),
        'foot': ParagraphStyle('ViFoot', parent=base['Normal'], fontName='DejaVu',
                               fontSize=8, leading=12, textColor='#40536b'),
    }


def build_pdf(path, topic, styles, citation_count):
    doc = SimpleDocTemplate(str(path), pagesize=A4,
                            leftMargin=18 * mm, rightMargin=18 * mm,
                            topMargin=16 * mm, bottomMargin=16 * mm,
                            title=topic[1], author='Trung tâm YYSD',
                            subject='Luyện thi IELTS - tài liệu tiếng Việt')
    story = [Paragraph(esc(topic[1]), styles['title']),
             Paragraph(esc(topic[2]), styles['lead']),
             Paragraph('Trung tâm YYSD · Phiên bản tiếng Việt · 2026', styles['foot']),
             Spacer(1, 8),
             Paragraph('Mục tiêu của tài liệu', styles['h'])]
    for item in topic[3]:
        story.append(Paragraph('• ' + esc(item), styles['body']))
    story.append(Paragraph('Cơ sở khoa học và trích dẫn', styles['h']))
    story.append(Paragraph('Mỗi trích dẫn dưới đây có liên kết trực tiếp tới '
                           'scholar.google.com để bạn tra cứu công trình gốc.', styles['body']))
    for number, index in enumerate(pick(topic[4]), start=1):
        authors, year, title, source = REFERENCES[index]
        url = scholar_url(REFERENCES[index])
        citation = ('<b>[{}]</b> {} ({}). <i>{}</i>. {}. '
                    '<link href="{}" color="#14513d"><u>scholar.google.com</u></link>').format(
                        number, esc(authors), year, esc(title), esc(source), esc(url))
        story.append(Paragraph(citation, styles['cite']))
    story.append(Spacer(1, 10))
    story.append(Paragraph('Danh mục kiểm tra trước khi thi', styles['h']))
    for item in ['Ôn lại các thẻ ghi nhớ đến hạn.', 'Làm một bài thi thử có tính giờ.',
                 'Đối chiếu đáp án với giải thích tiếng Việt.',
                 'Ghi lại ba lỗi cần sửa trong buổi học tiếp theo.']:
        story.append(Paragraph('□ ' + esc(item), styles['body']))
    story.append(Spacer(1, 12))
    story.append(Paragraph('Tài liệu này có {} lượt trích dẫn học thuật. '
                           'Biên soạn bởi Trung tâm YYSD.'.format(citation_count), styles['foot']))
    doc.build(story)


def build_index(manifest):
    links = []
    for entry in manifest['documents']:
        links.append('<li><a href="{}">{}</a><br><span>{} · {} trích dẫn Google Scholar</span></li>'.format(
            esc(entry['file']), esc(entry['title']), esc(entry['topic']), entry['citations']))
    refs = []
    for index, (authors, year, title, source) in enumerate(REFERENCES, start=1):
        refs.append('<li>{} ({}). <i>{}</i>. {}. <a href="{}" rel="noopener">scholar.google.com</a></li>'.format(
            esc(authors), year, esc(title), esc(source), esc(scholar_url(REFERENCES[index - 1]))))
    page = """<!DOCTYPE html>
<html lang="vi"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Thư viện tài liệu PDF IELTS | YYSD</title>
<meta name="description" content="Mười tài liệu PDF tiếng Việt về luyện thi IELTS với {total} lượt trích dẫn học thuật từ scholar.google.com.">
<link rel="stylesheet" href="../css/styles.css"></head>
<body><main class="wrap">
<p><a href="../">← Về ứng dụng luyện thi IELTS</a></p>
<h1>Thư viện tài liệu PDF</h1>
<p class="lead">Tài liệu được biên soạn hoàn toàn bằng tiếng Việt. Mỗi tài liệu có phần cơ sở khoa học với liên kết tới Google Scholar; tổng cộng <strong>{total} lượt trích dẫn</strong> từ <strong>{unique} công trình</strong> khác nhau.</p>
<h2>Danh mục tài liệu</h2><ul class="pdfs">{links}</ul>
<h2>Toàn bộ trích dẫn học thuật</h2><ol>{refs}</ol>
<p><a href="../nghien-cuu/duolingo-va-ielts.html">Đọc báo cáo nghiên cứu về mô hình gamification</a></p>
</main></body></html>
""".format(total=manifest['total_citations'], unique=len(REFERENCES),
           links=''.join(links), refs=''.join(refs))
    (OUT / 'index.html').write_text(page, encoding='utf-8')


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    register_fonts()
    styles = make_styles()
    documents = []
    total = 0
    for filename, title, topic_text, bullets, ranges in TOPICS:
        indices = pick(ranges)
        build_pdf(OUT / filename, (filename, title, topic_text, bullets, ranges), styles, len(indices))
        documents.append({'file': filename, 'title': title, 'topic': topic_text,
                          'citations': len(indices)})
        total += len(indices)
    manifest = {'documents': documents, 'total_citations': total,
                'unique_works': len(REFERENCES), 'source': 'scholar.google.com'}
    (ROOT / 'tools' / 'data' / 'citation_manifest.json').write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    build_index(manifest)
    print('PDF:', len(documents), 'citations:', total, 'unique works:', len(REFERENCES))


if __name__ == '__main__':
    main()
