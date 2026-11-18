#!/usr/bin/env python3
"""Sinh các trang HTML tĩnh cho ứng dụng YYSD · IELTS Việt.

Chạy: python3 scripts/vi/build_pages.py
Giữ phần khung (header/nav/footer) đồng nhất giữa 6 trang; nội dung trang do JS render.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2] / "vi"

NAV = [
    ("dashboard", "index.html", "home", "Trang chủ"),
    ("learn", "hoc.html", "book", "Học"),
    ("practice", "luyen-tap.html", "target", "Luyện tập"),
    ("library", "thu-vien.html", "library", "Thư viện"),
    ("progress", "tien-do.html", "chart", "Tiến độ"),
]

ICONS = {
    "home": '<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
    "book": '<path d="M5 4h9a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M8 20a3 3 0 0 1-3-3V4"/>',
    "target": '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
    "library": '<path d="M4 5h5v15H4zM11 5h4v15h-4zM17 6l3 14"/>',
    "chart": '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    "flame": '<path d="M12 3c3 4 6 6 6 10a6 6 0 0 1-12 0c0-3 2-5 3-7 0 2 1 3 2 3 0-2 0-4 1-6z"/>',
    "bolt": '<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>',
    "gem": '<path d="m12 3 7 5-7 13L5 8z"/><path d="M5 8h14M9 8l3 13M15 8l-3 13"/>',
    "heart": '<path d="M12 20s-7-4.6-7-9.3A4 4 0 0 1 12 8a4 4 0 0 1 7 2.7C19 15.4 12 20 12 20z"/>',
}

BRAND = (
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" '
    'stroke-linecap="round" aria-hidden="true" focusable="false">'
    '<path d="M5 17c0-5 3-9 7-9s7 4 7 9"/>'
    '<circle cx="9.5" cy="14" r="1.6" fill="currentColor" stroke="none"/>'
    '<circle cx="14.5" cy="14" r="1.6" fill="currentColor" stroke="none"/>'
    '<path d="m12 17 1.5 2-1.5 2-1.5-2z"/></svg>'
)


def svg(name: str) -> str:
    return (
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" '
        f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">{ICONS[name]}</svg>'
    )


def stats_block() -> str:
    return (
        '<div class="stats" id="stats">\n'
        f'      <span class="stat stat--streak" title="Chuỗi ngày">{svg("flame")}<span>0</span><span class="stat-meta">ngày</span></span>\n'
        f'      <span class="stat stat--xp" title="Tổng XP">{svg("bolt")}<span>0</span><span class="stat-meta">XP</span></span>\n'
        f'      <span class="stat stat--gem" title="Đá quý">{svg("gem")}<span>0</span></span>\n'
        f'      <span class="stat stat--heart" title="Trái tim">{svg("heart")}<span>5</span><span class="stat-meta">/5</span></span>\n'
        '    </div>'
    )


def nav_items(active: str) -> str:
    rows = []
    for page, href, icon_name, label in NAV:
        current = ' aria-current="page"' if page == active else ""
        rows.append(f'<li><a class="nav-link" href="./{href}"{current}>{svg(icon_name)}<span>{label}</span></a></li>')
    return "\n        ".join(rows)


def bottom_items(active: str) -> str:
    rows = []
    for page, href, icon_name, label in NAV:
        current = ' aria-current="page"' if page == active else ""
        rows.append(f'<a href="./{href}"{current}>{svg(icon_name)}<span>{label}</span></a>')
    return "\n      ".join(rows)


PAGES = {
    "index.html": dict(
        page="dashboard", active="dashboard",
        title="YYSD · IELTS Việt — luyện thi IELTS theo lộ trình",
        desc="Ứng dụng luyện thi IELTS tiếng Việt: lộ trình 8 chương, thẻ từ vựng ôn tập ngắt quãng, "
             "writing và speaking có hẹn giờ, thư viện PDF kèm trích dẫn Google Scholar.",
        h1="Luyện thi IELTS, mỗi ngày một bước",
        intro="Lộ trình 8 chương từ nền tảng tới band 7.0+, bài học 5–8 phút, thẻ từ vựng tự lên lịch ôn, "
              "writing và speaking có hẹn giờ. Toàn bộ giao diện tiếng Việt, giải thích tiếng Việt.",
        jsonld=True,
    ),
    "hoc.html": dict(
        page="learn", active="learn",
        title="Lộ trình học | YYSD · IELTS Việt",
        desc="Lộ trình 8 chương gồm 24 bài học IELTS: đọc hiểu, nghe, viết, nói, từ vựng học thuật và ngữ pháp câu phức.",
        h1="Lộ trình 8 chương",
        intro="Mỗi chương gồm 3 bài ngắn, mở khoá khi bạn hoàn thành 60% chương trước. Bài học trộn kỹ năng và ngữ pháp nền.",
        jsonld=False,
    ),
    "bai-hoc.html": dict(
        page="lesson", active="learn",
        title="Bài học | YYSD · IELTS Việt",
        desc="Trình học bài IELTS với bốn dạng câu hỏi: trắc nghiệm, điền từ, xếp câu và nghe chép chính tả.",
        h1="Bài học",
        intro="Mỗi câu đều có giải thích tiếng Việt. Trả lời sai sẽ mất một trái tim — hãy đọc kỹ trước khi chọn.",
        jsonld=False,
    ),
    "luyen-tap.html": dict(
        page="practice", active="practice",
        title="Luyện tập | YYSD · IELTS Việt",
        desc="Ôn thẻ từ vựng theo lịch ngắt quãng, nghe chép chính tả, luyện viết Task 1–2 và speaking có hẹn giờ.",
        h1="Luyện tập chủ động",
        intro="Bốn chế độ luyện không tốn trái tim: thẻ từ vựng, nghe chép, viết luận có dàn ý và speaking có hẹn giờ.",
        jsonld=False,
    ),
    "thu-vien.html": dict(
        page="library", active="library",
        title="Thư viện PDF & trích dẫn | YYSD · IELTS Việt",
        desc="Tài liệu PDF tiếng Việt về từ vựng, reading, writing, speaking — mỗi tài liệu kèm trích dẫn Google Scholar để tự kiểm chứng.",
        h1="Thư viện PDF & bằng chứng khoa học",
        intro="Tải tài liệu PDF và tra cứu 30 nghiên cứu nền tảng, có liên kết Google Scholar và DOI để bạn tự kiểm chứng.",
        jsonld=False,
    ),
    "tien-do.html": dict(
        page="progress", active="progress",
        title="Tiến độ | YYSD · IELTS Việt",
        desc="Theo dõi XP, chuỗi ngày, band ước lượng theo kỹ năng, thành tựu và bảng hạng tuần. Sao lưu tiến độ bằng tệp JSON.",
        h1="Tiến độ của bạn",
        intro="Bức tranh tổng thể về XP, chuỗi ngày, band ước lượng từng kỹ năng và 13 thành tựu.",
        jsonld=False,
    ),
}

ORG_JSON = {
    "@type": "EducationalOrganization",
    "name": "YYSD · IELTS Việt",
    "description": "Nền tảng luyện thi IELTS tiếng Việt với lộ trình 8 chương, "
                   "thẻ từ vựng ôn tập ngắt quãng và thư viện tài liệu có trích dẫn.",
    "inLanguage": "vi",
}

COURSE_JSON = {
    "@type": "Course",
    "name": "Luyện thi IELTS theo lộ trình",
    "description": "24 bài học tiếng Việt trải bốn kỹ năng IELTS, kèm bài tập tương tác và giải thích đáp án.",
    "inLanguage": "vi",
    "teaches": ["IELTS Reading", "IELTS Listening", "IELTS Writing", "IELTS Speaking"],
    "hasCourseInstance": {"@type": "CourseInstance", "courseMode": "online", "inLanguage": "vi"},
}

JSONLD = (
    '<script type="application/ld+json">\n'
    + json.dumps({"@context": "https://schema.org", "@graph": [ORG_JSON, COURSE_JSON]},
                 ensure_ascii=False)
    + "\n</script>\n"
)

CSS = (ROOT / "css" / "app.css").read_text(encoding="utf-8")


TEMPLATE = """<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>document.documentElement.className += " js";</script>
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#07192f">
<meta name="color-scheme" content="light">
<meta property="og:type" content="website">
<meta property="og:site_name" content="YYSD · IELTS Việt">
<meta property="og:locale" content="vi_VN">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<link rel="icon" href="./img/favicon.svg" type="image/svg+xml">
<link rel="manifest" href="./manifest.webmanifest">
<link rel="apple-touch-icon" href="./img/favicon.svg">
<style>
{css}
</style>
{jsonld}</head>
<body data-page="{page}">
<a class="skip-link" href="#app">Bỏ qua điều hướng</a>
<header class="topbar">
  <a class="brand" href="./index.html">
    <span class="brand-mark">{brand}</span>
    <span class="brand-text">
      <span class="brand-name">YYSD · IELTS Việt</span>
      <span class="brand-sub">Học chủ động mỗi ngày</span>
    </span>
  </a>
  <nav class="nav-desktop" aria-label="Điều hướng chính">
    <ul class="nav-list">
        {nav}
    </ul>
  </nav>
  {stats}
