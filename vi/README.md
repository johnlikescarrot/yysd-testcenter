# IELTS mỗi ngày

Khu luyện tập tiếng Việt độc lập, sử dụng HTML, CSS và JavaScript tĩnh. Các câu hỏi là nội dung tự biên soạn, không phải đề IELTS chính thức. Điểm và chuỗi ngày chỉ được lưu trong localStorage của trình duyệt, không đồng bộ giữa thiết bị. Không có API, tài khoản hay đánh giá band điểm trong khu này.

## Kiểm tra

Chạy `npm ci`, `npm test` và `npm run test:coverage` ở thư mục gốc. Ngưỡng 100% áp dụng **chỉ cho dòng và hàm trong `vi/core.js`**, không phải toàn bộ kho hoặc giao diện. Workflow `vietnamese-quality.yml` chạy các kiểm tra và Super-Linter cho JavaScript trong `vi/` khi có thay đổi liên quan. Lighthouse CI kiểm tra hai trang mới với mục tiêu 100 cho bốn nhóm điểm; điểm thực tế phụ thuộc lần chạy và không được bảo đảm trước.

## Xuất bản

`vietnamese-pages.yml` xuất bản **chỉ khu `vi/`**, không xuất bản toàn bộ trang hiện hữu, thư viện đề, PDF hoặc API. Để sử dụng: sau khi hợp nhất vào `main`, bật GitHub Pages với nguồn GitHub Actions, rồi chạy workflow nếu cần. Các chức năng cần API không hoạt động chỉ bằng GitHub Pages. Workflow không triển khai nhánh PR. Hãy xem xét cẩn thận trước khi dùng cho một trang Pages đang có nội dung khác.

Trang `guide.html` có thể in hoặc lưu thành PDF qua trình duyệt. Tài liệu gốc trong thư viện không bị sửa. Liên kết Scholar là tìm kiếm theo DOI; nguồn được nêu rõ trong tài liệu.
