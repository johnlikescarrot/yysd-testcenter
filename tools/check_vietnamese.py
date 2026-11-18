"""Kiem tra: moi noi dung khong phai tieng Anh da duoc viet hoa."""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HAN = re.compile(r'[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]')
OTHER = re.compile('[' + ''.join([
    '\u3040-\u30ff', '\u3100-\u312f', '\uac00-\ud7af', '\u1100-\u11ff',
    '\u0400-\u04ff', '\u0e00-\u0e7f', '\u0600-\u06ff', '\u0590-\u05ff',
    '\u0900-\u097f', '\uff00-\uffef',
]) + ']')
EXT = {'html', 'htm', 'json', 'js', 'mjs', 'cjs', 'ts', 'tsx', 'jsx', 'css',
       'scss', 'md', 'txt', 'py', 'sh', 'sql', 'yml', 'yaml', 'xml', 'svg',
       'conf', 'example', 'gitignore', 'mdc', 'csv', 'ini', 'toml'}
SKIP = {'.git', 'node_modules', '__pycache__', '.cache', '.venv', 'venv',
        'coverage', 'dist', 'build', '.next'}


def main():
    errors = []
    files = 0
    vietnamese_chars = 0
    for path in ROOT.rglob('*'):
        if not path.is_file() or path.stat().st_size > 9_000_000:
            continue
        if any(part in SKIP for part in path.relative_to(ROOT).parts):
            continue
        if path.suffix.lower().lstrip('.') not in EXT:
            continue
        if path.relative_to(ROOT).as_posix().startswith('tools/data/'):
            continue
        try:
            text = path.read_text(encoding='utf-8')
        except (UnicodeDecodeError, OSError):
            continue
        files += 1
        # Cac truong id/file la dinh danh va duong dan tep, khong phai noi dung.
        if path.relative_to(ROOT).as_posix() == 'library/manifest.json':
            try:
                data = json.loads(text)
                scan = json.dumps(
                    [{k: v for k, v in item.items() if k not in ('id', 'file')}
                     for item in data.get('items', [])],
                    ensure_ascii=False,
                )
            except (ValueError, TypeError, AttributeError):
                scan = text
        else:
            scan = text
        vietnamese_chars += len(re.findall(r'[ăâđêôơưĂÂĐÊÔƠƯ]', scan))
        han = len(HAN.findall(scan))
        other = len(OTHER.findall(scan))
        if han or other:
            errors.append('{}: Han={} khac={}'.format(
                path.relative_to(ROOT).as_posix(), han, other))
    index = (ROOT / 'docs' / 'index.html').read_text(encoding='utf-8')
    if 'lang="vi"' not in index:
        errors.append('docs/index.html thieu lang="vi"')
    if 'Luyện thi IELTS' not in index:
        errors.append('docs/index.html thieu tieu de tieng Viet')
    if vietnamese_chars < 1000:
        errors.append('It ky tu tieng Viet: ' + str(vietnamese_chars))
    print('Kiem tra {} tep, {} ky tu tieng Viet dac trung'.format(files, vietnamese_chars))
    if errors:
        print('LOI:')
        for error in errors[:25]:
            print(' -', error)
        return 1
    print('DAT: toan bo noi dung da la tieng Viet hoac tieng Anh')
    return 0


if __name__ == '__main__':
    sys.exit(main())
