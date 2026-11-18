# Ghi chú Kiến trúc Hệ thống (`MEMORIES.md`)

## Kiến trúc tổng thể

- **Ứng dụng học viên (HTML/CSS/ES Modules tĩnh):** Triển khai trực tiếp trên GitHub Pages qua `scripts/build_pages.mjs` và tương thích hoàn toàn với máy chủ Express (`server/server.js`) khi chạy ở chế độ đám mây.
- **Lõi học tập thông minh (`src/`):**
  - `src/scholar-citations.js`: Cơ sở dữ liệu hơn 120 công trình khoa học đã xác minh kèm DOI và liên kết `scholar.google.com`.
  - `src/proficiency-score.js`: Quy đổi điểm năng lực 0–160 ↔ CEFR A1–C2 ↔ IELTS Band 2.0–9.0 và bảng quy đổi điểm thô 40 câu Cambridge.
  - `src/hlr-srs.js`: Thuật toán lặp lại ngắt quãng Half-Life Regression ($p = 2^{-\Delta/h}$, Settles & Meeder, 2016).
  - `src/gamification.js`: XP, Chuỗi ngày học, Đóng băng chuỗi, Chuỗi bạn bè (tối đa 5 bạn), Năng lượng & Siêu Cấp IELTS, Đá quý & Cửa hàng vật phẩm, 10 Giải đấu hàng tuần (Đồng → Kim cương), Nhiệm vụ hàng ngày, 12 Huy hiệu và Ảnh đại diện theo 4 mùa.
  - `src/notification-bandit.js`: Thuật toán nhắc học Recovering-Difference Softmax Bandit (Yancey & Settles, 2020).
  - `src/ielts-curriculum.js`: Lộ trình 8 chặng IELTS Academic, 7 dạng bài tập tương tác, câu bất ngờ ngữ nghĩa (SUS) và bộ giải thích lỗi sai miễn phí.
  - `src/stories-roleplay.js`: Truyện ngắn học thuật tương tác và nhập vai đối thoại nhân vật theo 4 tiêu chí chấm Speaking.
  - `src/pdf-report.js`: Danh mục 6 cẩm nang PDF học thuật và bộ dựng báo cáo cá nhân hóa kèm trích dẫn Google Scholar.
  - `src/storage.js`: Lưu trữ an toàn theo phiên bản schema và đồng bộ sự kiện điểm `yysd:score` giữa phòng thi Cambridge và hệ thống XP/Streak.
- **Giao thức đồng bộ điểm phòng thi:** `window.parent.postMessage({ type: "yysd:score", score, total, band, wrongItems }, "*")`.
