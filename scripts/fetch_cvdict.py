#!/usr/bin/env python3
"""Derive a compact Chinese -> Vietnamese phrase map from CVDICT.

CVDICT (https://github.com/ph0ngp/CVDICT, by Phong Phan) is a 122,000-entry
Chinese-Vietnamese dictionary published under CC BY-SA 4.0.  It is based on
CC-CEDICT.  See ``localization/vi/LICENSE-CVDICT.md`` for the full attribution.

This script downloads CVDICT.u8 through the GitHub API (the only network host
needed), keeps the *simplified* headword and its first Vietnamese gloss, and
writes ``localization/vi/cvdict-derived.json``.  The generated file is checked
in so the localisation pipeline is fully reproducible offline.

Usage::

    python3 scripts/fetch_cvdict.py                 # download + regenerate
    python3 scripts/fetch_cvdict.py --source FILE   # use a local CVDICT.u8
"""

from __future__ import annotations

import argparse
import json
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "localization" / "vi" / "cvdict-derived.json"
API_URL = "https://api.github.com/repos/ph0ngp/CVDICT/contents/CVDICT.u8"
LINE_RE = re.compile(r"^(\S+)\s+(\S+)\s+\[[^\]]*\]\s+/(.+)/\s*$")
CJK_RE = re.compile(r"[\u3400-\u9fff\uf900-\ufaff]")
BRACKET_RE = re.compile(r"\[[^\]]*\]|\([^)]*[\u3400-\u9fff][^)]*\)")
MAX_GLOSS = 70


def download() -> str:
    request = urllib.request.Request(
        API_URL,
        headers={
            "Accept": "application/vnd.github.raw+json",
            "User-Agent": "yysd-localisation/1.0",
        },
    )
    with urllib.request.urlopen(request, timeout=120) as response:
        return response.read().decode("utf-8")


def clean_gloss(raw: str) -> str:
    gloss = raw.split("/")[0].strip()
    gloss = BRACKET_RE.sub("", gloss)
    gloss = CJK_RE.sub("", gloss)
    # CC-CEDICT often packs several senses into one entry; the first one is the
    # most frequent. Trailing parenthetical examples are unreliable.
    gloss = re.split(r"[;|,]", gloss)[0]
    if ")" in gloss and "(" not in gloss.split(")")[0]:
        gloss = gloss.split(")", 1)[1]
    gloss = gloss.replace("(", "").replace(")", "")
    gloss = gloss.replace('"', "").replace("\\", "").replace("<", "").replace(">", "")
    gloss = re.sub(r"\s+", " ", gloss).strip(" ;,.:[]")
    return gloss


def is_vietnamese(gloss: str) -> bool:
    """Reject English-only glosses; we are localising *into Vietnamese*."""
    if not gloss or len(gloss) > MAX_GLOSS or CJK_RE.search(gloss):
        return False
    letters = [char for char in gloss if char.isalpha()]
    if not letters:
        return False
    accented = sum(1 for char in letters if char.lower() in "ăâđêôơưàảãáạằẳẵắặầẩẫấậèẻẽéẹềểễếệìỉĩíịòỏõóọồổỗốộờởỡớợùủũúụừửữứựỳỷỹýỵ")
    return accented > 0 or any(word in gloss.lower() for word in (" ", "của", "là", "và", "người", "không"))


def parse(source: str) -> dict[str, str]:
    result: dict[str, str] = {}
    for line in source.splitlines():
        if not line or line.startswith("#"):
            continue
        match = LINE_RE.match(line)
        if match is None:
            continue
        simplified = match.group(2)
        if not CJK_RE.search(simplified) or len(simplified) > 12:
            continue
        gloss = clean_gloss(match.group(3))
        if not is_vietnamese(gloss):
            continue
        # First occurrence wins: CVDICT lists the most common sense first.
        result.setdefault(simplified, gloss)
    return result


def write(mapping: dict[str, str]) -> None:
    payload = {
        "meta": {
            "source": "CVDICT by Phong Phan — https://github.com/ph0ngp/CVDICT",
            "upstream": "CC-CEDICT",
            "license": "CC BY-SA 4.0",
            "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
            "note": "derived simplified-headword -> first Vietnamese gloss map",
        },
        "phrases": {key: value for key, value in mapping.items() if len(key) > 1},
        "singles": {key: value for key, value in mapping.items() if len(key) == 1},
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, help="local CVDICT.u8 instead of downloading")
    args = parser.parse_args(argv)
    source = args.source.read_text(encoding="utf-8") if args.source else download()
    mapping = parse(source)
    write(mapping)
    print(f"CVDICT: {len(mapping):,} phrases -> {OUT.relative_to(ROOT)} ({OUT.stat().st_size:,} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
