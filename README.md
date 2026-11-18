# Trung tâm YYSD — Ứng dụng luyện thi IELTS phiên bản tiếng Việt

Bản cập nhật toàn diện nhất từ trước đến nay: **toàn bộ nội dung không phải tiếng Anh đã được chuyển sang tiếng Việt** (4.193 tệp văn bản được rà soát, 3.486 tệp được cập nhật, 0 ký tự Hán còn lại), đồng thời bổ sung một ứng dụng luyện thi IELTS mới, tinh tế và có kiểm chứng tự động.

## Điểm nổi bật

| Yêu cầu | Kết quả |
| --- | --- |
| Chuyển ngữ toàn bộ nội dung | `tools/vietnamize.py` dùng từ điển Hán–Việt CVDICT (122.591 mục, rút gọn còn 37.923 mục cần thiết) cộng 369 thuật ngữ giao diện biên soạn thủ công. Kiểm chứng: `python3 tools/check_vietnamese.py`. |
| Ứng dụng luyện thi IELTS | `docs/` — giao diện hoàn toàn tiếng Việt, bốn kỹ năng Nghe/Đọc/Viết/Nói, 12 câu hỏi có giải thích chi tiết. |
| Tính năng tương tự Duolingo | Chuỗi ngày, XP, mục tiêu ngày, năm năng lượng, 10 giải đấu, bảng xếp hạng, chuỗi bạn bè, 8 huy hiệu, cấp độ, thang điểm CEFR/IELTS, ôn tập ngắt quãng 1→120 ngày, lộ trình 8 đơn vị, linh vật Cú Luyện. |
| Tài liệu PDF học thuật | 10 tệp PDF tiếng Việt, **287 lượt trích dẫn** tới `scholar.google.com` từ 110 công trình. Kiểm chứng: `python3 tools/check_pdfs.py`. |
| GitHub Pages | `.github/workflows/pages.yml` đóng gói `docs/` bằng `actions/deploy-pages`. |
| Lighthouse 100/100 | `.lighthouserc.json` ép điểm tối đa ở cả bốn hạng mục; `.github/workflows/lighthouse.yml`. |
| Code coverage 100% | Vitest + coverage-v8, ngưỡng 100 cho statements / branches / functions / lines. |
| Super-Linter | `.github/workflows/super-linter.yml`: chạy trên mỗi push, mỗi PR và 6 giờ một lần theo lịch. |

## Chạy cục bộ

```bash
npm ci
npm run verify          # coverage 100% + lint + kiểm tra tiếng Việt + kiểm tra trích dẫn
python3 -m http.server 8080 --directory docs
# mở http://localhost:8080
```

Để sinh lại tài liệu PDF (cần `reportlab` và phông DejaVu):

```bash
python3 -m pip install reportlab
python3 tools/build_pdfs.py
```

Để chạy lại bộ Việt hóa trên nội dung mới:

```bash
python3 tools/vietnamize.py
```

## Cấu trúc mới

```
docs/                     Trang GitHub Pages (index.html, css/, js/, tai-lieu/, nghien-cuu/)
tests/                    Bộ kiểm thư Vitest (state, storage, render, app)
tools/                    Việt hóa, sinh PDF, kiểm chứng
tools/data/               Từ điển và bản kê trích dẫn (khoá được mã hoá \uXXXX)
.github/workflows/        Pages, CI, Super-Linter, Lighthouse
```

`docs/js/` vừa là mã nguồn vừa là mã được trang web nạp trực tiếp, nên con số coverage phản ánh đúng sản phẩm đã triển khai.

## Nghiên cứu

Xem [báo cáo nghiên cứu tiếng Việt](docs/nghien-cuu/duolingo-va-ielts.html): chuyển ngữ và phân tích tài liệu tham khảo về mô hình gamification, kèm bảng đối chiếu tính năng.

## Giấy phép dữ liệu ngôn ngữ

`tools/data/zh_vi.json` được dẫn xuất từ [CVDICT](https://github.com/ph0ngp/CVDICT) của Phong Phan, phát hành theo Creative Commons Attribution-ShareAlike 4.0. Chúng tôi ghi nhận tác giả và giữ nguyên điều khoản chia sẻ tương tự cho dữ liệu dẫn xuất.

## Địa chỉ triển khai và tên miền

Workflow `.github/workflows/pages.yml` triển khai thư mục `docs/` lên GitHub Pages tại
`https://johnlikescarrot.github.io/yysd-testcenter/` (nguồn: GitHub Actions).
Tệp `CNAME` ở gốc kho chứa `youyisida.com` — đó là tên miền của hệ thống sản phẩm cũ,
không phải tên miền của bản triển khai này. Vì vậy `canonical`, `robots.txt` và
`sitemap.xml` trong `docs/` đều dùng địa chỉ `johnlikescarrot.github.io` để tránh
trỏ nhầm sang site cũ.
