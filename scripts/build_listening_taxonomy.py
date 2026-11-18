#!/usr/bin/env python3
"""Build library/listening-taxonomy.json from Desktop Excel + local Cambridge HTML."""
from __future__ import annotations

import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from verify_cambridge_mock_pages import load_test # noqa: E402

TYPE_XLSX = Path("/Users/frankman/Desktop/ IELTS Listening đề mục phân loại.xlsx")
SCENE_XLSX = Path("/Users/frankman/Desktop/ IELTS Listening đề mục tình cảnh phân loại.xlsx")
OUT = ROOT / "library" / "listening-taxonomy.json"
LISTEN_DIR = ROOT / "library" / "mock" / "cambridge-listening"

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
REL_NS = {"r": "http://schemas.openxmlformats.org/package/2006/relationships"}

TYPE_ORDER = [" Điền vào chỗ trống ", " Nối thông tin ", " Chọn một đáp án ", " Chọn nhiều đáp án ", " Dán nhãn bản đồ ", " quá trình câu ", " Trả lời ngắn "]
SCENE_ORDER = [
    " tìm việc ", " quản lý kinh doanh ", " Địa lý ", " du lịch ", " sinh hoạt hàng ngày ", " kiến trúc Môi trường ", " Sức khỏe chữa bệnh ",
    " dừng chân ", " vận động ", " đồ thư quán ", " bảo hiểm ", " tân sinh Nhập học ", " bài tập thảo luận ", " nhân văn xã khoa ",
    " Sinh học ", " đầu đề nghiên cứu ",
]
TYPE_ALIASES = {
    " lấp chỗ trống ": " Điền vào chỗ trống ", " Điền vào chỗ trống ": " Điền vào chỗ trống ", "form": " Điền vào chỗ trống ", "notes": " Điền vào chỗ trống ", "table": " Điền vào chỗ trống ",
    " ghép thành đôi ": " Nối thông tin ", " Nối thông tin ": " Nối thông tin ", "matching": " Nối thông tin ",
    " đơn tuyển ": " Chọn một đáp án ", " Chọn một đáp án ": " Chọn một đáp án ", " Trắc nghiệm ": " Chọn một đáp án ",
    " nhiều chọn ": " Chọn nhiều đáp án ", " Chọn nhiều đáp án ": " Chọn nhiều đáp án ",
    " Bản đồ ": " Dán nhãn bản đồ ", " Dán nhãn bản đồ ": " Dán nhãn bản đồ ", "map": " Dán nhãn bản đồ ",
    " quá trình ": " quá trình câu ", " quá trình câu ": " quá trình câu ", "flowchart": " quá trình câu ", "flow chart": " quá trình câu ",
    " giản đáp ": " Trả lời ngắn ", " Trả lời ngắn ": " Trả lời ngắn ", "sentence": " Trả lời ngắn ",
}
DIFF_ALIASES = {" Dễ ": " Dễ ", " Vừa ": " Vừa ", " Khó ": " Khó ", "easy": " Dễ ", "medium": " Vừa ", "hard": " Khó "}


def col_row(ref: str):
    col, row = "", ""
    for ch in ref:
        if ch.isdigit():
            row += ch
        else:
            col += ch
    return col, int(row) if row else 0


def col_index(col: str) -> int:
    n = 0
    for ch in col:
        n = n * 26 + (ord(ch.upper()) - 64)
    return n - 1


def load_workbook(path: Path) -> dict[str, list[list[str]]]:
    with zipfile.ZipFile(path) as z:
        ss = []
        if "xl/sharedStrings.xml" in z.namelist():
            root = ET.fromstring(z.read("xl/sharedStrings.xml"))
            for si in root.findall("m:si", NS):
                ss.append("".join(t.text or "" for t in si.findall(".//m:t", NS)))
        wb = ET.fromstring(z.read("xl/workbook.xml"))
        rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        rid_to_target = {}
        for rel in rels:
            rid = rel.attrib.get("Id") or rel.attrib.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id")
            target = rel.attrib.get("Target")
            if rid and target:
                rid_to_target[rid] = target.lstrip("/")
        sheets = {}
        for sh in wb.findall("m:sheets/m:sheet", NS):
            name = sh.attrib.get("name") or "Sheet"
            rid = sh.attrib.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id")
            target = rid_to_target.get(rid, "")
            if not target:
                continue
            if not target.startswith("xl/"):
                target = "xl/" + target
            xml = ET.fromstring(z.read(target))
            cells = defaultdict(dict)
            max_row, max_col = 0, 0
            for c in xml.findall(".//m:c", NS):
                ref = c.attrib.get("r", "")
                col, row = col_row(ref)
                if not row:
                    continue
                t = c.attrib.get("t")
                if t == "inlineStr":
                    val = "".join(x.text or "" for x in c.findall(".//m:t", NS))
                else:
                    v = c.find("m:v", NS)
                    if v is None or v.text is None:
                        val = ""
                    elif t == "s":
                        val = ss[int(v.text)] if v.text.isdigit() and int(v.text) < len(ss) else v.text
                    else:
                        val = v.text
                ci = col_index(col)
                cells[row][ci] = str(val).strip()
                max_row = max(max_row, row)
                max_col = max(max_col, ci)
            rows = []
            for r in range(1, max_row + 1):
                rows.append([cells[r].get(c, "") for c in range(max_col + 1)])
            sheets[name] = rows
    return sheets


