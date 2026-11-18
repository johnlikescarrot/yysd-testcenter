# Báo cáo Phân tích Đối chiếu: wofo TOEFL iBT vs YYSD TOEFL iBT

Phiên bản v1.2 (Bản mục lục tra cứu) | Ngày 20/10/2026 | Tác giả: Qoder  
Trạng thái: **Chờ lựa chọn các hạng mục cần phân tích chuyên sâu**. Bản này chỉ cung cấp bảng chấm điểm (scorecard) + danh mục vấn đề tra cứu, chưa triển khai chi tiết phương án và khối lượng công việc.  
Thay đổi trong v1.1: Bổ sung **P-56 ~ P-62** sau khi rà soát tự động và chạy lệnh grep/curl từng đầu mục, đính chính phạm vi giải thích đáp án CW (§4.1 Đính chính 1).  
Thay đổi trong v1.2: **Tự bác bỏ nhận định sai đối với P-56** —— nhận định "Thi thử toàn phần phần Writing chắc chắn sẽ bị sập (crash)" không chính xác, hạ cấp xuống mức nhánh mã không thể chạm tới + cơ chế màn hình nghỉ giữa 3 môn chưa thống nhất (§4.1 Đính chính 2). **Hệ thống trên production không gặp sự cố dừng hoạt động nghiêm trọng.**

---

## §0 Kết luận tổng quan

**Đánh giá chung: Về mặt giao diện, chúng ta vừa bắt kịp đối thủ; nhưng về mặt sản phẩm tổng thể, chúng ta vẫn còn một khoảng cách đáng kể.**  
Wofo là một nền tảng học tập toàn diện kết hợp: «Thi thử + Kho nội dung + AI chấm chữa & luyện tập + Danh mục từ vựng + Điểm danh streak + Khóa học trả phí + Định hướng hồ sơ du học»; trong khi đó hệ thống của chúng ta hiện tại mới chỉ là «một bộ công cụ thi thử được thiết kế giao diện rất giống kỳ thi thật + một ngân hàng đề thi mà học viên chưa tiếp cận được đầy đủ». Khoảng cách lớn nhất không nằm ở giao diện (UI), mà nằm ở 3 vấn đề cốt lõi mà chúng ta **đã có sẵn dữ liệu trong tay nhưng chưa đóng gói thành sản phẩm**: dữ liệu học viên chưa được đồng bộ lên đám mây, Sổ từ vựng / Nhật ký luyện tập chỉ mới là trang giữ chỗ (soon.html), và kho ngân hàng đề thi còn thiếu diện rộng phần giải thích đáp án chi tiết cũng như tệp âm thanh audio.

**Đính chính thông tin báo sai trong bản v1.1** (xem chi tiết tại §4.1 Đính chính 2): Trước đây từng nhận định "Thi thử toàn phần chắc chắn sẽ bị sập ở kỹ năng Writing", nhưng qua kiểm thử thực tế đã chứng minh nhận định này là sai —— màn hình nghỉ của phần Writing sử dụng nút Continue ngay trên màn hình, trong khi thanh điều hướng phía dưới ở trạng thái vô hiệu hóa (disabled), do đó dòng mã tham chiếu đến biến chưa khai báo hiện tại **hoàn toàn không bị kích hoạt khi người dùng thao tác**. Vấn đề thực tế được hạ cấp thành: cơ chế màn hình nghỉ giữa 3 môn chưa thống nhất + phần Writing chứa một nhánh mã không thể chạm tới (P-56). **Kết luận: Không có lỗi nghiêm trọng gây sập hệ thống trên môi trường production, không cần lo lắng về sự cố dừng dịch vụ.**

### Bảng chấm điểm năng lực (14 tiêu chí đối sánh)

| # | Tiêu chí đánh giá | wofo | YYSD | Nguyên nhân cốt lõi tạo ra khoảng cách |
|---|---|---|---|---|
| 1 | Mức độ hoàn thiện hệ sinh thái sản phẩm | 5 | 2 | Chúng ta là công cụ thi thử đơn thuần, đối thủ là nền tảng học tập toàn diện |
| 2 | Quy mô nội dung thi thử | 5 (Trang chủ hiển thị 40 bộ, từng có mock-50) | 2 (Mã nguồn mới chỉ liệt kê set-1…set-10) | Năng lực sản xuất và đóng gói nội dung vào gói thành viên, không phải vấn đề UI |
| 3 | Mức độ tái lập chân thực giao diện thi | 5 | 4.5 | Sau khi tinh chỉnh đã rất sát với thực tế; chỉ còn thiếu một vài chi tiết nhỏ (§3) |
| 4 | Điểm số và Xem lại bài thi sau khi nộp (Review) | 4.5 | 4 | Cấu trúc đã đạt tương đương 1:1, chênh lệch ở chú giải màu sắc / chi tiết theo module / chẩn đoán năng lực |
| 5 | Tỷ lệ bao phủ giải thích đáp án chi tiết | 5 | 1 | **Phần giải thích từng ô trống cho dạng CW ở cả 3 nguồn set / free / bank đều là 0**; tỷ lệ bao phủ tổng thể của bank chỉ đạt 16.9% |
| 6 | Chẩn đoán năng lực và Cá nhân hóa (Sổ từ vựng / Từ sai / Danh mục từ) | 4.5 | 1 | Dữ liệu lưu tại localStorage, trang hiển thị vẫn trỏ về soon.html |
| 7 | Năng lực AI (Chấm chữa / Luyện tập kèm cặp / Trợ giảng ảo) | 5 | 0 | Quyết định kiến trúc ⑥⑧ chủ động chưa làm → cần thảo luận lại |
| 8 | Động lực học tập và Giữ chân người dùng (Điểm danh / Nhiệm vụ / Điểm tích lũy) | 4 | 2 | Chúng ta đã có Chuỗi ngày học (Daily Streak), nhưng chưa có hệ thống nhiệm vụ bài bản |
| 9 | Dữ liệu học viên tích lũy (Đồng bộ đa thiết bị / Giáo viên theo dõi được) | 5 | 1 | Kết quả nộp bài chưa đồng bộ lên đám mây, đổi thiết bị sẽ bị mất lịch sử |
| 10 | Tạm dừng và tiếp tục thi dở dang | 5 ("Đang làm dở → Tiếp tục thi") | 1 | Chỉ có hàm markLeave cục bộ, chưa hỗ trợ tiếp tục thi thông qua máy chủ |
| 11 | Quản lý giáo vụ và Vận hành nội dung | Không thu thập chứng cứ (chỉ tự đánh giá nội bộ) | 3 | Trang quản trị dùng được nhưng chưa có quản lý phiên bản và khả năng rollback nội dung |
| 12 | Thương mại hóa (Đơn hàng / Quyền lợi / Bảng giá) | 5 | 2 | Chúng ta đã có quản lý chỗ ngồi / Mã kích hoạt, nhưng chưa có quy trình mua sắm khép kín phía học viên |
| 13 | Trải nghiệm trên thiết bị di động và Hiệu năng | Chưa kiểm thử | Chưa kiểm thử | Chưa thực hiện kiểm thử trong đợt này (§I) |
| 14 | Bảo mật và Kiểm soát phân quyền | Chưa kiểm thử | 2 | Tham số preview/id có thể vượt quyền truy cập, các tệp JSON đề thi thật chưa có kiểm soát phân quyền |

