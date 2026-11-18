#!/usr/bin/env python3
"""Bản sao nội bộ của Super-Linter, chạy được không cần Docker.

Kiểm tra vệ sinh kho lưu trữ trên mọi lần đẩy (CI chính thức dùng
super-linter/super-linter). Chạy: python3 tools/i18n/super_lint.py --all
"""
from __future__ import annotations

import argparse
import ast
import json
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TEXT_EXT = {".html", ".htm", ".js", ".mjs", ".cjs", ".css", ".json", ".md",
            ".py", ".ts", ".tsx", ".yml", ".yaml", ".txt", ".mjs", ".svg", ".xml", ".webmanifest"}
SKIP_DIRS = {".git", "node_modules", "dist", "coverage", ".venv", "__pycache__",
             ".lighthouseci", ".next", ".cache"}
STRICT_PREFIXES = ("ielts/", "tools/i18n/", ".github/", ".claude/", ".cursor/", ".qoder/")
STRICT_FILES = {"package.json", "lighthouserc.json", "ROADMAP.md", "README.md",
                "AGENTS.md", "MEMORIES.md", "YYSD-DESIGN-RULES.md",
                ".eslintrc.json", ".htmlhintrc", ".stylelintrc.json",
                ".markdown-lint.yml", ".yamllint.yml", ".flake8"}
CJK = re.compile(r"[\u3400-\u9fff]")
SECRET = re.compile(r"(?i)(api[_-]?key|secret|token|password)\s*[:=]\s*['\"][A-Za-z0-9_\-]{16,}['\"]")
TRAILING = re.compile(r"[ \t]+$", re.M)


def rel(p: Path) -> str:
    return p.relative_to(ROOT).as_posix()


def candidates() -> list[Path]:
    out = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for name in filenames:
            p = Path(dirpath) / name
            if p.suffix.lower() in TEXT_EXT and p.stat().st_size < 20_000_000:
                out.append(p)
    return sorted(set(out))


def is_strict(r: str) -> bool:
    return r.startswith(STRICT_PREFIXES) or r in STRICT_FILES


def changed_files() -> set[str]:
    try:
        out = subprocess.check_output(["git", "status", "--porcelain"], cwd=ROOT, text=True)
    except subprocess.CalledProcessError:
        return set()
    names = set()
    for line in out.splitlines():
        names.add(line[3:].strip().strip('"'))
    return names


def check_file(p: Path, errors: list[str], stats: dict) -> None:
    r = rel(p)
    strict = is_strict(r)
    stats["files"] += 1
    try:
        text = p.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        text = p.read_text(encoding="utf-8", errors="replace")
    except OSError as exc:
        errors.append(f"{r}: không đọc được tệp ({exc})")
        return
    if CJK.search(text) and r not in {"tools/i18n/zhvi.json", "tools/i18n/glossary_vi.json"}:
        stats["cjk_files"] += 1
    if strict:
        if TRAILING.search(text) and p.suffix not in {".md", ".mdc"}:
            errors.append(f"{r}: có khoảng trắng cuối dòng")
        if text and not text.endswith("\n"):
            errors.append(f"{r}: thiếu newline cuối tệp")
        if "\t" in text and p.suffix in {".py", ".mjs", ".js", ".css", ".yml", ".yaml"}:
            errors.append(f"{r}: dùng tab thay vì dấu cách")
        if SECRET.search(text):
            errors.append(f"{r}: có vẻ chứa khoá bí mật")
        if "console" + ".log(" in text:
            errors.append(f"{r}: còn lệnh ghi log gỡ lỗi")
    if p.suffix == ".json":
        try:
            json.loads(text)
        except json.JSONDecodeError as exc:
            errors.append(f"{r}: JSON không hợp lệ — {exc}")
    elif p.suffix == ".py":
        try:
            ast.parse(text, filename=r)
        except SyntaxError as exc:
            errors.append(f"{r}: Python không hợp lệ — {exc}")
    elif p.suffix == ".html" or p.suffix == ".htm":
        m = re.search(r"<html[^>]*\blang\s*=\s*[\"']([^\"']+)", text)
        if m and m.group(1) != "vi":
            stats["wrong_lang"] += 1
    stats["bytes"] += len(text)


def check_new_links(errors: list[str]) -> None:
    index = ROOT / "ielts" / "index.html"
    if not index.exists():
        return
    html = index.read_text(encoding="utf-8")
    for target in re.findall(r'(?:href|src)\s*=\s*["\']([^"\'#?]+)', html):
        if target.startswith(("http:", "https:", "data:", "mailto:")):
            if target.startswith("http:"):
                errors.append(f"ielts/index.html: liên kết không bảo mật {target}")
            continue
        resolved = (ROOT / "ielts" / target).resolve()
        if not resolved.exists():
            errors.append(f"ielts/index.html: thiếu tài nguyên {target}")


def main() -> int:
    ap = argparse.ArgumentParser(description="Super-Linter nội bộ (không cần Docker)")
    ap.add_argument("--all", action="store_true", help="quét toàn bộ kho")
    ap.add_argument("--changed", action="store_true", help="chỉ quét tệp đã thay đổi")
    args = ap.parse_args()
    errors: list[str] = []
    stats = {"files": 0, "bytes": 0, "cjk_files": 0, "wrong_lang": 0}
    files = candidates()
    if args.changed:
        changed = changed_files()
        files = [p for p in files if rel(p) in changed]
    for p in files:
        check_file(p, errors, stats)
    check_new_links(errors)
    print(f"[super-lint] {stats['files']} tệp · {stats['bytes']/1e6:.1f} MB · "
          f"{stats['cjk_files']} tệp còn ký tự Hán · {stats['wrong_lang']} HTML chưa lang=vi")
    for e in errors[:60]:
        print("  ✗", e)
    if len(errors) > 60:
        print(f"  … và {len(errors)-60} lỗi khác")
    print("[super-lint] ĐẠT" if not errors else f"[super-lint] {len(errors)} lỗi")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
