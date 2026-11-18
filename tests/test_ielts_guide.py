"""Verify the shipped guide's bibliography and clickable research links."""
import ast
import unittest
from pathlib import Path
from urllib.parse import quote

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]


class GuideTests(unittest.TestCase):
    def test_pdf_contains_each_bibliographic_doi_and_scholar_query(self):
        tree = ast.parse((ROOT / "scripts/build_ielts_guide.py").read_text(encoding="utf-8"))
        assignment = next(node for node in tree.body if isinstance(node, ast.Assign)
                          and any(isinstance(target, ast.Name) and target.id == "SOURCES" for target in node.targets))
        sources = ast.literal_eval(assignment.value)
        self.assertGreaterEqual(len(sources), 20)
        self.assertEqual(len({source[3] for source in sources}), len(sources))
        reader = PdfReader(ROOT / "docs/ielts/cam-nang-ielts.pdf")
        self.assertGreaterEqual(len(reader.pages), 4)
        text = "\n".join(page.extract_text() for page in reader.pages)
        self.assertIn("Hành trình IELTS", text)
        self.assertNotRegex(text, r"[\u3400-\u9fff]")
        links = set()
        for page in reader.pages:
            for annotation in page.get("/Annots", []):
                action = annotation.get_object().get("/A", {})
                if action.get("/URI"):
                    links.add(str(action["/URI"]))
        for _, title, _, doi in sources:
            with self.subTest(title=title):
                self.assertIn("https://doi.org/" + doi, links)
                self.assertIn("https://scholar.google.com/scholar?q=" + quote('"' + title + '"'), links)


if __name__ == "__main__":
    unittest.main()
