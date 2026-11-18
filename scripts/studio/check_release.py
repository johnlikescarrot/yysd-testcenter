"""Test built links (including fragments) and actual PDF text/link annotations."""
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlsplit

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[2]
DIST = ROOT / 'dist'


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []
        self.ids = set()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.add(attrs['id'])
        for key in ['src', 'href']:
            if key in attrs:
                self.urls.append(attrs[key])


def check_links():
    pages = {}
    edges = []
    for path in DIST.rglob('*.html'):
        links = Links()
        links.feed(path.read_text())
        pages[path] = links.ids
        for url in links.urls:
            parts = urlsplit(url)
            if parts.scheme == 'https' and parts.hostname in {'doi.org', 'scholar.google.com'}:
                continue
            assert not (parts.scheme or url.startswith('/')), f'{path}: unexpected absolute URL: {url}'
            p = (path.parent / unquote(parts.path)).resolve() if parts.path else path
            assert p.is_relative_to(DIST) and p.is_file(), f'{path}: missing target {url}'
            if parts.fragment and p.suffix == '.html':
                edges.append((p, parts.fragment))
    for p, frag in edges:
        assert frag in pages[p], f'Missing anchor: {p}#{frag}'
    print(f'{len(pages)} HTML pages: links and fragments OK')


def check_pdfs():
    data = json.loads(Path(__file__).with_name('guides.json').read_text())
    expected = {g['id'] for g in data['guides']}
    assert expected == {p.stem for p in DIST.rglob('*.pdf')}
    for g in data['guides']:
        pdf = PdfReader(DIST/'studio/pdf'/f'{g["id"]}.pdf')
        assert len(pdf.pages) == 2 and pdf.metadata.title == g['title']
        text = ' '.join(pdf.pages[0].extract_text().split())
        assert g['title'] in text and 'Thử ngay' in text
        nums = {int(n) for match in re.findall(r'\[([\d, ]+)\]', text) for n in match.split(',')}
        assert nums == set(range(1, len(g['refs'])+1))
        uris = [a.get_object()['/A']['/URI'] for a in pdf.pages[1]['/Annots']]
        assert len(uris) == 2 * len(g['refs'])
        for key in g['refs']:
            _, title, _, doi = data['sources'][key]
            assert 'https://doi.org/'+doi in uris
            assert any(parse_qs(urlsplit(uri).query).get('q') == [f'"{title}"']
                       for uri in uris if uri.startswith('https://scholar.google.com/scholar?'))
    print(f'{len(expected)} Vietnamese PDFs: text, inline citations, DOIs and Scholar links OK')


if __name__ == '__main__':
    check_links()
    check_pdfs()
