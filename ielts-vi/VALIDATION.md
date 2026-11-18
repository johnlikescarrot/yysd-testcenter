# Phạm vi và kiểm định

## Người học mở gì?

**Sải bước** là bản tĩnh không đăng nhập, có đường dẫn từ trang chủ và mục IELTS trong cổng YYSD. Bản xuất bản chỉ chứa trang học, sáu sổ tay HTML/PDF, bốn đoạn nghe tự tạo và tài nguyên giao diện. Không mang tên miền sản xuất cũ, tài khoản, khóa dịch vụ, máy chủ hoặc hàng GB đề và âm thanh lên Pages.

Bản dịch trong cổng có tài khoản giữ mã đề, mã câu, đường dẫn, khóa lưu kết quả và nội dung thi tiếng Anh. Lượt cập nhật này bao gồm giao diện điều hướng IELTS và danh mục 620 bài, phần bao quanh 226 đề Cambridge, 4 đề xếp lớp, 7 bài phân tích câu phức (46 câu), bài nghe chép số, 32 bài từ vựng chuyên kỹ năng, danh mục 1.704 PDF A-Level và 199 đoạn dịch trong bốn phần của Cambridge 10 Test 1. Danh mục A-Level là thông tin bên ngoài tệp PDF; không sửa các đề gốc. Nhận xét mới từ API luyện thi được yêu cầu viết bằng tiếng Việt; giám khảo mô phỏng vẫn hỏi bằng tiếng Anh. Bản Pages không gọi API này.

**Chưa Việt hóa hết kho cũ.** Ví dụ: vẫn còn lời giải của một số đề Nghe/Đọc Cambridge; 235 phần nghe chuyên sâu chưa có đủ bản dịch tiếng Việt; các kho từ THPT/CET-4, TOEFL/HIT, dữ liệu tuyển sinh, một số màn hình và thông báo trong API. Không thay chúng bằng văn bản rỗng hoặc dịch từng ký tự để vượt kiểm tra. Kết quả cũ và nội dung do người dùng nhập cũng không bị sửa.

```sh
python3 scripts/report_localization.py --release quality/dist
python3 scripts/report_localization.py --list
python3 scripts/report_localization.py --base de5ee6b
```

Lệnh đầu là điều kiện phát hành cho **bản tĩnh**, kiểm tra cả mã đã đóng gói, sổ tay HTML và `lang="vi"`. Hai lệnh sau kiểm kê kho Git. Dấu vết một hệ chữ khác có thể là văn bản cần dịch, tên riêng, khóa tương thích ngược hoặc chú thích lập trình; đây **không** phải cách tính tỷ lệ hoàn thành dịch thuật. Công cụ không nhận diện ngôn ngữ dùng chung bảng chữ Latin, giọng nói hay ảnh quét.

## Kiểm định có thể chạy lại

| Kiểm tra | Phạm vi |
| --- | --- |
| `npm test --prefix quality` | 25 test về bài học, chấm đáp án, ngày học và chuỗi ngày, ôn đến hạn, lưu trữ, DOM, dữ liệu học liệu, PDF. C8 bắt buộc **100% từng mô-đun** của `ielts-vi/assets/*.js` cho dòng, câu lệnh, nhánh và hàm. Không phải coverage cho máy chủ hay toàn bộ monorepo. |
| `npm run test:portal --prefix quality` | 15 test hồi quy: mã đề, dữ liệu danh mục, đề đọc mẫu, đáp án 40/40, bài viết nháp, nộp đủ 4 đề xếp lớp, hiển thị bản dịch theo câu và ngôn ngữ phản hồi. Kiểm tra hợp đồng lời nhắc AI, không mô phỏng điểm thật của dịch vụ bên ngoài. |
| `npm run test:browser --prefix quality` | Chromium thật ở hai kích thước màn hình, bàn phím, âm thanh giải mã được, lưu kết quả qua tải lại, ôn câu sai, tải PDF và đọc sổ tay. Chạy `npm run build --prefix quality` trước. |
| `npm run lighthouse --prefix quality` | Lighthouse 13.6.0 kiểm tra trang học và 6 sổ tay dưới đường dẫn dự án, cấu hình mobile **và** desktop. Cả 14 báo cáo đều phải đạt 100 ở Performance, Accessibility, Best Practices và SEO; không bỏ qua audit tính điểm. Cho URL công khai qua `IELTS_PAGES_URL` để đo lại sau triển khai. |
| `python3 scripts/verify_cambridge_mock_pages.py` | 226 trang đề; số câu, cấu trúc và dữ liệu chấm. |
| `python3 scripts/verify_vocab_wrongword_hooks.py` | 110 bài từ vựng và mẫu soạn bài; kiểm tra điểm nối với hệ thống ghi từ sai. |
| Super-Linter | Chạy khi đẩy nhánh, cập nhật PR và theo lịch. Kiểm tra workflow, HTML, CSS, JavaScript và JSON của bản phát hành, không lẫn các kho đề và dữ liệu gốc. |

