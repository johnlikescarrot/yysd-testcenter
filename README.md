# Trung tâm học tập YYSD

**[Sải bước – Luyện IELTS Academic](ielts-vi/)** là lộ trình tự học cho người Việt: làm bài ngắn, nghe đoạn ghi âm, luyện nói và viết, xem giải thích rồi ôn lại câu sai. Không cần đăng ký. Điểm kinh nghiệm phản ánh hoạt động học, không quy đổi sang band IELTS. [Hướng dẫn sử dụng và tài liệu](ielts-vi/README.md) · [Phạm vi Việt hóa và kiểm định](ielts-vi/VALIDATION.md).

## Bản tĩnh cho GitHub Pages

```sh
npm ci --prefix quality
npm test --prefix quality
npm run build --prefix quality
python3 -m http.server 8080 --directory quality/dist
```

Mở `http://localhost:8080/`. Chỉ bản dành cho người tự học được đóng gói; không gửi đáp án đến dịch vụ bên ngoài, không đưa máy chủ, dữ liệu tài khoản, ngân hàng âm thanh nhiều GB hoặc `CNAME` của hệ thống cũ lên Pages.

## Cổng học tập và thi thử có tài khoản

Cổng gốc kết hợp giao diện tĩnh và API Node.js. Trang chủ `index.html` dẫn đến cả bản tự học và phần đăng nhập. Các chức năng dùng tài khoản vẫn cần API riêng, không chạy trên GitHub Pages.

| Khu vực | Chức năng |
| --- | --- |
| Từ vựng | Sách từ vựng, ôn theo chủ đề và sổ từ sai |
| IELTS | Luyện Nghe, Đọc, Viết Cambridge theo phần hoặc thi thử trên máy (CDT); xem kết quả sau khi nộp |
| Bài tập | Câu phức, nghe chép số, luyện nói, nhận xét bài viết theo hạn mức |
| Chương trình quốc tế | Tài liệu A-Level và các chương trình khác |
| Giáo viên | `teacher-login.html` để đăng nhập; `teacher-calendar.html` để giao bài, xếp lịch và tải bài HTML; nhóm trang `teacher-*.html` để theo dõi học viên |

### Thư mục

- `assets/`: giao diện, điều hướng, phòng thi và quản lý phiên đăng nhập.
- `library/`: đề và học liệu. `library/manifest.json` được sinh bởi `scripts/build_manifest.py`; thêm đề dưới `library/<zone>/<subject>/`.
- `server/`: API Express và SQLite cho tài khoản, kết quả, lịch và dịch vụ AI. Xem [gói phụ thuộc](server/package.json), [mẫu môi trường](server/.env.example) và `server/deploy/`.
- `app/`, `desktop/`: ứng dụng thi TOEFL và ứng dụng máy tính. `admission/`, `rankings/`: các hệ thống phụ trợ.

Để chạy cổng gốc, phục vụ thư mục gốc bằng máy chủ HTTP. Khởi động API riêng bằng `cd server && cp -n .env.example .env && npm install && npm start` (Node.js ≥18). Xem cấu hình kết nối trong `assets/js/auth.js`. Không đưa khóa hoặc dữ liệu học viên vào Git.

Đề HTML có thể khai báo `exam:title`, `exam:duration`, `exam:description`. Khi chấm xong, đề gửi thông điệp `yysd:score` cho khung cha với các trường `score`, `total`, `band`; bài Viết có thể kèm `writingTask1`, `writingTask2`. Báo cáo toàn bài ở `cdt-report.html`. Xem thêm [kho Nghe Cambridge](library/mock/cambridge-listening/README.md) và [kho A-Level](library/mock/alevel/README.md).
