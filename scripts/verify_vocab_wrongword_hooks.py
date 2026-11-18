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


def check_file(path: Path, kind: str) -> list[str]:
    text = path.read_text(encoding="utf-8", errors="ignore")
    # server/vocab-shelf.js intentionally does not serve authoring templates as LISTs.
    if path.name.startswith("教师模版-"):
        import re
        script = re.sub(r"<!--.*?-->", "", text, flags=re.DOTALL)
        bank = re.search(r"const\s+wordData\s*=\s*\[(.*?)\]\s*;", script, re.DOTALL)
        required = (r'["\']?word["\']?\s*:', r'["\']?meaning["\']?\s*:')
        return [] if bank and all(re.search(key, bank[1]) for key in required) else ["wordData with word and meaning"]
    missing = [token for token in COMMON if token not in text]
    extra = STANDARD_EXTRA if kind == "standard" else SPECIAL_EXTRA
    missing.extend(token for token in extra if token not in text)
    return missing


def main() -> int:
    errors: list[str] = []
    for folder, kind in VOCAB_DIRS.items():
        base = LIB / folder
        if not base.is_dir():
            continue
        for html in sorted(base.rglob("*.html")):
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
    total = sum(1 for folder in VOCAB_DIRS for _ in (LIB / folder).rglob("*.html") if (LIB / folder).is_dir())
    print(f"OK — {total} vocab files checked (student result hooks or teacher word banks).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
