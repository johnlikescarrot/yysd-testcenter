# thiết kếhạn chếkiểm toán(DESIGN-BRIEF)

> Kimi bảo vệkiểm toánchương;Cursor tham khảo tasks/ đạt được

## tên thương hiệuchuẩn mực(không thểhỏng)

- **Palette:** navy `#07192f` · gold `#c7a45d` · ivory `#f7f3ea`
- **Typography:** Playfair(hero/tiêu đề)· Inter(`.page-premium` văn bản chính trái với chú thích chân trang UI)
- **Motif:** màu vàng kim star crumb,biến thể của cảm thấy `--shadow-paper`,mỏng hoặc thonPhnom Penh `rgba(199,164,93,.34)`
- **cấm:** màu tímthay đổi dần dần hero,họ sắp xếp icon SaaS mẫu,CSS mã cứng tin họccơ chếtên

## mô-đun class hệ thống

| tiền tố ngôn ngữ học | công dụng |
|------|------|
| `minimal-*` | họ trạm shell:topbar,nav,page-head,footer |
| `page-premium` | body cấpcông tắc điện,bắt đầu sử dụng dashboard-premium.css |
| `dash-*` | lịch,mục lục,teacher thẻ |
| `auth-*` | Đăng nhậpĐăng kýsắp xếp |
| `results-*` | Kết quả hero / trống khôngtình trạng |

---

## Audit 2026-07-22

### index.html

**A. giữ:** editorial hero,SVG motif,họ sắp xếp home-dual lối vào  
**B. câu hỏi:**  logged-in premium con đườngphong cáchnhảy;hero hoạt hìnhđúng `prefers-reduced-motion` đãphầnxử lý  
**C. thay đổi biến thể của:** giữTrang chủ editorial,không có mặtnày đầu thêm page-premium  
**D. premium biến thể của:** phủ định( intentional tiếp thịđầu)

### dashboard.html

**A. giữ:** dash-premium-eyebrow,lịch hero,focus dảihoạt hình  
**B. câu hỏi:**  results Quay lạihọthị giácthay đổidạng kết hợp tinh tế(đã sử dụng I-001 mang lại sự nhẹ nhõm)  
**C. thay đổi biến thể của:** giữ;hành vi premium tham khảođầu  
**D. premium biến thể của:** là chỉ theo sau bởi danh từ(tham khảoChuẩn)

### zone.html(study / practice / mock)

**A. giữ:** mục lụcthẻ,catalog-search,zone accent  
**B. câu hỏi:** page-head  dashboard  eyebrow đặt tênkhông7-Eleven chuỗi cửa hàng tiện lợi(`minimal-eyebrow` vs `dash-premium-eyebrow`)  
**C. thay đổi biến thể của:** P2 7-Eleven chuỗi cửa hàng tiện lợi eyebrow class;tạm thời không xé mở JS  
**D. premium biến thể của:** là chỉ theo sau bởi danh từ

### login.html / register.html

**A. giữ:** auth-aside  navy thay đổi dần dầnmột bên hàng rào,họ hàng ràosắp xếp  
**B. câu hỏi:** auth-card nghĩa đen và nghĩa bóng bóngnghiêng cũ;input focus không có ring;không có Inter  
**C. thay đổi biến thể của:** I-002 — style.css `.auth-card` border + input `:focus-visible`  
**D. premium biến thể của:** phủ định(một bên hàng rào đãđủtên thương hiệubiến thể của)

### exam.html

**A. giữ:** ngâm exam-shell,biến thể của nhỏlàm phiền  
**B. câu hỏi:** `--brand-*`  exam-shell một phầnbiến số toánchưahoàn chỉnhcăn chỉnh  
**C. thay đổi biến thể của:** P2 exam-shell.css token chiếu vào  
**D. premium biến thể của:** phủ định

### teacher.html / teacher-calendar.html

**A. giữ:**  dashboard nhất quán premium topbar  
**B. câu hỏi:** teacher-search tồn tại hẹp loại bỏngắt dòng văn bản  
**C. thay đổi biến thể của:** P2 flex-wrap điều chỉnh tinh vi  
**D. premium biến thể của:** là chỉ theo sau bởi danh từ

### results.html

**A. giữ:** results-hero thống kê,timeline band  
**B. câu hỏi:** sự thiếu page-premium;trống khôngtình trạngyếu;mobile hero đã stack nhưng empty vẫn plain  
**C. thay đổi biến thể của:** I-001 premium biến thể của · I-004 trống khôngtình trạngthẻ  
**D. premium biến thể của:** **họ Ưng làm với tư cách là chỉ theo sau bởi danh từ**(I-001 đãthực hiện)

---

## Implementation Tasks(lô đầu tiên)

| ID | Mục tiêu | quy mô | tiêu chuẩntài liệu |
|----|------|------|----------|
| I-001 | results.html premium biến thể của | nhỏ | [tasks/I-001-results-premium.md](tasks/I-001-results-premium.md) |
| I-002 | auth biểu mẫu tài liệu focus + card | nhỏ | [tasks/I-002-auth-polish.md](tasks/I-002-auth-polish.md) |
| I-003 | mobile-tabs kính mờ | nhỏ | [tasks/I-003-mobile-tabs.md](tasks/I-003-mobile-tabs.md) |
| I-004 | results trống khôngtình trạng | nhỏ | [tasks/I-004-results-empty.md](tasks/I-004-results-empty.md) |
| I-005 | page-premium focus-visible | nhỏ | [tasks/I-005-focus-rings.md](tasks/I-005-focus-rings.md) |

---

## Đã hoàn thànhđạt được(Cursor 2026-07-22)

- **I-001:** `results.html` tăng Inter,`dashboard-premium.css`,`body.page-premium`
- **I-002:** `style.css` auth-card bên khung ví dụ: khung cửa/nghĩa đen và nghĩa bóng bóng;auth input `:focus-visible` ring
- **I-003:** `style.css` `.mobile-tabs` backdrop + active bối cảnh
- **I-004:** `dashboard-premium.css` `.page-premium .results-empty` thẻloại
- **I-005:** `dashboard-premium.css` mở rộng `:focus-visible` đến btn / nav / minimal-nav

Kimi xuốngvòng hoặc giai đoạn đầu tiên của trận đấumời dấu phẩy WORKLOG + hình thức kết hợp gốc khớp,dùng trong I-006+(Gợi ý:profile/vocab premium di cư,zone eyebrow 7-Eleven chuỗi cửa hàng tiện lợi).
