"""Publish an allowlisted IELTS site, never the multi-GB working tree or its API."""
import argparse
import json
import re
import shutil
import subprocess
import tempfile
from collections import defaultdict
from html import escape
from pathlib import Path
from urllib.parse import urlencode

from audio import prepare

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).parent
OUT = ROOT / 'dist'
HAN = re.compile(r'[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af]')
MEDIA = re.compile(r'''["'`]([\w.-]+\.(?:png|jpe?g|svg|mp3|m4a|json))(?:\?[^"'`]*)?["'`]''', re.IGNORECASE)


def content(name):
    return json.loads((HERE / name).read_text())


def catalog():
    files = defaultdict(list)
    for skill in ['reading', 'listening', 'writing']:
        folder = ROOT / f'library/mock/cambridge-{skill}'
        suffix = '' if skill == 'listening' else '-' + skill
        for p in sorted(folder.glob('*.html')):
            match = re.fullmatch(r'cambridge-(\d+)-test-(\d+)' + suffix, p.stem)
            extra = re.fullmatch(r'secret-set-(\d+)' + suffix, p.stem)
            if match:
                book, test = map(int, match.groups())
            elif extra:
                book, test = 0, int(extra[1])
            else:
                raise ValueError(f'Unrecognized paper: {p}')
            files[book].append((skill, test, p.relative_to(ROOT)))
    return files


def placement_papers():
    return sorted(p.relative_to(ROOT) for p in (ROOT/'library/mock/ielts').glob('placement-*.html'))


def library_page(books):
    source = (ROOT/'atlas.html').read_text()
    head = re.sub(r' *<script type="module"[^>]+></script>\n?', '', source.split('<main')[0])
    head = head.replace('Bàn học của bạn ·', 'Thư viện học liệu ·').replace('href="#main" aria-current="page"', 'href="atlas.html"').replace('href="#lo-trinh"', 'href="atlas.html#lo-trinh"').replace('href="atlas-library.html">Thư viện', 'href="atlas-library.html" aria-current="page">Thư viện')
    body = ['<main class="wrap" id="main"><div class="heading"><div><p class="kicker"><i></i> TỦ SÁCH / IELTS ATLAS</p><h1>Thư viện học liệu<span>.</span></h1><p>Luyện sâu hơn với đề Cambridge, thẻ nói và sổ tay có nguồn tham khảo.</p></div></div>', '<nav class="catalog-jump" aria-label="Mục lục thư viện"><a href="#so-tay">Sổ tay PDF</a><a href="#de-thi">Đề luyện tập</a><a href="#the-noi">Thẻ luyện nói</a></nav>', '<section id="so-tay" class="chapter"><h2>Sổ tay phương pháp</h2><p class="catalog-intro">Mỗi sổ tay có bài thực hành, câu hỏi tự đánh giá và liên kết đến các nghiên cứu.</p><div class="guides">']
    data = content('guides.json')
    for g in data['guides']:
        body.append(f'<article class="guide"><span class="pdf-tag">PDF &nbsp; / &nbsp; {g["label"]}</span><h3>{g["title"]}</h3><p>{g["summary"]}</p><a href="studio/pdf/{g["id"]}.pdf">Mở PDF: {g["title"]}</a></article>')
    body.append('</div><details class="catalog-group"><summary>Đọc sổ tay dưới dạng văn bản</summary>')
    for g in data['guides']:
        body.append('<article><h3>'+g['title']+'</h3>')
        for title, text in [*g['sections'], ('Thử ngay', g['task']), ('Ghi vào sổ', g['check'])]:
            body.append(f'<p><strong>{escape(title)}.</strong> {escape(text)}</p>')
        body.append('<ol>')
        for key in g['refs']:
            authors, title, venue, doi = data['sources'][key]
            query = urlencode({'q': f'"{title}"'})
            body.append(f'<li>{escape(authors)}. <span lang="en">{escape(title)}. {escape(venue)}.</span> <a href="https://doi.org/{doi}">DOI</a> · <a href="https://scholar.google.com/scholar?{query}">Google Scholar</a></li>')
        body.append('</ol></article>')
    body.append('</details></section><section id="de-thi" class="chapter"><h2>Kệ đề Cambridge</h2><p class="catalog-intro">Chọn tập sách, kỹ năng rồi mở đề. Bài viết có đếm từ, lưu nháp và phiếu tự đánh giá; không chấm band tự động.</p><a class="backlink" href="library/practice/ielts/sample-academic-reading-1.html">Làm quen · Bài đọc mẫu về ong mật (8 câu)</a>')
    for book, papers in sorted(books.items(), reverse=True):
        shelf = f'Cambridge IELTS {book}' if book else 'Bộ đề bổ sung'
        body.append(f'<details class="catalog-group"><summary>{shelf} · {len(papers)} đề</summary>')
        for skill, label in [('listening', 'Nghe'), ('reading', 'Đọc'), ('writing', 'Viết')]:
            entries = sorted((n, p) for sk, n, p in papers if sk == skill)
            if entries:
                body.append(f'<h3>{label}</h3><ul class="paper-links">')
                for n, p in entries:
                    body.append(f'<li><a href="{p}" aria-label="{label}, {shelf}, Test {n}">Test {n}</a></li>')
                body.append('</ul>')
        body.append('</details>')
    body.append('<details class="catalog-group"><summary>Bài kiểm tra đầu vào · 4 đề</summary><p>Nghe bằng giọng tiếng Anh của thiết bị. Các mục viết và nói dùng thang tự đánh giá hoặc nhận xét của giáo viên, không phải chấm IELTS chính thức.</p><ul>')
    for p in placement_papers():
        title = re.search(r'<meta name="exam:title" content="([^"]+)">', (ROOT/p).read_text())[1]
        body.append(f'<li><a href="{p}">{escape(title)}</a></li>')
    body.append('</ul></details>')
    bank = json.loads((ROOT/'data/speaking/jiijing-banks/2026-q2.json').read_text())
    body.append(f'</section><section id="the-noi" class="chapter"><h2>Thẻ luyện nói</h2><p class="catalog-intro">{escape(bank["title"])}. Nguồn: {escape(bank["source"])}. Mở một thẻ và trả lời thành tiếng; với Part 2, ghi từ khóa trong một phút trước khi nói.</p>')
    for part, items in [('Part 1', bank['part1']), ('Part 2 &amp; 3', bank['part2'])]:
        body.append(f'<h3>{part} · {len(items)} chủ đề</h3>')
        for card in items:
            title = card.get('topic') or card['title']
            body.append(f'<details class="catalog-group"><summary lang="en">{escape(title)}</summary>')
            for key in ['questions', 'bullets', 'part3']:
                if key in card:
                    if key == 'part3':
                        body.append('<strong>Part 3 · Thảo luận mở rộng</strong>')
                    body.append('<ul lang="en">'+''.join(f'<li>{escape(q)}</li>' for q in card[key])+'</ul>')
            body.append('</details>')
    foot = source.split('<footer>')[1].split('</footer>')[0]
    return head+'\n'.join(body)+'</section><a class="backlink" href="atlas.html">← Trở về bàn học</a></main><footer>'+foot+'</footer></body></html>\n'


