#!/bin/bash
# khi thời gian đến gần mạng công cộng thực hiện kiểm thử beta kín - ngrok phơi bày AI tinh chất cười(kế hoạch B)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="$HOME/.local/node/bin:$PATH"

echo "==> khởi động AI máy chủ(giao diện 3000)..."
lsof -ti :3000 | xargs kill 2>/dev/null || true
sleep 1
cd "$ROOT/server"
nohup npm start > /tmp/yysd-api.log 2>&1 &
for i in 1 2 3 4 5 6 7 8 9 10; do
  curl -sf http://127.0.0.1:3000/api/health >/dev/null 2>&1 && break
  sleep 1
done
if ! curl -sf http://127.0.0.1:3000/api/health | grep -q '"ai":true'; then
  echo "❌ AI máy chủ chưa sẵn sàng, xem xét /tmp/yysd-api.log"
  tail -5 /tmp/yysd-api.log 2>/dev/null || true
  exit 1
fi
echo "    AI máy chủ đã sẵn sàng "

echo "==> khởi động ngrok đường hầm..."
lsof -ti :4040 | xargs kill 2>/dev/null || true
pkill -f "ngrok http 3000" 2>/dev/null || true
sleep 1

if [ -z "${NGROK_AUTHTOKEN:-}" ] && [ -f "$HOME/.ngrok2/ngrok.yml" ]; then
  : # đã triển khai băng qua
elif [ -z "${NGROK_AUTHTOKEN:-}" ]; then
  echo ""
  echo "⚠️  đầu tiên sử dụng cần ngrok số tài khoản(miễn phí): "
  echo "   1. mở https://dashboard.ngrok.com/signup Đăng ký "
  echo "   2. nhân bản Authtoken, di chuyển trên quỹ đạo: "
  echo "      npx ngrok config add-authtoken <của bạn token>"
  echo "   3. lại lại di chuyển trên quỹ đạo gốc kịch bản "
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

if [ -z "$PUBLIC_URL" ]; then
  echo "❌ ngrok chưa giành được đến mạng công cộng địa chỉ, xem xét /tmp/yysd-ngrok.log"
  tail -10 /tmp/yysd-ngrok.log 2>/dev/null || true
  exit 1
fi

TEST_URL="${PUBLIC_URL}/test/jingting"

echo ""
echo "✅ khi thời gian đến gần mạng công cộng liên kết đã tạo ra(cấp thực hiện kiểm thử beta kín nhân viên): "
echo ""
echo "   $TEST_URL"
echo ""
echo "⚠️  Lưu ý: "
echo "   · của bạn Mac phải giữ khởi động máy, và gốc kịch bản phục vụ tồn tại di chuyển trên quỹ đạo "
echo "   · miễn phí ngrok liên kết khởi động lại hoàng hậu có thể thay đổi "
echo "   · đầu tiên mở có thể có ngrok chỉ ra đầu, điểm Visit Site Tiếp tục "
echo "   · mời sử dụng Chrome mở, và cho phép microphone "
echo ""
echo " dừng: bash \"$ROOT/scripts/stop-ngrok-test.sh\""
