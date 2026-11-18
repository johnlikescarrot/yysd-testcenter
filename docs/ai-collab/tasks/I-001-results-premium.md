# I-001 — results.html tiếp nhập page-premium xác

** Trạng thái: ** done (Cursor 2026-07-22)

## mục tiêu

 Học viên đường sống kính dashboard → zone → **results** thị giác nối liền, và premium thanh điều hướng / bối cảnh nhất trí.

## cho phép cải biến

- `results.html`: `<head>` kiểu chữ /CSS; `body` class
- `assets/css/dashboard-premium.css`: `.page-premium` hạ results trang đầu (có thể chọn)

## cấm

- `results.html` bên trong liên script ăn khớp
- `config.js` results số liệu kết cấu

## thay đổi

1. gia tăng Inter Google Font link (và dashboard nhất trí)
2. gia tăng `dashboard-premium.css` link
3. `body class="home-minimal page-premium"`
4. page-head eyebrow đổi dùng `dash-premium-eyebrow` (có thể chọn)

## nghiệm thu

- URL: `/results.html` (Đăng nhập thái)
- 1280px: topbar thuỷ tinh mờ, bối cảnh `#fbf8f1`
- 375px: mobile-tabs bình thường; hero stack không thay đổi
- `?tenant=ease`: nhãn hiệu tên /logo bình thường

## quay về lăn

 dời trừ premium CSS link và `page-premium` class.
