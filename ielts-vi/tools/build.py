"""Build only the reviewed Vietnamese IELTS release, never the whole checkout."""

from collections import defaultdict
from html import escape
from pathlib import Path
import re
import shutil
import sys

HERE = Path(__file__).resolve().parents[1]
ROOT = HERE.parent
OUT = HERE / "dist"
sys.path.insert(0, str(ROOT / "scripts"))
from cambridge_scoring import patch_scoring  # noqa: E402

# Explicit editorial selection. Do not silently omit an untranslated paper.
VOLUMES = {
    "writing": range(3, 22),
    "reading": (*range(3, 13), 21),
    "listening": (10, 12),
}
LABEL = {"writing": "Viết", "reading": "Đọc", "listening": "Nghe"}
PRACTICE = [
    "practice/ielts/sample-academic-reading-1.html",
    "practice/shuzi-tingxie/numbers-1.html",
]
HAN = re.compile(r"[\u3400-\u9fff\uf900-\ufaff]")
MEDIA = re.compile(
    r"""["'`]([\w.-]+\.(?:mp3|m4a|png|jpe?g|webp|svg|json))["'`]""", re.I
)
LABELS = dict(
    line.split("\t", 1)
    for line in (HERE / "content/paper-vi.tsv").read_text().splitlines()
    if line and not line.startswith("#")
)
PHRASES = re.compile("|".join(map(re.escape, sorted(LABELS, key=len, reverse=True))))


def translate(text):
    # Only remove comments containing legacy Chinese. Preserve English study
    # material, IDs, JS interpolation, filenames, keys and the grading engine.
    text = re.sub(
        r"<!--[\s\S]*?-->|/\*[\s\S]*?\*/|(?m:(?<=\s)//[^\n]*[\u3400-\u9fff][^\n]*$)",
        lambda m: "" if HAN.search(m[0]) and not m[0].startswith("//www") else m[0],
        text,
    )
    text = PHRASES.sub(lambda m: LABELS[m[0]].replace("␠", " "), text)
    return (
        text.translate(str.maketrans("（）：，。；？　【】", "():,.;? []"))
        .replace('lang="zh-CN"', 'lang="vi"')
        .replace("'zh-CN'", "'vi-VN'")
    )


def checked(text, path):
    leftover = sorted(
        set(re.findall(r'[^<>\n`"\']{0,25}[\u3400-\u9fff]+[^<>\n`"\']{0,35}', text))
    )
    if leftover:
        raise ValueError(f"{path}: missing translation(s): {leftover[:12]}")
    return text


def document(title, description, body, active):
    home = (HERE / "index.html").read_text()
    header = (
        home[home.index("<body>") : home.index("<main")]
        .replace(' aria-current="page"', "")
        .replace(
            f'href="{active}">{title if active == "thu-vien.html" else "Cẩm nang"}',
            f'href="{active}" aria-current="page">{title if active == "thu-vien.html" else "Cẩm nang"}',
        )
    )
    footer = home[home.index("<footer>") : home.index("</footer>") + len("</footer>")]
    return f'''<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{escape(title)} · IELTS Atlas</title><meta name="description" content="{escape(description, quote=True)}"><link rel="icon" href="assets/compass.svg"><link rel="stylesheet" href="assets/atlas.css"></head>{header}<main id="main" class="shell doc">{body}</main>{footer}</body></html>\n'''


def papers():
    for skill, volumes in VOLUMES.items():
        suffix = "" if skill == "listening" else f"-{skill}"
        for vol in volumes:
            for test in range(1, 3 if vol == 3 else 5):
                name = f"cambridge-{vol}-test-{test}{suffix}.html"
                yield (
                    skill,
                    vol,
                    test,
                    ROOT / "library/mock" / f"cambridge-{skill}" / name,
                )


def catalogue(prefix):
    entries = defaultdict(lambda: defaultdict(dict))
    for skill, vol, test, file in papers():
        entries[vol][test][skill] = f"{prefix}{file.relative_to(ROOT)}"
    body = [
        '<p class="eyebrow">Bộ sưu tập · Cambridge IELTS</p><h1>Thư viện đề</h1><p class="lead">Chọn tập và kỹ năng để mở đề gốc. Câu hỏi và đáp án bằng tiếng Anh; hướng dẫn, nhận xét và báo cáo bằng tiếng Việt trên bản Pages.</p>',
        "<h2>Bài luyện theo chủ điểm</h2>",
        f'<p><a href="{prefix}library/{PRACTICE[0]}">Đọc: Ong mật tìm đường về tổ</a> · <a href="{prefix}library/{PRACTICE[1]}">Nghe: Ghi số điện thoại</a></p><h2>Đề theo tập</h2><p>Chấm câu khách quan ngay trên máy. Phần viết có bộ đếm từ, bản nháp và bảng tự đánh giá; không tự cấp band. Với đề thiếu hình, hãy đối chiếu sách gốc.</p>',
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
    if skill in ("reading", "listening"):
        if "let currentPaper=" not in text:
            text = text.replace(
                "const allQs =",
                "let currentPaper=[], selectedSections=[], mode='practice', startTime=0, timerInterval=null, submitted=false;\nconst allQs =",
                1,
            )
        text = patch_scoring(text, reading=skill == "reading")
        if "function lookupBand" not in text or "function levelLabel" not in text:
            raise ValueError(f"Missing scoring helper in {path}")
        # The original inline report uses innerHTML. Treat a learner's free-text
        # response as text (the source bank HTML itself is trusted).
        text = text.replace(
            "${it.ua}",
            '${String(it.ua).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")}',
        )
    text = translate(text)
    for name in sorted(set(MEDIA.findall(text))):
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
    dest.write_text(checked(text.replace("<body>", "<body>" + back, 1), path.name))


def build():
    if OUT.exists():
        shutil.rmtree(OUT)
    shutil.copytree(HERE / "assets", OUT / "assets")
    for page in ("index.html", "cam-nang.html", "so-thuc-hanh.html"):
        shutil.copyfile(HERE / page, OUT / page)
    (OUT / "thu-vien.html").write_text(catalogue(""))
    if (HERE / "thu-vien.html").read_text() != catalogue("../"):
        raise ValueError("Stale catalogue: run python tools/build.py --catalogue")
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
    print(
        f"{count} Cambridge papers, {len(PRACTICE)} standalone practice tools; {sum(p.stat().st_size for p in OUT.rglob('*') if p.is_file()) / 1048576:.1f} MiB"
    )


if __name__ == "__main__":
    if sys.argv[1:] == ["--catalogue"]:
        (HERE / "thu-vien.html").write_text(catalogue("../"))
    else:
        build()
