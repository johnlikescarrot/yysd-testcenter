# Trung tâm Luyện thi IELTS Quốc tế YYSD

Nền tảng luyện thi IELTS toàn diện thế hệ mới dành cho người học tiếng Việt — kết hợp kho **226 đề thi Cambridge IELTS chính thức (Nghe · Đọc · Viết)**, **hệ thống học tập trò chơi hóa lấy cảm hứng từ khoa học học tập của Duolingo**, **thuật toán lặp lại ngắt quãng Half-Life Regression (HLR)**, **hơn 24.800 mục từ vựng Anh – Việt chuẩn xác**, và **thư viện 6 cẩm nang PDF học thuật trích dẫn hơn 120 công trình nghiên cứu kiểm duyệt từ Google Scholar**.

## Điểm nổi bật của phiên bản nâng cấp toàn diện

1. **Việt hóa 100% toàn bộ nội dung không phải tiếng Anh**
   - Toàn bộ giao diện, điều hướng, hướng dẫn phòng thi, giải thích đáp án, hơn 24.800 mục từ vựng, cổng giáo viên, tra cứu tuyển sinh đại học và tài liệu kỹ thuật được chuyển ngữ sang tiếng Việt tự nhiên, chuẩn xác.
   - Giữ nguyên 100% ngữ liệu tiếng Anh học thuật của đề thi IELTS, TOEFL và A-Level.
   - Kiểm chứng tự động bằng bộ kiểm thử `npm run check:vi` đảm bảo **0 ký tự phi tiếng Anh / phi tiếng Việt** trên toàn bộ kho mã nguồn.

2. **Hệ sinh thái Lộ trình IELTS Thông minh (`lo-trinh.html`)**
   - **Cây kỹ năng tuyến tính 8 Chặng (CEFR A2 → C2 / IELTS Band 4.5 → 8.5+):** bài học ngắn gọn 3–5 phút với 7 dạng bài tương tác (trắc nghiệm học thuật, ghép thẻ từ paraphrase, điền khuyết ngữ cảnh, nối cặp collocation, True/False/Not Given, nghe chép học thuật và bài tập **Câu Bất Ngờ Ngữ Nghĩa — SUS** kích hoạt sai số dự đoán phần thưởng).
   - **Giải thích Lỗi sai Miễn phí & Tức thì:** phân tích nguyên nhân sai, dẫn chứng quy tắc ngôn ngữ học ứng dụng và gợi ý chiến thuật tăng band.
   - **Lặp lại Ngắt quãng Half-Life Regression (Settles & Meeder, 2016):** tính xác suất ghi nhớ $p = 2^{-\Delta / h}$, tự động xếp hàng ôn tập từ vựng và kỹ năng sắp quên.
   - **Trò chơi hóa toàn diện:** điểm kinh nghiệm (**XP** & hệ số combo), **Chuỗi ngày học (Daily Streak)** & **Đóng băng Chuỗi**, **Chuỗi Bạn bè (Friend Streak — tối đa 5 bạn đồng hành)**, **Năng lượng (Energy)** & chế độ **Siêu Cấp IELTS** miễn phí bằng **Đá quý (Gems)**, **Cửa hàng Vật phẩm**, **Nhiệm vụ Hàng ngày**, **12 Huy hiệu Thành tích**, và **Xưởng Ảnh đại diện với 4 Bộ Trang phục Theo mùa** (Xuân Hoa Đào, Hạ Biển Xanh, Thu Hà Nội, Đông Học Viện).
   - **10 Giải đấu Hàng tuần:** Đồng, Bạc, Vàng, Lam ngọc, Hồng ngọc, Lục bảo, Thạch anh tím, Ngọc trai, Hắc diện thạch và Kim cương (bảng xếp hạng 30 học viên với nhóm thăng hạng, an toàn và xuống hạng).
   - **Truyện ngắn Học thuật Tương tác & Nhập vai Đối thoại Nhân vật:** luyện phản xạ IELTS Speaking & Reading cùng các nhân vật Linh, Hùng, Mai và Sida kèm đánh giá 4 tiêu chí chính thức (FC, LR, GRA, P).
   - **Thang điểm Năng lực 0–160 ↔ CEFR (A1–C2) ↔ IELTS Band (2.0–9.0):** quy đổi chính xác theo chuẩn Cambridge, tạo chứng nhận chia sẻ LinkedIn.
   - **Nhắc học Thông minh Recovering-Difference Softmax Bandit (Yancey & Settles, 2020):** tối ưu hóa lời nhắc hàng ngày dựa trên mức độ mới mẻ và lịch sử phản hồi.

