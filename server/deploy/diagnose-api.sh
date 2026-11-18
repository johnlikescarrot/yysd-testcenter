#!/bin/bash
# tại ECS bên trên vận hành: bash deploy/diagnose-api.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ok=0
warn=0
fail=0

pass() { echo " ✓ $1"; ok=$((ok + 1)); }
note() { echo " · $1"; warn=$((warn + 1)); }
bad() { echo " ✗ $1"; fail=$((fail + 1)); }

env_set() {
  local key="$1"
  local val
  val="$(grep -E "^${key}=".env 2>/dev/null | head -1 | cut -d= -f2- || true)"
  [-n "$val"] && ["$val"!= " mời đổi thành Tối thiểu 32 ký tự tùy cơ hội ký tự chuỗi "]
}

echo "==> bản cơ nghe lén cảng "
if ss -tlnp 2>/dev/null | grep -E ':80|:443|:3000' || netstat -tlnp 2>/dev/null | grep -E ':80|:443|:3000'; then
  :
else
  note " không Đánh giá đến 80/443/3000 nghe lén "
fi

echo ""
echo "==> pm2 tiến trình "
if command -v pm2 &>/dev/null; then
  pm2 list 2>/dev/null || note "pm2 list thất bại "
else
  bad "pm2 không lắp đặt — vận hành bash deploy/ecs-setup.sh"
fi

echo ""
echo "==> bản địa API dò xét sống "
if curl -fsS -m 3 http://127.0.0.1:3000/api/health; then
  echo ""
  pass "127.0.0.1:3000/api/health bình thường "
else
  bad "127.0.0.1:3000/api/health thất bại — kiểm tra pm2 logs yysd-api"
fi

echo ""
echo "==> nginx api trạm điểm[web] "
if [-d /etc/nginx]; then
  if grep -Rq "api.youyisida.com" /etc/nginx 2>/dev/null; then
    pass "nginx đã phối trí api.youyisida.com"
  else
    bad " không tìm được api.youyisida.com — tham khảo deploy/nginx-api.conf"
  fi
else
  note "nginx không lắp đặt "
fi

echo ""
echo "==>.env thượng tuyến tất điền hạng "
if [! -f.env]; then
  bad ".env không tồn tại — cp.env.example.env cũng điền "
else
  env_set JWT_SECRET && pass "JWT_SECRET đã thiết trí " || bad "JWT_SECRET không thiết trí hoặc qua ngắn giành chỗ "
  env_set ALIYUN_ACCESS_KEY_ID && pass "ALIYUN_ACCESS_KEY_ID đã thiết trí " || bad "ALIYUN_ACCESS_KEY_ID không thiết trí (không cách nào gởi nhắn tin) "
  env_set ALIYUN_ACCESS_KEY_SECRET && pass "ALIYUN_ACCESS_KEY_SECRET đã thiết trí " || bad "ALIYUN_ACCESS_KEY_SECRET không thiết trí "
  env_set SMS_SIGN_NAME && pass "SMS_SIGN_NAME đã thiết trí " || bad "SMS_SIGN_NAME không thiết trí "
  env_set SMS_TEMPLATE_CODE && pass "SMS_TEMPLATE_CODE đã thiết trí " || bad "SMS_TEMPLATE_CODE không thiết trí "
  env_set CORS_ORIGINS && pass "CORS_ORIGINS đã thiết trí " || bad "CORS_ORIGINS không thiết trí "
  if env_set DASHSCOPE_API_KEY; then
    pass "DASHSCOPE_API_KEY đã thiết trí (AI công năng có thể dùng) "
  else
    note "DASHSCOPE_API_KEY không thiết trí (Nghe sâu / Nói AI không thể dùng, Đăng nhập không bị ảnh hưởng) "
  fi
  if grep -q '^SMS_DEV_MODE=1'.env 2>/dev/null; then
    note "SMS_DEV_MODE=1 — sinh sản Môi trường mời cải thành 0"
  fi
fi

echo ""
echo "==> mạng bên ngoài HTTPS dò xét sống (có thể chọn) "
if curl -fsS -m 5 https://api.youyisida.com/api/health 2>/dev/null; then
  echo ""
  pass "https://api.youyisida.com/api/health bình thường "
else
  note " mạng bên ngoài HTTPS dò xét sống thất bại — kiểm tra lập hồ sơ tử vực tên api, tổ an toàn 443, certbot giấy chứng nhận "
fi

echo ""
echo "==> tập hợp: ${ok} thông qua · ${warn} nhắc nhở · ${fail} đợi chữa trị "
if ["$fail" -gt 0]; then
  echo " chữa trị sau lại chấp hành: pm2 restart yysd-api && bash deploy/diagnose-api.sh"
  exit 1
fi
