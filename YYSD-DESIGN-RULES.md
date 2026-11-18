# YYSD Design Rules

Giao diện không nhằm bắt chước iOS. **Nội dung như giấy, điều hướng như kính mờ, thao tác phản hồi như một vật thể; phòng thi giữ dáng dấp của công cụ thi chính thức.** Khi người dùng nhấn, phản hồi phải xuất hiện ngay. Chuyển động bắt đầu từ trạng thái hiện tại và có thể ngắt giữa chừng.

## 1. Ba lớp giao diện

| Lớp | Đặc điểm | Ví dụ |
| --- | --- | --- |
| Nội dung | Giấy ngà, tĩnh, dễ đọc | Đề thi, bộ từ, báo cáo, nội dung chính của Hub |
| Điều hướng | Mờ nhẹ, nổi trên nội dung | Thanh trên/dưới, ngăn điều hướng, bảng xác nhận |
| Phòng thi | Thực dụng, đáng tin, ít trang trí | CDT và khóa khi chuyển cửa sổ; không áp dụng hiệu ứng kiểu Apple |

Trước khi tạo giao diện, chọn **một** trong ba lớp.

## 2. Vật liệu

1. **Paper:** `#f6f3ec` / `#fffcf7`, có thể thêm vân rất nhẹ. Dành cho nội dung đọc.
2. **Chrome:** bán trong suốt, `blur(20px) saturate(180%)`, viền sáng. Dành cho điều hướng và quyết định.

Không tạo vật liệu thứ ba bằng chuyển sắc tím, thẻ đổ bóng nặng hoặc phủ kính khắp nơi. Bề mặt lớn trông dày hơn: sheet > thẻ > chip. Khi người dùng chọn `prefers-reduced-transparency`, chuyển sang nền đặc. Dùng `--chrome-bg`, `--chrome-blur`, `--chrome-saturate`, `--chrome-edge`.

## 3. Kiểu chữ

- Tiêu đề trưng bày: Playfair hoặc serif tương tự Song; khoảng cách chữ từ `-0.02em` đến `-0.03em`, chiều cao dòng khoảng 1.1.
- Nội dung điều khiển: phông hệ thống; PingFang cho chữ Hán khi cần. Chiều cao dòng khoảng 1.5, khoảng cách chữ gần 0.
- Nhãn nhỏ: tăng nhẹ độ đậm và khoảng cách chữ để đọc được trên nền mờ.
- Không thêm Inter hay bộ sans-serif thứ hai vào khung điều hướng. Tạo phân cấp bằng cả độ đậm, cỡ chữ **và** chiều cao dòng. Dùng `font-optical-sizing: auto` khi phù hợp.

## 4. Phản hồi khi tương tác

- **Nhấn:** phản hồi ngay ở `pointer-down` (khoảng 100 ms), không chờ `click`. Token: `--press-ms`, `--press-scale`.
- **Vào/ra cùng đường:** ngăn trượt từ phải vào thì trượt sang phải khi đóng. Dùng `YYSD_SURFACE` cho bề mặt, tránh chỉ bật/tắt `hidden` đột ngột.
- **Điểm neo:** bảng điều khiển mở từ nơi kích hoạt (`transform-origin`, `.is-surface-source`); sheet trên điện thoại neo ở dưới.
- **Có thể đảo chiều:** không khóa `pointer-events` quá lâu. Quyết định trong khung giao diện dùng `YYSD_CONFIRM`, `YYSD_ALERT` hoặc `YYSD_ASK`; CDT có thể dùng hộp thoại hệ thống.
- Mặc định dùng chuyển động không nảy. Chỉ cử chỉ hất có quán tính mới được vượt nhẹ vị trí đích. Menu và hiệu ứng hiện dần không nảy.
- Chỉ dùng hiệu ứng nâng/di chuột trong `@media (hover: hover)`. Màn hình cảm ứng dùng `:active`.
- Chuyển trang trong Hub: đổi độ mờ nhẹ, khoảng 100 ms. Chuyển cảnh dùng fade ngắn, không làm mờ toàn trang. Khi có ý định điều hướng lần hai, chuyển ngay. Sheet có thể kéo xuống để đóng, bám theo ngón tay và vận tốc thả.

## 5. Bố cục và thông tin

Mỗi khu vực giải quyết một việc, với một tiêu đề chính, tối đa một câu giải thích và nhóm thao tác chính. Dùng thẻ cho nội dung có tương tác, không phải để trang trí. Trang đầu ít thẻ hơn Hub.

Xanh hải quân dành cho cấu trúc và thao tác chính, vàng chỉ để nhấn điểm quan trọng. Màu từng kỹ năng chỉ xuất hiện ở biểu tượng hoặc vạch nhỏ. Mép thanh điều hướng trên/dưới nên chuyển nhẹ theo cuộn thay vì dùng ngay đường kẻ cứng 1 px. Sheet/ngăn kéo dùng nền giấy mờ; đổi nội dung cùng trang bằng cross-fade ngắn (`YYSD_UI_SWAP`), tránh di chuyển xa. Tôn trọng `prefers-reduced-motion` và `prefers-reduced-transparency`.

### Hub từ vựng và IELTS

Hub là công cụ học, không phải trang quảng cáo. Dùng nền gần trắng `#f5f5f7`, bề mặt trắng và thao tác chính xanh hải quân; hạn chế màu vàng. Tiêu đề cấp một khoảng 28–34 px, phông hệ thống; không dùng tiêu đề serif khổng lồ để lấp khoảng trống. Gom các dòng vào `.yysd-group` / `.yysd-row` theo cùng một cách trình bày. Một thao tác chính và vài nhóm danh sách là đủ. Tránh tiêu đề kép, cụm thẻ trang trí và dải màu rải rác. Khoảng cách nhóm khoảng 20–28 px, chiều cao dòng khoảng 48–56 px.

## 6. Năm câu hỏi trước khi phát hành

1. Đây là nội dung, điều hướng hay phòng thi? Hình thức có phù hợp không?
2. Thao tác nhấn có phản hồi trong khoảng 100 ms không?
3. Đường vào và đường ra có khớp nhau không?
4. Có thể bỏ bớt một thẻ, đường viền hoặc lớp bóng không?
5. Chuyển động giúp người dùng hiểu thao tác hay chỉ để phô diễn? Nếu chỉ để phô diễn, hãy bỏ.

## 7. Điểm tích hợp

| Chức năng | Vị trí |
| --- | --- |
| Token thiết kế | `:root` trong `assets/css/style.css` |
| Đóng/mở bề mặt, xác nhận | `YYSD_SURFACE`, `YYSD_CONFIRM`, `YYSD_ALERT`, `YYSD_ASK` → `assets/js/ui.js` |
| Chuyển trang | `assets/js/page-transit.js` |
| Kiểm tra | `node scripts/check_surface.js` · `node scripts/check_apple_shell.js` |

## 8. Tránh

Không gắn hiệu ứng nảy hay kính mờ cho nút và khóa của CDT. Không thêm thư viện lò xo toàn trang nếu chưa có trường hợp cụ thể cần dùng. Không vượt vị trí đích trong chuyển động không có quán tính, chồng hai nền trong mờ làm giảm độ đọc được, hoặc làm mờ toàn trang để trang trí. Khi cập nhật tài liệu này, sửa quy tắc thay vì chất thêm ví dụ.
