# Trung tâm học tập YYSD

Nền tảng ôn thi IELTS, TOEFL và các chương trình quốc tế như A-Level. Cổng hiện hữu: [youyisida.com](https://youyisida.com). Đây **không** phải địa chỉ triển khai bản tiếng Việt trên GitHub Pages.

**[Sải bước · Luyện IELTS tiếng Việt](ielts-vi/README.md)** là bản học tĩnh, không cần tài khoản. Bản này có 12 bài luyện bốn kỹ năng, ôn lại câu sai, mục tiêu ngày và [bốn sổ tay có trích dẫn](ielts-vi/resources/). Chạy thử bằng `python3 -m http.server 8080 --directory ielts-vi`. Để biết cách kiểm thử và công bố qua Pages, xem [hướng dẫn của bản học](ielts-vi/README.md#github-pages).

## Cổng học tập hiện hữu

Cổng dùng giao diện tĩnh và API Node cho tài khoản, kết quả, bài tập do giáo viên giao và công cụ AI. Đề trong `library/` thường là tệp HTML tự chấm. Trang `exam.html` cung cấp khung hiển thị, đồng hồ và phòng thi trên máy (CDT).

| Khu vực | Nội dung |
| --- | --- |
| Từ vựng | Bộ từ THPT, CET-4, bộ từ theo kỹ năng IELTS, từ theo chủ đề và sổ lỗi sai |
| IELTS | Đề Nghe, Đọc, Viết Cambridge; luyện một phần hoặc một bài đọc; thi thử một kỹ năng hoặc trọn bộ |
| Đánh giá đầu vào | Ba đề có hướng dẫn tiếng Việt, câu hỏi tiếng Anh, phần dịch Việt–Anh và tiêu chí tự đánh giá; mở từ trang IELTS |
| Luyện tập | Đọc câu phức, nghe và ghi số, luyện nói |
| Khóa quốc tế | Đề và hướng dẫn chấm A-Level; sổ tay chữa bài tiếng Việt đi kèm trong trình xem PDF |
| Nhiệm vụ | Bài được giao, lịch và việc cần làm |
| Nói / AI | Luyện nói và nhận xét bài viết bằng AI, có hạn mức sử dụng |

Khi kết thúc thi thử trọn bộ Cambridge, `cdt-report.html` hiển thị kết quả ba kỹ năng. Không quy đổi điểm kinh nghiệm hay điểm tự chấm thành điểm IELTS chính thức.

### Giáo viên

Đăng nhập tại `teacher-login.html`. Trên `teacher-calendar.html`, chọn từ vựng, luyện phần còn yếu, thi thử một kỹ năng hoặc cả bộ; có thể tải lên bài HTML riêng. Các trang `teacher-*.html` còn có chức năng theo dõi và đánh giá học viên.

### Cấu trúc mã nguồn

| Đường dẫn | Vai trò |
| --- | --- |
| `*.html`, `assets/` | Trang chủ, tài khoản, phân loại nội dung, phòng thi, giao diện học viên và giáo viên |
| `library/` | Đề và bộ từ theo khu vực/môn; `manifest.json` là chỉ mục sinh tự động |
| `app/` | Ứng dụng thi TOEFL trên máy; kho HIT trong ứng dụng khác với kho đề TOEFL theo ngày trong `library/toefl/` |
| `server/` | Express và SQLite cho đăng nhập, đồng bộ điểm, lịch, dịch vụ AI |
| `rankings/`, `admission/` | Ứng dụng bảng xếp hạng và tuyển sinh (tùy chọn) |
| `scripts/` | Công cụ lập chỉ mục, tạo kho đề và kiểm tra dữ liệu |
| `ielts-vi/`, `quality/` | Bản luyện tiếng Việt độc lập; kiểm thử, tạo PDF/âm thanh và đóng gói Pages |

## Chạy cổng gốc trên máy

Dùng máy chủ HTTP thay vì mở tệp HTML trực tiếp. Nếu cần tài khoản, chạy API ở tiến trình riêng.

```sh
# Giao diện: http://localhost:8080
python3 -m http.server 8080

# API: http://localhost:3000 theo cấu hình mặc định; cần Node >= 18
cd server && cp -n .env.example .env && npm i && npm start
```

Xem [phụ thuộc API](server/package.json), [mẫu biến môi trường](server/.env.example), [`assets/js/auth.js`](assets/js/auth.js) và [công cụ triển khai máy chủ](server/deploy/). Không đưa `.env` hay cơ sở dữ liệu cục bộ vào Git.

## Cập nhật nội dung

- Đặt đề vào `library/<zone>/<subject>/`. Các thẻ `exam:title`, `exam:duration`, `exam:description` mô tả bài. Chạy `python3 scripts/build_manifest.py` hoặc để Actions cập nhật chỉ mục. Không sửa tay `manifest.json`.
- Đề gửi số câu đúng và tổng số câu về trang cha. Ví dụ khi nhúng cùng nguồn gốc: `parent.postMessage({type: 'yysd:score', score: 32, total: 40, band: 7}, location.origin)`. Bài viết có thể gửi thêm `writingTask1`, `writingTask2` cho báo cáo.
- [Ngân hàng Cambridge Listening](library/mock/cambridge-listening/README.md) · [Tạo lại đề Cambridge 12/21](scripts/cambridge_sources/README.md) · [Thư viện A-Level](library/mock/alevel/README.md).
- Với hai kho TOEFL, chạy `python3 scripts/localize_toefl_labels.py --write` sau khi nhập dữ liệu, rồi `node scripts/build_toefl_lab_index.js`. Công cụ chỉ thay nhãn đã biên tập và một số mẫu lời giải, giữ nguyên khóa `titleZh`/`zh` vì trình đọc cũ cần chúng. Kiểm tra lại bằng `node scripts/check_toefl_paper.js`, `node scripts/check_toefl_lab.js` và `node scripts/check_hit_swiss.js`.

Việt hóa cổng gốc đang được thực hiện theo từng phần. Hướng dẫn, lời giải chi tiết, nghĩa của từ, lời thoại dịch và các trang quản trị cũ chưa hoàn toàn bằng tiếng Việt. Không dùng kết quả coverage hay Lighthouse của Sải bước để suy ra chất lượng của toàn bộ kho này.

Để lập lại kiểm kê nguồn văn bản, chạy `python3 scripts/audit_vietnamese.py` (hoặc thêm `--rev <commit>` để đo mốc cũ). `--strict` trả lỗi nếu còn chữ Hán; kiểm kê không thay cho đọc soát bản dịch.