3. **Thư viện Cẩm nang PDF Học thuật (`tai-lieu.html` & `assets/docs/*.pdf`)**
   - 6 bộ cẩm nang PDF tiếng Việt chuyên sâu về IELTS Listening, Reading, Writing, Speaking, Từ vựng học thuật (AWL/AVL/ACL/AFL) và Khoa học nhận thức (HLR SRS, Gamification, Bối cảnh người học Việt Nam).
   - Tích hợp **120+ trích dẫn khoa học chuẩn APA 7** kèm DOI và liên kết trực tiếp tới `https://scholar.google.com/scholar?q=...`.
   - Hỗ trợ xuất báo cáo chẩn đoán & kế hoạch học tập cá nhân hóa sang PDF kèm danh mục tài liệu tham khảo Google Scholar.

4. **Chất lượng Kỹ thuật Đỉnh cao**
   - **Google Lighthouse 100 / 100 / 100 / 100** (Performance, Accessibility, Best Practices, SEO).
   - **Độ bao phủ mã nguồn (Code Coverage) 100%** (Statements, Branches, Functions, Lines) kiểm chứng bằng Vitest + V8.
   - **GitHub Super-Linter** chạy định kỳ và tự động trên mọi Pull Request.
   - **Triển khai tự động trên GitHub Pages** qua GitHub Actions (`scripts/build_pages.mjs`).

## Cấu trúc thư mục chính

```text
yysd-testcenter/
├── index.html                  Trang chủ Trung tâm Luyện thi IELTS Quốc tế YYSD
├── lo-trinh.html               Lộ trình IELTS Thông minh (Gamification, HLR SRS, Truyện, Nhập vai, Giải đấu)
├── tai-lieu.html               Thư viện PDF Học thuật & Cơ sở dữ liệu 120+ trích dẫn Google Scholar
├── zone.html / cambridge.html  Kho đề thi Cambridge IELTS 6–20 (Nghe, Đọc, Viết, Nghe sâu)
├── vocab.html                  Tủ sách từ vựng Anh – Việt (THPT, Đại học, IELTS chuyên sâu, 36 chủ đề)
├── exam.html / cdt-report.html Phòng thi máy tính (CDT) & Báo cáo điểm kèm trích dẫn học thuật
├── dashboard.html / results.html Trung tâm nhiệm vụ, lịch học & thống kê kết quả cá nhân
├── src/                        Các mô-đun ES lõi (đạt 100% độ bao phủ kiểm thử)
├── tests/                      Bộ kiểm thử đơn vị, tích hợp & kiểm toán Việt hóa (Vitest)
├── assets/
│   ├── css/                    Hệ thống thiết kế Giấy Ngà & Kính Mờ (Ivory Paper + Glass Chrome)
│   ├── js/                     Trình điều khiển giao diện & cầu nối phòng thi
│   ├── img/                    Biểu trưng SVG & hình minh họa tối ưu
│   └── docs/                   6 cẩm nang PDF học thuật tiếng Việt có liên kết Google Scholar
├── library/                    Kho đề thi Cambridge IELTS, từ vựng và bài luyện tập
├── scripts/                    Công cụ tạo manifest, xuất PDF học thuật, đóng gói GitHub Pages & kiểm tra Lighthouse
└── .github/workflows/          CI/CD: Super-Linter, Kiểm thử 100% Coverage, Lighthouse 100 & GitHub Pages
```

## Lệnh phát triển & kiểm chứng

```bash
# Chạy toàn bộ kiểm thử với ngưỡng bao phủ bắt buộc 100%
npm run test:coverage

# Kiểm tra 100% Việt hóa (0 ký tự CJK/Kana/Hangul/Cyrillic)
npm run check:vi

# Chạy bộ kiểm tra mã nguồn (tương thích GitHub Super-Linter)
npm run lint

# Sinh lại 6 bộ cẩm nang PDF học thuật tiếng Việt (kèm trích dẫn Google Scholar)
npm run build:pdfs

# Đóng gói bản phát hành tĩnh tối ưu cho GitHub Pages vào _site/
npm run build:pages

# Khởi chạy máy chủ tĩnh phục vụ phát triển (http://0.0.0.0:8080)
npm run serve
```
