# Quy tắc thiết kế YYSD

Thỏa ước về chất cảm front-end của YYSD. Mục tiêu không phải mô phỏng iOS mà là: **nội dung như giấy, lớp vỏ như kính, tương tác như vật lý; phòng thi giữ cảm giác công cụ chính thức.**

Câu cốt lõi: giao diện như phần nối dài của cơ thể — nhấn xuống là phản hồi ngay, chuyển động bắt đầu từ giá trị hiện tại, mang vận tốc và có thể ngắt bất cứ lúc nào.

---

## 1. Ba lớp tính cách (không trộn)

| Lớp | Tính cách | Phạm vi |
| --- | --- | --- |
| **Nội dung** | Giấy ngà, tĩnh lặng, dễ đọc | Đề thi thật, từ vựng, báo cáo, văn bản Hub |
| **Lớp vỏ** | Phủ sương nhẹ, nổi trên nội dung | Thanh trên, thanh dưới, Drawer, Sheet xác nhận |
| **Phòng thi** | Thực dụng, đáng tin, ít trang trí | CDT và chống chuyển màn — **không Apple hóa** |

Trước khi làm UI mới hãy hỏi: đây là nội dung, lớp vỏ, hay phòng thi?

---

## 2. Vật liệu (chỉ hai loại)

1. **Paper** — `#f6f3ec` / `#fffcf7` + vân giấy cực nhẹ. Dùng để đọc.
2. **Chrome** — bán trong suốt + `blur(20px) saturate(180%)` + viền sáng mảnh. Dùng để điều hướng và quyết định.

- Cấm vật liệu thứ ba (gradient tím, card đổ bóng trang trí, kính ở mọi nơi).
- Bề mặt càng lớn càng «dày»: Sheet > Card > Chip.
- Tôn trọng `prefers-reduced-transparency`: hạ cấp thành nền đặc.
- Token: `--chrome-bg` / `--chrome-blur` / `--chrome-saturate` / `--chrome-edge`.

---

## 3. Chữ

| Mục đích | Quy tắc |
| --- | --- |
| Tiêu đề trưng bày | Playfair / hệ Song; tracking `-0.02em` ~ `-0.03em`; line-height ~1.1 |
| Văn bản giao diện | Font hệ thống + hỗ trợ tiếng Việt `Be Vietnam Pro`; line-height ~1.5; tracking gần 0 |
| Nhãn nhỏ | Tăng nhẹ tracking và font-weight (phải đọc được trên nền mờ) |

- **Lớp vỏ cấm dùng Inter và font sans «thời thượng» thứ hai.**
- Hệ thống cấp bậc dựa trên bộ «font-weight + font-size + line-height», không chỉ phóng to chữ.
- `font-optical-sizing: auto`.

---

## 4. Vật lý tương tác

### Bắt buộc

1. **Phản hồi tức thì khi nhấn** — tại `pointer-down` (khoảng 100 ms), không đợi `click`. Token: `--press-ms` / `--press-scale`.
2. **Vào ra cùng một đường** — vào phải ra phải, vào dưới ra dưới; dùng `YYSD_SURFACE`, cấm đổi `hidden` đột ngột.
3. **Neo không gian** — bảng điều khiển mở từ chính nguồn kích hoạt (`transform-origin` + `.is-surface-source`); Sheet trên di động neo đáy màn hình.
4. **Mặc định có thể ngắt** — cho phép đảo ý định trong lúc chuyển động; không `pointer-events: none` kéo dài.
5. **Quyết định dùng Sheet thương hiệu** — `YYSD_CONFIRM` / `YYSD_ALERT` / `YYSD_ASK`, không dùng `confirm`/`alert` hệ thống (CDT là ngoại lệ).

### Lò xo

- Mặc định: không nảy (tắt dần tới hạn).
- Chỉ cử chỉ có quán tính «văng ra» mới được phép overshoot nhẹ.
- Menu / fade-in cấm nảy.

### Hover

- Hiệu ứng nâng, hover chỉ trong `@media (hover: hover)`.
- Cảm ứng chỉ giữ `:active`.

