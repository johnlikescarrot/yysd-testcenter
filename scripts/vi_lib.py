#!/usr/bin/env python3
"""Pure helpers for the Vietnamese localisation pipeline.

No file I/O happens here except :func:`load_dictionary`.  Keeping this library
side-effect free lets us hold it -- and its browser counterpart
``assets/js/i18n/vi-core.mjs`` -- at 100% test coverage.  ``localize_vi.py`` is
only a thin CLI wrapper.
"""

from __future__ import annotations

import json
import re
from html import unescape
from pathlib import Path
from typing import Any

CJK_RE = re.compile(r"[\u3400-\u9fff\uf900-\ufaff]")
HTML_LANG_RE = re.compile(r"(<html\b[^>]*?\blang\s*=\s*)([\"'])([^\"']*)\2", re.I)
ATTR_RE = re.compile(
    r"\b(title|alt|aria-label|aria-description|placeholder|content|label|value|summary|data-title|data-label)\s*=\s*([\"'])(.*?)\2",
    re.I | re.S,
)
TEXT_NODE_RE = re.compile(r">([^<>]*)<", re.S)
SEGMENT_SPLIT_RE = re.compile(
    r"(<script\b[^>]*>.*?</script>|<style\b[^>]*>.*?</style>|<pre\b[^>]*>.*?</pre>|<code\b[^>]*>.*?</code>|<!--.*?-->)",
    re.I | re.S,
)
JSON_STRING_RE = re.compile(r'("(?:[^"\\]|\\.)*")(\s*:)?', re.S)
SCRIPT_BODY_RE = re.compile(r"(<script\b[^>]*>)(.*?)(</script>)", re.I | re.S)
JS_STRING_RE = re.compile(r'("(?:[^"\\]|\\.)*"|\'(?:[^\'\\]|\\.)*\'|`(?:[^`\\]|\\.)*`)', re.S)
JS_COMMENT_RE = re.compile(r"(//[^\n]*|/\*.*?\*/)", re.S)
PY_STRING_RE = re.compile(r'("(?:[^"\\]|\\.)*"|\'(?:[^\'\\]|\\.)*\')', re.S)
HASH_COMMENT_RE = re.compile(r"(?m)^([ \t]*#)(.*)$")
RESIDUAL_RE = re.compile(r"[\u3400-\u9fff\uf900-\ufaff]+")
SPACED_RE = re.compile(r"[ \t]{2,}")
PUNCT_SPACE_RE = re.compile(r"[ \t]+([,.;:!?\]\)])")
OPEN_SPACE_RE = re.compile(r"([\[\(])[ \t]+")

PUNCTUATION = {
    "，": ", ",
    "、": ", ",
    "：": ": ",
    "；": "; ",
    "（": "(",
    "）": ")",
    "《": "«",
    "》": "»",
    "「": "«",
    "」": "»",
    "“": "«",
    "”": "»",
    "？": "?",
    "！": "!",
    "。": ".",
    "％": "%",
    "－": "-",
    "　": " ",
}
STOP_SINGLES = frozenset("的地得了着过们之乎者也与其而所")
END = "\0"

TEMPLATE_SPECS: list[tuple[str, str]] = [
    (r"答案：\s*(TRUE|FALSE|YES|NO|NOT GIVEN|[A-D])\s*。", r"Đáp án: \1."),
    (r"答案：\s*([A-D])\s*。", r"Đáp án: \1."),
    (r"正确答案：", "Đáp án đúng: "),
    (r"解析：", "Giải thích: "),
    (r"定位：", "Vị trí: "),
    (r"你的：", "Của bạn: "),
    (r"官方答案：", "Đáp án chính thức: "),
    (r"第\s*(\d+)\s*题", r"Câu \1"),
    (r"共\s*(\d+)\s*题", r"Tổng \1 câu"),
    (r"(\d+)\s*题", r"\1 câu"),
    (r"(\d+)\s*分钟", r"\1 phút"),
    (r"(\d+)\s*秒", r"\1 giây"),
    (r"(\d+)\s*分", r"\1 điểm"),
    (r"剑\s*(\d+)", r"Cambridge \1"),
    (r"（未作答）", "(Chưa trả lời)"),
    (r"使用/运用该词", "dùng / vận dụng từ này"),
    (r"运用该词", "vận dụng từ này"),
    (r"使用该词", "dùng từ này"),
    (r"释义\.", "Nghĩa."),
]
TEMPLATES = [(re.compile(pattern), replacement) for pattern, replacement in TEMPLATE_SPECS]


def load_dictionary(path: str | Path) -> dict[str, Any]:
    """Read the generated dictionary JSON from disk."""
    return json.loads(Path(path).read_text(encoding="utf-8"))


def has_cjk(text: Any) -> bool:
    """Whether *text* contains at least one CJK ideograph."""
    if not isinstance(text, str):
        return False
    return bool(CJK_RE.search(text))


def cjk_runs(text: str) -> list[str]:
    """Return maximal CJK runs, for QA reporting."""
    return RESIDUAL_RE.findall(text)


