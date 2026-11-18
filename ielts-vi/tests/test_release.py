"""Failure-mode tests for the packager: don't publish a partial or stale bank."""

import tempfile
import unittest
from importlib import import_module
from pathlib import Path
from unittest.mock import patch

build = import_module("tools.build")
# verify.py also runs as a standalone script and imports the sibling build module.
verify = import_module("tools.verify")


class ReleaseTest(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.root = Path(temp.name)
        self.out = self.root / "out"
        self.out.mkdir()
        self.paper = self.root / "library/mock/cambridge-reading/sample.html"
        self.paper.parent.mkdir(parents=True)
        patcher = patch.multiple(build, ROOT=self.root, HERE=self.root, OUT=self.out)
        patcher.start()
        self.addCleanup(patcher.stop)

    def test_rebuild_never_publishes_a_stale_asset(self):
        self.out.rmdir()
        (self.root / "assets").mkdir()
        (self.root / "assets/handout.pdf").write_bytes(b"version one")
        build.stage_assets()
        self.assertEqual((self.out / "assets/handout.pdf").read_bytes(), b"version one")
        (self.root / "assets/handout.pdf").unlink()
        build.stage_assets()
        self.assertFalse((self.out / "assets/handout.pdf").exists())

    def test_content_and_assets_fail_closed(self):
        self.paper.write_text("<body>未作答</body>")
        with self.assertRaisesRegex(ValueError, "missing translation"):
            build.package_paper("practice", self.paper)
        with self.assertRaisesRegex(ValueError, "scoring helper"):
            build.package_paper("reading", self.paper)
        self.paper.write_text('<img src="absent.png?rev=12">')
        with self.assertRaises(FileNotFoundError):
            build.package_paper("practice", self.paper)
        self.paper.write_text('<img src="bamboo_fabric_diagram.png">')
        with self.assertRaisesRegex(ValueError, "image declaration"):
            build.package_paper("writing", self.paper)
        (self.paper.parent / "present.png").write_bytes(
            b"image placeholder for fixture"
        )
        self.paper.write_text('<img src="present.png?rev=12">')
        for _ in range(2):
            build.package_paper("practice", self.paper)
        self.assertEqual(
            (self.out / self.paper.relative_to(self.root)).read_text(),
            self.paper.read_text(),
        )
        self.assertTrue(
            (
                self.out / self.paper.parent.relative_to(self.root) / "present.png"
            ).exists()
        )

    def test_stale_catalogue_and_oversize_artifact(self):
        (self.root / "index.html").write_text("old")
        with self.assertRaisesRegex(ValueError, "Stale index"):
            build.generated("index.html", lambda prefix: prefix + "current")
        (self.out / "clip.mp3").write_bytes(b"1234")
        with self.assertRaisesRegex(ValueError, "budget exceeded"):
            build.check_budget(self.out, 4 / 1048576)

    def test_subpath_links_and_fragment_integrity(self):
        f = self.out / "index.html"
        for url in [
            "absent.mp3",
            "/other-app",
            "#missing",
            "//another.invalid/picture.png",
            "../outside.mp3",
            "http://example.test",
        ]:
            with self.subTest(url=url):
                f.write_text(f'<a href="{url}">Open</a>')
                with self.assertRaises(AssertionError):
                    verify.verify_links(self.out)
        f.write_text('<p id="me"><a href="#me">Self</a></p><audio controls></audio>')
        verify.verify_links(self.out)

    def test_changed_question_or_answer_is_rejected(self):
        for expected, actual in [
            (["True"], ["False"]),
            ({"no": 1}, {"no": 2}),
            (["one", "two"], ["one"]),
            ({"explain": "quote"}, {"why": "quote"}),
        ]:
            with self.subTest(actual=actual), self.assertRaises(AssertionError):
                verify.exam_data(expected, actual, ("sample",))
