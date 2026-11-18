#!/usr/bin/env python3
""" cho viết tắt của Tân Cương TOEFL ngân hàng câu hỏi ngoại tuyến sửa phân tích/văn bản dịch viết đi vào *_draft ), lấy mẫu hoàng hậu lại thăng chức làm trang trọng ) 

cách dùng: 
  python3 scripts/build_toefl_analysis_drafts.py --file app/library/toefl/bank-cw-reading.json --limit 20
  ... --dry-run          chỉ đóng dấu, không bỏ sót đĩa(nhân tạo lấy mẫu sử dụng)
  ... --review           đóng dấu đã viết đi vào của *_draft cung cấp lấy mẫu
  ... --promote          hãy *_draft nhân bản thành công trang trọng )
Key đi kho hàng tồn tại thoả thuận: server/.env(thấy build_listen_sidecars.py của load_env) 
"""
import argparse
import json
import os
import re
import shutil
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"


def load_env():
    env = ROOT / "server" / ".env"
    if not env.exists():
        return
    for line in env.read_text().splitlines():
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def qwen_json(system, user):
    key = os.environ.get("DASHSCOPE_API_KEY") or ""
    if not key:
        raise SystemExit("DASHSCOPE_API_KEY missing(server/.env biến thể của | cũng không có)")
    body = {
        "model": os.environ.get("QWEN_MODEL") or "qwen-plus",
        "temperature": 0,
        "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
    }
    req = urllib.request.Request(
        URL,
        data=json.dumps(body).encode(),
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=180) as resp:
        raw = json.loads(resp.read().decode())
    text = raw["choices"][0]["message"]["content"].strip()
    text = re.sub(r"^```[a-zA-Z]*\n?|\n?```$", "", text).strip()
    return json.loads(text)


def blanks_of(task):
    return [p for p in (task.get("passage") or []) if p and p.get("id") is not None]


def passage_view(task):
    """ khôi phục về trạng thái ban đầu thành công lấp hoặc nhồi tốt của toàn bộ đoạn: mô hình không cần biến thể của | chữ cái mảnh đoán biến thể cũ của |, chỉ giải thích tại sao? là này biến thể cũ của | này bề ngoài """
    out = []
    for p in task.get("passage") or []:
        if not p:
            continue
        if p.get("id") is not None:
            word = p.get("word") or ((p.get("prefix") or "") + (p.get("answer") or ""))
            out.append(f" {p['id']} {word}")
        else:
            out.append(p.get("t", ""))
    return "".join(out)


SYSTEM = (
    " bạn là viết tắt của Tân Cương TOEFL Complete the Words(chữ cái đầu/một nửa biến thể cũ của | lấp chỗ trống công việc)của giáo viên "
    " nêu ra trước toàn bộ đoạn nguyên văn biến thể cũ của mỗi dùng trong | trống không của chỉ ra, xuất khẩu: translation(toàn bộ đoạn ngôn ngữ Trung Quốc văn bản dịch)và items(mỗi dùng trong | trống không một dải ngôn ngữ Trung Quốc phân tích) "
    "translation Yêu cầu: kết nối của bằng văn bản ngôn ngữ Trung Quốc, đừng! xuất hiện bất kỳ đánh số, dấu ngoặc vuông, gạch dưới _, tiếng Anh trước đây biến thể cũ của | có thể chú thích; "
    " trống cư trú trực tiếp nhấn hoàn chỉnh biến thể cũ của | dịch đi ra, đừng! biến thể cũ của biến thể của vị trí "
    "analysis Yêu cầu: tối đa vài lời; trước thuyết phục cú pháp vai trò quyết định của loại từ/bề ngoài, lại cho một dải từ ghép có thể ghép đôi bằng chứng, cuối cùng cho nghĩa của một từ; "
    " chỉ viết bạn có nắm bắt của biến thể của một dải mang tính quyết định lý do; "
    " cấm xuất hiện«Gợi ý»«____»«bẻ gãy hoặc cắt làm đôi»«chăn cắt đứt»đợi thảo luận chủ đề hình dạng khuôn mặt loại của đơn vị tiền tệ từ ngữ, cấm biến thể của | giấy thi cho đi ra của phần chữ cái đẩy từ ghép, "
    " cấm lặp lại câu trả lời chuỗi xem như lý do, cấm viết«theo nguyên văn» "
    'chỉ xuất khẩu JSON mục tiêu: {"translation":"...","items":[{"id":1,"analysis":"..."}]}, đừng! khác chữ viết '
)

