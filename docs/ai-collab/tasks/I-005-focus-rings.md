# I-005 - page-premium tình hình tổng thể focus-visible

**tình trạng: ** done

## mục tiêu

bàn phím điều hướng tồn tại premium đầu có thể thấy rõ focus nhẫn(a11y + tính cách cảm thấy) 

## cho phép thay đổi

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

- dashboard / zone / results: Tab duyệt qua nav và btn
- chuột nhấn không xuất hiện nhẫn(:focus-visible)

## quay lui

Xóa focus-visible quy tắc cục 
