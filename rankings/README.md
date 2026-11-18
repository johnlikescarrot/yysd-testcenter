# toàn thế giới Đại học bảng xếp hạng(YYSD)

Next.js đưa vào sử dụng, gắn kết đi `youyisida.com/rankings`(`basePath: /rankings`, giao diện 3002) 

## địa phương khai thác

```bash
cd rankings
npm install
npm run db:push
npm run seed
npm run dev
```

mở http://localhost:3002/rankings

## dữ liệu

- `npm run seed`: làm giám tuyển THE/ARWU/US News + biến thể của | `data/raw/qs-official` của QS thật bề mặt bên ngoài → giới thiệu vào SQLite
- `npm run fetch:qs`: sử dụng Chrome từ TopUniversities bắt QS World + có ưu tiên môn học(mỗi thông báo hoặc thông tri tối đa trước 500)
- `npm run build:qs`: hầu như lặp lại cào chính phủ JSON → editions biến thể của |
- một biến thể của QS đã trao đổi trang web chính thức mở bề mặt bên ngoài; THE / mềm ngành học / US News vẫn làm có thể thay thế làm giám tuyển dữ liệu

## kiểm tra

```bash
npm run check
```
