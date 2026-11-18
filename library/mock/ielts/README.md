# Đề thi thử IELTS

Thêm đề HTML vào `library/mock/ielts/` để phân loại vào mục thi thử (`mock`), môn IELTS (`ielts`). Có thể tải tệp lên GitHub hoặc thêm từ lúc phát triển; hãy kiểm tra quyền sử dụng trước khi phát hành đề.

Dùng các thẻ `exam:title`, `exam:description` và `exam:duration` cho tên, mô tả và thời lượng. Chạy `python3 scripts/build_manifest.py` từ thư mục gốc để cập nhật danh mục. Không đổi tên tệp đã phát hành nếu chưa có phương án giữ mã bài và kết quả cũ.
