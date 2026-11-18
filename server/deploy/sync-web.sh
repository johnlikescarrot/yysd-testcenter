#!/bin/bash
# YYSD trạng thái tĩnh đứng — từ GitHub đồng bộ đến nginx mục lục (tại ECS bên trên vận hành)
# cách dùng: sudo bash deploy/sync-web.sh
set -euo pipefail

REPO_DIR="${REPO_DIR:-/opt/yysd/repo}"
WEB_ROOT="${WEB_ROOT:-/opt/yysd/web}"
REPO_URL="${REPO_URL:-https://github.com/wanli4473/yysd-testcenter.git}"
BRANCH="${BRANCH:-main}"

echo "==> nhà kho mục lục: $REPO_DIR"
echo "==> trang web mục lục: $WEB_ROOT"

if! command -v git &>/dev/null; then
  echo "!! mời trước lắp đặt git: apt-get install -y git"
  exit 1
fi

if [! -d "$REPO_DIR/.git"]; then
  mkdir -p "$(dirname "$REPO_DIR")"
  git clone --branch "$BRANCH" "$REPO_URL" "$REPO_DIR"
fi

cd "$REPO_DIR"
# GitHub via HTTP/2 often fails on some ECS networks (curl 16).
git config --local http.version HTTP/1.1
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

# ponytail: abort before --delete; these papers live on the server but are not in git yet
need=(
  "library/mock/cambridge-listening/secret-set-1.html"
  "library/mock/cambridge-listening/secret-set-1-audio1.mp3"
  "library/mock/cambridge-listening/secret-set-2.html"
  "library/mock/cambridge-listening/secret-set-2-audio1.mp3"
  "library/mock/cambridge-reading/secret-set-3-reading.html"
  "library/mock/cambridge-reading/secret-set-4-reading.html"
)
for f in "${need[@]}"; do
  if [! -f "$REPO_DIR/$f"]; then
    echo "!! nhà kho thiếu khuyết $f — bỏ dở, tránh cho rsync --delete đem tuyến thượng tuyệt mật bộ cuốn xóa bỏ "
    echo " trước tiên đem bản cơ library/mock/**/secret-set-* Nộp bài cũng đẩy tiễn đưa sau lại đồng bộ "
    exit 1
  fi
done

mkdir -p "$WEB_ROOT"

if command -v rsync &>/dev/null; then
  rsync -a --delete \
    --exclude '.git/' \
    --exclude 'server/' \
    --exclude 'admission/' \
    --exclude 'rankings/' \
    --exclude 'node_modules/' \
    --exclude '.staging/' \
    --exclude '.github/' \
    --exclude 'app/' \
    --exclude '.env' \
    --exclude '.env.local' \
    "$REPO_DIR/" "$WEB_ROOT/"
else
  echo "!! rsync không lắp đặt, sử dụng cp (chậm chạp) "
  find "$WEB_ROOT" -mindepth 1 -maxdepth 1! -name '.git' -exec rm -rf {} + 2>/dev/null || true
  for item in assets data library "*.html" "*.json" scripts; do
    [-e "$REPO_DIR/$item"] && cp -a "$REPO_DIR/$item" "$WEB_ROOT/" 2>/dev/null || true
  done
fi

# xưa cũ HTML buổi họp báo vứt bỏ tuyệt mật bộ cuốn Chip; đồng bộ sau cưỡng chế bổ quay về
python3 - <<PY
from pathlib import Path
p = Path("${WEB_ROOT}/teacher-calendar.html")
if not p.is_file():
    raise SystemExit(0)
t = p.read_text(encoding="utf-8")
old = ' <button type="button" class="chip" data-ex-cat="rsecret"> Đọc tuyệt mật bộ cuốn </button>\\n </div>'
new = ' <button type="button" class="chip" data-ex-cat="rsecret"> Đọc tuyệt mật bộ cuốn </button>\\n <button type="button" class="chip" data-ex-cat="lsecret"> Nghe tuyệt mật bộ cuốn </button>\\n </div>'
if 'data-ex-cat="lsecret"' not in t:
    if old not in t:
        raise SystemExit("teacher-calendar.html missing Nghe tuyệt mật bộ cuốn chip and cannot patch")
    p.write_text(t.replace(old, new, 1), encoding="utf-8")
    print("==> đã bổ quay về Nghe tuyệt mật bộ cuốn Chip ")