Số liệu Lighthouse là phép đo trong môi trường cụ thể, không phải cam kết về mọi thiết bị. CI đính kèm `ielts-vi-quality-reports` (báo cáo Lighthouse HTML/JSON và LCOV) và `ielts-vi-static-preview`. Chỉ coi Pages là đã công bố khi job **Triển khai GitHub Pages** của lượt `push` trả về URL. Trạng thái xanh của job kiểm định trên PR không phải là trạng thái triển khai.

Các kiểm tra giao diện cũ `check_surface.js` và `check_apple_shell.js` vẫn báo thiếu `YYSD_SURFACE` và `--chrome-bg` ở mã nền `de5ee6b`. PR không sửa hai kiểm tra đó để làm chúng báo xanh. `node scripts/check_toefl_paper.js` và `node scripts/check_cet4_lite.js` chạy riêng.

## Nguồn nghiên cứu và kiểm tra PDF

Sáu sổ tay dùng **28 công trình khác nhau**, với 43 lượt trích nguồn nghiên cứu trong danh mục cuối tài liệu (một công trình có thể xuất hiện ở nhiều sổ). Từng công trình có tác giả, năm, tên bài gốc, tạp chí, DOI và liên kết tra Google Scholar. Thông tin về thể thức thi dẫn riêng về IELTS. Không sao chép bài báo trả phí và không tuyên bố lịch ôn của ứng dụng bảo đảm tăng band.

- Đối chiếu trực tiếp trên Scholar, ví dụ: [Kim & Webb – học giãn cách](https://scholar.google.com/scholar?q=%2210.1111%2Flang.12479%22), [Kang & Han – phản hồi bài viết](https://scholar.google.com/scholar?q=%2210.1111%2Fmodl.12189%22), [Webb và cộng sự – hoạt động học từ](https://scholar.google.com/scholar?q=%2210.1111%2Fmodl.12671%22).
- Khi Scholar yêu cầu xác minh trình duyệt, dùng nguồn của nhà xuất bản, chẳng hạn [Lambert, Kormos & Minn – luyện nói lặp lại](https://doi.org/10.1017/S0272263116000085). Liên kết tìm theo DOI là phương tiện tra cứu, không đồng nghĩa với đã đọc toàn văn trên Scholar.
- `quality/materials.mjs` chứa nội dung, liên hệ giữa nhận định và nguồn. Các phụ lục Nghe/Đọc/Viết được sinh từ 32 bài trong `library/study/vocab-special-*`, không phải dữ liệu của nhà xuất bản khoa học. HTML có chương thu gọn; PDF có mục lục và phông chữ hỗ trợ tiếng Việt.
- Test đọc **đối tượng liên kết thật trong PDF**, đối chiếu DOI và URL Scholar với phần tham khảo, kiểm tra số trang và 986 mục trong phụ lục. CI tạo lại rồi so sánh PDF, HTML, thẻ từ và âm thanh với bản trong Git.
