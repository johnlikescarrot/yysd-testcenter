# YYSD · Trung tâm luyện tập IELTS

YYSD là kho học tập và luyện thi có sẵn từ trước, gồm giao diện tĩnh, thư viện bài tập, ứng dụng máy tính và một API Node. Trang chủ mới cung cấp một lộ trình IELTS bằng tiếng Việt, hoạt động độc lập và không yêu cầu tài khoản.

## Lộ trình tiếng Việt

- Năm bài luyện ngắn: từ vựng, đọc hiểu, viết, nghe từ/số và gợi ý luyện nói. Câu hỏi tiếng Anh được giữ nguyên; hướng dẫn và giải thích bằng tiếng Việt.
- Một bài đọc mẫu tám câu đã có trong kho được Việt hóa giao diện và lời giải. Bài này dùng cơ chế chấm riêng hiện có, không tính XP, không tạo lịch ôn và không quy đổi điểm sang band IELTS; 20 phút chỉ là thời gian gợi ý, không có đồng hồ đếm ngược.
- Phản hồi sau từng câu, điểm kinh nghiệm, chuỗi ngày học, lịch sử bảy ngày và danh sách câu đến hạn ôn tập cho năm bài ngắn. Lịch ôn là gợi ý, không phải đánh giá năng lực hoặc dự đoán điểm IELTS.
- Tiến độ chỉ được lưu trong `localStorage` trên thiết bị. Xóa dữ liệu trình duyệt hoặc chuyển thiết bị sẽ không tự đồng bộ; có nút xóa tiến độ trong phần chân trang.
- Bài nghe sử dụng giọng đọc của trình duyệt/thiết bị, có bản chép lời dự phòng. Đây không phải bản ghi IELTS chính thức.
- [Cẩm nang IELTS bằng tiếng Việt](docs/ielts/cam-nang-ielts.pdf) có nguồn chính thức và 20 tài liệu nghiên cứu với DOI cùng liên kết tìm theo tiêu đề trên Google Scholar. [Ghi chú nghiên cứu và phạm vi](docs/ielts/nghien-cuu.md) giải thích giới hạn của các nguồn này.

Các bài học mới là bài tập bổ trợ do YYSD biên soạn, không phải đề thi chính thức. YYSD không liên kết chính thức với IELTS hoặc Duolingo.

## Những gì chưa được chuyển ngữ

Kho cũ có hơn 12.000 tệp, bao gồm khoảng 1.844 PDF và nhiều nội dung tiếng Trung. Các trang, đề, dữ liệu và tài liệu PDF gốc **chưa được dịch toàn bộ**; chúng được giữ nguyên để tránh làm sai đề hoặc thay đổi tài liệu của bên thứ ba. Trang chủ cũ được lưu tại `legacy-home.html`; trang chủ mới liên kết đến trang YYSD gốc và nêu rõ giới hạn ngôn ngữ. Các chức năng cũ dựa vào API vẫn cần máy chủ riêng.

## Chạy và kiểm thử

Cần Node.js 22.19 trở lên cho bộ kiểm thử mới. Không cần cài Node để phục vụ các tệp tĩnh trong môi trường phát triển.

```bash
npm ci
python3 -m pip install -r docs/ielts/requirements-pdf.txt
npm run lint:js                 # ESLint cho mô-đun .mjs và JavaScript trong bài đọc mẫu
npm run test:coverage           # ngưỡng 100% cho lõi tiến độ và dữ liệu bài mới
npm run test:browser:coverage   # kiểm thử trình duyệt; ngưỡng 100% cho hai mô-đun giao diện mới
python3 -m unittest discover -s tests -p 'test_*.py'
npm run audit                   # Lighthouse di động cho năm trang/trạng thái được liệt kê bên dưới
npm run build:pages             # tạo bản tĩnh trong pages-dist/
python3 -m http.server 8080 --bind 0.0.0.0
```

