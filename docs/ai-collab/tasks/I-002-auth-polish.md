# I-002 — Chuẩn hóa Vòng Focus Ô nhập liệu và Kiểu dáng auth-card

**Trạng thái:** Đã hoàn thành

## Mục tiêu

Đồng bộ trạng thái focus của các ô nhập liệu trên trang đăng nhập/đăng ký với phong cách danh mục Premium; làm nổi bật độ sắc nét của đường viền thẻ `auth-card`.

## Phạm vi Cho phép Thay đổi

- `assets/css/style.css`: Quy tắc CSS cho `.auth-card` và `.auth-field input:focus-visible`

## Điều Nghiêm cấm

- Thay đổi cấu trúc HTML của `login.html` / `register.html`
- Chỉnh sửa mã logic trong `auth.js`

## Các Thay đổi Kỹ thuật

```css
.auth-card {
  border: 1px solid var(--border);
  box-shadow: var(--shadow-paper);
}

.auth-field input:focus-visible {
  border-color: var(--brand-gold);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-gold) 25%, transparent);
  outline: none;
}
```

## Tiêu chí Nghiệm thu

- Kiểm tra tại: `/login.html` và `/register.html`.
- Khi dùng phím Tab di chuyển vào ô nhập liệu: Xuất hiện vòng viền màu vàng kim rõ ràng.
- Hiển thị chuẩn xác trên cả màn hình 1280px và 375px.

## Phương án Rollback

Xóa bỏ các quy tắc CSS mới được bổ sung.
