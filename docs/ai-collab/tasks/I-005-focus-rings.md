# I-005 — Chuẩn hóa Vòng Tiêu điểm focus-visible Toàn cục cho page-premium

**Trạng thái:** Đã hoàn thành

## Mục tiêu

Hỗ trợ điều hướng bằng bàn phím trên các trang Premium với vòng tiêu điểm hiển thị rõ ràng, sắc nét (nâng cao khả năng tiếp cận a11y và chất lượng hoàn thiện sản phẩm).

## Phạm vi Cho phép Thay đổi

- `assets/css/dashboard-premium.css`

## Điều Nghiêm cấm

- Chỉnh sửa quy tắc `:focus` làm mất đường viền outline khi nhấp chuột (chỉ sử dụng `:focus-visible`)

## Các Thay đổi Kỹ thuật

```css
.page-premium a:focus-visible,
.page-premium button:focus-visible,
.page-premium .minimal-nav a:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-gold) 35%, transparent);
}
```

## Tiêu chí Nghiệm thu

- Trên các trang dashboard / zone / results: Dùng phím Tab duyệt qua các liên kết điều hướng và nút bấm.
- Khi nhấp chuột thông thường: Không làm xuất hiện vòng viền focus (nhờ cơ chế của `:focus-visible`).

## Phương án Rollback

Xóa bỏ khối quy tắc `focus-visible` mới được thêm vào.
