# YYSD — Trung tâm Luyện thi IELTS (tiếng Việt)

Nền tảng luyện thi IELTS & khóa học quốc tế (A-Level, TOEFL) với giao diện **hoàn toàn bằng tiếng Việt**, cơ chế học kiểu Duolingo và tài liệu học thuật trích dẫn Google Scholar. Trang trực tuyến: [youyisida.com](https://youyisida.com) · Triển khai qua GitHub Pages (`.github/workflows/pages.yml`).

## Điểm mới nổi bật

| Tính năng | Mô tả |
|---|---|
| 🇻🇳 Việt hóa toàn diện | `assets/js/i18n-vi.js` + `i18n-vi-browser.js`: dịch mọi chuỗi giao diện (kể cả nội dung nạp động) sang tiếng Việt; đề thi giữ tiếng Anh chuẩn kỳ thi thật |
| 🦉 Học kiểu Duolingo | `hoc-ielts.html`: lộ trình theo chặng, XP, cấp độ, chuỗi ngày học (streak), Tim, Ngọc, giải đấu (Đồng → Kim cương), huy hiệu — lõi thuần `assets/js/duolingo-core.js` |
| 🔁 Ôn tập cách quãng | Thuật toán SM-2 lên lịch ôn từ vựng/câu sai |
| 📚 PDF học thuật | `tai-lieu.html`: In/Lưu PDF luôn kèm danh mục tham khảo tra cứu được trên [Google Scholar](https://scholar.google.com) |
| ✅ Chất lượng | Kiểm thử bao phủ **100%** (dòng/hàm/nhánh) cho module mới; Super-Linter + Lighthouse CI trong `.github/workflows/ci.yml` |

## Chạy cục bộ

```bash
python3 -m http.server 8080   # giao diện → http://localhost:8080/hoc-ielts.html
npm test                      # kiểm thử
npm run test:coverage         # bao phủ 100%
npm run lint                  # kiểm tra Việt hóa
cd server && npm i && npm start   # API (Node ≥ 18, tùy chọn)
```

## Cấu trúc

- `*.html` — các trang (trang chủ, phòng thi, từ vựng, giáo viên…)
- `assets/js/i18n-vi*.js` — bộ dịch tiếng Việt · `assets/js/duolingo-core.js` — lõi gamification
- `library/` — đề thi & sách từ (tiếng Anh theo kỳ thi thật) · `server/` — API Express + SQLite
- `tests/` — kiểm thử Node · `docs/PHUONG-PHAP.md` — phương pháp & trích dẫn khoa học

Điểm số từ đề thi đồng bộ về trang cha qua `postMessage({type:"yysd:score", score, total, band})`.
