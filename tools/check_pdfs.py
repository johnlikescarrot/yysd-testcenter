"""Kiểm chứng số lượng trích dẫn scholar.google.com trong các tệp PDF."""
import json
import re
import sys
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs' / 'tai-lieu'
MANIFEST = ROOT / 'tools' / 'data' / 'citation_manifest.json'
STREAM = re.compile(rb'stream\r?\n(.*?)endstream', re.S)


def pdf_text(path):
    raw = path.read_bytes()
    chunks = [raw]
    for match in STREAM.finditer(raw):
        try:
            chunks.append(zlib.decompress(match.group(1)))
        except zlib.error:
            continue
    return b'\n'.join(chunks)


def main():
    manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
    errors = []
    total = 0
    for entry in manifest['documents']:
        path = OUT / entry['file']
        if not path.exists():
            errors.append('Thieu tep: ' + entry['file'])
            continue
        text = pdf_text(path)
        count = text.count(b'scholar.google.com')
        urls = re.findall(rb'https://scholar\.google\.com/scholar\?q=[^\s)>]+', text)
        if count < entry['citations']:
            errors.append('{}: {} < {}'.format(entry['file'], count, entry['citations']))
        if not urls:
            errors.append('Khong co lien ket Scholar trong ' + entry['file'])
        total += count
        print('{}: {} luot scholar.google.com, {} lien ket'.format(entry['file'], count, len(urls)))
    if total < 150:
        errors.append('Tong so luot trich dan qua it: ' + str(total))
    if errors:
        print('LOI: ' + '; '.join(errors))
        return 1
    print('DAT: tong {} luot trich dan scholar.google.com'.format(total))
    return 0


if __name__ == '__main__':
    sys.exit(main())
