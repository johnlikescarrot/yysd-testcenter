#!/usr/bin/env python3
"""Locate remaining non-Latin scripts without guessing whether Latin text is English or Vietnamese.

Default: tracked learner/content source on disk. --base REF: same inventory
at an earlier commit. --release DIR: block publication on script hits, a
wrong HTML language, or a missing translated UI. Does not inspect audio or
rasterized pages. PDF/content and links are checked by the handbook tests.
"""

import argparse
import re
import subprocess
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEXT = {'.html', '.htm', '.js', '.mjs', '.jsx', '.ts', '.tsx', '.vue', '.css',
        '.svg', '.json', '.webmanifest', '.txt', '.md', '.py', '.sql', '.csv'}
OTHER_SCRIPT = re.compile(r'[\u3400-\u9fff\uf900-\ufaff\U00020000-\U0002ebef'
                          r'\u3040-\u30ff\uac00-\ud7a3\u1100-\u11ff\u0400-\u052f\u0600-\u06ff\u0e01-\u0e5b]')
VI_HTML = re.compile(r'<html\b[^>]*\blang=["\']vi(?:-VN)?["\']', re.I)


def group(path):
    if path.parts[:2] == ('library', 'practice') or path.parts[:2] == ('library', 'mock'):
        return '/'.join(path.parts[:3])
    return path.parts[0] if len(path.parts) > 1 else 'root pages & documentation'


def tracked(base):
    command = ['git', 'ls-tree', '-r', '--name-only', '-z', base] if base else ['git', 'ls-files', '-z']
    files = subprocess.check_output(command, cwd=ROOT).decode().strip('\0').split('\0')
    paths = [Path(name) for name in files if Path(name).suffix.lower() in TEXT]
    if not base:
        for path in paths:
            yield path, (ROOT / path).read_bytes()
        return
    # Stream historical text blobs only: never materialize 8 GB of exam media.
    with subprocess.Popen(['git', 'cat-file', '--batch'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, cwd=ROOT) as proc:
        for path in paths:
            proc.stdin.write(f'{base}:{path.as_posix()}\n'.encode())
            proc.stdin.flush()
            _oid, kind, size = proc.stdout.readline().split()
            if kind != b'blob':
                raise ValueError(f'Not a blob: {path}')
            yield path, proc.stdout.read(int(size))
            proc.stdout.read(1)
        proc.stdin.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument('--base', metavar='COMMIT')
    mode.add_argument('--release', type=Path, metavar='DIR')
    parser.add_argument('--list', action='store_true', help='include the names of files with script hits')
    args = parser.parse_args()
    if args.release:
        if not (args.release / 'index.html').is_file():
            parser.error('build the Pages release first (missing index.html)')
        stream = ((p.relative_to(args.release), p.read_bytes()) for p in sorted(args.release.rglob('*')) if p.suffix in TEXT)
    else:
        stream = tracked(args.base)
    counts = Counter()
    pdfs = htmls = total = 0
    bad_lang = []
    for path, blob in stream:
        if b'\0' in blob:  # binary disguised as text
            continue
        text = blob.decode('utf-8', 'replace')
        total += 1
        if path.suffix in {'.html', '.htm'}:
            htmls += 1
            if args.release and not VI_HTML.search(text):
                bad_lang.append(path)
        if OTHER_SCRIPT.search(text):
            counts[group(path)] += 1
            if args.list:
                print(path)
    if args.release:
        pdfs = len(list(args.release.rglob('*.pdf')))
        print(f'Pages: {htmls} HTML; {pdfs} PDFs (validated separately).')
        for path in bad_lang:
            print(f'{path}: missing lang="vi"')
    for name, count in sorted(counts.items(), key=lambda row: (-row[1], row[0])):
        print(f'{count:5d} {name}')
    print(f'{total} text files scanned; {sum(counts.values())} files with script hits.')
    print('A hit may be a legacy ID, regular expression, comment or actual untranslated content.')
    return int(bool(args.release and (counts or bad_lang)))


if __name__ == '__main__':
    raise SystemExit(main())