def assemble(stage):
    books = catalog()
    papers = [p for items in books.values() for _, _, p in items]
    papers.extend(placement_papers())
    papers.append(Path('library/practice/ielts/sample-academic-reading-1.html'))
    media = {p: {p.parent/m for m in MEDIA.findall((ROOT/p).read_text())} for p in papers}
    tracks = {ROOT/asset for assets in media.values() for asset in assets if asset.suffix in {'.mp3', '.m4a'}}
    print(f'Preparing {len(tracks)} listening tracks (cached by source and encoder)…', flush=True)
    audio = prepare(tracks, ROOT / '.cache/atlas-audio')
    stage.mkdir()
    for folder in ['art', 'pdf', 'audio']:
        shutil.copytree(ROOT/'studio'/folder, stage/'studio'/folder)
    esbuild = ROOT / 'node_modules/.bin/esbuild'
    if not esbuild.exists():
        raise SystemExit('Install the pinned build tools with npm ci first')
    subprocess.run([esbuild, ROOT/'studio/src/main.mjs', ROOT/'studio/src/paper.mjs', '--bundle', '--minify',
                    '--format=esm', '--out-extension:.js=.mjs', f'--outdir={stage}/studio/src'], check=True)
    styles = subprocess.check_output([esbuild, ROOT/'studio/atlas.css', '--minify'], text=True)
    # Ship the small, first-paint stylesheet with each hub entry point.
    style = '<style>' + styles + '</style>'
    css_link = '<link rel="stylesheet" href="studio/atlas.css">'
    shell = (ROOT/'atlas.html').read_text().replace(css_link, style)
    rows = subprocess.check_output(['node', HERE/'prerender.mjs'], text=True).strip()
    shell = shell.replace('id="lessons"></ol>', f'id="lessons" data-rendered="all:">{rows}</ol>')
    for name in ['index.html', 'atlas.html']:
        (stage/name).write_text(shell)
    page = library_page(books)
    if page != (ROOT/'atlas-library.html').read_text():
        raise ValueError('Regenerate atlas-library.html: python3 scripts/studio/build.py --catalog')
    (stage/'atlas-library.html').write_text(page.replace(css_link, style))
    for p in papers:
        src = (ROOT/p).read_text()
        dest = stage/p
        dest.parent.mkdir(parents=True, exist_ok=True)
        back = '../' * (len(p.parts)-1) + 'atlas-library.html#de-thi'
        icon = '../' * (len(p.parts)-1) + 'studio/art/compass.svg'
        src = src.replace('</head>', f'<link rel="icon" href="{icon}" type="image/svg+xml">\n</head>', 1)
        dest.write_text(src.replace('<body>', f'<body><nav aria-label="Quay lại"><a style="display:inline-block;padding:8px 16px;color:#173648" href="{back}">← Thư viện IELTS Atlas</a></nav>', 1))
        for asset in media[p]:
            shutil.copyfile(audio.get(ROOT/asset, ROOT/asset), stage/asset)
    (stage/'.nojekyll').touch()
    size = 0
    for path in stage.rglob('*'):
        if path.is_file():
            size += path.stat().st_size
        if path.suffix in {'.css', '.svg', '.html', '.json', '.mjs'}:
            text = path.read_text()
            if HAN.search(text) or re.search(r'''lang=["']zh\b''', text):
                raise ValueError(f'Untranslated content in {path.relative_to(stage)}')
    if size > 780 * 1024**2:
        raise ValueError('Publication exceeds the 780 MiB asset budget')
    print(f'Pages: {len(papers)} exam sheets; {size/1024**2:.1f} MiB → dist/')


def build():
    # A failed build must never remove the last serving copy. Stage on the same filesystem.
    cache = ROOT/'.cache'
    cache.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(dir=cache) as tmp:
        stage = Path(tmp)/'site'
        assemble(stage)
        previous = Path(tmp)/'previous'
        if OUT.exists():
            OUT.rename(previous)
        try:
            stage.rename(OUT)
        except OSError:
            if previous.exists():
                previous.rename(OUT)
            raise


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--catalog', action='store_true', help='Refresh the checked-in library page')
    if parser.parse_args().catalog:
        (ROOT/'atlas-library.html').write_text(library_page(catalog()))
    else:
        build()
