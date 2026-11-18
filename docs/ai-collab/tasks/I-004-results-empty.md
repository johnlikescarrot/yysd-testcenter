# I-004 — Nâng cấp Thẻ Trạng thái Trống trên Trang Kết quả

**Trạng thái:** Đã hoàn thành

## Mục tiêu

Khi học viên chưa có lịch sử làm bài, nâng cấp khối thông báo `.results-empty` từ kiểu chữ đơn điệu cũ thành thẻ phong cách giấy cao cấp đồng bộ với hệ thống.

## Phạm vi Cho phép Thay đổi

- `assets/css/dashboard-premium.css`: Bổ sung quy tắc cho `.page-premium.results-empty` và các phần tử con

## Điều Nghiêm cấm

- Thay đổi các chuỗi mẫu trong script nội tuyến của `results.html` (trừ trường hợp chỉ thêm class `results-empty`)

## Các Thay đổi Kỹ thuật

- Phần script nội tuyến của results: Khối thông báo trống được bổ sung thêm class `results-empty` (nếu chưa có).
- Bổ sung CSS: Khoảng cách đệm padding, đường viền border, đổ bóng dạng giấy shadow-paper, căn giữa nghệ thuật chữ typography.

## Tiêu chí Nghiệm thu

- Xóa sạch điểm số trong localStorage → Mở `/results.html` sẽ thấy giao diện trạng thái trống dạng thẻ giấy cao cấp.
- Khoảng cách lề của nút bấm kêu gọi hành động (CTA button) được duy trì cân đối.

## Phương án Rollback

Xóa bỏ các quy tắc CSS của `.results-empty` trong `dashboard-premium.css`.
