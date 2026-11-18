# Ràng buộc Thiết kế và Đánh giá Giao diện (DESIGN-BRIEF)

> Kimi duy trì phần đánh giá kiểm toán giao diện; Cursor tham khảo các nhiệm vụ trong `tasks/` để triển khai.

## Quy chuẩn Thương hiệu (Ràng buộc Bắt buộc)

- **Bảng màu:** Xanh hải quân `#07192f` · Vàng kim `#c7a45d` · Giấy ngà `#f7f3ea`
- **Nghệ thuật chữ (Typography):** Playfair Display (dành cho tiêu đề biên tập / hero) · Inter (dành cho giao diện nội dung `.page-premium`)
- **Chi tiết nhận diện:** Hạt sao vàng lấp lánh, hiệu ứng đổ bóng giấy mềm mại `--shadow-paper`, đường viền vàng thanh mảnh `rgba(199,164,93,.34)`
- **Các điều cấm kỵ:** Dải chuyển màu tím gradient ở hero, bộ 3 biểu tượng SaaS rập khuôn, viết cứng tên tổ chức đối tác vào CSS

## Hệ thống Đặt tên Class Component

| Tiền tố | Mục đích sử dụng |
|---|---|
| `minimal-*` | Khung giao diện toàn trang: topbar, nav, page-head, footer |
| `page-premium` | Lớp kích hoạt ở thẻ body, nạp giao diện từ tệp `dashboard-premium.css` |
| `dash-*` | Thẻ lịch biểu, danh mục bài học, thẻ thông tin giáo viên |
| `auth-*` | Bố cục màn hình đăng nhập và đăng ký tài khoản |
| `results-*` | Thẻ điểm số tổng quan hero / Trạng thái kết quả trống |

---

## Báo cáo Kiểm toán Giao diện (Audit 22/07/2026)

### `index.html`

- **A. Giữ lại:** Phong cách biên tập hero, họa tiết trang trí SVG, hai khối cổng truy cập chính.
- **B. Vấn đề:** Phong cách có sự nhảy vọt so với luồng thao tác Premium sau khi đăng nhập; hiệu ứng hoạt họa hero cần hỗ trợ tốt hơn cho người dùng bật chế độ giảm chuyển động `prefers-reduced-motion`.
- **C. Hướng xử lý:** Duy trì phong cách biên tập của Trang chủ, không thêm lớp `page-premium` vào trang này.
- **D. Khung Premium:** Không áp dụng (chủ ý thiết kế theo dạng trang giới thiệu sản phẩm).

### `dashboard.html`

- **A. Giữ lại:** Tiêu đề phụ `dash-premium-eyebrow`, khối lịch học hero, hiệu ứng trọng tâm.
- **B. Vấn đề:** Thị giác chưa hoàn toàn đồng bộ khi quay lại từ trang kết quả thi (đã giảm thiểu thông qua nhiệm vụ I-001).
- **C. Hướng xử lý:** Duy trì ổn định; sử dụng làm trang mẫu chuẩn cho hệ giao diện Premium.
- **D. Khung Premium:** Áp dụng (tiêu chuẩn tham chiếu chính).

### `zone.html` (study / practice / mock)

- **A. Giữ lại:** Các thẻ danh mục bài học, ô tìm kiếm catalog-search, màu sắc nhận diện riêng cho từng phân khu.
- **B. Vấn đề:** Cách đặt tên class tiêu đề phụ chưa đồng nhất giữa page-head và dashboard (`minimal-eyebrow` vs `dash-premium-eyebrow`).
- **C. Hướng xử lý:** Giai đoạn P2 sẽ chuẩn hóa class eyebrow; tạm thời không can thiệp vào logic JavaScript.
- **D. Khung Premium:** Áp dụng.

### `login.html` / `register.html`

- **A. Giữ lại:** Cột bên auth-aside màu xanh hải quân gradient, bố cục hai cột cân đối.
- **B. Vấn đề:** Đổ bóng thẻ `auth-card` còn mang phong cách cũ; ô nhập liệu khi focus chưa có vòng sáng nổi bật; chưa tích hợp phông Inter.
- **C. Hướng xử lý:** Nhiệm vụ I-002 — Tinh chỉnh đường viền `.auth-card` trong `style.css` + bổ sung vòng sáng `:focus-visible` cho ô nhập liệu.
- **D. Khung Premium:** Không áp dụng trực tiếp (cột bên đã được đồng bộ nhận diện thương hiệu đầy đủ).

