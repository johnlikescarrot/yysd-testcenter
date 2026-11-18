# YYSD học nền tảng - mục bản đồ(CONTEXT)

> Task D-001 · tạo ra: 2026-07-22 · bảo vệ: Kimi cải tiến / Cursor lúc đầu một đăng ký

## 1. hàng hóa nói một lời & người dùng

**nói một lời: ** Trung tâm YYSD - IELTS biến thể của | A-Level chuẩn bị cho kỳ thi của«học · luyện tập · bắt chước đánh»một cửa tĩnh Web nền tảng, tán thành nhiều cơ chế trắng đánh dấu trường con 

| người dùng | lối vào | lõi trang |
|------|------|----------|
| Học viên | `login.html` / `register.html` | `dashboard.html` → `zone.html` → `exam.html` → `results.html` |
| Giáo viên | `teacher-login.html` / `teacher-register.html` | `teacher.html` · `teacher-calendar.html` · `admin-assign.html` |
| nền tảng vượt quá biến thể của | trụ sở chính `platform.html` | cơ chế CRUD, khóa, đến hạn đóng cửa |

điểm thử nghiệm người thuê minh họa: `ease.youyisida.com`(thấy `docs/ease-onboarding.md`) 

---

## 2. thông tin xây dựng(chữ viết một đăng ký)

```
index.html(mở trang chủ)
├── login / register / forgot-password
├── dashboard.html(học sinh ở lại làm · premium biến thể của |)
│   └── student-calendar.js → /api/student/calendar
├── zone.html?zone=study|practice|mock(ba khu vực · premium biến thể của |)
│   ├── study → library/study/* · vocab · saved-words · wrong-words
│   ├── practice → library/practice/*
│   └── mock → cambridge.html · alevel.html · exam lối vào
├── exam.html(dự thi biến thể của |)
│   ├── ?cdt=1 → CDT máy móc đánh biến thể của |(exam-cdt.js/css)· kế hoạch B: Cambridge L/R/W luyện tập+bắt chước đánh cuối cùng giống nhau đi này biến thể của |
│   ├── không có cdt → tên thương hiệu viewer(chuyên biệt/chèo qua; B1 hoàng hậu Cambridge câu hỏi từ đề thi các năm trước không còn đi này con đường)
│   └── iframe tải library/mock/* HTML
├── cdt-report.html(che đậy chủ đề ba ngành học thông báo)
├── results.html(địa phương + cao trên mây thành tích)
├── profile.html · ai-tutor.html · speaking-*.html(lời nói thông thường độc lập, không tiến lên CDT)
├── teacher.html · teacher-calendar.html(premium biến thể của |)
└── platform.html(trụ sở chính chủ kiểm soát · vượt quá biến thể của)

suspended.html ← người thuê đến hạn nhảy đến
```

---

## 3. lõi trang danh sách mục(≥25)

| con đường | vai trò | chính JS | chính CSS | page-premium |
|------|------|---------|----------|--------------|
| `index.html` | mở | home.js, config.js, auth.js, nav.js | style.css, mascot.css | phủ định |
| `dashboard.html` | Học viên | dashboard.js, student-calendar.js | style + dashboard-premium + mascot | **là** |
| `zone.html` | Học viên | zone.js, ai-word.js, config.js | style + dashboard-premium + ai-tutor | **là** |
| `exam.html` | Học viên | exam.js, exam-bridge.js | style + exam-shell.css | phủ định |
| `results.html` | Học viên | inline + config.js | style + dashboard-premium(I-001 hoàng hậu) | **là** |
| `login.html` | mở | auth.js, nav.js | style.css | phủ định |
| `register.html` | mở | auth.js | style.css | phủ định |
| `profile.html` | Học viên | auth.js | style.css | phủ định |
| `cambridge.html` | Học viên | cambridge.js | style.css | phủ định |
| `alevel.html` | Học viên | alevel.js | style.css | phủ định |
| `alevel-subject.html` | Học viên | alevel-subject.js | style.css | phủ định |
| `alevel-view.html` | Học viên | alevel-view.js | style.css | phủ định |
| `vocab.html` | Học viên | vocab-bridge.js | style.css | phủ định |
| `saved-words.html` | Học viên | saved-words.js | style.css | phủ định |
| `wrong-words.html` | Học viên | wrong-words.js | style.css | phủ định |
| `ai-tutor.html` | Học viên | ai-tutor.js | style + ai-tutor.css | phủ định |
| `speaking.html` | Học viên | speaking-common.js | style.css | phủ định |
| `speaking-select.html` | Học viên | speaking-common.js | style.css | phủ định |
| `speaking-session.html` | Học viên | speaking-session.js | style.css | phủ định |
| `teacher.html` | Giáo viên | teacher.js, teacher-auth.js | style + dashboard-premium | **là** |
| `teacher-calendar.html` | Giáo viên | teacher-calendar.js | style + dashboard-premium | **là** |
| `teacher-login.html` | Giáo viên | teacher-auth.js | style.css | phủ định |
| `teacher-register.html` | Giáo viên | teacher-auth.js | style.css | phủ định |
| `admin-assign.html` | người quản lý | admin-assign.js | style.css | phủ định |
| `platform.html` | vượt quá biến thể của | platform.js | style.css | phủ định |
| `suspended.html` | người thuê | tenant-boot only | style.css | phủ định |
| `calendar.html` | Học viên | student-calendar.js | style.css | phủ định |
| `forgot-password.html` | mở | auth.js | style.css | phủ định |

