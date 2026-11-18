# I-005 — page-premium tình hình tổng thể focus-visible

**tình trạng:** done

## Mục tiêu

bàn phímnghĩa đen và bóng điều hướngtồn tại premium đầucó thể thấy rõ rằng điều này đúng focus họ(a11y + tính cáchcảm thấy).

## cho phépthay đổi

- `assets/css/dashboard-premium.css`

## cấm

- thay đổi `:focus` loại bỏ mouse click outline(hầu như sử dụng `:focus-visible`)

## thay đổi

```css
.page-premium a:focus-visible,
.page-premium button:focus-visible,
.page-premium .minimal-nav a:focus-visible { outline: none; box-shadow: 0 0 0 3px color-mix(... var(--ring) ...); }
```

## kiểm tra và chấp nhận

- dashboard / zone / results:Tab duyệt qua nav  btn
- chuột máy tínhnhấnkhôngxuất hiệnhọ(:focus-visible)

## tin học quay lui

Xóa focus-visible quy tắccục.
