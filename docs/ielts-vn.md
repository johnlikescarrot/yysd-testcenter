# Hướng dẫn bản luyện IELTS tiếng Việt

Mở [`../ielts-vn.html`](../ielts-vn.html) hoặc chọn lối vào tiếng Việt tại
trang tổng quan IELTS. Trang mới bổ sung trải nghiệm học tập, không thay thế
các bài thi và nội dung Cambridge hiện có.

## Tính năng

- Luyện nhanh năm câu từ vựng học thuật, xem giải thích bằng tiếng Việt.
- Theo dõi chuỗi ngày học, XP, cấp độ và nhiệm vụ hằng ngày.
- Ôn tập ba mục từ theo phiên ngắn; phần thưởng nhiệm vụ chỉ được nhận một lần.
- Chuyển tới kho đề nghe, đọc, viết và nói hiện có.
- Xem diễn giải các nghiên cứu, mở Google Scholar/DOI và in danh mục thành PDF.

Tiến độ lưu cục bộ trong trình duyệt đang dùng; bản mẫu chưa đồng bộ giữa
thiết bị hoặc tài khoản. Bảng xếp hạng chỉ là minh họa, không hiển thị dữ liệu
người học thật. Bài từ vựng là nội dung mẫu, không thay thế đề thi chính thức.

## Kiểm thử và triển khai

```bash
bash scripts/test_ielts_vn.sh
```

Lệnh trên yêu cầu 100% độ bao phủ dòng, nhánh và hàm trong mô-đun logic
`assets/js/ielts-vn-core.js`; đây không phải tuyên bố bao phủ toàn bộ giao diện
hay toàn kho mã. Super-Linter được cấu hình chạy trong GitHub Actions khi các
tệp của tính năng thay đổi. Workflow Pages đóng gói trang tĩnh trên `main` hoặc
khi được chạy thủ công. Điểm Lighthouse phải được xác nhận trên môi trường
triển khai thực tế; kết quả chưa được đo trong sandbox này.
