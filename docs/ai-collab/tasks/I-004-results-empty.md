# I-004 - results trống không tình trạng premium thẻ

**tình trạng: ** done

## mục tiêu

không đạt được gì xe sợi biến thể cũ của | `.results-empty` từ plain state lên một cấp làm biến thể của | cảm thấy thẻ 

## cho phép thay đổi

- `assets/css/dashboard-premium.css`: `.page-premium .results-empty` và con trai thành phần cơ bản của cái gì đó

## cấm

- results.html inline script mẫu chuỗi(chỉ nếu hầu như Canada class `results-empty`)

## thay đổi

- results inline: trống không tình trạng div Tăng class `results-empty`(dường như chưa có)
- CSS: padding, border, shadow-paper, ở giữa hai bên typography

## kiểm tra và chấp nhận

- dọn dẹp localStorage Kết quả → `/results.html` thấy thẻ biến thể của trống không tình trạng
- CTA nút bấm khoảng cách giữ

## quay lui

Xóa dashboard-premium trong `.results-empty` quy tắc 