def dump_preview(path: Path, sheets: dict) -> None:
    print("===", path.name, "===")
    for name, rows in sheets.items():
        print(" sheet", repr(name), "rows", len(rows))
        for i, row in enumerate(rows[:6]):
            print(" ", i + 1, row[:12])


def norm_header(h: str) -> str:
    return re.sub(r"\s+", "", (h or "").lower())


def pick_col(headers: list[str], *needles: str) -> int | None:
    nh = [norm_header(h) for h in headers]
    for needle in needles:
        n = norm_header(needle)
        for i, h in enumerate(nh):
            if n and n in h:
                return i
    return None


def parse_volume(raw: str) -> str:
    s = str(raw or "").strip()
    m = re.search(r"(?: Cambridge?|cam(?:bridge)?|c)\s*(\d{1,2})", s, re.I)
    if m:
        return str(int(m.group(1)))
    m = re.search(r"^(\d{1,2})(?:\.0)?$", s)
    return str(int(m.group(1))) if m else ""


def parse_test(raw: str) -> str:
    s = str(raw or "").strip()
    m = re.search(r"(?:test|t)\s*(\d)", s, re.I)
    if m:
        return m.group(1)
    m = re.search(r"^(\d)(?:\.0)?$", s)
    return m.group(1) if m else ""


def parse_part(raw: str) -> int:
    s = str(raw or "").strip()
    # ponytail: passage before p so "Passage 2" is not p + assage
    m = re.search(r"(?:passage|part|section|s|p)\s*(\d)", s, re.I)
    if m:
        return int(m.group(1))
    m = re.search(r"^(\d)(?:\.0)?$", s)
    return int(m.group(1)) if m else 0


def parse_q_range(a: str, b: str = "") -> tuple[int, int]:
    blob = " ".join([str(a or ""), str(b or "")])
    # ponytail: require Q so "Test 1 Part 2" is not Q1–2
    m = re.search(r"Q\s*(\d+)\s*[-–—~ đến đến]\s*(\d+)", blob, re.I)
    if m:
        return int(m.group(1)), int(m.group(2))
    m = re.search(r"Q\s*(\d+)\b", blob, re.I)
    if m:
        n = int(m.group(1))
        return n, n
    return 0, 0


def parse_q_from_row(row: list[str], i_from, i_to, i_range, i_title) -> tuple[int, int]:
    if i_from is not None and i_to is not None:
        a, b = parse_q_range(row[i_from], row[i_to])
        if a:
            return a, b or a
    if i_range is not None:
        a, b = parse_q_range(row[i_range])
        if a:
            return a, b or a
    if i_title is not None:
        a, b = parse_q_range(row[i_title])
        if a:
            return a, b or a
    blob = " ".join(row)
    return parse_q_range(blob)


def norm_type(raw: str) -> str:
    s = str(raw or "").strip()
    if not s:
        return ""
    key = re.sub(r"\s+", "", s).lower()
    if key in TYPE_ALIASES:
        return TYPE_ALIASES[key]
    for k, v in TYPE_ALIASES.items():
        if k in key or k in s:
            return v
    return s if s.endswith(" câu ") else (s + " câu " if s else "")


def norm_scene(raw: str) -> str:
    s = re.sub(r"\s+", "", str(raw or "").strip())
    return s


def norm_diff(raw: str) -> str:
    s = str(raw or "").strip()
    if not s:
        return ""
    key = re.sub(r"\s+", "", s).lower()
    return DIFF_ALIASES.get(key) or DIFF_ALIASES.get(s) or (s if s in (" Dễ ", " Vừa ", " Khó ") else "")