---

## §1 Phương pháp thu thập dữ liệu và Cấp độ chứng cứ

- `[Kiểm thử thực tế]`: Trực tiếp thao tác trên trình duyệt Chrome và kiểm tra DOM / ảnh chụp màn hình. Phía wofo sử dụng tài khoản jackman (tận dụng lại các trang xem lại bài thi có sẵn); phía chúng ta kiểm tra trên youyisida.com/app (tài khoản Wanli).
- `[Mã nguồn]`: Vị trí tệp và dòng mã cụ thể (`file:line`) hoặc số liệu thống kê trực tiếp từ kịch bản kiểm tra.
- `[Suy đoán]`: Nhận định dựa trên thông lệ ngành, không dùng làm căn cứ kết luận chính thức.
- Phía trang quản trị của wofo không thu thập dữ liệu (theo yêu cầu: các chức năng giáo vụ chỉ tự đánh giá nội bộ).

---

## §2 Chênh lệch kiến trúc: Đối thủ là nền tảng, chúng ta là công cụ

Cấu trúc cổng truy cập cấp 1 của wofo TOEFL `[Kiểm thử thực tế]`: `/toefl` tổng quan, `/toefl/mock` thi thử, `/toefl/courses` khóa học, `/my-exams` bài thi của tôi, `/my-courses` khóa học của tôi, `/messages` tin nhắn thông báo, `/wallet` ví tiền & đơn hàng, `/me` cài đặt cá nhân, `/typing/toefl` luyện gõ phím, Sổ từ vựng (chuyển đổi trong /my-exams), Trợ giảng ảo AI (hiển thị cố định trên thanh điều hướng toàn trang).  
Ngoài ra, đối thủ còn có hệ sinh thái sản phẩm tương tự cho IELTS / GRE / GMAT / SAT / ACT + mảng tư vấn hồ sơ du học (công cụ chọn trường, trợ lý viết luận, quản lý hồ sơ, đội ngũ cố vấn).

Cấu trúc cổng truy cập cấp 1 của chúng ta `[Kiểm thử thực tế]`: `app/home`, `app/practice`, `app/mock`, `app/profile`, `app/official`, `app/free`, và 4 môn thi `*-lab`.  
Trong đó, tại `app/profile`, cả hai cổng truy cập «Sổ từ vựng» và «Nhật ký luyện tập» đều đang trỏ về `soon.html` (trang giữ chỗ tạm thời) `[Mã nguồn app/soon.html:16]`.

---

## §3 So sánh chu trình thi thử và các điểm chạm tương tác

