# YYSD Học tập bình đài — hạng mục Bản đồ (CONTEXT)

> Task D-001 · tạo ra: 2026-07-22 · bảo vệ: Kimi Làm mới / Cursor xuất bản lần đầu

## 1. sản phẩm một câu & người sử dụng

** một câu: ** Trung tâm Luyện thi Quốc tế YYSD — IELTS và A-Level phụ lục « Học tập · Luyện tập · Thi thử » vừa đứng thức trạng thái tĩnh Web bình đài, hỗ trợ nhiều cơ cấu bạch nhãn hiệu tử vực.

| người sử dụng | cửa vào | hạch tâm trang web |
|------|------|----------|
| Học viên | `login.html` / `register.html` | `dashboard.html` → `zone.html` → `exam.html` → `results.html` |
| Giáo viên | `teacher-login.html` / `teacher-register.html` | `teacher.html` · `teacher-calendar.html` · `admin-assign.html` |
| bình đài vượt qua quản | tổng bộ `platform.html` | cơ cấu CRUD, Mã khóa, đến kỳ màn ngừng |

 làm thí điểm nơi làm thí điểm người thuê thí dụ mẫu: `ease.youyisida.com` (gặp `docs/ease-onboarding.md`).

---

## 2. tin tức cơ cấu (bản text)

```
index.html (công khai Trang chủ)
├── login / register / forgot-password
├── dashboard.html (Học viên Cần làm · premium xác)
│ └── student-calendar.js → /api/student/calendar
├── zone.html?zone=study|practice|mock (ba khu · premium xác)
│ ├── study → library/study/* · vocab · saved-words · wrong-words
│ ├── practice → library/practice/*
│ └── mock → cambridge.html · alevel.html · exam cửa vào
├── exam.html (cuộc thi xác)
│ ├──?cdt=1 → CDT cơ khảo thi xác (exam-cdt.js/css) · phương án B: Cambridge L/R/W Luyện tập + Thi thử cuối cùng hết thảy đi này xác
│ ├── Không cdt → nhãn hiệu viewer (Chuyên sâu / quá độ; B1 sau Đề Cambridge IELTS không đi nữa đường này kính)
│ └── iframe thêm năm library/mock/* HTML
├── cdt-report.html (bộ câu ba khoa báo cáo)
├── results.html (bản địa + đám mây Điểm số)
├── profile.html · ai-tutor.html · speaking-*.html (Nói độc lập, không vào CDT)
├── teacher.html · teacher-calendar.html (premium xác)
└── platform.html (tổng bộ chủ điều khiển · vượt qua quản)

suspended.html ← người thuê đến kỳ nhảy chuyển
```

---

## 3. hạch tâm trang web danh sách (≥25)

| đường nhỏ | nhân vật | chủ yếu JS | chủ yếu CSS | page-premium |
|------|------|---------|----------|--------------|
| `index.html` | công khai | home.js, config.js, auth.js, nav.js | style.css, mascot.css | hay không |
| `dashboard.html` | Học viên | dashboard.js, student-calendar.js | style + dashboard-premium + mascot | ** là ** |
| `zone.html` | Học viên | zone.js, ai-word.js, config.js | style + dashboard-premium + ai-tutor | ** là ** |
| `exam.html` | Học viên | exam.js, exam-bridge.js | style + exam-shell.css | hay không |
| `results.html` | Học viên | inline + config.js | style + dashboard-premium (I-001 sau) | ** là ** |
| `login.html` | công khai | auth.js, nav.js | style.css | hay không |
| `register.html` | công khai | auth.js | style.css | hay không |
| `profile.html` | Học viên | auth.js | style.css | hay không |
| `cambridge.html` | Học viên | cambridge.js | style.css | hay không |
| `alevel.html` | Học viên | alevel.js | style.css | hay không |
| `alevel-subject.html` | Học viên | alevel-subject.js | style.css | hay không |
| `alevel-view.html` | Học viên | alevel-view.js | style.css | hay không |
| `vocab.html` | Học viên | vocab-bridge.js | style.css | hay không |
| `saved-words.html` | Học viên | saved-words.js | style.css | hay không |
| `wrong-words.html` | Học viên | wrong-words.js | style.css | hay không |
| `ai-tutor.html` | Học viên | ai-tutor.js | style + ai-tutor.css | hay không |
| `speaking.html` | Học viên | speaking-common.js | style.css | hay không |
| `speaking-select.html` | Học viên | speaking-common.js | style.css | hay không |
| `speaking-session.html` | Học viên | speaking-session.js | style.css | hay không |
| `teacher.html` | Giáo viên | teacher.js, teacher-auth.js | style + dashboard-premium | ** là ** |
| `teacher-calendar.html` | Giáo viên | teacher-calendar.js | style + dashboard-premium | ** là ** |
| `teacher-login.html` | Giáo viên | teacher-auth.js | style.css | hay không |
| `teacher-register.html` | Giáo viên | teacher-auth.js | style.css | hay không |
| `admin-assign.html` | Quản trị viên | admin-assign.js | style.css | hay không |
| `platform.html` | vượt qua quản | platform.js | style.css | hay không |
| `suspended.html` | người thuê | tenant-boot only | style.css | hay không |
| `calendar.html` | Học viên | student-calendar.js | style.css | hay không |
| `forgot-password.html` | công khai | auth.js | style.css | hay không |

