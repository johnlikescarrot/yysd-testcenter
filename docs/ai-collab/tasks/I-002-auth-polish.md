# I-002 - Auth biểu mẫu focus và auth-card thị giác

**tình trạng: ** done

## mục tiêu

login/register nhập khẩu khung focus và premium biểu mẫu nhất quán; auth-card khung thay đổi hoặc thay thế rõ ràng 

## cho phép thay đổi

- `assets/css/style.css`: `.auth-card`, `.auth-field input:focus-visible`

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
- Tab đến nhập khẩu khung có thể thấy rõ gold ring
- 1280 / 375

## quay lui

xóa thêm CSS quy tắc 
