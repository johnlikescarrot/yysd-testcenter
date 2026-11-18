# Trung tâm học tập YYSD

**[Sải bước · Luyện IELTS Academic bằng tiếng Việt](ielts-vi/)** có 16 bài luyện, lịch ôn theo câu từng làm và bốn sổ tay có nguồn học thuật. Không cần tài khoản. Xem [cách chạy thử, đo chất lượng và triển khai GitHub Pages](ielts-vi/README.md).

Xem [phạm vi Việt hóa và kết quả kiểm định](docs/kiem-dinh-ielts.md) để phân biệt bản học tĩnh với cổng có tài khoản.

Cổng YYSD tại [youyisida.com](https://youyisida.com) phục vụ IELTS và các chương trình quốc tế như A-Level. Cổng chính kết hợp giao diện tĩnh với Node API cho đăng nhập bằng số điện thoại, lưu kết quả, giao bài và các tính năng AI. Bản Sải bước không phụ thuộc API này.

## Dành cho học viên

| Mục | Nội dung |
| --- | --- |
| Từ vựng | Từ THPT, CET-4 và IELTS theo kỹ năng hoặc chủ đề; sổ từ sai |
| Đề IELTS | Nghe, Đọc, Viết Cambridge; luyện từng Section/Passage hoặc thi thử trên máy |
| Bài luyện | Phân tích câu phức, nghe chép số và luyện Nói |
| Chương trình quốc tế | Đề và tài liệu A-Level |
| Nhiệm vụ | Lịch học, bài tập giáo viên giao và hạn nộp |
| Nói / AI | Luyện Nói và nhận xét bài Viết theo hạn mức tài khoản |

Sau một bài thi thử trọn bộ, `cdt-report.html` hiển thị kết quả ba phần Nghe, Đọc và Viết. Bài Viết giữ bản nháp để người học xem lại; điểm tham khảo không phải kết quả IELTS chính thức.

## Dành cho giáo viên

Đăng nhập tại `teacher-login.html`. Trong `teacher-calendar.html`, chọn từ vựng, bài luyện bổ trợ, đề theo kỹ năng hoặc cả bộ đề; cũng có thể giao tệp HTML của mình. Các trang `teacher-*.html` còn có báo cáo tiến độ và chẩn đoán học tập.

## Cấu trúc

| Thư mục | Vai trò |
| --- | --- |
| `*.html`, `assets/` | Trang chính, điều hướng, phòng thi CDT, tài khoản và giao diện giáo viên |
| `ielts-vi/`, `quality/` | Lộ trình IELTS tĩnh, nguồn sổ tay, bản dựng Pages và kiểm thử |
| `library/<zone>/<subject>/` | Đề và giáo trình; `library/manifest.json` là danh mục được sinh tự động |
| `app/`, `desktop/` | Ứng dụng thi TOEFL và ứng dụng máy tính |
| `server/` | Express + SQLite: tài khoản, điểm, lịch, đồng bộ và dịch vụ AI |
| `rankings/`, `admission/` | Các ứng dụng phụ về xếp hạng và tuyển sinh |
| `scripts/` | Công cụ nhập đề, tạo danh mục và kiểm tra |

## Chạy tại máy

Dùng máy chủ HTTP thay vì mở HTML qua `file://`:

```sh
python3 -m http.server 8080
```

Mở `http://localhost:8080/ielts-vi/` để luyện miễn phí hoặc `http://localhost:8080/` để xem cổng chính. Để chạy các chức năng cần tài khoản, thiết lập API theo [`server/.env.example`](server/.env.example), cài các gói trong [`server/package.json`](server/package.json) và chạy riêng `npm start` trong `server/` (Node ≥18, cổng mặc định 3000). Xem `assets/js/auth.js` về địa chỉ API và `server/deploy/` về triển khai. **Pages chỉ phục vụ tệp tĩnh**; không đặt máy chủ, thông tin đăng nhập hoặc dữ liệu học viên trong bản xuất bản.

## Thêm nội dung và đồng bộ kết quả

Thêm đề vào `library/<zone>/<subject>/`, đặt các thẻ `exam:title`, `exam:duration` và `exam:description` nếu cần. Chạy `python3 scripts/build_manifest.py` để cập nhật danh mục; không sửa JSON bằng tay. URL và mã bài là khóa tham chiếu cho lịch và kết quả cũ; không đổi chúng chỉ để dịch nhãn hiển thị.

Đề tự chấm có thể thông báo kết quả cho trang chứa nó:

```js
parent.postMessage({ type: "yysd:score", score: 32, total: 40, band: 7 }, "*");
```

Bài Viết có thể gửi thêm `writingTask1` và `writingTask2` cho trang báo cáo. Xem thêm [thư viện Nghe Cambridge](library/mock/cambridge-listening/README.md) và [thư viện A-Level](library/mock/alevel/README.md).
