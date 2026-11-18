# YYSD IELTS — ứng dụng tiếng Việt trên GitHub Pages

Ứng dụng tĩnh, không phụ thuộc máy chủ, không thu thập dữ liệu. Toàn bộ giao diện, giải thích và tài liệu bằng tiếng Việt; đề thi giữ nguyên tiếng Anh.

## Tính năng

- Bài học ngắn cho bốn kỹ năng Nghe / Đọc / Viết / Nói, phản hồi và giải thích tức thì bằng tiếng Việt.
- Điểm kinh nghiệm (XP), mục tiêu ngày, chuỗi ngày có «đóng băng», năng lượng hồi phục, giải đấu, huy hiệu và bảng xếp hạng tuần.
- Lặp lại ngắt quãng SM-2 cho thẻ từ vựng; hàng đợi ôn tập và tỉ lệ thuộc.
- Ước tính band IELTS, đối chiếu chỉ số YYSD với khung CEFR.
- Đóng vai hội thoại Speaking Part 2–3, bảng giao bài cho giáo viên, nhắc học hàng ngày và bản sao lưu tiến độ.
- Sáu tài liệu PDF tiếng Việt trong `pdfs/`, mỗi tài liệu có **90 trích dẫn** kèm liên kết `scholar.google.com`; trang tĩnh `nghien-cuu.html` liệt kê toàn bộ thư mục; dữ liệu nguồn ở `research/sources.json`.
- Hoạt động ngoại tuyến nhờ service worker; không có yêu cầu mạng bên thứ ba.

## Chạy locally

```bash
npm ci --prefix ielts
npm test --prefix ielts          # node --test
npm run coverage --prefix ielts  # c8, yêu cầu 100%
python3 ielts/scripts/build_pages.py
python3 -m http.server 4173 --directory dist
```

## Kiểm chứng

- `npm run coverage --prefix ielts` — 100% statements / branches / functions / lines cho mọi module trong `assets/js/*.mjs`.
- `npx lhci autorun --config=lighthouserc.json` — Lighthouse 100 cho Performance, Accessibility, Best Practices, SEO (chạy trên `dist/`).
- `python3 tools/i18n/super_lint.py --all` và action `super-linter/super-linter` — kiểm tra vệ sinh mã nguồn.
- `python3 tools/i18n/check.py` — bảo đảm không còn ký tự Hán trong nội dung.

## Triển khai

`.github/workflows/pages.yml` đóng gói `ielts/` thành `dist/` (CSS được inline, JS được đóng gói bằng esbuild), rồi triển khai qua `actions/deploy-pages`. Bật **Settings → Pages → Source: GitHub Actions** một lần; action `configure-pages` với `enablement: true` cũng sẽ cố gắng bật tự động.