### `exam.html`

- **A. Giữ lại:** Trải nghiệm phòng thi đắm chìm `exam-shell`, hạn chế tối đa các yếu tố gây xao nhãng.
- **B. Vấn đề:** Một số biến trong `exam-shell` chưa được ánh xạ hoàn toàn với hệ thống `--brand-*`.
- **C. Hướng xử lý:** Giai đoạn P2 sẽ chuẩn hóa ánh xạ token trong `exam-shell.css`.
- **D. Khung Premium:** Không áp dụng (phòng thi duy trì chuẩn mực thi chính thức).

### `teacher.html` / `teacher-calendar.html`

- **A. Giữ lại:** Thanh điều hướng trên cùng phong cách Premium đồng bộ với trang dashboard.
- **B. Vấn đề:** Thanh tìm kiếm học viên bị vỡ bố cục trên màn hình kích thước hẹp.
- **C. Hướng xử lý:** Giai đoạn P2 sẽ tinh chỉnh thuộc tính `flex-wrap` để tự động xuống dòng linh hoạt.
- **D. Khung Premium:** Áp dụng.

### `results.html`

- **A. Giữ lại:** Khối thống kê kết quả hero, dòng thời gian bài làm.
- **B. Vấn đề:** Chưa nạp giao diện `page-premium`; trạng thái kết quả trống còn đơn điệu.
- **C. Hướng xử lý:** Nhiệm vụ I-001 nạp khung Premium · Nhiệm vụ I-004 nâng cấp thẻ trạng thái trống dạng giấy.
- **D. Khung Premium:** **Bắt buộc áp dụng** (đã hoàn thành trong I-001).

---

## Danh mục Nhiệm vụ Triển khai (Đợt 1)

| Mã nhiệm vụ | Mục tiêu thực hiện | Quy mô | Tài liệu đặc tả |
|---|---|---|---|
| I-001 | Tích hợp khung Premium cho trang `results.html` | Nhỏ | [tasks/I-001-results-premium.md](tasks/I-001-results-premium.md) |
| I-002 | Chuẩn hóa vòng focus và thẻ đăng nhập/đăng ký | Nhỏ | [tasks/I-002-auth-polish.md](tasks/I-002-auth-polish.md) |
| I-003 | Hiệu ứng kính mờ cho thanh tab di động | Nhỏ | [tasks/I-003-mobile-tabs.md](tasks/I-003-mobile-tabs.md) |
| I-004 | Nâng cấp thẻ trạng thái trống trên trang kết quả | Nhỏ | [tasks/I-004-results-empty.md](tasks/I-004-results-empty.md) |
| I-005 | Chuẩn hóa vòng tiêu điểm focus-visible toàn trang | Nhỏ | [tasks/I-005-focus-rings.md](tasks/I-005-focus-rings.md) |

---

## Các Nhiệm vụ Đã Hoàn thành (Cursor 22/07/2026)

- **I-001:** Bổ sung liên kết phông chữ Inter của Google Fonts, nạp tệp `dashboard-premium.css` và thêm lớp `body.page-premium` vào `results.html`.
- **I-002:** Tinh chỉnh đường viền và đổ bóng cho `.auth-card` trong `style.css`; bổ sung vòng sáng vàng `:focus-visible` cho các ô nhập liệu.
- **I-003:** Bổ sung hiệu ứng `backdrop-filter` và màu nền trạng thái active cho `.mobile-tabs` trong `style.css`.
- **I-004:** Định dạng kiểu dáng thẻ giấy cao cấp cho `.page-premium.results-empty` trong `dashboard-premium.css`.
- **I-005:** Mở rộng vòng tiêu điểm `:focus-visible` áp dụng đồng bộ cho các nút bấm, liên kết điều hướng trong `dashboard-premium.css`.

Trong vòng trao đổi tiếp theo, Kimi vui lòng đọc `WORKLOG.md` và phần này để giao tiếp các nhiệm vụ từ I-006 trở đi (khuyến nghị: chuyển đổi giao diện Premium cho profile/vocab, thống nhất class eyebrow cho zone).