PY

echo ""
echo "==> kiểm tra mấu chốt văn bản tài liệu "
check() {
  if [-f "$WEB_ROOT/$1"]; then
    echo " ✓ $1"
  else
    echo " ✗ thiếu khuyết $1"
    missing=1
  fi
}
missing=0
check "dashboard.html"
check "assets/js/dashboard.js"
check "admin-assign.html"
check "assets/js/admin-assign.js"
check "admin/index.html"
check "ai-tutor.html"
check "data/speaking/jiijing-banks/2026-q2.json"
check "data/speaking/jiijing-active.json"
check "data/speaking/writing-prompts.json"
check "data/speaking/part1-topics.json"
check "data/speaking/part1-fixed.json"
check "speaking.html"
check "jingting-player.html"
check "library/practice/jingting/cam20-test1-section1.html"
check "library/practice/jingting/data/cam20-t1-p1.json"
check "library/practice/jingting/data/cam21-t1-p1.json"
check "word-realm.html"
check "assets/js/word-realm.js"
check "library/practice/word-realm/lexicon.json"
check "daily-word-setup.html"
check "daily-word-learn.html"
check "daily-word-result.html"
check "assets/js/daily-word/core.js"
check "assets/js/daily-word/learn.js"
check "assets/css/daily-word.css"
check "vocab-shelf.html"
check "vocab-learn.html"
check "vocab-quiz.html"
check "vocab-challenge.html"
check "teacher-vocab-challenge.html"
check "assets/js/vocab-shelf-ui.js"
check "assets/js/vocab-learn.js"
check "assets/js/vocab-quiz.js"
check "assets/js/vocab-challenge-ui.js"
check "assets/js/teacher-vocab-challenge.js"
check "assets/css/vocab-shelf.css"
check "assets/css/vocab-learn.css"
# ponytail: manifest already lists these; --delete drops them if they never landed in git
check "library/mock/cambridge-listening/secret-set-1.html"
check "library/mock/cambridge-listening/secret-set-1-audio1.mp3"
check "library/mock/cambridge-listening/secret-set-2.html"
check "library/mock/cambridge-listening/secret-set-2-audio1.mp3"
check "library/mock/cambridge-reading/secret-set-3-reading.html"
check "library/mock/cambridge-reading/secret-set-4-reading.html"
if! grep -q 'data-ex-cat="lsecret"' "$WEB_ROOT/teacher-calendar.html"; then
  echo " ✗ teacher-calendar.html thiếu khuyết Nghe tuyệt mật bộ cuốn Chip "
  missing=1
else
  echo " ✓ Nghe tuyệt mật bộ cuốn Chip "
fi

if grep -q "api.youyisida.com" "$WEB_ROOT/library/practice/jingting/cam20-test1-section1.html" 2>/dev/null; then
  echo " ✓ Nghe sâu trang đã phối trí sinh sản API"
else
  echo " ✗ Nghe sâu trang API_BASE không chỉ hướng api.youyisida.com"
  missing=1
fi

if [-f /etc/nginx/sites-enabled/youyisida.com] || grep -Rq "youyisida.com" /etc/nginx 2>/dev/null; then
  if nginx -t 2>/dev/null; then
    systemctl reload nginx 2>/dev/null || service nginx reload 2>/dev/null || true
    echo " ✓ nginx đã trọng tải "
  fi
fi

echo ""
if ["$missing" -eq 0]; then
  echo "==> đồng bộ hoàn thành. mời tại trình duyệt cưỡng chế Làm mới (Ctrl+Shift+R) sau Kiểm tra Nói và Nghe sâu. "
else
  echo "==> đồng bộ hoàn thành nhưng có thiếu thốn hạng, mời kiểm tra phía trên ✗"
  exit 1
fi
