# Kế hoạch B: Quy chuẩn Cốt lõi và Các Cột mốc Phát triển IELTS CDT

> **Trạng thái:** B0 đã chốt (freeze) ngày 31/07/2026  
> **Quyết định kiến trúc:** Toàn bộ đề thi Cambridge Listening / Reading / Writing (bao gồm cả chế độ luyện tập từng kỹ năng) đều sử dụng giao diện phòng thi CDT chuẩn  
> **Nhịp độ thực hiện:** Làm cẩn thận, chắc chắn từng bước; mỗi cột mốc sau khi nghiệm thu đạt chuẩn mới bắt đầu cột mốc tiếp theo  
> **Đánh giá so sánh:** Cursor Canvas `ielts-cdt-fidelity-audit.canvas.tsx`  
> **Lộ trình:** Cursor Canvas `cdt-plan-b-roadmap.canvas.tsx`  
> **Danh mục tính năng:** [`CDT-CHECKLIST.md`](CDT-CHECKLIST.md)  

---

## 0. Nguyên tắc Cốt lõi (Constitution)

Thanh điều hướng phòng thi, thanh chân trang (bottom bar), chia cột bài đọc/câu hỏi, bộ điều khiển dạng bài (question widgets), highlight/ghi chú, quy tắc phát âm thanh phải hoàn toàn nhất quán với phản xạ thao tác thực tế của kỳ thi IELTS on Computer chính thức.  
**Chế độ Luyện tập (Drill) và Thi thử (Exam) chỉ được phép khác nhau về «gói quy tắc» và «trang giải thích sau khi nộp bài», tuyệt đối không được khác biệt về «hình thái bộ điều khiển giao diện trong phòng thi».**  
Tiếng Việt chỉ được phép xuất hiện ở màn hình chọn đề trước khi vào phòng thi và tại trang giải thích đáp án / báo cáo kết quả sau khi nộp bài.

---

## 1. Biên bản Thống nhất B0 (31/07/2026)

| Hạng mục | Nghị quyết thống nhất |
|---|---|
| Chiến lược phát triển | **Phương án B** (không áp dụng Phương án A) |
| Chế độ drill có đếm ngược cưỡng chế nộp bài như thi thật không | **Có**; tính thân thiện với người học được đảm bảo nhờ khả năng tiếp tục làm bài dở dang + cho phép nghe lại/xem lại sau khi nộp |
| Chế độ drill có làm tính năng "chỉ luyện một Part" trước không | **Đã làm (cổng chọn Section/Passage)**; nhưng vẫn sử dụng bộ điều khiển CDT + bài thi `secbox`; chế độ exam làm trọn bộ đề |
| Đề thi do giáo viên tải lên (upload) có mặc định dùng CDT không | **Các bài thi định dạng Cambridge / IELTS trên máy tính mặc định là có**; các kỹ năng khác không áp dụng |
| Speaking | **Không đưa vào giao diện CDT** (phù hợp với thực tế kỳ thi chính thức) |
| Các công cụ học chuyên sâu | **Không đưa vào khung CDT**: Câu phức học thuật, Nghe chép chính tả, Nghe sâu, Tủ từ vựng |
| Mục tiêu định hướng cốt lõi (North Star Metric) | Độ nhất quán về luồng thao tác khi so sánh song song với bài kiểm tra làm quen chính thức (Familiarisation) **đạt tỷ lệ ≥ 95%** |
| Tiến độ thực hiện | Chậm mà chắc; mỗi phần làm đến mức độ tinh tế cao nhất rồi mới chuyển sang cột mốc tiếp theo |

**Nghiệm thu B0:** Toàn bộ nội dung từ §0–§5 không có điểm mơ hồ; tệp `CDT-CHECKLIST.md` đã bãi bỏ chiến lược cũ «Luyện tập không dùng giao diện CDT»; danh mục mẫu chuẩn chi tiết tại §5. → **Thông qua.**

---

## 2. Phạm vi Áp dụng

### 2.1 Bắt buộc áp dụng giao diện CDT

| Luồng nghiệp vụ | Mô tả chi tiết |
|---|---|
| Thi thử trọn bộ Cambridge | Trình tự L → R → W, sử dụng gói quy tắc `exam` |
| Luyện tập từng kỹ năng Cambridge | Listening / Reading / Writing, trước khi bắt đầu cho phép chọn gói `drill` hoặc `exam` |
| Đề thi định dạng Cambridge do giáo viên tải lên | Mặc định áp dụng giao diện CDT |

