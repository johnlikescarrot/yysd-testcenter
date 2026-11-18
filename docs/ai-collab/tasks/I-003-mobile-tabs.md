# I-003 - di chuyển cuối bottom tabs kính mờ

**tình trạng: ** done

## mục tiêu

≤820px chủ con đường đáy `mobile-tabs` và premium topbar cùng cấp chủ nghĩa hiện thực 

## cho phép thay đổi

- `assets/css/style.css`: `.mobile-tabs`, `.mobile-tabs__item.is-active`

## cấm

- nav.js drawer logic

## thay đổi

- tabs đồ chứa: `backdrop-filter` + mờ mờ trắng nền tảng + đỉnh bên `var(--border)`
- active item: âm thanh nước chảy vàng nền tảng `color-mix(in srgb, var(--brand-gold) 12%, transparent)`

## kiểm tra và chấp nhận

- 375px dashboard / zone / results
- active tab thú vị để đọc; safe-area vẫn có hiệu lực

## quay lui

khôi phục `.mobile-tabs` trước đây background 
