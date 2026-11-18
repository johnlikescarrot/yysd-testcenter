# Bảng Kiểm Đối sánh Năng lực IELTS CDT (Phương án B)

> **Quy chuẩn cốt lõi và cột mốc:** [`CDT-PLAN-B.md`](CDT-PLAN-B.md) (B0 đã chốt ngày 31/07/2026)  
> **Tiêu chuẩn đối sánh:** Kỳ thi IELTS on Computer chính thức (BC / IDP Familiarisation)  
> **Ký hiệu trạng thái:** `✅` Đã đạt chuẩn · `⚠️` Đã có nhưng chưa hoàn toàn khớp · `❌` Còn thiếu · `N/A` Không áp dụng  
> **Quy tắc cập nhật:** Sau khi hoàn thành kiểm tra mỗi cột mốc, cập nhật trực tiếp vào dòng tương ứng; không quay lại chiến lược cũ «chỉ phòng thi mới dùng giao diện CDT»  

---

## Tóm tắt Chiến lược Triển khai

| Tiêu chí | Nghị quyết thống nhất |
|---|---|
| Phạm vi áp dụng | Cambridge L / R / W **Luyện tập + Thi thử** toàn bộ đều áp dụng giao diện CDT |
| Quy tắc hoạt động | Một giao diện khung - Hai gói quy tắc: `exam` / `drill` (khác nhau về quy tắc, không khác biệt về bộ điều khiển giao diện) |
| Loại trừ | Môn Nói, Câu phức học thuật, Nghe chép chính tả, Nghe sâu, Tủ từ vựng |
| Đánh giá hiện trạng | **Phương án B đã hoàn thành DoD** (từ B0 đến B5); Mẫu chuẩn C01–C20 đạt 20/20 tại môi trường nội bộ; G6 kiểm tra song song với Inspera đã xác nhận đạt |

---

## 0. Sản phẩm và Cổng truy cập

| # | Tính năng | Chuẩn chính thức / Mục tiêu | Trạng thái tại YYSD | Cột mốc |
|---|---|---|---|---|
| 0.1 | Thi thử liên hoàn L → R → W | ✅ | ✅ Tham số `?cdt=1` tự động chuyển tiếp + `cdt-report` | Khung CDT DONE |
| 0.2 | Luyện tập từng kỹ năng cũng dùng giao diện CDT | ✅ Cùng giao diện khung | ✅ Cổng `cambridge` → `?cdt=1`, cổng khởi động cho phép chọn gói quy tắc | B1 DONE |
| 0.3 | Chọn gói drill / exam trước khi thi (chỉ chọn quy tắc) | — | ✅ Cổng CDT cho phép chọn «Practice / Mock test» | B1 DONE |
| 0.4 | Môn Nói tách biệt khỏi khung giao diện 3 môn kia | ✅ | ✅ Tách biệt độc lập | N/A |
| 0.5 | Các công cụ học chuyên sâu không đưa vào khung CDT | — | ✅ Nằm ngoài giao diện phòng thi | N/A |
| 0.6 | Đề thi định dạng Cambridge do giáo viên tải lên mặc định dùng CDT | — | ⚠️ Có thể chọn tham số `cdt=1`, chưa áp dụng làm mặc định | B1 |
| 0.7 | Báo cáo sau khi nộp bài | Hiển thị điểm số / Giải thích chi tiết cho bài luyện tập | ✅ Báo cáo điểm hoàn chỉnh; phần phân tích bài luyện tập đang chuẩn hóa | B1 |

---

## 1. Cổng Khởi động Phòng thi

| # | Tính năng | Trạng thái tại YYSD | Cột mốc |
|---|---|---|---|
| 1.1 | Xác nhận thông tin cá nhân (Confirm your details) | ⚠️ Đã có; sử dụng thông tin mẫu | B1 Tinh chỉnh |
| 1.2 | Kiểm tra âm thanh (Test sound phần Nghe) | ⚠️ Đã có; âm thanh bíp đơn giản | B1 / B4 |
| 1.3 | Hướng dẫn làm bài → Bắt đầu thi (Instructions → Start test) | ✅ Đã hoàn thiện trên toàn bộ đề thi | Khung CDT DONE |
| 1.4 | Chế độ drill có thể rút ngắn cổng khởi động (Sound / Info → Start, bỏ qua bước Confirm) | ✅ Đã hỗ trợ | B1 DONE |
| 1.4b | Chế độ drill cho phép chọn trước Section / Passage cần làm | ✅ Cổng khởi động hỗ trợ `cdt-gate-sections` → `.secbox` | 31/07/2026 |
| 1.5 | Thông báo thời gian khớp với thực tế (bao gồm 2 phút kiểm tra cuối bài) | ✅ Hiển thị chính xác thông báo 2 phút cuối; hết bài chuyển sang màn hình kiểm tra | B2 DONE |

---

