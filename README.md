# YYSD · Trung tâm Học tập

Nền tảng luyện thi **IELTS**, TOEFL và các chương trình quốc tế (A-Level…) bằng **tiếng Việt**.
Trang web chính thức: [youyisida.com](https://youyisida.com) · Bản phát hành tĩnh: **GitHub Pages**.

Kiến trúc: tĩnh front-end + Node API (đăng nhập bằng số điện thoại, đồng bộ điểm, giao bài của giáo viên, tác vụ AI). Nội dung chính là các đề thi HTML có tự chấm điểm trong `library/`; lớp vỏ cung cấp nhận diện thương hiệu, phòng thi tính giờ (CDT), trung tâm nhiệm vụ và cổng giáo viên.

> **Ngôn ngữ.** Toàn bộ nội dung giao diện, tài liệu và chú giải được chuyển sang tiếng Việt. Đề thi, transcript và đáp án tiếng Anh được giữ nguyên theo đúng yêu cầu của bài thi. Xem [`localization/vi/REPORT.md`](localization/vi/REPORT.md) để biết số liệu bản địa hóa.

## Dành cho học viên

| Lối vào | Mô tả |
| --- | --- |
| [Trung tâm luyện tập](practice-hub.html) | Chuỗi ngày (streak), XP, năng lượng, giải đấu, huy hiệu, ôn tập ngắt quãng — lấy cảm hứng từ Duolingo |
| [Tài liệu nghiên cứu](research.html) | Kho PDF tiếng Việt có trích dẫn học thuật và liên kết Google Scholar cho mọi tài liệu PDF |
| Từ vựng | Từ vựng THPT / CET-4 / IELTS, kho từ theo chủ đề, sổ lỗi sai, ôn tập ngắt quãng |
| Đề thi thật IELTS | Cambridge Nghe / Đọc / Viết; luyện theo Section · Passage; thi thử từng kĩ năng; thi thử trọn bộ (CDT) |
| Luyện tập | Câu dài khó, chính tả số, luyện nói, luyện Viết có AI chấm bài |
| Chương trình quốc tế | A-Level và tài liệu liên quan |
| Trung tâm nhiệm vụ | Bài tập do giáo viên giao, lịch học và việc cần làm |

Sau khi thi thử trọn bộ, học viên nhận báo cáo 3 kĩ năng tại `cdt-report.html`.

## Dành cho giáo viên

- Đăng nhập: `teacher-login.html`
- Giao bài theo lịch: `teacher-calendar.html` — chọn theo loại (từ vựng / bổ trợ / thi thử đơn lẻ / trọn bộ), hỗ trợ tải lên HTML riêng
- Chẩn đoán học viên và các trang `teacher-*.html` khác

## Cấu trúc kĩ thuật

```
├── *.html                     # các trang (trang chủ, phòng thi, từ vựng, cổng giáo viên…)
├── assets/                    # CSS / JS; assets/js/i18n/ = bộ bản địa hóa; gamification/ = luồng trò chơi hóa
├── library/                   # đề thi & từ vựng HTML/JSON; library/research/ = PDF học thuật
│   └── manifest.json          # chỉ mục nội dung (do script/CI sinh, không sửa tay)
├── localization/vi/           # từ điển, báo cáo bao phủ, giấy phép dữ liệu
├── scripts/                   # bản địa hóa, build Pages, sinh PDF, kiểm tra chất lượng
├── tests/                     # unit test JS + Python (bao phủ 100%)
├── .github/workflows/         # Super-Linter, Pages, Lighthouse, quality gate
├── server/                    # Express API + SQLite
├── rankings/ · admission/     # tiện ích con (tùy chọn)
└── desktop/ · desktop-tiku/   # ứng dụng Electron
```

API: xem [`server/package.json`](server/package.json) và [`server/.env.example`](server/.env.example).

## Chạy cục bộ

```bash
# front-end (không mở HTML bằng cách nhấp đúp)
python3 -m http.server 8080
# API (Node ≥ 18)
cd server && cp -n .env.example .env && npm i && npm start
```

## Quy trình chất lượng

```bash
npm ci
npm run lint:local          # tương đương Super-Linter khi không có Docker
npm test                    # node:test + jsdom
npm run coverage            # ngưỡng 100% cho toàn bộ mã first-party
python3 scripts/build_vi_dictionary.py
python3 scripts/localize_vi.py --check --max-residual 0
python3 scripts/build_pages.py
bash scripts/super-linter-local.sh
python3 scripts/build_research_pdfs.py
```

GitHub Actions chạy Super-Linter trên mọi push/PR, kiểm tra bao phủ mã, đo Lighthouse trên Chromium thật với ngưỡng **100/100/100/100** và triển khai Pages.

## Nội dung & điểm số

- Đề mới đặt trong `library/<zone>/<subject>/`; `scripts/build_manifest.py` sẽ cập nhật `manifest.json`.
- Meta tùy chọn: `exam:title` / `exam:duration` / `exam:description`.
- Trang con gửi điểm về trang cha:

```js
parent.postMessage({ type: "yysd:score", score: 32, total: 40, band: 7 }, "*");
```

## Giấy phép dữ liệu

Từ điển Hán–Việt mở rộng được phái sinh từ [CVDICT](https://github.com/ph0ngp/CVDICT) (Phong Phan, CC BY-SA 4.0, dựa trên CC-CEDICT). Xem [`localization/vi/LICENSE-CVDICT.md`](localization/vi/LICENSE-CVDICT.md).
