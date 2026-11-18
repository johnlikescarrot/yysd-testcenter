# Kiểm định IELTS Atlas · 18/11/2026

Kiểm tra trên gói `dist/` đặt dưới `/yysd-testcenter/`, không phải trên tên miền Pages đã triển khai. Máy thử: Node 22.22.3, Lighthouse 13.6.0, Chromium 149.0.7827.0, chế độ di động mặc định.

| Trang | Performance từng lượt | Performance (trung vị) | Accessibility¹ | Best Practices¹ | SEO¹ |
| --- | --- | ---: | ---: | ---: | ---: |
| Bàn học | 100, 100, 100 | 100 | 100 | 100 | 100 |
| Thư viện | 100, 100, 100 | 100 | 100 | 100 | 100 |
| Đọc mẫu | 100, 100, 100 | 100 | 100 | 100 | 100 |
| Cambridge 19 · Reading 1 | 99, 100, 100 | 100 | 100 | 100 | 100 |
| Cambridge 19 · Listening 1 | 100, 100, 100 | 100 | 100 | 100 | 100 |
| Cambridge 19 · Writing 1 | 100, 100, 100 | 100 | 100 | 100 | 100 |

¹ Điểm thấp nhất trong ba lượt. Giữ các lượt 99 trong báo cáo, không bỏ mẫu. CI lưu từng báo cáo HTML gốc trong artifact `quality-reports`; kết quả thời gian có thể dao động giữa máy chạy.

- `npm test`: 15 kiểm tra đạt; c8 báo **100/100/100/100** cho câu lệnh/nhánh/hàm/dòng của cả sáu module `studio/src`. Không phải 100% mã của toàn bộ kho.
- `npm run test:papers`: 231 trình làm bài thực thi được; 226 chữ ký nội dung Cambridge khớp với bản trước Việt hóa. Các đề viết khôi phục nháp và xuất nội dung sao chép theo đúng tiêu đề đề thi.
- `npm run test:browser`: học xong một chặng, tải lại giữ XP, phát MP3 thật và xem lời Việt đồng bộ, viết/khôi phục nháp, nộp đề và xem lại kết quả trên bàn học; không thấy lỗi trang hoặc phản hồi HTTP ≥ 400 trong các luồng này.
- `python scripts/studio/check_release.py`: 234 trang HTML có đích liên kết/neo hợp lệ; cả năm PDF đọc được, có văn bản tiếng Việt và đủ 22 cặp liên kết DOI/Google Scholar. Gói tĩnh khoảng 765 MiB, gồm 296 đoạn âm thanh đề thi.
- `python scripts/verify_cambridge_mock_pages.py`, `python scripts/verify_vocab_wrongword_hooks.py`, `node scripts/check_cet4_lite.js`: đạt. `python -m unittest discover -s tests/studio`: kiểm tra bộ nhập giữ vỏ trang, giữ lời giải phù hợp và từ chối đầu vào chưa dịch.

## Trạng thái xuất bản

[Workflow đã tạo artifact nhưng bị chặn ở bước xuất bản](https://github.com/johnlikescarrot/yysd-testcenter/actions/runs/44220873780). GitHub báo nhánh của PR không được phép triển khai vào môi trường `github-pages`. Kiểm định thành công hoặc có artifact không đồng nghĩa website công khai đã được cập nhật.
