#!/bin/bash
# đình chỉ ngrok bên trong trắc phục vụ
lsof -ti:3000 | xargs kill 2>/dev/null || true
pkill -f "ngrok http 3000" 2>/dev/null || true
echo " đã đình chỉ AI Server và ngrok"