| Điểm chạm | wofo `[Kiểm thử thực tế]` | YYSD `[Kiểm thử thực tế / Mã nguồn]` | Đánh giá |
|---|---|---|---|
| Màn hình chờ sau khi nộp bài | Generate score report → View | Đã phát hành | Ngang nhau |
| Tab điểm số + Xem lại bài thi trên cùng trang | Điểm tổng / Đọc / Nghe / Viết / Nói | Đã phát hành, môn không thi hiển thị disabled | Ngang nhau |
| Hai thẻ trên bảng điểm | Lần thi hiện tại + Điểm MyBest (lấy điểm cao nhất theo ngày) | Đã phát hành | Ngang nhau |
| Quy đổi điểm số | Thang điểm 1–6 **+ 95+ of 120 + CEFR C1** | Chỉ có thang điểm 1–6 + nhãn dự đoán | Chúng ta còn thiếu |
| Thanh phụ (sub-bar) khi xem lại bài thi | `Reading \| Module 1 · Question 1 of 17` | `Đọc · Question 1 of 10` (không có Module) | Chúng ta còn thiếu |
| Chú giải màu sắc khi xem lại bài thi | «Xanh lá = Trả lời đúng / Đỏ = Trả lời sai / Nét đứt = Chưa điền» hiển thị cố định | Không có chú giải màu sắc | Chúng ta còn thiếu |
| Giải thích chi tiết từng ô trống | Mỗi câu đều có phân tích ngữ pháp / kết hợp từ (collocation) / ngữ cảnh | Đã có khung giao diện, nhưng bộ đề set CW có 0 câu giải thích | Thiếu nội dung |
| Mục lục câu hỏi + Phím Next / Back | Ở góc trên bên phải | Đã phát hành | Ngang nhau |
| Nhảy câu trực tiếp / Đánh dấu nổi bật văn bản | Tất cả các dạng bài đều hỗ trợ | **Chỉ có phần Đọc hỗ trợ** (Nghe và Nói không có, Viết có nhảy câu nhưng không có đánh dấu nổi bật) | Chúng ta còn thiếu, xem P-57 |
| Màn hình nghỉ giữa các module | Thống nhất dùng thanh điều hướng phía dưới | Cả 4 môn đều làm được; nhưng Đọc / Nghe dùng thanh điều hướng dưới, Viết dùng nút trên màn hình, cơ chế chưa đồng nhất | Sử dụng được, xem P-56 |
| Gợi ý liên kết ở chân trang bảng điểm | 4 mục: Hướng dẫn ôn tập / Luyện gõ phím / Trợ giảng AI + Lịch sử điểm / Liên hệ tư vấn | 1 dòng (môn không thi hiển thị --) + nút Lưu bảng điểm | Chúng ta thiếu liên kết gợi ý |
| Lịch sử làm bài | Nhóm theo bộ đề, thống kê Đã hoàn thành / Đang làm dở, hiển thị dạng bài và điểm số, có nút xóa / xóa vĩnh viễn | Đang trỏ về trang giữ chỗ `soon.html` | Chúng ta còn thiếu |
| Tạm dừng và tiếp tục thi dở dang | Đang làm dở → Tiếp tục thi (lưu trạng thái trên Server) | Chưa có | Chúng ta còn thiếu |
| Lưu bảng điểm | Hỗ trợ | Hỗ trợ (In ấn / xuất file PDF) | Ngang nhau (chưa hỗ trợ xuất ảnh PNG) |

---

## §4 Danh mục vấn đề tra cứu (Phân loại theo mức độ ưu tiên)

Quy ước mức độ ưu tiên:  
- **S** = Chi phí thấp, mang lại trải nghiệm cải thiện rõ rệt (ưu tiên làm trước)  
- **M** = Khối lượng triển khai trung bình  
- **L** = Khối lượng triển khai lớn hoặc cần thảo luận lại định hướng  
- **Q** = Sửa chữa chất lượng dữ liệu / nội dung  
- **R** = Rủi ro bảo mật cần xử lý khẩn cấp  

### Nhóm A: Chu trình thi thử và Giao diện (Trong phạm vi, có thể triển khai ngay)

- **P-01** Trang xem lại bài thi thiếu chú giải màu sắc «Xanh lá = Đúng / Đỏ = Sai / Nét đứt = Chưa làm», khiến học viên bỡ ngỡ trong lần đầu sử dụng `[Kiểm thử thực tế wofo]` — **S**
- **P-02** Thanh phụ (sub-bar) thiếu phân cấp Module, thông tin hiển thị ngữ cảnh chưa rõ ràng (đối thủ hiển thị `Module 1 · Question 1 of 17`) `[Kiểm thử thực tế]` — **S**
- **P-03** Bảng điểm hiện chỉ có thang 1–6, còn thiếu thang điểm tổng 0–120 và quy đổi tương đương theo khung CEFR `[Kiểm thử thực tế wofo: 5.0 of 6 / 95+ of 120 / CEFR C1]` — **M**
- **P-04** Chân trang điểm số thiếu các liên kết dẫn dắt hành động (ôn tập kiến thức / luyện kỹ năng còn yếu / xem lịch sử thi) `[Kiểm thử thực tế]` — **S**
- **P-05** Tính năng lưu bảng điểm mới chỉ hỗ trợ in ấn, chưa hỗ trợ xuất ảnh PNG để chia sẻ mạng xã hội `[Mã nguồn]` — **M**
- **P-06** Sau khi nộp bài thi Nói / Viết chưa có màn hình hiển thị điểm số độc lập, trang xem lại bài thi chỉ hiển thị một bài văn mẫu duy nhất; trong trường hợp nhiều nhiệm vụ thì việc so sánh "Bài làm của bạn vs Bài mẫu" trở nên mờ nhạt `[Mã nguồn toefl-writing/speaking.html]` — **S**
- **P-07** Trên trang xem lại bài thi, các phần tử `#done`, `#score-line`, `#pct-line`, `#wrong-preview`, `#back`, `#rep` cùng hàm `handoffApp` đã trở thành mã chết (dead code) còn sót lại trong trang `[Mã nguồn]` — **S**
- **P-08** Xác nhận nộp bài trong giao diện ETS hiển thị «Exit → Submit», diễn đạt dễ khiến học viên nhầm lẫn rằng đây chỉ là thao tác đăng xuất thay vì «Nộp bài và xem điểm» như đối thủ `[Kiểm thử thực tế cả hai bên]` — **S**
- **P-09** Khi hết giờ làm bài, đối thủ hiển thị thông báo trạng thái rất rõ ràng `Reading time has expired.`, trong khi hệ thống của chúng ta chưa có phản hồi tương đương `[Kiểm thử thực tế]` — **S**
- **P-10** Các tab kỹ năng của bài thi tổng hợp phụ thuộc vào bản ghi attempt; tuy nhiên phần Viết và Nói hiện tại hoàn toàn không ghi nhận attempt, dẫn đến việc các tab này trong kịch bản thi đủ 4 kỹ năng luôn bị vô hiệu hóa (hiển thị màu xám) `[Mã nguồn toefl-lab.js logAttempt]` — **M**

