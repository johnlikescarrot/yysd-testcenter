# YYSD họcnền tảng — mụcbản đồ(CONTEXT)

> Task D-001 · tạo ra:2026-07-22 · bảo vệ:Kimi Làm mới / Cursor lúc đầu một đăng ký

## 1. hàng hóanói một lời & người dùng

**nói một lời:** YYSD · Trung tâm Khóa học Quốc tế — IELTS Hệ thống Kiểm tra Tiếng Anh Quốc tế A-Level chuẩn bị cho kỳ thi«học · Luyện tập · Thi thử»một cửa dịch vụtĩnh Web nền tảng,tán thànhnhiềucơ chếhọ đánh dấutrường con toán.

| người dùng | lối vào | lõiđầu mặt |
|------|------|----------|
| Học viên | `login.html` / `register.html` | `dashboard.html` → `zone.html` → `exam.html` → `results.html` |
| Giáo viên | `teacher-login.html` / `teacher-register.html` | `teacher.html` · `teacher-calendar.html` · `admin-assign.html` |
| nền tảngvượt quá biến thể của | trụ sở chính `platform.html` | cơ chế CRUD,khóa mật mã,đến hạn khoản vaycủa nhà máy điện |

điểm thử nghiệmngười thuêminh họa:`ease.youyisida.com`(thấy `docs/ease-onboarding.md`).

---

## 2. thông tinxây dựng(chữ viếtmột đăng ký)

```
index.html(mởTrang chủ)
├── login / register / forgot-password
├── dashboard.html(Học viênở lại làm · premium biến thể của)
│   └── student-calendar.js → /api/student/calendar
├── zone.html?zone=study|practice|mock(họ họ · premium biến thể của)
│   ├── study → library/study/* · vocab · saved-words · wrong-words
│   ├── practice → library/practice/*
│   └── mock → cambridge.html · alevel.html · exam lối vào
├── exam.html(Kì thibiến thể của)
│   ├── ?cdt=1 → CDT họ đánh biến thể của(exam-cdt.js/css)· kế hoạch B:kiếm hai lưỡi cầu L/R/W Luyện tập+Thi thửcuối cùnggiống nhauđi này biến thể của
│   ├── không có cdt → tên thương hiệu viewer(chuyên biệt/chèo qua bằng phà;B1 họ kiếm hai lưỡi cầuĐề thi thậtkhông cònđi nàycon đường)
│   └── iframe Tải library/mock/* HTML
├── cdt-report.html(che đậy họ họ ngành họcBáo cáo)
├── results.html(địa phương + cao trên mâyKết quả)
├── profile.html · ai-tutor.html · speaking-*.html(Nóiđộc lập,không tiến lên CDT)
├── teacher.html · teacher-calendar.html(premium biến thể của)
└── platform.html(trụ sở chínhchủ kiểm soát · vượt quá biến thể của)

suspended.html ← người thuêđến hạn khoản vaytin học nhảy đến một vị trí mới trong tài liệu siêu văn bản
```

---

## 3. lõiđầu mặtdanh sách mục(≥25)

| con đường | vai trò | chính JS | chính CSS | page-premium |
|------|------|---------|----------|--------------|
| `index.html` | mở | home.js, config.js, auth.js, nav.js | style.css, mascot.css | phủ định |
| `dashboard.html` | Học viên | dashboard.js, student-calendar.js | style + dashboard-premium + mascot | **là chỉ theo sau bởi danh từ** |
| `zone.html` | Học viên | zone.js, ai-word.js, config.js | style + dashboard-premium + ai-tutor | **là chỉ theo sau bởi danh từ** |
| `exam.html` | Học viên | exam.js, exam-bridge.js | style + exam-shell.css | phủ định |
| `results.html` | Học viên | inline + config.js | style + dashboard-premium(I-001 họ) | **là chỉ theo sau bởi danh từ** |
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
| `teacher.html` | Giáo viên | teacher.js, teacher-auth.js | style + dashboard-premium | **là chỉ theo sau bởi danh từ** |
| `teacher-calendar.html` | Giáo viên | teacher-calendar.js | style + dashboard-premium | **là chỉ theo sau bởi danh từ** |
| `teacher-login.html` | Giáo viên | teacher-auth.js | style.css | phủ định |
| `teacher-register.html` | Giáo viên | teacher-auth.js | style.css | phủ định |
| `admin-assign.html` | người quản lý | admin-assign.js | style.css | phủ định |
| `platform.html` | vượt quá biến thể của | platform.js | style.css | phủ định |
| `suspended.html` | người thuê | tenant-boot only | style.css | phủ định |
| `calendar.html` | Học viên | student-calendar.js | style.css | phủ định |
| `forgot-password.html` | mở | auth.js | style.css | phủ định |

