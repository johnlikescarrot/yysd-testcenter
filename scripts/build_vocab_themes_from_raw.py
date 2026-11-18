#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build browse-only thematic vocab catalog from scraped raw JSON.

ponytail: no lesson HTML / no test shells — catalog + data/*.json only.
"""
from __future__ import annotations

import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
RAW = os.path.join(ROOT, "library", "study", "vocab-themes", "raw")
OUT = os.path.join(ROOT, "library", "study", "vocab-themes")
DATA = os.path.join(OUT, "data")

INCLUDE = [
    ("exam", "cet4", "CET-4"),
    ("exam", "cet6", "CET-6"),
    ("exam", "tem", " Chuyên ngữ B2 Chuyên ngữ C1 "),
    ("exam", "kaoyan", " Sau đại học Tiếng Anh "),
    ("exam", "gaokao", " kỳ thi Đại Học Tiếng Anh "),
    ("abroad", "bec", "BEC"),
    ("abroad", "gmat", "GMAT"),
    ("abroad", "gre", "GRE"),
    ("abroad", "sat", "SAT"),
    ("abroad", "toeic", " TOEIC "),
    ("abroad", "toefl", " TOEFL "),
    ("abroad", "ielts", " IELTS "),
    ("k12", "primary", " tiểu học Từ vựng "),
    ("k12", "junior", " sơ trung Từ vựng "),
    ("k12", "senior", " Từ vựng Nền tảng THPT "),
    ("learning", "nce", " mới khái niệm "),
    ("learning", "oxford3000", " ngưu tân 3000 từ"),
    ("learning", "collins", " Collins Tinh cấp "),
    ("learning", "phrases", " thường dùng Cụm từ "),
    ("subject", "chem", " Hóa học "),
    ("subject", "geo", " địa lý học "),
    ("subject", "math", " Toán học "),
    ("subject", "phys", " Vật lý "),
    ("nature", "animals", " thế giới động vật "),
    ("nature", "plants", " Thực vật vương quốc "),
    ("life", "food", " ăn uống chơi đùa "),
    ("life", "urban", " Đô thị quy hoạch "),
    ("life", "travel", " an toàn Di chuyển "),
    ("life", "edu", " Khoa học & Giáo dục hứng nước "),
    ("life", "work", " Nghề nghiệp Công sở "),
    ("life", "festivals", " Lễ hội "),
    ("arts", "literature", " Văn học Nghệ thuật "),
    ("arts", "sports", " Thể thao "),
    ("arts", "games", " Trò chơi giải trí "),
    ("media", "film", " Điện ảnh & Truyền hình kịch "),
    ("media", "music", " Âm nhạc Phát thanh "),
]

CAT_LABEL = {
    "exam": " Tiếng Anh cuộc thi ",
    "abroad": " ra nước ngoài học ",
    "k12": " Vừa tiểu học ",
    "learning": " Tiếng Anh Học tập ",
    "subject": " ngành học phân loại ",
    "nature": " động thực vật ",
    "life": " sinh hoạt Đời sống ",
    "arts": " Nghệ thuật văn thể ",
    "media": " ảnh âm nghe nhìn ",
}


def keep(word: str) -> bool:
    w = (word or "").strip()
    if len(w) < 2 or len(w) > 42:
        return False
    if not re.search(r"[A-Za-z]", w):
        return False
    if re.fullmatch(r"[A-Z]{1,4}", w):
        return False
    if re.search(r"\d{3,}", w):
        return False
    return True


def main():
    os.makedirs(DATA, exist_ok=True)
    # wipe old lesson shells
    for name in os.listdir(OUT):
        if re.match(r"^theme-\d+-.*\.html$", name):
            os.remove(os.path.join(OUT, name))
    for name in os.listdir(DATA):
        if name.endswith(".json"):
            os.remove(os.path.join(DATA, name))

    categories = [{"id": "all", "label": " Tất cả "}] + [
        {"id": k, "label": CAT_LABEL[k]}
        for k in ["exam", "abroad", "k12", "learning", "subject", "nature", "life", "arts", "media"]
    ]

    themes = []
    total = 0
    with_meaning = 0

    for cat, sid, label in INCLUDE:
        path = os.path.join(RAW, "%s__%s.json" % (cat, sid))
        if not os.path.isfile(path):
            print("missing", path)
            continue
        data = json.load(open(path, encoding="utf-8"))
        words = []
        seen = set()
        for w in data.get("words") or []:
            word = (w.get("word") or "").strip()
            if not keep(word):
                continue
            k = word.lower()
            if k in seen:
                continue
            seen.add(k)
            meaning = (w.get("meaning") or "").strip()
            if meaning:
                with_meaning += 1
            words.append(
                {
                    "word": word,
                    "ipa": w.get("ipa") or "",
                    "pos": w.get("pos") or "",
                    "meaning": meaning,
                }
            )
        total += len(words)
        browse_path = "study/vocab-themes/data/%s.json" % sid
        with open(os.path.join(DATA, "%s.json" % sid), "w", encoding="utf-8") as f:
            json.dump(
                {"id": sid, "title": label, "category": cat, "count": len(words), "words": words},
                f,
                ensure_ascii=False,
            )
            f.write("\n")

        preview = [w["word"] for w in words[:12]]
        themes.append(
            {
                "id": sid,
                "no": len(themes) + 1,
                "title": label,
                "category": cat,
                "desc": "%s · %d từ (đã Giải nghĩa %d) "
                % (CAT_LABEL[cat], len(words), sum(1 for w in words if w.get("meaning"))),
                "count": len(words),
                "defined": sum(1 for w in words if w.get("meaning")),
                "preview": preview,
                "dataFile": browse_path,
            }
        )
        print("%s/%s %d words" % (cat, sid, len(words)))

    catalog = {
        "sourceNote": " công khai phân loại từ bề ngoài phục khắc xem kho; tạm không chứa tiểu khóa / Kiểm tra. ",
        "categories": categories,
        "themes": themes,
    }
    with open(os.path.join(OUT, "themes.json"), "w", encoding="utf-8") as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print("themes", len(themes), "words", total, "defined", with_meaning)


if __name__ == "__main__":
    main()