def find_header(rows: list[list[str]]) -> tuple[int, list[str]]:
    for i, row in enumerate(rows[:8]):
        joined = "".join(row)
        if " Cambridge hàng loạt " in joined or " đề hình " in joined or (" khoa mục " in joined and " câu số " in joined):
            return i, row
    return -1, [" khoa mục ", " câu số ", " Cambridge hàng loạt "]


def map_row(row: list[str], headers: list[str]) -> dict | None:
    i_vol = pick_col(headers, " quyển ", " Cambridge ", "volume", "book", "cam")
    i_test = pick_col(headers, "test", " bộ câu ", " bài thi ")
    i_part = pick_col(headers, "part", "section", " bộ phận ")
    i_from = pick_col(headers, " lúc đầu ", " câu số nảy sinh ", "from", "qfrom", " Bắt đầu câu ")
    i_to = pick_col(headers, " chấm dứt ", " câu số dừng lại ", "to", "qto", " chấm dứt câu ")
    i_range = pick_col(headers, " câu số ", " đề mục ", " phạm vi ", "questions")
    i_title = pick_col(headers, " tiêu đề ", " tên ", " Luyện tập ")
    i_type = pick_col(headers, " đề hình ", " câu loại ", "type")
    i_scene = pick_col(headers, " tình cảnh ", "scene", " chủ đề ", " chủ đề ")
    i_diff = pick_col(headers, " độ khó ", " khó dễ ", "diff")

    vol = parse_volume(row[i_vol] if i_vol is not None and i_vol < len(row) else "")
    test = parse_test(row[i_test] if i_test is not None and i_test < len(row) else "")
    part = parse_part(row[i_part] if i_part is not None and i_part < len(row) else "")
    if not vol or not test:
        # try whole row, e.g. "Cambridge 21 Test1 Part1 Q1-6"
        blob = " ".join(row)
        vol = vol or parse_volume(blob)
        test = test or parse_test(blob)
        part = part or parse_part(blob)
    if not vol or not test or not part:
        return None
    q_from, q_to = parse_q_from_row(
        row,
        i_from if i_from is not None else None,
        i_to if i_to is not None else None,
        i_range if i_range is not None else None,
        i_title if i_title is not None else None,
    )
    qtype = norm_type(row[i_type] if i_type is not None and i_type < len(row) else "")
    scene = norm_scene(row[i_scene] if i_scene is not None and i_scene < len(row) else "")
    diff = norm_diff(row[i_diff] if i_diff is not None and i_diff < len(row) else "")
    return {
        "volume": vol,
        "test": test,
        "part": part,
        "qFrom": q_from,
        "qTo": q_to or q_from,
        "qType": qtype,
        "scene": scene,
        "diff": diff,
    }


def parse_book(path: Path) -> tuple[list[dict], list[str]]:
    sheets = load_workbook(path)
    dump_preview(path, sheets)
    items = []
    notes = []
    for name, rows in sheets.items():
        if not rows:
            continue
        header_i, headers = find_header(rows)
        start = 0 if header_i < 0 else header_i + 1
        notes.append("%s header@%s %s" % (name, header_i + 1, headers[:10]))
        parsed_n = 0
        for row in rows[start:]:
            if not any(str(c).strip() for c in row):
                continue
            rec = map_row(row, headers)
            if not rec:
                continue
            rec["_sheet"] = name
            if name in SCENE_ORDER and not rec["scene"]:
                rec["scene"] = name
            if name in TYPE_ORDER and not rec["qType"]:
                rec["qType"] = name
            items.append(rec)
            parsed_n += 1
        notes.append("%s parsed %s" % (name, parsed_n))
    return items, notes


def html_groups() -> dict[tuple, list[tuple[int, int]]]:
    out = {}
    for path in sorted(LISTEN_DIR.glob("cambridge-*-test-*.html")):
        m = re.search(r"cambridge-(\d+)-test-(\d+)\.html$", path.name)
        if not m:
            continue
        vol, test = m.group(1), m.group(2)
        try:
            data = load_test(path)
        except Exception as e:
            print("WARN html", path.name, e)
            continue
        for sec in data.get("sections") or []:
            sid = int(sec.get("id") or 0)
            ranges = []
            for g in sec.get("groups") or []:
                nos = [int(q["no"]) for q in (g.get("questions") or []) if q.get("no") is not None]
                if nos:
                    ranges.append((min(nos), max(nos)))
            out[(vol, test, sid)] = ranges
    return out