**biến thể của | trang vs nội dung HTML: **

- **biến thể của | trang: ** rễ mục lục `*.html`, chịu trách nhiệm về điều hướng, auth, API, iframe đồ chứa
- **nội dung HTML: ** `library/mock/`, `library/practice/`, `library/study/` bên trong che đậy chủ đề(do manifest chỉ mục, `config.js` CONTENT_VER kiểm soát bộ nhớ đệm)

---

## 4. thiết kế hệ thống tóm tắt

### 4.1 `style.css` `:root` token(trích đoạn)

| Token | giá trị | công dụng |
|-------|-----|------|
| `--brand-navy` | `#07192f` | chủ màu sắc, nav active nền tảng |
| `--brand-gold` | `#c7a45d` |  accent, eyebrow |
| `--brand-ivory` / `--bg` | `#f7f3ea` / `#f6f3ec` | trang nền tảng |
| `--radius-lg` | `20px` | thẻ góc bo tròn |
| `--shadow-paper` | inset + mềm bóng | giấy cảm thấy thẻ |
| `--font-serif` | Playfair Display | tiêu đề editorial |
| `--c-zone-study/practice/mock` | vàng / tro /  navy | ba khu vực accent |

Nguồn: [`assets/css/style.css`](../assets/css/style.css) L7–78 

### 4.2 hai bề mặt bên ngoài phân chia công việc

| tài liệu | Phạm vi |
|------|------|
| `style.css` | tình hình tổng thể minimal-* biến thể của |, Trang chủ hero, auth, exam, footer, mobile-tabs |
| `dashboard-premium.css` | `.page-premium` bên trong Inter phong cách thư pháp, topbar kính mờ, dash-* Lịch/mục lục, biểu mẫu focus nhẫn |

**quy tắc: ** học sinh năng động con đường(dashboard / zone / teacher)đã premium; Kết quả, Sách từ vựng, A-Level danh sách vẫn làm cũ biến thể của | → P1 một cách tiến triển di cư 

---

## 5. nhiều người thuê cơ chế

1. **`tenant-boot.js`(head đồng bộ): ** viết tắt của `yysd` slug biến thể cũ của | `html.tenant-brand-pending` che giấu body, bảo vệ tên thương hiệu loé lên
2. **`auth.js` → `/api/tenant/bootstrap`: ** kéo org name/logo, thay đổi `.minimal-brand__text b`, logo src, `document.title`
3. **slug Giải thích: ** trường con `{slug}.youyisida.com` hoặc `?tenant=`; giữ chữ thấy `docs/multi-tenant.md`
4. **đến hạn: ** `org.usable === false` → `suspended.html`

**sửa đổi phiên bản hiện tại hạn chế: ** không có mặt CSS `content:` viết cơ chế tên; tiêu đề/ logo hầu như JS thay thế 

---

## 6. API chạm mặt(phía trước fetch)

