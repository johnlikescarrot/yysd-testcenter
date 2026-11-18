#!/usr/bin/env python3
""" cho TOEFL iBT Ngân hàng đề cách tuyến bổ Giải thích đáp án / văn dịch. ghi nhập *_draft chữ đoạn, kiểm tra bộ phận sau lại đề thăng làm chính thức chữ đoạn.

 cách dùng:
  python3 scripts/build_toefl_analysis_drafts.py --file app/library/toefl/bank-cw-reading.json --limit 20
  ... --dry-run chỉ đóng dấu, không rơi bàn (nhân công kiểm tra bộ phận dùng)
  ... --review đóng dấu đã ghi vào *_draft cung cấp kiểm tra bộ phận
  ... --promote đem *_draft phục chế thành chính thức chữ đoạn
Key đi nhà kho đã có ước định: server/.env (gặp build_listen_sidecars.py load_env).
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
        raise SystemExit("DASHSCOPE_API_KEY missing (server/.env dặm cũng không có) ")
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
    """ trở lại như cũ thành điền xong cả đoạn: mô hình không cần từ chữ cái mảnh vỡ đoán từ, chỉ giải thích tại sao là cái từ này này hình thức. """
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
    " ngươi là TOEFL iBT Complete the Words (đầu chữ cái / nửa từ lấp chỗ trống) Giáo viên. "
    " quy định sẵn cả đoạn Bài gốc và từng trống không nhắc nhở, phát ra: translation (cả đoạn Tiếng Việt văn dịch) và items (từng chỗ trống một cái Tiếng Việt Giải thích đáp án). "
    "translation yêu cầu: liên tục văn bản Tiếng Việt, không nên xuất hiện bất luận cái gì đánh số, dấu móc, hạ phác họa, Tiếng Anh nguyên từ hoặc chú thích; "
    " khoảng trắng chỗ trực tiếp theo như Đầy đủ từ dịch ra, không nên để lại giành chỗ. "
    "analysis yêu cầu: tối đa hai câu; trước tiên là nói về cú pháp nhân vật quyết định từ tính / hình thức, một lần nữa cho một cái cấu tạo từ hoặc phối hợp bằng chứng, cuối cùng cho từ nghĩa; "
    " chỉ viết bạn có nắm chắc một ít đầu tính quyết định lý do; "
    " cấm xuất hiện « nhắc nhở »«____»« cắt đứt »« bị đoạn » {các loại:đợi} thảo luận câu mặt hình thức nguyên lời nói, cấm từ bài thi cho ra bộ phận chữ cái đẩy cấu tạo từ, "
    " cấm thuật lại Đáp án ký tự chuỗi coi như lý do, cấm ghi « dựa theo Bài gốc ». "
    ' chỉ phát ra JSON đối tượng: {"translation":"…","items":[{"id":1,"analysis":"…"}]}, không nên khác văn tự. '
)

BAD_WORDS = ("____", " nhắc nhở ", " cắt đứt ", " bị đoạn ", " lầm đoạn ", " viết tắt hình thức ", " dựa theo Bài gốc ",
             " Phương án nhiễu ", " thực tế ứng với điền ", " ứng với điền ", " Phương án ")


def clean(zh, got, blanks):
    """ tiểu tử kiểm tra bộ phận phát hiện bẩn phát ra: văn dịch mang giành chỗ, Giải thích đáp án thảo luận câu mặt, đem phối hợp ghi thành cùng chính mình phối hợp. không hợp cách cả bài lặp lại. """
    if re.search(r"\[\s*\d", zh) or "____" in zh:
        raise ValueError(" văn dịch hàm giành chỗ phù ")
    for p in blanks:
        i, a = p["id"], (got.get(p["id"]) or "")
        if len(a) > 220:
            raise ValueError(f"{i} số Giải thích đáp án quá dài ")
        for w in BAD_WORDS:
            if w in a:
                raise ValueError(f"{i} số Giải thích đáp án hàm nguyên lời nói «{w}»")
        word = re.escape(str(p.get("word") or ""))
        if word and re.search(r" và \s*" + word + r"\s*[,,]?\s* cấu thành ", a, re.I):
            raise ValueError(f"{i} số Giải thích đáp án đem phối hợp ghi thành và bản thân cấu thành ")



def hint_lines(task):
    """ từng chỗ trống xứng một câu Bài gốc neo chút:điểm, tránh cho mô hình đem Giải thích đáp án an đến hàng xóm từ bên trên. """
    sents = re.split(r"(?<=[.!?])\s+", passage_view(task))
    out = []
    for p in task.get("passage") or []:
        if not p or p.get("id") is None:
            continue
        word = p.get("word") or ((p.get("prefix") or "") + (p.get("answer") or ""))
        mark = f" {p['id']} "
        sent = next((s for s in sents if mark in s), "")
        out.append(f"{p['id']}. {word}| bài thi chỉ cấp {p.get('prefix', '')}____| chỗ câu: {sent}")
    return "\n".join(out)


def draft_task(task):
    blanks = blanks_of(task)
    ids = [b["id"] for b in blanks]
    user = (
        f" tiêu đề: {task.get('title','')}\n\n cả đoạn Bài gốc (n sau là thứ n trống không Đầy đủ từ): \n{passage_view(task)}\n\n"
        f" trục chỗ trống danh sách (Giải thích đáp án chỉ nhằm vào nên làm được Đầy đủ từ, cũng trích dẫn nó chỗ câu): \n{hint_lines(task)}\n\n"
        " mời làm những mục này đánh số từng cái ra Giải thích đáp án, cũng cho cả đoạn văn dịch. "
    )
    data = qwen_json(SYSTEM, user)
    got = {int(x.get("id")): (x.get("analysis") or "").strip() for x in data.get("items", [])}
    missing = [i for i in ids if not got.get(i)]
    if missing or not (data.get("translation") or "").strip():
        raise ValueError(f"items thiếu {missing} hoặc Không văn dịch ")
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
    ap.add_argument("--review", action="store_true", help=" đóng dấu đã ghi vào *_draft cung cấp nhân công kiểm tra bộ phận ")
    ap.add_argument("--model", default="", help=" cam chịu qwen-plus; kiểm tra bộ phận ngại yếu có thể đổi qwen-max")
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
                print(f" {p['id']} {p.get('word') or p.get('answer')}: {p.get('analysis_draft','')}")
        print(f"\n tổng {n} bài đợi kiểm tra bộ phận; thông qua sau chạy --promote đề thăng làm chính thức chữ đoạn ")
        return

    todo = mark(tasks, a.limit)
    print(f"{path.name}: {len(todo)} bài đợi bổ ")
    done = 0
    for t in todo:
        for attempt in range(2):
            try:
                zh, got = draft_task(t)
                break
            except Exception as e: # đơn lần thất bại Thử lại một lần, nhưng thất bại liền nhảy qua cũng chi tiết báo
                print(" retry" if attempt == 0 else f" SKIP {t.get('title')}: {e}")
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
                    print(f" {p['id']} {p.get('word') or p.get('answer')}: {p['analysis_draft']}")
        else:
            print(f" ok {done}/{len(todo)} {t.get('title')}")
        if not a.dry_run and done % 5 == 0:
            save(path, doc)
    if not a.dry_run and done:
        save(path, doc)
    print(f" ghi nhập {done} bài (draft chữ đoạn) " + ("; dry-run không rơi bàn " if a.dry_run else f", dành trước gặp {path.parent}/backups"))


BACKED = set()


def save(path, doc):
    if path not in BACKED:
        bdir = path.parent / "backups"
        bdir.mkdir(exist_ok=True)
        dst = bdir / f"{path.stem}.{time.strftime('%Y%m%d-%H%M%S')}.json"
        shutil.copy2(path, dst)
        BACKED.add(path)
        print(" dành trước ->", dst, file=sys.stderr)
    path.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main()