BAD_WORDS = ("____", " Gợi ý ", " bẻ gãy hoặc cắt làm đôi ", " chăn cắt đứt ", " nhầm lỗi cắt đứt ", " chữ viết tắt bề ngoài ", " theo nguyên văn ",
             " làm phiền sau cổ ", " thực tế Ưng lấp hoặc nhồi ", " Ưng lấp hoặc nhồi ", " Phương án ")


def clean(zh, got, blanks):
    """ bản in thử lấy mẫu để ý của nội tạng xuất khẩu: văn bản dịch dải biến thể của vị trí, phân tích thảo luận chủ đề mặt, cầm ghép đôi viết thành công gót chân bản thân ghép đôi không phù hợp với hình vuông toàn bộ tờ làm lại """
    if re.search(r"\[\s*\d", zh) or "____" in zh:
        raise ValueError(" văn bản dịch ngậm trong miệng trình giữ chỗ ")
    for p in blanks:
        i, a = p["id"], (got.get(p["id"]) or "")
        if len(a) > 220:
            raise ValueError(f"{i} gầm phân tích băng qua chiều dài ")
        for w in BAD_WORDS:
            if w in a:
                raise ValueError(f"{i} gầm phân tích ngậm trong miệng đơn vị tiền tệ từ ngữ«{w}»")
        word = re.escape(str(p.get("word") or ""))
        if word and re.search(r" và\s*" + word + r"\s*[, ,]?\s*cấu thành ", a, re.I):
            raise ValueError(f"{i} gầm phân tích cầm ghép đôi viết thành công biến thể của | bản thân cấu thành ")



def hint_lines(task):
    """ mỗi dùng trong | trống không kết hợp một dòng thơ nguyên văn mỏ neo điểm, ngăn chặn mô hình cầm phân tích yên lặng đến hàng xóm biến thể cũ của | dùng trong | """
    sents = re.split(r"(?<=[.!?])\s+", passage_view(task))
    out = []
    for p in task.get("passage") or []:
        if not p or p.get("id") is None:
            continue
        word = p.get("word") or ((p.get("prefix") or "") + (p.get("answer") or ""))
        mark = f" {p['id']} "
        sent = next((s for s in sents if mark in s), "")
        out.append(f"{p['id']}. {word} giấy thi chỉ cho {p.get('prefix', '')}____ nơi biến thể của: {sent}")
    return "\n".join(out)


def draft_task(task):
    blanks = blanks_of(task)
    ids = [b["id"] for b in blanks]
    user = (
        f" tiêu đề: {task.get('title','')}\n\n toàn bộ đoạn nguyên văn( n hoàng hậu là thu n trống không của hoàn chỉnh biến thể cũ của |): \n{passage_view(task)}\n\n"
        f" theo đuổi trống không danh sách mục(phân tích chỉ nhắm vào nên hàng của hoàn chỉnh biến thể cũ của |, và trích dẫn nó nơi biến thể của): \n{hint_lines(task)}\n\n"
        " mời làm những... này đánh số từng cái một đi ra phân tích, và cho toàn bộ đoạn văn bản dịch "
    )
    data = qwen_json(SYSTEM, user)
    got = {int(x.get("id")): (x.get("analysis") or "").strip() for x in data.get("items", [])}
    missing = [i for i in ids if not got.get(i)]
    if missing or not (data.get("translation") or "").strip():
        raise ValueError(f"items sự thiếu {missing} có thể không có văn bản dịch ")
    zh = (data["translation"] or "").strip()
    clean(zh, got, blanks)
    return zh, got


