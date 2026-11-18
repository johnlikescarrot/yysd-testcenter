# IELTS Mỗi Ngày

Bản luyện IELTS Academic tĩnh, tiếng Việt, thuộc YYSD. Đề bài, ngữ liệu Nghe–Đọc, câu trả lời và mẫu diễn đạt vẫn bằng tiếng Anh. Không cần tài khoản, không gửi bài làm và không dự đoán band IELTS.

## Người học có gì?

- **Hai chặng, tám bài, 32 hoạt động.** Mỗi chặng có Nghe, Đọc, Viết và Nói. Bài Nghe có âm thanh và bản chép lời. Hoạt động Viết và Nói tự do có mẫu để tự đối chiếu, không chấm tự động.
- **Ôn giãn cách.** Câu sai đến hạn ngay; trả lời đúng khi đến hạn giãn theo mốc 1, 3, 7, 14 và tối đa 30 ngày. Trả lời đúng trước hạn không dời lịch.
- **Mục tiêu và cột mốc.** Mỗi câu có đáp án đúng cho 10 XP một lần mỗi ngày. Chuỗi tính theo ngày địa phương khi hoàn thành một bài hoặc lượt ôn. Tiến độ chỉ lưu trong trình duyệt hiện tại.
- **Ba cẩm nang PDF và bản web tương ứng.** Có 19 nguồn học thuật riêng biệt với DOI và liên kết tra cứu trên Google Scholar, cùng hai tài liệu chính thức của IELTS. Google Scholar là chỉ mục, không phải nhà xuất bản. Không suy diễn bằng chứng về kỹ thuật học thành cam kết tăng band.

## Chạy tại máy

Yêu cầu Node.js 22.19+ và Chromium. Trên Linux x64 bản dựng mặc định dùng Chromium đóng gói từ npm; máy tối giản cần thư viện hệ thống như `libnss3` và `libnspr4`. Có thể đặt `CHROME_PATH` tới Chrome/Chromium đã cài, đặc biệt trên macOS hoặc Windows.

```sh
cd ielts
npm ci
npm run build
npm run dev
```

Mở `http://localhost:4173`. Bản dựng chỉ chứa `dist/`: HTML, CSS, JavaScript, hai bản nghe gốc và PDF có văn bản chọn được, cấu trúc tài liệu và liên kết. Không chứa `server/`, cấu hình bí mật, đề thi bên thứ ba hay kho cũ. Hệ thống quản trị, thi thử và tài liệu A-Level ở ngoài bản IELTS này không bị sửa hoặc được tính vào phạm vi Việt hóa.

## Sửa bài học và cẩm nang

- `content/lessons.json`: ngữ liệu, câu hỏi, đáp án được chấp nhận và giải thích. Giữ nguyên ID đã phát hành để không làm mất lịch ôn.
- `content/guides.json` và `content/references.json`: nội dung cẩm nang và thư mục nguồn. Chèn `[@id]` ngay sau nhận định có nguồn. HTML và PDF được dựng từ cùng dữ liệu; không sửa tay PDF.
- `site/media/`: bản nghe tổng hợp từ kịch bản tự soạn dùng Piper `en_US-joe-medium` ([gói mô hình CC0](https://www.npmjs.com/package/vowel-lab-voices-float)); hình sổ tay và biểu tượng do dự án tạo. Không dùng nội dung hoặc hình ảnh thương hiệu của Duolingo.

## Kiểm tra và GitHub Pages

```sh
npm run lint
npm test
npm run build
npm run test:browser
npm run audit
```

- Cổng coverage yêu cầu **100% từng tệp JavaScript chạy trong bản IELTS** (`site/**/*.mjs`), cả dòng, câu lệnh, hàm và nhánh. Không phải coverage của các ứng dụng cũ, công cụ dựng hay toàn bộ kho.
- Bộ kiểm thử trình duyệt kiểm tra thao tác bàn phím, màn hình nhỏ, tải lại tiến độ, lượt ôn, bản nghe và tải PDF dưới đường dẫn dự án.
- Lighthouse chạy 8 trang trên cấu hình di động và máy tính, yêu cầu đúng 100/100 cho hiệu năng, khả năng tiếp cận, thực hành tốt và SEO. Đặt `IELTS_AUDIT_URL` tới URL bản đã phát hành để đo từ máy khác; điểm phụ thuộc môi trường chạy. Báo cáo ở `reports/`, coverage ở `coverage/`.
- Trong **Settings → Pages**, chọn **GitHub Actions**. Workflow `IELTS Mỗi Ngày` chạy Super-Linter và các cổng trên mỗi PR liên quan. Chỉ đẩy từ `main` hoặc nhánh phát hành được nêu rõ trong workflow mới xuất bản `dist/`; không cần hợp nhất PR để triển khai nhánh phát hành này. Không xuất bản kho cũ hoặc dùng `CNAME` của kho.
