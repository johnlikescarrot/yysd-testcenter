import tempfile
import unittest
from pathlib import Path

from scripts.cambridge_localized import load_test, write_paper


class ImporterTests(unittest.TestCase):
    def test_preserve_shell_and_reviewed_hint_without_overwriting_new_input(self):
        original = '''<html lang="vi"><title>Cambridge IELTS 12</title><script>
        const TEST = {sections:[{id:1,groups:[{kind:'note',questions:[
        {id:'L1',no:1,answer:['blue'],explain:'Nghe màu của chiếc áo.'}]}]}]};
        </script><output id="resCorrect"></output></html>'''
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder)/'cambridge-12-test-1.html'
            path.write_text(original)
            data = load_test(path)
            q = data['sections'][0]['groups'][0]['questions'][0]
            q['explain'] = '答案：blue。'
            write_paper(path, '<html>wrong volume</html>', data)
            self.assertIn('Cambridge IELTS 12', path.read_text())
            self.assertIn('Nghe màu của chiếc áo.', path.read_text())
            self.assertIn('id="resCorrect"', path.read_text())
            q.update(answer=['green'], explain='答案：green。')
            write_paper(path, original, data)
            self.assertIn('Đáp án: green.', path.read_text())
            before = path.read_text()
            q['explain'] = '新注释'
            with self.assertRaisesRegex(ValueError, 'translate new input'):
                write_paper(path, original, data)
            self.assertEqual(path.read_text(), before)


if __name__ == '__main__':
    unittest.main()
