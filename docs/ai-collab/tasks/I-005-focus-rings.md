# I-005 — page-premium toàn cục focus-visible

** Trạng thái: ** done

## mục tiêu

 bàn phím Điều hướng tại premium trang có thể thấy được focus hoàn (a11y + phẩm chất cảm giác).

## cho phép cải biến

- `assets/css/dashboard-premium.css`

## cấm

- sửa `:focus` xóa mouse click outline (chỉ dùng `:focus-visible`)

## thay đổi

```css
.page-premium a:focus-visible,
.page-premium button:focus-visible,
.page-premium.minimal-nav a:focus-visible { outline: none; box-shadow: 0 0 0 3px color-mix(... var(--ring)...); }
```

## nghiệm thu

- dashboard / zone / results: Tab lượt lịch nav và btn
- con chuột nhấn vào không hiện ra hoàn (:focus-visible)

## quay về lăn

 xóa bỏ focus-visible quy tắc khối.
