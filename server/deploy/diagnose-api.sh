#!/bin/bash
# tại ECS dùng trong | di chuyển trên quỹ đạo: bash deploy/diagnose-api.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ok=0
warn=0
fail=0

pass() { echo "  ✓ $1"; ok=$((ok + 1)); }
note() { echo "  · $1"; warn=$((warn + 1)); }
bad()  { echo "  ✗ $1"; fail=$((fail + 1)); }

env_set() {
  local key="$1"
  local val
  val="$(grep -E "^${key}=" .env 2>/dev/null | head -1 | cut -d= -f2- || true)"
  [ -n "$val" ] && [ "$val" != " mời chuyển đổi ít nhất 32 vị trí theo tình huống chuỗi " ]
}

echo "==> gốc máy móc giám sát giao diện "
if ss -tlnp 2>/dev/null | grep -E ':80|:443|:3000' || netstat -tlnp 2>/dev/null | grep -E ':80|:443|:3000'; then
  :
else
  note " chưa phát hiện đến 80/443/3000 giám sát "
fi

echo ""
echo "==> pm2 quá trình "
if command -v pm2 &>/dev/null; then
  pm2 list 2>/dev/null || note "pm2 list Không thành công "
else
  bad "pm2 chưa lắp đặt - di chuyển trên quỹ đạo bash deploy/ecs-setup.sh"
fi

echo ""
echo "==> địa phương API thám hiểm sống "
if curl -fsS -m 3 http://127.0.0.1:3000/api/health; then
  echo ""
  pass "127.0.0.1:3000/api/health bình thường "
else
  bad "127.0.0.1:3000/api/health Không thành công - kiểm tra pm2 logs yysd-api"
fi

echo ""
echo "==> nginx api trang web "
if [ -d /etc/nginx ]; then
  if grep -Rq "api.youyisida.com" /etc/nginx 2>/dev/null; then
    pass "nginx đã triển khai api.youyisida.com"
  else
    bad " chưa tìm thấy api.youyisida.com - tham khảo deploy/nginx-api.conf"
  fi
else
  note "nginx chưa lắp đặt "
fi

echo ""
echo "==> .env lên mạng nhất định lấp hoặc nhồi sau cổ "
if [ ! -f .env ]; then
  bad ".env không tồn tại - cp .env.example .env và điền vào biểu mẫu "
else
  env_set JWT_SECRET && pass "JWT_SECRET đã thiết lập " || bad "JWT_SECRET chưa thiết lập có thể băng qua ngắn biến thể của vị trí "
  env_set ALIYUN_ACCESS_KEY_ID && pass "ALIYUN_ACCESS_KEY_ID đã thiết lập " || bad "ALIYUN_ACCESS_KEY_ID chưa thiết lập(không thể nhắn tin)"
  env_set ALIYUN_ACCESS_KEY_SECRET && pass "ALIYUN_ACCESS_KEY_SECRET đã thiết lập " || bad "ALIYUN_ACCESS_KEY_SECRET chưa thiết lập "
  env_set SMS_SIGN_NAME && pass "SMS_SIGN_NAME đã thiết lập " || bad "SMS_SIGN_NAME chưa thiết lập "
  env_set SMS_TEMPLATE_CODE && pass "SMS_TEMPLATE_CODE đã thiết lập " || bad "SMS_TEMPLATE_CODE chưa thiết lập "
  env_set CORS_ORIGINS && pass "CORS_ORIGINS đã thiết lập " || bad "CORS_ORIGINS chưa thiết lập "
  if env_set DASHSCOPE_API_KEY; then
    pass "DASHSCOPE_API_KEY đã thiết lập(AI chức năng có thể sử dụng)"
  else
    note "DASHSCOPE_API_KEY chưa thiết lập(tinh chất cười/Nói AI không thể sử dụng, đăng ký không nhận ảnh hưởng)"
  fi
  if grep -q '^SMS_DEV_MODE=1' .env 2>/dev/null; then
    note "SMS_DEV_MODE=1 - sản xuất môi trường mời thay đổi thành 0"
  fi
fi

echo ""
echo "==> Internet ngoài tường lửa GFW | HTTPS thám hiểm sống(có sẵn)"
if curl -fsS -m 5 https://api.youyisida.com/api/health 2>/dev/null; then
  echo ""
  pass "https://api.youyisida.com/api/health bình thường "
else
  note " Internet ngoài tường lửa GFW | HTTPS thám hiểm sống bị đánh bại - kiểm tra đưa vào hồ sơ trường con tên api, an toàn hình thành 443, certbot chứng chỉ "
fi

echo ""
echo "==> biến thể của |: ${ok} đi qua · ${warn} Gợi ý · ${fail} ở lại khôi phục "
if [ "$fail" -gt 0 ]; then
  echo " khôi phục hoàng hậu lại thực hiện: pm2 restart yysd-api && bash deploy/diagnose-api.sh"
  exit 1
fi
