# Phạm vi kiểm tra · 18-11-2026

## Phần đã kiểm chứng

- **7 bài kiểm thử Node** cho 4 module trình duyệt của Atlas: 100% dòng, nhánh và hàm. Kiểm tra chọn đáp án, phiên bỏ dở, tải lại, dữ liệu lưu hỏng, hạn mức lưu, chống cộng XP trùng, ôn đến hạn, mốc ngày địa phương, hạng tuần và huy hiệu. Tái hiện bằng `npm test`. Đây **không phải coverage toàn repository**.
- **Chromium, dưới `/yysd-testcenter/`:** hoàn thành phiên học, tải lại để kiểm tra XP, mở bài ôn, kiểm tra âm thanh, bàn phím và bề rộng 360 px. Làm cả **153 đề** qua bộ chấm gốc (79 đề nghe/đọc và 74 đề viết), cả bảy bài phân tích câu, bài đọc 8 câu và bài nghe ghi số. Không bỏ qua lỗi console hay tài nguyên 404 khi làm bài.
- **Kho nguồn:** `python3 scripts/verify_cambridge_mock_pages.py` kiểm tra 226 đề. So sánh cây dữ liệu `TEST` trước/sau với commit gốc `de5ee6b`: **6.080 câu khách quan**, không phát hiện thay đổi ở giá trị tiếng Anh, ID hoặc đáp án có từ trước. Với hai tệp JSON đã dịch của Cambridge 20 Test 1, lời tiếng Anh và mốc bắt đầu/kết thúc được giữ nguyên.
- **PDF:** mỗi tệp 3 trang A4, có văn bản tiếng Việt tìm kiếm được. `pypdf` đọc lại annotation của từng PDF và đối chiếu các cặp DOI/Google Scholar với bản HTML: 12 cặp trong cẩm nang và 7 cặp trong phiếu thực hành. Không tính hai lần thành 19 công trình riêng biệt.
- **Tích hợp cũ:** kiểm tra hook sổ từ sai, chỉ mục CET-4 Lite và đề TOEFL đều chạy thành công. Hai kiểm tra giao diện cũ `scripts/check_surface.js` và `scripts/check_apple_shell.js` vẫn báo thiếu `YYSD_SURFACE` và `--chrome-bg` trong các tệp chung từ bản gốc. Đây không phải các kiểm tra của bản Atlas và không được tính như đã đạt.

## Lighthouse

[Workflow kiểm thử](../.github/workflows/learning-path-pages.yml) lưu LHR JSON đầy đủ dưới artifact `lighthouse-mobile`. Lệnh `npm run audit:pages` dùng mobile mặc định của Lighthouse 13.6.0 và Chromium 149, không tắt audit, không bỏ qua category. Phục vụ **gói xuất bản** dưới đường dẫn con thay vì đo HTML mẫu hoặc URL trên nhánh khác. Báo cáo các lượt độc lập và trung vị theo từng tiêu chí; ngưỡng CI là 100 cho Performance, Accessibility, Best Practices và SEO. Đây là số đo phòng thử nghiệm ở thời điểm tải trang, không phải dữ liệu người dùng thật, mọi trạng thái sau đăng nhập hay điểm của một bản Pages chưa được triển khai.

## Bản dịch còn lại trong kho

Kiểm tra chữ Hán trong **tất cả HTML/module/JSON/SVG được đóng gói** là một hàng rào hồi quy, không phải công cụ nhận diện mọi ngôn ngữ. Không dùng lớp phủ trình duyệt để giấu nội dung chưa dịch. Audio, nội dung đề và phương án trả lời bằng tiếng Anh được giữ lại.

| Kho gốc `library/` | Tình trạng |
| --- | --- |
| `mock/cambridge-writing` | 74/74 trang đã chuyển sang Việt/Anh. |
| `mock/cambridge-reading` | 51/78 trang không còn chữ Hán. 27 trang còn lời giải chi tiết chưa dịch hết. |
| `mock/cambridge-listening` | 49/74 trang HTML không còn chữ Hán. 25 trang còn lời giải; phụ đề JSON được kiểm kê riêng. Bản Pages chọn 28 đề có đủ bản ghi âm trong ngân sách tệp. |
| `practice/**/*.html` | 10/10 trang không còn chữ Hán, gồm 7 bài phân tích câu và bài nhắc lại 75 câu. Bài nhắc lại cần dịch vụ giọng nói của trình duyệt nên không đưa chế độ gửi lời để chấm AI vào bản Pages. |
| `practice/jingting/data` | Đã dịch 60 đoạn gắn mốc của `cam20-t1-p1.json`. 238/239 tệp JSON trong thư mục còn chữ Hán; không coi việc dịch nút điều khiển là đã dịch toàn bộ lời thoại. |
| `mock/ielts`, `study` | 4 đề xếp lớp và 141 trang học/từ vựng cũ vẫn còn nội dung cần dịch. |
| Các sản phẩm khác | Khu giáo viên/quản trị, API, bộ TOEFL, tuyển sinh và các sản phẩm khác chưa Việt hóa toàn bộ. Giữ nguyên 1.844 PDF A-Level của kho, không thay nội dung đề/đáp án gốc. |

Trang chủ chính, menu động, lối vào Cambridge, phòng thi, báo cáo, đăng nhập/đăng ký/khôi phục mật khẩu và giao diện nghe kỹ cũng đã được Việt hóa. Việc này không làm thay đổi giới hạn xác thực số di động do máy chủ quy định.

## Trạng thái công bố

Đường triển khai của chính nhánh này đã được chạy. Ví dụ: [kiểm thử PR thành công](https://github.com/johnlikescarrot/yysd-testcenter/actions/runs/44219015023), [Super-Linter thành công](https://github.com/johnlikescarrot/yysd-testcenter/actions/runs/44219014964), [lần xuất bản bị GitHub từ chối](https://github.com/johnlikescarrot/yysd-testcenter/actions/runs/44217703245). Môi trường `github-pages` hiện cho phép `main`, không cho phép nhánh PR. Không đổi chính sách hoặc merge PR để vượt giới hạn đó.