### Nhóm A+: Lỗi logic nhánh mã và Sự cố ngắt kết nối (Bổ sung từ v1.1, đã kiểm chứng)

- **P-56** (Đã hạ cấp trong v1.2, nhận định ban đầu "Thi thử toàn phần chắc chắn bị sập" là suy đoán quá mức): **Cơ chế màn hình nghỉ giữa 3 môn chưa thống nhất, phần Writing chứa một nhánh mã không chạm tới**: Phần Đọc `:420` và phần Nghe `:318` sau khi gọi `show(rest)` đều bổ sung thêm `setNav(true)`, giúp nút Continue ở thanh điều hướng dưới có thể nhấp được, nhánh `startModule(pendingNext || 2)` vẫn hoạt động bình thường (cả hai môn đều khai báo biến `pendingNext`); riêng phần Viết sử dụng nút bấm `#rest-go` nằm ngay trên màn hình để chuyển tiếp (`:427`), không gọi `setNav(true)`, nên nút Next ở thanh điều hướng dưới vẫn ở trạng thái disabled → tại `toefl-writing.html:471` có tham chiếu đến biến `pendingNext` **chưa từng được khai báo**, tuy nhiên hiện tại **người dùng không thể nhấp vào nút đó nên không xảy ra lỗi sập trang**; đây là một nhánh mã chết `[Kiểm thử thực tế: show() gọi setNav(el===exam||el===review), biến pendingNext chỉ xuất hiện 4 vị trí trong toàn bộ mã nguồn]` — **S** (Giải pháp: bổ sung khai báo biến hoặc dọn sạch nhánh mã chết; nếu có ai đó chuẩn hóa màn hình nghỉ của phần Viết về dạng thanh điều hướng dưới thì sẽ phát sinh lỗi ReferenceError ngay lập tức).
- **P-57** Tính năng nhảy câu hỏi và đánh dấu nổi bật văn bản chỉ mới có ở phần Đọc: `review-btn` xuất hiện ở Đọc 2 / Viết 2 / Nghe 0 / Nói 0, `ets-hl-pop` xuất hiện ở Đọc 2 / các môn khác 0 `[Kiểm thử thực tế]`. Trong khi đó, đối thủ hỗ trợ nhảy câu và highlight trên mọi dạng bài — **S** (Có thể tái sử dụng logic đã triển khai ở phần Đọc, không cần viết lại từ đầu).
- **P-58** Tính năng lưu yêu thích hoàn toàn không có điểm chạm thao tác: tại `toefl-lab.js:315-316` có gắn sự kiện cho `#fav-task-btn` / `#fav-item-btn` nhưng các nút này không hề tồn tại trong mã HTML; khóa lưu trữ `yysd:toefl-favs` và logic xử lý đã có sẵn, chỉ thiếu nút bấm trên giao diện `[Kiểm thử thực tế]` — **S**
- **P-59** Nút «Export all responses» của phần Nói không bao giờ hiển thị: nút này nằm trong màn hình `#done` (`toefl-speaking.html:72`), trong khi hàm `show()` trên toàn trang chỉ được gọi qua `show(exam)` / `show(rest)` `[Kiểm thử thực tế]` — **S**
- **P-60** Trang quan sát TOEFL trên website chính: hai thẻ trong phần «Lựa chọn phương thức luyện tập» luôn hiển thị trống: tại `zone.js:668-676` cần hai khóa `lab` và `dates`, trong khi `config.js:109-114` của `NAV.toefl` chỉ mới định nghĩa 4 môn thi `[Kiểm thử thực tế]` — **S**
- **P-61** Trang bảng điểm `toefl-score.html` đã được phát hành nhưng **hoàn toàn không có bất kỳ lối vào nào trên giao diện**: lối vào duy nhất gắn trên `#score-report` đã bị vô hiệu hóa, người dùng chỉ có thể truy cập bằng cách gõ trực tiếp URL `[Mã nguồn + Kiểm thử thực tế]` — **S** (có thể xử lý đồng thời cùng trang danh sách trong P-14).
- **P-62** Bản ghi âm phần Nói lưu tại `yysd:app-speak-recs`, nếu vượt quá 5MB sẽ bị âm thầm hủy bỏ (không có thông báo lỗi, không tự động giảm tần số lấy mẫu) `[Mã nguồn toefl-speaking.js:157, phát hiện qua rà soát tự động, cần kiểm chứng độc lập thêm]` — **M · Chờ kiểm chứng thêm**

### Nhóm B: Dữ liệu học viên và Quản lý tài khoản (Trong phạm vi, mang lại giá trị cao nhất)

