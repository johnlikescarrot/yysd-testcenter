# Nhật ký Cộng tác AI (Worklog)

> Kimi chỉ viết tài liệu này + `DESIGN-BRIEF.md` + `CONTEXT.md` + các tệp trong `tasks/`  
> Cursor chỉ viết mã nguồn + cập nhật trạng thái triển khai trong tài liệu này  

## Phân công Trách nhiệm Hiện tại

| Vai trò | Trách nhiệm chính | Phạm vi tệp tin được phép chỉnh sửa |
|---|---|---|
| Kimi | Kiểm toán thiết kế giao diện, viết đặc tả nhiệm vụ, đồng bộ tiến độ | `docs/ai-collab/**` |
| Cursor | Triển khai mã nguồn, kiểm chứng thực tế tại môi trường cục bộ | `*.html`, `assets/**`, `server/**` |

## Đang Triển khai

| Mã nhiệm vụ | Người phụ trách | Phạm vi tệp tin | Trạng thái | Ghi chú |
|---|---|---|---|---|
| — | — | — | — | **Các cột mốc của Phương án B đã hoàn thành khép kín**; giai đoạn tiếp theo là mở rộng nội dung và vận hành, không thuộc danh mục B |

## Danh mục Cần làm (Cursor)

| Mã nhiệm vụ | Phạm vi tệp tin | Trạng thái | Đặc tả kỹ thuật |
|---|---|---|---|
| — | — | — | Hiện không còn đầu việc tồn đọng thuộc danh mục B; việc kiểm tra song song tài khoản Familiarisation G6 là tùy chọn |

## Các Nhiệm vụ Đã Hoàn thành

| Mã nhiệm vụ | Người phụ trách | Ngày hoàn thành | Tóm tắt kết quả |
|---|---|---|---|
| drill-sec | Cursor | 31/07/2026 | Cổng khởi động chế độ drill cho phép chọn Section/Passage; liên kết `dataset.sections` → `secbox` của đề thi; tiếp tục bài thi giữ lại bản nháp |
| G6 | Cursor | 31/07/2026 | Kiểm tra đối chiếu với bài Listening công khai trên Inspera của IDP; ghi nhận vào PLAN-B §5.3b |
| B5 | Cursor | 31/07/2026 | Đạt điểm tối đa tiêu chí C01–C20; hỗ trợ kéo dãn cột bài Đọc; hoàn tất C18 tiếng Anh hóa; kiểm tra hồi quy 4 luồng chính + tính năng `cdtCheck` |
| B4 | Cursor | 31/07/2026 | Tích hợp Sổ tay Notepad; highlight đa màu; tùy chỉnh màu nền trong Setting; hoàn thiện nội dung Help; cấm kiểm tra chính tả khi làm bài Viết |
| B3 | Cursor | 31/07/2026 | Tích hợp `cdt-qux.js`: dạng bài kéo thả nối cặp và bản đồ; hỗ trợ chọn nhiều đáp án; lưu trữ tỷ lệ chọn chính xác |
| B2 | Cursor | 31/07/2026 | Khóa nghiêm ngặt phần Nghe không cho tua; 2 phút kiểm tra đáp án cuối bài; đồng hồ nhấp nháy cảnh báo 10'/5'; mở khóa nghe lại sau khi nộp bài drill |
| B1 | Cursor | 31/07/2026 | Đưa các đề luyện tập đơn môn Cambridge vào giao diện CDT; cổng khởi động chọn gói drill/exam; tự động chuyển tiếp môn thi khi `suite=1`; xem lại sau khi nộp bài |
| B0 | Cursor | 31/07/2026 | Chốt quy chuẩn Phương án B: hoàn thiện `CDT-PLAN-B.md` + viết lại `CDT-CHECKLIST.md` + chọn mẫu chuẩn Cam20 T1 |
| D-001 | Cursor | 22/07/2026 | Khởi tạo tài liệu bản đồ dự án toàn hệ thống `CONTEXT.md` |
| D-002 | Cursor | 22/07/2026 | Kiểm toán thiết kế `DESIGN-BRIEF.md` + tạo danh mục nhiệm vụ từ I-001 đến I-005 |
| setup | Cursor | 22/07/2026 | Thiết lập khung sườn thư mục cộng tác `docs/ai-collab/` + tệp câu lệnh `KIMI-PROMPTS.md` |
| I-001 | Cursor | 22/07/2026 | Tích hợp giao diện khung `page-premium` cho trang `results.html` |
| I-002 | Cursor | 22/07/2026 | Chuẩn hóa vòng tiêu điểm các ô nhập liệu và đường viền thẻ `auth-card` trên trang login/register |
| I-003 | Cursor | 22/07/2026 | Bổ sung hiệu ứng kính mờ và màu nền trạng thái active cho thanh tab di động |
| I-004 | Cursor | 22/07/2026 | Nâng cấp trạng thái kết quả trống trên trang results thành thẻ phong cách giấy cao cấp |
| I-005 | Cursor | 22/07/2026 | Mở rộng vòng tiêu điểm `focus-visible` áp dụng nhất quán trên toàn bộ giao diện page-premium |

## Hướng dẫn Bước Tiếp theo cho Kimi

1. Mở ứng dụng Kimi, chọn mở thư mục dự án: `/Users/frankman/yysd test center`.
2. Sao chép nội dung **§0 Khởi tạo Vai trò Hệ thống** trong [`KIMI-PROMPTS.md`](KIMI-PROMPTS.md).
3. Dán tiếp nội dung **§4 Đồng bộ Tiến độ Định kỳ**, dựa trên các hạng mục Cursor đã hoàn thành để phát hành đợt nhiệm vụ tiếp theo từ I-006 trở đi.
