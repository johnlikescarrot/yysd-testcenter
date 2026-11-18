# Danh mục Nghiệm thu Khách hàng Thí điểm Đầu tiên (Pilot Checklist - Giai đoạn 6)

Sau khi mã nguồn của Giai đoạn 0–5 được triển khai lên môi trường chính thức (production), phối hợp cùng đối tác thực tế hoặc bán thực tế để vận hành kiểm thử toàn diện toàn bộ quy trình.

## 1. Trước khi kích hoạt (Nghiệp vụ & Thương mại)

- [ ] Xác nhận quyền ủy quyền nội dung (tài liệu ôn tập Cambridge IELTS và các tài nguyên liên quan đã được cấp phép sử dụng cho đối tác).
- [ ] Thống nhất mức phí dịch vụ theo tháng / năm và thời hạn hiệu lực của hợp đồng.
- [ ] Yêu cầu đối tác chuẩn bị: Tên pháp nhân / thương hiệu chính thức, tệp Logo định dạng PNG/JPG sắc nét, slug tên miền con mong muốn, số điện thoại của Quản trị viên (đã đăng ký sẵn tài khoản Giáo viên trên hệ thống).

## 2. Thao tác trên Bảng điều khiển Trung tâm

- [ ] Mở trang quản trị `platform.html` (đăng nhập bằng tài khoản Super Admin).
- [ ] Tạo tổ chức mới: Nhập tên tổ chức, slug tên miền con, số điện thoại Quản trị viên, ngày hết hạn.
- [ ] Tải lên (Upload) tệp Logo của đối tác.
- [ ] Xác nhận tổ chức mới xuất hiện trong danh sách quản lý, với các chỉ số thống kê ban đầu khởi tạo từ mức 0.

## 3. Quy trình nghiệm thu phía Đối tác

- [ ] Mở liên kết `https://{slug}.youyisida.com`, thanh điều hướng hiển thị đúng tên tổ chức và logo tương ứng.
- [ ] Quản trị viên chi nhánh đăng nhập vào Cổng giáo viên, truy cập thành công mục «Phân bổ học viên».
- [ ] Đăng ký tài khoản mới hoặc nhập danh sách học viên; học viên sau khi đăng nhập chỉ nhìn thấy dữ liệu học tập của chính mình.
- [ ] Học viên hoàn thành một đề thi thử Cambridge IELTS, điểm số được ghi nhận chính xác và hiển thị trên Cổng giáo viên của chi nhánh đó.
- [ ] Đăng nhập từ chi nhánh khác (hoặc trang chính YYSD), xác nhận tuyệt đối không nhìn thấy học viên và điểm số của chi nhánh đối tác (cô lập dữ liệu hoàn toàn).

## 4. Nghiệm thu nội bộ (Phía Đội ngũ Kỹ thuật)

- [ ] Bảng điều khiển trung tâm theo dõi được số lượng học viên và mức độ hoạt động của chi nhánh.
- [ ] Tính năng «Đăng nhập hỗ trợ khách hàng» cho phép mở Cổng giáo viên của đối tác để cùng kiểm tra khi cần thiết.
- [ ] Nhật ký thao tác hệ thống ghi nhận đầy đủ các sự kiện liên quan.
- [ ] Chỉnh sửa ngày hết hạn của tổ chức về ngày hôm qua → trang của đối tác chuyển hướng sang `suspended.html`; chỉnh lại thời hạn tương lai và chọn «Khôi phục kích hoạt» → hệ thống trở lại hoạt động bình thường.

## 5. Nhật ký xử lý vấn đề trong đợt thử nghiệm

| Vấn đề phát sinh | Mức độ nghiêm trọng | Giải pháp xử lý |
|---|---|---|
| Lệnh `git pull` trong `sync-web.sh` trên ECS đôi khi bị quá thời gian (timeout) kết nối với GitHub | Trung bình | Chuyển sang đồng bộ chủ động bằng `rsync` từ `/opt/yysd/repo`; tinh chỉnh kịch bản để bỏ qua lần pull thứ hai khi không cần thiết |
| Tên miền con (slug) mới tạo cần mở rộng danh sách SAN trong chứng chỉ HTTPS | Thấp | Bản ghi DNS wildcard đã sẵn sàng; chờ chuyển sang chứng chỉ wildcard tự động qua DNS-01 hoặc chạy lệnh `certbot --expand` khi mở tài khoản mới |
| Mã kích hoạt Quản trị viên của Ease chỉ có 1 lượt dùng, sau khi nghiệm thu cần cấp mã mới cho người phụ trách chính thức | Thấp | Sử dụng tính năng thêm lượt hoặc tạo lại mã mới (regenerate) trên bảng điều khiển `reg-keys` |

Sau khi hoàn tất nghiệm thu điểm thí điểm, đội ngũ sẽ tiến hành mở rộng quy mô phát triển khách hàng. Các tính năng cho phép đối tác tự tải lên tài liệu và cổng thanh toán trực tuyến sẽ được triển khai trong Giai đoạn 7+ tiếp theo.