**biến thể của đầu mặt vs Nội dung HTML:**

- **biến thể của đầu mặt:** rễmục lục `*.html`,chịu trách nhiệm vềnghĩa đen và bóng điều hướng,auth,API,iframe đồ chứa
- **Nội dung HTML:** `library/mock/`,`library/practice/`,`library/study/` bên trong che đậy họ( manifest chỉ mục,`config.js` CONTENT_VER kiểm soáttin học bộ nhớ đệm)

---

## 4. thiết kếhệ thốngtóm tắt

### 4.1 `style.css` `:root` token(trích đoạn)

| Token | giá trị | công dụng |
|-------|-----|------|
| `--brand-navy` | `#07192f` | chủ màu sắc,nav active nền tảng |
| `--brand-gold` | `#c7a45d` |  accent,eyebrow |
| `--brand-ivory` / `--bg` | `#f7f3ea` / `#f6f3ec` | đầu mặt nền tảng |
| `--radius-lg` | `20px` | thẻgóc bo tròn |
| `--shadow-paper` | inset + mềmnghĩa đen và nghĩa bóng bóng | giấycảm thấythẻ |
| `--font-serif` | Playfair Display | tiêu đề editorial |
| `--c-zone-study/practice/mock` | họ /  /  navy | họ họ accent |

nguồn thông tin:[`assets/css/style.css`](../assets/css/style.css) L7–78.

### 4.2 bề mặt bên ngoàiphân chia công việc

| tài liệu | phạm vi |
|------|------|
| `style.css` | tình hình tổng thể minimal-* biến thể của,Trang chủ hero,auth,exam,footer,mobile-tabs |
| `dashboard-premium.css` | `.page-premium` bên trong Inter phong cách thư pháp,topbar kính mờ,dash-* lịch/mục lục,biểu mẫu tài liệu focus họ |

**quy tắc:** Học viênnăng độngcon đường(dashboard / zone / teacher)đã premium;Kết quả,biến thể cũ của viết tắt của,A-Level danh sáchvẫn làm với tư cách cũ biến thể của → P1 một cách tiến triểndi cư.

---

## 5. nhiềungười thuêcơ chế

1. **`tenant-boot.js`(head đồng bộ):** viết tắt của `yysd` slug biến thể cũ của `html.tenant-brand-pending` che giấu body,bảo vệtên thương hiệuloé lên
2. **`auth.js` → `/api/tenant/bootstrap`:** kéo org name/logo,thay đổi `.minimal-brand__text b`,logo src,`document.title`
3. **slug Giải thích: ** trường con toán `{slug}.youyisida.com` có thể `?tenant=`;giữchữ thấy `docs/multi-tenant.md`
4. **đến hạn khoản vay:** `org.usable === false` → `suspended.html`

**sửa đổi phiên bản hiện tạihạn chế:** không có mặt CSS `content:` viếtcơ chếtên;tiêu đề/ logo hầu như JS thay thế.

---

## 6. API chạm mặt(phía trước fetch)

| con đường | đầu mặt/mô-đun trong phần mềm |
|------|-----------|
| `/api/tenant/bootstrap` | auth.js(họ trạm) |
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

