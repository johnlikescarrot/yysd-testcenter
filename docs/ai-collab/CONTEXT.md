# Bản đồ Dự án Nền tảng Học tập YYSD (CONTEXT)

> Nhiệm vụ D-001 · Khởi tạo: 22/07/2026 · Duy trì: Kimi cập nhật / Cursor triển khai ban đầu  

## 1. Giới thiệu Sản phẩm & Đối tượng Người dùng

**Định vị:** Trung tâm Luyện thi Quốc tế YYSD — Nền tảng web tĩnh tất-cả-trong-một phục vụ ôn thi IELTS và A-Level theo chu trình «Học tập · Luyện tập · Thi thử», hỗ trợ tùy biến thương hiệu riêng (white-label) qua tên miền con cho nhiều tổ chức giáo dục đối tác.

| Nhóm người dùng | Cổng truy cập | Các trang chức năng chính |
|---|---|---|
| Học viên | `login.html` / `register.html` | `dashboard.html` → `zone.html` → `exam.html` → `results.html` |
| Giáo viên | `teacher-login.html` / `teacher-register.html` | `teacher.html` · `teacher-calendar.html` · `admin-assign.html` |
| Super Admin nền tảng | Trang trung tâm `platform.html` | Quản trị tổ chức đối tác, cấp mã kích hoạt, tạm ngưng chi nhánh hết hạn |

Điểm thí điểm đối tác mẫu: `ease.youyisida.com` (xem chi tiết tại `docs/ease-onboarding.md`).

---

## 2. Kiến trúc Thông tin Hệ thống

```text
index.html (Trang chủ công khai)
├── login / register / forgot-password
├── dashboard.html (Trung tâm nhiệm vụ học viên · giao diện Premium)
│   └── student-calendar.js → /api/student/calendar
├── zone.html?zone=study|practice|mock (3 phân khu chính · giao diện Premium)
│   ├── study → library/study/* · vocab · saved-words · wrong-words
│   ├── practice → library/practice/*
│   └── mock → cambridge.html · alevel.html · cổng vào exam
├── exam.html (Phòng thi trực tuyến)
│   ├── ?cdt=1 → Giao diện phòng thi máy tính CDT (exam-cdt.js/css) · Phương án B: toàn bộ đề Cambridge L/R/W đều dùng giao diện này
│   ├── Không có cdt → Trình xem đề thi truyền thống (chuyên sâu / chuyển tiếp)
│   └── iframe nạp các tệp HTML trong library/mock/*
├── cdt-report.html (Báo cáo kết quả 3 kỹ năng)
├── results.html (Lịch sử điểm số lưu cục bộ & đám mây)
├── profile.html · ai-tutor.html · speaking-*.html (Môn Nói hoạt động độc lập, không vào khung CDT)
├── teacher.html · teacher-calendar.html (Cổng giáo viên · giao diện Premium)
└── platform.html (Bảng điều khiển Super Admin quản lý toàn nền tảng)

suspended.html ← Trang thông báo chuyển hướng khi tổ chức đối tác hết hạn
```

---

## 3. Danh mục Các Trang Web Cốt lõi (≥25 trang)

| Đường dẫn tệp | Đối tượng | JavaScript chính | CSS chính | Áp dụng `.page-premium` |
|---|---|---|---|---|
| `index.html` | Công khai | home.js, config.js, auth.js, nav.js | style.css, mascot.css | Không |
| `dashboard.html` | Học viên | dashboard.js, student-calendar.js | style + dashboard-premium + mascot | **Có** |
| `zone.html` | Học viên | zone.js, ai-word.js, config.js | style + dashboard-premium + ai-tutor | **Có** |
| `exam.html` | Học viên | exam.js, exam-bridge.js | style + exam-shell.css | Không |
| `results.html` | Học viên | inline + config.js | style + dashboard-premium (sau nhiệm vụ I-001) | **Có** |
| `login.html` | Công khai | auth.js, nav.js | style.css | Không |
| `register.html` | Công khai | auth.js | style.css | Không |
| `profile.html` | Học viên | auth.js | style.css | Không |
| `cambridge.html` | Học viên | cambridge.js | style.css | Không |
| `alevel.html` | Học viên | alevel.js | style.css | Không |
| `alevel-subject.html` | Học viên | alevel-subject.js | style.css | Không |
| `alevel-view.html` | Học viên | alevel-view.js | style.css | Không |
| `vocab.html` | Học viên | vocab-bridge.js | style.css | Không |
| `saved-words.html` | Học viên | saved-words.js | style.css | Không |
| `wrong-words.html` | Học viên | wrong-words.js | style.css | Không |
| `ai-tutor.html` | Học viên | ai-tutor.js | style + ai-tutor.css | Không |
| `speaking.html` | Học viên | speaking-common.js | style.css | Không |
| `speaking-select.html` | Học viên | speaking-common.js | style.css | Không |
| `speaking-session.html` | Học viên | speaking-session.js | style.css | Không |
| `teacher.html` | Giáo viên | teacher.js, teacher-auth.js | style + dashboard-premium | **Có** |
| `teacher-calendar.html` | Giáo viên | teacher-calendar.js | style + dashboard-premium | **Có** |
| `teacher-login.html` | Giáo viên | teacher-auth.js | style.css | Không |
| `teacher-register.html` | Giáo viên | teacher-auth.js | style.css | Không |
| `admin-assign.html` | Quản trị viên | admin-assign.js | style.css | Không |
| `platform.html` | Super Admin | platform.js | style.css | Không |
| `suspended.html` | Đối tác hết hạn | tenant-boot.js | style.css | Không |
| `calendar.html` | Học viên | student-calendar.js | style.css | Không |
| `forgot-password.html` | Công khai | auth.js | style.css | Không |