- **P-11** Toàn bộ bài nộp của phần Thi thử / Gói luyện thi cấp tốc / Đề thi hoàn chỉnh **hoàn toàn chưa được gửi về máy chủ**, điểm số chỉ mới được ghi nhận vào localStorage `[Mã nguồn app/assets/js/tiku-run.js:91-100, assets/js/toefl-full.js:291]` — **M**
- **P-12** Lịch sử thi thử bị giới hạn tối đa 200 bản ghi và chỉ lưu cục bộ trên thiết bị hiện tại `[Mã nguồn assets/js/toefl-lab.js:142-165]` — **M** (giải quyết đồng thời cùng P-11).
- **P-13** Giáo viên không thể theo dõi chi tiết kết quả đúng/sai từng câu trong bài thi máy tính TOEFL của học viên, dẫn đến việc không thể nhận xét bài làm `[Mã nguồn tiku-run.js:79-88 chỉ gửi về điểm tổng hợp]` — **M**
- **P-14** Trang «Nhật ký luyện tập» hiện chỉ là trang giữ chỗ `soon.html`, học viên chưa thể tự xem lại lịch sử điểm số của mình `[Kiểm thử thực tế + Mã nguồn app/soon.html:16]` — **S** (Dữ liệu đã có sẵn trong máy tính, chỉ cần dựng trang danh sách hiển thị).
- **P-15** Dữ liệu của «Sổ từ vựng» đã được tích lũy cục bộ (`yysd:saved-words`) nhưng cổng truy cập trên giao diện vẫn trỏ về trang giữ chỗ `[Kiểm thử thực tế profile.html + localStorage]` — **S**
- **P-16** Chưa hỗ trợ tạm dừng và tiếp tục làm bài thi: giữa chừng đăng xuất đồng nghĩa với việc phải thi lại từ đầu; trong khi đối thủ có tính năng «Đang làm dở → Tiếp tục thi» `[Kiểm thử thực tế]` — **L**
- **P-17** Chưa có trung tâm tin nhắn / thông báo (như `/messages` của đối thủ kèm bộ đếm tin chưa đọc) `[Kiểm thử thực tế]` — **L** (Trong bối cảnh doanh nghiệp có thể thay thế bằng Lark / Zalo / WeChat, cần thảo luận lại).

### Nhóm C: Nội dung bài thi và Lỗ hổng dữ liệu (Xử lý theo đợt / Bổ sung dữ liệu, không sửa code)

- **P-18** Trong 10 bộ đề thi thử dạng set, **phần giải thích từng ô trống của bài Đọc điền từ (CW) hoàn toàn là 0 câu**, mỗi bộ cố định thiếu 10 ô trống → Dạng bài học viên hay luyện tập nhất lại là dạng bài bị thiếu dữ liệu nhiều nhất `[Thống kê mã nguồn]` — **Q**
- **P-19** Tỷ lệ bao phủ giải thích đáp án trong toàn bộ ngân hàng đề thi chỉ đạt **16.9%** (1.331 câu trên tổng số 7.874 bài); trong đó phần Nghe đạt **0/2.187**, phần Viết đạt **0/1.084** `[Thống kê mã nguồn]` — **Q**
- **P-20** Phần giải thích cho môn Nói mặc dù được gắn nhãn 100% nhưng thực chất chỉ là văn bản giữ chỗ theo mẫu (toàn bộ đều dài đúng 21 chữ theo cấu trúc "Xoay quanh câu trả lời «X»"), tương đương với việc chưa có giải thích thực tế `[Thống kê mã nguồn]` — **Q**
- **P-21** **897 tệp âm thanh phần Nói gặp lỗi 404**: Tệp tin nằm tại thư mục `library/toefl/audio/bank-iv|bank-lr/` nhưng chưa được sao chép sang nhánh `app/`, dẫn đến việc đường dẫn bị lệch → Toàn bộ ngân hàng đề Nói không phát được âm thanh `[Thống kê mã nguồn + Kiểm tra thực tế]` — **Q** (Chỉ cần sao chép tệp đồng bộ sang là giải quyết xong).
- **P-22** Tại 103 bài Đọc điền từ của phần `free`, trường `analysis` thực chất chỉ chứa văn bản dịch song ngữ Anh - Việt của cả đoạn văn, chứ không phải giải thích chi tiết cho từng ô trống → Kết luận cũ cho rằng «phần free có giải thích đáp án đầy đủ 100%» là nhận định sai, thực tế giải thích từng ô trống là **0/1.030** `[Thống kê mã nguồn]` — **Q**
- **P-23** Có 277 vị trí có trường `analysis` nhưng giá trị bên trong lại là chuỗi rỗng (bank-we: 102, bank-ad: 87, free email/discussion: 88) → Giao diện sẽ hiển thị khung giải thích trống trơn `[Thống kê mã nguồn]` — **Q**
- **P-24** Tệp `set-58-reading.json` có tồn tại nhưng mã nguồn chỉ liệt kê set-1…set-10 nên học viên không bao giờ làm được đề này; ngoài ra tệp còn thiếu trường `skill`, các ô trống CW bị nhảy số từ 21–35 `[Mã nguồn hit-shell.js:319 + Thống kê]` — **Q**
- **P-25** Tệp `set-58-r1.json` là tệp mồ côi (không có tasks, nội dung trùng lặp hoàn toàn với bài đọc thứ nhất của set-58-reading) `[Thống kê mã nguồn]` — **Q**
- **P-26** Trong 246 bài của `bank-cw-reading.json`, có 6 nhóm tiêu đề trùng tên hoàn toàn (như Crop Rotation, Archaeology, Fungi...), trên trang mục lục tra cứu học viên sẽ không phân biệt được `[Thống kê mã nguồn]` — **Q**
- **P-27** Số lượng bộ đề thi được công bố không nhất quán ở 3 nơi: Trang chủ ghi cứng «15 bộ thi thử toàn phần», mã nguồn thực tế chỉ liệt kê 10 bộ, trang gói luyện thi cấp tốc chỉ có gói 3 ngày `[Kiểm thử thực tế + Mã nguồn hit-shell.js:631]` — **S**
- **P-28** Tỷ lệ bao phủ bản dịch tiếng Việt rất thấp: bank CW đạt 21.5%, RAP đạt 5.5%, các phần RDL / Nghe / Nói / Viết đều đạt 0% (trong khi đối thủ luôn cung cấp tính năng "Hiển thị tiếng Việt" thường trực trên trang xem lại bài) `[Thống kê mã nguồn]` — **Q**

