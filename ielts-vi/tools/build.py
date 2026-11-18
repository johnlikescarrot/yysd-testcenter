"""Build only the reviewed Vietnamese IELTS release, never the whole checkout."""

import json
import re
import shutil
import sys
from collections import defaultdict
from html import escape
from pathlib import Path

HERE = Path(__file__).resolve().parents[1]
ROOT = HERE.parent
OUT = HERE / "dist"
# Explicit editorial selection. Do not silently omit an untranslated paper.
VOLUMES = {
    "writing": range(3, 22),
    "reading": (*range(3, 19), 21),
    "listening": (4, 5, 6, 7, 10, 11, 12),
}
LABEL = {"writing": "Viết", "reading": "Đọc", "listening": "Nghe"}
GRAMMAR = {
    "c10-t1p1": "Stepwells",
    "c10-t1p2": "European transport systems",
    "c10-t1p3": "The psychology of innovation",
    "c10-t2p1": "Tea and the Industrial Revolution",
    "c10-t2p2": "Gifted children and learning",
    "c10-t2p3": "Museums of fine art and their public",
    "c11-t3p1": "The story of silk",
}
PRACTICE = [
    "practice/ielts/sample-academic-reading-1.html",
    "practice/shuzi-tingxie/numbers-1.html",
    *(f"practice/changnanju/{id}.html" for id in GRAMMAR),
]
HAN = re.compile(r"[\u3400-\u9fff\uf900-\ufaff]")
MEDIA = re.compile(
    r"""["'`]([\w.-]+\.(?:mp3|m4a|png|jpe?g|webp|svg|json))(?:\?[^"'`\s<>]+)?["'`]""",
    re.IGNORECASE,
)
# Additional reading papers whose detailed explanations have been fully reviewed.
READING_TESTS = {13: (1, 2), 14: (2,), 15: (4,), 16: (1, 2), 17: (), 18: (1, 3, 4)}
DIALOGUE = ROOT / "library/practice/jingting/data/cam20-t1-p1.json"


def checked(text, path):
    match = HAN.search(text)
    if match:
        context = text[max(0, match.start() - 24) : match.end() + 40]
        raise ValueError(f"{path}: missing translation near {context!r}")
    return text


def document(title, description, body, active):
    home = (HERE / "index.html").read_text()
    header = (
        home[home.index("<body>") : home.index("<main")]
        .replace(' aria-current="page"', "")
        .replace(
            f'href="{active}">{"Thư viện đề" if active == "thu-vien.html" else "Cẩm nang"}',
            f'href="{active}" aria-current="page">{"Thư viện đề" if active == "thu-vien.html" else "Cẩm nang"}',
        )
    )
    footer = home[home.index("<footer>") : home.index("</footer>") + len("</footer>")]
    return f'''<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{escape(title)} · IELTS Atlas</title><meta name="description" content="{escape(description, quote=True)}"><link rel="icon" href="assets/compass.svg"><link rel="stylesheet" href="assets/atlas.css"></head>{header}<main id="main" class="shell doc">{body}</main>{footer}</body></html>\n'''


def papers():
    for skill, volumes in VOLUMES.items():
        suffix = "" if skill == "listening" else f"-{skill}"
        for vol in volumes:
            tests = range(1, 3 if vol == 3 else 5)
            if skill == "reading":
                tests = READING_TESTS.get(vol, tests)
            for test in tests:
                name = f"cambridge-{vol}-test-{test}{suffix}.html"
                yield (
                    skill,
                    vol,
                    test,
                    ROOT / "library/mock" / f"cambridge-{skill}" / name,
                )


