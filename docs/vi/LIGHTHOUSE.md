# Đạt Lighthouse 100/100

## Bốn hạng mục

| Hạng mục | Cách đạt |
| --- | --- |
| Hiệu năng | Không tải tài nguyên ngoài; CSS 22,5 KB; JS 90 KB tổng nhưng mỗi trang chỉ nạp module cần thiết; không ảnh raster; font hệ thống; không có JS chặn hiển thị |
| Khả năng truy cập | `lang="vi"`, một `h1` mỗi trang, thứ tự tiêu đề liền mạch, nhãn cho mọi ô nhập, `alt` cho ảnh, vùng đất (`header`/`nav`/`main`/`footer`), độ tương phản ≥ 4,5:1, không chặn phóng to |
| Thực hành tốt nhất | Không lỗi console, không `javascript:` URL, `rel="noopener"` cho liên kết ngoài, `type="module"`, không thư viện lỗi thời |
| SEO | `title` 15–65 ký tự, mô tả 70–165 ký tự, `viewport`, `theme-color`, `robots.txt`, liên kết có thể thu thập, không `noindex` |

## Chạy cục bộ

```bash
npm run serve
npx --yes @lhci/cli@0.15.1 autorun --config=lighthouserc.json
```

Máy không có Chrome có thể dùng `node vi/scripts/audit.mjs` — bộ kiểm tra tĩnh tương ứng với các tiêu chí trên
(cấu trúc HTML, nhãn, tương phản màu, ngân sách byte, manifest, service worker, dữ liệu, trích dẫn).

## Ngân sách trong CI

`lighthouserc.json` đặt ngưỡng cứng:

- `performance ≥ 1`, `accessibility ≥ 1`, `best-practices ≥ 1`, `seo ≥ 1`;
- FCP ≤ 1,8 s; LCP ≤ 2,5 s; TBT ≤ 150 ms; CLS ≤ 0,05; Speed Index ≤ 3,4 s;
- lỗi console, ảnh thiếu `alt`, nhãn thiếu, tương phản kém, thứ tự tiêu đề sai đều **fail build**.

## Vì sao không có hạng mục PWA?

Lighthouse 12 đã bỏ hạng mục PWA. Ứng dụng vẫn đáp ứng đầy đủ: manifest hợp lệ, icon 192/512, `display: standalone`,
service worker đăng ký và precache, hoạt động ngoại tuyến — được kiểm chứng bằng `tests/pwa.test.js` và
`tests/edge-cases.test.js` thay vì điểm số Lighthouse.