** xác trang web vs nội dung HTML: **

- ** xác trang web: ** cây mục lục `*.html`, chịu trách nhiệm Điều hướng, auth, API, iframe vật chứa
- ** nội dung HTML: ** `library/mock/`, `library/practice/`, `library/study/` bên trong bộ câu (do manifest hướng dẫn tra cứu, `config.js` CONTENT_VER khống trì hoãn tồn)

---

## 4. xếp đặt thiết kế hệ thống trích yếu

### 4.1 `style.css` `:root` token (đoạn tích)

| Token | giá trị | công dụng |
|-------|-----|------|
| `--brand-navy` | `#07192f` | chủ sắc, nav active ngọn nguồn |
| `--brand-gold` | `#c7a45d` | accent, eyebrow |
| `--brand-ivory` / `--bg` | `#f7f3ea` / `#f6f3ec` | trang web ngọn nguồn |
| `--radius-lg` | `20px` | tạp phiến tròn giác |
| `--shadow-paper` | inset + mềm bóng râm | bằng giấy cảm giác tạp phiến |
| `--font-serif` | Playfair Display | tiêu đề editorial |
| `--c-zone-study/practice/mock` | kim / tro / navy | ba khu accent |

 nơi phát ra: [`assets/css/style.css`](../assets/css/style.css) L7–78.

### 4.2 hai bề ngoài phân công

| văn bản tài liệu | phạm vi |
|------|------|
| `style.css` | toàn cục minimal-* xác, Trang chủ hero, auth, exam, footer, mobile-tabs |
| `dashboard-premium.css` | `.page-premium` bên trong Inter kiểu chữ, topbar thuỷ tinh mờ, dash-* lịch ngày / mục lục, danh sách focus hoàn |

** quy tắc: ** Học viên sinh động đường nhỏ (dashboard / zone / teacher) đã premium; Điểm số, từ sách, A-Level liệt biểu List nhưng là xưa cũ xác → P1 từng bước di chuyển.

---

## 5. nhiều người thuê cơ chế

1. **`tenant-boot.js` (head đồng bộ): ** không phải `yysd` slug lúc `html.tenant-brand-pending` che giấu body, phòng nhãn hiệu thoáng hiện
2. **`auth.js` → `/api/tenant/bootstrap`: ** kéo org name/logo, sửa `.minimal-brand__text b`, logo src, `document.title`
3. **slug Giải thích đáp án: ** tử vực `{slug}.youyisida.com` hoặc `?tenant=`; giữ lại chữ gặp `docs/multi-tenant.md`
4. ** đến kỳ: ** `org.usable === false` → `suspended.html`

** sửa đổi phần ước thúc: ** không có ở đây CSS `content:` ghi cơ cấu tên; tiêu đề / logo chỉ JS thay thế.

---

## 6. API sờ mặt (lối vào fetch)

