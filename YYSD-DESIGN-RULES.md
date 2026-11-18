# Quy tắc Thiết kế Giao diện YYSD (`YYSD-DESIGN-RULES.md`)

## 1. Bảng màu & Chất liệu (Ivory Paper + Glass Chrome)

- **Nền trang (`--bg`):** `#f6f3ec` (Giấy ngà ấm dịu mắt khi đọc học thuật dài).
- **Bề mặt thẻ (`--paper` / `--surface`):** `#fffcf7` / `#ffffff` với viền mảnh `rgba(22, 36, 71, 0.10)`.
- **Màu chủ đạo (`--brand` / `--ink`):** `#162447` (Xanh hải quân học thuật — tỷ lệ tương phản AAA > 12:1 trên nền giấy ngà).
- **Màu nhấn thành công / chuỗi học:** `#15803d` (Xanh ngọc lục bảo đậm, đạt chuẩn tương phản WCAG AA ≥ 4.5:1) và `#b45309` (Hổ phách ấm cho huy hiệu & chuỗi ngày học).
- **Chữ phụ (`--ink-muted`):** `#475569` (luôn đảm bảo tương phản ≥ 4.5:1 trên mọi nền sáng để đạt 100 điểm Accessibility của Lighthouse).

## 2. Nghệ thuật chữ Tiếng Việt & Tiếng Anh

- Ưu tiên hệ phông chữ hiển thị sắc nét toàn bộ dấu thanh và dấu mũ tiếng Việt (`system-ui`, `-apple-system`, `'Segoe UI'`, `'Noto Sans'`, `Roboto`, `sans-serif`) kết hợp phông serif học thuật cho tiêu đề biên tập.
- Không tải phông chữ chặn hiển thị (render-blocking) từ bên thứ ba nhằm đảm bảo FCP/LCP tức thì và điểm Performance 100/100.
- Chiều cao dòng (`line-height`) từ `1.55` đến `1.7` để dấu kép tiếng Việt (`ấ`, `ể`, `ở`, `ữ`, `ệ`) luôn thoáng đãng, dễ đọc.

## 3. Khả năng tiếp cận & Trải nghiệm tương tác

- Mọi trang đều khai báo `<html lang="vi">`, `<meta name="description">`, `<main id="main">` và liên kết bỏ qua điều hướng khi cần.
- Mọi nút bấm, thẻ tương tác và ô nhập liệu đều có nhãn rõ ràng, vùng chạm tối thiểu `44×44px`, vòng tiêu điểm bàn phím `:focus-visible` sắc nét và hỗ trợ `prefers-reduced-motion: reduce`.
