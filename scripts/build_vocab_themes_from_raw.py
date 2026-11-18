#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build browse-only thematic vocab catalog from scraped raw JSON.

ponytail: no lesson HTML / no test shells - catalog + data/*.json only.
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
    ("exam", "tem", " cho một người bốn TEM-8 hoặc Kỳ thi chuyên ngành tiếng Anh cấp 8 "),
    ("exam", "kaoyan", " dự thi đầu vào chương trình sau đại học tiếng Anh "),
    ("exam", "gaokao", " kỳ thi tuyển sinh đại học tiếng Anh "),
    ("abroad", "bec", "BEC"),
    ("abroad", "gmat", "GMAT"),
    ("abroad", "gre", "GRE"),
    ("abroad", "sat", "SAT"),
    ("abroad", "toeic", " TOEIC "),
    ("abroad", "toefl", " TOEFL "),
    ("abroad", "ielts", " IELTS "),
    ("k12", "primary", " trường tiểu học biến thể của | "),
    ("k12", "junior", " trường trung học cơ sở biến thể của | "),
    ("k12", "senior", " trường trung học phổ thông biến thể của | "),
    ("learning", "nce", " viết tắt của Tân Cương khái niệm "),
    ("learning", "oxford3000", " Oxford 3000 Từ "),
    ("learning", "collins", " Collins xếp hạng sao "),
    ("learning", "phrases", " được sử dụng phổ biến cụm từ "),
    ("subject", "chem", " Hóa học "),
    ("subject", "geo", " địa lý học "),
    ("subject", "math", " Toán "),
    ("subject", "phys", " Vật lý "),
    ("nature", "animals", " động vật thế giới "),
    ("nature", "plants", " thực vật vương quốc "),
    ("life", "food", " ăn uống vui chơi "),
    ("life", "urban", " quy hoạch đô thị "),
    ("life", "travel", " an toàn đi ra đâu đó "),
    ("life", "edu", " chấn hưng đất nước qua khoa học và giáo dục "),
    ("life", "work", " nghề nghiệp nơi làm việc "),
    ("life", "festivals", " ngày lễ "),
    ("arts", "literature", " văn học nghệ thuật "),
    ("arts", "sports", " thể thao "),
    ("arts", "games", " trò chơi giải trí "),
    ("media", "film", " phim và truyền hình tác phẩm sân khấu "),
    ("media", "music", " âm nhạc phát sóng "),
]

CAT_LABEL = {
    "exam": " tiếng Anh dự thi ",
    "abroad": " ra nước ngoài du học ",
    "k12": " trường trung học và tiểu học ",
    "learning": " tiếng Anh học ",
    "subject": " môn học phân loại ",
    "nature": " động thực vật ",
    "life": " sống hằng ngày ",
    "arts": " nghệ thuật thể loại viết ",
    "media": " phương tiện ghi hình và âm thanh biến thể của | cười ",
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
                "desc": "%s · %d Từ(đã nghĩa của cái gì đó %d)"
                % (CAT_LABEL[cat], len(words), sum(1 for w in words if w.get("meaning"))),
                "count": len(words),
                "defined": sum(1 for w in words if w.get("meaning")),
                "preview": preview,
                "dataFile": browse_path,
            }
        )
        print("%s/%s %d words" % (cat, sid, len(words)))

    catalog = {
        "sourceNote": " mở phân loại biến thể cũ của | bề mặt bên ngoài tái bản xem lướt nhà kho; tạm thời không ngậm trong miệng nhỏ môn học/kiểm tra ",
        "categories": categories,
        "themes": themes,
    }
    with open(os.path.join(OUT, "themes.json"), "w", encoding="utf-8") as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print("themes", len(themes), "words", total, "defined", with_meaning)


if __name__ == "__main__":
    main()