</header>

<main class="main" id="app">
  <div class="shell-wrap">
    <noscript>
      <div class="card">
        <h1>{h1}</h1>
        <p>{intro}</p>
        <p><strong>Ứng dụng cần JavaScript để chạy bài học và lưu tiến độ.</strong>
        Bạn vẫn có thể xem lộ trình và thư viện tài liệu bằng các liên kết dưới đây:</p>
        <ul>
          <li><a href="./hoc.html">Lộ trình 8 chương</a></li>
          <li><a href="./luyen-tap.html">Luyện tập</a></li>
          <li><a href="./thu-vien.html">Thư viện PDF &amp; trích dẫn</a></li>
          <li><a href="./tien-do.html">Tiến độ</a></li>
        </ul>
      </div>
    </noscript>
  </div>
</main>

<nav class="bottom-nav" aria-label="Điều hướng nhanh">
      {bottom}
</nav>

<footer class="shell-wrap site-foot">
  <p><strong>YYSD · IELTS Việt</strong> — học liệu tham khảo, không thay thế kỳ thi IELTS chính thức.
  Điểm band trong ứng dụng là ước lượng từ độ chính xác khi luyện.</p>
  <p class="foot-links">
    <a href="./hoc.html">Lộ trình</a>
    <a href="./luyen-tap.html">Luyện tập</a>
    <a href="./thu-vien.html">Thư viện &amp; trích dẫn</a>
    <a href="./tien-do.html">Tiến độ</a>
    <a href="https://scholar.google.com/" target="_blank" rel="noopener">Google Scholar</a>
  </p>