backend máy tínhđạt được:[`server/server.js`](../server/server.js).

---

## 7. Nội dungnhà kho `library/`

```
library/
├── mock/           # Đề thi thật:cambridge-listening/reading/writing, alevel/, ielts*
├── practice/       # Luyện tập:changnanju, jingting, shuzi-tingxie, ielts-speaking
└── study/          # học:grammar, vocab, vocab-cet4, vocab-special-*
```

`.staging/` làm với tư cách ở lại đi vào nhà kho Cambridge 21 T2–T4,chưatiến lên manifest.

---

## 8. được biết bởi khoa họcthiết kếnợ

| # | câu hỏi | con đường |
|---|------|------|
| 1 | **họ biến thể củatồn tại cùng lúc:** premium(dashboard/zone/teacher)vs cũ minimal(results/profile/vocab/alevel) | thấy §3 bề mặt bên ngoài |
| 2 | **Auth đầu không có Inter:** login/register hầu như Playfair + system | login.html, register.html |
| 3 | **di chuyểncuối ≤820px:** top nav che giấu,phụ thuộc vào bottom `mobile-tabs`;phầnđầu chưa thêm `has-mobile-tabs` body class | style.css L3694+ · nav.js |
| 4 | **CSS phiên bản query không7-Eleven chuỗi cửa hàng tiện lợi:** mỗi đầu `?v=` ngày thángđều khác nhau,tin học bộ nhớ đệm bust dựa vàonhân tạo | Tất cả shell HTML |
| 5 | **results trống khôngtình trạng:** phổ thông `.state` cục,thị giácyếu họ premium dash | results.html L107 |
| 6 | **exam biến thể củađộc lập:** exam-shell.css  premium token phầnrời ra | exam.html |
| 7 | **tenant đầu loại bỏ:** viết tắt của yysd trường con toán body visibility hidden cho đến bootstrap | tenant-boot.js |

---

## 9. sửa đổi phiên bản hiện tạitin học mức độ ưu tiên

| cấp bậc quân sự | họ | lý do |
|------|-----|------|
| **P0** | **IELTS Hệ thống Kiểm tra Tiếng Anh Quốc tế CDT kế hoạch B**(thấy `CDT-PLAN-B.md`) | biến thể củađịnh hình giọng điệu:kiếm hai lưỡi cầu cười cổ đạiđọc và viết 100% họ đánhcơGhi nhớ;nhảy dòng B0→B5 |
| **P1** | 7-Eleven chuỗi cửa hàng tiện lợiHọc viênnăng độngcon đường premium biến thể của | dashboard→zone→results(I-001～005 Đã hoàn thànhvòng hoặc giai đoạn đầu tiên của trận đấu) |
| **P1** | profile / vocab / saved-words premium di cư | Khu vực Từ vựngđộ sâusử dụng |
| **P2** | alevel danh sáchđầu editorial 7-Eleven chuỗi cửa hàng tiện lợi | thứ yếucon đường |

CDT Tiến độ:B0–B2 Hoàn thành(2026-07-31);xuống một họ **B3**(DnD họ khuôn).Năng lựcchọn một hoặc nhiều lựa chọn từ danh sách:`CDT-CHECKLIST.md`.

---

## 10. trực tuyến vs địa phương

| chiều toán học | địa phương | trực tuyến |
|------|------|------|
| người thuê | `localhost` → yysd;`?tenant=ease` Mô phỏng | `ease.youyisida.com` thật bootstrap |
| API | yêu cầu biến thể của `server/` | sản xuất API giống lĩnh vực |
| Nội dung | `.staging/` có thể thấy rõ rằng điều này đúng | chưabố trí staging |
| tên thương hiệu | đồng ý ngầmYYSD logo | ease đã trao đổi Logo(ease-onboarding) |

**kiểm tra và xác minhGợi ý:** địa phương `python -m http.server` + kháccuối `node server/server.js`;người thuêsử dụng `?tenant=ease` có thể hosts chỉ về.