def group_id(vol, test, part, q_from, q_to) -> str:
    return "cambridge-%s-test-%s-s%s-q%s-%s" % (vol, test, part, q_from, q_to)


def part_id(vol, test, part) -> str:
    return "cambridge-%s-test-%s-s%s" % (vol, test, part)


def unique_keep_order(items: list[str], preferred: list[str]) -> list[str]:
    seen = set()
    out = []
    for x in preferred:
        if x and x not in seen:
            seen.add(x)
            out.append(x)
    for x in items:
        if x and x not in seen:
            seen.add(x)
            out.append(x)
    return out


def main() -> None:
    if not TYPE_XLSX.exists():
        raise SystemExit("missing " + str(TYPE_XLSX))
    if not SCENE_XLSX.exists():
        raise SystemExit("missing " + str(SCENE_XLSX))

    type_rows, type_notes = parse_book(TYPE_XLSX)
    scene_rows, scene_notes = parse_book(SCENE_XLSX)
    print("TYPE notes:", type_notes)
    print("SCENE notes:", scene_notes)
    print("type rows", len(type_rows), "scene rows", len(scene_rows))
    if type_rows:
        print("type sample", {k: type_rows[0][k] for k in type_rows[0] if k!= "_headers"})
    if scene_rows:
        print("scene sample", {k: scene_rows[0][k] for k in scene_rows[0] if k!= "_headers"})

    html = html_groups()
    groups = []
    seen_g = set()
    skip_no_html = []
    for rec in type_rows:
        vol, test, part = rec["volume"], rec["test"], rec["part"]
        q_from, q_to = rec["qFrom"], rec["qTo"]
        if not q_from:
            # đề hình Luyện tập must have a range; skip empty
            continue
        key = (vol, test, part)
        if key not in html:
            skip_no_html.append("%s T%s P%s" % (vol, test, part))
            continue
        gid = group_id(vol, test, part, q_from, q_to)
        if gid in seen_g:
            continue
        seen_g.add(gid)
        groups.append({
            "id": gid,
            "parentId": "cambridge-%s-test-%s" % (vol, test),
            "volume": vol,
            "test": test,
            "part": part,
            "qFrom": q_from,
            "qTo": q_to,
            "qType": rec["qType"] or " Điền vào chỗ trống ",
            "scene": rec["scene"],
            "diff": rec["diff"],
        })

    # scene map: part-level. Prefer scene workbook; fill from type rows if missing.
    scene_of = {}
    for rec in scene_rows:
        key = (rec["volume"], rec["test"], rec["part"])
        sc = rec["scene"]
        # ponytail: first sheet wins; Excel duplicates used to overwrite
        if sc and key not in scene_of:
            scene_of[key] = sc
    for rec in type_rows:
        key = (rec["volume"], rec["test"], rec["part"])
        if rec["scene"] and key not in scene_of:
            scene_of[key] = rec["scene"]
        # also stamp scene onto groups
    for g in groups:
        key = (g["volume"], g["test"], g["part"])
        if not g.get("scene") and key in scene_of:
            g["scene"] = scene_of[key]

    parts = []
    seen_p = set()
    for key, sc in scene_of.items():
        vol, test, part = key
        if key not in html:
            continue
        pid = part_id(vol, test, part)
        if pid in seen_p:
            continue
        seen_p.add(pid)
        parts.append({
            "id": pid,
            "parentId": "cambridge-%s-test-%s" % (vol, test),
            "volume": vol,
            "test": test,
            "part": part,
            "scene": sc,
        })
    parts.sort(key=lambda p: (-int(p["volume"]), int(p["test"]), p["part"]))
    groups.sort(key=lambda g: (-int(g["volume"]), int(g["test"]), g["part"], g["qFrom"]))

    types = unique_keep_order([g["qType"] for g in groups], TYPE_ORDER)
    scenes = unique_keep_order([p["scene"] for p in parts] + [g["scene"] for g in groups], SCENE_ORDER)

    payload = {
        "types": types,
        "scenes": scenes,
        "diffs": [" Dễ ", " Vừa ", " Khó "],
        "groups": groups,
        "parts": parts,
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("wrote", OUT, "groups", len(groups), "parts", len(parts), "types", types, "scenes", scenes)
    if skip_no_html:
        uniq = sorted(set(skip_no_html))
        print("skip no html", len(uniq), uniq[:20])


if __name__ == "__main__":
    main()