def normalize_punctuation(text: str) -> str:
    """Replace CJK punctuation with typography that reads naturally in Vietnamese."""
    for source, target in PUNCTUATION.items():
        text = text.replace(source, target)
    return text


def tidy(text: str) -> str:
    """Normalise spacing produced by adjacent dictionary glosses."""
    text = SPACED_RE.sub(" ", text)
    text = PUNCT_SPACE_RE.sub(r"\1", text)
    text = OPEN_SPACE_RE.sub(r"\1", text)
    return text.strip()


def apply_templates(text: str, templates: list[tuple[Any, str]] | None = None) -> str:
    """Apply numeric / answer-key regular expressions to *text*."""
    for pattern, replacement in templates if templates is not None else TEMPLATES:
        text = pattern.sub(replacement, text)
    return text


def build_trie(phrases: dict[str, str]) -> dict[str, Any]:
    """Compile a prefix tree so 100k phrases match in one linear pass."""
    root: dict[str, Any] = {}
    for key, value in phrases.items():
        node = root
        for character in key:
            node = node.setdefault(character, {})
        node[END] = value
    return root


def get_trie(dictionary: dict[str, Any]) -> dict[str, Any]:
    """Cache the trie on the dictionary object (one build per process)."""
    trie = dictionary.get("_trie")
    if trie is None:
        trie = build_trie(dictionary.get("extended", dictionary["phrases"]))
        dictionary["_trie"] = trie
    return trie


def replace_with_trie(text: str, trie: dict[str, Any], spaced: bool = False) -> str:
    """Longest-match replacement; unmatched characters pass through unchanged."""
    result: list[str] = []
    index = 0
    length = len(text)
    while index < length:
        node = trie.get(text[index])
        if node is None:
            result.append(text[index])
            index += 1
            continue
        cursor = index + 1
        best_value = node.get(END)
        best_end = index + 1 if best_value is not None else index
        while cursor < length:
            node = node.get(text[cursor])
            if node is None:
                break
            cursor += 1
            if END in node:
                best_end = cursor
                best_value = node[END]
        if best_value is None:
            result.append(text[index])
            index += 1
        else:
            result.append((" " + best_value + " ") if spaced else best_value)
            index = best_end
    return "".join(result)


def apply_phrases(text: str, dictionary: dict[str, Any], spaced: bool = False) -> str:
    """Replace known Chinese phrases longest-first so compounds win."""
    return replace_with_trie(text, get_trie(dictionary), spaced)


def apply_singles(text: str, dictionary: dict[str, Any]) -> str:
    """Gloss residual CJK characters with CVDICT's single-character senses."""
    singles = dictionary.get("singles", {})
    if not singles:
        return text

    def replace(match: re.Match[str]) -> str:
        parts = [
            singles.get(character, "")
            for character in match.group(0)
            if character not in STOP_SINGLES
        ]
        return " ".join(part for part in parts if part).strip()

    return RESIDUAL_RE.sub(replace, text)


def translate(text: Any, dictionary: dict[str, Any]) -> str:
    """Translate one string; English-only strings are returned untouched."""
    if not isinstance(text, str):
        return ""
    if text in dictionary["exact"]:
        return dictionary["exact"][text]
    if not has_cjk(text):
        return text
    result = apply_templates(text)
    result = apply_phrases(result, dictionary, spaced=True)
    result = tidy(normalize_punctuation(result))
    if has_cjk(result):
        return tidy(apply_singles(result, dictionary))
    return result


def translate_json_text(source: str, dictionary: dict[str, Any]) -> str:
    """Translate JSON string *values* only; object keys stay stable for lookups."""

    def replace(match: re.Match[str]) -> str:
        literal, colon = match.group(1), match.group(2)
        if colon is not None:
            return match.group(0)
        body = literal[1:-1]
        if not has_cjk(body):
            return match.group(0)
        return '"' + translate(body, dictionary) + '"'

    return JSON_STRING_RE.sub(replace, source)


def translate_plain(source: str, dictionary: dict[str, Any]) -> str:
    """Translate comments and string literals in JS / CSS / Markdown sources."""
    if not has_cjk(source):
        return source
    result = normalize_punctuation(apply_phrases(apply_templates(source), dictionary))
    if has_cjk(result):
        return apply_singles(result, dictionary)
    return result


def translate_js(source: str, dictionary: dict[str, Any]) -> str:
    """Localise JS string values, object keys and comments in an inline script."""

    def replace_string(match: re.Match[str]) -> str:
        literal = match.group(0)
        body = literal[1:-1]
        if not has_cjk(body):
            return literal
        return literal[0] + translate(body, dictionary) + literal[-1]

    def replace_comment(match: re.Match[str]) -> str:
        return translate(match.group(0), dictionary)

    return JS_COMMENT_RE.sub(replace_comment, JS_STRING_RE.sub(replace_string, source))


