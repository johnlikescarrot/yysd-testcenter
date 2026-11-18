# I-003 — di động đầu bottom tabs thuỷ tinh mờ

** Trạng thái: ** done

## mục tiêu

≤820px chủ đường nhỏ dưới đáy `mobile-tabs` và premium topbar đồng cấp cảm nhận.

## cho phép cải biến

- `assets/css/style.css`: `.mobile-tabs`, `.mobile-tabs__item.is-active`

## cấm

- nav.js drawer ăn khớp

## thay đổi

- tabs vật chứa: `backdrop-filter` + hơi mờ bạch ngọn nguồn + đỉnh bên cạnh `var(--border)`
- active item: thiển kim ngọn nguồn `color-mix(in srgb, var(--brand-gold) 12%, transparent)`

## nghiệm thu

- 375px dashboard / zone / results
- active tab có thể đọc; safe-area nhưng có hiệu lực

## quay về lăn

 khôi phục `.mobile-tabs` nguyên background.