### Nhóm D: Chẩn đoán năng lực, Cá nhân hóa và Ứng dụng AI (Cần thảo luận lại định hướng)

- **P-29** Chưa có tính năng chẩn đoán nguyên nhân lỗi sai: Trang xem lại bài thi của đối thủ cung cấp 3 loại giải thích (Ngữ pháp / Kết hợp từ / Ngữ cảnh) cho từng câu, hệ thống của chúng ta hiện chỉ có danh mục bài đọc đơn thuần, chưa chỉ ra được «bạn đang yếu ở dạng bài nào» `[Kiểm thử thực tế]` — **M**
- **P-30** Chưa có danh mục từ vựng cá nhân hóa (như Word Lab của đối thủ: tự động lọc ra danh sách từ vựng mà học viên chưa thuộc từ các bài Đọc / Nghe đã làm) `[Kiểm thử thực tế]` — **L · Cần thảo luận lại**
- **P-31** Chưa có tính năng AI chấm chữa bài Viết từng câu (đối thủ gạch bỏ từ sai ngay trên bài viết gốc và chèn cách diễn đạt chuẩn xác) `[Kiểm thử thực tế]` — **L · Cần thảo luận lại (Quyết định kiến trúc ⑥)**
- **P-32** Chưa có tính năng AI chấm điểm bài Nói kết hợp so sánh với bản ghi âm và bài mẫu đạt điểm tối đa `[Kiểm thử thực tế]` — **L · Cần thảo luận lại (Quyết định kiến trúc ⑥)**
- **P-33** Chưa có Trợ giảng ảo AI (đối thủ hiển thị lối vào cố định trên toàn trang 24/7 để giải thích câu sai, sửa bài viết, phân tích điểm số) `[Kiểm thử thực tế]` — **L · Cần thảo luận lại**
- **P-34** Chưa có AI đồng hành luyện tập (AI Coach: gợi ý từng bước tư duy trả lời câu hỏi của đề thi thật, giới hạn số lượt sử dụng) `[Kiểm thử thực tế]` — **L · Cần thảo luận lại**
- **P-35** Chưa có tính năng luyện gõ phím chuyên sâu cho bài thi Viết (đối thủ sử dụng các đề thi Viết có tần suất xuất hiện cao trong tháng kết hợp gõ cùng bài mẫu, hiển thị tốc độ gõ WPM / độ chính xác / thời gian / tiến độ + nhật ký luyện tập) —— Đây là một điểm đau thực tế của học viên khi thi máy tính TOEFL iBT, mà chúng ta đã có sẵn ngân hàng đề thi Viết `[Kiểm thử thực tế]` — **M · Khuyến nghị nên bổ sung**
- **P-36** Chưa có các gói luyện tập chuyên đề như «Câu hay sai / Đề thi tần suất cao / Câu hỏi khó» được tổng hợp từ dữ liệu toàn hệ thống `[Kiểm thử thực tế]` — **L**

### Nhóm E: Giữ chân người dùng và Cơ chế thương mại hóa (Cần thảo luận lại)

- **P-37** Hiện chỉ mới có bộ đếm "Số ngày học liên tục", chưa có hệ thống nhiệm vụ hàng ngày theo cấp độ (đối thủ triển khai Day 1 / 2 / 3…, mỗi ngày có các nhiệm vụ nhỏ để duy trì streak) `[Kiểm thử thực tế cả hai bên]` — **M**
- **P-38** Phía học viên chưa có hệ thống điểm thưởng / ví tiền / quản lý đơn hàng, các quyền lợi hiện hoàn toàn dựa vào quản trị viên kích hoạt từ trang quản trị `[Kiểm thử thực tế]` — **L · Cần thảo luận lại**
- **P-39** Chưa có phễu trải nghiệm học thử: đối thủ luôn cung cấp nút "Học thử miễn phí" tại mỗi gói nội dung trả phí `[Kiểm thử thực tế]` — **M · Cần thảo luận lại**

### Nhóm F: Quản lý giáo vụ và Vận hành nội dung (Tự đánh giá nội bộ)

- **P-40** Trang `admin/index.html` chưa phải là một trang quản trị backend thực thụ: chỉ ghép nối liên kết tải lên của GitHub, không có API độc lập, phân quyền người dùng chỉ dựa vào class CSS của giao diện `[Mã nguồn admin/index.html:129-138, 24]` — **M**
- **P-41** Nội dung ngân hàng đề thi chưa được quản lý phiên bản một cách bài bản, chưa hỗ trợ rollback; trên môi trường trực tiếp vẫn còn tồn tại các tệp đề thi chưa được đưa vào git quản lý `[Mã nguồn server/deploy/sync-web.sh:33-45, server/tiku.js:531]` — **M**
- **P-42** Quy trình CI hiện tại chỉ chạy 3 kiểm tra cơ bản, chưa bao gồm kiểm thử tự động cho các bộ đề thi TOEFL mới `[Mã nguồn .github/workflows/build-manifest.yml:44-54]` — **S**
- **P-43** Phân quyền người dùng mới dừng lại ở mức «cả phân khu / cả gói đề», chưa thể kích hoạt linh hoạt theo từng bộ đề / từng lớp / từng kỹ năng riêng biệt `[Mã nguồn admin-perms.html:69-71]` — **M**
- **P-44** Trong mô-đun `tiku` có sẵn kênh dữ liệu giả lập qua tham số `?demo=1`, rất dễ bị nhầm lẫn với dữ liệu thực tế `[Mã nguồn tiku/tiku.js:978-1004]` — **S**
- **P-45** Trung tâm ngân hàng đề thi và giao diện xem lại bài thi máy tính đang dùng hai luồng xử lý riêng biệt, các component xem lại chưa được tái sử dụng đồng nhất (tàn dư từ Quyết định kiến trúc ⑤) `[Mã nguồn]` — **M**