</footer>

<script type="module" src="./js/browser.js"></script>
</body>
</html>
"""

NOT_FOUND = """<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Không tìm thấy trang | YYSD · IELTS Việt</title>
<meta name="description" content="Trang bạn tìm không tồn tại. Quay về lộ trình học IELTS của YYSD.">
<meta name="robots" content="noindex">
<link rel="icon" href="./img/favicon.svg" type="image/svg+xml">
<link rel="manifest" href="./manifest.webmanifest">
<link rel="apple-touch-icon" href="./img/favicon.svg">
<style>
{css}
</style>
</head>
<body data-page="not-found">
<main class="main">
  <div class="shell-wrap">
    <div class="card" style="max-width:32rem;margin:4rem auto">
      <p class="eyebrow">Lỗi 404</p>
      <h1>Trang này không tồn tại</h1>
      <p class="muted">Có thể đường dẫn đã đổi. Hãy quay về lộ trình để tiếp tục học.</p>
      <p><a class="btn btn--primary" href="./index.html">Về trang chủ</a></p>
    </div>
  </div>
</main>
</body>
</html>
"""


def main() -> None:
    for name, cfg in PAGES.items():
        html = TEMPLATE.format(
            title=cfg["title"],
            desc=cfg["desc"],
            page=cfg["page"],
            jsonld=JSONLD if cfg["jsonld"] else "",
            css=CSS,
            brand=BRAND,
            nav=nav_items(cfg["active"]),
            stats=stats_block(),
            bottom=bottom_items(cfg["active"]),
            h1=cfg["h1"],
            intro=cfg["intro"],
        )
        (ROOT / name).write_text(html, encoding="utf-8")
        print(f"wrote {name} ({len(html)} bytes)")
    (ROOT / "404.html").write_text(NOT_FOUND.format(css=CSS), encoding="utf-8")
    (ROOT / "robots.txt").write_text("User-agent: *\nAllow: /\n", encoding="utf-8")
    print("wrote 404.html, robots.txt")


if __name__ == "__main__":
    main()
