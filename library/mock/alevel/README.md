# Kho đề A-Level

Kho lưu đề và hướng dẫn chấm của CAIE, Edexcel A Level và Oxford AQA A Level. Giao diện tra cứu dùng nhãn tiếng Việt; nội dung tiếng Anh trong PDF được giữ nguyên.

Đặt PDF trong `library/mock/alevel/<hội-đồng>/<môn>/papers/`, ví dụ `caie/9709-mathematics/papers/`. Tên tệp có dạng `{code}_{season}{yy}_{qp|ms}_{paper}.pdf`: `9709_s24_qp_12.pdf` là đề, `9709_s24_ms_12.pdf` là hướng dẫn chấm cùng kỳ. Các mã `m`, `s`, `w` lần lượt chỉ kỳ tháng 2–3, 5–6 và 10–11.

Sau khi bổ sung tài liệu, chạy `python3 scripts/build_alevel_catalog.py`. Danh sách hội đồng và mã môn được khai báo trong `scripts/alevel_subjects.py`. Tệp không khớp quy tắc đặt tên sẽ không có trong danh mục. Không dùng công cụ sinh PDF minh họa thay cho đề thật.