### Chuyển trang (Silk)

- Hop trong Hub: ngắn, nhẹ (opacity, ~100 ms).
- Scene: fade ngắn, **cấm blur**; ý định thứ hai lập tức điều hướng.
- Sheet: kéo xuống để đóng (bám tay + chiếu vận tốc); công cụ học phải nhanh và liền mạch.

---

## 5. Bố cục & thông tin

- Mỗi khối làm một việc: một tiêu đề chính + (tùy chọn) một câu giải thích + một nhóm thao tác chính.
- Card là vùng chứa có tương tác, không phải đồ trang trí; bỏ viền/bóng đi vẫn rõ → không nên là card.
- Landing / màn đầu ít card; Hub dùng card được.
- Navy = cấu trúc & thao tác chính; Gold = nhấn rất hiếm; màu kĩ năng chỉ làm vạch mảnh / icon.
- Thanh trên / dưới dùng **mờ dần ở mép cuộn**, hạn chế đường kẻ 1 px cứng.
- Sheet / Drawer: giấy phủ sương + blur và scale tới cùng lúc (materialize).
- Đổi nội dung trong cùng trang: cross-fade opacity ngắn (`YYSD_UI_SWAP`), ít dịch chuyển.
- Tôn trọng `prefers-reduced-motion` / `prefers-reduced-transparency`.

---

## 5b. Mật độ Hub (Từ vựng / IELTS)

Giống sản phẩm giáo dục gọn gàng, không giống landing marketing.

| Quy tắc | Ước định |
| --- | --- |
| Màu | Trắng lạnh gần `#f5f5f7` + bề mặt trắng + Navy cho thao tác chính; Gold cực hiếm |
| Tiêu đề | Cấp 1 khoảng 28–34 px sans hệ thống; cấm Playfair khổng lồ tạo khoảng trống |
| Ngôn ngữ danh sách | `.yysd-group` / `.yysd-row` danh sách nhóm inset; một ngôn ngữ xuyên suốt |
| Cấu trúc | Một CTA chính + vài nhóm; cấm hai tiêu đề lớn / bento / vạch màu rải rác |
| Mật độ | Khoảng nhóm ~20–28 px, chiều cao hàng ~48–56 px |

---

## 6. Năm câu hỏi trước khi phát hành

1. Đây là nội dung, lớp vỏ, hay phòng thi? Tính cách đúng chưa?
2. Khi nhấn, giao diện có «nói» trong ~100 ms không?
3. Vào và ra có cùng một đường không?
4. Có bỏ được một lớp card / viền / bóng không?
5. Động hiệu ở đây đang diễn tả vật lý, hay đang biểu diễn? — Biểu diễn thì xóa.

---

## 7. Điểm neo triển khai

| Năng lực | Vị trí |
| --- | --- |
| Token thiết kế | `assets/css/style.css` `:root` |
| Chuyển mặt phẳng | `YYSD_SURFACE` → `assets/js/ui.js` |
| Xác nhận thương hiệu | `YYSD_CONFIRM` / `YYSD_ALERT` / `YYSD_ASK` → `assets/js/ui.js` |
| Chuyển trang | `assets/js/page-transit.js` |
| Bản địa hóa | `assets/js/i18n/` · `localization/vi/` |
| Trò chơi hóa | `assets/js/gamification/` · `practice-hub.html` |
| Tự kiểm tra | `node scripts/check_surface.js` · `node scripts/check_apple_shell.js` |

---

## 8. Danh sách không làm

- Thêm bounce / kính mờ «giả sang» cho nút CDT hay void lock
- Đưa thư viện spring animation lên toàn trang khi chưa có nhu cầu minh chứng
- Overshoot ở tình huống không có quán tính
- Chồng hai lớp bán trong suốt nhạt (đọc không nổi)
- Blur toàn trang để phô diễn kĩ thuật

---

*Khi sửa chỉ sửa quy tắc, không chất thêm ví dụ. Mô hình mới phải qua «năm câu hỏi» rồi mới vào mã.*