### Nhóm G: Bảo mật và Kiểm soát phân quyền (Đề xuất ưu tiên xử lý khẩn cấp)

- **P-46** Tham số `?preview=1` cho phép bỏ qua bước đăng nhập để truy cập tùy ý vào các trang thi thử trên máy tính `[Mã nguồn app/assets/js/auth.js:134]` — **R**
- **P-47** Tham số `id=` trên URL có thể giúp người dùng vượt qua lớp khóa kiểm tra quyền hạn `[Mã nguồn app/assets/js/access.js:51-52]` — **R**
- **P-48** Thông tin người thuê (tenant) phía client có thể bị giả mạo thông qua tiêu đề `X-Tenant-Slug` hoặc origin, trong khi nhánh app lại ghi cứng giá trị `yysd` `[Mã nguồn server.js:586-598, app/assets/js/auth.js:25]` — **R**
- **P-49** Các tệp JSON đề thi thật nằm dưới tên miền của app không hề có lớp kiểm soát phân quyền; phía website chính lại chỉ dựa vào cookie `yysd_auth` vốn có thể bị giả mạo `[Mã nguồn server/deploy/nginx-app.conf:32-41, nginx-site.conf:30-33]` — **R**
- **P-50** Việc nới lỏng kiểm tra trong `gate.js` thành «chỉ áp dụng bắt buộc trên tên miền của app» vô hình trung đã mở rộng bề mặt tấn công của toàn bộ thư mục `/opt/yysd/app` dưới tên miền chính (bao gồm cả lỗ hổng vượt quyền qua preview của P-46) `[Mã nguồn app/assets/js/gate.js]` — **R**

### Nhóm H: Lệch cấu hình và Thiếu sót mới phát hiện trên môi trường trực tiếp

- **P-51** Tên miền `app.youyisida.com` khi mở trên trình duyệt thông thường sẽ bị chuyển hướng 302 về `youyisida.com/download.html`, khiến người dùng web không thể sử dụng trực tiếp (đòi hỏi phải cài ứng dụng desktop); trong khi đó đường dẫn `/app/*` trên trang web chính lại dùng bình thường → Hai quy tắc tên miền bị mâu thuẫn, gây khó hiểu cho cả học viên và giáo viên `[Kiểm thử thực tế]` — **S**
- **P-52** Tại đường dẫn `/app/profile.html` của trang web chính, mục «Ngân hàng đề thi thật» báo lỗi **Truy vấn thất bại**: API `/api/toefl/access` gọi sang `https://api.youyisida.com`, nhưng gặp lỗi khi chạy dưới origin của trang web chính `[Kiểm thử thực tế + Mã nguồn auth.js:4, hit-shell.js:590-597]` — **M**
- **P-53** Khi có tham số `preview=1`, trang xem lại bài thi bỏ qua bước gọi `YYSD_HIT.mount`, dẫn đến thanh tab không có chỗ gắn vào khiến toàn bộ trang hiển thị trắng trơn (vấn đề này đã được phát hiện và xử lý nóng, nhưng sự phụ thuộc vào khung bao bọc tương tự chưa được loại bỏ triệt để) `[Mã nguồn app/review.html]` — **S**
- **P-54** Con số «15 bộ thi thử toàn phần» trên Trang chủ là văn bản được ghi cứng, không khớp với số lượng đề thi thực tế có thể làm (tương tự P-27) `[Mã nguồn hit-shell.js:631]` — **S**

### Nhóm I: Trải nghiệm di động và Hiệu năng (Cần kiểm thử bổ sung)

- **P-55** Khả năng hiển thị thích ứng (responsive) giữa hệ thống của chúng ta và đối thủ, khả năng tự động phát âm thanh trên trình duyệt Safari của iPhone, kích thước tệp JSON đề thi và tốc độ tải trang đầu tiên —— **đều chưa được kiểm thử thực tế trong đợt này**, tạm thời lưu lại để kiểm tra tiếp theo. — **M**

---

## §4.1 Nhật ký đính chính và loại trừ (Bản v1.1 & v1.2)

**Đính chính 1 | Tỷ lệ bao phủ giải thích từng ô trống dạng CW thực tế còn tệ hơn nhận định ban đầu trong v1.**  
Qua kiểm tra cấu trúc dữ liệu thực tế tại 3 nguồn: tệp `set-N-reading.json` trường `analysis` của dạng bài CW là chuỗi rỗng và không có mảng `blanks`; 246 bài trong `bank-cw-reading.json` cũng hoàn toàn để trống; 103 bài trong `free-*reading.json` trường `analysis` thực chất chỉ chứa **toàn bộ bản dịch song ngữ Anh - Việt của cả đoạn văn** (ví dụ tệp `free-12188` dài 655 ký tự, đoạn tiếng Anh ngay sau đó nối tiếp bản dịch tiếng Việt), chứ không phải là phân tích giải thích cho từng ô trống riêng biệt.  
→ Kết luận: **Nhận định «các bài luyện tập rải rác phần free có giải thích đáp án đầy đủ 100%» là kết luận sai lầm**, trên thực tế phần giải thích chi tiết cho từng ô trống tại cả 3 nguồn set / free / bank **đều là 0**. Dữ liệu ghi nhớ của dự án đã được cập nhật đồng bộ.

