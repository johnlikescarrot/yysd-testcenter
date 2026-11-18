# Lộ trình Việt hoá & nâng cấp toàn diện (2026-11)

> Mục tiêu: thay thế **toàn bộ nội dung không phải tiếng Anh** (tiếng Trung) bằng **tiếng Việt**, đồng thời đưa ứng dụng luyện thi IELTS lên mức hoàn thiện nhất: học tập gamification kiểu Duolingo, tài liệu PDF có trích dẫn học thuật phong phú từ Google Scholar, triển khai GitHub Pages, Lighthouse 100, bao phủ mã nguồn 100%, Super-Linter chạy thường xuyên và mọi thay đổi được đồng bộ vào PR.

## Nguyên tắc

1. **Giữ nguyên nội dung tiếng Anh** — đề thi, bài đọc, transcript, IPA, từ vựng tiếng Anh là tài liệu học tập; chỉ dịch phần chú thích/giao diện tiếng Trung sang tiếng Việt.
2. **Không sửa dữ liệu máy đọc** — khoá JSON, id, đường dẫn, tên tệp, mã màu, cấu trúc câu hỏi giữ nguyên; chỉ thay giá trị chuỗi hiển thị.
3. **Tự động hoá, có kiểm chứng** — mọi dịch thuật đi qua `tools/i18n/translate.py` + từ điển Hán–Việt CVDICT (CC BY-SA 4.0) + bảng thuật ngữ được biên tập thủ công; `tools/i18n/check.py` bảo đảm không còn ký tự Hán trong nội dung.
4. **Ưu tiên trải nghiệm** — giao diện mới dùng tiếng Việt tự nhiên, hệ thống thiết kế "nội dung như giấy – vỏ như kính", tôn trọng `prefers-reduced-motion` và truy cập bàn phím.
5. **Chất lượng đo được** — unit test chạy bằng `node --test`, bao phủ 100% (c8), Lighthouse CI chốt điểm 100 cho 4 hạng mục, Super-Linter chạy trên mọi push/PR và theo lịch.

## Các giai đoạn

| Giai đoạn | Nội dung | Trạng thái |
|---|---|---|
| 0 | Hạ tầng: workflow Pages / Super-Linter / Lighthouse / coverage, PR, `package.json`, quy tắc kiểm tra | ✅ |
| 1 | Ứng dụng IELTS tiếng Việt mới (`ielts/`): XP, streak, năng lượng, giải đấu, huy hiệu, SRS SM-2, ước tính band, thư viện PDF, lớp học, đóng vai hội thoại | 🔄 |
| 2 | Tài liệu PDF tiếng Việt với thư mục học thuật Google Scholar phong phú | 🔄 |
| 3 | Dịch 3.390 tệp có tiếng Trung (HTML/JS/CSS/JSON/MD/TS/PY) sang tiếng Việt và chuyển `lang="vi"` | 🔄 |
| 4 | Biên tập thủ công README / AGENTS / quy tắc thiết kế / doc nội bộ; cập nhật trang chủ liên kết phiên bản mới | 🔄 |
| 5 | Kiểm chứng: Super-Linter, `npm run coverage`, `npm run i18n:check`, build Pages, đẩy lên PR | 🔄 |

## Cấu trúc mới

```
ielts/                     Ứng dụng Pages (tiếng Việt, không phụ thuộc mạng)
├── index.html             Trang chính, tối ưu Lighthouse 100
├── assets/js/*.mjs        Module thuần, 100% coverage
├── assets/css/app.css     Hệ thống thiết kế
├── pdfs/*.pdf             Tài liệu học thuật tiếng Việt
├── research/sources.json  Thư mục Google Scholar
├── scripts/               Trình tạo PDF + builder Pages
└── tests/                 node:test + c8
tools/i18n/                Bộ dịch Hán–Việt & kiểm chứng bản địa hoá
.github/workflows/         pages.yml · super-linter.yml · quality.yml
```

## Ghi nhận

Từ điển Hán–Việt suy ra từ [CVDICT của Phong Phan](https://github.com/ph0ngp/CVDICT) (CC BY-SA 4.0), dựa trên CC-CEDICT. Xem `tools/i18n/NOTICE.md`.
