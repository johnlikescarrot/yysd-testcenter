# IELTS Mỗi Ngày

Bản IELTS Học thuật tiếng Việt của YYSD. Bản phát hành tĩnh gồm 12 bài luyện ngắn (36 hoạt động) theo ba chặng. Điều hướng, hướng dẫn, lời giải và tài liệu đều bằng tiếng Việt; đề bài, lời thoại, lựa chọn và bài mẫu giữ nguyên tiếng Anh để luyện thi. Văn bản tiếng Anh trong tài liệu được gắn `lang="en"`.

## Cách học

- Hoàn thành một bài để mở bài kế tiếp và nhận 20 XP (mỗi bài, mỗi ngày một lần). Chọn mục tiêu 20, 40 hoặc 60 XP. Chuỗi học tính theo ngày của thiết bị; ngày hôm nay chưa có XP sẽ không làm mất chuỗi của hôm qua.
- Trả lời câu khách quan rồi xem lời giải. Câu sai đến hạn ngay; câu đúng được ôn sau 1, 3, 7, 14 hoặc 30 ngày. Mỗi lượt ôn có tối đa sáu câu; mỗi câu đúng thưởng 5 XP một lần trong ngày. Đây là lịch thực hành, không phải công thức dự đoán điểm thi.
- Ba đoạn nghe là bài gốc có giọng tổng hợp tiếng Anh (eSpeak NG) và lời thoại để đối chiếu. Bài Viết và Nói cho mẫu và gợi ý tự kiểm; không chấm điểm thi, không thu âm và không tải bài lên máy chủ.
- Tất cả tiến độ lưu trong trình duyệt hiện tại. Không cần đăng ký. Giao diện báo nếu lưu trữ bị chặn. Mục **Tiến độ** cho phép xóa sau khi xác nhận.

## Tài liệu và nguồn

`tai-lieu.html` là bản HTML dùng được với trình đọc màn hình và là nguồn duy nhất của hai PDF. Cẩm nang có 6 công trình nghiên cứu và 2 nguồn IELTS chính thức; sổ tay có 7 công trình nghiên cứu. Có một công trình chung giữa hai PDF. Mỗi công trình có DOI và liên kết truy vấn Google Scholar; Google Scholar là chỉ mục tra cứu, không phải nhà xuất bản. Các công trình không xác thực điểm thi có thể đạt được từ ứng dụng.

Tham khảo [phương pháp của Duolingo](https://blog.duolingo.com/duolingo-teaching-method/) cho lộ trình, phiên học ngắn và động lực học. Bản YYSD không dùng nhân vật, nhãn hiệu giao diện, dữ liệu người dùng hay cơ chế cạnh tranh trực tuyến của Duolingo.

## Chạy và kiểm tra

Cần Node.js 22.22.3 trở lên và Linux x64 có thư viện Chromium (`libnss3`, `libnspr4`); có thể đặt `CHROME_PATH` để dùng Chrome cài sẵn.

```sh
cd ielts-vi
npm ci --ignore-scripts
npm run build
npm run preview
npm test
npm run audit
```

- `npm test` gộp độ bao phủ V8 từ kiểm thử Node và tương tác trong Chromium thật. Ngưỡng 100% cho dòng, câu lệnh, hàm và nhánh của **toàn bộ JavaScript được phát hành trong bản IELTS tiếng Việt**. Không đo mã máy chủ, TOEFL, A-Level hay hệ thống cũ.
- `npm run audit` yêu cầu 100 điểm cho Hiệu năng, Khả năng tiếp cận, Phương pháp hay nhất và SEO trên Lộ trình, Ôn tập, Tiến độ và Tài liệu; chạy cả cấu hình điện thoại và máy tính. Báo cáo nằm trong `audit-results/`. Điểm là kết quả đo trong môi trường cụ thể, không bảo đảm mọi thiết bị/mạng đều giống nhau. Có thể kiểm tra bản trực tuyến với `AUDIT_URL=https://johnlikescarrot.github.io/yysd-testcenter/ npm run audit` sau triển khai.
- Sau khi sửa tài liệu, chạy `npm run pdf`. Sau khi sửa lời thoại, chạy `python qa/audio.py` với `espeakng-loader==0.2.4` và `lameenc==1.9.0`. Để kiểm tra PDF: `python -m pip install pypdf==6.9.2` rồi `python qa/check_pdf.py`. Chỉ PDF và MP3 dùng trong app được lưu để các URL tải xuống hoạt động cả ở kho tĩnh hiện tại.

## GitHub Pages

Tại **Settings → Pages → Build and deployment**, chọn nguồn **GitHub Actions**. Để triển khai từ PR mà không hợp nhất, cấu hình môi trường `github-pages` cho phép nhánh `arena/0aac58c1-yysd-testcenter` bên cạnh `main`, rồi chạy lại workflow **IELTS tiếng Việt · chất lượng và Pages** của lần đẩy nhánh. Sau khi nhánh được hợp nhất về sau, có thể bỏ quyền triển khai của nhánh PR.

Workflow chạy Super-Linter, kiểm thử và Lighthouse khi đẩy bản phát hành, mở/cập nhật PR, chạy thủ công và theo lịch hằng tuần trên nhánh mặc định sau khi hợp nhất. Mỗi lần xuất bản chỉ tải danh sách tệp cho phép trong `dist/`. Không xuất bản `server/`, kho đề cũ, CNAME của website cũ, mã kiểm thử hoặc các gói Node. Không cần thay đổi DNS. Dự kiến dùng địa chỉ dự án `https://johnlikescarrot.github.io/yysd-testcenter/` sau khi Pages được bật.

Ứng dụng gốc và các kho khoá học khác vẫn giữ nguyên ngoài phạm vi phát hành này. Bản tĩnh không thay thế đăng nhập, bài thi đầy đủ, báo cáo chính thức hoặc dịch vụ giáo viên trên hệ thống cũ.
