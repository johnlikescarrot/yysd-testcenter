# Kho đề A-Level

Ba hội đồng thi: **CAIE** · **Edexcel A Level** · **Oxford AQA A Level**

Cấu trúc thư mục:

```
library/mock/alevel/
  caie/9709-mathematics/papers/
  edexcel/9ma0-mathematics/papers/
  oxford-aqa/7367-mathematics/papers/
```

Đặt tên PDF: `{code}_{season}{yy}_{qp|ms}_{paper}.pdf`

- CAIE ví dụ: `9709_s24_qp_12.pdf`
- Edexcel ví dụ: `9MA0_s24_qp_01.pdf`
- Oxford AQA ví dụ: `7367_w23_ms_02.pdf`

```bash
python3 scripts/seed_alevel_demo.py      # tùy chọn: tạo đề minh họa
python3 scripts/build_alevel_catalog.py  # cập nhật danh mục
```

Danh sách môn ở `scripts/alevel_subjects.py`.

Trong trình xem đề, liên kết **Phiếu chữa bài** mở [sổ tay tiếng Việt](../../../ielts-vi/resources/tu-de-den-loi-giai.html) có trích dẫn nghiên cứu. Đây là tài liệu đi kèm, không thay đổi đề hoặc hướng dẫn chấm của hội đồng thi.
