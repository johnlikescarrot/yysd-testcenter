# Trung tâm YYSD

trang web chính thức + Ngân hàng đề + Dành cho giáo viên + máy móc đánh app + màn hình máy tính cuối thiết kế chăm sóc @YYSD-DESIGN-RULES.md gốc máy móc bố trí chăm sóc @AGENTS.local.md 

## này là gì?

- trang web chính thức / Hub: rễ mục lục `index.html`, `assets/`, `library/`
- viết tắt của Tân Cương TOEFL máy móc đánh: `app/`(HIT Sets tại `app/library/toefl/`)
- trang web ngày tháng cuộn lại: `library/toefl/`(đừng! cầm HIT set JSON mất tiến lên biến thể của |)
- backend: `server/server.js`(Node, nhiều người thuê, chỗ ngồi, Sách từ vựng, Ngân hàng đề)
- màn hình máy tính cuối: `desktop/`(Electron)
- nộp đơn xin con trai trạm: `admission/`(Next.js)
- ngân hàng câu hỏi đầu: `tiku/`

trang chủ khu vực được phân bổ: Khu vực từ vựng → Khu vực luyện tập → Khu vực đề thi chia sẻ phân loại tồn tại `assets/js/config.js` 

## thiết kế(từ đầu đến cuối tuân thủ)

nội dung giống biến thể của |, biến thể của | giống thủy tinh, lẫn nhau giống vật lý; phòng thi giữ chính phủ công cụ cảm thấy 

- nội dung: ngà voi biến thể của | `#f6f3ec` / `#fffcf7`
- biến thể của |: mờ mờ + `blur(20px) saturate(180%)`, token `--chrome-bg` / `--chrome-blur`
- phòng thi / CDT: tính hữu dụng, đáng tin cậy, ít trang trí - **đừng! quả táo biến thể của**
- Token: `assets/css/style.css` `:root`
- bề mặt công tắc điện: `YYSD_SURFACE` → `assets/js/ui.js`
- tên thương hiệu xác nhận: `YYSD_CONFIRM` / `YYSD_ALERT` / `YYSD_ASK`, không cần hệ thống `confirm`/`alert`(CDT ngoại lệ)
- tự kiềm chế: `node scripts/check_surface.js` · `node scripts/check_apple_shell.js`

viết tắt của Tân Cương UI trước hỏi: này là nội dung, biến thể của |, vẫn phòng thi? đừng! làm thứ hai che đậy phát sóng thiết bị có thể thứ hai che đậy thị giác hệ thống 

## ngân hàng câu hỏi cứng quy tắc(tóm tắt)

hoàn chỉnh quy tắc tồn tại `.qoder/rules/toefl-papers.md` và `toefl-listening.md` 

- Writing sentence `bank` không được biến thể của | `answer` giống thứ tự sử dụng `scripts/toefl_sent.py` đồng ý ngầm hạn chế ra vào chứa `bank-*-*.json` 
- Bank chips cấm Titlecase(`Do`/`Have` rò rỉ đi ra đầu biến thể cũ của |) viết tay writing: một PNG một chủ đề, màu xanh lá dải chỉ kiểm tra 
- Complete the Words = mỗi dùng trong | sự thiếu chữ cái một dùng trong | trống không học thuật biến thể của | chủ đề biến thể cũ của | phải trích dẫn nguyên văn từ 
- hằng ngày thư từ/Thông báo/thời gian biểu của trường phải có ngắt dòng có thể cấu trúc biến thể của layout 
- Listen and Repeat: một dòng thơ một âm thanh → 3 giây nghĩ → beep → 8 giây khắc gỗ trả lời Trung Quốc không hiển thị `sample` 
- thính giác kết hợp sơ đồ sử dụng trang trọng dự thi của trắng nền tảng người biến thể của, theo lẽ thường phương ngữ dân số âm thanh kết hợp người nói chuyện hai người nói chuyện với ai đó; cười biến thể của chọn phản hồi một mình(luôn luôn thành thạo máy móc); thông báo biến thể cũ của một khóa bài giảng mỗi một mình đứng sơ đồ biến thể của | đừng! cảnh, đừng! chữ viết giống hệt người đi rồi quay lại sử dụng giống hệt mở ra con đường `library/toefl/img/listen/`, viết đi vào `task.image` 
- đi qua ngưỡng cửa chịu đựng: `node scripts/check_toefl_paper.js` chỉ đừng! lên mạng 
- đừng! `rsync --delete` trang web chính thức 

## đừng! làm

- thứ hai che đậy đọc / Nghe hiểu / Nói / viết động cơ
- tất cả trạm dùng trong | spring hoạt hình nhà kho
- CDT nút bấm Canada bounce có thể kính mờ
- cầm khóa viết tiến lên kho hàng
