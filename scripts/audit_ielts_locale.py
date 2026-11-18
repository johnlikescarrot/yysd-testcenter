#!/usr/bin/env python3
"""Report the migration scope without treating a script scan as a translation review."""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HAN = re.compile(r"[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]")


def main():
    failures = []
    manifest = json.loads((ROOT / "library/manifest.json").read_text(encoding="utf-8"))
    bad_labels = [item["id"] for item in manifest["items"] if HAN.search(item["title"] + item["description"])]
    failures.extend(bad_labels)
    print("# Kiểm kê Việt hóa IELTS\n")
    print(f"- Danh mục: {len(manifest['items']) - len(bad_labels)}/{len(manifest['items'])} mục không còn chữ Hán trong tiêu đề và mô tả.")
    print("- Phạm vi bảng: HTML tự làm bài. Không bao gồm tệp bản dịch âm thanh JSON, PDF gốc hoặc mã máy chủ.\n")
    print("| Kỹ năng | Số đề | HTML không còn chữ Hán | Còn chữ Hán |\n| --- | ---: | ---: | ---: |")
    for skill, label in (("listening", "Nghe"), ("reading", "Đọc"), ("writing", "Viết")):
        pages = sorted((ROOT / f"library/mock/cambridge-{skill}").glob("*.html"))
        remaining = 0
        for path in pages:
            text = path.read_text(encoding="utf-8")
            if '<html lang="vi">' not in text:
                failures.append(path.name + ": missing vi language")
            if HAN.search(text):
                remaining += 1
                volume = re.match(r"cambridge-(\d+)-test-", path.name)
                if skill == "writing" or (volume and int(volume[1]) in {*range(3, 13), 18, 20, 21}):
                    failures.append(path.name + ": untranslated content reintroduced")
        if not pages:
            failures.append("Missing pages: " + skill)
        print(f"| {label} | {len(pages)} | {len(pages) - remaining} | {remaining} |")
    print("\nKhông có chữ Hán **không chứng minh** bản dịch chính xác hoặc đầy đủ; các câu hỏi tiếng Anh được giữ nguyên.")
    if failures:
        print("\n".join(failures), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
