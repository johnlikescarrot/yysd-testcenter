#!/usr/bin/env python3
"""Assert vocab display titles resolve to trường trung học phổ thông/cấp 4/cười đọc và viết biến thể của | đơn vị N for all manifest items."""
from __future__ import annotations
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "library" / "manifest.json"

SPECIAL_PREFIX = {
    "vocab-special-listening": " thính giác biến thể của | đơn vị ",
    "vocab-special-reading": " đọc biến thể của | đơn vị ",
    "vocab-special-writing": " viết biến thể của | đơn vị ",
}


def list_no(item: dict) -> int:
    t = str(item.get("title") or "")
    for pat in (r"LIST\s*0*(\d+)", r" Đơn vị\s*0*(\d+)", r" Thứ\s*0*(\d+)\s*Bài "):
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
        return f" trường trung học phổ thông biến thể của | đơn vị{n}"
    if s == "vocab-cet4":
        return f" cấp 4 biến thể của | đơn vị{n}"
    if s in SPECIAL_PREFIX:
        return f"{SPECIAL_PREFIX[s]}{n}"
    if str(s).startswith("vocab-special-"):
        return f" IELTS biến thể của | đơn vị{n}"
    return item.get("title") or ""


def main() -> int:
    items = json.loads(MANIFEST.read_text(encoding="utf-8"))["items"]
    vocab = [it for it in items if str(it.get("subject", "")).startswith("vocab")]
    assert vocab, "no vocab items"
    bad = []
    for it in vocab:
        got = display_title(it)
        if not re.fullmatch(r"(trường trung học phổ thông|cấp 4|Nghe hiểu|Đọc hiểu|Viết|IELTS)biến thể của | đơn vị\d+", got):
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
    print(f"ok {len(vocab)} vocab titles → trường trung học phổ thông/cấp 4/Nghe hiểu|Đọc hiểu|viết biến thể của | đơn vị N")
    return 0


if __name__ == "__main__":
    sys.exit(main())
