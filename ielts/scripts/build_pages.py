#!/usr/bin/env python3
"""Đóng gói ứng dụng IELTS tiếng Việt thành artefact GitHub Pages (dist/).

Chỉ sao chép nội dung phục vụ Pages (không kéo theo 3,7 GB audio/PDF kho đề cũ),
kiểm tra liên kết nội bộ và sinh sơ đồ trang web.
"""
from __future__ import annotations
import os
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "ielts"
DIST = ROOT / "dist"
EXCLUDE_DIRS = {"tests", "scripts", "node_modules", "coverage", "__pycache__"}
EXCLUDE_FILES = {"package.json", "package-lock.json", "README.md"}
BASE = os.environ.get("PAGES_BASE_URL", "https://johnlikescarrot.github.io/yysd-testcenter/").rstrip("/") + "/"


def main() -> None:
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True)
    for dirpath, dirnames, filenames in os.walk(SRC):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]
        rel = Path(dirpath).relative_to(SRC)
        out = DIST / rel
        out.mkdir(parents=True, exist_ok=True)
        for name in filenames:
            if name in EXCLUDE_FILES:
                continue
            src = Path(dirpath) / name
            shutil.copy2(src, out / name)
    # GitHub Pages cần .nojekyll để phục vụ mọi tệp, CNAME cho tên miền riêng
    (DIST / ".nojekyll").touch()
    cname = (ROOT / "CNAME").read_text(encoding="utf-8").strip()
    (DIST / "CNAME").write_text(cname + "\n", encoding="utf-8")
    pages = sorted(p.relative_to(DIST).as_posix() for p in DIST.rglob("*.html"))
    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for page in pages:
        lines.append(f"  <url><loc>{BASE}{page}</loc><changefreq>weekly</changefreq></url>")
    lines.append("</urlset>")
    (DIST / "sitemap.xml").write_text("\n".join(lines) + "\n", encoding="utf-8")
    (DIST / "robots.txt").write_text(
        f"User-agent: *\nAllow: /\nSitemap: {BASE}sitemap.xml\n", encoding="utf-8")
    # Kiểm chứng mọi liên kết nội bộ trong HTML
    broken = []
    for page in pages:
        html = (DIST / page).read_text(encoding="utf-8")
        for target in re.findall(r'(?:href|src)\s*=\s*["\']([^"\'#?]+)', html):
            if target.startswith(("http:", "https:", "data:", "mailto:")) or not target:
                continue
            if not (DIST / page).parent.joinpath(target).resolve().exists():
                broken.append((page, target))
    total = sum(p.stat().st_size for p in DIST.rglob("*") if p.is_file())
    print(f"[pages] dist/: {len(list(DIST.rglob('*')))} mục · {total/1e6:.2f} MB · {len(pages)} trang HTML")
    if broken:
        for page, target in broken[:20]:
            print(f"  ✗ {page} → {target}")
        raise SystemExit(f"[pages] {len(broken)} liên kết nội bộ hỏng")
    print("[pages] ĐẠT — artefact sẵn sàng cho actions/deploy-pages")


if __name__ == "__main__":
    main()
