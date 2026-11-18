#!/bin/bash
# máy móc đánh hệ thống tĩnh trạm - đồng bộ app/ đến /opt/yysd/app
# cách dùng: sudo bash deploy/sync-app.sh
set -euo pipefail

REPO_DIR="${REPO_DIR:-/opt/yysd/repo}"
APP_ROOT="${APP_ROOT:-/opt/yysd/app}"

if [ ! -d "$REPO_DIR/app" ]; then
  echo "!! kho hàng thiếu app/ - ngừng "
  exit 1
fi

mkdir -p "$APP_ROOT"
rsync -a --delete \
  --exclude '.DS_Store' \
  "$REPO_DIR/app/" "$APP_ROOT/"

echo "==> kiểm tra "
for f in index.html login.html home.html mock.html reading.html reading-lab.html listening.html writing.html speaking.html review.html assets/js/gate.js assets/js/hit-shell.js assets/js/mock.js assets/js/toefl-writing.js library/toefl/set-1-reading.json library/toefl/set-1-listening.json; do
  if [ -f "$APP_ROOT/$f" ]; then
    echo "  ✓ $f"
  else
    echo "  ✗ $f"
    exit 1
  fi
done
echo "==> đồng bộ hoàn thành → $APP_ROOT"
