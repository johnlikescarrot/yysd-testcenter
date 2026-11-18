"""Check release links, bibliographies, PDF text and the English assessment data."""

import re
import sys
from html.parser import HTMLParser
from importlib import import_module
from urllib.parse import unquote, urlsplit

from build import HAN, OUT, ROOT, papers
from pypdf import PdfReader

sys.path.insert(0, str(ROOT / "scripts"))
load_test = import_module("verify_cambridge_mock_pages").load_test


class Page(HTMLParser):
    def __init__(self, file):
        super().__init__()
        self.hrefs = []
        self.ids = set()
        self.feed(file.read_text())

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            self.ids.add(a["id"])
        if tag in ("a", "link", "img", "script", "use", "audio"):
            url = a.get("href") or a.get("src")
            if url:
                self.hrefs.append(url)


def exam_data(a, b, path):
    if isinstance(a, list):
        assert len(a) == len(b), path
        for i, (x, y) in enumerate(zip(a, b, strict=True)):
            exam_data(x, y, (*path, i))
    elif isinstance(a, dict):
        # Two figures are absent in the original checkout; the release displays
        # an explicit missing-figure message instead of loading a broken URL.
        if a.get("image") in (
            "bamboo_fabric_diagram.png",
            "ielts13_test3_electricity.png",
        ):
            assert "Chưa có hình" in b["svg"], path
            b = {**b, "image": a["image"]}
            del b["svg"]
        assert a.keys() == b.keys(), path
        for k, x in a.items():
            exam_data(x, b[k], (*path, k))
    elif isinstance(a, str) and (
        HAN.search(a) or re.search("[（）：，。；？　【】]", a)
    ):
        assert isinstance(b, str) and b.strip() and not HAN.search(b), path
    else:
        assert a == b, path


def verify():
    for file in OUT.rglob("*.html"):
        doc = Page(file)
        for link in doc.hrefs:
            parts = urlsplit(link)
            if parts.scheme:
                assert parts.scheme in ("https", "data"), (file, link)
                continue
            assert not parts.netloc and not parts.path.startswith("/"), (file, link)
            if parts.path:
                target = (file.parent / unquote(parts.path)).resolve()
                assert target.is_relative_to(OUT) and target.is_file(), (file, link)
            elif parts.fragment:
                assert unquote(parts.fragment) in doc.ids, (file, link)
    for name, n in [("cam-nang", 12), ("so-thuc-hanh", 7)]:
        html = Page(OUT / (name + ".html"))
        refs = {
            u
            for u in html.hrefs
            if urlsplit(u).hostname in ("doi.org", "scholar.google.com")
        }
        assert len({u for u in refs if "doi.org" in u}) == n, name
        assert len({u for u in refs if "scholar.google.com" in u}) == n, name
        pdf = PdfReader(OUT / "assets" / (name + ".pdf"))
        uris = {
            annot.get_object().get("/A", {}).get("/URI")
            for page in pdf.pages
            for annot in page.get("/Annots", [])
        }
        assert refs <= uris, (name, refs - uris)
        assert "Tài liệu tham khảo" in "\n".join(
            page.extract_text() for page in pdf.pages
        ), name
    for _, _, _, src in papers():
        exam_data(load_test(src), load_test(OUT / src.relative_to(ROOT)), (src.name,))
    print(
        "OK: local assets/anchors, PDF citations, paper IDs, answers and English prompts match."
    )


if __name__ == "__main__":
    verify()