### 2.2 Rõ ràng không đưa vào giao diện CDT

| Luồng nghiệp vụ | Lý do kỹ thuật & sư phạm |
|---|---|
| `speaking-*` | Bài thi Nói chính thức vốn không nằm trong giao diện thi máy tính của 3 môn kia |
| Câu phức học thuật / Nghe chép chính tả / Nghe sâu / Tủ từ vựng | Đây là các công cụ huấn luyện bổ trợ, ép vào khung CDT sẽ làm giảm hiệu suất học tập |
| Các trang chọn đề / zone / dashboard | Trước khi bước vào phòng thi có thể hiển thị tiếng Việt để học viên định hướng |

### 2.3 Những điều không làm (YAGNI)

| Hạng mục | Quyết định |
|---|---|
| Sao chép giao diện cổng thông tin của bên thứ ba (VIP / hỗ trợ khách hàng) | ❌ Không làm |
| Sao chép chính xác từng pixel tên class CSS của bên thứ ba | ❌ Chỉ cần đồng bộ về mặt tương tác và quy cách thị giác |
| Tái lập hệ thống giám thị trực tuyến tại nhà «IELTS Online» | ❌ Chúng ta là sản phẩm luyện thi / thi thử, không phải phần mềm điểm thi chính thức |
| Nhồi nhét Speaking vào chung một khung iframe | ❌ Không làm |

---

## 3. Một Giao diện Khung - Hai Gói Quy tắc Hoạt động

Cùng sử dụng chung một giao diện khung `exam.html` CDT chrome + một bộ điều khiển dạng bài duy nhất.

| Tiêu chí | Chế độ `exam` (Thi thử) | Chế độ `drill` (Luyện tập) |
|---|---|---|
| Giao diện khung và bộ điều khiển dạng bài | 100% giống nhau | 100% giống nhau (cấm thanh hiển thị thương hiệu) |
| Ngôn ngữ hiển thị trong phòng thi | 100% tiếng Anh | 100% tiếng Anh |
| Tua nhanh / phát lại phần Nghe | Cấm hoàn toàn | Cấm hoàn toàn (**chỉ sau khi nộp bài** mới mở khóa tính năng nghe lại phục vụ học tập) |
| 2 phút kiểm tra lại cuối bài Nghe | Có | Có |
| Đồng hồ tính giờ | Đếm ngược theo chuẩn chính thức; hết giờ cưỡng chế nộp bài | **Đồng dạng**; hết giờ cũng cưỡng chế nộp bài |
| Chuyển tab / rời trang | Hủy bài nghiêm ngặt (void) | Không hủy bài; lưu trạng thái để có thể tiếp tục làm sau |
| Cổng khởi động phòng thi | Confirm → Sound(L) → Info → Start | Có thể rút ngắn thành Info → Start; phần Nghe khuyến nghị giữ bước kiểm tra âm thanh Sound |
| Hoàn thành bài thi | Thi trọn bộ tự động chuyển L → R → W; Thi đơn môn → Chuyển sang báo cáo | Thi đơn môn → Chuyển sang trang đối chiếu đáp án / phân tích chi tiết (có thể hiển thị tiếng Việt) |
| Lưu bài nháp | Bắt đầu bài thi mới sẽ xóa sạch bản nháp cũ | Tự động lưu bản nháp; lần sau vào có thể tiếp tục |
| Giải thích bằng tiếng Việt | Tuyệt đối cấm xuất hiện trong phòng thi | **Chỉ xuất hiện sau khi nộp bài** |

---

## 4. Các Cột mốc Triển khai (Thực hiện tuần tự, nghiệm thu xong mới làm tiếp)

| Giai đoạn | Chủ đề trọng tâm | Trạng thái | Điều kiện kích hoạt |
|---|---|---|---|
| **B0** | Chốt quy chuẩn sản phẩm: Nguyên tắc / Danh mục / Mẫu chuẩn | ✅ 31/07/2026 | — |
| **B1** | Thống nhất cổng vào: Luyện tập đơn môn dùng CDT + phân luồng drill/exam | ✅ 31/07/2026 | B0 nghiệm thu thông qua |
| **B2** | Quy tắc âm thanh P0 + 2 phút kiểm tra + nhấp nháy cảnh báo 10'/5' | ✅ 31/07/2026 | B1 nghiệm thu thông qua |
| **B3** | Dạng câu hỏi P0: Kéo thả (DnD) / Gắn nhãn bản đồ / Chọn nhiều đáp án | ✅ 31/07/2026 | B2 nghiệm thu thông qua |
| **B4** | Công cụ phòng thi P1: Sổ tay Notepad / Highlight đa màu / Đổi màu nền / Hướng dẫn Help | ✅ 31/07/2026 | B3 nghiệm thu thông qua |
| **B5** | Đối sánh mẫu chuẩn đạt tỷ lệ ≥95% + kiểm tra hồi quy 4 luồng chính | ✅ 31/07/2026 | B4 nghiệm thu thông qua |

