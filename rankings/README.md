# toàn thế giớiĐại họcbảng xếp hạng(YYSD)

Next.js đưa vào sử dụng,tin học gắn kếthọ `youyisida.com/rankings`(`basePath: /rankings`,giao diện 3002).

## địa phươngkhai thác tài nguyên

```bash
cd rankings
npm install
npm run db:push
npm run seed
npm run dev
```

mở http://localhost:3002/rankings

## dữ liệu

- `npm run seed`:làm giám tuyển THE/ARWU/US News + biến thể của `data/raw/qs-official`  QS thật bề mặt bên ngoài → giới thiệu vào SQLite
- `npm run fetch:qs`:sử dụng Chrome biến thể của TopUniversities bắt QS World + có ưu tiênmôn học(mỗi thông báo hoặc thông tritối đatrước 500)
- `npm run build:qs`:hầu như lặp lại động vật cào mặt đấtChính thức JSON → editions biến thể của
- một biến thể của QS đã trao đổitrang web chính thứcmởbề mặt bên ngoài;THE / mềm ngành học / US News vẫn làm với tư cách tiền tố có thểthay thếlàm giám tuyểndữ liệu

## kiểm tra

```bash
npm run check
```
