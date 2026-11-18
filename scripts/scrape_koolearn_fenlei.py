#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Scrape Koolearn fenlei/tag word lists into local JSON for YYSD thematic bank.

Headwords are public dictionary lemmas. We re-chunk + lightly filter for IELTS product use.
Outputs under library/study/vocab-themes/raw/
"""
from __future__ import annotations

import json
import os
import random
import re
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from html import unescape

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "library", "study", "vocab-themes", "raw")
CACHE = os.path.join(OUT, "wd_cache")

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
BASE = "https://www.koolearn.com"

# L1 from Koolearn sidebar (skip ngành sản xuất phân loại for now — user asked these)
CATALOG = [
    {
        "id": "exam",
        "label": " Tiếng Anh cuộc thi ",
        "subs": [
            ("cet4", "CET-4 cuộc thi ", "https://www.koolearn.com/dict/fenlei_2_52_1.html"),
            ("cet6", "CET-6 cuộc thi ", "https://www.koolearn.com/dict/fenlei_2_53_1.html"),
            ("tem", " Chuyên ngữ B2 Chuyên ngữ C1 cuộc thi ", "https://www.koolearn.com/dict/fenlei_2_56_1.html"),
            ("kaoyan", " Sau đại học ", "https://www.koolearn.com/dict/fenlei_2_60_1.html"),
            ("gaokao", " kỳ thi Đại Học ", "https://www.koolearn.com/dict/fenlei_2_63_1.html"),
            ("bec_book", "BEC Từ vựng sách ", "https://www.koolearn.com/dict/fenlei_2_93_1.html"),
            ("gmat_book", "GMAT Từ vựng sách ", "https://www.koolearn.com/dict/fenlei_2_94_1.html"),
            ("gre_book", "GRE Từ vựng sách ", "https://www.koolearn.com/dict/fenlei_2_95_1.html"),
            ("sat_book", "SAT Từ vựng sách ", "https://www.koolearn.com/dict/fenlei_2_96_1.html"),
            ("toeic_book", " TOEIC cuộc thi Từ vựng sách ", "https://www.koolearn.com/dict/fenlei_2_101_1.html"),
            ("toefl_book", " TOEFL Từ vựng sách ", "https://www.koolearn.com/dict/fenlei_2_102_1.html"),
            ("ielts_book", " Từ vựng IELTS sách ", "https://www.koolearn.com/dict/fenlei_2_105_1.html"),
        ],
    },
    {
        "id": "abroad",
        "label": " ra nước ngoài học ",
        "subs": [
            ("bec", "BEC", "https://www.koolearn.com/dict/fenlei_3_64_1.html"),
            ("gmat", "GMAT cuộc thi ", "https://www.koolearn.com/dict/fenlei_3_65_1.html"),
            ("gre", "GRE cuộc thi ", "https://www.koolearn.com/dict/fenlei_3_66_1.html"),
            ("sat", "SAT cuộc thi ", "https://www.koolearn.com/dict/fenlei_3_67_1.html"),
            ("toeic", " TOEIC cuộc thi ", "https://www.koolearn.com/dict/fenlei_3_68_1.html"),
            ("toefl", " TOEFL cuộc thi ", "https://www.koolearn.com/dict/fenlei_3_69_1.html"),
            ("ielts", " IELTS cuộc thi ", "https://www.koolearn.com/dict/fenlei_3_70_1.html"),
        ],
    },
    {
        "id": "k12",
        "label": " Vừa tiểu học ",
        "subs": [
            ("junior", " sơ trung ", "https://www.koolearn.com/dict/fenlei_4_71_1.html"),
            ("primary", " tiểu học ", "https://www.koolearn.com/dict/fenlei_4_72_1.html"),
            ("senior", " THPT ", "https://www.koolearn.com/dict/fenlei_4_73_1.html"),
        ],
    },
    {
        "id": "learning",
        "label": " Tiếng Anh Học tập ",
        "subs": [
            ("nce", " mới khái niệm ", "https://www.koolearn.com/dict/fenlei_5_77_1.html"),
            ("collins", " Collins Tinh cấp Từ vựng ", "https://www.koolearn.com/dict/fenlei_5_78_1.html"),
            ("oxford3000", " ngưu tân 3000 từ", "https://www.koolearn.com/dict/fenlei_5_79_1.html"),
            ("phrases", " Cụm từ ", "https://www.koolearn.com/dict/fenlei_5_80_1.html"),
        ],
    },
    {
        "id": "subject",
        "label": " ngành học phân loại ",
        "subs": [
            ("chem", " Hóa học ", "https://www.koolearn.com/dict/fenlei_6_13_1.html"),
            ("geo", " địa lý học ", "https://www.koolearn.com/dict/fenlei_6_14_1.html"),
            ("math", " Toán học ", "https://www.koolearn.com/dict/fenlei_6_15_1.html"),
            ("phys", " Vật lý ", "https://www.koolearn.com/dict/fenlei_6_16_1.html"),
        ],
    },
    {
        "id": "nature",
        "label": " động thực vật ",
        "subs": [
            ("animals", " thế giới động vật ", "https://www.koolearn.com/dict/fenlei_7_11_1.html"),
            ("plants", " Thực vật vương quốc ", "https://www.koolearn.com/dict/fenlei_7_12_1.html"),
        ],
    },
    {
        "id": "life",
        "label": " sinh hoạt Đời sống ",
        "subs": [
            ("food", " ăn uống chơi đùa ", "https://www.koolearn.com/dict/fenlei_8_23_1.html"),
            ("urban", " Đô thị quy hoạch ", "https://www.koolearn.com/dict/fenlei_8_24_1.html"),
            ("travel", " an toàn Di chuyển ", "https://www.koolearn.com/dict/fenlei_8_25_1.html"),
            ("edu", " Khoa học & Giáo dục hứng nước ", "https://www.koolearn.com/dict/fenlei_8_29_1.html"),
            ("work", " Nghề nghiệp Công sở ", "https://www.koolearn.com/dict/fenlei_8_30_1.html"),
            ("festivals", " Lễ hội ", "https://www.koolearn.com/dict/fenlei_8_83_1.html"),
        ],
    },
    {
        "id": "arts",
        "label": " Nghệ thuật văn thể ",
        "subs": [
            ("literature", " Văn học Nghệ thuật ", "https://www.koolearn.com/dict/fenlei_9_31_1.html"),
            ("sports", " Thể thao ", "https://www.koolearn.com/dict/fenlei_9_32_1.html"),
            ("games", " Trò chơi giải trí ", "https://www.koolearn.com/dict/fenlei_9_34_1.html"),
        ],
    },
    {
        "id": "media",
        "label": " ảnh âm nghe nhìn ",
        "subs": [
            ("film", " Điện ảnh & Truyền hình kịch ", "https://www.koolearn.com/dict/fenlei_10_17_1.html"),
            ("music", " Âm nhạc Phát thanh ", "https://www.koolearn.com/dict/fenlei_10_18_1.html"),
        ],
    },
]


def fetch(url: str, retries: int = 3) -> str:
    last = None
    for i in range(retries):
        try:
            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": UA,
                    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
                    "Accept": "text/html,application/xhtml+xml",
                },
            )
            with urllib.request.urlopen(req, timeout=40) as r:
                return r.read().decode("utf-8", "ignore")
        except Exception as e:
            last = e
            time.sleep(0.8 * (i + 1) + random.random() * 0.4)
    raise RuntimeError("fetch failed %s: %s" % (url, last))


def left_content(html: str) -> str:
    m = re.search(r'<div class="left-content">([\s\S]*?)(?:<div class="right-content">|$)', html)
    return m.group(1) if m else ""


def fenlei_tags(html: str):
    left = left_content(html)
    pairs = re.findall(
        r'<div class="word-title">\s*([^<]+?)\s*<a class="word-more" href="/dict/tag_(\d+)_\d+\.html">\s* thêm nữa \s*</a>',
        left,
    )
    out = []
    seen = set()
    for title, tid in pairs:
        tid = int(tid)
        if tid in seen:
            continue
        seen.add(tid)
        out.append({"tag_id": tid, "title": unescape(title).strip()})
    return out


def tag_page_words(html: str):
    # prefer left-content word-box
    left = left_content(html) or html
    words = []
    ids = []
    for m in re.finditer(r'href="/dict/wd_(\d+)\.html"[^>]*class="word"[^>]*>([^<]+)<', left):
        ids.append(int(m.group(1)))
        words.append(unescape(m.group(2)).strip())
    if not words:
        for m in re.finditer(r'class="word"[^>]*href="/dict/wd_(\d+)\.html"[^>]*>([^<]+)<', left):
            ids.append(int(m.group(1)))
            words.append(unescape(m.group(2)).strip())
    if not words:
        for m in re.finditer(r'href="/dict/wd_(\d+)\.html"[^>]*>([^<]+)<', left):
            w = unescape(m.group(2)).strip()
            if re.match(r"^[A-Za-z][A-Za-z0-9\-'./\s]{0,60}$", w):
                ids.append(int(m.group(1)))
                words.append(w)
    return list(zip(ids, words))


def scrape_tag(tag_id: int, title: str, max_pages: int = 80):
    items = []
    seen = set()
    for page in range(1, max_pages + 1):
        url = "%s/dict/tag_%d_%d.html" % (BASE, tag_id, page)
        html = fetch(url)
        pairs = tag_page_words(html)
        if not pairs:
            break
        new = 0
        for wid, word in pairs:
            key = word.lower()
            if key in seen:
                continue
            seen.add(key)
            items.append({"word": word, "wd_id": wid})
            new += 1
        print(" tag %s p%d +%d (total %d)" % (tag_id, page, new, len(items)))
        if new == 0:
            break
        time.sleep(0.25 + random.random() * 0.2)
    return {"tag_id": tag_id, "title": title, "words": items}


def parse_wd(html: str):
    ipa = ""
    m = re.search(r'class="word-spell"[^>]*>\s* Anh \s*\[([^\]]+)\]', html)
    if not m:
        m = re.search(r" Anh \s*\[([^\]]+)\]", html)
    if m:
        ipa = "/" + m.group(1).strip() + "/"
    else:
        m = re.search(r'class="word-spell"[^>]*>\s* Mỹ \s*\[([^\]]+)\]', html)
        if not m:
            m = re.search(r" Mỹ \s*\[([^\]]+)\]", html)
        if m:
            ipa = "/" + m.group(1).strip() + "/"

    meaning = ""
    pos = ""
    i = html.find(" là có ý gì </div>")
    chunk = html[i: i + 4000] if i >= 0 else html

    # A: standard prop + span glosses
    m = re.search(
        r'<span class="prop">([^<]+)</span>\s*<p>((?:<span>[^<]*</span>)+)</p>',
        chunk,
    )
    if m:
        pos = unescape(m.group(1)).strip().rstrip(".")
        if pos and not pos.endswith("."):
            pos = pos + "."
        spans = re.findall(r"<span>([^<]*)</span>", m.group(2))
        meaning = "; ".join(unescape(s).strip(";;,, ") for s in spans if s.strip())
        meaning = re.sub(r"[;]{2,}", "; ", meaning).strip(";; ")

    # B: dictionary sense lines like <strong>[C] hồ, hồ ly </strong>
    if not meaning:
        senses = re.findall(r"<strong>\[[A-Za-z]+\]\s*([^<]+)</strong>", chunk)
        if not senses:
            senses = re.findall(r"<strong>\[[A-Za-z]+\]\s*([^<]+)</strong>", html)
        if senses:
            cleaned = []
            for s in senses[:6]:
                s = unescape(s).strip()
                # drop trailing English gloss after CJK
                s = re.split(r"\s{2,}|\b[a-z]{3,}\b", s, maxsplit=1)[0].strip(",,;; ")
                # keep CJK-leading glosses
                if re.search(r"[\u4e00-\u9fff]", s):
                    # cut at first long latin run
                    s = re.sub(r"[A-Za-z].*$", "", s).strip(",,;; ")
                    if s:
                        cleaned.append(s)
            if cleaned:
                meaning = "; ".join(cleaned)
                if not pos:
                    pos = "n."

    # C: name-meaning pages
    if not meaning:
        m = re.search(r" tên Nghĩa: </label><span>([^<]+)</span>", chunk)
        if m and re.search(r"[\u4e00-\u9fff]", m.group(1)):
            meaning = unescape(m.group(1)).strip()

    # D: first Tiếng Việt Chính tả is usually a name — skip unless nothing else
    if not meaning:
        m = re.search(r" Tiếng Việt Chính tả: </label><span>([^<]*[\u4e00-\u9fff][^<]*)</span>", chunk)
        if m:
            meaning = unescape(m.group(1)).strip()

    return {"ipa": ipa, "pos": pos, "meaning": meaning}


def enrich_one(wd_id: int):
    path = os.path.join(CACHE, "%d.json" % wd_id)
    if os.path.isfile(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    url = "%s/dict/wd_%d.html" % (BASE, wd_id)
    try:
        html = fetch(url)
        data = parse_wd(html)
    except Exception as e:
        data = {"ipa": "", "pos": "", "meaning": "", "error": str(e)}
    data["wd_id"] = wd_id
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)
    return data


def enrich_words(words, workers: int = 6, limit: int = 0):
    os.makedirs(CACHE, exist_ok=True)
    todo = words if not limit else words[:limit]
    need = [w for w in todo if w.get("wd_id") and not os.path.isfile(os.path.join(CACHE, "%d.json" % w["wd_id"]))]
    print(" enrich: %d cached-miss / %d" % (len(need), len(todo)))
    done = 0
    with ThreadPoolExecutor(max_workers=workers) as ex:
        futs = {ex.submit(enrich_one, w["wd_id"]): w for w in need}
        for fut in as_completed(futs):
            done += 1
            if done % 50 == 0:
                print(" enriched %d/%d" % (done, len(need)))
            time.sleep(0.05)
    # merge
    for w in todo:
        path = os.path.join(CACHE, "%d.json" % w["wd_id"])
        if not os.path.isfile(path):
            continue
        with open(path, "r", encoding="utf-8") as f:
            d = json.load(f)
        w["ipa"] = d.get("ipa") or ""
        w["pos"] = d.get("pos") or ""
        w["meaning"] = d.get("meaning") or ""
    return todo


def keep_word(word: str) -> bool:
    w = word.strip()
    if len(w) < 2 or len(w) > 48:
        return False
    if not re.search(r"[A-Za-z]", w):
        return False
    # drop pure initials / junk
    if re.fullmatch(r"[A-Z]{2,5}", w):
        return False
    return True


def scrape_all(enrich_priority=None, enrich_limit_per_sub=0):
    os.makedirs(OUT, exist_ok=True)
    os.makedirs(CACHE, exist_ok=True)
    enrich_priority = set(enrich_priority or [])
    catalog = {"source": "koolearn fenlei", "categories": []}

    for cat in CATALOG:
        cat_out = {"id": cat["id"], "label": cat["label"], "subs": []}
        print("==", cat["label"])
        for sid, label, url in cat["subs"]:
            print(" --", label, url)
            try:
                html = fetch(url)
            except Exception as e:
                print(" FAIL fenlei", e)
                continue
            tags = fenlei_tags(html)
            if not tags:
                print(" no tags in left-content")
                continue
            sub_words = []
            tag_dumps = []
            for t in tags:
                dump = scrape_tag(t["tag_id"], t["title"])
                tag_dumps.append({"tag_id": t["tag_id"], "title": t["title"], "count": len(dump["words"])})
                for w in dump["words"]:
                    if keep_word(w["word"]):
                        sub_words.append(w)
            # dedupe preserve order
            seen = set()
            deduped = []
            for w in sub_words:
                k = w["word"].lower()
                if k in seen:
                    continue
                seen.add(k)
                deduped.append(w)

            if sid in enrich_priority or cat["id"] in enrich_priority:
                enrich_words(deduped, workers=5, limit=enrich_limit_per_sub or 0)

            sub = {
                "id": sid,
                "label": label,
                "url": url,
                "tags": tag_dumps,
                "count": len(deduped),
                "words": deduped,
            }
            path = os.path.join(OUT, "%s__%s.json" % (cat["id"], sid))
            with open(path, "w", encoding="utf-8") as f:
                json.dump(sub, f, ensure_ascii=False, indent=2)
                f.write("\n")
            print(" saved", path, "words", len(deduped))
            cat_out["subs"].append(
                {"id": sid, "label": label, "count": len(deduped), "file": os.path.basename(path), "tags": tag_dumps}
            )
            time.sleep(0.3)
        catalog["categories"].append(cat_out)

    with open(os.path.join(OUT, "catalog.json"), "w", encoding="utf-8") as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print("wrote catalog", os.path.join(OUT, "catalog.json"))
    return catalog


if __name__ == "__main__":
    import argparse

    ap = argparse.ArgumentParser()
    ap.add_argument("--enrich", default="abroad,ielts,toefl,gre,sat,gmat,bec,toeic,cet4,cet6,kaoyan",
                    help="comma ids: category or sub id to enrich with meanings")
    ap.add_argument("--enrich-limit", type=int, default=0, help="0=all words in selected subs")
    ap.add_argument("--words-only", action="store_true")
    args = ap.parse_args()
    prio = [] if args.words_only else [x.strip() for x in args.enrich.split(",") if x.strip()]
    scrape_all(enrich_priority=prio, enrich_limit_per_sub=args.enrich_limit)