| con đường | trang/mô-đun |
|------|-----------|
| `/api/tenant/bootstrap` | auth.js(tất cả trạm) |
| `/api/auth/me` · login/register | auth.js |
| `/api/student/calendar` | dashboard.js, student-calendar.js |
| `/api/student/assignments/*/meta` | exam.js |
| `/api/calendar/events` | teacher-calendar.js, exam.js |
| `/api/teacher/me` · `/api/teacher/students` | teacher.js |
| `/api/platform/orgs` | platform.js |
| `/api/ai-tutor/*` | ai-tutor.js, exam.js |
| `/api/speaking/grade` | speaking-common.js |
| `/api/health` | speaking-common.js |
| `library/manifest.json`(fetch) | config.js |

backend đạt được: [`server/server.js`](../server/server.js) 

---

## 7. nội dung nhà kho `library/`

```
library/
├── mock/           # Đề thi thật: cambridge-listening/reading/writing, alevel/, ielts*
├── practice/       # luyện tập: changnanju, jingting, shuzi-tingxie, ielts-speaking
└── study/          # học: grammar, vocab, vocab-cet4, vocab-special-*
```

`.staging/` làm ở lại đi vào nhà kho Cambridge 21 T2–T4, chưa tiến lên manifest 

---

## 8. được biết thiết kế nợ

| # | câu hỏi | con đường |
|---|------|------|
| 1 | **hai biến thể của | tồn tại cùng lúc: ** premium(dashboard/zone/teacher)vs cũ minimal(results/profile/vocab/alevel) | thấy §3 bề mặt bên ngoài |
| 2 | **Auth đầu không có Inter: ** login/register hầu như Playfair + system | login.html, register.html |
| 3 | **di chuyển cuối ≤820px: ** top nav che giấu, phụ thuộc vào bottom `mobile-tabs`; phần đầu chưa Canada `has-mobile-tabs` body class | style.css L3694+ · nav.js |
| 4 | **CSS phiên bản query không 7-Eleven: ** mỗi đầu `?v=` ngày tháng đều khác nhau, bộ nhớ đệm bust dựa vào nhân tạo | Tất cả shell HTML |
| 5 | **results trống không tình trạng: ** phổ thông `.state` cục, thị giác yếu đi premium dash | results.html L107 |
| 6 | **exam biến thể của | độc lập: ** exam-shell.css và premium token phần rời ra | exam.html |
| 7 | **tenant đầu xem |: ** viết tắt của yysd trường con body visibility hidden cho đến bootstrap | tenant-boot.js |

---

## 9. sửa đổi phiên bản hiện tại mức độ ưu tiên

| cấp bậc | sau cổ | lý do |
|------|-----|------|
| **P0** | **IELTS CDT kế hoạch B**(thấy `CDT-PLAN-B.md`) | biến thể của | định hình giọng điệu: Cambridge cười đọc và viết 100% máy móc đánh cơ nhớ; nhảy dòng B0→B5 |
| **P1** | 7-Eleven học sinh năng động con đường premium biến thể của | | dashboard→zone→results(I-001~005 đã hoàn thành vòng hoặc giai đoạn đầu tiên) |
| **P1** | profile / vocab / saved-words premium di cư | từ khu vực độ sâu sử dụng |
| **P2** | alevel danh sách đầu editorial 7-Eleven | thứ yếu con đường |

CDT tốc độ tiến triển: B0–B2 Hoàn thành(2026-07-31); xuống một dao **B3**(DnD chủ đề khuôn) năng lực chọn: `CDT-CHECKLIST.md` 

---

## 10. trực tuyến vs địa phương

| chiều | địa phương | trực tuyến |
|------|------|------|
| người thuê | `localhost` → yysd; `?tenant=ease` mô phỏng | `ease.youyisida.com` thật bootstrap |
| API | yêu cầu biến thể của | `server/` | sản xuất API giống lĩnh vực |
| nội dung | `.staging/` có thể thấy rõ | chưa bố trí staging |
| tên thương hiệu | đồng ý ngầm xuất sắc lợi ích suy nghĩ đạt tới logo | ease đã trao đổi Logo(ease-onboarding) |

**kiểm tra và xác minh đề xuất: ** địa phương `python -m http.server` + khác cuối `node server/server.js`; người thuê sử dụng `?tenant=ease` hoặc hosts chỉ về 