## 2. Thanh Điều hướng Giao diện (Top Chrome)

| # | Tính năng | Trạng thái tại YYSD | Cột mốc |
|---|---|---|---|
| 2.1 | Thanh điều hướng nền màu đậm | ✅ Kích hoạt khi có tham số `?cdt=1` | Khung CDT DONE |
| 2.2 | Logo thương hiệu + Tên bộ đề thi | ✅ Đầy đủ | Khung CDT DONE |
| 2.3 | Đồng hồ đếm ngược `N minutes left` | ✅ Đầy đủ | Khung CDT DONE |
| 2.4 | Nút hoàn thành phần thi (Finish section) | ✅ Kèm theo hộp thoại xác nhận | Khung CDT DONE |
| 2.5 | Cài đặt (Setting) → Tùy chỉnh cỡ chữ (Text size) | ✅ Đầy đủ | Khung CDT DONE |
| 2.6 | Cài đặt (Setting) → **Màu nền (Background colour)** | ✅ Hỗ trợ Trắng (White) / Kem (Cream) / Xanh nhạt (Pale blue) | B4 DONE |
| 2.7 | Ba tab hướng dẫn (Help tabs) | ✅ Hiển thị đầy đủ Information / Test / Task bằng tiếng Anh | B4 DONE |
| 2.8 | Nút ẩn bài thi (Hide) kèm đồng hồ chạy ngầm | ✅ Đầy đủ | Khung CDT DONE |
| 2.9 | Thanh điều chỉnh âm lượng phần Nghe | ✅ Đầy đủ trên thanh điều hướng | Khung CDT DONE |
| 2.10 | Cảnh báo **nhấp nháy** khi còn 10 phút / 5 phút | ✅ Lớp `is-flash` kích hoạt khi ≤10 phút | B2 DONE |

---

## 3. Thanh Chân trang Giao diện (Bottom Bar)

| # | Tính năng | Trạng thái tại YYSD | Cột mốc |
|---|---|---|---|
| 3.1 | Đánh dấu xem lại: Chuyển từ hình vuông sang hình tròn | ✅ Đầy đủ | Khung CDT DONE |
| 3.2 | Phân nhóm số câu hỏi theo từng Part | ✅ Đầy đủ | Khung CDT DONE |
| 3.3 | Trạng thái câu hỏi: Đã trả lời / Chưa làm / Cần xem lại | ✅ Đầy đủ | Khung CDT DONE |
| 3.4 | Nút mũi tên chuyển câu trước / sau | ✅ Đầy đủ | Khung CDT DONE |
| 3.5 | Hiển thị Part 1 / Part 2 của bài Viết | ✅ Đầy đủ | Khung CDT DONE |

---

## 4. Khu vực Làm bài · Kỹ năng Nghe (Listening)

| # | Tính năng | Trạng thái tại YYSD | Cột mốc |
|---|---|---|---|
| 4A.1 | Tông màu xám lam lạnh kết hợp nền giấy câu hỏi màu trắng | ✅ Giao diện chuẩn CDT | Khung CDT DONE |
| 4A.2 | Tự động phát âm thanh khi bắt đầu; **cấm tua tiến / lùi / phát lại** | ✅ Đã khóa thanh tiến độ, nút phát và chuyển phần | B2 DONE |
| 4A.3 | Dành riêng **2 phút kiểm tra đáp án** ở cuối bài | ✅ Hết băng âm thanh → Chuyển sang màn hình đếm ngược 120 giây | B2 DONE |
| 4A.4 | Ô nhập liệu cho dạng bài điền từ | ✅ Đầy đủ | Khung CDT DONE |
| 4A.5 | Kéo và thả cho dạng bài nối cặp (DnD) | ✅ Sử dụng `cdt-qux.js` hỗ trợ kéo thẻ vào ô thả | B3 DONE |
| 4A.6 | Chọn vị trí trên bản đồ / Kéo thả nhãn | ✅ Hỗ trợ kéo thả chữ cái vào vị trí bản đồ | B3 DONE |
| 4A.6b | Dạng bài chọn nhiều đáp án (Choose TWO) | ✅ Nhấp chọn chữ cái ghi nhận vào hộp chọn kép | B3 DONE |
| 4A.7 | Chỉ mở khóa tính năng nghe lại sau khi đã nộp bài | ✅ Chế độ drill sau khi nộp bài sẽ mở khóa bộ phát âm thanh | B2 DONE |

---

## 5. Khu vực Làm bài · Kỹ năng Đọc (Reading)

