#!/usr/bin/env python3
"""Apply the Vietnamese localisation across the static site.

Usage::

    python3 scripts/build_vi_dictionary.py       # regenerate dictionary
    python3 scripts/localize_vi.py               # rewrite sources + QA report
    python3 scripts/localize_vi.py --check       # CI gate, never writes

Design notes:

* English text (the actual IELTS/TOEFL material) is never touched.
* Chinese, Japanese-style CJK and CJK punctuation are localised to Vietnamese.
* HTML documents get ``lang="vi"`` plus a deferred ``vi-boot.mjs`` module that
  translates content injected later by JavaScript or fetched from JSON banks.
* JSON *keys* are preserved so lookups in the question banks keep working.
* Python/shell sources only get their comments translated; their string
  literals may be functional data keys and must stay byte-identical.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any

from vi_lib import (
    CJK_RE,
    SCRIPT_BODY_RE,
    coverage_stats,
    has_cjk,
    load_dictionary,
    relative_boot_path,
    summarize,
    translate_hash_comments,
    translate_html,
    translate_json_text,
    translate_plain,
    translate_python,
)

ROOT = Path(__file__).resolve().parent.parent
DICTIONARY = ROOT / "localization" / "vi" / "zh-vi.json"
REPORT_JSON = ROOT / "localization" / "vi" / "coverage-report.json"
REPORT_MD = ROOT / "localization" / "vi" / "REPORT.md"

SKIP_DIRS = {
    ".git", "node_modules", "_site", "coverage", ".venv", "dist", "build",
    ".next", ".cache", "__pycache__", ".pytest_cache", "Unselected files",
}
# Build tooling / backend source is not shipped page content.  In particular
# the i18n engine itself contains Chinese literals (regexes, dictionary keys)
# that MUST stay byte-identical or translation would break.
SKIP_PREFIXES = (
    "scripts/", "server/", "admission/", "desktop/", "desktop-tiku/",
    "assets/js/i18n/", "localization/", "tests/", ".github/",
    ".qoder/", ".cursor/", ".claude/", "tools/", "coverage/",
)
SKIP_FILES = {
    "localization/vi/zh-vi.json",
    "localization/vi/coverage-report.json",
    "assets/js/i18n/vi-dictionary.mjs",
    "package-lock.json",
}
HTML_EXT = {".html", ".htm"}
JSON_EXT = {".json"}
PLAIN_EXT = {".js", ".mjs", ".cjs", ".ts", ".tsx", ".css", ".md", ".txt", ".conf", ".example", ".yml", ".yaml"}
COMMENT_EXT = {".py", ".sh", ".sql", ".service", ".prisma"}


def should_skip(path: Path) -> bool:
    rel = path.relative_to(ROOT).as_posix()
    if any(part in SKIP_DIRS for part in path.parts):
        return True
    if rel in SKIP_FILES:
        return True
    if rel.startswith(SKIP_PREFIXES):
        return True
    if path.stat().st_size > 6_000_000:
        return True
    return False


def transform(path: Path, source: str, dictionary: dict[str, Any]) -> str:
    ext = path.suffix.lower()
    if ext in HTML_EXT:
        boot = relative_boot_path(path, ROOT)
        result = translate_html(source, dictionary, boot)
        if has_cjk(result):
            # A few legacy pages keep Chinese inside regex literals or template
            # fragments.  A whole-document gloss pass removes the last CJK
            # characters; validate() rejects the file if any script breaks.
            candidate = translate_plain(result, dictionary)
            if not has_cjk(candidate):
                return candidate
        return result
    if ext in JSON_EXT:
        return translate_json_text(source, dictionary)
    if ext in PLAIN_EXT:
        return translate_plain(source, dictionary)
    if ext == ".py":
        return translate_python(source, dictionary)
    if ext in COMMENT_EXT:
        return translate_hash_comments(source, dictionary)
    return source


def validate(path: Path, text: str) -> None:
    if path.suffix.lower() == ".py":
        import ast
        ast.parse(text)
    elif path.suffix.lower() in HTML_EXT:
        for match in SCRIPT_BODY_RE.finditer(text):
            body = match.group(2).strip()
            if not body or "src=" in match.group(1):
                continue
            ok = False
            for suffix in (".js", ".mjs"):
                with tempfile.NamedTemporaryFile("w", suffix=suffix, encoding="utf-8", delete=False) as handle:
                    handle.write(body)
                    scratch = Path(handle.name)
                try:
                    result = subprocess.run(
                        ["node", "--check", str(scratch)], capture_output=True, text=True, check=False
                    )
                finally:
                    scratch.unlink(missing_ok=True)
                if result.returncode == 0:
                    ok = True
                    break
            if not ok:
                raise ValueError(f"inline JS invalid in {path}: {result.stderr[:160]}")
    elif path.suffix.lower() in JSON_EXT:
        json.loads(text)
    elif path.suffix.lower() in {".js", ".cjs"} and "assets/js/" in path.as_posix():
        # Classic scripts must stay syntactically valid after phrase replacement.
        with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8", delete=False) as handle:
            handle.write(text)
            scratch = Path(handle.name)
        try:
            result = subprocess.run(
                ["node", "--check", str(scratch)], capture_output=True, text=True, check=False
            )
        finally:
            scratch.unlink(missing_ok=True)
        if result.returncode != 0:
            raise ValueError(f"JS syntax check failed for {path}: {result.stderr[:200]}")


def collect_files() -> list[Path]:
    allowed = HTML_EXT | JSON_EXT | PLAIN_EXT | COMMENT_EXT
    return sorted(
        path for path in ROOT.rglob("*")
        if path.is_file() and path.suffix.lower() in allowed and not should_skip(path)
    )


def full_scan() -> dict[str, Any]:
    """Cumulative residual-CJK count across every shipped source file."""
    total = 0
    residual: list[tuple[int, str]] = []
    for path in collect_files():
        try:
            source = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        count = len(CJK_RE.findall(source))
        if count:
            total += count
            residual.append((count, path.relative_to(ROOT).as_posix()))
    residual.sort(reverse=True)
    return {
        "cjkCharacters": total,
        "filesWithCjk": len(residual),
        "topFiles": [{"file": name, "cjk": count} for count, name in residual[:40]],
    }


def build_report(stats: dict[str, dict[str, int]], dictionary: dict[str, Any]) -> dict[str, Any]:
    summary = summarize(stats)
    summary["dictionary"] = {
        "exact": len(dictionary["exact"]),
        "phrases": len(dictionary["phrases"]),
        "extended": len(dictionary.get("extended", {})),
    }
    summary["scope"] = "shipped static site (HTML/JS/CSS/JSON/Markdown); build tooling intentionally excluded"
    summary["fullRepoScan"] = full_scan()
    return summary


def render_markdown(report: dict[str, Any]) -> str:
    lines = [
        "# Báo cáo bản địa hóa tiếng Việt",
        "",
        "Báo cáo được tạo tự động bởi `scripts/localize_vi.py`.",
        "",
        "| Chỉ số | Giá trị |",
        "| --- | --- |",
        f"| Tệp được bản địa hóa | {report['filesChanged']:,} |",
        f"| Kí tự CJK trước | {report['cjkBefore']:,} |",
        f"| Kí tự CJK sau | {report['cjkAfter']:,} |",
        f"| Kí tự CJK đã chuyển | {report['cjkRemoved']:,} |",
        f"| Tỉ lệ bản địa hóa | {report['localizedPercent']}% |",
        f"| Mục từ điển chính xác | {report['dictionary']['exact']:,} |",
        f"| Cụm từ điển tuyển chọn | {report['dictionary']['phrases']:,} |",
        f"| Cụm từ điển mở rộng (CVDICT) | {report['dictionary'].get('extended', 0):,} |",
        f"| CJK còn lại trong toàn bộ nội dung phát hành | {report['fullRepoScan']['cjkCharacters']:,} |",
        "",
        "## Tệp còn kí tự CJK",
        "",
    ]
    residual = report["filesWithResidualCjk"]
    if residual:
        lines.append(f"Còn {len(residual):,} tệp (xem `coverage-report.json` để biết chi tiết).")
        lines.extend(f"- `{name}`" for name in residual[:25])
        lines.append("")
        lines.append(
            "Các chuỗi văn bản dài trong ngân hàng đề cũ cần thêm một lượt dịch "
            "chuyên nghiệp (CAT/MT). `scripts/localize_vi.py` có thể chạy lại ngay "
            "sau khi bổ sung mục từ điển hoặc cấu hình nhà cung cấp dịch máy."
        )
    else:
        lines.append("Không còn kí tự CJK trong phạm vi quét.")
    lines.extend([
        "",
        "## Phạm vi",
        "",
        "- Nội dung tiếng Anh (đề IELTS/TOEFL, transcript, đáp án) được giữ nguyên.",
        "- Khóa JSON được giữ nguyên để không làm hỏng tra cứu dữ liệu.",
        "- Tệp nhị phân (PDF/MP3/PNG) không nằm trong phạm vi dịch văn bản; "
        "xem `library/research/` để biết tài liệu PDF mới có trích dẫn học thuật.",
        "- `vi-boot.mjs` dịch tiếp nội dung được chèn động lúc chạy trang.",
        "",
    ])
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="report only, never write")
    parser.add_argument(
        "--max-residual", type=int, default=-1,
        help="fail when shipped content still contains more than N CJK characters (-1 disables)",
    )
    args = parser.parse_args(argv)

    if not DICTIONARY.exists():
        subprocess.run([sys.executable, str(ROOT / "scripts" / "build_vi_dictionary.py")], check=True)
    dictionary = load_dictionary(DICTIONARY)

    stats: dict[str, dict[str, int]] = {}
    changed: list[Path] = []
    for path in collect_files():
        try:
            source = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        if not has_cjk(source):
            continue
        output = transform(path, source, dictionary)
        if output == source:
            continue
        try:
            validate(path, output)
        except (ValueError, json.JSONDecodeError, SyntaxError) as error:
            print(f"SKIP (invalid output) {path.relative_to(ROOT)}: {error}", file=sys.stderr)
            continue
        stats[path.relative_to(ROOT).as_posix()] = coverage_stats(source, output)
        changed.append(path)
        if not args.check:
            path.write_text(output, encoding="utf-8")

    report = build_report(stats, dictionary)
    report["perFile"] = stats
    if not args.check:
        REPORT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        REPORT_MD.write_text(render_markdown(report), encoding="utf-8")

    print(
        f"{'[check] ' if args.check else ''}localised {report['filesChanged']:,} files, "
        f"removed {report['cjkRemoved']:,}/{report['cjkBefore']:,} CJK characters "
        f"({report['localizedPercent']}%), residual {report['cjkAfter']:,}"
    )
    if args.max_residual >= 0 and report["fullRepoScan"]["cjkCharacters"] > args.max_residual:
        print(
            f"FAIL: {report['fullRepoScan']['cjkCharacters']} residual CJK characters "
            f"in shipped content (limit {args.max_residual})",
            file=sys.stderr,
        )
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