**Phân biệt trang khung viền (Shell) vs tệp HTML nội dung bài thi:**
- **Trang khung viền:** Các tệp `*.html` tại thư mục gốc, đảm nhận điều hướng, xác thực tài khoản, gọi API và chứa khung iframe.
- **Tệp HTML nội dung:** Nằm trong `library/mock/`, `library/practice/`, `library/study/` (được lập chỉ mục qua manifest, kiểm soát bộ nhớ đệm qua `config.js` CONTENT_VER).

---

## 4. Tóm tắt Hệ thống Thiết kế (Design System)

### 4.1 Danh mục Design Token trong `style.css`

| Token | Giá trị | Mục đích sử dụng |
|---|---|---|
| `--brand-navy` | `#07192f` | Màu chủ đạo, trạng thái hoạt động của thanh điều hướng |
| `--brand-gold` | `#c7a45d` | Màu nhấn, tiêu đề phụ eyebrow |
| `--brand-ivory` / `--bg` | `#f7f3ea` / `#f6f3ec` | Màu nền giấy ngà toàn trang |
| `--radius-lg` | `20px` | Bo góc thẻ giao diện |
| `--shadow-paper` | Đổ bóng mềm nhiều lớp | Tạo hiệu ứng chiều sâu bề mặt giấy |
| `--font-serif` | Playfair Display | Phông chữ cho tiêu đề phong cách biên tập học thuật |
| `--c-zone-study/practice/mock` | Vàng kim / Xám / Xanh hải quân | Màu nhấn cho 3 phân khu chức năng |

### 4.2 Phân định trách nhiệm giữa 2 tệp CSS

| Tệp tin | Phạm vi phụ trách |
|---|---|
| `style.css` | Khung giao diện toàn cục `minimal-*`, Trang chủ hero, màn hình đăng nhập/đăng ký, phòng thi exam, chân trang footer, tab di động |
| `dashboard-premium.css` | Kiểu chữ Inter bên trong `.page-premium`, thanh điều hướng trên cùng phủ kính mờ, thẻ lịch biểu `dash-*`, danh mục bài học, vòng tiêu điểm focus |

**Quy tắc áp dụng:** Các luồng thao tác chính của học viên (dashboard / zone / teacher) đã chuyển sang giao diện Premium; trang điểm số, tủ từ vựng, danh mục A-Level vẫn còn dùng khung cũ → sẽ chuyển dịch dần trong P1.

---

## 5. Cơ chế Hỗ trợ Đa người thuê (Multi-tenant Mechanism)

1. **`tenant-boot.js` (chạy đồng bộ tại thẻ head):** Khi tên miền không phải slug mặc định `yysd`, thêm lớp `html.tenant-brand-pending` để ẩn tạm body nhằm chống hiện tượng nhấp nháy giao diện thương hiệu cũ.
2. **`auth.js` → gọi `/api/tenant/bootstrap`:** Lấy thông tin tên tổ chức, logo để cập nhật `.minimal-brand__text b`, thuộc tính src của logo và `document.title`.
3. **Phân giải slug:** Dựa trên tên miền con `{slug}.youyisida.com` hoặc tham số `?tenant=`.
4. **Xử lý hết hạn:** Khi `org.usable === false`, tự động chuyển hướng người dùng sang `suspended.html`.

**Ràng buộc kỹ thuật:** Không được viết cứng tên tổ chức vào thuộc tính `content:` của CSS; tiêu đề và logo chỉ được thay thế động thông qua JavaScript.

---

## 6. Các Điểm chạm API (Client Fetch Endpoints)

