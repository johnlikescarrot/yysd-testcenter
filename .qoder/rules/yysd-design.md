---
trigger: always_on
---

# YYSD lối vào cảm nhận

 mục tiêu không phải phảng phất iOS, mà là: ** nội dung như giấy, xác như thủy tinh, lẫn nhau như Vật lý; trường thi bảo trì chính thức công cụ cảm giác. **

 Đầy đủ điều gặp nhà kho cây mục lục `YYSD-DESIGN-RULES.md`. xung đột lúc dùng nên văn bản tài liệu làm chuẩn.

## ba tầng nhân cách (chớ lẫn vào dùng)

| tầng | tính cách | phạm vi |
| --- | --- | --- |
| ** nội dung ** | ngà voi giấy, trầm tĩnh, có thể đọc | đề thi thật, Từ vựng, báo cáo, Hub chính văn |
| ** xác ** | nhẹ sương hóa, lơ lửng ở nội dung bên trên | thanh điều hướng, ngọn nguồn lan, Drawer, Xác nhận / Sheet |
| ** trường thi ** | hiệu quả và lợi ích, có thể tin, chứa đựng ít sức | CDT và phòng cắt bình — không nên quả táo hóa |

 mới UI hỏi trước: đây là nội dung, xác, hay trường thi?

## tài liệu (chỉ cho phép hai loại)

1. Paper — `#f6f3ec` / `#fffcf7` + nhẹ vô cùng giấy văn. thừa nhận Đọc.
2. Chrome — hơi mờ + `blur(20px) saturate(180%)` + sáng bên cạnh cao quang. thừa nhận Điều hướng và quyết định biện pháp.

 cấm loại thứ ba tài liệu (tím thay đổi dần, trọng hình chiếu trang trí tạp, khắp nơi thủy tinh).

## lẫn nhau Vật lý

- kìm tức thời: phản hồi tại pointer-down (ước 100ms), không phải đợi click.
- cùng đường kính ra vào: phải tiến phải ra, ngọn nguồn tiến ngọn nguồn ra; dùng `YYSD_SURFACE`, cấm cứng rắn cắt `hidden`.
- không gian neo định: mặt bản từ gây ra nguyên triển khai.
- cam chịu có thể cắt ngang: quá độ công chính hứa ngược ý đồ.
- quyết định biện pháp đồ dùng bài Sheet: `YYSD_CONFIRM` / `YYSD_ALERT` / `YYSD_ASK`.
- Hover đặc hiệu giới hạn `@media (hover: hover)`. xúc khống chỉ lưu lại `:active`.

## thực hiện neo chút:điểm

- Token: `assets/css/style.css` `:root`
- mặt ngoài: `assets/js/ui.js`
- điểm trang chuyển trận: `assets/js/page-transit.js`
- tự kiểm: `node scripts/check_surface.js` · `node scripts/check_apple_shell.js`

## không làm

- CDT cái nút / void lock thêm bounce hoặc thuỷ tinh mờ
- toàn bộ đứng lên spring anime kho
- Không động lượng tình cảnh overshoot
- chồng hai tầng thiển hơi mờ
- là huyễn kỹ thêm cả trang blur
- thứ hai bộ thị giác hệ thống hoặc thứ hai bộ bá phóng khí
