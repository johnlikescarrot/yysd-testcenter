# Quy ước Kiến trúc Đa người thuê (Multi-tenant Specifications - Giai đoạn 0)

## Quy tắc đặt tên miền con (Subdomain)

- Định dạng: `{slug}.youyisida.com` (chữ cái tiếng Anh viết thường, chữ số, dấu gạch nối; độ dài từ 2 đến 32 ký tự).
- Slug tổ chức mặc định: `yysd` (YYSD).
- Tên miền gốc `youyisida.com` / `www.youyisida.com` / môi trường cục bộ `localhost` đều được ánh xạ về tổ chức mặc định `yysd`.
- **Từ khóa bảo lưu (không được dùng làm slug tổ chức):** `www` `api` `admin` `platform` `mail` `static` `cdn` `test` `dev` `staging`.

## Cấu hình DNS & Chứng chỉ HTTPS (DevOps)

1. DNS Alibaba Cloud: Cấu hình bản ghi CNAME hoặc A cho `*.youyisida.com` trỏ về máy chủ ứng dụng web (cùng IP với trang web chính).
2. Chứng chỉ SSL Wildcard (xác thực qua bản ghi DNS):
   ```bash
   certbot certonly --dns-<provider> -d youyisida.com -d '*.youyisida.com'
   ```
3. Cấu hình Nginx: Sử dụng tệp `server/deploy/nginx-site.conf` trong kho lưu trữ (đã bao gồm cấu hình `*.youyisida.com`).
4. Khai báo ICP: Tên miền con ký tự đại diện áp dụng theo tên miền chính; nếu cơ quan quản lý yêu cầu khai báo chi tiết từng tên miền con, xử lý theo hướng dẫn trên bảng điều khiển đám mây.

## Tổ chức mặc định và Phân quyền Quản trị

| Hạng mục | Quy ước |
|---|---|
| Tổ chức mặc định | Tên: «YYSD», slug: `yysd`; toàn bộ người dùng, giáo viên và điểm thi hiện có đều thuộc tổ chức này |
| Super Admin nền tảng | Xác thực qua biến môi trường `ADMIN_PHONES`; có quyền truy cập bảng điều khiển trung tâm `platform.html` |
| Quản trị viên chi nhánh | Được chỉ định qua trường `admin_phone` trong bảng điều khiển (tài khoản giáo viên); quản lý phân bổ học viên và giáo viên trong chi nhánh |

## Danh mục bảng dữ liệu và Trường thông tin

### Bảng `orgs` (Quản lý tổ chức)

| Trường dữ liệu | Ý nghĩa |
|---|---|
| `id` | Khóa chính (Primary Key) |
| `slug` | Mã định danh tên miền con |
| `name` | Tên hiển thị của tổ chức |
| `logo_url` | Đường dẫn Logo (có thể để trống, sử dụng logo mặc định) |
| `status` | Trạng thái hoạt động: `trial` / `active` / `suspended` |
| `expires_at` | Ngày hết hạn theo chuẩn ISO (để trống nghĩa là không giới hạn thời gian) |
| `admin_phone` | Số điện thoại của Quản trị viên tổ chức |
| `contract_note` | Ghi chú hợp đồng (tùy chọn) |
| `created_at` | Thời điểm tạo bản ghi |

### Cơ chế cô lập người dùng

- `users.org_id` / `teachers.org_id`: Mỗi người dùng chỉ thuộc về một tổ chức duy nhất; số điện thoại mang tính duy nhất trên toàn hệ thống.
- Điểm số bài thi, lịch biểu, quan hệ học viên - giáo viên: Liên kết gián tiếp với tổ chức thông qua tài khoản người dùng; các API danh sách đều lọc dữ liệu nghiêm ngặt theo `org_id`.
- Kho ngân hàng đề thi `library/`: Dùng chung trên toàn bộ nền tảng (phiên bản ban đầu).

### Ma trận phạm vi truy cập dữ liệu

| Vai trò người dùng | Phạm vi dữ liệu được phép xem |
|---|---|
| Super Admin nền tảng | Bảng điều khiển quản lý toàn bộ các tổ chức; khi dùng chế độ hỗ trợ khách hàng để vào một tổ chức cụ thể thì xem được dữ liệu của tổ chức đó |
| Quản trị viên chi nhánh | Chỉ xem được danh sách Giáo viên, Học viên và phân bổ học viên trong nội bộ tổ chức của mình |
| Giáo viên | Chỉ xem được danh sách học viên được phân công phụ trách trong tổ chức (Quản trị viên chi nhánh xem được toàn bộ giáo viên và học viên) |
| Học viên | Chỉ xem được kết quả học tập và bài tập của chính mình |

## Tiêu chí nghiệm thu (Giai đoạn 0)

- [x] Phân giải DNS `*.youyisida.com` thành công (đã xác minh ngày 22/07/2026 với slug ngẫu nhiên trỏ về IP 139.224.0.221).
- [ ] Chứng chỉ SSL Wildcard có hiệu lực đầy đủ (hiện đang dùng danh sách SAN; đã bao phủ các tên miền ease/youyisi).
- [x] Truy cập `https://ease.youyisida.com/` hiển thị giao diện chuẩn xác (đã hoàn thành tùy chỉnh nhận diện thương hiệu).