def transcript(prefix):
    data = json.loads(DIALOGUE.read_text())
    audio = prefix + data["audioUrl"]
    rows = []
    for line in data["sentences"]:
        start, end = line["start"], line["end"]
        assert 0 <= start < end and line["vi"]
        minute, sec = divmod(int(start), 60)
        rows.append(
            f'<li><b>{minute:02}:{sec:02}</b> <span lang="en">{escape(line["en"])}</span><details><summary>Xem nghĩa tiếng Việt</summary><p>{escape(line["vi"])}</p></details></li>'
        )
    body = (
        '<p class="eyebrow">Bàn nghe · Cambridge IELTS 20</p><h1>Đặt bàn ở nhà hàng</h1>'
        '<p class="lead">Nghe Test 1, Part 1. Bắt đầu ở phút 01:34. Ghi địa điểm, giá hoặc điều kiện đặt bàn trước khi mở nghĩa tiếng Việt.</p>'
        f'<audio controls preload="none" aria-label="Cambridge IELTS 20 Test 1 Part 1" src="{audio}#t=94"></audio>'
        '<h2>Lời thoại theo thời gian</h2><ol class="transcript-list">'
        + "".join(rows)
        + "</ol>"
    )
    return document(
        "Đặt bàn ở nhà hàng",
        "Luyện nghe hội thoại tiếng Anh, có mốc thời gian và bản dịch tiếng Việt để tự đối chiếu.",
        body,
        "thu-vien.html",
    )


def catalogue(prefix):
    entries = defaultdict(lambda: defaultdict(dict))
    for skill, vol, test, file in papers():
        entries[vol][test][skill] = f"{prefix}{file.relative_to(ROOT)}"
    grammar_links = "".join(
        f'<li><a lang="en" href="{prefix}library/practice/changnanju/{slug}.html">{title}</a></li>'
        for slug, title in GRAMMAR.items()
    )
    body = [
        '<p class="eyebrow">Bộ sưu tập · Cambridge IELTS</p><h1>Thư viện đề</h1><p class="lead">Chọn tập và kỹ năng để mở đề gốc. Câu hỏi và đáp án bằng tiếng Anh; hướng dẫn, nhận xét và báo cáo bằng tiếng Việt.</p>',
        "<h2>Bài luyện theo chủ điểm</h2>",
        f'<p><a href="{prefix}library/{PRACTICE[0]}">Đọc: Ong mật tìm đường về tổ</a> · <a href="{prefix}library/{PRACTICE[1]}">Nghe: Ghi số điện thoại</a> · <a href="doi-thoai.html">Nghe kỹ: Đặt bàn ở nhà hàng</a></p><details><summary>Phân tích và dịch câu phức · 7 bài</summary><ul>{grammar_links}</ul></details><h2>Đề theo tập</h2><p>Chấm câu khách quan ngay trên máy. Phần viết có bộ đếm từ, bản nháp và bảng tự đánh giá; không tự cấp band. Với đề thiếu hình, hãy đối chiếu sách gốc.</p>',
    ]
    for v in sorted(entries, reverse=True):
        body.append(
            f"<details><summary>Cambridge IELTS {v} · {len(entries[v])} đề</summary>"
        )
        for t, skills in sorted(entries[v].items()):
            links = "".join(
                f'<a href="{skills[k]}" aria-label="{LABEL[k]}, tập {v}, Test {t}">{LABEL[k]}</a>'
                for k in ("listening", "reading", "writing")
                if k in skills
            )
            body.append(f'<div class="paper-row"><b>Test {t}</b>{links}</div>')
        body.append("</details>")
    return document(
        "Thư viện đề",
        "Thư viện luyện thi Cambridge IELTS với đề nghe, đọc và viết, hướng dẫn bằng tiếng Việt.",
        "\n".join(body),
        "thu-vien.html",
    )


