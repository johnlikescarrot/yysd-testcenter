# nhiều người thuê thoả thuận(giai đoạn 0)

## trường con tên quy tắc

- hình thức: `{slug}.youyisida.com`(chữ thường tiếng Anh chữ cái, chữ số, dấu gạch nối; 2–32 ký tự)
- đồng ý ngầm người thuê slug: `yysd`(YYSD)
- rễ lĩnh vực `youyisida.com` / `www.youyisida.com` / địa phương `localhost` giống nhau chiếu vào đến `yysd`
- **giữ chữ(không thể công nhân người thuê slug)**: `www` `api` `admin` `platform` `mail` `static` `cdn` `test` `dev` `staging`

## DNS / HTTPS(di chuyển viết tắt của Duy Ngô Nhĩ |)

1. Ali nói DNS: `*.youyisida.com` CNAME hoặc A đến trang web máy chủ(biến thể của | chủ trạm giống hệt) 
2. ký tự đại diện chứng chỉ(yêu cầu DNS kiểm tra và xác minh): 
   ```bash
   certbot certonly --dns-<provider> -d youyisida.com -d '*.youyisida.com'
   ```
3. Nginx: sử dụng kho hàng bên trong `server/deploy/nginx-site.conf`(đã ngậm trong miệng `*.youyisida.com`) 
4. đưa vào hồ sơ: trường con tên đi qua kết hợp giống theo chủ lĩnh vực; dường như đưa vào hồ sơ hệ thống yêu cầu theo đuổi dải truy cập, nhấn Ali nói bàn điều khiển chỉ ra xử lý 

## đồng ý ngầm người thuê biến thể của | vượt quá biến thể của

| sau cổ | thoả thuận |
|----|------|
| đồng ý ngầm công ty | tên«YYSD», slug `yysd`; hiện có người dùng/giáo viên/thành tích toàn bộ chuyển đến |
| nền tảng vượt quá biến thể của | môi trường biến số `ADMIN_PHONES`(biến thể của | xuất hiện lưới nhất quán); có thể tiến lên `platform.html` chủ kiểm soát Đài Loan |
| công ty người quản lý | chủ kiểm soát Đài Loan làm nên công ty điền vào biểu mẫu của `admin_phone`(giáo viên số tài khoản); biến thể của gốc công ty giáo viên và học sinh phân phối |

## ) biến thể của | phạm vi quyền hạn danh sách mục

### bề mặt bên ngoài `orgs`

| ) | ý nghĩa |
|------|------|
| id | chủ phím |
| slug | trường con tên ngắn trọng lượng |
| name | công ty hiển thị tên |
| logo_url | Logo(có thể trống không, sử dụng đồng ý ngầm) |
| status | `trial` / `active` / `suspended` |
| expires_at | ngày đến hạn ISO(có thể trống không=không đặt giới hạn thời gian) |
| admin_phone | công ty người quản lý điện thoại di động gầm |
| contract_note | hợp đồng cột ghi chú(có sẵn) |
| created_at | thành lập thời gian |

### người dùng tách biệt

- `users.org_id` / `teachers.org_id`: mỗi người chỉ phân loại cả gia đình công ty; điện thoại di động gầm tình hình tổng thể chỉ 
- Kết quả, Lịch, giáo viên và học sinh quan hệ: kinh điển người dùng/giáo viên gián tiếp thuộc về công ty; danh sách giao diện nhấn `org_id` lọc 
- Ngân hàng đề `library/`: tất cả nền tảng dùng chung(đầu tiên một đăng ký) 

### ai có thể chăm sóc ai

| vai trò | Phạm vi |
|------|------|
| nền tảng vượt quá biến thể của | chủ kiểm soát Đài Loan biến thể của tất cả công ty; dịch vụ khách hàng đi vào một vài công ty biến thể cũ của | khi thời gian đến gần có thể thấy rõ nên công ty |
| công ty người quản lý | hầu như gốc công ty giáo viên/Học viên/phân phối |
| giáo viên | hầu như chăn phân phối của gốc công ty học sinh(người quản lý có thể thấy rõ gốc công ty toàn bộ) |
| Học viên | hầu như bản thân của thành tích biến thể của | nhiệm vụ |

## kiểm tra và chấp nhận(giai đoạn 0)

- [x] DNS `*.youyisida.com` đã phân tích(2026-07-22 kiểm tra và xác minh random slug → 139.224.0.221)
- [ ] HTTPS ký tự đại diện chứng chỉ có hiệu lực(thời điểm hiện tại làm SAN danh sách; ease/youyisi đã che phủ)
- [x] mở `https://ease.youyisida.com/` có thể đi ra trang(tên thương hiệu cải tạo đã hoàn thành)
