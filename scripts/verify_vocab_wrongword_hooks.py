#!/usr/bin/env python3
"""Fail CI if a study vocab LIST is missing DOM hooks for the wrong-word bridge.

New LIST HTML only needs to follow the existing template conventions — exam.js
injects vocab-bridge.js by manifest subject (folder path), no per-file wiring.
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LIB = ROOT / "library"

# folder (under library/) -> layout kind
VOCAB_DIRS = {
    "study/vocab": "standard",
    "study/vocab-cet4": "standard",
    "study/vocab-special-listening": "special",
    "study/vocab-special-reading": "special",
    "study/vocab-special-writing": "special",
}

COMMON = (
    'id="testResults"',
    "row-wrong",
    'data-mode="test"',
)
STANDARD_EXTRA = ('id="resultsTableBody"',)
SPECIAL_EXTRA = ('id="stageResults"',)

# These two teacher examples are a standalone quiz and a learn-only view, not
# the graded LIST format consumed by vocab-bridge. Check all other HTML files.
NON_LIST_TEMPLATES = frozenset({
    "study/vocab/教师模版-单词检测.html",
    "study/vocab/教师模版-词库学习List.html",
})


def is_graded_list(path: Path) -> bool:
    return path.relative_to(LIB).as_posix() not in NON_LIST_TEMPLATES


def check_file(path: Path, kind: str) -> list[str]:
    text = path.read_text(encoding="utf-8", errors="ignore")
    missing = [token for token in COMMON if token not in text]
    extra = STANDARD_EXTRA if kind == "standard" else SPECIAL_EXTRA
    missing.extend(token for token in extra if token not in text)
    return missing


def main() -> int:
    errors: list[str] = []
    total = 0
    for folder, kind in VOCAB_DIRS.items():
        base = LIB / folder
        if not base.is_dir():
            continue
        for html in sorted(base.rglob("*.html")):
            if not is_graded_list(html):
                continue
            total += 1
            missing = check_file(html, kind)
            if missing:
                rel = html.relative_to(ROOT)
                errors.append(f"{rel}: missing {', '.join(missing)}")
    if errors:
        print("Vocab wrong-word hook verification failed:", file=sys.stderr)
        for line in errors:
            print(f"  - {line}", file=sys.stderr)
        print(
            "\nFix: copy an existing LIST from the same folder; keep #testResults, "
            "wrong rows (row-wrong), and resultsTableBody (standard) or stageResults (special).",
            file=sys.stderr,
        )
        return 1
    print(f"OK — {total} vocab LIST file(s) have wrong-word bridge hooks.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
