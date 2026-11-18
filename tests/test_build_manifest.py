"""Keep the generated library index stable and synchronized with the localized sample."""
import contextlib
import io
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import scripts.build_manifest as manifest


class ManifestTests(unittest.TestCase):
    def test_rebuild_preserves_dates_and_is_stable_when_content_does_not_change(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            library = root / "library"
            sample = library / "practice/ielts/sample.html"
            sample.parent.mkdir(parents=True)
            sample.write_text('<title>First</title><meta name="exam:description" content="Example">', encoding="utf-8")
            manifest_file = library / "manifest.json"
            with (
                patch.object(manifest, "ROOT", str(root)),
                patch.object(manifest, "LIB_DIR", str(library)),
                patch.object(manifest, "MANIFEST", str(manifest_file)),
                patch.object(manifest, "git_added_date", return_value="2020-02-29") as git_date,
                patch.object(manifest, "datetime") as clock,
                contextlib.redirect_stdout(io.StringIO()),
            ):
                clock.now.return_value.strftime.return_value = "2026-01-01T00:00:00Z"
                manifest.main()
                first = manifest_file.read_text(encoding="utf-8")
                self.assertEqual(json.loads(first)["items"][0]["added"], "2020-02-29")
                clock.now.return_value.strftime.return_value = "2026-02-01T00:00:00Z"
                manifest.main()
                self.assertEqual(manifest_file.read_text(encoding="utf-8"), first)
                self.assertEqual(clock.now.call_count, 1)
                sample.write_text('<title>Updated</title><meta name="exam:description" content="Example">', encoding="utf-8")
                manifest.main()
                changed = json.loads(manifest_file.read_text(encoding="utf-8"))
                self.assertEqual(changed["generated"], "2026-02-01T00:00:00Z")
                self.assertEqual(changed["items"][0]["added"], "2020-02-29")
                self.assertEqual(changed["items"][0]["title"], "Updated")
                self.assertEqual(git_date.call_count, 1)

    def test_missing_or_invalid_previous_manifest_is_safe(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "manifest.json"
            with patch.object(manifest, "MANIFEST", str(path)):
                self.assertEqual(manifest.load_previous_manifest(), {})
                path.write_text("not JSON", encoding="utf-8")
                self.assertEqual(manifest.load_previous_manifest(), {})
                path.write_text("[]", encoding="utf-8")
                self.assertEqual(manifest.load_previous_manifest(), {})

    def test_localized_sample_metadata_matches_the_generated_manifest(self):
        path = "practice/ielts/sample-academic-reading-1.html"
        existing = manifest.load_previous_manifest()
        entry = next(item for item in existing["items"] if item["file"] == path)
        self.assertEqual(manifest.build_entry(path, {path: entry["added"]}), entry)


if __name__ == "__main__":
    unittest.main()
