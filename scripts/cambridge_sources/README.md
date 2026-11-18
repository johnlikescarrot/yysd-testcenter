# Nguồn để tạo lại Cambridge 12 và 21

`volume21_passages.json` chứa các đoạn tiếng Anh đã chia đúng theo số đoạn dùng trong câu hỏi. `clip_windows.json` chứa `[câu đầu, câu cuối, giây đầu, giây cuối]` theo đúng tên bản thu. Cả hai được đối chiếu với dữ liệu nhúng trong các đề hiện có. Không cần tải lại PDF, nhận dạng giọng nói hoặc chép tệp MP3 để cập nhật giao diện hay lời giải.

- Từ thư mục gốc chạy `python scripts/verify_cambridge_sources.py` để tạo **24 đề trong thư mục tạm**, so sánh dữ liệu đã phân tích và giao diện với bản trong thư viện; không ghi đè bài học.
- `python scripts/build_cambridge12.py 1` hoặc `python scripts/build_cambridge21.py 1` tạo lại Test 1. Không truyền số để tạo cả tập. Chỉ truyền `--audio-zip <tệp>` cho tập 21 khi thực sự cần nhập lại âm thanh.
- Nếu thay đổi nguồn đọc, có thể chạy `python scripts/cambridge21_passages.py <PDF-cục-bộ> --output <đường-dẫn-tạm>` (cần PyMuPDF), đối chiếu khác biệt trước khi cập nhật JSON. Đừng đưa PDF hoặc ZIP vào Git.
