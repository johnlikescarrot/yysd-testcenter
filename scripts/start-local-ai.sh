#!/bin/bash
# bản địa AI Nghe sâu Kiểm tra — một khóa khởi động (YYSD)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="$HOME/.local/node/bin:$PATH"

TEST_URL="http://127.0.0.1:8080/library/practice/jingting/cam20-test1-section1.html"
SPEAKING_URL="http://127.0.0.1:8080/speaking.html"

echo "==> kiểm tra Node.js…"
if! command -v node &>/dev/null; then
  echo " không tìm được node, mời trước lắp đặt hoặc Xác nhận ~/.local/node tồn tại "
  exit 1
fi

echo "==> khởi động AI Server (cảng 3000)…"
cd "$ROOT/server"
if lsof -ti:3000 &>/dev/null; then
  echo " cảng 3000 đã ở vận hành, nhảy qua "
else
  nohup npm start > /tmp/yysd-api.log 2>&1 &
  sleep 2
fi

echo "==> khởi động trang web dự lãm (cảng 8080)…"
cd "$ROOT"
if lsof -ti:8080 &>/dev/null; then
  echo " cảng 8080 đã ở vận hành, nhảy qua "
else
  nohup python3 -m http.server 8080 > /tmp/yysd-web.log 2>&1 &
  sleep 1
fi

if curl -sf http://127.0.0.1:3000/api/health | grep -q '"ai":true'; then
  echo " AI phục vụ: đã sẵn sàng "
else
  echo " AI phục vụ: không sẵn sàng, mời Xem /tmp/yysd-api.log"
fi

echo ""
echo "✅ bản địa Kiểm tra Môi trường đã sẵn sàng "
echo ""
echo "📎 Nghe sâu Kiểm tra: "
echo " $TEST_URL"
echo "📎 Luyện kỹ năng Nói: "
echo " $SPEAKING_URL"
echo ""
echo " đình chỉ phục vụ: lsof -ti:3000 | xargs kill; lsof -ti:8080 | xargs kill"
