# Sải bước · Luyện IELTS Academic

Sải bước là bản luyện IELTS Academic bằng tiếng Việt, chạy tĩnh, không cần đăng nhập hoặc API. Trang chủ của cổng YYSD cũ có liên kết đến bản này. Giao diện, hướng dẫn, giải thích và sổ tay đều dùng tiếng Việt; đề, ngữ liệu, đáp án và tên công trình khoa học giữ nguyên tiếng Anh khi cần. Ngân hàng đề, cổng giáo viên, hệ đăng nhập và các chương trình cũ không nằm trong bản phát hành này.

## Học và ôn tập

- Bốn chặng, 16 bài và 53 hoạt động cho Nghe, Đọc, Viết, Nói. Bài đọc 8 câu về ong mật lấy trực tiếp từ đề mẫu của trung tâm, giữ cả hai cách viết *polarised/polarized*. Bốn đoạn nghe sử dụng giọng tổng hợp và có bản chép tiếng Anh. Bài Viết và Nói có gợi ý tự kiểm, không chấm điểm tự động. Bộ đếm của phần Nói không bật mic.
- Kết quả bài học, mục tiêu ngày, điểm kinh nghiệm và huy hiệu lưu trên trình duyệt. Bản nháp Viết không được lưu. Xóa dữ liệu trang sẽ xóa tiến độ; không có đồng bộ giữa thiết bị.
- Câu sai vào lượt ôn tiếp theo. Tùy vào số lần trả lời đúng khi đến hạn, một câu được ôn lại sau 1, 3, 7 hoặc 14 ngày. Mỗi lượt ôn có tối đa 8 câu. Lịch này là quy tắc thực hành, không phải ước lượng điểm thi.
- **Luyện có trọng tâm** ghép tối đa 4 câu theo một kỹ năng: ưu tiên lỗi chưa sửa, sau đó là câu đến hạn và kỹ năng ít luyện. Không lấy câu còn lâu mới đến hạn để kiếm điểm. **Thử thách tuần** tính số ngày thực học từ thứ Hai, so sánh với chính tuần trước; không dùng bảng xếp hạng giả.
- Bốn sổ tay tiếng Việt có bản PDF và HTML cùng nội dung. Sổ tay dẫn 25 công trình học thuật khác nhau bằng DOI và liên kết tra cứu Google Scholar; tài liệu định dạng/chấm điểm dẫn trực tiếp IELTS. Tên bài nghiên cứu giữ nguyên để tra cứu. Không phân phối lại bài nghiên cứu của nhà xuất bản.

## Phát triển và kiểm tra

Cần Node.js 22.22.3 (như CI) và npm. Từ thư mục gốc:

```sh
npm ci --prefix quality
npm test --prefix quality
npm run test:portal --prefix quality
npm run build --prefix quality
npm run test:browser --prefix quality
npm run lighthouse --prefix quality
```

Để học thử tại máy: `python3 -m http.server 8080 --directory quality/dist`. Mở `http://localhost:8080/`. Có thể đặt `IELTS_PAGES_URL` thành URL Pages đã triển khai để chạy lại Lighthouse với môi trường công khai. Kiểm thử Chromium trên Linux cần các thư viện hệ thống NSS/NSPR (ví dụ gói `libnss3` và `libnspr4`).

- `assets/course.js`: nội dung bài luyện, giữ nguyên các mã bài/câu đã phát hành để không mất lịch ôn cũ.
- `../quality/import-reading.mjs`: tạo lại `assets/honeybees.js` từ đề mẫu HTML; CI kiểm tra không lệch câu hỏi hoặc đáp án.
- `assets/progress.js`: mô hình tiến độ, chấm đáp án, lịch ôn và trạng thái lưu trên máy.
- `../quality/materials.mjs`: nguồn nội dung và trích dẫn cho cả hai định dạng. Chạy `npm run pdf --prefix quality` để cập nhật tám tệp trong `resources/`. PDF nhúng Noto Sans (giấy phép SIL Open Font License).
- Nếu sửa bản chép lời, chạy `npm run audio --prefix quality`. Bốn tệp MP3 được tạo từ kịch bản trong kho bằng [Flite](https://github.com/festvox/flite); không sao chép âm thanh đề thi chính thức.

Các tệp PDF/HTML và MP3 nhỏ được lưu trong Git để dùng được ngay trên cổng tĩnh cũ. CI kiểm tra có thể tạo lại cùng nội dung. `quality/dist/` và báo cáo sinh trong quá trình kiểm tra không được lưu trong Git.

## GitHub Pages

1. Người có quyền quản trị kho mở **Settings → Pages → Build and deployment → Source → GitHub Actions**.
2. Workflow **IELTS tiếng Việt · chất lượng và Pages** chạy trên từng PR và kiểm tra định kỳ hằng tuần. Chỉ `main` triển khai sau khi Super-Linter, kiểm thử trình duyệt, Lighthouse và coverage đều đạt. Có thể chạy thủ công workflow từ `main` sau khi workflow đã có trên nhánh đó.
3. Chỉ nội dung được liệt kê trong `quality/build.mjs` được công bố (không mang theo `CNAME` cũ, máy chủ, kho đề hay dữ liệu khác). Đường dẫn tương đối hỗ trợ URL dự án dạng `https://<tài-khoản>.github.io/<tên-kho>/`.

Ngưỡng 100% coverage áp dụng cho từng mô-đun JavaScript của bản IELTS tiếng Việt (dòng, nhánh, hàm, câu lệnh), không áp dụng cho mã cũ. Lighthouse kiểm tra bốn hạng mục trên trang học và bốn sổ tay HTML, ở cấu hình di động và máy tính. Điểm đo tại bản dựng kiểm thử không bảo đảm kết quả giống hệt trên mọi thiết bị hay đường truyền.
