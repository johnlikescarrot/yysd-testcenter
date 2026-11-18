#!/usr/bin/env python3
"""Rebuild the 24 portable papers in temp storage and compare UI + test data."""

import importlib
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from scripts.verify_cambridge_mock_pages import extract_test_object, load_test


def shell(path):
    text = path.read_text(encoding='utf-8')
    return [line for line in text.replace(extract_test_object(text), '{}', 1).splitlines() if line.strip()]


def main():
    with tempfile.TemporaryDirectory() as directory:
        for volume in (12, 21):
            gen = importlib.import_module(f'scripts.build_cambridge{volume}')
            for n in range(1, 5):
                for skill, checked_in in zip(('listening', 'reading', 'writing'), gen.outputs_for_test(n)):
                    out = Path(directory) / checked_in.name
                    source = getattr(gen, f'{skill}_test')(n)
                    patch = getattr(gen, f'patch_{skill}_meta')
                    gen.write_page(getattr(gen, f'TPL_{skill.upper()}'), out, source, lambda html: patch(html, n))
                    if load_test(out) != load_test(checked_in) or shell(out) != shell(checked_in):
                        raise ValueError(f'{checked_in.name}: generated data or UI differs from the published paper')
    print('OK: rebuilt all 24 Cambridge 12/21 papers, including clip windows and writing draft keys.')


if __name__ == '__main__':
    main()
