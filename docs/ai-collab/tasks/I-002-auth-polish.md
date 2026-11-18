# I-002 — Auth danh sách focus và auth-card thị giác

** Trạng thái: ** done

## mục tiêu

login/register đưa vào khung focus và premium danh sách nhất trí; auth-card khung rõ ràng hơn tích.

## cho phép cải biến

- `assets/css/style.css`: `.auth-card`, `.auth-field input:focus-visible`

## cấm

- login.html / register.html kết cấu
- auth.js

## thay đổi

```css
.auth-card { border: 1px solid var(--border); box-shadow: var(--shadow-paper); }
.auth-field input:focus-visible { border-color: var(--brand-gold); box-shadow: 0 0 0 3px color-mix(...); outline: none; }
```

## nghiệm thu

- `/login.html` · `/register.html`
- Tab đến đưa vào khung có thể thấy được gold ring
- 1280 / 375

## quay về lăn

 xóa bỏ mới tăng CSS quy tắc.
