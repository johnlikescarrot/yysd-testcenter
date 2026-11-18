# Kiểm định bản IELTS tiếng Việt · 18/11/2026

## Kết quả nào đã đo?

| Kiểm tra | Phạm vi và kết quả |
| --- | --- |
| Lighthouse 13.6 | Trang học Sải bước và **4 trang sổ tay HTML**, mỗi trang ở cấu hình di động và máy tính: **100/100** cho hiệu năng, khả năng tiếp cận, thực hành tốt và SEO trong cả 10 lượt trên bản dựng kiểm thử. Không phải điểm đo của tên miền sản xuất. |
| Coverage (c8/V8) | **100% câu lệnh, nhánh, hàm và dòng trên từng tệp** trong 6 mô-đun `ielts-vi/assets/*.js` và `server/profile-name.js`. Không phải coverage của toàn bộ cổng YYSD. |
| Nội dung và trình học | 22 kiểm thử tự động gồm chấm câu, XP, ôn đến hạn, luyện thích ứng, hạng tuần, lưu tiến độ, tên có dấu và sổ tay. Kiểm tra cả DOI và liên kết tra Google Scholar **trong tệp PDF**. Bốn sổ tay (3 trang/cuốn) dẫn 25 công trình khác nhau; thông tin về thể thức thi dẫn riêng tới IELTS. |
| Cổng cũ | 8 kiểm thử hồi quy: danh mục/đề giao, độc lập bản nháp giữa các tập, cú pháp script, đề mẫu đạt 8/8 với cách viết thay thế, nộp đề Đọc và Nghe qua các ô trả lời (40/40), tự kiểm và sao chép bài Viết đúng mã đề, tìm kiếm/phân trang tuyển sinh. Kiểm tra cấu trúc 226 đề Cambridge và 110 danh sách từ/mẫu giáo viên. |
| Chromium | Kiểm tra đường dẫn dự án, di động/máy tính, bàn phím, âm thanh thực, học → nộp → tải lại → ôn, tải sổ tay. Riêng cổng chính: kiểm tra menu trên điện thoại, đóng/mở bằng phím, hủy/xác nhận và chuyển từ trang chủ vào bài luyện miễn phí. Không gọi nhà cung cấp AI hay gửi SMS thật trong CI. |
| Super-Linter | Chạy trên từng PR, khi cập nhật `main`, theo lịch hằng tuần và khi chạy thủ công. Phạm vi: bản Sải bước, công cụ `quality`, workflow của bản này và các JSON danh mục được liệt kê trong workflow. |

Tải báo cáo Lighthouse HTML/JSON, LCOV, ảnh chụp màn hình và kiểm kê ngôn ngữ từ artifact `ielts-vi-quality-reports` của [workflow](https://github.com/johnlikescarrot/yysd-testcenter/actions/workflows/ielts-vi.yml). Mỗi PR còn có artifact `ielts-vi-static-preview` để xem đúng các tệp dự kiến xuất bản.

## Phần đã Việt hóa và phần còn lại

- Cả **620/620** mục thư viện đã có tiêu đề và mô tả không còn chữ Hán. Đường dẫn, mã bài, phân loại, thời lượng và ngày thêm giữ nguyên so với phiên bản trước khi Việt hóa.
- Giao diện của **226/226** đề Cambridge đã được dịch. Khi đối chiếu `TEST` với bản gốc, cấu trúc, đáp án được chấp nhận và toàn bộ giá trị chuỗi vốn chỉ có tiếng Anh không đổi; khác biệt nằm ở lời giải, ghi chú, hướng dẫn song ngữ và chú thích hình.
- Kiểm kê toàn văn HTML: **Nghe 54/74**, **Đọc 53/78**, **Viết 74/74** không còn chữ Hán. Còn **45** đề Nghe/Đọc có lời giải tiếng Trung, ở các tập 13–17, 19 và bộ chuyên sâu. Đếm ký tự không thay cho thẩm định nội dung; không xóa lời giải chưa dịch để làm đẹp số liệu.
- Bản dịch trong tệp JSON kèm âm thanh, dữ liệu từ vựng/ngữ liệu TOEFL, điều kiện tuyển sinh chi tiết, tài liệu PDF cũ và một số chức năng quản trị/ứng dụng phụ **chưa được Việt hóa hoặc kiểm định toàn bộ**. Các tệp này không nằm trong bản dựng Pages. Tên riêng, mã bài đã lưu, tên trường dữ liệu API và câu tiếng Anh không phải nhãn để thay tùy ý.

## Tái lập

```sh
npm ci --prefix quality
npm test --prefix quality
npm run test:portal --prefix quality
node quality/portal-browser.mjs
python3 scripts/audit_ielts_locale.py
python3 scripts/verify_cambridge_mock_pages.py
python3 scripts/verify_vocab_wrongword_hooks.py
python3 scripts/build_manifest.py
node scripts/check_cet4_lite.js
node scripts/check_surface.js && node scripts/check_apple_shell.js
npm run build --prefix quality
npm run test:browser --prefix quality
npm run lighthouse --prefix quality
```

Xem [hướng dẫn Pages](../ielts-vi/README.md#github-pages). Bản xuất tĩnh không chứa CNAME, máy chủ hay dữ liệu tài khoản. **Chưa có URL Pages đã triển khai**: kết nối GitHub của phiên làm việc không có quyền bật Pages (HTTP 403). Cần đặt nguồn **Settings → Pages → GitHub Actions**. Workflow hiện chỉ triển khai từ `main` sau khi kiểm tra đạt; không triển khai mã PR chưa hợp nhất.
