---
name: yysd-site
description: >
  Xây dựng hoặc tinh chỉnh hệ thống và trang web YYSD: Cổng thông tin chính (Official Hub), Ngân hàng đề thi, Cổng giáo viên, Ứng dụng thi thử máy tính TOEFL iBT,
  Ứng dụng máy tính để bàn (Desktop App), Tủ từ vựng, Quy trình phát hành. Sử dụng khi người dùng nhắc đến việc sửa Trang chủ, xây dựng trang web, đưa bài thi lên hệ thống, sửa bộ trình phát,
  Cổng giáo viên, quản lý chỗ ngồi, người thuê (tenant), hoặc cấu hình hệ thống.
---

# Hệ thống & Trang web YYSD

Vui lòng đọc trước `AGENTS.md` và `YYSD-DESIGN-RULES.md`. Xem cấu hình thiết bị tại `AGENTS.local.md`.

## Nguyên tắc trước khi bắt đầu

1. Xác định rõ: Đây là nội dung, khung viền hay phòng thi? Tuyệt đối không lẫn lộn định vị phong cách.
2. Kiểm tra xem trang web / helper / bộ trình phát hiện có có thể tái sử dụng không? Cấm tạo ra bộ động cơ thứ hai trùng lặp.
3. Trang thông tin chính dùng quy chuẩn `design-taste-frontend`; hiệu ứng tầng khung viền dùng `apple-design`; nâng cấp trang cũ dùng `redesign-existing-projects`. Phòng thi cần chuẩn mực, không chạy theo phong cách hoa mỹ.

## Vị trí chỉnh sửa mã nguồn

| Yêu cầu công việc | Vị trí tệp tin |
| --- | --- |
| Trang web chính / Hub | `index.html`, `assets/css/style.css`, `assets/js/` |
| Bề mặt giao diện / Hộp thoại xác nhận | `assets/js/ui.js` (`YYSD_SURFACE` / `YYSD_CONFIRM`) |
| Phân khu và kỹ năng | `assets/js/config.js` |
| Phòng thi máy tính TOEFL iBT | `app/` + `app/library/toefl/` |
| Bộ đề thi theo ngày trên web | `library/toefl/` |
| Backend / Quản lý chỗ ngồi / Đa người thuê | `server/server.js` |
| Ứng dụng máy tính để bàn (Desktop App) | `desktop/` |
| Trang ngân hàng đề thi | `tiku/` |

## Tiêu chí kiểm soát chất lượng nghiêm ngặt

- Ghép câu phần Writing: Mảng `bank` không được sắp xếp theo đúng thứ tự câu trả lời `answer`. Dùng `scripts/toefl_sent.py` để xáo trộn. Thẻ từ cấm viết hoa chữ cái đầu (Titlecase) trừ trường hợp đặc biệt.
- Trước khi đưa lên môi trường chính thức: Chạy kiểm tra bằng `node scripts/check_toefl_paper.js`.
- Nghe xong mới nói: Các dạng bài `conversation` / `announcement` / `lecture` phải phát hết âm thanh rồi mới hiển thị câu hỏi.
- Dạng bài Listen and Repeat: Một câu tương ứng một tệp âm thanh → chuẩn bị 3 giây → tiếng bíp → ghi âm 8 giây. Màn hình làm bài không hiển thị câu mẫu `sample`.
- Tuyệt đối không chạy lệnh `rsync --delete` trên trang web chính thức.
- Sau khi chỉnh sửa giao diện, bắt buộc phải nhấp chuột kiểm tra thực tế trên trình duyệt ít nhất một lần, không chỉ dựa vào ảnh chụp màn hình (screenshots).
