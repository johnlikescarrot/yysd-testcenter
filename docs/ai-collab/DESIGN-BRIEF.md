# xếp đặt thiết kế ước thúc và thẩm kế (DESIGN-BRIEF)

> Kimi bảo vệ thẩm kế chương tiết; Cursor tham khảo tasks/ thực hiện

## nhãn hiệu quy phạm (không thể phá)

- **Palette: ** navy `#07192f` · gold `#c7a45d` · ivory `#f7f3ea`
- **Typography: ** Playfair (hero/ tiêu đề) · Inter (`.page-premium` chính văn UI)
- **Motif: ** màu vàng star crumb, giấy cảm giác `--shadow-paper`, mảnh viền vàng `rgba(199,164,93,.34)`
- ** cấm: ** tím thay đổi dần hero, ba nhóm icon SaaS khuôn mô hình, CSS ghi chết máy cấu tên

## lắp ráp(bộ phận) class hệ thống

| tiền tố | công dụng |
|------|------|
| `minimal-*` | toàn bộ đứng shell: topbar, nav, page-head, footer |
| `page-premium` | body cấp chốt mở, bắt đầu dùng dashboard-premium.css |
| `dash-*` | lịch ngày, mục lục, teacher tạp phiến |
| `auth-*` | Đăng nhập Đăng ký bố cục |
| `results-*` | Điểm số hero / chỗ trống Trạng thái |

---

## Audit 2026-07-22

### index.html

**A. giữ lại: ** editorial hero, SVG motif, song nhóm home-dual cửa vào
**B. vấn đề: ** và logged-in premium đường nhỏ phong cách nhảy lên; hero anime đối với `prefers-reduced-motion` đã bộ phận xử lý
**C. sửa pháp: ** bảo trì Trang chủ editorial, không ở chỗ này trang thêm page-premium
**D. premium xác: ** hay không (intentional doanh tiêu trang)

### dashboard.html

**A. giữ lại: ** dash-premium-eyebrow, lịch ngày hero, focus đầu anime
**B. vấn đề: ** và results Quay lại sau thị giác không nhất trí (Đã dùng I-001 giảm bớt)
**C. sửa pháp: ** duy trì; với tư cách premium tham khảo trang
**D. premium xác: ** là (tham khảo tiêu chuẩn)

### zone.html (study / practice / mock)

**A. giữ lại: ** mục lục tạp phiến, catalog-search, zone accent
**B. vấn đề: ** page-head và dashboard eyebrow mệnh danh không thống nhất (`minimal-eyebrow` vs `dash-premium-eyebrow`)
**C. sửa pháp: ** P2 thống nhất eyebrow class; tạm không hủy đi JS
**D. premium xác: ** là

### login.html / register.html

**A. giữ lại: ** auth-aside navy thay đổi dần bên cạnh lan, song lan bố cục
**B. vấn đề: ** auth-card bóng râm thiên xưa cũ; input focus Không ring; Không Inter
**C. sửa pháp: ** I-002 — style.css `.auth-card` border + input `:focus-visible`
**D. premium xác: ** hay không (bên cạnh lan đã đầy đủ nhãn hiệu hóa)

### exam.html

**A. giữ lại: ** đắm chìm exam-shell, nhỏ nhất quấy nhiễu
**B. vấn đề: ** `--brand-*` và exam-shell bộ phận lượng biến đổi chưa xong hoàn toàn đúng đủ
**C. sửa pháp: ** P2 exam-shell.css token chiếu rọi
**D. premium xác: ** hay không

### teacher.html / teacher-calendar.html

**A. giữ lại: ** và dashboard nhất trí premium topbar
**B. vấn đề: ** teacher-search tại chật vật bình đổi đi
**C. sửa pháp: ** P2 flex-wrap điều khiển tinh vi
**D. premium xác: ** là

### results.html

**A. giữ lại: ** results-hero công tác thống kê, timeline band
**B. vấn đề: ** thiếu page-premium; chỗ trống Trạng thái yếu; mobile hero đã stack nhưng empty nhưng plain
**C. sửa pháp: ** I-001 premium xác · I-004 chỗ trống Trạng thái tạp phiến
**D. premium xác: ** ** ứng với là là ** (I-001 đã áp dụng)

---

## Implementation Tasks (đám đầu tiên)

| ID | mục tiêu | quy mô | quy cách văn bản tài liệu |
|----|------|------|----------|
| I-001 | results.html premium xác | tiểu | [tasks/I-001-results-premium.md](tasks/I-001-results-premium.md) |
| I-002 | auth danh sách focus + card | tiểu | [tasks/I-002-auth-polish.md](tasks/I-002-auth-polish.md) |
| I-003 | mobile-tabs thuỷ tinh mờ | tiểu | [tasks/I-003-mobile-tabs.md](tasks/I-003-mobile-tabs.md) |
| I-004 | results chỗ trống Trạng thái | tiểu | [tasks/I-004-results-empty.md](tasks/I-004-results-empty.md) |
| I-005 | page-premium focus-visible | tiểu | [tasks/I-005-focus-rings.md](tasks/I-005-focus-rings.md) |

---

## Đã hoàn thành thực hiện (Cursor 2026-07-22)

- **I-001: ** `results.html` gia tăng Inter, `dashboard-premium.css`, `body.page-premium`
- **I-002: ** `style.css` auth-card khung / bóng râm; auth input `:focus-visible` ring
- **I-003: ** `style.css` `.mobile-tabs` backdrop + active bối cảnh
- **I-004: ** `dashboard-premium.css` `.page-premium.results-empty` tạp phiến kiểu dáng
- **I-005: ** `dashboard-premium.css` mở rộng `:focus-visible` đến btn / nav / minimal-nav

Kimi vòng tiếp theo mời đọc WORKLOG + bản tiết, phái I-006+ (đề nghị: profile/vocab premium di chuyển, zone eyebrow thống nhất).