Kiểm thử trình duyệt dùng Chromium được cài qua npm; trên Linux có thể cần các thư viện hệ thống tương thích. Độ bao phủ được đo bằng Node cho `ielts-vi-core.mjs`, `ielts-vi-data.mjs` và bằng Chromium V8/Istanbul cho `ielts-vi-home.mjs`, `ielts-vi-lesson.mjs`. Ngưỡng 100% dòng, nhánh và hàm chỉ áp dụng cho **bốn mô-đun đó**, không bao gồm bộ chấm trong bài đọc mẫu, tập lệnh xây dựng, Python hay mã cũ. Báo cáo nằm trong `coverage/` và `.lighthouse/`, không được đưa vào Git.

Lighthouse đo di động trên trang chủ, bài từ vựng, bài nghe, trạng thái ôn tập trống và bài đọc mẫu; các lần đo này đạt 100 ở bốn hạng mục trong môi trường kiểm thử gần nhất. Kết quả có thể thay đổi theo môi trường, thiết bị và trạng thái khác.

Để tạo lại PDF cần Python, `reportlab` và phông DejaVu Sans tại `/usr/share/fonts/truetype/dejavu/`; `pypdf` được dùng để kiểm tra các liên kết trong PDF:

```bash
python3 -m pip install -r docs/ielts/requirements-pdf.txt
python3 scripts/build_ielts_guide.py
```

## GitHub Pages

Workflow `.github/workflows/ielts-vi.yml` kiểm thử và đóng gói riêng giao diện tiếng Việt cùng bài đọc mẫu nói trên. GitHub Pages chỉ phục vụ tệp tĩnh: API đăng nhập, AI, đồng bộ điểm, ứng dụng Next.js và phần còn lại của kho đề/audio cũ không nằm trong bản xuất này. Kho nguồn gần 5 GB vượt giới hạn 1 GB của một trang Pages; workflow vì vậy **không** xuất toàn bộ kho. Các đường dẫn của bản mới là tương đối, hoạt động cả ở `/` và dưới đường dẫn tên kho.

Để xuất bản, bật **Settings → Pages → Build and deployment → GitHub Actions**. Workflow chạy trên nhánh làm việc hiện tại và `main`; PR chỉ kiểm thử, không tự triển khai hoặc hợp nhất. Tệp `CNAME` của hệ thống cũ không được đưa vào bản xuất, để không tự thay đổi tên miền hiện có.

Super-Linter được cấu hình chạy trên mỗi lần đẩy thay đổi/PR đối với các tệp được chọn của lộ trình và danh mục; kho cũ chưa được tuyên bố là đã qua lint. Phiên bản Super-Linter v9 không tự nhận diện `.mjs`, vì vậy CI chạy ESLint riêng cho những mô-đun đó và JavaScript trong bài đọc mẫu. Xem kết quả từng lần chạy trong GitHub Actions.

Sau khi chỉnh nội dung trong `library/`, chạy `python3 scripts/build_manifest.py` và đưa danh mục được tạo lại vào cùng thay đổi nguồn. Trình tạo giữ ngày thêm cũ cho các mục đã biết và không thay timestamp khi nội dung không đổi. GitHub không kích hoạt workflow mới từ commit do `GITHUB_TOKEN` tạo, nên đưa danh mục vào commit nguồn giúp kiểm thử và lint chạy trên đúng phiên bản.

## Cấu trúc kho cũ

- `assets/`, các tệp HTML gốc: giao diện web và các trình luyện tập hiện có.
- `library/`: kho đề và từ vựng; `library/manifest.json` được tạo bằng tập lệnh của dự án.
- `server/`: API Node, SQLite, đăng nhập và các tính năng cần máy chủ; cấu hình mẫu ở `server/.env.example`.
- `app/`, `desktop/`, `desktop-tiku/`: các ứng dụng và dữ liệu liên quan.
- `admission/`, `rankings/`: các ứng dụng Next.js tùy chọn.

Không đưa khóa bí mật vào kho. Hướng dẫn thiết kế và quy tắc nội dung cũ vẫn ở `AGENTS.md` và `YYSD-DESIGN-RULES.md`.
