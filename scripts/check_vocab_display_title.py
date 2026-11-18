#!/usr/bin/env python3
"""Assert vocab display titles resolve to THPT / Đại học B1 / nghe đọc viết chữ hợp thành Bài N for all manifest items."""
from __future__ import annotations
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "library" / "manifest.json"

SPECIAL_PREFIX = {
    "vocab-special-listening": " Nghe Từ vựng Bài ",
    "vocab-special-reading": " Đọc Từ vựng Bài ",
    "vocab-special-writing": " Viết Từ vựng Bài ",
}


def list_no(item: dict) -> int:
    t = str(item.get("title") or "")
    for pat in (r"LIST\s*0*(\d+)", r" Bài \s*0*(\d+)", r" thứ \s*0*(\d+)\s* bài "):
        m = re.search(pat, t, re.I)
        if m:
            return int(m.group(1))
    m = re.search(r"(?:writing|listening|reading)-vocab-0*(\d+)", str(item.get("id") or ""), re.I)
    if m:
        return int(m.group(1))
    m = re.search(r"(?:LIST|list|vocab-)0*(\d+)", str(item.get("file") or ""), re.I)
    return int(m.group(1)) if m else 0


def display_title(item: dict) -> str:
    n = list_no(item)
    s = item.get("subject") or ""
    if not n:
        return item.get("title") or ""
    if s == "vocab":
        return f" Từ vựng Nền tảng THPT Bài {n}"
    if s == "vocab-cet4":
        return f" Từ vựng Đại học Cốt lõi Bài {n}"
    if s in SPECIAL_PREFIX:
        return f"{SPECIAL_PREFIX[s]}{n}"
    if str(s).startswith("vocab-special-"):
        return f" Từ vựng IELTS Bài {n}"
    return item.get("title") or ""


def main() -> int:
    items = json.loads(MANIFEST.read_text(encoding="utf-8"))["items"]
    vocab = [it for it in items if str(it.get("subject", "")).startswith("vocab")]
    assert vocab, "no vocab items"
    bad = []
    for it in vocab:
        got = display_title(it)
        if not re.fullmatch(r"(THPT | Đại học B1 | Nghe | Đọc | Viết | IELTS) Từ vựng Bài \d+", got):
            bad.append((it.get("id"), it.get("title"), got))
    if bad:
        print("FAIL", len(bad), "items")
        for row in bad[:12]:
            print(" ", row)
        return 1
    # spot-check special subjects are skill-prefixed
    for it in vocab:
        s = it.get("subject") or ""
        if s not in SPECIAL_PREFIX:
            continue
        got = display_title(it)
        if not got.startswith(SPECIAL_PREFIX[s]):
            print("FAIL special prefix", it.get("id"), got)
            return 1
    print(f"ok {len(vocab)} vocab titles → THPT / Đại học B1 / Nghe | Đọc | Viết Từ vựng Bài N")
    return 0


if __name__ == "__main__":
    sys.exit(main())