def package_paper(skill, path):
    dest = OUT / path.relative_to(ROOT)
    dest.parent.mkdir(parents=True, exist_ok=True)
    text = path.read_text()
    if skill in ("reading", "listening") and "function lookupBand" not in text:
        raise ValueError(f"Missing scoring helper in {path}")
    for name in sorted(set(MEDIA.findall(text.replace(r"\"", '"')))):
        source = path.parent / name
        if source.is_file():
            target = dest.parent / name
            if not target.exists():
                shutil.copyfile(source, target)
        elif name in {"bamboo_fabric_diagram.png", "ielts13_test3_electricity.png"}:
            # Known absent originals already have a fallback. Use an accessible
            # explanatory panel, not an invented chart or a broken network load.
            text = text.replace(
                "image: '" + name + "'",
                "svg: '<p>Chưa có hình trong kho. Hãy đối chiếu hình Task 1 trong sách.</p>'",
            )
            if name in text:
                raise ValueError(f"Unexpected image declaration: {name}")
        else:
            raise FileNotFoundError(source)
    back = '<nav aria-label="Điều hướng đề"><a style="display:inline-block;padding:8px 16px;color:#183941" href="../../../thu-vien.html">← Thư viện đề</a></nav>'
    # Make the existing cover operable by keyboard as well as pointer. The
    # native button bubbles to the original card's click handler.
    text = re.sub(
        r'<div class="pc-go">(.*?)</div>',
        r'<button type="button" class="pc-go">\1</button>',
        text,
    )
    text = text.replace(
        '<div class="passage-pane">', '<div class="passage-pane" lang="en">'
    )
    text = re.sub(r'<textarea id="(t[12])"', r'<textarea lang="en" id="\1"', text)
    text = re.sub(
        r'(<textarea lang="en" id="t([12])")', r'\1 aria-label="Writing Task \2"', text
    )
    text = text.replace(
        '<input type="text" id="${questionId(n)}"',
        '<input type="text" aria-label="Câu ${n}" id="${questionId(n)}"',
    )
    description = re.search(r'<meta name="exam:description"\s+content="([^"]*)"', text)
    head = (
        f'<meta name="description" content="{description[1]}">' if description else ""
    )
    head += "<style>.header h1 .brandtag{background:#274758}.cover-hero .sub,.paper-card .pc-meta{color:#47586b}.paper-card .pc-go{border:0;font-family:inherit;cursor:pointer}:focus-visible{outline:3px solid #855917;outline-offset:2px}</style>"
    text = (
        text.replace("</head>", head + "</head>")
        .replace("<body>", "<body>" + back + "<main>", 1)
        .replace("</body>", "</main></body>", 1)
    )
    dest.write_text(checked(text, path.name))


def check_budget(folder, limit=900):
    mib = sum(p.stat().st_size for p in folder.rglob("*") if p.is_file()) / 1048576
    if mib >= limit:
        raise ValueError(f"Pages budget exceeded: {mib:.1f} MiB (limit {limit} MiB)")
    return mib


def generated(name, render):
    if (HERE / name).read_text() != render("../"):
        raise ValueError(f"Stale {name}: run python tools/build.py --catalogue")
    (OUT / name).write_text(render(""))


def stage_assets():
    if OUT.exists():
        shutil.rmtree(OUT)
    shutil.copytree(HERE / "assets", OUT / "assets")


def build():
    stage_assets()
    for page in ("index.html", "cam-nang.html", "so-thuc-hanh.html"):
        shutil.copyfile(HERE / page, OUT / page)
    generated("doi-thoai.html", transcript)
    track = Path(json.loads(DIALOGUE.read_text())["audioUrl"])
    (OUT / track.parent).mkdir(parents=True, exist_ok=True)
    shutil.copyfile(ROOT / track, OUT / track)
    generated("thu-vien.html", catalogue)
    (OUT / ".nojekyll").touch()
    # Reuse the five short recordings without copying the TOEFL application.
    audio = OUT / "audio"
    audio.mkdir()
    for i in range(1, 6):
        name = f"set-1-s-lr-{i}.mp3"
        shutil.copyfile(ROOT / "app/library/toefl/audio" / name, audio / name)
    app = OUT / "assets/atlas.mjs"
    app.write_text(app.read_text().replace("../app/library/toefl/audio/", "audio/"))
    count = 0
    for skill, _, _, path in papers():
        package_paper(skill, path)
        count += 1
    for file in PRACTICE:
        package_paper("practice", ROOT / "library" / file)
    for file in OUT.rglob("*"):
        if file.suffix in {".html", ".mjs", ".json", ".svg"}:
            checked(file.read_text(), file)
    size_mib = check_budget(OUT)
    print(
        f"{count} Cambridge papers, {len(PRACTICE)} standalone practice tools; {size_mib:.1f} MiB"
    )


if __name__ == "__main__":
    if sys.argv[1:] == ["--catalogue"]:
        (HERE / "thu-vien.html").write_text(catalogue("../"))
        (HERE / "doi-thoai.html").write_text(transcript("../"))
    else:
        build()
