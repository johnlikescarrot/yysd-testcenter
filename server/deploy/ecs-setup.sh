#!/bin/bash
# YYSD Đăng nhập API — ECS một khóa bố trí (Ubuntu/Debian)
# cách dùng: đang phục vụ khí bên trên cd đến bản nhà kho server mục lục sau chấp hành bash deploy/ecs-setup.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> lắp đặt Node.js 20 (như đã lắp đặt có thể nhảy qua) "
if! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "==> lắp đặt ỷ lại "
npm install --production

if [! -f.env]; then
  cp.env.example.env
  echo "!! mời biên tập $ROOT/.env điền JWT_SECRET và a lý vân AccessKey"
fi

echo "==> lắp đặt pm2"
sudo npm install -g pm2 2>/dev/null || npm install -g pm2

echo "==> khởi động API"
pm2 delete yysd-api 2>/dev/null || true
pm2 start server.js --name yysd-api
pm2 save
pm2 startup | tail -1 | sudo bash 2>/dev/null || true

echo ""
echo "==> bố trí trước tất đọc (mạng bên ngoài dò xét sống thất bại lúc theo như này loại bỏ) "
echo "0. lập hồ sơ: tại a lý vân lập hồ sơ đài điều khiển {vì:là} youyisida.com tăng thêm tử vực tên api tiếp nhập; không lập hồ sơ lúc phỏng vấn api.youyisida.com sẽ bị a lý vân chặn đường "
echo "1. tổ an toàn: cho đi nhập đứng TCP 80, 443 (3000 vẻn vẹn cần bản cơ, chớ đối với công võng khai thả) "
echo "2. biên tập.env: JWT_SECRET (openssl rand -hex 32), ALIYUN AccessKey, tin nhắn kí tên / khuôn mô hình "
echo "3. nginx phản thay api.youyisida.com -> 127.0.0.1:3000 (tham khảo deploy/nginx-api.conf) "
echo "4. certbot --nginx -d api.youyisida.com # chính thức đứng lối vào sử dụng https"
echo "5. pm2 restart yysd-api"
echo "6. phục chế deploy/nginx-site.conf đến nginx, certbot -d youyisida.com -d www.youyisida.com"
echo "7. sudo bash deploy/sync-web.sh # đồng bộ trạng thái tĩnh đứng ở /opt/yysd/web (Nói Ngân hàng đề, Nghe sâu AI {các loại:đợi}) "
echo "8. bash deploy/diagnose-api.sh # trục hạng kiểm tra JWT / tin nhắn / HTTPS"
echo "9. trình duyệt Kiểm tra https://youyisida.com/login.html và Nói / Nghe sâu "
