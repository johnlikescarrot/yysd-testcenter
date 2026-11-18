#!/usr/bin/env python3
"""Inventory Han characters in tracked UTF-8 text. This is not a translation-quality score."""

import argparse
import os
import re
import subprocess
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEXT = set('.css .csv .conf .example .html .js .json .md .mdc .mjs .prisma .py .service .sh .sql .svg .swift .toml .ts .tsx .txt .yml'.split())
HAN = re.compile(r'[\u3400-\u9fff\uf900-\ufaff\U00020000-\U0002fa1f\U00030000-\U000323af]')


def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT)


def text_files(rev):
    def eligible(name):
        return Path(name).suffix in TEXT and not name.startswith('scripts/locales/')

    if rev is None:
        for entry in git('ls-files', '-z').split(b'\0'):
            name = os.fsdecode(entry)
            if eligible(name) and (ROOT / name).is_file():
                yield name, (ROOT / name).read_bytes()
        return
    commit = git('rev-parse', '--verify', '--end-of-options', rev + '^{commit}').decode().strip()
    # Batch blob lookup: don't check out another branch or load PDFs/audio into memory.
    with subprocess.Popen(['git', 'cat-file', '--batch'], cwd=ROOT,
                          stdin=subprocess.PIPE, stdout=subprocess.PIPE) as reader:
        for record in git('ls-tree', '-rz', commit).split(b'\0'):
            if not record:
                continue
            desc, path = record.split(b'\t', 1)
            name = os.fsdecode(path)
            if not eligible(name):
                continue
            reader.stdin.write(desc.split()[2] + b'\n')
            reader.stdin.flush()
            size = int(reader.stdout.readline().split()[2])
            blob = reader.stdout.read(size)
            reader.stdout.read(1)  # terminating newline
            yield name, blob
        reader.stdin.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--rev', help='Inspect a local git revision instead of the working tree')
    parser.add_argument('--strict', action='store_true', help='Exit nonzero if any candidates remain')
    args = parser.parse_args()
    files, chars = Counter(), Counter()
    total = 0
    for name, blob in text_files(args.rev):
        try:
            text = blob.decode('utf-8')
        except UnicodeDecodeError:
            continue
        total += 1
        count = len(HAN.findall(text))
        if count:
            parts = Path(name).parts
            group = '/'.join(parts[:3]) if parts[0] == 'library' and len(parts) > 3 else '/'.join(parts[:-1][:2]) or '(gốc)'
            files[group] += 1
            chars[group] += count
    print('## Kiểm kê chữ Hán trong nguồn văn bản')
    print(f'\nĐã đọc {total:,} tệp UTF-8. Còn **{sum(files.values()):,} tệp** chứa **{sum(chars.values()):,} ký tự Hán**.\n')
    print('| Nhóm có nhiều ký tự còn lại | Tệp | Ký tự |\n| --- | ---: | ---: |')
    for group, count in chars.most_common(12):
        print(f'| `{group}` | {files[group]:,} | {count:,} |')
    print('\nĐếm chữ trong nguồn, kể cả chú thích, mã đăng ký và tên riêng. Không tính PDF, ảnh, âm thanh, '
          'tệp ngoài Git hay khóa từ điển nguồn trong `scripts/locales/`. Không đo chữ trong bản vẽ, '
          'chuỗi Unicode đã mã hóa hay độ chính xác/ngôn ngữ của bản dịch.')
    return int(args.strict and bool(files))


if __name__ == '__main__':
    raise SystemExit(main())
