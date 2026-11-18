#!/usr/bin/env python3
"""Generate Cambridge IELTS 21 Tests 1-4 listening, reading, and writing mock pages."""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from scripts.cambridge21_data import listening_test, reading_test, writing_test
from scripts.cambridge_page import write_page

# This paper is the listening template with the practice-only transcript pane.
TPL_LISTENING = ROOT / "library/mock/cambridge-listening/cambridge-21-test-1.html"
TPL_READING = ROOT / "library/mock/cambridge-reading/cambridge-20-test-1-reading.html"
TPL_WRITING = ROOT / "library/mock/cambridge-writing/cambridge-20-test-4-writing.html"

LISTENING_DIR = ROOT / "library/mock/cambridge-listening"
READING_DIR = ROOT / "library/mock/cambridge-reading"
WRITING_DIR = ROOT / "library/mock/cambridge-writing"

STATE_VARS = (
    "let currentPaper=[], selectedSections=[], mode='practice', "
    "startTime=0, timerInterval=null, submitted=false;\n"
)

WRITING_BLURBS = {
    1: "Task 1 US jobs graph + Task 2 tall apartment blocks essay",
    2: "Task 1 college cafe plans + Task 2 theatres and cinemas essay",
    3: "Task 1 rain-shadow desert diagram + Task 2 study abroad essay",
    4: "Task 1 library survey chart + Task 2 primary school learning essay",
}


def inject_state_vars(html: str) -> str:
    needle = "const allQs = sec => sec.groups.flatMap(g=>g.questions);"
    if STATE_VARS.strip() not in html and needle in html:
        html = html.replace(needle, STATE_VARS + needle, 1)
    return html


def patch_listening_meta(html: str, n: int) -> str:
    reps = [
        ("Cambridge IELTS 20", "Cambridge IELTS 21"),
        ("<div class=\"num\">20</div>", f"<div class=\"num\">21</div>"),
        ("Test 1", f"Test {n}"),
        ("test-1", f"test-{n}"),
        ("test1", f"test{n}"),
        ("ielts20_test1", f"cam21_test{n}"),
        ("Cambridge IELTS 20 Test 1 Nghe", f"Cambridge IELTS 21 Test {n} Nghe"),
        ("Test 1 Nghe (đề và đáp án gốc)", f"Test {n} Nghe (đề và đáp án gốc)"),
        ("Cambridge IELTS 15 Test 1 Nghe", f"Cambridge IELTS 21 Test {n} Nghe"),
    ]
    for old, new in reps:
        html = html.replace(old, new)
    return inject_state_vars(html)


def patch_reading_meta(html: str, n: int) -> str:
    reps = [
        ("Cambridge IELTS 20", "Cambridge IELTS 21"),
        ("<div class=\"num\">20</div>", f"<div class=\"num\">21</div>"),
        ("Test 1", f"Test {n}"),
        ("test-1", f"test-{n}"),
        ("Cambridge IELTS 20 Test 1 Đọc", f"Cambridge IELTS 21 Test {n} Đọc"),
        ("Test 1 Đọc (đề và đáp án gốc)", f"Test {n} Đọc (đề và đáp án gốc)"),
    ]
    for old, new in reps:
        html = html.replace(old, new)
    return inject_state_vars(html)


def patch_writing_meta(html: str, n: int) -> str:
    reps = [
        ("Cambridge IELTS 20", "Cambridge IELTS 21"),
        ("<div class=\"num\">20</div>", f"<div class=\"num\">21</div>"),
        ("Test 4", f"Test {n}"),  # template is cambridge-20-test-4-writing
        ("test-4", f"test-{n}"),
        ("Test 1", f"Test {n}"),
        ("test-1", f"test-{n}"),
        ("cambridge-20-test-4-writing", f"cambridge-21-test-{n}-writing"),
        ("cambridge-20-test-1-writing", f"cambridge-21-test-{n}-writing"),
        (
            "Task 1 Yemen/Italy population pie charts + Task 2 sports facilities and public health essay",
            WRITING_BLURBS[n],
        ),
        ("Test 1 Viết (Đề Cambridge)", f"Test {n} Viết (Đề Cambridge)"),
    ]
    for old, new in reps:
        html = html.replace(old, new)
    return inject_state_vars(html)


