# Ngân hàng Đề thi Thật A-Level

Ba hội đồng thi quốc tế chính: **CAIE** · **Edexcel A Level** · **Oxford AQA A Level**

Cấu trúc thư mục:

```
library/mock/alevel/
  caie/9709-mathematics/papers/
  edexcel/9ma0-mathematics/papers/
  oxford-aqa/7367-mathematics/papers/
```

Quy tắc đặt tên tệp PDF: `{code}_{season}{yy}_{qp|ms}_{paper}.pdf`

- Ví dụ CAIE: `9709_s24_qp_12.pdf`
- Ví dụ Edexcel: `9MA0_s24_qp_01.pdf`
- Ví dụ Oxford AQA: `7367_w23_ms_02.pdf`

```bash
python3 scripts/seed_alevel_demo.py     # Tùy chọn tạo dữ liệu thi thử demo
python3 scripts/build_alevel_catalog.py # Cập nhật danh mục catalog
```

Danh sách môn học chi tiết xem tại `scripts/alevel_subjects.py`.
