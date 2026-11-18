# Hướng dẫn Kỹ thuật Kho mã nguồn (`AGENTS.md`)

- **Ngôn ngữ hiển thị:** Toàn bộ nội dung không phải tiếng Anh trong ứng dụng và tài liệu phải sử dụng **tiếng Việt** tự nhiên, chuẩn xác, đầy đủ dấu; giữ nguyên ngữ liệu tiếng Anh của đề thi. Kiểm chứng bằng `npm run check:vi`.
- **Triết lý thiết kế:** Tuân thủ hệ thống **Giấy Ngà & Kính Mờ (Ivory Paper `#f6f3ec` / `#fffcf7` + Glass Chrome + Xanh Hải Quân `#162447`)** trong `YYSD-DESIGN-RULES.md`.
- **Chất lượng bắt buộc trước khi đẩy mã:**
  - `npm run test:coverage` đạt **100%** trên cả 4 chỉ số (Statements, Branches, Functions, Lines).
  - `npm run check:vi` đạt **0** tệp vi phạm.
  - `npm run lint` đạt **0** lỗi (tương thích `super-linter/super-linter`).
  - `python3 scripts/verify_cambridge_mock_pages.py` và `python3 scripts/verify_vocab_wrongword_hooks.py` hoàn tất thành công.
  - Điểm Google Lighthouse đạt **100 / 100 / 100 / 100** trên các trang chính.
- **Triển khai tĩnh (GitHub Pages):** Mọi trang học viên phải hoạt động độc lập trên máy chủ tĩnh mà không phụ thuộc máy chủ API riêng, sử dụng đường dẫn tương đối và lưu trữ bền vững qua `localStorage`.
