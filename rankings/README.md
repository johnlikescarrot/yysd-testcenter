# Xếp hạng Đại học Thế giới (YYSD)

Ứng dụng Next.js, được gắn tại `youyisida.com/rankings` (`basePath: /rankings`, cổng 3002).

## Phát triển cục bộ

```bash
cd rankings
npm install
npm run db:push
npm run seed
npm run dev
```

Mở trình duyệt tại: http://localhost:3002/rankings

## Dữ liệu xếp hạng

- `npm run seed`: Nạp dữ liệu mẫu THE / ARWU / US News + hợp nhất dữ liệu thực tế QS từ `data/raw/qs-official` → nhập vào SQLite.
- `npm run fetch:qs`: Dùng Chrome để thu thập dữ liệu QS World từ TopUniversities + các môn học ưu tiên (tất cả các bảng lấy tối đa top 500).
- `npm run build:qs`: Chỉ chạy lại quá trình xử lý tệp JSON chính thức → hợp nhất các phiên bản phát hành.
- Đồng thời, QS đã thay đổi cấu trúc bảng công khai trên trang web chính thức; THE / ARWU (Shanghai Ranking) / US News hiện vẫn dùng dữ liệu mẫu thay thế.

## Kiểm tra

```bash
npm run check
```
