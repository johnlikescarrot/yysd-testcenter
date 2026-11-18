#!/usr/bin/env python3
"""Build the single-source-of-truth Chinese -> Vietnamese dictionary.

Inputs:

* ``localization/vi/curated.txt``  -- hand-written, domain-specific translations
  (``源文 = Tiếng Việt`` lines, ``[exact]`` / ``[phrases]`` sections).
* ``localization/vi/cvdict-derived.json`` -- 100k+ entries derived from CVDICT
  (see ``scripts/fetch_cvdict.py`` and ``localization/vi/LICENSE-CVDICT.md``).

Outputs:

* ``localization/vi/zh-vi.json`` -- full dictionary for the Python build step.
* ``assets/js/i18n/vi-dictionary.mjs`` -- **curated only** for the browser
  runtime, so no page ever downloads a multi-megabyte dictionary.

``[exact]`` entries only match whole strings (safe for one-character labels);
``[phrases]`` entries are longest-first substring matches.
"""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CURATED = ROOT / "localization" / "vi" / "curated.txt"
CVDICT = ROOT / "localization" / "vi" / "cvdict-derived.json"
JSON_OUT = ROOT / "localization" / "vi" / "zh-vi.json"
MJS_OUT = ROOT / "assets" / "js" / "i18n" / "vi-dictionary.mjs"


def parse(source: str) -> dict:
    exact: dict[str, str] = {}
    phrases: dict[str, str] = {}
    terms: dict[str, str] = {}
    buckets = {"exact": exact, "phrases": phrases, "terms": terms}
    conflicts: list[str] = []
    current = "exact"
    for raw in source.splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("[") and line.endswith("]"):
            current = line[1:-1]
            if current not in buckets:
                raise ValueError(f"Unknown dictionary section: {current}")
            continue
        if "=" not in line:
            raise ValueError(f"Malformed dictionary line: {line}")
        key, value = (part.strip() for part in line.split("=", 1))
        if not key or not value:
            raise ValueError(f"Empty dictionary entry: {line}")
        if key in buckets[current]:
            conflicts.append(f"{current}:{key}")
            continue
        buckets[current][key] = value
    # One-character entries are only safe as whole-string matches.
    phrase_map = {k: v for k, v in terms.items() if len(k) > 1}
    phrase_map.update({k: v for k, v in phrases.items() if len(k) > 1})
    return {
        "meta": {
            "sourceLanguage": "zh-Hans",
            "targetLanguage": "vi",
            "generatedBy": "scripts/build_vi_dictionary.py",
            "note": "exact = whole-string matches; phrases = longest-first substring matches",
            "duplicateEntriesKeptFirst": sorted(set(conflicts)),
        },
        "exact": exact,
        "phrases": phrase_map,
        "phraseOrder": sorted(phrase_map, key=len, reverse=True),
    }


def build() -> dict:
    curated = parse(CURATED.read_text(encoding="utf-8"))
    extended = dict(curated["phrases"])
    singles: dict[str, str] = {}
    if CVDICT.exists():
        upstream = json.loads(CVDICT.read_text(encoding="utf-8"))
        for key, value in upstream["phrases"].items():
            extended.setdefault(key, value)
        singles = upstream.get("singles", {})
    full = dict(curated)
    full["extended"] = extended
    full["singles"] = singles
    full["meta"] = dict(curated["meta"])
    full["meta"]["extendedPhrases"] = len(extended)
    full["meta"]["extendedSource"] = "CVDICT (CC BY-SA 4.0)" if singles else "curated only"

    JSON_OUT.parent.mkdir(parents=True, exist_ok=True)
    MJS_OUT.parent.mkdir(parents=True, exist_ok=True)
    JSON_OUT.write_text(
        json.dumps(full, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8"
    )
    MJS_OUT.write_text(
        "// GENERATED FILE — edit localization/vi/curated.txt instead.\n"
        "// Curated Vietnamese dictionary for the browser runtime.\n"
        "export const VI_DICTIONARY = "
        + json.dumps(curated, ensure_ascii=False, indent=2)
        + ";\n\nexport default VI_DICTIONARY;\n",
        encoding="utf-8",
    )
    return full


if __name__ == "__main__":
    data = build()
    print(
        f"zh-vi: {len(data['exact'])} exact, {len(data['phrases'])} curated phrases, "
        f"{len(data['extended'])} build phrases -> {JSON_OUT.relative_to(ROOT)} "
        f"+ {MJS_OUT.relative_to(ROOT)}"
    )
