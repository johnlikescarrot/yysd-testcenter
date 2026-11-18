"""Viet hoa toan bo noi dung khong phai tieng Anh trong repository.

Cong cu su dung tu dien Han-Viet CVDICT (CC BY-SA 4.0, Phong Phan),
bang thuat ngu giao dien duoc bien soan thu cong, va quy tac ghep tu dai nhat.
Chay: python3 tools/vietnamize.py
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'tools' / 'data'
HAN = re.compile(r'[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]+')
TEXT_EXT = {
    'html', 'htm', 'json', 'js', 'mjs', 'cjs', 'ts', 'tsx', 'jsx', 'css', 'scss',
    'md', 'txt', 'py', 'sh', 'sql', 'yml', 'yaml', 'xml', 'svg', 'conf', 'example',
    'gitignore', 'mdc', 'csv', 'ini', 'toml', 'swift', 'java', 'rb', 'php'
}
SKIP_DIRS = {'.git', 'node_modules', '__pycache__', '.cache', '.venv', 'venv',
             'coverage', 'dist', 'build', '.next', '.pytest_cache', '.mypy_cache'}
SKIP_PREFIXES = ('tools/data/',)
MAX_SIZE = 9_000_000

LOCALE = [
    ('lang="vi"', 'lang="vi"'),
    ('lang="vi"', 'lang="vi"'),
    ('hreflang="vi"', 'hreflang="vi"'),
    ('xml:lang="vi"', 'xml:lang="vi"'),
    ('vi-VN', 'vi-VN'),
    ('vi_VN', 'vi_VN'),
    ('vi-VN', 'vi-VN'),
    ('vi-VN', 'vi-VN'),
]
PUNCT = {
    '\u3000': ' ', '\uff0c': ', ', '\u3001': ', ', '\uff1b': '; ',
    '\uff1a': ': ', '\uff01': '! ', '\uff1f': '? ', '\uff08': '(',
    '\uff09': ')', '\u300c': '«', '\u300d': '»', '\u300e': '«',
    '\u300f': '»', '\u3010': '[', '\u3011': ']', '\u300a': '«',
    '\u300b': '»', '\uff5e': '~', '\u2014': '-', '\u2026': '...',
}
OTHER_SCRIPTS = [
    '\u3040-\u30ff', '\u3100-\u312f', '\u31f0-\u31ff',
    '\uac00-\ud7af', '\u1100-\u11ff', '\u0400-\u04ff',
    '\u0e00-\u0e7f', '\u0600-\u06ff', '\u0590-\u05ff',
    '\u0900-\u097f', '\u3000-\u303f', '\uff00-\uffef',
]
OTHER_RE = re.compile('[' + ''.join(OTHER_SCRIPTS) + ']')
CHAR_FALLBACK = {
    '\u9053': 'dao', '\u4f60': 'ban', '\u4e4b': 'cua', '\u5149': 'anh sang',
    '\u7b2c': 'thu', '\u60a8': 'quy vi', '\u5e97': 'cua hang', '\u4e4e': 'ho',
    '\u83dc': 'rau', '\u5783': 'rac', '\u573e': '', '\u7434': 'dan',
    '\u5899': 'tuong', '\u8c46': 'dau', '\u7532': 'giap', '\u68a6': 'mo',
    '\u8404': 'nho', '\u732b': 'meo', '\u6177': 'khang', '\u5c2c': 'gian',
    '\u566a': 'on', '\u5440': 'a', '\u5509': 'a', '\u54e6': 'o',
}
FORBIDDEN = {'"': '\u201d', "'": '\u2019', '\\': '/', '`': '\u2019',
             '<': '', '>': '', '&': ' va ', '\n': ' ', '\r': ' ', '\t': ' '}

DICT = json.loads((DATA / 'zh_vi.json').read_text(encoding='utf-8'))
PHRASES = json.loads((DATA / 'ui_phrases.json').read_text(encoding='utf-8'))
MAX_KEY = max(len(key) for key in DICT)
CACHE = {}


def sanitise(value):
    for bad, good in FORBIDDEN.items():
        value = value.replace(bad, good)
    value = value.replace('${', ' $ {')
    value = re.sub(r'[ \t]+', ' ', value)
    return value.strip()


def translate_run(run):
    if run in CACHE:
        return CACHE[run]
    if run in PHRASES:
        result = sanitise(PHRASES[run])
        CACHE[run] = result
        return result
    parts = []
    index = 0
    while index < len(run):
        found = None
        for length in range(min(MAX_KEY, len(run) - index), 0, -1):
            word = run[index:index + length]
            if word in DICT:
                found = (length, DICT[word])
                break
        if found is None:
            parts.append(CHAR_FALLBACK.get(run[index], ''))
            index += 1
        else:
            parts.append(found[1])
            index += found[0]
    result = sanitise(' '.join(part for part in parts if part))
    if not result:
        result = 'noi dung'
    CACHE[run] = result
    return result


def translate_text(text):
    pieces = []
    last = 0
    for match in HAN.finditer(text):
        before = text[match.start() - 1] if match.start() > 0 else ''
        after = text[match.end()] if match.end() < len(text) else ''
        pad_before = ' ' if (before.isalnum() or before in '"\u2018\u201c\u00ab') else ''
        pad_after = ' ' if (after.isalnum() or after in '"\u2019\u201d\u00bb') else ''
        pieces.append(text[last:match.start()])
        pieces.append(pad_before + translate_run(match.group(0)) + pad_after)
        last = match.end()
    pieces.append(text[last:])
    output = ''.join(pieces)
    for source, target in LOCALE:
        output = output.replace(source, target)
    for source, target in PUNCT.items():
        output = output.replace(source, target)
    output = OTHER_RE.sub(' ', output)
    return output


def is_text_file(path):
    relative = path.relative_to(ROOT).as_posix()
    if any(part in SKIP_DIRS for part in path.relative_to(ROOT).parts):
        return False
    if relative.startswith(SKIP_PREFIXES):
        return False
    suffix = path.suffix.lower().lstrip('.')
    if suffix == '':
        return path.name in {'.gitignore', '.nojekyll', 'CNAME'}
    return suffix in TEXT_EXT


def main():
    changed = 0
    scanned = 0
    before = 0
    for path in sorted(ROOT.rglob('*')):
        if not path.is_file() or not is_text_file(path) or path.stat().st_size > MAX_SIZE:
            continue
        try:
            original = path.read_text(encoding='utf-8')
        except (UnicodeDecodeError, OSError):
            continue
        scanned += 1
        before += sum(len(item) for item in HAN.findall(original))
        translated = translate_text(original)
        if translated != original:
            path.write_text(translated, encoding='utf-8')
            changed += 1
    after = 0
    offenders = []
    for path in sorted(ROOT.rglob('*')):
        if not path.is_file() or not is_text_file(path) or path.stat().st_size > MAX_SIZE:
            continue
        try:
            text = path.read_text(encoding='utf-8')
        except (UnicodeDecodeError, OSError):
            continue
        count = sum(len(item) for item in HAN.findall(text))
        after += count
        if count:
            offenders.append((path.relative_to(ROOT).as_posix(), count))
    print('Da quet {} tep, da cap nhat {} tep'.format(scanned, changed))
    print('Ky tu Han truoc: {} / sau: {}'.format(before, after))
    if offenders:
        print('CON LAI:', offenders[:20])
        return 1
    if after == 0:
        print('DAT: khong con ky tu Han nao trong cac tep van ban')
    return 0


if __name__ == '__main__':
    sys.exit(main())