def prepare_audio(audio_zip: Path) -> None:
    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        with zipfile.ZipFile(audio_zip) as zf:
            zf.extractall(tmp_path)
        for n in range(1, 5):
            for sec in range(1, 5):
                dst = LISTENING_DIR / f"cam21_test{n}_audio{sec}.mp3"
                parts = sorted(
                    p
                    for p in tmp_path.glob(f"C21T{n}P{sec}*.mp3")
                    if "__MACOSX" not in str(p)
                )
                if not parts:
                    single = tmp_path / f"C21T{n}P{sec}.mp3"
                    if single.exists():
                        parts = [single]
                if not parts:
                    raise FileNotFoundError(f"missing audio for test {n} section {sec}")
                if len(parts) == 1:
                    shutil.copy2(parts[0], dst)
                else:
                    # ponytail: cat merge — no ffmpeg on this machine
                    with dst.open("wb") as out_f:
                        for part in parts:
                            out_f.write(part.read_bytes())
                print(f"audio -> {dst.relative_to(ROOT)} ({len(parts)} part(s))")


def rename_map_image() -> None:
    src = LISTENING_DIR / "cambridge-21-t2_map.png"
    dst = LISTENING_DIR / "cambridge-21-test-2-map.png"
    if src.exists() and not dst.exists():
        shutil.copy2(src, dst)
        print(f"copied map -> {dst.relative_to(ROOT)}")


def outputs_for_test(n: int) -> list[Path]:
    return [
        LISTENING_DIR / f"cambridge-21-test-{n}.html",
        READING_DIR / f"cambridge-21-test-{n}-reading.html",
        WRITING_DIR / f"cambridge-21-test-{n}-writing.html",
    ]


def run_checks(paths: list[Path]) -> int:
    cmd = [sys.executable, str(ROOT / "scripts/build_manifest.py")]
    print("running:", " ".join(cmd))
    subprocess.run(cmd, check=True, cwd=ROOT)
    verify = ROOT / "scripts/verify_cambridge_mock_pages.py"
    cmd = [sys.executable, str(verify), *[str(p) for p in paths]]
    print("running:", " ".join(cmd))
    return subprocess.run(cmd, cwd=ROOT).returncode


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('tests', nargs='*', type=int, help='Test numbers 1–4 (default: all)')
    parser.add_argument('--audio-zip', type=Path, help='Optional: reimport audio from a local archive')
    args = parser.parse_args()
    tests = args.tests or [1, 2, 3, 4]
    if any(n not in range(1, 5) for n in tests):
        parser.error('test numbers must be between 1 and 4')
    if args.audio_zip:
        prepare_audio(args.audio_zip)
    rename_map_image()
    all_paths: list[Path] = []
    for n in tests:
        write_page(
            TPL_LISTENING,
            LISTENING_DIR / f"cambridge-21-test-{n}.html",
            listening_test(n),
            lambda html, tn=n: patch_listening_meta(html, tn),
        )
        write_page(
            TPL_READING,
            READING_DIR / f"cambridge-21-test-{n}-reading.html",
            reading_test(n),
            lambda html, tn=n: patch_reading_meta(html, tn),
        )
        write_page(
            TPL_WRITING,
            WRITING_DIR / f"cambridge-21-test-{n}-writing.html",
            writing_test(n),
            lambda html, tn=n: patch_writing_meta(html, tn),
        )
        all_paths.extend(outputs_for_test(n))
    return run_checks(all_paths)


if __name__ == "__main__":
    raise SystemExit(main())
