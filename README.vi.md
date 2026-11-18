# IELTS Việt — ứng dụng luyện thi IELTS bằng tiếng Việt

Ứng dụng web tiến bộ (PWA) nằm trong thư mục [`vi/`](vi/), được xây dựng lại từ đầu cho người học Việt Nam:
toàn bộ giao diện, thông báo, ngân hàng câu hỏi, tài liệu PDF và phần giải thích đều bằng tiếng Việt.

- **6 trang**: Trang chủ, Học, Luyện tập, Thư viện, Bảng xếp hạng, Hồ sơ.
- **50 câu hỏi** thuộc 5 unit (Nghe, Đọc, Viết, Từ vựng, Ngữ pháp) với giải thích tiếng Việt.
- **6 tài liệu PDF** (13–16 trang mỗi tài liệu) kèm **54 trích dẫn Google Scholar**.
- Cơ chế học tập kiểu Duolingo: XP, chuỗi ngày học, trái tim, đá quý, huy hiệu, nhiệm vụ ngày và 5 hạng đấu.
- **215 bài kiểm thử**, độ bao phủ **100%** (câu lệnh, nhánh, hàm, dòng) — kể cả service worker.
- Mục tiêu **Lighthouse 100/100** cho Hiệu năng, Khả năng truy cập, Thực hành tốt nhất và SEO.

## Bắt đầu nhanh

```bash
npm install
npm run serve      # http://localhost:4173/vi/
npm test           # 215 bài kiểm thử
npm run coverage   # bắt buộc 100%
npm run ci         # toàn bộ cổng chất lượng
```

## Cấu trúc

```text
vi/
├── index.html · hoc.html · luyen-tap.html · thu-vien.html · bang-xep-hang.html · ho-so.html
├── manifest.webmanifest · robots.txt
├── assets/css/app.css
├── assets/js/        # util, i18n, store, srs, gamify, quiz, library, league, pwa, sw, các trang
├── assets/pdf/       # 6 tài liệu có trích dẫn Scholar
├── data/             # lessons.json, library.json
└── scripts/          # serve, audit, build-pdfs, check-pdfs, pdf-content
```

## Chất lượng

| Cổng | Công cụ | Kết quả |
| --- | --- | --- |
| Kiểm thử | Vitest + jsdom | 215/215 |
| Độ bao phủ | v8 | 100% × 4 chỉ số |
| Lint JS | ESLint 9 (flat config) | 0 lỗi |
| Lint CSS | Stylelint | 0 lỗi |
| Lint HTML | HTMLHint | 0 lỗi |
| Lint Markdown | markdownlint-cli2 | 0 lỗi |
| Lint tổng | Super-Linter | GitHub Actions |
| Lighthouse | Lighthouse CI | 4 hạng mục × 100 |

## Triển khai

Workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) đóng gói riêng thư mục `vi/` và xuất bản lên
GitHub Pages mỗi khi có thay đổi. Trong **Settings → Pages**, chọn nguồn **GitHub Actions**.
Ứng dụng sau đó chạy tại `https://<tài-khoản>.github.io/<kho>/`.

Chi tiết: [hướng dẫn kiến trúc](docs/vi/ARCHITECTURE.md) · [quy tắc dịch thuật](docs/vi/TRANSLATION.md) ·
[Lighthouse 100](docs/vi/LIGHTHOUSE.md).
