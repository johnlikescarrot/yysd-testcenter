# YYSD · IELTS Việt

Ứng dụng luyện thi IELTS **hoàn toàn bằng tiếng Việt**, chạy tĩnh trên GitHub Pages:
không framework, không webfont, không CDN, không phụ thuộc mạng sau lần tải đầu.

## Người học nhận được gì

| Khu vực | Nội dung |
| --- | --- |
| **Trang chủ** | Vòng mục tiêu XP trong ngày, bài kế tiếp, 3 nhiệm vụ hằng ngày, bảng hạng tuần, từ của ngày, band ước lượng |
| **Lộ trình** | 8 chương · 24 bài · 120 câu hỏi (Reading, Listening, Writing, Speaking, từ vựng AWL, ngữ pháp câu phức) |
| **Bài học** | Bốn dạng câu hỏi: trắc nghiệm, điền từ, xếp câu, nghe – chép; gợi ý, giải thích đáp án, tổng kết XP |
| **Luyện tập** | Thẻ từ vựng theo lịch 1 → 3 → 7 ngày, nghe chép chính tả, 8 đề Writing kèm dàn ý và bài mẫu, 8 cue card Speaking có hẹn giờ |
| **Thư viện** | 37 nghiên cứu (22 có DOI) trích từ Google Scholar, lọc theo chủ đề, 7 tài liệu PDF mỗi tài liệu 20 trích dẫn |
| **Tiến độ** | XP, chuỗi ngày, biểu đồ 28 ngày, band từng kỹ năng, 13 thành tựu, sao lưu và khôi phục dữ liệu |

Cơ chế giữ nhịp kiểu Duolingo: XP, đá quý, 5 trái tim (hồi 1 điểm mỗi 20 phút), chuỗi ngày có
bảo hiểm và sửa chuỗi, nhiệm vụ hằng ngày, 5 hạng đấu theo XP, 13 thành tựu.

## Chạy thử tại máy

```bash
cd vi
python3 -m http.server 8080
# mở http://localhost:8080
```

Ứng dụng cần máy chủ tĩnh vì dữ liệu được nạp bằng `fetch` từ `data/*.json`.

## Kiểm thử

```bash
cd vi
npm install --no-save jsdom      # chỉ cần cho kiểm thử khói
npm test                         # 147 test, bắt buộc 100% dòng / nhánh / hàm
node ../scripts/vi/check_content.mjs   # toàn vẹn 11 tệp dữ liệu + 7 PDF + 7 trang
node ../scripts/vi/smoke.mjs           # mở 6 trang trong jsdom, bấm thử như người dùng
npx --yes eslint@9 .
```

`npm test` chạy `tests/all.test.mjs` — điểm vào duy nhất nạp toàn bộ test trong **một tiến trình**
để số liệu coverage phản ánh đúng phần mã đã được chạm tới.

## Sinh lại nội dung

```bash
python3 scripts/vi/build_pages.py    # sinh 6 trang HTML + 404.html + robots.txt
python3 scripts/vi/build_pdfs.py     # sinh 7 PDF trong library/pdf/ (reportlab + DejaVu)
```

Không sửa tay các tệp `.html` ở thư mục này: chúng được sinh từ `scripts/vi/build_pages.py`.

## Cấu trúc

```text
vi/
├── index.html · hoc.html · bai-hoc.html · luyen-tap.html · thu-vien.html · tien-do.html
├── 404.html · robots.txt · manifest.webmanifest · sw.js
├── css/app.css                  # design system (tokens, layout, component)
├── js/app.js                    # bộ điều khiển: render + dispatch hành động
├── js/browser.js                # bootstrap trình duyệt (fetch, localStorage, TTS, tải tệp)
├── js/core/                     # 11 module thuần, không chạm DOM
│   ├── date.js · text.js · quiz.js · srs.js · scoring.js · content.js
│   └── gamify.js · quests.js · league.js · papers.js · state.js
├── js/views/                    # 8 module dựng HTML theo từng trang
├── data/                        # curriculum, 8 unit, vocab, papers, pdfs, prompts
├── library/pdf/                 # 7 tài liệu PDF có trích dẫn Google Scholar
├── img/favicon.svg
├── tests/                       # 14 tệp test + điểm vào all.test.mjs
└── eslint.config.js · package.json
```

## Dữ liệu và trích dẫn

* `data/papers.json` — 37 nghiên cứu, mỗi mục có `findingVi`, `applyVi`, `tags`, `docs` và DOI khi có.
* `data/pdfs.json` — 7 tài liệu; tệp PDF thật nằm trong `library/pdf/`.
* Mỗi PDF kết thúc bằng danh mục 20 trích dẫn: tiêu đề, tác giả, năm, tạp chí, liên kết
  `scholar.google.com/scholar?q=…` và `doi.org/…` khi có DOI.

## Triển khai

| Workflow | Việc làm |
| --- | --- |
| `.github/workflows/vi-ci.yml` | Chạy test + coverage 100%, kiểm tra nội dung, kiểm thử khói, ESLint |
| `.github/workflows/vi-lint.yml` | Super-Linter (JSON, YAML, Markdown, Python) giới hạn trong `vi/`, `scripts/vi/`, `.github/` |
| `.github/workflows/vi-pages.yml` | Đóng gói `vi/` và phát hành lên GitHub Pages (giữ `CNAME`, thêm `.nojekyll`) |
| `.github/workflows/vi-lighthouse.yml` | Lighthouse CI: bắt buộc 100 cả bốn hạng mục (`.lighthouserc.json`) |

## Quy ước

* Mọi văn bản giao diện là tiếng Việt; nội dung tiếng Anh chỉ nằm trong câu hỏi và ví dụ học thuật.
* `js/core/*` không chạm DOM để kiểm thử được 100%; `js/browser.js` là lớp mỏng duy nhất chạm DOM.
* Không thêm phụ thuộc chạy trên trình duyệt. Mọi thứ phải tải được từ GitHub Pages.
