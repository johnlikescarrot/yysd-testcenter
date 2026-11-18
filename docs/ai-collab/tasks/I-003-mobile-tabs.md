# I-003 — Hiệu ứng Kính mờ cho Thanh Tab Di động

**Trạng thái:** Đã hoàn thành

## Mục tiêu

Đảm bảo thanh điều hướng dưới đáy `mobile-tabs` trên màn hình di động (≤820px) có cùng độ tinh tế và hiệu ứng chất liệu như thanh điều hướng Premium trên cùng.

## Phạm vi Cho phép Thay đổi

- `assets/css/style.css`: Quy tắc CSS cho `.mobile-tabs` và `.mobile-tabs__item.is-active`

## Điều Nghiêm cấm

- Thay đổi logic đóng mở menu drawer trong `nav.js`

## Các Thay đổi Kỹ thuật

- Khung chứa thanh tab: Bổ sung `backdrop-filter`, màu nền trắng bán trong suốt và đường viền trên `var(--border)`.
- Mục đang hoạt động (active): Bổ sung màu nền vàng nhạt `color-mix(in srgb, var(--brand-gold) 12%, transparent)`.

## Tiêu chí Nghiệm thu

- Kiểm tra trên khung nhìn 375px tại các trang dashboard / zone / results.
- Tab đang hoạt động hiển thị rõ ràng, dễ đọc; vùng an toàn của thiết bị (safe-area) hoạt động chuẩn xác.

## Phương án Rollback

Khôi phục lại thuộc tính background gốc của `.mobile-tabs`.
