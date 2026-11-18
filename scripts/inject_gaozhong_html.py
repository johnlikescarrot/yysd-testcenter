#!/usr/bin/env python3
"""Replace wordData in Từ vựng THPT LISTn.html and fix counts/titles. Excel order is caller’s job."""
import json, re, sys
from pathlib import Path

DIR = Path(__file__).resolve().parents[1] / "library/study/vocab"


def inject(n, words):
    path = DIR / (" Từ vựng THPT LIST%s.html" % n)
    html = path.read_text(encoding="utf-8")
    m = re.search(r"const wordData = \[[\s\S]*?\];", html)
    if not m:
        raise SystemExit("wordData not found: %s" % path)
    payload = "const wordData = %s;" % json.dumps(words, ensure_ascii=False, separators=(",", ":"))
    html = html[: m.start()] + payload + html[m.end():]
    count = len(words)
    html = re.sub(r"<title>.*?</title>", "<title> Từ vựng THPT LIST %s (1-%s) - Giọng Anh chuẩn </title>" % (n, count), html, count=1)
    html = re.sub(r"(IELTS LIST %s| THPT LIST %s)" % (n, n), " THPT LIST %s" % n, html)
    html = re.sub(r" tổng \d+ từ ", " tổng %s từ " % count, html)
    html = re.sub(r" Tất cả <strong>\d+ Từ vựng </strong>", " Tất cả <strong>%s Từ vựng </strong>" % count, html)
    html = re.sub(r" Bắt đầu Đánh giá \(\d+ câu \)", " Bắt đầu Đánh giá (%s câu)" % count, html)
    html = re.sub(r" thứ 1 / \d+ câu ", " thứ 1 / %s câu " % count, html)
    html = re.sub(r"const TOTAL_QUESTIONS = \d+;", "const TOTAL_QUESTIONS = %s;" % count, html)
    path.write_text(html, encoding="utf-8")
    order = [w["word"] for w in words]
    print("LIST%s %s words · %s … %s" % (n, count, order[0], order[-1]))


if __name__ == "__main__":
    n = int(sys.argv[1])
    words = json.loads(Path(sys.argv[2]).read_text(encoding="utf-8"))
    inject(n, words)