def mark(tasks, limit):
    hit = []
    for t in tasks:
        if not blanks_of(t):
            continue
        if blanks_of(t)[0].get("analysis") or blanks_of(t)[0].get("analysis_draft"):
            continue
        hit.append(t)
        if len(hit) >= limit:
            break
    return hit


def promote(tasks):
    n = 0
    for t in tasks:
        if t.get("zh_draft") and not t.get("translation"):
            t["translation"] = t.pop("zh_draft")
        for p in t.get("passage") or []:
            if p and p.get("analysis_draft"):
                p["analysis"] = p.pop("analysis_draft")
                n += 1
    return n


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--file", required=True)
    ap.add_argument("--limit", type=int, default=20)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--promote", action="store_true")
    ap.add_argument("--review", action="store_true", help=" đóng dấu đã viết đi vào của *_draft cung cấp nhân tạo lấy mẫu ")
    ap.add_argument("--model", default="", help=" đồng ý ngầm qwen-plus; lấy mẫu không thích yếu có thể trao đổi qwen-max")
    a = ap.parse_args()

    load_env()
    if a.model:
        os.environ["QWEN_MODEL"] = a.model
    path = (ROOT / a.file).resolve()
    doc = json.loads(path.read_text())
    tasks = doc.get("tasks") or []

    if a.promote:
        print(f"promoted {promote(tasks)} blanks ->", path)
        path.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n")
        return

    if a.review:
        n = 0
        for t in tasks:
            bs = blanks_of(t)
            if not bs or not any(p.get("analysis_draft") for p in bs):
                continue
            n += 1
            print(f"\n=== {t.get('title')} ===\n{t.get('zh_draft','')}")
            for p in bs:
                print(f"  {p['id']} {p.get('word') or p.get('answer')}: {p.get('analysis_draft','')}")
        print(f"\n Tổng cộng {n} tờ ở lại lấy mẫu; đi qua hoàng hậu cào --promote thăng chức làm trang trọng ) ")
        return

    todo = mark(tasks, a.limit)
    print(f"{path.name}: {len(todo)} tờ ở lại sửa ")
    done = 0
    for t in todo:
        for attempt in range(2):
            try:
                zh, got = draft_task(t)
                break
            except Exception as e:  # hóa đơn tiếp theo bị đánh bại thử lại đầu tiên, vẫn bị đánh bại trong trường hợp đó nhảy qua và như thực tế thông báo
                print("  retry" if attempt == 0 else f"  SKIP {t.get('title')}: {e}")
                time.sleep(2)
                zh, got = None, None
        if got is None:
            continue
        t["zh_draft"] = zh
        for p in t.get("passage") or []:
            if p and p.get("id") is not None:
                p["analysis_draft"] = got[int(p["id"])]
        done += 1
        if a.dry_run:
            print(f"\n=== {t.get('title')} ===\n{zh}")
            for p in t["passage"]:
                if p and p.get("id") is not None:
                    print(f"  {p['id']} {p.get('word') or p.get('answer')}: {p['analysis_draft']}")
        else:
            print(f"  ok {done}/{len(todo)} {t.get('title')}")
        if not a.dry_run and done % 5 == 0:
            save(path, doc)
    if not a.dry_run and done:
        save(path, doc)
    print(f" viết đi vào {done} Bài(draft ))" + ("; dry-run chưa bỏ sót đĩa " if a.dry_run else f", sao lưu thấy {path.parent}/backups"))


BACKED = set()


def save(path, doc):
    if path not in BACKED:
        bdir = path.parent / "backups"
        bdir.mkdir(exist_ok=True)
        dst = bdir / f"{path.stem}.{time.strftime('%Y%m%d-%H%M%S')}.json"
        shutil.copy2(path, dst)
        BACKED.add(path)
        print(" sao lưu ->", dst, file=sys.stderr)
    path.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main()
