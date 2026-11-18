# Trung tâm Khóa học Quốc tế YYSD

Kho gồm cổng học tập, ngân hàng đề, khu giáo viên, ứng dụng thi trên máy và ứng dụng desktop. Xem [quy tắc thiết kế](YYSD-DESIGN-RULES.md). Hướng dẫn triển khai riêng trên máy của người vận hành nằm ở `AGENTS.local.md` (nếu có).

## Các thành phần

- Cổng học tập: `index.html`, `assets/`, `library/`. Trang chủ có các khu Từ vựng → Luyện tập → Đề thi. Phân loại dùng chung ở `assets/js/config.js`.
- Ứng dụng TOEFL: `app/`, với HIT Sets trong `app/library/toefl/`. Đề TOEFL theo ngày của **website** nằm ở `library/toefl/`; không đưa JSON của HIT Sets vào đó.
- Máy chủ: `server/server.js` (Node, nhiều đơn vị đào tạo, quyền sử dụng máy, bộ từ và ngân hàng đề).
- Desktop: `desktop/` (Electron). Tuyển sinh: `admission/` (Next.js). Cổng kho đề: `tiku/`.
- `ielts-vi/` là bản học tĩnh không cần API. Không đóng gói máy chủ, `CNAME` hay toàn bộ kho đề vào bản Pages. Xem [hướng dẫn phát triển](ielts-vi/README.md).

## Thiết kế

Nội dung như giấy, khung điều hướng như kính mờ; tương tác phản hồi ngay khi nhấn. Phòng thi lại cần cảm giác của một công cụ làm bài chính thức.

- Nền nội dung màu giấy ngà `#f6f3ec` / `#fffcf7`.
- Khung điều hướng bán trong suốt, `blur(20px) saturate(180%)`, dùng `--chrome-bg` và `--chrome-blur`. Token chính ở `:root` trong `assets/css/style.css`.
- CDT phải thực dụng, dễ tin cậy, ít trang trí. Không thêm nảy nút hoặc kính mờ vào phòng thi.
- Quy ước đóng/mở bề mặt: `YYSD_SURFACE` trong `assets/js/ui.js`. Quy ước xác nhận trong khung ứng dụng: `YYSD_CONFIRM`, `YYSD_ALERT`, `YYSD_ASK` thay cho hộp thoại hệ thống (ngoại trừ CDT).
- Kiểm tra: `node scripts/check_surface.js` và `node scripts/check_apple_shell.js`.
- Trước khi tạo giao diện, xác định đó là **nội dung, điều hướng hay phòng thi**. Dùng lại trình phát và hệ thống thiết kế hiện có.

## Ràng buộc ngân hàng TOEFL

Quy tắc đầy đủ: `.qoder/rules/toefl-papers.md` và `.qoder/rules/toefl-listening.md`.

- Trong Writing, thứ tự từ trong `bank` không được trùng `answer`; dùng `scripts/toefl_sent.py`. Kiểm tra cả `bank-*-*.json`.
- Không viết hoa chữ đầu các thẻ từ trong Build a Sentence (`Do`/`Have` dễ lộ từ đầu câu). Khi nhập đề Writing từ bản viết tay: một ảnh PNG cho mỗi câu; thanh màu xanh chỉ để đối chiếu.
- Complete the Words: một ô cho mỗi **chữ cái** còn thiếu. Câu hỏi từ vựng học thuật phải trích từ trong bài. Email, thông báo và thời khóa biểu cần có xuống dòng hoặc bố cục có cấu trúc.
- Listen and Repeat: một bản thu cho mỗi câu → 3 giây suy nghĩ → tiếng bíp → 8 giây ghi âm. Không hiện `sample` trong lúc làm bài.
- Ảnh nghe: chân dung trên nền trắng theo phong cách đề chính thức, nhân vật phù hợp với giọng nói. Hội thoại có hai người; chọn lời đáp có một người (thường cầm điện thoại); thông báo và bài giảng có một người đứng. Không dùng phong cảnh hoặc chữ trong ảnh. Cùng một người phải dùng lại cùng tệp; đặt ở `library/toefl/img/listen/`, ghi vào `task.image`.
- Chạy `node scripts/check_toefl_paper.js`. Không phát hành nếu kiểm tra chưa đạt. Không dùng `rsync --delete` với cổng đang hoạt động.

## Không làm

- Không xây thêm một bộ máy Nghe/Đọc/Nói/Viết trùng chức năng.
- Không cài thư viện hoạt ảnh lò xo cho toàn trang.
- Không lưu khóa bí mật trong kho.
