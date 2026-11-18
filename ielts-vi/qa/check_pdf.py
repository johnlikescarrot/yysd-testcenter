"""Kiểm tra cấu trúc, tiếng Việt và liên kết nghiên cứu trong PDF phát hành."""

from pathlib import Path
from urllib.parse import parse_qs, urlparse

from pypdf import PdfReader

MEDIA = Path(__file__).resolve().parents[1] / "media"
DOCUMENTS = {
    "cam-nang-ielts.pdf": ("Cẩm nang IELTS Học thuật", 6, {"bốn kỹ năng", "trọng số gấp đôi"}),
    "so-tay-on-tap.pdf": ("Sổ tay ôn tập 7 ngày", 7, {"Mẫu nhật ký lỗi", "Hẹn lần sau"}),
}


def main():
    for name, (title, count, phrases) in DOCUMENTS.items():
        reader = PdfReader(MEDIA / name)
        assert reader.metadata.title == title
        assert reader.root_object.get("/Lang") == "vi"
        assert reader.root_object.get("/StructTreeRoot"), "PDF cần có cấu trúc đề mục"
        body = " ".join(" ".join(page.extract_text().split()) for page in reader.pages)
        for phrase in {*phrases, title}:
            assert phrase in body, (name, phrase)
        links = set()
        for page in reader.pages:
            for annotation in page.get("/Annots", []):
                uri = annotation.get_object().get("/A", {}).get("/URI")
                if uri:
                    links.add(urlparse(uri))
        assert all(url.scheme == "https" for url in links), (name, "Liên kết ngoài phải dùng HTTPS")
        dois = {url.path[1:] for url in links if url.hostname == "doi.org"}
        scholar = {parse_qs(url.query)["q"][0] for url in links if url.hostname == "scholar.google.com"}
        assert dois == scholar and len(scholar) == count, (name, len(scholar))
        print(f"{name}: {len(reader.pages)} trang, {len(scholar)} nguồn có cả DOI và Google Scholar")


if __name__ == "__main__":
    main()
