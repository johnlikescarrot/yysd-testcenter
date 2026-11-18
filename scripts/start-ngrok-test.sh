#!/bin/bash
# tạm thời công trong lưới trắc — ngrok bại lộ AI Nghe sâu (phương án B)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="$HOME/.local/node/bin:$PATH"

echo "==> khởi động AI Server (cảng 3000) …"
lsof -ti:3000 | xargs kill 2>/dev/null || true
sleep 1
cd "$ROOT/server"
nohup npm start > /tmp/yysd-api.log 2>&1 &
for i in 1 2 3 4 5 6 7 8 9 10; do
  curl -sf http://127.0.0.1:3000/api/health >/dev/null 2>&1 && break
  sleep 1
done
if! curl -sf http://127.0.0.1:3000/api/health | grep -q '"ai":true'; then
  echo "❌ AI Server không sẵn sàng, Xem /tmp/yysd-api.log"
  tail -5 /tmp/yysd-api.log 2>/dev/null || true
  exit 1
fi
echo " AI Server đã sẵn sàng "

echo "==> khởi động ngrok đường hầm …"
lsof -ti:4040 | xargs kill 2>/dev/null || true
pkill -f "ngrok http 3000" 2>/dev/null || true
sleep 1

if [-z "${NGROK_AUTHTOKEN:-}"] && [-f "$HOME/.ngrok2/ngrok.yml"]; then
  : # đã phối trí qua
elif [-z "${NGROK_AUTHTOKEN:-}"]; then
  echo ""
  echo "⚠️ lần đầu sử dụng cần ngrok tài khoản (miễn phí): "
  echo " 1. mở ra https://dashboard.ngrok.com/signup Đăng ký "
  echo " 2. phục chế Authtoken, vận hành: "
  echo " npx ngrok config add-authtoken < của bạn token>"
  echo " 3. một lần nữa vận hành bản kịch bản gốc "
  echo ""
  exit 1
fi

nohup npx ngrok http 3000 --log=stdout > /tmp/yysd-ngrok.log 2>&1 &
for i in 1 2 3 4 5 6 7 8 9 10; do
  curl -sf http://127.0.0.1:4040/api/tunnels >/dev/null 2>&1 && break
  sleep 1
done

PUBLIC_URL=$(curl -s http://127.0.0.1:4040/api/tunnels | python3 -c "
import sys, json
try:
  data = json.load(sys.stdin)
  for t in data.get('tunnels', []):
    if t.get('proto') == 'https':
      print(t['public_url']); break
except: pass
" 2>/dev/null)

if [-z "$PUBLIC_URL"]; then
  echo "❌ ngrok không thu hoạch đến công mạng lưới địa chỉ, Xem /tmp/yysd-ngrok.log"
  tail -10 /tmp/yysd-ngrok.log 2>/dev/null || true
  exit 1
fi

TEST_URL="${PUBLIC_URL}/test/jingting"

echo ""
echo "✅ tạm thời công mạng lưới kết nối đã tạo ra (chia bên trong trắc nhân viên): "
echo ""
echo " $TEST_URL"
echo ""
echo "⚠️ chú ý: "
echo " · của bạn Mac phải bảo trì khởi động máy, mà lại bản kịch bản gốc phục vụ tại vận hành "
echo " · miễn phí ngrok kết nối trọng khải sau sẽ thành "
echo " · lần đầu mở ra khả năng có ngrok nhắc nhở trang, nhấn Visit Site để tiếp tục "
echo " · mời dùng Chrome mở ra, cũng cho phép microphone "
echo ""
echo " đình chỉ: bash \"$ROOT/scripts/stop-ngrok-test.sh\""
