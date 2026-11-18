#!/usr/bin/env python3
"""Replace wordData in trường trung học phổ thông từ LISTn.html and fix counts/titles. Excel order is caller’s job."""
import json, re, sys
from pathlib import Path

DIR = Path(__file__).resolve().parents[1] / "library/study/vocab"


def inject(n, words):
    path = DIR / (" trường trung học phổ thông từ LIST%s.html" % n)
    html = path.read_text(encoding="utf-8")
    m = re.search(r"const wordData = \[[\s\S]*?\];", html)
    if not m:
        raise SystemExit("wordData not found: %s" % path)
    payload = "const wordData = %s;" % json.dumps(words, ensure_ascii=False, separators=(",", ":"))
    html = html[: m.start()] + payload + html[m.end() :]
    count = len(words)
    html = re.sub(r"<title>.*?</title>", "<title>trường trung học phổ thông từ LIST %s (1-%s) - Anh loại nữ âm thanh</title>" % (n, count), html, count=1)
    html = re.sub(r"(IELTS LIST %s|trường trung học phổ thông LIST %s)" % (n, n), " trường trung học phổ thông LIST %s" % n, html)
    html = re.sub(r" Tổng cộng \d+ Từ ", " Tổng cộng %s Từ " % count, html)
    html = re.sub(r" Tất cả<strong>\d+dùng trong | từ</strong>", " Tất cả<strong>%s dùng trong | từ</strong>" % count, html)
    html = re.sub(r" bắt đầu phát hiện \(\d+Câu hỏi\)", " bắt đầu phát hiện (%s Câu hỏi)" % count, html)
    html = re.sub(r" Thứ 1 / \d+ Câu hỏi ", " Thứ 1 / %s Câu hỏi " % count, html)
    html = re.sub(r"const TOTAL_QUESTIONS = \d+;", "const TOTAL_QUESTIONS = %s;" % count, html)
    path.write_text(html, encoding="utf-8")
    order = [w["word"] for w in words]
    print("LIST%s %s words · %s ... %s" % (n, count, order[0], order[-1]))


if __name__ == "__main__":
    n = int(sys.argv[1])
    words = json.loads(Path(sys.argv[2]).read_text(encoding="utf-8"))
    inject(n, words)
