# YYSD Design Rules

xuất sắc lợi ích suy nghĩ đạt tới phía trước chủ nghĩa hiện thực thoả thuận mục tiêu không phải bắt chước iOS, mà là: **nội dung giống biến thể của |, biến thể của | giống thủy tinh, lẫn nhau giống vật lý; phòng thi giữ chính phủ công cụ cảm thấy **

lõi biến thể của: bề mặt tiếp xúc giống cơ thể của mở rộng--nhấn xuống ngay lập tức có phản ứng, di chuyển biến thể của | thời điểm hiện tại giá trị khởi hành, dải nước đi tốc độ, bất kỳ lúc nào có thể gián đoạn 

---

## 1. ba chồng lên nhau nhân cách(đừng bùn sử dụng)

| chồng lên nhau | bản chất | Phạm vi |
| --- | --- | --- |
| **nội dung** | ngà voi biến thể của |, bình yên, thú vị để đọc | Đề thi thật, Từ vựng, Báo cáo, Hub văn bản chính |
| **biến thể của |** | nhẹ sương giá biến thể của, nổi trong đó chứa dùng trong | | đỉnh hàng rào, nền tảng hàng rào, Drawer, Xác nhận / Sheet |
| **phòng thi** | tính hữu dụng, đáng tin cậy, ít trang trí | CDT và bảo vệ cắt xem | -- **đừng! quả táo biến thể của** |

viết tắt của Tân Cương UI trước hỏi: này là nội dung, biến thể của |, vẫn phòng thi? 

---

## 2. Tài liệu(chỉ cho phép hai hạt)

1. **Paper** - `#f6f3ec` / `#fffcf7` + cực kỳ nhẹ biến thể của | đường chịu tải đọc   
2. **Chrome** - mờ mờ + `blur(20px) saturate(180%)` + sáng bên cao ánh sáng chịu tải điều hướng biến thể của | quyết định chiến lược 

- cấm thu ba hạt liệu(màu tím thay đổi dần dần, lặp lại chiếu trang trí dừng, khắp nơi thủy tinh)   
- thay đổi hoặc thay thế to bề mặt thay đổi hoặc thay thế«dày»: Sheet > thẻ > Chip   
- tôn kính `prefers-reduced-transparency`: giáng chức làm chân thành nền tảng   
- Token: `--chrome-bg` / `--chrome-blur` / `--chrome-saturate` / `--chrome-edge` 

---

## 3. phong cách thư pháp

| công dụng | quy tắc |
| --- | --- |
| tiết lộ tiêu đề | Playfair / phông chữ Mincho kết nối; chữ cách một khoảng ... từ `-0.02em`~`-0.03em`; hàng cao ~1.1 |
| bề mặt tiếp xúc văn bản chính | hệ thống phong cách thư pháp + PingFang; hàng cao ~1.5; chữ cách một khoảng ... từ gần 0 |
| nhỏ nhãn | ngắn gọn Canada tracking; độ đậm của phông chữ ngắn gọn dùng trong và(sương giá biến thể của nền tảng dùng trong | yêu cầu thú vị để đọc) |

- **biến thể của | chồng lên nhau cấm Inter đậu kỳ thi khoa cử hai che đậy chữ không chân người nổi tiếng trên mạng cơ thể **  
- cấp độ dựa vào«độ đậm của phông chữ + chữ và số + hàng cao»hình thành một bộ hoàn chỉnh, không chỉ phóng to chữ và số   
- `font-optical-sizing: auto` 

---

## 4. lẫn nhau vật lý

### phải
1. **nhấn ngay lập tức** - gửi thông tin phản hồi tồn tại pointer-down(cân trong cân đĩa hoặc trên cân 100ms), không phải đợi click Token: `--press-ms` / `--press-scale`   
2. **đi cùng đường đường mòn ra vào** - bên phải tiến lên bên phải đi ra, nền tảng tiến lên nền tảng đi ra; sử dụng `YYSD_SURFACE`, cấm cứng cắt `hidden`   
3. **không gian mỏ neo cố định** - bảng điều khiển biến thể của | kích hoạt gốc mở ra(`transform-origin` + `.is-surface-source`); điện thoại di động Sheet mỏ neo cố định đáy   
4. **đồng ý ngầm có thể gián đoạn** - chèo qua Trung Quốc cho phép hướng ngược ý định; đừng chiều dài thời gian `pointer-events: none`   
5. **quyết định chiến lược đồ dùng quân mạt chược Sheet** - biến thể của | chồng lên nhau sử dụng `YYSD_CONFIRM` / `YYSD_ALERT` / `YYSD_ASK`, không cần hệ thống `confirm`/`alert`(CDT ngoại lệ có thể giữ) 

### lò xo
- đồng ý ngầm: không có nảy(critically damped)   
- hầu như«ném đi ra ngoài»của động lượng cử chỉ có thể nhẹ overshoot   
- thực đơn / chuyển cảnh sáng dần cấm nảy 

