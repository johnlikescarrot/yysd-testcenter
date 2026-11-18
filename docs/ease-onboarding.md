# Hướng dẫn Kích hoạt và Nghiệm thu Điểm Thí điểm Ease Education (ease)

## Các cổng truy cập (Web Portal Endpoints)

| Mục đích sử dụng | Địa chỉ truy cập |
|---|---|
| Trang chủ chi nhánh | https://ease.youyisida.com |
| Đăng nhập (Học viên / Giáo viên / Quản trị viên) | https://ease.youyisida.com/login.html |
| Đăng ký học viên | https://ease.youyisida.com/register.html |
| Đăng ký nhân viên (Giáo viên / Quản trị viên) | https://ease.youyisida.com/teacher-register.html |
| Bàn làm việc giáo viên | https://ease.youyisida.com/teacher.html |
| Phân bổ học viên (Quản trị viên chi nhánh) | https://ease.youyisida.com/admin-assign.html |

Bảng điều khiển trung tâm (chỉ dành cho quản trị viên tại youyisida.com): https://youyisida.com/platform.html

## Cấu hình tổ chức hiện tại (Đã xác minh ngày 22/07/2026)

- Tên tổ chức: **Ease Education**
- Mã định danh (slug): `ease`
- Trạng thái: Bình thường (hạn sử dụng đến ngày 21/10/2026)
- Số điện thoại Quản trị viên (dùng tạm để nghiệm thu): 15901754473
- Logo: Đã tải lên hệ thống

## Mã kích hoạt đăng ký (Vui lòng gửi đúng người nhận, không phổ biến công khai)

| Vai trò người dùng | Mã kích hoạt | Lượt sử dụng còn lại |
|---|---|---|
| Quản trị viên chi nhánh | `EaseAdm7760` | 1 / 1 |
| Giáo viên | `EaseTch5508` | 4 / 5 (Đã dùng 1 lần) |
| Học viên | `EaseStu2273` | 10 / 10 |

Tại trang web của chi nhánh, người dùng cần nhập mã kích hoạt tương ứng để hoàn tất đăng ký; riêng tại trang trung tâm `youyisida.com`, người dùng có thể đăng ký trực tiếp bằng mã xác thực SMS.

## Quy trình nghiệm thu khuyến nghị (Quản trị viên = 15901754473)

1. **Đăng ký Quản trị viên:**
   - Mở https://ease.youyisida.com/teacher-register.html
   - Điền Số điện thoại, Mật khẩu, **tại ô Mã kích hoạt đăng ký giáo viên, nhập Mã kích hoạt Quản trị viên `EaseAdm7760`** (không dùng mã giáo viên thông thường).
   - Sau khi đăng ký thành công, truy cập Cổng giáo viên và kiểm tra chức năng «Phân bổ học viên».

2. **Phân bổ học viên:**
   - Tại Cổng giáo viên → Phân bổ học viên: Nhập danh sách hoặc đợi học viên đăng ký, sau đó phân bổ học viên cho giáo viên phụ trách.

3. **Kiểm tra đăng ký Học viên:**
   - Sử dụng **số điện thoại mới chưa từng đăng ký trên hệ thống trung tâm**, mở https://ease.youyisida.com/register.html
   - Nhập **Mã kích hoạt học viên `EaseStu2273`** và hoàn tất đăng ký.

4. **Làm bài thi thử và Ghi nhận điểm số:**
   - Học viên đăng nhập → Khu đề thi → hoàn thành một đề thi Cambridge IELTS → Giáo viên kiểm tra điểm số hiển thị trên Cổng giáo viên của Ease.

5. **Xác minh tính cô lập dữ liệu:**
   - Đăng nhập tài khoản Super Admin tại https://youyisida.com, xác nhận **không nhìn thấy** dữ liệu học viên của chi nhánh Ease khi xem ở chế độ thông thường.

6. **Tạm ngưng hoạt động khi hết hạn (Kiểm thử tùy chọn):**
   - Tại bảng điều khiển trung tâm, chỉnh ngày hết hạn của Ease thành ngày hôm qua → trang web của Ease sẽ tự động chuyển hướng sang `suspended.html` → kích hoạt lại hạn dùng thì hệ thống trở lại hoạt động bình thường.

## Mẫu thông báo gửi người phụ trách Ease (Có thể sao chép trực tiếp)

> Nền tảng học tập trực tuyến Ease Education đã chính thức được kích hoạt.
> Địa chỉ website: https://ease.youyisida.com
> Cổng đăng nhập: https://ease.youyisida.com/login.html (Dành cho Học viên, Giáo viên và Quản trị viên).
> Quản trị viên đăng ký lần đầu vui lòng mở mục «Đăng ký nhân viên», sử dụng **Mã kích hoạt Quản trị viên** được cấp riêng (mã này gửi riêng cho bạn, vui lòng không chia sẻ ra ngoài).
> Học viên khi đăng ký cần nhập **Mã kích hoạt Học viên**; mỗi học viên sử dụng một số điện thoại riêng biệt, không trùng lặp với hệ thống trung tâm YYSD.
> Sau khi đăng ký và đăng nhập, học viên có thể làm bài thi thử và luyện tập các đề thi Cambridge IELTS. Logo và thương hiệu của Ease Education đã được tích hợp đồng bộ trên toàn bộ giao diện.

## Các câu hỏi thường gặp

| Tình huống phát sinh | Cách xử lý |
|---|---|
| Số điện thoại đã được đăng ký | Toàn hệ thống quản lý số điện thoại duy nhất; vui lòng dùng số điện thoại khác hoặc liên hệ ban quản trị YYSD để hỗ trợ |
| Mã kích hoạt đã dùng hết lượt | Bảng điều khiển trung tâm → chọn tổ chức → mục «Mã kích hoạt đăng ký» bấm thêm lượt hoặc tạo mã mới |
| Trang web vẫn hiển thị logo YYSD | Lần đầu truy cập trang có thể xuất hiện màn hình trắng ngắn để chống nhấp nháy giao diện; nếu vẫn thấy thương hiệu YYSD, hãy nhấn tổ hợp phím `Ctrl+Shift+R` (hoặc `Cmd+Shift+R`) để làm mới triệt để bộ nhớ đệm, hoặc mở cửa sổ ẩn danh |
| Quên mật khẩu tại trang chi nhánh | Vui lòng liên hệ Quản trị viên của cơ sở hoặc Super Admin YYSD để hỗ trợ, trang web chi nhánh hiện chưa hỗ trợ đặt lại mật khẩu qua SMS |

## Ghi chú Vận hành Hệ thống (DevOps Notes)

- Bản ghi DNS ký tự đại diện (wildcard) `*.youyisida.com` đã có hiệu lực; cấu hình Nginx đã được cập nhật với `server_name` tương ứng.
- Chứng chỉ HTTPS hiện tại đã bao phủ các tên miền: `youyisida.com`, `www`, `api`, `ease`, `youyisi`. Khi **mở thêm tên miền con (slug) mới**, cần chạy lệnh `certbot --nginx --expand` để bổ sung SAN, hoặc cấu hình chứng chỉ wildcard qua phương thức xác thực DNS-01 (xem chi tiết tại `docs/multi-tenant.md`).
