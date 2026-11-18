# nhiềungười thuêthoả thuận sau khi thảo luận(Giai đoạn 0)

## trường con toántênquy tắc

- hình thức:`{slug}.youyisida.com`(chữ thườngTiếng Anhchữ cái của bảng chữ cái,chữ số,dấu gạch nối;2–32 ký tự tin học)
- đồng ý ngầmngười thuê slug:`yysd`(YYSD)
- rễ lĩnh vực `youyisida.com` / `www.youyisida.com` / địa phương `localhost` giống nhauchiếu vàođến `yysd`
- **giữchữ(không thểhình thức kết hợp công nhânngười thuê slug)**:`www` `api` `admin` `platform` `mail` `static` `cdn` `test` `dev` `staging`

## DNS / HTTPS(di chuyển viết tắt của Duy Ngô Nhĩ)

1. Ali tênvăn cổ nói DNS:`*.youyisida.com` CNAME có thể A đếntrang webmáy chủ máy tính(chủ trạmgiống hệt).
2. ký tự đại diện tin họcchứng chỉ(yêu cầu DNS kiểm tra và xác minh):
   ```bash
   certbot certonly --dns-<provider> -d youyisida.com -d '*.youyisida.com'
   ```
3. Nginx:sử dụngkho hàngbên trong `server/deploy/nginx-site.conf`(đã ngậm trong miệng `*.youyisida.com`).
4. đưa vào hồ sơ:trường con toántên đi qua kết hợpgiốnghọ chủ lĩnh vực;dường nhưđưa vào hồ sơhệ thốngYêu cầuhình thức kết hợp theo đuổi dảitruy cập mạng,nhấnAli tênvăn cổ nóibàn điều khiểnGợi ýxử lý.

## đồng ý ngầmngười thuêvượt quá biến thể của

| họ | thoả thuận sau khi thảo luận |
|----|------|
| đồng ý ngầmcông ty | tên của một sự vật«YYSD»,slug `yysd`;hiện cóngười dùng/Giáo viên/Kết quảTất cảchuyển đến chỗ ở mới |
| nền tảngvượt quá biến thể của | Môi trườngbiến số toán `ADMIN_PHONES`(xuất hiện lướinhất quán);tiền tố có thể tiến lên `platform.html` chủ kiểm soát Đài Loan viết tắt |
| công tyngười quản lý | chủ kiểm soát Đài Loan viết tắt làm với tư cách nêncông tyđiền vào biểu mẫu `admin_phone`(Giáo viênTài khoản);biến thể của hình thức kết hợp gốccông tygiáo viên và học sinhphân phối |

## trường sốQuyền hạndanh sách mục

### bề mặt bên ngoài `orgs`

| trường số | ý nghĩa hàm chứa trong một cụm từ |
|------|------|
| id | chủ phím trên đàn piano hoặc bàn phím máy tính |
| slug | trường con toántên ngắn trọng lượng |
| name | công tyhiển thịtên |
| logo_url | Logo(tiền tố có thể trống không,sử dụngđồng ý ngầm) |
| status | `trial` / `active` / `suspended` |
| expires_at | ngày đến hạn ISO(tiền tố có thể trống không=khôngđặt giới hạn thời gian) |
| admin_phone | công tyngười quản lýđiện thoại di độnggầm |
| contract_note | kinh doanh hợp đồngGhi chú(có sẵn) |
| created_at | thành lậpThời gian |

### người dùngtách biệt

- `users.org_id` / `teachers.org_id`:mỗi ngườichỉ phân loạicả gia đìnhcông ty;điện thoại di độnggầmtình hình tổng thểchỉ.
- Kết quả,lịch,giáo viên và học sinhquan hệ:họngười dùng/Giáo viêngián tiếpthuộc vềcông ty;danh sáchgiao diệnnhấn `org_id` lọc.
- ngân hàng câu hỏi cho người ra đề hoặc học sinh chuẩn bị thi `library/`:họnền tảngdùng chung(đầu tiênmột đăng ký).

### họ chăm sóc

| vai trò | phạm vi |
|------|------|
| nền tảngvượt quá biến thể của | chủ kiểm soát Đài Loan viết tắt biến thể củatất cảcông ty;dịch vụ khách hàngđi vàomột vàicông tybiến thể cũ củakhi thời gian đến gầncó thể thấy rõ rằng điều này đúngnêncông ty |
| công tyngười quản lý | hầu như hình thức kết hợp gốccông tyGiáo viên/Học viên/phân phối |
| Giáo viên | hầu như chănphân phốihình thức kết hợp gốccông tyHọc viên(người quản lýcó thể thấy rõ rằng điều này đúnghình thức kết hợp gốccông tyTất cả) |
| Học viên | hầu nhưbản thânKết quảNhiệm vụ |

## kiểm tra và chấp nhận(Giai đoạn 0)

- [x] DNS `*.youyisida.com` đãGiải thích(2026-07-22 kiểm tra và xác minh random slug → 139.224.0.221)
- [ ] HTTPS ký tự đại diện tin họcchứng chỉcó hiệu lực(thời điểm hiện tạilàm với tư cách SAN danh sách;ease/youyisi đãche phủ)
- [x] mở `https://ease.youyisida.com/` họ đi ra đầu mặt(tên thương hiệucải tạoĐã hoàn thành)
