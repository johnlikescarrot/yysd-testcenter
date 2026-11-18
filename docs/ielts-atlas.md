# IELTS Atlas: nội dung, kiểm định và phát hành

## Học và ôn

Mỗi chặng có ngữ cảnh, ba câu lựa chọn và phản hồi giải thích đáp án. Hai chặng nghe dùng đoạn cắt từ `ielts19_test1_audio1.mp3` trong thư viện (129,92–152,26 giây và 153,40–176,95 giây); phần văn bản đi kèm là **tóm tắt**, không phải bản chép lời chính thức. Chặng nói khuyến khích tự trả lời thành tiếng, không giả lập việc nghe hoặc chấm giọng của học viên.

Lần hoàn thành đầu tiên của mỗi chặng trong ngày được 10 XP; mỗi câu đúng được thêm 5 XP tối đa một lần trong ngày, kể cả khi ôn lại. Bỏ dở bài không cộng điểm. Câu sai đến hạn ngay, câu đúng trở lại lần lượt sau 1, 3, 7, 14, rồi 30 ngày. Ôn sớm câu đã đúng không đẩy hạn lùi xa hơn. Lượt ôn lấy tối đa năm câu quá hạn lâu nhất. Các mốc này là quyết định sản phẩm, không phải lịch được chứng minh là tối ưu cho mọi người.

Mục tiêu tính các chặng khác nhau trong ngày; ôn tập được tính như một chặng. Chuỗi ngày dùng lịch địa phương, không dùng khoảng 24 giờ trượt. Nếu hôm nay chưa học, chuỗi kết thúc ở hôm qua vẫn hiện cho tới hết hôm nay. Mốc đã đạt không mất khi chuỗi đứt. Hạng Đồng/Bạc/Vàng/Bạch kim dựa trên 0/75/150/300 XP trong tuần, tính lại từ thứ Hai, không xóa tổng XP. Làm đề dài được ghi ở nhật ký riêng bằng số câu đúng hoặc số từ, không cộng XP như bài ngắn.

Hai khóa lưu trữ của bàn học là `yysd:ielts-atlas:v1` và `yysd:ielts-atlas:results:v1`. Nhật ký giữ tối đa mười bản ghi; không chép bài làm, bản ghi âm hay dữ liệu tài khoản vào đó. Thiết bị chặn lưu trữ vẫn làm được bài, nhưng không bảo đảm giữ lại tiến độ khi đóng trang.

## Dữ liệu và nghiên cứu

- Nguồn bài học ngắn: `studio/src/lessons.mjs`. ID câu ổn định để lịch ôn không lẫn giữa các phiên bản. Bản đồ, biểu tượng và kiểu chữ của Atlas không gọi máy chủ ảnh/phông chữ bên ngoài.
- Kệ đề lấy trực tiếp các trình làm bài cũ trong `library/mock/cambridge-{listening,reading,writing}` và `library/mock/ielts`. Không dựng lại một trình chấm thứ hai. Kệ nói lấy 41 chủ đề Part 1 và 54 thẻ Part 2 kèm Part 3 từ `data/speaking/jiijing-banks/2026-q2.json`.
- `scripts/studio/guides.json` là nguồn chung cho PDF và bản HTML. Năm sổ tay sử dụng **18 công trình khác nhau, 22 mục trích dẫn** (một số công trình xuất hiện trong nhiều sổ tay). DOI nhận diện ấn phẩm; liên kết Google Scholar tìm đúng nhan đề, không dùng số lượt trích dẫn như bằng chứng hiệu quả. Phân biệt nghiên cứu trong lớp học hoặc phòng thí nghiệm với kết quả IELTS. Số từ, điểm tự đánh giá, XP và band tham khảo không thể thay cho kỳ thi thật.
- Khi sửa sổ tay: cài phụ thuộc Python và phông DejaVu (`fonts-dejavu-core` trên Debian/Ubuntu), chạy `python scripts/studio/guides.py`. Khi sửa ngân hàng nói, mô tả sổ tay hoặc danh mục đề, chạy `python scripts/studio/build.py --catalog`. Build từ chối một trang thư viện lỗi thời.
- Khi nhập lại đề từ bộ soạn cũ, giữ nguyên vỏ tiếng Việt, khóa nháp và trình kết xuất của chính đề đó. `scripts/cambridge_localized.py` từ chối ghi đè khi đầu vào mới cần dịch. Một số bộ nhập lịch sử cần tệp nguồn của giáo viên; **không** cần chạy chúng để đóng gói Pages.
- Các hình gốc còn thiếu trong tài liệu nguồn có thông báo đối chiếu với sách. Không dựng số liệu hoặc bản đồ để thay hình thiếu.

[Kết quả kiểm định ngày 18/11/2026](atlas-verification.md).

## Các phép kiểm tra và giới hạn

