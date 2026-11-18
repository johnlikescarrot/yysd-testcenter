#!/bin/bash
# dừng ngrok thực hiện kiểm thử beta kín phục vụ
lsof -ti :3000 | xargs kill 2>/dev/null || true
pkill -f "ngrok http 3000" 2>/dev/null || true
echo " đã dừng AI máy chủ biến thể cũ của ngrok"
