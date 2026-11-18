# Xếp hạng Đại học Thế giới (YYSD)

Next.js hữu ích,thiết thực, đeo lên tại `youyisida.com/rankings` (`basePath: /rankings`, cảng 3002).

## bản địa khai phát

```bash
cd rankings
npm install
npm run db:push
npm run seed
npm run dev
```

 mở ra http://localhost:3002/rankings

## số liệu

- `npm run seed`: thẻ giương THE/ARWU/US News + hợp nhất `data/raw/qs-official` QS thực bề ngoài → đạo nhập SQLite
- `npm run fetch:qs`: dùng Chrome từ TopUniversities trảo QS World + ưu tiên ngành học (tất cả bảng tối đa trước 500)
- `npm run build:qs`: chỉ trọng chạy chính thức JSON → editions hợp nhất
- đồng thời QS đã đổi Website Games công khai bề ngoài; THE / mềm khoa / US News nhưng là có thể thay thế thẻ giương số liệu

## kiểm tra

```bash
npm run check
```