| đường nhỏ | trang web / module |
|------|-----------|
| `/api/tenant/bootstrap` | auth.js (toàn bộ đứng) |
| `/api/auth/me` · login/register | auth.js |
| `/api/student/calendar` | dashboard.js, student-calendar.js |
| `/api/student/assignments/*/meta` | exam.js |
| `/api/calendar/events` | teacher-calendar.js, exam.js |
| `/api/teacher/me` · `/api/teacher/students` | teacher.js |
| `/api/platform/orgs` | platform.js |
| `/api/ai-tutor/*` | ai-tutor.js, exam.js |
| `/api/speaking/grade` | speaking-common.js |
| `/api/health` | speaking-common.js |
| `library/manifest.json` (fetch) | config.js |

 sau đầu thực hiện: [`server/server.js`](../server/server.js).

---

## 7. nội dung kho `library/`

```
library/
├── mock/ # đề thi thật: cambridge-listening/reading/writing, alevel/, ielts*
├── practice/ # Luyện tập: changnanju, jingting, shuzi-tingxie, ielts-speaking
└── study/ # Học tập: grammar, vocab, vocab-cet4, vocab-special-*
```

`.staging/` là đợi nhập kho Cambridge 21 T2–T4, chưa tiến manifest.

---

## 8. đã biết xếp đặt thiết kế nợ nần

| # | vấn đề | đường nhỏ |
|---|------|------|
| 1 | ** song xác cùng tồn tại: ** premium (dashboard/zone/teacher) vs xưa cũ minimal (results/profile/vocab/alevel) | gặp §3 bề ngoài |
| 2 | **Auth trang Không Inter: ** login/register chỉ Playfair + system | login.html, register.html |
| 3 | ** di động đầu ≤820px: ** top nav che giấu, ỷ lại bottom `mobile-tabs`; bộ phận trang không thêm `has-mobile-tabs` body class | style.css L3694+ · nav.js |
| 4 | **CSS phiên bản query không thống nhất: ** tất cả trang `?v=` ngày khác nhau, trì hoãn tồn bust dựa vào nhân công | Tất cả shell HTML |
| 5 | **results chỗ trống Trạng thái: ** bình thường `.state` khối, thị giác yếu hơn premium dash | results.html L107 |
| 6 | **exam xác độc lập: ** exam-shell.css và premium token bộ phận tách rời | exam.html |
| 7 | **tenant đầu bình: ** không phải yysd tử vực body visibility hidden thẳng đến bootstrap | tenant-boot.js |

---

## 9. sửa đổi phần ưu tiên cấp

| cấp bậc | hạng | lý do |
|------|-----|------|
| **P0** | ** IELTS CDT phương án B** (gặp `CDT-PLAN-B.md`) | lão bản định âm điệu: Cambridge nghe đọc ghi 100% cơ khảo thi cơ bắp trí nhớ; chuỗi đi B0→B5 |
| **P1** | thống nhất Học viên sinh động đường nhỏ premium xác | dashboard→zone→results (I-001~005 Đã hoàn thành một vòng) |
| **P1** | profile / vocab / saved-words premium di chuyển | Khu từ vựng chiều sâu sử dụng |
| **P2** | alevel liệt biểu List trang editorial thống nhất | thứ yếu đường nhỏ |

CDT Tiến độ: B0–B2 hoàn thành (2026-07-31); tiếp theo đao **B3** (DnD dạng bài). năng lực phác thảo chọn: `CDT-CHECKLIST.md`.

---

## 10. tuyến thượng vs bản địa

| duy độ | bản địa | tuyến thượng |
|------|------|------|
| người thuê | `localhost` → yysd; `?tenant=ease` mô phỏng | `ease.youyisida.com` chân thật bootstrap |
| API | cần mở `server/` | sinh sản API cùng vực |
| nội dung | `.staging/` có thể thấy được | không bố trí staging |
| nhãn hiệu | cam chịu YYSD logo | ease đã đổi Logo (ease-onboarding) |

** nghiệm chứng đề nghị: ** bản địa `python -m http.server` + khác đầu cuối(*bộ phận kết nối) `node server/server.js`; người thuê dùng `?tenant=ease` hoặc hosts chỉ hướng.
