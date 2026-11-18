# thiết kế hạn chế biến thể của | kiểm toán(DESIGN-BRIEF)

> Kimi bảo vệ kiểm toán chương; Cursor tham khảo tasks/ đạt được

## tên thương hiệu chuẩn mực(không thể hỏng)

- **Palette: ** navy `#07192f` · gold `#c7a45d` · ivory `#f7f3ea`
- **Typography: ** Playfair(hero/tiêu đề)· Inter(`.page-premium` văn bản chính UI)
- **Motif: ** màu vàng kim star crumb, biến thể của | cảm thấy `--shadow-paper`, mỏng hoặc thon Phnom Penh `rgba(199,164,93,.34)`
- **cấm: ** màu tím thay đổi dần dần hero, ba sắp xếp icon SaaS mẫu, CSS mã cứng cơ chế tên

## mô-đun class hệ thống

| tiền tố | công dụng |
|------|------|
| `minimal-*` | tất cả trạm shell: topbar, nav, page-head, footer |
| `page-premium` | body cấp công tắc điện, bắt đầu sử dụng dashboard-premium.css |
| `dash-*` | Lịch, mục lục, teacher thẻ |
| `auth-*` | đăng ký đăng ký sắp xếp |
| `results-*` | Kết quả hero / trống không tình trạng |

---

## Audit 2026-07-22

### index.html

**A. giữ: ** editorial hero, SVG motif, hai sắp xếp home-dual lối vào  
**B. câu hỏi: ** và logged-in premium con đường phong cách nhảy; hero hoạt hình đúng `prefers-reduced-motion` đã phần xử lý  
**C. thay đổi biến thể của: ** giữ trang chủ editorial, không có mặt này đầu Canada page-premium  
**D. premium biến thể của |: ** phủ định( intentional tiếp thị đầu)

### dashboard.html

**A. giữ: ** dash-premium-eyebrow, Lịch hero, focus dải hoạt hình  
**B. câu hỏi: ** và results trở về hoàng hậu thị giác thay đổi tinh tế(đã sử dụng I-001 mang lại sự nhẹ nhõm)  
**C. thay đổi biến thể của: ** giữ; hành vi premium tham khảo đầu  
**D. premium biến thể của |: ** là(tham khảo tiêu chuẩn)

### zone.html(study / practice / mock)

**A. giữ: ** mục lục thẻ, catalog-search, zone accent  
**B. câu hỏi: ** page-head và dashboard  eyebrow đặt tên không 7-Eleven(`minimal-eyebrow` vs `dash-premium-eyebrow`)  
**C. thay đổi biến thể của: ** P2 7-Eleven eyebrow class; tạm thời không xé mở JS  
**D. premium biến thể của |: ** là

### login.html / register.html

**A. giữ: ** auth-aside  navy thay đổi dần dần một bên hàng rào, hai hàng rào sắp xếp  
**B. câu hỏi: ** auth-card bóng nghiêng cũ; input focus không có ring; không có Inter  
**C. thay đổi biến thể của: ** I-002 - style.css `.auth-card` border + input `:focus-visible`  
**D. premium biến thể của |: ** phủ định(một bên hàng rào đã đủ tên thương hiệu biến thể của)

### exam.html

**A. giữ: ** ngâm exam-shell, biến thể của nhỏ làm phiền  
**B. câu hỏi: ** `--brand-*` và exam-shell một phần biến số chưa hoàn chỉnh căn chỉnh  
**C. thay đổi biến thể của: ** P2 exam-shell.css token chiếu vào  
**D. premium biến thể của |: ** phủ định

### teacher.html / teacher-calendar.html

**A. giữ: ** và dashboard nhất quán của premium topbar  
**B. câu hỏi: ** teacher-search tồn tại hẹp xem | ngắt dòng  
**C. thay đổi biến thể của: ** P2 flex-wrap điều chỉnh tinh vi  
**D. premium biến thể của |: ** là

### results.html

**A. giữ: ** results-hero thống kê, timeline band  
**B. câu hỏi: ** sự thiếu page-premium; trống không tình trạng yếu; mobile hero đã stack nhưng empty vẫn plain  
**C. thay đổi biến thể của: ** I-001 premium biến thể của | · I-004 trống không tình trạng thẻ  
**D. premium biến thể của |: ** **Ưng làm là**(I-001 đã thực hiện)

---

## Implementation Tasks(lô đầu tiên)

| ID | mục tiêu | quy mô | tiêu chuẩn tài liệu |
|----|------|------|----------|
| I-001 | results.html premium biến thể của | | nhỏ | [tasks/I-001-results-premium.md](tasks/I-001-results-premium.md) |
| I-002 | auth biểu mẫu focus + card | nhỏ | [tasks/I-002-auth-polish.md](tasks/I-002-auth-polish.md) |
| I-003 | mobile-tabs kính mờ | nhỏ | [tasks/I-003-mobile-tabs.md](tasks/I-003-mobile-tabs.md) |
| I-004 | results trống không tình trạng | nhỏ | [tasks/I-004-results-empty.md](tasks/I-004-results-empty.md) |
| I-005 | page-premium focus-visible | nhỏ | [tasks/I-005-focus-rings.md](tasks/I-005-focus-rings.md) |

---

## đã hoàn thành đạt được(Cursor 2026-07-22)

- **I-001: ** `results.html` Tăng Inter, `dashboard-premium.css`, `body.page-premium`
- **I-002: ** `style.css` auth-card khung/bóng; auth input `:focus-visible` ring
- **I-003: ** `style.css` `.mobile-tabs` backdrop + active bối cảnh
- **I-004: ** `dashboard-premium.css` `.page-premium .results-empty` thẻ loại
- **I-005: ** `dashboard-premium.css` mở rộng `:focus-visible` đến btn / nav / minimal-nav

Kimi xuống vòng hoặc giai đoạn đầu tiên mời dấu phẩy WORKLOG + gốc xem |, dùng trong I-006+(Gợi ý: profile/vocab premium di cư, zone eyebrow 7-Eleven) 
