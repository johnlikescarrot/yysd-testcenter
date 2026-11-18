# YYSD · Trung tâm Khóa học Quốc tế

Trang web + ngân hàng đề + cổng giáo viên + ứng dụng thi máy + ứng dụng desktop. Quy tắc thiết kế: [`YYSD-DESIGN-RULES.md`](YYSD-DESIGN-RULES.md). Triển khai trên máy: `AGENTS.local.md`. Ngôn ngữ giao diện: **tiếng Việt**.

## Cấu trúc

- Trang web / Hub: `index.html`, `assets/`, `library/` ở thư mục gốc
- Bài thi TOEFL mới: `app/` (HIT Sets nằm trong `app/library/toefl/`)
- Đề theo ngày trên web: `library/toefl/` (không đưa JSON HIT set vào đây)
- Máy chủ: `server/server.js` (Node, đa bên thuê, chỗ ngồi, từ vựng, ngân hàng đề)
- Desktop: `desktop/` (Electron)
- Tiện ích tuyển sinh: `admission/` (Next.js)
- Trang ngân hàng đề: `tiku/`
- **Bản địa hóa:** `localization/vi/` + `assets/js/i18n/` + `scripts/vi_lib.py`
- **Trò chơi hóa:** `assets/js/gamification/` + `practice-hub.html`
- **Nghiên cứu học thuật:** `library/research/` + `research.html`

Thứ tự khu vực trên trang chủ: Từ vựng → Luyện tập → Đề thi thật. Phân loại dùng chung nằm ở `assets/js/config.js`.

## Quy tắc thiết kế (luôn tuân thủ)

**Nội dung như giấy, lớp vỏ như kính, tương tác như vật lý; phòng thi giữ cảm giác công cụ chính thức.**

- Nội dung: giấy ngà `#f6f3ec` / `#fffcf7`
- Lớp vỏ: bán trong suốt + `blur(20px) saturate(180%)`, token `--chrome-bg` / `--chrome-blur`
- Phòng thi / CDT: thực dụng, đáng tin, ít trang trí — **không "Apple hóa"**
- Token: `assets/css/style.css` `:root`
- Chuyển mặt phẳng: `YYSD_SURFACE` → `assets/js/ui.js`
- Xác nhận thương hiệu: `YYSD_CONFIRM` / `YYSD_ALERT` / `YYSD_ASK`, không dùng `confirm`/`alert` của hệ thống (CDT là ngoại lệ)
- Tự kiểm tra: `node scripts/check_surface.js` · `node scripts/check_apple_shell.js`

Trước khi làm UI mới hãy hỏi: đây là nội dung, lớp vỏ, hay phòng thi? Không làm bộ phát lại thứ hai, không làm hệ thống thị giác thứ hai.

## Quy tắc ngân hàng đề (tóm tắt)

Quy tắc đầy đủ: `.qoder/rules/toefl-papers.md` và `toefl-listening.md`.

- `bank` của câu Writing không được trùng thứ tự với `answer`. Dùng `scripts/toefl_sent.py`. Cổng kiểm tra mặc định gồm `bank-*-*.json`.
- Chip của bank không viết hoa chữ đầu (``Do``/``Have`` làm lộ từ đầu). Viết tay: một PNG một câu, thanh xanh chỉ để đối chiếu.
- Complete the Words = mỗi chữ cái bị khuyết một ô. Câu hỏi từ vựng học thuật phải trích nguyên từ trong bài đọc.
- Email / thông báo / thời khóa biểu đời thường phải xuống dòng hoặc có bố cục rõ ràng.
- Listen and Repeat: một câu một audio → 3 giây suy nghĩ → tiếng bíp → 8 giây ghi âm. Không hiện `sample` trong lúc làm bài.
- Ảnh bài Nghe dùng chân dung nền trắng theo đúng phong cách đề chính thức, khớp giọng nói. Hội thoại có hai người; nghe câu chọn đáp án thường một người cầm điện thoại; thông báo và bài giảng một người đứng. Không có cảnh nền, không có chữ trong ảnh. Cùng một giọng dùng lại cùng một ảnh. Đường dẫn `library/toefl/img/listen/`, ghi vào `task.image`.
- Vượt cổng kiểm tra: `node scripts/check_toefl_paper.js`. Không đạt thì không phát hành.
- Không dùng `rsync --delete` với trang web.

## Bản địa hóa & chất lượng

- Nguồn từ điển duy nhất: `localization/vi/curated.txt`; sinh ra `zh-vi.json` và `vi-dictionary.mjs` bằng `scripts/build_vi_dictionary.py`.
- **Không bao giờ** chạy bộ dịch trên `assets/js/i18n/`, `localization/vi/`, `scripts/` — các tệp này chứa kí tự tiếng Hoa là dữ liệu của chính bộ dịch.
- `python3 scripts/localize_vi.py --check --max-residual 0` là cổng bắt buộc trong CI.
- `npm run coverage` phải đạt 100%; `bash scripts/super-linter-local.sh` phải sạch.

## Không làm

- Bộ máy Đọc / Nghe / Nói / Viết thứ hai
- Đưa thư viện spring animation lên toàn trang
- Thêm bounce hay kính mờ cho nút CDT
- Đưa khóa bí mật vào repository
