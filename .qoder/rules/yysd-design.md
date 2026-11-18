---
trigger: always_on
---

# Cảm nhận Thiết kế Giao diện YYSD (Look & Feel)

Mục tiêu không phải là sao chép iOS một cách máy móc, mà là: **Nội dung như giấy, khung viền như kính mờ, tương tác chân thực như vật lý; phòng thi duy trì cảm giác chuẩn mực như công cụ chính thức.**

Toàn bộ quy tắc chi tiết xem tại tệp gốc `YYSD-DESIGN-RULES.md`. Khi có xung đột, lấy tài liệu đó làm chuẩn.

## Ba tầng trải nghiệm (Tránh dùng lẫn lộn)

| Tầng | Định vị phong cách | Phạm vi áp dụng |
| --- | --- | --- |
| **Nội dung (Content)** | Giấy ngà, trầm tĩnh, tối ưu trải nghiệm đọc | Đề thi thật, Từ vựng, Báo cáo điểm, Nội dung chính của Hub |
| **Khung viền (Shell)** | Kính mờ nhẹ, nổi lơ lửng phía trên nội dung | Thanh điều hướng, Thanh chân trang (bottom bar), Drawer, Hộp thoại xác nhận / Action Sheet |
| **Phòng thi (Exam)** | Hiệu quả, tin cậy, tối giản chi tiết thừa | Phòng thi CDT và màn hình thi thực tế — không chạy theo xu hướng bóng bẩy kiểu Apple |

Khi làm UI mới, hãy tự hỏi: Đây là tầng nội dung, khung viền hay phòng thi?

## Chất liệu (Chỉ cho phép hai loại)

1. Paper (Giấy) — `#f6f3ec` / `#fffcf7` kết hợp vân giấy tinh tế, phục vụ trải nghiệm đọc.
2. Chrome (Kính mờ) — Bán trong suốt kết hợp `blur(20px) saturate(180%)` cùng viền sáng nổi bật, phục vụ điều hướng và thao tác quyết định.

Cấm chất liệu thứ ba (như dải chuyển màu tím gradient, đổ bóng trang trí quá dày, lạm dụng kính mờ khắp nơi).

## Tương tác Vật lý

- Phản hồi tức thì: Phản hồi ngay khi chạm/nhấn chuột (`pointer-down`, khoảng 100ms), không đợi nhả chuột (`click`).
- Vào ra nhất quán: Vào từ bên phải thì thoát ra bên phải, vào từ đáy thì thoát về đáy; sử dụng `YYSD_SURFACE`, cấm chuyển đổi trạng thái bằng `hidden` đột ngột.
- Neo không gian: Bảng điều khiển mở ra trực tiếp từ phần tử kích hoạt.
- Cho phép ngắt quãng: Hiệu ứng chuyển cảnh có thể bị ngắt nếu người dùng đổi ý thao tác.
- Hộp thoại quyết định dùng Action Sheet: `YYSD_CONFIRM` / `YYSD_ALERT` / `YYSD_ASK`.
- Hiệu ứng rê chuột (`hover`) chỉ áp dụng trên thiết bị hỗ trợ chuột `@media (hover: hover)`. Màn hình cảm ứng chỉ giữ lại trạng thái `:active`.

## Điểm neo triển khai kỹ thuật

- Token: `assets/css/style.css` `:root`
- Bề mặt giao diện: `assets/js/ui.js`
- Chuyển trang: `assets/js/page-transit.js`
- Tự kiểm tra: `node scripts/check_surface.js` · `node scripts/check_apple_shell.js`

## Những điều cấm kỵ (Anti-patterns)

- Thêm hiệu ứng nảy (bounce) hay kính mờ vào nút bấm / khóa thi của phòng thi CDT.
- Nhúng thư viện hoạt họa lò xo nặng nề trên toàn trang.
- Hiệu ứng cuộn quá đà (overshoot) trong các tình huống không có quán tính.
- Xếp chồng hai lớp bán trong suốt mờ.
- Lạm dụng làm mờ toàn trang chỉ để khoe kỹ xảo.
- Tạo ra hệ thống thị giác thứ hai hoặc bộ trình phát âm thanh thứ hai.
