# Trung tâm luyện thi YYSD

YYSD là nền tảng luyện IELTS và các chương trình quốc tế. Đề bài, đáp án và bài đọc tiếng Anh được giữ nguyên để học viên luyện đúng ngôn ngữ của kỳ thi.

## IELTS Atlas · bản học trên GitHub Pages

**[Mở bàn học](atlas.html) · [Thư viện đề và sổ tay PDF](atlas-library.html).** Bản tĩnh không cần tài khoản hay máy chủ chấm bài. Bài học, hướng dẫn, lời giải và phản hồi dành cho người Việt; bài đọc, câu hỏi, bản ghi âm và đáp án IELTS vẫn bằng tiếng Anh.

- **8 chặng, 24 câu**: đọc, nghe âm thanh thật, viết và nói. Có gợi ý bài tiếp theo, lịch ôn từng câu, mục tiêu ngày, chuỗi ngày học, điểm XP, hạng tuần cá nhân và dấu mốc bốn kỹ năng. Hạng tuần **không** phải bảng xếp hạng người dùng trực tuyến.
- **231 đề**: toàn bộ 226 trang của ba kệ Cambridge (kể cả sáu đề bổ sung), bốn bài đầu vào và một bài đọc mẫu. Có 296 đoạn ghi âm cho các đề nghe; Cambridge 21 có bản chép lời theo thời gian với bản dịch tiếng Việt tùy chọn. Thêm 95 thẻ chủ đề Speaking từ ngân hàng hiện có.
- **5 sổ tay có thể tải**: [nhịp học](studio/pdf/nhip-hoc.pdf), [đọc](studio/pdf/doc.pdf), [nghe](studio/pdf/nghe.pdf), [viết](studio/pdf/viet.pdf), [nói](studio/pdf/noi.pdf). Mỗi sổ tay có bài tập, trích dẫn đánh số, DOI và liên kết tìm bài theo nhan đề trên Google Scholar. Có bản văn bản trong thư viện để dùng với trình đọc màn hình.
- **Riêng tư**: tiến độ chỉ lưu trên trình duyệt đang dùng. Nhật ký bàn học giữ mười kết quả nộp đề gần nhất; không lưu nội dung bài luận vào nhật ký. Bản nháp bài viết được lưu riêng theo từng đề. Không có điểm IELTS chính thức, người học giả lập hay dịch vụ nhận diện giọng nói từ xa trong Atlas.

### Chạy và kiểm tra bản tĩnh

Cần Node.js ≥ 22.19, Python ≥ 3.11. Dùng môi trường Python riêng. FFmpeg có sẵn trên máy được ưu tiên; gói Python dự phòng cũng cung cấp FFmpeg cho các hệ điều hành được hỗ trợ.

```sh
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r scripts/studio/requirements.txt
npm ci
npm run build
python -m http.server 8080 --directory dist
```

Mở `http://localhost:8080/`. Lần đầu đóng gói sẽ nén âm thanh, các lần sau dùng bộ nhớ đệm theo nội dung. Chỉ `dist/` là bản xuất bản; không tải toàn bộ kho, dữ liệu máy chủ hay các PDF A-Level lên Pages.

```sh
npm test                              # c8: toàn bộ module chạy trên trình duyệt của Atlas
npm run test:papers                   # sau build: mở và làm bài trên mọi trang đề
python -m unittest discover -s tests/studio
python scripts/studio/check_release.py # liên kết nội bộ, đích neo, văn bản và trích dẫn PDF
CHROME_PATH=/path/to/chrome npm run test:browser
CHROME_PATH=/path/to/chrome npm run audit:pages
```

[Phạm vi kiểm thử, quy tắc XP và cách phát hành](docs/ielts-atlas.md). Các phần giáo viên, từ vựng chuyên sâu và API của hệ thống cũ vẫn được phục vụ riêng như bên dưới; chúng không nằm trong gói Pages.

## Các khu vực học tập

| Khu vực | Nội dung |
| --- | --- |
| Từ vựng | Từ theo chủ đề, từ vựng IELTS nghe – đọc – viết, ôn lại từ sai |
| IELTS | Đề Cambridge nghe, đọc và viết; luyện từng phần hoặc thi thử trên máy tính |
| Bài tập | Câu phức, nghe chép số và luyện nói |
| Khóa học quốc tế | Kho học liệu A-Level và các chương trình khác |
| Nhiệm vụ | Bài tập, lịch học và việc cần làm do giáo viên giao |
| Trợ giảng | Luyện nói và góp ý bài viết (cần API, có hạn mức) |

## Cấu trúc

- `index.html`, `assets/`: trang chủ, giao diện học viên và phòng thi.
- `library/`: đề thi kèm cơ chế chấm, từ vựng và các tài liệu của bên xuất bản.
- `server/`: Node API và SQLite cho đăng nhập, đồng bộ điểm, lịch học và trợ giảng. Xem [cấu hình mẫu](server/.env.example).
- `app/`, `desktop/`: luyện TOEFL và ứng dụng máy tính.
- `admission/`, `rankings/`: tư vấn tuyển sinh và xếp hạng trường.
- `teacher-login.html`, `teacher-calendar.html`: đăng nhập giáo viên và giao bài.

## Chạy nền tảng có máy chủ

Phục vụ tệp HTML qua HTTP thay vì mở trực tiếp. Chạy hai lệnh trong hai cửa sổ riêng:

```sh
python3 -m http.server 8080
```

```sh
cd server && cp -n .env.example .env && npm install && npm start
```

Máy chủ API cần Node.js 18 trở lên. Cấu hình kết nối nằm trong `assets/js/auth.js`; kịch bản triển khai máy chủ nằm trong `server/deploy/`. GitHub Pages chỉ phục vụ nội dung tĩnh, không chạy API này.

## Bổ sung đề và kết quả

Đặt đề mới trong `library/<zone>/<subject>/`. Chạy `python3 scripts/build_manifest.py` để tạo lại `library/manifest.json`; không sửa chỉ mục bằng tay. Các thẻ `exam:title`, `exam:duration` và `exam:description` mô tả đề. Sau khi chấm, trang đề gửi kết quả cho trang cha:

```js
parent.postMessage({ type: "yysd:score", score: 32, total: 40, band: 7 }, "*");
```

Đề viết có thể gửi thêm `writingTask1` và `writingTask2`. Kết quả thi thử đủ bộ xuất hiện ở `cdt-report.html`.
