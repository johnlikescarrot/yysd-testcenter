# nhiều người thuê ước định (Giai đoạn 0)

## tử vực tên quy tắc

- cách thức: `{slug}.youyisida.com` (viết chữ đơn chữ Anh mẫu, con số, liền ký tự; 2–32 ký tự)
- cam chịu người thuê slug: `yysd` (YYSD)
- cây vực `youyisida.com` / `www.youyisida.com` / bản địa `localhost` hết thảy chiếu rọi đến `yysd`
- ** giữ lại chữ (không thể làm người thuê slug) **: `www` `api` `admin` `platform` `mail` `static` `cdn` `test` `dev` `staging`

## DNS / HTTPS (vận duy)

1. a lý vân DNS: `*.youyisida.com` CNAME hoặc A đến trang web Server (và chủ đứng giống nhau).
2. thông xứng phù giấy chứng nhận (cần DNS nghiệm chứng):
   ```bash
   certbot certonly --dns-<provider> -d youyisida.com -d '*.youyisida.com'
   ```
3. Nginx: sử dụng trong kho hàng `server/deploy/nginx-site.conf` (đã hàm `*.youyisida.com`).
4. lập hồ sơ: tử vực tên thông xứng bình thường theo chủ vực; như lập hồ sơ hệ thống yêu cầu trục đầu tiếp nhập, theo như a lý vân đài điều khiển nhắc nhở xử lý.

## cam chịu người thuê và vượt qua quản

| hạng | ước định |
|----|------|
| cam chịu công ty | tên « YYSD », slug `yysd`; hiện hữu người sử dụng / Giáo viên / Điểm số Tất cả dời vào |
| bình đài vượt qua quản | Môi trường lượng biến đổi `ADMIN_PHONES` (và hiện mạng lưới nhất trí); có thể tiến `platform.html` bàn điều khiển |
| công ty Quản trị viên | bàn điều khiển là cai công ty điền `admin_phone` (Giáo viên tài khoản); quản bổn công ty thầy trò phân phối |

## chữ đoạn và quyền hạn danh sách

### bề ngoài `orgs`

| chữ đoạn | Nghĩa |
|------|------|
| id | chủ khóa |
| slug | tử vực tên ngắn con ngựa |
| name | công ty biểu hiện tên |
| logo_url | Logo (có thể chỗ trống, dùng cam chịu) |
| status | `trial` / `active` / `suspended` |
| expires_at | đến kỳ ngày ISO (có thể chỗ trống = không ngày quy định) |
| admin_phone | công ty Quản trị viên Số điện thoại |
| contract_note | hợp đồng ghi chú (có thể chọn) |
| created_at | sáng tạo thời gian |

### người sử dụng cách ly

- `users.org_id` / `teachers.org_id`: mỗi người chỉ thuộc một công ty; Số điện thoại toàn cục duy nhất.
- Điểm số, lịch ngày, thầy trò quan hệ: trải qua người sử dụng / Giáo viên gián tiếp thuộc sở hữu công ty; liệt biểu List tiếp lời theo như `org_id` loại bỏ.
- Ngân hàng đề `library/`: toàn bộ bình đài xài chung (đệ nhất bản).

### ai có thể xem ai

| nhân vật | phạm vi |
|------|------|
| bình đài vượt qua quản | bàn điều khiển quản tất cả công ty; phục vụ khách hàng Vào học một công ty lúc tạm thời có thể thấy được cai công ty |
| công ty Quản trị viên | chỉ bổn công ty Giáo viên / Học viên / phân phối |
| Giáo viên | chỉ bị phân phối bổn công ty Học viên (Quản trị viên có thể thấy được bổn công ty Tất cả) |
| Học viên | chỉ thành tích của mình và nhiệm vụ |

## nghiệm thu (Giai đoạn 0)

- [x] DNS `*.youyisida.com` đã giải tích (2026-07-22 nghiệm chứng random slug → 139.224.0.221)
- [] HTTPS thông xứng phù giấy chứng nhận có hiệu lực (trước mắt là SAN liệt biểu List; ease/youyisi đã bao trùm)
- [x] mở ra `https://ease.youyisida.com/` có thể ra trang web (nhãn hiệu cải tạo Đã hoàn thành)