| Kiểm tra | Phạm vi thực tế |
| --- | --- |
| `npm test` | Toàn bộ `studio/src/**/*.mjs` (cả các điểm khởi chạy); yêu cầu **100% dòng, câu lệnh, hàm và nhánh**. Thử có/chặn lưu trữ, dữ liệu hỏng, đổi ngày/tuần, lịch ôn, điểm, DOM, nhật ký và giao thức chấm viết cũ. Không phải tuyên bố coverage toàn bộ monorepo, trình phát nội tuyến cũ hay mã Python. |
| `npm run test:papers` | Chạy JavaScript của **231 trang đề** trong DOM; chấm không câu nào đúng và toàn bộ đáp án đúng cho đề Cambridge khách quan; kiểm tra bộ đếm từ, khôi phục bản nháp, đồng hồ, sao chép bài viết, bản chép lời và sự kiện kết quả. So khớp hàm băm phần cốt lõi (khóa đáp án, câu hỏi/phương án, đoạn đọc, đề viết) của đủ 226 đề Cambridge với bản trước Việt hóa `de5ee6b`. |
| `npm run test:browser` | Chromium thật trên đường dẫn con: hoàn thành chặng, tải lại, phát và tua MP3, bật bản dịch theo thời gian, khôi phục bài viết, lưu kết quả mà không lưu bài luận, lọc kỹ năng và đóng hộp thoại bằng bàn phím trên màn hình nhỏ. |
| `check_release.py` | Tất cả liên kết/neo HTML của bản đóng gói; mở từng PDF, kiểm tra 2 trang, nhan đề, tiếng Việt, số trích dẫn nội văn, URI DOI và Google Scholar qua các đối tượng liên kết thực. Build cũng kiểm tra tệp media tồn tại, không còn ký tự Hán/Nhật/Hàn trong tài sản văn bản đã xuất, và dung lượng không quá 780 MiB. |
| Lighthouse | Lighthouse 13.6.0, thiết lập di động mặc định; trang chủ, thư viện, bài mẫu và ba trang nghe/đọc/viết đại diện. Ba lượt điều hướng mới cho mỗi trang; ngưỡng 100 cho **trung vị** Performance và **mọi lượt** Accessibility, Best Practices, SEO. `quality-reports` giữ cả 18 báo cáo HTML, từng điểm số và LCOV. Máy chủ thử đặt dưới `/yysd-testcenter/`, nén nội dung văn bản, không bỏ audit hay thay nội dung theo user-agent. Kết quả phòng thử không phải điểm đo trên tên miền công khai. |
| Super-Linter | Chạy khi push, có PR, theo lịch và thủ công. Kiểm tra mã Atlas và HTML đề trong bản phát hành. Giữ quy ước ID cũ (ví dụ `Q36a`, `resCorrect`) để không phá cầu nối chấm điểm; không áp quy tắc đổi tên ID kiểu kebab-case lên các phần tử này. |

Bản Pages chỉ gồm bàn học, thư viện và các tài sản nó dùng. Các sản phẩm TOEFL, tuyển sinh, A-Level, trang quản trị và các sổ từ/luồng API khác của hệ thống trường không nằm trong bản này. Chưa có chứng nhận Việt hóa, Lighthouse hoặc coverage toàn bộ các sản phẩm đó. Hai kiểm tra giao diện cũ `check_surface.js` và `check_apple_shell.js` cũng không phải kiểm tra của Atlas: bản gốc thiếu `YYSD_SURFACE` và token `--chrome-bg` trong các tệp chúng kiểm tra.

## GitHub Pages

Chọn **Settings → Pages → Build and deployment → GitHub Actions**. Workflow `studio-pages.yml` chỉ tải `dist/` khi các bước chất lượng đã qua. Bản gốc của 296 đoạn âm thanh được giữ nguyên trong Git; chỉ bản sao trên Pages được nén mono 48 kb/s. Trình build dùng cache theo nội dung nguồn và bộ mã hóa; lỗi build không xóa bản phục vụ trước đó.

PR chỉ kiểm định. Commit có `[package-pages]` trên nhánh của PR tạo artifact mới mà không yêu cầu triển khai. Push lên `main` xuất bản tự động. Có thể yêu cầu phát hành từ nhánh phát triển của PR bằng commit có `[publish-pages]`; GitHub vẫn kiểm tra môi trường **`github-pages`**. Khi workflow đã có trên nhánh mặc định, có thể chạy thủ công với tùy chọn `publish` trên ref được phép. Nếu môi trường chỉ cho `main`, người quản lý phải cho phép đúng nhánh tại **Settings → Environments → github-pages → Deployment branches and tags**, hoặc xuất bản từ `main` sau khi tích hợp. Không coi gói artifact đã tạo là một lần triển khai thành công.
