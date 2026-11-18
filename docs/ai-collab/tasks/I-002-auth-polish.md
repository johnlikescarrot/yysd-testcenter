# I-002 — Auth biểu mẫu tài liệu focus  auth-card thị giác

**tình trạng:** done

## Mục tiêu

login/register nhập khẩukhung ví dụ: khung cửa focus  premium biểu mẫu tài liệunhất quán;auth-card bên khung ví dụ: khung cửa thay đổi hoặc thay thếrõ ràng.

## cho phépthay đổi

- `assets/css/style.css`:`.auth-card`,`.auth-field input:focus-visible`

## cấm

- login.html / register.html cấu trúc
- auth.js

## thay đổi

```css
.auth-card { border: 1px solid var(--border); box-shadow: var(--shadow-paper); }
.auth-field input:focus-visible { border-color: var(--brand-gold); box-shadow: 0 0 0 3px color-mix(...); outline: none; }
```

## kiểm tra và chấp nhận

- `/login.html` · `/register.html`
- Tab đếnnhập khẩukhung ví dụ: khung cửacó thể thấy rõ rằng điều này đúng gold ring
- 1280 / 375

## tin học quay lui

Xóathêm cái gì đó mới CSS quy tắc.
