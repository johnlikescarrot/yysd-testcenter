#!/usr/bin/env python3
"""Kiểm chứng bản địa hoá: không còn ký tự Hán, HTML đều lang="vi"."""
from __future__ import annotations
import os
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CJK = re.compile(r"[\u3400-\u9fff]")
TEXT_EXT = {".html", ".htm", ".js", ".mjs", ".cjs", ".css", ".json", ".md",
            ".py", ".ts", ".tsx", ".yml", ".yaml", ".txt", ".svg", ".xml",
            ".webmanifest", ".mdc"}
EXEMPT = {"tools/i18n/zhvi.json", "tools/i18n/glossary_vi.json",
          "tools/i18n/CVDICT.u8", "ielts/research/sources.orig.json"}


def main() -> int:
    hits: Counter = Counter()
    files = 0
    html = 0
    wrong_lang = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in
                       {".git", "node_modules", "dist", "coverage", ".venv", "__pycache__"}]
        for name in filenames:
            p = Path(dirpath) / name
            if p.suffix.lower() not in TEXT_EXT or p.stat().st_size > 20_000_000:
                continue
            r = p.relative_to(ROOT).as_posix()
            if r in EXEMPT:
                continue
            try:
                text = p.read_text(encoding="utf-8")
            except (UnicodeDecodeError, OSError):
                continue
            files += 1
            n = len(CJK.findall(text))
            if n:
                hits[r] = n
            if p.suffix.lower() in {".html", ".htm"}:
                html += 1
                m = re.search(r"<html[^>]*\blang\s*=\s*[\"']([^\"']+)", text)
                if m and m.group(1) != "vi":
                    wrong_lang.append((r, m.group(1)))
                elif not m:
                    wrong_lang.append((r, "thiếu lang"))
    print(f"[i18n] đã quét {files} tệp văn bản, {html} tệp HTML")
    print(f"[i18n] tệp còn ký tự Hán: {len(hits)} · tổng ký tự: {sum(hits.values())}")
    for r, n in hits.most_common(20):
        print(f"  · {r}: {n}")
    print(f"[i18n] HTML chưa khai báo lang=\"vi\": {len(wrong_lang)}")
    for r, lang in wrong_lang[:20]:
        print(f"  · {r}: {lang}")
    ok = not hits and not wrong_lang
    print("[i18n] ĐẠT — toàn bộ nội dung không phải tiếng Anh đã được Việt hoá" if ok
          else "[i18n] CHƯA ĐẠT")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
