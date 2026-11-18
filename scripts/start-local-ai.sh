#!/bin/bash
# địa phương AI tinh chất cười kiểm tra - một phím khởi động(YYSD)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="$HOME/.local/node/bin:$PATH"

TEST_URL="http://127.0.0.1:8080/library/practice/jingting/cam20-test1-section1.html"
SPEAKING_URL="http://127.0.0.1:8080/speaking.html"

echo "==> kiểm tra Node.js..."
if ! command -v node &>/dev/null; then
  echo " chưa tìm thấy node, mời trước lắp đặt có thể xác nhận ~/.local/node tồn tại "
  exit 1
fi

echo "==> khởi động AI máy chủ (giao diện 3000)..."
cd "$ROOT/server"
if lsof -ti :3000 &>/dev/null; then
  echo "    giao diện 3000 đã tồn tại di chuyển trên quỹ đạo, nhảy qua "
else
  nohup npm start > /tmp/yysd-api.log 2>&1 &
  sleep 2
fi

echo "==> khởi động trang web xem trước (giao diện 8080)..."
cd "$ROOT"
if lsof -ti :8080 &>/dev/null; then
  echo "    giao diện 8080 đã tồn tại di chuyển trên quỹ đạo, nhảy qua "
else
  nohup python3 -m http.server 8080 > /tmp/yysd-web.log 2>&1 &
  sleep 1
fi

if curl -sf http://127.0.0.1:3000/api/health | grep -q '"ai":true'; then
  echo "    AI phục vụ: đã sẵn sàng "
else
  echo "    AI phục vụ: chưa sẵn sàng, mời xem xét /tmp/yysd-api.log"
fi

echo ""
echo "✅ địa phương kiểm tra môi trường đã sẵn sàng "
echo ""
echo "📎 tinh chất cười kiểm tra: "
echo "   $TEST_URL"
echo "📎 Luyện nói: "
echo "   $SPEAKING_URL"
echo ""
echo " dừng phục vụ: lsof -ti :3000 | xargs kill; lsof -ti :8080 | xargs kill"
