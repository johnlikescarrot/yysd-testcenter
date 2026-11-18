"""Regression tests for the existing vocabulary hook validator."""
import tempfile
import unittest
from pathlib import Path

from scripts.verify_vocab_wrongword_hooks import LIB, check_file, is_graded_list


class VocabHookTests(unittest.TestCase):
    def test_only_two_non_list_teacher_examples_are_exempt(self):
        self.assertFalse(is_graded_list(LIB / "study/vocab/教师模版-单词检测.html"))
        self.assertFalse(is_graded_list(LIB / "study/vocab/教师模版-词库学习List.html"))
        self.assertTrue(is_graded_list(LIB / "study/vocab/教师模版-单词List.html"))
        self.assertTrue(is_graded_list(LIB / "study/vocab/new-list.html"))

    def test_graded_lists_still_require_the_common_and_layout_hooks(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "list.html"
            path.write_text('<div id="testResults" data-mode="test" class="row-wrong"></div>', encoding="utf-8")
            self.assertEqual(check_file(path, "standard"), ['id="resultsTableBody"'])
            self.assertEqual(check_file(path, "special"), ['id="stageResults"'])
            path.write_text(
                '<div id="testResults" data-mode="test" class="row-wrong">'
                '<div id="resultsTableBody"></div><div id="stageResults"></div></div>',
                encoding="utf-8",
            )
            self.assertEqual(check_file(path, "standard"), [])
            self.assertEqual(check_file(path, "special"), [])


if __name__ == "__main__":
    unittest.main()