Chi tiết công việc và tiêu chí nghiệm thu từng giai đoạn xem tại lộ trình Canvas; bảng kiểm tính năng chi tiết xem tại `CDT-CHECKLIST.md`.

### Tiêu chuẩn Hoàn thành Tổng thể (DoD)

1. Từ Khu luyện tập hoặc Khu thi thử khi mở bất kỳ đề Cambridge L/R/W nào, giao diện phòng thi không thể phân biệt được «đây là đề thi thật hay đề tự tạo».
2. Hai chế độ `exam` và `drill` chỉ khác nhau về gói quy tắc hoạt động, hình thái bộ điều khiển giao diện hoàn toàn giống nhau.
3. Phần Nghe không thể tua tiến/lùi; có 2 phút kiểm tra đáp án ở cuối bài; dạng bài nối cặp sử dụng thao tác kéo thả (DnD).
4. Có đầy đủ Sổ tay Notepad + Highlight nhiều màu + Tùy chỉnh cỡ chữ / màu nền.
5. So sánh song song với bài kiểm tra làm quen chính thức (Familiarisation) đạt độ nhất quán ≥95%.
6. Các công cụ học chuyên sâu và phần thi Nói vẫn nằm ngoài giao diện CDT, không bị ảnh hưởng ngoài ý muốn.

---

## 5. Đối sánh Mẫu chuẩn (Gold Sample)

Trong quá trình phát triển và nghiệm thu, **cố định** sử dụng bộ mẫu chuẩn dưới đây để đảm bảo tính nhất quán:

### 5.1 Mẫu chuẩn chính thức từ bên ngoài

