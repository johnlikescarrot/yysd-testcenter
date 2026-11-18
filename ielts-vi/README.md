# IELTS Atlas · Ấn bản tiếng Việt

Mở **[Bàn học](index.html)** để học; chọn **[Thư viện đề](thu-vien.html)** để làm đề. Đây là một bản phát hành tĩnh của YYSD, dùng lại đề, bộ chấm và bản ghi âm của kho gốc. Nó không gọi API đăng nhập, không ghi âm và không gửi bài làm đi. Máy chủ Pages chỉ cần phục vụ tập tin.

## Học và ôn

- 8 bài × 3 câu, gồm nghe, đọc, viết và nói. Phần nói có yêu cầu trả lời thành tiếng và đối chiếu cách phát triển ý; **không** chấm phát âm. Có thể mở lời thoại tiếng Anh thay cho âm thanh.
- Nộp xong một phiên mới ghi tiến độ. Một câu chỉ nhận **5 XP/ngày**, kể cả khi làm lại. Câu sai trở lại ngay; câu trả lời đúng lúc đến hạn được hẹn sau 1, 3, 7 rồi 14 ngày. Đây là lịch theo quy tắc, không phải mô hình dự báo điểm thi.
- Chuỗi ngày tính theo lịch địa phương; nghỉ qua một ngày trống sẽ ngắt chuỗi. Nhật ký hiển thị 7 ngày vừa qua. Huy hiệu dựa trên bài đã học, số kỹ năng và chuỗi dài nhất. Hạng Đồng/Bạc/Vàng là **hạng cá nhân theo XP từ thứ Hai**; không có đối thủ hay bảng xếp hạng giả.
- Dữ liệu lưu ở khóa `yysd.ielts.vi.progress.v1` trong `localStorage`. Trình duyệt chặn lưu vẫn làm bài được trong phiên hiện tại. Không đồng bộ giữa trình duyệt hoặc thiết bị. Điểm đề Cambridge và XP là hai thước đo riêng.

## Thư viện và nghiên cứu

Bản Pages có **153 đề Cambridge** (51 đọc, 28 nghe, 74 viết), 7 bài phân tích với **46 câu phức**, bài đọc mẫu, bài nghe ghi số và một hội thoại nhà hàng có **60 đoạn gắn mốc thời gian**. Giữ nguyên câu hỏi, đáp án, âm thanh tiếng Anh. Những biểu đồ thiếu trong kho được báo thiếu, không được vẽ lại bằng số liệu giả. Bản đầy đủ của trung tâm vẫn giữ những đề không đóng gói ở đây.

| Tài liệu | Nội dung | Nguồn trong PDF |
| --- | --- | --- |
| [Cẩm nang tự học IELTS](assets/cam-nang.pdf) ([HTML](cam-nang.html)) | Nhớ lại, phân tán lượt ôn, chuyển từ nhận biết sang sử dụng và sửa lỗi | 12 công trình |
| [Phiếu thực hành bốn kỹ năng](assets/so-thuc-hanh.pdf) ([HTML](so-thuc-hanh.html)) | Hai buổi thực hành, ví dụ tiếng Anh, đáp án và nhật ký lỗi | 7 công trình trong 12 nguồn trên |

Các dẫn chứng được đặt ngay cạnh phương pháp liên quan. Mỗi mục có DOI và liên kết **tìm theo nhan đề** trên Google Scholar. Các liên kết Scholar là công cụ tra cứu, không phải tuyên bố đã thu thập kết quả trực tiếp từ Google Scholar. [Ghi chú về nguồn và giới hạn bằng chứng](RESEARCH.md). Không gắn thư mục này vào đề hoặc đáp án A-Level của bên thứ ba.

## Dựng và kiểm tra

Cần Node ≥ 22.19 và Python ≥ 3.10. Chạy từ thư mục `ielts-vi`:

```sh
npm ci --ignore-scripts
npm test
npm run build
python3 -m http.server 4173 --bind 0.0.0.0 --directory dist
```

Mở `http://localhost:4173` trên cùng máy, hoặc URL preview nếu dùng môi trường phát triển từ xa. Không trỏ máy chủ công cộng tới gốc repository. `dist/` là đầu ra dựng lại được, khoảng **774 MiB**, chủ yếu là âm thanh gốc; trang chủ không tải các bản ghi của thư viện. Trình dựng dừng nếu gặp tệp thiếu, nội dung chưa dịch trong gói hoặc vượt ngân sách 900 MiB. Không sao chép `CNAME`, `.git`, API, dữ liệu người dùng hoặc toàn bộ kho đa gigabyte.

```sh
python3 -m pip install pypdf==5.9.0  # dùng trong môi trường Python riêng
python3 tools/verify.py              # liên kết, bản PDF, dữ liệu đề giữa nguồn và gói
npm run smoke                       # làm bài thực trong Chromium dưới đường dẫn /yysd-testcenter/
npm run audit:pages                 # Lighthouse mobile, 3 lượt/URL; JSON trong reports/
```

Kiểm thử trình duyệt mặc định dùng Chromium ghim phiên bản cho Linux x64. Trên nền tảng khác, đặt `CHROME_PATH` tới Chrome/Chromium cục bộ. Muốn làm lại PDF: `CHROME_PATH=/path/to/chrome npm run pdf`, soát bản in và liên kết rồi dựng lại. Sau khi thay lựa chọn đề hoặc lời thoại, chạy `python3 tools/build.py --catalogue` để cập nhật các trang liên kết cho bản đầy đủ của trung tâm.

`npm test` đo **tất cả module JS chạy trong trình duyệt của bàn học** (`assets/*.mjs`, kể cả điểm khởi động và giao diện), ngưỡng 100% cho dòng, nhánh và hàm. Không gộp các script nội tuyến trong ngân hàng đề, công cụ dựng, các app khác hay Node API vào tỷ lệ này. `npm run smoke` kiểm tra tất cả đề được phát hành: điền đáp án vào ô thật, kiểm tra 40/40 ở nghe/đọc, số từ và bài nộp ở viết. Kiểm tra PDF đọc các liên kết **trong tệp nhị phân**, không chỉ đếm thẻ trong HTML.

## Pages và CI

1. Trong **Settings → Pages → Source**, chọn **GitHub Actions**.
2. Workflow [Kiểm thử và Pages](../.github/workflows/learning-path-pages.yml) dựng gói dưới đường dẫn con, kiểm tra rồi lưu `github-pages` và toàn bộ báo cáo Lighthouse. PR không có quyền xuất bản. Job triển khai trên push dùng `pages: write` và `id-token: write`.
3. Quy tắc môi trường `github-pages` vẫn có hiệu lực. Nếu chỉ `main` được phép, **bản kiểm thử của PR không phải một website đã công bố**. Để xuất bản từ nhánh PR mà không merge, quản trị viên phải cho phép **đúng tên nhánh** trong *Settings → Environments → github-pages → Deployment branches and tags*, rồi chạy lại job `deploy` của lần push đã kiểm thử thành công. Không cần tắt các quy tắc bảo vệ khác.
4. [Super-Linter](../.github/workflows/learning-path-lint.yml) chạy khi push, mở/cập nhật PR và theo lịch. Dùng image chính thức `ghcr.io/super-linter/super-linter:slim-v9.0.0`; cấu hình trong `tools/super-linter.env` (workspace mới và workflow liên quan).

**Phạm vi bản dịch và kết quả đo thực tế:** xem [QUALITY.md](QUALITY.md). Bản phát hành này không đồng nghĩa với việc mọi nội dung trong monorepo đã được dịch hoặc mọi tuyến của hệ thống có tài khoản đều đã được đo.
