# I-001 — Tích hợp Khung Giao diện page-premium cho results.html

**Trạng thái:** Đã hoàn thành (Cursor 22/07/2026)

## Mục tiêu

Đảm bảo tính liền mạch thị giác trên luồng trải nghiệm của học viên: dashboard → zone → **results**, đồng bộ phong cách thanh điều hướng và màu nền chuẩn Premium.

## Phạm vi Cho phép Thay đổi

- `results.html`: Thẻ `<head>` nạp phông chữ / CSS; thêm class vào thẻ `body`
- `assets/css/dashboard-premium.css`: Bổ sung kiểu dáng cho trang kết quả dưới bộ chọn `.page-premium` (tùy chọn)

## Điều Nghiêm cấm

- Thay đổi logic các đoạn mã script nội tuyến trong `results.html`
- Thay đổi cấu trúc dữ liệu kết quả trong `config.js`

## Các Thay đổi Kỹ thuật

1. Bổ sung liên kết Google Fonts cho phông chữ Inter (đồng bộ với trang dashboard).
2. Nạp thêm tệp kiểu dáng `dashboard-premium.css`.
3. Cập nhật thẻ body: `body class="home-minimal page-premium"`.
4. Thay đổi tiêu đề phụ page-head eyebrow sang class `dash-premium-eyebrow` (tùy chọn).

## Tiêu chí Nghiệm thu

- Đường dẫn kiểm tra: `/results.html` (trạng thái đã đăng nhập).
- Khung nhìn 1280px: Thanh điều hướng trên cùng hiển thị hiệu ứng kính mờ, màu nền trang `#fbf8f1`.
- Khung nhìn 375px: Thanh tab di động hiển thị bình thường; khối kết quả hero tự động co dãn chuẩn xác.
- Khi truy cập với tham số `?tenant=ease`: Tên tổ chức và logo của đối tác hiển thị đúng vị trí.

## Phương án Rollback

Xóa bỏ liên kết CSS premium và bỏ class `page-premium` khỏi thẻ body.
