"""Render the volume 12/21 papers without modifying English questions or media paths."""

import json
import re
from copy import deepcopy
from pathlib import Path

from scripts.verify_cambridge_mock_pages import extract_test_object


def with_clip_windows(test):
    """The timestamps were aligned to these specific recordings, not to translated labels."""
    result = deepcopy(test)
    path = Path(__file__).with_name('cambridge_sources') / 'clip_windows.json'
    windows = json.loads(path.read_text(encoding='utf-8'))
    for section in result['sections']:
        clips = windows[section['audio']]
        section['audioClips'] = [dict(qFrom=a, qTo=b, audioStart=start, audioEnd=end)
                                 for a, b, start, end in clips]
        for group in section['groups']:
            numbers = re.findall(r'\d+', group['title'])
            span = [int(numbers[0]), int(numbers[-1])]
            for a, b, start, end in clips:
                if span == [a, b]:
                    group.update(audioStart=start, audioEnd=end)
                    break
    return result


def write_page(template, out, test, patch_meta):
    text = template.read_text(encoding='utf-8')
    # Split rather than regex-replacing the JS literal. A question can contain
    # braces, backslashes, or even the name of a different Cambridge test.
    head, _, tail = text.partition(extract_test_object(text))
    head, tail = patch_meta(head), patch_meta(tail)
    if 'task1' in test:
        tail, count = re.subn(r'const SKEY = "[^"]+";', f'const SKEY = "{out.stem}-draft";', tail)
        if count != 1:
            raise ValueError(f'{template}: expected one writing draft key')
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(head + json.dumps(test, ensure_ascii=False, indent=2) + tail, encoding='utf-8')
    print(f'wrote {out.name}')