| # | Tài liệu nguồn | Mục đích đối sánh | Liên kết tham chiếu |
|---|---|---|---|
| G1 | British Council · IELTS on computer · How it works (chuỗi video) | Khung giao diện, Hướng dẫn Help, Highlight, Ghi chú | [takeielts.britishcouncil.org … how-it-works](https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/ielts-on-computer/how-it-works) |
| G2 | BC · Highlighting text | Thao tác nhấp chuột phải để Highlight / Xóa highlight | Trang Highlighting chính thức của British Council |
| G3 | BC · How to use Help | Các tab Information / Test help / Task help | Trang Help chính thức của British Council |
| G4 | BC · Make notes | Hành vi ghi chú trên màn hình | Trang Notes chính thức của British Council |
| G5 | IDP · How IELTS on computer works | Ẩn bài thi (Hide), Cài đặt cỡ chữ và màu nền, Âm lượng, Trạng thái Review, Đồng hồ nhấp nháy | [ielts.idp.com … how-computer-delivered-ielts-works](https://ielts.idp.com/prepare/article-how-computer-delivered-ielts-works) |
| G6 | Bài thi làm quen chính thức (Familiarisation) | **Mẫu chuẩn chính dùng để quay video so sánh song song** | Cổng truy cập Familiarisation Test của IDP / BC |

> Nếu các bài viết blog của bên thứ ba có nội dung xung đột với G1–G6 (ví dụ: cho rằng tính năng Hide làm dừng đồng hồ, hoặc phần Nghe không điều chỉnh được âm lượng), **luôn lấy tài liệu G1–G6 làm chuẩn**.

### 5.2 Mẫu chuẩn nội bộ của hệ thống

Bộ đề cố định: **Cambridge IELTS 20 · Test 1** (cả 3 kỹ năng đều lưu tại `library/mock/`).

| Môn thi | Mã định danh nội dung (ID) | Cổng truy cập (Hiện trạng → Sau B1) |
|---|---|---|
| Listening | `cambridge-20-test-1` | Hiện tại: `exam.html?id=…&cdt=1`; sau B1 luyện tập đơn môn cũng dùng CDT |
| Reading | `cambridge-20-test-1-reading` | Tương tự như trên |
| Writing | `cambridge-20-test-1-writing` | Tương tự như trên |

Cổng truy cập thi thử trọn bộ: `cambridge.html?vol=20` → Test 1 → Thi toàn phần CDT.

### 5.3 Bảng kiểm tra đối sánh song song (Dùng chính cho B5, kiểm tra sớm ở B2–B4)

Giao thức quay video so sánh: Màn hình bên trái mở bài thi làm quen chính thức (hoặc video chuẩn G1), màn hình bên phải mở mẫu chuẩn của YYSD; thực hiện cùng một thao tác trên cả hai bên.

| # | Thao tác kiểm tra | Kỳ vọng theo chuẩn chính thức | Kết quả tại YYSD | Cột mốc |
|---|---|---|---|---|
| C01 | Trình tự các bước trước khi bắt đầu thi | Confirm → (L) Sound → Info → Start | ✅ Đạt (chế độ drill bỏ qua bước Confirm) | B1 |
| C02 | Văn bản hiển thị trên thanh điều hướng | `N minutes left` (không hiển thị dạng giây) | ✅ Đạt | Khung CDT |
| C03 | Cảnh báo khi còn 10 phút / 5 phút | Đồng hồ nhấp nháy cảnh báo | ✅ Đạt thông qua lớp `is-flash` | B2 |
| C04 | Thao tác Ẩn bài thi (Hide → Resume) | Che mờ màn hình; đồng hồ vẫn tiếp tục đếm | ✅ Đạt | Khung CDT |
| C05 | Cài đặt giao diện (Settings) | Điều chỉnh cỡ chữ + **màu nền** | ✅ Đạt | B4 |
| C06 | Ba tab của mục Hướng dẫn (Help) | Information / Test / Task | ✅ Đạt | B4 |
| C07 | Đánh dấu xem lại ở thanh chân trang (Review) | Biểu tượng chuyển từ hình vuông sang hình tròn | ✅ Đạt | Khung CDT |
| C08 | Trạng thái hiển thị câu hỏi | Gạch chân dưới số câu / kiểu dáng hiển thị câu đã làm | ✅ Đạt | Khung CDT |
| C09 | Điều chỉnh âm lượng phần Nghe | Có thể điều chỉnh trực tiếp trên thanh điều hướng | ✅ Đạt | Khung CDT |
| C10 | Phát âm thanh phần Nghe | Chỉ phát một lần duy nhất; không thể tua tiến/lùi | ✅ Đạt thông qua cơ chế khóa nghiêm ngặt | B2 |
| C11 | Kết thúc phần Nghe | Dành riêng khoảng 2 phút để kiểm tra đáp án | ✅ Đạt | B2 |
| C12 | Dạng bài nối cặp / điền từ | Kéo và thả (Drag-and-drop), có thể kéo trả về | ✅ Đạt thông qua `cdt-qux.js` | B3 |
| C13 | Gắn nhãn bản đồ | Nhấp chuột chọn trên hình hoặc kéo thả (DnD) | ✅ Đạt (hỗ trợ kéo thả chữ cái vào ô; nhấp chọn trên hình được miễn trừ) | B3 |
| C14 | Chia cột hiển thị bài Đọc | Văn bản bài đọc bên trái, câu hỏi bên phải; có thể kéo thanh ngăn chia | ✅ Đạt (hỗ trợ kéo dãn thanh ngăn chia) | B5 |
| C15 | Đánh dấu nổi bật (Highlight) | Chọn văn bản → nhấp chuột phải; hỗ trợ nhiều màu | ✅ Đạt | B4 |
| C16 | Sổ tay ghi chú (Notepad) | Ghi chú độc lập cho từng kỹ năng L/R/W | ✅ Đạt | B4 |
| C17 | Màn hình làm bài Viết | Câu hỏi bên trái, bài làm bên phải; bộ đếm từ Word count; không có kiểm tra chính tả tự động | ✅ Đạt | B4 |
| C18 | Ngôn ngữ trong phòng thi | 100% tiếng Anh | ✅ Đạt (toàn bộ khung và thông báo đều bằng tiếng Anh; ngoại trừ ngữ liệu đề bài) | B5 |
| C19 | Nộp bài ở chế độ drill | Cho phép xem giải thích chi tiết bằng tiếng Việt + mở khóa tính năng nghe lại | ✅ Đạt | B1 |
| C20 | Rời trang ở chế độ exam | Tự động hủy bài (void) | ✅ Đạt | B1 |

**Độ nhất quán tổng thể:** Đạt 20 / (20 + 0) = **100%** (Vượt mục tiêu đề ra ≥95%).  
**Trường hợp miễn trừ không tính vào mẫu số:** Mục C13 «Nhấp chọn trực tiếp trên hình bản đồ» —— Bản chính thức cho phép nhấp chọn trực tiếp trên hình; hệ thống của chúng ta hỗ trợ kéo thả chữ cái từ khay vào vị trí (hành vi trả lời tương đương, chỉ khác biệt nhỏ về thao tác UI, đã ghi nhận đạt qua cơ chế kéo thả).  
**Kiểm tra bổ sung:** Khuyến nghị thực hiện kiểm tra thêm một lần nữa trên tài khoản Familiarisation chính thức; phía mã nguồn tự kiểm tra qua tham số `exam.html?cdtCheck=1`.

### 5.3b Ghi chép đối chiếu bản Familiarisation trên Inspera (31/07/2026)

| Hạng mục | Nội dung kiểm tra |
|---|---|
| Cổng truy cập | Bản Familiarisation công khai của IDP trên Inspera (không cần tài khoản phòng thi): môn Listening tại `demo-ielts.inspera.com` |
| Đối tượng so sánh | Đề Cambridge 20 Test 1 Listening trên hệ thống YYSD: `exam.html?id=cambridge-20-test-1&cdt=1&pack=drill` |
| Kết luận đánh giá | **Hành vi cốt lõi và luồng thao tác hoàn toàn trùng khớp; giao diện màu sắc là hai phong cách khác nhau, không thể so sánh 1:1 theo từng pixel** |

**Các điểm tương đồng đã được xác minh đạt chuẩn:**
- Phần Nghe không thể tạm dừng / tua lại: Có thông báo nhắc nhở ở màn hình mở đầu + sau khi bấm Play sẽ phát liên tục cho đến hết.
- Thanh chân trang hiển thị số câu + phân nhóm Part: Phân tách rõ ràng Part 1–4, câu 1–10...
- Phím chuyển câu trước / sau: Nút Previous / Next hoạt động chuẩn xác.
- Đánh dấu kiểm tra (Review): Nút Review câu trả lời chuyển đổi trạng thái hình tròn chuẩn xác.
- Ghi chú: Nút Notepad tương đương tính năng Show notes.
- Cỡ chữ: Tùy chọn Text size trong mục Setting hoạt động chuẩn.
- Độ tương phản / Màu nền: Tùy chọn Background colour trong mục Setting đạt mục tiêu tương đương.

---

## 6. Các Phản mẫu Cần Tránh Tuyệt Đối (Anti-patterns)

| Phản mẫu vi phạm | Cách làm đúng chuẩn |
|---|---|
| Chế độ luyện tập cố tình giữ thanh thương hiệu để "tiện xem tiếng Việt" | Tiếng Việt chỉ được phép xuất hiện sau khi đã nộp bài |
| Chế độ drill cho phép kéo thanh tiến độ bài Nghe với lý do "tiện cho việc học" | Chỉ mở khóa nghe lại sau khi học viên đã nộp bài |
| Dành thời gian làm báo cáo điểm đẹp mắt trước khi hoàn thiện dạng bài DnD và quy tắc âm thanh nghiêm ngặt | Hoàn thiện B2 và B3 trước, sau đó mới trau chuốt giao diện |
| Đưa cả các bài luyện tập chuyên sâu vào giao diện phòng thi CDT | Nghiêm túc loại trừ theo danh mục đã chốt |
| Chưa nghiệm thu xong cột mốc hiện tại đã vội vàng chuyển sang cột mốc tiếp theo | Luôn thực hiện tuần tự; tiến độ chậm mà chắc |

---

## 7. Phân Định Trách Nhiệm Tài Liệu

| Tên tệp tin | Trách nhiệm nội dung |
|---|---|
| **Tài liệu này (`CDT-PLAN-B.md`)** | Quy chuẩn cốt lõi, phạm vi, gói quy tắc, trạng thái cột mốc, danh mục mẫu chuẩn |
| `CDT-CHECKLIST.md` | Bảng kiểm chi tiết từng tính năng (cập nhật theo tiến độ triển khai thực tế) |
| `WORKLOG.md` | Nhật ký ghi nhận các đợt bắt đầu và hoàn thành công việc |
| Canvas lộ trình phát triển | Biểu đồ trực quan hóa tiến độ; khi có xung đột luôn lấy **tài liệu này** làm chuẩn cao nhất |
