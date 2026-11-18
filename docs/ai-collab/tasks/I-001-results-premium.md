# I-001 - results.html truy cập page-premium biến thể của |

**tình trạng: ** done(Cursor 2026-07-22)

## mục tiêu

học sinh đường thông đường mòn dashboard → zone → **results** thị giác kết nối, và premium đỉnh hàng rào/bối cảnh nhất quán 

## cho phép thay đổi

- `results.html`: `<head>` phong cách thư pháp/CSS; `body` class
- `assets/css/dashboard-premium.css`: `.page-premium` xuống results đầu đầu(có sẵn)

## cấm

- `results.html` bên trong liên minh với script logic
- `config.js` results dữ liệu cấu trúc

## thay đổi

1. Tăng Inter Google Font link(và dashboard Thống nhất)
2. Tăng `dashboard-premium.css` link
3. `body class="home-minimal page-premium"`
4. page-head eyebrow chuyển sang `dash-premium-eyebrow`(có sẵn)

## kiểm tra và chấp nhận

- URL: `/results.html`(đăng ký)
- 1280px: topbar kính mờ, bối cảnh `#fbf8f1`
- 375px: mobile-tabs bình thường; hero stack không đổi
- `?tenant=ease`: tên thương hiệu tên/logo bình thường

## quay lui

loại bỏ premium CSS link và `page-premium` class 