### Hover
- nâng lên, lơ lửng hiệu quả đặc biệt hầu như giới hạn `@media (hover: hover)`   
- chạm kiểm soát chỉ giữ `:active` nhấn 

### toàn bộ đầu xem | sân phơi(Silk)
- Hub bên trong hop: ngắn, nhẹ(opacity, ~100ms)   
- Scene: ngắn fade, **cấm blur**; lần thứ hai ý định ngay lập tức điều hướng   
- Sheet: tán thành xuống kéo đóng(tiện tay làm + tốc độ chiếu); học công cụ yêu cầu nhanh và liên kết 

---

## 5. sắp xếp biến thể của | thông tin

- mỗi khối một món sự việc: một dùng trong | chủ tiêu đề +(có sẵn)một dòng thơ giải thích + một hình thành chủ làm việc   
- thẻ là lẫn nhau đồ chứa, không phải trang trí; loại bỏ khung/bóng hoàng hậu vẫn rõ ràng → không nên là dừng   
- Landing / đầu xem | ít dừng; Hub có thể sử dụng dừng   
- Navy = cấu trúc biến thể của | chủ làm việc; Gold = hiếm sử dụng nhấn mạnh; khả năng kỹ thuật màu sắc chỉ công nhân mỏng hoặc thon dải / biểu tượng   
- đỉnh hàng rào / nền tảng hàng rào sử dụng**lăn cạnh thấm nhuần bí mật**, ít sử dụng cứng 1px cắt ra biến thể của |   
- Sheet / Drawer: sương giá biến thể của biến thể của | + ra vào biến thể cũ của | blur và scale giống đến(materialize)   
- giống đầu nội dung chuyển đổi: ngắn opacity cross-fade(`YYSD_UI_SWAP`), ít độ dời   
- tôn kính `prefers-reduced-motion` / `prefers-reduced-transparency` 

---

## 5b. Hub mật độ(Từ vựng / IELTS)

giống Apple giáo dục hàng hóa, không giống tiếp thị rơi xuống đất đầu 

| quy tắc | thoả thuận |
| --- | --- |
| phối màu | lạnh gần trắng `#f5f5f7` + trắng bề mặt + hải quân chủ làm việc; vàng cực kỳ hiếm |
| tiêu đề | hạng nhất cân trong cân đĩa hoặc trên cân 28–34px hệ thống chữ không chân; cấm khổng lồ Playfair hỗ trợ để lại lời nhắn |
| danh sách ngôn ngữ | `.yysd-group` / `.yysd-row` inset chia thành nhóm danh sách; một loại ngôn ngữ chạy xuyên qua |
| cấu trúc | một dùng trong | chủ CTA + một số lượng hoặc con số nhất định hình thành; cấm hai to tiêu đề / bento đĩa mẫu / màu sắc cột sống ngang dải nằm rải rác |
| mật độ | hình thành khoảng cách ~20–28px, hàng cao ~48–56px |

---

## 6. lên mạng trước năm hỏi

1. này là nội dung, biến thể của |, vẫn phòng thi? bản chất Đúng rồi! gì??   
2. nhấn xuống Có ... không? tồn tại ~100ms bên trong nói?   
3. ra vào là giống hệt dải con đường gì??   
4. có thể không thể ít lớp thẻ / khung / bóng?   
5. biến thể của | của di chuyển biến thể của | là tồn tại diễn đạt vật lý, vẫn tồn tại vở kịch? --vở kịch nhưng xóa 

---

## 7. đạt được mỏ neo điểm(đã có mã)

| năng lực | vị trí |
| --- | --- |
| thiết kế token | `assets/css/style.css` `:root` |
| bề mặt công tắc điện | `YYSD_SURFACE` → `assets/js/ui.js` |
| tên thương hiệu xác nhận | `YYSD_CONFIRM` / `YYSD_ALERT` / `YYSD_ASK` → `assets/js/ui.js` |
| chèn ngắt trang xem | sân phơi | `assets/js/page-transit.js` |
| tự kiềm chế | `node scripts/check_surface.js` · `node scripts/check_apple_shell.js` |

---

## 8. không làm danh sách mục

- CDT nút bấm / void lock Canada bounce có thể kính mờ«dùng trong cấp cao»  
- tất cả trạm dùng trong | spring hoạt hình nhà kho(không có trình diễn món yêu cầu trước)  
- không có động lượng cảnh của overshoot  
- biến thể của | hai chồng lên nhau âm thanh nước chảy mờ mờ(tính dễ đọc sụp đổ)  
- làm phô diễn kỹ năng Canada của toàn bộ đầu blur

---

*sửa đổi biến thể cũ của | chỉ thay đổi quy tắc, không chất đống vụ việc viết tắt của Tân Cương chế độ trước băng qua«năm hỏi», lại tiến lên mã *
