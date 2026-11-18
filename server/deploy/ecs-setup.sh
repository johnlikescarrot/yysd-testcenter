#!/bin/bash
# xuất sắc lợi ích suy nghĩ đạt tới đăng ký API - ECS một phím bố trí(Ubuntu/Debian)
# cách dùng: tồn tại máy chủ dùng trong | cd đến gốc kho hàng server mục lục hoàng hậu thực hiện bash deploy/ecs-setup.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> lắp đặt Node.js 20(dường như đã lắp đặt có thể nhảy qua)"
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "==> lắp đặt phụ thuộc vào "
npm install --production

if [ ! -f .env ]; then
  cp .env.example .env
  echo "!! mời chỉnh sửa $ROOT/.env điền vào biểu mẫu JWT_SECRET biến thể cũ của Ali nói AccessKey"
fi

echo "==> lắp đặt pm2"
sudo npm install -g pm2 2>/dev/null || npm install -g pm2

echo "==> khởi động API"
pm2 delete yysd-api 2>/dev/null || true
pm2 start server.js --name yysd-api
pm2 save
pm2 startup | tail -1 | sudo bash 2>/dev/null || true

echo ""
echo "==> bố trí trước nhất định dấu phẩy(Internet ngoài tường lửa GFW | thám hiểm sống bị đánh bại biến thể cũ của | nhấn này kiểm tra)"
echo "0. đưa vào hồ sơ: tồn tại Ali nói đưa vào hồ sơ bàn điều khiển làm youyisida.com thêm trường con tên api của truy cập; chưa đưa vào hồ sơ biến thể cũ của | thăm api.youyisida.com có thể chăn Ali nói đánh chặn "
echo "1. an toàn hình thành: cho qua đi vào trạm TCP 80, 443(3000 hầu như yêu cầu gốc máy móc, đừng đúng mạng công cộng nở hoa)"
echo "2. chỉnh sửa .env: JWT_SECRET(openssl rand -hex 32), ALIYUN AccessKey, tin nhắn văn bản ký tên/mẫu "
echo "3. nginx ngược thay thế api.youyisida.com -> 127.0.0.1:3000(tham khảo deploy/nginx-api.conf)"
echo "4. certbot --nginx -d api.youyisida.com   # trang trọng trạm phía trước sử dụng https"
echo "5. pm2 restart yysd-api"
echo "6. nhân bản deploy/nginx-site.conf đến nginx, certbot -d youyisida.com -d www.youyisida.com"
echo "7. sudo bash deploy/sync-web.sh          # đồng bộ tĩnh trạm đến /opt/yysd/web(lời nói thông thường ngân hàng câu hỏi, tinh chất cười AI đợi)"
echo "8. bash deploy/diagnose-api.sh          # theo đuổi sau cổ kiểm tra JWT / tin nhắn văn bản / HTTPS"
echo "9. trình duyệt kiểm tra https://youyisida.com/login.html biến thể của | lời nói thông thường/tinh chất cười "
