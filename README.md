# Trung tâm học tập YYSD

Nền tảng luyện IELTS và các chương trình quốc tế như A-Level. Trang của trung tâm: [youyisida.com](https://youyisida.com).

**[IELTS Atlas – bàn học tiếng Việt](ielts-vi/index.html)** bổ sung bài học ngắn, ôn cách quãng, thư viện đề và [cẩm nang có trích dẫn](ielts-vi/cam-nang.html). Xem [hướng dẫn dựng bản GitHub Pages và kiểm thử](ielts-vi/README.md). Bản tĩnh này không yêu cầu đăng nhập.

## Khu học sinh

| Khu vực | Chức năng |
| --- | --- |
| Từ vựng | Từ THPT, CET-4 và IELTS theo kỹ năng; bộ từ theo chủ đề và sổ từ sai |
| Đề IELTS | Đề nghe, đọc, viết Cambridge; luyện từng section/passage, từng kỹ năng hoặc cả bộ trong giao diện thi trên máy (CDT) |
| Bài tập | Phân tích câu phức, nghe và ghi số, luyện nói |
| Chương trình quốc tế | Tài liệu A-Level và các chương trình liên quan |
| Nhiệm vụ | Bài tập, lịch và công việc giáo viên giao |
| Nói và viết với AI | Luyện nói, nhận xét bài viết (có hạn mức sử dụng) |

Sau khi nộp bộ đề thi thử, giao diện CDT hiển thị trạng thái đang xử lý rồi mở báo cáo ba kỹ năng (`cdt-report.html`).

## Khu giáo viên

- Đăng nhập ở `teacher-login.html`.
- Giao bài theo lịch ở `teacher-calendar.html`: chọn từ vựng, phần cần củng cố, đề theo kỹ năng hoặc cả bộ; có thể tải bài HTML của trường lên.
- Xem kết quả và các công cụ khác ở nhóm trang `teacher-*.html`.

## Cấu trúc

```text
*.html       Trang chủ, phòng thi, khu từ vựng, khu giáo viên…
assets/      CSS và JavaScript dùng chung (phân loại, CDT, xác thực)
library/     Đề và học liệu HTML, theo <zone>/<subject>; manifest.json do script tạo
ielts-vi/    IELTS Atlas, PDF tiếng Việt và công cụ đóng gói tĩnh
server/      Express + SQLite: tài khoản, điểm, lịch và dịch vụ AI
rankings/    Ứng dụng xếp hạng đại học (tùy chọn)
admission/   Ứng dụng tuyển sinh (tùy chọn)
scripts/     Lập chỉ mục nội dung, kiểm tra đề và ngân hàng từ
```

Xem [phụ thuộc API](server/package.json), [cấu hình môi trường mẫu](server/.env.example) và [script triển khai máy chủ](server/deploy/). GitHub Pages chỉ phục vụ tài liệu tĩnh; không chạy Express hoặc SQLite.

## Xem tại máy

Để mở cả trung tâm, chạy máy chủ HTTP từ thư mục gốc thay vì nhấp đúp vào tệp HTML:

```sh
python3 -m http.server 8080
```

Mở `http://localhost:8080`. Với tính năng cần tài khoản hoặc đồng bộ, khởi động API trong một cửa sổ khác (Node ≥ 18):

```sh
cd server && cp -n .env.example .env && npm install && npm start
```

API mặc định dùng cổng 3000. Xem `assets/js/auth.js` và cấu hình môi trường để biết cách giao diện kết nối. Để dựng **riêng Atlas**, dùng quy trình [trong `ielts-vi/`](ielts-vi/README.md).

## Đề và điểm

Đặt đề vào `library/<zone>/<subject>/`. GitHub Actions hoặc `python3 scripts/build_manifest.py` tái tạo `library/manifest.json`. Có thể thêm các thẻ meta `exam:title`, `exam:duration`, `exam:description`. Khi chấm xong, trang đề báo điểm cho trang cha, ví dụ:

```js
parent.postMessage({ type: "yysd:score", score: 32, total: 40, band: 7 }, "*");
```

Bài viết có thể kèm `writingTask1` và `writingTask2` để hiển thị trong báo cáo. Xem thêm [kho nghe Cambridge](library/mock/cambridge-listening/README.md) và [thư viện A-Level](library/mock/alevel/README.md).
