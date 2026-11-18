# Kiến trúc IELTS Việt

## Nguyên tắc

1. **Không phụ thuộc thư viện ngoài.** Toàn bộ ứng dụng là HTML + CSS + ES module thuần, không có bước biên dịch,
   không tải tài nguyên từ miền khác — điều kiện tiên quyết để đạt Lighthouse 100 và hoạt động khi ngoại tuyến.
2. **Một chiều dữ liệu.** `data/*.json` → module logic → hàm `render*(document, state)` → DOM. Không có trạng thái
   ẩn trong DOM; mọi thứ cần lưu đều nằm trong `store`.
3. **Kiểm thử được ở mọi tầng.** Mỗi module nhận `document`, `store`, `i18n`, `now` qua tham số để kiểm thử bằng jsdom.
4. **Tiếng Việt là ngôn ngữ gốc.** Chuỗi hiển thị đi qua `t()` trong `i18n.js`; không có chuỗi tiếng Anh/Trung trong UI.

## Sơ đồ module

| Tầng | Tệp | Trách nhiệm |
| --- | --- | --- |
| Hạ tầng | `util.js` | `clamp`, `shuffle`, `formatDate`, `hashString`, `mulberry32`, `todayKey`, `weekStart` |
| Hạ tầng | `i18n.js` | Từ điển `vi` (dự phòng `en`), `t()` nội suy `{ten}` |
| Hạ tầng | `store.js` | `defaultState`, `loadState`, `saveState`, `resetState` (localStorage an toàn) |
| Hạ tầng | `srs.js` | Lặp lại ngắt quãng SM-2 rút gọn: `review`, `dueCards` |
| Luật chơi | `gamify.js` | XP, combo, trái tim, đá quý, chuỗi ngày, cấp độ, huy hiệu, nhiệm vụ, `applySession` |
| Luật chơi | `quiz.js` | `scoreSession`, `nextUnfinishedLesson`, `lessonById`, `practiceSession`, `daysUntil` |
| Nội dung | `library.js` | `filterDocs`, `sortDocs`, `countCitations`, `citationUrl` |
| Nội dung | `league.js` | Bảng đấu 15 người, thăng/xuống hạng tất định theo `weekStart` |
| PWA | `pwa.js`, `pwa-cache.js`, `assets/js/sw.js`, `sw.js` | Đăng ký SW, chiến lược cache-first, precache, dọn cache cũ; `vi/sw.js` đặt ở gốc để SW được phép điều khiển toàn bộ phạm vi `/` |
| Trang | `page-common.js` | Thanh trên, thanh dưới, `applyTheme`, `setActiveNav`, `renderHeader` |
| Trang | `page-*.js` | `initHome`, `initLesson`, `initLibrary`, `initLeague`, `initProfile`, `initPractice` |
| Khởi động | `boot.js` | `fetchJson`, `sessionFromParams`, `bootPage()` chọn trang theo `body[data-page]` |

## Mô hình dữ liệu

`data/lessons.json`

```json
{
  "units": [
    {
      "id": "u1",
      "title": "Nền tảng",
      "lessons": [
        {
          "id": "u1l1",
          "title": "Nghe chủ động",
          "skill": "listening",
          "questions": [
            { "id": "q1", "type": "choice", "prompt": "…", "options": ["…"], "answer": 1, "explain": "…" }
          ]
        }
      ]
    }
  ]
}
```

Bốn dạng câu hỏi: `choice` (chọn đáp án), `fill` (điền từ), `order` (xếp từ), `listen` (nghe rồi chọn).
Mỗi câu bắt buộc có `explain` tiếng Việt; `order` yêu cầu `bank` cùng độ dài với `answer`.

`data/library.json`

```json
{
  "docs": [
    {
      "id": "on-tap-ngat-quang",
      "title": "Ôn tập ngắt quãng",
      "skill": "vocabulary",
      "level": "C1",
      "pages": 16,
      "file": "assets/pdf/on-tap-ngat-quang.pdf",
      "summary": "…",
      "citations": [{ "title": "…", "authors": "…", "year": 1885, "query": "…" }]
    }
  ]
}
```

## Luồng một phiên học

1. `bootPage()` đọc `data-page`, tải `lessons.json` và trạng thái từ `localStorage`.
2. `initLesson()` dựng câu hỏi hiện tại, hiển thị tiến độ và trái tim.
3. Người học trả lời → `submit()` chấm điểm, hiện giải thích, cộng XP tạm tính.
4. Kết thúc bài → `scoreSession()` tính XP/combo → `applySession()` cập nhật chuỗi ngày, trái tim,
   nhiệm vụ, huy hiệu, XP tuần và lưu lại.
5. `renderLeague()` xếp hạng lại bảng đấu theo `weekStart` và XP tuần.

## Chạy thử

```bash
node vi/scripts/serve.mjs          # cổng 4173, phục vụ thư mục vi/
node vi/scripts/audit.mjs          # kiểm tra tĩnh Lighthouse + nội dung
node vi/scripts/build-pdfs.mjs     # dựng lại 6 PDF từ library.json
node vi/scripts/check-pdfs.mjs     # xác minh số trang và liên kết Scholar
```
