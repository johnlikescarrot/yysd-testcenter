#!/usr/bin/env python3
"""Apply reviewed Vietnamese labels to the two separate TOEFL banks after importing papers.

Dry run by default. No network, machine translation, schema/ID changes, or rewriting
English prompts, options, answers, recordings, filenames, sentence chips or scripts.
The legacy *Zh field names are kept for compatibility with the player and the catalog.
"""

import argparse
from collections import Counter
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
LABELS = json.loads((ROOT / 'scripts/locales/toefl-vi.json').read_text(encoding='utf-8'))
HAN = re.compile(r'[\u3400-\u9fff]')
FIELDS = {'titleZh', 'name', 'zh', 'topic', 'title', 'difficulty', 'analysis', 'paperTitle'}
TOKEN = r'"(?:[^"\\]|\\.)*"'
# Consume complete JSON strings (including escaped quotes). Keep the source formatting.
ENTRY = re.compile(rf'(?P<key>{TOKEN})(?:(?P<sep>\s*:\s*)(?P<value>{TOKEN}))?')


def paper_title(text):
    interview = text.removesuffix(' 面试')
    if interview != text:
        title = paper_title(interview)
        return title + ' · Phỏng vấn' if title != interview else text
    official = re.fullmatch(r'托福官方套题 (\d+) · (听力|阅读|写作|口语)', text)
    if official:
        return f'Bộ đề TOEFL chính thức {official[1]} · {LABELS[official[2]]}'
    match = re.fullmatch(r'新托福 (\d{1,2})\.(\d{2})( 国内线下| 海外线下)? · (听力|阅读|写作|口语)( Form \d+)?', text)
    if match:
        month, day, site, skill, form = match.groups()
        place = {' 国内线下': ' (thi trực tiếp tại Trung Quốc)', ' 海外线下': ' (thi trực tiếp ngoài Trung Quốc)'}
        return f'TOEFL {day}/{int(month):02d}{place.get(site, "")} · {LABELS[skill]}{form or ""}'
    match = re.fullmatch(r'新托福第(\d+)套 · (.+)', text)
    if match:
        return f'TOEFL · Bộ {match[1]} · {LABELS.get(match[2], match[2])}'
    return text


def translate(field, value):
    if field not in FIELDS or not HAN.search(value):
        return value
    if field == 'analysis':
        # Only formulaic feedback with a preserved English example or a known
        # topic. Never discard substantive explanations to make a Han scan pass.
        m = re.fullmatch(r'围绕「(.+)」作答。?', value)
        if m and (not HAN.search(m[1]) or m[1] in LABELS):
            return f'Trả lời theo chủ đề “{LABELS.get(m[1], m[1])}”.'
        m = re.fullmatch(r'(复述|正确顺序|原文依据)[：:]\s*([^\u3400-\u9fff]+)', value, flags=re.S)
        if m:
            lead = {'复述': 'Nhắc lại', '正确顺序': 'Thứ tự đúng', '原文依据': 'Bằng chứng trong bài'}[m[1]]
            return f'{lead}: {m[2].replace("。", ".")}'
        return value
    if value in LABELS:
        return LABELS[value]
    match = re.fullmatch(r'(.+?)(\s+#?\d+)', value)
    if match and match[1] in LABELS:
        return LABELS[match[1]] + match[2]
    if value.startswith('题块库 · '):
        tail = value.removeprefix('题块库 · ')
        if tail in LABELS or not HAN.search(tail):
            return 'Kho bài · ' + LABELS.get(tail, tail)
    return paper_title(value)


def localized_text(text, counts):
    def sub(match):
        if not match['value']:
            return match[0]
        key = json.loads(match['key'])
        if key not in FIELDS:
            return match[0]
        old = json.loads(match['value'])
        new = translate(key, old)
        if old == new:
            return match[0]
        counts[key] += 1
        return match['key'] + match['sep'] + json.dumps(new, ensure_ascii=False)
    return ENTRY.sub(sub, text)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--write', action='store_true', help='Save translated fields in place')
    args = parser.parse_args()
    fields, changed = Counter(), 0
    for folder in ('app/library/toefl', 'library/toefl'):
        for path in (ROOT / folder).rglob('*.json'):
            old = path.read_text(encoding='utf-8')
            new = localized_text(old, fields)
            if new != old:
                changed += 1
                if args.write:
                    path.write_text(new, encoding='utf-8')
    print(f'{changed} files, {sum(fields.values())} labels and routine explanations: {dict(fields)}')
    if changed and not args.write:
        raise SystemExit('Pending reviewed translations. Re-run with --write and inspect the diff.')


if __name__ == '__main__':
    main()
