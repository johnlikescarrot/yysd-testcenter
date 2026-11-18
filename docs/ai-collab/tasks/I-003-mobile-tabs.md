# I-003 — di chuyểncuối bottom tabs kính mờ

**tình trạng:** done

## Mục tiêu

≤820px chủcon đườngđáy `mobile-tabs`  premium topbar cùng cấpchủ nghĩa hiện thực trong nghệ thuật.

## cho phépthay đổi

- `assets/css/style.css`:`.mobile-tabs`,`.mobile-tabs__item.is-active`

## cấm

- nav.js drawer logic từ mượn

## thay đổi

- tabs đồ chứa:`backdrop-filter` + mờ mờhọ nền tảng + đỉnh bên `var(--border)`
- active item:âm thanh nước chảy họ nền tảng `color-mix(in srgb, var(--brand-gold) 12%, transparent)`

## kiểm tra và chấp nhận

- 375px dashboard / zone / results
- active tab thú vị để đọc;safe-area vẫncó hiệu lực

## tin học quay lui

khôi phục `.mobile-tabs` họ background.
