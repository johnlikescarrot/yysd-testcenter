---
name: yysd-site
description: >
   chế tác hoặc sửa YYSD trang web và hệ thống. Website Games Hub, Ngân hàng đề, Cổng giáo viên, TOEFL iBT cơ khảo thi app,
  Electron mặt bàn đầu, từ sách, phát hành. người sử dụng nhắc tới sửa Trang chủ, làm trang web, bên trên bài thi, sửa bá phóng khí,
   Cổng giáo viên, chỗ ngồi, người thuê, bố trí lúc sử dụng.
---

# YYSD trang web / hệ thống

 trước đọc `AGENTS.md` và `YYSD-DESIGN-RULES.md`. thiết bị này bố trí nhìn `AGENTS.local.md`.

## trước khi động thủ

1. đây là nội dung, xác, hay trường thi? tính cách không nên lẫn vào.
2. đã có trang web / helper / bá phóng khí có thể hay không phục dùng? cấm thứ hai bộ động cơ.
3. rơi xuống đất trang xúc cảm dùng `design-taste-frontend`; xác tầng di chuyển hiệu dụng `apple-design`; sửa xưa cũ đứng dùng `redesign-existing-projects`. trường thi không nên quả táo hóa.

## sửa ở đâu

| chuyện cần làm | đi đâu |
| --- | --- |
| Website Games / Hub | `index.html`, `assets/css/style.css`, `assets/js/` |
| mặt ngoài / Xác nhận khung | `assets/js/ui.js` (`YYSD_SURFACE` / `YYSD_CONFIRM`) |
| phân khu và kỹ năng | `assets/js/config.js` |
| TOEFL iBT cơ khảo thi | `app/` + `app/library/toefl/` |
| trang web ngày cuốn | `library/toefl/` |
| sau đầu / chỗ ngồi / người thuê | `server/server.js` |
| mặt bàn đầu | `desktop/` |
| Ngân hàng đề trang | `tiku/` |

## cứng rắn gác cổng

- Writing sentence: `bank` không được cùng `answer` cùng tự. `scripts/toefl_sent.py`. chips cấm Titlecase.
- về nhà chồng trở lên: `node scripts/check_toefl_paper.js`
- nghe xong tục nói: `conversation` / `announcement` / `lecture` trước để hết âm tần ra lại câu
- Listen and Repeat: một câu một âm tần → 3 giây muốn → beep → 8 giây lục. đáp lại Vừa không biểu hiện `sample`
- không nên `rsync --delete` Website Games
- UI đổi xong tại trình duyệt dặm chút:điểm một lần, không phải chỉ nhìn Screenshots