| # | Tính năng | Trạng thái tại YYSD | Cột mốc |
|---|---|---|---|
| 4B.1 | Đoạn văn bài đọc bên trái / Câu hỏi bên phải | ✅ Đầy đủ | Khung CDT DONE |
| 4B.2 | Hai cột cuộn độc lập | ✅ Đầy đủ | Khung CDT DONE |
| 4B.3 | Có thể kéo dãn độ rộng thanh ngăn cách giữa hai cột | ✅ Hỗ trợ kéo dãn qua `.yysd-cdt-split` | B5 DONE |
| 4B.4 | Kéo thả cho dạng bài nối cặp và điền từ | ✅ Tích hợp qua `cdt-qux` | B3 DONE |
| 4B.5 | Sao chép và dán từ bài đọc vào ô trả lời | ⚠️ Hỗ trợ theo cơ chế mặc định của trình duyệt | B3 / B4 |

---

## 6. Khu vực Làm bài · Kỹ năng Viết (Writing)

| # | Tính năng | Trạng thái tại YYSD | Cột mốc |
|---|---|---|---|
| 4C.1 | Đề bài (+ biểu đồ) bên trái / Khung làm bài bên phải | ✅ Đầy đủ | Khung CDT DONE |
| 4C.2 | Bộ đếm số từ tự động (Word count: N) | ✅ Đầy đủ | Khung CDT DONE |
| 4C.3 | Nhắc nhở ngưỡng số từ tối thiểu cho từng Task | ✅ Đầy đủ | Khung CDT DONE |
| 4C.4 | Vô hiệu hóa kiểm tra chính tả (`spellcheck=false`) | ✅ Cấm kiểm tra chính tả và sửa lỗi tự động trong khung viết | B4 DONE |

---

## 7. Bộ Công cụ Phòng thi

| # | Tính năng | Trạng thái tại YYSD | Cột mốc |
|---|---|---|---|
| 7.1 | Đánh dấu nổi bật (Highlight): Nhấp chuột phải + **đa màu sắc** | ✅ Hỗ trợ Vàng / Xanh lá / Hồng / Xanh dương; menu 100% tiếng Anh | B4 DONE |
| 7.2 | Sổ tay ghi chú độc lập (Notepad cho L / R / W) | ✅ Nút Notepad trên thanh điều hướng + lưu phiên làm việc | B4 DONE |
| 7.3 | Toàn bộ giao diện phòng thi hiển thị bằng tiếng Anh | ✅ Menu highlight, cổng khởi động và khung thi 100% tiếng Anh | B4 DONE |

---

## 8. Gói Quy tắc Hoạt động

| # | Tính năng | Trạng thái tại YYSD | Cột mốc |
|---|---|---|---|
| 8.1 | Chế độ exam: Rời trang tự động hủy bài (void) | ✅ Tham số `pack=exam` kích hoạt khóa rời trang | B1 DONE |
| 8.2 | Chế độ drill: Cho phép tiếp tục bài thi dở dang, không hủy bài | ✅ Tham số `pack=drill` hiển thị nút Continue / Start over | B1 DONE |
| 8.3 | Hình thái bộ điều khiển của exam và drill hoàn toàn giống nhau | ✅ Cùng một giao diện khung CDT; chỉ khác gói quy tắc | B1 DONE |
| 8.4 | Hết thời gian cưỡng chế thu bài (áp dụng cho cả hai gói) | ✅ Hết giờ tự động nộp bài và chuyển tiếp | B1 DONE |

---

## 9. Ánh xạ Cột mốc Phát triển

| Ký hiệu cũ | Nội dung tương ứng | Vị trí mới |
|---|---|---|
| M1–M6 Shell (23/07/2026) | Giao diện khung `?cdt=1` cho bài thi trọn bộ | **Giữ lại làm nền tảng cốt lõi** |
| — | Đưa bài luyện tập vào khung CDT + hai gói quy tắc | **B1 DONE** |
| — | Khóa nghiêm ngặt âm thanh + 2 phút kiểm tra cuối bài | **B2 DONE** |
| — | Bộ điều khiển dạng bài kéo thả (DnD) | **B3 DONE** |
| — | Sổ tay Notepad / Highlight đa màu / Đổi màu nền | **B4 DONE** |
| — | Đối sánh mẫu chuẩn đạt tỷ lệ ≥95% | **B5 DONE (20/20)** |

---

## 10. Tiêu chí Nghiệm thu Nhanh Khung Giao diện

Khi mở bất kỳ đề thi Cambridge IELTS nào có tham số `?cdt=1`, các tiêu chí sau phải được đáp ứng:

1. Thanh điều hướng nền màu đậm + dòng thời gian `minutes left` + các nút Finish / Setting / Help / Hide.
2. Thanh chân trang hiển thị Review + phân nhóm số câu Part + nút chuyển câu tròn.
3. Khu vực làm bài có tông màu xám lam lạnh chuẩn mực.
4. Môn Nghe có điều chỉnh âm lượng và bước kiểm tra âm thanh; Môn Đọc và Viết có chia cột hai bên kèm bộ đếm từ Word count.
5. Khi ẩn bài thi (Hide) đồng hồ vẫn chạy ngầm; khi bấm Finish có thể chuyển tiếp hoặc xuất báo cáo kết quả.
