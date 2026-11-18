# Trung tâm luyện thi YYSD

YYSD là nền tảng luyện IELTS và các chương trình quốc tế. Đề bài, đáp án và bài đọc tiếng Anh được giữ nguyên để học viên luyện đúng ngôn ngữ của kỳ thi.

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