**Đính chính 2 | Nhận định "Thi thử toàn phần phần Writing chắc chắn sẽ bị sập" là suy đoán quá mức, đã được chứng minh sai.**  
Nguyên nhân nhận định sai: Khi chạy lệnh grep phát hiện tại `toefl-writing.html:471` có sử dụng biến `pendingNext` chưa được khai báo (phần Đọc và Nghe đều có khai báo, riêng phần Viết thì không), tôi đã vội vàng kết luận "khi nhấp Next trên màn hình nghỉ sẽ lập tức bị sập trang". **Tôi đã không kiểm tra kỹ xem người dùng có thể nhấp được vào nút đó trong thực tế hay không.**  
Sự thật sau khi kiểm tra kỹ lưỡng: Trong hàm `show(el)` có đoạn mã `setNav(el === exam || el === review)` (`:229`) —— lệnh `show(rest)` sẽ làm nút Next ở thanh điều hướng phía dưới bị vô hiệu hóa (chuyển sang màu xám); trong khi phần Đọc `:420` và phần Nghe `:318` sau khi gọi `show(rest)` đều bổ sung thêm lệnh `setNav(true)` và đặt lại `nextBtn.textContent = "Continue"`, do đó hai môn này nút Continue vẫn hoạt động bình thường; riêng phần Viết không gọi `setNav(true)` (trong toàn bộ mã nguồn chỉ có 2 vị trí gọi lệnh này), mà sử dụng nút `#rest-go` nằm ngay trên màn hình (`:427` → gọi `startModule(next)`, biến trong closure hoạt động bình thường). Vì vậy, dòng mã `:471` nằm trong một nhánh mã không thể chạm tới, **hiện tại không gây sập trang**.  
Bài học kinh nghiệm: Biến chưa được khai báo ≠ nhánh mã có thể chạm tới; khi kết luận một lỗi gây sập hệ thống bắt buộc phải chứng minh được "nhánh mã đó có thể được kích hoạt bởi thao tác của người dùng".

**Loại trừ 1 | Báo cáo trang bảng điểm bị lỗi 404 là báo sai, không cần điều tra lại.**  
Trong giai đoạn rà soát tự động có báo cáo rằng «tên miền app chỉ cho phép các tệp `toefl-{reading,listening,writing,speaking,full}.html`, các tệp `toefl-score.html` và `assets/css/toefl-report.css` không có cấu hình alias → khiến iframe bảng điểm bị 404».  
Kiểm tra thực tế bằng lệnh `curl -k` trên cả hai tên miền đều trả về mã **200**: `app.youyisida.com/toefl-score.html` (7.445 B), `/assets/css/toefl-report.css` (7.044 B), và trên trang web chính `/app/*` cũng trả về 200. Lý do thực tế: Cấu hình Nginx khớp biểu thức `~* \.html$` trỏ vào thư mục app, các tệp CSS được phục vụ dưới dạng tệp tĩnh từ app. Vấn đề này **không tồn tại**, đã được loại bỏ khỏi danh mục lỗi.

**Lưu ý về phương pháp luận**: Các mục từ P-56 đến P-62 đều được rà soát từng dòng bằng grep/curl trước khi đưa vào tài liệu. **Tuy nhiên nếu độ sâu rà soát chưa đủ thì vẫn có thể dẫn đến kết luận nhầm lẫn** —— ví dụ mục P-56 ban đầu chỉ nhìn thấy biến chưa khai báo đã vội kết luận "chắc chắn sập", bỏ qua việc kiểm tra tính khả thi của việc kích hoạt nhánh mã, sau đó bản v1.2 đã tự chứng minh sai và hạ cấp lỗi (xem Đính chính 2). Những mục không vượt qua được bước rà soát hoặc không thể kiểm chứng lại đã bị loại bỏ khỏi danh mục. Riêng mục P-62 được gắn nhãn "chờ kiểm chứng thêm", không xem là kết luận chính thức.

---

## §5 Các bước tiếp theo (Chờ lựa chọn và xác nhận)

Vui lòng phản hồi 3 nội dung sau để đội ngũ có thể bắt tay vào triển khai:
1. Lựa chọn các mã hạng mục cần đi sâu giải quyết (có thể chọn theo cả nhóm, ví dụ: «Toàn bộ nhóm A + toàn bộ nhóm A+ + toàn bộ nhóm C + các mục bảo mật P-46~P-50»). **Nhóm A+ (P-56~P-62) là nhóm được khuyến nghị ưu tiên triển khai đợt hai**: Tất cả đều là lỗi thuộc dạng "mã đã viết sẵn nhưng thiếu nút bấm kết nối" hoặc "cơ chế chưa đồng nhất", chi phí chỉnh sửa thấp, học viên cảm nhận được cải thiện ngay lập tức mà không cần đợi bổ sung dữ liệu nội dung.
2. Trong hai nhóm D và E, hạng mục nào bạn **xác định không làm** (để gạch bỏ hoàn toàn, không nhắc lại nữa); và hạng mục nào cần lên phương án chi tiết.
3. Mục P-55 (Trải nghiệm di động và hiệu năng) có cần tiến hành kiểm thử bổ sung ngay bây giờ hay không —— việc này cần kết nối điện thoại thực tế hoặc cho phép tôi chụp ảnh màn hình qua khung nhìn (viewport) mô phỏng thiết bị di động.

Sau khi chốt các hạng mục được chọn, tôi sẽ bổ sung chi tiết: Phân tích nguyên nhân gốc rễ (file:line) → Phương án kỹ thuật → Khối lượng công việc ước tính → Tiêu chí nghiệm thu, để đóng gói thành lộ trình triển khai theo các đợt W1 / W2 / W3 rõ ràng.