def translate_script_fragment(fragment: str, dictionary: dict[str, Any]) -> str:
    """Translate the body of inline ``<script>`` blocks in HTML documents."""
    return SCRIPT_BODY_RE.sub(
        lambda m: m.group(1) + translate_js(m.group(2), dictionary) + m.group(3),
        fragment,
    )


def translate_python_strings(source: str, dictionary: dict[str, Any]) -> str:
    """Translate Python string values in content-generator data tables."""

    def replace(match: re.Match[str]) -> str:
        literal = match.group(0)
        body = literal[1:-1]
        if not has_cjk(body):
            return literal
        return literal[0] + translate(body, dictionary) + literal[-1]

    return PY_STRING_RE.sub(replace, source)


def translate_hash_comments(source: str, dictionary: dict[str, Any]) -> str:
    """Localise ``#`` comments without touching code."""

    def replace(match: re.Match[str]) -> str:
        return match.group(1) + translate(match.group(2), dictionary)

    return HASH_COMMENT_RE.sub(replace, source)


def translate_python(source: str, dictionary: dict[str, Any]) -> str:
    """Localise comments and data strings in generator scripts."""
    return translate_hash_comments(translate_python_strings(source, dictionary), dictionary)


def set_html_lang(source: str) -> str:
    """Force ``<html lang="vi">`` while preserving the rest of the tag."""
    if HTML_LANG_RE.search(source):
        return HTML_LANG_RE.sub(lambda m: m.group(1) + m.group(2) + "vi" + m.group(2), source, count=1)
    return re.sub(r"(<html\b)", r'\1 lang="vi"', source, count=1, flags=re.I)


def _translate_attributes(fragment: str, dictionary: dict[str, Any]) -> str:
    def replace(match: re.Match[str]) -> str:
        name, quote, value = match.group(1), match.group(2), match.group(3)
        if not has_cjk(value):
            return match.group(0)
        return f"{name}={quote}{translate(value, dictionary)}{quote}"

    return ATTR_RE.sub(replace, fragment)


def _translate_text_nodes(fragment: str, dictionary: dict[str, Any]) -> str:
    def replace(match: re.Match[str]) -> str:
        body = match.group(1)
        if not has_cjk(body):
            return match.group(0)
        return ">" + translate(body, dictionary) + "<"

    return TEXT_NODE_RE.sub(replace, fragment)


def _translate_fragment(fragment: str, dictionary: dict[str, Any]) -> str:
    if fragment.startswith("<script"):
        return translate_script_fragment(fragment, dictionary)
    if fragment.startswith("<style") or fragment.startswith("<pre") or fragment.startswith("<code"):
        return translate_plain(fragment, dictionary)
    if fragment.startswith("<!--"):
        return "<!--" + translate_plain(fragment[4:-3], dictionary) + "-->"
    return _translate_text_nodes(_translate_attributes(fragment, dictionary), dictionary)


def translate_html(source: str, dictionary: dict[str, Any], boot_path: str | None = None) -> str:
    """Translate visible/accessible text and wire the runtime localiser."""
    parts = SEGMENT_SPLIT_RE.split(source)
    result = "".join(_translate_fragment(part, dictionary) for part in parts)
    result = set_html_lang(result)
    if boot_path is not None and "vi-boot.mjs" not in result:
        tag = '<script type="module" src="' + boot_path + '"></script>\n'
        if "</head>" in result.lower():
            head_index = result.lower().index("</head>")
            result = result[:head_index] + tag + result[head_index:]
        else:
            result = tag + result
    return result


def relative_boot_path(file_path: str | Path, root: str | Path) -> str:
    """Compute a relative URL from an HTML file to ``assets/js/i18n/vi-boot.mjs``."""
    directory = Path(file_path).resolve().parent
    root = Path(root).resolve()
    depth = len(directory.relative_to(root).parts)
    return "../" * depth + "assets/js/i18n/vi-boot.mjs"


def coverage_stats(before: str, after: str) -> dict[str, int]:
    """CJK character counts, used by the QA report and the CI gate."""
    cjk_before = len(CJK_RE.findall(before))
    cjk_after = len(CJK_RE.findall(after))
    return {
        "cjkBefore": cjk_before,
        "cjkAfter": cjk_after,
        "cjkRemoved": cjk_before - cjk_after,
    }


def summarize(stats: dict[str, dict[str, int]]) -> dict[str, Any]:
    """Aggregate per-file :func:`coverage_stats` results."""
    before = sum(item["cjkBefore"] for item in stats.values())
    after = sum(item["cjkAfter"] for item in stats.values())
    return {
        "filesChanged": sum(1 for item in stats.values() if item["cjkRemoved"] > 0),
        "cjkBefore": before,
        "cjkAfter": after,
        "cjkRemoved": before - after,
        "localizedPercent": round(100 * (before - after) / before, 2) if before else 100.0,
        "filesWithResidualCjk": sorted(
            name for name, item in stats.items() if item["cjkAfter"] > 0
        ),
    }


def plain_unescape(text: str) -> str:
    """Decode HTML entities; exposed for QA tooling and tests."""
    return unescape(text)