| Đường dẫn API | Trang / Mô-đun sử dụng |
|---|---|
| `/api/tenant/bootstrap` | auth.js (dùng trên toàn bộ trang) |
| `/api/auth/me` · login / register | auth.js |
| `/api/student/calendar` | dashboard.js, student-calendar.js |
| `/api/student/assignments/*/meta` | exam.js |
| `/api/calendar/events` | teacher-calendar.js, exam.js |
| `/api/teacher/me` · `/api/teacher/students` | teacher.js |
| `/api/platform/orgs` | platform.js |
| `/api/ai-tutor/*` | ai-tutor.js, exam.js |
| `/api/speaking/grade` | speaking-common.js |
| `/api/health` | speaking-common.js |
| `library/manifest.json` | config.js |

Triển khai phía backend tại: [`server/server.js`](../server/server.js).

---

## 7. Cấu trúc Kho Nội dung `library/`

```text
library/
├── mock/     # Đề thi thật: cambridge-listening/reading/writing, alevel/, ielts*
├── practice/ # Luyện tập: changnanju, jingting, shuzi-tingxie, ielts-speaking
└── study/    # Học tập: grammar, vocab, vocab-cet4, vocab-special-*
```

Thư mục `.staging/` là khu vực chờ nhập kho Cambridge 21 Test 2–4, chưa đưa vào manifest chính thức.

---

## 8. Các Khoản Nợ Kỹ thuật & Thiết kế Đã Ghi nhận

| # | Vấn đề tồn đọng | Vị trí phát sinh |
|---|---|---|
| 1 | **Tồn tại song song hai hệ giao diện:** Premium (dashboard/zone/teacher) vs Minimal cũ (results/profile/vocab/alevel) | Xem bảng phân loại tại §3 |
| 2 | **Trang xác thực tài khoản chưa dùng phông Inter:** login/register chỉ dùng Playfair + phông mặc định hệ thống | login.html, register.html |
| 3 | **Giao diện di động ≤820px:** Ẩn thanh điều hướng trên, dựa vào `mobile-tabs` ở đáy; một số trang chưa thêm class `has-mobile-tabs` vào body | style.css L3694+ · nav.js |
| 4 | **Tham số phiên bản CSS chưa đồng nhất:** Các trang dùng `?v=` với các ngày khác nhau, làm mới cache còn dựa vào thủ công | Toàn bộ các tệp HTML |
| 5 | **Trạng thái kết quả trống:** Khối `.state` thông thường nhìn đơn điệu hơn giao diện dashboard premium | results.html L107 |
| 6 | **Khung phòng thi exam đứng độc lập:** exam-shell.css còn một số token tách rời với hệ thống premium | exam.html |
| 7 | **Hiện tượng tải trang đầu tiên của đối tác:** Tên miền con khác yysd phải ẩn body cho đến khi hoàn tất gọi API bootstrap | tenant-boot.js |

---

## 9. Thứ tự Ưu tiên Triển khai

| Cấp độ | Hạng mục | Lý do ưu tiên |
|---|---|---|
| **P0** | **IELTS CDT Phương án B** (xem chi tiết tại `CDT-PLAN-B.md`) | Định hướng cốt lõi: Đảm bảo phản xạ thao tác thi máy tính 100% giống thi thật cho các đề Cambridge L/R/W |
| **P1** | Thống nhất giao diện Premium cho toàn bộ luồng học viên chính | dashboard → zone → results (đã hoàn thành vòng 1 qua các nhiệm vụ I-001 ~ I-005) |
| **P1** | Chuyển đổi giao diện Premium cho profile / vocab / saved-words | Khu vực từ vựng có tần suất sử dụng chuyên sâu |
| **P2** | Chuẩn hóa phong cách biên tập cho trang danh sách đề thi A-Level | Luồng nghiệp vụ phụ |

Tiến độ CDT: B0–B5 đã hoàn thành (31/07/2026); danh mục tính năng chi tiết tại `CDT-CHECKLIST.md`.

---

## 10. So sánh Môi trường Local vs Production

| Tiêu chí | Môi trường cục bộ (Local) | Môi trường trực tiếp (Production) |
|---|---|---|
| Đa người thuê | `localhost` trỏ về yysd; mô phỏng chi nhánh qua tham số `?tenant=ease` | Tên miền thật `ease.youyisida.com` gọi bootstrap thực tế |
| API | Cần khởi chạy dịch vụ `server/` | API production chạy cùng tên miền |
| Nội dung | Có thể truy cập tệp trong `.staging/` | Không triển khai thư mục staging |
| Nhận diện thương hiệu | Mặc định hiển thị logo và tên YYSD | Đã chuyển sang logo và nhận diện thương hiệu của Ease |

**Khuyến nghị kiểm thử:** Tại local chạy lệnh `python -m http.server` kết hợp một terminal khác chạy `node server/server.js`; kiểm thử tính năng đa người thuê qua tham số `?tenant=ease` hoặc cấu hình tệp hosts.
