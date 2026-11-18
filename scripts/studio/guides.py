"""Generate the five original handbooks. Never rewrite publisher exam PDFs."""
import json
from html import escape
from pathlib import Path
from urllib.parse import urlencode

from reportlab import rl_config
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer

ROOT = Path(__file__).resolve().parents[2]
DATA = json.loads(Path(__file__).with_suffix('.json').read_text())


def generate():
    rl_config.invariant = 1
    for name, face in [('Atlas', 'Sans'), ('AtlasB', 'Sans-Bold'), ('AtlasT', 'Serif-Bold')]:
        pdfmetrics.registerFont(TTFont(name, f'/usr/share/fonts/truetype/dejavu/DejaVu{face}.ttf'))
    ink = colors.HexColor('#172f40')
    styles = {name: ParagraphStyle(name, fontName=font, fontSize=size, leading=lead,
                                   textColor=ink, spaceAfter=space)
              for name, font, size, lead, space in [('title', 'AtlasT', 26, 33, 13),
                  ('h', 'AtlasB', 13, 18, 5), ('body', 'Atlas', 10.5, 16, 11),
                  ('ref', 'Atlas', 9.3, 14.5, 5), ('label', 'AtlasB', 9, 14, 9)]}

    def page(canvas, document):
        canvas.saveState()
        canvas.setFillColor(ink)
        canvas.rect(0, A4[1]-42, A4[0], 42, fill=1, stroke=0)
        canvas.setFillColor(colors.white)
        canvas.setFont('AtlasB', 10)
        canvas.drawString(46, A4[1]-26, 'IELTS ATLAS   /   SỔ TAY HỌC TẬP')
        canvas.setFillColor(ink)
        canvas.setFont('Atlas', 8)
        canvas.drawString(46, 31, 'YYSD   •   Tài liệu tự học, không phải thang chấm điểm IELTS.')
        canvas.drawRightString(A4[0]-46, 31, f'Trang {document.page}')
        canvas.restoreState()

    for i, g in enumerate(DATA['guides'], 1):
        doc = SimpleDocTemplate(str(ROOT/'studio/pdf'/f"{g['id']}.pdf"), pagesize=A4,
                                title=g['title'], author='YYSD · IELTS Atlas',
                                leftMargin=46, rightMargin=46, topMargin=62, bottomMargin=52)
        story = []

        def add(style, text, target=story):
            target.append(Paragraph(escape(text), styles[style]))

        add('label', f"SỔ TAY {i:02d}   /   {g['label']}")
        add('title', g['title'])
        add('body', g['summary'])
        for heading, text in g['sections']:
            add('h', heading)
            add('body', text)
        add('h', 'Thử ngay')
        add('body', g['task'])
        add('h', 'Ghi vào sổ')
        add('body', g['check'])
        story.append(PageBreak())
        add('label', 'ĐỌC THÊM   /   THƯ MỤC CHÚ GIẢI')
        add('title', 'Nghiên cứu liên quan')
        add('body', 'Các số trong ngoặc vuông ở trang trước trỏ tới danh mục dưới đây. Liên kết DOI dẫn tới ấn phẩm; Google Scholar giúp tìm bài theo nhan đề. Các nghiên cứu không chứng minh rằng dùng ứng dụng sẽ tăng một mức điểm IELTS cụ thể.')
        for n, key in enumerate(g['refs'], 1):
            authors, title, venue, doi = DATA['sources'][key]
            add('ref', f'[{n}] {authors}. {title}. {venue}.')
            url = 'https://scholar.google.com/scholar?' + urlencode({'q': f'"{title}"'})
            story.append(Paragraph(f'<a color="#235e55" href="https://doi.org/{escape(doi)}"><u>DOI: {escape(doi)}</u></a>   ·   <a color="#235e55" href="{escape(url)}"><u>Google Scholar</u></a>', styles['ref']))
            story.append(Spacer(1, 8))
        doc.build(story, onFirstPage=page, onLaterPages=page)


if __name__ == '__main__':
    generate()
