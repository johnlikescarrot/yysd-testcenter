# Cơ sở nghiên cứu và phạm vi

## Cách chọn nguồn

Cẩm nang mới ưu tiên tài liệu chính thức về cấu trúc IELTS và các nghiên cứu có DOI liên quan đến truy hồi, học giãn cách, từ vựng ngôn ngữ thứ hai và trò chơi hóa. Thông tin thư mục được đối chiếu với trang nhà xuất bản, tạp chí hoặc kho học thuật. Google Scholar là công cụ tra cứu, không phải nhà xuất bản hay chứng nhận chất lượng; mỗi liên kết Scholar trong PDF là **truy vấn theo tiêu đề**, không phải tuyên bố rằng kết quả Scholar đã được kiểm chứng trực tiếp.

- IELTS.org: [Academic Reading](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-reading), [Academic Writing](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-writing), [IELTS Online](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-online) và [cách tính điểm](https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail).
- Dunlosky và cộng sự (2013), tổng quan về thực hành kiểm tra và học giãn cách: [DOI](https://doi.org/10.1177/1529100612453266).
- Kim và Webb (2022), tổng hợp nghiên cứu học giãn cách ngôn ngữ thứ hai: [DOI](https://doi.org/10.1111/lang.12479).
- Latimier và cộng sự (2021), phân tích tổng hợp về truy hồi giãn cách: [DOI](https://doi.org/10.1007/s10648-020-09572-8).
- Shortt và cộng sự (2023), tổng quan nghiên cứu Duolingo: [DOI](https://doi.org/10.1080/09588221.2021.1933540).
- Vandergrift và Tafaghodtari (2010), nghiên cứu về hướng dẫn nghe ở người học tiếng Pháp L2: [DOI](https://doi.org/10.1111/j.1467-9922.2009.00559.x); Jeon và Yamashita (2014), tổng hợp các tương quan với đọc hiểu L2: [DOI](https://doi.org/10.1111/lang.12034).
- Kang và Han (2015), tổng hợp về phản hồi sửa lỗi viết L2: [DOI](https://doi.org/10.1111/modl.12189); Graham và Perin (2007), tổng hợp dạy viết cho thanh thiếu niên: [DOI](https://doi.org/10.1037/0022-0663.99.3.445).
- Lee, Jang và Plonsky (2015), tổng hợp về dạy phát âm L2: [DOI](https://doi.org/10.1093/applin/amu040); Lyster và Saito (2010), tổng hợp về phản hồi nói trong lớp: [DOI](https://doi.org/10.1017/S0272263109990520).

PDF có 20 tài liệu nghiên cứu và các liên kết DOI/Scholar tương ứng. Không chèn trích dẫn tùy tiện vào các PDF đề thi, đề gốc hoặc tài liệu của bên thứ ba.

## Giới hạn diễn giải

Không nghiên cứu nào ở đây chứng minh lịch ôn cố định là tối ưu cho mọi người hoặc chứng minh lộ trình YYSD làm tăng band IELTS. Các khoảng 1, 3, 7, 14 và 30 ngày chỉ là lựa chọn thiết kế có thể điều chỉnh sau khi có đánh giá thực nghiệm. Khi làm lại sớm và trả lời đúng, lịch đến hạn hiện có không bị đẩy lùi. Chuỗi ngày và điểm XP chỉ thể hiện hoạt động, không đo trình độ; không dùng áp lực mất chuỗi để thúc ép học viên.

Bài nghe dùng giọng đọc do thiết bị tạo; trình duyệt không có giọng đọc vẫn xem được bản chép lời. Bài đọc ngắn, câu ngữ pháp và câu hỏi lựa chọn không thay thế đề thi đầy đủ, bài viết dài, luyện nói với người thật hoặc phản hồi của giáo viên.

## Phạm vi kỹ thuật

Bản Pages chứa trang chủ, trình bài học mới, cẩm nang và một bài đọc mẫu tám câu có sẵn đã được Việt hóa giao diện; bài mẫu tự chấm riêng và không quy đổi band. API và phần còn lại của kho cũ không được triển khai kèm; các giao diện cũ vẫn còn tiếng Trung. Kiểm thử đo 100% dòng, nhánh và hàm cho `ielts-vi-core.mjs` và `ielts-vi-data.mjs` bằng Node, cùng `ielts-vi-home.mjs` và `ielts-vi-lesson.mjs` bằng Chromium V8/Istanbul. Các con số này không bao gồm bộ chấm trong bài đọc mẫu, tập lệnh xây dựng, Python hay mã cũ. Bộ kiểm thử trình duyệt đi qua năm bài, bài đọc mẫu, ôn tập, xử lý lỗi lưu trữ và các kích thước màn hình. Lighthouse đo riêng năm trang/trạng thái trong bản dựng tĩnh; kết quả không bảo đảm cho mọi thiết bị, trạng thái hoặc trang cũ.
